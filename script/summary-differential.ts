/**
 * ORGΛNON — the SUMMARY DIFFERENTIAL runner (Reachability; Rule U-DERIVED). Regenerates every terminal figure from its
 * source artifact and (optionally) diffs against a prose claim. The terminal checkpoint (Phase 5) runs this on the
 * honest-state's own numbers — a hand-typed figure that disagrees with its artifact is a finding, not a typo.
 * Run: bun run script/summary-differential.ts   (prints the derived figures)
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Summary } from "../src/studio/summary"

const derived = Summary.derive()
writeFileSync(path.join(PKG_ROOT, "data", "studio", "summary-differential-v12.json"), JSON.stringify({ protocol: "summary-differential-v12", at: "2026-07-05", rule: "U-DERIVED — terminal figures regenerate from their artifacts", derived }, null, 2) + "\n")
console.log(`summary differential (machine-derived): floor=${derived.floor} · matrix ${derived.matrixPresent} PRESENT / ${derived.matrixAbsent} ABSENT · catalog ${derived.catalogCount}`)
console.log(`written: data/studio/summary-differential-v12.json`)
