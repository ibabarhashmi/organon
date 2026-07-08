/**
 * ORGΛNON — THE PROVENANCE RECORD (Honesty Layer Phase 1; Rule X-MOAT). The moat, first-class from Phase 1: a
 * competitor can copy the risk lens overnight but cannot retroactively manufacture a timestamped record of WHAT WAS
 * REAL, AND WHEN. Every value the tool SHOWS is either REAL (content-addressed + appended to the append-only,
 * hash-chained PIT record) or SAMPLE (a labeled placeholder, honestly NOT recorded). A value shown as REAL that does
 * not resolve to a recorded snapshot is a HALT (`assertRecorded`). Missing data stays missing — never interpolated.
 *
 * This is a THIN honesty layer OVER the existing PIT store (`./store` — byte-untouched, X-KEEP), which already
 * content-addresses + nonce-anchors + hash-chains snapshots via Capture.Service. The record adds only the honesty
 * semantics the consumer tool needs: the REAL/SAMPLE label, the value-level accessor, the shown-but-recorded guarantee,
 * the user-visible history ("what was real, and when we captured it"), and the tamper-verify. Standalone-native; no leak.
 * The read paths take the existing DataPlane.Adapter seam (default = the committed snapshot store) so they are testable
 * against a synthetic adapter without touching the committed provenance chain.
 */
import { existsSync } from "node:fs"
import { DataPlane } from "./store"
import { Capture } from "../studio/capture"

export namespace ProvRecord {
  export type Reality = "REAL" | "SAMPLE"

  // a value the tool SHOWS. REAL ⇒ it resolves to a recorded, content-addressed snapshot in the PIT record; SAMPLE ⇒ a
  // labeled placeholder (keys/network absent, endpoint dead, unwired) carrying no contentHash and never recorded.
  export interface ShownValue {
    key: string // the series key, e.g. "defillama:pool:<id>"
    field: string // the field within the series, e.g. "apyBase"
    value: number | null
    asOf: number | null // the point-in-time the value was true-as-of (ms); null for SAMPLE
    source: string | null
    contentHash: string | null // the resolving snapshot's contentSha — the moat anchor; null for SAMPLE
    provenance: Reality
  }

  export class ShownButUnrecordedError extends Error {
    constructor(msg: string) { super(msg); this.name = "ShownButUnrecordedError" }
  }

  // record a REAL series into the append-only, hash-chained PIT record (content-addressed + nonce-anchored). The record
  // IS the store's committed provenance chain — recordReal delegates to the store's (already-proven) capture. Returns
  // the capture provenance. A SAMPLE value is NEVER recorded (a fabricated value must not pollute the moat).
  export function recordReal(snap: DataPlane.SnapshotFile, meta?: Parameters<typeof DataPlane.capture>[1]): DataPlane.CaptureResult {
    return DataPlane.capture(snap, meta)
  }

  // resolve a shown value at a point in time. REAL iff a recorded snapshot resolves the field at ts; else SAMPLE (a
  // labeled placeholder built from the caller's `sample`, honestly not recorded). Never fabricates a REAL.
  export function resolveShown(key: string, field: string, ts: number, sample: number | null = null, adapter: DataPlane.Adapter = DataPlane.snapshotAdapter): ShownValue {
    const series = adapter.fetchSeries(key)
    if (series) {
      const pt = DataPlane.asOf(series, ts)
      const v = pt ? (pt[field] ?? null) : null
      if (pt && v !== null) return { key, field, value: v, asOf: pt.ts, source: series.provenance.source, contentHash: series.provenance.contentSha, provenance: "REAL" }
    }
    // no recorded snapshot resolves this field → SAMPLE, labeled, not recorded (missing stays missing)
    return { key, field, value: sample, asOf: null, source: null, contentHash: null, provenance: "SAMPLE" }
  }

  // THE SHOWN-BUT-RECORDED GUARANTEE (X-MOAT): a value labeled REAL MUST resolve to a recorded snapshot whose contentSha
  // matches its contentHash AND whose field is present at its asOf. A fabricated REAL (no contentHash, an unresolvable
  // key, a mismatched hash, or an absent field) is a HALT. SAMPLE is exempt (it is honestly labeled not-recorded).
  export function assertRecorded(v: ShownValue, adapter: DataPlane.Adapter = DataPlane.snapshotAdapter): void {
    if (v.provenance === "SAMPLE") return
    if (!v.contentHash) throw new ShownButUnrecordedError(`REAL value ${v.key}.${v.field} carries no contentHash — a shown-but-unrecorded REAL is forbidden (X-MOAT)`)
    const series = adapter.fetchSeries(v.key)
    if (!series) throw new ShownButUnrecordedError(`REAL value ${v.key}.${v.field} resolves to no recorded snapshot (X-MOAT)`)
    if (series.provenance.contentSha !== v.contentHash) throw new ShownButUnrecordedError(`REAL value ${v.key}.${v.field} contentHash ${v.contentHash.slice(0, 12)}… ≠ the recorded snapshot ${series.provenance.contentSha.slice(0, 12)}… (X-MOAT)`)
    const pt = v.asOf !== null ? DataPlane.asOf(series, v.asOf) : null
    if (!pt || pt[v.field] === undefined || pt[v.field] === null) throw new ShownButUnrecordedError(`REAL value ${v.key}.${v.field} is not present in its recorded snapshot at asOf ${v.asOf} (X-MOAT)`)
  }

  // the user-visible provenance HISTORY for a key — "what was real, and when we captured it" (the moat made visible).
  // The record's head entry (latest capture) + the chain depth; the per-capture walk is the Phase-5 surface concern.
  export interface HistoryEntry { asOf: number; contentHash: string; source: string; chainPos: number }
  export function history(key: string, adapter: DataPlane.Adapter = DataPlane.snapshotAdapter): HistoryEntry[] {
    const prov = adapter.provenance(key)
    if (!prov) return []
    return [{ asOf: prov.capturedAt, contentHash: prov.contentSha, source: prov.source, chainPos: prov.chainPos }]
  }

  // the FULL user-visible provenance history for a key — EVERY capture, oldest→newest ("what was real, and when we
  // captured it", compounding). Walks the committed, hash-chained provenance.jsonl via Capture.Service (a tamper throws).
  // This is the moat made visible: a competitor can copy the lens overnight but cannot reproduce this timestamped record.
  export function fullHistory(key: string): HistoryEntry[] {
    if (!existsSync(DataPlane.paths.PROV_FILE)) return []
    const svc = new Capture.Service(DataPlane.paths.PROV_FILE) // constructs → re-verifies the whole chain
    return svc.all().filter((s) => s.domain === key).map((s, i) => ({ asOf: s.capturedAt, contentHash: s.payloadSha, source: key, chainPos: i }))
  }

  // verify the whole committed record chain (nonce-anchored, hash-chained) — a tamper/retro/backfill throws in the store.
  // Returns per-key capture depth. On a fresh clone (no chain) returns present:false, ok:true (absent, disclosed).
  export function verify(): { present: boolean; ok: boolean; keys: Record<string, number>; total: number } {
    return DataPlane.verifyProvenanceChain()
  }
}
