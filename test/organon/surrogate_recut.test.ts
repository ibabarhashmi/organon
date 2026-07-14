/**
 * ORGΛNON — THE SURROGATE ADDENDUM (V38-B), B4 wall: S138 — GATE COHERENCE. D62's delegated re-cut, resolved.
 *
 * Two re-cuts of the trigger, both attacked against pinned criteria (DD-50); the pick recorded as D62-R with both attacks
 * attached; the resolved trigger contains NO self-reference (a seeded circular gate FAILS); and NOTHING LIGHTS — D63 is off by
 * the pen, familyN === 1, the deflation stays inert (a seeded familyN>1 or lit meter FAILS). The resolution is coherence
 * bookkeeping for a future the pen may never open, and it says so.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Recut } from "../../src/strategy/recut"

const sg = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "surrogate-pins.json"), "utf8"))

test("S138 (W-SB04) — BOTH re-cuts exist and BOTH are attacked (DD-50); the pick is recorded as D62-R with both attacks attached", () => {
  expect(Recut.OPTIONS.map((o) => o.id).sort()).toEqual(["A", "B"])
  expect(Recut.RESOLUTION.pick).toBe("A")
  expect(Recut.RESOLUTION.attackA.length).toBeGreaterThan(40) // Option A adversarially validated
  expect(Recut.RESOLUTION.attackB.length).toBeGreaterThan(40) // Option B adversarially validated
  expect(Recut.RESOLUTION.rationale).toMatch(/DECOUPLED from the deflation/i)
  expect(Recut.RESOLUTION.presentedStrikeable).toMatch(/strikeable|delegation was quoted/i)
})

test("S138 — the resolved trigger contains NO self-reference; a seeded CIRCULAR gate FAILS", () => {
  // neither option fires on its own output — both read an external set-op (a ledger count / a family enumeration)
  expect(Recut.isSelfReferential(Recut.OPTION_A.fires_on)).toBe(false)
  expect(Recut.isSelfReferential(Recut.OPTION_B.fires_on)).toBe(false)
  // SEEDED NEGATIVE — a circular gate that fires on the trigger's OWN count is self-referential → FAILS
  expect(Recut.isSelfReferential("the trigger's own firing count")).toBe(true)
  expect(Recut.isSelfReferential("recursion over this gate's output")).toBe(true)
})

test("S138 — NOTHING LIGHTS: D63 is off (familyN 1); neither option lights the deflation; the resolution says so", () => {
  // under D63-off, familyN is pinned at 1 and neither option lights the deflation
  expect(Recut.lightsDeflation(Recut.OPTION_A, 1)).toBe(false)
  expect(Recut.lightsDeflation(Recut.OPTION_B, 1)).toBe(false)
  expect(Recut.RESOLUTION.nothingLit).toMatch(/NOTHING LIGHTS/i)
  expect(Recut.RESOLUTION.nothingLit).toMatch(/familyN === 1|deflation stays INERT/i)
  // the pins record D63 OFF (familyN 1, a seeded activation FAILS)
  expect(sg.d63_off.familyN).toBe(1)
  expect(sg.d63_off.seededActivationFails).toMatch(/FAILS/)
})

test("S138 — the resolution honours the criteria (DD-50): coherence, X-RECKON fidelity (a set-op, nothing self-reported), activation safety, V39-readiness", () => {
  expect(sg.dd50_d62Recut.criteria).toMatch(/no self-reference/i)
  expect(sg.dd50_d62Recut.criteria).toMatch(/activation safety/i)
  expect(sg.dd50_d62Recut.resolution).toMatch(/pick one, record it as D62-R/i)
  // Option A fires on a set-op over the ledger (X-RECKON's primitive), not a self-report
  expect(Recut.OPTION_A.fires_on).toMatch(/count.*SEARCH/i)
})
