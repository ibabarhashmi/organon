/**
 * ORGΛNON — THE DOMAIN SPRINT, Phase 0 wall (PINS-LOCKED). domain-pins.json is self-consistent, carried from the Coverage
 * head (which carried Redesign → GroundTruth), and pins every X-DOMAIN + X-BACKTEST contract — the DomainType enum, the
 * CONSERVATIVE classifier + the UNCLASSIFIED rule, the four catch-axis specs + grammar, the per-domain axis registry + the
 * no-leakage rule, the RWA structural-cap spec + the agent-may-not-install clause, the backtest subject set + rationales +
 * heights HASH-PINNED (a post-hoc swap fails), the MISS-reported + zero-miss-suspicious rules, the read-only-engine rule,
 * the depth-census spec, CV1–CV5, D34/D35/D36 reserved (Operator-signed=false — LN5), S1–S70. The lock bites.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const dm = JSON.parse(readFileSync(path.join(H, "domain-pins.json"), "utf8"))
const COVERAGE = JSON.parse(readFileSync(path.join(H, "coverage-pins.json"), "utf8"))

test("DOMAIN — the pins hash-lock is self-consistent + carried from the Coverage head (a moved pin moves the sha)", () => {
  const { pinsSha, ...rest } = dm
  expect(sha256(JSON.stringify(rest))).toBe(dm.pinsSha) // self-consistent
  expect(dm.carriedFromPinsSha).toBe(COVERAGE.pinsSha) // carried forward, never rebuilt
  const mutated = JSON.parse(JSON.stringify(rest)); mutated.xDomain.b_conservativeClassifier.domainTypes[2] = "GUESSED"
  expect(sha256(JSON.stringify(mutated))).not.toBe(dm.pinsSha) // POSITIVE CONTROL: an edited pinned constant moves the sha
})

test("DOMAIN — X-DOMAIN(a,b): a subject TYPE not a screen (the conscious 3) + the CONSERVATIVE classifier (ambiguous → UNCLASSIFIED, no optimistic default) (S67)", () => {
  expect(dm.xDomain.a_subjectTypeNotScreen.rule).toMatch(/a domain is a subject TYPE, not a screen/i)
  expect(dm.xDomain.a_subjectTypeNotScreen.rule).toMatch(/a fourth screen is a Halt/i)
  expect(dm.xDomain.a_subjectTypeNotScreen.screens).toEqual(["shelf", "reality-check", "ask"])
  const b = dm.xDomain.b_conservativeClassifier
  expect(b.rule).toMatch(/CONSERVATIVE BY LAW/i)
  expect(b.rule).toMatch(/matching two domain signatures is UNCLASSIFIED/i)
  // the enum: the four new domains beside the carried LENDING/FUNDING + UNCLASSIFIED
  expect(b.domainTypes).toEqual(["LENDING", "FUNDING", "STABLE-SYNTH", "LST-LRT", "LOOPED-CDP", "RWA", "UNCLASSIFIED"])
  // the classifier has NO optimistic default (it never up-classifies on a hunch)
  expect(b.signatures.unclassifiedRule).toMatch(/NO optimistic default/i)
  expect(b.signatures.unclassifiedRule).toMatch(/a wrong lens.*a wrong answer/i)
  // the pinned signatures name their allowlists (a summarization would fail these)
  expect(b.signatures["STABLE-SYNTH"].issuerAllowlist).toContain("ethena")
  expect(b.signatures["LST-LRT"].symbolAllowlist).toContain("rseth")
  expect(b.signatures["LOOPED-CDP"].issuerAllowlist).toContain("gearbox")
  expect(b.signatures.RWA.issuerAllowlist).toContain("ondo")
})

test("DOMAIN — X-DOMAIN(c): each new domain declares EXACTLY ONE catch axis, in the pinned grammar; the registry forbids cross-domain leakage (S67)", () => {
  const g = dm.xDomain.c_oneCatchAxisPerDomain
  expect(g.rule).toMatch(/EXACTLY ONE catch axis/i)
  expect(g.rule).toMatch(/INFO\/CONTEXT this sprint/i)
  // the four grammar forms are pinned VERBATIM (the render must speak this grammar)
  expect(g.grammar["yield-source"]).toMatch(/perp-funding carry \(not lending interest\)/i)
  expect(g.grammar["redemption-gap"]).toMatch(/Exit at par needs the queue; exit now takes the pool price/i)
  expect(g.grammar["leverage-distance"]).toMatch(/levered.*collateral move liquidates you/i)
  expect(g.grammar["off-chain-opacity"]).toMatch(/We cannot see the thing that matters/i)
  // the registry maps each domain to its ONE axis, and forbids leakage
  expect(g.registry["STABLE-SYNTH"]).toBe("yield-source")
  expect(g.registry["LST-LRT"]).toBe("redemption-gap")
  expect(g.registry["LOOPED-CDP"]).toBe("leverage-distance")
  expect(g.registry.RWA).toBe("off-chain-opacity")
  expect(g.registry.noLeakageRule).toMatch(/an axis renders ONLY for its declared domain/i)
  expect(g.registry.noLeakageRule).toMatch(/a leverage axis on a STABLE subject.*is a Halt/i)
})

test("DOMAIN — X-DOMAIN(d): the RWA structural cap is verdict-shaped and an AGENT MAY NOT INSTALL IT (until D35 the warning renders without the cap) (S69)", () => {
  const cap = dm.xDomain.d_rwaCapNotAgentInstalled.capVerbatim
  expect(cap).toMatch(/An RWA subject may NEVER render SOLID/i)
  expect(cap).toMatch(/STRUCTURALLY CAPPED at CAUTION\/UNVERIFIED/i)
  expect(cap).toMatch(/an AGENT MAY NOT INSTALL A VERDICT RULE/i)
  expect(cap).toMatch(/LEFT UNINSTALLED until D35 is signed/i)
  expect(cap).toMatch(/renders the WARNING/i)
  expect(cap).toMatch(/SAMPLE-labeled attestation surface/i)
  expect(cap).toMatch(/NEVER a verification/i)
})

test("DOMAIN — X-DOMAIN(e): the catch-axis promotions are specified, conservative (DEGRADE-ONLY — cap never lift), census-attached, PARKED as D36", () => {
  const e = dm.xDomain.e_promotionsParked
  expect(e.rule).toMatch(/PARKED as D36/i)
  expect(e.rule).toMatch(/degrade-only.*a promotion may only cap a verdict, never lift one/i)
  expect(e.degradeOnly).toMatch(/never LIFT one/i)
})

test("DOMAIN — X-BACKTEST(a): the collapse subject set is pinned WITH mechanism-match rationale + heights, HASH-PINNED before capture (a post-hoc swap moves the hash) (S68)", () => {
  const a = dm.xBacktest.a_pinnedBeforeCapture
  // one candidate per new domain, each with a mechanism-match rationale + a pinned height
  const domains = a.subjects.map((s: { domain: string }) => s.domain)
  expect(domains).toEqual(["LST-LRT", "STABLE-SYNTH", "LOOPED-CDP", "RWA"])
  for (const s of a.subjects) {
    expect(typeof s.mechanismMatch).toBe("string"); expect(s.mechanismMatch.length).toBeGreaterThan(80) // a real reason, not a stub
    expect(typeof s.height).toBe("number")
    expect(typeof s.expectedReach).toBe("string") // the honest a-priori reach (GAP-expected vs reachable), pinned before the fetch
  }
  // the subject-set hash matches the pinned set — a post-hoc edit fails
  expect(sha256(JSON.stringify(a.subjects))).toBe(a.subjectSetHash)
  const swapped = JSON.parse(JSON.stringify(a.subjects)); swapped[0].height = 99999999 // POSITIVE CONTROL: a post-hoc swap
  expect(sha256(JSON.stringify(swapped))).not.toBe(a.subjectSetHash)
})

test("DOMAIN — X-BACKTEST(b,c): archive-truth or honest gap (tri-endpoint, free rotation) + the engine UNMODIFIED during the replay (git diff -- src/ empty)", () => {
  const b = dm.xBacktest.b_archiveTruthOrGap
  expect(b.rule).toMatch(/archive-truth or honest gap/i)
  expect(b.rule).toMatch(/HONEST GAP recorded by name, never simulated/i)
  expect(b.archiveRotation).toEqual(["https://eth.drpc.org", "https://rpc.mevblocker.io", "https://eth-mainnet.public.blastapi.io"])
  expect(b.triEndpointRule).toMatch(/≥2 free endpoints must AGREE/i)
  expect(dm.xBacktest.c_engineUnmodified.rule).toMatch(/git diff -- src\/.*empty/i)
  expect(dm.xBacktest.c_engineUnmodified.rule).toMatch(/tuning the engine while measuring it.*a Halt/i)
})

test("DOMAIN — X-BACKTEST(d,e): a MISS is the most valuable output (the seeded-SOLID collapse surfaces as a MISS; zero-miss is suspected) + the both-directions claim wording", () => {
  const d = dm.xBacktest.d_missIsMostValuable
  expect(d.rule).toMatch(/A MISS IS THE MOST VALUABLE OUTPUT/i)
  expect(d.rule).toMatch(/quietly dropped is the gravest possible failure/i)
  expect(d.rule).toMatch(/SUSPECTED and re-examined, not celebrated/i)
  expect(d.seededMissControl).toMatch(/seeded would-have-said-SOLID collapse MUST appear as a MISS in the artifact AND the render/i)
  expect(dm.xBacktest.e_bothDirectionsClaim.wordingVerbatim).toMatch(/would have flagged N of M.*missed K.*could not reach J/i)
})

test("DOMAIN — the depth census (CV4): the 99.95% headline qualified + replaced by per-axis coverage; the qualifying sentence pinned VERBATIM", () => {
  const dc = dm.depthCensus
  expect(dc.rule).toMatch(/the YIELD axis is renderable — NOT that a full Reality Check is possible/i)
  expect(dc.rule).toMatch(/per axis, how many pools the tool can say something COMPLETE about/i)
  expect(dc.qualifyingSentenceVerbatim).toMatch(/not a full Reality Check/i)
  expect(dc.qualifyingSentenceVerbatim).toMatch(/say something COMPLETE about, not merely something about/i)
  expect(dc.artifact).toMatch(/data\/honesty\/depth-census\.json/)
})

test("DOMAIN — CV1–CV5 (the record discipline restored) are pinned; D34/D35/D36 reserved Operator-signed=false (LN5, D27 still first)", () => {
  for (const k of ["CV1", "CV2", "CV3", "CV4", "CV5"]) expect(typeof dm.cv[k]).toBe("string")
  expect(dm.cv.CV1).toMatch(/PR5 per-repo expect\(\) wall.*every phase/i)
  expect(dm.cv.CV2).toMatch(/SESSION MARKERs.*GATE CONDITION/i)
  expect(dm.cv.CV3).toMatch(/QUOTES its controls' actual outputs/i)
  expect(dm.cv.CV4).toMatch(/DEPTH CENSUS/i)
  expect(dm.cv.CV5).toMatch(/gate.*now D23–D36/i)
  expect(dm.deviations.D34).toMatch(/RESERVED/); expect(dm.deviations.D35).toMatch(/RESERVED/); expect(dm.deviations.D36).toMatch(/RESERVED/)
  expect(dm.deviations.D35).toMatch(/LEFT UNINSTALLED until the pen moves/i) // the agent installs no verdict rule
  expect(dm.deviations.operatorGatedNote).toMatch(/D27 STILL FIRST/i)
  expect(dm.deviations.operatorGatedNote).toMatch(/NEVER signs it \(LN5\)/i)
})

test("DOMAIN — the stress catalog grows to S1–S70 (S67–S70 new); the carried constitution byte-untouched (deps, screens, differential/bundle/kill prefixes, dYdX-full parked)", () => {
  expect(dm.stressCatalog.count).toBe(70)
  for (const k of ["S67", "S68", "S69", "S70"]) expect(typeof dm.stressCatalog[k]).toBe("string")
  expect(dm.stressCatalog.S67).toMatch(/classifier CONSERVATIVE/i)
  expect(dm.stressCatalog.S68).toMatch(/MISS-REPORTED wall/i)
  expect(dm.stressCatalog.S69).toMatch(/cannot render SOLID/i)
  expect(dm.stressCatalog.S70).toMatch(/moat-under-domain/i)
  expect(dm.carried.deps).toEqual(["hono", "zod"])
  expect(dm.carried.screens).toEqual(["shelf", "reality-check", "ask"])
  expect(dm.carried.verdictDifferential.lendingFpSetShaPrefix).toBe("70c7912f")
  expect(dm.carried.verdictDifferential.fundingReproHashPrefix).toBe("0a63151b")
  expect(dm.carried.evidenceBundleShaPrefix).toBe("9c1e7bd8")
  expect(dm.carried.killCriterion).toBe("8b4e094b")
  expect(dm.carried.substrateUntouched).toMatch(/familyN===1/)
  expect(dm.carried.parkedByName.join(" ")).toMatch(/dYdX FULL cross-venue expansion/i)
})
