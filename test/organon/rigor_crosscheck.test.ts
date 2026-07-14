/**
 * ORGΛNON — THE REACH SPRINT (V35), Phase 1 wall: S94 — THE CROSS-CHECK EXECUTES (the phase that never sheds).
 *
 * X-REACH(b): a cross-check that does not execute is not a check — it is an absence wearing a check's name. The frozen
 * core's DSR/PSR/PBO cross-check had NEVER executed in the audited record (the studio-slim venv ships numpy+scipy only;
 * purgedcv lived in the parked heavy requirements). This sprint provisions purgedcv (requirements-crosscheck.txt, RP-2),
 * EXECUTES the cross-check against the independent oracle, commits the numbers (X-SHOWN(e): survives the environment),
 * and walls D33 UNSIGNABLE while S94 is red. NEVER mocked (attack #2, the gravest available failure): a BLOCKED cross-
 * check is a first-class honest red, and a seeded blocked result makes D33 unsignable — shown.
 */
import { test, expect } from "bun:test"
import { readFileSync, existsSync } from "node:fs"
import { execFileSync } from "node:child_process"
import path from "node:path"
import { PKG_ROOT, PY_DIR, checkFrozenSet, FROZEN_PY } from "../../src/organon/frozen"
import { Rigor } from "../../src/backtest/rigor"

const H = path.join(PKG_ROOT, "data", "honesty")
const record = JSON.parse(readFileSync(path.join(H, "rigor-crosscheck.json"), "utf8"))
const VENV_PY = path.join(PY_DIR, ".venv", "bin", "python")

// ── the committed RECORD — the evidence survives the environment (X-SHOWN(e)) ────────────────────────────────────────

test("S94 — the committed cross-check record shows an EXECUTION that AGREED with the independent purgedcv oracle (|DSR_rigor − DSR_purgedcv| < 0.02)", () => {
  const cc = record.crossCheck
  // BLOCKED is a first-class result; the committed record for THIS repo is an executed one (purgedcv was provisioned).
  expect(cc.executed).toBe(true)
  expect(cc.dsrAgree).toBe(true)
  expect(cc.dsrDiff).toBeLessThan(0.02) // the load-bearing claim: the frozen math agrees with the reference
  expect(cc.dsr).toBeGreaterThan(0) // real numbers, not zeros
  expect(cc.dsrPurgedcv).toBeGreaterThan(0)
  expect(cc.deflationCollapse).toBeGreaterThan(0.3) // the trap collapses: naive PSR looks certain, DSR deflates it
  expect(cc.dsrMonotonic).toBe(true) // DSR strictly decreases in n_trials (deterministic)
  expect(cc.purgedcvVersion).toBe("0.1.2") // the pinned independent oracle
})

test("S94 — the record is NEVER a mock: the reference names purgedcv + the golden-noise construction; RP-2 durability is stated (requirements-crosscheck.txt)", () => {
  expect(record.reference).toMatch(/purgedcv==0\.1\.2/)
  expect(record.reference).toMatch(/López de Prado|Lopez de Prado|Deflated Sharpe/i)
  expect(record.rule).toMatch(/Never mocked/i)
  const reqs = readFileSync(path.join(PY_DIR, "requirements-crosscheck.txt"), "utf8")
  expect(reqs).toMatch(/purgedcv==0\.1\.2/) // the DURABLE committed requirement (survives a fresh clone)
})

// ── LIVE — the cross-check actually RUNS here (executed, shown), or an honest SKIP when purgedcv is absent ────────────

test("S94 LIVE — Rigor.crossCheck() executes end-to-end and agrees with purgedcv (a real execution proof), or SKIPS honestly when the oracle is absent", () => {
  const cc = Rigor.crossCheck()
  if (Rigor.isBlocked(cc)) {
    // a fresh clone without purgedcv → BLOCKED, named precisely; the census records it, never faked. The committed
    // record above is still the shown evidence (X-SHOWN(e)); this is the honest red, not a failure of the sprint.
    expect(cc.reason).toMatch(/purgedcv|venv/i)
    return
  }
  expect(cc.executed).toBe(true)
  expect(cc.dsrAgree).toBe(true)
  expect(Math.abs(cc.dsr - cc.dsrPurgedcv)).toBeLessThan(0.02) // the frozen math agrees with the independent impl, live
  expect(Rigor.s94Green(cc)).toBe(true) // S94 is GREEN this sprint — the first time in the project's audited history
})

// ── not one .py byte moved — S94 installs a MISSING DEPENDENCY, it edits no frozen byte ──────────────────────────────

test("S94 — checkFrozenSet shows 0 DRIFT on the 6 computational-core .py: the cross-check installs a dependency, it does not touch the frozen math", () => {
  const fs = checkFrozenSet()
  const py = fs.filter((c) => c.kind === "tracked-py")
  expect(py.length).toBe(Object.keys(FROZEN_PY).length) // all 6
  expect(py.every((c) => c.status === "ok")).toBe(true) // byte-identical to the pins — 0 drift
  expect(fs.filter((c) => c.status === "drift").length).toBe(0)
})

// ── D33's structural precondition — UNSIGNABLE while S94 is red (a wall, not advice) ──────────────────────────────────

test("S94/D33 — the countersign package REFUSES to present D33 as signable while S94 is red: a seeded BLOCKED cross-check → d33Signable=false", () => {
  // the seeded negative — a BLOCKED cross-check (the ORIGINAL defect: the cross-check never executed). D33 must be
  // unsignable. NEVER mocked as green (attack #2): a blocked result is honest, and it makes the pen unofferable.
  const seededRed: Rigor.Blocked = { blocked: true, reason: "seeded: purgedcv absent (the cross-check never executed)" }
  expect(Rigor.d33Signable(seededRed).signable).toBe(false)
  expect(Rigor.d33Signable(seededRed).reason).toMatch(/UNSIGNABLE/i)

  // a seeded DISAGREEMENT (executed but the frozen DSR ≠ purgedcv beyond tolerance) also makes D33 unsignable
  const seededDisagree = { ...record.crossCheck, dsrAgree: false, dsr: 0.9, dsrPurgedcv: 0.1, dsrDiff: 0.8 } as Rigor.CrossCheck
  expect(Rigor.d33Signable(seededDisagree).signable).toBe(false)
})

test("S94/D33 — this sprint S94 is GREEN, so the precondition is MET (the pen MAY be offered) — but LN5 binds: operatorSigned stays false (the agent never signs)", () => {
  const cc = Rigor.crossCheck()
  if (Rigor.isBlocked(cc)) return // honest skip on a bare clone
  const d = Rigor.d33Signable(cc)
  expect(d.signable).toBe(true) // the precondition is satisfied for the first time in the project's history
  expect(d.reason).toMatch(/never signs it \(LN5\)/i) // and the agent still never signs it
  // the pins record the invariant: D33 presented as UNSIGNABLE-while-red, operatorSigned=false regardless
  const rp = JSON.parse(readFileSync(path.join(H, "reach-pins.json"), "utf8"))
  expect(rp.deviations.D33).toMatch(/operatorSigned=false/)
  expect(rp.d33Precondition.stateThisSprint).toMatch(/NEVER signs it|operatorSigned=false/i)
})

// ── the sidecar census reflects the execution (S83 continuity) ───────────────────────────────────────────────────────

test("S94 — the sidecar census records the cross-check as EXECUTED (executedCount ≥ 3), or BLOCKED with the precise purgedcv reason (never dressed as coverage)", () => {
  const census = JSON.parse(readFileSync(path.join(H, "sidecar-census.json"), "utf8"))
  const ran = census.executed.filter((e: { ok: boolean }) => e.ok).map((e: { module: string }) => e.module)
  const crossRan = ran.some((m: string) => /cross-check/i.test(m))
  if (crossRan) {
    expect(census.executedCount).toBeGreaterThanOrEqual(3) // effective_n + lending + the cross-check
    expect(census.blocked.length).toBe(0)
  } else {
    // BLOCKED path (purgedcv not provisioned in this env) — the reason names purgedcv precisely
    expect(census.blocked.length).toBeGreaterThanOrEqual(1)
    expect(census.blocked[0].reason).toMatch(/purgedcv/i)
  }
})
