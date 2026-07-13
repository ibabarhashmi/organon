/**
 * ORGΛNON — THE RECKONING SPRINT wall S80 (THE ACT TAXONOMY). Every trial is SEARCH or OBSERVATION, DERIVED at the append
 * site from the content hash and NEVER declared by a caller; the ≥20–50 trigger counts SEARCH only; verify() re-derives the
 * act so a declared/tampered tag FAILS; the one-time migration is gated on realLineageCount===0 (HALT + UNKNOWN-ACT else);
 * familyN===1 is untouched and the K-door STILL refuses even when the SEARCH trigger is met (D33 unsigned).
 */
import { test, expect } from "bun:test"
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { StrategyTrial } from "../../src/strategy/trial"
import { StrategyStore } from "../../src/strategy/store"
import { Migration } from "../../src/strategy/migration"
import { Correlate } from "../../src/analytics/correlate"

function tmp() { return mkdtempSync(path.join(tmpdir(), "org-tax-")) }

test("S80 — deriveAct: no prior OR a changed config → SEARCH; the same config → OBSERVATION", () => {
  expect(StrategyTrial.deriveAct(null, "abc")).toBe("SEARCH")
  expect(StrategyTrial.deriveAct("xyz", "abc")).toBe("SEARCH")
  expect(StrategyTrial.deriveAct("abc", "abc")).toBe("OBSERVATION")
})

test("S80 — append DERIVES the act (no caller param): a lineage's first entry is SEARCH, its re-compiles OBSERVATION", () => {
  const dir = tmp()
  const cfg = "a".repeat(64)
  const m = { effectiveK: null, worstAxisTier: null, exitFired: null, reachable: 1 }
  const t1 = StrategyTrial.append(cfg, [], m, 1000, dir)
  const t2 = StrategyTrial.append(cfg, [], m, 2000, dir)
  const t3 = StrategyTrial.append(cfg, [], m, 3000, dir)
  expect(t1.act).toBe("SEARCH") // registration
  expect(t2.act).toBe("OBSERVATION") // a re-compile of the same content
  expect(t3.act).toBe("OBSERVATION")
  expect(StrategyTrial.trialsPerFamily(cfg, dir)).toBe(1) // the trigger counts SEARCH only
  expect(StrategyTrial.census(cfg, dir)).toEqual({ total: 3, search: 1, observation: 2, unknown: 0 })
})

test("S80 — the committed 23-trial lineage reads 1 SEARCH / 22 OBSERVATION → the trigger counter is 1 of ≥20 → the K-door refuses", () => {
  const id = "040301c26de44c9ef869d3cab8af582e82f6bda4ac63a0dfd8abf4c62586250c"
  const c = StrategyTrial.census(id, StrategyTrial.FIXTURE_TRIAL_DIR)
  expect(c.total).toBe(23)
  expect(c.search).toBe(1)
  expect(c.observation).toBe(22)
  expect(StrategyTrial.trialsPerFamily(id, StrategyTrial.FIXTURE_TRIAL_DIR)).toBe(1)
  expect(() => Correlate.activateKIntoStamp(1, { triggerFired: false, operatorSignedD33: false })).toThrow(/REFUSED/i)
})

test("S80 control (ii) — a seeded 20-SEARCH family: the trigger CONDITION is met, and the K-door STILL REFUSES (D33 unsigned)", () => {
  const dir = tmp()
  const m = { effectiveK: null, worstAxisTier: null, exitFired: null, reachable: 1 }
  // 20 entries each a DISTINCT config → the derivation tags every one SEARCH (a changed hypothesis each time)
  const raw = Array.from({ length: 20 }, (_, i) => ({ config: `cfg${i}`.padEnd(64, "0"), returnSeries: [], metric: m, contentSha: "x", timestamp: i, prevTrialHash: null, entryHash: "e" + i, counted: false as const, act: "OBSERVATION" as const }))
  const retagged = Migration.retagEntries(raw as never)
  const key = "family20"
  writeFileSync(path.join(dir, `${key}.jsonl`), retagged.map((t) => JSON.stringify(t)).join("\n") + "\n")
  expect(StrategyTrial.trialsPerFamily(key, dir)).toBe(20) // the trigger CONDITION is met over SEARCH
  // both directions of V32's proof, carried: trigger-met + pen-unsigned STILL refuses; pen-only STILL refuses
  expect(() => Correlate.activateKIntoStamp(20, { triggerFired: true, operatorSignedD33: false })).toThrow(/REFUSED/i)
  expect(() => Correlate.activateKIntoStamp(20, { triggerFired: false, operatorSignedD33: true })).toThrow(/REFUSED/i)
})

test("S80 control (iii) — a seeded act that DISAGREES with the derivation FAILS verify (the act is derived, never declared)", () => {
  const dir = tmp()
  const cfg = "b".repeat(64)
  const m = { effectiveK: null, worstAxisTier: null, exitFired: null, reachable: 1 }
  StrategyTrial.append(cfg, [], m, 1000, dir) // entry 0 → SEARCH (correct)
  const t2 = StrategyTrial.append(cfg, [], m, 2000, dir) // entry 1 → OBSERVATION (correct)
  expect(StrategyTrial.verify(cfg, dir).ok).toBe(true)
  // tamper: force entry 1's act to SEARCH (a caller-declared tag on an unchanged config) → verify re-derives OBSERVATION → FAIL
  const f = path.join(dir, `${cfg}.jsonl`)
  const lines = readFileSync(f, "utf8").trim().split("\n")
  lines[1] = JSON.stringify({ ...JSON.parse(lines[1]), act: "SEARCH" })
  writeFileSync(f, lines.join("\n") + "\n")
  const v = StrategyTrial.verify(cfg, dir)
  expect(v.ok).toBe(false)
  expect(v.reason).toMatch(/disagrees with the derived act/i)
})

test("S80 — the migration is gated on realLineageCount===0; the record preserves the old root (oldChainRoot===newChainRoot; act not hashed)", () => {
  const rec = JSON.parse(readFileSync(path.join(StrategyStore.ROOT, "..", "honesty", "reckon-migration.json"), "utf8")) as Migration.Record
  expect(rec.realLineageCountAtMigration).toBe(0)
  expect(rec.entriesRetagged).toBe(26) // 23 + 3
  for (const lin of rec.lineages) {
    expect(lin.oldChainRoot).toBe(lin.newChainRoot) // act is NOT hashed — the chain is cryptographically unchanged
    expect(lin.search).toBe(1) // each committed fixture is one registration + observations
  }
  expect(rec.chainNote).toMatch(/field-addition, not a chain rewrite/i)
})

test("S80 — familyN===1 is untouched; X-CORRELATE is not amended (the frozen statistics change zero)", () => {
  // the K-door contract is unchanged: only BOTH the trigger AND the pen open it (the SEARCH count feeds the trigger, nothing else)
  expect(() => Correlate.activateKIntoStamp(50, { triggerFired: true, operatorSignedD33: false })).toThrow(/REFUSED/i)
  // the trial record still carries counted:false structurally (recorded, never counted)
  const chain = StrategyTrial.ledger("040301c26de44c9ef869d3cab8af582e82f6bda4ac63a0dfd8abf4c62586250c", StrategyTrial.FIXTURE_TRIAL_DIR)
  for (const t of chain) expect(t.counted).toBe(false)
})
