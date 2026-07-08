/**
 * ORGΛNON — THE HONESTY SCORECARD (Honesty Layer Phase 3; Rules X-DETERM, X-ONE, X-HONEST). The product: it answers ONE
 * question about a real strategy — *is this yield real, and what could kill it?* — as a MACHINE-DERIVED scorecard, tuned
 * to how DeFi money actually dies. Each axis is a pure `(facts) → AxisRow` (deterministic, independently testable, no
 * side effects, NO inference — X-DETERM). The verdict (`SOLID`/`CAUTION`/`AVOID`/`UNVERIFIED`) and its one-line summary
 * are DERIVED from the rows, never hand-written; an AVOID/CAUTION names its failing rows; `UNVERIFIED` renders as an
 * honest "we can't confirm this," never a disguised pass. Both registers render from the one fact table and are
 * consistency-checked (X-ONE), reusing the WHY engine (`explain.ts`, byte-untouched). The LLM may ONLY rephrase the
 * plain register behind the groundedness verifier — it never touches a verdict, an axis, or the record (X-DETERM).
 *
 * The thresholds are the pinned, hash-locked constants (data/honesty/phase0-pins.json). A change is a conscious re-pin.
 */
import { Explain } from "./explain"

export namespace Scorecard {
  // `not-applicable` is a DISTINCT honest state (Deepening; X-COVER) — an axis that does not apply to the vertical (funding
  // on a lending pool; peg on a non-stable; liquidity on a lending market) renders it: NEVER a pass, NEVER counted.
  export type Tier = "pass" | "caution" | "fail" | "unverified" | "not-applicable"
  export type Verdict = "SOLID" | "CAUTION" | "AVOID" | "UNVERIFIED"
  export type Reality = "REAL" | "SAMPLE"
  export type Vertical = "stablecoin-yield" | "lending" | "delta-neutral"
  export type Axis = "yield-reality" | "tvl-trend" | "peg" | "liquidity-depth" | "unlock-overhang" | "counterparty" | "funding-regime"

  // ── the pinned axis thresholds (phase0-pins.json + deepening-pins.json, PINS_SHA-locked) ──
  export const DURABLE_BASE_SHARE = 0.5 // baseShare ≥ 0.5 → durable (base is the majority)
  export const MERCENARY_BASE_SHARE = 0.2 // baseShare < 0.2 → mercenary (>80% emissions)
  export const TVL_STABLE_FLOOR = -0.1 // 30d TVL slope ≥ −10% → stable
  export const TVL_COLLAPSE_FLOOR = -0.35 // < −35% → collapse
  export const PEG_ONPEG_BAND = 0.005 // |price−1| ≤ 0.5% → on-peg
  export const PEG_DEPEG_BAND = 0.02 // > 2% → depeg
  export const LIQ_DEEP_USD = 500_000 // reserve ≥ $500k → deep (an exit won't move the price much)
  export const LIQ_THIN_USD = 50_000 // reserve < $50k → thin (exit/slippage risk)
  export const UNLOCK_BENIGN = 0.01 // next-30d unlock ≤ 1% of mcap → benign
  export const UNLOCK_HEAVY = 0.05 // > 5% of mcap → heavy overhang
  export const CP_AGE_MATURE_DAYS = 365 // pool age ≥ 365d → mature
  export const CP_AGE_YOUNG_DAYS = 90 // < 90d → young (a hard flag)
  export const CP_SIZE_ESTABLISHED_USD = 10_000_000 // TVL ≥ $10M → established
  export const CP_SIZE_DUST_USD = 1_000_000 // < $1M → dust (a hard flag)
  export const CP_DEP_SINGLE = 1 // depends on ≤ 1 protocol → a single, transparent dependency (the clean baseline, never a flag)
  export const CP_DEP_STACKED = 3 // depends on ≥ 3 protocols → stacked counterparty/attack surface (a hard flag)

  export interface AxisRow {
    axis: Axis
    name: string
    value: number | string // the metric (baseShare / slope / pegDev / liqUsd) or "n/a"
    threshold: number | string | null
    comparator: string | null
    tier: Tier
    material: boolean // does this axis bear on the verdict? (an inapplicable axis is non-material — never counts)
    flagship: boolean // yield-reality (or, for delta-neutral, funding-regime) is the flagship
    plainReason: string // qualitative — the consumer (Simple) register
    provenanceRef: string | null
  }

  export interface PoolFacts {
    name: string
    apyBase: number | null
    apyReward: number | null
    tvlSlope30d: number | null // (tvl_now − tvl_30d_ago)/tvl_30d_ago; null if < 30d history
    pegDev: number | null // |price − 1| for the stablecoin leg; null if no peg price
    isStablecoin: boolean
    reality: Reality // REAL iff every shown value is recorded; SAMPLE otherwise
    provenanceRef: string | null // the record contentHash (the moat anchor)
    vertical?: Vertical // the money vertical (drives the applicability matrix); defaults to "lending" for a non-delta pool
    deltaNeutral?: boolean // a delta-neutral funding strategy — scored on the funding-regime axis, not yield/peg
    fundingBand?: { p10: number; median: number; p90: number } | null // annualized % band; null = insufficient data
    liqUsd?: number | null // DEX-pool reserve liquidity (GeckoTerminal) — the liquidity-depth axis; null → UNVERIFIED where applicable
    hasUnlockSchedule?: boolean // the reward token has a KNOWN unlock schedule (drives the unlock axis's applicability)
    unlockPct30d?: number | null // next-30d token unlock as a fraction of mcap (DeFiLlama unlocks) — the unlock-overhang axis
    ageDays?: number | null // pool age = recorded /chart history span in days — the counterparty screen's maturity signal
    sizeUsd?: number | null // pool size (TVL, USD) — the counterparty screen's size signal
    depProtocols?: number | null // the # of distinct protocols the strategy's yield depends on — the counterparty screen's dependency signal (Crown-Jewel; 1 = a direct single-protocol deposit)
  }

  // the money vertical this pool is scored as — delta-neutral is intrinsic; else the declared vertical (default lending).
  export function verticalOf(f: PoolFacts): Vertical { return f.deltaNeutral ? "delta-neutral" : (f.vertical ?? "lending") }

  // ── THE VERTICAL-APPLICABILITY MATRIX (deepening-pins.json; X-COVER) — DECLARED here so a wall can cross-check that
  // rows() HONORS it. `applies` = material where its data is present; `conditional` = material only when its data-gate
  // holds (peg needs a stablecoin leg; unlock needs a reward-token schedule); `n/a` = never material for this vertical
  // (rendered `not-applicable` or omitted). n/a never counts toward SOLID or the UNVERIFIED-dominance count. TOTAL. ──
  export type Applicability = "applies" | "conditional" | "n/a"
  export const APPLIES: Record<Vertical, Record<Axis, Applicability>> = {
    "stablecoin-yield": { "yield-reality": "applies", "tvl-trend": "applies", peg: "conditional", "liquidity-depth": "applies", "unlock-overhang": "conditional", counterparty: "applies", "funding-regime": "n/a" },
    lending: { "yield-reality": "applies", "tvl-trend": "applies", peg: "conditional", "liquidity-depth": "n/a", "unlock-overhang": "conditional", counterparty: "applies", "funding-regime": "n/a" },
    "delta-neutral": { "yield-reality": "n/a", "tvl-trend": "n/a", peg: "n/a", "liquidity-depth": "n/a", "unlock-overhang": "n/a", counterparty: "n/a", "funding-regime": "applies" },
  }

  const round = (x: number, d: number) => Number(x.toFixed(d))

  // a `not-applicable` row — the axis does not apply to this vertical; shown honestly, never a pass, never counted.
  export function notApplicable(axis: Axis, name: string, reason: string, provenanceRef: string | null): AxisRow {
    return { axis, name, value: "n/a", threshold: null, comparator: null, tier: "not-applicable", material: false, flagship: false, plainReason: reason, provenanceRef }
  }

  // ── AXIS 1 — YIELD-REALITY (the flagship): baseShare = apyBase / (apyBase + apyReward) ──
  export function yieldRealityRow(f: PoolFacts): AxisRow {
    const base = f.apyBase
    const reward = f.apyReward ?? 0 // null reward → no rewards (coalesced), NEVER fabricated
    const c = { axis: "yield-reality" as const, name: "yield reality (durable base vs reward emissions)", threshold: DURABLE_BASE_SHARE, comparator: "≥", material: true, flagship: true, provenanceRef: f.provenanceRef }
    if (base === null || base + reward <= 0) return { ...c, value: "n/a", tier: "unverified", plainReason: "We can't confirm the yield split — the base/reward data is missing." }
    const baseShare = round(base / (base + reward), 3)
    if (baseShare >= DURABLE_BASE_SHARE) return { ...c, value: baseShare, tier: "pass", plainReason: "Most of this yield is durable base yield, not temporary reward emissions." }
    if (baseShare < MERCENARY_BASE_SHARE) return { ...c, value: baseShare, tier: "fail", plainReason: "Most of this yield is temporary reward emissions that will fade — very little is durable base yield." }
    return { ...c, value: baseShare, tier: "caution", plainReason: "A large share of this yield is temporary reward emissions that will decay — only part is durable base yield." }
  }

  // ── AXIS 2 — TVL TREND: tvlSlope30d ──
  export function tvlTrendRow(f: PoolFacts): AxisRow {
    const c = { axis: "tvl-trend" as const, name: "TVL trend (money staying vs fleeing)", threshold: TVL_STABLE_FLOOR, comparator: "≥", material: true, flagship: false, provenanceRef: f.provenanceRef }
    if (f.tvlSlope30d === null) return { ...c, value: "n/a", tier: "unverified", plainReason: "We can't confirm the deposit trend — there isn't 30 days of history yet." }
    const v = round(f.tvlSlope30d, 3)
    if (v >= TVL_STABLE_FLOOR) return { ...c, value: v, tier: "pass", plainReason: "The pool's deposits are stable or growing — money is not fleeing." }
    if (v < TVL_COLLAPSE_FLOOR) return { ...c, value: v, tier: "fail", plainReason: "The pool's deposits are collapsing — a large share of the money has left in the last month." }
    return { ...c, value: v, tier: "caution", plainReason: "The pool's deposits are sliding — money has been leaving over the last month." }
  }

  // ── AXIS 3 — PEG / STABILITY: pegDev = |price − 1| (material only for a stablecoin leg) ──
  export function pegRow(f: PoolFacts): AxisRow {
    const c = { axis: "peg" as const, name: "peg / stability", threshold: PEG_ONPEG_BAND, comparator: "≤", flagship: false, provenanceRef: f.provenanceRef }
    if (!f.isStablecoin) return notApplicable("peg", c.name, "This isn't a stablecoin strategy, so there's no dollar peg to break.", f.provenanceRef)
    if (f.pegDev === null) return { ...c, value: "n/a", tier: "unverified", material: true, plainReason: "We can't confirm the peg — the price data is missing." }
    const v = round(f.pegDev, 4)
    if (v <= PEG_ONPEG_BAND) return { ...c, value: v, tier: "pass", material: true, plainReason: "The stablecoin is holding its $1 peg." }
    if (v > PEG_DEPEG_BAND) return { ...c, value: v, tier: "fail", material: true, plainReason: "The stablecoin has broken its $1 peg — a depeg is underway." }
    return { ...c, value: v, tier: "caution", material: true, plainReason: "The stablecoin is wobbling off its $1 peg." }
  }

  // ── AXIS 4 — FUNDING REGIME (delta-neutral; Phase 5): a volatility BAND, never a hero APY ──
  export function fundingRegimeRow(f: PoolFacts): AxisRow {
    const c = { axis: "funding-regime" as const, name: "funding regime (the carry's volatility band)", threshold: "band [p10,p90]", comparator: null, material: true, flagship: true, provenanceRef: f.provenanceRef }
    const b = f.fundingBand
    if (b === null || b === undefined) return { ...(c as unknown as Omit<AxisRow, "value" | "tier" | "plainReason">), value: "n/a", tier: "unverified", plainReason: "We can't confirm the funding regime — not enough funding history yet." } as AxisRow
    const band = `[${b.p10}%, ${b.p90}%]`
    if (b.p10 > 0) return { ...c, value: band, tier: "pass", plainReason: `The funding carry has stayed positive across the window (annualized ${band}, median ${b.median}%). The yield is real carry — but it is a range, not one number, and can move.` } as AxisRow
    if (b.p90 < 0) return { ...c, value: band, tier: "fail", plainReason: `The funding carry is negative across the window (annualized ${band}) — you would PAY to hold this position, not earn.` } as AxisRow
    return { ...c, value: band, tier: "caution", plainReason: `The funding carry swings through zero (annualized ${band}) — the yield depends on the regime and can flip negative.` } as AxisRow
  }

  // ── AXIS 5 — LIQUIDITY DEPTH (Deepening Phase 2; GeckoTerminal reserve_in_usd): thin liquidity = exit/slippage risk.
  // Applies only where there is a DEX-pool depth to screen (the stablecoin-yield vertical). For a lending market — whose
  // exit is the protocol's available liquidity, NOT a DEX pool depth — this axis renders `not-applicable`, never a pass. ──
  export function liquidityDepthRow(f: PoolFacts): AxisRow {
    const c = { axis: "liquidity-depth" as const, name: "liquidity depth (exit / slippage risk)", threshold: LIQ_DEEP_USD, comparator: "≥", flagship: false, material: true, provenanceRef: f.provenanceRef }
    if (verticalOf(f) !== "stablecoin-yield") return notApplicable("liquidity-depth", c.name, "A lending market's exit liquidity is the protocol's available liquidity, not a DEX pool's depth — this DEX-depth axis doesn't screen it.", f.provenanceRef)
    const v = f.liqUsd ?? null
    if (v === null) return { ...c, value: "n/a", tier: "unverified", plainReason: "We can't confirm the pool's exit liquidity — the depth data is missing." }
    if (v >= LIQ_DEEP_USD) return { ...c, value: round(v, 0), tier: "pass", plainReason: "The pool is deep — you could exit a meaningful size without moving the price much." }
    if (v < LIQ_THIN_USD) return { ...c, value: round(v, 0), tier: "fail", plainReason: "The pool is thin — exiting a meaningful size would move the price against you (real slippage / exit risk)." }
    return { ...c, value: round(v, 0), tier: "caution", plainReason: "The pool is shallow — a large exit would face slippage." }
  }

  // ── AXIS 6 — UNLOCK OVERHANG (Deepening Phase 3; DeFiLlama unlocks): imminent token dilution is structured supply risk.
  // Applies where the reward token has a KNOWN unlock schedule; a blue-chip stable market with no token overhang renders
  // `not-applicable` (never a fabricated pass). NOTE: DeFiLlama's unlocks feed went keyless→paid (HTTP 402) mid-sprint
  // (deviation D4) — the axis is built + positive-controlled, but on live keyless data with no schedule resolvable it is
  // honestly `not-applicable`/UNVERIFIED, never scraped or faked (X-HONEST). ARMED for a keyless schedule source. ──
  export function unlockOverhangRow(f: PoolFacts): AxisRow {
    const c = { axis: "unlock-overhang" as const, name: "unlock overhang (imminent token dilution)", threshold: UNLOCK_BENIGN, comparator: "≤", flagship: false, material: true, provenanceRef: f.provenanceRef }
    if (!f.hasUnlockSchedule) return notApplicable("unlock-overhang", c.name, "No reward token with a known unlock schedule — there's no imminent supply overhang to screen.", f.provenanceRef)
    const v = f.unlockPct30d ?? null
    if (v === null) return { ...c, value: "n/a", tier: "unverified", plainReason: "A token unlock schedule exists, but the next-30-day unlock size can't be confirmed (the keyless data is unavailable)." }
    const v4 = round(v, 4)
    if (v <= UNLOCK_BENIGN) return { ...c, value: v4, tier: "pass", plainReason: "Little token supply unlocks in the next 30 days — no meaningful near-term dilution overhang." }
    if (v > UNLOCK_HEAVY) return { ...c, value: v4, tier: "fail", plainReason: "A large share of token supply unlocks in the next 30 days — a heavy near-term dilution overhang that can crush the reward token." }
    return { ...c, value: v4, tier: "caution", plainReason: "A moderate token unlock lands in the next 30 days — some near-term dilution overhang." }
  }

  // ── AXIS 7 — COUNTERPARTY / MATURITY SCREEN (Deepening Phase 4 + Crown-Jewel Phase 3 dependency): a COARSE STRUCTURAL
  // screen — pool AGE (recorded history span) · SIZE (TVL) · DEPENDENCY (# of protocols the yield relies on) — NOT a
  // contract audit (deep contract analysis is PARKED, the Sentinel IR). Dependency is now SCORED (X-DEP, D5), no longer a
  // non-scoring note: a single, transparent dependency (dep ≤ 1) is the clean baseline; a STACKED strategy (dep ≥ 3) adds
  // hidden counterparty/attack surface → a hard flag folded into the tier. Applies to a yield pool; for a delta-neutral
  // perp venue the structural screen is PARKED (not-applicable). It never over-claims 'audited' / 'safe'. ──
  export function counterpartyScreenRow(f: PoolFacts): AxisRow {
    const c = { axis: "counterparty" as const, name: "counterparty / maturity (structural screen — NOT a contract audit)", threshold: `age ≥ ${CP_AGE_MATURE_DAYS}d · size ≥ $${CP_SIZE_ESTABLISHED_USD / 1e6}M · deps ≤ ${CP_DEP_SINGLE}`, comparator: null, flagship: false, material: true, provenanceRef: f.provenanceRef }
    if (verticalOf(f) === "delta-neutral") return notApplicable("counterparty", c.name, "A perp venue's structural age/size screen is not built this sprint (parked) — not a contract audit either way.", f.provenanceRef)
    const age = f.ageDays ?? null, size = f.sizeUsd ?? null, dep = f.depProtocols ?? null
    const caveat = "This is a coarse structural screen (age · size · dependency), NOT a contract audit — it says nothing about the code; deep contract analysis is parked."
    if (age === null || size === null) return { ...c, value: "n/a", tier: "unverified", plainReason: `We can't confirm the pool's age or size yet. ${caveat}` }
    // the plain (Simple) register stays QUALITATIVE — a depositor reads words; the age/size/deps numbers live in the row
    // VALUE (the Pro register). (A PART-E depositor finding: raw age/size had leaked into the plain register.)
    const v = `age ${Math.round(age)}d · size $${(size / 1e6).toFixed(1)}M${dep !== null ? ` · deps ${dep}` : ""}`
    const mature = age >= CP_AGE_MATURE_DAYS, young = age < CP_AGE_YOUNG_DAYS
    const established = size >= CP_SIZE_ESTABLISHED_USD, dust = size < CP_SIZE_DUST_USD
    const stacked = dep !== null && dep >= CP_DEP_STACKED // a stacked-dependency hard flag (extra counterparty surface)
    const hardFlags = [young, dust, stacked].filter(Boolean).length // young · dust · stacked-deps are the three hard flags
    const depNote = stacked ? ", and it stacks several protocol dependencies (extra counterparty surface)" : dep !== null && dep <= CP_DEP_SINGLE ? ", with a single, transparent protocol dependency" : ""
    // pass ONLY when mature AND established AND not stacked (a stacked dependency withholds a clean pass)
    if (mature && established && !stacked) return { ...c, value: v, tier: "pass", plainReason: `Structural screen: this pool is mature and well-sized${depNote}. ${caveat}` }
    // two or more hard flags → a real structural risk (young+dust, or either + stacked dependencies)
    if (hardFlags >= 2) { const flags = [young ? "young" : "", dust ? "dust-sized" : "", stacked ? "stacked across several protocol dependencies" : ""].filter(Boolean).join(" + "); return { ...c, value: v, tier: "fail", plainReason: `Structural screen: this pool has multiple structural flags (${flags}) — a real structural risk. ${caveat}` } }
    // exactly one hard flag, or a middling band → some structural risk
    return { ...c, value: v, tier: "caution", plainReason: `Structural screen: this pool is ${young ? "young" : mature ? "mature" : "middling in age"} and ${dust ? "dust-sized" : established ? "well-sized" : "mid-sized"}${stacked ? ", and stacks several protocol dependencies" : ""} — some structural risk. ${caveat}` }
  }

  export function rows(f: PoolFacts): AxisRow[] {
    // a delta-neutral funding strategy is scored on the funding-regime axis (the yield/TVL/peg/liquidity axes are a yield
    // pool's, not applicable); a yield pool is scored on the yield axes + the deepening risk axes, each rendering
    // `not-applicable` where it doesn't apply to the vertical. The verdict falls out of whichever set is material.
    return f.deltaNeutral ? [fundingRegimeRow(f)] : [yieldRealityRow(f), tvlTrendRow(f), pegRow(f), liquidityDepthRow(f), unlockOverhangRow(f), counterpartyScreenRow(f)]
  }

  // ── THE VERDICT DERIVATION — machine-derived from the rows; UNVERIFIED is an honest gap, never a disguised pass ──
  export interface Derived { verdict: Verdict; summary: string; failing: string[] }
  export function deriveVerdict(rs: AxisRow[], reality: Reality): Derived {
    const material = rs.filter((r) => r.material)
    const fails = material.filter((r) => r.tier === "fail")
    const cautions = material.filter((r) => r.tier === "caution")
    const unverif = material.filter((r) => r.tier === "unverified")
    const flagship = material.find((r) => r.flagship)
    // UNVERIFIED DOMINATES a definitive verdict (the firewall / S7): on SAMPLE (placeholder) data, or when the flagship
    // axis is uncomputable, or when > half the material axes are uncomputable, NO SOLID/AVOID is honest — we can't
    // confirm anything. A SAMPLE "fail" is not a verified fail; issuing AVOID on it would dress SAMPLE as a real judgment.
    if (reality === "SAMPLE" || (flagship && flagship.tier === "unverified") || unverif.length * 2 > material.length)
      return { verdict: "UNVERIFIED", failing: unverif.map((r) => r.axis), summary: `UNVERIFIED — we can't confirm this yet: ${reality === "SAMPLE" ? "the data is SAMPLE (not live-verified). " : ""}${unverif.map((r) => r.plainReason).join(" ")}`.trim() }
    if (fails.length) return { verdict: "AVOID", failing: fails.map((r) => r.axis), summary: `AVOID — ${fails.map((r) => r.plainReason).join(" ")}` }
    if (cautions.length || unverif.length) return { verdict: "CAUTION", failing: [...cautions, ...unverif].map((r) => r.axis), summary: `CAUTION — ${[...cautions, ...unverif].map((r) => r.plainReason).join(" ")}` }
    return { verdict: "SOLID", failing: [], summary: "SOLID — this yield looks real: it is mostly durable base yield, deposits are steady, and any stablecoin leg is holding its peg." }
  }

  // ── THE TWO REGISTERS (X-ONE) — both render from the ONE set of rows ──
  // the plain (Simple) register: the derived summary + each axis's qualitative reason. Consumer-facing.
  export function plainRegister(rs: AxisRow[], d: Derived): string {
    const icon = (t: Tier) => (t === "pass" ? "✓" : t === "caution" ? "!" : t === "fail" ? "✗" : t === "not-applicable" ? "–" : "?")
    return [d.summary, ...rs.map((r) => `  ${icon(r.tier)} ${r.name}: ${r.plainReason}`)].join("\n")
  }
  // map the axis rows → the WHY fact-table schema so the existing quantitative renderer + consistency apply (explain.ts).
  export function toFactRows(rs: AxisRow[]): Explain.FactRow[] {
    return rs.map((r) => ({
      id: r.axis, name: r.name, value: r.value, threshold: r.threshold, comparator: r.comparator,
      outcome: r.tier === "pass" ? "pass" : r.tier === "unverified" ? "n/a" : r.tier === "fail" || r.tier === "caution" ? "fail" : "info",
      contribution: !r.material ? "context" : r.tier === "pass" ? "bounding" : "deciding",
      provenanceRef: r.provenanceRef,
    }))
  }
  // the quantitative (Pro) register — exact metric · threshold · outcome for every material axis (reuses explain.ts).
  export function quantRegister(rs: AxisRow[]): string {
    return Explain.quantitative({ rows: toFactRows(rs) })
  }

  // ── THE CONSISTENCY CHECK (X-ONE) — the two registers cannot disagree; a flattering hand-written verdict is caught ──
  const CONSOLING = [/almost/i, /so close/i, /nearly/i, /just barely (safe|fine|ok)/i, /don'?t worry/i, /perfectly safe/i, /guaranteed/i, /risk-free/i]
  export function consistency(claimedVerdict: Verdict, plain: string, rs: AxisRow[], reality: Reality): { ok: boolean; violations: string[] } {
    const violations: string[] = []
    const d = deriveVerdict(rs, reality)
    // 1. the verdict MUST be the machine-derived verdict (a hand-written flattering summary is caught)
    if (claimedVerdict !== d.verdict) violations.push(`claimed verdict ${claimedVerdict} ≠ the derived verdict ${d.verdict} (the verdict must fall out of the rows, never be hand-written)`)
    // 2. every failing/cautioning material axis must be NAMED in the plain register (no hidden failure — AVOID/CAUTION names its rows)
    for (const r of rs.filter((r) => r.material && (r.tier === "fail" || r.tier === "caution"))) {
      const key = r.axis === "yield-reality" ? /reward|yield|emission/i : r.axis === "tvl-trend" ? /deposit|tvl|money/i : r.axis === "funding-regime" ? /funding|carry/i : r.axis === "liquidity-depth" ? /liquid|slippage|exit|thin|shallow|depth/i : r.axis === "unlock-overhang" ? /unlock|emission|dilut|overhang|supply/i : r.axis === "counterparty" ? /young|dust|new|counterpart|age|size|structural|small|depend|stacked/i : /peg|depeg|\$1/i
      if (!key.test(plain)) violations.push(`the ${r.tier} on "${r.axis}" is not named in the plain register (a failing axis must be surfaced, not hidden)`)
    }
    // 3. UNVERIFIED must render as a gap, never dressed as a pass (the firewall)
    if (d.verdict === "UNVERIFIED" && !/can'?t confirm|unverified|not.*(verified|confirm)|sample/i.test(plain)) violations.push("UNVERIFIED is not rendered as an honest gap (a hidden/relabeled insufficiency is a Halt)")
    // 4. no consoling / false-comfort phrase
    for (const c of CONSOLING) if (c.test(plain)) violations.push(`consoling / false-comfort phrase present: ${c}`)
    return { ok: violations.length === 0, violations }
  }

  // ── THE OPTIONAL LLM PARAPHRASE (X-DETERM) — the LLM phrases the plain register ONLY, behind the groundedness verifier
  // AND a verdict/tier guard: any unmatched number/embellishment (explain.ts) OR a paraphrase asserting a DIFFERENT
  // verdict word is rejected WHOLESALE — the deterministic text stands. The LLM can never move the honest picture.
  const VERDICTS: Verdict[] = ["SOLID", "CAUTION", "AVOID", "UNVERIFIED"]
  export interface Paraphraser { rephrase(plain: string, factRows: Explain.FactRow[]): string }
  export function paraphraseGated(plain: string, rs: AxisRow[], derived: Verdict, provider: Paraphraser): { rendered: string; aiPhrased: boolean; rejected: boolean; reasons: string[] } {
    const factRows = toFactRows(rs)
    let out: string
    try { out = provider.rephrase(plain, factRows) } catch { return { rendered: plain, aiPhrased: false, rejected: true, reasons: ["provider unavailable — deterministic fallback"] } }
    const g = Explain.verifyGroundedness(out, { rows: factRows })
    const reasons = [...g.reasons]
    // the verdict guard: the paraphrase may NOT assert a verdict word other than the derived one (the LLM cannot move it)
    for (const w of VERDICTS) if (w !== derived && new RegExp(`\\b${w}\\b`).test(out)) reasons.push(`paraphrase asserts a different verdict "${w}" (derived is ${derived}) — the LLM may not touch the verdict`)
    if (reasons.length) return { rendered: plain, aiPhrased: false, rejected: true, reasons } // reject wholesale, deterministic fallback
    return { rendered: `${out}\n[ AI-phrased · verified against the scorecard's own facts ]`, aiPhrased: true, rejected: false, reasons: [] }
  }

  // ── the top-level score ──
  export interface Scored { facts: PoolFacts; rows: AxisRow[]; verdict: Verdict; summary: string; failing: string[]; plain: string; quant: string; factRows: Explain.FactRow[] }
  export function score(f: PoolFacts): Scored {
    const rs = rows(f)
    const d = deriveVerdict(rs, f.reality)
    return { facts: f, rows: rs, verdict: d.verdict, summary: d.summary, failing: d.failing, plain: plainRegister(rs, d), quant: quantRegister(rs), factRows: toFactRows(rs) }
  }
}
