/**
 * ORGΛNON — THE CONTRACT-TRUTH SPRINT, Phase 1 walls (FINDINGS-CLOSED, P1–P6). The six Persistence continuity findings are
 * closed as documentation + ledger before the extraction, so the record is clean: P1 the header count reconciled (the
 * AUTHORITATIVE count is battery-summary.json, not prose; carry the measured 625/1-skip/0 forward, state the delta); P2
 * the terminal PINS_SHA rule (every final RED-TEAM-CLEAN marker states its terminal PINS_SHA); P3 the surviving skip named
 * (ask_live.test.ts); P4 the W-P02 two-fence separation (the cleanGo DEPTH hurdle vs the POST-HOC pre-registration fence,
 * orthogonal, never conflated — rendered in stamp.ts); P5 the live-value character (aave half-life≈9.9/ICIR≈0.6 are
 * current-capture, re-capturable, NOT committed goldens — the X-LIVE ceiling); P6 the LUMPY-hurdle firing status (ARMED +
 * demonstrated on a constructed record, not yet fired on a real scored strategy — the one real GO, aave, is CONSISTENT).
 * No engine change moves a verdict (the P4 stamp reason is wording only; the frozen seven stay git-clean).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Evidence } from "../../src/studio/evidence"

const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")
const H = path.join(PKG_ROOT, "data", "honesty")
const ct = JSON.parse(readFileSync(path.join(H, "contract-pins.json"), "utf8"))
const byId = (id: string) => ct.persistenceResolutions.find((p: { id: string }) => p.id === id)

test("P1 — the header count is reconciled: the AUTHORITATIVE count is battery-summary.json (not prose), the historic drift named, 625 carried", () => {
  const p1 = byId("P1")
  expect(p1.resolution).toMatch(/battery-summary\.json/) // the single source of truth is the evidence artifact, not prose
  expect(p1.resolution).toMatch(/625/) // the measured Persistence count carried forward
  expect(p1.resolution).toMatch(/585.*583|583.*585|doc/i) // the historic 585-vs-583 drift is NAMED, not silent
  // PINS.md renders the reconciliation for a reader (the authoritative-count statement, clone-robust)
  const pins = read("PINS.md")
  expect(pins).toMatch(/battery-summary\.json/)
  expect(pins).toMatch(/625 pass \/ 1 skip \/ 0 fail/)
})

test("P2 — the terminal PINS_SHA rule is a STANDING RULE + this sprint's Phase-0 marker states its terminal PINS_SHA", () => {
  const p2 = byId("P2")
  expect(p2.resolution).toMatch(/terminal PINS_SHA/) // the rule is stated
  expect(p2.resolution).toMatch(/EVERY final RED-TEAM-CLEAN marker/i)
  expect(p2.resolution).toMatch(/f157da69/) // Persistence's terminal PINS_SHA retroactively noted
  // the fresh BUILDLOG's Phase-0 marker CARRIES a terminal PINS_SHA (the rule, practiced this sprint)
  const log = read("sprint/sprint-result/BUILDLOG-CONTRACT.md")
  expect(log).toMatch(/SESSION MARKER — Phase 0 PINS-LOCKED complete\. Terminal `PINS_SHA cf620520/)
})

test("P3 — the surviving skip is NAMED (ask_live.test.ts) wherever the battery count is cited", () => {
  const p3 = byId("P3")
  expect(p3.resolution).toMatch(/ask_live\.test\.ts/) // named exactly
  expect(p3.resolution).toMatch(/Groq|live/i) // what it is (the Operator-gated live round-trip)
  expect(p3.resolution).toMatch(/skipped offline|forces AI keys empty|hermetic/i) // why it skips
  // the file exists (a named skip that doesn't exist would be a phantom)
  expect(read("test/organon/ask_live.test.ts").length).toBeGreaterThan(0)
})

test("P4 — the Stamp reason SEPARATES the two orthogonal fences (the cleanGo DEPTH hurdle vs the POST-HOC pre-registration fence)", () => {
  const stamp = read("src/studio/stamp.ts")
  // the POST-HOC fence names itself as a pre-registration fence, ORTHOGONAL to the depth hurdles (no 'clean GO' overlap)
  expect(stamp).toMatch(/pre-registration fence, ORTHOGONAL to the depth hurdles/)
  expect(stamp).toMatch(/POST-HOC/)
  // the DEPTH hurdle is the cleanGo flag (a traceable half-life AND steady consistency) — the distinct 'clean GO' hurdle
  expect(stamp).toMatch(/depth hurdles for a clean GO/i)
  expect(stamp).toMatch(/A clean GO also needs/i)
  // the record states the separation
  const p4 = byId("P4")
  expect(p4.resolution).toMatch(/orthogonal/i)
  expect(p4.resolution).toMatch(/post-hoc/i)
  expect(p4.resolution).toMatch(/pre-registration/i)
  expect(p4.resolution).toMatch(/never conflated/i)
})

test("P5 — the live-value character is noted: the rendered aave half-life/ICIR are current-capture, re-capturable, NOT committed goldens (X-LIVE)", () => {
  const p5 = byId("P5")
  expect(p5.resolution).toMatch(/current-capture/i)
  expect(p5.resolution).toMatch(/re-capturable/i)
  expect(p5.resolution).toMatch(/NOT committed goldens|not.*frozen/i)
  expect(p5.resolution).toMatch(/9\.9/) // the illustrative half-life value
  // PINS.md carries the X-LIVE ceiling (published, clone-robust)
  const pins = read("PINS.md")
  expect(pins).toMatch(/live-value ceiling/i)
  expect(pins).toMatch(/re-capturable, not frozen/i)
})

test("P6 — the LUMPY-hurdle firing status is stated honestly: ARMED + demonstrated, not yet fired on a real scored strategy", () => {
  const p6 = byId("P6")
  expect(p6.resolution).toMatch(/ARMED/)
  expect(p6.resolution).toMatch(/demonstrated|constructed positive-control/i) // shown on a constructed record
  expect(p6.resolution).toMatch(/NOT fired on a real|not.*fired/i) // honest: not yet triggered on real data
  expect(p6.resolution).toMatch(/CONSISTENT/) // the one real GO (aave) is CONSISTENT
})

test("FINDINGS-CLOSED — no engine change moves a verdict: the P4 stamp reason is wording only; the frozen seven stay git-clean", () => {
  expect(Evidence.frozenGitStatus().clean).toBe(true) // the 6 .py + loop.ts byte-untouched after the P4 wording edit
})
