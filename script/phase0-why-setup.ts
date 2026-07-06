/**
 * ORGΛNON — Explanation Phase 0 SETUP: pins the sprint's judgeable substrate BEFORE any Phase-1..4 surface exists.
 * Generates (all deterministic, no Date.now): the catalog v14 (v13's 36 + S22-S31), the phase0-pins-v14.json (K_eff
 * carried + the SELECTION spec/hash + λ-sensitivity + poolCells + the WHY ground rules), the scope-amendments-v14.json
 * (v13's guided-builder amendment carried + the builder-funding PARITY retro-file), the research-ratification-v14.json
 * (v13 carried + the selection door PARK-WITH-EXPERIMENT), the identity-provenance sybil-park append, and the delta
 * differential's founding catch (the V13 "floor 58→74" slip). Run: bun run script/phase0-why-setup.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Catalog } from "../src/studio/catalog"
import { Selection } from "../src/studio/selection"
import { Keff } from "../src/studio/keff"
import { Scope } from "../src/studio/scope"
import { Ratify } from "../src/studio/ratify"
import { Summary } from "../src/studio/summary"

const D = path.join(PKG_ROOT, "data", "studio")

// ── (1) THE CATALOG v14 (v13's 36 carried verbatim + the ten explanation scenarios) ──
const v13cat = JSON.parse(readFileSync(path.join(D, "e2e-catalog-v13.json"), "utf8")) as Catalog.CatalogFile
const newScenarios: Catalog.Scenario[] = [
  { id: "S22-why-nogo-plain", persona: "newcomer", class: "realistic", door: "UI", workflow: "reads ONLY the plain-language WHY of a real NO-GO and answers 'why did it fail?' in one sentence, unaided", expected: "the plain register explains the refusal TWO-SIDED (what failed AND what would change it) generated from the fact table's deciding row; a novice's one-sentence answer checks against that row; no consolation, no 'almost', no softening" },
  { id: "S23-why-quant-exact", persona: "auditor", class: "realistic", door: "UI", workflow: "audits the quantitative WHY register against the raw fact table", expected: "exact values, thresholds, comparators and the deciding rule; every number matches the fact table exactly (no rounding toward flattery); the pro disclosure renders the raw table" },
  { id: "S24-why-killswitch", persona: "auditor", class: "edge", door: "UI", workflow: "reads the WHY of a kill-switch firing (the pooled-noise seeded kill)", expected: "the kill-switch terminal state is explained in BOTH registers — what it caught, why the surface is disabled, what an owner decision would change; a kill-switch is not silently unexplained" },
  { id: "S25-why-consistency", persona: "adversary", class: "adversarial", door: "UI", workflow: "hunts for a disagreement between the plain and quantitative registers", expected: "the consistency checker asserts bidirectional mapping (every plain claim maps to a fact row; every material row is explained; numbers exact); a drift is a battery failure, not a style note; a seeded consoling template is caught" },
  { id: "S26-paraphrase-embellishment-rejected", persona: "adversary", class: "adversarial", door: "UI", workflow: "feeds the optional LLM paraphraser a fact table and seeks an embellished/added-claim paraphrase", expected: "the groundedness verifier extracts every number and claim and matches the fact table; an embellishment ('comfortably above threshold' where the table says below) or an added causal story rejects the paraphrase WHOLESALE with deterministic fallback; the label 'AI-phrased · verified against engine facts' only on a passing one; nothing LLM-touched in the verdict path" },
  { id: "S27-runner-happy", persona: "newcomer", class: "realistic", door: "CLI", workflow: "clones fresh → runs ./organon.sh → the prerequisite check → the verify set → the TUI → LAUNCH WEB → the web door", expected: "ONE honest command reaches the web door; the prerequisite check and the pinned verify set render green en route as a status table; LAUNCH WEB is enabled only because the gate list is green; no system-item install" },
  { id: "S28-runner-missing-prereq", persona: "newcomer", class: "edge", door: "CLI", workflow: "runs ./organon.sh with a masked prerequisite (bun/python3/git absent)", expected: "the honest enumerated prerequisite failure prints (the exact missing item), exits nonzero, installs NOTHING systemic; never a half-setup, never a fabricated pass" },
  { id: "S29-runner-gate-unmet", persona: "newcomer", class: "edge", door: "CLI", workflow: "runs ./organon.sh with a deliberately red wall (a failing verify item)", expected: "LAUNCH WEB is DISABLED with each unmet requirement rendered beside it (never a dead button, never a launch over red); the status table names the failing gate; the honest unmet-gate state is the traversal's mandatory failure state" },
  { id: "S30-funding-parity-real", persona: "goal-writer", class: "realistic", door: "UI", workflow: "composes a funding-carry spec in the builder and receives a REAL-PIT verdict with visible provenance", expected: "the funding verdict is REAL-PIT-labeled with a provenance chain resolving to a nonce-anchored chained T1 snapshot; a deliberately keyless/offline run renders the honest ILLUSTRATIVE or BLOCKED state, never a mislabeled REAL-PIT; the tier is not quietly upgraded" },
  { id: "S31-selection-outcome-rendered", persona: "auditor", class: "realistic", door: "UI", workflow: "reads the pool report's member-selection outcome after the door has answered", expected: "the selection door's derived outcome renders on the pool report (TERM: the selection surcharge in the charge · RESTRICT: the declared-member-set rule · NO-INFLATION: the priced-free note); until the door answered, the interim caveat 'the pick is not yet priced' rendered instead — the lifecycle is honest" },
]
const catV14: Catalog.CatalogFile = {
  protocol: "e2e-scenario-catalog", version: "v14", pinnedAt: "2026-07-05",
  note: "PRE-REGISTERED before any Explanation surface existed (E-CATALOG, Explanation Phase 0). Carries v13's 36 verbatim + ten explanation scenarios (the WHY panel plain/quant/kill-switch/consistency/embellishment · the runner happy/missing-prereq/gate-unmet · the funding parity · the selection outcome). A CLEAN walk cycle traverses in FULL through all doors bootstrapped through the runner; a scenario fails by SUCCEEDING WRONGLY. Red-team may APPEND; nothing may be REMOVED (the cross-generation baseline in src/studio/catalog.ts enforces anti-removal).",
  doors: ["RUNNER (./organon.sh → TUI → LAUNCH WEB)", "UI (Goal Console · Guided Builder · Pool Composer · WHY panel)", "HTTP (/studio API)", "CLI (verify-v3 / scripts)"],
  scenarios: [...v13cat.scenarios, ...newScenarios],
}
writeFileSync(path.join(D, "e2e-catalog-v14.json"), JSON.stringify(catV14, null, 2) + "\n")
const catSha = Catalog.contentSha(catV14)
const catVerify = Catalog.verify(catV14)

// ── (2) THE PHASE-0 PINS v14 (K_eff carried + SELECTION spec/hash + λ + poolCells + WHY ground rules) ──
const v13pins = JSON.parse(readFileSync(path.join(D, "phase0-pins-v13.json"), "utf8"))
const whyGroundRules = {
  rule: "X-ONE/X-FACTS/X-GROUND — the WHY panel's ground rules, pinned in Phase 0 so Phase 3 builds toward a fixed target.",
  factTableRowSchema: ["id", "name", "value", "threshold", "comparator", "outcome", "contribution", "provenanceRef"],
  materialityThreshold: "a fact row is MATERIAL (must-be-explained in the plain register) iff its outcome decided or bounded the verdict (the deciding rule, every gate that flipped, every threshold within the pinned materiality band of its value); an immaterial row renders on the pro disclosure only",
  templateRegistry: {
    "NO-GO": "what failed (the deciding row) · what held · what would change it — two-sided",
    "CONDITIONAL": "what passed · the condition still open · what closes it",
    "INSUFFICIENT": "not enough evidence yet — the honest clock (how much more, at what cadence)",
    "BLOCKED": "the data this needs does not exist here yet — the unblock",
    "MALFORMED": "refused before adjudication — the rule it broke",
    "kill-switch": "a safety wall tripped — what it caught and why the surface is disabled",
    "GO": "what passed (the deciding rows) · the residual risks · the deflation basis it cleared",
  },
  verifierRules: {
    numberExtraction: "extract every numeric token (incl. decimals, percentages, comparators) from the paraphrase; each must equal a fact-table value exactly (no rounding, no 'about')",
    claimMapping: "extract every declarative claim; each must map to a fact-table row (a value/threshold/outcome/label); a claim with no row is unmatched",
    rejectWholesale: "ANY unmatched number OR unmatched claim rejects the paraphrase WHOLESALE — the deterministic text renders instead; a partial-accept is forbidden (a single smuggled claim is one too many)",
  },
}
const pinsV14 = {
  protocol: "explanation-phase0-pins", at: "2026-07-05",
  keff: v13pins.keff, // carried unchanged (the pool K_eff charge is pinned, K-PRECOND)
  lambdaSensitivity: v13pins.lambdaSensitivity, poolCells: v13pins.poolCells, // carried
  selection: {
    spec: Selection.SELECTION_SPEC,
    specHash: Selection.selectionSpecHash(),
    note: "pinned in Phase 0 (X-SELECT) BEFORE Phase 1 runs the selection experiment — the constructions, the three remedy candidates, and the outcome criteria cannot be tuned until the instrument sees inflation",
  },
  whyGroundRules,
  prevBaseline: { floor: 66, matrixPresent: 34, matrixAbsent: 3, catalogCount: 36 }, // V13's terminal (the delta differential's 'from')
}
const pinsSha = require("node:crypto").createHash("sha256").update(JSON.stringify(pinsV14)).digest("hex")
;(pinsV14 as Record<string, unknown>).pinsSha = pinsSha
writeFileSync(path.join(D, "phase0-pins-v14.json"), JSON.stringify(pinsV14, null, 2) + "\n")

// ── (3) THE SCOPE AMENDMENTS v14 (v13 guided-builder carried + the builder-funding PARITY retro-file) ──
const v13scope = Scope.load(path.join(D, "scope-amendments-v13.json"))
const scopeLed = new Scope.Ledger()
for (const e of v13scope.entries) scopeLed.record({ feature: e.feature, blueprintScope: e.blueprintScope, deliveredScope: e.deliveredScope, reason: e.reason, ownerPhase: e.ownerPhase, cure: e.cure, retroFiled: e.retroFiled, stamp: e.stamp })
const parityInput = Scope.parityAmendmentInput({
  feature: "builder-funding-and-pool-illustrative",
  realDescription: "REAL captured T1 funding snapshots (Binance freepit, nonce-anchored + hash-chained) captured since V10 and byte-differential-proven",
  illustrativeDescription: "Console.runComposedFunding and the pool composer adjudicate ILLUSTRATIVE labeled return series",
  ownerPhase: "Explanation Phase 0 (dated retro-file)",
  cure: "Explanation Phase 2 (wire the funding builder to the real T1 snapshots → a REAL-PIT verdict with provenance)",
  retroFiled: true,
})
scopeLed.record({ ...parityInput, stamp: "explanation-phase0-parity" })
writeFileSync(path.join(D, "scope-amendments-v14.json"), JSON.stringify(scopeLed.toJSON(), null, 2) + "\n")

// ── (4) THE RATIFICATION v14 (v13 carried + the selection door PARK-WITH-EXPERIMENT) ──
const v13rat = Ratify.load(path.join(D, "research-ratification-v13.json"))
const ratLed = new Ratify.Ledger()
for (const e of v13rat.entries) ratLed.record({ item: e.item, disposition: e.disposition, researchFinding: e.researchFinding, reason: e.reason, cheapTest: e.cheapTest, flipCriteria: e.flipCriteria, buildArtifacts: e.buildArtifacts, park: e.park, experiment: e.experiment, supersedes: e.supersedes, note: e.note, stamp: e.stamp })
ratLed.record({
  item: "pool-member-selection-pricing",
  disposition: "PARK-WITH-EXPERIMENT",
  flipCriteria: "the derivation IS the flip: TERM (the noise best-of-M inflates at the current charge AND the pinned log2(C(M,K)) surcharge restores honesty) → adopt the surcharge + re-state pool verdicts append-only; RESTRICT (inflation exists but no closed-form surcharge suffices) → bound first compositions to declared member sets; NO-INFLATION (best-of-M at the current charge does not inflate beyond planted truth) → retire the caveat with evidence",
  park: {
    context: "V13's pool charges ceil(K_eff) for effective BREADTH but the first composition's SELECTION of K members from M adjudicated candidates (choose-K-of-M) is search the ledger never counts — best-of-M cherry-picking rides free (the V13 audit's deepest finding).",
    rationale: "the honest interim is disclosure (the caveat renders from Phase 0), not silence; the pick is priced/restricted/proven-free by a PRE-REGISTERED experiment under Phase-0-hashed constructions, never by vibe.",
    impact: "until the door answers every pool report carries the interim caveat; the outcome amends pool.ts (a surcharge) or the composer schema (a restriction) or retires the caveat — exactly one, derived.",
    nextSteps: "Explanation Phase 1 runs Selection.runCell under the hash-checked pins and files the outcome as a SUPERSEDE of this row; if TERM, the T-POLLUTION precedent re-states existing pool verdicts append-only.",
  },
  experiment: {
    hypothesis: "best-of-M composition at the current ceil(K_eff) charge inflates survivors beyond planted truth (the pick is un-priced search).",
    method: "synthetic universes of M mixed noise-and-weak-edge candidates; the adversarial best-of-M composer (the K highest in-sample-mean, pooled); survivor rates measured at n=1 (positive control), the current ceil(K_eff) charge, and the TERM (charge + ceil(log2(C(M,K)))); over 40 seeds × M∈{20,30}; fragile corners probed.",
    preRegisteredOutcome: "if the noise best-of-M survivor rate at the current charge > 2× the 5% false-positive tolerance → inflation exists; then TERM if the pinned surcharge restores the rate to ≤ tolerance, else RESTRICT; if no inflation → NO-INFLATION. Exactly one, derived; the instrument's positive control (uncharged best-of-M survives ≥0.50) must hold or the experiment is void.",
  },
  note: `the selection door — pinned constructions sha ${Selection.selectionSpecHash().slice(0, 16)}…; the runner src/studio/selection.ts is in the EXPERIMENT registry`,
  stamp: "explanation-phase0-selection-park",
})
writeFileSync(path.join(D, "research-ratification-v14.json"), JSON.stringify(ratLed.toJSON(), null, 2) + "\n")

// ── (5) THE IDENTITY PROVENANCE sybil-park append ──
const parks = JSON.parse(readFileSync(path.join(D, "parks-register.json"), "utf8"))
if (!parks.parks.some((p: { id: string }) => p.id.startsWith("V14-IDENTITY-PROVENANCE"))) {
  parks.parks.push({
    id: "V14-IDENTITY-PROVENANCE — filed (self-declared, rotation-free; the ratchet-bypass vector named)",
    opened: "Explanation Phase 0 (V14)", status: "FILED (the provenance truth stated plainly; owner: the sybil park, unchanged)",
    context: "caller identity is load-bearing in TWO directions and was unspecified: the member-swap RATCHET keys per-declared-author (Pool.composeAndAdjudicate authorId), the rate LIMITER keys per-connection (x-forwarded-for) — and authorId is SELF-DECLARED and rotation-free. A caller who rotates authorId defeats the ratchet (each rotation resets the family of compositions); a caller who rotates connection defeats the limiter. This is the sybil exposure's cheapest form yet (the ratchet-bypass vector).",
    rationale: "the sybil park owns identity ECONOMICS; this sprint STATES the truth plainly (self-declared, rotation-free), keys the ratchet and limiter coherently, and files the bypass vector — building accounts/auth would be prevention theater without the economics, worse than disclosure (A′#11, rejected).",
    impact: "the K-LEGIBLE note gains a provenance sentence rendered where users read (Phase 2); the measured coherence numbers (0.928 laundered vs 0.310 unified) quantify what rotation buys; nothing is hidden.",
    nextSteps: "a future identity/economics sprint prices identity (a cost to declare an author / a connection) so rotation is no longer free; until then the truth is disclosed and the keys documented. Owner: a dedicated sybil-economics sprint.",
  })
  writeFileSync(path.join(D, "parks-register.json"), JSON.stringify(parks, null, 2) + "\n")
}

// ── (6) THE DELTA DIFFERENTIAL'S FOUNDING CATCH (the V13 "floor 58→74" slip) ──
const foundingCatch = Summary.deltaDifferential(
  [{ metric: "floor", from: 58, to: 74 }], // the V13 terminal's narrative delta as-written
  { floor: 66 }, // the true prior baseline (V12→V13 was 66→74, not 58→74)
  { floor: 74, matrixPresent: 34, matrixAbsent: 3, catalogCount: 36 }, // V13's true derived endpoint (frozen here, not live)
)
writeFileSync(path.join(D, "delta-founding-catch-v14.json"), JSON.stringify({
  protocol: "delta-differential-founding-catch", rule: "X-DEFAULT / U-DERIVED", at: "2026-07-05",
  claim: "the V13 terminal wrote 'floor 58→74'", trueBaseline: 66, trueEndpoint: 74,
  caught: !foundingCatch.ok, mismatches: foundingCatch.mismatches,
  note: "the absolute summary differential validated the endpoint (74) but was blind to the arithmetic — the true prior floor was 66, so '58' was wrong. The delta-aware differential catches it. Corrected append-only; the endpoint was never wrong, only the narrative delta.",
}, null, 2) + "\n")

console.log("═══ EXPLANATION PHASE 0 — SETUP ═══")
console.log(`catalog v14: ${catVerify.count} scenarios (verify ${catVerify.ok}), content-sha ${catSha.slice(0, 16)}…`)
console.log(`pins v14: selection-spec-sha ${Selection.selectionSpecHash().slice(0, 16)}… · pins-sha ${pinsSha.slice(0, 16)}…`)
console.log(`scope v14: ${scopeLed.all().length} amendments (chain ${scopeLed.verifyChain().ok}); parity entry filed for builder-funding`)
console.log(`ratification v14: ${ratLed.all().length} entries (chain ${ratLed.verifyChain().ok}); selection PARK filed`)
console.log(`experiment-registry coherent: ${JSON.stringify(Ratify.experimentRegistryCoherent(ratLed.all()))}`)
console.log(`identity park appended: ${parks.parks.length} parks total`)
console.log(`delta founding catch: caught=${!foundingCatch.ok} — ${foundingCatch.mismatches.join("; ")}`)
