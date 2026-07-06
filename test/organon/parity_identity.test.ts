/**
 * ORGΛNON — Explanation Phase 2 walls (PARITY-TRUE, K-SCOPE parity cure · D-LABEL · K-LEGIBLE). Builder-funding wired to
 * its REAL captured T1 snapshot (the parity narrowing cured); every builder route's data reality labeled truthfully; no
 * tier quietly upgraded; the identity provenance truth rendered NEUTRAL where users read (a reassuring version caught).
 */
import { test, expect } from "bun:test"
import { Console } from "../../src/studio/console"
import { Pool } from "../../src/analytics/pool"
import { DataPlane } from "../../src/dataplane/store"

const T = 1_735_689_600_000
// the captured T1 funding snapshot is GITIGNORED (re-capturable keyless via script/capture-dataplane.ts) — on a fresh
// clone it is ABSENT, and the honest parity behavior is ILLUSTRATIVE (real where it exists, illustrative where it does
// not). W9-01 (pristine-proof finding): the parity assertion must be CONDITIONAL on the snapshot's presence, never assume
// the environment has the gitignored data — the same discipline the lending path already renders (BLOCKED-on-absent).
const fundingSnapshotPresent = (() => { try { const s = DataPlane.snapshotAdapter.fetchSeries("funding:binance:BTCUSDT"); return !!s && s.provenance?.reality === "REAL-PIT" && ((s.points[0] as { intervalHours?: number }).intervalHours ?? 8) === 8 } catch { return false } })()

test("funding-parity: binance 8h funding reaches a REAL-PIT verdict with provenance WHERE the snapshot exists; the honest ILLUSTRATIVE fallback where it does not (the cure, clone-robust)", async () => {
  const r = await Console.runComposedFunding({ family: "funding-carry", venue: "binance", intervalHours: 8, side: "receive" }, T)
  expect(r.state).toBe("verdict")
  if (fundingSnapshotPresent) {
    expect(r.artifact?.reality).toBe("REAL-PIT")
    expect(r.provenance?.length).toBeGreaterThanOrEqual(1)
    expect(r.provenance![0].nonce.length).toBeGreaterThan(0) // a nonce-anchored provenance a skeptic can trace
    expect(Console.renderResult(r)).toContain("data: REAL-PIT")
  } else {
    console.log("  (parity) the funding T1 snapshot is absent (gitignored fresh clone) — asserting the honest ILLUSTRATIVE fallback (re-capture via script/capture-dataplane.ts)")
    expect(r.artifact?.reality).toBe("ILLUSTRATIVE") // real-where-it-exists: absent snapshot → ILLUSTRATIVE, never a mislabeled REAL-PIT
    expect(Console.renderResult(r)).not.toContain("data: REAL-PIT")
  }
})

test("funding-parity failure state: a venue/interval with NO captured snapshot renders ILLUSTRATIVE, never a mislabeled REAL-PIT", async () => {
  const bybit = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, T)
  expect(bybit.artifact?.reality).toBe("ILLUSTRATIVE") // no captured T1 for bybit
  expect(bybit.provenance?.length ?? 0).toBe(0)
  const oneHour = await Console.runComposedFunding({ family: "funding-carry", venue: "binance", intervalHours: 1, side: "receive" }, T)
  expect(oneHour.artifact?.reality).toBe("ILLUSTRATIVE") // the real binance funding is 8h; 1h has no real data
  expect(Console.renderResult(oneHour)).toContain("ILLUSTRATIVE")
})

test("D-LABEL: a REAL-PIT label without provenance is impossible (a bare REAL-PIT is refused)", async () => {
  // the illustrative path carries provenance:[] and reality ILLUSTRATIVE — the label is derived, never asserted
  const illus = await Console.runComposedFunding({ family: "funding-carry", venue: "okx", intervalHours: 8, side: "pay" }, T)
  expect(illus.artifact?.reality).not.toBe("REAL-PIT")
  expect(Console.renderResult(illus)).not.toContain("data: REAL-PIT")
})

test("basis stays ILLUSTRATIVE at MIN(legs)=T2, EXPERIMENTAL — the tier is not quietly upgraded through the real-data wiring", async () => {
  const b = await Console.runComposedBasis({ family: "basis-carry", cexVenue: "binance", dexVenue: "hyperliquid", cexTier: "T1", dexTier: "T2", minTier: "T2" }, T)
  expect(b.artifact?.reality).toBe("ILLUSTRATIVE") // real per-leg exists but the capture windows don't overlap — no real spread
  expect(b.reportText).toContain("basis tier=MIN(legs)=T2") // the basis series tier is T2 (the per-leg 'binance T1' is correctly shown)
  expect(b.reportText).toContain("EXPERIMENTAL")
  expect(b.reportText).not.toMatch(/basis tier[^\n]*T1/) // the BASIS SERIES is never labeled T1 (no quiet upgrade)
})

test("the identity provenance note is NEUTRAL (states the exposure, names both keys) and a reassuring version is CAUGHT", () => {
  const note = Pool.identityProvenanceNote()
  expect(Pool.identityNoteNeutral(note).ok).toBe(true)
  expect(note).toMatch(/self-declared/i)
  expect(note).toMatch(/per declared author/i) // the ratchet key
  expect(note).toMatch(/per connection/i) // the limiter key
  // POSITIVE CONTROL: a reassuring/false-comfort version is caught
  expect(Pool.identityNoteNeutral("Your work is safe and protected — it can't be faked; trust us").ok).toBe(false)
})

test("the identity note renders on the K-LEGIBLE surfaces (a real funding verdict + a pool report)", async () => {
  const fund = await Console.runComposedFunding({ family: "funding-carry", venue: "binance", intervalHours: 8, side: "receive" }, T)
  expect(Console.renderResult(fund)).toContain("Identity provenance:")
  const pool = await Console.runComposedPool(Console.illustrativePoolMembers(5, "diversified", 400, 5), T)
  expect(pool.render).toContain("Identity provenance:")
})
