/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 0 wall (PINS-LOCKED). ship-pins.json is self-consistent, carried from the Family
 * head (2c299b9e — the instrument speaks a number: D33 SIGNABLE, testRedesigns 1), and pins — BEFORE the Phase code — every
 * contract of the sprint that makes the record un-lie-able: the SHIP-GATE wall list (DD-61), the refusal-log schema
 * (RP-2, same path, no --force), the τ_int threshold PRE-REGISTERED from the Stamp's cut-points (RP-3), the mutation
 * catalogue = X-MANIFEST's banned-output list (DD-63), the dependency map's three join keys + pinned copy (DD-64/RP-4),
 * capture-is-a-verb (DD-65/RP-6), the oracle-staleness residue (DD-66/D79); walls S151–S160; the shed order; NO NEW LAW
 * (fifth sprint); deps 2; screens 3; familyN 1.
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
const sp = JSON.parse(readFileSync(path.join(H, "ship-pins.json"), "utf8"))
const FAMILY = JSON.parse(readFileSync(path.join(H, "family-pins.json"), "utf8"))
const MANIFEST = JSON.parse(readFileSync(path.join(H, "manifest-pins.json"), "utf8"))

test("SHIP Phase 0 — self-consistent + carried from the Family head (a moved contract word moves the sha) — POSITIVE CONTROL", () => {
  const { pinsSha, ...rest } = sp
  expect(sha256(JSON.stringify(rest))).toBe(sp.pinsSha)
  expect(sp.carriedFromPinsSha).toBe(FAMILY.pinsSha)
  expect(sp.carriedFromPinsSha).toBe("2c299b9e55fb5fb2b6f7e7af42f5c6c5a370c0e59ba0131c9cf86b2f6c5ba528")
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.phase2_rider.threshold.tauIntTrigger = 999 // tampering with the pre-registered threshold moves the sha
  expect(sha256(JSON.stringify(mutated))).not.toBe(sp.pinsSha)
})

test("SHIP Phase 0 — NO NEW LAW (a fifth sprint): 17 laws, 0 minted; deps 2; screens 3; familyN 1; exit kinds 7", () => {
  expect(sp.noNewLaw.laws).toBe(17)
  expect(sp.noNewLaw.minted).toBe(0)
  expect(sp.noNewLaw.sprintsWithoutALaw).toBe(5)
  expect(sp.carried.deps).toEqual(["hono", "zod"])
  expect(sp.carried.screens.length).toBe(3)
  expect(sp.carried.familyN).toBe(1)
  expect(sp.carried.exitKinds).toBe(7)
  // the four under-applied laws, named
  for (const s of ["S143", "S144", "S114", "S108"]) expect(sp.noNewLaw.fourUnderApplied[s]).toBeTruthy()
})

test("SHIP Phase 0 — the ten V39 audit findings carried by name (K1–K10), each with its V40 disposition", () => {
  for (const k of ["K1", "K2", "K3", "K4", "K5", "K6", "K7", "K8", "K9", "K10"]) {
    expect(sp.auditFindings[k]).toBeTruthy()
    expect(sp.auditFindings[k].length).toBeGreaterThan(60)
  }
  expect(sp.auditFindings.K1).toMatch(/NO TERMINAL TREE HASH|S143/)
  expect(sp.auditFindings.K10).toMatch(/SHARED, INVISIBLE DEPENDENCY|configuration and operational context/i)
})

test("SHIP Phase 0 — DD-61: the ship-gate wall list runs against SHIPPED artifacts (S152–S156)", () => {
  const w = sp.shipGateWallList.walls
  for (const s of ["S152", "S153", "S154", "S155", "S156"]) expect(w[s]).toMatch(/REFUSE/)
  expect(sp.shipGateWallList.rule).toMatch(/REAL EMIT PATH|REFUSES TO WRITE/)
})

test("SHIP Phase 0 — RP-2: the refusal log and the build log are the SAME PATH, no --force", () => {
  expect(sp.refusalLogSchema.rule).toMatch(/SAME FILE PATH/)
  expect(sp.refusalLogSchema.rule).toMatch(/no --force|no path by which both exist/)
  expect(sp.refusalLogSchema.samePath).toMatch(/BUILDLOG-SHIP\.md/)
})

test("SHIP Phase 0 — RP-3 (F-3): the τ_int threshold is DERIVED from the Stamp's cut-points, pinned BEFORE measurement", () => {
  const t = sp.phase2_rider.threshold
  expect(t.inflationTrigger).toBe(1.5)
  expect(t.tauIntTrigger).toBe(2.25)
  expect(t.zStar).toBeCloseTo(1.6448536, 5)
  expect(t.rule).toMatch(/DSR ≥ 0\.95|cut-point/)
  expect(t.rule).toMatch(/BEFORE measurement|before measurement/i)
  // the possible outcome stated in advance (attack #3): a finding, not a bug
  expect(t.possibleOutcome).toMatch(/FINDING/)
})

test("SHIP Phase 0 — DD-63: the mutation catalogue IS X-MANIFEST's banned-output list, quoted verbatim", () => {
  const banned = MANIFEST.xManifest.a_declarativeOnly.bannedOutputs
  expect(sp.phase3_guard.catalogue.bannedOutputs).toEqual(banned)
  expect(sp.phase3_guard.catalogue.seeded.length).toBeGreaterThanOrEqual(10)
  // the lower-bound caveat is pinned (RP-5) — printed WITH the number, always
  expect(sp.phase3_guard.catalogue.lowerBoundCaveat).toMatch(/LOWER BOUND/)
})

test("SHIP Phase 0 — DD-64/RP-4: three join keys; the copy PINNED VERBATIM; UNJUDGEABLE never independence; never 'diversify'", () => {
  const c = sp.phase4_dependencyMap.copyVerbatim
  expect(c.byUnderlying).toMatch(/underlying asset/)
  expect(c.byAdminKey).toMatch(/admin key/)
  expect(c.byOracle).toMatch(/oracle feed/)
  expect(c.rule).toMatch(/NEVER says 'diversify'|never says 'diversify'/)
  expect(sp.phase4_dependencyMap.rp4_asymmetricConfidence.rule).toMatch(/RESOLVED TERMINAL AUTHORITY/)
  expect(sp.phase4_dependencyMap.rp4_asymmetricConfidence.rule).toMatch(/UNJUDGEABLE, not independence|never independence/i)
})

test("SHIP Phase 0 — DD-65/RP-6: capture is a VERB, no scheduler; daysToJudgeable in CAPTURES not days", () => {
  expect(sp.phase5_capture.dd65).toMatch(/a VERB/)
  expect(sp.phase5_capture.dd65).toMatch(/schedules NOTHING/)
  expect(sp.phase5_capture.rp6_capturesNotDays).toMatch(/CAPTURES \(not days\)/)
})

test("SHIP Phase 0 — the shed order: 1,2,3,4 NEVER shed; then 6 first, 5 second (F-7 ordered)", () => {
  expect(sp.shedOrder.neverShed).toEqual(["1_shipGate", "2_rider", "3_guard", "4_dependencyMap"])
  expect(sp.shedOrder.shedOrderIfNeeded).toEqual(["6_residues", "5_capture"])
})

test("SHIP Phase 0 — walls S151–S160 pinned, each with a seeded negative; the deviations D75–D79 reserved (unsigned, LN5)", () => {
  for (const s of ["S151", "S152", "S153", "S154", "S155", "S156", "S157", "S158", "S159", "S160"]) {
    expect(sp.walls[s]).toBeTruthy()
    expect(sp.walls[s]).toMatch(/Seeded negative|seeded/)
  }
  for (const d of ["D75", "D76", "D77", "D78", "D79"]) {
    expect(sp.deviations[d]).toMatch(/Operator-signed=false/)
  }
  // LN5 — the gravest Halt is naming it
  expect(sp.deviations.operatorGatedNote).toMatch(/NEVER signs it \(LN5\)/)
  expect(sp.deviations.operatorGatedNote).toMatch(/FIFTEENTH sprint/)
})

test("SHIP Phase 0 — PART A′ (A1–A10) + PART F (RP1–RP7) recorded", () => {
  for (const a of ["A1_shipTheShipGate", "A3_riderSilencesAll", "A5_oneSentenceFromAdvice", "A7_selfGradedExam", "A9_compoundedGenerosity", "A10_fourthPolishSprint"]) {
    expect(sp.adversarialRecord_partA[a]).toBeTruthy()
  }
  for (const r of ["RP1_realEmitPath", "RP2_samePathNoForce", "RP3_thresholdDerived", "RP4_asymmetricConfidence", "RP5_lowerBound", "RP6_capturesNotDays", "RP7_orderedNeverSheds"]) {
    expect(sp.postImplementationRePins_partF[r]).toBeTruthy()
  }
})
