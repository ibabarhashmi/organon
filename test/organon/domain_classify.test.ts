/**
 * ORGΛNON — THE DOMAIN CLASSIFIER (Domain sprint; X-DOMAIN b, S67). classifyDomain is CONSERVATIVE BY LAW: each pinned
 * domain classifies from a real fixture; the carried verticals stay LENDING/FUNDING; an AMBIGUOUS (multi-match) or NOVEL
 * (no-match) subject is UNCLASSIFIED — never a guess. NO OPTIMISTIC DEFAULT: a lending stablecoin (aave USDC) does NOT
 * become STABLE-SYNTH. Every control SHOWS its output (CV3). The allowlists match the pinned domain-pins signatures.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Domain } from "../../src/domain/types"
import { DomainClassify } from "../../src/domain/classify"
import { Reality } from "../../src/studio/reality"
import { Scorecard } from "../../src/analytics/scorecard"

const dm = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "domain-pins.json"), "utf8"))
const f = (o: Partial<Domain.DomainFacts>): Domain.DomainFacts => ({ project: "", symbol: "", name: "", isStablecoin: false, ...o })

test("S67 — each NEW domain classifies from a real fixture, with its ONE catch axis (OUTPUT shown)", () => {
  const stable = DomainClassify.classifyDomain(f({ project: "ethena", symbol: "USDe", name: "ethena USDe", isStablecoin: true }))
  expect(stable.domain).toBe("STABLE-SYNTH"); expect(stable.catchAxis).toBe("yield-source")
  const lst = DomainClassify.classifyDomain(f({ project: "lido", symbol: "stETH", name: "lido stETH" }))
  expect(lst.domain).toBe("LST-LRT"); expect(lst.catchAxis).toBe("redemption-gap")
  const looped = DomainClassify.classifyDomain(f({ project: "gearbox", symbol: "USDC", name: "gearbox looped USDC" }))
  expect(looped.domain).toBe("LOOPED-CDP"); expect(looped.catchAxis).toBe("leverage-distance")
  const rwa = DomainClassify.classifyDomain(f({ project: "ondo", symbol: "USDY", name: "ondo USDY" }))
  expect(rwa.domain).toBe("RWA"); expect(rwa.catchAxis).toBe("off-chain-opacity")
  // SHOWN — the classifier states its work (the governance-classifier pattern)
  expect(stable.how).toMatch(/matched exactly one domain signature \(STABLE-SYNTH\)/)
  expect(rwa.how).toMatch(/off-chain-opacity catch axis applies/)
})

test("S67 — the carried verticals stay LENDING/FUNDING (no catch axis); a LOOPED structural signal (a leverage read) classifies LOOPED-CDP", () => {
  const lending = DomainClassify.classifyDomain(f({ project: "aave-v3", symbol: "USDC", name: "aave-v3 USDC", isStablecoin: true, vertical: "lending" }))
  expect(lending.domain).toBe("LENDING"); expect(lending.catchAxis).toBe(null)
  const funding = DomainClassify.classifyDomain(f({ project: "Hyperliquid", symbol: "BTC", name: "Hyperliquid BTC delta-neutral", deltaNeutral: true, vertical: "delta-neutral" }))
  expect(funding.domain).toBe("FUNDING"); expect(funding.catchAxis).toBe(null)
  // the structural leverageSignal (a health-factor/LTV read present) → LOOPED-CDP even without a known looping project
  const levered = DomainClassify.classifyDomain(f({ project: "some-vault", symbol: "ETH", name: "some levered ETH vault", leverageSignal: true }))
  expect(levered.domain).toBe("LOOPED-CDP"); expect(levered.catchAxis).toBe("leverage-distance")
})

test("S67 — NO OPTIMISTIC DEFAULT: a lending STABLECOIN (aave/compound USDC) is NEVER up-classified to STABLE-SYNTH", () => {
  // isStablecoin is true, but the project is NOT a synthetic-stable issuer → it stays LENDING (not a guessed STABLE-SYNTH)
  for (const p of ["aave-v3", "compound-v3", "sparklend", "fluid-lending"]) {
    const r = DomainClassify.classifyDomain(f({ project: p, symbol: "USDC", name: `${p} USDC`, isStablecoin: true, vertical: "lending" }))
    expect(r.domain).toBe("LENDING") // SHOWN: no hunch-based up-classification
    expect(DomainClassify.matchSignatures(f({ project: p, symbol: "USDC", name: `${p} USDC`, isStablecoin: true }))).toEqual([]) // zero new-domain signatures
  }
})

test("S67 — an AMBIGUOUS subject (matches TWO signatures) → UNCLASSIFIED, not a guess (OUTPUT shown — the seeded control)", () => {
  // a synthetic-stable name carrying an LST symbol matches BOTH STABLE-SYNTH and LST-LRT → the classifier REFUSES to guess
  const ambiguous = f({ project: "ethena", symbol: "stETH", name: "ethena stETH hybrid", isStablecoin: true })
  expect(DomainClassify.matchSignatures(ambiguous).sort()).toEqual(["LST-LRT", "STABLE-SYNTH"])
  const r = DomainClassify.classifyDomain(ambiguous)
  expect(r.domain).toBe("UNCLASSIFIED"); expect(r.catchAxis).toBe(null)
  expect(r.how).toMatch(/AMBIGUOUS — matched multiple domain signatures \(STABLE-SYNTH, LST-LRT\)/) // SHOWN
  expect(r.how).toMatch(/a wrong lens is a wrong answer/)
})

test("S67 — a NOVEL subject (matches NO signature, no carried vertical) → UNCLASSIFIED (the conservative floor)", () => {
  const novel = f({ project: "brand-new-protocol", symbol: "XYZ", name: "brand-new-protocol XYZ" })
  expect(DomainClassify.matchSignatures(novel)).toEqual([])
  const r = DomainClassify.classifyDomain(novel)
  expect(r.domain).toBe("UNCLASSIFIED"); expect(r.catchAxis).toBe(null)
  expect(r.how).toMatch(/no domain signature matched — the seven carried axes render alone/)
})

test("S67 — the classifier's allowlists MATCH the pinned domain-pins signatures (a drift from the pins is a Halt)", () => {
  const sig = dm.xDomain.b_conservativeClassifier.signatures
  // sample each allowlist token classifies its domain (the pins are the contract; the code must honor them)
  expect(DomainClassify.classifyDomain(f({ project: sig["STABLE-SYNTH"].issuerAllowlist[0], symbol: "x", name: "x", isStablecoin: true })).domain).toBe("STABLE-SYNTH")
  expect(DomainClassify.classifyDomain(f({ project: "p", symbol: sig["LST-LRT"].symbolAllowlist[0], name: "n" })).domain).toBe("LST-LRT")
  expect(DomainClassify.classifyDomain(f({ project: sig["LOOPED-CDP"].issuerAllowlist[0], symbol: "x", name: "x" })).domain).toBe("LOOPED-CDP")
  expect(DomainClassify.classifyDomain(f({ project: sig.RWA.issuerAllowlist[0], symbol: "x", name: "x" })).domain).toBe("RWA")
})

test("S67 — the render is BYTE-IDENTICAL for a carried subject (no badge) and adds ONLY a label for a new domain (X-DOMAIN a; no fourth screen)", () => {
  const facts: Scorecard.PoolFacts = { name: "aave-v3 USDC", apyBase: 3.1, apyReward: 0, tvlSlope30d: 0.02, pegDev: 0.001, isStablecoin: true, reality: "SAMPLE", provenanceRef: null, vertical: "lending" }
  const scored = Scorecard.score(facts)
  const noDomain = Reality.renderRealityCheck("aave-v3 USDC", scored, [], "defillama:pool:x")
  const lending = Reality.renderRealityCheck("aave-v3 USDC", scored, [], "defillama:pool:x", [], null, undefined, "LENDING")
  const unclass = Reality.renderRealityCheck("aave-v3 USDC", scored, [], "defillama:pool:x", [], null, undefined, "UNCLASSIFIED")
  expect(lending).toBe(noDomain) // a carried domain badges NOTHING → byte-identical to the pre-Domain render
  expect(unclass).toBe(noDomain) // UNCLASSIFIED badges nothing either
  expect(noDomain).not.toContain('badge REAL">STABLE-SYNTH')
  // the SAME facts under a NEW domain adds ONLY a label (a label, not a section — the h1 gains the badge, nothing else)
  const newDomain = Reality.renderRealityCheck("aave-v3 USDC", scored, [], "defillama:pool:x", [], null, undefined, "STABLE-SYNTH")
  expect(newDomain).toContain('<span class="badge REAL">STABLE-SYNTH</span>')
  expect(newDomain.replaceAll(' <span class="badge REAL">STABLE-SYNTH</span>', "")).toBe(noDomain) // the label is the ONLY delta
})
