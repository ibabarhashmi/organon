/**
 * ORGΛNON PROPOSERS — the VoC (Virtue-of-Complexity) SANDBOXED PROPOSER + DoF PRICING (Spine Phase 3; Rule R-DOF,
 * A′#2/#9/#12). EXPERIMENTAL. The research's boldest surviving idea, admitted ONLY by making the model's capacity itself
 * the ledger charge: a ridge / random-features proposer may bring a thousand features, but its charge is its EFFECTIVE
 * DEGREES OF FREEDOM under a pinned penalty — dofCharge = ceil(Σ sᵢ²/(sᵢ²+λ)), sᵢ the singular values of the
 * column-standardised feature matrix (the trace of the ridge hat matrix). The mapping is PINNED pre-first-run (its
 * sha256 filed in the Phase-0 ratification value); this module recomputes it and REFUSES to run on a mismatch — a
 * post-hoc penalty adjustment cannot lower the charge (R-DOF).
 *
 * THE NOISE WALL is permanent and the hardest test in the codebase: pure noise through the FULL path (feature generation
 * → ridge fit → proposal → write-then-invoke at the DoF charge → the FROZEN deflation) must yield ZERO survivors; one
 * survivor trips the KILL-SWITCH (the proposer class disabled pending an owner decision, a first-class finding). Every
 * exploration is charged through the identical ledger gate — there is NO uncharged fit (fitting IS searching, A′#12).
 * The proposer touches SPECS, never verdicts (S-PROPOSE) — an injection changes at most the spec, never the verdict.
 */
import { createHash } from "node:crypto"
import { Ledger } from "../ledger/ledger"
import { Studio } from "../studio/adjudicate"

export namespace Voc {
  // ── the PINNED DoF charge mapping — byte-identical to the Phase-0 ratification value; its sha256 must match the pin ──
  export const DOF_MAPPING_SPEC =
    "VoC effective-DoF charge mapping (pinned pre-first-run, R-DOF): dofCharge = ceil( Σ_i s_i^2 / (s_i^2 + lambda) ) " +
    "where s_i are the singular values of the COLUMN-STANDARDISED random-feature matrix X ∈ R^{n×p}; ridge penalty " +
    "lambda = 1.0 on standardised features; the charge enters the frozen deflation via declaredNTrials = " +
    "max(dofCharge, familySize, rootCount); conservative — a CEILING, never a floor. Selection rule: the noise wall must " +
    "hold (ZERO deflation survivors across the seed battery) at the pinned lambda AND its neighbours; any penalty that " +
    "yields a noise survivor is BANNED. If the wall cannot hold, the proposer does not ship (STOP, pre-authorised)."
  export const PENALTY = 1.0 // the pinned λ
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  export function dofMappingHash(): string {
    return sha256(DOF_MAPPING_SPEC)
  }
  export class DofPinError extends Error {}
  // refuse to run unless the recomputed mapping hash equals the pin filed in Phase 0 (a post-hoc penalty change is caught)
  export function assertMappingPinned(pinnedHash: string): void {
    if (dofMappingHash() !== pinnedHash) throw new DofPinError(`VoC DoF mapping hash ${dofMappingHash().slice(0, 12)}… ≠ Phase-0 pin ${pinnedHash.slice(0, 12)}… — the mapping was adjusted post-hoc; the proposer cannot run (R-DOF)`)
  }

  export const EXPERIMENTAL = "EXPERIMENTAL — the VoC proposer is admitted behind a noise wall + a live kill-switch; its verdicts are the frozen core's, its charge is its effective degrees of freedom (R-DOF)" as const

  // ── deterministic PRNG (seeded) + gaussian — Rule VIII ──
  function mulberry32(seed: number): () => number {
    let a = seed >>> 0
    return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  }
  function gauss(rng: () => number, n: number): number[] {
    const o: number[] = []
    while (o.length < n) { const u1 = Math.max(1e-12, rng()), u2 = rng(), r = Math.sqrt(-2 * Math.log(u1)); o.push(r * Math.cos(2 * Math.PI * u2)); if (o.length < n) o.push(r * Math.sin(2 * Math.PI * u2)) }
    return o
  }

  // ── linear algebra: standardise columns; Gram; Jacobi eigenvalues of a symmetric matrix ──
  function standardiseColumns(X: number[][]): number[][] {
    const n = X.length, p = X[0].length
    const out = X.map((r) => [...r])
    for (let j = 0; j < p; j++) {
      let m = 0
      for (let i = 0; i < n; i++) m += X[i][j]
      m /= n
      let v = 0
      for (let i = 0; i < n; i++) v += (X[i][j] - m) ** 2
      const sd = Math.sqrt(v / Math.max(1, n - 1)) || 1
      for (let i = 0; i < n; i++) out[i][j] = (X[i][j] - m) / sd
    }
    return out
  }
  function gram(X: number[][]): number[][] {
    const n = X.length, p = X[0].length
    const G = Array.from({ length: p }, () => new Array<number>(p).fill(0))
    for (let a = 0; a < p; a++) for (let b = a; b < p; b++) { let s = 0; for (let i = 0; i < n; i++) s += X[i][a] * X[i][b]; G[a][b] = s; G[b][a] = s }
    return G
  }
  // classical Jacobi eigenvalue algorithm for a symmetric matrix → the eigenvalues (the singular values² of X)
  export function symmetricEigenvalues(Ain: number[][]): number[] {
    const p = Ain.length
    const A = Ain.map((r) => [...r])
    for (let sweep = 0; sweep < 100; sweep++) {
      let off = 0
      for (let a = 0; a < p; a++) for (let b = a + 1; b < p; b++) off += A[a][b] * A[a][b]
      if (off < 1e-12) break
      for (let a = 0; a < p; a++) for (let b = a + 1; b < p; b++) {
        if (Math.abs(A[a][b]) < 1e-15) continue
        const theta = (A[b][b] - A[a][a]) / (2 * A[a][b])
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1), s = t * c
        for (let k = 0; k < p; k++) { const aak = A[a][k], abk = A[b][k]; A[a][k] = c * aak - s * abk; A[b][k] = s * aak + c * abk }
        for (let k = 0; k < p; k++) { const aka = A[k][a], akb = A[k][b]; A[k][a] = c * aka - s * akb; A[k][b] = s * aka + c * akb }
      }
    }
    return Array.from({ length: p }, (_, i) => A[i][i])
  }
  // effective degrees of freedom of ridge = Σ sᵢ²/(sᵢ²+λ) = trace(X(XᵀX+λI)⁻¹Xᵀ), sᵢ² the eigenvalues of the Gram matrix
  export function effectiveDoF(Xraw: number[][], lambda: number = PENALTY): number {
    const X = standardiseColumns(Xraw)
    const ev = symmetricEigenvalues(gram(X)) // = singular values²
    return ev.reduce((s, e) => s + Math.max(0, e) / (Math.max(0, e) + lambda), 0)
  }

  // ── random Fourier features over base feature vectors (Rahimi-Recht; the canonical VoC construction) ──
  export function randomFeatures(base: number[][], p: number, seed: number): number[][] {
    const n = base.length, d = base[0].length
    const rng = mulberry32(seed)
    const W = Array.from({ length: p }, () => gauss(rng, d)) // p × d random projections
    const bvec = Array.from({ length: p }, () => rng() * 2 * Math.PI)
    const scale = Math.sqrt(2 / p)
    return Array.from({ length: n }, (_, t) => Array.from({ length: p }, (_, k) => scale * Math.cos(base[t].reduce((s, x, j) => s + x * W[k][j], 0) + bvec[k])))
  }

  // ── ridge fit (normal equations with the Gram of the standardised features) → the in-sample prediction ──
  function solveRidge(X: number[][], y: number[], lambda: number): number[] {
    const n = X.length, p = X[0].length
    const A = gram(X) // p×p
    for (let i = 0; i < p; i++) A[i][i] += lambda
    const bvec = new Array<number>(p).fill(0)
    for (let j = 0; j < p; j++) { let s = 0; for (let i = 0; i < n; i++) s += X[i][j] * y[i]; bvec[j] = s }
    // Gaussian elimination for A β = b
    const M = A.map((r, i) => [...r, bvec[i]])
    for (let col = 0; col < p; col++) {
      let piv = col
      for (let r = col + 1; r < p; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r
      ;[M[col], M[piv]] = [M[piv], M[col]]
      const d = M[col][col] || 1e-12
      for (let r = 0; r < p; r++) if (r !== col) { const f = M[r][col] / d; for (let k = col; k <= p; k++) M[r][k] -= f * M[col][k] }
    }
    return Array.from({ length: p }, (_, i) => M[i][p] / (M[i][i] || 1e-12))
  }

  export interface Proposal {
    spec: { family: "voc-ridge"; proposer: "voc"; experimental: true; featureCount: number; penalty: number; dofCharge: number }
    dofCharge: number
    effectiveDoF: number
    prediction: number[] // the ridge in-sample prediction of the target
    stratReturns: number[] // the proposed strategy's return series (position ∝ the LINEAR fitted signal)
    attribution: { twoSided: boolean; leanedOn: string; wouldBreak: string }
    experimental: string
  }
  function zscore(a: number[]): number[] {
    const m = a.reduce((s, x) => s + x, 0) / a.length
    const v = a.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, a.length - 1) || 1
    const sd = Math.sqrt(v)
    return a.map((x) => (x - m) / sd)
  }

  function colStats(X: number[][]): { mean: number[]; sd: number[] } {
    const n = X.length, p = X[0].length
    const mean = new Array<number>(p).fill(0), sd = new Array<number>(p).fill(0)
    for (let j = 0; j < p; j++) { let m = 0; for (let i = 0; i < n; i++) m += X[i][j]; mean[j] = m / n }
    for (let j = 0; j < p; j++) { let v = 0; for (let i = 0; i < n; i++) v += (X[i][j] - mean[j]) ** 2; sd[j] = Math.sqrt(v / Math.max(1, n - 1)) || 1 }
    return { mean, sd }
  }
  function applyStats(X: number[][], mean: number[], sd: number[]): number[][] {
    return X.map((r) => r.map((x, j) => (x - mean[j]) / sd[j]))
  }

  // Build a proposal from base features + a target (returns). By DEFAULT the strategy is evaluated OUT-OF-SAMPLE: the
  // ridge is fit on a train split, the strategy's returns are its performance on a HELD-OUT test split. This is the only
  // statistically honest way to evaluate a fitted model — a d-parameter in-sample fit has t-stat ~√d, which NO
  // best-of-n trial-count deflation can neutralise (that is the empirical finding of Phase 3; see the noise battery).
  // OOS measures the edge; the DoF charge then PRICES the search on top (load-bearing for REAL proposals: a 40-feature
  // model must clear a 40-trial deflation). `evalMode:"in-sample"` reproduces the overfitting BUG and is used ONLY to
  // seed the kill-switch demo. The proposal is a SPEC + a return series; it is NEVER adjudicated here — the only path to
  // a verdict is chargeAndAdjudicate (every exploration charged, A′#12).
  export function propose(base: number[][], target: number[], opts: { featureCount?: number; seed?: number; evalMode?: "oos" | "in-sample"; trainFrac?: number }): Proposal {
    const p = opts.featureCount ?? 40
    const seed = opts.seed ?? 1
    const evalMode = opts.evalMode ?? "oos"
    const trainFrac = opts.trainFrac ?? 0.6
    const feats = randomFeatures(base, p, seed)
    const n = feats.length
    const nTrain = Math.max(2, Math.floor(n * trainFrac))

    // fit on TRAIN only, standardising by TRAIN column statistics (no leakage)
    const featsTrain = feats.slice(0, nTrain)
    const { mean, sd } = colStats(featsTrain)
    const Xtr = applyStats(featsTrain, mean, sd)
    const yTrain = target.slice(0, nTrain)
    const beta = solveRidge(Xtr, yTrain, PENALTY)
    const dof = effectiveDoF(featsTrain, PENALTY) // the DoF of the (train) fit — the pinned charge
    const dofCharge = Math.ceil(dof)

    let prediction: number[], stratReturns: number[]
    if (evalMode === "in-sample") {
      // THE BUG (kill-switch seed): evaluate on the same data it was fit on — the overfit shows and survives
      const predTr = Xtr.map((r) => r.reduce((s, x, j) => s + x * beta[j], 0))
      prediction = predTr
      const pz = zscore(predTr)
      stratReturns = yTrain.map((y, i) => pz[i] * y)
    } else {
      // OUT-OF-SAMPLE: apply the train fit to the held-out test split; the strategy return is its OOS performance
      const featsTest = feats.slice(nTrain)
      const Xte = applyStats(featsTest, mean, sd)
      const predTe = Xte.map((r) => r.reduce((s, x, j) => s + x * beta[j], 0))
      prediction = predTe
      const yTest = target.slice(nTrain)
      const pz = zscore(predTe)
      stratReturns = yTest.map((y, i) => pz[i] * y)
    }
    const attribution = {
      twoSided: true,
      leanedOn: `${p} random Fourier features of the base signals fit by ridge (λ=${PENALTY}) on a ${Math.round(trainFrac * 100)}% train split; effective DoF ≈ ${dof.toFixed(1)} → charged ${dofCharge} trials`,
      wouldBreak: `the edge is measured OUT-OF-SAMPLE (held-out ${Math.round((1 - trainFrac) * 100)}%); a noise fit has no out-of-sample edge and dies on measurement, and even a genuine weak edge must then clear the ${dofCharge}-trial deflation — complexity pays its bill`,
    }
    return { spec: { family: "voc-ridge", proposer: "voc", experimental: true, featureCount: p, penalty: PENALTY, dofCharge }, dofCharge, effectiveDoF: dof, prediction, stratReturns, attribution, experimental: EXPERIMENTAL }
  }

  export interface Adjudicated {
    verdict: string
    dsrAtDeclared: number | null
    dofCharge: number
    survived: boolean // "survives the deflation" = DSR at the declared charge clears the significance bar
    familyDeclaredNTrials: number
  }
  // The ONLY path from a proposal to a verdict: register through write-then-invoke at declaredNTrials = dofCharge, then
  // adjudicate. There is NO uncharged fit → verdict path (S-PROPOSE, A′#12). The `chargeOverride` exists ONLY to seed
  // the kill-switch demo (an under-charge) — production callers never pass it; a survivor under it proves the alarm.
  export async function chargeAndAdjudicate(store: Ledger.Store, prop: Proposal, timestamp: number, chargeOverride?: number): Promise<Adjudicated> {
    const declaredNTrials = chargeOverride ?? prop.dofCharge
    const v = await Studio.submit(store, { spec: prop.spec, authorClass: "agent", domain: "voc", timestamp, returns: prop.stratReturns, barsPerYear: 365, declaredNTrials })
    const dsr = v.attestation.dsrAtDeclared ?? null
    const survived = dsr !== null && dsr >= 0.95 // clears the deflation significance bar
    return { verdict: v.attestation.verdict, dsrAtDeclared: dsr, dofCharge: prop.dofCharge, survived, familyDeclaredNTrials: v.familyDeclaredNTrials }
  }

  // ── THE NOISE WALL — pure noise through the full path must yield ZERO survivors (R-DOF) ──
  // evalMode "oos" (the shipped path) → zero survivors required; "in-sample" reproduces the overfitting BUG and is
  // expected to yield survivors (it is what the kill-switch catches, and why the in-sample regime is BANNED).
  export interface NoiseWallResult {
    evalMode: "oos" | "in-sample"
    featureCount: number
    seeds: number
    survivors: { seed: number; dsr: number | null; charge: number }[]
    allClean: boolean
    maxDsr: number
  }
  export async function noiseWall(nSeeds: number, opts: { featureCount?: number; nObs?: number; timestamp: number; evalMode?: "oos" | "in-sample"; chargePenalty?: number }): Promise<NoiseWallResult> {
    const p = opts.featureCount ?? 40
    const nObs = opts.nObs ?? 500
    const evalMode = opts.evalMode ?? "oos"
    const survivors: { seed: number; dsr: number | null; charge: number }[] = []
    let maxDsr = -Infinity
    for (let seed = 1; seed <= nSeeds; seed++) {
      const rng = mulberry32(0x00d0 + seed)
      const base = Array.from({ length: nObs }, () => gauss(rng, 3)) // pure-noise base features
      const target = gauss(rng, nObs).map((x) => x * 0.01) // pure-noise target returns
      const prop = propose(base, target, { featureCount: p, seed, evalMode })
      // λ-SWEEP (Reachability Phase 1, A′#8): probe the charge at an alternate penalty (the pinned mapping stays λ=1.0);
      // a survivor at ANY swept penalty is banned. For OOS the charge does not gate survival (noise has no OOS edge),
      // so the sweep confirms penalty-robustness; the in-sample regime (banned) is where a survivor demonstration fires.
      let chargeOverride: number | undefined
      if (opts.chargePenalty !== undefined) {
        const nTrain = Math.max(2, Math.floor(nObs * 0.6))
        chargeOverride = Math.max(1, Math.ceil(effectiveDoF(randomFeatures(base, p, seed).slice(0, nTrain), opts.chargePenalty)))
      }
      const store = new Ledger.Store()
      const adj = await chargeAndAdjudicate(store, prop, opts.timestamp + seed, chargeOverride)
      if (adj.dsrAtDeclared !== null) maxDsr = Math.max(maxDsr, adj.dsrAtDeclared)
      if (adj.survived) survivors.push({ seed, dsr: adj.dsrAtDeclared, charge: chargeOverride ?? prop.dofCharge })
    }
    return { evalMode, featureCount: p, seeds: nSeeds, survivors, allClean: survivors.length === 0, maxDsr: maxDsr === -Infinity ? 0 : maxDsr }
  }

  // ── THE λ-SWEEP (Reachability Phase 1; R-DOF, A′#8) — the noise battery across PINNED penalties × feature counts. A
  // clean sweep leaves the mapping unchanged (files its evidence anyway); a survivor-yielding setting is BANNED via a
  // mapping supersession with the seed evidence. The pinned parameters are fixed BEFORE running (in the criteria).
  export interface SweepCell { penalty: number; featureCount: number; regime: "oos" | "in-sample"; seeds: number; survivors: number; maxDsr: number }
  export async function penaltySweep(opts: { penalties: number[]; featureCounts: number[]; seeds: number; nObs?: number; timestamp: number }): Promise<{ cells: SweepCell[]; oosClean: boolean; inSampleSurvives: boolean; banned: string[] }> {
    const cells: SweepCell[] = []
    for (const penalty of opts.penalties) {
      for (const featureCount of opts.featureCounts) {
        const oos = await noiseWall(opts.seeds, { featureCount, nObs: opts.nObs, timestamp: opts.timestamp, evalMode: "oos", chargePenalty: penalty })
        cells.push({ penalty, featureCount, regime: "oos", seeds: opts.seeds, survivors: oos.survivors.length, maxDsr: +oos.maxDsr.toFixed(4) })
      }
    }
    // the seeded ban demonstration: the in-sample regime (permanently banned by the VoC supersession) yields survivors
    const bug = await noiseWall(opts.seeds, { featureCount: opts.featureCounts[0], nObs: opts.nObs, timestamp: opts.timestamp, evalMode: "in-sample", chargePenalty: opts.penalties[Math.floor(opts.penalties.length / 2)] })
    cells.push({ penalty: opts.penalties[Math.floor(opts.penalties.length / 2)], featureCount: opts.featureCounts[0], regime: "in-sample", seeds: opts.seeds, survivors: bug.survivors.length, maxDsr: +bug.maxDsr.toFixed(4) })
    const oosClean = cells.filter((c) => c.regime === "oos").every((c) => c.survivors === 0)
    const banned = cells.filter((c) => c.survivors > 0).map((c) => `${c.regime} @ λ=${c.penalty} p=${c.featureCount} (${c.survivors} survivors)`)
    return { cells, oosClean, inSampleSurvives: bug.survivors.length > 0, banned }
  }

  // ── THE KILL-SWITCH — one survivor disables the proposer class pending an owner decision (a first-class finding) ──
  export interface KillSwitch {
    tripped: boolean
    proposerDisabled: boolean
    reason: string
  }
  export function killSwitch(survivorCount: number): KillSwitch {
    return survivorCount > 0
      ? { tripped: true, proposerDisabled: true, reason: `${survivorCount} noise survivor(s) passed the deflation at their charge — the VoC proposer class is DISABLED pending an owner decision; this event is a first-class finding, never hidden (R-DOF)` }
      : { tripped: false, proposerDisabled: false, reason: "noise wall green — zero survivors; the proposer class stays admitted (advisory, EXPERIMENTAL)" }
  }
}
