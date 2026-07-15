/**
 * ORGΛNON — THE VARIANT SPRINT (V41), Phase 4 wall (S164): THE RIDER, EXERCISED IN A DARK DRY-RUN. NO NEW LAW (sheds second).
 *
 * W-VR04 — L-4 / RP-5: V40 proved the enforcement bites by SEEDED NEGATIVE only; it never ran against a live Stamp (D63 off,
 * no real lineage). This runs the WHOLE enforcement path against a REAL autocorrelated series (the clone-stable AR(1) demo,
 * τ_int ≈ 36, √τ ≈ 6), computes the naive + Newey–West-corrected statistics and the enforcement decision IF the meter were
 * lit — and renders NOTHING LIT (D63 off; a lit render FAILS). RP-5: the output is a TEST ARTIFACT
 * (data/honesty/rider-dryrun.json), NEVER wired to a render surface. checkFrozenSet 0 drift.
 */
import { test, expect } from "bun:test"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT, checkFrozenSet } from "../../src/organon/frozen"
import { Rider } from "../../src/backtest/rider"

test("S164 (W-VR04) — the enforcement RUNS on a REAL autocorrelated series (not a fixture): τ_int above the trigger, the correction computed", () => {
  const d = Rider.darkDryRun()
  expect(d.n).toBeGreaterThan(50)
  expect(d.tauInt).toBeGreaterThan(Rider.threshold().tauIntTrigger) // a REAL autocorrelated series (√τ ≈ 6)
  expect(d.triggered).toBe(true)
  expect(Number.isFinite(d.naive)).toBe(true)
  expect(Number.isFinite(d.corrected)).toBe(true)
  expect(Math.abs(d.naive)).toBeGreaterThan(Math.abs(d.corrected)) // the correction DEFLATES the naive t-stat
})

test("S164 (W-VR04) — the enforcement decision is COMPUTED (a naive render WOULD be refused if lit)", () => {
  const d = Rider.darkDryRun()
  expect(d.enforcementIfLit.ok).toBe(false) // deflation-active + triggered + naive → REFUSED
  expect(d.enforcementIfLit.required).toBe("corrected")
})

test("S164 (W-VR04) — NOTHING is rendered LIT (D63 off, familyN === 1): renderedLit and deflationActiveOnLivePath are false (a lit render FAILS)", () => {
  const d = Rider.darkDryRun()
  expect(d.renderedLit).toBe(false)
  expect(d.deflationActiveOnLivePath).toBe(false)
})

test("S164 (W-VR04) — RP-5: the output is a TEST ARTIFACT, never a render surface (no drawer/door code imports the dry-run)", () => {
  // the artifact exists and carries the dark computation
  const p = path.join(PKG_ROOT, "data", "honesty", "rider-dryrun.json")
  expect(existsSync(p)).toBe(true)
  const art = JSON.parse(readFileSync(p, "utf8"))
  expect(art.renderedLit).toBe(false)
  expect(art.rule).toMatch(/TEST (ARTIFACT|FIXTURE)|never a render surface|NEVER wired/i)
  // GREP the render surfaces (reality.ts, the drawer, the door, ask compose) — none reads the dry-run artifact or darkDryRun
  const renderFiles: string[] = []
  for (const dir of [path.join(PKG_ROOT, "src", "studio"), path.join(PKG_ROOT, "src", "ask")]) {
    if (!existsSync(dir)) continue
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".ts"))) renderFiles.push(path.join(dir, f))
  }
  for (const f of renderFiles) {
    const code = readFileSync(f, "utf8")
    expect(code).not.toMatch(/rider-dryrun|darkDryRun/) // no render surface reads the dark computation (RP-5)
  }
})

test("S164 (W-VR04) — the frozen core is READ, never touched: checkFrozenSet 0 drift (the Newey–West correction is composed in the harness)", () => {
  expect(checkFrozenSet().filter((c) => c.status === "drift").length).toBe(0)
})
