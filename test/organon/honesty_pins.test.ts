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

// ── THE CONTRACT-TRUTH SPRINT — the additional pins (data/honesty/contract-pins.json), carried forward from f157da69… ──
const ct = JSON.parse(readFileSync(path.join(H, "contract-pins.json"), "utf8"))
// re-pinned in Phase 2 (EXTRACT-CLEAN): the extraction pin now states the ACTUAL scope — the SIX tools whose pure logic
// feeds the flag categories are ported to src/contract/facts.ts; the four others are consciously NOT ported (cf620520… → 4275f739…)
const CONTRACT_PINS_SHA_GOLDEN = "4275f7396027e7dd016793a2085454c3c7db880c8386e16df7766cc5681f9489"

test("CONTRACT — the pins hash-lock is the pinned golden + self-consistent + carried from the persistence sha (the lock bites)", () => {
  expect(ct.pinsSha).toBe(CONTRACT_PINS_SHA_GOLDEN)
  const { pinsSha, ...rest } = ct
  expect(sha256(JSON.stringify(rest))).toBe(ct.pinsSha) // self-consistent
  expect(ct.carriedFromPinsSha).toBe(PERSISTENCE_PINS_SHA_GOLDEN) // carried forward, never rebuilt
  // POSITIVE CONTROL: dropping the real-build requirement (the fabricated-all-clear risk) changes the sha — the lock bites
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.contractRisk.cleanStructureRequiresRealBuild = false
  expect(sha256(JSON.stringify(mutated))).not.toBe(ct.pinsSha)
})

test("CONTRACT — the contract-risk sub-axis is deterministic, honestly scoped, additive, and NEVER over-claims 'safe' (X-CONTRACT, S25)", () => {
  const c = ct.contractRisk
  expect(c.subAxisName).toBe("contract-risk")
  expect(c.tiers).toEqual(["CLEAN-STRUCTURE", "FLAGGED", "UNVERIFIED"])
  expect(c.material).toBe(false) // ADDITIVE — the sub-axis is non-deciding; the differential is zero (X-KEEP)
  expect(c.cleanStructureRequiresRealBuild).toBe(true) // SAMPLE/absent NEVER a fabricated all-clear (S27)
  // the six structural fact categories, each mapped to the extracted tool that produces it
  expect(c.flagCategories).toHaveLength(6)
  const flagIds = c.flagCategories.map((f: { id: string }) => f.id)
  for (const id of ["unprotected-state-changing", "dangerous-edges", "upgrade-proxy-hazard", "storage-clash", "reentrancy-value-flow", "oracle-dependency"]) expect(flagIds).toContain(id)
  // the tier rule names all three tiers unambiguously
  expect(c.tierRule).toMatch(/FLAGGED/)
  expect(c.tierRule).toMatch(/CLEAN-STRUCTURE/)
  expect(c.tierRule).toMatch(/UNVERIFIED/)
  // the honest scope is a screen NOT a full audit; the over-claim ban is pinned; NO model; off the hot loop
  expect(c.honestScope.label).toMatch(/not a full audit/i)
  expect(c.honestScope.isNot).toMatch(/full audit|guarantee/i)
  expect(c.overClaimBanned).toMatch(/safe|audited|guaranteed/i) // a 'safe'/'audited' claim is a doc-lie Halt
  expect(c.noModel).toMatch(/ZERO LLM|no LLM|X-DETERM/i)
  expect(c.offHotLoop).toMatch(/capture|ZERO compilation|recorded facts/i)
})

test("CONTRACT — the extraction/severance contract is exact: copy-into-tree, coupling severed, only the pure analysis kept, no new dep (D9, S26)", () => {
  const e = ct.extraction
  expect(e.copied).toHaveLength(6)
  expect(e.severed).toHaveLength(2)
  expect(e.dropped).toHaveLength(6)
  // the severance replaces the platform coupling with a plain path — @/util/* and @/project/instance are gone
  expect(e.severed.join(" ")).toMatch(/@\/util/)
  expect(e.severed.join(" ")).toMatch(/@\/project\/instance|path param/i)
  // the DROPPED list refuses the model/fuzzer/RAG + the Tool.define platform (a ported model is a Halt — S25)
  expect(e.dropped.join(" ")).toMatch(/Tool\.define/)
  expect(e.dropped.join(" ")).toMatch(/LLM audit agent|model/i)
  expect(e.dropped.join(" ")).toMatch(/fuzzer|RAG/)
  // owned in-tree, leak wall green, no new npm dep (deps stay hono+zod)
  expect(e.ownedInTree).toMatch(/@solidity-sentinel|dataplane_leak|owned/i)
  expect(e.noNewNpmDep).toMatch(/hono|zod|compiler JSON|no.*dep/i)
  // the SIX tools whose pure logic is ported (they produce the pinned flag categories)
  expect(e.toolsPorted).toEqual(["auth-surface", "call-graph", "upgrade-check", "storage-layout", "value-flow", "state-flow"])
  // the FOUR LLM-free tools consciously NOT ported (their outputs aren't in the sub-axis fact list — PART CLEAN, no dead code)
  expect(e.toolsNotPorted.tools).toEqual(["contract-info", "inheritance-resolver", "dimensional-analysis", "mutation-map"])
  expect(e.toolsNotPorted.why).toMatch(/not in the six pinned|no current caller|speculative|PART CLEAN/i)
})

test("CONTRACT — the Foundry toolchain is an OPTIONAL seam: absent → UNVERIFIED, never a fabricated all-clear (S27)", () => {
  const s = ct.foundryOptionalSeam
  expect(s.toolchainOptional).toBe(true)
  expect(s.massToolRunsWithout).toBe(true)
  expect(s.verifyRunsWithout).toBe(true)
  expect(s.pristineRunsWithout).toBe(true)
  expect(s.absentBehavior).toMatch(/UNVERIFIED/)
  expect(s.absentBehavior).toMatch(/coarse.*screen.*(alone|floor)/i) // the coarse screen still scores
  expect(s.neverFabricatesAllClear).toMatch(/fabricated all-clear|CLEAN-STRUCTURE|Halt/i)
})

test("CONTRACT — the Persistence finding-resolutions P1–P6 are pinned, each with a resolution (continuity hygiene)", () => {
  const ids = ct.persistenceResolutions.map((p: { id: string }) => p.id)
  expect(ids).toEqual(["P1", "P2", "P3", "P4", "P5", "P6"])
  for (const p of ct.persistenceResolutions) { expect(p.finding.trim().length).toBeGreaterThan(0); expect(p.resolution.trim().length).toBeGreaterThan(0); expect(p.status).toMatch(/RESOLVED/) }
  const byId = (id: string) => ct.persistenceResolutions.find((p: { id: string }) => p.id === id).resolution
  expect(byId("P1")).toMatch(/battery-summary|625/i) // the authoritative count named
  expect(byId("P2")).toMatch(/terminal PINS_SHA|final.*marker/i) // the standing rule
  expect(byId("P3")).toMatch(/ask_live/i) // the surviving skip named
  expect(byId("P4")).toMatch(/orthogonal|post-hoc/i) // the two-fence separation
  expect(byId("P5")).toMatch(/re-capturable|X-LIVE|9\.9/i) // the live-value character
  expect(byId("P6")).toMatch(/ARMED|not.*fired|CONSISTENT/i) // the LUMPY firing status
})

test("CONTRACT — D9 (the extraction + coupling-severance) carries its four ledger fields (a silent deviation is a Halt)", () => {
  const d9 = ct.deviationD9
  expect(d9.id).toBe("D9")
  for (const k of ["blueprintLine", "whatWasDone", "why", "lawAuthority"]) expect(String(d9[k]).trim().length).toBeGreaterThan(0)
  expect(d9.whatWasDone).toMatch(/EXTRACTED|src\/contract|severed/i)
  expect(d9.lawAuthority).toMatch(/X-CONTRACT/)
})

test("CONTRACT — the screen set stays the conscious 3 (the contract detail is a Pro row, not a screen); a fourth is a Halt", () => {
  expect(ct.screens.count).toBe(3)
  expect(ct.screens.set).toEqual(["shelf", "reality-check", "ask"])
  expect(ct.screens.massScreens).toEqual(["shelf", "reality-check"])
  expect(ct.screens.contractDetailIsAProRow).toMatch(/Pro row|NOT a screen/i)
})

test("CONTRACT — the stress catalog is S1–S27 (27 lines; S25 contract-honesty · S26 leak-wall/severance · S27 Foundry-absent)", () => {
  expect(ct.stressCatalog).toHaveLength(27)
  const ids = ct.stressCatalog.map((s: { id: string }) => s.id)
  expect(ids).toEqual(Array.from({ length: 27 }, (_, k) => `S${k + 1}`))
  expect(ct.stressCatalog.find((s: { id: string }) => s.id === "S25").name).toMatch(/contract/i)
  expect(ct.stressCatalog.find((s: { id: string }) => s.id === "S26").name).toMatch(/leak|severance/i)
  expect(ct.stressCatalog.find((s: { id: string }) => s.id === "S27").name).toMatch(/Foundry/i)
})

// ── THE BUILD-PROVENANCE SPRINT — the additional pins (data/honesty/verify-pins.json), carried forward from 4275f739… ──
const vf = JSON.parse(readFileSync(path.join(H, "verify-pins.json"), "utf8"))
const VERIFY_PINS_SHA_GOLDEN = "f4e5a4a8f233ec0b4a76775e3a0d1ec7400bcd8de6deb4c4d647b2da1e813177"

test("VERIFY — the pins hash-lock is the pinned golden + self-consistent + carried from the contract sha (the lock bites)", () => {
  expect(vf.pinsSha).toBe(VERIFY_PINS_SHA_GOLDEN)
  const { pinsSha, ...rest } = vf
  expect(sha256(JSON.stringify(rest))).toBe(vf.pinsSha) // self-consistent
  expect(vf.carriedFromPinsSha).toBe(CONTRACT_PINS_SHA_GOLDEN) // carried forward, never rebuilt
  // POSITIVE CONTROL: dropping the REAL/SAMPLE wall (the gravest new risk — a SAMPLE-earned clean tier) changes the sha
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.realSampleWall.cleanStructureRequiresRealBuild = false
  expect(sha256(JSON.stringify(mutated))).not.toBe(vf.pinsSha)
})

test("VERIFY — the REAL/SAMPLE wall is absolute: SAMPLE never earns CLEAN-STRUCTURE; flags are existence-proofs, absence trustworthy only on REAL (S28)", () => {
  const w = vf.realSampleWall
  expect(w.cleanStructureRequiresRealBuild).toBe(true)
  expect(w.sampleNeverClean).toMatch(/never|NEVER/)
  expect(w.sampleNeverClean).toMatch(/CLEAN-STRUCTURE/)
  expect(w.flagsAreExistenceProofs).toMatch(/existence|any analyzed source|REAL or SAMPLE/i)
  expect(w.absenceTrustworthyOnlyOnReal).toMatch(/only on a REAL|verified deployed/i)
  expect(w.haltRule).toMatch(/Halt/)
})

test("VERIFY — the ingestion contract is keyless-first + Operator-gated + no-scrape, BYOK optional + key-safe (X-VERIFY a, S30)", () => {
  const i = vf.ingestion
  expect(i.keylessFirst).toMatch(/keyless/i)
  expect(i.doctrine).toMatch(/Operator-gated/)
  expect(i.doctrine).toMatch(/NOT an automatic mass-path|discrete/i)
  expect(i.noScrape).toMatch(/D4\/D6|ARMED-never-scraped/)
  expect(i.byokOptional).toMatch(/env-only/)
  expect(i.byokOptional).toMatch(/NEVER.*(bundle|log|registry)/)
  expect(i.record).toMatch(/NEVER a fabricated REAL/)
})

test("VERIFY — the build-capture is deterministic + content-addressed + off the hot loop, reusing the analyzer verbatim (X-VERIFY b,c,e; S29)", () => {
  const b = vf.buildCapture
  expect(b.deterministic).toMatch(/byte-identical/)
  expect(b.deterministic).toMatch(/no LLM|no model|X-DETERM/i)
  expect(b.contentAddressed).toMatch(/a single byte.*changes the contentHash|changed byte/i)
  expect(b.reusesAnalyzerVerbatim).toMatch(/UNCHANGED|no re-implementation|X-KEEP/)
  expect(b.offHotLoop).toMatch(/ZERO per-render compilation|reads the content-hashed registry/)
})

test("VERIFY — the coverage-honesty rule + the REAL-tier ceiling are pinned (N of M; never a full audit / a 'safe' verdict — V3/S25)", () => {
  const c = vf.coverageHonesty
  expect(c.rule).toMatch(/N of M/)
  expect(c.rule).toMatch(/NEVER implying more/i)
  expect(c.successCriterion).toMatch(/at least one real protocol|honestly UNVERIFIED/i)
  expect(c.ceiling).toMatch(/not a full audit/i)
  expect(c.ceiling).toMatch(/NEVER a 'safe'|never.*safe/i)
})

test("VERIFY — the Foundry toolchain is an OPTIONAL seam: absent → UNVERIFIED; the clone + verify run without it", () => {
  const s = vf.foundryOptionalSeam
  expect(s.toolchainOptional).toBe(true)
  expect(s.massToolRunsWithout).toBe(true)
  expect(s.verifyRunsWithout).toBe(true)
  expect(s.pristineRunsWithout).toBe(true)
  expect(s.absentBehavior).toMatch(/UNVERIFIED/)
})

test("VERIFY — the Contract-Truth resolutions V1–V5 are pinned (V2 corrects 585→583 + names BUILDLOG-HONESTY; V5 is the spine)", () => {
  expect(vf.contractTruthResolutions.map((v: { id: string }) => v.id)).toEqual(["V1", "V2", "V3", "V4", "V5"])
  const byId = (id: string) => vf.contractTruthResolutions.find((v: { id: string }) => v.id === id)
  expect(byId("V1").resolution).toMatch(/\(\+N|itemized|state every delta/i)
  expect(byId("V2").resolution).toMatch(/583/) // the authoritative Crown-Jewel count
  expect(byId("V2").resolution).not.toMatch(/is 585\/0|stays 585/) // the drift dropped
  expect(byId("V2").resolution).toMatch(/BUILDLOG-HONESTY\.md/) // the Deepening record's real home
  expect(byId("V3").resolution).toMatch(/DORMANT|EXERCISE/)
  expect(byId("V4").resolution).toMatch(/SIX-tool subset/i)
  expect(byId("V5").resolution).toMatch(/SPINE|real Foundry build|end-to-end/i)
})

test("VERIFY — the screen set stays the conscious 3 (the REAL tier is a Pro row); the stress catalog is S1–S30 (S28/S29/S30 new)", () => {
  expect(vf.screens.count).toBe(3)
  expect(vf.screens.set).toEqual(["shelf", "reality-check", "ask"])
  expect(vf.screens.realTierIsAProRow).toMatch(/Pro row|NOT a screen/i)
  expect(vf.stressCatalog).toHaveLength(30)
  expect(vf.stressCatalog.map((s: { id: string }) => s.id)).toEqual(Array.from({ length: 30 }, (_, k) => `S${k + 1}`))
  expect(vf.stressCatalog.find((s: { id: string }) => s.id === "S28").name).toMatch(/REAL\/SAMPLE wall/i)
  expect(vf.stressCatalog.find((s: { id: string }) => s.id === "S29").name).toMatch(/determinism|re-capture/i)
  expect(vf.stressCatalog.find((s: { id: string }) => s.id === "S30").name).toMatch(/ingestion-scope|keyless/i)
})

// ── THE VOICE SPRINT — the additional pins (data/honesty/voice-pins.json), carried forward from f4e5a4a8… ──
const vo = JSON.parse(readFileSync(path.join(H, "voice-pins.json"), "utf8"))
// re-pinned in Phase 6 (STAMP-TIGHT): the MinTRL rider LANDED (mintrlRider.status TO-BUILD → LANDED) — a conscious re-pin (da25beaf… → eb55ce43…)
const VOICE_PINS_SHA_GOLDEN = "eb55ce43d9e053130872e3f75fd729ac33c383c9bd34465e821d18a49832f256"

test("VOICE — the pins hash-lock is the pinned golden + self-consistent + carried from the verify sha (the lock bites)", () => {
  expect(vo.pinsSha).toBe(VOICE_PINS_SHA_GOLDEN)
  const { pinsSha, ...rest } = vo
  expect(sha256(JSON.stringify(rest))).toBe(vo.pinsSha) // self-consistent
  expect(vo.carriedFromPinsSha).toBe(VERIFY_PINS_SHA_GOLDEN) // carried forward, never rebuilt
  // POSITIVE CONTROL: mutating a gate word list (the severity-lexicon ban) changes the sha (the lock bites)
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.gates.severityLexicon.banned = ["safe"]
  expect(sha256(JSON.stringify(mutated))).not.toBe(vo.pinsSha)
})

test("VOICE — the persona is hash-locked: voice-pins holds the Voice-era record (superseded by the Interpreter re-pin D18); an edited record would move PINS_SHA (a re-pin, never a silent edit)", () => {
  // the persona was CONSCIOUSLY re-pinned in the Interpreter sprint (D18): the LIVE hash-lock MOVED to interpret-pins
  // (U-RESUPERSEDE — asserted in the INTERPRET section below); voice-pins.json retains its Voice-era record (a historical
  // pin, superseded not rewritten), so the 8-sprint carry chain is untouched and the Voice pins sha does NOT move.
  expect(vo.persona.sha).toBe("d0d7f18d5d03850fa0d3d1164b4819f1cf08b94ef647065828827e0e26b2fd89") // the Voice-era record, frozen
  expect(vo.persona.rel).toBe("data/honesty/persona.md")
  // the hard rules are present (a persona pinned WITHOUT the hard rules is refused — Phase 0 red-team)
  const rules = vo.persona.hardRules.join(" ")
  expect(rules).toMatch(/only engine facts/i)
  expect(rules).toMatch(/NEVER 'safe'|never.*safe/i)
  expect(rules).toMatch(/NEVER a recommendation|advice wall/i)
  expect(rules).toMatch(/NEVER move a verdict/i)
  expect(vo.persona.instructionNotLaw).toMatch(/DOWNSTREAM|fail-closed/i)
  // POSITIVE CONTROL: an edited persona (a changed sha in the object) changes PINS_SHA — the lock bites on the artifact
  const { pinsSha, ...rest } = vo
  const mutated = JSON.parse(JSON.stringify(rest)); mutated.persona.sha = "0".repeat(64)
  expect(sha256(JSON.stringify(mutated))).not.toBe(vo.pinsSha)
})

test("VOICE — the three-tier contract is typed FACT/REASONING/BOUNDARY; the tier lives in the data model AND the render; the ANALYSIS label is exact", () => {
  expect(vo.contract.blocks).toEqual(["FACT", "REASONING", "BOUNDARY"])
  expect(vo.contract.analysisLabel).toBe("ANALYSIS — not an engine fact")
  expect(vo.contract.tierInDataModelAndRender).toMatch(/DATA MODEL and the RENDER|screenshot/i)
  expect(vo.contract.reasoningBlock).toMatch(/VISIBLY LABELED/i)
  expect(vo.contract.residualDisclosure).toMatch(/checkable|not a verdict/i)
})

test("VOICE — the five deterministic gates carry exact, testable word/shape lists (no vague pin; deterministic only, never model self-check)", () => {
  const g = vo.gates
  expect(g.doctrine).toMatch(/DOWNSTREAM of the model/i)
  expect(g.doctrine).toMatch(/self-verify is refused|deterministic only/i)
  expect(g.numericWhitelist.noModelArithmetic).toBe(true)
  expect(g.verdictGuard.carriedFrom).toMatch(/phrase\.ts/)
  expect(g.comparisonDirection.rule).toMatch(/match the fact ordering/i)
  // the severity lexicon — the banned words are exact + absolute
  for (const w of ["safe", "audited", "risk-free", "guaranteed"]) expect(g.severityLexicon.banned).toContain(w)
  expect(g.severityLexicon.conditional).toEqual(["critical", "severe"])
  // the advice-pattern shapes are exact
  for (const s of ["you should", "we recommend", "buy", "sell", "allocate"]) expect(g.advicePattern.shapes).toContain(s)
})

test("VOICE — the intent enum is EXACTLY 13 + CLOSED (the 8 carried + OUTLOOK · SCENARIO · ADVICE_BOUNDARY · GENERAL · RECORD_HISTORY); a 14th fails the wall", () => {
  expect(vo.intents.count).toBe(13)
  expect(vo.intents.enum).toHaveLength(13)
  expect(vo.intents.closed).toBe(true)
  expect(vo.intents.new5).toEqual(["OUTLOOK", "SCENARIO", "ADVICE_BOUNDARY", "GENERAL", "RECORD_HISTORY"])
  for (const i of ["STRATEGY_LOOKUP", "COMPARE", "OUTLOOK", "ADVICE_BOUNDARY", "GENERAL", "RECORD_HISTORY"]) expect(vo.intents.enum).toContain(i)
  expect(vo.intents.deterministicParity).toMatch(/EVERY.*no-key template|the AI is garnish/i)
  expect(vo.intents.compareUpgrade).toMatch(/n-strategies/i)
  expect(vo.intents.recordHistoryInterpretation).toMatch(/RECORD_HISTORY/) // the interpretation is surfaced, not silent
  // every enum member maps to exactly one tool (the closed map is complete)
  for (const i of vo.intents.enum) expect(typeof vo.intents.intentToTool[i]).toBe("string")
})

test("VOICE — the X-ASK amendment (D11) is Operator-signed typed-rejection; the FACT groundedness gate is UNCHANGED; never a silent drift", () => {
  const a = vo.xAskAmendment
  expect(a.id).toBe("D11")
  expect(a.operatorSigned).toBe(true)
  expect(a.was).toMatch(/whole.answer rejection/i)
  expect(a.now).toMatch(/typed PER-BLOCK rejection|per-block/i)
  expect(a.factGroundednessGateUnchanged).toMatch(/UNCHANGED/)
  expect(a.closedEnumRoutingUnchanged).toBe(true)
})

test("VOICE — the advice wall is law: NEVER a recommendation; 'should we invest?' → facts + framing + boundary; a regulated-activity posture (X-ADVICE)", () => {
  const w = vo.adviceWall
  expect(w.lawStatus).toBe(true)
  expect(w.rule).toMatch(/NEVER recommends/i)
  expect(w.rule).toMatch(/researcher-not-advisor/i)
  expect(w.rationale).toMatch(/REGULATED ACTIVITY/i)
  expect(w.haltRule).toMatch(/Halt/)
})

test("VOICE — the calibration clock is record-only: append-only + hash-chained + engine-derived; NO backfill, NO scoring; the count the only surface (X-CAL / D13)", () => {
  const c = vo.calibration
  expect(c.recordOnly).toBe(true)
  expect(c.appendOnly).toBe(true)
  expect(c.hashChained).toBe(true)
  expect(c.schema).toContain("entryHash")
  expect(c.schema).toContain("prevHash")
  expect(c.engineDerived).toMatch(/NEVER a model/i)
  expect(c.noBackfill).toMatch(/REFUSED|no backfill path/i)
  expect(c.noScoring).toMatch(/no Brier|until real resolutions/i)
  expect(c.recordedAs).toMatch(/D13/)
})

test("VOICE — the per-provider eval harness carries the five metrics + the Operator-gated live path (D12); post-gate leaks are ZERO by construction", () => {
  const e = vo.evalHarness
  expect(e.metrics).toEqual(["gateRejectionRate", "adviceLeakAttemptRate", "verdictContradictionAttemptRate", "numericSmugglingAttemptRate", "templateFallbackRate"])
  expect(e.postGateLeakZero).toMatch(/ZERO by construction/i)
  expect(e.operatorGatedLive).toMatch(/eval_live/)
  expect(e.recordedAs).toMatch(/D12/)
})

test("VOICE — the MinTRL rider suppresses (never caveats) on short T + logs N; PARK-if-tight is an honest park, never a silent drop", () => {
  const m = vo.mintrlRider
  expect(m.rule).toMatch(/MinTRL.*FIRST/i)
  expect(m.rule).toMatch(/SUPPRESSED/i)
  expect(m.suppressionNotCaveat).toMatch(/caveated-but-displayed.*FAIL/i)
  expect(m.verdictSpaceUnchanged).toMatch(/unchanged/i)
  expect(m.parkIfTight).toMatch(/leads the NEXT sprint|never a silent drop/i)
})

test("VOICE — the Build-Provenance findings B1–B5 are pinned resolved (B1 registry inside/outside + digest; B2 denominator; B3 fixture-only; B4 proxy; B5 render)", () => {
  expect(vo.findingResolutions.map((v: { id: string }) => v.id)).toEqual(["B1", "B2", "B3", "B4", "B5"])
  const byId = (id: string) => vo.findingResolutions.find((v: { id: string }) => v.id === id)
  expect(byId("B1").resolution).toMatch(/OUTSIDE the bundle/i)
  expect(byId("B1").resolution).toMatch(/registry-DIGEST|digest line/i)
  expect(byId("B2").resolution).toMatch(/7 applicable.*9 shown|N of M applicable/i)
  expect(byId("B3").resolution).toMatch(/FIXTURE-PROVEN ONLY|zero real-world instances/i)
  expect(byId("B4").resolution).toMatch(/deployed-proxy surface/i)
  expect(byId("B5").resolution).toMatch(/severity-grouped|category-deduped|drawer/i)
  expect(byId("B5").resolution).toMatch(/byte-identical/i)
})

test("VOICE — the screen set stays the conscious 3 (the voice deepens Ask); the stress catalog is S1–S35 (S31–S35 new)", () => {
  expect(vo.screens.count).toBe(3)
  expect(vo.screens.set).toEqual(["shelf", "reality-check", "ask"])
  expect(vo.screens.theVoiceDeepensAsk).toMatch(/FOURTH screen is a Halt/i)
  expect(vo.stressCatalog).toHaveLength(35)
  expect(vo.stressCatalog.map((s: { id: string }) => s.id)).toEqual(Array.from({ length: 35 }, (_, k) => `S${k + 1}`))
  expect(vo.stressCatalog.find((s: { id: string }) => s.id === "S31").name).toMatch(/persona-injection/i)
  expect(vo.stressCatalog.find((s: { id: string }) => s.id === "S32").name).toMatch(/advice wall/i)
  expect(vo.stressCatalog.find((s: { id: string }) => s.id === "S33").name).toMatch(/numeric-smuggling|verdict-contradiction/i)
  expect(vo.stressCatalog.find((s: { id: string }) => s.id === "S34").name).toMatch(/cross-provider|parity/i)
  expect(vo.stressCatalog.find((s: { id: string }) => s.id === "S35").name).toMatch(/calibration/i)
})

test("VOICE — the constitution carries: frozen seven untouched, deps still hono+zod (no prompt framework), the differential + probe carried", () => {
  expect(vo.carried.deps).toEqual(["hono", "zod"]) // NO NLP library, NO prompt framework, NO new npm dep
  expect(vo.carried.frozenSeven).toMatch(/byte-untouched/i)
  expect(vo.carried.frozenSeven).toMatch(/ZERO model output become a fact/i)
  expect(vo.carried.verdictDifferential).toMatch(/70c7912f/)
  expect(vo.carried.verdictDifferential).toMatch(/0a63151b/)
  expect(vo.carried.probe).toMatch(/NEXT sprint MUST run the demand probe/i)
})

// ── THE SURFACE SPRINT — the additional pins (data/honesty/surface-pins.json), carried forward from eb55ce43… ──
const su = JSON.parse(readFileSync(path.join(H, "surface-pins.json"), "utf8"))
const SURFACE_PINS_SHA_GOLDEN = "b01799989edd2f1f15a9003035ca60cf0ed75457bfa1e2a268c3c8f231cf750f"

test("SURFACE — the pins hash-lock is the pinned golden + self-consistent + carried from the voice sha (the lock bites)", () => {
  expect(su.pinsSha).toBe(SURFACE_PINS_SHA_GOLDEN)
  const { pinsSha, ...rest } = su
  expect(sha256(JSON.stringify(rest))).toBe(su.pinsSha) // self-consistent
  expect(su.carriedFromPinsSha).toBe(VOICE_PINS_SHA_GOLDEN) // carried forward, never rebuilt
  // POSITIVE CONTROL: mutating a semantic verdict-word list changes the sha (the lock bites)
  const mutated = JSON.parse(JSON.stringify(rest))
  mutated.semanticContract.verdictWords = ["SOLID"]
  expect(sha256(JSON.stringify(mutated))).not.toBe(su.pinsSha)
})

// ── THE REDESIGN RE-PIN (U-RESUPERSEDE) — the live token + DESIGN.md hash-lock MOVED to redesign-pins.json; the Surface
// record above is retained as SUPERSEDED HISTORY (never rewritten), exactly like the Interpreter persona re-pin. ──
const rd = JSON.parse(readFileSync(path.join(H, "redesign-pins.json"), "utf8"))

test("SURFACE — the design tokens are hash-locked; the identity was RE-PINNED by the Redesign supersession (the live lock moved to redesign-pins; the Surface record is preserved as history — a conscious re-pin, never a silent restyle)", () => {
  // the Surface record is RETAINED (superseded, not rewritten) — its rel + prose stand as the historical baseline
  expect(su.tokens.rel).toBe("data/honesty/design-tokens.json")
  expect(su.tokens.builtNotHandEdited).toMatch(/BUILT from these tokens|never hand-edited/i)
  expect(su.tokens.consciousRePin).toMatch(/conscious re-pin|never a silent/i)
  // the LIVE design-tokens.json + DESIGN.md now hash to the REDESIGN pin (the live hash-lock moved here — U-RESUPERSEDE)
  expect(sha256(readFileSync(path.join(PKG_ROOT, rd.tokensRepin.rel), "utf8"))).toBe(rd.tokensRepin.tokens.sha)
  expect(sha256(readFileSync(path.join(PKG_ROOT, rd.tokensRepin.designMd.rel), "utf8"))).toBe(rd.tokensRepin.designMd.sha)
  // the re-pin records EXACTLY the Surface-era sha it supersedes (the chain is explicit; the Surface record IS that baseline)
  expect(rd.tokensRepin.supersedes.tokens).toBe(su.tokens.sha)
  expect(rd.tokensRepin.supersedes.designMd).toBe(su.tokens.designMd.sha)
  expect(rd.tokensRepin.tokens.sha).not.toBe(su.tokens.sha) // the sha MOVED (a real re-pin, not a no-op)
  // POSITIVE CONTROL: an edited token (a changed sha in the object) changes PINS_SHA — the lock bites on the artifact
  const { pinsSha, ...rest } = su
  const mutated = JSON.parse(JSON.stringify(rest)); mutated.tokens.sha = "0".repeat(64)
  expect(sha256(JSON.stringify(mutated))).not.toBe(su.pinsSha)
})

test("SURFACE — the semantic contract: trust tiers, REAL/SAMPLE, verdict+Stamp words each a NON-COLOR cue never color-alone; the ANALYSIS label rendered; cues via CSS not content", () => {
  const s = su.semanticContract
  expect(s.verdictWords).toEqual(["SOLID", "CAUTION", "AVOID", "UNVERIFIED"])
  expect(s.stampWords).toEqual(["GO", "NO-GO", "INSUFFICIENT", "UNAVAILABLE"])
  expect(s.nonColorCueRule).toMatch(/NEVER color alone/i)
  expect(s.realSampleCue).toMatch(/SOLID border|DASHED border/i)
  expect(s.analysisLabelRendered).toMatch(/rendered adjacent|screenshot/i)
  expect(s.analysisLabelRendered).toMatch(/FACT treatment is a Halt/i)
  expect(s.wcagAA).toMatch(/4\.5:1|WCAG-AA/)
  expect(s.cuesViaCssNotContent).toMatch(/HTML CONTENT is byte-untouched|S36/i) // the semantic upgrade cannot move a fact
  expect(s.trustTiers.REASONING).toMatch(/ANALYSIS — not an engine fact/)
})

test("SURFACE — the detector gate (S38) is deterministic no-LLM/no-key, skips honestly when absent, and every exception is reasoned (the constitution outranks the detector)", () => {
  const d = su.detectorGate
  expect(d.tool).toMatch(/deterministic.*detector/i)
  expect(d.tool).toMatch(/NO LLM.*NO API key|no key/i)
  expect(d.wiredAs).toMatch(/S38.*surface_detector/i)
  expect(d.skipWhenAbsent).toMatch(/pristine.*ABSENT|SKIPS honestly/i)
  expect(d.skipWhenAbsent).toMatch(/ask_live.*eval_live.*surface_detector/i) // the named skip set grows
  expect(d.constitutionOutranksDetector).toMatch(/REFUSED|Attack-11/i)
  // every committed exception carries a reason (a silent suppression is refused)
  expect(Array.isArray(d.committedExceptions)).toBe(true)
  for (const ex of d.committedExceptions) { expect(typeof ex.rule).toBe("string"); expect(ex.reason.length).toBeGreaterThan(20) }
  expect(d.committedExceptions.map((e: { rule: string }) => e.rule)).toContain("em-dash-overuse")
})

test("SURFACE — dev-time-only + honesty-preserving: impeccable never a runtime dep (deps hono+zod), a restyle never moves a fact (S36, checked per screen)", () => {
  const dev = su.devTimeOnly
  expect(dev.deps).toEqual(["hono", "zod"])
  expect(dev.rule).toMatch(/DEV-TIME-ONLY/)
  expect(dev.haltRule).toMatch(/CSS framework|CSS-in-JS/i)
  expect(dev.haltRule).toMatch(/pristine.*GREEN.*ABSENT|entirely absent/i)
  expect(dev.gitignore).toMatch(/gitignored EXCEPT.*config\.json/i)
  const h = su.honestyPreserving
  expect(h.rule).toMatch(/NEVER alter a number, a label, a tier, a verdict/i)
  expect(h.mechanism).toMatch(/keyed on the existing semantic classes|byte-untouched/i)
  expect(h.checkedPerScreen).toMatch(/byte-identical.*PER SCREEN|per screen/i)
  expect(h.haltRule).toMatch(/hides a SAMPLE|drops the ANALYSIS label/i)
})

test("SURFACE — the Voice findings V1–V5 are pinned resolved (intent-lineage, reconciliation line, eval scope, ANALYSIS-render, denominators)", () => {
  expect(su.findingResolutions.map((v: { id: string }) => v.id)).toEqual(["V1", "V2", "V3", "V4", "V5"])
  const byId = (id: string) => su.findingResolutions.find((v: { id: string }) => v.id === id)
  expect(byId("V1").resolution).toMatch(/COMPARE PRE-EXISTED|caught blueprint-arithmetic/i)
  expect(byId("V1").resolution).toMatch(/RECORD_HISTORY/)
  expect(byId("V2").resolution).toMatch(/703 → 768/)
  expect(byId("V3").resolution).toMatch(/only Groq was measured LIVE/i)
  expect(byId("V3").resolution).toMatch(/SHARED-GATE ARCHITECTURE/i)
  expect(byId("V4").resolution).toMatch(/RENDERED.*adjacent|render assertion/i)
  expect(byId("V5").resolution).toMatch(/denominator|attack-set size/i)
})

test("SURFACE — D14/D15 pinned + the findings_closed_v naming collision caught (not silently overwritten)", () => {
  expect(su.deviations.D14).toMatch(/design system|design-tokens\.json/i)
  expect(su.deviations.D15).toMatch(/DEV-TIME-ONLY|detector/i)
  expect(su.deviations.namingCorrection).toMatch(/findings_closed_v.*already exists|findings_closed_voice/i)
  // the collision is real: the existing findings_closed_v is Build-Provenance's, and the new closure is findings_closed_voice
  expect(existsSync(path.join(PKG_ROOT, "test/organon/findings_closed_v.test.ts"))).toBe(true)
})

test("SURFACE — the screen set stays the conscious 3 (impeccable polishes, never adds); the stress catalog is S1–S38 (S36–S38 new)", () => {
  expect(su.screens.count).toBe(3)
  expect(su.screens.set).toEqual(["shelf", "reality-check", "ask"])
  expect(su.screens.surfacePolishesNotAdds).toMatch(/NEVER adds a fourth|a fourth screen/i)
  expect(su.stressCatalog).toHaveLength(38)
  expect(su.stressCatalog.map((s: { id: string }) => s.id)).toEqual(Array.from({ length: 38 }, (_, k) => `S${k + 1}`))
  expect(su.stressCatalog.find((s: { id: string }) => s.id === "S36").name).toMatch(/honesty-preserving/i)
  expect(su.stressCatalog.find((s: { id: string }) => s.id === "S37").name).toMatch(/a11y|degraded/i)
  expect(su.stressCatalog.find((s: { id: string }) => s.id === "S38").name).toMatch(/detector/i)
})

test("SURFACE — the constitution carries: frozen seven untouched, deps hono+zod, the differential carried, the probe unforgivably overdue", () => {
  expect(su.carried.deps).toEqual(["hono", "zod"])
  expect(su.carried.frozenSeven).toMatch(/byte-untouched/i)
  expect(su.carried.frozenSeven).toMatch(/changes ZERO facts|moves ZERO verdicts/i)
  expect(su.carried.verdictDifferential).toMatch(/70c7912f/)
  expect(su.carried.verdictDifferential).toMatch(/0a63151b/)
  expect(su.carried.probe).toMatch(/UNFORGIVABLY OVERDUE|NEXT sprint MUST run/i)
})

// ── THE SOVEREIGN SPRINT — the additional pins (data/honesty/sovereign-pins.json), carried forward from b0179998… ──
const sv = JSON.parse(readFileSync(path.join(H, "sovereign-pins.json"), "utf8"))
const SOVEREIGN_PINS_SHA_GOLDEN = "6fac4e94436c20a8ab6cc0eb8ae08f7c7575ef077cbb887734d469a46ac9f403"

test("SOVEREIGN — the pins hash-lock is the pinned golden + self-consistent + carried from the surface sha (the lock bites)", () => {
  expect(sv.pinsSha).toBe(SOVEREIGN_PINS_SHA_GOLDEN)
  const { pinsSha, ...rest } = sv
  expect(sha256(JSON.stringify(rest))).toBe(sv.pinsSha) // self-consistent: the stored sha covers exactly the rest
  expect(sv.carriedFromPinsSha).toBe(SURFACE_PINS_SHA_GOLDEN) // carried forward, never rebuilt
  const mutated = JSON.parse(JSON.stringify(rest)); mutated.plane.divergence.tolerancePct = 999
  expect(sha256(JSON.stringify(mutated))).not.toBe(sv.pinsSha) // a moved pin moves the sha
})

test("SOVEREIGN — the blueprint is hash-locked (a changed planning doc moves the pinned sha; gitignored on a fresh clone → the pinned sha is the durable record)", () => {
  const abs = path.join(PKG_ROOT, sv.blueprint.rel)
  if (!existsSync(abs)) {
    // the blueprint is gitignored (absent on a pristine clone) — the pinned sha is the durable record (the standing pattern)
    expect(sv.blueprint.sha).toMatch(/^[0-9a-f]{64}$/)
    return
  }
  expect(sha256(readFileSync(abs, "utf8"))).toBe(sv.blueprint.sha)
})

test("SOVEREIGN — X-PLANE(a): EXACTLY the three narrow pinned paths, each enumerated; a fourth requires a re-pin (the fence is a pin)", () => {
  const p = sv.plane
  expect(p.pathList.map((x: { id: string }) => x.id)).toEqual(["FUNDING-HISTORY", "POOL-EVENTS", "RPC-STATE"])
  // FUNDING-HISTORY: keyless HL info + Binance/Bybit public archives
  const fh = p.pathList.find((x: { id: string }) => x.id === "FUNDING-HISTORY")
  expect(fh.module).toBe("src/plane/funding.ts")
  expect(fh.sources.some((s: { name: string }) => /Hyperliquid/i.test(s.name))).toBe(true)
  expect(fh.sources.some((s: { name: string }) => /Binance/i.test(s.name))).toBe(true)
  expect(fh.sources.some((s: { name: string }) => /Bybit/i.test(s.name))).toBe(true)
  // POOL-EVENTS: HyperSync, ONLY the enumerated events, token an OPTIONAL seam
  const pe = p.pathList.find((x: { id: string }) => x.id === "POOL-EVENTS")
  expect(pe.module).toBe("src/plane/events.ts")
  expect(pe.enumeratedEvents).toEqual(["rate-update", "tvl-move", "liquidity-move"])
  expect(pe.fence).toMatch(/NEVER a full-protocol index|un-enumerated.*ignored/i)
  // RPC-STATE: rotating free RPCs, source recorded per read
  const rs = p.pathList.find((x: { id: string }) => x.id === "RPC-STATE")
  expect(rs.module).toBe("src/plane/rpcstate.ts")
  expect(Array.isArray(rs.rotation)).toBe(true); expect(rs.rotation.length).toBeGreaterThanOrEqual(3)
  expect(p.fourthPathRequiresRePin).toMatch(/conscious re-pin|general indexer.*Halt|archive node.*Halt/i)
})

test("SOVEREIGN — X-PLANE(c,d,e,f): gaps stay gaps · divergence surfaced · honest-improvement-only · the kill-condition armed", () => {
  const p = sv.plane
  // (c) gap-honest / no-fabrication
  expect(p.gapHonest.rule).toMatch(/GAP STAYS A GAP|no interpolation|no backfill/i)
  expect(p.gapHonest.haltRule).toMatch(/fabricated.*Halt|S39/i)
  expect(p.gapHonest.recaptureStable).toMatch(/hash-stable/i)
  expect(p.gapHonest.degradeHonest).toMatch(/NOT stamped own-plane|Attack-8/i)
  // (d) divergence surfaced, never silently resolved
  expect(p.divergence.rule).toMatch(/SURFACED|never silently resolved/i)
  expect(typeof p.divergence.tolerancePct).toBe("number")
  expect(p.divergence.haltRule).toMatch(/auto-resolved.*Halt|NEITHER value replaced/i)
  // (e) honest improvement only — the math untouched, the frozen goldens read byte-untouched inputs
  expect(p.honestImprovement.mathUntouched).toMatch(/BYTE-UNTOUCHED|goldens reproduce/i)
  expect(p.honestImprovement.tracedToObservations).toMatch(/observation count|MinTRL|nudged.*Halt/i)
  expect(p.honestImprovement.separateGolden).toMatch(/70c7912f/); expect(p.honestImprovement.separateGolden).toMatch(/0a63151b/)
  // (f) the kill-condition armed in writing
  expect(p.killCondition.threshold).toMatch(/1 day\/week|adapter rot/i)
  expect(p.killCondition.exit).toMatch(/DeFiLlama Pro|\$300|narrow/i)
  expect(p.killCondition.armed).toMatch(/pinned in writing|S40|upkeep ledger/i)
  // (b) HyperSync optional seam
  expect(sv.plane.hyperSyncSeam.envKey).toBe("HYPERSYNC_TOKEN")
  expect(sv.plane.hyperSyncSeam.optional).toMatch(/OPTIONAL seam|absent.*degrade|never crash/i)
  expect(sv.plane.hyperSyncSeam.neverShipped).toMatch(/NO SDK ships|plain fetch/i)
})

test("SOVEREIGN — X-DESIGNPASS (D16): critique RUN for real (design-review + detector), browser/live NOT run, tokens byte-frozen, walls continuous, clarify chrome-only", () => {
  const d = sv.designPass
  expect(d.critiqueRunForReal).toMatch(/design-review sub-agent|Assessment A/i)
  expect(d.critiqueRunForReal).toMatch(/detector|Assessment B/i)
  expect(d.honestBound).toMatch(/NOT run|no browser automation/i) // the browser/live flow honestly not run
  expect(d.honestBound).toMatch(/SOURCE-BASED|disclosed/i)
  expect(d.tokensStayFrozen).toMatch(/BYTE-FROZEN|hash-locked into the Surface pin|b0179998/i)
  expect(d.wallsContinuous).toMatch(/S36.*detector.*dep.*a11y|CONTINUOUSLY/i)
  expect(d.clarifyChromeOnly).toMatch(/CHROME copy only|NEVER a data label/i)
  expect(d.screenCount).toBe(3)
  expect(d.haltRule).toMatch(/aesthetics only|not approvable away|Halt/i)
})

test("SOVEREIGN — the Surface findings SF1–SF5 are pinned resolved (framing led-with · 804=807−3 · a11y method scope · V4 evidence shape · the pass RUN)", () => {
  const ids = sv.sfResolutions.map((v: { id: string }) => v.id)
  expect(ids).toEqual(["SF1", "SF2", "SF3", "SF4", "SF5"])
  for (const v of sv.sfResolutions) { expect(v.finding.trim().length).toBeGreaterThan(0); expect(v.resolution.trim().length).toBeGreaterThan(0); expect(v.status).toBe("RESOLVED") }
  const byId = (id: string) => sv.sfResolutions.find((v: { id: string }) => v.id === id).resolution
  expect(byId("SF1")).toMatch(/LED WITH|interactive CRITIQUE for real/i)
  expect(byId("SF2")).toMatch(/807 . 3|807.*3.*804|N=3/i) // the off-by-one dies: pristine = 807 − 3
  expect(byId("SF3")).toMatch(/COMPUTED.*DOM-ASSERTED|browser.*AT.*follow-up/i)
  expect(byId("SF4")).toMatch(/RENDERED-OUTPUT|deterministic proxy|inference/i)
  expect(byId("SF5")).toMatch(/RUN as this sprint's Spine A|X-DESIGNPASS/i)
})

test("SOVEREIGN — D16/D17 are pinned + Operator-signed (the directive to execute IS the sign-off, recorded not fabricated)", () => {
  expect(sv.deviations.D16).toMatch(/design-pass|aesthetics pre-approved/i)
  expect(sv.deviations.D17).toMatch(/three narrow|plane scope|kill-condition armed/i)
  expect(sv.deviations.operatorSignedNote).toMatch(/directed the coding agent|directive to execute.*sign-off/i)
  // the full ledger entries exist in deviations.json (a silent deviation is a Halt)
  const dev = JSON.parse(readFileSync(path.join(H, "deviations.json"), "utf8"))
  const d16 = dev.deviations.find((x: { id: string }) => x.id === "D16")
  const d17 = dev.deviations.find((x: { id: string }) => x.id === "D17")
  for (const d of [d16, d17]) { expect(d).toBeDefined(); for (const k of ["blueprintLine", "whatWasDone", "why", "lawAuthority"]) expect(String(d[k]).trim().length).toBeGreaterThan(0) }
  expect(d16.lawAuthority).toMatch(/X-DESIGNPASS/)
  expect(d17.lawAuthority).toMatch(/X-PLANE/)
})

test("SOVEREIGN — the screen set stays the conscious 3 (the divergence row is a ROW, not a screen); the stress catalog is S1–S41 (S39–S41 new)", () => {
  expect(sv.screens.count).toBe(3)
  expect(sv.screens.set).toEqual(["shelf", "reality-check", "ask"])
  expect(sv.screens.designPassReshapesNotAdds).toMatch(/NEVER adds a fourth|divergence row is a ROW/i)
  expect(sv.stressCatalog).toHaveLength(41)
  expect(sv.stressCatalog.map((s: { id: string }) => s.id)).toEqual(Array.from({ length: 41 }, (_, k) => `S${k + 1}`))
  expect(sv.stressCatalog.find((s: { id: string }) => s.id === "S39").name).toMatch(/plane provenance|no-fabricated-history/i)
  expect(sv.stressCatalog.find((s: { id: string }) => s.id === "S40").name).toMatch(/narrow-path fence|kill-condition/i)
  expect(sv.stressCatalog.find((s: { id: string }) => s.id === "S41").name).toMatch(/design-pass honesty/i)
})

test("SOVEREIGN — the constitution carries: frozen seven + tokens byte-frozen, deps hono+zod, the differential carried (bybit ILLUSTRATIVE), the probe with no prerequisites left", () => {
  expect(sv.carried.deps).toEqual(["hono", "zod"])
  expect(sv.carried.frozenSeven).toMatch(/byte-untouched/i)
  expect(sv.carried.frozenSeven).toMatch(/fabricate ZERO history points|move ZERO verdicts/i)
  expect(sv.carried.designSystemUnchangedInTokens).toMatch(/UNCHANGED in token values|frozen Surface golden b0179998/i)
  expect(sv.carried.verdictDifferential).toMatch(/70c7912f/)
  expect(sv.carried.verdictDifferential).toMatch(/0a63151b/)
  expect(sv.carried.verdictDifferential).toMatch(/bybit stays ILLUSTRATIVE/i)
  expect(sv.carried.probe).toMatch(/no prerequisites left|UNFORGIVABLY|LAST prerequisites/i)
})

// ── THE INTERPRETER SPRINT — the additional pins (data/honesty/interpret-pins.json), carried forward from 6fac4e94… ──
const iv = JSON.parse(readFileSync(path.join(H, "interpret-pins.json"), "utf8"))
const INTERPRET_PINS_SHA_GOLDEN = "f09fd743847849a6cf9545887549edefbed8d2c687a9f8b1eb62fe772927d274"

test("INTERPRET — the pins hash-lock is the pinned golden + self-consistent + carried from the sovereign sha (the lock bites)", () => {
  expect(iv.pinsSha).toBe(INTERPRET_PINS_SHA_GOLDEN)
  const { pinsSha, ...rest } = iv
  expect(sha256(JSON.stringify(rest))).toBe(iv.pinsSha) // self-consistent: the stored sha covers exactly the rest
  expect(iv.carriedFromPinsSha).toBe(SOVEREIGN_PINS_SHA_GOLDEN) // carried forward, never rebuilt
  const mutated = JSON.parse(JSON.stringify(rest)); mutated.register.simpleBand.maxChars = 99999
  expect(sha256(JSON.stringify(mutated))).not.toBe(iv.pinsSha) // a moved pin moves the sha
})

test("INTERPRET — the blueprint is hash-locked (a changed planning doc moves the pinned sha; gitignored on a fresh clone → the pinned sha is the durable record)", () => {
  const abs = path.join(PKG_ROOT, iv.blueprint.rel)
  if (!existsSync(abs)) { expect(iv.blueprint.sha).toMatch(/^[0-9a-f]{64}$/); return }
  expect(sha256(readFileSync(abs, "utf8"))).toBe(iv.blueprint.sha)
})

test("INTERPRET — X-INTERPRET(a): the five gates listed UNCHANGED IN HEIGHT, re-run on the wider output; the FACT groundedness gate byte-untouched; a lowered wall is a Halt", () => {
  const l = iv.lane
  expect(l.doctrine).toMatch(/interpret FACTS|never.*assert non-facts|floor is the same height/i)
  expect(l.interpretiveLatitude.length).toBeGreaterThanOrEqual(4)
  // EXACTLY the five deterministic gates, named — none dropped, none loosened (the lock records their invariance)
  expect(l.gatesUnchanged.map((g: { id: string }) => g.id)).toEqual(["numericWhitelist", "verdictGuard", "comparisonDirection", "severityLexicon", "advicePattern"])
  expect(l.factGroundednessUntouched).toMatch(/BYTE-UNCHANGED|verifyGroundedness/i)
  expect(l.haltRule).toMatch(/lowered to let an explanation through is a Halt|S44/i)
  expect(l.haltRule).toMatch(/smuggled derived number|ADVICE boundary|moved verdict/i) // positive-controlled walls named
})

test("INTERPRET — X-INTERPRET(b): the register rubric is present + testable (Simple jargon-free ≤ band; Pro names axis + provenance ≥ band; identical → fail) — S42", () => {
  const r = iv.register
  expect(r.module).toBe("src/ask/register.ts")
  expect(Array.isArray(r.jargonList) && r.jargonList.length).toBeGreaterThanOrEqual(10)
  for (const t of ["ICIR", "deflated", "apyBase", "proxy-surface", "MinTRL"]) expect(r.jargonList).toContain(t) // the load-bearing jargon
  expect(Array.isArray(r.axisTerms) && r.axisTerms.length).toBeGreaterThan(0)
  expect(Array.isArray(r.provenanceTerms) && r.provenanceTerms.length).toBeGreaterThan(0)
  expect(typeof r.simpleBand.maxChars).toBe("number")
  expect(r.simpleBand.jargonForbidden).toBe(true)
  expect(r.simpleBand.mustLeadWithCatch).toBe(true)
  expect(typeof r.proBand.minChars).toBe("number")
  expect(r.proBand.mustNameAxis).toBe(true); expect(r.proBand.mustCiteProvenance).toBe(true)
  expect(r.mustDiffer).toMatch(/must DIFFER|identical . fail/i)
  expect(r.haltRule).toMatch(/REJECTED to the correctly-registered|S42/i)
})

test("INTERPRET — X-INTERPRET(c): the persona is RE-PINNED (D18) — the live hash-lock lives HERE (supersedes the Voice-era record); the FACT groundedness gate untouched", () => {
  const p = iv.personaRepin
  expect(p.rel).toBe("data/honesty/persona.md")
  // the LIVE persona.md now hashes to THIS pin (the live lock moved here — U-RESUPERSEDE)
  expect(sha256(readFileSync(path.join(PKG_ROOT, p.rel), "utf8"))).toBe(p.sha)
  expect(p.sha).not.toBe("d0d7f18d5d03850fa0d3d1164b4819f1cf08b94ef647065828827e0e26b2fd89") // the sha MOVED (a re-pin)
  expect(p.supersedes).toBe("d0d7f18d5d03850fa0d3d1164b4819f1cf08b94ef647065828827e0e26b2fd89") // the Voice-era record it supersedes
  expect(p.what).toMatch(/explain|say what it MEANS|exemplars/i)
  expect(p.factGroundednessGateUntouched).toMatch(/BYTE-UNCHANGED|verifyGroundedness/i)
  expect(p.note).toMatch(/no cascade|supersed|voice-pins.*unchanged/i)
  // the re-pinned persona actually carries the explain-not-restate instruction + both register exemplars (not just a hash)
  const persona = readFileSync(path.join(PKG_ROOT, p.rel), "utf8")
  expect(persona).toMatch(/Explain . don't restate|say what it MEANS|never repeat it as/i)
  expect(persona).toMatch(/Explain \(Simple\)/); expect(persona).toMatch(/Explain \(Pro\)/)
  expect(persona).toMatch(/researcher/) // the advice-wall posture carried (voice_contract still green)
})

test("INTERPRET — X-INTERPRET(d): the three-layer truncation contract is present (CSS-flow + cap-scaler/detector + explicit fact-budget); CSS alone refused — S43", () => {
  const t = iv.truncation
  expect(t.doctrine).toMatch(/all THREE|CSS alone.*worse|subtly-incomplete/i)
  expect(t.cssLayer.fix).toMatch(/flows\/scrolls|wraps|no fixed-height/i)
  expect(t.cssLayer.s36).toMatch(/byte-identical|container change, not a content change/i)
  expect(t.outputCapLayer.fix).toMatch(/SCALED to the fact-set size|truncated finish DETECTED|never a silent cut/i)
  expect(t.factBudgetLayer.fix).toMatch(/EXPLICIT|NAMES which|never a silent drop/i)
  expect(t.haltRule).toMatch(/CSS alone is REFUSED|clip.*silent cut.*silent drop|S43/i)
})

test("INTERPRET — X-INTERPRET(e): COMPARE = n FACT blocks + ONE comparative REASONING block (every number tracing, every direction matching, parity holding)", () => {
  const c = iv.compare
  expect(c.shape).toMatch(/n FACT blocks.*ONE comparative|never n restatements/i)
  expect(c.everyNumberTraces).toBe(true)
  expect(c.everyDirectionMatches).toMatch(/comparison-direction|reversed comparison rejects/i)
  expect(c.parity).toMatch(/no key|template comparison|no crash/i)
})

test("INTERPRET — the Sovereign follow-ups SV1–SV5 are pinned resolved (coverage line · band surface · source-based qualifier · a11y follow-up · POOL-EVENTS attempt-or-gap)", () => {
  const ids = iv.svResolutions.map((v: { id: string }) => v.id)
  expect(ids).toEqual(["SV1", "SV3", "SV4", "SV5", "SV2"])
  const byId = (id: string) => iv.svResolutions.find((v: { id: string }) => v.id === id)
  expect(byId("SV1").resolution).toMatch(/FUNDING-HISTORY.*live|RPC-STATE.*single|POOL-EVENTS.*NOT live/i)
  expect(byId("SV1").status).toBe("RESOLVED")
  expect(byId("SV3").resolution).toMatch(/NOT.*moving a rendered.*verdict|Stamp\/facts/i)
  expect(byId("SV4").resolution).toMatch(/SOURCE review|not a.*screenshot|no browser automation/i)
  expect(byId("SV5").resolution).toMatch(/COMPUTED.*DOM-ASSERTED|browser.*assistive-technology.*follow-up/i)
  // SV2 must NOT claim done — it is an explicit attempt-or-honest-gap
  expect(byId("SV2").resolution).toMatch(/attempt-or-honest-gap|honest NAMED gap|never silently 'done'/i)
  expect(byId("SV2").status).not.toBe("RESOLVED")
})

test("INTERPRET — D18/D19 are pinned + Operator-signed (the directive to execute IS the sign-off, recorded not fabricated); the ledger carries the full entries", () => {
  expect(iv.deviations.D18).toMatch(/reasoning-lane amendment|interpretive latitude|walls unchanged/i)
  expect(iv.deviations.D19).toMatch(/user-POV drive|fix.*on.*the.*fly|logged/i)
  expect(iv.deviations.operatorSignedNote).toMatch(/directed the coding agent|directive to execute.*sign-off/i)
  const dev = JSON.parse(readFileSync(path.join(H, "deviations.json"), "utf8"))
  const d18 = dev.deviations.find((x: { id: string }) => x.id === "D18")
  const d19 = dev.deviations.find((x: { id: string }) => x.id === "D19")
  for (const d of [d18, d19]) { expect(d).toBeDefined(); for (const k of ["blueprintLine", "whatWasDone", "why", "lawAuthority"]) expect(String(d[k]).trim().length).toBeGreaterThan(0) }
  expect(d18.lawAuthority).toMatch(/X-INTERPRET/)
  expect(d19.lawAuthority).toMatch(/X-DOGFOOD/)
})

test("INTERPRET — X-DOGFOOD (D19): the user-POV drive covers the full matrix + fixes on the fly (a wall issue routed like a defect, never patched by lowering a wall)", () => {
  const d = iv.dogfood
  expect(d.doctrine).toMatch(/proved the WALLS|EXPERIENCE is poor|drive the whole system as a user/i)
  expect(Array.isArray(d.matrix) && d.matrix.length).toBeGreaterThanOrEqual(5)
  expect(d.fixOnTheFly).toMatch(/reproduce.*root-cause.*re-test.*log|cause . fix . result/i)
  expect(d.haltRule).toMatch(/moves a fact\/verdict.*REFUSED|lowers a wall.*REFUSED|routed like/i)
})

test("INTERPRET — the screen set stays the conscious 3 (the Ask learns to explain, NO fourth screen/register); the stress catalog is S1–S44 (S42–S44 new)", () => {
  expect(iv.screens.count).toBe(3)
  expect(iv.screens.set).toEqual(["shelf", "reality-check", "ask"])
  expect(iv.screens.askLearnsToExplain).toMatch(/NO fourth screen, NO fourth register|INTERPRET/i)
  expect(iv.stressCatalog).toHaveLength(44)
  expect(iv.stressCatalog.map((s: { id: string }) => s.id)).toEqual(Array.from({ length: 44 }, (_, k) => `S${k + 1}`))
  expect(iv.stressCatalog.find((s: { id: string }) => s.id === "S42").name).toMatch(/register differentiation/i)
  expect(iv.stressCatalog.find((s: { id: string }) => s.id === "S43").name).toMatch(/three-layer truncation/i)
  expect(iv.stressCatalog.find((s: { id: string }) => s.id === "S44").name).toMatch(/interpretation-not-restatement|walls-hold/i)
})

test("INTERPRET — the constitution carries: frozen seven byte-untouched + zero verdicts moved, deps hono+zod, the differential carried, the probe with no prerequisites left", () => {
  expect(iv.carried.deps).toEqual(["hono", "zod"])
  expect(iv.carried.frozenSeven).toMatch(/byte-untouched/i)
  expect(iv.carried.frozenSeven).toMatch(/moves ZERO verdicts|invents ZERO numbers|gives ZERO advice/i)
  expect(iv.carried.verdictDifferential).toMatch(/70c7912f/)
  expect(iv.carried.verdictDifferential).toMatch(/0a63151b/)
  expect(iv.carried.designSystemUnchangedInTokens).toMatch(/UNCHANGED in token values|S36 content golden byte-identical/i)
  expect(iv.carried.voiceUnchangedInContentExceptPersona).toMatch(/persona re-pin|five gates.*UNMODIFIED|advice wall/i)
  expect(iv.carried.probe).toMatch(/no prerequisites left|Stage-0|10-customer/i)
})

// ── THE LINEAGE SPRINT — the additional pins (data/honesty/lineage-pins.json), carried forward from f09fd743… ──
const lv = JSON.parse(readFileSync(path.join(H, "lineage-pins.json"), "utf8"))
const LINEAGE_PINS_SHA_GOLDEN = "ed4bb2cb8957f244927f5e00daf7ddd0d1408abf984dd1fe40ff0557f61bd42f"

test("LINEAGE — the pins hash-lock is the pinned golden + self-consistent + carried from the interpret sha (the lock bites)", () => {
  expect(lv.pinsSha).toBe(LINEAGE_PINS_SHA_GOLDEN)
  const { pinsSha, ...rest } = lv
  expect(sha256(JSON.stringify(rest))).toBe(lv.pinsSha) // self-consistent: the stored sha covers exactly the rest
  expect(lv.carriedFromPinsSha).toBe(INTERPRET_PINS_SHA_GOLDEN) // carried forward, never rebuilt
  const mutated = JSON.parse(JSON.stringify(rest)); mutated.walls.wall3.capDigits = 99
  expect(sha256(JSON.stringify(mutated))).not.toBe(lv.pinsSha) // a moved pin moves the sha
})

test("LINEAGE — the blueprint is hash-locked (a changed planning doc moves the pinned sha; gitignored on a fresh clone → the pinned sha is the durable record)", () => {
  const abs = path.join(PKG_ROOT, lv.blueprint.rel)
  if (!existsSync(abs)) { expect(lv.blueprint.sha).toMatch(/^[0-9a-f]{64}$/); return }
  expect(sha256(readFileSync(abs, "utf8"))).toBe(lv.blueprint.sha)
})

test("LINEAGE — the Operator's symptom is quoted verbatim + the defect named (unfalsifiable-from-the-outside) + the last-pre-probe status", () => {
  expect(lv.symptom.quote).toMatch(/almost-identical confident GO|0\.9999999999998763|n counted attempts = 1/)
  expect(lv.symptom.theDefect).toMatch(/H1.*H2.*H3|UNFALSIFIABLE|cardinal sin/i)
  expect(lv.symptom.lastPreProbe).toMatch(/LAST pre-probe|10-customer|probe preparation/i)
})

test("LINEAGE — X-LINEAGE(a): the diagnosis protocol is pinned + testable (the per-pool identity schema incl. reproHash + seriesContentHash; the H-finding schema; the finding must follow the evidence; NO fix in the diagnosis phase)", () => {
  const d = lv.diagnosis
  expect(d.doctrine).toMatch(/no fix lands until|diagnosis before treatment|wrong H/i)
  // the identity schema MUST capture the per-subject lineage fields (the reproHash-derivation + the series content hash are mandatory)
  for (const f of ["pool", "source", "reality", "nObs", "seriesContentHash", "reproHash", "significance", "familyN", "verdict"]) expect(d.identitySchema).toContain(f)
  expect(d.findingSchema).toEqual(["hypothesis", "perPool", "evidence", "conclusion"])
  expect(Object.keys(d.hypotheses)).toEqual(["H1", "H2", "H3"])
  expect(d.hypotheses.H1).toMatch(/SAMPLE-fed|honesty breach/i)
  expect(d.hypotheses.H2).toMatch(/bleed|mis-keyed|one real series/i)
  expect(d.hypotheses.H3).toMatch(/real but illegible|look alike|legibility/i)
  expect(d.rule).toMatch(/follow the evidence/i)
  expect(d.rule).toMatch(/NO product diff|src tree untouched except the script/i)
})

test("LINEAGE — X-LINEAGE(b): WALL 1 SAMPLE-never-GO is enforced at the RENDER (not engine-only), with a pinned length floor + a positive control", () => {
  const w = lv.walls.wall1
  expect(w.name).toMatch(/SAMPLE-never-GO at the render/i)
  expect(w.seriesLengthFloor).toBe(60)
  expect(w.rule).toMatch(/GO\/NO-GO may render ONLY|provenance-REAL|≥ the pinned floor/i)
  expect(w.enforcedOn).toMatch(/RENDERED payload/i)
  expect(w.enforcedOn).toMatch(/stale cache or template path/i) // engine honesty necessary but NOT sufficient
  expect(w.positiveControl).toMatch(/seeded SAMPLE.*→ INSUFFICIENT|absent.*UNAVAILABLE|too-short.*INSUFFICIENT/i)
})

test("LINEAGE — X-LINEAGE(c): WALL 2 per-subject distinctness derives the hash from the subject's OWN series (asserted, not displayed) + the lineage line on every render + the N-pool walk", () => {
  const w = lv.walls.wall2
  expect(w.lineageLineFields).toEqual(["source", "reality", "asOf", "nPoints", "seriesHashPrefix"])
  expect(w.derivation).toMatch(/sha256 of the subject's OWN resolved return series|recomputable from poolReturnsFromSeries/i)
  expect(w.derivation).toMatch(/the derivation asserted, not merely displayed/i)
  expect(w.distinctnessWalk).toMatch(/N different shelf pools|DIFFER|two subjects rendering one lineage/i)
  expect(w.onEveryRender).toMatch(/GO, NO-GO, INSUFFICIENT.*UNAVAILABLE|EVERY Stamp block/i)
})

test("LINEAGE — X-LINEAGE(d): WALL 3 caps the DISPLAY not the record + labels n=1 the weakest form + the Stamp MATH is byte-untouched", () => {
  const w = lv.walls.wall3
  expect(w.capDigits).toBe(4)
  expect(w.attemptPhrasing.weakestForm).toMatch(/1 attempt.*weakest form|nothing was deflated away/i)
  expect(w.attemptPhrasing.manyAttempts).toMatch(/N attempts|multiple-testing charge/i)
  expect(w.cappedDisplayUncappedRecord).toMatch(/capped display, uncapped record|RAW value stays full-precision/i)
  expect(w.mathByteUntouched).toMatch(/BYTE-UNTOUCHED|frozen seven|module hashes are pinned/i)
})

test("LINEAGE — the STAMP-MATH FREEZE pins the live module hashes; a re-hash of the live files MATCHES the pins (the math is byte-frozen — a nudge moves a hash and fails here)", () => {
  const mods = lv.stampMathFreeze.modules
  // EXACTLY the pinned modules, and each live file re-hashes to its pinned hash (the byte-freeze bites at EVERY gate)
  expect(Object.keys(mods).sort()).toEqual(["src/studio/decay.ts", "src/studio/icir.ts", "src/studio/mintrl.ts", "src/studio/stamp.ts"].sort())
  for (const [rel, want] of Object.entries(mods)) {
    expect(want).toMatch(/^[0-9a-f]{64}$/)
    expect(sha256(readFileSync(path.join(PKG_ROOT, rel), "utf8"))).toBe(want) // the LIVE file is byte-identical to the pin
  }
  expect(lv.stampMathFreeze.significanceNote).toMatch(/frozen seven|core_byte_identity/i)
})

test("LINEAGE — X-LINEAGE(f): the two-verdict separation STAYS (a Stamp GO on a scorecard-AVOID pool is correct by design; the sprint makes it provable, never conflated)", () => {
  expect(lv.twoVerdicts.rule).toMatch(/correct by design|robust track record ≠ a safe deposit|survive statistical deflation/i)
  expect(lv.twoVerdicts.thisSprint).toMatch(/does NOT blur or conflate|does NOT hide the Stamp on AVOID/i)
})

test("LINEAGE — the Interpreter findings IN1–IN5 are pinned; IN1/IN4/IN5 + IN3 close in Phase 1, IN2 is the Phase-5 Operator session; IN3's branch is forced (token-present → live, absent → D21)", () => {
  const ids = lv.inResolutions.map((v: { id: string }) => v.id)
  expect(ids.sort()).toEqual(["IN1", "IN2", "IN3", "IN4", "IN5"])
  const byId = (id: string) => lv.inResolutions.find((v: { id: string }) => v.id === id)
  expect(byId("IN1").resolution).toMatch(/two strengths|RUNTIME gate enforces the register DISTINCTION/i)
  expect(byId("IN1").resolution).toMatch(/NOT on every live answer|no live-Pro-provenance guarantee/i)
  expect(byId("IN4").resolution).toMatch(/PROBE SPRINT's Phase 0|browser.*assistive-technology/i)
  expect(byId("IN5").resolution).toMatch(/mark-only was shipped|doubles cost.*compound truncation/i)
  // IN3 is FORCED to a branch — never left drifting undecided (this run: token absent → D21)
  expect(byId("IN3").status).toBe("RESOLVED")
  expect(["token-live", "D21-fence-proven-only"]).toContain(byId("IN3").branch)
  expect(byId("IN2").status).toBe("PHASE-5-OPERATOR-GATED")
  expect(byId("IN2").resolution).toMatch(/OPERATOR.*not the agent|never an agent simulation relabeled/i)
})

test("LINEAGE — D20 (reserved, the diagnosis) + D21 (the POOL-EVENTS decision) are pinned + Operator-signed; the ledger carries the full entries in their phases", () => {
  expect(lv.deviations.D20).toMatch(/RESERVED|lineage diagnosis|before one repair line/i)
  expect(lv.deviations.D21).toMatch(/POOL-EVENTS|FENCE-PROVEN-ONLY|token-live|drift ENDS/i)
  expect(lv.deviations.operatorSignedNote).toMatch(/directive to execute.*sign-off|directed the coding agent/i)
})

test("LINEAGE — the screen set stays the conscious 3 (the Stamp DRAWER learns lineage — a sub-route, NOT a fourth screen); the stress catalog is S1–S47 (S45–S47 new)", () => {
  expect(lv.screens.count).toBe(3)
  expect(lv.screens.set).toEqual(["shelf", "reality-check", "ask"])
  expect(lv.screens.stampDrawerLearnsLineage).toMatch(/NO fourth screen, NO new statistics|sub-route of the Reality Check/i)
  expect(lv.stressCatalog).toHaveLength(47)
  expect(lv.stressCatalog.map((s: { id: string }) => s.id)).toEqual(Array.from({ length: 47 }, (_, k) => `S${k + 1}`))
  expect(lv.stressCatalog.find((s: { id: string }) => s.id === "S45").name).toMatch(/SAMPLE-never-GO at the render/i)
  expect(lv.stressCatalog.find((s: { id: string }) => s.id === "S46").name).toMatch(/per-subject distinctness/i)
  expect(lv.stressCatalog.find((s: { id: string }) => s.id === "S47").name).toMatch(/strength legibility|capped precision/i)
})

test("LINEAGE — the constitution carries: frozen seven byte-untouched, the Stamp math NEWLY frozen, zero scorecard verdicts moved, deps hono+zod, the probe committed next", () => {
  expect(lv.carried.deps).toEqual(["hono", "zod"])
  expect(lv.carried.frozenSeven).toMatch(/byte-untouched/i)
  expect(lv.carried.frozenSeven).toMatch(/moving ZERO scorecard verdicts|changing ZERO Stamp formula/i)
  expect(lv.carried.stampMathFrozen).toMatch(/pinned.*asserted unchanged|rendered the statistics honestly/i)
  expect(lv.carried.verdictDifferential).toMatch(/70c7912f/)
  expect(lv.carried.verdictDifferential).toMatch(/0a63151b/)
  expect(lv.carried.verdictDifferential).toMatch(/OFF the scorecard path/i)
  expect(lv.carried.voiceUnchanged).toMatch(/S36 content-golden set.*byte-identical|renderStamp, which is NOT in the S36/i)
  expect(lv.carried.probe).toMatch(/LAST pre-probe|Stage-0|10-customer|look a buyer in the eye/i)
})
