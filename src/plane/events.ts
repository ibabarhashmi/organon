/**
 * ORGΛNON SOVEREIGN PLANE — POOL-EVENTS (Sovereign Spine B, path 2; X-PLANE a,b,c). Envio HyperSync extraction of ONLY
 * the enumerated events per shelf pool — the axes gain REAL time-series where the rented plane gives only snapshots.
 * Load-bearing:
 *   (a) THE NARROW FENCE (S40) — extractEnumerated keeps ONLY the pinned event set {rate-update, tvl-move, liquidity-move};
 *       an un-enumerated event name is IGNORED (never a full-protocol index; a fourth event class is a re-pin, not a drift).
 *   (b) FREE-FIRST, OPTIONAL SEAM — the HyperSync free-tier token (env HYPERSYNC_TOKEN) is OPTIONAL like BYOK: absent →
 *       the path DEGRADES to the rented plane, honestly recorded, NEVER a crash. Plain fetch, NO shipped SDK.
 *   (c) GAP-HONEST — no synthetic events; the extracted series carries only what the chain emitted, sorted by ts.
 * The plane DEEPENS; it overwrites nothing (the divergence between own-plane and rented is SURFACED — see divergence.ts).
 */
export namespace PlaneEvents {
  // X-PLANE(a): the PINNED enumerated event set per shelf pool — a fourth event class is a conscious re-pin.
  export type EventType = "rate-update" | "tvl-move" | "liquidity-move"
  export const ENUMERATED: readonly EventType[] = ["rate-update", "tvl-move", "liquidity-move"] as const

  export interface PoolEvent { ts: number; type: EventType; value: number }
  // a raw decoded HyperSync log (an event NAME + a ts + a value) — the caller filters to the enumerated set.
  export interface RawEvent { ts: number; name: string; value: number }

  // THE FENCE (S40): extract ONLY the enumerated events — an un-enumerated event name is IGNORED (never a full index).
  // Gap-honest (no synthetic events, no interpolation); non-finite dropped; sorted by ts.
  export function extractEnumerated(raw: RawEvent[]): PoolEvent[] {
    const allow = new Set<string>(ENUMERATED)
    return raw
      .filter((r) => allow.has(r.name)) // the narrow fence — un-enumerated types are ignored, not indexed
      .filter((r) => Number.isFinite(r.ts) && Number.isFinite(r.value))
      .map((r) => ({ ts: r.ts, type: r.name as EventType, value: r.value }))
      .sort((a, b) => a.ts - b.ts)
  }

  // the optional-seam MODE (X-PLANE b): the free-tier token present → own-plane; absent → degrade to the rented plane.
  export type Mode = "OWN-PLANE" | "DEGRADED-RENTED"
  export function mode(token: string | null | undefined): Mode { return token ? "OWN-PLANE" : "DEGRADED-RENTED" }

  export interface CaptureResult { mode: Mode; source: string; events: PoolEvent[] }

  // capture a shelf pool's enumerated events. token present + a HyperSync fetch seam → own-plane extract (fenced);
  // token absent → DEGRADE to the rented fallback, the ACTUAL source recorded honestly (never stamped own-plane). A
  // HyperSync fetch failure also degrades (degrade-never-crash). Plain fetch via the injected seam — no shipped SDK.
  export async function capture(pool: string, opts: { token?: string | null; fetchHyperSync?: (pool: string, token: string) => Promise<RawEvent[]>; rentedFallback?: () => PoolEvent[] }): Promise<CaptureResult> {
    if (opts.token && opts.fetchHyperSync) {
      try {
        const raw = await opts.fetchHyperSync(pool, opts.token)
        return { mode: "OWN-PLANE", source: "hypersync:events (own-plane)", events: extractEnumerated(raw) }
      } catch {
        // a live HyperSync failure degrades honestly to the rented plane (never a crash, never a fabricated series)
      }
    }
    return { mode: "DEGRADED-RENTED", source: "rented (HYPERSYNC_TOKEN absent or HyperSync unreachable → degrade, honest)", events: opts.rentedFallback ? opts.rentedFallback() : [] }
  }
}
