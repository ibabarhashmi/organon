/**
 * ORGΛNON — THE REACH SPRINT (V35), Phase 0 wall (PINS-LOCKED). reach-pins.json is self-consistent, carried from the
 * Showing head (07d27f81), and pins every X-REACH clause + the census schema (four buckets incl ORIGIN-UNRECORDED, RP-1)
 * + the derived verify-object schema (X-REACH(c) — no typed "green") + the reach fact's structural definition (published
 * DERIVED, RP-4) + D33's precondition (UNSIGNABLE while S94 red) + D49/D50 + the RP-1..RP-7 corrections + the re-pinned
 * Halt + walls S93-S99 — BEFORE the product code.
 *
 * THE POSITIVE CONTROL IS SHOWN (X-SHOWN(a) carried): a mutated X-REACH clause moves the sha. The lock BITES, shown.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const rp = JSON.parse(readFileSync(path.join(H, "reach-pins.json"), "utf8"))
const SHOW = JSON.parse(readFileSync(path.join(H, "show-pins.json"), "utf8"))

test("REACH Phase 0 — the pins hash-lock is self-consistent + carried from the Showing head (a moved pin moves the sha) — POSITIVE CONTROL SHOWN", () => {
  const { pinsSha, ...rest } = rp
  const recomputed = sha256(JSON.stringify(rest))
  expect(recomputed).toBe(rp.pinsSha) // self-consistent
  expect(rp.pinsSha).toBe("8c80367a0deeb9d294d53d8b2c5ff5da2815724c0345844497dc4740dec0df70")
  expect(rp.carriedFromPinsSha).toBe(SHOW.pinsSha) // carried forward, never rebuilt
  expect(rp.carriedFromPinsSha).toBe("07d27f8116c7ce0e1883a89891eb5bfac0fecebc8731a131975d433bd4b830f9")

  // POSITIVE CONTROL (X-SHOWN(a)) — mutate one X-REACH clause; the sha MUST move. Shown, not merely asserted.
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.xReach.a_aCheckThatCannotFailIsNotACheck = "weakened"
  const movedSha = sha256(JSON.stringify(mutated))
  expect(movedSha).not.toBe(rp.pinsSha) // the lock bites
  expect({ pinned: rp.pinsSha.slice(0, 8), moved: movedSha !== rp.pinsSha }).toEqual({ pinned: "8c80367a", moved: true })
})

test("REACH Phase 0 — X-REACH mints ONE law (the 16th) with six clauses: cannot-fail · never-executed · partially-red · could-not-be-nonzero · reach-structural · distribution-not-capability", () => {
  const x = rp.xReach
  expect(x.a_aCheckThatCannotFailIsNotACheck).toMatch(/A CHECK THAT CANNOT FAIL IS NOT A CHECK/i)
  expect(x.b_aCrossCheckThatDoesNotExecuteIsNotACheck).toMatch(/DOES NOT EXECUTE IS NOT A CHECK/i)
  expect(x.c_aGateExpectedToBePartiallyRedIsNotAGate).toMatch(/PARTIALLY RED IS NOT A GATE/i)
  expect(x.d_aNumberThatCouldNotHaveBeenNonZeroIsNotAMeasurement).toMatch(/COULD NOT HAVE BEEN NON-ZERO IS NOT A MEASUREMENT/i)
  expect(x.e_reachIsAFactStructuralNeverSurveyed).toMatch(/REACH IS A FACT/i)
  expect(x.f_distributionIsNotCapability).toMatch(/DISTRIBUTION IS NOT CAPABILITY/i)
  // the 16th law, disclosed within the Halt (zero product capability)
  expect(rp.carried.lawsThisSprint).toMatch(/ONE \(X-REACH\)/)
  expect(rp.carried.newProductCapability).toBe(0) // the Halt, honored a second time
})

test("REACH Phase 0 — the census schema has FOUR buckets (RP-1: ORIGIN-UNRECORDED is a counted fourth bucket) + the living-wall clause (RP-6)", () => {
  const c = rp.censusSchema
  expect(Object.keys(c.buckets).sort()).toEqual(["DEMONSTRATED", "EXEMPT", "ORIGIN_UNRECORDED", "WEAK"])
  expect(c.buckets.ORIGIN_UNRECORDED).toMatch(/NOT-PROVEN-to-be-the-original-defect/i)
  expect(c.buckets.ORIGIN_UNRECORDED).toMatch(/fourth bucket/i)
  expect(c.buckets.DEMONSTRATED).toMatch(/ORIGINAL defect/i)
  expect(c.livingWall).toMatch(/pure read/i)
  expect(c.livingWall).toMatch(/absent from the catalog FAILS/i)
  expect(c.anyWallInNoBucketFails).toMatch(/FAILS the battery/i)
})

test("REACH Phase 0 — the verify slot is a DERIVED OBJECT (X-REACH(c)) — {exitCode, subchecks[]}, never the typed word green", () => {
  const v = rp.verifyObjectSchema
  expect(v.rule).toMatch(/DERIVED OBJECT/i)
  expect(v.shape.exitCode).toMatch(/number/i)
  expect(v.shape.subchecks).toMatch(/name.*status.*detail/i)
  expect(v.wall).toMatch(/types the word green/i)
  expect(v.wall).toMatch(/non-zero/i)
})

test("REACH Phase 0 — the reach fact is structural: published DERIVED from git remote (RP-4), reachableHumans = published ? UNJUDGEABLE : 1", () => {
  const r = rp.reachFact
  expect(r.publishedDerived).toMatch(/DERIVED/i)
  expect(r.publishedDerived).toMatch(/git branch -r --contains/i)
  expect(r.publishedDerived).toMatch(/declared constant is FORBIDDEN/i)
  expect(r.reachableHumans).toMatch(/published \? 'UNJUDGEABLE' : 1/)
  expect(r.reachableHumans).toMatch(/never surveyed/i)
})

test("REACH Phase 0 — D33 is pinned UNSIGNABLE-while-S94-red (a structural precondition), and this sprint S94 is GREEN (the cross-check executed & agreed) — still NEVER signed (LN5)", () => {
  const d = rp.d33Precondition
  expect(d.rule).toMatch(/UNSIGNABLE while S94 is red/i)
  expect(d.stateThisSprint).toMatch(/GREEN this sprint/i)
  expect(d.stateThisSprint).toMatch(/0\.478421/) // the shown DSR number
  expect(d.stateThisSprint).toMatch(/NEVER signs it|operatorSigned=false/i)
  expect(rp.deviations.D33).toMatch(/PRESENTED AS UNSIGNABLE/i)
})

test("REACH Phase 0 — D49 (distribution-not-capability, unsigned) + D50 (kill-criterion deferral with its STATED window, RP-5) are pinned unsigned", () => {
  expect(rp.deviations.D49).toMatch(/operatorSigned=false/)
  expect(rp.deviations.D49).toMatch(/distribution is not capability/i)
  expect(rp.deviations.D50).toMatch(/DEFERRED/i)
  expect(rp.deviations.D50).toMatch(/90 days/i) // RP-5: the window is a NUMBER, stated now
  expect(rp.deviations.D50).toMatch(/operatorSigned=false/)
  expect(rp.deviations.deviationOrderAppend).toEqual(["D49", "D50"])
})

test("REACH Phase 0 — all seven Part-F re-pins (RP-1..RP-7) are recorded as design corrections BEFORE code", () => {
  const f = rp.postImplementationRePins_partF
  expect(f.RP1_censusOriginUnrecorded).toMatch(/ORIGIN-UNRECORDED/i)
  expect(f.RP2_purgedcvRealBlocker).toMatch(/requirements-studio\.txt/i)
  expect(f.RP3_egressAssertionStrength).toMatch(/NO provider is constructed/i)
  expect(f.RP4_publishedDerived).toMatch(/DERIVED, not declared/i)
  expect(f.RP5_statedWindow).toMatch(/90 days/i)
  expect(f.RP6_censusRegeneratedByBattery).toMatch(/pure read/i)
  expect(f.RP7_lawCountShown).toMatch(/laws:16|sixteen laws/i)
})

test("REACH Phase 0 — the Halt is re-pinned a THIRD time, with TWO pens (IN2 + PUBLICATION) and the inaction-answers-the-question terminal clause", () => {
  const h = rp.haltRePinned
  expect(h.rule).toMatch(/RE-PINNED A THIRD TIME/i)
  expect(h.killCriterion).toBe("8b4e094b")
  expect(h.twoPens).toMatch(/IN2/i)
  expect(h.twoPens).toMatch(/PUBLICATION/i)
  expect(h.terminalClause).toMatch(/answered the kill-criterion's question BY INACTION/i)
})

test("REACH Phase 0 — the shed order is pinned (Phase 1 NEVER sheds; Phase 4 first) + the law-count observation (F-7: 16 · 5 · 0)", () => {
  expect(rp.shedOrder.order[0]).toMatch(/Phase 1.*NEVER sheds/i)
  expect(rp.shedOrder.order[1]).toMatch(/Phase 4.*sheds FIRST/i)
  const l = rp.lawsCountObservation
  expect(l.laws).toBe(16)
  expect(l.lawsMintedInLast5Sprints).toBe(5)
  expect(l.productCapabilityAddedInLast2Sprints).toBe(0)
})

test("REACH Phase 0 — walls S93-S99 are declared; count is 99; PART CLEAN pins the four pure functions; deps stay [hono, zod], screens the conscious 3", () => {
  expect(rp.walls.count).toBe(99)
  for (const s of ["S93", "S94", "S95", "S96", "S97", "S98", "S99"]) expect(rp.walls[s]).toBeTruthy()
  expect(rp.walls.S94).toMatch(/NEVER mocked/i)
  expect(rp.partClean.pureFns).toMatch(/Falsify\.census/)
  expect(rp.partClean.pureFns).toMatch(/Verify\.run/)
  expect(rp.partClean.pureFns).toMatch(/Reach\.fact/)
  expect(rp.partClean.pureFns).toMatch(/Rigor\.crossCheck/)
  expect(rp.carried.deps).toEqual(["hono", "zod"])
  expect(rp.carried.screens).toEqual(["shelf", "reality-check", "ask"])
})
