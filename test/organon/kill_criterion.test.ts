/**
 * ORGΛNON — THE PROBE SPRINT, Phase 4 walls (S54 — the pre-registered kill-criterion; X-PROBE). Concrete + numeric +
 * continue/pivot/stop, committed to the ledger BEFORE any invite, immutable-without-a-disclosed-re-pin (the commitHash
 * makes an edit detectable). The anti-goalpost-move discipline: the Stamp's anti-overfitting standard, applied to the
 * tool's own thesis.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const kc = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "probe-kill-criterion.json"), "utf8"))

test("S54 — the kill-criterion is present, concrete, and numeric (continue/pivot/stop per metric)", () => {
  expect(kc.metrics.length).toBeGreaterThanOrEqual(3)
  for (const m of kc.metrics) {
    for (const k of ["metric", "measurement", "continueThreshold", "pivotThreshold", "stopThreshold"]) expect(m[k], `${m.metric} missing ${k}`).toBeTruthy()
    // each threshold names a concrete number (a bar, not a vibe)
    const joined = `${m.continueThreshold} ${m.pivotThreshold} ${m.stopThreshold}`
    expect(joined, `${m.metric} thresholds are not numeric`).toMatch(/[0-9]/)
  }
  expect(kc.decisionRule).toMatch(/CONTINUE|STOP|PIVOT/)
  expect(kc.metrics.map((m: { metric: string }) => m.metric)).toEqual(["returning-testers", "feedback-trust", "rescore-conversation"])
})

test("S54 — it is PRE-REGISTERED (committed before invites) and grades against a fixed definition, not a moving goalpost", () => {
  expect(kc.status).toMatch(/PRE-REGISTERED|committed before invites/i)
  expect(kc.antiGoalpostMove).toMatch(/before any invite|moved goalpost|disclosed re-pin/i)
  expect(kc.window).toMatch(/[0-9]+\s*days/i)
})

test("S54 — it is IMMUTABLE-without-disclosure: the commitHash matches the content (an edit changes the hash → a visible re-pin)", () => {
  const { commitHash, ...body } = kc
  const recomputed = createHash("sha256").update(JSON.stringify(body)).digest("hex")
  expect(recomputed).toBe(commitHash) // the committed hash IS the hash of the committed definition
})
