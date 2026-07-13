/**
 * ORGΛNON — THE RECKONING SPRINT, Phase 0 wall (PINS-LOCKED). reckon-pins.json is self-consistent, carried from the Cadence
 * head (d90df3c7), and pins every X-RECKON contract + the four blocking red-team re-pins (RP-1..RP-4) BEFORE the product
 * code: the act taxonomy, the SEARCH-only trigger + its deflation rationale + citations, the one-time migration, the shape
 * guard's two-sided obligation, the every-sink audit, the shed order, D43-D45, MR6/MR7, the walls, the operating bounds, and
 * THE HALT CONDITION. The one golden move is bound to the live constant here. The lock bites: a moved pin moves the sha.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reality } from "../../src/studio/reality"
import { VoiceGates } from "../../src/ask/gates"
import { AdviceShape } from "../../src/ask/advice"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const rk = JSON.parse(readFileSync(path.join(H, "reckon-pins.json"), "utf8"))
const CADENCE = JSON.parse(readFileSync(path.join(H, "cadence-pins.json"), "utf8"))

test("RECKON — the pins hash-lock is self-consistent + carried from the Cadence head (a moved pin moves the sha)", () => {
  const { pinsSha, ...rest } = rk
  expect(sha256(JSON.stringify(rest))).toBe(rk.pinsSha) // self-consistent
  expect(rk.carriedFromPinsSha).toBe(CADENCE.pinsSha) // carried forward, never rebuilt
  expect(rk.carriedFromPinsSha).toBe("d90df3c767aa6d4c95b07b0470afa37c97f3b35cea75ac619ce501426fd4877a")
  // POSITIVE CONTROL: dropping a hole line moves the sha — the lock bites
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.rePins.RP1_guardTwoSided.theHoleClosed = []
  expect(sha256(JSON.stringify(mutated))).not.toBe(rk.pinsSha)
})

test("RECKON — X-RECKON mints ONE law with five clauses (derived · changed-is-search · trigger-counts-search · migration · never-retag)", () => {
  const x = rk.xReckon
  expect(x.a_derivedNeverDeclared.rule).toMatch(/DERIVED, NEVER DECLARED/i)
  expect(x.b_changedIsSearch.actTaxonomy.registration).toBe("SEARCH")
  expect(x.b_changedIsSearch.actTaxonomy["cadence-cycle"]).toBe("OBSERVATION")
  expect(x.c_triggerCountsSearchOnly.rule).toMatch(/COUNTS SEARCH ONLY/i)
  expect(x.c_triggerCountsSearchOnly.deflationRationale).toMatch(/SELECTION OVER HYPOTHESES/i)
  expect(x.c_triggerCountsSearchOnly.citations).toMatch(/Harvey|White|López de Prado/)
  expect(x.d_oneTimeMigration.rule).toMatch(/realLineageCount === 0/)
  expect(x.e_realNeverRetagged.rule).toMatch(/NEVER BE RE-TAGGED/i)
  expect(rk.carried.lawsThisSprint).toMatch(/ONE \(X-RECKON\)/)
})

test("RECKON — the four blocking red-team RE-PINS are all present (RP-1 two-sided · RP-2 real defined · RP-3 every sink · RP-4 shed order)", () => {
  expect(rk.rePins.RP1_guardTwoSided.aLoosening_enumeratedAndJustified.length).toBe(2) // each loosening enumerated + justified
  expect(rk.rePins.RP1_guardTwoSided.theHoleClosed.length).toBeGreaterThanOrEqual(5)
  expect(rk.rePins.RP2_realDefined.fixtureIds.length).toBe(2)
  expect(rk.rePins.RP3_everySink.rule).toMatch(/EVERY SINK/i)
  expect(rk.rePins.RP3_everySink.rule).toMatch(/prompt-injection vector/i)
  expect(rk.rePins.RP4_shedOrder.rule).toMatch(/Phase 1 \(the taxonomy\) NEVER sheds/i)
  expect(rk.rePins.RP4_shedOrder.rule).toMatch(/Phase 2 \(the guard\) sheds/i)
})

test("RECKON — the ONE golden move is bound to the live constant: the affordance line WITHOUT the period is Reality.AFFORDANCE_LINE", () => {
  expect(rk.goldenMove.affordanceLineNew).toBe(Reality.AFFORDANCE_LINE) // the live line IS the reckon pin (supersedes cadence)
  expect(Reality.AFFORDANCE_LINE.endsWith("buy")).toBe(true) // the period is gone
  expect(AdviceShape.detect(Reality.AFFORDANCE_LINE).advice).toBe(false) // and the shape guard passes it WITHOUT the period
  expect(rk.goldenMove.shelfGoldenMoved["shelf-sample"].new).toBe("66c9c75ba0d1a91c") // the measured move
})

test("RECKON — D43-D45 present + all operatorSigned=false (LN5); D27 STILL first (8th sprint); MR6/MR7; walls S80-S86c; bounds; HALT", () => {
  for (const d of ["D43", "D44", "D45"]) expect(rk.deviations[d]).toBeTruthy()
  expect(rk.deviations.D44).toMatch(/DV4.*RETIRED/i)
  expect(rk.deviations.operatorGatedNote).toMatch(/D27 STILL FIRST/i)
  expect(rk.deviations.operatorGatedNote).toMatch(/NEVER signs it \(LN5\)/i)
  expect(rk.deviations.deviationOrderAppend).toEqual(["D43", "D44", "D45"])
  expect(rk.mr6).toMatch(/phase-reorder/i)
  expect(rk.mr7).toMatch(/7 new \+ 2 modified/i)
  for (const w of ["S80", "S81", "S82", "S83", "S84", "S85", "S86", "S86b", "S86c"]) expect(rk.walls[w]).toBeTruthy()
  expect(rk.walls.count).toBe(86)
  expect(rk.operatingBounds.positionsPerManifest).toBe(50)
  expect(rk.haltCondition).toMatch(/VALIDATION-ONLY/i)
})

test("RECKON — the carried constitution is byte-untouched (deps/screens/kill/differential/bundle); single-repo; one law", () => {
  expect(rk.carried.deps).toEqual(["hono", "zod"])
  expect(rk.carried.screens).toEqual(["shelf", "reality-check", "ask"])
  expect(rk.carried.killCriterion).toBe("8b4e094b")
  expect(rk.carried.evidenceBundleShaPrefix).toBe("9c1e7bd8")
  expect(rk.carried.verdictDifferential.lendingFpSetShaPrefix).toBe("70c7912f")
  expect(rk.carried.repoTopology).toMatch(/SINGLE REPO/i)
})
