/**
 * ORGΛNON — THE MOAT CADENCE (Deepening Phase 5; Rule X-MOAT). One repeatable command the Operator can run on a schedule
 * to COMPOUND the provenance record — the timestamped history of *what was real, and when* deepening every run. It appends
 * ONLY REAL captures (content-addressed, hash-chained through Capture.Service): a capture that finds nothing records
 * nothing (missing stays missing), and a backfill/retro is refused by the store's physics (the nonce is minted at capture
 * time — a past-claiming snapshot cannot verify). It refreshes all THREE verticals: lending + stablecoin-yield (DeFiLlama)
 * + the stablecoin-yield pool's DEX liquidity (GeckoTerminal) + delta-neutral funding (Hyperliquid). Offline → nothing.
 *
 * Run: bun run script/capture-cadence.ts   (keyless; no setup)
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { DefiLlama } from "../src/dataplane/providers/defillama"
import { GeckoTerminal } from "../src/dataplane/providers/geckoterminal"
import { Hyperliquid } from "../src/dataplane/hyperliquid"
import { ProvRecord } from "../src/dataplane/record"
import { DataPlane } from "../src/dataplane/store"

const now = Date.now()
const DAY = 86_400_000
const appended: { key: string; contentSha: string; chainPos: number }[] = []
const rec = (snap: DataPlane.SnapshotFile) => { const r = ProvRecord.recordReal(snap); appended.push({ key: r.key, contentSha: r.contentSha, chainPos: r.chainPos }) }

// the curated shelf (lending) + the DISTINCT stablecoin-yield strategy (a Curve stable-LP, scored with peg + liquidity)
const LENDING = [
  { project: "aave-v3", symbol: "USDC", chain: "Ethereum" }, { project: "aave-v3", symbol: "USDT", chain: "Ethereum" }, { project: "aave-v3", symbol: "DAI", chain: "Ethereum" },
  { project: "sparklend", symbol: "DAI", chain: "Ethereum" }, { project: "fluid-lending", symbol: "USDC", chain: "Ethereum" }, { project: "compound-v3", symbol: "USDC", chain: "Ethereum" },
]
const STABLE_YIELD = { defiPoolId: "e91e23af-9099-45d9-8ba5-ea5b4638e453", gtNetwork: "eth", gtAddress: "0xd001ae433f254283fece51d4acce8c53263aa186" }

const shelf = await DefiLlama.pools(now)
console.log(`DeFiLlama /pools: ${shelf.reality} (${shelf.value.length} shelf pools)`)
if (shelf.reality === "REAL") {
  // lending (durable base yield) + the stablecoin-yield LP (reward-heavy — a distinct vertical)
  for (const want of LENDING) {
    const p = shelf.value.find((x) => x.project === want.project && x.symbol === want.symbol && x.chain === want.chain)
    if (!p) { console.log(`  · ${want.project}/${want.symbol}: not in the live shelf (skipped — never fabricated)`); continue }
    rec(DefiLlama.poolSnapshot(p, now))
    const ch = await DefiLlama.chart(p.pool, now)
    if (ch.reality === "REAL" && ch.value.length) rec(DefiLlama.chartSnapshot(p.pool, ch.value))
    console.log(`  · lending ${p.project}/${p.symbol}: pool${ch.value.length ? " + chart(" + ch.value.length + ")" : ""} recorded`)
  }
  const sy = shelf.value.find((x) => x.pool === STABLE_YIELD.defiPoolId)
  if (sy) {
    rec(DefiLlama.poolSnapshot(sy, now))
    const ch = await DefiLlama.chart(sy.pool, now)
    if (ch.reality === "REAL" && ch.value.length) rec(DefiLlama.chartSnapshot(sy.pool, ch.value))
    console.log(`  · stablecoin-yield ${sy.project}/${sy.symbol}: baseShare ${(sy.apyBase! / (sy.apyBase! + (sy.apyReward ?? 0))).toFixed(2)} (reward-heavy) · pool + chart recorded`)
  } else console.log(`  · stablecoin-yield ${STABLE_YIELD.defiPoolId}: not in the live shelf (skipped)`)
  // peg
  const peg = await DefiLlama.stablecoinPrices(now)
  if (peg.reality === "REAL" && Object.keys(peg.value).length) {
    const point: DataPlane.SeriesPoint = { ts: now, ...Object.fromEntries(Object.entries(peg.value).map(([k, v]) => [`peg_${k}`, v])) }
    rec({ key: "defillama:peg:usd", kind: "price", source: `${DefiLlama.STABLE_BASE}/stablecoinprices`, url: `${DefiLlama.STABLE_BASE}/stablecoinprices`, capturedAt: now, points: [point] })
    console.log(`  · peg: USDC=${peg.value.USDC} recorded`)
  }
}

// the stablecoin-yield pool's DEX LIQUIDITY DEPTH (GeckoTerminal) — the liquidity-depth axis's REAL input
GeckoTerminal.resetCache()
const gt = await GeckoTerminal.pool(STABLE_YIELD.gtNetwork, STABLE_YIELD.gtAddress, now)
if (gt.reality === "REAL" && gt.value) { rec(GeckoTerminal.poolSnapshot(gt.value, now)); console.log(`  · GeckoTerminal liquidity ${gt.value.name}: reserve $${((gt.value.reserveUsd ?? 0) / 1e6).toFixed(1)}M recorded`) }
else console.log(`  · GeckoTerminal liquidity: ${gt.note ?? "unavailable"} (nothing recorded)`)

// delta-neutral funding (Hyperliquid) — last 7d of hourly funding
for (const coin of ["BTC", "ETH"]) {
  try { const cap = await Hyperliquid.captureT2(coin, now - 7 * DAY, now); appended.push({ key: cap.key, contentSha: cap.contentSha, chainPos: cap.chainPos }); console.log(`  · delta-neutral ${coin}: ${cap.nPoints} funding points recorded (chain ${cap.chainPos})`) }
  catch (e) { console.log(`  · delta-neutral ${coin}: ${(e as Error).message} (nothing recorded)`) }
}

const chain = DataPlane.verifyProvenanceChain() // re-verifies the whole chain (a tamper/retro throws)
const H = path.join(PKG_ROOT, "data", "honesty", "evidence")
if (!existsSync(H)) mkdirSync(H, { recursive: true })
writeFileSync(path.join(H, "cadence.json"), JSON.stringify({
  protocol: "moat-cadence", at: "2026-07-08",
  rule: "appends ONLY REAL captures (content-addressed, hash-chained); a backfill/retro is refused by the store's physics; a capture that finds nothing records nothing",
  appendedThisRun: appended.length, appended,
  chain: { present: chain.present, ok: chain.ok, totalStamps: chain.total, keys: chain.keys },
}, null, 2) + "\n")
console.log(`\ncadence: appended ${appended.length} REAL snapshots this run · chain present=${chain.present} ok=${chain.ok} total=${chain.total} · written data/honesty/evidence/cadence.json`)
