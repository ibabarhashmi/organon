/**
 * ORGΛNON — THE LINEAGE WALLS (Lineage sprint; X-LINEAGE b,c,d). The three walls that make the Stamp prove its bloodline
 * at the render — built ON TOP of the byte-frozen Stamp (this module edits ZERO Stamp bytes and changes ZERO Stamp math;
 * it RE-RESOLVES the subject's own series and RENDERS the lineage honestly). Pure functions over a resolved SeriesIdentity:
 *
 *   · WALL 1 — SAMPLE-NEVER-GO AT THE RENDER (S45). `guardRender(verdict, identity)` — a GO/NO-GO may render ONLY off a
 *     per-subject series that is provenance-REAL and clears the length floor; a SAMPLE/short series → INSUFFICIENT, an
 *     absent series → UNAVAILABLE. Enforced on the RENDERED payload (renderStamp + the Ask VALIDATION path call this), so
 *     a stale cache or template path can never resurrect a SAMPLE-fed GO. Positive-controlled.
 *   · WALL 2 — PER-SUBJECT DISTINCTNESS + THE LINEAGE LINE (S46). `resolveIdentity` hashes the subject's OWN resolved
 *     return series (recomputable from the series in the test — the derivation asserted); `lineageLine` renders the
 *     unmissable source · REAL/SAMPLE · as-of · N · hash-prefix; `distinct` catches two subjects sharing one lineage.
 *   · WALL 3 — GO-STRENGTH LEGIBILITY, MATH UNTOUCHED (S47). `strengthLine(familyN)` states the deflation pressure in
 *     plain words (n=1 explicitly the weakest form — nothing was deflated away); `capSig(dsr)` caps the DISPLAY at the
 *     pinned digits (a near-1 value → "≥ 0.9999", never sixteen digits, never a bare "1.0000") while the RAW value stays
 *     full-precision in the record (capped display, uncapped record). No word, threshold, or formula is touched.
 *
 * IMPORT DISCIPLINE (X-OPTIN / S16): this module imports ONLY DataPlane (the mass-path data layer) + node:crypto — NOT
 * the Stamp runtime (the attest core). So `reality.ts` may import it at module level without pulling the adjudicator onto
 * the mass path. The return derivation is inlined (kept byte-identical to `Stamp.poolReturnsFromSeries`, which is frozen
 * this sprint; the cross-check `resolveIdentity(k).nPoints === stampFor(k).nObs` is a standing wall test).
 */
import { createHash } from "node:crypto"
import { DataPlane } from "../dataplane/store"

export namespace Lineage {
  export const SERIES_FLOOR = 60 // matches the Stamp's own MIN_OBSERVATIONS — a shorter series can never render a GO/NO-GO
  export const CAP_DIGITS = 4 // the displayed significance is capped to at most this many decimals (the raw value is untouched)

  export interface SeriesIdentity {
    poolKey: string
    source: string | null
    reality: string // the resolved series provenance ("REAL-PIT" | "ILLUSTRATIVE" | "BLOCKED" | …) — the WALL-1 gate reads this
    asOf: number | null // the capture timestamp (ms)
    nPoints: number // the Stamp-usable recorded return points
    seriesContentHash: string // sha256 of the subject's OWN resolved return series (canonical) — WALL 2's derivation source
  }

  export interface GuardResult { verdict: string; degraded: boolean; reason: string }

  // the byte-frozen return derivation (identical to Stamp.poolReturnsFromSeries — inlined to keep the attest core off the
  // mass path; the sync is asserted by the resolveIdentity/stampFor nObs cross-check test)
  function returnsFrom(s: DataPlane.Series | null): number[] {
    if (!s || !s.points.length) return []
    return [...s.points]
      .sort((a, b) => a.ts - b.ts)
      .map((p) => { const b = (p.apyBase ?? null) as number | null; const r = (p.apyReward ?? null) as number | null; return b === null ? null : (b + (r ?? 0)) / 100 / 365 })
      .filter((x): x is number => x !== null && Number.isFinite(x))
  }

  // ── WALL 2 core — resolve the subject's OWN series identity (mirrors the Stamp's resolution: chart series first, then the
  // pool key). Returns null ⟺ the Stamp is UNAVAILABLE (no usable recorded return series) — the exact correspondence keeps
  // the lineage line and the Stamp verdict in lock-step. Deterministic; a pure read of the adapter. ──
  export function resolveIdentity(poolKey: string, adapter: DataPlane.Adapter = DataPlane.snapshotAdapter): SeriesIdentity | null {
    const chartKey = poolKey.replace(":pool:", ":chart:")
    const s = adapter.fetchSeries(chartKey) ?? adapter.fetchSeries(poolKey)
    if (!s) return null
    const returns = returnsFrom(s)
    if (!returns.length) return null // no Stamp-usable series (e.g. a funding series carries no apyBase) → UNAVAILABLE, no identity
    return {
      poolKey,
      source: s.provenance.source,
      reality: s.provenance.reality,
      asOf: s.provenance.capturedAt ?? null,
      nPoints: returns.length,
      seriesContentHash: createHash("sha256").update(JSON.stringify(returns)).digest("hex"),
    }
  }

  // ── WALL 1 — SAMPLE-NEVER-GO AT THE RENDER (S45). A GO/NO-GO may render ONLY off a per-subject, provenance-REAL series
  // that clears the floor; else the payload is DEGRADED at the render boundary. INSUFFICIENT/UNAVAILABLE pass through
  // (already honest). Pure — testable with a seeded payload, independent of the live resolution. ──
  export function guardRender(verdict: string, identity: SeriesIdentity | null, floor: number = SERIES_FLOOR): GuardResult {
    if (verdict !== "GO" && verdict !== "NO-GO") return { verdict, degraded: false, reason: "" }
    if (!identity) return { verdict: "UNAVAILABLE", degraded: true, reason: "the render resolved NO per-subject recorded series for this pool — a Stamp verdict cannot render off absent blood (a fresh clone, a SAMPLE pool, or an unrecorded pool)." }
    if (identity.reality !== "REAL-PIT") return { verdict: "INSUFFICIENT", degraded: true, reason: `the resolved series is ${identity.reality} (not REAL-PIT) — a GO/NO-GO may NOT render off a non-REAL series; the honest verdict is INSUFFICIENT until a real recorded series exists.` }
    if (identity.nPoints < floor) return { verdict: "INSUFFICIENT", degraded: true, reason: `the resolved series is ${identity.nPoints} recorded points, below the ${floor}-point floor — too short to render a hard verdict; INSUFFICIENT until more real history is recorded.` }
    return { verdict, degraded: false, reason: "" }
  }

  // ── WALL 2 — per-subject distinctness. Two DISTINCT pools sharing one series identity (a bleed) is a collision. ──
  export interface Collision { seriesContentHash: string; pools: string[] }
  export function distinct(identities: (SeriesIdentity | null)[]): { ok: boolean; collisions: Collision[] } {
    const byHash = new Map<string, Set<string>>()
    for (const id of identities) {
      if (!id) continue
      if (!byHash.has(id.seriesContentHash)) byHash.set(id.seriesContentHash, new Set())
      byHash.get(id.seriesContentHash)!.add(id.poolKey)
    }
    const collisions: Collision[] = [...byHash.entries()]
      .filter(([, pools]) => pools.size > 1) // the SAME series hash under two DIFFERENT pools = a bleed
      .map(([seriesContentHash, pools]) => ({ seriesContentHash, pools: [...pools] }))
    return { ok: collisions.length === 0, collisions }
  }

  // ── WALL 2 render — the unmissable lineage line (source · REAL/SAMPLE · as-of · N · series-hash prefix). ──
  export function lineageLine(identity: SeriesIdentity | null): string {
    if (!identity) return "lineage: no recorded return series resolved for this pool — the Stamp is UNAVAILABLE (a fresh clone, a SAMPLE pool, or an unrecorded pool); nothing to prove a bloodline from."
    const realLabel = identity.reality === "REAL-PIT" ? "REAL" : identity.reality
    const asOf = identity.asOf ? new Date(identity.asOf).toISOString().slice(0, 10) : "unknown"
    return `lineage: ${identity.source ?? "unknown source"} · ${realLabel} · as-of ${asOf} · ${identity.nPoints} recorded return points · series ${identity.seriesContentHash.slice(0, 12)}…`
  }

  // ── WALL 3 render — the deflation pressure in plain words. n=1 is the weakest form (nothing to deflate away); absent
  // (familyN 0, no verdict earned) → no strength line. Never touches a number, threshold, or word. ──
  export function strengthLine(familyN: number): string {
    if (familyN <= 0) return ""
    if (familyN === 1) return "strength: deflation counted 1 attempt — the WEAKEST form of GO: a single submission, so there was no multiple-testing search to deflate away (nothing was deflated away). The pass rests on the one recorded track record alone."
    return `strength: deflation counted ${familyN} attempts — the verdict survived a ${familyN}-way multiple-testing charge (a stronger pass: the search was penalised and it held).`
  }

  // ── WALL 3 render — cap the DISPLAYED significance (never the recorded value). A value at/above the ceiling renders
  // "≥ 0.9999" (honest: at least this strong, not rendered more precisely) — never sixteen digits, never a bare "1.0000"
  // that would imply exactness. The RAW value stays full-precision in StampResult.dsr + the reproHash. ──
  export function capSig(dsr: number | null, digits: number = CAP_DIGITS): string {
    if (dsr === null || !Number.isFinite(dsr)) return "n/a"
    const ceil = 1 - Math.pow(10, -digits) // 0.9999 for digits=4
    if (dsr >= ceil) return `≥ ${ceil.toFixed(digits)}` // near-1: an honest ceiling, not precision theater, not a false 1.0
    if (dsr < 0) return "< 0"
    return dsr.toFixed(digits)
  }
}
