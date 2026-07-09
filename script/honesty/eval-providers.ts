/**
 * ORGΛNON — THE VOICE SPRINT, Phase 5 driver (EVAL-PROVEN). The Operator-gated LIVE per-provider eval (X-VOICE a measured,
 * D12). Runs the fixed query battery (the 13 intents + the seeded attack set) against the configured provider, scores each
 * draft through the SAME five gates the live console runs (VoiceEval core), and writes a REDACTED per-provider metrics
 * artifact (data/honesty/eval-<provider>.json — NO key, NO raw model text; the flags + rates only, X-BYOK).
 *
 * The integrity guarantee is UNIFORM (the gates → post-gate leaks must be 0); the EXPERIENCE varies (the model → the
 * fallback/attempt rates). No key → the harness is a rumor: this exits honestly, and the hermetic twin (voice_eval.test.ts)
 * proves the MECHANICS offline. Run (Operator, with a BYOK key in .env): bun run script/honesty/eval-providers.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ask } from "../../src/ask/answer"
import { AskPhrase } from "../../src/ask/phrase"
import { AskProvider } from "../../src/ask/provider"
import { VoiceContract } from "../../src/ask/contract"
import { VoiceEval } from "../../src/ask/eval"

const provider = AskProvider.fromEnv()
if (!provider) {
  console.log("no provider configured (set a BYOK key in .env). The eval harness is Operator-gated LIVE; the hermetic twin (voice_eval.test.ts) proves the mechanics offline.")
  process.exit(0)
}

const NOW = Date.parse("2026-07-09T00:00:00Z")
const outcomes: VoiceEval.CaseOutcome[] = []
for (const c of VoiceEval.BATTERY) {
  const a = await Ask.answer(c.query, { now: NOW })
  const { system, user } = AskPhrase.buildPrompt(a)
  let draft = ""
  try { draft = await provider.phrase(system, user) } catch { draft = "" } // a provider error → an empty draft → template fallback (counted honestly)
  const fs = VoiceContract.factSetOf(a, VoiceContract.comparisonsFor(a))
  outcomes.push(VoiceEval.scoreDraft(c.id, c.kind, draft, fs))
}
const m = VoiceEval.metricsFor(provider.id, outcomes)

// the REDACTED artifact — metrics + per-case flags only (NO raw drafts, NO key). D12: the experience-variance disclosure.
const artifact = {
  protocol: "voice-eval",
  provider: provider.id,
  version: m.version,
  at: NOW,
  note: "per-provider persona fidelity — the INTEGRITY is uniform (post-gate leaks must be 0); the EXPERIENCE varies by model (the rates). D12. REDACTED: no key + no raw model text is committed (X-BYOK).",
  metrics: {
    gateRejectionRate: m.gateRejectionRate,
    adviceLeakAttemptRate: m.adviceLeakAttemptRate,
    verdictContradictionAttemptRate: m.verdictContradictionAttemptRate,
    numericSmugglingAttemptRate: m.numericSmugglingAttemptRate,
    templateFallbackRate: m.templateFallbackRate,
    postGateLeaks: m.postGateLeaks,
  },
  outcomes: m.outcomes, // per-case flags (booleans) — NO raw text
  keySafety: "the key rode ONLY in the transport Authorization header; NO key and NO raw model text is committed (X-BYOK key-safety).",
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", `eval-${provider.id}.json`), JSON.stringify(artifact, null, 2) + "\n")

console.log("── VOICE — PHASE 5 (EVAL-PROVEN, LIVE) ───────────────────────")
console.log(`provider             : ${provider.id} (${provider.provider})`)
console.log(`battery              : ${m.n} cases (intents + seeded attack set)`)
console.log(`gate-rejection rate  : ${m.gateRejectionRate}`)
console.log(`advice-leak ATTEMPT  : ${m.adviceLeakAttemptRate}`)
console.log(`verdict-contra ATTEMPT: ${m.verdictContradictionAttemptRate}`)
console.log(`numeric-smug ATTEMPT : ${m.numericSmugglingAttemptRate}`)
console.log(`template-fallback    : ${m.templateFallbackRate}`)
console.log(`POST-GATE LEAKS      : ${m.postGateLeaks} ${m.postGateLeaks === 0 ? "(ZERO — the gates hold on a REAL model)" : "(!!! A LEAK — a Halt)"}`)
console.log(`written              : data/honesty/eval-${provider.id}.json (REDACTED)`)
