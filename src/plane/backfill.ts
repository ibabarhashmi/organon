/**
 * ORGΛNON — THE BACKFILL SPRINT (V43), Phase 3 (S184–S186, D88/D89): THE ON-CHAIN BACKFILL ENGINE — the moat's second stone.
 * NO NEW LAW (an eighth sprint).
 *
 * THE REAL★ engine (V42) captures FORWARD from today, one point per run, so the archive is length-zero the day it is born and
 * the false-fire own-leg is UNJUDGEABLE for 180 captures no matter what. The research named the cure: Chainlink getRoundData
 * historical rounds give genuinely point-in-time HISTORY. GROUND TRUTH (probed live before design): getRoundData is reachable
 * over the pinned public RPC (no archive node — rounds are STORED contract state), and — beating the blueprint's DD-83
 * hypothesis — there ARE genuinely RATE-SPACE Chainlink feeds: rETH/ETH is a unitless redemption RATIO (18-dec) whose slope IS
 * the RocketPool staking yield. So `organon.sh backfill` walks a rate feed's historical rounds and chains them REAL-DERIVED:
 * re-derivable at each round (getRoundData(roundId) reproduces it forever — rounds are immutable), but THIRD-PARTY-sourced, a
 * TIER between REAL★ (own live, block-pinned) and RETROSPECTIVE (revisable). It never mixes tiers; it rejects any point that
 * does not re-derive; and it never chains a PRICE feed as a rate (the observable must match the source — S187).
 *
 * PART A′ #3 (the sharpest attack, refined by ground truth): most rate observables are NOT on Chainlink (Aave's supply rate
 * lives in the Pool; the subgraph is DEAD), so those stay FORWARD-ONLY, honestly. The reachable rate feed (rETH/ETH) is a
 * genuinely rate-space exchange ratio; FRAX/USD is the S187 negative control (a price, never chained as a rate).
 *
 * PART F #3 (F-3/RP-3): Chainlink round IDs encode phaseId in the high 16 bytes — roundId = (phaseId << 64) | aggregatorRoundId.
 * When an aggregator is upgraded the phase increments and round IDs jump discontinuously; a naive roundId-- loop hits a phase
 * boundary, reverts/zeroes, and SILENTLY truncates. The walker decomposes roundId, walks each phase's rounds, crosses phase
 * boundaries DELIBERATELY, and states the reachable depth PER PHASE — a truncation is visible, never hidden.
 *
 * No new mass-path dependency (this reads over PlaneRpcState.jsonRpc — Bun fetch, no SDK — with a HAND-ENCODED getRoundData
 * eth_call; deps stay 2, S186). No daemon (a VERB). No valuation (rate-space exchange ratios, not USD prices).
 *
 * Pure decode + chain; the ONLY I/O is the injected eth_call seam (fixtures in the battery, the rotation live).
 */
import { createHash } from "node:crypto"
import { PlaneRpcState } from "./rpcstate"

export namespace Backfill {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

  // ── THE PINNED FEEDS (DD-83, probed live before design) — rate-space via Chainlink getRoundData, or the S187 negative control. ──
  export type ObservableType = "exchange-rate" | "rate" | "price"
  export interface Feed {
    key: string; feedAddress: string; description: string
    observableType: ObservableType; decimals: number; tier: "REAL-DERIVED"
    pinnedCodeHash?: string
  }
  export const FEEDS: Feed[] = [
    // rETH/ETH — a genuinely RATE-SPACE Chainlink feed: the rETH redemption ratio (18-dec), whose slope IS the staking yield.
    // getRoundData walks its real history; phaseId 2 is deeply historical. REAL-DERIVED, re-derivable at each round.
    { key: "reth-eth-exchange-rate", feedAddress: "0x536218f9E9Eb48863970252233c8F271f554C2d0", description: "RETH / ETH", observableType: "exchange-rate", decimals: 18, tier: "REAL-DERIVED", pinnedCodeHash: "330cc39684c86b86aaffa993fe3404625371898b472845b18c8659db25965056" },
    // FRAX/USD — a PRICE feed, the S187 NEGATIVE CONTROL. It is NOT a moat subject (the fence forbids valuation/USD); it exists
    // only to prove S187: a price feed chained into a RATE subject's series FAILS (the observable types do not match).
    { key: "frax-usd-price", feedAddress: "0xB9E1E3A9feFF48998E45Fa90847ed4D467E8BcfD", description: "FRAX / USD", observableType: "price", decimals: 8, tier: "REAL-DERIVED" },
  ]
  export function feed(key: string): Feed | undefined { return FEEDS.find((f) => f.key === key) }

  // ── ROUND-ID DECOMPOSITION (F-3/RP-3) — roundId = (phaseId << 64) | aggregatorRoundId. ──
  const AGG_MASK = (1n << 64n) - 1n
  export function decomposeRoundId(roundId: bigint): { phaseId: number; aggregatorRoundId: bigint } {
    return { phaseId: Number(roundId >> 64n), aggregatorRoundId: roundId & AGG_MASK }
  }
  export function composeRoundId(phaseId: number, aggregatorRoundId: bigint): bigint {
    return (BigInt(phaseId) << 64n) | (aggregatorRoundId & AGG_MASK)
  }

  // ── HAND-ENCODED CALLDATA — getRoundData(uint80) selector 0x9a6fc8f5 + the roundId left-padded to a 32-byte word (no ABI lib). ──
  export const GET_ROUND_DATA_SELECTOR = "0x9a6fc8f5"
  export function encodeGetRoundData(roundId: bigint): string {
    if (roundId < 0n) throw new Error(`Backfill.encodeGetRoundData: negative roundId ${roundId}`)
    return GET_ROUND_DATA_SELECTOR + roundId.toString(16).padStart(64, "0")
  }

  // ── DECODE the getRoundData return struct: (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80
  // answeredInRound) — words 0..4. answer is a SIGNED int256 (an exchange rate is positive, but the type is signed). ──
  export interface Round { roundId: bigint; answer: bigint; startedAt: bigint; updatedAt: bigint; answeredInRound: bigint }
  function word(hex: string, i: number): bigint | null {
    const h = (hex ?? "").replace(/^0x/i, "")
    const start = i * 64
    if (h.length < start + 64) return null
    const w = h.slice(start, start + 64)
    if (!/^[0-9a-f]{64}$/i.test(w)) return null
    try { return BigInt("0x" + w) } catch { return null }
  }
  export function decodeRound(hex: string): Round | null {
    const w0 = word(hex, 0), w1 = word(hex, 1), w2 = word(hex, 2), w3 = word(hex, 3), w4 = word(hex, 4)
    if (w0 === null || w1 === null || w2 === null || w3 === null || w4 === null) return null
    return { roundId: w0, answer: BigInt.asIntN(256, w1), startedAt: w2, updatedAt: w3, answeredInRound: w4 }
  }

  // ── THE STRUCTURAL PLAUSIBILITY GATE (S184, carried from V42/RP-3) — STRUCTURAL only: it tests the ENCODING, never the
  // ECONOMICS. REJECT a non-finite decode or a fraction outside a structural band (an address/index mis-slice). An
  // economically-extreme historical round — a depeg, a rate spike — is CHAINED. ──
  export const STRUCTURAL_BAND = 100 // ±10000% as a fraction — admits every real rate/exchange ratio, rejects an address/index mis-slice
  export function plausibleFraction(answer: bigint, decimals: number): { ok: true; fraction: number } | { ok: false; reason: string } {
    const f = Number(answer) / 10 ** decimals
    if (!Number.isFinite(f)) return { ok: false, reason: `the answer ${answer} / 10^${decimals} is not finite — a STRUCTURAL decode failure (overflow)` }
    if (Math.abs(f) > STRUCTURAL_BAND) return { ok: false, reason: `the fraction ${f} exceeds ±${STRUCTURAL_BAND} — an address/index mis-slice, not a rate (STRUCTURAL, not economic)` }
    return { ok: true, fraction: f }
  }

  // ── A REAL-DERIVED OBSERVATION — round-pinned, re-derivable, content-hashed, prev-linked. ──
  export interface Observation {
    feedAddress: string; feedCodeHash: string | null; observableType: ObservableType
    phaseId: number; aggregatorRoundId: string; roundId: string
    answer: string; decoded: number; decimals: number
    updatedAt: number; startedAt: number; answeredInRound: string
    tier: "REAL-DERIVED"; providerAtCapture: string; capturedAt: number
    prevHash: string; sha: string
  }
  export function shaOf(o: Omit<Observation, "sha">): string { return sha256(JSON.stringify(o)) }

  export interface RoundInput { roundId: bigint; rawReturn: string; feedCodeHash?: string | null; providerAtCapture: string; capturedAt: number; prevHash?: string }
  export type RoundResult = { ok: true; obs: Observation } | { ok: false; reason: string; wall: string }

  // Backfill.round — build a REAL-DERIVED observation from a getRoundData return. Enforces, in order: (S184) the return
  // DECODES and the decoded round's roundId MATCHES the requested one (a feed that returned a different round is NOT
  // re-derivable — REJECT); (RP-5) the code-hash matches the pinned one; (S184) the decode is structurally plausible; and the
  // round is finalized (updatedAt > 0). A rejected point is NOT chained (S185).
  export function round(f: Feed, input: RoundInput): RoundResult {
    const dec = decodeRound(input.rawReturn)
    if (!dec) return { ok: false, reason: `getRoundData did not decode into a 5-word round struct — a STRUCTURAL failure (S184)`, wall: "S184" }
    // RE-DERIVABILITY (S184): the returned round's roundId must equal the requested one — else this is not the round we asked
    // for, and the point does not re-derive via getRoundData(requestedRoundId). A zero/empty round (updatedAt 0) is unwritten.
    if (dec.roundId !== input.roundId) return { ok: false, reason: `the returned roundId ${dec.roundId} ≠ the requested ${input.roundId} — the point does not re-derive at its round (S184); NOT chained`, wall: "S184" }
    if (dec.updatedAt <= 0n) return { ok: false, reason: `the round ${input.roundId} has updatedAt 0 — an unwritten/empty round is not a point-in-time observation (S184); NOT chained`, wall: "S184" }
    if (f.pinnedCodeHash && input.feedCodeHash && input.feedCodeHash !== f.pinnedCodeHash) {
      return { ok: false, reason: `the feed code-hash ${String(input.feedCodeHash).slice(0, 12)}… ≠ the pinned ${f.pinnedCodeHash.slice(0, 12)}… — the feed may have been upgraded; a NEW pinned target, disclosed (RP-5)`, wall: "S184" }
    }
    const p = plausibleFraction(dec.answer, f.decimals)
    if (!p.ok) return { ok: false, reason: `${p.reason} — NOT chained (S184, the plausibility gate)`, wall: "S184" }
    const { phaseId, aggregatorRoundId } = decomposeRoundId(dec.roundId)
    const base: Omit<Observation, "sha"> = {
      feedAddress: f.feedAddress, feedCodeHash: input.feedCodeHash ?? null, observableType: f.observableType,
      phaseId, aggregatorRoundId: aggregatorRoundId.toString(), roundId: dec.roundId.toString(),
      answer: dec.answer.toString(), decoded: p.fraction, decimals: f.decimals,
      updatedAt: Number(dec.updatedAt), startedAt: Number(dec.startedAt), answeredInRound: dec.answeredInRound.toString(),
      tier: "REAL-DERIVED", providerAtCapture: input.providerAtCapture, capturedAt: input.capturedAt,
      prevHash: input.prevHash ?? "GENESIS",
    }
    return { ok: true, obs: { ...base, sha: shaOf(base) } }
  }

  // ── THE HASH-CHAIN INTEGRITY (S185) — prevHash links + every REAL-DERIVED carries a roundId + is not a REAL★/RETROSPECTIVE. ──
  export function chainOk(entries: Observation[]): { ok: boolean; brokenAt?: number; reason?: string } {
    let prev = "GENESIS"
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i]
      if ((e.tier as string) !== "REAL-DERIVED") return { ok: false, brokenAt: i, reason: `entry ${i} tier "${e.tier}" ≠ REAL-DERIVED — a cross-tier point in the REAL-DERIVED chain (S185/S188)` }
      if (!e.roundId || !/^\d+$/.test(e.roundId)) return { ok: false, brokenAt: i, reason: `entry ${i} has no roundId — a REAL-DERIVED point must be round-pinned (S184)` }
      if (e.prevHash !== prev) return { ok: false, brokenAt: i, reason: `entry ${i} prevHash ${e.prevHash.slice(0, 10)}… ≠ the prior sha ${prev.slice(0, 10)}… — the chain is broken` }
      const { sha, ...rest } = e
      if (e.sha !== shaOf(rest)) return { ok: false, brokenAt: i, reason: `entry ${i} sha does not match its content (tampered)` }
      prev = e.sha
    }
    return { ok: true }
  }

  // ── THE WALKER (F-3/RP-3) — walk a feed's historical rounds, crossing phase boundaries DELIBERATELY. Decomposes each roundId,
  // walks the current phase's aggregator rounds DOWN, records the reachable depth PER PHASE, and when a phase is exhausted
  // (a REJECT — a revert/zero/non-re-derivable), crosses to the previous phase via a probe. A walk that stops at a phase
  // boundary and claims completeness FAILS: `complete` is TRUE only if it reached the requested count without truncation, and
  // `truncatedAtPhaseBoundary` records where it stopped. The reachable depth is stated per phase, never hidden. ──
  export type Fetcher = (roundId: bigint) => Promise<string | null>
  export interface PhaseDepth { phaseId: number; maxAgg: string; minAgg: string; count: number }
  export interface WalkResult {
    points: Observation[]
    reachableByPhase: PhaseDepth[]
    phasesCrossed: number
    complete: boolean
    truncatedAtPhaseBoundary: { phaseId: number; aggregatorRoundId: string } | null
    reason: string
  }

  // probe the highest valid aggregatorRoundId in a phase (used to cross a boundary deliberately): exponential search up then
  // step down until getRoundData re-derives. Bounded; returns null if the phase has no rounds.
  async function probePhaseTop(f: Feed, phaseId: number, fetch: Fetcher, maxProbe = 20): Promise<bigint | null> {
    // exponential: find an agg that is TOO HIGH (reverts/empty), then walk down to the last valid.
    let hi = 1n
    let probes = 0
    // grow hi until an empty/revert
    while (probes++ < maxProbe) {
      const rid = composeRoundId(phaseId, hi)
      const raw = await fetch(rid)
      const r = raw ? round(f, { roundId: rid, rawReturn: raw, providerAtCapture: "probe", capturedAt: 0 }) : null
      if (!r || !r.ok) break
      hi *= 2n
    }
    // walk down from hi to the last valid agg
    for (let a = hi; a >= 1n && probes++ < maxProbe * 2; a--) {
      const rid = composeRoundId(phaseId, a)
      const raw = await fetch(rid)
      const r = raw ? round(f, { roundId: rid, rawReturn: raw, providerAtCapture: "probe", capturedAt: 0 }) : null
      if (r && r.ok) return a
    }
    return null
  }

  export async function walk(f: Feed, startRoundId: bigint, count: number, fetch: Fetcher, capturedAt: number, opts?: { crossPhases?: boolean }): Promise<WalkResult> {
    const points: Observation[] = []
    const byPhase = new Map<number, { max: bigint; min: bigint; count: number }>()
    let { phaseId, aggregatorRoundId: agg } = decomposeRoundId(startRoundId)
    let prevHash = "GENESIS"
    let phasesCrossed = 0
    let truncated: { phaseId: number; aggregatorRoundId: string } | null = null
    const crossPhases = opts?.crossPhases !== false

    while (points.length < count && phaseId >= 1) {
      const rid = composeRoundId(phaseId, agg)
      const raw = await fetch(rid)
      const r = raw ? round(f, { roundId: rid, rawReturn: raw, feedCodeHash: null, providerAtCapture: "rpc-rotation", capturedAt, prevHash }) : { ok: false as const, reason: "null return (dead endpoint)", wall: "S184" }
      if (r.ok) {
        points.push(r.obs)
        prevHash = r.obs.sha
        const rec = byPhase.get(phaseId) ?? { max: agg, min: agg, count: 0 }
        rec.max = agg > rec.max ? agg : rec.max
        rec.min = agg < rec.min ? agg : rec.min
        rec.count++
        byPhase.set(phaseId, rec)
        if (agg <= 1n) {
          // the phase floor — DELIBERATELY cross to the previous phase (F-3/RP-3), never silently stop.
          if (!crossPhases || phaseId - 1 < 1) { truncated = { phaseId, aggregatorRoundId: agg.toString() }; break }
          const top = await probePhaseTop(f, phaseId - 1, fetch)
          phasesCrossed++
          if (top === null) { truncated = { phaseId: phaseId - 1, aggregatorRoundId: "0" }; break }
          phaseId = phaseId - 1; agg = top
        } else {
          agg -= 1n
        }
      } else {
        // a boundary hit mid-phase (revert/zero) — the phase's reachable floor. Cross deliberately, never claim completeness.
        if (!crossPhases || phaseId - 1 < 1) { truncated = { phaseId, aggregatorRoundId: agg.toString() }; break }
        const top = await probePhaseTop(f, phaseId - 1, fetch)
        phasesCrossed++
        if (top === null) { truncated = { phaseId, aggregatorRoundId: agg.toString() }; break }
        phaseId = phaseId - 1; agg = top
      }
    }

    const reachableByPhase: PhaseDepth[] = [...byPhase.entries()].sort((a, b) => b[0] - a[0]).map(([p, v]) => ({ phaseId: p, maxAgg: v.max.toString(), minAgg: v.min.toString(), count: v.count }))
    const complete = points.length >= count && truncated === null
    return {
      points, reachableByPhase, phasesCrossed, complete, truncatedAtPhaseBoundary: truncated,
      reason: complete
        ? `walked ${points.length} REAL-DERIVED rounds across ${reachableByPhase.length} phase(s), crossing ${phasesCrossed} boundary(ies) deliberately`
        : `reached ${points.length} of ${count} requested; ${truncated ? `stopped at phase ${truncated.phaseId} agg ${truncated.aggregatorRoundId} (a boundary, stated NOT hidden — F-3)` : "walked to the requested depth"}; ${phasesCrossed} phase boundary(ies) crossed`,
    }
  }

  // ── THE LIVE SEAM — the VERB supplies the fetcher over the pinned rotation; the battery supplies none → OFFLINE, nothing chained. ──
  export const liveFetcher = (feedAddress: string): Fetcher => async (roundId: bigint) => {
    const r = await PlaneRpcState.read("eth_call", [{ to: feedAddress, data: encodeGetRoundData(roundId) }, "latest"], PlaneRpcState.jsonRpc)
    return r ? r.value : null
  }
  export const liveLatestRound = async (feedAddress: string): Promise<bigint | null> => {
    // latestRoundData() selector 0xfeaf968c → word 0 is the latest roundId.
    const r = await PlaneRpcState.read("eth_call", [{ to: feedAddress, data: "0xfeaf968c" }, "latest"], PlaneRpcState.jsonRpc)
    if (!r) return null
    const w = word(r.value, 0)
    return w
  }
  export const liveCodeHash = async (feedAddress: string): Promise<string | null> => {
    const r = await PlaneRpcState.read("eth_getCode", [feedAddress, "latest"], PlaneRpcState.jsonRpc)
    return r ? sha256(r.value) : null
  }
}
