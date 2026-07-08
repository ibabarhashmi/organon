/**
 * ORGΛNON — THE HONESTY LAYER, Phase 3 walls (SCORECARD-TRUE; Rules X-DETERM, X-ONE, X-HONEST). The deterministic
 * honesty scorecard, positive-controlled: a real-shaped pool gets an honest verdict in both registers; the flagship
 * yield-reality split, the TVL trend, and the peg each FLAG their failure mode (emissions-inflated · depeg · TVL
 * collapse — all CAUGHT); the verdict is MACHINE-DERIVED (a hand-written flattering verdict is caught by the consistency
 * check); UNVERIFIED renders as an honest gap, never a pass; and the LLM can only phrase the plain register behind the
 * groundedness verifier — a paraphrase that tries to move the verdict is rejected wholesale (X-DETERM).
 */
import { test, expect } from "bun:test"
import { Scorecard } from "../../src/analytics/scorecard"
import { Feed } from "../../src/dataplane/feed"
import { ProvRecord } from "../../src/dataplane/record"
import { DataPlane } from "../../src/dataplane/store"

const REAL = "REAL" as const
// the fixture supplies passing counterparty facts (a mature, well-sized pool) so the FOUR ORIGINAL controls stay intact
// under the deepened axis set; the deepening axes have their own walls (honesty_liquidity/unlock/counterparty).
const base = (o: Partial<Scorecard.PoolFacts>): Scorecard.PoolFacts => ({ name: "p", apyBase: 3.1, apyReward: null, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: REAL, provenanceRef: "c", ageDays: 900, sizeUsd: 240_000_000, ...o })

test("the worked example → SOLID: durable base yield, stable deposits, on-peg (all axes pass, REAL)", () => {
  const s = Scorecard.score(base({}))
  expect(s.verdict).toBe("SOLID")
  expect(s.rows.find((r) => r.axis === "yield-reality")!.tier).toBe("pass")
  expect(s.rows.find((r) => r.axis === "tvl-trend")!.tier).toBe("pass")
  expect(s.rows.find((r) => r.axis === "peg")!.tier).toBe("pass")
  // determinism (S10): identical facts → byte-identical scorecard
  expect(JSON.stringify(Scorecard.score(base({})))).toBe(JSON.stringify(s))
})

test("POSITIVE CONTROL (S6) — an emissions-inflated pool (95% rewards) → yield-reality FAIL → verdict is NOT SOLID (AVOID)", () => {
  const s = Scorecard.score(base({ apyBase: 0.5, apyReward: 9.5 })) // baseShare 0.05 < 0.2
  expect(s.rows.find((r) => r.axis === "yield-reality")!.tier).toBe("fail")
  expect(s.verdict).toBe("AVOID")
  expect(s.summary).toMatch(/reward|emission|temporary/i) // the failing axis is NAMED
  expect(s.failing).toContain("yield-reality")
})

test("POSITIVE CONTROL (S5) — a seeded depeg (|price−1| = 0.03) → peg FAIL → AVOID", () => {
  const s = Scorecard.score(base({ pegDev: 0.03 }))
  expect(s.rows.find((r) => r.axis === "peg")!.tier).toBe("fail")
  expect(s.verdict).toBe("AVOID")
  expect(s.summary).toMatch(/peg|depeg/i)
})

test("POSITIVE CONTROL — a seeded TVL collapse (30d slope = −0.5) → TVL FAIL → AVOID", () => {
  const s = Scorecard.score(base({ tvlSlope30d: -0.5 }))
  expect(s.rows.find((r) => r.axis === "tvl-trend")!.tier).toBe("fail")
  expect(s.verdict).toBe("AVOID")
})

test("a reward-leaning pool (baseShare between the bands) → CAUTION, not AVOID, not SOLID", () => {
  const s = Scorecard.score(base({ apyBase: 3.5, apyReward: 6.5 })) // baseShare 0.35 ∈ [0.2, 0.5)
  expect(s.rows.find((r) => r.axis === "yield-reality")!.tier).toBe("caution")
  expect(s.verdict).toBe("CAUTION")
})

test("UNVERIFIED is an honest gap, never a disguised pass — SAMPLE data OR a missing flagship both yield UNVERIFIED", () => {
  const sample = Scorecard.score(base({ reality: "SAMPLE" })) // all axes pass but the data is SAMPLE
  expect(sample.verdict).toBe("UNVERIFIED")
  expect(sample.plain).toMatch(/can'?t confirm|unverified|sample/i) // rendered as a gap, not a pass
  const noFlagship = Scorecard.score(base({ apyBase: null })) // the flagship yield-reality is uncomputable
  expect(noFlagship.verdict).toBe("UNVERIFIED")
  const noHistory = Scorecard.score(base({ tvlSlope30d: null })) // S4: a non-flagship gap → not SOLID (CAUTION), never fabricated
  expect(noHistory.verdict).toBe("CAUTION")
})

test("THE CONSISTENCY CHECK (X-ONE) — the verdict must be machine-derived; a hand-written flattering verdict is CAUGHT", () => {
  const avoid = Scorecard.score(base({ apyBase: 0.5, apyReward: 9.5 })) // derives AVOID
  expect(Scorecard.consistency(avoid.verdict, avoid.plain, avoid.rows, avoid.facts.reality).ok).toBe(true) // the honest render is consistent
  // POSITIVE CONTROL: claim SOLID over rows that derive AVOID → caught (the verdict is not hand-writable)
  const bad = Scorecard.consistency("SOLID", avoid.plain, avoid.rows, avoid.facts.reality)
  expect(bad.ok).toBe(false)
  expect(bad.violations.some((v) => /derived verdict/i.test(v))).toBe(true)
  // POSITIVE CONTROL: a plain register that HIDES the failing axis → caught
  const hidden = Scorecard.consistency("AVOID", "AVOID — everything looks fine here.", avoid.rows, avoid.facts.reality)
  expect(hidden.ok).toBe(false)
})

test("both registers render from the one table — the quant register carries the exact metric + threshold", () => {
  const s = Scorecard.score(base({ apyBase: 0.5, apyReward: 9.5 }))
  expect(s.quant).toContain("0.05") // baseShare exact
  expect(s.quant).toContain("0.5") // the durability threshold
  expect(s.plain).not.toMatch(/0\.05/) // the plain register is qualitative (numbers live in the quant register)
})

test("X-DETERM — the LLM phrases the plain register behind the verifier; a paraphrase that MOVES the verdict is rejected", () => {
  const s = Scorecard.score(base({ apyBase: 0.5, apyReward: 9.5 })) // AVOID
  const faithful: Scorecard.Paraphraser = { rephrase: () => "Most of this yield is temporary rewards that will fade; treat it with caution." }
  const okp = Scorecard.paraphraseGated(s.plain, s.rows, s.verdict, faithful)
  expect(okp.aiPhrased).toBe(true)
  expect(okp.rejected).toBe(false)
  // POSITIVE CONTROL: a paraphraser that injects a favorable VERDICT word → rejected wholesale, deterministic fallback
  const liar: Scorecard.Paraphraser = { rephrase: () => "This looks SOLID and comfortably above the bar." }
  const bad = Scorecard.paraphraseGated(s.plain, s.rows, s.verdict, liar)
  expect(bad.rejected).toBe(true)
  expect(bad.aiPhrased).toBe(false)
  expect(bad.rendered).toBe(s.plain) // the deterministic text stands
  expect(bad.reasons.some((r) => /verdict|SOLID|embellish/i.test(r))).toBe(true)
  // a paraphraser that unavailably throws → deterministic fallback, never a crash
  const dead: Scorecard.Paraphraser = { rephrase: () => { throw new Error("no model") } }
  expect(Scorecard.paraphraseGated(s.plain, s.rows, s.verdict, dead).rendered).toBe(s.plain)
})

test("the record bridge (feed → scorecard) scores the committed REAL DeFiLlama data; clone-robust (SAMPLE → UNVERIFIED)", () => {
  const v = ProvRecord.verify()
  if (!v.present) { console.log("  (honesty_scorecard) provenance chain absent — run script/capture-defillama.ts"); return }
  const poolKey = Object.keys(v.keys).find((k) => k.startsWith("defillama:pool:"))
  if (!poolKey) { console.log("  (honesty_scorecard) no DeFiLlama capture — run script/capture-defillama.ts to seed the moat"); return }
  const series = DataPlane.snapshotAdapter.fetchSeries(poolKey)
  const chartKey = poolKey.replace(":pool:", ":chart:")
  const ts = series ? series.points[series.points.length - 1].ts : Date.now()
  const facts = Feed.poolFacts({ name: "aave-v3 USDC", poolKey, chartKey, isStablecoin: true }, ts, 0.0001)
  const s = Scorecard.score(facts)
  if (!series) { expect(s.verdict).toBe("UNVERIFIED"); expect(facts.reality).toBe("SAMPLE"); return } // gitignored payload → honest SAMPLE
  expect(facts.reality).toBe("REAL")
  expect(facts.provenanceRef).toBe(series.provenance.contentSha) // the moat anchor
  expect(["SOLID", "CAUTION", "AVOID", "UNVERIFIED"]).toContain(s.verdict)
  expect(Scorecard.consistency(s.verdict, s.plain, s.rows, s.facts.reality).ok).toBe(true) // the live render is self-consistent
})
