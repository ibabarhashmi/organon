/**
 * ORGΛNON — THE BUILD-PROVENANCE SPRINT, Phase 4 walls (REGISTRY-REAL, S28/S29). The registry now carries the FIRST REAL
 * contract tiers on the live shelf — captured from keyless Sourcify EXACT-match verified deployed source + `forge build`
 * (Operator-gated; committed, so this test needs no forge/network). Positive-controlled:
 *   · the REAL entries are provenance REAL + content-hash SELF-CONSISTENT (contentSha == sha256(facts) — the durable guarantee).
 *   · a REAL pool resolves a genuine FLAGGED tier — the specific findings NAMED, never "safe"/"audited" (S25).
 *   · the REAL/SAMPLE wall (S28): a REAL + zero flags → CLEAN-STRUCTURE; a SAMPLE + zero flags → UNVERIFIED (never a fabricated all-clear).
 *   · VERDICT-SAFE — a REAL FLAGGED tier on a SOLID pool leaves it SOLID (material:false; the differential proves it).
 *   · the honest REAL-coverage count is exposed (X-COVER, V3); provenance (address · source · sourceHash · ruleset) recorded (D10).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Scorecard } from "../../src/analytics/scorecard"
import { contractSubAxis, resolveContractSubAxis, contractCoverage, _resetRegistryCache } from "../../src/contract"
import type { ContractRegistry, StructuralFacts } from "../../src/contract"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const reg = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "contract-registry.json"), "utf8"))
const captures = reg.captures as ContractRegistry
const AAVE_USDC = "defillama:pool:aa70268e-4b52-42bf-a116-608b370f9501"

test("REGISTRY-REAL — the committed registry carries REAL pool entries, each content-hash SELF-CONSISTENT (the durable guarantee)", () => {
  const real = Object.values(captures).filter((c) => c.provenance === "REAL")
  expect(real.length).toBeGreaterThanOrEqual(1) // the first REAL tiers on the live shelf
  for (const c of real) {
    expect(c.contentSha).toBe(sha256(JSON.stringify(c.facts))) // the content-hash reproduces the facts (no forge needed)
    expect(c.facts.findings.length).toBeGreaterThan(0) // a real analyzed build has real structural facts
    expect(c.address).toMatch(/^0x[0-9a-fA-F]{40}$/) // a deployed address (D10 provenance)
    expect(c.source).toMatch(/sourcify:exact/) // an EXACT verified deployed-source match
    expect(c.ruleset).toMatch(/contract-facts@v1/) // the stamped tool-set
  }
})

test("REGISTRY-REAL — a REAL pool resolves a genuine FLAGGED tier: specific findings NAMED, never 'safe'/'audited' (S25)", () => {
  _resetRegistryCache()
  const sub = resolveContractSubAxis(AAVE_USDC)
  expect(sub.tier).toBe("FLAGGED")
  expect(sub.buildProvenance).toBe("REAL")
  expect(sub.findings.length).toBeGreaterThan(0)
  expect(sub.scope).toMatch(/not a full audit/i)
  expect(sub.reason).not.toMatch(/\b(safe|audited|secure|guaranteed)\b/i)
  for (const f of sub.findings) expect(f.detail).not.toMatch(/\b(safe|unsafe|audited)\b/i)
})

test("REGISTRY-REAL (S28) — the REAL/SAMPLE wall: REAL+zero-flags → CLEAN-STRUCTURE; SAMPLE+zero-flags → UNVERIFIED (never a fabricated all-clear)", () => {
  const clean: StructuralFacts = { contracts: ["X"], functionsAnalyzed: 3, findings: [], flaggedCategories: [] }
  // a REAL verified build with no flags MAY earn CLEAN-STRUCTURE
  expect(contractSubAxis({ facts: clean, provenance: "REAL", contentSha: "h" }).tier).toBe("CLEAN-STRUCTURE")
  // a SAMPLE build with no flags may NEVER — it stays UNVERIFIED (the wall)
  expect(contractSubAxis({ facts: clean, provenance: "SAMPLE", contentSha: "h" }).tier).toBe("UNVERIFIED")
})

test("REGISTRY-REAL — VERDICT-SAFE: a REAL FLAGGED tier on a SOLID pool leaves it SOLID (material:false; the differential holds)", () => {
  _resetRegistryCache()
  const real = resolveContractSubAxis(AAVE_USDC)
  expect(real.tier).toBe("FLAGGED")
  const base: Scorecard.PoolFacts = { name: "aave-v3 USDC", apyBase: 4, apyReward: 0.5, tvlSlope30d: 0.05, pegDev: null, isStablecoin: false, reality: "REAL", provenanceRef: "x", vertical: "lending", ageDays: 1000, sizeUsd: 5_000_000_000, depProtocols: 1 }
  const withReal = Scorecard.score({ ...base, contractSubAxis: real }).verdict
  const without = Scorecard.score({ ...base, contractSubAxis: undefined }).verdict
  expect(without).toBe("SOLID")
  expect(withReal).toBe(without) // a REAL FLAGGED surface never moves the scorecard verdict
})

test("REGISTRY-REAL (V3) — the honest REAL-coverage count is exposed (N pools carry a REAL tier)", () => {
  _resetRegistryCache()
  const cov = contractCoverage()
  expect(cov.realCount).toBe(Object.values(captures).filter((c) => c.provenance === "REAL").length)
  expect(cov.realCount).toBeGreaterThanOrEqual(1)
  expect(cov.realPoolKeys).toContain(AAVE_USDC)
})
