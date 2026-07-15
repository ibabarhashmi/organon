/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 2 wall (S157): THE RIDER, ENFORCED. NO NEW LAW.
 *
 * W-SH07 — K-5: V39 measured a 5–13× confidence overstatement (τ_int 27–165) and rendered it as a SENTENCE — a sticky note
 * on a loaded gun, while D33 stayed SIGNABLE. The correction (Newey–West) had been in the frozen set, unused, since V8.
 * Here the harness COMPOSES it (checkFrozenSet 0 drift — not one .py byte moves), renders BOTH the naive and the corrected
 * statistic with τ_int beside them (RP-3), ENFORCES that a naive Stamp on autocorrelated input with deflation active is
 * REFUSED (S157), and computes the COMPOUNDED GENEROSITY (A′ #9). The τ_int threshold is PRE-REGISTERED from the Stamp's own
 * cut-points, BEFORE any measurement (RP-3/F-3).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Rider } from "../../src/backtest/rider"
import { EffectiveN } from "../../src/backtest/effectiven"
import { checkFrozenSet } from "../../src/organon/frozen"
import { Claim } from "../../src/organon/claim"

const shipPins = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "ship-pins.json"), "utf8"))

test("S157 (W-SH07) — the Newey–West port REPRODUCES the frozen formula: nwTstat(x,0) === the iid t-stat μ/√(g0/n)", () => {
  const x = [0.1, -0.2, 0.3, 0.05, -0.1, 0.2, 0.0, 0.15, -0.05, 0.12]
  const n = x.length
  const mu = x.reduce((a, b) => a + b, 0) / n
  const g0 = x.map((v) => (v - mu) ** 2).reduce((a, b) => a + b, 0) / n
  expect(Rider.nwTstat(x, 0)).toBeCloseTo(mu / Math.sqrt(g0 / n), 10) // lags=0 → the exact iid t-stat
  // and the frozen core is UNTOUCHED — the correction lives in the harness (HARNESS-COMPOSITION-GAP)
  expect(checkFrozenSet().filter((c) => c.status === "drift").length).toBe(0)
})

test("S157 (W-SH07) — the threshold is PRE-REGISTERED from the Stamp's DSR 0.95 cut-point; code === pin (X-DERIVE(f))", () => {
  const th = Rider.threshold()
  expect(th.inflationTrigger).toBe(shipPins.phase2_rider.threshold.inflationTrigger) // code reads the pin — single source
  expect(th.inflationTrigger).toBe(1.5)
  expect(th.tauIntTrigger).toBe(2.25)
  expect(th.zStar).toBeCloseTo(1.6448536, 5) // Φ⁻¹(0.95), the GO bar's z
  expect(shipPins.phase2_rider.threshold.rule).toMatch(/BEFORE measurement|before measurement/i)
})

test("S157 (W-SH07) — Rider.correct renders BOTH the naive AND the corrected statistic, with τ_int beside (RP-3)", () => {
  const demo = EffectiveN.demoAr1()
  const c = Rider.correct(demo)
  expect(c.tauInt).toBeGreaterThan(2.25) // the AR(1) demo is autocorrelated
  expect(typeof c.naive).toBe("number")
  expect(typeof c.corrected).toBe("number")
  expect(Math.abs(c.corrected)).toBeLessThanOrEqual(Math.abs(c.naive) + 1e-9) // the correction DEFLATES (never inflates)
  expect(c.triggered).toBe(true)
  expect(c.detail).toMatch(/τ_int/)
  expect(c.detail).toMatch(/naive/)
  expect(c.detail).toMatch(/corrected/)
})

test("S157 (W-SH07) — THE ENFORCEMENT: a naive Stamp on autocorrelated input with deflation active is REFUSED (seeded negative)", () => {
  // the seeded negative — the exact forbidden render: naive, deflation active, τ_int above the trigger → FAILS
  const bad = Rider.enforce("naive", { deflationActive: true, tauInt: 100 })
  expect(bad.ok).toBe(false)
  expect(bad.required).toBe("corrected")
  expect(bad.why).toMatch(/must render CORRECTED or UNJUDGEABLE|never naive/)
  // the permitted renders under the same conditions
  expect(Rider.enforce("corrected", { deflationActive: true, tauInt: 100 }).ok).toBe(true)
  expect(Rider.enforce("unjudgeable", { deflationActive: true, tauInt: 100 }).ok).toBe(true)
  // D63 OFF (deflation not active) → armed, not firing (a naive render is permitted, the meter is dark)
  expect(Rider.enforce("naive", { deflationActive: false, tauInt: 100 }).ok).toBe(true)
  // below the trigger → any render permitted even with deflation active (the threshold BITES both ways)
  expect(Rider.enforce("naive", { deflationActive: true, tauInt: 1.1 }).ok).toBe(true)
})

test("S157 (W-SH07) — D33 gains riderEnforced: true — the rider stops being a sticky note (D76)", () => {
  const d33 = Claim.producer("d33").value as { riderEnforced: boolean; state: string }
  expect(d33.riderEnforced).toBe(true)
})

test("S157 (W-SH07) — the OWN-SERIES report is the MEASURED answer (F-3): triggers where yields persist, not on white noise", () => {
  const rep = Rider.ownSeriesReport()
  expect(rep.demonstration.exceeds).toBe(true) // the AR(1) demo triggers (√τ ≈ 6)
  expect(rep.fundingPanel.exceeds).toBe(true) // the real funding panel would trigger (5–13×)
  expect(rep.capturedExceeding).toBe(0) // the committed TVL/peg RETURNS are near-white — the correction does NOT trigger
  expect(rep.capturedTotal).toBe(2)
  expect(rep.note).toMatch(/YIELDS PERSIST/)
  expect(rep.note).toMatch(/measured answer, whatever it is/)
})

test("S157 (W-SH07) — the COMPOUNDED GENEROSITY (A′ #9): D27 AND the ≈√τ_int overstatement, in one computed line", () => {
  const cg = Rider.compoundedGenerosity()
  expect(cg.d27).toMatch(/knowingly generous/)
  expect(cg.d27).toMatch(/fifteenth sprint|unsigned/)
  expect(cg.overstatementFactor).toBeGreaterThan(1.5) // a real overstatement on the autocorrelated demonstration
  expect(cg.compounded).toMatch(/5–13×|median/) // the real funding-panel evidence cited
  expect(cg.compounded).toMatch(/STACK/)
})

test("S157 (W-SH07) — no USD anywhere: the rider speaks in τ_int, t-stats, and factors — never a price", () => {
  const rep = JSON.stringify(Rider.ownSeriesReport()) + JSON.stringify(Rider.compoundedGenerosity())
  expect(rep).not.toMatch(/\$[0-9]/) // no dollar amounts — a factor and a t-stat are dimensionless
})
