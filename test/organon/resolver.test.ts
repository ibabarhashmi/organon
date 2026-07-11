/**
 * ORGΛNON — THE PRECISION SPRINT, Phase 2 wall (RESOLVER-TRUE — the pure logic). The CONSERVATIVE classifier, the
 * canonical-collapse WHITELIST, and the one-line grammar (src/contract/governance.ts) — proven on synthetic controls,
 * no network. The classifier NEVER labels an unknown admin Safe/timelock (a fabricated reassurance) and NEVER reads a
 * ZERO slot as EOA (a fabricated alarm); the collapse folds ONLY canonical-fingerprint findings on a gated admin, and
 * the S58 seed (an ungated upgrade + EOA admin) SURVIVES because nothing folds when the admin is not gated.
 */
import { test, expect } from "bun:test"
import { Governance } from "../../src/contract/governance"

const base: Governance.AdminProbe = { adminAddr: null, adminCodePresent: false, isSafe: false, isTimelock: false, ownerAddr: null, ownerCodePresent: false, ownerIsSafe: false, ownerIsTimelock: false }

test("CLASSIFIER (S59) — a ZERO admin slot is UNRESOLVED, NEVER EOA (the anti-cry-wolf rule; aave/spark immutable admin)", () => {
  const r = Governance.classifyAdmin({ ...base, adminAddr: null })
  expect(r.adminClass).toBe("UNRESOLVED")
  expect(r.how).toMatch(/never EOA|off-slot\/immutable/i)
})

test("CLASSIFIER — a NON-ZERO admin with empty code is EOA (a single key — the damning case)", () => {
  const r = Governance.classifyAdmin({ ...base, adminAddr: "0x1111111111111111111111111111111111111111", adminCodePresent: false })
  expect(r.adminClass).toBe("EOA")
  expect(r.how).toMatch(/single key/i)
})

test("CLASSIFIER (S59) — a Safe-LOOKALIKE (contract-sized, wrong pattern, no owner match) classifies UNRESOLVED, NOT SAFE", () => {
  // right code-size, but getThreshold/getOwners did NOT both respond and no owner-hop resolved → conservative UNRESOLVED
  const r = Governance.classifyAdmin({ ...base, adminAddr: "0x2222222222222222222222222222222222222222", adminCodePresent: true, isSafe: false, isTimelock: false, ownerAddr: null })
  expect(r.adminClass).toBe("UNRESOLVED")
  expect(r.how).toMatch(/never labeled Safe on a guess|EOA-grade caution/i)
})

test("CLASSIFIER — a real Safe → SAFE; a real timelock → TIMELOCK; only on a POSITIVE pattern match", () => {
  expect(Governance.classifyAdmin({ ...base, adminAddr: "0x3333333333333333333333333333333333333333", adminCodePresent: true, isSafe: true }).adminClass).toBe("SAFE")
  expect(Governance.classifyAdmin({ ...base, adminAddr: "0x4444444444444444444444444444444444444444", adminCodePresent: true, isTimelock: true }).adminClass).toBe("TIMELOCK")
})

test("CLASSIFIER — the owner-hop: a Timelock owner → TIMELOCK; a BARE-EOA owner → EOA (the damning case one hop out)", () => {
  const tl = Governance.classifyAdmin({ ...base, adminAddr: "0x5555555555555555555555555555555555555555", adminCodePresent: true, ownerAddr: "0x6666666666666666666666666666666666666666", ownerCodePresent: true, ownerIsTimelock: true })
  expect(tl.adminClass).toBe("TIMELOCK")
  expect(tl.how).toMatch(/via owner/i)
  const eoaOwner = Governance.classifyAdmin({ ...base, adminAddr: "0x7777777777777777777777777777777777777777", adminCodePresent: true, ownerAddr: "0x8888888888888888888888888888888888888888", ownerCodePresent: false })
  expect(eoaOwner.adminClass).toBe("EOA")
  expect(eoaOwner.how).toMatch(/one hop out|single key controls the upgrade admin/i)
})

const F = (detail: string) => ({ detail })
const CANON = [
  F("upgradeTo looks like an upgrade entrypoint without an auth signal"),
  F("d.delegatecall — delegatecall (into attacker-controlled code if the target is mutable)"),
  F("upgradeable contract without a storage gap — a future upgrade can collide with existing slots"),
]
const REAL_SIGNAL = F("swap(): state mutates after an external call (a reentrancy window — effects-after-interaction)")

test("COLLAPSE — on a canonical proxy with a GATED admin, canonical fingerprints fold; a real non-canonical finding SURVIVES (a whitelist, not a compressor)", () => {
  const c = Governance.collapse([...CANON, REAL_SIGNAL], true, "TIMELOCK")
  expect(c.collapsed).toBe(true)
  expect(c.foldedCount).toBe(3)
  expect(c.survivors).toHaveLength(1)
  expect(c.survivors[0].detail).toMatch(/reentrancy window/)
})

test("COLLAPSE (S58 — the gravest wall) — an ungated upgrade + EOA admin: NOTHING folds, the finding SURVIVES itemized", () => {
  const ungated = F("upgradeTo looks like an upgrade entrypoint without an auth signal")
  const c = Governance.collapse([ungated], true /* canonical bytecode */, "EOA")
  expect(c.collapsed).toBe(false) // adminGated is false → the fold's reassurance is FALSE
  expect(c.foldedCount).toBe(0)
  expect(c.survivors).toHaveLength(1)
  expect(c.survivors[0]).toBe(ungated)
})

test("COLLAPSE — UNRESOLVED admin and non-canonical patterns never fold (context absent)", () => {
  expect(Governance.collapse(CANON, true, "UNRESOLVED").collapsed).toBe(false)
  expect(Governance.collapse(CANON, false, "TIMELOCK").collapsed).toBe(false)
})

test("GRAMMAR — the three pinned forms (gated / EOA-damning / unresolved-caution)", () => {
  const a = (adminClass: Governance.AdminClass, adminAddr: string | null): Governance.Artifact => ({ subject: "x", block: "1", implementation: "0xabc", pattern: "EIP-1967", canonicalMatch: true, adminSlotValue: "0x0", adminAddr, adminClass, how: "", probes: {}, contentSha: "0" })
  expect(Governance.governanceLine(a("TIMELOCK", "0x1111111111111111111111111111111111111111"))).toMatch(/Upgrade path gated; verify the signers/)
  expect(Governance.governanceLine(a("EOA", "0x2222222222222222222222222222222222222222"))).toMatch(/A single key can replace this contract's logic/)
  expect(Governance.governanceLine(a("UNRESOLVED", null))).toMatch(/not in the standard EIP-1967 slot — unresolved; treat with EOA-grade caution/)
})
