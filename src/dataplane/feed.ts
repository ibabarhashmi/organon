/**
 * ORGΛNON — THE SCORECARD FEED (Honesty Layer Phase 3; Rule X-MOAT bridge). The thin glue that turns the provenance
 * record into the scorecard's inputs: it resolves each shown value through the record (REAL where recorded, SAMPLE where
 * absent — clone-robust) under the shown-but-recorded guarantee, and computes the 30-day TVL slope from the recorded
 * chart series (point-in-time, no lookahead; a pool without 30d of history yields null → the TVL axis renders UNVERIFIED,
 * never a fabricated slope). The scorecard itself stays pure; this is where the moat meets the axes.
 */
import { DataPlane } from "./store"
import { ProvRecord } from "./record"
import { Hyperliquid } from "./hyperliquid"
import { Scorecard } from "../analytics/scorecard"
// the deep counterparty DETAIL — resolved from the content-hashed contract registry (a RECORD read, never a compilation:
// the render path imports no analyzer — X-CONTRACT e). `../contract/registry` is owned in-tree (the leak wall stays green).
import { resolveContractSubAxis } from "../contract/registry"

export namespace Feed {
  const DAY = 86_400_000

  // resolve a delta-neutral strategy's PoolFacts from a recorded Hyperliquid funding series (Phase 5). The funding
  // BAND [p10,p90] is computed from the recorded points at-or-before ts (point-in-time). REAL where recorded, SAMPLE
  // where the gitignored payload is absent (→ UNVERIFIED); < the minimum window → band null → the axis is UNVERIFIED.
  export function fundingFacts(name: string, fundingKey: string, ts: number, adapter: DataPlane.Adapter = DataPlane.snapshotAdapter): Scorecard.PoolFacts {
    const s = adapter.fetchSeries(fundingKey)
    const pts = s ? s.points.filter((p) => p.ts <= ts).map((p) => ({ ts: p.ts, rate: (p.rate ?? 0) as number, premium: (p.premium ?? null) as number | null })) : []
    const band = pts.length ? Hyperliquid.fundingBand(pts) : null
    return { name, apyBase: null, apyReward: null, tvlSlope30d: null, pegDev: null, isStablecoin: false, reality: s ? "REAL" : "SAMPLE", provenanceRef: s ? s.provenance.contentSha : null, deltaNeutral: true, fundingBand: band }
  }

  export interface PoolRef { name: string; poolKey: string; chartKey: string; isStablecoin: boolean; vertical?: Scorecard.Vertical; gtKey?: string; depProtocols?: number }

  // resolve the DEX-pool liquidity depth (reserve_in_usd) from a recorded GeckoTerminal series (the liquidity-depth axis's
  // input for a stablecoin-yield strategy); null where the gecko payload is absent (→ the axis renders UNVERIFIED).
  export function liqUsd(gtKey: string, ts: number, adapter: DataPlane.Adapter = DataPlane.snapshotAdapter): number | null {
    return ProvRecord.resolveShown(gtKey, "reserveUsd", ts, null, adapter).value
  }

  // the pool's AGE in days = the recorded /chart history span (first point → ts); null if no chart recorded (→ the
  // counterparty screen renders UNVERIFIED, never a fabricated age). This is POOL age (recorded history), not over-claimed
  // as protocol age. Clone-robust: a gitignored/absent chart payload → null.
  export function ageDays(chartKey: string, ts: number, adapter: DataPlane.Adapter = DataPlane.snapshotAdapter): number | null {
    const s = adapter.fetchSeries(chartKey)
    if (!s || !s.points.length) return null
    return Math.max(0, (ts - s.points[0].ts) / DAY)
  }

  // resolve |price − 1| for a stablecoin symbol from the recorded peg snapshot (defillama:peg:usd, fields peg_<SYMBOL>);
  // null if the peg was never recorded or the symbol is absent (→ the peg axis renders UNVERIFIED, never a fabricated peg).
  export function pegDev(symbol: string, ts: number, adapter: DataPlane.Adapter = DataPlane.snapshotAdapter): number | null {
    const s = adapter.fetchSeries("defillama:peg:usd")
    if (!s) return null
    const pt = DataPlane.asOf(s, ts)
    const price = pt ? ((pt[`peg_${symbol}`] ?? null) as number | null) : null
    return price === null ? null : Math.abs(price - 1)
  }

  // (tvl_now − tvl_30d_ago)/tvl_30d_ago from a recorded chart series at ts; null if <30d of history or absent (S4).
  export function tvlSlope30d(chartKey: string, ts: number, adapter: DataPlane.Adapter = DataPlane.snapshotAdapter): number | null {
    const s = adapter.fetchSeries(chartKey)
    if (!s || !s.points.length) return null
    if (s.points[0].ts > ts - 30 * DAY) return null // the earliest point is < 30d before ts → a no-history pool, honestly
    const now = DataPlane.asOf(s, ts), past = DataPlane.asOf(s, ts - 30 * DAY)
    const tn = (now?.tvlUsd ?? null) as number | null, tp = (past?.tvlUsd ?? null) as number | null
    if (tn === null || tp === null || tp <= 0) return null
    return (tn - tp) / tp
  }

  // resolve the record → the scorecard's PoolFacts. REAL iff the shown base yield is recorded; else SAMPLE (→ UNVERIFIED).
  export function poolFacts(ref: Feed.PoolRef, ts: number, pegDev: number | null, adapter: DataPlane.Adapter = DataPlane.snapshotAdapter): Scorecard.PoolFacts {
    const apyBaseV = ProvRecord.resolveShown(ref.poolKey, "apyBase", ts, null, adapter)
    const apyRewardV = ProvRecord.resolveShown(ref.poolKey, "apyReward", ts, null, adapter)
    const sizeV = ProvRecord.resolveShown(ref.poolKey, "tvlUsd", ts, null, adapter) // the counterparty size signal (recorded pool TVL)
    // THE SHOWN-BUT-RECORDED GUARANTEE: any value labeled REAL must resolve to the record, else Halt (X-MOAT).
    ProvRecord.assertRecorded(apyBaseV, adapter)
    ProvRecord.assertRecorded(apyRewardV, adapter)
    return {
      name: ref.name,
      apyBase: apyBaseV.value,
      apyReward: apyRewardV.value,
      tvlSlope30d: tvlSlope30d(ref.chartKey, ts, adapter),
      pegDev: ref.isStablecoin ? pegDev : null,
      isStablecoin: ref.isStablecoin,
      reality: apyBaseV.provenance === "REAL" ? "REAL" : "SAMPLE",
      provenanceRef: apyBaseV.contentHash,
      vertical: ref.vertical ?? "lending",
      ageDays: ageDays(ref.chartKey, ts, adapter), // pool age = recorded /chart span (the counterparty maturity signal)
      sizeUsd: sizeV.value, // recorded pool TVL (the counterparty size signal)
      liqUsd: ref.gtKey ? liqUsd(ref.gtKey, ts, adapter) : null, // DEX-pool reserve (the liquidity-depth axis; stablecoin-yield)
      // dependency (Crown-Jewel Phase 3, X-DEP): a direct DeFiLlama pool is a SINGLE-protocol deposit (dep=1, the clean,
      // transparent baseline); a registry entry may declare a stacked (≥3) dependency for a looping/wrapper strategy.
      depProtocols: ref.depProtocols ?? 1,
      // the deep counterparty DETAIL (Contract-Truth): the recorded contract-risk sub-axis (UNVERIFIED where no verified
      // build was analyzed — the current shelf). A record read, off the hot loop; additive (never moves the verdict).
      contractSubAxis: resolveContractSubAxis(ref.poolKey),
    }
  }
}
