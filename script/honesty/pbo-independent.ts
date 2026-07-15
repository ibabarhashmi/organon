/**
 * ORGΛNON — THE VARIANT SPRINT (V41), Phase 3: THE PBO CROSS-CHECK, MADE INDEPENDENT (S163, L-3). NO NEW LAW.
 *
 * Emits data/honesty/pbo-independent.json — the record that the degenerate `0.6 vs 0.6` (cc.pbo vs cc.pboPurgedcv, shared
 * lineage) is RETIRED, the PBO agreement's theirs leg is now the GENUINELY INDEPENDENT hand-rolled CSCV, and that
 * independent CSCV is PROVEN to DETECT on constructed KNOWN-non-trivial fixtures (≈0.5 noise / ≈0 edge — RP-3). Clone-stable:
 * the CSCV is ported from rigor.py::pbo (READ, never edited); the fixtures are built by a deterministic PRNG.
 *
 * Run: bun run script/honesty/pbo-independent.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { CrossCheck, Signability } from "../../src/backtest/crosscheck"

const pi = CrossCheck.pboIndependent()
if (!pi) {
  console.log("cross-check BLOCKED — pbo-independent not emitted (the sidecar venv/purgedcv is absent; honest gap, not faked)")
  process.exit(0)
}
const d = Signability.d33()
const OUT = {
  protocol: "pbo-independent",
  at: "2026-07-15",
  rule: "S163 (L-3 / DD-71a / RP-3): the degenerate 0.6-vs-0.6 (cc.pbo vs cc.pboPurgedcv, byte-identical shared lineage) is RETIRED; the PBO agreement's theirs leg is now the GENUINELY INDEPENDENT hand-rolled CSCV, PROVEN to DETECT on constructed KNOWN-non-trivial fixtures. 0.6-vs-0.6 never again masquerades as agreement between the same code. D33's state/testRedesigns/the bundle are UNCHANGED; the frozen PBO is READ, never touched.",
  ...pi,
  d33StateUnchanged: { state: d.state, testRedesigns: d.testRedesigns, note: "SIGNABLE unchanged — the degenerate leg was replaced by the independent one, not the verdict (a derived, bundle-safe D33.pboEvidence field records it)" },
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "pbo-independent.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── THE PBO CROSS-CHECK, MADE INDEPENDENT (V41) ───────────────────")
console.log(`  degenerate retired : ${pi.degenerateRetired.leg} (Δ ${pi.degenerateRetired.delta.toExponential(1)} — shared lineage)`)
console.log(`  independent leg    : ${pi.independentLeg.name} — ours ${pi.independentLeg.ours} vs theirs ${pi.independentLeg.theirs} → agrees ${pi.independentLeg.agrees}`)
console.log(`  detection proof    : noise ${pi.detectionProof.noise.pbo.toFixed(3)} (≈0.5) · edge ${pi.detectionProof.edge.pbo.toFixed(3)} (≈0) · detectable ${pi.detectionProof.detectable}`)
console.log(`  D33 state          : ${d.state} (testRedesigns ${d.testRedesigns}) — UNCHANGED`)
console.log("written: data/honesty/pbo-independent.json")
