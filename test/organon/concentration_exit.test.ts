/**
 * ORGΛNON — THE SOCKET SPRINT (V37), Phase 4 wall: S112 — concentration-ceiling, THE FIFTH EXIT KIND. W-SK06.
 *
 * Origin: the curator-loss literature's defect — a vault that became the dominant supplier in a single market and could not
 * exit ("can I actually get out?"). A SHARE IS NOT A VALUE: share = size / poolTvl is DIMENSIONLESS (no USD, no price, no
 * oracle — the valuation ban untouched). UNJUDGEABLE without inputs (missing stays missing). The exit set is CLOSED AT FIVE
 * (a 6th without a pin FAILS); the combinator algebra is NOT built (its trigger pinned: a 7th kind or the first composed exit).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { ExitCriterion } from "../../src/strategy/exit"
import { Manifest } from "../../src/strategy/manifest"

const sp = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "socket-pins.json"), "utf8"))

test("S112 (W-SK06) — the share is DIMENSIONLESS: Exit.concentration(size, poolTvl) = size/poolTvl, no USD/price/oracle", () => {
  const r = ExitCriterion.concentration(2_000_000, 40_000_000)
  expect(r.share).toBeCloseTo(0.05, 6) // 5% of the pool
  expect(r.why).toMatch(/dimensionless/i)
  expect(r.why).not.toMatch(/\$\s?\d/) // no dollar FIGURE — a share, never a value (the "no USD/price" disclaimer is fine)
  expect(typeof r.share).toBe("number") // a pure ratio, computed from two numbers the engine already holds
})

test("S112 (W-SK06) — UNJUDGEABLE without inputs (missing stays missing); the criterion evaluates the share vs the ceiling", () => {
  expect(ExitCriterion.concentration(null, 40_000_000).share).toBeNull() // no size
  expect(ExitCriterion.concentration(2_000_000, null).share).toBeNull() // no captured TVL
  const c = { kind: "concentration-ceiling" as const, threshold: 0.25, subjectScope: "aave-v3:USDC" }
  // the evaluator reads a pre-computed share fact; absent → UNJUDGEABLE (never a fabricated fired/not-fired)
  expect(ExitCriterion.evaluate(c, { concentrationShare: null }).judgeable).toBe(false)
  expect(ExitCriterion.evaluate(c, { concentrationShare: 0.30 }).fired).toBe(true) // 30% ≥ 25% ceiling → cannot get out
  expect(ExitCriterion.evaluate(c, { concentrationShare: 0.10 }).fired).toBe(false)
})

test("S112 (W-SK06) — registration: a valid ceiling (a share in (0,1]) is evaluable; an out-of-range threshold is REFUSED with the reason", () => {
  expect(ExitCriterion.register({ kind: "concentration-ceiling", threshold: 0.25, subjectScope: "aave-v3:USDC" }).ok).toBe(true)
  const bad = ExitCriterion.register({ kind: "concentration-ceiling", threshold: 5, subjectScope: "aave-v3:USDC" })
  expect(bad.ok).toBe(false) // 5 is not a dimensionless share
  if (!bad.ok) expect(bad.error).toMatch(/dimensionless share|share in/i)
})

test("S112 (W-SK06) — the exit set is CLOSED AT FIVE; a 6th kind without a pin FAILS the enum (seeded); the algebra is NOT built", () => {
  expect(Manifest.EXIT_KINDS.length).toBe(5)
  expect(Manifest.EXIT_KINDS).toContain("concentration-ceiling")
  expect(sp.exitSet.count).toBe(5)
  // SEEDED NEGATIVE — a 6th kind not in the pinned set is refused at parse (the enum is the closed set)
  const sixth = ExitCriterion.register({ kind: "oracle-staleness", threshold: 3600, subjectScope: "x" })
  expect(sixth.ok).toBe(false) // not an evaluable kind — the set is closed at five
  // the combinator algebra is NOT built — its trigger is pinned, not pulled
  expect(sp.exitSet.algebraTrigger).toMatch(/7th|composed/i)
})
