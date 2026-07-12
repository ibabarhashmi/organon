/**
 * ORGΛNON — THE CHAINLINK PRICE LAYER (Coverage sprint; X-COVERAGE c/priceLayer, S65). The peg axis's price input moves
 * UP a tier: a Chainlink Data Feed read on-chain via ONE eth_call (`latestRoundData` / `getRoundData`), block-pinned →
 * REAL★ (reproducible against the chain itself, not "what an API said at T"). Free, commercially clean, no SDK — pure
 * decode over the EXISTING RPC rotation (an injectable call seam; the battery runs offline with fixtures). The staleness
 * check (`updatedAt` within the pinned bound of the block timestamp) and the L2 Sequencer-Uptime-Feed check BITE: a stale
 * answer or a down-sequencer window degrades honestly to the aggregator tier (GeckoTerminal REAL-at-timestamp → SAMPLE),
 * NEVER a fresh-looking lie. A feed-absent asset degrades the same way.
 */
export namespace Chainlink {
  export const TIER = "REAL★" as const // block-pinned, chain-reproducible — the strong tier
  export const STALENESS_BOUND_S = 3600 // updatedAt must be within 1h of the pinned block's timestamp (PINNED)
  export const SEQUENCER_GRACE_S = 3600 // an L2 answer within 1h of the sequencer coming back up is not yet trusted (PINNED)

  // the pinned feed registry (asset → aggregator address per chain). A changed entry is a conscious re-pin. Ethereum
  // mainnet Chainlink Data Feeds (L1 — no sequencer). The Arbitrum Sequencer-Uptime-Feed is pinned for the L2 check.
  export const FEEDS: Record<string, { chain: string; aggregator: string; decimals: number }> = {
    "USDC/USD": { chain: "ethereum", aggregator: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6", decimals: 8 },
    "USDT/USD": { chain: "ethereum", aggregator: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D", decimals: 8 },
    "DAI/USD": { chain: "ethereum", aggregator: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9", decimals: 8 },
    "ETH/USD": { chain: "ethereum", aggregator: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", decimals: 8 },
  }
  export const ARBITRUM_SEQUENCER_FEED = "0xFdB631F5EE196F0ed6FAa767959853A9F217697D"
  export const SELECTOR = { latestRoundData: "0xfeaf968c", getRoundData: "0x9a6fc8f5" }

  export interface RoundData { roundId: bigint; answer: bigint; startedAt: number; updatedAt: number; answeredInRound: bigint }

  // decode the 5-word latestRoundData/getRoundData return (uint80 roundId, int256 answer, uint256 startedAt,
  // uint256 updatedAt, uint80 answeredInRound). Returns null on a short/empty result (a dead endpoint → degrade, not a throw).
  export function decodeRound(hex: string): RoundData | null {
    const h = (hex ?? "").replace(/^0x/i, "")
    if (h.length < 320) return null
    const word = (i: number) => h.slice(i * 64, (i + 1) * 64)
    try {
      return {
        roundId: BigInt("0x" + word(0)),
        answer: BigInt.asIntN(256, BigInt("0x" + word(1))),
        startedAt: Number(BigInt("0x" + word(2))),
        updatedAt: Number(BigInt("0x" + word(3))),
        answeredInRound: BigInt("0x" + word(4)),
      }
    } catch { return null }
  }

  // the human price = answer / 10^decimals (a stablecoin ~ 1.0). Pure.
  export function price(r: RoundData, decimals: number): number { return Number(r.answer) / 10 ** decimals }

  // an injectable eth_call seam — (to, data, blockHex) → the hex result. The default lives in the capture script (over
  // the existing rotation); the battery injects fixtures / a dead endpoint / a stale round / a down sequencer.
  export type CallImpl = (to: string, data: string, block: string) => Promise<string | null>

  export interface FeedRead { asset: string; price: number | null; tier: "REAL★" | "degraded"; reality: "REAL" | "SAMPLE"; round: RoundData | null; stale: boolean; sequencerOk: boolean; note: string }

  // the L2 sequencer check — the Sequencer-Uptime-Feed answer is 0 (up) / 1 (down). A fresh answer within the grace
  // period after an up-transition is NOT yet trusted. Pure.
  export function sequencerOk(seq: RoundData | null, blockTs: number): boolean {
    if (!seq) return false // unresolved sequencer state → conservative: not OK (degrade)
    if (seq.answer !== 0n) return false // 1 = down
    return blockTs - seq.startedAt >= SEQUENCER_GRACE_S // up, and the grace period has passed
  }

  // read a feed at a pinned block → REAL★ if the round is fresh (staleness) AND (on an L2) the sequencer is up; else it
  // DEGRADES honestly (tier "degraded", the note names why). blockTs = the pinned block's own timestamp. seqCall is
  // provided only for L2 chains (undefined on L1 → no sequencer gate). Never throws — a dead read → degraded/SAMPLE.
  export async function readFeed(asset: string, block: string, blockTs: number, call: CallImpl, seq?: { feed: string }): Promise<FeedRead> {
    const f = FEEDS[asset]
    if (!f) return { asset, price: null, tier: "degraded", reality: "SAMPLE", round: null, stale: false, sequencerOk: true, note: "no Chainlink feed for this asset — degrade to the aggregator tier (GeckoTerminal REAL-at-timestamp), then SAMPLE" }
    const raw = await call(f.aggregator, SELECTOR.latestRoundData, block)
    const round = decodeRound(raw ?? "")
    if (!round) return { asset, price: null, tier: "degraded", reality: "SAMPLE", round: null, stale: false, sequencerOk: true, note: "the feed read did not resolve (dead endpoint / bad result) — degrade, never a fabricated price" }
    const stale = Math.abs(blockTs - round.updatedAt) > STALENESS_BOUND_S
    let seqUp = true
    if (seq) { const sraw = await call(seq.feed, SELECTOR.latestRoundData, block); seqUp = sequencerOk(decodeRound(sraw ?? ""), blockTs) }
    const ok = !stale && seqUp
    return {
      asset, price: price(round, f.decimals), round, stale, sequencerOk: seqUp,
      tier: ok ? "REAL★" : "degraded",
      reality: ok ? "REAL" : "SAMPLE",
      note: ok
        ? "block-pinned Chainlink read — REAL★ (reproducible against the chain at this block)"
        : stale ? `stale: updatedAt is more than ${STALENESS_BOUND_S}s from the block timestamp → degrade` : "the L2 sequencer was down (or within its grace period) → degrade, never a fresh-looking lie",
    }
  }
}
