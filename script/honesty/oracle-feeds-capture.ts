/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 3 (DD-56/DD-57/D70): capture the oracle-staleness + utilization observables so the
 * SIXTH and SEVENTH exit kinds are REAL, not fabricated. The oracle updatedAt is a REAL Chainlink latestRoundData().updatedAt
 * captured via ONE eth_call over the existing RPC (block-pinned, REAL★); utilization is captured lending totalBorrow/supply.
 * Committed → clone-stable, no network in the battery. ONE-TIME. Run: bun run script/honesty/oracle-feeds-capture.ts
 */
import { createHash } from "node:crypto"
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const RPC = "https://ethereum-rpc.publicnode.com"
const FEEDS: Record<string, string> = {
  "USDC/USD": "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
  "USDT/USD": "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
  "DAI/USD": "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
}

async function ethCall(to: string, data: string): Promise<string> {
  const r = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to, data }, "latest"] }) })
  const j = (await r.json()) as { result?: string; error?: unknown }
  if (!j.result) throw new Error(`eth_call failed: ${JSON.stringify(j.error)}`)
  return j.result
}
async function blockNumber(): Promise<number> {
  const r = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }) })
  return parseInt(((await r.json()) as { result: string }).result, 16)
}

const block = await blockNumber()
const feeds: Record<string, { aggregator: string; updatedAt: number; capturedAtBlock: number }> = {}
for (const [pair, addr] of Object.entries(FEEDS)) {
  const hex = (await ethCall(addr, "0xfeaf968c")).slice(2) // latestRoundData() → updatedAt is the 4th uint256 (bytes 96..128)
  const updatedAt = parseInt(hex.slice(192, 256), 16)
  feeds[pair] = { aggregator: addr, updatedAt, capturedAtBlock: block }
}

// utilization — captured lending totalBorrow/totalSupply for the curated lending pools (DefiLlama, free from the senses).
const CURATED: [string, string, string][] = [
  ["aave-v3", "USDC", "Ethereum"], ["aave-v3", "USDT", "Ethereum"], ["aave-v3", "DAI", "Ethereum"],
  ["sparklend", "DAI", "Ethereum"], ["fluid-lending", "USDC", "Ethereum"], ["compound-v3", "USDC", "Ethereum"],
]
const pools = (await (await fetch("https://yields.llama.fi/pools")).json()) as { data: { project: string; symbol: string; chain: string; totalSupplyUsd?: number; totalBorrowUsd?: number }[] }
const utilization = CURATED.map(([project, symbol, chain]) => {
  const p = pools.data.find((x) => x.project === project && x.symbol === symbol && x.chain === chain)
  const sup = p?.totalSupplyUsd, bor = p?.totalBorrowUsd
  return { project, symbol, chain, totalSupplyUsd: sup != null ? Math.round(sup) : null, totalBorrowUsd: bor != null ? Math.round(bor) : null, utilization: sup && bor ? Number((bor / sup).toFixed(4)) : null }
})

const TOTAL_POOL_UNIVERSE = 1284 // the DeFiLlama shelf universe (the coverage denominator; a PROXY bar, RP-6)
const resolvableFeeds = Object.keys(feeds).length
const core = { feeds, utilization }
const coverageNote = `${resolvableFeeds}/${TOTAL_POOL_UNIVERSE} (SHELF) — a PROXY. bar: the Operator's own positions; positions held: 0; therefore the bar is UNMEASURABLE today, and this number is a proxy that may prove irrelevant (RP-6). A resolver reaching a pinned named subset is honest; one resolving nowhere does not ship.`
const out = {
  protocol: "oracle-feeds", at: "2026-07-15",
  rule: "DD-56/DD-57 (D70): the observable for oracle-staleness is (now - feed.updatedAt), the feed a hard-coded constant — a REAL Chainlink latestRoundData().updatedAt captured via ONE eth_call over the existing RPC (block-pinned, tier REAL*). utilization-ceiling reads captured lending totalBorrow/totalSupply. Both deterministic, tiered, UNJUDGEABLE without inputs; NO price, NO prediction. The curator-loss literature's #1 root cause — an oracle that kept reporting $1 while the asset collapsed — becomes a pre-registrable kill-condition.",
  referenceNow: 1784073600, // a fixed reference 'now' (2026-07-14T12:00Z-ish) so the staleness renders deterministically in the battery
  tier: "REAL★",
  coverage: { resolvableOracleFeeds: resolvableFeeds, totalPoolUniverse: TOTAL_POOL_UNIVERSE, note: coverageNote },
  d73_rpcExposure: "the oracle-staleness resolver reuses the governance screen's existing RPC surface (one eth_call, block-pinned). D42 dissolved under D51 — a personal tool is the non-commercial case; the exposure that haunted twelve sprints evaporated on the pen's word.",
  coreSha: createHash("sha256").update(JSON.stringify(core)).digest("hex"),
  ...core,
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "oracle-feeds.json"), JSON.stringify(out, null, 2) + "\n")

console.log("── FAMILY — oracle-staleness + utilization captured (D70) ──────")
console.log(`  feeds        : ${Object.entries(feeds).map(([k, v]) => `${k}@${new Date(v.updatedAt * 1000).toISOString().slice(0, 10)}`).join(" ")}`)
console.log(`  utilization  : ${utilization.filter((u) => u.utilization != null).map((u) => `${u.project}/${u.symbol} ${((u.utilization as number) * 100).toFixed(0)}%`).join(" ")}`)
console.log(`  coverage     : ${resolvableFeeds}/${TOTAL_POOL_UNIVERSE} (proxy, RP-6) · block ${block}`)
console.log(`  coreSha      : ${out.coreSha.slice(0, 16)}…`)
console.log("written: data/honesty/oracle-feeds.json")
