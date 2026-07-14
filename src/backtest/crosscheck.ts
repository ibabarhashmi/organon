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
    const theirs = q === "dsr" ? cc.dsrPurgedcv : q === "psr" ? cc.psrPurgedcv : cc.pboPurgedcv
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
    return { state, agreed, disagreed, uncomparable, detail, operatorSigned: false }
  }
}
