/**
 * ORGΛNON — THE DOMAIN SPRINT red-team wall (PART E; S1–S70). domain-redteam.json carries the full catalog (S67–S70 new,
 * each PASS + biting), the adversarial proofs (each SHOWS its observed output), the findings-fixed-on-the-go (W-DM01 the
 * fabricated-hit catch), the convergence (two clean runs both repos, differential zero, bundle byte-identical, the backtest
 * scoreline), and the gate (D23–D36, D27 first, operatorSignedWhole=false — LN5).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const rt = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "domain-redteam.json"), "utf8"))

test("REDTEAM — the catalog is S1–S70 (S67–S70 the new domain walls, each PASS); the artifact self-hashes", () => {
  expect(rt.catalog.count).toBe(70)
  for (const id of ["S67", "S68", "S69", "S70"]) expect(rt.catalog[id].outcome).toMatch(/PASS/)
  expect(rt.catalog.S68.bites).toMatch(/MISS-REPORTED WALL/)
  expect(rt.catalog.S69.bites).toMatch(/provably NOT agent-installed/)
  const { contentSha, ...body } = rt
  expect(sha256(JSON.stringify(body))).toBe(contentSha)
})

test("REDTEAM — the adversarial proofs (the seeded breaks that bite) are present, each with its observed output SHOWN", () => {
  const ids = rt.adversarialProofs.map((p: { id: string }) => p.id)
  for (const id of ["S67-ambiguous-unclassified", "S67-cross-domain-refused", "S68-miss-reported", "S68-fabricated-hit-caught", "S68-read-only-engine", "S68-no-post-hoc-swap", "S69-rwa-never-solid", "S69-cap-not-agent-installed"]) expect(ids).toContain(id)
  for (const p of rt.adversarialProofs) { expect(p.observed.length).toBeGreaterThan(20); expect(p.conclusion.length).toBeGreaterThan(10) } // each SHOWS its output
})

test("REDTEAM — W-DM01: the fabricated 100% HIT was CAUGHT + corrected to the real 5.71% (a fabricated hit is worse than a miss)", () => {
  expect(rt.findingsFixedOnTheGo["W-DM01"]).toMatch(/FABRICATED 100% gap/)
  expect(rt.findingsFixedOnTheGo["W-DM01"]).toMatch(/real 5\.71% gap/)
  expect(rt.findingsFixedOnTheGo["W-DM01"]).toMatch(/src\/ \(the engine\) stayed byte-frozen/)
})

test("REDTEAM — convergence: two clean runs BOTH repos, differential zero, bundle byte-identical, kill-criterion untouched, the backtest scoreline", () => {
  expect(rt.convergence.cleanRuns).toBe(2)
  expect(rt.convergence.bothRepos).toBe(true)
  expect(rt.convergence.verdictDifferentialZero).toBe(true)
  expect(rt.convergence.differential.lendingFpSetSha).toMatch(/^70c7912f/)
  expect(rt.convergence.evidenceBundleSha).toBe("9c1e7bd8")
  expect(rt.convergence.bundleByteIdentical).toBe(true)
  expect(rt.convergence.killCriterionUntouched).toBe("8b4e094b")
  expect(rt.convergence.backtestScoreline).toEqual({ hits: 2, misses: 2, gaps: 1, note: expect.any(String) })
})

test("REDTEAM — the gate is presented WHOLE (D23–D36, D27 first) but NEVER signed by the agent (LN5); the RWA cap is not agent-installed", () => {
  expect(rt.gate.package).toMatch(/D23–D36, D27 FIRST/)
  expect(rt.gate.operatorSignedWhole).toBe(false)
  expect(rt.gate.ln5).toMatch(/the agent presents the whole gate, NEVER signs it/)
  expect(rt.gate.ln5).toMatch(/a verdict-shaped rule needs the pen/)
  expect(rt.gate.verdict).toMatch(/DOMAIN DELIVERED — READY-PENDING-OPERATOR/)
})
