/**
 * ORGΛNON — THE PROBE SPRINT, PART E wall (RED-TEAM-CLEAN). data/honesty/probe-redteam.json carries the full first-class
 * catalog S1-S54 (S52-S54 new), the broken-on-purpose proofs that the new walls BITE, the in-process stranger drive
 * (clean), the AF1/AF2/AF4 human/live prerequisites as OWED-OPERATOR-GATED (never simulated), the two-verdict separation
 * kept, and the convergence record (two clean runs both repos, differential zero, pinsSha e6bed150).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const rt = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "probe-redteam.json"), "utf8"))

test("REDTEAM — the full first-class catalog S1-S54 is present, each PASS (S52-S54 the new probe walls)", () => {
  expect(rt.catalog).toHaveLength(54)
  expect(rt.catalog.map((c: { id: string }) => c.id)).toEqual(Array.from({ length: 54 }, (_, k) => `S${k + 1}`))
  for (const c of rt.catalog) expect(c.outcome).toMatch(/PASS/)
})

test("REDTEAM — the in-process stranger drive is CLEAN: every hostile probe got a sentence, never a stack or a secret", () => {
  expect(rt.clean).toBe(true)
  expect(rt.probes.length).toBeGreaterThanOrEqual(10)
  for (const pr of rt.probes) expect(pr.ok, `probe failed: ${pr.name}`).toBe(true)
  const names = rt.probes.map((pr: { name: string }) => pr.name).join(" | ")
  expect(names).toMatch(/OFF by default/i)
  expect(names).toMatch(/seeded-key/i)
  expect(names).toMatch(/single-consent/i)
  expect(names).toMatch(/recompute/i)
})

test("REDTEAM — the new walls were BROKEN ON PURPOSE and bite (S52 telemetry · S53 re-score · S54 goalpost)", () => {
  const ids = rt.adversarialProofs.map((a: { id: string }) => a.id)
  expect(ids).toContain("S52-telemetry-bites")
  expect(ids).toContain("S53-rescore-bites")
  expect(ids).toContain("S54-goalpost-bites")
  const s53 = rt.adversarialProofs.find((a: { id: string }) => a.id === "S53-rescore-bites")
  expect(s53.conclusion).toMatch(/cannot lie|actual output/i)
})

test("REDTEAM — AF1/AF2/AF4 the human/live prerequisites are OWED-OPERATOR-GATED (never simulated; the probe is ARMED not falsely RUNNING)", () => {
  expect(rt.operatorSession.status).toBe("OWED-OPERATOR-GATED")
  expect(rt.operatorSession.whyGap).toMatch(/agent-executed|never simulated|LN5/i)
  expect(rt.probe.status).toMatch(/RUNNING \(armed\)|PROBE-ARMED/i)
})

test("REDTEAM — the two-verdict separation is KEPT + convergence: two clean runs both repos, differential zero, verdict path frozen", () => {
  expect(rt.twoVerdicts.status).toBe("KEPT")
  expect(rt.twoVerdicts.proof).toMatch(/verdict-path-forbidden|weakened no wall/i)
  expect(rt.convergence.cleanRuns).toBe(2)
  expect(rt.convergence.bothRepos).toBe(true)
  expect(rt.convergence.verdictDifferentialZero).toBe(true)
  expect(rt.convergence.differential.lendingSetSha).toMatch(/^70c7912f/)
  expect(rt.convergence.verdictPathFrozen).toBe(true)
  expect(rt.convergence.pinsSha).toBe("e6bed150ef680d414923df79c2f9835c732a5842644749b0df9a5a1db22f0c5e")
})
