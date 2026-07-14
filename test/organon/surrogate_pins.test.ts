/**
 * ORGΛNON — THE SURROGATE ADDENDUM (V38-B, R2), B0 wall (PINS-LOCKED-B). surrogate-pins.json is self-consistent, carried
 * from the Substance head (153628a9), and pins — BEFORE the addendum code — THE FOUR RULINGS VERBATIM, each inference stated
 * SEPARATELY and strikeable; the V36/V37 pre-priced option-(2) cascade; D67 (amend draft, N EMPTY + trade-off); D68 (the
 * retirement ledger + the Socket reconciliation FLAGGED as interpretation); DD-49's attack classes + the three-way
 * classification pinned BEFORE any attack; DD-50's criteria pinned BEFORE evaluating; D63 OFF; walls S128-S139; the shed
 * order (B1 + B3 never shed); the sentence "an instrument for one person keeps all seventeen laws"; RP-1..RP-5.
 *
 * POSITIVE CONTROL SHOWN: a mutated ruling word moves the sha. The lock BITES.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const sg = JSON.parse(readFileSync(path.join(H, "surrogate-pins.json"), "utf8"))
const SUBSTANCE = JSON.parse(readFileSync(path.join(H, "substance-pins.json"), "utf8"))

test("SURROGATE B0 — self-consistent + carried from the Substance head (a moved ruling word moves the sha) — POSITIVE CONTROL", () => {
  const { pinsSha, ...rest } = sg
  expect(sha256(JSON.stringify(rest))).toBe(sg.pinsSha)
  expect(sg.carriedFromPinsSha).toBe(SUBSTANCE.pinsSha)
  expect(sg.carriedFromPinsSha).toBe("153628a91515de14a6245be013c891fd29878407055ce7e5952cf9435718b38f")
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.thePenMoved.rulings.D51.words = "tampered" // re-writing the Operator's words is the gravest tamper — it moves the sha
  expect(sha256(JSON.stringify(mutated))).not.toBe(sg.pinsSha)
})

test("SURROGATE B0 — THE FOUR RULINGS recorded VERBATIM, each inference stated SEPARATELY and strikeable (LN5)", () => {
  const p = sg.thePenMoved
  // the Operator's message is quoted WHOLE, verbatim (including the terse fragments)
  expect(p.operatorMessageVerbatim).toBe("D51 - my personal tool, D33 - Break it to understand yourself, red team the math adversly, D62 - try we yourself, and move on (after adverse validation), D63 - keep it off.")
  // each ruling: the WORDS (verbatim) and the INFERENCE (severable, strikeable) are SEPARATE fields
  for (const [id, expectWords, expectStatus] of [["D51", "my personal tool", "ANSWERED"], ["D33", "red team the math adversly", "RE-SCOPED → B3"], ["D62", "try we yourself", "DELEGATED → B4"], ["D63", "keep it off", "OFF"]] as const) {
    const r = p.rulings[id]
    expect(r.words).toContain(expectWords) // the words, verbatim
    expect(r.status).toBe(expectStatus)
    expect(r.inferenceStatedSeparately).toMatch(/severable, strikeable/i) // the inference is SEPARATE from the words
  }
})

test("SURROGATE B0 — D51 ANSWERED = INSTRUMENT (option 2, pre-priced); the cascade executes only pre-priced costs; the Socket reconciliation is FLAGGED as interpretation", () => {
  expect(sg.thePenMoved.rulings.D51.inferenceStatedSeparately).toMatch(/INSTRUMENT/)
  expect(sg.thePenMoved.rulings.D51.inferenceStatedSeparately).toMatch(/pre-priced/i)
  const c = sg.d51Cascade
  expect(c.killCriterionAmended_D67).toMatch(/AMENDED, NOT FIRED/i)
  expect(c.d42Dissolves).toMatch(/non-commercial case/i)
  expect(c.reachableHumans1FlipsToDesign).toMatch(/BY-DESIGN/)
  // the ONE interpretation not pre-priced is FLAGGED as such (attack #1/#2)
  expect(c.socketSurvives_INTERPRETATION).toMatch(/FLAGGED AS AN INTERPRETATION/i)
  expect(c.socketSurvives_INTERPRETATION).toMatch(/strikeable/i)
  expect(c.everyLawStays).toMatch(/keeps all seventeen laws/i)
})

test("SURROGATE B0 — D33's autopsy pinned BEFORE running (DD-49): five attack classes + the three-way classification + RP-1 burden-toward-harsher; rigor.py stays byte-frozen", () => {
  const d = sg.dd49_mathRedTeam
  for (const k of ["i_knownAnswer", "ii_property", "iii_degenerate", "iv_adversarial", "v_nullDistribution"]) expect(d.attackClasses[k]).toBeTruthy()
  expect(d.threeWayClassification).toMatch(/BREAK.*ASSUMPTION-LIMIT.*THEORY-GAP/s)
  expect(d.rp1_burdenTowardHarsher).toMatch(/RECLASSIFIED BREAK by default/i)
  expect(d.standingRule).toMatch(/BYTE-FROZEN|checkFrozenSet 0 drift/i)
  expect(d.standingRule).toMatch(/UNSIGNED/) // D33 stays unsigned
})

test("SURROGATE B0 — D67 amended criterion: N EMPTY + trade-off table (RP-3), falsifiable by the moat alone, old 8b4e094b preserved, presented NEVER pinned (LN5)", () => {
  const d = sg.d67_amendedKillCriterion
  expect(d.nSlot).toMatch(/EMPTY/)
  for (const n of ["N=5", "N=10", "N=20"]) expect(d.nTradeoffTable[n]).toBeTruthy() // the trade-off table, the pen picks
  expect(d.draftText).toMatch(/⟨N⟩|changedByCompile/) // built on V31's journal fields
  expect(d.falsifiableByMoatAlone).toMatch(/no survey, no self-report/i)
  expect(d.oldCriterionPreserved).toMatch(/8b4e094b/)
  expect(d.presentedNeverPinned).toMatch(/DRAFTS.*does NOT pin/i)
})

test("SURROGATE B0 — D62 delegated (DD-50 criteria pinned before evaluating) · D63 OFF (familyN 1) · D27 STILL FIRST (RP-4, skip is a fact not a ruling)", () => {
  expect(sg.dd50_d62Recut.optionA).toMatch(/HUMAN-authored/i)
  expect(sg.dd50_d62Recut.optionB).toMatch(/family cardinality/i)
  expect(sg.dd50_d62Recut.criteria).toMatch(/no self-reference|activation safety/i)
  expect(sg.d63_off.familyN).toBe(1)
  expect(sg.d63_off.deflation).toBe("INERT")
  expect(sg.thePenMoved.d27NotTouched).toMatch(/D27.*STILL FIRST/s)
  expect(sg.thePenMoved.d27NotTouched).toMatch(/only words move deviations/i)
})

test("SURROGATE B0 — walls S128-S139 built ones NAME their origin; shed order (B1+B3 never shed); DD-48-R2 four-leg success; all 10 Part-A' + all 5 RP", () => {
  for (const id of sg.walls.built) {
    expect(sg.walls[id]).toBeTruthy()
    expect(sg.walls[id].origin.length).toBeGreaterThan(30)
  }
  expect(sg.walls.built).toContain("S136") // the break ledger — the pen's direct order
  expect(sg.walls.built).toContain("S128") // the quarantine — the precondition
  expect(sg.shedOrder.order[0]).toMatch(/B1.*NEVER sheds/i)
  expect(sg.shedOrder.order[1]).toMatch(/B3.*NEVER sheds/i)
  expect(sg.dd48_r2_successCriterion.legs.length).toBe(4)
  for (let i = 1; i <= 10; i++) expect(Object.keys(sg.adversarialRecord_partA).some((k) => k.startsWith(`A${i}_`))).toBe(true)
  for (let i = 1; i <= 5; i++) expect(Object.keys(sg.postImplementationRePins_partF).some((k) => k.startsWith(`RP${i}_`))).toBe(true)
  // NO new law, NO new capability, deps 2
  expect(sg.carried.newProductCapability).toBe(0)
  expect(sg.carried.deps).toEqual(["hono", "zod"])
})
