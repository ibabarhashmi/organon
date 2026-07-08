/**
 * ORGΛNON — THE DEEPENING SPRINT, Phase 4 walls (COUNTERPARTY-TRUE; Rules X-COVER, X-DETERM, F-IDENTITY). The NEW
 * counterparty/maturity screen — a COARSE STRUCTURAL screen (pool age · size), NOT a contract audit — positive-controlled:
 * a young + dust pool (S13) flags; an established, multi-year, large pool passes; a single flag is caution. The over-claim
 * wall bites: the screen renders its "not a contract audit" caveat and NEVER claims "audited" / "guaranteed" / "safe"
 * (a doc-lie Halt). It resolves through the record (age = recorded /chart span, size = recorded TVL), clone-robust.
 */
import { test, expect } from "bun:test"
import { Scorecard } from "../../src/analytics/scorecard"
import { Feed } from "../../src/dataplane/feed"
import { ProvRecord } from "../../src/dataplane/record"
import { DataPlane } from "../../src/dataplane/store"

const cp = (o: Partial<Scorecard.PoolFacts> = {}): Scorecard.PoolFacts => ({ name: "pool", vertical: "lending", apyBase: 3.1, apyReward: null, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "c", ageDays: 900, sizeUsd: 500_000_000, ...o })

test("POSITIVE CONTROL — the counterparty screen: mature+established → pass · young+dust → fail · single flag → caution", () => {
  expect(Scorecard.counterpartyScreenRow(cp({ ageDays: 1200, sizeUsd: 500_000_000 })).tier).toBe("pass")
  expect(Scorecard.counterpartyScreenRow(cp({ ageDays: 5, sizeUsd: 200_000 })).tier).toBe("fail") // young AND dust
  expect(Scorecard.counterpartyScreenRow(cp({ ageDays: 5, sizeUsd: 50_000_000 })).tier).toBe("caution") // young but big
  expect(Scorecard.counterpartyScreenRow(cp({ ageDays: 1200, sizeUsd: 500_000 })).tier).toBe("caution") // old but dust
  expect(Scorecard.counterpartyScreenRow(cp({ ageDays: null })).tier).toBe("unverified") // no age → UNVERIFIED, never faked
})

test("S13 — a young, tiny pool → counterparty flag → not SOLID, honestly labeled coarse (never audited/safe)", () => {
  const s = Scorecard.score(cp({ ageDays: 5, sizeUsd: 200_000 })) // 5-day, $200k — everything else clean
  expect(s.rows.find((r) => r.axis === "counterparty")!.tier).toBe("fail")
  expect(s.verdict).toBe("AVOID")
  expect(s.summary).toMatch(/young|dust|tiny|structural/i) // the flag is NAMED
})

test("F-IDENTITY / over-claim wall — the counterparty screen renders its caveat and NEVER over-claims 'audited/safe/guaranteed'", () => {
  const OVERCLAIM = /\baudited\b|\bguaranteed\b|risk-free|perfectly safe|\bsafe\b/i
  for (const facts of [cp({ ageDays: 1200, sizeUsd: 500_000_000 }), cp({ ageDays: 5, sizeUsd: 200_000 }), cp({ ageDays: 5, sizeUsd: 50_000_000 })]) {
    const row = Scorecard.counterpartyScreenRow(facts)
    expect(row.plainReason).toMatch(/not a contract audit/i) // the honest caveat is present
    expect(row.plainReason).not.toMatch(OVERCLAIM) // never dressed as an audited safety result
    expect(row.name).toMatch(/not a contract audit/i) // the row name itself carries the caveat
  }
})

test("X-COVER — the counterparty screen is `not-applicable` (never a pass) for a delta-neutral perp venue (parked)", () => {
  const dn: Scorecard.PoolFacts = { name: "Hyperliquid BTC", apyBase: null, apyReward: null, tvlSlope30d: null, pegDev: null, isStablecoin: false, reality: "REAL", provenanceRef: "c", deltaNeutral: true, fundingBand: { p10: 5, median: 8, p90: 12 } }
  expect(Scorecard.counterpartyScreenRow(dn).tier).toBe("not-applicable")
  // the delta-neutral card still scores on funding alone (unchanged) — the verdict differential holds
  expect(Scorecard.score(dn).rows.map((r) => r.axis)).toEqual(["funding-regime"])
})

test("a mature, well-sized lending pool passes the counterparty screen → stays SOLID (no regression)", () => {
  expect(Scorecard.score(cp({})).verdict).toBe("SOLID")
  expect(JSON.stringify(Scorecard.score(cp({})))).toBe(JSON.stringify(Scorecard.score(cp({})))) // determinism (S10)
})

test("the record bridge resolves age (recorded /chart span) + size (recorded TVL), clone-robust", () => {
  const v = ProvRecord.verify()
  if (!v.present) { console.log("  (honesty_counterparty) chain absent — run script/capture-defillama.ts"); return }
  const poolKey = Object.keys(v.keys).find((k) => k.startsWith("defillama:pool:"))
  if (!poolKey) { console.log("  (honesty_counterparty) no DeFiLlama pool captured"); return }
  const chartKey = poolKey.replace(":pool:", ":chart:")
  const series = DataPlane.snapshotAdapter.fetchSeries(poolKey)
  const ts = series ? series.points[series.points.length - 1].ts : Date.now()
  const facts = Feed.poolFacts({ name: "aave-v3 USDC", poolKey, chartKey, isStablecoin: true, vertical: "lending" }, ts, 0.0001)
  const row = Scorecard.counterpartyScreenRow(facts)
  if (facts.reality === "SAMPLE") { expect(row.tier).toBe("unverified"); return } // gitignored payload → honest UNVERIFIED
  expect(facts.ageDays).not.toBeNull() // the recorded /chart span
  expect(facts.sizeUsd).not.toBeNull() // the recorded pool TVL
  expect(["pass", "caution", "fail"]).toContain(row.tier) // a real, computed structural screen
  expect(Scorecard.consistency(Scorecard.score(facts).verdict, Scorecard.score(facts).plain, Scorecard.score(facts).rows, facts.reality).ok).toBe(true)
})
