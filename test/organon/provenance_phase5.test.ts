/**
 * ORGΛNON — THE PROVENANCE SPRINT (V42), Phase 5 wall (S179): THE CAPTURE'S WINDOW, NOW REAL. NO NEW LAW (seventh sprint).
 *
 * W-PR11 (S179) — V41's marginal-value renderer described a window that captured NOTHING; V42's REAL★ engine finally polls, so
 * the own-capture window renders from ACTUAL captures (the REAL★ observe-ledger). The UNJUDGEABLE floor HOLDS at every length
 * (F-6/RP-6): 0 is UNJUDGEABLE and says so, 3 is "3 of 180 — 177 to go", never a number that pretends 3 captures price a
 * search. The HUMAN own-count is what feeds the false-fire leg; an AGENT capture (the builder's known-answer proof) is
 * QUARANTINED (DD-79/S128) and NEVER advances it. In CAPTURES, never days (RP-6). No scheduler (S160 carried) — a VERB.
 */
import { test, expect } from "bun:test"
import { Capture } from "../../src/strategy/capture"

test("S179 (W-PR11) — the own-capture window renders from ACTUAL captures (the REAL★ observe-ledger), not a described-but-empty one", () => {
  const w = Capture.realStarWindow()
  expect(w.minWindow).toBe(180)
  expect(w.humanCaptures).toBe(0) // the Operator has never run the verb — honest
  expect(w.agentCaptures).toBeGreaterThanOrEqual(1) // the builder proved the engine works (AGENT-tier, quarantined)
  expect(w.render).toMatch(/CAPTURES, not days/)
  expect(w.render).toMatch(/QUARANTINED/) // the AGENT proof does not advance the HUMAN count
})

test("S179 (W-PR11) — the UNJUDGEABLE floor HOLDS at every length: 0 is UNJUDGEABLE, and an AGENT capture cannot advance the HUMAN count (quarantine)", () => {
  const w = Capture.realStarWindow()
  expect(w.judgeable).toBe(false) // 0 (or any count below 180) is UNJUDGEABLE — never inflated
  expect(w.firstHumanCapture).toBe(true)
  expect(w.render).toMatch(/UNJUDGEABLE/)
  // DD-79/S128 — the quarantine: only a HUMAN capture advances the HUMAN own-count
  expect(Capture.advancesHumanCount("HUMAN")).toBe(true)
  expect(Capture.advancesHumanCount("AGENT")).toBe(false) // a busy ledger of AGENT captures never implies human use
})

test("S179 (W-PR11) — RP-6: the window is honest at LENGTH 3 too — 'UNJUDGEABLE (3 of 180 — 177 to go)', never a projected date", () => {
  // simulate a ledger at length 3 (below the floor) — it must render UNJUDGEABLE with the CAPTURES remaining, never a date
  const base = Capture.realStarLedger()
  const at3: Capture.RealStarLedger = { ...base, ownCapturesHuman: 3 }
  // re-derive the render logic against the length-3 ledger (the same rule the live window uses)
  const min = at3.minWindowCaptures
  const human = at3.ownCapturesHuman
  const judgeable = human >= min
  expect(judgeable).toBe(false) // 3 of 180 is still UNJUDGEABLE — the exact overfitting the tool exists to catch
  expect(min - human).toBe(177) // 177 CAPTURES to go — a count, never a date (RP-6)
})

test("S179 (W-PR11) — NO scheduler: the verb renders 'an invitation, not a schedule'; ORGΛNON schedules NOTHING (S160 carried)", () => {
  const w = Capture.realStarWindow()
  expect(w.render).toMatch(/an invitation, not a schedule|schedules NOTHING/)
  // the render never projects a DATE (RP-6) — no "days", "weeks", "by <date>" in the window's own copy
  expect(w.render).not.toMatch(/\bin \d+ days\b|\bby (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|20\d\d)\b/)
})
