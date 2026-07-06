/**
 * ORGΛNON STUDIO — the VERDICT DIFFERENTIAL harness (Spine; Rule R-ADVISORY, A′#1). Every new statistic this sprint adds
 * (breadth/ETA, CPCV, the VoC charge on the BASELINE set) is ADVISORY-FIRST: it renders beside a verdict and NEVER alters
 * one. The proof is a differential — a FIXED set of submissions adjudicated through the frozen write-then-invoke path,
 * fingerprinted (verdict · deflated-n DSR · reproHash). The advisory panels compute OUTSIDE this path, so re-deriving the
 * set after each phase must be BYTE-IDENTICAL. This harness is the single, reusable source of that invariant: Phase 1
 * pins the set; Phases 2/3 and the walk re-derive it and assert equality. A moved fingerprint is a REGRESS (R-ADVISORY).
 *
 * Deterministic by construction (a seeded PRNG; a fixed timestamp base — Rule VIII). It touches only a throwaway Store.
 */
import { createHash } from "node:crypto"
import { Ledger } from "../ledger/ledger"
import { Studio } from "./adjudicate"

export namespace VerdictDifferential {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  export const TIMESTAMP_BASE = Date.parse("2026-07-05T00:00:00Z")
  export const SEEDS = [1, 2, 3, 4, 5] as const

  function mulberry32(seed: number): () => number {
    let a = seed >>> 0
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  function gaussians(rng: () => number, n: number): number[] {
    const out: number[] = []
    while (out.length < n) {
      const u1 = Math.max(1e-12, rng()), u2 = rng()
      const r = Math.sqrt(-2 * Math.log(u1))
      out.push(r * Math.cos(2 * Math.PI * u2))
      if (out.length < n) out.push(r * Math.sin(2 * Math.PI * u2))
    }
    return out
  }

  export interface Submission {
    seed: number
    spec: unknown
    returns: number[]
    barsPerYear: number
    timestamp: number
  }

  // The fixed, deterministic submission set — five lending-carry specs with distinct planted skill levels.
  export function submissions(): Submission[] {
    return SEEDS.map((seed) => {
      const rng = mulberry32(0xa5a5 + seed)
      const ic = 0.02 * seed
      const sig = gaussians(rng, 500), z = gaussians(rng, 500)
      const returns = sig.map((s, i) => 0.001 + ic * 0.01 * s + 0.01 * z[i])
      return {
        seed,
        spec: { family: "lending-carry", policy: "carry-tilt", rebalance: { trigger: "monthly" }, markets: [{ key: `k${seed}`, weight: 1 }] },
        returns,
        barsPerYear: 365,
        timestamp: TIMESTAMP_BASE + seed,
      }
    })
  }

  export interface Fingerprint {
    seed: number
    verdict: string
    dsr: string
    reproHash: string
    fp: string
  }

  // Adjudicate each submission through the frozen write-then-invoke path and fingerprint the verdict.
  export async function fingerprints(): Promise<Fingerprint[]> {
    const rows: Fingerprint[] = []
    for (const s of submissions()) {
      const store = new Ledger.Store()
      const v = await Studio.submit(store, { spec: s.spec, authorClass: "agent", domain: "lending", timestamp: s.timestamp, returns: s.returns, barsPerYear: s.barsPerYear })
      const a = v.attestation
      rows.push({ seed: s.seed, verdict: a.verdict, dsr: String(a.dsrAtDeclared), reproHash: a.reproHash, fp: sha256(`${a.verdict}|${a.dsrAtDeclared ?? "null"}|${a.reproHash}`) })
    }
    return rows
  }

  // The single hash that pins the whole verdict set — the invariant compared across phases.
  export async function fingerprintSetSha(): Promise<string> {
    const fps = await fingerprints()
    return sha256(JSON.stringify(fps.map((r) => r.fp)))
  }
}
