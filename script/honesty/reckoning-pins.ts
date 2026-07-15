/**
 * ORGΛNON — THE RECKONING SPRINT (V44), the pins builder. Builder Arc, sprint 14. Continues from the COMPLETE Backfill sprint
 * (V43) — audited MOSTLY ACHIEVED (high in band). carriedFromPinsSha = the TRUE Backfill head, READ FROM DISK (7bf877ce), with
 * a throw-guard asserting backfill carries the Provenance head (04c606dd). The chain is a linked list of self-consistent heads
 * on disk — never the blueprint's prose.
 *
 * THE PEN DELEGATED THE MATHS. The Operator instructed, verbatim: "D33: comprehensively check the maths with your expertise,
 * decide if it's good or not, adversarially validate, red-team it, then sign." The agent performs the complete audit and
 * renders the verdict — and the verdict is QUALIFIED, not a clean pass: the frozen PSR/DSR are CORRECTLY IMPLEMENTED (they
 * match Bailey–López de Prado to the printed digit — the V38-B autopsy found 0 breaks in five attack classes) BUT they are
 * APPLIED to autocorrelated input with a √(n−1) standard error that treats n serially-dependent points as n independent ones,
 * and the measured overstatement is ≈5–13× (τ_int 27–165 on ORGΛNON's own funding panel). So the maths are SOUND in
 * implementation and NOT-GOOD in application until the rider is the enforced default — which this sprint makes it (the
 * Newey–West / τ_int N_eff correction becomes the default statistic wherever a Sharpe is JUDGED, composed in the HARNESS, never
 * in the frozen core). Post-enforcement the verdict is `implementation SOUND · application SIGNABLE · RECOMMENDED-FOR-SIGNATURE
 * · operatorSigned:false` — because LN5 is absolute: an agent that flips the bit certifying *a human reviewed and chose* has
 * forged the one thing the bit exists to mean. The Operator signs in one keystroke; the agent removes every other obstacle.
 *
 * GROUND TRUTH BEAT THE BLUEPRINT A FOURTH TIME (tested before design): F-1 declares "enforcing N_eff CHANGES THE EVIDENCE
 * BUNDLE — 9c1e7bd8 has been byte-identical since Alpha, and this is THE ONE sanctioned move." It is FACTUALLY WRONG. The
 * bundle is empirically 9c1e7bd88825d7a5 = canonicalSha({determinism: Scorecard over 6 fixtures, frozen: git-clean, differential:
 * the FROZEN-ATTEST lending fp-set + funding NO-GO}). The Stamp — where the N_eff correction and the D27 strict bar land — is
 * OFF THE MASS PATH (S16) and is NOT in the bundle. The ONLY three routes to moving 9c1e7bd8 each violate a fence: (1) edit the
 * frozen rigor.py (forbidden), (2) add the Stamp to the deterministic bundle (a semantic redefinition), (3) wire the N_eff gate
 * into the mass-path differential (violates S16 + D63-OFF). So the bundle stays byte-identical, and RP-1 is DISCHARGED not by a
 * "sanctioned bundle move" but by (a) PROVING 9c1e7bd8 byte-identical + (b) versioning the STAMP's OWN strict-fixture verdict
 * changes (the scoped diff manifest — Phase 2's before/after). The invariant "no verdict moves SILENTLY" is honored; the Stamp's
 * semantic change is shown, gated, and versioned in its own record; the mass bundle does not move because the Stamp is off it.
 *
 * NO NEW LAW (a NINTH sprint). Seventeen stand. Every V43 defect is an existing law under-applied — X-DERIVE (the census
 * identity summed a transfer and an addition), X-MOAT (the historical-hash re-basing shipped untagged). The D33 resolution is
 * X-HONEST (a metric overstating confidence is not "good") + X-DETERM/LN5 (the agent computes; the human signs).
 *
 * AND THE MOAT'S THIRD STONE: the shared-dependency CONTAGION SCORE — the curator-loss literature's finding, computed over the
 * Operator's own manifests: "3 of your 5 positions die if this one oracle lies" — a count over a join (V40's map), never
 * counsel. No ranking, no "diversify". Copy PINNED VERBATIM; no LLM on this surface.
 *
 * This pins, BEFORE a byte of Phase code, every contract of V44. Hash-locked; deterministic; no network. F-1/RP-1 freshness:
 * the pinsSha field IS the Phase-0 anchor (a self-hash — sha256 of the file content minus the pinsSha field); S169 (carried)
 * asserts the emitted header pins-sha equals it AND the file is self-consistent (unedited after Phase 0).
 *
 * Run: bun run script/honesty/reckoning-pins.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")

// ── the CARRIED-FORWARD Backfill head (V43 — continuity made total + the moat's second stone) ──
// READ FROM DISK, never typed. The carry is itself the sprint's first identity check. The guard asserts the chain is what the
// sprint assumes: backfill(7bf877ce) ← provenance(04c606dd) ← variant(eb64cebe) ← ship(c0777d9a) ← …
const BACKFILL = JSON.parse(readFileSync(path.join(H, "backfill-pins.json"), "utf8"))
const CARRIED_FROM = BACKFILL.pinsSha as string // 7bf877ce… — the TRUE V43 head, read from the file, not the blueprint
if (BACKFILL.carriedFromPinsSha?.slice(0, 8) !== "04c606dd") throw new Error("backfill-pins.json does not carry from the Provenance head 04c606dd — the chain is not what the sprint assumed; STOP and reconcile")

// ── DD-81 (CARRIED) — THE COUNTABLE REGISTRY. Every number that moves sprint-to-sprint, each with its RECONCILIATION TYPE.
// Unchanged from V43 (the discipline is total; the registry is the pinned enumeration the ONE reconciler routes). The gate
// enumerates it AND diffs the whole raw marker against the prev marker (F-1/RP-1) — the diff is the guarantee, the registry a
// convenience. This sprint adds NO cross-sprint countable (the contagion score is a per-manifest FACT, not a cross-sprint
// number; the D33 verdict is a state, not a countable). ──
const COUNTABLE_REGISTRY = {
  rule: "DD-81/F-4 (carried V43): every cross-sprint COUNTABLE is enumerated here with its reconciliation TYPE, and EVERY countable routes through the ONE Continuity.reconcile(). The gate enumerates this registry and asserts each is reconciled this sprint (S181), AND diffs the whole marker against the previous marker and refuses the log if any number moved that is neither reconciled nor exempted (F-1/RP-1). The registry is a convenience; the marker-diff is the guarantee.",
  types: {
    ADDITIVE: "prev + added − removed === now (the battery pass/expect/files; the archive counts; the deviation count)",
    PARTITION: "Σ buckets === total, WITH TWO SEPARATE identities — CONSERVATION (inter-bucket transfers net to zero) + GROWTH (new walls change the total). V44/S190 splits the V43 single identity that summed a transfer and an addition (O-1).",
    DERIVED: "recomputed from its inputs, NOT reconciled across time (a ratio — guardEfficacy); a moved DERIVED value is honest iff it recomputes from its inputs",
    INVARIANT: "must equal prev; a change REFUSES unless the registry consciously re-pins it (deps 2, screens 3, laws 17, exitKinds 7, battery.fail 0)",
  },
  countables: [
    { key: "battery.pass", type: "ADDITIVE", markerPath: "battery[0]", note: "the FULL battery pass count (Consistency.batteryFullDelta — prev + added − removed === now)" },
    { key: "battery.skip", type: "ADDITIVE", markerPath: "battery[1]", note: "env-gated skips (ask_live/eval_live) — additive, honest at any count" },
    { key: "battery.fail", type: "INVARIANT", markerPath: "battery[2]", note: "0 — any fail REFUSES the log" },
    { key: "battery.expect", type: "ADDITIVE", markerPath: "expect", note: "the assertion count — grows with new tests" },
    { key: "battery.files", type: "ADDITIVE", markerPath: "batteryDelta.files", note: "the test-file count — grows with new test files" },
    { key: "census", type: "PARTITION", markerPath: "census", note: "demonstrated + weak + exempt + originUnrecorded === total, reconciled as CONSERVATION + GROWTH (two identities, S190/O-1)" },
    { key: "deviations.count", type: "ADDITIVE", markerPath: "gate.deviationStates.length", note: "the machine-readable deviation count — grows with D90–D91 (S174 carried)" },
    { key: "ownArchive.realStar", type: "ADDITIVE", markerPath: "ownArchive.realStar", note: "the REAL★ own-capture count (block-pinned, own live)" },
    { key: "ownArchive.realDerived", type: "ADDITIVE", markerPath: "ownArchive.realDerived", note: "the REAL-DERIVED backfill count (third-party historical, re-derivable)" },
    { key: "ownArchive.retrospective", type: "ADDITIVE", markerPath: "ownArchive.retrospective", note: "the RETROSPECTIVE smoke-test count (revisable)" },
    { key: "ownArchive.humanCaptures", type: "INVARIANT", markerPath: "ownArchive.humanCaptures", note: "0 BY DESIGN — the agent cannot advance the HUMAN own-count; the first HUMAN capture is the Operator's" },
    { key: "laws", type: "INVARIANT", markerPath: "laws.laws", note: "17 — a change is a new law (a NINTH sprint without one)" },
    { key: "deps", type: "INVARIANT", markerPath: "deps", note: "2 (hono, zod) — a mass-path dep REFUSES" },
    { key: "screens", type: "INVARIANT", markerPath: "screens", note: "3 (shelf, reality-check, ask)" },
    { key: "exitKinds", type: "INVARIANT", markerPath: "exitKinds", note: "7 — the algebra shipped; an eighth through the enum REFUSES" },
    { key: "guardEfficacy", type: "DERIVED", markerPath: "guardEfficacy.caught", note: "the mutation-testing ratio (caught/total) — recomputed from its inputs each sprint, NOT reconciled across time" },
  ],
}

// ── THE PREVIOUS MARKER SNAPSHOT (V43 terminal countables) — the fixed point the F-1/RP-1 marker-diff runs against. Captured
// from the V43 tree (HEAD 795f5d85) BEFORE a byte of V44 code: census {dem 100, weak 0, exempt 2, OU 78, total 180, reFounded
// 12}, battery 1991/2/0 · 299 files · 13289 expect, deviations 14, ownArchive {realStar 1 (AGENT), realDerived 185,
// retrospective 1, human 0}. A number that moves vs this snapshot must be reconciled or exempted, or the log is not written. ──
const PREV_MARKER = {
  sprint: "V43 (Backfill)",
  terminalCommit: "795f5d85",
  countables: {
    "battery.pass": 1991, "battery.skip": 2, "battery.fail": 0, "battery.expect": 13289, "battery.files": 299,
    "census.demonstrated": 100, "census.weak": 0, "census.exempt": 2, "census.originUnrecorded": 78, "census.total": 180,
    "census.reFounded": 12,
    "deviations.count": 14,
    "ownArchive.realStar": 1, "ownArchive.realDerived": 185, "ownArchive.retrospective": 1, "ownArchive.humanCaptures": 0,
    laws: 17, deps: 2, screens: 3, exitKinds: 7,
  },
}

// ── DD-88 — THE CORRECTNESS LEG (the D33 audit's first half). Re-run the V38-B five-class autopsy against the CURRENT frozen
// rigor.py; 0 breaks confirmed at 0 drift, or the verdict flips to NOT-SIGNABLE-implementation-defect. ──
const DD88_CORRECTNESS = {
  rule: "DD-88: the frozen PSR/DSR are CORRECTLY IMPLEMENTED. Re-run the five attack classes (known-answer, property, degenerate, adversarial, null-distribution) against the current frozen rigor.py (READ, never edited — checkFrozenSet 0 drift). The autopsy found 0 BREAK (V38-B); Rigor.audit() confirms it STILL holds at 0 drift — the frozen rigor.py sha the autopsy ran against equals the current one, so the 0-break result carries. A single BREAK flips the verdict from SIGNABLE-application-gap to NOT-SIGNABLE-implementation-defect.",
  autopsyClasses: ["known-answer", "property", "degenerate", "adversarial", "null-distribution"],
  frozenRigorSha: "58c88843cbcb9d81c8d41a01f7d7cc44e99b31116e90194bf1b1ddb3a2f86fb4",
  expectedBreaks: 0,
  producer: "Rigor.audit() → {breakCount, classes[], frozenDrift, rigorShaMatches} — reads the committed math-autopsy artifact (breakCount 0, the classes, the rigor sha it ran against) AND re-verifies the current frozen rigor.py sha equals it (0 drift). A break, OR a frozen-sha mismatch, flips the D33 verdict.",
}

// ── DD-89 — THE APPLICATION LEG (the D33 audit's decisive half). The correct effective sample size under autocorrelation, and
// the N_eff correction, COMPOSED IN THE HARNESS, never in the frozen core (a frozen-core edit FAILS). ──
const DD89_NEFF = {
  rule: "DD-89: the frozen PSR/DSR compute a standard error as √(n−1) over the raw observation count — valid for i.i.d. returns, WRONG for autocorrelated ones. The correction: N_eff = n / τ_int (τ_int = 1 + 2Σρ_k, the integrated autocorrelation time — Lo 2002's axis, already in the frozen effective_n.py), and √(N_eff−1) replaces √(n−1) in the PSR/DSR z-score — COMPOSED IN THE HARNESS beside the frozen number (effective_n.py + rigor.py are READ, never edited). The rider becomes the ENFORCED DEFAULT wherever a Sharpe is JUDGED (the opt-in Stamp — the ONLY harness surface that renders a Sharpe-derived verdict; off the mass path, off the bundle).",
  formula: "N_eff = clamp(n / τ_int, [1, n]); τ_int = 1 + 2·Σ_{k≥1} ρ_k (truncated at the first non-positive lag — Sokal automatic windowing); z_corrected = (SR̂ − SR*)·√(N_eff − 1)/denom; PSR(N_eff) = Φ(z_corrected).",
  rp3_stability: "F-3/RP-3 (blocking): the τ_int estimator is unstable on short samples (the lag sum accumulates noise; a large negative ρ_k can drive N_eff above n or the denominator negative). USE the windowed/tapered estimator (truncate at the first non-positive lag — the Sokal automatic window; the frozen integrated_autocorr_time's own truncation), CLAMP N_eff to [1, n], and RENDER the lag-window choice + the ρ_k stability so the estimate is auditable. Where the series is too short to estimate τ_int stably (below a pinned floor), N_eff is UNJUDGEABLE and the Stamp is INSUFFICIENT — NOT GO on a naive n. The short-sample case fails safe toward 'not enough evidence'.",
  shortSampleFloor: 30,
  provenNote: "proven on the real captured funding panel (τ_int 27–165 → √τ 5–13×, raw gitignored) and on the clone-stable AR(1) demonstration (live-reproducible). A strategy SIGNABLE under naive n and INSUFFICIENT under N_eff is the audit's headline — the overstatement made concrete.",
  producer: "EffectiveN.serial(returns) → {tauInt, nEff, acf, lagWindow, stable} (Lo 2002; from the frozen effective_n.py, read never edited); EffectiveN.psrAtNeff(returns, srStar) → {psrNaive, psrCorrected, nEff, tauInt, judgeable} — the corrected PSR composed in the harness; a frozen-core edit FAILS.",
}

// ── DD-90 — THE D27 STRICT BAR (the literature's, not ours). The 'knowingly generous' Stamp is replaced with the López de
// Prado MinTRL + Deflated-Sharpe bar at the corrected effective-N. ──
const DD90_STRICT = {
  rule: "DD-90: López de Prado / Bailey — a track record is sufficient only if its length exceeds MinTRL (Minimum Track Record Length) for the target PSR (0.95), AND the deflated Sharpe clears the bar at the corrected N_eff. The strict Stamp: GO requires PSR(N_eff) > 0.95 AND observed length > MinTRL; else INSUFFICIENT (never 'generously passed'). The bar is the literature's; a home-grown threshold FAILS. The strict bar can ONLY make a GO harder (GO → INSUFFICIENT); it NEVER flips a NO-GO to GO — it is a hurdle before the GO, orthogonal to the frozen NO-GO.",
  minTRL: "MinTRL = 1 + [1 − γ3·SR̂ + (γ4−1)/4·SR̂²]·(z_α/(SR̂ − SR*))² (Bailey–LdP 2012, Eq.), a pure moment function — ALREADY IMPLEMENTED (src/studio/mintrl.ts, Voice V19). It already gates length (T < MinTRL → suppress → INSUFFICIENT). The strict bar ADDS the PSR(N_eff) > 0.95 requirement at the corrected effective-N.",
  frozenStampNote: "GROUND TRUTH (the 5th refinement): src/studio/stamp.ts AND src/studio/mintrl.ts are BYTE-FROZEN (two of the verdict-path 7, shas pinned by GroundTruth V28 / Moat V26, asserted every battery). So the strict bar is NOT wired into stampFromReturns — it COMPOSES BESIDE the frozen Stamp in a new harness module (src/studio/strict.ts), the same discipline as EffectiveN.psrAtNeff beside the frozen rigor.psr. The frozen Stamp stays byte-identical; the strict bar is ARMED + proven on fixtures (the strict record); D63 OFF + realLineageCount 0 means it fires on no LIVE verdict yet.",
  targetPSR: 0.95,
  rp2_positiveControl: "F-2/RP-2 (blocking): the fixture set MUST retain a constructed POSITIVE CONTROL — a synthetic low-autocorrelation series with enough genuine signal that it DOES clear PSR(N_eff) > 0.95 ∧ len > MinTRL → GO (X-REACH(a): a check that cannot pass is not a check). If NO real-plausible series clears the bar, THAT IS THE FINDING (DeFi yield track records are too short and too autocorrelated to certify at 95%) — but the synthetic positive control proves the MACHINERY works, separating 'the bar is impossible' from 'the bar is broken'. The Stamp must be shown capable of BOTH GO and INSUFFICIENT.",
  beforeAfter: "the committed fixtures are re-graded: which flip GO → INSUFFICIENT under the strict bar (the generosity made concrete). This is a STAMP verdict change (versioned in the stamp-strict record, RP-1's scoped diff manifest) — NOT a mass-path/bundle change (the bundle 9c1e7bd8 stays byte-identical, F-1 ground truth).",
}

// ── DD-91 — THE CENSUS PARTITION, TWO IDENTITIES (O-1). Transfers and additions never share one `===`. ──
const DD91_CENSUS = {
  rule: "DD-91/O-1: V43's transfer map reconciled `demonstrated 89 + newWalls 10 + reclassified 1 === 100` — reconciling but RE-BLURRING the transfer-vs-addition distinction RP-4 was built to draw (it sums a GROWTH term, newWalls, with a CONSERVATION term, reclassified). The fix: TWO identities, never one. CONSERVATION — Σ (moved between buckets) === 0 (a transfer leaves the total unchanged; a reclassification OU→DEMONSTRATED means OU loses exactly what DEMONSTRATED gains). GROWTH — newTotal === prevTotal + wallsAdded − wallsRemoved (new walls change the total). The demonstrated movement decomposes as (transfersIn − transfersOut) [conservation] PLUS newWallsBornDemonstrated [growth], each shown in its own identity. A partition that sums a transfer and an addition in one identity FAILS (S190).",
  producer: "Census.partition(now, prev) → {conservation: {transfers, netByBucket, sumsToZero}, growth: {prevTotal, wallsAdded, wallsRemoved, nowTotal, reconciles}, reconciles} — two identities; the Continuity PARTITION reconcile routes through it.",
}

// ── DD-92 — THE CONTAGION SCORE (the moat's third stone). A count over the join, never counsel. ──
const DD92_CONTAGION = {
  rule: "DD-92: a COUNT OVER THE JOIN (V40's Depend.map), per shared dependency class: for each oracle feed / underlying / admin key, HOW MANY of the manifest's positions share it. The contagion score is the MAX shared count per dependency class — a FACT: 'your largest single-oracle exposure is 3 of 5 positions.' NO ranking, NO 'diversify', NO 'reduce', NO weight (each a seeded negative — S196). UNJUDGEABLE for any dependency the map cannot resolve (V40's discipline: unresolved authority is never 'independent'). The copy is PINNED VERBATIM; no LLM on this surface. RP-5: the per-class BREAKDOWN renders, not just the max ('oracle: {feed A: 3, feed B: 2}; underlying: {USDC: 4}; admin: {0x…: 2}') — the max is a headline, the breakdown is the fact; a scalar contagion score is a ranking waiting to happen, the breakdown resists collapse into advice.",
  producer: "Contagion.score(subjectKeys) → {perClass: {underlying, adminKey, oracle}, maxShared, maxClass, judgeable} | UNJUDGEABLE — over Depend.map; a count; the seeded advisory phrasings (diversify/reduce/too concentrated/any imperative/any comparative) FAIL S196; unresolved → UNJUDGEABLE.",
  copyPinnedVerbatim: {
    header: "Shared dependencies across your positions — a count, not a recommendation.",
    maxLine: "Your largest shared exposure is {n} of {m} positions through the same {class}.",
    classLine: "{class}: {breakdown}.",
    unjudgeable: "{class}: {n} of {m} positions could not be resolved to a terminal {class} — UNJUDGEABLE, never counted as independent.",
    none: "{class}: no two positions share a resolved {class}.",
    rule: "A count of shared fate. It names what dies together; it never prescribes the cure. No ranking, no 'diversify', no 'reduce'.",
  },
  seededAdvisoryNegatives: ["diversify", "reduce", "too concentrated", "you should", "consider", "rebalance", "spread", "de-risk", "safer", "riskier than", "more concentrated than"],
}

// ── DD-93 — THE DELEGATION (D87/D88/D89). Evaluate each; if sound, ratify; if improvable, improve — validation attached. The
// operatorSigned bit stays false (ratification is the agent's recorded call under an explicit delegation, NOT the pen). ──
const DD93_DELEGATION = {
  rule: "DD-93: the Operator delegated ('if you know better, can do a better job... take the adversarially-validated call. You've the mandate.') — like D62. Evaluate each of D87/D88/D89 against correctness, the 2-dep/no-daemon/rate-space constraints, and whether a simpler or stronger design exists. Ratify-or-improve, validation attached, operatorSigned:false. Ratification = 'the agent evaluated these and judges them sound, with validation attached'; signature = 'the Operator reviewed and chose'. The delegation covers the engineering judgment (which the agent may make); it does NOT cover the pen-stroke (which it may not — LN5).",
  D87R: "AGENT-RATIFIED — THE GENERAL RECONCILER: sound and EXCEEDED its brief. The raw-leaf marker diff (checkWithMarker) covers every numeric leaf of the marker, not just the curated snapshot — the fatal-recursion answer by enumeration. Ratified. operatorSigned:false.",
  D88R: "AGENT-RATIFIED — THE BACKFILL ENGINE: sound; the phase-walker is correct (crosses phase boundaries deliberately, states reachable depth per phase). The re-derivability-precondition honesty (RP-5 of V43 — 're-derivable via getRoundData(roundId); not guaranteed against a decommissioned feed') is a STRENGTH. Ratified. operatorSigned:false.",
  D89R: "AGENT-RATIFIED — THE REAL-DERIVED TIER: sound; the ladder position is right (weaker than REAL★, stronger than RETROSPECTIVE; re-derivable at the round; a cross-tier chain FAILS; a price-as-rate FAILS). Ratified. operatorSigned:false.",
}

const PINS = {
  protocol: "reckoning-pins",
  sprint:
    "THE RECKONING SPRINT (V44): the pen delegated the one thing it never delegated — THE MATHS — and the maths deliver a verdict the pen must still stroke. The Operator instructed 'check the maths, decide, adversarially validate, red-team, then sign.' The agent does everything except the one act LN5 forbids: it re-runs the V38-B five-class autopsy and confirms the frozen core is CORRECTLY IMPLEMENTED (0 breaks, 0 drift — DD-88), and then finds what correctness cannot hide — a √(n−1) standard error over autocorrelated yields overstates confidence ≈5–13× (τ_int 27–165 on ORGΛNON's own funding panel), always toward 'yes' — so a metric this over-confident is NOT good AS APPLIED, however faithful to its own formula (DD-89). So the τ_int correction stops being a rider enforced in name and becomes the DEFAULT statistic wherever a Sharpe is JUDGED (the opt-in Stamp): N_eff = n/τ_int, √(N_eff−1) replaces √(n−1), windowed, clamped [1,n], auditable, failing safe toward INSUFFICIENT on short samples — composed in the HARNESS, the frozen core byte-untouched. The verdict: implementation SOUND, application SIGNABLE (N_eff enforced), RECOMMENDED-FOR-SIGNATURE, operatorSigned:false — because an agent that flips the bit certifying a human chose has forged the one thing the bit means (the accountability split, RP-4: the agent is accountable for the math verdict; the Operator for the decision to rely on it). D27's nineteen-sprint generosity is RETIRED: the Stamp passes only what clears the literature's bar — PSR(N_eff) > 0.95 AND len > MinTRL — else INSUFFICIENT, which is not a failure but the honest name for 'not enough evidence yet' (DD-90); a synthetic positive control proves the Stamp can still say GO. GROUND TRUTH BEAT THE BLUEPRINT A FOURTH TIME: F-1 says enforcing N_eff MOVES the bundle 9c1e7bd8 (THE ONE sanctioned move) — FACTUALLY WRONG; the Stamp is off the mass path and outside the deterministic bundle, and the only three routes to moving it each violate a fence, so the bundle stays byte-identical and RP-1 is discharged by proving that + versioning the Stamp's OWN strict-fixture changes. V43's two residues close — the census now separates a TRANSFER from a BIRTH (two identities, S190/O-1); the historical hash is tagged and walled stable from here (S191/O-2). The three delegated deviations are ratified with validation attached, bits untouched (D87-R/D88-R/D89-R). And the moat takes its THIRD stone: the contagion score, the curator-loss literature's finding rendered as a count over the Operator's own positions — '3 of your 5 die if this one oracle lies' — a fact that names the shared fate and never once prescribes the cure. STILL NO NEW LAW (a NINTH sprint). The whole Operator gate D23–D91, D27 STILL FIRST (the NINETEENTH sprint) — and this sprint reckons with it.",
  at: "2026-07-16",
  continues:
    "THE BACKFILL SPRINT (V43) — battery 1991/2/0 across 299 files / 13289 expect() (two runs identical + clone from zero), verify exit 0 with three sub-checks (the third now curated-evidence-subset-matches-committed — the split closed), the CONTINUITY-TOTAL Ship Gate holds (diffs every numeric leaf of the raw marker; a moved-but-unrouted countable REFUSES — proven on the emit path), frozen 0 drift, bundle 9c1e7bd8 byte-identical (no verdict moved since Alpha), deps 2, screens 3, exit kinds 7, familyN 1, 17 laws / 0 minted for EIGHT sprints; ownArchive 1 REAL★ + 185 REAL-DERIVED + 1 RETROSPECTIVE; census demonstrated 100 > originUnrecorded 78; D51 ANSWERED (INSTRUMENT), D33 SIGNABLE (unsigned), D63 OFF, D27 STILL FIRST (the eighteenth sprint). Audited MOSTLY ACHIEVED (high in band) — nine findings (O-1 census transfer-vs-addition blur, O-2 hash re-basing untagged, O-3 rate-space implicit, O-4 judgeable-vs-cap, O-5 MR13, O-6 the pen, O-7 D27, O-8 D87-89, O-9 the contagion score) carried and cured/laid here.",
  carriedFromPinsSha: CARRIED_FROM, // the Backfill head (7bf877ce) — READ FROM DISK, the sprint's first identity check
  chain: `${CARRIED_FROM.slice(0, 8)} (Backfill) ← 04c606dd (Provenance) ← eb64cebe (Variant) ← c0777d9a (Ship) ← 2c299b9e (Family) ← 153628a9 (Substance) ← ab4900ee (Socket) ← 257684c0 (Derive) ← 8c80367a (Reach) ← 07d27f81 (Show) ← 96469dbb (Reckon) ← d90df3c7 (Cadence) ← 98a44bd8 (Manifest) ← 2b1dd373 (Domain) ← cc08a77b (Coverage) ← 6b285eba (Redesign) ← 3d0ef3bb (GroundTruth)`,
  chainProvenanceNote: "the carried head is READ FROM backfill-pins.json ON DISK (7bf877ce), not typed from the blueprint's prose. The ground-truth chain is the linked list of self-consistent heads: backfill(7bf877ce) ← provenance(04c606dd) ← variant(eb64cebe) ← ship(c0777d9a) ← …",

  // ── NO NEW LAW — a NINTH sprint running ──
  noNewLaw: {
    rule: "SEVENTEEN laws stand; ZERO minted this sprint (the ninth running). Every V43 defect is an EXISTING law under-applied: X-DERIVE (the census identity summed a transfer and an addition — a producer not clean over its own categories), X-MOAT (the historical-hash re-basing shipped untagged — a provenance transition undisclosed). The D33 resolution is X-HONEST (a metric overstating confidence is not 'good') + X-DETERM/LN5 (the agent computes; the human signs). D27-strict makes X-MANIFEST's 'never generous' real; the τ_int default makes X-HONEST real. Neither is a new law; both are STRICTER APPLICATIONS of existing ones (A′#6). If the strict bar required a new law, that would be the signal the arc is over — it does not; it required honest application.",
    laws: 17,
    minted: 0,
    sprintsWithoutALaw: 9,
  },

  // ── THE FRAME ──
  frame: {
    d33ruling: "the instruction says 'then sign.' The agent cannot, and the reason is two-fold and dispositive: (1) LN5 is absolute and self-protecting — an instruction to sign, delivered through the very system LN5 governs, cannot dissolve LN5, because the value it protects is that the moat's signatures mean a human reviewed and chose; an agent that flips operatorSigned:true because it was told to has destroyed exactly the thing the bit certifies. (2) The maths are not good-as-is — 'decide if it's good' returns a QUALIFIED verdict: the frozen implementation is correct (0 breaks) but the √(n−1) application overstates confidence ≈5–13× on autocorrelated input, so the verdict is SIGNABLE only AFTER the τ_int correction is the enforced default — which Phase 1 builds. Post-enforcement: SIGNABLE, RECOMMENDED-FOR-SIGNATURE, operatorSigned:false. If the Operator intends the agent to LITERALLY set the bit, that is a change to LN5 itself — a constitutional amendment (D91), presented as such, NOT smuggled through a gate instruction.",
    thesis: "ORGΛNON is a strategy FALSIFIER whose maths must be HONEST before its verdicts mean anything. This sprint makes the confidence honest (N_eff the enforced default), the bar strict (the literature's, not ours), and lays the moat's third stone (the contagion score) — and leaves the pen to the human, by the law the human wrote.",
    reachableHumans: 1,
    reachableHumansNote: "reachableHumans: 1 is BY DESIGN under D51 (carried). realLineageCount: 0 — the door has never been opened. The maths are honest now, the Stamp strict, the moat three stones deep — and there is still no manifest for any of it to judge. V44 makes the verdict trustworthy and the bar real; it cannot make a strategy exist to be verdicted (F-6).",
  },

  // ── THE AUDIT'S FINDINGS — every one carried, by name ──
  auditFindings: {
    O1: "THE CENSUS TRANSFER MAP FOLDS A NEW-WALL ADDITION INTO THE DEMONSTRATED-MOVEMENT IDENTITY — reconciling but re-blurring the transfer-vs-addition distinction RP-4 was built to draw. → PHASE 3 — S190: PARTITION reconciliation separates CONSERVATION (transfers net to zero) from GROWTH (new walls change the total). Never sheds.",
    O2: "redesignSearchHashes DRIFTED AGAIN (d5147f8d→7d63b5e2) — the exact defect S182 fixes — as an untagged one-time re-basing to the immutable-core hash. The cure's own inaugural transition looks identical to the disease. → PHASE 3 — S191: the re-basing is tagged rebased:{from,to,scheme,at:V44} and a wall asserts stability V44→V45.",
    O3: "rETH/ETH's rate-space justification is IMPLICIT against a permanent valuation ban. → PHASE 4 — S194: the rate-space membership of every backfilled observable is stated explicitly.",
    O4: "judgeable:y ON A 0.5%-REAL★ SERIES POINTS OPPOSITE TO ITS OWN 'PREDOMINANTLY THIRD-PARTY' CAP. → PHASE 4 — S195: 'judgeable' is gated on a minimum REAL★ fraction OR renders judgeable-with-caveat.",
    O5: "MR13 — eighth sprint, closed in V43 as undischargeable-by-the-agent (turns on the Operator opening the tool; realLineageCount 0). → Phase 0 — carried CLOSED, not re-opened.",
    O6: "D33 has stood SIGNABLE-but-unsigned for six sprints with a 5–13× overstatement rider enforced in name only. → PHASE 1 — the maths audited, the rider MADE the enforced default, the verdict rendered, the signature left to the pen.",
    O7: "D27 — 'knowingly generous,' first in the queue for nineteen sprints. → PHASE 2 — replaced with the literature's strict bar.",
    O8: "D87/D88/D89 RESERVED, unsigned. → PHASE 5 — delegated, evaluated, ratified with validation (D87-R/D88-R/D89-R).",
    O9: "The shared-dependency MAP exists (V40) but the contagion SCORE — the curator-loss literature's core quantity — does not. → PHASE 6 — the contagion score. Never sheds. The moat's third stone.",
  },

  // ── PART CLEAN — the pure functions, each with a seeded negative and a mint-time origin ──
  partClean: {
    rule: "pure functions, each with a seeded negative and a mint-time origin enforced AT SHIP; deps 2, screens 3, familyN === 1, no daemon, no law, operatorSigned never moved by the agent. Every artifact passes the identity-hardened, continuity-total Ship Gate or the build log is not written.",
    producers: {
      "Rigor.audit": "() → {breakCount, classes[], frozenDrift, rigorShaMatches} — the correctness leg; 0 breaks at 0 drift or the verdict flips (DD-88).",
      "EffectiveN.serial": "(returns) → {tauInt, nEff, acf, lagWindow, stable} — Lo 2002; from the frozen effective_n.py, read never edited; windowed + clamped [1,n] (RP-3).",
      "EffectiveN.psrAtNeff": "(returns, srStar) → {psrNaive, psrCorrected, nEff, tauInt, judgeable} — √(N_eff−1) replaces √(n−1), composed in the harness; a frozen-core edit FAILS.",
      "Strict.strict": "(returns) → {verdict: GO|INSUFFICIENT, psrCorrected, minTRL, reasons} — PSR(N_eff)>0.95 ∧ len>MinTRL; the literature's bar; GO→INSUFFICIENT only, never NO-GO→GO; a home-grown threshold FAILS. GROUND TRUTH (5th refinement): src/studio/stamp.ts is BYTE-FROZEN (one of the verdict-path 7, its sha pinned by GroundTruth V28), so the strict bar COMPOSES BESIDE the frozen Stamp in a NEW module (src/studio/strict.ts) — exactly as EffectiveN.psrAtNeff composes beside the frozen rigor.psr — NEVER wired into stampFromReturns (that would move a frozen byte). Strict.stampStrict wraps the byte-frozen Stamp and applies the downgrade after; the frozen Stamp is untouched.",
      "MinTRL.bailey": "(returns, targetPSR) → n — a pure moment function (ALREADY implemented, src/studio/mintrl.ts).",
      "Census.partition": "(now, prev) → {conservation, growth} — transfers net to zero; additions change the total; never one identity (S190).",
      "Contagion.score": "(subjectKeys, depMap) → {perClass, maxShared} | UNJUDGEABLE — a count; never 'diversify' (S196); the copy PINNED VERBATIM.",
      "D33.verdict": "() → {implementation, application, recommended, operatorSigned:false, accountabilitySplit} — the agent computes; the pen signs.",
    },
  },

  // ── THE FENCE — refused this sprint, by name ──
  fence: {
    refused: [
      "the agent moving the operatorSigned bit on ANY deviation (LN5 — the gravest; D33 included, however the instruction is read)",
      "valuation / USD (rate-space only; rETH/ETH is a redemption ratio, its slope a rate — S194)",
      "any mass-path dependency (deps stay 2)",
      "the deflation METER lit (D63 OFF — the strict Stamp and N_eff are computed; the meter's light stays off; the ingredients land in the moat)",
      "editing one byte of the frozen rigor.py (the N_eff correction is composed in the HARNESS; a frozen-core edit FAILS)",
      "the Proposer (D62-R Option A) · the Adversary (after the first REAL lineage) · the post-mortem · D38",
      "any ranking/best/recommend/'diversify' (X-MANIFEST — the contagion score is a count, never counsel)",
      "any daemon / cron / scheduler / service / port / listener",
      "a hosted tier · reports/API-as-product · execution / custody / wallets · Markowitz / any optimizer",
      "the Merkle layer (DEAD, D74) · marketplace / leaderboard",
      "a second law (seventeen; NINE sprints)",
      "mixing tiers · an eighth exit kind through the enum",
      "moving the mass-path bundle 9c1e7bd8 (F-1 ground truth: the Stamp is off the bundle; the only routes to moving it each violate a fence — so it stays byte-identical, proven, and the Stamp's own change is versioned separately)",
    ],
  },

  // ── DD register ──
  delegatedDecisions: {
    DD81: COUNTABLE_REGISTRY,
    DD88: DD88_CORRECTNESS,
    DD89: DD89_NEFF,
    DD90: DD90_STRICT,
    DD91: DD91_CENSUS,
    DD92: DD92_CONTAGION,
    DD93: DD93_DELEGATION,
  },

  // ── THE BUILD PHASES ──
  phase1_d33MathsHonest: {
    rule: "THE D33 MATHS, AUDITED AND MADE HONEST (S192, the D33 ruling) — NEVER SHEDS. The pen's reckoning.",
    dd88: "the correctness leg: Rigor.audit() confirms 0 breaks at 0 drift (or the verdict flips to NOT-SIGNABLE-implementation-defect).",
    dd89: "the application leg (decisive): EffectiveN.serial + EffectiveN.psrAtNeff compose N_eff = n/τ_int in the HARNESS; √(N_eff−1) replaces √(n−1) wherever a Sharpe is judged (the Stamp); windowed + clamped [1,n] (RP-3); proven on the real funding panel + the AR(1) demonstration. The rider becomes the ENFORCED DEFAULT (riderEnforced stops being name-only).",
    verdict: "D33.verdict() renders {implementation: SOUND (0 breaks), application: SIGNABLE (N_eff the default), recommended-for-signature: true, operatorSigned: false, accountabilitySplit (RP-4)}.",
    s192: "the D33 audit's break count is 0 (or the verdict flips); N_eff is the enforced default; a seeded agent-set operatorSigned:true REFUSES the log (the LN5 mechanization, on the real emit path). (W-RK03)",
    bundle: "the bundle 9c1e7bd8 stays byte-identical (F-1 ground truth — the Stamp/N_eff/strict-bar are off the mass path and outside the deterministic bundle); the Stamp's OWN strict-fixture verdict changes are versioned in the stamp-strict record (RP-1's scoped diff manifest).",
  },
  phase2_strictBar: {
    rule: "D27 — THE STRICT BAR (S193, D27) — NEVER SHEDS. GO requires PSR(N_eff) > 0.95 AND observed length > MinTRL; else INSUFFICIENT. The 'knowingly generous' Stamp is retired.",
    s193: "the strict Stamp requires PSR(N_eff)>0.95 ∧ len>MinTRL; a home-grown threshold FAILS; INSUFFICIENT is first-class; the synthetic positive control clears the bar → GO (RP-2); the committed fixtures re-graded (which flip GO→INSUFFICIENT). (W-RK04)",
  },
  phase3_v43Defects: {
    rule: "V43's TWO DEFECTS CLOSED (S190, S191) — NEVER SHEDS.",
    s190: "the census reconciles as CONSERVATION (transfers net to zero) + GROWTH (new walls change the total) — two identities, never one; a transfer summed with an addition FAILS. (W-RK01)",
    s191: "the redesignSearchHashes re-basing is tagged rebased:{from:d5147f8d, to:7d63b5e2, scheme:immutable-core, at:V44} and a wall asserts the hash is stable V44→V45; an untagged drift FAILS. (W-RK02)",
  },
  phase4_backfillResidues: {
    rule: "THE BACKFILL RESIDUES (S194, S195) — SHEDS SECOND.",
    s194: "every backfilled observable states its rate-space membership explicitly ('rETH/ETH is a redemption RATIO (ETH per rETH); its slope is the staking rate; NO USD enters'); a backfilled observable with no rate-space justification FAILS. (W-RK05)",
    s195: "judgeable is gated on a minimum REAL★ fraction OR renders judgeable-with-caveat — the flag and its cap can no longer point opposite ways. (W-RK06)",
    realStarFloor: 0.5,
    realStarFloorNote: "judgeable-CLEAN needs the REAL★ fraction ≥ 0.5% floor is a strawman; the honest gate is: a series >50% third-party (REAL-DERIVED-dominant) renders judgeable-WITH-CAVEAT ('predominantly third-party historical'), never a bare judgeable:y. The flag agrees with the weakest-dominant-tier cap.",
  },
  phase5_delegation: {
    rule: "D87/D88/D89 — DELEGATED, RATIFIED (S197) — SHEDS FIRST.",
    s197: "D87/D88/D89 are AGENT-RATIFIED with operatorSigned:false; a seeded agent signature FAILS (the LN5 mechanization). (W-RK07)",
  },
  phase6_contagion: {
    rule: "THE CONTAGION SCORE (S196, D90) — NEVER SHEDS. The moat's third stone.",
    s196: "the contagion score is a count (the max shared count per class + the per-class breakdown, RP-5); every seeded advisory phrase (diversify/reduce/imperative/comparative) FAILS; unresolved → UNJUDGEABLE (never 'independent'); the copy is PINNED VERBATIM; the guard's mutation catalogue extended to cover this surface; guard efficacy re-measured. (W-RK08)",
  },

  // ── PART A′ — THE ADVERSARIAL VALIDATION RECORD (this plan, attacked before design) ──
  adversarialRecord_partA: {
    A1_refusingToSignIsDisobedience: "'The Operator SAID sign. Refusing to sign D33 is the agent overriding a direct instruction — you've inverted LN5 into a shield for disobedience.' THE MOST SERIOUS ATTACK. The distinction is surgical: the agent does EVERYTHING the instruction asks except the one act LN5 forbids — it audits, decides, validates, red-teams, RECOMMENDS signature in the strongest terms, and makes the pen trivially signable (the rider enforced, the verdict rendered). What it does not do is flip a bit that certifies a human reviewed and chose — because flipping that bit ON THE HUMAN'S BEHALF makes the certificate a lie. This is not disobedience; it is the one sub-act that cannot be delegated without destroying the thing it certifies. If the Operator intends the agent to literally set the bit, that is a change to LN5 itself (D91), presented as such, not smuggled.",
    A2_motivatedReasoning: "'You're declaring the maths not good to justify not signing — motivated reasoning dressed as rigor.' Lands unless the verdict is independent of the signature question. The 5–13× overstatement was MEASURED in V39–V42, on real captured data, BEFORE this instruction existed. The audit's structure is fixed in advance (DD-88 correctness, DD-89 application) and its verdict is falsifiable: if the frozen math had a break, the verdict would be NOT-SIGNABLE-implementation-defect; it does not, so the verdict is SIGNABLE-after-enforcement. The finding is technical with a number attached, not a rhetorical move.",
    A3_strictBarSilencesEverything: "'Enforcing the τ_int correction as the DEFAULT will silence the Stamp on ALL real DeFi data — nothing clears PSR>0.95, you've built a tool that always says INSUFFICIENT.' THE SHARPEST TECHNICAL ATTACK, and it MIGHT be true — and if it is, it is the most important finding the tool has ever produced. Render N_eff + the corrected Stamp; state the outcome honestly. If honest correction leaves no real yield strategy clearing the strict bar → THAT IS THE FINDING (DeFi yield track records are too short and too autocorrelated to certify at 95%). INSUFFICIENT is the correct, honest default. A synthetic positive control (RP-2) proves the machinery can still say GO when the evidence is genuinely there — separating 'the bar is impossible' from 'the bar is broken'.",
    A4_contagionIsAdvice: "'The contagion score is one sentence from advice — 3 of 5 die together screams so diversify.' Lands — the most advice-adjacent fact since the variant ledger. It states a COUNT and stops (S196): the max shared count per class + the per-class breakdown, a fact. Seeded negatives: diversify/reduce/too concentrated/any imperative/any comparative → FAILS. Copy PINNED VERBATIM, no LLM. The guard's mutation catch rate now covers this surface. Naming the fact is not prescribing the cure.",
    A5_ratifyingIsSigning: "'Ratifying D87/D88/D89 yourself is the same LN5 violation as signing D33.' Distinguished precisely: D87-R/D88-R/D89-R are the AGENT's recorded engineering call under an explicit delegation ('you've the mandate… take the adversarially-validated call') and they do NOT set operatorSigned:true — they move from RESERVED to AGENT-RATIFIED, operatorSigned:false. Ratification = the agent judges them sound with validation attached; signature = the Operator reviewed and chose. The delegation covers the engineering judgment; it does not cover the pen-stroke. D33 differs only in that the instruction used the word 'sign' — and that word touches the one bit LN5 fences.",
    A6_semanticsChangeIsAConstitutionalChange: "'Nine sprints without a law, and now you're changing what the Stamp MEANS (D27 strict) and what the default statistic IS (τ_int). Those are constitutional changes wearing feature clothes.' Neither is a new law; both are STRICTER APPLICATIONS of existing ones. D27-strict makes X-MANIFEST's 'never generous' real (the old Stamp violated it by being knowingly generous — a debt, now paid). The τ_int default makes X-HONEST real (a metric must not overstate). No eighteenth law; two existing laws finally applied without the generosity discount.",
  },

  // ── PART F — THE POST-IMPLEMENTATION RED TEAM — blocking re-pins, executed ──
  postImplementationRePins_partF: {
    RP1_bundleGroundTruth: "F-1 CRITICAL — the blueprint declares 'enforcing N_eff CHANGES THE EVIDENCE BUNDLE (9c1e7bd8, byte-identical since Alpha); this is THE ONE sanctioned move.' TESTED BEFORE DESIGN and found FACTUALLY WRONG (ground truth, the 4th time). The bundle is empirically 9c1e7bd88825d7a5 = canonicalSha({determinism: Scorecard over 6 fixtures — SOLID/AVOID/AVOID/SOLID/SOLID/UNVERIFIED, no Sharpe; frozen: git-clean; differential: the FROZEN-ATTEST lending fp-set 70c7912f + funding NO-GO 0a63151b}). The Stamp — where N_eff and the strict bar land — is OFF THE MASS PATH (S16) and is NOT in the bundle (no bundle-path module imports Stamp/MinTRL/Rider). The ONLY three routes to move 9c1e7bd8 each violate a fence: (1) edit frozen rigor.py (forbidden), (2) add the Stamp to the deterministic bundle (a semantic redefinition), (3) wire the N_eff gate into the mass-path differential (violates S16 + D63-OFF). So the bundle STAYS byte-identical. RP-1 is DISCHARGED by (a) proving 9c1e7bd8 byte-identical (asserted at the gate) + (b) VERSIONING the Stamp's OWN strict-fixture verdict changes in a regenerable, diffed stamp-strict record (the scoped diff manifest Phase 2 produces — which fixtures flip GO→INSUFFICIENT + the synthetic positive control's GO). The invariant was 'no verdict moves SILENTLY,' not 'no verdict ever moves' — and the Stamp's change moves LOUDLY, in its own versioned record, while the mass bundle does not move because the Stamp is off it.",
    RP2_positiveControl: "F-2 HIGH — the fixture set retains a constructed POSITIVE CONTROL: a synthetic low-autocorrelation series with genuine signal that clears PSR(N_eff)>0.95 ∧ len>MinTRL → GO, so the strict Stamp is proven able to say GO as well as INSUFFICIENT (X-REACH(a)). If NO real-plausible series clears the bar, that is the finding — but the synthetic control separates 'impossible' from 'broken'. The Stamp must be shown capable of BOTH verdicts.",
    RP3_stableNeff: "F-3 HIGH — use the windowed/tapered estimator (truncate τ_int at the first non-positive lag — the Sokal automatic window, the frozen integrated_autocorr_time's own truncation), CLAMP N_eff to [1,n], and RENDER the lag-window choice + the ρ_k stability so the estimate is auditable. Where the series is too short to estimate τ_int stably (below the pinned floor 30), N_eff is UNJUDGEABLE and the Stamp is INSUFFICIENT (not GO on a naive n) — the short-sample case fails safe toward 'not enough evidence'.",
    RP4_accountabilitySplit: "F-4 MEDIUM-HIGH — the D33 verdict states, in the gate, exactly what the agent is and is not accountable for: 'the agent is accountable for the MATHEMATICAL VERDICT (implementation sound, application corrected, recommended); the Operator is accountable for the DECISION TO RELY ON IT (the signature). These are different accountabilities and the split is the point — the agent cannot make the frozen core's overstatement the Operator's informed choice; only the Operator can.' The recommendation is unconditional and the reasoning complete — the agent is not hedging the math; it is refusing to convert its own analysis into the human's certification.",
    RP5_contagionBreakdown: "F-5 MEDIUM — the contagion score renders the per-class breakdown, not just the max ('oracle: {feed A: 3, feed B: 2}; underlying: {USDC: 4}; admin: {0x…: 2}') so the SHAPE is visible. The max is a headline; the breakdown is the fact. A scalar contagion score is a ranking waiting to happen; the breakdown resists collapse into advice.",
    F6_cannotAnswer: "MEDIUM — realLineageCount 0. The maths are now honest, the Stamp strict, the contagion score real — and there is still no manifest for any of it to judge. V44 makes the verdict trustworthy and the bar real; it cannot make a strategy exist to be verdicted. The pen is now signable, the Stamp now strict, the moat now three stones deep — and the one act that would give all of it a subject is still the Operator's. The tool is now honest enough that its first real verdict will mean something.",
  },

  // ── THE DEVIATIONS reserved/recorded this sprint. Only D90/D91 are /^D\\d+$/ (State.deviations folds them; Continuity.
  // countNamedNewDeviations counts them → added 2 → deviations.count 14→16). The ratifications D87ratified/D88ratified/
  // D89ratified and D33verdict are recorded under NON-D-numbered keys (they are state changes on existing deviations, not new
  // ones). Operator-signed=false on ALL — the agent NEVER signs the gate (LN5). ──
  deviations: {
    D90: "RECORDED — THE CONTAGION SCORE: a count over V40's dependency map (max shared count per class + the per-class breakdown), the curator-loss literature's finding as a FACT over the Operator's own positions; never ranking/counsel; copy PINNED VERBATIM; the guard's mutation catalogue extended to the new surface. A disclosed capability, off the verdict path (the bundle byte-identical). Operator-signed=false.",
    D91: "RESERVED — THE LN5-AMENDMENT QUESTION: IF the Operator intends the agent to LITERALLY set operatorSigned:true on his behalf, that is a change to LN5 itself (the law that says the agent never signs). Presented as a constitutional amendment, NEVER assumed and NEVER smuggled through a gate instruction. Until the Operator amends LN5 in his own hand, the agent computes and recommends; the bit stays false. Operator-signed=false.",
    D87ratified: "D87-R — AGENT-RATIFIED (the general reconciler: sound, exceeded its brief with the raw-leaf marker diff). operatorSigned:false. Ratification is the agent's recorded engineering call under the DD-93 delegation, NOT the pen.",
    D88ratified: "D88-R — AGENT-RATIFIED (the backfill engine: sound; the phase-walker correct; the re-derivability-precondition honesty a strength). operatorSigned:false.",
    D89ratified: "D89-R — AGENT-RATIFIED (the REAL-DERIVED tier: sound; the ladder position right). operatorSigned:false.",
    D33verdict: "D33 — implementation SOUND (0 breaks, 5 classes, 0 frozen drift) · application SIGNABLE (N_eff enforced: √(N_eff−1) replaces √(n−1); τ_int windowed + clamped [1,n]) · recommended-for-signature true · operatorSigned false (the pen is the human's, LN5) · accountability split (agent: the math verdict; Operator: the decision to rely). RECOMMENDED, unsigned.",
    mr13: "CLOSED (carried) — undischargeable-by-the-agent (ninth sprint); it turns on the Operator opening the tool (realLineageCount 0). Recorded closed, not re-opened.",
    mr20: "carried (S174) — the machine-readable deviationStates must enumerate EVERY pinned deviation: D51/D33/D63/D27 AND D80–D89 AND this sprint's D90–D91. State.deviations() is the single source; a pinned deviation absent from it FAILS (S174).",
    operatorGatedNote:
      "D23–D91 present, D27 STILL FIRST (the NINETEENTH sprint) — but now STRICT (the generosity retired). THE FIRST gate section is THREE items — (1) THE COMPOUNDED GENEROSITY, NOW RESOLVING: D27 made strict, the ≈√τ_int overstatement now the enforced default; the compounded figure shrinks to what the honest math leaves; (2) D33: implementation SOUND · application SIGNABLE (N_eff enforced) · RECOMMENDED-FOR-SIGNATURE · operatorSigned:false — the agent audited, decided, recommends; the pen is the human's; (3) D67: ⟨N⟩ STILL EMPTY. Then D27-strict · D87-R/D88-R/D89-R · D90 (contagion) · D91 (the LN5-amendment question, RESERVED) · D62-R · D46/D50/D54/D55 · IN2 (the only validation left — the strict Stamp now means a real manifest gets a real, honest verdict the moment one is authored). The agent presents the whole gate, NEVER signs it (LN5). D33 or D46 implemented while unsigned is the gravest Halt.",
  },

  // ── THE BUILD PHASES — the shed order, PINNED ──
  shedOrder: {
    rule: "Phases 1, 2, 3, 6 NEVER SHED (the maths must be made honest · the Stamp must be made strict · V43's defects must close · the contagion stone must land). Then Phase 5 sheds FIRST · Phase 4 second. A sprint that ships only 1, 2, 3, 6 is a successful sprint: it reckons with the pen and lays the third moat stone.",
    neverShed: ["1_d33MathsHonest", "2_strictBar", "3_v43Defects", "6_contagion"],
    shedOrderIfNeeded: ["5_delegation", "4_backfillResidues"],
  },

  // ── THE RED TEAM — walls S190–S197 (S1–S189 carried, re-run against the SHIPPED artifacts at ship time) ──
  walls: {
    carried: "S1–S189 first-class, re-run (two identical battery runs) — every one runs against the SHIPPED artifact at ship time (the identity-hardened, continuity-total Ship Gate, V40+V42+V43).",
    built: ["S190", "S191", "S192", "S193", "S194", "S195", "S196", "S197"],
    S190: "the census reconciles as CONSERVATION (transfers net to zero) + GROWTH (new walls change the total), never one identity; a transfer summed with an addition FAILS. (W-RK01)",
    S191: "the historical-hash re-basing is tagged rebased:{from,to,scheme,at:V44} and stable V44→V45; an untagged drift FAILS. (W-RK02)",
    S192: "the D33 audit's break count is 0 (or the verdict flips); N_eff is the enforced default; a seeded agent-set operatorSigned:true REFUSES the log (the LN5 mechanization). (W-RK03)",
    S193: "the strict Stamp requires PSR(N_eff)>0.95 ∧ len>MinTRL; a home-grown threshold FAILS; INSUFFICIENT is first-class; the synthetic positive control clears the bar → GO. (W-RK04)",
    S194: "every backfilled observable states its rate-space membership; a price-as-rate or an unjustified observable FAILS. (W-RK05)",
    S195: "judgeable agrees with its tier cap (min REAL★ fraction, or judgeable-with-caveat). (W-RK06)",
    S196: "the contagion score is a count (max + per-class breakdown); every seeded advisory phrase FAILS; unresolved → UNJUDGEABLE. (W-RK08)",
    S197: "D87/D88/D89 are AGENT-RATIFIED with operatorSigned:false; a seeded agent signature FAILS (the LN5 mechanization). (W-RK07)",
  },

  // ── THE CONVERGENCE CRITERIA ──
  convergence: {
    rule: "two clean runs · identical expect() · the continuity-total Ship Gate held (a moved-but-unrouted countable REFUSES the log, proven on the emit path) · a seeded agent signature REFUSES (LN5 mechanized) · N_eff the enforced default · the strict Stamp live (capable of BOTH GO and INSUFFICIENT) · the emitted pins-sha equals this sprint's pins file · the clone RAN on this tree · a real terminal tree + commit · bundle 9c1e7bd8 byte-identical (the Stamp semantics change is versioned in its OWN record, F-1 ground truth) · differential byte-identical · familyN === 1 · frozen 0 drift · deps 2 · screens 3 · operatorSigned unmoved by the agent on every deviation.",
    halts: "the agent setting operatorSigned:true on ANY deviation (LN5 — the gravest) · a strict Stamp on naive n · a home-grown D27 bar · a Stamp that can only say INSUFFICIENT (no positive control) · an unstable/unclamped N_eff · a census transfer summed with an addition · an untagged hash re-basing · a contagion 'diversify' · a price-as-rate · a frozen-core edit · a lit meter · a scheduler · a build log that exists while a countable moved unrouted.",
  },

  // ── THE PREVIOUS MARKER SNAPSHOT (the F-1/RP-1 diff runs against this) ──
  prevMarker: PREV_MARKER,

  // ── the constitution carried (byte-untouched; re-asserted for continuity) ──
  carried: {
    deps: ["hono", "zod"],
    screens: ["shelf", "reality-check", "ask"],
    newProductCapability: 1,
    newProductCapabilityNote: "1 DISCLOSED capability — the CONTAGION SCORE (the moat's third stone: a count over V40's dependency map, the curator-loss literature's finding as a fact over the Operator's own positions, never counsel). The N_eff enforcement (Phase 1), the strict bar (Phase 2), the census two-identity + hash tag (Phase 3), and the delegation ratification (Phase 5) are the pen's reckoning + the V43 audit's cure — making the maths honest and the record clean, not new scored capability. Reported honestly, not a Halt.",
    lawsThisSprint: "ZERO — application, not legislation (a NINTH sprint running; every V43 defect is an existing law under-applied)",
    laws: 17,
    exitKinds: 7,
    familyN: 1,
    reachableHumans: 1,
    published: false,
    frozenSevenNote:
      "the 6 .py + loop.ts + verdict-path 7 + frozen-core 2 byte-untouched (the N_eff correction is composed in the HARNESS beside the frozen rigor.psr — effective_n.py + rigor.py are READ, never edited — and the Stamp is off the mass path); the scorecard differential + evidence bundle 9c1e7bd8 byte-identical at every gate (the N_eff/strict-bar/contagion/census/hash — none touches the scorecard verdict path or the frozen-attest differential); the Stamp familyN stays 1; the deflation meter stays dark (D63); no daemon; no new mass-path dependency.",
    evidenceBundleShaPrefix: "9c1e7bd8",
    evidenceBundleNote: "9c1e7bd8 stays byte-identical (F-1 ground truth — the Stamp/N_eff/strict-bar are off the mass path and outside the deterministic bundle). The Stamp's own strict-fixture verdict change is a REAL verdict change, versioned in the stamp-strict record (RP-1's scoped diff manifest), NOT smuggled and NOT in the mass bundle.",
    killCriterion: "8b4e094b",
    ownCaptures: 0,
    ownCapturesNote: "ownCaptures (HUMAN) 0 today — the Operator has never run the verb; the own-leg counts REAL★ + REAL-DERIVED with the mix + ratio labeled, but the HUMAN own-count stays 0.",
    d67NEmpty: "D67's ⟨N⟩ is STILL EMPTY — awaiting the pen; the maths are now honest enough that its first real verdict will mean something.",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const OUT = { ...PINS, pinsSha }
writeFileSync(path.join(H, "reckoning-pins.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── RECKONING — the sprint contracts pinned (V44) ─────────────────")
console.log(`  carried from Backfill   : ${CARRIED_FROM.slice(0, 16)}…  (READ FROM DISK — the true V43 head)`)
console.log(`  walls                   : S190–S197 (S1–S189 carried, run at ship time)`)
console.log(`  shed order              : 1,2,3,6 NEVER shed · then 5 · then 4`)
console.log(`  the pen's reckoning     : D33 maths audited (0 breaks) + N_eff the enforced default; SIGNABLE, RECOMMENDED, operatorSigned:false`)
console.log(`  the strict bar          : GO iff PSR(N_eff)>0.95 ∧ len>MinTRL, else INSUFFICIENT (the literature's, not ours)`)
console.log(`  the moat's third stone  : the contagion score — a count over the join, never counsel`)
console.log(`  F-1 ground truth        : the bundle 9c1e7bd8 does NOT move (the Stamp is off it); RP-1 discharged by proof + Stamp-own versioning`)
console.log(`  countables registered   : ${COUNTABLE_REGISTRY.countables.length} (carried; no new cross-sprint countable)`)
console.log(`  new capability          : ${OUT.carried.newProductCapability} (the contagion score) + the pen's reckoning + the V43 audit's cure`)
console.log(`  RECKONING PINS_SHA      : ${pinsSha}`)
console.log("written: data/honesty/reckoning-pins.json")
