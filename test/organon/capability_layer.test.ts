/**
 * ORGΛNON — THE ALPHA SPRINT, Phase 3 walls (SPLIT-TRUE, part 1 — the layer). Positive-controlled:
 * a seeded verdict-path consumer is REFUSED by the allowlist (the control bites) · the free descriptors mirror the
 * carried constants EXACTLY (byte-backward-compat) · the paid ceiling buys presentation room, bounded, and the gates
 * import no capability · a seeded pro-data value arrives TIER-STAMPED with a REDACTED recorded source (the key can
 * never enter provenance) · the free data path is byte-exact (URL + returned object shape unchanged) · the privacy
 * flag surfaces · the GREP WALL bites on a seeded vendor branch and passes on the real consumers.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { AskCapability } from "../../src/ask/capability"
import { AskTruncation } from "../../src/ask/truncation"
import { AskProvider } from "../../src/ask/provider"
import { DataCapability } from "../../src/dataplane/providers/capability"
import { DefiLlama } from "../../src/dataplane/providers/defillama"

const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")

test("S48 CONTROL — a descriptor flagging into the verdict path is REFUSED (scorecard/stamp/gates); an allowlisted consumer passes", () => {
  for (const forbidden of AskCapability.VERDICT_PATH_FORBIDDEN) {
    expect(() => AskCapability.assertMayConsume(forbidden)).toThrow(/VERDICT PATH/)
  }
  expect(() => AskCapability.assertMayConsume("src/ask/phrase.ts")).not.toThrow()
  // an unknown module is refused too — consumption is a conscious, pinned act
  expect(() => AskCapability.assertMayConsume("src/studio/reality.ts")).toThrow(/not an allowlisted/)
})

test("byte-backward-compat — the free/zero descriptors mirror the carried constants EXACTLY; scaleCap through the layer is the identity of today's scaleCap", () => {
  expect(AskCapability.ZERO_KEY.features.maxOutputCeiling).toBe(AskTruncation.CEIL_MAX_TOKENS)
  for (const d of Object.values(AskCapability.FREE_REGISTRY)) expect(d.features.maxOutputCeiling).toBe(AskTruncation.CEIL_MAX_TOKENS)
  const groq = AskProvider.groqAdapter("fake-key")
  const freeCap = AskCapability.capabilityFor(groq, {}) // no AI_PAID_TIER → free
  for (const n of [0, 1, 3, 10, 22, 100]) {
    expect(AskTruncation.scaleCap(n, AskTruncation.BASE_MAX_TOKENS, freeCap.features.maxOutputCeiling)).toBe(AskTruncation.scaleCap(n))
  }
  expect(AskCapability.capabilityFor(null, {})).toBe(AskCapability.ZERO_KEY)
})

test("the paid tier buys PRESENTATION room only — a bigger (still bounded) ceiling; the paid tier is DECLARED, never inferred from a key", () => {
  const groq = AskProvider.groqAdapter("fake-key")
  const paid = AskCapability.capabilityFor(groq, { AI_PAID_TIER: "1" })
  expect(paid.tier).toBe("paid")
  expect(paid.features.maxOutputCeiling).toBeGreaterThan(AskTruncation.CEIL_MAX_TOKENS)
  expect(paid.features.maxOutputCeiling).toBeLessThanOrEqual(4000) // bounded — never unbounded output
  // a big COMPARE gets more room under paid; a small answer is IDENTICAL under every tier (base unchanged)
  expect(AskTruncation.scaleCap(50, AskTruncation.BASE_MAX_TOKENS, paid.features.maxOutputCeiling)).toBeGreaterThan(AskTruncation.scaleCap(50))
  expect(AskTruncation.scaleCap(2, AskTruncation.BASE_MAX_TOKENS, paid.features.maxOutputCeiling)).toBe(AskTruncation.scaleCap(2))
  // the key alone does NOT flip the tier
  expect(AskCapability.capabilityFor(groq, { GROQ_API_KEY: "sk-looks-expensive" }).tier).toBe("free")
})

test("the VERDICT PATH imports no capability — the seven pinned modules are capability-blind at the source level", () => {
  for (const rel of AskCapability.VERDICT_PATH_FORBIDDEN) {
    const src = read(rel)
    expect(src, `${rel} must not import a capability module`).not.toMatch(/from ["'].*capabilit/i)
    expect(src, `${rel} must not read the paid-tier env`).not.toMatch(/AI_PAID_TIER|DEFILLAMA_PRO_API_KEY/)
  }
})

test("a seeded PRO data value arrives TIER-STAMPED with the key REDACTED from every recorded string; absent key → the free path byte-exact", async () => {
  DefiLlama.resetCache()
  const seen: string[] = []
  const mock: DefiLlama.FetchImpl = async (url) => {
    seen.push(url)
    return { ok: true, status: 200, json: async () => ({ data: [{ pool: "p1", chain: "Ethereum", project: "aave-v3", symbol: "USDC", tvlUsd: 2e8, apyBase: 3.1, apyReward: null, apy: 3.1, stablecoin: true }] }) }
  }
  // PRO: the fetch URL carries the key (transport-only); the RECORDED source carries the REDACTED form + the tier stamp
  const pro = await DefiLlama.pools(1_000, mock, { DEFILLAMA_PRO_API_KEY: "sk-pro-SECRET" })
  expect(seen[0]).toBe("https://pro-api.llama.fi/sk-pro-SECRET/yields/pools")
  expect(pro.tier).toBe("pro")
  expect(pro.source).toBe("https://pro-api.llama.fi/<key>/yields/pools")
  expect(JSON.stringify(pro)).not.toContain("sk-pro-SECRET") // the key can NEVER ride a recordable object
  expect(pro.reality).toBe("REAL") // deeper data is still REAL data — tier-stamped, never tier-inflated
  // FREE: the URL and the returned object are byte-identical to the pre-layer behavior (no tier property AT ALL)
  DefiLlama.resetCache()
  const free = await DefiLlama.pools(1_000, mock, {})
  expect(seen[1]).toBe("https://yields.llama.fi/pools")
  expect("tier" in free).toBe(false)
  expect(free.source).toBe("https://yields.llama.fi/pools")
  // and the SAMPLE fallback can never be tier-inflated: a dead pro endpoint degrades to SAMPLE, not "pro REAL"
  DefiLlama.resetCache()
  const dead: DefiLlama.FetchImpl = async () => ({ ok: false, status: 500, json: async () => null })
  const degraded = await DefiLlama.pools(2_000, dead, { DEFILLAMA_PRO_API_KEY: "sk-pro-SECRET" })
  expect(degraded.reality).toBe("SAMPLE")
  expect(JSON.stringify(degraded)).not.toContain("sk-pro-SECRET")
})

test("the snapshot record path can carry the redacted pro source; the default stays the free source byte-exact", () => {
  const pool: DefiLlama.Pool = { chain: "Ethereum", project: "aave-v3", symbol: "USDC", tvlUsd: 1, apyBase: 1, apyReward: null, apy: 1, pool: "p1", stablecoin: true }
  expect(DefiLlama.poolSnapshot(pool, 5).source).toBe("https://yields.llama.fi/pools")
  const proSnap = DefiLlama.poolSnapshot(pool, 5, "https://pro-api.llama.fi/<key>/yields/pools")
  expect(proSnap.source).toContain("<key>")
  expect(proSnap.url).not.toContain("SECRET")
})

test("the privacy flag surfaces — trains-on-prompts is DECLARED per descriptor (the free AI-Studio tier flagged; paid tiers and data providers false)", () => {
  expect(AskCapability.FREE_REGISTRY["google-ai-studio"].privacy.trainsOnPrompts).toBe(true)
  for (const d of Object.values(AskCapability.PAID_REGISTRY)) expect(d.privacy.trainsOnPrompts).toBe(false)
  for (const d of Object.values(DataCapability.REGISTRY)) expect(d.privacy.trainsOnPrompts).toBe(false)
  expect(AskCapability.ZERO_KEY.privacy.trainsOnPrompts).toBe(false) // deterministic mode: nothing leaves the machine
})

// ── THE GREP WALL (A′#5) — vendor-name BRANCHING outside the descriptor/adapter modules fails; seeded control bites ──
const VENDOR_BRANCH = /(===|!==|case\s+|\.includes\()\s*["'`](gemini|google-ai-studio|openai|anthropic|groq|openai-compatible|defillama-pro)["'`]/
function vendorBranches(src: string): boolean { return VENDOR_BRANCH.test(src) }

test("the grep wall — no vendor-name branching in any capability CONSUMER (flags only); the seeded control is flagged", () => {
  for (const rel of AskCapability.CONSUMER_ALLOWLIST) {
    expect(vendorBranches(read(rel)), `${rel} branches on a vendor name — consumers read FLAGS`).toBe(false)
  }
  // the descriptor/adapter modules are the ONLY homes of vendor knowledge — and the seeded control proves the wall bites
  expect(vendorBranches('if (provider.id === "gemini") { cap = 9999 }')).toBe(true)
  expect(vendorBranches('switch (x) { case "openai": }')).toBe(true)
  expect(vendorBranches('const id = provider.id // passthrough, not a branch')).toBe(false)
})

test("the data-capability registry declares the split's data half — deeper endpoints on pro, the free client as the degrade target", () => {
  const pro = DataCapability.REGISTRY["defillama-pro"]
  const free = DataCapability.REGISTRY["defillama-free"]
  expect(pro.features.datasets).toContain("emissions/unlocks") // the D4 paywalled axis re-armed by a PAID key, honestly
  expect(pro.features.endpoints.length).toBeGreaterThan(free.features.endpoints.length)
  expect(pro.degrade).toMatch(/byte-exact/)
  expect(DataCapability.defillamaActive({}).tier).toBe("free")
  expect(DataCapability.defillamaActive({ DEFILLAMA_PRO_API_KEY: "k" }).tier).toBe("pro")
})
