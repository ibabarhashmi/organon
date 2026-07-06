/**
 * TEST — the SUMMARY DIFFERENTIAL (Reachability Phase 0; Rule U-DERIVED). The V11 terminal contradicted itself on the
 * matrix count (22 vs 23) because it was hand-typed. This proves the mechanism: every terminal figure regenerates from
 * its source artifact, and a hand-typed number that disagrees is CAUGHT (a finding, not a typo).
 */
import { test, expect } from "bun:test"
import { Summary } from "../../src/studio/summary"
import { Matrix } from "../../src/studio/matrix"
import { Inventory } from "../../src/studio/inventory"
import { Catalog } from "../../src/studio/catalog"

test("the derived figures match their source artifacts (floor · matrix · catalog)", () => {
  const d = Summary.derive()
  expect(d.floor).toBe(Inventory.snapshot("x").capabilities.length)
  const rows = Matrix.rows()
  expect(d.matrixPresent).toBe(rows.filter((r) => r.status === "PRESENT").length)
  expect(d.matrixAbsent).toBe(rows.filter((r) => r.status === "ABSENT").length)
  expect(d.catalogCount).toBe(Catalog.verify().count)
})

test("a prose number that AGREES with its artifact passes; one that DISAGREES is caught (U-DERIVED)", () => {
  const d = Summary.derive()
  expect(Summary.differential({ matrixPresent: d.matrixPresent }, d).ok).toBe(true) // agrees
  const bad = Summary.differential({ matrixPresent: d.matrixPresent - 1 }, d) // the V11-style hand-typed disagreement
  expect(bad.ok).toBe(false)
  expect(bad.mismatches[0]).toMatch(/matrixPresent: prose says/)
})
