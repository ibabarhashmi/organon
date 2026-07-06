/**
 * WALL — SYNTHETIC-GO FIXTURE + LEAK (audit D-P; Rules S-EMPTY-OK, S-HONEST-UX). The first-acceptance path is tested
 * BEFORE it can ever happen in public: a clearly-labeled synthetic GO verdict is golden-rendered (so the GO rendering
 * is honest before a real GO exists), while a wall proves that synthetic GO can NEVER be counted as a real GO on the
 * leaderboard, nor rendered without its SYNTHETIC banner. POSITIVE CONTROLS: a real (non-synthetic) GO IS counted; a
 * synthetic GO is not; the banner is present iff synthetic.
 */
import { describe, test, expect } from "bun:test"
import { StudioSurfaces } from "../../src/studio/surfaces"
import { StudioReport } from "../../src/studio/report"
import type { Studio } from "../../src/studio/adjudicate"

// the synthetic GO fixture — clearly labeled engine-synthetic; exists ONLY so the GO path is honest before one occurs.
function syntheticGoVerdict(): Studio.StudioVerdict {
  return {
    ledgerSeq: 0, specHash: "SYNTHETIC", family: { rootSeq: 0, size: 1, trials: 1, members: [] }, authorId: "fixture", rootCount: 1, familyDeclaredNTrials: 1,
    attestation: { verdict: "GO", verifiability: "V2", searchHonesty: "pre-registered", unconditional: true, synthetic: true, floorObs: 225, dsrAtDeclared: 0.99, rigor: { nObs: 260 } } as any,
  }
}

describe("WALL fixture_leak — a synthetic GO renders honestly but cannot leak into a real count", () => {
  test("the synthetic GO renders with its SYNTHETIC banner (honest GO path, before a real GO exists)", () => {
    const text = StudioReport.render(syntheticGoVerdict())
    expect(text).toContain("SYNTHETIC TEST FIXTURE")
    expect(text).toContain("VERDICT: GO") // the GO rendering itself works — proven on labeled test data
  })

  test("a real verdict carries NO synthetic banner (the banner is not spuriously everywhere)", () => {
    const real = { ...syntheticGoVerdict(), attestation: { ...syntheticGoVerdict().attestation, verdict: "NO-GO", synthetic: false } } as Studio.StudioVerdict
    expect(StudioReport.render(real)).not.toContain("SYNTHETIC TEST FIXTURE")
  })

  test("POSITIVE CONTROL — a SYNTHETIC GO row cannot be counted as a real GO on the leaderboard (leak blocked)", () => {
    const board = StudioSurfaces.leaderboard([
      { id: "synthetic-go", synthetic: true, attestation: { verdict: "GO", verifiability: "V2", searchHonesty: "pre-registered", unconditional: true, performance: 2 } },
    ])
    expect(board.goCount).toBe(0) // the synthetic GO did NOT leak into the count
    expect(board.emptyOfGo).toBe(true) // the launch board stays proudly empty-of-GO
  })

  test("POSITIVE CONTROL — a REAL GO row IS counted (the exclusion is specific to synthetic, not a blanket zero)", () => {
    const board = StudioSurfaces.leaderboard([
      { id: "real-go", attestation: { verdict: "GO", verifiability: "V2", searchHonesty: "pre-registered", unconditional: true, performance: 0.1 } },
    ])
    expect(board.goCount).toBe(1)
    expect(board.emptyOfGo).toBe(false)
  })
})
