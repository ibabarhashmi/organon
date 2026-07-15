/**
 * ORGΛNON — THE BACKFILL SPRINT (V43), Phase 3/5: `organon.sh backfill` — the VERB (S184–S189, D88). The moat's second stone.
 *
 * Walks the historical rounds of a rate feed (Chainlink getRoundData) and chains them REAL-DERIVED — re-derivable at each
 * round, third-party-sourced, a tier between REAL★ (own live) and RETROSPECTIVE (revisable). ORGΛNON SCHEDULES NOTHING — this
 * is a one-shot verb the Operator runs on his own cadence; no daemon, no cron, no service, no suggested crontab line.
 *
 * Default (offline-honest): render the tier ladder, the own-archive (REAL★ + REAL-DERIVED mix + ratio), the source map per
 *   subject (rETH/ETH reachable · Aave forward-only · FRAX/USD the price negative control), and the depth to a judgeable
 *   own-count, then stop.
 * With --run: walk the rETH/ETH feed's historical rounds over the pinned RPC via a hand-encoded getRoundData eth_call, crossing
 *   phase boundaries DELIBERATELY, and APPEND the re-derivable REAL-DERIVED points to data/honesty/observe-ledger.json's
 *   realDerived chain (a cross-tier splice is impossible — S185/S188). --count N sets the depth (default 30).
 *
 * Run: bun run script/honesty/backfill.ts [--run] [--count N]
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Backfill } from "../../src/plane/backfill"
import { Tier } from "../../src/plane/tier"
import { Capture } from "../../src/strategy/capture"

const run = process.argv.includes("--run")
const countArg = process.argv.indexOf("--count")
const count = countArg >= 0 && process.argv[countArg + 1] ? Number(process.argv[countArg + 1]) : 30
const now = Date.now()
const OBSERVE_LEDGER = path.join(PKG_ROOT, "data", "honesty", "observe-ledger.json")

const oa = Capture.ownArchive()

console.log("── organon backfill — a VERB, not a service (V43; the moat's second stone) ─────────────")
console.log(`  tier ladder            : ${Tier.ladder().join(" > ")}`)
console.log(`  own-archive            : ${oa.mix.label}`)
console.log(`  false-fire own-leg     : ${oa.render}`)
console.log(`  ORGΛNON schedules NOTHING — you run this on your own cadence; no daemon, no cron, no service.`)

console.log("\n  source map per subject (DD-83 — probed live before design):")
console.log(`    · rETH/ETH exchange-rate → Chainlink getRoundData (rate-space, re-derivable, REAL-DERIVED)`)
console.log(`    · Aave USDC supply rate  → FORWARD-ONLY (not on Chainlink; the subgraph is decommissioned — backfill UNREACHABLE, honestly)`)
console.log(`    · FRAX/USD price         → the S187 NEGATIVE CONTROL (a price feed; NEVER chained as a rate)`)

if (!run) {
  console.log(`\n  what your NEXT backfill buys: each run walks more historical rounds and deepens the REAL-DERIVED series toward a`)
  console.log(`  judgeable own-count (${oa.pointsToJudgeable} re-derivable points to go). Run with --run to walk the rETH/ETH feed and append.`)
  process.exit(0)
}

// --run: walk the rETH/ETH feed's historical rounds and append REAL-DERIVED points.
const reth = Backfill.feed("reth-eth-exchange-rate")!
console.log(`\n── REAL-DERIVED backfill (V43) — Chainlink getRoundData, re-derivable at each round ─────────`)
const latest = await Backfill.liveLatestRound(reth.feedAddress)
if (latest === null) {
  console.log(`  every pinned RPC was unreachable — a backfill with no rounds is nothing chained (honest, never fabricated).`)
  process.exit(0)
}
const led = JSON.parse(readFileSync(OBSERVE_LEDGER, "utf8"))
led.realDerived = led.realDerived ?? []
const prevHash: string = led.realDerived.length ? led.realDerived[led.realDerived.length - 1].sha : "GENESIS"
const w = await Backfill.walk(reth, latest, count, Backfill.liveFetcher(reth.feedAddress), now, { crossPhases: true })
// re-chain the walked points onto the existing chain's tail (prevHash link).
let ph = prevHash
const appended: Backfill.Observation[] = []
for (const p of w.points) {
  const rechained = { ...p, prevHash: ph }
  const { sha, ...rest } = rechained
  const withSha = { ...rest, sha: (await import("node:crypto")).createHash("sha256").update(JSON.stringify(rest)).digest("hex") }
  appended.push(withSha as Backfill.Observation)
  ph = withSha.sha
}
led.realDerived.push(...appended)
writeFileSync(OBSERVE_LEDGER, JSON.stringify(led, null, 2) + "\n")

console.log(`  ${w.reason}`)
console.log(`  reachable depth per phase: ${w.reachableByPhase.map((p) => `phase ${p.phaseId} [agg ${p.minAgg}–${p.maxAgg}, ${p.count} rounds]`).join(" · ")}`)
if (w.truncatedAtPhaseBoundary) console.log(`  ○ stopped at phase ${w.truncatedAtPhaseBoundary.phaseId} agg ${w.truncatedAtPhaseBoundary.aggregatorRoundId} (a boundary, STATED not hidden — F-3/RP-3)`)
for (const p of appended.slice(0, 5)) console.log(`  ✓ REAL-DERIVED rETH/ETH = ${p.decoded.toFixed(6)} @ round ${p.roundId} (phase ${p.phaseId}/agg ${p.aggregatorRoundId}, updatedAt ${new Date(p.updatedAt * 1000).toISOString().slice(0, 10)}; re-derivable, sha ${p.sha.slice(0, 12)}…)`)
console.log(`  appended ${appended.length} REAL-DERIVED observation(s) — third-party historical, re-derivable at each round; the HUMAN own-count is UNCHANGED (a backfill is not a self-capture).`)
const oa2 = Capture.ownArchive()
console.log(`  own-archive now: ${oa2.mix.label}`)
