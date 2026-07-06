/**
 * ORGΛNON — Ensemble Phase 3 ratification: the ensemble park's future-sprint ADOPT ACTIVATED (R-RATIFY). The V12 disposal
 * superseded the ensemble park to "future-sprint ADOPT"; that future sprint is now, the Phase-1 preconditions passed
 * (OPEN-WITH-CONDITIONS), so the ADOPT is filed — authorizing src/analytics/pool.ts with the correlation-adjusted K_eff
 * charge. Append-only; the ratification wall maps the pool artifact back to this row (pool code behind a shut door is
 * caught). Run: bun run script/phase3-ratify-ensemble.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Ratify } from "../src/studio/ratify"
import { Keff } from "../src/studio/keff"

const D = path.join(PKG_ROOT, "data", "studio")
const v13 = Ratify.load(path.join(D, "research-ratification-v13.json"))

const led = new Ratify.Ledger()
for (const e of v13.entries) led.record({ item: e.item, disposition: e.disposition, researchFinding: e.researchFinding, reason: e.reason, cheapTest: e.cheapTest, flipCriteria: e.flipCriteria, buildArtifacts: e.buildArtifacts, park: e.park, experiment: e.experiment, supersedes: e.supersedes, note: e.note, stamp: e.stamp })

led.record({
  item: "portfolio-of-strategies-ensemble",
  disposition: "ADOPT",
  researchFinding: "The V12 ensemble experiment derived YES — pooling INSUFFICIENT strategies is legitimate evidence-aggregation WITH the correlation-adjusted family charge (disposal c5e71ccd…, criterion 1bb0dfd1… hash-checked unchanged). The Ensemble Phase-1 middle cells (ρ ∈ {0.3,0.6}, K_eff computed NON-TRIVIALLY) confirmed it where V12's evidence never looked: the genuine diversified pool passes at the honest K_eff charge above a single member; a pure-noise pool NEVER survives (the hard REJECT firewall); laundering is caught; the stress cell collapses.",
  reason: `The pool pays the UNION's bill — a pool registers as a trial charged declaredNTrials = ceil(K_eff) under the formula PINNED in Phase 0 (hash ${Keff.keffMappingHash()}): K_eff = K/(1+(K-1)·ρ̄), the correlation-adjusted count of independent bets. Member selection IS search (a swap ratchets the family of compositions); K_eff recomputes on clock ticks; the pooled-noise wall is permanent under the kill-switch; members are strategy specs only (depth-1). The only way to look diversified is to be diversified.`,
  cheapTest: "the Phase-1 preconditions (the middle + stress cells under the hash-checked K_eff formula) passed OPEN-WITH-CONDITIONS before any pool code existed; the pooled-noise wall is green (0 survivors) with its seeded kill-switch proven; the frozen deflation adjudicates the pooled series untouched (a verdict differential proves it).",
  flipCriteria: "if the pooled-noise wall EVER admits a survivor at the K_eff charge, the composer is disabled by the kill-switch and the mechanism re-evaluated against this row (revert to reject); a non-union family, a swap that does not stiffen, a static K_eff, or a missing stress caveat reverses the adoption; the ρ=0.6 CONDITION (the laundering window narrows as ρ→1) binds the composer to render K_eff/ρ̄ prominently + the mandatory stress caveat.",
  buildArtifacts: ["src/analytics/pool.ts"],
  note: `ensemble ADOPT activated 2026-07-05 (Ensemble Phase 3); the door opened OPEN-WITH-CONDITIONS in Phase 1; K_eff mapping hash pinned pre-first-run: ${Keff.keffMappingHash()}`,
  stamp: "v13-phase3-adopt-ensemble",
})

writeFileSync(path.join(D, "research-ratification-v13.json"), JSON.stringify({
  protocol: "research-ratification", version: "v13", at: "2026-07-05", rule: "R-RATIFY + U-RESUPERSEDE + U-EXPERIMENT",
  chainOk: led.verifyChain().ok, coherent: Ratify.supersessionsCoherent(led.all()).ok,
  counts: led.all().reduce((a, e) => ({ ...a, [e.disposition]: (a[e.disposition] ?? 0) + 1 }), {} as Record<string, number>),
  entries: led.all(),
}, null, 2) + "\n")

console.log(`research-ratification-v13.json: ${led.all().length} entries · chain ok=${led.verifyChain().ok} · coherent=${Ratify.supersessionsCoherent(led.all()).ok}`)
console.log(`ensemble ADOPT filed — authorizes ${Ratify.effectiveRecord(led.all(), "portfolio-of-strategies-ensemble")?.buildArtifacts?.join(", ")}`)
console.log(`unratified artifacts against v13: ${JSON.stringify(Ratify.unratifiedArtifacts(led.all()))}`)
