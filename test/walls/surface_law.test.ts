/**
 * WALL — the U-SURFACE law: if the user can't reach it, it doesn't exist (Reachability Phase 0; Rule U-SURFACE, A′#1/#2).
 * Proves: a console-path traversal is admissible ONLY with a fresh serve + a real happy step + a genuine failure state
 * (theater is caught); the gatekeeper REFUSES a `surface: true` criterion satisfied by module-only evidence and ACCEPTS
 * it with real traversal evidence; the surfacing census catches its seeded unsurfaced capability (its own positive
 * control); and — retroactively — the law would have caught V11's W6-01 (the breadth panel unsurfaced).
 */
import { test, expect } from "bun:test"
import path from "node:path"
import { existsSync } from "node:fs"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Surface } from "../../src/studio/surface"
import { Checkpoint } from "../../src/studio/checkpoint"

const D = path.join(PKG_ROOT, "data", "studio")
const okStep = (met = true): Surface.Step => ({ route: "GET /", interaction: "load", expected: "renders", met, evidence: "ok" })
const failStep = (met = true): Surface.Step => ({ route: "POST /console/goal", interaction: "empty goal", expected: "MALFORMED honest state", met, evidence: "MALFORMED-GOAL" })

test("an admissible traversal needs a fresh serve + a real happy step + a genuine failure state", () => {
  const good = Surface.makeTraversal({ capability: "x", freshServe: true, steps: [okStep()], failureState: failStep(), at: "t" })
  expect(Surface.verifyTraversal(good).ok).toBe(true)
  expect(Surface.isTheater(good)).toBe(false)
})

test("THEATER is caught — a happy-path-only traversal (no failure state) or a non-fresh serve is rejected", () => {
  const noFailure = Surface.makeTraversal({ capability: "x", freshServe: true, steps: [okStep()], failureState: { route: "", interaction: "", expected: "", met: false, evidence: "" }, at: "t" })
  expect(Surface.isTheater(noFailure)).toBe(true)
  expect(Surface.verifyTraversal(noFailure).ok).toBe(false)
  const notFresh = Surface.makeTraversal({ capability: "x", freshServe: false, steps: [okStep()], failureState: failStep(), at: "t" })
  expect(Surface.isTheater(notFresh)).toBe(true)
})

test("the GATEKEEPER refuses a `surface: true` criterion satisfied by MODULE-ONLY evidence", () => {
  const gate = new Checkpoint.Gate()
  gate.declare("p", [{ id: "USER-FACING", text: "a user sees it", gate: true, surface: true }])
  // module-only evidence: a plain JSON artifact that is NOT a console-path traversal (e.g. the criteria baseline)
  const moduleEvidence = Checkpoint.pin(path.join(D, "phase0-baseline-v12.json"))
  expect(() => gate.record({ phase: "p", decision: "ADVANCE", stamp: "s", resolutions: [{ id: "USER-FACING", evidence: moduleEvidence }] })).toThrow(/U-SURFACE|console-path traversal/i)
})

test("the GATEKEEPER accepts a `surface: true` criterion with a real console-path traversal artifact", () => {
  const tPath = path.join(D, "traversal-goal-console.json")
  if (!existsSync(tPath)) { console.log("  (surface_law) traversal artifact absent — run script/console-traversal.ts"); return }
  const gate = new Checkpoint.Gate()
  gate.declare("p", [{ id: "USER-FACING", text: "a user sees it", gate: true, surface: true }])
  const traversal = Checkpoint.pin(tPath)
  const rec = gate.record({ phase: "p", decision: "ADVANCE", stamp: "s", resolutions: [{ id: "USER-FACING", evidence: traversal }] })
  expect(rec.decision).toBe("ADVANCE")
  expect(rec.criteria[0].detail).toMatch(/U-SURFACE traversal verified/)
})

test("the SURFACING CENSUS catches its seeded unsurfaced capability (its own positive control, A′#2)", () => {
  const seeded: Surface.CapabilityMapping = { capability: "seeded-unsurfaced", traversal: null }
  const r = Surface.census([{ capability: "goal-console", traversal: "data/studio/traversal-goal-console.json" }], seeded, PKG_ROOT)
  expect(r.seededCaught).toBe(true) // a real capability with no traversal MUST be caught
  // and a dangling real capability is a finding (not waved)
  const withDangling = Surface.census([{ capability: "real-but-unwired", traversal: null }], seeded, PKG_ROOT)
  expect(withDangling.dangling.some((d) => d.capability === "real-but-unwired")).toBe(true)
})

test("RETROACTIVE: the law would have caught V11's W6-01 (the breadth panel unsurfaced) at BREADTH-TRUE", () => {
  const preW601 = Surface.census([{ capability: "breadth-panel-hedged-eta", traversal: null }], { capability: "seed", traversal: null }, PKG_ROOT)
  expect(preW601.dangling.some((d) => d.capability === "breadth-panel-hedged-eta")).toBe(true) // caught as dangling — the law's power proven on the failure that motivated it
})
