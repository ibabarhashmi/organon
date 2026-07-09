/**
 * ORGΛNON — THE INTERPRETER SPRINT, Phase 4 wall (TRUNCATION-DEAD; X-INTERPRET d, S43). The COMPARE truncation is killed
 * at ALL THREE layers, each positive-controlled: (1) CSS/render — the answer surface FLOWS (overflow-wrap, no fixed-height
 * clip); (2) the AI output-cap — SCALED to the fact-set size + a truncated finish DETECTED and honestly MARKED, never a
 * silent cut; (3) the pre-AI fact-budget — EXPLICIT (a reduced set NAMES what was summarized), never a silent drop. CSS
 * alone is refused as a complete fix — all three bite.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ask } from "../../src/ask/answer"
import { AskPhrase } from "../../src/ask/phrase"
import { AskProvider } from "../../src/ask/provider"
import { AskTruncation } from "../../src/ask/truncation"
import { AskFactBudget } from "../../src/ask/factbudget"
import type { Explain } from "../../src/analytics/explain"

const NOW = Date.parse("2026-07-08T00:00:00Z")

// ── LAYER 1 — the CSS/render surface FLOWS, never clips ──────────────────────────────────────────────────────────────
test("S43 layer 1 (CSS) — the answer surface flows/wraps (overflow-wrap) with NO fixed-height clip on the answer path", () => {
  const css = readFileSync(path.join(PKG_ROOT, "public", "organon.css"), "utf8")
  // the answer blocks + card wrap long content instead of overflowing to a clip
  expect(css).toMatch(/\.blk\{[^}]*overflow-wrap:anywhere/)
  expect(css).toMatch(/\.card\{[^}]*overflow-wrap:anywhere/)
  // and there is NO fixed-height / overflow:hidden clip on the answer path (.blk / .card) — a clip would cut a big COMPARE
  expect(css).not.toMatch(/\.blk\{[^}]*(max-height|overflow:hidden)/)
  expect(css).not.toMatch(/\.card\{[^}]*(max-height|overflow:hidden)/)
})

// ── LAYER 2 — the AI output-cap scales + a truncated finish is detected/marked ────────────────────────────────────────
test("S43 layer 2 (output-cap) — scaleCap is monotone in the fact-set size + bounded [BASE, CEIL] (a big COMPARE gets room)", () => {
  expect(AskTruncation.scaleCap(0)).toBe(AskTruncation.BASE_MAX_TOKENS)
  expect(AskTruncation.scaleCap(5)).toBeGreaterThan(AskTruncation.scaleCap(1)) // more facts → more room
  expect(AskTruncation.scaleCap(9999)).toBe(AskTruncation.CEIL_MAX_TOKENS) // bounded — never runs away
  expect(AskTruncation.scaleCap(1)).toBeGreaterThanOrEqual(AskTruncation.BASE_MAX_TOKENS)
})

test("S43 layer 2 — detect flags a mid-sentence cut; markIfTruncated marks it honestly (never a silent cut), leaves a complete answer untouched", () => {
  expect(AskTruncation.detect("A complete thought that ends properly.").complete).toBe(true)
  expect(AskTruncation.detect("This one just keeps going and going without any terminal punctuation at").complete).toBe(false)
  const ok = AskTruncation.markIfTruncated("A complete thought that ends properly.")
  expect(ok.truncated).toBe(false); expect(ok.text).toBe("A complete thought that ends properly.")
  const cut = AskTruncation.markIfTruncated("This one just keeps going and going without any terminal punctuation at")
  expect(cut.truncated).toBe(true); expect(cut.text).toMatch(/truncated — ask a narrower question/)
})

test("S43 layer 2 (the WIRING) — a truncated AI generation is DETECTED + marked on the rendered answer (never silently cut)", async () => {
  const a = await Ask.answer("is aave-v3 USDC safe?", { register: "pro", now: NOW })
  // a Pro-conforming interpretation cut mid-sentence (no terminal punctuation) — passes the gates, then gets marked
  const truncated = "Durable base dominates the yield with low emission dependence; the counterparty axis is FLAGGED at the deployed-proxy surface, a structural screen over verified source, not an audit, so the real risk is that an admin key on the upgradeable"
  const provider: AskProvider.Provider = { id: "m", provider: "gemini", async phrase() { return truncated } }
  const p = await AskPhrase.phraseGrounded(a, provider)
  expect(p.aiPhrased).toBe(true) // the partial is grounded — we don't drop it, we complete-or-mark it
  expect(p.text).toMatch(/truncated — ask a narrower question/) // the honest mark — never a silent cut
})

test("S43 layer 2 — the provider honors the SCALED maxTokens (the cap rides into the request body, never a fixed cut)", async () => {
  let body = ""
  const transport: AskProvider.Transport = async (_url, init) => { body = init.body; return { ok: true, status: 200, async json() { return { choices: [{ message: { content: "Durable base dominates the yield; the counterparty screen is a structural check over verified source, not an audit." } }] } } } }
  const provider = AskProvider.groqAdapter("k", AskProvider.GROQ_MODEL, transport)
  await provider.phrase("sys", "usr", { maxTokens: 777 })
  expect(JSON.parse(body).max_tokens).toBe(777) // the scaled cap is honored, not the fixed default
})

// ── LAYER 3 — the pre-AI fact-budget is EXPLICIT, never a silent drop ─────────────────────────────────────────────────
const fr = (id: string, contribution: string): Explain.FactRow => ({ id, name: id, value: 1, threshold: null, comparator: null, outcome: "info", contribution, provenanceRef: null })

test("S43 layer 3 (fact-budget) — under the cap: no reduction; over the cap: EXPLICIT note + deciding-first priority + deterministic", () => {
  const few = Array.from({ length: 10 }, (_, i) => fr(`f${i}`, "context"))
  expect(AskFactBudget.budget(few).reduced).toBe(false)
  expect(AskFactBudget.budget(few).summarizedNote).toBeNull()
  // over the cap: kept = DEFAULT_MAX_FACTS, an explicit note, deciding rows kept first
  const many = [...Array.from({ length: 5 }, (_, i) => fr(`d${i}`, "deciding")), ...Array.from({ length: 60 }, (_, i) => fr(`c${i}`, "context"))]
  const b = AskFactBudget.budget(many)
  expect(b.reduced).toBe(true)
  expect(b.facts.length).toBe(AskFactBudget.DEFAULT_MAX_FACTS)
  expect(b.summarizedNote).toMatch(/summarized|nothing was invented|nothing was silently dropped/i)
  expect(b.facts.filter((f) => f.contribution === "deciding").length).toBe(5) // every deciding fact survives
  // deterministic — the same input budgets identically (a stable sort)
  expect(JSON.stringify(AskFactBudget.budget(many))).toBe(JSON.stringify(AskFactBudget.budget(many)))
})

test("S43 layer 3 (the WIRING) — a huge fact set surfaces the EXPLICIT budget note in the answer (never a silent drop)", async () => {
  // a synthetic answer with > DEFAULT_MAX_FACTS facts; a Pro-conforming interpretation → the budget note rides along
  const facts = Array.from({ length: 60 }, (_, i) => fr(`axis-${i}`, i < 4 ? "deciding" : "context"))
  const result = { tool: "compare", ok: true as const, reality: "REAL" as const, facts, summary: "many strategies side by side", meta: { names: ["a", "b"], verdicts: ["SOLID", "CAUTION"] } }
  const a = { query: "compare everything", register: "pro" as const, intent: { kind: "COMPARE", raw: "compare everything" } as Ask.AskAnswer["intent"], result, text: result.summary }
  const provider: AskProvider.Provider = { id: "m", provider: "gemini", async phrase() { return "Durable base dominates across the set; the counterparty screen is a structural check over verified source, not an audit, and the funding carry is the swing axis to watch." } }
  const p = await AskPhrase.phraseGrounded(a, provider)
  expect(p.aiPhrased).toBe(true)
  expect(p.text).toMatch(/summarized to fit the model's budget/) // the reduction is EXPLICIT in the answer
  expect(p.blocks.some((b) => b.tier === "BOUNDARY" && /summarized/.test(b.text))).toBe(true)
})

test("S43 — CSS alone is refused as a complete fix: all THREE layers exist as distinct, exercised mechanisms", () => {
  // the three modules are real + distinct (the doctrine: fixing only the CSS would scroll to reveal a subtly-incomplete answer)
  expect(typeof AskTruncation.scaleCap).toBe("function") // layer 2
  expect(typeof AskTruncation.markIfTruncated).toBe("function") // layer 2
  expect(typeof AskFactBudget.budget).toBe("function") // layer 3
  const css = readFileSync(path.join(PKG_ROOT, "public", "organon.css"), "utf8")
  expect(css).toMatch(/overflow-wrap:anywhere/) // layer 1
})
