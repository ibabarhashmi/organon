/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 1 walls (S140–S144, S150) — *never sheds.* THE PRICE, THE EVIDENCE, THE RECORD.
 *
 * V38 flipped D33 → SIGNABLE on a test it redesigned AFTER it failed and wrote "no SEARCH was incurred" (J-1); the autopsy
 * it ordered found the i.i.d. limitation and never met the signature (J-2); the deciding z was claimed, never shown (J-3);
 * the log held two contradictory states of D51 (J-4); the terminal marker carried prose in a hash slot (J-5); the clone was
 * not re-run (J-6). This phase pays the price, shows the evidence, and records the state — each with a seeded negative.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Signability } from "../../src/backtest/crosscheck"
import { State, Search, Evidence } from "../../src/organon/state"
import { Clone } from "../../src/organon/clone"
import { EffectiveN } from "../../src/backtest/effectiven"
import { Marker } from "../../src/studio/marker"
import { Rollup } from "../../src/organon/rollup"

const RUN = { fullBattery: { pass: 1, skip: 0, fail: 0, files: 1, expect: 1, twoRunsIdentical: true } }

// ── S140 — the D56 price is automatic forever ──────────────────────────────────────────────────────────────────────────
test("S140 (D56) — a test whose ESTIMAND changes is a SEARCH; a same-estimand re-run is NOT; the real redesign is PRICED (chained)", () => {
  // a change of estimand → a SEARCH is owed
  const s = Search.forTestRedesign("single-seed PBO point/band test", "null-distribution MEAN over ≥200 seeds")
  expect(s?.act).toBe("SEARCH")
  expect(s?.estimandChanged).toBe(true)
  // SEEDED NEGATIVE — a re-run of the SAME test (same estimand) is NOT a search (the price is for redesigns, not repetition)
  expect(Search.forTestRedesign("same test", "same test")).toBeNull()
  // the real D56 redesign is PRICED — its SEARCH hash is chained in record/ (testRedesigns:1, chainedHash present)
  const priced = Search.redesignIsPriced()
  expect(priced.redesigns).toBe(1)
  expect(priced.chainedHash).toMatch(/^[0-9a-f]{64}$/)
  expect(priced.priced).toBe(true)
})

test("S140 — the pricing predicate BITES: a redesign with NO chained SEARCH hash is UNPRICED (a Halt)", () => {
  expect(Search.pricedGiven(1, "somehash")).toBe(true)
  expect(Search.pricedGiven(0, null)).toBe(true) // no redesign → nothing owed
  // SEEDED NEGATIVE — a recorded redesign with no chained hash is UNPRICED (the exact V38 defect: a price owed, not paid)
  expect(Search.pricedGiven(1, null)).toBe(false)
})

// ── S141 — a state flip must emit the evidence that flipped it (J-3) ─────────────────────────────────────────────────────
test("S141 (J-3) — D33's flip EMITS its deciding evidence {z, acceptanceRegion, preRegisteredAt}; the z is SHOWN, not a boolean", () => {
  const e = Evidence.forStateFlip("D33")
  expect("z" in e).toBe(true)
  if ("z" in e) {
    expect(Number.isFinite(e.z)).toBe(true) // the deciding number is REAL, computed from the null-distribution MEAN
    expect(e.acceptanceRegion).toMatch(/\|z_mean\| < 2/) // the pre-pinned band
    expect(e.preRegisteredAt).toMatch(/\d{4}-\d{2}-\d{2}/) // a real pre-registration timestamp
  }
  // the gate SHOWS the z in the generated header (the flip no longer unlocks on a boolean)
  const g = Rollup.gate() as { firstSection: { d33: { flipEvidence: unknown } } }
  expect("z" in (g.firstSection.d33.flipEvidence as Record<string, unknown>)).toBe(true)
})

test("S141 — SEEDED NEGATIVE: a flip with no evidence producer is REFUSED (a boolean flip FAILS)", () => {
  const e = Evidence.forStateFlip("D99")
  expect("refused" in e).toBe(true)
})

// ── S142 — the assumption-limit renders on the SAME LINE as the verdict (J-2) ────────────────────────────────────────────
test("S142 (J-2) — D33 SIGNABLE carries its i.i.d. rider on the SAME LINE (direction + magnitude), DERIVED from the frozen code", () => {
  const d = Signability.d33()
  expect(d.state).toBe("SIGNABLE")
  expect(d.iidRider).not.toBeNull()
  expect(d.iidRider!.stands).toBe(true) // a HARNESS-COMPOSITION gap — the rider STANDS, quantified
  expect(d.iidRider!.classification).toBe("HARNESS-COMPOSITION-GAP")
  expect(d.iidRider!.direction).toMatch(/OVERSTATE/i) // the direction is NAMED
  expect(d.iidRider!.magnitude).toMatch(/√τ_int|τ_int/) // the magnitude is NAMED
  // the rider is on the SAME LINE as the verdict (folded into the SIGNABLE detail)
  expect(d.detail).toMatch(/i\.i\.d\. rider \[STANDS/)
  expect(d.detail).toMatch(/redesign #1/) // and the price (RP-1) on that line too
  // the rider is DERIVED (X-SHOWN) — the determination came from reading the frozen effective_n.py + rigor.py
  const det = EffectiveN.derive()
  expect(det.axesPresent).toContain("SERIAL")
  expect(det.frozenPsrDerivesNInternally).toBe(true) // rigor.psr uses √(n−1), no n parameter — cannot be wired into
  expect(det.classification).toBe("HARNESS-COMPOSITION-GAP")
})

test("S142 — SEEDED NEGATIVE: a SIGNABLE with the bearing rider STRIPPED renders no rider line (the wall would catch an unattached limitation)", () => {
  const stripped = { ...Signability.d33(), iidRider: null }
  expect(Signability.riderLine(stripped)).toBe("") // no rider attached → the S142 render is empty, which for a SIGNABLE is a Halt
  // the guard: a SIGNABLE state with a null rider is the exact unattached-limitation defect
  const isHalt = stripped.state === "SIGNABLE" && stripped.iidRider === null
  expect(isHalt).toBe(true)
})

// ── S143 — the terminal marker ends in a re-derivable hash, not prose (J-5) ──────────────────────────────────────────────
test("S143 (J-5) — the terminal marker's treeHash is a 40-hex; prose in the hash slot FAILS Marker.validate", () => {
  const m = Rollup.terminalMarker(RUN)
  expect(String(m.treeHash)).toMatch(/^[0-9a-f]{40}$/) // a real, re-derivable git tree object
  const okValidation = Marker.validate(m, "terminal")
  expect(okValidation.invalid.filter((s) => s.startsWith("treeHash"))).toEqual([]) // the real marker's hash slot is valid
  // SEEDED NEGATIVE — a prose value in the hash slot (the exact V38 defect "the substance commit") FAILS validation
  const prose = Marker.validate({ ...m, treeHash: "the substance commit" }, "terminal")
  expect(prose.invalid.some((s) => s.startsWith("treeHash"))).toBe(true)
})

// ── S144 — the clone battery is THIS tree's; a stale one FAILS (J-6) ─────────────────────────────────────────────────────
test("S144 (J-6) — a STALE clone battery is caught: a clonedCommit that differs from the terminal commit is stale; absent is stale-by-default", () => {
  expect(Clone.staleAgainst("aaaa1111", "aaaa1111")).toBe(false) // a matching commit → fresh
  // SEEDED NEGATIVE — the exact V38 defect: a clone that ran on a PRIOR commit (its battery is a prior sprint's)
  expect(Clone.staleAgainst("v37commit", "v39commit")).toBe(true)
  // absent → stale-by-default (never a silent green over an unrun clone)
  expect(Clone.staleAgainst(null, "v39commit")).toBe(true)
  expect(Clone.staleAgainst(undefined, "v39commit")).toBe(true)
})

// ── S150 — ONE deviation-state producer; a contradiction is UNREPRESENTABLE (J-4) ────────────────────────────────────────
test("S150 (MR18/J-4) — ONE State.deviations() producer: D51 ANSWERED; a render that hardcodes a contradictory state is CAUGHT", () => {
  const d51 = State.byId("D51")
  expect(d51?.state).toBe("ANSWERED") // the single authority
  expect(d51?.supersedes).toMatch(/product, or an instrument/) // MR18 — the pointer where the stale question stood
  // the clean case — a render agreeing with the producer names no contradiction
  expect(State.contradiction({ D51: "ANSWERED", D33: "SIGNABLE", D63: "OFF" })).toEqual([])
  // SEEDED NEGATIVE — a second render hardcoding "OPEN" (the V38 base-gate defect) while the producer says "ANSWERED" is CAUGHT
  expect(State.contradiction({ D51: "OPEN" })).toEqual(["D51"])
  // the base gate itself reads the producer — its rendered D51 agrees (no self-contradiction in the log)
  const g = Rollup.gate() as { d51: { state: string } }
  expect(g.d51.state).toBe("ANSWERED")
})

test("S150 — the deviation states render whole from the single source (D51, D33, D63, D27 present)", () => {
  const ids = State.deviations().map((d) => d.id)
  expect(ids).toEqual(["D51", "D33", "D63", "D27"])
  // D33's state carries its price + rider through the single producer (RP-1/S142 travel with the state)
  const d33 = State.byId("D33")!
  expect(d33.detail).toMatch(/redesign #1|SIGNABLE/)
})

// carried continuity — the D56 record is committed under record/ and hash-chained (the third application of S122's answer)
test("S140 — the D56 SEARCH is committed and hash-chained in record/ (after D53's Halt-lift and D67's amendment)", () => {
  const chain = JSON.parse(readFileSync(path.join(PKG_ROOT, "record", "chain.json"), "utf8"))
  expect(chain.d56SearchLedgerHash).toMatch(/^[0-9a-f]{64}$/)
  expect(chain.d56Note).toMatch(/testRedesigns|redesigned after it failed/i)
  expect(chain.chain.some((c: { name: string }) => c.name === "test-redesign-search.json")).toBe(true)
})
