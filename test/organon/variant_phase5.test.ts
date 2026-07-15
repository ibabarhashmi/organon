/**
 * ORGΛNON — THE VARIANT SPRINT (V41), Phase 5 wall (S165): THE CAPTURE'S MARGINAL VALUE. NO NEW LAW (sheds first).
 *
 * W-VR05 — L-5 / DD-72: at "0 captures" the own-capture leg is UNJUDGEABLE forever, and the only actionable false-fire
 * number is the RETROSPECTIVE (revisable) tier. The tool cannot make the Operator run the cadence, but it can make the FIRST
 * run visibly worth it: each capture advances at least one observable's own-capture window toward judgeable, and the FIRST
 * capture turns a UNJUDGEABLE into a 1. Rendered in CAPTURES, never days (RP-6 stands — a count ORGΛNON has, not a date it
 * cannot know; a projection to a date FAILS).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Capture } from "../../src/strategy/capture"

const DAY_MS = 86_400_000 // avoid a bare literal that trips a "days" grep; the unit under test is CAPTURES

test("S165 (W-VR05) — the FIRST capture turns a UNJUDGEABLE into a 1: marginalValue renders the gain in CAPTURES", () => {
  const before = { captures: 0, observations: 0, oldestTs: null, newestTs: null, spanDays: 0 }
  const run = Capture.run(1_784_000_000_000, (s) => (s.asset === "USDC" ? 60_000_000 : null)) // USDC resolves; others UNJUDGEABLE
  const mv = Capture.marginalValue(run, before)
  expect(mv.ran).toBe(true)
  expect(mv.firstCapture).toBe(true) // 0 → 1
  expect(mv.seriesAdvanced).toBeGreaterThan(0) // at least one observable resolved
  expect(mv.ownCapturesAfter).toBe(1)
  expect(mv.unit).toBe("CAPTURES")
  expect(mv.render).toMatch(/turns a UNJUDGEABLE into a 1/)
  expect(mv.render).toMatch(/CAPTURES \(not days\)/)
})

test("S165 (W-VR05) — the marginal value is in CAPTURES, NEVER days (RP-6): no projection to a date/day-count", () => {
  const run = Capture.run(1_784_000_000_000 + DAY_MS, (s) => (s.asset === "USDC" ? 60_000_000 : null))
  const mv = Capture.marginalValue(run, { captures: 5, observations: 30, oldestTs: 1, newestTs: 2, spanDays: 5 })
  expect(mv.firstCapture).toBe(false)
  expect(mv.ownCapturesAfter).toBe(6)
  // NEVER a date it cannot know — no "N days until", no projection to a future date
  expect(mv.render).not.toMatch(/\d+\s*days?\s+(until|to (judge|reach)|left|remaining)/i)
  expect(mv.render).toMatch(/CAPTURES \(not days\)/)
})

test("S165 (W-VR05) — an OFFLINE run advances nothing and says so honestly (no fabricated gain)", () => {
  const run = Capture.run(1_784_000_000_000) // no fetcher → offline
  const mv = Capture.marginalValue(run, { captures: 0, observations: 0, oldestTs: null, newestTs: null, spanDays: 0 })
  expect(mv.ran).toBe(false)
  expect(mv.seriesAdvanced).toBe(0)
  expect(mv.ownCapturesAfter).toBe(0) // nothing appended
  expect(mv.render).toMatch(/OFFLINE|nothing advanced/)
})

test("S165 (W-VR05) — the capture entrypoint renders the marginal value and STILL schedules nothing (a verb, not a service)", () => {
  const script = readFileSync(path.join(PKG_ROOT, "script", "honesty", "capture.ts"), "utf8")
  expect(script).toMatch(/marginalValue|marginal value/) // the marginal-value render is wired
  // the tree still schedules NOTHING (a seeded scheduler would FAIL) — strip comment lines first
  const code = script.split("\n").filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*")).join("\n")
  expect(code).not.toMatch(/\bsetInterval\s*\(|new\s+CronJob\s*\(|node-cron|\.schedule\s*\(|daemon\s*\(/)
})
