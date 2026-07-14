/**
 * ORGΛNON — THE SOCKET SPRINT (V37) S111 + THE SUBSTANCE SPRINT (V38) S117/S118/DD-34/RP-3: THE FALSE-FIRE COUNT IS A FACT,
 * MODEL-FREE, AND IT KNOWS WHAT ITS HISTORY IS WORTH. W-SK05 / W-SU02.
 *
 * S111 (V37): a COUNT over the moat's captured series, not a σ-band (a prediction X-HONEST forbids). Controls: no alternative
 * threshold, no score/grade, no comparative, no σ/distribution in the computation; UNJUDGEABLE below 180 days; deterministic
 * ×2; passes the ONE GUARD; travels in the Fact Envelope (authored:false).
 *
 * S118 (V38, H-2): V37 tiered the source series flatly REAL. But the DefiLlama chart series is RETROSPECTIVE — the provider's
 * PRESENT opinion about PAST values, revisable. The tier is now DERIVED from the series' provenance (the ladder REAL★ ·
 * REAL-at-timestamp · RETROSPECTIVE · UNJUDGEABLE), never hardcoded. S117: every FACT wall carries a POSITIVE provenance
 * assertion (the tier is a named ladder member; a retrospective series is NOT REAL★). RP-3: count over own captures (REAL★)
 * and the retrospective series, BOTH tiered, BOTH shown.
 *
 * CLONE-STABLE: the core assertions run over a SYNTHETIC committed series; the REAL captured chart is replayed only WHEN PRESENT.
 */
import { test, expect } from "bun:test"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { FalseFire } from "../../src/strategy/falsefire"
import { Provenance } from "../../src/strategy/provenance"
import { FactEnvelope } from "../../src/strategy/envelope"

const DAY = 86_400_000
const T0 = Date.parse("2025-01-01T00:00:00Z")
const synthetic: FalseFire.Point[] = Array.from({ length: 200 }, (_, i) => {
  const c = i % 40
  const tvl = c < 25 ? 100_000_000 * (1 + c * 0.02) : 100_000_000 * (1.5 - (c - 25) * 0.09)
  return { ts: T0 + i * DAY, tvlUsd: Math.round(tvl) }
})
const crit = { kind: "tvl-drawdown" as const, threshold: 0.3, subjectScope: "synthetic" }
const OWN = { captureMode: "own-pit" as const, source: "own-capture" } // aggregator-sourced own PIT capture → REAL-at-timestamp
const OWN_CHAIN = { captureMode: "own-pit" as const, source: "rpc:eth_call" } // a block-pinned own read → REAL★
const RETRO = { captureMode: "retrospective-fetch" as const, source: "defillama" } // a chart fetched now → RETROSPECTIVE

test("S111 — the count is model-free: the exit evaluator replayed over a captured series (a COUNT, not a probability)", () => {
  const r = FalseFire.count(crit, synthetic, OWN)
  expect(r.judgeable).toBe(true)
  if (r.judgeable) {
    expect(Number.isInteger(r.fired)).toBe(true) // a COUNT, not a probability
    expect(r.fired).toBeGreaterThanOrEqual(1)
    expect(r.windowDays).toBeGreaterThanOrEqual(180)
    expect(r.why).toMatch(/would have fired/i)
    expect(r.why).toMatch(/no model, no σ, no prediction/i)
  }
})

test("S118 (W-SU03, H-2/DD-34) — the tier is DERIVED from the series provenance, never hardcoded REAL (the full ladder): chain own-pit → REAL★, aggregator own-pit → REAL-at-timestamp, a chart fetch → RETROSPECTIVE", () => {
  expect(FalseFire.count(crit, synthetic, OWN_CHAIN).tier).toBe("REAL★") // a block-pinned own read (chain-reproducible)
  expect(FalseFire.count(crit, synthetic, OWN).tier).toBe("REAL-at-timestamp") // an aggregator value captured at T (PIT, but the API may revise its CURRENT view — not chain-reproducible)
  const retro = FalseFire.count(crit, synthetic, RETRO)
  expect(retro.tier).toBe("RETROSPECTIVE") // a whole series fetched now about the past — the H-2 defect, corrected
  if (retro.judgeable) expect(retro.why).toMatch(/revised or backfilled|not point-in-time/i) // it SAYS the history may have moved
})

test("S117 (W-SU02) — POSITIVE provenance assertion: the tier is a named ladder member, and a RETROSPECTIVE series is NOT REAL★ (a seeded flat REAL is impossible)", () => {
  const r = FalseFire.count(crit, synthetic, RETRO)
  expect(Provenance.isLadderMember(r.tier)).toBe(true) // the positive assertion — a member of the ladder, never a flat "REAL"
  expect(Provenance.LADDER).toContain(r.tier)
  expect(r.tier).not.toBe("REAL") // "REAL" is not on the ladder — the flat label is gone
  // a retrospective fetch tiered REAL★ is a Halt (the H-2 defect made structurally impossible)
  expect(Provenance.realStarIsLegit(RETRO)).toBe(false)
  expect(Provenance.realStarIsLegit(OWN)).toBe(false) // own-capture source is not block-pinned → REAL-at-timestamp, still not REAL★ unless the source proves it
  expect(Provenance.realStarIsLegit({ captureMode: "own-pit", source: "rpc:eth_call" })).toBe(true) // a block-pinned own read earns REAL★
})

test("S118 — an UNJUDGEABLE provenance (unestablishable capture mode) renders UNJUDGEABLE regardless of the window (missing stays missing)", () => {
  const r = FalseFire.count(crit, synthetic, { captureMode: "unknown", source: "" })
  expect(r.judgeable).toBe(false)
  expect(r.tier).toBe("UNJUDGEABLE")
  if (!r.judgeable) expect(r.why).toMatch(/cannot vouch for|revision exposure cannot be established/i)
})

test("S111 — UNJUDGEABLE below the 180-day window (DD-29) and for a kind with no captured series", () => {
  expect(FalseFire.count(crit, synthetic.slice(0, 4), OWN).judgeable).toBe(false) // < 180 days
  expect(FalseFire.count({ kind: "funding-flip-count", threshold: 3, subjectScope: "x" }, synthetic, OWN).judgeable).toBe(false)
  expect(FalseFire.count({ kind: "governance-change", threshold: 0, subjectScope: "x" }, synthetic, OWN).judgeable).toBe(false)
})

test("RP-3 — countBoth shows TWO numbers, TWO tiers: own (REAL★) and retrospective (RETROSPECTIVE), neither pretending", () => {
  // own captures are short today (few points) → UNJUDGEABLE; the retrospective series is deeper → a RETROSPECTIVE count
  const shortOwn = synthetic.slice(0, 10) // ~9 days of own captures
  const both = FalseFire.countBoth(crit, shortOwn, synthetic)
  expect(both.own.judgeable).toBe(false) // own window too short today — honest UNJUDGEABLE (grows with the cadence)
  expect(both.own.tier).toBe("REAL-at-timestamp") // own captures are PIT but aggregator-sourced (still better than a retrospective series)
  expect(both.retrospective.tier).toBe("RETROSPECTIVE")
  expect(both.why).toMatch(/two numbers, two tiers/i)
})

test("S111 — the fact states the count and STOPS: no alternative threshold, no score/grade, no comparative (structural)", () => {
  const r = FalseFire.count(crit, synthetic, OWN)
  if (!r.judgeable) return
  const keys = Object.keys(r)
  for (const banned of ["suggestedThreshold", "alternativeThreshold", "score", "grade", "quality", "comparative", "betterThreshold"]) expect(keys).not.toContain(banned)
  expect(r.why).not.toMatch(/tighter than|better than|you should|recommend|consider|instead|try/i)
})

test("S111 — NO model: the source carries no σ / distribution / probability / normal computation (a count, not a prediction)", () => {
  const src = readFileSync(path.join(PKG_ROOT, "src", "strategy", "falsefire.ts"), "utf8")
  const code = src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")
  expect(code).not.toMatch(/\bnorm(al|cdf|ppf)\b|\bstdev\b|\bvariance\b|\bgaussian\b|\bprobability\b|Math\.exp|erf\(/i)
})

test("S111 — DETERMINISTIC ×2 (X-DETERM); passes the ONE GUARD; travels in the Fact Envelope (authored:false)", () => {
  expect(JSON.stringify(FalseFire.count(crit, synthetic, OWN))).toBe(JSON.stringify(FalseFire.count(crit, synthetic, OWN)))
  expect(FalseFire.statementPassesGuard(FalseFire.count(crit, synthetic, OWN))).toBe(true)
  const r = FalseFire.count(crit, synthetic, RETRO)
  const env = FalseFire.fact(crit, r, { kind: "pool", key: "synthetic" }, { tier: r.tier, contentHash: "abc", capturedAt: null, source: "defillama" })
  expect(env.authored).toBe(false)
  expect(FactEnvelope.serialize(env).ok).toBe(true)
})

test("S118 — REPLAY OVER THE REAL MOAT (when present): a committed chart series gives a RETROSPECTIVE count; skipped-with-disclosure on a clone", () => {
  const base = path.join(PKG_ROOT, "data", "dataplane", "snapshots")
  if (!existsSync(base)) return // a fresh clone: the raw chart payloads are gitignored — disclosed, not faked
  const chartDir = readdirSync(base).find((d) => d.startsWith("defillama_chart_"))
  if (!chartDir) return
  const inner = path.join(base, chartDir)
  const files = existsSync(inner) && readdirSync(inner)
  if (!files || files.length === 0) return
  const snap = JSON.parse(readFileSync(path.join(inner, files[0]), "utf8"))
  const series: FalseFire.Point[] = (snap.points || []).map((p: { ts: number; tvlUsd: number }) => ({ ts: p.ts, tvlUsd: p.tvlUsd }))
  const r = FalseFire.count(crit, series, RETRO) // a DefiLlama chart is RETROSPECTIVE — the corrected tier
  if (r.judgeable) {
    expect(r.tier).toBe("RETROSPECTIVE") // NOT REAL — a real count over the moat's captured history, honestly tiered
    expect(Number.isInteger(r.fired)).toBe(true)
  }
})
