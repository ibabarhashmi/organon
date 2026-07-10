/**
 * ORGΛNON — THE MOAT SPRINT, PART E wall (RED-TEAM-CLEAN). data/honesty/moat-redteam.json carries the full first-class
 * catalog S1-S57 (S55-S57 new), the broken-on-purpose proofs that the new walls BITE, the in-process skeptic drive
 * (clean), the whole Operator gate as OWED-OPERATOR-GATED (never simulated), the two-verdict separation kept, and the
 * convergence record (two clean runs both repos, differential zero, verdict-path + frozen-core frozen, pinsSha 6aa2d0c7).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const rt = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "moat-redteam.json"), "utf8"))

test("REDTEAM — the full first-class catalog S1-S57 is present, each PASS (S55-S57 the new Moat walls)", () => {
  expect(rt.catalog).toHaveLength(57)
  expect(rt.catalog.map((c: { id: string }) => c.id)).toEqual(Array.from({ length: 57 }, (_, k) => `S${k + 1}`))
  for (const c of rt.catalog) expect(c.outcome).toMatch(/PASS/)
})

test("REDTEAM — the in-process skeptic drive is CLEAN: every hostile probe passed (batching, PIT, direction, hash-chain)", () => {
  expect(rt.clean).toBe(true)
  expect(rt.probes.length).toBeGreaterThanOrEqual(11)
  for (const pr of rt.probes) expect(pr.ok, `probe failed: ${pr.name}`).toBe(true)
  const names = rt.probes.map((pr: { name: string }) => pr.name).join(" | ")
  expect(names).toMatch(/batching/i)
  expect(names).toMatch(/REAL-cell integrity/i)
  expect(names).toMatch(/caveat rendered/i)
})

test("REDTEAM — the new walls were BROKEN ON PURPOSE and bite (S55 capture · S56 re-score · S57 variance)", () => {
  const ids = rt.adversarialProofs.map((a: { id: string }) => a.id)
  expect(ids).toContain("S55-capture-bites")
  expect(ids).toContain("S56-rescore-bites")
  expect(ids).toContain("S57-variance-bites")
  const s57 = rt.adversarialProofs.find((a: { id: string }) => a.id === "S57-variance-bites")
  expect(s57.conclusion).toMatch(/answered not avoided|no verdict moved/i)
})

test("REDTEAM — the WHOLE Operator gate is OWED-OPERATOR-GATED (never simulated; IN2/IN4/AF4 + D23-D27 + push)", () => {
  expect(rt.operatorGate.status).toBe("OWED-OPERATOR-GATED")
  expect(rt.operatorGate.owed).toMatch(/IN2.*IN4.*AF4|D23-D27|push/s)
  expect(rt.operatorGate.whyGap).toMatch(/agent-executed|never simulated|LN5/i)
  expect(rt.probe.status).toMatch(/STILL RUNNING|armed/i)
})

test("REDTEAM — the two-verdict separation is KEPT + convergence: two clean runs both repos, frozen sets frozen, pinsSha 6aa2d0c7", () => {
  expect(rt.twoVerdicts.status).toBe("KEPT")
  expect(rt.twoVerdicts.proof).toMatch(/verdict-path-forbidden|byte-unchanged/i)
  expect(rt.convergence.cleanRuns).toBe(2)
  expect(rt.convergence.bothRepos).toBe(true)
  expect(rt.convergence.verdictDifferentialZero).toBe(true)
  expect(rt.convergence.differential.lendingSetSha).toMatch(/^70c7912f/)
  expect(rt.convergence.verdictPathFrozen).toBe(true)
  expect(rt.convergence.frozenCoreFrozen).toBe(true)
  expect(rt.convergence.pinsSha).toBe("6aa2d0c7a23caaabe721732eb2efda2d2fbfbb79a67029f58a5b01da6c84170c")
})
