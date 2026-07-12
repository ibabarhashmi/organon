/**
 * ORGΛNON — THE COLLAPSE-BACKTEST (Domain sprint; X-BACKTEST, S68/S70). Verifies the committed backtest artifacts
 * deterministically (no network): every capture re-hashes + names its endpoints/height; the ENGINE was read-only through
 * the run (git diff -- src/ empty at start AND end); the subject set matches the Phase-0 pin hash (no post-hoc swap); the
 * MISS-REPORTED wall — the seeded would-have-said-SOLID subject surfaces as a MISS (never buried); the claim is worded to
 * the evidence in BOTH directions; the zero-miss-zero-gap suspicion flag; S70 — the tiers/hashes hold across every capture.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const B = path.join(H, "backtest")
const readJson = (p: string) => JSON.parse(readFileSync(p, "utf8"))
const summary = readJson(path.join(B, "summary.json"))
const dm = readJson(path.join(H, "domain-pins.json"))
const ids = ["B1-lst-steth-2022", "B2-stable-dydx-funding-flip", "B3-looped-steth-aave-2022", "B4-rwa-maple-orthogonal-2022", "SEED-MISS"]

test("S68 — the engine was READ-ONLY through the replay (git diff -- src/ empty at start AND end — tuning while measuring is a Halt)", () => {
  expect(summary.engineUnmodified.gitDiffSrcEmptyAtStart).toBe(true)
  expect(summary.engineUnmodified.gitDiffSrcEmptyAtEnd).toBe(true)
})

test("S68 — the subject set matches the Phase-0 pin hash (no post-hoc swap; a subject chosen after seeing results fails here)", () => {
  expect(summary.subjectSetHash).toBe(dm.xBacktest.a_pinnedBeforeCapture.subjectSetHash)
  expect(sha256(JSON.stringify(dm.xBacktest.a_pinnedBeforeCapture.subjects))).toBe(summary.subjectSetHash)
})

test("S68 — every capture re-hashes + names its endpoints and height (content-hashed, re-verifiable)", () => {
  for (const id of ids) {
    const r = readJson(path.join(B, `${id}.json`))
    const { contentSha, ...body } = r
    expect(sha256(JSON.stringify({ ...body, contentSha: undefined }))).toBe(contentSha) // re-hashes
    expect(typeof r.height).toBe("number")
    expect(["HIT", "MISS", "GAP"]).toContain(r.outcome)
    if (r.outcome === "HIT") expect(r.endpoints.length).toBeGreaterThanOrEqual(1) // a HIT names its source(s)
    // cross-check applies to the multi-RPC ARCHIVE captures (B1); a single-source INDEXER hit (B2, dYdX) cannot be tri-endpoint
    if (r.outcome === "HIT" && r.domain === "LST-LRT") expect(r.crossChecked).toBe(true)
    if (r.outcome === "GAP") expect(r.claim).toMatch(/GAP —/) // a gap is recorded by name, never simulated
  }
})

test("S68 — THE MISS-REPORTED WALL: the seeded would-have-said-SOLID subject surfaces as a MISS in the artifact AND the summary (never buried)", () => {
  const seed = readJson(path.join(B, "SEED-MISS.json"))
  expect(seed.seeded).toBe(true)
  expect(seed.outcome).toBe("MISS") // a perfect-on-chain RWA renders SOLID today (cap not installed) → a MISS
  expect(seed.reads.onchainVerdict).toBe("SOLID")
  expect(seed.reads.wouldCapUnderD35).toBe(true) // a signed D35 would cap it
  // the MISS is in the summary's missesReported (the gravest wall — a dropped miss is the worst failure)
  const reported = summary.missesReported.map((m: { id: string }) => m.id)
  expect(reported).toContain("SEED-MISS-rwa-perfect")
  expect(summary.scoreline.misses).toBeGreaterThanOrEqual(1)
  for (const m of summary.missesReported) expect(typeof m.rootCause).toBe("string") // every miss is root-caused
})

test("S68 — the claim is worded to the evidence in BOTH directions (N hits, K misses, J gaps); the scoreline is honest", () => {
  const s = summary.scoreline
  expect(summary.claim).toMatch(new RegExp(`would have flagged ${s.hits} of ${s.reached} reachable`))
  expect(summary.claim).toMatch(new RegExp(`missed ${s.misses}`))
  expect(summary.claim).toMatch(new RegExp(`could not reach ${s.gaps}`))
  // the counts are internally consistent (reached = hits + real-misses; gaps separate; the seeded miss is extra)
  const real = summary.results.filter((r: { seeded: boolean }) => !r.seeded)
  expect(real.filter((r: { outcome: string }) => r.outcome === "HIT").length).toBe(s.hits)
  expect(real.filter((r: { outcome: string }) => r.outcome === "GAP").length).toBe(s.gaps)
})

test("S68 — the zero-miss-zero-gap suspicion flag: a scoreline that only ever confirms is SUSPECTED, not celebrated (here it is NOT suspicious)", () => {
  // this run has 2 misses + 1 gap → NOT suspicious (the flag is false)
  expect(summary.zeroMissZeroGapSuspicion).toBe(false)
  // the flag's logic: it would be TRUE only if misses===0 AND gaps===0 (a suspiciously clean confirm-only result)
  const wouldBeSuspicious = summary.scoreline.misses === 0 && summary.scoreline.gaps === 0
  expect(summary.zeroMissZeroGapSuspicion).toBe(wouldBeSuspicious)
})

test("S68/S70 — the two HITs are REAL captures (a real depeg + a real funding flip); the RWA MISS is the argument FOR D35 (OUTPUT shown)", () => {
  const b1 = readJson(path.join(B, "B1-lst-steth-2022.json"))
  expect(b1.outcome).toBe("HIT"); expect(b1.reads.redemption).toBe(1) // stETH par
  expect(b1.reads.secondary).toBeCloseTo(0.943, 2); expect(b1.reads.gapPct).toBeCloseTo(5.71, 1) // the real June-2022 depeg
  expect(b1.crossChecked).toBe(true) // tri-endpoint agreed
  const b2 = readJson(path.join(B, "B2-stable-dydx-funding-flip.json"))
  expect(b2.outcome).toBe("HIT"); expect(b2.reads.negative).toBeGreaterThan(0); expect(b2.reads.periods).toBeGreaterThan(0) // real dYdX funding, some negative
  const b4 = readJson(path.join(B, "B4-rwa-maple-orthogonal-2022.json"))
  expect(b4.outcome).toBe("MISS") // the off-chain default is invisible on-chain
  expect(b4.claim).toMatch(/the argument for the pen|argument for D35|EXACTLY why the RWA structural cap/i)
})

test("S70 — moat-under-domain: the honest-limitation is disclosed (the free archive prunes deep-2022 state), and the misses are reported louder than the hits", () => {
  expect(summary.honestLimitation).toMatch(/free archive rotation.*prunes deep-2022 state/i)
  expect(summary.honestLimitation).toMatch(/misses.*most valuable output — reported louder than the hits/i)
  // the summary self-hashes (the whole scoreline is tamper-evident)
  const { contentSha, ...body } = summary
  expect(sha256(JSON.stringify(body))).toBe(contentSha)
})
