/**
 * ORGΛNON STUDIO — the SCOPE LAW (Ensemble Phase 0; Rule K-SCOPE). V12 shipped the Guided Builder LENDING-ONLY against a
 * three-domain blueprint scope — silently. That is the quiet-narrowing class: a delivery narrower than what the blueprint
 * promised, with no note. One sprint earlier its domain-shaped cousin (a data domain quietly renegotiated) earned a
 * tombstone under E-ATTEMPT; K-SCOPE extends that discipline from DATA DOMAINS to FEATURES. The narrowing itself is never
 * the sin — shipping a walking skeleton is honorable; the SILENCE about it is the violation. So a delivery narrower than
 * its blueprint scope files an AMENDMENT value in the SAME phase: what was promised, what shipped, why, and the cure (the
 * phase that widens it — or an explicit permanent narrowing with its reason). Append-only, hash-chained, tamper-evident.
 *
 * The founding instance, retro-filed here: the V12 builder's lending-only delivery (cure: V13 Phase 2 completes it to the
 * ratified three domains). The frozen seven are never touched; this is governance, added around.
 */
import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"

export namespace Scope {
  export interface Amendment {
    seq: number
    feature: string // the feature delivered narrower than scope (e.g. "guided-builder")
    blueprintScope: string // what the blueprint promised (e.g. "three domains: lending · funding · basis")
    deliveredScope: string // what actually shipped (narrower — e.g. "lending only")
    reason: string // WHY the narrowing (the honest account — a walking skeleton, a time bound, a dependency)
    ownerPhase: string // the phase filing this — MUST be the phase of the narrowing (or a dated retro-file)
    cure: string | null // the phase that widens it to full scope; null ONLY for an explicit permanent narrowing (with reason)
    retroFiled: boolean // true when filed after the fact (the V12 debt) — never by editing history, always appended
    stamp: string
    prev: string
    hash: string
  }

  export class ScopeError extends Error {}
  export const GENESIS = "0".repeat(64)
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  function stable(v: unknown): string {
    if (v === null || typeof v !== "object") return JSON.stringify(v)
    if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`
    const k = Object.keys(v as Record<string, unknown>).sort()
    return `{${k.map((x) => `${JSON.stringify(x)}:${stable((v as Record<string, unknown>)[x])}`).join(",")}}`
  }

  // the law as a predicate: a scope amendment is LEGAL iff it names what was promised, what shipped, why, and its owner
  // phase — a narrowing missing any of these is the silent-narrowing violation K-SCOPE retires.
  export function validate(input: Pick<Amendment, "feature" | "blueprintScope" | "deliveredScope" | "reason" | "ownerPhase">): { ok: boolean; reason: string } {
    if (!input.feature.trim()) return { ok: false, reason: "a scope amendment REQUIRES the feature it narrows (K-SCOPE)" }
    if (!input.blueprintScope.trim()) return { ok: false, reason: "a scope amendment REQUIRES the blueprint scope it fell short of (what was promised)" }
    if (!input.deliveredScope.trim()) return { ok: false, reason: "a scope amendment REQUIRES the delivered scope (what actually shipped, narrower)" }
    if (!input.reason.trim()) return { ok: false, reason: "a scope amendment REQUIRES its reason — the narrowing is honorable, the SILENCE is the violation (K-SCOPE)" }
    if (!input.ownerPhase.trim()) return { ok: false, reason: "a scope amendment REQUIRES its owner phase (the phase of the narrowing, or a dated retro-file)" }
    return { ok: true, reason: "scope amendment — promised, shipped, why, and owner all named (K-SCOPE)" }
  }

  export class Ledger {
    private entries: Amendment[] = []
    private nextPrev(): string {
      return this.entries.length === 0 ? GENESIS : this.entries[this.entries.length - 1].hash
    }
    record(input: { feature: string; blueprintScope: string; deliveredScope: string; reason: string; ownerPhase: string; cure?: string | null; retroFiled?: boolean; stamp: string }): Amendment {
      const v = validate(input)
      if (!v.ok) throw new ScopeError(`scope amendment REFUSED for "${input.feature}": ${v.reason}`)
      const seq = this.entries.length
      const prev = this.nextPrev()
      const payload = { seq, feature: input.feature, blueprintScope: input.blueprintScope, deliveredScope: input.deliveredScope, reason: input.reason, ownerPhase: input.ownerPhase, cure: input.cure ?? null, retroFiled: input.retroFiled ?? false, stamp: input.stamp }
      const hash = sha256(`${prev}|${stable(payload)}`)
      const e: Amendment = { ...payload, prev, hash }
      this.entries.push(e)
      return e
    }
    all(): readonly Amendment[] {
      return this.entries
    }
    verifyChain(): { ok: boolean; brokenAt: number | null } {
      let prev = GENESIS
      for (const e of this.entries) {
        if (e.prev !== prev) return { ok: false, brokenAt: e.seq }
        const payload = { seq: e.seq, feature: e.feature, blueprintScope: e.blueprintScope, deliveredScope: e.deliveredScope, reason: e.reason, ownerPhase: e.ownerPhase, cure: e.cure, retroFiled: e.retroFiled, stamp: e.stamp }
        if (sha256(`${prev}|${stable(payload)}`) !== e.hash) return { ok: false, brokenAt: e.seq }
        prev = e.hash
      }
      return { ok: true, brokenAt: null }
    }
    toJSON(): { protocol: "scope-amendments"; rule: "K-SCOPE"; chainOk: boolean; entries: Amendment[] } {
      return { protocol: "scope-amendments", rule: "K-SCOPE", chainOk: this.verifyChain().ok, entries: [...this.entries] }
    }
  }

  // load + re-verify a persisted amendment ledger (a hand-edit fails the rebuilt-hash check)
  export function load(absPath: string): { entries: Amendment[]; chainOk: boolean } {
    if (!existsSync(absPath)) throw new ScopeError(`scope-amendments table absent: ${absPath}`)
    const parsed = JSON.parse(readFileSync(absPath, "utf8")) as { entries: Amendment[] }
    const led = new Ledger()
    for (const e of parsed.entries) led.record({ feature: e.feature, blueprintScope: e.blueprintScope, deliveredScope: e.deliveredScope, reason: e.reason, ownerPhase: e.ownerPhase, cure: e.cure, retroFiled: e.retroFiled, stamp: e.stamp })
    const rebuilt = led.all()
    for (let i = 0; i < rebuilt.length; i++) if (rebuilt[i].hash !== parsed.entries[i].hash) throw new ScopeError(`scope amendment #${i} ("${parsed.entries[i].feature}") hash mismatch — the table was edited after filing (K-SCOPE)`)
    return { entries: [...rebuilt], chainOk: led.verifyChain().ok }
  }

  // an amendment whose cure phase has passed but whose feature is still narrow would be a standing debt; the cure being
  // named is the promise. This helper reports amendments still awaiting their cure (none permanent-without-reason).
  export function openAmendments(entries: readonly Amendment[]): Amendment[] {
    return entries.filter((e) => e.cure !== null)
  }

  // ── THE K-SCOPE PARITY EXTENSION (Explanation Phase 0) ──
  // V13 shipped the pool composer + funding builder adjudicating ILLUSTRATIVE series while REAL captured T1 funding data
  // had existed since V10 — a DATA-REALITY narrowing the feature-scope law (which watched blueprint-vs-delivered breadth)
  // did not catch. The parity extension: a schema adjudicating ILLUSTRATIVE where the REAL data exists is itself a
  // narrowing (delivered reality ⊊ available reality) requiring an amendment — the same "the silence is the sin" logic,
  // applied to data provenance rather than feature breadth. This predicate decides whether an amendment is owed.
  export function parityRequired(input: { realDataExists: boolean; adjudicates: "REAL-PIT" | "ILLUSTRATIVE" | "BLOCKED" }): boolean {
    return input.realDataExists && input.adjudicates === "ILLUSTRATIVE"
  }
  // build the amendment INPUT for a data-reality parity narrowing (filed through the same append-only Ledger — no schema
  // churn; the parity semantics live in the blueprint/delivered scope wording). `realDescription` names the real data
  // that existed; `cure` is the phase that wires it.
  export function parityAmendmentInput(input: { feature: string; realDescription: string; illustrativeDescription: string; ownerPhase: string; cure: string; retroFiled?: boolean }): Pick<Amendment, "feature" | "blueprintScope" | "deliveredScope" | "reason" | "ownerPhase"> & { cure: string; retroFiled: boolean } {
    return {
      feature: input.feature,
      blueprintScope: `adjudicate the REAL data that exists: ${input.realDescription}`,
      deliveredScope: `adjudicates ILLUSTRATIVE: ${input.illustrativeDescription}`,
      reason: `data-reality PARITY narrowing (K-SCOPE parity extension): the real data existed but the surface wired illustrative — a schema adjudicating ILLUSTRATIVE where REAL exists is a narrowing (delivered reality ⊊ available reality); the narrowing is honorable, the SILENCE is the violation`,
      ownerPhase: input.ownerPhase,
      cure: input.cure,
      retroFiled: input.retroFiled ?? false,
    }
  }
}
