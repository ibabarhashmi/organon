/**
 * ORGΛNON — THE PRECISION SPRINT, Phase 4 wall (DISCRIMINATE-OR-STAY-CONTEXT; S60). The axis proves it can tell clean
 * from rugged: the pinned KNOWN-CLEAN set (compound-v3 → TIMELOCK-gated · aave-v3 → UNRESOLVED — real, on-chain) and the
 * KNOWN-RUGGED control (a SYNTHETIC EOA-admin + genuinely-ungated-upgrade fixture — the damning class is EXTINCT among
 * live survivors, so it is necessarily synthetic + honestly labeled) render VISIBLY DIFFERENT on ALL THREE of: the
 * governance class, the surviving-finding count / collapse behavior, and the grammar form. A clean-LOOKING rug (canonical
 * bytecode, EOA admin) still separates on the admin fact. D29 (the EOA→bounding promotion) stays PARKED — an agent moves
 * no verdict (the verdict-path hashes byte-unchanged).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reality } from "../../src/studio/reality"
import { Governance } from "../../src/contract/governance"
import type { ContractFinding } from "../../src/contract/facts"

const govDir = path.join(PKG_ROOT, "data", "honesty", "governance")
const registry = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "contract-registry.json"), "utf8"))
const caps = registry.captures ?? registry
const NOW = Date.parse("2026-07-05T00:00:00Z")

interface Profile { class: Governance.AdminClass; grammar: string; survivors: number; collapsed: boolean; rank: number }
function profileReal(poolKey: string): Profile {
  const art = Governance.load(poolKey, { readFile: (p) => readFileSync(p, "utf8"), readdir: (d) => readdirSync(d), dir: govDir })!
  const findings = caps[poolKey].facts.findings as ContractFinding[]
  const col = Governance.collapse(findings, art.canonicalMatch, art.adminClass)
  return { class: art.adminClass, grammar: Governance.governanceLine(art), survivors: col.survivors.length, collapsed: col.collapsed, rank: Governance.governanceRank(art.adminClass) }
}
function profileFixture(): Profile {
  const fx = JSON.parse(readFileSync(path.join(govDir, "fixtures", "synthetic-eoa-rug.json"), "utf8")) as Governance.Artifact & { impl: Governance.ImplFindings }
  const col = Governance.collapse(fx.impl.findings, fx.canonicalMatch, fx.adminClass)
  return { class: fx.adminClass, grammar: Governance.governanceLine(fx), survivors: col.survivors.length, collapsed: col.collapsed, rank: Governance.governanceRank(fx.adminClass) }
}

const COMPOUND = "defillama:pool:7da72d09-56ca-4ec5-a45f-59114353e487"
const AAVE = "defillama:pool:aa70268e-4b52-42bf-a116-608b370f9501"

test("S60 — the KNOWN-CLEAN (gated) vs KNOWN-RUGGED (EOA) sets render VISIBLY DIFFERENT on class + collapse + grammar (all three)", () => {
  const clean = profileReal(COMPOUND)
  const rugged = profileFixture()
  // (1) governance CLASS separates
  expect(clean.class).toBe("TIMELOCK")
  expect(rugged.class).toBe("EOA")
  expect(clean.class).not.toBe(rugged.class)
  // (2) COLLAPSE behavior separates — the gated proxy collapses its canonical noise; the rug collapses NOTHING (its findings stand)
  expect(clean.collapsed).toBe(true)
  expect(clean.survivors).toBe(0)
  expect(rugged.collapsed).toBe(false)
  expect(rugged.survivors).toBeGreaterThan(0)
  // (3) GRAMMAR form separates — reassuring-with-homework vs damning
  expect(clean.grammar).toMatch(/Upgrade path gated; verify the signers/)
  expect(rugged.grammar).toMatch(/A single key can replace this contract's logic/)
  expect(clean.grammar).not.toBe(rugged.grammar)
})

test("S60 — the THREE governance tiers separate on rank: TIMELOCK (compound) > UNRESOLVED (aave) > EOA (the rug)", () => {
  const comp = profileReal(COMPOUND)
  const aave = profileReal(AAVE)
  const rug = profileFixture()
  expect(comp.rank).toBeGreaterThan(aave.rank) // gated beats unresolved
  expect(aave.rank).toBeGreaterThan(rug.rank) // unresolved beats EOA-damning
  expect(new Set([comp.class, aave.class, rug.class]).size).toBe(3) // three distinct classes
  // aave is the honest middle — UNRESOLVED, caution, no collapse (never a guessed cap)
  expect(aave.class).toBe("UNRESOLVED")
  expect(aave.collapsed).toBe(false)
  expect(aave.grammar).toMatch(/treat with EOA-grade caution/)
})

test("S60 — a CLEAN-LOOKING rug (canonical bytecode like a blue-chip, but EOA admin) still separates on the ADMIN FACT", () => {
  // identical canonicalMatch to compound; ONLY the admin differs (EOA) → it must NOT collapse and must render damning
  const cleanLookingRug: Governance.Artifact = { subject: "clean-looking-rug", block: "1", implementation: "0xabc", pattern: "EIP-1967", canonicalMatch: true, adminSlotValue: "0x0", adminAddr: "0x2222222222222222222222222222222222222222", adminClass: "EOA", how: "", probes: {}, contentSha: "0" }
  const findings = caps[COMPOUND].facts.findings as ContractFinding[] // the SAME canonical proxy-shell findings as compound
  const col = Governance.collapse(findings, cleanLookingRug.canonicalMatch, cleanLookingRug.adminClass)
  expect(col.collapsed).toBe(false) // the admin fact dominates — canonical bytecode does NOT earn a collapse on an EOA admin
  expect(col.survivors.length).toBe(findings.length) // every finding stands
  expect(Governance.governanceLine(cleanLookingRug)).toMatch(/A single key can replace this contract's logic/)
})

test("S60 / D29 — the promotion spec is finalized + PARKED (conservative degrade-only) with its affected-pool census; NO verdict moves", () => {
  const d29 = JSON.parse(readFileSync(path.join(govDir, "d29-promotion.json"), "utf8"))
  expect(d29.parked).toBe(true)
  expect(d29.operatorSigned).toBe(false)
  expect(d29.direction).toMatch(/degrade-only|never lift/i)
  expect(d29.scope).toMatch(/DAMNING EOA-admin case ONLY/i)
  // the affected-pool census is pre-computed (0 current EOA subjects — the curated shelf is free of the damning class)
  expect(d29.affectedPoolCensus.count).toBe(0)
  expect(d29.affectedPoolCensus.currentShelfEoaSubjects).toEqual([])
  // the verdict-path hashes are UNCHANGED (an agent-side promotion would move them) — assert === the precision-pins pinned set
  const pins = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "precision-pins.json"), "utf8"))
  for (const [rel, want] of Object.entries(pins.verdictPathHashes as Record<string, string>)) {
    expect(createHash("sha256").update(readFileSync(path.join(PKG_ROOT, rel), "utf8")).digest("hex"), `${rel} moved — a verdict moved`).toBe(want)
  }
})

test("S60 — the render itself separates: the shelf's gated subject collapses to the governance line; the rug survives + damns", () => {
  // the real gated subject renders the gated line + 0 survivors
  const rc = Reality.realityCheck(COMPOUND, NOW)!
  const bundle = Governance.renderBundle(Governance.load(COMPOUND, { readFile: (p) => readFileSync(p, "utf8"), readdir: (d) => readdirSync(d), dir: govDir })!, null)
  const cleanHtml = Reality.renderRealityCheck(rc.name, rc.scored, rc.history, COMPOUND, [], bundle)
  expect(cleanHtml).toMatch(/TIMELOCK\. Upgrade path gated/)
  expect(cleanHtml).toMatch(/0 findings the canonical pattern cannot explain/)
  // the synthetic rug (fed as a bundle) renders the damning line + the ungated upgrade survives
  const fx = JSON.parse(readFileSync(path.join(govDir, "fixtures", "synthetic-eoa-rug.json"), "utf8"))
  const rugBundle = Governance.renderBundle(fx, fx.impl)
  const rugHtml = Reality.renderRealityCheck(rc.name, rc.scored, rc.history, COMPOUND, [], rugBundle)
  expect(rugHtml).toMatch(/EOA\. A single key can replace this contract/)
  expect(rugHtml).toContain("a genuinely ungated upgrade path")
})
