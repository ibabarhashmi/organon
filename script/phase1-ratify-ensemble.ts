/**
 * ORGΛNON — Ensemble Phase 1 ratification: the HRP park DISPOSED (U-EXPERIMENT, U-RESUPERSEDE). The v12 chain continues
 * with a SUPERSEDE of the HRP park (#7, hash bf6764cd…): the fixture test derived NO (HRP does not dominate OOS), so it
 * STAYS PARKED with the evidence. Append-only; the original row is never edited. Run: bun run script/phase1-ratify-ensemble.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Ratify } from "../src/studio/ratify"

const D = path.join(PKG_ROOT, "data", "studio")
const v12 = Ratify.load(path.join(D, "research-ratification-v12.json"))
const hrp = JSON.parse(readFileSync(path.join(D, "phase1-preconditions-v13.json"), "utf8")).hrp

const led = new Ratify.Ledger()
for (const e of v12.entries) led.record({ item: e.item, disposition: e.disposition, researchFinding: e.researchFinding, reason: e.reason, cheapTest: e.cheapTest, flipCriteria: e.flipCriteria, buildArtifacts: e.buildArtifacts, park: e.park, experiment: e.experiment, supersedes: e.supersedes, note: e.note, stamp: e.stamp })

const r = hrp.result
led.record({
  item: "hrp-portfolio-construction",
  disposition: "SUPERSEDE",
  reason: `DERIVED under the park's filed criterion (hash-checked unchanged, row bf6764cd…): HRP beat BOTH equal-weight AND min-variance out-of-sample in only ${r.hrpWins}/${r.windows} rolling windows (majority-dominance=${r.majorityDominance}); mean OOS Sharpe HRP=${r.meanSharpe.hrp.toFixed(2)} sits BETWEEN equal-weight ${r.meanSharpe.equal.toFixed(2)} and min-variance ${r.meanSharpe.minVar.toFixed(2)}. The research's mixed crypto evidence did NOT resolve in our favour. Outcome: NO — stays parked.`,
  flipCriteria: "reverses only if HRP's out-of-sample Sharpe exceeds BOTH equal-weight and min-variance across a MAJORITY of windows on a future fixture or real captured-data test; until then no HRP weight renders anywhere (parked).",
  supersedes: { item: "hrp-portfolio-construction", originalHash: "bf6764cd0a6e9f884905265307cd1e31cb54486fc071d8e3cf9922dd86a8ba17", regimeChange: `NO — HRP does not dominate equal-weight AND min-variance out-of-sample (beat both in ${r.hrpWins}/${r.windows}); STAYS PARKED with the evidence` },
  note: "HRP fixture test run 2026-07-05 (Ensemble Phase 1); criterion hash-checked unchanged; ZERO product built (no HRP weight renders anywhere).",
  stamp: "v13-phase1-supersede-hrp",
})

writeFileSync(path.join(D, "research-ratification-v13.json"), JSON.stringify({
  protocol: "research-ratification", version: "v13", at: "2026-07-05", rule: "R-RATIFY + U-RESUPERSEDE + U-EXPERIMENT",
  chainOk: led.verifyChain().ok, coherent: Ratify.supersessionsCoherent(led.all()).ok,
  counts: led.all().reduce((a, e) => ({ ...a, [e.disposition]: (a[e.disposition] ?? 0) + 1 }), {} as Record<string, number>),
  entries: led.all(),
}, null, 2) + "\n")

console.log(`research-ratification-v13.json: ${led.all().length} entries · chain ok=${led.verifyChain().ok} · coherent=${Ratify.supersessionsCoherent(led.all()).ok}`)
console.log(`HRP disposed: ${Ratify.effectiveRecord(led.all(), "hrp-portfolio-construction")?.supersedes?.regimeChange}`)
