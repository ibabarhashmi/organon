/**
 * ORGΛNON — THE PROVENANCE SPRINT (V42), Phase 1/2 (S170, DD-75/RP-2): EVERY GENERATED CLAIM IS FRESH OR HONESTLY CARRIED.
 *
 * THE DIAGNOSIS (M-2): V41's D33 note/iidRider/flipEvidence were V39's PROSE reproduced verbatim in a "generated" field.
 * D33 correctly did not change — but a generated header echoing a prior sprint's narrative is a STORED STRING, not a claim
 * computed this run (X-DERIVE(a): the claim is computed, not echoed). S141's evidence was being echoed, not recomputed.
 *
 * PART A′ #2: 'carried:{from,why} is a loophole — every stale field will be tagged carried and sail through, and now staleness
 * is BLESSED.' A tag that excuses staleness is worse than no tag. So `carried` is legal ONLY when the carry is RE-VERIFIED:
 * a carried claim is a claim that was RECOMPUTED and found identical — not one that was skipped. Freshness.carried() re-runs
 * the claim's OWN inputs (RP-2, F-2 — never transitively-coupled state) and records whether the recompute matches; a carry
 * that would recompute differently is a LIE and REFUSES the log (S170). The D33 note qualifies (D33 unchanged); a stale
 * batteryDelta would NOT (the battery moved).
 *
 * Pure: takes recompute thunks; performs no I/O of its own.
 */
export namespace Freshness {
  export interface Computed { field: string; kind: "COMPUTED"; producer: string; value: string }
  export interface Carried { field: string; kind: "CARRIED"; from: string; why: string; value: string; inputs: string[]; inputsMoved: boolean; reverified: boolean }
  export type Class = Computed | Carried

  // COMPUTED — a producer recomputed this field's value THIS run. The producer name is recorded (X-DERIVE(b)).
  export function computed(field: string, producer: string, value: string): Computed {
    return { field, kind: "COMPUTED", producer, value }
  }

  // CARRIED — the field equals a prior sprint's value AND a recompute of its OWN inputs (RP-2) yields the identical value.
  // `recompute` returns what the claim WOULD produce now from its own inputs; if that differs from `value`, an input moved and
  // the carry is a lie (reverified:false, inputsMoved:true) — it must be COMPUTED instead. The recompute is over the claim's
  // OWN inputs only, never transitively-coupled state (F-2): a carry is honest only if EVERY input to it is unchanged.
  export function carried(field: string, from: string, why: string, value: string, inputs: string[], recompute: () => string): Carried {
    const recomputed = recompute()
    const reverified = recomputed === value
    return { field, kind: "CARRIED", from, why, value, inputs, inputsMoved: !reverified, reverified }
  }

  // S170 — the whole audit is honest iff every CARRIED field re-verified (recompute matched). A carried field whose recompute
  // differs is a LIE (staleness blessed): it must be COMPUTED, not carried. Returns the offending fields (empty = honest).
  export function honest(classes: Class[]): { ok: boolean; lies: string[]; computed: number; carried: number } {
    const lies = classes
      .filter((c): c is Carried => c.kind === "CARRIED" && !c.reverified)
      .map((c) => `${c.field} (carried from ${c.from}) would recompute differently — carried is a lie; its input(s) [${c.inputs.join(", ")}] moved this sprint. RECOMPUTE it (X-DERIVE(a)).`)
    const computed = classes.filter((c) => c.kind === "COMPUTED").length
    const carried = classes.filter((c) => c.kind === "CARRIED").length
    return { ok: lies.length === 0, lies, computed, carried }
  }

  // detect an UNTAGGED prior-sprint string (M-2's exact defect: V39's prose in a generated field, untagged). A generated field
  // whose value equals a KNOWN prior-sprint string but is NOT tagged CARRIED → REFUSE. `taggedFields` is the set of fields
  // that carry an explicit carried:{from} tag; any other field matching a prior-sprint string is an untagged echo.
  export function untaggedPriorStrings(classes: Class[], priorStrings: Record<string, string>): string[] {
    const tagged = new Set(classes.filter((c) => c.kind === "CARRIED").map((c) => c.field))
    const offenders: string[] = []
    for (const c of classes) {
      if (c.kind !== "COMPUTED") continue
      for (const [from, s] of Object.entries(priorStrings)) {
        if (c.value === s && !tagged.has(c.field)) offenders.push(`${c.field} equals ${from}'s string but is tagged COMPUTED, not CARRIED — an untagged prior-sprint echo (M-2)`)
      }
    }
    return offenders
  }
}
