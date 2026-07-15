/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 6: THE RESIDUES (sheds first). DD-66/D79, K-8, MR13, MR17, MR19, K-9.
 * Emits data/honesty/ship-residues.json — the honest sweep. No new law, no new wall (S151–S160 are the sprint's walls).
 *
 * Run: bun run script/honesty/ship-residues.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const H = path.join(PKG_ROOT, "data", "honesty")
const oracle = JSON.parse(readFileSync(path.join(H, "oracle-feeds.json"), "utf8"))
const ff = JSON.parse(readFileSync(path.join(H, "false-fire-series.json"), "utf8"))

const OUT = {
  protocol: "ship-residues",
  at: "2026-07-15",

  // DD-66 / D79 — oracle-staleness: attempt expansion, else FREEZE at a NAMED subset and say so.
  d79_oracleStaleness: {
    decision: "FROZEN at a named subset",
    namedSubset: Object.keys(oracle.feeds), // USDC/USD, USDT/USD, DAI/USD — Chainlink aggregators, block-pinned, REAL★
    coverage: `${oracle.coverage.resolvableOracleFeeds}/${oracle.coverage.totalPoolUniverse}`,
    rule: "the resolver reaches the three Chainlink USD-stable feeds (USDC/USDT/DAI), block-pinned REAL★; expansion beyond this needs a live capture pass (network), which this sprint does not run. So oracle-staleness is FROZEN at its named subset and SAYS SO: 'this kind resolves for these 3 feeds and is UNJUDGEABLE elsewhere' — honest, and not a decoration, because it names its own boundary (D79). The dependency map's oracle key carries the same 3/1284 caveat.",
    honestFreeze: "this kind resolves for USDC/USDT/DAI (Chainlink) and is UNJUDGEABLE elsewhere",
  },

  // K-8 — the false-fire count's SUBJECT COVERAGE, emitted as oracle-staleness emits its coverage.
  k8_falseFireCoverage: {
    subjects: Object.keys(ff.subjectMatch ?? {}), // ["tvl-drawdown", "peg-floor"]
    subjectMatch: ff.subjectMatch,
    coverage: `${Object.keys(ff.subjectMatch ?? {}).length} of 7 exit kinds have a materialized series (tvl-drawdown per-pool fluid-lending; peg-floor per-asset USDC)`,
    note: ff.subjectMatchNote,
    unstatedNoMore: "V39 emitted oracle-staleness's coverage but not the false-fire count's; this states it: the false-fire count materializes 2 of 7 exit kinds (tvl-drawdown, peg-floor); the other 5 render UNJUDGEABLE where no point series exists (honest, not a blanket default — S145).",
  },

  // MR13 — MR9 carried a FIFTH sprint. Discharged-or-recorded-undischargeable.
  mr13: {
    status: "RECORDED UNDISCHARGEABLE (not silently dropped)",
    what: "MR9 (the reachability/live-value ceiling item) has been carried since V32. It is undischargeable by the AGENT: it turns on the Operator opening the tool (realLineageCount: 0). V40 removes the last TECHNICAL excuses (the record is honest, the math is safe, the guard has a number, the map names the dependencies); the remaining action is a human opening a door, which has never been a Phase. Recorded, not dropped.",
  },

  // MR17 — the D57–D61 reservations (reserved for phases that shed). Released/accounted so the ledger carries no cruft.
  mr17: {
    status: "ACCOUNTED",
    d57_d61: "D57–D61 were reserved in earlier sprints for phases that shed. No V40 phase claimed them (V40's deviations are D75–D79). They remain RESERVED-UNUSED, stated here so the ledger carries no cruft — an unused reservation named is not a leak; an unused reservation forgotten is.",
  },

  // MR19 — the 1706→1738 baseline gap, explained (and S156 now makes it impossible to repeat).
  mr19: {
    status: "EXPLAINED + STRUCTURALLY PREVENTED",
    gap: "V38's terminal marker recorded 1706; V39's baseline `prev` was 1738; 32 tests appeared unaccounted (K-7).",
    explanation: "V38-B (the Surrogate Addendum) is a DISTINCT commit AFTER V38's 1706 marker; it added the 32 tests that took the count to 1738. The gap was a real sprint boundary the baseline never chained across — not a miscount. Recorded in battery-continuity.json.",
    prevention: "S156 (Ship.Battery.continuity) now compares baseline.prevFullPass against the chained previous terminal at SHIP time; an unexplained cross-boundary delta REFUSES the build log.",
  },

  // K-9 — the TRUE capability count, reported honestly (not dropped, not a redefined 0).
  k9_capability: {
    count: 4,
    disclosed: [
      "the SHIP GATE (a program that refuses to write a build log if any wall fails against the real artifacts)",
      "the RIDER, ENFORCED (the frozen Newey–West correction composed; CORRECTED-or-UNJUDGEABLE when deflation is live)",
      "the GUARD'S MEASURED NUMBER (mutation testing over X-MANIFEST's banned-output list — 8/17, a lower bound)",
      "the SHARED-DEPENDENCY MAP (a count over a join — the curator-loss literature's core fact)",
    ],
    plumbing: ["the CAPTURE verb (a verb, no scheduler) and the residues are plumbing/records, not scored capability"],
    note: "reported as 4, not a redefined 0 — the roadmap was OWED to V40 (K-9/K-10); the shed order protected the record, the math, the guard, and the map (the four never-sheds).",
  },
}

writeFileSync(path.join(H, "ship-residues.json"), JSON.stringify(OUT, null, 2) + "\n")
console.log("── THE RESIDUES ARE SWEPT (V40) ──────────────────────────────────")
console.log(`  D79 oracle-staleness   : ${OUT.d79_oracleStaleness.decision} (${OUT.d79_oracleStaleness.coverage}) — "${OUT.d79_oracleStaleness.honestFreeze}"`)
console.log(`  K-8 false-fire coverage: ${OUT.k8_falseFireCoverage.coverage}`)
console.log(`  MR13                   : ${OUT.mr13.status}`)
console.log(`  MR17                   : ${OUT.mr17.status}`)
console.log(`  MR19                   : ${OUT.mr19.status}`)
console.log(`  K-9 capability         : ${OUT.k9_capability.count} disclosed`)
console.log("written: data/honesty/ship-residues.json")
