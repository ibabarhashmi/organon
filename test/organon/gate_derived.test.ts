/**
 * ORGΛNON — THE REACH SPRINT (V35), Phase 2 wall: S95 — THE GATE IS A GATE (X-REACH(c)).
 *
 * "A gate expected to be partially red is not a gate." verify is green end-to-end, or its failing sub-check is retired
 * WITH DISCLOSURE — and green is a DERIVED VALUE, never a typed word. The marker's verify slot is a structured object
 * { exitCode, subchecks[] }; a marker that TYPES "green" for a command whose exit code was non-zero FAILS the battery.
 * This is the lesson of V33->V34 (shapes, not substrings; attack #6) applied to the project's own reporting.
 */
import { test, expect } from "bun:test"
import { Verify } from "../../src/organon/verify"
import { Marker } from "../../src/studio/marker"

// ── the derived object shape + the exitCode derivation ───────────────────────────────────────────────────────────────

test("S95 — the verify exitCode is DERIVED, not typed: any fail/blocked sub-check → exitCode 1; all pass → 0", () => {
  expect(Verify.exitCodeFrom([{ name: "a", status: "pass", detail: "" }])).toBe(0)
  expect(Verify.exitCodeFrom([{ name: "a", status: "pass", detail: "" }, { name: "b", status: "fail", detail: "" }])).toBe(1)
  expect(Verify.exitCodeFrom([{ name: "a", status: "blocked", detail: "" }])).toBe(1) // an absence is not a pass
  expect(Verify.exitCodeFrom([{ name: "a", status: "pass", detail: "" }, { name: "b", status: "retired", detail: "disclosed" }])).toBe(0) // retired-with-disclosure does not fail the gate
})

test("S95 — greenConsistency BITES: a prose that types green while the exit code is non-zero is a violation (the seeded negative)", () => {
  const red: Verify.Result = { exitCode: 1, subchecks: [{ name: "battery-count-matches-committed", status: "fail", detail: "1281 ≠ 1225" }] }
  // the SEEDED NEGATIVE — the original defect this wall was minted for (C-2: six phase markers typed "verify green" while
  // the battery-count sub-check was red). It must be caught.
  expect(Verify.greenConsistency(red, "verify green end-to-end")).toMatch(/types "green"/i)
  expect(Verify.greenConsistency(red, "the gate is GREEN")).toMatch(/derived value/i)
  // a green exit with green prose is consistent — no violation
  const green: Verify.Result = { exitCode: 0, subchecks: [{ name: "evidence-bundle-reproduces", status: "pass", detail: "9c1e7bd8" }] }
  expect(Verify.greenConsistency(green, "verify green — every sub-check passed")).toBeNull()
})

test("S95 — Marker.validate rejects a marker that TYPES green against a non-zero verify exit code (the machine's observation is the authority)", () => {
  const lie = {
    treeHash: "0".repeat(40), commitSha: "abc1234", pinsSha: "8c80367a", battery: "1508/2/0", expect: "9436",
    verifyOutput: "VERIFY GREEN", verifyCoverage: "7/9 because RWA-VERDICT.md + MANIFEST.json are absent on a clone", goldenMoves: 0,
    verify: { exitCode: 1, subchecks: [{ name: "battery-count-matches-committed", status: "fail", detail: "stale" }] },
  }
  const r = Marker.validate(lie, "terminal")
  expect(r.ok).toBe(false)
  expect(r.invalid.join(" ")).toMatch(/types "green".*exitCode is 1|green is a derived value/i)

  // the same marker with an honest exit-0 verify object validates (green prose is TRUE when the machine agrees)
  const honest = { ...lie, verify: { exitCode: 0, subchecks: [{ name: "evidence-bundle-reproduces", status: "pass", detail: "9c1e7bd8" }] } }
  expect(Marker.validate(honest, "terminal").ok).toBe(true)
})

test("S95 — a malformed verify object (not {exitCode:number, subchecks:[...]}) is INVALID (a sentence is not an object)", () => {
  const base = {
    treeHash: "0".repeat(40), commitSha: "abc1234", pinsSha: "8c80367a", battery: "1508/2/0", expect: "9436",
    verifyOutput: "exit 0 · every sub-check passed", verifyCoverage: "9/9", goldenMoves: 0,
  }
  expect(Marker.validate({ ...base, verify: "green" as unknown as object }, "terminal").invalid.join(" ")).toMatch(/verify\.exitCode/i)
  expect(Marker.validate({ ...base, verify: { exitCode: 0, subchecks: [] } }, "terminal").invalid.join(" ")).toMatch(/subchecks/i)
  expect(Marker.validate({ ...base, verify: { exitCode: 0, subchecks: [{ name: "x", status: "pass", detail: "y" }] } }, "terminal").ok).toBe(true)
})

// ── LIVE — Verify.run() actually DERIVES the object from the real sub-checks (executed, shown) ────────────────────────

test("S95 LIVE — Verify.run() derives {exitCode, subchecks[]} from the real evidence-bundle + frozen-set checks (green is observed, not typed)", () => {
  const v = Verify.run() // runs build-evidence --check + checkFrozenSet — the real deterministic core
  expect(Array.isArray(v.subchecks)).toBe(true)
  expect(v.subchecks.length).toBeGreaterThanOrEqual(2)
  const names = v.subchecks.map((s) => s.name)
  expect(names).toContain("evidence-bundle-reproduces")
  expect(names).toContain("frozen-set-intact")
  // the deterministic core reproduces (no verdict moved) and the frozen set is intact → these sub-checks pass, exit 0
  expect(v.subchecks.find((s) => s.name === "evidence-bundle-reproduces")?.status).toBe("pass")
  expect(v.subchecks.find((s) => s.name === "frozen-set-intact")?.status).toBe("pass")
  expect(v.exitCode).toBe(0) // DERIVED from the observations
}, 130_000)

test("S95 — the battery-count sub-check is derived: a live count ≠ the committed evidence → fail (the DD-10 defect, made a value)", () => {
  const mismatch = Verify.run({ skipBundle: true, battery: { live: "1508/0", committed: "1225/0" } })
  expect(mismatch.subchecks.find((s) => s.name === "battery-count-matches-committed")?.status).toBe("fail")
  expect(mismatch.exitCode).toBe(1)
  const match = Verify.run({ skipBundle: true, battery: { live: "1225/0", committed: "1225/0" } })
  expect(match.subchecks.find((s) => s.name === "battery-count-matches-committed")?.status).toBe("pass")
})
