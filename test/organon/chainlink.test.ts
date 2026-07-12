/**
 * ORGΛNON — THE COVERAGE SPRINT, Phase 3 wall (PRICE-REAL★; S65). The Chainlink read is block-pinned → REAL★
 * (reproduces ×2 from the same call); the staleness check and the L2 Sequencer-Uptime check BITE (a stale round or a
 * down sequencer degrades honestly, never a fresh-looking lie); a feed-absent asset degrades; the bounds are PINNED.
 */
import { test, expect } from "bun:test"
import { Chainlink } from "../../src/dataplane/providers/chainlink"

const BLOCK = "0x15a61a8" // a pinned block number (hex)
const BLOCK_TS = 1_760_000_000 // the pinned block's timestamp

// encode a 5-word latestRoundData return (roundId, answer, startedAt, updatedAt, answeredInRound)
const w = (n: bigint | number) => BigInt(n).toString(16).padStart(64, "0")
const round = (answer: number, updatedAt: number, startedAt = updatedAt) => "0x" + w(1) + w(answer) + w(startedAt) + w(updatedAt) + w(1)

// a fresh USDC round (~$1.00 at 8 decimals), updated right at the block
const callFresh: Chainlink.CallImpl = async () => round(100_000_000, BLOCK_TS - 60)
// a STALE round (updatedAt a day before the block)
const callStale: Chainlink.CallImpl = async () => round(100_000_000, BLOCK_TS - 86_400)
// a dead endpoint
const callDead: Chainlink.CallImpl = async () => null

test("CHAINLINK — decodeRound decodes the 5-word latestRoundData return; price = answer/10^decimals", () => {
  const r = Chainlink.decodeRound(round(100_500_000, BLOCK_TS))!
  expect(r).not.toBeNull()
  expect(r.answer).toBe(100_500_000n)
  expect(r.updatedAt).toBe(BLOCK_TS)
  expect(Chainlink.price(r, 8)).toBeCloseTo(1.005, 6)
  expect(Chainlink.decodeRound("0x")).toBeNull() // an empty/short result → null (degrade, not a throw)
})

test("CHAINLINK — a fresh block-pinned read earns REAL★ and REPRODUCES ×2 (deterministic — reproducible against the chain)", async () => {
  const a = await Chainlink.readFeed("USDC/USD", BLOCK, BLOCK_TS, callFresh)
  const b = await Chainlink.readFeed("USDC/USD", BLOCK, BLOCK_TS, callFresh)
  expect(a.tier).toBe("REAL★")
  expect(a.reality).toBe("REAL")
  expect(a.stale).toBe(false)
  expect(a.price).toBeCloseTo(1.0, 6)
  expect({ price: a.price, tier: a.tier, note: a.note }).toEqual({ price: b.price, tier: b.tier, note: b.note }) // byte-identical ×2
})

test("CHAINLINK — the staleness check BITES: a stale round degrades to the aggregator tier (never a fresh-looking lie); the bound is PINNED", async () => {
  const r = await Chainlink.readFeed("USDC/USD", BLOCK, BLOCK_TS, callStale)
  expect(r.stale).toBe(true)
  expect(r.tier).toBe("degraded")
  expect(r.reality).toBe("SAMPLE")
  expect(r.note).toMatch(/stale/i)
  expect(Chainlink.STALENESS_BOUND_S).toBe(3600) // PINNED — a widened bound is a conscious re-pin (the S65 assert)
})

test("CHAINLINK — the L2 Sequencer-Uptime check BITES: a down sequencer degrades even a fresh price read (an L2 answer is not trusted while the sequencer is down)", async () => {
  // the price feed is fresh, but the sequencer feed answers 1 (DOWN) → degrade
  const callSeqDown: Chainlink.CallImpl = async (to) => (to === Chainlink.ARBITRUM_SEQUENCER_FEED ? round(1, BLOCK_TS - 60) : round(100_000_000, BLOCK_TS - 60))
  const down = await Chainlink.readFeed("USDC/USD", BLOCK, BLOCK_TS, callSeqDown, { feed: Chainlink.ARBITRUM_SEQUENCER_FEED })
  expect(down.sequencerOk).toBe(false)
  expect(down.tier).toBe("degraded")
  expect(down.note).toMatch(/sequencer/i)
  // the sequencer UP long enough → the same fresh read earns REAL★ (the check isn't vacuous)
  const callSeqUp: Chainlink.CallImpl = async (to) => (to === Chainlink.ARBITRUM_SEQUENCER_FEED ? round(0, BLOCK_TS - 7200) : round(100_000_000, BLOCK_TS - 60))
  const up = await Chainlink.readFeed("USDC/USD", BLOCK, BLOCK_TS, callSeqUp, { feed: Chainlink.ARBITRUM_SEQUENCER_FEED })
  expect(up.sequencerOk).toBe(true)
  expect(up.tier).toBe("REAL★")
})

test("CHAINLINK — a feed-absent asset degrades honestly (SAMPLE), and a dead endpoint degrades (never a fabricated price)", async () => {
  const absent = await Chainlink.readFeed("WBTC/EUR", BLOCK, BLOCK_TS, callFresh)
  expect(absent.tier).toBe("degraded")
  expect(absent.reality).toBe("SAMPLE")
  expect(absent.price).toBeNull()
  const dead = await Chainlink.readFeed("USDC/USD", BLOCK, BLOCK_TS, callDead)
  expect(dead.tier).toBe("degraded")
  expect(dead.price).toBeNull()
})
