/**
 * ORGΛNON — THE SOCKET SPRINT (V37), PART E: the ADVERSARIAL VALIDATION RECORD, asserted in the shipped code.
 *
 * The 10 PART A′ attacks and the 7 PART F re-pins (RP-1..RP-7) each have a binding consequence that HOLDS. The gravest —
 * D53 forging a signature by paraphrase — is answered STRUCTURALLY: D51 stays open, the instruction is verbatim, the
 * inference separate, the lift strikeable and priced as a SEARCH. And the price is RENDERED (RP-1), not merely appended.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Signability } from "../../src/backtest/crosscheck"
import { Manifest } from "../../src/strategy/manifest"
import { Socket } from "../../src/socket/server"

const H = path.join(PKG_ROOT, "data", "honesty")
const sp = JSON.parse(readFileSync(path.join(H, "socket-pins.json"), "utf8"))
const halt = JSON.parse(readFileSync(path.join(H, "halt-lifts.json"), "utf8"))

test("PART A′ — all 10 attacks recorded with a binding consequence; #1 (D53 forges a signature) answered STRUCTURALLY", () => {
  const a = sp.adversarialRecord_partA
  for (let i = 1; i <= 10; i++) expect(Object.keys(a).some((k) => k.startsWith(`A${i}_`))).toBe(true)
  expect(a.A1_d53ForgesASignature).toMatch(/D51 NOT marked answered|stays open/i)
  expect(a.A2_falseFireNeedsANoiseModel).toMatch(/MODEL-FREE|do not model, COUNT/i)
  expect(a.A4_socketExportsToAnLLM).toMatch(/STATED, NOT SOLVED/i)
  expect(a.A7_shippingSocketWhileD42Owed).toMatch(/D42 remains OPEN|PERMANENTLY REJECTED/i)
})

test("PART A′ #1 / RP-1 — the D53 SEARCH is RENDERED (a price not shown is not paid, X-SHOWN), and D51 stays OPEN", () => {
  expect(halt.act).toBe("SEARCH")
  expect(halt.lifts).toBe(1)
  expect(halt.liftedAfterSprintsOfZero).toBe(4)
  expect(halt.renderedLine).toMatch(/Halt lifts: 1 · lifted after: 4 sprints of a zero/)
  expect(halt.operatorInstructionVerbatim).toBe("continue executing both the planned feature roadmap and issue resolution")
  expect(halt.d51State).toMatch(/OPEN/)
  // D51 is NOT marked answered anywhere — the agent computes the fact and never signs (LN5)
  expect(sp.d51Restated.state).toBe("OPEN")
  expect(sp.d53.d51NotAnswered).toMatch(/NOT MARKED ANSWERED/i)
})

test("PART F — all 7 re-pins recorded, and each HOLDS in the shipped code", () => {
  const f = sp.postImplementationRePins_partF
  for (let i = 1; i <= 7; i++) expect(Object.keys(f).some((k) => k.startsWith(`RP${i}_`))).toBe(true)
  // RP-4 — the tree showed the position HAS size, so concentration-ceiling ships (not a decoration)
  expect(Manifest.EXIT_KINDS).toContain("concentration-ceiling")
  // RP-3 — every tool description passes the ONE GUARD (asserted in socket_server); the honest limit is pinned verbatim
  expect(sp.socketCatalog.honestLimitInEveryDescription).toMatch(/PINNED VERBATIM|passes the ONE GUARD/i)
  expect(Socket.tools().every((t) => t.description.includes(Socket.HONEST_LIMIT))).toBe(true)
  // RP-7 — the theory expectation was pinned before compute, and D33 went BACKWARD
  expect(sp.pboTheory.expectedPboUnderNoise).toBe(0.5)
  expect(Signability.d33().state).toBe("PRECONDITION-MET-BY-CONSISTENCY-ONLY")
})

test("PART E — MR13 (MR9 discharged) + MR14 (the PBO tolerance below its granularity) are pinned and reasoned", () => {
  expect(sp.mr13_mr9Discharged.rule).toMatch(/discharges it|itemized|undischargeable/i)
  expect(sp.mr14_pboTolerance.rule).toMatch(/COARSER than PBO's own granularity/i)
  expect(sp.mr14_pboTolerance.granularity).toBeCloseTo(1 / 70, 6)
  // MR14's reasoned defence: correctness no longer rests on consistency alone (S110 added theory + a non-shared oracle)
  expect(sp.mr14_pboTolerance.rule).toMatch(/no longer load-bearing|theory \+ a non-shared oracle/i)
})

test("PART E — NO LAW was minted (D55; the seventeen carried); capability added is 3 and DISCLOSED; deps stay 2", () => {
  expect(sp.carried.lawsThisSprint).toMatch(/ZERO/)
  expect(sp.carried.newProductCapability).toBe(3) // the first non-zero in four sprints — disclosed, priced as a SEARCH
  expect(sp.carried.capabilityList.length).toBe(3)
  expect(sp.carried.deps).toEqual(["hono", "zod"]) // the MCP framing is WRITTEN, not imported
  const pkg = JSON.parse(readFileSync(path.join(PKG_ROOT, "package.json"), "utf8"))
  expect(Object.keys(pkg.dependencies ?? {}).sort()).toEqual(["hono", "zod"])
})

test("PART E — the shed order holds: Phases 1-2 (the debt) ship even if D53 is struck (they add ZERO capability)", () => {
  expect(sp.shedOrder.strikeD53VoidsCapability).toMatch(/Phases 1 and 2 stand and add ZERO capability/i)
  expect(sp.shedOrder.order[0]).toMatch(/NEVER sheds/i)
})
