/**
 * ORGΛNON — THE DEEPENING SPRINT, Phase 5 walls (COVERAGE-TRUE; Rule X-COVER, X-MOAT). All THREE money verticals —
 * stablecoin-yield · lending · delta-neutral — are DISTINCTLY represented and scored with their applicable axes; the
 * vertical-applicability matrix is TOTAL and rows() HONORS it (an inapplicable axis renders `not-applicable`, never a
 * fabricated pass — S15). The stablecoin-yield strategy is a real DEX stable-LP (peg + liquidity central), NOT a
 * relabeled lending market. The moat's integrity holds (the committed chain verifies; a retro is refused by the store).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Scorecard } from "../../src/analytics/scorecard"
import { Reality } from "../../src/studio/reality"
import { ProvRecord } from "../../src/dataplane/record"

// a fully-populated representative facts per vertical (every data-gate satisfied) — so the matrix cross-check is exact
const FIXTURE: Record<Scorecard.Vertical, Scorecard.PoolFacts> = {
  "stablecoin-yield": { name: "sy", vertical: "stablecoin-yield", apyBase: 4, apyReward: 0.5, tvlSlope30d: 0.02, pegDev: 0.002, isStablecoin: true, reality: "REAL", provenanceRef: "c", liqUsd: 2_000_000, hasUnlockSchedule: true, unlockPct30d: 0.005, ageDays: 500, sizeUsd: 30_000_000 },
  lending: { name: "l", vertical: "lending", apyBase: 3, apyReward: 0.2, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "c", hasUnlockSchedule: true, unlockPct30d: 0.005, ageDays: 900, sizeUsd: 240_000_000 },
  "delta-neutral": { name: "d", apyBase: null, apyReward: null, tvlSlope30d: null, pegDev: null, isStablecoin: false, reality: "REAL", provenanceRef: "c", deltaNeutral: true, fundingBand: { p10: 5, median: 8, p90: 12 } },
}
const AXES: Scorecard.Axis[] = ["yield-reality", "tvl-trend", "peg", "liquidity-depth", "unlock-overhang", "counterparty", "funding-regime"]

test("X-COVER — rows() HONORS the total applicability matrix for every (vertical × axis) pair (21 pairs)", () => {
  for (const v of ["stablecoin-yield", "lending", "delta-neutral"] as Scorecard.Vertical[]) {
    const rows = Scorecard.rows(FIXTURE[v])
    for (const ax of AXES) {
      const applic = Scorecard.APPLIES[v][ax]
      const row = rows.find((r) => r.axis === ax)
      if (applic === "n/a") {
        // never a material pass: the axis is absent, or present as `not-applicable` (non-material)
        expect(!row || (row.tier === "not-applicable" && row.material === false), `${v}/${ax} must be n/a, never a pass`).toBe(true)
      } else {
        // applies / conditional-with-its-gate-satisfied → the axis is MATERIAL (bears on the verdict)
        expect(row && row.material === true && row.tier !== "not-applicable", `${v}/${ax} must be material (${applic})`).toBe(true)
      }
    }
  }
})

test("S15 — an inapplicable axis renders `not-applicable`, NEVER a fabricated pass", () => {
  // funding on a lending pool → absent from its row set (never a material pass)
  expect(Scorecard.rows(FIXTURE.lending).find((r) => r.axis === "funding-regime")).toBeUndefined()
  // peg on a NON-stable pool → not-applicable (never a pass)
  const nonStable: Scorecard.PoolFacts = { ...FIXTURE.lending, isStablecoin: false, pegDev: null }
  expect(Scorecard.pegRow(nonStable).tier).toBe("not-applicable")
  expect(Scorecard.pegRow(nonStable).material).toBe(false)
  // liquidity on a lending market → not-applicable (never a pass)
  expect(Scorecard.liquidityDepthRow(FIXTURE.lending).tier).toBe("not-applicable")
})

test("X-COVER — each vertical is scored with its CENTRAL axes (distinct, not cosmetic)", () => {
  // stablecoin-yield: peg + liquidity are MATERIAL (central), and a reward-heavy split fails yield-reality
  const sy = Scorecard.score({ ...FIXTURE["stablecoin-yield"], apyBase: 1.03, apyReward: 5.0 }) // the Curve USDC-RLUSD shape
  expect(sy.rows.find((r) => r.axis === "peg")!.material).toBe(true)
  expect(sy.rows.find((r) => r.axis === "liquidity-depth")!.material).toBe(true)
  expect(sy.rows.find((r) => r.axis === "yield-reality")!.tier).toBe("fail") // reward-heavy — a REAL, honest AVOID
  expect(sy.verdict).toBe("AVOID")
  // lending: yield + counterparty material; funding absent
  const l = Scorecard.score(FIXTURE.lending)
  expect(l.rows.find((r) => r.axis === "counterparty")!.material).toBe(true)
  // delta-neutral: only funding-regime
  expect(Scorecard.score(FIXTURE["delta-neutral"]).rows.map((r) => r.axis)).toEqual(["funding-regime"])
})

test("X-COVER — all three verticals are DISTINCTLY represented on the Shelf registry (a claimed-but-absent vertical fails)", () => {
  const reg = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "shelf-registry.json"), "utf8")) as { pools: { poolKey: string; project?: string; vertical?: string; kind?: string; gtKey?: string }[] }
  const verticals = new Set(reg.pools.map((p) => p.vertical ?? (p.kind === "delta-neutral" ? "delta-neutral" : "lending")))
  for (const v of ["stablecoin-yield", "lending", "delta-neutral"]) expect([...verticals]).toContain(v)
  // the stablecoin-yield card is a real DEX stable-LP (NOT a relabeled lending market) with a liquidity link
  const sy = reg.pools.find((p) => p.vertical === "stablecoin-yield")!
  expect(sy).toBeTruthy()
  expect(sy.project).toBe("curve-dex") // a DEX LP, not a lending market
  expect(sy.gtKey).toMatch(/^geckoterminal:pool:/) // its GeckoTerminal liquidity-depth link
})

test("X-MOAT — the committed provenance chain verifies (a retro/tamper is refused by the store); clone-robust", () => {
  const v = ProvRecord.verify()
  expect(v.ok).toBe(true) // present→verified, or absent-on-a-clone→ok:true (disclosed), never a silent tamper-pass
  if (v.present) expect(v.total).toBeGreaterThan(0)
})

test("X-COVER — the stablecoin-yield card scores through the record, clone-robust (REAL → liquidity central; SAMPLE → UNVERIFIED)", () => {
  const syKey = "defillama:pool:e91e23af-9099-45d9-8ba5-ea5b4638e453"
  const rc = Reality.realityCheck(syKey, Date.now())
  if (!rc) { console.log("  (honesty_coverage) stablecoin-yield pool not in the record — run script/capture-cadence.ts"); return }
  const liq = rc.scored.rows.find((r) => r.axis === "liquidity-depth")!
  expect(liq.material).toBe(true) // liquidity is CENTRAL to a stablecoin-yield card (never n/a here)
  if (rc.scored.facts.reality === "SAMPLE") { expect(rc.scored.verdict).toBe("UNVERIFIED"); return } // clone → honest UNVERIFIED
  expect(["pass", "caution", "fail"]).toContain(liq.tier) // REAL GeckoTerminal reserve → a real liquidity verdict
  expect(Scorecard.consistency(rc.scored.verdict, rc.scored.plain, rc.scored.rows, rc.scored.facts.reality).ok).toBe(true)
})
