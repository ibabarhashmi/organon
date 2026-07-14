/**
 * ORGΛNON — THE SHOWING SPRINT (V34), Phase 0 wall (PINS-LOCKED). show-pins.json is self-consistent, carried from the
 * Reckoning head (96469dbb), and pins every X-SHOWN clause + the marker schema + the build-log contract + the DD-1..DD-8
 * decisions + MR8 + D46/D47/D48 + walls S87-S92 + the re-pinned Halt + the deriveAct hash — BEFORE the product code.
 *
 * THE POSITIVE CONTROL IS SHOWN (B-6: V31 showed one, V33 did NOT — 'dropping a clause moves the sha'). Under X-SHOWN(a)
 * the pins wall does not merely assert self-consistency; it SHOWS the lock biting: a mutated X-SHOWN clause moves the sha.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const sp = JSON.parse(readFileSync(path.join(H, "show-pins.json"), "utf8"))
const RECKON = JSON.parse(readFileSync(path.join(H, "reckon-pins.json"), "utf8"))

test("SHOW Phase 0 — the pins hash-lock is self-consistent + carried from the Reckoning head (a moved pin moves the sha) — POSITIVE CONTROL SHOWN", () => {
  const { pinsSha, ...rest } = sp
  const recomputed = sha256(JSON.stringify(rest))
  expect(recomputed).toBe(sp.pinsSha) // self-consistent
  expect(sp.pinsSha).toBe("07d27f8116c7ce0e1883a89891eb5bfac0fecebc8731a131975d433bd4b830f9")
  expect(sp.carriedFromPinsSha).toBe(RECKON.pinsSha) // carried forward, never rebuilt
  expect(sp.carriedFromPinsSha).toBe("96469dbbfb40af89d11378092ae7cfc1eb320a83882e2d8523c1009dd6537f74")

  // POSITIVE CONTROL (B-6, X-SHOWN(a)) — mutate one X-SHOWN clause; the sha MUST move. Shown, not merely asserted.
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.xShown.a_everyClaimCarriesItsArtifact = "weakened"
  const movedSha = sha256(JSON.stringify(mutated))
  expect(movedSha).not.toBe(sp.pinsSha) // the lock bites
  // the OUTPUT of the control, shown (X-SHOWN(a) — carry the artifact): the pin and the mutated sha differ in the record
  expect({ pinned: sp.pinsSha.slice(0, 8), mutated: movedSha.slice(0, 8), moved: movedSha !== sp.pinsSha }).toEqual({ pinned: "07d27f81", mutated: movedSha.slice(0, 8), moved: true })
})

test("SHOW Phase 0 — X-SHOWN mints ONE law with five clauses (carry-artifact · unshown-not-held · no-hash-no-end · measured-or-declared · survives-environment)", () => {
  const x = sp.xShown
  expect(x.a_everyClaimCarriesItsArtifact).toMatch(/CARRIES ITS ARTIFACT/i)
  expect(x.b_unshownIsNotHeld).toMatch(/NOT HELD/i)
  expect(x.c_noHashNoEnd).toMatch(/DOES NOT END IN A HASH DID NOT END/i)
  expect(x.d_measuredOrDeclaredUnmeasured).toMatch(/FALSIFIABLE/i)
  expect(x.e_evidenceSurvivesEnvironment).toMatch(/SURVIVE THE ENVIRONMENT/i)
  expect(x.zeroCapability).toMatch(/constrains the agent, never the user/i)
  expect(sp.carried.lawsThisSprint).toMatch(/ONE \(X-SHOWN\)/)
  expect(sp.carried.newProductCapability).toBe(0) // the Halt
})

test("SHOW Phase 0 — the marker schema is declared with its required slots + the R-3 structural checks + the shown positive control", () => {
  expect(sp.markerSchema.rule).toMatch(/MACHINE-CHECKED/i)
  expect(sp.markerSchema.requiredSlots_perPhase).toContain("verifyCoverage")
  expect(sp.markerSchema.requiredSlots_terminal).toContain("treeHash")
  expect(sp.markerSchema.requiredSlots_terminal).toContain("commitSha")
  expect(sp.markerSchema.structuralChecks_R3.treeHash).toMatch(/re-derivable/i) // R-3: value, not presence
  expect(sp.markerSchema.structuralChecks_R3.verifyCoverage).toMatch(/N\/M/)
  expect(sp.markerSchema.positiveControl).toMatch(/Missing\[\]/)
})

test("SHOW Phase 0 — DD-1..DD-8 are recorded as DECISIONS (not questions); DD-1 call-site, DD-2 7/9 shrunk, DD-4 egress-open, DD-8 reuse realLineageCount", () => {
  const dd = sp.delegatedDecisions
  expect(dd.rule).toMatch(/decisions the agent WILL make/i)
  expect(dd.DD1_askOutputTrace.decision).toMatch(/DOWNSTREAM of the five VoiceGates/i)
  expect(dd.DD1_askOutputTrace.decision).toMatch(/D46.*NOT IMPLEMENTED/i)
  expect(dd.DD2_absentArtifacts.decision).toMatch(/7 of 9/i)
  expect(dd.DD2_absentArtifacts.decision).toMatch(/RWA-VERDICT\.md/)
  expect(dd.DD4_mr1Blocker.decision).toMatch(/NOTHING blocks it|egress is OPEN/i) // three sprints of a non-blocker, ended
  expect(dd.DD5_delimiterCollision.decision).toMatch(/CSPRNG/i)
  expect(dd.DD8_cyclesCounter.decision).toMatch(/realLineageCount/i) // R-5: reuse, do not invent
  expect(dd.DD8_cyclesCounter.decision).toMatch(/lie by aggregation/i)
})

test("SHOW Phase 0 — MR8 reconciles the loosening set to TWO; the deriveAct hash is pinned; walls S87-S92 declared", () => {
  expect(sp.mr8_looseningSetReconciled.loosenings.length).toBe(2) // DD-6: two, not three
  expect(sp.mr8_looseningSetReconciled.notANewLoosening).toMatch(/already passed the OLD substring matcher/i)
  expect(sp.s89_deriveActHash.hash).toBe("00e67ef8d05f144205f9c9cc098ff09768573680b866f3ad39dd665ff92afe20")
  for (const w of ["S87", "S88", "S89", "S90", "S91", "S92"]) expect(sp.walls[w]).toBeTruthy()
  expect(sp.walls.count).toBe(92)
  expect(sp.walls.S87).toMatch(/GREP WALL/i)
  expect(sp.walls.S87).toMatch(/REAL model output/i) // R-1 folded in
})

test("SHOW Phase 0 — D46 is CONDITIONAL + presented-not-implemented (LN5); D47 the law; D48 the console fix; D27 STILL first (9th sprint)", () => {
  expect(sp.deviations.D46).toMatch(/PRESENTED but NOT IMPLEMENTED|PRESENTED-NOT-IMPLEMENTED/i)
  expect(sp.deviations.D46).toMatch(/LN5/)
  expect(sp.deviations.D47).toMatch(/X-SHOWN mint/i)
  expect(sp.deviations.D48).toMatch(/supersedes the prior session's uncommitted F-1\.\.F-4/i)
  expect(sp.deviations.carried).toMatch(/D27 STILL FIRST — the NINTH sprint/i)
  expect(sp.deviations.carried).toMatch(/NEVER signs it \(LN5\)/i)
  expect(sp.deviations.deviationOrderAppend).toEqual(["D46", "D47", "D48"])
})

test("SHOW Phase 0 — the HALT is RE-PINNED not retired; the number goes first; the carried constitution is byte-untouched; ZERO golden moves", () => {
  expect(sp.haltRePinned.rule).toMatch(/RE-PINNED, NOT RETIRED/i)
  expect(sp.haltRePinned.rule).toMatch(/V35 is VALIDATION-ONLY TOO/i)
  expect(sp.haltRePinned.rule).toMatch(/WHETHER THE PRODUCT HAS A USER AT ALL/i)
  expect(sp.haltRePinned.killCriterion).toBe("8b4e094b")
  expect(sp.carried.deps).toEqual(["hono", "zod"])
  expect(sp.carried.screens).toEqual(["shelf", "reality-check", "ask"])
  expect(sp.carried.evidenceBundleShaPrefix).toBe("9c1e7bd8")
  expect(sp.carried.startingTree).toBe("eca71daf680c8a5df4b798433302d0e810755157")
  expect(sp.carried.frozenSevenNote).toMatch(/ZERO golden moves this sprint/i) // no verdict moves; the Reckoning golden already landed
})
