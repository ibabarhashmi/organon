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

export namespace Signability {
  export type State = "SIGNABLE" | "UNSIGNABLE" | "UNCOMPARABLE" | `PRECONDITION-MET-FOR-${string}-ONLY`
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
      state = "SIGNABLE"
      detail = "the precondition is met WHOLE — DSR, PSR, and PBO all agree with purgedcv within the pre-registered tolerance; the pen MAY be offered. The agent still never signs it (LN5)."
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
