/**
 * ORGΛNON — THE BUILD-PROVENANCE SPRINT, PART E (X-STRESS). The built system driven as intended and broken across the
 * FULL first-class catalog S1-S30; this test first-classes the NEW lenses (S28 the REAL/SAMPLE wall · S29 capture-
 * determinism/re-capture-hash · S30 ingestion-scope/keyless-no-scrape) + validates the catalog/findings/convergence + D10.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { contractSubAxis, ContractIngest } from "../../src/contract"
import type { ContractRegistry, StructuralFacts } from "../../src/contract"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const rt = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "verify-redteam.json"), "utf8"))
const captures = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "contract-registry.json"), "utf8")).captures as ContractRegistry
const CONTRACT_DIR = path.join(PKG_ROOT, "src", "contract")

test("PART E — the catalog is the FULL first-class S1-S30 (S28 wall · S29 capture-determinism · S30 ingestion-scope)", () => {
  expect(rt.catalog).toHaveLength(30)
  expect(rt.catalog.map((s: { id: string }) => s.id)).toEqual(Array.from({ length: 30 }, (_, k) => `S${k + 1}`))
  const byId = (id: string) => rt.catalog.find((s: { id: string }) => s.id === id)
  expect(byId("S28").name).toMatch(/REAL\/SAMPLE wall/i)
  expect(byId("S29").name).toMatch(/capture-determinism|re-capture/i)
  expect(byId("S30").name).toMatch(/ingestion-scope|keyless/i)
  for (const s of rt.catalog) expect(s.outcome).toMatch(/PASS/)
})

test("PART E — the findings W-V01/W-V02/W-V03 each carry scenario · observed · rootCause · fix · retest (fixed on the go)", () => {
  expect(rt.findings.map((f: { id: string }) => f.id)).toEqual(["W-V01", "W-V02", "W-V03"])
  for (const f of rt.findings) for (const k of ["scenario", "observed", "rootCause", "fix", "retest"]) expect(String(f[k]).trim().length).toBeGreaterThan(0)
  expect(rt.findings.find((f: { id: string }) => f.id === "W-V01").fix).toMatch(/v2 API/i) // the Sourcify endpoint fix
})

test("PART E / S28 — the REAL/SAMPLE wall: REAL+zero-flags → CLEAN-STRUCTURE; SAMPLE+zero-flags → UNVERIFIED (never a fabricated all-clear)", () => {
  const clean: StructuralFacts = { contracts: ["X"], functionsAnalyzed: 1, findings: [], flaggedCategories: [] }
  expect(contractSubAxis({ facts: clean, provenance: "REAL", contentSha: "h" }).tier).toBe("CLEAN-STRUCTURE")
  expect(contractSubAxis({ facts: clean, provenance: "SAMPLE", contentSha: "h" }).tier).toBe("UNVERIFIED")
  // the committed REAL entries are provenance REAL (an exact verified deployed-source match), never fabricated
  const real = Object.values(captures).filter((c) => c.provenance === "REAL")
  expect(real.length).toBeGreaterThanOrEqual(1)
  for (const c of real) expect(c.source).toMatch(/sourcify:exact/)
})

test("PART E / S29 — capture-determinism: every committed REAL entry is content-hash SELF-CONSISTENT + the render path imports no analyzer", () => {
  for (const c of Object.values(captures)) expect(c.contentSha).toBe(sha256(JSON.stringify(c.facts)))
  // the render-path modules import no analyzer (zero per-render compilation)
  for (const f of ["subaxis.ts", "registry.ts"]) {
    const src = readFileSync(path.join(CONTRACT_DIR, f), "utf8")
    expect(src).not.toMatch(/from\s+["']\.\/(analyze|build|buildcapture)["']/)
  }
})

test("PART E / S30 — ingestion is keyless-first + key-safe: the fetch only hits sourcify.dev; a key never reaches the record", async () => {
  const SECRET = "explorer-test-key-REDTEAMMARKER-0123456789" // a dummy placeholder (NOT sk-/AIza-shaped — never a real secret in the repo)
  const calls: { url: string; headers?: Record<string, string> }[] = []
  const fetchImpl: ContractIngest.FetchImpl = async (url, headers) => {
    calls.push({ url, headers })
    return { status: 200, text: JSON.stringify({ match: "exact_match", compilation: { compilerVersion: "0.8.20", language: "Solidity" }, sources: { "A.sol": { content: "pragma solidity ^0.8.20; contract A{}" } } }) }
  }
  const vs = await ContractIngest.fromSourcify({ protocol: "p", chainId: 1, address: "0x" + "a".repeat(40), asOf: 0, fetchImpl, explorerKey: SECRET })
  for (const c of calls) expect(c.url).toContain("sourcify.dev") // no scrape — only the keyless verified-source registry
  expect(JSON.stringify(vs)).not.toContain("REDTEAMMARKER") // the key never reaches the recorded source
})

test("PART E — D10 (the verified-build ingestion scope) is recorded with its four ledger fields (Operator-signed)", () => {
  const dev = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "deviations.json"), "utf8"))
  const d10 = dev.deviations.find((d: { id: string }) => d.id === "D10")
  expect(d10).toBeDefined()
  for (const k of ["blueprintLine", "whatWasDone", "why", "lawAuthority"]) expect(String(d10[k]).trim().length).toBeGreaterThan(0)
  expect(d10.whatWasDone).toMatch(/aave-v3 Pool|compound-v3/)
  expect(d10.whatWasDone).toMatch(/proxy/i) // the honest proxy-vs-impl scope surfaced
  expect(d10.lawAuthority).toMatch(/X-VERIFY/)
})

test("PART E — convergence + probe + parked-forward are recorded (two clean runs, verify + pristine green, V5 closed)", () => {
  expect(rt.convergence.cleanRuns).toBe(2)
  expect(rt.convergence.verdictDifferentialZero).toBe(true)
  expect(rt.convergence.verifyGreen).toBe(true)
  expect(rt.convergence.pristineGreen).toBe(true)
  expect(rt.convergence.battery).toMatch(/1 skip/) // the surviving skip (P3)
  expect(rt.probe.status).toMatch(/ARMED \+ BUILT-BUT-UNPROVEN/)
  expect(rt.postSprint).toMatch(/V5 CLOSED/)
  expect(rt.parkedForward.join(" ")).toMatch(/IMPLEMENTATION-level/i) // the impl analysis honestly deferred
})
