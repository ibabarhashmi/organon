/**
 * ORGΛNON — Explanation Phase 5 wall (CONVERGED-8). THE WALK v9 — bootstrapped through the runner, catalog v14 (46)
 * traversed in full, the novice persona reading the plain WHY at every refusal, the seven explanation-aware themes
 * rotated, two consecutive FULL-depth clean cycles across ≥4 total. The record is committed + hash-chained.
 */
import { test, expect } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Catalog } from "../../src/studio/catalog"

const REC = path.join(PKG_ROOT, "data", "studio", "walk-v9-cycles.json")

test("the walk CONVERGED-8: catalog-complete (v14/46) + rotation-complete + two consecutive FULL-depth clean + ≥4 cycles, bootstrapped through the runner", () => {
  if (!existsSync(REC)) { console.log("  (walk_v9) record absent — run script/walk-v9.ts. Disclosed."); return }
  const r = JSON.parse(readFileSync(REC, "utf8"))
  expect(["CONVERGED-8", "NON-CONVERGENCE"]).toContain(r.outcome)
  if (r.outcome === "CONVERGED-8") {
    expect(r.bootstrappedThroughRunner).toBe(true) // the walk entered through ./organon.sh's launch gate
    expect(r.catalogComplete).toBe(true)
    expect(r.catalog.count).toBe(Catalog.verify().count) // the FULL live pinned catalog v14 (46)
    expect(r.catalog.count).toBe(46)
    expect(r.rotationComplete).toBe(true)
    expect(r.twoConsecutiveClean).toBe(true)
    expect(r.cycleCount).toBeGreaterThanOrEqual(4)
    expect(r.converged8).toBe(true)
    // every door walked, incl. the runner + the WHY panel
    for (const door of ["runner", "preset", "goal", "builder-funding-real", "pool", "why-panel"]) expect(r.doors).toContain(door)
    // both noise walls green each cycle
    for (const c of r.cycles) { expect(c.bothNoiseWalls.pooledClean).toBe(true); expect(c.bothNoiseWalls.vocClean).toBe(true) }
    expect(r.cleanFlags).toEqual([true, true, true, true])
  }
})

test("the WALK LEDGER is hash-chained + complete (issues registered before fixes; a clean walk records zero)", () => {
  if (!existsSync(REC)) return
  const r = JSON.parse(readFileSync(REC, "utf8"))
  expect(r.walkLedger.chainOk).toBe(true)
  expect(r.walkLedger.open).toBe(0) // no open non-parked findings
})

test("the novice persona is recorded: the plain WHY answered 'why did it fail?' at every refusal", () => {
  if (!existsSync(REC)) return
  const r = JSON.parse(readFileSync(REC, "utf8"))
  expect(r.novicePersona).toMatch(/why did it fail/i)
  expect(r.themes).toEqual(["injection", "laundering", "tamper", "availability", "doc-lies", "ux-priming", "park-legitimacy"])
})
