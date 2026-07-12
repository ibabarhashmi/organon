/**
 * ORGΛNON — THE CORRELATION SUBSTRATE (Coverage sprint; X-CORRELATE, S66). The familyN=1 fix's MACHINERY, built and
 * proven on POOL SERIES (which exist today) while the deflation PROVABLY STAYS INERT. Pure, dependency-free, DETERMINISTIC:
 *   · align — inner-join N series on shared timestamps, CANONICALLY ORDERED (sort by key first → permutation-invariance);
 *   · a MinTRL-style MINIMUM-OVERLAP floor below which the answer is honestly INSUFFICIENT (thin overlap is a lie with decimals);
 *   · Pearson on LOG-DELTA yield series (a pinned ε floor keeps the transform defined for ~0 yields);
 *   · agglomerative AVERAGE-LINKAGE clustering on the 1−ρ distance, a PINNED merge threshold, LEXICOGRAPHIC tie-breaking —
 *     K-MEANS AND ALL SEEDED RANDOMNESS ARE PROHIBITED (no Math.random, no seeded init); permutation → byte-identical clusters;
 *   · effectiveK = the cluster count — surfaced as ONE non-advisory, number-traced info/context COMPARE fact.
 * THE DEFLATION STAYS INERT: this module NEVER wires K into the Stamp. The ONE sanctioned door (activateKIntoStamp) is
 * LOCKED behind the pinned trigger AND the Operator's D33 signature — both unsigned today → any K-feed is REFUSED.
 */
export namespace Correlate {
  export const MIN_OVERLAP = 30 // PINNED — below this many shared aligned points the answer is INSUFFICIENT
  export const MERGE_THRESHOLD = 0.5 // PINNED — clusters merge when their average-linkage 1−ρ distance < 0.5 (ρ > 0.5)
  const EPS = 1e-6 // PINNED log-delta floor — yields can be ~0; a fixed ε keeps log-delta defined + deterministic

  export interface Series { key: string; points: { ts: number; value: number }[] }
  export interface Aligned { keys: string[]; matrix: number[][]; overlap: number; sufficient: boolean }

  // align N series on their SHARED timestamps (inner join). CANONICAL ORDERING: sort by key FIRST — this is where
  // permutation-invariance begins (the input order can never change the result). matrix rows follow the sorted keys.
  export function align(series: Series[]): Aligned {
    const sorted = [...series].sort((a, b) => a.key.localeCompare(b.key))
    const keys = sorted.map((s) => s.key)
    if (sorted.length < 2) return { keys, matrix: [], overlap: 0, sufficient: false }
    const maps = sorted.map((s) => new Map(s.points.map((p) => [p.ts, p.value])))
    let shared = [...maps[0].keys()]
    for (let i = 1; i < maps.length; i++) shared = shared.filter((t) => maps[i].has(t))
    shared.sort((a, b) => a - b)
    const matrix = maps.map((m) => shared.map((t) => m.get(t)!))
    return { keys, matrix, overlap: shared.length, sufficient: shared.length >= MIN_OVERLAP }
  }

  // log-delta of a value series (log(max(vᵢ,ε)) − log(max(vᵢ₋₁,ε))) — a pinned ε floor, deterministic.
  export function logDeltas(values: number[]): number[] {
    const d: number[] = []
    for (let i = 1; i < values.length; i++) d.push(Math.log(Math.max(values[i], EPS)) - Math.log(Math.max(values[i - 1], EPS)))
    return d
  }

  // Pearson correlation of two equal-length arrays. Degenerate (zero variance) → 0 (never NaN into the clustering).
  export function pearson(a: number[], b: number[]): number {
    const n = Math.min(a.length, b.length)
    if (n < 2) return 0
    let ma = 0, mb = 0
    for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i] }
    ma /= n; mb /= n
    let cov = 0, va = 0, vb = 0
    for (let i = 0; i < n; i++) { const da = a[i] - ma, db = b[i] - mb; cov += da * db; va += da * da; vb += db * db }
    if (va === 0 || vb === 0) return 0
    return cov / Math.sqrt(va * vb)
  }

  // the correlation matrix over the aligned series (Pearson on log-delta). Symmetric; diagonal 1.
  export function corrMatrix(matrix: number[][]): number[][] {
    const deltas = matrix.map(logDeltas)
    const n = deltas.length
    const C = Array.from({ length: n }, () => Array(n).fill(1))
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const r = pearson(deltas[i], deltas[j]); C[i][j] = r; C[j][i] = r }
    return C
  }

  // agglomerative AVERAGE-LINKAGE clustering on the 1−ρ distance. PINNED merge threshold; LEXICOGRAPHIC tie-break (the
  // natural i<j iteration over canonically-ordered indices IS the lexicographic order); NO randomness, NO k-means.
  // Returns clusters as sorted key-lists, sorted by first key — a pure function of (keys, C).
  export function cluster(keys: string[], C: number[][]): string[][] {
    let clusters: number[][] = keys.map((_, i) => [i])
    const dist = (A: number[], B: number[]) => { let s = 0, c = 0; for (const a of A) for (const b of B) { s += 1 - C[a][b]; c++ } return s / c }
    while (clusters.length > 1) {
      let best = Infinity, bi = -1, bj = -1
      for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++) {
        const d = dist(clusters[i], clusters[j])
        if (d < best - 1e-12) { best = d; bi = i; bj = j } // strictly-smaller wins → the FIRST (lexicographically smallest) pair holds on a tie
      }
      if (bi < 0 || best >= MERGE_THRESHOLD) break
      clusters[bi] = [...clusters[bi], ...clusters[bj]]
      clusters.splice(bj, 1)
    }
    return clusters.map((cl) => cl.map((i) => keys[i]).sort((a, b) => a.localeCompare(b))).sort((a, b) => a[0].localeCompare(b[0]))
  }

  export interface Analysis { sufficient: boolean; overlap: number; effectiveK: number | null; clusters: string[][]; keys: string[]; note: string }
  export function analyze(series: Series[]): Analysis {
    const a = align(series)
    if (!a.sufficient) return { sufficient: false, overlap: a.overlap, effectiveK: null, clusters: [], keys: a.keys, note: `INSUFFICIENT — only ${a.overlap} shared points (< ${MIN_OVERLAP}); correlation on thin overlap is fabricated precision.` }
    const clusters = cluster(a.keys, corrMatrix(a.matrix))
    return { sufficient: true, overlap: a.overlap, effectiveK: clusters.length, clusters, keys: a.keys, note: `≈ ${clusters.length} independent bets among ${a.keys.length} pools (over ${a.overlap} shared points).` }
  }

  // THE ONE NON-ADVISORY COMPARE FACT (X-CORRELATE c) — number-traced, info/context, its wording pinned. Simple + Pro.
  // It states CORRELATION, never allocation ("about K bets, not N"), and explicitly disclaims advice.
  export function diversificationFact(an: Analysis, register: "simple" | "pro"): string {
    if (!an.sufficient) return `We can't show a diversification read yet — ${an.note}`
    const N = an.keys.length, K = an.effectiveK!
    if (register === "simple") return `these ${N} pools move together — you're holding about ${K === 1 ? "one bet" : `${K} bets`}, not ${N}. (This describes correlation, not what to do.)`
    return `these ${N} pools' recorded yields are ρ-correlated; effectively ≈ ${K} independent bet${K === 1 ? "" : "s"} among ${N} (agglomerative average-linkage, merge at ρ ≥ ${1 - MERGE_THRESHOLD}, over ${an.overlap} shared points). Clusters: ${an.clusters.map((c) => `{${c.join(", ")}}`).join(" ")}. info/context — a fact about correlation, never an allocation recommendation.`
  }

  // THE K-ACTIVATION GATE (X-CORRELATE e / D33) — the ONE sanctioned door for effectiveK → the Stamp's familyN, and it is
  // LOCKED. K enters ONLY when BOTH the pinned trigger fires (≥ 20–50 trials/family from a real proposer) AND the Operator
  // signs D33. Both are false today → EVERY K-feed is REFUSED; the deflation stays inert; the proposer stays parked.
  export function activateKIntoStamp(effectiveK: number, opts: { triggerFired: boolean; operatorSignedD33: boolean }): number {
    if (!opts.triggerFired || !opts.operatorSignedD33) {
      throw new Error("K-ACTIVATION REFUSED — familyN stays 1: the deflation is inert until BOTH the ≥20–50-trials/family trigger fires AND the Operator signs D33 (the future act is pre-designed; building the substrate is not turning the key).")
    }
    return effectiveK // unreachable today (D33 unsigned) — the pre-designed future act
  }
}
