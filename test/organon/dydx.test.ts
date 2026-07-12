/**
 * ORGΛNON — THE dYdX v4 INDEXER (Domain sprint; STABLE-SYNTH's second funding venue). Reconstruct is BYTE-FAITHFUL (the
 * indexer's rows, verbatim — no smoothing); an unreachable/malformed response degrades to an honest null (never a
 * fabricated series); the tier is REAL-at-timestamp (an indexer read, never REAL★). Injectable — no network in the battery.
 */
import { test, expect } from "bun:test"
import { Dydx } from "../../src/dataplane/providers/dydx"

const mkFetch = (payload: unknown, ok = true): Dydx.FetchImpl => async () => ({ ok, json: async () => payload })

test("dYdX — reconstruct parses {rate, price, effectiveAt} → sorted {ts, rate, price}, dropping non-finite (byte-faithful)", () => {
  const raw = { historicalFunding: [
    { ticker: "BTC-USD", rate: "0.0000125", price: "60000.0", effectiveAt: "2026-01-02T00:00:00.000Z" },
    { ticker: "BTC-USD", rate: "-0.0000075", price: "59000.0", effectiveAt: "2026-01-01T00:00:00.000Z" }, // earlier → sorts first
    { ticker: "BTC-USD", rate: "not-a-number", price: "1", effectiveAt: "2026-01-03T00:00:00.000Z" }, // dropped
  ] }
  const pts = Dydx.reconstruct(raw)
  expect(pts.length).toBe(2) // the non-finite row dropped
  expect(pts[0].rate).toBe(-0.0000075) // sorted by ts ascending
  expect(pts[1].rate).toBe(0.0000125)
  expect(pts[0].price).toBe(59000)
})

test("dYdX — a malformed / empty payload → [] (never a fabricated series); the tier is REAL-at-timestamp, never REAL★", () => {
  expect(Dydx.reconstruct({})).toEqual([])
  expect(Dydx.reconstruct({ historicalFunding: "nope" })).toEqual([])
  expect(Dydx.reconstruct(null)).toEqual([])
  expect(Dydx.TIER).toBe("REAL-at-timestamp") // an indexer/aggregator read — never a block-pinned REAL★
})

test("dYdX — historicalFunding degrades HONESTLY: a served payload → points; a non-ok / throwing fetch → null", async () => {
  const served = await Dydx.historicalFunding("BTC-USD", mkFetch({ historicalFunding: [{ rate: "0.00001", price: "60000", effectiveAt: "2026-01-01T00:00:00.000Z" }] }))
  expect(served?.length).toBe(1)
  expect(await Dydx.historicalFunding("BTC-USD", mkFetch({}, false))).toBe(null) // non-ok → honest null
  expect(await Dydx.historicalFunding("BTC-USD", async () => { throw new Error("network down") })).toBe(null) // throw → honest null
  expect(await Dydx.historicalFunding("BTC-USD", mkFetch({ historicalFunding: [] }))).toBe(null) // empty → null (never a fabricated series)
})

test("dYdX — annualize matches the hourly-funding convention (rate × 24 × 365)", () => {
  expect(Dydx.annualize(0.00001)).toBeCloseTo(0.00001 * 24 * 365, 12)
})
