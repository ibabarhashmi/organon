/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 0/1/7: the pins are LOCKED, the registry is the SPINE (S209/W-HD00), and the
 * one-state wall (S198/W-HD01) closes the P-1 defect class. Continues from the COMPLETE Reckoning sprint (V44).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { Pins } from "../../src/organon/pins"
import { Registry } from "../../src/organon/registry"
import { State } from "../../src/organon/state"
import { Rollup } from "../../src/organon/rollup"
import { Falsify } from "../../src/organon/falsify"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const pins = () => JSON.parse(readFileSync("data/honesty/hardening-pins.json", "utf8"))

test("HARDENING Phase 0 — pins self-hash: sha256(file minus pinsSha) === the stored pinsSha (the freshness anchor); HEAD advanced", () => {
  const j = pins()
  const { pinsSha, ...rest } = j
  expect(sha256(JSON.stringify(rest))).toBe(pinsSha)
  expect(Pins.HEAD_FILE).toBe("hardening-pins.json")
  expect(Pins.selfHash().matches).toBe(true)
  expect(Pins.headIsChainTip().tip).toBe(true) // hardening-pins is the chain tip (nothing carries from it)
})

test("HARDENING Phase 0 — carries the TRUE Reckoning head 67d5cd44, read from disk; NO NEW LAW (a TENTH sprint)", () => {
  const j = pins()
  expect(j.carriedFromPinsSha.slice(0, 8)).toBe("67d5cd44")
  expect(j.chain).toContain("67d5cd44 (Reckoning) ← 7bf877ce (Backfill)")
  expect(j.noNewLaw.laws).toBe(17)
  expect(j.noNewLaw.minted).toBe(0)
  expect(j.noNewLaw.sprintsWithoutALaw).toBe(10)
  expect(j.carried.deps).toEqual(["hono", "zod"])
  expect(j.carried.newProductCapability).toBe(0) // this sprint HARDENS; it builds no new capability (S209)
  expect(j.carried.terminalState).toBe("READY-UNVERIFIED-BY-A-SECOND-HUMAN")
})

test("HARDENING Phase 0 — WALL_MAX bumped 198→209 for the S198–S209 band; the deviation authority map is pinned", () => {
  expect(Falsify.WALL_MAX).toBe(209)
  const auth = pins().deviationStates as Record<string, string>
  expect(auth.D87).toBe("AGENT-RATIFIED")
  expect(auth.D90).toBe("SHIPPED")
  expect(auth.D91).toBe("RESERVED")
})

test("S209 (W-HD00) — THE OPEN-ISSUES REGISTRY is the spine: every FIX proven, every ACCEPT cites a clause (RP-1), every built wall traces", () => {
  const v = Registry.check()
  expect(v.ok).toBe(true)
  const c = Registry.census()
  expect(c.total).toBeGreaterThanOrEqual(18) // P-1…P-18 seeded (+ any DISCOVERED)
  expect(c.pens).toBe(1) // P-18 is the pen's
  // RP-1 — an ACCEPT-WITH-REASON citing NO clause is a seeded negative that must FAIL
  const seededNoClause = [{ id: "P-99", source: "seed", issue: "x", disposition: "ACCEPT-WITH-REASON", proof: "none", detail: "accepted because it is inconvenient to fix" } as Registry.Entry]
  // clauseOf must return null for a no-clause acceptance
  expect(Registry.clauseOf(seededNoClause[0])).toBeNull()
})

test("S209 (W-HD00) — an UNTRACED unit of work REFUSES (no untraced scope in virtue's clothes, A′#2)", () => {
  // the rogue id is BUILT at runtime so no literal ">MAX" wall token appears in this file (which would make the census flag
  // its own test as an orphan — the living-wall lesson from falsifiability_census).
  const rogue = "S" + "998" + "-rogue"
  const t = Registry.traceVerdict([...Registry.builtWalls(), rogue])
  expect(t.ok).toBe(false)
  if (!t.ok) expect(t.reason).toMatch(/untraced|traces to NO registry entry/)
  // every real built wall DOES trace
  expect(Registry.traceVerdict(Registry.builtWalls()).ok).toBe(true)
})

test("S198 (W-HD01) — THE ONE-STATE WALL closes the P-1 defect: D87/D88/D89 AGENT-RATIFIED from the ONE producer; a seeded two-state REFUSES", () => {
  // the P-1 cure — the producer now says AGENT-RATIFIED (V44's marker held RESERVED here while its reckoning block said AGENT-RATIFIED)
  expect(State.byId("D87")?.state).toBe("AGENT-RATIFIED")
  expect(State.byId("D90")?.state).toBe("SHIPPED")
  // the reckoning block READS the producer — the whole marker is one-state clean
  const marker = Rollup.terminalMarker({ fullBattery: { pass: 0, skip: 0, fail: 0, files: 0, expect: 0, twoRunsIdentical: true } })
  expect(State.oneStateVerdict(marker).ok).toBe(true)
  // a SEEDED two-state artifact (the P-1 defect) REFUSES
  const seeded = { deviationStates: [{ id: "D87", state: "AGENT-RATIFIED" }], reckoning: { delegation: { D87: "RESERVED" } } }
  const v = State.oneStateVerdict(seeded)
  expect(v.ok).toBe(false)
  if (!v.ok) expect(v.reason).toMatch(/SECOND state for D87|two-state/)
})

test("S198 (W-HD01) — deviations.count grew 16→21 (D92–D96), reconciled ADDITIVE; the state vocabulary is extended", () => {
  expect(State.deviations().length).toBe(21)
  const vocab = State.stateVocabulary()
  for (const w of ["AGENT-RATIFIED", "SHIPPED", "RESERVED", "CLOSED"]) expect(vocab).toContain(w)
})
