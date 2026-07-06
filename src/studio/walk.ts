/**
 * ORGΛNON STUDIO — the WALK LEDGER (Convergence Phase 3; Rules C-USER, C-LOOP, C-PARK). The walk's own physics: every
 * observation is a registered issue in an append-only, hash-chained ledger BEFORE any fixing begins (finding order is
 * evidence; fixing-then-logging is the anti-pattern). Issues carry a severity, a class, a repro, and evidence; they are
 * resolved to fixed / parked (four-fielded) / wontfix, never deleted. Cycle records capture the six arms and the
 * headline = MIN(arms). Convergence is derived from the register, not asserted: two consecutive CLEAN cycles.
 */
import { createHash } from "node:crypto"
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs"

export namespace Walk {
  export type Severity = "S1" | "S2" | "S3" | "S4" // integrity / functional / UX / polish
  export type Cls = "BUG" | "UX" | "INTEGRITY" | "DOC-DRIFT" | "PARK-CANDIDATE"
  export type Status = "open" | "fixed" | "parked" | "wontfix"

  export interface Park { rationale: string; impact: string; nextSteps: string; targetSprint: string }
  export interface Issue {
    seq: number
    id: string // human id e.g. W1-01
    cycle: number
    severity: Severity
    cls: Cls
    title: string
    repro: string
    evidence: string
    status: Status
    resolution?: string // the fix summary, or the wontfix reason
    park?: Park // the four fields, required when status === "parked"
    prev: string
    hash: string
  }

  export const GENESIS = "0".repeat(64)
  const sha256 = (s: string) => createHash("sha256").update(s).digest("hex")
  function stable(v: unknown): string {
    if (v === null || typeof v !== "object") return JSON.stringify(v)
    if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`
    const k = Object.keys(v as Record<string, unknown>).sort()
    return `{${k.map((x) => `${JSON.stringify(x)}:${stable((v as Record<string, unknown>)[x])}`).join(",")}}`
  }

  export class Ledger {
    private issues: Issue[] = []
    constructor(private file?: string) {
      if (file && existsSync(file)) {
        this.issues = readFileSync(file, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l) as Issue)
        const v = this.verifyChain()
        if (!v.ok) throw new Error(`walk ledger chain broken at ${v.brokenAt}`)
      } else if (file) writeFileSync(file, "")
    }

    // register an issue BEFORE any fix (C-LOOP: finding order is evidence)
    register(i: Omit<Issue, "seq" | "prev" | "hash" | "status" | "resolution" | "park">): Issue {
      const seq = this.issues.length
      const prev = seq === 0 ? GENESIS : this.issues[seq - 1].hash
      const payload = { ...i, seq, status: "open" as Status }
      const hash = sha256(`${prev}|${stable(payload)}`)
      const issue: Issue = { ...payload, prev, hash }
      this.issues.push(issue)
      if (this.file) appendFileSync(this.file, JSON.stringify(issue) + "\n")
      return issue
    }

    // resolve an issue (fixed / parked / wontfix). A park MUST carry the four fields (C-PARK). Append-only: the
    // resolution is recorded as a NEW chained record referencing the id (the original open record is never mutated).
    resolve(id: string, status: Status, resolution: string, park?: Park): Issue {
      const orig = this.issues.find((x) => x.id === id && x.status === "open")
      if (!orig) throw new Error(`cannot resolve unknown/again id ${id}`)
      if (status === "parked" && (!park || !park.rationale || !park.impact || !park.nextSteps || !park.targetSprint))
        throw new Error(`C-PARK: parking ${id} requires all four fields (rationale, impact, nextSteps, targetSprint)`)
      const seq = this.issues.length
      const prev = this.issues[seq - 1].hash
      // strip the ORIGINAL record's chain fields (prev/hash/seq) before rebuilding — otherwise they leak into the
      // hashed payload and verifyChain (which excludes prev/hash) would not reproduce the stored hash.
      const { prev: _op, hash: _oh, seq: _os, resolution: _or, park: _opk, status: _ost, ...core } = orig
      const payload = { ...core, seq, status, resolution, ...(park ? { park } : {}) }
      const hash = sha256(`${prev}|${stable(payload)}`)
      const rec: Issue = { ...payload, prev, hash }
      this.issues.push(rec)
      if (this.file) appendFileSync(this.file, JSON.stringify(rec) + "\n")
      return rec
    }

    // the CURRENT status of each distinct id (latest record wins) — the register a convergence claim reads.
    current(): Issue[] {
      const byId = new Map<string, Issue>()
      for (const i of this.issues) byId.set(i.id, i)
      return [...byId.values()]
    }
    openNonParked(): Issue[] {
      return this.current().filter((i) => i.status === "open")
    }
    parks(): Issue[] {
      return this.current().filter((i) => i.status === "parked")
    }
    newInCycle(cycle: number): Issue[] {
      // distinct ids first registered in this cycle
      const firstSeen = new Map<string, Issue>()
      for (const i of this.issues) if (!firstSeen.has(i.id)) firstSeen.set(i.id, i)
      return [...firstSeen.values()].filter((i) => i.cycle === cycle)
    }

    all(): readonly Issue[] { return this.issues }
    headHash(): string { return this.issues.length ? this.issues[this.issues.length - 1].hash : GENESIS }

    verifyChain(): { ok: boolean; brokenAt: number | null } {
      let prev = GENESIS
      for (const r of this.issues) {
        if (r.prev !== prev) return { ok: false, brokenAt: r.seq }
        const { prev: _p, hash: _h, ...payload } = r
        if (sha256(`${prev}|${stable(payload)}`) !== r.hash) return { ok: false, brokenAt: r.seq }
        prev = r.hash
      }
      return { ok: true, brokenAt: null }
    }
  }

  // a cycle is CLEAN iff it surfaced zero NEW issues and left zero OPEN non-parked issues (C-LOOP). Convergence is
  // two consecutive clean cycles — derived here from the register, never asserted by the walker.
  export function cycleClean(l: Ledger, cycle: number): boolean {
    return l.newInCycle(cycle).length === 0 && l.openNonParked().length === 0
  }
  export function converged(cleanFlags: boolean[]): boolean {
    for (let i = 1; i < cleanFlags.length; i++) if (cleanFlags[i] && cleanFlags[i - 1]) return true
    return false
  }
}
