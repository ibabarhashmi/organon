/**
 * ORGΛNON — THE PROBE SPRINT, Phase 2 walls (S52 — telemetry integrity + feedback; X-TELEMETRY, positive-controlled).
 * OFF by default (no capture without the env + the accepted disclosure); the captured field set === the pinned manifest
 * EXACTLY (an extra field fails the strict schema — the manifest-drift guard); every event scrubbed (a seeded secret /
 * address dropped); double-consent to SHARE; export scrubbed; telemetry + feedback are VERDICT-PATH-FORBIDDEN consumers
 * (they import no scored module). The store is gitignored; these tests purge what they write.
 */
import { test, expect, afterAll } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Telemetry } from "../../src/telemetry/telemetry"
import { Feedback } from "../../src/telemetry/feedback"
import { TelemetryManifest } from "../../src/telemetry/manifest"

const EV = { at: 1783468800000, screen: "reality", intent: "COMPARE", verdictWord: "UNVERIFIED", latencyMs: 42, degradeEvent: false, door: ":4444", sampleRatio: 0.7 }
const ON = { ORGANON_TELEMETRY: "1", ORGANON_TELEMETRY_CONSENT: "accepted" } as Record<string, string>
afterAll(() => { Telemetry.purge(); Feedback.purge() })

test("S52 — telemetry is OFF by default: no env → no capture; env without the accepted disclosure → no capture", () => {
  expect(Telemetry.capture(EV, {}).captured).toBe(false)
  expect(Telemetry.capture(EV, { ORGANON_TELEMETRY: "1" }).captured).toBe(false) // flag alone is not enough
  expect(Telemetry.isEnabled({})).toBe(false)
  expect(Telemetry.isEnabled(ON)).toBe(true)
})

test("S52 — the captured field set === the pinned manifest, EXACTLY (an unlisted field fails the strict schema)", () => {
  const schemaKeys = Object.keys(TelemetryManifest.EventSchema.shape).sort()
  expect(schemaKeys).toEqual([...TelemetryManifest.CAPTURED].sort())
  // a captured event with an extra field (a typed pool address) is REJECTED — no covert capture
  const drift = { ...EV, poolAddress: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef" }
  expect(Telemetry.capture(drift, ON).captured).toBe(false)
  // and the pins manifest matches the schema (the pinned contract === the code)
  const pins = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "probe-pins.json"), "utf8"))
  expect([...pins.captureManifest.captured].sort()).toEqual(schemaKeys)
})

test("S52 — every event field is SCRUBBED: a seeded key + address in the feedback free-text are dropped (positive control)", () => {
  Feedback.purge()
  const seeded = { GEMINI_API_KEY: "AIzaSyD-SEEDED-1234567890abcdefghij" } as Record<string, string>
  Feedback.submit({ at: 1, screen: "reality", useful: true, trusted: false, missing: "the key AIzaSyD-SEEDED-1234567890abcdefghij and pool 0xAbc0000000000000000000000000000000000001 were shown" }, seeded)
  const stored = JSON.stringify(Feedback.show(seeded))
  expect(stored).not.toContain("AIzaSyD-SEEDED")
  expect(stored).not.toMatch(/0xAbc00000000000/)
  expect(stored).toMatch(/<redacted:GEMINI_API_KEY>/)
  expect(stored).toMatch(/<address>/)
})

test("S52 — SHARE requires a SECOND explicit consent; a single consent egresses nothing; the shared payload IS the scrubbed local one", () => {
  Telemetry.purge()
  Telemetry.capture(EV, ON)
  expect(Telemetry.share(ON).shared).toBe(false) // one consent → nothing leaves
  const r = Telemetry.share({ ...ON, ORGANON_TELEMETRY_SHARE: "1" })
  expect(r.shared).toBe(true)
  expect(r.payload).toEqual(Telemetry.exportEvents(ON)) // the shared payload === the scrubbed local export, nothing more
})

test("S52 — telemetry + feedback are VERDICT-PATH-FORBIDDEN consumers: they import NO scored module (the probe weakens no wall)", () => {
  const forbidden = /from\s+["'].*(analytics\/scorecard|studio\/stamp|studio\/decay|studio\/icir|studio\/mintrl|studio\/lineage|ask\/gates)["']/
  for (const rel of ["src/telemetry/telemetry.ts", "src/telemetry/store.ts", "src/telemetry/feedback.ts", "src/telemetry/manifest.ts"]) {
    const src = readFileSync(path.join(PKG_ROOT, rel), "utf8")
    expect(src, `${rel} imports a verdict-path module`).not.toMatch(forbidden)
  }
  // the pins pin the forbidden extension
  const pins = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "probe-pins.json"), "utf8"))
  expect(pins.verdictPathForbidden.extension).toMatch(/telemetry \+ feedback are VERDICT-PATH-FORBIDDEN/i)
})

test("S52 — the disclosure names EXACTLY what is captured and what is NEVER captured (manifested, verbatim)", () => {
  for (const f of TelemetryManifest.CAPTURED) expect(TelemetryManifest.DISCLOSURE).toContain(f)
  expect(TelemetryManifest.DISCLOSURE).toMatch(/OFF by default/i)
  expect(TelemetryManifest.DISCLOSURE).toMatch(/NEVER captured/i)
})
