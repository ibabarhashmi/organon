/**
 * ORGΛNON — THE GECKOTERMINAL PROVIDER (Deepening Phase 2; Rules X-HONEST, X-LEAN, X-COVER). Closes the one unwired
 * provider (deviation D3, now RESOLVED). It feeds the NEW liquidity-depth axis: a DEX/LP pool's `reserve_in_usd` is its
 * exit liquidity — thin liquidity is real slippage/exit risk. One small pure function per endpoint used, keyless, no SDK,
 * no "provider registry" (PART CLEAN — GeckoTerminal is one more small client, not a framework). Every value is REAL
 * (fetched now) or SAMPLE (a labeled placeholder). A dead endpoint / 429 (GeckoTerminal free ≈ 30 req/min) / malformed
 * body degrades to last-good (stale, REAL) or SAMPLE — NEVER a throw to the UI, NEVER a fabricated value. The `fetch`
 * is an injectable seam so the battery runs deterministically offline. Mirrors defillama.ts by construction.
 *
 * V-LIVE (2026-07-08): /networks/eth/pools 200, 20 pools, keyless; a pool carries {name, reserve_in_usd, volume_usd.h24,
 * pool_created_at, market_cap_usd}. Recorded in data/honesty/evidence/vlive-geckoterminal.json.
 */
import { DataPlane } from "../store"

export namespace GeckoTerminal {
  export type Reality = "REAL" | "SAMPLE"
  export const BASE = "https://api.geckoterminal.com/api/v2"
  export const CACHE_TTL_MS = 60_000 // short-TTL in-memory cache — absorbs a click-storm (S2), keeps asOf honest (S3)

  export interface Pool { network: string; address: string; name: string; reserveUsd: number | null; volumeUsd24h: number | null; createdAt: number | null; marketCapUsd: number | null; fdvUsd: number | null }
  export interface Tagged<T> { value: T; reality: Reality; asOf: number; source: string; note?: string }

  // the injectable fetch seam (default = global fetch). Tests inject a fixture / a 429 / a throwing impl.
  export interface FetchResult { ok: boolean; status: number; json(): Promise<unknown> }
  export type FetchImpl = (url: string) => Promise<FetchResult>
  const globalFetch: FetchImpl = (url) => fetch(url, { headers: { Accept: "application/json" } }) as unknown as Promise<FetchResult>

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

  const num = (x: unknown): number | null => { const n = typeof x === "string" ? Number(x) : x; return typeof n === "number" && Number.isFinite(n) ? n : null }
  // boundary validation: a value outside a sane band is nonsense (adversarial / malformed) → treated as MISSING (null),
  // never a nonsense verdict input (S8). Missing stays missing — never coerced to 0.
  const band = (v: number | null, lo: number, hi: number): number | null => (v === null ? null : v < lo || v > hi ? null : v)

  // parse one raw /pools row (JSON:API attributes) → a validated Pool, or null if unusable — pure.
  export function parsePool(network: string, raw: unknown): Pool | null {
    const r = raw as { id?: string; attributes?: Record<string, unknown> }
    const a = r?.attributes
    if (!a || typeof a.address !== "string") return null
    const created = Date.parse(String(a.pool_created_at ?? ""))
    return {
      network, address: a.address as string, name: String(a.name ?? ""),
      reserveUsd: band(num(a.reserve_in_usd), 0, 1e13),
      volumeUsd24h: band(num((a.volume_usd as { h24?: unknown } | undefined)?.h24), 0, 1e13),
      createdAt: Number.isFinite(created) ? created : null,
      marketCapUsd: band(num(a.market_cap_usd), 0, 1e14),
      fdvUsd: band(num(a.fdv_usd), 0, 1e15),
    }
  }

  // a labeled SAMPLE pool so a caller can boot with ZERO setup / no network. Clearly SAMPLE — never styled REAL.
  export const SAMPLE_POOL: Pool = { network: "eth", address: "0xSAMPLE", name: "USDC / USDT (SAMPLE)", reserveUsd: 8_000_000, volumeUsd24h: 20_000_000, createdAt: Date.parse("2022-01-01T00:00:00Z"), marketCapUsd: null, fdvUsd: null }

  // /networks/{network}/pools → the top pools, tagged. On no data → a labeled SAMPLE pool (honest).
  export async function topPools(network: string, now: number, fetchImpl: FetchImpl = globalFetch): Promise<Tagged<Pool[]>> {
    const url = `${BASE}/networks/${network}/pools`
    const { body, reality, note } = await getJson(url, now, fetchImpl)
    const data = (body as { data?: unknown })?.data
    if (!Array.isArray(data)) return { value: [SAMPLE_POOL], reality: "SAMPLE", asOf: now, source: url, note: note ?? "no data — SAMPLE" }
    const pools = data.map((d) => parsePool(network, d)).filter(Boolean) as Pool[]
    if (!pools.length) return { value: [SAMPLE_POOL], reality: "SAMPLE", asOf: now, source: url, note: "empty — SAMPLE fallback" }
    return { value: pools, reality, asOf: now, source: url, note }
  }

  // /networks/{network}/pools/{address} → one pool's liquidity depth, tagged. Absent → SAMPLE (never fabricated).
  export async function pool(network: string, address: string, now: number, fetchImpl: FetchImpl = globalFetch): Promise<Tagged<Pool | null>> {
    const url = `${BASE}/networks/${network}/pools/${address}`
    const { body, reality, note } = await getJson(url, now, fetchImpl)
    const data = (body as { data?: unknown })?.data
    const p = data ? parsePool(network, data) : null
    if (!p) return { value: null, reality: "SAMPLE", asOf: now, source: url, note: note ?? "no pool" }
    return { value: p, reality, asOf: now, source: url, note }
  }

  // ── the RECORD mapping (X-MOAT): a REAL fetched pool → a content-addressed SnapshotFile the store can append. Pure —
  // the recording (recordReal → DataPlane.capture) is done by the runtime capture path, never at parse time.
  export function poolSnapshot(p: Pool, ts: number): DataPlane.SnapshotFile {
    const url = `${BASE}/networks/${p.network}/pools/${p.address}`
    return { key: `geckoterminal:pool:${p.network}:${p.address}`, kind: "volume", source: "geckoterminal:api/v2/pools", url, capturedAt: ts, points: [{ ts, reserveUsd: p.reserveUsd, volumeUsd24h: p.volumeUsd24h, marketCapUsd: p.marketCapUsd, fdvUsd: p.fdvUsd }] }
  }
}
