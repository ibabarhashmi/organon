/**
 * ORGΛNON — THE BACKFILL SPRINT (V43), Phase 4 (S187, S188, D89): THE TIER LADDER & MIX-LABELING. NO NEW LAW (an eighth sprint).
 *
 * DD-84 — the moat's provenance ladder, pinned: REAL★ > REAL-DERIVED > REAL@ts > RETROSPECTIVE.
 *   · REAL★        — ORGΛNON captured this LIVE at block B (own, block-pinned). V42.
 *   · REAL-DERIVED — a third-party feed recorded this at round R, and it re-derives via getRoundData(roundId) (third-party,
 *                    round-pinned, re-derivable — NOT own live). V43. Weaker than REAL★, stronger than RETROSPECTIVE.
 *   · REAL@ts      — venue-sourced at a timestamp, no block.
 *   · RETROSPECTIVE — a revisable provider chart (DeFiLlama). The weakest; may never be deflated on.
 *
 * PART A′ #2 (REAL-DERIVED launders third-party data): NO — it is explicitly WEAKER than REAL★ and the ladder says so; its
 * authority is RE-DERIVABILITY, not ORGΛNON's word. PART F #2 (RP-2): the mix is labeled with the RATIO, and the own-leg's
 * confidence is capped by its weakest dominant tier — a series that is >50% REAL-DERIVED is 'predominantly third-party
 * historical'. PART A′ #3 / F #3 (S187): the observable TYPE must match the source — a PRICE feed backfilled as a RATE FAILS
 * (FRAX/USD is the negative control; rETH/ETH exchange-rate passes). S188: a cross-tier chain (REAL-DERIVED in a REAL★ series,
 * RETROSPECTIVE in either) FAILS — the cardinal provenance sin.
 *
 * Pure. No I/O.
 */
export namespace Tier {
  export type Name = "REAL★" | "REAL-DERIVED" | "REAL@ts" | "RETROSPECTIVE"
  // the ladder, PINNED (strongest first). rank 0 = strongest.
  export const LADDER: Name[] = ["REAL★", "REAL-DERIVED", "REAL@ts", "RETROSPECTIVE"]
  export function ladder(): Name[] { return [...LADDER] }
  export function rank(t: string): number { const i = LADDER.indexOf(t as Name); return i < 0 ? LADDER.length : i }
  export function stronger(a: string, b: string): boolean { return rank(a) < rank(b) }

  // ── S187 — the observable TYPE of a source feed must match the subject's observable. A price feed backfilled as a rate is a
  // category error: an exchange RATIO (rETH/ETH) is rate-space; a USD PRICE (FRAX/USD) is not. The tier is only as good as the
  // source matching the observable. Returns null on a match, or the violation reason. ──
  export type ObservableType = "rate" | "exchange-rate" | "price"
  const RATE_SPACE = new Set<ObservableType>(["rate", "exchange-rate"]) // unitless rates / ratios — NOT USD valuations
  export function observableTypeMatches(subjectObservable: ObservableType, feedObservableType: ObservableType): string | null {
    const subjectIsRate = RATE_SPACE.has(subjectObservable)
    const feedIsRate = RATE_SPACE.has(feedObservableType)
    if (subjectIsRate && !feedIsRate) return `a ${feedObservableType} feed cannot be backfilled into a ${subjectObservable} subject — a PRICE (USD valuation) is not a RATE (the observable types do not match, S187)`
    if (!subjectIsRate && feedIsRate) return `a ${feedObservableType} feed cannot be backfilled into a ${subjectObservable} subject — a rate is not a price (S187)`
    return null
  }

  // ── S188 — the CROSS-TIER CHAIN check. A chain must contain ONLY entries of its own tier: the REAL★ chain only REAL★
  // (block-pinned, no revisable), the REAL-DERIVED chain only REAL-DERIVED (round-pinned), the RETROSPECTIVE chain only
  // revisable RETROSPECTIVE. A cross-contamination in ANY direction is a violation (the cardinal provenance sin). ──
  export function crossTierViolations(chains: { realStar?: unknown[]; realDerived?: unknown[]; retrospective?: unknown[] }): string[] {
    const v: string[] = []
    const check = (arr: unknown[] | undefined, expected: Name, wants: { block?: boolean; round?: boolean; revisable?: boolean }) => {
      for (let i = 0; i < (arr?.length ?? 0); i++) {
        const e = (arr as Record<string, unknown>[])[i]
        if (e.tier !== expected) v.push(`${expected} chain entry ${i} has tier "${e.tier}" — a cross-tier point in the ${expected} series (S188, the cardinal sin)`)
        if (wants.block && !Number.isFinite(e.blockNumber as number)) v.push(`${expected} chain entry ${i} has no blockNumber — a REAL★ point must be block-pinned (S188)`)
        if (wants.round && !e.roundId) v.push(`${expected} chain entry ${i} has no roundId — a REAL-DERIVED point must be round-pinned (S188)`)
        if (wants.round && e.blockNumber !== undefined && Number.isFinite(e.blockNumber as number)) v.push(`${expected} chain entry ${i} carries a blockNumber — a REAL-DERIVED point is round-pinned, not block-pinned (it would masquerade as REAL★, S188)`)
        if (wants.revisable && e.revisable !== true) v.push(`RETROSPECTIVE chain entry ${i} is not marked revisable (S188)`)
        if (!wants.revisable && e.revisable === true) v.push(`${expected} chain entry ${i} is marked revisable — only RETROSPECTIVE is revisable (S188)`)
      }
    }
    check(chains.realStar, "REAL★", { block: true })
    check(chains.realDerived, "REAL-DERIVED", { round: true })
    check(chains.retrospective, "RETROSPECTIVE", { revisable: true })
    return v
  }

  // ── F-2/RP-2 — THE MIX LABEL. The own-archive summary ALWAYS renders the tier RATIO, not just the mix, and caps the
  // confidence by the weakest DOMINANT tier. A series that is >50% REAL-DERIVED is 'predominantly third-party historical —
  // re-derivable, but not self-captured'. The Operator must never mistake a backfilled series for the self-captured moat. ──
  export interface Mix { total: number; counts: Record<string, number>; ratios: Record<string, string>; dominantTier: Name | null; predominantlyThirdParty: boolean; label: string }
  export function mixLabel(counts: { realStar?: number; realDerived?: number; retrospective?: number }): Mix {
    const rs = counts.realStar ?? 0, rd = counts.realDerived ?? 0, rt = counts.retrospective ?? 0
    const total = rs + rd + rt
    const c: Record<string, number> = { "REAL★": rs, "REAL-DERIVED": rd, "RETROSPECTIVE": rt }
    const ratios: Record<string, string> = {}
    for (const [k, n] of Object.entries(c)) ratios[k] = total > 0 ? `${((n / total) * 100).toFixed(1)}%` : "0%"
    // the dominant tier = the tier with the most points; the WEAKEST dominant if a tie.
    let dominantTier: Name | null = null
    let best = -1
    for (const t of LADDER) { const n = c[t] ?? 0; if (n > best || (n === best && dominantTier && stronger(dominantTier, t))) { best = n; dominantTier = n > 0 ? t : dominantTier } }
    if (total === 0) dominantTier = null
    const predominantlyThirdParty = total > 0 && rd / total > 0.5
    const parts = LADDER.filter((t) => (c[t] ?? 0) > 0).map((t) => `${c[t]} ${t} (${ratios[t]})`)
    const label = total === 0
      ? "own-archive EMPTY (0 points) — UNJUDGEABLE"
      : `${total} points: ${parts.join(", ")}${predominantlyThirdParty ? " — PREDOMINANTLY THIRD-PARTY HISTORICAL (re-derivable, but NOT self-captured; the confidence is capped by the weakest dominant tier, REAL-DERIVED)" : dominantTier === "REAL★" ? " — predominantly self-captured (REAL★)" : ""}`
    return { total, counts: c, ratios, dominantTier, predominantlyThirdParty, label }
  }
}
