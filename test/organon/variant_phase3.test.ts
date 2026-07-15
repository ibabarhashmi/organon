/**
 * ORGΛNON — THE VARIANT SPRINT (V41), Phase 3 wall (S163): THE PBO CROSS-CHECK, MADE INDEPENDENT (or RETIRED). NO NEW LAW.
 *
 * W-VR03 — L-3 / DD-71 / RP-3: `pbo 0.6 vs 0.6, Δ=0.00e+0` was cc.pbo vs cc.pboPurgedcv — byte-identical SHARED LINEAGE, a
 * cross-check that cannot fail (X-REACH(a)), feeding D33's SIGNABLE for four sprints proving nothing. THE FIX (DD-71a, the
 * preferred path): the PBO agreement's `theirs` leg is now the GENUINELY INDEPENDENT hand-rolled CSCV (own Sharpe), and it is
 * PROVEN to DETECT (RP-3) — a clone-stable ported CSCV run on constructed KNOWN-non-trivial fixtures returns ≈0.5 for pure
 * noise (the IS-best is overfit) and ≈0 for a real-edge matrix (the edge dominates IS and OOS). It DISCRIMINATES, so its
 * agreement at 0.6 on the real fixture is meaningful, not a shared-code artifact. D33's state / testRedesigns / the bundle are
 * UNCHANGED; the frozen PBO is READ, never touched (0 drift). 0.6-vs-0.6 never again masquerades as agreement.
 */
import { test, expect } from "bun:test"
import { CrossCheck, Cscv, Signability } from "../../src/backtest/crosscheck"
import { checkFrozenSet } from "../../src/organon/frozen"
import { Claim } from "../../src/organon/claim"

test("S163 (W-VR03) — the independent CSCV DETECTS: ≈0.5 on pure noise, ≈0 on a real edge (it can DISAGREE — RP-3)", () => {
  const noise = Cscv.pbo(Cscv.noiseMatrix(240, 10, 20260715), 8)
  const edge = Cscv.pbo(Cscv.edgeMatrix(240, 10, 20260715, 0.6), 8)
  expect(noise).toBeGreaterThan(0.35) // pure noise → the IS-best is overfit → PBO ≈ 0.5
  expect(edge).toBeLessThan(0.15) // a real persistent edge → the IS-best is OOS-best → PBO ≈ 0
  expect(noise - edge).toBeGreaterThan(0.3) // a WIDE gap — the cross-check DISCRIMINATES (not a check that only returns 0.6)
})

test("S163 (W-VR03) — the detection proof is DETERMINISTIC (clone-stable; no Math.random — a fresh clone reproduces it to the bit)", () => {
  expect(Cscv.pbo(Cscv.noiseMatrix(240, 10, 20260715), 8)).toBe(Cscv.pbo(Cscv.noiseMatrix(240, 10, 20260715), 8))
  expect(Cscv.pbo(Cscv.edgeMatrix(240, 10, 20260715, 0.6), 8)).toBe(Cscv.pbo(Cscv.edgeMatrix(240, 10, 20260715, 0.6), 8))
})

test("S163 (W-VR03) — pboIndependent: the shared 0.6-vs-0.6 is RETIRED; the theirs leg is the INDEPENDENT hand-rolled CSCV, proven detectable", () => {
  const pi = CrossCheck.pboIndependent()!
  expect(pi).toBeTruthy()
  expect(pi.degenerateRetired.leg).toBe("cc.pbo vs cc.pboPurgedcv")
  expect(pi.degenerateRetired.delta).toBe(0) // byte-identical shared lineage
  expect(pi.independentLeg.name).toMatch(/hand-rolled CSCV/)
  expect(pi.detectionProof.detectable).toBe(true) // it discriminates → its agreement is meaningful
})

test("S163 (W-VR03) — the PBO agreement's theirs leg is now cc.pboHandRolled (independent), NOT cc.pboPurgedcv (shared)", () => {
  const rec = CrossCheck.record()
  if ("blocked" in rec) return
  const a = CrossCheck.agreement("pbo")
  expect(a.theirs).toBe(rec.pboHandRolled) // the independent leg
  // a SEEDED disagreement on the INDEPENDENT leg flips D33 to UNSIGNABLE (the claim's own inversion, now genuinely independent)
  const seeded = { ...rec, pbo: 0.6, pboHandRolled: 0.95, pboHandRolledDiff: 0.35 }
  expect(CrossCheck.agreement("pbo", seeded).agrees).toBe(false)
  expect(Signability.d33(CrossCheck.all(seeded)).state).toBe("UNSIGNABLE")
})

test("S163 (W-VR03) — D33's state / testRedesigns / pboEvidence: SIGNABLE unchanged; the correction is DERIVED, bundle-safe", () => {
  const d = Signability.d33()
  expect(d.state).toBe("SIGNABLE") // UNCHANGED — the degenerate leg was replaced, not the verdict
  expect(d.testRedesigns).toBe(1) // UNCHANGED
  expect(d.agreed.sort()).toEqual(["dsr", "pbo", "psr"]) // all three still agree (PBO now via the independent leg)
  // the D33 producer carries pboEvidence = "independent…" (bundle-safe, like riderEnforced)
  const v = Claim.producer("d33").value as { pboEvidence: string; state: string }
  expect(v.pboEvidence).toMatch(/independent/)
  expect(v.pboEvidence).toMatch(/retired|0\.6-vs-0\.6/)
})

test("S163 (W-VR03) — the frozen PBO is READ, never touched: checkFrozenSet reports 0 drift (the CSCV is ported to the harness)", () => {
  expect(checkFrozenSet().filter((c) => c.status === "drift").length).toBe(0)
})
