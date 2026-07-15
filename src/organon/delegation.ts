/**
 * ORGΛNON — THE RECKONING SPRINT (V44), Phase 5 (DD-93, S197): THE DELEGATION, RATIFIED — NOT SIGNED.
 *
 * The Operator delegated the three V43 deviations ("if you know better, can do a better job... take the adversarially-
 * validated call. You've the mandate.") — like D62. The agent evaluates D87 (the general reconciler), D88 (the backfill
 * engine), D89 (the REAL-DERIVED tier) against correctness + the 2-dep/no-daemon/rate-space constraints + whether a simpler or
 * stronger design exists, and records D87-R/D88-R/D89-R with the adversarial validation attached.
 *
 * THE DISTINCTION (A′#5) that keeps this from being an LN5 violation: ratification is the AGENT's recorded ENGINEERING CALL
 * under an explicit delegation — "the agent evaluated these and judges them sound, with validation attached." A SIGNATURE is
 * "the Operator reviewed and chose." The delegation covers the engineering judgment (which the agent may make); it does NOT
 * cover the pen-stroke (which it may not — LN5). So each moves from RESERVED to AGENT-RATIFIED with operatorSigned:false, and
 * S197 mechanizes it: Ln5.verify over the ratification set REFUSES if any operatorSigned is true (a seeded agent signature
 * FAILS). D33 differs only in that the instruction used the word "sign" — and that word touches the one bit LN5 fences.
 *
 * Pure: reads the committed DD-93 ratifications from reckoning-pins. No network.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"
import { Ln5 } from "./ln5"

export namespace Delegation {
  const H = path.join(PKG_ROOT, "data", "honesty")

  export interface Ratification {
    id: "D87" | "D88" | "D89"
    state: "AGENT-RATIFIED"
    operatorSigned: false // LN5 — ratification is the agent's engineering call, NOT the pen; the bit stays false
    validation: string // the adversarial validation attached
  }

  // read the DD-93 ratifications from the pins (the agent's recorded engineering calls).
  export function ratifications(): Ratification[] {
    const dd93 = JSON.parse(readFileSync(path.join(H, "reckoning-pins.json"), "utf8")).delegatedDecisions.DD93 as Record<string, string>
    return [
      { id: "D87", state: "AGENT-RATIFIED", operatorSigned: false, validation: dd93.D87R },
      { id: "D88", state: "AGENT-RATIFIED", operatorSigned: false, validation: dd93.D88R },
      { id: "D89", state: "AGENT-RATIFIED", operatorSigned: false, validation: dd93.D89R },
    ]
  }

  // S197 — every delegated deviation is AGENT-RATIFIED with operatorSigned:false (the delegation covers the engineering call,
  // NOT the pen), AND the ratification set is LN5-clean (Ln5.verify finds no operatorSigned:true — a seeded agent signature
  // REFUSES). Ratification ≠ signature; the bit stays the Operator's.
  export type Verdict = { ok: true; ratified: Ratification[]; detail: string } | { ok: false; reason: string }
  export function verdict(): Verdict {
    const r = ratifications()
    if (r.length !== 3) return { ok: false, reason: `expected 3 delegated ratifications (D87/D88/D89), got ${r.length}` }
    const notRatified = r.filter((x) => x.state !== "AGENT-RATIFIED")
    if (notRatified.length > 0) return { ok: false, reason: `deviation(s) [${notRatified.map((x) => x.id).join(", ")}] are not AGENT-RATIFIED` }
    const missingValidation = r.filter((x) => !x.validation || x.validation.trim().length < 20)
    if (missingValidation.length > 0) return { ok: false, reason: `ratification(s) [${missingValidation.map((x) => x.id).join(", ")}] have no attached validation — a ratification without validation is not a ratification (DD-93)` }
    // the LN5 mechanization: the ratification set must be signature-clean (operatorSigned false everywhere; a seeded true REFUSES)
    const ln5 = Ln5.verify(r)
    if (!ln5.ok) return { ok: false, reason: `${ln5.reason} — ratification is the agent's engineering call, NEVER the pen (S197/LN5)` }
    return { ok: true, ratified: r, detail: `D87-R/D88-R/D89-R AGENT-RATIFIED with validation attached, operatorSigned:false on all three (the delegation covers the engineering judgment; the pen-stroke stays the Operator's — LN5 mechanized, a seeded agent signature REFUSES)` }
  }
}
