/**
 * ORGΛNON — THE HONESTY LAYER, Phase 0 walls (PINS-LOCKED). The sprint is judgeable before it is buildable: the pins
 * hash-lock (a changed pin ⇒ a changed sha), the axis thresholds are present + unambiguous, and the VERDICT-DIFFERENTIAL
 * BASELINE reproduces (the frozen attest engine's lending + funding verdicts are captured BEFORE the honesty layer, so
 * every later phase can prove no verdict moved). Deterministic; clone-robust (the funding leg uses the illustrative path).
 */
import { test, expect } from "bun:test"
import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { VerdictDifferential } from "../../src/studio/differential"
import { Console } from "../../src/studio/console"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const pins = JSON.parse(readFileSync(path.join(H, "phase0-pins.json"), "utf8"))
const baseline = JSON.parse(readFileSync(path.join(H, "verdict-baseline.json"), "utf8"))

// re-pinned in PART E (red-team finding W-E01: UNVERIFIED dominates AVOID on unverifiable data — the firewall/S7)
const PINS_SHA_GOLDEN = "8a57e6f196ff7718a4bbfd9eb58c6ffa5f48e349a7ed837d54c853038910a1ce"
const LENDING_SET_SHA_GOLDEN = "70c7912f0b16a796ea585ab7e508af542f1f83d05110143c8575bab226a3bf54"

test("the pins hash-lock: PINS_SHA is the pinned golden AND self-consistent (recompute over the file reproduces it)", () => {
  expect(pins.pinsSha).toBe(PINS_SHA_GOLDEN)
  const { pinsSha, ...rest } = pins
  expect(sha256(JSON.stringify(rest))).toBe(pins.pinsSha) // self-consistent: the stored sha covers exactly the rest
  // POSITIVE CONTROL: mutating a pinned threshold changes the sha (the lock bites, not a no-op)
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.axes.yieldReality.DURABLE_BASE_SHARE = 0.51
  expect(sha256(JSON.stringify(mutated))).not.toBe(pins.pinsSha)
})

test("the four axes carry exact, unambiguous numeric thresholds (no vague pin survives)", () => {
  const a = pins.axes
  expect(a.yieldReality.DURABLE_BASE_SHARE).toBe(0.5)
  expect(a.yieldReality.MERCENARY_BASE_SHARE).toBe(0.2)
  expect(a.yieldReality.flagship).toBe(true)
  expect(a.tvlTrend.TVL_STABLE_FLOOR).toBe(-0.1)
  expect(a.tvlTrend.TVL_COLLAPSE_FLOOR).toBe(-0.35)
  expect(a.peg.PEG_ONPEG_BAND).toBe(0.005)
  expect(a.peg.PEG_DEPEG_BAND).toBe(0.02)
  expect(a.fundingRegime.neverHeroApy).toBe(true)
  // the verdict derivation names UNVERIFIED as NOT a pass (the firewall)
  expect(pins.verdictDerivation.unverifiedIsNotAPass).toBe(true)
  expect(pins.screens.count).toBe(2)
  expect(pins.stressCatalog).toHaveLength(10)
})

test("the kill criterion is falsifiable: a concrete window + threshold + minimum sample, armed not pre-passed", () => {
  const k = pins.probe.killCriterion
  expect(k.falsifiable).toBe(true)
  expect(k.window).toBe("14 days")
  expect(k.minGenuineSessions).toBe(30)
  expect(k.status).toMatch(/ARMED/)
  expect(k.status).toMatch(/NOT yet evaluable/i)
})

test("the blueprint sha is pinned (asserted against the file where present; the pin is durable on a clone)", () => {
  const abs = path.join(PKG_ROOT, pins.blueprint.rel)
  if (!existsSync(abs)) {
    console.log("  (pins) the blueprint is gitignored/absent (fresh clone) — the pinned sha is the durable record")
    expect(pins.blueprint.sha).toMatch(/^[0-9a-f]{64}$/)
    return
  }
  expect(sha256(readFileSync(abs, "utf8"))).toBe(pins.blueprint.sha)
})

test("VERDICT-DIFFERENTIAL BASELINE — the frozen lending verdicts reproduce byte-identically (no verdict moved)", async () => {
  const setSha = await VerdictDifferential.fingerprintSetSha()
  expect(setSha).toBe(baseline.lending.fingerprintSetSha)
  expect(setSha).toBe(LENDING_SET_SHA_GOLDEN) // the cross-sprint golden — the honesty layer perturbs no lending verdict
})

test("VERDICT-DIFFERENTIAL BASELINE — the frozen funding verdict reproduces (clone-robust illustrative path)", async () => {
  const r = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, Date.parse("2026-07-05T00:00:00Z"))
  expect(r.verdict).toBe(baseline.funding.verdict)
  expect(r.artifact?.reality).toBe(baseline.funding.reality) // ILLUSTRATIVE — bybit has no captured T1 snapshot (clone-robust)
  expect(r.artifact?.verdictReproHash).toBe(baseline.funding.verdictReproHash)
})

// ── THE DEEPENING SPRINT — the additional pins (data/honesty/deepening-pins.json), carried forward from 8a57e6f… ──
const deep = JSON.parse(readFileSync(path.join(H, "deepening-pins.json"), "utf8"))
const DEEPENING_PINS_SHA_GOLDEN = "d66f4613e0a4055eb7a1fbc2b3b9b47b58a0eb63b743f4d0b787e531470558b1"

test("DEEPENING — the pins hash-lock: PINS_SHA is the golden, self-consistent, and carries forward from the Honesty-Layer sha", () => {
  expect(deep.pinsSha).toBe(DEEPENING_PINS_SHA_GOLDEN)
  expect(deep.carriedFromPinsSha).toBe(PINS_SHA_GOLDEN) // a conscious extension of 8a57e6f…, never a silent drift
  const { pinsSha, ...rest } = deep
  expect(sha256(JSON.stringify(rest))).toBe(deep.pinsSha)
  // POSITIVE CONTROL: mutating a NEW pinned threshold changes the sha (the lock bites)
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.newAxes.liquidityDepth.LIQ_DEEP_USD = 500_001
  expect(sha256(JSON.stringify(mutated))).not.toBe(deep.pinsSha)
})

test("DEEPENING — the three new axes carry exact, unambiguous numeric thresholds (no vague pin survives)", () => {
  const n = deep.newAxes
  expect(n.liquidityDepth.LIQ_DEEP_USD).toBe(500_000)
  expect(n.liquidityDepth.LIQ_THIN_USD).toBe(50_000)
  expect(n.unlockOverhang.UNLOCK_BENIGN).toBe(0.01)
  expect(n.unlockOverhang.UNLOCK_HEAVY).toBe(0.05)
  expect(n.counterparty.AGE_MATURE_DAYS).toBe(365)
  expect(n.counterparty.AGE_YOUNG_DAYS).toBe(90)
  expect(n.counterparty.SIZE_ESTABLISHED_USD).toBe(10_000_000)
  expect(n.counterparty.SIZE_DUST_USD).toBe(1_000_000)
  // the counterparty axis is LABELED a coarse screen, not an audit (the over-claim ban is pinned)
  expect(n.counterparty.label).toMatch(/not a contract audit/i)
  expect(n.counterparty.overClaimBanned).toMatch(/audited|safe|guaranteed/i)
})

test("DEEPENING — the vertical-applicability matrix is TOTAL: every (vertical × axis) pair is defined (never undefined)", () => {
  const m = deep.verticalApplicabilityMatrix
  expect(m.verticals).toEqual(["stablecoin-yield", "lending", "delta-neutral"])
  expect(m.axes).toHaveLength(7)
  for (const v of m.verticals) for (const ax of m.axes) {
    const cell = m.matrix[v]?.[ax]
    expect(typeof cell).toBe("string") // total: no undefined pair
    expect(cell.length).toBeGreaterThan(0)
  }
  // the load-bearing cells: funding only for delta-neutral; liquidity n/a for lending + delta; counterparty n/a for delta
  expect(m.matrix["delta-neutral"]["funding-regime"]).toMatch(/^applies/)
  expect(m.matrix["stablecoin-yield"]["funding-regime"]).toMatch(/not-applicable/)
  expect(m.matrix["lending"]["liquidity-depth"]).toMatch(/not-applicable/)
  expect(m.matrix["delta-neutral"]["counterparty"]).toMatch(/not-applicable/)
  expect(m.matrix["lending"]["counterparty"]).toMatch(/^applies/)
})

test("DEEPENING — the stress catalog is S1–S15 (15 lines; S3 stale-cache + S7 SAMPLE-heavy each their own line; S11–S15 new)", () => {
  expect(deep.stressCatalog).toHaveLength(15)
  const ids = deep.stressCatalog.map((s: { id: string }) => s.id)
  expect(ids).toEqual(["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15"])
  expect(deep.stressCatalog.find((s: { id: string }) => s.id === "S3").name).toMatch(/stale cache/i)
  expect(deep.stressCatalog.find((s: { id: string }) => s.id === "S7").name).toMatch(/SAMPLE-heavy/i)
  expect(deep.stressCatalog.find((s: { id: string }) => s.id === "S11").name).toMatch(/liquidity/i)
})

test("DEEPENING — the deviations ledger seed carries D1/D2/D3, each with the four fields (a silent deviation is a Halt)", () => {
  const ds = deep.deviationsSeed
  expect(ds.map((d: { id: string }) => d.id)).toEqual(["D1", "D2", "D3"])
  for (const d of ds) {
    expect(d.blueprintLine.trim().length).toBeGreaterThan(0)
    expect(d.whatWasDone.trim().length).toBeGreaterThan(0)
    expect(d.why.trim().length).toBeGreaterThan(0)
    expect(d.lawAuthority.trim().length).toBeGreaterThan(0)
  }
  expect(ds.find((d: { id: string }) => d.id === "D1").whatWasDone).toMatch(/RWA verdict PIN.*RETAINED|RETAINED/i)
  expect(ds.find((d: { id: string }) => d.id === "D3").whatWasDone).toMatch(/RESOLVED|wired/i)
})

test("DEEPENING — the evidence-bundle contract lists the regenerable artifacts + the verify verb (X-PROVE)", () => {
  const e = deep.evidenceBundle
  expect(e.verb).toMatch(/organon\.sh verify/)
  const files = e.artifacts.map((a: { file: string }) => a.file)
  for (const f of ["battery-summary.json", "determinism.json", "frozen-git-status.json", "verdict-differential.json", "claims.json"]) expect(files).toContain(f)
  expect(files.some((f: string) => f.includes("geckoterminal"))).toBe(true)
})
