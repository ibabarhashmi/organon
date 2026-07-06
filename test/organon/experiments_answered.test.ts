/**
 * TEST — the parked experiments answered (Reachability Phase 2; Rule U-EXPERIMENT, A′#3/#4/#10). Proves: each experiment
 * recovers its planted truths as its own positive control (the ensemble noise pool FAILS; the coherence laundered search
 * earns a WEAKER bar); the criteria are hash-checked unchanged against the ratification chain; the parks are disposed as
 * SUPERSEDE values; and the CPCV promotion tracker accrues.
 */
import { test, expect } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Experiments } from "../../src/studio/experiments"
import { Ratify } from "../../src/studio/ratify"
import { CpcvTracker } from "../../src/studio/cpcv_tracker"

const D = path.join(PKG_ROOT, "data", "studio")

test("ENSEMBLE — the noise pool FAILS (positive control); the derivation is one of the pre-registered outcomes", async () => {
  const e = await Experiments.ensemble()
  expect(e.noisePoolPasses).toBe(false) // the positive control: if the noise pool ever passes, pooling is laundering
  expect(["YES — legitimate with the correlation adjustment (future-sprint ADOPT)", "NO — deflation-laundering (reject)", "NO — pooling does not legitimately reach power (close)"]).toContain(e.outcome)
})

test("COHERENCE — a laundered cross-author search earns a WEAKER bar than the unified (the incoherence, its positive control)", async () => {
  const c = await Experiments.coherence()
  expect(c.unifiedNTrials).toBeGreaterThan(c.launderedPerAuthorNTrials) // the unified search is charged more than the laundered one
  expect(c.launderedEarnsWeaker).toBe(true) // per-author scoping lets a sybil-split search earn a weaker deflation → incoherent
  expect(c.outcome).toMatch(/incoherent|stays parked/)
})

test("the experiment criteria are hash-checked UNCHANGED against the ratification chain (U-EXPERIMENT)", () => {
  const v12 = path.join(D, "research-ratification-v12.json")
  if (!existsSync(v12)) { console.log("  (experiments) v12 table absent — run script/phase0-reach.ts + phase2-reach.ts"); return }
  const { entries } = Ratify.load(v12)
  const ens = entries.find((e) => e.item === "portfolio-of-strategies-ensemble" && e.disposition === "PARK-WITH-EXPERIMENT")!
  const coh = entries.find((e) => e.item === "shared-multiuser-ledger-tournament" && e.disposition === "PARK-WITH-EXPERIMENT")!
  expect(ens.hash).toBe("1bb0dfd18e52449990366fb93db10aa85bc354fc457215534f1c5608e350f6fb")
  expect(coh.hash).toBe("6d49e6b622d03557f643e0a1df121103cd7c762e5001ffc4968be55001cbd2f9")
})

test("each park is DISPOSED by a SUPERSEDE value referencing its original hash (NO closes / YES → future ADOPT)", () => {
  const v12 = path.join(D, "research-ratification-v12.json")
  if (!existsSync(v12)) return
  const { entries } = Ratify.load(v12)
  expect(Ratify.supersessionsCoherent(entries).ok).toBe(true)
  const ensSup = entries.find((e) => e.disposition === "SUPERSEDE" && e.supersedes?.item === "portfolio-of-strategies-ensemble")
  const cohSup = entries.find((e) => e.disposition === "SUPERSEDE" && e.supersedes?.item === "shared-multiuser-ledger-tournament")
  expect(ensSup).toBeTruthy()
  expect(cohSup).toBeTruthy()
  expect(cohSup!.supersedes!.regimeChange).toMatch(/NO|stays parked/i) // coherence closes NO
})

test("the CPCV promotion tracker accrues agreement toward the ≥30 criterion (advisory-only)", () => {
  const f = path.join(D, "cpcv-promotion-tracker-v12.jsonl")
  if (!existsSync(f)) return
  const s = CpcvTracker.status(f)
  expect(s.target).toBe(30)
  expect(s.accrued).toBeGreaterThanOrEqual(1)
  expect(s.promotable).toBe(false) // far below 30 — advisory-only, the frozen gate stays the only gate
})
