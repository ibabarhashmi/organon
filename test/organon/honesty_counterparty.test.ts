/**
 * ORGΛNON — THE DEEPENING SPRINT, Phase 4 walls (COUNTERPARTY-TRUE; Rules X-COVER, X-DETERM, F-IDENTITY). The NEW
 * counterparty/maturity screen — a COARSE STRUCTURAL screen (pool age · size), NOT a contract audit — positive-controlled:
 * a young + dust pool (S13) flags; an established, multi-year, large pool passes; a single flag is caution. The over-claim
 * wall bites: the screen renders its "not a contract audit" caveat and NEVER claims "audited" / "guaranteed" / "safe"
 * (a doc-lie Halt). It resolves through the record (age = recorded /chart span, size = recorded TVL), clone-robust.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { Scorecard } from "../../src/analytics/scorecard"
import { Feed } from "../../src/dataplane/feed"
import { ProvRecord } from "../../src/dataplane/record"
import { DataPlane } from "../../src/dataplane/store"
import { PKG_ROOT } from "../../src/organon/frozen"

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

// ── THE CROWN-JEWEL SPRINT — Phase 3 (DEPENDENCY-TRUE): dependency is SCORED, folded into the screen (age·size·dependency) ──
test("POSITIVE CONTROL (Crown-Jewel D5) — a STACKED dependency (≥3 protocols) is a hard flag folded into the tier", () => {
  // a mature, well-sized pool with a SINGLE transparent dependency (dep=1) → clean pass (the common direct-deposit case)
  expect(Scorecard.counterpartyScreenRow(cp({ ageDays: 1200, sizeUsd: 500_000_000, depProtocols: 1 })).tier).toBe("pass")
  // the SAME pool that STACKS ≥3 protocol dependencies → the clean pass is withheld → caution (extra counterparty surface)
  expect(Scorecard.counterpartyScreenRow(cp({ ageDays: 1200, sizeUsd: 500_000_000, depProtocols: 4 })).tier).toBe("caution")
  // a young pool that ALSO stacks dependencies → two hard flags → fail
  expect(Scorecard.counterpartyScreenRow(cp({ ageDays: 30, sizeUsd: 500_000_000, depProtocols: 4 })).tier).toBe("fail")
  // dependency absent (null) → the screen falls back to age·size only, unchanged (never a fabricated dependency count)
  expect(Scorecard.counterpartyScreenRow(cp({ ageDays: 1200, sizeUsd: 500_000_000, depProtocols: null })).tier).toBe("pass")
})

test("Crown-Jewel D5 — the screen RESTATES its inputs as age · size · dependency (the value carries deps; never over-claimed)", () => {
  const row = Scorecard.counterpartyScreenRow(cp({ ageDays: 1200, sizeUsd: 500_000_000, depProtocols: 4 }))
  expect(String(row.threshold)).toMatch(/deps/) // the threshold restates the third signal
  expect(String(row.value)).toMatch(/deps 4/) // the Pro register carries the dependency count
  expect(row.plainReason).toMatch(/depend|stacked/i) // the plain register names the stacked dependency (qualitative)
  expect(row.plainReason).toMatch(/not a contract audit/i) // the honest caveat still present
  expect(row.plainReason).not.toMatch(/\baudited\b|\bguaranteed\b|\bsafe\b/i) // never over-claimed
})

test("S13 (extended) — a stacked-dependency pool → counterparty flag → not SOLID, dependency NAMED in the summary", () => {
  const s = Scorecard.score(cp({ ageDays: 30, sizeUsd: 500_000_000, depProtocols: 4 })) // young + stacked, everything else clean
  expect(s.rows.find((r) => r.axis === "counterparty")!.tier).toBe("fail")
  expect(s.verdict).toBe("AVOID")
  expect(s.summary).toMatch(/depend|stacked|structural/i) // the flag is named
  expect(Scorecard.consistency(s.verdict, s.plain, s.rows, s.facts.reality).ok).toBe(true)
})

test("Crown-Jewel D5 — a single-dependency pool scores exactly as a null-dependency pool would (the baseline is not a flag)", () => {
  expect(Scorecard.score(cp({ depProtocols: 1 })).verdict).toBe(Scorecard.score(cp({ depProtocols: null })).verdict) // dep=1 never perturbs the verdict
  expect(Scorecard.score(cp({ depProtocols: 1 })).verdict).toBe("SOLID")
})

test("Crown-Jewel D5 — the deviation is in the live ledger, with the four fields + the resolution (a silent scored-signal is a Halt)", () => {
  const led = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "deviations.json"), "utf8")) as { deviations: { id: string; blueprintLine: string; whatWasDone: string; why: string; lawAuthority: string }[] }
  const d5 = led.deviations.find((d) => d.id === "D5")
  expect(d5, "D5 must be recorded (dependency scored, no longer a non-scoring note)").toBeTruthy()
  for (const f of ["blueprintLine", "whatWasDone", "why", "lawAuthority"] as const) expect(d5![f].trim().length).toBeGreaterThan(0)
  expect(d5!.whatWasDone).toMatch(/SCORED|scored/)
  expect(d5!.lawAuthority).toMatch(/X-DEP/)
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
