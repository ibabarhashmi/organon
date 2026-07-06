/**
 * ORGΛNON STUDIO — the PLAIN-LANGUAGE verdict report + the narrative-honesty checker (Phase 4; Rule S-HONEST-UX).
 *
 * The education layer is where honesty dies quietly: a report that simplifies the numbers into a nudge toward
 * deployment is worse than no report. So the renderer is CONSTRAINED, and a checker enforces the constraints:
 *   • two-sided — every report states what would make the verdict WRONG, and never leads with the upside;
 *   • the failure mode in PLAIN words — "no edge found" (edge-weak) vs. "this domain likely can't support a confident
 *     answer at any skill level — pending an external audit of the floor" (structurally-un-powered, hedged);
 *   • the user SEES their own family size (how many trials the ledger counted) — the deflation is not hidden;
 *   • INSUFFICIENT-EVIDENCE is a first-class state with a forward clock, never dressed as an error or a euphemism;
 *   • no priming: no "almost passed", "strong candidate", "so close", no confidence the engine didn't emit.
 *
 * The renderer DISPLAYS; it never DERIVES a verdict (S-CORE / display-only). It relays what the attestation says.
 */
import type { AttestAdjudicate } from "../attest/adjudicate"
import type { Studio } from "./adjudicate"

export namespace StudioReport {
  // The plain-language mapping of the engine's verdict + reason into a failure MODE a non-expert can act on. Hedged
  // per Rule XXXVIII where the claim rests on the unaudited floor.
  export function failureModePlain(v: Studio.StudioVerdict): string {
    const a = v.attestation
    switch (a.verdict) {
      case "GO":
        return "The engine found a real, deflation-surviving edge, re-derived on its own point-in-time data and pre-registered before the out-of-sample window. This is the rarest outcome."
      case "CONDITIONAL":
        return "The edge survives the statistics GIVEN what could be verified, but a stronger claim is fenced off — the data or the search could not be independently confirmed. Treat as a hypothesis with support, not a settled result."
      case "NO-GO":
        return "No edge found: what looked promising did not survive an honest correction for how many strategies were tried. This is the expected outcome for most proposals and is not a failure of the tool."
      case "INSUFFICIENT-EVIDENCE":
        return `Not enough evidence to decide either way — only ${a.rigor?.nObs ?? "?"} observations against a power floor of ${a.floorObs}. This is neither a yes nor a no; it is a "come back with more data" clock. (The floor itself is ASSUMED, pending an external audit — Rule XXXVIII.)`
      case "CANNOT-VERIFY-SEARCH":
        return "The result looks strong but the search intensity could not be proven, so a confident answer is impossible — how many strategies were tried decides whether this is signal or noise."
      case "CANNOT-VERIFY-DATA":
        return "The result is significant but the underlying data could not be independently re-derived, so it cannot be attested at full strength."
      default:
        return "Undetermined."
    }
  }

  // What would change the verdict — the honest forward path, never a countdown to a GO.
  export function whatCouldChangeIt(v: Studio.StudioVerdict): string {
    const a = v.attestation
    if (a.verdict === "INSUFFICIENT-EVIDENCE")
      return `More point-in-time observations (currently ${a.rigor?.nObs ?? "?"} of an assumed ${a.floorObs} needed). The clock runs forward; there is no promise it will ever clear.`
    if (a.verdict === "NO-GO") return "A genuinely different mechanism, pre-registered before its out-of-sample window and re-derived on the engine's own data. Iterating the same idea will NOT help — every attempt is counted and makes the bar harder."
    return "Independent verification of the data and an anchored pre-registration would let the engine attest a stronger claim."
  }

  // Render the report. Two-sided by construction: it LEADS with what was tested + the honest verdict, states the
  // failure mode plainly, SHOWS the family size, and closes with what would make it wrong. No GO-priming surface.
  export function render(v: Studio.StudioVerdict): string {
    const a = v.attestation
    const L: string[] = []
    // a synthetic/test verdict is BANNERED so it can never be mistaken for a real result (the fixture-leak wall).
    if (a.synthetic) L.push(`⚠ SYNTHETIC TEST FIXTURE — NOT A REAL VERDICT (engine-controlled demonstration data)`)
    L.push(`VERDICT: ${a.verdict}`)
    L.push("")
    L.push(`What was tested — and how hard: your proposal was checked against ${v.family.size} counted ${v.family.size === 1 ? "trial" : "trials"} in its family (the ledger counts every iteration — that is the honest number of strategies searched, and it makes the statistical bar harder, not easier).`)
    if (a.dsrAtDeclared !== null && a.dsrAtDeclared !== undefined) L.push(`Deflated significance at ${v.familyDeclaredNTrials} trials: ${a.dsrAtDeclared.toFixed(3)} (the bar is 0.95).`)
    L.push("")
    L.push(`What it means: ${failureModePlain(v)}`)
    L.push("")
    L.push(`What could change it: ${whatCouldChangeIt(v)}`)
    L.push("")
    // the two-sided close — always present, never softened:
    L.push(`What could still go wrong even if this were positive: past-data significance is not a promise of future return; the point-in-time data, the survivorship of the venues, and the search you did NOT declare are all risks the engine cannot see. A verdict here is a floor on doubt, not a guarantee.`)
    return L.join("\n")
  }

  // ── the narrative-honesty checker (the ux_honesty_studio wall consumes this) ──
  export interface HonestyResult {
    ok: boolean
    violations: string[]
  }

  const PRIMING = [
    /almost passed/i, /so close/i, /strong candidate/i, /nearly (there|passed|made it)/i,
    /promising (buy|opportunity)/i, /likely to pass soon/i, /just missed/i, /on track to (a )?go/i,
    /we('| a)re confident/i, /trust (me|us)/i, /guaranteed/i, /can't lose/i, /sure thing/i,
  ]

  // A report is honest iff it is two-sided, shows the family size, renders INSUFFICIENT with a forward clock (not as an
  // error), hedges reachability as pending the floor audit, and carries NO priming phrase. A missing check is a
  // violation — silence is not honesty.
  export function check(text: string, v: Studio.StudioVerdict): HonestyResult {
    const violations: string[] = []
    for (const p of PRIMING) if (p.test(text)) violations.push(`priming phrase present: ${p}`)
    if (!/what could (still )?go wrong|risk|not a (promise|guarantee)/i.test(text)) violations.push("not two-sided: no downside/what-could-go-wrong statement")
    if (!new RegExp(`\\b${v.family.size}\\b`).test(text) || !/trial/i.test(text)) violations.push("family size (the search count) is not shown to the user")
    if (v.attestation.verdict === "INSUFFICIENT-EVIDENCE") {
      if (/error|failed|invalid input/i.test(text)) violations.push("INSUFFICIENT rendered as an error/failure, not a first-class clocked state")
      if (!/floor|more (data|observations)|clock/i.test(text)) violations.push("INSUFFICIENT lacks a forward clock")
      if (!/assumed|pending (an )?(external )?audit/i.test(text)) violations.push("reachability/floor stated as settled, not hedged (Rule XXXVIII)")
    }
    return { ok: violations.length === 0, violations }
  }
}
