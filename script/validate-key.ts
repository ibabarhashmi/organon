/**
 * ORGΛNON — KEY VALIDATION (Alpha Phase 4; the wizard's live check, S49). ONE minimal auth-shaped call for ONE
 * provider env key: `bun run script/validate-key.ts GROQ_API_KEY` reads the key from the CURRENT env, routes it
 * through the SAME adapter the Ask console uses (a 1-token phrase — the cheapest authenticated request), and prints
 * VALID / INVALID(reason) / UNREACHABLE. Request/response BODIES are never logged (the adapters throw status-only
 * messages by design); the printed line passes the scrubber. Exit 0 valid · 1 invalid · 2 unreachable/skipped.
 */
import { AskProvider } from "../src/ask/provider"
import { Scrub } from "../src/util/scrub"

const envKey = process.argv[2]
const KNOWN = ["GROQ_API_KEY", "GOOGLE_AI_STUDIO_KEY", "GEMINI_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "OPENAI_COMPATIBLE_API_KEY"]
if (!envKey || !KNOWN.includes(envKey)) {
  console.log(`usage: bun run script/validate-key.ts <${KNOWN.join("|")}>`)
  process.exit(2)
}
const value = process.env[envKey]
if (!value) { console.log(Scrub.redact(`${envKey}: not set — nothing to validate (keyless mode is fully functional)`)); process.exit(2) }

// an env view carrying ONLY the key under test (+ its companions), so fromEnv resolves exactly this provider
const view: Record<string, string | undefined> = { [envKey]: value }
if (envKey === "ANTHROPIC_API_KEY") view.ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL
if (envKey === "OPENAI_COMPATIBLE_API_KEY") { view.OPENAI_COMPATIBLE_BASE_URL = process.env.OPENAI_COMPATIBLE_BASE_URL; view.OPENAI_COMPATIBLE_MODEL = process.env.OPENAI_COMPATIBLE_MODEL }
if (envKey === "GROQ_API_KEY") view.GROQ_MODEL = process.env.GROQ_MODEL

const provider = AskProvider.fromEnv(view)
if (!provider) { console.log(Scrub.redact(`${envKey}: could not construct a provider (companion vars missing? e.g. ANTHROPIC_MODEL / OPENAI_COMPATIBLE_BASE_URL)`)); process.exit(1) }

try {
  const out = await Promise.race([
    provider.phrase("Reply with the single word: ok", "ok?", { maxTokens: 4 }),
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout after 20s")), 20_000)),
  ])
  console.log(Scrub.redact(`${envKey}: VALID — ${provider.id} answered (${out.trim().slice(0, 20) || "empty reply, auth accepted"})`))
  process.exit(0)
} catch (e) {
  const msg = Scrub.redact(String((e as Error).message)) // status-only by adapter design; scrubbed regardless
  const authish = /HTTP 401|HTTP 403/.test(msg)
  console.log(`${envKey}: ${authish ? "INVALID — the provider refused the key" : "UNREACHABLE"} (${msg.slice(0, 80)})`)
  process.exit(authish ? 1 : 2)
}
