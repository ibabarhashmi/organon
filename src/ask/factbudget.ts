/**
 * ORGΛNON — THE ASK CONSOLE, THE PRE-AI FACT-BUDGET LAYER (Interpreter Phase 4; Rule X-INTERPRET d, S43, layer 3). The
 * deepest truncation cause: a large fact set trimmed BEFORE the model sees it, so the model explains data it never
 * received — worse than an obvious clip, because it reads as complete. The fix is a pure, deterministic budgeter:
 *   · budget(facts, maxFacts) — prioritize (deciding > context > other), keep the highest-priority up to the budget in
 *       their ORIGINAL order; if it MUST reduce, the reduction is EXPLICIT — the returned `summarizedNote` NAMES how many
 *       lower-priority facts were summarized, so the answer can say so. NEVER a silent drop.
 * Deterministic (a stable sort keyed on the original index) — the same fact set always budgets identically.
 */
import type { Explain } from "../analytics/explain"

export namespace AskFactBudget {
  export const DEFAULT_MAX_FACTS = 40 // the cap of fact rows handed to the model (well above a normal answer; bites on a big COMPARE)

  export interface Budgeted { facts: Explain.FactRow[]; summarizedNote: string | null; reduced: boolean }

  const priority = (r: Explain.FactRow): number => (r.contribution === "deciding" ? 0 : r.contribution === "context" ? 1 : 2)

  // budget the fact set: keep the `maxFacts` highest-priority rows (ties broken by original order), preserving their
  // original order among the kept; if anything is dropped, return an EXPLICIT note naming the count (never silent).
  export function budget(facts: Explain.FactRow[], maxFacts = DEFAULT_MAX_FACTS): Budgeted {
    if (facts.length <= maxFacts) return { facts, summarizedNote: null, reduced: false }
    const indexed = facts.map((r, i) => ({ r, i }))
    const keptIdx = new Set(
      [...indexed].sort((a, b) => priority(a.r) - priority(b.r) || a.i - b.i).slice(0, maxFacts).map((x) => x.i),
    )
    const kept = indexed.filter((x) => keptIdx.has(x.i)).map((x) => x.r) // original order among the kept
    const dropped = facts.length - kept.length
    const note = `${dropped} lower-priority fact${dropped > 1 ? "s were" : " was"} summarized to fit the model's budget (the ${maxFacts} highest-priority facts were shown; nothing was invented and nothing was silently dropped — ask about a specific strategy or axis for the rest)`
    return { facts: kept, summarizedNote: note, reduced: true }
  }
}
