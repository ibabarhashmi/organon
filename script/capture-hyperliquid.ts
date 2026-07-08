/**
 * ORGΛNON — the Hyperliquid funding live-capture (Honesty Layer Phase 5; Rules X-MOAT, D-LABEL, R-BASIS). Records the
 * delta-neutral funding series (BTC/ETH) T2-FORWARD — keyless, nonce-anchored through Capture.Service (a retro-claimed
 * history cannot verify). Adds the delta-neutral strategies to the shelf registry so the Reality Check can x-ray them.
 * Offline / an empty series → nothing recorded (the moat never takes a fabricated stamp). Run: bun run script/capture-hyperliquid.ts
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Hyperliquid } from "../src/dataplane/hyperliquid"

const now = Date.now()
const start = now - 30 * 86_400_000 // ~30 days of hourly funding (the API caps ~500 rows; ≥ the 100-point band minimum)
const captured: { coin: string; key: string; nPoints: number; band: Hyperliquid.FundingBand | null }[] = []

for (const coin of ["BTC", "ETH"]) {
  try {
    const cap = await Hyperliquid.captureT2(coin, start, now)
    const band = Hyperliquid.fundingBand(cap.points)
    captured.push({ coin, key: cap.key, nPoints: cap.nPoints, band })
    console.log(`${coin}: recorded ${cap.nPoints} funding points (chain pos ${cap.chainPos}) · band ${band ? `[${band.p10}%, ${band.p90}%] median ${band.median}%` : "insufficient"}`)
  } catch (e) {
    console.log(`${coin}: ${(e as Error).message} — nothing recorded (never fabricated)`)
  }
}

// merge the delta-neutral strategies into the shelf registry (append-only; keep the existing yield entries)
const regPath = path.join(PKG_ROOT, "data", "honesty", "shelf-registry.json")
const reg = existsSync(regPath) ? (JSON.parse(readFileSync(regPath, "utf8")) as { protocol: string; at: string; pools: { poolKey: string; name: string; symbol: string; isStablecoin: boolean; kind?: string }[] }) : { protocol: "shelf-registry", at: "2026-07-08", pools: [] }
for (const c of captured) {
  if (!reg.pools.some((p) => p.poolKey === c.key)) reg.pools.push({ poolKey: c.key, name: `Hyperliquid ${c.coin} delta-neutral`, symbol: c.coin, isStablecoin: false, kind: "delta-neutral" })
}
if (captured.length) writeFileSync(regPath, JSON.stringify(reg, null, 2) + "\n")
console.log(`registry: ${reg.pools.length} strategies (${reg.pools.filter((p) => p.kind === "delta-neutral").length} delta-neutral) · recorded ${captured.length} funding series`)
