/**
 * ORGΛNON — THE MANIFEST SPRINT, Phase 3 wall (COMPILED-HONESTLY). The /check MANIFEST PATH — a strategy is a subject
 * reached by a PATH (no fourth screen). `/check/manifest:<id>` renders the Composed Reality Check (each position's full
 * check + the portfolio facts + the D38-absence label); an unknown id → an honest 404. THE S71 CONTROL, end-to-end
 * through the ROUTE: `/check/manifest:<one-position>` is BYTE-IDENTICAL to `/check/<that-pool-key>`. Offline (SAMPLE
 * subjects x-rayed; no network). Outputs SHOWN (CV3).
 */
import { test, expect } from "bun:test"
import { rmSync } from "node:fs"
import path from "node:path"
import { app } from "../../script/serve-reality"
import { Manifest } from "../../src/strategy/manifest"
import { StrategyStore } from "../../src/strategy/store"

// S82(b) (Reckoning sprint) — pin the V31 fixture by EXPLICIT id (no selector-loosening; the V32 "robust selector" was how a
// wall decays). The V31 3-trial lineage has NO committed baseline, so its /check render is a plain composed view — deterministic
// (no wall-clock thesis-age), unlike a monitored lineage (W-CAD03).
const FIXTURE_ID = "a82f8f501876059356adf33e7c62604fc3b9c189c3841f420123ece1d001c05d"

test("STRATEGY — the committed fixture manifest renders a Composed Reality Check at /check/manifest:<id>", async () => {
  expect(FIXTURE_ID).toBeDefined()
  const res = await app.request(`/check/manifest:${FIXTURE_ID}`)
  expect(res.status).toBe(200)
  const html = await res.text()
  // the composed surface: the strategy title, the thesis, the D38-absence label, both positions, the exit criterion
  expect(html).toMatch(/Composed Reality Check/i)
  expect(html).toMatch(/Your thesis:/i)
  expect(html).toMatch(/No composite strategy verdict is rendered/i) // D38 parked, labeled
  expect(html).toMatch(/The positions — each its own full Reality Check/i)
  expect(html).toMatch(/aave-v3 USDC/i) // position 1 rendered its full check
  expect(html).toMatch(/UNJUDGEABLE-YET/i) // the thesis-age gate (no recorded registeredAt → conservative)
  expect(html).toMatch(/Your exit criterion/i)
  // NO aggregate STRATEGY-level verdict pill (the composite is D38)
  expect(html).not.toMatch(/<h1>Composed Reality Check <span class="pill (SOLID|CAUTION|AVOID|UNVERIFIED)/)
  console.log("  fixture path rendered:", `/check/manifest:${FIXTURE_ID.slice(0, 12)}… → 200, Composed Reality Check`)
})

test("STRATEGY — an unknown manifest id → an honest 404 (nothing fabricated)", async () => {
  const res = await app.request("/check/manifest:deadbeefdeadbeef")
  expect(res.status).toBe(404)
  const html = await res.text()
  expect(html).toMatch(/No strategy manifest with that id/i)
})

test("STRATEGY — S71 through the ROUTE: /check/manifest:<one position> is BYTE-IDENTICAL to /check/<that pool key>", async () => {
  const key = "defillama:pool:SAMPLE-aave-usdc"
  const one = Manifest.parse({ schemaVersion: 1, positions: [{ subjectKey: key, size: 1, units: "USDC" }], thesis: "a strategy of one position is today's Reality Check", exitCriterion: { kind: "peg-floor", threshold: 0.995, subjectScope: "portfolio" } })
  expect(one.ok).toBe(true)
  if (!one.ok) return
  const id = StrategyStore.save(one.manifest) // the default (gitignored) MANIFEST_DIR
  try {
    const composed = await (await app.request(`/check/manifest:${id}`)).text()
    const standalone = await (await app.request(`/check/${key}`)).text()
    expect(composed).toBe(standalone) // byte-for-byte — a strategy of one IS the standalone check (perfect backward compat)
    console.log("  S71 route byte-identity:", `/check/manifest:${id.slice(0, 10)}… === /check/${key} (${composed.length} bytes)`)
  } finally {
    rmSync(path.join(StrategyStore.MANIFEST_DIR, `${id}.json`), { force: true })
  }
})
