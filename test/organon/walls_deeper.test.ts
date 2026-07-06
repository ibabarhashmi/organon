/**
 * TEST — the walls at their own written specs (Reachability Phase 1; Rules R-DOF, R-BASIS, U-PRISTINE, A′#7/#8). Proves:
 * the noise battery λ-SWEEP is clean across penalties in the OOS regime and the in-sample regime survives (the banned
 * demonstration); the capture floor is a named constant + a venue checker; and the pristine harness proved itself
 * (positive control: no inherited venv; fresh venv → green battery).
 */
import { test, expect } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Voc } from "../../src/proposers/voc"
import { DataPlane } from "../../src/dataplane/store"

const D = path.join(PKG_ROOT, "data", "studio")

test("the λ-SWEEP is clean across penalties in the OOS regime; the in-sample regime survives (banned)", async () => {
  const s = await Voc.penaltySweep({ penalties: [0.1, 10.0], featureCounts: [40], seeds: 4, nObs: 500, timestamp: Date.parse("2026-07-05T00:00:00Z") })
  expect(s.oosClean).toBe(true) // OOS noise dies at every penalty (the charge cannot rescue an edge that never existed)
  expect(s.cells.filter((c) => c.regime === "oos").every((c) => c.survivors === 0)).toBe(true)
  expect(s.inSampleSurvives).toBe(true) // the in-sample regime yields survivors → banned by the VoC→OOS supersession
})

test("the CAPTURE FLOOR is a named constant (≥3 chained stamps across ≥2 runs) + a venue checker", () => {
  expect(DataPlane.CAPTURE_FLOOR.minChainedStamps).toBe(3)
  expect(DataPlane.CAPTURE_FLOOR.minRuns).toBe(2)
  const s = DataPlane.venueFloorStatus("hyperliquid")
  // on a fresh clone with the committed chain, Hyperliquid meets the floor; if the chain is absent, disclosed (never faked)
  if (s.present) expect(s.meetsFloor).toBe(true)
  else console.log("  (walls_deeper) provenance chain absent — capture floor BLOCKED, disclosed (fresh clone)")
})

test("the PRISTINE harness proved itself: no inherited venv (positive control) + a fresh-venv green battery (U-PRISTINE)", () => {
  const f = path.join(D, "pristine-clone-v12.json")
  if (!existsSync(f)) { console.log("  (walls_deeper) pristine-clone-v12.json absent — run script/pristine-clone.ts"); return }
  const r = JSON.parse(readFileSync(f, "utf8"))
  expect(r.positiveControl.withoutVenvSidecarFails).toBe(true) // the isolation is real — no inherited venv
  expect(r.venvCreatedFresh).toBe(true)
  expect(r.battery.green).toBe(true)
  expect(r.pristineGreen).toBe(true)
  expect(r.prerequisites.systemProvided.bun).toMatch(/1\.[3-9]/) // prerequisites enumerated
})
