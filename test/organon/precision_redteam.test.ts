/**
 * ORGΛNON — THE PRECISION SPRINT, PART E wall (RED-TEAM-CLEAN). data/honesty/precision-redteam.json carries the full
 * first-class catalog S1-S60 (S58-S60 new), the broken-on-purpose proofs that the new walls BITE (the collapse whitelist,
 * the conservative classifier, the discrimination wall), the in-process skeptic drive (clean), the whole Operator gate as
 * OWED-OPERATOR-GATED (never simulated), the two-verdict separation KEPT, and the convergence record (two clean runs both
 * repos, differential zero, verdict-path + frozen-core frozen, pinsSha d2fa4cdc).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const rt = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "precision-redteam.json"), "utf8"))

test("REDTEAM — the full first-class catalog S1-S60 is present, each PASS (S58-S60 the new Precision walls)", () => {
  expect(rt.catalog).toHaveLength(60)
  expect(rt.catalog.map((c: { id: string }) => c.id)).toEqual(Array.from({ length: 60 }, (_, k) => `S${k + 1}`))
  for (const c of rt.catalog) expect(c.outcome).toMatch(/PASS/)
})

test("REDTEAM — the in-process skeptic drive is CLEAN: every hostile probe passed (collapse, classifier, discrimination, PART CLEAN)", () => {
  expect(rt.clean).toBe(true)
  expect(rt.probes.length).toBeGreaterThanOrEqual(11)
  for (const pr of rt.probes) expect(pr.ok, `probe failed: ${pr.name}`).toBe(true)
  const names = rt.probes.map((pr: { name: string }) => pr.name).join(" | ")
  expect(names).toMatch(/collapse-is-a-whitelist/i)
  expect(names).toMatch(/anti-cry-wolf/i)
  expect(names).toMatch(/discrimination/i)
})

test("REDTEAM — the new walls were BROKEN ON PURPOSE and bite (S58 collapse · S59 classifier · S60 discrimination)", () => {
  const ids = rt.adversarialProofs.map((a: { id: string }) => a.id)
  expect(ids).toContain("S58-collapse-bites")
  expect(ids).toContain("S59-classifier-bites")
  expect(ids).toContain("S60-discrimination-bites")
  for (const a of rt.adversarialProofs) expect(a.conclusion).toMatch(/answered not avoided/i)
})

test("REDTEAM — the WHOLE Operator gate is OWED-OPERATOR-GATED (never simulated; IN2/IN4/AF4 + D23-D29 + push)", () => {
  expect(rt.operatorGate.status).toBe("OWED-OPERATOR-GATED")
  expect(rt.operatorGate.owed).toMatch(/IN2.*IN4.*AF4|D23-D29|push/s)
  expect(rt.operatorGate.whyGap).toMatch(/agent-executed|never simulated|LN5/i)
  expect(rt.probe.status).toMatch(/STILL RUNNING|ARMED/i)
})

test("REDTEAM — the two-verdict separation is KEPT + convergence: two clean runs both repos, frozen sets frozen, pinsSha d2fa4cdc", () => {
  expect(rt.twoVerdicts.status).toBe("KEPT")
  expect(rt.twoVerdicts.proof).toMatch(/verdict-path-forbidden|byte-unchanged|info\/context/i)
  expect(rt.convergence.cleanRuns).toBe(2)
  expect(rt.convergence.bothRepos).toBe(true)
  expect(rt.convergence.verdictDifferentialZero).toBe(true)
  expect(rt.convergence.differential.lendingSetSha).toMatch(/^70c7912f/)
  expect(rt.convergence.verdictPathFrozen).toBe(true)
  expect(rt.convergence.frozenCoreFrozen).toBe(true)
  expect(rt.convergence.pinsSha).toBe("d2fa4cdcea7ca431e3c2cf5f7d697982ee2d19f0b95dc55d0f794a53593a2e5d")
})
