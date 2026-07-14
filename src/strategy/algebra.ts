/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 4 (S147): THE COMBINATOR ALGEBRA — *sheds first.*
 *
 * Peyton Jones / Eber / Seward, "Composing Contracts" (ICFP 2000; commercialised as LexiFi's MLFi): an exit condition is a
 * COMPOSITION of observables (Obs) and combinators (when · count · changed), not a hard-coded kind. The seven hard-coded
 * exit kinds each reduce to one composition. Two properties are load-bearing:
 *
 *  1. NON-EXECUTABLE BY TYPE. An Obs READS a captured fact; a Condition returns a boolean. There is NO constructor in this
 *     algebra that returns an order, a trade, or an action — X-ADVICE is enforced by the TYPE SYSTEM, not by a wall. A
 *     combinator that describes a condition CANNOT place an order because the type has no such shape.
 *
 *  2. ADDITIVE OR IT DOES NOT SHIP. The wall is TWO-SIDED (S147, V38's RP-5): (i) every fixture lineage id UNCHANGED (the
 *     algebra is a separate module — it touches no manifest identity), AND (ii) every fixture exit evaluation BYTE-IDENTICAL,
 *     including the UNJUDGEABLE cases. Serialization identity without EVALUATION identity is a trap that leaves the wall green
 *     while the verdicts drift. This algebra is OFF the mass path: ExitCriterion.evaluate stays the sole authority; the algebra
 *     is proved to agree, never wired in as a replacement. Cedar remains formally rejected in its favour.
 *
 * Pure: no I/O, no network, no model. A description layer that computes a boolean and stops.
 */
import { ExitCriterion } from "./exit"
import type { Manifest } from "./manifest"

export namespace Algebra {
  // an OBSERVABLE — a named read of a captured fact. It READS; it never acts. The read returns null when the fact is absent
  // (→ the composition is UNJUDGEABLE, never a fabricated fire). NON-EXECUTABLE: there is no `.execute` / `.order` here.
  export interface Obs {
    name: string
    read: (facts: ExitCriterion.Facts) => number | boolean | null
  }

  // the three COMBINATORS. Each returns a CONDITION (a boolean-valued description), never an action.
  //  · when   — the observable crosses a threshold (op ∈ {<, >=}). peg-floor / tvl-drawdown / concentration / oracle / utilization.
  //  · count  — the observable IS a count that meets a floor (>=). funding-flip-count (negative-funding periods).
  //  · changed— the observable is a boolean transition (== true). governance-change.
  export type Op = "<" | ">=" | "==true"
  export interface Condition {
    combinator: "when" | "count" | "changed"
    obs: Obs
    op: Op
    threshold: number
    // NOTE: the shape is {combinator, obs, op, threshold} — data. There is NO action field. A Condition can be EVALUATED to a
    // boolean; it can never be EXECUTED (X-ADVICE by type).
  }

  export function when(obs: Obs, op: "<" | ">=", threshold: number): Condition {
    return { combinator: "when", obs, op, threshold }
  }
  export function count(obs: Obs, floor: number): Condition {
    return { combinator: "count", obs, op: ">=", threshold: floor }
  }
  export function changed(obs: Obs): Condition {
    return { combinator: "changed", obs, op: "==true", threshold: 0 }
  }

  // the observables, one per captured fact ExitCriterion.evaluate reads.
  const OBS: Record<string, Obs> = {
    peg: { name: "peg", read: (f) => f.peg ?? null },
    fundingNegPeriods: { name: "fundingNegPeriods", read: (f) => f.fundingNegPeriods ?? null },
    tvlDrawdown: { name: "tvlDrawdown", read: (f) => f.tvlDrawdown ?? null },
    governanceChanged: { name: "governanceChanged", read: (f) => f.governanceChanged ?? null },
    concentrationShare: { name: "concentrationShare", read: (f) => f.concentrationShare ?? null },
    oracleStalenessS: { name: "oracleStalenessS", read: (f) => f.oracleStalenessS ?? null },
    utilizationRatio: { name: "utilizationRatio", read: (f) => f.utilizationRatio ?? null },
  }

  // COMPILE — each of the seven hard-coded kinds as a composition (the reduction: 7 kinds → 3 combinators).
  export function compile(c: Manifest.ExitCriterion): Condition {
    switch (c.kind) {
      case "peg-floor": return when(OBS.peg, "<", c.threshold)
      case "funding-flip-count": return count(OBS.fundingNegPeriods, c.threshold)
      case "tvl-drawdown": return when(OBS.tvlDrawdown, ">=", c.threshold)
      case "governance-change": return changed(OBS.governanceChanged)
      case "concentration-ceiling": return when(OBS.concentrationShare, ">=", c.threshold)
      case "oracle-staleness": return when(OBS.oracleStalenessS, ">=", c.threshold)
      case "utilization-ceiling": return when(OBS.utilizationRatio, ">=", c.threshold)
    }
  }

  // EVALUATE — a Condition over facts → {fired, judgeable}. A null read → UNJUDGEABLE (missing stays missing). This is the
  // algebra's OWN evaluation; S147 proves it agrees with ExitCriterion.evaluate byte-for-byte on the DECISION, for every
  // kind and every facts combination (including the UNJUDGEABLE cases). The algebra never REPLACES evaluate — it AGREES with it.
  export function evaluate(cond: Condition, facts: ExitCriterion.Facts): { fired: boolean; judgeable: boolean } {
    const v = cond.obs.read(facts)
    if (v === null) return { fired: false, judgeable: false } // UNJUDGEABLE — the fact is not captured
    let fired: boolean
    if (cond.op === "==true") fired = v === true
    else if (cond.op === "<") fired = (v as number) < cond.threshold
    else fired = (v as number) >= cond.threshold // ">="
    return { fired, judgeable: true }
  }

  // the two-sided additivity check, one side: the algebra AGREES with ExitCriterion.evaluate on the DECISION (fired +
  // judgeable) for a given kind + facts. S147 runs this over a fixture matrix including UNJUDGEABLE cases.
  export function agreesWithEvaluate(c: Manifest.ExitCriterion, facts: ExitCriterion.Facts): boolean {
    const a = evaluate(compile(c), facts)
    const b = ExitCriterion.evaluate(c, facts)
    return a.fired === b.fired && a.judgeable === b.judgeable
  }

  // NON-EXECUTABLE BY TYPE — a structural guard (S147): a Condition's shape is {combinator, obs, op, threshold} and NOTHING
  // that could place an order. Proven by the absence of any action-shaped key.
  export function isNonExecutable(cond: Condition): boolean {
    const keys = Object.keys(cond).sort()
    const actionKeys = ["execute", "order", "trade", "place", "act", "action", "swap", "send"]
    return JSON.stringify(keys) === JSON.stringify(["combinator", "obs", "op", "threshold"]) && !actionKeys.some((k) => k in cond)
  }
}
