/**
 * ORGΛNON — THE RWA STRUCTURAL CAP (Domain sprint; X-DOMAIN d, S69). The hardest honesty test: an RWA yield's collateral
 * settles OFF-CHAIN, so a clean on-chain scorecard is NOT evidence of safety. The cap (an RWA may never render SOLID) is a
 * VERDICT-SHAPED RULE — BUILT + census pre-computed, but NOT INSTALLED until D35 is signed (an agent installs no verdict
 * rule). This proves: (a) the seeded PERFECT-ON-CHAIN RWA control cannot render SOLID under the cap SIMULATION; (b) TODAY
 * the warning renders + the verdict is UNCHANGED (the cap not installed); (c) the cap is provably NOT on the verdict path.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { OffchainOpacity } from "../../src/domain/axes/offchain-opacity"
import { Reality } from "../../src/studio/reality"
import { Scorecard } from "../../src/analytics/scorecard"

const H = path.join(PKG_ROOT, "data", "honesty")
const promos = JSON.parse(readFileSync(path.join(H, "domain-promotions.json"), "utf8"))

test("S69 — the seeded PERFECT-ON-CHAIN RWA control CANNOT render SOLID under the cap SIMULATION (d35Signed=true) — SHOWN", () => {
  // a hypothetical RWA whose every on-chain axis is clean → the seven axes would compute SOLID
  const sim = OffchainOpacity.rwaStructuralCap("SOLID", true) // the SIMULATION — what a signed D35 does
  expect(sim.verdict).toBe("CAUTION"); expect(sim.capped).toBe(true)
  expect(sim.reason).toMatch(/capped SOLID→CAUTION.*settles off-chain.*cannot see the thing that matters/)
  // an already-cautious on-chain verdict is not lifted (degrade-only)
  expect(OffchainOpacity.rwaStructuralCap("CAUTION", true).capped).toBe(false)
})

test("S69 — TODAY the cap is NOT installed (d35Signed=false): the verdict is UNCHANGED + the warning renders (an agent installs no verdict rule) — SHOWN", () => {
  const today = OffchainOpacity.rwaStructuralCap("SOLID", false)
  expect(today.verdict).toBe("SOLID"); expect(today.capped).toBe(false) // the verdict is UNTOUCHED today
  expect(today.reason).toMatch(/NOT installed \(D35 unsigned\).*an agent installs no verdict rule \(LN5\)/)
  // the catch renders the WARNING + the SAMPLE-labeled attestation surface, regardless of the verdict
  const c = OffchainOpacity.offchainOpacityCatch({ issuer: "Ondo", auditor: "Ankura", cadence: "monthly", lastAttestation: "2026-06-30", onchainVerdict: "SOLID" })
  expect(c.tier).toBe("SAMPLE"); expect(c.capStatus?.installed).toBe(false)
  expect(c.pro).toMatch(/collateral settles off-chain.*Nothing on-chain can verify it.*We cannot see the thing that matters/) // the pinned grammar
  expect(c.attestation?.label).toBe("SAMPLE") // the attestation is SAMPLE context to go verify, NEVER a verification
  expect(c.capStatus?.wouldCapUnder).toMatch(/a signed D35 would cap SOLID→CAUTION/) // the simulation is disclosed
})

test("S69 — the RWA warning renders at the Reality Check today, and the verdict pill is UNCHANGED (the cap not installed) — behavioral proof", () => {
  const facts: Scorecard.PoolFacts = { name: "ondo USDY", apyBase: 5, apyReward: 0, tvlSlope30d: 0.02, pegDev: 0.001, isStablecoin: true, reality: "SAMPLE", provenanceRef: null, vertical: "lending" }
  const scored = Scorecard.score(facts)
  const cf = Reality.catchFor("RWA", "ondo USDY", scored)
  expect(cf?.axis).toBe("off-chain-opacity")
  const html = Reality.renderRealityCheck("ondo USDY", scored, [], "defillama:pool:x", [], null, undefined, "RWA", cf)
  expect(html).toMatch(/We cannot see the thing that matters/) // the warning renders TODAY
  expect(html).toMatch(/SAMPLE — context you must go verify, NOT a verification/) // the attestation surface
  expect(html).toMatch(/structural cap: NOT installed/) // the cap is disclosed as not installed
  // the scorecard verdict pill is whatever the seven axes computed — the cap did NOT change it
  expect(html).toContain(`class="pill ${scored.verdict}"`)
})

test("S69 — the cap is provably NOT agent-installed: no SCORED/verdict-path module imports or applies the RWA cap (a git-grep is empty)", () => {
  const scored = ["src/analytics/scorecard.ts", "src/analytics/explain.ts", "src/analytics/pool.ts", "src/studio/stamp.ts"]
  for (const rel of scored) {
    const src = readFileSync(path.join(PKG_ROOT, rel), "utf8")
    expect(src).not.toMatch(/rwaStructuralCap|OffchainOpacity|offchain-opacity/) // the verdict path never references the cap
  }
  // the render (reality.ts) may reference the axis, but it NEVER applies the cap to the verdict (it calls the cap with
  // d35Signed=false; the SOLID→CAUTION simulation is display-only). The behavioral proof above confirms the pill is unchanged.
  const reality = readFileSync(path.join(PKG_ROOT, "src", "studio", "reality.ts"), "utf8")
  expect(reality).not.toMatch(/rwaStructuralCap\([^,]+,\s*true\s*\)/) // the render never calls the cap with d35Signed=true
})

test("S69/D35/D36 — the affected censuses are PRE-COMPUTED + parked (arms-for-future, ZERO current subjects); every promotion is degrade-only, unsigned", () => {
  expect(promos.D35_rwaStructuralCap.affectedCensus.wouldCap).toBe(0) // no curated RWA subject renders SOLID today
  expect(promos.D35_rwaStructuralCap.degradeOnly).toBe(true)
  expect(promos.D35_rwaStructuralCap.operatorSigned).toBe(false)
  expect(promos.D35_rwaStructuralCap.armsForFuture).toMatch(/ARMS the tool for the first future RWA subject/)
  for (const p of promos.D36_promotions.promotions) { expect(p.affectedCensus.wouldCap).toBe(0); expect(p.operatorSigned).toBe(false); expect(p.spec).toMatch(/Degrade-only/) }
})
