/**
 * ORGΛNON STUDIO — the CAPTURE SCHEDULER daemon (Convergence Phase 1; Rules L-TICK, C-TENSE). V5's "TICKING" rested on
 * session-originated stamps (captures fired by an interactive adjudication session). This daemon fires captures on a
 * fixed cadence, INDEPENDENT of any session — each stamp is marked origin="scheduler" with a run-nonce (the daemon
 * instance id), so "TICKING" is earned at its TRUE tense: stamps accrue unattended. Kill the daemon and the clock shows
 * a GAP (never smoothed). A fetch failure is a GAP, never interpolated. Stamps go to a SEPARATE forward file (the V5
 * session stamps are not touched; this is a fresh forward record, not a backfill).
 *
 * "now": a local cron/daemon. The GHA schedule (fully unattended, cross-machine) lands the moment the Operator pushes
 * (attribution: MIXED — the daemon is agent-side; the GHA cron needs the push). Install artifact: script/scheduler.plist.
 *
 * Run:  SCHED_CADENCE_MS=4000 SCHED_MAX_CYCLES=5 bun run script/scheduler.ts    (daemon; SIGTERM to stop)
 */
import path from "node:path"
import { mkdirSync } from "node:fs"
import { randomBytes } from "node:crypto"
import { PKG_ROOT, REPO_ROOT } from "../src/organon/frozen"
import { Capture } from "../src/studio/capture"

const DOMAINS = [
  { domain: "lending", url: "https://api.llama.fi/v2/chains", pick: (j: any) => (Array.isArray(j) ? j.slice(0, 20).map((c: any) => [c.name, Math.round(c.tvl ?? 0)]) : j) },
  { domain: "funding", url: "https://api.llama.fi/v2/historicalChainTvl/Ethereum", pick: (j: any) => (Array.isArray(j) ? j.slice(-5) : j) },
  { domain: "fee-yield", url: "https://api.llama.fi/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true", pick: (j: any) => ({ total24h: j?.total24h, protocols: (j?.protocols ?? []).length }) },
]

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))])
}

const cadence = Number(process.env.SCHED_CADENCE_MS ?? 60_000)
const maxCycles = Number(process.env.SCHED_MAX_CYCLES ?? 0) // 0 = run forever until SIGTERM
const runNonce = randomBytes(8).toString("hex")
const dir = path.join(PKG_ROOT, "data", "studio")
mkdirSync(dir, { recursive: true })
const file = path.join(dir, "clock-stamps-scheduler.jsonl")
const svc = new Capture.Service(file)

let stop = false
process.on("SIGTERM", () => { stop = true })
process.on("SIGINT", () => { stop = true })

console.log(`SCHEDULER daemon up · run=${runNonce} · cadence=${cadence}ms · pid=${process.pid} · file=${path.relative(REPO_ROOT, file)}`)

let cycle = 0
async function tick() {
  cycle++
  const now = Date.now()
  const stampedDomains: string[] = []
  for (const d of DOMAINS) {
    try {
      const res = await withTimeout(fetch(d.url), 10_000)
      if (!res || !res.ok) { console.log(`  [cycle ${cycle}] ⚠ ${d.domain}: GAP (HTTP ${res ? res.status : "timeout"})`); continue }
      const payload = JSON.stringify({ domain: d.domain, source: d.url, data: d.pick(await res.json()) })
      const s = svc.capture(d.domain, payload, now, { origin: "scheduler", schedulerRun: runNonce })
      stampedDomains.push(d.domain)
      console.log(`  [cycle ${cycle}] ✓ ${d.domain}: ${s.selfSha.slice(0, 10)}… (scheduler-originated, run ${runNonce.slice(0, 6)})`)
    } catch (e) {
      console.log(`  [cycle ${cycle}] ⚠ ${d.domain}: GAP (${String(e).slice(0, 50)})`)
    }
  }
  console.log(`  [cycle ${cycle}] chain verify: ${svc.verify().ok ? "OK" : "BROKEN"} · stamped: [${stampedDomains.join(", ")}]`)
}

async function loop() {
  while (!stop) {
    await tick()
    if (maxCycles > 0 && cycle >= maxCycles) { console.log(`SCHEDULER reached SCHED_MAX_CYCLES=${maxCycles} — exiting cleanly (a real daemon runs until SIGTERM).`); break }
    // sleep in short slices so SIGTERM is honored promptly
    for (let waited = 0; waited < cadence && !stop; waited += 200) await new Promise((r) => setTimeout(r, Math.min(200, cadence - waited)))
  }
  console.log(`SCHEDULER down · run=${runNonce} · cycles=${cycle} · scheduler stamps/domain: ${DOMAINS.map((d) => `${d.domain}=${svc.schedulerCount(d.domain)}`).join(" ")}`)
}
loop()
