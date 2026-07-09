/**
 * ORGΛNON — THE CONTRACT-TRUTH SPRINT, Phase 4 walls (COUNTERPARTY-ENRICH, S25/S27). The contract-risk sub-axis folds
 * BESIDE the coarse age·size·dependency counterparty floor, is surfaced in the Reality-Check Pro row + the Ask grounding,
 * and NEVER moves a verdict:
 *   · VERDICT-SAFE — the scorecard verdict is BYTE-IDENTICAL whether the contract sub-axis is absent, UNVERIFIED, or FLAGGED
 *     (it is DETAIL, not a voting axis; rows() is unchanged — the differential stays zero, X-KEEP).
 *   · the COARSE floor is intact — the counterparty axis keeps its "NOT a contract audit" caveat + material tier.
 *   · the Reality-Check renders the contract detail + the "not a full audit" label (Pro) + UNVERIFIED honestly, never "safe".
 *   · the Ask surfaces the contract facts as GROUNDED rows; the SAFETY guard rejects a fabricated "safe"/"audited" wholesale (S25).
 */
import { test, expect } from "bun:test"
import { Scorecard } from "../../src/analytics/scorecard"
import { Reality } from "../../src/studio/reality"
import { AskTools } from "../../src/ask/tools"
import { AskPhrase } from "../../src/ask/phrase"
import { contractSubAxis, contractFacts } from "../../src/contract"
import type { ContractIR, ProjectIR } from "../../src/contract"
import type { Ask } from "../../src/ask/answer"

// a mature, well-sized REAL yield pool → a definite verdict (so we can prove the contract sub-axis never moves it)
function yieldFacts(contract?: Scorecard.PoolFacts["contractSubAxis"]): Scorecard.PoolFacts {
  return { name: "aave-v3 USDC", apyBase: 4, apyReward: 0.5, tvlSlope30d: 0.05, pegDev: null, isStablecoin: false, reality: "REAL", provenanceRef: "x", vertical: "lending", ageDays: 400, sizeUsd: 20_000_000, depProtocols: 1, contractSubAxis: contract }
}
function flaggedSubAxis() {
  const c: ContractIR = {
    id: "V.sol:Vault", node_id: 1, name: "Vault", kind: "contract", source: "V.sol", full: "/V.sol", bases: [], linearized_bases: ["Vault"],
    functions: [{ id: "f", name: "setAdmin", kind: "function", signature: "setAdmin(address)", visibility: "external", mutability: "nonpayable", payable: false, modifiers: [], parameters: ["address"], parameter_names: ["a"], returns: [], reads: [], writes: ["admin"], calls: [], auth: [], values: [], operations: [], taints: [], arithmetic: [], location: { file: "V.sol", full: "/V.sol", line: 3 } }],
    modifiers: [], state: [], storage: [], events: [], errors: [], proxies: [], initializers: [], fallback_delegatecall: false, location: { file: "V.sol", full: "/V.sol", line: 1 },
  }
  const ir: ProjectIR = { project: { framework: "foundry", root: "/", config: "/f", out: "/o", cache: "/c", build_info: [], source_dirs: [], test_dirs: [], script_dirs: [], lib_dirs: [] }, contracts: [c], sources: {} }
  return contractSubAxis({ facts: contractFacts(ir), provenance: "REAL", contentSha: "abc123def456" })
}

test("COUNTERPARTY-ENRICH (X-KEEP) — the contract sub-axis NEVER moves the verdict (absent ≡ UNVERIFIED ≡ FLAGGED)", () => {
  const base = Scorecard.score(yieldFacts()) // no contract sub-axis
  const unver = Scorecard.score(yieldFacts(contractSubAxis(null))) // UNVERIFIED
  const flagged = Scorecard.score(yieldFacts(flaggedSubAxis())) // FLAGGED (a real structural finding)
  expect(base.verdict).toBe("SOLID")
  expect(unver.verdict).toBe(base.verdict) // the differential is zero
  expect(flagged.verdict).toBe(base.verdict) // a FLAGGED contract surface does NOT move the scorecard verdict (additive)
  expect(unver.rows.length).toBe(base.rows.length) // the sub-axis is NOT a voting row — rows() is unchanged
  expect(flagged.rows.length).toBe(base.rows.length)
  expect(JSON.stringify(base.factRows)).toBe(JSON.stringify(flagged.factRows)) // the axis fact rows are byte-identical
})

test("COUNTERPARTY-ENRICH — the COARSE counterparty floor is intact ('NOT a contract audit', material) + the sub-axis is attached", () => {
  const s = Scorecard.score(yieldFacts())
  const cp = s.rows.find((r) => r.axis === "counterparty")!
  expect(cp).toBeDefined()
  expect(cp.material).toBe(true) // the coarse screen still votes (unchanged)
  expect(cp.name).toMatch(/not a contract audit/i) // the honest caveat preserved
  // the deep contract sub-axis is present as DETAIL, defaulting to UNVERIFIED where no build was analyzed
  expect(s.contract.tier).toBe("UNVERIFIED")
  expect(s.contract.scope).toMatch(/not a full audit/i)
})

test("COUNTERPARTY-ENRICH — the Reality-Check renders the contract detail + the 'not a full audit' label, never 'safe' (S25)", () => {
  const flagged = Scorecard.score(yieldFacts(flaggedSubAxis()))
  const html = Reality.renderRealityCheck("aave-v3 USDC", flagged, [], "defillama:pool:x")
  expect(html).toMatch(/contract screen/i)
  expect(html).toMatch(/FLAGGED/)
  expect(html).toMatch(/not a full audit/i) // the scope label present (S25)
  expect(html).toMatch(/setAdmin/) // the specific structural finding surfaced (Pro)
  expect(html).not.toMatch(/\bthis (contract|pool) is (safe|audited)\b/i) // never certifies safe
  // an UNVERIFIED pool renders the honest 'no verified build' line, the coarse screen scoring alone
  const unver = Scorecard.score(yieldFacts())
  expect(Reality.renderRealityCheck("aave-v3 USDC", unver, [], "defillama:pool:x")).toMatch(/no verified Foundry build|coarse age·size·dependency screen scores alone/i)
})

test("COUNTERPARTY-ENRICH — the Ask surfaces the contract facts GROUNDED (the tier + each named finding), meta.contractTier set", () => {
  const cs = flaggedSubAxis()
  const rows = AskTools.contractFactRows(cs)
  expect(rows[0].id).toBe("contract-screen")
  expect(rows[0].value).toBe("FLAGGED")
  expect(rows[0].name).toMatch(/not a full audit/i)
  expect(rows.length).toBeGreaterThan(1) // the named structural findings are grounding rows
  expect(rows.slice(1).every((r) => r.id.startsWith("contract-finding-"))).toBe(true)
})

test("COUNTERPARTY-ENRICH (S25) — the SAFETY guard rejects a fabricated 'safe'/'audited' (asserted), passes an honest disclaimer", () => {
  const a = { intent: { kind: "STRATEGY_LOOKUP" } } as unknown as Ask.AskAnswer
  // an ASSERTED over-claim the engine never produces → rejected wholesale
  expect(AskPhrase.safetyGuard("This pool is safe to deposit in.", a).length).toBeGreaterThan(0)
  expect(AskPhrase.safetyGuard("The contract has been audited and is secure.", a).length).toBeGreaterThan(0)
  expect(AskPhrase.safetyGuard("It is risk-free.", a).length).toBeGreaterThan(0)
  // an honest, NEGATED disclaimer is allowed (the engine's own "not a full audit" / "never safe" phrasing)
  expect(AskPhrase.safetyGuard("This is a structural screen, not a full audit — never call it safe.", a)).toHaveLength(0)
  expect(AskPhrase.safetyGuard("A GO is NOT the scorecard's safe verdict.", a)).toHaveLength(0)
  // a non-guarded intent (e.g. a glossary definition) is not policed by the safety guard
  const g = { intent: { kind: "DEFINE" } } as unknown as Ask.AskAnswer
  expect(AskPhrase.safetyGuard("Sharpe is not a guarantee of a safe return.", g)).toHaveLength(0)
})
