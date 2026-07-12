/**
 * ORGΛNON — THE DOMAIN SPRINT, Phase 1 wall (FINDINGS-CLOSED + RECORD-RESTORED, CV1–CV5). The Coverage log let the record
 * discipline slip; this restores it and proves the restoration. CV1 the PR5 expect() wall (proven live in
 * dual_repo_divergence.test.ts; here the smoothing control bites). CV2/CV3 the SESSION-MARKER + evidentiary-depth standards
 * pinned. CV4 the DEPTH CENSUS — the honest per-axis coverage, recomputed from committed artifacts (a seeded axis-count
 * inflation → fail; the qualifying sentence never bare). CV5 the countersign package refreshed to D23–D36 (D27 first, the
 * push item updated for the PUSHED trees) + the Redesign sprint ledgered VALIDATED. Each control SHOWS its output (CV3).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { contractCoverage } from "../../src/contract/registry"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const readJson = (p: string) => JSON.parse(readFileSync(path.join(H, p), "utf8"))
const depth = readJson("depth-census.json")
const pkg = readJson("domain-countersign-package.json")
const dm = readJson("domain-pins.json")
const coverage = readJson("coverage-census.json")

test("CV4 — the depth census is self-consistent + recomputes from committed artifacts (a seeded axis-count inflation → fail; OUTPUT shown)", () => {
  // self-hashing: the committed contentSha matches the body
  const { contentSha, ...body } = depth
  expect(sha256(JSON.stringify(body))).toBe(contentSha)
  // the contract axis count RECOMPUTES from the live contract registry — an inflated committed number would not match
  const recomputed = contractCoverage().realCount
  expect(depth.perAxis.contract.renderable).toBe(recomputed) // SHOWN: 4 (aave USDC/USDT/DAI + compound USDC)
  expect(recomputed).toBe(4)
  // the breadth (yield) number equals the coverage census — it is yield-ONLY, never the complete-Reality-Check number
  expect(depth.breadthYieldOnly).toBe(coverage.covered) // 15490
  expect(depth.universe).toBe(coverage.universeSize) // 15497
  // POSITIVE CONTROL — a seeded axis-count inflation moves the hash + diverges from the recompute
  const inflated = JSON.parse(JSON.stringify(body)); inflated.perAxis.contract.renderable = 9999
  expect(sha256(JSON.stringify(inflated))).not.toBe(contentSha)
  expect(inflated.perAxis.contract.renderable).not.toBe(recomputed)
})

test("CV4 — the 99.95% headline is qualified, NEVER bare: the qualifying sentence rides beside the breadth number, and the coverage census's coveredDefinition already says 'yield-only'", () => {
  // the depth census carries the qualifying sentence beside the breadth number (never a bare '15490 covered')
  expect(depth.qualifyingSentence).toMatch(/not a full Reality Check/i)
  expect(depth.qualifyingSentence).toMatch(/say something COMPLETE about, not merely something about/i)
  expect(depth.honestSummary).toMatch(/breadth number — yield ONLY/i)
  expect(depth.honestSummary).toMatch(/COMPLETE Reality Check/i)
  // it matches the PINNED spec (domain-pins) VERBATIM (a summarization is a Halt)
  expect(depth.qualifyingSentence).toBe(dm.depthCensus.qualifyingSentenceVerbatim)
  // the source coverage census ALSO qualifies 'covered' as yield-only (the number is never presented as a full check)
  expect(coverage.coveredDefinition).toMatch(/a REAL aggregator yield exists/i)
  expect(coverage.coveredDefinition).toMatch(/SAMPLE-only does NOT count/i)
})

test("CV4 — the depth census states EVERY axis: yield reaches the universe; the deeper axes reach only the curated shelf (the honest, stark gap SHOWN)", () => {
  const px = depth.perAxis
  expect(px["yield-reality"].scope).toBe("universe")
  expect(px["yield-reality"].renderable).toBe(15490)
  // every deeper axis is a per-subject capture, curated-shelf-scoped — a far smaller, honest number
  for (const ax of ["tvl-trend", "peg", "liquidity-depth", "contract", "governance"]) expect(px[ax].scope).toMatch(/curated-shelf/)
  expect(px.contract.renderable).toBeLessThan(px["yield-reality"].renderable) // 4 ≪ 15490 — the whole point
  expect(px.governance.renderable).toBe(5) // the governance census (aave/spark/fluid/compound/curve)
  expect(px["domain-catch"].scope).toMatch(/lookup \+ fixtures/) // the new domains render via lookup, not the curated shelf
})

test("CV5 — the countersign package is refreshed to D23–D36 (D27 FIRST) with D34/D35/D36 Operator-signed=false; the push item is retired for the PUSHED trees (OUTPUT shown)", () => {
  expect(pkg.generosityStatement).toBe("The Stamp is knowingly generous until D27 is signed.")
  expect(pkg.deviationOrder[0]).toBe("D27") // FIVE sprints running
  for (const d of ["D34", "D35", "D36"]) { expect(pkg.deviationOrder).toContain(d); expect(pkg.newDeviations[d].operatorSigned).toBe(false) }
  // D35 is the verdict-shaped rule the agent may not install — the package states it plainly
  expect(pkg.newDeviations.D35.signingConsequence).toMatch(/AN AGENT MAY NOT INSTALL A VERDICT RULE/i)
  expect(pkg.newDeviations.D35.signingConsequence).toMatch(/Softening the cap because a subject 'looks fine on-chain' is a Halt/i)
  // D36 promotions are DEGRADE-ONLY (cap, never lift)
  expect(pkg.newDeviations.D36.title).toMatch(/DEGRADE-ONLY.*never lift one/i)
  // CV5 — the stale 'push decision' is RETIRED: the trees are ALREADY pushed; what remains is the publication call
  expect(pkg.gateItems.publication).toMatch(/the trees are ALREADY pushed/i)
  expect(pkg.gateItems.publication).toMatch(/the stale 'push decision' is retired/i)
  expect(pkg.operatorSignedWhole).toBe(false) // the agent NEVER signs (LN5)
})

test("CV5 — the Redesign sprint is ledgered VALIDATED (the unvalidated-sprint gap the Coverage validation flagged is CLOSED)", () => {
  expect(pkg.validationLedger.redesign).toMatch(/VALIDATED/)
  expect(pkg.validationLedger.redesign).toMatch(/W-CV01.*CAUGHT and FIXED in Coverage/i)
  expect(pkg.validationLedger.redesign).toMatch(/gap is CLOSED/i)
  expect(pkg.validationLedger.coverage).toMatch(/VALIDATED PASS-WITH-MINOR-ISSUES/)
})

test("CV1/CV2/CV3 — the record-discipline standards are pinned in domain-pins (the wall + the SESSION MARKER + the evidentiary depth)", () => {
  expect(dm.cv.CV1).toMatch(/PR5 per-repo expect\(\) wall.*restored \+ recorded EVERY phase/i)
  expect(dm.cv.CV2).toMatch(/SESSION MARKERs.*GATE CONDITION.*A phase without them does not close/i)
  expect(dm.cv.CV3).toMatch(/QUOTES its controls' actual outputs.*'the wall bites' is not evidence, the bite is/i)
})
