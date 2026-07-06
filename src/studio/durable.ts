/**
 * ORGΛNON STUDIO — the DURABLE LEDGER (Phase 1; Rule L-PERSIST). V4's ledger lived in RAM, so ctrl-C un-saw every
 * trial — the laundering hole wearing a seatbelt. This makes "the ledger remembers" true across process death:
 * file-backed, append-only on disk, **fsync'd BEFORE adjudication proceeds** (write-to-DISK-then-invoke), hash-chain
 * verified on load, a torn final line (a crash mid-write) quarantined without losing prior entries, and a rollback to
 * an older file exposed by the anchored latest-hash. The RAM era's already-lost trials are disclosed as a **ledger
 * discontinuity** — the clock rule applied to the ledger itself — never backfilled (a Halt).
 */
import { appendFileSync, closeSync, existsSync, fsyncSync, openSync, readFileSync, writeFileSync } from "node:fs"
import { Ledger } from "../ledger/ledger"

export namespace Durable {
  export class MissingLedgerError extends Error {}

  export interface Discontinuity {
    kind: "ram-era-unrecoverable"
    note: string
    durableEpochOpenedAt: string // a caller-supplied label (deterministic)
  }

  export class DurableStore {
    private inner: Ledger.Store
    private constructor(private filePath: string, inner: Ledger.Store, public discontinuity: Discontinuity | null) {
      this.inner = inner
    }

    // Open (or create) the durable ledger. Verifies the chain on load; a torn final line (crash mid-write) is
    // quarantined to `${file}.quarantine` and the prior entries are kept. A `ramEra` note records that any pre-durable
    // in-memory trials are unrecoverable — disclosed, never reconstructed.
    static open(filePath: string, opts: { epochLabel: string; ramEraExisted?: boolean } = { epochLabel: "" }): DurableStore {
      if (!existsSync(filePath)) {
        writeFileSync(filePath, "")
        const disc: Discontinuity | null = opts.ramEraExisted
          ? { kind: "ram-era-unrecoverable", note: "prior in-memory (RAM-era) trials are unrecoverable; counting resumes from this durable epoch — never backfilled (L-PERSIST)", durableEpochOpenedAt: opts.epochLabel }
          : null
        return new DurableStore(filePath, new Ledger.Store(), disc)
      }
      const raw = readFileSync(filePath, "utf8")
      const lines = raw.split("\n").filter((l) => l.trim().length > 0)
      try {
        const inner = Ledger.Store.fromJSONL(lines.join("\n"))
        return new DurableStore(filePath, inner, null)
      } catch {
        // torn or tampered tail: peel the LAST line, quarantine it, retry. If the break is mid-history (not the tail),
        // fromJSONL still throws → surface loudly (a hand-edited middle line is not silently recoverable).
        if (lines.length === 0) return new DurableStore(filePath, new Ledger.Store(), null)
        const torn = lines[lines.length - 1]
        const kept = lines.slice(0, -1)
        const inner = Ledger.Store.fromJSONL(kept.join("\n")) // throws if the damage is not just the final line
        appendFileSync(`${filePath}.quarantine`, torn + "\n")
        writeFileSync(filePath, kept.map((l) => l).join("\n") + (kept.length ? "\n" : ""))
        return new DurableStore(filePath, inner, null)
      }
    }

    // write-to-DISK-then-invoke: register in memory, and if a NEW entry resulted, fsync it to disk BEFORE returning —
    // so a crash after this point still remembers the trial. A dedup (existing spec) writes nothing (idempotent).
    register(input: Ledger.RegisterInput): Ledger.Entry {
      const before = this.inner.length
      const entry = this.inner.register(input)
      if (this.inner.length > before) {
        const fd = openSync(this.filePath, "a")
        try {
          appendFileSync(fd, JSON.stringify(entry) + "\n")
          fsyncSync(fd) // durability barrier — the entry is on stable storage before adjudication proceeds
        } finally {
          closeSync(fd)
        }
      }
      return entry
    }

    // the anchored latest hash — recorded in the BuildLog at each checkpoint; a swap to an older file changes this.
    latestHash(): string {
      return this.inner.length === 0 ? Ledger.GENESIS : this.inner.get(this.inner.length - 1)!.hash
    }
    verifyAgainstAnchor(expected: string): boolean {
      return this.latestHash() === expected
    }

    // delegation to the inner ledger (the durable store IS a ledger, with disk underneath)
    get store(): Ledger.Store {
      return this.inner
    }

    // A Ledger.Store VIEW whose register() PERSISTS (fsync) — the served-persistence decision (Transplant Phase 2,
    // W3-01, Rule T-SERVE). Mount THIS (not `.store`, whose register is the non-persisting inner one) on the served
    // routes so a stranger's first contact SURVIVES a restart. All reads delegate to the inner store. An optional
    // per-author-domain ROOT quota is bounded served-abuse hardening (registration friction); the sybil residual — a
    // fresh authorId resets the quota — is NAMED, not hidden (mitigated by authn + rate-limits + this cap, never claimed
    // eliminated). Reused registrations (same spec) are idempotent and never counted against the quota.
    mountableStore(opts: { maxRootsPerAuthorDomain?: number } = {}): Ledger.Store {
      const self = this
      return new Proxy(this.inner, {
        get(target, prop, recv) {
          if (prop === "register")
            return (input: Ledger.RegisterInput): Ledger.Entry => {
              const cap = opts.maxRootsPerAuthorDomain
              const isNewRoot = (input.parentSeq ?? null) === null && !self.inner.has(Ledger.hashSpec(input.spec))
              if (cap !== undefined && isNewRoot && self.inner.rootCount(input.authorId ?? input.authorClass, input.domain) >= cap)
                throw new Ledger.LedgerError(`served quota: ${input.authorId ?? input.authorClass} already has ${cap} registered roots in ${input.domain} (registration friction; a sybil resetting authorId is a NAMED residual, mitigated not eliminated — L-SYBIL)`)
              return self.register(input) // the PERSISTING (fsync) path
            }
          const v = Reflect.get(target, prop, recv)
          return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(target) : v
        },
      }) as Ledger.Store
    }
    get length(): number {
      return this.inner.length
    }
    has(specHash: string): boolean {
      return this.inner.has(specHash)
    }
    familySize(specHash: string): number {
      return this.inner.familySize(specHash)
    }
    rootCount(authorId: string, domain: string): number {
      return this.inner.rootCount(authorId, domain)
    }
    verifyChain() {
      return this.inner.verifyChain()
    }
  }
}
