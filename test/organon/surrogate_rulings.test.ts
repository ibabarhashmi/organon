/**
 * ORGΛNON — THE SURROGATE ADDENDUM (V38-B), B2 walls: S137 (the amendment-as-SEARCH) + S139 (the instrument's frame). The
 * rulings executed — and ONLY the pen's words plus pre-priced costs.
 *
 * S137 (D67) — the market kill-criterion is AMENDED, not fired; the amendment is a SEARCH (re-pinning after seeing data is
 * the exact act X-RECKON catches) carrying a real ledger hash in record/; the old criterion (8b4e094b) is preserved beside it
 * forever; ⟨N⟩ ships EMPTY with a trade-off table (RP-3); the agent DRAFTS, never pins (LN5).
 * S139 (D51) — reachableHumans: 1 renders BY-DESIGN (derived from D51's recorded state); a producer framing it as failure, or
 * any law as relaxable-because-personal, FAILS.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reach } from "../../src/organon/reach"

const H = path.join(PKG_ROOT, "data", "honesty")
const amend = JSON.parse(readFileSync(path.join(H, "kill-criterion-amendment.json"), "utf8"))
const chain = JSON.parse(readFileSync(path.join(PKG_ROOT, "record", "chain.json"), "utf8"))

test("S137 (W-SB03, D67) — the amendment is a SEARCH with a real ledger hash in record/; the strategy-trial ledger is not its site (a meta-event)", () => {
  expect(amend.amendmentAsSearch.act).toBe("SEARCH")
  const entry = chain.chain.find((e: { name: string }) => e.name === "kill-criterion-amendment.json")
  expect(entry).toBeTruthy() // the amendment SEARCH is IN the record hash-chain
  expect(chain.d67SearchLedgerHash).toBe(entry.selfSha)
  expect(chain.d67SearchLedgerHash).toMatch(/^[0-9a-f]{64}$/)
  expect(chain.d67Note).toMatch(/not a strategy manifest|meta-event/i) // the honest S122-style resolution, twice
})

test("S137 (D67) — the OLD criterion (8b4e094b) is preserved beside the amendment FOREVER — you do not delete the test you replaced", () => {
  expect(amend.oldCriterion.hash).toBe("8b4e094b")
  expect(amend.oldCriterion.preserved).toMatch(/PRESERVED FOREVER/i)
  expect(amend.oldCriterion.whatItTested).toMatch(/STRANGERS|MARKET|adoption/i) // it tested the market hypothesis
  expect(amend.oldCriterion.whyWrong).toMatch(/no market for an instrument|buyer.*builder/i)
})

test("S137 / RP-3 — ⟨N⟩ ships EMPTY with a trade-off table; a pre-filled N is forbidden (X-AUTHOR applied to the project's own manifest); presented NEVER pinned (LN5)", () => {
  const a = amend.amendedCriterion
  expect(a.nSlot).toMatch(/EMPTY/)
  expect(a.draftText).toMatch(/⟨N⟩/) // the slot is literally empty in the draft
  for (const n of ["N=5", "N=10", "N=20"]) expect(a.nTradeoffTable[n]).toBeTruthy() // the trade-off table — the pen picks
  // a pre-filled N (a concrete number where ⟨N⟩ should be) would be a pre-filled thesis — the draft must NOT contain one
  expect(a.draftText).not.toMatch(/first \d+ HUMAN-authored/) // e.g. "first 10 HUMAN-authored" is a pre-filled N — forbidden
  expect(a.presentedNeverPinned).toMatch(/DRAFTS, it does NOT pin/i)
  expect(a.falsifiableByMoatAlone).toMatch(/no survey, no self-report/i) // falsifiable by the moat alone (attack #3)
})

test("S139 (W-SB05, D51) — reachableHumans: 1 renders BY-DESIGN (derived from D51's recorded state); the instrument sentence frames it as the spec, not a deficiency", () => {
  expect(Reach.interpretation()).toBe("BY-DESIGN") // derived from the surrogate pins' D51 ANSWERED=INSTRUMENT
  const s = Reach.instrumentSentence(Reach.fact())
  expect(s).toMatch(/BY DESIGN/i)
  expect(s).toMatch(/the spec, not a deficiency/i)
  expect(s).toMatch(/keeps all seventeen laws/i)
  expect(Reach.frameIsHonest(s).ok).toBe(true)
})

test("S139 — a producer framing the 1 as a FAILURE, or any law as relaxable-because-personal, FAILS (seeded negatives)", () => {
  expect(Reach.frameIsHonest("reachableHumans: 1 is a deficiency — nobody uses it").ok).toBe(false)
  expect(Reach.frameIsHonest("reachableHumans: 1 — too few reachers, a failing").ok).toBe(false)
  expect(Reach.frameIsHonest("the honesty law can relax because it is a personal tool now").ok).toBe(false)
  expect(Reach.frameIsHonest("rigor is negotiable because it is private").ok).toBe(false)
  // the pins carry the sentence that forbids it
  const sg = JSON.parse(readFileSync(path.join(H, "surrogate-pins.json"), "utf8"))
  expect(sg.instrumentKeepsAllSeventeenLaws).toMatch(/keeps all seventeen laws/i)
  expect(sg.instrumentKeepsAllSeventeenLaws).toMatch(/self-deception with a build system/i)
})
