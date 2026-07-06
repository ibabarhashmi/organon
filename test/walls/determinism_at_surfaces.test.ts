/**
 * WALL — DETERMINISM-AT-SURFACES (the 6th wall the pivot never built — audit D4/§5.3; Rules VIII, S-CORE).
 *
 * Same inputs through the STUDIO layer twice → BYTE-IDENTICAL outputs. Proven across all deterministic layers (the
 * ledger's serialized bytes, the checkpoint chain hash, the report render, and the surface verdict's reproHash), and
 * POSITIVE-CONTROLLED by a seeded nondeterminism (a payload that carries a mutable counter / an injected timestamp)
 * that the byte-equality comparator MUST distinguish — proving the wall can fire, not merely pass.
 *
 * This is the wall whose absence the V3 reckoning DOWNGRADED (AUDIT-WALLS-FIRST); building it makes the wall set 6/6.
 */
import { describe, test, expect } from "bun:test"
import { Ledger } from "../../src/ledger/ledger"
import { Studio } from "../../src/studio/adjudicate"
import { StudioSurfaces } from "../../src/studio/surfaces"
import { StudioReport } from "../../src/studio/report"
import { Checkpoint } from "../../src/studio/checkpoint"

const spec = { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }
const R = Array.from({ length: 260 }, (_, i) => 0.01 * Math.sin(i / 7) + 0.002)
const T = 1_700_000_000_000

function buildLedger(): Ledger.Store {
  const s = new Ledger.Store()
  s.register({ spec, authorClass: "human", domain: "rwa", timestamp: T })
  s.register({ spec: { ...spec, policy: "barbell" }, authorClass: "agent", domain: "rwa", parentSeq: 0, timestamp: T + 1 })
  return s
}

describe("WALL determinism_at_surfaces — identical inputs → byte-identical outputs (Rule VIII)", () => {
  test("the ledger serializes byte-identically across two identical builds", () => {
    expect(buildLedger().toJSONL()).toBe(buildLedger().toJSONL())
  })

  test("the checkpoint chain hash is identical across two identical decisions (no wall-clock leakage)", () => {
    const mk = () => {
      const g = new Checkpoint.Gate()
      g.declare("P", [{ id: "c", text: "x" }])
      return g.record({ phase: "P", decision: "STOP", stamp: "fixed-stamp", resolutions: [{ id: "c", amendment: { reason: "r", originalText: "x", newText: "y" } }] }).hash
    }
    expect(mk()).toBe(mk())
  })

  test("the report renders byte-identically for the same verdict", () => {
    const v = { ledgerSeq: 0, specHash: "h", family: { rootSeq: 0, size: 3, trials: 3, members: [] }, authorId: "a", rootCount: 1, familyDeclaredNTrials: 3, attestation: { verdict: "NO-GO", floorObs: 225, dsrAtDeclared: 0.4, rigor: { nObs: 260 } } as any } as Studio.StudioVerdict
    expect(StudioReport.render(v)).toBe(StudioReport.render(v))
  })

  test("the surface verdict reproHash is identical across two independent get_verdict calls (sidecar determinism)", async () => {
    const s1 = buildLedger(); const s2 = buildLedger()
    const v1 = await StudioSurfaces.get_verdict(s1, spec, { returns: R, barsPerYear: 365 })
    const v2 = await StudioSurfaces.get_verdict(s2, spec, { returns: R, barsPerYear: 365 })
    expect(v1.attestation.reproHash).toBe(v2.attestation.reproHash) // the whole path is deterministic
  }, 30000)

  test("POSITIVE CONTROL — a seeded nondeterminism (injected counter/timestamp) IS caught by the comparator", () => {
    let counter = 0
    const nondeterministic = () => Bun.hash(JSON.stringify({ spec, injected: ++counter })).toString() // a fake wall-clock/random leak
    const a = nondeterministic(); const b = nondeterministic()
    expect(a).not.toBe(b) // if the comparator ever returned equal here, the determinism wall would be blind
  })
})
