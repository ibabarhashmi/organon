/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 1 (DD-53/RP-2): emit the effective_n axis determination, DERIVED from the frozen
 * code (X-SHOWN). The D33 rider reads THIS artifact — the autopsy meeting the signature. Run: bun run script/honesty/effectiven-determination.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { EffectiveN } from "../../src/backtest/effectiven"

const det = EffectiveN.derive()
const OUT = {
  protocol: "effective-n-determination",
  at: "2026-07-15",
  question: "DD-53/RP-2 (J-2): WHICH independence does the frozen effective_n.py measure — SERIAL (Lo's autocorrelation axis) or CROSS-SECTIONAL (independent bets)? And can its serial correction be WIRED into the frozen rigor.psr without touching one frozen byte? Established BEFORE any wiring; a fix on the wrong axis retires the warning.",
  derivedNotAsserted: "this determination is DERIVED by src/backtest/effectiven.ts reading the frozen effective_n.py + rigor.py source text (X-SHOWN — the code lines are the evidence); the D33 rider reads this file, never re-decides.",
  ...det,
  standingRule: "D33: SIGNABLE and this i.i.d. rider render ON THE SAME LINE at the gate (S142). rigor.py stays BYTE-FROZEN — the correction is a harness companion + a render caveat, NEVER an edit to the frozen formula (the exact FLAG-DON'T-EMIT the V38 math red team routed).",
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "effective-n-determination.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── FAMILY — the autopsy meets the signature (DD-53/RP-2) ────────")
console.log(`  axes present        : ${det.axesPresent.join(" + ")}`)
console.log(`  relevant axis       : ${det.relevantAxis} (the i.i.d. limitation is serial)`)
console.log(`  frozen psr derives n: ${det.frozenPsrDerivesNInternally}  (√(n−1), no n parameter)`)
console.log(`  classification      : ${det.classification}`)
console.log(`  rider               : ${det.riderStands ? "STANDS, quantified" : "DISSOLVED"}`)
console.log(`  demo τ_int          : ${det.demoTauInt.toFixed(1)}  (N_eff/N ≈ ${(det.demoEffNRatio * 100).toFixed(1)}%)`)
console.log("written: data/honesty/effective-n-determination.json")
