/**
 * ORGΛNON — THE HONESTY LAYER, Phase 1 walls (RECORD-TRUE; Rule X-MOAT). The provenance record's honesty semantics,
 * positive-controlled: a REAL value resolves to a recorded, content-addressed snapshot; a SAMPLE value is a labeled
 * placeholder carrying NO contentHash (never recorded); and a value SHOWN as REAL that does not resolve to the record
 * is a HALT (a shown-but-unrecorded REAL, four ways). The committed chain verifies (clone-robust). Zero store writes:
 * the semantics are proven against a synthetic adapter via the existing DataPlane.Adapter seam.
 */
import { test, expect } from "bun:test"
import { DataPlane } from "../../src/dataplane/store"
import { ProvRecord } from "../../src/dataplane/record"

const DAY = 86_400_000
const CSHA = "a".repeat(64)

// a synthetic REAL adapter (one content-addressed pool series) — never touches the committed store
function syntheticAdapter(): DataPlane.Adapter {
  const series: DataPlane.Series = {
    key: "defillama:pool:test-usdc",
    kind: "yield",
    points: [
      { ts: 0, apyBase: 3.1, apyReward: 0.4, tvlUsd: 100 },
      { ts: 1 * DAY, apyBase: 3.2, apyReward: 0.3, tvlUsd: 110 },
    ],
    provenance: { source: "defillama:yields.llama.fi/pools", url: "https://yields.llama.fi/pools", capturedAt: 1 * DAY, contentSha: CSHA, nonce: "n1", chainPos: 0, reality: "REAL-PIT" },
  }
  return {
    name: "synthetic",
    listSeries: () => [series.key],
    fetchSeries: (k) => (k === series.key ? series : null),
    provenance: (k) => (k === series.key ? series.provenance : null),
  }
}
const A = syntheticAdapter()
const KEY = "defillama:pool:test-usdc"

test("a REAL value resolves to a recorded snapshot (content-addressed, point-in-time) and assertRecorded PASSES", () => {
  const v = ProvRecord.resolveShown(KEY, "apyBase", 1 * DAY, null, A)
  expect(v.provenance).toBe("REAL")
  expect(v.value).toBe(3.2)
  expect(v.asOf).toBe(1 * DAY)
  expect(v.contentHash).toBe(CSHA)
  expect(v.source).toContain("defillama")
  expect(() => ProvRecord.assertRecorded(v, A)).not.toThrow()
  // strict point-in-time: a ts between points resolves the PRIOR real value (no lookahead, no interpolation)
  expect(ProvRecord.resolveShown(KEY, "apyBase", 0.5 * DAY, null, A).value).toBe(3.1)
})

test("a SAMPLE value is a labeled placeholder — no contentHash, never recorded — and assertRecorded is a no-op", () => {
  const s = ProvRecord.resolveShown("defillama:pool:does-not-exist", "apyBase", 1 * DAY, 9.9, A)
  expect(s.provenance).toBe("SAMPLE")
  expect(s.value).toBe(9.9) // the caller's honest placeholder
  expect(s.contentHash).toBeNull() // SAMPLE is never in the record
  expect(s.asOf).toBeNull()
  expect(() => ProvRecord.assertRecorded(s, A)).not.toThrow() // SAMPLE is exempt (honestly labeled not-recorded)
})

test("THE SHOWN-BUT-RECORDED GUARANTEE — a value shown as REAL that is not in the record is a HALT (four ways)", () => {
  // (1) a REAL with no contentHash
  expect(() => ProvRecord.assertRecorded({ key: KEY, field: "apyBase", value: 3.2, asOf: 1 * DAY, source: "x", contentHash: null, provenance: "REAL" }, A)).toThrow(ProvRecord.ShownButUnrecordedError)
  // (2) a REAL whose key resolves to no snapshot
  expect(() => ProvRecord.assertRecorded({ key: "ghost", field: "apyBase", value: 3.2, asOf: 1 * DAY, source: "x", contentHash: CSHA, provenance: "REAL" }, A)).toThrow(ProvRecord.ShownButUnrecordedError)
  // (3) a REAL whose contentHash ≠ the recorded snapshot's (a fabricated/tampered anchor)
  expect(() => ProvRecord.assertRecorded({ key: KEY, field: "apyBase", value: 3.2, asOf: 1 * DAY, source: "x", contentHash: "b".repeat(64), provenance: "REAL" }, A)).toThrow(ProvRecord.ShownButUnrecordedError)
  // (4) a REAL claiming a field the snapshot does not carry
  expect(() => ProvRecord.assertRecorded({ key: KEY, field: "ghostField", value: 1, asOf: 1 * DAY, source: "x", contentHash: CSHA, provenance: "REAL" }, A)).toThrow(ProvRecord.ShownButUnrecordedError)
})

test("the user-visible history renders the record head (what was real, and when we captured it)", () => {
  const h = ProvRecord.history(KEY, A)
  expect(h).toHaveLength(1)
  expect(h[0].contentHash).toBe(CSHA)
  expect(h[0].source).toContain("defillama")
  expect(h[0].asOf).toBe(1 * DAY)
  expect(ProvRecord.history("ghost", A)).toEqual([]) // an unrecorded key has no history (honest empty, never faked)
})

test("the committed provenance record chain verifies (append-only, hash-chained; clone-robust)", () => {
  const v = ProvRecord.verify()
  expect(v.ok).toBe(true) // the chain verifies everywhere (nonce-anchored); a tamper/retro would throw in the store
  if (!v.present) {
    console.log("  (honesty_record) provenance chain absent (fresh clone) — re-capturable keyless via script/capture-dataplane.ts")
    return
  }
  // where the chain is present, a REAL committed lending series is shown-but-recorded through the real store (clone-robust
  // on the gitignored payloads: present → REAL + assertRecorded passes; absent → the honest SAMPLE fallback)
  const lendingKey = Object.keys(v.keys).find((k) => k.startsWith("lending:"))
  expect(lendingKey).toBeTruthy()
  const series = DataPlane.snapshotAdapter.fetchSeries(lendingKey!)
  if (!series) {
    console.log("  (honesty_record) lending snapshot payloads gitignored (fresh clone) — the committed chain verifies; the shown value would render the honest SAMPLE fallback")
    const sample = ProvRecord.resolveShown(lendingKey!, "apyBase", 0, null)
    expect(sample.provenance).toBe("SAMPLE") // absent payload → SAMPLE, never a mislabeled REAL
    return
  }
  const field = Object.keys(series.points[series.points.length - 1]).find((f) => f !== "ts" && series.points[series.points.length - 1][f] !== null)!
  const shown = ProvRecord.resolveShown(lendingKey!, field, series.points[series.points.length - 1].ts)
  expect(shown.provenance).toBe("REAL")
  expect(shown.contentHash).toBe(series.provenance.contentSha)
  expect(() => ProvRecord.assertRecorded(shown)).not.toThrow() // the real REAL value passes the shown-but-recorded guard
})
