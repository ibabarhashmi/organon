/**
 * WALL — UX-HONEST (S-HONEST-UX / Rule XXXVIII). A STUDIO report may simplify; it may not tilt. This wall runs the
 * narrative-honesty checker (StudioReport.check) over the renderer's output for the honest-state verdicts and asserts
 * it passes; then POSITIVE-CONTROLS the checker by feeding it seeded priming / seeded omissions and asserting it
 * FIRES. A checker that can never fail is not a wall.
 */
import { describe, test, expect } from "bun:test"
import { StudioReport } from "../../src/studio/report"
import type { Studio } from "../../src/studio/adjudicate"

// minimal StudioVerdict fixtures (display-only; no core call needed to test the RENDERER's honesty)
function fixture(verdict: string, familySize: number, extra: Record<string, unknown> = {}): Studio.StudioVerdict {
  return {
    ledgerSeq: 0,
    specHash: "abc123",
    family: { rootSeq: 0, size: familySize, trials: familySize, members: [] },
    familyDeclaredNTrials: familySize,
    attestation: { verdict, floorObs: 225, dsrAtDeclared: 0.42, rigor: { nObs: 120 }, ...extra } as any,
  }
}

describe("WALL ux_honesty_studio — reports are two-sided, mode-aware, family-visible, hedged (S-HONEST-UX)", () => {
  test("a NO-GO report renders honest (two-sided, shows family size, no priming)", () => {
    const v = fixture("NO-GO", 25, { dsrAtDeclared: 0.42 })
    const text = StudioReport.render(v)
    const r = StudioReport.check(text, v)
    expect(r.ok).toBe(true)
    expect(text).toContain("25") // the family size is visible to the user
  })

  test("an INSUFFICIENT report is a first-class CLOCKED state, hedged on the floor (not an error)", () => {
    const v = fixture("INSUFFICIENT-EVIDENCE", 3, { dsrAtDeclared: null, rigor: { nObs: 120 } })
    const text = StudioReport.render(v)
    const r = StudioReport.check(text, v)
    expect(r.ok).toBe(true)
    expect(text.toLowerCase()).toMatch(/assumed|pending/) // reachability hedged, not settled (Rule XXXVIII)
    expect(text.toLowerCase()).not.toMatch(/\berror\b|\bfailed\b/) // never dressed as an error
  })

  test("POSITIVE CONTROL — a seeded PRIMING phrase is caught", () => {
    const v = fixture("NO-GO", 10)
    const primed = StudioReport.render(v) + "\nHonestly though, this was a strong candidate that almost passed."
    const r = StudioReport.check(primed, v)
    expect(r.ok).toBe(false)
    expect(r.violations.join(" ")).toMatch(/priming/)
  })

  test("POSITIVE CONTROL — a report that HIDES the family size is caught", () => {
    const v = fixture("NO-GO", 7)
    const hidden = "VERDICT: NO-GO\nNo edge found. What could go wrong: markets change." // no family/trial count
    const r = StudioReport.check(hidden, v)
    expect(r.ok).toBe(false)
    expect(r.violations.join(" ")).toMatch(/family size/)
  })

  test("POSITIVE CONTROL — a ONE-SIDED report (no downside) is caught", () => {
    const v = fixture("CONDITIONAL", 2)
    const oneSided = "VERDICT: CONDITIONAL\nWe tested 2 trials and it looks good." // no what-could-go-wrong
    const r = StudioReport.check(oneSided, v)
    expect(r.ok).toBe(false)
    expect(r.violations.join(" ")).toMatch(/two-sided/)
  })
})
