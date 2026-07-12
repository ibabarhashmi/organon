/**
 * ORGΛNON — THE FOUR CATCH AXES (Domain sprint; X-DOMAIN c, S69). Each axis renders the ONE fact the seven cannot see,
 * deterministic + number-traced + INFO/CONTEXT, in the pinned grammar. yield-source attributes the yield + the funding-flip
 * census + the JOINT peg; redemption-gap renders the gap + the exit reality; leverage-distance undresses the headline APY;
 * off-chain-opacity renders the RWA warning. Each renders on its domain and ONLY its domain (the catch carries its domain).
 * Every number traces; every line is a FACT, never advice. Outputs SHOWN (CV3).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { YieldSource } from "../../src/domain/axes/yield-source"
import { RedemptionGap } from "../../src/domain/axes/redemption-gap"
import { LeverageDistance } from "../../src/domain/axes/leverage-distance"
import { Reality } from "../../src/studio/reality"
import { Scorecard } from "../../src/analytics/scorecard"

const dm = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "domain-pins.json"), "utf8"))

test("S69 — yield-source: a funding-carry stable renders the funding-flip census + the JOINT peg (grammar SHOWN)", () => {
  // funding negative in 9 of 30 periods; a stablecoin leg → peg + yield are ONE risk
  const rates = [...Array(21).fill(0.00001), ...Array(9).fill(-0.00002)]
  const c = YieldSource.yieldSourceCatch({ apyBase: 15, apyReward: 0, fundingSourced: true, fundingRates: rates, hasPeg: true, venues: ["hyperliquid", "dydx"], tier: "REAL-at-timestamp" })
  expect(c.axis).toBe("yield-source"); expect(c.domain).toBe("STABLE-SYNTH"); expect(c.disposition).toBe("info/context")
  expect(c.numbers.negativePeriods).toBe(9); expect(c.numbers.totalPeriods).toBe(30)
  expect(c.pro).toMatch(/Yield source: perp-funding carry \(not lending interest\)/) // the pinned grammar
  expect(c.pro).toMatch(/negative in 9 of the last 30 periods/)
  expect(c.pro).toMatch(/when it flips, this yield inverts and the peg takes the strain/) // the JOINT peg (STABLE only)
  expect(c.pro).toMatch(/scored JOINTLY/)
  expect(c.pro).toMatch(/never advice/) // a FACT, not advice
})

test("S69 — yield-source: a lending-primary yield does NOT raise a funding alarm; a funding-sourced claim with NO history → INSUFFICIENT (never faked)", () => {
  const lending = YieldSource.yieldSourceCatch({ apyBase: 4, apyReward: 1, fundingSourced: false, fundingRates: [], hasPeg: true, venues: [], tier: "REAL-at-timestamp" })
  expect(lending.pro).toMatch(/Yield source: lending/); expect(lending.pro).not.toMatch(/perp-funding carry \(not lending/)
  const insufficient = YieldSource.yieldSourceCatch({ apyBase: 15, apyReward: 0, fundingSourced: true, fundingRates: [], hasPeg: true, venues: [], tier: "SAMPLE" })
  expect(insufficient.tier).toBe("INSUFFICIENT"); expect(insufficient.pro).toMatch(/0 funding periods captured.*INSUFFICIENT/)
})

test("S69 — redemption-gap: a discount renders the gap + the exit reality (grammar SHOWN); at-par is honest; a missing leg → INSUFFICIENT", () => {
  const c = RedemptionGap.redemptionGapCatch({ symbol: "stETH", denom: "ETH", redemption: 1.0412, secondary: 1.0298, queueReadable: true, queueNote: "withdrawals live", redemptionTier: "REAL★" })
  expect(c.axis).toBe("redemption-gap"); expect(c.domain).toBe("LST-LRT"); expect(c.tier).toBe("REAL★")
  expect(c.numbers.gapPct).toBeCloseTo(1.09, 1) // (1.0412-1.0298)/1.0412 ≈ 1.09%
  expect(c.pro).toMatch(/Redemption 1\.0412 ETH; market 1\.0298 ETH/) // the pinned grammar
  expect(c.pro).toMatch(/Exit at par needs the queue; exit now takes the pool price/)
  const atpar = RedemptionGap.redemptionGapCatch({ symbol: "rETH", denom: "ETH", redemption: 1.1, secondary: 1.1, queueReadable: false, redemptionTier: "REAL★" })
  expect(atpar.numbers.gapPct).toBe(0)
  const insufficient = RedemptionGap.redemptionGapCatch({ symbol: "ezETH", denom: "ETH", redemption: 1.02, secondary: null, queueReadable: false, redemptionTier: "SAMPLE" })
  expect(insufficient.tier).toBe("INSUFFICIENT"); expect(insufficient.pro).toMatch(/INSUFFICIENT.*needs BOTH legs/)
})

test("S69 — leverage-distance: an 8× loop renders the leverage + the % move to liquidation (grammar SHOWN); a degenerate read → INSUFFICIENT", () => {
  // collateral 100, debt 80, liqThreshold 0.9 → equity 20, leverage 5×; HF = 90/80 = 1.125; distance = 1 - 80/90 = 11.1%
  const c = LeverageDistance.leverageDistanceCatch({ collateral: 100, debt: 80, liqThreshold: 0.9, headlineApy: 30.2, tier: "REAL★" })
  expect(c.axis).toBe("leverage-distance"); expect(c.domain).toBe("LOOPED-CDP")
  expect(c.numbers.leverage).toBe(5); expect(c.numbers.distancePct).toBeCloseTo(11.1, 1)
  expect(c.pro).toMatch(/Headline 30\.2% APY is 5× levered — a 11\.1% collateral move liquidates you/) // the pinned grammar
  expect(c.pro).toMatch(/health factor 1\.13/)
  // debt >= collateral (no equity) → INSUFFICIENT (never a faked leverage number)
  const insufficient = LeverageDistance.leverageDistanceCatch({ collateral: 100, debt: 100, liqThreshold: 0.9, headlineApy: 30, tier: "REAL★" })
  expect(insufficient.tier).toBe("INSUFFICIENT")
})

test("S69 — the catch renders on its domain and ONLY its domain (the catch carries its domain; the render byte-identical when absent)", () => {
  // each axis stamps its own domain — a leverage catch is LOOPED-CDP, never STABLE
  expect(LeverageDistance.leverageDistanceCatch({ collateral: 100, debt: 50, liqThreshold: 0.8, headlineApy: 10, tier: "REAL★" }).domain).toBe("LOOPED-CDP")
  // catchBlock(undefined) → "" → byte-identical (proven via the render: a carried subject with no catch == pre-Domain render)
  const facts: Scorecard.PoolFacts = { name: "aave-v3 USDC", apyBase: 3, apyReward: 0, tvlSlope30d: 0.01, pegDev: 0.001, isStablecoin: true, reality: "SAMPLE", provenanceRef: null, vertical: "lending" }
  const scored = Scorecard.score(facts)
  const noCatch = Reality.renderRealityCheck("aave-v3 USDC", scored, [], "defillama:pool:x")
  const withUndefCatch = Reality.renderRealityCheck("aave-v3 USDC", scored, [], "defillama:pool:x", [], null, undefined, "LENDING", undefined)
  expect(withUndefCatch).toBe(noCatch)
  // a new-domain subject with its catch renders the catch block (info/context, not-a-verdict stated)
  const c = LeverageDistance.leverageDistanceCatch({ collateral: 100, debt: 80, liqThreshold: 0.9, headlineApy: 30.2, tier: "REAL★" })
  const withCatch = Reality.renderRealityCheck("gearbox looped USDC", scored, [], "defillama:pool:x", [], null, undefined, "LOOPED-CDP", c)
  expect(withCatch).toMatch(/the catch — what the seven axes can't see/)
  expect(withCatch).toMatch(/it does NOT move the verdict above/) // info/context stated at the render
})

test("S69 — every catch line is a FACT, never advice: no imperative 'you should buy/sell/deposit' phrasing; the pinned grammar matches domain-pins", () => {
  const catches = [
    YieldSource.yieldSourceCatch({ apyBase: 15, apyReward: 0, fundingSourced: true, fundingRates: [-1, 1, 1], hasPeg: true, venues: ["dydx"], tier: "REAL-at-timestamp" }),
    RedemptionGap.redemptionGapCatch({ symbol: "stETH", denom: "ETH", redemption: 1.04, secondary: 1.03, queueReadable: true, redemptionTier: "REAL★" }),
    LeverageDistance.leverageDistanceCatch({ collateral: 100, debt: 80, liqThreshold: 0.9, headlineApy: 30, tier: "REAL★" }),
  ]
  for (const c of catches) {
    for (const line of [c.simple, c.pro]) expect(line).not.toMatch(/\byou should (buy|sell|deposit|withdraw|avoid|invest)\b/i)
    expect(c.disposition).toBe("info/context")
  }
  // the pinned grammar forms are honored (a summarization/drift is a Halt — domain-pins is the contract)
  const g = dm.xDomain.c_oneCatchAxisPerDomain.grammar
  expect(catches[1].pro).toContain("Exit at par needs the queue; exit now takes the pool price")
  expect(g["redemption-gap"]).toContain("Exit at par needs the queue; exit now takes the pool price")
})
