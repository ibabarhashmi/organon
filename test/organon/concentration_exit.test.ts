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

test("S112→D70 (W-SK06) — the exit set reached SEVEN this sprint (D70); it is now CLOSED AT SEVEN; an EIGHTH kind through the enum FAILS (seeded)", () => {
  // FAMILY V39 (D70) — V37's S112 pinned the set at FIVE with the algebra trigger armed to fire when it grew. This sprint
  // added oracle-staleness + utilization-ceiling → the set reached SEVEN and the trigger FIRED (algebra-trigger.json). The
  // socket-pins JSON still records V37's "five" (immutable history); the LIVE enum is seven.
  expect(Manifest.EXIT_KINDS.length).toBe(7)
  expect(Manifest.EXIT_KINDS).toContain("concentration-ceiling")
  expect(Manifest.EXIT_KINDS).toContain("oracle-staleness") // the sixth — now a VALID kind (D70)
  expect(Manifest.EXIT_KINDS).toContain("utilization-ceiling") // the seventh
  expect(sp.exitSet.count).toBe(5) // socket-pins is V37's immutable pin; V39's D70 grew the live set to seven
  // oracle-staleness now REGISTERS (it is the sixth evaluable kind) — the V37 refusal is superseded by D70
  const sixth = ExitCriterion.register({ kind: "oracle-staleness", threshold: 86400, subjectScope: "x" })
  expect(sixth.ok).toBe(true)
  // SEEDED NEGATIVE — an EIGHTH kind not in the enum is refused at parse (the set is closed at seven; an eighth goes through the algebra)
  const eighth = ExitCriterion.register({ kind: "liquidity-cliff", threshold: 0.5, subjectScope: "x" })
  expect(eighth.ok).toBe(false)
})
