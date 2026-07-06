/**
 * ORGΛNON STUDIO — the SUPERSEDE trail (Transplant Phase 0; Rule T-SUPERSEDE).
 *
 * "Immutability of RECORD ≠ immutability of TRUTH." A recorded fact — a checkpoint, a trail entry, an evidence anchor,
 * a floor snapshot — is NEVER re-pointed, re-derived, or edited after it is written. When a new fact corrects an old
 * one, a SUPERSEDING record is APPENDED: it references the superseded record's hash and states the correction. The old
 * record's bytes are left intact; the correction is legible as a diff of appends, never a rewrite of history.
 *
 * The counterexample this rule names: V6 §0.7 re-pointed the checkpoint trail's phase-0 inventory evidence to a "stable
 * bundle" (disclosed, but a re-point — a dangerous machine to leave lying around). `verify()` recomputes every record's
 * hash from its payload, so an in-place edit (a re-point) breaks the chain loudly; a proper superseding append passes.
 * `test/walls/trail_immutability.test.ts` pins both directions with the V6 case as its positive control.
 */
import { createHash } from "node:crypto"

export namespace Supersede {
  export const GENESIS = "0".repeat(64)
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  function stable(v: unknown): string {
    if (v === null || typeof v !== "object") return JSON.stringify(v)
    if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`
    const k = Object.keys(v as Record<string, unknown>).sort()
    return `{${k.map((x) => `${JSON.stringify(x)}:${stable((v as Record<string, unknown>)[x])}`).join(",")}}`
  }

  export interface Record {
    id: string
    payload: unknown // the recorded fact (or, for a supersession, the correction)
    supersedes: string | null // the hash of the record this one corrects (null = an original record)
    prev: string // chain link to the previous record's hash (GENESIS for the first)
    hash: string // sha256(prev|stable({id, payload, supersedes}))
  }

  function link(prev: string, id: string, payload: unknown, supersedes: string | null): string {
    return sha256(`${prev}|${stable({ id, payload, supersedes })}`)
  }

  // Append an ORIGINAL fact (supersedes = null). Returns the new record.
  export function append(log: Record[], id: string, payload: unknown): Record {
    const prev = log.length === 0 ? GENESIS : log[log.length - 1].hash
    const rec: Record = { id, payload, supersedes: null, prev, hash: link(prev, id, payload, null) }
    log.push(rec)
    return rec
  }

  // Append a CORRECTION that supersedes an earlier record (referenced by its hash). The old record is left byte-intact;
  // this is the ONLY legitimate way to change a recorded truth. Throws if the referenced hash is not in the log.
  export function supersede(log: Record[], id: string, supersededHash: string, correction: unknown): Record {
    if (!log.some((r) => r.hash === supersededHash)) throw new Error(`cannot supersede ${supersededHash.slice(0, 12)}… — no such record in the trail (T-SUPERSEDE: a supersession must reference a real prior hash)`)
    const prev = log[log.length - 1].hash
    const rec: Record = { id, payload: correction, supersedes: supersededHash, prev, hash: link(prev, id, correction, supersededHash) }
    log.push(rec)
    return rec
  }

  // Verify the trail: (1) the chain links; (2) EVERY record's hash recomputes from its payload — an in-place edit (a
  // re-point/re-derive of a past record) is caught here, loudly, with the id. This is what makes T-SUPERSEDE mechanical.
  export function verify(log: Record[]): { ok: boolean; brokenAt: string | null; reason: string } {
    let prev = GENESIS
    for (const r of log) {
      if (r.prev !== prev) return { ok: false, brokenAt: r.id, reason: `chain break at "${r.id}": prev ${r.prev.slice(0, 12)}… ≠ expected ${prev.slice(0, 12)}…` }
      const want = link(r.prev, r.id, r.payload, r.supersedes)
      if (want !== r.hash) return { ok: false, brokenAt: r.id, reason: `RE-POINT DETECTED at "${r.id}": payload edited in place (hash ${r.hash.slice(0, 12)}… ≠ recompute ${want.slice(0, 12)}…). Corrections must be APPENDED as a supersession, never edited in.` }
      prev = r.hash
    }
    return { ok: true, brokenAt: null, reason: "trail intact end-to-end; every record immutable, corrections appended" }
  }

  // The effective (current-truth) view: the latest non-superseded payload per id-lineage. A record that has been
  // superseded is marked; the correction that superseded it carries the live truth. History is never lost.
  export interface Resolved { id: string; payload: unknown; supersededBy: string | null; hash: string }
  export function current(log: Record[]): Resolved[] {
    const supersededHashes = new Set(log.map((r) => r.supersedes).filter((h): h is string => h !== null))
    return log.map((r) => ({ id: r.id, payload: r.payload, supersededBy: supersededHashes.has(r.hash) ? (log.find((x) => x.supersedes === r.hash)?.hash ?? null) : null, hash: r.hash }))
  }
}
