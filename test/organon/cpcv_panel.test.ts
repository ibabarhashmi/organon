/**
 * TEST — CPCV as an additive ADVISORY panel (Spine Phase 2; Rules R-ADVISORY, A′#5/#10). Proves the GOLDEN PAIR both
 * directions (a known-overfit fixture flags HIGH on PBO; a known-signal fixture passes LOW); the configuration is PINNED
 * (no per-run knob — a tweak to flatter a result is structurally impossible); SKIPPED is a first-class honest state
 * (short series / single trial); a CPCV-vs-frozen DISAGREEMENT renders as information not a vote; the panel is advisory
 * -labeled; and the verdict differential is byte-identical (the panel moved no verdict).
 */
import { test, expect } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { CPCV } from "../../src/analytics/cpcv"
import { VerdictDifferential } from "../../src/studio/differential"

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
function gauss(rng: () => number, n: number): number[] {
  const o: number[] = []
  while (o.length < n) { const u1 = Math.max(1e-12, rng()), u2 = rng(), r = Math.sqrt(-2 * Math.log(u1)); o.push(r * Math.cos(2 * Math.PI * u2)); if (o.length < n) o.push(r * Math.sin(2 * Math.PI * u2)) }
  return o
}
function matrix(T: number, N: number, col: (n: number) => number[]): number[][] {
  const cols = Array.from({ length: N }, (_, n) => col(n))
  return Array.from({ length: T }, (_, t) => cols.map((c) => c[t]))
}

test("GOLDEN PAIR — a known-OVERFIT fixture (pure noise) flags HIGH on PBO", () => {
  const M = matrix(500, 50, (n) => gauss(mulberry32(0x0ff17 + n), 500))
  const r = CPCV.run(M)
  expect(r.skipped).toBe(false)
  expect(r.pbo).toBeGreaterThanOrEqual(0.4) // the IS-best is a fluke; OOS it reverts → high probability of overfitting
})

test("GOLDEN PAIR — a known-SIGNAL fixture (one planted edge among noise) passes LOW on PBO", () => {
  const M = matrix(500, 50, (n) => { const noise = gauss(mulberry32(0x516a1 + n), 500); return n === 0 ? noise.map((x) => 0.15 + x) : noise })
  const r = CPCV.run(M)
  expect(r.skipped).toBe(false)
  expect(r.pbo).toBeLessThanOrEqual(0.15) // the real edge stays best out-of-sample → low overfit probability
  expect(r.oosSharpeMedian!).toBeGreaterThan(0) // the IS-best's OOS Sharpe is genuinely positive
})

test("the configuration is PINNED — no per-run knob (a purge tweak to flatter a result is impossible)", () => {
  const a = CPCV.run(matrix(500, 20, (n) => gauss(mulberry32(1 + n), 500)))
  const b = CPCV.run(matrix(300, 10, (n) => gauss(mulberry32(99 + n), 300)))
  // both runs report the SAME pinned config; run() accepts no config argument (only the matrix + an optional clock)
  expect(a.config).toEqual(CPCV.CONFIG)
  expect(b.config).toEqual(CPCV.CONFIG)
  expect(a.config.purge).toBe(CPCV.CONFIG.purge)
  expect(a.config.embargo).toBe(CPCV.CONFIG.embargo)
  expect(a.config.groups).toBe(CPCV.CONFIG.groups)
})

test("SKIPPED is a first-class honest state (short series AND single trial), never a silent absence", () => {
  const short = CPCV.run(matrix(30, 5, (n) => gauss(mulberry32(0x5407 + n), 30)))
  expect(short.skipped).toBe(true)
  expect(short.skipReason).toMatch(/too short|group size/i)
  expect(short.pbo).toBeNull() // no fabricated number
  const single = CPCV.run(matrix(500, 1, () => gauss(mulberry32(0x51), 500)))
  expect(single.skipped).toBe(true)
  expect(single.skipReason).toMatch(/too few trials|cannot be cross-validated/i)
})

test("a CPCV-vs-frozen DISAGREEMENT renders as INFORMATION, never averaged away (A′#5)", () => {
  const M = matrix(500, 50, (n) => { const noise = gauss(mulberry32(0x516a1 + n), 500); return n === 0 ? noise.map((x) => 0.15 + x) : noise })
  const cpcv = CPCV.run(M)
  // CPCV says overfit-unlikely, but the frozen gate refuses (NO-GO under deflation) → the render must say DISAGREE
  const render = CPCV.renderBeside(cpcv, { verdict: "NO-GO", dsr: 0.5 })
  expect(render).toMatch(/DISAGREE/)
  expect(render).toMatch(/frozen gate decides/i)
  // and when they agree it says so
  expect(CPCV.renderBeside(cpcv, { verdict: "GO", dsr: 0.99 })).toMatch(/agree/)
})

test("the panel is ADVISORY-labeled (beside the frozen gates, never above them)", () => {
  const r = CPCV.run(matrix(500, 10, (n) => gauss(mulberry32(7 + n), 500)))
  expect(r.advisory).toMatch(/ADVISORY/)
  expect(r.advisory).toMatch(/never above/i)
})

test("R-ADVISORY: the verdict differential is byte-identical after CPCV landed (the panel moved no verdict)", async () => {
  const pinned = path.join(PKG_ROOT, "data", "studio", "verdict-fingerprints-v11.json")
  if (!existsSync(pinned)) { console.log("  (cpcv) verdict-fingerprints-v11.json absent — run script/phase1-spine.ts"); return }
  const rec = JSON.parse(readFileSync(pinned, "utf8"))
  // compute CPCV on the differential submissions (a read that touches nothing), then re-derive the fingerprints
  for (const s of VerdictDifferential.submissions()) CPCV.run(matrix(Math.min(s.returns.length, 200), 3, () => s.returns.slice(0, 200)))
  expect(await VerdictDifferential.fingerprintSetSha()).toBe(rec.fingerprintSetSha)
})
