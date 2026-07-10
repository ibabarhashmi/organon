/**
 * ORGΛNON — THE BUILD-PROVENANCE SPRINT, Phase 1 walls (FINDINGS-CLOSED, V1–V4). The four Contract-Truth RECORD findings
 * are closed as documentation + ledger before the pipeline, so the continuity record is clean:
 *   V1 — the delta-itemization standing rule (every battery-count change itemized (+N <file>) at its gate).
 *   V2 — the referenced-log chain corrected: Crown-Jewel is 583/0 across 97 files (the '585' drift dropped), and the
 *        Deepening sprint (511/0) has no standalone file — its record lives inside BUILDLOG-HONESTY.md (the blank filled).
 *   V3 — the dormant→exercised header + the honest REAL-coverage count are foregrounded.
 *   V4 — the deep axis is a SIX-tool subset (four parked in D9) — no future sprint inherits an overstated '~10 tools'.
 * No engine change moves a verdict (documentation only; the frozen seven stay git-clean).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Evidence } from "../../src/studio/evidence"

const read = (rel: string) => readFileSync(path.join(PKG_ROOT, rel), "utf8")
// AB7/DISC-1 (D22): the sprint BUILDLOGs were never committed — on a pristine clone the resolver returns null after
// asserting the absence is RECORDED (alpha-audit DISC-1); the content assertions apply wherever the log exists.
import { continuityLog } from "./fixtures/continuity"
const H = path.join(PKG_ROOT, "data", "honesty")
const vf = JSON.parse(readFileSync(path.join(H, "verify-pins.json"), "utf8"))
const byId = (id: string) => vf.contractTruthResolutions.find((v: { id: string }) => v.id === id)
const CURRENT_LOGS = ["sprint/sprint-result/BUILDLOG-VERIFY.md", "sprint/sprint-result/BUILDLOG-CONTRACT.md", "sprint/sprint-result/BUILDLOG-PERSISTENCE.md"]

test("V1 — the delta-itemization standing rule is documented + this sprint's Phase-0 marker itemizes its battery delta", () => {
  expect(byId("V1").resolution).toMatch(/\(\+N/) // the (+N <file>) rule
  expect(byId("V1").resolution).toMatch(/every battery-count change|EVERY battery-count/i)
  expect(byId("V1").resolution).toMatch(/\+7 contract_redteam/) // the retro-annotated Contract-Truth delta
  // the fresh BUILDLOG's Phase-0 marker carries a (+N …) delta
  const log = continuityLog("sprint/sprint-result/BUILDLOG-VERIFY.md")
  if (log !== null) expect(log).toMatch(/delta `\+8 honesty_pins`/)
  // PINS.md documents the rule
  expect(read("PINS.md")).toMatch(/itemized `\(\+N <file>\)`|itemized `\(\+N file\)`/)
})

test("V2 — the referenced-log chain is corrected: Crown-Jewel 583/0 + the Deepening record in BUILDLOG-HONESTY.md (no blank, no 585-claim)", () => {
  // the pin resolution states the correction
  expect(byId("V2").resolution).toMatch(/583\/0 across 97 files/)
  expect(byId("V2").resolution).toMatch(/BUILDLOG-HONESTY\.md/)
  expect(byId("V2").resolution).toMatch(/never a fabricated BUILDLOG-DEEPENING/i)
  // every CURRENT log's reference chain names Crown-Jewel 583/0 + the Deepening record's real home, with no blank filename
  for (const rel of CURRENT_LOGS) {
    const src = continuityLog(rel)
    if (src === null) continue
    expect(src, `${rel} names Crown-Jewel 583/0`).toMatch(/583\/0 across 97 files/)
    expect(src, `${rel} names the Deepening record's home`).toMatch(/Deepening.*BUILDLOG-HONESTY\.md|within `BUILDLOG-HONESTY\.md`/)
    expect(src, `${rel} has no blank Deepening filename`).not.toMatch(/`BUILDLOG-` \(Deepening/)
    expect(src, `${rel} no undisclaimed 585 for Crown-Jewel`).not.toMatch(/Crown-Jewel sprint \(585\/0|Ask console, 585\/0/)
  }
})

test("V3 — the dormant→exercised status + the honest REAL-coverage rule are foregrounded", () => {
  const log = continuityLog("sprint/sprint-result/BUILDLOG-VERIFY.md")
  if (log !== null) {
    expect(log).toMatch(/capability-complete but DORMANT/i)
    expect(log).toMatch(/EXERCISES it on real builds|first genuine .* tiers on the live shelf/i)
    expect(log).toMatch(/N of M pools|REAL-coverage count/i)
  }
  expect(byId("V3").resolution).toMatch(/DORMANT/)
  expect(byId("V3").resolution).toMatch(/never implying more/i)
  // the coverage-honesty rule + ceiling are pinned
  expect(vf.coverageHonesty.rule).toMatch(/N of M/)
  expect(vf.coverageHonesty.ceiling).toMatch(/not a full audit/i)
})

test("V4 — the six-tool-subset continuity note is recorded (four parked in D9; no '~10 tools' baseline inherited)", () => {
  expect(byId("V4").resolution).toMatch(/SIX-tool subset/i)
  for (const t of ["auth-surface", "call-graph", "upgrade-check", "storage-layout", "value-flow", "state-flow"]) expect(byId("V4").resolution).toContain(t)
  expect(byId("V4").resolution).toMatch(/contract-info.*inheritance-resolver.*dimensional-analysis.*mutation-map/)
  expect(byId("V4").resolution).toMatch(/D9/)
  expect(byId("V4").resolution).toMatch(/no future sprint inherits|overstated/i)
  // PINS.md carries the six-tool-subset note
  expect(read("PINS.md")).toMatch(/six-tool subset/i)
})

test("FINDINGS-CLOSED — no engine change: the record findings are documentation only; the frozen seven stay git-clean", () => {
  expect(Evidence.frozenGitStatus().clean).toBe(true)
})
