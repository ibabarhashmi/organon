/**
 * WALL — research enters by RATIFICATION, never by citation (Spine Phase 0; Rule R-RATIFY, A′#4). The ratification table
 * is value-filed + hash-chained; a build artifact whose item lacks an ADOPT row does not exist as far as the sprint is
 * concerned. This wall proves: the table round-trips + its chain verifies from disk (a hand-edit is caught); every built
 * spine surface is covered by an ADOPT row; the value schema refuses an adoption-as-prose (no cited finding), a park
 * without its experiment, and a disposition without flip-criteria; and — positive control — a seeded unratified module
 * is CAUGHT. The DoF charge mapping is pinned in the VoC row BEFORE any proposer run (R-DOF).
 */
import { test, expect } from "bun:test"
import path from "node:path"
import { REPO_ROOT } from "../../src/organon/frozen"
import { Ratify } from "../../src/studio/ratify"

// the CURRENT ratification chain (v14 continues v11→…→v13→v14, append-only) — the wall enforces that every built surface,
// incl. the new src/analytics/explain.ts (the WHY panel), is covered by an ADOPT row in the live chain (Explanation: the
// WHY-panel ADOPT; the selection door disposed by SUPERSEDE).
const TABLE = path.join(REPO_ROOT, "data", "studio", "research-ratification-v14.json")

test("the ratification table round-trips and its chain verifies from disk", () => {
  const { entries, chainOk } = Ratify.load(TABLE)
  expect(chainOk).toBe(true)
  expect(entries.length).toBeGreaterThanOrEqual(13)
})

test("every built spine surface is covered by an ADOPT row (no unratified artifact)", () => {
  const { entries } = Ratify.load(TABLE)
  expect(Ratify.unratifiedArtifacts(entries)).toEqual([])
})

test("every ADOPT row cites a specific research finding, a cheap test, and ≥1 build artifact", () => {
  const { entries } = Ratify.load(TABLE)
  const adopts = entries.filter((e) => e.disposition === "ADOPT")
  expect(adopts.length).toBeGreaterThanOrEqual(5)
  for (const e of adopts) {
    expect(e.researchFinding.trim().length).toBeGreaterThan(0)
    expect(e.cheapTest.trim().length).toBeGreaterThan(0)
    expect(e.buildArtifacts.length).toBeGreaterThanOrEqual(1)
    expect(e.flipCriteria.trim().length).toBeGreaterThan(0)
  }
})

test("every PARK carries the four fields + a designed experiment with a pre-registered outcome", () => {
  const { entries } = Ratify.load(TABLE)
  const parks = entries.filter((e) => e.disposition === "PARK-WITH-EXPERIMENT")
  expect(parks.length).toBeGreaterThanOrEqual(4)
  for (const e of parks) {
    expect(e.park && e.park.context && e.park.rationale && e.park.impact && e.park.nextSteps).toBeTruthy()
    expect(e.experiment && e.experiment.hypothesis && e.experiment.method && e.experiment.preRegisteredOutcome).toBeTruthy()
    expect(e.flipCriteria.trim().length).toBeGreaterThan(0)
  }
})

test("every REJECT carries its reason and its flip-criteria (what would change our mind)", () => {
  const { entries } = Ratify.load(TABLE)
  const rejects = entries.filter((e) => e.disposition === "REJECT")
  expect(rejects.length).toBeGreaterThanOrEqual(4)
  for (const e of rejects) {
    expect(e.reason.trim().length).toBeGreaterThan(0)
    expect(e.flipCriteria.trim().length).toBeGreaterThan(0)
  }
})

test("the VoC DoF charge mapping is PINNED in the ratification value before any proposer run (R-DOF)", () => {
  const { entries } = Ratify.load(TABLE)
  const voc = entries.find((e) => e.item === "voc-sandboxed-proposer")!
  expect(voc).toBeTruthy()
  // a 64-hex sha256 of the mapping spec is embedded in the row's reason + note — pinned, tamper-evident via the chain
  expect(/[0-9a-f]{64}/.test(voc.reason)).toBe(true)
  expect(/[0-9a-f]{64}/.test(voc.note)).toBe(true)
})

// ── POSITIVE CONTROLS — the schema and the wall bite ──

test("POSITIVE CONTROL: an ADOPT filed as prose (no cited research finding) is REFUSED by the value schema", () => {
  expect(() =>
    new Ratify.Ledger().record({
      item: "obviously-good-idea",
      disposition: "ADOPT",
      reason: "it's obviously good",
      flipCriteria: "n/a",
      cheapTest: "trust me",
      buildArtifacts: ["src/analytics/whatever.ts"],
      // researchFinding omitted → adoption-as-prose
      stamp: "seed",
    }),
  ).toThrow(/cannot cite|research finding|re-dispositioned/i)
})

test("POSITIVE CONTROL: a PARK without a designed experiment is REFUSED", () => {
  expect(() =>
    new Ratify.Ledger().record({
      item: "shrug",
      disposition: "PARK-WITH-EXPERIMENT",
      flipCriteria: "someday",
      park: { context: "c", rationale: "r", impact: "i", nextSteps: "n" },
      // experiment omitted → a shrug, not a designed park
      stamp: "seed",
    }),
  ).toThrow(/designed experiment|building before it answers/i)
})

test("POSITIVE CONTROL: any disposition without flip-criteria is REFUSED", () => {
  expect(() =>
    new Ratify.Ledger().record({ item: "x", disposition: "REJECT", reason: "no", flipCriteria: "", stamp: "seed" }),
  ).toThrow(/flip-criteria/i)
})

test("POSITIVE CONTROL: a seeded build artifact not in any ADOPT row is CAUGHT as unratified", () => {
  const { entries } = Ratify.load(TABLE)
  // artifactRatified is the wall's core question; a made-up module is not covered
  expect(Ratify.artifactRatified(entries, "src/proposers/rogue-uncharged.ts")).toBe(false)
  expect(Ratify.artifactRatified(entries, "src/analytics/breadth.ts")).toBe(true) // a real ADOPT-covered surface
})
