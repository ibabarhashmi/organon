/**
 * ORGΛNON — THE RECKONING SPRINT wall S84 (THE TAXONOMY-AWARE READOUT + THE ASK GRAMMAR). The drawer's readout is COUNTS and
 * the RULE, never a defence (an explaining readout is X-ADVICE's subtle form): "N entries · N SEARCH · N OBSERVATION · the
 * trigger counts SEARCH: N of ≥20 …". The cadence delta facts are SPEAKABLE in both registers behind the existing advice wall
 * (no new intent) — the V32 omission (its blueprint required Ask at Phase 3 / PART C.3; the log never mentioned it), closed.
 */
import { test, expect } from "bun:test"
import { StrategyTrial } from "../../src/strategy/trial"
import { Monitor } from "../../src/strategy/monitor"
import { Baseline } from "../../src/strategy/baseline"
import { VoiceGates } from "../../src/ask/gates"
import { StrategyCompile } from "../../src/strategy/compile"

const V32 = "040301c26de44c9ef869d3cab8af582e82f6bda4ac63a0dfd8abf4c62586250c"

test("S84 — the readout is COUNTS + the RULE: it names SEARCH/OBSERVATION + the SEARCH-only trigger count, and it is NOT a defence", () => {
  const r = StrategyTrial.readout(V32, StrategyTrial.FIXTURE_TRIAL_DIR)
  expect(r).toMatch(/23 entries on this lineage/)
  expect(r).toMatch(/1 SEARCH · 22 OBSERVATION/)
  expect(r).toMatch(/the trigger counts SEARCH: 1 of ≥ 20/)
  expect(r).toMatch(/deflation remains INERT/i)
  expect(r).toMatch(/an observation makes no new inferential claim/i) // the RULE stated, plainly
  // it passes the advice wall — a readout is a FACT, never a recommendation (X-ADVICE's subtle form refused)
  expect(VoiceGates.advicePattern(r).advice).toBe(false)
  expect(StrategyCompile.guardLine(r).ok).toBe(true)
})

test("S84 — the readout renders the DERIVED taxonomy, not a caller's claim (SEARCH count === trialsPerFamily)", () => {
  const c = StrategyTrial.census(V32, StrategyTrial.FIXTURE_TRIAL_DIR)
  expect(c.search).toBe(StrategyTrial.trialsPerFamily(V32, StrategyTrial.FIXTURE_TRIAL_DIR))
})

function surf(over: Partial<Baseline.PositionSurface> = {}): Baseline.Surface {
  return { positions: [{ subjectKey: "a", name: "aave-v3 USDC", verdict: "SOLID", govClass: "TIMELOCK", captureTier: "REAL-at-timestamp", peg: 0.999, tvlDrawdown: 0.1, fundingNegPeriods: 2, fundingTotalPeriods: 30, ...over }], effectiveK: 2, catch: { fundingCarryCount: 0, leveredCount: 0, rwaPresent: false, totalReachable: 1 }, worstAxis: null, exitHash: "abc" }
}

test("S84 — the cadence delta facts are SPEAKABLE in BOTH registers, and EVERY line passes the advice wall + the guard (no new intent)", () => {
  const b = Baseline.pin(surf(), "2026-07-13T00:00:00Z")
  const deltas = Baseline.diff(b, surf({ govClass: "EOA", peg: 0.99, verdict: "CAUTION" }))
  for (const register of ["simple", "pro"] as const) {
    const lines = Monitor.speakDeltas(deltas, register)
    expect(lines.length).toBeGreaterThan(0)
    for (const l of lines) {
      expect({ register, l, advice: VoiceGates.advicePattern(l).advice }).toEqual({ register, l, advice: false })
      expect(Monitor.guardCycleLine(l).ok).toBe(true)
    }
    // the governance change is spoken in both registers
    expect(lines.some((l) => /governance class: TIMELOCK.*EOA.*CHANGED/i.test(l))).toBe(true)
  }
  // the registers DIFFER: Pro keeps the baseline hash + tier; Simple strips them to plain words
  const pro = Monitor.speakDeltas(deltas, "pro")
  const simple = Monitor.speakDeltas(deltas, "simple")
  expect(pro.some((l) => /baseline [0-9a-f]{8}/.test(l))).toBe(true) // Pro cites provenance
  expect(simple.every((l) => !/baseline [0-9a-f]{8}/.test(l))).toBe(true) // Simple does not
})
