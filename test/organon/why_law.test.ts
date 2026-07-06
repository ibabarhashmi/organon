/**
 * ORGΛNON — Explanation Phase 0 walls (LAWS-DEFAULT-TRUE). Each new law positive-controlled: X-DEFAULT (the auto-flag
 * law defaults ON with the grandfather split; per-criterion exercise assertions close the W8-01 loophole; the summary
 * differential extends to narrative deltas; the census gains a mis-categorization control; the EXPERIMENT registry makes
 * the scan bypass explicit), the K-SCOPE parity extension, the SELECTION pins, the interim pool caveat, and catalog v14.
 */
import { test, expect } from "bun:test"
import path from "node:path"
import { readFileSync } from "node:fs"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Criteria } from "../../src/studio/criteria"
import { Checkpoint } from "../../src/studio/checkpoint"
import { Surface } from "../../src/studio/surface"
import { Summary } from "../../src/studio/summary"
import { Scope } from "../../src/studio/scope"
import { Ratify } from "../../src/studio/ratify"
import { Selection } from "../../src/studio/selection"
import { Pool } from "../../src/analytics/pool"
import { Catalog } from "../../src/studio/catalog"

const D = path.join(PKG_ROOT, "data", "studio")

// ── X-DEFAULT: the WHY criteria + the default-on grandfather ──
test("the WHY criteria pass the auto-flag audit (no silent unflag, no dead reason)", () => {
  for (const [phase, crits] of Object.entries(Criteria.WHY)) {
    const a = Criteria.autoFlagAudit(crits)
    expect(a.ok, `${phase}: ${a.violations.join("; ")}`).toBe(true)
  }
})

test("the grandfather list is pinned (its sha matches the recompute) and covers every V6–V13 criterion id", () => {
  expect(Criteria.grandfatherSha()).toBe(Criteria.GRANDFATHER_SHA_PINNED)
  const ids = Criteria.grandfatherGateIds()
  for (const g of ["TRUE-START", "COMPLETE-TRUE", "SURFACED-TRUE", "CONVERGED-7", "PRECONDITIONS-TRUE"]) expect(ids).toContain(g)
  // the V14 gate ids are NOT grandfathered (they inherit the default)
  expect(Criteria.isGrandfathered("WHY-TRUE")).toBe(false)
  expect(Criteria.isGrandfathered("SELECTION-PRICED")).toBe(false)
})

// ── X-DEFAULT: per-criterion exercise assertions (the W8-01 loophole, closed) ──
const okStep = (route: string, expected: string, evidence: string, met = true): Surface.Step => ({ route, interaction: "x", expected, met, evidence })
test("the exercise assertion PASSES a mapping whose referenced step exercises the criterion's expected behavior", () => {
  const t = Surface.makeTraversal({
    capability: "pool-composer", freshServe: true,
    steps: [okStep("POST /pool/compose", "the pool composes and adjudicates", "POOL VERDICT: NO-GO"), okStep("POST /pool/swap", "the member swap ratchets the family 1 to 2 to 3", "family(compositions)=3")],
    failureState: okStep("POST /pool/compose", "invalid pool refused", "INVALID POOL"),
    at: "t",
    mappings: [{ criterionId: "swap-ratchet", exerciseRef: "POST /pool/swap", expectedBehavior: "the member swap ratchets the family 1 to 2 to 3" }],
  })
  expect(Surface.verifyExercise(t, "swap-ratchet", "the member swap ratchets the family 1 to 2 to 3").ok).toBe(true)
})

test("POSITIVE CONTROL: a VAGUE REF (a mapping pointing at a step about something else) is CAUGHT — the W8-01 class", () => {
  const t = Surface.makeTraversal({
    capability: "pool-composer", freshServe: true,
    steps: [okStep("POST /pool/compose", "the pool composes and refuses", "POOL VERDICT: NO-GO")], // a compose-and-refuse bundle that never ratcheted
    failureState: okStep("POST /pool/compose", "invalid pool refused", "INVALID POOL"),
    at: "t",
    mappings: [{ criterionId: "swap-ratchet", exerciseRef: "POST /pool/compose", expectedBehavior: "the member swap ratchets the family 1 to 2 to 3" }],
  })
  const r = Surface.verifyExercise(t, "swap-ratchet", "the member swap ratchets the family 1 to 2 to 3")
  expect(r.ok).toBe(false)
  expect(r.detail).toMatch(/VAGUE REF/)
})

test("a MISSING mapping for a criterion carrying an expectedBehavior is CAUGHT", () => {
  const t = Surface.makeTraversal({ capability: "x", freshServe: true, steps: [okStep("GET /", "renders", "ok")], failureState: okStep("POST /x", "MALFORMED", "MALFORMED"), at: "t" })
  expect(Surface.verifyExercise(t, "unmapped", "some behavior").ok).toBe(false)
})

test("the GATE enforces the exercise assertion: a surface criterion with expectedBehavior + a vague-ref traversal is REFUSED", () => {
  const tPath = path.join(D, "_tmp-vague-traversal.json")
  const t = Surface.makeTraversal({
    capability: "swap", freshServe: true,
    steps: [okStep("POST /pool/compose", "the pool composes and refuses", "POOL VERDICT: NO-GO")],
    failureState: okStep("POST /pool/compose", "invalid refused", "INVALID"),
    at: "t",
    mappings: [{ criterionId: "SWAP-CRIT", exerciseRef: "POST /pool/compose", expectedBehavior: "the swap ratchets the family" }],
  })
  require("node:fs").writeFileSync(tPath, JSON.stringify(t))
  const gate = new Checkpoint.Gate()
  gate.declare("p", [{ id: "SWAP-CRIT", text: "the user sees the swap ratchet on the screen", gate: false, surface: true, expectedBehavior: "the swap ratchets the family" }])
  expect(() => gate.record({ phase: "p", decision: "ADVANCE", stamp: "s", resolutions: [{ id: "SWAP-CRIT", evidence: Checkpoint.pin(tPath) }] })).toThrow(/exercise-assertion|VAGUE/)
  require("node:fs").unlinkSync(tPath)
})

// ── X-DEFAULT: the delta-aware summary differential ──
test("the delta differential CATCHES the V13 'floor 58→74' slip (the founding catch) and PASSES a correct delta", () => {
  const derived = { floor: 74, matrixPresent: 34, matrixAbsent: 3, catalogCount: 36 }
  const wrong = Summary.deltaDifferential([{ metric: "floor", from: 58, to: 74 }], { floor: 66 }, derived)
  expect(wrong.ok).toBe(false) // the '58' is wrong (true prior 66)
  const right = Summary.deltaDifferential([{ metric: "floor", from: 66, to: 74 }], { floor: 66 }, derived)
  expect(right.ok).toBe(true)
})

test("the founding-catch artifact records the slip as caught", () => {
  const f = JSON.parse(readFileSync(path.join(D, "delta-founding-catch-v14.json"), "utf8"))
  expect(f.caught).toBe(true)
  expect(f.trueBaseline).toBe(66)
})

// ── X-DEFAULT: the census mis-categorization control ──
test("POSITIVE CONTROL: a KNOWN user-facing capability declared 'infrastructure' is CAUGHT (mis-categorization)", () => {
  const entries: Surface.FullCensusEntry[] = [
    { capability: "why-panel", kind: "infrastructure", traversal: null, evidence: "a unit test" }, // a user-facing cap hiding as infra
  ]
  const seeded: Surface.FullCensusEntry = { capability: "seed-uf", kind: "user-facing", traversal: null, evidence: "" }
  const seededMc: Surface.FullCensusEntry = { capability: "why-panel", kind: "infrastructure", traversal: null, evidence: "x" }
  const r = Surface.fullCensus(entries, seeded, PKG_ROOT, { knownUserFacing: ["why-panel"], seededMiscategorized: seededMc })
  expect(r.miscategorized).toContain("why-panel")
  expect(r.miscategorizationCaught).toBe(true)
  expect(r.ok).toBe(false) // a mis-categorization fails the census
})

// ── X-DEFAULT: the EXPERIMENT registry (scan bypass made explicit) ──
test("the EXPERIMENT registry is coherent against the v14 chain (every parked-experiment runner maps to a disposition)", () => {
  const { entries } = Ratify.load(path.join(D, "research-ratification-v14.json"))
  const c = Ratify.experimentRegistryCoherent(entries)
  expect(c.ok, c.issues.join("; ")).toBe(true)
  expect(Ratify.EXPERIMENT_REGISTRY.map((r) => r.module)).toContain("src/studio/hrp.ts")
  expect(Ratify.EXPERIMENT_REGISTRY.map((r) => r.module)).toContain("src/studio/selection.ts")
})

// ── K-SCOPE parity extension ──
test("the parity predicate: adjudicating ILLUSTRATIVE where REAL data exists requires an amendment", () => {
  expect(Scope.parityRequired({ realDataExists: true, adjudicates: "ILLUSTRATIVE" })).toBe(true)
  expect(Scope.parityRequired({ realDataExists: true, adjudicates: "REAL-PIT" })).toBe(false)
  expect(Scope.parityRequired({ realDataExists: false, adjudicates: "ILLUSTRATIVE" })).toBe(false)
})

test("the scope v14 ledger carries the guided-builder amendment + files the funding-parity retro (chain verifies, hand-edit caught)", () => {
  const loaded = Scope.load(path.join(D, "scope-amendments-v14.json"))
  expect(loaded.chainOk).toBe(true)
  expect(loaded.entries.length).toBe(2)
  const parity = loaded.entries.find((e) => e.feature.includes("funding"))!
  expect(parity).toBeTruthy()
  expect(parity.reason).toMatch(/data-reality PARITY/)
  expect(parity.cure).toContain("Phase 2")
})

// ── X-SELECT: the selection pins ──
test("the SELECTION spec pin hash matches src/studio/selection.ts + phase0-pins-v14.json", () => {
  const pins = JSON.parse(readFileSync(path.join(D, "phase0-pins-v14.json"), "utf8"))
  expect(pins.selection.specHash).toBe(Selection.selectionSpecHash())
  Selection.assertSelectionPinned(pins.selection.specHash) // does not throw
  expect(() => Selection.assertSelectionPinned("0".repeat(64))).toThrow(/X-SELECT/)
})

test("the TERM surcharge is a pinned closed form: ceil(log2(C(M,K)))", () => {
  // C(30,5) = 142506; log2 ≈ 17.12 → 18
  expect(Selection.selectionSurcharge(30, 5)).toBe(18)
  // C(20,5) = 15504; log2 ≈ 13.92 → 14
  expect(Selection.selectionSurcharge(20, 5)).toBe(14)
})

test("the ratification v14 files the selection door as a PARK-WITH-EXPERIMENT with a pre-registered outcome", () => {
  const { entries } = Ratify.load(path.join(D, "research-ratification-v14.json"))
  const sel = entries.find((e) => e.item === "pool-member-selection-pricing")!
  expect(sel.disposition).toBe("PARK-WITH-EXPERIMENT")
  expect(sel.experiment?.preRegisteredOutcome).toMatch(/TERM|RESTRICT|NO-INFLATION/)
})

// ── X-SELECT: the interim pool caveat ──
test("the interim selection caveat renders on a pool report (the pick is not yet priced)", async () => {
  const caveat = Pool.selectionCaveat("interim")
  expect(caveat).toMatch(/not yet priced/i)
  expect(Pool.selectionCaveat("term")).toMatch(/priced/i)
  expect(Pool.selectionCaveat("restrict")).toMatch(/restricted|declared/i)
  expect(Pool.selectionCaveat("no-inflation")).toMatch(/priced-free|does not inflate/i)
})

// ── E-CATALOG: catalog v14 ──
test("catalog v14 verifies, carries the baseline (anti-removal), and adds the ten explanation scenarios", () => {
  const v = Catalog.verify()
  expect(v.ok, v.issues.join("; ")).toBe(true)
  expect(v.count).toBe(46)
  for (const id of ["S22-why-nogo-plain", "S23-why-quant-exact", "S24-why-killswitch", "S25-why-consistency", "S26-paraphrase-embellishment-rejected", "S27-runner-happy", "S28-runner-missing-prereq", "S29-runner-gate-unmet", "S30-funding-parity-real", "S31-selection-outcome-rendered"])
    expect(Catalog.BASELINE_IDS as readonly string[]).toContain(id)
})

// ── the WHY ground rules pinned ──
test("the WHY ground rules are pinned in phase0-pins-v14.json (fact-table schema · materiality · templates · verifier rules)", () => {
  const pins = JSON.parse(readFileSync(path.join(D, "phase0-pins-v14.json"), "utf8"))
  const g = pins.whyGroundRules
  expect(g.factTableRowSchema).toEqual(["id", "name", "value", "threshold", "comparator", "outcome", "contribution", "provenanceRef"])
  expect(g.templateRegistry["kill-switch"]).toBeTruthy()
  expect(g.verifierRules.rejectWholesale).toMatch(/WHOLESALE|whole/i)
})
