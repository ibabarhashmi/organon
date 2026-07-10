/**
 * ORGΛNON — THE DEFILLAMA PROVIDER (Honesty Layer Phase 2; Rules X-HONEST, X-LEAN). The keyless backbone: it powers
 * most of the scorecard (yield-reality · TVL trend · peg) and the Shelf, with ZERO setup. One small pure function per
 * endpoint used — no SDK, no "provider registry", no generic DataSource abstraction (PART CLEAN; there is no second
 * caller). Every value is tagged REAL (fetched now) or SAMPLE (a labeled placeholder). A dead endpoint / 429 / network
 * error / malformed body degrades to last-good (stale, still REAL-provenanced) or SAMPLE — NEVER a throw to the UI,
 * NEVER a fabricated value. The `fetch` is an injectable seam so the battery runs deterministically offline.
 *
 * V-LIVE (2026-07-08): /pools 200, 15702 pools, keyless, 0.77s; /chart/{pool} 200, ~1249 daily points; /stablecoinprices
 * 200, prices keyed by DeFiLlama slug (usd-coin/tether/dai). Recorded in data/honesty/vlive-defillama.json.
 */
import { DataPlane } from "../store"

export namespace DefiLlama {
  export type Reality = "REAL" | "SAMPLE"
  export const BASE = "https://yields.llama.fi"
  export const STABLE_BASE = "https://stablecoins.llama.fi"
  export const CACHE_TTL_MS = 60_000 // short-TTL in-memory cache — absorbs a click-storm (S2), keeps asOf fresh (S3)

  export interface Pool { chain: string; project: string; symbol: string; tvlUsd: number | null; apyBase: number | null; apyReward: number | null; apy: number | null; pool: string; stablecoin: boolean }
  export interface ChartPoint { ts: number; tvlUsd: number | null; apyBase: number | null; apyReward: number | null }
  export interface Tagged<T> { value: T; reality: Reality; asOf: number; source: string; note?: string; tier?: Tier }

  // ── THE PRO TIER SEAM (Alpha Phase 3; X-CAPABILITY a) — a paid DeFiLlama Pro key deepens the FACTS: the same
  // endpoints served from the pro base (higher limits, longer histories, premium datasets per the descriptor), entering
  // as tier-stamped REAL. The KEY rides ONLY the fetch URL; every RECORDED source/url uses the REDACTED form (a key can
  // never enter the provenance chain or a log). Absent key → the free base, BYTE-EXACT (the conditional spread below
  // leaves the free-path return objects literally unchanged). ──
  export type Tier = "free" | "pro"
  export const PRO_BASE = "https://pro-api.llama.fi"
  export interface Route { fetchBase: string; recordBase: string; tier: Tier }
  export function route(env: Record<string, string | undefined> = process.env): Route {
    const k = env.DEFILLAMA_PRO_API_KEY
    return k ? { fetchBase: `${PRO_BASE}/${k}/yields`, recordBase: `${PRO_BASE}/<key>/yields`, tier: "pro" } : { fetchBase: BASE, recordBase: BASE, tier: "free" }
  }
  const tierTag = (r: Route) => (r.tier === "pro" ? { tier: "pro" as const } : {}) // free path: the object is byte-identical to before the seam

  // the injectable fetch seam (default = global fetch). Tests inject a fixture / a 429 / a throwing impl.
  export interface FetchResult { ok: boolean; status: number; json(): Promise<unknown> }
  export type FetchImpl = (url: string) => Promise<FetchResult>
  const globalFetch: FetchImpl = (url) => fetch(url) as unknown as Promise<FetchResult>

  const cache = new Map<string, { at: number; body: unknown }>()
  export function resetCache(): void { cache.clear() } // test hook (the cache is process-global by design)

  // fetch JSON with the short-TTL cache; on 429/error/no-network return last-good (REAL, stale) or SAMPLE — NEVER throw.
  export async function getJson(url: string, now: number, fetchImpl: FetchImpl = globalFetch): Promise<{ body: unknown; reality: Reality; note?: string }> {
    const c = cache.get(url)
    if (c && now - c.at < CACHE_TTL_MS) return { body: c.body, reality: "REAL", note: "cache" }
    try {
      const r = await fetchImpl(url)
      if (!r.ok) return c ? { body: c.body, reality: "REAL", note: `HTTP ${r.status} — last-good (stale)` } : { body: null, reality: "SAMPLE", note: `HTTP ${r.status}` }
      const body = await r.json()
      cache.set(url, { at: now, body })
      return { body, reality: "REAL" }
    } catch {
      return c ? { body: c.body, reality: "REAL", note: "network error — last-good (stale)" } : { body: null, reality: "SAMPLE", note: "network error" }
    }
  }

  const num = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) ? x : null)
  // boundary validation: a value outside a sane band is nonsense (adversarial / malformed) → treated as MISSING (null),
  // never a nonsense verdict input (S8). Missing stays missing — never coerced to 0 or interpolated.
  const band = (v: number | null, lo: number, hi: number): number | null => (v === null ? null : v < lo || v > hi ? null : v)

  // parse one raw /pools row → a validated Pool, or null if unusable (no pool id) — pure.
  export function parsePool(raw: unknown): Pool | null {
    const r = raw as Record<string, unknown>
    if (!r || typeof r.pool !== "string") return null
    return {
      chain: String(r.chain ?? ""), project: String(r.project ?? ""), symbol: String(r.symbol ?? ""),
      tvlUsd: band(num(r.tvlUsd), 0, 1e13), apyBase: band(num(r.apyBase), -100, 1e5), apyReward: band(num(r.apyReward), -100, 1e5),
      apy: band(num(r.apy), -100, 1e5), pool: r.pool as string, stablecoin: !!r.stablecoin,
    }
  }

  // the money-holding Shelf: stablecoin yield + the major lending markets, with real TVL. (Delta-neutral funding is the
  // Phase-5 Hyperliquid axis.) A pinned, readable filter — not a config engine.
  export const LENDING_PROJECTS = ["aave-v3", "compound-v3", "fluid-lending", "sparklend", "morpho-blue", "aave-v2"]
  export function isShelf(p: Pool): boolean { return (p.stablecoin || LENDING_PROJECTS.includes(p.project)) && (p.tvlUsd ?? 0) >= 1e6 }

  // a labeled SAMPLE shelf so the tool boots with ZERO setup / no network (S7). Clearly SAMPLE — never styled REAL.
  export const SAMPLE_POOLS: Pool[] = [
    { chain: "Ethereum", project: "aave-v3", symbol: "USDC", tvlUsd: 240_000_000, apyBase: 3.1, apyReward: null, apy: 3.1, pool: "SAMPLE-aave-usdc", stablecoin: true },
    { chain: "Ethereum", project: "sample-farm", symbol: "USDC-XYZ", tvlUsd: 12_000_000, apyBase: 0.5, apyReward: 9.5, apy: 10.0, pool: "SAMPLE-mercenary", stablecoin: true },
    { chain: "Ethereum", project: "sample-lending", symbol: "DAI", tvlUsd: 45_000_000, apyBase: 4.2, apyReward: 1.1, apy: 5.3, pool: "SAMPLE-dai-lending", stablecoin: true },
  ]

  // /pools → the Shelf subset, tagged. On no data → the labeled SAMPLE shelf (the tool still runs, honestly).
  // Pro-keyed env → the pro base (deeper REAL, tier-stamped); keyless → the free base, byte-exact (X-CAPABILITY a/d).
  export async function pools(now: number, fetchImpl: FetchImpl = globalFetch, env: Record<string, string | undefined> = process.env): Promise<Tagged<Pool[]>> {
    const rt = route(env)
    const { body, reality, note } = await getJson(`${rt.fetchBase}/pools`, now, fetchImpl)
    const data = (body as { data?: unknown })?.data
    if (!Array.isArray(data)) return { value: SAMPLE_POOLS, reality: "SAMPLE", asOf: now, source: `${rt.recordBase}/pools`, note: note ?? "no data — SAMPLE shelf" }
    const shelf = (data.map(parsePool).filter(Boolean) as Pool[]).filter(isShelf)
    if (!shelf.length) return { value: SAMPLE_POOLS, reality: "SAMPLE", asOf: now, source: `${rt.recordBase}/pools`, note: "empty shelf — SAMPLE fallback" }
    return { value: shelf, reality, asOf: now, source: `${rt.recordBase}/pools`, note, ...tierTag(rt) }
  }

  // /chart/{pool} → the TVL/APY history (for the TVL-trend axis), tagged. Empty → SAMPLE.
  export async function chart(poolId: string, now: number, fetchImpl: FetchImpl = globalFetch, env: Record<string, string | undefined> = process.env): Promise<Tagged<ChartPoint[]>> {
    const rt = route(env)
    const { body, reality, note } = await getJson(`${rt.fetchBase}/chart/${poolId}`, now, fetchImpl)
    const data = (body as { data?: unknown })?.data
    if (!Array.isArray(data)) return { value: [], reality: "SAMPLE", asOf: now, source: `${rt.recordBase}/chart/${poolId}`, note: note ?? "no history" }
    const pts: ChartPoint[] = data
      .map((d) => { const x = d as Record<string, unknown>; const t = Date.parse(String(x.timestamp)); return Number.isFinite(t) ? { ts: t, tvlUsd: band(num(x.tvlUsd), 0, 1e13), apyBase: band(num(x.apyBase), -100, 1e5), apyReward: band(num(x.apyReward), -100, 1e5) } : null })
      .filter(Boolean) as ChartPoint[]
    return { value: pts.sort((a, b) => a.ts - b.ts), reality, asOf: now, source: `${rt.recordBase}/chart/${poolId}`, note, ...tierTag(rt) }
  }

  // symbol → DeFiLlama stablecoin slug (the /stablecoinprices key). A small pinned map, not a lookup service.
  export const SLUG: Record<string, string> = { USDC: "usd-coin", USDT: "tether", DAI: "dai", FRAX: "frax", TUSD: "true-usd", USDE: "ethena-usde", PYUSD: "paypal-usd", GUSD: "gemini-dollar", LUSD: "liquity-usd", USDS: "usds" }

  // /stablecoinprices → the current peg price per stablecoin symbol (from the last entry that carries prices), tagged.
  export async function stablecoinPrices(now: number, fetchImpl: FetchImpl = globalFetch): Promise<Tagged<Record<string, number | null>>> {
    const { body, reality, note } = await getJson(`${STABLE_BASE}/stablecoinprices`, now, fetchImpl)
    const arr = Array.isArray(body) ? body : (body as { data?: unknown[] })?.data
    if (!Array.isArray(arr)) return { value: {}, reality: "SAMPLE", asOf: now, source: `${STABLE_BASE}/stablecoinprices`, note: note ?? "no peg data" }
    // the last entry that actually carries a prices map (the very last can be empty)
    let prices: Record<string, unknown> | null = null
    for (let i = arr.length - 1; i >= 0; i--) { const p = (arr[i] as { prices?: Record<string, unknown> })?.prices; if (p && Object.keys(p).length) { prices = p; break } }
    if (!prices) return { value: {}, reality: "SAMPLE", asOf: now, source: `${STABLE_BASE}/stablecoinprices`, note: "no priced entry" }
    const out: Record<string, number | null> = {}
    for (const [sym, slug] of Object.entries(SLUG)) out[sym] = band(num(prices[slug]), 0.5, 2)
    return { value: out, reality, asOf: now, source: `${STABLE_BASE}/stablecoinprices`, note }
  }

  // ── UNLOCKS (Deepening Phase 3) — imminent token dilution. DeFiLlama's unlocks/emissions feed went keyless→PAID (HTTP
  // 402) mid-sprint (deviation D4): the probe degrades to SAMPLE on 402/absent (never scraped, never faked — X-HONEST).
  // The pure `nextUnlockFraction` computes the axis metric from a normalized schedule (a DeFiLlama-shape adapter is
  // deferred until the paid shape can be verified — no speculative parser). The axis is ARMED for a keyless source. ──
  export const UNLOCKS_BASE = "https://api.llama.fi"
  const DAY = 86_400_000
  export interface UnlockEvent { ts: number; tokens: number }
  export interface UnlockSchedule { mcap: number | null; tPrice: number | null; events: UnlockEvent[] }

  export async function unlocks(protocol: string, _now: number, fetchImpl: FetchImpl = globalFetch): Promise<{ reality: Reality; status: number | null; note?: string; body: unknown }> {
    const url = `${UNLOCKS_BASE}/emission/${protocol}`
    try {
      const r = await fetchImpl(url)
      if (!r.ok) return { reality: "SAMPLE", status: r.status, note: r.status === 402 ? "keyless-paywalled (HTTP 402) — deviation D4; never scraped/faked" : `HTTP ${r.status}`, body: null }
      return { reality: "REAL", status: 200, body: await r.json() }
    } catch { return { reality: "SAMPLE", status: null, note: "network error", body: null } }
  }

  // pure: the next-`windowDays` unlock as a fraction of circulating mcap (unlocked tokens × price / mcap). null if the
  // mcap/price is unknown (→ the unlock axis renders UNVERIFIED, never a fabricated fraction). Only future events count.
  export function nextUnlockFraction(s: UnlockSchedule, now: number, windowDays = 30): number | null {
    if (s.mcap === null || s.mcap <= 0 || s.tPrice === null) return null
    const end = now + windowDays * DAY
    const tokens = s.events.filter((e) => e.ts > now && e.ts <= end).reduce((a, e) => a + (e.tokens > 0 ? e.tokens : 0), 0)
    return (tokens * s.tPrice) / s.mcap
  }

  // ── the RECORD mapping (X-MOAT): a REAL fetched pool/chart → a content-addressed SnapshotFile the store can append.
  // Pure — the recording (recordReal → DataPlane.capture) is done by the runtime capture path, never at parse time.
  // The optional `source` lets the pro path record its REDACTED pro provenance (the tier is IN the recorded source —
  // X-CAPABILITY a: provenance records the tier); the default is the free source, so every existing caller is byte-exact.
  export function poolSnapshot(pool: Pool, ts: number, source: string = `${BASE}/pools`): DataPlane.SnapshotFile {
    return { key: `defillama:pool:${pool.pool}`, kind: "yield", source, url: source, capturedAt: ts, points: [{ ts, apyBase: pool.apyBase, apyReward: pool.apyReward, tvlUsd: pool.tvlUsd }] }
  }
  export function chartSnapshot(poolId: string, pts: ChartPoint[], source: string = `${BASE}/chart/${poolId}`): DataPlane.SnapshotFile {
    return { key: `defillama:chart:${poolId}`, kind: "yield", source, url: source, capturedAt: pts.length ? pts[pts.length - 1].ts : 0, points: pts.map((p) => ({ ts: p.ts, tvlUsd: p.tvlUsd, apyBase: p.apyBase, apyReward: p.apyReward })) }
  }
}
