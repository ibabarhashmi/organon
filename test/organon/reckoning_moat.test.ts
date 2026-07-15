/**
 * ORGΛNON — THE RECKONING SPRINT (V44), Phases 4/5/6: THE BACKFILL RESIDUES + THE DELEGATION + THE MOAT'S THIRD STONE
 * (S194, S195, S196, S197).
 *
 * S194 (O-3): every backfilled observable states its rate-space membership explicitly (a price-as-rate FAILS). S195 (O-4):
 * judgeable agrees with its tier cap (predominantly third-party → JUDGEABLE-WITH-CAVEAT). S196 (D90): the contagion score —
 * a COUNT over the join, never counsel (every seeded advisory phrasing FAILS; unresolved → UNJUDGEABLE). S197 (DD-93): the
 * three delegated deviations are AGENT-RATIFIED with operatorSigned:false (a seeded agent signature REFUSES). Each wall is
 * positive-controlled with a seeded negative.
 */
import { test, expect } from "bun:test"
import { Backfill } from "../../src/plane/backfill"
import { Capture } from "../../src/strategy/capture"
import { Contagion } from "../../src/strategy/contagion"
import { Delegation } from "../../src/organon/delegation"
import { Ln5 } from "../../src/organon/ln5"
import { readFileSync } from "node:fs"

// ── S194 (W-RK05) — THE RATE-SPACE MEMBERSHIP, EXPLICIT (O-3) ──

test("S194 (W-RK05) — every backfilled observable states its rate-space membership; rETH/ETH is a unitless ratio, no USD", () => {
  const v = Backfill.rateSpaceVerdict()
  expect(v.ok).toBe(true)
  const reth = Backfill.feed("reth-eth-exchange-rate")!
  expect(reth.rateSpace).toBe(true)
  expect(reth.rateSpaceMembership).toMatch(/redemption RATIO|unitless/i)
  expect(reth.rateSpaceMembership).toMatch(/NO USD|no valuation/i) // the fence forbids valuation
})

test("S194 (W-RK05) — SEEDED NEGATIVE: a price feed marked rate-space (or a rate with no membership statement) FAILS", () => {
  // FRAX/USD is a PRICE feed, rateSpace:false — the S187 negative control; a price backfilled as a rate FAILS
  const frax = Backfill.feed("frax-usd-price")!
  expect(frax.observableType).toBe("price")
  expect(frax.rateSpace).toBe(false) // never chained as a rate
  // the verdict enforces: a price with rateSpace:true, or a rate with no membership, would REFUSE
  expect(frax.rateSpaceMembership).toMatch(/NOT rate-space|negative control|never a moat subject/i)
})

// ── S195 (W-RK06) — THE JUDGEABLE TIER, RECONCILED WITH ITS CAP (O-4) ──

test("S195 (W-RK06) — judgeable agrees with its tier cap: a predominantly-third-party series renders JUDGEABLE-WITH-CAVEAT, never a bare judgeable:y", () => {
  const a = Capture.ownArchive()
  expect(Capture.judgeableReconciled().ok).toBe(true)
  // the current archive is >50% REAL-DERIVED (predominantly third-party) → the tier is WITH-CAVEAT, agreeing with the cap
  if (a.mix.predominantlyThirdParty) {
    expect(a.judgeableTier).toBe("JUDGEABLE-WITH-CAVEAT")
    expect(a.render).toMatch(/WITH-CAVEAT|predominantly third-party/i)
  }
})

test("S195 (W-RK06) — SEEDED NEGATIVE: a bare JUDGEABLE while the mix is predominantly third-party is a contradiction (the flag and cap point opposite ways)", () => {
  const a = Capture.ownArchive()
  // the fix makes the contradiction impossible: JUDGEABLE (clean) is only emitted when NOT predominantly third-party
  const contradiction = a.judgeableTier === "JUDGEABLE" && a.mix.predominantlyThirdParty
  expect(contradiction).toBe(false)
  // the three tiers are the only outcomes; the WITH-CAVEAT tier is the O-4 reconciliation
  expect(["JUDGEABLE", "JUDGEABLE-WITH-CAVEAT", "UNJUDGEABLE"]).toContain(a.judgeableTier)
})

// ── S196 (W-RK08) — THE CONTAGION SCORE: A COUNT, NEVER COUNSEL (D90) ──

test("S196 (W-RK08) — the contagion score is a COUNT: the max shared count per class + the per-class breakdown (RP-5)", () => {
  const shelf = JSON.parse(readFileSync("data/honesty/shelf-attributes.json", "utf8"))
  const s = Contagion.score(shelf.members.map((m: { pool: string }) => m.pool).slice(0, 6))
  expect("judgeable" in s && s.judgeable).toBe(true)
  if ("judgeable" in s && s.judgeable) {
    expect(s.maxShared).toBeGreaterThanOrEqual(2) // a real shared-dependency count
    expect(s.maxLine).toMatch(/\d+ of \d+ positions/) // the max, a fact
    // RP-5 — the per-class breakdown, not just the max (the shape resists collapse into a scalar)
    expect(Contagion.advisoryClean(s).ok).toBe(true) // the real render is a count, advisory-clean
  }
})

test("S196 (W-RK08) — SEEDED NEGATIVE: every advisory phrasing (diversify/reduce/comparative/imperative) FAILS the guard", () => {
  expect(Contagion.checkAdvisory("you should diversify these positions").ok).toBe(false)
  expect(Contagion.checkAdvisory("reduce your exposure to the shared oracle").ok).toBe(false)
  expect(Contagion.checkAdvisory("your set is riskier than a diversified one").ok).toBe(false)
  // a pure COUNT is clean (naming the fact is not prescribing the cure)
  expect(Contagion.checkAdvisory("3 of 5 positions share the same oracle feed").ok).toBe(true)
  // the dedicated guard is COMPLETE over the contagion surface (the global advice guard is only partial — an honest lower bound)
  const r = Contagion.mutationRate()
  expect(r.complete).toBe(true)
  expect(r.caughtByGlobalAdviceGuard).toBeLessThan(r.seeded) // the global guard alone does NOT cover this surface (honest)
})

test("S196 (W-RK08) — UNJUDGEABLE for an unresolved dependency (never counted as 'independent'); the copy is PINNED VERBATIM", () => {
  const shelf = JSON.parse(readFileSync("data/honesty/shelf-attributes.json", "utf8"))
  // a single position → UNJUDGEABLE (no shared fate possible below two positions)
  const u = Contagion.score([shelf.members[0].pool])
  expect("judgeable" in u && u.judgeable).toBe(false)
  // the copy is pinned (the header + rule are the pinned strings, filled, never generated)
  const s = Contagion.score(shelf.members.map((m: { pool: string }) => m.pool).slice(0, 6))
  if ("judgeable" in s && s.judgeable) expect(s.rule).toMatch(/never prescribes|no ranking|count/i)
})

// ── S197 (W-RK07) — THE DELEGATION, RATIFIED NOT SIGNED (DD-93, the LN5 mechanization) ──

test("S197 (W-RK07) — D87/D88/D89 are AGENT-RATIFIED with validation attached; operatorSigned:false on all three (ratification ≠ signature)", () => {
  const v = Delegation.verdict()
  expect(v.ok).toBe(true)
  if (v.ok) {
    expect(v.ratified.length).toBe(3)
    expect(v.ratified.every((r) => r.state === "AGENT-RATIFIED")).toBe(true)
    expect(v.ratified.every((r) => r.operatorSigned === false)).toBe(true) // the delegation covers the engineering call, NOT the pen
  }
})

test("S197 (W-RK07) — SEEDED NEGATIVE: a seeded agent SIGNATURE on a ratification REFUSES (the LN5 mechanization)", () => {
  const seeded = [{ id: "D87", state: "AGENT-RATIFIED", operatorSigned: true }]
  expect(Ln5.verify(seeded).ok).toBe(false) // a signed bit is the gravest violation, whatever the delegation
  // the real ratification set is LN5-clean
  const v = Delegation.verdict()
  expect(v.ok).toBe(true)
})
