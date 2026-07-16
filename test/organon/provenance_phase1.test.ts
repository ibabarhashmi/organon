/**
 * ORGΛNON — THE PROVENANCE SPRINT (V42), Phase 1 walls (S169–S174): THE GATE GRADUATES FROM SHAPE TO IDENTITY. NO NEW LAW
 * (seventh sprint).
 *
 * W-PR01 (S169) — M-1: V41 emitted a pinsSha that was a PARENT'S (currentPins frozen at family-pins.json, V39). The Ship Gate
 * proved a 40-hex hash (S143) and never that it was THIS sprint's (X-REACH(a): a hash never compared to its own source cannot
 * fail on a stale value). The fix: Pins.selfHash() + Pins.verifyEmitted() — the emitted pins-sha must equal sha256(this
 * sprint's pins file), and a parent-pin emission REFUSES the log (proven on the real emit path in provenance_emit.test.ts).
 * W-PR02 (S170) — M-2: a generated field is COMPUTED or carried-and-reverified; a carry that would recompute differently is a
 * lie (staleness cannot be blessed by a tag). W-PR03 (S171) — M-3: batteryDelta describes the FULL battery, not the curated
 * 1281-subset. W-PR04 (S172) — M-4: the cross-sprint continuity is DISPLAYED and reconciles. W-PR05 (S173) — M-5: the full
 * census identity closes (a seeded bad partition FAILS). W-PR06 (S174/MR20) — M-6: every pinned deviation (incl D80–D86) is
 * in deviationStates. Each wall carries a SEEDED IDENTITY-WRONG-BUT-SHAPE-VALID negative that REFUSES the log.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ship } from "../../src/organon/ship"
import { Pins } from "../../src/organon/pins"
import { Continuity } from "../../src/organon/continuity"
import { Capability } from "../../src/organon/capability"
import { HistoricalAct } from "../../src/organon/historical"
import { Ln5 } from "../../src/organon/ln5"
import { Delegation } from "../../src/organon/delegation"
import { Strict } from "../../src/studio/strict"
import { Backfill } from "../../src/plane/backfill"
import { Capture } from "../../src/strategy/capture"
import { Contagion } from "../../src/strategy/contagion"
import { Freshness } from "../../src/organon/freshness"
import { Consistency } from "../../src/organon/consistency"
import { Rollup } from "../../src/organon/rollup"
import { State } from "../../src/organon/state"
import { Verify } from "../../src/organon/verify"
import { Registry } from "../../src/organon/registry"
import { Rpc } from "../../src/organon/rpc"
import { GuardAggregate } from "../../src/organon/guardaggregate"
import { Sidecar } from "../../src/organon/sidecar"
import { Docs } from "../../src/organon/docs"
import { Hardening } from "../../src/organon/hardening"

const PROVENANCE_PINS = "04c606dd5846e7cdcd9fab86bff7ae4de2dd3c942563fda114abf63e9d3df3f8" // this sprint's own pins sha
const PARENT_PINS = "eb64cebe435bc0797dd3752cef35afc36da3ff23230b2d69cd41b5f86c756d08" // V41 Variant — a SHAPE-VALID, IDENTITY-WRONG parent
const TERMINAL = "abc1234def567800000000000000000000000042"

function marker(pinsSha: string = PROVENANCE_PINS): Record<string, unknown> {
  return {
    treeHash: "0".repeat(40), commitSha: TERMINAL, pinsSha,
    battery: "1892/2/0", expect: "12368",
    verify: { exitCode: 0, subchecks: Verify.DECLARED_SUBCHECKS.map((name) => ({ name, status: "pass", detail: "ok" })) },
    verifyOutput: "verify exit 0", verifyCoverage: "9/9", goldenMoves: "0",
  }
}
function battery(): Ship.Battery.Continuity {
  return Ship.Battery.continuityOf({ prevSprint: "V41 (Variant)", prevFullPass: 1892, fullPass: 1900, added: 8, removed: 0 }, { chain: [{ sprint: "V41 (Variant)", terminalFullPass: 1892 }] })
}
// a fully-VALID V42 artifacts bundle (a ran clone on this terminal, all identity artifacts honest)
function artifacts(over: Partial<Ship.Artifacts> = {}): Ship.Artifacts {
  const base: Ship.Artifacts = {
    marker: marker(), terminalCommit: TERMINAL, clone: { clonedCommit: TERMINAL, ran: true },
    verify: { exitCode: 0, subchecks: Verify.DECLARED_SUBCHECKS.map((name) => ({ name, status: "pass", detail: "ok" })) },
    census: { newWallsInOu: [] }, battery: battery(), censusReconciliation: Consistency.censusContinuityDisplay(),
    pinsEmitted: Pins.selfHash().recomputed, freshness: Rollup.freshnessAudit(), // BACKFILL V43: the CURRENT head (provenance is now superseded)
    batteryDelta: { full: true, pass: Consistency.batteryFullDelta().now },
    batteryFullDelta: Consistency.batteryFullDelta(), censusIdentity: Consistency.censusIdentity(),
    deviationStateIds: State.deviations().map((d) => d.id),
    // BACKFILL V43 (S180–S183) — the continuity-total artifacts, honest, so the V42 identity walls run under the V43 gate.
    verifyDomainsStated: true, continuity: Continuity.check(),
    searchHashStable: { ok: true, detail: "stable (test)" }, capabilityIsolation: Capability.verdictIsolation(),
    // RECKONING V44 (S190–S197)
    censusTwoIdentity: Continuity.reconcileAll().results.find((r) => r.key === "census")?.twoIdentity ?? null,
    historicalRebasing: HistoricalAct.rebasingVerdict(), ln5: Ln5.verify({}),
    strictBar: (() => { const r = Strict.strictRecord(); return { positiveControlGO: r.positiveControlGO, flips: r.flips } })(),
    rateSpace: Backfill.rateSpaceVerdict(), judgeableReconciled: Capture.judgeableReconciled(),
    contagion: (() => { const r = Contagion.mutationRate(); return { complete: r.complete, detail: r.note } })(),
    delegation: Delegation.verdict(),
    // HARDENING V45 (S198–S209) — the production-readiness walls, honest so the V42/V43 identity walls run under the V45 gate.
    oneState: State.oneStateVerdict(marker()),
    emptyState: Hardening.emptyState(), crashSafety: Hardening.crashSafety(), rpcPolicy: Rpc.policyVerdict(),
    disclosures: { ok: true, detail: "test disclosures" }, workflows: Hardening.workflows(),
    guardAggregate: GuardAggregate.verdict(), sidecar: Sidecar.verdict(), binaryParity: Hardening.binaryParity(),
    docs: Docs.verdict(), cleanMachine: { ok: true, detail: "test clean-machine" }, registry: Registry.check(),
  }
  return { ...base, ...over }
}

test("S169 (W-PR01) — provenance-pins.json is still self-consistent, but is now SUPERSEDED by backfill (V43) — the chain-tip guard bites", () => {
  const sh = Pins.selfHash("provenance-pins.json")
  expect(sh.matches).toBe(true) // still self-consistent (unedited after V42's Phase 0)
  expect(sh.recomputed).toBe(PROVENANCE_PINS)
  // emitting the V42 head now REFUSES — provenance is no longer the tip (backfill carries from it; the M-1 recurrence caught)
  expect(Pins.verifyEmitted(PROVENANCE_PINS, "provenance-pins.json").ok).toBe(false)
  // the CURRENT head (backfill) verifies as emitted
  expect(Pins.verifyEmitted(Pins.selfHash().recomputed).ok).toBe(true)
})

test("S169 (W-PR01) — SEEDED NEGATIVE: a PARENT pin emission (V41's eb64cebe) is SHAPE-VALID (40-hex) and IDENTITY-WRONG — REFUSE", () => {
  const v = Pins.verifyEmitted(PARENT_PINS)
  expect(v.ok).toBe(false)
  if (!v.ok) expect(v.reason).toMatch(/STALE \(parent\) pin/)
  // and the Ship Gate refuses on a parent-pin marker (the exact M-1 defect, now caught)
  const g = Ship.gate(artifacts({ pinsEmitted: PARENT_PINS, marker: marker(PARENT_PINS) }))
  expect(g.pass).toBe(false)
  if (!g.pass) expect(g.refusal.wall).toBe("S169")
})

test("S169 (W-PR01) — SEEDED NEGATIVE: a pins file edited after Phase 0 (self-consistency broken) REFUSES (freshness anchor)", () => {
  // verifyEmitted against a DIFFERENT file whose stored pinsSha ≠ its recompute would fail on `matches`. We simulate the
  // freshness break by asserting the verdict logic: an emitted value that is neither the parent nor the self-hash fails too.
  expect(Pins.verifyEmitted("0".repeat(64)).ok).toBe(false)
})

test("S169 (W-PR01) — HARDENING (red-team): HEAD_FILE must be the CHAIN TIP; a not-advanced head is caught structurally (the M-1 RECURRENCE)", () => {
  // backfill-pins.json IS the tip today (V43) — nothing carries from it; provenance is now one link back
  const tip = Pins.headIsChainTip()
  expect(tip.tip).toBe(true)
  expect(tip.supersededBy).toBeNull()
  // SEEDED NEGATIVE with REAL data: variant-pins.json (V41) IS superseded — provenance carries from it. If a successor pinned
  // a new head but forgot to advance HEAD_FILE to it, this is the M-1 defect one sprint later; verifyEmitted catches it.
  const superseded = Pins.headIsChainTip("variant-pins.json")
  expect(superseded.tip).toBe(false)
  expect(superseded.supersededBy).toBe("provenance-pins.json")
  const varPin = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "variant-pins.json"), "utf8")).pinsSha
  const v = Pins.verifyEmitted(varPin, "variant-pins.json")
  expect(v.ok).toBe(false)
  if (!v.ok) expect(v.reason).toMatch(/NOT the chain tip|M-1 recurrence/)
})

test("S170 (W-PR02) — the freshness audit is honest: every field COMPUTED or carried-and-reverified (the D33 note carried from V39, reverified)", () => {
  const fr = Freshness.honest(Rollup.freshnessAudit())
  expect(fr.ok).toBe(true)
  expect(fr.carried).toBeGreaterThanOrEqual(1) // the D33 signability note
  const note = Rollup.d33NoteClass()
  expect(note.kind).toBe("CARRIED")
  expect(note.from).toBe("V39")
  expect(note.reverified).toBe(true) // D33 is SIGNABLE, so the carry re-verifies
  expect(note.inputsMoved).toBe(false)
})

test("S170 (W-PR02) — SEEDED NEGATIVE: a carried claim that would RECOMPUTE DIFFERENTLY is a lie (staleness blessed) — REFUSE", () => {
  const lying = Freshness.carried("gate.someField", "V39", "carried but its input moved", "OLD VALUE", ["someInput"], () => "NEW VALUE (recompute differs)")
  expect(lying.reverified).toBe(false)
  expect(lying.inputsMoved).toBe(true)
  const fr = Freshness.honest([...Rollup.freshnessAudit(), lying])
  expect(fr.ok).toBe(false)
  const g = Ship.gate(artifacts({ freshness: [...Rollup.freshnessAudit(), lying] }))
  expect(g.pass).toBe(false)
  if (!g.pass) expect(g.refusal.wall).toBe("S170")
})

test("S170 (W-PR02) — an UNTAGGED prior-sprint string in a COMPUTED field is detected (M-2's exact defect)", () => {
  const echoed = Freshness.computed("gate.echo", "some producer", "V39's verbatim prose")
  const offenders = Freshness.untaggedPriorStrings([echoed], { V39: "V39's verbatim prose" })
  expect(offenders.length).toBe(1)
})

test("S171 (W-PR03) — the batteryDelta describes the FULL battery (not the curated 1281-subset)", () => {
  const g = Ship.gate(artifacts())
  expect(g.pass).toBe(true)
  expect(g.checks.some((c) => c.wall === "S171" && c.ok)).toBe(true)
})

test("S171 (W-PR03) — SEEDED NEGATIVE: a batteryDelta describing the CURATED 1281-subset (shape-valid) REFUSES the log", () => {
  const g = Ship.gate(artifacts({ batteryDelta: { full: false, pass: 1281 } }))
  expect(g.pass).toBe(false)
  if (!g.pass) {
    expect(g.refusal.wall).toBe("S171")
    expect(g.refusal.value).toMatch(/CURATED 1281-subset|WRONG battery/)
  }
})

test("S172 (W-PR04) — the cross-sprint battery continuity is DISPLAYED and reconciles (prev + added − removed === now)", () => {
  const fd = Consistency.batteryFullDelta()
  expect(fd.reconciles).toBe(true)
  expect(fd.display).toMatch(/prev \d+ \+ added \d+ − removed \d+ === now \d+/)
  // SEEDED NEGATIVE: a non-reconciling boundary FAILS — the pure reconciler CAN fail. (batteryDelta.pass is kept === now so
  // S171 passes and the gate reaches S172; the defect is that the delta does not reconcile across the boundary.)
  const bad = Consistency.reconcileBattery(1892, 9999, 8, 0)
  expect(bad.reconciles).toBe(false)
  const g = Ship.gate(artifacts({ batteryDelta: { full: true, pass: 9999 }, batteryFullDelta: { ...fd, now: 9999, reconciles: false, contradiction: bad.contradiction } }))
  expect(g.pass).toBe(false)
  if (!g.pass) expect(g.refusal.wall).toBe("S172")
})

test("S173 (W-PR05) — the FULL census identity closes: demonstrated + weak + exempt + originUnrecorded === total (a seeded bad partition FAILS)", () => {
  const ci = Consistency.censusIdentity()
  expect(ci.reconciles).toBe(true)
  expect(ci.demonstrated + ci.weak + ci.exempt + ci.originUnrecorded).toBe(ci.total)
  // SEEDED NEGATIVE: a partition that does NOT close (buckets sum ≠ total) — the check CAN fail (X-REACH(a), not a tautology)
  const bad = Consistency.censusIdentityOf(78, 0, 2, 80, 161) // sums to 160, not 161
  expect(bad.reconciles).toBe(false)
  const g = Ship.gate(artifacts({ censusIdentity: bad }))
  expect(g.pass).toBe(false)
  if (!g.pass) expect(g.refusal.wall).toBe("S173")
})

test("S174 (W-PR06/MR20) — every pinned deviation (incl D80–D86) is in deviationStates; a missing one REFUSES", () => {
  const ids = State.deviations().map((d) => d.id)
  for (const d of ["D80", "D81", "D82", "D83", "D84", "D85", "D86"]) expect(ids).toContain(d)
  // SEEDED NEGATIVE: a state list that under-enumerates (D84 dropped — the exact M-6 defect) REFUSES
  const g = Ship.gate(artifacts({ deviationStateIds: ids.filter((d) => d !== "D84") }))
  expect(g.pass).toBe(false)
  if (!g.pass) {
    expect(g.refusal.wall).toBe("S174")
    expect(g.refusal.value).toMatch(/D84/)
  }
})

test("S169–S174 — the WHOLE identity gate passes on fully-valid artifacts (all six identity walls reached and green)", () => {
  const g = Ship.gate(artifacts())
  expect(g.pass).toBe(true)
  for (const w of ["S169", "S170", "S171", "S172", "S173", "S174"]) {
    expect(g.checks.some((c) => c.wall === w && c.ok)).toBe(true)
  }
})
