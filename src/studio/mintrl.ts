/**
 * ORGΛNON — THE MinTRL RIDER (Voice Phase 6; Rule X-DECAY/X-ICIR extended, X-DETERM). Minimum Track Record Length (Bailey
 * & López de Prado, 2012): the number of observations a track record needs before its OWN Sharpe is statistically
 * significant, given the higher moments (skew + kurtosis fatten the tail). A small, deterministic, math-mandated rider on
 * the opt-in Stamp — OFF THE MASS PATH:
 *
 *   MinTRL = 1 + [ 1 − γ3·SR̂ + (γ4−1)/4·SR̂² ] · ( Z_α / (SR̂ − SR*) )²
 *
 * where SR̂ is the observed per-observation Sharpe, SR* the benchmark (0), γ3 the skewness, γ4 the kurtosis (normal = 3),
 * Z_α the one-sided critical value. Per-observation → annualization cancels. If SR̂ ≤ SR* the Sharpe never clears the
 * benchmark → MinTRL is undefined (null) and the rider does NOT suppress (that is a genuine low/negative-Sharpe reading on
 * ample data, not a short-history one).
 *
 * The rider's job (in the Stamp): compute MinTRL FIRST; if T < MinTRL (finite), the PSR/DSR point estimate is SUPPRESSED
 * ENTIRELY (not caveated) — the drawer shows honest INSUFFICIENT + "need N more observations". NO verdict-space change
 * ({GO/NO-GO/INSUFFICIENT/UNAVAILABLE} unchanged). NO model, NO random, NO network — a pure function of the recorded series.
 */
export namespace MinTRL {
  export const Z_95 = 1.6448536269514722 // the one-sided 95% critical value (Φ⁻¹(0.95)) — pinned
  export const SR_BENCHMARK = 0 // SR* — the benchmark Sharpe the track record must beat to be worth a point estimate

  export interface MinTrlResult {
    T: number // the observation count
    sr: number | null // the observed per-observation Sharpe (null when degenerate)
    skew: number
    kurtosis: number // raw kurtosis (normal = 3)
    minTRL: number | null // the minimum track record length; null when SR̂ ≤ SR* (undefined — the Sharpe never clears)
    sufficient: boolean // T ≥ MinTRL (a finite MinTRL); false when MinTRL is null (the Sharpe never clears)
    suppress: boolean // the rider fires: MinTRL is finite AND T < MinTRL → SUPPRESS the point estimate
    needMore: number // max(0, ceil(MinTRL) − T) — "need N more observations" (0 when sufficient / not suppressed)
    trialN: number // the deflation basis logged (evaluations per subject; a single submission → 1)
    reason: string
  }

  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

  // the pure rider — (recordedReturns) → MinTrlResult. Deterministic; identical inputs → a byte-identical result.
  export function minTRL(returns: number[], opts?: { z?: number; srBenchmark?: number; trialN?: number }): MinTrlResult {
    const T = returns.length
    const z = opts?.z ?? Z_95
    const srBench = opts?.srBenchmark ?? SR_BENCHMARK
    const trialN = opts?.trialN ?? 1
    const mu = mean(returns)
    const m2 = returns.reduce((a, b) => a + (b - mu) ** 2, 0) / T
    const std = Math.sqrt(m2)
    // a scale-relative degenerate guard (robust to floating-point mean rounding — like the Stamp / decay / ICIR guards)
    if (!(std > Math.abs(mu) * 1e-6 + 1e-15))
      return { T, sr: null, skew: 0, kurtosis: 0, minTRL: null, sufficient: false, suppress: false, needMore: 0, trialN, reason: "MinTRL not computable — the recorded series is degenerate (no measurable variation); no point estimate to suppress." }
    const sr = mu / std
    const m3 = returns.reduce((a, b) => a + (b - mu) ** 3, 0) / T
    const m4 = returns.reduce((a, b) => a + (b - mu) ** 4, 0) / T
    const skew = m3 / std ** 3
    const kurtosis = m4 / m2 ** 2
    const denom = sr - srBench
    if (denom <= 0)
      return { T, sr, skew, kurtosis, minTRL: null, sufficient: false, suppress: false, needMore: 0, trialN, reason: `MinTRL is undefined — the observed Sharpe (${sr.toFixed(3)}/obs) does not exceed the benchmark, so no track-record length makes it significant. This is a genuine low-Sharpe reading on the recorded data, not a short-history suppression.` }
    const factor = 1 - skew * sr + ((kurtosis - 1) / 4) * sr ** 2
    const minTRL = 1 + Math.max(0, factor) * (z / denom) ** 2 // factor floored at 0 (a very negative-tail estimate never shortens the requirement below the base)
    const sufficient = T >= minTRL
    const needMore = sufficient ? 0 : Math.max(0, Math.ceil(minTRL) - T)
    const suppress = !sufficient
    const reason = suppress
      ? `INSUFFICIENT track record LENGTH — T=${T} observations is below the Minimum Track Record Length its own Sharpe requires (MinTRL ≈ ${Math.ceil(minTRL)}). The deflated-Sharpe point estimate is SUPPRESSED (not caveated): need ${needMore} more observations before the Sharpe can be trusted.`
      : `the recorded track record clears its Minimum Track Record Length (T=${T} ≥ MinTRL ≈ ${Math.ceil(minTRL)}) — its Sharpe is long enough to be worth a point estimate.`
    return { T, sr, skew, kurtosis, minTRL, sufficient, suppress, needMore, trialN, reason }
  }
}
