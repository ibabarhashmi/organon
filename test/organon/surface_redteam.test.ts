/**
 * ORGΛNON — THE SURFACE SPRINT, PART E wall (the red-team evidence is real + complete). Asserts data/honesty/
 * surface-redteam.json carries the full S1–S38 catalog (S36–S38 new), the adversarial "broken on purpose" proofs (the
 * new walls demonstrably BITE), the findings fixed on the go, and the convergence record (two clean runs, the differential
 * zero, the probe unforgivably overdue). A thin driver-emitted artifact — the WALLS themselves live in the other tests.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const rt = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "surface-redteam.json"), "utf8"))

test("REDTEAM — the full first-class catalog S1–S38 is present, each PASS (S36–S38 the new surface walls)", () => {
  expect(rt.catalog).toHaveLength(38)
  expect(rt.catalog.map((c: { id: string }) => c.id)).toEqual(Array.from({ length: 38 }, (_, k) => `S${k + 1}`))
  for (const c of rt.catalog) expect(c.outcome).toMatch(/PASS/)
  expect(rt.catalog.find((c: { id: string }) => c.id === "S36").name).toMatch(/honesty-preserving/i)
  expect(rt.catalog.find((c: { id: string }) => c.id === "S37").name).toMatch(/a11y|degraded/i)
  expect(rt.catalog.find((c: { id: string }) => c.id === "S38").name).toMatch(/detector/i)
})

test("REDTEAM — the new walls were BROKEN ON PURPOSE and demonstrably bite (S38 side-tab, S36 moved number, S37 greyscale, the dep-wall)", () => {
  const ids = rt.adversarialProofs.map((p: { id: string }) => p.id)
  expect(ids).toContain("S38-bites")
  expect(ids).toContain("S36-bites")
  const s38 = rt.adversarialProofs.find((p: { id: string }) => p.id === "S38-bites")
  expect(s38.conclusion).toMatch(/real wall|caught/i)
  const s36 = rt.adversarialProofs.find((p: { id: string }) => p.id === "S36-bites")
  expect(s36.observed).toMatch(/sha changes|content signature/i)
  expect(s36.conclusion).toMatch(/not vacuous|real wall/i)
})

test("REDTEAM — the findings fixed on the go are recorded with root-cause + fix + retest (W-SU01 stamp-isolation, W-SU02 naming collision)", () => {
  const byId = (id: string) => rt.findings.find((f: { id: string }) => f.id === id)
  expect(byId("W-SU01").fix).toMatch(/strips the <style>|intent-preserved/i)
  expect(byId("W-SU01").retest).toMatch(/S16 green|zero Stamp verdicts/i)
  expect(byId("W-SU02").fix).toMatch(/findings_closed_voice/)
})

test("REDTEAM — the reasoned detector exception is recorded (em-dash: the constitution outranks the detector), never a silent suppression", () => {
  const ex = rt.reasonedExceptions.find((e: { rule: string }) => e.rule === "em-dash-overuse")
  expect(ex).toBeDefined()
  expect(ex.reason.length).toBeGreaterThan(20)
  expect(ex.authority).toMatch(/Attack-11|X-SURFACE/)
})

test("REDTEAM — convergence: two clean runs, differential zero, verify + pristine green; the probe is unforgivably overdue (first line)", () => {
  expect(rt.convergence.cleanRuns).toBe(2)
  expect(rt.convergence.verdictDifferentialZero).toBe(true)
  expect(rt.convergence.differential.lendingFpSetSha).toMatch(/^70c7912f/)
  expect(rt.convergence.differential.fundingReproHash).toMatch(/^0a63151b/)
  expect(rt.convergence.verifyGreen).toBe(true)
  expect(rt.convergence.pristineGreen).toBe(true)
  expect(rt.convergence.reconciliationLine).toMatch(/703 → 768 → 807/)
  expect(rt.convergence.skipSetPristine).toEqual(["ask_live", "eval_live", "surface_detector"])
  expect(rt.probe.unforgivablyOverdue).toBe(true)
  expect(rt.probe.firstLine).toMatch(/VOICE and a FACE|UNFORGIVABLY OVERDUE/)
})
