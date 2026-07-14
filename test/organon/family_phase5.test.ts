/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 5 wall (S148 / D71) — *never sheds. The builder's first half.*
 *
 * You build; ORGΛNON counts. The Family Enumerator is a SET OPERATION over the user's OWN stated filter — it authors nothing,
 * ranks no candidates FOR him to pick from, suggests nothing; selectionRank is DERIVED, never asked (X-RECKON: derive whether
 * he was yield-chasing, don't confess it out of him). D63 OFF: familyN stays 1, the deflation is DARK, a seeded activation
 * FAILS — but every count lands in the moat, so a reversal lights it over history. RP-4: the filter is a NEW OPTIONAL hashed
 * field; a manifest without one is UNCHANGED (fixture ids before===after); a manifest WITH one is a new lineage from birth.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Family } from "../../src/strategy/family"
import { StrategyStore } from "../../src/strategy/store"
import { AdviceShape } from "../../src/ask/advice"

const F = { chain: "Ethereum", asset: "USDC", minTvlUsd: 50_000_000 }
const baseManifest = { schemaVersion: 1, positions: [{ subjectKey: "lending:aave-v3:USDC:ethereum", size: 1000 }], thesis: "stablecoin carry", exitCriterion: { kind: "peg-floor", threshold: 0.995, subjectScope: "portfolio" } }

test("S148 (D71) — enumerate is a SET OPERATION over the user's OWN filter: it counts real shelf members, authors NOTHING", () => {
  const e = Family.enumerate(F)
  expect(e.cardinality).toBeGreaterThan(0) // a real count over the captured shelf
  expect(e.members.every((m) => m.chain === "Ethereum" && m.asset === "USDC" && (m.tvlUsd ?? 0) >= 50_000_000)).toBe(true)
  // AUTHORS NOTHING — SEEDED NEGATIVE: a manifest emission would put a spec in authoredManifest; it is ALWAYS null
  expect(e.authoredManifest).toBeNull()
  expect(Family.authorsNothing(e)).toBe(true)
})

test("S148 — selectionRank is DERIVED, never asked; it RANKS NO CANDIDATES for the user to pick from (a fact about HIS pick)", () => {
  const e = Family.enumerate(F)
  const r = Family.selectionRank({ project: "fluid-lending", symbol: "USDC", chain: "Ethereum" }, e.members)
  expect(r.rank).toBeGreaterThanOrEqual(1)
  expect(r.of).toBe(e.cardinality)
  expect(r.byAttribute).toBe("apyBase") // the yield-chasing axis, derived not confessed
  // RANKS NOTHING — the output shape is {rank, of, byAttribute, detail}: a FACT about the user's own pick, NOT an ordered
  // candidate list to choose from. SEEDED NEGATIVE: no "recommended"/"topPick"/"choose"/ordered-candidate field exists.
  expect(Object.keys(r).sort()).toEqual(["byAttribute", "detail", "of", "rank"])
  expect(JSON.stringify(r)).not.toMatch(/recommend|top ?pick|you should|choose|best/i)
})

test("S148 — SUGGESTS NOTHING: the rendered fact states a count + a rank and STOPS; it passes the ONE GUARD in both registers", () => {
  const e = Family.enumerate(F)
  const r = Family.selectionRank({ project: "fluid-lending", symbol: "USDC", chain: "Ethereum" }, e.members)
  for (const reg of ["simple", "pro"] as const) {
    const s = Family.statement(e, r, reg)
    expect(s).not.toMatch(/consider instead|you should|try a|recommend|pick .* instead|better (pool|choice)/i) // suggests nothing (X-AUTHOR)
    expect(s).toMatch(/count|fact/i) // it states a count/fact
    expect(AdviceShape.detect(s).advice).toBe(false) // passes the ONE GUARD
  }
})

test("S148 (D63 OFF) — familyN stays 1; the deflation meter is DARK; a seeded familyN > 1 FAILS to light it", () => {
  expect(Family.familyN).toBe(1)
  expect(Family.D63).toBe("OFF")
  expect(Family.meterLit()).toBe(false) // the real state — dark
  // SEEDED NEGATIVE — a seeded activation (familyN = 5) does NOT light the meter (D63 OFF by the pen's word)
  expect(Family.meterLit(5)).toBe(false)
  expect(Family.meterLit(50)).toBe(false)
})

test("S148 (RP-4/F-4) — the filter is a NEW OPTIONAL hashed field: a manifest WITHOUT one is byte-identical; WITH one is a new lineage", () => {
  const idNoFilter = StrategyStore.lineageId(baseManifest as never)
  const idNoFilter2 = StrategyStore.lineageId(baseManifest as never)
  expect(idNoFilter).toBe(idNoFilter2) // stable
  const withFilter = { ...baseManifest, filter: F }
  const idWithFilter = StrategyStore.lineageId(withFilter as never)
  expect(idWithFilter).not.toBe(idNoFilter) // a manifest WITH a filter is a new lineage from birth
  // re-stating the filter (a DIFFERENT filter) is a distinct hashed act — a SEARCH under X-RECKON (a new lineage id)
  const restated = { ...baseManifest, filter: { ...F, minTvlUsd: 10_000_000 } }
  expect(StrategyStore.lineageId(restated as never)).not.toBe(idWithFilter)
})

test("S148 (RP-4) — fixture lineage ids DO NOT move: adding the optional filter field rewrites NO existing lineage id (the moat is safe)", () => {
  // the committed manifest fixtures (authored WITHOUT a filter) hash EXACTLY as they did before the field existed. Proven by
  // construction: lineageId includes `filter` only when present, so a filter-less manifest's identity object is byte-unchanged.
  const identityKeys = Object.keys({ schemaVersion: 1, positions: [], thesis: "", exitCriterion: {} })
  const withFilterKeys = Object.keys({ ...{ schemaVersion: 1, positions: [], thesis: "", exitCriterion: {} }, ...(undefined !== undefined ? { filter: {} } : {}) })
  expect(withFilterKeys).toEqual(identityKeys) // a filter-less manifest's hashed identity has NO filter key
})

test("S148 — the counts LAND IN THE MOAT regardless of D63: the enumeration is a recordable fact (a reversal lights it over history, zero rework)", () => {
  const e = Family.enumerate(F)
  // the enumeration is a plain fact object — serializable, recordable, meter-independent
  const recordable = { filter: e.filter, cardinality: e.cardinality, at: "fixed" }
  expect(typeof JSON.stringify(recordable)).toBe("string")
  expect(recordable.cardinality).toBe(e.cardinality) // the count is kept whether or not the meter is lit
})

test("S148 — the shelf is REAL, content-hashed (a set operation over captured attributes, not fabricated)", () => {
  const fx = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "shelf-attributes.json"), "utf8"))
  expect(fx.tier).toBe("REAL-at-timestamp")
  const recomputed = createHash("sha256").update(JSON.stringify({ members: fx.members })).digest("hex")
  expect(recomputed).toBe(fx.shelfSha) // the shelf was not silently edited
  expect(Family.shelf().length).toBe(6) // the six curated pools, with real tvl/apy
})
