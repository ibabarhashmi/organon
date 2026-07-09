/**
 * ORGΛNON — THE SOVEREIGN SPRINT, PART E wall (the red-team evidence is real + complete). Asserts data/honesty/
 * sovereign-redteam.json carries the full S1–S41 catalog (S39–S41 new), the adversarial "broken on purpose" proofs (the
 * new walls demonstrably BITE), the finding fixed on the go (W-SO01 — surfaced by the design critique, routed, fixed with
 * a conscious scoped golden re-capture), the live plane proofs, and the convergence record (two clean runs, the
 * differential zero, the probe with no prerequisites left). A thin driver-emitted artifact — the WALLS themselves live in
 * plane_funding / plane_events / plane_rpcstate / surface_designpass / honesty_pins.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const rt = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "sovereign-redteam.json"), "utf8"))

test("REDTEAM — the full first-class catalog S1–S41 is present, each PASS (S39–S41 the new sovereign walls)", () => {
  expect(rt.catalog).toHaveLength(41)
  expect(rt.catalog.map((c: { id: string }) => c.id)).toEqual(Array.from({ length: 41 }, (_, k) => `S${k + 1}`))
  for (const c of rt.catalog) expect(c.outcome).toMatch(/PASS/)
  expect(rt.catalog.find((c: { id: string }) => c.id === "S39").name).toMatch(/plane provenance|no-fabricated-history/i)
  expect(rt.catalog.find((c: { id: string }) => c.id === "S40").name).toMatch(/narrow-path fence|kill-condition/i)
  expect(rt.catalog.find((c: { id: string }) => c.id === "S41").name).toMatch(/design-pass honesty/i)
})

test("REDTEAM — the new walls were BROKEN ON PURPOSE and demonstrably bite (S39 fabrication + divergence, S40 fence, S41 design-pass + tokens-frozen)", () => {
  const ids = rt.adversarialProofs.map((p: { id: string }) => p.id)
  expect(ids).toContain("S39-fabrication-bites")
  expect(ids).toContain("S39-divergence-bites")
  expect(ids).toContain("S40-fence-bites")
  expect(ids).toContain("S41-designpass-holds")
  const fab = rt.adversarialProofs.find((p: { id: string }) => p.id === "S39-fabrication-bites")
  expect(fab.observed).toMatch(/FabricatedHistoryError|REFUSED/i)
  const div = rt.adversarialProofs.find((p: { id: string }) => p.id === "S39-divergence-bites")
  expect(div.conclusion).toMatch(/never silently resolved|surfaced fact/i)
  const fence = rt.adversarialProofs.find((p: { id: string }) => p.id === "S40-fence-bites")
  expect(fence.observed).toMatch(/IGNORES|only.*rate-update.*tvl-move.*liquidity-move/i)
})

test("REDTEAM — W-SO01 (the '4 of 3' impossible ratio) was surfaced by the critique, ROUTED (not patched into the aesthetics pass), and fixed with a CONSCIOUS SCOPED golden re-capture", () => {
  const w = rt.findings.find((f: { id: string }) => f.id === "W-SO01")
  expect(w).toBeDefined()
  expect(w.scenario).toMatch(/4 of 3|impossible ratio/i)
  expect(w.rootCause).toMatch(/GLOBAL count.*PER-SHELF|numerator.*denominator/i)
  expect(w.handling).toMatch(/ROUTED, not patched|intersection/i)
  expect(w.fix).toMatch(/realPoolKeys\.has|applicableCards\.filter/)
  // the golden re-capture is SCOPED + documented (only the two shelf screens moved; the other three kept their Surface shas)
  expect(w.goldenRecapture).toMatch(/ONLY the two shelf screens/i)
  expect(w.goldenRecapture).toMatch(/6b69b40a/) // reality-sample retained its original Surface sha (no hidden drift)
  expect(w.goldenRecapture).toMatch(/e689ff74.*fa4e9d65|shelf-sample/i)
  expect(w.retest).toMatch(/green/i)
})

test("REDTEAM — the plane's live proofs are recorded honestly (FUNDING + RPC live-proven; POOL-EVENTS built + fence-proven, token-absent honest degrade)", () => {
  const byPath = (p: string) => rt.plane.liveProofs.find((x: { path: string }) => x.path === p)
  expect(byPath("FUNDING-HISTORY").proof).toMatch(/500 REAL.*points|4bb02df9/i)
  expect(byPath("RPC-STATE").proof).toMatch(/25496922|publicnode/i)
  expect(byPath("POOL-EVENTS").proof).toMatch(/NO live events.*this run|token is absent|optional seam/i) // honestly not overstated
  expect(rt.plane.killConditionArmed).toMatch(/1 day\/week|DeFiLlama Pro|narrow/i)
  expect(rt.plane.divergenceSurfaced).toMatch(/never silently resolved/i)
})

test("REDTEAM — the design pass is recorded honest: critique run for real, browser/live NOT run, tokens NOT re-pinned (byte-frozen)", () => {
  expect(rt.designPass.critiqueRunForReal).toMatch(/design-review sub-agent.*detector/i)
  expect(rt.designPass.honestBound).toMatch(/NOT run|no browser automation/i)
  expect(rt.designPass.tokensRePinned).toBe(false)
  expect(rt.designPass.applied).toMatch(/facts-loudest|P1/i)
})

test("REDTEAM — convergence: two clean runs, differential zero, verify + pristine green, tokens frozen; the probe has NO prerequisites left (first line)", () => {
  expect(rt.convergence.cleanRuns).toBe(2)
  expect(rt.convergence.verdictDifferentialZero).toBe(true)
  expect(rt.convergence.differential.lendingFpSetSha).toMatch(/^70c7912f/)
  expect(rt.convergence.differential.fundingReproHash).toMatch(/^0a63151b/)
  expect(rt.convergence.verifyGreen).toBe(true)
  expect(rt.convergence.pristineGreen).toBe(true)
  expect(rt.convergence.tokensFrozen).toBe(true)
  expect(rt.convergence.skipSetPristine).toEqual(["ask_live", "eval_live", "surface_detector"])
  expect(rt.probe.nextSprintRunsIt).toBe(true)
  expect(rt.probe.firstLine).toMatch(/OWNS its senses|NO EXCUSE LEFT|last prerequisites/i)
  expect(rt.probe.stage0).toMatch(/10-customer|re-score post-mortems/i)
})
