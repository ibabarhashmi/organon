/**
 * ORGΛNON — THE MANIFEST SPRINT, Phase 4 wall (the inert wall RE-PROVEN with trials present; S72). This sprint walks NEAR
 * the line — the trials schema fills for the first time — so the inert wall is re-proven: the Stamp path imports NO
 * strategy module (the trial ledger + the compile are OFF the Stamp path); the K-door stays LOCKED; the manifest-pins
 * record the guarantee (familyN===1; BOTH trigger AND pen). Nearness is precisely why the wall exists.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Correlate } from "../../src/analytics/correlate"

test("INERT2 — the Stamp path does NOT import the strategy layer (the trial ledger + compile are OFF the Stamp path)", () => {
  for (const rel of ["src/studio/stamp.ts", "src/studio/adjudicate.ts", "src/analytics/scorecard.ts"]) {
    const src = readFileSync(path.join(PKG_ROOT, rel), "utf8")
    expect(src).not.toMatch(/from ["'].*strategy\/(trial|compile|resolve|manifest|store|exit)/) // no import of the strategy layer
    expect(src).not.toMatch(/\bStrategyTrial\b|\bStrategyCompile\b/) // no use of it
  }
})

test("INERT2 — the trial ledger records familyN nowhere near the Stamp: a trial carries `counted:false`, never a familyN it could feed", () => {
  const src = readFileSync(path.join(PKG_ROOT, "src", "strategy", "trial.ts"), "utf8")
  // the trial writes NO familyN + NO effectiveK into a Stamp-consumable field; it records `counted: false` and refuses to count
  expect(src).not.toMatch(/familyN\s*[:=]\s*[2-9]|familyN\s*[:=]\s*effectiveK/) // never a familyN ≥ 2, never fed from K
  expect(src).toMatch(/counted:\s*false/) // RECORDED, NEVER COUNTED (structural)
})

test("INERT2 — the K-ACTIVATION gate stays LOCKED after trials exist (a K-feed is REFUSED without BOTH trigger AND D33)", () => {
  expect(() => Correlate.activateKIntoStamp(3, { triggerFired: false, operatorSignedD33: false })).toThrow(/REFUSED/i)
  expect(() => Correlate.activateKIntoStamp(3, { triggerFired: true, operatorSignedD33: false })).toThrow(/REFUSED/i)
  expect(() => Correlate.activateKIntoStamp(3, { triggerFired: false, operatorSignedD33: true })).toThrow(/REFUSED/i)
})

test("INERT2 — the manifest-pins record the recording-≠-counting guarantee (familyN===1; BOTH the trigger AND the pen)", () => {
  const mf = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "manifest-pins.json"), "utf8"))
  const v = mf.xManifest.c_recordedNeverCounted.recordingNotCountingVerbatim
  expect(v).toMatch(/`familyN === 1` holds in EVERY Stamp output STILL/i)
  expect(v).toMatch(/BOTH the pinned ≥ 20–50-trials-per-family trigger AND the Operator's D33/i)
})
