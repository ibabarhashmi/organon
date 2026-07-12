/**
 * ORGΛNON — THE COVERAGE SPRINT, Phase 1 wall: the Ground-Truth findings GT1–GT5 are CLOSED.
 *  GT1 — the flagship governance wording is precise: aave (impl in the 1967 slot → upgradeable) NEVER renders "Immutable"
 *        / "fixed" / "no upgrade path"; a genuinely-immutable subject DOES; the render decides by the proof, never the wish.
 *  GT2 — the voc_proposer scipy-sidecar tests carry an explicit load-tolerant per-test budget (the asterisk dies).
 *  GT3 — IN2 gains "read compound's real-source findings in the Pro drawer — does impl-truth help a human?".
 *  GT4 — D30's countersign gains the arms-for-a-future-subject note (zero current qualifiers).
 *  GT5 — the invite package LEADS with the PAID Network rug capture.
 *  + D32/D33 reserved (Operator-signed=false — LN5).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Governance } from "../../src/contract/governance"

const H = path.join(PKG_ROOT, "data", "honesty")
const cv = JSON.parse(readFileSync(path.join(H, "coverage-pins.json"), "utf8"))
const pkg = JSON.parse(readFileSync(path.join(H, "coverage-countersign-package.json"), "utf8"))

// a minimal Artifact for the governance-line render (governanceLine reads pattern/adminAddr/adminClass/block)
function artifact(adminClass: Governance.AdminClass, immutable: Governance.ImmutableProof): Governance.Artifact {
  return {
    subject: "aave-v3 USDC", block: "23000000", implementation: "0x1111111111111111111111111111111111111111",
    pattern: "EIP-1967 transparent", canonicalMatch: true, adminSlotValue: "0x0", adminAddr: null,
    adminClass, how: immutable.how, probes: {}, immutable, contentSha: "sha", synthetic: true,
  }
}

test("GT1 — aave holds the impl in the 1967 slot → NOT provably immutable; classify never returns IMMUTABLE; the governance line renders UPGRADEABLE, never 'immutable/fixed/no upgrade path'", () => {
  // aave's shape: an impl embedded-looking constant BUT the 1967 impl slot is IN USE (implSlotZero=false → upgradeable)
  const aaveProof = Governance.proveImmutable({ implEmbeddedInCode: true, implSlotZero: false, noWritePath: true })
  expect(aaveProof.immutable).toBe(false) // the proof decides: an in-use 1967 slot means upgradeable
  expect(aaveProof.how).toMatch(/1967 impl slot is in use|upgradeable/i)
  // classify → the admin class (aave's admin is off-slot → UNRESOLVED), NEVER IMMUTABLE
  const c = Governance.classify(
    { implEmbeddedInCode: true, implSlotZero: false, noWritePath: true },
    { adminAddr: null, adminCodePresent: false, isSafe: false, isTimelock: false, ownerAddr: null, ownerCodePresent: false, ownerIsSafe: false, ownerIsTimelock: false },
  )
  expect(c.adminClass).not.toBe("IMMUTABLE")
  // the RENDERED line for aave: upgradeable, and it must NEVER say immutable/fixed/patched/no-upgrade-path (GT1 wall)
  const line = Governance.governanceLine(artifact(c.adminClass, aaveProof))
  expect(line).toMatch(/Upgradeable proxy/i)
  expect(line).not.toMatch(/immutable|no upgrade path|\bfixed\b|patched/i)
})

test("GT1 (positive control) — a GENUINELY immutable subject (all three conditions) DOES render the immutable line — the wall isn't vacuous", () => {
  const proof = Governance.proveImmutable({ implEmbeddedInCode: true, implSlotZero: true, noWritePath: true })
  expect(proof.immutable).toBe(true)
  const c = Governance.classify(
    { implEmbeddedInCode: true, implSlotZero: true, noWritePath: true },
    { adminAddr: null, adminCodePresent: false, isSafe: false, isTimelock: false, ownerAddr: null, ownerCodePresent: false, ownerIsSafe: false, ownerIsTimelock: false },
  )
  expect(c.adminClass).toBe("IMMUTABLE")
  expect(Governance.governanceLine(artifact("IMMUTABLE", proof))).toMatch(/Immutable implementation — no upgrade path exists/)
  // the pinned GT1 wording forbids "aave fixed" phrasing
  expect(cv.gt.GT1).toMatch(/never read as 'aave fixed'|aave fixed/i)
})

test("GT2 — the voc_proposer scipy-sidecar tests carry an explicit load-tolerant per-test budget (the flake asterisk dies)", () => {
  const src = readFileSync(path.join(PKG_ROOT, "test", "organon", "voc_proposer.test.ts"), "utf8")
  expect(src).toMatch(/const SIDECAR_MS = 120_000/) // the load-tolerant budget is declared
  expect((src.match(/, SIDECAR_MS\)/g) ?? []).length).toBeGreaterThanOrEqual(5) // applied to every sidecar-spawning test
  expect(cv.gt.GT2).toMatch(/load-tolerant|per-test timeout|5s budget/i) // the rationale is pinned
})

test("GT3 — IN2's checklist gains compound's impl-truth item (a human judges whether the Pro-drawered impl-truth helps)", () => {
  expect(pkg.gateItems.IN2).toMatch(/read compound's real-source findings in the Pro drawer|does impl-truth help a human/i)
  expect(pkg.gateItems.IN2).toMatch(/REAL LOOKUP of a pool NOT on the .*shelf/i) // the lookup is walked live
})

test("GT4 — D30's countersign gains the arms-for-a-future-subject note (zero current qualifiers; extinct-on-shelf)", () => {
  expect(pkg.d30ArmsForFuture).toMatch(/arms.*future|extinct-on-shelf/i)
  expect(pkg.d30ArmsForFuture).toMatch(/ZERO current flagship renders|zero current qualifiers/i)
  expect(pkg.d30ArmsForFuture).toMatch(/never read as 'aave fixed'/i) // GT1 reinforced in the gate line
})

test("GT5 — the invite package LEADS with the PAID Network rug capture (the most legible proof of value)", () => {
  expect(pkg.invitePackage.leadsWith).toMatch(/PAID Network rug capture/i)
  expect(pkg.invitePackage.order[0]).toMatch(/PAID Network rug capture.*LEAD/i)
})

test("COVERAGE gate — D32 (license posture) + D33 (correlation substrate) are reserved, Operator-signed=false; D27 still first; the package supersedes GroundTruth's (U-RESUPERSEDE)", () => {
  expect(pkg.supersedes).toMatch(/U-RESUPERSEDE|carried forward, NOT rewritten/i)
  expect(pkg.deviationOrder[0]).toBe("D27") // D27 still first
  expect(pkg.newDeviations.D32.operatorSigned).toBe(false)
  expect(pkg.newDeviations.D33.operatorSigned).toBe(false)
  expect(pkg.operatorSignedWhole).toBe(false) // the agent never signs the whole gate (LN5)
  expect(pkg.newDeviations.D33.signingConsequence).toMatch(/BOTH the pinned trigger fires .* AND this pen moves/i)
})
