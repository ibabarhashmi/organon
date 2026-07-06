/**
 * WALL — TIERS-EARNED (S-TIERS / Rule XIV). A tier is EARNED, never declared. This wall proves: caller-supplied
 * returns can never reach the top (V2) tier; a payload that "claims" a tier is ignored (the classifier is a pure
 * function of the provided SHAPE + the engine's anchor); and the leaderboard sorts tier BEFORE performance, so a
 * high-performance low-tier row can never outrank a low-performance high-tier row. POSITIVE CONTROLS included.
 */
import { describe, test, expect } from "bun:test"
import { AttestClassify } from "../../src/attest/classify"
import { StudioSurfaces } from "../../src/studio/surfaces"

describe("WALL tiers_earned — a declared tier is never honored (S-TIERS)", () => {
  test("caller-supplied RETURNS-ONLY can never earn V2 (capped at V0), regardless of any claim", () => {
    // a submission that PROVIDES only a returns series and even claims a stellar Sharpe — still V0.
    const claim: any = { id: "x", returns: [0.01, 0.02, -0.01, 0.03], claimedSharpe: 9.9, declaredTier: "V2", claimedVerdict: "GO" }
    const tier = AttestClassify.classify(claim)
    expect(tier.verifiability).toBe("V0") // the fabricated `declaredTier`/`claimedVerdict` fields are simply ignored
    expect(tier.unconditionalEligible).toBe(false) // an unconditional GO needs V2 ∧ anchor-pre-registered
  })

  test("even a spec-bearing submission with a self-attested `committedAt` cannot fake pre-registration", () => {
    const spec = { family: "rwa-allocation", legs: [], rebalance: { trigger: "monthly" }, policy: "static", constraints: {} }
    const faked: any = { id: "y", spec, preRegistration: { contentHash: "deadbeef", committedAt: 1, oosStart: 2 } }
    const tier = AttestClassify.classify(faked)
    expect(tier.searchHonesty).not.toBe("pre-registered") // no engine anchor → self-attested commitment is not honored
  })

  test("leaderboard — tier BEFORE performance; a high-perf low-tier row cannot outrank a low-perf high-tier row", () => {
    const board = StudioSurfaces.leaderboard([
      { id: "flashy", attestation: { verdict: "NO-GO", verifiability: "V0", searchHonesty: "undeclared", unconditional: false, performance: 999 } },
      { id: "honest", attestation: { verdict: "CONDITIONAL", verifiability: "V1", searchHonesty: "declared", unconditional: false, performance: 0.2 } },
    ])
    expect(board.rows[0].id).toBe("honest") // tier wins over raw performance
    expect(board.emptyOfGo).toBe(true) // no unconditional GO → the correct, expected launch state (S-EMPTY-OK)
  })

  test("POSITIVE CONTROL — a caller-declared `claimedTier` on a leaderboard row is ignored by the sort", () => {
    const board = StudioSurfaces.leaderboard([
      { id: "liar", claimedTier: "GO", attestation: { verdict: "NO-GO", verifiability: "V0", searchHonesty: "undeclared", unconditional: false, performance: 1 } },
      { id: "real", attestation: { verdict: "GO", verifiability: "V2", searchHonesty: "pre-registered", unconditional: true, performance: 0.01 } },
    ])
    expect(board.rows[0].id).toBe("real") // the claimed tier bought nothing; the earned tier sorts first
    expect(board.goCount).toBe(1)
  })
})
