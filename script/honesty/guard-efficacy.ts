/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 3: emit the guard-efficacy artifact (S158, DD-63). Mutation testing over
 * X-MANIFEST's banned-output list — a RAW number, a LOWER BOUND (RP-5), every hole NAMED and routed. The SOLE input to the
 * build log's GUARD block. Six sprints of "UNJUDGEABLE" end here.
 *
 * Run: bun run script/honesty/guard-efficacy.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Guard } from "../../src/organon/guard"

const r = Guard.mutationRate()
const OUT = {
  protocol: "guard-efficacy",
  at: "2026-07-15",
  rule: "S158 (K-6, DD-63) — MUTATION TESTING. The catalogue IS X-MANIFEST's banned-output list (V31), seeded into the render path; the ONE GUARD (AdviceShape.detect ∪ VoiceGates.advicePattern) is run against each; guardEfficacy = caught/seeded, a RAW fraction and a LOWER BOUND (RP-5). Every uncaught mutation is a NAMED HOLE, routed to the gate. Deterministic, reproducible, independent of any LLM.",
  guardEfficacy: r.rate,
  guardEfficacyLowerBound: r.lowerBoundCaveat,
  fullHonestyLayer: r.fullLayerRate,
  seeded: r.seeded,
  caught: r.caught,
  holes: r.holes,
  genuineHoles: r.genuineHoles,
  corpus: r.corpus,
  header: `guardEfficacy: ${r.rate} (a LOWER BOUND — the catalogue is ${r.seeded} phrasings from V31, not the space of advice) · full honesty layer ${r.fullLayerRate} · genuine holes ${r.genuineHoles.length} (named + routed) · corpus ${r.corpus.caught}/${r.corpus.baits} (2nd measure, a different lab)`,
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "guard-efficacy.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── THE GUARD HAS A NUMBER (V40) ──────────────────────────────────")
console.log(`  guardEfficacy (ONE GUARD): ${r.rate}   ← a RAW fraction, six sprints late (LOWER BOUND — RP-5)`)
console.log(`  full honesty layer       : ${r.fullLayerRate}`)
console.log(`  holes (advice-guard)     : ${r.holes.length} (${r.holes.filter((h) => h.coveredBy === "banned-shape-guard").length} covered by the sibling banned-shape guard)`)
console.log(`  GENUINE holes (uncaught) : ${r.genuineHoles.length} — named + routed to the gate`)
for (const h of r.genuineHoles) console.log(`      * "${h.mutation}"`)
console.log(`  corpus (2nd measure)     : ${r.corpus.caught}/${r.corpus.baits} baits (a different lab; a SAMPLE, not a proof)`)
console.log("written: data/honesty/guard-efficacy.json")
