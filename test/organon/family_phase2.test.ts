/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 2 wall (S145) — *never sheds. The sprint's reason for being.*
 *
 * For thirty-nine sprints the false-fire count rendered UNJUDGEABLE (J-7); under D51 (INSTRUMENT) that is not a gap, it is
 * THE failure — a fact that says "unknown" can never change anything, and the amended kill-criterion (D67) turns on exactly
 * that. This phase MATERIALIZES the observable series (REAL retrospective tvl/peg, committed + content-hashed) and the count
 * finally says a NUMBER at the door. RP-3: the own-capture number LEADS, the retrospective renders beneath with its
 * revisability, the window disparity is stated; own-below-minimum → own UNJUDGEABLE + retro ALONE, labelled the weaker.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Series } from "../../src/strategy/series"
import { Reality } from "../../src/studio/reality"
import { AdviceShape } from "../../src/ask/advice"
import { FalseFire } from "../../src/strategy/falsefire"

const tvl = { kind: "tvl-drawdown" as const, threshold: 0.30, subjectScope: "USDC-fluid" }
const peg = { kind: "peg-floor" as const, threshold: 0.995, subjectScope: "USDC" }

test("S145 (J-7) — the instrument SAYS A NUMBER: tvl-drawdown and peg-floor render a real count over materialized REAL series (NOT UNJUDGEABLE)", () => {
  const t = Series.falseFireTwoTier(tvl)
  expect(t.unjudgeableEverywhere).toBe(false)
  expect(typeof t.number).toBe("number") // a NUMBER at the door — the sprint's reason for being
  expect(t.number).toBe(5) // the REAL count: USDC fluid-lending crossed a 30%-from-peak drawdown 5 times
  const p = Series.falseFireTwoTier(peg)
  expect(p.unjudgeableEverywhere).toBe(false)
  expect(p.number).toBe(0) // USDC held its 0.995 floor — 0 is a USEFUL number (the kill-condition would not have fired)
})

test("S145 — the series is REAL, materialized, content-hashed (not fabricated); a blanket UNJUDGEABLE on a materialized observable FAILS", () => {
  const m = Series.materialize("tvl-drawdown")
  expect(m.exists).toBe(true)
  if (m.exists) {
    expect(m.retro.length).toBeGreaterThan(180) // a real deep retrospective series
    expect(m.tier).toBe("RETROSPECTIVE")
  }
  // the fixture's content hash reproduces (the series was not silently edited)
  const fx = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "false-fire-series.json"), "utf8"))
  const recomputed = createHash("sha256").update(JSON.stringify(fx.series)).digest("hex")
  expect(recomputed).toBe(fx.seriesSha)
  // SEEDED NEGATIVE — a materialized observable that renders UNJUDGEABLE would be a Halt; tvl/peg do NOT (they render a number)
  expect(Series.falseFireTwoTier(tvl).unjudgeableEverywhere).toBe(false)
})

test("S145 (RP-3) — the OWN-capture number LEADS; the retrospective renders BENEATH with its revisability; the window disparity is STATED", () => {
  const t = Series.falseFireTwoTier(tvl)
  // own LEADS — UNJUDGEABLE today (the cadence window is below the minimum, growing)
  expect(t.ownLine).toMatch(/own point-in-time captures \(REAL@ts\)/)
  expect(t.ownLine).toMatch(/UNJUDGEABLE|window is still growing/)
  // the retrospective is BENEATH, WITH its revisability in the same breath, labelled the WEAKER evidence
  expect(t.retroLine).toMatch(/RETROSPECTIVE/)
  expect(t.retroLine).toMatch(/revisable|WEAKER/)
  // the window disparity is stated as a fact
  expect(t.windowNote.length).toBeGreaterThan(20)
  expect(t.windowNote).toMatch(/full annual cycle|do not yet cover|days/)
})

test("S145 — a COUNT, never a model: no σ, no distribution, no probability, no suggested threshold; passes the ONE GUARD", () => {
  for (const c of [tvl, peg]) {
    const t = Series.falseFireTwoTier(c)
    expect(t.statement).not.toMatch(/\bσ\b|standard deviation|probability|distribution|\bp-value\b|confidence interval/i)
    expect(t.statement).not.toMatch(/instead|recommend|you should|try a|better threshold|consider/i) // never a suggested threshold (X-AUTHOR)
    expect(t.statement).toMatch(/a COUNT|never a prediction/) // it states a count and stops
    expect(AdviceShape.detect(t.statement).advice).toBe(false) // passes the ONE GUARD
  }
})

test("S145 — deterministic ×2 (same input → byte-identical statement)", () => {
  expect(JSON.stringify(Series.falseFireTwoTier(tvl))).toBe(JSON.stringify(Series.falseFireTwoTier(tvl)))
  expect(JSON.stringify(Series.falseFireTwoTier(peg))).toBe(JSON.stringify(Series.falseFireTwoTier(peg)))
})

test("S145 — UNJUDGEABLE is permitted ONLY where the series genuinely does not exist (governance-change has no captured point series)", () => {
  const g = Series.falseFireTwoTier({ kind: "governance-change", threshold: 1, subjectScope: "x" } as never)
  expect(g.unjudgeableEverywhere).toBe(true) // honest — no series exists; missing stays missing (never a blanket default)
  expect(g.number).toBeNull()
})

test("S145 — the render shows both tiers (own leads, retro beneath) in the composed door line", () => {
  const t = Series.falseFireTwoTier(tvl)
  const view: Reality.FalseFireView = { statement: t.statement, tier: t.tier, ownLine: t.ownLine, retroLine: t.retroLine, windowNote: t.windowNote, number: t.number }
  const html = Reality.renderFalseFireLine(view)
  expect(html).toMatch(/own point-in-time captures/) // own LEADS
  expect(html).toMatch(/RETROSPECTIVE/) // retro BENEATH
  expect(html).toMatch(/tier: RETROSPECTIVE/) // the tier badge
  // the own line appears BEFORE the retro line in the DOM (RP-3 ordering)
  expect(html.indexOf("own point-in-time")).toBeLessThan(html.indexOf("retrospective chart"))
})

test("S145 — the count is a reason to run the cadence: the own window grows toward the minimum (MIN_WINDOW_DAYS pinned)", () => {
  expect(FalseFire.MIN_WINDOW_DAYS).toBe(180)
  // own captures are short today (the committed fixture has no own-pit series yet — it grows every day the cadence runs)
  expect(Series.ownCaptures("tvl-drawdown")).toEqual([])
})
