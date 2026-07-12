/**
 * ORGΛNON — THE MANIFEST SPRINT, Phase 0 wall (PINS-LOCKED). manifest-pins.json is self-consistent, carried from the
 * Domain head (which carried Coverage → Redesign → GroundTruth), and pins every X-MANIFEST contract BEFORE one line of
 * product code: the declarative-only law + the BANNED-OUTPUT list (weights/rebalance/rankings/allocations — a summary
 * missing "rankings" is a Halt), the recording-≠-counting clause (BOTH trigger AND pen), the exit-criterion discipline
 * + the evaluable set, the composed grammar forms, the strategy-of-one byte-identity requirement, the DV closures + the
 * showcase rationale pinned PRE-capture, D37/D38 reserved (Operator-signed=false — LN5), S71–S73. The lock bites.
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const mf = JSON.parse(readFileSync(path.join(H, "manifest-pins.json"), "utf8"))
const DOMAIN = JSON.parse(readFileSync(path.join(H, "domain-pins.json"), "utf8"))

const MANIFEST_PINS_SHA_GOLDEN = "98a44bd8970c96cc78a377f11ae7a6b779fd2cb8e7c2672093b4c404b53db084"

test("MANIFEST — the pins hash-lock is the pinned golden + self-consistent + carried from the Domain head (a moved pin moves the sha)", () => {
  expect(mf.pinsSha).toBe(MANIFEST_PINS_SHA_GOLDEN)
  const { pinsSha, ...rest } = mf
  expect(sha256(JSON.stringify(rest))).toBe(mf.pinsSha) // self-consistent
  expect(mf.carriedFromPinsSha).toBe(DOMAIN.pinsSha) // carried forward, never rebuilt
  expect(mf.carriedFromPinsSha).toBe("2b1dd373e466f468e2b6395ee940c9b9fa70c05795633e2278b1c743cfe1121d")
  // POSITIVE CONTROL: dropping "rankings" from the banned list (a summarization) moves the sha — the lock bites
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.xManifest.a_declarativeOnly.bannedOutputs = ["suggested weights"]
  expect(sha256(JSON.stringify(mutated))).not.toBe(mf.pinsSha)
})

test("MANIFEST — X-MANIFEST(a): DECLARATIVE-ONLY — the banned-output list is present + testable (weights · rebalance · rankings · allocations); the advice wall re-runs (S71)", () => {
  const a = mf.xManifest.a_declarativeOnly
  expect(a.rule).toMatch(/DECLARATIVE-ONLY/i)
  expect(a.rule).toMatch(/the Markowitz rejection stands/i)
  expect(a.rule).toMatch(/it never writes your code/i)
  // the banned list names each shape (a list omitting "rankings" is a Halt)
  for (const shape of ["rebalance", "rankings", "allocation", "consider instead"]) expect(a.bannedOutputs).toContain(shape)
  expect(a.bannedOutputs.some((s: string) => /suggested (weights|allocation)/.test(s))).toBe(true)
  expect(a.bannedRule).toMatch(/REFUSED and quoted \(S71\)/)
  expect(a.bannedRule).toMatch(/advice wall.*re-run on EVERY composed line/i)
})

test("MANIFEST — X-MANIFEST(b): COMPILE = COMPOSITION — every number already exists; the strategy-of-one byte-identity; the min-overlap floor propagates (never a thin decimal)", () => {
  const b = mf.xManifest.b_compileIsComposition
  expect(b.rule).toMatch(/COMPILE = COMPOSITION/i)
  expect(b.rule).toMatch(/BYTE-IDENTICAL to today's Reality Check/i)
  expect(b.rule).toMatch(/INSUFFICIENT, never a thin decimal/i)
  expect(b.minOverlapFloor).toBe(30) // === Correlate.MIN_OVERLAP
  // the composed grammar forms are pinned VERBATIM (the drawer must speak this grammar)
  const g = b.grammar
  expect(g.effectiveBets).toMatch(/independent bets.*ρ-matrix traced/i)
  expect(g.effectiveBets).toMatch(/never an allocation/i)
  expect(g.effectiveBetsInsufficient).toMatch(/INSUFFICIENT.*below the pinned 30-point floor/i)
  expect(g.catchAggregationFunding).toMatch(/perp-funding carry.*concentrates in one regime/i)
  expect(g.catchAggregationLeverage).toMatch(/evaluates a POSITION, not the protocol/i)
  expect(g.catchAggregationRwa).toMatch(/cannot be verified on-chain/i)
  expect(g.worstAxis).toMatch(/Weakest deciding axis/i)
  expect(g.thesisAge).toMatch(/UNJUDGEABLE-YET/i)
  expect(g.exitEval).toMatch(/NOT FIRED/i)
  // the composite verdict is explicitly ABSENT + labeled (D38)
  expect(g.compositeAbsence).toMatch(/NOT rendered.*awaits the Operator's D38/i)
})

test("MANIFEST — X-MANIFEST(c): RECORDED, NEVER COUNTED — the clause asserts BOTH the trigger AND the pen; familyN===1 STILL (S72)", () => {
  const c = mf.xManifest.c_recordedNeverCounted
  expect(c.rule).toMatch(/RECORDED, never COUNTED/i)
  const v = c.recordingNotCountingVerbatim
  expect(v).toMatch(/`familyN === 1` holds in EVERY Stamp output STILL/i)
  // the K-door needs BOTH — a clause naming only one is a summarization Halt
  expect(v).toMatch(/BOTH the pinned ≥ 20–50-trials-per-family trigger AND the Operator's D33 signature/i)
  expect(v).toMatch(/every K-feed is REFUSED/i)
  expect(v).toMatch(/A trial written with familyN=K 'just to see' is a Halt/i)
  expect(c.kDoorRequiresBoth).toMatch(/BOTH.*trigger AND the Operator's D33/i)
})

test("MANIFEST — X-MANIFEST(d): the exit criterion is the USER'S kill-criterion — evaluable-or-refused, content-hashed, immutable-without-a-disclosed-re-pin (S73)", () => {
  const d = mf.xManifest.d_exitIsUsersKillCriterion
  const v = d.disciplineVerbatim
  expect(v).toMatch(/the USER'S kill-criterion/i)
  expect(v).toMatch(/content-hashed AT REGISTRATION exactly as the tool's own `8b4e094b`/i)
  expect(v).toMatch(/REFUSED at registration with the reason/i)
  expect(v).toMatch(/A silent edit.*is DETECTED/i)
  expect(v).toMatch(/deterministic over the captured facts \(byte-identical ×2\)/i)
  // the evaluable set — each kind maps to a fact the engine already captures
  for (const k of ["peg-floor", "funding-flip-count", "tvl-drawdown", "governance-change"]) expect(typeof d.evaluableSet[k]).toBe("string")
  expect(d.evaluableSet["peg-floor"]).toMatch(/peg axis/i)
})

test("MANIFEST — X-MANIFEST(e): a STRATEGY IS A SUBJECT — a drawer + a path, no fourth screen; the composite verdict PARKED (D38), its absence labeled", () => {
  const e = mf.xManifest.e_strategyIsASubject
  expect(e.rule).toMatch(/A STRATEGY IS A SUBJECT, not a screen/i)
  expect(e.rule).toMatch(/`\/check` accepts a manifest exactly as it accepts a pool key/i)
  expect(e.rule).toMatch(/the COMPOSITE verdict is D38, PARKED for the pen/i)
  expect(e.rule).toMatch(/a composite pill, or a server-side account is a Halt/i)
  expect(e.screens).toEqual(["shelf", "reality-check", "ask"]) // no fourth screen
  expect(e.compositeAbsenceVerbatim).toMatch(/awaits the Operator's D38/i)
})

test("MANIFEST — the manifest schema is versioned + strict; the strategy-of-one byte-identity is the backward-compat control", () => {
  const s = mf.manifestSchema
  expect(s.schemaVersion).toBe(1)
  expect(s.strict).toBe(true)
  expect(s.fields.positions).toMatch(/subjectKey.*size.*units/i)
  expect(s.fields.exitCriterion).toMatch(/peg-floor\|funding-flip-count\|tvl-drawdown\|governance-change/)
  expect(s.fields.journal).toMatch(/priorIntent.*decisionAfter.*changedByCompile/i)
  expect(s.refusalRule).toMatch(/parseManifest returns the Manifest OR a REFUSAL SENTENCE/i)
  expect(s.refusalRule).toMatch(/no recursion this sprint/i)
  expect(mf.strategyOfOneByteIdentity.rule).toMatch(/compile\(\{one position\}\) renders BYTE-IDENTICAL/i)
})

test("MANIFEST — the trials-ledger schema (Moat RE5) is sourced verbatim + its inert proof pinned", () => {
  const t = mf.trialLedger
  expect(t.schemaSource).toMatch(/moat-pins\.json.*Moat RE5/i)
  expect(t.perTrialRecord.join(" ")).toMatch(/manifestHash.*composedFacts.*metricSurface.*prevTrialHash/i)
  expect(t.store).toMatch(/data\/strategies\/trials\/.*gitignored.*committed FIXTURE/i)
  expect(t.inertProof).toMatch(/familyN === 1.*seeded K-feed REFUSED/i)
})

test("MANIFEST — DV1–DV5 closed: the four showcase subjects (rationale pinned PRE-capture, representativeness not flattery), DV3 position-scope, DV4 cadence, DV5 invite line", () => {
  const dv = mf.dv
  // DV1 — one representative subject per new domain; the rationale is REPRESENTATIVENESS, not a dramatic catch axis (the FIREWALL)
  const domains = dv.DV1.subjects.map((s: { domain: string }) => s.domain)
  expect(domains).toEqual(["STABLE-SYNTH", "LST-LRT", "LOOPED-CDP", "RWA"])
  for (const s of dv.DV1.subjects) {
    expect(s.rationale.length).toBeGreaterThan(60) // a real reason, not a stub
    expect(s.rationale).toMatch(/chosen for (size|dominance)|representative|not for a (dramatic|wide|extreme)/i)
  }
  expect(dv.DV2).toMatch(/D35 re-presented WITH B4's MISS/i)
  expect(dv.DV3.positionScopeVerbatim).toMatch(/evaluates a position, not the protocol/i)
  expect(dv.DV4.cadenceVerbatim).toMatch(/format-patch \| git am.*AT CONVERGENCE/i)
  expect(dv.DV4.cadenceVerbatim).toMatch(/PR5 divergence wall.*fresh runtime expect\(\)/i)
  expect(dv.DV5.inviteLineVerbatim).toMatch(/published the two it would have MISSED/i)
})

test("MANIFEST — D37/D38 reserved Operator-signed=false (LN5); the D-ledger split is surfaced (materialized D1–D31; reserved D32–D38 in pins/packages)", () => {
  expect(mf.deviations.D37).toMatch(/RESERVED — the manifest scope/i)
  expect(mf.deviations.D37).toMatch(/moves no verdict and adds no advice/i)
  expect(mf.deviations.D37).toMatch(/Operator-signed=false/)
  expect(mf.deviations.D38).toMatch(/RESERVED — the COMPOSITE STRATEGY VERDICT/i)
  expect(mf.deviations.D38).toMatch(/an agent may NOT install/i)
  expect(mf.deviations.D38).toMatch(/NO aggregate pill/i)
  expect(mf.deviations.operatorGatedNote).toMatch(/D27 STILL FIRST/i)
  expect(mf.deviations.operatorGatedNote).toMatch(/NEVER signs it \(LN5\)/i)
  // the honest reconciliation of the ledger split (X-DEVLEDGER) — surfaced, not silent
  expect(mf.deviations.operatorGatedNote).toMatch(/materializes D1–D31.*reserved pens D32–D38 live in the per-sprint pins/i)
})

test("MANIFEST — the stress catalog grows to S1–S73 (S71–S73 new); the carried constitution byte-untouched (deps, screens, differential/bundle/kill prefixes, substrate)", () => {
  expect(mf.stressCatalog.count).toBe(73)
  for (const k of ["S71", "S72", "S73"]) expect(typeof mf.stressCatalog[k]).toBe("string")
  expect(mf.stressCatalog.S71).toMatch(/manifest integrity.*strategy-of-one byte-identity/i)
  expect(mf.stressCatalog.S72).toMatch(/trials honesty.*RECORDING-≠-COUNTING/i)
  expect(mf.stressCatalog.S73).toMatch(/exit immutability.*silent edit DETECTED/i)
  expect(mf.carried.deps).toEqual(["hono", "zod"])
  expect(mf.carried.screens).toEqual(["shelf", "reality-check", "ask"])
  expect(mf.carried.verdictDifferential.lendingFpSetShaPrefix).toBe("70c7912f")
  expect(mf.carried.verdictDifferential.fundingReproHashPrefix).toBe("0a63151b")
  expect(mf.carried.evidenceBundleShaPrefix).toBe("9c1e7bd8")
  expect(mf.carried.killCriterion).toBe("8b4e094b")
  expect(mf.carried.substrateUntouched).toMatch(/SECOND CALLER.*changes ZERO math.*familyN===1/i)
  expect(mf.carried.parkedByName.join(" ")).toMatch(/COMPOSITE strategy verdict \(D38/i)
  expect(mf.carried.parkedByName.join(" ")).toMatch(/marketplace\/leaderboard.*REJECTED permanently/i)
})
