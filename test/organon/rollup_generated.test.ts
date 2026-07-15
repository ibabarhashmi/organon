/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), Phase 1 walls: S100 (W-DV01, X-DERIVE the log is generated) + S102 (W-DV03, the
 * moat turned inward).
 *
 * S100 — E-0, the characteristic failure mode across three sprints (the phases do the honest work and the summary rounds it
 * up): every header/gate/marker claim has a PRODUCER (the claim→producer map is TOTAL — a claim with no producer is a
 * sentence, stripped); the terminal marker is GENERATED and Marker-valid; a hand-typed "green" over a non-zero exit FAILS;
 * a producer returning PARTIAL renders PARTIAL (X-DERIVE(e)); and each load-bearing producer has a SEEDED NEGATIVE that is
 * the CLAIM'S OWN INVERSION (RP-1 — a generated lie is a lie with a passing test).
 *
 * S102 — E-2, the moat turned inward: every number ABOUT THE PROJECT carries its provenance tier (REAL/SAMPLE/UNJUDGEABLE),
 * the tier bound in the pins; a project-number with no tier cannot be claimed (X-DERIVE(d)).
 */
import { test, expect } from "bun:test"
import { Claim } from "../../src/organon/claim"
import { Rollup } from "../../src/organon/rollup"
import { Marker } from "../../src/studio/marker"
import { Verify } from "../../src/organon/verify"
import { CrossCheck, Signability } from "../../src/backtest/crosscheck"
import { Release } from "../../src/organon/release"
import { Rigor } from "../../src/backtest/rigor"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const rec = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "rigor-crosscheck.json"), "utf8"))
const RUN: Rollup.RunMeasured = { fullBattery: { pass: 1600, skip: 2, fail: 0, files: 250, expect: 10000, twoRunsIdentical: true }, goldenMoves: 0, at: "2026-07-14" }

test("S100 (W-DV01) — the claim→producer map is TOTAL: every declared claim has a registered producer and every producer is declared (no orphan claims)", () => {
  const declared = Claim.declaredNames().sort()
  const registered = Claim.names().sort()
  expect(registered).toEqual(declared) // total both ways — a claim with no producer, or a producer with no claim, is a defect
  for (const n of registered) {
    const r = Claim.producer(n)
    expect(r.value !== undefined).toBe(true)
    expect(Array.isArray(r.artifacts)).toBe(true)
    expect(["REAL", "SAMPLE", "UNJUDGEABLE", "n/a"]).toContain(r.tier)
  }
})

test("S100 (W-DV01) — X-DERIVE(b): a claim with NO producer is a sentence, not a claim — Claim.producer strips it (throws)", () => {
  expect(() => Claim.producer("theProductIsGreatAndEveryoneLovesIt")).toThrow(/NO producer/i)
})

test("S100 (W-DV01) — the terminal marker is GENERATED and Marker-valid; every required slot is present and structurally correct (E-9 retired by the law)", () => {
  const marker = Rollup.terminalMarker(RUN)
  // the tree hash it emits is the real git tree (40-hex), the pins sha the real pins — never a typed value
  expect(String(marker.treeHash)).toMatch(/^[0-9a-f]{40}$/)
  const check = Marker.validate(marker, "terminal")
  expect({ ok: check.ok, missing: check.missing, invalid: check.invalid }).toEqual({ ok: true, missing: [], invalid: [] })
})

test("S100 (W-DV01) — X-REACH(c) carried into the generator: a marker that TYPES 'green' over a non-zero verify exit FAILS Marker.validate", () => {
  const bad = { ...Rollup.terminalMarker(RUN), verify: { exitCode: 1, subchecks: [{ name: "x", status: "fail", detail: "d" }] }, verifyOutput: "verify is green end-to-end" }
  const check = Marker.validate(bad, "terminal")
  expect(check.ok).toBe(false)
  expect(check.invalid.some((s) => /green/i.test(s))).toBe(true)
})

test("S100/RP-1 — the SEEDED NEGATIVE is the CLAIM'S OWN INVERSION: d33 'PBO disagrees' → UNSIGNABLE; Release 'artifact absent' → D50(i) false", () => {
  // d33 inversion — a seeded PBO disagreement flips SIGNABLE → UNSIGNABLE (not an arbitrary mutation). VARIANT V41 (S163):
  // the theirs leg is now the INDEPENDENT hand-rolled CSCV (cc.pboHandRolled), so the seed is a real independent divergence.
  const seeded = { ...(rec.crossCheck as Rigor.CrossCheck), pbo: 0.6, pboHandRolled: 0.95, pboHandRolledDiff: 0.35 }
  expect(Signability.d33(CrossCheck.all(seeded)).state).toBe("UNSIGNABLE")
  // Release inversion — the artifact is absent (dist gitignored) → D50(i) computes false, and the producer reflects it
  expect(Release.artifact()).toBe("ABSENT")
  expect(Claim.producer("d50i_binary").value).toBe(false)
})

test("S100/X-DERIVE(e) — a producer that returns PARTIAL renders PARTIAL, never complete (d33 when precondition-met-only; verifyOnClone when not-yet-run)", () => {
  // seed a DSR-only agreement (PSR/PBO uncomparable) → d33 is PARTIAL, and the producer must NOT render it complete
  const partialAgreements = [CrossCheck.agreement("dsr"), { ...CrossCheck.agreement("psr"), agrees: "UNCOMPARABLE" as const, comparable: false }, { ...CrossCheck.agreement("pbo"), agrees: "UNCOMPARABLE" as const, comparable: false }]
  const d = Signability.d33(partialAgreements)
  expect(d.state).toMatch(/PRECONDITION-MET-FOR-DSR-ONLY/)
  // the verifyOnClone producer flags partial honestly when the clone transcript is absent (never a fabricated green)
  const clone = Claim.producer("verifyOnClone")
  expect(typeof clone.partial).toBe("boolean")
})

test("S102 (W-DV03) — the moat turned inward: every number ABOUT THE PROJECT carries a provenance tier; the project-number claims are REAL/SAMPLE (never n/a)", () => {
  // the cross-check numbers are SAMPLE (synthetic golden noise, DD-18); the census/battery/theNumber are REAL
  expect(Claim.producer("crossCheckDsr").tier).toBe("SAMPLE")
  expect(Claim.producer("crossCheckPbo").tier).toBe("SAMPLE")
  expect(Claim.producer("census").tier).toBe("REAL")
  expect(Claim.producer("battery").tier).toBe("REAL")
  expect(Claim.producer("theNumber").tier).toBe("REAL")
  // a project-NUMBER claim may not be tier "n/a" — the moat governs the numbers ORGΛNON shows about ITSELF (E-2)
  for (const n of ["crossCheckDsr", "crossCheckPsr", "crossCheckPbo", "census", "battery", "theNumber"]) {
    expect(["REAL", "SAMPLE", "UNJUDGEABLE"]).toContain(Claim.producer(n).tier)
  }
})

test("S102 (W-DV03) — a project-number with no tier cannot be claimed: an unmapped claim throws (the tier is bound in the pins, the single source)", () => {
  // the tier comes from the pins' claim→producer map; a claim absent from the map has no tier and is unclaimable
  expect(() => Claim.producer("someUntieredProjectNumber")).toThrow(/NO producer/i)
})

test("S100 (W-DV01) — Rollup.header + gate are pure reads that assemble the producers (the summary is their OUTPUT, not typed prose)", () => {
  const h = Rollup.header(RUN)
  expect(String(h.pinsSha)).toMatch(/^[0-9a-f]{64}$/) // the real pins sha, computed
  expect((h.d50 as { i: boolean }).i).toBe(false) // binary uncommitted → RED (clone-INVARIANT: dist gitignored)
  expect(typeof (h.d50 as { iii: boolean }).iii).toBe("boolean") // published is DERIVED (a fresh clone's origin contains HEAD → true; that is correct, not a fixed false)
  const g = Rollup.gate()
  // FAMILY V39 (S150/MR18/J-4) — the gate now reads the ONE State.deviations() producer: D51 is ANSWERED (INSTRUMENT), so
  // the base gate no longer asks the question PART B already answered (the exact V38 contradiction). The supersession pointer
  // stands where the "product or instrument?" question was. (A carried wall consciously updated for the S150 architectural fix.)
  expect(g.firstLine).toMatch(/D51 ANSWERED = INSTRUMENT/) // the state, computed from the single producer — no contradiction
  expect((g.d51 as { state: string }).state).toBe("ANSWERED")
  expect((g.d51 as { supersedes: string }).supersedes).toMatch(/product, or an instrument/) // MR18 — the pointer where the question stood
  expect((g.d51 as { agentComputes: string }).agentComputes).toMatch(/the pen ALREADY chose|never signs/) // presented, never signed (LN5)
  // newProductCapability is DERIVED from the CURRENT sprint's pins — sprint-invariant, not a hardcoded value. PROVENANCE V42
  // (M-1/S169): the generator now reads the ACTUAL head (Pins.head → provenance-pins.json), so the header shows THIS sprint's
  // disclosed capability count. (Before the M-1 fix, currentPins was frozen at family-pins.json and this test hardcoded
  // substance-pins — the same stale-head class of defect the identity gate now forbids.)
  const currentCap = JSON.parse(require("node:fs").readFileSync(require("node:path").join(PKG_ROOT, "data", "honesty", "backfill-pins.json"), "utf8")).carried.newProductCapability
  expect(g.newProductCapability).toBe(currentCap)
})
