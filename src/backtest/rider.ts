/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 2: THE RIDER, ENFORCED (S157, D76). NO NEW LAW (a fifth sprint).
 *
 * V39 MEASURED the i.i.d. overstatement (τ_int 27–165 on ORGΛNON's own funding panel → confidence overstated ≈5–13×) and
 * rendered it as a SENTENCE. A sentence is a sticky note on a loaded gun (K-5). The correction has been in the frozen set,
 * UNUSED, since V8: effective_n.py::nw_tstat — the Newey–West (HAC) t-stat that deflates the iid t-stat for autocorrelation.
 * This module COMPOSES it. The frozen rigor.psr computes n = len(returns) internally and hard-codes √(n−1), so the serial
 * correction cannot enter the frozen core (HARNESS-COMPOSITION-GAP, V39's determination) — it is composed BESIDE the frozen
 * number, in the harness, which is NOT in the frozen set. checkFrozenSet() 0 drift: not one .py byte moves.
 *
 * WHAT IT DOES: renders BOTH the naive statistic AND the corrected one, with τ_int beside them (RP-3 — the user sees the
 * haircut, not merely its result). And it ENFORCES (S157): with deflation active AND τ_int above the PRE-REGISTERED threshold
 * (√τ_int ≥ 1.5, derived from the Stamp's DSR 0.95 cut-point BEFORE any measurement — X-DERIVE(f)), a Stamp render must be
 * CORRECTED or UNJUDGEABLE, never naive. D63 is OFF (familyN === 1), so the enforcement is ARMED, not firing on the live
 * path — but the wall proves it BITES. And it computes the COMPOUNDED GENEROSITY (A′ #9): D27's knowing generosity AND the
 * ≈√τ_int overstatement, in one line, for the first time.
 *
 * The Newey–West estimator here is a FAITHFUL TS PORT of effective_n.py::nw_tstat (the effectiven.ts precedent — acf/tauInt
 * already ported clone-stably), so the correction runs in the battery from a fresh clone with no numpy; a wall asserts the
 * port reproduces the frozen formula on a canonical series.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { EffectiveN } from "./effectiven"

export namespace Rider {
  // the PRE-REGISTERED threshold — read from ship-pins.json (the single source; X-DERIVE(f)). A wall asserts code === pin.
  export function threshold(): { inflationTrigger: number; tauIntTrigger: number; zStar: number } {
    const p = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "ship-pins.json"), "utf8")).phase2_rider.threshold
    return { inflationTrigger: p.inflationTrigger, tauIntTrigger: p.tauIntTrigger, zStar: p.zStar }
  }

  // ── the frozen Newey–West (HAC) t-stat, ported from effective_n.py::nw_tstat (read, never edited). lags=0 → the iid t-stat.
  // var_mean = [g0 + 2 Σ_{l=1..L} (1 − l/(L+1)) γ_l] / n  (Bartlett weights); t = μ / √var_mean.
  export function nwTstat(x: number[], lags: number): number {
    const r = x.filter((v) => Number.isFinite(v))
    const n = r.length
    if (n < 2) return 0.0
    const mu = r.reduce((a, b) => a + b, 0) / n
    const d = r.map((v) => v - mu)
    const g0 = d.reduce((a, b) => a + b * b, 0) / n
    let s = g0
    const L = Math.min(Math.trunc(lags), n - 1)
    for (let l = 1; l <= L; l++) {
      let dot = 0
      for (let i = l; i < n; i++) dot += d[i] * d[i - l] // np.dot(d[l:], d[:-l])
      s += 2.0 * (1.0 - l / (L + 1.0)) * (dot / n)
    }
    const varMean = s / n
    return varMean <= 0 ? 0.0 : mu / Math.sqrt(varMean)
  }

  export interface Correction {
    tauInt: number
    hacLags: number
    naive: number // the iid t-stat (nw_tstat lags=0) — what the frozen PSR/DSR implicitly assume
    corrected: number // the Newey–West HAC t-stat — deflated for the serial autocorrelation
    inflation: number // naive / corrected ≈ √τ_int — the confidence-overstatement factor (RP-3, shown BESIDE the naive)
    inflationTrigger: number
    tauIntTrigger: number
    triggered: boolean // √τ_int ≥ inflationTrigger (the pre-registered trigger)
    detail: string
  }

  // Rider.correct(returns) — τ_int + naive + corrected + threshold + triggered, ALL from frozen-derived math. Renders BOTH.
  export function correct(returns: number[]): Correction {
    const tau = EffectiveN.tauInt(returns)
    // the HAC bandwidth is the measured autocorrelation time (the correlation persists ~τ_int lags), bounded by the sample.
    const L = Math.min(Math.max(1, Math.round(tau)), Math.max(1, returns.length - 1))
    const naive = nwTstat(returns, 0)
    const corrected = nwTstat(returns, L)
    const inflation = corrected === 0 ? Infinity : Math.abs(naive / corrected)
    const th = threshold()
    const sqrtTau = Math.sqrt(tau)
    return {
      tauInt: tau,
      hacLags: L,
      naive,
      corrected,
      inflation,
      inflationTrigger: th.inflationTrigger,
      tauIntTrigger: th.tauIntTrigger,
      triggered: sqrtTau >= th.inflationTrigger,
      detail: `τ_int ${tau.toFixed(1)} · naive t ${naive.toFixed(3)} · corrected (Newey–West, L=${L}) t ${corrected.toFixed(3)} · inflation ≈ √τ_int ${sqrtTau.toFixed(2)}× ${sqrtTau >= th.inflationTrigger ? `≥ ${th.inflationTrigger} → the correction TRIGGERS` : `< ${th.inflationTrigger} → below trigger`}`,
    }
  }

  // ── THE ENFORCEMENT (S157) — with deflation active AND the correction triggered, a Stamp render must be CORRECTED or
  // UNJUDGEABLE, never naive. A naive render under those conditions is a Halt. (D63 OFF ⇒ deflation not active on the live
  // path, so this is ARMED, not firing; the wall proves it bites when the meter is ever lit.)
  export type RenderMode = "naive" | "corrected" | "unjudgeable"
  export function enforce(mode: RenderMode, ctx: { deflationActive: boolean; tauInt: number }): { ok: boolean; required: RenderMode | "any"; why: string } {
    const th = threshold()
    const triggered = Math.sqrt(ctx.tauInt) >= th.inflationTrigger
    if (ctx.deflationActive && triggered && mode === "naive")
      return { ok: false, required: "corrected", why: `a NAIVE statistic rendered with deflation active and √τ_int ${Math.sqrt(ctx.tauInt).toFixed(2)} ≥ ${th.inflationTrigger} — the Stamp must render CORRECTED or UNJUDGEABLE, never naive (S157)` }
    return { ok: true, required: "any", why: ctx.deflationActive ? (triggered ? `deflation active + triggered → ${mode} is permitted (not naive)` : `deflation active but √τ_int below the trigger → any render permitted`) : `deflation OFF (D63) → the enforcement is armed, not firing` }
  }

  // ── ORGΛNON's OWN series — reported by PROVENANCE, the MEASURED answer whatever it is (F-3 / attack #3: "what survives
  // the correction? if nothing does, say so — that is the finding"). Three distinct provenances, and the honest nuance is
  // that the correction triggers exactly where YIELDS PERSIST and not on near-white increments:
  //   · DEMONSTRATION — the clone-stable AR(1)(ρ=0.95) series (the exact one V39's determination uses), live-reproducible
  //   · CAPTURED (committed) — the false-fire TVL + peg RETURNS: near-white (τ_int ≈ 1), so the correction does NOT trigger
  //   · CAPTURED-RECORDED (raw gitignored) — the V26 funding-RATE panel: τ_int 27–165 → √τ 5–13×, the real autocorrelated case
  export interface SeriesReading { name: string; provenance: "DEMONSTRATION" | "CAPTURED" | "CAPTURED-RECORDED"; n: number | string; tauInt: number | string; sqrtTauInt: number | string; exceeds: boolean; note: string }
  function returnsOf(levels: number[]): number[] {
    const out: number[] = []
    for (let i = 1; i < levels.length; i++) { const p = levels[i - 1]; if (p !== 0 && Number.isFinite(p) && Number.isFinite(levels[i])) out.push(levels[i] / p - 1) }
    return out
  }

  export interface OwnReport {
    demonstration: SeriesReading // the AR(1) demo — live, triggers (the mechanism, X-SHOWN)
    captured: SeriesReading[] // the committed TVL/peg return series — real, near-white
    fundingPanel: SeriesReading // the recorded V26 funding-rate panel — real, autocorrelated (raw gitignored)
    capturedExceeding: number // of the COMMITTED captured return series, how many exceed the trigger
    capturedTotal: number
    representativeFactor: number // the live-computable overstatement on an autocorrelated series (the demo √τ_int)
    note: string
  }
  export function ownSeriesReport(): OwnReport {
    const th = threshold()
    const trig = th.inflationTrigger

    // the DEMONSTRATION — the clone-stable AR(1) series (τ_int ≈ 35.8, √τ ≈ 6), live and reproducible from a fresh clone.
    const demo = EffectiveN.demoAr1()
    const demoTau = EffectiveN.tauInt(demo)
    const demoReading: SeriesReading = { name: "clone-stable AR(1)(ρ=0.95) demonstration", provenance: "DEMONSTRATION", n: demo.length, tauInt: demoTau, sqrtTauInt: Math.sqrt(demoTau), exceeds: Math.sqrt(demoTau) >= trig, note: "an autocorrelated return series — the mechanism, live-reproducible (the exact demo V39's determination cites)" }

    // the COMMITTED captured series — the false-fire TVL + peg RETURNS. Their increments are near-white (τ_int ≈ 1).
    const ff = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "false-fire-series.json"), "utf8"))
    const capSpecs: { name: string; levels: number[] }[] = [
      { name: "USDC/fluid-lending TVL returns (194-pt)", levels: (ff.series["tvl-drawdown"] ?? []).map((p: { tvlUsd: number }) => p.tvlUsd) },
      { name: "USDC/USD peg returns (154-pt)", levels: (ff.series["peg-floor"] ?? []).map((p: { peg: number }) => p.peg) },
    ]
    const captured: SeriesReading[] = capSpecs.map((sp) => {
      const rets = returnsOf(sp.levels)
      const c = correct(rets)
      const st = Math.sqrt(c.tauInt)
      return { name: sp.name, provenance: "CAPTURED", n: rets.length, tauInt: c.tauInt, sqrtTauInt: st, exceeds: st >= trig, note: st >= trig ? "autocorrelated — the correction triggers" : "near-white increments (τ_int ≈ 1) — the correction does NOT trigger; the DIRECTION holds (τ_int ≥ 1), the MAGNITUDE is ≈1" }
    })

    // the RECORDED funding panel — real, autocorrelated, raw gitignored (E-PREVENT). τ_int 27–165 → √τ 5–13× (median √124 ≈ 11×).
    const fundingPanel: SeriesReading = { name: "V26 funding-rate panel (500-pt, raw gitignored)", provenance: "CAPTURED-RECORDED", n: 500, tauInt: "27–165 (median 124)", sqrtTauInt: "5–13× (median ≈ 11×)", exceeds: true, note: "recorded V26 via this same frozen effective_n.py; the real autocorrelated yield case — WOULD trigger; the raw is gitignored (E-PREVENT ≥400 numbers)" }

    const capturedExceeding = captured.filter((c) => c.exceeds).length
    return {
      demonstration: demoReading,
      captured,
      fundingPanel,
      capturedExceeding,
      capturedTotal: captured.length,
      representativeFactor: Math.sqrt(demoTau),
      note: `the correction triggers exactly where YIELDS PERSIST: the AR(1) demonstration (√τ ≈ ${Math.sqrt(demoTau).toFixed(1)}) and the recorded funding panel (√τ 5–13×) TRIGGER; the committed TVL/peg RETURNS are near-white (${capturedExceeding} of ${captured.length} trigger). The DIRECTION always holds (τ_int ≥ 1); the MAGNITUDE is the finding, and it is largest exactly where a yield strategy's returns persist. The measured answer, whatever it is (F-3).`,
    }
  }

  // ── THE COMPOUNDED GENEROSITY (A′ #9) — D27's knowing generosity AND the ≈√τ_int overstatement, rendered together. ──
  export interface Compounded { d27: string; overstatementFactor: number; overstatementRange: string; compounded: string }
  export function compoundedGenerosity(): Compounded {
    const rep = ownSeriesReport()
    // the overstatement FACTOR = the live-computable √τ_int on the autocorrelated demonstration (the funding panel's 5–13×
    // is cited as the real-captured evidence; the demo is the reproducible number).
    const factor = rep.representativeFactor
    return {
      d27: "the Stamp is knowingly generous until D27 is signed (unsigned, the fifteenth sprint) — a FIRST, deliberate generosity.",
      overstatementFactor: factor,
      overstatementRange: "on ORGΛNON's real captured funding panel (V26), √τ_int ran ≈ 5–13× (τ_int 27–165, median ≈ 11×); the clone-stable demonstration reproduces the mechanism at ≈ √τ_int; the committed TVL/peg increments are near-white (≈ 1×).",
      compounded: `TWO known generosities, never before rendered together (A′ #9): (1) the Stamp is knowingly generous (D27, unsigned, 15 sprints), AND (2) its confidence is overstated by a factor of ≈ √τ_int on autocorrelated yield input — ≈ ${factor.toFixed(1)}× on the clone-stable demonstration and ≈ 5–13× (median ≈ 11×) on the real V26 funding panel. They STACK where yields persist: a generous verdict, made more generous. The Operator has never seen these two facts in one line, and he should.`,
    }
  }
}
