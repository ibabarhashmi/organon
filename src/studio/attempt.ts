/**
 * ORGΛNON STUDIO — the ATTEMPT LAW (End-User Phase 0; Rule E-ATTEMPT, V9 finding 2 made mechanical). V9's scope
 * contract said funding + fee-yield were ATTEMPT and delivered "not attempted" — a renegotiation that never went
 * through an amendment. This module makes that class extinct: the scope-contract vocabulary gains
 * ATTEMPT/DELIVERED/DEFER/BLOCKED-with-evidence, held as an append-only, hash-chained ledger, and REFUSES:
 *   · a BLOCKED-with-evidence disposition without complete attempt evidence (steps, artifacts, exact failure, unblock)
 *     AND a second, differently-shaped attempt (A′#2 — one lazy failure is a choice, not a fact);
 *   · an ATTEMPT → DEFER conversion without a recorded amendment (silence is the exact sin being retired);
 *   · a DELIVERED disposition without a differential reference (a delivery without its proof is a Halt, D-DIFF).
 * V9's renegotiation is retro-filed here as a dated, append-only VALUE (the amendment that should have existed, filed
 * now) — never by editing history. A BLOCKED without evidence is an OPEN ISSUE, reviewed like a park.
 */
import { createHash } from "node:crypto"
import { existsSync, readFileSync, appendFileSync, writeFileSync } from "node:fs"

export namespace Attempt {
  // what the scope contract DECLARED for a domain up front
  export type Declaration = "DELIVER" | "ATTEMPT" | "BLOCKED-on-credential"
  // what actually happened — the disposition, resolved to exactly one terminal
  export type Disposition = "DELIVERED" | "BLOCKED-with-evidence" | "DEFER" | "BLOCKED-on-credential"

  export interface AttemptEvidence {
    steps: string[] // what was tried, in order
    artifacts: string[] // the produced artifacts (paths / hashes) — a real attempt leaves a trail
    exactFailure: string // the precise failure (an error string, a missing endpoint, an env gap)
    unblock: string // the one-line unblock
    // A′#2: one honest failure is a fact; one lazy failure is a choice. A BLOCKED demands a SECOND, differently-shaped
    // attempt (a different endpoint, a different reconstruction route) before its evidence is accepted.
    secondAttempt: { route: string; exactFailure: string } | null
  }

  export interface Amendment {
    reason: string
    from: Declaration // must be "ATTEMPT" for a legitimate → DEFER
    to: "DEFER"
  }

  export interface Entry {
    seq: number
    domain: string
    declared: Declaration
    disposition: Disposition
    deliveredDifferential: string | null // a differential evidence ref — REQUIRED for DELIVERED (D-DIFF)
    evidence: AttemptEvidence | null // REQUIRED for BLOCKED-with-evidence
    amendment: Amendment | null // REQUIRED for an ATTEMPT → DEFER
    note: string
    stamp: string // a caller-supplied deterministic label (never Date.now — Rule VIII)
    prev: string
    hash: string
  }

  export class LawError extends Error {}
  export const GENESIS = "0".repeat(64)
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  function stable(v: unknown): string {
    if (v === null || typeof v !== "object") return JSON.stringify(v)
    if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`
    const k = Object.keys(v as Record<string, unknown>).sort()
    return `{${k.map((x) => `${JSON.stringify(x)}:${stable((v as Record<string, unknown>)[x])}`).join(",")}}`
  }

  // The law, as a pure predicate — a disposition is LEGAL iff its required evidence is present. This is the mechanism
  // that makes the V9 renegotiation impossible without a legible record; the ledger below refuses to append an illegal one.
  export function validate(input: Pick<Entry, "domain" | "declared" | "disposition" | "deliveredDifferential" | "evidence" | "amendment">): { ok: boolean; reason: string } {
    const { declared, disposition, deliveredDifferential, evidence, amendment } = input
    if (disposition === "DELIVERED") {
      if (!deliveredDifferential) return { ok: false, reason: "DELIVERED requires a differential reference — a delivery without its proof is a Halt (D-DIFF)" }
      return { ok: true, reason: "DELIVERED with a differential reference" }
    }
    if (disposition === "BLOCKED-with-evidence") {
      if (!evidence) return { ok: false, reason: "BLOCKED-with-evidence requires attempt evidence — a BLOCKED without evidence is an OPEN issue (E-ATTEMPT)" }
      if (!evidence.steps.length) return { ok: false, reason: "attempt evidence: at least one step of what was tried is required (a token attempt is theater, A′#2)" }
      if (!evidence.artifacts.length) return { ok: false, reason: "attempt evidence: at least one produced artifact is required (a real attempt leaves a trail)" }
      if (!evidence.exactFailure.trim()) return { ok: false, reason: "attempt evidence: the exact failure is required (not 'it didn't work')" }
      if (!evidence.unblock.trim()) return { ok: false, reason: "attempt evidence: the one-line unblock is required" }
      if (!evidence.secondAttempt || !evidence.secondAttempt.exactFailure.trim()) return { ok: false, reason: "attempt evidence: a SECOND, differently-shaped attempt is required before a BLOCKED is accepted (A′#2 — one lazy failure is a choice)" }
      return { ok: true, reason: "BLOCKED with complete, second-attempted evidence — reviewable like a park" }
    }
    if (disposition === "DEFER") {
      if (declared !== "ATTEMPT") return { ok: false, reason: `DEFER is only reachable from a declared ATTEMPT (declared=${declared})` }
      if (!amendment || !amendment.reason.trim() || amendment.from !== "ATTEMPT" || amendment.to !== "DEFER") return { ok: false, reason: "an ATTEMPT → DEFER conversion REQUIRES a recorded amendment (a stated reason) — silence is the exact V9 sin retired (E-ATTEMPT)" }
      return { ok: true, reason: "DEFER via a recorded gatekeeper amendment (legible, not silent)" }
    }
    if (disposition === "BLOCKED-on-credential") {
      // a pre-declared credential block (RWA) — honest, the two-way door; no attempt evidence demanded (there is no
      // credential-free route by construction), but the unblock must be named.
      if (declared !== "BLOCKED-on-credential") return { ok: false, reason: "BLOCKED-on-credential must have been declared as such up front (D-TWOWAY)" }
      return { ok: true, reason: "BLOCKED-on-credential — pre-declared, the two-way door open" }
    }
    return { ok: false, reason: `unknown disposition ${disposition}` }
  }

  // The append-only, hash-chained scope-contract ledger. Constructing over a file re-verifies the chain (a tamper or a
  // re-point throws), exactly like the trial ledger and the capture chain. An illegal disposition is refused at append.
  export class Ledger {
    private entries: Entry[] = []
    constructor(private file?: string) {
      if (file && existsSync(file)) {
        const lines = readFileSync(file, "utf8").split("\n").filter(Boolean)
        for (const line of lines) this.push(JSON.parse(line) as Entry, /*fromDisk*/ true)
      }
    }

    private push(e: Entry, fromDisk: boolean): void {
      const prev = this.entries.length === 0 ? GENESIS : this.entries[this.entries.length - 1].hash
      if (e.prev !== prev) throw new LawError(`scope-contract chain broken at seq ${e.seq}: prev ${e.prev.slice(0, 12)}… ≠ ${prev.slice(0, 12)}…`)
      const payload = { seq: e.seq, domain: e.domain, declared: e.declared, disposition: e.disposition, deliveredDifferential: e.deliveredDifferential, evidence: e.evidence, amendment: e.amendment, note: e.note, stamp: e.stamp }
      const hash = sha256(`${prev}|${stable(payload)}`)
      if (fromDisk && hash !== e.hash) throw new LawError(`scope-contract entry ${e.seq} self-hash mismatch (tampered)`)
      this.entries.push(e)
    }

    record(input: { domain: string; declared: Declaration; disposition: Disposition; deliveredDifferential?: string | null; evidence?: AttemptEvidence | null; amendment?: Amendment | null; note?: string; stamp: string }): Entry {
      const partial = {
        domain: input.domain,
        declared: input.declared,
        disposition: input.disposition,
        deliveredDifferential: input.deliveredDifferential ?? null,
        evidence: input.evidence ?? null,
        amendment: input.amendment ?? null,
      }
      const v = validate(partial)
      if (!v.ok) throw new LawError(`scope-contract disposition REFUSED for ${input.domain}: ${v.reason}`)
      const seq = this.entries.length
      const prev = seq === 0 ? GENESIS : this.entries[seq - 1].hash
      const payload = { seq, domain: input.domain, declared: input.declared, disposition: input.disposition, deliveredDifferential: partial.deliveredDifferential, evidence: partial.evidence, amendment: partial.amendment, note: input.note ?? "", stamp: input.stamp }
      const hash = sha256(`${prev}|${stable(payload)}`)
      const e: Entry = { ...payload, prev, hash }
      this.entries.push(e)
      if (this.file) appendFileSync(this.file, JSON.stringify(e) + "\n")
      return e
    }

    all(): readonly Entry[] {
      return this.entries
    }

    verifyChain(): { ok: boolean; brokenAt: number | null } {
      let prev = GENESIS
      for (const e of this.entries) {
        if (e.prev !== prev) return { ok: false, brokenAt: e.seq }
        const payload = { seq: e.seq, domain: e.domain, declared: e.declared, disposition: e.disposition, deliveredDifferential: e.deliveredDifferential, evidence: e.evidence, amendment: e.amendment, note: e.note, stamp: e.stamp }
        if (sha256(`${prev}|${stable(payload)}`) !== e.hash) return { ok: false, brokenAt: e.seq }
        prev = e.hash
      }
      return { ok: true, brokenAt: null }
    }

    // an OPEN issue is a BLOCKED disposition whose evidence is incomplete — but the ledger REFUSES to append one, so a
    // committed ledger is open-free by construction. This surfaces the property for the checkpoint/wall to assert.
    openIssues(): { domain: string; reason: string }[] {
      const open: { domain: string; reason: string }[] = []
      for (const e of this.entries) {
        const v = validate(e)
        if (!v.ok) open.push({ domain: e.domain, reason: v.reason })
      }
      return open
    }

    render(): string {
      return this.entries
        .map((e) => {
          const head = `#${e.seq} ${e.domain}: declared ${e.declared} → ${e.disposition} (${e.stamp}) hash=${e.hash.slice(0, 12)}…`
          const detail = e.disposition === "BLOCKED-with-evidence" && e.evidence
            ? `\n    tried: ${e.evidence.steps.join("; ")}\n    failure: ${e.evidence.exactFailure}\n    2nd attempt (${e.evidence.secondAttempt?.route}): ${e.evidence.secondAttempt?.exactFailure}\n    unblock: ${e.evidence.unblock}`
            : e.amendment ? `\n    amendment: ${e.amendment.reason}` : e.deliveredDifferential ? `\n    differential: ${e.deliveredDifferential}` : ""
          return `${head}${detail}${e.note ? `\n    note: ${e.note}` : ""}`
        })
        .join("\n")
    }
  }

  // Retro-file V9's funding/fee-yield renegotiation as the amendment that should have existed — dated, append-only, a
  // VALUE not an argument (never by editing history). Called by the Phase-0 script to seed the ledger.
  export function retroFileV9(ledger: Ledger): Entry[] {
    const out: Entry[] = []
    out.push(ledger.record({
      domain: "funding (V9 retro-file)",
      declared: "ATTEMPT",
      disposition: "DEFER",
      amendment: { reason: "V9 pre-declared funding as ATTEMPT-else-BLOCKED-on-port but the Binance freepit T1 reconstruction was NOT attempted — 'not attempted' is DEFER, not BLOCKED. The amendment that should have accompanied that renegotiation is filed now, dated, append-only (E-ATTEMPT). V10 Phase 2 makes the genuine attempt.", from: "ATTEMPT", to: "DEFER" },
      note: "retro-filed 2026-07-05 — the V9 scope-contract renegotiation, made legible after the fact per T-SUPERSEDE (history never edited; the correction is appended).",
      stamp: "v10-phase0-retrofile-funding",
    }))
    out.push(ledger.record({
      domain: "fee-yield (V9 retro-file)",
      declared: "ATTEMPT",
      disposition: "DEFER",
      amendment: { reason: "V9 pre-declared fee-yield as ATTEMPT-else-BLOCKED-on-env but the Py3.11/pandas discovery panel was NOT stood up — DEFER, not BLOCKED. Filed now as the missing amendment (E-ATTEMPT). V10 Phase 2 makes the genuine attempt.", from: "ATTEMPT", to: "DEFER" },
      note: "retro-filed 2026-07-05 — companion to the funding retro-file.",
      stamp: "v10-phase0-retrofile-feeyield",
    }))
    return out
  }
}
