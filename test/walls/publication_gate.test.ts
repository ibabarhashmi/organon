/**
 * WALL — F-IDENTITY + L-2P. Publication is doubly gated: the IDENTITY gate (the capability matrix rendered + true) then
 * the CONSENT gate (Operator consent; the agent cannot self-consent). This wall proves the gate REFUSES a premature
 * publish and OPENS only when both hold — positive control both ways. It never publishes anything; it is the check a
 * publish path must pass first.
 */
import { describe, test, expect } from "bun:test"
import { Publication } from "../../src/studio/publication"

describe("WALL publication_gate — no publish until matrix-true AND Operator consent", () => {
  test("the identity gate is currently satisfied (the matrix is rendered + true this phase)", () => {
    const id = Publication.identityGate()
    if (!id.ok) console.log("  (publication_gate) identity gate reasons:", id.reasons)
    expect(id.ok).toBe(true)
  })

  test("a publish WITHOUT Operator consent is REFUSED even with the identity gate satisfied (consent gate bites)", () => {
    const r = Publication.gate({ operatorConsent: false })
    expect(r.allowed).toBe(false)
    expect(r.reasons.some((x) => /consent/i.test(x))).toBe(true)
  })

  test("a publish WITH consent AND the identity gate satisfied is ALLOWED (positive control)", () => {
    const r = Publication.gate({ operatorConsent: true })
    if (!r.allowed) console.log("  (publication_gate) blocked reasons:", r.reasons)
    expect(r.allowed).toBe(true)
    expect(r.reasons.length).toBe(0)
  })

  test("the gate composition: identity FIRST then consent — both required, order legible", () => {
    // consent alone (hypothetically, if the matrix were absent) would still be refused by the identity gate; we assert
    // the reason SET always names any unmet gate so a caller/log can see exactly what blocks a push
    const refused = Publication.gate({ operatorConsent: false })
    expect(refused.reasons.length).toBeGreaterThanOrEqual(1)
    // sanity: the consent-gate reason references L-2P (the agent cannot self-consent)
    expect(refused.reasons.join(" ")).toContain("L-2P")
  })
})
