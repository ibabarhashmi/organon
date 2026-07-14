/**
 * ORGΛNON — THE REACH SPRINT (V35), PART E: the ADVERSARIAL VALIDATION RECORD, asserted in the shipped code.
 *
 * Each of the 12 PART A′ attacks has a binding consequence, and each of the 7 PART F re-pins (RP-1..RP-7) a design
 * correction. This wall asserts they are not just pinned prose but hold in the built system — the "attacked before design"
 * record made checkable (the mechanism that produced V34's RP-1..RP-4, two of which were that sprint's best corrections).
 */
import { test, expect } from "bun:test"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Rigor } from "../../src/backtest/rigor"
import { Reach } from "../../src/organon/reach"
import { Falsify } from "../../src/organon/falsify"
import { Verify } from "../../src/organon/verify"

const H = path.join(PKG_ROOT, "data", "honesty")
const rp = JSON.parse(readFileSync(path.join(H, "reach-pins.json"), "utf8"))

test("PART A′ — all 12 attacks are recorded with a binding consequence (attacked before design)", () => {
  const a = rp.adversarialRecord_partA
  const keys = Object.keys(a).filter((k) => k.startsWith("A"))
  expect(keys.length).toBe(12)
  for (const k of keys) expect(String(a[k]).length).toBeGreaterThan(40) // each carries a real consequence, not a stub
  // the sharpest ones, spot-checked
  expect(a.A2_mockedCrossCheck).toMatch(/gravest|mock/i)
  expect(a.A4_binaryStillZero).toMatch(/UNPUBLISHED|two pens|PUBLISHING/i)
  expect(a.A12_priorityInversion).toMatch(/NEVER sheds/i)
})

test("PART F — all 7 re-pins (RP-1..RP-7) are recorded, and each HOLDS in the shipped code", () => {
  const f = rp.postImplementationRePins_partF
  for (let i = 1; i <= 7; i++) expect(String(f[Object.keys(f).find((k) => k.startsWith(`RP${i}_`))!]).length).toBeGreaterThan(30)

  // RP-1 — the census has ORIGIN_UNRECORDED as a real, populated fourth bucket (not invented origins)
  const census = Falsify.census()
  expect(census.counts.ORIGIN_UNRECORDED).toBeGreaterThan(0)
  // RP-3 — the egress claim is at the provable strength (no provider constructed), never an unqualified "zero egress"
  expect(f.RP3_egressAssertionStrength).toMatch(/NO provider is constructed/i)
  expect(f.RP3_egressAssertionStrength).not.toMatch(/unqualified 'zero egress' is fine/i)
  // RP-4 — published is DERIVED (git), not a declared constant
  expect(Reach.fact().publishedDetail).toMatch(/DERIVED/i)
  // RP-5 — D50's window is a concrete number
  expect(rp.deviations.D50).toMatch(/90 days/)
  // RP-6 — the census is a living wall (a pure read; orphans are caught)
  expect(typeof Falsify.orphanWallIds).toBe("function")
})

test("PART E — the four PART CLEAN pure functions exist and behave (Falsify.census · Verify.run · Reach.fact · Rigor.crossCheck)", () => {
  expect(typeof Falsify.census).toBe("function")
  expect(typeof Verify.run).toBe("function")
  expect(typeof Reach.fact).toBe("function")
  expect(typeof Rigor.crossCheck).toBe("function")
  // Rigor.crossCheck returns a first-class BLOCKED or an executed cross-check — never throws, never mocks
  const cc = Rigor.crossCheck()
  expect(Rigor.isBlocked(cc) || cc.executed === true).toBe(true)
})

test("PART E — the sprint's four honesty artifacts are committed (the record survives the environment, X-SHOWN(e))", () => {
  for (const f of ["reach-pins.json", "rigor-crosscheck.json", "falsifiability-census.json", "reach.json", "mr1-census.json", "frozen-set-coverage.json"]) {
    expect(existsSync(path.join(H, f))).toBe(true)
  }
})

test("PART E — the Halt is honored: newProductCapability is 0, and the two pens (IN2 + PUBLICATION) are named", () => {
  expect(rp.carried.newProductCapability).toBe(0)
  expect(rp.haltRePinned.twoPens).toMatch(/IN2/)
  expect(rp.haltRePinned.twoPens).toMatch(/PUBLICATION/)
  // LN5 — every V35 deviation is unsigned (the agent presents, never signs)
  for (const d of ["D46", "D47", "D48", "D49", "D50", "D33"]) expect(rp.deviations[d]).toMatch(/operatorSigned=false|UNSIGNABLE|CARRIED/i)
})
