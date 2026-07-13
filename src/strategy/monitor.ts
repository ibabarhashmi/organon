/**
 * ORGΛNON — THE CADENCE SPRINT (X-CADENCE; the CLOCK, S74/S77). THE MONITOR READS, NEVER ACTS. A cycle re-judges a held
 * manifest on the EXISTING capture cadence and re-states facts against the content-hashed registration baseline — it never
 * says "sell", never "exit now", never urgency. `Monitor.cycle` is a PURE COMPOSITION of existing calls:
 *   resolveAndCompile (V31) → Baseline.diff (this sprint) → Trial.append (Moat) → a CycleReport in canonical JSON.
 *
 * FOUR walls hold at the source:
 *   · CONFIRMED-BOUNDARY ONLY (S77) — a cycle renders a reading ONLY when the confirmed-capture head advanced since the
 *     last cycle; no fresh confirmed capture → deltas UNJUDGEABLE, NO reading (the TradingView no-repaint analogue: a signal
 *     fires only on a closed bar, never intra-bar);
 *   · IMMUTABLE ONCE WRITTEN (S77) — cycles are an append-only, hash-chained ledger; a seeded overwrite of a past cycle FAILS;
 *   · A TRIAL PER FRESH CYCLE (S75) — a fresh confirmed cycle IS a compile, so it appends a hash-chained trial (recorded,
 *     NEVER counted); a no-op cycle (no fresh capture) appends NO trial → repeated invocation is idempotent (the timer path);
 *   · READS-NEVER-ACTS (S74) — every rendered cycle line passes the compile advice wall + a monitor-specific urgency guard.
 * NO daemon, NO scheduler, NO server state (grep-walled). The cadence is the user's OS clock (docs/CADENCE-TRIGGERS.md).
 */
import { createHash } from "node:crypto"
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { StrategyStore } from "./store"
import { StrategyResolve } from "./resolve"
import { StrategyCompile } from "./compile"
import { StrategyTrial } from "./trial"
import { Baseline } from "./baseline"
import { FactEnvelope } from "./envelope"
import { VoiceGates } from "../ask/gates"

export namespace Monitor {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

  export const CYCLE_DIR = path.join(StrategyStore.ROOT, "cycles") // gitignored — the user's live cycle ledger
  export const FIXTURE_CYCLE_DIR = path.join(StrategyStore.FIXTURE_DIR, "cycles") // committed — the walls' deterministic cycles
  export const BASELINE_DIR = path.join(StrategyStore.ROOT, "baselines") // gitignored — per-lineage registration baselines
  export const FIXTURE_BASELINE_DIR = path.join(StrategyStore.FIXTURE_DIR, "baselines") // committed — the walls' baselines

  // the monitor-specific urgency/instruction shapes REFUSED on a cycle line (S74) — ON TOP of the compile advice wall
  // (which already catches "sell "/"you should"/"exit your position"). A fired exit is a FACT with its hash, never a command.
  export const URGENCY_SHAPES = ["exit now", "sell now", "act now", "urgent", "get out", "dump now", "you should exit", "you should sell", "time to sell", "time to exit", "cut your losses", "take profit now"] as const

  // the advice wall + the urgency guard, re-run on EVERY cycle line (S74). A cycle line phrased as instruction/urgency is a Halt.
  export function guardCycleLine(text: string): { ok: true } | { ok: false; reason: string } {
    const g = StrategyCompile.guardLine(text)
    if (!g.ok) return g
    const lower = ` ${text.toLowerCase()} `
    const urgent = URGENCY_SHAPES.find((s) => lower.includes(s))
    if (urgent) return { ok: false, reason: `a cycle line is phrased as instruction/urgency ("${urgent}") — the monitor READS, never ACTS; a fired exit is a stated fact with its hash, never a command (X-CADENCE a; S74)` }
    return { ok: true }
  }

  // the fired-exit fact grammar (pinned, cadence-pins) — a stated fact, never an instruction.
  export function firedExitLine(hash: string, why: string): string {
    return `exit criterion ${hash.slice(0, 8)}… FIRED this cycle — ${why} (a stated fact; not an instruction).`
  }
  export function heldExitLine(hash: string, why: string): string {
    return `exit criterion ${hash.slice(0, 8)}… NOT FIRED this cycle — ${why}.`
  }

  // one confirmed-capture head — a deterministic hash over each reachable position's latest provenance head (contentHash +
  // asOf). When a capture script writes a fresh confirmed record, this head advances → the next cycle is a fresh boundary. A
  // SAMPLE position (no provenance) contributes a stable sentinel, so an all-SAMPLE manifest never fabricates a fresh boundary.
  export function captureHeadOf(resolved: StrategyResolve.Resolved[]): string {
    const parts = resolved.map((r) => {
      const h = r.history.length ? r.history[r.history.length - 1] : null
      return `${r.poolKey}:${h ? `${h.contentHash}@${h.asOf}` : "SAMPLE"}`
    })
    return sha256(parts.join("|"))
  }

  // build the baseline SURFACE from a compile result + the resolved positions (the govClass is the MR3 read).
  export function surfaceOf(composed: StrategyCompile.Composed, resolved: StrategyResolve.Resolved[]): Baseline.Surface {
    const byKey = new Map(resolved.map((r) => [r.poolKey, r]))
    const positions: Baseline.PositionSurface[] = composed.positions.map((p) => {
      const r = byKey.get(p.subjectKey)
      return {
        subjectKey: p.subjectKey,
        name: p.name,
        verdict: p.scored.verdict,
        govClass: r?.govClass ?? null,
        captureTier: r?.provTier ?? (p.reachable ? "REAL-at-timestamp" : "SAMPLE"),
        peg: p.exitFacts.peg ?? null,
        tvlDrawdown: p.exitFacts.tvlDrawdown ?? null,
        fundingNegPeriods: p.exitFacts.fundingNegPeriods ?? null,
        fundingTotalPeriods: p.exitFacts.fundingTotalPeriods ?? null,
      }
    })
    return {
      positions,
      effectiveK: composed.effectiveBets?.sufficient ? (composed.effectiveBets.effectiveK ?? null) : null,
      catch: composed.catchAggregation,
      worstAxis: composed.worstAxis ? { subjectKey: composed.worstAxis.subjectKey, axis: composed.worstAxis.axis, tier: composed.worstAxis.tier } : null,
      exitHash: composed.exit?.hash ?? null,
    }
  }

  export interface CycleReport {
    lineageId: string
    cycle: number // 1-based sequence
    at: string // caller-supplied now (deterministic)
    captureHead: string // the confirmed-capture head this cycle read
    fresh: boolean // did the confirmed-capture head advance since the last cycle?
    baselineHash: string | null
    baselinePinnedThisCycle: boolean // migration: a pre-baseline manifest pins at its first monitored cycle (deltas begin next)
    exit: { hash: string; fired: boolean; judgeable: boolean; line: string } | null
    deltas: Baseline.Delta[] // [] when !fresh (UNJUDGEABLE) or when the baseline was pinned this cycle
    note: string // the human line (confirmed-boundary state), advice-wall + urgency guarded
    trialCount: number // the lineage's trial count AFTER this cycle
    trialEntryHash: string | null // the trial appended this cycle (null on a no-op / baseline-pin cycle)
    prevReportHash: string | null // hash-chained (immutability)
    reportHash: string // sha256 over the canonical report body — the immutability seal
  }

  function cycleFile(id: string, dir: string): string {
    return path.join(dir, `${id}.jsonl`)
  }
  function baselineFile(id: string, dir: string): string {
    return path.join(dir, `${id}.json`)
  }

  function readCycles(f: string): CycleReport[] {
    return readFileSync(f, "utf8").split("\n").filter((l) => l.trim().length > 0).map((l) => JSON.parse(l) as CycleReport)
  }

  // history — the immutable cycle ledger (fixture fallback on a pristine clone, exactly like the trial ledger).
  export function history(id: string, dir: string = CYCLE_DIR): CycleReport[] {
    const f = cycleFile(id, dir)
    if (existsSync(f)) return readCycles(f)
    const ff = cycleFile(id, FIXTURE_CYCLE_DIR)
    if (dir === CYCLE_DIR && existsSync(ff)) return readCycles(ff)
    return []
  }

  export function loadBaseline(id: string, dir: string = BASELINE_DIR): Baseline.Record | null {
    const f = baselineFile(id, dir)
    if (existsSync(f)) return JSON.parse(readFileSync(f, "utf8")) as Baseline.Record
    const ff = baselineFile(id, FIXTURE_BASELINE_DIR)
    if (dir === BASELINE_DIR && existsSync(ff)) return JSON.parse(readFileSync(ff, "utf8")) as Baseline.Record
    return null
  }

  // the canonical report body used for the immutability seal (everything except the seal + the chain pointer).
  function reportBody(r: Omit<CycleReport, "reportHash">): string {
    return FactEnvelope.canonical({ lineageId: r.lineageId, cycle: r.cycle, at: r.at, captureHead: r.captureHead, fresh: r.fresh, baselineHash: r.baselineHash, baselinePinnedThisCycle: r.baselinePinnedThisCycle, exit: r.exit, deltas: r.deltas, note: r.note, trialCount: r.trialCount, trialEntryHash: r.trialEntryHash, prevReportHash: r.prevReportHash })
  }

  export interface CycleOpts {
    cycleDir?: string
    baselineDir?: string
    trialDir?: string
    captureHead?: string // injectable for deterministic tests (defaults to captureHeadOf(resolved))
  }

  // CYCLE — re-judge a held manifest on the cadence. Async (it calls the live resolve pipeline); pure composition otherwise.
  export async function cycle(id: string, now: number, at: string, opts: CycleOpts = {}): Promise<CycleReport | { error: string }> {
    const cycleDir = opts.cycleDir ?? CYCLE_DIR
    const baselineDir = opts.baselineDir ?? BASELINE_DIR
    const trialDir = opts.trialDir ?? StrategyTrial.TRIAL_DIR

    const manifest = StrategyStore.load(id) ?? StrategyStore.load(id, StrategyStore.FIXTURE_DIR)
    if (!manifest) return { error: `No manifest with lineage ${id.slice(0, 8)}… is stored (or committed as a fixture). Nothing is fabricated.` }
    if (StrategyStore.lineageId(manifest) !== id) return { error: `lineage mismatch — the stored manifest does not hash to ${id.slice(0, 8)}…` }
    const closed = StrategyStore.closure(id)
    if (closed) return { error: `strategy ${id.slice(0, 8)}… is CLOSED (${closed.reason}) — no further cycles run on a closed lineage. What follows a closure is the post-mortem (V33, reserved).` }

    const priorCycles = history(id, cycleDir)
    const lastCycle = priorCycles.length ? priorCycles[priorCycles.length - 1] : null
    let baseline = loadBaseline(id, baselineDir)

    // resolve + compile (MR3: thread the baseline gov-class so the governance-change exit becomes evaluable)
    const baselineGov = baseline ? Object.fromEntries(baseline.surface.positions.map((p) => [p.subjectKey, p.govClass])) : undefined
    const { composed, resolved } = await StrategyResolve.resolveAndCompile(manifest, now, Date.parse(at) || undefined, baselineGov)
    const currentSurface = surfaceOf(composed, resolved)
    const captureHead = opts.captureHead ?? captureHeadOf(resolved)
    const fresh = lastCycle ? captureHead !== lastCycle.captureHead : true

    const seq = priorCycles.length + 1
    const prevReportHash = lastCycle ? lastCycle.reportHash : null

    // MIGRATION — a pre-baseline manifest pins its baseline at the FIRST monitored cycle (never back-dated); deltas begin next.
    let baselinePinnedThisCycle = false
    if (!baseline) {
      baseline = Baseline.pin(currentSurface, at)
      writeJson(baselineFile(id, baselineDir), baseline)
      baselinePinnedThisCycle = true
    }

    // a fresh confirmed cycle IS a compile → append a trial (recorded, never counted). A no-op / baseline-pin cycle does NOT.
    let trialEntryHash: string | null = null
    let trialCount = StrategyTrial.ledger(StrategyStore.manifestHash(manifest), trialDir).length
    if (fresh && !baselinePinnedThisCycle) {
      const returnSeries = composed.lines.map((l) => ({ kind: l.kind, text: l.text }))
      const metric = { effectiveK: currentSurface.effectiveK, worstAxisTier: composed.worstAxis?.tier ?? null, exitFired: composed.exit?.judgeable ? composed.exit.fired : null, reachable: currentSurface.catch.totalReachable }
      const t = StrategyTrial.append(StrategyStore.manifestHash(manifest), returnSeries, metric, Date.parse(at) || now, trialDir)
      trialEntryHash = t.entryHash
      trialCount += 1
    }

    // the deltas + the exit reading — ONLY on a fresh confirmed boundary with a standing baseline (never on a no-op / pin).
    let deltas: Baseline.Delta[] = []
    let exit: CycleReport["exit"] = null
    let note: string
    if (baselinePinnedThisCycle) {
      note = `baseline pinned this cycle (${baseline.hash.slice(0, 8)}…) — deltas begin next cycle. Nothing is judged against a frame that did not yet exist.`
    } else if (!fresh) {
      note = `no new confirmed capture since the last cycle (head ${captureHead.slice(0, 8)}…) — deltas UNJUDGEABLE; no reading rendered (a cycle renders only on a confirmed boundary).`
    } else {
      deltas = Baseline.diff(baseline, currentSurface)
      if (composed.exit) {
        const line = composed.exit.judgeable ? (composed.exit.fired ? firedExitLine(composed.exit.hash, composed.exit.why) : heldExitLine(composed.exit.hash, composed.exit.why)) : `exit criterion ${composed.exit.hash.slice(0, 8)}… — ${composed.exit.why}`
        exit = { hash: composed.exit.hash, fired: composed.exit.fired, judgeable: composed.exit.judgeable, line }
      }
      const changed = deltas.filter((d) => d.judgeable && d.changed).length
      note = `cycle ${seq} on a confirmed boundary (capture head ${captureHead.slice(0, 8)}…): ${changed} judgeable change${changed === 1 ? "" : "s"} against baseline ${baseline.hash.slice(0, 8)}….`
    }

    // S74 — every rendered line passes the advice wall + the urgency guard (the monitor reads, never acts).
    for (const line of [note, exit?.line, ...deltas.map((d) => d.text)].filter(Boolean) as string[]) {
      const g = guardCycleLine(line)
      if (!g.ok) return { error: `CYCLE HALT — ${g.reason}: "${line}"` }
    }

    const partial: Omit<CycleReport, "reportHash"> = { lineageId: id, cycle: seq, at, captureHead, fresh, baselineHash: baseline.hash, baselinePinnedThisCycle, exit, deltas, note, trialCount, trialEntryHash, prevReportHash }
    const reportHash = sha256(`${reportBody(partial)}·${prevReportHash ?? "GENESIS"}`)
    const report: CycleReport = { ...partial, reportHash }

    if (!existsSync(cycleDir)) mkdirSync(cycleDir, { recursive: true })
    appendFileSync(cycleFile(id, cycleDir), JSON.stringify(report) + "\n")
    return report
  }

  // baselines are write-once (pinned at registration); a re-pin goes through Baseline.repin + a disclosed record, never here.
  function writeJson(f: string, x: unknown): void {
    if (existsSync(f)) return
    if (!existsSync(path.dirname(f))) mkdirSync(path.dirname(f), { recursive: true })
    writeFileSync(f, JSON.stringify(x, null, 2) + "\n")
  }

  // the render-ready monitoring view — assembled from the immutable cycle history + the baseline + the closure status.
  // Structurally matches Reality.MonitoringView (no cross-import; the route assigns it). Returns null when nothing is monitored.
  export interface View {
    baselineLine: string
    deltaLines: string[]
    exitTimeline: string[]
    boundaryNote?: string
    closureLine?: string
  }
  export function viewOf(id: string, opts: { cycleDir?: string; baselineDir?: string; closureDir?: string } = {}): View | null {
    const baseline = loadBaseline(id, opts.baselineDir ?? BASELINE_DIR)
    const cycles = history(id, opts.cycleDir ?? CYCLE_DIR)
    if (!baseline && cycles.length === 0) return null
    const fresh = cycles.filter((c) => c.fresh && !c.baselinePinnedThisCycle)
    const lastFresh = fresh.length ? fresh[fresh.length - 1] : null
    const last = cycles.length ? cycles[cycles.length - 1] : null
    const lastCapture = lastFresh ? lastFresh.at : baseline ? baseline.registeredAt : "—"
    const baselineLine = baseline
      ? `baseline pinned ${baseline.hash.slice(0, 8)}… at registration (${baseline.registeredAt}) · ${cycles.length} cycle${cycles.length === 1 ? "" : "s"} since · last confirmed capture ${lastCapture}`
      : `no baseline pinned yet — it pins at the first monitored cycle`
    const deltaLines = lastFresh ? lastFresh.deltas.filter((d) => d.judgeable).map((d) => d.text) : []
    const exitTimeline = fresh.filter((c) => c.exit).map((c) => `cycle ${c.cycle}: ${c.exit!.judgeable ? (c.exit!.fired ? "FIRED" : "NOT FIRED") : "UNJUDGEABLE"} — ${c.exit!.line}`)
    const boundaryNote = last && (last.baselinePinnedThisCycle || !last.fresh) ? last.note : undefined
    const closure = StrategyStore.closure(id, opts.closureDir)
    const closureLine = closure ? `${closure.reason} (closed ${closure.at}). No further cycles run; the post-mortem is reserved (V33, D40).` : undefined
    return { baselineLine, deltaLines, exitTimeline, boundaryNote, closureLine }
  }

  // VERIFY the cycle chain re-hashes on a pristine clone — each report's body re-seals; each prevReportHash === the prior
  // report's reportHash; a gap, a reorder, or a rewritten (repainted) cycle FAILS (S77 immutability).
  export function verify(id: string, dir: string = CYCLE_DIR): { ok: boolean; count: number; reason?: string } {
    const chain = history(id, dir)
    let prev: string | null = null
    for (let i = 0; i < chain.length; i++) {
      const r = chain[i]
      if (r.prevReportHash !== prev) return { ok: false, count: chain.length, reason: `cycle ${i}: prevReportHash breaks the chain (a gap, reorder, or repaint)` }
      const { reportHash, ...rest } = r
      if (sha256(`${reportBody(rest)}·${r.prevReportHash ?? "GENESIS"}`) !== reportHash) return { ok: false, count: chain.length, reason: `cycle ${i}: reportHash does not recompute (a repainted / tampered cycle)` }
      prev = r.reportHash
    }
    return { ok: true, count: chain.length }
  }
}
