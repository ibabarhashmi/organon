/**
 * WALL — L-GATE2 + L-RECON (Gatekeeper v2). The V4 failure mode — a well-documented amendment converting a mandated
 * STOP into an ADVANCE — is closed by construction: a make-or-break GATE criterion is UNAMENDABLE. An amendment on a
 * gate can record STOP or REPEAT, never ADVANCE. And the criteria set is loadable ONLY by a matching pin (a hand-edited
 * set is void). Positive-controlled on both.
 */
import { describe, test, expect } from "bun:test"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { Checkpoint } from "../../src/studio/checkpoint"
import { Criteria } from "../../src/studio/criteria"

const dir = mkdtempSync(path.join(tmpdir(), "gv2-"))
const ev = path.join(dir, "ev.txt")
writeFileSync(ev, "live-run recorded\n")

function gate() {
  const g = new Checkpoint.Gate()
  g.declare("P", [
    { id: "LIVE-RUN", text: "the live run is recorded", gate: true },
    { id: "notes", text: "some non-gate note", gate: false },
  ])
  return g
}

describe("WALL gatekeeper_v2 — gate criteria are UNAMENDABLE (L-GATE2)", () => {
  test("POSITIVE CONTROL — amending a GATE criterion cannot record ADVANCE (the V4 move is refused)", () => {
    expect(() =>
      gate().record({ phase: "P", decision: "ADVANCE", stamp: "t", resolutions: [
        { id: "LIVE-RUN", amendment: { reason: "no endpoint", originalText: "the live run is recorded", newText: "pending" } },
        { id: "notes", evidence: Checkpoint.pin(ev) },
      ] }),
    ).toThrow(/UNAMENDABLE/)
  })

  test("a gate criterion with hash-resolving EVIDENCE advances normally", () => {
    const g = gate()
    const rec = g.record({ phase: "P", decision: "ADVANCE", stamp: "t", resolutions: [
      { id: "LIVE-RUN", evidence: Checkpoint.pin(ev) },
      { id: "notes", evidence: Checkpoint.pin(ev) },
    ] })
    expect(rec.decision).toBe("ADVANCE")
  })

  test("an amendment on a gate CAN record STOP or REPEAT (the honest outcomes)", () => {
    const g = gate()
    const rec = g.record({ phase: "P", decision: "REPEAT", stamp: "t", resolutions: [{ id: "LIVE-RUN", amendment: { reason: "awaiting operator unblock", originalText: "the live run is recorded", newText: "pending" } }] })
    expect(rec.decision).toBe("REPEAT") // reality is waited for, not papered over
  })

  test("a NON-gate criterion is still amendable (v4 discipline preserved for non-gates)", () => {
    const g = gate()
    const rec = g.record({ phase: "P", decision: "ADVANCE", stamp: "t", resolutions: [
      { id: "LIVE-RUN", evidence: Checkpoint.pin(ev) },
      { id: "notes", amendment: { reason: "descoped detail", originalText: "some non-gate note", newText: "trimmed" } },
    ] })
    expect(rec.criteria.find((c) => c.id === "notes")?.status).toBe("amended")
  })
})

describe("WALL gatekeeper_v2 — criteria pinned to the blueprint (L-RECON)", () => {
  test("the criteria set matches the blueprint pin when present; absence is disclosed, not failed (blueprints are gitignored)", () => {
    const m = Criteria.blueprintMatchesPin()
    if (m.present) {
      expect(m.ok).toBe(true) // present ⇒ MUST match the pin (a present-but-mismatched blueprint is a real integrity failure)
    } else {
      console.log(`  (gatekeeper_v2) blueprint absent — pin provenance not checkable here (fresh-clone/gitignored): ${m.detail}`)
    }
  })
  test("loadPinned accepts the matching criteria hash and REFUSES a mismatched one (a hand-edited set is void)", () => {
    const good = Criteria.criteriaSha()
    expect(Criteria.loadPinned(good)["phase-4"][0].id).toBe("LIVE-RUN")
    expect(() => Criteria.loadPinned("0".repeat(64))).toThrow(/mismatch/)
  })
  test("every make-or-break gate from the blueprint is present + flagged", () => {
    const gates = Object.values(Criteria.CRITERIA).flat().filter((c) => c.gate).map((c) => c.id)
    for (const g of ["TRUE-START", "LEDGER-PERSISTS", "CLOCKS-TICKING", "BATTERIES-WHOLE", "LIVE-RUN", "DOORS-OPEN", "PRODUCT-LOOP"]) expect(gates).toContain(g)
  })
})
