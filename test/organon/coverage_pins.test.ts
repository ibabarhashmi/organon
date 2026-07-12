/**
 * ORGΛNON — THE COVERAGE SPRINT, Phase 0 wall (PINS-LOCKED). coverage-pins.json is self-consistent, carried from the
 * Redesign head (which carried GroundTruth), and pins every X-COVERAGE + X-CORRELATE contract — the license posture
 * VERBATIM (a summarization is a detectable Halt), the three branches, the 'covered' definition (SAMPLE-only excluded),
 * the two-tier label, the Chainlink read spec (staleness + L2 sequencer), the Pyth refusal DATED, the correlate spec
 * (agglomerative-not-k-means, the overlap floor, the non-advisory wording, the deflation-inert wall, the activation gate
 * needing BOTH trigger and pen), GT1–GT5, D32/D33 reserved (Operator-signed=false — LN5), S1–S66. The lock bites.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const cv = JSON.parse(readFileSync(path.join(H, "coverage-pins.json"), "utf8"))
const REDESIGN = JSON.parse(readFileSync(path.join(H, "redesign-pins.json"), "utf8"))

test("COVERAGE — the pins hash-lock is self-consistent + carried from the Redesign head (a moved pin moves the sha)", () => {
  const { pinsSha, ...rest } = cv
  expect(sha256(JSON.stringify(rest))).toBe(cv.pinsSha) // self-consistent
  expect(cv.carriedFromPinsSha).toBe(REDESIGN.pinsSha) // carried forward, never rebuilt
  const mutated = JSON.parse(JSON.stringify(rest)); mutated.xCorrelate.a_deterministic.mergeThreshold = 0.99
  expect(sha256(JSON.stringify(mutated))).not.toBe(cv.pinsSha) // POSITIVE CONTROL: an edited pinned constant moves the sha
})

test("COVERAGE — X-COVERAGE(a): the license posture is pinned VERBATIM (the USD-100k clause + the standing exposure), the three branches present; a summarization would fail the verbatim assert (S64)", () => {
  const a = cv.xCoverage.a_licensePosture
  // the ToS clause is pinned verbatim — the exact USD-100k figure + the non-commercial license
  expect(a.tosVerbatim).toContain("NON-COMMERCIAL license")
  expect(a.tosVerbatim).toContain("USD 100,000 per violation")
  expect(a.usd100kClause).toBe("liquidated damages up to USD 100,000 per violation")
  // the STANDING existing-use exposure is confessed verbatim (the discovery that cuts backward)
  expect(a.standingExposureVerbatim).toMatch(/already uses DeFiLlama's free tier today/i)
  expect(a.standingExposureVerbatim).toMatch(/not hypothetical but standing/i)
  // all THREE branches are pre-designed (the integration cannot stall)
  expect(a.branches.alpha).toMatch(/consent.*SERVES/i)
  expect(a.branches.beta).toMatch(/paid.*API.*NOT included in the \$300\/mo Pro/i) // the Pro-vs-API purchase trap named
  expect(a.branches.gamma).toMatch(/DEGRADE to SAMPLE-labeled/i)
  // the Operator action is dated + Operator-gated (LN5 — the agent never signs)
  expect(a.operatorAction).toMatch(/D32/); expect(a.operatorAction).toMatch(/Operator-signed=false|LN5/i)
})

test("COVERAGE — X-COVERAGE(b,c,d): lookup per-axis degrade · the two-tier label · the 'covered' definition excludes SAMPLE-only (the census is an outcome, never a target)", () => {
  expect(cv.xCoverage.b_lookupPerAxisDegrade.rule).toMatch(/PER-AXIS.*REAL★.*REAL-at-timestamp.*SAMPLE.*UNVERIFIED/i)
  expect(cv.xCoverage.b_lookupPerAxisDegrade.notABiggerShelf).toMatch(/a path, not a fourth screen/i)
  expect(cv.xCoverage.c_twoTierProvenance.rule).toMatch(/REAL★ \(block-pinned/i)
  expect(cv.xCoverage.c_twoTierProvenance.rule).toMatch(/REAL-at-timestamp \(aggregator/i)
  // 'covered' EXCLUDES SAMPLE-only — the census cannot be gamed by counting thin lookups
  expect(cv.xCoverage.d_censusOutcome.coveredDefinition).toMatch(/SAMPLE-only does NOT count/i)
  expect(cv.xCoverage.d_censusOutcome.rule).toMatch(/OUTCOME|never gamed|never a target/i)
})

test("COVERAGE — the price layer: Chainlink block-pinned getRoundData → REAL★, the staleness + L2-sequencer checks pinned; Pyth REFUSED with its DATED reason; vaults.fyi BYOK-only", () => {
  const p = cv.xCoverage.priceLayer
  expect(p.chainlinkSpec).toMatch(/getRoundData/); expect(p.chainlinkSpec).toMatch(/block-pinned → REAL★/i)
  expect(p.stalenessBound).toMatch(/updatedAt.*within the pinned bound/i)
  expect(p.l2SequencerCheck).toMatch(/Sequencer-Uptime/i)
  expect(p.pythRefusalVerbatim).toMatch(/July 31, 2026/) // the dated cliff — a free dependency with a dated rug-pull is not free
  expect(cv.xCoverage.vaultsFyi).toMatch(/BYOK-ONLY/i); expect(cv.xCoverage.vaultsFyi).toMatch(/absent → the free path is BYTE-EXACT/i)
})

test("COVERAGE — X-CORRELATE(a,b): deterministic (agglomerative, NOT k-means; randomness prohibited by pin+grep) + the minimum-overlap INSUFFICIENT floor (S66)", () => {
  const a = cv.xCorrelate.a_deterministic
  expect(a.rule).toMatch(/agglomerative average-linkage on the 1−ρ distance/i)
  expect(a.rule).toMatch(/K-MEANS AND SEEDED RANDOMNESS ARE PROHIBITED/i)
  expect(a.rule).toMatch(/BYTE-IDENTICAL clusters/i)
  expect(typeof a.mergeThreshold).toBe("number") // the threshold is a PINNED constant (an edit moves the sha)
  expect(a.prohibited).toContain("kmeans"); expect(a.prohibited).toContain("Math.random")
  expect(typeof cv.xCorrelate.b_minOverlapFloor.minOverlap).toBe("number") // the overlap floor is pinned
  expect(cv.xCorrelate.b_minOverlapFloor.rule).toMatch(/INSUFFICIENT|fabricated precision/i)
})

test("COVERAGE — X-CORRELATE(c,d,e): the non-advisory wording VERBATIM · the deflation stays INERT (familyN===1) · the activation needs BOTH the trigger AND the Operator's pen", () => {
  // the diversification wording is pinned verbatim (the advice wall re-runs on it; a summarization/advisory phrasing fails)
  const w = cv.xCorrelate.c_factNotAdvice.wordingVerbatim
  expect(w.general).toBe("these N pools' recorded yields are ρ-correlated; effectively ≈ K independent bets")
  expect(w.rule).toMatch(/never an allocation recommendation|Markowitz.*REJECTED/i)
  // the deflation stays inert — familyN===1 in every Stamp output; a seeded K-feed refused
  expect(cv.xCorrelate.d_deflationInert.rule).toMatch(/familyN === 1/); expect(cv.xCorrelate.d_deflationInert.rule).toMatch(/REFUSED/i)
  // the activation gate REQUIRES BOTH the trigger and the pen (a gate with only one is refused)
  const g = cv.xCorrelate.e_activationGate
  expect(g.gateVerbatim).toMatch(/ONLY when BOTH the already-pinned trigger fires .* AND the Operator signs/i)
  expect(g.trigger).toMatch(/20–50 trials\/family/)
})

test("COVERAGE — GT1–GT5 are pinned; D32/D33 reserved Operator-signed=false (LN5, D27 still first); S1–S66", () => {
  for (const k of ["GT1", "GT2", "GT3", "GT4", "GT5"]) expect(typeof cv.gt[k]).toBe("string")
  expect(cv.gt.GT1).toMatch(/aave.*1967 slot|never read as 'aave fixed'|aave fixed/i)
  expect(cv.gt.GT2).toMatch(/voc_proposer.*timeout|load-tolerant|5s budget/i)
  expect(cv.gt.GT5).toMatch(/PAID Network capture/i)
  expect(cv.deviations.D32).toMatch(/RESERVED/); expect(cv.deviations.D33).toMatch(/RESERVED/)
  expect(cv.deviations.operatorGatedNote).toMatch(/D27 STILL FIRST/i)
  expect(cv.deviations.operatorGatedNote).toMatch(/NEVER signs it \(LN5\)/i)
  // S1–S66 catalog present (carried S1–S63 + the three new)
  expect(cv.stressCatalog.count).toBe(66)
  for (const k of ["S64", "S65", "S66"]) expect(typeof cv.stressCatalog[k]).toBe("string")
})

test("COVERAGE — the constitution carried byte-untouched: deps hono+zod, screens 3, differential/bundle/kill-criterion prefixes, the Stage-2/3/4 expansions parked BY NAME", () => {
  expect(cv.carried.deps).toEqual(["hono", "zod"])
  expect(cv.carried.screens).toEqual(["shelf", "reality-check", "ask"])
  expect(cv.carried.verdictDifferential.lendingFpSetShaPrefix).toBe("70c7912f")
  expect(cv.carried.verdictDifferential.fundingReproHashPrefix).toBe("0a63151b")
  expect(cv.carried.evidenceBundleShaPrefix).toBe("9c1e7bd8")
  expect(cv.carried.killCriterion).toBe("8b4e094b")
  expect(cv.carried.parkedByName).toContain("Pyth (the dated cost cliff)")
  expect(cv.carried.parkedByName).toContain("dYdX cross-venue funding")
})
