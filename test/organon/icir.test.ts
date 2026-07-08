/**
 * ORGΛNON — THE PERSISTENCE SPRINT, Phase 4 walls (ICIR-TRUE; Rule X-ICIR, X-DETERM). The deterministic ICIR consistency
 * sub-score, POSITIVE-CONTROLLED: a steady-edge series → CONSISTENT (high ratio); a lumpy/reversing-edge series → LUMPY (a
 * clean GO tempered); a short / degenerate / SAMPLE series → INSUFFICIENT (never a divide-by-zero or a fabricated ratio).
 * The WITHIN-STRATEGY scope label is present + explicitly NOT cross-sectional (S23 — a cross-sectional claim is a doc-lie).
 * Deterministic (identical inputs → byte-identical). OFF-PATH: the scorecard never imports ICIR.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Icir } from "../../src/studio/icir"

// a deterministic seeded-gaussian return series with a chosen per-period mean (ic) and volatility (sd): ICIR ≈ ic/sd.
function series(seed: number, n: number, ic: number, sd: number): number[] {
  let a = seed >>> 0
  const rng = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  const g = () => { const u1 = Math.max(1e-12, rng()), u2 = rng(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) }
  return Array.from({ length: n }, () => ic + sd * g())
}

test("POSITIVE CONTROL (S23) — a steady edge (ic ≫ sd) → CONSISTENT (a high within-strategy consistency ratio, above the floor)", () => {
  const r = Icir.icir(series(11, 200, 0.006, 0.003)) // ICIR ≈ 2.0
  expect(r.tier).toBe("CONSISTENT")
  expect(r.icir!).toBeGreaterThanOrEqual(Icir.STEADY_FLOOR)
  expect(r.reason).toMatch(/CONSISTENT/)
})

test("POSITIVE CONTROL (S23) — a lumpy / reversing edge (mean ≈ 0, large sd) → LUMPY (a clean GO tempered)", () => {
  const r = Icir.icir(series(7, 200, 0.0, 0.01)) // mean ≈ 0 → ICIR ≈ 0
  expect(r.tier).toBe("LUMPY")
  expect(r.icir!).toBeLessThan(Icir.STEADY_FLOOR)
  expect(r.reason).toMatch(/LUMPY|tempered/)
})

test("S23 — honest on short / degenerate / SAMPLE: INSUFFICIENT, never a divide-by-zero or a fabricated ratio", () => {
  expect(Icir.icir(series(1, 10, 0.006, 0.003)).tier).toBe("INSUFFICIENT") // < MIN_PERIODS
  const flat = Icir.icir(Array.from({ length: 100 }, () => 0.0001)) // std → 0, degenerate
  expect(flat.tier).toBe("INSUFFICIENT")
  expect(flat.icir).toBeNull()
  expect(flat.reason).toMatch(/degenerate|divide-by-zero|INSUFFICIENT/i)
  expect(Icir.icir(series(11, 200, 0.006, 0.003), { reality: "SAMPLE" }).tier).toBe("INSUFFICIENT") // SAMPLE → not scored
})

test("S23 — the WITHIN-STRATEGY scope is labeled + explicitly NOT cross-sectional (a cross-sectional claim is a doc-lie)", () => {
  const r = Icir.icir(series(11, 200, 0.006, 0.003))
  expect(r.scope).toBe("within-strategy-temporal")
  expect(r.reason).toMatch(/within-strategy/i)
  expect(r.reason).toMatch(/NOT a cross-sectional/i) // the scope wall — never implied as cross-sectional factor alpha
})

test("X-DETERM — the ICIR sub-score is deterministic: identical inputs → a byte-identical result", () => {
  const s = series(11, 200, 0.006, 0.003)
  expect(JSON.stringify(Icir.icir(s))).toBe(JSON.stringify(Icir.icir(s)))
})

test("S23/S16 — OFF THE MASS PATH: the scorecard does not import or call ICIR (a scorecard render runs it ZERO times)", () => {
  const src = readFileSync(path.join(PKG_ROOT, "src", "analytics", "scorecard.ts"), "utf8")
  expect(src).not.toMatch(/from ".*\/icir"/)
  expect(src).not.toMatch(/\bIcir\./)
})
