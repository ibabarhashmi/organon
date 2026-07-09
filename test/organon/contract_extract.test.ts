/**
 * ORGΛNON — THE CONTRACT-TRUTH SPRINT, Phase 2 walls (EXTRACT-CLEAN, S25/S26). The deterministic Solidity engine +
 * the six tools' pure fact-extraction are EXTRACTED copy-into-tree into src/contract/*, OWNED in-tree:
 *   · PURE + DETERMINISTIC — a fixed ContractIR → byte-identical facts across runs (no model, no random, no network).
 *   · ZERO model / ZERO sibling import — src/contract/* imports nothing from @solidity-sentinel/* or OpenCode (@/…, ../project,
 *     ../util, ../lang, …) and contains no Tool.define / generateText call (a source scan, positive-controlled).
 *   · D9 recorded — the extraction + coupling-severance + the conscious 6-ported/4-not-ported scope, with the four ledger fields.
 *   · POSITIVE-CONTROLLED facts — a seeded unprotected admin fn → unprotected-state-changing; a seeded delegatecall →
 *     dangerous-edges; a seeded oracle read → oracle-dependency; an upgradeable-without-gap → storage-clash. Never "unsafe".
 * No engine touched yet (the differential is proven zero by the honesty walls); this proves the EXTRACTION is clean.
 */
import { test, expect } from "bun:test"
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { contractFactsForContract, contractFacts } from "../../src/contract"
import type { ContractIR, ProjectIR } from "../../src/contract"

const CONTRACT_DIR = path.join(PKG_ROOT, "src", "contract")

// ── a positive-controlled fixture ContractIR (all six categories seeded) ──
function fixture(): ContractIR {
  return {
    id: "T.sol:Vault", node_id: 1, name: "Vault", kind: "contract", source: "T.sol", full: "/T.sol",
    bases: [], linearized_bases: ["Vault"],
    functions: [
      { id: "f1", name: "setAdmin", kind: "function", signature: "setAdmin(address)", visibility: "external", mutability: "nonpayable", payable: false,
        modifiers: [], parameters: ["address"], parameter_names: ["a"], returns: [], reads: [], writes: ["admin"],
        calls: [], auth: [], values: [], operations: [], taints: [], arithmetic: [], location: { file: "T.sol", full: "/T.sol", line: 10 } },
      { id: "f2", name: "exec", kind: "function", signature: "exec(address)", visibility: "external", mutability: "nonpayable", payable: false,
        modifiers: ["onlyOwner"], parameters: ["address"], parameter_names: ["t"], returns: [], reads: [], writes: [],
        calls: [{ method: "delegatecall", kind: "delegatecall", value: false, line: 20 }, { method: "latestRoundData", kind: "staticcall", value: false, line: 21 }],
        auth: [{ kind: "modifier", label: "onlyOwner" }], values: [], operations: [], taints: [], arithmetic: [], location: { file: "T.sol", full: "/T.sol", line: 15 } },
    ],
    modifiers: [], state: [], storage: [], events: [], errors: [],
    proxies: [{ kind: "uups", note: "UUPS proxy" }], initializers: ["initialize"], fallback_delegatecall: false,
    location: { file: "T.sol", full: "/T.sol", line: 1 },
  }
}

// collect every static/dynamic import specifier from a source file
function specifiers(src: string): string[] {
  return [
    ...src.matchAll(/\bfrom\s+["']([^"']+)["']/g),
    ...src.matchAll(/\bimport\s*\(\s*["']([^"']+)["']/g),
    ...src.matchAll(/\brequire\s*\(\s*["']([^"']+)["']/g),
  ].map((m) => m[1])
}
const FORBIDDEN = [
  /^@solidity-sentinel/, // the sibling package (the leak wall's core target)
  /^@\//, // any OpenCode `@/…` path alias
  /^\.\.\/(project|util|session|provider|lang|solidity|tool|global|bus|config)\b/, // relative OpenCode couplings
  /^bun:sqlite$/, // the dataplane store binding
  /ai-sdk/, /@ai-sdk/, /^openai$/, /^@anthropic/, // any LLM SDK
]

test("EXTRACT — the fact extractor is PURE + DETERMINISTIC (a fixed ContractIR → byte-identical facts across runs)", () => {
  const a = JSON.stringify(contractFactsForContract(fixture()))
  const b = JSON.stringify(contractFactsForContract(fixture()))
  expect(a).toBe(b) // byte-identical — no model, no random
  const ir: ProjectIR = { project: { framework: "foundry", root: "/", config: "/foundry.toml", out: "/out", cache: "/cache", build_info: [], source_dirs: [], test_dirs: [], script_dirs: [], lib_dirs: [] }, contracts: [fixture()], sources: {} }
  expect(JSON.stringify(contractFacts(ir))).toBe(JSON.stringify(contractFacts(ir)))
})

test("EXTRACT (S26) — src/contract/* imports NOTHING from a Sentinel sibling / OpenCode (the leak wall, positive-controlled)", () => {
  const files = readdirSync(CONTRACT_DIR).filter((f) => f.endsWith(".ts"))
  expect(files.length).toBeGreaterThanOrEqual(7) // ir · protocols · build · project · analyze · fs · facts · index
  for (const f of files) {
    const src = readFileSync(path.join(CONTRACT_DIR, f), "utf8")
    for (const spec of specifiers(src)) {
      const leaked = FORBIDDEN.find((re) => re.test(spec))
      expect(leaked, `${f} imports a forbidden specifier: ${spec}`).toBeUndefined()
    }
  }
  // POSITIVE CONTROL: the scan MUST flag a seeded sibling/OpenCode import (the wall bites, not a no-op)
  const seeded = specifiers(`import { x } from "@solidity-sentinel/core"\nimport { Instance } from "@/project/instance"\nconst d = require("bun:sqlite")`)
  expect(seeded.filter((s) => FORBIDDEN.some((re) => re.test(s))).length).toBe(3)
})

test("EXTRACT (S25) — ZERO model in src/contract/*: no Tool.define / generateText / streamText call anywhere", () => {
  for (const f of readdirSync(CONTRACT_DIR).filter((f) => f.endsWith(".ts"))) {
    const src = readFileSync(path.join(CONTRACT_DIR, f), "utf8")
    // match the CALL form (a paren) so the D9 comments that mention "Tool.define"/"the LLM audit agent" don't false-positive
    expect(src, `${f} contains a Tool.define call`).not.toMatch(/Tool\.define\s*\(/)
    expect(src, `${f} contains a generateText/streamText call`).not.toMatch(/\b(generateText|streamText)\s*\(/)
  }
})

test("EXTRACT (S26) — D9 records the extraction + coupling-severance + the conscious 6-ported/4-not-ported scope", () => {
  const dev = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "deviations.json"), "utf8"))
  const d9 = dev.deviations.find((d: { id: string }) => d.id === "D9")
  expect(d9).toBeDefined()
  for (const k of ["blueprintLine", "whatWasDone", "why", "lawAuthority"]) expect(String(d9[k]).trim().length).toBeGreaterThan(0)
  expect(d9.whatWasDone).toMatch(/src\/contract/)
  expect(d9.whatWasDone).toMatch(/SEVERED/)
  expect(d9.whatWasDone).toMatch(/NOT PORTED/i) // the four-tool scope decision surfaced
  expect(d9.whatWasDone).toMatch(/no new npm dependency|hono\+zod/i)
  expect(d9.lawAuthority).toMatch(/X-CONTRACT/)
})

test("EXTRACT — POSITIVE-CONTROLLED facts: the seeded surfaces are FLAGGED with the specific finding (never 'unsafe'/'safe')", () => {
  const findings = contractFactsForContract(fixture())
  const cats = new Set(findings.map((f) => f.category))
  expect(cats.has("unprotected-state-changing")).toBe(true) // setAdmin writes with no auth gate
  expect(cats.has("dangerous-edges")).toBe(true) // the delegatecall edge
  expect(cats.has("upgrade-proxy-hazard")).toBe(true) // uups proxy without _disableInitializers
  expect(cats.has("storage-clash")).toBe(true) // upgradeable without a storage gap
  expect(cats.has("oracle-dependency")).toBe(true) // latestRoundData
  // every finding NAMES a specific structural fact and NEVER emits a verdict word
  for (const f of findings) {
    expect(f.detail.length).toBeGreaterThan(0)
    expect(f.detail).not.toMatch(/\b(safe|unsafe|audited|secure|guaranteed)\b/i)
  }
  // a clean fixture (no flagged surfaces) yields NO findings — the extractor never fabricates one
  const clean: ContractIR = { ...fixture(), functions: [], proxies: [], initializers: [], fallback_delegatecall: false }
  expect(contractFactsForContract(clean)).toHaveLength(0)
})
