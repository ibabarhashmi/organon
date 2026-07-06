/**
 * ORGΛNON DATA-PLANE — the capture driver (Data-Plane Phase 1; Rules D-SEAM, D-LABEL, A′#5). Fetches the credential-free
 * lending domain from DefiLlama (real daily yield history) into the standalone-native PIT store, each capture writing a
 * content-addressed immutable snapshot + a nonce-anchored, hash-chained provenance stamp (the clock-stamp pattern). The
 * RWA path is rendered BLOCKED-on-credential (FRED_API_KEY unset / snapshot absent) — never a fabricated payload. The
 * network fetch lives HERE, never on a verdict path. Run: bun run script/capture-dataplane.ts [runs]
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { DataPlane } from "../src/dataplane/store"
import { DataPlaneCapture } from "../src/dataplane/capture"

const D = path.join(PKG_ROOT, "data", "studio")

// real, large, single-asset stablecoin lending pools (credential-free) — discovered from yields.llama.fi/pools
const POOLS: Array<{ id: string; key: string }> = [
  { id: "f981a304-bb6c-45b8-b0c5-fd2f515ad23a", key: "lending:aave-v3:USDT:ethereum" },
  { id: "aa70268e-4b52-42bf-a116-608b370f9501", key: "lending:aave-v3:USDC:ethereum" },
  { id: "4438dabc-7f0c-430b-8136-2722711ae663", key: "lending:fluid-lending:USDC:ethereum" },
  { id: "4e8cc592-c8d5-4824-8155-128ba521e903", key: "lending:fluid-lending:USDT:ethereum" },
  { id: "e26ce7d9-db75-4aa4-b1db-cc21ae17bdfb", key: "lending:sparklend:DAI:ethereum" },
]

async function fetchChart(id: string): Promise<DataPlaneCapture.DefiLlamaChart | null> {
  const url = `https://yields.llama.fi/chart/${id}`
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 30_000)
    const r = await fetch(url, { signal: ctrl.signal })
    clearTimeout(t)
    if (!r.ok) return null
    return (await r.json()) as DataPlaneCapture.DefiLlamaChart
  } catch {
    return null
  }
}

const runs = Number(process.argv[2] ?? 2)
const nowBase = Date.parse("2026-07-04T00:00:00Z") // deterministic capture timestamp base (avoids Date.now non-determinism in the record)
const captured: Array<{ key: string; run: number; points: number; contentSha: string; chainPos: number; blockedSource?: boolean }> = []

for (let run = 0; run < runs; run++) {
  for (const p of POOLS) {
    const raw = await fetchChart(p.id)
    if (!raw) {
      captured.push({ key: p.key, run, points: 0, contentSha: "", chainPos: -1, blockedSource: true })
      console.log(`  ${p.key} run ${run}: BLOCKED-on-source (fetch failed) — honest, no fabricated payload`)
      continue
    }
    const url = `https://yields.llama.fi/chart/${p.id}`
    const snap = DataPlaneCapture.parseDefiLlamaChart(raw, p.key, url, nowBase + run * 1000)
    const res = DataPlane.capture(snap, { origin: "manual" })
    captured.push({ key: p.key, run, points: snap.points.length, contentSha: res.contentSha, chainPos: res.chainPos })
    console.log(`  ${p.key} run ${run}: ${snap.points.length} pts, content ${res.contentSha.slice(0, 12)}…, chain pos ${res.chainPos}`)
  }
}

// per-key status (PRESENT / ABSENT) — never smoothed
console.log("\nstore status:")
const statuses = POOLS.map((p) => DataPlane.status(DataPlane.snapshotAdapter, p.key))
for (const s of statuses) console.log("  " + s.render)

// the RWA path — BLOCKED-on-credential
const rwa = DataPlaneCapture.rwaSnapshotState()
console.log(`\nRWA path: ${rwa.reality} — ${rwa.reason}`)
console.log(`  unblock: ${rwa.unblock}`)

const okKeys = statuses.filter((s) => s.present).length
const out = {
  protocol: "capture-dataplane-v9",
  at: "2026-07-04",
  gate: "STORE-TRUE (the capture limb)",
  rule: "D-SEAM + D-LABEL — standalone-native PIT store, hash-chained nonce-anchored snapshot provenance, gap-honest, RWA BLOCKED-on-credential (A′#5)",
  runs,
  domain: "lending",
  poolsCaptured: okKeys,
  poolsTotal: POOLS.length,
  captures: captured,
  status: statuses.map((s) => ({ key: s.key, present: s.present, render: s.render })),
  rwa,
  storeTrue: okKeys >= 3, // ≥3 verifying snapshots for the lending domain
}
writeFileSync(path.join(D, "capture-dataplane-v9.json"), JSON.stringify(out, null, 2) + "\n")
console.log(`\nlending domain: ${okKeys}/${POOLS.length} pools captured (STORE ${out.storeTrue ? "≥3 ✓" : "<3"}); written data/studio/capture-dataplane-v9.json`)
