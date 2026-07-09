/**
 * ORGΛNON SOVEREIGN PLANE — FUNDING-HISTORY (Sovereign Spine B, path 1; X-PLANE a,b,c,e). The tool stops RENTING its
 * funding senses. A thin `fetch → normalize → hash → record` orchestrator over the KEYLESS public funding sources —
 * the Hyperliquid public info endpoint (keyless, reuses src/dataplane/hyperliquid.ts) and the Binance/Bybit public
 * funding archives (keyless, reuses src/dataplane/funding.ts's CSV reconstruct) — recording a genuinely LONGER REAL
 * series into the moat that the delta-neutral vertical + the Stamp read. Every clause of X-PLANE is load-bearing here:
 *
 *   (a) NARROW + PINNED — exactly the three pinned venues {hyperliquid, binance, bybit}; a fourth is a re-pin, never a drift.
 *   (b) FREE-FIRST, DEGRADE-NEVER-CRASH — each source is an injectable seam (plain fetch, NO shipped SDK → hermetic tests);
 *       a dead source THROWS and the caller records the ACTUAL fallback source, never stamps a fallback own-plane (Attack-8).
 *   (c) GAP-HONEST, FABRICATION-FREE — normalize NEVER interpolates a missing interval (a gap STAYS a gap; the series
 *       carries its holes); assertNoFabrication is a positive-controlled guard — a point at a ts the venue never returned
 *       is a FABRICATED history point and is REFUSED before it can reach the moat (S39). A re-capture is hash-stable.
 *   (e) HONEST IMPROVEMENT ONLY — the plane hands the Stamp a longer series; the decay/ICIR/MinTRL math is UNTOUCHED, so
 *       INSUFFICIENT can retreat ONLY as the mathematical consequence of the observation count honestly crossing a floor.
 *
 * The plane DEEPENS the narrow path under NEW keys (`plane:funding:{venue}:{coin}`); it overwrites nothing — the rented
 * DeFiLlama breadth stays, and the frozen differential (funding bybit = ILLUSTRATIVE 0a63151b…) reads a byte-untouched
 * input (no bybit key enters FUNDING_REAL_KEY). Standalone-native; the leak wall holds.
 */
import { DataPlane } from "../dataplane/store"
import { Hyperliquid } from "../dataplane/hyperliquid"
import { DataPlaneFunding } from "../dataplane/funding"

export namespace PlaneFunding {
  // X-PLANE(a): the PINNED venues — exactly these three; a fourth is a conscious re-pin (sovereign-pins.plane.pathList[0]).
  export type Venue = "hyperliquid" | "binance" | "bybit"
  export const VENUES: readonly Venue[] = ["hyperliquid", "binance", "bybit"] as const

  // a venue-agnostic normalized funding point.
  export interface FundingPoint { ts: number; rate: number; intervalHours: number }

  export class FabricatedHistoryError extends Error {
    constructor(message: string) { super(message); this.name = "FabricatedHistoryError" }
  }

  // an INJECTABLE source seam (X-PLANE b) — a venue-specific fetch that returns raw normalized points or THROWS (a dead
  // endpoint). Plain fetch, no SDK. The hermetic tests inject a fixture source; the live sources hit the real endpoints.
  export interface Source {
    venue: Venue
    keyless: boolean
    tier: "T1" | "T2-FORWARD"
    intervalHours: number
    fetch(coin: string, startTimeMs: number): Promise<FundingPoint[]>
  }

  export interface Gap { from: number; to: number; missingIntervals: number }
  export interface NormalizeResult { series: FundingPoint[]; gaps: Gap[] }

  // GAP-HONEST normalize (X-PLANE c): drop non-finite, sort by ts, dedupe exact-ts duplicates (keep first) — but NEVER
  // fill a missing interval. A gap between consecutive points is LEFT as a gap; `gaps` names the holes honestly. No
  // smoothing, no backfill, no synthetic point. A shorter honest series beats a longer fabricated one.
  export function normalize(points: FundingPoint[], intervalHours: number): NormalizeResult {
    const clean = points.filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.rate)).sort((a, b) => a.ts - b.ts)
    const series: FundingPoint[] = []
    const seen = new Set<number>()
    for (const p of clean) {
      if (seen.has(p.ts)) continue
      seen.add(p.ts)
      series.push({ ts: p.ts, rate: p.rate, intervalHours })
    }
    const gaps: Gap[] = []
    const stepMs = intervalHours * 3600_000
    for (let i = 1; i < series.length; i++) {
      const missing = Math.round((series[i].ts - series[i - 1].ts) / stepMs) - 1
      if (missing >= 1) gaps.push({ from: series[i - 1].ts, to: series[i].ts, missingIntervals: missing })
    }
    return { series, gaps }
  }

  // THE FABRICATION GUARD (S39, positive-controlled): every point in the normalized series must trace to a real captured
  // ts. A point at a ts the source never returned is a FABRICATED / interpolated / backfilled history point → REFUSED,
  // before it can reach the moat. Gaps stay gaps; a fabricated point is a Halt.
  export function assertNoFabrication(rawPoints: FundingPoint[], normalized: FundingPoint[]): void {
    const rawTs = new Set(rawPoints.map((p) => p.ts))
    for (const p of normalized) {
      if (!rawTs.has(p.ts)) throw new FabricatedHistoryError(`fabricated history point at ts=${p.ts} — not in the captured source (no interpolation/backfill into REAL; gaps stay gaps)`)
    }
  }

  // build the content-addressable snapshot for a normalized series (the same shape the moat hashes) — pure, so a
  // re-capture of the same range is HASH-STABLE (X-PLANE c). key: plane:funding:{venue}:{coin}.
  export function snapshotFor(venue: Venue, coin: string, series: FundingPoint[], capturedAt: number): DataPlane.SnapshotFile {
    return { key: `plane:funding:${venue}:${coin}`, kind: "rate", source: `plane:${venue}:fundingHistory`, url: `plane://${venue}/fundingHistory`, capturedAt, points: series.map((p) => ({ ts: p.ts, rate: p.rate })) }
  }
  export function contentSha(venue: Venue, coin: string, series: FundingPoint[]): string {
    // capturedAt is excluded from the content identity (it is capture metadata, not the series) — re-capture is stable.
    return DataPlane.contentSha(snapshotFor(venue, coin, series, 0))
  }

  export interface PlaneCapture { venue: Venue; coin: string; key: string; contentSha: string; nonce: string; chainPos: number; tier: string; nPoints: number; gaps: number; window: { start: number; end: number } | null }

  // CAPTURE a venue's funding history INTO THE MOAT (content-hashed + nonce-anchored, gap-honest). fetch → normalize →
  // GUARD → record. A dead source throws out of `source.fetch` (the caller degrades honestly). NEVER records an empty or
  // fabricated series. This is the moat-persist path (an operator capture-time step); the pure logic above is what the
  // hermetic battery exercises deterministically.
  export async function capture(source: Source, coin: string, startTimeMs: number, capturedAt: number): Promise<PlaneCapture> {
    const raw = await source.fetch(coin, startTimeMs)
    if (!raw.length) throw new Error(`${source.venue} ${coin}: empty funding series (ABSENT — never fabricated)`)
    const { series, gaps } = normalize(raw, source.intervalHours)
    assertNoFabrication(raw, series) // the S39 guard — a fabricated point never reaches the moat
    const snap = snapshotFor(source.venue, coin, series, capturedAt)
    const cap = DataPlane.capture(snap, { origin: "manual" })
    const window = series.length ? { start: series[0].ts, end: series[series.length - 1].ts } : null
    return { venue: source.venue, coin, key: snap.key, contentSha: cap.contentSha, nonce: cap.nonce, chainPos: cap.chainPos, tier: source.tier, nPoints: series.length, gaps: gaps.length, window }
  }

  // HONEST read-back for the Stamp / the delta-neutral vertical (X-PLANE e): the recorded REAL series at-or-before ts
  // (point-in-time, no lookahead), or null → the caller renders SAMPLE/UNVERIFIED, NEVER fabricated. The plane deepens
  // the funding FACTS; the readers' math is untouched.
  export function readSeries(key: string, ts: number = Infinity, adapter: DataPlane.Adapter = DataPlane.snapshotAdapter): { points: FundingPoint[]; provenanceRef: string } | null {
    const s = adapter.fetchSeries(key)
    if (!s) return null
    const pts = s.points.filter((p) => p.ts <= ts).map((p) => ({ ts: p.ts, rate: (p.rate ?? 0) as number, intervalHours: 1 }))
    return pts.length ? { points: pts, provenanceRef: s.provenance.contentSha } : null
  }

  // ── the built-in LIVE sources (plain fetch, NO SDK) — the keyless public endpoints, wrapping the existing reconstructors ──

  // Hyperliquid public info — keyless, hourly, T2-FORWARD (captured forward with a nonce, never retro-claimed).
  export const hyperliquidSource: Source = {
    venue: "hyperliquid",
    keyless: true,
    tier: "T2-FORWARD",
    intervalHours: Hyperliquid.INTERVAL_HOURS,
    async fetch(coin, startTimeMs) {
      const raw = await Hyperliquid.fetchFunding(coin, startTimeMs)
      return Hyperliquid.reconstruct(raw).map((p) => ({ ts: p.ts, rate: p.rate, intervalHours: Hyperliquid.INTERVAL_HOURS }))
    },
  }

  // a public-ARCHIVE source (Binance/Bybit) — keyless immutable dumps. The archive fetch (zip → CSV) is the injected seam
  // (fetchCsv); the row parse reuses the existing byte-faithful CSV reconstruct (no smoothing/interpolation). This is how
  // the Binance/Bybit paths are built + fixture-proven; the live archive fetch is the swap-in seam.
  export function archiveSource(venue: "binance" | "bybit", fetchCsv: (coin: string, startTimeMs: number) => Promise<string>, intervalHours: number): Source {
    return {
      venue,
      keyless: true,
      tier: "T1",
      intervalHours,
      async fetch(coin, startTimeMs) {
        const csv = await fetchCsv(coin, startTimeMs)
        return DataPlaneFunding.reconstruct(csv).map((p) => ({ ts: p.ts, rate: p.rate, intervalHours: p.intervalHours }))
      },
    }
  }
}
