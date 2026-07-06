/**
 * ORGΛNON STUDIO — the LEDGER-POLLUTION AUDITOR (Transplant Phase 0; Rule T-POLLUTION).
 *
 * W1-04 (the walk's Cycle-1 red-team finding) proved that, before its fix, an invalid spec could reach adjudication at
 * the wire — so garbage COULD have entered a ledger. Before the ledgers move house, their PAST must answer. This module
 * re-validates every historical entry against the CURRENT schema and reports per-entry findings. It NEVER mutates a
 * ledger: an invalid entry is quarantined by an APPENDED annotation (id, reason, discovered-by) written to a separate
 * sidecar — deletion or rewriting is the anti-pattern (append-only extends to the ledgers themselves). Counts are
 * recomputed with the exclusions and published before/after.
 *
 * The trial ledgers store only the spec HASH, not the spec — so a spec's schema is re-validated only where the spec is
 * RECOVERABLE from a paired artifact (the live-run artifacts carry the actual specs). Where it is not recoverable the
 * entry is validated structurally + on the chain, and the spec-schema re-validation is honestly reported N/A, never
 * asserted clean. Chain recomputation here MIRRORS `Ledger.Store` byte-for-byte; `test/organon/ledger_pollution.test.ts`
 * pins that agreement so the two cannot silently drift, and supplies the positive control (a seeded invalid entry).
 */
import { createHash } from "node:crypto"
import { StudioSurfaces } from "./surfaces"

export namespace Pollution {
  export type LedgerClass = "trial" | "enrollment" | "clock-stamp" | "walk" | "unknown"

  // mirror of Ledger's canonical serialization (stable key order) — pinned equal by the wall.
  function stableStringify(v: unknown): string {
    if (v === null || typeof v !== "object") return JSON.stringify(v)
    if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`
    const keys = Object.keys(v as Record<string, unknown>).sort()
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify((v as Record<string, unknown>)[k])}`).join(",")}}`
  }
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  const isHex64 = (s: unknown): s is string => typeof s === "string" && /^[0-9a-f]{64}$/.test(s)
  const GENESIS = "0".repeat(64)

  // Recompute a trial entry's chain hash exactly as Ledger.Store.register does (prev|stableStringify(payload)).
  export function recomputeTrialHash(e: Record<string, unknown>): string {
    const payload = { seq: e.seq, specHash: e.specHash, sig: e.sig, authorClass: e.authorClass, authorId: e.authorId, domain: e.domain, parentSeq: e.parentSeq, timestamp: e.timestamp }
    return sha256(`${e.prev}|${stableStringify(payload)}`)
  }

  export interface EntryFinding {
    seq: number | string
    ok: boolean
    reasons: string[] // empty iff ok
    specRecovered: boolean
    specSchemaValid: boolean | null // null = spec not recoverable → schema re-validation N/A (disclosed, not asserted)
  }

  // Validate ONE trial-ledger entry against the current schema: structure, chain link, lineage, and (where the spec is
  // recoverable) the current SubmitSpec — the SAME validator the wire uses (StudioSurfaces.validateSpec), so the audit
  // and the live boundary agree by construction. `prevHash` is the previous entry's hash (GENESIS for seq 0).
  export function auditTrialEntry(e: Record<string, unknown>, prevHash: string, recovery: Map<string, unknown>): EntryFinding {
    const reasons: string[] = []
    // (1) structure
    if (typeof e.seq !== "number") reasons.push("seq missing/non-numeric")
    if (!isHex64(e.specHash)) reasons.push("specHash not 64-hex")
    if (!isHex64(e.sig)) reasons.push("sig not 64-hex")
    if (!["human", "agent", "template", "external"].includes(e.authorClass as string)) reasons.push(`authorClass invalid (${e.authorClass})`)
    if (typeof e.authorId !== "string" || !e.authorId) reasons.push("authorId missing")
    if (typeof e.domain !== "string" || !e.domain) reasons.push("domain missing")
    if (!(e.parentSeq === null || typeof e.parentSeq === "number")) reasons.push("parentSeq not number|null")
    if (typeof e.timestamp !== "number") reasons.push("timestamp missing/non-numeric")
    if (!isHex64(e.hash)) reasons.push("hash not 64-hex")
    // (2) lineage — a parent must be an EARLIER entry
    if (typeof e.parentSeq === "number" && typeof e.seq === "number" && (e.parentSeq < 0 || e.parentSeq >= e.seq)) reasons.push(`parentSeq=${e.parentSeq} does not precede seq=${e.seq} (forward/self lineage)`)
    // (3) chain link
    if (e.prev !== prevHash) reasons.push(`prev ${String(e.prev).slice(0, 12)}… ≠ expected ${prevHash.slice(0, 12)}… (chain break/reorder)`)
    if (reasons.length === 0 || isHex64(e.hash)) {
      const want = recomputeTrialHash(e)
      if (want !== e.hash) reasons.push(`hash recompute ${want.slice(0, 12)}… ≠ stored ${String(e.hash).slice(0, 12)}… (row tampered)`)
    }
    // (4) spec-schema (only where recoverable)
    const spec = isHex64(e.specHash) ? recovery.get(e.specHash as string) : undefined
    let specSchemaValid: boolean | null = null
    if (spec !== undefined) {
      try {
        StudioSurfaces.validateSpec(spec)
        specSchemaValid = true
        // the recovered spec's hash MUST equal the registered specHash (else the artifact and ledger disagree)
        if (Ledger_hashSpec(spec) !== e.specHash) { reasons.push("recovered spec hash ≠ registered specHash (artifact/ledger mismatch)"); specSchemaValid = false }
      } catch (err) {
        specSchemaValid = false
        reasons.push(`spec fails current schema: ${(err as Error).message}`)
      }
    }
    return { seq: (e.seq as number) ?? "?", ok: reasons.length === 0, reasons, specRecovered: spec !== undefined, specSchemaValid }
  }

  // local hashSpec (avoids an import cycle with ledger.ts); identical canonical serialization.
  function Ledger_hashSpec(spec: unknown): string {
    return sha256(stableStringify(spec))
  }

  export interface LedgerAudit {
    ledger: string
    cls: LedgerClass
    entryCount: number
    findings: EntryFinding[]
    invalidSeqs: (number | string)[]
    chainOk: boolean
  }

  // Audit a trial ledger from its JSONL + a recovery map (specHash → spec). Never throws on a bad line — a parse
  // failure is itself a finding (a corrupt row is exactly what the audit must surface).
  export function auditTrialLedger(name: string, jsonl: string, recovery: Map<string, unknown>): LedgerAudit {
    const lines = jsonl.split("\n").map((l) => l.trim()).filter(Boolean)
    const findings: EntryFinding[] = []
    let prev = GENESIS
    let chainOk = true
    for (let i = 0; i < lines.length; i++) {
      let e: Record<string, unknown>
      try {
        e = JSON.parse(lines[i]) as Record<string, unknown>
      } catch {
        findings.push({ seq: i, ok: false, reasons: ["line is not valid JSON (corrupt row)"], specRecovered: false, specSchemaValid: null })
        chainOk = false
        continue
      }
      const f = auditTrialEntry(e, prev, recovery)
      findings.push(f)
      if (!f.ok) chainOk = false
      if (isHex64(e.hash)) prev = e.hash as string
    }
    const invalidSeqs = findings.filter((f) => !f.ok).map((f) => f.seq)
    return { ledger: name, cls: "trial", entryCount: lines.length, findings, invalidSeqs, chainOk: chainOk && invalidSeqs.length === 0 }
  }

  // Structural + prev-linkage audit for a NON-trial chained ledger (walk / clock-stamp). We validate the link field
  // (`prev`/`prevSha` → previous `hash`/`selfSha`) and that the entry parses — a lighter but honest check for ledgers
  // whose payload-hash function lives elsewhere; the spec-schema concern (W1-04) does not apply to these classes.
  // `groupField` (e.g. "domain") makes the chaining group-aware: clock-stamps are PER-DOMAIN chains, each starting at
  // GENESIS — validating them as one linear chain would false-flag every domain switch (an auditor bug, not pollution).
  export function auditChainedLedger(name: string, jsonl: string, cls: LedgerClass, linkField: string, selfField: string, groupField?: string): LedgerAudit {
    const lines = jsonl.split("\n").map((l) => l.trim()).filter(Boolean)
    const findings: EntryFinding[] = []
    const prevByGroup = new Map<string, string>() // group → last selfSha (GENESIS at first sight)
    let chainOk = true
    for (let i = 0; i < lines.length; i++) {
      const reasons: string[] = []
      let e: Record<string, unknown>
      try {
        e = JSON.parse(lines[i]) as Record<string, unknown>
      } catch {
        findings.push({ seq: i, ok: false, reasons: ["line is not valid JSON (corrupt row)"], specRecovered: false, specSchemaValid: null })
        chainOk = false
        continue
      }
      const group = groupField ? String(e[groupField]) : "__all__"
      const prev = prevByGroup.get(group) ?? GENESIS
      if (!isHex64(e[selfField])) reasons.push(`${selfField} not 64-hex`)
      if (e[linkField] !== prev) reasons.push(`${linkField} ${String(e[linkField]).slice(0, 12)}… ≠ expected ${prev.slice(0, 12)}…${groupField ? ` (group ${group})` : ""} (chain break)`)
      findings.push({ seq: (e.seq as number) ?? i, ok: reasons.length === 0, reasons, specRecovered: false, specSchemaValid: null })
      if (reasons.length) chainOk = false
      if (isHex64(e[selfField])) prevByGroup.set(group, e[selfField] as string)
    }
    const invalidSeqs = findings.filter((f) => !f.ok).map((f) => f.seq)
    return { ledger: name, cls, entryCount: lines.length, findings, invalidSeqs, chainOk: chainOk && invalidSeqs.length === 0 }
  }

  // Recompute family sizes (distinct specHash per lineage root) from the SURVIVING (non-quarantined) trial entries.
  // Used for the before/after count table when an entry is quarantined out.
  export interface CountReport { entries: number; roots: number; distinctSpecs: number }
  export function counts(entries: Record<string, unknown>[]): CountReport {
    const roots = new Set<string>()
    const specs = new Set<string>()
    for (const e of entries) {
      specs.add(e.specHash as string)
      if (e.parentSeq === null) roots.add(`${e.authorId} ${e.domain}`)
    }
    return { entries: entries.length, roots: roots.size, distinctSpecs: specs.size }
  }

  export interface Quarantine {
    protocol: "ledger-quarantine"
    ledger: string
    seq: number | string
    reason: string
    discoveredBy: string
    at: string // caller-supplied deterministic label (never Date.now() here)
  }
}
