/**
 * ORGΛNON — THE GROUND-TRUTH SPRINT, Phase 2 wall (IMPL-REALIZED; X-GROUNDTRUTH a, S61). The metadata-pinned build's
 * compiled runtime bytecode is admitted to the screen ONLY on a MATCH to the deployed bytecode under the PINNED MASK RULE
 * (immutable-references + CBOR metadata tail — exactly two regions, DATA not a logic waiver). Hermetic: the mask/compare
 * predicate (BytecodeMatch) is tested on constructed fixtures (no forge, no network) — the one-byte-off control → MISMATCH
 * (UNVERIFIED, the screen never sees it); a deploy-patched immutable → a masked MATCH; a metadata-only difference → a
 * masked MATCH (recorded logic-match/metadata-differs); a logic-byte difference → MISMATCH. Then the COMMITTED capture
 * outcomes: compound-v3 MATCHED (the screen runs on the real Comet source), aave-v3 built-but-MISMATCHED → UNVERIFIED
 * (recorded verbatim, never waived) — a genuine improvement over Precision's both-UNVERIFIED. The impl-truth census present.
 */
import { test, expect } from "bun:test"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { BytecodeMatch } from "../../src/contract/bytecodematch"

// ── constructed fixture: [logicHead 6B][immutable 4B][logicMid 5B][cbor 3B][len 2B → tail = 3+2 = 5B] ──
const logicHead = "60".repeat(6)
const immStart = 6, immLen = 4
const logicMid = "52".repeat(5)
const cbor = "a2aabb"
const lenField = "0003" // declares 3 bytes of CBOR → the tail is 3 + 2 = 5 bytes
const compiled = logicHead + "00".repeat(immLen) + logicMid + cbor + lenField // immutable placeholder = zeros
const deployedPatched = logicHead + "11".repeat(immLen) + logicMid + cbor + lenField // immutable patched at deploy
const IMM: BytecodeMatch.ImmutableRefs = { "1": [{ start: immStart, length: immLen }] }

test("S61 (mask) — cborTailBytes reads the trailing length declaration; maskRuntime is deterministic and masks exactly the two regions", () => {
  expect(BytecodeMatch.cborTailBytes(compiled)).toBe(5) // 3 declared + the 2-byte length field
  const m1 = BytecodeMatch.maskRuntime(compiled, IMM)
  const m2 = BytecodeMatch.maskRuntime(compiled, IMM)
  expect(m1.masked).toBe(m2.masked) // deterministic
  expect(m1.cborBytes).toBe(5)
  expect(m1.immRegions).toBe(1)
  // the immutable region (bytes 6..10 → hex 12..20) and the 5-byte tail are zeroed; the logic head/mid survive
  expect(m1.masked.slice(0, 12)).toBe(logicHead) // untouched logic
  expect(m1.masked.slice(12, 20)).toBe("0".repeat(8)) // immutable zeroed
  expect(m1.masked.slice(-10)).toBe("0".repeat(10)) // 5-byte tail zeroed
})

test("S61 (match) — identical → unmasked MATCH; a deploy-patched immutable → masked MATCH (not unmasked)", () => {
  const same = BytecodeMatch.bytecodeMatches(compiled, compiled, IMM)
  expect(same.match).toBe(true)
  expect(same.unmaskedMatch).toBe(true)
  const patched = BytecodeMatch.bytecodeMatches(compiled, deployedPatched, IMM)
  expect(patched.match).toBe(true) // the immutable region is masked on both sides → logic matches
  expect(patched.unmaskedMatch).toBe(false) // but the raw bytes differ (the immutable value)
  expect(patched.maskedCompiledSha).toBe(patched.maskedDeployedSha)
})

test("S61 (the gate BITES) — a one-byte-off in a LOGIC region → MISMATCH → UNVERIFIED (the screen never sees unmatched source)", () => {
  const flipped = logicHead.slice(0, 2) + (logicHead[2] === "1" ? "2" : "1") + logicHead.slice(3) + "00".repeat(immLen) + logicMid + cbor + lenField
  const r = BytecodeMatch.bytecodeMatches(compiled, flipped, IMM)
  expect(r.match).toBe(false)
  expect(r.note).toMatch(/MISMATCH|STAYS UNVERIFIED/i)
})

test("S61 (metadata-only difference) — a difference ONLY in the CBOR tail → masked MATCH, recorded logic-match/metadata-differs (never unmasked)", () => {
  const otherMeta = logicHead + "00".repeat(immLen) + logicMid + "a2ccdd" + lenField // different cbor content, same length
  const r = BytecodeMatch.bytecodeMatches(compiled, otherMeta, IMM)
  expect(r.match).toBe(true)
  expect(r.unmaskedMatch).toBe(false)
  expect(r.note).toMatch(/metadata.*masked|logic MATCH/i)
})

test("S61 (length differs) — a different total length → MISMATCH (different code), never masked into a false match", () => {
  const r = BytecodeMatch.bytecodeMatches(compiled, compiled + "ff", IMM)
  expect(r.sameLength).toBe(false)
  expect(r.match).toBe(false)
})

test("S61 (masking is DATA, not a waiver) — masking never extends past the two declared regions (a logic byte adjacent to the tail is NOT masked)", () => {
  // a byte JUST before the 5-byte tail must remain comparable (masking only the declared tail, never a byte more)
  const a = logicHead + "00".repeat(immLen) + "52".repeat(5) + cbor + lenField
  const b = logicHead + "00".repeat(immLen) + "53".repeat(5) + cbor + lenField // logicMid differs (adjacent to tail)
  expect(BytecodeMatch.bytecodeMatches(a, b, IMM).match).toBe(false) // the difference is NOT masked away
})

// ── the committed capture outcomes (the honest ground truth) ──
const impl = (slug: string) => JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "governance", "impl-build", `${slug}.json`), "utf8"))

test("IMPL-REALIZED — compound-v3 MATCHED: the metadata-pinned build reproduces + matches the deployed bytecode → the screen runs on the REAL source", () => {
  const c = impl("compound-v3-usdc")
  expect(c.provenance).toBe("REAL")
  expect(c.verified).toBe(true)
  expect(c.match.matched).toBe(true)
  expect(c.match.maskedCompiledSha).toBe(c.match.maskedDeployedSha) // the match is re-verifiable
  expect(c.findings.length).toBeGreaterThan(0) // the analyzer ran on the real implementation source
  expect(c.contracts.length).toBeGreaterThan(0)
})

test("IMPL-REALIZED — aave-v3 MISMATCH → UNVERIFIED (built, but the runtime bytecode differs) — recorded verbatim, never waived", () => {
  const a = impl("aave-v3-pool")
  expect(a.provenance).toBe("UNVERIFIED")
  expect(a.verified).toBe(false)
  // it BUILT (the remapping/multi-file gap closed) but the compiled bytecode does NOT match → the source is NOT admitted
  expect(a.match?.matched === false || a.match === null).toBe(true)
  expect(a.findings === undefined || (Array.isArray(a.findings) && a.findings.length === 0)).toBe(true)
  expect(a.note).toMatch(/UNVERIFIED|does NOT match|never waived/i)
})

test("IMPL-REALIZED — the implementation-truth census is present (compound REAL-matched · aave UNVERIFIED) — a genuine improvement over Precision", () => {
  const censusP = path.join(PKG_ROOT, "data", "honesty", "governance", "impl-build", "census.json")
  expect(existsSync(censusP)).toBe(true)
  const census = JSON.parse(readFileSync(censusP, "utf8"))
  expect(census.matched).toContain("compound-v3-usdc")
  expect(census.unverified).toContain("aave-v3-pool")
  const comp = census.subjects.find((s: { subject: string }) => s.subject === "compound-v3-usdc")
  expect(comp.tier).toMatch(/REAL/)
  expect(comp.screened).toBe(true)
})

test("IMPL-REALIZED — the render prefers the bytecode-MATCHED impl (loadImpl reads impl-build/ first)", () => {
  const { Governance } = require("../../src/contract/governance")
  const govDir = path.join(PKG_ROOT, "data", "honesty", "governance")
  const loaded = Governance.loadImpl("compound-v3-usdc", { readFile: (p: string) => readFileSync(p, "utf8"), dir: govDir })
  expect(loaded.verified).toBe(true)
  expect(loaded.findings.length).toBeGreaterThan(0) // the matched impl source, not the legacy impl/ artifact
})
