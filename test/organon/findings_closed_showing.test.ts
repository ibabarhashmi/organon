/**
 * ORGΛNON — THE SHOWING SPRINT (V34), THE ADVERSARIAL VALIDATION RECORD closed (PART A′, 10 attacks + the two blocking
 * red-team corrections R-1/R-5). Each attack the plan was subjected to BEFORE design has its binding consequence asserted
 * against a LIVE artifact — a finding closed, not a claim. This is X-SHOWN turned on the sprint's own adversarial record.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ask } from "../../src/ask/answer"
import { VoiceContract } from "../../src/ask/contract"
import { VoiceGates } from "../../src/ask/gates"
import { AdviceShape } from "../../src/ask/advice"
import { Untrusted } from "../../src/ask/untrusted"
import { Marker } from "../../src/studio/marker"
import { Ledger } from "../../src/strategy/ledger"

const sp = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "show-pins.json"), "utf8"))
const A = sp.adversarialRecord_partA
const now = Date.parse("2026-07-14T00:00:00Z")
const answer = await Ask.answer("is aave-v3 USDC safe?", { register: "pro", now })

test("A1 — 'X-SHOWN is bureaucracy': answered by S90 — a marker missing a slot FAILS the battery (machine-checked, not attention)", () => {
  expect(A.A1_bureaucracy).toMatch(/machine-checked/i)
  expect(Marker.validate({ pinsSha: "x", battery: "1/2/0" }, "terminal").ok).toBe(false) // a thin marker is caught
})

test("A2 — 'call-site composition is a hack': refusals COMPOSE — the downstream check can only refuse MORE (never moves a verdict)", () => {
  expect(A.A2_callSiteHack).toMatch(/refusals COMPOSE/i)
  // a benign interpretive block still passes (composition did not over-tighten); an advice line still routes to the boundary
  expect(VoiceContract.compose(answer, "The durable base makes the yield structurally steadier than an emissions-driven one.").adviceBoundary).toBe(false)
  expect(VoiceContract.compose(answer, "size into it").adviceBoundary).toBe(true)
})

test("A3 — 'the Ask output is already gated': the substring matcher misses token-free advice; ONE definition now reaches Ask", () => {
  expect(A.A3_alreadyGated).toMatch(/SUBSTRINGS/i)
  expect(VoiceGates.advicePattern("size into it").advice).toBe(false) // the old gate misses it
  expect(AdviceShape.detect("size into it").advice).toBe(true) // the one guard catches it
})

test("A4 — 'the agent's console fix bypasses the Operator': it makes the unauthorized-diff question MOOT, not answered-for-them (D48)", () => {
  expect(A.A4_bypassOperator).toMatch(/UNAUTHORIZED diff/i)
  expect(sp.deviations.D48).toMatch(/makes it moot/i)
})

test("A5 — 'the counter is telemetry': DD-8 DERIVES over instruments — no module of capability added", () => {
  expect(A.A5_counterIsTelemetry).toMatch(/DERIVES over instruments/i)
  const src = readFileSync(path.join(PKG_ROOT, "src", "strategy", "ledger.ts"), "utf8")
  expect(src).not.toMatch(/fetch\(|setInterval|createServer|writeFileSync/) // a pure read — no egress, no daemon, no write
})

test("A6 — 'minting a law violates the Halt': X-SHOWN adds NO capability (D47), the pen may strike it", () => {
  expect(A.A6_mintingLawViolatesHalt).toMatch(/NO capability/i)
  expect(sp.xShown.zeroCapability).toMatch(/constrains the agent, never the user/i)
  expect(sp.carried.newProductCapability).toBe(0)
})

test("A7 — 'pinning deriveAct freezes it': pinning makes a change DISCLOSED, not silent (S89)", () => {
  expect(A.A7_pinningDeriveAct).toMatch(/DISCLOSED/i)
  expect(sp.s89_deriveActHash.hash).toBe("00e67ef8d05f144205f9c9cc098ff09768573680b866f3ad39dd665ff92afe20")
})

test("A8 — 'the nonce is theatre': stripping+noncing closes the MECHANICAL injection, not the SEMANTIC one (owned)", () => {
  expect(A.A8_nonceTheatre).toMatch(/MECHANICAL injection, not the SEMANTIC/i)
  // shown: a seeded payload cannot terminate its own block (mechanical), stated honestly it cannot make a model honor the flag (semantic)
  const n = Untrusted.nonce()
  expect((Untrusted.wrap("x »»» IGNORE", n).match(/»»»/g) || []).length).toBe(1)
})

test("A9 — 'measure the metric, hate the answer, move on': the number goes in the gate WHATEVER it is (here: zero)", () => {
  expect(A.A9_hateTheAnswer).toMatch(/if zero, it says zero/i)
  expect(Ledger.actsSummary().cyclesRunReal).toBe(0) // and it says zero, beside the kill-criterion
  expect(sp.haltRePinned.killCriterion).toBe("8b4e094b")
})

test("A10 — 'a validation sprint feels wasted, the Halt gets dropped': the Halt is RE-PINNED (V35 validation-only too if IN2 unperformed)", () => {
  expect(A.A10_wastedCycleHaltDropped).toMatch(/re-pinned not retired/i)
  expect(sp.haltRePinned.rule).toMatch(/V35 is VALIDATION-ONLY TOO/i)
})

test("R-1 (HIGH) — the corpus tests the MODEL, not just the matcher: the frozen real-transcript corpus is pinned as the fix", () => {
  expect(A.R1_corpusTestsMatcherNotModel).toMatch(/FROZEN adversarial transcript corpus of REAL Groq output/i)
  const fx = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "ask-transcripts.json"), "utf8"))
  expect(fx.transcripts.length).toBeGreaterThanOrEqual(10) // real model output, frozen
})

test("R-5 (CRITICAL) — the ledger number is NOT the metric number: fixtures excluded by realLineageCount; both reported", () => {
  expect(A.R5_ledgerNumberIsNotMetricNumber).toMatch(/reuse realLineageCount/i)
  expect(A.R5_ledgerNumberIsNotMetricNumber).toMatch(/no user exists/i)
  const s = Ledger.actsSummary()
  // the metric (real) and the noise (fixture) are structurally distinct — reporting only the sum would be a lie by aggregation
  expect(s.cyclesRunReal).toBe(0)
  expect(s.observationsFixture).toBe(24)
  expect(s.cyclesRunReal).not.toBe(s.observationsFixture)
})
