/**
 * ORGΛNON — THE COVERAGE SPRINT, Phase 4 wall (the correlation substrate; S66). Deterministic + permutation-invariant:
 * the same series in ANY order → byte-identical clusters; the merge threshold + overlap floor are PINNED; thin overlap →
 * INSUFFICIENT (no fabricated number); correlated pools cluster (effectiveK < N); the COMPARE fact is non-advisory +
 * number-traced (the advice wall re-runs green on it).
 */
import { test, expect } from "bun:test"
import { Correlate } from "../../src/analytics/correlate"

const T0 = 1_700_000_000_000
const DAY = 86_400_000
// a deterministic positive base series with real day-to-day variation
const base = (i: number) => 3 + Math.sin(i * 0.7) * 0.6 + i * 0.01
const mk = (key: string, fn: (i: number) => number, n = 40) => ({ key, points: Array.from({ length: n }, (_, i) => ({ ts: T0 + i * DAY, value: fn(i) })) })
// A/B/C share the base up to a SCALE (log-delta scale-invariant → ρ=1); D inverts it (ρ=−1 → never merges)
const A = mk("aaa", (i) => base(i))
const B = mk("bbb", (i) => base(i) * 1.1)
const C = mk("ccc", (i) => base(i) * 0.9)
const D = mk("ddd", (i) => 3 / base(i))

test("CORRELATE — permutation-invariant: the same series in ANY input order produce BYTE-IDENTICAL clusters (S66)", () => {
  const one = Correlate.analyze([A, B, C, D])
  const rev = Correlate.analyze([D, C, B, A])
  const shuf = Correlate.analyze([C, A, D, B])
  expect(JSON.stringify(rev.clusters)).toBe(JSON.stringify(one.clusters)) // byte-identical under reversal
  expect(JSON.stringify(shuf.clusters)).toBe(JSON.stringify(one.clusters)) // and under an arbitrary shuffle
  expect(one.keys).toEqual(["aaa", "bbb", "ccc", "ddd"]) // canonical (sorted) key order regardless of input
})

test("CORRELATE — the merge threshold + overlap floor are PINNED (an edit is a conscious re-pin)", () => {
  expect(Correlate.MERGE_THRESHOLD).toBe(0.5)
  expect(Correlate.MIN_OVERLAP).toBe(30)
})

test("CORRELATE — correlated pools CLUSTER (effectiveK < N); the inverse pool stays its own bet", () => {
  const an = Correlate.analyze([A, B, C, D])
  expect(an.sufficient).toBe(true)
  expect(an.effectiveK).toBe(2) // {A,B,C} collapse to one bet; D is a second → 2 effective bets among 4 pools
  const abc = an.clusters.find((c) => c.includes("aaa"))!
  expect(abc.sort()).toEqual(["aaa", "bbb", "ccc"]) // the three co-moving pools are one cluster
  expect(an.clusters.some((c) => c.length === 1 && c[0] === "ddd")).toBe(true)
})

test("CORRELATE — Pearson is correct (identical → 1, inverse log-delta → −1); the overlap floor BITES (thin → INSUFFICIENT, no number)", () => {
  const da = Correlate.logDeltas(Array.from({ length: 40 }, (_, i) => base(i)))
  expect(Correlate.pearson(da, da)).toBeCloseTo(1, 6)
  const dd = Correlate.logDeltas(Array.from({ length: 40 }, (_, i) => 3 / base(i)))
  expect(Correlate.pearson(da, dd)).toBeCloseTo(-1, 6)
  // thin overlap (< 30 shared points) → INSUFFICIENT, no fabricated correlation
  const thin = Correlate.analyze([mk("aaa", base, 10), mk("bbb", (i) => base(i) * 1.1, 10)])
  expect(thin.sufficient).toBe(false)
  expect(thin.effectiveK).toBeNull()
  expect(thin.note).toMatch(/INSUFFICIENT|fabricated precision/i)
})

test("CORRELATE — the COMPARE fact is NON-ADVISORY + number-traced (the advice wall re-runs green on it); Simple + Pro", () => {
  const an = Correlate.analyze([A, B, C, D])
  const simple = Correlate.diversificationFact(an, "simple")
  const pro = Correlate.diversificationFact(an, "pro")
  // number-traced: both carry the actual N and K
  expect(simple).toMatch(/about 2 bets, not 4/)
  expect(pro).toMatch(/≈ 2 independent bets among 4/)
  expect(pro).toMatch(/info\/context/)
  // NON-ADVISORY: neither tells the user what to DO (the advice wall's forbidden shapes)
  for (const s of [simple, pro]) expect(s).not.toMatch(/\ballocate\b|you should|\bbuy\b|\bsell\b|invest more|rebalance to|put more/i)
  // the insufficient case is honest, not a fabricated read
  const thin = Correlate.analyze([mk("aaa", base, 5), mk("bbb", (i) => base(i), 5)])
  expect(Correlate.diversificationFact(thin, "simple")).toMatch(/can't show a diversification read/i)
})
