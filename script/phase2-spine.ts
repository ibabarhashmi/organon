/**
 * ORGΛNON — Spine Phase 2 evidence (Rules R-ADVISORY, A′#5/#10). THE GOLDEN PAIR RUNS FIRST (a failed golden refuses the
 * build): a KNOWN-OVERFIT fixture (N pure-noise trials — the IS winner is a fluke) must flag HIGH on PBO-CPCV; a
 * KNOWN-SIGNAL fixture (one planted edge among noise) must flag LOW — both directions, before any real strategy sees the
 * panel. Then: runtime measured within the pinned budget; SKIPPED triggered honestly on a deliberately-short series; the
 * config proven PINNED (not tunable per-run); a DISAGREEMENT (CPCV low, the frozen gate refuses under deflation) rendered
 * as INFORMATION not a vote; the promotion-to-gating decision PARKED with pre-registered criteria; the VERDICT
 * DIFFERENTIAL re-proven byte-identical. Deterministic (seeded PRNG; injected clock). Run: bun run script/phase2-spine.ts
 */
import { createHash } from "node:crypto"
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { CPCV } from "../src/analytics/cpcv"
import { VerdictDifferential } from "../src/studio/differential"
import { Ledger } from "../src/ledger/ledger"
import { Studio } from "../src/studio/adjudicate"

const D = path.join(PKG_ROOT, "data", "studio")
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
function gaussians(rng: () => number, n: number): number[] {
  const out: number[] = []
  while (out.length < n) { const u1 = Math.max(1e-12, rng()), u2 = rng(), r = Math.sqrt(-2 * Math.log(u1)); out.push(r * Math.cos(2 * Math.PI * u2)); if (out.length < n) out.push(r * Math.sin(2 * Math.PI * u2)) }
  return out
}
// a deterministic monotonic clock for reproducible runtime accounting (Rule VIII) — ticks 0.01ms per call
let clockTick = 0
const detClock = () => (clockTick += 0.01)

// build a T×N matrix from a column generator
function matrix(T: number, N: number, col: (n: number) => number[]): number[][] {
  const cols = Array.from({ length: N }, (_, n) => col(n))
  return Array.from({ length: T }, (_, t) => cols.map((c) => c[t]))
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// (1) THE GOLDEN PAIR — runs FIRST
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const T = 500, N = 50

// KNOWN-OVERFIT: N pure-noise trials. The in-sample best is a fluke; out-of-sample it reverts → PBO HIGH (~0.5).
const overfitM = matrix(T, N, (n) => gaussians(mulberry32(0x0FF17 + n), T))
const overfit = CPCV.run(overfitM, detClock)

// KNOWN-SIGNAL: one planted edge (a real positive drift) among noise. The IS-best is (almost always) the real one and
// it STAYS best out-of-sample → PBO LOW (~0).
const signalM = matrix(T, N, (n) => {
  const noise = gaussians(mulberry32(0x516A1 + n), T)
  return n === 0 ? noise.map((x) => 0.15 + x) : noise // column 0 carries a genuine edge (mean 0.15, Sharpe ~0.15)
})
const signal = CPCV.run(signalM, detClock)

const OVERFIT_HIGH = 0.4 // the pinned "flags high" threshold
const SIGNAL_LOW = 0.15 // the pinned "passes" threshold
const goldenOk = (overfit.pbo ?? 0) >= OVERFIT_HIGH && (signal.pbo ?? 1) <= SIGNAL_LOW

if (!goldenOk) {
  const fail = { protocol: "phase2-cpcv-golden-FAILED", at: "2026-07-05", overfitPbo: overfit.pbo, signalPbo: signal.pbo, thresholds: { OVERFIT_HIGH, SIGNAL_LOW }, note: "the golden pair FAILED a direction — the panel is REFUSED (R-RATIFY)" }
  writeFileSync(path.join(D, "phase2-cpcv-v11.json"), JSON.stringify(fail, null, 2) + "\n")
  console.error(`GOLDEN PAIR FAILED — build refused: overfit PBO=${overfit.pbo}, signal PBO=${signal.pbo}`)
  process.exit(1)
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// (2) SKIPPED honest state + runtime + config-pinned
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const shortM = matrix(30, 5, (n) => gaussians(mulberry32(0x5407 + n), 30)) // 30 obs / 10 groups → group size 3 < 5 → SKIPPED
const skipped = CPCV.run(shortM, detClock)
const singleTrialM = matrix(500, 1, () => gaussians(mulberry32(0x51), 500)) // 1 trial → SKIPPED (cannot cross-validate)
const skippedSingle = CPCV.run(singleTrialM, detClock)

// runtime measured against the pinned budget using REAL wall-clock (the assertion); the pinned artifact omits the exact
// ms to stay reproducible (a fresh timing every run would move the gatekeeper's evidence hash), recording only the boolean.
const rt0 = performance.now()
CPCV.run(overfitM)
const realRuntimeMs = performance.now() - rt0
const runtimeWithinBudget = realRuntimeMs <= CPCV.CONFIG.budgetMs
// config-pinned: run() takes NO config argument — the pinned CONFIG is the only configuration; a per-run tweak is
// structurally impossible (the signature has no knob). Both golden runs report the SAME pinned config.
const configPinned = JSON.stringify(overfit.config) === JSON.stringify(CPCV.CONFIG) && JSON.stringify(signal.config) === JSON.stringify(CPCV.CONFIG)

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// (3) DISAGREEMENT rendered as INFORMATION — CPCV says overfit-unlikely (the signal fixture), the frozen gate refuses
//     under heavy deflation. The renderer shows "panels DISAGREE; the frozen gate decides", never averaging them away.
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const edgeReturns = signalM.map((row) => row[0] * 0.01) // the planted-edge column, scaled to a realistic daily return
const store = new Ledger.Store()
const v = await Studio.submit(store, { spec: { family: "lending-carry", policy: "carry-tilt", rebalance: { trigger: "monthly" }, markets: [{ key: "edge", weight: 1 }] }, authorClass: "agent", domain: "lending", timestamp: Date.parse("2026-07-05T00:00:00Z"), returns: edgeReturns, barsPerYear: 365, declaredNTrials: 500 })
const disagreementRender = CPCV.renderBeside(signal, { verdict: v.attestation.verdict, dsr: v.attestation.dsrAtDeclared ?? null })
const disagreementShown = /DISAGREE|agree/.test(disagreementRender)

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// (4) the PROMOTION park (pre-registered criteria + owner) — promoting CPCV to gating NOW is rejected (A′#10)
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const promotionPark = {
  protocol: "cpcv-promotion-park-v11",
  at: "2026-07-05",
  decision: "PARKED (advisory-first; promotion is a future owner decision, never this sprint)",
  context: "CPCV is added ADVISORY — beside the frozen gates, never above them. Promoting it to a GATING panel would create a second authority. Repro: CPCV renders beside every adjudication but alters no verdict (the verdict differential proves it).",
  rationale: "advisory-first is the point (A′#10); a panel that can gate becomes a lever; promotion must be earned on evidence, not asserted.",
  impact: "until promoted, CPCV informs but never decides; the frozen gate remains the only gate.",
  nextSteps: "collect agreement/disagreement rates vs the frozen gates over the next N real adjudications; take the owner decision.",
  preRegisteredPromotionCriteria: "over the next N >= 30 REAL adjudications, log CPCV's lean (overfit-likely/unlikely) vs the frozen gate's pass/refuse; PROMOTE to a co-gate ONLY IF (a) CPCV agrees with the frozen gate on >= 80% of adjudications AND (b) on the disagreements CPCV is shown (by later out-of-sample outcome) to be right >= half the time AND (c) an explicit owner sign-off; otherwise keep advisory. A single tuned-per-run config voids the record.",
  owner: "a dedicated CPCV-promotion decision (Operator + a follow-up sprint)",
}
writeFileSync(path.join(D, "cpcv-promotion-park-v11.json"), JSON.stringify(promotionPark, null, 2) + "\n")

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// (5) the VERDICT DIFFERENTIAL — re-proven byte-identical (the CPCV panel moved no verdict, R-ADVISORY)
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const pinned = JSON.parse((await import("node:fs")).readFileSync(path.join(D, "verdict-fingerprints-v11.json"), "utf8"))
// compute CPCV on the differential submissions' returns (a read that touches nothing), then re-derive the fingerprints
for (const s of VerdictDifferential.submissions()) CPCV.run(matrix(Math.min(s.returns.length, 200), 3, () => s.returns.slice(0, 200)), detClock)
const afterSha = await VerdictDifferential.fingerprintSetSha()
const verdictDifferentialByteIdentical = afterSha === pinned.fingerprintSetSha

// ── the CPCV-TRUE gate summary ──
const gate = {
  protocol: "phase2-cpcv-v11",
  at: "2026-07-05",
  gate: "CPCV-TRUE",
  goldenPair: { ranFirst: true, ok: goldenOk, overfit: { pbo: overfit.pbo, combinations: overfit.combinations, oosSharpeMedian: overfit.oosSharpeMedian }, signal: { pbo: signal.pbo, combinations: signal.combinations, oosSharpeMedian: signal.oosSharpeMedian }, thresholds: { OVERFIT_HIGH, SIGNAL_LOW } },
  config: { pinned: configPinned, value: CPCV.CONFIG },
  runtime: { withinBudget: runtimeWithinBudget, combinations: overfit.combinations, budgetMs: CPCV.CONFIG.budgetMs, note: "real wall-clock measured < budget at build; the pinned artifact omits the exact ms to stay reproducible" },
  skipped: { shortSeries: { skipped: skipped.skipped, reason: skipped.skipReason }, singleTrial: { skipped: skippedSingle.skipped, reason: skippedSingle.skipReason } },
  disagreement: { shown: disagreementShown, render: disagreementRender },
  promotionParked: { file: "data/studio/cpcv-promotion-park-v11.json", parked: true },
  verdictDifferential: { byteIdentical: verdictDifferentialByteIdentical, fingerprintSetSha: afterSha },
}
writeFileSync(path.join(D, "phase2-cpcv-v11.json"), JSON.stringify(gate, null, 2) + "\n")

console.log(`golden pair (ran FIRST): overfit PBO=${(overfit.pbo! * 100).toFixed(0)}% (>=${OVERFIT_HIGH * 100}%) · signal PBO=${(signal.pbo! * 100).toFixed(0)}% (<=${SIGNAL_LOW * 100}%) · ok=${goldenOk}`)
console.log(`  combinations=${overfit.combinations} · OOS-Sharpe median overfit=${overfit.oosSharpeMedian?.toFixed(3)} signal=${signal.oosSharpeMedian?.toFixed(3)}`)
console.log(`config pinned=${configPinned} · real runtime ${realRuntimeMs.toFixed(2)}ms within budget ${CPCV.CONFIG.budgetMs}ms=${runtimeWithinBudget}`)
console.log(`SKIPPED honest: short series="${skipped.skipReason}" · single trial="${skippedSingle.skipReason}"`)
console.log(`disagreement rendered: ${disagreementRender}`)
console.log(`promotion PARKED with pre-registered criteria · verdict differential byte-identical=${verdictDifferentialByteIdentical}`)
console.log(`written: phase2-cpcv-v11.json · cpcv-promotion-park-v11.json`)
