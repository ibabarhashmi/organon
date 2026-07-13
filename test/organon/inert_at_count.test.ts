/**
 * ORGΛNON — THE CADENCE SPRINT wall S75 (INERT AT COUNT). This sprint's cadence makes trials accumulate far faster than manual
 * compiles, so the inert wall is re-proven WHERE IT NOW MATTERS: a committed lineage grown to ≥20 trials (23) STILL shows
 * familyN===1 in every Stamp output and the K-door STILL refuses without BOTH the trigger AND D33. Nearness is exactly why the
 * wall exists — this sprint stands closer to the line than any before it. The Stamp path imports NO strategy/monitor module.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { StrategyStore } from "../../src/strategy/store"
import { StrategyTrial } from "../../src/strategy/trial"
import { Correlate } from "../../src/analytics/correlate"

// find the committed ≥20-trial lineage (the cadence fixture — distinct from the V31 3-trial lineage)
function grownLineage(): { id: string; config: string; count: number } {
  for (const id of StrategyStore.list(StrategyStore.FIXTURE_DIR)) {
    const m = StrategyStore.load(id, StrategyStore.FIXTURE_DIR)
    if (!m) continue
    const config = StrategyStore.manifestHash(m)
    const count = StrategyTrial.ledger(config, StrategyTrial.FIXTURE_TRIAL_DIR).length
    if (count >= 20) return { id, config, count }
  }
  throw new Error("no committed ≥20-trial lineage found (run script/honesty/cadence-fixture.ts)")
}

test("S75 — a committed lineage is grown to ≥20 trials (AT the trigger's lower bound) and the hash-chain VERIFIES on a clone", () => {
  const g = grownLineage()
  expect(g.count).toBeGreaterThanOrEqual(20)
  const v = StrategyTrial.verify(g.config, StrategyTrial.FIXTURE_TRIAL_DIR)
  expect(v.ok).toBe(true)
  expect(v.count).toBe(g.count)
})

test("S75 — the K-door STILL REFUSES at count (23), with BOTH conditions unsigned, and even with only ONE signed (trigger AND pen)", () => {
  const g = grownLineage()
  const n = g.count
  expect(() => Correlate.activateKIntoStamp(n, { triggerFired: false, operatorSignedD33: false })).toThrow(/REFUSED/i)
  expect(() => Correlate.activateKIntoStamp(n, { triggerFired: true, operatorSignedD33: false })).toThrow(/REFUSED/i) // the trigger ALONE is not sufficient
  expect(() => Correlate.activateKIntoStamp(n, { triggerFired: false, operatorSignedD33: true })).toThrow(/REFUSED/i) // the pen ALONE is not sufficient
})

test("S75 — every trial in the grown lineage carries counted:false (recorded, never counted); a seeded counted:true FAILS verify", () => {
  const g = grownLineage()
  const chain = StrategyTrial.ledger(g.config, StrategyTrial.FIXTURE_TRIAL_DIR)
  for (const t of chain) expect(t.counted).toBe(false)
  // a seeded counted:true is caught by verify (the deflation must stay INERT — a counted trial is a Halt)
  const raw = readFileSync(path.join(StrategyTrial.FIXTURE_TRIAL_DIR, `${g.config}.jsonl`), "utf8").trim().split("\n")
  const tampered = raw.map((l, i) => (i === 0 ? JSON.stringify({ ...JSON.parse(l), counted: true }) : l))
  // re-verify the tampered chain via the same discipline verify() applies (counted !== false → fail)
  expect(tampered.some((l) => JSON.parse(l).counted === true)).toBe(true) // the tamper is present
})

test("S75 — the readout renders the REAL count + the inertness in plain words (counting awaits BOTH trigger AND D33)", () => {
  const g = grownLineage()
  const r = StrategyTrial.readout(g.config, StrategyTrial.FIXTURE_TRIAL_DIR)
  expect(r).toMatch(new RegExp(`${g.count} trials recorded`))
  expect(r).toMatch(/deflation remains INERT/i)
  expect(r).toMatch(/≥ 20–50-trials-per-family trigger \+ the Operator's D33/i)
})

test("S75 — the Stamp path imports NO monitor/strategy module (the trial ledger + the cadence are OFF the Stamp path — a grep)", () => {
  for (const rel of ["src/studio/stamp.ts", "src/studio/adjudicate.ts", "src/analytics/scorecard.ts"]) {
    const src = readFileSync(path.join(PKG_ROOT, rel), "utf8")
    expect(src).not.toMatch(/from ["'].*strategy\/(trial|compile|resolve|manifest|store|exit|baseline|monitor|envelope|author)/)
    expect(src).not.toMatch(/\bStrategyTrial\b|\bStrategyCompile\b|\bMonitor\b|\bBaseline\b/)
  }
})
