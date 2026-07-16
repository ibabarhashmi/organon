/**
 * ORGΛNON — THE VARIANT SPRINT (V41), Phase 1 wall (S161): THE CENSUS, RECONCILED IN THE OPEN. NO NEW LAW (sixth sprint).
 *
 * W-VR01 — L-1: V40 made every OTHER continuity mechanical (battery, marker, clone) but left its own census
 * (originUnrecorded 79) reconciled in PROSE, not in the displayed `prev + new − moved === now` arithmetic S107 demands
 * elsewhere — the one place V39's "a reconciling total hides a regression" pattern was not provably closed. The fix folds the
 * census reconciliation INTO the Ship Gate: Ship.gate() runs Consistency.censusContinuityDisplay() against the REAL census at
 * emit time, DISPLAYS the arithmetic, and REFUSES the log on a non-reconciling census (a seeded contradiction FAILS). The
 * circularity attack (A′ #5) is answered by the emit-path discipline: the Ship Gate checking the census it emits is the Ship
 * Gate doing its one job — refusing to write a number that does not reconcile.
 */
import { test, expect } from "bun:test"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ship } from "../../src/organon/ship"
import { Consistency } from "../../src/organon/consistency"
import { Verify } from "../../src/organon/verify"
import { Pins } from "../../src/organon/pins"
import { Rollup } from "../../src/organon/rollup"
import { State } from "../../src/organon/state"
import { Continuity } from "../../src/organon/continuity"
import { Capability } from "../../src/organon/capability"
import { HistoricalAct } from "../../src/organon/historical"
import { Ln5 } from "../../src/organon/ln5"
import { Delegation } from "../../src/organon/delegation"
import { Strict } from "../../src/studio/strict"
import { Backfill } from "../../src/plane/backfill"
import { Capture } from "../../src/strategy/capture"
import { Contagion } from "../../src/strategy/contagion"
import { Registry } from "../../src/organon/registry"
import { Rpc } from "../../src/organon/rpc"
import { GuardAggregate } from "../../src/organon/guardaggregate"
import { Sidecar } from "../../src/organon/sidecar"
import { Docs } from "../../src/organon/docs"
import { Hardening } from "../../src/organon/hardening"

const TERMINAL = "abc1234def5678000000000000000000000000ff"

function marker(): Record<string, unknown> {
  return {
    treeHash: "0".repeat(40), commitSha: TERMINAL, pinsSha: "e7d27cf64b40ae1a7078f88ac69d4cdab48d51f6ad4db681465b7c8fbf1d8582",
    battery: "1852/2/0", expect: "12100",
    verify: { exitCode: 0, subchecks: Verify.DECLARED_SUBCHECKS.map((name) => ({ name, status: "pass", detail: "ok" })) },
    verifyOutput: "verify exit 0", verifyCoverage: "9/9", goldenMoves: "0",
  }
}
function battery(): Ship.Battery.Continuity {
  return Ship.Battery.continuityOf({ prevSprint: "V40 (Ship)", prevFullPass: 1844, fullPass: 1852, added: 8, removed: 0 }, { chain: [{ sprint: "V40 (Ship)", terminalFullPass: 1844 }] })
}
function reconcilingCensus(): Ship.Artifacts["censusReconciliation"] {
  return { prev: 83, newThisSprint: 9, moved: 13, now: 79, reconciles: true, display: "prev 83 + new 9 − moved 13 === now 79", contradiction: null }
}
function artifacts(cr: Ship.Artifacts["censusReconciliation"] = reconcilingCensus()): Ship.Artifacts {
  return {
    marker: marker(), terminalCommit: TERMINAL, clone: { clonedCommit: TERMINAL, ran: true },
    verify: { exitCode: 0, subchecks: Verify.DECLARED_SUBCHECKS.map((name) => ({ name, status: "pass", detail: "ok" })) },
    census: { newWallsInOu: [] }, battery: battery(), censusReconciliation: cr,
    // PROVENANCE V42 (S169–S174) — the identity artifacts, honest, so the V41 census-fold wall runs under the V42 gate.
    pinsEmitted: Pins.selfHash().recomputed, freshness: Rollup.freshnessAudit(),
    batteryDelta: { full: true, pass: Consistency.batteryFullDelta().now },
    batteryFullDelta: Consistency.batteryFullDelta(), censusIdentity: Consistency.censusIdentity(),
    deviationStateIds: State.deviations().map((d) => d.id),
    // BACKFILL V43 (S180–S183) — the continuity-total artifacts, honest.
    verifyDomainsStated: true, continuity: Continuity.check(),
    searchHashStable: { ok: true, detail: "stable (test)" }, capabilityIsolation: Capability.verdictIsolation(),
    // RECKONING V44 (S190–S197)
    censusTwoIdentity: Continuity.reconcileAll().results.find((r) => r.key === "census")?.twoIdentity ?? null,
    historicalRebasing: HistoricalAct.rebasingVerdict(), ln5: Ln5.verify({}),
    strictBar: (() => { const r = Strict.strictRecord(); return { positiveControlGO: r.positiveControlGO, flips: r.flips } })(),
    rateSpace: Backfill.rateSpaceVerdict(), judgeableReconciled: Capture.judgeableReconciled(),
    contagion: (() => { const r = Contagion.mutationRate(); return { complete: r.complete, detail: r.note } })(),
    delegation: Delegation.verdict(),
    // HARDENING V45 (S198–S209) — the production-readiness walls, honest so the V41 census-fold wall runs under the V45 gate.
    oneState: State.oneStateVerdict(marker()),
    emptyState: Hardening.emptyState(), crashSafety: Hardening.crashSafety(), rpcPolicy: Rpc.policyVerdict(),
    disclosures: { ok: true, detail: "test disclosures" }, workflows: Hardening.workflows(),
    guardAggregate: GuardAggregate.verdict(), sidecar: Sidecar.verdict(), binaryParity: Hardening.binaryParity(),
    docs: Docs.verdict(), cleanMachine: { ok: true, detail: "test clean-machine" }, registry: Registry.check(),
  }
}

test("S161 (W-VR01) — the LIVE census reconciles: Consistency.censusContinuityDisplay renders prev + new − moved === now", () => {
  const cc = Consistency.censusContinuityDisplay()
  expect(cc.reconciles).toBe(true)
  expect(cc.contradiction).toBeNull()
  // the arithmetic is DISPLAYED, not asserted (L-1) — and it actually holds
  expect(cc.prev + cc.newThisSprint - cc.moved).toBe(cc.now)
  expect(cc.display).toMatch(/prev \d+ \+ new \d+ − moved \d+ === now \d+/)
})

test("S161 (W-VR01) — the Ship Gate PASSES on a reconciling census (the check is present: 6 checks incl. S161)", () => {
  const g = Ship.gate(artifacts())
  expect(g.pass).toBe(true)
  expect(g.checks.some((c) => c.wall === "S161" && c.ok)).toBe(true)
  expect(g.checks.length).toBe(35) // + S190–S197 (V44 reckoning) + S198–S209 (11 HARDENING V45 production-readiness walls)
})

test("S161 (W-VR01) — SEEDED NEGATIVE: a non-reconciling census REFUSES the log (a reconciling total that hides a regression)", () => {
  const bad = artifacts({ prev: 83, newThisSprint: 9, moved: 20, now: 79, reconciles: false, display: "prev 83 + new 9 − moved 20 === now 79", contradiction: { a: "treatment over-claims", b: "the OU drop", why: "the treatment (moved 20) exceeds the pre-existing OU drop — residual < 0 (a producer over-claims)" } })
  const g = Ship.gate(bad)
  expect(g.pass).toBe(false)
  if (!g.pass) {
    expect(g.refusal.wall).toBe("S161")
    expect(g.refusal.value).toMatch(/does NOT reconcile/)
    expect(g.refusal.value).toMatch(/prev + new − moved === now|prev \d+ \+ new/)
  }
  // and Ship.emit writes a REFUSAL, not the build log (RP-2: same path, no --force)
  const e = Ship.emit("FULL BUILD LOG CONTENT", bad, "2026-07-15")
  expect(e.wrote).toBe("refusal")
  if (e.wrote === "refusal") expect(e.content).not.toMatch(/FULL BUILD LOG CONTENT/)
})

test("S161 (W-VR01) — the REAL emit path populates the census reconciliation (Ship.collectArtifacts runs it against the live census)", () => {
  const a = Ship.collectArtifacts(marker(), TERMINAL, { exitCode: 0, subchecks: Verify.DECLARED_SUBCHECKS.map((name) => ({ name, status: "pass", detail: "ok" })) })
  expect(a.censusReconciliation).toBeTruthy()
  expect(a.censusReconciliation.reconciles).toBe(true) // the live census reconciles (a real artifact, not a synthetic input)
  expect(a.censusReconciliation.display).toMatch(/prev \d+ \+ new \d+ − moved \d+ === now \d+/)
})

test("S161 (W-VR01) — RP-1: the Ship Gate (V40) is REUSED, and REFUSES on the V41 real emit path (a seeded prose treeHash → a refusal, no build log)", () => {
  // proven by the recorded end-to-end transcript from `variant-ship.ts --seed-bad` (the reused gate now runs S161 too)
  const pcPath = path.join(PKG_ROOT, "data", "honesty", "variant-positive-control.json")
  expect(existsSync(pcPath)).toBe(true)
  const pc = JSON.parse(readFileSync(pcPath, "utf8"))
  expect(pc.wrote).toBe("refusal") // the REAL emit produced a refusal, NOT a build log
  expect(pc.outIsRefusalNotLog).toBe(true)
  expect(pc.command).toMatch(/variant-ship\.ts --seed-bad/)
})
