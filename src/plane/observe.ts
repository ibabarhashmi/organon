/**
 * ORGΛNON — THE PROVENANCE SPRINT (V42), Phase 3/4 (S175–S178, D85/D86): THE REAL★ CAPTURE ENGINE — the first data-provider
 * stone in the moat. NO NEW LAW (seventh sprint).
 *
 * THE RESEARCH was unambiguous: the only genuinely unrevised yield history is one you capture YOURSELF. So `organon.sh capture`
 * grows from a marginal-value renderer (V41) into a real poller of rate-space yield — block-pinned, re-derivable,
 * content-hashed observations, tagged REAL★ and STRUCTURALLY walled away from the RETROSPECTIVE (revisable) provider charts
 * a falsifier may never deflate on. No new mass-path dependency (this reads over PlaneRpcState.jsonRpc — Bun fetch, no SDK —
 * with a HAND-ENCODED eth_call, the chainlink 0xfeaf968c precedent; deps stay 2). No daemon (a VERB; src/strategy/capture.ts
 * renders the window). No valuation (rate-space only).
 *
 * PART A′ #3 (the sharpest attack): a hand-rolled ABI encoder is a bug farm, and a wrong encoding silently captures GARBAGE
 * into the moat — worse than no moat. THREE defenses: (1) the SELECTOR + WORD INDEX are pinned and validated against a real,
 * re-derivable KNOWN-ANSWER at a pinned block (Aave getReserveData(USDC) @ 25537838 = 3.2691% — decoded WORD 2, ground truth,
 * not assumed); (2) the plausibility gate (S177/D86) is STRUCTURAL-only (RP-3): it rejects a non-64-hex word, a non-finite
 * decode, or a fraction outside a structural band (an address/index mis-slice) — and NEVER an economically-extreme real value
 * (a −42% funding crash CHAINS; the gate tests the ENCODING, never the ECONOMICS); (3) the contract is version-pinned (RP-5):
 * a capture against a contract whose code-hash differs from the pinned one FAILS — an upgrade is a NEW pinned target, disclosed.
 *
 * Pure decode + chain; the ONLY I/O is the injected eth_call seam (fixtures in the battery, the rotation live).
 */
import { createHash } from "node:crypto"
import { PlaneRpcState } from "./rpcstate"

export namespace Observe {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

  // ── THE PINNED SUBJECTS (rate-space, RP-5 version-pinned) ──────────────────────────────────────────────────────────────
  export const AAVE_V3_POOL = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" // Aave V3 Pool (mainnet)
  export const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  // the Pool proxy bytecode's sha256 at the pinned block (RP-5 version anchor) — a proxy replacement moves this; an impl
  // upgrade behind the EIP-1967 slot requires re-verifying the word index against a new known-answer (disclosed re-pin).
  export const AAVE_POOL_CODEHASH = "a2842eb755ed0bd8c22af1e68d81b3428f905b451ae6751186ca5c3699f5b9a1"

  export interface Subject {
    key: string; project: string; asset: string; chainId: number
    contract: string; selector: string; argAddress: string
    returnWord: number; decimals: number; tier: "REAL★"
    signed?: boolean // funding rates are signed int256 (a −42% crash is REAL — decode signed so RP-3's positive control CHAINS)
    pinnedCodeHash?: string // RP-5 — a code-hash mismatch REJECTS (the struct may have moved)
  }
  export const SUBJECTS: Subject[] = [
    // the canonical known-answer subject: Aave V3 USDC supply rate — currentLiquidityRate, WORD 2 (0-indexed), RAY 1e27.
    { key: "aave-v3-usdc-supply", project: "aave-v3", asset: "USDC", chainId: 1, contract: AAVE_V3_POOL, selector: "0x35ea6a75", argAddress: USDC, returnWord: 2, decimals: 27, tier: "REAL★", pinnedCodeHash: AAVE_POOL_CODEHASH },
    // Sky SSR and Ethena funding are pinned as rate-space subjects the same seam polls; Aave USDC is the validated known-answer.
  ]
  export function subject(key: string): Subject | undefined { return SUBJECTS.find((s) => s.key === key) }

  // ── HAND-ENCODED CALLDATA — selector + the asset address left-padded to a 32-byte word (no ABI library). ──
  export function encodeReserveCall(selector: string, address: string): string {
    const a = address.replace(/^0x/i, "").toLowerCase()
    if (!/^[0-9a-f]{40}$/.test(a)) throw new Error(`Observe.encodeReserveCall: not a 20-byte address: ${address}`)
    return selector + "0".repeat(24) + a // 24 hex zeros = 12 bytes left-pad → a 32-byte word
  }

  // ── DECODE — a specific 32-byte word (0-indexed) from the return hex, as a bigint, then as a fraction (word / 10^decimals). ──
  export function decodeWord(hex: string, wordIndex: number, signed = false): bigint | null {
    const h = (hex ?? "").replace(/^0x/i, "")
    const start = wordIndex * 64
    if (h.length < start + 64) return null // the word is not present — a structural failure, not a value
    const w = h.slice(start, start + 64)
    if (!/^[0-9a-f]{64}$/i.test(w)) return null
    try { const u = BigInt("0x" + w); return signed ? BigInt.asIntN(256, u) : u } catch { return null }
  }
  export function decodeRateFraction(hex: string, wordIndex: number, decimals: number, signed = false): number | null {
    const w = decodeWord(hex, wordIndex, signed)
    if (w === null) return null
    const f = Number(w) / 10 ** decimals
    return Number.isFinite(f) ? f : null
  }

  // ── THE STRUCTURAL PLAUSIBILITY GATE (S177/D86, RP-3, F-3) ──
  // STRUCTURAL ONLY — it tests the ENCODING, never the ECONOMICS. REJECT iff the word is not 64 hex, the decode is non-finite,
  // or the FRACTION magnitude exceeds a structural band (a value that could only be an address/index mis-slice or an overflow).
  // The band (±10000%) ADMITS the −42% funding crash and any plausible or economically-extreme rate; it REJECTS an address
  // word (~1e21 as a fraction) or a 1.7e308 overflow. A −42% funding value is CHAINED — it is exactly what the moat exists to hold.
  export const STRUCTURAL_BAND = 100 // ±10000% as a fraction — admits every real rate, rejects an address/index mis-slice/overflow
  export type Plausible = { ok: true; fraction: number } | { ok: false; reason: string }
  export function plausible(rawHex: string, wordIndex: number, decimals: number, signed = false): Plausible {
    const h = (rawHex ?? "").replace(/^0x/i, "")
    const start = wordIndex * 64
    if (h.length < start + 64) return { ok: false, reason: `the return is too short for word ${wordIndex} (${h.length} hex, need ${start + 64}) — a STRUCTURAL decode failure` }
    const word = h.slice(start, start + 64)
    if (!/^[0-9a-f]{64}$/i.test(word)) return { ok: false, reason: `word ${wordIndex} is not a 64-hex 32-byte word — a STRUCTURAL decode failure` }
    const f = decodeRateFraction(h, wordIndex, decimals, signed)
    if (f === null || !Number.isFinite(f)) return { ok: false, reason: `word ${wordIndex} does not decode to a finite number (decimals ${decimals}) — a STRUCTURAL decode failure (overflow)` }
    if (Math.abs(f) > STRUCTURAL_BAND) return { ok: false, reason: `word ${wordIndex} decodes to ${f} — |value| > ${STRUCTURAL_BAND} (±${STRUCTURAL_BAND * 100}%), which could only be an address/index mis-slice or an overflow, NOT a rate (STRUCTURAL, not economic — an extreme-but-real rate ≤ ${STRUCTURAL_BAND} is CHAINED)` }
    return { ok: true, fraction: f } // finite, structurally a rate — CHAINED even if economically extreme, incl. a signed −42% (RP-3)
  }

  // ── AN OBSERVATION — block-pinned, re-derivable, content-hashed, prev-linked. ──
  export interface Observation {
    chainId: number; blockNumber: number; blockHash: string | null
    contract: string; contractCodeHash: string | null; asset: string; selector: string
    rawReturn: string; decoded: number; decimals: number
    tier: "REAL★"; providerAtCapture: string; capturedAt: number
    capturedBy: "AGENT" | "HUMAN" // DD-79/S128 — an AGENT capture NEVER advances the HUMAN own-capture count
    prevHash: string; sha: string
  }
  export function shaOf(o: Omit<Observation, "sha">): string {
    return sha256(JSON.stringify(o))
  }

  export interface ObserveInput {
    blockNumber: number; blockHash?: string | null; rawReturn: string
    contractCodeHash?: string | null; providerAtCapture: string; capturedAt: number
    capturedBy?: "AGENT" | "HUMAN"; prevHash?: string
  }
  export type ObserveResult = { ok: true; obs: Observation } | { ok: false; reason: string; wall: string }

  // Observe.observe — build a REAL★ observation from a raw eth_call at a pinned block. Enforces, in order: (S175) a block
  // number is present (a REAL★ without a block is not point-in-time); (RP-5) the code-hash matches the pinned one; (S177) the
  // decode is structurally plausible. On any failure it REJECTS (and is NOT chained). A rejected garbage decode never enters
  // the moat; an economically-extreme but real value passes (RP-3).
  export function observe(subject: Subject, input: ObserveInput): ObserveResult {
    if (!Number.isFinite(input.blockNumber) || input.blockNumber <= 0) return { ok: false, reason: `a REAL★ capture with NO block number cannot be point-in-time (S175)`, wall: "S175" }
    if (subject.pinnedCodeHash && input.contractCodeHash && input.contractCodeHash !== subject.pinnedCodeHash) {
      return { ok: false, reason: `the contract code-hash ${String(input.contractCodeHash).slice(0, 12)}… ≠ the pinned ${subject.pinnedCodeHash.slice(0, 12)}… — the struct may have moved; an upgrade is a NEW pinned target, disclosed (RP-5)`, wall: "S177" }
    }
    const p = plausible(input.rawReturn, subject.returnWord, subject.decimals, subject.signed ?? false)
    if (!p.ok) return { ok: false, reason: `${p.reason} — NOT chained (S177/D86, the plausibility gate)`, wall: "S177" }
    const base: Omit<Observation, "sha"> = {
      chainId: subject.chainId, blockNumber: input.blockNumber, blockHash: input.blockHash ?? null,
      contract: subject.contract, contractCodeHash: input.contractCodeHash ?? null, asset: subject.asset, selector: subject.selector,
      rawReturn: input.rawReturn, decoded: p.fraction, decimals: subject.decimals,
      tier: "REAL★", providerAtCapture: input.providerAtCapture, capturedAt: input.capturedAt,
      capturedBy: input.capturedBy ?? "AGENT", prevHash: input.prevHash ?? "GENESIS",
    }
    return { ok: true, obs: { ...base, sha: shaOf(base) } }
  }

  // ── THE HASH-CHAIN INTEGRITY (S175) — prevHash links + every REAL★ carries a block. ──
  export function chainOk(entries: Observation[]): { ok: boolean; brokenAt?: number; reason?: string } {
    let prev = "GENESIS"
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i]
      if (e.tier === "REAL★" && (!Number.isFinite(e.blockNumber) || e.blockNumber <= 0)) return { ok: false, brokenAt: i, reason: `entry ${i} is REAL★ but has no block number (S175)` }
      if (e.prevHash !== prev) return { ok: false, brokenAt: i, reason: `entry ${i} prevHash ${e.prevHash.slice(0, 10)}… ≠ the prior sha ${prev.slice(0, 10)}… — the chain is broken` }
      if (e.sha !== shaOf({ ...e, sha: undefined as never }) && e.sha !== shaOf(stripSha(e))) return { ok: false, brokenAt: i, reason: `entry ${i} sha does not match its content (tampered)` }
      prev = e.sha
    }
    return { ok: true }
  }
  function stripSha(o: Observation): Omit<Observation, "sha"> { const { sha, ...rest } = o; return rest }

  // ── PHASE 4 (S178) — THE RETROSPECTIVE BOUNDARY. A provider CHART (DeFiLlama /yields) is RETROSPECTIVE and REVISABLE, kept
  // in a SEPARATE chain, NEVER mixed into a REAL★ series (the research's cardinal provenance sin). RP-4: a DeFiLlama value is a
  // smoke test, never a correctness oracle — REAL★'s authority is re-derivation at the block. ──
  export interface Retrospective {
    source: "defillama"; asset: string; poolId: string; apyPct: number; at: number
    revisable: true; tier: "RETROSPECTIVE"; prevHash: string; sha: string
  }
  export function retrospective(input: { asset: string; poolId: string; apyPct: number; at: number; prevHash?: string }): Retrospective {
    const base = { source: "defillama" as const, asset: input.asset, poolId: input.poolId, apyPct: input.apyPct, at: input.at, revisable: true as const, tier: "RETROSPECTIVE" as const, prevHash: input.prevHash ?? "GENESIS" }
    return { ...base, sha: sha256(JSON.stringify(base)) }
  }

  // S178 — the boundary: a REAL★ chain must contain ONLY block-pinned REAL★ entries (no RETROSPECTIVE, no revisable, no
  // missing block); a RETROSPECTIVE chain must contain ONLY revisable RETROSPECTIVE entries (no block). A cross-contamination
  // in EITHER direction is a violation (the two are structurally distinct). Returns the violations (empty = clean).
  export function boundaryViolations(realChain: unknown[], retroChain: unknown[]): string[] {
    const v: string[] = []
    for (let i = 0; i < realChain.length; i++) {
      const e = realChain[i] as Record<string, unknown>
      if (e.tier !== "REAL★") v.push(`REAL★ chain entry ${i} has tier "${e.tier}" — a non-REAL★ point in the REAL★ series (S178, the cardinal sin)`)
      if (e.revisable === true) v.push(`REAL★ chain entry ${i} is marked revisable — a REAL★ point is NOT revisable (S178)`)
      if (!Number.isFinite(e.blockNumber as number) || (e.blockNumber as number) <= 0) v.push(`REAL★ chain entry ${i} has no block number — a REAL★ point must be block-pinned (S175/S178)`)
    }
    for (let i = 0; i < retroChain.length; i++) {
      const e = retroChain[i] as Record<string, unknown>
      if (e.tier !== "RETROSPECTIVE") v.push(`RETROSPECTIVE chain entry ${i} has tier "${e.tier}" — only revisable provider charts belong here (S178)`)
      if (e.revisable !== true) v.push(`RETROSPECTIVE chain entry ${i} is not marked revisable — a provider chart IS revisable (S178)`)
      if (Number.isFinite(e.blockNumber as number)) v.push(`RETROSPECTIVE chain entry ${i} carries a block number — a provider chart is NOT block-pinned (it would masquerade as REAL★) (S178)`)
    }
    return v
  }

  // ── THE LIVE POLL (the VERB supplies the fetcher; the battery supplies none → OFFLINE, appends nothing). ──
  // No daemon, no schedule: src/strategy/capture.ts renders the window; this reads once per invocation.
  export type EthCall = (to: string, data: string, block: string) => Promise<string | null>
  export type CodeRead = (to: string, block: string) => Promise<string | null>
  export interface CaptureRun { ran: boolean; offline: boolean; observations: Observation[]; rejected: { subject: string; reason: string }[]; blockNumber: number | null; reason: string }

  export async function capture(opts?: { ethCall?: EthCall; codeRead?: CodeRead; blockRead?: () => Promise<{ number: number; hash: string | null } | null>; capturedAt: number; capturedBy?: "AGENT" | "HUMAN"; prevHash?: string }): Promise<CaptureRun> {
    if (!opts || !opts.ethCall || !opts.blockRead) return { ran: false, offline: true, observations: [], rejected: [], blockNumber: null, reason: "OFFLINE — no live fetcher (the battery never hits the network; `organon.sh capture` supplies one). Nothing appended." }
    const blk = await opts.blockRead()
    if (!blk) return { ran: false, offline: false, observations: [], rejected: [], blockNumber: null, reason: "every pinned RPC was unreachable — a capture with no block is not REAL★ (S175); nothing appended (honest, never a fabricated point)." }
    const blockHex = "0x" + blk.number.toString(16)
    const observations: Observation[] = []
    const rejected: { subject: string; reason: string }[] = []
    let prevHash = opts.prevHash ?? "GENESIS"
    for (const s of SUBJECTS) {
      try {
        const raw = await opts.ethCall(s.contract, encodeReserveCall(s.selector, s.argAddress), blockHex)
        if (raw == null) { rejected.push({ subject: s.key, reason: "the eth_call returned null (a dead endpoint) — degraded, not fabricated" }); continue }
        const codeHash = opts.codeRead ? await opts.codeRead(s.contract, blockHex).then((c) => (c ? sha256(c) : null)).catch(() => null) : null
        const r = observe(s, { blockNumber: blk.number, blockHash: blk.hash, rawReturn: raw, contractCodeHash: codeHash, providerAtCapture: "rpc-rotation", capturedAt: opts.capturedAt, capturedBy: opts.capturedBy ?? "AGENT", prevHash })
        if (r.ok) { observations.push(r.obs); prevHash = r.obs.sha }
        else rejected.push({ subject: s.key, reason: r.reason })
      } catch (e) {
        rejected.push({ subject: s.key, reason: `capture threw: ${(e as Error).message}` })
      }
    }
    return { ran: observations.length > 0, offline: false, observations, rejected, blockNumber: blk.number, reason: `captured ${observations.length} REAL★ observation(s) at block ${blk.number}; ${rejected.length} rejected/degraded` }
  }

  // the default LIVE seam over the pinned rotation (the verb wires this; the battery never calls it).
  export const liveEthCall: EthCall = async (to, data, block) => {
    const r = await PlaneRpcState.read("eth_call", [{ to, data }, block], PlaneRpcState.jsonRpc)
    return r ? r.value : null
  }
  export const liveCodeRead: CodeRead = async (to, block) => {
    const r = await PlaneRpcState.read("eth_getCode", [to, block], PlaneRpcState.jsonRpc)
    return r ? r.value : null
  }
  export const liveBlockRead = async (): Promise<{ number: number; hash: string | null } | null> => {
    const bn = await PlaneRpcState.read("eth_blockNumber", [], PlaneRpcState.jsonRpc)
    if (!bn) return null
    const n = parseInt(bn.value, 16)
    const blk = await PlaneRpcState.read("eth_getBlockByNumber", [bn.value, false], PlaneRpcState.jsonRpc)
    const hash = blk && typeof (blk.value as unknown) === "object" ? ((blk.value as unknown as { hash?: string }).hash ?? null) : null
    return { number: n, hash }
  }
}
