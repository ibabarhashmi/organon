import path from "node:path"
import { existsSync, readFileSync } from "node:fs"

// ORGΛNON — Attestation Hardening: the TIMESTAMP ANCHOR for pre-registration (Phase 2; Rule XV; free only).
//
// A pre-registration's "committed BEFORE the out-of-sample window" ordering must be established by a
// SUBMITTER-INDEPENDENT, free, verifiable timestamp — NEVER a number the submitter put in the submission. Two free
// anchors:
//   (primary, engine-clock) an append-only, ENGINE-controlled commitment log: the engine stamps a spec hash with ITS
//     OWN capture-day/block when the commitment ritual runs (BEFORE OOS); the submitter cannot write the timestamp.
//   (secondary, on-chain)   a finalized block timestamp read from ≥2 free RPCs (the lending overlap pattern),
//     confirmed to precede the OOS window; RPC divergence demotes it.
// A self-provided `committedAt` in the SUBMISSION is IGNORED (it is not an anchor). No matching engine commitment
// ⇒ NOT anchored ⇒ the search is treated as undeclared ⇒ CANNOT-VERIFY-SEARCH, never GO.

export namespace AttestAnchor {
  export interface Commitment {
    specHash: string
    committedAtMs: number // the ENGINE's clock at commit time (capture-day or block ts) — NOT a submission field
    anchor: "engine-clock" | "onchain-block"
    blockNumber?: number
    note?: string
  }

  // The engine-side commitment registry. Populated ONLY by the engine's own commit ritual (`register`) or read from
  // the pinned append-only log file — never from a submission. This is the whole point: a submitter cannot cause a
  // registration, so a self-attested timestamp can never masquerade as an anchor.
  const registry = new Map<string, Commitment>()
  let fileMemo: Commitment[] | null = null

  export function logPath(): string {
    // data/attest/commitments.json at the repo root (walk up from src/attest)
    let dir = import.meta.dir
    for (let i = 0; i < 10; i++) {
      const candidate = path.join(dir, "data", "attest", "commitments.json")
      if (existsSync(candidate)) return candidate
      const parent = path.dirname(dir)
      if (parent === dir) break
      dir = parent
    }
    // default (may not exist yet — read is tolerant)
    return path.join(import.meta.dir, "..", "..", "..", "..", "data", "attest", "commitments.json")
  }

  function fromFile(): Commitment[] {
    if (fileMemo) return fileMemo
    const p = logPath()
    fileMemo = existsSync(p) ? ((JSON.parse(readFileSync(p, "utf8")).commitments ?? []) as Commitment[]) : []
    return fileMemo
  }

  // The engine's commit ritual: record that the engine committed this spec hash at its own clock time. Called by the
  // engine BEFORE the OOS window (in the demo/tests this simulates the pre-registration ceremony). Idempotent per hash.
  export function register(c: Commitment): void {
    registry.set(c.specHash, c)
  }

  export function lookup(specHash: string): Commitment | null {
    if (registry.has(specHash)) return registry.get(specHash)!
    return fromFile().find((c) => c.specHash === specHash) ?? null
  }

  export interface AnchorResult {
    anchored: boolean
    reason: string
    commitment?: Commitment
  }

  // A pre-registration is anchor-verified iff an ENGINE commitment exists for the spec hash AND its engine-stamped
  // commit time strictly precedes the OOS window. The submission's own `committedAt` is never consulted here.
  export function verify(specHash: string, oosStartMs: number): AnchorResult {
    const c = lookup(specHash)
    if (!c)
      return {
        anchored: false,
        reason: "no engine-recorded commitment for this spec hash (a self-attested timestamp is not an anchor — Rule XV)",
      }
    if (!(c.committedAtMs < oosStartMs))
      return {
        anchored: false,
        reason: `engine commitment at ${c.committedAtMs} does not precede the OOS start ${oosStartMs}`,
        commitment: c,
      }
    return {
      anchored: true,
      reason: `engine ${c.anchor} commitment at ${c.committedAtMs} precedes OOS start ${oosStartMs}`,
      commitment: c,
    }
  }

  // Secondary anchor: confirm a claimed on-chain commitment block's timestamp precedes the OOS window, reading from
  // ≥2 free RPCs (the lending overlap pattern). Divergence between RPCs ⇒ demote. Network-touching; used out-of-band
  // (not in the deterministic adjudication path). Kept here so the free-source anchor is a real, callable primitive.
  const FREE_RPCS = ["https://eth-mainnet.public.blastapi.io", "https://eth.drpc.org"]
  export async function verifyOnChain(blockNumber: number, oosStartMs: number, rpcs = FREE_RPCS): Promise<AnchorResult> {
    const hex = "0x" + blockNumber.toString(16)
    const reads: number[] = []
    for (const url of rpcs) {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: [hex, false] }),
      }).catch(() => null)
      if (!res || !res.ok) continue
      const body = (await res.json().catch(() => null)) as { result?: { timestamp?: string } } | null
      if (body?.result?.timestamp) reads.push(Number(body.result.timestamp) * 1000)
    }
    if (reads.length < 2) return { anchored: false, reason: `fewer than 2 free RPCs agreed on block ${blockNumber} (need ≥2)` }
    const spread = Math.max(...reads) - Math.min(...reads)
    if (spread > 60_000) return { anchored: false, reason: `RPCs disagree on block ${blockNumber} timestamp by ${spread}ms — demoted` }
    const ts = reads[0]
    if (!(ts < oosStartMs)) return { anchored: false, reason: `block ${blockNumber} ts ${ts} does not precede OOS ${oosStartMs}` }
    return {
      anchored: true,
      reason: `on-chain block ${blockNumber} ts ${ts} (≥2 free RPCs agree) precedes OOS ${oosStartMs}`,
      commitment: { specHash: "", committedAtMs: ts, anchor: "onchain-block", blockNumber },
    }
  }

  export function _reset(): void {
    registry.clear()
    fileMemo = null
  }
}
