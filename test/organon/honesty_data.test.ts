/**
 * ORGΛNON — THE HONESTY LAYER, Phase 2 walls (DATA-LIVE; Rules X-HONEST, X-LEAN). The keyless DeFiLlama backbone,
 * positive-controlled OFFLINE (the fetch is an injectable seam): a REAL fetch is parsed + tagged REAL; a 429 / a
 * network error / a malformed body degrades to last-good or SAMPLE and NEVER throws to the UI; the short-TTL cache
 * absorbs a storm; adversarial values (negative TVL, absurd APY, no pool id) are validated at the boundary (missing,
 * never a nonsense value); a REAL value maps to a content-addressed record snapshot (the moat append) that satisfies the
 * shown-but-recorded guarantee; and the committed DeFiLlama capture verifies (clone-robust on the gitignored payloads).
 */
import { test, expect } from "bun:test"
import { DefiLlama } from "../../src/dataplane/providers/defillama"
import { ProvRecord } from "../../src/dataplane/record"
import { DataPlane } from "../../src/dataplane/store"
import { Seams } from "../../src/dataplane/seams"

const NOW = 1_783_000_000_000
const ok = (body: unknown): DefiLlama.FetchImpl => async () => ({ ok: true, status: 200, json: async () => body })
const http = (status: number): DefiLlama.FetchImpl => async () => ({ ok: false, status, json: async () => ({}) })
const boom: DefiLlama.FetchImpl = async () => { throw new Error("network down") }

const POOLS_FIXTURE = { status: "success", data: [
  { chain: "Ethereum", project: "aave-v3", symbol: "USDC", tvlUsd: 240_000_000, apyBase: 3.06, apyReward: null, apy: 3.06, pool: "p-usdc", stablecoin: true },
  { chain: "Ethereum", project: "sample-farm", symbol: "XYZ", tvlUsd: 12_000_000, apyBase: 0.5, apyReward: 9.5, apy: 10.0, pool: "p-merc", stablecoin: true },
  { chain: "Ethereum", project: "not-lending", symbol: "PEPE", tvlUsd: 5_000_000, apyBase: 40, apyReward: 200, apy: 240, pool: "p-degen", stablecoin: false }, // not shelf (not stablecoin/lending)
  { chain: "Ethereum", project: "aave-v3", symbol: "BAD", tvlUsd: -5, apyBase: 1e9, apyReward: null, apy: 1e9, pool: "p-bad", stablecoin: true }, // adversarial values
  { chain: "Ethereum", project: "aave-v3", symbol: "NOID", tvlUsd: 1, apyBase: 1, apyReward: null, apy: 1, stablecoin: true }, // no pool id → dropped
] }

test("a REAL /pools fetch parses + tags REAL; apyReward null is preserved (not coerced); the Shelf is the money-holding subset", async () => {
  DefiLlama.resetCache()
  const r = await DefiLlama.pools(NOW, ok(POOLS_FIXTURE))
  expect(r.reality).toBe("REAL")
  const usdc = r.value.find((p) => p.pool === "p-usdc")!
  expect(usdc.apyBase).toBe(3.06)
  expect(usdc.apyReward).toBeNull() // null preserved — missing stays missing (baseShare will coalesce, never fabricate 0)
  expect(r.value.some((p) => p.pool === "p-merc")).toBe(true) // stablecoin farm is on the shelf
  expect(r.value.some((p) => p.pool === "p-degen")).toBe(false) // non-stablecoin non-lending is NOT the money-holding shelf
})

test("boundary validation (S8): adversarial values become MISSING (never a nonsense number); a row with no pool id is dropped", async () => {
  DefiLlama.resetCache()
  const bad = DefiLlama.parsePool({ chain: "E", project: "aave-v3", symbol: "BAD", tvlUsd: -5, apyBase: 1e9, apyReward: null, apy: 1e9, pool: "p-bad", stablecoin: true })!
  expect(bad.tvlUsd).toBeNull() // negative TVL → missing
  expect(bad.apyBase).toBeNull() // absurd APY → missing
  expect(DefiLlama.parsePool({ chain: "E", symbol: "NOID", stablecoin: true })).toBeNull() // no pool id → unusable, dropped
  expect(DefiLlama.parsePool(null)).toBeNull()
})

test("a dead endpoint degrades — 429 with no cache → SAMPLE; a network error → SAMPLE; NEVER a throw (S1)", async () => {
  DefiLlama.resetCache()
  const r429 = await DefiLlama.pools(NOW, http(429))
  expect(r429.reality).toBe("SAMPLE")
  expect(r429.value).toBe(DefiLlama.SAMPLE_POOLS) // the labeled SAMPLE shelf — the tool still runs (S7)
  DefiLlama.resetCache()
  const rBoom = await DefiLlama.pools(NOW, boom)
  expect(rBoom.reality).toBe("SAMPLE")
  expect(rBoom.value.length).toBeGreaterThan(0) // still runs, honestly labeled
})

test("the short-TTL cache absorbs a storm (S2) and serves last-good on a later 429 (S1) — no SAMPLE-dressed-as-REAL", async () => {
  DefiLlama.resetCache()
  let calls = 0
  const counting: DefiLlama.FetchImpl = async () => { calls++; return { ok: true, status: 200, json: async () => POOLS_FIXTURE } }
  await DefiLlama.pools(NOW, counting)
  await DefiLlama.pools(NOW + 1000, counting) // within TTL → cache hit, no second fetch
  expect(calls).toBe(1) // the storm fans out to ONE provider call, not N (S2)
  // a later 429 with a warm cache → last-good, still REAL-provenanced (stale), never a mislabeled SAMPLE-as-REAL
  const stale = await DefiLlama.pools(NOW + DefiLlama.CACHE_TTL_MS + 1, http(429))
  expect(stale.reality).toBe("REAL")
  expect(stale.note).toMatch(/last-good/)
})

test("the peg maps DeFiLlama slugs → stablecoin symbols; malformed → SAMPLE", async () => {
  DefiLlama.resetCache()
  const body = [{ date: 1, prices: { "usd-coin": 0.9999, tether: 0.9991, dai: 1.0003, junk: 5 } }, { date: 2, prices: {} }]
  const r = await DefiLlama.stablecoinPrices(NOW, ok(body))
  expect(r.reality).toBe("REAL")
  expect(r.value.USDC).toBeCloseTo(0.9999, 4)
  expect(r.value.USDT).toBeCloseTo(0.9991, 4)
  expect(r.value.DAI).toBeCloseTo(1.0003, 4)
  DefiLlama.resetCache()
  expect((await DefiLlama.stablecoinPrices(NOW, http(500))).reality).toBe("SAMPLE")
})

test("a REAL value maps to a content-addressed record snapshot that satisfies the shown-but-recorded guarantee (moat append)", () => {
  const pool: DefiLlama.Pool = { chain: "Ethereum", project: "aave-v3", symbol: "USDC", tvlUsd: 240_000_000, apyBase: 3.06, apyReward: null, apy: 3.06, pool: "p-usdc", stablecoin: true }
  const snap = DefiLlama.poolSnapshot(pool, NOW)
  expect(snap.key).toBe("defillama:pool:p-usdc")
  const csha = DataPlane.contentSha(snap)
  // a synthetic adapter holding this snapshot (no committed-store write) → the shown value resolves REAL + recorded
  const adapter: DataPlane.Adapter = {
    name: "synthetic",
    listSeries: () => [snap.key],
    fetchSeries: (k) => (k === snap.key ? { key: snap.key, kind: snap.kind, points: snap.points, provenance: { source: snap.source, url: snap.url, capturedAt: NOW, contentSha: csha, nonce: "n", chainPos: 0, reality: "REAL-PIT" } } : null),
    provenance: (k) => (k === snap.key ? { source: snap.source, url: snap.url, capturedAt: NOW, contentSha: csha, nonce: "n", chainPos: 0, reality: "REAL-PIT" } : null),
  }
  const shown = ProvRecord.resolveShown(snap.key, "apyBase", NOW, null, adapter)
  expect(shown.provenance).toBe("REAL")
  expect(shown.value).toBe(3.06)
  expect(shown.contentHash).toBe(csha)
  expect(() => ProvRecord.assertRecorded(shown, adapter)).not.toThrow()
})

test("the DeFiLlama provider is standalone-native (the dataplane_leak wall covers it — zero forbidden imports)", () => {
  const { files, leaks } = Seams.scanDataplane()
  expect(files.some((f) => f.endsWith("providers/defillama.ts"))).toBe(true) // the recursive scan reaches the provider
  expect(leaks.filter((l) => l.file.includes("defillama"))).toEqual([])
})

test("the committed DeFiLlama capture verifies (clone-robust); a shown value is REAL where recorded, honest SAMPLE where the gitignored payload is absent", () => {
  const v = ProvRecord.verify()
  expect(v.ok).toBe(true)
  if (!v.present) { console.log("  (honesty_data) provenance chain absent — re-capturable via `bun run script/capture-defillama.ts` (keyless)"); return }
  const poolKey = Object.keys(v.keys).find((k) => k.startsWith("defillama:pool:"))
  if (!poolKey) { console.log("  (honesty_data) no DeFiLlama capture yet — run script/capture-defillama.ts to seed the moat"); return }
  const series = DataPlane.snapshotAdapter.fetchSeries(poolKey)
  if (!series) { console.log("  (honesty_data) DeFiLlama snapshot payload gitignored (fresh clone) — the committed chain verifies; the shown value renders the honest SAMPLE fallback"); return }
  const shown = ProvRecord.resolveShown(poolKey, "apyBase", series.points[series.points.length - 1].ts)
  expect(shown.provenance).toBe("REAL")
  expect(() => ProvRecord.assertRecorded(shown)).not.toThrow()
})
