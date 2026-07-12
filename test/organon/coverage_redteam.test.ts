/**
 * ORGΛNON — THE COVERAGE SPRINT, PART E wall (the red-team evidence is real + complete). Asserts
 * data/honesty/coverage-redteam.json carries the FULL S1–S66 catalog (S64–S66 new), the adversarial "broken on purpose"
 * proofs (the new walls demonstrably BITE), the findings fixed on the go, the convergence record (two clean runs, the
 * differential zero, the bundle byte-identical), and the gate presented-never-signed (LN5). A thin driver-emitted
 * artifact — the WALLS themselves live in the other tests (breadth/lookup/chainlink/provenance_tier/correlate/stamp_inert).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const rt = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "coverage-redteam.json"), "utf8"))

test("REDTEAM — the catalog is S1–S66 (S64–S66 the new coverage walls, each PASS)", () => {
  expect(rt.catalog.count).toBe(66)
  for (const id of ["S64", "S65", "S66"]) expect(rt.catalog[id].outcome).toMatch(/PASS/)
  expect(rt.catalog.S64.name).toMatch(/coverage-license honesty/i)
  expect(rt.catalog.S65.name).toMatch(/REAL★|price layer|tiers/i)
  expect(rt.catalog.S66.name).toMatch(/inert substrate/i)
})

test("REDTEAM — the new walls were BROKEN ON PURPOSE and demonstrably bite (census-inflation, posture, REAL★ conflation, staleness, permutation, K-feed)", () => {
  const ids = rt.adversarialProofs.map((p: { id: string }) => p.id)
  for (const id of ["S64-bites", "S65-star-bites", "S65-stale-bites", "S66-perm-bites", "S66-K-feed-refused"]) expect(ids).toContain(id)
  const kfeed = rt.adversarialProofs.find((p: { id: string }) => p.id === "S66-K-feed-refused")
  expect(kfeed.observed).toMatch(/REFUSED|familyN stays 1/i)
})

test("REDTEAM — the findings fixed on the go are recorded (the redesign count inconsistency, the namespace, the catalog shape, the grep false-positive, GT2)", () => {
  const ids = rt.findingsFixedOnTheGo.map((f: { id: string }) => f.id)
  for (const id of ["W-CV01", "W-CV02", "W-CV03", "W-CV04", "GT2-fix"]) expect(ids).toContain(id)
  const w1 = rt.findingsFixedOnTheGo.find((f: { id: string }) => f.id === "W-CV01")
  expect(w1.fix).toMatch(/9c1e7bd8|byte-identical|NO verdict moved/i) // the bundle stayed byte-identical
})

test("REDTEAM — convergence: two clean runs, differential zero, bundle byte-identical, kill-criterion untouched", () => {
  expect(rt.convergence.cleanRuns).toBe(2)
  expect(rt.convergence.bothRepos).toBe(true)
  expect(rt.convergence.verdictDifferentialZero).toBe(true)
  expect(rt.convergence.differential.lendingFpSetSha).toMatch(/^70c7912f/)
  expect(rt.convergence.evidenceBundleSha).toBe("9c1e7bd8")
  expect(rt.convergence.bundleByteIdentical).toBe(true)
  expect(rt.convergence.killCriterionUntouched).toBe("8b4e094b")
})

test("REDTEAM — the gate is PRESENTED, never signed (LN5): D23-D33, D27 first, IN2/IN4/AF4 + the push Operator-gated", () => {
  expect(rt.gate.presentedNeverSigned).toBe(true)
  expect(rt.gate.package).toMatch(/D23-D33/); expect(rt.gate.package).toMatch(/D27 FIRST/i)
  expect(rt.gate.package).toMatch(/NEVER signs|LN5/i)
  expect(rt.gate.verdict).toMatch(/COVERAGE DELIVERED — READY-PENDING-OPERATOR|honest STOP/i)
})
