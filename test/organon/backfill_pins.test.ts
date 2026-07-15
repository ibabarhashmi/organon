/**
 * ORGΛNON — THE BACKFILL SPRINT (V43), Phase 0: the pins are self-anchored, chain-tipped, and pin every V43 contract.
 *
 * The pins file is frozen at Phase 0; its pinsSha field is a self-hash (sha256 of the content minus that field). This proves:
 * (a) the file is self-consistent (S169, W-PR01 carried) — a post-Phase-0 edit breaks it; (b) it carries the true Provenance
 * head (04c606dd), read from disk, not the blueprint's prose; (c) the countable registry, the source map, the tier ladder, the
 * shed order, and the prev-marker snapshot are all pinned BEFORE a byte of Phase code. NO NEW LAW (an eighth sprint).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Pins } from "../../src/organon/pins"

const H = path.join(PKG_ROOT, "data", "honesty")
const PINS = JSON.parse(readFileSync(path.join(H, "backfill-pins.json"), "utf8"))
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

test("BACKFILL Phase 0 — the pins file stays SELF-CONSISTENT (S169 carried): sha256(content minus pinsSha) === pinsSha (a frozen historical head)", () => {
  const { pinsSha, ...rest } = PINS
  expect(sha256(JSON.stringify(rest))).toBe(pinsSha)
  // backfill-pins is a FROZEN historical head — its OWN self-hash stays valid (history does not drift), even though HEAD advanced
  const sh = Pins.selfHash("backfill-pins.json")
  expect(sh.file).toBe("backfill-pins.json")
  expect(sh.matches).toBe(true)
  expect(sh.recomputed).toBe(pinsSha)
})

test("BACKFILL Phase 0 — backfill-pins is now SUPERSEDED by reckoning-pins (V44): HEAD_FILE advanced, and the chain-tip guard BITES (the M-1 recurrence, caught)", () => {
  // V44 advanced the head — HEAD_FILE is reckoning-pins.json now (the arc moved one link forward)
  expect(Pins.HEAD_FILE).toBe("reckoning-pins.json")
  // backfill-pins is NO LONGER the tip — reckoning-pins carries from it (the chain-tip guard proves the supersession is real)
  const tip = Pins.headIsChainTip("backfill-pins.json")
  expect(tip.tip).toBe(false)
  expect(tip.supersededBy).toBe("reckoning-pins.json")
})

test("BACKFILL Phase 0 — carries the TRUE Provenance head (04c606dd), READ FROM DISK, and the guard asserts Provenance carries Variant", () => {
  const prov = JSON.parse(readFileSync(path.join(H, "provenance-pins.json"), "utf8"))
  expect(PINS.carriedFromPinsSha).toBe(prov.pinsSha) // read from disk, not typed
  expect(PINS.carriedFromPinsSha.slice(0, 8)).toBe("04c606dd")
  expect(prov.carriedFromPinsSha.slice(0, 8)).toBe("eb64cebe") // the chain the sprint assumed (the throw-guard's premise)
  expect(PINS.chain).toContain("04c606dd (Provenance) ← eb64cebe (Variant)")
})

test("BACKFILL Phase 0 — NO NEW LAW (an EIGHTH sprint): 17 laws, 0 minted, X-DERIVE's totality clause named", () => {
  expect(PINS.noNewLaw.laws).toBe(17)
  expect(PINS.noNewLaw.minted).toBe(0)
  expect(PINS.noNewLaw.sprintsWithoutALaw).toBe(8)
  expect(PINS.carried.lawsThisSprint).toMatch(/ZERO/)
  // the totality clause — the fix is X-DERIVE under-applied (a producer must be TOTAL over its domain), not a new law
  expect(JSON.stringify(PINS.noNewLaw.theTotalityClause)).toMatch(/TOTAL over its domain/)
})

test("BACKFILL Phase 0 — the COUNTABLE REGISTRY (DD-81) enumerates every cross-sprint countable, each with a reconciliation TYPE", () => {
  const reg = PINS.delegatedDecisions.DD81.countables
  expect(reg.length).toBeGreaterThanOrEqual(15)
  const types = new Set(reg.map((c: { type: string }) => c.type))
  // all four reconciliation types are represented (F-4/RP-4 — a ratio is not forced through an additive reconciler)
  expect(types.has("ADDITIVE")).toBe(true)
  expect(types.has("PARTITION")).toBe(true)
  expect(types.has("DERIVED")).toBe(true)
  expect(types.has("INVARIANT")).toBe(true)
  // the census is a PARTITION; deps/screens/laws are INVARIANT; guardEfficacy is DERIVED
  expect(reg.find((c: { key: string }) => c.key === "census").type).toBe("PARTITION")
  expect(reg.find((c: { key: string }) => c.key === "deps").type).toBe("INVARIANT")
  expect(reg.find((c: { key: string }) => c.key === "guardEfficacy").type).toBe("DERIVED")
})

test("BACKFILL Phase 0 — the PREV MARKER snapshot pins the V42 terminal countables (the F-1/RP-1 diff runs against this)", () => {
  const pm = PINS.prevMarker.countables
  expect(pm["battery.pass"]).toBe(1941)
  expect(pm["census.demonstrated"]).toBe(89)
  expect(pm["census.total"]).toBe(170)
  expect(pm["ownArchive.realDerived"]).toBe(0) // born length-zero
  expect(pm.deps).toBe(2)
  expect(pm.laws).toBe(17)
})

test("BACKFILL Phase 0 — the SOURCE MAP (DD-83) states the source + observableType per subject (probed live before design)", () => {
  const subj = PINS.delegatedDecisions.DD83.subjects
  // rETH/ETH — a genuinely rate-space Chainlink feed (ground truth beat DD-83's 'rates are not on Chainlink' hypothesis)
  expect(subj["reth-eth-exchange-rate"].source).toBe("Chainlink getRoundData")
  expect(subj["reth-eth-exchange-rate"].observableType).toBe("exchange-rate")
  // Aave — forward-only (not on Chainlink; the subgraph is dead — F-4/RP-4 confirmed live)
  expect(subj["aave-v3-usdc-supply"].source).toBe("forward-only")
  // FRAX/USD — the S187 price negative control
  expect(subj["frax-usd-price"].observableType).toBe("price")
})

test("BACKFILL Phase 0 — the TIER LADDER (DD-84) is pinned: REAL★ > REAL-DERIVED > REAL@ts > RETROSPECTIVE", () => {
  expect(PINS.delegatedDecisions.DD84.ladder).toEqual(["REAL★", "REAL-DERIVED", "REAL@ts", "RETROSPECTIVE"])
})

test("BACKFILL Phase 0 — deps stay 2 (DD-85), the getRoundData selector pinned; screens 3; familyN 1; no daemon", () => {
  expect(PINS.delegatedDecisions.DD85.deps).toBe(2)
  expect(PINS.delegatedDecisions.DD85.selector).toBe("0x9a6fc8f5") // getRoundData(uint80)
  expect(PINS.carried.deps).toEqual(["hono", "zod"])
  expect(PINS.carried.screens.length).toBe(3)
  expect(PINS.carried.familyN).toBe(1)
})

test("BACKFILL Phase 0 — the SHED ORDER is pinned: 1,3,4 NEVER shed; then 5; then 2", () => {
  expect(PINS.shedOrder.neverShed).toEqual(["1_continuityTotal", "3_backfillEngine", "4_tierLadder"])
  expect(PINS.shedOrder.shedOrderIfNeeded).toEqual(["5_ownLeg", "2_carriedHistoricalAudit"])
})

test("BACKFILL Phase 0 — the walls S180–S189 are pinned, each with a W-BF tag", () => {
  expect(PINS.walls.built).toEqual(["S180", "S181", "S182", "S183", "S184", "S185", "S186", "S187", "S188", "S189"])
  for (const w of PINS.walls.built) expect(PINS.walls[w]).toMatch(/W-BF\d{2}/)
})

test("BACKFILL Phase 0 — D87–D89 are RESERVED (Operator-signed=false, LN5); MR13 CLOSED (eighth sprint)", () => {
  expect(PINS.deviations.D87).toMatch(/RESERVED.*Operator-signed=false/)
  expect(PINS.deviations.D88).toMatch(/RESERVED.*Operator-signed=false/)
  expect(PINS.deviations.D89).toMatch(/RESERVED.*Operator-signed=false/)
  expect(PINS.deviations.mr13).toMatch(/CLOSED/) // MR13 discharged, not carried a ninth time
})

test("BACKFILL Phase 0 — newProductCapability is 1 (the backfill engine), DISCLOSED not a Halt; the bundle prefix carried", () => {
  expect(PINS.carried.newProductCapability).toBe(1)
  expect(PINS.carried.evidenceBundleShaPrefix).toBe("9c1e7bd8")
})
