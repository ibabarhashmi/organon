/**
 * ORGΛNON — THE PERSISTENCE SPRINT, Phase 3 walls (DECAY-TRUE; Rule X-DECAY, X-DETERM). The deterministic decay half-life
 * gate, POSITIVE-CONTROLLED: a persistent (high-φ AR(1)) series → TRACEABLE; a fast-decaying (low-φ AR(1)) or serially-
 * random series → SHORT_LIVED (a clean GO withheld); a short / flat / SAMPLE series → INSUFFICIENT (never a fabricated
 * half-life). Deterministic (identical inputs → byte-identical). OFF-PATH: the scorecard never imports decay. An AR(1)'s
 * autocorrelation is φ^k, so its half-life is ln2/(−ln φ) — a KNOWN control the gate must recover.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Decay } from "../../src/studio/decay"

// a deterministic AR(1): xₜ = φ·xₜ₋₁ + sd·εₜ (seeded gaussian) around a small positive mean — its ACF is φ^k, so the
// half-life is ln2/(−ln φ): φ=0.95 → ≈13.5 (TRACEABLE, robust to finite-sample ACF bias); φ=0.5 → ≈1.0 (SHORT_LIVED);
// φ=0 → i.i.d. (no serial persistence). A borderline φ=0.9 (theoretical ≈6.6) estimates near the floor — honestly so.
function ar1(seed: number, n: number, phi: number, mu = 0.0002, sd = 0.001): number[] {
  let a = seed >>> 0
  const rng = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  const g = () => { const u1 = Math.max(1e-12, rng()), u2 = rng(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) }
  const out: number[] = []; let x = 0
  for (let i = 0; i < n; i++) { x = phi * x + sd * g(); out.push(mu + x) }
  return out
}

test("POSITIVE CONTROL (S22) — a persistent high-φ AR(1) → TRACEABLE (a traceable edge, above the floor)", () => {
  const r = Decay.decayHalfLife(ar1(11, 400, 0.95))
  expect(r.tier).toBe("TRACEABLE")
  expect(r.halfLife).not.toBeNull()
  expect(r.halfLife!).toBeGreaterThanOrEqual(Decay.HALFLIFE_FLOOR) // ≈ 9.9 periods (or ≥ floor if it persists past the window)
  expect(r.reason).toMatch(/TRACEABLE/)
})

test("POSITIVE CONTROL (S22) — a fast-decaying low-φ AR(1) → SHORT_LIVED (a fee-chase; a clean GO withheld)", () => {
  const r = Decay.decayHalfLife(ar1(7, 400, 0.5))
  expect(r.tier).toBe("SHORT_LIVED")
  expect(r.halfLife!).toBeLessThan(Decay.HALFLIFE_FLOOR) // ≈ 1 period
  expect(r.reason).toMatch(/SHORT_LIVED|clean GO is withheld/)
})

test("POSITIVE CONTROL (S22) — a serially-random (φ=0) series → SHORT_LIVED (no persistent signal), never TRACEABLE", () => {
  const r = Decay.decayHalfLife(ar1(4, 400, 0))
  expect(r.tier).toBe("SHORT_LIVED")
})

test("S22 — honest on short / flat / SAMPLE: INSUFFICIENT, never a fabricated half-life", () => {
  expect(Decay.decayHalfLife(ar1(1, 20, 0.9)).tier).toBe("INSUFFICIENT") // n < MIN_OBSERVATIONS
  expect(Decay.decayHalfLife(ar1(1, 20, 0.9)).halfLife).toBeNull()
  const flat = Decay.decayHalfLife(Array.from({ length: 100 }, () => 0.0001)) // degenerate / no variation
  expect(flat.tier).toBe("INSUFFICIENT")
  expect(flat.reason).toMatch(/degenerate|INSUFFICIENT/i)
  const sample = Decay.decayHalfLife(ar1(11, 400, 0.9), { reality: "SAMPLE" }) // SAMPLE-fed → not scored as real
  expect(sample.tier).toBe("INSUFFICIENT")
  expect(sample.reason).toMatch(/SAMPLE/)
})

test("X-DETERM — the decay gate is deterministic: identical inputs → a byte-identical result", () => {
  const series = ar1(11, 400, 0.9)
  expect(JSON.stringify(Decay.decayHalfLife(series))).toBe(JSON.stringify(Decay.decayHalfLife(series)))
})

test("S22/S16 — OFF THE MASS PATH: the scorecard does not import or call decay (a scorecard render runs the gate ZERO times)", () => {
  const src = readFileSync(path.join(PKG_ROOT, "src", "analytics", "scorecard.ts"), "utf8")
  expect(src).not.toMatch(/from ".*\/decay"/)
  expect(src).not.toMatch(/\bDecay\./)
})
