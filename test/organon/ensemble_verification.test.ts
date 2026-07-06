/**
 * ORGΛNON — Ensemble Phase 5 verification walls. The terminal's numbers derive themselves (U-DERIVED); both noise walls
 * green; the verdict differential byte-identical; the newest door re-runs from nothing; the ratification chain coherent.
 */
import { test, expect } from "bun:test"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Summary } from "../../src/studio/summary"
import { Ratify } from "../../src/studio/ratify"

const D = path.join(PKG_ROOT, "data", "studio")
const art = () => JSON.parse(readFileSync(path.join(D, "phase5-verification-v13.json"), "utf8"))

test("the V13 summary differential was green on the terminal's OWN frozen numbers (floor 74 · 34/3 · catalog 36 — self-consistent; v14's live catalog grew to 46, checked by the v14 wall)", () => {
  const a = art()
  // read the committed V13 artifact's frozen prose + derived and re-check their internal consistency (never re-derive
  // live — v14 grew the catalog to 46; V13's terminal numbers are historical and frozen in phase5-verification-v13.json)
  expect(Summary.differential(a.summaryDifferential.prose, a.summaryDifferential.derived).ok).toBe(true)
})

test("Phase 5 verification: both noise walls green, verdict differential byte-identical, the newest door re-ran from nothing", () => {
  const a = art()
  expect(a.summaryDifferential.ok).toBe(true)
  expect(a.noiseWalls.voc.clean).toBe(true)
  expect(a.noiseWalls.pooled.clean).toBe(true)
  expect(a.verdictDifferential.byteIdentical).toBe(true)
  expect(a.newestDoorReRun.ok).toBe(true) // the pool composer (screen 10) re-run from nothing
  expect(a.rwaPinUnchanged).toBe(true)
})

test("the ratification chain (v13) verifies + is coherent; the ensemble ADOPT + the two disposals stand", () => {
  const { entries, chainOk } = Ratify.load(path.join(D, "research-ratification-v13.json"))
  expect(chainOk).toBe(true)
  expect(Ratify.supersessionsCoherent(entries).ok).toBe(true)
  expect(Ratify.artifactRatified(entries, "src/analytics/pool.ts")).toBe(true)
  expect(Ratify.effectiveRecord(entries, "hrp-portfolio-construction")?.disposition).toBe("SUPERSEDE")
  expect(Ratify.effectiveRecord(entries, "shared-multiuser-ledger-tournament")?.disposition).toBe("SUPERSEDE")
})

test("the pristine proof (if run) is green with the amended prerequisites", () => {
  const f = path.join(D, "pristine-clone-v13.json")
  if (!existsSync(f)) { console.log("  (pristine) run script/pristine-clone.ts. Disclosed."); return }
  const p = JSON.parse(readFileSync(f, "utf8"))
  expect(p.pristineGreen).toBe(true)
  expect(p.battery.fail).toBe(0)
  expect(p.positiveControl.withoutVenvSidecarFails).toBe(true)
  expect(p.prerequisites.conditional["python3.11"]).toBeTruthy() // the amended conditional prereq named
})
