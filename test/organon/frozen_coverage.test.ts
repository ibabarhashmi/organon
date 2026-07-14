/**
 * ORGΛNON — THE REACH SPRINT (V35), Phase 5 wall: DD-16 / C-6 — the frozen-set coverage, and the honest impossibility.
 *
 * DD-2 (V34) took the shrunk 7/9 claim; DD-16 follows through: 7/9 CANNOT be closed to 9/9 without a boundary violation
 * (importing a monorepo artifact / committing gitignored local data). The pinned golden SHAs in frozen.ts are the entire
 * checkable record for the 2 absent (R-6) — stated, never a silent 7-of-9 (X-SHOWN(e)).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT, checkFrozenSet } from "../../src/organon/frozen"

const record = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "frozen-set-coverage.json"), "utf8"))

test("DD-16 — the record matches the live checkFrozenSet: 7 present, the 2 absent named, 0 drift", () => {
  const fs = checkFrozenSet()
  expect(record.coverage).toBe(`${fs.filter((c) => c.status === "ok").length}/${fs.length}`)
  expect(record.absent.sort()).toEqual(["RWA-VERDICT.md", "data/snapshot/MANIFEST.json"])
  expect(fs.filter((c) => c.status === "drift").length).toBe(0) // never a silent drift
})

test("DD-16 — the honest impossibility is recorded per-absent (a boundary violation to close), never a shrug", () => {
  for (const id of record.absent) {
    const p = record.perAbsent[id]
    expect(p.canClose).toBe(false) // cannot be honestly closed
    expect(p.whatWouldClose.length).toBeGreaterThan(20) // the mechanism IS named (not hidden)
    expect(p.why).toMatch(/monorepo|gitignored|boundary|F-ENV/i) // and why closing it violates a boundary
  }
  expect(record.verdict).toMatch(/CANNOT be honestly closed|boundary violation/i)
  expect(record.verdict).toMatch(/pinned golden SHAs/i) // R-6: the pins are the entire record
})
