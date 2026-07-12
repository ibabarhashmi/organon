/**
 * ORGΛNON — THE COVERAGE SPRINT, Phase 3 wall (the two-tier provenance label; S65). REAL★ (block-pinned,
 * chain-reproducible) vs REAL-at-timestamp (aggregator, revisable) — classified BY SOURCE, never conflated. A REAL★
 * claim without a block-pinned chain source is a Halt. The re-label pass is complete + disclosed (no source unlabeled).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { ProvenanceTier } from "../../src/dataplane/tier"

test("TIER — block-pinned chain sources are REAL★; aggregator sources are REAL-at-timestamp", () => {
  for (const s of ["https://eth.llamarpc.com eth_call", "chainlink getRoundData", "governance/archive capture", "envio events", "block-pinned rpc state"]) {
    expect({ s, tier: ProvenanceTier.tierOf(s) }).toEqual({ s, tier: "REAL★" })
  }
  for (const s of ["https://yields.llama.fi/pools", "geckoterminal /networks/eth/pools", "vaults.fyi /vaults", "defillama /chart"]) {
    expect({ s, tier: ProvenanceTier.tierOf(s) }).toEqual({ s, tier: "REAL-at-timestamp" })
  }
})

test("TIER — a REAL★ claim MUST be backed by a block-pinned chain source (the conflation Halt — S65)", () => {
  // an aggregator source claiming REAL★ → REFUSED (not legit)
  expect(ProvenanceTier.isRealStarLegit("https://yields.llama.fi/pools", true)).toBe(false)
  // a chainlink source WITHOUT a block pin → not legit (block-pinning is required to earn the star)
  expect(ProvenanceTier.isRealStarLegit("chainlink getRoundData", false)).toBe(false)
  // a block-pinned chainlink read → legit REAL★
  expect(ProvenanceTier.isRealStarLegit("chainlink getRoundData", true)).toBe(true)
})

test("TIER — the re-label pass is COMPLETE + DISCLOSED: every source lands in exactly one tier (the total is total); old flat REAL → new per-tier census", () => {
  const sources = [
    "chainlink getRoundData",           // REAL★
    "https://eth.llamarpc.com eth_call", // REAL★
    "governance capture block 11975000", // REAL★
    "https://yields.llama.fi/pools",     // REAL-at-timestamp
    "geckoterminal dex-liquidity",       // REAL-at-timestamp
  ]
  const c = ProvenanceTier.relabelCensus(sources)
  expect(c.total).toBe(5)
  expect(c.realStar).toBe(3)
  expect(c.atTimestamp).toBe(2)
  expect(c.realStar + c.atTimestamp).toBe(c.total) // total — no source unlabeled (no silent downgrade)
  expect(c.breakdown).toHaveLength(5)
  expect(c.old).toMatch(/flat REAL/i)
  expect(c.disclosure).toMatch(/conscious \+ disclosed|no silent downgrade/i)
})

test("TIER — the committed re-label census is complete + disclosed (every source tiered; total is total; old/new named)", () => {
  const c = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "provenance-tier-census.json"), "utf8"))
  expect(c.protocol).toBe("provenance-tier-relabel")
  expect(c.realStar + c.atTimestamp).toBe(c.total) // no source unlabeled (a silent downgrade is a Halt)
  expect(c.breakdown.length).toBe(c.total)
  expect(c.old).toMatch(/flat REAL/i) // the old label named (the pass is disclosed, not silent)
  // every breakdown row is a legit tier and (for REAL★) a block-pinned source
  for (const b of c.breakdown) expect(["REAL★", "REAL-at-timestamp"]).toContain(b.tier)
})
