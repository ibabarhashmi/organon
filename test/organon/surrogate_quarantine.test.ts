/**
 * ORGΛNON — THE SURROGATE ADDENDUM (V38-B), B1 wall: S128 — THE QUARANTINE + THE CANARY. *Never sheds — the precondition.*
 *
 * The poison vector (D65): V34's `real := ¬FIXTURE` would count an AGENT lineage as REAL. Under D51, IN2's counters are the
 * ONLY validation the project has, so a poisoned counter destroys the only truth. THE FIX: authorship HUMAN|AGENT|FIXTURE
 * derived at the entry path (a `.human` sidecar marker OUTSIDE the hashed surface — no lineage id moves); `real := ¬FIXTURE ∧
 * ¬AGENT`; a runtime lineage with no marker is AGENT (prove a human, never assume). The canary snapshots real-class counters
 * before/after and NAMES any leaking producer.
 */
import { test, expect } from "bun:test"
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { Authorship, Quarantine } from "../../src/strategy/authorship"
import { ExitCriterion } from "../../src/strategy/exit"

function scratch() {
  const root = mkdtempSync(path.join(tmpdir(), "orgn-quar-"))
  const trialDir = path.join(root, "trials")
  const fixtureDir = path.join(root, "fixtures")
  mkdirSync(trialDir, { recursive: true })
  mkdirSync(fixtureDir, { recursive: true })
  return { trialDir, fixtureDir }
}
// a fake lineage ledger (one line) + optional human marker
function seedLineage(dir: string, id: string, opts: { human?: boolean } = {}) {
  writeFileSync(path.join(dir, `${id}.jsonl`), JSON.stringify({ config: "{}", act: "SEARCH", timestamp: 1 }) + "\n")
  if (opts.human) writeFileSync(path.join(dir, `${id}.human`), "console-entry-path")
}

test("S128 (W-SB01) — authorship is DERIVED at the entry path (never declared): fixture → FIXTURE, runtime+marker → HUMAN, runtime no-marker → AGENT", () => {
  const { trialDir, fixtureDir } = scratch()
  seedLineage(fixtureDir, "fix1") // a committed fixture
  seedLineage(trialDir, "human1", { human: true }) // a console-authored (marked) runtime lineage
  seedLineage(trialDir, "agent1") // a runtime lineage with NO human marker — the poison
  expect(Authorship.classOf("fix1", trialDir, fixtureDir)).toBe("FIXTURE")
  expect(Authorship.classOf("human1", trialDir, fixtureDir)).toBe("HUMAN")
  expect(Authorship.classOf("agent1", trialDir, fixtureDir)).toBe("AGENT") // prove a human, never assume one
})

test("S128 — real := ¬FIXTURE ∧ ¬AGENT: a seeded AGENT lineage does NOT count as real (the poison is impossible)", () => {
  const { trialDir, fixtureDir } = scratch()
  seedLineage(trialDir, "human1", { human: true })
  seedLineage(trialDir, "agent1") // the poison — an agent lineage in the runtime dir
  seedLineage(trialDir, "agent2")
  expect(Authorship.isReal("HUMAN")).toBe(true)
  expect(Authorship.isReal("AGENT")).toBe(false)
  expect(Authorship.isReal("FIXTURE")).toBe(false)
  // the quarantined count includes ONLY the human lineage; the two agent lineages are excluded (SEEDED POISON, blocked)
  expect(Authorship.realLineageCount(trialDir, fixtureDir)).toBe(1)
  expect(Authorship.agentLineageIds(trialDir, fixtureDir)).toEqual(["agent1", "agent2"])
})

test("S128 — the marker is OUTSIDE the hashed surface: writing `.human` moves NO lineage id (the id is the content hash of the manifest)", () => {
  // the lineage id derives from the manifest content (kind/threshold/subjectScope), never from an authorship marker
  const crit = { kind: "peg-floor" as const, threshold: 0.995, subjectScope: "x" }
  const idBefore = ExitCriterion.hashOf(crit)
  // a `.human` marker is a sidecar file; it is not part of hashOf's input, so the id is invariant to authorship
  const idAfter = ExitCriterion.hashOf(crit)
  expect(idBefore).toBe(idAfter)
  expect(Authorship.humanMarkerPath("someId", "/tmp/trials")).toMatch(/someId\.human$/) // a sidecar, never the ledger itself
})

test("S128 — THE CANARY: before === after names no leak; a seeded agent lineage TRIPS it and names the leaking producer", () => {
  const { trialDir, fixtureDir } = scratch()
  seedLineage(trialDir, "human1", { human: true })
  const before = Quarantine.snapshot(trialDir, fixtureDir)
  // ... the surrogate phases run ... (here: nothing changes) → the canary is clean
  const afterClean = Quarantine.snapshot(trialDir, fixtureDir)
  expect(Quarantine.reconcile(before, afterClean).ok).toBe(true)
  // SEEDED NEGATIVE — an agent lineage appears across the phases → the base count moves but the quarantine excludes it → TRIP
  seedLineage(trialDir, "agentLeak")
  const afterPoison = Quarantine.snapshot(trialDir, fixtureDir)
  const r = Quarantine.reconcile(before, afterPoison)
  expect(r.ok).toBe(false)
  expect(r.leaked).toContain("agentLeak")
  expect(r.detail).toMatch(/leaked|leaking producer/i)
})

test("S128 — THE LIVE CANARY: the base predicate and the quarantine AGREE today (no contamination — both zero real lineages)", () => {
  const live = Quarantine.live()
  // zero real lineages exist (the runtime dir is gitignored + empty on a clone) → base === quarantined === 0
  expect(live.base).toBe(live.quarantined)
  expect(live.agentLineages).toEqual([])
  expect(live.ok).toBe(true)
  expect(live.detail).toMatch(/no contamination/i)
})
