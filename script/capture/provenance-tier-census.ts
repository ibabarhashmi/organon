/**
 * ORGΛNON — THE PROVENANCE TIER RE-LABEL CENSUS (Coverage sprint; X-COVERAGE c, S65). The conscious, disclosed re-label
 * pass over the tool's actual source families: REAL split into REAL★ (block-pinned chain reads) vs REAL-at-timestamp
 * (aggregator responses). The truth is unchanged — its name is now precise (W-SO01). Run: bun run script/capture/provenance-tier-census.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { ProvenanceTier } from "../../src/dataplane/tier"

const sources = [
  "https://yields.llama.fi/pools (DeFiLlama yields)",
  "https://yields.llama.fi/chart (DeFiLlama chart)",
  "geckoterminal /networks/{n}/pools (dex-liquidity)",
  "hyperliquid /info fundingHistory (funding)",
  "chainlink getRoundData (block-pinned price)",
  "https://eth.llamarpc.com eth_call (RPC-STATE)",
  "governance/archive capture (PAID Network block 11975000)",
  "envio pool-events (fence-proven)",
]
const c = ProvenanceTier.relabelCensus(sources)
const out = { ...c, at: "2026-07-12", note: "the conscious re-label pass over the tool's source families — REAL split by which kind of true. DeFiLlama/GeckoTerminal/Hyperliquid are aggregators (REAL-at-timestamp); Chainlink/RPC/governance/archive/envio are block-pinned chain reads (REAL★). The truth is unchanged — its name is now precise (W-SO01)." }
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "provenance-tier-census.json"), JSON.stringify(out, null, 2) + "\n")
console.log(`re-label census: ${c.total} sources · REAL★ ${c.realStar} · REAL-at-timestamp ${c.atTimestamp}`)
console.log("written: data/honesty/provenance-tier-census.json")
