/**
 * ORGΛNON — THE VARIANT SPRINT (V41), Phase 2 wall (S162): THE GUARD HOLE, CLOSED OR OWNED. NO NEW LAW (sixth sprint).
 *
 * W-VR02 — L-2 / DD-70: V40's mutation test found 8/17 on the advice guard and one banned shape the FULL layer missed
 * (16/17) — an unqualified best-in-class superlative ('the safest, highest-yielding strategy available'), named and routed,
 * shipped uncaught. This CLOSES it: AdviceShape.superlative (composed into the ONE GUARD, AdviceShape.detect) catches the
 * advice superlative WHILE a FACTUAL superlative that names a measured quantity + value ('the highest τ_int in your set is
 * 165') still renders (the positive control — X-HONEST: a false-positiving guard that hides facts is worse than a named
 * hole). guardEfficacy re-measures 8/17 → 10/17 (advice), 16/17 → 17/17 (full layer); RP-5 STANDS — the lower-bound caveat
 * is printed WITH the number, always.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { AdviceShape } from "../../src/ask/advice"
import { Guard } from "../../src/organon/guard"

test("S162 (W-VR02) — the ADVICE superlative is CAUGHT (the V40 genuine hole, closed): a best-in-class claim with no measured basis", () => {
  const caught = [
    "this is the safest, highest-yielding strategy available",
    "the safest pool for your money",
    "here are the rankings of these pools, top to bottom",
    "the best vault to be in right now",
    "the optimal strategy for you",
  ]
  for (const c of caught) {
    expect(AdviceShape.superlative(c).caught).toBe(true)
    expect(AdviceShape.detect(c).advice).toBe(true) // caught by the ONE GUARD
  }
})

test("S162 (W-VR02) — POSITIVE CONTROL: a FACTUAL superlative STILL RENDERS (names a measured quantity + value — a fact, never advice)", () => {
  const factual = [
    "the highest τ_int in your set is 165", // no strategy noun — trivially not the advice shape
    "the highest-APY pool in your filter is fluid at 8% — rank 1 of 48", // strategy noun + APY + numbers → the FACTUAL ESCAPE (the enumerator's selection-rank fact)
    "the best APY in your set is 12%",
    "the lowest-risk score here is a deflation of 0.6",
  ]
  for (const f of factual) {
    expect(AdviceShape.superlative(f).caught).toBe(false) // NEVER caught — X-HONEST: never suppress a true fact
    expect(AdviceShape.detect(f).advice).toBe(false) // renders
  }
  // and the FACTUAL ESCAPE explicitly fires where a superlative DOES land on a strategy noun but names a quantity + a number
  // (the enumerator's own "your pick is the highest-APY member — rank 1 of 48" fact, which V39 must be free to render)
  const escape = AdviceShape.superlative("the highest-APY pool in your filter is fluid at 8% — rank 1 of 48")
  expect(escape.factual).toBe(true)
  expect(escape.caught).toBe(false)
})

test("S162 (W-VR02) — a superlative NOT applied to a strategy is not this hole (e.g. 'the safest thing to do is nothing' — no strategy noun)", () => {
  // the detector is narrow: a superlative must land on a strategy/investment noun to be a best-in-class recommendation
  expect(AdviceShape.superlative("the safest thing to do is read the docs").caught).toBe(false)
})

test("S162 (W-VR02) — guardEfficacy re-measured 8/17 → 10/17; full layer 17/17; 0 genuine holes; the lower-bound caveat printed WITH the number (RP-5)", () => {
  const r = Guard.mutationRate()
  expect(r.rate).toBe("10/17") // the advice guard, re-measured after the close
  expect(r.fullLayerRate).toBe("17/17") // every mutation caught by SOME guard
  expect(r.genuineHoles.length).toBe(0) // the one V40 genuine hole is closed
  expect(r.lowerBoundCaveat).toMatch(/LOWER BOUND/) // RP-5 STANDS
  expect(r.lowerBoundCaveat).toMatch(/CLOSED the one genuine hole/)
  // the committed artifact carries the re-measured number WITH the caveat (a number without it is a Halt)
  const art = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "guard-efficacy.json"), "utf8"))
  expect(art.guardEfficacy).toBe("10/17")
  expect(art.header).toMatch(/LOWER BOUND/)
})

test("S162 (W-VR02) — the close is DETERMINISTIC (no LLM): the superlative detector is a pure regex pair, two runs identical", () => {
  const s = "this is the safest, highest-yielding strategy available"
  expect(JSON.stringify(AdviceShape.superlative(s))).toBe(JSON.stringify(AdviceShape.superlative(s)))
})
