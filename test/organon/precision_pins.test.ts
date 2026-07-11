/**
 * ORGΛNON — THE PRECISION SPRINT, Phase 0 wall (PINS-LOCKED). data/honesty/precision-pins.json carries the X-PRECISION
 * contracts pre-fenced before a line of product code lands: (a) implementation-not-shell; (b) the 1967 slots verbatim +
 * the one-pinned-block rule + the CONSERVATIVE classifier (a ZERO admin slot → UNRESOLVED, NEVER EOA — the anti-cry-wolf
 * datum, verified on-chain); (c) the collapse WHITELIST (fold = canonicalMatch AND adminGated AND fingerprint) + the
 * three-form grammar; (d) the discrimination fixtures WITH rationale (compound TIMELOCK · aave UNRESOLVED · a synthetic
 * EOA control · the real-world census · the honest archive gap). Both D26 branches pre-designed; the D29 promotion spec
 * CONSERVATIVE + PARKED; MT1 the top countersign; S58–S60; the verdict-path + frozen-core hash sets === live (unchanged;
 * the governance fact is info/context) AND === Moat (no drift); pinsSha carries Moat 6aa2d0c7.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const P = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "precision-pins.json"), "utf8"))
const MOAT = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "moat-pins.json"), "utf8"))
const PRECISION_PINS_SHA_GOLDEN = "d2fa4cdcea7ca431e3c2cf5f7d697982ee2d19f0b95dc55d0f794a53593a2e5d"

test("PINS — the pinsSha is hash-locked (sha256 of the pins body) and carries Moat 6aa2d0c7", () => {
  const { pinsSha, ...body } = P
  expect(createHash("sha256").update(JSON.stringify(body)).digest("hex")).toBe(pinsSha)
  expect(pinsSha).toBe(PRECISION_PINS_SHA_GOLDEN)
  expect(P.carriedFromPinsSha).toBe("6aa2d0c7a23caaabe721732eb2efda2d2fbfbb79a67029f58a5b01da6c84170c")
})

test("PINS — X-PRECISION's four clauses are each present and load-bearing", () => {
  const x = P.xPrecisionLaw
  expect(x.clauseA_implementationNotShell).toMatch(/code that EXECUTES|resolved.*implementation/i)
  expect(x.clauseB_keyHolderNotKeyword).toMatch(/CONSERVATIVE|fabricated safety claim/i)
  expect(x.clauseC_collapseIsWhitelist).toMatch(/WHITELIST|STAYS ITEMIZED|S58/i)
  expect(x.clauseD_discriminateOrStayContext).toMatch(/S60|degrade-only|D29/i)
})

test("PINS (b) — the 1967 slots are pinned VERBATIM + one-pinned-block + the CONSERVATIVE classifier (zero-slot → UNRESOLVED, never EOA)", () => {
  expect(P.eip1967Slots.implementation).toBe("0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc")
  expect(P.eip1967Slots.admin).toBe("0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103")
  expect(P.onePinnedBlockRule).toMatch(/ONE explicit pinned blockNumber PER SUBJECT|mixed-block/i)
  const c = P.classifierSpec
  expect(c.law).toMatch(/CONSERVATIVE BY LAW|fabricated reassurance/i)
  // THE anti-cry-wolf rule — a zero admin slot is UNRESOLVED, never EOA (the aave immutable-admin datum)
  expect(c.zeroSlotIsUnresolvedNotEoa).toMatch(/ZERO.*admin slot is UNRESOLVED, NEVER EOA/i)
  expect(c.zeroSlotIsUnresolvedNotEoa).toMatch(/aave-v3|immutable|cry-wolf/i)
  expect(c.classes).toEqual(["EOA", "SAFE", "TIMELOCK", "UNRESOLVED"])
  expect(c.gatedClasses).toEqual(["SAFE", "TIMELOCK"]) // ONLY these fold the noise
  expect(c.probeSet.join(" ")).toMatch(/owner\(\)-hop/i)
  // the owner-hop flags the damning case ONE HOP OUT (a ProxyAdmin owned by a bare EOA) — conservative, never comforts
  expect(c.probeSet.join(" ")).toMatch(/owner\(\) a BARE EOA.*EOA \(via owner\)|damning case ONE HOP OUT/is)
})

test("PINS (c) — the collapse is a WHITELIST (fold requires all three) with the canonical fingerprints + the 3-form grammar + the S58 control", () => {
  const w = P.collapseWhitelist
  expect(w.law).toMatch(/WHITELIST, not a compressor/i)
  expect(w.foldRequiresAll).toHaveLength(3)
  expect(w.foldRequiresAll.join(" ")).toMatch(/canonicalMatch.*adminGated.*matchesCanonicalFingerprint/s)
  expect(w.canonicalFingerprints.length).toBeGreaterThanOrEqual(5)
  expect(w.canonicalFingerprints.join(" ")).toMatch(/upgrade entrypoint without an auth signal/)
  // the S58 control — an EOA-admin ungated upgrade SURVIVES (nothing folds when adminGated is false)
  expect(w.s58Control).toMatch(/SURVIVE the collapse|admin=EOA|gravest/i)
  expect(w.censusIsOutcomeNotTarget).toMatch(/OUTCOME, never a target|A′#9/i)
  // the three grammar forms
  expect(P.oneLineGrammar.gated).toMatch(/Upgrade path gated; verify the signers/)
  expect(P.oneLineGrammar.eoa).toMatch(/A single key can replace this contract's logic/)
  expect(P.oneLineGrammar.unresolved).toMatch(/treat with EOA-grade caution/)
  expect(P.oneLineGrammar.stillInfoContext).toMatch(/info\/context|D29 parked/i)
})

test("PINS (d) — the discrimination fixtures are pinned WITH rationale (compound gated · aave UNRESOLVED · synthetic EOA · real census · honest archive gap)", () => {
  const f = P.discriminationFixtures
  const clean = f.knownClean
  expect(clean.find((x: { key: string }) => x.key === "compound-v3-usdc").expect).toMatch(/TIMELOCK|gated/i)
  const aave = clean.find((x: { key: string }) => x.key === "aave-v3-pool")
  expect(aave.expect).toMatch(/admin slot reads 0x0|UNRESOLVED/i)
  expect(aave.rationale).toMatch(/anti-cry-wolf|never EOA/i)
  // the rugged set — a SYNTHETIC control, honestly labeled (not claimed REAL)
  const rug = f.knownRugged[0]
  expect(rug.provenance).toBe("SYNTHETIC-FIXTURE")
  expect(rug.synthetic).toBe(true)
  expect(rug.rationale).toMatch(/opposite of a gamed fixture|separation rests on the thing that matters/i)
  // the real-world census grounds the discrimination (EOA is the EXTINCT danger class among live survivors)
  expect(f.realWorldCensus.datum).toMatch(/ZERO hold a direct-EOA admin|~50 mainnet proxies/i)
  expect(f.realWorldCensus.why).toMatch(/EXTINCT among notable live survivors|RUGGED and are now dead/i)
  // the clean/context side is REAL; the damning side is necessarily a labeled synthetic (the class is extinct live)
  expect(f.whyDamningIsSynthetic).toMatch(/CLEAN\/CONTEXT side is REAL|NOT gaming/i)
  // the archive-height real-rug is an HONEST GAP (never simulated)
  expect(f.honestGap.status).toMatch(/HONEST GAP/i)
  expect(f.honestGap.why).toMatch(/archive|never faked|LN5/i)
})

test("PINS — BOTH D26 branches pre-designed; branch B BUILT (no signature); D26 OWED-OPERATOR-GATED; mass path {hono, zod}", () => {
  expect(P.d26Branches.branchA_signed.requires).toMatch(/Operator's D26 signature|must not land/i)
  expect(P.d26Branches.branchA_signed.cost).toMatch(/Bun 1\.3\.11|@noble\/hashes|node/i)
  expect(P.d26Branches.branchB_declined.requires).toMatch(/NO signature|zero deps/i)
  expect(P.d26Branches.branchB_declined.ceiling).toMatch(/NOVEL proxy shapes stay honestly UNRESOLVED/i)
  expect(P.d26Decision.decision).toMatch(/BRANCH B BUILT/i)
  expect(P.d26Decision.d26Status).toMatch(/OWED-OPERATOR-GATED|operatorSigned=false|LN5/i)
  expect(P.d26Decision.massPathUntouched).toMatch(/\{hono, zod\}|ZERO deps/i)
  expect(P.massPathDeps).toEqual(["hono", "zod"])
})

test("PINS — the D29 promotion spec is CONSERVATIVE (degrade-only), DAMNING-EOA-only, and PARKED for the Operator", () => {
  const d = P.d29PromotionSpec
  expect(d.direction).toMatch(/CONSERVATIVE.*degrade-only|never lift one|frighten.*never automatically comfort/is)
  expect(d.scope).toMatch(/DAMNING EOA-admin case ONLY/i)
  expect(d.parked).toMatch(/operatorSigned=false|must not move what decides verdicts|D27 precedent/i)
  expect(d.censusPreComputed).toMatch(/eyes open|affected-pool census/i)
})

test("PINS — MT1 is the TOP-priority countersign; MT1–MT5 all pinned; the rejects stay rejected", () => {
  const mt = P.mtClosures
  expect(mt.MT1).toMatch(/TOP-priority countersign|FIRST in the Phase-5 package/i)
  expect(mt.MT1).toMatch(/GOs honestly become INSUFFICIENT|that is the fix working/i)
  expect(mt.MT3).toMatch(/RECONSTRUCTION.*AFTERMATH|never blur/s)
  expect(mt.MT4).toMatch(/whole|no partial credit/i)
  expect(mt.MT5).toMatch(/US 2019\/0294990 A1|re-dated/i)
  expect(P.screenScope.rejectsStayRejected).toMatch(/Slither.*AGPL|Mythril.*Aderyn/s)
})

test("PINS — the verdict-path + frozen-core hash sets === live (UNCHANGED) AND === Moat (no drift); S58–S60; kill-criterion untouched", () => {
  for (const [rel, want] of Object.entries(P.verdictPathHashes as Record<string, string>)) {
    const live = createHash("sha256").update(readFileSync(path.join(PKG_ROOT, rel), "utf8")).digest("hex")
    expect(live, `${rel} moved from live`).toBe(want)
    expect(MOAT.verdictPathHashes[rel], `${rel} drifted from Moat`).toBe(want)
  }
  for (const [rel, want] of Object.entries(P.frozenCoreHashes as Record<string, string>)) {
    const live = createHash("sha256").update(readFileSync(path.join(PKG_ROOT, rel), "utf8")).digest("hex")
    expect(live, `${rel} moved from live`).toBe(want)
    expect(MOAT.frozenCoreHashes[rel], `${rel} drifted from Moat`).toBe(want)
  }
  expect(P.deviations.reserved.join(" ")).toMatch(/D28.*D29/s)
  for (const s of ["S58", "S59", "S60"]) expect(P.stressCatalog[s], `missing ${s}`).toBeTruthy()
  expect(P.killCriterionUntouched).toMatch(/8b4e094b/)
})
