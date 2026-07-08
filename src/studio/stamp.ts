/**
 * ORGΛNON — THE STAMP: the opt-in overfit stress test (Crown-Jewel Phase 4; Rule X-OPTIN, X-KEEP, X-DETERM). The dormant
 * crown jewel — the frozen, byte-pinned, anti-PBO GO/NO-GO adjudicator — returns as an OPT-IN call-site: it INVOKES the
 * byte-untouched attest core (`Studio.submit`, reactivation NOT modification) on a pool's recorded return series and
 * renders a DISTINCT verdict (`GO`/`NO-GO`/`INSUFFICIENT`), orthogonal to and never conflated with the scorecard's
 * `SOLID`/`CAUTION`/`AVOID`/`UNVERIFIED`.
 *
 *   · OFF THE MASS PATH (S16): the scorecard never calls this — the Stamp runs only in the Pro drawer, the `stamp` verb,
 *     or the Ask VALIDATION intent. Deflation is armed ONLY here.
 *   · HONEST ON SHORT HISTORY (S17): < MIN_OBSERVATIONS recorded points, or no measurable variation → INSUFFICIENT (a
 *     forward clock, not a failure) — NEVER a fabricated GO.
 *   · SIDECAR / HISTORY OPTIONAL (A′#8): no recorded series (a fresh clone / SAMPLE / an unrecorded pool) → UNAVAILABLE,
 *     honestly — never a crash. The mass tool runs Stamp-free.
 *   · DETERMINISTIC (X-DETERM): a fixed timestamp base; the same recorded series → the same verdict.
 *
 * Zero frozen bytes move: this file INVOKES `Studio.submit` (the frozen write-then-invoke path); the 6 `.py` + `loop.ts`
 * are byte-untouched (`core_byte_identity` green), and the verdict-differential goldens reproduce (X-KEEP).
 *
 * V4 RECONCILIATION (naming): the Stamp's `Studio.submit` seam is NOT a second engine — it is the SAME byte-pinned core
 * the `core_byte_identity` frozen-seven check covers. `Studio.submit → Studio.adjudicateRegistered → AttestAdjudicate.
 * adjudicate` runs the 6 computational-core `.py` + `loop.ts` (the frozen seven) verbatim — the identical write-then-
 * invoke path an outside submitter uses. The Stamp REGISTERS a trial and INVOKES; it never edits, softens, or overrides
 * the verdict the core returns. So "the Stamp invokes the frozen core" and "the frozen seven are byte-untouched" are one
 * fact, not two: after any Stamp run (incl. the decay + ICIR sub-scores this sprint adds), the frozen seven stay
 * git-clean and the goldens reproduce (proven by `honesty_stamp`'s X-KEEP wall + `core_byte_identity`).
 */
import { Ledger } from "../ledger/ledger"
import { Studio } from "./adjudicate"
import { DataPlane } from "../dataplane/store"
import { Explain } from "../analytics/explain"
import { Decay } from "./decay"
import { Icir } from "./icir"

export namespace Stamp {
  export const MIN_OBSERVATIONS = 60 // < 60 recorded return points → INSUFFICIENT (cannot stress-test a short series)
  export const TS_BASE = Date.parse("2026-07-05T00:00:00Z") // the fixed base — the Stamp is DETERMINISTIC (Rule VIII)
  export type StampVerdict = "GO" | "NO-GO" | "INSUFFICIENT" | "UNAVAILABLE"

  export interface StampResult {
    available: boolean // false → no recorded series to stress-test (UNAVAILABLE)
    verdict: StampVerdict // GO / NO-GO / INSUFFICIENT (or UNAVAILABLE) — ORTHOGONAL to the scorecard's verdict
    terminalState: Explain.TerminalState | "UNAVAILABLE"
    dsr: number | null // the deflated significance at the declared trial count
    familyN: number // the deflation basis (n counted attempts)
    nObs: number // the recorded observations stress-tested
    reproHash: string | null
    reason: string // a plain, honest one-liner (names the track-record verdict, never the scorecard's)
    facts: Explain.VerdictFacts | null // the WHY-panel facts (for the drawer + the Ask groundedness gate)
    // ── the opt-in track-record DEPTH sub-scores (Persistence; X-DECAY / X-ICIR). REASON/BASIS refinements, NEVER a new
    // verdict word, NEVER a scorecard axis — they make a CLEAN GO harder to earn. null when the Stamp is INSUFFICIENT /
    // UNAVAILABLE (no scored series). ICIR is added in Phase 4; the drawer + Ask surface both in Phase 5. ──
    decay: Decay.DecayResult | null // the signal-shelf-life sub-score (serial persistence of the recorded return signal)
    icir: Icir.IcirResult | null // the within-strategy temporal-consistency sub-score (mean/std of the recorded periodic edges)
    cleanGo: boolean // a GO that ALSO clears BOTH depth hurdles (a traceable half-life AND acceptable ICIR consistency) — else fenced
  }

  // map the frozen attest engine's verdict → the Stamp's 3-name enum, HONESTLY (never a factual mis-statement): a GO or a
  // CONDITIONAL both SURVIVE the anti-PBO deflation (dsr ≥ bar) → the Stamp's GO ("survives"); a CONDITIONAL is a post-hoc
  // read (not pre-registered) and the reason discloses that fence. NO-GO ("does not survive") maps only from a real NO-GO
  // — never from a CONDITIONAL (that would falsely claim the record failed). INSUFFICIENT/MALFORMED/BLOCKED → INSUFFICIENT.
  export function stampVerdictOf(raw: string): StampVerdict {
    if (raw === "GO" || raw === "CONDITIONAL") return "GO"
    if (raw === "NO-GO") return "NO-GO"
    return "INSUFFICIENT" // INSUFFICIENT-EVIDENCE / MALFORMED / BLOCKED
  }

  // derive a point-in-time daily return series from a recorded chart series: the realized daily yield accrual
  // ((apyBase + apyReward)/100/365) at each recorded point (real recorded apy varies day to day → real variation). Only
  // points that carry a recorded apyBase count; missing apy is skipped, never fabricated.
  export function poolReturnsFromSeries(s: DataPlane.Series | null): number[] {
    if (!s || !s.points.length) return []
    return [...s.points]
      .sort((a, b) => a.ts - b.ts)
      .map((p) => { const b = (p.apyBase ?? null) as number | null; const r = (p.apyReward ?? null) as number | null; return b === null ? null : (b + (r ?? 0)) / 100 / 365 })
      .filter((x): x is number => x !== null && Number.isFinite(x))
  }

  // ── THE OPT-IN ADJUDICATION — run a returns series through the byte-untouched frozen attest core (Studio.submit).
  // Deflation armed HERE (a single submission — family of 1). Short history / no variation → INSUFFICIENT (never a GO). ──
  export async function stampFromReturns(returns: number[], opts?: { label?: string; provenanceRef?: string | null }): Promise<StampResult> {
    const nObs = returns.length
    const provenanceRef = opts?.provenanceRef ?? null
    if (nObs < MIN_OBSERVATIONS)
      return { available: nObs > 0, verdict: "INSUFFICIENT", terminalState: "INSUFFICIENT", dsr: null, familyN: 1, nObs, reproHash: null, facts: null, decay: null, icir: null, cleanGo: false, reason: `INSUFFICIENT — not enough recorded history to stress-test (${nObs} observation${nObs === 1 ? "" : "s"}, below the ${MIN_OBSERVATIONS}-point floor). The overfit Stamp can't tell skill from chance on a series this short — an honest forward clock, never a fabricated GO. This is a statistics verdict on the track record, orthogonal to the Reality Check.` }
    // a degenerate (flat / no measurable variation) series has no signal to stress-test → INSUFFICIENT (never a spurious
    // GO/NO-GO on a series whose std is negligible vs its mean — a relative guard, robust to floating-point mean rounding)
    const mean = returns.reduce((a, b) => a + b, 0) / nObs
    const std = Math.sqrt(returns.reduce((a, b) => a + (b - mean) ** 2, 0) / nObs)
    if (!(std > Math.abs(mean) * 1e-6 + 1e-15))
      return { available: true, verdict: "INSUFFICIENT", terminalState: "INSUFFICIENT", dsr: null, familyN: 1, nObs, reproHash: null, facts: null, decay: null, icir: null, cleanGo: false, reason: `INSUFFICIENT — the recorded yield has no measurable day-to-day variation to stress-test. The overfit Stamp renders INSUFFICIENT (never a fabricated GO on a degenerate series).` }
    // register-then-invoke through the SAME frozen path outsiders use — the Stamp adds nothing to the verdict (X-KEEP)
    const store = new Ledger.Store()
    const spec = { family: "lending-carry", policy: "static", rebalance: { trigger: "monthly" }, markets: [{ key: opts?.label ?? "stamp", weight: 1 }] }
    const v = await Studio.submit(store, { spec, authorClass: "agent", authorId: "stamp", domain: "lending", timestamp: TS_BASE, returns, barsPerYear: 365 })
    const raw = v.attestation.verdict
    const verdict = stampVerdictOf(raw)
    const terminalState: Explain.TerminalState = raw === "GO" ? "GO" : raw === "NO-GO" ? "NO-GO" : raw === "CONDITIONAL" ? "CONDITIONAL" : raw === "INSUFFICIENT-EVIDENCE" ? "INSUFFICIENT" : raw === "MALFORMED" ? "MALFORMED" : raw === "BLOCKED" ? "BLOCKED" : "NO-GO"
    const dsr = v.attestation.dsrAtDeclared ?? null
    const familyN = v.familyDeclaredNTrials
    const facts: Explain.VerdictFacts = { terminalState, verdict: raw, dsrAtDeclared: dsr, dsrThreshold: 0.95, familyDeclaredNTrials: familyN, tier: String((v.attestation as { verifiability?: string }).verifiability ?? "V0"), nObs, reality: "REAL-PIT", provenanceRef, reproHash: (v.attestation as { reproHash?: string }).reproHash ?? "" }
    // ── the DECAY sub-score (X-DECAY) — a deterministic, off-path REASON/BASIS refinement: the recorded series is REAL-PIT
    // (a SAMPLE/absent series never reaches here — stampFor returns UNAVAILABLE first), so decay scores it. A short-lived
    // (serially-random) edge WITHHOLDS a clean GO, disclosed; it NEVER flips the verdict word (a false "does not survive").
    const decay = Decay.decayHalfLife(returns)
    const decayDesc = decay.tier === "TRACEABLE"
      ? decay.atLeast ? "edge half-life persists beyond the observed window (traceable)" : `edge half-life ≈ ${decay.halfLife} periods (traceable)`
      : decay.tier === "SHORT_LIVED"
        ? decay.halfLife === 0 ? "no measurable serial persistence (short-lived)" : `edge half-life ≈ ${decay.halfLife} periods (short-lived)`
        : "edge half-life not yet measurable"
    // ── the ICIR sub-score (X-ICIR) — a deterministic, off-path WITHIN-STRATEGY temporal-consistency ratio (mean/std of the
    // recorded periodic edges), shown BESIDE the deflated-Sharpe (never replacing it). A lumpy edge TEMPERS a clean GO,
    // disclosed; it NEVER flips the verdict word. EXPLICITLY NOT a cross-sectional factor rank (the scope stated in words). ──
    const ic = Icir.icir(returns)
    const icirDesc = ic.tier === "CONSISTENT"
      ? `temporal consistency ratio ${ic.icir} (steady, within-strategy — not a cross-sectional rank)`
      : ic.tier === "LUMPY"
        ? `temporal consistency ratio ${ic.icir} (lumpy, within-strategy — not a cross-sectional rank)`
        : "temporal consistency not yet measurable"
    // a CLEAN GO needs BOTH depth hurdles: a traceable half-life AND acceptable consistency (the GO bar gets HARDER, never easier)
    const cleanGo = verdict === "GO" && decay.tier === "TRACEABLE" && ic.tier === "CONSISTENT"
    const unmet: string[] = []
    if (decay.tier !== "TRACEABLE") unmet.push("a traceable half-life (the edge is short-lived)")
    if (ic.tier !== "CONSISTENT") unmet.push("steady consistency (the edge is lumpy)")
    const base =
      verdict === "GO"
        ? terminalState === "CONDITIONAL"
          ? `GO (conditional) — the recorded track record SURVIVES the anti-PBO deflation (deflated significance ${dsr?.toFixed(3)} ≥ 0.95 over ${familyN} counted attempt${familyN === 1 ? "" : "s"}), but as a POST-HOC read it was not pre-registered, so a clean GO is fenced off — it is conditional on independent data verification. Survives the statistics; NOT a safety verdict, and NOT the scorecard's SOLID.`
          : `GO — the recorded track record SURVIVES the anti-PBO deflation (deflated significance ${dsr?.toFixed(3)} ≥ 0.95 over ${familyN} counted attempt${familyN === 1 ? "" : "s"}). A GO is a floor on doubt about the track record's statistical robustness — NOT a safety verdict, and NOT the scorecard's SOLID.`
        : verdict === "NO-GO"
          ? `NO-GO — the recorded track record does NOT survive the anti-PBO deflation (its evidence is weaker than the bar once the search is charged). A statistics verdict on the track record, orthogonal to the scorecard.`
          : `INSUFFICIENT — the engine can't yet distinguish this track record's skill from chance (a forward clock, not a failure). Honest on short-history DeFi, never a fabricated GO.`
    // fold BOTH depth sub-scores into the GO/NO-GO reason (basis detail, beside the deflated-Sharpe). A clean GO needs a
    // traceable half-life AND steady consistency; any unmet hurdle FENCES the GO (the verdict word stands, the caveat disclosed).
    const reason = verdict === "GO"
      ? `${base} Track-record depth (opt-in): ${decayDesc}; ${icirDesc}. ${cleanGo ? "Both depth hurdles for a clean GO — a traceable half-life and steady consistency — are cleared." : `A clean GO also needs ${unmet.join(" and ")} — ${unmet.length > 1 ? "these hurdles are" : "that hurdle is"} NOT cleared; the GO stands on the deflation alone, the caveat disclosed.`}`
      : verdict === "NO-GO"
        ? `${base} Track-record depth (opt-in): ${decayDesc}; ${icirDesc}.`
        : base
    return { available: true, verdict, terminalState, dsr, familyN, nObs, reproHash: facts.reproHash || null, reason, facts, decay, icir: ic, cleanGo }
  }

  // resolve a pool's recorded chart series → the Stamp. Absent / SAMPLE (a fresh clone) → UNAVAILABLE — the Stamp is
  // opt-in and off the mass path, so the Reality Check verdict is UNAFFECTED (the drawer simply says "unavailable").
  export async function stampFor(poolKey: string, adapter: DataPlane.Adapter = DataPlane.snapshotAdapter): Promise<StampResult> {
    const chartKey = poolKey.replace(":pool:", ":chart:")
    const s = adapter.fetchSeries(chartKey) ?? adapter.fetchSeries(poolKey)
    const provenanceRef = s?.provenance?.contentSha ?? null
    const returns = poolReturnsFromSeries(s)
    if (!returns.length)
      return { available: false, verdict: "UNAVAILABLE", terminalState: "UNAVAILABLE", dsr: null, familyN: 0, nObs: 0, reproHash: null, facts: null, decay: null, icir: null, cleanGo: false, reason: `The Stamp is unavailable — no recorded return history for this pool to stress-test (a fresh clone, a SAMPLE pool, or an unrecorded pool). Re-capture keyless to enable the overfit Stamp. It is opt-in and off the mass path; the Reality Check verdict is unaffected.` }
    return stampFromReturns(returns, { label: poolKey.slice(0, 24), provenanceRef })
  }
}
