/**
 * ORGΛNON — THE COVERAGE SPRINT, Phase 2 wall (the ANY-POOL LOOKUP; S64/X-COVERAGE b). A covered pool → the EXISTING
 * per-axis pipeline runs, each axis rendering on whatever genuinely exists: yield-reality from the aggregator apy
 * (REAL-at-timestamp), tvl-trend from the chart (UNVERIFIED where <30d), peg UNVERIFIED (a lookup fetches no peg), the
 * contract axis UNVERIFIED (no build analyzed). A thin pool renders THIN, never blank/crashed. Hostile/garbage ids →
 * typed refusals, never a stack trace. The walls run identically on a looked-up subject.
 */
import { test, expect } from "bun:test"
import { DefiLlama } from "../../src/dataplane/providers/defillama"
import { LlamaYields } from "../../src/dataplane/providers/llama-yields"
import { Scorecard } from "../../src/analytics/scorecard"

const NOW = Date.parse("2026-07-12T00:00:00Z")
const DAY = 86_400_000
const pool = (over: Partial<DefiLlama.Pool>): DefiLlama.Pool => ({ chain: "Ethereum", project: "aave-v3", symbol: "USDC", tvlUsd: 2.4e8, apyBase: 3.1, apyReward: null, apy: 3.1, pool: "aaaa1111-2222-3333-4444-555566667777", stablecoin: true, ...over })
// a 40-day chart (>30d → tvl-trend renders) vs a thin 5-day chart (<30d → tvl-trend UNVERIFIED)
const chart40 = Array.from({ length: 40 }, (_, i) => ({ ts: NOW - (39 - i) * DAY, tvlUsd: 2e8 + i * 1e6, apyBase: 3.1, apyReward: null }))
const chartThin = Array.from({ length: 5 }, (_, i) => ({ ts: NOW - (4 - i) * DAY, tvlUsd: 2e8, apyBase: 3.1, apyReward: null }))

test("LOOKUP — validateId REFUSES hostile/garbage/absent ids with a sentence (never a crash)", () => {
  expect(LlamaYields.validateId("").ok).toBe(false)
  expect(LlamaYields.validateId("'; DROP TABLE pools;--").ok).toBe(false)
  expect(LlamaYields.validateId("../../etc/passwd").ok).toBe(false)
  expect(LlamaYields.validateId("x".repeat(200)).ok).toBe(false)
  const bad = LlamaYields.validateId("!!not-a-uuid!!")
  expect(bad.ok).toBe(false)
  if (!bad.ok) expect(bad.reason).toMatch(/not.*fabricated|nothing/i) // a sentence, honest
  // a real DeFiLlama uuid + the prefixed form both validate
  const ok = LlamaYields.validateId("defillama:pool:aaaa1111-2222-3333-4444-555566667777")
  expect(ok.ok).toBe(true)
  if (ok.ok) expect(ok.id).toBe("aaaa1111-2222-3333-4444-555566667777")
})

test("LOOKUP — find() locates a pool by id within the universe; absent → null (never a fabricated pool)", () => {
  const pools = [pool({}), pool({ pool: "bbbb1111-2222-3333-4444-555566667777", project: "compound-v3" })]
  expect(LlamaYields.find("aaaa1111-2222-3333-4444-555566667777", pools)?.project).toBe("aave-v3")
  expect(LlamaYields.find("defillama:pool:bbbb1111-2222-3333-4444-555566667777", pools)?.project).toBe("compound-v3")
  expect(LlamaYields.find("ffff-does-not-exist", pools)).toBeNull()
})

test("LOOKUP — a COVERED pool runs the full per-axis pipeline: yield-reality REAL, tvl-trend from the chart; the scorecard is valid (walls run on a looked-up subject)", () => {
  const facts = LlamaYields.lookupFacts(pool({}), chart40, "REAL", NOW)
  expect(facts.reality).toBe("REAL") // yield-reality REAL-at-timestamp (a real aggregator apy)
  expect(facts.tvlSlope30d).not.toBeNull() // >30d of chart → the tvl-trend axis has a value
  const scored = Scorecard.score(facts)
  expect(scored.verdict).toMatch(/SOLID|CAUTION|AVOID|UNVERIFIED/)
  const yieldRow = scored.rows.find((r) => r.axis === "yield-reality")
  expect(yieldRow).toBeDefined()
  expect(yieldRow!.tier).not.toBe("unverified") // the yield axis RENDERS on real data (not blank)
  const tvlRow = scored.rows.find((r) => r.axis === "tvl-trend")
  expect(tvlRow!.tier).not.toBe("unverified") // 40d chart → the deposit trend renders
})

test("LOOKUP — a THIN pool renders THIN, never blank/crashed: <30d chart → tvl-trend UNVERIFIED; no peg fetched → peg UNVERIFIED (honest degrade)", () => {
  const facts = LlamaYields.lookupFacts(pool({}), chartThin, "REAL", NOW)
  expect(facts.tvlSlope30d).toBeNull() // <30d → the tvl-trend axis is honestly UNVERIFIED, not a fabricated slope
  expect(facts.pegDev).toBeNull() // a lookup fetches no peg → the peg axis is UNVERIFIED (never a fabricated deviation)
  const scored = Scorecard.score(facts)
  const tvlRow = scored.rows.find((r) => r.axis === "tvl-trend")
  expect(tvlRow!.tier).toBe("unverified") // thin → UNVERIFIED (never blank, never inflated)
  const pegRow = scored.rows.find((r) => r.axis === "peg")
  if (pegRow) expect(pegRow.tier).toBe("unverified") // a stablecoin lookup with no peg fetch → peg UNVERIFIED
})

test("LOOKUP — a SAMPLE/thin pool (no covered apy) resolves reality SAMPLE (never inflated to REAL)", () => {
  const noApy = pool({ apyBase: null, apy: null })
  const facts = LlamaYields.lookupFacts(noApy, chart40, "REAL", NOW)
  expect(facts.reality).toBe("SAMPLE") // not covered → SAMPLE → the scorecard renders UNVERIFIED honestly
  expect(Scorecard.score(facts).verdict).toBe("UNVERIFIED")
})
