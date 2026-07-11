/**
 * ORGΛNON — THE PRECISION SPRINT, Phase 2 wall (RESOLVER-TRUE — the captured moat). The committed governance artifacts
 * (data/honesty/governance/*.json) re-hash from their own body; every read is at ONE pinned block per subject; the real
 * classifications are honest (compound-v3 → TIMELOCK via owner; aave-v3 → UNRESOLVED, a ZERO admin slot NEVER read as
 * EOA); the cross-check is ABSENT-honest with NO key (the full pass is keyless-green); and the resolver is capture-time-
 * only — NO viem/whatsabi import, NO import in reality.ts / the verdict path, package.json deps = {hono, zod}.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Governance } from "../../src/contract/governance"

const govDir = path.join(PKG_ROOT, "data", "honesty", "governance")
const load = (slug: string) => JSON.parse(readFileSync(path.join(govDir, `${slug}.json`), "utf8"))
// only the per-subject governance artifacts (identified by a `poolKeys` field) — robust to sibling index/spec files
// (census.json, alarm-census.json, d29-promotion.json) that legitimately live in the same directory.
const artifacts = () => readdirSync(govDir).filter((f) => f.endsWith(".json")).map((f) => load(f.replace(/\.json$/, ""))).filter((a) => Array.isArray(a.poolKeys))

test("CAPTURE — every governance artifact re-hashes from its own body (content-hashed into the moat; tamper caught)", () => {
  for (const a of artifacts()) {
    const { contentSha, name, poolKeys, provenance, ...body } = a
    expect(createHash("sha256").update(JSON.stringify(body)).digest("hex"), `${a.subject} re-hash`).toBe(contentSha)
  }
})

test("CAPTURE (S59) — every artifact is block-pinned (ONE block per subject) and carries the raw admin slot value read at it", () => {
  for (const a of artifacts()) {
    expect(a.block, `${a.subject} block`).toBeTruthy()
    expect(/^\d+$/.test(String(a.block)), `${a.subject} block is a height`).toBe(true)
    expect(a.adminSlotValue).toMatch(/^0x[0-9a-f]{64}$/i)
  }
})

test("CAPTURE — the real classifications are honest: compound-v3 → TIMELOCK; aave-v3 → UNRESOLVED (a ZERO slot NEVER read as EOA)", () => {
  const comp = load("compound-v3-usdc")
  expect(comp.adminClass).toBe("TIMELOCK")
  expect(comp.probes.ownerIsTimelock).toBe(true) // resolved via the owner-hop to the Compound Timelock
  expect(Governance.isGated(comp.adminClass)).toBe(true)
  const aave = load("aave-v3-pool")
  expect(aave.adminSlotValue).toMatch(/^0x0+$/) // the standard admin slot is empty (immutable admin)
  expect(aave.adminClass).toBe("UNRESOLVED") // NOT EOA — the anti-cry-wolf rule bites on real data
  expect(aave.implementation).toBeTruthy() // yet the implementation resolves (impl slot non-zero)
})

test("CAPTURE (S59) — the cross-check is ABSENT-honest with NO key (the full pass is keyless-green; never load-bearing)", () => {
  // the battery runs with no ETHERSCAN_API_KEY (the walls force keys empty); every artifact records ABSENT, agrees=null
  for (const a of artifacts()) {
    expect(a.crossCheck.etherscan, `${a.subject}`).toBe("ABSENT")
    expect(a.crossCheck.agrees).toBe(null)
    expect(a.crossCheck.note).toMatch(/optional|never load-bearing|tool's own RPC rotation/i)
  }
})

test("CAPTURE — the census records the shelf admin-class distribution (0 EOA — the curated shelf's key-holders are gated or unresolved)", () => {
  const census = JSON.parse(readFileSync(path.join(govDir, "census.json"), "utf8"))
  expect(census.census.EOA).toBe(0)
  expect(census.census.TIMELOCK).toBeGreaterThanOrEqual(1)
  expect(Object.values(census.census as Record<string, number>).reduce((a, b) => a + b, 0)).toBe(census.subjects.length)
})

test("CAPTURE (S59) — the resolver is capture-time-only: NO viem/whatsabi import, NONE in reality.ts / the verdict path, deps = {hono, zod}", () => {
  const stripComments = (s: string) => s.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "")
  const importsBanned = (rel: string): boolean => {
    const f = path.join(PKG_ROOT, rel)
    if (!existsSync(f)) return false
    return /(?:^|\n)\s*import\b[^\n]*\bfrom\s*["'](?:viem|@shazow\/whatsabi)["']/.test(stripComments(readFileSync(f, "utf8")))
  }
  // the branch-B capture + the pure module import NO resolver dependency
  expect(importsBanned("script/capture/governance.ts")).toBe(false)
  expect(importsBanned("src/contract/governance.ts")).toBe(false)
  // the render + verdict path are clean
  for (const rel of ["src/studio/reality.ts", "src/analytics/scorecard.ts", "src/studio/stamp.ts", "src/ask/gates.ts"]) expect(importsBanned(rel), `${rel} imports a resolver dep`).toBe(false)
  // the mass path stays hono+zod
  const pkg = JSON.parse(readFileSync(path.join(PKG_ROOT, "package.json"), "utf8"))
  expect(Object.keys(pkg.dependencies ?? {}).sort()).toEqual(["hono", "zod"])
})
