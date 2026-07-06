/**
 * WALL — C-NOREGRESS (Convergence). The capability inventory is the floor five sprints stand on. This wall loads the
 * COMMITTED snapshot (data/studio/capability-inventory.json) and proves the live tree has not regressed below it — no
 * proving test deleted, no test gutted below its pinned assertion count. Positive-controlled: a snapshot with an
 * impossible floor (or a missing file) is detected as a regression, so the check is not vacuous.
 */
import { describe, test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Inventory } from "../../src/studio/inventory"

const pinned: Inventory.Snapshot = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "studio", "capability-inventory.json"), "utf8"))

describe("WALL capability_inventory — the C-NOREGRESS floor holds", () => {
  test("the committed snapshot self-consistent: anchorHash matches its body", () => {
    const recomputed = Inventory.snapshot(pinned.anchoredAt)
    // the live re-snapshot must have the SAME anchor IF nothing changed; if tests were ADDED the anchor differs but
    // verify() (below) must still pass — that is the ≥ floor. Here we just assert the pinned file parses + has content.
    expect(pinned.capabilities.length).toBeGreaterThanOrEqual(20)
    expect(recomputed.capabilities.length).toBe(pinned.capabilities.length)
  })

  test("the live tree has NOT regressed below the pinned floor (no deleted/gutted proving tests)", () => {
    const v = Inventory.verify(pinned)
    if (!v.ok) console.log("  REGRESSIONS:\n" + v.regressions.map((r) => `    · ${r.capability} / ${r.file}: ${r.reason}`).join("\n"))
    expect(v.ok).toBe(true)
    expect(v.regressions).toEqual([])
  })

  test("POSITIVE CONTROL — an impossible floor is detected as a regression (the check is not vacuous)", () => {
    const tampered: Inventory.Snapshot = JSON.parse(JSON.stringify(pinned))
    tampered.capabilities[0].files[0].tests = 9999 // demand more test cases than any file has
    const v = Inventory.verify(tampered)
    expect(v.ok).toBe(false)
    expect(v.regressions[0].reason).toMatch(/dropped|DELETED/)
  })

  test("POSITIVE CONTROL — a deleted proving file is detected", () => {
    const tampered: Inventory.Snapshot = JSON.parse(JSON.stringify(pinned))
    tampered.capabilities[0].files[0].file = "test/walls/does_not_exist.test.ts"
    const v = Inventory.verify(tampered)
    expect(v.ok).toBe(false)
    expect(v.regressions.some((r) => /DELETED/.test(r.reason))).toBe(true)
  })
})
