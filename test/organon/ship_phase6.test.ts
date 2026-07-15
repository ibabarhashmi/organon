/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 6 (THE RESIDUES — sheds first). No new law, no new wall (S151–S160 are the
 * sprint's walls). This verifies the residue artifact is honest: D79 (oracle-staleness FROZEN at a named subset and SAYS
 * SO), K-8 (the false-fire subject coverage emitted), MR13/MR17/MR19 (discharged or recorded, never silently dropped), K-9
 * (the TRUE capability count, 4, not a redefined 0).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const R = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "ship-residues.json"), "utf8"))

test("Phase 6 — D79: oracle-staleness FROZEN at a named subset and SAYS SO (names its own boundary — honest, not a decoration)", () => {
  expect(R.d79_oracleStaleness.decision).toMatch(/FROZEN/)
  expect(R.d79_oracleStaleness.namedSubset).toEqual(["USDC/USD", "USDT/USD", "DAI/USD"])
  expect(R.d79_oracleStaleness.coverage).toBe("3/1284")
  expect(R.d79_oracleStaleness.honestFreeze).toMatch(/UNJUDGEABLE elsewhere/)
})

test("Phase 6 — K-8: the false-fire count's SUBJECT COVERAGE is emitted (as oracle-staleness emits its coverage)", () => {
  expect(R.k8_falseFireCoverage.subjects).toEqual(["tvl-drawdown", "peg-floor"])
  expect(R.k8_falseFireCoverage.coverage).toMatch(/2 of 7 exit kinds/)
})

test("Phase 6 — MR13/MR17/MR19: discharged or recorded — never silently dropped (K-9's fifth-sprint complaint answered)", () => {
  expect(R.mr13.status).toMatch(/RECORDED UNDISCHARGEABLE/)
  expect(R.mr17.status).toMatch(/ACCOUNTED/)
  expect(R.mr19.status).toMatch(/EXPLAINED/)
  expect(R.mr19.explanation).toMatch(/Surrogate Addendum|32 tests/)
})

test("Phase 6 — K-9: the TRUE capability count is 4, disclosed (not a redefined 0)", () => {
  expect(R.k9_capability.count).toBe(4)
  expect(R.k9_capability.disclosed.length).toBe(4)
  expect(R.k9_capability.disclosed.join(" ")).toMatch(/SHIP GATE/)
  expect(R.k9_capability.disclosed.join(" ")).toMatch(/SHARED-DEPENDENCY MAP/)
})
