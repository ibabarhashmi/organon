/**
 * ORGΛNON — THE RECKONING SPRINT wall S81 (THE SHAPE GUARD, RP-1's TWO-SIDED OBLIGATION). advicePattern matches the SHAPE of
 * a recommendation, not substrings. Two-sided: (a-tightening) every line in the enumerated advice corpus STILL refuses — the
 * phase fails if one passes; (a-loosening) every line the new guard passes that the old refused is enumerated + justified in
 * the pins; (c) THE HOLE closed — the token-free advice ("size into it", "trim the position") now refused, none containing a
 * banned token; the honest disclaimers pass WITHOUT a punctuation trick. The living-corpus clause: ≥3 new adversarial lines.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { VoiceGates } from "../../src/ask/gates"
import { AdviceShape } from "../../src/ask/advice"

const rk = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "reckon-pins.json"), "utf8"))

test("S81 (a-tightening) — EVERY line in the enumerated advice corpus still REFUSES (the phase fails if one passes)", () => {
  for (const line of rk.guard.enumeratedAdviceCorpus_mustRefuse as string[]) {
    const r = AdviceShape.detect(line)
    expect({ line, advice: r.advice }).toEqual({ line, advice: true })
    expect(r.shape).toBeTruthy() // every refusal NAMES its shape
  }
})

test("S81 (c) — THE HOLE closed: token-free advice is REFUSED, and none of these lines contains a banned substring token", () => {
  const tokens = ["allocate", "buy ", "sell ", "invest in", "go long", "go short"]
  for (const line of rk.rePins.RP1_guardTwoSided.theHoleClosed as string[]) {
    expect({ line, advice: AdviceShape.detect(line).advice }).toEqual({ line, advice: true }) // caught by SHAPE
    // prove it is token-free (the old substring matcher would have MISSED it — this is the thirty-three-sprint hole)
    const hasToken = tokens.some((t) => ` ${line.toLowerCase()} `.includes(t))
    expect({ line, hasToken }).toEqual({ line, hasToken: false })
  }
})

test("S81 (a-loosening) — every enumerated loosening PASSES the new guard (honest disclaimers, no punctuation trick)", () => {
  // the affordance line WITHOUT the period + the buy-button descriptor — the two justified loosenings
  expect(AdviceShape.detect("It judges what you're doing; it never tells you what to buy").advice).toBe(false)
  expect(AdviceShape.detect("the buy button is on the exchange, not here").advice).toBe(false)
  // the pins enumerate exactly these two, each with a justification
  expect(rk.rePins.RP1_guardTwoSided.aLoosening_enumeratedAndJustified.every((e: { why: string }) => e.why.length > 40)).toBe(true)
})

test("S81 — the classic advice detection is PRESERVED, and neutral analysis stays clean (the V32 contract carried)", () => {
  expect(AdviceShape.detect("you should deposit into this pool").advice).toBe(true)
  expect(AdviceShape.detect("I recommend you buy the token").advice).toBe(true)
  expect(AdviceShape.detect("allocate 20% to this strategy").advice).toBe(true)
  expect(AdviceShape.detect("the durable base share is the larger part of the yield").advice).toBe(false)
  // the honest engine grammar (a fact about correlation, never an allocation) stays clean
  expect(AdviceShape.detect("info/context — a fact about correlation, never an allocation.").advice).toBe(false)
  expect(AdviceShape.detect("this describes correlation, not what to do").advice).toBe(false)
})

test("S81 — the living-corpus clause: ≥3 NEW adversarial lines this sprint (and the self-grading weakness named)", () => {
  expect((rk.rePins.RP1_guardTwoSided.theHoleClosed as string[]).length).toBeGreaterThanOrEqual(3)
  expect(rk.rePins.RP1_guardTwoSided.livingCorpusClause).toMatch(/grades its own homework/i) // the weakness is NAMED, not hidden
  expect(rk.guard.shapes.length).toBeGreaterThanOrEqual(10) // the shape vocabulary is real
})

test("S81 — ADVICE_SHAPES is preserved (the enumerated reference the carried tests read)", () => {
  expect(VoiceGates.ADVICE_SHAPES).toContain("you should")
})
