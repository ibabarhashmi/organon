/**
 * ORGΛNON — THE ICIR CONSISTENCY SCORE (Persistence Phase 4; Rule X-ICIR, X-DETERM). A pure, DETERMINISTIC temporal-
 * consistency sub-score for the opt-in Stamp — OFF THE MASS PATH. `ICIR = mean(periodic-edge) / std(periodic-edge)` over
 * the strategy's RECORDED periodic returns: a scale-free measure of how STEADILY the edge holds (a little every period
 * beats a lot once). Shown BESIDE the deflated-Sharpe (never replacing it). Gate: `ICIR ≥ STEADY_FLOOR` → CONSISTENT (a
 * steady edge); `< floor` → LUMPY (a clean GO tempered). Honest: `< MIN_PERIODS`, or std→0 (degenerate), → INSUFFICIENT
 * (never a divide-by-zero or a fabricated ratio); a SAMPLE-fed series → not scored.
 *
 * HONEST SCOPE (X-ICIR b): this is a WITHIN-STRATEGY TEMPORAL consistency measure over THIS strategy's own recorded
 * periods — EXPLICITLY NOT the cross-sectional factor-ranking IC/ICIR of the literature (which ranks a UNIVERSE of assets
 * at a point in time). The tool scores one strategy's yield reality, not a 200-token ranking. NO model, NO cross-section.
 */
export namespace Icir {
  export const MIN_PERIODS = 20 // < 20 recorded periods → INSUFFICIENT (too few to measure consistency honestly)
  export const STEADY_FLOOR = 0.1 // per-period consistency ratio ≥ 0.1 → CONSISTENT (steady); < 0.1 → LUMPY (a clean GO tempered)
  export const SCOPE = "within-strategy-temporal" as const // NOT cross-sectional factor IC — pinned + surfaced

  export type IcirTier = "CONSISTENT" | "LUMPY" | "INSUFFICIENT"
  export interface IcirResult {
    tier: IcirTier
    icir: number | null // mean/std of the recorded periodic edges (rounded 3dp); null when INSUFFICIENT
    floor: number // STEADY_FLOOR (the pinned steady threshold)
    scope: typeof SCOPE // the honest scope label (within-strategy temporal — never cross-sectional)
    nPeriods: number
    reason: string // a plain one-liner (grounding-safe: states only the ratio and the floor; scope in words, no stray digits)
  }

  const insufficient = (nPeriods: number, reason: string): IcirResult => ({ tier: "INSUFFICIENT", icir: null, floor: STEADY_FLOOR, scope: SCOPE, nPeriods, reason })

  // ── the pure sub-score — (recordedPeriodicEdges) → SubScore. Deterministic; identical inputs → a byte-identical result. ──
  export function icir(returns: number[], opts?: { reality?: "REAL" | "SAMPLE" | string }): IcirResult {
    const nPeriods = returns.length
    // (d) from the record only — a SAMPLE-fed series is NOT scored as real
    if (opts?.reality === "SAMPLE") return insufficient(nPeriods, "INSUFFICIENT — the recorded series is SAMPLE (not REAL-PIT); the consistency ratio is not scored on unrecorded data.")
    // (c) honest on short history
    if (nPeriods < MIN_PERIODS) return insufficient(nPeriods, `INSUFFICIENT — only ${nPeriods} recorded period${nPeriods === 1 ? "" : "s"} (below the ${MIN_PERIODS}-period floor); too few to measure consistency honestly.`)
    const mean = returns.reduce((a, b) => a + b, 0) / nPeriods
    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / nPeriods
    const std = Math.sqrt(variance)
    // the degenerate guard — std → 0 (a flat / no-variation series) → INSUFFICIENT (never a divide-by-zero or ∞ ratio).
    // Scale-relative (robust to floating-point mean rounding on a near-constant series — like the Stamp / decay guard).
    if (!(std > Math.abs(mean) * 1e-6 + 1e-15)) return insufficient(nPeriods, "INSUFFICIENT — the recorded series is degenerate (no measurable variation); a consistency ratio cannot be formed (never a divide-by-zero).")
    const ratio = Math.round((mean / std) * 1000) / 1000 // the within-strategy temporal consistency ratio, 3dp (grounding-stable)
    const tier: IcirTier = ratio >= STEADY_FLOOR ? "CONSISTENT" : "LUMPY"
    const reason = tier === "CONSISTENT"
      ? `CONSISTENT — the recorded edge holds steadily across its periods (temporal consistency ratio ${ratio} ≥ the ${STEADY_FLOOR} floor; a within-strategy measure of THIS strategy's periods — NOT a cross-sectional factor rank).`
      : `LUMPY — the recorded edge is lumpy/uneven across its periods (temporal consistency ratio ${ratio} < the ${STEADY_FLOOR} floor; a within-strategy measure — NOT a cross-sectional factor rank). A clean GO is tempered.`
    return { tier, icir: ratio, floor: STEADY_FLOOR, scope: SCOPE, nPeriods, reason }
  }
}
