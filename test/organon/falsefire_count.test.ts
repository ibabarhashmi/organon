/**
 * ORGΛNON — THE SOCKET SPRINT (V37), Phase 3 wall: S111 — THE FALSE-FIRE COUNT IS A FACT, MODEL-FREE. W-SK05.
 *
 * Origin: a depositor commits to an exit threshold blind to how often it would have fired on the observable's own real
 * history. A σ-band would be a confidently-wrong PREDICTION (X-HONEST forbids). So it is a COUNT over the moat's captured
 * chart series, not a model. Controls: a rendered alternative threshold FAILS, a score/grade FAILS, a comparative FAILS, a
 * σ/distribution/probability in the computation FAILS; UNJUDGEABLE below 180 days; deterministic ×2; passes the ONE GUARD;
 * travels in the Fact Envelope (authored:false).
 *
 * CLONE-STABLE (the fresh clone caught the first cut reading a GITIGNORED chart snapshot): the core assertions run over a
 * SYNTHETIC committed series (deterministic, present on any clone); the REAL captured chart is replayed only WHEN PRESENT
 * (a dev env with data/dataplane/snapshots/), skipped-with-disclosure on a clone where the raw payloads are gitignored.
 */
import { test, expect } from "bun:test"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { FalseFire } from "../../src/strategy/falsefire"
import { FactEnvelope } from "../../src/strategy/envelope"

// a SYNTHETIC, committed, deterministic series — 200 daily points (≈199 days ≥ the 180 window), with recurring drawdowns
// from running peaks so a tvl-drawdown criterion fires a countable number of times. Present on ANY clone (no gitignored data).
const DAY = 86_400_000
const T0 = Date.parse("2025-01-01T00:00:00Z")
const synthetic: FalseFire.Point[] = Array.from({ length: 200 }, (_, i) => {
  const c = i % 40 // a 40-day cycle: 25 days rising to a peak, then a sharp ~40% drop, then recovery
  const tvl = c < 25 ? 100_000_000 * (1 + c * 0.02) : 100_000_000 * (1.5 - (c - 25) * 0.09)
  return { ts: T0 + i * DAY, tvlUsd: Math.round(tvl) }
})
const crit = { kind: "tvl-drawdown" as const, threshold: 0.3, subjectScope: "synthetic" }

test("S111 (W-SK05) — the count is REAL and model-free: the exit evaluator replayed over a captured series (a COUNT, not a probability)", () => {
  const r = FalseFire.count(crit, synthetic)
  expect(r.judgeable).toBe(true)
  if (r.judgeable) {
    expect(r.tier).toBe("REAL")
    expect(Number.isInteger(r.fired)).toBe(true) // a COUNT, not a probability
    expect(r.fired).toBeGreaterThanOrEqual(1) // the synthetic drawdowns fire at least once
    expect(r.windowDays).toBeGreaterThanOrEqual(180)
    expect(r.why).toMatch(/would have fired/i)
    expect(r.why).toMatch(/no model, no σ, no prediction/i)
  }
})

test("S111 (W-SK05) — UNJUDGEABLE below the pinned 180-day window (DD-29) and for a kind with no captured series (missing stays missing)", () => {
  expect(FalseFire.count(crit, synthetic.slice(0, 4)).judgeable).toBe(false) // < 180 days
  expect(FalseFire.count({ kind: "funding-flip-count", threshold: 3, subjectScope: "x" }, synthetic).judgeable).toBe(false)
  expect(FalseFire.count({ kind: "governance-change", threshold: 0, subjectScope: "x" }, synthetic).judgeable).toBe(false)
})

test("S111 (W-SK05) — the fact states the count and STOPS: no alternative threshold, no score/grade, no comparative (structural)", () => {
  const r = FalseFire.count(crit, synthetic)
  if (!r.judgeable) return
  const keys = Object.keys(r)
  for (const banned of ["suggestedThreshold", "alternativeThreshold", "score", "grade", "quality", "comparative", "betterThreshold"]) expect(keys).not.toContain(banned)
  expect(r.why).not.toMatch(/tighter than|better than|you should|recommend|consider|instead|try/i)
})

test("S111 (W-SK05) — NO model: the source carries no σ / distribution / probability / normal computation (a count, not a prediction)", () => {
  const src = readFileSync(path.join(PKG_ROOT, "src", "strategy", "falsefire.ts"), "utf8")
  const code = src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "") // assert over CODE only (the 'no σ' disclaimer is in comments)
  expect(code).not.toMatch(/\bnorm(al|cdf|ppf)\b|\bstdev\b|\bvariance\b|\bgaussian\b|\bprobability\b|Math\.exp|erf\(/i)
})

test("S111 (W-SK05) — DETERMINISTIC ×2 (X-DETERM); passes the ONE GUARD; travels in the Fact Envelope (authored:false)", () => {
  expect(JSON.stringify(FalseFire.count(crit, synthetic))).toBe(JSON.stringify(FalseFire.count(crit, synthetic)))
  expect(FalseFire.statementPassesGuard(FalseFire.count(crit, synthetic))).toBe(true)
  const env = FalseFire.fact(crit, FalseFire.count(crit, synthetic), { kind: "pool", key: "synthetic" }, { tier: "REAL", contentHash: "abc", capturedAt: null, source: "synthetic" })
  expect(env.authored).toBe(false)
  expect(FactEnvelope.serialize(env).ok).toBe(true)
})

test("S111 (W-SK05) — REPLAY OVER THE REAL MOAT (when present): a committed chart series gives a REAL count; skipped-with-disclosure on a clone (gitignored payloads)", () => {
  const base = path.join(PKG_ROOT, "data", "dataplane", "snapshots")
  if (!existsSync(base)) return // a fresh clone: the raw chart payloads are gitignored — disclosed, not faked (the synthetic tests above hold)
  const chartDir = readdirSync(base).find((d) => d.startsWith("defillama_chart_"))
  if (!chartDir) return // no chart captured in this env — the count is UNJUDGEABLE over the Socket without a series (stated)
  const snap = JSON.parse(readFileSync(path.join(base, chartDir, readdirSync(path.join(base, chartDir))[0]), "utf8"))
  const series: FalseFire.Point[] = (snap.points || []).map((p: { ts: number; tvlUsd: number }) => ({ ts: p.ts, tvlUsd: p.tvlUsd }))
  const r = FalseFire.count(crit, series)
  if (r.judgeable) {
    expect(r.tier).toBe("REAL")
    expect(Number.isInteger(r.fired)).toBe(true) // a real count over the moat's own captured history
  }
})
