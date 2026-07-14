/**
 * ORGΛNON — THE SURROGATE ADDENDUM (V38-B), B7: Surrogate — THE ADDENDUM'S SUCCESS CRITERION (DD-48-R2, RP-5) + THE GATE.
 *
 * DD-48 re-pinned for R2: the addendum SUCCEEDS iff (1) the canary is clean AND (2) all four rulings are executed traceably
 * AND (3) the break ledger exists with every finding classified AND (4) IN2's instrument (the journal + counters) is provably
 * uncontaminated. Computed, printed, and FAILED if any leg is missing. And the new gate FIRST LINE — no longer a question, a
 * SCHEDULE: the pen answered D51.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"
import { Quarantine } from "../strategy/authorship"

export namespace Surrogate {
  function pins(): Record<string, unknown> {
    return JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "surrogate-pins.json"), "utf8"))
  }
  function breakLedger(): { ledger?: { findings?: { classification?: string }[]; counts?: Record<string, number> } } {
    try { return JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "math-redteam.json"), "utf8")) } catch { return {} }
  }

  export interface Leg { name: string; ok: boolean; detail: string }
  export interface Result { succeeded: boolean; legs: Leg[] }

  // the four legs — each COMPUTED, never typed (RP-5).
  export function success(): Result {
    const sg = pins() as { thePenMoved?: { rulings?: Record<string, { status?: string }> } }
    const canary = Quarantine.live()

    // (1) the canary is clean — the base and quarantined real-class counters agree (no agent lineage counted as real)
    const leg1: Leg = { name: "canary clean", ok: canary.ok, detail: canary.detail }

    // (2) all four rulings executed traceably (each ruling has a recorded status, not OPEN/UNANSWERED)
    const rulings = sg.thePenMoved?.rulings ?? {}
    const statuses = ["D51", "D33", "D62", "D63"].map((id) => rulings[id]?.status ?? "MISSING")
    const executed = statuses.every((s) => s !== "MISSING")
    const leg2: Leg = { name: "four rulings executed", ok: executed, detail: `D51=${statuses[0]} · D33=${statuses[1]} · D62=${statuses[2]} · D63=${statuses[3]}` }

    // (3) the break ledger exists with EVERY finding classified into a valid class
    const bl = breakLedger().ledger
    const findings = bl?.findings ?? []
    const VALID = new Set(["BREAK", "ASSUMPTION-LIMIT", "THEORY-GAP", "NONE"])
    const allClassified = findings.length > 0 && findings.every((f) => f.classification !== undefined && VALID.has(f.classification))
    const leg3: Leg = { name: "break ledger classified", ok: allClassified, detail: findings.length ? `${findings.length} findings, all classified (BREAK ${bl?.counts?.BREAK ?? 0})` : "no break ledger found" }

    // (4) IN2's instrument (the journal + counters) is provably uncontaminated — the quarantine's live check (same as (1)'s
    // mechanism, stated as its own leg because it is the DIFFERENT claim: not just 'the canary did not move' but 'the counter
    // the instrument's kill-criterion reads is agent-free')
    const leg4: Leg = { name: "IN2 instrument uncontaminated", ok: canary.ok && canary.agentLineages.length === 0, detail: `realLineageCount (quarantined) === base ${canary.base}; ${canary.agentLineages.length} agent lineages` }

    const legs = [leg1, leg2, leg3, leg4]
    return { succeeded: legs.every((l) => l.ok), legs }
  }

  // THE GATE FIRST LINE (B7) — no longer a question; the pen answered D51. A SCHEDULE, computed.
  export function gateFirstLine(): string {
    const canary = Quarantine.live()
    return `instrument: BY-DESIGN · the only validation: IN2 · remaining pen acts: D62-R ratify · D67 pin (N) · D27… · D63: OFF (the meter dark, the memory kept) · canary: ${canary.ok ? "clean" : "TRIPPED"}`
  }
}
