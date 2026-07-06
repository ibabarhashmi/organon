/**
 * WALL — the WALK LEDGER (Convergence Phase 3; C-LOOP, C-PARK). The loop's integrity mechanism must be as un-gameable
 * as the trial ledger: issues registered before fixing, an append-only hash chain that survives resolves, a park that
 * REQUIRES its four fields, and a convergence derivation that needs TWO consecutive clean cycles (one lucky quiet walk
 * proves nothing). Positive-controlled throughout — this wall would have caught the resolve() chain bug.
 */
import { describe, test, expect } from "bun:test"
import { Walk } from "../../src/studio/walk"

const seed = (l: Walk.Ledger, id: string, cycle: number) => l.register({ id, cycle, severity: "S3", cls: "UX", title: `t-${id}`, repro: "r", evidence: "e" })

describe("WALL walk_ledger — register-before-fix, chain survives resolves, park needs 4 fields (C-LOOP/C-PARK)", () => {
  test("an issue is registered OPEN and the chain verifies", () => {
    const l = new Walk.Ledger()
    seed(l, "A-1", 1)
    expect(l.openNonParked().map((i) => i.id)).toEqual(["A-1"])
    expect(l.verifyChain().ok).toBe(true)
  })

  test("resolving fixed keeps the chain intact (the resolve() payload bug regression)", () => {
    const l = new Walk.Ledger()
    seed(l, "A-1", 1); seed(l, "A-2", 1)
    l.resolve("A-1", "fixed", "did the thing")
    l.resolve("A-2", "fixed", "did the other thing")
    expect(l.verifyChain().ok).toBe(true) // resolves append cleanly; prev/hash never leak into the payload
    expect(l.openNonParked().length).toBe(0)
    expect(l.current().every((i) => i.status === "fixed")).toBe(true)
  })

  test("C-PARK — parking REQUIRES all four fields; a park missing one is refused", () => {
    const l = new Walk.Ledger()
    seed(l, "A-1", 1)
    expect(() => l.resolve("A-1", "parked", "deferred", { rationale: "architectural", impact: "", nextSteps: "later", targetSprint: "vNext" } as any)).toThrow(/four fields/)
    l.resolve("A-1", "parked", "deferred", { rationale: "architectural", impact: "affects X", nextSteps: "do Y", targetSprint: "vNext" })
    expect(l.parks().map((i) => i.id)).toEqual(["A-1"])
    expect(l.openNonParked().length).toBe(0) // a legitimately parked issue is not "open"
  })

  test("convergence needs TWO consecutive clean cycles (one clean cycle is not convergence)", () => {
    expect(Walk.converged([false, true])).toBe(false) // only the last is clean
    expect(Walk.converged([true, false, true])).toBe(false) // clean cycles not consecutive
    expect(Walk.converged([false, true, true])).toBe(true) // two in a row
  })

  test("a cycle is CLEAN iff zero new issues AND zero open non-parked", () => {
    const l = new Walk.Ledger()
    seed(l, "A-1", 1)
    expect(Walk.cycleClean(l, 1)).toBe(false) // an open issue was found in cycle 1
    l.resolve("A-1", "fixed", "fixed it")
    expect(Walk.cycleClean(l, 1)).toBe(false) // still counts as a cycle that SURFACED a new issue
    expect(Walk.cycleClean(l, 2)).toBe(true) // cycle 2 surfaced nothing new and leaves nothing open
  })
})
