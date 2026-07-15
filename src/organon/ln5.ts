/**
 * ORGΛNON — THE RECKONING SPRINT (V44), Phase 1/5 (S192/S197): THE LN5 MECHANIZATION.
 *
 * LN5 is the gravest law: the agent presents the Operator gate, NEVER signs; simulating a signature is the gravest violation.
 * For nineteen sprints operatorSigned has been a compile-time `false` constant (Signability.Result, D33.Verdict) — safe by
 * construction. But V44 is the sprint where the Operator INSTRUCTED "then sign", and D91 reserves the amendment question. So
 * the discipline is no longer left to a constant — it is MECHANIZED at the emit path: Ln5.verify() recursively scans the whole
 * terminal marker for ANY `operatorSigned: true`, and a single one REFUSES the build log. A seeded agent flip (the positive
 * control on the REAL emit path) proves the gate BITES — the agent cannot ship a record in which it signed the pen, whatever an
 * instruction said, because the value LN5 protects is that a signature means a HUMAN reviewed and chose.
 *
 * This is the D33-ruling made structural: the agent audits, decides, recommends, and CANNOT emit a signed bit. The Operator
 * signs in one keystroke; the agent has removed every other obstacle and mechanically fenced the one it may not touch.
 *
 * Pure: walks an in-memory object graph. No I/O, no network.
 */
export namespace Ln5 {
  export interface Hit { path: string }

  // recursively collect every path where `operatorSigned` is literally true, OR a `signed`/`operatorSignature` flag is true in
  // a deviation-state shape. The agent's records set operatorSigned:false everywhere; a true is a seeded/forged signature.
  export function scan(o: unknown, prefix = ""): Hit[] {
    const hits: Hit[] = []
    const walk = (v: unknown, p: string) => {
      if (v === null || v === undefined) return
      if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${p}[${i}]`)); return }
      if (typeof v === "object") {
        for (const k of Object.keys(v as object)) {
          const child = (v as Record<string, unknown>)[k]
          // the fenced bit: operatorSigned (and its aliases) must never be true in an agent-emitted record
          if ((k === "operatorSigned" || k === "operatorSignature" || k === "penSigned") && child === true) hits.push({ path: p ? `${p}.${k}` : k })
          walk(child, p ? `${p}.${k}` : k)
        }
      }
    }
    walk(o, prefix)
    return hits
  }

  export type Verdict = { ok: true; detail: string } | { ok: false; reason: string; hits: Hit[] }

  // Ln5.verify(marker) — the emit-path guarantee (S192/S197). A build log in which the agent set operatorSigned:true anywhere
  // is REFUSED — the gravest Halt. The Operator can sign in one keystroke (his own edit, post-emit); the agent never emits it.
  export function verify(marker: unknown): Verdict {
    const hits = scan(marker)
    if (hits.length > 0)
      return { ok: false, reason: `operatorSigned:true appears in the marker at [${hits.map((h) => h.path).join(", ")}] — the AGENT never moves the signature bit (LN5, the gravest violation); an agent that flips the bit certifying a human reviewed and chose has forged the one thing the bit means. The Operator signs in one keystroke; the agent does not emit it.`, hits }
    return { ok: true, detail: "operatorSigned is false everywhere in the marker — the agent audited, decided, and recommended; the pen is the human's (LN5 mechanized, S192/S197)" }
  }
}
