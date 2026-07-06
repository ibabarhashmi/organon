/**
 * ORGΛNON STUDIO — the U-SURFACE LAW: if the user can't reach it, it doesn't exist (Reachability Phase 0; Rule U-SURFACE,
 * A′#1/#2). Three times across the series (V6/V8 controls without chokepoints, V11 panels without surfacing) the same
 * disease: a thing built, tested at module level, gated ADVANCE, and never wired into the path a user actually walks.
 * From this sprint on, any exit criterion describing something a user sees/reads/clicks/receives is satisfiable ONLY by
 * CONSOLE-PATH EVIDENCE — a recorded traversal of the user's actual path (fresh serve → real screen → real interaction →
 * rendered result), including AT LEAST ONE FAILURE STATE, judged against catalog-grade expected behavior. A renderer
 * unit test is necessary and never again sufficient.
 *
 * This module defines the admissible traversal-evidence schema, the theater check (a happy-path-only traversal proves
 * nothing a unit test didn't), and the SURFACING CENSUS (every user-facing capability → its traversal, with a seeded
 * positive control that MUST be caught or the census fails its own gate).
 */
import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"

export namespace Surface {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

  // one step of a real traversal: a served route hit through the real handler, judged against expected honest behavior
  export interface Step {
    route: string // the served route (or screen) exercised, e.g. "POST /console/goal"
    interaction: string // what the user did (the goal typed, the field composed, the button pressed)
    expected: string // the catalog-grade expected honest behavior
    met: boolean // did the rendered result match the expected behavior?
    evidence: string // a short excerpt / assertion from the real rendered response
  }
  // X-DEFAULT (Explanation): a per-criterion EXERCISE ASSERTION. A many-to-one traversal (one bundle satisfying several
  // criteria) must, PER mapped criterion, name the step that exercises THAT criterion's specific expected behavior — the
  // step's recorded behavior must match the criterion's expected-behavior string. This closes W8-01: a bundle that
  // composes-and-refuses can no longer stand as evidence for a ratchet it never ratcheted (the referenced step's behavior
  // wouldn't mention the ratchet). A vague ref (a mapping pointing at a step about something else) is caught.
  export interface ExerciseMapping {
    criterionId: string
    exerciseRef: string // the route of the step that exercises this criterion (matched against steps[].route / failureState.route)
    expectedBehavior: string // the criterion's expected behavior — must appear in the referenced step's recorded behavior
  }
  export interface TraversalArtifact {
    kind: "console-path-traversal"
    capability: string // the user-facing capability this traversal exercises
    freshServe: boolean // started from a fresh serve (a real request through the real route handler), not a cached renderer
    steps: Step[] // happy-path steps: real screen → real interaction → rendered result
    failureState: Step // AT LEAST ONE failure state (U-SURFACE / A′#1) — a happy-path-only traversal is theater
    allMet: boolean
    at: string
    mappings?: ExerciseMapping[] // X-DEFAULT: per-criterion exercise assertions (optional; required for a criterion carrying expectedBehavior)
  }

  // build + hash a traversal artifact (deterministic; the hash is over the canonical structure, not volatile bytes)
  export function makeTraversal(input: { capability: string; freshServe: boolean; steps: Step[]; failureState: Step; at: string; mappings?: ExerciseMapping[] }): TraversalArtifact {
    const allMet = input.steps.every((s) => s.met) && input.failureState.met
    return { kind: "console-path-traversal", capability: input.capability, freshServe: input.freshServe, steps: input.steps, failureState: input.failureState, allMet, at: input.at, ...(input.mappings ? { mappings: input.mappings } : {}) }
  }

  // verify the per-criterion EXERCISE ASSERTION (X-DEFAULT): the traversal must carry a mapping for `criterionId` whose
  // referenced step (a) exists, (b) is MET, and (c) whose recorded behavior CONTAINS the criterion's expected-behavior
  // string. A missing mapping, a ref to a non-existent/unmet step, or a step whose behavior does not match (a vague ref)
  // all fail — the many-to-one loophole (W8-01) closed at its mechanism.
  export function verifyExercise(a: TraversalArtifact | null, criterionId: string, expectedBehavior: string): { ok: boolean; detail: string } {
    if (!a || a.kind !== "console-path-traversal") return { ok: false, detail: "not a console-path-traversal artifact" }
    const m = (a.mappings ?? []).find((x) => x.criterionId === criterionId)
    if (!m) return { ok: false, detail: `no exercise mapping for criterion "${criterionId}" (a surface criterion with an expectedBehavior must name the step that exercises it)` }
    const needle = expectedBehavior.trim().toLowerCase()
    if (m.expectedBehavior.trim().toLowerCase() !== needle) return { ok: false, detail: `the mapping's expectedBehavior ("${m.expectedBehavior}") does not match the criterion's ("${expectedBehavior}")` }
    const all = [...a.steps, a.failureState]
    const step = all.find((s) => s.route === m.exerciseRef)
    if (!step) return { ok: false, detail: `exerciseRef "${m.exerciseRef}" names no step in the traversal` }
    if (!step.met) return { ok: false, detail: `the referenced step "${m.exerciseRef}" did not meet its expected behavior (an unmet step cannot exercise a criterion)` }
    const recorded = `${step.expected} ${step.evidence}`.toLowerCase()
    if (!recorded.includes(needle)) return { ok: false, detail: `VAGUE REF — the referenced step "${m.exerciseRef}" recorded "${step.expected}" / "${step.evidence}", which does not contain the expected behavior "${expectedBehavior}" (the step is about something else)` }
    return { ok: true, detail: `criterion "${criterionId}" exercised by step "${m.exerciseRef}" (behavior matched)` }
  }
  export function contentSha(a: TraversalArtifact): string {
    const canon = { kind: a.kind, capability: a.capability, freshServe: a.freshServe, steps: a.steps.map((s) => ({ route: s.route, interaction: s.interaction, expected: s.expected, met: s.met })), failureState: { route: a.failureState.route, interaction: a.failureState.interaction, expected: a.failureState.expected, met: a.failureState.met } }
    return sha256(JSON.stringify(canon))
  }

  // THEATER (A′#1, S14): a traversal is theater if it has no genuine failure state, or was not from a fresh serve, or
  // has zero happy-path steps — i.e. it proves nothing a renderer unit test wouldn't. The doc-lies theme audits for this.
  export function isTheater(a: TraversalArtifact): boolean {
    if (!a || a.kind !== "console-path-traversal") return true // a non-traversal artifact is not evidence at all
    if (!a.freshServe) return true
    if (!Array.isArray(a.steps) || !a.steps.length) return true
    if (!a.failureState || !a.failureState.route) return true // no failure state exercised
    return false
  }

  // ADMISSIBLE U-SURFACE evidence: a fresh serve, ≥1 real happy step, a genuine failure state, all judged + met. Robust
  // to a malformed / non-traversal artifact (module-only evidence on a surface criterion): it returns ok:false, never throws.
  export function verifyTraversal(a: TraversalArtifact): { ok: boolean; issues: string[] } {
    const issues: string[] = []
    if (!a || a.kind !== "console-path-traversal") return { ok: false, issues: ["not a console-path-traversal artifact (module-only evidence is refused on a U-SURFACE criterion)"] }
    if (!a.freshServe) issues.push("not from a fresh serve (U-SURFACE requires a real served request, not a cached renderer)")
    if (!Array.isArray(a.steps) || !a.steps.length) issues.push("no happy-path steps (a traversal must exercise the real screen → interaction → result)")
    if (isTheater(a)) issues.push("THEATER — no genuine failure state exercised (A′#1: a happy-path-only traversal proves nothing a unit test didn't)")
    if (!a.allMet) issues.push("a step did not meet its expected honest behavior")
    if (Array.isArray(a.steps) && !a.steps.some((s) => s.met)) issues.push("no step met its expected behavior")
    return { ok: issues.length === 0, issues }
  }

  // load + verify a traversal artifact from disk (the checkpoint gate resolves a surface criterion through this)
  export function loadTraversal(absPath: string): { artifact: TraversalArtifact | null; ok: boolean; issues: string[] } {
    if (!existsSync(absPath)) return { artifact: null, ok: false, issues: [`traversal artifact absent: ${absPath}`] }
    const a = JSON.parse(readFileSync(absPath, "utf8")) as TraversalArtifact
    return { artifact: a, ...verifyTraversal(a) }
  }

  // ── THE SURFACING CENSUS (Phase 0, once, retroactively) ──
  export interface CapabilityMapping {
    capability: string // a user-facing capability id (from the inventory / matrix)
    traversal: string | null // the path to its console-path traversal artifact, or null (DANGLING — a finding)
  }
  export interface CensusResult {
    surfaced: string[] // capabilities with an admissible traversal artifact
    dangling: { capability: string; reason: string }[] // capabilities with no admissible traversal — findings (fix-or-park)
    seededCaught: boolean // the seeded unsurfaced capability was CAUGHT (the census's own positive control, A′#2)
    ok: boolean
  }
  // Run the census: every user-facing capability must map to an admissible traversal; a DANGLING one is a finding. The
  // SEEDED unsurfaced capability (a real capability deliberately given no traversal) MUST be caught, or the census fails.
  export function census(mappings: CapabilityMapping[], seeded: CapabilityMapping, root: string): CensusResult {
    const resolve = (m: CapabilityMapping): { ok: boolean; reason: string } => {
      if (!m.traversal) return { ok: false, reason: "no traversal artifact (DANGLING — a user-facing capability with no console-path evidence)" }
      const t = loadTraversal(m.traversal.startsWith("/") ? m.traversal : `${root}/${m.traversal}`)
      return t.ok ? { ok: true, reason: "surfaced" } : { ok: false, reason: t.issues.join("; ") }
    }
    const surfaced: string[] = []
    const dangling: { capability: string; reason: string }[] = []
    for (const m of mappings) {
      const r = resolve(m)
      if (r.ok) surfaced.push(m.capability)
      else dangling.push({ capability: m.capability, reason: r.reason })
    }
    // the positive control: the seeded capability (no traversal) MUST resolve as dangling
    const seededCaught = !resolve(seeded).ok
    // the census passes iff the seeded control caught AND every real user-facing capability is surfaced (dangling are findings)
    return { surfaced, dangling, seededCaught, ok: seededCaught && dangling.length === 0 }
  }

  // ── THE COMPLETENESS HALF (Ensemble Phase 0; K-COMPLETE) ──
  // The V12 census enumerated THREE capabilities in a nine-screen, 28-row product — a working ink pad on a three-line
  // page (the audit's words). Two mechanisms finish the law: (1) the FULL re-census over the entire matrix + every
  // screen, each capability CATEGORIZED — user-facing (must map to a traversal that EXERCISES it) or infrastructure
  // (legitimately has no screen; declared non-user-facing with its real proving evidence, never silently skipped); and
  // (2) the per-checkpoint census DIFF over the capability diff since the last run, so a NEW user-facing capability
  // enters the law automatically (the W7-01 class — built, module-tested, never reaching the screen — extinct).
  export interface FullCensusEntry {
    capability: string
    kind: "user-facing" | "infrastructure"
    traversal: string | null // REQUIRED (an admissible path) for user-facing; null for infrastructure
    evidence: string // infrastructure: the proving test/wall that stands in for a traversal; user-facing: a note
  }
  export interface FullCensusResult {
    surfaced: string[] // user-facing capabilities with an admissible, non-theater traversal
    infrastructure: { capability: string; evidence: string }[] // declared non-user-facing WITH named evidence (auditable)
    dangling: { capability: string; reason: string }[] // user-facing with no admissible traversal — findings (fix-or-park)
    seededCaught: boolean // the seeded unsurfaced user-facing capability was CAUGHT (the census's positive control)
    infraWithoutEvidence: string[] // an infrastructure claim with no named evidence — a silent skip, itself a finding
    miscategorized: string[] // X-DEFAULT: a KNOWN user-facing capability declared 'infrastructure' — a hidden dangling surface (a finding)
    miscategorizationCaught: boolean // the seeded mis-categorization (a user-facing cap declared infra) was CAUGHT (the control)
    ok: boolean
  }
  // The one-time FULL re-census: EVERY matrix PRESENT row + EVERY screen, categorized and resolved. A user-facing entry
  // needs an admissible traversal (theater refused per mapping); an infrastructure entry needs NAMED evidence (a silent
  // "not user-facing" is itself a finding — infraWithoutEvidence). X-DEFAULT: a capability in `knownUserFacing` declared
  // 'infrastructure' is a MIS-CATEGORIZATION (a plausible way to hide a dangling surface behind a false label) — caught.
  // The seeded user-facing capability MUST be caught; the seeded mis-categorization MUST fire the control.
  export function fullCensus(entries: FullCensusEntry[], seeded: FullCensusEntry, root: string, opts: { knownUserFacing?: string[]; seededMiscategorized?: FullCensusEntry } = {}): FullCensusResult {
    const abs = (p: string) => (p.startsWith("/") ? p : `${root}/${p}`)
    const known = new Set(opts.knownUserFacing ?? [])
    const surfaced: string[] = []
    const infrastructure: { capability: string; evidence: string }[] = []
    const dangling: { capability: string; reason: string }[] = []
    const infraWithoutEvidence: string[] = []
    const miscategorized: string[] = []
    for (const e of entries) {
      if (e.kind === "infrastructure") {
        if (known.has(e.capability)) { miscategorized.push(e.capability); continue } // a known user-facing cap hiding as infra
        if (!e.evidence.trim()) infraWithoutEvidence.push(e.capability)
        else infrastructure.push({ capability: e.capability, evidence: e.evidence })
        continue
      }
      if (!e.traversal) { dangling.push({ capability: e.capability, reason: "user-facing but no traversal artifact (DANGLING)" }); continue }
      const t = loadTraversal(abs(e.traversal))
      if (t.ok) surfaced.push(e.capability)
      else dangling.push({ capability: e.capability, reason: t.issues.join("; ") })
    }
    // the positive control: the seeded user-facing capability (no traversal) MUST resolve as dangling
    const seededCaught = seeded.kind === "user-facing" && (!seeded.traversal || !loadTraversal(abs(seeded.traversal)).ok)
    // the mis-categorization control: a seeded KNOWN-user-facing capability declared 'infrastructure' MUST be caught
    const mc = opts.seededMiscategorized
    const miscategorizationCaught = !mc || (mc.kind === "infrastructure" && known.has(mc.capability))
    const ok = seededCaught && miscategorizationCaught && dangling.length === 0 && infraWithoutEvidence.length === 0 && miscategorized.length === 0
    return { surfaced, infrastructure, dangling, seededCaught, infraWithoutEvidence, miscategorized, miscategorizationCaught, ok }
  }

  // THE PER-CHECKPOINT CENSUS DIFF (K-COMPLETE): given the capabilities surfaced/declared at the LAST checkpoint and the
  // FULL entry list NOW, resolve only the capabilities that are NEW (entered since last run). A new user-facing
  // capability with no admissible traversal is a finding — the mechanism that makes W7-01 impossible (a built-but-
  // unreached capability is caught the checkpoint it appears, not a walk later). Attached to every gatekeeper checkpoint.
  export interface CensusDiffResult {
    since: number // capabilities known at the last checkpoint
    now: number // capabilities enumerated now
    newCapabilities: string[]
    newlySurfaced: string[]
    newlyInfrastructure: string[]
    newlyDangling: { capability: string; reason: string }[]
    ok: boolean
  }
  export function censusDiff(sinceCapabilities: string[], nowEntries: FullCensusEntry[], root: string): CensusDiffResult {
    const abs = (p: string) => (p.startsWith("/") ? p : `${root}/${p}`)
    const known = new Set(sinceCapabilities)
    const fresh = nowEntries.filter((e) => !known.has(e.capability))
    const newlySurfaced: string[] = []
    const newlyInfrastructure: string[] = []
    const newlyDangling: { capability: string; reason: string }[] = []
    for (const e of fresh) {
      if (e.kind === "infrastructure") {
        if (e.evidence.trim()) newlyInfrastructure.push(e.capability)
        else newlyDangling.push({ capability: e.capability, reason: "new infrastructure capability with no named evidence (a silent skip)" })
        continue
      }
      if (!e.traversal) { newlyDangling.push({ capability: e.capability, reason: "new user-facing capability with no traversal (the W7-01 class)" }); continue }
      const t = loadTraversal(abs(e.traversal))
      if (t.ok) newlySurfaced.push(e.capability)
      else newlyDangling.push({ capability: e.capability, reason: t.issues.join("; ") })
    }
    return { since: known.size, now: nowEntries.length, newCapabilities: fresh.map((e) => e.capability), newlySurfaced, newlyInfrastructure, newlyDangling, ok: newlyDangling.length === 0 }
  }
}
