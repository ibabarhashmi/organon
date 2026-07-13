/**
 * ORGΛNON — THE CADENCE SPRINT, Phase 0 wall (PINS-LOCKED). cadence-pins.json is self-consistent, carried from the Manifest
 * head (98a44bd8), and pins every X-CADENCE + X-AUTHOR contract BEFORE the product code: the two laws' clauses verbatim, the
 * fired-exit + delta grammars, the banned instruction/urgency shapes, the Fact Envelope (authored:false structural), the door
 * copy (advice-wall-checked at pin time), MR2's affordance line, MR1's pre-pinned four, D39-D42 (all operatorSigned=false),
 * MR4/MR5, and S74-S79. The lock bites: a moved pin moves the sha.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { VoiceGates } from "../../src/ask/gates"
import { StrategyCompile } from "../../src/strategy/compile"
import { Reality } from "../../src/studio/reality"
import { FactEnvelope } from "../../src/strategy/envelope"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const cd = JSON.parse(readFileSync(path.join(H, "cadence-pins.json"), "utf8"))
const MANIFEST = JSON.parse(readFileSync(path.join(H, "manifest-pins.json"), "utf8"))

test("CADENCE — the pins hash-lock is self-consistent + carried from the Manifest head (a moved pin moves the sha)", () => {
  const { pinsSha, ...rest } = cd
  expect(sha256(JSON.stringify(rest))).toBe(cd.pinsSha) // self-consistent
  expect(cd.carriedFromPinsSha).toBe(MANIFEST.pinsSha) // carried forward, never rebuilt
  expect(cd.carriedFromPinsSha).toBe("98a44bd8970c96cc78a377f11ae7a6b779fd2cb8e7c2672093b4c404b53db084")
  // POSITIVE CONTROL: dropping an urgency shape from the banned list moves the sha — the lock bites
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.xCadence.a_readsNeverActs.bannedInstructionUrgencyShapes = ["exit now"]
  expect(sha256(JSON.stringify(mutated))).not.toBe(cd.pinsSha)
})

test("CADENCE — X-CADENCE mints the FIVE governing clauses (reads-never-acts · baseline · confirmed-boundary · trial-at-count · same-subject)", () => {
  const x = cd.xCadence
  expect(x.a_readsNeverActs.rule).toMatch(/READS, NEVER ACTS/i)
  expect(x.b_baselineFixedFrame.rule).toMatch(/FIXED FRAME/i)
  expect(x.b_baselineFixedFrame.hashIncludes).toMatch(/governance adminClass/i)
  expect(x.c_confirmedBoundary.rule).toMatch(/CONFIRMED BOUNDARY/i)
  expect(x.c_confirmedBoundary.grepWall).toMatch(/no setInterval/i)
  expect(x.d_everyCycleTrial.rule).toMatch(/recorded, never counted, PROVEN AT COUNT/i)
  expect(x.e_sameSubject.screens).toEqual(["shelf", "reality-check", "ask"])
})

test("CADENCE — X-AUTHOR mints the FIVE subordinate clauses (server-rendered · path-not-screen · refuses · authors-nothing · edit-is-repin)", () => {
  const x = cd.xAuthor
  expect(x.a_serverRendered.deps).toEqual(["hono", "zod"])
  expect(x.b_pathNotScreen.paths).toEqual(["/check/manifest:new", "/check/manifest:<id>/edit"])
  expect(x.c_refusesNeverCoerces.rule).toMatch(/REFUSES, NEVER COERCES/i)
  expect(x.d_authorsNothing.rule).toMatch(/AUTHORS NOTHING/i)
  expect(x.d_authorsNothing.esmaNote).toMatch(/¶61/)
  expect(x.e_editIsRepin.rule).toMatch(/DISCLOSED RE-PIN/i)
})

test("CADENCE — the FACT ENVELOPE is pinned (authored:false structural; the disclaimer passes the advice wall; the banned-shape list present)", () => {
  const fe = cd.factEnvelope
  expect(fe.shape.authored).toMatch(/STRUCTURAL/i)
  expect(fe.disclaimer).toBe(FactEnvelope.DISCLAIMER) // the code + the pin agree
  expect(VoiceGates.advicePattern(fe.disclaimer).advice).toBe(false)
  for (const s of ["rankings", "rebalance", "suggested allocation", "consider instead"]) expect(fe.bannedFactShapes).toContain(s)
})

test("CADENCE — the door copy is pinned AND passes guardLine + advicePattern; the MR2 affordance line is SUPERSEDED by Reckon (S78)", () => {
  // the door copy pins and the code still agree byte-for-byte
  expect(cd.doorCopy.newIntro).toBe(Reality.DOOR_NEW_INTRO)
  expect(cd.doorCopy.editIntro).toBe(Reality.DOOR_EDIT_INTRO)
  // every pinned string passes BOTH walls (the door authors nothing)
  const strings = [cd.mr2AffordanceLine.line, cd.doorCopy.newIntro, cd.doorCopy.editIntro, cd.doorCopy.exitHelp, cd.doorCopy.journalHelp, cd.doorCopy.refuseHead]
  for (const s of strings) {
    expect(VoiceGates.advicePattern(s).advice).toBe(false)
    expect(StrategyCompile.guardLine(s).ok).toBe(true)
  }
  // the CADENCE record is the HISTORICAL affordance pin (with the trailing period — the V32-era load-bearing full stop). The
  // LIVE line is now the RECKON pin (period removed — the shape guard no longer needs it); the live binding moved to
  // reckon_pins.test.ts. The cadence record is frozen and self-consistent (d90df3c7); it is NOT re-bound to the live constant.
  expect(cd.mr2AffordanceLine.line.endsWith("buy.")).toBe(true) // the historical record still carries the period
  expect(Reality.AFFORDANCE_LINE.endsWith("buy")).toBe(true) // the live line no longer does (the golden move)
  expect(Reality.AFFORDANCE_LINE).not.toBe(cd.mr2AffordanceLine.line) // superseded, not silently overwritten
})

test("CADENCE — D39-D42 present + all operatorSigned=false (LN5); D27 STILL first; MR4/MR5 discharged; walls S74-S79", () => {
  for (const d of ["D39", "D40", "D41", "D42"]) expect(cd.deviations[d]).toBeTruthy()
  expect(cd.deviations.D41).toMatch(/TWIN-LAW DEPARTURE/i)
  expect(cd.deviations.D41).toMatch(/SHED ORDER/i) // the pre-authorized shed
  expect(cd.deviations.operatorGatedNote).toMatch(/D27 STILL FIRST/i)
  expect(cd.deviations.operatorGatedNote).toMatch(/NEVER signs it \(LN5\)/i)
  expect(cd.deviations.deviationOrderAppend).toEqual(["D39", "D40", "D41", "D42"])
  expect(cd.mr4.entries.length).toBe(3)
  expect(Object.keys(cd.mr5.repos)).toEqual(["organon", "organon-studio", "studio-organon"])
  for (const w of ["S74", "S75", "S76", "S77", "S78", "S79"]) expect(cd.walls[w]).toBeTruthy()
  expect(cd.walls.count).toBe(79)
})

test("CADENCE — MR1's pre-pinned four are RESTATED (never swapped) + the carried constitution is byte-untouched", () => {
  expect(cd.mr1PrePinnedFour.subjects.some((s: string) => s.includes("ethena-usde"))).toBe(true)
  expect(cd.mr1PrePinnedFour.subjects.some((s: string) => s.includes("lido"))).toBe(true)
  expect(cd.mr1PrePinnedFour.subjects.some((s: string) => s.includes("gearbox"))).toBe(true)
  expect(cd.mr1PrePinnedFour.subjects.some((s: string) => s.includes("ondo-finance"))).toBe(true)
  expect(cd.carried.deps).toEqual(["hono", "zod"])
  expect(cd.carried.killCriterion).toBe("8b4e094b")
  expect(cd.carried.evidenceBundleShaPrefix).toBe("9c1e7bd8")
  expect(cd.carried.verdictDifferential.lendingFpSetShaPrefix).toBe("70c7912f")
  expect(cd.carried.verdictDifferential.fundingReproHashPrefix).toBe("0a63151b")
})
