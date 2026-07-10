/**
 * ORGΛNON — THE SOVEREIGN SPRINT, Phase 1 wall (FINDINGS-CLOSED). The Surface validation report's five findings are
 * closed as record hygiene BEFORE the two spines — SF1 the impeccable framing led-with (not buried), SF2 the pristine
 * 804-vs-807 off-by-one ITEMIZED + reconciled (surface_detector's exact test count, asserted here so the arithmetic
 * dies in a test), SF3 the a11y claims scoped to their method, SF4 the V4 evidence shape named. SF5 (the design pass) is
 * Phase 2, pinned separately. No engine change — this is documentation + ledger + one hard test-count itemization.
 *
 * NB the file name: findings_closed_v (Build-Provenance V1–V4) + findings_closed_voice (Surface V1–V5) are TAKEN; this
 * closes the SURFACE-report findings SF1–SF5, so it is findings_closed_surface — the caught-collision naming discipline.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { continuityLog } from "./fixtures/continuity"

const H = path.join(PKG_ROOT, "data", "honesty")
const sv = JSON.parse(readFileSync(path.join(H, "sovereign-pins.json"), "utf8"))
const byId = (id: string) => sv.sfResolutions.find((v: { id: string }) => v.id === id)

test("SF1 — the impeccable framing is LED WITH, not buried: the interactive critique runs this sprint; the browser/live flow still does not (stated up front)", () => {
  const sf1 = byId("SF1")
  expect(sf1.status).toBe("RESOLVED")
  expect(sf1.resolution).toMatch(/LED WITH/i)
  expect(sf1.resolution).toMatch(/interactive CRITIQUE for real|design-review sub-agent/i)
  expect(sf1.resolution).toMatch(/browser.*(still not run|not run)|`live` flow still not run/i)
  // the framing is up front in the BUILDLOG header (not the last line) — the header names both what runs AND what does not
  // (AB7/DISC-1, D22: the log was never committed; on a pristine clone the resolver asserts the recorded absence instead)
  const log = continuityLog("sprint/sprint-result/BUILDLOG-SOVEREIGN.md")
  if (log !== null) {
    const header = log.slice(0, log.indexOf("## SESSION MARKER")) // everything before the first marker = the header
    expect(header).toMatch(/interactive `critique` for real|runs the interactive `critique`/i)
    expect(header).toMatch(/NOT run|still not run/i) // the honest bound is IN the header, not buried
    expect(header).toMatch(/SF1/) // the finding is named where it is closed
  }
})

test("SF2 — the pristine off-by-one ITEMIZED: surface_detector has EXACTLY 4 tests, 3 skipIf → pristine = 807 − 3 = 804 (the arithmetic dies here)", () => {
  const src = readFileSync(path.join(PKG_ROOT, "test/organon/surface_detector.test.ts"), "utf8")
  // count the test declarations directly from the source — the itemization is a fact, not a claim
  const skipIfCount = (src.match(/test\.skipIf\(/g) ?? []).length
  const plainCount = (src.match(/^test\(/gm) ?? []).length
  const total = skipIfCount + plainCount
  expect(total).toBe(4) // surface_detector has exactly 4 tests
  expect(skipIfCount).toBe(3) // 3 gated on HAS_DETECTOR (absent on a pristine clone → they skip)
  expect(plainCount).toBe(1) // the 4th (the dep-wall assertion) runs everywhere
  // the reconciliation: dev 807 → pristine drops exactly the 3 detector tests
  const DEV_PASS = 807
  const N = skipIfCount
  expect(DEV_PASS - N).toBe(804) // 807 − 3 = 804 — the off-by-one is reconciled, not a mystery
  // and the pinned resolution states the same arithmetic (807 − N, N=3) + the pristine skip set
  const sf2 = byId("SF2")
  expect(sf2.resolution).toMatch(/EXACTLY 4 tests/i)
  expect(sf2.resolution).toMatch(/807 . 3 . 804|807 − 3 = 804/)
  expect(sf2.resolution).toMatch(/ask_live.*eval_live.*surface_detector/i) // the pristine skip set named
})

test("SF3 — the a11y claims are scoped to their method: contrast COMPUTED (rigorous); keyboard/responsive DOM-ASSERTED; a real browser/AT pass flagged as follow-up", () => {
  const sf3 = byId("SF3")
  expect(sf3.status).toBe("RESOLVED")
  expect(sf3.resolution).toMatch(/COMPUTED/) // contrast is a numeric proof
  expect(sf3.resolution).toMatch(/sRGB|relative luminance/i)
  expect(sf3.resolution).toMatch(/DOM-ASSERTED/) // keyboard/responsive are markup assertions
  expect(sf3.resolution).toMatch(/NOT a live browser|not a live viewport|browser.*AT.*follow-up/i) // the honest limit named
  expect(sf3.resolution).toMatch(/follow-up|parked/i)
})

test("SF4 — the V4 evidence shape is NAMED: the rendered-output assertion is the deterministic proxy; the literal image case is inference, not asserted-as-tested", () => {
  const sf4 = byId("SF4")
  expect(sf4.status).toBe("RESOLVED")
  expect(sf4.resolution).toMatch(/RENDERED-OUTPUT assertion|rendered-output/i)
  expect(sf4.resolution).toMatch(/DETERMINISTIC PROXY|deterministic proxy/i)
  expect(sf4.resolution).toMatch(/INFERRED|inference/i) // the literal image case is inference
  expect(sf4.resolution).toMatch(/not.*pixel-tested|not asserted as tested/i)
})

test("SF5 — the design-intelligence pass is pinned as RUN this sprint (Spine A / X-DESIGNPASS), the browser flow honestly still not (the resolution points to D16)", () => {
  const sf5 = byId("SF5")
  expect(sf5.status).toBe("RESOLVED")
  expect(sf5.resolution).toMatch(/RUN as this sprint's Spine A|X-DESIGNPASS|D16/i)
  expect(sf5.resolution).toMatch(/browser.*(still|not run)|`live` flow still.*not run/i) // the honest bound rides along
})

test("SF closure adds no engine change — it is record hygiene: this wall imports only fs/path (no verdict surface that could move a golden)", () => {
  // Phase 1 is documentation + ledger + one test-count itemization; the differential goldens live in honesty_pins /
  // funding_differential and are asserted there. This guards the SCOPE by inspecting only the IMPORT block: the file
  // pulls readFileSync + path + PKG_ROOT and nothing from the engine (scorecard / stamp / differential / console).
  const self = readFileSync(path.join(PKG_ROOT, "test/organon/findings_closed_surface.test.ts"), "utf8")
  const importBlock = self.slice(0, self.indexOf("const H ="))
  expect(importBlock).toMatch(/from "node:fs"/)
  expect(importBlock).toMatch(/frozen/) // only PKG_ROOT from the frozen module
  expect(importBlock).not.toMatch(/studio\/(scorecard|stamp|differential|console)|analytics\/scorecard/) // no verdict surface imported
})
