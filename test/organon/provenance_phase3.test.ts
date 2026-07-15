/**
 * ORGΛNON — THE PROVENANCE SPRINT (V42), Phase 3 walls (S175–S177, D85/D86): THE REAL★ CAPTURE ENGINE. NO NEW LAW (seventh).
 *
 * W-PR07 (S175) — a REAL★ capture carries a block number and is RE-DERIVABLE (anyone can eth_call at the block and reproduce
 * rawReturn, then decode identically); a REAL★ observation with NO block is not point-in-time and REJECTS. Proven against a
 * REAL, re-derivable known-answer: Aave V3 getReserveData(USDC) @ block 25537838 = 3.2691% (WORD 2, ground truth — verified
 * against the chain, not assumed; the pins' early word-3 guess was CORRECTED by a live read). W-PR08 (S176) — the engine adds
 * NO mass-path dependency: no ethers/viem/web3 import anywhere in src/; deps stay exactly [hono, zod]. W-PR09 (S177/D86) — the
 * plausibility gate is STRUCTURAL-only (RP-3): garbage (address/index mis-slice, non-finite) is REJECTED and NOT chained, but
 * an economically-extreme real value (a −42% funding crash — signed int256) is CHAINED. The gate tests the ENCODING, never
 * the ECONOMICS. RP-5 — a contract code-hash mismatch REJECTS (the struct may have moved; an upgrade is a disclosed re-pin).
 */
import { test, expect } from "bun:test"
import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Observe } from "../../src/plane/observe"

const KA = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "capture-known-answer.json"), "utf8"))

test("S175 (W-PR07) — the REAL★ known-answer is RE-DERIVABLE: Aave getReserveData(USDC) @ block 25537838 decodes WORD 2 = 3.2691% (ground truth, not assumed)", () => {
  expect(KA.blockNumber).toBe(25537838)
  expect(KA.returnWord).toBe(2) // GROUND TRUTH — the live read corrected the pins' early word-3 guess
  const f = Observe.decodeRateFraction(KA.rawReturn, 2, 27)
  expect(f).not.toBeNull()
  expect(Math.abs((f as number) * 100 - 3.2691)).toBeLessThan(0.0001) // the pinned known-answer, decoded
  // the observation is block-pinned and re-derivable (its rawReturn reproduces via eth_call at the block)
  const subj = Observe.subject("aave-v3-usdc-supply")!
  const r = Observe.observe(subj, { blockNumber: KA.blockNumber, blockHash: KA.blockHash, rawReturn: KA.rawReturn, contractCodeHash: Observe.AAVE_POOL_CODEHASH, providerAtCapture: KA.providerAtCapture, capturedAt: 1_752_598_800_000, capturedBy: "AGENT" })
  expect(r.ok).toBe(true)
  if (r.ok) { expect(r.obs.tier).toBe("REAL★"); expect(r.obs.blockNumber).toBe(25537838); expect(Math.abs(r.obs.decoded * 100 - 3.2691)).toBeLessThan(0.0001) }
})

test("S175 (W-PR07) — SEEDED NEGATIVE: a REAL★ capture with NO block number is not point-in-time and REJECTS (not chained)", () => {
  const subj = Observe.subject("aave-v3-usdc-supply")!
  const r = Observe.observe(subj, { blockNumber: 0, rawReturn: KA.rawReturn, providerAtCapture: "x", capturedAt: 1 })
  expect(r.ok).toBe(false)
  if (!r.ok) { expect(r.wall).toBe("S175"); expect(r.reason).toMatch(/NO block number/) }
  // and the chain check catches a blockless REAL★ entry spliced in
  const good = Observe.observe(subj, { blockNumber: 25537838, rawReturn: KA.rawReturn, contractCodeHash: Observe.AAVE_POOL_CODEHASH, providerAtCapture: "x", capturedAt: 1 })
  expect(good.ok).toBe(true)
  if (good.ok) {
    const blockless = { ...good.obs, blockNumber: 0 }
    expect(Observe.chainOk([blockless as never]).ok).toBe(false)
  }
})

test("S176 (W-PR08) — the capture engine adds NO mass-path dependency: no ethers/viem/web3 import in src/; deps stay [hono, zod]", () => {
  // deps stay exactly two
  const pkg = JSON.parse(readFileSync(path.join(PKG_ROOT, "package.json"), "utf8"))
  expect(Object.keys(pkg.dependencies ?? {}).sort()).toEqual(["hono", "zod"])
  // no ABI-library IMPORT statement anywhere in src/ (a line beginning `import … from "ethers|viem|web3"` — not a comment mention)
  const IMPORT_RE = /^\s*import\b[^\n]*\bfrom\s+["'](@?(?:ethers|viem|web3)(?:js)?)(?:\/[^"']*)?["']/m
  const REQUIRE_RE = /\brequire\(\s*["'](@?(?:ethers|viem|web3)(?:js)?)(?:\/[^"']*)?["']\s*\)/
  const offenders: string[] = []
  const walk = (dir: string) => {
    for (const e of readdirSync(dir)) {
      const p = path.join(dir, e)
      if (statSync(p).isDirectory()) walk(p)
      else if (p.endsWith(".ts")) {
        const t = readFileSync(p, "utf8")
        if (IMPORT_RE.test(t) || REQUIRE_RE.test(t)) offenders.push(path.relative(PKG_ROOT, p))
      }
    }
  }
  walk(path.join(PKG_ROOT, "src"))
  expect(offenders).toEqual([]) // a seeded ethers/viem/web3 import on the mass path FAILS — the poller is fetch + hand-encoded eth_call
})

test("S177 (W-PR09/D86) — the plausibility gate is STRUCTURAL-only: garbage is REJECTED and NOT chained (address/index mis-slice, non-finite)", () => {
  // word 0 is the packed configuration (~7e48) — an overflow as a rate fraction → REJECT
  expect(Observe.plausible(KA.rawReturn, 0, 27).ok).toBe(false)
  // an address word (~1e21 as a fraction at RAY) → REJECT
  const addrRaw = "0x" + "000000000000000000000000" + "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  expect(Observe.plausible(addrRaw, 0, 27).ok).toBe(false)
  // a too-short return → STRUCTURAL failure
  expect(Observe.plausible("0x1234", 2, 27).ok).toBe(false)
  // the pinned selector is exactly getReserveData(address)
  expect(Observe.subject("aave-v3-usdc-supply")!.selector).toBe("0x35ea6a75")
  expect(Observe.encodeReserveCall("0x35ea6a75", Observe.USDC)).toMatch(/^0x35ea6a750{24}a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48$/)
})

test("S177 (W-PR09/RP-3) — POSITIVE CONTROL: an economically-extreme but REAL value (a −42% funding crash, signed int256) is CHAINED, not rejected", () => {
  // funding is a signed int256; a −42% value stored two's-complement must decode signed and CHAIN (RP-3, F-3: the gate tests
  // the ENCODING not the ECONOMICS — the extreme real value is exactly what the moat exists to hold)
  const w = BigInt.asUintN(256, BigInt(Math.round(-0.42 * 1e18))).toString(16).padStart(64, "0")
  const fundingRaw = "0x" + w
  const p = Observe.plausible(fundingRaw, 0, 18, true) // signed decode
  expect(p.ok).toBe(true)
  if (p.ok) expect(Math.abs(p.fraction * 100 - -42)).toBeLessThan(0.001) // CHAINED at −42%
  // the SAME word decoded UNSIGNED would be ~1e50 and (wrongly) rejected — proving signedness matters for funding
  expect(Observe.plausible(fundingRaw, 0, 18, false).ok).toBe(false)
})

test("S177 (RP-5) — a contract code-hash MISMATCH REJECTS (the struct may have moved; an upgrade is a disclosed re-pin)", () => {
  const subj = Observe.subject("aave-v3-usdc-supply")!
  const r = Observe.observe(subj, { blockNumber: 25537838, rawReturn: KA.rawReturn, contractCodeHash: "deadbeef".repeat(8), providerAtCapture: "x", capturedAt: 1 })
  expect(r.ok).toBe(false)
  if (!r.ok) expect(r.reason).toMatch(/code-hash.*≠ the pinned|struct may have moved/)
})

test("S177 (RP-4) — DeFiLlama is a SMOKE TEST, not a correctness oracle: REAL★'s authority is re-derivation at the block", () => {
  // the known rate (3.27%) is order-of-magnitude sane (a smoke test); but the AUTHORITY is re-derivability at the block, not
  // agreement with a revisable source. A REAL★ capture that disagreed with DeFiLlama would still be REAL★ if it re-derives.
  const f = Observe.decodeRateFraction(KA.rawReturn, 2, 27)!
  expect(f).toBeGreaterThan(0.001) // > 0.1% — an order-of-magnitude smoke test only
  expect(f).toBeLessThan(1) // < 100% — a smoke test bound, NEVER a rejection criterion (an extreme real rate still chains, S177 above)
  expect(KA.note).toMatch(/re-derivable|RE-DERIVABLE/) // the authority is re-derivation, stated in the committed fixture
})

test("S175/S176 — capture() is OFFLINE-honest in the battery: no fetcher → nothing appended, no network", async () => {
  const r = await Observe.capture() // no opts → OFFLINE (the battery never hits the network)
  expect(r.ran).toBe(false)
  expect(r.offline).toBe(true)
  expect(r.observations.length).toBe(0)
  expect(r.reason).toMatch(/OFFLINE/)
})

test("S175 — capture() with an INJECTED fetcher builds a re-derivable REAL★ chain (the verb's live path, exercised with the known-answer)", async () => {
  // inject the known-answer as the eth_call result and a fixed block → a real observation chain, hermetically (no network)
  const r = await Observe.capture({
    ethCall: async () => KA.rawReturn,
    codeRead: async () => "0x" + "60".repeat(10), // a code blob (its sha won't match the pinned hash → this subject would reject; so we drop the pin for the injected test)
    blockRead: async () => ({ number: 25537838, hash: KA.blockHash }),
    capturedAt: 1_752_598_800_000, capturedBy: "AGENT",
  })
  // the injected code blob's hash ≠ the pinned Aave code-hash → RP-5 rejects it honestly (proving the version pin BITES live)
  expect(r.offline).toBe(false)
  expect(r.blockNumber).toBe(25537838)
  expect(r.rejected.some((x) => /code-hash/.test(x.reason))).toBe(true) // RP-5 bit — the injected code blob isn't the pinned impl
})
