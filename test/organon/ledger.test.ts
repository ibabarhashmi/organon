/**
 * ORGΛNON STUDIO — the trial LEDGER unit battery (Phase 2; Rule S-FAMILY). Proves the ledger's load-bearing
 * properties directly: append-only + hash-chained (tamper breaks loudly), lineage-required, orphan structural
 * evasion caught + quarantined, exact-resubmission deduped (no inflation), and the family size REPRODUCIBLE from the
 * serialized ledger alone. Positive-controlled (Rule XXIX): every gate is shown able to FIRE on a seeded violation.
 */
import { describe, test, expect } from "bun:test"
import { Ledger } from "../../src/ledger/ledger"

// deterministic specs (no Date.now, no randomness): a root + weight-mutations sharing a categorical skeleton.
const root = { family: "rwa-allocation", policy: "constrained-carry", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 0.5 }, { id: "b", weight: 0.5 }] }
const mut = (wa: number) => ({ ...root, legs: [{ id: "a", weight: wa }, { id: "b", weight: 1 - wa }] })
const T = 1_700_000_000_000 // a fixed epoch — determinism, never Date.now()

describe("trial ledger — append-only + hash-chained (S-FAMILY)", () => {
  test("a fresh chain verifies; every entry links to its predecessor", () => {
    const s = new Ledger.Store()
    s.register({ spec: root, authorClass: "human", domain: "rwa", timestamp: T })
    s.register({ spec: mut(0.6), authorClass: "agent", domain: "rwa", parentSeq: 0, timestamp: T + 1 })
    s.register({ spec: mut(0.7), authorClass: "agent", domain: "rwa", parentSeq: 1, timestamp: T + 2 })
    expect(s.length).toBe(3)
    expect(s.get(0)!.prev).toBe(Ledger.GENESIS)
    expect(s.get(1)!.prev).toBe(s.get(0)!.hash)
    expect(s.verifyChain().ok).toBe(true)
  })

  test("POSITIVE CONTROL — a tampered row breaks the chain at that seq (append-only is enforced, not asserted)", () => {
    const s = new Ledger.Store()
    s.register({ spec: root, authorClass: "human", domain: "rwa", timestamp: T })
    s.register({ spec: mut(0.6), authorClass: "agent", domain: "rwa", parentSeq: 0, timestamp: T + 1 })
    // tamper the ledger's serialized bytes (as an attacker with disk access would) and reload
    const rows = s.toJSONL().split("\n")
    const row0 = JSON.parse(rows[0])
    row0.domain = "funding" // silently rewrite a committed field
    rows[0] = JSON.stringify(row0)
    expect(() => Ledger.Store.fromJSONL(rows.join("\n"))).toThrow(/tampered/)
  })
})

describe("trial ledger — family size = the honest multiple-testing n (S-FAMILY)", () => {
  test("a lineage of distinct mutations grows the family; family size is the distinct-spec count", () => {
    const s = new Ledger.Store()
    s.register({ spec: root, authorClass: "human", domain: "rwa", timestamp: T })
    let parent = 0
    for (let k = 1; k <= 5; k++) {
      const e = s.register({ spec: mut(0.5 + k * 0.05), authorClass: "agent", domain: "rwa", parentSeq: parent, timestamp: T + k })
      parent = e.seq
    }
    const fam = s.family(Ledger.hashSpec(mut(0.75)))
    expect(fam.size).toBe(6) // root + 5 distinct mutations
    expect(s.familySize(Ledger.hashSpec(root))).toBe(6) // any member sees the whole family
  })

  test("an EXACT resubmission is one trial (dedup) — iteration cannot be inflated OR reset by re-sending", () => {
    const s = new Ledger.Store()
    const a = s.register({ spec: root, authorClass: "human", domain: "rwa", timestamp: T })
    const b = s.register({ spec: root, authorClass: "human", domain: "rwa", timestamp: T + 1 }) // identical bytes
    expect(b.seq).toBe(a.seq) // same trial returned; the ledger did not grow
    expect(s.length).toBe(1)
    expect(s.familySize(Ledger.hashSpec(root))).toBe(1)
  })

  test("family size is REPRODUCIBLE from the serialized ledger alone (round-trips byte-stable)", () => {
    const s = new Ledger.Store()
    s.register({ spec: root, authorClass: "human", domain: "rwa", timestamp: T })
    s.register({ spec: mut(0.6), authorClass: "agent", domain: "rwa", parentSeq: 0, timestamp: T + 1 })
    const reloaded = Ledger.Store.fromJSONL(s.toJSONL())
    expect(reloaded.familySize(Ledger.hashSpec(root))).toBe(s.familySize(Ledger.hashSpec(root)))
    expect(reloaded.toJSONL()).toBe(s.toJSONL()) // append-only bytes are stable
  })
})

describe("trial ledger — lineage required + evasion caught (S-FAMILY)", () => {
  test("a mutation declaring a non-existent parent is refused", () => {
    const s = new Ledger.Store()
    s.register({ spec: root, authorClass: "human", domain: "rwa", timestamp: T })
    expect(() => s.register({ spec: mut(0.6), authorClass: "agent", domain: "rwa", parentSeq: 99, timestamp: T + 1 })).toThrow(/does not exist/)
  })

  test("POSITIVE CONTROL — an orphan that structurally matches an existing family is quarantined (lineage evasion)", () => {
    const s = new Ledger.Store()
    s.register({ spec: root, authorClass: "human", domain: "rwa", timestamp: T })
    // tweak ONLY a weight and strip the parent → a mutation dressed as a fresh root. Must be caught by the structural
    // signature (numbers bucketed), because this is the exact move that would reset a family counter from N to 1.
    expect(() => s.register({ spec: mut(0.9), authorClass: "agent", domain: "rwa", parentSeq: null, timestamp: T + 1 })).toThrow(Ledger.LineageEvasionError)
  })

  test("a genuinely different skeleton is allowed as a new root (structure differs → not an evasion)", () => {
    const s = new Ledger.Store()
    s.register({ spec: root, authorClass: "human", domain: "rwa", timestamp: T })
    const different = { family: "rwa-allocation", policy: "barbell", rebalance: { trigger: "quarterly" }, legs: [{ id: "x", weight: 1 }] }
    const e = s.register({ spec: different, authorClass: "human", domain: "rwa", parentSeq: null, timestamp: T + 1 })
    expect(e.seq).toBe(1)
    expect(s.familySize(Ledger.hashSpec(different))).toBe(1) // its own new family
  })
})
