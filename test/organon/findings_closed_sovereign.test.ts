/**
 * ORGΛNON — THE INTERPRETER SPRINT, Phase 1 wall (FINDINGS-CLOSED). The Sovereign validation report's follow-ups are
 * closed as record hygiene BEFORE the voice work — SV1 the plane live-coverage stated in ONE honest line (FUNDING live ·
 * RPC single-probe · POOL-EVENTS built + fence-proven, NOT live), SV3 the funding-band surface clarified (a Stamp/facts
 * improvement, NOT shown moving a rendered verdict), SV4 the source-based-design-pass qualifier carried into continuity,
 * SV5 the browser/AT a11y pass named as the standing follow-up. SV2 (the HyperSync live capture) is Phase 4/5
 * (attempt-or-honest-gap), pinned but NOT claimed done here. No engine change — documentation + ledger.
 *
 * NB the file name: findings_closed_surface (Surface SF1–SF5) is TAKEN; this closes the SOVEREIGN-report findings
 * SV1–SV5, so it is findings_closed_sovereign — the caught-collision naming discipline continues.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { continuityLog } from "./fixtures/continuity"

const H = path.join(PKG_ROOT, "data", "honesty")
const iv = JSON.parse(readFileSync(path.join(H, "interpret-pins.json"), "utf8"))
const byId = (id: string) => iv.svResolutions.find((v: { id: string }) => v.id === id)

test("SV1 — the plane live-coverage is stated in ONE honest line (FUNDING live · RPC single-probe · POOL-EVENTS built+fence-proven, NOT live)", () => {
  const sv1 = byId("SV1")
  expect(sv1.status).toBe("RESOLVED")
  expect(sv1.resolution).toMatch(/FUNDING-HISTORY.*live/i)
  expect(sv1.resolution).toMatch(/RPC-STATE.*single/i)
  expect(sv1.resolution).toMatch(/POOL-EVENTS.*NOT live|NOT live-exercised/i) // no path inherits another's "live"
  // the one-line coverage is carried in the BUILDLOG header (SV1 stated, not scattered)
  const log = continuityLog("sprint/sprint-result/BUILDLOG-INTERPRET.md") // AB7/DISC-1 (D22): never committed; recorded absence on a clone
  if (log !== null) {
    const header = log.slice(0, log.indexOf("## Phase 0")) // everything before Phase 0 = the header
    expect(header).toMatch(/SV4|source review|browser.*NOT run/i) // the design-pass qualifier is up front (SV4)
  }
})

test("SV3 — the funding-band surface is clarified: a Stamp/facts improvement, NOT shown moving a rendered verdict (not over-read)", () => {
  const sv3 = byId("SV3")
  expect(sv3.status).toBe("RESOLVED")
  expect(sv3.resolution).toMatch(/Stamp\/facts|Stamp inputs/i)
  expect(sv3.resolution).toMatch(/NOT.*mov.*rendered.*verdict|not.*over-read|not claim.*moved/i)
})

test("SV4 — the source-based-design-pass qualifier is carried into continuity (SOURCE review, not a browser/visual/AT pass — never allowed to evaporate)", () => {
  const sv4 = byId("SV4")
  expect(sv4.status).toBe("RESOLVED")
  expect(sv4.resolution).toMatch(/SOURCE review/i)
  expect(sv4.resolution).toMatch(/not a.*screenshot|no browser automation|browser.*not run/i)
  // and it IS in the BUILDLOG header (carried up front, per the header's own SV4 line)
  const log = continuityLog("sprint/sprint-result/BUILDLOG-INTERPRET.md") // AB7/DISC-1 (D22)
  if (log !== null) {
    const header = log.slice(0, log.indexOf("## Phase 0"))
    expect(header).toMatch(/SOURCE review/i)
    expect(header).toMatch(/NOT run|not a rasterized screenshot/i)
  }
})

test("SV5 — the real browser/AT a11y pass is NAMED as the standing follow-up (contrast COMPUTED; keyboard/responsive DOM-ASSERTED)", () => {
  const sv5 = byId("SV5")
  expect(sv5.status).toBe("RESOLVED")
  expect(sv5.resolution).toMatch(/COMPUTED/)
  expect(sv5.resolution).toMatch(/DOM-ASSERTED/)
  expect(sv5.resolution).toMatch(/browser.*assistive-technology.*follow-up|NAMED.*follow-up/i)
  expect(sv5.resolution).toMatch(/not claimed as done|parked/i)
})

test("SV2 — POOL-EVENTS is NOT claimed done: it is an explicit attempt-or-honest-gap (Phase 4/5), never silently 'done'", () => {
  const sv2 = byId("SV2")
  expect(sv2.status).not.toBe("RESOLVED") // it must NOT read as closed/done in Phase 1
  expect(sv2.resolution).toMatch(/attempt-or-honest-gap|honest NAMED gap|never silently 'done'/i)
  expect(sv2.resolution).toMatch(/HYPERSYNC_TOKEN|token.*absent|provisioned/i)
})

test("SV closure adds no engine change — it is record hygiene: this wall imports only fs/path (no verdict surface that could move a golden)", () => {
  const self = readFileSync(path.join(PKG_ROOT, "test/organon/findings_closed_sovereign.test.ts"), "utf8")
  const importBlock = self.slice(0, self.indexOf("const H ="))
  expect(importBlock).toMatch(/from "node:fs"/)
  expect(importBlock).toMatch(/frozen/) // only PKG_ROOT from the frozen module
  expect(importBlock).not.toMatch(/studio\/(scorecard|stamp|differential|console)|analytics\/scorecard/) // no verdict surface imported
})
