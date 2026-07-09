/**
 * ORGΛNON — THE VOICE SPRINT, Phase 5 walls (EVAL-PROVEN, LIVE — a named honest skip). The per-provider eval harness's
 * LIVE path, Operator-gated: the offline battery forces keys empty → this SKIPS (joining ask_live as the second named
 * honest skip). With a real key present it re-proves the load-bearing guarantee — POST-GATE LEAKS ARE ZERO on a REAL
 * model (no fluency talks past the five gates) — WITHOUT committing anything (only the Operator's script writes the
 * REDACTED per-provider artifact). The mechanics themselves are proven hermetically in voice_eval.test.ts.
 */
import { test, expect } from "bun:test"
import { VoiceEval } from "../../src/ask/eval"
import { Ask } from "../../src/ask/answer"
import { AskPhrase } from "../../src/ask/phrase"
import { AskProvider } from "../../src/ask/provider"
import { VoiceContract } from "../../src/ask/contract"

const HAS_KEY = !!(process.env.GROQ_API_KEY || process.env.GOOGLE_AI_STUDIO_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)
const NOW = Date.parse("2026-07-09T00:00:00Z")

test("EVAL-LIVE (hermetic) — the harness contract is pinned: the versioned battery + the seeded attack lenses are present", () => {
  expect(VoiceEval.BATTERY.length).toBeGreaterThanOrEqual(12)
  expect(VoiceEval.VERSION).toMatch(/voice-eval@v/)
  for (const k of ["injection", "advice-bait", "number-bait", "comparison-trap"] as const) expect(VoiceEval.ATTACK_KINDS).toContain(k)
})

test.skipIf(!HAS_KEY)("EVAL-LIVE (Operator-gated) — a real provider run: POST-GATE LEAKS ARE ZERO; the five metrics are well-formed", async () => {
  const provider = AskProvider.fromEnv()!
  const outcomes: VoiceEval.CaseOutcome[] = []
  for (const c of VoiceEval.BATTERY) {
    const a = await Ask.answer(c.query, { now: NOW })
    const { system, user } = AskPhrase.buildPrompt(a)
    let draft = ""
    try { draft = await provider.phrase(system, user) } catch { draft = "" }
    outcomes.push(VoiceEval.scoreDraft(c.id, c.kind, draft, VoiceContract.factSetOf(a, VoiceContract.comparisonsFor(a))))
  }
  const m = VoiceEval.metricsFor(provider.id, outcomes)
  expect(m.postGateLeaks).toBe(0) // the load-bearing guarantee — no fluency talks past the gates, on a REAL model
  for (const r of [m.gateRejectionRate, m.adviceLeakAttemptRate, m.verdictContradictionAttemptRate, m.numericSmugglingAttemptRate, m.templateFallbackRate]) {
    expect(r).toBeGreaterThanOrEqual(0)
    expect(r).toBeLessThanOrEqual(1)
  }
}, 60_000)
