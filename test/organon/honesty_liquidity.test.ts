/**
 * ORGΛNON — THE DEEPENING SPRINT, Phase 2 walls (LIQUIDITY-TRUE; Rules X-COVER, X-HONEST, X-LEAN). The NEW liquidity-depth
 * axis — thin liquidity is real exit/slippage risk — positive-controlled: deep→pass, thin→fail, shallow→caution; a
 * deep-APY pool with dust liquidity (S11) is NOT SOLID. The GeckoTerminal provider mirrors DeFiLlama: keyless, injectable
 * fetch, degrade-to-SAMPLE-never-throw, boundary-validated; a dead endpoint keeps the tool running. The axis renders
 * `not-applicable` (never a pass) for a lending market (whose exit is the protocol's liquidity, not a DEX pool depth).
 * The leak wall covers the new provider; the row maps onto the byte-untouched WHY fact-row schema.
 */
import { test, expect } from "bun:test"
import { Scorecard } from "../../src/analytics/scorecard"
import { GeckoTerminal } from "../../src/dataplane/providers/geckoterminal"
import { Seams } from "../../src/dataplane/seams"
import { Explain } from "../../src/analytics/explain"

const sy = (o: Partial<Scorecard.PoolFacts> = {}): Scorecard.PoolFacts => ({ name: "stable-lp", vertical: "stablecoin-yield", apyBase: 4.0, apyReward: 0.5, tvlSlope30d: 0.02, pegDev: 0.002, isStablecoin: true, reality: "REAL", provenanceRef: "c", liqUsd: 2_000_000, ageDays: 500, sizeUsd: 30_000_000, ...o })

test("POSITIVE CONTROL — the liquidity-depth axis: deep → pass · thin → fail · shallow → caution", () => {
  expect(Scorecard.liquidityDepthRow(sy({ liqUsd: 2_000_000 })).tier).toBe("pass")
  expect(Scorecard.liquidityDepthRow(sy({ liqUsd: 20_000 })).tier).toBe("fail") // thin — exit/slippage risk
  expect(Scorecard.liquidityDepthRow(sy({ liqUsd: 200_000 })).tier).toBe("caution") // shallow
  expect(Scorecard.liquidityDepthRow(sy({ liqUsd: null })).tier).toBe("unverified") // missing depth → UNVERIFIED, never faked
})

test("S11 — a deep-APY pool with dust liquidity → liquidity FAIL → NOT SOLID (exit risk surfaced)", () => {
  const s = Scorecard.score(sy({ apyBase: 9.0, apyReward: 0.1, liqUsd: 20_000 })) // a fat, durable-looking APY...
  expect(s.rows.find((r) => r.axis === "yield-reality")!.tier).toBe("pass") // ...that would read SOLID on yield alone
  expect(s.rows.find((r) => r.axis === "liquidity-depth")!.tier).toBe("fail")
  expect(s.verdict).toBe("AVOID") // but the thin exit liquidity blocks SOLID
  expect(s.summary).toMatch(/thin|slippage|exit|liquid/i) // the failing axis is NAMED
})

test("a deep stablecoin-yield pool with everything passing → SOLID (liquidity is now a material pass)", () => {
  const s = Scorecard.score(sy({}))
  expect(s.rows.find((r) => r.axis === "liquidity-depth")!.tier).toBe("pass")
  expect(s.verdict).toBe("SOLID")
  expect(JSON.stringify(Scorecard.score(sy({})))).toBe(JSON.stringify(s)) // determinism (S10)
})

test("X-COVER — the liquidity axis is `not-applicable` (never a pass) for a lending market", () => {
  const lending: Scorecard.PoolFacts = { name: "aave-v3 USDC", vertical: "lending", apyBase: 3.1, apyReward: null, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "c", ageDays: 900, sizeUsd: 240_000_000 }
  const row = Scorecard.liquidityDepthRow(lending)
  expect(row.tier).toBe("not-applicable")
  expect(row.material).toBe(false) // never counts toward SOLID
  expect(row.plainReason).toMatch(/lending market|available liquidity|not a DEX/i)
  // a lending pool still scores exactly as before (liquidity n/a doesn't perturb the verdict)
  expect(Scorecard.score(lending).verdict).toBe("SOLID")
})

test("the liquidity row maps onto the byte-untouched WHY fact-row schema (Explain)", () => {
  const rows = Scorecard.rows(sy({ liqUsd: 20_000 }))
  const factRows = Scorecard.toFactRows(rows)
  const liq = factRows.find((r) => r.id === "liquidity-depth")!
  expect(Explain.FACT_ROW_SCHEMA.every((k) => k in liq)).toBe(true) // the schema is reused verbatim
  expect(liq.outcome).toBe("fail")
})

// ── the GeckoTerminal provider — keyless, injectable fetch, degrade-to-SAMPLE-never-throw, boundary-validated ──
const ok = (body: unknown): GeckoTerminal.FetchImpl => async () => ({ ok: true, status: 200, json: async () => body })
const poolFixture = { id: "eth_0xabc", attributes: { address: "0xabc", name: "USDC / USDT", reserve_in_usd: "8000000", volume_usd: { h24: "12000000" }, pool_created_at: "2022-01-01T00:00:00Z", market_cap_usd: null, fdv_usd: null } }

test("GeckoTerminal.topPools parses reserve_in_usd + degrades to SAMPLE on a dead endpoint (never throws)", async () => {
  GeckoTerminal.resetCache()
  const live = await GeckoTerminal.topPools("eth", 1000, ok({ data: [poolFixture] }))
  expect(live.reality).toBe("REAL")
  expect(live.value[0].reserveUsd).toBe(8_000_000)
  expect(live.value[0].volumeUsd24h).toBe(12_000_000)
  // a dead endpoint (429 / 500 / throw) → SAMPLE, the caller still runs (S1)
  GeckoTerminal.resetCache()
  const dead429: GeckoTerminal.FetchImpl = async () => ({ ok: false, status: 429, json: async () => ({}) })
  expect((await GeckoTerminal.topPools("eth", 2000, dead429)).reality).toBe("SAMPLE")
  GeckoTerminal.resetCache()
  const threw: GeckoTerminal.FetchImpl = async () => { throw new Error("no network") }
  const s = await GeckoTerminal.topPools("eth", 3000, threw)
  expect(s.reality).toBe("SAMPLE")
  expect(s.value.length).toBeGreaterThan(0) // the labeled SAMPLE pool — the tool boots with zero setup
})

test("GeckoTerminal boundary-validates a malformed/adversarial reserve (S8) → MISSING, never a nonsense number", () => {
  const bad = GeckoTerminal.parsePool("eth", { attributes: { address: "0xbad", name: "x", reserve_in_usd: -5, volume_usd: { h24: "not-a-number" } } })
  expect(bad!.reserveUsd).toBeNull() // negative reserve → missing (never coerced to 0/negative)
  expect(bad!.volumeUsd24h).toBeNull() // garbage → missing
  expect(GeckoTerminal.parsePool("eth", { attributes: {} })).toBeNull() // no address → unusable
})

test("the leak wall covers the new provider — src/dataplane/providers/geckoterminal.ts is scanned + clean (D-SEAM)", () => {
  const scan = Seams.scanDataplane()
  expect(scan.files.some((f) => f.endsWith("providers/geckoterminal.ts"))).toBe(true)
  expect(scan.leaks.filter((l) => l.file.endsWith("geckoterminal.ts"))).toEqual([]) // no OpenCode/sibling/ORM reach
})
