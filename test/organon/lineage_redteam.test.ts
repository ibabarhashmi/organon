/**
 * ORGΛNON — THE LINEAGE SPRINT, PART E wall (the red-team + agent-drive evidence is real + complete). Asserts
 * data/honesty/lineage-redteam.json carries the full S1–S47 catalog (S45–S47 new), the "broken on purpose" proofs (the
 * new walls demonstrably BITE), the findings/observations recorded honestly (W-LIN00 clean · OBS-reason-prose the conscious
 * frozen-prose boundary), the agent-side served drive, the IN2 Operator session as an HONEST NAMED GAP (owed, NOT
 * simulated — the A′#11 fence), the two-verdict separation kept, and the convergence record (two clean runs, the
 * differential zero, verify + pristine green, the Stamp math byte-frozen). A thin driver-emitted artifact — the WALLS
 * live in lineage_walls / lineage_fix / lineage_diagnosis / honesty_pins.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const rt = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "lineage-redteam.json"), "utf8"))

test("REDTEAM — the full first-class catalog S1–S47 is present, each PASS (S45–S47 the new lineage walls)", () => {
  expect(rt.catalog).toHaveLength(47)
  expect(rt.catalog.map((c: { id: string }) => c.id)).toEqual(Array.from({ length: 47 }, (_, k) => `S${k + 1}`))
  for (const c of rt.catalog) expect(c.outcome).toMatch(/PASS/)
  expect(rt.catalog.find((c: { id: string }) => c.id === "S45").name).toMatch(/SAMPLE-never-GO at the render/i)
  expect(rt.catalog.find((c: { id: string }) => c.id === "S46").name).toMatch(/per-subject distinctness/i)
  expect(rt.catalog.find((c: { id: string }) => c.id === "S47").name).toMatch(/strength legibility|capped precision/i)
})

test("REDTEAM — the new walls were BROKEN ON PURPOSE and demonstrably bite (S45 SAMPLE-never-GO-at-the-render, S46 distinctness + derivation, S47 strength + capped precision)", () => {
  const ids = rt.adversarialProofs.map((p: { id: string }) => p.id)
  expect(ids).toContain("S45-sample-never-go-bites")
  expect(ids).toContain("S46-distinctness-bites")
  expect(ids).toContain("S47-strength-legibility-bites")
  const s45 = rt.adversarialProofs.find((p: { id: string }) => p.id === "S45-sample-never-go-bites")
  expect(s45.observed).toMatch(/SAMPLE identity → INSUFFICIENT|absent identity → UNAVAILABLE|render boundary/i)
  expect(s45.conclusion).toMatch(/necessary but not sufficient|render boundary|never show a SAMPLE-fed GO/i)
  const s46 = rt.adversarialProofs.find((p: { id: string }) => p.id === "S46-distinctness-bites")
  expect(s46.observed).toMatch(/RECOMPUTES from poolReturnsFromSeries|shared-hash collision|N-pool walk/i)
  expect(s46.conclusion).toMatch(/proves derivation, it does not merely display|caught/i)
  const s47 = rt.adversarialProofs.find((p: { id: string }) => p.id === "S47-strength-legibility-bites")
  expect(s47.observed).toMatch(/≥ 0\.9999|sixteen digits gone|full-precision|WEAKEST form/i)
  expect(s47.conclusion).toMatch(/capped DISPLAY, uncapped RECORD|math untouched/i)
})

test("REDTEAM — the built system surfaced no NEW defect (W-LIN00 clean) + the frozen-reason-prose boundary is disclosed honestly (OBS-reason-prose), not hidden", () => {
  const w = rt.findings.find((f: { id: string }) => f.id === "W-LIN00")
  expect(w).toBeDefined()
  expect(w.handling).toMatch(/clean|no NEW defect/i)
  const obs = rt.findings.find((f: { id: string }) => f.id === "OBS-reason-prose")
  expect(obs).toBeDefined()
  expect(obs.rootCause).toMatch(/byte-frozen|CANNOT be edited|NOT the sixteen-digit theater/i)
  expect(obs.handling).toMatch(/CONSCIOUS BOUNDARY, not a defect|added AT THE RENDER|Disclosed, not hidden/i)
})

test("REDTEAM — the agent-side served drive is AGENT-DRIVEN (explicitly not the Operator's session) and covers the lineage/strength/cap + COMPARE-no-clip", () => {
  expect(rt.agentDrive.doctrine).toMatch(/agent-driven verification|NOT relabeled as the Operator's|A′#11/i)
  const o = rt.agentDrive.observed.join(" ")
  expect(o).toMatch(/lineage lines DIFFER/i)
  expect(o).toMatch(/sixteen-digit significance is GONE|≥ 0\.9999/i)
  expect(o).toMatch(/weakest-form strength line/i)
  expect(o).toMatch(/UNAVAILABLE.*no recorded return series|funding pool degrades/i)
  expect(o).toMatch(/oversized COMPARE.*no clip|overflow-wrap/i)
})

test("REDTEAM — IN2 the Operator real-screen session is an HONEST NAMED GAP (owed; never an agent simulation relabeled — the A′#11 fence)", () => {
  expect(rt.operatorSession.status).toBe("HONEST-GAP")
  expect(rt.operatorSession.whyGap).toMatch(/agent-executed|never an agent simulation relabeled|A′#11/i)
  expect(rt.operatorSession.owed).toMatch(/OPERATOR.*drives|real screen|lineage lines visibly DIFFERENT/i)
})

test("REDTEAM — the two-verdict separation is KEPT (X-LINEAGE f) — the Stamp never renders a scorecard pill, never conflated", () => {
  expect(rt.twoVerdicts.status).toBe("KEPT")
  expect(rt.twoVerdicts.proof).toMatch(/never a scorecard pill|S16 isolation|orthogonal|did not conflate/i)
})

test("REDTEAM — convergence: two clean runs, differential zero, verify + pristine green, the Stamp math byte-frozen, D20=H3; the probe has no prerequisites left", () => {
  expect(rt.convergence.cleanRuns).toBe(2)
  expect(rt.convergence.verdictDifferentialZero).toBe(true)
  expect(rt.convergence.differential.lendingFpSetSha).toMatch(/^70c7912f/)
  expect(rt.convergence.differential.fundingReproHash).toMatch(/^0a63151b/)
  expect(rt.convergence.verifyGreen).toBe(true)
  expect(rt.convergence.pristineGreen).toBe(true)
  expect(rt.convergence.stampMathFrozen).toBe(true)
  expect(rt.convergence.skipSetPristine).toEqual(["ask_live", "eval_live", "surface_detector"])
  expect(rt.convergence.pinsSha).toBe("ed4bb2cb8957f244927f5e00daf7ddd0d1408abf984dd1fe40ff0557f61bd42f")
  expect(rt.convergence.d20Finding).toMatch(/H3|real-but-illegible|0 per-pool verdict changes/i)
  expect(rt.probe.nextSprintRunsIt).toBe(true)
  expect(rt.probe.firstLine).toMatch(/proves whose data earned|NO EXCUSE LEFT/i)
  expect(rt.probe.stage0).toMatch(/10-customer|re-score post-mortems|browser\/AT a11y pass \(IN4\)/i)
})
