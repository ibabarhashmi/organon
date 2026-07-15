/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 3 wall (S158): THE GUARD'S REAL NUMBER. NO NEW LAW.
 *
 * W-SH08 — K-6: six sprints of guardEfficacy: UNJUDGEABLE, twice remedied by promising to say it LOUDER — and louder is not
 * a mechanism. MUTATION TESTING seeds X-MANIFEST's own banned-output list (V31) into the render path and runs the ONE GUARD:
 * guardEfficacy = caught/seeded, a RAW fraction and a LOWER BOUND (RP-5), with every uncaught mutation NAMED and routed. The
 * mutation test found a REAL hole (a superlative over-claim) — the number working, not a rigged 15/15 (A7: a number that can
 * embarrass you is worth having).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Guard } from "../../src/organon/guard"

const shipPins = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "ship-pins.json"), "utf8"))
const manifestPins = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "manifest-pins.json"), "utf8"))

test("S158 (W-SH08) — guardEfficacy is a RAW FRACTION (caught/seeded), a VALUE not a promise (K-6)", () => {
  const r = Guard.mutationRate()
  expect(r.rate).toMatch(/^\d+\/\d+$/) // "10/17" — a number, not "UNJUDGEABLE" / "said louder"
  expect(r.caught).toBe(10) // VARIANT V41 (S162, L-2): 8→10 — the superlative rule closes the genuine hole AND upgrades a "rankings…top to bottom" mutation from sibling-covered to advice-caught
  expect(r.seeded).toBe(17)
  expect(r.caught).toBeLessThan(r.seeded) // still NOT a rigged 17/17 on the ADVICE guard alone — the bound stays honest (RP-5)
})

test("S158 (W-SH08) — the catalogue IS X-MANIFEST's banned-output list, quoted from V31 (DD-63; not invented — A7)", () => {
  const cat = Guard.catalogue()
  const banned = manifestPins.xManifest.a_declarativeOnly.bannedOutputs as string[]
  // every banned OUTPUT shape appears (as a substring) in at least one seeded mutation — the list IS the test
  for (const b of banned) {
    // singular/plural tolerance: match on the stem
    const stem = b.replace(/s$/, "")
    expect(cat.some((m) => m.toLowerCase().includes(stem.toLowerCase()) || m.toLowerCase().includes(b.toLowerCase()))).toBe(true)
  }
})

test("S158 (W-SH08) — the LOWER-BOUND caveat is printed WITH the number, ALWAYS (RP-5 — seeded negative)", () => {
  const r = Guard.mutationRate()
  expect(r.lowerBoundCaveat).toMatch(/LOWER BOUND/)
  expect(r.lowerBoundCaveat).toMatch(/not the space of advice/)
  // the committed artifact carries the caveat beside the number (a guardEfficacy WITHOUT it would be a Halt)
  const art = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "guard-efficacy.json"), "utf8"))
  expect(art.header).toMatch(/LOWER BOUND/)
  expect(art.guardEfficacy).toBe(r.rate)
})

test("S158 (W-SH08) — EVERY uncaught mutation is a NAMED HOLE, routed to the gate (nothing dropped silently)", () => {
  const r = Guard.mutationRate()
  // the advice guard misses 7 (all sibling-covered, banned-shape declaratives); each is named with WHERE it is covered
  expect(r.holes.length).toBe(r.seeded - r.caught)
  for (const h of r.holes) { expect(h.mutation.length).toBeGreaterThan(0); expect(h.note.length).toBeGreaterThan(0); expect(h.coveredBy).toBeTruthy() }
  // VARIANT V41 (S162, L-2): the ONE genuine hole V40 named (the superlative) is CLOSED — 0 genuine holes now; full layer 17/17
  expect(r.genuineHoles.length).toBe(0)
  expect(r.fullLayerCaught).toBe(r.seeded) // 17/17 — every mutation caught by SOME guard
})

test("S158 (W-SH08) — the transcript corpus is the SECOND, WEAKER measure (a different lab; a sample, not a proof)", () => {
  const r = Guard.mutationRate()
  expect(r.corpus.baits).toBeGreaterThanOrEqual(10) // the frozen R-1 corpus
  expect(r.corpus.note).toMatch(/SAMPLE, not a proof|second, weaker/)
})

test("S158 (W-SH08) — the number is DETERMINISTIC: two runs, identical (no LLM in the loop)", () => {
  expect(JSON.stringify(Guard.mutationRate())).toBe(JSON.stringify(Guard.mutationRate()))
})
