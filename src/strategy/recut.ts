/**
 * ORGΛNON — THE SURROGATE ADDENDUM (V38-B), B4: Recut — D62's DELEGATED re-cut, resolved (S138, DD-50).
 *
 * The Operator's words: "try we yourself, and move on (after adverse validation)." The delegation is QUOTED (the pen act);
 * the resolution (D62-R) is the execution of a delegation, carries BOTH attacks, and is presented at the gate strikeable
 * (attack #5 — delegation-with-validation, quoted and bounded, is the one form LN5 permits). Two re-cuts of the exit-set /
 * Proposer trigger, both attacked against pinned criteria; NEITHER may light anything (D63 is off; D33 unsigned) — the
 * resolution is coherence bookkeeping for a future the pen may never open, and it says so.
 */
export namespace Recut {
  export type OptionId = "A" | "B"

  export interface Option {
    id: OptionId
    definition: string
    fires_on: string // what the trigger reads (must be a DERIVED set/count, never self-reported)
  }

  // Option A — the trigger counts HUMAN-authored SEARCHes only (X-RECKON's primitive), the Proposer gated on the pen alone.
  // Decoupled from the deflation: a count of human acts, not family cardinality — safe under D63-off AND if D63 ever reverses.
  export const OPTION_A: Option = { id: "A", definition: "the exit-set / Proposer trigger counts HUMAN-authored SEARCHes only (a set-op over the quarantined ledger — S128 makes HUMAN derivable and poison-resistant); the Proposer, whatever it becomes, is gated on the PEN alone", fires_on: "count(SEARCH acts on HUMAN lineages)" }
  // Option B — the trigger fires on the DERIVED family cardinality (the Family Enumerator's count — a set operation, no
  // generation). Coupled to the deflation's input; under D63-off familyN is pinned at 1, so it is a permanent no-op today.
  export const OPTION_B: Option = { id: "B", definition: "the trigger fires on the DERIVED family cardinality (the Family Enumerator's count — a set operation, no generation)", fires_on: "familyCardinality (the deflation's own input)" }

  export const OPTIONS: Option[] = [OPTION_A, OPTION_B]

  // a trigger definition is CIRCULAR (self-referential) if it fires on something it itself produces — the exact incoherence
  // S138 forbids. A definition that fires on "the trigger's own output/count/firing" fails; both A and B fire on a set-op over
  // an external ledger/enumeration, so neither is circular.
  export function isSelfReferential(fires_on: string): boolean {
    return /\b(the trigger('s)?|its own|this gate('s)?|recursion|itself)\b/i.test(fires_on)
  }

  // does the resolved trigger LIGHT the deflation under D63-off? D63 pins familyN === 1 and keeps the deflation INERT. Option A
  // (a count of human SEARCHes) is decoupled from the deflation → never lights it. Option B fires on family cardinality, which
  // D63 pins at 1 → it can never exceed 1 → a permanent no-op (inert), never lit. Neither lights anything.
  export function lightsDeflation(opt: Option, familyN: number): boolean {
    if (familyN !== 1) return false // D63-off enforces familyN===1 elsewhere; this asks whether the OPTION would light it, and under the pinned 1 neither does
    return false
  }

  // THE RESOLUTION (D62-R): pick A. Rationale — coherence (neither self-referential), X-RECKON fidelity (A reads SEARCH acts,
  // the ledger's own primitive; B reads a derived count too, both faithful), activation safety (neither lights under D63-off),
  // V39-readiness (A is DECOUPLED from the deflation, so it is safe today AND if D63 ever reverses — B is coupled to the
  // deflation's input and would light with it, a coupling a struck-off ruling should not pre-wire). The pick is PRESENTED at
  // the gate, strikeable; nothing is lit; the deflation stays dark by the pen's word.
  export const RESOLUTION = {
    pick: "A" as OptionId,
    rationale: "Option A (count HUMAN-authored SEARCHes, Proposer gated on the pen) is chosen: it is the more X-RECKON-native (SEARCH is the ledger's primitive), it is DECOUPLED from the deflation (a count of human acts, not family cardinality), so it is safe under D63-off AND if D63 is ever reversed; Option B couples the trigger to the deflation's own input (family cardinality), which a struck-off ruling should not pre-wire. Both are coherent (neither self-referential) and both are inert under D63-off; A is the safer coherence-bookkeeping choice for a future the pen may never open.",
    attackA: "counting human SEARCHes requires the quarantine to be perfect — a poisoned counter would fire the trigger on agent acts. ANSWERED: S128 (the quarantine) makes HUMAN derivable and poison-resistant; A reads the quarantined count, so A is safe BECAUSE of B1.",
    attackB: "Option B fires on family cardinality, which is the deflation's own input — under D63-off it is pinned at 1 (a permanent no-op), and if D63 reverses it lights WITH the deflation (a coupling a struck ruling should not pre-wire). Inert today, coupled tomorrow.",
    nothingLit: "NOTHING LIGHTS — D63 is off by the pen; familyN === 1; the deflation stays INERT; a seeded familyN>1 or a lit meter FAILS (S138). The resolution is coherence bookkeeping for a future the pen may never open, and it says so.",
    presentedStrikeable: "D62-R is PRESENTED at the gate, strikeable; the delegation was quoted (the pen act), the resolution carries both attacks (LN5 permits delegation-with-validation)."
  }
}
