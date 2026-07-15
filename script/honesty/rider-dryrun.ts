/**
 * ORGΛNON — THE VARIANT SPRINT (V41), Phase 4: THE RIDER, EXERCISED IN A DARK DRY-RUN (S164, L-4). NO NEW LAW.
 *
 * Emits data/honesty/rider-dryrun.json — the enforcement path RUN against a REAL autocorrelated series (the clone-stable
 * AR(1) demonstration; the V26 funding panel τ_int 27–165 is the recorded raw-gitignored evidence). It computes the naive +
 * Newey–West-corrected statistics and the enforcement decision IF the meter were lit, and renders NOTHING LIT (D63 off).
 * RP-5: this is a TEST ARTIFACT, asserted by the wall — NEVER wired to the drawer or the door. A computation that must stay
 * dark lives in a test fixture, not one refactor from a screen.
 *
 * Run: bun run script/honesty/rider-dryrun.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Rider } from "../../src/backtest/rider"

const dry = Rider.darkDryRun()
const OUT = {
  protocol: "rider-dryrun",
  at: "2026-07-15",
  rule: "S164 (L-4 / RP-5): the rider's enforcement, run against a REAL autocorrelated series, DARK. The naive + Newey–West-corrected statistics and the enforcement decision are COMPUTED; NOTHING is rendered lit (D63 off, familyN === 1). This artifact is a TEST FIXTURE — the wall asserts it; it is NEVER wired to a render surface (the drawer, the door). A computation that must stay dark lives here, not one refactor from a screen.",
  ...dry,
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "rider-dryrun.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── THE RIDER, EXERCISED IN A DARK DRY-RUN (V41) ──────────────────")
console.log(`  series      : ${dry.series.slice(0, 60)}…`)
console.log(`  τ_int       : ${dry.tauInt.toFixed(1)} · naive t ${dry.naive.toFixed(3)} · corrected t ${dry.corrected.toFixed(3)} · √τ ${Math.sqrt(dry.tauInt).toFixed(1)}×`)
console.log(`  triggered   : ${dry.triggered}  · enforcement-if-lit: ${dry.enforcementIfLit.ok ? "any permitted" : "naive REFUSED → CORRECTED/UNJUDGEABLE"}`)
console.log(`  renderedLit : ${dry.renderedLit}  ← NOTHING lit (D63 off; RP-5: a test artifact, not a render surface)`)
console.log("written: data/honesty/rider-dryrun.json")
