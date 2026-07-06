/**
 * WALL — the CHOKEPOINT CENSUS bites (Data-Plane Phase 0; Rule D-CHOKE, A′#6). Every existing control must map to an
 * enforcement point with a DEMONSTRATED refusal; a control whose proving file is gone or that carries no positive
 * control is DANGLING. The census's OWN positive control: a decorative (assertion-free) control MUST be flagged — a
 * census that misses it is a rubber stamp, the exact failure that let the V6 fuzz and the V8 matrix/gate slip through.
 */
import { test, expect } from "bun:test"
import { mkdtempSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Census } from "../../src/studio/census"

test("census: every existing control has an enforcement point + a demonstrated refusal (zero dangling)", () => {
  const res = Census.run()
  expect(res.controlCount).toBeGreaterThanOrEqual(20)
  // every control resolves to a real proving file that carries a bite pattern (its positive control)
  for (const row of res.rows) {
    expect(row.provingExists).toBe(true)
    expect(row.biteFound).toBe(true)
    expect(row.evidenceSha).not.toBeNull()
  }
  expect(res.dangling.length).toBe(0)
  expect(res.ok).toBe(true)
})

test("census POSITIVE CONTROL: a seeded decorative (assertion-free) control is CAUGHT as dangling", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "census-wall-"))
  const rel = path.relative(PKG_ROOT, path.join(dir, "decorative.test.ts"))
  // a proving file with a test that asserts a truism and NEVER refuses a violation → no bite pattern
  writeFileSync(path.join(PKG_ROOT, rel), `import { test } from "bun:test"\ntest("truism", () => { const x = 2; if (x < 0) console.log("no") })\n`)
  try {
    const row = Census.evaluate(Census.seededDanglingControl(rel))
    expect(row.dangling).toBe(true) // the census MUST catch the decorative control
    expect(row.biteFound).toBe(false)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("census: a control whose proving file is MISSING is dangling (deleted-control positive control)", () => {
  const row = Census.evaluate({ id: "ghost", property: "x", enforcementPoint: "y", provingFile: "test/walls/does_not_exist.test.ts", tier: "predicate" })
  expect(row.provingExists).toBe(false)
  expect(row.dangling).toBe(true)
})
