/**
 * ORGΛNON — THE MODEL CAPABILITY DESCRIPTORS (Alpha Phase 3; X-CAPABILITY). One provider-agnostic descriptor per
 * model provider/tier: the engine consumes FLAGS, never provider names — zero vendor branching outside this module
 * and provider.ts (grep-walled). THE SPLIT, absolute: a model capability may improve PRESENTATION + PIPELINE
 * EFFICIENCY ONLY (a bigger output ceiling so a large COMPARE is not cut · cleaner gate INPUT · cheaper retries ·
 * richer diagnostics). It may NEVER touch the verdict path — scorecard · stamp · decay · icir · mintrl · lineage ·
 * gates are FORBIDDEN consumers (`assertMayConsume` refuses them; the parity differential proves verdicts identical
 * under every key profile — S48). FREE descriptors mirror today's constants EXACTLY (byte-backward-compat: the free
 * path through the capability layer is a no-op wrap). The PAID tier is an explicit opt-in (AI_PAID_TIER=1) — a key
 * alone does not prove a paid plan, so the tier is declared, never guessed.
 */
import { AskProvider } from "./provider"
import { AskTruncation } from "./truncation"

export namespace AskCapability {
  export interface ModelFeatures {
    contextWindow: number // input budget class (tokens) — larger → bigger COMPARE fact-budgets before explicit summarization
    maxOutputCeiling: number // the scaleCap CEIL — presentation room, still hard-bounded
    jsonMode: boolean // native structured output — CLEANER GATE INPUT (the gates themselves are byte-untouched)
    promptCache: boolean // cheaper eval/cadence re-runs
    batch: boolean // cheaper offline eval harness
    streaming: "none" | "basic" | "rich"
    usageAccounting: boolean // diagnostics only
    reasoningControls: boolean
  }
  export interface Descriptor {
    id: string
    kind: "model"
    auth: string | null // the env-key NAME (never a value)
    tier: "free" | "paid"
    features: ModelFeatures
    limits: { rpm: number | null }
    privacy: { trainsOnPrompts: boolean } // surfaced at setup; a trains-on-prompts route is never preferred for user strategy input
    degrade: string // what absence means — ALWAYS today's behavior, byte-exact
  }

  const FREE_FEATURES: ModelFeatures = {
    contextWindow: 8_192,
    maxOutputCeiling: AskTruncation.CEIL_MAX_TOKENS, // 1200 — the carried ceiling; the free path is BYTE-EXACT
    jsonMode: false, promptCache: false, batch: false, streaming: "basic", usageAccounting: false, reasoningControls: false,
  }
  const PAID_FEATURES: ModelFeatures = {
    contextWindow: 128_000,
    maxOutputCeiling: 4_000, // a big COMPARE gets room; still a hard ceiling (never unbounded)
    jsonMode: true, promptCache: true, batch: true, streaming: "rich", usageAccounting: true, reasoningControls: true,
  }

  // AI-OPTIONAL / zero-key — the degrade target of every model descriptor: the deterministic templated mode.
  export const ZERO_KEY: Descriptor = {
    id: "none", kind: "model", auth: null, tier: "free",
    features: { ...FREE_FEATURES, contextWindow: 0, maxOutputCeiling: AskTruncation.CEIL_MAX_TOKENS, streaming: "none" },
    limits: { rpm: null },
    privacy: { trainsOnPrompts: false }, // nothing leaves the machine in deterministic mode
    degrade: "keyless IS the baseline — the deterministic templated answer, every verdict engine-derived",
  }

  const free = (id: string, auth: string, rpm: number | null, trainsOnPrompts: boolean): Descriptor => ({
    id, kind: "model", auth, tier: "free", features: FREE_FEATURES, limits: { rpm },
    privacy: { trainsOnPrompts },
    degrade: "absent → the next env key in fromEnv priority, or the deterministic mode — today's behavior, byte-exact",
  })
  const paid = (d: Descriptor): Descriptor => ({
    ...d, tier: "paid", features: PAID_FEATURES,
    privacy: { trainsOnPrompts: false }, // the paid API tiers of these providers do not train on API traffic by default
    degrade: "absent/undeclared → the FREE descriptor for the same provider — byte-exact free behavior",
  })

  // free-tier privacy flags are HONEST BEST-KNOWN policy (surfaced at setup, revisited each sprint): Google AI Studio's
  // FREE tier may use content for product improvement (flagged true); Groq/OpenAI/Anthropic API traffic is not used for
  // training by default (flagged false). A wrong flag here is a documentation bug, never a verdict input.
  export const FREE_REGISTRY: Record<string, Descriptor> = {
    "groq": free("groq", "GROQ_API_KEY", 30, false),
    "google-ai-studio": free("google-ai-studio", "GOOGLE_AI_STUDIO_KEY", 15, true),
    "openai": free("openai", "OPENAI_API_KEY", null, false),
    "anthropic": free("anthropic", "ANTHROPIC_API_KEY", null, false),
    "openai-compatible": free("openai-compatible", "OPENAI_COMPATIBLE_API_KEY", null, false),
  }
  export const PAID_REGISTRY: Record<string, Descriptor> = Object.fromEntries(
    Object.entries(FREE_REGISTRY).map(([k, d]) => [k, paid(d)]),
  )

  // the lookup — a provider (or null) + env → its descriptor. The PAID tier is DECLARED (AI_PAID_TIER=1), never
  // inferred from a key's shape; an unknown provider id degrades to the free defaults (graceful, never a throw).
  export function capabilityFor(provider: AskProvider.Provider | null, env: Record<string, string | undefined> = process.env): Descriptor {
    if (!provider) return ZERO_KEY
    const reg = env.AI_PAID_TIER === "1" ? PAID_REGISTRY : FREE_REGISTRY
    return reg[provider.id] ?? FREE_REGISTRY["openai-compatible"]
  }

  // ── THE SPLIT'S TEETH (S48, seedable) — the consuming-module allowlist. A model capability may be consumed ONLY by
  // the presentation/pipeline modules; the verdict path is FORBIDDEN. The registry asserts it, the test seeds it. ──
  export const CONSUMER_ALLOWLIST = ["src/ask/phrase.ts", "src/ask/truncation.ts", "src/ask/factbudget.ts", "src/ask/answer.ts", "src/ask/eval.ts"]
  export const VERDICT_PATH_FORBIDDEN = [
    "src/analytics/scorecard.ts", "src/studio/stamp.ts", "src/studio/decay.ts", "src/studio/icir.ts",
    "src/studio/mintrl.ts", "src/studio/lineage.ts", "src/ask/gates.ts",
  ]
  export function assertMayConsume(moduleRel: string): void {
    if (VERDICT_PATH_FORBIDDEN.includes(moduleRel))
      throw new Error(`X-CAPABILITY Halt: ${moduleRel} is on the VERDICT PATH — a model capability may never flag into it (a paid user learning a different truth is the breach this tool exists to prevent)`)
    if (!CONSUMER_ALLOWLIST.includes(moduleRel))
      throw new Error(`X-CAPABILITY: ${moduleRel} is not an allowlisted capability consumer — extend the pinned allowlist consciously (alpha-pins) or do not consume`)
  }
}
