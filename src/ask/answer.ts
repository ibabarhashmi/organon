/**
 * ORGΛNON — THE ASK CONSOLE, the deterministic ANSWER path (Crown-Jewel Phase 6; Rule X-ASK a,b,f). classify → run the
 * engine tool → compose a register-aware DETERMINISTIC templated answer. This is the KEYLESS mode (no AI) AND the AI's
 * grounding target (Phase 7 phrases these facts, gated). The FACTS are deterministic (identical across runs); the Pro
 * RAW toggle renders the pure engine facts with zero phrasing (fully reproducible). No model is anywhere in this path.
 */
import { AskRouter } from "./router"
import { AskTools } from "./tools"

export namespace Ask {
  export type Register = "simple" | "pro"
  export interface AskAnswer {
    query: string
    register: Register
    intent: AskRouter.Intent
    result: AskTools.ToolResult
    text: string // the deterministic templated answer (register-aware; the AI's grounding target)
  }

  // dispatch an intent → its ONE engine tool (async — the Stamp is async). Every branch is a deterministic engine call.
  export async function runTool(intent: AskRouter.Intent, now: number): Promise<AskTools.ToolResult> {
    switch (intent.kind) {
      case "STRATEGY_LOOKUP": return AskTools.scorecardFor(intent.poolKey, intent.poolTerm ?? intent.raw, now)
      case "DATA_QUERY": return AskTools.metric(intent.poolKey, intent.field ?? "yield-reality", intent.poolTerm ?? intent.raw, now)
      case "VALIDATION": return AskTools.stampFor(intent.poolKey, intent.poolTerm ?? intent.raw)
      case "COMPARE": return AskTools.compare(intent.poolKey, intent.poolTerm ?? intent.raw, intent.poolKeyB, intent.poolTermB ?? intent.raw, now)
      case "EXPLAIN": return AskTools.glossary(intent.term)
      case "WORKFLOW": return AskTools.workflow()
      case "COVERAGE": return AskTools.coverageMatrix()
      case "UNSUPPORTED": return AskTools.fallback()
    }
  }

  const verdictWord = (v: unknown): string => v === "SOLID" ? "solid" : v === "CAUTION" ? "worth caution" : v === "AVOID" ? "one to avoid" : v === "UNVERIFIED" ? "unverified (we can't confirm it yet)" : String(v ?? "")
  const stampSimple = (v: unknown): string => v === "GO" ? "its recorded track record survives the overfit stress test (a statistics check on the track record, NOT a safety verdict)." : v === "NO-GO" ? "its recorded track record does NOT survive the overfit stress test (a statistics check, orthogonal to whether it's 'safe')." : v === "INSUFFICIENT" ? "there isn't enough recorded history to run the overfit stress test yet — an honest not-yet, never a fabricated pass." : "the overfit stress test is unavailable — there's no recorded history for this pool to test."

  // the DETERMINISTIC templated answer — register-aware. SIMPLE leads with the plain gist and carries NO raw decimals
  // (built from qualitative fields only). PRO echoes the classified intent + the engine tool + the fact-bearing summary.
  export function templated(intent: AskRouter.Intent, result: AskTools.ToolResult, register: Register): string {
    if (register === "pro") return `[intent ${intent.kind} → engine tool ${result.tool}${result.reality !== "n/a" ? ` · ${result.reality}` : ""}]  ${result.summary}`
    // ── SIMPLE — plain, decimal-free, verdict-first ──
    let s: string
    switch (intent.kind) {
      case "STRATEGY_LOOKUP":
        s = result.ok ? `${result.meta.name} looks ${verdictWord(result.meta.verdict)}. ${result.summary.replace(/^[^—]*—\s*/, "").replace(/^[^.]*\.\s*/, "")}`.trim() : result.summary
        break
      case "DATA_QUERY":
        s = result.ok ? `${result.summary.split(". ").slice(1).join(". ") || result.summary}` : result.summary // drop the numeric lead sentence, keep the plain reason
        break
      case "VALIDATION":
        s = result.ok || result.meta.stampVerdict ? `The overfit Stamp: ${stampSimple(result.meta.stampVerdict)}` : result.summary
        break
      case "COMPARE":
        s = result.ok ? `${result.meta.aName ?? "the first"} looks ${verdictWord(result.meta.aVerdict)}; ${result.meta.bName ?? "the second"} looks ${verdictWord(result.meta.bVerdict)}. Both verdicts are the scorecard's — I only lay them side by side.` : result.summary
        break
      default:
        s = result.summary // EXPLAIN / WORKFLOW / COVERAGE / UNSUPPORTED — already plain + decimal-free
    }
    return s.trim()
  }

  // the PRO RAW toggle (X-ASK f) — the pure engine fact rows, ZERO phrasing, byte-reproducible (same facts → same text)
  export function rawFacts(result: AskTools.ToolResult): string {
    if (!result.facts.length) return `(no engine fact rows for this query — reality ${result.reality})`
    return result.facts.map((r) => `${r.id} = ${r.value}${r.threshold !== null ? ` (${r.comparator ?? ""} ${r.threshold})` : ""} [${r.outcome}/${r.contribution}]${r.provenanceRef ? ` · prov ${String(r.provenanceRef).slice(0, 10)}…` : ""}`).join("\n")
  }

  // the top-level deterministic answer (no AI) — classify → tool → templated. Phase 7 adds an optional grounded phrasing
  // layer ON TOP of this (gated); the FACTS + this templated text are the invariant the AI may phrase but never exceed.
  export async function answer(query: string, opts?: { context?: { poolKey?: string }; register?: Register; now?: number }): Promise<AskAnswer> {
    const register = opts?.register ?? "simple"
    const now = opts?.now ?? Date.parse("2026-07-08T00:00:00Z")
    const intent = AskRouter.classify(query, opts?.context)
    const result = await runTool(intent, now)
    return { query, register, intent, result, text: templated(intent, result, register) }
  }
}
