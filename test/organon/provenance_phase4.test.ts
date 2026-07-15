/**
 * ORGΛNON — THE PROVENANCE SPRINT (V42), Phase 4 wall (S178): THE RETROSPECTIVE BOUNDARY. NO NEW LAW (seventh sprint).
 *
 * W-PR10 (S178) — REAL★ and RETROSPECTIVE NEVER MIX (the research's cardinal provenance sin). A REAL★ chain contains only
 * block-pinned, non-revisable REAL★ entries; a RETROSPECTIVE chain contains only revisable, block-LESS provider-chart points
 * (DeFiLlama /yields). A cross-contamination in EITHER direction — a RETROSPECTIVE point spliced into the REAL★ chain, or a
 * REAL★ point missing its block — is a violation. RP-4 (F-4) — DeFiLlama is a SMOKE TEST, never a correctness oracle: the
 * REAL★ re-derived value (3.2691% @ block 25537838) and DeFiLlama's RETROSPECTIVE chart (3.27033%) AGREE to 0.0012pp, but
 * REAL★'s authority is re-derivation at the block — a REAL★ that DISAGREED with DeFiLlama would still be REAL★ if it re-derives.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Observe } from "../../src/plane/observe"

const KA = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "capture-known-answer.json"), "utf8"))
const RETRO = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "capture-retrospective.json"), "utf8"))

function realStar() {
  const subj = Observe.subject("aave-v3-usdc-supply")!
  const r = Observe.observe(subj, { blockNumber: KA.blockNumber, blockHash: KA.blockHash, rawReturn: KA.rawReturn, contractCodeHash: Observe.AAVE_POOL_CODEHASH, providerAtCapture: KA.providerAtCapture, capturedAt: 1_752_598_800_000, capturedBy: "AGENT" })
  if (!r.ok) throw new Error("known-answer failed to observe")
  return r.obs
}

test("S178 (W-PR10) — DeFiLlama /yields is ingested as RETROSPECTIVE (revisable, block-less) and lives in a chain STRUCTURALLY distinct from REAL★", () => {
  expect(RETRO.tier).toBe("RETROSPECTIVE")
  expect(RETRO.revisable).toBe(true)
  expect(RETRO.source).toBe("defillama")
  expect(RETRO.blockNumber).toBeUndefined() // a provider chart is NOT block-pinned (it would masquerade as REAL★)
  const retro = Observe.retrospective({ asset: RETRO.asset, poolId: RETRO.poolId, apyPct: RETRO.apyPct, at: 1_752_598_800_000 })
  expect(retro.tier).toBe("RETROSPECTIVE")
  expect(retro.revisable).toBe(true)
  // the two chains are clean
  const realChain = [realStar()]
  const retroChain = [retro]
  expect(Observe.boundaryViolations(realChain, retroChain)).toEqual([])
})

test("S178 (W-PR10) — SEEDED NEGATIVE: a RETROSPECTIVE point spliced into the REAL★ chain FAILS (the cardinal sin, walled)", () => {
  const retro = Observe.retrospective({ asset: "USDC", poolId: RETRO.poolId, apyPct: 3.27, at: 1 })
  const contaminated = [realStar(), retro as unknown as ReturnType<typeof realStar>]
  const v = Observe.boundaryViolations(contaminated, [])
  expect(v.length).toBeGreaterThan(0)
  expect(v.join(" ")).toMatch(/non-REAL★ point in the REAL★ series|cardinal sin/)
})

test("S178 (W-PR10) — SEEDED NEGATIVE: a REAL★ point (block-pinned) spliced into the RETROSPECTIVE chain FAILS (masquerading as revisable)", () => {
  const v = Observe.boundaryViolations([], [realStar() as unknown as Record<string, unknown>])
  expect(v.length).toBeGreaterThan(0)
  expect(v.join(" ")).toMatch(/carries a block number|masquerade as REAL★/)
})

test("S178 (RP-4) — DeFiLlama is a SMOKE TEST, not a correctness oracle: REAL★ (re-derived) and RETROSPECTIVE AGREE to ~0.001pp, but REAL★'s authority is re-derivation", () => {
  const rs = realStar().decoded * 100 // 3.2691%, re-derivable at the block
  expect(Math.abs(rs - 3.2691)).toBeLessThan(0.001)
  // the DeFiLlama value AGREES order-of-magnitude (a smoke test) — CLOSE, not identical (different methodologies)
  expect(Math.abs(rs - RETRO.apyPct)).toBeLessThan(0.5) // within half a point — an order-of-magnitude smoke test
  expect(RETRO.smokeTestAgainstRealStar.verdict).toMatch(/REAL★ is authoritative by re-derivation/)
  // the fixture states, explicitly, that DeFiLlama is not the oracle
  expect(RETRO.note).toMatch(/NOT a correctness oracle|smoke test/i)
})

test("S178 — the false-fire count feeds from BOTH tiers: REAL★ (own, block-pinned) leading, RETROSPECTIVE (revisable) beneath with its revisability STATED", () => {
  // the two tiers coexist for the false-fire count (V38 countBoth), but they never MIX in one chain (S178). The own (REAL★)
  // leg leads; the retrospective leg is present but marked revisable — the honest ordering (RP-3 of V39, carried).
  const realChain = [realStar()]
  const retroChain = [Observe.retrospective({ asset: "USDC", poolId: RETRO.poolId, apyPct: RETRO.apyPct, at: 1 })]
  expect(realChain[0].tier).toBe("REAL★")
  expect(retroChain[0].revisable).toBe(true)
  expect(Observe.boundaryViolations(realChain, retroChain)).toEqual([]) // coexist, structurally distinct, never mixed
})
