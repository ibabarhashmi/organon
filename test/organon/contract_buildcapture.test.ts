/**
 * ORGΛNON — THE BUILD-PROVENANCE SPRINT, Phase 3 walls (BUILD-CAPTURE, S29). The deterministic build-capture over a
 * COMMITTED REAL Foundry build (test/organon/fixtures/contract-build — a genuine `forge build --ast --build-info` of a
 * seeded Vault.sol; the test needs no forge/network, the build-info is present). Positive-controlled:
 *   · a REAL operator-build → a capture with the real facts, provenance REAL, a stamped ruleset, sourceHash + contentSha.
 *   · DETERMINISTIC (S29) — a re-capture → byte-identical facts + an identical contentSha + sourceHash.
 *   · a one-byte SOURCE change → a changed sourceHash (byte-sensitive provenance).
 *   · provenance CARRIED, never promoted — an unattested (SAMPLE) source stays SAMPLE.
 *   · the OPTIONAL Foundry seam — a no-build-info dir + skipBuild → null (never a crash, S30); an unavailable source → null.
 *   · the analyzer is REUSED VERBATIM — the capture facts equal contractFacts(analyzeProject(dir)) (no re-implementation).
 */
import { test, expect } from "bun:test"
import { cpSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { BuildCapture, ContractIngest, analyzeProject, contractFacts } from "../../src/contract"

const FIXTURE = path.join(PKG_ROOT, "test", "organon", "fixtures", "contract-build")
const NOW = Date.parse("2026-07-09T00:00:00Z")

test("BUILD-CAPTURE — a REAL operator-build → a content-addressed capture with the real facts + a stamped ruleset", async () => {
  const vs = ContractIngest.fromOperatorBuild({ protocol: "vault-fixture", projectRoot: FIXTURE, asOf: NOW, attestVerified: true })
  expect(vs.provenance).toBe("REAL")
  const cap = await BuildCapture.captureBuild(vs, { capturedAt: NOW })
  expect(cap).not.toBeNull()
  expect(cap!.provenance).toBe("REAL")
  expect(cap!.verified).toBe(true)
  expect(cap!.facts.findings.length).toBeGreaterThan(0) // the seeded surfaces are found on the REAL build
  expect(cap!.facts.flaggedCategories).toContain("unprotected-state-changing")
  expect(cap!.contentSha).toMatch(/^[0-9a-f]{64}$/)
  expect(cap!.sourceHash).toBe(vs.contentHash)
  expect(cap!.ruleset).toMatch(/contract-facts@v1/)
})

test("BUILD-CAPTURE (S29) — DETERMINISTIC: a re-capture of the same build → byte-identical facts + contentSha + sourceHash", async () => {
  const vs = ContractIngest.fromOperatorBuild({ protocol: "v", projectRoot: FIXTURE, asOf: NOW, attestVerified: true })
  const a = await BuildCapture.captureBuild(vs, { capturedAt: NOW })
  const b = await BuildCapture.captureBuild(vs, { capturedAt: NOW + 12345 }) // a different timestamp must NOT change the content
  expect(JSON.stringify(a!.facts)).toBe(JSON.stringify(b!.facts))
  expect(a!.contentSha).toBe(b!.contentSha)
  expect(a!.sourceHash).toBe(b!.sourceHash)
})

test("BUILD-CAPTURE — the capture REUSES facts.ts VERBATIM (the capture facts == contractFacts(analyzeProject(dir)))", async () => {
  const vs = ContractIngest.fromOperatorBuild({ protocol: "v", projectRoot: FIXTURE, asOf: NOW, attestVerified: true })
  const cap = await BuildCapture.captureBuild(vs, { capturedAt: NOW })
  const direct = contractFacts(await analyzeProject(FIXTURE))
  expect(JSON.stringify(cap!.facts)).toBe(JSON.stringify(direct)) // no re-implementation — X-KEEP
})

test("BUILD-CAPTURE (S29) — a one-byte SOURCE change → a changed sourceHash (byte-sensitive provenance)", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "bc-"))
  try {
    cpSync(FIXTURE, dir, { recursive: true })
    const a = ContractIngest.fromOperatorBuild({ protocol: "v", projectRoot: dir, asOf: NOW, attestVerified: true }).contentHash
    // flip one byte of the source (append a comment)
    const sol = path.join(dir, "src", "Vault.sol")
    writeFileSync(sol, readFileSync(sol, "utf8") + "\n// x")
    const b = ContractIngest.fromOperatorBuild({ protocol: "v", projectRoot: dir, asOf: NOW, attestVerified: true }).contentHash
    expect(a).not.toBe(b) // the source identity changed
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test("BUILD-CAPTURE — provenance is CARRIED, never promoted: an unattested (SAMPLE) source → a SAMPLE capture", async () => {
  const vs = ContractIngest.fromOperatorBuild({ protocol: "v", projectRoot: FIXTURE, asOf: NOW, attestVerified: false })
  expect(vs.provenance).toBe("SAMPLE")
  const cap = await BuildCapture.captureBuild(vs, { capturedAt: NOW })
  expect(cap!.provenance).toBe("SAMPLE") // never promoted to REAL — the wall's precondition (S28)
  expect(cap!.verified).toBe(false)
})

test("BUILD-CAPTURE (S30) — the OPTIONAL Foundry seam: an unavailable source → null; a no-build dir + skipBuild → null (no crash)", async () => {
  // an unavailable ingested source → null
  const un = ContractIngest.unavailable("v", NOW, "no verified source")
  expect(await BuildCapture.captureBuild(un, { capturedAt: NOW })).toBeNull()
  // a dir with sources but NO build-info, skipBuild → null (do not compile, never crash)
  const dir = mkdtempSync(path.join(tmpdir(), "bc2-"))
  try {
    writeFileSync(path.join(dir, "foundry.toml"), "[profile.default]\nsrc='src'\n")
    mkdirSync(path.join(dir, "src"))
    writeFileSync(path.join(dir, "src", "T.sol"), "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\ncontract T {}")
    const vs = ContractIngest.fromOperatorBuild({ protocol: "v", projectRoot: dir, asOf: NOW, attestVerified: true })
    expect(await BuildCapture.captureBuild(vs, { capturedAt: NOW, skipBuild: true })).toBeNull()
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
