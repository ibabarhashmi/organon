/**
 * ORGΛNON — THE ASK CONSOLE, the PROVIDER SEAM + BYOK (Crown-Jewel Phase 7; Rule X-BYOK). An injectable model provider,
 * DEFAULTING to the free Google AI Studio (Gemini) API, with BYOK across providers (Gemini · OpenAI · Anthropic · any
 * OpenAI-compatible base URL) selected from env, and AI-OPTIONAL: with NO key present, `fromEnv` returns null → the Ask
 * console falls back to the deterministic templated mode (mirrors the sidecar-optional pattern).
 *
 * KEY SAFETY (a Halt if violated): keys are ENV-ONLY, read SERVER-SIDE, NEVER placed in the client bundle, NEVER logged,
 * NEVER sent anywhere but the chosen provider's endpoint (in the Authorization header / a URL param). The phrasing
 * REQUEST carries {system, user} = the query + the engine facts + the register — never a secret. The transport is an
 * injectable seam so the battery runs OFFLINE with a mock (CI never hits a live API, never needs a key).
 */
export namespace AskProvider {
  export interface PhraseOpts { maxTokens?: number } // the output cap, SCALED to the fact-set size (X-INTERPRET d, S43)
  export interface Provider {
    id: string
    provider: "gemini" | "openai" | "anthropic" | "openai-compatible"
    // phrase(system, user, opts?) → the model's text. The prompt carries ONLY {system, user}; the key lives in the
    // transport; opts.maxTokens (optional) scales the output cap so a big COMPARE is not cut mid-answer (default: the
    // adapter's own cap — back-compat for a 2-arg mock).
    phrase(system: string, user: string, opts?: PhraseOpts): Promise<string>
  }

  export interface TransportResult { ok: boolean; status: number; json(): Promise<unknown>; headers?: { get(name: string): string | null } }
  export type Transport = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<TransportResult>
  const globalTransport: Transport = (url, init) => fetch(url, init) as unknown as Promise<TransportResult>

  export const GEMINI_BASE = "https://generativelanguage.googleapis.com"
  export const ANTHROPIC_BASE = "https://api.anthropic.com"
  export const OPENAI_BASE = "https://api.openai.com/v1"
  export const GROQ_BASE = "https://api.groq.com/openai/v1"

  // ── THE RATE-LIMIT QUEUE + RETRY/BACKOFF (Crown-Jewel; X-BYOK free-tier) — so a 429 NEVER reaches the caller. Requests
  // are SERIALIZED through a shared async queue and SPACED by `minIntervalMs` (proactive: stay under the RPM cap); a
  // 429/5xx is RETRIED with backoff that HONORS the provider's `retry-after` header (reactive: absorb a transient limit).
  // A persistent limit after `maxRetries` returns the last response → the phrasing gate falls back to the deterministic
  // answer (honest, never a crash). Deterministic-friendly: no unbounded spin; jitter avoids thundering-herd retries. ──
  export interface RateLimitOpts { minIntervalMs?: number; maxRetries?: number; baseBackoffMs?: number; maxBackoffMs?: number }
  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, Math.max(0, ms)))
  export function rateLimited(transport: Transport, opts: RateLimitOpts = {}): Transport {
    const minInterval = opts.minIntervalMs ?? 2100 // ~28 req/min — under Groq free-tier 30 RPM (llama-4-scout)
    const maxRetries = opts.maxRetries ?? 5
    const base = opts.baseBackoffMs ?? 800
    const maxBackoff = opts.maxBackoffMs ?? 30_000
    let queue: Promise<unknown> = Promise.resolve() // the serialized async request queue (one in flight at a time)
    let lastAt = 0
    return (url, init) => {
      const run = async (): Promise<TransportResult> => {
        const gap = minInterval - (Date.now() - lastAt)
        if (gap > 0) await sleep(gap) // proactive spacing — never burst the provider
        for (let attempt = 0; ; attempt++) {
          lastAt = Date.now()
          const r = await transport(url, init)
          if (r.status !== 429 && r.status < 500) return r // success (or a non-rate-limit error) → return
          if (attempt >= maxRetries) return r // exhausted → the caller degrades to the deterministic answer (honest)
          const ra = Number(r.headers?.get?.("retry-after")) // honor the provider's own backoff hint (seconds)
          const backoff = Number.isFinite(ra) && ra > 0 ? ra * 1000 + 100 : Math.min(maxBackoff, base * 2 ** attempt) + Math.floor(Math.random() * 250)
          await sleep(backoff)
        }
      }
      const p = queue.then(run, run) // chain onto the queue (serialize); a prior failure never wedges the queue
      queue = p.then(() => undefined, () => undefined)
      return p
    }
  }
  // the LIVE path shares ONE module-level rate-limited queue, so spacing + retry apply ACROSS requests (not per-call).
  const liveTransport = rateLimited(globalTransport)

  // ── the adapters — each puts the key ONLY in the header/URL to the provider, NEVER in the prompt or a log ──
  export function geminiAdapter(key: string, model = "gemini-2.0-flash", transport: Transport = globalTransport): Provider {
    return {
      id: "google-ai-studio", provider: "gemini",
      async phrase(system, user, opts) {
        const url = `${GEMINI_BASE}/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`
        const generationConfig = opts?.maxTokens ? { maxOutputTokens: opts.maxTokens } : undefined
        const r = await transport(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ parts: [{ text: user }] }], ...(generationConfig ? { generationConfig } : {}) }) })
        if (!r.ok) throw new Error(`gemini HTTP ${r.status}`)
        const b = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
        return b.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
      },
    }
  }
  export function openaiAdapter(key: string, baseUrl = OPENAI_BASE, model = "gpt-4o-mini", transport: Transport = globalTransport): Provider {
    return {
      id: baseUrl === OPENAI_BASE ? "openai" : "openai-compatible", provider: baseUrl === OPENAI_BASE ? "openai" : "openai-compatible",
      async phrase(system, user, opts) {
        const r = await transport(`${baseUrl}/chat/completions`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}` }, body: JSON.stringify({ model, ...(opts?.maxTokens ? { max_tokens: opts.maxTokens } : {}), messages: [{ role: "system", content: system }, { role: "user", content: user }] }) })
        if (!r.ok) throw new Error(`openai-compatible HTTP ${r.status}`)
        const b = (await r.json()) as { choices?: { message?: { content?: string } }[] }
        return b.choices?.[0]?.message?.content ?? ""
      },
    }
  }
  // the Anthropic BYOK model is env-driven (ANTHROPIC_MODEL) — no hardcoded model id; absent → an honest error → the
  // groundedness layer falls back to the deterministic answer. (Groq + Google are the wired defaults; Anthropic is BYOK.)
  export function anthropicAdapter(key: string, model = "", transport: Transport = globalTransport): Provider {
    return {
      id: "anthropic", provider: "anthropic",
      async phrase(system, user, opts) {
        if (!model) throw new Error("Anthropic BYOK requires ANTHROPIC_MODEL (set it in .env)")
        const r = await transport(`${ANTHROPIC_BASE}/v1/messages`, { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model, max_tokens: opts?.maxTokens ?? 1024, system, messages: [{ role: "user", content: user }] }) })
        if (!r.ok) throw new Error(`anthropic HTTP ${r.status}`)
        const b = (await r.json()) as { content?: { text?: string }[] }
        return b.content?.[0]?.text ?? ""
      },
    }
  }
  // GROQ (meta-llama/llama-4-scout-17b-16e-instruct) — OpenAI-compatible (the pinned "any OpenAI-compatible base URL"
  // family, X-BYOK), with a dedicated env for ergonomics + free-tier tuning. OUTPUT tokens are CAPPED and the temperature
  // is low (faithful phrasing of fixed facts). The INPUT is only the query + the engine facts + the register (buildPrompt)
  // — no waste. Paired with the rate-limit queue, it stays under the free-tier RPM/TPM. The model is env-overridable (GROQ_MODEL).
  export const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
  export const GROQ_MAX_TOKENS = 1000 // the output cap (bounds the daily token budget); scaled per-answer by truncation.scaleCap on the live path
  export function groqAdapter(key: string, model = GROQ_MODEL, transport: Transport = globalTransport): Provider {
    return {
      id: "groq", provider: "openai-compatible",
      async phrase(system, user, opts) {
        // temperature 0.3 / top_p 0.9: low-but-not-zero for faithful phrasing of fixed facts; the groundedness gate +
        // verdict guard remain the guarantee regardless. The output cap is SCALED to the fact-set size (opts.maxTokens;
        // default GROQ_MAX_TOKENS) so a big COMPARE is not cut. stream is FALSE BY DESIGN + BY LAW: the answer is verified
        // WHOLESALE by verifyGroundedness BEFORE any of it reaches the user (a single ungrounded number rejects the whole
        // paraphrase → the deterministic text renders). Streaming tokens to the client would show ungrounded text before the
        // gate could reject it — a post-gate leak, the one thing the tool exists to make impossible (the streamText wall bites).
        const r = await transport(`${GROQ_BASE}/chat/completions`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}` }, body: JSON.stringify({ model, max_tokens: opts?.maxTokens ?? GROQ_MAX_TOKENS, temperature: 0.3, top_p: 0.9, stream: false, messages: [{ role: "system", content: system }, { role: "user", content: user }] }) })
        if (!r.ok) throw new Error(`groq HTTP ${r.status}`)
        const b = (await r.json()) as { choices?: { message?: { content?: string } }[] }
        return b.choices?.[0]?.message?.content ?? ""
      },
    }
  }

  // ── resolve the provider from ENV (BYOK), in priority order. NO key → null (the deterministic mode). SERVER-SIDE ONLY.
  // The LIVE default transport is the shared RATE-LIMITED queue (so a 429 never reaches the caller); tests inject a raw
  // transport. GROQ is checked FIRST — it is the free-tier-friendly default the Operator wired (Google AI Studio, the
  // pinned default, remains a fallback). All are BYOK; the key goes ONLY to the transport, never the prompt/log. ──
  export function fromEnv(env: Record<string, string | undefined> = process.env, transport: Transport = liveTransport): Provider | null {
    if (env.GROQ_API_KEY) return groqAdapter(env.GROQ_API_KEY, env.GROQ_MODEL ?? GROQ_MODEL, transport) // free-tier default (llama-4-scout-17b)
    if (env.GOOGLE_AI_STUDIO_KEY) return geminiAdapter(env.GOOGLE_AI_STUDIO_KEY, "gemini-2.0-flash", transport) // the pinned free default
    if (env.GEMINI_API_KEY) return geminiAdapter(env.GEMINI_API_KEY, "gemini-2.0-flash", transport)
    if (env.OPENAI_API_KEY) return openaiAdapter(env.OPENAI_API_KEY, OPENAI_BASE, "gpt-4o-mini", transport)
    if (env.ANTHROPIC_API_KEY) return anthropicAdapter(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL ?? "", transport)
    if (env.OPENAI_COMPATIBLE_BASE_URL && env.OPENAI_COMPATIBLE_API_KEY) return openaiAdapter(env.OPENAI_COMPATIBLE_API_KEY, env.OPENAI_COMPATIBLE_BASE_URL, env.OPENAI_COMPATIBLE_MODEL ?? "default", transport)
    return null // AI-optional — no key → the deterministic templated mode (honestly labeled "AI phrasing off")
  }

  // which provider WOULD be selected + whether a key is present (for the honest "AI on/off" label) — NEVER exposes the key
  export function status(env: Record<string, string | undefined> = process.env): { keyed: boolean; provider: string | null; envKey: string | null } {
    if (env.GROQ_API_KEY) return { keyed: true, provider: `groq (${env.GROQ_MODEL ?? GROQ_MODEL})`, envKey: "GROQ_API_KEY" }
    if (env.GOOGLE_AI_STUDIO_KEY) return { keyed: true, provider: "gemini (Google AI Studio)", envKey: "GOOGLE_AI_STUDIO_KEY" }
    if (env.GEMINI_API_KEY) return { keyed: true, provider: "gemini", envKey: "GEMINI_API_KEY" }
    if (env.OPENAI_API_KEY) return { keyed: true, provider: "openai", envKey: "OPENAI_API_KEY" }
    if (env.ANTHROPIC_API_KEY) return { keyed: true, provider: "anthropic", envKey: "ANTHROPIC_API_KEY" }
    if (env.OPENAI_COMPATIBLE_BASE_URL && env.OPENAI_COMPATIBLE_API_KEY) return { keyed: true, provider: "openai-compatible", envKey: "OPENAI_COMPATIBLE_API_KEY" }
    return { keyed: false, provider: null, envKey: null }
  }
}
