/**
 * ORGΛNON DATA-PLANE — the HYPERLIQUID funding leg (Spine Phase 4; Rules R-BASIS, D-DOMAIN, D-LABEL). The DeFi leg of
 * the first cross-venue domain. Hyperliquid publishes FREE, KEYLESS, DOCUMENTED on-chain funding history at
 * api.hyperliquid.xyz/info (`{type:"fundingHistory",coin,startTime}` → `[{coin,fundingRate,premium,time}]`, funded
 * HOURLY). Unlike Binance's immutable checksummed dumps (T1), a public API read is revisable in principle — so it is
 * admissible only as **T2-FORWARD**: captured going forward, nonce-anchored through the existing Capture.Service chain,
 * NEVER retro-claimed. A synthesized pre-capture "history" is refused by the store's physics (the nonce is generated at
 * capture time; a backfilled snapshot cannot verify). Standalone-native (no sibling packages; the leak wall holds).
 */
import { DataPlane } from "./store"

export namespace Hyperliquid {
  export const ENDPOINT = "https://api.hyperliquid.xyz/info"
  export const TIER = "T2" as const // T2-FORWARD — a public API read captured forward with a nonce, never retro-claimed
  export const INTERVAL_HOURS = 1 // Hyperliquid funds hourly

  export interface HlPoint extends DataPlane.SeriesPoint {
    ts: number
    rate: number // per-interval (hourly) funding rate
    premium: number | null
  }

  // annualize a per-interval funding rate the same way the funding domain does: interval → per-year.
  export function annualize(rate: number, intervalHours: number = INTERVAL_HOURS): number {
    return rate * (24 / intervalHours) * 365
  }

  // ── the funding-regime BAND (Honesty Layer Phase 5) — the delta-neutral axis renders a volatility BAND, never a hero
  // APY (the research: funding swings ~ −6% .. +75%). [p10, p90] of the annualized funding over the captured window +
  // the median. Needs a minimum window of points; below it the band is UNVERIFIED (a no-history strategy), never faked.
  export const MIN_FUNDING_POINTS = 100
  export interface FundingBand { p10: number; median: number; p90: number; n: number } // percent, annualized
  export function fundingBand(points: HlPoint[]): FundingBand | null {
    if (points.length < MIN_FUNDING_POINTS) return null
    const ann = points.map((p) => annualize(p.rate) * 100).sort((a, b) => a - b)
    const q = (x: number) => ann[Math.min(ann.length - 1, Math.floor(x * ann.length))]
    return { p10: +q(0.1).toFixed(1), median: +q(0.5).toFixed(1), p90: +q(0.9).toFixed(1), n: ann.length }
  }

  // reconstruct BYTE-FAITHFULLY from the raw API payload: parse {coin,fundingRate,premium,time} → {ts,rate,premium},
  // drop non-finite, sort by ts. No smoothing, no interpolation — the venue's rows, verbatim.
  export function reconstruct(raw: unknown[]): HlPoint[] {
    return raw
      .map((r) => {
        const o = r as { fundingRate?: string; premium?: string; time?: number }
        return { ts: Number(o.time), rate: Number(o.fundingRate), premium: o.premium === undefined ? null : Number(o.premium) }
      })
      .filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.rate))
      .sort((a, b) => a.ts - b.ts)
  }

  // fetch funding history for a coin (free, keyless). Returns the raw payload array; the caller reconstructs + captures.
  export async function fetchFunding(coin: string, startTimeMs: number, timeoutMs = 25000): Promise<unknown[]> {
    const ctl = new AbortController()
    const to = setTimeout(() => ctl.abort(), timeoutMs)
    try {
      const res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "fundingHistory", coin, startTime: startTimeMs }), signal: ctl.signal })
      if (!res.ok) throw new Error(`Hyperliquid ${res.status}`)
      const body = (await res.json()) as unknown
      if (!Array.isArray(body)) throw new Error("Hyperliquid: non-array funding payload")
      return body
    } finally {
      clearTimeout(to)
    }
  }

  export interface HlCapture { coin: string; key: string; contentSha: string; nonce: string; chainPos: number; tier: "T2"; nPoints: number; window: { start: number; end: number } | null; points: HlPoint[] }

  // capture T2-FORWARD: fetch → reconstruct → write a content-addressed snapshot + a NONCE-ANCHORED provenance stamp
  // (DataPlane.capture). The nonce is generated at capture time; a retro-captured "history" cannot reproduce it. Returns
  // the provenance so the caller can chain further captures and prove the forward-only chain.
  export async function captureT2(coin: string, startTimeMs: number, capturedAt: number): Promise<HlCapture> {
    const raw = await fetchFunding(coin, startTimeMs)
    const points = reconstruct(raw)
    if (!points.length) throw new Error(`Hyperliquid ${coin}: empty funding series (ABSENT — never fabricated)`)
    const key = `funding-basis:hyperliquid:${coin}`
    const snap: DataPlane.SnapshotFile = { key, kind: "rate", source: "hyperliquid:api/info/fundingHistory", url: ENDPOINT, capturedAt, points: points.map((p) => ({ ts: p.ts, rate: p.rate, premium: p.premium })) }
    const cap = DataPlane.capture(snap, { origin: "manual" })
    const window = points.length ? { start: points[0].ts, end: points[points.length - 1].ts } : null
    return { coin, key, contentSha: cap.contentSha, nonce: cap.nonce, chainPos: cap.chainPos, tier: TIER, nPoints: points.length, window, points }
  }
}
