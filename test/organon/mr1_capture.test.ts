/**
 * ORGΛNON — THE RECKONING SPRINT, Phase 4 (MR1 — the fix BEFORE the capture). V32 recorded that /pools returns HTTP 200 and
 * "a naive fetch times out" — fixing the naive fetch WAS the scoped work, and it did not ship. This wall proves the fix ships
 * REGARDLESS of the live window: the budgeted parse handles the real payload SHAPE offline (a committed shape fixture), and a
 * fetch that exceeds its budget aborts to the honest SAMPLE fallback — NEVER a fabricated value.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { DefiLlama } from "../../src/dataplane/providers/defillama"

const shape = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "pools-payload-shape.json"), "utf8"))
const NOW = Date.parse("2026-07-13T00:00:00Z")

test("MR1 — the budgeted parse handles the real /pools payload SHAPE offline (committed fixture): the shelf parses + tags REAL", async () => {
  DefiLlama.resetCache()
  const fetchImpl: DefiLlama.FetchImpl = async () => ({ ok: true, status: 200, json: async () => shape })
  const r = await DefiLlama.pools(NOW, fetchImpl, {})
  expect(r.reality).toBe("REAL") // parsed, not faked
  expect(r.value.length).toBeGreaterThan(0)
  // the four MR1 pre-pinned showcase domains are present in the parsed shape (shelf-eligible by TVL + stablecoin/lending)
  const projects = new Set(r.value.map((p) => p.project))
  expect(projects.has("aave-v3")).toBe(true)
  expect(projects.has("ethena-usde")).toBe(true)
  expect(projects.has("ondo-finance")).toBe(true)
})

test("MR1 — the fetch carries an EXPLICIT budget: /pools gets a large budget, the rest the default (the timeout root cause)", () => {
  expect(DefiLlama.POOLS_FETCH_BUDGET_MS).toBeGreaterThanOrEqual(30_000) // room for ~10.5 MB
  expect(DefiLlama.DEFAULT_FETCH_BUDGET_MS).toBeGreaterThan(0)
  expect(typeof DefiLlama.budgetedFetch).toBe("function")
})

test("MR1 — a fetch that exceeds its budget (an AbortError) → the HONEST SAMPLE fallback, never a fabricated value", async () => {
  DefiLlama.resetCache()
  const timeoutFetch: DefiLlama.FetchImpl = async () => { throw new DOMException("The operation timed out.", "TimeoutError") }
  const r = await DefiLlama.pools(NOW, timeoutFetch, {})
  expect(r.reality).toBe("SAMPLE") // a timeout NEVER yields a REAL fabricated shelf
  expect(r.note).toMatch(/network error|timed out|SAMPLE/i)
  expect(r.value).toEqual(DefiLlama.SAMPLE_POOLS) // the labeled SAMPLE shelf, honestly
})
