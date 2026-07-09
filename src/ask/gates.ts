/**
 * ORGΛNON — THE ASK CONSOLE, THE FIVE DETERMINISTIC GATES (Voice Phase 2; Rule X-VOICE c, X-ADVICE, X-ASK-as-amended).
 * Pure functions over `(candidateText, factSet)` that sit DOWNSTREAM of the model — a weak or jailbroken model can at
 * worst trip a gate and fall back to a template; it can NEVER talk past them. The gates are LAW; the persona is only
 * instruction. Every gate is independently positive-controlled (voice_gates.test.ts). NO model self-check — the gates
 * are string/structure functions, never "ask the model if it's sure".
 *
 *   (1) numericWhitelist — every number in the text must exist in the fact set (no model arithmetic; a derived value is
 *       engine-pre-computed as a fact). A summed/invented number → rejected.
 *   (2) verdictGuard     — the AI may name ONLY the engine's own verdict word(s); case-insensitive, negation-aware.
 *   (3) comparisonDirection — a comparative binding two fact-set entities over a fact metric must MATCH the fact ordering;
 *       an unparseable-but-fact-touching comparative rejects (fail-closed).
 *   (4) severityLexicon  — "safe"/"audited"/"risk-free"/"guaranteed"/… banned outright; "critical"/"severe" only fact-backed.
 *   (5) advicePattern    — a recommendation shape ("you should"/"buy"/"allocate"/…) → the ADVICE boundary (X-ADVICE, law).
 *
 * verdictGuard + severityLexicon share their cores with the carried Ask phrasing layer (src/ask/phrase.ts) so there is ONE
 * implementation, byte-behaviour-identical. The FACT-block groundedness gate (Explain.verifyGroundedness) is UNCHANGED and
 * carried (D11) — it runs BESIDE these five on a REASONING block (a REASONING block must be grounded too, never a story).
 */
import { Explain } from "../analytics/explain"

export namespace VoiceGates {
  // the ground truth a candidate REASONING block is checked against
  export interface FactSet {
    rows: Explain.FactRow[] // the engine fact rows (numbers + string values + strategy names) — the numeric + grounding table
    verdicts: string[] // the engine's own verdict words (verdict/aVerdict/bVerdict/stampVerdict/contractTier) the AI may name
    guarded: boolean // a verdict-bearing intent (STRATEGY_LOOKUP / COMPARE / VALIDATION / OUTLOOK / GENERAL / ADVICE_BOUNDARY)
    // the comparison-direction ground truth: for each metric, the entities + their raw fact values, plus the polarity
    // (higherIsBetter) so a QUALITATIVE comparative ("safer"/"riskier"/"worse") maps to a raw-value direction soundly.
    comparisons?: { metric: string; higherIsBetter?: boolean; ordering: { entity: string; value: number }[] }[]
  }

  // ── shared cores (also used by src/ask/phrase.ts — ONE implementation) ──────────────────────────────────────────────
  export const VERDICT_ORDER = ["INSUFFICIENT", "UNAVAILABLE", "UNVERIFIED", "CAUTION", "NO-GO", "AVOID", "SOLID", "GO"] as const
  export const NEGATED = /\b(not|never|n['’]t|no longer|isn|aren|wasn|rather than|unlike|neither|nor|instead of)\b/
  // the severity lexicon — banned OUTRIGHT (a screen never certifies); conditional words fact-backed only
  export const SEVERITY_BANNED = ["safe", "audited", "risk-free", "guaranteed", "fully secure", "100% secure"] as const
  export const SEVERITY_CONDITIONAL = ["critical", "severe"] as const
  // the advice-pattern shapes — a recommendation in any of these shapes routes to the ADVICE boundary (X-ADVICE)
  export const ADVICE_SHAPES = [
    "you should", "we recommend", "i recommend", "i'd recommend", "you ought to", "my recommendation",
    "allocate", "buy ", "sell ", "go long", "go short", "enter a position", "exit your position",
    "put your money", "invest in", "deposit into", "you could invest", "worth buying", "worth investing",
  ] as const

  // ── (2) verdictGuard core — the AI may name ONLY an allowed verdict; another verdict is fine ONLY as a negated disclaimer.
  // Longest-first consumption so "GO" inside "NO-GO" is not double-counted. Returns the violation reasons (empty = clean). ──
  export function verdictGuardCore(out: string, allowed: Set<string>): string[] {
    const reasons: string[] = []
    let work = out
    for (const w of VERDICT_ORDER) {
      const re = new RegExp(`\\b${w.replace("-", "\\-")}\\b`, "i")
      const m = re.exec(work)
      if (m) {
        if (!allowed.has(w)) {
          const before = work.slice(Math.max(0, m.index - 28), m.index).toLowerCase()
          if (!NEGATED.test(before)) reasons.push(`the AI asserted a verdict "${w}" the engine did not produce (engine: ${[...allowed].join(", ") || "none"}) — the LLM may not move a verdict or fill a gap`)
        }
        work = work.replace(new RegExp(`\\b${w.replace("-", "\\-")}\\b`, "gi"), " ")
      }
    }
    return reasons
  }

  // ── (4) severityLexicon core — the banned over-claim words are refused outright (NOT a negated disclaimer); the
  // conditional words ("critical"/"severe") only where a fact string carries that severity. Returns the violations. ──
  const OVERCLAIM = new RegExp(`\\b(${SEVERITY_BANNED.map((w) => w.replace(/[-\s]/g, "[-\\s]")).join("|")})\\b`, "gi")
  export function severityCore(out: string, rows: Explain.FactRow[]): string[] {
    const reasons: string[] = []
    let m: RegExpExecArray | null
    OVERCLAIM.lastIndex = 0
    while ((m = OVERCLAIM.exec(out))) {
      const before = out.slice(Math.max(0, m.index - 28), m.index).toLowerCase()
      if (!NEGATED.test(before)) { reasons.push(`the AI asserted an over-claim "${m[0]}" the engine never produces (it is a structural screen, it never certifies "safe"/"audited") — rejected`); break }
    }
    // the conditional severity words — allowed ONLY where a fact string value carries that severity word
    const factText = rows.map((r) => String(r.value)).join(" ").toLowerCase()
    for (const w of SEVERITY_CONDITIONAL) {
      const re = new RegExp(`\\b${w}\\b`, "i")
      if (re.test(out) && !factText.includes(w)) reasons.push(`the AI asserted severity "${w}" that no engine fact carries — a fabricated severity`)
    }
    return reasons
  }

  // ── (1) the numeric whitelist — every number in the text must resolve to a fact value/threshold (no model arithmetic).
  // Reuses the carried groundedness NUMBER matcher (Explain.verifyGroundedness's number pass), so a summed/derived number
  // that is not an engine fact is caught. Returns only the numeric violations (verdict/severity are separate gates). ──
  export function numericWhitelist(text: string, rows: Explain.FactRow[]): string[] {
    return Explain.verifyGroundedness(text, { rows }).reasons.filter((r) => /unmatched number/.test(r))
  }

  // ── (3) comparisonDirection — a comparative claim binding two fact-set entities over a metric must MATCH the fact
  // ordering. RAW words (more/higher vs less/lower) map straight to the raw value direction; QUALITATIVE words (better/
  // safer vs worse/riskier) map via the metric's polarity (higherIsBetter). A comparative that TOUCHES a known entity pair
  // over a fact metric but contradicts the ordering — or is ambiguous (both directions, or a qual word with no declared
  // polarity) — rejects (fail-closed). No comparatives / no fact-touching → clean. Deterministic; the ground truth is the
  // tool-supplied FactSet.comparisons. Over-rejection is the SAFE bias (a template beats a reversed claim, X-VOICE e). ──
  const RAW_MORE = /\b(more|higher|greater|larger|bigger|deeper)\b/i
  const RAW_LESS = /\b(less|fewer|lower|smaller|thinner|shallower)\b/i
  const QUAL_BETTER = /\b(better|safer|stronger|healthier|sturdier|outperforms?|beats?)\b/i
  const QUAL_WORSE = /\b(worse|riskier|weaker|shakier|underperforms?|trails?|lags?)\b/i
  export function comparisonDirection(text: string, comparisons: FactSet["comparisons"]): string[] {
    if (!comparisons || !comparisons.length) return []
    const reasons: string[] = []
    const lower = text.toLowerCase()
    for (const clause of lower.split(/[.;]|\bwhile\b|\bwhereas\b/)) { // per-clause so one comparative is judged at a time
      const rawMore = RAW_MORE.test(clause), rawLess = RAW_LESS.test(clause)
      const qBetter = QUAL_BETTER.test(clause), qWorse = QUAL_WORSE.test(clause)
      if (!rawMore && !rawLess && !qBetter && !qWorse) continue
      for (const cmp of comparisons) {
        const present = cmp.ordering.filter((o) => clause.includes(o.entity.toLowerCase()))
        if (present.length < 2) continue // the comparative doesn't bind two of THIS metric's entities → not this metric
        const idxByEntity = (e: string) => clause.indexOf(e.toLowerCase())
        const [lead, trail] = [...present].sort((a, b) => idxByEntity(a.entity) - idxByEntity(b.entity)) // text order
        if (lead.value === trail.value) continue // a tie — no direction to reverse
        const factLeadHigher = lead.value > trail.value
        // resolve the CLAIMED raw direction (does the AI say lead's VALUE is higher than trail's?)
        let claimLeadHigher: boolean | null = null
        const signals = [rawMore, rawLess, qBetter, qWorse].filter(Boolean).length
        if (signals > 1) claimLeadHigher = null // ambiguous (mixed directions) → fail-closed
        else if (rawMore) claimLeadHigher = true
        else if (rawLess) claimLeadHigher = false
        else if (qBetter || qWorse) {
          if (cmp.higherIsBetter === undefined) claimLeadHigher = null // a qual word with no polarity → can't map soundly
          else { const leadIsBetterClaimed = qBetter; claimLeadHigher = leadIsBetterClaimed === cmp.higherIsBetter } // better+higherIsBetter → higher value
        }
        if (claimLeadHigher === null) { reasons.push(`the comparative over "${cmp.metric}" binds ${lead.entity}/${trail.entity} but is ambiguous/unmappable — rejected (fail-closed)`); continue }
        if (claimLeadHigher !== factLeadHigher) reasons.push(`the AI reversed a comparison on "${cmp.metric}": the claim puts ${lead.entity} ${claimLeadHigher ? ">" : "<"} ${trail.entity}, but the facts have ${lead.entity} ${factLeadHigher ? ">" : "<"} ${trail.entity}`)
      }
    }
    return reasons
  }

  // ── (5) advicePattern — a recommendation shape routes to the ADVICE boundary (X-ADVICE, law). Returns whether a shape
  // was detected + which (the caller replaces the block with the ADVICE boundary, never lets the recommendation flow). ──
  export function advicePattern(text: string): { advice: boolean; shape: string | null } {
    const lower = ` ${text.toLowerCase()} `
    for (const s of ADVICE_SHAPES) if (lower.includes(s)) return { advice: true, shape: s.trim() }
    return { advice: false, shape: null }
  }

  // ── THE REASONING-BLOCK GATE SUITE — run all five (+ the carried groundedness) on a candidate REASONING block. Typed:
  // `advice` → route to the ADVICE boundary; `reasons` non-empty → reject to the deterministic template (fail-closed). ──
  export interface GateResult { ok: boolean; advice: boolean; adviceShape: string | null; reasons: string[] }
  export function runReasoningGates(text: string, fs: FactSet): GateResult {
    const adv = advicePattern(text)
    const reasons: string[] = []
    // (1) numeric whitelist — no model arithmetic
    reasons.push(...numericWhitelist(text, fs.rows))
    // the carried FACT groundedness (D11 — unchanged): no embellishment, no added causal story
    for (const r of Explain.verifyGroundedness(text, { rows: fs.rows }).reasons) if (!/unmatched number/.test(r)) reasons.push(r)
    // (2) verdict guard — only where the intent bears a verdict
    if (fs.guarded) reasons.push(...verdictGuardCore(text, new Set(fs.verdicts)))
    // (3) comparison direction
    reasons.push(...comparisonDirection(text, fs.comparisons))
    // (4) severity lexicon
    reasons.push(...severityCore(text, fs.rows))
    // (5) advice pattern is signalled separately (it ROUTES to a boundary, it is not merely a rejection)
    return { ok: reasons.length === 0 && !adv.advice, advice: adv.advice, adviceShape: adv.shape, reasons }
  }
}
