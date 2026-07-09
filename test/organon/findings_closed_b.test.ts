/**
 * ORGΛNON — THE VOICE SPRINT, Phase 1 walls (FINDINGS-CLOSED). The Build-Provenance validation findings B1–B5 are closed
 * before any voice work — hygiene before the feature:
 *   · B1 — the verify bundle sha reconciled: the REAL contract registry is OUTSIDE the deterministic bundle (its integrity
 *          is the per-entry contentSha), so a whole-file DIGEST rides in the capture-manifest + recomputes in `verify`
 *          (a future registry change IS caught — the inside/outside statement is in the manifest note).
 *   · B2 — the coverage denominator standardized to "N of M applicable"; BOTH denominators stated (applicable; shown incl. n/a).
 *   · B3 — the benign wall direction (REAL + zero flags → CLEAN-STRUCTURE) is fixture-proven only — zero real-world instances.
 *   · B4 — the proxy-surface qualifier renders (a REAL tier scores the deployed verified-source surface; impl-level parked).
 *   · B5 — the findings-render is severity-grouped + category-deduped + drawered; the scorecard verdict is BYTE-IDENTICAL.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Scorecard } from "../../src/analytics/scorecard"
import { Reality } from "../../src/studio/reality"
import { Evidence } from "../../src/studio/evidence"
import { contractSubAxis } from "../../src/contract"
import type { StructuralFacts } from "../../src/contract"

// a mature, well-sized REAL yield pool → a definite SOLID verdict (so a many-finding contract tier can't be seen to move it)
function yieldFacts(contract?: Scorecard.PoolFacts["contractSubAxis"]): Scorecard.PoolFacts {
  return { name: "aave-v3 USDC", apyBase: 4, apyReward: 0.5, tvlSlope30d: 0.05, pegDev: null, isStablecoin: false, reality: "REAL", provenanceRef: "x", vertical: "lending", ageDays: 400, sizeUsd: 20_000_000, depProtocols: 1, contractSubAxis: contract }
}
// a proxy-shaped StructuralFacts with a DELIBERATE duplicate detail (to prove category-dedup) across the severity classes
const PROXY_FACTS: StructuralFacts = {
  contracts: ["BaseImmutableAdminUpgradeabilityProxy"], functionsAnalyzed: 6,
  findings: [
    { category: "dangerous-edges", detail: "delegatecall — delegatecall (into attacker-controlled code if the target is mutable)", contract: "BaseImmutableAdminUpgradeabilityProxy", fn: "upgradeToAndCall", line: 75 },
    { category: "dangerous-edges", detail: "delegatecall — delegatecall (into attacker-controlled code if the target is mutable)", contract: "BaseImmutableAdminUpgradeabilityProxy", fn: "_fallback", line: 90 }, // an IDENTICAL detail → deduped ×2
    { category: "upgrade-proxy-hazard", detail: "upgradeable contract does not self-lock the implementation via constructor/_disableInitializers", contract: "BaseImmutableAdminUpgradeabilityProxy" },
    { category: "unprotected-state-changing", detail: "constructor mutates state without an authorization gate", contract: "BaseImmutableAdminUpgradeabilityProxy", fn: "constructor", line: 23 },
    { category: "storage-clash", detail: "upgradeable contract without a storage gap — a future upgrade can collide with existing slots", contract: "BaseImmutableAdminUpgradeabilityProxy" },
  ],
  flaggedCategories: ["dangerous-edges", "storage-clash", "unprotected-state-changing", "upgrade-proxy-hazard"],
}

test("B1 — the contract registry is OUTSIDE the deterministic bundle; its whole-file digest rides in the manifest + recomputes (a future change is caught)", () => {
  const manifest = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "evidence", "capture-manifest.json"), "utf8"))
  expect(manifest.registryDigest).toBeDefined()
  expect(manifest.registryDigest.inBundle).toBe(false) // the reconciliation: the registry is outside the 9c1e7bd8… bundle
  expect(manifest.note).toMatch(/OUTSIDE the deterministic bundle/i) // the inside/outside statement is committed
  // the teeth: the committed digest recomputes from the registry bytes — a registry change moves it, so `verify` catches it
  const recomputed = Evidence.contractRegistryDigest()
  expect(recomputed).not.toBeNull()
  expect(recomputed!.sha256).toBe(manifest.registryDigest.sha256)
  expect(recomputed!.sha256).toMatch(/^[0-9a-f]{64}$/)
  expect(recomputed!.realCount).toBe(manifest.registryDigest.realCount)
  // the manifest verifier passes on the committed state (the registry digest reproduces + every capture hash reproduces)
  expect(Evidence.verifyCaptureManifest().ok).toBe(true)
})

test("B2 — the Shelf coverage line reads 'N of M applicable' and states BOTH denominators (applicable; shown incl. not-applicable delta-neutral)", () => {
  // a mixed shelf: 5 applicable (yield) + 1 not-applicable (delta-neutral) → applicable 5; shown 6; not-applicable 1
  const dnFacts: Scorecard.PoolFacts = { name: "hl BTC", apyBase: null, apyReward: null, tvlSlope30d: null, pegDev: null, isStablecoin: false, reality: "REAL", provenanceRef: "c", deltaNeutral: true, fundingBand: { p10: 5, median: 8, p90: 12 } }
  const dnScored = Scorecard.score(dnFacts)
  const dnCard: Reality.Card = { name: "hl BTC", poolKey: "funding-basis:hyperliquid:BTC", kind: "delta-neutral", project: "hl", symbol: "BTC", chain: "", apyBase: null, apyReward: null, apyTotal: null, verdict: dnScored.verdict, risk: Reality.riskWord(dnScored.verdict), reality: "REAL", scored: dnScored }
  const cards: Reality.Card[] = [...Reality.shelfSample().slice(0, 2), dnCard] // 2 applicable (yield) + 1 not-applicable (delta-neutral)
  const html = Reality.renderShelf(cards, false)
  expect(html).toMatch(/applicable pools carry a REAL/i) // standardized to "applicable"
  expect(html).toMatch(/2 applicable; 3 shown incl\. 1 not-applicable/i) // BOTH denominators, exact
  expect(html).not.toMatch(/shown pools carry a REAL/i) // the old wobbly phrasing is gone
})

test("B3 — the benign wall direction (REAL + zero flags → CLEAN-STRUCTURE) is disclosed as fixture-proven only, zero real-world instances", () => {
  const html = Reality.renderShelf(Reality.shelfSample(), false)
  expect(html).toMatch(/fixture-proven only/i)
  expect(html).toMatch(/zero real-world instances/i)
})

test("B4 — the proxy-surface qualifier renders in the contract screen (a REAL tier scores the deployed verified-source surface; impl-level parked)", () => {
  const flagged = Scorecard.score(yieldFacts(contractSubAxis({ facts: PROXY_FACTS, provenance: "REAL", contentSha: "abc123def456" })))
  const html = Reality.renderRealityCheck("aave-v3 USDC", flagged, [], "defillama:pool:x")
  expect(html).toMatch(/deployed verified-source surface/i)
  expect(html).toMatch(/implementation-level analysis parked/i)
  expect(html).toMatch(/proxy tier names its proxy contract/i)
})

test("B5 — the findings-render is severity-grouped + category-deduped + drawered; the top groups surface + the full list is behind a drawer", () => {
  const view = Reality.contractFindingsView(PROXY_FACTS.findings)
  expect(view.total).toBe(5)
  // severity-ordered: unprotected-state-changing (rank 1) leads; oracle/storage trail
  expect(view.groups[0].category).toBe("unprotected-state-changing")
  const edges = view.groups.find((g) => g.category === "dangerous-edges")!
  expect(edges.count).toBe(2) // the two identical delegatecall details COLLAPSE into one item…
  expect(edges.items).toHaveLength(1) // …category-deduped…
  expect(edges.items[0].count).toBe(2) // …with a ×2 multiplicity
  expect(view.topline).toMatch(/2 dangerous-edges/) // the top groups surface as a topline
  // the render: the topline + a <details> drawer holding the full deduped list
  const html = Reality.renderRealityCheck("aave-v3 USDC", Scorecard.score(yieldFacts(contractSubAxis({ facts: PROXY_FACTS, provenance: "REAL", contentSha: "abc" }))), [], "defillama:pool:x")
  expect(html).toMatch(/<details>/)
  expect(html).toMatch(/×2/) // the dedup multiplicity is shown, not five flat repeats
  expect(html).toMatch(/5 structural surfaces/i) // the count surfaced
})

test("B5 (verdict-safe) — the many-finding contract tier is material:false DETAIL: the scorecard verdict + fact rows are BYTE-IDENTICAL to no-contract", () => {
  const base = Scorecard.score(yieldFacts()) // no contract sub-axis
  const flagged = Scorecard.score(yieldFacts(contractSubAxis({ facts: PROXY_FACTS, provenance: "REAL", contentSha: "abc" }))) // a 5-finding REAL tier
  expect(base.verdict).toBe("SOLID")
  expect(flagged.verdict).toBe(base.verdict) // the render change moves NO verdict (the differential stays zero)
  expect(flagged.rows.length).toBe(base.rows.length) // not a voting row
  expect(JSON.stringify(flagged.factRows)).toBe(JSON.stringify(base.factRows)) // the axis fact rows are byte-identical
})
