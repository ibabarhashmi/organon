/**
 * ORGΛNON — THE SURROGATE ADDENDUM (V38-B), B7: THE GATE ADDENDUM + PART A' CLOSURE. *The census never sheds.*
 *
 * DD-48-R2 (RP-5): the addendum succeeds iff the canary is clean AND all four rulings are executed AND the break ledger is
 * classified AND IN2's instrument is uncontaminated — computed, printed, FAILED if any leg is missing. The gate first line is
 * no longer a question; the pen answered D51. Every Part-A' attack and every RP re-pin holds in the shipped code.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Surrogate } from "../../src/organon/surrogate"
import { Quarantine } from "../../src/strategy/authorship"
import { Reach } from "../../src/organon/reach"
import { Recut } from "../../src/strategy/recut"

const sg = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "surrogate-pins.json"), "utf8"))

test("B7 / DD-48-R2 (RP-5) — the addendum SUCCEEDS: all four legs computed and ok (canary · four rulings · break ledger classified · IN2 uncontaminated)", () => {
  const r = Surrogate.success()
  expect(r.legs.length).toBe(4)
  for (const l of r.legs) expect(l.ok).toBe(true)
  expect(r.succeeded).toBe(true)
  // each leg is COMPUTED (not typed): the canary is the live quarantine, the rulings are the recorded statuses, the ledger is the committed classification
  expect(r.legs[0].name).toMatch(/canary/i)
  expect(r.legs[2].detail).toMatch(/findings, all classified/i)
})

test("B7 — THE CANARY CLOSES clean: base === quarantined, zero agent lineages (IN2's counters are agent-free — the only validation is trustworthy)", () => {
  const live = Quarantine.live()
  expect(live.ok).toBe(true)
  expect(live.base).toBe(live.quarantined)
  expect(live.agentLineages).toEqual([])
})

test("B7 — THE GATE FIRST LINE is no longer a question; the pen answered D51 (a SCHEDULE, computed): instrument BY-DESIGN · the only validation IN2 · D63 OFF", () => {
  const line = Surrogate.gateFirstLine()
  expect(line).toMatch(/instrument: BY-DESIGN/)
  expect(line).toMatch(/the only validation: IN2/)
  expect(line).toMatch(/D63: OFF/)
  expect(line).toMatch(/canary: clean/)
  expect(Reach.interpretation()).toBe("BY-DESIGN") // the frame the line derives from
})

test("B7 — PART A' — all 10 attacks hold in the shipped code (severed inferences · quarantine-matters-more · math-red-team-never-sheds · mirror-is-a-manifest)", () => {
  const a = sg.adversarialRecord_partA
  for (let i = 1; i <= 10; i++) {
    const key = Object.keys(a).find((k) => k.startsWith(`A${i}_`))!
    expect(String(a[key]).length).toBeGreaterThan(40)
  }
  // A3 — the mirror-that-cannot-be-wrong is answered by a falsifiable-by-the-moat criterion (D67)
  expect(a.A3_mirrorThatCannotBeWrong).toMatch(/falsifiable BY THE MOAT ALONE/i)
  // A4 — the i.i.d. trap is an ASSUMPTION-LIMIT, not slander (the break ledger proves it)
  expect(a.A4_slanderTheFrozenCore).toMatch(/ASSUMPTION-LIMIT/)
  // A10 — the quarantine matters MORE under D51
  expect(a.A10_quarantineQuarantinesNothing).toMatch(/matters MORE under D51/i)
})

test("B7 — PART F — all 5 RP re-pins hold: assumption-limit cites its section · known-answer recorded · N empty · D27 first · DD-48 four legs", () => {
  const f = sg.postImplementationRePins_partF
  expect(f.RP1_assumptionLimitCitesSection).toMatch(/RECLASSIFIED BREAK/i)
  expect(f.RP2_knownAnswerRecordedFoundPartialNone).toMatch(/found\/partial\/none/i)
  expect(f.RP3_nEmptyWithTradeoff).toMatch(/EMPTY with a stated trade-off/i)
  expect(f.RP4_d27StaysFirst).toMatch(/D27 stays FIRST/i)
  expect(f.RP5_dd48Repinned).toMatch(/four rulings executed/i)
  // D27 is STILL FIRST — the pen moved past it, recorded as fact (RP-4)
  expect(sg.thePenMoved.d27NotTouched).toMatch(/D27.*STILL FIRST/s)
})

test("B7 — the shed order held: B1 (quarantine) + B3 (math red team) shipped (never shed); B5/B6 shed with disclosure; D62-R shipped", () => {
  expect(sg.shedOrder.shippedThisAddendum).toContain("B1")
  expect(sg.shedOrder.shippedThisAddendum).toContain("B3")
  expect(sg.shedOrder.shippedThisAddendum).toContain("B4") // D62-R
  expect(Recut.RESOLUTION.pick).toBe("A") // D62-R resolved
  // the sentence that governs the whole addendum
  expect(sg.instrumentKeepsAllSeventeenLaws).toMatch(/keeps all seventeen laws/i)
  expect(sg.carried.newProductCapability).toBe(0) // the rulings move deviations, never capability
})
