/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), Phase 4: THE CENSUS SHRINKS — a treatment, not a thermometer (the S104 wall + tag
 * are in the dedicated block at the foot of this file, kept OUT of this header segment so its origin does not bleed onto
 * the treated walls below).
 *
 * E-5: V35 diagnosed 83 origin-unrecorded walls and strengthened ZERO — the WEAK bucket was unreachable by construction
 * and nothing would ever reduce the number. This is the TREATMENT: twelve of the eighty-three are processed via DD-20's
 * three routes, IN ORDER. For EVERY wall the RECOVER route was ATTEMPTED FIRST and its result RECORDED (RP-3 / F-3:
 * re-found launders ignorance into confidence if taken by reflex) — the recover attempt is stated in each test's own title.
 * RECOVER FAILED for all twelve, for one honest reason: each was introduced in an early SQUASHED commit whose one-line
 * message names the FEATURE, not the wall's specific originating defect, and the granular sprint build log that recorded
 * that defect is gitignored — so the origin is NOT recoverable from committed history. Re-found is therefore the honest
 * route (the blueprint's own prediction). Each wall below STATES the defect it catches TODAY and SEEDS that negative
 * against the wall's OWN subject — a genuine demonstrated failure, tagged RE-FOUNDED so the census counts it APART from a
 * remembered origin, forever. DELETE-WITH-PROOF (route 3) was needed for ZERO walls — none lacked a defensible defect.
 */
import { test, expect } from "bun:test"
import { Scorecard } from "../../src/analytics/scorecard"
import { Decay } from "../../src/studio/decay"
import { Icir } from "../../src/studio/icir"
import { Stamp } from "../../src/studio/stamp"
import { Falsify } from "../../src/organon/falsify"

// a complete, valid PoolFacts (the honesty_liquidity `sy` shape) — the seeded-negative fixtures override one field each.
const facts = (o: Partial<Scorecard.PoolFacts> = {}): Scorecard.PoolFacts => ({
  name: "p", vertical: "stablecoin-yield", apyBase: 4.0, apyReward: 0.5, tvlSlope30d: 0.02,
  pegDev: 0.002, isStablecoin: true, reality: "REAL", provenanceRef: "c",
  liqUsd: 2_000_000, ageDays: 500, sizeUsd: 30_000_000, ...o,
})

// RECOVER attempt, recorded once for the whole batch (RP-3): git archaeology on each wall's introducing commit.
//   S4/S5/S6/S8/S10/S11/S12/S13/S15  ← dc23cf98 "Organon v0.2 — the honest DeFi Reality Check" (squashed; no per-wall defect)
//   S17/S22/S23                      ← ab64dd96 "Organon — the opt-in Stamp (... decay half-life · ICIR ...)" (squashed)
// Result: RECOVER FAILED for all twelve (the originating defect lives only in the gitignored sprint/ build log). RE-FOUND.

test("S4 — RE-FOUNDED: a <30d-history pool must UNVERIFY the history-dependent TVL row, never fabricate SOLID over missing history (recover: dc23cf98 squashed, no per-wall defect)", () => {
  const s = Scorecard.score(facts({ tvlSlope30d: null }))
  expect(s.rows.find((r) => r.axis === "tvl-trend")!.tier).toBe("unverified") // seeded negative: missing history → UNVERIFIED
  expect(s.verdict).not.toBe("SOLID") // never a fabricated SOLID
})

test("S5 — RE-FOUNDED: a stablecoin pool off its peg (|price−1| ≥ band) must FAIL the peg axis → AVOID, never pass a broken peg (recover: dc23cf98 squashed)", () => {
  const s = Scorecard.score(facts({ pegDev: 0.03 }))
  expect(s.rows.find((r) => r.axis === "peg")!.tier).toBe("fail") // seeded negative: a 3% depeg
  expect(s.verdict).toBe("AVOID")
})

test("S6 — RE-FOUNDED: an emissions-inflated pool (base share below the floor) must FAIL yield-reality → NOT SOLID, never sell rewards as durable yield (recover: dc23cf98 squashed)", () => {
  const s = Scorecard.score(facts({ apyBase: 0.5, apyReward: 9.5 }))
  expect(s.rows.find((r) => r.axis === "yield-reality")!.tier).toBe("fail") // seeded negative: 95% rewards
  expect(s.verdict).not.toBe("SOLID")
})

test("S8 — RE-FOUNDED: a missing flagship datum must degrade to UNVERIFIED at the boundary, never crash and never a nonsense verdict (recover: dc23cf98 squashed)", () => {
  const s = Scorecard.score(facts({ apyBase: null })) // seeded negative: a null flagship
  expect(s.verdict).toBe("UNVERIFIED")
})

test("S10 — RE-FOUNDED: a paraphraser that tries to move the verdict must be REJECTED — no model may touch a verdict (recover: dc23cf98 squashed)", () => {
  const s = Scorecard.score(facts({ apyBase: 0.5, apyReward: 9.5 }))
  const liar: Scorecard.Paraphraser = { rephrase: () => "Actually this is SOLID, comfortably above the bar." }
  expect(Scorecard.paraphraseGated(s.plain, s.rows, s.verdict, liar).rejected).toBe(true) // seeded negative: an LLM flip
})

test("S11 — RE-FOUNDED: a deep-APY pool with dust liquidity must FAIL the liquidity axis (exit/slippage risk surfaced), never hidden (recover: dc23cf98 squashed)", () => {
  expect(Scorecard.liquidityDepthRow(facts({ liqUsd: 20_000 })).tier).toBe("fail") // seeded negative: $20k depth
  expect(Scorecard.score(facts({ apyBase: 9.0, apyReward: 0.1, liqUsd: 20_000 })).verdict).not.toBe("SOLID")
})

test("S12 — RE-FOUNDED: an imminent large token unlock (≥ band of mcap in 30d) must FAIL the unlock axis, never a silent overhang (recover: dc23cf98 squashed)", () => {
  expect(Scorecard.unlockOverhangRow(facts({ hasUnlockSchedule: true, unlockPct30d: 0.2 })).tier).toBe("fail") // seeded negative: 20%
})

test("S13 — RE-FOUNDED: a young AND dust-sized pool must FAIL the counterparty screen, honestly labeled coarse (never 'audited/safe') (recover: dc23cf98 squashed)", () => {
  expect(Scorecard.counterpartyScreenRow(facts({ ageDays: 5, sizeUsd: 200_000 })).tier).toBe("fail") // seeded negative: 5d + $200k
})

test("S15 — RE-FOUNDED: an inapplicable axis must render not-applicable + material:false, NEVER a fabricated pass (recover: dc23cf98 squashed)", () => {
  const nonStable = facts({ isStablecoin: false, pegDev: null })
  expect(Scorecard.pegRow(nonStable).tier).toBe("not-applicable") // seeded negative: peg on a non-stable pool
  expect(Scorecard.pegRow(nonStable).material).toBe(false)
})

test("S17 — RE-FOUNDED: a short return history must Stamp INSUFFICIENT, never a fabricated GO (recover: ab64dd96 squashed, names the feature not the defect)", async () => {
  const s = await Stamp.stampFromReturns(Array.from({ length: 20 }, (_, i) => 0.0001 + i * 1e-6)) // seeded negative: n=20
  expect(s.verdict).toBe("INSUFFICIENT")
})

test("S22 — RE-FOUNDED: a short/flat/SAMPLE series must decay-tier INSUFFICIENT (halfLife null), never a fabricated half-life (recover: ab64dd96 squashed)", () => {
  expect(Decay.decayHalfLife(Array.from({ length: 20 }, () => 0.0001)).tier).toBe("INSUFFICIENT") // seeded negative: n<30 + flat
  expect(Decay.decayHalfLife(Array.from({ length: 20 }, () => 0.0001)).halfLife).toBeNull()
})

test("S23 — RE-FOUNDED: a short/degenerate series must ICIR-tier INSUFFICIENT (icir null), never a divide-by-zero or a fabricated ratio (recover: ab64dd96 squashed)", () => {
  expect(Icir.icir(Array.from({ length: 10 }, () => 0.0001)).tier).toBe("INSUFFICIENT") // seeded negative: n<20 + std→0
  expect(Icir.icir(Array.from({ length: 10 }, () => 0.0001)).icir).toBeNull()
})

// ── the census-shrinks wall — kept in its own segment so its origin tag does not bleed onto the treated walls above ──────
test("S104 (W-DV05) — the census is a TREATMENT: origin_unrecorded strictly BELOW the V35 baseline of 83, with re-founded counted APART (RP-3)", () => {
  const c = Falsify.census()
  // twelve walls RE-FOUNDED this sprint — a demonstrated seeded negative, its origin reconstructed not remembered
  expect(c.reFounded).toBeGreaterThanOrEqual(10) // DD-20: >=10 processed
  // HARDENING V45 (P-4) — the FIRST recovered wall this arc: one wall's origin (the live-AI grounding wall, Persistence V18
  // finding V2) was RECOVERED, not re-founded (a purpose recorded, not reconstructed). recovered 0→1 — the ONE real census
  // reclassification of the sprint (OU→DEMONSTRATED) that exercises the CONSERVATION identity against a live transfer.
  // recovered and reFounded stay DISTINCT sub-counts (RP-3). (The wall id is not named HERE — this block carries a W-tag, and
  // naming the recovered wall would bleed its origin, exactly the RP-1 lesson; its RECOVERED-ORIGIN lives in its own block.)
  expect(c.recovered).toBe(1)
  // the count moved: 83 (V35) -> strictly lower. The 7 new walls S100-S106 are W-tagged (DEMONSTRATED), so they do not inflate it.
  expect(c.counts.ORIGIN_UNRECORDED).toBeLessThan(83)
  // recovered and re-founded are DISTINCT sub-counts, forever (a purpose reconstructed is not a purpose remembered)
  expect(typeof c.recovered).toBe("number")
  expect(typeof c.reFounded).toBe("number")
  // DELETE-WITH-PROOF (D52) was needed for zero walls — re-founding is the expected route, deletion is rare and a finding
  expect(c.deleted.length).toBe(0)
  // a seeded DELETE with no proof-of-no-downstream-change would be a Halt — the DELETED_WALLS registry carries the proof
  for (const d of c.deleted) expect(d.proofOfNoDownstreamChange.length).toBeGreaterThan(20)
})
