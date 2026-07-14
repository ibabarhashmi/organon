/**
 * ORGΛNON — THE REACH SPRINT (V35), Phase 5 wall: S98 — MR1's DEPTH CENSUS, STATED AS AN OUTCOME (C-3 / DD-15).
 *
 * The census outcome went unreported for four sprints. This states it, worse-included: domain-catch stays 0/7 (UNCHANGED)
 * — no curated-shelf subject classifies into a new domain (D34). A census that only ever improves is not a census. The
 * four MR1 subjects are RESOLVABLE (4/4 present) and classifiable; they are NOT force-shelved (that would be new capability).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const record = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "mr1-census.json"), "utf8"))

test("S98 — the depth census's domain-catch axis is STATED as an outcome (0/7), and whether it improved (it did not) — worse-included", () => {
  expect(record.domainCatch.renderable).toBe(0)
  expect(record.domainCatch.denominator).toBe(7)
  expect(record.improved).toBe(false) // stated honestly — a census that only ever improves is not a census (C-3)
  expect(record.outcome).toMatch(/UNCHANGED/i)
  expect(record.honestNote).toMatch(/only ever improves is not a census/i)
})

test("S98 — the MR1 capture is real (4/4 pinned present, 1284 pools) — the number the capture actually returned", () => {
  expect(record.mr1Capture.reality).toBe("REAL")
  expect(record.mr1Capture.pinnedPresentCount).toBe(4)
  expect(record.mr1Capture.shelfCount).toBeGreaterThan(1000)
})

test("S98 — the four pinned subjects are named with their domain classification (stated, never inflated onto a new shelf row)", () => {
  expect(record.pinnedSubjects.length).toBe(4)
  const names = record.pinnedSubjects.map((s: { project: string }) => s.project).sort()
  expect(names).toEqual(["aave-v3", "compound-v3", "ethena-usde", "sparklend"])
  for (const s of record.pinnedSubjects) {
    expect(s.present).toBe(true) // MR1 proved each present
    expect(typeof s.domainClass).toBe("string") // classified (conservative — UNCLASSIFIED or a real domain), never fabricated
  }
  // the shelf state is honest: resolvable + classifiable, NOT force-shelved (the Halt — no new capability)
  expect(record.shelfState).toMatch(/NOT force-added to the curated shelf|new capability/i)
})
