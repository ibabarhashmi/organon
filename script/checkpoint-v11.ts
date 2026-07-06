/**
 * ORGΛNON — the SPINE checkpoint driver (gatekeeper v2 against the pinned + verbatim-printed criteria). Each phase's
 * decision records ONLY with hash-resolving evidence per criterion (H-GATE); gate criteria are UNAMENDABLE (L-GATE2); a
 * phase reporting arms takes headline = MIN(arms) (C-ARMS). The trail is hash-chained, append-only, committed.
 * Deterministic: re-running regenerates the trail from the evidence. Extended phase-by-phase. Run: bun run script/checkpoint-v11.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Checkpoint } from "../src/studio/checkpoint"
import { Criteria } from "../src/studio/criteria"

const D = path.join(PKG_ROOT, "data", "studio")
const ev = (name: string) => Checkpoint.pin(path.join(D, name))

const CRIT = Criteria.SPINE
const gate = new Checkpoint.Gate()
for (const [phase, crits] of Object.entries(CRIT)) gate.declare(phase, crits)

// ── PHASE 0 — RATIFIED-TRUE ───────────────────────────────────────────────────────────────────────────────────────
// Research becomes constitution only by ratification. The adoption/deferral/rejection table filed as 13 hash-chained
// VALUES (5 ADOPT · 4 PARK-WITH-EXPERIMENT · 4 REJECT), each with flip-criteria; ADOPT rows cite their specific research
// finding + cheap test + build artifacts; PARK rows carry the four fields + a designed experiment; REJECT rows carry
// reason + flip-criteria. The value schema refuses an adoption-as-prose, a park without its experiment, a disposition
// without flip-criteria. The VoC effective-DoF charge mapping is PINNED (sha256) inside the value pre-first-run (R-DOF).
// The catalog v11 (23 scenarios: v10's 15 + 8 spine surfaces) pinned BEFORE any surface exists. Criteria printed
// verbatim; floor baseline 52; prevention walls green on seeds. The ratification wall refuses an unratified artifact.
const p0 = gate.record({
  phase: "phase-0",
  decision: "ADVANCE",
  stamp: "v11-phase0-ratified-true",
  author: "author-run",
  resolutions: [
    { id: "RATIFIED-TRUE", evidence: ev("phase0-ratified-true-v11.json") },
    { id: "ratification-table-filed", evidence: ev("research-ratification-v11.json") },
    { id: "ratification-wall-live", evidence: ev("phase0-ratified-true-v11.json") },
    { id: "catalog-v11-pinned", evidence: ev("e2e-catalog-pin-v11.json") },
    { id: "criteria-printed-baseline", evidence: ev("phase0-baseline-v11.json") },
  ],
})
console.log(`#${p0.seq} phase-0 → ${p0.decision}  hash=${p0.hash.slice(0, 12)}…`)

// ── PHASE 1 — BREADTH-TRUE ────────────────────────────────────────────────────────────────────────────────────────
// The Fundamental Law as a product surface. THE CHEAP TEST RAN FIRST: synthetic strategies with KNOWN IC/BR recovered
// within a pinned tolerance (IC err ≤ 0.009 vs the population Spearman; BR within 0.6%), the Fundamental-Law identity
// IR = IC·√BR demonstrated against a realized annualized Sharpe (Pearson terms, err ≤ 0.8%), the ETA arithmetic
// hand-verified first-principles (IC=0.1, BR=252 → IR 1.5875 → 1.5873 years at t*=2). The breadth panel (IC=Spearman,
// BR honest about autocorrelation with the independence assumption STATED, TC, IR=TC·IC·√BR); the ETA a hedged RANGE
// (never a point; assumptions listed; the floor-audit hedge verbatim; a high-IC/tiny-BR strategy renders 'may never
// reach power'); the pro-disclosure toggle (display-only, derives nothing, SCREENS stays 8). VERDICT DIFFERENTIAL
// byte-identical (the fixed submission set re-derives the exact verdicts — the panel moved nothing, R-ADVISORY).
const p1 = gate.record({
  phase: "phase-1",
  decision: "ADVANCE",
  stamp: "v11-phase1-breadth-true",
  author: "author-run",
  resolutions: [
    { id: "BREADTH-TRUE", evidence: ev("phase1-breadth-v11.json") },
    { id: "breadth-cheap-test-first", evidence: ev("phase1-breadth-v11.json") },
    { id: "eta-hedged-range", evidence: ev("phase1-breadth-v11.json") },
    { id: "toggle-derives-nothing", evidence: ev("phase1-breadth-v11.json") },
    { id: "breadth-verdict-differential", evidence: ev("verdict-fingerprints-v11.json") },
  ],
})
console.log(`#${p1.seq} phase-1 → ${p1.decision}  hash=${p1.hash.slice(0, 12)}…`)

// ── PHASE 2 — CPCV-TRUE ───────────────────────────────────────────────────────────────────────────────────────────
// Overfitting measured a second, independent way — advisory, beside the frozen gates. THE GOLDEN PAIR RAN FIRST: a
// known-overfit fixture (50 pure-noise trials) flagged HIGH (PBO 60%); a known-signal fixture (one planted edge among
// noise) passed LOW (PBO 7%, OOS-Sharpe median +0.168) — both directions. The config is PINNED (groups 10 · purge 1 ·
// embargo 1 · budget 5000ms), not tunable per-run (run() has no config knob). Real runtime ~31ms << budget. SKIPPED is
// a first-class honest state (short series → group size < 5; single trial → cannot cross-validate). A CPCV-vs-frozen
// DISAGREEMENT (CPCV overfit-unlikely, the frozen gate NO-GO under deflation) renders as INFORMATION, never averaged.
// The promotion-to-gating decision PARKED with pre-registered criteria (A′#10). Verdict differential byte-identical.
const p2 = gate.record({
  phase: "phase-2",
  decision: "ADVANCE",
  stamp: "v11-phase2-cpcv-true",
  author: "author-run",
  resolutions: [
    { id: "CPCV-TRUE", evidence: ev("phase2-cpcv-v11.json") },
    { id: "cpcv-golden-pair", evidence: ev("phase2-cpcv-v11.json") },
    { id: "cpcv-config-pinned-skipped", evidence: ev("phase2-cpcv-v11.json") },
    { id: "cpcv-promotion-parked", evidence: ev("cpcv-promotion-park-v11.json") },
    { id: "cpcv-verdict-differential", evidence: ev("verdict-fingerprints-v11.json") },
  ],
})
console.log(`#${p2.seq} phase-2 → ${p2.decision}  hash=${p2.hash.slice(0, 12)}…`)

// ── PHASE 3 — COMPLEXITY-PAYS ─────────────────────────────────────────────────────────────────────────────────────
// The frontier reconciled — behind the hardest wall in the codebase. ROOT-CAUSE FINDING (documented): a d-parameter
// ridge fit has an in-sample t-stat ~√d, which NO best-of-n deflation neutralises (needs n_trials=exp(d/2)); so an
// in-sample eval cannot be made safe by any charge — the honest fix is OUT-OF-SAMPLE evaluation. THE NOISE WALL RAN
// FIRST (OOS): pure noise across 50 seeds × feature counts {30,40,50,80} → ZERO survivors (maxDSR ≤ 0.45 << 0.95). The
// KILL-SWITCH proven by a seeded survivor (the in-sample BUG → 39/40 survive → class DISABLED, a first-class finding).
// The DoF mapping PINNED pre-first-run (sha256 d79fc655… == the Phase-0 ratification value; a post-hoc change refused).
// The charge is LOAD-BEARING: a series believable at 1 trial (DSR 0.970) is deflated away by the 38-trial charge (DSR
// 0.328), monotonically. One real OOS proposal end-to-end: cost the family 38 trials (effective DoF 37.9), EXPERIMENTAL,
// two-sided attribution. The proposer touches SPECS not verdicts (a poisoned 'return GO' spec = the clean verdict).
// Every exploration charged (propose yields no verdict; the only path registers at dofCharge). Verdict differential byte-identical.
const p3 = gate.record({
  phase: "phase-3",
  decision: "ADVANCE",
  stamp: "v11-phase3-complexity-pays",
  author: "author-run",
  resolutions: [
    { id: "COMPLEXITY-PAYS", evidence: ev("phase3-voc-v11.json") },
    { id: "voc-noise-wall-first", evidence: ev("phase3-voc-v11.json") },
    { id: "voc-mapping-pinned", evidence: ev("phase3-voc-v11.json") },
    { id: "voc-every-exploration-charged", evidence: ev("phase3-voc-v11.json") },
    { id: "voc-charge-visible-experimental", evidence: ev("phase3-voc-v11.json") },
  ],
})
console.log(`#${p3.seq} phase-3 → ${p3.decision}  hash=${p3.hash.slice(0, 12)}…`)

// ── PHASE 4 — BASIS-ATTEMPTED ─────────────────────────────────────────────────────────────────────────────────────
// The first cross-venue domain, at its TRUE tier. THE CHEAP TEST RAN FIRST: the Hyperliquid public endpoint probed
// (free, keyless — reachable), and a first-principles HAND-VERIFIED basis fixture (Binance T1 8h intervals + hand-
// captured Hyperliquid points → the basis computed by hand: annualize(0.0001,8)=0.1095, basis=[0.0295,-0.031,-0.0595])
// reproduced BYTE-FOR-BYTE. The basis tier = MIN(legs) = T2 on every point; a T1 label on a T2-legged basis is refused;
// a gap is NOT bridged; the divergence view renders the spread's instability. DELIVERED: a LIVE T2-forward capture
// (Hyperliquid BTC/ETH/SOL nonce-chained, 2 BTC runs, chain ok) + a real 63-point cross-venue basis (Binance vs
// Hyperliquid, aligned by the hour) adjudicated at tier T2 (basis-capture-v11.json). ATTEMPT-law DELIVERED-with-fixture
// -proof. The RWA pin untouched; the frozen seven untouched. F-BUDGET walk projection recorded.
const p4 = gate.record({
  phase: "phase-4",
  decision: "ADVANCE",
  stamp: "v11-phase4-basis-attempted",
  author: "author-run",
  resolutions: [
    { id: "BASIS-ATTEMPTED", evidence: ev("phase4-basis-v11.json") },
    { id: "basis-cheap-test-first", evidence: ev("phase4-basis-v11.json") },
    { id: "basis-min-tier-labeled", evidence: ev("phase4-basis-v11.json") },
    { id: "basis-attempt-resolved", evidence: ev("basis-capture-v11.json") },
    { id: "basis-pin-unchanged-budget", evidence: ev("phase4-basis-v11.json") },
  ],
})
console.log(`#${p4.seq} phase-4 → ${p4.decision}  hash=${p4.hash.slice(0, 12)}…`)

// ── PHASE 5 — CONVERGED-5 (THE WALK v6, the protected majority) ───────────────────────────────────────────────────
// The mandated E2E validation, through the UI/console first, against the PINNED catalog v11 (23 scenarios: v10's 15 +
// the 8 spine surfaces). Four cycles (cleanFlags F,T,T,T): cycle 1 found THREE genuine findings — W6-01 (the spine
// panels were built but NOT surfaced through the Goal Console — a refused user could see neither 'why' nor 'when'),
// W6-02 (the 'why not yet' framing was not refusal-aware — a GO must not say 'not yet', the ux-priming crosshairs), and
// W6-03 (the walk's own S3 check over-specified a PBO threshold not in the scenario's expected behavior — the CPCV
// product was correct) — each registered BEFORE the fix, root-caused (symptom→mechanism→origin), fixed smallest-change,
// re-tested. Cycles 2-4 CLEAN at full depth: catalog v11 traversed in full, every scenario judged against its expected
// honest behavior. Catalog-complete AND rotation-complete (7 spine-aware themes) AND two consecutive FULL-depth clean
// AND ≥4 cycles → CONVERGED-5, DERIVED from the register, exactly one terminal, truthfully.
const p5 = gate.record({
  phase: "phase-5",
  decision: "ADVANCE",
  stamp: "v11-phase5-converged-5",
  author: "author-run",
  resolutions: [
    { id: "CONVERGED-5", evidence: ev("walk-v6-cycles.json") },
    { id: "walk-ledger-chained", evidence: ev("walk-v6-ledger.jsonl") },
    { id: "fixes-rootcaused", evidence: ev("walk-v6-cycles.json") },
    { id: "catalog-traversed", evidence: ev("walk-v6-cycles.json") },
    { id: "parks-legitimate", evidence: ev("parks-register.json") },
    { id: "rotation-depth-spine", evidence: ev("walk-v6-cycles.json") },
  ],
})
console.log(`#${p5.seq} phase-5 → ${p5.decision}  hash=${p5.hash.slice(0, 12)}…`)

// ── (later phases appended here as they complete) ────────────────────────────────────────────────────────────────

const chain = gate.verifyChain()
console.log(`\ntrail chain ok: ${chain.ok}${chain.ok ? "" : ` (broken at #${chain.brokenAt})`}`)
console.log(`independence: ${gate.independence()}`)
console.log("\n" + gate.render())

const trail = { protocol: "checkpoint-trail-v11", criteriaSetSha: Criteria.spineCriteriaSha(), chainOk: chain.ok, independence: gate.independence(), records: gate.trail() }
writeFileSync(path.join(D, "checkpoint-trail-v11.json"), JSON.stringify(trail, null, 2) + "\n")
console.log(`\ntrail written: data/studio/checkpoint-trail-v11.json`)
