/**
 * ORGΛNON STUDIO — the analyst GRAPH battery (Phase 5; Rules S-PROPOSE, S-HONEST-UX, S-FREE). Proves the full
 * goal→verdict path on FIXTURES (zero live inference): NL intake elicits and never comforts; analysts must ground;
 * the debate produces rationales not verdicts; pre-flight-first withholds unless justified; reflection carries the
 * prior failureMode; and the relay returns the core verdict verbatim. The ONE live free-model run is DEFERRED and
 * recorded PENDING (no free-model endpoint/key in this environment) — never simulated.
 */
import { describe, test, expect } from "bun:test"
import { Ledger } from "../../src/ledger/ledger"
import { StudioGraph } from "../../src/studio/graph"
import type { StudioAgents } from "../../src/studio/agents"

const snap: StudioAgents.Snapshot = {
  sources: ["defillama", "fred"],
  data: { tvlUsdB: { value: 5.2, provenance: { source: "defillama", fetchedAt: 1, pit: true } } },
}
const narr = (v: number): StudioAgents.Narrative => ({ text: `figure ${v}`, numbers: [{ key: "tvlUsdB", value: v }] })
const narratives = { yield: narr(5.2), rates: narr(5.2), funding: narr(5.2), "protocol-risk": narr(5.2) } as Record<StudioGraph.AnalystRole, StudioAgents.Narrative>
const spec = { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }
const R = Array.from({ length: 260 }, (_, i) => 0.01 * Math.sin(i / 7) + 0.002)

describe("STUDIO graph — NL intake elicits, never comforts (S-HONEST-UX)", () => {
  test("intake prose passes the honesty gate (restates goal + constraints + honest caveat)", () => {
    const i = StudioGraph.intake("earn stable yield on USDC", "rwa", ["max 20% per leg"])
    expect(StudioGraph.intakeIsHonest(i).ok).toBe(true)
  })
  test("POSITIVE CONTROL — a comfort phrase in intake prose is caught", () => {
    const bad = { ...StudioGraph.intake("x", "rwa", []), prose: "Don't worry, this is a sure thing that will make you money." }
    expect(StudioGraph.intakeIsHonest(bad).ok).toBe(false)
  })
})

describe("STUDIO graph — analysts ground, debate cannot adjudicate (S-PROPOSE)", () => {
  test("grounded analysts pass; the debate produces rationales, not a verdict", () => {
    const { grounded } = StudioGraph.analysts(snap, narratives)
    expect(grounded).toBe(true)
    const d = StudioGraph.debate("carry looks positive", "but the peg risk is real")
    expect(d.producesVerdict).toBe(false)
    expect(d).not.toHaveProperty("verdict")
  })
  test("pre-flight-first: a flagged domain is WITHHELD without a justification, PROCEEDS with one (A-PRE)", () => {
    expect(StudioGraph.preflightGate(false).proceed).toBe(false)
    expect(StudioGraph.preflightGate(false, "user explicitly accepts the low-power domain for research").proceed).toBe(true)
    expect(StudioGraph.preflightGate(true).proceed).toBe(true)
  })
})

describe("STUDIO graph — end-to-end goal→verdict on fixtures (GOAL-TO-VERDICT)", () => {
  test("NL goal → registered spec → verbatim verdict → honest report", async () => {
    const store = new Ledger.Store()
    const run = await StudioGraph.runGoalToVerdict(store, {
      goal: "stable carry on USDC", domain: "rwa", constraints: ["max 20%/leg"], snapshot: snap, narratives,
      spec, bull: "positive carry", bear: "peg risk", extras: { returns: R, barsPerYear: 365, timestamp: 1_700_000_000_000 },
    })
    expect(store.has(Ledger.hashSpec(spec))).toBe(true) // the composer registered a trial
    expect(["NO-GO", "CONDITIONAL", "INSUFFICIENT-EVIDENCE", "CANNOT-VERIFY-SEARCH"]).toContain(run.verdict.attestation.verdict)
    expect(run.report).toContain("What could still go wrong") // the report is two-sided
    expect(StudioGraph.intakeIsHonest(run.intake).ok).toBe(true)
  }, 30000)

  test("an UNGROUNDED analyst narrative withholds the proposal (S-PROPOSE)", async () => {
    const store = new Ledger.Store()
    const badNarr = { ...narratives, yield: { text: "secret alpha 99.9", numbers: [{ key: "tvlUsdB", value: 5.2 }] } as StudioAgents.Narrative }
    await expect(
      StudioGraph.runGoalToVerdict(store, { goal: "x", domain: "rwa", constraints: [], snapshot: snap, narratives: badNarr, spec, bull: "a", bear: "b", extras: { returns: R, barsPerYear: 365, timestamp: 1 } }),
    ).rejects.toThrow(/ungrounded/)
  })

  test("reflection carries the prior failureMode into the next family's prompt", async () => {
    const store = new Ledger.Store()
    const run = await StudioGraph.runGoalToVerdict(store, { goal: "x", domain: "rwa", constraints: [], snapshot: snap, narratives, spec, bull: "a", bear: "b", extras: { returns: R, barsPerYear: 365, timestamp: 1 } })
    const reflection = StudioGraph.reflect(run.verdict)
    expect(reflection).toMatch(/engine last returned/)
    expect(reflection.toLowerCase()).toMatch(/mechanism|more data/) // it points away from re-iterating the same idea
  }, 30000)
})
