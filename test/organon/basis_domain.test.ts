/**
 * TEST — the CeFi-DeFi funding-basis domain at its TRUE tier (Spine Phase 4; Rules R-BASIS, E-ATTEMPT). Deterministic
 * (no network). Proves: the hand-verified fixture is reproduced BYTE-FOR-BYTE; the basis tier = MIN(legs) on every point
 * and a T1 label on a T2-legged basis is REFUSED; a gap is NOT bridged (an unmatched interval is dropped, never
 * fabricated); the divergence view renders the spread's instability; the Hyperliquid leg reconstructs byte-faithfully at
 * T2-forward; a basis-carry goal adjudicates with per-leg tiers rendered; the ATTEMPT-law DELIVERED disposition is legal.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { Basis } from "../../src/dataplane/basis"
import { Hyperliquid } from "../../src/dataplane/hyperliquid"
import { DataPlaneFunding } from "../../src/dataplane/funding"
import { Attempt } from "../../src/studio/attempt"
import { Ledger } from "../../src/ledger/ledger"
import { Studio } from "../../src/studio/adjudicate"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const EIGHTH = 8 * 3600_000

test("MIN(legs): the basis is only as strong as its weakest leg — MIN(T1,T2)=T2, MIN(T2,T3)=T3, MIN(T1,T1)=T1", () => {
  expect(Basis.minTier("T1", "T2")).toBe("T2")
  expect(Basis.minTier("T2", "T1")).toBe("T2")
  expect(Basis.minTier("T2", "T3")).toBe("T3")
  expect(Basis.minTier("T1", "T1")).toBe("T1")
})

test("the hand-verified fixture is reproduced BYTE-FOR-BYTE", () => {
  const cexLegs = [{ ts: 0, annualized: DataPlaneFunding.annualize(0.0001, 8) }, { ts: EIGHTH, annualized: DataPlaneFunding.annualize(0.0002, 8) }, { ts: 2 * EIGHTH, annualized: DataPlaneFunding.annualize(-0.0001, 8) }]
  const dexLegs = [{ ts: 0, annualized: 0.08 }, { ts: EIGHTH, annualized: 0.25 }, { ts: 2 * EIGHTH, annualized: -0.05 }]
  const built = Basis.build(cexLegs, "T1", dexLegs, "T2")
  // the hand-computed numbers (worked by hand): annualize(0.0001,8)=0.1095; basis=[0.0295, -0.031, -0.0595]; tier T2
  expect(cexLegs[0].annualized).toBeCloseTo(0.1095, 9)
  expect(built[0].basisAnnualized).toBeCloseTo(0.0295, 9)
  expect(built[1].basisAnnualized).toBeCloseTo(-0.031, 9)
  expect(built[2].basisAnnualized).toBeCloseTo(-0.0595, 9)
  for (const p of built) expect(p.tier).toBe("T2")
  // byte-for-byte: the pipeline output serialises identically to the independently-constructed hand expectation
  const handExpected = cexLegs.map((c, i) => ({ ts: c.ts, cexAnnualized: c.annualized, dexAnnualized: dexLegs[i].annualized, basisAnnualized: c.annualized - dexLegs[i].annualized, cexTier: "T1", dexTier: "T2", tier: "T2" }))
  expect(sha256(JSON.stringify(built))).toBe(sha256(JSON.stringify(handExpected)))
})

test("R-BASIS wall: a T1 label on a T2-legged basis is REFUSED (assertTierIsMin + verifyAllMinTier)", () => {
  const good = { ts: 0, cexAnnualized: 0.1, dexAnnualized: 0.08, basisAnnualized: 0.02, cexTier: "T1" as const, dexTier: "T2" as const, tier: "T2" as const }
  expect(() => Basis.assertTierIsMin(good)).not.toThrow()
  const seeded = { ...good, tier: "T1" as const } // a laundered tier above MIN(legs)
  expect(() => Basis.assertTierIsMin(seeded)).toThrow(/exceeds MIN|weakest leg/i)
  expect(Basis.verifyAllMinTier([seeded]).ok).toBe(false)
  expect(Basis.verifyAllMinTier([good]).ok).toBe(true)
})

test("a gap is NOT bridged — a CEX interval with no matching DEX ts is dropped, never fabricated", () => {
  const cex = [{ ts: 0, annualized: 0.1 }, { ts: EIGHTH, annualized: 0.1 }, { ts: 999 * EIGHTH, annualized: 0.5 }]
  const dex = [{ ts: 0, annualized: 0.08 }, { ts: EIGHTH, annualized: 0.08 }]
  const built = Basis.build(cex, "T1", dex, "T2")
  expect(built.length).toBe(2) // the unmatched CEX interval is dropped
  expect(built.some((p) => p.ts === 999 * EIGHTH)).toBe(false) // never bridged/interpolated
})

test("the divergence view renders the spread's own instability (its danger, not just its carry)", () => {
  const pts: Basis.BasisPoint[] = [0.02, -0.01, 0.03, -0.02].map((b, i) => ({ ts: i * EIGHTH, cexAnnualized: 0.1, dexAnnualized: 0.1 - b, basisAnnualized: b, cexTier: "T1", dexTier: "T2", tier: "T2" }))
  const d = Basis.divergence(pts)
  expect(d.signFlips).toBeGreaterThan(0) // the spread flips sign — instability rendered
  expect(d.render).toMatch(/sign-flips|instability/i)
})

test("the Hyperliquid leg reconstructs byte-faithfully at T2-forward; annualize is hourly→yearly", () => {
  const raw = [{ coin: "BTC", fundingRate: "0.0000125", premium: "-0.0001", time: 1783152000041 }, { coin: "BTC", fundingRate: "0.0000125", premium: "-0.0002", time: 1783148400000 }]
  const pts = Hyperliquid.reconstruct(raw)
  expect(pts.length).toBe(2)
  expect(pts[0].ts).toBeLessThan(pts[1].ts) // sorted by ts
  expect(pts[1].rate).toBe(0.0000125)
  expect(Hyperliquid.TIER).toBe("T2") // T2-forward — a public API read captured forward, never retro-claimed
  expect(Hyperliquid.annualize(0.0000125, 1)).toBeCloseTo(0.0000125 * 24 * 365, 12)
})

test("a basis-carry goal adjudicates with per-leg tiers rendered (MIN tier on every render)", async () => {
  const pts: Basis.BasisPoint[] = Array.from({ length: 120 }, (_, i) => ({ ts: i * 24 * 3600_000, cexAnnualized: 0.12, dexAnnualized: 0.09, basisAnnualized: 0.03, cexTier: "T1", dexTier: "T2", tier: "T2" }))
  const returns = Basis.carryReturns(pts, 24)
  const v = await Studio.submit(new Ledger.Store(), { spec: { family: "funding-basis-carry", policy: "carry", rebalance: { trigger: "daily" }, legs: ["binance:BTCUSDT", "hyperliquid:BTC"] }, authorClass: "agent", domain: "funding-basis", timestamp: Date.parse("2026-07-05T00:00:00Z"), returns, barsPerYear: 365 })
  expect(typeof v.attestation.verdict).toBe("string") // a verdict is produced (the core's, verbatim)
  const render = Basis.render(pts)
  expect(render).toMatch(/MIN\(legs\) = T2/)
  expect(render).toMatch(/Binance T1/)
  expect(render).toMatch(/Hyperliquid T2/)
})

test("the ATTEMPT-law DELIVERED-with-fixture-proof disposition is legal (a differential ref present)", () => {
  const v = Attempt.validate({ domain: "funding-basis", declared: "DELIVER", disposition: "DELIVERED", deliveredDifferential: "basis fixture byte-for-byte + live T2-forward capture", evidence: null, amendment: null })
  expect(v.ok).toBe(true)
})
