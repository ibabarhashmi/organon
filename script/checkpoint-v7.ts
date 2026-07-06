/**
 * ORGΛNON — the TRANSPLANT checkpoint driver (gatekeeper v2 against the pinned + verbatim-printed criteria).
 * Each phase's decision is recorded ONLY with hash-resolving evidence per criterion (H-GATE); gate criteria are
 * UNAMENDABLE (L-GATE2); a phase reporting arms takes headline = MIN(arms) (C-ARMS). The trail is hash-chained,
 * append-only, and written to a committed artifact. Deterministic: re-running regenerates the trail from the evidence.
 * Extended phase-by-phase as the sprint proceeds. Run: bun run script/checkpoint-v7.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Checkpoint } from "../src/studio/checkpoint"
import { Criteria } from "../src/studio/criteria"

const D = path.join(PKG_ROOT, "data", "studio")
const ev = (name: string) => Checkpoint.pin(path.join(D, name))

const CRIT = Criteria.TRANSPLANT
const gate = new Checkpoint.Gate()
for (const [phase, crits] of Object.entries(CRIT)) gate.declare(phase, crits)

// ── PHASE 0 — DEBT-CLEAR-2 ───────────────────────────────────────────────────────────────────────────────────────
// Every phase-0 criterion resolves to a committed artifact. DEBT-CLEAR-2 is a gate → hash-resolving evidence,
// unamendable. Genuinely met: pollution audited clean (positive-controlled), Phase-2 corrected append-only, T-SUPERSEDE
// adopted with its wall + the V6 counterexample superseded, regeneration DEMONSTRATED (mixed, true errors pasted),
// trial-2 labeled, criteria printed + floor re-anchored via supersession.
const p0 = gate.record({
  phase: "phase-0",
  decision: "ADVANCE",
  stamp: "v7-phase0-debt-clear-2",
  author: "author-run",
  resolutions: [
    { id: "DEBT-CLEAR-2", evidence: ev("phase0-debt-clear-2.json") },
    { id: "pollution-audit", evidence: ev("ledger-pollution-audit.json") },
    { id: "phase2-correction", evidence: ev("supersede-trail.json") },
    { id: "trail-immutability", evidence: ev("supersede-trail.json") },
    { id: "regeneration-demonstrated", evidence: ev("phase0-regeneration.json") },
    { id: "trial-2-labeled", evidence: ev("live-run-2-artifact.json") },
    // cite the STABLE phase-0 bundle (not the LIVE capability-inventory.json, which legitimately GROWS each phase as the
    // C-NOREGRESS floor rises) — so this trail re-derives REPRODUCIBLY going forward, avoiding the V6 §0.7 re-point
    // instability the audit named (T-SUPERSEDE): a past record must not shift when a later phase raises the floor.
    { id: "criteria-printed-floor-reanchored", evidence: ev("phase0-debt-clear-2.json") },
  ],
})
console.log(`#${p0.seq} phase-0 → ${p0.decision}  hash=${p0.hash.slice(0, 12)}…`)

// ── PHASE 1 — SPLIT-WHOLE ────────────────────────────────────────────────────────────────────────────────────────
// The transplant's gate. SPLIT-WHOLE is a gate → hash-resolving evidence, unamendable. Genuinely met: the frozen seven
// byte-verified FIRST against the ORIGINAL manifest; the standalone assembled with a machine-generated manifest; a
// GENUINE fresh clone of the NEW repo proves frozen byte-identity + the full in-scope battery (158/0) + the capability
// floor + 13/13 walls; the old tree keeps its whole history (nothing deleted), frozen behind a pointer.
const p1 = gate.record({
  phase: "phase-1",
  decision: "ADVANCE",
  stamp: "v7-phase1-split-whole",
  author: "author-run",
  resolutions: [
    { id: "SPLIT-WHOLE", evidence: ev("phase1-splitwhole.json") },
    { id: "byte-first", evidence: ev("phase1-splitwhole.json") },
    { id: "transplant-manifest", evidence: ev("phase1-splitwhole.json") },
    { id: "pointer-committed", evidence: ev("phase1-splitwhole.json") },
    { id: "logs-lineage", evidence: ev("phase1-splitwhole.json") },
  ],
})
console.log(`#${p1.seq} phase-1 → ${p1.decision}  hash=${p1.hash.slice(0, 12)}…`)

// ── PHASE 2 — STRONGER ───────────────────────────────────────────────────────────────────────────────────────────
// The closed set of five, each a positive-controlled proof OR a legitimate four-field park. STRONGER is a gate →
// hash-resolving evidence, unamendable. Genuinely met: rejection-boundary fuzz (both corpora), REAL-RETURNS parked
// (P2-1, pre-authorized), the served-persistence decision made + implemented + restart-survival proven, the runbook
// rehearsed, the tense scanner live — all with W1-04's class mechanically unreintroducible.
const p2 = gate.record({
  phase: "phase-2",
  decision: "ADVANCE",
  stamp: "v7-phase2-stronger",
  author: "author-run",
  resolutions: [
    { id: "STRONGER", evidence: ev("phase2-stronger.json") },
    { id: "rejection-boundary", evidence: ev("phase2-stronger.json") },
    { id: "real-returns", evidence: ev("parks-register.json") },
    { id: "served-persistence", evidence: ev("phase2-runbook-rehearsal.json") },
    { id: "runbook", evidence: ev("phase2-runbook-rehearsal.json") },
    { id: "tense-scanner", evidence: ev("phase2-stronger.json") },
  ],
})
console.log(`#${p2.seq} phase-2 → ${p2.decision}  hash=${p2.hash.slice(0, 12)}…`)

// ── PHASE 3 — CONVERGED-2 ────────────────────────────────────────────────────────────────────────────────────────
// The walk's gate. CONVERGED-2 is a gate → hash-resolving evidence, unamendable. Genuinely met: the seven-theme
// rotation is complete AND two consecutive clean cycles (2 & 3) were earned; the WALK LEDGER is chained with T1-01
// registered before its fix; every open park is four-fielded + re-reviewed; a prior cycle was replayed; the pollution
// spot-audit ran clean. Exactly one terminal claimed — CONVERGED-2, not a NON-CONVERGENCE STOP.
const p3 = gate.record({
  phase: "phase-3",
  decision: "ADVANCE",
  stamp: "v7-phase3-converged-2",
  author: "author-run",
  resolutions: [
    { id: "CONVERGED-2", evidence: ev("walk-v2-cycles.json") },
    { id: "walk-ledger-chained", evidence: ev("walk-v2-ledger.jsonl") },
    { id: "fixes-inventoried", evidence: ev("phase3-converged.json") },
    { id: "parks-legitimate", evidence: ev("parks-register.json") },
    { id: "rotation-depth", evidence: ev("walk-v2-cycles.json") },
  ],
})
console.log(`#${p3.seq} phase-3 → ${p3.decision}  hash=${p3.hash.slice(0, 12)}…`)

// ── (later phases appended here as they complete) ────────────────────────────────────────────────────────────────

const chain = gate.verifyChain()
console.log(`\ntrail chain ok: ${chain.ok}${chain.ok ? "" : ` (broken at #${chain.brokenAt})`}`)
console.log(`independence: ${gate.independence()}`)
console.log("\n" + gate.render())

const trail = { protocol: "checkpoint-trail-v7", criteriaSetSha: Criteria.transplantCriteriaSha(), chainOk: chain.ok, independence: gate.independence(), records: gate.trail() }
writeFileSync(path.join(D, "checkpoint-trail-v7.json"), JSON.stringify(trail, null, 2) + "\n")
console.log(`\ntrail written: data/studio/checkpoint-trail-v7.json`)
