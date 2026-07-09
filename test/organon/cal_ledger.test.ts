/**
 * ORGΛNON — THE VOICE SPRINT, Phase 4 walls (CAL-ARMED, X-CAL, S35). The record-only calibration clock:
 *   · append-only + HASH-CHAINED — the committed ledger verifies; a tampered entry breaks the chain (the control bites).
 *   · engine-derived — every committed entry's hash recomputes (self-consistent); the prediction never a model output.
 *   · NO BACKFILL — a statedAt before the prior entry is REFUSED (a backfilled prediction is a fabricated one).
 *   · NO SCORING — there is deliberately no Brier/score function; the only surface is the honest count at zero resolutions.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Cal } from "../../src/cal/ledger"

const committed = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "cal-ledger.json"), "utf8")) as Cal.Ledger

test("CAL — the committed ledger is append-only + hash-chained + verifies; every entry's hash recomputes (self-consistent)", () => {
  expect(committed.entries.length).toBeGreaterThanOrEqual(1)
  const v = Cal.verify(committed)
  expect(v.ok).toBe(true) // the committed chain is intact
  // each entry links to the prior (append-only) and its hash recomputes over the immutable prediction body (engine-derived)
  let prev = Cal.GENESIS
  for (const e of committed.entries) {
    expect(e.prevHash).toBe(prev)
    expect(Cal.computeEntryHash(e)).toBe(e.entryHash)
    expect(["decay-tier-persistence", "funding-regime-state"]).toContain(e.predictionType)
    expect(e.resolutionStub).toBeNull() // a STUB — no resolution exists yet
    expect(e.resolvedAt).toBeNull()
    prev = e.entryHash
  }
  expect(committed.headHash).toBe(prev)
})

test("CAL (S35) — a tampered entry BREAKS the chain (the control bites): an edited prediction is caught", () => {
  const tampered: Cal.Ledger = JSON.parse(JSON.stringify(committed))
  tampered.entries[0].prediction = tampered.entries[0].prediction + " (silently edited)"
  const v = Cal.verify(tampered)
  expect(v.ok).toBe(false)
  expect(v.brokenAt).toBe(0)
  expect(v.reason).toMatch(/tamper|recompute/i)
})

test("CAL (S35) — NO BACKFILL: append REFUSES an entry whose statedAt precedes the prior entry (a backfilled prediction is fabricated)", () => {
  let l = Cal.empty("2026-07-09")
  l = Cal.append(l, { subject: "x", predictionType: "decay-tier-persistence", prediction: "TRACEABLE persists", statedAt: 1000, horizon: "30d" })
  // a later statedAt is fine (append-only forward)
  l = Cal.append(l, { subject: "y", predictionType: "decay-tier-persistence", prediction: "TRACEABLE persists", statedAt: 2000, horizon: "30d" })
  // a BACKFILL (statedAt < the prior) is refused
  expect(() => Cal.append(l, { subject: "z", predictionType: "decay-tier-persistence", prediction: "TRACEABLE persists", statedAt: 500, horizon: "30d" })).toThrow(/BACKFILL REFUSED/)
  expect(l.entries).toHaveLength(2) // the refused entry never landed
  expect(Cal.verify(l).ok).toBe(true)
})

test("CAL — RECORD-ONLY: there is deliberately NO scoring function; the only surface is the honest count at zero resolutions", () => {
  // no Brier / score / grade function is exported (a displayed score on zero resolutions is a Halt — X-CAL)
  const api = Cal as unknown as Record<string, unknown>
  for (const forbidden of ["score", "brier", "brierScore", "grade", "accuracy", "calibrationScore"]) expect(api[forbidden]).toBeUndefined()
  // the status surface is the honest count — no numeric score beyond the counts
  const s = Cal.status(committed)
  expect(s.resolved).toBe(0)
  expect(s.recorded).toBe(committed.entries.length)
  expect(s.line).toMatch(/no score is shown until real resolutions exist/i)
  expect(s.line).toMatch(/recording since 2026-07-09/)
})

test("CAL — the engine-derived predictions cover the two implicit-prediction types (decay tier + funding regime), never a model output", () => {
  const types = new Set(committed.entries.map((e) => e.predictionType))
  expect(types.has("decay-tier-persistence")).toBe(true)
  // every prediction string is engine-shaped (it names a tier/regime the engine computed) — never free-form model prose
  for (const e of committed.entries) {
    if (e.predictionType === "decay-tier-persistence") expect(e.prediction).toMatch(/TRACEABLE|SHORT_LIVED/)
    if (e.predictionType === "funding-regime-state") expect(e.prediction).toMatch(/carry-(positive|adverse)|unconfirmed/)
    expect(e.horizon).toBe("30d")
  }
})
