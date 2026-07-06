/**
 * ORGΛNON — Explanation Phase 3 walls (WHY-TRUE; X-ONE, X-FACTS, X-GROUND). Every terminal state explained in BOTH
 * registers from ONE fact table (completeness-censused; a seeded omission caught); the two registers consistency-checked
 * (a drift + a consoling template caught); the groundedness verifier rejects an embellishment + an added causal story
 * WHOLESALE with deterministic fallback (a faithful paraphrase passes, labeled). The panel READS the verdict, never moves it.
 */
import { test, expect } from "bun:test"
import path from "node:path"
import { readFileSync } from "node:fs"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Explain } from "../../src/analytics/explain"
import { Console } from "../../src/studio/console"
import { Ratify } from "../../src/studio/ratify"

const D = path.join(PKG_ROOT, "data", "studio")
const T = 1_735_689_600_000

function facts(state: Explain.TerminalState): Explain.VerdictFacts {
  const base = { dsrThreshold: 0.95, familyDeclaredNTrials: 38, tier: "V0", nObs: 400, reality: "REAL-PIT" as const, provenanceRef: "abc123def0", reproHash: "repro00000" }
  const m: Record<Explain.TerminalState, Explain.VerdictFacts> = {
    "GO": { ...base, terminalState: "GO", verdict: "GO", dsrAtDeclared: 0.972 },
    "NO-GO": { ...base, terminalState: "NO-GO", verdict: "NO-GO", dsrAtDeclared: 0.42 },
    "CONDITIONAL": { ...base, terminalState: "CONDITIONAL", verdict: "CONDITIONAL", dsrAtDeclared: 0.96 },
    "INSUFFICIENT": { ...base, terminalState: "INSUFFICIENT", verdict: "INSUFFICIENT-EVIDENCE", dsrAtDeclared: null, nObs: 90 },
    "BLOCKED": { ...base, terminalState: "BLOCKED", verdict: "BLOCKED", dsrAtDeclared: null, nObs: null, reality: "BLOCKED", provenanceRef: null, stateReason: "the RWA data is credential-gated and absent here" },
    "MALFORMED": { ...base, terminalState: "MALFORMED", verdict: "MALFORMED", dsrAtDeclared: null, nObs: null, stateReason: "the policy enum was invalid" },
    "kill-switch": { ...base, terminalState: "kill-switch", verdict: "NO-GO", dsrAtDeclared: null, nObs: null, killSwitchReason: "1 pooled-noise survivor passed the deflation — the composer is disabled pending an owner decision" },
  }
  return m[state]
}

// ── X-FACTS: the fact table is complete or it says why not ──
test("the fact table is completeness-censused for every terminal state; a seeded omission is CAUGHT", () => {
  for (const state of Explain.TEMPLATE_STATES) {
    const table = Explain.factTable(facts(state))
    expect(Explain.factTableCensus(table).ok, `${state} census`).toBe(true)
    // POSITIVE CONTROL: dropping the verdict field from all coverage is caught
    const seeded = Explain.factTableCensus(table, { omit: "verdict" })
    expect(seeded.seededOmissionCaught, `${state} seeded omission`).toBe(true)
    expect(seeded.ok).toBe(false)
  }
})

test("the fact-table row schema is the pinned schema", () => {
  const pins = JSON.parse(readFileSync(path.join(D, "phase0-pins-v14.json"), "utf8"))
  expect(Explain.FACT_ROW_SCHEMA).toEqual(pins.whyGroundRules.factTableRowSchema as unknown as typeof Explain.FACT_ROW_SCHEMA)
})

// ── X-ONE: two registers, zero drift ──
test("every terminal state is explainable in BOTH registers, consistency-checked (no orphan claim, no drift)", () => {
  for (const state of Explain.TEMPLATE_STATES) {
    const f = facts(state)
    const table = Explain.factTable(f)
    const plain = Explain.plainLanguage(f)
    const quant = Explain.quantitative(table)
    expect(plain.length, `${state} plain`).toBeGreaterThan(0)
    expect(quant, `${state} quant`).toContain("WHY (quantitative)")
    const c = Explain.consistency(plain, table)
    expect(c.ok, `${state}: ${c.violations.join("; ")}`).toBe(true)
  }
})

test("POSITIVE CONTROL: a register drift (an orphan number) and a consoling template are CAUGHT", () => {
  const table = Explain.factTable(facts("NO-GO"))
  expect(Explain.consistency("The significance was 0.777 which nobody computed.", table).ok).toBe(false) // orphan number
  expect(Explain.consistency("You were so close — almost passed!", table).ok).toBe(false) // consoling
})

// ── X-GROUND: the LLM phrases; the verifier decides ──
test("the groundedness verifier passes a faithful paraphrase and REJECTS an embellishment + an added causal story WHOLESALE", () => {
  const f = facts("NO-GO")
  const table = Explain.factTable(f)
  const plain = Explain.plainLanguage(f)
  // faithful (= the deterministic text) passes and is labeled
  const faithful = Explain.paraphraseGated(plain, table, { rephrase: (d) => d })
  expect(faithful.aiPhrased).toBe(true)
  expect(faithful.rendered).toContain("AI-phrased · verified against engine facts")
  // embellishment rejects wholesale → deterministic fallback (the plain text renders instead)
  const emb = Explain.paraphraseGated(plain, table, { rephrase: () => "It comfortably cleared the bar by a wide margin." })
  expect(emb.aiPhrased).toBe(false)
  expect(emb.rendered).toBe(plain)
  expect(emb.verification.rejected).toBe(true)
  // an added causal story ("because markets were volatile") rejects (the LLM may not add reasoning)
  const causal = Explain.paraphraseGated(plain, table, { rephrase: () => "Refused because markets were volatile." })
  expect(causal.aiPhrased).toBe(false)
  expect(causal.verification.rejected).toBe(true)
  // a wrong number rejects
  expect(Explain.verifyGroundedness("Its significance was 0.99 over 100 attempts.", table).rejected).toBe(true)
})

test("availability: a dead paraphraser mid-render falls back to the deterministic text", () => {
  const f = facts("NO-GO"); const table = Explain.factTable(f); const plain = Explain.plainLanguage(f)
  const dead = Explain.paraphraseGated(plain, table, { rephrase: () => { throw new Error("model unavailable") } })
  expect(dead.aiPhrased).toBe(false)
  expect(dead.rendered).toBe(plain)
})

// ── the WHY panel renders through the console (a real NO-GO in both registers) ──
test("the WHY panel renders on a real verdict through the console — plain always, quant + raw table behind the pro toggle", async () => {
  const r = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, T)
  const plainOnly = Console.renderResult(r)
  expect(plainOnly).toContain("WHY (plain)")
  expect(plainOnly).not.toContain("WHY (quantitative)") // quant is behind the pro toggle
  const pro = Console.renderResult(r, { pro: true })
  expect(pro).toContain("WHY (quantitative)")
  expect(pro).toContain("raw fact table")
  // the panel is consistent with the fact table (the plain claims map to rows, numbers exact)
  expect(Explain.consistency(Explain.plainLanguage(r.facts!), Explain.factTable(r.facts!)).ok).toBe(true)
})

// ── the WHY panel is ratified (explain.ts is under the scan) ──
test("the WHY panel is ADOPT-ratified in the v14 chain and no analytics surface is unratified", () => {
  const { entries } = Ratify.load(path.join(D, "research-ratification-v14.json"))
  expect(Ratify.artifactRatified(entries, "src/analytics/explain.ts")).toBe(true)
  expect(Ratify.unratifiedArtifacts(entries)).toEqual([])
})

// ── the golden set committed ──
test("the committed golden set records every terminal state explainable + the verifier controls green", () => {
  const g = JSON.parse(readFileSync(path.join(D, "phase3-why-true-v14.json"), "utf8"))
  expect(g.dualRegisters.everyTerminalStateExplainable).toBe(true)
  expect(g.factTableCensus.seededOmissionCaught).toBe(true)
  expect(g.groundednessVerifier.faithfulPasses).toBe(true)
  expect(g.groundednessVerifier.embellishmentRejected).toBe(true)
  expect(g.groundednessVerifier.causalRejected).toBe(true)
})
