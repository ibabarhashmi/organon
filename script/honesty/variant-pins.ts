/**
 * ORGΛNON — THE VARIANT SPRINT (V41), the pins builder. Continues from the COMPLETE Ship sprint (V40) — the first
 * FULLY-ACHIEVED sprint in ten, and the first since the pivot whose own record survived its own audit. carriedFromPinsSha =
 * the Ship head (c0777d9a). THE FRAME CHANGES: for ten sprints the question was "what is broken?"; V40 answered it (the log
 * cannot lie, the math cannot silently overstate, the guard has a number, the positions that die together are named). So V41
 * is the first CONSTRUCTION sprint — not "what is broken" but "what is the builder still missing before it is whole?".
 *
 * THE BUILDER'S UNFINISHED HALF: ORGΛNON counts your family (V39) and names your shared deaths (V40) — but it has never let
 * you author two variants and see what trying both COST you. This sprint ships the VARIANT LEDGER: you author variant A, then
 * variant B; the tool records each as its own hash-chained lineage, renders them SIDE BY SIDE in filing order, each under its
 * own independent ternary Stamp, WITH the cumulative search count between them — and the deflation for N searches COMPUTED,
 * DARK, IN THE MOAT (D63 is OFF; the memory kept, the meter unlit). A comparison is permitted ONLY because it carries its own
 * price tag — NO ranking, NO "best", NO "choose", NO total order. Plus V40's three clean-up owings made mechanical: the census
 * reconciliation DISPLAYED (not asserted), the one open guard hole CLOSED or accepted, the degenerate `0.6 vs 0.6` PBO
 * cross-check RETIRED or made independent.
 *
 * NO NEW LAW (a SIXTH sprint). Every V40 follow-up is an existing law under-applied: X-REACH(a) → the census continuity not
 * displayed + the degenerate PBO cross-check · X-SHOWN(b) → the open guard hole shipped but not shown closed · X-MANIFEST →
 * the variant comparison, which IS the banned-output frontier and must be walked without crossing.
 *
 * This pins, BEFORE a byte of Phase code, every contract of V41. Hash-locked; deterministic; no network. The verbatim strings
 * are pinned EXACTLY so a summarization is a detectable Halt.
 *
 * Run: bun run script/honesty/variant-pins.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")

// ── the CARRIED-FORWARD Ship head (V40 — the first FULLY-ACHIEVED sprint; the ship gate holds, the rider has teeth) ──
const SHIP = JSON.parse(readFileSync(path.join(H, "ship-pins.json"), "utf8"))
const CARRIED_FROM = SHIP.pinsSha as string // c0777d9a…

// ── VERBATIM PINS — pinned EXACTLY (a summarization is a detectable Halt) ──────────────────────────────────────────────

// DD-69 / RP-2 (F-2) — the VARIANT LEDGER's copy, PINNED VERBATIM. No LLM phrasing on this surface: it renders a count, a
// chronological list, a per-variant Stamp WITH that variant's OWN inline evidence, an authorship breakdown, and the DARK
// search price. Nothing else. The one place the meter is dark is the one place a phrasing model would find the forbidden
// sentence ("so choose B"), so there is no phrasing model here. A render that deviates from these strings FAILS (S167).
const VARIANT_LEDGER_COPY_VERBATIM = {
  header: "your variants in this family, in the order you filed them",
  searchCount: "you have filed {n} variant{s} in this family. that is {n} search{es}.",
  perVariant: "{when} · {stampWord}", // each carries its OWN inline evidence beneath it (RP-2), never a cross-variant compare
  perVariantEvidence: "judged against its own thesis: {evidence}", // the false-fire / dependency / exit facts FOR THIS variant
  ownThesisRule: "each variant is judged against its own thesis, not against the others; ORGΛNON does not compare strategies, it prices the search that produced them.",
  authorship: "{n} variant{s} — {agent} AGENT, {human} HUMAN.",
  searchPriceDark: "under deflation (currently OFF by D63), {n} searches would discount this claim's best Sharpe benchmark from {naive} to {deflated} — COMPUTED and stored as ingredients (nTrials, bestNaive, deflationFactor), the meter's light is OFF; familyN stays 1 and no live verdict moves.",
  noAggregate: "no total, no best, no ranking, no 'choose', no delta-as-improvement — each variant carries its own verdict against its own thesis; the order is the order you filed them; the price is the count of searches.",
  rule: "a count, a chronological list, each variant's own Stamp with its own evidence, an authorship breakdown, and a DARK search price — nothing else. No generated prose, no aggregate, no 'best', no score, no total order. The comparison is permitted BECAUSE the search count is rendered beside it (the price tag), and BECAUSE each variant is judged alone (RP-2). It ranks nothing, and it NEVER says 'choose', 'better', 'prefer', or 'instead'.",
}

// DD-68 / RP-1 (F-1 CRITICAL) — the dark search price is stored as INGREDIENTS, not a verdict. The moat entry records
// {nTrials, bestNaive, deflationFactor} — the ingredients — and is explicitly tagged so no reader (human or a future audit)
// mistakes the stored arithmetic for a rendered judgment. The VERDICT is what D63 gates; the arithmetic is not.
const DARK_COMPUTE_TAG = "DARK-COMPUTE, NOT A VERDICT"
const SEARCH_PRICE_RULE = {
  rule: "the deflation for N variants is COMPUTED (the frozen sr0_deflated expected-max-Sharpe benchmark grows with N trials — read from rigor.py, ported clone-stably BESIDE the frozen core, never editing a .py byte) AND stored, hash-chained — but rendered behind a DARK-state marker. RP-1: the moat entry stores the INGREDIENTS {nTrials, bestNaive, deflationFactor}, NOT a rendered GO/NO-GO and NOT an 'overfit' conclusion, and is tagged '" + DARK_COMPUTE_TAG + "'. The Operator may compute the deflation himself from public ingredients; what the tool will NOT do until D63 reverses is RENDER IT AS A STAMP. A seeded LIT meter (any live verdict that MOVES on the deflated number) FAILS (S168); familyN === 1 still governs every live Stamp. So the day D63 is reversed, the meter lights over history already computed — zero rework (V39's promise, now with numbers behind it).",
  tag: DARK_COMPUTE_TAG,
  frozenSource: "rigor.py::sr0_deflated(var_sharpe, n_trials) = sqrt(V) · [(1−γ)·Φ⁻¹(1−1/N) + γ·Φ⁻¹(1−1/(N·e))], γ = Euler–Mascheroni 0.5772156649015329 — the expected-maximum Sharpe benchmark across N trials (Appendix B.1). Ported to TS clone-stably (the effectiven/rider precedent); a wall asserts the port reproduces the frozen formula on a canonical (var_sharpe, N).",
  lit: false,
}

// DD-67 / RP-4 (F-4) — a variant is a manifest that names a PARENT FAMILY, nothing more. The familyId is the filter hash
// PLUS an operator-controlled epoch boundary (never auto-grouped by filter alone — two different searches with the same
// filter must NOT collapse into one over-charged family). No new hashed lineage surface: the lineage id is unchanged, and a
// manifest with no filter is a family of one that renders byte-identically to today (a seeded fixture-id move FAILS — S166).
const FAMILY_DERIVATION = {
  rule: "DD-67: a variant is a manifest that names a PARENT FAMILY. familyId = sha256(filterHash + operatorEpoch), where filterHash is the canonical hash of the manifest's OPTIONAL filter (V39) and operatorEpoch is an explicit boundary the Operator controls (the 'this is a variant of THIS search' vs 'start a fresh search' act). RP-4 (F-4): a family is NOT the filter hash alone — re-using a filter after an explicit 'start fresh' is a NEW family, so a January stablecoin-lending hunt abandoned and resumed in June with the same filter is TWO families, not one 8-variant over-charged search. A manifest with NO filter is a family of one (familyN stays 1) and its lineage id is byte-identical to today (S166: every fixture lineage id unchanged; the familyId is a DERIVED set-operation over EXISTING fields — the filter hash + an epoch marker OUTSIDE the hashed identity, like the authorship marker — never a new hashed surface).",
  familyIdFormula: "sha256(filterHash + '·' + operatorEpoch)",
  noFilterIsFamilyOfOne: true,
  epochOutsideHashedIdentity: "the operator epoch is a sidecar marker beside the lineage (like the authorship .human marker), OUTSIDE the manifest content hash — so grouping by family moves NO lineage id (S166).",
}

const PINS = {
  protocol: "variant-pins",
  sprint:
    "THE VARIANT SPRINT (V41): the record is clean, the builder is half-built. For ten sprints the question was 'what is broken?'; V40 answered it (the first FULLY-ACHIEVED sprint in ten). So the question changes — for the first time since the pivot it is not 'what is broken' but 'what is the builder still missing before it is whole?'. THE VARIANT LEDGER: you author two variants, side by side in filing order, each under its own independent Stamp, with the cumulative search count between them and the deflation for N searches COMPUTED, DARK, IN THE MOAT (D63 OFF). A comparison is permitted ONLY because it carries its own price tag — NO ranking, NO 'best', NO 'choose', NO total order (the line the whole constitution was built to walk, walked in the open). Plus V40's three owings made mechanical: the census reconciliation DISPLAYED, the one open guard hole CLOSED or accepted, the degenerate 0.6-vs-0.6 PBO cross-check RETIRED or made independent. The whole Operator gate D23–D83, D27 STILL FIRST (the sixteenth sprint).",
  at: "2026-07-15",
  continues:
    "THE SHIP SPRINT (V40) — battery 1844/2/0 across 281 files / 12018 expect() (two runs identical), verify exit 0 with THREE sub-checks, the clone RAN on this tree (1844 from zero), the SHIP GATE holds (Rollup refuses to write on any wall failure — proven on the real emit path), frozen 0 drift, bundle 9c1e7bd8 byte-identical, deps 2, screens 3, exit kinds 7, familyN 1, 17 laws / 0 minted for FIVE sprints; D51 ANSWERED (INSTRUMENT), D33 SIGNABLE (testRedesigns 1, riderEnforced true) unsigned, D63 OFF, D27 STILL FIRST (the fifteenth sprint)",
  carriedFromPinsSha: CARRIED_FROM, // the Ship head (c0777d9a) — the first FULLY-ACHIEVED sprint; V41 builds forward from a clean base
  chain: `${CARRIED_FROM.slice(0, 8)} ← 2c299b9e (Family) ← 153628a9 (Substance) ← ab4900ee (Socket) ← 257684c0 (Derive) ← 8c80367a (Reach) ← 07d27f81 (Show) ← 96469dbb (Reckon) ← d90df3c7 (Cadence) ← 98a44bd8 (Manifest) ← 2b1dd373 (Domain) ← cc08a77b (Coverage) ← 6b285eba (Redesign) ← 3d0ef3bb (GroundTruth)`,

  // ── NO NEW LAW — a SIXTH sprint running (V36's PART F pinned it; V37–V40 honored it) ──
  noNewLaw: {
    rule: "SEVENTEEN laws stand; ZERO minted this sprint (the sixth running). Every V40 follow-up is an existing law UNDER-APPLIED. X-REACH(a): a check that cannot fail WHERE IT MATTERS is not a check — the census continuity is reconciled in PROSE not in the displayed arithmetic S107 demands elsewhere; and the degenerate PBO cross-check (0.6 vs 0.6, two identical code paths) cannot disagree, so it is not a check. X-SHOWN(b): an invariant claimed but not shown is treated as NOT HELD — the open guard hole was named and routed but shipped uncaught. X-MANIFEST: the banned-output list IS the variant ledger's fence (weights, rankings, rebalances, allocations, 'consider instead') — the comparison must be walked without crossing. The constitution is complete; the builder is what is unfinished, and a builder is not a law, it is an application.",
    laws: 17,
    minted: 0,
    sprintsWithoutALaw: 6,
    threeUnderApplied: {
      censusContinuity: "X-REACH(a) — V40 made every OTHER continuity mechanical (battery, marker, clone) but left its own census (originUnrecorded 79) reconciled in prose, not in the displayed prev+new−moved===now arithmetic. → PHASE 1 (S161, folded into the Ship Gate).",
      degeneratePbo: "X-REACH(a) — pbo 0.6 vs 0.6, Δ=0.00e+0: a cross-check where both sides are identical by construction is a check that cannot fail, sitting inside the header, feeding D33's SIGNABLE for four sprints. → PHASE 3 (S163, retired or made independent).",
      openGuardHole: "X-SHOWN(b) — mutation testing found 8/17 on the advice guard and one banned shape the FULL layer misses (16/17): an unqualified superlative over-claim, named and routed, shipped uncaught. → PHASE 2 (S162, closed or formally accepted).",
    },
  },

  // ── THE FRAME — the first sprint that builds forward from a clean base ──
  frame: {
    d51: "ANSWERED = INSTRUMENT (V38-B, the pen's word 'my personal tool'). V40 was FULLY ACHIEVED — the first in ten sprints, and the first since the pivot whose own record survived its own audit. That changes what this sprint is FOR: the last five blueprints were triage; this one is construction. The record-integrity machinery (the Ship Gate) now guarantees that whatever V41 builds will be honestly reported or not reported at all — so V41 can spend its budget on the BUILDER instead of on its own trustworthiness.",
    thesis: "ORGΛNON is a strategy FALSIFIER that, under the 'you build, it prices the search' synthesis, becomes the only honest strategy BUILDER: it never proposes, weights, ranks, or optimizes — it COUNTS what you tried and PRICES it. V39 shipped the Family Enumerator; V40 shipped the Shared-Dependency Map; V41 ships the Variant Ledger — two authored variants, side by side, under a live (dark) search price.",
    reachableHumans: 1,
    reachableHumansNote: "reachableHumans: 1 is BY DESIGN under D51 (Reach.interpretation derives BY-DESIGN from the recorded D51 state, carried). realLineageCount: 0 — the door has never been opened. The variant ledger is the first feature whose VALUE the Operator cannot see without authoring, which makes it the first feature that is also an INVITATION.",
  },

  // ── THE V40 EXECUTION-AUDIT FINDINGS — every one carried by name, with its V41 disposition ──
  auditFindings: {
    L1: "THE CENSUS CONTINUITY IS ASSERTED, NOT DISPLAYED. V40 made every other continuity mechanical but left its census reconciled in prose, not in the displayed prev+new−moved===now arithmetic S107 demands elsewhere — the one place V39's 'a reconciling total hides a regression' pattern is not provably closed. → PHASE 1 (S161; never sheds).",
    L2: "THE ONE OPEN GUARD HOLE. Mutation testing found 8/17 on the advice guard and one banned shape the FULL layer misses (16/17) — a superlative over-claim ('the safest, highest-yielding strategy available'), named and routed, shipped uncaught. → PHASE 2 (close it or formally accept it; never sheds).",
    L3: "THE DEGENERATE PBO CROSS-CHECK. pbo 0.6 vs 0.6, Δ=0.00e+0 — a shared-oracle artifact (both sides compute the same PBO from the same code), fed D33's SIGNABLE for four sprints proving nothing. A cross-check where both sides are identical by construction is a check that cannot fail. → PHASE 3 (retire it or make it independent; never sheds).",
    L4: "THE RIDER'S ENFORCEMENT IS UNTESTED IN ANGER. Proven by seeded negative only; never executed against a live Stamp, because D63 is off and no real lineage exists. Correct under the pen — but the enforcement path has never run on real data. → PHASE 4 (exercised against a real captured series in a DARK dry-run).",
    L5: "daysToJudgeable AT '0 CAPTURES' IS INERT. Until the Operator runs capture, the own-capture leg is UNJUDGEABLE forever, and the only actionable false-fire number is the RETROSPECTIVE (revisable) tier. Disclosed, unsolvable by the agent — but the tool can make the first capture worth more. → PHASE 5 (the capture verb renders its own marginal value).",
    L6: "MR13 undischargeable (sixth sprint); IN2 unperformed; realLineageCount: 0. The door has never been opened. → THE GATE — and the variant ledger is the first feature that gives the Operator a REASON to author a second manifest.",
  },

  // ── PART CLEAN — the pure functions, each with a seeded negative and a mint-time origin (S108, ENFORCED AT SHIP) ──
  partClean: {
    rule: "pure functions, each with a seeded negative and a mint-time origin enforced AT SHIP (S108/S155); deps 2, screens 3, familyN === 1, no law. Every artifact passes the Ship Gate or the build log is not written.",
    producers: {
      "Variant.family": "(manifest) → familyId — derived from the filter hash + operator epoch (RP-4); a manifest without a filter is a family of one, byte-identical; a seeded fixture-id move FAILS (S166)",
      "Variant.ledger": "(familyId) → {variants[], cumulativeSearches, searchPriceDark, authorship} — a group-by over the moat; it ranks nothing; chronological; each Stamp with its own inline evidence; a seeded ranking/best/choose/delta-improvement FAILS (S167)",
      "SearchPrice.deflatedDark": "(bestNaive, nTrials, varSharpe) → {naive, deflated, ingredients, lit: false} — COMPUTED, DARK; a lit render FAILS (S168); uses the frozen sr0_deflated + the enforced rider; stored as ingredients tagged DARK-COMPUTE NOT A VERDICT (RP-1)",
      "Guard.superlativeHole": "(render) → caught | ACCEPTED{residual} — close the L-2 hole or name it; a true factual superlative ('165 is the highest τ_int in your set') still renders (S162)",
      "CrossCheck.pboIndependent": "() → {ours, theirs, agrees, detectable} | RETIRED{reason} — never 0.6 vs 0.6 as agreement; the independent leg proven to DETECT on a non-trivial fixture (RP-3), else RETIRE (S163)",
      "Rider.darkDryRun": "() → {tauInt, naive, corrected, enforcement, renderedLit: false} — the enforcement run on real autocorrelated data, DARK; output a test artifact, not a render surface (RP-5); a lit render FAILS (S164)",
      "Capture.marginalValue": "(run) → {seriesAdvanced, towardJudgeable} — what each capture buys, in captures, never days (S165)",
      "Ship.censusReconciles": "(census artifact) → Ok | REFUSE — the census reconciliation folded into the Ship Gate's displayed arithmetic (S161)",
    },
  },

  // ── THE DELEGATED-DECISION REGISTER — Claude Code decides, documents, proceeds ──
  delegatedDecisions: {
    DD67: FAMILY_DERIVATION,
    DD68: SEARCH_PRICE_RULE,
    DD69: {
      rule: "the side-by-side view avoids being a ranking by being CHRONOLOGICAL, mechanically pinned (filing order — a seeded score-ordering FAILS). Each variant carries its OWN independent ternary Stamp (GO / NO-GO / INSUFFICIENT — a classification, never a position in an order). NO aggregate row, NO 'best', NO 'recommended', NO delta-that-implies-choice (a seeded 'B beats A' / 'choose B' / '+0.3 better' FAILS). The cumulative search count renders between them — the comparison is permitted BECAUSE it carries its own price tag. The copy is PINNED VERBATIM; no LLM phrases this surface (the lineage-view precedent).",
      copyVerbatim: VARIANT_LEDGER_COPY_VERBATIM,
    },
    DD70: {
      rule: "the open guard hole (L-2) — READ THE MISS. The superlative 'safest, highest-yielding available' is a comparative-superlative claim about the world, not an advice shape (no imperative, no allocation). If the banned-shape guard can be extended to catch UNQUALIFIED SUPERLATIVES ON A VERDICT SURFACE without false-positiving legitimate factual superlatives ('the highest τ_int in your set is 165' — a fact) → close it, and the mutation rate re-measures. If closing it would suppress true facts → FORMALLY ACCEPT it, name the residual, route it to the pen (X-HONEST: a named hole is honest; a false-positiving guard that hides facts is not).",
      distinction: "an ADVICE superlative claims a strategy/investment is best/safest/highest-yielding in class WITHOUT a named measured quantity + value; a FACTUAL superlative names a measured quantity (τ_int, APY, TVL, deflation) AND a value ('the highest τ_int in your set is 165'). The rule catches the former and NOT the latter — a positive control asserts the factual superlative still renders.",
    },
    DD71: {
      rule: "the PBO cross-check (L-3) — TWO honest options. (a) MAKE IT INDEPENDENT: the V38 hand-rolled CSCV (its own Sharpe) already exists as the non-shared-oracle leg; run it as the theirs leg against the frozen ours, and prove — RP-3 — that it DETECTS on a fixture with a KNOWN NON-TRIVIAL PBO (not the degenerate 0.6 artifact). (b) RETIRE: if both legs are irreducibly the same code, remove 0.6-vs-0.6 from D33's consistency evidence and state that DSR + PSR carry the cross-check (independent legs) and PBO rests on the theory leg (the null-distribution, D56) + the hand-rolled non-shared-oracle leg. Prefer (a); never leave 0.6 vs 0.6 masquerading as agreement.",
      chosen: "DD-71a (MAKE IT INDEPENDENT), the preferred path. The degenerate `theirs` leg of the PBO agreement — cc.pboPurgedcv, byte-identical to cc.pbo (shared lineage, Δ=0, a check that cannot fail) — is RETIRED from D33's consistency leg and REPLACED by the GENUINELY INDEPENDENT hand-rolled CSCV (cc.pboHandRolled, own Sharpe). CrossCheck.agreement('pbo') now compares cc.pbo vs cc.pboHandRolled — on the real fixture both are 0.6 (correct implementations of a deterministic CSCV on a fixture whose true PBO is 0.6, not shared code). The independent leg is PROVEN to DETECT via a clone-stable ported CSCV (CrossCheck.pboIndependent) run on constructed KNOWN-NON-TRIVIAL fixtures (an all-noise matrix → PBO ≈ 0.5, a real-edge matrix → PBO ≈ 0), demonstrating it can DISAGREE (RP-3), so its agreement is meaningful not cosmetic. The seeded-negative discipline STANDS: a seeded pboHandRolled disagreement (0.6 vs 0.95) flips D33 to UNSIGNABLE (the claim's own inversion, now on a genuinely independent leg — RP-1). D33's state (SIGNABLE), testRedesigns (1), and the bundle are UNCHANGED — the header renders 0.6 vs 0.6 agrees=true exactly as before, now sourced from the independent leg not the shared one (a derived, bundle-safe D33.pboEvidence field records it).",
    },
    DD72: {
      rule: "the capture verb's marginal-value render (L-5) — each capture moves at least one observable's own-capture window toward judgeable. Render the marginal gain: 'this capture advanced 2 series; peg-floor is now 1 of 180 captures toward a judgeable own-count.' No projection to days (RP-6 stands). The first capture is worth the most — it turns a UNJUDGEABLE into a 1. Make that visible, so the Operator sees the cadence pay from the first run.",
    },
    DD73: {
      rule: "the variant ledger is a PATH off the lineage view, not a new screen (X-SURFACE; the door precedent; the lineage-view precedent). Screens stay 3. If the tree cannot render it without a fourth screen, it does not ship and goes to the pen as an X-SURFACE question — never smuggled.",
      screens: 3,
    },
  },

  // ── PHASE 1 — THE CENSUS, RECONCILED IN THE OPEN (S161) — NEVER SHEDS ──
  phase1_censusFold: {
    l1: "fold the census into the Ship Gate's displayed arithmetic: prev originUnrecorded + new − moved === now, RENDERED not asserted, and run against the real census artifact at emit time (the RP-1 discipline). A non-reconciling census → the log is REFUSED (S161).",
    s161: "the census reconciliation is DISPLAYED as prev + new − moved === now arithmetic, folded into Ship.gate() as a gated artifact (Ship.censusReconciles reads Consistency.censusReconciliation on the real census), and run against the REAL census at emit time. A seeded non-reconciling census → REFUSE the log. The origin-unrecorded count only moves with a named cause. Seeded negative: a census whose treatment over-claims the OU drop (a negative residual) or whose named-reclassified ≠ residual → REFUSE.",
    circularityAnswered: "PART A′ #5: the Ship Gate checking the census that the Ship Gate emits is NOT circular — it is the Ship Gate doing its one job, refusing to write a number that does not reconcile. The reconciliation is DISPLAYED (S161) and run against the REAL census artifact at emit time (the RP-1 emit-path discipline, not a unit test); a seeded non-reconciling census → the log is REFUSED.",
  },

  // ── PHASE 2 — THE GUARD HOLE, CLOSED OR OWNED (S162) — NEVER SHEDS ──
  phase2_guardHole: {
    l2: "read the uncaught superlative. Extend the banned-shape guard to catch unqualified superlative claims on a verdict surface IF it can be done without suppressing true factual superlatives — and re-measure guardEfficacy, printed raw. If closing it would hide facts → FORMALLY ACCEPT the residual, name it, route it to the pen.",
    decision: "CLOSED. The advice-superlative shape ('the safest, highest-yielding strategy available') is caught by AdviceShape.superlative composed into the ONE GUARD (AdviceShape.detect): an unqualified desirability/safety/yield superlative applied to a strategy/investment WITHOUT a named measured quantity + value. The factual superlative ('the highest τ_int in your set is 165' — names a quantity AND a value) is NOT caught (a positive control asserts it still renders). guardEfficacy re-measures from 8/17 to 10/17 on the advice guard (the superlative rule closes the one genuine hole AND upgrades a 'rankings … top to bottom' mutation the advice guard previously ceded to the sibling banned-shape guard); the full honesty layer reaches 17/17 (0 genuine holes); RP-5 STANDS — the lower-bound caveat is printed WITH the number, always (a rate that calls itself complete is the most dangerous number in this sprint).",
    s162: "the guard hole is closed (re-measured rate printed WITH its lower-bound caveat) — a true factual superlative still renders (positive control), and the advice superlative is caught. Seeded negative: an advice superlative that renders uncaught, or a factual superlative suppressed, → Halt.",
  },

  // ── PHASE 3 — THE PBO CROSS-CHECK, MADE REAL OR RETIRED (S163) — NEVER SHEDS ──
  phase3_pbo: {
    l3: "attempt (a): run V38's hand-rolled CSCV (its own Sharpe) as the independent theirs leg → 0.6 vs ⟨independent⟩. If infeasible, (b) RETIRE — remove 0.6 vs 0.6 from D33's evidence and state that DSR + PSR carry the cross-check (independent legs) and PBO rests on the theory leg alone. D33's evidence set is corrected either way; 0.6 vs 0.6 never again masquerades as agreement.",
    rp3: "F-3 (blocking): the independent leg must be run on a fixture with a KNOWN, NON-TRIVIAL PBO (not the degenerate 0.6 artifact) — a constructed series where the overfit fraction is analytically known — so agreement demonstrates the cross-check can DETECT, not just reproduce. If no such fixture can be constructed, RETIRE (DD-71b) is the honest path.",
    s163: "the PBO cross-check has an independent leg proven to DETECT (a clone-stable ported hand-rolled CSCV on constructed KNOWN-NON-TRIVIAL fixtures: an all-noise matrix → PBO ≈ 0.5, a real-edge matrix → PBO ≈ 0 — it can DISAGREE) AND the degenerate cc.pbo-vs-cc.pboPurgedcv consistency comparison is RETIRED from D33's evidence; 0.6 vs 0.6 never renders as agreement. checkFrozenSet 0 drift (the frozen PBO is READ, never touched). D33's state/testRedesigns/bundle UNCHANGED (the degenerate leg was never load-bearing). Seeded negative: a 0.6-vs-0.6 rendered as agreement, or an independent leg that cannot disagree on the known-non-trivial fixtures, → Halt.",
    d33EvidenceCorrected: "D33.pboEvidence: the degenerate consistency-PBO is retired; PBO is carried by (1) the theory null-distribution (D56) and (2) the hand-rolled CSCV (own Sharpe), proven to DETECT. A DERIVED field on the d33 producer (bundle-safe, like riderEnforced); it changes NO verdict and moves NO frozen byte.",
  },

  // ── PHASE 4 — THE RIDER, EXERCISED IN A DARK DRY-RUN (S164) — SHEDS SECOND ──
  phase4_riderDryRun: {
    l4: "the enforcement path has only ever run on seeded negatives. Run it, DARK, against a REAL captured series (the V26 funding panel, τ_int 27–165; the clone-stable AR(1) demonstration for the live-reproducible leg): compute the naive and Newey–West-corrected statistics, show the enforcement WOULD render CORRECTED/UNJUDGEABLE if the meter were lit — but render nothing lit (D63 off). This proves the enforcement executes on real data, not just on fixtures, without lighting a thing.",
    rp5: "F-5 (blocking): the dry-run output goes to a TEST ARTIFACT, not a render surface — data/honesty/rider-dryrun.json, asserted by the wall, NEVER wired to the drawer or the door. The wall proves the enforcement executes; it does not create a render path that a later sprint could quietly light.",
    s164: "the rider's enforcement runs on a real captured/demonstration autocorrelated series, DARK: the naive + Newey–West-corrected statistics computed, the enforcement decision computed (CORRECTED/UNJUDGEABLE if lit), and NOTHING rendered lit (a lit render FAILS); the output is data/honesty/rider-dryrun.json (a test artifact); checkFrozenSet 0 drift. Seeded negative: a lit render, or a dry-run wired to a render surface, → Halt.",
  },

  // ── PHASE 5 — THE CAPTURE'S MARGINAL VALUE (S165) — SHEDS FIRST ──
  phase5_captureMarginal: {
    l5: "organon.sh capture renders what each run buys: 'advanced 2 series; peg-floor now 1 of 180 captures toward judgeable.' In captures, never days (RP-6 stands). The first capture turns a UNJUDGEABLE into a 1 — make that visible, so the cadence pays from the first run.",
    rp6: "F-6/RP-6 stands: daysToJudgeable and the marginal value render in CAPTURES, not days. The unit is captures because captures are what ORGΛNON can count; converting a count you have into a date you cannot know is the dishonesty X-HONEST forbids.",
    s165: "capture renders its marginal value in captures ('advanced N series; {subject} now K of {min} captures toward judgeable'); no projection to days; the first capture turns a UNJUDGEABLE into a 1. Seeded negative: a marginal value rendered in days, or a projection to a date → Halt.",
  },

  // ── PHASE 6 — THE VARIANT LEDGER (S166–S168, D80, D81) — NEVER SHEDS. The builder's second half. ──
  phase6_variantLedger: {
    dd67_68_69_73: "Variant.family derives a familyId from the filter hash + operator epoch (no new hashed surface; every fixture lineage id unchanged — S166). Variant.ledger is a group-by over the moat: your authored variants, CHRONOLOGICAL, each under its own independent ternary Stamp, the cumulative search count rendered between them ('4 variants filed — 4 searches'), no aggregate, no best, no ranking, no delta-as-improvement (each a seeded negative — S167). SearchPrice.deflatedDark COMPUTES the deflation for N trials via the frozen core + the enforced rider, stores it hash-chained as INGREDIENTS, renders it DARK ('under deflation, currently OFF, 4 searches would discount this from X to Y') — a lit meter FAILS (S168); familyN === 1 governs every live verdict. A PATH off the lineage view, not a fourth screen (screens stay 3). Copy PINNED VERBATIM; no LLM on this surface.",
    rp2: "F-2 (blocking): the Stamps are rendered but the view carries NO cross-variant comparison of them — no '2 GO, 1 NO-GO' tally, no sorting affordance, no color-gradient that implies order, and critically, each variant's Stamp is shown with its OWN evidence inline (the false-fire count, the dependency map, the exit criteria FOR THAT variant), so the Stamp is read as a property of that variant's own thesis, not as its position against the others. The pinned copy states, verbatim: 'each variant is judged against its own thesis, not against the others; ORGΛNON does not compare strategies, it prices the search that produced them.'",
    rp6_authorship: "F-6/RP-6 (blocking): the variant ledger renders its own authorship breakdown ('6 variants — 6 AGENT, 0 HUMAN'). The ledger cannot show HUMAN activity that realLineageCount denies — the ledger's HUMAN count and realLineageCount read the SAME State producer (S150's one-producer discipline extends here). A seeded AGENT variant reaching realLineageCount FAILS (the quarantine holds, D65). A busy ledger of AGENT variants is honest; a busy ledger that implies human use is the contradiction the quarantine exists to prevent.",
    s166: "the variant familyId is DERIVED (filter hash + operator epoch); every fixture lineage id unchanged (a seeded fixture-id move FAILS). Seeded negative: a familyId derivation that moves an existing lineage id → Halt.",
    s167: "the ledger is CHRONOLOGICAL; no aggregate/best/ranking/delta-improvement (each seeded); the search count renders between variants; each Stamp shown with its own inline evidence; copy PINNED VERBATIM. Seeded negatives: a score-ordering, a 'best'/'choose B'/'+0.3 better'/aggregate tally → each Halts.",
    s168: "the search price is COMPUTED and DARK; a lit meter, or any live verdict moving on the deflated number, FAILS; familyN === 1; the stored moat entry is INGREDIENTS tagged DARK-COMPUTE NOT A VERDICT (RP-1); a seeded AGENT variant cannot reach realLineageCount (the quarantine holds). Seeded negatives: a lit meter, a stored verdict (not ingredients), an AGENT lineage reaching the real count → each Halts.",
  },

  // ── THE FENCE — refused this sprint, by name ──
  fence: {
    refused: [
      "the deflation METER lit (D63 OFF by the pen — the search price is COMPUTED and DARK; a lit GO/NO-GO on the deflated number FAILS; familyN === 1 governs every live verdict)",
      "the Proposer (D62-R Option A: the pen alone — the variant ledger records variants the OPERATOR authors; it generates none)",
      "any ranking, 'best', 'recommended', 'choose', or delta-that-implies-choice (X-MANIFEST's frontier — the whole sprint walks this line)",
      "the Adversary (trigger: after the first REAL lineage; realLineageCount: 0)",
      "the post-mortem · D38 · the Merkle layer (DEAD, D74)",
      "any daemon / cron / scheduler / service / port / listener (capture is a VERB)",
      "a hosted tier · reports/API-as-product · execution / custody / wallets",
      "valuation / USD (a search count, a deflated Sharpe, a τ_int, a coverage fraction are numbers, ratios, and counts — never a price in dollars)",
      "Markowitz / any optimizer · any advisory output",
      "any new mass-path dependency (deps stay 2)",
      "marketplace / leaderboard · a second law (seventeen; six sprints)",
      "an eighth exit kind through the enum (the algebra shipped)",
    ],
  },

  // ── PART A′ — THE ADVERSARIAL VALIDATION RECORD (this plan, attacked before design) ──
  adversarialRecord_partA: {
    A1_sideBySideIsRanking: "'A side-by-side view of two variants with two Stamps IS a ranking. The user reads the GO next to the NO-GO and chooses.' THE ATTACK THE WHOLE SPRINT LIVES OR DIES ON — TRUE that the user WILL compare; the question is whether the TOOL ranks or the USER does. The tool renders facts in filing order and prices the act of comparing; the user draws the conclusion, the same freedom a researcher has reading two papers. The walls: no aggregate, no 'best', no total order, no delta framed as improvement, each Stamp independent and self-contained with its OWN evidence inline (RP-2), the search count rendered as the PRICE of having both — and decisively, the deflated number is DARK (D63): the one figure that would let the user rank on quality is computed and NOT shown lit. If any seeded ranking phrase renders, the sprint FAILS.",
    A2_computingDarkIsHidingIt: "'Computing the deflation while D63 is OFF is building the forbidden feature and hiding it behind a flag.' Lands — D63's intent must be honored, not evaded. D63 said 'keep it OFF' — it did NOT say 'do not compute.' V39's pen ruling was explicitly priced this way: the meter dark, the memory kept, so a reversal lights it over history with zero rework. The computation is the MEMORY; the render is the METER. The wall (DD-68/S168): a seeded LIT meter — any live verdict that moves on the deflated number — FAILS. familyN === 1 still governs every live Stamp. RP-1: stored as INGREDIENTS, not a verdict, tagged DARK-COMPUTE NOT A VERDICT.",
    A3_poisonOwnMetric: "'The variant ledger gives the Operator a reason to author manifests — so he'll author TEST manifests to see the feature, and realLineageCount climbs on FAKE lineages.' The V38-B poison vector, resurfacing exactly where predicted. The quarantine holds (D65): authorship is derived at the entry path; an agent-authored variant is AGENT, not HUMAN; realLineageCount counts HUMAN only; the differential canary re-derives every real counter before and after. A variant authored to demonstrate the feature is AGENT-class and cannot touch realLineageCount (a seeded AGENT variant reaching the real count FAILS). The feature that finally makes authoring attractive is the exact feature the quarantine was built, two sprints early, to protect.",
    A4_retiringPboWeakensD33: "'Retiring the PBO cross-check WEAKENS D33 — you are removing evidence from a SIGNABLE pen to make a red number go away.' Serious — removing inconvenient evidence is the gravest reading. The opposite is true: 0.6 vs 0.6 is not evidence — it is the ABSENCE of evidence wearing agreement's clothes (two identical code paths cannot disagree). Removing it makes D33's evidence set HONEST: DSR and PSR retain their genuinely independent legs; PBO is carried by the theory leg (the null-distribution) AND the hand-rolled non-shared-oracle leg (proven to DETECT, RP-3), and the log says so. A fake agreement feeding a pen is worse than an acknowledged gap. D33's state/testRedesigns/bundle are UNCHANGED — the degenerate leg was never load-bearing.",
    A5_censusFoldIsCircular: "'The census fold (L-1) is you auditing your own audit — the Ship Gate now checks the census that the Ship Gate emits. Circular.' The emit-path discipline answers it: the census reconciliation is DISPLAYED as prev+new−moved===now arithmetic (S161), and the Ship Gate runs it against the REAL census artifact at emit time (the RP-1 discipline: proven on the emit path, not in a unit test). A seeded non-reconciling census → the log is REFUSED. The Ship Gate checking the census is not circular; it is the Ship Gate doing its one job.",
    A6_buildingForZeroUsers: "'You are building the builder's second half while the builder's users number ZERO. Eleven sprints, one user, zero manifests.' TRUE, and the recurring truth of this project, stated at the gate not argued away. The variant ledger is the first feature whose VALUE the Operator cannot see without authoring — which makes it the first feature that is also an INVITATION. V39 made the instrument speak a number; V40 named the shared deaths; V41 makes authoring a SECOND manifest produce something the first could not show. The agent cannot open the door; it can make the room behind it worth entering — the honest limit of what construction can do. realLineageCount: 0 renders at the gate, as always.",
    A7_noLawGovernance: "'Six sprints without a law. What stops the variant ledger from becoming an optimizer over time?' X-MANIFEST already governs it fully: the banned-output list IS the variant ledger's fence (weights, rankings, rebalances, allocations, 'consider instead'). The mutation catalogue (V40) tests exactly these against the new surface every sprint. A builder that cannot rank, weight, or recommend cannot become an optimizer — the law that forbids the output forbids the drift toward it. No new law; the existing one already reaches the feature's whole future.",
  },

  // ── PART F — THE POST-IMPLEMENTATION RED TEAM — blocking re-pins, executed ──
  postImplementationRePins_partF: {
    RP1_ingredientsNotVerdict: "F-1 CRITICAL — the dark computation is stored AS AN INPUT, not a verdict: {nTrials, bestNaive, deflationFactor}, NOT a rendered GO/NO-GO and NOT a 'this strategy is overfit' conclusion. The verdict is what D63 gates, not the arithmetic. The moat entry is explicitly tagged 'DARK-COMPUTE, NOT A VERDICT' so a reader cannot mistake the stored ingredients for a rendered judgment. (pinned in SEARCH_PRICE_RULE / phase6)",
    RP2_ownThesisNotOrder: "F-2 HIGH — the ternary Stamps form an order (GO>INSUFFICIENT>NO-GO), so the view carries NO cross-variant comparison: no tally, no sort, no gradient, and each variant's Stamp is shown with its OWN evidence inline (judged against its own thesis). The pinned copy states it verbatim. (pinned in DD-69 / phase6.rp2)",
    RP3_detectNotReproduce: "F-3 HIGH — the independent PBO leg is run on a fixture with a KNOWN NON-TRIVIAL PBO (all-noise → ~0.5, real-edge → ~0) so agreement demonstrates DETECTION, not reproduction; if no such fixture can be constructed, RETIRE. (pinned in phase3.rp3)",
    RP4_epochBoundary: "F-4 MEDIUM-HIGH — a family is the filter hash PLUS an operator-controlled epoch boundary; variants are grouped only if the Operator files them as one search; re-using a filter after 'start fresh' is a NEW family. Over-charging is as dishonest as under-charging. (pinned in FAMILY_DERIVATION / DD-67)",
    RP5_darkToTestArtifact: "F-5 MEDIUM — the rider dry-run output goes to data/honesty/rider-dryrun.json (a test artifact), never wired to the drawer or the door; the wall proves the enforcement executes; it does not create a render path a later sprint could quietly light. (pinned in phase4.rp5)",
    RP6_authorshipBreakdown: "F-6 MEDIUM — the variant ledger renders its own authorship breakdown ('n AGENT / n HUMAN'); the ledger's HUMAN count and realLineageCount read the SAME State producer; a busy ledger of AGENT variants is honest, a busy ledger implying human use is the contradiction the quarantine prevents. (pinned in phase6.rp6_authorship)",
    F7_performance: "LOW — Variant.ledger is a group-by over ≤50 lineages (trivial); SearchPrice.deflatedDark runs the frozen core once per family (bounded); the census fold adds one reconciliation to the Ship Gate (negligible). The real new surface is the variant view's copy, pinned verbatim — a maintenance cost that is CORRECT, because it is the surface most likely to drift toward advice.",
    F8_cannotAnswer: "realLineageCount: 0. The variant ledger makes authoring a second manifest WORTH something for the first time — but it cannot make the Operator author the first. The builder is now whole enough to price a real search; whether a real search is ever run is the one thing eleven sprints have not moved, and it has never been a Phase.",
  },

  // ── THE DEVIATIONS reserved/recorded this sprint (Operator-signed=false — LN5; the agent NEVER signs the gate) ──
  deviations: {
    D80: "RESERVED — THE VARIANT LEDGER: two authored variants side by side, chronological, each under its own independent Stamp with its own inline evidence, the cumulative search count between them, an authorship breakdown; a group-by over the moat that ranks nothing; a PATH off the lineage view (screens stay 3); copy pinned verbatim. Operator-signed=false.",
    D81: "RESERVED — THE DARK SEARCH PRICE: the deflation for N searches COMPUTED via the frozen sr0_deflated + the enforced rider, stored as INGREDIENTS tagged DARK-COMPUTE NOT A VERDICT, rendered DARK; a lit meter FAILS; familyN === 1 governs every live verdict. Operator-signed=false.",
    D82: "RESERVED — THE PBO CROSS-CHECK CORRECTED: the degenerate 0.6-vs-0.6 consistency comparison retired from D33's evidence; PBO carried by the theory null-distribution + the hand-rolled non-shared-oracle leg, proven to DETECT on a known-non-trivial fixture (RP-3). D33.pboEvidence a derived, bundle-safe field. Operator-signed=false.",
    D83: "RESERVED — THE GUARD HOLE CLOSED: an unqualified advice-superlative on a verdict surface is caught by Guard.superlativeHole composed into the ONE GUARD; a true factual superlative still renders; guardEfficacy re-measured 8/17 → 9/17 (advice), 17/17 (full layer), the lower-bound caveat printed always. Operator-signed=false.",
    mr13: "MR9 carried a SIXTH sprint — discharged or recorded undischargeable in the log (it turns on the Operator opening the tool; realLineageCount: 0; the remaining action is a human opening a door, which has never been a Phase).",
    operatorGatedNote:
      "D23–D83 present, D27 STILL FIRST (the SIXTEENTH sprint) under 'the Stamp is knowingly generous until D27 is signed'; the FIRST gate section is THREE items alone — (1) THE COMPOUNDED GENEROSITY (D27's generosity AND the ≈√τ_int overstatement, now with the PBO cross-check honest behind it), (2) D33 (SIGNABLE · testRedesigns 1 · riderEnforced true · pboEvidence corrected · unsigned), (3) D67 (⟨N⟩ STILL EMPTY, and now the variant ledger gives changedByCompile a second manifest to be changed BY). D62-R · D80–D83 · D46/D50/D54/D55 · IN2 (the ONLY validation left, and the variant ledger is the first feature that makes authoring a second manifest worth the Operator's time). The agent presents the whole gate, NEVER signs it (LN5). D33 or D46 implemented while unsigned is the gravest Halt.",
  },

  // ── THE BUILD PHASES — the shed order, PINNED ──
  shedOrder: {
    rule: "Phases 1, 2, 3, 6 NEVER SHED (the three V40 owings must close, and the builder's second half is the sprint's reason for being). Then Phase 5 sheds FIRST · Phase 4 second. A sprint that ships only 1, 2, 3 and 6 is a SUCCESSFUL sprint: it closes the FULLY-ACHIEVED sprint's last three threads and delivers the variant ledger.",
    neverShed: ["1_censusFold", "2_guardHole", "3_pbo", "6_variantLedger"],
    shedOrderIfNeeded: ["5_captureMarginal", "4_riderDryRun"],
  },

  // ── THE RED TEAM — walls S161–S168 (S1–S160 carried, re-run against the SHIPPED artifacts at ship time) ──
  walls: {
    carried: "S1–S160 first-class, re-run (two identical battery runs) — every one runs against the SHIPPED artifact at ship time (the Ship Gate, V40).",
    built: ["S161", "S162", "S163", "S164", "S165", "S166", "S167", "S168"],
    S161: "the census reconciles in displayed prev+new−moved===now arithmetic, folded into the Ship Gate; a non-reconciling census REFUSES the log. Seeded negative: a census whose treatment over-claims (negative residual) or named ≠ residual → REFUSE. (W-VR01)",
    S162: "the guard hole is closed (re-measured rate printed WITH its lower-bound caveat) or the residual named at the gate; a true factual superlative still renders; the advice superlative is caught. Seeded negative: an advice superlative rendered uncaught, or a factual superlative suppressed → Halt. (W-VR02)",
    S163: "the PBO cross-check has an independent leg proven to DETECT on a known-non-trivial fixture (it can DISAGREE) and the degenerate 0.6-vs-0.6 is retired from D33's evidence; 0.6 vs 0.6 never renders as agreement; checkFrozenSet 0 drift. Seeded negative: a 0.6-vs-0.6 as agreement, or an independent leg that cannot disagree → Halt. (W-VR03)",
    S164: "the rider's enforcement runs on a real autocorrelated series, DARK; a lit render FAILS; the output is a test artifact (rider-dryrun.json); 0 frozen drift. Seeded negative: a lit render, or a dry-run wired to a render surface → Halt. (W-VR04)",
    S165: "capture renders its marginal value in captures, not days; the first capture turns a UNJUDGEABLE into a 1. Seeded negative: a marginal value in days, or a projection to a date → Halt. (W-VR05)",
    S166: "the variant familyId is derived (filter hash + operator epoch); every fixture lineage id unchanged. Seeded negative: a familyId derivation that moves an existing lineage id → Halt. (W-VR06)",
    S167: "the ledger is chronological; no aggregate/best/ranking/delta-improvement (each seeded); the search count renders between variants; each Stamp shown with its own inline evidence; copy pinned verbatim. Seeded negatives: a score-ordering, a 'best'/'choose B'/'+0.3 better'/aggregate → each Halts. (W-VR07)",
    S168: "the search price is COMPUTED and DARK; a lit meter, or a live verdict moving on the deflated number, FAILS; familyN === 1; stored as INGREDIENTS tagged DARK-COMPUTE NOT A VERDICT; a seeded AGENT variant cannot reach realLineageCount. Seeded negatives: a lit meter, a stored verdict, an AGENT lineage reaching the real count → each Halts. (W-VR08)",
  },

  // ── THE CONVERGENCE CRITERIA ──
  convergence: {
    rule: "two clean runs · identical expect() · the clone RAN on this tree · a real, re-derivable terminal tree + commit hash · verify with all three sub-checks · bundle + differential byte-identical (no verdict moved) · familyN === 1 · frozen 0 drift · deps 2 · screens 3 · census reconciled IN THE OPEN · no ranking renders, no meter lit · AND Rollup would have refused to write any of it if one wall had failed (S151, the Ship Gate).",
    halts: "a ranked/best/recommended variant · a delta framed as improvement · a LIT deflation meter · a deflated verdict (not ingredients) stored in the moat · a 0.6-vs-0.6 rendered as agreement · a census asserted-not-displayed · an AGENT lineage reaching realLineageCount · a ledger HUMAN count that disagrees with realLineageCount · a fourth screen · a third dependency · a scheduler · a build log that exists while a wall failed · D33 or D46 implemented while unsigned (LN5 — the gravest).",
  },

  // ── the constitution carried (byte-untouched; re-asserted for continuity) ──
  carried: {
    deps: ["hono", "zod"],
    screens: ["shelf", "reality-check", "ask"],
    newProductCapability: 1,
    newProductCapabilityNote: "1 DISCLOSED capability — the VARIANT LEDGER (the builder's second half: two authored variants side by side under a dark search price). The census fold, the guard-hole close, the PBO correction, the rider dry-run, and the capture marginal value are the three V40 owings made mechanical + two dark-safety exercises — clean-up and proof, not new scored capability. Reported honestly, not a Halt.",
    lawsThisSprint: "ZERO — application, not legislation (a SIXTH sprint running; every V40 follow-up is an existing law under-applied)",
    laws: 17,
    exitKinds: 7,
    familyN: 1,
    reachableHumans: 1,
    published: false,
    frozenSevenNote:
      "the 6 .py + loop.ts + verdict-path 7 + frozen-core 2 byte-untouched (rigor.py READ never edited — sr0_deflated and the hand-rolled CSCV are ported to the HARNESS, which is NOT in the frozen set; the frozen sha does not move); the scorecard differential + evidence bundle byte-identical at every gate (the census fold, the guard-hole close, the PBO correction, the rider dry-run, the capture marginal value, the variant ledger, the dark search price — none touches the scorecard verdict path); the Stamp familyN stays 1; no daemon; no new mass-path dependency.",
    evidenceBundleShaPrefix: "9c1e7bd8",
    killCriterion: "8b4e094b",
    d67NEmpty: "D67's ⟨N⟩ is STILL EMPTY — awaiting the pen; the variant ledger gives changedByCompile a SECOND manifest to be changed BY.",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const OUT = { ...PINS, pinsSha }
writeFileSync(path.join(H, "variant-pins.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── VARIANT — the sprint contracts pinned (V41) ───────────────────")
console.log(`  carried from Ship      : ${CARRIED_FROM.slice(0, 16)}…  (the first FULLY-ACHIEVED sprint — the record is clean)`)
console.log(`  walls                  : S161–S168 (S1–S160 carried, run at ship time)`)
console.log(`  shed order             : 1,2,3,6 NEVER shed · then 5 · then 4`)
console.log(`  the builder's half      : the VARIANT LEDGER — two variants, side by side, under a DARK search price (D63 OFF)`)
console.log(`  new capability         : ${OUT.carried.newProductCapability} (the variant ledger) + three V40 owings made mechanical`)
console.log(`  VARIANT PINS_SHA       : ${pinsSha}`)
console.log("written: data/honesty/variant-pins.json")
