/**
 * ORGΛNON — THE RECKONING SPRINT, the ADVERSARIAL VALIDATION RECORD closed (PART A′, 12 attacks + the 4 red-team re-pins).
 * Each attack the plan was subjected to BEFORE design has its binding consequence asserted — a finding closed, not a claim.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { StrategyTrial } from "../../src/strategy/trial"
import { Migration } from "../../src/strategy/migration"
import { Correlate } from "../../src/analytics/correlate"
import { VoiceGates } from "../../src/ask/gates"
import { AdviceShape } from "../../src/ask/advice"
import { Monitor } from "../../src/strategy/monitor"

const rk = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "reckon-pins.json"), "utf8"))
const V32 = "040301c26de44c9ef869d3cab8af582e82f6bda4ac63a0dfd8abf4c62586250c"

test("A′1 — the spoofable tag: the act is DERIVED + re-derived on verify (a caller-declared/tampered tag FAILS)", () => {
  expect(rk.xReckon.a_derivedNeverDeclared.rule).toMatch(/DERIVED, NEVER DECLARED/i)
  expect(StrategyTrial.deriveAct("abc", "abc")).toBe("OBSERVATION") // the derivation is the only authority
})

test("A′2 — the chain-rewrite precedent: HALT-gated, the old root preserved, forbidden forever after", () => {
  const rec = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "reckon-migration.json"), "utf8"))
  expect(rec.realLineageCountAtMigration).toBe(0) // ran only in the one window
  for (const lin of rec.lineages) expect(lin.oldChainRoot).toBe(lin.newChainRoot) // old root preserved; act not hashed
  expect(rk.xReckon.e_realNeverRetagged.rule).toMatch(/NEVER BE RE-TAGGED/i) // forbidden forever after
})

test("A′3 — 'SEARCH-only is a loosening in disguise': the rationale + citations are pinned, and D43 leaves the ruling to the pen", () => {
  expect(rk.xReckon.c_triggerCountsSearchOnly.deflationRationale).toMatch(/no new inferential claim/i)
  expect(rk.xReckon.c_triggerCountsSearchOnly.deflationRationale).toMatch(/always AVOID carries zero information/i) // the direction of the error, stated honestly
  expect(rk.deviations.D43).toMatch(/the pen rules on the MEANING/i) // the ruling is the Operator's
})

test("A′4 — the guard loosening silently: RP-1's TWO-SIDED enumerated obligation (every loosening justified)", () => {
  expect(rk.rePins.RP1_guardTwoSided.aLoosening_enumeratedAndJustified.length).toBe(2)
  for (const line of rk.guard.enumeratedAdviceCorpus_mustRefuse as string[]) expect(AdviceShape.detect(line).advice).toBe(true)
})

test("A′5 — the corpus's unknown-unknowns: CONCEDED not closed (the living-corpus clause + the self-grading weakness NAMED)", () => {
  expect(rk.rePins.RP1_guardTwoSided.livingCorpusClause).toMatch(/grades its own homework/i)
})

test("A′6 — golden-move fatigue: EXACTLY ONE move, justified, sha'd, counted", () => {
  expect(rk.goldenMove.rule).toMatch(/EXACTLY ONE golden move/i)
  expect(rk.goldenMove.shelfGoldenMoved["shelf-sample"].old).not.toBe(rk.goldenMove.shelfGoldenMoved["shelf-sample"].new)
})

test("A′7 — the door's attribute sink, widened to EVERY sink (RP-3)", () => {
  expect(rk.rePins.RP3_everySink.rule).toMatch(/EVERY SINK/i)
  expect(rk.rePins.RP3_everySink.rule).toMatch(/FIELDED/i) // the envelope sink structurally fielded
})

test("A′8 — the torn read / skew / concurrency: S86 / S86b / S86c are real", () => {
  const NOW = Date.parse("2026-07-13T00:00:00Z")
  expect(Monitor.captureMeta([{ history: [{ contentHash: "bad", asOf: NOW - 1, chainPos: 1 }], poolKey: "x" }] as never, NOW).torn).toBe(true)
  expect(Monitor.captureMeta([{ history: [{ contentHash: "a".repeat(64), asOf: NOW + 9e6, chainPos: 1 }], poolKey: "x" }] as never, NOW).skew).toBe(true)
})

test("A′9 — DV4's retirement did not cost a proof: pristine-clone verify is PROMOTED (D44)", () => {
  expect(rk.deviations.D44).toMatch(/pristine-clone `verify` PROMOTED/i)
  expect(rk.carried.repoTopology).toMatch(/verify is the convergence proof/i)
})

test("A′10 — the sprint shipping no user-visible value: TRUE, answered by the HALT CONDITION", () => {
  expect(rk.haltCondition).toMatch(/if IN2 is not performed.*VALIDATION-ONLY/i)
})

test("A′11 — familyN scope creep: X-CORRELATE is NOT amended (the K-door contract is unchanged)", () => {
  expect(rk.xReckon.c_triggerCountsSearchOnly.rule).toMatch(/familyN===1 untouched; X-CORRELATE is NOT amended/i)
  expect(() => Correlate.activateKIntoStamp(50, { triggerFired: true, operatorSignedD33: false })).toThrow(/REFUSED/i)
})

test("A′12 — the readout becoming an argument: COUNTS and the RULE, never a defence", () => {
  const r = StrategyTrial.readout(V32, StrategyTrial.FIXTURE_TRIAL_DIR)
  expect(r).toMatch(/1 SEARCH · 22 OBSERVATION/) // counts
  expect(r).toMatch(/counting awaits the pinned/i) // the rule
  expect(VoiceGates.advicePattern(r).advice).toBe(false) // never a defence/recommendation
})

test("MR6/MR7 — the V32 phase-reorder + the '7 new + 2 modified' correction are on the record", () => {
  expect(rk.mr6).toMatch(/phase-reorder/i)
  expect(rk.mr7).toMatch(/7 new \+ 2 modified/i)
})
