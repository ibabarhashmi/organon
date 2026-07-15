/**
 * ORGΛNON — THE RECKONING SPRINT (V44), Phase 2 (DD-90, D27, S193): THE STRICT BAR — COMPOSED BESIDE THE FROZEN STAMP.
 *
 * D27's "knowingly generous" Stamp is retired: a GO must clear PSR(N_eff) > 0.95 AND observed length > MinTRL (López de Prado /
 * Bailey — the literature's bar, not ours), else INSUFFICIENT. PSR(N_eff) is the PSR at the effective sample size under
 * autocorrelation (√(N_eff−1) replaces √(n−1) — DD-89, composed in the harness).
 *
 * GROUND TRUTH (the 5th refinement of the "no verdict moved" story): src/studio/stamp.ts is BYTE-FROZEN — it is one of the
 * verdict-path 7 (its sha is pinned by GroundTruth V28 / Moat V26 and asserted every battery). So the strict bar cannot be
 * WIRED INTO stampFromReturns (that would move a frozen byte, the same class of violation as editing rigor.py). It COMPOSES
 * BESIDE the frozen Stamp — exactly as EffectiveN.psrAtNeff composes beside the frozen rigor.psr: Strict.stampStrict() calls
 * the byte-frozen Stamp.stampFromReturns and applies the downgrade AFTER, in this harness module. So the frozen Stamp is
 * untouched, the mass-path bundle 9c1e7bd8 is byte-identical (the Stamp is off it anyway), and the strict bar is ARMED +
 * proven on fixtures (the strict record). D63 is OFF and realLineageCount 0 — no LIVE verdict is consumed — so the strict bar
 * fires on no live path; it is computed, versioned (stamp-strict-record.json), and ready the moment a real manifest is stamped.
 *
 * The bar can ONLY make a GO harder (GO → INSUFFICIENT); it NEVER flips a NO-GO to GO. Where the series is too short/unstable
 * to estimate τ_int (N_eff UNJUDGEABLE), the bar fails safe to INSUFFICIENT (RP-3 — never GO on a naive n).
 *
 * Pure (strict/strictRecord): deterministic, no network. stampStrict is async only because the frozen Stamp it wraps is.
 */
import { EffectiveN } from "../backtest/effectiven"
import { MinTRL } from "./mintrl"
import { Stamp } from "./stamp"

export namespace Strict {
  export const TARGET_PSR = 0.95

  export interface StrictResult {
    verdict: "GO" | "INSUFFICIENT"
    psrNaive: number
    psrCorrected: number // PSR at N_eff — the honest, deflated confidence
    nEff: number
    tauInt: number
    minTRL: number | null
    lenOverMinTRL: boolean // observed length > MinTRL
    psrClears: boolean // PSR(N_eff) > 0.95
    judgeable: boolean // the N_eff estimate is stable (else UNJUDGEABLE → INSUFFICIENT)
    reasons: string[]
    detail: string
  }
  // Strict.strict(returns) — the literature's bar, standalone. GO iff PSR(N_eff)>0.95 ∧ len>MinTRL ∧ N_eff judgeable.
  export function strict(returns: number[]): StrictResult {
    const p = EffectiveN.psrAtNeff(returns, 0)
    const mtrl = MinTRL.minTRL(returns)
    const psrClears = p.judgeable && Number.isFinite(p.psrCorrected) && p.psrCorrected > TARGET_PSR
    const lenOverMinTRL = mtrl.minTRL !== null && returns.length > mtrl.minTRL
    const judgeable = p.judgeable
    const go = judgeable && psrClears && lenOverMinTRL
    const reasons: string[] = []
    if (!judgeable) reasons.push(`N_eff UNJUDGEABLE (n ${p.n}, τ_int ${p.tauInt.toFixed(1)}) — too short/unstable to certify at 95%; fails safe to INSUFFICIENT`)
    if (judgeable && !psrClears) reasons.push(`PSR(N_eff) ${p.psrCorrected.toFixed(3)} ≤ ${TARGET_PSR} — once the √(n−1) confidence is corrected for autocorrelation (τ_int ${p.tauInt.toFixed(1)}, N_eff ${p.nEff.toFixed(0)} of ${p.n}), the evidence no longer clears the literature's bar`)
    if (judgeable && !lenOverMinTRL) reasons.push(mtrl.minTRL === null ? `the observed Sharpe does not exceed the benchmark — no track-record length makes it significant` : `observed length ${returns.length} ≤ MinTRL ${Math.ceil(mtrl.minTRL)} — the track record is shorter than López de Prado's minimum`)
    return {
      verdict: go ? "GO" : "INSUFFICIENT",
      psrNaive: p.psrNaive, psrCorrected: p.psrCorrected, nEff: p.nEff, tauInt: p.tauInt,
      minTRL: mtrl.minTRL, lenOverMinTRL, psrClears, judgeable, reasons,
      detail: go
        ? `STRICT GO — PSR(N_eff) ${p.psrCorrected.toFixed(3)} > ${TARGET_PSR} AND length ${returns.length} > MinTRL ${mtrl.minTRL === null ? "—" : Math.ceil(mtrl.minTRL)} (the literature's bar, at the corrected effective-N ${p.nEff.toFixed(0)})`
        : `STRICT INSUFFICIENT — ${reasons.join("; ")} (López de Prado's bar, not ours — INSUFFICIENT is the honest name for 'not enough evidence yet', never a failure)`,
    }
  }

  // ── THE COMPOSITION (beside the frozen Stamp) — run the byte-frozen Stamp, then apply the strict downgrade AFTER. A frozen
  // GO on autocorrelated input becomes INSUFFICIENT; a NO-GO stays NO-GO; INSUFFICIENT/UNAVAILABLE pass through. The frozen
  // Stamp.stampFromReturns is UNTOUCHED (byte-identical); this wrapper is the D27-strict verdict a caller consumes. ──
  export interface StrictStampResult extends Stamp.StampResult { strict: StrictResult; strictDowngraded: boolean }
  export async function stampStrict(returns: number[], opts?: { label?: string; provenanceRef?: string | null }): Promise<StrictStampResult> {
    const base = await Stamp.stampFromReturns(returns, opts)
    // the strict bar only applies where the frozen Stamp actually scored a series (GO/NO-GO/INSUFFICIENT); UNAVAILABLE passes through
    if (base.verdict === "UNAVAILABLE" || base.nObs < Stamp.MIN_OBSERVATIONS) return { ...base, strict: strict(returns), strictDowngraded: false }
    const s = strict(returns)
    const downgraded = base.verdict === "GO" && s.verdict === "INSUFFICIENT"
    if (!downgraded) return { ...base, strict: s, strictDowngraded: false }
    return {
      ...base,
      verdict: "INSUFFICIENT",
      terminalState: "INSUFFICIENT",
      reason: `INSUFFICIENT (D27 strict bar) — the recorded track record SURVIVES the frozen anti-PBO deflation, but does NOT clear the literature's strict bar once the confidence is corrected for autocorrelation: ${s.detail}. The old "knowingly generous" GO is retired — this is López de Prado's bar, not ours, and INSUFFICIENT is the honest name for "not enough evidence yet" (not a failure). A statistics verdict on the track record, orthogonal to the Reality Check.`,
      cleanGo: false,
      strict: s,
      strictDowngraded: true,
    }
  }

  // ── THE STRICT-BAR BEFORE/AFTER RECORD (RP-1/RP-2, the scoped diff manifest) — a pinned set of representative series graded
  // BOTH ways (naive √(n−1) vs the strict √(N_eff−1)), with the GO→INSUFFICIENT flips + the synthetic POSITIVE CONTROL that
  // still clears the bar → GO (RP-2: the Stamp is proven capable of BOTH verdicts). The mass-path bundle 9c1e7bd8 is
  // byte-identical (the Stamp is off it, F-1); this versions the STRICT bar's OWN change. ──
  export interface StrictFixture { name: string; n: number; psrNaive: number; psrCorrected: number; nEff: number; tauInt: number; naiveWouldPass: boolean; strictVerdict: "GO" | "INSUFFICIENT"; flipped: boolean; note: string }
  export interface StrictRecord { fixtures: StrictFixture[]; positiveControlGO: boolean; flips: number; barSource: string; targetPSR: number; note: string }
  // a deterministic normal series (LCG + Box–Muller — clone-stable, no Math.random; a fresh clone reproduces to the bit).
  function demoSeries(n: number, mu: number, sd: number, rho: number, seed: number): number[] {
    let s = seed >>> 0
    const rand = () => { s = (1103515245 * s + 12345) >>> 0; return s / 0xffffffff }
    const normal = () => { const u1 = Math.max(rand(), 1e-12), u2 = rand(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) }
    const out: number[] = []
    let cur = 0
    for (let t = 0; t < n; t++) { cur = rho * cur + normal() * sd; out.push(mu + (rho > 0 ? cur : normal() * sd)) }
    return out
  }
  export function strictRecord(): StrictRecord {
    const specs: { name: string; series: number[]; note: string }[] = [
      { name: "positive-control (low-autocorr, genuine signal, n=400)", series: demoSeries(400, 0.0012, 0.01, 0, 20260716), note: "a synthetic series with real, near-white signal — the RP-2 positive control; it MUST clear the strict bar → GO" },
      { name: "ar1-persistent (ρ=0.95, n=1600)", series: EffectiveN.demoAr1(), note: "the clone-stable autocorrelated demonstration — naive √(n−1) says near-certain; the strict √(N_eff−1) deflates below the bar → INSUFFICIENT (the overstatement made concrete)" },
      { name: "near-white-weak (low Sharpe, n=300)", series: demoSeries(300, 0.0001, 0.01, 0, 20260717), note: "a genuinely weak edge — neither naive nor strict passes; INSUFFICIENT both ways (no flip)" },
    ]
    const fixtures: StrictFixture[] = specs.map((sp) => {
      const st = strict(sp.series)
      const naiveWouldPass = Number.isFinite(st.psrNaive) && st.psrNaive > TARGET_PSR
      return { name: sp.name, n: sp.series.length, psrNaive: st.psrNaive, psrCorrected: st.psrCorrected, nEff: st.nEff, tauInt: st.tauInt, naiveWouldPass, strictVerdict: st.verdict, flipped: naiveWouldPass && st.verdict === "INSUFFICIENT", note: sp.note }
    })
    const positiveControlGO = fixtures[0].strictVerdict === "GO"
    const flips = fixtures.filter((f) => f.flipped).length
    return {
      fixtures, positiveControlGO, flips,
      barSource: "López de Prado / Bailey — PSR > 0.95 at the corrected effective-N (N_eff = n/τ_int) AND observed length > MinTRL; NOT a home-grown threshold",
      targetPSR: TARGET_PSR,
      note: `the strict bar re-grades the fixtures: ${flips} flip(s) GO→INSUFFICIENT (the generosity made concrete — naive √(n−1) would have passed them; the strict √(N_eff−1) does not), and the synthetic positive control ${positiveControlGO ? "CLEARS the bar → GO" : "FAILS to clear the bar"} (RP-2: the machinery can say BOTH GO and INSUFFICIENT). The frozen Stamp is byte-identical (the strict bar composes beside it); the mass-path bundle 9c1e7bd8 is byte-identical (the Stamp is off it, F-1); this record versions the strict bar's OWN change.`,
    }
  }
}
