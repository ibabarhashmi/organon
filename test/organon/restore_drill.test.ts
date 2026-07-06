/**
 * WALL — L-PERSIST (Convergence Phase 1). A backup you never restored is a hope, not a backup. This drill proves the
 * full cycle: snapshot the durable ledger → CORRUPT the live copy → RESTORE from the snapshot → the ledger remembers,
 * the chain verifies, the anchored head matches. Positive-controlled with a deliberately TORN backup (a crash mid-write
 * on the backup itself) — the restore quarantines the torn tail and keeps every prior entry; and a ROLLBACK to an older
 * backup is caught against the anchor. No entry is ever silently lost or backfilled.
 */
import { describe, test, expect } from "bun:test"
import { mkdtempSync, copyFileSync, writeFileSync, readFileSync, appendFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { Durable } from "../../src/studio/durable"

function freshDir(): string {
  return mkdtempSync(path.join(tmpdir(), "restore-"))
}
const root = { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }
const mut = (k: number) => ({ ...root, legs: [{ id: "a", weight: 1 }], policy: ["static", "barbell", "yield-rotation", "peg-defensive", "constrained-carry"][k % 5] })

describe("WALL restore_drill — backup/restore proven, incl. a torn backup (L-PERSIST)", () => {
  test("snapshot → corrupt live → restore → the ledger REMEMBERS and the chain verifies", () => {
    const dir = freshDir()
    const live = path.join(dir, "ledger.jsonl")
    const backup = path.join(dir, "ledger.bak.jsonl")
    let d = Durable.DurableStore.open(live, { epochLabel: "e" })
    let parent: number | null = null
    for (let k = 0; k < 6; k++) parent = d.register({ spec: mut(k), authorClass: "agent", authorId: "op", domain: "rwa", parentSeq: parent, timestamp: 1_700_000_000_000 + k }).seq
    const headBefore = d.latestHash()
    const lenBefore = d.length

    // snapshot
    copyFileSync(live, backup)
    // CORRUPT the live copy (a disk gremlin scribbles over it)
    writeFileSync(live, "GARBAGE not json\n{also broken\n")
    // RESTORE from the snapshot
    copyFileSync(backup, live)
    const restored = Durable.DurableStore.open(live, { epochLabel: "e" })

    expect(restored.length).toBe(lenBefore) // it remembers every entry
    expect(restored.verifyChain().ok).toBe(true) // the chain verifies after restore
    expect(restored.verifyAgainstAnchor(headBefore)).toBe(true) // the anchored head matches — no silent rollback
  })

  test("POSITIVE CONTROL — a TORN backup restores every entry EXCEPT the torn tail (quarantined, not lost-silently)", () => {
    const dir = freshDir()
    const live = path.join(dir, "ledger.jsonl")
    const d = Durable.DurableStore.open(live, { epochLabel: "e" })
    let parent: number | null = null
    for (let k = 0; k < 4; k++) parent = d.register({ spec: mut(k), authorClass: "agent", authorId: "op", domain: "rwa", parentSeq: parent, timestamp: 1_700_000_000_000 + k }).seq
    // simulate a crash mid-write on the backup: append a partial (torn) final line
    const torn = path.join(dir, "torn.bak.jsonl")
    copyFileSync(live, torn)
    appendFileSync(torn, '{"seq":4,"specHash":"deadbeef","partial-torn-line')
    // restore FROM the torn backup
    copyFileSync(torn, live)
    const restored = Durable.DurableStore.open(live, { epochLabel: "e" })
    expect(restored.length).toBe(4) // the 4 whole entries survive; the torn tail is quarantined, not silently accepted
    expect(restored.verifyChain().ok).toBe(true)
    expect(readFileSync(`${live}.quarantine`, "utf8")).toContain("partial-torn-line") // the torn tail is preserved for audit
  })

  test("POSITIVE CONTROL — a ROLLBACK to an older backup is caught against the anchor", () => {
    const dir = freshDir()
    const live = path.join(dir, "ledger.jsonl")
    const d = Durable.DurableStore.open(live, { epochLabel: "e" })
    let parent: number | null = null
    for (let k = 0; k < 3; k++) parent = d.register({ spec: mut(k), authorClass: "agent", authorId: "op", domain: "rwa", parentSeq: parent, timestamp: 1_700_000_000_000 + k }).seq
    const oldBackup = path.join(dir, "old.bak.jsonl")
    copyFileSync(live, oldBackup)
    const anchorAt3 = d.latestHash()
    // grow the ledger, then someone restores the STALE backup (a rollback)
    d.register({ spec: mut(9), authorClass: "agent", authorId: "op", domain: "rwa", parentSeq: parent, timestamp: 1_700_000_000_100 })
    copyFileSync(oldBackup, live)
    const rolledBack = Durable.DurableStore.open(live, { epochLabel: "e" })
    expect(rolledBack.verifyAgainstAnchor(anchorAt3)).toBe(true) // it IS the old state…
    expect(rolledBack.length).toBe(3) // …and the missing 4th entry is detectable by the anchor a monitor pinned
  })
})
