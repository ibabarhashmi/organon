/**
 * ORGΛNON STUDIO — THE SELECTION DOOR (Explanation Phase 0 pins + Phase 1 runner; Rule X-SELECT). V13's pool charges
 * ceil(K_eff) for effective BREADTH — correct — but the FIRST composition's SELECTION of K members from an adjudicated
 * universe of M candidates (choose-K-of-M) is search the ledger never counts. Best-of-M cherry-picking rides free. This
 * module PINS (Phase 0) the experiment that measures it and the three candidate remedies, hash-checked BEFORE Phase 1
 * runs — so the outcome cannot be run to a desired answer. The runner (Phase 1) derives EXACTLY ONE outcome:
 *
 *   · TERM       — a pinned selection surcharge added to the charge (the pick is priced),
 *   · RESTRICT   — first compositions admissible only over a declared member universe (the pick is bounded), or
 *   · NO-INFLATION — best-of-M at the current charge does not inflate survivors beyond planted truth (the pick is free).
 *
 * The frozen core adjudicates every pooled series untouched. Deterministic (seeded PRNG; no Math.random — Rule VIII).
 */
import { createHash } from "node:crypto"
import { Attest } from "../attest/submission"
import { AttestAdjudicate } from "../attest/adjudicate"
import { Keff } from "./keff"

export namespace Selection {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  function stable(v: unknown): string {
    if (v === null || typeof v !== "object") return JSON.stringify(v)
    if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`
    const k = Object.keys(v as Record<string, unknown>).sort()
    return `{${k.map((x) => `${JSON.stringify(x)}:${stable((v as Record<string, unknown>)[x])}`).join(",")}}`
  }

  // ── THE PINNED SELECTION SPEC (Phase 0; hash-checked before Phase 1 runs) ──
  export const SELECTION_SPEC = {
    rule: "X-SELECT — the pool's first-composition member selection (choose K of M) is search; measure whether best-of-M composition at the current ceil(K_eff) charge inflates survivors beyond planted truth, and price/restrict/prove-free by the derived outcome.",
    universes: { Ms: [20, 30], K: 5, N: 400, seeds: 40 },
    candidateMix: {
      noiseUniverse: "M pure-noise candidates (mean 0), the survivor-inflation instrument's null world",
      plantedUniverse: "M candidates of which plantedFrac carry a weak REAL edge (mean=weakEdgePerBar), the rest pure noise — the planted-truth world",
      noiseSd: 0.01,
      weakEdgePerBar: 0.0012,
      plantedFrac: 0.2,
    },
    bestOfM: "select the K candidates with the highest IN-SAMPLE mean return (the cherry-pick, mechanized); pool them equal-weight; adjudicate the pooled series through the frozen core",
    currentCharge: "declaredNTrials = ceil(K_eff) over the SELECTED members (the V13 charge — breadth only, no selection term)",
    remedies: {
      TERM: "declaredNTrials = ceil(K_eff) + selectionSurcharge, selectionSurcharge = ceil(log2(C(M,K))) — the bits of search spent choosing K of M, charged as extra independent comparisons (a CEILING, never a floor; a pinned closed form, not a tuned constant)",
      RESTRICT: "first compositions admissible ONLY over a member universe DECLARED before composing; the composer's schema refuses an undeclared/post-hoc universe — best-of-M cherry-picking is bounded to the declared set, so the free search cannot happen",
      NO_INFLATION: "if best-of-M at the current ceil(K_eff) charge does NOT survive above the planted-truth false-positive tolerance, member selection adds no inflation the breadth charge misses — file the evidence, retire the caveat",
    },
    outcomeCriteria: {
      falsePositiveTolerance: 0.05,
      inflationThreshold: "the pure-noise best-of-M survivor rate at the CURRENT charge EXCEEDS 2× the nominal 5% false-positive tolerance (>0.10) → inflation exists (the current charge does not absorb the pick)",
      positiveControl: "the pure-noise best-of-M at declaredNTrials=1 (uncharged for BOTH breadth and selection) MUST survive at a HIGH rate (≥0.50) — proving the instrument can SEE the cherry-pick; an instrument that cannot is void",
      derivation: "if NO inflation at the current charge → NO-INFLATION; else if the TERM surcharge restores the noise survivor rate to ≤ tolerance → TERM (the smallest remedy that prices it); else → RESTRICT (the structural bound, when no closed-form surcharge suffices)",
      robustness: "probe small M and large K/M and selection over ALREADY-DEFLATED survivors; if a fragile corner changes the remedy's shape, the outcome converts accordingly (the robustness clause)",
    },
  } as const

  export function selectionSpecHash(): string {
    return sha256(stable(SELECTION_SPEC))
  }
  export class SelectionError extends Error {}
  // Phase 1 asserts the pin is unchanged BEFORE any cell runs (a post-hoc construction tweak is caught, X-SELECT/A′#4).
  export function assertSelectionPinned(expected: string): void {
    const got = selectionSpecHash()
    if (got !== expected) throw new SelectionError(`SELECTION spec hash mismatch (X-SELECT): got ${got.slice(0, 12)}… ≠ pinned ${expected.slice(0, 12)}… — the construction was changed after pinning; the outcome would be run to a desired answer. Halt.`)
  }

  // the pinned TERM surcharge form (closed-form, not tuned): log2( C(M,K) ) rounded up — the bits of search in the pick.
  export function logChoose(M: number, K: number): number {
    // log2(C(M,K)) = (sum log2(M-i) for i<K) - (sum log2(K-i) for i<K)
    let bits = 0
    for (let i = 0; i < K; i++) bits += Math.log2(M - i) - Math.log2(i + 1)
    return bits
  }
  export function selectionSurcharge(M: number, K: number): number {
    return Math.ceil(logChoose(M, K))
  }

  // ── deterministic PRNG (seeded; no Math.random) ──
  function mulberry32(seed: number): () => number {
    let a = seed >>> 0
    return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  }
  function gauss(rng: () => number, n: number): number[] {
    const o: number[] = []
    while (o.length < n) { const u1 = Math.max(1e-12, rng()), u2 = rng(), r = Math.sqrt(-2 * Math.log(u1)); o.push(r * Math.cos(2 * Math.PI * u2)); if (o.length < n) o.push(r * Math.sin(2 * Math.PI * u2)) }
    return o
  }
  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length
  const pool = (members: number[][]): number[] => members[0].map((_, t) => members.reduce((s, m) => s + m[t], 0) / members.length)

  async function dsrAt(returns: number[], nTrials: number): Promise<number | null> {
    const sub: Attest.Submission = { id: "sel", spec: { family: "selection-probe" }, returns, declaredNTrials: nTrials, barsPerYear: 365 }
    return (await AttestAdjudicate.adjudicate(sub)).dsrAtDeclared ?? null
  }
  const PASS = 0.95

  // build a universe of M candidate return series; `planted` gives the first plantedCount candidates a real weak edge.
  function universe(seed: number, M: number, N: number, plantedCount: number): number[][] {
    return Array.from({ length: M }, (_, i) => {
      const rng = mulberry32((seed * 131 + i * 17) >>> 0)
      const edge = i < plantedCount ? SELECTION_SPEC.candidateMix.weakEdgePerBar : 0
      return gauss(rng, N).map((x) => edge + x * SELECTION_SPEC.candidateMix.noiseSd)
    })
  }
  // the adversarial best-of-M composer: the K highest in-sample-mean candidates, pooled equal-weight.
  function bestOfMPool(candidates: number[][], K: number): number[] {
    const ranked = candidates.map((c, i) => ({ i, m: mean(c) })).sort((a, b) => b.m - a.m).slice(0, K).map((r) => candidates[r.i])
    return pool(ranked)
  }

  export interface SelectionResult {
    M: number; K: number; seeds: number
    kEffAtSelected: number // typical ceil(K_eff) of the selected members (near K — the winners are ~independent noise)
    noiseSurvivorRateUncharged: number // positive control: best-of-M noise at n=1 (MUST be high)
    noiseSurvivorRateCurrent: number // best-of-M noise at the CURRENT ceil(K_eff) charge (the inflation measurement)
    noiseSurvivorRateTerm: number // best-of-M noise at the TERM (breadth + selection surcharge)
    plantedSurvivorRateCurrent: number // best-of-M planted-truth at the current charge (the pool SHOULD still find real edges)
    plantedSurvivorRateTerm: number // best-of-M planted-truth at the TERM (does the surcharge over-kill real edges?)
    surcharge: number
    inflationExists: boolean
    instrumentSees: boolean
    termRestoresHonesty: boolean
    outcome: "TERM" | "RESTRICT" | "NO-INFLATION"
  }

  // Phase 1's runner: measure survivor inflation from best-of-M selection, derive the single outcome MECHANICALLY.
  export async function runCell(M: number): Promise<SelectionResult> {
    const { K, N, seeds } = SELECTION_SPEC.universes
    const plantedCount = Math.round(M * SELECTION_SPEC.candidateMix.plantedFrac)
    const surcharge = selectionSurcharge(M, K)
    let noiseUncharged = 0, noiseCurrent = 0, noiseTerm = 0, plantedCurrent = 0, plantedTerm = 0
    let kEffSum = 0
    for (let s = 1; s <= seeds; s++) {
      // NOISE universe → best-of-M pool (the cherry-pick of pure noise)
      const nu = universe(0x5e1e + s, M, N, 0)
      const nPool = bestOfMPool(nu, K)
      const nCharge = Keff.poolChargeFromMembers(topKMembers(nu, K))
      kEffSum += nCharge.kEff
      if ((await dsrAt(nPool, 1) ?? 0) >= PASS) noiseUncharged++
      if ((await dsrAt(nPool, nCharge.charge) ?? 0) >= PASS) noiseCurrent++
      if ((await dsrAt(nPool, nCharge.charge + surcharge) ?? 0) >= PASS) noiseTerm++
      // PLANTED-truth universe → best-of-M pool (should still recover the real edges at the honest charge)
      const pu = universe(0x9a1d + s, M, N, plantedCount)
      const pPool = bestOfMPool(pu, K)
      const pCharge = Keff.poolChargeFromMembers(topKMembers(pu, K))
      if ((await dsrAt(pPool, pCharge.charge) ?? 0) >= PASS) plantedCurrent++
      if ((await dsrAt(pPool, pCharge.charge + surcharge) ?? 0) >= PASS) plantedTerm++
    }
    const noiseSurvivorRateUncharged = noiseUncharged / seeds
    const noiseSurvivorRateCurrent = noiseCurrent / seeds
    const noiseSurvivorRateTerm = noiseTerm / seeds
    const plantedSurvivorRateCurrent = plantedCurrent / seeds
    const plantedSurvivorRateTerm = plantedTerm / seeds
    const tol = SELECTION_SPEC.outcomeCriteria.falsePositiveTolerance
    const inflationExists = noiseSurvivorRateCurrent > 2 * tol
    const instrumentSees = noiseSurvivorRateUncharged >= 0.5
    const termRestoresHonesty = noiseSurvivorRateTerm <= tol
    const outcome: SelectionResult["outcome"] = !inflationExists ? "NO-INFLATION" : termRestoresHonesty ? "TERM" : "RESTRICT"
    return { M, K, seeds, kEffAtSelected: kEffSum / seeds, noiseSurvivorRateUncharged, noiseSurvivorRateCurrent, noiseSurvivorRateTerm, plantedSurvivorRateCurrent, plantedSurvivorRateTerm, surcharge, inflationExists, instrumentSees, termRestoresHonesty, outcome }
  }
  // the K highest in-sample-mean candidates (the ones the best-of-M pool is built from) — for the K_eff of the winners.
  function topKMembers(candidates: number[][], K: number): number[][] {
    return candidates.map((c, i) => ({ i, m: mean(c) })).sort((a, b) => b.m - a.m).slice(0, K).map((r) => candidates[r.i])
  }
}
