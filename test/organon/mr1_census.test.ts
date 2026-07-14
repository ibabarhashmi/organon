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
})

test("MR12/S98 — the owed MR1 residue is DISCHARGED: the four subjects are SHELVED (owed data, not capability), badged only where a real domain class exists; domain-catch stays 0/7", () => {
  // Derivation V36 reverses the V35 stance (E-8: the Halt-as-a-shield) — shelving already-captured data is DATA, not capability.
  for (const s of record.pinnedSubjects) expect(s.shelved).toBe(true) // all four shelved (owed data discharged)
  const badged = record.pinnedSubjects.filter((s: { badge: boolean }) => s.badge)
  expect(badged.length).toBe(1) // only ethena-usde (STABLE-SYNTH) carries a real domain badge — the rest UNCLASSIFIED, never fabricated
  expect(badged[0].domainClass).toBe("STABLE-SYNTH")
  // the distinction is pinned, and domain-catch is UNCHANGED (shelving data does not create a new-domain subject)
  expect(record.mr12.rule).toMatch(/forbids new CAPABILITY, not owed DATA/i)
  expect(record.shelfState).toMatch(/SHIELD/i) // a Halt used to defer an owed residue is a shield
  expect(record.domainCatch.renderable).toBe(0) // 0/7 UNCHANGED — no capability added
})
