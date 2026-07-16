/**
 * ORGΛNON — THE RECKONING SPRINT (V44), Phase 0: the pins are LOCKED, self-consistent, and carry the true V43 head.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import { Pins } from "../../src/organon/pins"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const pins = () => JSON.parse(readFileSync("data/honesty/reckoning-pins.json", "utf8"))

test("Phase 0 — RECKONING pins self-hash: sha256(file minus pinsSha) === the stored pinsSha (the freshness anchor)", () => {
  const j = pins()
  const { pinsSha, ...rest } = j
  expect(sha256(JSON.stringify(rest))).toBe(pinsSha)
  // HARDENING V45 — reckoning-pins is SUPERSEDED; HEAD_FILE advanced to hardening-pins.json (the arc moved one link forward).
  // reckoning-pins stays self-consistent (its own selfHash still matches — the record is immutable), but it is no longer HEAD.
  expect(Pins.HEAD_FILE).toBe("hardening-pins.json")
  expect(Pins.selfHash("reckoning-pins.json").matches).toBe(true)
})

test("Phase 0 — the chain carries the TRUE V43 (Backfill) head 7bf877ce, read from disk", () => {
  const j = pins()
  expect(j.carriedFromPinsSha.slice(0, 8)).toBe("7bf877ce")
  // HARDENING V45 — reckoning-pins is NO LONGER the tip (hardening-pins carries from it); the M-1 chain-tip guard BITES.
  const tip = Pins.headIsChainTip("reckoning-pins.json")
  expect(tip.tip).toBe(false)
  expect(tip.supersededBy).toBe("hardening-pins.json")
})

test("Phase 0 — NO NEW LAW (a NINTH sprint); 17 laws, 0 minted; deps 2, screens 3", () => {
  const j = pins()
  expect(j.noNewLaw.laws).toBe(17)
  expect(j.noNewLaw.minted).toBe(0)
  expect(j.noNewLaw.sprintsWithoutALaw).toBe(9)
  expect(j.carried.deps).toEqual(["hono", "zod"])
  expect(j.carried.screens.length).toBe(3)
})

test("Phase 0 — the delegated decisions DD-88..DD-93 + the census two-identity + the contagion copy are pinned", () => {
  const dd = pins().delegatedDecisions
  expect(dd.DD88.expectedBreaks).toBe(0)
  expect(dd.DD89.formula).toMatch(/N_eff = clamp\(n \/ τ_int/)
  expect(dd.DD90.targetPSR).toBe(0.95)
  expect(dd.DD91.rule).toMatch(/CONSERVATION|two identities/)
  expect(dd.DD92.copyPinnedVerbatim.header).toMatch(/count, not a recommendation/)
  expect(dd.DD92.seededAdvisoryNegatives).toContain("diversify")
  expect(Object.keys(dd.DD93).filter((k) => k.endsWith("R")).length).toBeGreaterThanOrEqual(3)
})

test("Phase 0 — the prev marker is the V43 terminal (dem 100, total 180, battery 1991, deviations 14)", () => {
  const pm = pins().prevMarker.countables
  expect(pm["census.demonstrated"]).toBe(100)
  expect(pm["census.total"]).toBe(180)
  expect(pm["battery.pass"]).toBe(1991)
  expect(pm["deviations.count"]).toBe(14)
})

test("Phase 0 — walls S190–S197 pinned; shed order 1,2,3,6 never shed; F-1 ground truth recorded (bundle does NOT move)", () => {
  const j = pins()
  expect(j.walls.built).toEqual(["S190", "S191", "S192", "S193", "S194", "S195", "S196", "S197"])
  expect(j.shedOrder.neverShed).toEqual(["1_d33MathsHonest", "2_strictBar", "3_v43Defects", "6_contagion"])
  // the F-1 ground-truth divergence: the blueprint said the bundle moves; it does NOT (the Stamp is off it)
  expect(j.postImplementationRePins_partF.RP1_bundleGroundTruth).toMatch(/FACTUALLY WRONG|byte-identical|off the mass path/)
})
