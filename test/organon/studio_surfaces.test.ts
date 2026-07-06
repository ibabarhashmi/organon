/**
 * ORGΛNON STUDIO — the product SURFACES battery (Phase 1; Rule S-CORE surface edition). The core's honesty is
 * callable without being editable: a verdict requested through get_verdict is BYTE-IDENTICAL to the verdict the core
 * produces directly (same reproHash), the surface only adding ledger provenance. preflight is report-only (no
 * auto-refuse), forward-pending is never "performing", and the leaderboard is tier-before-performance.
 */
import { describe, test, expect } from "bun:test"
import { Ledger } from "../../src/ledger/ledger"
import { StudioSurfaces } from "../../src/studio/surfaces"
import { AttestAdjudicate } from "../../src/attest/adjudicate"

const spec = { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }
// a deterministic returns series above the floor so the core produces a real (non-INSUFFICIENT) verdict to compare.
const R = Array.from({ length: 260 }, (_, i) => 0.01 * Math.sin(i / 7) + 0.002)
const T = 1_700_000_000_000

describe("STUDIO surfaces — verdicts byte-identical through the surface (S-CORE, surface edition)", () => {
  test("get_verdict through the surface == the core adjudicator directly (same reproHash)", async () => {
    const store = new Ledger.Store()
    await StudioSurfaces.submit_spec(store, { spec, authorClass: "human", domain: "rwa", timestamp: T, returns: R, barsPerYear: 365 })
    const family = store.familySize(Ledger.hashSpec(spec))

    const throughSurface = await StudioSurfaces.get_verdict(store, spec, { returns: R, barsPerYear: 365 })
    const direct = await AttestAdjudicate.adjudicate({ id: throughSurface.specHash.slice(0, 16), spec, returns: R, declaredNTrials: family, barsPerYear: 365 })

    expect(throughSurface.attestation.reproHash).toBe(direct.reproHash) // the surface cost zero bytes of the verdict
    expect(throughSurface.attestation.verdict).toBe(direct.verdict)
  }, 30000)

  test("preflight through the surface is report-only (hedged; never auto-refuses — A-PRE)", () => {
    // a tiny well-formed panel (T×M); the point is the CONTRACT: hedged + autoRefuse folded off, refused=false.
    const panel = Array.from({ length: 40 }, (_, t) => [Math.sin(t / 3), Math.cos(t / 5), Math.sin(t / 2)])
    const r = StudioSurfaces.preflight(panel)
    expect(r.hedged).toBe(true)
    expect(r.autoRefuse).toBe(false)
    expect(r.refused).toBe(false) // reports/flags, never blocks
  })

  test("forward_status — a forward-pending strategy is NEVER 'performing' (S-HONEST-UX)", () => {
    const s = StudioSurfaces.forward_status(40, 180)
    expect(s.state).toBe("forward-pending")
    expect(s.performing).toBe(false)
    expect(s.hedge.toLowerCase()).toMatch(/assumed|unaudited/)
  })

  test("leaderboard — empty-of-GO is a correct state; tier before performance", () => {
    const board = StudioSurfaces.leaderboard([
      { id: "a", attestation: { verdict: "NO-GO", verifiability: "V0", searchHonesty: "undeclared", unconditional: false, performance: 5 } },
      { id: "b", attestation: { verdict: "CONDITIONAL", verifiability: "V2", searchHonesty: "declared", unconditional: false, performance: 0.1 } },
    ])
    expect(board.emptyOfGo).toBe(true)
    expect(board.rows[0].id).toBe("b")
  })
})
