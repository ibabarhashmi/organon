/**
 * ORGΛNON — the EXPLANATION checkpoint driver (gatekeeper v2 against the pinned + verbatim-printed WHY criteria). The
 * auto-flag law now DEFAULTS ON (X-DEFAULT): the gate is constructed WITHOUT an opt-in — a new lexicon-hitting criterion
 * gates on a traversal automatically; V6–V13 gate ids are grandfathered (explicit-only, never re-adjudicated). Surface
 * criteria resolve ONLY through console-path traversal evidence (U-SURFACE) carrying per-criterion exercise assertions
 * where they name one; gate criteria are UNAMENDABLE (L-GATE2). The trail is hash-chained, append-only, committed; the
 * census DIFF is attached at every checkpoint. Deterministic. Extended phase-by-phase. Run: bun run script/checkpoint-v14.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Checkpoint } from "../src/studio/checkpoint"
import { Criteria } from "../src/studio/criteria"

const D = path.join(PKG_ROOT, "data", "studio")
const ev = (name: string) => Checkpoint.pin(path.join(D, name))

const CRIT = Criteria.WHY
// X-DEFAULT: no opts — enforceAutoFlag defaults ON. WHY is audit-clean (every lexicon hit is surface:true or lifted with
// a reason); V6–V13 ids are grandfathered so no historical gate is affected.
const gate = new Checkpoint.Gate()
for (const [phase, crits] of Object.entries(CRIT)) gate.declare(phase, crits)

// ── PHASE 0 — LAWS-DEFAULT-TRUE ────────────────────────────────────────────────────────────────────────────────────
// Everything the sprint will be judged against exists here first, made judgeable. The auto-flag law DEFAULTS ON with the
// V6–V13 grandfather list pinned (sha 496f5d7b…, 190 ids); per-criterion exercise assertions close the W8-01 loophole (a
// vague ref is caught); the summary differential extends to narrative deltas (the V13 '58→74' slip is the founding catch);
// the census gains a mis-categorization control; the EXPERIMENT registry makes the src/studio scan bypass explicit
// (hrp · experiments · preconditions · selection, all coherent); the K-SCOPE parity law is filed with the builder-funding
// ILLUSTRATIVE instance retro-filed (cure Phase 2); the identity provenance truth is filed into the sybil park; the
// SELECTION pins are hashed (98495b8d…) before Phase 1 may run; the interim pool caveat renders (a real traversal); the
// WHY ground rules are pinned; the catalog v14 (46 = v13's 36 + S22-S31) is pinned BEFORE any new surface exists.
const p0 = gate.record({
  phase: "phase-0",
  decision: "ADVANCE",
  stamp: "v14-phase0-laws-default-true",
  author: "author-run",
  resolutions: [
    { id: "LAWS-DEFAULT-TRUE", evidence: ev("phase0-laws-default-true-v14.json") },
    { id: "default-on-grandfathered", evidence: ev("phase0-laws-default-true-v14.json") },
    { id: "exercise-assertions-live", evidence: ev("phase0-laws-default-true-v14.json") },
    { id: "delta-differential-live", evidence: ev("delta-founding-catch-v14.json") },
    { id: "census-miscategorization-control", evidence: ev("surfacing-census-v14.json") },
    { id: "experiment-registry-live", evidence: ev("research-ratification-v14.json") },
    { id: "parity-law-and-selection-pins", evidence: ev("phase0-laws-default-true-v14.json") },
    { id: "interim-caveat-and-ground-rules", evidence: ev("traversal-interim-caveat.json") },
    { id: "catalog-v14-pinned-baseline", evidence: ev("e2e-catalog-pin-v14.json") },
  ],
})

// ── PHASE 1 — SELECTION-PRICED ─────────────────────────────────────────────────────────────────────────────────────
// THE SELECTION DOOR (X-SELECT). Under the Phase-0-hashed pins (98495b8d…, hash-checked before any cell ran), the
// experiment measured best-of-M cherry-picking: the instrument's positive control HELD (uncharged best-of-M survives
// 60%/83% — it sees the pick), best-of-M NOISE inflated at the current ceil(K_eff)≈4.87 charge (18% at M=20, 40% at
// M=30 — > 2× the 5% tolerance), and the pinned surcharge ceil(log2(C(M,K))) (+14/+18) drove noise survival to 0% at
// BOTH M WITHOUT over-killing planted-truth edges (78%/90% survive). DERIVED OUTCOME: TERM — the pick is priced,
// declaredNTrials = ceil(K_eff) + ceil(log2(C(M,K))) applied in src/analytics/pool.ts; the outcome filed as a SUPERSEDE
// disposing the selection PARK (coherent); the T-POLLUTION re-statement moved ZERO verdicts (historical pools M=K,
// surcharge 0); the caveat retired interim → TERM. Exactly one outcome, derived under unchanged pins, no tuning.
const p1 = gate.record({
  phase: "phase-1",
  decision: "ADVANCE",
  stamp: "v14-phase1-selection-priced",
  author: "author-run",
  resolutions: [
    { id: "SELECTION-PRICED", evidence: ev("phase1-selection-priced-v14.json") },
    { id: "selection-pins-hash-checked", evidence: ev("phase1-selection-priced-v14.json") },
    { id: "selection-instrument-positive-control", evidence: ev("phase1-selection-priced-v14.json") },
    { id: "selection-outcome-derived-restated", evidence: ev("research-ratification-v14.json") },
  ],
})

// ── PHASE 2 — PARITY-TRUE ──────────────────────────────────────────────────────────────────────────────────────────
// The V13 cures: builder-funding wired to its REAL captured T1 funding snapshot (funding:binance:BTCUSDT, 552 nonce-
// anchored freepit-T1 intervals) reaching a REAL-PIT verdict with resolving provenance (the K-SCOPE parity narrowing
// cured); ILLUSTRATIVE only where no snapshot exists (bybit/okx, 1h) — labeled truthfully; the basis stays ILLUSTRATIVE
// at MIN(legs)=T2 + EXPERIMENTAL (the real Binance-2024/Hyperliquid-2026 legs don't temporally overlap — no real spread
// exists — so no tier is quietly upgraded); the renderResult label DERIVED from the artifact (a bare REAL-PIT refused,
// D-LABEL). The identity provenance truth rendered NEUTRAL on the K-LEGIBLE surfaces (self-declared identity; the
// edit-ratchet per declared author, the limiter per connection — both keys documented; a reassuring version caught).
// The surface criteria resolve ONLY through the funding-parity + identity traversals (exercise assertions matched).
const p2 = gate.record({
  phase: "phase-2",
  decision: "ADVANCE",
  stamp: "v14-phase2-parity-true",
  author: "author-run",
  resolutions: [
    { id: "PARITY-TRUE", evidence: ev("traversal-funding-parity.json") },
    { id: "funding-parity-realpit-traversal", evidence: ev("traversal-funding-parity.json") },
    { id: "identity-sentences-neutral", evidence: ev("traversal-identity.json") },
  ],
})

// ── PHASE 3 — WHY-TRUE ─────────────────────────────────────────────────────────────────────────────────────────────
// THE WHY PANEL (the Operator's first add-on), born under the full law. Explain.factTable completeness-censused against
// the verdict artifact schema (every field a row or excluded-with-reason; a seeded omission caught); the deterministic
// dual registers for EVERY terminal state incl. kill-switch (plain two-sided · quantitative exact), mechanically
// consistency-checked (no orphan claim, no drift, a consoling template caught); the optional grounded-LLM paraphrase
// behind the groundedness verifier (a faithful paraphrase passes labeled; a seeded embellishment + an added causal story
// reject WHOLESALE with deterministic fallback; fixture-only in CI; nowhere in the verdict path). The report/verdict-card/
// pro-disclosure gained WHY sections (the screen set stays 10). explain.ts ADOPT-ratified. The surface criteria resolve
// ONLY through the WHY-panel traversal (a NO-GO in both registers, a kill-switch WHY, a MALFORMED failure state).
const p3 = gate.record({
  phase: "phase-3",
  decision: "ADVANCE",
  stamp: "v14-phase3-why-true",
  author: "author-run",
  resolutions: [
    { id: "WHY-TRUE", evidence: ev("traversal-why-panel.json") },
    { id: "fact-table-censused", evidence: ev("traversal-why-panel.json") },
    { id: "registers-consistency-checked", evidence: ev("traversal-why-panel.json") },
    { id: "groundedness-verifier-controlled", evidence: ev("phase3-why-true-v14.json") },
    { id: "every-terminal-state-explains", evidence: ev("traversal-why-panel.json") },
  ],
})

// ── PHASE 4 — ONE-COMMAND-TRUE ─────────────────────────────────────────────────────────────────────────────────────
// THE RUNNER (the Operator's second add-on). ./organon.sh takes a stranger from a fresh clone to the web door in ONE
// honest command: a prerequisite CHECK (bun · python3 · git required, python3.11 conditional — checked, NEVER installed)
// → setup from the pinned lockfile (idempotent) → the pinned verify set (walls · WHY panel · selection/parity ·
// differentials, printed as a status table; --full runs the whole battery) → an offline-honest refresh → the bounded TUI
// (status · launch-web · quit). LAUNCH WEB is requirements-gated: enabled ONLY when every prerequisite is present AND
// every pinned verify item passed (the real run: all 4 green → ENABLED); a masked prerequisite exits nonzero with the
// honest enumerated failure; a red wall DISABLES launch with the wall named beside it (no dead button, no soft-launch —
// the gate is DERIVED from the results, not a flag). The surface criteria resolve ONLY through the runner traversal.
const p4 = gate.record({
  phase: "phase-4",
  decision: "ADVANCE",
  stamp: "v14-phase4-one-command-true",
  author: "author-run",
  resolutions: [
    { id: "ONE-COMMAND-TRUE", evidence: ev("traversal-runner.json") },
    { id: "runner-gate-and-failures", evidence: ev("traversal-runner.json") },
    { id: "runner-bounded-honest", evidence: ev("phase4-one-command-true-v14.json") },
  ],
})

// ── PHASE 5 — CONVERGED-8 ──────────────────────────────────────────────────────────────────────────────────────────
// THE WALK v9, the protected majority — the whole system walked through every door (preset · goal · builder×3-real · the
// pool · the WHY panel) BOOTSTRAPPED THROUGH THE RUNNER (./organon.sh's launch gate is the door the walk enters by),
// against the pinned catalog v14 (46 scenarios). At every refusal the NOVICE read ONLY the plain WHY and answered "why
// did it fail?" in one correct sentence (consistency-checked against the fact table's deciding row). The seven
// explanation-aware themes rotated (ux-priming hunted the explanations hardest — consolation caught structurally; the
// paraphraser fed poisoned facts — the verifier rejected; doc-lies audited register consistency + the runner status
// table). Both noise walls green each cycle; FOUR consecutive FULL-depth clean cycles (the W8-01 class was closed at its
// mechanism in Phase 0, and every surface was wired-and-served as built — a clean walk is the honest outcome, disclosed:
// zero genuine findings, the walk ledger records none). CONVERGED-8 DERIVED from the register.
const p5 = gate.record({
  phase: "phase-5",
  decision: "ADVANCE",
  stamp: "v14-phase5-converged-8",
  author: "author-run",
  resolutions: [
    { id: "CONVERGED-8", evidence: ev("walk-v9-cycles.json") },
    { id: "walk-ledger-chained", evidence: ev("walk-v9-cycles.json") },
    { id: "fixes-rootcaused", evidence: ev("walk-v9-cycles.json") },
    { id: "catalog-traversed-all-doors", evidence: ev("walk-v9-cycles.json") },
    { id: "parks-legitimate", evidence: ev("parks-register.json") },
    { id: "rotation-depth-explanation", evidence: ev("walk-v9-cycles.json") },
  ],
})

// ── PHASE 6 — HANDOFF-HONEST ───────────────────────────────────────────────────────────────────────────────────────
// Verification + handoff + honest state. The delta-aware summary differential green on the terminal's OWN numbers AND its
// narrative arithmetic (floor 74→86 · matrix 34→40 · catalog 36→46, checked against V13's baseline); both noise walls
// green; the verdict differential byte-identical (no verdict moved by any panel or paraphrase); the newest door (the WHY
// panel) re-run from nothing + reachable through the served console; the parks forward (selection DISPOSED-TERM · WHY
// panel DELIVERED · sybil identity FILED · tournament NO · hrp DISPOSED · signing ever-standing); the operator lane at
// zero residue. The floor rose 74→86 (C-NOREGRESS: only up); the RWA pin untouched; no re-pin through any door.
const p6 = gate.record({
  phase: "phase-6",
  decision: "ADVANCE",
  stamp: "v14-phase6-handoff-honest",
  author: "author-run",
  resolutions: [
    { id: "HANDOFF-HONEST", evidence: ev("phase6-verification-v14.json") },
  ],
})

const chain = gate.verifyChain()
const censusDiffs = { "phase-0": "surfacing-census-v14.json (8 new capabilities: 7 infra laws + interim-selection-caveat newly surfaced; 0 dangling; seeded + miscategorization caught)", "phase-1": "no new user-facing surface (the pool.ts charge changed; the pool report render surfaces the priced-pick note)", "phase-2": "builder-funding-realpit-parity + identity-provenance-note newly surfaced (funding REAL-PIT traversal + the K-LEGIBLE identity note; 0 dangling)", "phase-3": "why-panel-both-registers newly surfaced (the WHY panel on every terminal state, both registers from one fact table; 0 dangling)", "phase-4": "runner-one-command-to-the-door newly surfaced (./organon.sh → the requirements-gated web door; 0 dangling)", "phase-5": "no new surface (the walk validates the census; all V14 surfaces reachable through the served doors)", "phase-6": "no new surface (verification + handoff; the delta-aware differential green on the terminal's own numbers + arithmetic)" }
const trail = { protocol: "checkpoint-trail-v14", criteriaSetSha: Criteria.whyCriteriaSha(), lexiconSha: Criteria.surfaceLexiconSha(), grandfatherSha: Criteria.grandfatherSha(), blueprintPin: Criteria.WHY_BLUEPRINT_SHA_PINNED, chainOk: chain.ok, independence: gate.independence(), censusDiffs, records: gate.trail() }
writeFileSync(path.join(D, "checkpoint-trail-v14.json"), JSON.stringify(trail, null, 2) + "\n")

console.log("═══ EXPLANATION CHECKPOINT TRAIL ═══")
console.log(gate.render())
console.log(`\nchain ok: ${chain.ok} · independence: ${gate.independence()} · criteria-set ${Criteria.whyCriteriaSha().slice(0, 12)}… · grandfather ${Criteria.grandfatherSha().slice(0, 12)}…`)
