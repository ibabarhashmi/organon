/**
 * ORGΛNON — THE PROBE SPRINT, Phase 0 wall (PINS-LOCKED). data/honesty/probe-pins.json carries: the X-TELEMETRY posture +
 * the pinned capture manifest, the feedback contract, the re-score honesty contract, the kill-criterion schema, the
 * verdict-path-forbidden extension (telemetry/feedback beside the 7 modules), the AF resolutions AF1-AF7, S52-S54,
 * D24/D25, the verdict-path hash set (=== live, unchanged), and the pinsSha (carried from Alpha 3b9f98bc).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const P = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "probe-pins.json"), "utf8"))
const PROBE_PINS_SHA_GOLDEN = "e6bed150ef680d414923df79c2f9835c732a5842644749b0df9a5a1db22f0c5e"

test("PINS — the pinsSha is hash-locked (sha256 of the pins body) and carries Alpha 3b9f98bc", () => {
  const { pinsSha, ...body } = P
  expect(createHash("sha256").update(JSON.stringify(body)).digest("hex")).toBe(pinsSha)
  expect(pinsSha).toBe(PROBE_PINS_SHA_GOLDEN)
  expect(P.carriedFromPinsSha).toBe("3b9f98bcba4307774326be132871798a6ff72b0a29d638e973bb65321ae9309b")
})

test("PINS — the X-TELEMETRY posture + the pinned capture manifest (captured + never-captured) are present + testable", () => {
  expect(P.telemetryPosture.offByDefault).toMatch(/OFF|ORGANON_TELEMETRY=1/)
  expect(P.telemetryPosture.doubleConsentToShare).toMatch(/ORGANON_TELEMETRY_SHARE=1|SECOND/)
  expect(P.captureManifest.captured).toEqual(["at", "screen", "intent", "verdictWord", "latencyMs", "degradeEvent", "door", "sampleRatio"])
  for (const never of ["keys/secrets", "strategy inputs", "typed pool addresses", "prompt text"]) expect(P.captureManifest.neverCaptured).toContain(never)
})

test("PINS — the feedback + re-score + kill-criterion contracts are pinned honestly", () => {
  expect(P.feedbackContract.posture).toMatch(/scrubbed|local-first/i)
  expect(P.rescoreHonestyContract.rule).toMatch(/REAL-and-content-hashed|labeled SAMPLE|zero new scoring/i)
  expect(P.rescoreHonestyContract.subjects).toEqual(["stream", "elixir", "resolv"])
  expect(P.killCriterionSchema.rule).toMatch(/pre-committed|BEFORE any invite|immutable/i)
})

test("PINS — the verdict-path-forbidden extension covers telemetry + feedback; the 7-module hash set === live (verdict path untouched)", () => {
  expect(P.verdictPathForbidden.extension).toMatch(/telemetry \+ feedback/i)
  for (const [rel, want] of Object.entries(P.verdictPathHashes as Record<string, string>)) {
    const live = createHash("sha256").update(readFileSync(path.join(PKG_ROOT, rel), "utf8")).digest("hex")
    expect(live, `${rel} moved`).toBe(want)
  }
})

test("PINS — AF1-AF7 resolutions + D24/D25 + S52-S54 are pinned", () => {
  for (const af of ["AF1", "AF2", "AF3", "AF4", "AF5", "AF6", "AF7", "LN1", "LN2"]) expect(P.afResolutions[af], `missing ${af}`).toBeTruthy()
  expect(P.afResolutions.AF1).toMatch(/OWED-OPERATOR-GATED|never simulated/i)
  expect(P.afResolutions.AF5).toMatch(/SOURCE repo's current branch|staging in organon/i)
  for (const s of ["S52", "S53", "S54"]) expect(P.stressCatalog[s], `missing ${s}`).toBeTruthy()
  expect(P.deviations.reserved.join(" ")).toMatch(/D24.*D25|D25/)
  expect(P.dualRepo.repos).toEqual(["ibabarhashmi/organon-studio", "ibabarhashmi/organon"])
})
