/**
 * ORGΛNON — THE BACKFILL SPRINT (V43), Phase 1: CONTINUITY MADE TOTAL (S180–S183). The sprint's spine.
 *
 * The continuity discipline that reconciled the battery (S172) was CORRECT and NOT TOTAL — it left the census movement
 * asserted (N-2), the verify sub-check reading the wrong battery (N-1), the deviations reconciled by hand. V43 generalizes it:
 * ONE Continuity.reconcile every countable routes through, the gate ENUMERATING the registry AND diffing the whole marker so a
 * number cannot move unrouted (F-1/RP-1). Each wall is positive-controlled with a seeded negative.
 */
import { test, expect } from "bun:test"
import { Verify } from "../../src/organon/verify"
import { Rollup } from "../../src/organon/rollup"
import { Continuity } from "../../src/organon/continuity"
import { HistoricalAct } from "../../src/organon/historical"
import { Capability } from "../../src/organon/capability"

// ── S180 (W-BF01) — the verify sub-check NAMES its domain (N-1: the last home of the 1281/1941 split) ──

test("S180 (W-BF01) — the verify sub-check names its domain: curated-evidence-subset, NOT 'battery'", () => {
  // the renamed declared set — the third sub-check states its domain (the curated subset, not THE battery)
  expect(Verify.DECLARED_SUBCHECKS[2]).toBe("curated-evidence-subset-matches-committed")
  expect(Verify.subcheckDomain("curated-evidence-subset-matches-committed")).toBe("curated-evidence-subset")
  // every declared sub-check names its domain (none overclaims the full battery)
  expect(Verify.DECLARED_SUBCHECKS.every((n) => Verify.nameStatesItsDomain(n))).toBe(true)
})

test("S180 (W-BF01) — SEEDED NEGATIVE: the OLD name 'battery-count-matches-committed' overclaims → FAILS nameStatesItsDomain", () => {
  // the old name resolves to the full-battery domain (an overclaim for a check that reads the curated subset)
  expect(Verify.subcheckDomain("battery-count-matches-committed")).toBe("full-battery")
  expect(Verify.nameStatesItsDomain("battery-count-matches-committed")).toBe(false) // REFUSES — the name implies a domain it does not check
})

// ── S181 (W-BF02) — the ONE reconciler + the pinned registry + the marker-diff (N-2/F-1/RP-1) ──

test("S181 (W-BF02) — every registered countable reconciles through the ONE reconciler; continuity is TOTAL", () => {
  const chk = Continuity.check()
  expect(chk.ok).toBe(true)
  const all = Continuity.reconcileAll()
  expect(all.allReconcile).toBe(true)
  expect(all.failures).toEqual([])
  // every registry countable produced a reconciliation (the reconciler is total over the registry)
  expect(all.results.length).toBe(Continuity.registry().length)
})

test("S181 (W-BF02) — the reconciler is TYPED (F-4/RP-4): the census is a PARTITION with a MOVED transfer map, not a delta", () => {
  const census = Continuity.reconcileAll().results.find((r) => r.type === "PARTITION")
  expect(census).toBeDefined()
  // the census movement is shown as a TRANSFER (new walls + reclassification), not a bare delta from nowhere (N-2)
  expect(census!.moved).not.toBeNull()
  expect(census!.moved!.display).toMatch(/demonstrated \d+ \+ newWalls-demonstrated \d+ \+ reclassified-from-OU -?\d+ === \d+/)
})

test("S181 (W-BF02) — SEEDED NEGATIVE: a moved-but-UNROUTED countable (a V44-style new number) REFUSES", () => {
  // F-1/RP-1: the gate diffs the whole marker; a changed number not in the registry and not exempt is UNCLASSIFIED → refuse
  const snap = Continuity.snapshot()
  const seeded = { ...snap, backfillDepth: 500 } // a new countable forgotten from the registry
  const chk = Continuity.check(seeded)
  expect(chk.ok).toBe(false)
  if (!chk.ok) expect(chk.reason).toMatch(/UNCLASSIFIED number moved.*backfillDepth/)
  // and it PASSES when the same number is explicitly exempted (derived-not-countable)
  expect(Continuity.check(seeded, ["backfillDepth"]).ok).toBe(true)
})

test("S181 (W-BF02) — SEEDED NEGATIVE: a moved INVARIANT (deps 2→3) REFUSES (a constitutional invariant cannot drift)", () => {
  const seeded = { ...Continuity.snapshot(), deps: 3 }
  const chk = Continuity.check(seeded)
  expect(chk.ok).toBe(false)
  if (!chk.ok) expect(chk.reason).toMatch(/INVARIANT deps moved/)
})

test("S181 (W-BF02) — the ADDITIVE reconciler catches a wrong independently-pinned delta (a seeded battery mismatch)", () => {
  const c = { key: "battery.pass", type: "ADDITIVE" as const, markerPath: "battery[0]", note: "" }
  // prev 1941 + added 5 − removed 0 === 1946, but now is 2000 → does NOT reconcile
  expect(Continuity.reconcile(c, 2000, 1941, { added: 5 }).reconciles).toBe(false)
  expect(Continuity.reconcile(c, 1946, 1941, { added: 5 }).reconciles).toBe(true)
})

test("S181 (W-BF02) — the marker-diff finds EVERY changed number (the guarantee is the diff, not the registry)", () => {
  const diff = Continuity.markerDiff()
  // every changed key is classified (reconciled or exempt); none unclassified on the real tree
  expect(diff.unclassified).toEqual([])
  // a new key that moved from undefined is caught (F-1: a forgotten-from-the-registry countable)
  const seededDiff = Continuity.markerDiff({ ...Continuity.snapshot(), somethingNew: 99 })
  expect(seededDiff.unclassified.map((u) => u.key)).toContain("somethingNew")
})

test("S181 (W-BF02) — RED-TEAM HARDENING: the diff is over the RAW marker, not a curated snapshot — every marker leaf is owned or pinned-exempt", () => {
  // the curated-snapshot concern (the defect half-relocated): the coverage check extracts EVERY numeric leaf from the real
  // marker and asserts each is owned by a registered countable OR in the pinned MARKER_EXEMPT (verdict-core / invariant).
  const marker = Rollup.terminalMarker({ fullBattery: { pass: 1990, skip: 2, fail: 0, files: 299, expect: 13285, twoRunsIdentical: true }, verify: Verify.run({ skipBundle: true }), goldenMoves: 0, at: "x" } as unknown as Rollup.RunMeasured)
  const cov = Continuity.markerCoverage(marker)
  expect(cov.ok).toBe(true) // every marker leaf classified (owned or exempt), 0 uncovered
  // SEEDED NEGATIVE: a phantom numeric field in the marker, owned by nothing and exempt by nothing, is UNCOVERED → the gate refuses
  const seeded = Continuity.markerCoverage({ ...marker, phantomMetric: 42 })
  expect(seeded.ok).toBe(false)
  expect(seeded.uncovered.map((u) => u.path)).toContain("phantomMetric")
  // checkWithMarker folds the coverage into the continuity verdict (the emit path uses it)
  expect(Continuity.checkWithMarker({ ...marker, phantomMetric: 42 }).ok).toBe(false)
})

// ── S182 (W-BF03) — a historical act's hash is STABLE or carried (N-3: the redesignSearchHashes drift) ──

test("S182 (W-BF03) — a historical act's hash is STABLE (its immutable-core hash); the D56 SEARCH renders it, not the chain selfSha", () => {
  const stable = HistoricalAct.hashFile("test-redesign-search.json")
  expect(stable).toMatch(/^[0-9a-f]{64}$/)
  // stable-or-carried: the rendered hash equals the stable one → ok
  expect(HistoricalAct.stableOrCarried(stable, stable).ok).toBe(true)
})

test("S182 (W-BF03) — SEEDED NEGATIVE: a DRIFTED historical hash, untagged, FAILS; a carried:{from} tag rescues it", () => {
  const stable = HistoricalAct.hashFile("test-redesign-search.json")
  const drifted = "d5147f8d14be46de4257073639a4bb584f37c6245d71cc707c298ea2b3e507d2" // the V42 chain selfSha (the actual drift)
  // untagged drift → FAILS (N-3: the one carried hash that drifted, in the sprint about carried identity)
  expect(HistoricalAct.stableOrCarried(drifted, stable).ok).toBe(false)
  // an explicit carried:{from} tag is honest (the drift is disclosed)
  expect(HistoricalAct.stableOrCarried(drifted, stable, { from: "record-chain-selfSha", why: "position-dependent chain integrity" }).ok).toBe(true)
})

test("S182 (W-BF03) — a CHANGE to the act's immutable core moves the hash (that is CORRECT — a new act, not a drift)", () => {
  const a = { deviation: "D56", act: "SEARCH", redesigns: 1, redesignLog: [{ from: "x", to: "y" }] }
  const b = { deviation: "D56", act: "SEARCH", redesigns: 2, redesignLog: [{ from: "x", to: "y" }] } // redesigns changed
  expect(HistoricalAct.hash(a)).not.toBe(HistoricalAct.hash(b)) // a changed act SHOULD move the hash
  // but a reworded prose `rule` / re-dated `at` does NOT move it (only the immutable core counts)
  const c = { ...a, at: "2026-99-99", rule: "totally reworded prose" }
  expect(HistoricalAct.hash(c)).toBe(HistoricalAct.hash(a))
})

// ── S183 (W-BF04) — the capability→verdict isolation fence (N-4) ──

test("S183 (W-BF04) — the capability→verdict fence HOLDS: no capture/backfill engine imports a verdict-path module", () => {
  const iso = Capability.verdictIsolation()
  expect(iso.isolated).toBe(true)
  expect(iso.violations).toEqual([])
  expect(iso.checked.capabilities).toBeGreaterThanOrEqual(3) // observe + backfill + capture
  expect(iso.checked.verdictPath).toBeGreaterThanOrEqual(3)
})

test("S183 (W-BF04) — the fence is bidirectional: the pinned verdict path and capability engines are DISJOINT sets", () => {
  // the invariant is RENDERED and CHECKED (not implied by the bundle hash) — the two lists share no module
  const inter = Capability.CAPABILITY_ENGINES.filter((c) => Capability.VERDICT_PATH.includes(c))
  expect(inter).toEqual([])
  expect(Capability.verdictIsolationLine()).toMatch(/capability→verdict isolation: HELD/)
})
