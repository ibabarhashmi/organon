/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 3 (S146, D70) + Phase 4 (S147) walls.
 *
 * S146 — oracle-staleness + utilization-ceiling: the SIXTH and SEVENTH exit kinds, deterministic, tiered, UNJUDGEABLE without
 * capture, NO price; the coverage number emitted honestly (a SHELF proxy for an UNMEASURABLE bar, RP-6). The curator-loss #1
 * root cause — an oracle that kept reporting $1 while the asset collapsed — becomes a pre-registrable kill-condition.
 *
 * S147 — the combinator algebra: the seven kinds reduce to THREE combinators; ADDITIVE OR IT DOES NOT SHIP (two-sided —
 * lineage ids AND exit evaluations byte-identical, including UNJUDGEABLE); NON-EXECUTABLE BY TYPE (X-ADVICE by the type system).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { ExitCriterion } from "../../src/strategy/exit"
import { Algebra } from "../../src/strategy/algebra"
import { Manifest } from "../../src/strategy/manifest"
import { StrategyStore } from "../../src/strategy/store"

const feeds = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "oracle-feeds.json"), "utf8"))
const trigger = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "algebra-trigger.json"), "utf8"))

// ── S146 — the sixth + seventh kinds ────────────────────────────────────────────────────────────────────────────────────
test("S146 (D70) — oracle-staleness is a TEMPORAL observable from a REAL captured Chainlink updatedAt; seconds, never a price", () => {
  const feed = feeds.feeds["USDC/USD"]
  const s = ExitCriterion.oracleStaleness({ updatedAt: feed.updatedAt }, feeds.referenceNow)
  expect(typeof s.seconds).toBe("number")
  expect(s.seconds).toBeGreaterThanOrEqual(0) // seconds since the oracle last updated — a real number over real data
  expect(s.why).toMatch(/temporal|seconds/) // SEEDED NEGATIVE: it is a temporal count, NEVER a USD value
  expect(s.why).not.toMatch(/\$|USD|price/) // no price crosses this axis (the valuation ban is untouched)
  // the kind REGISTERS + EVALUATES
  const reg = ExitCriterion.register({ kind: "oracle-staleness", threshold: 86400, subjectScope: "USDC" })
  expect(reg.ok).toBe(true)
  const ev = ExitCriterion.evaluate({ kind: "oracle-staleness", threshold: 86400, subjectScope: "USDC" }, { oracleStalenessS: 100000 })
  expect(ev.fired).toBe(true) // 100000s ≥ 86400s → FIRED
})

test("S146 — utilization-ceiling is a DIMENSIONLESS ratio; UNJUDGEABLE without both inputs (missing stays missing)", () => {
  const u = ExitCriterion.utilization(950, 1000)
  expect(u.ratio).toBeCloseTo(0.95, 4)
  expect(u.why).not.toMatch(/\$|USD|price/) // dimensionless — no value
  // SEEDED NEGATIVE — no captured inputs → UNJUDGEABLE (never a fabricated ratio)
  expect(ExitCriterion.utilization(null, 1000).ratio).toBeNull()
  expect(ExitCriterion.evaluate({ kind: "utilization-ceiling", threshold: 0.95, subjectScope: "x" }, {}).judgeable).toBe(false)
})

test("S146 (RP-6) — the coverage number is emitted honestly: n/1284 SHELF, a PROXY for an UNMEASURABLE bar (positions held: 0)", () => {
  expect(feeds.coverage.resolvableOracleFeeds).toBeGreaterThan(0)
  expect(feeds.coverage.totalPoolUniverse).toBe(1284)
  expect(feeds.coverage.note).toMatch(/PROXY/)
  expect(feeds.coverage.note).toMatch(/positions held: 0/)
  expect(feeds.coverage.note).toMatch(/UNMEASURABLE/)
  // D73 — the RPC exposure recorded; D42 dissolved under D51
  expect(feeds.d73_rpcExposure).toMatch(/RPC/)
  expect(feeds.d73_rpcExposure).toMatch(/D42 dissolved/)
})

test("S146 — the feeds are REAL, content-hashed (block-pinned Chainlink reads, tier REAL★, not fabricated)", () => {
  expect(feeds.tier).toBe("REAL★")
  const core = { feeds: feeds.feeds, utilization: feeds.utilization }
  expect(createHash("sha256").update(JSON.stringify(core)).digest("hex")).toBe(feeds.coreSha)
  for (const pair of Object.keys(feeds.feeds)) expect(feeds.feeds[pair].capturedAtBlock).toBeGreaterThan(25_000_000) // a real recent block
})

test("S146 (D70) — the exit set reached SEVEN and the trigger FIRED, recorded as a FACT with its hash (never an instruction)", () => {
  expect(Manifest.EXIT_KINDS.length).toBe(7)
  expect(trigger.trigger.fired).toBe(true)
  expect(trigger.exitSet.after).toBe(7)
  expect(trigger.exitSet.closedAt).toBe(7)
})

// ── S147 — the combinator algebra ──────────────────────────────────────────────────────────────────────────────────────
const MATRIX: { c: Manifest.ExitCriterion; facts: ExitCriterion.Facts }[] = [
  { c: { kind: "peg-floor", threshold: 0.995, subjectScope: "x" }, facts: { peg: 0.98 } },
  { c: { kind: "peg-floor", threshold: 0.995, subjectScope: "x" }, facts: { peg: 0.999 } },
  { c: { kind: "peg-floor", threshold: 0.995, subjectScope: "x" }, facts: {} }, // UNJUDGEABLE
  { c: { kind: "funding-flip-count", threshold: 3, subjectScope: "x" }, facts: { fundingNegPeriods: 5 } },
  { c: { kind: "funding-flip-count", threshold: 3, subjectScope: "x" }, facts: {} }, // UNJUDGEABLE
  { c: { kind: "tvl-drawdown", threshold: 0.3, subjectScope: "x" }, facts: { tvlDrawdown: 0.5 } },
  { c: { kind: "governance-change", threshold: 0, subjectScope: "x" }, facts: { governanceChanged: true } },
  { c: { kind: "governance-change", threshold: 0, subjectScope: "x" }, facts: {} }, // UNJUDGEABLE
  { c: { kind: "concentration-ceiling", threshold: 0.25, subjectScope: "x" }, facts: { concentrationShare: 0.5 } },
  { c: { kind: "oracle-staleness", threshold: 86400, subjectScope: "x" }, facts: { oracleStalenessS: 100000 } },
  { c: { kind: "oracle-staleness", threshold: 86400, subjectScope: "x" }, facts: {} }, // UNJUDGEABLE
  { c: { kind: "utilization-ceiling", threshold: 0.95, subjectScope: "x" }, facts: { utilizationRatio: 0.99 } },
]

test("S147 — ADDITIVE (two-sided): every fixture exit evaluation BYTE-IDENTICAL on the decision (fired + judgeable), including UNJUDGEABLE", () => {
  for (const { c, facts } of MATRIX) {
    const a = Algebra.evaluate(Algebra.compile(c), facts)
    const b = ExitCriterion.evaluate(c, facts)
    expect({ kind: c.kind, fired: a.fired, judgeable: a.judgeable }).toEqual({ kind: c.kind, fired: b.fired, judgeable: b.judgeable })
  }
})

test("S147 — the algebra touches NO manifest identity: a manifest's lineage id is unchanged by the algebra's existence (side i)", () => {
  const m = { schemaVersion: 1, positions: [{ subjectKey: "lending:aave-v3:USDC:ethereum", size: 1000 }], thesis: "carry", exitCriterion: { kind: "peg-floor", threshold: 0.995, subjectScope: "portfolio" } }
  // compiling to the algebra and back does not touch the manifest — the id is a pure function of the manifest identity
  const id1 = StrategyStore.lineageId(m as never)
  Algebra.compile(m.exitCriterion as never) // the algebra reads the criterion; it never mutates the manifest
  expect(StrategyStore.lineageId(m as never)).toBe(id1)
})

test("S147 — SEEDED NEGATIVE: a WRONG composition (peg-floor compiled with >= instead of <) DISAGREES with evaluate — the two-sided wall catches drift", () => {
  const c: Manifest.ExitCriterion = { kind: "peg-floor", threshold: 0.995, subjectScope: "x" }
  const facts = { peg: 0.98 } // below the floor → peg-floor FIRES (0.98 < 0.995)
  const correct = Algebra.evaluate(Algebra.compile(c), facts)
  expect(correct.fired).toBe(true) // the correct composition agrees with evaluate
  // a seeded WRONG composition (>= instead of <) would say NOT FIRED (0.98 >= 0.995 is false) — a drift the wall catches
  const wrong = Algebra.evaluate(Algebra.when({ name: "peg", read: (f) => f.peg ?? null }, ">=", 0.995), facts)
  expect(wrong.fired).toBe(false)
  expect(wrong.fired).not.toBe(correct.fired) // serialization identity WITHOUT evaluation identity is a trap — caught
})

test("S147 — NON-EXECUTABLE BY TYPE: a Condition is {combinator, obs, op, threshold} — no order/trade/action; X-ADVICE by the type system", () => {
  for (const { c } of MATRIX) {
    const cond = Algebra.compile(c)
    expect(Algebra.isNonExecutable(cond)).toBe(true)
    expect(JSON.stringify(cond)).not.toMatch(/execute|order|trade|place|swap|"action"/i)
  }
})

test("S147 — the reduction: seven hard-coded kinds → THREE combinators (when · count · changed); the algebra SHIPPED (not frozen)", () => {
  const combs = new Set(MATRIX.map((m) => Algebra.compile(m.c).combinator))
  expect([...combs].sort()).toEqual(["changed", "count", "when"])
  expect(trigger.algebra.shipped).toBe(true)
  expect(trigger.algebra.frozenAtSeven).toBe(false) // it shipped → the set is not frozen; a future eighth kind goes through the algebra
  expect(trigger.algebra.additiveTwoSided).toMatch(/byte-identical/i)
})
