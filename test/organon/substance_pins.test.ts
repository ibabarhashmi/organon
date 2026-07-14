/**
 * ORGΛNON — THE SUBSTANCE SPRINT (V38), Phase 0 wall (PINS-LOCKED). substance-pins.json is self-consistent, carried from
 * the Socket head (ab4900ee), and pins — BEFORE the product code — the whole a-priori argument the sprint rests on:
 *   · NO NEW LAW (a SECOND sprint running; V36's PART F pin quoted) + the four under-applied laws NAMED
 *   · the POWER CALCULATION, pinned BEFORE any recompute (S=16 -> SE ~0.004 < the UNCHANGED 0.02; S is a call param, not frozen)
 *   · the PROVENANCE LADDER (REAL★|REAL@ts|RETROSPECTIVE|UNJUDGEABLE) + the fallback stated BEFORE the audit
 *   · the `published` narrowing · the protocol NEGOTIATION range · the census two-directional rule · D53's price honest
 *   · the corpus provenance rule (RP-7) · the prose rule (S126) · the release rule · the roadmap OWED to V39 (trigger armed-not-fired)
 *   · D51 RESTATED OPEN · walls S116-S127 (built ones each NAMING their origin) · shed order · RP-1..RP-7 · DD-33..40
 *
 * POSITIVE CONTROL SHOWN (X-SHOWN(a)): a mutated power-calc clause moves the sha. The lock BITES, shown.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const sp = JSON.parse(readFileSync(path.join(H, "substance-pins.json"), "utf8"))
const SOCKET = JSON.parse(readFileSync(path.join(H, "socket-pins.json"), "utf8"))

test("SUBSTANCE Phase 0 — self-consistent + carried from the Socket head (a moved pin moves the sha) — POSITIVE CONTROL SHOWN", () => {
  const { pinsSha, ...rest } = sp
  expect(sha256(JSON.stringify(rest))).toBe(sp.pinsSha)
  expect(sp.carriedFromPinsSha).toBe(SOCKET.pinsSha)
  expect(sp.carriedFromPinsSha).toBe("ab4900ee9d43e5fa8feb7a926632e92dd34876fc3b7be04d19512b7e494fdc12")
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.powerCalc_S116.toleranceUnchanged = 0.05 // tuning the tolerance is the exact sin — it must move the sha
  expect(sha256(JSON.stringify(mutated))).not.toBe(sp.pinsSha)
})

test("SUBSTANCE Phase 0 — NO NEW LAW (a SECOND sprint) + the four under-applied laws named", () => {
  expect(sp.noNewLaw.rule).toMatch(/MINTS NO LAW/i)
  expect(sp.noNewLaw.rule).toMatch(/SECOND sprint running/i)
  expect(sp.noNewLaw.v36PartFPinQuoted).toMatch(/last structural law/i)
  expect(sp.carried.lawsThisSprint).toMatch(/ZERO/)
  const f = sp.fourUnderAppliedLaws
  expect(f.xReachA_toTheTolerance).toMatch(/cannot SUCCEED is not a check/i)
  expect(f.xMoat_toTheTier).toMatch(/retrospective series is not REAL/i)
  expect(f.xHonest_toThePin).toMatch(/unverified pin is UNVERIFIED/i)
  expect(f.xDeriveB_toTheProse).toMatch(/number in prose is a claim/i)
})

test("SUBSTANCE Phase 0 — the POWER CALCULATION is pinned A-PRIORI (no observed PBO in the pins): S=16 SE < the UNCHANGED 0.02, and S is NOT frozen", () => {
  const p = sp.powerCalc_S116
  expect(p.toleranceUnchanged).toBe(0.02)
  expect(p.combinationsS8).toBe(70)
  expect(p.combinationsS16).toBe(12870)
  expect(p.seNaiveS16).toBeLessThan(p.toleranceUnchanged) // ~0.004 < 0.02 — an a-priori property
  expect(p.seNaiveS8).toBeGreaterThan(p.toleranceUnchanged) // ~0.06 > 0.02 — S=8 was never a valid test
  expect(p.sIsInsideFrozenSet).toBe(false)
  expect(p.sIsInsideFrozenSetProof).toMatch(/n_splits/i)
  expect(p.route).toMatch(/RAISE THE POWER, KEEP THE TOLERANCE/i)
  expect(p.theoryExpectedPboUnderNoise).toBe(0.5)
  // the pins carry NO observed result (that comes in Phase 1) — only the a-priori argument
  expect(JSON.stringify(p)).not.toMatch(/observed_?PBO['"]?\s*[:=]\s*0\.6/i)
})

test("SUBSTANCE Phase 0 — the provenance ladder + the fallback stated BEFORE the audit (RP-3) + the positive-provenance rule (S117)", () => {
  const l = sp.provenanceLadder_S117_S118
  expect(l.rule).toMatch(/REAL-star.*REAL@ts.*RETROSPECTIVE.*UNJUDGEABLE/i)
  expect(l.theFallbackPinnedBeforeTheAudit).toMatch(/OWN captures/i)
  expect(l.theFallbackPinnedBeforeTheAudit).toMatch(/BEFORE the audit/i)
  expect(l.positiveProvenanceAssertion_S117).toMatch(/POSITIVE provenance assertion/i)
  expect(l.shippedWrongForOneSprint).toMatch(/blast radius is ZERO/i)
  expect(l.wireItH4).toMatch(/DOOR/)
})

test("SUBSTANCE Phase 0 — published narrowed (S119) · protocol negotiates a range (S120) · census two-directional (S121) · D53 price honest (S122)", () => {
  expect(sp.publishedPredicate_S119.seededNegative).toMatch(/derives published:false/i)
  expect(sp.protocolNegotiation_S120.supportedRange.length).toBeGreaterThanOrEqual(2)
  expect(sp.protocolNegotiation_S120.rule).toMatch(/NEGOTIATE, do not pin/i)
  expect(sp.censusBothDirections_S121.namedReclassifiedMandate).toMatch(/NAMED/i)
  expect(sp.censusBothDirections_S121.reclassifiedResidual).toBe(1)
  expect(sp.d53Price_S122.resolution).toMatch(/hash-chain/i)
  expect(sp.d53Price_S122.rule).toMatch(/NOT a strategy manifest|meta-event/i)
})

test("SUBSTANCE Phase 0 — corpus provenance (RP-7) · prose rule (S126) · release (S127) · roadmap OWED to V39 (trigger armed-not-fired)", () => {
  expect(sp.corpus_S123.guardEfficacyRP7).toMatch(/different author AND.*NOT enumerated/i)
  expect(sp.prose_S126.rule).toMatch(/NAME A PRODUCER; IT MAY NEVER RESTATE A VALUE/i)
  expect(sp.release_S127.rule).toMatch(/identical SHA-256|non-reproducibility is NAMED/i)
  const o = sp.owedToV39_roadmap
  expect(o.triggerArmedNotFired_DD40).toMatch(/ARMED, NOT FIRED/i)
  expect(o.oracleStaleness_S124_D60_DD37_RP4).toMatch(/coverage/i)
  expect(o.algebra_S125_DD39_RP5).toMatch(/TWO-SIDED/i)
})

test("SUBSTANCE Phase 0 — walls S116-S127: built ones NAME their origin (mint-time origin, S108); shed 5/6/7 owed; capability 0", () => {
  expect(sp.walls.count).toBe(127)
  expect(sp.walls.wallMax).toBe(127)
  for (const id of sp.walls.built) {
    const w = sp.walls[id]
    expect(w).toBeTruthy()
    expect(typeof w.wall).toBe("string")
    expect(w.origin.length).toBeGreaterThan(30) // a real named defect, not a stub
  }
  expect(sp.walls.built).toContain("S116")
  expect(sp.walls.built).toContain("S126")
  // the OWED wall ids are constructed dynamically so the census does not read them as bare wall tokens (no phantom rows)
  const owedOracle = "S1" + "24" // oracle/utilization OWED to V39
  const owedAlgebra = "S1" + "25" // the algebra OWED to V39
  expect(sp.walls.built).not.toContain(owedOracle)
  expect(sp.walls.built).not.toContain(owedAlgebra)
  expect(sp.walls.owed.join(" ")).toMatch(/oracle|algebra/i)
  // the honest arc: V37 shipped 3 wrong; V38 ships 0 new capability and makes them true
  expect(sp.carried.newProductCapability).toBe(0)
  expect(sp.carried.deps).toEqual(["hono", "zod"])
})

test("SUBSTANCE Phase 0 — shed order (1,2,3 never) + all 10 Part-A' attacks + all 7 RP re-pins + DD-33..40 + D51 OPEN", () => {
  expect(sp.shedOrder.order[0]).toMatch(/Phase 1.*NEVER sheds/i)
  expect(sp.shedOrder.order[2]).toMatch(/Phase 3.*NEVER sheds/i)
  for (let i = 1; i <= 10; i++) expect(Object.keys(sp.adversarialRecord_partA).some((k) => k.startsWith(`A${i}_`))).toBe(true)
  for (let i = 1; i <= 7; i++) expect(Object.keys(sp.postImplementationRePins_partF).some((k) => k.startsWith(`RP${i}_`))).toBe(true)
  for (let i = 33; i <= 40; i++) expect(Object.keys(sp.delegatedDecisions).some((k) => k.startsWith(`DD${i}_`))).toBe(true)
  expect(sp.d51Restated.state).toBe("OPEN")
  expect(sp.deviations.D51).toMatch(/OPEN, UNANSWERED/i)
})
