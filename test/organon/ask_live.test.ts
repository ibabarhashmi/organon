/**
 * ORGΛNON — THE PERSISTENCE SPRINT, Phase 2 walls (AI-LIVE-PROVEN; finding V2, S24). The AI grounding was mock-proven in
 * the Crown-Jewel sprint; this converts it to LIVE-proven against a REAL model (Groq llama-3.1-8b-instant). The committed
 * REDACTED transcript (data/honesty/evidence/ask-live-groq.json, written once by script/honesty/ask-live-groq.ts) is the
 * durable proof: a real-model answer PHRASES the engine facts and PASSES the gate; a real-model output carrying a FORCED
 * fabricated number is REJECTED WHOLESALE → the deterministic template stands. NO key in the transcript (X-BYOK).
 *
 *   · HERMETIC (always, incl. the offline battery): assert the committed transcript is well-formed, records a grounded
 *     PASS + a fabrication REJECT, leaks NO key, and reproduces its capture-manifest content-hash.
 *   · LIVE (skipped unless a key is present — the battery forces keys empty): re-run ONE real round-trip and assert the
 *     same two outcomes, WITHOUT rewriting the committed evidence (only the Operator's script regenerates it).
 */
import { test, expect } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Evidence } from "../../src/studio/evidence"
import { Ask } from "../../src/ask/answer"
import { AskPhrase } from "../../src/ask/phrase"
import { AskProvider } from "../../src/ask/provider"

const EVIDENCE = path.join(PKG_ROOT, "data", "honesty", "evidence", "ask-live-groq.json")
const KEY_SHAPES = /gsk_[A-Za-z0-9]{20,}|AIza[A-Za-z0-9]{20,}|AQ\.[A-Za-z0-9_-]{20,}|\bsk-[A-Za-z0-9]{20,}/
const NOW = Date.parse("2026-07-05T00:00:00Z")

test("V2/S24 — the committed live-Groq transcript is well-formed: a real-model grounded PASS + a forced-fabrication REJECT", () => {
  expect(existsSync(EVIDENCE)).toBe(true) // the durable proof is committed (run script/honesty/ask-live-groq.ts to (re)generate)
  const t = JSON.parse(readFileSync(EVIDENCE, "utf8"))
  expect(t.protocol).toBe("ask-live-groq")
  expect(String(t.provider)).toMatch(/groq|llama/i) // a REAL model, not a mock
  // probe A — a real-model answer PASSED the grounding gate (phrased the engine facts, added no ungrounded number)
  expect(t.probeA_grounded).toBeTruthy()
  expect(t.probeA_grounded.aiPhrased).toBe(true)
  expect(t.probeA_grounded.gateReasons).toEqual([])
  expect(t.probeA_grounded.factCount).toBeGreaterThan(0)
  // probe B — a real-model output carrying a FORCED fabricated number was REJECTED WHOLESALE → deterministic fallback
  expect(t.probeB_fabricationRejected.rejectedWholesale).toBe(true)
  expect(t.probeB_fabricationRejected.aiPhrased).toBe(false)
  expect(t.probeB_fabricationRejected.fellBackToDeterministic).toBe(true)
  expect(t.probeB_fabricationRejected.gateReasons.join(" ")).toMatch(/unmatched number|not a fact/i)
})

test("V2/S24 — the live transcript leaks NO key (X-BYOK key-safety) and cites its key-only-in-transport discipline", () => {
  const raw = readFileSync(EVIDENCE, "utf8")
  expect(KEY_SHAPES.test(raw)).toBe(false) // no key-shaped string anywhere in the committed transcript
  const t = JSON.parse(raw)
  expect(String(t.keySafety)).toMatch(/only in the transport|Authorization header/i)
  expect(String(t.keySafety)).toMatch(/never|NO field/i)
})

test("V2/S24 — the live transcript is content-hashed into the capture-manifest (verify recomputes it, S18)", () => {
  const cm = Evidence.verifyCaptureManifest()
  expect(cm.ok).toBe(true) // every committed capture (incl. ask-live-groq.json) reproduces its manifest hash
  const m = JSON.parse(readFileSync(path.join(Evidence.DIR, "capture-manifest.json"), "utf8")) as { entries: { capture: string }[] }
  expect(m.entries.some((e) => e.capture === "ask-live-groq.json")).toBe(true) // the live-AI proof is manifested
})

// ── LIVE (Operator-gated) — runs ONLY with a real key present; the offline battery forces keys empty → skipped. Re-proves
// the gate against the live model WITHOUT rewriting the committed evidence (only script/honesty/ask-live-groq.ts writes it). ──
const HAS_KEY = !!(process.env.GROQ_API_KEY || process.env.GOOGLE_AI_STUDIO_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY)
test.skipIf(!HAS_KEY)("V2/S24 (LIVE) — a real round-trip: a grounded answer passes AND a forced fabrication is rejected wholesale", async () => {
  const provider = AskProvider.fromEnv()
  expect(provider).not.toBeNull()
  // grounded pass — try known-groundable queries (temp-0 phrasing); at least one passes the gate against the real model
  let passed = false
  for (const q of ["Is aave-v3 USDC safe?", "What is the peg of aave USDC?", "What can you check?", "What is deflation?"]) {
    const a = await AskPhrase.answerGrounded(q, { provider, register: "pro", now: NOW })
    if (a.aiPhrased) { expect(a.reasons).toEqual([]); passed = true; break }
  }
  expect(passed).toBe(true)
  // forced fabrication — a real-model output carrying a number the engine never produced is rejected wholesale
  const fab: AskProvider.Provider = { id: `${provider!.id}+fab`, provider: provider!.provider, async phrase(s, u) { return `${await provider!.phrase(s, u)} (the exact APY is 987.65% — guaranteed).` } }
  const base = await Ask.answer("Is aave-v3 USDC safe?", { register: "pro", now: NOW })
  const b = await AskPhrase.phraseGrounded(base, fab)
  expect(b.rejected).toBe(true)
  expect(b.aiPhrased).toBe(false)
  expect(b.text).toBe(base.text) // the deterministic template stands
}, 30000)
