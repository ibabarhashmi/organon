/**
 * ORGΛNON — THE GROUND-TRUTH SPRINT, Phase 0 wall (PINS-LOCKED). data/honesty/groundtruth-pins.json carries the
 * X-GROUNDTRUTH contracts pre-fenced before a line of product code lands: (a) the metadata-build spec + the pinned
 * bytecode-mask rule (two masks, never more — a logic waiver is a Halt); (b) the three-condition IMMUTABLE proof spec
 * (all-or-nothing) + the disguised-mutable control; (c) the archive-capture spec (PAID Network pinned WITH mechanism-
 * match rationale recorded BEFORE the capture, one-subject-one-height-three-reads, the free-endpoint rule, the honest-gap
 * rule); the precise claim wordings (today + the upgraded template + the does-NOT-claim sentence — the wording tracks the
 * evidence in both directions); the Aligrithm filing inspiration-only + the primary citations + the PBO trigger
 * implementation-absent; D30/D31 reserved; S61-S63; the verdict-path + frozen-core hash sets === live (UNCHANGED) AND ===
 * Precision (no drift); pinsSha carries Precision d2fa4cdc.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const G = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "groundtruth-pins.json"), "utf8"))
const PRECISION = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "precision-pins.json"), "utf8"))
const GROUNDTRUTH_PINS_SHA_GOLDEN = "3d0ef3bbba4798769f46dc2b4e6518133a02315b34771efba27ab5539308e9d3"

test("PINS — the pinsSha is hash-locked (sha256 of the pins body) and carries Precision d2fa4cdc", () => {
  const { pinsSha, ...body } = G
  expect(createHash("sha256").update(JSON.stringify(body)).digest("hex")).toBe(pinsSha)
  expect(pinsSha).toBe(GROUNDTRUTH_PINS_SHA_GOLDEN)
  expect(G.carriedFromPinsSha).toBe("d2fa4cdcea7ca431e3c2cf5f7d697982ee2d19f0b95dc55d0f794a53593a2e5d")
  expect(G.carriedFromPinsSha).toBe(PRECISION.pinsSha)
})

test("PINS — X-GROUNDTRUTH's three clauses are each present and load-bearing", () => {
  const x = G.xGroundTruthLaw
  expect(x.clauseA_analyzeWhatExecutesVerified).toMatch(/MATCHES the deployed bytecode|stays UNVERIFIED|S61/i)
  expect(x.clauseB_immutableOnlyOnProof).toMatch(/THREE-CONDITION|all-or-nothing|fabricated 'no upgrade path'|S62/i)
  expect(x.clauseC_archiveTruthOrHonestGap).toMatch(/honest.*gap|cardinal sin|S63/i)
})

test("PINS (a) — the metadata-build spec pins the match gate + EXACTLY TWO masks (immutable-refs + CBOR tail); a third mask is a Halt", () => {
  const m = G.metadataBuildSpec
  expect(m.matchGate).toMatch(/only a MATCH admits|MISMATCH.*UNVERIFIED|never sees it/i)
  expect(m.pinnedMaskRule.masks).toHaveLength(2)
  expect(m.pinnedMaskRule.masks.join(" ")).toMatch(/IMMUTABLE-REFERENCES/i)
  expect(m.pinnedMaskRule.masks.join(" ")).toMatch(/CBOR METADATA TAIL/i)
  expect(m.pinnedMaskRule.law).toMatch(/DATA .*NEVER a logic waiver|masking anything beyond the two declared regions is a Halt/i)
  // positive + negative controls pinned; the honest 'or UNVERIFIED' outcome recorded
  expect(m.positiveControl).toMatch(/single-file.*exact-match|reproduce and MATCH/i)
  expect(m.negativeControl).toMatch(/one-byte-off|UNVERIFIED/i)
  expect(m.honestOutcome).toMatch(/or honestly UNVERIFIED|recorded verbatim/i)
  expect(m.massPathUntouched).toMatch(/CAPTURE-TIME only|ZERO mass-path/i)
})

test("PINS (b) — IMMUTABLE is granted on the THREE-CONDITION proof, ALL-OR-NOTHING, with the disguised-mutable control → UNRESOLVED", () => {
  const s = G.immutableProofSpec
  expect(s.threeConditions).toHaveLength(3)
  expect(s.threeConditions.join(" ")).toMatch(/BYTECODE-CONSTANT/i)
  expect(s.threeConditions.join(" ")).toMatch(/SLOT-UNUSED|1967 impl slot/i)
  expect(s.threeConditions.join(" ")).toMatch(/NO-WRITE-PATH|no admin-slot write path/i)
  expect(s.allOrNothing).toMatch(/ALL THREE.*IMMUTABLE|ANY one fails.*UNRESOLVED|never a two-of-three/i)
  // the disguise control — an embedded-looking constant PLUS a live SSTORE write path → UNRESOLVED (the gravest new failure)
  expect(s.disguiseControl).toMatch(/DISGUISED-MUTABLE|embedded-looking.*SSTORE|classify UNRESOLVED|S62/i)
  expect(s.businessSurvives).toMatch(/business-logic finding.*SURVIVES|MORE permanent|permanence/i)
  expect(s.specHashStable).toMatch(/hash-pinned|FIREWALL|census is an OUTCOME, never a target/i)
  expect(s.proofDecides).toMatch(/truth over trophy|STAYS UNRESOLVED|census stays 27/i)
  // the fifth class + the grammar + the honest ceiling
  expect(G.classifierClassesV2.classes).toEqual(["EOA", "SAFE", "TIMELOCK", "UNRESOLVED", "IMMUTABLE"])
  expect(G.immutableGrammar.form).toMatch(/no upgrade path exists|proxy machinery is inert|Proven at block/i)
  expect(G.immutableGrammar.ceiling).toMatch(/UPGRADE-PATH question ONLY|bugs are PERMANENT|never reads 'safe'/i)
})

test("PINS (c) — the archive rug is PAID Network, pinned WITH mechanism-match rationale BEFORE the capture; one-subject-one-height-three-reads; free-only; honest-gap rule", () => {
  const a = G.archiveCaptureSpec
  expect(a.pinnedSubject.address).toBe("0x8c8687fc965593dfb2f0b4eaefd55e9d8df348df")
  expect(a.pinnedSubject.mechanism).toMatch(/COMPROMISED DEPLOYER PRIVATE KEY|UPGRADE function|admin-key\/upgrade-path/i)
  expect(a.pinnedSubject.rationale).toMatch(/MECHANISM-MATCH, recorded BEFORE any capture|A′#4/i)
  // NOT the relaunched token
  expect(a.pinnedSubject.newTokenNote).toMatch(/relaunched|NOT the relaunched token|OLD exploited proxy/i)
  expect(a.pinnedHeight.block).toBe(11975000)
  expect(a.pinnedHeight.note).toMatch(/PRE-collapse height|before the.*exploit/i)
  expect(a.threeReads).toHaveLength(3)
  // free-only + the empirically-confirmed publicnode refusal + the honest gap
  expect(a.freeEndpointRule).toMatch(/free ARCHIVE-CAPABLE endpoints ONLY|publicnode REFUSES|BYOK archive key is a CUT/i)
  expect(a.honestGapRule).toMatch(/HELD at clean-vs-synthetic|nothing simulated|S63/i)
  expect(a.boundedness).toMatch(/ONE subject, ONE height, THREE reads|second rug.*CUT|archive-node scope stays PARKED/i)
  expect(a.reportsWhatIs).toMatch(/reports what IS, not what flatters|truth over trophy|UUPS-owner/i)
})

test("PINS — the precise claim wordings track the evidence in BOTH directions (today · upgraded template · does-NOT-claim)", () => {
  const w = G.claimWordings
  expect(w.today).toMatch(/SYNTHETIC rugged control|EXTINCT among survivors|0 of ~50/i)
  expect(w.upgradedTemplate).toMatch(/\{height\}|\{endpoint\}|\{hash\}|real rug's real chain state/i)
  expect(w.doesNotClaim).toMatch(/UPGRADE-KEY SURFACE|does NOT predict depegs|NEVER a verdict of safety/i)
  expect(w.wordingTracksEvidence).toMatch(/BOTH directions|upgraded wording WITHOUT a capture hash is a Halt|today-wording DESPITE a landed capture is a Halt/i)
})

test("PINS — Aligrithm filed inspiration-only; primary citations pinned (papers, not the blog); the PBO/CSCV trigger pinned + implementation-absent", () => {
  const al = G.aligrithm
  expect(al.AL1_filing).toMatch(/INSPIRATION-ONLY|NOT a competitor|nothing integrates/i)
  const cites = al.AL3_AL5_primaryCitations
  expect(cites.rule).toMatch(/PRIMARY sources.*the PAPER, never the blog/i)
  expect(cites.citations.join(" ")).toMatch(/Deflated Sharpe Ratio|SSRN 2460551/i)
  expect(cites.citations.join(" ")).toMatch(/Probability of Backtest Overfitting|SSRN 2326253/i)
  expect(cites.citations.join(" ")).toMatch(/10\.1080\/14697688\.2019\.1622311/i)
  const trig = al.AL4_AL6_pboTrigger
  expect(trig.what).toMatch(/≥ 20-50 trials per strategy family/i)
  expect(trig.pinnedTrigger).toMatch(/PINNED so it cannot drift/i)
  // the honest framing: the frozen rigor.py HAS the adjudicator math (inert on the single-trial path); the COMPANION is absent
  expect(trig.implementationAbsent).toMatch(/frozen rigor\.py.*adjudicator math|INERT on the single-trial/i)
  expect(trig.implementationAbsent).toMatch(/NEW CSCV\/PBO COMPANION|ASSERTED ABSENT|grep wall/i)
})

test("PINS — D30/D31 reserved + PARKED (operatorSigned=false); D23-D29 carried unsigned; the package spans D23-D31, D27 FIRST", () => {
  expect(G.deviations.reserved).toHaveLength(2)
  expect(G.deviations.reserved[0]).toMatch(/D30.*IMMUTABLE class.*flagship render|operatorSigned=false|PARKED/i)
  expect(G.deviations.reserved[1]).toMatch(/D31.*Aligrithm.*primary-citations.*PBO/i)
  expect(G.deviations.carriedUnsigned).toMatch(/D23-D29 carried.*unsigned|D23-D31, D27 FIRST/i)
})

test("PINS — the verdict-path + frozen-core hash sets === live (UNCHANGED) AND === Precision (no drift); S61-S63; kill-criterion + bundle untouched", () => {
  for (const [rel, want] of Object.entries(G.verdictPathHashes as Record<string, string>)) {
    const live = createHash("sha256").update(readFileSync(path.join(PKG_ROOT, rel), "utf8")).digest("hex")
    expect(live, `${rel} moved from live`).toBe(want)
    expect(PRECISION.verdictPathHashes[rel], `${rel} drifted from Precision`).toBe(want)
  }
  for (const [rel, want] of Object.entries(G.frozenCoreHashes as Record<string, string>)) {
    const live = createHash("sha256").update(readFileSync(path.join(PKG_ROOT, rel), "utf8")).digest("hex")
    expect(live, `${rel} moved from live`).toBe(want)
    expect(PRECISION.frozenCoreHashes[rel], `${rel} drifted from Precision`).toBe(want)
  }
  for (const s of ["S61", "S62", "S63"]) expect(G.stressCatalog[s], `missing ${s}`).toBeTruthy()
  expect(G.killCriterionUntouched).toMatch(/8b4e094b/)
  expect(G.evidenceBundleSha).toMatch(/9c1e7bd8/)
  expect(G.massPathDeps).toEqual(["hono", "zod"])
})
