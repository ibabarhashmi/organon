/**
 * ORGΛNON — THE ASK CONSOLE CLI (Crown-Jewel Phase 6; Rule X-ASK). Ask anything about the recorded strategies from the
 * command line — the DETERMINISTIC path (no AI): classify → the engine tool → a register-aware templated answer.
 *   bun run script/ask.ts "is aave-v3 USDC safe?"           # Simple
 *   bun run script/ask.ts --pro "funding p10 of BTC"        # Pro (echoes the classified intent + tool + facts)
 *   bun run script/ask.ts --raw "aave USDC vs compound USDC" # the pure engine fact rows (byte-reproducible)
 * Every number/verdict/fact comes from the deterministic engine; an unmappable query → an honest "here's what I can help with".
 */
import { Ask } from "../src/ask/answer"
import { AskPhrase } from "../src/ask/phrase"
import { AskProvider } from "../src/ask/provider"

const args = process.argv.slice(2)
const pro = args.includes("--pro")
const raw = args.includes("--raw")
const query = args.filter((a) => a !== "--pro" && a !== "--raw").join(" ").trim()

if (!query) {
  console.log('usage: bun run script/ask.ts [--pro|--raw] "<your question>"')
  console.log("\nthe grounded Ask console (deterministic mode — no AI key needed). Try:")
  console.log('  · "is aave-v3 USDC safe?"          (check a strategy)')
  console.log('  · "what is the peg of aave USDC?"  (one metric)')
  console.log('  · "stamp aave-v3 USDC"             (the opt-in overfit Stamp — a separate verdict)')
  console.log('  · "aave USDC vs compound USDC"     (compare)')
  console.log('  · "what does deflation mean?"      (explain a term)')
  console.log('  · "what can you check?"            (coverage)')
  process.exit(0)
}

const register = pro || raw ? "pro" : "simple"
// AI-OPTIONAL: with a key in env, phrase the deterministic answer (gated); with NO key, the deterministic mode stands.
const st = AskProvider.status()
const g = await AskPhrase.answerGrounded(query, { register, now: Date.now() })
console.log(`Q: ${query}`)
if (pro || raw) console.log(`   [intent ${g.intent.kind} → engine tool ${g.result.tool} · reality ${g.result.reality} · ${st.keyed ? `AI: ${st.provider}${g.aiPhrased ? " (phrased)" : g.rejected ? " (rejected → deterministic)" : ""}` : "AI phrasing off (no key — deterministic mode)"}]`)
console.log("")
console.log(raw ? Ask.rawFacts(g.result) : g.text)
if (pro && g.result.facts.length) { console.log("\n— engine facts (the grounding — the answer never exceeds these):"); console.log(Ask.rawFacts(g.result)) }
console.log(`\n[ ${st.keyed ? "AI-phrased where grounded, else" : "deterministic engine answer ·"} every number/verdict is engine-sourced · the AI can never move a fact ]`)
