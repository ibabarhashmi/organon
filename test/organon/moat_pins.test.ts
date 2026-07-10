/**
 * ORGΛNON — THE MOAT SPRINT, Phase 0 wall (PINS-LOCKED). data/honesty/moat-pins.json carries the four deepening lines
 * pre-fenced: (a) the capture-time dependency contract (viem/whatsabi EXACT-pinned · batching prohibited + tested · reads
 * block-pinned · a capture-module allowlist · no signing import · RE6 flip); (b) the PIT-honesty re-score contract;
 * (c) the variance-audit protocol + the two D27 paths (amendment direction=CONSERVATIVE; caveat placement); (d) the
 * trials-ledger schema (implementation-absent) + the RE3 label + the RE4 FTO action; PR1–PR5; the DISC-B supersession;
 * D26/D27 reserved; S55–S57; the verdict-path + frozen-core hash sets === live (unchanged); pinsSha carries Probe e6bed150.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const P = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "moat-pins.json"), "utf8"))
const MOAT_PINS_SHA_GOLDEN = "6aa2d0c7a23caaabe721732eb2efda2d2fbfbb79a67029f58a5b01da6c84170c"

test("PINS — the pinsSha is hash-locked (sha256 of the pins body) and carries Probe e6bed150", () => {
  const { pinsSha, ...body } = P
  expect(createHash("sha256").update(JSON.stringify(body)).digest("hex")).toBe(pinsSha)
  expect(pinsSha).toBe(MOAT_PINS_SHA_GOLDEN)
  expect(P.carriedFromPinsSha).toBe("e6bed150ef680d414923df79c2f9835c732a5842644749b0df9a5a1db22f0c5e")
})

test("PINS (a) — the capture-time dependency contract is EXACT + testable (versions, batching prohibition, block-pinning, allowlist, no signing, RE6 flip)", () => {
  const c = P.captureTimeDependencyContract
  expect(c.candidates.viem.version).toBe("2.55.0")
  expect(c.candidates.viem.license).toBe("MIT")
  expect(c.candidates.whatsabi.version).toBe("0.26.0")
  expect(c.candidates.whatsabi.license).toBe("MIT")
  expect(c.exactPinRule).toMatch(/EXACT versions only|no \^/i)
  // the batching prohibition names the two footguns + REQUIRES the biting test (S55)
  expect(c.batchingProhibition.prohibited).toContain("batch.multicall")
  expect(c.batchingProhibition.prohibited.join(" ")).toMatch(/http\(\{ batch \}\)/)
  expect(c.batchingProhibition.test).toMatch(/byte-identical.*ON vs OFF|S55/i)
  expect(c.blockPinningRule).toMatch(/EXPLICIT blockNumber|fixed height/i)
  expect(c.noSigningImport).toMatch(/NO signing|unexercised/i)
  expect(c.captureModuleAllowlist.allowed).toEqual(["script/capture/proxy-truth.ts"])
  expect(c.captureModuleAllowlist.rule).toMatch(/mass path STAYS hono\+zod|fails the build/i)
  expect(c.massPathRpcStateStaysHandRolled.flipConditionRE6).toMatch(/≥2 DISTINCT|CORRECTNESS failures/i)
  expect(c.adoptOrRecord).toMatch(/adopt|record insufficient-evidence/i)
  expect(c.d26Gate).toMatch(/Operator-signed|do NOT land/i)
})

test("PINS (b) — the PIT-honesty re-score contract names the trap + the SAMPLE fallback + the untouched kill-criterion", () => {
  const p = P.pitHonestyContract
  expect(p.realCellDefinition).toMatch(/contentSha|asOf|re-?[fF]etch/)
  expect(p.pitTrap).toMatch(/REAL-AS-FETCHED-NOW|does NOT claim REAL-AS-OF-COLLAPSE/i)
  expect(p.sampleFallback).toMatch(/STAYS SAMPLE/i)
  expect(p.killCriterionUntouched).toMatch(/8b4e094b/)
})

test("PINS (c) — the variance-audit protocol is READ-ONLY, names the i.i.d. evidence, and pre-designs BOTH D27 paths with the CONSERVATIVE direction clause", () => {
  const v = P.varianceAuditProtocol
  expect(v.readOnly).toMatch(/READ-ONLY|git diff -- src\/. empty|no product diff/i)
  expect(v.evidenceKnownAtPinTime).toMatch(/i\.i\.d|independent|n-1/i)
  expect(v.alreadyHaveTheFix).toMatch(/effective_n\.py|effective-N|τ_int/i)
  // the amendment path — deterministic, CONSERVATIVE direction, frozen seven untouched
  expect(v.d27Paths.amendment.direction).toMatch(/CONSERVATIVE/)
  expect(v.d27Paths.amendment.direction).toMatch(/net-GENEROUS.*HALT|presumptively wrong/i)
  expect(v.d27Paths.amendment.frozenSevenUntouched).toMatch(/byte-identical|does not edit rigor/i)
  // the caveat path — rendered, placed at the render layer
  expect(v.d27Paths.caveat.renderText).toMatch(/autocorrelated|independent/i)
  expect(v.d27Paths.caveat.placement).toMatch(/strength line|renderStamp/i)
  expect(v.d27Gate).toMatch(/Operator-owned|Operator-signed/i)
})

test("PINS (d) — the trials-ledger schema is present WITH implementation PARKED (deterministic clustering pre-required) + the RE3 label + the RE4 FTO action", () => {
  const t = P.trialsLedgerSchema
  expect(t.perTrialRecord.length).toBe(4)
  expect(t.perTrialRecord.join(" ")).toMatch(/config.*returnSeries.*metric.*contentSha/s)
  expect(t.deterministicClusteringPreRequired).toMatch(/deterministic|agglomerative|K-means.*hazard/i)
  expect(t.implementationParked).toMatch(/PARKED|SCHEMA ONLY|ZERO implementation/i)
  // RE3 label
  expect(P.re3InertDeflationLabel.text).toMatch(/inert.*no multiple-testing penalty/i)
  expect(P.re3InertDeflationLabel.placement).toMatch(/renderStamp|strength line/i)
  // RE4 FTO — dated, Operator-owned
  expect(P.re4FtoAction.patent).toBe("US 2019/0294990 A1")
  expect(P.re4FtoAction.owner).toMatch(/Operator/)
  expect(P.re4FtoAction.dated).toBeTruthy()
})

test("PINS — PR1–PR5 pinned + the DISC-B supersession recorded (Alpha chain intact, NOT rewritten)", () => {
  for (const pr of ["PR1", "PR2", "PR3", "PR4", "PR5"]) expect(P.probeFindings[pr], `missing ${pr}`).toBeTruthy()
  expect(P.probeFindings.PR1).toMatch(/OWED-OPERATOR-GATED|never simulated/i)
  expect(P.probeFindings.PR5).toMatch(/expect\(\).*counts|0-fail|never papered/i)
  const d = P.discBReconciliation
  expect(d.finding).toMatch(/organon-studio/)
  expect(d.reconciliation).toMatch(/SUPERSEDED|byte-identical self-substantiating/i)
  expect(d.alphaChainIntact).toMatch(/UNTOUCHED|never rewrite|supersede it forward/i)
})

test("PINS — the verdict-path + frozen-core hash sets === live (UNCHANGED at Phase 0); D26/D27 reserved; S55–S57", () => {
  for (const [rel, want] of Object.entries(P.verdictPathHashes as Record<string, string>)) {
    const live = createHash("sha256").update(readFileSync(path.join(PKG_ROOT, rel), "utf8")).digest("hex")
    expect(live, `${rel} moved`).toBe(want)
  }
  for (const [rel, want] of Object.entries(P.frozenCoreHashes as Record<string, string>)) {
    const live = createHash("sha256").update(readFileSync(path.join(PKG_ROOT, rel), "utf8")).digest("hex")
    expect(live, `${rel} moved`).toBe(want)
  }
  expect(P.deviations.reserved.join(" ")).toMatch(/D26.*D27/s)
  for (const s of ["S55", "S56", "S57"]) expect(P.stressCatalog[s], `missing ${s}`).toBeTruthy()
  expect(P.massPathDeps).toEqual(["hono", "zod"])
})
