/**
 * ORGΛNON — THE TWO-TIER PROVENANCE LABEL (Coverage sprint; X-COVERAGE c, S65). "REAL" was carrying two different
 * guarantees — a block-pinned CHAIN read (reproducible against the chain forever) and an AGGREGATOR response
 * (re-fetchable + content-hashable at a timestamp, but computed and RETROACTIVELY REVISABLE). A depositor deserves the
 * distinction. This pure module names it: REAL★ (block-pinned, chain-reproducible) vs REAL-at-timestamp (aggregator). The
 * classification is by SOURCE (a data fact, not a wish); the conscious re-label pass classifies every existing capture
 * and DISCLOSES the old/new census (the W-SO01 conscious-change pattern — the truth unchanged, its name made precise).
 * A REAL★ claim without a block-pinned source is a Halt (S65).
 */
export namespace ProvenanceTier {
  export type Tier = "REAL★" | "REAL-at-timestamp"

  // block-pinned, chain-reproducible sources → REAL★. Matched on the source string (the recorded provenance source).
  const REAL_STAR = [/chainlink/i, /getRoundData/i, /eth_call/i, /rpc/i, /\barchive\b/i, /governance/i, /envio/i, /block[- ]?pinned/i]
  // aggregator sources → REAL-at-timestamp (what the API said at time T).
  const AT_TIMESTAMP = [/llama/i, /defillama/i, /geckoterminal/i, /gecko/i, /vaults\.?fyi/i, /yields\.llama/i]

  // classify a recorded source into its provenance tier. block-pinned wins; then aggregator; a bare/unknown source is
  // conservatively REAL-at-timestamp (it is NOT a block-pinned chain read unless it PROVES it — a REAL★ claim must earn it).
  export function tierOf(source: string): Tier {
    const s = source ?? ""
    if (REAL_STAR.some((re) => re.test(s))) return "REAL★"
    if (AT_TIMESTAMP.some((re) => re.test(s))) return "REAL-at-timestamp"
    return "REAL-at-timestamp"
  }

  // a REAL★ claim MUST be backed by a block-pinned source (S65). A block number alone is not enough — the source must be
  // a chain read. Returns false for an aggregator source claiming REAL★ (the conflation Halt).
  export function isRealStarLegit(source: string, blockPinned: boolean): boolean {
    return blockPinned && tierOf(source) === "REAL★"
  }

  export interface RelabelCensus {
    protocol: "provenance-tier-relabel"
    total: number
    realStar: number
    atTimestamp: number
    old: string // the pre-pass label (everything was flat "REAL")
    breakdown: { source: string; tier: Tier }[]
    disclosure: string
  }

  // the conscious re-label pass — classify every existing capture source by tier; the old flat "REAL" → the new per-tier
  // census, DISCLOSED. Not a downgrade — the same truth, named precisely. Every source lands in exactly one tier (total).
  export function relabelCensus(sources: string[]): RelabelCensus {
    const breakdown = sources.map((source) => ({ source, tier: tierOf(source) }))
    const realStar = breakdown.filter((b) => b.tier === "REAL★").length
    return {
      protocol: "provenance-tier-relabel",
      total: sources.length,
      realStar,
      atTimestamp: sources.length - realStar,
      old: "flat REAL (pre-Coverage: every REAL capture carried one undifferentiated label)",
      breakdown,
      disclosure: "the re-label pass is conscious + disclosed: no capture is unlabeled, no silent downgrade — REAL splits into REAL★ (block-pinned) vs REAL-at-timestamp (aggregator), the same truth named precisely (W-SO01 pattern)",
    }
  }
}
