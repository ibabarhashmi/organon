/**
 * ORGΛNON — THE BUILD-PROVENANCE SPRINT, Phase 2 walls (INGEST-LIVE, S30). The Operator-gated keyless-first verified-source
 * ingestion — HERMETIC (mocked fetch offline), positive-controlled:
 *   · a Sourcify FULL match → REAL + verified + content-hashed (the exact deployed source).
 *   · a Sourcify PARTIAL match → SAMPLE, verified=false, NEVER REAL (the REAL/SAMPLE wall's precondition — S28).
 *   · a 404 / error → unavailable, SAMPLE, files=[], never a fabricated REAL.
 *   · an Operator-supplied build dir attested verified → REAL; unattested → SAMPLE.
 *   · KEY-SAFE — an explorer key rides ONLY in the transport header; NO key string in the returned source / record (S20/S30).
 *   · keyless-first — no key → the keyless path, no crash; the fetch only ever hits sourcify.dev (no scrape).
 *   · DETERMINISTIC — the same source set → the same contentHash.
 */
import { test, expect } from "bun:test"
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { ContractIngest } from "../../src/contract/ingest"

const NOW = Date.parse("2026-07-09T00:00:00Z")
const ADDR = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

// a mock Sourcify v2 fetch that records the URLs + headers it was called with, and returns a canned response by `status`
function mockFetch(status: "full" | "partial" | "404", opts?: { calls?: { url: string; headers?: Record<string, string> }[] }): ContractIngest.FetchImpl {
  return async (url, headers) => {
    opts?.calls?.push({ url, headers })
    if (status === "404") return { status: 404, text: "not found" }
    const body = {
      match: status === "full" ? "exact_match" : "match", // v2: exact_match → REAL; "match" (partial) → SAMPLE
      runtimeMatch: status === "full" ? "exact_match" : "match",
      creationMatch: null,
      compilation: { compilerVersion: "0.8.20+commit.a1b2c3d4", language: "Solidity", name: "Vault" },
      sources: {
        "src/Vault.sol": { content: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\ncontract Vault { address public admin; function setAdmin(address a) external { admin = a; } }" },
      },
    }
    return { status: 200, text: JSON.stringify(body) }
  }
}

test("INGEST — a Sourcify FULL match → REAL + verified + content-hashed (the exact deployed source)", async () => {
  const vs = await ContractIngest.fromSourcify({ protocol: "vault", chainId: 1, address: ADDR, asOf: NOW, fetchImpl: mockFetch("full") })
  expect(vs.kind).toBe("sourcify-full")
  expect(vs.verified).toBe(true)
  expect(vs.provenance).toBe("REAL")
  expect(vs.files.some((f) => f.path.endsWith(".sol"))).toBe(true)
  expect(vs.compiler).toBe("0.8.20") // extracted from metadata
  expect(vs.contentHash).toMatch(/^[0-9a-f]{64}$/)
  expect(vs.source).toBe(`sourcify:exact:1:${ADDR}`)
})

test("INGEST (S28 precursor) — a Sourcify PARTIAL match → SAMPLE, verified=false, NEVER REAL", async () => {
  const vs = await ContractIngest.fromSourcify({ protocol: "vault", chainId: 1, address: ADDR, asOf: NOW, fetchImpl: mockFetch("partial") })
  expect(vs.kind).toBe("sourcify-partial")
  expect(vs.verified).toBe(false)
  expect(vs.provenance).toBe("SAMPLE") // a partial match is NOT the exact deployed source — the wall
})

test("INGEST — a 404 / dead source → unavailable, SAMPLE, files=[], never a fabricated REAL (no crash)", async () => {
  const vs = await ContractIngest.fromSourcify({ protocol: "vault", chainId: 1, address: ADDR, asOf: NOW, fetchImpl: mockFetch("404") })
  expect(vs.kind).toBe("unavailable")
  expect(vs.provenance).toBe("SAMPLE")
  expect(vs.files).toHaveLength(0)
  expect(vs.contentHash).toBeNull()
})

test("INGEST (S30) — KEY-SAFE: an explorer key rides ONLY in the transport header; NO key string in the recorded source", async () => {
  const SECRET = "explorer-test-key-INGESTMARKER-0123456789" // a dummy placeholder (NOT sk-/AIza-shaped — never a real secret in the repo)
  const calls: { url: string; headers?: Record<string, string> }[] = []
  const vs = await ContractIngest.fromSourcify({ protocol: "vault", chainId: 1, address: ADDR, asOf: NOW, fetchImpl: mockFetch("full", { calls }), explorerKey: SECRET })
  // the key rode in the transport header...
  expect(calls[0].headers?.Authorization).toContain(SECRET)
  // ...but NEVER reached the recorded VerifiedSource (source string / any field)
  expect(JSON.stringify(vs)).not.toContain("INGESTMARKER")
  expect(vs.source).not.toContain(SECRET)
})

test("INGEST (S30) — keyless-first: no key → the keyless path works; the fetch only ever hits sourcify.dev (no scrape)", async () => {
  const calls: { url: string; headers?: Record<string, string> }[] = []
  const vs = await ContractIngest.fromSourcify({ protocol: "vault", chainId: 1, address: ADDR, asOf: NOW, fetchImpl: mockFetch("full", { calls }) })
  expect(vs.provenance).toBe("REAL") // keyless works
  expect(calls[0].headers).toBeUndefined() // no Authorization header when no key
  for (const c of calls) expect(c.url).toContain("sourcify.dev") // only the keyless verified-source registry, never a scrape
})

test("INGEST — DETERMINISTIC: the same verified source set → the same contentHash", async () => {
  const a = await ContractIngest.fromSourcify({ protocol: "vault", chainId: 1, address: ADDR, asOf: NOW, fetchImpl: mockFetch("full") })
  const b = await ContractIngest.fromSourcify({ protocol: "vault", chainId: 1, address: ADDR, asOf: NOW + 999, fetchImpl: mockFetch("full") })
  expect(a.contentHash).toBe(b.contentHash) // the hash is over the SOURCE set, not the timestamp
})

test("INGEST — an Operator-supplied build dir: attested → REAL; unattested → SAMPLE; absent foundry.toml → unavailable", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "ingest-"))
  try {
    // absent foundry.toml → unavailable
    expect(ContractIngest.fromOperatorBuild({ protocol: "p", projectRoot: dir, asOf: NOW, attestVerified: true }).kind).toBe("unavailable")
    // a real foundry project with a .sol source
    writeFileSync(path.join(dir, "foundry.toml"), "[profile.default]\nsrc = 'src'\n")
    mkdirSync(path.join(dir, "src"))
    writeFileSync(path.join(dir, "src", "Token.sol"), "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\ncontract Token {}")
    const real = ContractIngest.fromOperatorBuild({ protocol: "p", projectRoot: dir, asOf: NOW, attestVerified: true })
    expect(real.provenance).toBe("REAL")
    expect(real.verified).toBe(true)
    expect(real.files.some((f) => f.path.endsWith("Token.sol"))).toBe(true)
    expect(real.compiler).toBe("0.8.19")
    // unattested → SAMPLE (never a fabricated REAL)
    expect(ContractIngest.fromOperatorBuild({ protocol: "p", projectRoot: dir, asOf: NOW, attestVerified: false }).provenance).toBe("SAMPLE")
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
