/**
 * ORGΛNON STUDIO — THE HRP FIXTURE EXPERIMENT (Ensemble Phase 1; Rules U-EXPERIMENT, A′#7). The V11 HRP park's designed
 * experiment, run under its filed criterion hash-checked UNCHANGED: does Hierarchical Risk Parity produce higher
 * risk-adjusted OUT-OF-SAMPLE returns than equal-weight AND min-variance on our multi-asset fixtures? The research
 * flagged HRP's crypto evidence as MIXED; the contested is validated-first-or-parked, never adopted by citation — so the
 * outcome must resolve in OUR fixtures, and it DISPOSES the park either way (dominance → adopt; else keep parked).
 *
 * This is a PARKED-EXPERIMENT runner (like experiments.ts), NOT a portfolio-construction product — it lives outside the
 * ratification-wall-scanned surfaces (src/analytics, src/proposers) precisely because HRP is PARKED, not adopted; no HRP
 * weight renders anywhere in the product. Deterministic (seeded PRNG; no Math.random — Rule VIII). A compact, faithful
 * López-de-Prado HRP (correlation-distance → single-linkage quasi-diagonalization → recursive-bisection IVP allocation).
 */
export namespace Hrp {
  function mulberry32(seed: number): () => number {
    let a = seed >>> 0
    return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  }
  function gauss(rng: () => number, n: number): number[] {
    const o: number[] = []
    while (o.length < n) { const u1 = Math.max(1e-12, rng()), u2 = rng(), r = Math.sqrt(-2 * Math.log(u1)); o.push(r * Math.cos(2 * Math.PI * u2)); if (o.length < n) o.push(r * Math.sin(2 * Math.PI * u2)) }
    return o
  }

  // ── linear algebra over asset return columns ──
  function cov(returns: number[][]): number[][] {
    const A = returns.length, N = returns[0].length
    const mean = returns.map((r) => r.reduce((s, x) => s + x, 0) / N)
    const C = Array.from({ length: A }, () => new Array<number>(A).fill(0))
    for (let i = 0; i < A; i++) for (let j = i; j < A; j++) {
      let s = 0
      for (let t = 0; t < N; t++) s += (returns[i][t] - mean[i]) * (returns[j][t] - mean[j])
      C[i][j] = C[j][i] = s / Math.max(1, N - 1)
    }
    return C
  }
  function corrFromCov(C: number[][]): number[][] {
    const A = C.length
    const R = Array.from({ length: A }, () => new Array<number>(A).fill(0))
    for (let i = 0; i < A; i++) for (let j = 0; j < A; j++) { const d = Math.sqrt(C[i][i] * C[j][j]); R[i][j] = d === 0 ? 0 : C[i][j] / d }
    return R
  }
  // inverse-variance weights over a subset of assets (the IVP)
  function ivp(C: number[][], idxs: number[]): number[] {
    const inv = idxs.map((i) => 1 / (C[i][i] || 1e-12))
    const s = inv.reduce((a, b) => a + b, 0)
    return inv.map((x) => x / s)
  }
  // the variance of the IVP over a cluster (w' Σ w) — the recursive-bisection risk measure
  function clusterVar(C: number[][], idxs: number[]): number {
    const w = ivp(C, idxs)
    let v = 0
    for (let a = 0; a < idxs.length; a++) for (let b = 0; b < idxs.length; b++) v += w[a] * C[idxs[a]][idxs[b]] * w[b]
    return v
  }
  // single-linkage agglomerative clustering on the correlation-distance → a quasi-diagonal leaf ordering (similar assets
  // adjacent). Compact: repeatedly merge the two nearest clusters, concatenating their orderings.
  function quasiDiag(corr: number[][]): number[] {
    const A = corr.length
    const dist = (i: number, j: number) => Math.sqrt(0.5 * Math.max(0, 1 - corr[i][j]))
    let clusters: number[][] = Array.from({ length: A }, (_, i) => [i])
    const clusterDist = (c1: number[], c2: number[]) => { let m = Infinity; for (const i of c1) for (const j of c2) m = Math.min(m, dist(i, j)); return m }
    while (clusters.length > 1) {
      let bi = 0, bj = 1, best = Infinity
      for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) { const d = clusterDist(clusters[i], clusters[j]); if (d < best) { best = d; bi = i; bj = j } }
      const merged = [...clusters[bi], ...clusters[bj]]
      clusters = clusters.filter((_, k) => k !== bi && k !== bj)
      clusters.push(merged)
    }
    return clusters[0]
  }
  // recursive bisection: split the ordered list; allocate between the two halves by inverse cluster variance
  export function hrpWeights(returns: number[][]): number[] {
    const A = returns.length
    const C = cov(returns)
    const order = quasiDiag(corrFromCov(C))
    const w = new Array<number>(A).fill(1)
    const recurse = (items: number[]) => {
      if (items.length <= 1) return
      const mid = Math.floor(items.length / 2)
      const left = items.slice(0, mid), right = items.slice(mid)
      const vL = clusterVar(C, left), vR = clusterVar(C, right)
      const alpha = 1 - vL / (vL + vR) // less variance → more weight
      for (const i of left) w[i] *= alpha
      for (const i of right) w[i] *= 1 - alpha
      recurse(left); recurse(right)
    }
    recurse(order)
    const s = order.reduce((a, i) => a + w[i], 0)
    return w.map((x) => x / s)
  }
  export function equalWeights(A: number): number[] {
    return new Array<number>(A).fill(1 / A)
  }
  // min-variance (long-only): w ∝ Σ⁻¹1, negative weights clipped to 0 and renormalized (a deployable long-only baseline)
  export function minVarWeights(returns: number[][]): number[] {
    const C = cov(returns), A = C.length
    const M = C.map((r, i) => [...r.map((x, j) => (i === j ? x + 1e-6 : x)), 1])
    for (let col = 0; col < A; col++) {
      let piv = col
      for (let r = col + 1; r < A; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r
      ;[M[col], M[piv]] = [M[piv], M[col]]
      const d = M[col][col] || 1e-12
      for (let r = 0; r < A; r++) if (r !== col) { const f = M[r][col] / d; for (let k = col; k <= A; k++) M[r][k] -= f * M[col][k] }
    }
    let w = Array.from({ length: A }, (_, i) => M[i][A] / (M[i][i] || 1e-12))
    w = w.map((x) => Math.max(0, x))
    const s = w.reduce((a, b) => a + b, 0) || 1
    return w.map((x) => x / s)
  }

  function portfolioSharpe(returns: number[][], w: number[], from: number, to: number): number {
    const port: number[] = []
    for (let t = from; t < to; t++) port.push(returns.reduce((s, r, i) => s + w[i] * r[t], 0))
    const m = port.reduce((s, x) => s + x, 0) / port.length
    const v = port.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, port.length - 1)
    return v === 0 ? 0 : (m / Math.sqrt(v)) * Math.sqrt(365)
  }

  // A multi-asset fixture: A assets with block correlation structure + heterogeneous vols (crypto-like), deterministic.
  export function fixture(A: number, N: number, seed: number): number[][] {
    const rng = mulberry32(seed)
    const nBlocks = 2
    const common = Array.from({ length: nBlocks }, (_, b) => gauss(mulberry32(seed * 31 + b + 1), N))
    return Array.from({ length: A }, (_, i) => {
      const block = i % nBlocks
      const vol = 0.01 + 0.02 * ((i + 1) / A) // heterogeneous vols
      const drift = 0.0003 * (1 - (i % 3) * 0.3) // heterogeneous small drifts
      const idio = gauss(mulberry32(seed * 131 + i + 7), N)
      return common[block].map((c, t) => drift + vol * (0.6 * c + 0.8 * idio[t]))
    })
  }

  export interface HrpResult {
    assets: number; windows: number
    hrpWins: number // windows where HRP OOS Sharpe > BOTH equal-weight and min-variance
    hrpVsEqual: number; hrpVsMinVar: number // windows HRP beat each baseline
    majorityDominance: boolean // HRP beat BOTH across a MAJORITY of windows (the pre-registered adopt condition)
    meanSharpe: { hrp: number; equal: number; minVar: number }
    outcome: "YES — HRP dominates out-of-sample (adopt)" | "NO — HRP does not dominate; the mixed evidence did not resolve in our favour (keep parked)"
  }
  // rolling-window OOS comparison: fit weights in-sample, measure Sharpe out-of-sample, count HRP wins vs BOTH baselines
  export async function run(cfg: { assets: number; nObs: number; windows: number; trainFrac: number; seed: number }): Promise<HrpResult> {
    const { assets, nObs, windows, trainFrac, seed } = cfg
    let hrpWins = 0, hrpVsEqual = 0, hrpVsMinVar = 0
    let sH = 0, sE = 0, sM = 0
    for (let wnd = 0; wnd < windows; wnd++) {
      const R = fixture(assets, nObs, seed + wnd * 1009)
      const nTrain = Math.floor(nObs * trainFrac)
      const train = R.map((r) => r.slice(0, nTrain))
      const wHrp = hrpWeights(train), wEq = equalWeights(assets), wMv = minVarWeights(train)
      const shH = portfolioSharpe(R, wHrp, nTrain, nObs), shE = portfolioSharpe(R, wEq, nTrain, nObs), shM = portfolioSharpe(R, wMv, nTrain, nObs)
      sH += shH; sE += shE; sM += shM
      if (shH > shE) hrpVsEqual++
      if (shH > shM) hrpVsMinVar++
      if (shH > shE && shH > shM) hrpWins++
    }
    const majorityDominance = hrpWins > windows / 2
    return {
      assets, windows, hrpWins, hrpVsEqual, hrpVsMinVar, majorityDominance,
      meanSharpe: { hrp: sH / windows, equal: sE / windows, minVar: sM / windows },
      outcome: majorityDominance ? "YES — HRP dominates out-of-sample (adopt)" : "NO — HRP does not dominate; the mixed evidence did not resolve in our favour (keep parked)",
    }
  }
}
