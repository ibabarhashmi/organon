/**
 * ORGΛNON STUDIO — the analyst GRAPH (Phase 5; Rules S-PROPOSE, S-FREE, S-HONEST-UX). The real layer the pivot only
 * scaffolded: NL-goal intake (elicitation-only — constraints out, NEVER comfort out), four snapshot-grounded analysts,
 * a bull/bear debate that produces RATIONALES (never adjudications), pre-flight-first (a flagged domain requires a
 * logged justification), reflection-on-failureMode (the next family's prompt carries WHY the engine refused the last),
 * and the unchanged RELAY (verbatim, capability-absent). Runs deterministically on fixtures (S-FREE: zero live
 * inference in CI); the ONE live free-model run is a recorded artifact, never a CI dependency.
 *
 * Authority is still ZERO: every node here PROPOSES; only the engine disposes. A debate node cannot summarize a
 * verdict into existence, and the intake cannot reassure a user past the engine's epistemic state.
 */
import { StudioAgents } from "./agents"
import { StudioReport } from "./report"
import { Ledger } from "../ledger/ledger"
import { Studio } from "./adjudicate"

export namespace StudioGraph {
  // ── NL-goal intake — ELICITATION ONLY. Turns a natural-language goal into constraints; its prose is checked by the
  // SAME honesty checker as reports (no comfort, no priming, no "this will make money"). ──
  export interface Intake {
    goal: string
    domain: string
    constraints: string[]
    prose: string // shown to the user; must pass the honesty gate
  }
  const COMFORT = [/will (make|earn) (you )?money/i, /can'?t lose/i, /guaranteed/i, /you'?ll be fine/i, /don'?t worry/i, /trust (me|us)/i, /sure thing/i, /great (choice|opportunity)/i]

  export function intake(goal: string, domain: string, constraints: string[]): Intake {
    // elicitation-only prose: restate the goal + the constraints elicited + the honest caveat. Never reassurance.
    const prose = `Understood goal: "${goal}". Constraints elicited: ${constraints.join("; ") || "none"}. This registers a hypothesis to TEST; it is not advice and implies no expected return — the engine may well refuse it, which is the common and correct outcome.`
    return { goal, domain, constraints, prose }
  }
  export function intakeIsHonest(i: Intake): { ok: boolean; violations: string[] } {
    const violations: string[] = []
    for (const p of COMFORT) if (p.test(i.prose)) violations.push(`comfort/priming phrase in intake: ${p}`)
    if (!/not advice|no expected return|may .*refuse|test/i.test(i.prose)) violations.push("intake prose lacks the honest caveat (elicitation, not advice)")
    return { ok: violations.length === 0, violations }
  }

  // ── analysts — four grounded roles over the snapshot. Each finding's numbers must ground (S-PROPOSE). ──
  export type AnalystRole = "yield" | "rates" | "funding" | "protocol-risk"
  export interface Finding {
    role: AnalystRole
    narrative: StudioAgents.Narrative
  }
  export function analysts(snap: StudioAgents.Snapshot, narratives: Record<AnalystRole, StudioAgents.Narrative>): { findings: Finding[]; grounded: boolean } {
    const roles: AnalystRole[] = ["yield", "rates", "funding", "protocol-risk"]
    const findings = roles.map((role) => ({ role, narrative: narratives[role] }))
    const grounded = findings.every((f) => StudioAgents.checkGrounding(f.narrative, snap).ok)
    return { findings, grounded }
  }

  // ── bull/bear debate — produces RATIONALES, never a verdict. ──
  export interface Debate {
    bull: string
    bear: string
    rationale: string
    producesVerdict: false // structurally: the debate has no verdict field to fill
  }
  export function debate(bull: string, bear: string): Debate {
    return { bull, bear, rationale: `Two-sided: BULL — ${bull}; BEAR — ${bear}. The engine, not this debate, decides.`, producesVerdict: false }
  }

  // ── pre-flight-first — a flagged (structurally-un-powered) domain requires a logged justification (A-PRE). ──
  export function preflightGate(reachable: boolean, justification?: string): { proceed: boolean; log: string } {
    if (reachable) return { proceed: true, log: "domain reachable per pre-flight; proceeding" }
    if (justification && justification.trim().length > 0) return { proceed: true, log: `domain flagged structurally-un-powered; proceeding WITH justification: ${justification}` }
    return { proceed: false, log: "domain flagged structurally-un-powered and NO justification supplied — proposal withheld (A-PRE)" }
  }

  // ── reflection-on-failureMode — the next family's prompt carries WHY the engine refused the last one. ──
  export function reflect(priorVerdict: Studio.StudioVerdict | null): string {
    if (!priorVerdict) return "First attempt in this lineage — no prior refusal to reflect on."
    const a = priorVerdict.attestation
    return `The engine last returned ${a.verdict} (deflated at n=${priorVerdict.familyDeclaredNTrials}). ${StudioReport.failureModePlain(priorVerdict)} — a mutation of the same idea will only raise the bar; change the MECHANISM or gather more data.`
  }

  // ── the end-to-end path: NL goal → (intake, analysts, debate, reflection) → registered spec → verbatim verdict →
  // honest report. Deterministic on fixtures; the relay is the unchanged capability-absent node. ──
  export interface GoalRun {
    intake: Intake
    grounded: boolean
    debate: Debate
    reflection: string
    verdict: Studio.StudioVerdict
    report: string
  }
  export async function runGoalToVerdict(
    store: Ledger.Store,
    input: { goal: string; domain: string; constraints: string[]; snapshot: StudioAgents.Snapshot; narratives: Record<AnalystRole, StudioAgents.Narrative>; spec: unknown; bull: string; bear: string; prior?: Studio.StudioVerdict; extras: Studio.SubmitExtras & { authorClass?: Ledger.AuthorClass; authorId?: string; timestamp: number } },
  ): Promise<GoalRun> {
    const ig = intake(input.goal, input.domain, input.constraints)
    const { grounded } = analysts(input.snapshot, input.narratives)
    if (!grounded) throw new Error("an analyst narrative is ungrounded — proposal withheld (S-PROPOSE)")
    const deb = debate(input.bull, input.bear)
    const reflection = reflect(input.prior ?? null)
    const { authorClass = "agent", authorId, timestamp, ...extras } = input.extras
    // the RELAY — register-then-invoke; the verdict is the core's, verbatim.
    const verdict = await Studio.submit(store, { spec: input.spec, authorClass, authorId, domain: input.domain, timestamp, ...extras })
    return { intake: ig, grounded, debate: deb, reflection, verdict, report: StudioReport.render(verdict) }
  }
}
