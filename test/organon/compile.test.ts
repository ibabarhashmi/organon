/**
 * ORGΛNON — THE MANIFEST SPRINT, Phase 3 wall (COMPILED-HONESTLY; S71). COMPILE = COMPOSITION: the effective-bets fact
 * via the EXISTING correlate.ts (min-overlap-30 INSUFFICIENT propagates — never a thin decimal), the catch aggregation,
 * the worst-axis fact, the thesis-age gate, the exit evaluation. THE COMPILER JUDGES, NEVER AUTHORS — the seeded
 * suggested-allocation output is REFUSED (quoted); the advice wall is green on every composed line. A strategy of ONE
 * renders BYTE-IDENTICAL to the standalone Reality Check. NO aggregate verdict pill — the D38 absence is labeled.
 * Pure fixtures (deterministic; no network). Outputs SHOWN (CV3).
 */
import { test, expect } from "bun:test"
import { Scorecard } from "../../src/analytics/scorecard"
import { Domain } from "../../src/domain/types"
import { Reality } from "../../src/studio/reality"
import { Manifest } from "../../src/strategy/manifest"
import { StrategyCompile } from "../../src/strategy/compile"

const NOW = Date.parse("2026-07-12T00:00:00Z")

function facts(over: Partial<Scorecard.PoolFacts>): Scorecard.PoolFacts {
  return { name: "x", apyBase: 4, apyReward: 0, tvlSlope30d: 0.02, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: null, ...over }
}
function series(base: number, n = 32): { ts: number; value: number }[] {
  return Array.from({ length: n }, (_, i) => ({ ts: i * 86400000, value: base + i * 0.01 }))
}
function pos(over: Partial<StrategyCompile.Position>): StrategyCompile.Position {
  const f = facts((over.scored ? {} : {}) as Partial<Scorecard.PoolFacts>)
  return { subjectKey: "defillama:pool:x", size: 1000, units: "USDC", name: "x", scored: Scorecard.score(f), reachable: true, domain: "LENDING", series: [], exitFacts: {}, ...over }
}
const fundingCatch: Domain.Catch = { axis: "yield-source", domain: "STABLE-SYNTH", disposition: "info/context", tier: "SAMPLE", simple: "perp-funding carry", pro: "funding carry", numbers: { fundingCarryPct: 80, negativePeriods: 9, totalPeriods: 30 } }

function manifest(over: Partial<Manifest.T> = {}): Manifest.T {
  const r = Manifest.parse({ schemaVersion: 1, positions: [{ subjectKey: "defillama:pool:a", size: 1, units: "x" }], thesis: "blue-chip stable lending holds through a rate cut", exitCriterion: { kind: "peg-floor", threshold: 0.995, subjectScope: "portfolio" }, ...over })
  if (!r.ok) throw new Error(r.error)
  return r.manifest
}

test("COMPILE — S71: the advice wall REFUSES a seeded suggested-allocation output (the compiler judges, never authors)", () => {
  for (const authored of ["suggested weights: 60% aave, 40% spark", "rebalance into the higher-yield leg", "consider instead the sparklend pool", "you should allocate more to USDC", "here is the optimal weight split"]) {
    const g = StrategyCompile.guardLine(authored)
    expect(g.ok).toBe(false)
    if (!g.ok) console.log("  refused:", `"${authored}" → ${g.reason}`)
  }
  // a real composed fact line PASSES the same wall (it states correlation, never an allocation)
  expect(StrategyCompile.guardLine("These 3 positions' recorded yields cluster into ≈ 2 independent bets (31 shared points; ρ-matrix traced). info/context — a fact about correlation, never an allocation.").ok).toBe(true)
})

test("COMPILE — every emitted composed line is GREEN on the advice wall (the self-check bites if a line authored anything)", () => {
  const positions = [
    pos({ subjectKey: "defillama:pool:a", name: "aave-v3 USDC", series: series(4), scored: Scorecard.score(facts({ name: "aave-v3 USDC" })) }),
    pos({ subjectKey: "defillama:pool:b", name: "sparklend DAI", series: series(5), scored: Scorecard.score(facts({ name: "sparklend DAI", tvlSlope30d: -0.4 })), catch: fundingCatch, domain: "STABLE-SYNTH" }),
    pos({ subjectKey: "defillama:pool:c", name: "gearbox loop", domain: "LOOPED-CDP", scored: Scorecard.score(facts({ name: "gearbox loop", isStablecoin: false })) }),
  ]
  const c = StrategyCompile.compile(positions, manifest({ positions: [{ subjectKey: "defillama:pool:a", size: 1, units: "x" }, { subjectKey: "defillama:pool:b", size: 1, units: "x" }, { subjectKey: "defillama:pool:c", size: 1, units: "x" }] }), { nowMs: NOW })
  for (const l of c.lines) { console.log(`  ${l.kind}:`, l.text); expect(StrategyCompile.guardLine(l.text).ok).toBe(true) }
  // the catch aggregation rendered the funding + leverage lines; the worst-axis names the collapsed-TVL position
  expect(c.lines.some((l) => l.kind === "catch-funding")).toBe(true)
  expect(c.lines.some((l) => l.kind === "catch-leverage" && /evaluates a position, not the protocol/i.test(l.text))).toBe(true)
  expect(c.lines.some((l) => l.kind === "worst-axis" && /tvl-trend/i.test(l.text))).toBe(true)
})

test("COMPILE — the effective-bets fact via correlate.ts (the SECOND CALLER); the min-overlap-30 INSUFFICIENT floor PROPAGATES (never a thin decimal)", () => {
  // ≥ 30 shared points → a real effective-K line
  const suff = StrategyCompile.compile([pos({ subjectKey: "a", name: "A", series: series(4, 32) }), pos({ subjectKey: "b", name: "B", series: series(6, 32) })], manifest({ positions: [{ subjectKey: "a", size: 1, units: "x" }, { subjectKey: "b", size: 1, units: "x" }] }), { nowMs: NOW })
  const eb = suff.lines.find((l) => l.kind === "effective-bets")!
  console.log("  sufficient:", eb.text)
  expect(eb.text).toMatch(/independent bet/i)
  expect(eb.text).toMatch(/never an allocation/i)
  // < 30 shared points → INSUFFICIENT, NO number (the thin-overlap read is a lie with decimals)
  const thin = StrategyCompile.compile([pos({ subjectKey: "a", name: "A", series: series(4, 12) }), pos({ subjectKey: "b", name: "B", series: series(6, 12) })], manifest({ positions: [{ subjectKey: "a", size: 1, units: "x" }, { subjectKey: "b", size: 1, units: "x" }] }), { nowMs: NOW })
  const ins = thin.lines.find((l) => l.kind === "effective-bets")!
  console.log("  insufficient:", ins.text)
  expect(ins.text).toMatch(/INSUFFICIENT.*below the pinned 30-point floor/i)
})

test("COMPILE — the thesis-age gate: a young thesis is UNJUDGEABLE-YET; an old-enough thesis is evaluable", () => {
  const young = StrategyCompile.compile([pos({ subjectKey: "a", name: "A", series: series(4) })], manifest(), { nowMs: NOW, registeredAtMs: NOW - 4 * 86400000 })
  expect(young.thesisAge.judgeable).toBe(false)
  const yl = young.lines.find((l) => l.kind === "thesis-age")!
  console.log("  young:", yl.text)
  expect(yl.text).toMatch(/UNJUDGEABLE-YET/)
  const old = StrategyCompile.compile([pos({ subjectKey: "a", name: "A", series: series(4) })], manifest(), { nowMs: NOW, registeredAtMs: NOW - 60 * 86400000 })
  expect(old.thesisAge.judgeable).toBe(true)
})

test("COMPILE — the exit evaluation is deterministic; the composed line reflects fired / not-fired (peg-floor over the captured peg)", () => {
  const notFired = StrategyCompile.compile([pos({ subjectKey: "a", name: "A", exitFacts: { peg: 0.9989 } })], manifest({ exitCriterion: { kind: "peg-floor", threshold: 0.995, subjectScope: "portfolio" } }), { nowMs: NOW })
  expect(notFired.exit!.fired).toBe(false)
  const el = notFired.lines.find((l) => l.kind === "exit")!
  console.log("  exit:", el.text)
  expect(el.text).toMatch(/NOT FIRED/)
  const fired = StrategyCompile.compile([pos({ subjectKey: "a", name: "A", exitFacts: { peg: 0.98 } })], manifest({ exitCriterion: { kind: "peg-floor", threshold: 0.995, subjectScope: "portfolio" } }), { nowMs: NOW })
  expect(fired.exit!.fired).toBe(true)
})

test("COMPILE — a DEAD subject mid-compile degrades honestly (the compile completes; the reachable facts still compose)", () => {
  const c = StrategyCompile.compile([pos({ subjectKey: "a", name: "A", series: series(4, 32) }), pos({ subjectKey: "dead", name: "dead", reachable: false, series: [] }), pos({ subjectKey: "b", name: "B", series: series(6, 32) })], manifest({ positions: [{ subjectKey: "a", size: 1, units: "x" }, { subjectKey: "dead", size: 1, units: "x" }, { subjectKey: "b", size: 1, units: "x" }] }), { nowMs: NOW })
  const dl = c.lines.find((l) => l.kind === "degraded")!
  console.log("  degraded:", dl.text)
  expect(dl.text).toMatch(/could not be resolved.*dead/i)
  expect(c.lines.some((l) => l.kind === "effective-bets" && /independent bet/i.test(l.text))).toBe(true) // the 2 reachable still compose
})

test("COMPILE — D38: NO composite verdict is rendered; compositeVerdict is ALWAYS null (the pill awaits the pen)", () => {
  const c = StrategyCompile.compile([pos({ subjectKey: "a", name: "A" }), pos({ subjectKey: "b", name: "B" })], manifest({ positions: [{ subjectKey: "a", size: 1, units: "x" }, { subjectKey: "b", size: 1, units: "x" }] }), { nowMs: NOW })
  expect(c.compositeVerdict).toBeNull()
  expect(StrategyCompile.COMPOSITE_ABSENCE).toMatch(/awaits the Operator's D38/i)
})

test("COMPILE — the composed effective-bets fact speaks BOTH registers behind the existing grammar (Simple plain; Pro named); the advice wall is green", () => {
  const c = StrategyCompile.compile([pos({ subjectKey: "a", name: "A", series: series(4, 32) }), pos({ subjectKey: "b", name: "B", series: series(6, 32) })], manifest({ positions: [{ subjectKey: "a", size: 1, units: "x" }, { subjectKey: "b", size: 1, units: "x" }] }), { nowMs: NOW })
  const simple = StrategyCompile.effectiveBetsFact(c, "simple")!
  const pro = StrategyCompile.effectiveBetsFact(c, "pro")!
  console.log("  simple:", simple)
  console.log("  pro:", pro)
  expect(simple).not.toBe(pro) // the register distinction is real (the same fact, two registers — the Ask console's wall)
  expect(simple).toMatch(/not what to do|describes correlation/i) // the plain, advice-disclaiming register
  expect(pro).toMatch(/ρ-correlated|average-linkage|shared points/i) // the metric-literate register
  // both pass the SAME advice wall the composed lines pass (behind the existing walls — no new AI)
  expect(StrategyCompile.guardLine(simple).ok).toBe(true)
  expect(StrategyCompile.guardLine(pro).ok).toBe(true)
})

test("COMPILE/RENDER — S71: renderComposed of a SINGLE position is BYTE-IDENTICAL to the standalone Reality Check", () => {
  const scored = Scorecard.score(facts({ name: "aave-v3 USDC" }))
  const standalone = Reality.renderRealityCheck("aave-v3 USDC", scored, [], "defillama:pool:a", [], null, "REAL-at-timestamp", "LENDING", undefined)
  const view: Reality.ComposedView = {
    positions: [{ name: "aave-v3 USDC", scored, history: [], poolKey: "defillama:pool:a", size: 1000, units: "USDC", reachable: true, governance: null, provTier: "REAL-at-timestamp", domain: "LENDING", catchFact: undefined }],
    thesis: "single-position strategy",
    lines: [],
    compositeAbsence: StrategyCompile.COMPOSITE_ABSENCE,
  }
  const composed = Reality.renderComposed(view)
  expect(composed).toBe(standalone) // byte-for-byte — a strategy of one IS today's Reality Check (perfect backward compat)
})

test("COMPILE/RENDER — a MULTI-position composed render labels the D38 absence + carries the portfolio facts + NO aggregate pill", () => {
  const s = Scorecard.score(facts({ name: "A" }))
  const view: Reality.ComposedView = {
    positions: [
      { name: "A", scored: s, history: [], poolKey: "defillama:pool:a", size: 1, units: "USDC", reachable: true, governance: null, provTier: "REAL-at-timestamp", domain: "LENDING" },
      { name: "B", scored: s, history: [], poolKey: "defillama:pool:b", size: 1, units: "DAI", reachable: true, governance: null, provTier: "REAL-at-timestamp", domain: "LENDING" },
    ],
    thesis: "two blue-chip stables",
    lines: [{ kind: "effective-bets", text: "These 2 positions' recorded yields cluster into ≈ 1 independent bet (31 shared points; ρ-matrix traced). info/context — a fact about correlation, never an allocation." }],
    compositeAbsence: StrategyCompile.COMPOSITE_ABSENCE,
  }
  const html = Reality.renderComposed(view)
  expect(html).toMatch(/No composite strategy verdict is rendered/i) // the D38 absence is labeled (apostrophe HTML-escaped)
  expect(html).toMatch(/D38/) // the pen the composite awaits
  expect(html).toMatch(/independent bet/i) // the portfolio facts render
  expect(html).toMatch(/Composed Reality Check/i)
  // NO aggregate STRATEGY-level verdict pill: the composed header names the strategy, not a SOLID/CAUTION pill of its own
  expect(html).not.toMatch(/<h1>Composed Reality Check <span class="pill (SOLID|CAUTION|AVOID|UNVERIFIED)/)
})
