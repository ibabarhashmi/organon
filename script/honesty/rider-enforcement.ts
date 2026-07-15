/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 2: emit the rider-enforcement artifact (S157, D76). The harness composes the
 * frozen Newey–West correction and records BOTH statistics with τ_int beside them, the own-series report (the measured
 * answer, F-3), the compounded generosity (A′ #9), and the enforcement's biting demonstration — the SOLE input to the
 * build log's RIDER + COMPOUNDED GENEROSITY blocks. checkFrozenSet stays 0 drift (the correction is in the harness).
 *
 * Run: bun run script/honesty/rider-enforcement.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Rider } from "../../src/backtest/rider"
import { checkFrozenSet } from "../../src/organon/frozen"

const report = Rider.ownSeriesReport()
const compounded = Rider.compoundedGenerosity()
const th = Rider.threshold()
const drift = checkFrozenSet().filter((c) => c.status === "drift").length

const OUT = {
  protocol: "rider-enforcement",
  at: "2026-07-15",
  rule: "S157 (K-5, D76) — the frozen Newey–West correction, COMPOSED beside the naive statistic (never wired into the frozen core — HARNESS-COMPOSITION-GAP). Renders BOTH with τ_int beside them (RP-3); enforces CORRECTED-or-UNJUDGEABLE when deflation is active and √τ_int exceeds the pre-registered trigger; computes the compounded generosity (A′ #9). checkFrozenSet 0 drift.",
  threshold: { ...th, derivedFrom: "the Stamp's DSR 0.95 GO bar (z* = Φ⁻¹(0.95)); the inflation factor is √τ_int; a 1.5× inflation flips any naive-GO within 50% of the bar — PRE-REGISTERED before measurement (X-DERIVE(f), F-3)" },
  ownSeriesReport: report,
  compoundedGenerosity: compounded,
  enforcement: {
    seededNaiveOnAutocorrelated: Rider.enforce("naive", { deflationActive: true, tauInt: 100 }), // → ok:false (bites)
    correctedPermitted: Rider.enforce("corrected", { deflationActive: true, tauInt: 100 }), // → ok:true
    deflationOffArmedNotFiring: Rider.enforce("naive", { deflationActive: false, tauInt: 100 }), // → ok:true (D63 OFF)
  },
  frozenDrift: drift,
  riderEnforced: true,
}

writeFileSync(path.join(PKG_ROOT, "data", "honesty", "rider-enforcement.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── RIDER, ENFORCED (V40) ─────────────────────────────────────────")
console.log(`  threshold              : √τ_int ≥ ${th.inflationTrigger} ⟺ τ_int ≥ ${th.tauIntTrigger} (pre-registered from the DSR 0.95 cut-point)`)
console.log(`  demonstration          : AR(1) τ_int ${Number(report.demonstration.tauInt).toFixed(1)} · √τ ${Number(report.demonstration.sqrtTauInt).toFixed(2)}× → TRIGGERS`)
console.log(`  committed captured     : ${report.capturedExceeding} of ${report.capturedTotal} trigger (TVL/peg returns near-white — the measured answer)`)
console.log(`  funding panel (V26)    : τ_int 27–165 → √τ 5–13× → WOULD trigger (raw gitignored)`)
console.log(`  compounded generosity  : D27 (generous, 15 sprints) + ≈${compounded.overstatementFactor.toFixed(1)}× overstatement → STACK`)
console.log(`  enforcement bites      : ${OUT.enforcement.seededNaiveOnAutocorrelated.ok === false}`)
console.log(`  frozen drift           : ${drift}`)
console.log("written: data/honesty/rider-enforcement.json")
