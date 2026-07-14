/**
 * ORGΛNON — THE SOCKET SPRINT (V37), Phase 0 wall (PINS-LOCKED). socket-pins.json is self-consistent, carried from the
 * Derivation head (257684c0), and pins the D53 Halt-lift (Operator instruction VERBATIM · inference SEPARATE · strikeable ·
 * a SEARCH), D51 RESTATED OPEN, NO NEW LAW (V36's PART F pin quoted; D55), the Socket catalog (class R only), the false-fire
 * MODEL-FREE definition + min-history window, concentration-ceiling's dimensionless definition, the exit set CLOSED AT FIVE,
 * the mint-time origin requirement, the PBO theory expectation (pinned BEFORE it is computed, RP-7), walls S107-S115 (each
 * naming its origin), and the RP-1..RP-7 corrections — BEFORE the product code.
 *
 * POSITIVE CONTROL SHOWN (X-SHOWN(a)): a mutated D53 clause moves the sha. The lock BITES, shown.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const sp = JSON.parse(readFileSync(path.join(H, "socket-pins.json"), "utf8"))
const DERIVE = JSON.parse(readFileSync(path.join(H, "derive-pins.json"), "utf8"))

test("SOCKET Phase 0 — self-consistent + carried from the Derivation head (a moved pin moves the sha) — POSITIVE CONTROL SHOWN", () => {
  const { pinsSha, ...rest } = sp
  expect(sha256(JSON.stringify(rest))).toBe(sp.pinsSha)
  expect(sp.carriedFromPinsSha).toBe(DERIVE.pinsSha)
  expect(sp.carriedFromPinsSha).toBe("257684c09615d393cf3feb52a4b24db14c4a89deef8762f47ace7af1027b076a")
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.d53.operatorInstructionVerbatim = "tampered"
  expect(sha256(JSON.stringify(mutated))).not.toBe(sp.pinsSha)
})

test("SOCKET Phase 0 — D53: the Operator's instruction VERBATIM + the inference SEPARATE + strikeable + a SEARCH; D51 NOT answered (LN5)", () => {
  expect(sp.d53.operatorInstructionVerbatim).toBe("continue executing both the planned feature roadmap and issue resolution")
  expect(sp.d53.inferenceStatedSeparately).toMatch(/THE INFERENCE/i)
  expect(sp.d53.inferenceStatedSeparately).toMatch(/NOT a signature on D51/i)
  expect(sp.d53.d51NotAnswered).toMatch(/NOT MARKED ANSWERED/i)
  expect(sp.d53.strikeable).toMatch(/void/i)
  expect(sp.d53.priceInTheMoat).toMatch(/SEARCH/)
  expect(sp.d53.operatorSigned).toBe(false)
  // D51 stays OPEN in its original words — the agent does not answer it
  expect(sp.d51Restated.state).toBe("OPEN")
  expect(sp.deviations.D51).toMatch(/OPEN, UNANSWERED/i)
})

test("SOCKET Phase 0 — NO NEW LAW: V36's PART F pin is quoted as the reason; D55 is the disclosed fence correction", () => {
  expect(sp.noNewLaw.rule).toMatch(/MINTS NO LAW/i)
  expect(sp.noNewLaw.v36PartFPinQuoted).toMatch(/last structural law/i)
  expect(sp.carried.lawsThisSprint).toMatch(/ZERO/)
  expect(sp.d55.rule).toMatch(/what it needed was walls|FENCE CORRECTION/i)
})

test("SOCKET Phase 0 — the Socket catalog: stdio only, class R only, falsification-shaped names, Fact Envelope payload, honest limit verbatim, deps stay 2", () => {
  const c = sp.socketCatalog
  expect(c.transport).toMatch(/stdio/i)
  expect(c.transport).toMatch(/NO port, NO listener/i)
  expect(c.riskClasses).toMatch(/ONLY class R/i)
  expect(c.tools).toEqual(["check_yield_reality", "explain_verdict", "list_exit_criteria", "false_fire_count"])
  for (const t of c.tools) expect(t).not.toMatch(/should_i_|recommend_|rank_/)
  expect(c.honestLimitVerbatim).toMatch(/cannot bind the model reading this/i)
  expect(sp.carried.deps).toEqual(["hono", "zod"])
})

test("SOCKET Phase 0 — the false-fire fact is MODEL-FREE (a count, no σ/distribution/prediction) with a pinned min-history window (DD-29) + RP-2 point-in-time", () => {
  const f = sp.falseFire
  expect(f.rule).toMatch(/MODEL-FREE/i)
  expect(f.rule).toMatch(/no σ|no distribution|no prediction/i)
  expect(f.minHistoryWindow).toMatch(/180 days/)
  expect(f.rp2PointInTimeHonest).toMatch(/point-in-time-honest/i)
  expect(f.controls).toMatch(/ALTERNATIVE THRESHOLD FAILS/i)
})

test("SOCKET Phase 0 — concentration-ceiling is dimensionless (DD-27: size exists, no schema change); the exit set is CLOSED AT FIVE with the algebra trigger pinned", () => {
  expect(sp.concentrationCeiling.rule).toMatch(/A SHARE IS NOT A VALUE/i)
  expect(sp.concentrationCeiling.dd27SchemaHasSize).toMatch(/ALREADY carries `size`/i)
  expect(sp.exitSet.count).toBe(5)
  expect(sp.exitSet.kinds).toContain("concentration-ceiling")
  expect(sp.exitSet.algebraTrigger).toMatch(/7th|composed/i)
})

test("SOCKET Phase 0 — the PBO theory expectation is pinned BEFORE it is computed (RP-7): 0.5 under noise, and D33 is expected BACKWARD", () => {
  expect(sp.pboTheory.expectedPboUnderNoise).toBe(0.5)
  expect(sp.pboTheory.d33Consequence).toMatch(/PRECONDITION-MET-BY-CONSISTENCY-ONLY/)
  expect(sp.pboTheory.nonSharedOracle).toMatch(/hand-rolled|own Sharpe/i)
})

test("SOCKET Phase 0 — walls S107-S115 each NAME their originating defect (the mint-time origin requirement, S108)", () => {
  expect(sp.walls.count).toBe(115)
  expect(sp.walls.wallMax).toBe(115)
  for (let n = 107; n <= 115; n++) {
    const w = sp.walls[`S${n}`]
    expect(w).toBeTruthy()
    expect(typeof w.wall).toBe("string")
    expect(typeof w.origin).toBe("string")
    expect(w.origin.length).toBeGreaterThan(30) // a real named defect, not a stub
  }
  expect(sp.mintTimeOrigin.rule).toMatch(/NAME ITS ORIGINATING DEFECT IN THE PINS AT MINT TIME/i)
})

test("SOCKET Phase 0 — shed order (1,2 never; Socket first) + all ten Part-A' attacks + all seven RP re-pins + DD-25..32", () => {
  expect(sp.shedOrder.order[0]).toMatch(/Phase 1.*NEVER sheds/i)
  expect(sp.shedOrder.order[2]).toMatch(/Socket.*sheds FIRST/i)
  for (let i = 1; i <= 10; i++) expect(Object.keys(sp.adversarialRecord_partA).some((k) => k.startsWith(`A${i}_`))).toBe(true)
  for (let i = 1; i <= 7; i++) expect(Object.keys(sp.postImplementationRePins_partF).some((k) => k.startsWith(`RP${i}_`))).toBe(true)
  for (let i = 25; i <= 32; i++) expect(Object.keys(sp.delegatedDecisions).some((k) => k.startsWith(`DD${i}_`))).toBe(true)
  // capability is 3 — the FIRST non-zero in four sprints, and it is disclosed
  expect(sp.carried.newProductCapability).toBe(3)
})
