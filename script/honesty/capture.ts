/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 5: `organon.sh capture` — the VERB (S160, D78). Snapshots the pinned subjects'
 * observables into the moat (PIT-honest, content-hashed, REAL@ts) and renders the own-capture window + daysToJudgeable (in
 * CAPTURES, not days — RP-6). ORGΛNON SCHEDULES NOTHING — this is a one-shot verb the Operator runs on his own cadence.
 * There is no daemon, no cron, no setInterval, no service; not even a suggested crontab line. It runs once and stops.
 *
 * Default (offline-honest): render the window, the judgeability, and the subject list, and stop.
 * With --live: fetch each subject's TVL from DeFiLlama and APPEND a REAL@ts snapshot to data/honesty/capture-ledger.json.
 *
 * Run: bun run script/honesty/capture.ts [--live]
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Capture } from "../../src/strategy/capture"

const live = process.argv.includes("--live")
const now = Date.now()
const LEDGER = path.join(PKG_ROOT, "data", "honesty", "capture-ledger.json")

const w = Capture.window()
const j = Capture.judgeability()

console.log("── organon capture — a VERB, not a service (V40) ─────────────────")
console.log(`  own-capture window     : ${w.captures} captures · ${w.observations} observations · span ${w.spanDays} days`)
console.log(`  daysToJudgeable        : ${j.verdict}`)
console.log(`  ORGΛNON schedules NOTHING — you run this on your own cadence; no daemon, no cron, no service.`)

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
