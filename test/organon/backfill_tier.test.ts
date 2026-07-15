/**
 * ORGΛNON — THE BACKFILL SPRINT (V43), Phase 4: THE TIER LADDER & MIX-LABELING (S187, S188).
 *
 * The ladder REAL★ > REAL-DERIVED > REAL@ts > RETROSPECTIVE, pinned. A cross-tier chain FAILS; a price feed backfilled as a
 * rate FAILS (the observable must match the source); the own-leg mix is labeled with the RATIO and capped by the weakest
 * dominant tier (F-2/RP-2). It is not laundering; it is a named, weaker, still-re-derivable tier.
 */
import { test, expect } from "bun:test"
import { Tier } from "../../src/plane/tier"
import { Backfill } from "../../src/plane/backfill"

// ── S187 (W-BF08) — the observable TYPE must match the source (a price feed as a rate FAILS) ──

test("S187 (W-BF08) — a rate-space subject accepts a rate-space feed (rETH/ETH exchange-rate) — the types match", () => {
  expect(Tier.observableTypeMatches("rate", "exchange-rate")).toBeNull() // an exchange rate IS rate-space
  expect(Tier.observableTypeMatches("exchange-rate", "exchange-rate")).toBeNull()
  // the pinned rETH/ETH feed is exchange-rate (rate-space), NOT a USD price
  expect(Backfill.feed("reth-eth-exchange-rate")!.observableType).toBe("exchange-rate")
})

test("S187 (W-BF08) — SEEDED NEGATIVE: a PRICE feed (FRAX/USD) backfilled into a RATE subject FAILS (a category error)", () => {
  const v = Tier.observableTypeMatches("rate", "price")
  expect(v).not.toBeNull()
  expect(v).toMatch(/price.*cannot be backfilled into a rate|do not match/)
  // FRAX/USD is the pinned negative control — a price feed, never chained as a rate
  expect(Backfill.feed("frax-usd-price")!.observableType).toBe("price")
})

// ── S188 (W-BF09) — the tier ladder is pinned and enforced; tiers never mix ──

test("S188 (W-BF09) — the ladder is pinned: REAL★ > REAL-DERIVED > REAL@ts > RETROSPECTIVE", () => {
  expect(Tier.ladder()).toEqual(["REAL★", "REAL-DERIVED", "REAL@ts", "RETROSPECTIVE"])
  expect(Tier.stronger("REAL★", "REAL-DERIVED")).toBe(true)
  expect(Tier.stronger("REAL-DERIVED", "RETROSPECTIVE")).toBe(true)
  expect(Tier.stronger("REAL-DERIVED", "REAL★")).toBe(false)
})

test("S188 (W-BF09) — a clean 3-chain (each tier in its own chain) has NO violations", () => {
  const chains = {
    realStar: [{ tier: "REAL★", blockNumber: 25537838 }],
    realDerived: [{ tier: "REAL-DERIVED", roundId: "36893488147419103932" }],
    retrospective: [{ tier: "RETROSPECTIVE", revisable: true }],
  }
  expect(Tier.crossTierViolations(chains)).toEqual([])
})

test("S188 (W-BF09) — SEEDED NEGATIVE: a REAL-DERIVED in the REAL★ chain, and a RETROSPECTIVE in either, FAIL", () => {
  // a REAL-DERIVED spliced into the REAL★ chain (the cardinal provenance sin)
  const v1 = Tier.crossTierViolations({ realStar: [{ tier: "REAL-DERIVED", roundId: "1" }] })
  expect(v1.length).toBeGreaterThan(0)
  // a RETROSPECTIVE (revisable) in the REAL-DERIVED chain
  const v2 = Tier.crossTierViolations({ realDerived: [{ tier: "RETROSPECTIVE", revisable: true }] })
  expect(v2.length).toBeGreaterThan(0)
  // a REAL-DERIVED carrying a blockNumber would masquerade as REAL★ — caught
  const v3 = Tier.crossTierViolations({ realDerived: [{ tier: "REAL-DERIVED", roundId: "1", blockNumber: 123 }] })
  expect(v3.some((s) => /masquerade/.test(s))).toBe(true)
})

// ── F-2/RP-2 — the mix label always renders the RATIO and caps by the weakest dominant tier ──

test("F-2/RP-2 — the mix ALWAYS renders the tier RATIO, not just the mix", () => {
  const mix = Tier.mixLabel({ realStar: 3, realDerived: 500, retrospective: 0 })
  expect(mix.total).toBe(503)
  expect(mix.ratios["REAL★"]).toBe("0.6%")
  expect(mix.ratios["REAL-DERIVED"]).toBe("99.4%")
  expect(mix.label).toMatch(/3 REAL★ \(0\.6%\), 500 REAL-DERIVED \(99\.4%\)/)
})

test("F-2/RP-2 — a series >50% REAL-DERIVED is labeled PREDOMINANTLY THIRD-PARTY HISTORICAL (confidence capped by the weakest dominant tier)", () => {
  const mix = Tier.mixLabel({ realStar: 3, realDerived: 500 })
  expect(mix.predominantlyThirdParty).toBe(true)
  expect(mix.label).toMatch(/PREDOMINANTLY THIRD-PARTY HISTORICAL.*NOT self-captured/)
  // a predominantly-REAL★ series is NOT flagged third-party
  const own = Tier.mixLabel({ realStar: 200, realDerived: 3 })
  expect(own.predominantlyThirdParty).toBe(false)
})

test("F-2/RP-2 — an empty archive is UNJUDGEABLE, honestly", () => {
  const mix = Tier.mixLabel({})
  expect(mix.total).toBe(0)
  expect(mix.dominantTier).toBeNull()
  expect(mix.label).toMatch(/EMPTY.*UNJUDGEABLE/)
})
