/**
 * WALL — ledger-pollution auditor (Transplant Phase 0; Rule T-POLLUTION). Locks the auditor so "the ledgers are clean"
 * is a TESTED claim, not an absence of looking: (1) a seeded schema-invalid entry is caught (the W1-04 class, the exact
 * reason the audit exists); (2) a seeded chain-tamper is caught; (3) a valid registered spec passes clean (no
 * over-rejection); (4) the auditor's chain recomputation AGREES with Ledger.Store byte-for-byte on a freshly-built
 * ledger (so the mirror cannot silently drift from the real ledger's hashing); (5) per-domain chained ledgers are not
 * false-flagged at a domain switch (the clock-stamp bug this wall would have caught).
 */
import { describe, test, expect } from "bun:test"
import { Pollution } from "../../src/studio/pollution"
import { Ledger } from "../../src/ledger/ledger"

const validSpec = { family: "rwa-allocation", legs: [{ id: "a", weight: 0.6 }, { id: "b", weight: 0.4 }], rebalance: { trigger: "monthly" }, policy: "static", constraints: {} }

describe("WALL ledger_pollution — the ledgers answer for their past (T-POLLUTION)", () => {
  test("a freshly-built ledger audits CLEAN with its specs recovered (must-accept)", () => {
    const store = new Ledger.Store()
    store.register({ spec: validSpec, authorClass: "human", domain: "rwa", timestamp: 1 })
    const recovery = new Map<string, unknown>([[Ledger.hashSpec(validSpec), validSpec]])
    const audit = Pollution.auditTrialLedger("fresh", store.toJSONL(), recovery)
    expect(audit.chainOk).toBe(true)
    expect(audit.invalidSeqs.length).toBe(0)
    expect(audit.findings[0].specSchemaValid).toBe(true) // the spec was recovered AND passed the current schema
  })

  test("POSITIVE CONTROL — a seeded schema-invalid spec is CAUGHT (the W1-04 class)", () => {
    const store = new Ledger.Store()
    store.register({ spec: validSpec, authorClass: "human", domain: "rwa", timestamp: 1 })
    const badSpec = { ...validSpec, policy: "not-a-real-policy" } // fails the current SubmitSpec enum
    const line = JSON.parse(store.toJSONL())
    const seeded = JSON.stringify({ ...line, specHash: Ledger.hashSpec(badSpec) }) + "\n"
    const recovery = new Map<string, unknown>([[Ledger.hashSpec(badSpec), badSpec]])
    const audit = Pollution.auditTrialLedger("seeded", seeded, recovery)
    expect(audit.invalidSeqs.length).toBe(1)
    expect(audit.findings[0].specSchemaValid).toBe(false)
    expect(audit.findings[0].reasons.some((r) => r.includes("current schema"))).toBe(true)
  })

  test("POSITIVE CONTROL — a seeded chain-tamper (flipped timestamp) is CAUGHT", () => {
    const store = new Ledger.Store()
    store.register({ spec: validSpec, authorClass: "human", domain: "rwa", timestamp: 1 })
    const line = JSON.parse(store.toJSONL())
    const tampered = JSON.stringify({ ...line, timestamp: line.timestamp + 1 }) + "\n" // stored hash no longer recomputes
    const audit = Pollution.auditTrialLedger("tampered", tampered, new Map())
    expect(audit.invalidSeqs.length).toBe(1)
    expect(audit.findings[0].reasons.some((r) => r.includes("tampered"))).toBe(true)
  })

  test("the auditor's chain recomputation AGREES with Ledger.Store (the mirror cannot drift)", () => {
    const store = new Ledger.Store()
    store.register({ spec: validSpec, authorClass: "agent", authorId: "z", domain: "rwa", timestamp: 10 })
    store.register({ spec: { ...validSpec, policy: "barbell" }, authorClass: "agent", authorId: "z", domain: "rwa", timestamp: 11, parentSeq: 0 })
    for (const e of store.all()) {
      const line = JSON.parse(JSON.stringify(e)) as Record<string, unknown>
      expect(Pollution.recomputeTrialHash(line)).toBe(e.hash) // byte-for-byte agreement with the real ledger's hashing
    }
  })

  test("a PER-DOMAIN chained ledger is not false-flagged at a domain switch", () => {
    // two domains, each a fresh GENESIS-rooted chain — the auditor must group, not read it as one linear chain
    const rows = [
      { domain: "lending", prevSha: "0".repeat(64), selfSha: "a".repeat(64) },
      { domain: "funding", prevSha: "0".repeat(64), selfSha: "b".repeat(64) }, // a NEW domain resets to GENESIS — legit
      { domain: "lending", prevSha: "a".repeat(64), selfSha: "c".repeat(64) },
    ]
    const jsonl = rows.map((r) => JSON.stringify(r)).join("\n")
    const grouped = Pollution.auditChainedLedger("stamps", jsonl, "clock-stamp", "prevSha", "selfSha", "domain")
    expect(grouped.chainOk).toBe(true) // per-domain: clean
    const linear = Pollution.auditChainedLedger("stamps", jsonl, "clock-stamp", "prevSha", "selfSha")
    expect(linear.chainOk).toBe(false) // without grouping the domain switch false-flags — proves the group-awareness matters
  })
})
