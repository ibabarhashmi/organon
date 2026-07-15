/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), Phase 2 wall: S101 — THE CROSS-CHECK, WHOLE. W-DV02 (minted to close E-1).
 *
 * E-1: V35 validated DSR and DSR ONLY; PSR and PBO were reported as outputs of the frozen module, not shown agreeing with
 * anything — and PBO/CSCV is the machinery D33 activates, so the one number most load-bearing for the pen was the one that
 * was not checked. Yet D33 was declared SIGNABLE. This wall makes the cross-check whole: three agreement records against
 * PRE-REGISTERED tolerances (read FROM THE PINS, X-DERIVE(f)); Signability.d33() computed from all three; a SEEDED
 * disagreement (the claim's own inversion, RP-1) → D33 computes UNSIGNABLE; UNCOMPARABLE is a distinct third value (RP-2);
 * the cross-check deps stay OUT of the mass path and the frozen runtime; checkFrozenSet 0 drift.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT, checkFrozenSet } from "../../src/organon/frozen"
import { CrossCheck, Signability, Correctness } from "../../src/backtest/crosscheck"
import { Rigor } from "../../src/backtest/rigor"

const H = path.join(PKG_ROOT, "data", "honesty")
const pins = JSON.parse(readFileSync(path.join(H, "derive-pins.json"), "utf8"))
const rec = JSON.parse(readFileSync(path.join(H, "rigor-crosscheck.json"), "utf8"))

test("S101 — three agreement records exist for DSR, PSR, PBO, each against the PRE-REGISTERED tolerance (E-1: the cross-check is whole, not ⅓)", () => {
  const all = CrossCheck.all()
  expect(all.map((a) => a.quantity)).toEqual(["dsr", "psr", "pbo"])
  for (const a of all) {
    expect(typeof a.ours).toBe("number")
    expect(typeof a.theirs).toBe("number")
    expect(typeof a.delta).toBe("number")
    expect(a.tolerance).toBe(0.02) // the pre-registered value
  }
  // this sprint: all three AGREE (DSR |Δ|≈1.2e-3, PSR ≈1e-5, PBO exact 0) — shown, not claimed
  expect(all.every((a) => a.agrees === true)).toBe(true)
})

test("S101 — X-DERIVE(f): the tolerance is READ FROM THE PINS, never a call-site constant (a moved pin moves the tolerance)", () => {
  expect(CrossCheck.tolerance("dsr")).toBe(pins.preRegisteredTolerances.dsr)
  expect(CrossCheck.tolerance("psr")).toBe(pins.preRegisteredTolerances.psr)
  expect(CrossCheck.tolerance("pbo")).toBe(pins.preRegisteredTolerances.pbo)
})

test("S101/S116 — Signability.d33() is COMPUTED from all three; on a VALID (powered) theory test D33 went FORWARD to SIGNABLE — and the agent STILL never signs (operatorSigned false, LN5)", () => {
  const d = Signability.d33()
  expect(d.agreed.sort()).toEqual(["dsr", "pbo", "psr"]) // consistency: all three still agree (rigor vs purgedcv)
  expect(d.disagreed).toEqual([])
  // SUBSTANCE V38 (S116): V37 failed the theory leg on a SINGLE-seed PBO (0.6 vs 0.5) — but the estimator's SD is ~0.1, so
  // that was ~1 SD of ordinary noise, a point/band test that could never succeed (X-REACH(a) backwards). The theory leg now
  // tests the POWERED null-distribution MEAN (≈0.508, z≈0.6): theory AGREES on a VALID test → D33 recomputes FORWARD to
  // SIGNABLE. It went forward because the invalid test was replaced by a valid one that passes, not by tuning any threshold.
  expect(d.state).toBe("SIGNABLE")
  expect(d.detail).toMatch(/precondition is met on ALL THREE legs/i)
  expect(d.operatorSigned).toBe(false) // LN5 — the precondition being met does NOT sign it; D33 stays fenced from K-activation
})

test("S116 — the theory leg can still FAIL (X-REACH(a)): a seeded powered mean far from 0.5 makes the theory leg close (a valid test that CAN fail)", () => {
  const cc = rec.crossCheck as Rigor.CrossCheck
  // seed a POWERED mean of 0.70 (a real bias, z far past 2) — the theory leg must FAIL (D33 would not be SIGNABLE)
  const seeded = { ...cc, s116PowerFix: { ...cc.s116PowerFix!, nullDistS16: { ...cc.s116PowerFix!.nullDistS16, mean: 0.70 } } } as Rigor.CrossCheck
  expect(Correctness.legs(seeded)!.theory.ok).toBe(false)
  // and the real record's theory leg passes (the positive control the seeded one inverts)
  expect(Correctness.legs()!.theory.ok).toBe(true)
})

test("S101 — RP-1: a SEEDED disagreement (the claim's own inversion — 'PBO disagrees') makes D33 compute UNSIGNABLE (the headline finding, not a bug)", () => {
  // fake a cross-check record where the INDEPENDENT hand-rolled CSCV's PBO diverges far beyond the pinned 0.02 — the
  // tolerance is STILL read from the pins (the seed changes only the quantities, never the tolerance). VARIANT V41 (S163):
  // the PBO agreement's theirs leg is now cc.pboHandRolled (the GENUINELY INDEPENDENT leg), not the degenerate shared
  // cc.pboPurgedcv — so the seeded inversion is now a REAL independent-implementation disagreement (L-3/DD-71a).
  const seeded = { ...(rec.crossCheck as Rigor.CrossCheck), pbo: 0.6, pboHandRolled: 0.95, pboHandRolledDiff: 0.35 }
  const all = CrossCheck.all(seeded)
  const pbo = all.find((a) => a.quantity === "pbo")!
  expect(pbo.agrees).toBe(false) // a comparable disagreement, not UNCOMPARABLE
  expect(Signability.d33(all).state).toBe("UNSIGNABLE")
  expect(Signability.d33(all).detail).toMatch(/DISAGREE/i)
})

test("S101 — RP-2: UNCOMPARABLE is a distinct third value ('could not compare' ≠ 'disagree'); a seeded un-alignable PBO computes UNCOMPARABLE, not agrees:false", () => {
  const seeded = { ...(rec.crossCheck as Rigor.CrossCheck), cscvAlignment: { ...(rec.crossCheck.cscvAlignment), comparable: false } }
  const pbo = CrossCheck.agreement("pbo", seeded)
  expect(pbo.agrees).toBe("UNCOMPARABLE")
  expect(pbo.comparable).toBe(false)
  // with DSR+PSR agreeing and PBO uncomparable → PARTIAL (never SIGNABLE), never UNSIGNABLE (there is no disagreement)
  const d = Signability.d33(CrossCheck.all(seeded))
  expect(d.state).toMatch(/PRECONDITION-MET-FOR/)
  expect(d.disagreed).toEqual([])
})

test("S101 — RP-1: a SEEDED D33-as-SIGNABLE on a PARTIAL agreement is impossible — the DSR-only V35 defect cannot recur", () => {
  // reproduce V35: only DSR checked, PSR/PBO uncomparable → the state can NEVER be SIGNABLE (X-DERIVE(e))
  const dsrOnly = { ...(rec.crossCheck as Rigor.CrossCheck), cscvAlignment: { ...rec.crossCheck.cscvAlignment, comparable: false } }
  const agreements = [CrossCheck.agreement("dsr", dsrOnly), { ...CrossCheck.agreement("psr", dsrOnly), agrees: "UNCOMPARABLE" as const, comparable: false }, CrossCheck.agreement("pbo", dsrOnly)]
  const d = Signability.d33(agreements)
  expect(d.state).not.toBe("SIGNABLE") // the exact claim V35 typed over a ⅓ cross-check
  expect(d.state).toMatch(/PRECONDITION-MET-FOR-DSR-ONLY/)
})

test("S101 — DD-18: the dataset is tiered SAMPLE (synthetic true-Sharpe-0 noise) and PBO's meaning on it is stated (a fixture value, not a real-strategy finding)", () => {
  const ds = rec.crossCheck.dataset
  expect(ds.tier).toBe("SAMPLE")
  expect(ds.trueSharpe).toBe(0)
  expect(ds.note).toMatch(/fixture/i)
  // the RP-2 alignment is recorded so the wall can SHOW it
  expect(rec.crossCheck.cscvAlignment.S).toBe(8)
  expect(rec.crossCheck.cscvAlignment.comparable).toBe(true)
})

test("S101 — the cross-check deps are walled OUT of the frozen runtime: not one FROZEN .py imports purgedcv (only the harness does); the mass path stays hono+zod", () => {
  // the FROZEN math is pure numpy/scipy — a frozen .py importing the oracle would be the reimplementation RP-2 forbids
  const rigorPy = readFileSync(path.join(PKG_ROOT, "src", "backtest", "py", "rigor.py"), "utf8")
  expect(rigorPy).not.toMatch(/import purgedcv|from purgedcv/)
  // purgedcv lives ONLY in requirements-crosscheck.txt (the sidecar oracle), NEVER requirements-studio.txt (the mass sidecar set)
  const studioReqs = readFileSync(path.join(PKG_ROOT, "src", "backtest", "py", "requirements-studio.txt"), "utf8")
  expect(studioReqs).not.toMatch(/purgedcv/)
  const crossReqs = readFileSync(path.join(PKG_ROOT, "src", "backtest", "py", "requirements-crosscheck.txt"), "utf8")
  expect(crossReqs).toMatch(/purgedcv/)
  // the mass path (node deps) stays exactly hono + zod, zero transitive (SBOM-proven elsewhere)
  const pkg = JSON.parse(readFileSync(path.join(PKG_ROOT, "package.json"), "utf8"))
  expect(Object.keys(pkg.dependencies ?? {}).sort()).toEqual(["hono", "zod"])
})

test("S101 — not one .py byte moved: checkFrozenSet reports 0 DRIFT (S101 extends the SIDECAR harness crosscheck.py, edits no frozen byte)", () => {
  const fs = checkFrozenSet()
  expect(fs.filter((c) => c.status === "drift").length).toBe(0)
})
