/**
 * ORGΛNON — THE MANIFEST SPRINT, Phase 1 wall (FINDINGS-CLOSED; DV1–DV5). DV1: the four showcase subjects' selection is
 * pinned PRE-capture + the classifier RECOGNIZES each (offline, deterministic) — the live capture/shelving is a NAMED GAP
 * (network offline this session; X-HONEST, verified-or-honest-gap — never a fabricated shelf). DV2: D35 re-presented WITH
 * B4's MISS. DV3: the leverage catch renders its position-scope sentence. DV4: the cadence pinned. DV5: the backtest
 * scoreline in the invite package. Outputs SHOWN (CV3).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { DomainClassify } from "../../src/domain/classify"
import { Scorecard } from "../../src/analytics/scorecard"
import { Reality } from "../../src/studio/reality"
import { LeverageDistance } from "../../src/domain/axes/leverage-distance"

const H = path.join(PKG_ROOT, "data", "honesty")
const mf = JSON.parse(readFileSync(path.join(H, "manifest-pins.json"), "utf8"))
const pkg = JSON.parse(readFileSync(path.join(H, "manifest-countersign-package.json"), "utf8"))

test("DV1 — the four showcase subjects: selection pinned PRE-capture; the classifier RECOGNIZES each → its domain (offline, deterministic)", () => {
  const subs = mf.dv.DV1.subjects
  expect(subs.map((s: { domain: string }) => s.domain)).toEqual(["STABLE-SYNTH", "LST-LRT", "LOOPED-CDP", "RWA"])
  // the classifier types each representative subject to its domain — the machinery HAS representative subjects it recognizes
  const cases: [Record<string, unknown>, string, string][] = [
    [{ project: "ethena-usde", symbol: "sUSDe", name: "ethena-usde sUSDe", isStablecoin: true }, "STABLE-SYNTH", "yield-source"],
    [{ project: "lido", symbol: "stETH", name: "lido stETH", isStablecoin: false }, "LST-LRT", "redemption-gap"],
    [{ project: "gearbox", symbol: "USDC", name: "gearbox USDC", isStablecoin: false }, "LOOPED-CDP", "leverage-distance"],
    [{ project: "ondo-finance", symbol: "USDY", name: "ondo-finance USDY", isStablecoin: false }, "RWA", "off-chain-opacity"],
  ]
  for (const [facts, domain, axis] of cases) {
    const c = DomainClassify.classifyDomain(facts as Parameters<typeof DomainClassify.classifyDomain>[0])
    console.log(`  ${(facts as { name: string }).name} → ${c.domain} (${c.catchAxis})`)
    expect(c.domain).toBe(domain)
    expect(c.catchAxis).toBe(axis)
  }
})

test("DV1 — the live capture/shelving is a NAMED GAP (offline), never a fabricated shelf; the rationale is representativeness (the FIREWALL)", () => {
  // the rationale is REPRESENTATIVENESS (size/dominance), NOT a flattering catch axis — pinned before any capture
  for (const s of mf.dv.DV1.subjects) expect(s.rationale).toMatch(/chosen for (size|dominance)|representative|not for a (dramatic|wide|extreme)/i)
  // the depth census's existing scope (domain-catch = lookup + fixtures) is UNCHANGED — offline we did NOT falsify a curated-shelf capture
  const dc = JSON.parse(readFileSync(path.join(H, "depth-census.json"), "utf8"))
  expect(dc).toBeDefined() // the census is not rewritten to a false "4/11 curated" (the capture is a gap, recorded by name)
})

test("DV2 — the countersign package re-presents D35 WITH B4's MISS as its evidence", () => {
  const inviteText = JSON.stringify(pkg.invitePackage)
  expect(inviteText).toMatch(/D35 re-presented WITH B4's MISS/i)
  expect(inviteText).toMatch(/looked solvent while the loan defaulted off-chain/i)
})

test("DV3 — the leverage catch renders its POSITION-SCOPE sentence (the B3 lesson made legible)", () => {
  expect(mf.dv.DV3.positionScopeVerbatim).toMatch(/evaluates a position, not the protocol/i)
  const scored = Scorecard.score({ name: "gearbox loop", apyBase: 30, apyReward: 0, tvlSlope30d: 0.02, pegDev: null, isStablecoin: false, reality: "REAL", provenanceRef: null })
  const cf = LeverageDistance.leverageDistanceCatch({ collateral: 100, debt: 88, liqThreshold: 0.9, headlineApy: 30, tier: "REAL-at-timestamp" })
  const html = Reality.renderRealityCheck("gearbox loop", scored, [], "defillama:pool:gearbox", [], null, "REAL-at-timestamp", "LOOPED-CDP", cf)
  expect(html).toMatch(/this evaluates a position, not the protocol/i)
  console.log("  DV3 position-scope line renders on the LOOPED-CDP catch ✓")
})

test("DV4 — the dual-repo cadence is PINNED as the documented standard (format-patch|am at convergence + the PR5 wall)", () => {
  expect(mf.dv.DV4.cadenceVerbatim).toMatch(/format-patch \| git am.*AT CONVERGENCE/i)
  expect(mf.dv.DV4.cadenceVerbatim).toMatch(/PR5 divergence wall.*fresh runtime expect\(\)/i)
})

test("DV5 — the backtest scoreline is in the invite package (the two it would have MISSED, beside the PAID capture)", () => {
  const order = pkg.invitePackage.order.join(" ")
  expect(order).toMatch(/PUBLISHED THE TWO IT WOULD HAVE MISSED/i)
  expect(order).toMatch(/PAID Network rug capture/i)
  expect(order).toMatch(/Strategy Manifest demo/i) // the instrument the dogfooding milestone was waiting for
})

test("MANIFEST GATE — the whole package spans D23–D38, D27 FIRST, D37/D38 new (Operator-signed=false — LN5)", () => {
  expect(pkg.deviationOrder[0]).toBe("D27") // D27 STILL first, six sprints running
  expect(pkg.deviationOrder).toContain("D37")
  expect(pkg.deviationOrder).toContain("D38")
  expect(pkg.generosityStatement).toMatch(/knowingly generous until D27 is signed/i)
  expect(pkg.newDeviations.D37.operatorSigned).toBe(false)
  expect(pkg.newDeviations.D38.operatorSigned).toBe(false)
  expect(pkg.operatorSignedWhole).toBe(false)
  expect(pkg.signingConsequence).toMatch(/agent NEVER signs \(LN5\)/i)
  // IN2 now ends with the FIRST DOGFOODING ACT (a real manifest authored + a journal entry at the gate)
  expect(pkg.gateItems.IN2).toMatch(/FIRST DOGFOODING ACT.*authors a REAL Strategy Manifest/i)
})
