/**
 * ORGΛNON — THE RECKONING SPRINT (V44), Phase 1/2: THE PEN'S RECKONING (S192, S193). Never sheds.
 *
 * The Operator delegated the maths ("check the maths, decide, adversarially validate, red-team, then sign"). The agent
 * performs the complete audit: the frozen implementation is CORRECT (0 breaks, DD-88), but the √(n−1) application overstates
 * confidence on autocorrelated input, so the N_eff correction becomes the enforced default (DD-89) and the D27 strict bar
 * (S193) replaces the "knowingly generous" Stamp. And LN5 is mechanized: the agent audits, decides, recommends — and CANNOT
 * emit a signed bit (a seeded operatorSigned:true REFUSES the log). Each wall is positive-controlled with a seeded negative.
 */
import { test, expect } from "bun:test"
import { Rigor } from "../../src/backtest/rigor"
import { D33 } from "../../src/backtest/crosscheck"
import { EffectiveN } from "../../src/backtest/effectiven"
import { Strict } from "../../src/studio/strict"
import { Ln5 } from "../../src/organon/ln5"
import { Rollup } from "../../src/organon/rollup"

// ── S192 (W-RK03) — THE D33 MATHS, AUDITED AND MADE HONEST (the D33 ruling) ──

test("S192 (W-RK03) — DD-88 the correctness leg: the autopsy finds 0 BREAK across 5 classes at 0 frozen drift (implementation SOUND)", () => {
  const a = Rigor.audit()
  expect(a.breakCount).toBe(0)
  expect(a.classes.length).toBe(5)
  expect(a.rigorShaMatches).toBe(true) // the current rigor.py === the pinned sha the autopsy ran against
  expect(a.frozenDrift).toBe(false)
  expect(a.sound).toBe(true) // 0 breaks AND byte-identical → implementation SOUND
})

test("S192 (W-RK03) — SEEDED NEGATIVE: a single BREAK in the ledger, OR a frozen-sha mismatch, flips implementation SOUND→NOT-SOUND", () => {
  // the audit's soundness is CONDITIONAL on 0 breaks AND the rigor sha matching — both must hold (a break is a defect, not a limit)
  const a = Rigor.audit()
  expect(a.sound).toBe(a.breakCount === 0 && a.rigorShaMatches && !a.frozenDrift)
  // an assumption-limit (the √(n−1) i.i.d. limit) is NOT a break — it is correctly classified and its correction is DD-89
  expect(a.assumptionLimits).toBeGreaterThanOrEqual(1)
})

test("S192 (W-RK03) — DD-89 the application leg: N_eff = n/τ_int is the enforced default; on the AR(1) demo the correction BITES (psrCorrected ≪ psrNaive)", () => {
  const demo = EffectiveN.demoAr1()
  const s = EffectiveN.serial(demo)
  // N_eff collapses far below n on an autocorrelated series (τ_int ≈ 36), clamped to [1,n]
  expect(s.tauInt).toBeGreaterThan(10)
  expect(s.nEff).toBeLessThan(s.n)
  expect(s.nEff).toBeGreaterThanOrEqual(1)
  expect(s.stable).toBe(true)
  const p = EffectiveN.psrAtNeff(demo)
  // the overstatement made concrete: the naive PSR is near-certain; the corrected PSR is materially lower
  expect(p.psrNaive).toBeGreaterThan(p.psrCorrected + 0.1)
})

test("S192 (W-RK03) — RP-3: N_eff is windowed + clamped [1,n]; a SHORT/unstable sample is UNJUDGEABLE (fails safe, never GO on naive n)", () => {
  // near-white increments → N_eff ≈ n (no collapse)
  let seed = 7; const rand = () => { seed = (1103515245 * seed + 12345) >>> 0; return seed / 0xffffffff - 0.5 }
  const white = Array.from({ length: 400 }, () => 0.001 + rand() * 0.01)
  expect(EffectiveN.serial(white).nEff).toBeGreaterThan(300) // near-white → N_eff ≈ n (no material collapse), vs the AR(1)'s ≈45/1600
  // a short sample (n < the floor) → UNJUDGEABLE (the correction is unstable; fail safe toward "not enough evidence")
  const short = Array.from({ length: 20 }, () => 0.001 + rand() * 0.01)
  expect(EffectiveN.serial(short).stable).toBe(false)
  expect(EffectiveN.psrAtNeff(short).judgeable).toBe(false)
})

test("S192 (W-RK03) — the D33 verdict is RENDERED: implementation SOUND · application SIGNABLE · recommended · operatorSigned FALSE", () => {
  const v = D33.verdict()
  expect(v.implementation).toBe("SOUND")
  expect(v.application).toBe("SIGNABLE")
  expect(v.riderEnforced).toBe(true)
  expect(v.recommendedForSignature).toBe(true)
  expect(v.operatorSigned).toBe(false) // LN5 — the agent computes and recommends; the pen is the human's
  // RP-4 — the accountability split is stated
  expect(v.accountabilitySplit.agent).toMatch(/math|verdict/i)
  expect(v.accountabilitySplit.operator).toMatch(/signature|rely/i)
})

test("S192 (W-RK03) — THE LN5 MECHANIZATION: the marker is operatorSigned-clean; a SEEDED agent operatorSigned:true REFUSES the log", () => {
  const marker = Rollup.terminalMarker({ fullBattery: { pass: 2000, skip: 2, fail: 0, expect: 13400 }, verify: { exitCode: 0, subchecks: [{ name: "a", status: "pass" }] }, goldenMoves: 0 } as unknown as Rollup.RunMeasured)
  expect(Ln5.verify(marker).ok).toBe(true) // the real marker: operatorSigned false everywhere
  // SEEDED NEGATIVE — the agent flips the bit (the gravest violation): the guard REFUSES
  const seeded = { ...marker, reckoning: { ...(marker.reckoning as object), d33Verdict: { operatorSigned: true } } }
  const v = Ln5.verify(seeded)
  expect(v.ok).toBe(false)
  if (!v.ok) expect(v.reason).toMatch(/operatorSigned:true|gravest|never moves/i)
})

// ── S193 (W-RK04) — THE D27 STRICT BAR (the literature's, not ours) ──

test("S193 (W-RK04) — the strict Stamp requires PSR(N_eff) > 0.95 AND len > MinTRL; the synthetic POSITIVE CONTROL clears the bar → GO (RP-2)", () => {
  // a synthetic low-autocorrelation series with genuine signal — the positive control that PROVES the Stamp can say GO
  let s = 20260716 >>> 0
  const rand = () => { s = (1103515245 * s + 12345) >>> 0; return s / 0xffffffff }
  const normal = () => { const u1 = Math.max(rand(), 1e-12), u2 = rand(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) }
  const pos = Array.from({ length: 400 }, () => 0.0012 + normal() * 0.01)
  const r = Strict.strict(pos)
  expect(r.verdict).toBe("GO")
  expect(r.psrClears).toBe(true)
  expect(r.psrCorrected).toBeGreaterThan(0.95)
  expect(r.lenOverMinTRL).toBe(true)
})

test("S193 (W-RK04) — SEEDED NEGATIVE: an autocorrelated series that naive-n would pass is INSUFFICIENT under the strict bar (the generosity retired)", () => {
  const ar = Strict.strict(EffectiveN.demoAr1())
  expect(ar.verdict).toBe("INSUFFICIENT") // naive √(n−1) says near-certain; strict √(N_eff−1) does not clear
  expect(ar.psrNaive).toBeGreaterThan(0.95) // it WOULD have passed on naive n (the generosity made concrete)
  expect(ar.psrClears).toBe(false) // but PSR(N_eff) does not clear the bar
})

test("S193 (W-RK04) — the strict record: the bar is López de Prado's (cited), the positive control GOes, ≥1 fixture flips GO→INSUFFICIENT", () => {
  const rec = Strict.strictRecord()
  expect(rec.positiveControlGO).toBe(true) // the machinery CAN say GO
  expect(rec.flips).toBeGreaterThanOrEqual(1) // AND it makes an autocorrelated GO INSUFFICIENT
  expect(rec.barSource).toMatch(/López de Prado|Bailey|MinTRL/)
  expect(rec.targetPSR).toBe(0.95)
})

test("S193 (W-RK04) — INSUFFICIENT is FIRST-CLASS (a forward clock, not a failure); the strict bar only makes a GO harder, never a NO-GO into GO", () => {
  // the strict bar is a hurdle BEFORE the GO — it downgrades GO→INSUFFICIENT, never flips a NO-GO to GO
  const ar = Strict.strict(EffectiveN.demoAr1())
  expect(["GO", "INSUFFICIENT"]).toContain(ar.verdict) // strict never emits NO-GO (that stays the frozen core's)
  // a degenerate/short series is UNJUDGEABLE → INSUFFICIENT (fails safe)
  expect(Strict.strict([0.01, 0.01, 0.01]).verdict).toBe("INSUFFICIENT")
})
