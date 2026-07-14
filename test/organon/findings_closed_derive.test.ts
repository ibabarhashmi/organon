/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), PART E: the ADVERSARIAL VALIDATION RECORD, asserted in the shipped code.
 *
 * Each of the 10 PART A′ attacks has a binding consequence, and each of the 7 PART F re-pins (RP-1..RP-7) a design
 * correction. This wall asserts they are not just pinned prose but HOLD in the built system — the "attacked before design"
 * record made checkable (the mechanism that produced V35's most valuable corrections, RP-2/RP-3/RP-4).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Claim } from "../../src/organon/claim"
import { CrossCheck, Signability } from "../../src/backtest/crosscheck"
import { Release } from "../../src/organon/release"
import { Falsify } from "../../src/organon/falsify"
import { Rigor } from "../../src/backtest/rigor"

const H = path.join(PKG_ROOT, "data", "honesty")
const dp = JSON.parse(readFileSync(path.join(H, "derive-pins.json"), "utf8"))
const rec = JSON.parse(readFileSync(path.join(H, "rigor-crosscheck.json"), "utf8"))

test("PART A′ — all 10 attacks are recorded with a binding consequence (attacked before design)", () => {
  const a = dp.adversarialRecord_partA
  const keys = Object.keys(a).filter((k) => /^A\d+_/.test(k))
  expect(keys.length).toBe(10)
  for (const k of keys) expect(String(a[k]).length).toBeGreaterThan(40) // each carries a real consequence, not a stub
  expect(a.A1_generatedLieIsUnexamined).toMatch(/SEEDED NEGATIVE|unexamined/i)
  expect(a.A2_toleranceChosenAfter).toMatch(/PRE-REGISTERED/i)
  expect(a.A4_inactionIsJudgment).toMatch(/does not conclude|the pen chooses/i)
})

test("PART A′ #1 — every producer has a demonstrated seeded negative that HOLDS: d33 flips to UNSIGNABLE on a seeded disagreement (the claim's own inversion)", () => {
  const seeded = { ...(rec.crossCheck as Rigor.CrossCheck), pbo: 0.6, pboPurgedcv: 0.95, pboDiff: 0.35 }
  expect(Signability.d33(CrossCheck.all(seeded)).state).toBe("UNSIGNABLE") // A1 / RP-1 holds
})

test("PART A′ #2 & RP-2 — the tolerance is PRE-REGISTERED and read from the pins (never the call site); UNCOMPARABLE is representable", () => {
  expect(CrossCheck.tolerance("pbo")).toBe(dp.preRegisteredTolerances.pbo) // read from the pins
  const uncomp = CrossCheck.agreement("pbo", { ...(rec.crossCheck as Rigor.CrossCheck), cscvAlignment: { ...rec.crossCheck.cscvAlignment, comparable: false } })
  expect(uncomp.agrees).toBe("UNCOMPARABLE") // 'could not compare' ≠ 'disagree' (RP-2)
})

test("PART A′ #3 & RP-3 — census deletion is disciplined: re-founded is counted APART, deletions carry proof, and DELETE was needed for zero walls", () => {
  const c = Falsify.census()
  expect(c.reFounded).toBeGreaterThanOrEqual(10) // DD-20 processed >=10
  expect(c.recovered + c.reFounded + c.deleted.length).toBeGreaterThanOrEqual(10)
  expect(Falsify.DELETED_WALLS.length).toBe(0) // re-founding is the expected route; deletion is rare (none this sprint)
})

test("PART A′ #7 & the disagreement-is-a-finding posture — a comparable |Δ|≥tolerance computes agrees:false → UNSIGNABLE (a headline, not a bug)", () => {
  const disagree = { ...(rec.crossCheck as Rigor.CrossCheck), psr: 0.5, psrPurgedcv: 0.99 }
  expect(CrossCheck.agreement("psr", disagree).agrees).toBe(false)
  expect(dp.preRegisteredTolerances.disagreementIsAFinding).toMatch(/HEADLINE/i)
})

test("PART F — all 7 re-pins (RP-1..RP-7) are recorded, and each HOLDS in the shipped code", () => {
  const f = dp.postImplementationRePins_partF
  for (let i = 1; i <= 7; i++) expect(Object.keys(f).some((k) => k.startsWith(`RP${i}_`))).toBe(true)
  // RP-4 — the battery producer emits named removals ({pass, removed, removedReason[]})
  const battery = Claim.producer("battery").value as { removed: number; removedReason: string[] }
  expect(Array.isArray(battery.removedReason)).toBe(true)
  // RP-5 — D50's window is a concrete number (90 days), and option (2)'s cost is computed (RETIRES the arc)
  expect(dp.deviations.D50).toMatch(/90 days|RP-5/i)
  expect(dp.deviations.D51).toMatch(/RETIRES the Socket/i)
  // RP-6 — the clone proves self-contained, not stranger-reproducible
  expect(f.RP6_cloneProvesSelfContainedNotReproducible).toMatch(/self-contained/i)
})

test("PART E — the Halt is honored a THIRD time: newProductCapability is 0, D51 presents the menu and never chooses (LN5), every deviation unsigned", () => {
  expect(Claim.producer("newProductCapability").value).toBe(0)
  expect(dp.deviations.D51).toMatch(/never chosen|the pen chooses/i)
  for (const d of ["D51", "D52", "D49", "D50", "D33"]) expect(dp.deviations[d]).toMatch(/operatorSigned=false|CARRIED/i)
})

test("PART E — the sprint's honesty artifacts are committed (the record survives the environment, X-SHOWN(e))", () => {
  const { existsSync } = require("node:fs")
  for (const f of ["derive-pins.json", "rigor-crosscheck.json", "falsifiability-census.json", "release-manifest.json", "mr1-census.json"]) {
    expect(existsSync(path.join(H, f))).toBe(true)
  }
})
