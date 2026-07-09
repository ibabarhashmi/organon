/**
 * ORGΛNON — THE ASK CONSOLE, THE OUTPUT-CAP TRUNCATION LAYER (Interpreter Phase 4; Rule X-INTERPRET d, S43, layer 2).
 * The Operator saw the CSS clip (layer 1); the same symptom hides a deeper cause — the AI's `max_tokens` hitting
 * mid-answer on a big COMPARE. Pure functions, no I/O:
 *   · scaleCap(factCount) — the output cap SCALES to the fact-set size (a big COMPARE gets room; a small answer stays
 *       tight), never a fixed cap that cuts a large answer.
 *   · detect(text) — a truncated finish is DETECTED (a finish-reason/length heuristic — a non-trivial generation ending
 *       without terminal punctuation is likely cut mid-sentence).
 *   · markIfTruncated(text) — an incomplete generation is honestly MARKED "(this answer was truncated — …)", NEVER a
 *       silent cut. (A continuation second-call is the alternative the doctrine allows; the honest mark is the safe
 *       default — it never risks a second ungrounded generation.)
 */
export namespace AskTruncation {
  export const BASE_MAX_TOKENS = 220 // the carried default (a 1–3 sentence answer) — the floor for a small fact set
  export const PER_FACT_TOKENS = 45 // each extra fact earns the model room to interpret it (a big COMPARE scales up)
  export const CEIL_MAX_TOKENS = 1200 // a hard ceiling (still bounded — we never let the cap run away)

  // the output cap as a function of the fact-set size — a pure, monotone scaler bounded by [BASE, CEIL]
  export function scaleCap(factCount: number, base = BASE_MAX_TOKENS): number {
    return Math.min(CEIL_MAX_TOKENS, base + Math.max(0, factCount) * PER_FACT_TOKENS)
  }

  // a generation ending WITHOUT terminal punctuation (and long enough to judge) is likely truncated mid-sentence.
  // Short answers are exempt (a terse "SOLID." style answer is complete). This is the length/finish heuristic (the raw
  // finish-reason is provider-specific and not surfaced through the phrase seam — the heuristic is the honest proxy).
  const TERMINAL = /[.!?"'’)\]]\s*$/
  export function detect(text: string): { complete: boolean } {
    const t = text.trim()
    if (t.length < 40) return { complete: true } // too short to be a mid-sentence cut
    return { complete: TERMINAL.test(t) }
  }

  export const CONTINUED_MARK = " …(this answer was truncated — ask a narrower question for the rest)"
  // mark an incomplete generation honestly (never a silent cut); a complete one is returned untouched
  export function markIfTruncated(text: string): { text: string; truncated: boolean } {
    if (detect(text).complete) return { text, truncated: false }
    return { text: text.trimEnd() + CONTINUED_MARK, truncated: true }
  }
}
