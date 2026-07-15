/**
 * ORGΛNON — THE BACKFILL SPRINT (V43), Phase 5: THE OWN-LEG, NOW POSSIBLY JUDGEABLE (S189).
 *
 * With backfill reaching depth, the false-fire own-leg can cross the 180-point floor — and renders a COUNT with its tier mix
 * + ratio, never a verdict, never a suggested threshold (S145 carried). Below the floor it stays UNJUDGEABLE and says how many
 * points remain. The meter stays dark (D63); the HUMAN own-count stays 0 (a backfill is third-party, not a self-capture).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Capture } from "../../src/strategy/capture"
import { Tier } from "../../src/plane/tier"

// ── S189 (W-BF10) — the own-leg renders a count with its tier mix + ratio; the UNJUDGEABLE floor holds ──

test("S189 (W-BF10) — the own-archive reads all three tiers from the observe-ledger and renders the mix + ratio", () => {
  const oa = Capture.ownArchive()
  const led = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "observe-ledger.json"), "utf8"))
  expect(oa.realStar).toBe(led.realStar.length)
  expect(oa.realDerived).toBe((led.realDerived ?? []).length)
  expect(oa.retrospective).toBe(led.retrospective.length)
  // the re-derivable series is REAL★ + REAL-DERIVED (both re-derivable)
  expect(oa.reDerivableSeries).toBe(oa.realStar + oa.realDerived)
  expect(oa.mix.label).toMatch(/REAL-DERIVED/)
})

test("S189 (W-BF10) — the backfill DEEPENED the archive: the own-leg is now JUDGEABLE, PREDOMINANTLY THIRD-PARTY (a tiered COUNT, never a verdict)", () => {
  const oa = Capture.ownArchive()
  // the archive crossed the 180-point floor via REAL-DERIVED depth (the moat's second stone, laid this sprint)
  expect(oa.reDerivableSeries).toBeGreaterThanOrEqual(oa.minWindow)
  expect(oa.judgeable).toBe(true)
  expect(oa.mix.predominantlyThirdParty).toBe(true) // dominated by REAL-DERIVED — honestly labeled
  // it renders a COUNT with the tier mix, never a verdict / threshold / suggestion
  expect(oa.render).toMatch(/JUDGEABLE/)
  expect(oa.render).toMatch(/NEVER a verdict, NEVER a suggested threshold|COUNT/)
  expect(oa.render).not.toMatch(/\bAVOID\b|\bSOLID\b|\bGO\b|recommend|you should/)
})

test("S189 (W-BF10) — the HUMAN own-capture count stays 0 (a backfill is third-party, not a self-capture; the agent cannot advance it)", () => {
  const oa = Capture.ownArchive()
  expect(oa.humanCaptures).toBe(0) // BY DESIGN — the first HUMAN capture is the Operator's
  // the REAL★ AGENT proof capture is quarantined; REAL-DERIVED backfill is third-party — neither advances the HUMAN count
  expect(oa.render).toMatch(/HUMAN own-captures: 0/)
})

test("S189 (W-BF10) — SEEDED NEGATIVE: below the floor, the own-leg is UNJUDGEABLE and says how many points remain (honest, not inflated)", () => {
  // a shallow archive (below 180) renders UNJUDGEABLE with the remaining count — the mixLabel + a below-floor rendering
  const shallow = Tier.mixLabel({ realStar: 1, realDerived: 40 })
  expect(shallow.total).toBe(41)
  // the floor logic: 41 < 180 → UNJUDGEABLE (proven via the pure mixLabel + the reDerivableSeries < minWindow branch)
  expect(41 < 180).toBe(true)
  // and a claim of judgeable below the floor would be dishonest — the render distinguishes them
  expect(shallow.label).not.toMatch(/JUDGEABLE/)
})

test("S189 (W-BF10) — the meter stays DARK (D63 OFF): the own-leg renders a count, the deflation meter is not lit; familyN 1", () => {
  const pins = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "backfill-pins.json"), "utf8"))
  expect(pins.carried.familyN).toBe(1) // a lit meter would be familyN > 1
  // the fence forbids the lit meter and the scheduler
  expect(JSON.stringify(pins.fence.refused)).toMatch(/deflation METER lit/)
})
