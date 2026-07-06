/**
 * ORGΛNON — the DATA-PLANE checkpoint driver (gatekeeper v2 against the pinned + verbatim-printed criteria). Each
 * phase's decision records ONLY with hash-resolving evidence per criterion (H-GATE); gate criteria are UNAMENDABLE
 * (L-GATE2); a phase reporting arms takes headline = MIN(arms) (C-ARMS). The trail is hash-chained, append-only,
 * committed. Deterministic: re-running regenerates the trail from the evidence. Extended phase-by-phase as the sprint
 * proceeds. Run: bun run script/checkpoint-v9.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Checkpoint } from "../src/studio/checkpoint"
import { Criteria } from "../src/studio/criteria"

const D = path.join(PKG_ROOT, "data", "studio")
const ev = (name: string) => Checkpoint.pin(path.join(D, name))

const CRIT = Criteria.DATAPLANE
const gate = new Checkpoint.Gate()
for (const [phase, crits] of Object.entries(CRIT)) gate.declare(phase, crits)

// ── PHASE 0 — CENSUS-TRUE ─────────────────────────────────────────────────────────────────────────────────────────
// Two instruments before any porting: the census that proves the existing controls are IN THE WAY (23 controls → each
// with an enforcement point + a demonstrated refusal; a seeded decorative control CAUGHT; the publication chokepoint
// EXECUTED to exit-1 refusal), and the oracle that will judge the port (the monorepo's byte-identical lending engine
// reproduces a HAND-VERIFIED 1.0001-per-day compounding, the old tree unchanged before/after). Plus the bookkeeping:
// the per-domain scope contract (lending DELIVER · funding/fee-yield ATTEMPT-else-BLOCKED · RWA BLOCKED-on-credential),
// criteria printed verbatim beside the pin, the floor/absences baseline re-anchored (38→40).
const p0 = gate.record({
  phase: "phase-0",
  decision: "ADVANCE",
  stamp: "v9-phase0-census-true",
  author: "author-run",
  resolutions: [
    { id: "CENSUS-TRUE", evidence: ev("census-v9.json") },
    { id: "census-complete", evidence: ev("census-v9.json") },
    { id: "seeded-dangling-caught", evidence: ev("census-v9.json") },
    { id: "oracle-proven", evidence: ev("oracle-v9.json") },
    { id: "scope-contract", evidence: ev("scope-contract-v9.json") },
    { id: "criteria-printed-baseline", evidence: ev("phase0-baseline-v9.json") },
  ],
})
console.log(`#${p0.seq} phase-0 → ${p0.decision}  hash=${p0.hash.slice(0, 12)}…`)

// ── PHASE 1 — STORE-TRUE ──────────────────────────────────────────────────────────────────────────────────────────
// The data plane's foundation, standalone-native by construction. The permanent leak wall (0 leaks in src/dataplane; a
// seeded bun:sqlite / @solidity-sentinel import CAUGHT). Real DefiLlama lending capture: 5 large stablecoin pools,
// 757–1245 real daily points each (2023–2026), into content-addressed immutable snapshots + a nonce-anchored,
// hash-chained provenance chain (the clock-stamp pattern reused). Gap-honest (asOf carries the prior real point across a
// missing day, no interpolation). The RWA path built + BLOCKED-on-credential (FRED unset, snapshot absent); the key
// never committed (grep-wall clean). A retro-captured (nonce-less) stamp cannot verify.
const p1 = gate.record({
  phase: "phase-1",
  decision: "ADVANCE",
  stamp: "v9-phase1-store-true",
  author: "author-run",
  resolutions: [
    { id: "STORE-TRUE", evidence: ev("phase1-store-true-v9.json") },
    { id: "leak-wall", evidence: ev("phase1-store-true-v9.json") },
    { id: "snapshots-provenance-chained", evidence: ev("capture-dataplane-v9.json") },
    { id: "gap-honest", evidence: ev("phase1-store-true-v9.json") },
    { id: "rwa-blocked-rendered", evidence: ev("capture-dataplane-v9.json") },
  ],
})
console.log(`#${p1.seq} phase-1 → ${p1.decision}  hash=${p1.hash.slice(0, 12)}…`)

// ── PHASE 2 — DIFF-PROVEN ─────────────────────────────────────────────────────────────────────────────────────────
// The engine home, seam-faithful and oracle-judged. The TS layer (commonWindow + a slim lending buildJob) re-homed
// standalone-native onto the Phase-1 store, driving the byte-identical sidecar. The differential: a real captured
// lending fixture (3 markets, carry-tilt, 766 pts) → a hash-pinned Job → BOTH the frozen monorepo oracle AND the
// standalone port → BYTE-IDENTICAL equity (oracleSha==portSha). The sidecar regression-lock: lending_accrual.py
// byte-identical to the oracle (sha 957654b3…). The direction-blind seeded divergence (a flattering +1.0 apyBase
// transform) CAUGHT. The old tree UNCHANGED (git status pasted). RWA differential BLOCKED-on-credential, stated —
// a blocked differential is honest, a skipped one is a Halt. headline = MIN(per-domain arms).
const p2 = gate.record({
  phase: "phase-2",
  decision: "ADVANCE",
  stamp: "v9-phase2-diff-proven",
  author: "author-run",
  resolutions: [
    { id: "DIFF-PROVEN", evidence: ev("differential-v9.json") },
    { id: "per-domain-differential", evidence: ev("differential-v9.json") },
    { id: "seeded-divergence-caught", evidence: ev("differential-v9.json") },
    { id: "sidecar-regression-lock", evidence: ev("differential-v9.json") },
    { id: "blocked-stated", evidence: ev("differential-v9.json") },
  ],
})
console.log(`#${p2.seq} phase-2 → ${p2.decision}  hash=${p2.hash.slice(0, 12)}…`)

// ── PHASE 3 — REAL-TRUE ───────────────────────────────────────────────────────────────────────────────────────────
// The payoff, honest. The REAL-PIT live path: a stablecoin-lending-carry goal → the ported engine on REAL captured
// snapshots → an adjudication whose returns are REAL-PIT with provenance traceable to 3 chained snapshots; the verdict
// is the core's, relayed verbatim = NO-GO (a REAL-PIT NO-GO is the product working). The family-size deflation re-run
// on REAL returns (a labeled, non-conflated successor to the ILLUSTRATIVE trial-2; dsr 0.147 → 0.0006). The conversions:
// real-returns-live-path (P2-1) CONVERTED → capability real-returns-realpit; engine-backtest (P1-1) NARROWED (lending
// landed) → park PARTIALLY CLOSED; every conversion proof-backed, lossesUncovered=0. The two-way door BLOCKED-on-
// credential, the pin UNCHANGED (zero re-pins). The identity re-told: matrix 11→14 PRESENT / 4→3 ABSENT, re-rendered
// from code (byte-match re-locked), memo addendum filed, publication re-armed against the NEW matrix (re-ratification).
const p3 = gate.record({
  phase: "phase-3",
  decision: "ADVANCE",
  stamp: "v9-phase3-real-true",
  author: "author-run",
  resolutions: [
    { id: "REAL-TRUE", evidence: ev("phase3-real-true-v9.json") },
    { id: "real-pit-live", evidence: ev("real-returns-v9.json") },
    { id: "deflation-demo-realpit", evidence: ev("deflation-demo-realpit-v9.json") },
    { id: "conversions-proof-backed", evidence: ev("phase3-real-true-v9.json") },
    { id: "two-way-door", evidence: ev("two-way-door-v9.json") },
    { id: "identity-retold", evidence: ev("phase3-real-true-v9.json") },
  ],
})
console.log(`#${p3.seq} phase-3 → ${p3.decision}  hash=${p3.hash.slice(0, 12)}…`)

// ── PHASE 4 — CONVERGED-3 (THE WALK v4, the protected majority, RAISED floor) ─────────────────────────────────────
// The walk of the WHOLE organism on REAL DATA. Four FULL-depth cycles (cleanFlags F,T,T,T): cycle 1 surfaced 1 GENUINE
// finding (W4-01 — the committed differential fixture embedded the raw captured data, an A′#12 inconsistency) + 1
// REFUTED candidate (a tamper-probe regex error; a correct tamper IS refused — the store integrity holds); the genuine
// one fixed (464KB → 1186B slim fixture, re-derived from snapshots). Cycles 2–4 CLEAN at full depth, with a prior-cycle
// replay each and the PIT-inclusive pollution spot-audit. Rotation complete (all 7 data-plane-aware themes) AND two
// consecutive FULL-depth clean AND ≥4 cycles → CONVERGED-3 at the raised floor (D-WALK+), exactly one terminal, truthfully.
const p4 = gate.record({
  phase: "phase-4",
  decision: "ADVANCE",
  stamp: "v9-phase4-converged-3",
  author: "author-run",
  resolutions: [
    { id: "CONVERGED-3", evidence: ev("walk-v4-cycles.json") },
    { id: "walk-ledger-chained", evidence: ev("walk-v4-ledger.jsonl") },
    { id: "fixes-inventoried", evidence: ev("walk-v4-cycles.json") },
    { id: "parks-legitimate", evidence: ev("parks-register.json") },
    { id: "rotation-depth-raised", evidence: ev("walk-v4-cycles.json") },
  ],
})
console.log(`#${p4.seq} phase-4 → ${p4.decision}  hash=${p4.hash.slice(0, 12)}…`)

// ── (later phases appended here as they complete) ────────────────────────────────────────────────────────────────

const chain = gate.verifyChain()
console.log(`\ntrail chain ok: ${chain.ok}${chain.ok ? "" : ` (broken at #${chain.brokenAt})`}`)
console.log(`independence: ${gate.independence()}`)
console.log("\n" + gate.render())

const trail = { protocol: "checkpoint-trail-v9", criteriaSetSha: Criteria.dataplaneCriteriaSha(), chainOk: chain.ok, independence: gate.independence(), records: gate.trail() }
writeFileSync(path.join(D, "checkpoint-trail-v9.json"), JSON.stringify(trail, null, 2) + "\n")
console.log(`\ntrail written: data/studio/checkpoint-trail-v9.json`)
