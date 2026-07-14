/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), Phase 0 wall (PINS-LOCKED). derive-pins.json is self-consistent, carried from the
 * Reach head (8c80367a), and pins every X-DERIVE clause + the claim->producer map + the PRE-REGISTERED tolerances
 * (content-hashed BEFORE Phase 2 runs — X-DERIVE(f), the HARKing guard) + the census's three routes + the release predicate
 * + D51 (product-or-instrument) + D52 + MR9-12 + the RP-1..RP-7 corrections + the Halt re-pinned a FOURTH time + walls
 * S100-S106 — BEFORE the product code.
 *
 * THE POSITIVE CONTROL IS SHOWN (X-SHOWN(a) carried): a mutated X-DERIVE clause moves the sha. The lock BITES, shown.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const dp = JSON.parse(readFileSync(path.join(H, "derive-pins.json"), "utf8"))
const REACH = JSON.parse(readFileSync(path.join(H, "reach-pins.json"), "utf8"))

test("DERIVE Phase 0 — the pins hash-lock is self-consistent + carried from the Reach head (a moved pin moves the sha) — POSITIVE CONTROL SHOWN", () => {
  const { pinsSha, ...rest } = dp
  const recomputed = sha256(JSON.stringify(rest))
  expect(recomputed).toBe(dp.pinsSha) // self-consistent
  expect(dp.carriedFromPinsSha).toBe(REACH.pinsSha) // carried forward, never rebuilt
  expect(dp.carriedFromPinsSha).toBe("8c80367a0deeb9d294d53d8b2c5ff5da2815724c0345844497dc4740dec0df70")

  // POSITIVE CONTROL (X-SHOWN(a)) — mutate one X-DERIVE clause; the sha MUST move. Shown, not merely asserted.
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.xDerive.a_generatedNeverWritten = "weakened"
  const movedSha = sha256(JSON.stringify(mutated))
  expect(movedSha).not.toBe(dp.pinsSha) // the lock bites
  expect({ pinned: dp.pinsSha.slice(0, 8), moved: movedSha !== dp.pinsSha }).toEqual({ pinned: dp.pinsSha.slice(0, 8), moved: true })
})

test("DERIVE Phase 0 — X-DERIVE mints ONE law (the 17th) with six clauses: generated · every-claim-has-a-producer · boolean-computed-or-false · every-number-tiered · partial-renders-partial · tolerance-pre-registered", () => {
  const x = dp.xDerive
  expect(x.a_generatedNeverWritten).toMatch(/GENERATED, NEVER WRITTEN/i)
  expect(x.b_everyClaimHasAProducer).toMatch(/EVERY CLAIM HAS A PRODUCER/i)
  expect(x.c_aBooleanIsComputedOrItIsFalse).toMatch(/A BOOLEAN IS COMPUTED OR IT IS FALSE/i)
  expect(x.d_everyNumberCarriesItsTier).toMatch(/CARRIES ITS PROVENANCE TIER/i)
  expect(x.e_partialRendersAsPartial).toMatch(/RENDERS AS PARTIAL/i)
  expect(x.f_toleranceIsPreRegistered).toMatch(/PRE-REGISTERED/i)
  // the 17th law, disclosed within the Halt (zero product capability)
  expect(dp.carried.lawsThisSprint).toMatch(/ONE \(X-DERIVE\)/)
  expect(dp.carried.newProductCapability).toBe(0) // the Halt, honored a THIRD time
})

test("DERIVE Phase 0 — the tolerances are PRE-REGISTERED and content-hashed BEFORE Phase 2 (X-DERIVE(f), the HARKing guard); UNCOMPARABLE is a representable third value", () => {
  const t = dp.preRegisteredTolerances
  expect(t.dsr).toBe(0.02)
  expect(t.psr).toBe(0.02)
  expect(t.pbo).toBe(0.02)
  expect(t.hashedBeforePhase2).toBe(true)
  expect(t.rationale).toMatch(/a priori/i)
  expect(t.rationale).toMatch(/UNSEEN when this tolerance was pinned/i) // PSR/PBO genuinely a priori
  expect(t.thirdValueUncomparable).toMatch(/UNCOMPARABLE/)
  expect(t.disagreementIsAFinding).toMatch(/HEADLINE/i)
  // the tolerance is pinned here and NOWHERE else — CrossCheck.agreement reads it from the pins (asserted in Phase 2's wall)
})

test("DERIVE Phase 0 — the claim->producer map is present and TOTAL-in-shape: every claim carries a producer + named artifacts + a tier (X-DERIVE(b)/(d))", () => {
  const claims = dp.claimProducerMap.claims
  const keys = Object.keys(claims)
  expect(keys.length).toBeGreaterThanOrEqual(15)
  for (const k of keys) {
    expect(typeof claims[k].producer).toBe("string") // a named function
    expect(Array.isArray(claims[k].artifacts)).toBe(true) // over named artifacts
    expect(claims[k].artifacts.length).toBeGreaterThan(0)
    expect(typeof claims[k].tier).toBe("string") // REAL/SAMPLE/UNJUDGEABLE/n-a (X-DERIVE(d))
  }
  // the load-bearing producers are named
  expect(claims.d33.producer).toBe("Signability.d33")
  expect(claims.crossCheckPbo.producer).toBe("CrossCheck.agreement")
  expect(claims.census.producer).toBe("Falsify.census")
  expect(claims.d50i_binary.producer).toBe("Release.d50")
})

test("DERIVE Phase 0 — the census has THREE routes (recover -> re-found -> delete), and RP-3 requires recover-first + counts re-founded APART", () => {
  const c = dp.censusRoutes
  expect(c.route1_recover).toMatch(/RECOVER/)
  expect(c.route2_reFound).toMatch(/RE-FOUND/)
  expect(c.route2_reFound).toMatch(/DEMONSTRATED\(re-founded\)/)
  expect(c.route3_deleteWithProof).toMatch(/DELETE-WITH-PROOF/)
  expect(c.rp3_recoverBeforeReFound).toMatch(/RECOVER must be ATTEMPTED and its result RECORDED/i)
  expect(c.batteryDeltaProducer).toMatch(/removedReason/)
})

test("DERIVE Phase 0 — the release predicate computes four checkboxes and they compute RED until publication (E-3 fixed)", () => {
  const r = dp.releaseArtifactPredicate
  expect(r.i_binary).toMatch(/COMMITTED path/i)
  expect(r.i_binary).toMatch(/RED/)
  expect(r.iii_published).toMatch(/DERIVED/i)
  expect(r.reproducibilityUnverified).toMatch(/UNVERIFIED/)
  expect(r.computesRedIsTheCorrectOutput).toMatch(/until a human pushes/i)
})

test("DERIVE Phase 0 — D51 (product-or-instrument) is presented NEVER chosen with each option's cost computed (RP-5); D52 (deletion) pinned; both unsigned", () => {
  expect(dp.deviations.D51).toMatch(/PRODUCT or an INSTRUMENT/i)
  expect(dp.deviations.D51).toMatch(/The agent computes; the pen chooses/i)
  expect(dp.deviations.D51).toMatch(/SEARCH under X-RECKON/i) // option (2)'s computed cost
  expect(dp.deviations.D51).toMatch(/operatorSigned=false/)
  expect(dp.deviations.D52).toMatch(/DELETE-WITH-PROOF/)
  expect(dp.deviations.D52).toMatch(/operatorSigned=false/)
  expect(dp.deviations.deviationOrderAppend).toEqual(["D51", "D52"])
})

test("DERIVE Phase 0 — the Halt is re-pinned a FOURTH time; V35's terminal clause NOW BINDS; two pens (IN2 + PUBLICATION); one honorable exit named", () => {
  const h = dp.haltRePinned
  expect(h.rule).toMatch(/RE-PINNED A FOURTH TIME/i)
  expect(h.killCriterion).toBe("8b4e094b")
  expect(h.twoPens).toMatch(/IN2/)
  expect(h.twoPens).toMatch(/PUBLICATION/)
  expect(h.terminalClauseNowBinds).toMatch(/Both hold/i)
  expect(h.oneHonorableExit).toMatch(/is NOT failure/i)
})

test("DERIVE Phase 0 — MR9-MR12 are pinned (attribution, notation, jitter source, the Halt-is-not-a-shield distinction)", () => {
  expect(dp.mr9_unattributedTests.rule).toMatch(/itemized/i)
  expect(dp.mr10_notation.rule).toMatch(/FULL auto-discover.*CURATED/is)
  expect(dp.mr11_jitter.rule).toMatch(/DIAGNOSED/i)
  expect(dp.mr12_haltNotAShield.rule).toMatch(/Halt used to defer an owed residue is a Halt being used as a SHIELD/i)
})

test("DERIVE Phase 0 — all ten Part-A' attacks and all seven Part-F re-pins (RP-1..RP-7) are recorded as design corrections BEFORE code", () => {
  const a = dp.adversarialRecord_partA
  for (let i = 1; i <= 10; i++) expect(Object.keys(a).some((k) => k.startsWith(`A${i}_`))).toBe(true)
  const f = dp.postImplementationRePins_partF
  expect(f.RP1_seededNegativeIsTheClaimsInversion).toMatch(/claim's own inversion/i)
  expect(f.RP2_alignCscvParametersOrUncomparable).toMatch(/UNCOMPARABLE/)
  expect(f.RP2_alignCscvParametersOrUncomparable).toMatch(/pypbo.*NOT needed/i)
  expect(f.RP3_recoverBeforeReFoundCountApart).toMatch(/counted separately forever/i)
  expect(f.RP4_batteryDeltaNamesRemovals).toMatch(/removedReason|named removals/i)
  expect(f.RP5_computeEachOptionsCost).toMatch(/RETIRES the Socket/i)
  expect(f.RP6_cloneProvesSelfContainedNotReproducible).toMatch(/self-contained/i)
  expect(f.RP7_xDeriveIsTheLastStructuralLaw).toMatch(/last one justifiable this way|Socket ships instead/i)
})

test("DERIVE Phase 0 — DD-17..DD-24 are each recorded with what the tree showed (the DD-17 purgedcv pivot; DD-23's different-author model)", () => {
  const d = dp.delegatedDecisions
  for (let i = 17; i <= 24; i++) expect(Object.keys(d).some((k) => k.startsWith(`DD${i}_`))).toBe(true)
  expect(d.DD17_independentPsrPbo).toMatch(/purgedcv.*provides all three|probability_of_backtest_overfitting/i)
  expect(d.DD17_independentPsrPbo).toMatch(/pypbo.*NOT needed/i)
  expect(d.DD23_differentAuthorBaits).toMatch(/openai\/gpt-oss-120b/)
})

test("DERIVE Phase 0 — walls S100-S106 declared; count 106, wallMax 106; the law-count observation (F-7: 17 · 6 · 0) + the last-structural-law pin", () => {
  expect(dp.walls.count).toBe(106)
  expect(dp.walls.wallMax).toBe(106)
  for (const s of ["S100", "S101", "S102", "S103", "S104", "S105", "S106"]) expect(dp.walls[s]).toBeTruthy()
  const l = dp.lawsCountObservation
  expect(l.laws).toBe(17)
  expect(l.lawsMintedInLast6Sprints).toBe(6)
  expect(l.productCapabilityAddedInLast3Sprints).toBe(0)
  expect(l.f7_lastStructuralLaw).toMatch(/LAST structural law/i)
})

test("DERIVE Phase 0 — PART CLEAN pins the pure functions; deps stay [hono, zod], screens the conscious 3; the shed order pins Phases 1,2,3 NEVER shed", () => {
  expect(dp.partClean.pureFns).toMatch(/Claim\.producer/)
  expect(dp.partClean.pureFns).toMatch(/Rollup\.header/)
  expect(dp.partClean.pureFns).toMatch(/CrossCheck\.agreement/)
  expect(dp.partClean.pureFns).toMatch(/Signability\.d33/)
  expect(dp.partClean.pureFns).toMatch(/Clone\.pristine/)
  expect(dp.partClean.pureFns).toMatch(/Release\.artifact/)
  expect(dp.carried.deps).toEqual(["hono", "zod"])
  expect(dp.carried.screens).toEqual(["shelf", "reality-check", "ask"])
  expect(dp.shedOrder.order[0]).toMatch(/Phase 1.*NEVER sheds/i)
  expect(dp.shedOrder.order[3]).toMatch(/Phase 5.*sheds FIRST/i)
})
