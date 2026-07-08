/**
 * ORGΛNON — THE ASK CONSOLE, the deterministic INTENT ROUTER (Crown-Jewel Phase 6; Rule X-ASK a). The AI is the dumbest
 * component in the system: the router maps a natural-language query to a CLOSED intent enum, deterministically (pattern
 * rules now; the LLM classifier in Phase 7 is CONSTRAINED to this same enum). Every branch is a deterministic engine tool;
 * an unmappable query → UNSUPPORTED (a safe fallback, never an invented branch). The router computes NOTHING about a
 * strategy — it only routes; the engine tools (tools.ts) hold all truth.
 *
 * Pool resolution is deterministic too: a query fragment / the app-state context resolves to a recorded poolKey via the
 * shelf registry + the record — never guessed. An unresolved fragment is carried verbatim; the tool answers "not found".
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"

export namespace AskRouter {
  export type IntentKind = "STRATEGY_LOOKUP" | "DATA_QUERY" | "VALIDATION" | "COMPARE" | "EXPLAIN" | "WORKFLOW" | "COVERAGE" | "UNSUPPORTED"
  export const INTENTS: IntentKind[] = ["STRATEGY_LOOKUP", "DATA_QUERY", "VALIDATION", "COMPARE", "EXPLAIN", "WORKFLOW", "COVERAGE", "UNSUPPORTED"]
  // the CLOSED map — every intent → exactly one deterministic engine tool (mirrors the pinned crownjewel-pins.ask.intentToTool)
  export const INTENT_TOOL: Record<IntentKind, string> = {
    STRATEGY_LOOKUP: "scorecardFor", DATA_QUERY: "metric", VALIDATION: "stampFor", COMPARE: "compare",
    EXPLAIN: "glossary", WORKFLOW: "workflow", COVERAGE: "coverageMatrix", UNSUPPORTED: "fallback",
  }

  export interface Intent {
    kind: IntentKind
    tool: string
    raw: string // the original query (verbatim)
    poolKey?: string // a RESOLVED recorded poolKey (undefined if the fragment resolved to nothing)
    poolTerm?: string // the raw strategy fragment (carried when unresolved → the tool answers "not found")
    poolKeyB?: string // COMPARE — the second resolved poolKey
    poolTermB?: string
    field?: string // DATA_QUERY — the resolved axis/metric ("tvl-trend" · "funding-regime" · "peg" · "liquidity-depth" · "yield-reality" · "unlock-overhang" · "counterparty")
    term?: string // EXPLAIN — the glossary term
  }

  // ── the recorded universe (the shelf registry + the record keys) — for deterministic name→poolKey resolution ──
  interface RegPool { poolKey: string; name: string; symbol: string; project: string; vertical?: string }
  function universe(): RegPool[] {
    const p = path.join(PKG_ROOT, "data", "honesty", "shelf-registry.json")
    if (!existsSync(p)) return []
    try {
      const j = JSON.parse(readFileSync(p, "utf8")) as { pools: { poolKey: string; name: string; symbol: string; vertical?: string }[] }
      return j.pools.map((e) => ({ poolKey: e.poolKey, name: e.name, symbol: e.symbol, project: e.name.split(/[ :]/)[0] ?? "", vertical: e.vertical }))
    } catch { return [] }
  }

  const STOP = new Set(["is", "the", "a", "an", "of", "for", "me", "show", "tell", "about", "how", "safe", "real", "solid", "good", "risky", "on", "in", "what", "whats", "what's", "s", "yield", "this", "it", "its", "here", "there", "current", "one", "check", "reality", "look", "up", "and", "vs", "versus", "compare", "against", "stamp", "run", "validate", "overfit", "does", "mean", "explain", "to", "do", "i", "can", "you", "cover", "coverage", "which", "get", "started", "workflow", "steps", "walk", "through", "worth", "should", "peg", "tvl", "funding", "liquidity", "apy", "unlock", "counterparty", "deposits", "reserve", "carry", "p10", "p90", "median"])

  // deterministic name→poolKey resolution: score each recorded pool by how many of its tokens (project · symbol · name
  // words) appear in the fragment; the best-scoring pool wins (ties → the first registered). Zero matches → null.
  export function resolvePool(fragment: string): { poolKey?: string; term: string } {
    const frag = fragment.toLowerCase()
    const term = fragment.trim()
    if (!term) return { term }
    let best: { key: string; score: number } | null = null
    for (const p of universe()) {
      const tokens = [p.project, p.symbol, ...p.name.split(/[ :\-]+/)].map((t) => t.toLowerCase()).filter((t) => t.length >= 2 && !STOP.has(t))
      let score = 0
      for (const t of new Set(tokens)) if (frag.includes(t)) score += t.length >= 4 ? 2 : 1 // longer tokens (project names) weigh more
      // a symbol-only match is weak; require at least a project OR name-word hit to claim a pool
      if (score > 0 && (!best || score > best.score)) best = { key: p.poolKey, score }
    }
    return best && best.score >= 2 ? { poolKey: best.key, term } : { term }
  }

  // strip the intent keywords + question words → the bare strategy fragment (what's left after the "grammar")
  function fragmentOf(q: string): string {
    return q.replace(/[?.!]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w.toLowerCase())).join(" ").trim()
  }

  // the DATA_QUERY field map — a metric keyword → the scorecard axis it reads
  const FIELD: [RegExp, string][] = [
    [/\btvl\b|deposits?|money (staying|leaving|fleeing)/i, "tvl-trend"],
    [/funding|carry|p10|p90/i, "funding-regime"],
    [/\bpeg\b|depeg|\$1|dollar/i, "peg"],
    [/liquidity|reserve|slippage|exit|depth/i, "liquidity-depth"],
    [/\bapy\b|\byield\b|base|reward|emission/i, "yield-reality"],
    [/unlock|dilution|overhang/i, "unlock-overhang"],
    [/counterparty|age|size|dependency|mature|dust/i, "counterparty"],
  ]

  // the EXPLAIN glossary terms the router recognizes (the pinned set lives in tools.ts GLOSSARY; here we only DETECT one)
  const GLOSSARY_TERMS = ["sharpe", "dsr", "deflated significance", "deflation", "unverified", "not-applicable", "not applicable", "go", "no-go", "insufficient", "solid", "caution", "avoid", "peg", "tvl", "funding", "liquidity", "unlock", "counterparty", "base yield", "reward emissions", "real", "sample", "moat", "provenance", "stamp", "overfit"]

  // ── THE CLASSIFIER — a query → a CLOSED-enum Intent (deterministic; order encodes precedence). NEVER out-of-enum. ──
  export function classify(query: string, context?: { poolKey?: string }): Intent {
    const raw = query
    const q = query.toLowerCase().trim()
    const withCtx = (i: Omit<Intent, "raw" | "tool">): Intent => {
      // context fallback: a follow-up ("what about its peg?") with no nameable fragment resolves against the current pool
      if (!i.poolKey && !i.poolTerm && context?.poolKey) i.poolKey = context.poolKey
      return { ...i, raw, tool: INTENT_TOOL[i.kind] }
    }

    // COVERAGE — "what can you check / cover", "which strategies/verticals/axes"
    if (/what can you|what do you (check|cover|support|do)|your coverage|which (axes|verticals|strategies|risks)|what.*(can be|do you) (check|cover)/i.test(q))
      return withCtx({ kind: "COVERAGE" })

    // WORKFLOW — "how do I check/use…", "walk me through", "get started", "steps"
    if (/how (do|to|can|should) (i|you)|how to |walk me through|get started|getting started|where do i start|what.?s the (process|workflow)|steps to/i.test(q))
      return withCtx({ kind: "WORKFLOW" })

    // COMPARE — "X vs Y", "compare X and Y", "X versus Y", "X or Y" (a comparison of two strategies)
    const cmp = q.match(/(.+?)\s+(?:vs\.?|versus|compared? (?:to|with)|against)\s+(.+)/i)
    if (cmp || /\bcompare\b/i.test(q)) {
      let a = "", b = ""
      if (cmp) { a = cmp[1]; b = cmp[2] }
      else { const parts = q.replace(/\bcompare\b/i, "").split(/\s+and\s+|\s+vs\.?\s+|,/).map((s) => s.trim()).filter(Boolean); a = parts[0] ?? ""; b = parts[1] ?? "" }
      const ra = resolvePool(fragmentOf(a)), rb = resolvePool(fragmentOf(b))
      if ((ra.poolKey || ra.term) && (rb.poolKey || rb.term)) return withCtx({ kind: "COMPARE", poolKey: ra.poolKey, poolTerm: ra.poolKey ? undefined : ra.term, poolKeyB: rb.poolKey, poolTermB: rb.poolKey ? undefined : rb.term })
    }

    // VALIDATION — "run the stamp on X", "overfit test X", "validate X", "go/no-go on X"
    if (/\bstamp\b|overfit|\bvalidate\b|go\/no-go|go or no-go|stress[- ]test|does.*survive/i.test(q)) {
      const r = resolvePool(fragmentOf(q))
      return withCtx({ kind: "VALIDATION", poolKey: r.poolKey, poolTerm: r.poolKey ? undefined : (r.term || undefined) })
    }

    // EXPLAIN — "what is/does X mean", "explain X", "what's a peg" — a definitional question about a TERM (not a pool)
    if (/what (is|does|are|s|'s)|explain|meaning of|define|what'?s an?|tell me what/i.test(q)) {
      const term = GLOSSARY_TERMS.find((t) => q.includes(t))
      // it is EXPLAIN only if a glossary term is present AND it's not asking about a specific named strategy's metric
      if (term && !/(of|for|on)\s+\S+/.test(q.replace(new RegExp(term, "i"), ""))) return withCtx({ kind: "EXPLAIN", term })
      if (term && !resolvePool(fragmentOf(q)).poolKey) return withCtx({ kind: "EXPLAIN", term })
    }

    // STRATEGY_LOOKUP — "is X safe/solid/real", "should I…", "show me X", or a bare recognizable strategy name
    if (/\bis\b.*\b(safe|solid|real|legit|good|risky|worth|ok|fine)\b|should i|show me|tell me about|how (safe|risky|good) is|reality (check )?(of|on)/i.test(q)) {
      const r = resolvePool(fragmentOf(q))
      return withCtx({ kind: "STRATEGY_LOOKUP", poolKey: r.poolKey, poolTerm: r.poolKey ? undefined : (r.term || undefined) })
    }

    // DATA_QUERY — a specific metric of a strategy ("tvl of X", "funding p10 of BTC", "peg of usdc")
    const field = FIELD.find(([re]) => re.test(q))
    if (field) {
      const r = resolvePool(fragmentOf(q))
      // a metric query resolves its OWN pool; else it falls to the CURRENT (context) pool — a leftover metric word
      // (e.g. "trend") is not a strategy name, so it must not block the context follow-up.
      const poolKey = r.poolKey ?? context?.poolKey
      if (poolKey) return withCtx({ kind: "DATA_QUERY", field: field[1], poolKey })
      if (r.term) return withCtx({ kind: "DATA_QUERY", field: field[1], poolTerm: r.term }) // a NAMED-but-unresolved strategy → honest not-found
    }

    // a bare strategy name (no grammar) that resolves → STRATEGY_LOOKUP
    const bare = resolvePool(fragmentOf(q))
    if (bare.poolKey) return withCtx({ kind: "STRATEGY_LOOKUP", poolKey: bare.poolKey })

    // an EXPLAIN term with no pool, caught late
    const lateTerm = GLOSSARY_TERMS.find((t) => q.includes(t))
    if (lateTerm) return withCtx({ kind: "EXPLAIN", term: lateTerm })

    // nothing mapped → UNSUPPORTED (the safe fallback — an honest "here's what I can help with", never an invented branch)
    return withCtx({ kind: "UNSUPPORTED" })
  }
}
