/**
 * ORGΛNON — THE HONESTY LAYER, Phase 5 walls (FUNDING-TRUE; Rules X-HONEST, X-MOAT). The delta-neutral funding axis:
 * the yield's funding dependence rendered as a volatility BAND [p10,p90], NEVER a single hero APY (research: funding
 * swings widely); a positive band passes, a band straddling zero is CAUTION (regime-dependent), a negative band AVOID
 * (you pay to hold); a SAMPLE / insufficient series renders UNVERIFIED. And the provenance record is USER-VISIBLE — the
 * full "what was real, and when we captured it" history (the moat made visible), clone-robust.
 */
import { test, expect } from "bun:test"
import { Hyperliquid } from "../../src/dataplane/hyperliquid"
import { Scorecard } from "../../src/analytics/scorecard"
import { Feed } from "../../src/dataplane/feed"
import { ProvRecord } from "../../src/dataplane/record"

// build a synthetic hourly funding series with per-interval rates (annualized = rate*24*365*100)
const series = (rates: number[]): Hyperliquid.HlPoint[] => rates.map((r, i) => ({ ts: i * 3_600_000, rate: r, premium: null }))
const const_ = (v: number, n: number) => Array.from({ length: n }, () => v)

test("the funding BAND is [p10,p90] of annualized funding — never a single number; < the minimum window → null", () => {
  const b = Hyperliquid.fundingBand(series(const_(0.00001, 200))) // ~8.76% annualized, constant
  expect(b).not.toBeNull()
  expect(b!.p10).toBeCloseTo(8.8, 0)
  expect(b!.p90).toBeCloseTo(8.8, 0)
  expect(b!.n).toBe(200)
  expect(Hyperliquid.fundingBand(series(const_(0.00001, 50)))).toBeNull() // < MIN_FUNDING_POINTS → UNVERIFIED, never faked
})

test("the funding-regime axis: positive band → pass; straddling zero → caution; negative → fail; the value is a BAND", () => {
  const pass = Scorecard.fundingRegimeRow({ name: "x", apyBase: null, apyReward: null, tvlSlope30d: null, pegDev: null, isStablecoin: false, reality: "REAL", provenanceRef: "c", deltaNeutral: true, fundingBand: { p10: 5, median: 8, p90: 12 } })
  expect(pass.tier).toBe("pass")
  expect(String(pass.value)).toMatch(/\[.*%.*%\]/) // a band, never a single hero APY
  expect(Scorecard.fundingRegimeRow({ name: "x", apyBase: null, apyReward: null, tvlSlope30d: null, pegDev: null, isStablecoin: false, reality: "REAL", provenanceRef: "c", deltaNeutral: true, fundingBand: { p10: -3, median: 5, p90: 11 } }).tier).toBe("caution")
  expect(Scorecard.fundingRegimeRow({ name: "x", apyBase: null, apyReward: null, tvlSlope30d: null, pegDev: null, isStablecoin: false, reality: "REAL", provenanceRef: "c", deltaNeutral: true, fundingBand: { p10: -12, median: -6, p90: -1 } }).tier).toBe("fail")
})

test("the delta-neutral verdict falls out of the funding regime; a regime flip widens the band honestly (CAUTION, no single number lies)", () => {
  const f = (band: { p10: number; median: number; p90: number } | null, reality: Scorecard.Reality = "REAL"): Scorecard.PoolFacts => ({ name: "Hyperliquid BTC delta-neutral", apyBase: null, apyReward: null, tvlSlope30d: null, pegDev: null, isStablecoin: false, reality, provenanceRef: "c", deltaNeutral: true, fundingBand: band })
  expect(Scorecard.score(f({ p10: 5, median: 8, p90: 12 })).verdict).toBe("SOLID") // steady positive carry
  expect(Scorecard.score(f({ p10: -3, median: 5, p90: 11 })).verdict).toBe("CAUTION") // a regime flip: the band widened through zero
  expect(Scorecard.score(f({ p10: -12, median: -6, p90: -1 })).verdict).toBe("AVOID") // you pay to hold
  expect(Scorecard.score(f(null)).verdict).toBe("UNVERIFIED") // insufficient funding history — an honest gap
  expect(Scorecard.score(f({ p10: 5, median: 8, p90: 12 }, "SAMPLE")).verdict).toBe("UNVERIFIED") // a SAMPLE funding series is UNVERIFIED
  // the scorecard scores ONLY the funding axis for a delta-neutral (no yield/peg from a lending pool)
  expect(Scorecard.score(f({ p10: 5, median: 8, p90: 12 })).rows.map((r) => r.axis)).toEqual(["funding-regime"])
})

test("the funding axis reuses the same X-ONE consistency + the verdict is machine-derived (a hand-written flip is caught)", () => {
  const s = Scorecard.score({ name: "d", apyBase: null, apyReward: null, tvlSlope30d: null, pegDev: null, isStablecoin: false, reality: "REAL", provenanceRef: "c", deltaNeutral: true, fundingBand: { p10: -12, median: -6, p90: -1 } })
  expect(s.verdict).toBe("AVOID")
  expect(Scorecard.consistency(s.verdict, s.plain, s.rows, s.facts.reality).ok).toBe(true)
  expect(Scorecard.consistency("SOLID", s.plain, s.rows, s.facts.reality).ok).toBe(false) // can't hand-write SOLID over a negative-carry AVOID
})

test("THE MOAT MADE VISIBLE — the committed funding capture scores clone-robust + the FULL provenance history renders", () => {
  const v = ProvRecord.verify()
  if (!v.present) { console.log("  (honesty_funding) chain absent — run script/capture-hyperliquid.ts"); return }
  const key = Object.keys(v.keys).find((k) => k.startsWith("funding-basis:hyperliquid:"))
  if (!key) { console.log("  (honesty_funding) no funding capture — run script/capture-hyperliquid.ts"); return }
  const facts = Feed.fundingFacts("Hyperliquid delta-neutral", key, Date.now())
  const s = Scorecard.score(facts)
  expect(["SOLID", "CAUTION", "AVOID", "UNVERIFIED"]).toContain(s.verdict)
  // the full history is the moat made visible — every capture, oldest→newest (compounding); a tamper throws in the store
  const hist = ProvRecord.fullHistory(key)
  if (facts.reality === "REAL") {
    expect(facts.fundingBand).not.toBeNull()
    expect(hist.length).toBeGreaterThanOrEqual(1)
    for (let i = 1; i < hist.length; i++) expect(hist[i].asOf).toBeGreaterThanOrEqual(hist[i - 1].asOf) // oldest→newest
  } else {
    expect(s.verdict).toBe("UNVERIFIED") // gitignored payload → honest SAMPLE → UNVERIFIED, never a mislabeled REAL band
  }
})
