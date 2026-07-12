/**
 * ORGΛNON — THE MANIFEST SPRINT (X-MANIFEST). The Strategy Manifest: a local-first, DECLARATIVE artifact the user
 * AUTHORS — `positions[]` (each a subject the engine already knows, plus a size in the user's OWN units), a `thesis`
 * written IN ADVANCE (the conjecture filed for refutation), and a pre-registered `exitCriterion` (the user's own
 * kill-criterion, evaluable over facts the engine already captures). The compiler JUDGES this; it NEVER authors — there
 * is no `weights`, no `rebalance`, no suggested anything (that is `compile.ts`'s wall, X-ADVICE; here we only PARSE).
 *
 * `parseManifest(json)` returns the typed Manifest OR a one-sentence REFUSAL naming which field + why — never a crash.
 * The zod schema is `.strict()` + versioned: an unknown key is refused (never silently dropped); an oversized thesis, an
 * empty positions list, a manifest position that references another manifest (no recursion this sprint) are each refused
 * with a sentence. Pure + deterministic; no I/O (the store is `store.ts`). Pinned shape: manifest-pins.json.manifestSchema.
 */
import { z } from "zod"

export namespace Manifest {
  export const SCHEMA_VERSION = 1

  // caps — a manifest is a decision journal, not a book; hostile oversizing is refused politely (not crashed on)
  export const THESIS_MAX = 4000
  export const POSITIONS_MAX = 50
  export const SUBJECT_KEY_MAX = 200
  export const UNITS_MAX = 40
  export const ASSUMPTIONS_MAX = 1000
  export const SCOPE_MAX = 200
  export const JOURNAL_FIELD_MAX = 4000

  // the four EVALUABLE exit kinds — each maps to a fact the existing engine already captures (manifest-pins evaluableSet);
  // a kind outside this closed set fails the enum → refused at parse (and again, with a reason, at exit registration).
  export const EXIT_KINDS = ["peg-floor", "funding-flip-count", "tvl-drawdown", "governance-change"] as const
  export type ExitKind = (typeof EXIT_KINDS)[number]

  // a subjectKey that names another manifest — recursion is refused this sprint (a manifest of manifests is out of scope)
  export const MANIFEST_KEY_PREFIX = "manifest:"

  export const Position = z
    .object({
      subjectKey: z.string().min(1).max(SUBJECT_KEY_MAX),
      size: z.number().positive().finite(), // the user's own units; NO USD conversion (valuation is parked)
      units: z.string().min(1).max(UNITS_MAX),
      assumptions: z.string().max(ASSUMPTIONS_MAX).optional(),
    })
    .strict()

  export const ExitCriterion = z
    .object({
      kind: z.enum(EXIT_KINDS),
      threshold: z.number().finite(),
      subjectScope: z.string().min(1).max(SCOPE_MAX), // a subjectKey or "portfolio"
    })
    .strict()

  export const Journal = z
    .object({
      priorIntent: z.string().max(JOURNAL_FIELD_MAX).optional(),
      decisionAfter: z.string().max(JOURNAL_FIELD_MAX).optional(),
      changedByCompile: z.boolean().optional(),
    })
    .strict()

  export const Schema = z
    .object({
      schemaVersion: z.literal(SCHEMA_VERSION),
      positions: z.array(Position).min(1).max(POSITIONS_MAX),
      thesis: z.string().min(1).max(THESIS_MAX),
      exitCriterion: ExitCriterion,
      journal: Journal.optional(),
    })
    .strict()

  export type Position = z.infer<typeof Position>
  export type ExitCriterion = z.infer<typeof ExitCriterion>
  export type Journal = z.infer<typeof Journal>
  export type T = z.infer<typeof Schema>

  export type ParseResult = { ok: true; manifest: T } | { ok: false; error: string }

  // map the first zod issue to a plain, one-sentence refusal that NAMES the field + why. Every refusal ends with the same
  // reassurance the console gives before registration: nothing was registered, nothing was scored.
  function refusalSentence(issue: z.ZodIssue): string {
    const where = issue.path.length ? `\`${issue.path.join(".")}\`` : "the manifest"
    const tail = "Refused before registration. Nothing was registered."
    if (issue.code === "unrecognized_keys") return `The manifest carried unknown field${(issue as z.ZodIssue & { keys: string[] }).keys.length > 1 ? "s" : ""} ${(issue as z.ZodIssue & { keys: string[] }).keys.map((k) => `\`${k}\``).join(", ")} — the schema is strict (an unknown key is a mistake, never silently dropped). ${tail}`
    if (issue.code === "too_big") return `${where} is too large (max ${(issue as z.ZodIssue & { maximum: number }).maximum}) — a manifest is a decision journal, not a book. ${tail}`
    if (issue.code === "too_small") return `${where} is missing or empty — a strategy needs at least one position, a thesis, and an exit criterion. ${tail}`
    // the exit kind is the schema's only enum — a bad value is an unevaluable kind (path-based so it is robust across zod
    // versions, which name the enum-failure code differently: v3 `invalid_enum_value`, v4 `invalid_value`).
    if (issue.path[issue.path.length - 1] === "kind") {
      return `${where} is not an evaluable exit kind (allowed: ${EXIT_KINDS.join(", ")}) — an exit criterion must be evaluable over facts the engine already captures. ${tail}`
    }
    if (issue.code === "invalid_type") return `${where} has the wrong type (expected ${(issue as z.ZodIssue & { expected: string }).expected}). ${tail}`
    if (issue.code === "invalid_literal") return `${where} must be schemaVersion ${SCHEMA_VERSION} (this build speaks manifest schema v${SCHEMA_VERSION}). ${tail}`
    return `The manifest is not valid at ${where}: ${issue.message}. ${tail}`
  }

  // PARSE — shape + strictness + caps. Subject EXISTENCE (a subjectKey the engine does not know) is a separate check
  // (`validateSubjects`) because it needs a resolver; the compile path runs both. A non-object / non-JSON input is refused.
  export function parse(json: unknown): ParseResult {
    if (json === null || typeof json !== "object" || Array.isArray(json)) {
      return { ok: false, error: "The manifest must be a JSON object with positions, a thesis, and an exit criterion. Refused before registration. Nothing was registered." }
    }
    const r = Schema.safeParse(json)
    if (!r.success) return { ok: false, error: refusalSentence(r.error.issues[0]) }
    // no recursion — a position that names another manifest is refused this sprint (a manifest of manifests is out of scope)
    const recursive = r.data.positions.find((p) => p.subjectKey.startsWith(MANIFEST_KEY_PREFIX))
    if (recursive) return { ok: false, error: `Position \`${recursive.subjectKey}\` references another manifest — a manifest of manifests is out of scope this sprint (no recursion). Refused before registration. Nothing was registered.` }
    return { ok: true, manifest: r.data }
  }

  // SUBJECT EXISTENCE — every position's subjectKey must be a subject the engine can reach (curated or lookup). The
  // resolver is injected (the compile path passes the real one); an unknown key is refused with a sentence NAMING the key.
  export function validateSubjects(m: T, isKnown: (subjectKey: string) => boolean): ParseResult {
    const unknown = m.positions.find((p) => !isKnown(p.subjectKey))
    if (unknown) return { ok: false, error: `Position \`${unknown.subjectKey}\` names a subject the engine does not know (not curated, not resolvable by lookup) — a strategy can only hold subjects the engine can check. Refused before registration. Nothing was registered.` }
    return { ok: true, manifest: m }
  }
}
