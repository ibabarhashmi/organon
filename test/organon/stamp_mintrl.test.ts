/**
 * ORGΛNON — THE VOICE SPRINT, Phase 6 walls (STAMP-TIGHT, X-DECAY/X-ICIR extended). The MinTRL rider on the opt-in Stamp —
 * math-mandated, deterministic, off the mass path:
 *   · MinTRL-FIRST — a short-history track record (T < the Minimum Track Record Length its OWN Sharpe requires) has its
 *     deflated-Sharpe point estimate SUPPRESSED ENTIRELY (dsr === null, the verdict INSUFFICIENT + the needed-N line) — a
 *     SUPPRESSION, not a caveat (the number is ABSENT, not footnoted).
 *   · a long-history track record clears MinTRL → the estimate renders as before (the verdict/dsr unchanged).
 *   · the trial count N (the deflation basis) is logged; a negative/zero Sharpe → MinTRL undefined → NOT suppressed.
 *   · off the mass path (S16 carried): a scorecard render invokes the Stamp zero times; the frozen differential is untouched.
 */
import { test, expect } from "bun:test"
import { Stamp } from "../../src/studio/stamp"
import { MinTRL } from "../../src/studio/mintrl"

// a seeded normal generator (deterministic) → a return series with mean `ic` and per-step noise `sd`
function seeded(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32 } }
function series(seed: number, n: number, ic: number, sd = 0.01): number[] {
  const u = seeded(seed)
  return Array.from({ length: n }, () => { const a = Math.max(1e-9, u()), b = u(); return ic + sd * Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b) })
}

test("MinTRL (pure) — a WEAK Sharpe needs a long record (large MinTRL); a STRONG Sharpe needs few observations", () => {
  const strong = MinTRL.minTRL(series(11, 400, 0.006)) // sr ≈ 0.6/obs → small MinTRL
  expect(strong.minTRL).not.toBeNull()
  expect(strong.minTRL!).toBeLessThan(100)
  const weak = MinTRL.minTRL(series(7, 400, 0.0005)) // sr ≈ 0.05/obs → a large MinTRL
  expect(weak.minTRL!).toBeGreaterThan(strong.minTRL!)
  // a NEGATIVE-edge series → the Sharpe never clears the benchmark → MinTRL undefined, NOT suppressed (a genuine reading)
  const neg = MinTRL.minTRL(series(3, 400, -0.003))
  expect(neg.minTRL).toBeNull()
  expect(neg.suppress).toBe(false)
})

test("STAMP-TIGHT — a SHORT positive track record (T < MinTRL): the point estimate is SUPPRESSED (dsr null) + INSUFFICIENT + the needed-N line", async () => {
  // a weak-but-positive Sharpe over 100 points → MinTRL ≈ 185 far exceeds T=100 → suppressed (not a NO-GO)
  const short = await Stamp.stampFromReturns(series(42, 100, 0.001), { label: "short" })
  expect(short.verdict).toBe("INSUFFICIENT")
  expect(short.dsr).toBeNull() // the point estimate is ABSENT (suppressed, not caveated)
  expect(short.minTRL).not.toBeNull()
  expect(short.minTRL!.suppress).toBe(true)
  expect(short.minTRL!.needMore).toBeGreaterThan(0)
  expect(short.reason).toMatch(/Minimum Track Record Length|need \d+ more observations/i)
})

test("STAMP-TIGHT — a LONG track record clears MinTRL: the estimate renders as before (GO, dsr present, N logged)", async () => {
  const long = await Stamp.stampFromReturns(series(11, 400, 0.006), { label: "long" })
  expect(long.verdict).toBe("GO")
  expect(long.dsr).not.toBeNull() // the estimate renders (not suppressed)
  expect(long.minTRL).not.toBeNull()
  expect(long.minTRL!.suppress).toBe(false)
  expect(long.minTRL!.sufficient).toBe(true)
  expect(long.minTRL!.trialN).toBeGreaterThanOrEqual(1) // the trial count N (deflation basis) is logged
})

test("STAMP-TIGHT — deterministic: the same recorded series → a byte-identical MinTRL result", async () => {
  const a = await Stamp.stampFromReturns(series(42, 100, 0.001), { label: "det" })
  const b = await Stamp.stampFromReturns(series(42, 100, 0.001), { label: "det" })
  expect(JSON.stringify(a.minTRL)).toBe(JSON.stringify(b.minTRL))
})

test("STAMP-TIGHT — suppression is NOT a caveat: on a suppressed Stamp the deflated-significance NUMBER never appears in the reason", async () => {
  const short = await Stamp.stampFromReturns(series(42, 100, 0.001), { label: "suppressed" })
  expect(short.verdict).toBe("INSUFFICIENT")
  // the reason names the needed-N (a suppression) but carries NO deflated-significance decimal (the estimate is absent)
  expect(short.reason).not.toMatch(/deflated significance \d\.\d|dsr [0-9]/i)
})
