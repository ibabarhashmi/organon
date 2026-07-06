/**
 * ORGΛNON STUDIO — the DURABLE LEDGER battery (Phase 1; Rule L-PERSIST; LEDGER-PERSISTS gate). Proves the V4 ctrl-C
 * hole is closed: a process restart (simulated by reopening the file into a fresh store) does NOT un-see a trial;
 * family/root counts REMEMBER across death; the chain verifies on load; a torn final line is quarantined without
 * losing prior entries; a rollback to an older file is exposed by the anchored latest-hash. The restart-laundering
 * replay reaches the full count across restarts and the DSR bar still stiffens.
 */
import { describe, test, expect } from "bun:test"
import { mkdtempSync, appendFileSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { Durable } from "../../src/studio/durable"
import { Ledger } from "../../src/ledger/ledger"
import { Studio } from "../../src/studio/adjudicate"

const spec = (k: number) => ({ family: "rwa-allocation", policy: ["static", "barbell", "yield-rotation", "constrained-carry", "peg-defensive"][k % 5], rebalance: { trigger: ["monthly", "quarterly", "drift"][k % 3] }, legs: [{ id: `l${k}`, weight: 1 }] })
const T = 1_700_000_000_000
function freshFile(): string {
  return path.join(mkdtempSync(path.join(tmpdir(), "durable-")), "ledger.jsonl")
}

describe("durable ledger — survives death (L-PERSIST)", () => {
  test("restart REMEMBERS: register 5 → reopen → resubmit is deduped, a new root grows to 6", () => {
    const f = freshFile()
    const a = Durable.DurableStore.open(f, { epochLabel: "2026-07-04" })
    for (let k = 0; k < 5; k++) a.register({ spec: spec(k), authorClass: "agent", authorId: "auth", domain: "rwa", parentSeq: null, timestamp: T + k })
    expect(a.length).toBe(5)

    // ── SIMULATE kill -9 + restart: drop `a`, reopen the file into a brand-new store ──
    const b = Durable.DurableStore.open(f, { epochLabel: "2026-07-04" })
    expect(b.length).toBe(5) // nothing un-seen
    expect(b.verifyChain().ok).toBe(true) // chain verifies on load
    b.register({ spec: spec(2), authorClass: "agent", authorId: "auth", domain: "rwa", parentSeq: null, timestamp: T + 99 }) // exact resubmission
    expect(b.length).toBe(5) // deduped across the restart — the ledger remembers it already saw spec #2
    b.register({ spec: spec(50), authorClass: "agent", authorId: "auth", domain: "rwa", parentSeq: null, timestamp: T + 100 })
    expect(b.length).toBe(6)
    expect(b.rootCount("auth", "rwa")).toBe(6) // root count held across death + grew
  })

  test("a TORN final line (crash mid-write) is quarantined; prior entries survive", () => {
    const f = freshFile()
    const a = Durable.DurableStore.open(f, { epochLabel: "e" })
    a.register({ spec: spec(0), authorClass: "agent", authorId: "auth", domain: "rwa", parentSeq: null, timestamp: T })
    a.register({ spec: spec(1), authorClass: "agent", authorId: "auth", domain: "rwa", parentSeq: null, timestamp: T + 1 })
    appendFileSync(f, '{"seq":2,"specHash":"broken') // a half-written final line (the crash)
    const b = Durable.DurableStore.open(f, { epochLabel: "e" })
    expect(b.length).toBe(2) // the two good entries survived
    expect(readFileSync(`${f}.quarantine`, "utf8")).toContain("broken") // the torn line was quarantined, not lost silently
  })

  test("a ROLLBACK to an older file is exposed by the anchored latest-hash", () => {
    const f = freshFile()
    const a = Durable.DurableStore.open(f, { epochLabel: "e" })
    a.register({ spec: spec(0), authorClass: "agent", authorId: "auth", domain: "rwa", parentSeq: null, timestamp: T })
    a.register({ spec: spec(1), authorClass: "agent", authorId: "auth", domain: "rwa", parentSeq: null, timestamp: T + 1 })
    const anchor = a.latestHash() // recorded in the BuildLog at this checkpoint
    const older = readFileSync(f, "utf8").split("\n").filter(Boolean).slice(0, 1).join("\n") + "\n"
    writeFileSync(f, older) // swap in an older copy (a rollback attack)
    const rolled = Durable.DurableStore.open(f, { epochLabel: "e" })
    expect(rolled.verifyAgainstAnchor(anchor)).toBe(false) // the rollback is caught against the anchor
  })

  test("a hand-edited MIDDLE line is not silently recovered (loud chain break)", () => {
    const f = freshFile()
    const a = Durable.DurableStore.open(f, { epochLabel: "e" })
    a.register({ spec: spec(0), authorClass: "agent", authorId: "auth", domain: "rwa", parentSeq: null, timestamp: T })
    a.register({ spec: spec(1), authorClass: "agent", authorId: "auth", domain: "rwa", parentSeq: null, timestamp: T + 1 })
    a.register({ spec: spec(2), authorClass: "agent", authorId: "auth", domain: "rwa", parentSeq: null, timestamp: T + 2 })
    const lines = readFileSync(f, "utf8").split("\n").filter(Boolean)
    const mid = JSON.parse(lines[1]); mid.domain = "funding"; lines[1] = JSON.stringify(mid) // tamper the MIDDLE
    writeFileSync(f, lines.join("\n") + "\n")
    expect(() => Durable.DurableStore.open(f, { epochLabel: "e" })).toThrow() // not the tail → refuses loudly
  })

  test("RAM-era discontinuity is disclosed when opening after a lost in-memory era (never backfilled)", () => {
    const f = freshFile()
    const s = Durable.DurableStore.open(f, { epochLabel: "2026-07-04", ramEraExisted: true })
    expect(s.discontinuity?.kind).toBe("ram-era-unrecoverable")
    expect(s.discontinuity?.note).toContain("never backfilled")
  })
})

describe("durable ledger — the ctrl-C laundering replay is closed (L-PERSIST + H-SCOPE)", () => {
  test("25 roots registered with a RESTART between each → durable count reaches 25 and the bar stiffens", async () => {
    const f = freshFile()
    // the seeded series that survives at n=1 (DSR≈0.998, CONDITIONAL) but fails at n=25 (DSR≈0.805, NO-GO)
    let sd = 1 >>> 0
    const u = () => ((sd = (sd + 0x6d2b79f5) | 0), ((t) => ((t = Math.imul(t ^ (t >>> 15), t | 1)), (t ^= t + Math.imul(t ^ (t >>> 7), t | 61)), ((t ^ (t >>> 14)) >>> 0) / 4294967296))(sd))
    const R = Array.from({ length: 260 }, () => { const u1 = Math.max(u(), 1e-12), u2 = u(); return 0.125 + 0.9 * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) })
    // root 0 adjudicated on a fresh store → CONDITIONAL at n=1
    let s = Durable.DurableStore.open(f, { epochLabel: "e" })
    s.register({ spec: spec(0), authorClass: "agent", authorId: "launderer", domain: "rwa", parentSeq: null, timestamp: T })
    const first = await Studio.adjudicateRegistered(s.store, spec(0), { returns: R, barsPerYear: 365 })
    expect(first.rootCount).toBe(1)

    // roots 1..24, REOPENING (a restart) before each register — the durable file is the only memory
    for (let k = 1; k <= 24; k++) {
      s = Durable.DurableStore.open(f, { epochLabel: "e" }) // ← the "kill + restart"
      s.register({ spec: spec(k), authorClass: "agent", authorId: "launderer", domain: "rwa", parentSeq: null, timestamp: T + k })
    }
    s = Durable.DurableStore.open(f, { epochLabel: "e" })
    expect(s.rootCount("launderer", "rwa")).toBe(25) // every trial survived its restart

    const last = await Studio.adjudicateRegistered(s.store, spec(24), { returns: R, barsPerYear: 365 })
    expect(last.familyDeclaredNTrials).toBe(25)
    expect(last.attestation.dsrAtDeclared!).toBeLessThan(first.attestation.dsrAtDeclared!) // the bar stiffened across restarts
    expect(last.attestation.verdict).toBe("NO-GO") // ctrl-C between every trial did NOT launder acceptance
  }, 45000)
})
