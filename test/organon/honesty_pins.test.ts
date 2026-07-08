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

// ── THE CROWN-JEWEL SPRINT — the additional pins (data/honesty/crownjewel-pins.json), carried forward from d66f4613… ──
const cj = JSON.parse(readFileSync(path.join(H, "crownjewel-pins.json"), "utf8"))
const CROWNJEWEL_PINS_SHA_GOLDEN = "405ce972320d8f2d630498d8f24175e0e877058b26cd69da802f8e5dc28239d6"

test("CROWN-JEWEL — the pins hash-lock: PINS_SHA is the golden, self-consistent, and carries forward from the Deepening sha", () => {
  expect(cj.pinsSha).toBe(CROWNJEWEL_PINS_SHA_GOLDEN)
  expect(cj.carriedFromPinsSha).toBe(DEEPENING_PINS_SHA_GOLDEN) // a conscious extension of d66f4613…, never a silent drift
  const { pinsSha, ...rest } = cj
  expect(sha256(JSON.stringify(rest))).toBe(cj.pinsSha)
  // POSITIVE CONTROL: mutating a pinned threshold changes the sha (the lock bites)
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.dependency.CP_DEP_STACKED = 4
  expect(sha256(JSON.stringify(mutated))).not.toBe(cj.pinsSha)
})

test("CROWN-JEWEL — THE STAMP opt-in contract: off-path · deflation-armed-only-here · reactivation-not-modification · two orthogonal verdicts · honest INSUFFICIENT", () => {
  const s = cj.stamp
  expect(s.verdicts).toEqual(["GO", "NO-GO", "INSUFFICIENT"]) // orthogonal to SOLID/CAUTION/AVOID/UNVERIFIED
  expect(s.offPath).toMatch(/ZERO|zero/) // the mass render invokes it zero times (S16)
  expect(s.reactivationNotModification).toMatch(/byte-untouched|zero frozen bytes/i) // X-KEEP
  expect(s.honestOnShortHistory).toMatch(/INSUFFICIENT/) // never a fabricated GO (S17)
  expect(s.sidecarOptional).toMatch(/unavailable/i) // history/sidecar absent → 'unavailable', never a crash
  expect(s.minObservations).toBe(60)
})

test("CROWN-JEWEL — the capture-manifest contract lists every live-number capture + the verify verb (X-LIVE, S18)", () => {
  const m = cj.captureManifest
  expect(m.verb).toMatch(/organon\.sh verify/)
  expect(m.file).toBe("data/honesty/evidence/capture-manifest.json")
  const caps = m.entries.map((e: { capture: string }) => e.capture)
  for (const c of ["vlive-defillama.json", "vlive-geckoterminal.json", "vlive-hyperliquid.json", "vlive-gemini.json"]) expect(caps).toContain(c)
})

test("CROWN-JEWEL — the dependency thresholds are exact + unambiguous (X-DEP, D5)", () => {
  const d = cj.dependency
  expect(d.CP_DEP_SINGLE).toBe(1) // a single transparent dependency — the clean baseline, never a flag
  expect(d.CP_DEP_STACKED).toBe(3) // ≥ 3 protocol dependencies — a structural flag (stacked surface)
  expect(d.label).toMatch(/not a contract audit/i) // never over-claimed as an audit
})

test("CROWN-JEWEL — the UNLOCK axis is resolved as D6 (signed scope-cut); the keyless source is paywalled, never scraped/faked (X-UNLOCK-LIVE)", () => {
  const u = cj.unlockLive
  expect(u.resolution).toMatch(/D6/) // the Operator-signed scope-cut
  expect(u.candidatesConsidered.every((c: { keyless: boolean }) => c.keyless === false)).toBe(true) // no clean keyless source
  expect(u.thresholds.UNLOCK_HEAVY).toBe(0.05) // the thresholds carried unchanged
  const d6 = cj.deviationsSeed.find((x: { id: string }) => x.id === "D6")
  expect(d6.whatWasDone).toMatch(/scope-cut|SCOPE-CUT/i)
})

test("CROWN-JEWEL — THE ASK intent enum is CLOSED + TOTAL: every intent maps to exactly one engine tool (an open-ended intent is refused)", () => {
  const a = cj.ask
  expect(a.intentEnum).toContain("UNSUPPORTED") // the safe fallback for an unmappable query (never an invented branch)
  expect(a.intentEnum).toHaveLength(8)
  // TOTAL: every intent has a tool mapping; no undefined branch
  for (const intent of a.intentEnum) {
    expect(typeof a.intentToTool[intent]).toBe("string")
    expect(a.intentToTool[intent].length).toBeGreaterThan(0)
  }
  // the load-bearing mappings: VALIDATION → the Stamp; DATA_QUERY → a metric; COVERAGE → the matrix; UNSUPPORTED → a fallback
  expect(a.intentToTool.VALIDATION).toBe("stampFor")
  expect(a.intentToTool.DATA_QUERY).toBe("metric")
  expect(a.intentToTool.COVERAGE).toBe("coverageMatrix")
  expect(a.intentToTool.UNSUPPORTED).toBe("fallback")
})

test("CROWN-JEWEL — the groundedness rule is testable: every AI claim ↔ a returned fact; an ungrounded claim rejects WHOLESALE (X-ASK, S19)", () => {
  const a = cj.ask
  expect(a.groundednessRule).toMatch(/explain\.ts|groundedness verifier/i) // reuses the existing verifier
  expect(a.groundednessRule).toMatch(/WHOLESALE|deterministic template/i) // rejected wholesale, not partially
  expect(a.honestGaps).toMatch(/UNVERIFIED|never fill/i) // an UNVERIFIED gap is never filled
  expect(a.noAiInVerdictPath).toMatch(/deterministic|read-only/i) // the AI never touches the verdict path
  // the determinism reconciliation: FACTS deterministic, PROSE grounded (not byte-deterministic), a Pro raw toggle
  expect(a.determinism).toMatch(/raw toggle/i)
})

test("CROWN-JEWEL — the provider/BYOK matrix + key-safety: Google AI Studio default, BYOK across providers, no-key → deterministic mode, keys server-side (X-BYOK, S20)", () => {
  const p = cj.provider
  expect(p.default.provider).toBe("gemini")
  expect(p.default.envKey).toBe("GOOGLE_AI_STUDIO_KEY")
  const providers = p.byok.map((b: { provider: string }) => b.provider)
  for (const prov of ["openai", "anthropic", "openai-compatible"]) expect(providers).toContain(prov)
  expect(p.aiOptional).toMatch(/deterministic templated mode/i) // no key → deterministic, no crash
  expect(p.keySafety.rule).toMatch(/env-only|server-side/i)
  expect(p.keySafety.rule).toMatch(/NEVER.*(bundle|log)/i) // never in the bundle or a log
})

test("CROWN-JEWEL — the screen set is a CONSCIOUS 3 (D7); a fourth is a Halt (PART CLEAN amendment)", () => {
  expect(cj.screens.count).toBe(3)
  expect(cj.screens.set).toEqual(["shelf", "reality-check", "ask"])
  expect(cj.screens.amendment).toMatch(/D7/)
  const d7 = cj.deviationsSeed.find((x: { id: string }) => x.id === "D7")
  expect(d7.whatWasDone).toMatch(/2→3|2->3|third|Ask/i)
})

test("CROWN-JEWEL — the stress catalog is S1–S21 (21 lines; S16–S21 new)", () => {
  expect(cj.stressCatalog).toHaveLength(21)
  const ids = cj.stressCatalog.map((s: { id: string }) => s.id)
  expect(ids).toEqual(["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15", "S16", "S17", "S18", "S19", "S20", "S21"])
  expect(cj.stressCatalog.find((s: { id: string }) => s.id === "S16").name).toMatch(/stamp isolation/i)
  expect(cj.stressCatalog.find((s: { id: string }) => s.id === "S19").name).toMatch(/ask groundedness/i)
  expect(cj.stressCatalog.find((s: { id: string }) => s.id === "S20").name).toMatch(/key-safety/i)
  expect(cj.stressCatalog.find((s: { id: string }) => s.id === "S21").name).toMatch(/injection/i)
})

test("CROWN-JEWEL — the deviations ledger carries D1–D7, each with the four fields (a silent deviation is a Halt)", () => {
  const ds = cj.deviationsSeed
  expect(ds.map((d: { id: string }) => d.id)).toEqual(["D1", "D2", "D3", "D4", "D5", "D6", "D7"])
  for (const d of ds) {
    expect(d.blueprintLine.trim().length).toBeGreaterThan(0)
    expect(d.whatWasDone.trim().length).toBeGreaterThan(0)
    expect(d.why.trim().length).toBeGreaterThan(0)
    expect(d.lawAuthority.trim().length).toBeGreaterThan(0)
  }
  expect(ds.find((d: { id: string }) => d.id === "D5").whatWasDone).toMatch(/SCORED|scored/)
  expect(ds.find((d: { id: string }) => d.id === "D6").status).toMatch(/scope-cut/i)
})

// ── THE PERSISTENCE SPRINT — the additional pins (data/honesty/persistence-pins.json), carried forward from 405ce972… ──
const ps = JSON.parse(readFileSync(path.join(H, "persistence-pins.json"), "utf8"))
// re-pinned in Phase 3 (DECAY-TRUE): added DECAY_SIGNIF_Z (the Bartlett white-noise band) after the positive control
// proved a fixed EPS alone let noise autocorrelations fabricate a fit — a conscious re-pin (46e40760… → f157da69…)
const PERSISTENCE_PINS_SHA_GOLDEN = "f157da698895ce89d945334b3bac814bcf27538047050b25d78f2df3662d36fe"

test("PERSISTENCE — the pins hash-lock is the pinned golden + self-consistent + carried from the crownjewel sha (the lock bites)", () => {
  expect(ps.pinsSha).toBe(PERSISTENCE_PINS_SHA_GOLDEN)
  const { pinsSha, ...rest } = ps
  expect(sha256(JSON.stringify(rest))).toBe(ps.pinsSha) // self-consistent
  expect(ps.carriedFromPinsSha).toBe(CROWNJEWEL_PINS_SHA_GOLDEN) // carried forward, never rebuilt
  // POSITIVE CONTROL: mutating a pinned decay/ICIR threshold changes the sha
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.decay.DECAY_HALFLIFE_FLOOR = 6
  expect(sha256(JSON.stringify(mutated))).not.toBe(ps.pinsSha)
})

test("PERSISTENCE — the decay-gate thresholds are exact + unambiguous, and the edge measure + honest scope are pinned (X-DECAY)", () => {
  const d = ps.decay
  expect(d.lagSet).toEqual([1, 2, 3, 5, 10]) // the pinned lag set
  expect(d.DECAY_HALFLIFE_FLOOR).toBe(5) // ≥ 5 periods → TRACEABLE; < 5 → SHORT_LIVED
  expect(d.MIN_DECAY_OBSERVATIONS).toBe(30) // < 30 → INSUFFICIENT (never a fabricated half-life)
  expect(d.DECAY_EPS).toBe(1e-4)
  expect(d.DECAY_SIGNIF_Z).toBe(2) // the Bartlett white-noise band (Z/√n) — noise is not read as a persistent edge
  expect(d.tiers).toEqual(["TRACEABLE", "SHORT_LIVED", "INSUFFICIENT"])
  // the edge measure is pinned (autocorrelation → the exp fit) — a vague decay floor is refused
  expect(d.edgeMeasure).toMatch(/autocorrelation/i)
  expect(d.edgeMeasure).toMatch(/exp\(-k\/τ\)|AR\(1\)/)
  // off-path + deterministic + honest-on-short-history + from-record-only + refines-not-mints
  expect(d.offPath).toMatch(/ZERO times|never the mass/i)
  expect(d.deterministic).toMatch(/no model|byte-identical/i)
  expect(d.honestOnShortHistory).toMatch(/INSUFFICIENT/)
  expect(d.fromRecordOnly).toMatch(/SAMPLE/)
  expect(d.refinesNotMints).toMatch(/HARDER, never easier|never mints/i)
})

test("PERSISTENCE — the ICIR thresholds are exact, and the WITHIN-STRATEGY scope is pinned + NOT cross-sectional (X-ICIR, A′#2)", () => {
  const i = ps.icir
  expect(i.MIN_ICIR_PERIODS).toBe(20)
  expect(i.ICIR_STEADY_FLOOR).toBe(0.1)
  expect(i.tiers).toEqual(["CONSISTENT", "LUMPY", "INSUFFICIENT"])
  expect(i.scope).toBe("within-strategy-temporal")
  expect(i.degenerateGuard).toMatch(/std.*0|divide-by-zero/i) // std→0 guarded, never a fabricated ratio
  // the honest-scope label is PRESENT + explicitly NOT cross-sectional (pinning ICIR without the scope label is refused)
  expect(i.scopeStatement).toMatch(/within-strategy/i)
  expect(i.scopeStatement).toMatch(/NOT the cross-sectional|not a 200-token|EXPLICITLY NOT/i)
  expect(i.formula).toMatch(/mean.*std/i)
})

test("PERSISTENCE — the honest scope + the PARKED generate-loop are pinned (the generate-loop is NOT in-scope — THE FIREWALL)", () => {
  expect(ps.honestScope.isNot).toMatch(/cross-sectional factor/i)
  expect(ps.honestScope.surfaced).toMatch(/drawer|Ask|PINS/i)
  // the generate-to-iterate loop is PARKED with rationale — pinning it as in-scope is refused
  expect(ps.parkedGenerateLoop.status).toMatch(/PARKED/)
  expect(ps.parkedGenerateLoop.rationale).toMatch(/different product|non-wedge|Halt/i)
})

test("PERSISTENCE — the finding-resolutions V1–V6 are pinned, each with a resolution, and D8 carries its four fields (V3)", () => {
  const ids = ps.findings.map((f: { id: string }) => f.id)
  expect(ids).toEqual(["V1", "V2", "V3", "V4", "V5", "V6"])
  for (const f of ps.findings) { expect(f.finding.trim().length).toBeGreaterThan(0); expect(f.resolution.trim().length).toBeGreaterThan(0); expect(f.status).toMatch(/RESOLVED/) }
  expect(ps.findings.find((f: { id: string }) => f.id === "V1").resolution).toMatch(/conscious 3|sub-route/i) // the screen-count reconciled
  expect(ps.findings.find((f: { id: string }) => f.id === "V2").resolution).toMatch(/Groq|live/i) // AI proven live
  // D8 — the dep=1 modeling assumption, the four ledger fields
  const d8 = ps.deviationD8
  expect(d8.id).toBe("D8")
  for (const k of ["blueprintLine", "whatWasDone", "why", "lawAuthority"]) expect(String(d8[k]).trim().length).toBeGreaterThan(0)
  expect(d8.whatWasDone).toMatch(/depProtocols=1|dependency=1|default/i)
})

test("PERSISTENCE — the screen set stays the conscious 3 (the Stamp is a SUB-ROUTE, not a screen — V1); a fourth is a Halt", () => {
  expect(ps.screens.count).toBe(3)
  expect(ps.screens.set).toEqual(["shelf", "reality-check", "ask"])
  expect(ps.screens.massScreens).toEqual(["shelf", "reality-check"])
  expect(ps.screens.stampIsASubRoute).toMatch(/sub-route|NOT a screen/i)
})

test("PERSISTENCE — the stress catalog is S1–S24 (24 lines; S22–S24 new: decay · ICIR · live-AI)", () => {
  expect(ps.stressCatalog).toHaveLength(24)
  const ids = ps.stressCatalog.map((s: { id: string }) => s.id)
  expect(ids).toEqual(Array.from({ length: 24 }, (_, k) => `S${k + 1}`))
  expect(ps.stressCatalog.find((s: { id: string }) => s.id === "S22").name).toMatch(/decay/i)
  expect(ps.stressCatalog.find((s: { id: string }) => s.id === "S23").name).toMatch(/ICIR/i)
  expect(ps.stressCatalog.find((s: { id: string }) => s.id === "S24").name).toMatch(/live-AI/i)
})
