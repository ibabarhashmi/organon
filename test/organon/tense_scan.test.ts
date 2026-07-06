/**
 * WALL — the claim-vs-evidence scanner (Transplant Phase 2; C-TENSE automated). The scanner must not become a rubber
 * stamp (A′#8): it FLAGS present-tense proven-state claims that carry no evidence marker and no hedge. This wall pins
 * the positive control (a seeded overclaim IS caught), that a hedged/pending claim is NOT flagged, and that an
 * evidence-carrying claim (a sha, a test path, an NNN/0 count) is NOT flagged — so the scanner discriminates.
 */
import { describe, test, expect } from "bun:test"
import { Tense } from "../../src/studio/tense"

describe("WALL tense_scan — the scanner discriminates claims from evidence (C-TENSE)", () => {
  test("POSITIVE CONTROL — a seeded overclaim (present-tense, no evidence, unhedged) is FLAGGED", () => {
    const claims = Tense.scan("The whole system is byte-identical and every check passes.")
    expect(claims.some((c) => c.flagged)).toBe(true)
  })

  test("a HEDGED claim is NOT flagged (pending / would / parked are honest non-present tense)", () => {
    for (const s of ["independence is PENDING until a stranger acts", "this would pass once the operator pushes", "the real-returns path is parked"]) {
      const claims = Tense.scan(s)
      expect(claims.every((c) => !c.flagged)).toBe(true)
    }
  })

  test("an EVIDENCE-carrying claim is NOT flagged (a sha / test path / NNN/0 count pairs it)", () => {
    for (const s of ["the battery is green: 158 pass / 0 fail", "byte-identical to the pin 58c88843cbcb", "refusal proven in test/organon/rejection_boundary.test.ts"]) {
      const claims = Tense.scan(s)
      expect(claims.some((c) => c.flagged)).toBe(false)
    }
  })

  test("a line with NO present-tense claim produces NO claim rows (the scanner is scoped, not a keyword grep)", () => {
    expect(Tense.scan("This is a heading about architecture and design choices.").filter((c) => c.flagged).length).toBe(0)
  })
})
