/**
 * ORGΛNON DATA-PLANE — the ENGINE port (Data-Plane Phase 2; Rules D-SEAM, D-DIFF, D-DOMAIN). The TS layer the transplant
 * left behind, re-homed standalone-native BEHIND the existing seams: `commonWindow` (pure TS, the window over which
 * every leg has data) + a slim lending `buildJob` that transforms captured PIT snapshots into the `lending_accrual.py`
 * Job contract, driving the byte-identical sidecar through `Runner.sidecar`. The sidecar (`lending_accrual.py`) is NOT
 * touched — it is byte-identical to the monorepo oracle (the seam-faithful proof). This module is the NEW code the
 * differential judges: its Job, run through the frozen engine, must be byte-identical to the oracle's on the same Job.
 *
 * Cost model + turnover derivation preserved from the monorepo runner's yield-leg idiom (DEFAULT_COSTS,
 * MIN_TURNOVER_FRACTION) so the accrual is the same computation the oracle runs — never a re-invented one.
 */
import { Runner } from "../backtest/runner"
import { DataPlane } from "./store"

export namespace DataPlaneEngine {
  export interface LendingSpec {
    family: string // "lending-carry" (levered is refused by the sidecar behind the Appendix-C gate)
    policy: "static" | "carry-rotation" | "carry-tilt"
    rebalance: { trigger: string } // "monthly"
    markets: Array<{ key: string; weight: number }>
  }

  // preserved from the monorepo runner (src/backtest/runner.ts): the same cost model + turnover floor the oracle uses
  export const DEFAULT_COSTS = { gasUsd: 25, feeBps: 5, slippageK: 0.1 }
  export const CAPITAL_USD = 1_000_000
  const MIN_TURNOVER_FRACTION = 0.005 // floor turnover at 0.5% of TVL (avoid zero on flat days) — monorepo-faithful

  export interface Window { start: number; end: number }

  // the window over which EVERY given series has data: [max firstTs, min lastTs] — byte-faithful to Runner.commonWindow
  export function commonWindow(seriesList: DataPlane.Series[]): Window {
    let start = -Infinity
    let end = Infinity
    for (const s of seriesList) {
      if (!s.points.length) continue
      start = Math.max(start, s.points[0].ts)
      end = Math.min(end, s.points[s.points.length - 1].ts)
    }
    return { start, end }
  }

  // build the lending market payload from a captured PIT series, truncated to the window (point-in-time; the engine
  // never sees future data). apyBase from the observed rate; turnover derived from |ΔTVL| with the monorepo floor; tvl
  // carried for the withdrawal-risk term (utilization stays uncovered on DefiLlama chart data → no withdrawal mark, the
  // sidecar's disclosed-absence path). No smoothing, no interpolation — the captured points, truncated, verbatim.
  function marketPayload(series: DataPlane.Series, weight: number, window: Window) {
    const pts = series.points.filter((p) => p.ts >= window.start && p.ts <= window.end)
    const apyBase: [number, number | null][] = pts.map((p) => [p.ts, p.apyBase ?? null])
    const tvl: [number, number][] = pts.map((p) => [p.ts, (p.tvlUsd as number) ?? 0])
    const turnover: [number, number][] = pts.map((p, i) => {
      const t = (p.tvlUsd as number) ?? 0
      const prev = i > 0 ? ((pts[i - 1].tvlUsd as number) ?? t) : t
      return [p.ts, Math.max(Math.abs(t - prev), MIN_TURNOVER_FRACTION * t, 1)]
    })
    return { key: series.key, weight, series: { apyBase, turnover, tvl } }
  }

  export interface LendingJob {
    spec: LendingSpec
    window: Window
    capitalUsd: number
    costs: typeof DEFAULT_COSTS
    markets: ReturnType<typeof marketPayload>[]
  }

  // the seam-faithful buildJob: spec + PIT series + window → the lending_accrual Job contract. Deterministic + pure.
  export function buildLendingJob(spec: LendingSpec, window: Window, seriesByKey: Map<string, DataPlane.Series>, opts?: { capitalUsd?: number; costs?: typeof DEFAULT_COSTS }): LendingJob {
    const markets = spec.markets.map((m) => {
      const s = seriesByKey.get(m.key)
      if (!s) throw new Error(`buildLendingJob: no captured series for market ${m.key} (ABSENT — never fabricated)`)
      return marketPayload(s, m.weight, window)
    })
    return { spec, window, capitalUsd: opts?.capitalUsd ?? CAPITAL_USD, costs: opts?.costs ?? DEFAULT_COSTS, markets }
  }

  export interface LendingResult { equity_curve: [number, number][]; fills: unknown[]; costs: Record<string, number>; refused?: boolean }

  // run the ported lending engine: build the Job, drive the byte-identical sidecar (Runner.sidecar → py/.venv). The
  // returns are REAL-PIT when the series carry REAL-PIT provenance; the caller labels + attaches provenance (D-LABEL).
  export async function lendingAccrual(spec: LendingSpec, window: Window, seriesByKey: Map<string, DataPlane.Series>, opts?: { capitalUsd?: number; costs?: typeof DEFAULT_COSTS }): Promise<LendingResult> {
    const job = buildLendingJob(spec, window, seriesByKey, opts)
    return (await Runner.sidecar("lending_accrual", job)) as LendingResult
  }
}
