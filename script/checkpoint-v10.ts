/**
 * ORGΛNON — the END-USER checkpoint driver (gatekeeper v2 against the pinned + verbatim-printed criteria). Each phase's
 * decision records ONLY with hash-resolving evidence per criterion (H-GATE); gate criteria are UNAMENDABLE (L-GATE2); a
 * phase reporting arms takes headline = MIN(arms) (C-ARMS). The trail is hash-chained, append-only, committed.
 * Deterministic: re-running regenerates the trail from the evidence. Extended phase-by-phase. Run: bun run script/checkpoint-v10.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Checkpoint } from "../src/studio/checkpoint"
import { Criteria } from "../src/studio/criteria"

const D = path.join(PKG_ROOT, "data", "studio")
const ev = (name: string) => Checkpoint.pin(path.join(D, name))

const CRIT = Criteria.ENDUSER
const gate = new Checkpoint.Gate()
for (const [phase, crits] of Object.entries(CRIT)) gate.declare(phase, crits)

// ── PHASE 0 — PREVENT-TRUE ────────────────────────────────────────────────────────────────────────────────────────
// Governance + prevention + the catalog, all before any feature work. The ATTEMPT law live (V9's funding/fee-yield
// renegotiation retro-filed as a dated append-only amendment; a BLOCKED demands second-attempted evidence). Three
// prevention walls fail-closed on seeds (blob-size / raw-data / credential), wired via core.hooksPath — because history
// cannot be un-committed. The history-blob disclosure audit: W4-01's 453KB named permanent + 10 inherited transplant
// blobs disclosed, ZERO rewrites. The E2E scenario catalog pinned BEFORE any fixing (15 scenarios: 5 realistic ×
// 3 adversarial × 7 edge), each naming its expected honest behavior. Criteria printed verbatim; floor baseline 47.
const p0 = gate.record({
  phase: "phase-0",
  decision: "ADVANCE",
  stamp: "v10-phase0-prevent-true",
  author: "author-run",
  resolutions: [
    { id: "PREVENT-TRUE", evidence: ev("phase0-prevent-true-v10.json") },
    { id: "attempt-law-live", evidence: ev("attempt-law-v10.json") },
    { id: "prevention-walls", evidence: ev("phase0-prevent-true-v10.json") },
    { id: "history-disclosure", evidence: ev("history-blob-audit-v10.json") },
    { id: "catalog-pinned", evidence: ev("e2e-catalog-pin-v10.json") },
    { id: "criteria-printed-baseline", evidence: ev("phase0-baseline-v10.json") },
  ],
})
console.log(`#${p0.seq} phase-0 → ${p0.decision}  hash=${p0.hash.slice(0, 12)}…`)

// ── PHASE 1 — TRANSFORM-PROVEN ────────────────────────────────────────────────────────────────────────────────────
// The asterisk's last stand, answered on byte evidence. A throwaway SANDBOX copy of the monorepo (deps installed only
// there; the frozen tree zero writes/installs, git status clean before/after; storage/db shimmed as an unreached seam,
// the transform bytes unedited) runs the ORIGINAL Runner.legSeries (yield branch) + Runner.commonWindow — the monorepo's
// exact bytes — on identical pinned captured snapshots (5 real lending pools). Outcome: MATCH — the standalone rewrite's
// per-market series (apyBase·tvl·turnover) + window are BYTE-IDENTICAL to the original. The seeded flattering divergence
// (turnover×0.5) is caught direction-blind; the input pinned pre-run; the committed fixture slim (no raw data). The
// D-DIFF asterisk RETIRES at the letter (transform-supersede-v10.json) — 'oracle-judged' now true of the port.
const p1 = gate.record({
  phase: "phase-1",
  decision: "ADVANCE",
  stamp: "v10-phase1-transform-proven",
  author: "author-run",
  resolutions: [
    { id: "TRANSFORM-PROVEN", evidence: ev("transform-differential-v10.json") },
    { id: "sandbox-discipline", evidence: ev("transform-differential-v10.json") },
    { id: "both-transforms-run", evidence: ev("transform-differential-v10.json") },
    { id: "one-outcome-derived", evidence: ev("transform-differential-v10.json") },
    { id: "adjustments-rootcaused", evidence: ev("transform-supersede-v10.json") },
  ],
})
console.log(`#${p1.seq} phase-1 → ${p1.decision}  hash=${p1.hash.slice(0, 12)}…`)

// ── PHASE 2 — DOMAINS-ATTEMPTED ───────────────────────────────────────────────────────────────────────────────────
// The deferred domains, genuinely attempted (E-ATTEMPT — the V9 renegotiation class extinct). FUNDING → DELIVERED via
// credential-free freepit T1 (Binance data.vision immutable dumps, sha256-verified against the published CHECKSUM;
// reconstruction byte-identical to the monorepo's exact FreePitFunding.reconstruct; funding_accrual.py byte-identical
// cross-tree; a REAL-PIT funding adjudication relayed verbatim; a seeded flattering divergence caught). FEE-YIELD →
// BLOCKED-with-evidence, genuinely second-attempted (the Py3.11/pandas panel env stands up + runs the panel+discovery
// end-to-end on synthetic data; BLOCKED-on-data — the capture pipeline un-transplanted; the lockfile hashed). RWA →
// BLOCKED-on-credential, the pin UNCHANGED (zero re-pins). The ATTEMPT law refused any illegal disposition (0 open).
const p2 = gate.record({
  phase: "phase-2",
  decision: "ADVANCE",
  stamp: "v10-phase2-domains-attempted",
  author: "author-run",
  resolutions: [
    { id: "DOMAINS-ATTEMPTED", evidence: ev("phase2-domains-attempted-v10.json") },
    { id: "funding-attempted", evidence: ev("funding-differential-v10.json") },
    { id: "feeyield-attempted", evidence: ev("feeyield-attempt-v10.json") },
    { id: "deliveries-differential-proven", evidence: ev("funding-differential-v10.json") },
    { id: "pin-unchanged", evidence: ev("phase2-domains-attempted-v10.json") },
  ],
})
console.log(`#${p2.seq} phase-2 → ${p2.decision}  hash=${p2.hash.slice(0, 12)}…`)

// ── PHASE 3 — JOINED-LOOP ─────────────────────────────────────────────────────────────────────────────────────────
// The marquee, at last. The Goal Console (screen 8, amended 7→8 once and closed again) — one interactive flow, derives
// nothing, write-then-invoke, honest failure states (a dead endpoint, a malformed goal, a BLOCKED domain each render
// truthfully). The JOINED LOOP recorded end-to-end: a plain-English goal → the free-model agent path → a REAL-PIT
// adjudication on real captured lending data → the report — the verdict NO-GO, relayed VERBATIM (a NO-GO on real data
// is the product working); the model CANNOT bless (an injection changes at most the spec, never the verdict); the
// artifact re-verifies byte-identically; the copy passes the honesty checker. The matrix re-told (14→18 PRESENT),
// the memo addendum filed, publication re-armed. The F-BUDGET walk projection recorded (the walk is the protected majority).
const p3 = gate.record({
  phase: "phase-3",
  decision: "ADVANCE",
  stamp: "v10-phase3-joined-loop",
  author: "author-run",
  resolutions: [
    { id: "JOINED-LOOP", evidence: ev("joined-loop-v10.json") },
    { id: "console-live", evidence: ev("joined-loop-v10.json") },
    { id: "console-copy-honest", evidence: ev("joined-loop-v10.json") },
    { id: "joined-artifact", evidence: ev("joined-loop-v10.json") },
    { id: "identity-retold-console", evidence: ev("phase3-joined-loop-v10.json") },
    { id: "walk-budget-confirmed", evidence: ev("phase3-joined-loop-v10.json") },
  ],
})
console.log(`#${p3.seq} phase-3 → ${p3.decision}  hash=${p3.hash.slice(0, 12)}…`)

// ── PHASE 4 — CONVERGED-4 (THE WALK v5, the protected majority) ───────────────────────────────────────────────────
// The mandated E2E validation, through the UI/UX, against the PINNED catalog. Four cycles (cleanFlags F,T,T,T): cycle 1
// found ONE genuine finding — W5-01, the Goal Console form had no rate limit unlike the /studio API guard (a DoS vector
// via the UI) — registered BEFORE the fix, root-caused (symptom→mechanism→origin), fixed smallest-change (a per-caller
// rate limit before the sidecar), re-tested (CONSOLE_RL_MAX=3 → 4th+ RATE-LIMITED). Cycles 2-4 CLEAN at full depth: the
// pinned catalog (15 scenarios × 3 mandated classes) traversed in full, every scenario judged against its expected
// honest behavior (a scenario fails by succeeding wrongly). Catalog-complete AND rotation-complete (7 themes) AND two
// consecutive FULL-depth clean AND ≥4 cycles → CONVERGED-4, DERIVED from the register, exactly one terminal, truthfully.
const p4 = gate.record({
  phase: "phase-4",
  decision: "ADVANCE",
  stamp: "v10-phase4-converged-4",
  author: "author-run",
  resolutions: [
    { id: "CONVERGED-4", evidence: ev("walk-v5-cycles.json") },
    { id: "walk-ledger-chained", evidence: ev("walk-v5-ledger.jsonl") },
    { id: "fixes-rootcaused", evidence: ev("walk-v5-cycles.json") },
    { id: "catalog-traversed", evidence: ev("walk-v5-cycles.json") },
    { id: "parks-legitimate", evidence: ev("parks-register.json") },
    { id: "rotation-depth-console", evidence: ev("walk-v5-cycles.json") },
  ],
})
console.log(`#${p4.seq} phase-4 → ${p4.decision}  hash=${p4.hash.slice(0, 12)}…`)

// ── (later phases appended here as they complete) ────────────────────────────────────────────────────────────────

const chain = gate.verifyChain()
console.log(`\ntrail chain ok: ${chain.ok}${chain.ok ? "" : ` (broken at #${chain.brokenAt})`}`)
console.log(`independence: ${gate.independence()}`)
console.log("\n" + gate.render())

const trail = { protocol: "checkpoint-trail-v10", criteriaSetSha: Criteria.enduserCriteriaSha(), chainOk: chain.ok, independence: gate.independence(), records: gate.trail() }
writeFileSync(path.join(D, "checkpoint-trail-v10.json"), JSON.stringify(trail, null, 2) + "\n")
console.log(`\ntrail written: data/studio/checkpoint-trail-v10.json`)
