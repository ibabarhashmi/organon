/**
 * ORGΛNON — Ensemble Phase 1 walls (PRECONDITIONS-TRUE). The K_eff formula pin bites; the middle+stress cells derived a
 * door state; the HRP criterion is hash-checked unchanged and its runner is deterministic; the λ-sensitivity answer is
 * filed; pool code is ABSENT. The slow sidecar battery is the driver's job — these read its committed artifact + do the
 * cheap, deterministic, positive-controlled checks (HRP + K_eff use no Python sidecar).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Keff } from "../../src/studio/keff"
import { Hrp } from "../../src/studio/hrp"
import { StudioScreens } from "../../src/studio/screens"

const D = path.join(PKG_ROOT, "data", "studio")
const art = () => JSON.parse(readFileSync(path.join(D, "phase1-preconditions-v13.json"), "utf8"))

// ── K-PRECOND: the K_eff formula pin ──
test("the K_eff mapping is hash-checked; a post-hoc change Halts", () => {
  const pins = JSON.parse(readFileSync(path.join(D, "phase0-pins-v13.json"), "utf8"))
  expect(Keff.keffMappingHash()).toBe(pins.keff.mappingHash)
  Keff.assertMappingPinned(pins.keff.mappingHash) // no throw
  expect(() => Keff.assertMappingPinned("f".repeat(64))).toThrow(/K-PRECOND/)
})

// ── the derived door: the HARD firewall is decisive ──
test("the middle+stress cells derived a door; the hard firewall (noise never passes) holds; the door is not shut on a passing noise pool", () => {
  const a = art()
  const ms = a.middleStress
  expect(ms.noiseNeverPasses).toBe(true) // the pre-registered REJECT clause was NOT triggered
  // every cell: the genuine diversified pool passes at K_eff above a single member; noise ≈0
  for (const c of ms.cells) {
    expect(c.genuinePoolKeffRate).toBeGreaterThanOrEqual(0.8)
    expect(c.genuinePoolKeffRate).toBeGreaterThan(c.singleMemberRate) // diversification lift
    expect(c.noisePoolKeffRate).toBeLessThanOrEqual(0.1)
    expect(c.cloneAddsNothing).toBe(true) // the cloned-edge pool has K_eff≈1
  }
  expect(ms.stress.collapses).toBe(true) // K_eff + diversification evaporate in the storm
  expect(["OPEN", "OPEN-WITH-CONDITIONS", "RE-PARKED"]).toContain(ms.doorState)
  // K_eff is non-trivial in the middle (between 1 and K=5) — the operative clause V12 never exercised
  for (const c of ms.cells) { expect(c.avgKEff).toBeGreaterThan(1); expect(c.avgKEff).toBeLessThan(5) }
})

test("laundering is detectable at ≥1 ρ; a vacuous corner is a filed CONDITION, never argued past", () => {
  const a = art()
  expect(a.middleStress.launderingDetectableSomewhere).toBe(true)
  if (a.middleStress.doorState === "OPEN-WITH-CONDITIONS") expect(a.middleStress.conditions.length).toBeGreaterThan(0)
})

// ── U-EXPERIMENT: the HRP park criterion hash-checked unchanged; the runner deterministic (no sidecar) ──
test("the HRP criterion is the V11 park's own row (hash-checked unchanged) and the runner is deterministic", async () => {
  const a = art()
  expect(a.hrp.criterionUnchanged).toBe(true)
  expect(a.hrp.rowHash).toBe("bf6764cd0a6e9f884905265307cd1e31cb54486fc071d8e3cf9922dd86a8ba17")
  const r1 = await Hrp.run({ assets: 6, nObs: 500, windows: 20, trainFrac: 0.6, seed: 20260705 })
  const r2 = await Hrp.run({ assets: 6, nObs: 500, windows: 20, trainFrac: 0.6, seed: 20260705 })
  expect(r1.hrpWins).toBe(r2.hrpWins) // deterministic
  expect(["YES — HRP dominates out-of-sample (adopt)", "NO — HRP does not dominate; the mixed evidence did not resolve in our favour (keep parked)"]).toContain(r1.outcome)
})

// ── the λ-sensitivity answer is filed either way ──
test("the λ-sensitivity control filed an answer (resolution confirmed OR limits stated)", () => {
  const a = art()
  expect(typeof a.lambdaSensitivity.hasResolution).toBe("boolean")
  expect(a.lambdaSensitivity.answer.length).toBeGreaterThan(0)
})

// ── K-PRECOND: zero pool code existed AT PHASE 1 (the door could stay shut) — the committed artifact records the fact ──
// (the live tree now carries the Pool Composer built in Phase 3 through the open door; the Phase-1 fact is historical,
//  read from the committed battery artifact, per the cross-generation precedent — a later phase does not rewrite it)
test("no pool/composer surface existed at Phase 1 — the committed artifact records SCREENS=9, no composer, no route", () => {
  const a = art()
  expect(a.poolCodeAbsence.poolCodeAbsent).toBe(true)
  expect(a.poolCodeAbsence.tenthScreen).toBe(false)
  expect(a.poolCodeAbsence.composerFiles.length).toBe(0)
  expect(a.poolCodeAbsence.serveHasPoolRoute).toBe(false)
  expect(a.poolCodeAbsence.unratified.length).toBe(0)
})
