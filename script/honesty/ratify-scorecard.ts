/**
 * ORGΛNON — Honesty Layer Phase 3: append the HONESTY-SCORECARD ADOPT row to the ratification chain (R-RATIFY). The
 * scorecard is a src/analytics build surface, so it enters by ratification, never by fiat — an ADOPT row citing the
 * research (how DeFi money dies), a cheap pre-build test (the seeded positive controls), and its flip-criteria (the
 * KILL SIGNAL). Append-only: the existing entries are replayed (reproducing their hashes) and the new row is chained.
 *
 * Run: bun run script/honesty/ratify-scorecard.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ratify } from "../../src/studio/ratify"

const TABLE = path.join(PKG_ROOT, "data", "studio", "research-ratification-v14.json")
const raw = JSON.parse(readFileSync(TABLE, "utf8")) as { protocol: string; chainOk: boolean; entries: Ratify.Entry[] }

const led = new Ratify.Ledger()
for (const e of raw.entries) led.record({ item: e.item, disposition: e.disposition, researchFinding: e.researchFinding, reason: e.reason, cheapTest: e.cheapTest, flipCriteria: e.flipCriteria, buildArtifacts: e.buildArtifacts, park: e.park, experiment: e.experiment, supersedes: e.supersedes, note: e.note, stamp: e.stamp })

if (!led.all().some((e) => e.disposition === "ADOPT" && e.buildArtifacts.includes("src/analytics/scorecard.ts"))) {
  led.record({
    item: "honesty-scorecard",
    disposition: "ADOPT",
    researchFinding: "How DeFi money actually dies (the Reality Doctrine): (1) reward-emission-dominated APY is temporary — as emissions taper or TVL dilutes, mercenary capital leaves and the headline yield collapses to the base rate; (2) TVL flight (money fleeing) precedes and signals a pool's failure; (3) a stablecoin/delta-neutral leg's acute failure mode is a peg break. A single hero APY hides all three.",
    reason: "The honesty scorecard operationalizes these into deterministic pure-function axes over the WHY fact table — yield-reality (baseShare vs the pinned durability ratio, the flagship), TVL trend (30d slope vs the pinned floor), peg/stability (|price−1| vs the pinned band) — with a machine-derived verdict (SOLID/CAUTION/AVOID/UNVERIFIED) that names its failing rows and renders UNVERIFIED as an honest gap. No inference: the verdict and every axis are rules over structured facts; the LLM is confined to phrasing the plain register behind the groundedness verifier (X-DETERM).",
    cheapTest: "The seeded positive controls, before any live wiring: an emissions-inflated pool (baseShare < 0.2) → yield-reality FAIL → verdict not SOLID; a seeded depeg (|price−1| > 0.02) → peg FAIL → AVOID; a seeded TVL collapse (30d slope < −0.35) → TVL FAIL → AVOID. All three must be CAUGHT (honesty_scorecard.test.ts).",
    flipCriteria: "If a knowledgeable user consistently disagrees with the scorecard on real pools (the axes/thresholds do not track how money actually dies), the axis set or the pinned thresholds are revised — or, if the axis cannot be made trustworthy, the scorecard is recorded as a NAMED KILL SIGNAL, never tuned to look right (X-HONEST A′#5).",
    buildArtifacts: ["src/analytics/scorecard.ts"],
    note: "Thresholds are the hash-locked phase0-pins constants (PINS_SHA ffeb78830d5b…). The verdict is a NEW consumer badge, orthogonal to the frozen GO/NO-GO adjudicator (which stays dormant, X-KEEP). The scorecard reads shown values through the provenance record under the shown-but-recorded guarantee.",
    stamp: "honesty-phase3-scorecard-adopt",
  })
  writeFileSync(TABLE, JSON.stringify({ ...raw, chainOk: led.verifyChain().ok, entries: led.all() }, null, 2) + "\n")
  console.log(`appended honesty-scorecard ADOPT · entries ${raw.entries.length}→${led.all().length} · chainOk ${led.verifyChain().ok}`)
} else {
  console.log("honesty-scorecard already ratified — no-op")
}
