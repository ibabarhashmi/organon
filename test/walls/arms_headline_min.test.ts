/**
 * WALL — C-ARMS (Convergence). The V5 audit named a silent governance construct: a phase with a REPEAT arm and an
 * ADVANCE arm was headlined ADVANCE ("ADVANCE on the built machinery"). This sprint ratifies arms but binds them:
 * a phase's headline decision is the MINIMUM of its arms (worst wins) — a REPEAT arm can NEVER be outvoted. This wall
 * proves the rule holds and that gate criteria are never split into arms (arms are pre-declared, non-gate).
 */
import { describe, test, expect } from "bun:test"
import { Checkpoint } from "../../src/studio/checkpoint"
import { Criteria } from "../../src/studio/criteria"

describe("WALL arms_headline_min — headline = MIN(arms), a REPEAT arm is never outvoted (C-ARMS)", () => {
  test("all-ADVANCE → ADVANCE", () => {
    expect(Checkpoint.headlineFromArms(["ADVANCE", "ADVANCE", "ADVANCE"])).toBe("ADVANCE")
  })

  test("one REPEAT among ADVANCEs → REPEAT (the exact V5 move, now refused)", () => {
    expect(Checkpoint.headlineFromArms(["ADVANCE", "REPEAT", "ADVANCE"])).toBe("REPEAT")
    // the six walk-cycle arms with a single failing arm:
    expect(Checkpoint.headlineFromArms(["ADVANCE", "ADVANCE", "ADVANCE", "ADVANCE", "ADVANCE", "REPEAT"])).toBe("REPEAT")
  })

  test("STOP dominates everything; REGRESS beats REPEAT/ADVANCE for the brake", () => {
    expect(Checkpoint.headlineFromArms(["ADVANCE", "REPEAT", "STOP"])).toBe("STOP")
    expect(Checkpoint.headlineFromArms(["ADVANCE", "REGRESS", "REPEAT"])).toBe("REGRESS")
  })

  test("an empty arm list is a caller error (a phase reporting arms must declare them)", () => {
    expect(() => Checkpoint.headlineFromArms([])).toThrow(/must declare at least one arm/)
  })

  test("pre-declared arms are non-gate; gate criteria are never split into arms", () => {
    // the walk cycle's arms, pinned in the criteria manifest
    const arms = Criteria.CONVERGENCE_ARMS["phase-3-cycle"]
    expect(arms).toEqual(["RUN", "IDENTIFY", "FIX", "QA", "RED-TEAM", "RE-EVALUATE"])
    // no arm id collides with a gate criterion id in phase-3 (gates never split)
    const gateIds = new Set(Criteria.CONVERGENCE["phase-3"].filter((c) => c.gate).map((c) => c.id))
    for (const a of arms) expect(gateIds.has(a)).toBe(false)
    expect(gateIds.has("CONVERGED")).toBe(true) // the gate exists and is not an arm
  })
})
