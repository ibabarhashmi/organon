/**
 * ORGΛNON — Generate → Validate → Learn loop · src/loop/loop.ts   (NEW subsystem, additive — Rule VII)
 * ============================================================================================================
 * Wired from ORGNON_GVL_Loop_Boilerplate_v2.ts against the REAL engine (funding_discriminate.py + a real
 * data/funding/real-verdict.json). Every assumption here was verified in COMPREHENSION-GVL.md (Phase 0).
 *
 * THE ONE INVARIANT — a compile error, not a rule (Rule XXI):
 *   exploreLoop() runs on a DiscoverySlice and can ONLY return DiscoveryVerdict, which has NO 'GO'.
 *   The ONLY GO producer is confirm(), which REQUIRES a HeldOutSlice the loop is never handed inside exploreLoop.
 *   => TYPE-IMPOSSIBLE to bless on data the loop trained on. Proven at compile time in src/loop/wall.probe.ts.
 *
 * SESSION WIN CONDITION (Rule XXIII — NOT "found a GO"):
 *   a leak-free loop that runs N turns, learns from each rejection, writes reloadable skill files, and confirms
 *   ONLY on held-out. A working loop that has NOT found a blessable strategy IS success.
 *
 * REUSE, NEVER REBUILD (Rule VII): the discriminator/effective-N/rigor Python stays byte-identical; §4 wraps the
 * SAME entry point scripts/funding-verdict.ts uses. This file edits no frozen code.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { FundingPanel } from "../funding/panel"
import { FundingFactors } from "../funding/factors"

// ───────────────────────────────────────────────────────────────────────────
// §1 — THE REAL VERDICT SHAPE (mirrors funding_discriminate.discriminate() output; do NOT invent fields)
// ───────────────────────────────────────────────────────────────────────────

export interface RawVerdict {
  readonly verdict: "GO" | "NO-GO" | "INSUFFICIENT-EVIDENCE"
  readonly tier: string
  readonly downgradedBy: string | null // "effective periods 60 < derived floor 207 (Rule XII power floor)"
  readonly deflatedOosTstat: number | null // OOS residual-IC t-stat, Newey–West-deflated
  readonly oosResidualIcMean: number | null
  readonly oosPortfolioTstat: number | null
  readonly rawIcTstat: number | null // RAW carry significance — NEVER a GO (Rule XIII)
  readonly nwLags: number // = measured decorrelation time
  readonly robust?: "GO" | "NO-GO" | "INSUFFICIENT-EVIDENCE" // robust_discriminate (omitted-variable)
  readonly robustDowngradedBy?: string | null
  readonly deflation?: {
    readonly effectiveNserial: number
    readonly effectiveBreadth?: number
    readonly powerFloor: { readonly effectivePeriodsNeeded: number; readonly targetIC?: number }
  } | null
  /** Populated for cross-venue universes (from funding_crossvenue). */
  readonly crossVenue?: {
    readonly rawBasisIsCarry: boolean
    readonly separability: { readonly shortToLongDecays: boolean }
    readonly horizons: { readonly horizon: string; readonly meanIC: number; readonly deflatedT: number }[]
  }
  /** Populated when the delta-neutral cost model ran (from funding_accrual). */
  readonly hedgeCost?: { readonly netCarry: number; readonly grossCarry: number; readonly netLeqGross: boolean }
}

/** A strategy the loop proposes. Domain-agnostic. */
export interface Candidate {
  readonly id: string
  readonly domain: "funding" | "lending" | "rwa"
  readonly factors: string[] // factors under consideration
  readonly horizon: string // "1h" | "8h" | "1d" | "3d" | "7d"
  readonly neutralizations: string[] // -> which factor columns are INCLUDED in `loadings`
  readonly universe: string // "hl_cross_asset" | "hl_binance_cross_venue"
}

/** The structured reasons — DERIVED from RawVerdict (§1b); the engine does not emit these. */
export type RejectionReason =
  | { kind: "beta"; rawIcTstat: number }
  | { kind: "persistence"; horizons: string[] }
  | { kind: "below_power_floor"; effN: number; floor: number; effBreadth?: number }
  | { kind: "cost_negative"; netCarry: number }
  | { kind: "unmodeled_risk"; note: string }

/** A verdict from DISCOVERY data. NO 'GO'. On purpose (Rule XXI). */
export type DiscoveryVerdict =
  | { status: "REJECTED"; reasons: RejectionReason[]; raw: RawVerdict }
  | { status: "PROVISIONAL"; discoverySignal: number; reasons: RejectionReason[]; raw: RawVerdict }

/** A verdict from confirm() on HELD-OUT data. The ONLY type that can carry GO. */
export type ConfirmedVerdict =
  | { status: "GO"; heldOutSignal: number; effN: number; floor: number; raw: RawVerdict }
  | { status: "NO-GO"; reasons: RejectionReason[]; raw: RawVerdict }
  | { status: "INSUFFICIENT-EVIDENCE"; effN: number; floor: number; raw: RawVerdict }

export interface Lesson {
  readonly fromReason: RejectionReason["kind"]
  // NOTE (Rationalisation P0/P2, Rule XXIV): the `require_neutralization` op was CUT — its only producer was the no-op
  // beta lesson (beta is structural; neutralizing a factor cannot add residual edge where none survives). Cutting the
  // dead op is the rationalisation, not retaining it "just in case".
  readonly constraint:
    | { op: "min_horizon"; value: string }
    | { op: "require_net_positive"; value: true }
    | { op: "add_factor"; value: string }
  readonly evidence: string
}

// ───────────────────────────────────────────────────────────────────────────
// §1b — deriveReasons(): the taxonomy computed FROM the real verdict. The lossy-mapping guard lives here.
// ───────────────────────────────────────────────────────────────────────────

export function deriveReasons(v: RawVerdict): RejectionReason[] {
  const reasons: RejectionReason[] = []
  // beta (Rule XIII — CORRECTED, Rationalisation P0 / Rule XXVI): the signal IS raw carry/basis with NO surviving
  // neutralized residual edge. Fire on the cross-venue raw basis being carry, OR raw carry significant while the
  // DEFLATED residual FAILS the edge gate (|t| < T_GATE=3). The old `|rawIcTstat| > deflatedOosTstat` was a BUG:
  // neutralization can only REDUCE significance, so it fired on EVERY candidate — a spurious always-true disqualifier,
  // not Rule XIII. A residual that survives the gate (funding: deflated t≈74) is NOT beta; it is withheld by the floor.
  const T_GATE = 3
  const rawCarryNoResidual =
    v.rawIcTstat != null && Math.abs(v.rawIcTstat) > T_GATE && Math.abs(v.deflatedOosTstat ?? 0) < T_GATE
  if (v.crossVenue?.rawBasisIsCarry || rawCarryNoResidual) {
    reasons.push({ kind: "beta", rawIcTstat: v.rawIcTstat ?? NaN })
  }
  // persistence (C3): short-horizon IC that decays at longer horizons (derived, cross-venue only).
  if (v.crossVenue?.separability.shortToLongDecays) {
    reasons.push({ kind: "persistence", horizons: v.crossVenue.horizons.map((h) => h.horizon) })
  }
  // below_power_floor (Rule XII): the real downgrade path.
  if (v.verdict === "INSUFFICIENT-EVIDENCE" && v.deflation) {
    reasons.push({
      kind: "below_power_floor",
      effN: v.deflation.effectiveNserial,
      floor: v.deflation.powerFloor.effectivePeriodsNeeded,
      effBreadth: v.deflation.effectiveBreadth,
    })
  }
  // cost_negative: net carry non-positive after the delta-neutral hedge.
  if (v.hedgeCost && v.hedgeCost.netCarry <= 0) {
    reasons.push({ kind: "cost_negative", netCarry: v.hedgeCost.netCarry })
  }
  // unmodeled_risk: a GO knocked down by the omitted-variable robustness check.
  if (v.robustDowngradedBy) {
    reasons.push({ kind: "unmodeled_risk", note: v.robustDowngradedBy })
  }
  return reasons
}

/** Map a DISCOVERY RawVerdict to a DiscoveryVerdict (never GO — by type). */
export function toDiscoveryVerdict(v: RawVerdict): DiscoveryVerdict {
  const reasons = deriveReasons(v)
  // below_power_floor DISQUALIFIES (Rationalisation P0): an underpowered result is not a confirmable hypothesis — the
  // power floor already discounted its autocorrelation-inflated significance, so counting it PROVISIONAL double-counts
  // (the bug adjacent to the beta bug). PROVISIONAL requires a powered, surviving residual.
  const disqualified = reasons.some(
    (r) => r.kind === "beta" || r.kind === "persistence" || r.kind === "unmodeled_risk" || r.kind === "below_power_floor",
  )
  // PROVISIONAL only if the engine ITSELF blessed the discovery slice (verdict GO) and nothing disqualifies it. A
  // below-floor INSUFFICIENT is NOT "engine would go".
  const engineWouldGo = v.verdict === "GO"
  if (engineWouldGo && !disqualified && v.deflatedOosTstat != null) {
    return { status: "PROVISIONAL", discoverySignal: v.deflatedOosTstat, reasons, raw: v }
  }
  return { status: "REJECTED", reasons, raw: v }
}

/** Map a HELD-OUT RawVerdict to a ConfirmedVerdict (the ONLY place GO can appear). */
export function toConfirmedVerdict(v: RawVerdict): ConfirmedVerdict {
  if (v.verdict === "GO" && (v.robust ?? "GO") === "GO") {
    return {
      status: "GO",
      heldOutSignal: v.deflatedOosTstat ?? NaN,
      effN: v.deflation?.effectiveNserial ?? NaN,
      floor: v.deflation?.powerFloor.effectivePeriodsNeeded ?? NaN,
      raw: v,
    }
  }
  if (v.verdict === "INSUFFICIENT-EVIDENCE") {
    return {
      status: "INSUFFICIENT-EVIDENCE",
      effN: v.deflation?.effectiveNserial ?? NaN,
      floor: v.deflation?.powerFloor.effectivePeriodsNeeded ?? NaN,
      raw: v,
    }
  }
  return { status: "NO-GO", reasons: deriveReasons(v), raw: v }
}

// ───────────────────────────────────────────────────────────────────────────
// §2 — THE WALL: branded slices; one constructor each. The loop cannot bless on training data.
// ───────────────────────────────────────────────────────────────────────────

type Brand<T, B extends string> = T & { readonly __brand: B }
export interface DataSlice {
  readonly domain: Candidate["domain"]
  readonly rows: unknown
}
export type DiscoverySlice = Brand<DataSlice, "discovery">
export type HeldOutSlice = Brand<DataSlice, "heldout">

/**
 * Runtime tripwire complementing the compile-time wall: if held-out is ever loaded while exploreLoop is on the
 * stack, throw. The type wall already makes GO-on-discovery impossible; this catches a held-out READ inside
 * exploration (the leak the self-check exists to expose), belt-and-suspenders (Rule XXI adverse note).
 */
let EXPLORING = 0

// ───────────────────────────────────────────────────────────────────────────
// §3 — MEMORY: readable, git-diffable JSON skill files; stores rejections first.
// ───────────────────────────────────────────────────────────────────────────

/** Deterministic, human-readable filename per lesson (idempotent: re-recording the same lesson overwrites in place). */
function lessonKey(l: Lesson): string {
  return `${l.fromReason}__${l.constraint.op}__${String(l.constraint.value)}`.replace(/[^a-zA-Z0-9_]/g, "-")
}

export function makeFileSkillMemory(dir = defaultSkillDir()): SkillMemory {
  mkdirSync(dir, { recursive: true })
  const map = new Map<string, Lesson>()
  // reload any previously-persisted skill files (cross-session procedural memory — Phase 4).
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".json")).sort()) {
    const l = JSON.parse(readFileSync(path.join(dir, f), "utf8")) as Lesson
    map.set(lessonKey(l), l)
  }
  return {
    allLessons: () => [...map.values()],
    record: (lesson: Lesson) => {
      const key = lessonKey(lesson)
      map.set(key, lesson)
      writeFileSync(path.join(dir, `${key}.json`), JSON.stringify(lesson, null, 2) + "\n")
    },
    recall: (reason: RejectionReason["kind"]) => [...map.values()].filter((l) => l.fromReason === reason),
  }
}

export interface SkillMemory {
  allLessons(): Lesson[]
  record(lesson: Lesson): void
  recall(reason: RejectionReason["kind"]): Lesson[]
}

// ───────────────────────────────────────────────────────────────────────────
// §4 — VALIDATE ADAPTER: ONE real entry point (funding_discriminate.discriminate, tiered). Reuse; never rebuild.
// ───────────────────────────────────────────────────────────────────────────

const SRC = path.resolve(import.meta.dir, "..") // src/loop -> src
const PY = path.join(SRC, "backtest", "py", ".venv", "bin", "python")

/** Shell to the SAME Python venv scripts/funding-verdict.ts uses (funding-verdict.ts:23-31). */
async function runPy(module: string, payload: unknown): Promise<any> {
  const proc = Bun.spawn([PY, "-m", `backtest.py.${module}`], {
    cwd: SRC,
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  })
  proc.stdin.write(JSON.stringify(payload))
  proc.stdin.end()
  const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()])
  await proc.exited
  if (!out.trim()) throw new Error(`python ${module} failed:\n${err}`)
  return JSON.parse(out)
}

/** The rows a funding DiscoverySlice carries — the admitted-history cross-asset panel + per-asset stats. */
interface FundingRows {
  coins: string[]
  carry: (number | null)[][]
  forward: (number | null)[][]
  stats: FundingPanel.AssetStat[]
  exercisable: boolean
  note?: string
}

/** Select the (M,K) loadings columns named by candidate.neutralizations (subset of the 6 factors). K=0 -> demean-only. */
function buildLoadings(rows: FundingRows, neutralizations: string[]): number[][] {
  const cols = FundingFactors.NAMES.map((n, i) => (neutralizations.includes(n) ? i : -1)).filter((i) => i >= 0)
  return rows.coins.map((c, i) => {
    const full = FundingFactors.loadings(c, "HlPerp", rows.stats[i]) as number[]
    return cols.map((j) => full[j])
  })
}

/**
 * Build the discriminate() payload for a Candidate + slice and invoke the SAME engine funding-verdict.ts uses.
 * `tier` distinguishes discovery vs held-out. For cross-venue universes we ALSO run funding_crossvenue and attach
 * its block (raw-basis persistence). We do NOT edit the discriminator. Deterministic (fullDisclosure=false -> no
 * bootstrap RNG; the verdict uses the NW t-stat + power floor only).
 */
async function runDiscriminator(
  candidate: Candidate,
  slice: DataSlice,
  tier: "discovery" | "heldout",
): Promise<RawVerdict> {
  const rows = slice.rows as FundingRows
  // Honest degenerate case: no exercisable (T,M) panel (e.g. forward-T2 = 2 metadata slots) -> INSUFFICIENT.
  if (!rows.exercisable || rows.carry.length < 5) {
    return {
      verdict: "INSUFFICIENT-EVIDENCE",
      tier: `${tier} (not exercisable: ${rows.note ?? "empty panel"})`,
      downgradedBy: null,
      deflatedOosTstat: null,
      oosResidualIcMean: null,
      oosPortfolioTstat: null,
      rawIcTstat: null,
      nwLags: 0,
      deflation: null,
    }
  }

  const loadings = buildLoadings(rows, candidate.neutralizations)
  const disc = await runPy("funding_discriminate", {
    carry: rows.carry,
    forward: rows.forward,
    loadings,
    minPeriods: 60,
    cadenceHours: 1.0,
    targetIC: 0.05,
    tier: tier === "discovery" ? "T1-candidate" : "T2 forward-capture",
  })

  const crossVenue =
    candidate.universe === "hl_binance_cross_venue"
      ? await runPy("funding_crossvenue", {}).then((cv) => ({
          rawBasisIsCarry: !!cv.rawBasisIsCarry,
          separability: { shortToLongDecays: !!cv.separability?.shortToLongDecays },
          horizons: (cv.horizons ?? []).map((h: any) => ({
            horizon: h.horizon,
            meanIC: h.meanIC,
            deflatedT: h.deflatedT,
          })),
        }))
      : undefined

  const d = disc.deflation
  return {
    verdict: disc.verdict,
    tier: disc.tier,
    downgradedBy: disc.downgradedBy ?? null,
    deflatedOosTstat: disc.deflatedOosTstat ?? null,
    oosResidualIcMean: disc.oosResidualIcMean ?? null,
    oosPortfolioTstat: disc.oosPortfolioTstat ?? null,
    rawIcTstat: disc.rawIcTstat ?? null,
    nwLags: disc.nwLags ?? 0,
    robust: disc.robust,
    robustDowngradedBy: disc.robustDowngradedBy ?? null,
    deflation: d
      ? {
          effectiveNserial: d.effectiveNserial,
          effectiveBreadth: d.effectiveBreadth,
          powerFloor: {
            effectivePeriodsNeeded: d.powerFloor.effectivePeriodsNeeded,
            targetIC: d.powerFloor.targetIC,
          },
        }
      : null,
    crossVenue,
  }
}

/** DISCOVERY validation — returns DiscoveryVerdict; CANNOT return GO (enforced by the return type). */
export async function validateOnDiscovery(candidate: Candidate, discovery: DiscoverySlice): Promise<DiscoveryVerdict> {
  const raw = await runDiscriminator(candidate, discovery, "discovery")
  return toDiscoveryVerdict(raw)
}

/** The ONLY blessing path — runs the identical engine on held-out data the loop never saw. */
export async function confirm(candidate: Candidate, heldOut: HeldOutSlice): Promise<ConfirmedVerdict> {
  const raw = await runDiscriminator(candidate, heldOut, "heldout")
  return toConfirmedVerdict(raw)
}

/** Load the discovery/admitted-history slice (the ~90d T1-candidate pull). Brands DiscoverySlice. */
export function loadDiscovery(domain: Candidate["domain"]): DiscoverySlice {
  if (domain !== "funding") {
    throw new Error(`loadDiscovery(${domain}): only funding is wired. lending/rwa are P7-gated (not unlocked).`)
  }
  const panel = FundingPanel.crossAssetPanel()
  const { coins, stats } = FundingPanel.assetStats()
  if (JSON.stringify(coins) !== JSON.stringify(panel.coins)) throw new Error("coin order mismatch panel vs stats")
  const rows: FundingRows = { coins: panel.coins, carry: panel.carry, forward: panel.forward, stats, exercisable: true }
  return { domain, rows } as DiscoverySlice
}

/**
 * Load the forward-T2/held-out slice the loop never touched. Brands HeldOutSlice. Per COMPREHENSION-GVL.md (3),
 * forward-T2 is currently ~2 metadata slots (no per-asset (T,M) panel) -> NOT exercisable; confirm() will honestly
 * return INSUFFICIENT-EVIDENCE. This is loaded ONLY by runSession, never inside exploreLoop.
 */
export function loadHeldOut(domain: Candidate["domain"]): HeldOutSlice {
  if (EXPLORING > 0) throw new Error("LEAK: loadHeldOut called inside exploreLoop — the wall was breached (Rule XXI).")
  if (domain !== "funding") {
    throw new Error(`loadHeldOut(${domain}): only funding is wired. lending/rwa are P7-gated (not unlocked).`)
  }
  const slots = FundingPanel.loadT2Slots()
  const rows: FundingRows = {
    coins: [],
    carry: [],
    forward: [],
    stats: [],
    exercisable: false,
    note: `forward-T2 = ${slots.length} metadata slots (no per-asset panel); not exercisable until forward-T2 accrues`,
  }
  return { domain, rows } as HeldOutSlice
}

// ───────────────────────────────────────────────────────────────────────────
// §5 — GENERATE (dumb on purpose; MUST consume lessons). neutralizations -> the `loadings` columns.
// ───────────────────────────────────────────────────────────────────────────

const HORIZONS = ["1h", "8h", "1d", "3d", "7d"] as const
const UNIVERSES = ["hl_cross_asset", "hl_binance_cross_venue"] as const

/** Deterministic PRNG (mulberry32) — seeded, reproducible, no wall-clock. */
function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function candidateId(c: Omit<Candidate, "id">): string {
  const n = [...c.neutralizations].sort().join(",")
  const f = [...c.factors].sort().join(",")
  return `${c.domain}:${c.universe}:${c.horizon}:n[${n}]:f[${f}]`
}

/**
 * Deterministic candidate honoring every lesson. The base (seed-driven) pick draws from the PRE-REGISTERED space
 * (data/loop/search-space.funding.json). Lessons OVERRIDE the base:
 *   persistence  -> min_horizon: lengthen the holding horizon
 *   cost_negative-> require_net_positive: force the cross-venue universe (where the hedge cost is modeled)
 *   unmodeled_risk-> add_factor: include the omitted factor
 * (beta emits no lesson — structural, Rule XXVI/Rationalisation P0.) Same seed + a new lesson => a different candidate.
 */
export function generate(lessons: Lesson[], _memory: SkillMemory, seed: number): Candidate {
  const r = rng(seed)
  const factorPool = [...FundingFactors.NAMES]

  // ── base (seed-driven) — a rotating window over the factor pool, a seeded horizon + universe.
  const start = Math.floor(r() * factorPool.length)
  const k = 1 + Math.floor(r() * 3) // 1..3 base neutralizations
  const baseNeutralizations = Array.from({ length: k }, (_, i) => factorPool[(start + i) % factorPool.length])
  let horizonIdx = Math.floor(r() * HORIZONS.length)
  let universe: string = UNIVERSES[Math.floor(r() * UNIVERSES.length)]

  // ── apply lessons (constraints override the base).
  const neutralizations = new Set<string>(baseNeutralizations)
  const extraFactors = new Set<string>()
  for (const l of lessons) {
    if (l.constraint.op === "min_horizon") {
      horizonIdx = Math.max(horizonIdx, HORIZONS.indexOf(l.constraint.value as (typeof HORIZONS)[number]))
    }
    if (l.constraint.op === "require_net_positive") universe = "hl_binance_cross_venue"
    if (l.constraint.op === "add_factor") extraFactors.add(l.constraint.value)
  }

  const neut = [...neutralizations]
  const factors = [...new Set([...neut, ...extraFactors])]
  const horizon = HORIZONS[Math.max(0, horizonIdx)]
  const base = { domain: "funding" as const, factors, horizon, neutralizations: neut, universe }
  return { id: candidateId(base), ...base }
}

// ───────────────────────────────────────────────────────────────────────────
// §6 — LEARN (RawVerdict -> derived reasons -> lessons -> skill files).
// ───────────────────────────────────────────────────────────────────────────

export function learn(verdict: DiscoveryVerdict, memory: SkillMemory): Lesson[] {
  const out: Lesson[] = []
  for (const rr of verdict.reasons) {
    let l: Lesson | null = null
    // beta: STRUCTURAL (the signal IS raw carry/basis — Rule XIII). No candidate lever adds residual edge where none
    // survives, so beta emits NO steering lesson — the old `require_neutralization:"level"` was a no-op (Rule XXVI,
    // Rationalisation P0). It stays in verdict.reasons for reporting, never as a gradient step.
    if (rr.kind === "persistence") {
      l = {
        fromReason: "persistence",
        constraint: { op: "min_horizon", value: nextHorizon(rr.horizons) },
        evidence: `IC decays across ${rr.horizons.join("→")}`,
      }
    }
    if (rr.kind === "cost_negative") {
      l = {
        fromReason: "cost_negative",
        constraint: { op: "require_net_positive", value: true },
        evidence: `netCarry ${rr.netCarry} <= 0`,
      }
    }
    if (rr.kind === "unmodeled_risk") {
      l = {
        fromReason: "unmodeled_risk",
        constraint: { op: "add_factor", value: "omitted_from_robustness" },
        evidence: rr.note,
      }
    }
    // below_power_floor: data-quantity limit, not a candidate defect — recorded in the turn log, not a "fix".
    if (l) {
      memory.record(l)
      out.push(l)
    }
  }
  return out
}

function nextHorizon(current: string[]): string {
  const longest = current.reduce((a, h) => Math.max(a, HORIZONS.indexOf(h as (typeof HORIZONS)[number])), -1)
  return longest >= 0 && longest < HORIZONS.length - 1 ? HORIZONS[longest + 1] : "7d"
}

// ───────────────────────────────────────────────────────────────────────────
// §7 — THE SPINE: explore on discovery (cannot bless) → confirm on held-out (only GO path).
// ───────────────────────────────────────────────────────────────────────────

export interface TurnLog {
  turn: number
  candidate: Candidate
  verdict: DiscoveryVerdict
  newLessons: Lesson[]
}

export async function exploreLoop(
  discovery: DiscoverySlice,
  memory: SkillMemory,
  maxTurns: number,
  seed = 1,
): Promise<{ promising: Candidate[]; log: TurnLog[] }> {
  EXPLORING++ // arm the held-out tripwire for the duration of exploration
  const log: TurnLog[] = []
  const promising: Candidate[] = []
  let lessons = memory.allLessons()
  for (let turn = 0; turn < maxTurns; turn++) {
    const candidate = generate(lessons, memory, seed + turn)
    const verdict = await validateOnDiscovery(candidate, discovery) // cannot return GO (by type)
    const newLessons = learn(verdict, memory)
    lessons = [...lessons, ...newLessons]
    if (verdict.status === "PROVISIONAL") promising.push(candidate)
    log.push({ turn, candidate, verdict, newLessons })
  }
  EXPLORING--
  return { promising, log }
}

export async function confirmBest(promising: Candidate[], heldOut: HeldOutSlice): Promise<ConfirmedVerdict[]> {
  return Promise.all(promising.map((c) => confirm(c, heldOut)))
}

// ───────────────────────────────────────────────────────────────────────────
// §8 — SESSION ENTRYPOINT (held-out loaded ONLY here; self-checking).
// ───────────────────────────────────────────────────────────────────────────

export interface SessionResult {
  domain: Candidate["domain"]
  turns: number
  promisingCount: number
  log: TurnLog[]
  heldOutExercisable: boolean
  confirmed: ConfirmedVerdict[]
}

export async function runSession(domain: Candidate["domain"], maxTurns = 12, seed = 1): Promise<SessionResult> {
  const memory = makeFileSkillMemory()
  const discovery = loadDiscovery(domain)
  const { promising, log } = await exploreLoop(discovery, memory, maxTurns, seed)
  assertLessonsSteerGeneration(log) // fails the session if the loop isn't learning
  if (promising.length === 0) {
    console.log("No provisional candidates on discovery. Loop is honest and leak-free. Valid outcome (Rule XXIII).")
    return { domain, turns: maxTurns, promisingCount: 0, log, heldOutExercisable: false, confirmed: [] }
  }
  const heldOut = loadHeldOut(domain) // first and only touch of held-out data
  const rows = heldOut.rows as FundingRows
  const confirmed = await confirmBest(promising, heldOut)
  console.log(JSON.stringify({ promisingCount: promising.length, heldOutExercisable: rows.exercisable, confirmed }, null, 2))
  return { domain, turns: maxTurns, promisingCount: promising.length, log, heldOutExercisable: rows.exercisable, confirmed }
}

export function assertLessonsSteerGeneration(log: TurnLog[]): void {
  for (let i = 1; i < log.length; i++) {
    const prior = log[i - 1]
    if (prior.newLessons.length === 0) continue
    if (JSON.stringify(log[i].candidate) === JSON.stringify(prior.candidate)) {
      throw new Error(
        `LOOP NOT LEARNING: turn ${prior.turn} produced lessons but turn ${log[i].turn} proposed an identical candidate — fix §5.`,
      )
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────
// helpers
// ───────────────────────────────────────────────────────────────────────────

function defaultSkillDir(): string {
  // resolve <repo>/data/loop/skills by walking up from src/loop (parallel to FundingPanel.dataDir).
  let dir = import.meta.dir
  for (let i = 0; i < 12; i++) {
    const c = path.join(dir, "data", "loop", "skills")
    if (existsSync(path.join(dir, "data", "loop"))) return c
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return path.join(SRC, "..", "..", "..", "data", "loop", "skills")
}
