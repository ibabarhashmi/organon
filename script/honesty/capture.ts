/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 5: `organon.sh capture` — the VERB (S160, D78). Snapshots the pinned subjects'
 * observables into the moat (PIT-honest, content-hashed, REAL@ts) and renders the own-capture window + daysToJudgeable (in
 * CAPTURES, not days — RP-6). ORGΛNON SCHEDULES NOTHING — this is a one-shot verb the Operator runs on his own cadence.
 * There is no daemon, no cron, no setInterval, no service; not even a suggested crontab line. It runs once and stops.
 *
 * Default (offline-honest): render the window, the judgeability, the REAL★ own-capture window (V42), and the subject list, and stop.
 * With --live: fetch each subject's TVL from DeFiLlama and APPEND a REAL@ts snapshot to data/honesty/capture-ledger.json.
 * With --rates: PROVENANCE V42 — poll rate-space (Aave getReserveData, …) over the pinned RPC via a hand-encoded eth_call and
 *   APPEND block-pinned REAL★ observations to data/honesty/observe-ledger.json. An AGENT run is AGENT-tier (quarantined — it
 *   never advances the HUMAN own-count, DD-79/S128); only the Operator's own run (with his authorship marker) is HUMAN-tier.
 *
 * Run: bun run script/honesty/capture.ts [--live] [--rates]
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Capture } from "../../src/strategy/capture"
import { Observe } from "../../src/plane/observe"

const live = process.argv.includes("--live")
const rates = process.argv.includes("--rates")
const now = Date.now()
const LEDGER = path.join(PKG_ROOT, "data", "honesty", "capture-ledger.json")
const OBSERVE_LEDGER = path.join(PKG_ROOT, "data", "honesty", "observe-ledger.json")

const w = Capture.window()
const j = Capture.judgeability()
const rsw = Capture.realStarWindow() // PROVENANCE V42 (S179) — the REAL★ window from ACTUAL captures

console.log("── organon capture — a VERB, not a service (V40; REAL★ rate-space, V42) ─────────────────")
console.log(`  own-capture window     : ${w.captures} captures · ${w.observations} observations · span ${w.spanDays} days`)
console.log(`  daysToJudgeable        : ${j.verdict}`)
console.log(`  REAL★ own-capture (V42): ${rsw.render}`)
console.log(`  ORGΛNON schedules NOTHING — you run this on your own cadence; no daemon, no cron, no service.`)

// PROVENANCE V42 (--rates) — the live REAL★ poll: block-pinned rate-space observations over fetch + hand-encoded eth_call.
if (rates) {
  console.log("\n── REAL★ rate-space poll (V42) — block-pinned, re-derivable, content-hashed ─────────────")
  const run = await Observe.capture({ ethCall: Observe.liveEthCall, codeRead: Observe.liveCodeRead, blockRead: Observe.liveBlockRead, capturedAt: now, capturedBy: "AGENT" })
  if (run.offline || !run.ran) {
    console.log(`  ${run.reason} — nothing appended (honest gap, never a fabricated point).`)
  } else {
    const led = JSON.parse(readFileSync(OBSERVE_LEDGER, "utf8"))
    // AGENT-tier append (quarantined — DD-79/S128): the AGENT proof never advances the HUMAN own-count.
    led.realStar.push(...run.observations)
    led.agentCaptures = (led.agentCaptures ?? 0) + run.observations.length
    writeFileSync(OBSERVE_LEDGER, JSON.stringify(led, null, 2) + "\n")
    for (const o of run.observations) console.log(`  ✓ REAL★ ${o.asset} = ${(o.decoded * 100).toFixed(4)}% @ block ${o.blockNumber} (re-derivable; sha ${o.sha.slice(0, 12)}…, AGENT-tier, quarantined)`)
    if (run.rejected.length) for (const r of run.rejected) console.log(`  ○ rejected ${r.subject}: ${r.reason}`)
    console.log(`  appended ${run.observations.length} AGENT-tier REAL★ observation(s) — the HUMAN own-count is UNCHANGED (${led.ownCapturesHuman}); the first HUMAN capture is the Operator's.`)
  }
  process.exit(0)
}

if (!live) {
  console.log("\n  subjects that would be snapshot (run with --live to fetch a REAL@ts snapshot and grow the window):")
  for (const s of Capture.subjects()) console.log(`    · ${s.project} ${s.asset} (${s.subjectKey.slice(0, 8)}…) → ${s.observable}`)
  // VARIANT V41 (S165, DD-72) — the MARGINAL VALUE of the NEXT capture, so the cadence pays visibly from the first run.
  console.log(`\n  what your NEXT capture buys (V41): each run advances the own-capture window toward judgeable, in CAPTURES (not days).`)
  if (w.captures === 0) console.log(`  the FIRST capture turns a UNJUDGEABLE into a 1 of ${Capture.ledger().minWindowDays} CAPTURES — the cadence pays from the very first run.`)
  console.log("\n  (offline — nothing fetched, nothing appended. `organon.sh capture --live` snapshots and appends.)")
  process.exit(0)
}

// --live: fetch each subject's TVL from DeFiLlama (best-effort; a failed fetch → UNJUDGEABLE, never a fabricated number).
async function fetchTvl(poolKey: string): Promise<number | null> {
  try {
    const r = await fetch(`https://yields.llama.fi/chart/${poolKey}`, { signal: AbortSignal.timeout(15_000) })
    if (!r.ok) return null
    const j = (await r.json()) as { data?: { tvlUsd?: number }[] }
    const last = j.data?.[j.data.length - 1]
    return last?.tvlUsd ?? null
  } catch {
    return null
  }
}

const subs = Capture.subjects()
const values = new Map<string, number | null>()
for (const s of subs) values.set(s.subjectKey, await fetchTvl(s.subjectKey))
const result = Capture.run(now, (s) => values.get(s.subjectKey) ?? null)

if (!result.ran || !result.entry) {
  console.log("\n  ✗ nothing captured (offline / all fetches failed) — nothing appended. Honest gap, not a fabricated snapshot.")
  process.exit(0)
}

// APPEND to the moat (the only writer of the ledger; content-hashed, PIT-honest).
const ledger = JSON.parse(readFileSync(LEDGER, "utf8"))
ledger.captures.push(result.entry)
ledger.at = new Date(now).toISOString().slice(0, 10)
writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + "\n")

const w2 = Capture.window()
console.log(`\n  ✓ ${result.reason}`)
console.log(`  appended a REAL@${now} snapshot — the window is now ${w2.captures} captures.`)
// VARIANT V41 (S165, DD-72) — the MARGINAL VALUE this run bought (in CAPTURES, never days). `w` is the window BEFORE append.
console.log(`  marginal value         : ${Capture.marginalValue(result, w).render}`)
console.log(`  daysToJudgeable        : ${Capture.judgeability().verdict}`)
