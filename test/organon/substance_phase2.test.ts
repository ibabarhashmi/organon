/**
 * ORGΛNON — THE SUBSTANCE SPRINT (V38), Phase 2 walls: H-4 (wire the false-fire count to the render) + S117 (the positive
 * provenance assertion, render side). Never sheds.
 *
 * H-4: "a fact only a machine can read is a fact the depositor does not have." V37 built the count, walled it, envelope-
 * carried it, Socket-exposed it — and it did NOT render at the door or the drawer. This wires it: the count renders in the
 * composed drawer with its corrected TIER beside it, and the door affordance tells the depositor it is coming, BEFORE they
 * commit. It states a COUNT and STOPS — a seeded suggestion/score/comparative FAILS the ONE GUARD (X-AUTHOR: it refuses, it
 * never coerces). The live NUMBER renders wherever the subject's tvl/peg observable series is materialized; absent, it renders
 * UNJUDGEABLE with the tier stated honestly (the readily-composed series is apyBase — the tvl/peg feed is disclosed-owed).
 */
import { test, expect } from "bun:test"
import { Reality } from "../../src/studio/reality"
import { FalseFire } from "../../src/strategy/falsefire"
import { AdviceShape } from "../../src/ask/advice"
import { DefiLlama } from "../../src/dataplane/providers/defillama"

const NOW = Date.parse("2026-07-09T00:00:00Z")
const rc = Reality.realityCheck(`defillama:pool:${DefiLlama.SAMPLE_POOLS[0].pool}`, NOW)!

const DAY = 86_400_000
const T0 = Date.parse("2025-01-01T00:00:00Z")
const series: FalseFire.Point[] = Array.from({ length: 200 }, (_, i) => {
  const c = i % 40
  const tvl = c < 25 ? 100_000_000 * (1 + c * 0.02) : 100_000_000 * (1.5 - (c - 25) * 0.09)
  return { ts: T0 + i * DAY, tvlUsd: Math.round(tvl) }
})
const crit = { kind: "tvl-drawdown" as const, threshold: 0.3, subjectScope: "x" }
const RETRO = { captureMode: "retrospective-fetch" as const, source: "defillama" }

test("H-4 — renderFalseFireLine renders the COUNT and its TIER for the depositor; the statement passes the ONE GUARD", () => {
  const r = FalseFire.count(crit, series, RETRO)
  expect(r.judgeable).toBe(true)
  const ff: Reality.FalseFireView = { statement: r.why, tier: r.tier }
  const html = Reality.renderFalseFireLine(ff)
  expect(html).toMatch(/would have fired/i) // the count renders for a human
  expect(html).toMatch(/tier: RETROSPECTIVE/) // the corrected tier beside it (not a flat REAL)
  expect(html).toMatch(/COUNT over captured history, never a prediction/i)
  // the render path passes the ONE GUARD (the false-fire statement is not advice)
  expect(AdviceShape.detect(r.why).advice).toBe(false)
})

test("H-4 — the count is protected two ways: the ONE GUARD bites a buy/sell shape, and the count STRUCTURALLY carries no threshold suggestion", () => {
  // the ONE GUARD bites an advice shape (a buy/sell statement) — the false-fire render path is guarded
  expect(AdviceShape.detect("you should sell now").advice).toBe(true)
  expect(AdviceShape.detect("buy now").advice).toBe(true)
  // the STRUCTURAL protection against a suggested threshold (the guard is narrow — buy/sell — so the real defence is that the
  // count object carries NO alternative threshold / score / comparative and its statement never uses those words, S111)
  const r = FalseFire.count(crit, series, RETRO)
  expect(AdviceShape.detect(r.why).advice).toBe(false) // the real statement is not advice
  expect(r.why).not.toMatch(/you should|recommend|consider|better than|tighter than|instead/i) // states the count and STOPS
  for (const banned of ["suggestedThreshold", "alternativeThreshold", "score", "grade", "comparative"]) expect(Object.keys(r)).not.toContain(banned)
})

test("H-4 — the composed drawer INCLUDES the false-fire line (rendered after the exit criterion); absent → it is simply omitted", () => {
  const base: Reality.ComposedView = {
    positions: [
      { name: rc.name, scored: rc.scored, history: rc.history, poolKey: "x", size: 1, units: "USDC" },
      { name: rc.name, scored: rc.scored, history: rc.history, poolKey: "y", size: 2, units: "USDC" },
    ],
    thesis: "a test thesis",
    lines: [{ kind: "exit", text: "portfolio fact" }],
    compositeAbsence: "no aggregate",
    exitLine: "hash abcd1234… · NOT FIRED — peg 1.0 ≥ floor 0.99",
  }
  const withFF = Reality.renderComposed({ ...base, falseFire: { statement: FalseFire.count(crit, series, RETRO).why, tier: "RETROSPECTIVE" } })
  expect(withFF).toMatch(/would have fired/i)
  expect(withFF).toMatch(/tier: RETROSPECTIVE/)
  const withoutFF = Reality.renderComposed(base)
  expect(withoutFF).not.toMatch(/would have fired/i) // absent → omitted, never fabricated
})

test("H-4 — the DOOR affordance tells the depositor the count is coming BEFORE they commit, and that it never suggests a threshold", () => {
  expect(Reality.DOOR_EXIT_HELP).toMatch(/replays your criterion over the subject's captured history/i)
  expect(Reality.DOOR_EXIT_HELP).toMatch(/how many times it would have fired/i)
  expect(Reality.DOOR_EXIT_HELP).toMatch(/never suggests a different threshold/i)
  // the door affordance itself passes the ONE GUARD (it is prose the depositor reads)
  expect(AdviceShape.detect(Reality.DOOR_EXIT_HELP).advice).toBe(false)
})

test("H-4 — UNJUDGEABLE renders with its tier honestly (missing stays missing): a short series → UNJUDGEABLE, tier stated", () => {
  const short = FalseFire.count(crit, series.slice(0, 4), RETRO)
  expect(short.judgeable).toBe(false)
  const html = Reality.renderFalseFireLine({ statement: short.why, tier: short.tier })
  expect(html).toMatch(/UNJUDGEABLE/i)
  expect(html).toMatch(/tier: RETROSPECTIVE/)
})
