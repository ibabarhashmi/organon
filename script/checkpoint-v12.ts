/**
 * ORGΛNON — the REACHABILITY checkpoint driver (gatekeeper v2 against the pinned + verbatim-printed criteria). User-facing
 * criteria are FLAGGED `surface: true` and resolve ONLY through console-path traversal evidence (U-SURFACE); gate criteria
 * are UNAMENDABLE (L-GATE2); a phase reporting arms takes headline = MIN(arms). The trail is hash-chained, append-only,
 * committed. Deterministic. Extended phase-by-phase. Run: bun run script/checkpoint-v12.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Checkpoint } from "../src/studio/checkpoint"
import { Criteria } from "../src/studio/criteria"

const D = path.join(PKG_ROOT, "data", "studio")
const ev = (name: string) => Checkpoint.pin(path.join(D, name))

const CRIT = Criteria.REACH
const gate = new Checkpoint.Gate()
for (const [phase, crits] of Object.entries(CRIT)) gate.declare(phase, crits)

// ── PHASE 0 — SURFACED-TRUE ───────────────────────────────────────────────────────────────────────────────────────
// Reachability becomes LAW before anything new is built. The VoC→OOS ratification SUPERSESSION filed (#13, referencing
// the original ADOPT row's hash 537e0647…) — U-RESUPERSEDE's founding instance; the four V11 debts filed as values; the
// SURFACING CENSUS complete with its seeded unsurfaced capability CAUGHT (3/3 real user-facing capabilities surfaced by
// the goal-console traversal — a REAL served request through the real routes, with a failure state); the U-SURFACE law
// live in the gatekeeper (a `surface` flag refuses module-only evidence); the retroactive proof that U-SURFACE would
// have caught V11's W6-01 at BREADTH-TRUE; the summary-differential machine-derives floor 58 / 23 PRESENT / 3 ABSENT;
// the catalog v12 (29 = v11's 23 + 6) pinned before any new surface exists.
const p0 = gate.record({
  phase: "phase-0",
  decision: "ADVANCE",
  stamp: "v12-phase0-surfaced-true",
  author: "author-run",
  resolutions: [
    { id: "SURFACED-TRUE", evidence: ev("phase0-surfaced-true-v12.json") },
    { id: "voc-supersession-filed", evidence: ev("research-ratification-v12.json") },
    { id: "backward-scope-correction", evidence: ev("reachability-debts-v12.json") },
    { id: "summary-differential-live", evidence: ev("reachability-debts-v12.json") },
    { id: "surfacing-census-seeded", evidence: ev("surfacing-census-v12.json") },
    { id: "usurface-law-live", evidence: ev("surfacing-census-v12.json") },
    { id: "catalog-v12-pinned-baseline", evidence: ev("e2e-catalog-pin-v12.json") },
  ],
})
console.log(`#${p0.seq} phase-0 → ${p0.decision}  hash=${p0.hash.slice(0, 12)}…`)

// ── PHASE 1 — WALLS-DEEPER ────────────────────────────────────────────────────────────────────────────────────────
// The walls brought to their own written depth. The λ-SWEEP under pre-pinned parameters (penalties {0.1, 1.0, 10.0} ×
// feature counts {30,40,50} × 8 seeds): the OOS regime is CLEAN across all 9 cells (0 survivors — noise has no
// out-of-sample edge, so the charge cannot rescue what never existed); the in-sample regime survives (7/8) and is BANNED
// by the VoC→OOS supersession; a clean sweep leaves the pinned λ=1.0 mapping unchanged, filing its evidence anyway. The
// capture floor formalized as a named constant (≥3 chained stamps across ≥2 runs) with Hyperliquid brought UP to it (3
// stamps / 2 runs, the provenance chain committed per the V9 precedent). The PRISTINE harness green from nothing: an
// isolated HOME, enumerated prerequisites, a positive control (no venv → the sidecar FAILS, proving no inherited venv)
// → a fresh-venv battery 296/0. The verdict differential byte-identical.
const p1 = gate.record({
  phase: "phase-1",
  decision: "ADVANCE",
  stamp: "v12-phase1-walls-deeper",
  author: "author-run",
  resolutions: [
    { id: "WALLS-DEEPER", evidence: ev("phase1-walls-deeper-v12.json") },
    { id: "noise-sweep-pinned", evidence: ev("phase1-walls-deeper-v12.json") },
    { id: "capture-floor-formalized", evidence: ev("capture-floor-v12.json") },
    { id: "pristine-harness-green", evidence: ev("pristine-clone-v12.json") },
    { id: "walls-verdict-differential", evidence: ev("verdict-fingerprints-v11.json") },
  ],
})
console.log(`#${p1.seq} phase-1 → ${p1.decision}  hash=${p1.hash.slice(0, 12)}…`)

// ── PHASE 2 — EXPERIMENTS-ANSWERED ────────────────────────────────────────────────────────────────────────────────
// The park protocol honored on schedule. Both V11-parked experiments run under criteria HASH-CHECKED UNCHANGED (ensemble
// 1bb0dfd1… · coherence 6d49e6b6…). ENSEMBLE → YES (legitimate WITH the correlation-adjusted K_eff charge → a
// future-sprint ADOPT): the noise pool FAILS (positive control), the genuine diversified pool passes at n=K (dsr 1.000),
// the naive laundering is detectable (dsr@1 0.997 passes, dsr@K 0.898 fails). COHERENCE → NO (stays parked): a laundered
// cross-author search (20 sybils, per-author n=1 → dsr 0.928) earns a WEAKER bar than the unified (n=20 → dsr 0.310) —
// incoherent under the deployable per-author scoping; the coherent global scoping has a fairness cost. Each outcome
// filed as a park-disposing SUPERSEDE value; ZERO product built past either outcome. The CPCV promotion tracker accrues.
const p2 = gate.record({
  phase: "phase-2",
  decision: "ADVANCE",
  stamp: "v12-phase2-experiments-answered",
  author: "author-run",
  resolutions: [
    { id: "EXPERIMENTS-ANSWERED", evidence: ev("phase2-experiments-answered-v12.json") },
    { id: "criteria-hash-checked", evidence: ev("phase2-experiments-answered-v12.json") },
    { id: "outcomes-derived-positive-controls", evidence: ev("phase2-experiments-answered-v12.json") },
    { id: "parks-disposed-zero-build", evidence: ev("research-ratification-v12.json") },
    { id: "experiments-verdict-differential", evidence: ev("phase2-experiments-answered-v12.json") },
  ],
})
console.log(`#${p2.seq} phase-2 → ${p2.decision}  hash=${p2.hash.slice(0, 12)}…`)

// ── PHASE 3 — BUILDER-REACHABLE ───────────────────────────────────────────────────────────────────────────────────
// The missing middle door, BORN under U-SURFACE. The BUILDER-REACHABLE gate is U-SURFACE-flagged — its evidence is the
// CONSOLE-PATH TRAVERSAL (traversal-guided-builder.json), a real served request through the real /builder/compose route:
// fresh serve → the builder screen (9th) → compose a valid lending spec → submit → VERDICT + WHY NOT YET + WHEN → PLUS a
// FAILURE STATE (an invalid composition, a weight of 2.0/leverage, refused before registration). The screen set closed
// at 9 (a tenth refused); conservative ratified defaults (static, equal, monthly); help copy honesty-checked; a
// builder-composed EDIT stiffens its family (nTrials 1→2, declared lineage); the verdict differential byte-identical.
const p3 = gate.record({
  phase: "phase-3",
  decision: "ADVANCE",
  stamp: "v12-phase3-builder-reachable",
  author: "author-run",
  resolutions: [
    { id: "BUILDER-REACHABLE", evidence: ev("traversal-guided-builder.json") }, // U-SURFACE — the traversal, not module evidence
    { id: "builder-amendment-closed", evidence: ev("phase3-builder-reachable-v12.json") },
    { id: "builder-defaults-honest", evidence: ev("phase3-builder-reachable-v12.json") },
    { id: "builder-physics-traversal", evidence: ev("phase3-builder-reachable-v12.json") },
  ],
})
console.log(`#${p3.seq} phase-3 → ${p3.decision}  hash=${p3.hash.slice(0, 12)}…`)

// ── PHASE 4 — CONVERGED-6 (THE WALK v7, the protected majority) ───────────────────────────────────────────────────
// The mandated E2E validation through ALL THREE DOORS (preset · goal · builder), against the pinned catalog v12 (29
// scenarios). Four cycles (cleanFlags F,T,T,T): cycle 1 found ONE genuine finding — W7-01, the CPCV promotion tracker
// was instrumented in Phase 2 but NOT surfaced on the pro disclosure (built, not reached the user's screen — the
// U-SURFACE disease in miniature) — registered BEFORE the fix, root-caused (symptom→mechanism→origin), fixed smallest-
// change (proDisclosure gains a cpcvPromotion field; computePanels reads the tracker status), re-tested (the disclosure
// now shows the counter; the verdict differential stays byte-identical). Cycles 2-4 CLEAN at full depth: catalog v12
// traversed in full, every scenario judged against its expected honest behavior. Catalog-complete AND rotation-complete
// (7 reachability-aware themes) AND two consecutive FULL-depth clean AND ≥4 cycles → CONVERGED-6, DERIVED, truthfully.
const p4 = gate.record({
  phase: "phase-4",
  decision: "ADVANCE",
  stamp: "v12-phase4-converged-6",
  author: "author-run",
  resolutions: [
    { id: "CONVERGED-6", evidence: ev("walk-v7-cycles.json") },
    { id: "walk-ledger-chained", evidence: ev("walk-v7-ledger.jsonl") },
    { id: "fixes-rootcaused", evidence: ev("walk-v7-cycles.json") },
    { id: "catalog-traversed-three-doors", evidence: ev("walk-v7-cycles.json") },
    { id: "parks-legitimate", evidence: ev("parks-register.json") },
    { id: "rotation-depth-reach", evidence: ev("walk-v7-cycles.json") },
  ],
})
console.log(`#${p4.seq} phase-4 → ${p4.decision}  hash=${p4.hash.slice(0, 12)}…`)

// ── (later phases appended here as they complete) ────────────────────────────────────────────────────────────────

const chain = gate.verifyChain()
console.log(`\ntrail chain ok: ${chain.ok}${chain.ok ? "" : ` (broken at #${chain.brokenAt})`}`)
console.log(`independence: ${gate.independence()}`)
console.log("\n" + gate.render())

const trail = { protocol: "checkpoint-trail-v12", criteriaSetSha: Criteria.reachCriteriaSha(), chainOk: chain.ok, independence: gate.independence(), records: gate.trail() }
writeFileSync(path.join(D, "checkpoint-trail-v12.json"), JSON.stringify(trail, null, 2) + "\n")
console.log(`\ntrail written: data/studio/checkpoint-trail-v12.json`)
