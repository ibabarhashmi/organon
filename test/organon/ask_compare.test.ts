/**
 * ORGΛNON — THE INTERPRETER SPRINT, Phase 4 wall (COMPARE; X-INTERPRET e, S43). COMPARE lays ALL n strategies' facts
 * side by side (the pre-render truncation to two is dead) + ONE comparative REASONING block that explains the tradeoff
 * (not n restatements), every number tracing, every direction matching, parity held, no-key parity honest.
 */
import { test, expect } from "bun:test"
import { Ask } from "../../src/ask/answer"
import { AskPhrase } from "../../src/ask/phrase"
import { AskProvider } from "../../src/ask/provider"
import { VoiceContract } from "../../src/ask/contract"

const NOW = Date.parse("2026-07-08T00:00:00Z")

test("COMPARE — an oversized COMPARE lays ALL n strategies side by side (Simple no longer truncates to the first two)", async () => {
  const q = "compare aave-v3 USDC, compound-v3 USDC and sparklend DAI"
  const s = await Ask.answer(q, { register: "simple", now: NOW })
  expect(s.intent.kind).toBe("COMPARE")
  const names = s.result.meta.names as string[]
  expect(names.length).toBe(3)
  for (const n of names) expect(s.text).toContain(n) // every strategy appears — the 3rd is NOT dropped (the old bug)
  // Pro shows all n too (via the machine-derived summary)
  const p = await Ask.answer(q, { register: "pro", now: NOW })
  for (const n of names) expect(p.text).toContain(n)
})

test("COMPARE — ONE comparative REASONING block (the tradeoff), not n restatements; parity holds (renderText === a.text)", async () => {
  const a = await Ask.answer("aave-v3 USDC vs compound-v3 USDC", { register: "pro", now: NOW })
  // parity: no-AI COMPARE renders to exactly a.text (the FACT surface carries the n side-by-side verdicts)
  const det = VoiceContract.compose(a, null)
  expect(VoiceContract.renderText(det.blocks)).toBe(a.text)
  // a single comparative interpretation (names an axis + the tradeoff) → ONE REASONING block
  const comparative = "Both hold durable base yield, but aave-v3 USDC carries the steadier deposit trend while compound-v3 USDC shows the softer peg — the tradeoff is stability of size versus the reward mix, on REAL recorded data."
  const c = VoiceContract.compose(a, comparative, VoiceContract.comparisonsFor(a))
  const reasoning = c.blocks.filter((b) => b.tier === "REASONING")
  expect(reasoning.length).toBe(1) // ONE comparative block, never n restatements
})

test("COMPARE — a REVERSED comparison is rejected (the comparison-direction gate holds over n entities)", async () => {
  // synthetic COMPARE fact set with an unambiguous severity ordering: A SOLID (safer) vs B AVOID (riskier)
  const result = {
    tool: "compare", ok: true as const, reality: "REAL" as const,
    facts: [{ id: "aVerdict", name: "a verdict", value: "SOLID", threshold: null, comparator: null, outcome: "info", contribution: "deciding", provenanceRef: null },
            { id: "bVerdict", name: "b verdict", value: "AVOID", threshold: null, comparator: null, outcome: "info", contribution: "deciding", provenanceRef: null }],
    summary: "alpha → SOLID (REAL) vs beta → AVOID (REAL).", meta: { names: ["alpha", "beta"], verdicts: ["SOLID", "AVOID"], aName: "alpha", aVerdict: "SOLID", bName: "beta", bVerdict: "AVOID" },
  }
  const a = { query: "alpha vs beta", register: "pro" as const, intent: { kind: "COMPARE", raw: "alpha vs beta" } as Ask.AskAnswer["intent"], result, text: result.summary }
  // the facts have beta RISKIER than alpha (AVOID > SOLID severity); a claim that alpha is riskier REVERSES it → rejected
  const reversed = VoiceContract.compose(a, "On the counterparty axis, alpha is riskier than beta given the recorded structure.", VoiceContract.comparisonsFor(a))
  expect(reversed.aiUsed).toBe(false)
  expect(reversed.rejected).toBe(true)
  expect(reversed.reasons.join(" ")).toMatch(/reversed a comparison|comparison/i)
})

test("COMPARE — a smuggled number in a comparative block STILL rejects (every number must trace)", async () => {
  const a = await Ask.answer("aave-v3 USDC vs compound-v3 USDC", { register: "pro", now: NOW })
  const smuggled = VoiceContract.compose(a, "aave-v3 USDC out-yields compound-v3 USDC by a clean 3.4 percentage points on durable base.", VoiceContract.comparisonsFor(a))
  expect(smuggled.aiUsed).toBe(false)
  expect(smuggled.reasons.join(" ")).toMatch(/unmatched number|3\.4/)
})

test("COMPARE — no-key parity: the deterministic side-by-side comparison is honest, never a crash (AI-off)", async () => {
  const p = await AskPhrase.phraseGrounded(await Ask.answer("aave-v3 USDC vs compound-v3 USDC", { register: "simple", now: NOW }), null)
  expect(p.aiPhrased).toBe(false)
  expect(p.text).toMatch(/looks/) // the plain side-by-side verdicts
  expect(p.text.length).toBeGreaterThan(0)
})

test("COMPARE — the rendered /ask surface carries ALL entities (nothing dropped server-side; the CSS flow prevents a clip)", async () => {
  const { Reality } = await import("../../src/studio/reality")
  const a = await Ask.answer("compare aave-v3 USDC, compound-v3 USDC and sparklend DAI", { register: "simple", now: NOW })
  const html = Reality.renderAsk({ query: a.query, register: "simple", raw: false, aiStatus: { keyed: false, provider: null }, blocks: VoiceContract.compose(a, null).blocks, text: a.text })
  for (const n of a.result.meta.names as string[]) expect(html).toContain(n) // all n present in the rendered HTML — no server-side truncation
})
