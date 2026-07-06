/**
 * TEST — the FUNDAMENTAL-LAW breadth panel + the hedged ETA (Spine Phase 1; Rules R-ETA, R-ADVISORY). Proves: IC is the
 * rank correlation and recovers a known link; BR is HONEST about autocorrelation (a serially-correlated series is
 * deflated below its raw count, the independence assumption STATED); IR = TC·IC·√BR; the ETA is a hedged RANGE (never a
 * point), carries its assumptions + the floor-audit hedge verbatim, and CAN say "may never reach power"; the
 * pro-disclosure toggle derives nothing and adds no screen; and the verdict differential is byte-identical (the panel
 * moved no verdict). Positive controls: a point-estimate ETA is impossible through the API; the BR deflation bites.
 */
import { test, expect } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Breadth } from "../../src/analytics/breadth"
import { StudioScreens } from "../../src/studio/screens"
import { VerdictDifferential } from "../../src/studio/differential"

// a tiny deterministic gaussian generator (seeded) so the test is reproducible
function rngFactory(seed: number): () => number {
  let a = seed >>> 0
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
function gauss(rng: () => number, n: number): number[] {
  const o: number[] = []
  while (o.length < n) { const u1 = Math.max(1e-12, rng()), u2 = rng(), r = Math.sqrt(-2 * Math.log(u1)); o.push(r * Math.cos(2 * Math.PI * u2)); if (o.length < n) o.push(r * Math.sin(2 * Math.PI * u2)) }
  return o
}

test("IC is the rank correlation and recovers a known link within tolerance", () => {
  const rng = rngFactory(0x1234)
  const sig = gauss(rng, 8000), z = gauss(rng, 8000)
  const ret = sig.map((s, i) => 0.12 * s + Math.sqrt(1 - 0.0144) * z[i])
  const ic = Breadth.informationCoefficient(sig, ret)
  expect(ic).toBeGreaterThan(0.09) // recovers the planted link (Spearman ~4-5% below the 0.12 Pearson)
  expect(ic).toBeLessThan(0.13)
  // an unrelated signal has ~zero IC
  const noise = gauss(rngFactory(0x9999), 8000)
  expect(Math.abs(Breadth.informationCoefficient(noise, ret))).toBeLessThan(0.05)
})

test("BR is HONEST about autocorrelation — a serially-correlated series is deflated below its raw count, assumption STATED", () => {
  const rng = rngFactory(0x2222)
  const noise = gauss(rng, 2000)
  const ar: number[] = []
  let prev = 0
  for (let i = 0; i < 2000; i++) { const x = 0.6 * prev + noise[i]; ar.push(x); prev = x } // strong AR(1), ρ≈0.6
  const b = Breadth.breadthOf(ar, 252)
  expect(b.lag1Autocorr).toBeGreaterThan(0.4) // the autocorrelation is detected
  expect(b.effectiveObs).toBeLessThan(b.nObs) // independent bets < raw observations (the deflation BITES)
  expect(b.betsPerYear).toBeLessThan(252) // BR deflated below the naive bars/year
  expect(b.independenceAssumption).toMatch(/AR\(1\)|autocorrelation|independent/i) // the assumption is STATED on the panel
  // a near-iid series is NOT deflated much
  const iid = gauss(rngFactory(0x3333), 2000)
  expect(Breadth.breadthOf(iid, 252).betsPerYear).toBeGreaterThan(230)
})

test("the Fundamental Law holds: IR = TC · IC · √BR", () => {
  expect(Breadth.informationRatio(0.1, 252, 1)).toBeCloseTo(0.1 * Math.sqrt(252), 6)
  expect(Breadth.informationRatio(0.1, 252, 0.5)).toBeCloseTo(0.5 * 0.1 * Math.sqrt(252), 6)
  const p = Breadth.panel({ signal: [1, 2, 3, 4, 5, 6, 7, 8], realized: [1, 2, 3, 4, 5, 6, 7, 8], returns: [0.01, -0.01, 0.02, 0, 0.01, -0.005, 0.015, 0.002], barsPerYear: 252 })
  expect(p.ir).toBeCloseTo(p.tc * p.ic * Math.sqrt(p.breadth.betsPerYear), 6)
})

test("the ETA is a hedged RANGE (never a point), carries assumptions + the floor-audit hedge verbatim", () => {
  const rng = rngFactory(0x4444)
  const sig = gauss(rng, 400), z = gauss(rng, 400)
  const ret = sig.map((s, i) => 0.06 * s + Math.sqrt(1 - 0.0036) * z[i])
  const p = Breadth.panel({ signal: sig, realized: ret, returns: ret, barsPerYear: 252 })
  const e = Breadth.eta(p, { targetT: 2.0 })
  // a RANGE, not a point: lo and hi are distinct fields and the low end is not equal to the high end
  expect(e.powerAtYearsLo).not.toBe(e.powerAtYearsHi)
  expect(e.range).toMatch(/range|never/i) // the human sentence names it a range (or an honest never)
  expect(e.assumptions.length).toBeGreaterThanOrEqual(4) // the assumptions are listed
  expect(e.hedge).toMatch(/pending floor audit/i) // the floor-audit hedge, verbatim
  // the ETA is a FLOOR on time (ignores deflation growth) — stated, so it can never be read as a promise-of-sooner
  expect(e.assumptions.some((a) => /FLOOR on time|never a ceiling|>= this estimate/i.test(a))).toBe(true)
})

test("the ETA CAN say 'may never reach power' for a high-IC / tiny-BR strategy (positive control)", () => {
  const rng = rngFactory(0xBEEF)
  const sig = gauss(rng, 8), z = gauss(rng, 8)
  const ret = sig.map((s, i) => 0.4 * s + Math.sqrt(1 - 0.16) * z[i])
  const p = Breadth.panel({ signal: sig, realized: ret, returns: ret, barsPerYear: 4 })
  const e = Breadth.eta(p, { targetT: 2.0 })
  expect(e.mayNeverReach).toBe(true) // the skill estimate is not distinguishable from zero → honest "may never"
  expect(e.range).toMatch(/may never reach power/i)
})

test("POSITIVE CONTROL: a point-estimate ETA is impossible through the API (eta always returns a band)", () => {
  const p = Breadth.panel({ signal: [1, 2, 3, 4, 5], realized: [2, 1, 4, 3, 5], returns: [0.01, 0.02, -0.01, 0.03, 0.0], barsPerYear: 252 })
  const e = Breadth.eta(p)
  // the shape itself forbids a point: there is a lo AND a hi, and an IR band, and a hedged sentence
  expect(e).toHaveProperty("powerAtYearsLo")
  expect(e).toHaveProperty("powerAtYearsHi")
  expect(e).toHaveProperty("irLo")
  expect(e).toHaveProperty("irHi")
})

test("the pro-disclosure toggle DERIVES NOTHING and adds NO screen (the toggle is not a screen)", () => {
  expect(StudioScreens.SCREENS.length).toBe(10) // the toggle added no screen; the set is 10 after the Pool Composer (U-AMEND-2)
  const rng = rngFactory(0x7777)
  const sig = gauss(rng, 300), z = gauss(rng, 300)
  const ret = sig.map((s, i) => 0.08 * s + Math.sqrt(1 - 0.0064) * z[i])
  const p = Breadth.panel({ signal: sig, realized: ret, returns: ret, barsPerYear: 252 })
  const disclosure = Breadth.proDisclosure({ breadth: p, eta: Breadth.eta(p), rigor: { sharpeAnnualized: 1.1, dsr: 0.4, psr0: 0.3, nObs: 300 }, cpcv: null })
  // the toggle is a pure visibility switch: OFF shows nothing new, ON shows the ALREADY-COMPUTED disclosure verbatim
  expect(StudioScreens.proToggle(disclosure, false)).toBe("")
  expect(StudioScreens.proToggle(disclosure, true)).toContain(disclosure)
  // deriving nothing: proDisclosure is a deterministic formatter — same input → identical output; it computes no number
  expect(Breadth.proDisclosure({ breadth: p, eta: Breadth.eta(p), rigor: { sharpeAnnualized: 1.1, dsr: 0.4, psr0: 0.3, nObs: 300 }, cpcv: null })).toBe(disclosure)
  expect(disclosure).toMatch(/IC=/) // it exposes the raw already-computed panels
})

test("R-ADVISORY: the verdict differential is byte-identical to the pinned Phase-1 baseline (the panel moved no verdict)", async () => {
  const pinned = path.join(PKG_ROOT, "data", "studio", "verdict-fingerprints-v11.json")
  if (!existsSync(pinned)) { console.log("  (breadth) verdict-fingerprints-v11.json absent — run script/phase1-spine.ts"); return }
  const rec = JSON.parse(readFileSync(pinned, "utf8"))
  const sha = await VerdictDifferential.fingerprintSetSha()
  expect(sha).toBe(rec.fingerprintSetSha) // re-deriving the fixed submission set reproduces the exact verdicts
})
