/**
 * ORGΛNON — RATIFY the correlation substrate (Coverage sprint; X-CORRELATE). src/analytics/correlate.ts is a NEW analytics
 * surface (the ratification wall scans src/analytics) → it must be covered by an ADOPT row. Append-only: the existing
 * entries are replayed (reproducing their hashes) and the new row is chained. Run: bun run script/honesty/ratify-correlate.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ratify } from "../../src/studio/ratify"

const TABLE = path.join(PKG_ROOT, "data", "studio", "research-ratification-v14.json") // the ACTIVE chain (v11→…→v14); the wall reads v14
const raw = JSON.parse(readFileSync(TABLE, "utf8")) as { entries: Ratify.Entry[]; counts?: unknown }

const led = new Ratify.Ledger()
for (const e of raw.entries) led.record({ item: e.item, disposition: e.disposition, researchFinding: e.researchFinding, reason: e.reason, cheapTest: e.cheapTest, flipCriteria: e.flipCriteria, buildArtifacts: e.buildArtifacts, park: e.park, experiment: e.experiment, supersedes: e.supersedes, note: e.note, stamp: e.stamp })

if (!raw.entries.some((e) => e.item === "correlation-substrate")) {
  led.record({
    item: "correlation-substrate",
    disposition: "ADOPT",
    researchFinding: "The trading-techniques review found the documented familyN=1 weakness needs an effective-trials counter, and that its constitution-safe mechanism is correlation-clustering: when N compared strategies co-move, they are fewer than N independent bets. Correlation on pool return series (which exist today) makes the count legible WITHOUT unparking the proposer.",
    reason: "A DETERMINISTIC substrate (Pearson on aligned log-delta yield series · agglomerative average-linkage on 1−ρ · a pinned merge threshold · lexicographic tie-breaking · canonical ordering — k-means and all randomness PROHIBITED; permutation-invariant byte-identical clusters) with a MinTRL-style minimum-overlap floor (INSUFFICIENT over fabricated precision), surfacing ONE non-advisory, number-traced info/context diversification fact on COMPARE (\"≈ K independent bets among N\"). The DEFLATION STAYS INERT: the substrate serves the render, never the statistics (familyN stays 1; the K-activation is LOCKED behind the pinned ≥20–50-trials trigger AND the Operator's D33 pen).",
    cheapTest: "correlate.test.ts (permutation → byte-identical clusters; the overlap floor → INSUFFICIENT; the non-advisory wording) + stamp_inert.test.ts (the comment-stripped grep finds no Math.random/k-means; the Stamp path imports no substrate; the K-feed is REFUSED without both trigger and pen).",
    flipCriteria: "If the clustering proves non-deterministic (a permutation flips a cluster), OR the diversification fact reads as advice (the advice wall bites), OR K ever reaches the Stamp's familyN before the trigger + D33, the substrate is PULLED. The K-activation stays parked until the ≥20–50-trials/family trigger fires AND the Operator signs D33 — building the key is not turning it.",
    buildArtifacts: ["src/analytics/correlate.ts"],
    flipNote: "",
    note: "Coverage sprint (X-CORRELATE). The diversification fact is info/context, OFF the scorecard verdict path; the Stamp's frozen math is byte-untouched (the deflation-inert wall S66 asserts familyN===1 in every Stamp output).",
    stamp: "coverage-correlate-adopt",
  } as Parameters<Ratify.Ledger["record"]>[0])
  const out = { ...raw, chainOk: led.verifyChain().ok, counts: { total: led.all().length, adopt: led.all().filter((e) => e.disposition === "ADOPT").length }, entries: led.all() }
  writeFileSync(TABLE, JSON.stringify(out, null, 2) + "\n")
  console.log(`appended correlation-substrate ADOPT · entries ${raw.entries.length}→${led.all().length} · chainOk ${led.verifyChain().ok}`)
} else {
  console.log("correlation-substrate already ratified — no-op")
}
