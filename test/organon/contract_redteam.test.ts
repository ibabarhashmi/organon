/**
 * ORGΛNON — THE CONTRACT-TRUTH SPRINT, PART E (X-STRESS). The built system driven as intended (depositor · quant ·
 * skeptic · clumsy) and broken across the FULL first-class catalog S1-S27; this test first-classes the NEW lenses
 * (S25 contract-analysis honesty · S26 leak-wall/coupling-severance · S27 Foundry-absent degradation) + validates the
 * catalog/findings/convergence artifact. The S1-S24 lenses are carried (proven by their own walls); the three new
 * cross-cutting invariants are re-asserted here so the catalog is first-class, not a checklist.
 */
import { test, expect } from "bun:test"
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Seams } from "../../src/dataplane/seams"
import { contractFacts, contractFactsForContract, resolveContractSubAxis, captureContractAnalysis } from "../../src/contract"
import type { ContractIR, ProjectIR } from "../../src/contract"

const rt = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "contract-redteam.json"), "utf8"))
const CONTRACT_DIR = path.join(PKG_ROOT, "src", "contract")

test("PART E — the catalog is the FULL first-class S1-S27 (S25 contract honesty · S26 leak/severance · S27 Foundry-absent)", () => {
  expect(rt.catalog).toHaveLength(27)
  expect(rt.catalog.map((s: { id: string }) => s.id)).toEqual(Array.from({ length: 27 }, (_, k) => `S${k + 1}`))
  const byId = (id: string) => rt.catalog.find((s: { id: string }) => s.id === id)
  expect(byId("S25").name).toMatch(/contract-analysis honesty/i)
  expect(byId("S26").name).toMatch(/leak-wall|coupling-severance/i)
  expect(byId("S27").name).toMatch(/Foundry-absent/i)
  for (const s of rt.catalog) expect(s.outcome).toMatch(/PASS/)
})

test("PART E — the findings W-C01/W-C02/W-C03 each carry scenario · observed · rootCause · fix · retest (fixed on the go)", () => {
  expect(rt.findings.map((f: { id: string }) => f.id)).toEqual(["W-C01", "W-C02", "W-C03"])
  for (const f of rt.findings) for (const k of ["scenario", "observed", "rootCause", "fix", "retest"]) expect(String(f[k]).trim().length).toBeGreaterThan(0)
  expect(rt.findings.find((f: { id: string }) => f.id === "W-C01").fix).toMatch(/cf620520|4275f739|re-pin/i) // the conscious re-pin surfaced
})

test("PART E / S25 — ZERO model in src/contract/*: no LLM SDK import, no Tool.define / generateText call", () => {
  for (const f of readdirSync(CONTRACT_DIR).filter((f) => f.endsWith(".ts"))) {
    const src = readFileSync(path.join(CONTRACT_DIR, f), "utf8")
    const specs = [...src.matchAll(/\bfrom\s+["']([^"']+)["']/g)].map((m) => m[1])
    for (const s of specs) expect(s, `${f} imports ${s}`).not.toMatch(/ai-sdk|@ai-sdk|^openai$|@anthropic|@solidity-sentinel|^@\//)
    expect(src, `${f} has a Tool.define call`).not.toMatch(/Tool\.define\s*\(/)
    expect(src, `${f} has a generateText/streamText call`).not.toMatch(/\b(generateText|streamText)\s*\(/)
  }
})

test("PART E / S26 — the dataplane_leak wall stays GREEN after feed imports the owned ../contract/registry", () => {
  const { files, leaks } = Seams.scanDataplane()
  expect(files.length).toBeGreaterThan(0)
  expect(leaks.length).toBe(0) // feed -> ../contract/registry is an owned in-tree import, never a leak
})

test("PART E / S27 — Foundry-absent degradation: empty registry -> UNVERIFIED for any pool; capture on an absent build -> null", async () => {
  expect(resolveContractSubAxis("any-pool", {}).tier).toBe("UNVERIFIED") // never a fabricated all-clear
  const cap = await captureContractAnalysis("p", path.join(PKG_ROOT, "no", "such", "build"), "REAL", 0)
  expect(cap).toBeNull() // an absent build/toolchain -> null (the coarse screen scores alone), never a crash
})

test("PART E / S25 — the fact extractor is DETERMINISTIC and NEVER emits a verdict word ('safe'/'unsafe'/'audited')", () => {
  const c: ContractIR = {
    id: "V.sol:V", node_id: 1, name: "V", kind: "contract", source: "V.sol", full: "/V.sol", bases: [], linearized_bases: ["V"],
    functions: [{ id: "f", name: "withdraw", kind: "function", signature: "withdraw()", visibility: "external", mutability: "nonpayable", payable: false, modifiers: [], parameters: [], parameter_names: [], returns: [], reads: [], writes: ["bal"], calls: [{ method: "call", kind: "low-level", value: true, line: 5 }], auth: [], values: [], operations: [], taints: [], arithmetic: [], location: { file: "V.sol", full: "/V.sol", line: 4 } }],
    modifiers: [], state: [], storage: [], events: [], errors: [], proxies: [], initializers: [], fallback_delegatecall: false, location: { file: "V.sol", full: "/V.sol", line: 1 },
  }
  const ir: ProjectIR = { project: { framework: "foundry", root: "/", config: "/f", out: "/o", cache: "/c", build_info: [], source_dirs: [], test_dirs: [], script_dirs: [], lib_dirs: [] }, contracts: [c], sources: {} }
  expect(JSON.stringify(contractFacts(ir))).toBe(JSON.stringify(contractFacts(ir))) // deterministic
  for (const f of contractFactsForContract(c)) expect(f.detail).not.toMatch(/\b(safe|unsafe|audited|secure|guaranteed)\b/i)
})

test("PART E — convergence + probe + parked-forward are recorded (two clean runs, verify + pristine green, probe unproven)", () => {
  expect(rt.convergence.cleanRuns).toBe(2)
  expect(rt.convergence.verdictDifferentialZero).toBe(true)
  expect(rt.convergence.verifyGreen).toBe(true)
  expect(rt.convergence.coreByteIdentity).toBe(true)
  expect(rt.convergence.battery).toMatch(/1 skip/) // the surviving skip named (P3 — ask_live.test.ts)
  expect(rt.probe.status).toMatch(/ARMED \+ BUILT-BUT-UNPROVEN/)
  // the deep dynamic analysis stays PARKED; the parked generate-loop stays parked
  expect(rt.parkedForward.join(" ")).toMatch(/fuzzer|dynamic\/economic|symbolic/i)
  expect(rt.parkedForward.join(" ")).toMatch(/PROPOSER|generate/i)
})
