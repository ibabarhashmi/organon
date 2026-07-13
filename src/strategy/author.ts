/**
 * ORGΛNON — THE CADENCE SPRINT (X-AUTHOR; the DOOR's refusal surface, S78). THE DOOR REFUSES, NEVER COERCES. `Author.parse`
 * turns a server-rendered form's flat body into a Manifest — or a one-sentence REFUSAL naming the field + why. It is a THIN,
 * HONEST SHELL over the EXISTING `.strict()` zod schema (manifest.ts): the schema IS the validator; the shell only re-shapes
 * flat form fields into the manifest object and hands them over. It NEVER coerces:
 *   · it invents NO value — a missing size / thesis / exit threshold is REFUSED by the schema, never defaulted;
 *   · it suggests NOTHING — no pre-filled thesis, no proposed threshold, no ranked position, no "most users choose" (the
 *     ESMA ¶61 implicit-recommendation shape is banned BY CONSTRUCTION — the DOOR authors nothing);
 *   · a position row with a size/units but NO subject is a malformed attempt → REFUSED (never silently dropped).
 * Pure; no I/O; no model. The registration + storage is the caller's (store.ts); this only PARSES + REFUSES.
 */
import { Manifest } from "./manifest"

export namespace Author {
  export const MAX_ROWS = 12 // the form renders a bounded number of position rows; an empty row is not a position

  export type Body = Record<string, string | undefined>

  const s = (v: string | undefined): string => (v ?? "").trim()
  const has = (v: string | undefined): boolean => s(v).length > 0

  // a number field the user typed → a number, WITHOUT inventing a value: an empty field stays undefined (the schema then
  // refuses a required field); a non-numeric field becomes NaN (the schema refuses "expected number"). No default is applied.
  function num(v: string | undefined): number | undefined {
    if (!has(v)) return undefined
    return Number(s(v))
  }

  // PARSE — flat form body → Manifest | Refusal. Field names (server-rendered, stable): `thesis`, `exit_kind`,
  // `exit_threshold`, `exit_scope`, `journal_priorIntent`?, and per-row `pos{i}_subjectKey`/`_size`/`_units`/`_assumptions`.
  export function parse(body: Body, maxRows: number = MAX_ROWS): Manifest.ParseResult {
    const tail = "Refused before registration. Nothing was registered."
    const positions: Record<string, unknown>[] = []
    for (let i = 0; i < maxRows; i++) {
      const subjectKey = body[`pos${i}_subjectKey`]
      const size = body[`pos${i}_size`]
      const units = body[`pos${i}_units`]
      const assumptions = body[`pos${i}_assumptions`]
      const anyFilled = has(subjectKey) || has(size) || has(units) || has(assumptions)
      if (!anyFilled) continue // a fully-empty row is not a position (never a coerced blank position)
      if (!has(subjectKey)) return { ok: false, error: `A position row carries a size/units but no subject — a position must name a subject the engine knows. ${tail}` }
      const p: Record<string, unknown> = { subjectKey: s(subjectKey), size: num(size), units: has(units) ? s(units) : undefined }
      if (has(assumptions)) p.assumptions = s(assumptions)
      positions.push(p)
    }
    // build the manifest object EXACTLY as the schema expects — no invented fields, no defaults on judgment-bearing fields.
    const exit: Record<string, unknown> = { kind: has(body.exit_kind) ? s(body.exit_kind) : undefined, threshold: num(body.exit_threshold), subjectScope: has(body.exit_scope) ? s(body.exit_scope) : undefined }
    const obj: Record<string, unknown> = { schemaVersion: Manifest.SCHEMA_VERSION, positions, thesis: has(body.thesis) ? s(body.thesis) : undefined, exitCriterion: exit }
    if (has(body.journal_priorIntent)) obj.journal = { priorIntent: s(body.journal_priorIntent) }
    // the schema is the refusal surface — an empty positions list, a missing thesis, an unevaluable exit kind, an over-length
    // field, an unknown key are each refused with a sentence NAMING the field (never a crash, never a silent default).
    return Manifest.parse(obj)
  }
}
