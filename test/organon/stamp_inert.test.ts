/**
 * ORGΛNON — THE COVERAGE SPRINT, Phase 4 wall (THE DEFLATION STAYS INERT; S66 / X-CORRELATE d). The correlation substrate
 * serves the RENDER, never the statistics: the Stamp's familyN is NEVER set from effectiveK. This wall proves it three
 * ways — (1) the analytics tree contains NO randomness / no k-means (comment-stripped grep, so the prohibition text isn't
 * a false positive); (2) the Stamp path does NOT import the substrate; (3) the ONE sanctioned K→familyN door is LOCKED
 * behind BOTH the pinned trigger AND the Operator's D33 signature — every K-feed is REFUSED today.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Correlate } from "../../src/analytics/correlate"

// strip // line comments + /* */ block comments so the PROHIBITION prose in correlate.ts isn't grepped as a violation
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1")
}

test("INERT — the analytics tree contains NO seeded randomness / NO k-means (the CODE, comment-stripped — S66)", () => {
  const src = stripComments(readFileSync(path.join(PKG_ROOT, "src", "analytics", "correlate.ts"), "utf8"))
  expect(src).not.toMatch(/Math\.random/) // no randomness anywhere in the actual code
  expect(src).not.toMatch(/\bk-?means\b/i) // no k-means
  expect(src).not.toMatch(/seed(ed)?\s*\(|randomInit|Math\.floor\(Math\.random/i) // no seeded init
  // positive control: the stripper leaves real CODE (a token that lives in code, not a comment)
  expect(src).toMatch(/export const MERGE_THRESHOLD = 0\.5/)
  expect(src).toMatch(/export function cluster/)
})

test("INERT — the Stamp path does NOT import the correlation substrate (the substrate serves the render, not the statistics)", () => {
  for (const rel of ["src/studio/stamp.ts", "src/studio/adjudicate.ts", "src/studio/lineage.ts"]) {
    const src = readFileSync(path.join(PKG_ROOT, rel), "utf8")
    expect(src).not.toMatch(/from ["'].*analytics\/correlate/) // no import of the substrate
    expect(src).not.toMatch(/\bCorrelate\./) // no use of it
    expect(src).not.toMatch(/effectiveK/) // K never reaches the Stamp
  }
})

test("INERT — the K-ACTIVATION gate is LOCKED: a K-feed is REFUSED without BOTH the trigger AND the Operator's D33 pen", () => {
  // neither → refused
  expect(() => Correlate.activateKIntoStamp(3, { triggerFired: false, operatorSignedD33: false })).toThrow(/K-ACTIVATION REFUSED|familyN stays 1/i)
  // only the trigger (no pen) → refused
  expect(() => Correlate.activateKIntoStamp(3, { triggerFired: true, operatorSignedD33: false })).toThrow(/REFUSED/i)
  // only the pen (no trigger) → refused
  expect(() => Correlate.activateKIntoStamp(3, { triggerFired: false, operatorSignedD33: true })).toThrow(/REFUSED/i)
  // BOTH (the pre-designed future act) → returns K — proving the gate isn't vacuous, only LOCKED today (both are false in prod)
  expect(Correlate.activateKIntoStamp(3, { triggerFired: true, operatorSignedD33: true })).toBe(3)
})

test("INERT — the pins record the inert guarantee (familyN===1 in every Stamp output) + the activation needs both trigger and pen", () => {
  const cv = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "coverage-pins.json"), "utf8"))
  expect(cv.xCorrelate.d_deflationInert.rule).toMatch(/familyN === 1/)
  expect(cv.xCorrelate.d_deflationInert.rule).toMatch(/REFUSED/i)
  expect(cv.xCorrelate.e_activationGate.gateVerbatim).toMatch(/ONLY when BOTH .* AND the Operator signs/i)
})
