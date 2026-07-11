/**
 * ORGΛNON — THE GROUND-TRUTH SPRINT, Phase 3 wall (IMMUTABLE-PROVEN; X-GROUNDTRUTH b, D30, S62). The fifth class IMMUTABLE
 * is granted ONLY on the three-condition bytecode-constant proof (impl a deployed-bytecode constant · the 1967 impl slot
 * unused · no admin-slot write path), ALL-OR-NOTHING. The DISGUISED-MUTABLE control (an embedded-looking constant PLUS a
 * live SSTORE-to-1967 write path) MUST classify UNRESOLVED — a fabricated "no upgrade path" is stronger poison than a wrong
 * SAFE. On a proven IMMUTABLE the collapse folds the proxy-MACHINERY (inert by proof) while business findings SURVIVE and
 * are PERMANENT (the render states it). aave is re-run through the proof and STAYS UNRESOLVED (its impl is in the 1967 slot
 * — upgradeable; truth over trophy). The frozen invariants hold (the governance line incl. IMMUTABLE is info/context).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Governance } from "../../src/contract/governance"
import { Reality } from "../../src/studio/reality"

const G = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "groundtruth-pins.json"), "utf8"))
const readJ = (rel: string) => JSON.parse(readFileSync(path.join(PKG_ROOT, rel), "utf8"))
const baseAdmin: Governance.AdminProbe = { adminAddr: null, adminCodePresent: false, isSafe: false, isTimelock: false, ownerAddr: null, ownerCodePresent: false, ownerIsSafe: false, ownerIsTimelock: false }

test("S62 (all-or-nothing) — IMMUTABLE requires ALL THREE conditions; each falsified individually → NOT immutable", () => {
  expect(Governance.proveImmutable({ implEmbeddedInCode: true, implSlotZero: true, noWritePath: true }).immutable).toBe(true)
  expect(Governance.proveImmutable({ implEmbeddedInCode: false, implSlotZero: true, noWritePath: true }).immutable).toBe(false)
  expect(Governance.proveImmutable({ implEmbeddedInCode: true, implSlotZero: false, noWritePath: true }).immutable).toBe(false)
  expect(Governance.proveImmutable({ implEmbeddedInCode: true, implSlotZero: true, noWritePath: false }).immutable).toBe(false)
  // the how-string names the exact failing condition (legible refusal)
  expect(Governance.proveImmutable({ implEmbeddedInCode: true, implSlotZero: false, noWritePath: true }).how).toMatch(/1967 impl slot is in use|upgradeable/i)
})

test("S62 (the DISGUISE control BITES) — an embedded-looking constant + zero slot + a live SSTORE write path → UNRESOLVED, never IMMUTABLE", () => {
  const x = readJ("data/honesty/governance/fixtures/disguised-mutable.json")
  const probe = Governance.probeImmutability(x.proxyCode, x.resolvedImpl, x.implSlotZero)
  expect(probe.implEmbeddedInCode).toBe(true) // condition 1 passes (the disguise)
  expect(probe.implSlotZero).toBe(true) // condition 2 passes (the disguise)
  expect(probe.noWritePath).toBe(false) // condition 3 FAILS — the SSTORE-to-1967 write path is the tell
  expect(Governance.classify(probe, baseAdmin).adminClass).not.toBe("IMMUTABLE")
})

test("S62 (the positive control) — a genuine EIP-1167 clone (impl embedded, slot unused, no SSTORE) → IMMUTABLE", () => {
  const x = readJ("data/honesty/governance/fixtures/immutable-clone.json")
  const probe = Governance.probeImmutability(x.proxyCode, x.resolvedImpl, x.implSlotZero)
  expect(probe).toEqual({ implEmbeddedInCode: true, implSlotZero: true, noWritePath: true })
  expect(Governance.classify(probe, baseAdmin).adminClass).toBe("IMMUTABLE")
})

test("S62 (business SURVIVES + PERMANENT) — the IMMUTABLE collapse folds proxy-machinery only; a business finding survives with the permanence note", () => {
  const machinery = { detail: "fallback delegatecall present", category: "upgrade-proxy-hazard", contract: "Proxy" }
  const business = { detail: "withdraw(uint256): state mutates after an external call (a reentrancy window)", category: "reentrancy-value-flow", contract: "Vault" }
  const col = Governance.collapse([machinery, business], true, "IMMUTABLE")
  expect(col.collapsed).toBe(true)
  expect(col.foldedCount).toBe(1) // the machinery folds (inert by proof)
  expect(col.survivors.map((s) => s.contract)).toEqual(["Vault"]) // the business finding survives
  // the render states the permanence
  const rc = Reality.realityCheck("defillama:pool:7da72d09-56ca-4ec5-a45f-59114353e487", Date.parse("2026-07-05T00:00:00Z"))!
  const immArt: Governance.Artifact = { subject: "c", block: "123", implementation: "0x1111111111111111111111111111111111111111", pattern: "EIP-1167 clone", canonicalMatch: true, adminSlotValue: "0x0", adminAddr: null, adminClass: "IMMUTABLE", how: "", probes: {}, contentSha: "0" }
  const bundle: Governance.RenderBundle = { artifact: immArt, line: Governance.governanceLine(immArt), impl: { subject: "c", implementation: immArt.implementation, provenance: "REAL", verified: true, findings: [machinery, business], contentSha: "0" } }
  const html = Reality.renderRealityCheck(rc.name, rc.scored, rc.history, "x", [], bundle)
  expect(html).toMatch(/no upgrade path exists; the proxy machinery is inert/) // the IMMUTABLE grammar line
  expect(html).toMatch(/provably INERT|folded BY PROOF/) // machinery folded by proof
  expect(html).toMatch(/PERMANENT: no patch can reach an immutable implementation/) // the permanence note
  expect(html).toContain("a reentrancy window") // the business finding survives itemized
})

test("PROVEN-OR-UNRESOLVED (aave, truth over trophy) — aave is re-run through the proof and STAYS UNRESOLVED (its impl is in the 1967 slot — upgradeable)", () => {
  const proof = readJ("data/honesty/governance/immutable-proof.json")
  const aave = proof.subjects.find((s: { subject: string }) => s.subject === "aave-v3-pool")
  expect(aave.immutable).toBe(false)
  expect(aave.probe.implSlotZero).toBe(false) // the impl IS read from the 1967 slot → upgradeable
  // the honest divergence recorded: NO live shelf subject is immutable (the class is extinct-on-shelf)
  expect(proof.census.immutable).toEqual([])
  expect(proof.honestFinding).toMatch(/aave.*upgradeable|conflated an immutable ADMIN|extinct-on-shelf/i)
  // the controls are recorded (clone IMMUTABLE, disguise refused)
  expect(proof.controls.find((c: { fixture: string }) => c.fixture === "immutable-clone").immutable).toBe(true)
  expect(proof.controls.find((c: { fixture: string }) => c.fixture === "disguised-mutable").immutable).toBe(false)
})

test("CLASS — IMMUTABLE supersedes the admin class + ranks at the strong end; a non-immutable falls through to the conservative admin classifier", () => {
  // IMMUTABLE supersedes: even a (hypothetical) EOA-looking admin is moot if the logic cannot be swapped
  const eoaAdmin: Governance.AdminProbe = { ...baseAdmin, adminAddr: "0x1111111111111111111111111111111111111111", adminCodePresent: false }
  expect(Governance.classify({ implEmbeddedInCode: true, implSlotZero: true, noWritePath: true }, eoaAdmin).adminClass).toBe("IMMUTABLE")
  expect(Governance.classify({ implEmbeddedInCode: true, implSlotZero: false, noWritePath: true }, eoaAdmin).adminClass).toBe("EOA") // not immutable → admin decides
  expect(Governance.governanceRank("IMMUTABLE")).toBeGreaterThan(Governance.governanceRank("TIMELOCK"))
  expect(Governance.classifyAdmin).toBeDefined() // the conservative admin classifier is unchanged
})

test("FROZEN — the verdict-path 7 + frozen-core 2 are byte-unchanged (the IMMUTABLE class is render-layer info/context; D30 parked)", () => {
  for (const [rel, want] of Object.entries(G.verdictPathHashes as Record<string, string>)) {
    expect(createHash("sha256").update(readFileSync(path.join(PKG_ROOT, rel), "utf8")).digest("hex"), `${rel} moved`).toBe(want)
  }
  for (const [rel, want] of Object.entries(G.frozenCoreHashes as Record<string, string>)) {
    expect(createHash("sha256").update(readFileSync(path.join(PKG_ROOT, rel), "utf8")).digest("hex"), `${rel} moved`).toBe(want)
  }
})
