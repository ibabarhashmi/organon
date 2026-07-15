/**
 * ORGΛNON — THE RECKONING SPRINT (V44), Phase 3: V43's TWO DEFECTS CLOSED (S190, S191). Never sheds.
 *
 * O-1: V43's census transfer map summed a NEW-WALL addition into the demonstrated-movement identity — reconciling but
 * re-blurring the transfer-vs-addition distinction. S190 separates CONSERVATION (transfers net to zero) from GROWTH (new walls
 * change the total) — two identities, never one. O-2: the redesignSearchHashes re-basing (d5147f8d→7d63b5e2) shipped untagged;
 * S191 tags it and asserts stability V44→V45. Each wall is positive-controlled with a seeded negative.
 */
import { test, expect } from "bun:test"
import { Continuity } from "../../src/organon/continuity"
import { HistoricalAct } from "../../src/organon/historical"

// ── S190 (W-RK01) — THE CENSUS, TWO IDENTITIES (O-1: never sum a transfer and an addition) ──

test("S190 (W-RK01) — the census reconciles as CONSERVATION (transfers net to zero) + GROWTH (new walls change the total) — two separate identities", () => {
  // 8 new walls all DEMONSTRATED: pure growth, no transfers
  const now = { DEMONSTRATED: 108, WEAK: 0, EXEMPT: 2, ORIGIN_UNRECORDED: 78, total: 188 }
  const prev = { DEMONSTRATED: 100, WEAK: 0, EXEMPT: 2, ORIGIN_UNRECORDED: 78, total: 180 }
  const t = Continuity.censusPartition(now, prev, { DEMONSTRATED: 8, WEAK: 0, EXEMPT: 0, ORIGIN_UNRECORDED: 0 }, 0)
  expect(t.reconciles).toBe(true)
  expect(t.conservation.sumsToZero).toBe(true) // no transfers
  expect(t.growth.reconciles).toBe(true) // 188 === 180 + 8 − 0
  expect(t.growth.wallsAdded).toBe(8)
})

test("S190 (W-RK01) — a TRANSFER (reclassification OU→DEMONSTRATED) nets to zero in CONSERVATION and leaves the total unchanged in GROWTH", () => {
  // 8 new walls + 1 reclassification (OU→DEM): the transfer is conserved, the growth is only the new walls
  const now = { DEMONSTRATED: 109, WEAK: 0, EXEMPT: 2, ORIGIN_UNRECORDED: 77, total: 188 }
  const prev = { DEMONSTRATED: 100, WEAK: 0, EXEMPT: 2, ORIGIN_UNRECORDED: 78, total: 180 }
  const t = Continuity.censusPartition(now, prev, { DEMONSTRATED: 8, WEAK: 0, EXEMPT: 0, ORIGIN_UNRECORDED: 0 }, 0)
  expect(t.reconciles).toBe(true)
  expect(t.conservation.sumOfTransfers).toBe(0) // DEM +1, OU −1 → net 0 (the reclassification is a transfer, not a birth)
  expect(t.growth.reconciles).toBe(true) // total still 188 === 180 + 8 (the transfer did NOT change the total)
})

test("S190 (W-RK01) — SEEDED NEGATIVE: growth FAKED by a transfer (total moved by more than walls born) FAILS", () => {
  const prev = { DEMONSTRATED: 100, WEAK: 0, EXEMPT: 2, ORIGIN_UNRECORDED: 78, total: 180 }
  // total +9 but only 8 walls born + a phantom count from nowhere — the two identities catch it (GROWTH does not reconcile)
  const bad = { DEMONSTRATED: 109, WEAK: 0, EXEMPT: 2, ORIGIN_UNRECORDED: 78, total: 189 }
  const t = Continuity.censusPartition(bad, prev, { DEMONSTRATED: 8, WEAK: 0, EXEMPT: 0, ORIGIN_UNRECORDED: 0 }, 0)
  expect(t.reconciles).toBe(false)
  expect(t.growth.reconciles).toBe(false)
  expect(t.contradiction).toMatch(/GROWTH does not reconcile/)
})

test("S190 (W-RK01) — SEEDED NEGATIVE: a transfer that does NOT net to zero (a count invented in one bucket) FAILS CONSERVATION", () => {
  const prev = { DEMONSTRATED: 100, WEAK: 0, EXEMPT: 2, ORIGIN_UNRECORDED: 78, total: 180 }
  // DEM +9 (1 more than 8 new walls) but OU unchanged — the extra count did not come from a transfer → conservation ≠ 0
  const bad = { DEMONSTRATED: 109, WEAK: 0, EXEMPT: 2, ORIGIN_UNRECORDED: 78, total: 188 }
  const t = Continuity.censusPartition(bad, prev, { DEMONSTRATED: 8, WEAK: 0, EXEMPT: 0, ORIGIN_UNRECORDED: 0 }, 0)
  expect(t.reconciles).toBe(false)
  expect(t.conservation.sumsToZero).toBe(false)
})

test("S190 (W-RK01) — the LIVE census reconciles through the two-identity PARTITION (the reconciler is total)", () => {
  const census = Continuity.reconcileAll().results.find((r) => r.type === "PARTITION")
  expect(census).toBeDefined()
  expect(census!.twoIdentity).toBeDefined()
  expect(census!.twoIdentity!.conservation.sumsToZero).toBe(true)
  expect(census!.twoIdentity!.growth.reconciles).toBe(true)
})

// ── S191 (W-RK02) — THE HISTORICAL-HASH RE-BASING, TAGGED + STABLE (O-2) ──

test("S191 (W-RK02) — the redesignSearchHash re-basing is TAGGED {from:d5147f8d, to:7d63b5e2, scheme:immutable-core, at:V44} and stable V44→V45", () => {
  const v = HistoricalAct.rebasingVerdict()
  expect(v.ok).toBe(true)
  const r = HistoricalAct.rebasing()
  expect(r).not.toBeNull()
  expect(r!.from).toBe("d5147f8d")
  expect(r!.scheme).toBe("immutable-core")
  expect(r!.at).toBe("V44")
  expect(r!.stable).toBe(true) // the current immutable-core hash === the tagged `to`
})

test("S191 (W-RK02) — the tagged `to` equals the RECOMPUTED immutable-core hash (stability, not a frozen literal)", () => {
  const r = HistoricalAct.rebasing()!
  // the `to` is re-derivable: it must equal HistoricalAct.hashFile(actFile), not just a pinned string
  expect(r.currentHash).toBe(r.to)
  expect(r.currentHash).toBe(HistoricalAct.hashFile("test-redesign-search.json"))
})

test("S191 (W-RK02) — SEEDED NEGATIVE: an UNTAGGED drift (rendered ≠ stable, no carried) still FAILS S182's stable-or-carried", () => {
  const stable = HistoricalAct.hashFile("test-redesign-search.json")
  const olderScheme = "d5147f8d14be46de4257073639a4bb584f37c6245d71cc707c298ea2b3e507d2" // the OLD chain selfSha
  expect(HistoricalAct.stableOrCarried(olderScheme, stable).ok).toBe(false) // an untagged re-basing looks identical to the disease
  // the re-basing tag is the disclosure that makes the transition honest
  expect(HistoricalAct.rebasingVerdict().ok).toBe(true)
})
