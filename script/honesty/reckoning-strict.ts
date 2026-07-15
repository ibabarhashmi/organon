/**
 * ORGΛNON — THE RECKONING SPRINT (V44), Phase 2 (D27, S193, RP-1/RP-2): emit the STRICT-BAR BEFORE/AFTER RECORD.
 *
 * F-1 ground truth: the mass-path evidence bundle 9c1e7bd8 does NOT move (the Stamp is off the mass path and outside the
 * deterministic bundle). But the Stamp's OWN verdict semantics DO change under D27's strict bar (a frozen GO on autocorrelated
 * input becomes INSUFFICIENT once the confidence is corrected for autocorrelation). RP-1 requires that change to be shown,
 * versioned, and diffed — the SCOPED diff manifest. This is it: Strict.strictRecord() grades a pinned set of representative
 * series BOTH ways (naive √(n−1) vs the strict √(N_eff−1)) and records the flips + the synthetic POSITIVE CONTROL that still
 * clears the bar → GO (RP-2). Committed to data/honesty/stamp-strict-record.json; the S193 wall reads it; a fresh clone
 * reproduces it (the series are deterministic LCG, no numpy, no network).
 *
 * Run: bun run script/honesty/reckoning-strict.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Strict } from "../../src/studio/strict"

const rec = Strict.strictRecord()
const out = {
  protocol: "stamp-strict-record",
  at: "2026-07-16",
  rule: "D27/DD-90/S193 — the 'knowingly generous' Stamp is retired: a GO must clear PSR(N_eff) > 0.95 AND observed length > MinTRL (López de Prado / Bailey, the literature's bar). This record grades a pinned set of representative series BOTH ways (naive √(n−1) vs the strict √(N_eff−1)) and shows the GO→INSUFFICIENT flips + the synthetic positive control (RP-2). RP-1 (ground truth): the mass-path bundle 9c1e7bd8 is byte-identical (the Stamp is off it); this versions the Stamp's OWN change, the scoped diff manifest.",
  bundleGroundTruth: "9c1e7bd8 byte-identical — the strict bar and N_eff land in the opt-in Stamp (off the mass path, outside the deterministic bundle: determinism=Scorecard, frozen=git-clean, differential=frozen-attest). The three routes to move the bundle each violate a fence; so it does not move, and this record is the honest diff of what DID change (the Stamp's own verdicts).",
  targetPSR: rec.targetPSR,
  barSource: rec.barSource,
  positiveControlGO: rec.positiveControlGO,
  flips: rec.flips,
  fixtures: rec.fixtures,
  note: rec.note,
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "stamp-strict-record.json"), JSON.stringify(out, null, 2) + "\n")

console.log("── RECKONING — the strict-bar before/after record (D27, S193) ──")
console.log(`  positive control → GO : ${rec.positiveControlGO} (RP-2: the strict Stamp CAN say GO)`)
console.log(`  GO→INSUFFICIENT flips  : ${rec.flips} (the generosity made concrete)`)
for (const f of rec.fixtures) console.log(`   · ${f.strictVerdict.padEnd(12)} psrNaive ${f.psrNaive.toFixed(3)} → psrCorr ${f.psrCorrected.toFixed(3)} (N_eff ${f.nEff.toFixed(0)}/${f.n}, τ ${f.tauInt.toFixed(1)})${f.flipped ? "  ← FLIP" : ""}  ${f.name.split(" (")[0]}`)
console.log("  written: data/honesty/stamp-strict-record.json")
