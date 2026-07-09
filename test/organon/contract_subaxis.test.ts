/**
 * ORGΛNON — THE CONTRACT-TRUTH SPRINT, Phase 3 walls (CONTRACT-TRUE, S25/S27). The deterministic contract-risk sub-axis
 * tiers the structural facts — honestly scoped, operationally honest, off the hot loop:
 *   · FLAGGED — a seeded surface → FLAGGED, the finding NAMED, never "unsafe"/"safe" (S25).
 *   · CLEAN-STRUCTURE — no flags + a REAL verified build → "no flagged structural surfaces in the verified source" (never "safe").
 *   · UNVERIFIED — no build (ABSENT), OR no flags on a SAMPLE build (NOT a clean-structure claim — never a fabricated all-clear, S27).
 *   · the "not a full audit" scope label is on EVERY rendering; the reason never emits a verdict word.
 *   · DETERMINISTIC (same input → byte-identical) + OFF THE HOT LOOP (the render-path modules import no analyzer — zero compilation).
 *   · the OPTIONAL Foundry seam: capture on an absent build → null (ABSENT), never a crash (S27).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { contractFacts, contractSubAxis, resolveContractSubAxis, captureContractAnalysis, CONTRACT_SCOPE } from "../../src/contract"
import type { ContractIR, ProjectIR, StructuralFacts, ContractRegistry } from "../../src/contract"

function seededContract(): ContractIR {
  return {
    id: "T.sol:Vault", node_id: 1, name: "Vault", kind: "contract", source: "T.sol", full: "/T.sol",
    bases: [], linearized_bases: ["Vault"],
    functions: [
      { id: "f1", name: "setAdmin", kind: "function", signature: "setAdmin(address)", visibility: "external", mutability: "nonpayable", payable: false,
        modifiers: [], parameters: ["address"], parameter_names: ["a"], returns: [], reads: [], writes: ["admin"],
        calls: [], auth: [], values: [], operations: [], taints: [], arithmetic: [], location: { file: "T.sol", full: "/T.sol", line: 10 } },
    ],
    modifiers: [], state: [], storage: [], events: [], errors: [], proxies: [], initializers: [], fallback_delegatecall: false,
    location: { file: "T.sol", full: "/T.sol", line: 1 },
  }
}
const projIR = (c: ContractIR): ProjectIR => ({ project: { framework: "foundry", root: "/", config: "/foundry.toml", out: "/out", cache: "/cache", build_info: [], source_dirs: [], test_dirs: [], script_dirs: [], lib_dirs: [] }, contracts: [c], sources: {} })
const flaggedFacts = (): StructuralFacts => contractFacts(projIR(seededContract())) // has ≥1 finding
const cleanFacts = (): StructuralFacts => contractFacts(projIR({ ...seededContract(), functions: [] })) // zero findings

const NO_VERDICT = /\b(safe|unsafe|audited|secure|guaranteed)\b/i

test("CONTRACT-TRUE — a seeded flagged surface → FLAGGED, the specific finding NAMED, never a verdict word (S25)", () => {
  const facts = flaggedFacts()
  expect(facts.findings.length).toBeGreaterThan(0)
  const sub = contractSubAxis({ facts, provenance: "REAL", contentSha: "deadbeef" })
  expect(sub.tier).toBe("FLAGGED")
  expect(sub.findings.length).toBe(facts.findings.length)
  expect(sub.findings[0].detail).toMatch(/setAdmin/) // the specific structural fact, named
  expect(sub.reason).not.toMatch(NO_VERDICT) // never "safe"/"unsafe"/"audited"
  expect(sub.scope).toBe(CONTRACT_SCOPE)
  expect(sub.scope).toMatch(/not a full audit/i)
})

test("CONTRACT-TRUE — no flags + a REAL verified build → CLEAN-STRUCTURE ('no flagged structural surfaces', never 'safe')", () => {
  const sub = contractSubAxis({ facts: cleanFacts(), provenance: "REAL", contentSha: "abc123" })
  expect(sub.tier).toBe("CLEAN-STRUCTURE")
  expect(sub.findings).toHaveLength(0)
  expect(sub.reason).toMatch(/no flagged structural surfaces in the verified source/i)
  expect(sub.reason).not.toMatch(NO_VERDICT) // "not a full audit and not a guarantee" — never claims "safe"
  expect(sub.buildProvenance).toBe("REAL")
})

test("CONTRACT-TRUE (S27) — no build (ABSENT) → UNVERIFIED, the coarse screen scores alone (never a fabricated all-clear)", () => {
  const sub = contractSubAxis(null)
  expect(sub.tier).toBe("UNVERIFIED")
  expect(sub.buildProvenance).toBe("ABSENT")
  expect(sub.reason).toMatch(/coarse age·size·dependency screen scores alone/i)
  expect(sub.findings).toHaveLength(0)
  expect(sub.contentSha).toBeNull()
})

test("CONTRACT-TRUE (S27) — no flags on a SAMPLE build → UNVERIFIED, NOT CLEAN-STRUCTURE (never a fabricated all-clear)", () => {
  const sub = contractSubAxis({ facts: cleanFacts(), provenance: "SAMPLE", contentSha: "s4mp1e" })
  expect(sub.tier).toBe("UNVERIFIED") // a SAMPLE with no flags is NOT a clean-structure claim
  expect(sub.tier).not.toBe("CLEAN-STRUCTURE")
  expect(sub.buildProvenance).toBe("SAMPLE")
  expect(sub.reason).toMatch(/not a clean-structure claim|never a fabricated all-clear/i)
})

test("CONTRACT-TRUE — DETERMINISTIC: the same facts + provenance → a byte-identical sub-axis", () => {
  const a = JSON.stringify(contractSubAxis({ facts: flaggedFacts(), provenance: "REAL", contentSha: "x" }))
  const b = JSON.stringify(contractSubAxis({ facts: flaggedFacts(), provenance: "REAL", contentSha: "x" }))
  expect(a).toBe(b)
})

test("CONTRACT-TRUE (X-CONTRACT e) — OFF THE HOT LOOP: the render-path modules (subaxis, registry) import NO analyzer", () => {
  for (const f of ["subaxis.ts", "registry.ts"]) {
    const src = readFileSync(path.join(PKG_ROOT, "src", "contract", f), "utf8")
    expect(src, `${f} must not import the analyzer (no per-render compilation)`).not.toMatch(/from\s+["']\.\/(analyze|build)["']/)
  }
})

test("CONTRACT-TRUE — the registry resolves recorded facts (empty → UNVERIFIED for any pool; a captured entry → FLAGGED)", () => {
  expect(resolveContractSubAxis("any-pool", {}).tier).toBe("UNVERIFIED") // empty registry → honest UNVERIFIED
  const facts = flaggedFacts()
  const reg: ContractRegistry = { "aave-v3-usdc": { poolKey: "aave-v3-usdc", facts, provenance: "REAL", capturedAt: 0, contentSha: "h" } }
  const sub = resolveContractSubAxis("aave-v3-usdc", reg)
  expect(sub.tier).toBe("FLAGGED")
  expect(sub.findings.length).toBe(facts.findings.length)
})

test("CONTRACT-TRUE (S27) — the OPTIONAL Foundry seam: capture on an absent build → null (ABSENT), never a crash", async () => {
  const cap = await captureContractAnalysis("pool", path.join(PKG_ROOT, "does", "not", "exist"), "REAL", 0)
  expect(cap).toBeNull() // no foundry.toml / no build → null, degrades to UNVERIFIED honestly
})
