/**
 * ORGΛNON STUDIO — the FORWARD CLOCKS battery (Phase 1; Rule H-CLOCK). Two honest states only: INTACT (stamp verifies
 * against its pin) or RESTARTED (evidence unverifiable → count from zero, discontinuity displayed). Every path that
 * could ACCEPT a rebuilt stamp is a Halt — proven by positive controls: a self-declared reconstruction, a nonce-less
 * stamp (recomputable from data alone), and a hand-built stamp all refuse. This is the audit's gravest finding closed.
 */
import { describe, test, expect } from "bun:test"
import { Clocks } from "../../src/studio/clocks"
import { StudioSurfaces } from "../../src/studio/surfaces"

function legitStamp(domain: string): Clocks.ForwardStamp {
  const base = { domain, capturedAt: 1_700_000_000_000, nonce: "capture-secret-xyz", payloadSha: "abcd" }
  return { ...base, sha: Clocks.stampSha(base) }
}

describe("STUDIO clocks — intact verifies, evidence-absent restarts (H-CLOCK)", () => {
  test("an INTACT stamp verifies against its pin", () => {
    const s = legitStamp("lending")
    const c = Clocks.verifyClock("lending", s.sha, s, "2026-07-04")
    expect(c.state).toBe("intact")
  })

  test("ABSENT evidence (no stamp) → RESTARTED with a displayed discontinuity, prior time not credited", () => {
    const c = Clocks.verifyClock("fee-yield", null, null, "2026-07-04")
    expect(c.state).toBe("restarted")
    if (c.state === "restarted") {
      expect(c.discontinuity.priorEvidenceUnverifiable).toBe(true)
      expect(Clocks.renderState(c)).toContain("CLOCK RESTARTED")
    }
  })
})

describe("STUDIO clocks — reconstruction is a Halt (never rebuild the track record, H-CLOCK)", () => {
  test("POSITIVE CONTROL — a self-declared RECONSTRUCTED stamp is refused", () => {
    const s = { ...legitStamp("funding"), reconstructed: true }
    expect(() => Clocks.detectReconstruction(s)).toThrow(Clocks.ReconstructionHalt)
  })

  test("POSITIVE CONTROL — a NONCE-LESS stamp (recomputable from data alone) is refused", () => {
    const base = { domain: "funding", capturedAt: 1, nonce: "", payloadSha: "abcd" }
    const s = { ...base, sha: Clocks.stampSha(base) }
    expect(() => Clocks.detectReconstruction(s)).toThrow(/no capture nonce/)
  })

  test("POSITIVE CONTROL — a HAND-BUILT stamp (self-sha mismatch) is refused", () => {
    const s = { ...legitStamp("funding"), sha: "0".repeat(64) }
    expect(() => Clocks.detectReconstruction(s)).toThrow(/self-sha mismatch/)
  })

  test("verifyClock refuses a reconstructed stamp BEFORE honoring it", () => {
    const s = { ...legitStamp("lending"), reconstructed: true }
    expect(() => Clocks.verifyClock("lending", s.sha, s, "2026-07-04")).toThrow(Clocks.ReconstructionHalt)
  })
})

describe("STUDIO clocks — the discontinuity DISPLAYS in forward_status (H-CLOCK)", () => {
  test("forward_status of a restarted clock is a first-class state: observed=0, discontinuity present, never 'performing'", () => {
    const restarted = Clocks.verifyClock("fee-yield", null, null, "2026-07-04")
    const fs = StudioSurfaces.forward_status(999, 225, restarted) // even with a bogus prior count, restart credits ZERO
    expect(fs.state).toBe("restarted")
    expect(fs.observed).toBe(0)
    expect(fs.performing).toBe(false)
    expect(fs.discontinuity?.priorEvidenceUnverifiable).toBe(true)
    expect(fs.hedge).toContain("CLOCK RESTARTED")
  })
})
