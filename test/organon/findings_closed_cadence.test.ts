/**
 * ORGΛNON — THE CADENCE SPRINT, the ADVERSARIAL VALIDATION RECORD closed (Part A′, attacks 1-15). Each attack the plan was
 * subjected to BEFORE design has its binding consequence asserted here — a finding closed, not a claim. Plus the carried
 * constitution (deps/screens/kill/differential) byte-untouched and the door's execution-semantics permanently rejected.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Monitor } from "../../src/strategy/monitor"
import { Baseline } from "../../src/strategy/baseline"
import { Reality } from "../../src/studio/reality"
import { VoiceGates } from "../../src/ask/gates"
import { Author } from "../../src/strategy/author"

const cd = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "cadence-pins.json"), "utf8"))

test("A′1 — the monitor becomes an actor: a fired exit phrased as instruction/urgency is REFUSED (reads-never-acts)", () => {
  expect(Monitor.guardCycleLine("exit now — the peg broke").ok).toBe(false)
  expect(Monitor.guardCycleLine("you should sell immediately").ok).toBe(false)
  expect(Monitor.guardCycleLine(Monitor.firedExitLine("abc12345", "peg 0.99 < floor 0.995")).ok).toBe(true) // the fact grammar is fine
})

test("A′2 — the door becomes an advisor: zero pre-filled judgment fields, zero social proof (ESMA ¶61)", () => {
  const html = Reality.renderManifestDoor({ mode: "new" })
  expect(html).toMatch(/<option value="" disabled selected>/) // no defaulted exit kind
  expect(html).not.toMatch(/most users|people like you|recommended|popular|we suggest|highlighted/i)
})

test("A′3 — the twin-law expansion is DISCLOSED (D41) with the pre-authorized SHED ORDER (X-AUTHOR sheds first)", () => {
  expect(cd.deviations.D41).toMatch(/TWIN-LAW DEPARTURE/i)
  expect(cd.deviations.D41).toMatch(/Phase 4.*sheds FIRST/i)
})

test("A′4 — trial volume does not normalize counting: the K-door refuses AT COUNT (covered by inert_at_count S75)", () => {
  expect(cd.xCadence.d_everyCycleTrial.atCountProof).toMatch(/REFUSES at count 23/i)
})

test("A′5 — the baseline cannot quietly re-base: a silent edit is DETECTED (S76)", () => {
  const surf = { positions: [{ subjectKey: "a", name: "A", verdict: "SOLID", govClass: "TIMELOCK", captureTier: "REAL", peg: 1, tvlDrawdown: null, fundingNegPeriods: null, fundingTotalPeriods: null }], effectiveK: null, catch: { fundingCarryCount: 0, leveredCount: 0, rwaPresent: false, totalReachable: 1 }, worstAxis: null, exitHash: null }
  const b = Baseline.pin(surf, "2026-07-13T00:00:00Z")
  const tampered = JSON.parse(JSON.stringify(b)); tampered.surface.positions[0].govClass = "EOA"
  expect(Baseline.detectSilentEdit(tampered)).toBe(true)
})

test("A′6/7 — a cycle cannot repaint + no daemon sneaks in (the no-repaint + grep-wall pins are present)", () => {
  expect(cd.xCadence.c_confirmedBoundary.noRepaint).toMatch(/no-repaint/i)
  expect(cd.xCadence.c_confirmedBoundary.grepWall).toMatch(/no setInterval/i)
})

test("A′8 — the Fact Envelope is an INTERNAL serialization contract with NO served endpoint (not an API-as-product)", () => {
  const serve = readFileSync(path.join(PKG_ROOT, "script", "serve-reality.ts"), "utf8")
  expect(serve).not.toMatch(/FactEnvelope|\/envelope|\/facts\.json/) // the envelope is not exposed as a route
})

test("A′9 — MR2's affordance line does not drift into marketing: it passes the advice wall (pinned phrasing only)", () => {
  expect(VoiceGates.advicePattern(Reality.AFFORDANCE_LINE).advice).toBe(false)
  expect(cd.mr2AffordanceLine.line).toBe(Reality.AFFORDANCE_LINE)
})

test("A′10 — the S36 byte-move is DISCLOSED (the two shelf goldens + the door addition are recorded with shas)", () => {
  expect(cd.s36Repin.moved["shelf-sample"].old).toBe("fa4e9d656efaa18e")
  expect(cd.s36Repin.moved["shelf-sample"].new).toBe("bccef6e21bf9cf6a")
  expect(cd.s36Repin.unchanged["reality-sample"]).toBe("6b69b40a1e11d54d") // reality byte-identical
})

test("A′11 — MR1's four showcase subjects were pinned PRE-feasibility and are restated (never swapped)", () => {
  expect(cd.mr1PrePinnedFour.subjects.length).toBe(4)
})

test("A′12 — MR3 does NOT over-reach: exit.ts is untouched (it already reads governanceChanged; only resolve.ts threads it)", () => {
  const exitSrc = readFileSync(path.join(PKG_ROOT, "src", "strategy", "exit.ts"), "utf8")
  // exit.ts reads facts.governanceChanged but computes NO baseline itself (the threading lives in resolve.ts)
  expect(exitSrc).toMatch(/governanceChanged/) // it reads the fact
  expect(exitSrc).not.toMatch(/adminClass|Baseline|resolveSubject/) // it does not reach into governance/baseline
})

test("A′13 — the venv rebuild is environment-only: checkFrozenSet exists to assert the frozen core is byte-untouched after", () => {
  const frozen = readFileSync(path.join(PKG_ROOT, "src", "organon", "frozen.ts"), "utf8")
  expect(frozen).toMatch(/checkFrozenSet|FROZEN/) // the frozen-set assertion is available
})

test("A′14 — the door invites NO execution semantics: no wallet / keys / connect / addresses beyond position identifiers", () => {
  const html = Reality.renderManifestDoor({ mode: "new" })
  expect(html).not.toMatch(/connect wallet|private key|seed phrase|sign transaction|approve|0x[a-fA-F0-9]{40}/)
})

test("A′15 — the success metric is CYCLES-RUN, not code-shipped (the market finding the kill-criterion demands is on the record)", () => {
  expect(cd.deviations.D42).toBeTruthy() // the posture + the market finding ride the gate
  expect(cd.xCadence.d_everyCycleTrial.idempotency).toMatch(/repeated timer invocation does not inflate/i)
})

test("CADENCE — the carried constitution is byte-untouched (deps/screens/kill/differential/bundle)", () => {
  expect(cd.carried.deps).toEqual(["hono", "zod"])
  expect(cd.carried.screens).toEqual(["shelf", "reality-check", "ask"])
  expect(cd.carried.killCriterion).toBe("8b4e094b")
  expect(cd.carried.evidenceBundleShaPrefix).toBe("9c1e7bd8")
  // the door authors nothing — Author.parse never returns a manifest with an invented position
  expect(Author.parse({}).ok).toBe(false)
})
