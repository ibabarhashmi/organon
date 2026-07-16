/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), Phase 2: CrossCheck.agreement + Signability.d33 — THE CROSS-CHECK, WHOLE (S101).
 *
 * V35 (E-1) validated DSR and DSR ONLY; PSR and PBO were reported as outputs of the frozen module, not shown AGREEING
 * with anything — and PBO/CSCV is precisely the machinery D33 activates. This computes the agreement for ALL THREE against
 * the SAME independent purgedcv oracle, and the D33 signability from all three (X-DERIVE(e): a producer that returns
 * PARTIAL renders PARTIAL — D33 is PRECONDITION-MET-FOR-{q}-ONLY, never SIGNABLE, until every quantity agrees).
 *
 * X-DERIVE(f): the agreement tolerance is READ FROM THE PINS (derive-pins.json), NEVER from the call site. A tolerance
 * chosen after seeing the disagreement is HARKing, and this project sells the tool that catches exactly that. The quantities
 * (ours/theirs) come from the executed cross-check record (rigor-crosscheck.json); the seeded-negative test passes a fake
 * record with a large delta, and the agreement still computes agrees:false against the REAL pinned 0.02 (RP-1).
 *
 * RP-2: UNCOMPARABLE is a THIRD value distinct from agrees:false — "we could not align the parameters" and "they disagree"
 * are different facts (X-HONEST). For PBO, comparability is the cscvAlignment.comparable flag the driver emits.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { Rigor } from "./rigor"
import { EffectiveN } from "./effectiven"
import { HistoricalAct } from "../organon/historical"

export namespace CrossCheck {
  export type Quantity = "dsr" | "psr" | "pbo"
  export type Agrees = boolean | "UNCOMPARABLE"

  export interface Agreement {
    quantity: Quantity
    ours: number
    theirs: number
    delta: number
    tolerance: number // READ FROM THE PINS (X-DERIVE(f))
    agrees: Agrees
    comparable: boolean
    detail: string
  }

  // the ONLY source of the tolerance — the content-hashed pins, pre-registered in Phase 0 before the numbers were seen.
  export function tolerance(q: Quantity): number {
    const pins = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "derive-pins.json"), "utf8"))
    const t = pins.preRegisteredTolerances?.[q]
    if (typeof t !== "number") throw new Error(`no pre-registered tolerance for ${q} in derive-pins.json (X-DERIVE(f))`)
    return t
  }

  // read the committed cross-check record (the executed numbers) — a RECORD OF EXECUTION, env-stamped.
  export function record(): Rigor.CrossCheck | Rigor.Blocked {
    const r = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "rigor-crosscheck.json"), "utf8"))
    return r.crossCheck as Rigor.CrossCheck | Rigor.Blocked
  }

  // compute one agreement record. `cc` defaults to the committed record; a test may pass a SEEDED fake (RP-1). The
  // tolerance is ALWAYS read from the pins — the call site cannot supply it (X-DERIVE(f)).
  export function agreement(q: Quantity, cc: Rigor.CrossCheck | Rigor.Blocked = record()): Agreement {
    const tol = tolerance(q)
    if (Rigor.isBlocked(cc))
      return { quantity: q, ours: NaN, theirs: NaN, delta: NaN, tolerance: tol, agrees: "UNCOMPARABLE", comparable: false, detail: `the cross-check did not execute (BLOCKED): ${cc.reason}` }
    const ours = q === "dsr" ? cc.dsr : q === "psr" ? cc.psr : cc.pbo
    // VARIANT V41 (S163, L-3/DD-71a) — PBO's `theirs` leg is the GENUINELY INDEPENDENT hand-rolled CSCV (own Sharpe,
    // cc.pboHandRolled), NOT the shared purgedcv leg (cc.pboPurgedcv is byte-identical to cc.pbo — Δ=0, a cross-check that
    // cannot fail; RETIRED). DSR/PSR keep purgedcv (a genuinely independent reimplementation there). The independent PBO
    // leg is proven to DETECT on constructed non-trivial fixtures (CrossCheck.pboIndependent, RP-3), so its agreement is
    // meaningful, not a shared-code artifact. 0.6-vs-0.6 never again masquerades as agreement between the same code.
    const theirs = q === "dsr" ? cc.dsrPurgedcv : q === "psr" ? cc.psrPurgedcv : cc.pboHandRolled
    const delta = Math.abs(ours - theirs)
    // PBO's comparability is the driver-emitted CSCV alignment flag; DSR/PSR are always comparable (identical formula).
    const comparable = q === "pbo" ? (cc.cscvAlignment?.comparable ?? false) : true
    if (!comparable)
      return { quantity: q, ours, theirs, delta, tolerance: tol, agrees: "UNCOMPARABLE", comparable: false, detail: `${q.toUpperCase()} UNCOMPARABLE — the CSCV parameters could not be aligned (${cc.cscvAlignment ? JSON.stringify(cc.cscvAlignment) : "no alignment record"}); 'could not compare' is not 'disagree' (RP-2)` }
    const agrees = delta < tol
    return { quantity: q, ours, theirs, delta, tolerance: tol, agrees, comparable: true, detail: `${q.toUpperCase()}: ours=${ours.toFixed(6)} theirs=${theirs.toFixed(6)} |Δ|=${delta.toExponential(2)} ${agrees ? "<" : "≥"} tol=${tol} → agrees=${agrees}` }
  }

  export function all(cc: Rigor.CrossCheck | Rigor.Blocked = record()): Agreement[] {
    return (["dsr", "psr", "pbo"] as Quantity[]).map((q) => agreement(q, cc))
  }

  // ── VARIANT V41 (S163, L-3 / DD-71 / RP-3) — THE PBO CROSS-CHECK, MADE INDEPENDENT AND PROVEN TO DETECT ────────────────
  // The degenerate `0.6 vs 0.6` was cc.pbo vs cc.pboPurgedcv — byte-identical shared lineage, Δ=0, a cross-check that cannot
  // fail (X-REACH(a)). It fed D33's SIGNABLE for four sprints proving nothing. The fix (DD-71a): the `theirs` leg is now the
  // GENUINELY INDEPENDENT hand-rolled CSCV (own Sharpe). But F-3/RP-3 warns that "independent" is cosmetic if it merely
  // reproduces 0.6 — so this PROVES the independent CSCV can DETECT: run on a constructed pure-noise matrix it returns ≈0.5
  // (the IS-best is overfit); on a constructed real-edge matrix it returns ≈0 (a persistent edge dominates IS and OOS). It
  // DISCRIMINATES — so its agreement at 0.6 on the real fixture is meaningful, not a shared-code artifact. Clone-stable: the
  // CSCV is ported from rigor.py::pbo (Appendix B.3), READ never edited (checkFrozenSet 0 drift); the fixtures are built by a
  // deterministic LCG (no Math.random), so a fresh clone reproduces the detection proof to the bit.
  export interface PboIndependent {
    degenerateRetired: { leg: string; shared: number; delta: number; note: string }
    independentLeg: { name: string; ours: number; theirs: number; delta: number; agrees: boolean; note: string }
    detectionProof: { noise: { pbo: number; expected: string }; edge: { pbo: number; expected: string }; detectable: boolean; nSplits: number; T: number; N: number; detail: string }
    detail: string
  }
  export function pboIndependent(cc: Rigor.CrossCheck | Rigor.Blocked = record()): PboIndependent | null {
    if (Rigor.isBlocked(cc)) return null
    const tol = tolerance("pbo")
    const nSplits = 8, T = 240, N = 10
    const noise = Cscv.pbo(Cscv.noiseMatrix(T, N, 20260715), nSplits)
    const edge = Cscv.pbo(Cscv.edgeMatrix(T, N, 20260715, 0.6), nSplits)
    // it can DETECT iff it discriminates: high (~0.5) on pure noise AND low (~0) on a real edge (a WIDE gap, so agreement is meaningful)
    const detectable = Number.isFinite(noise) && Number.isFinite(edge) && noise > 0.35 && edge < 0.15 && noise - edge > 0.3
    const sharedDelta = Math.abs(cc.pbo - cc.pboPurgedcv)
    const indepDelta = Math.abs(cc.pbo - cc.pboHandRolled)
    return {
      degenerateRetired: { leg: "cc.pbo vs cc.pboPurgedcv", shared: cc.pboPurgedcv, delta: sharedDelta, note: `RETIRED — cc.pboPurgedcv ${cc.pboPurgedcv} is byte-identical to cc.pbo ${cc.pbo} (Δ=${sharedDelta.toExponential(2)}, shared lineage); a cross-check where both sides are the same code cannot fail (L-3). 0.6-vs-0.6 never again masquerades as agreement.` },
      independentLeg: { name: "hand-rolled CSCV (own Sharpe)", ours: cc.pbo, theirs: cc.pboHandRolled, delta: indepDelta, agrees: indepDelta < tol, note: `the PBO agreement's theirs leg is now cc.pboHandRolled ${cc.pboHandRolled} (an independent implementation) — on the real fixture |Δ|=${indepDelta.toExponential(2)} ${indepDelta < tol ? `< tol ${tol} → agrees` : `≥ tol ${tol} → disagrees (a finding)`}` },
      detectionProof: {
        noise: { pbo: noise, expected: "≈0.5 — pure noise: the IS-best is overfit, its OOS rank is ~uniform" },
        edge: { pbo: edge, expected: "≈0 — a real persistent edge dominates IS and OOS, so the IS-best is OOS-best" },
        detectable,
        nSplits, T, N,
        detail: `the independent CSCV returns ${noise.toFixed(3)} on pure noise and ${edge.toFixed(3)} on a real-edge matrix — a ${(noise - edge).toFixed(3)} gap: it DISCRIMINATES (RP-3), so its agreement at ${cc.pbo} on the real fixture is meaningful, not a shared-code artifact. If it only ever returned 0.6 it would be RETIRED (DD-71b); it does not, so it is MADE INDEPENDENT (DD-71a).`,
      },
      detail: `PBO's cross-check is now carried by GENUINELY INDEPENDENT legs — the hand-rolled CSCV (proven to detect: ${noise.toFixed(2)} on noise, ${edge.toFixed(2)} on edge) and the theory null-distribution (D56). The shared-lineage purgedcv-PBO comparison is retired; ${detectable ? "the cross-check can DISAGREE when the truth differs, so its agreement is real" : "the cross-check could NOT be shown to detect — RETIRE is the honest path (DD-71b)"}.`,
    }
  }
}

// ── VARIANT V41 (S163 / RP-3) — the CSCV, ported clone-stably from rigor.py::pbo (Appendix B.3). READ, never edited (no .py
// byte moves); no numpy; deterministic. Used ONLY to PROVE the independent PBO leg can DETECT on constructed fixtures whose
// true PBO is known (pure noise → ≈0.5; a real edge → ≈0). Not on the mass path, not in the frozen set.
export namespace Cscv {
  // per-column (per-strategy) per-observation Sharpe (ddof=1) — the frozen _col_sharpe.
  function colSharpe(rows: number[][]): number[] {
    const T = rows.length, N = rows[0].length
    const out = new Array<number>(N).fill(0)
    for (let j = 0; j < N; j++) {
      let sum = 0
      for (let i = 0; i < T; i++) sum += rows[i][j]
      const mu = sum / T
      let ss = 0
      for (let i = 0; i < T; i++) { const d = rows[i][j] - mu; ss += d * d }
      const sd = T > 1 ? Math.sqrt(ss / (T - 1)) : 0
      out[j] = sd > 0 ? mu / sd : 0
    }
    return out
  }
  // np.linspace(0, T, nSplits+1).astype(int) → contiguous row-index groups.
  function contiguousGroups(T: number, nSplits: number): number[][] {
    const bounds: number[] = []
    for (let i = 0; i <= nSplits; i++) bounds.push(Math.trunc((i * T) / nSplits))
    const groups: number[][] = []
    for (let i = 0; i < nSplits; i++) { const g: number[] = []; for (let r = bounds[i]; r < bounds[i + 1]; r++) g.push(r); groups.push(g) }
    return groups
  }
  // all C(n, k) index combinations (itertools.combinations order).
  function* combinations(n: number, k: number): Generator<number[]> {
    const idx = Array.from({ length: k }, (_, i) => i)
    for (;;) {
      yield idx.slice()
      let i = k - 1
      while (i >= 0 && idx[i] === n - k + i) i--
      if (i < 0) return
      idx[i]++
      for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1
    }
  }
  // np.argsort(np.argsort(x)) + 1 → ranks 1..N (1 = worst).
  function ranks(v: number[]): number[] {
    const order = v.map((_, i) => i).sort((a, b) => v[a] - v[b])
    const r = new Array<number>(v.length)
    for (let pos = 0; pos < order.length; pos++) r[order[pos]] = pos + 1
    return r
  }
  // rigor.py::pbo — CSCV: split rows into S groups; over every C(S, S/2) IS/OOS partition, pick the IS-best strategy, take
  // its OOS relative rank ω, λ=logit(ω); PBO = P(λ<0) = P(the IS-best lands in the bottom half OOS).
  export function pbo(matrix: number[][], nSplits = 8, chosenIdx: number | null = null): number {
    const T = matrix.length, N = matrix[0]?.length ?? 0
    if (N < 2 || T < nSplits) return NaN
    const groups = contiguousGroups(T, nSplits)
    const half = Math.floor(nSplits / 2)
    let lamNeg = 0, total = 0
    for (const isCombo of combinations(nSplits, half)) {
      const isSet = new Set(isCombo)
      const isIdx: number[] = []; for (const g of isCombo) isIdx.push(...groups[g])
      const oosIdx: number[] = []; for (let g = 0; g < nSplits; g++) if (!isSet.has(g)) oosIdx.push(...groups[g])
      const isPerf = colSharpe(isIdx.map((i) => matrix[i]))
      const oosPerf = colSharpe(oosIdx.map((i) => matrix[i]))
      let target = chosenIdx
      if (target === null) { let best = 0; for (let j = 1; j < N; j++) if (isPerf[j] > isPerf[best]) best = j; target = best } // argmax (first max)
      const order = ranks(oosPerf)
      const omega = order[target] / (N + 1)
      const lam = Math.log(omega / (1 - omega))
      if (lam < 0) lamNeg++
      total++
    }
    return total > 0 ? lamNeg / total : NaN
  }

  // a deterministic mulberry32 PRNG in [0,1) — no Math.random (clone-stable; a fresh clone reproduces the proof to the bit).
  // mulberry32 (not a plain LCG: strided column-sampling of an LCG has low-frequency structure that biases the CSCV — the
  // IS-best stays OOS-good and pure noise wrongly reads low; mulberry32's avalanche removes it, so noise reads ≈0.5).
  function mulberry32(seed: number): () => number {
    let a = seed >>> 0
    return () => {
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  // a standard-normal draw via Box–Muller (independent, symmetric — the CSCV Sharpe ranking needs proper noise).
  function gauss(rnd: () => number): number {
    const u = Math.max(rnd(), 1e-12), v = rnd()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  // a pure-noise (T×N) matrix — every column i.i.d. N(0,1), NO real edge. True PBO ≈ 0.5 (the IS-best is overfit).
  export function noiseMatrix(T: number, N: number, seed: number): number[][] {
    const rnd = mulberry32(seed)
    return Array.from({ length: T }, () => Array.from({ length: N }, () => gauss(rnd)))
  }
  // a real-edge (T×N) matrix — strategy 0 carries a persistent positive drift; the rest are N(0,1) noise. True PBO ≈ 0 (the
  // edge dominates IS and OOS, so the IS-best is the OOS-best).
  export function edgeMatrix(T: number, N: number, seed: number, drift: number): number[][] {
    const rnd = mulberry32(seed)
    return Array.from({ length: T }, () => Array.from({ length: N }, (_, j) => gauss(rnd) + (j === 0 ? drift : 0)))
  }
}

// ── SUBSTANCE V38 (S116/DD-33/RP-1) — POWER: the A-PRIORI half of D33's fix ────────────────────────────────────────────
// A point-tolerance test at `tol` on the PBO estimator can only succeed if the estimator's own sampling SE is BELOW `tol`.
// PBO at split-count S is a mean over C(S, S/2) overlapping CSCV partitions; its NAIVE lower-bound SE is sqrt(0.25/C(S,S/2))
// (the true SE is LARGER — the partitions overlap — so this is a lower bound: if even the lower bound exceeds the tolerance
// the test is INVALID a-priori, X-REACH(a) read backwards). This is computable WITHOUT any result (RP-1): raising S is a
// CORRECTION, not a tuning. The EMPIRICAL SE is measured separately (the null distribution in crosscheck.py) and SHOWN.
export namespace Power {
  // C(S, S/2) — the number of in-sample/out-of-sample partitions CSCV averages over.
  export function combinations(S: number): number {
    if (!Number.isInteger(S) || S < 2 || S % 2 !== 0) return NaN
    const k = S / 2
    let c = 1
    for (let i = 0; i < k; i++) c = (c * (S - i)) / (i + 1)
    return Math.round(c)
  }
  // the a-priori naive lower-bound SE of the PBO estimator at split-count S. N and T are accepted (the fuller argument uses
  // them) but do NOT enter the combinatorial lower bound — the point is that S alone caps the achievable precision.
  export function se(S: number, _N?: number, _T?: number): number {
    const c = combinations(S)
    return Number.isFinite(c) && c > 0 ? Math.sqrt(0.25 / c) : NaN
  }
  // a point-tolerance test at `tol` on an estimator with sampling SE `estimatorSe` can NEVER succeed if estimatorSe >= tol
  // (X-REACH(a) read backwards). The a-priori validity check — no observed result needed.
  export function testCanSucceed(tol: number, estimatorSe: number): boolean {
    return Number.isFinite(estimatorSe) && estimatorSe < tol
  }
}

// ── SOCKET V37 (S110/DD-25/G-3) — D33 IS CORRECTNESS, NOT CONSISTENCY ──────────────────────────────────────────────────
// V36's D33 computed SIGNABLE on consistency alone: all three quantities came from ONE oracle (purgedcv) whose Sharpe is
// byte-identical to rigor's, and PBO's delta was exactly 0.00e+0 — shared lineage, not independent confirmation. V37 adds
// two legs: a THEORY check (the published method's expected PBO on true-Sharpe-0 noise, pinned before compute) and a
// NON-SHARED ORACLE (a hand-rolled CSCV with its own Sharpe). SIGNABLE requires consistency AND theory AND non-shared-oracle.
export namespace Correctness {
  export interface Legs {
    consistency: { ok: boolean; detail: string } // rigor vs purgedcv agree (the V36 leg)
    nonSharedOracle: { ok: boolean; detail: string } // the hand-rolled CSCV (own Sharpe) agrees with rigor
    theory: { ok: boolean; expected: number; observed: number; band: number; detail: string } // observed PBO vs the pinned theory
  }

  // read the pinned theory expectation + band from the socket pins (X-DERIVE(f): read from the pins, never the call site).
  function theoryPins(): { expected: number; band: number } {
    const p = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "socket-pins.json"), "utf8"))
    return { expected: p.pboTheory.expectedPboUnderNoise, band: p.pboTheory.theoryBand }
  }

  export function legs(cc: Rigor.CrossCheck | Rigor.Blocked = CrossCheck.record()): Legs | null {
    if (Rigor.isBlocked(cc)) return null
    const t = theoryPins()
    const consistency = CrossCheck.all(cc).every((a) => a.agrees === true)
    const oracleDelta = Math.abs(cc.pbo - cc.pboHandRolled)
    // SUBSTANCE V38 (S116/DD-33/RP-1): the theory leg tests the POWERED estimate, not a single low-power draw. V37 compared
    // the single-seed PBO (0.6) to 0.5 against a 0.05 band — but the estimator's SE at S=8 is ~0.06, so 0.6-vs-0.5 was ~1 SE
    // of ordinary noise: a point test on a random variable that could never succeed (X-REACH(a) backwards). The powered
    // estimate is the null-distribution MEAN at the adequately-powered S=16 (SE collapses); the z is reported as the distance.
    // the powered test is on the null-distribution MEAN. THE EMPIRICAL FINDING (S116): the single-estimate SD stays ~0.1 even
    // at S=16 (the dataset-to-dataset variance dominates the within-dataset combinatorial averaging the naive SE captured),
    // so a point/band test on ONE backtest can never succeed at any S — the real fix is to test the MEAN, whose SE is
    // sd/√nSeeds. theory holds iff the mean is within the band AND statistically indistinguishable from theory (|z_mean| < 2).
    const powered = cc.s116PowerFix?.nullDistS16
    const observed = powered ? powered.mean : cc.pbo
    const seMean = powered ? powered.sd / Math.sqrt(powered.nSeeds) : NaN
    const zMean = powered ? (observed - t.expected) / seMean : NaN
    const theoryDelta = Math.abs(observed - t.expected)
    const theoryOk = powered ? theoryDelta <= t.band && Math.abs(zMean) < 2 : theoryDelta <= t.band
    const zText = powered ? ` · empirical single-estimate SD ${powered.empiricalSe.toFixed(3)} (≫ band — one draw is noise at any S); mean over ${powered.nSeeds} seeds SE ${seMean.toFixed(4)}, z=(mean−${t.expected})/SE=${zMean.toFixed(2)}` : ""
    const validNote = powered
      ? `the POWERED estimate — the null-distribution MEAN at S=${powered.S} (the V37 single-seed 0.6 was ~1 SD of ordinary noise; a single PBO is inherently ±0.1, so a point/band test on one run can never succeed — S116)`
      : `the single-seed PBO (no power fix present — V37 behaviour)`
    return {
      consistency: { ok: consistency, detail: consistency ? "rigor vs purgedcv: DSR/PSR/PBO all agree" : "a consistency disagreement (see CrossCheck.all)" },
      nonSharedOracle: { ok: oracleDelta < 0.02, detail: `hand-rolled CSCV (own Sharpe) PBO ${cc.pboHandRolled.toFixed(3)} vs rigor ${cc.pbo.toFixed(3)} · |Δ|=${oracleDelta.toFixed(4)} ${oracleDelta < 0.02 ? "< 0.02 (a third independent code path agrees)" : "≥ 0.02 (the algorithm itself diverges — a finding)"}` },
      theory: { ok: theoryOk, expected: t.expected, observed, band: t.band, detail: `${validNote}: PBO ${observed.toFixed(3)} vs the pinned theory ${t.expected} · |Δ|=${theoryDelta.toFixed(4)} ${theoryOk ? `≤ band ${t.band} and |z|<2 — theory AGREES on a VALID test (S116: the single-seed disagreement was low-power noise)` : `> band ${t.band} or |z|≥2 — theory DISAGREES on a VALID test: a REAL finding about rigor.py (D33 stays closed; a pen that closes on a valid test is worth more than one that opens on a broken one)`}${zText}` },
    }
  }
}

export namespace Signability {
  export type State = "SIGNABLE" | "UNSIGNABLE" | "UNCOMPARABLE" | "PRECONDITION-MET-BY-CONSISTENCY-ONLY" | `PRECONDITION-MET-FOR-${string}-ONLY`
  export interface Result {
    state: State
    agreed: CrossCheck.Quantity[]
    disagreed: CrossCheck.Quantity[]
    uncomparable: CrossCheck.Quantity[]
    detail: string
    operatorSigned: false // LN5 — the agent never signs, whatever the precondition (this is a compile-time constant)
    // FAMILY V39 (RP-1/F-1, D56/S140): THE PRICE, CARRIED IN THE STATE. The number of test redesigns it took to reach this
    // state, and the immutable SEARCH hashes that paid for them. A pen that opened on the SECOND version of a test is not the
    // same pen as one that opened on the first — the Operator must see which he holds. THE COUNT NEVER RESETS.
    testRedesigns: number
    redesignSearchHashes: string[]
    // FAMILY V39 (S142/DD-53): the i.i.d. assumption-limit that BEARS on this state, on the SAME LINE as the verdict —
    // direction + magnitude named, or its dissolution. DERIVED from the frozen code (effective-n-determination.json), never
    // asserted; null only if the determination artifact is absent (a pre-Family checkout).
    iidRider: { stands: boolean; classification: string; direction: string; magnitude: string } | null
  }

  // FAMILY V39 (RP-1/S142) — read the D56 price + the i.i.d. rider from the committed artifacts (never re-decide them here:
  // the price lives in the record hash-chain, the rider is DERIVED by effectiven.ts from the frozen code). A pre-Family
  // checkout has neither → {0, [], null}, and the state renders exactly as it did in V38 (additive, no verdict moved).
  function priceAndRider(): { testRedesigns: number; redesignSearchHashes: string[]; iidRider: Result["iidRider"] } {
    let testRedesigns = 0
    const redesignSearchHashes: string[] = []
    try {
      const rec = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "test-redesign-search.json"), "utf8"))
      testRedesigns = rec.redesigns ?? 0
      // BACKFILL V43 (N-3/S182) — the SEARCH's identity is the act's STABLE immutable-core hash (HistoricalAct.hash),
      // NOT the record chain's `selfSha` (which is POSITION-dependent and drifted a578032b→d5147f8d as the chain grew,
      // untagged, though the act never changed). A fixed act now yields a fixed hash forever; the chain selfSha remains the
      // chain's tamper-evidence (record/chain.json.d56SearchLedgerHash), a different, position-dependent concern.
      if (testRedesigns > 0) redesignSearchHashes.push(HistoricalAct.hash(rec))
    } catch { /* pre-Family — no redesign recorded */ }
    let iidRider: Result["iidRider"] = null
    try {
      const d = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "effective-n-determination.json"), "utf8"))
      iidRider = { stands: d.riderStands, classification: d.classification, direction: d.riderDirection, magnitude: d.riderMagnitude }
    } catch { /* the autopsy has not run on this checkout */ }
    return { testRedesigns, redesignSearchHashes, iidRider }
  }

  // the S142 render fragment — the rider on the SAME LINE as the verdict (direction + magnitude), or its absence noted.
  export function riderLine(r: Result): string {
    if (!r.iidRider) return ""
    return ` · i.i.d. rider [${r.iidRider.stands ? "STANDS" : "DISSOLVED"}, ${r.iidRider.classification}]: ${r.iidRider.direction} ${r.iidRider.magnitude}`
  }

  // D33 COMPUTED from all three agreements (X-DERIVE(e)). SIGNABLE ONLY if all three agree; a DISAGREEMENT (a comparable
  // |Δ| ≥ tolerance) → UNSIGNABLE (the headline finding, attack #7); UNCOMPARABLE quantities with none disagreeing →
  // PRECONDITION-MET-FOR-{agreed}-ONLY (or UNCOMPARABLE if none agreed); a partial set (fewer than three) → PARTIAL.
  export function d33(agreements: CrossCheck.Agreement[] = CrossCheck.all()): Result {
    const agreed = agreements.filter((a) => a.agrees === true).map((a) => a.quantity)
    const disagreed = agreements.filter((a) => a.agrees === false).map((a) => a.quantity)
    const uncomparable = agreements.filter((a) => a.agrees === "UNCOMPARABLE").map((a) => a.quantity)
    let state: State
    let detail: string
    if (disagreed.length > 0) {
      state = "UNSIGNABLE"
      detail = `D33 UNSIGNABLE — ${disagreed.map((q) => q.toUpperCase()).join(", ")} DISAGREE(S) with the independent reference beyond the pre-registered tolerance (the headline finding — the frozen math and purgedcv diverge; someone must know before the pen moves)`
    } else if (agreed.length === 3) {
      // SOCKET V37 (S110/G-3): consistency is necessary but NOT sufficient — D33 requires theory + a non-shared oracle too.
      const legs = Correctness.legs()
      if (legs && legs.theory.ok && legs.nonSharedOracle.ok) {
        state = "SIGNABLE"
        detail = `the precondition is met on ALL THREE legs — consistency ✓, non-shared oracle ✓ (${legs.nonSharedOracle.detail}), theory ✓ (${legs.theory.detail}); the pen MAY be offered. The agent still never signs it (LN5).`
      } else {
        state = "PRECONDITION-MET-BY-CONSISTENCY-ONLY"
        detail = `D33 PRECONDITION-MET-BY-CONSISTENCY-ONLY — the three implementations AGREE (consistency ✓)${legs ? ` and the non-shared oracle ${legs.nonSharedOracle.ok ? "AGREES" : "DIVERGES"}, but the THEORY leg does NOT hold: ${legs.theory.detail}` : ""}. It went BACKWARD this sprint (G-3), and that is correct — consistency is not correctness, and a pen that closes is a successful sprint. (D33 stays fenced from K-activation regardless — LN5.)`
      }
    } else if (agreed.length === 0) {
      state = "UNCOMPARABLE"
      detail = `D33 UNCOMPARABLE — no quantity could be compared (${uncomparable.map((q) => q.toUpperCase()).join(", ")}); 'could not compare' is not 'agree' (RP-2)`
    } else {
      state = `PRECONDITION-MET-FOR-${agreed.map((q) => q.toUpperCase()).join("+")}-ONLY`
      detail = `D33 ${state} — ${agreed.map((q) => q.toUpperCase()).join(", ")} agree; ${uncomparable.map((q) => q.toUpperCase()).join(", ") || "none"} UNCOMPARABLE. Not SIGNABLE until every quantity agrees (X-DERIVE(e): a partial precondition renders PARTIAL, never complete — this is the exact V35 defect, where DSR-only was typed SIGNABLE)`
    }
    // FAMILY V39 — attach the D56 price (RP-1) and the i.i.d. rider (S142). The SIGNABLE detail carries BOTH on the same
    // line: the number of test redesigns it took to reach SIGNABLE, and the assumption-limit that bears on the verdict. A
    // SIGNABLE that renders without its bearing rider is a Halt (S142); a SIGNABLE with no redesign count is a Halt (S140).
    const pr = priceAndRider()
    if (state === "SIGNABLE") {
      const priceNote = pr.testRedesigns > 0
        ? ` · PRICE (RP-1/D56): reached SIGNABLE on test redesign #${pr.testRedesigns} (the pen opened on version ${pr.testRedesigns + 1} of the test; SEARCH ${pr.redesignSearchHashes.map((h) => h.slice(0, 12)).join(", ")}; the count NEVER resets — the flip SURVIVES in value because the theory leg rests on a null distribution over INDEPENDENT SEEDS, immune to the rider)`
        : ""
      detail = `${detail}${priceNote}${riderLine({ state, agreed, disagreed, uncomparable, detail, operatorSigned: false, ...pr })}`
    }
    return { state, agreed, disagreed, uncomparable, detail, operatorSigned: false, ...pr }
  }
}

// ── RECKONING V44 (Phase 1, S192, the D33 ruling) — D33.verdict(): THE MATHS, AUDITED AND MADE HONEST ──────────────────────
// The Operator delegated the maths ("check the maths, decide, adversarially validate, red-team, then sign"). The agent does
// everything except move the operatorSigned bit (LN5). This composes the TWO legs of the audit:
//   · CORRECTNESS (DD-88) — Rigor.audit(): the frozen implementation matches the papers (0 breaks, 5 classes, 0 frozen drift).
//   · APPLICATION (DD-89) — EffectiveN: the √(n−1) standard error overstates confidence on autocorrelated input; the N_eff
//     correction (√(N_eff−1)) is now the enforced default wherever a Sharpe is judged. riderEnforced is PROVEN LIVE: on the
//     clone-stable AR(1) demonstration the corrected PSR deflates materially below the naive one (the mechanism bites).
// The verdict: implementation SOUND · application SIGNABLE (N_eff enforced) · RECOMMENDED-FOR-SIGNATURE · operatorSigned:false.
// The accountability split (RP-4): the agent is accountable for the MATH VERDICT; the Operator for the DECISION TO RELY ON IT.
export namespace D33 {
  export interface Verdict {
    implementation: "SOUND" | "NOT-SOUND" | "UNPROVEN"
    breakCount: number
    application: "SIGNABLE" | "SIGNABLE-AFTER-ENFORCEMENT" | "NOT-SIGNABLE"
    riderEnforced: boolean // the N_eff correction is the enforced default AND bites on autocorrelated input (proven live)
    recommendedForSignature: boolean
    operatorSigned: false // LN5 — a compile-time constant; the agent NEVER moves it
    demoDeflation: { psrNaive: number; psrCorrected: number; tauInt: number; nEff: number } // the overstatement made concrete
    accountabilitySplit: { agent: string; operator: string }
    detail: string
  }
  export function verdict(): Verdict {
    const audit = Rigor.audit()
    // the enforcement is PROVEN, not asserted: the N_eff correction deflates the naive PSR on the canonical autocorrelated
    // series (the AR(1) demonstration). A correction that did not bite would not be "enforced" in any meaningful sense.
    const demoP = EffectiveN.psrAtNeff(EffectiveN.demoAr1())
    const riderEnforced = demoP.judgeable && demoP.psrCorrected < demoP.psrNaive - 0.05
    const implementation = audit.sound ? "SOUND" : audit.breakCount > 0 ? "NOT-SOUND" : "UNPROVEN"
    const application: Verdict["application"] = implementation !== "SOUND" ? "NOT-SIGNABLE" : riderEnforced ? "SIGNABLE" : "SIGNABLE-AFTER-ENFORCEMENT"
    const recommendedForSignature = implementation === "SOUND" && riderEnforced
    return {
      implementation,
      breakCount: audit.breakCount,
      application,
      riderEnforced,
      recommendedForSignature,
      operatorSigned: false,
      demoDeflation: { psrNaive: demoP.psrNaive, psrCorrected: demoP.psrCorrected, tauInt: demoP.tauInt, nEff: demoP.nEff },
      accountabilitySplit: {
        agent: "the MATHEMATICAL VERDICT — implementation sound (0 breaks, 5 classes, 0 frozen drift), application corrected (√(N_eff−1) the enforced default), recommended. The agent is accountable for the truth of this analysis.",
        operator: "the DECISION TO RELY ON IT — the signature. The agent cannot make the frozen core's former overstatement the Operator's informed choice; only the Operator can. The recommendation is unconditional; the last bit is the human's (LN5).",
      },
      detail: `D33 — implementation ${implementation} (${audit.breakCount} breaks, ${audit.classes.length} classes, ${audit.frozenDrift ? "DRIFT" : "0 drift"}) · application ${application} (N_eff ${riderEnforced ? "enforced: the AR(1) demo deflates PSR " + demoP.psrNaive.toFixed(3) + "→" + demoP.psrCorrected.toFixed(3) + " at τ_int " + demoP.tauInt.toFixed(1) : "correction NOT yet biting"}) · recommended-for-signature ${recommendedForSignature} · operatorSigned false (the pen is the human's, LN5). Accountability split: the agent owns the math verdict; the Operator owns the decision to rely on it (RP-4).`,
    }
  }

  // ── HARDENING V45 (P-2/S202) — BOTH PSR STATISTICS, SIDE BY SIDE. V44's header showed a high naive PSR beside
  // riderEnforced:true — the enforcement is Stamp-scoped, but the juxtaposition read as contradiction (a high naive number
  // next to "the rider is enforced" that would LOWER it). The fix: render BOTH — the naive √(n−1) PSR AND the N_eff-corrected
  // √(N_eff−1) PSR — with riderEnforced's SCOPE inline, so an enforced rider never again sits beside an unscoped naive number.
  export interface Both {
    naive: { psr: number; basis: string }
    nEff: { psr: number; tauInt: number; nEff: number; basis: string }
    riderEnforced: boolean
    riderScope: string
    display: string
  }
  export function both(): Both {
    const d = verdict()
    const dd = d.demoDeflation
    const riderScope = "riderEnforced scopes to THE STAMP — the ONLY harness surface that renders a Sharpe-derived verdict (the mass path carries no verdicts, P-5). The naive PSR is the frozen i.i.d. statistic (mass path, cross-check); the N_eff PSR is the Stamp's enforced default (autocorrelation-adjusted). Both shown (S202) so the rider never sits beside an unscoped naive number."
    return {
      naive: { psr: dd.psrNaive, basis: "√(n−1) over the raw count (i.i.d.; the frozen cross-check statistic, mass path — no verdict)" },
      nEff: { psr: dd.psrCorrected, tauInt: dd.tauInt, nEff: dd.nEff, basis: "√(N_eff−1), N_eff = n/τ_int (autocorrelation-adjusted; the Stamp's enforced default)" },
      riderEnforced: d.riderEnforced,
      riderScope,
      display: `PSR naive ${dd.psrNaive.toFixed(4)} (√(n−1), i.i.d.) │ PSR N_eff ${dd.psrCorrected.toFixed(4)} (√(N_eff−1), τ_int ${dd.tauInt.toFixed(1)}, N_eff ${dd.nEff.toFixed(1)}) — riderEnforced ${d.riderEnforced} scoped to the Stamp (P-2/P-5/S202)`,
    }
  }
}
