/**
 * ORGΛNON — THE COVERAGE SPRINT, Phase 2 wall (BREADTH-HONEST; S64). The DeFiLlama Yields breadth layer + the license
 * posture + the census, all pure + injectable + degrade-never-throw: the universe parses + content-hashes; the census
 * applies the pinned 'covered' definition EXACTLY (a SAMPLE-only pool is NEVER counted covered); the license posture is a
 * rendered fact (branch γ degrades a REAL DeFiLlama number to SAMPLE in a served commercial context — S64 bites); the
 * vaults.fyi descriptor is BYOK-only (absent → byte-exact); offline → 0 covered (never inflated).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { DefiLlama } from "../../src/dataplane/providers/defillama"
import { LlamaYields, CoveragePosture } from "../../src/dataplane/providers/llama-yields"
import { DataCapability } from "../../src/dataplane/providers/capability"

const NOW = Date.parse("2026-07-12T00:00:00Z")
// a fixture /pools body: 3 covered (a real apy) + 1 SAMPLE-only (no apy at all)
const POOLS_FIXTURE = {
  data: [
    { pool: "aaaa1111-2222-3333-4444-555566667777", chain: "Ethereum", project: "aave-v3", symbol: "USDC", apyBase: 3.1, apyReward: null, apy: 3.1, tvlUsd: 2.4e8, stablecoin: true },
    { pool: "bbbb1111-2222-3333-4444-555566667777", chain: "Arbitrum", project: "compound-v3", symbol: "USDT", apyBase: 4.0, apyReward: 0.5, apy: 4.5, tvlUsd: 5e7, stablecoin: true },
    { pool: "cccc1111-2222-3333-4444-555566667777", chain: "Base", project: "some-farm", symbol: "WETH", apyBase: null, apyReward: 12.0, apy: 12.0, tvlUsd: 1e6, stablecoin: false },
    { pool: "dddd1111-2222-3333-4444-555566667777", chain: "Solana", project: "no-apy", symbol: "XYZ", apyBase: null, apyReward: null, apy: null, tvlUsd: 3e6, stablecoin: false },
  ],
}
const fetchOk: DefiLlama.FetchImpl = async () => ({ ok: true, status: 200, json: async () => POOLS_FIXTURE })
const fetch500: DefiLlama.FetchImpl = async () => ({ ok: false, status: 500, json: async () => ({}) })

test("BREADTH — the universe parses the FULL valid-pool set (not the isShelf subset), tags reality, and content-hashes", async () => {
  DefiLlama.resetCache()
  const u = await LlamaYields.universe(NOW, fetchOk, {})
  expect(u.reality).toBe("REAL")
  expect(u.count).toBe(4) // ALL valid pools (a non-shelf farm is in the universe), not just the curated shelf
  expect(u.contentSha).toMatch(/^[0-9a-f]{64}$/)
  // the hash is canonical (order-independent): the same pools in a different order → the same sha
  expect(LlamaYields.universeSha([...u.pools].reverse())).toBe(u.contentSha)
})

test("BREADTH — the census applies the pinned 'covered' definition EXACTLY: SAMPLE-only is NEVER counted covered (the census is an outcome, never gamed — S64)", async () => {
  DefiLlama.resetCache()
  const u = await LlamaYields.universe(NOW, fetchOk, {})
  const c = LlamaYields.census(u, NOW)
  expect(c.universeSize).toBe(4)
  expect(c.covered).toBe(3) // three pools have a real aggregator apy → covered
  expect(c.sampleOnly).toBe(1) // the no-apy pool is SAMPLE-only, NOT covered (the gamed-census Halt)
  expect(c.tierBreakdown["REAL-at-timestamp"]).toBe(3)
  expect(c.coveredDefinition).toMatch(/SAMPLE-only does NOT count/i)
  // POSITIVE CONTROL: a pool with no apy is not covered even though it's in the universe (a thin lookup can't inflate)
  const thin = u.pools.find((p) => p.project === "no-apy")!
  expect(LlamaYields.isCovered(thin, "REAL")).toBe(false)
})

test("BREADTH — offline: the universe degrades to SAMPLE with 0 covered (never a throw, never an inflated census)", async () => {
  DefiLlama.resetCache()
  const u = await LlamaYields.universe(NOW, fetch500, {})
  expect(u.reality).toBe("SAMPLE")
  expect(u.count).toBe(0)
  expect(LlamaYields.census(u, NOW).covered).toBe(0) // honest zero, never a fabricated coverage claim
})

test("BREADTH — the license posture is a RENDERED FACT: branch γ (default) degrades a REAL DeFiLlama number to SAMPLE in a SERVED COMMERCIAL context (S64 bites)", () => {
  // default branch is γ (the honest closed-alpha posture — never a silent commercial serve on the free tier)
  expect(CoveragePosture.branch({})).toBe("gamma")
  expect(CoveragePosture.serves({})).toBe(false)
  // in a commercial-serve context under γ, REAL → SAMPLE (degraded BY the posture), with the verbatim ToS + standing exposure
  const commercial = CoveragePosture.effectiveReality("REAL", true, {})
  expect(commercial.reality).toBe("SAMPLE")
  expect(commercial.degradedByPosture).toBe(true)
  expect(commercial.posture).toMatch(/USD 100,000 per violation/)
  expect(commercial.posture).toMatch(/already uses the free tier/i)
  // a NON-commercial context (a local reader / the battery) is unaffected — real facts render locally
  expect(CoveragePosture.effectiveReality("REAL", false, {}).reality).toBe("REAL")
  // branch α (consent) / β (paid) SERVE — no degrade even in a commercial context
  expect(CoveragePosture.effectiveReality("REAL", true, { ORGANON_DEFILLAMA_LICENSE: "consent" }).reality).toBe("REAL")
  expect(CoveragePosture.effectiveReality("REAL", true, { ORGANON_DEFILLAMA_LICENSE: "paid" }).degradedByPosture).toBe(false)
})

test("BREADTH — vaults.fyi is a BYOK-only paid-DATA descriptor (no free tier); absent → byte-exact; it's in the registry", () => {
  const d = DataCapability.REGISTRY["vaultsfyi-byok"]
  expect(d).toBeDefined()
  expect(d.tier).toBe("pro")
  expect(d.auth).toBe("VAULTSFYI_API_KEY") // BYOK — an env-key NAME, never a value
  expect(d.degrade).toMatch(/BYTE-EXACT/i)
  expect(d.degrade).toMatch(/no free tier exists/i)
})

test("BREADTH — the committed coverage census is an outcome artifact (pinned definition applied; never inflated)", () => {
  const c = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "coverage-census.json"), "utf8"))
  expect(c.protocol).toBe("coverage-census")
  expect(c.coveredDefinition).toMatch(/SAMPLE-only does NOT count/i)
  expect(c.covered).toBeLessThanOrEqual(c.universeSize) // never more covered than the universe (a papered census)
  expect(c.covered).toBe(c.universeSize - c.sampleOnly)
  expect(c.tier).toBe("REAL-at-timestamp") // DeFiLlama is an aggregator — never REAL★
})
