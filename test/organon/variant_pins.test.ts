/**
 * ORGΛNON — THE VARIANT SPRINT (V41), Phase 0 wall (PINS-LOCKED). variant-pins.json is self-consistent, carried from the
 * Ship head (c0777d9a — the first FULLY-ACHIEVED sprint in ten), and pins — BEFORE the Phase code — every contract of V41:
 * the census fold (S161/L-1), the guard-hole close (S162/L-2/DD-70), the PBO correction (S163/L-3/DD-71/RP-3), the rider
 * dark dry-run (S164/L-4/RP-5), the capture marginal value (S165/L-5/DD-72), the VARIANT LEDGER (S166–S168, DD-67/68/69/73,
 * RP-1/2/4/6), D80–D83 (Operator-signed=false), MR13 (sixth sprint), the shed order; NO NEW LAW (sixth sprint); deps 2;
 * screens 3; familyN 1.
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
const vp = JSON.parse(readFileSync(path.join(H, "variant-pins.json"), "utf8"))
const SHIP = JSON.parse(readFileSync(path.join(H, "ship-pins.json"), "utf8"))

test("VARIANT Phase 0 — self-consistent + carried from the Ship head (a moved contract word moves the sha) — POSITIVE CONTROL", () => {
  const { pinsSha, ...rest } = vp
  expect(sha256(JSON.stringify(rest))).toBe(vp.pinsSha)
  expect(vp.carriedFromPinsSha).toBe(SHIP.pinsSha)
  expect(vp.carriedFromPinsSha).toBe("c0777d9abc4138c6abc585cb40629d8ddde51eca1d40c2effa6f17a4f7fe5c4d")
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.delegatedDecisions.DD68.lit = true // tampering with the dark-meter rule (lit: false) moves the sha
  expect(sha256(JSON.stringify(mutated))).not.toBe(vp.pinsSha)
})

test("VARIANT Phase 0 — NO NEW LAW (a sixth sprint): 17 laws, 0 minted; deps 2; screens 3; familyN 1; exit kinds 7", () => {
  expect(vp.noNewLaw.laws).toBe(17)
  expect(vp.noNewLaw.minted).toBe(0)
  expect(vp.noNewLaw.sprintsWithoutALaw).toBe(6)
  expect(vp.carried.deps).toEqual(["hono", "zod"])
  expect(vp.carried.screens.length).toBe(3)
  expect(vp.carried.familyN).toBe(1)
  expect(vp.carried.exitKinds).toBe(7)
  // the three under-applied laws, named
  for (const k of ["censusContinuity", "degeneratePbo", "openGuardHole"]) expect(vp.noNewLaw.threeUnderApplied[k]).toBeTruthy()
})

test("VARIANT Phase 0 — the six V40 audit findings carried by name (L1–L6), each with its V41 disposition", () => {
  for (const l of ["L1", "L2", "L3", "L4", "L5", "L6"]) {
    expect(vp.auditFindings[l]).toBeTruthy()
    expect(vp.auditFindings[l].length).toBeGreaterThan(60)
  }
  expect(vp.auditFindings.L1).toMatch(/CENSUS CONTINUITY IS ASSERTED, NOT DISPLAYED/)
  expect(vp.auditFindings.L3).toMatch(/0\.6 vs 0\.6|DEGENERATE PBO/)
})

test("VARIANT Phase 0 — DD-67/RP-4: familyId = filter hash + operator epoch, NEVER auto-grouped by filter alone", () => {
  const d = vp.delegatedDecisions.DD67
  expect(d.familyIdFormula).toMatch(/filterHash.*operatorEpoch/)
  expect(d.rule).toMatch(/operatorEpoch is an explicit boundary the Operator controls/)
  expect(d.rule).toMatch(/re-using a filter after an explicit 'start fresh' is a NEW family/)
  expect(d.noFilterIsFamilyOfOne).toBe(true)
  // S166 — every fixture lineage id unchanged (the epoch is OUTSIDE the hashed identity)
  expect(d.epochOutsideHashedIdentity).toMatch(/OUTSIDE the manifest content hash/)
})

test("VARIANT Phase 0 — DD-68/RP-1: the dark search price is stored as INGREDIENTS, tagged DARK-COMPUTE NOT A VERDICT; lit false", () => {
  const d = vp.delegatedDecisions.DD68
  expect(d.tag).toBe("DARK-COMPUTE, NOT A VERDICT")
  expect(d.lit).toBe(false)
  expect(d.rule).toMatch(/INGREDIENTS \{nTrials, bestNaive, deflationFactor\}/)
  expect(d.rule).toMatch(/[Aa] seeded LIT meter.*FAILS/)
  expect(d.frozenSource).toMatch(/sr0_deflated/)
})

test("VARIANT Phase 0 — DD-69/RP-2: chronological, own-thesis Stamps, the copy PINNED VERBATIM, no ranking", () => {
  const c = vp.delegatedDecisions.DD69.copyVerbatim
  expect(c.ownThesisRule).toMatch(/does not compare strategies, it prices the search/)
  expect(c.searchPriceDark).toMatch(/COMPUTED and stored as ingredients/)
  expect(c.authorship).toMatch(/AGENT.*HUMAN/)
  expect(c.rule).toMatch(/NEVER says 'choose', 'better', 'prefer', or 'instead'/)
  expect(vp.delegatedDecisions.DD69.rule).toMatch(/CHRONOLOGICAL, mechanically pinned/)
})

test("VARIANT Phase 0 — DD-70: the guard hole distinction (advice superlative caught; factual superlative renders)", () => {
  const d = vp.delegatedDecisions.DD70
  expect(d.distinction).toMatch(/an ADVICE superlative/)
  expect(d.distinction).toMatch(/a FACTUAL superlative names a measured quantity/)
  expect(d.distinction).toMatch(/165/)
  expect(vp.phase2_guardHole.decision).toMatch(/CLOSED/)
  expect(vp.phase2_guardHole.decision).toMatch(/8\/17 to 10\/17/)
})

test("VARIANT Phase 0 — DD-71/RP-3: PBO independent leg proven to DETECT on a KNOWN NON-TRIVIAL fixture (or RETIRE)", () => {
  const d = vp.delegatedDecisions.DD71
  expect(vp.phase3_pbo.rp3).toMatch(/KNOWN, NON-TRIVIAL PBO/)
  expect(vp.phase3_pbo.rp3).toMatch(/demonstrates the cross-check can DETECT, not just reproduce/)
  expect(d.chosen).toMatch(/RETIRED from D33's consistency leg/)
  expect(d.chosen).toMatch(/D33's state.*testRedesigns.*bundle.*UNCHANGED/)
})

test("VARIANT Phase 0 — DD-72/RP-6: capture marginal value in CAPTURES, never days; the first capture pays", () => {
  expect(vp.phase5_captureMarginal.rp6).toMatch(/CAPTURES, not days/)
  expect(vp.phase5_captureMarginal.l5).toMatch(/turns a UNJUDGEABLE into a 1/)
})

test("VARIANT Phase 0 — DD-73: the variant ledger is a PATH off the lineage view, screens stay 3", () => {
  expect(vp.delegatedDecisions.DD73.screens).toBe(3)
  expect(vp.delegatedDecisions.DD73.rule).toMatch(/a PATH off the lineage view, not a new screen/)
  expect(vp.delegatedDecisions.DD73.rule).toMatch(/goes to the pen as an X-SURFACE question/)
})

test("VARIANT Phase 0 — the shed order: 1,2,3,6 NEVER shed; then 5 first, 4 second", () => {
  expect(vp.shedOrder.neverShed).toEqual(["1_censusFold", "2_guardHole", "3_pbo", "6_variantLedger"])
  expect(vp.shedOrder.shedOrderIfNeeded).toEqual(["5_captureMarginal", "4_riderDryRun"])
})

test("VARIANT Phase 0 — walls S161–S168 pinned, each with a seeded negative + a W-tag; D80–D83 reserved (unsigned, LN5)", () => {
  for (const s of ["S161", "S162", "S163", "S164", "S165", "S166", "S167", "S168"]) {
    expect(vp.walls[s]).toBeTruthy()
    expect(vp.walls[s]).toMatch(/Seeded negative|seeded/)
    expect(vp.walls[s]).toMatch(/W-VR0\d/) // every new wall carries a mint-time W-tag origin (S108/S155)
  }
  for (const d of ["D80", "D81", "D82", "D83"]) {
    expect(vp.deviations[d]).toMatch(/Operator-signed=false/)
  }
  // LN5 — the gravest Halt is naming it; D27 STILL FIRST, the SIXTEENTH sprint
  expect(vp.deviations.operatorGatedNote).toMatch(/NEVER signs it \(LN5\)/)
  expect(vp.deviations.operatorGatedNote).toMatch(/SIXTEENTH sprint/)
  expect(vp.deviations.mr13).toMatch(/SIXTH sprint/)
})

test("VARIANT Phase 0 — PART A′ (A1–A7) + PART F (RP1–RP6) recorded", () => {
  for (const a of ["A1_sideBySideIsRanking", "A2_computingDarkIsHidingIt", "A3_poisonOwnMetric", "A4_retiringPboWeakensD33", "A5_censusFoldIsCircular", "A6_buildingForZeroUsers", "A7_noLawGovernance"]) {
    expect(vp.adversarialRecord_partA[a]).toBeTruthy()
  }
  for (const r of ["RP1_ingredientsNotVerdict", "RP2_ownThesisNotOrder", "RP3_detectNotReproduce", "RP4_epochBoundary", "RP5_darkToTestArtifact", "RP6_authorshipBreakdown"]) {
    expect(vp.postImplementationRePins_partF[r]).toBeTruthy()
  }
})
