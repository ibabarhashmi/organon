/**
 * ORGΛNON — THE DECAY HALF-LIFE GATE (Persistence Phase 3; Rule X-DECAY, X-DETERM). A pure, DETERMINISTIC signal-shelf-
 * life check for the opt-in Stamp — OFF THE MASS PATH. From a strategy's RECORDED return series it computes the per-lag
 * EDGE — the sample autocorrelation `ρ(k)` at each pinned lag k — and fits the textbook exponential decay `ρ(k) =
 * ρ₀·exp(-k/τ)` (an AR(1)'s ACF is EXACTLY this), deriving the half-life `t½ = τ·ln2` (periods for the edge to halve).
 * Gate: `t½ ≥ HALFLIFE_FLOOR` → TRACEABLE (a persistent, traceable time-structure); `< floor` → SHORT_LIVED (a fee-
 * chasing / serially-random signal — a clean GO is withheld). Honest: `< MIN_OBSERVATIONS`, a degenerate/flat series, or
 * too few fittable lags → INSUFFICIENT (never a fabricated half-life); a SAMPLE-fed series → not scored.
 *
 * HONEST SCOPE: this measures the SERIAL PERSISTENCE of the recorded return signal (is there a traceable time-structure,
 * or is it noise you pay fees to chase?), NOT the average carry — a steady constant yield's carry is the yield-reality
 * axis's job on the mass path (a complementary lens). NO model, NO random, NO network: a pure function of the record.
 */
export namespace Decay {
  export const LAG_SET = [1, 2, 3, 5, 10] as const // the pinned lags at which the edge (autocorrelation) is measured
  export const HALFLIFE_FLOOR = 5 // t½ ≥ 5 periods → TRACEABLE; < 5 → SHORT_LIVED (a clean GO withheld) — pinned
  export const MIN_OBSERVATIONS = 30 // < 30 recorded points → INSUFFICIENT (cannot estimate the ACF / fit a half-life honestly)
  export const EPS = 1e-4 // a hard positivity floor for an autocorrelation entering the fit (below it: ≈ zero)
  export const SIGNIF_Z = 2 // the ~95% BARTLETT white-noise band multiplier: an autocorrelation counts as a real edge only
  // if it exceeds Z/√n (the band inside which i.i.d. noise fluctuates) — so a serially-random series is NOT read as signal
  const MIN_PAIRS = 8 // a lag is used only with ≥ 8 overlapping pairs (an honest autocorrelation needs enough overlap)

  export type DecayTier = "TRACEABLE" | "SHORT_LIVED" | "INSUFFICIENT"
  export interface DecayResult {
    tier: DecayTier
    halfLife: number | null // periods (rounded 1dp); null when INSUFFICIENT; 0 when serially-random (no persistence)
    atLeast: boolean // true → the edge persists across the observed window (half-life ≥ the reported value — a floor)
    floor: number // HALFLIFE_FLOOR (the pinned traceable threshold)
    nObs: number
    fit: { lags: number[]; rho: number[]; rate: number | null; points: number } // the fit disclosed (X-DECAY: no black box)
    reason: string // a plain one-liner (grounding-safe: states only the half-life value and/or the floor)
  }

  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
  // the sample autocorrelation at lag k (denominator = the lag-0 autocovariance — the standard biased ACF normalization)
  function autocorr(r: number[], mu: number, denom: number, k: number): number {
    let s = 0
    for (let t = 0; t + k < r.length; t++) s += (r[t] - mu) * (r[t + k] - mu)
    return s / denom
  }
  const insufficient = (nObs: number, fit: DecayResult["fit"], reason: string): DecayResult => ({ tier: "INSUFFICIENT", halfLife: null, atLeast: false, floor: HALFLIFE_FLOOR, nObs, fit, reason })

  // ── the pure gate — (recordedSeries) → SubScore. Deterministic; identical inputs → a byte-identical result. ──
  export function decayHalfLife(returns: number[], opts?: { lagSet?: readonly number[]; reality?: "REAL" | "SAMPLE" | string }): DecayResult {
    const lagSet = [...(opts?.lagSet ?? LAG_SET)].filter((k) => k >= 1).sort((a, b) => a - b)
    const nObs = returns.length
    const empty = { lags: [] as number[], rho: [] as number[], rate: null as number | null, points: 0 }
    // (d) from the record only — a SAMPLE-fed series is NOT scored as real
    if (opts?.reality === "SAMPLE") return insufficient(nObs, empty, "INSUFFICIENT — the recorded series is SAMPLE (not REAL-PIT); the edge half-life is not scored on unrecorded data.")
    // (c) honest on short history — below the floor, no fabricated half-life
    if (nObs < MIN_OBSERVATIONS) return insufficient(nObs, empty, `INSUFFICIENT — only ${nObs} recorded point${nObs === 1 ? "" : "s"} (below the ${MIN_OBSERVATIONS}-point floor); too short to fit an edge half-life honestly.`)
    const mu = mean(returns)
    const denom = returns.reduce((a, b) => a + (b - mu) ** 2, 0)
    const std = Math.sqrt(denom / nObs)
    // a scale-relative degenerate guard (robust to floating-point mean rounding on a near-constant series — like the Stamp)
    if (!(std > Math.abs(mu) * 1e-6 + 1e-15)) return insufficient(nObs, empty, "INSUFFICIENT — the recorded series is degenerate (no measurable variation); an edge half-life cannot be estimated (never a fabricated fit).")
    // measure the per-lag edge (autocorrelation) at each pinned lag with enough overlap
    const lags: number[] = [], rho: number[] = []
    for (const k of lagSet) if (nObs - k >= MIN_PAIRS) { lags.push(k); rho.push(autocorr(returns, mu, denom, k)) }
    if (lags.length < 2) return insufficient(nObs, { lags, rho, rate: null, points: 0 }, `INSUFFICIENT — too few usable lags (${lags.length}) to fit a decay at the pinned lag set; the recorded history is too short.`)
    // the log-linear fit over the SIGNIFICANT, decaying autocorrelations: ln ρ(k) = ln ρ₀ − k/τ (slope = −1/τ). Only an
    // autocorrelation ABOVE the Bartlett white-noise band (Z/√n) counts — i.i.d. noise fluctuating within the band is NOT
    // a persistent edge (else a serially-random series would fabricate a half-life from noise). A hard EPS floor too.
    const band = Math.max(EPS, SIGNIF_Z / Math.sqrt(nObs))
    const px: number[] = [], py: number[] = []
    for (let i = 0; i < lags.length; i++) if (rho[i] > band) { px.push(lags[i]); py.push(Math.log(rho[i])) }
    if (px.length < 2) {
      // no positive serial persistence at the pinned lags → the recorded signal is serially ~random → SHORT_LIVED
      // (a confident finding on a sufficient, non-degenerate series — a fee-chase, not a traceable edge). half-life ≈ 0.
      return { tier: "SHORT_LIVED", halfLife: 0, atLeast: false, floor: HALFLIFE_FLOOR, nObs, fit: { lags, rho, rate: null, points: px.length }, reason: "SHORT_LIVED — the recorded return signal shows no measurable serial persistence: a fee-chase rather than a traceable edge. A clean GO is withheld." }
    }
    const xbar = mean(px), ybar = mean(py)
    let sxy = 0, sxx = 0
    for (let i = 0; i < px.length; i++) { sxy += (px[i] - xbar) * (py[i] - ybar); sxx += (px[i] - xbar) ** 2 }
    const slope = sxx > 0 ? sxy / sxx : 0
    if (slope >= 0) {
      // the autocorrelation is flat/rising across the window → the edge persists beyond the observed lags → TRACEABLE
      // (half-life ≥ the floor; reported as a floor, atLeast=true). An honest observation, not a fabricated long fit.
      return { tier: "TRACEABLE", halfLife: HALFLIFE_FLOOR, atLeast: true, floor: HALFLIFE_FLOOR, nObs, fit: { lags, rho, rate: slope, points: px.length }, reason: `TRACEABLE — the recorded return signal's autocorrelation persists across the observed window (edge half-life exceeds the ${HALFLIFE_FLOOR}-period floor): a persistent, traceable time-structure.` }
    }
    const tau = -1 / slope
    const halfLife = Math.round(tau * Math.LN2 * 10) / 10 // periods for the edge to halve, 1dp (grounding-stable)
    const tier: DecayTier = halfLife >= HALFLIFE_FLOOR ? "TRACEABLE" : "SHORT_LIVED"
    const reason = tier === "TRACEABLE"
      ? `TRACEABLE — the recorded return signal's edge half-life ≈ ${halfLife} periods (≥ the ${HALFLIFE_FLOOR}-period floor): a persistent, traceable time-structure, not fee-chasing noise.`
      : `SHORT_LIVED — the recorded return signal's edge half-life ≈ ${halfLife} periods (< the ${HALFLIFE_FLOOR}-period floor): short-lived, a fee-chase rather than a traceable edge. A clean GO is withheld.`
    return { tier, halfLife, atLeast: false, floor: HALFLIFE_FLOOR, nObs, fit: { lags, rho, rate: -slope, points: px.length }, reason }
  }
}
