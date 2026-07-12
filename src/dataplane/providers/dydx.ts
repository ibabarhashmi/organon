/**
 * ORGΛNON — THE dYdX v4 INDEXER (Domain sprint; X-DOMAIN c — STABLE-SYNTH's SECOND funding venue ONLY). The yield-source
 * attribution axis needs to name perp-funding carry across MORE than one venue; dYdX's v4 indexer publishes FREE, KEYLESS
 * historical funding at indexer.dydx.trade/v4/historicalFunding/{ticker} → {historicalFunding:[{ticker,rate,price,
 * effectiveAt,effectiveAtHeight}]}, funded HOURLY. It is an INDEXER read (an aggregator serving a computed history) → the
 * REAL-at-timestamp tier, NEVER REAL★ (it is not a block-pinned chain read). Reachable where an archive RPC is not (the
 * general cross-venue expansion stays PARKED — this venue enters for STABLE's funding-flip fact and the B2 backtest only).
 * Pure + injectable (a fetchImpl for offline tests); unreachable → an honest null (never a fabricated series).
 */
export namespace Dydx {
  export const ENDPOINT = "https://indexer.dydx.trade/v4"
  export const TIER = "REAL-at-timestamp" as const // an indexer/aggregator read — computed + revisable, never block-pinned
  export const INTERVAL_HOURS = 1 // dYdX v4 funds hourly

  export interface DydxPoint { ts: number; rate: number; price: number | null } // rate = hourly funding rate (decimal)
  export type FetchImpl = (url: string) => Promise<{ ok: boolean; json: () => Promise<unknown> }>

  // reconstruct BYTE-FAITHFULLY from the raw indexer payload: parse {rate, price, effectiveAt} → {ts, rate, price}, drop
  // non-finite, sort by ts. No smoothing, no interpolation — the indexer's rows, verbatim.
  export function reconstruct(raw: unknown): DydxPoint[] {
    const arr = (raw as { historicalFunding?: unknown[] })?.historicalFunding
    if (!Array.isArray(arr)) return []
    return arr
      .map((r) => {
        const o = r as { rate?: string; price?: string; effectiveAt?: string }
        const ts = o.effectiveAt ? Date.parse(o.effectiveAt) : NaN
        const rate = o.rate !== undefined ? Number(o.rate) : NaN
        const price = o.price !== undefined ? Number(o.price) : NaN
        return { ts, rate, price: Number.isFinite(price) ? price : null }
      })
      .filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.rate))
      .sort((a, b) => a.ts - b.ts)
  }

  // fetch the historical funding for a ticker (e.g. "BTC-USD") over the free keyless indexer. Unreachable / malformed →
  // null (the honest degrade — the axis renders the venue it CAN reach; never a fabricated series). Injectable for tests.
  export async function historicalFunding(ticker: string, fetchImpl?: FetchImpl): Promise<DydxPoint[] | null> {
    const f = fetchImpl ?? ((url: string) => fetch(url, { signal: AbortSignal.timeout(12_000) }) as unknown as ReturnType<FetchImpl>)
    try {
      const res = await f(`${ENDPOINT}/historicalFunding/${encodeURIComponent(ticker)}`)
      if (!res.ok) return null
      const pts = reconstruct(await res.json())
      return pts.length ? pts : null
    } catch {
      return null
    }
  }

  // annualize a per-interval funding rate the same way the funding domain does (interval → per-year).
  export function annualize(rate: number, intervalHours: number = INTERVAL_HOURS): number {
    return rate * (24 / intervalHours) * 365
  }
}
