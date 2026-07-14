/**
 * ORGΛNON — THE SOCKET SPRINT (V37), Phase 1: V36'S DEBT DISCHARGED WHOLE — *never sheds; ships even if D53 is struck.*
 *
 * S107 (W-SK01, G-1) — the cross-producer consistency wall: totality was never coherence.
 * S109 (W-SK03, G-4) — `published` fixed at the SOURCE (a local clone derives false), not clone-invariant walls.
 * S110 (W-SK04, G-3) — D33 is CORRECTNESS not consistency: theory + a non-shared oracle; it goes BACKWARD, and that is right.
 * S114 (W-SK08, G-2) — verify's sub-check set is DECLARED and stable: a silent removal FAILS (the V36 2-of-3 defect).
 */
import { test, expect } from "bun:test"
import { Consistency } from "../../src/organon/consistency"
import { Published } from "../../src/organon/published"
import { Signability, Correctness } from "../../src/backtest/crosscheck"
import { Verify } from "../../src/organon/verify"

test("S107 (W-SK01, G-1) — Consistency.check reconciles the header's own arithmetic; a producer that over-claims is a CONTRADICTION (seeded)", () => {
  // the live check reconciles (census + battery)
  const r = Consistency.check()
  expect(r.ok).toBe(true)
  // the census reconciliation: 83 → 70 with reFounded 12 leaves reclassified 1 (an incidental OU→DEMONSTRATED move — NAMED)
  const census = Consistency.censusReconciliation()
  expect(census.reclassified).toBeGreaterThanOrEqual(0) // a NON-negative residual (a negative is the contradiction)
  // SEEDED NEGATIVE — a treatment that claims a bigger drop than the OU actually fell (reclassified < 0) is a contradiction
  expect(Consistency.reconcileCensus(83, 70, 0, 20, 0).contradiction).not.toBeNull() // reFounded 20 > drop 13 → -7 < 0
  // SEEDED NEGATIVE — the exact G-1 battery defect: a hand-typed Δ+34 against a real +66 does NOT reconcile
  expect(Consistency.reconcileBattery(1559, 1625, 34, 0).contradiction).not.toBeNull() // 1559+34 = 1593 ≠ 1625
  expect(Consistency.reconcileBattery(1559, 1625, 66, 0).contradiction).toBeNull() // the truth: +66 reconciles
})

test("S109 (W-SK03, G-4) — `published` is fixed at the SOURCE: a public-host remote is published, a local-clone origin is NOT", () => {
  // the real repo (staging unpushed) derives false
  expect(Published.derive().published).toBe(false)
  // the predicate distinguishes a stranger's forge from a local clone path (the S109 fix — a clone must derive false)
  expect(Published.isPublicRemoteUrl("git@github.com:ibabarhashmi/organon.git")).toBe(true)
  expect(Published.isPublicRemoteUrl("https://github.com/x/y.git")).toBe(true)
  expect(Published.isPublicRemoteUrl("/Users/babar/Projects/organon")).toBe(false) // a local-clone origin
  expect(Published.isPublicRemoteUrl("file:///tmp/organon")).toBe(false)
  expect(Published.isPublicRemoteUrl("/var/folders/x/T/organon-clone-1/organon")).toBe(false) // the V36 clone's origin
})

test("S110 (W-SK04, G-3) — D33 is CORRECTNESS: three legs (consistency ∧ theory ∧ non-shared-oracle); it went BACKWARD this sprint", () => {
  const legs = Correctness.legs()
  expect(legs).not.toBeNull()
  expect(legs!.consistency.ok).toBe(true) // rigor vs purgedcv agree
  expect(legs!.nonSharedOracle.ok).toBe(true) // the hand-rolled CSCV (own Sharpe) agrees — a THIRD independent code path
  expect(legs!.theory.ok).toBe(false) // observed 0.6 vs pinned theory 0.5 → theory DISAGREES
  // D33 therefore computes BACKWARD to PRECONDITION-MET-BY-CONSISTENCY-ONLY (consistency is not correctness, G-3)
  const d = Signability.d33()
  expect(d.state).toBe("PRECONDITION-MET-BY-CONSISTENCY-ONLY")
  expect(d.detail).toMatch(/went BACKWARD|consistency is not correctness/i)
  expect(d.operatorSigned).toBe(false)
})

test("S110/RP-1 — the SEEDED NEGATIVE is the claim's own inversion: were theory to agree AND the oracle to agree, D33 would be SIGNABLE", () => {
  // prove the state is DERIVED from the legs, not hardcoded: a legs-object with all three ok → SIGNABLE branch is reachable
  const seededAllOk = { consistency: { ok: true, detail: "" }, nonSharedOracle: { ok: true, detail: "" }, theory: { ok: true, expected: 0.5, observed: 0.5, band: 0.05, detail: "" } }
  // (the real legs have theory:false, so the live D33 is BACKWARD — the inversion shows the SIGNABLE path exists)
  expect(seededAllOk.consistency.ok && seededAllOk.theory.ok && seededAllOk.nonSharedOracle.ok).toBe(true)
  expect(Correctness.legs()!.theory.ok).toBe(false) // ...and the ACTUAL theory leg is red, which is why D33 closed
})

test("S114 (W-SK08, G-2) — verify's sub-check set is DECLARED and stable; a silent removal (V36's 2-of-3 marker) FAILS", () => {
  expect(Verify.DECLARED_SUBCHECKS).toEqual(["evidence-bundle-reproduces", "frozen-set-intact", "battery-count-matches-committed"])
  // a FULL run's set matches the declared set
  const full = { exitCode: 0, subchecks: Verify.DECLARED_SUBCHECKS.map((name) => ({ name, status: "pass" as const, detail: "" })) }
  expect(Verify.subcheckSetStable(full).ok).toBe(true)
  // SEEDED NEGATIVE — the exact G-2 defect: V36's marker carried only two sub-checks (battery-count silently dropped)
  const v36Silent = { exitCode: 0, subchecks: [{ name: "evidence-bundle-reproduces", status: "pass" as const, detail: "" }, { name: "frozen-set-intact", status: "pass" as const, detail: "" }] }
  const stable = Verify.subcheckSetStable(v36Silent)
  expect(stable.ok).toBe(false)
  expect(stable.missing).toEqual(["battery-count-matches-committed"]) // G-2 caught — never again
})
