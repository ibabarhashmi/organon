/**
 * ORGΛNON — THE CADENCE SPRINT (X-CADENCE c). `organon.sh monitor [--since <iso>]` — the CLI verb that re-judges every
 * HELD, non-closed manifest on the EXISTING capture cadence. It is run AFTER `capture-*` (the clock is the user's, in their
 * OS — docs/CADENCE-TRIGGERS.md). There is NO daemon, NO scheduler, NO server state: this script walks the local store once
 * and exits. It is IDEMPOTENT — a cycle with no fresh confirmed capture renders no reading and appends no trial (Monitor's
 * confirmed-boundary wall); `--since <iso>` additionally skips a manifest already cycled at/after that instant (so a repeated
 * timer invocation within its own window is a fast no-op). The monitor READS, never ACTS.
 *
 * Boot:  bun run script/monitor-manifests.ts           (cycle all held manifests once)
 *        bun run script/monitor-manifests.ts --since 2026-07-13T00:00:00Z   (skip those cycled since then)
 */
import { StrategyStore } from "../src/strategy/store"
import { Monitor } from "../src/strategy/monitor"

// GREP-WALL (S77): this file (and the monitor path) contains NO `setInterval`, NO `setTimeout` loop, NO cron surface — the
// tool holds no clock. The cadence is the user's OS timer writing to their own local store (documented, never installed).

async function main() {
  const args = process.argv.slice(2)
  const sinceIdx = args.indexOf("--since")
  const since = sinceIdx >= 0 ? Date.parse(args[sinceIdx + 1] ?? "") : NaN
  const now = Date.now()
  const at = new Date(now).toISOString()

  const ids = StrategyStore.list() // the user's held manifests (gitignored store); fixtures are read via the cycle fallback
  if (ids.length === 0) {
    console.log("── ORGΛNON monitor ─────────────────────────────────────────")
    console.log("No held manifests to monitor. Author one at /check/manifest:new, then re-run after your next capture.")
    return
  }
  console.log("── ORGΛNON monitor · reads, never acts ─────────────────────")
  let cycled = 0
  let skipped = 0
  for (const id of ids) {
    const closed = StrategyStore.closure(id)
    if (closed) { console.log(`  ${id.slice(0, 8)}…  CLOSED (${closed.reason}) — skipped`); skipped++; continue }
    if (!Number.isNaN(since)) {
      const hist = Monitor.history(id)
      const last = hist.length ? Date.parse(hist[hist.length - 1].at) : NaN
      if (!Number.isNaN(last) && last >= since) { console.log(`  ${id.slice(0, 8)}…  already cycled since ${args[sinceIdx + 1]} — skipped`); skipped++; continue }
    }
    const r = await Monitor.cycle(id, now, at)
    if ("error" in r) { console.log(`  ${id.slice(0, 8)}…  ${r.error}`); continue }
    cycled++
    const state = r.baselinePinnedThisCycle ? "baseline pinned (deltas begin next cycle)" : !r.fresh ? "no new confirmed capture — UNJUDGEABLE, no reading" : `${r.deltas.filter((d) => d.judgeable && d.changed).length} change(s) vs baseline${r.exit ? ` · exit ${r.exit.fired ? "FIRED" : "held"}` : ""} · ${r.trialCount} trials`
    console.log(`  ${id.slice(0, 8)}…  cycle ${r.cycle} · ${state}`)
  }
  console.log(`── ${cycled} cycled · ${skipped} skipped · trials recorded, never counted (familyN===1 stands) ──`)
}

main()
