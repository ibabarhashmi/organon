/**
 * ORGΛNON STUDIO — the CONVERGENCE checkpoint driver (gatekeeper v2 against the pinned+verbatim criteria). Each phase's
 * decision is recorded ONLY with hash-resolving evidence per criterion (H-GATE); gate criteria are UNAMENDABLE
 * (L-GATE2); a phase reporting arms takes headline = MIN(arms) (C-ARMS). The trail is hash-chained (append-only,
 * tamper-evident, the ledger's own discipline) and written to a committed artifact. Deterministic + data-driven:
 * re-running regenerates the whole trail from the evidence artifacts, so the trail is reproducible.
 *
 * Extended phase-by-phase as the sprint proceeds. Run:  bun run script/checkpoint-v6.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Checkpoint } from "../src/studio/checkpoint"
import { Criteria } from "../src/studio/criteria"

const D = path.join(PKG_ROOT, "data", "studio")
const ev = (name: string) => Checkpoint.pin(path.join(D, name))

// Load the pinned Convergence criteria ONLY by matching criteria-set hash (a hand-edited set is void, L-RECON).
const CRIT = Criteria.CONVERGENCE
const gate = new Checkpoint.Gate()
for (const [phase, crits] of Object.entries(CRIT)) gate.declare(phase, crits)

// ── PHASE 0 — DEBT-CLEAR ─────────────────────────────────────────────────────────────────────────────────────────
// Every phase-0 criterion resolves to a real committed artifact. DEBT-CLEAR is a gate → it must have hash-resolving
// evidence (unamendable); it is genuinely met (world committed, criteria printed+reconciled, legacy dispositioned,
// second live trial flipped, attribution complete at zero residue, ratifications recorded, inventory snapshotted).
const p0 = gate.record({
  phase: "phase-0",
  decision: "ADVANCE",
  stamp: "v6-phase0-debt-clear",
  author: "author-run",
  resolutions: [
    { id: "DEBT-CLEAR", evidence: ev("phase0-debt-evidence.json") },
    { id: "committed-world", evidence: ev("phase0-committed-world.json") },
    { id: "criteria-printed", evidence: ev("phase0-criteria-print.txt") },
    { id: "legacy-dispositioned", evidence: ev("phase0-legacy-disposition.json") },
    { id: "second-live-trial", evidence: ev("live-run-2-artifact.json") },
    { id: "attribution-complete", evidence: ev("phase0-attribution.json") },
    { id: "ratifications", evidence: ev("phase0-ratifications.txt") },
    // cite the STABLE Phase-0 bundle (it embeds the Phase-0 inventory anchor bee1a152) rather than the live
    // capability-inventory.json, which legitimately GROWS across phases (the C-NOREGRESS floor only rises) — so this
    // trail re-derives reproducibly going forward.
    { id: "inventory-snapshotted", evidence: ev("phase0-debt-evidence.json") },
  ],
})
console.log(`#${p0.seq} phase-0 → ${p0.decision}  hash=${p0.hash.slice(0, 12)}…`)

// ── PHASE 1 — SOLID ──────────────────────────────────────────────────────────────────────────────────────────────
// Each strengthening carries a positive-controlled proof; SOLID is a gate → hash-resolving evidence, unamendable.
const p1 = gate.record({
  phase: "phase-1",
  decision: "ADVANCE",
  stamp: "v6-phase1-solid",
  author: "author-run",
  resolutions: [
    { id: "SOLID", evidence: ev("phase1-solid-bundle.json") },
    { id: "unattended-cadence", evidence: ev("phase1-cadence.json") },
    { id: "restore-drill", evidence: ev("phase1-restore.json") },
    { id: "surface-hardened", evidence: ev("phase1-fuzz.json") },
    { id: "reachability", evidence: ev("phase1-reachability.json") },
    { id: "trust-panel", evidence: ev("phase1-trust-panel.json") },
  ],
})
console.log(`#${p1.seq} phase-1 → ${p1.decision}  hash=${p1.hash.slice(0, 12)}…`)

// ── PHASE 2 — EXPAND (bounded, closed set; soft gate — no gate criterion) ────────────────────────────────────────
const p2 = gate.record({
  phase: "phase-2",
  decision: "ADVANCE",
  stamp: "v6-phase2-expand",
  author: "author-run",
  resolutions: [
    { id: "doc-truth", evidence: ev("phase2-doctruth.json") },
    { id: "goal-presets", evidence: ev("presets.json") },
    { id: "error-honesty", evidence: ev("phase2-errors.json") },
    { id: "report-readability", evidence: ev("phase2-readability.json") },
  ],
})
console.log(`#${p2.seq} phase-2 → ${p2.decision}  hash=${p2.hash.slice(0, 12)}…`)

// ── PHASE 3 — THE WALK (CONVERGED gate) ──────────────────────────────────────────────────────────────────────────
// The convergence gate. CONVERGED is a gate → hash-resolving evidence, unamendable. Two consecutive clean cycles
// (C4+C5) were earned; the register is empty of open non-parked issues; the one park is legitimacy-reviewed.
const p3 = gate.record({
  phase: "phase-3",
  decision: "ADVANCE",
  stamp: "v6-phase3-converged",
  author: "author-run",
  resolutions: [
    { id: "CONVERGED", evidence: ev("walk-cycles.json") },
    { id: "walk-ledger-chained", evidence: ev("walk-ledger.jsonl") },
    { id: "fixes-inventoried", evidence: ev("capability-inventory.json") },
    { id: "parks-legitimate", evidence: ev("phase3-parks.json") },
  ],
})
console.log(`#${p3.seq} phase-3 → ${p3.decision}  hash=${p3.hash.slice(0, 12)}…`)

// ── (later phases appended here as they complete) ────────────────────────────────────────────────────────────────

const chain = gate.verifyChain()
console.log(`\ntrail chain ok: ${chain.ok}${chain.ok ? "" : ` (broken at #${chain.brokenAt})`}`)
console.log(`independence: ${gate.independence()}`)
console.log("\n" + gate.render())

const trail = { protocol: "checkpoint-trail-v6", criteriaSetSha: Criteria.convergenceCriteriaSha(), chainOk: chain.ok, independence: gate.independence(), records: gate.trail() }
writeFileSync(path.join(D, "checkpoint-trail-v6.json"), JSON.stringify(trail, null, 2) + "\n")
console.log(`\ntrail written: data/studio/checkpoint-trail-v6.json`)
