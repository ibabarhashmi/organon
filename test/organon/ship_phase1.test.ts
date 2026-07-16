/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 1 walls (S151–S156): THE SHIP GATE, run against THIS sprint's REAL artifacts.
 *
 * X-REACH(a) made mechanical: V39's four record-breaks were walls it BUILT, unit-tested and never run against the shipped
 * artifact. Here Ship.gate() runs every wall against a real-shaped artifact set, and Ship.emit() REFUSES to write the build
 * log on any failure — a refusal at the SAME path (RP-2), no --force. The positive control (S151) is on the REAL emit path
 * (RP-1): data/honesty/ship-positive-control.json records that a seeded prose treeHash produced a refusal, not a build log.
 *
 * The originating defects (committed, so the census reads them):
 *   W-SH01 — the ship gate itself (the meta-defect: walls tested but not applied — X-REACH(a))
 *   W-SH02 — K-1: a prose treeHash shipped while S143 passed its unit test
 *   W-SH03 — K-2: the fresh clone was not run (twice owed)
 *   W-SH04 — K-3: verify lost its third sub-check again, one sprint after S114's 'G-2 never again'
 *   W-SH05 — K-4: ten origin-less walls landed in ORIGIN_UNRECORDED and the arithmetic reconciled
 *   W-SH06 — K-7: the battery baseline discontinuity 1706→1738 across a sprint boundary
 */
import { test, expect } from "bun:test"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ship } from "../../src/organon/ship"
import { Verify } from "../../src/organon/verify"
import { Pins } from "../../src/organon/pins"
import { Rollup } from "../../src/organon/rollup"
import { Consistency } from "../../src/organon/consistency"
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

function goodMarker(): Record<string, unknown> {
  return {
    treeHash: "0".repeat(40),
    commitSha: TERMINAL,
    pinsSha: "64bd9106ea8020a4ba72eb7c1643790e6987a9f9c7ac601c2abcee3c15f17f94",
    battery: "1848/2/0",
    expect: "11800",
    verify: { exitCode: 0, subchecks: Verify.DECLARED_SUBCHECKS.map((name) => ({ name, status: "pass", detail: "ok" })) },
    verifyOutput: "verify exit 0 — every sub-check passed",
    verifyCoverage: "9/9",
    goldenMoves: "0",
  }
}
function goodVerify(): Verify.Result {
  return { exitCode: 0, subchecks: Verify.DECLARED_SUBCHECKS.map((name) => ({ name, status: "pass", detail: "ok" })) }
}
function goodBattery(): Ship.Battery.Continuity {
  return Ship.Battery.continuityOf(
    { prevSprint: "V39 (Family)", prevFullPass: 1793, fullPass: 1848, added: 55, removed: 0 },
    { chain: [{ sprint: "V39 (Family)", terminalFullPass: 1793 }] },
  )
}
function goodCensus(): Ship.Artifacts["censusReconciliation"] {
  // a reconciling census (VARIANT V41, S161): prev + new − moved === now
  return { prev: 83, newThisSprint: 9, moved: 13, now: 79, reconciles: true, display: "prev 83 + new 9 − moved 13 === now 79", contradiction: null }
}
function goodArtifacts(): Ship.Artifacts {
  return {
    marker: goodMarker(),
    terminalCommit: TERMINAL,
    clone: { clonedCommit: TERMINAL, ran: true },
    verify: goodVerify(),
    census: { newWallsInOu: [] },
    battery: goodBattery(),
    censusReconciliation: goodCensus(),
    // PROVENANCE V42 (S169–S174) — the identity artifacts, honest, so the V40 ship walls run under the identity-hardened gate.
    pinsEmitted: Pins.selfHash().recomputed, // === sha256(this sprint's pins file) — S169 passes
    freshness: Rollup.freshnessAudit(), // every field COMPUTED or carried-and-reverified — S170 passes
    batteryDelta: { full: true, pass: Consistency.batteryFullDelta().now }, // the FULL battery — S171 passes
    batteryFullDelta: Consistency.batteryFullDelta(), // reconciles across the boundary — S172 passes
    censusIdentity: Consistency.censusIdentity(), // the full partition closes — S173 passes
    deviationStateIds: State.deviations().map((d) => d.id), // incl D80–D86 — S174 passes
    // BACKFILL V43 (S180–S183) — continuity-total artifacts, honest, so the V40/V42 walls run under the continuity-total gate.
    verifyDomainsStated: true, // S180 — the verify sub-check names its domain
    continuity: Continuity.check(), // S181 — every countable reconciled + marker-diff clean
    searchHashStable: { ok: true, detail: "stable (test)" }, // S182 — the historical-act hash is stable
    capabilityIsolation: Capability.verdictIsolation(), // S183 — the capability→verdict fence holds
    // RECKONING V44 (S190–S197) — the pen's reckoning + the moat's third stone, honest so the walls run under the reckoning gate.
    censusTwoIdentity: Continuity.reconcileAll().results.find((r) => r.key === "census")?.twoIdentity ?? null, // S190
    historicalRebasing: HistoricalAct.rebasingVerdict(), // S191
    ln5: Ln5.verify(goodMarker()), // S192 — the marker is operatorSigned-clean
    strictBar: (() => { const r = Strict.strictRecord(); return { positiveControlGO: r.positiveControlGO, flips: r.flips } })(), // S193
    rateSpace: Backfill.rateSpaceVerdict(), // S194
    judgeableReconciled: Capture.judgeableReconciled(), // S195
    contagion: (() => { const r = Contagion.mutationRate(); return { complete: r.complete, detail: r.note } })(), // S196
    delegation: Delegation.verdict(), // S197
    // HARDENING V45 (S198–S209) — production readiness, honest so the V40/V42/V43/V44 walls run under the V45 gate.
    oneState: State.oneStateVerdict(goodMarker()), // S198
    emptyState: Hardening.emptyState(), crashSafety: Hardening.crashSafety(), rpcPolicy: Rpc.policyVerdict(), // S199/S200/S201
    disclosures: { ok: true, detail: "test disclosures" }, workflows: Hardening.workflows(), // S202/S203
    guardAggregate: GuardAggregate.verdict(), sidecar: Sidecar.verdict(), binaryParity: Hardening.binaryParity(), // S204/S205/S206
    docs: Docs.verdict(), cleanMachine: { ok: true, detail: "test clean-machine" }, registry: Registry.check(), // S207/S209
  }
}

test("S151 (W-SH01) — Ship.gate PASSES on clean real-shaped artifacts; Ship.emit writes the LOG only then", () => {
  const g = Ship.gate(goodArtifacts())
  expect(g.pass).toBe(true)
  expect(g.checks.length).toBe(35) // S152–S156 + S161 + S169–S174 + S180–S183 + S190–S197 (24) + S198–S209 (11 HARDENING V45), all ✓
  const e = Ship.emit("FULL BUILD LOG CONTENT", goodArtifacts(), "2026-07-15")
  expect(e.wrote).toBe("log")
  if (e.wrote === "log") expect(e.content).toBe("FULL BUILD LOG CONTENT")
})

test("S151 (W-SH01) — the POSITIVE CONTROL is on the REAL EMIT PATH (RP-1): a seeded bad marker → a refusal, no build log", () => {
  // proven by the recorded end-to-end transcript (no unit test satisfies this control — X-SHOWN(b))
  const pcPath = path.join(PKG_ROOT, "data", "honesty", "ship-positive-control.json")
  expect(existsSync(pcPath)).toBe(true)
  const pc = JSON.parse(readFileSync(pcPath, "utf8"))
  expect(pc.wrote).toBe("refusal") // the REAL emit produced a refusal, NOT a build log
  expect(pc.outIsRefusalNotLog).toBe(true)
  expect(pc.refusal.wall).toBe("S152")
  expect(pc.command).toMatch(/script\/honesty\/ship\.ts --seed-bad/)
})

test("S151 (W-SH01) — a REFUSING gate emits a refusal that names the wall, the artifact, and the value (RP-2); no --force in the tree", () => {
  const bad = goodArtifacts()
  bad.clone = null // seed a failure
  const e = Ship.emit("FULL BUILD LOG CONTENT", bad, "2026-07-15")
  expect(e.wrote).toBe("refusal")
  if (e.wrote === "refusal") {
    expect(e.content).toMatch(/BUILD LOG REFUSED/)
    expect(e.content).toMatch(/wall:\s+S153/)
    expect(e.content).toMatch(/artifact:/)
    expect(e.content).toMatch(/value:/)
    expect(e.content).not.toMatch(/FULL BUILD LOG CONTENT/) // the refusal is NOT the build log; there is no second door
    expect(e.content).toMatch(/no `--force`|no --force/)
  }
})

test("S152 (W-SH02) — Marker.validate on the REAL terminal marker: prose in the treeHash slot → REFUSE (K-1)", () => {
  expect(Ship.gate(goodArtifacts()).pass).toBe(true) // control: a real 40-hex treeHash passes
  const bad = goodArtifacts()
  ;(bad.marker as Record<string, unknown>).treeHash = "the ship sprint commit" // prose → FAILS
  const g = Ship.gate(bad)
  expect(g.pass).toBe(false)
  if (!g.pass) { expect(g.refusal.wall).toBe("S152"); expect(g.refusal.value).toMatch(/40-hex/) }
  // a ⟨placeholder⟩ (the exact V39 defect) also refuses
  const ph = goodArtifacts()
  ;(ph.marker as Record<string, unknown>).treeHash = "⟨filled post-commit⟩"
  expect(Ship.gate(ph).pass).toBe(false)
})

test("S153 (W-SH03) — the clone must have EXECUTED on this commit: absent or stale → REFUSE (K-2)", () => {
  const absent = goodArtifacts(); absent.clone = null
  const a = Ship.gate(absent); expect(a.pass).toBe(false); if (!a.pass) expect(a.refusal.wall).toBe("S153")
  const notRan = goodArtifacts(); notRan.clone = { clonedCommit: TERMINAL, ran: false }
  expect(Ship.gate(notRan).pass).toBe(false)
  const stale = goodArtifacts(); stale.clone = { clonedCommit: "deadbeef00000000000000000000000000000000", ran: true }
  const s = Ship.gate(stale); expect(s.pass).toBe(false); if (!s.pass) expect(s.refusal.value).toMatch(/STALE/)
})

test("S154 (W-SH04) — verify's real sub-check set vs DECLARED_SUBCHECKS: a silent removal → REFUSE (K-3, 'G-2 never again' again)", () => {
  const bad = goodArtifacts()
  bad.verify = { exitCode: 0, subchecks: Verify.DECLARED_SUBCHECKS.slice(0, 2).map((name) => ({ name, status: "pass", detail: "ok" })) } // the third vanished
  const g = Ship.gate(bad)
  expect(g.pass).toBe(false)
  if (!g.pass) { expect(g.refusal.wall).toBe("S154"); expect(g.refusal.value).toMatch(/DECLARED_SUBCHECKS/) }
})

test("S155 (W-SH05) — this sprint's real new walls carry named origins: an origin-less new wall → REFUSE (K-4, S108 at ship)", () => {
  const bad = goodArtifacts()
  bad.census = { newWallsInOu: ["<an-origin-less-new-wall>"] } // a new wall that landed in ORIGIN_UNRECORDED (a plain token, not a wall id — no false orphan)
  const g = Ship.gate(bad)
  expect(g.pass).toBe(false)
  if (!g.pass) { expect(g.refusal.wall).toBe("S155"); expect(g.refusal.value).toMatch(/ORIGIN_UNRECORDED/) }
})

test("S156 (W-SH06) — battery continuity with the PREVIOUS terminal marker: an unexplained gap → REFUSE (K-7)", () => {
  // cross-boundary break: baseline.prevFullPass ≠ the last chained terminal
  const gapChain = Ship.Battery.continuityOf(
    { prevSprint: "V39", prevFullPass: 1738, fullPass: 1793, added: 55, removed: 0 },
    { chain: [{ sprint: "V39", terminalFullPass: 1793 }] },
  )
  expect(gapChain.ok).toBe(false)
  const bad = goodArtifacts(); bad.battery = gapChain
  const g = Ship.gate(bad); expect(g.pass).toBe(false); if (!g.pass) expect(g.refusal.wall).toBe("S156")
  // within-sprint break: full ≠ prev + added − removed
  const gapArith = Ship.Battery.continuityOf(
    { prevSprint: "V39", prevFullPass: 1793, fullPass: 9999, added: 55, removed: 0 },
    { chain: [{ sprint: "V39", terminalFullPass: 1793 }] },
  )
  expect(gapArith.ok).toBe(false)
})

test("S156 (W-SH06) — the continuity ledger EXPLAINS the 1706→1738 gap (MR19) and chains to V39's 1793", () => {
  const ledger = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "battery-continuity.json"), "utf8"))
  const terminals = ledger.chain.map((c: { terminalFullPass: number }) => c.terminalFullPass)
  expect(terminals).toContain(1706)
  expect(terminals).toContain(1738)
  expect(terminals).toContain(1793) // V39's terminal — what V40's baseline.prevFullPass equalled
  expect(terminals).toContain(1844) // V40's terminal — what V41's baseline.prevFullPass equalled
  expect(terminals).toContain(1892) // V41's terminal
  expect(terminals).toContain(1941) // V42's terminal — what V43's baseline.prevFullPass equalled
  expect(terminals).toContain(1991) // V43's terminal — what V44's baseline.prevFullPass equalled
  expect(terminals[terminals.length - 1]).toBe(2024) // HARDENING V45: V44's terminal appended — what V45's baseline.prevFullPass must equal
  expect(ledger.mr19).toMatch(/1706→1738|Surrogate Addendum/)
})
