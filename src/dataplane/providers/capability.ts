/**
 * ORGΛNON — THE DATA CAPABILITY DESCRIPTORS (Alpha Phase 3; X-CAPABILITY a). The other half of the one schema:
 * a DATA capability may deepen the FACTS — a paid DeFiLlama Pro key or a tester-supplied RPC unlocks deeper, richer,
 * still-REAL data that enters tier-stamped through the SAME provenance chain (more real data is still real data; the
 * moat compounds richer; the tier is RECORDED, never inflated). Absence degrades to the free client BYTE-EXACT —
 * the free descriptors wrap today's behavior as a no-op. Keys ride ONLY the fetch URL/transport, never a recorded
 * source/url string (the recorded form is redacted) and never a log.
 */
export namespace DataCapability {
  export interface DataFeatures {
    endpoints: string[] // what this tier can reach
    historyDepthDays: number | null // null = the endpoint's own full history
    rateLimitPerMin: number | null
    datasets: string[]
  }
  export interface Descriptor {
    id: string
    kind: "data"
    auth: string | null // the env-key NAME (never a value)
    tier: "free" | "pro"
    features: DataFeatures
    privacy: { trainsOnPrompts: boolean } // data providers see queries, not prompts — false across the registry
    degrade: string
  }

  export const REGISTRY: Record<string, Descriptor> = {
    "defillama-free": {
      id: "defillama-free", kind: "data", auth: null, tier: "free",
      features: { endpoints: ["/pools", "/chart/{pool}", "/stablecoinprices"], historyDepthDays: null, rateLimitPerMin: 30, datasets: ["yields", "stablecoin-pegs"] },
      privacy: { trainsOnPrompts: false },
      degrade: "the baseline — keyless-first is the constitution (X-BYOK); this IS today's behavior",
    },
    "defillama-pro": {
      id: "defillama-pro", kind: "data", auth: "DEFILLAMA_PRO_API_KEY", tier: "pro",
      features: { endpoints: ["/yields/pools", "/yields/chart/{pool}", "/stablecoins/stablecoinprices", "/api/emissions", "/yields/poolsBorrow", "/derivatives"], historyDepthDays: null, rateLimitPerMin: 1000, datasets: ["yields", "stablecoin-pegs", "emissions/unlocks", "borrow-yields", "derivatives", "hacks"] },
      privacy: { trainsOnPrompts: false },
      degrade: "absent → defillama-free, byte-exact (the pro base is only ever selected when the key is present)",
    },
    "geckoterminal-free": {
      id: "geckoterminal-free", kind: "data", auth: null, tier: "free",
      features: { endpoints: ["/networks/{n}/pools", "/networks/{n}/pools/{addr}"], historyDepthDays: null, rateLimitPerMin: 30, datasets: ["dex-liquidity"] },
      privacy: { trainsOnPrompts: false },
      degrade: "the baseline (today's behavior)",
    },
    "hyperliquid-free": {
      id: "hyperliquid-free", kind: "data", auth: null, tier: "free",
      features: { endpoints: ["/info fundingHistory", "/info candleSnapshot"], historyDepthDays: null, rateLimitPerMin: 60, datasets: ["funding", "candles"] },
      privacy: { trainsOnPrompts: false },
      degrade: "the baseline (today's behavior; T2-FORWARD capture discipline unchanged)",
    },
    "rpc-paid": {
      id: "rpc-paid", kind: "data", auth: "PAID_RPC_URL", tier: "pro",
      features: { endpoints: ["eth_call", "eth_getLogs (archive where the tier allows)"], historyDepthDays: null, rateLimitPerMin: null, datasets: ["sovereign-plane reads"] },
      privacy: { trainsOnPrompts: false },
      degrade: "absent → the existing public-RPC single-probe posture (POOL-EVENTS stays D21 fence-proven-only; no archive node is assumed)",
    },
  }

  // which DeFiLlama descriptor is ACTIVE for this env — the one place the pro key is consulted
  export function defillamaActive(env: Record<string, string | undefined> = process.env): Descriptor {
    return env.DEFILLAMA_PRO_API_KEY ? REGISTRY["defillama-pro"] : REGISTRY["defillama-free"]
  }
}
