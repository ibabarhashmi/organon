/**
 * ORGΛNON — THE INTERPRETER SPRINT, PART E wall (the red-team + user-POV-drive evidence is real + complete). Asserts
 * data/honesty/interpret-redteam.json carries the full S1–S44 catalog (S42–S44 new), the adversarial "broken on purpose"
 * proofs (the new walls demonstrably BITE), the findings fixed on the go/fly (W-IN01 register over-reject routed to the
 * robust subset · DF1 the SCENARIO no-strategy UX), the user-POV drive matrix, the SV2 honest gap (NOT 'done'), and the
 * convergence record (two clean runs, the differential zero, the probe with no prerequisites left). A thin driver-emitted
 * artifact — the WALLS themselves live in ask_interpret / ask_register / ask_truncation / ask_compare / honesty_pins.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const rt = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "interpret-redteam.json"), "utf8"))

test("REDTEAM — the full first-class catalog S1–S44 is present, each PASS (S42–S44 the new interpreter walls)", () => {
  expect(rt.catalog).toHaveLength(44)
  expect(rt.catalog.map((c: { id: string }) => c.id)).toEqual(Array.from({ length: 44 }, (_, k) => `S${k + 1}`))
  for (const c of rt.catalog) expect(c.outcome).toMatch(/PASS/)
  expect(rt.catalog.find((c: { id: string }) => c.id === "S42").name).toMatch(/register differentiation/i)
  expect(rt.catalog.find((c: { id: string }) => c.id === "S43").name).toMatch(/three-layer truncation/i)
  expect(rt.catalog.find((c: { id: string }) => c.id === "S44").name).toMatch(/interpretation-not-restatement|walls-hold/i)
})

test("REDTEAM — the new walls were BROKEN ON PURPOSE and demonstrably bite (S42 register, S43 the three-layer truncation, S44 interpretation + walls-hold-on-a-wider-lane)", () => {
  const ids = rt.adversarialProofs.map((p: { id: string }) => p.id)
  expect(ids).toContain("S42-register-bites")
  expect(ids).toContain("S43-truncation-bites")
  expect(ids).toContain("S44-interpretation-not-restatement-bites")
  const reg = rt.adversarialProofs.find((p: { id: string }) => p.id === "S42-register-bites")
  expect(reg.observed).toMatch(/rejects the jargon|too-short Pro|identical pair/i)
  const trunc = rt.adversarialProofs.find((p: { id: string }) => p.id === "S43-truncation-bites")
  expect(trunc.observed).toMatch(/overflow-wrap|scaleCap|EXPLICIT/i)
  expect(trunc.conclusion).toMatch(/ALL THREE layers|no clip, no silent cut, no silent drop/i)
  const s44 = rt.adversarialProofs.find((p: { id: string }) => p.id === "S44-interpretation-not-restatement-bites")
  expect(s44.observed).toMatch(/BYTE-UNCHANGED|STILL rejects/i)
  expect(s44.conclusion).toMatch(/the floor did not drop|same functions/i)
})

test("REDTEAM — W-IN01 (the register-gate over-reject) was surfaced by the battery, ROUTED as a wall issue (not by loosening the register distinction), and fixed to the robust subset", () => {
  const w = rt.findings.find((f: { id: string }) => f.id === "W-IN01")
  expect(w).toBeDefined()
  expect(w.scenario).toMatch(/proxyCaveat|over-rejected|flags that structurally/i)
  expect(w.rootCause).toMatch(/over-coupled|too-narrow regex|wrong height/i)
  expect(w.handling).toMatch(/ROUTED as a correctness\/wall issue|robust.*subset|not.*loosening/i)
  expect(w.handling).toMatch(/POSITIVE-CONTROLLED|ctx-gated/i) // the full rubric is still proven to bite
  expect(w.retest).toMatch(/green/i)
})

test("REDTEAM — W-IN02 (a clone-fragile register test) was caught by the PRISTINE gate + fixed to the clone-invariant distinction (the test was wrong, not the product)", () => {
  const w = rt.findings.find((f: { id: string }) => f.id === "W-IN02")
  expect(w).toBeDefined()
  expect(w.surfacedBy).toMatch(/PRISTINE fresh-clone gate/i)
  expect(w.observed).toMatch(/SAMPLE.*UNVERIFIED|names NO axis|514/i)
  expect(w.rootCause).toMatch(/the test, not the product, was wrong|FACT\/BOUNDARY blocks/i)
  expect(w.retest).toMatch(/SIMULATED fresh clone|PRISTINE re-run GREEN/i)
})

test("REDTEAM — DF1 (the SCENARIO no-strategy UX) was surfaced by the user-POV drive + FIXED ON THE FLY as pure-UX (no fact/verdict moved)", () => {
  const d = rt.findings.find((f: { id: string }) => f.id === "DF1")
  expect(d).toBeDefined()
  expect(d.surfacedBy).toMatch(/user-POV drive|X-DOGFOOD/i)
  expect(d.handling).toMatch(/pure-UX|no fact\/verdict moved/i)
  expect(d.fix).toMatch(/scenario\(\)|tools\.ts/i)
  expect(d.retest).toMatch(/green/i)
})

test("REDTEAM — X-DOGFOOD: the user-POV drive covered the full matrix (screens × registers × the 13 intents × CLI × key/no-key × degraded states) alongside the S-catalog", () => {
  expect(rt.dogfood.doctrine).toMatch(/proves the WALLS.*proves the EXPERIENCE|ALONGSIDE/i)
  expect(Array.isArray(rt.dogfood.matrixDriven) && rt.dogfood.matrixDriven.length).toBeGreaterThanOrEqual(5)
  const m = rt.dogfood.matrixDriven.join(" ")
  expect(m).toMatch(/13 ASK INTENTS/i)
  expect(m).toMatch(/Simple AND Pro/i)
  expect(m).toMatch(/degraded states|empty shelf|AI-off/i)
  expect(m).toMatch(/CLI|organon\.sh/i)
})

test("REDTEAM — SV2 is an HONEST GAP, never silently 'done' (POOL-EVENTS built + fence-proven, NOT live — the token was absent)", () => {
  expect(rt.sv2.status).toBe("HONEST-GAP")
  expect(rt.sv2.attempt).toMatch(/HYPERSYNC_TOKEN.*ABSENT/i)
  expect(rt.sv2.outcome).toMatch(/NOT silently marked 'done'|honest.*gap|NOT live-exercised/i)
})

test("REDTEAM — convergence: two clean runs, differential zero, verify + pristine green, tokens frozen, the persona re-pin signed with NO cascade; the probe has NO prerequisites left", () => {
  expect(rt.convergence.cleanRuns).toBe(2)
  expect(rt.convergence.verdictDifferentialZero).toBe(true)
  expect(rt.convergence.differential.lendingFpSetSha).toMatch(/^70c7912f/)
  expect(rt.convergence.differential.fundingReproHash).toMatch(/^0a63151b/)
  expect(rt.convergence.verifyGreen).toBe(true)
  expect(rt.convergence.pristineGreen).toBe(true)
  expect(rt.convergence.tokensFrozen).toBe(true)
  expect(rt.convergence.personaRepin.signed).toBe("D18")
  expect(rt.convergence.personaRepin.cascade).toMatch(/none|supersession/i)
  expect(rt.convergence.skipSetPristine).toEqual(["ask_live", "eval_live", "surface_detector"])
  expect(rt.probe.nextSprintRunsIt).toBe(true)
  expect(rt.probe.firstLine).toMatch(/voice now EXPLAINS|NO EXCUSE LEFT/i)
  expect(rt.probe.stage0).toMatch(/10-customer|re-score post-mortems/i)
})
