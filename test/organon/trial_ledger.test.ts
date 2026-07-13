/**
 * ORGΛNON — THE MANIFEST SPRINT, Phase 4 wall (RECORDED-NEVER-COUNTED; S72/S73). The trial ledger fills for the FIRST
 * time (Moat RE5, three sprints pinned-empty) — hash-chained per manifest lineage, re-verifying on a pristine clone (the
 * committed fixture) — AND the filling changes NOTHING statistical: every trial `counted: false`, the readout states the
 * inertness, the K-feed stays REFUSED. The exit-immutability wall (S73) + the journal's local-first egress control. SHOWN.
 */
import { test, expect } from "bun:test"
import { readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Correlate } from "../../src/analytics/correlate"
import { StrategyTrial } from "../../src/strategy/trial"
import { StrategyStore } from "../../src/strategy/store"
import { ExitCriterion } from "../../src/strategy/exit"
import { app } from "../../script/serve-reality"

// the V31 committed fixture is the 3-trial lineage; the Cadence sprint added a DISTINCT ≥20-trial lineage (inert-at-count,
// S75), so select the V31 fixture by its trial count rather than list position (robust to the added sibling lineage).
const FIXTURE_CONFIG = StrategyStore.list(StrategyStore.FIXTURE_DIR).find((id) => StrategyTrial.ledger(id, StrategyTrial.FIXTURE_TRIAL_DIR).length === 3)!
const FDIR = StrategyTrial.FIXTURE_TRIAL_DIR

test("TRIAL — S72: the committed fixture trial lineage RE-VERIFIES on a pristine clone (contentSha recomputes; chain intact; counted:false)", () => {
  const v = StrategyTrial.verify(FIXTURE_CONFIG, FDIR)
  console.log("  verify:", JSON.stringify(v))
  expect(v.ok).toBe(true)
  expect(v.count).toBe(3)
  for (const t of StrategyTrial.ledger(FIXTURE_CONFIG, FDIR)) expect(t.counted).toBe(false) // RECORDED, NEVER COUNTED
})

test("TRIAL — S72: the per-trial record matches the Moat RE5 pinned schema VERBATIM (config · returnSeries · metric · contentSha)", () => {
  const moat = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "moat-pins.json"), "utf8"))
  const pinnedFields = moat.trialsLedgerSchema.perTrialRecord.map((s: string) => s.split(" ")[0])
  expect(pinnedFields).toEqual(["config", "returnSeries", "metric", "contentSha"])
  expect([...StrategyTrial.MOAT_SCHEMA_FIELDS]).toEqual(pinnedFields) // the code conforms to the pin
  for (const t of StrategyTrial.ledger(FIXTURE_CONFIG, FDIR)) for (const f of StrategyTrial.MOAT_SCHEMA_FIELDS) expect(t).toHaveProperty(f)
})

test("TRIAL — append hash-chains per manifest lineage; a GAP or a tamper is DETECTED (S72)", () => {
  const dir = path.join(StrategyStore.ROOT, "_test_trials")
  const cfg = "testlineage00"
  const series = [{ kind: "effective-bets", text: "≈ 1 independent bet" }]
  const metric = { effectiveK: 1, worstAxisTier: null, exitFired: false, reachable: 2 }
  try {
    StrategyTrial.append(cfg, series, metric, 1000, dir)
    StrategyTrial.append(cfg, series, metric, 2000, dir)
    StrategyTrial.append(cfg, series, metric, 3000, dir)
    expect(StrategyTrial.verify(cfg, dir)).toEqual({ ok: true, count: 3 })
    // TAMPER: break the chain — rewrite the 2nd entry's prevTrialHash to garbage
    const f = path.join(dir, `${cfg}.jsonl`)
    const lines = readFileSync(f, "utf8").trim().split("\n")
    const bad = JSON.parse(lines[1]); bad.prevTrialHash = "0".repeat(64); lines[1] = JSON.stringify(bad)
    writeFileSync(f, lines.join("\n") + "\n")
    const v = StrategyTrial.verify(cfg, dir)
    console.log("  tamper:", JSON.stringify(v))
    expect(v.ok).toBe(false)
    expect(v.reason).toMatch(/breaks the chain/i)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("TRIAL — RECORDING ≠ COUNTING: the readout states the inertness; a seeded counted:true FAILS verify; the K-feed stays REFUSED (S72)", () => {
  // the readout — plain words, the deflation inert, counting awaits BOTH trigger AND pen
  const r = StrategyTrial.readout(FIXTURE_CONFIG, FDIR)
  console.log("  readout:", r)
  expect(r).toMatch(/deflation remains INERT/i)
  expect(r).toMatch(/≥ 20–50-trials-per-family trigger \+ the Operator's D33/i)
  // a seeded counted:true trial → verify fails (a counted trial is a Halt)
  const dir = path.join(StrategyStore.ROOT, "_test_trials2")
  const cfg = "seededcounted"
  try {
    StrategyTrial.append(cfg, [{ kind: "x", text: "y" }], { effectiveK: 1, worstAxisTier: null, exitFired: null, reachable: 1 }, 1000, dir)
    const f = path.join(dir, `${cfg}.jsonl`)
    const bad = JSON.parse(readFileSync(f, "utf8").trim()); bad.counted = true; writeFileSync(f, JSON.stringify(bad) + "\n")
    const v = StrategyTrial.verify(cfg, dir)
    expect(v.ok).toBe(false)
    expect(v.reason).toMatch(/counted !== false.*INERT|a counted trial is a Halt/i)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
  // the ONE sanctioned K-door is still LOCKED (the seeded K-feed refused) — recording near the line is why the wall exists
  expect(() => Correlate.activateKIntoStamp(2, { triggerFired: false, operatorSignedD33: false })).toThrow(/K-ACTIVATION REFUSED|familyN stays 1/i)
})

test("TRIAL — S73: a registered exit's SILENT edit is detected; the disclosed re-pin records old/new + reason", () => {
  const reg = ExitCriterion.register({ kind: "peg-floor", threshold: 0.995, subjectScope: "portfolio" })
  expect(reg.ok).toBe(true)
  if (!reg.ok) return
  expect(ExitCriterion.isSilentEdit(reg.hash, { kind: "peg-floor", threshold: 0.99, subjectScope: "portfolio" })).toBe(true) // a quiet loosening — caught
  const rp = ExitCriterion.repin({ kind: "peg-floor", threshold: 0.995, subjectScope: "portfolio" }, { kind: "peg-floor", threshold: 0.99, subjectScope: "portfolio" }, "the venue's historical peg floor is 0.99, not 0.995", "2026-07-12T00:00:00Z")
  expect(rp.ok).toBe(true)
  if (rp.ok) expect(rp.repin.oldHash).not.toBe(rp.repin.newHash)
})

test("TRIAL — the journal is LOCAL-FIRST: the served composed view NEVER carries a journal field (priorIntent); the readout DOES render", async () => {
  const res = await app.request(`/check/manifest:${FIXTURE_CONFIG}`)
  expect(res.status).toBe(200)
  const html = await res.text()
  // the fixture manifest's journal.priorIntent ("chase a higher-APY farm") is LOCAL-FIRST — it must NEVER reach a served payload
  expect(html).not.toMatch(/chase a higher-APY farm/i)
  // but the ledger readout renders (recorded, never counted)
  expect(html).toMatch(/3 trials recorded/i)
  expect(html).toMatch(/deflation remains INERT/i)
})
