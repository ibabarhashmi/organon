/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 0 wall (PINS-LOCKED). family-pins.json is self-consistent, carried from the
 * Substance head (153628a9 — the pen having moved: D51 ANSWERED = INSTRUMENT), and pins — BEFORE the Phase code — every
 * contract of the sprint that pays for the pen it moved and makes the instrument speak a number: the D56 price + D33's
 * recomputed state (RP-1 testRedesigns), the i.i.d. axis rule (DD-53/RP-2), the number-at-the-door tier order (RP-3), the
 * filter-as-optional-hashed-field (RP-4), the pinned lineage-view copy (RP-5), the coverage proxy (RP-6), the frozen-at-
 * seven trigger (RP-7); walls S140–S150; the shed order; NO NEW LAW; deps 2; screens 3; familyN 1.
 *
 * POSITIVE CONTROL SHOWN: a mutated contract word moves the sha. The lock BITES.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const fp = JSON.parse(readFileSync(path.join(H, "family-pins.json"), "utf8"))
const SUBSTANCE = JSON.parse(readFileSync(path.join(H, "substance-pins.json"), "utf8"))

test("FAMILY Phase 0 — self-consistent + carried from the Substance head (a moved contract word moves the sha) — POSITIVE CONTROL", () => {
  const { pinsSha, ...rest } = fp
  expect(sha256(JSON.stringify(rest))).toBe(fp.pinsSha)
  expect(fp.carriedFromPinsSha).toBe(SUBSTANCE.pinsSha)
  expect(fp.carriedFromPinsSha).toBe("153628a91515de14a6245be013c891fd29878407055ce7e5952cf9435718b38f")
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.phase1_price.rp1_teeth.testRedesigns = 99 // tampering with the price's teeth moves the sha
  expect(sha256(JSON.stringify(mutated))).not.toBe(fp.pinsSha)
})

test("FAMILY Phase 0 — NO NEW LAW (a fourth sprint): 17 laws, 0 minted; deps 2; screens 3; familyN 1; capability 0", () => {
  expect(fp.noNewLaw.laws).toBe(17)
  expect(fp.noNewLaw.minted).toBe(0)
  expect(fp.noNewLaw.sprintsWithoutALaw).toBe(4)
  expect(fp.carried.deps).toEqual(["hono", "zod"])
  expect(fp.carried.screens.length).toBe(3)
  expect(fp.carried.familyN).toBe(1)
  expect(fp.carried.newProductCapability).toBe(0)
  expect(fp.carried.exitKinds).toBe(7)
})

test("FAMILY Phase 0 — the frame: D51 ANSWERED = INSTRUMENT raises the bar; reachableHumans 1 BY DESIGN", () => {
  expect(fp.frame.d51).toMatch(/ANSWERED = INSTRUMENT/)
  expect(fp.frame.d51).toMatch(/DECORATED/) // the bar rises, not lowers
  expect(fp.frame.reachableHumans).toBe(1)
  expect(fp.frame.reachableHumansNote).toMatch(/BY DESIGN/i)
})

test("FAMILY Phase 0 — the nine V38 execution-audit findings carried by name, each with its V39 disposition", () => {
  for (const j of ["J1", "J2", "J3", "J4", "J5", "J6", "J7", "J8", "J9"]) {
    expect(fp.auditFindings[j]).toBeTruthy()
    expect(fp.auditFindings[j].length).toBeGreaterThan(60)
  }
  expect(fp.auditFindings.J1).toMatch(/D56 PAID|price/i)
  expect(fp.auditFindings.J7).toMatch(/false-fire.*UNJUDGEABLE|MATERIALIZED/i)
})

test("FAMILY Phase 0 — RP-1 (F-1 CRITICAL): D33 carries testRedesigns + redesignSearchHashes, never resets; the flip SURVIVES in value", () => {
  const t = fp.phase1_price.rp1_teeth
  expect(t.rule).toMatch(/testRedesigns/)
  expect(t.rule).toMatch(/NEVER resets/i)
  expect(t.rule).toMatch(/receipt, not a payment/i)
  expect(t.testRedesigns).toBe(1) // the V38 single-seed → null-dist-mean redesign
  expect(t.flipSurvives).toMatch(/YES, in VALUE/i)
  expect(t.flipSurvives).toMatch(/independent seeds/i) // the i.i.d. rider does not undermine the seed-based null distribution
})

test("FAMILY Phase 0 — RP-2 (F-2): DD-53 establishes the axis BEFORE wiring; the pre-registered reading is a HARNESS-COMPOSITION gap (rider STANDS, quantified)", () => {
  const d = fp.phase1_price.dd53_autopsyMeetsSignature
  expect(d.rule).toMatch(/SERIAL/)
  expect(d.rule).toMatch(/CROSS-SECTIONAL/)
  expect(d.rule).toMatch(/wrong axis retires the warning/i)
  expect(d.preRegisteredReading).toMatch(/HARNESS-COMPOSITION/)
  expect(d.preRegisteredReading).toMatch(/rider STANDS/i)
  expect(d.preRegisteredReading).toMatch(/√\(n−1\)|len\(returns\)/) // the frozen psr derives n internally
  expect(d.determinationArtifact).toMatch(/effective-n-determination\.json/)
  expect(d.s142).toMatch(/SAME LINE/)
})

test("FAMILY Phase 0 — RP-3 (F-3): the own-capture number LEADS, retrospective beneath revisable, window disparity stated; own-below-minimum → own UNJUDGEABLE + retro alone weaker", () => {
  const r = fp.phase2_number.rp3_tierOrder
  expect(r.rule).toMatch(/OWN-CAPTURE number LEADS/i)
  expect(r.rule).toMatch(/revisab/i)
  expect(r.rule).toMatch(/WEAKER/)
  expect(r.minWindowDays).toBe(180)
})

test("FAMILY Phase 0 — RP-4 (F-4): the filter is a NEW OPTIONAL hashed field; a manifest without one is unchanged (fixture ids before===after)", () => {
  const r = fp.phase5_enumerator.rp4_filterHashed
  expect(r.rule).toMatch(/NEW OPTIONAL FIELD/)
  expect(r.rule).toMatch(/UNCHANGED/)
  expect(r.rule).toMatch(/before === after/)
  expect(r.rule).toMatch(/SEARCH/) // re-stating the filter is a SEARCH
})

test("FAMILY Phase 0 — RP-5 (F-5): the lineage view copy is PINNED VERBATIM, no LLM; a count and a list, nothing else", () => {
  expect(fp.phase6_lineageView.rp5_pinnedCopy).toMatch(/PINNED VERBATIM/)
  expect(fp.phase6_lineageView.rp5_pinnedCopy).toMatch(/no LLM phrasing/i)
  expect(fp.phase6_lineageView.dd60_chronological.copyVerbatim.rule).toMatch(/a count and a list, nothing else/i)
  expect(fp.phase6_lineageView.screens).toBe(3)
})

test("FAMILY Phase 0 — RP-6 (F-6) coverage proxy + RP-7 (F-7) frozen-at-seven", () => {
  expect(fp.phase3_exitKinds.dd56_oracleStaleness.rp6_coverageProxy).toMatch(/positions held: 0/)
  expect(fp.phase3_exitKinds.dd56_oracleStaleness.rp6_coverageProxy).toMatch(/PROXY/)
  expect(fp.phase3_exitKinds.d70_exitSetSeven.after).toBe(7)
  expect(fp.phase4_algebra.rp7_frozenAtSeven).toMatch(/FROZEN AT SEVEN/)
})

test("FAMILY Phase 0 — walls S140–S150 each NAME their contract + seeded negative; the shed order (1,2,5 never shed)", () => {
  for (const id of fp.walls.built) {
    expect(fp.walls[id]).toBeTruthy()
    expect(fp.walls[id].length).toBeGreaterThan(40)
  }
  expect(fp.walls.built).toEqual(["S140", "S141", "S142", "S143", "S144", "S145", "S146", "S147", "S148", "S149", "S150"])
  expect(fp.shedOrder.neverShed).toEqual(["1_price", "2_number", "5_enumerator"])
  expect(fp.shedOrder.shedOrderIfNeeded).toEqual(["4_algebra", "6_lineageView", "3_exitKinds"])
})

test("FAMILY Phase 0 — all 10 Part-A′ attacks + all 7 Part-F re-pins recorded", () => {
  for (let i = 1; i <= 10; i++) expect(Object.keys(fp.adversarialRecord_partA).some((k) => k.startsWith(`A${i}_`))).toBe(true)
  for (let i = 1; i <= 7; i++) expect(Object.keys(fp.postImplementationRePins_partF).some((k) => k.startsWith(`RP${i}_`))).toBe(true)
})

test("FAMILY Phase 0 — the fence: the Merkle layer DEAD (D74), the meter dark (D63 OFF), an eighth enum kind refused", () => {
  const fence = JSON.stringify(fp.fence.refused)
  expect(fence).toMatch(/Merkle.*DEAD/)
  expect(fence).toMatch(/D63 OFF/)
  expect(fence).toMatch(/eighth exit kind through the enum/)
  expect(fp.phase5_enumerator.d63_off.familyN).toBe(1)
  expect(fp.phase5_enumerator.d63_off.deflation).toBe("DARK")
})
