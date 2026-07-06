/**
 * WALL — the ATTEMPT law refuses theater (End-User Phase 0; Rule E-ATTEMPT, V9 finding 2). A pre-declared ATTEMPT
 * resolves to exactly one legible terminal. The law bites: a BLOCKED without complete, second-attempted evidence is
 * REFUSED; an ATTEMPT→DEFER without a recorded amendment is REFUSED (silence — the exact V9 sin — is impossible); a
 * DELIVERED without a differential reference is REFUSED. A clean disposition of each kind records + chains. The V9
 * renegotiation retro-file is present as a dated, append-only VALUE.
 */
import { test, expect } from "bun:test"
import { Attempt } from "../../src/studio/attempt"

const goodEvidence: Attempt.AttemptEvidence = {
  steps: ["hit the public endpoint", "parsed the response"],
  artifacts: ["data/studio/attempt-x.json"],
  exactFailure: "HTTP 451 — endpoint geoblocked",
  unblock: "a residential proxy or the paid tier",
  secondAttempt: { route: "an alternate mirror endpoint", exactFailure: "same 451 from the mirror" },
}

test("BLOCKED-with-evidence: complete + second-attempted evidence RECORDS; missing pieces are REFUSED", () => {
  const l = new Attempt.Ledger()
  expect(() => l.record({ domain: "d", declared: "ATTEMPT", disposition: "BLOCKED-with-evidence", evidence: goodEvidence, stamp: "s1" })).not.toThrow()
  // no evidence at all → refused
  expect(() => l.record({ domain: "d", declared: "ATTEMPT", disposition: "BLOCKED-with-evidence", evidence: null, stamp: "s2" })).toThrow()
  // evidence with NO second attempt → refused (A′#2 — one lazy failure is a choice)
  const noSecond = { ...goodEvidence, secondAttempt: null }
  expect(() => l.record({ domain: "d", declared: "ATTEMPT", disposition: "BLOCKED-with-evidence", evidence: noSecond, stamp: "s3" })).toThrow()
  // evidence with no artifacts → refused (a real attempt leaves a trail)
  const noArtifacts = { ...goodEvidence, artifacts: [] as string[] }
  expect(() => l.record({ domain: "d", declared: "ATTEMPT", disposition: "BLOCKED-with-evidence", evidence: noArtifacts, stamp: "s4" })).toThrow()
})

test("ATTEMPT→DEFER: silence is REFUSED; a recorded amendment RECORDS", () => {
  const l = new Attempt.Ledger()
  // DEFER with no amendment → refused (the V9 sin: a quiet renegotiation)
  expect(() => l.record({ domain: "d", declared: "ATTEMPT", disposition: "DEFER", stamp: "s1" })).toThrow()
  // DEFER with a proper amendment → records
  expect(() => l.record({ domain: "d", declared: "ATTEMPT", disposition: "DEFER", amendment: { reason: "genuinely out of scope this sprint", from: "ATTEMPT", to: "DEFER" }, stamp: "s2" })).not.toThrow()
})

test("DELIVERED: a differential reference is REQUIRED (a delivery without its proof is a Halt)", () => {
  const l = new Attempt.Ledger()
  expect(() => l.record({ domain: "d", declared: "DELIVER", disposition: "DELIVERED", stamp: "s1" })).toThrow()
  expect(() => l.record({ domain: "d", declared: "DELIVER", disposition: "DELIVERED", deliveredDifferential: "data/studio/differential-x.json", stamp: "s2" })).not.toThrow()
})

test("the ledger chains + the V9 retro-file is a dated append-only value; openIssues() is empty on a legal ledger", () => {
  const l = new Attempt.Ledger()
  const filed = Attempt.retroFileV9(l)
  expect(filed.length).toBe(2)
  expect(filed[0].domain).toMatch(/funding/)
  expect(filed[0].disposition).toBe("DEFER")
  expect(filed[0].amendment).not.toBeNull()
  expect(l.verifyChain().ok).toBe(true)
  expect(l.openIssues().length).toBe(0) // the ledger refuses illegal appends → a committed ledger is open-free
})
