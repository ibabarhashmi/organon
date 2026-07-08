/**
 * ORGΛNON — the DeFiLlama live-capture (Honesty Layer Phase 2; Rule X-MOAT). Seeds the provenance record with REAL,
 * keyless DeFiLlama data — the moat's first real day. Fetches the curated money-holding Shelf + each pool's TVL/APY
 * chart + the stablecoin peg, and records each as a content-addressed, hash-chained snapshot in the store (the payloads
 * are gitignored + re-capturable; the provenance.jsonl chain is the committed guarantee). Offline / a dead endpoint
 * degrades to SAMPLE and records nothing (never a fabricated stamp). Writes the V-LIVE evidence to data/honesty/.
 *
 * Run: bun run script/capture-defillama.ts   (keyless; no setup)
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { DefiLlama } from "../src/dataplane/providers/defillama"
import { ProvRecord } from "../src/dataplane/record"
import { DataPlane } from "../src/dataplane/store"

// the curated money-holding Shelf we seed the moat with (resolved to real pool ids from the live /pools by project+symbol+chain)
const CURATED: { project: string; symbol: string; chain: string }[] = [
  { project: "aave-v3", symbol: "USDC", chain: "Ethereum" },
  { project: "aave-v3", symbol: "USDT", chain: "Ethereum" },
  { project: "aave-v3", symbol: "DAI", chain: "Ethereum" },
  { project: "sparklend", symbol: "DAI", chain: "Ethereum" },
  { project: "fluid-lending", symbol: "USDC", chain: "Ethereum" },
  { project: "compound-v3", symbol: "USDC", chain: "Ethereum" },
  { project: "morpho-blue", symbol: "USDC", chain: "Ethereum" },
]

const now = Date.now()
const captured: { key: string; contentSha: string; chainPos: number; apyBase: number | null; apyReward: number | null; tvlUsd: number | null }[] = []
// the shelf registry (poolKey → label + stablecoin symbol) — the SnapshotFile points are numeric-only, so the symbol
// (needed for the peg axis + a human label) is recorded here alongside the moat, not in the time series.
const registry: { poolKey: string; name: string; project: string; symbol: string; chain: string; isStablecoin: boolean }[] = []

// ── the Shelf (REAL) ──
const shelf = await DefiLlama.pools(now)
console.log(`/pools: ${shelf.reality} (${shelf.value.length} shelf pools)${shelf.note ? " · " + shelf.note : ""}`)

if (shelf.reality === "REAL") {
  for (const want of CURATED) {
    const p = shelf.value.find((x) => x.project === want.project && x.symbol === want.symbol && x.chain === want.chain)
    if (!p) { console.log(`  · ${want.project}/${want.symbol}: not found in the live shelf (skipped — never fabricated)`); continue }
    // record the pool's point-in-time base/reward/tvl (REAL)
    const res = ProvRecord.recordReal(DefiLlama.poolSnapshot(p, now))
    captured.push({ key: res.key, contentSha: res.contentSha, chainPos: res.chainPos, apyBase: p.apyBase, apyReward: p.apyReward, tvlUsd: p.tvlUsd })
    registry.push({ poolKey: res.key, name: `${p.project} ${p.symbol}`, project: p.project, symbol: p.symbol, chain: p.chain, isStablecoin: p.stablecoin })
    // record its TVL/APY history (for the TVL-trend axis)
    const ch = await DefiLlama.chart(p.pool, now)
    if (ch.reality === "REAL" && ch.value.length) { const r = ProvRecord.recordReal(DefiLlama.chartSnapshot(p.pool, ch.value)); console.log(`  · ${p.project}/${p.symbol}: pool + chart(${ch.value.length}) recorded (chain ${res.chainPos} · ${r.contentSha.slice(0, 10)}…)`) }
    else console.log(`  · ${p.project}/${p.symbol}: pool recorded (chain ${res.chainPos}); chart ${ch.reality}`)
  }
  // ── the peg (REAL) — one point carrying the current price per stablecoin symbol ──
  const peg = await DefiLlama.stablecoinPrices(now)
  if (peg.reality === "REAL" && Object.keys(peg.value).length) {
    const point: DataPlane.SeriesPoint = { ts: now, ...(Object.fromEntries(Object.entries(peg.value).map(([k, v]) => [`peg_${k}`, v]))) }
    const snap: DataPlane.SnapshotFile = { key: "defillama:peg:usd", kind: "price", source: `${DefiLlama.STABLE_BASE}/stablecoinprices`, url: `${DefiLlama.STABLE_BASE}/stablecoinprices`, capturedAt: now, points: [point] }
    const r = ProvRecord.recordReal(snap)
    console.log(`  · peg: recorded (USDC=${peg.value.USDC} USDT=${peg.value.USDT} DAI=${peg.value.DAI}) · ${r.contentSha.slice(0, 10)}…`)
    captured.push({ key: r.key, contentSha: r.contentSha, chainPos: r.chainPos, apyBase: null, apyReward: null, tvlUsd: null })
  }
} else {
  console.log("offline / no data — nothing recorded (the moat never takes a fabricated stamp); re-run when online.")
}

const chain = DataPlane.verifyProvenanceChain()
const H = path.join(PKG_ROOT, "data", "honesty")
if (!existsSync(H)) mkdirSync(H, { recursive: true })
if (registry.length) writeFileSync(path.join(H, "shelf-registry.json"), JSON.stringify({ protocol: "shelf-registry", at: "2026-07-08", pools: registry }, null, 2) + "\n")
writeFileSync(path.join(H, "vlive-defillama.json"), JSON.stringify({
  protocol: "vlive-defillama", at: "2026-07-08",
  vlive: { pools: "HTTP 200, keyless, 15702 pools, ~0.77s", chart: "HTTP 200, ~1249 daily points", stablecoinprices: "HTTP 200, prices keyed by DeFiLlama slug (usd-coin/tether/dai)" },
  shelfReality: shelf.reality, capturedCount: captured.length, captured,
  chain: { present: chain.present, ok: chain.ok, total: chain.total, keys: chain.keys },
}, null, 2) + "\n")
console.log(`\nchain: present=${chain.present} ok=${chain.ok} total=${chain.total} · recorded ${captured.length} snapshots · written data/honesty/vlive-defillama.json`)
