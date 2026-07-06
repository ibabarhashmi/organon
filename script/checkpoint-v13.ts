/**
 * ORGΛNON — the ENSEMBLE checkpoint driver (gatekeeper v2 against the pinned + verbatim-printed criteria). User-facing
 * criteria are FLAGGED `surface: true` (or auto-flagged by the K-COMPLETE lexicon — enforceAutoFlag ON) and resolve ONLY
 * through console-path traversal evidence (U-SURFACE); gate criteria are UNAMENDABLE (L-GATE2); a phase reporting arms
 * takes headline = MIN(arms). The trail is hash-chained, append-only, committed; the SURFACING CENSUS DIFF is attached at
 * every checkpoint (K-COMPLETE). Deterministic. Extended phase-by-phase. Run: bun run script/checkpoint-v13.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Checkpoint } from "../src/studio/checkpoint"
import { Criteria } from "../src/studio/criteria"

const D = path.join(PKG_ROOT, "data", "studio")
const ev = (name: string) => Checkpoint.pin(path.join(D, name))

const CRIT = Criteria.ENSEMBLE
// enforceAutoFlag ON — the K-COMPLETE auto-flag law bites AT THE GATE (a forgotten-flag user-facing criterion gates on a
// traversal). ENSEMBLE is audit-clean (every lexicon hit is surface:true OR lifted with a reason), so this is faithful.
const gate = new Checkpoint.Gate({}, { enforceAutoFlag: true })
for (const [phase, crits] of Object.entries(CRIT)) gate.declare(phase, crits)

// ── PHASE 0 — COMPLETE-TRUE ────────────────────────────────────────────────────────────────────────────────────────
// The reachability law's completeness half goes live and V12's debts get filed, before anything new is composed. The
// pinned user-facing lexicon auto-flags surface:true and the gate refuses module evidence on a flagged criterion;
// unflag-with-reason names the real consumer; the FULL re-census maps every matrix PRESENT row + all nine screens (16
// surfaced · 21 infrastructure · 0 dangling · seeded caught); the per-checkpoint census diff is clean; the four V12
// debts are filed as values (the K-SCOPE builder-narrowing amendment · the sybil-park impact upgrade 0.928/0.310 · the
// pristine conditional-Py3.11 · the λ-sensitivity pin) + the K_eff formula pin (5ee7730a…); the catalog v13 (36 = v12's
// 29 + 7) is pinned BEFORE any new surface exists; the W7-01 CPCV-tracker criterion auto-flags retroactively.
const p0 = gate.record({
  phase: "phase-0",
  decision: "ADVANCE",
  stamp: "v13-phase0-complete-true",
  author: "author-run",
  resolutions: [
    { id: "COMPLETE-TRUE", evidence: ev("phase0-complete-true-v13.json") },
    { id: "lexicon-autoflag-live", evidence: ev("phase0-complete-true-v13.json") },
    { id: "census-continuous-and-full", evidence: ev("surfacing-census-v13.json") },
    { id: "debts-filed", evidence: ev("ensemble-debts-v13.json") },
    { id: "keff-formula-pinned", evidence: ev("phase0-pins-v13.json") },
    { id: "catalog-v13-pinned-baseline", evidence: ev("e2e-catalog-pin-v13.json") },
  ],
})

// ── PHASE 1 — PRECONDITIONS-TRUE ───────────────────────────────────────────────────────────────────────────────────
// The preconditions answered before a line of pool code exists. The K_eff formula hash-checked (5ee7730a…); the middle
// cells (ρ 0.3/0.6, K_eff non-trivial 2.26/1.48) over a 30-seed battery: the genuine diversified pool passes at the
// honest K_eff charge (93%) ABOVE a single member (67%/80%) — diversification, not laundering; the noise pool NEVER
// passes (0% — the hard firewall); laundering caught at ρ=0.3 (27%); the stress cell collapses (K_eff 2.83→1.04). The
// door OPENS-WITH-CONDITIONS (the ρ=0.6 laundering window is empty because the correction is +1 trial — a filed
// condition binding Phase 3, not argued past). λ-sensitivity: RESOLUTION CONFIRMED (real maxDSR 1.0 vs noise 0.36). HRP:
// disposed NO (keep parked, 1/20 windows). Pool code ABSENT (SCREENS=9, no composer, no route, no un-adopted module).
const p1 = gate.record({
  phase: "phase-1",
  decision: "ADVANCE",
  stamp: "v13-phase1-preconditions-true",
  author: "author-run",
  resolutions: [
    { id: "PRECONDITIONS-TRUE", evidence: ev("phase1-preconditions-v13.json") },
    { id: "keff-hash-checked", evidence: ev("phase1-preconditions-v13.json") },
    { id: "middle-and-stress-cells", evidence: ev("phase1-preconditions-v13.json") },
    { id: "lambda-sensitivity-resolved", evidence: ev("phase1-preconditions-v13.json") },
    { id: "hrp-park-disposed", evidence: ev("research-ratification-v13.json") },
    { id: "pool-code-absent", evidence: ev("phase1-preconditions-v13.json") },
  ],
})

// ── PHASE 2 — BUILDER-WHOLE ────────────────────────────────────────────────────────────────────────────────────────
// The builder completed to its three-domain scope (K-SCOPE cure). Funding + basis join lending under the identical
// discipline; the surface criteria resolve ONLY through per-domain U-SURFACE traversals (happy + failure) — the gate's
// only sufficient evidence, enforceAutoFlag ON. The basis form surfaces MIN-tier + EXPERIMENTAL inline before composing;
// per-domain honesty checked (a seeded priming caught per domain); the verdict differential byte-identical (70c7912f…);
// the census diff enters two new user-facing capabilities automatically (guided-builder-funding · -basis).
const p2 = gate.record({
  phase: "phase-2",
  decision: "ADVANCE",
  stamp: "v13-phase2-builder-whole",
  author: "author-run",
  resolutions: [
    { id: "BUILDER-WHOLE", evidence: ev("traversal-builder-basis.json") },
    { id: "funding-domain-traversal", evidence: ev("traversal-builder-funding.json") },
    { id: "basis-domain-traversal", evidence: ev("traversal-builder-basis.json") },
    { id: "builder-verdict-differential", evidence: ev("phase2-builder-whole-v13.json") },
  ],
})

// ── PHASE 3 — POOL-HONEST ──────────────────────────────────────────────────────────────────────────────────────────
// THE POOL COMPOSER, through the open door (Phase 1 opened OPEN-WITH-CONDITIONS). The tenth screen (U-AMEND-2, closed at
// 10). The pool pays the union's ceil(K_eff) bill (not raw K); a member swap ratchets the family (1→2→3); K_eff
// recomputes on clock ticks (5.00→2.69 as members correlate); the stress caveat is mandatory; the pooled-noise wall is
// green (0 survivors) with its seeded kill (6 survivors → composer disabled); depth-1 recursion refused; K-LEGIBLE renders
// neutral on verdicts/leaderboard/pool reports; the verdict differential byte-identical; the ensemble ADOPT authorizes
// src/analytics/pool.ts. The surface criteria resolve ONLY through the pool-composer traversal (U-SURFACE, enforceAutoFlag).
const p3 = gate.record({
  phase: "phase-3",
  decision: "ADVANCE",
  stamp: "v13-phase3-pool-honest",
  author: "author-run",
  resolutions: [
    { id: "POOL-HONEST", evidence: ev("traversal-pool-composer.json") },
    { id: "pool-union-charge-and-ratchet", evidence: ev("traversal-pool-composer.json") },
    { id: "pooled-noise-permanent-wall", evidence: ev("phase3-pool-honest-v13.json") },
    { id: "pool-legibility-neutral", evidence: ev("traversal-pool-composer.json") },
    { id: "pool-depth1-recursion-refused", evidence: ev("phase3-pool-honest-v13.json") },
    { id: "ensemble-adopt-and-budget", evidence: ev("research-ratification-v13.json") },
  ],
})

// ── PHASE 4 — CONVERGED-7 ──────────────────────────────────────────────────────────────────────────────────────────
// THE WALK v8, the protected majority — the whole system walked through ALL doors (preset · goal · builder×3 · the pool
// composer) against the pinned catalog v13 (36 scenarios). Laundering hunted the pool hardest: one genuine finding
// (W8-01, the member-swap ratchet built but not reachable through the served door) registered BEFORE its fix, root-caused
// → fixed (per-author edit-lineage threading) → re-tested; both noise walls green (single + pooled) each clean cycle; two
// consecutive FULL-depth clean cycles across five total; rotation-complete; CONVERGED-7 derived from the register.
const p4 = gate.record({
  phase: "phase-4",
  decision: "ADVANCE",
  stamp: "v13-phase4-converged-7",
  author: "author-run",
  resolutions: [
    { id: "CONVERGED-7", evidence: ev("walk-v8-cycles.json") },
    { id: "walk-ledger-chained", evidence: ev("walk-v8-cycles.json") },
    { id: "fixes-rootcaused", evidence: ev("walk-v8-cycles.json") },
    { id: "catalog-traversed-all-doors", evidence: ev("walk-v8-cycles.json") },
    { id: "parks-legitimate", evidence: ev("parks-register.json") },
    { id: "rotation-depth-ensemble", evidence: ev("walk-v8-cycles.json") },
  ],
})

const chain = gate.verifyChain()
// the census diff attached to every checkpoint (K-COMPLETE): the artifact each record's census state is drawn from
const censusDiffs = { "phase-0": "surfacing-census-v13.json", "phase-1": "surfacing-census-v13.json (no new surface — pool code absent)", "phase-2": "phase2-builder-whole-v13.json (censusDiff: guided-builder-funding + -basis newly surfaced)", "phase-3": "phase3-pool-honest-v13.json (censusDiff: pool-composer newly surfaced)", "phase-4": "walk-v8-cycles.json (no new surface — the walk validates the census)" }
const trail = { protocol: "checkpoint-trail-v13", criteriaSetSha: Criteria.ensembleCriteriaSha(), lexiconSha: Criteria.surfaceLexiconSha(), blueprintPin: Criteria.ENSEMBLE_BLUEPRINT_SHA_PINNED, chainOk: chain.ok, independence: gate.independence(), censusDiffs, records: gate.trail() }
writeFileSync(path.join(D, "checkpoint-trail-v13.json"), JSON.stringify(trail, null, 2) + "\n")

console.log("═══ ENSEMBLE CHECKPOINT TRAIL ═══")
console.log(gate.render())
console.log(`\nchain ok: ${chain.ok} · independence: ${gate.independence()} · criteria-set ${Criteria.ensembleCriteriaSha().slice(0, 12)}…`)
