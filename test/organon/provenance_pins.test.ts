/**
 * ORGΛNON — THE PROVENANCE SPRINT (V42), Phase 0 wall (PINS-LOCKED). provenance-pins.json is self-consistent, carried from the
 * TRUE Variant head (eb64cebe — READ FROM DISK, not the blueprint's stale prose which named c0777d9a), and pins — BEFORE the
 * Phase code — every contract of V42: the identity gate (S169–S174, D84), the carried-claim audit (S170/RP-2), the REAL★
 * capture engine (S175–S177, D85/D86, DD-76/77/78), the RETROSPECTIVE boundary (S178, RP-4), the real capture window (S179),
 * D84–D86 + D80–D83 (Operator-signed=false), MR13 (seventh sprint), MR20, the shed order; NO NEW LAW (SEVENTH sprint); deps 2;
 * screens 3; familyN 1.
 *
 * POSITIVE CONTROL SHOWN: a mutated contract word moves the sha. The lock BITES. And the sprint's own first identity check:
 * the carried head is eb64cebe (the Variant head on disk), NEVER c0777d9a (V40 Ship's pin, the blueprint's mislabel) and
 * NEVER the phantom 22a34e0c the blueprint invented — the exact stale-but-shape-valid error this sprint exists to cure.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const pp = JSON.parse(readFileSync(path.join(H, "provenance-pins.json"), "utf8"))
const VARIANT = JSON.parse(readFileSync(path.join(H, "variant-pins.json"), "utf8"))

test("PROVENANCE Phase 0 — self-consistent + carried from the TRUE Variant head (a moved contract word moves the sha) — POSITIVE CONTROL", () => {
  const { pinsSha, ...rest } = pp
  expect(sha256(JSON.stringify(rest))).toBe(pp.pinsSha)
  // the carry is READ FROM DISK — the sprint's first identity check (M-1's exact defect, refused at the source)
  expect(pp.carriedFromPinsSha).toBe(VARIANT.pinsSha)
  expect(pp.carriedFromPinsSha).toBe("eb64cebe435bc0797dd3752cef35afc36da3ff23230b2d69cd41b5f86c756d08")
  // NEVER the blueprint's stale/phantom values — those ARE the M-1 sin
  expect(pp.carriedFromPinsSha).not.toBe("c0777d9abc4138c6abc585cb40629d8ddde51eca1d40c2effa6f17a4f7fe5c4d") // V40 Ship's pin — the blueprint's mislabel
  expect(pp.chain).not.toMatch(/22a34e0c/) // the phantom the blueprint invented — matches no pins file on disk
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.plausibilityGateNote = "TAMPERED" // any moved contract word moves the sha
  expect(sha256(JSON.stringify(mutated))).not.toBe(pp.pinsSha)
})

test("PROVENANCE Phase 0 — the chain is GROUND TRUTH from disk (variant ← ship ← family ← …), not the blueprint's prose", () => {
  expect(pp.chain).toMatch(/eb64cebe \(Variant\) ← c0777d9a \(Ship\) ← 2c299b9e \(Family\)/)
  expect(pp.chainProvenanceNote).toMatch(/READ FROM variant-pins\.json ON DISK/)
  expect(pp.chainProvenanceNote).toMatch(/phantom 22a34e0c matching NO pins file/)
})

test("PROVENANCE Phase 0 — NO NEW LAW (a SEVENTH sprint): 17 laws, 0 minted; deps 2; screens 3; familyN 1; exit kinds 7", () => {
  expect(pp.noNewLaw.laws).toBe(17)
  expect(pp.noNewLaw.minted).toBe(0)
  expect(pp.noNewLaw.sprintsWithoutALaw).toBe(7)
  expect(pp.carried.deps).toEqual(["hono", "zod"])
  expect(pp.carried.screens.length).toBe(3)
  expect(pp.carried.familyN).toBe(1)
  expect(pp.carried.exitKinds).toBe(7)
  // the three under-applied laws, named — each V41 defect is an existing law under-applied
  for (const k of ["pinsShaIdentity", "generatedFieldEchoed", "batteryWrongBattery"]) expect(pp.noNewLaw.threeUnderApplied[k]).toBeTruthy()
  expect(pp.noNewLaw.threeUnderApplied.pinsShaIdentity).toMatch(/X-REACH\(a\)/)
})

test("PROVENANCE Phase 0 — the eight V41 audit findings carried by name (M1–M8), each with its V42 disposition", () => {
  for (const m of ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"]) {
    expect(pp.auditFindings[m]).toBeTruthy()
    expect(pp.auditFindings[m].length).toBeGreaterThan(60)
  }
  expect(pp.auditFindings.M1).toMatch(/pinsSha IS A PARENT'S/)
  expect(pp.auditFindings.M3).toMatch(/WRONG BATTERY/)
  expect(pp.auditFindings.M8).toMatch(/REAL★|captures NOTHING/)
})

test("PROVENANCE Phase 0 — DD-74: the pins-sha bug named (currentPins frozen at family-pins) and the fix (Pins.selfHash)", () => {
  const d = pp.delegatedDecisions.DD74
  expect(d.bug).toMatch(/currentPins\(\).*family-pins/)
  expect(d.bug).toMatch(/2c299b9e/)
  expect(d.fix).toMatch(/Pins\.selfHash\(\)/)
  expect(d.fix).toMatch(/two INDEPENDENT paths to the value/)
})

test("PROVENANCE Phase 0 — DD-75/RP-2: carried is legal only when re-verified; the D33 note is SPLIT (signability carried, false-fire recomputed)", () => {
  const d = pp.delegatedDecisions.DD75
  expect(d.rule).toMatch(/COMPUTED.*or carried:\{from, why, reverified\}/)
  expect(d.rule).toMatch(/a carry that would recompute differently is a LIE and REFUSES/)
  expect(d.d33NoteSplit).toMatch(/SIGNABILITY claim.*carried/)
  expect(d.d33NoteSplit).toMatch(/FALSE-FIRE reference — COMPUTED/)
})

test("PROVENANCE Phase 0 — DD-76/77/78: rate-space only, hand-encoded eth_call, deps 2, block-pinned re-derivable", () => {
  expect(pp.delegatedDecisions.DD76.aaveGetReserveDataSelector).toBe("0x35ea6a75")
  expect(pp.delegatedDecisions.DD77.deps).toBe(2)
  expect(pp.delegatedDecisions.DD77.rule).toMatch(/no ethers\/viem\/web3/)
  expect(pp.delegatedDecisions.DD77.rule).toMatch(/bun:sqlite/)
  expect(pp.delegatedDecisions.DD78.rule).toMatch(/block number is pinned.*RE-DERIVABLE/)
  expect(pp.delegatedDecisions.DD78.schema.observationFields).toContain("blockNumber")
  expect(pp.delegatedDecisions.DD78.schema.observationFields).toContain("contractCodeHash")
})

test("PROVENANCE Phase 0 — DD-77/RP-3: the plausibility gate is STRUCTURAL-only (−42% funding CHAINED, garbage REJECTED)", () => {
  expect(pp.phase3_captureEngine.s177).toMatch(/STRUCTURAL-only/)
  expect(pp.phase3_captureEngine.s177).toMatch(/−42% funding capture is CHAINED/)
  expect(pp.postImplementationRePins_partF.RP3_structuralNotEconomic).toMatch(/tests the ENCODING, never the ECONOMICS/)
})

test("PROVENANCE Phase 0 — DD-79/80: the capture verb feeds the false-fire own leg; no daemon; screens 3", () => {
  expect(pp.delegatedDecisions.DD79.rule).toMatch(/advances the own-capture window/)
  expect(pp.delegatedDecisions.DD79.rule).toMatch(/AGENT capture is AGENT-tier, quarantined/)
  expect(pp.delegatedDecisions.DD80.screens).toBe(3)
  expect(pp.delegatedDecisions.DD80.rule).toMatch(/no cron, no systemd unit, no suggested crontab line/)
})

test("PROVENANCE Phase 0 — Phase 1 identity walls S169–S174 each named; RP-1 pins frozen at Phase 0", () => {
  for (const s of ["s169", "s170", "s171", "s172", "s173", "s174"]) expect(pp.phase1_identityGate[s]).toBeTruthy()
  expect(pp.phase1_identityGate.s169).toMatch(/emitted pins-sha MUST equal sha256\(this sprint's pins file/)
  expect(pp.phase1_identityGate.s171).toMatch(/FULL battery/)
  expect(pp.phase1_identityGate.rp1).toMatch(/frozen at Phase 0/)
  expect(pp.phase1_identityGate.rp1).toMatch(/self-referential anchor/)
})

test("PROVENANCE Phase 0 — the shed order: 1,3,4 NEVER shed; then 5 first, 2 second", () => {
  expect(pp.shedOrder.neverShed).toEqual(["1_identityGate", "3_captureEngine", "4_retrospectiveBoundary"])
  expect(pp.shedOrder.shedOrderIfNeeded).toEqual(["5_captureWindow", "2_carriedAudit"])
})

test("PROVENANCE Phase 0 — walls S169–S179 pinned, each with a seeded negative + a W-tag; D84–D86 reserved (unsigned, LN5)", () => {
  for (const s of ["S169", "S170", "S171", "S172", "S173", "S174", "S175", "S176", "S177", "S178", "S179"]) {
    expect(pp.walls[s]).toBeTruthy()
    expect(pp.walls[s]).toMatch(/W-PR\d\d/) // every new wall carries a mint-time W-tag origin (S108/S155)
  }
  for (const d of ["D84", "D85", "D86"]) {
    expect(pp.deviations[d]).toMatch(/Operator-signed=false/)
  }
  // LN5 — the gravest Halt is naming it; D27 STILL FIRST, the SEVENTEENTH sprint
  expect(pp.deviations.operatorGatedNote).toMatch(/NEVER signs it \(LN5\)/)
  expect(pp.deviations.operatorGatedNote).toMatch(/SEVENTEENTH sprint/)
  expect(pp.deviations.mr13).toMatch(/SEVENTH sprint/)
  expect(pp.deviations.mr20).toMatch(/D80–D83.*D84–D86/)
})

test("PROVENANCE Phase 0 — PART A′ (A1–A6) + PART F (RP1–RP6, F7, F8) recorded", () => {
  for (const a of ["A1_fatalRecursion", "A2_carriedIsLoophole", "A3_handEncodedIsBugFarm", "A4_scopeCreepToDataPlatform", "A5_emptyArchiveForever", "A6_noLawForAPipeline"]) {
    expect(pp.adversarialRecord_partA[a]).toBeTruthy()
  }
  for (const r of ["RP1_pinsFrozenAtPhase0", "RP2_ownInputsNotTransitive", "RP3_structuralNotEconomic", "RP4_deFiLlamaSmokeTest", "RP5_contractVersionPinned", "RP6_honestAtEveryLength", "F7_performance", "F8_cannotAnswer"]) {
    expect(pp.postImplementationRePins_partF[r]).toBeTruthy()
  }
})
