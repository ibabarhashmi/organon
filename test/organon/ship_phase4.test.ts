/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 4 wall (S159): THE SHARED-DEPENDENCY MAP. NO NEW LAW.
 *
 * W-SH09 — K-10: the curator-loss literature's core finding (the failure mode is SHARED, INVISIBLE DEPENDENCY) was unbuilt.
 * Depend.map is a COUNT over a join on three keys — underlying (coverage ≈ total), admin key (RESOLVED terminal authority
 * only), oracle feed (3/1284 shelf-wide, and it says so). It ranks nothing, suggests nothing, and NEVER says "diversify"
 * (a seeded advisory FAILS the ONE GUARD). RP-4: the admin-key join matches ONLY the resolved terminal authority; an
 * UNRESOLVED position is UNJUDGEABLE, never a match, never "independent". The copy is PINNED VERBATIM (no LLM).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Depend } from "../../src/strategy/depend"
import { AdviceShape } from "../../src/ask/advice"

const shipPins = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "ship-pins.json"), "utf8"))
// a realistic 5-position manifest: 3 USDC (aave, fluid, compound) + 2 DAI (aave, spark)
const MANIFEST = ["aa70268e-4b52-42bf-a116-608b370f9501", "4438dabc-7f0c-430b-8136-2722711ae663", "7da72d09-56ca-4ec5-a45f-59114353e487", "3665ee7e-6c5d-49d9-abb7-c47ab5d9d4ac", "e26ce7d9-db75-4aa4-b1db-cc21ae17bdfb"]

test("S159 (W-SH09) — a COUNT over a join: underlying + oracle produce shared-counts; the map degrades gracefully (A4/K-8)", () => {
  const r = Depend.map(MANIFEST)
  expect(r.positions).toBe(5)
  expect(r.byUnderlying.sharedCount).toBe(3) // 3 of 5 share USDC
  expect(r.byUnderlying.sharedValue).toBe("USDC")
  expect(r.byOracle.sharedCount).toBe(3) // 3 of 5 read USDC/USD
  expect(r.byUnderlying.line).toMatch(/3 of your 5 positions share the same underlying asset \(USDC\)/)
  expect(r.byOracle.line).toMatch(/3 of your 5 positions read the same oracle feed/)
})

test("S159 (W-SH09) — RP-4: the admin-key join matches ONLY the RESOLVED terminal authority; UNRESOLVED → UNJUDGEABLE, never a match", () => {
  const r = Depend.map(MANIFEST)
  // aave's own pools (same protocol) stay UNJUDGEABLE because their terminal authority is UNRESOLVED — the map refuses to
  // claim a dependency it cannot prove (the strongest RP-4 demonstration; F-4: a false "2 share the same admin key" is worse than silence)
  expect(r.byAdminKey.sharedCount).toBe(0) // no two positions share a RESOLVED terminal authority
  expect(r.byAdminKey.coverage.resolved).toBe(1) // only compound-v3 (TIMELOCK) resolves
  expect(r.byAdminKey.coverage.unjudgeable).toBe(4)
  expect(r.byAdminKey.line).toMatch(/UNJUDGEABLE/)
  expect(r.byAdminKey.line).toMatch(/never claims independence it cannot prove|INVISIBLE, not absent/)
  // the asymmetric-confidence rule is pinned
  expect(shipPins.phase4_dependencyMap.rp4_asymmetricConfidence.rule).toMatch(/may NEVER say 'these two definitely do NOT share/i)
})

test("S159 (W-SH09) — PER-KEY COVERAGE is emitted; a key that cannot resolve is UNJUDGEABLE, never a silent zero", () => {
  const r = Depend.map(MANIFEST)
  for (const k of [r.byUnderlying, r.byAdminKey, r.byOracle]) {
    expect(k.coverage.total).toBe(5)
    expect(k.coverage.resolved + k.coverage.unjudgeable).toBe(5) // no silent zero — every position accounted
  }
  expect(r.shelfWideOracleCoverage).toMatch(/3\/1284 shelf-wide/) // the honest oracle proxy (K-8)
})

test("S159 (W-SH09) — the map NEVER advises: every rendered line passes the ONE GUARD (seeded 'diversify' FAILS)", () => {
  const r = Depend.map(MANIFEST)
  // every line the map actually speaks is advice-free
  for (const line of Depend.lines(r)) expect(AdviceShape.detect(line).advice).toBe(false)
  expect(AdviceShape.detect(Depend.speak(r, "Simple")).advice).toBe(false)
  expect(AdviceShape.detect(Depend.speak(r, "Pro")).advice).toBe(false)
  expect(AdviceShape.detect(Depend.render(r)).advice).toBe(false)
  // the SEEDED NEGATIVE — an advisory tacked onto the fact is caught by the guard (proving the guard would bite)
  expect(AdviceShape.detect(r.byUnderlying.line + " so you should reduce your exposure").advice).toBe(true)
  expect(AdviceShape.detect("3 of your 5 share USDC — consider rotating out of some").advice).toBe(true)
})

test("S159 (W-SH09) — the copy is PINNED VERBATIM (no LLM): the rendered lines are the pinned templates filled", () => {
  const c = shipPins.phase4_dependencyMap.copyVerbatim
  const r = Depend.map(MANIFEST)
  expect(r.header).toBe(c.header) // byte-identical to the pin
  expect(r.rule).toBe(c.rule)
  // the underlying line is the pinned template with {n}/{m}/{value} filled — not generated prose
  expect(r.byUnderlying.line).toBe(c.byUnderlying.replace("{n}", "3").replace("{m}", "5").replace("{value}", "USDC"))
})

test("S159 (W-SH09) — the map RANKS nothing: the DATA lines carry no ordering, no 'best', no total order (the disclaimer may say 'nothing ranked')", () => {
  const r = Depend.map(MANIFEST)
  const dataLines = Depend.lines(r).join(" ").toLowerCase() // the actual fact lines, not the pinned disclaimer
  expect(dataLines).not.toMatch(/\brank(ed|ing)?\b/)
  expect(dataLines).not.toMatch(/\bbest\b/)
  expect(dataLines).not.toMatch(/\btop [0-9]\b/)
  // and the disclaimer's negations are honest, not advice (the guard reads them as disclaimers via NEGATION_CUES)
  expect(r.header).toMatch(/nothing ranked/) // the disclaimer is present (it may say the word it forbids)
})
