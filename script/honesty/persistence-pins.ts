/**
 * ORGΛNON — THE PERSISTENCE SPRINT, Phase 0 driver (PINS-LOCKED). Continues from the COMPLETE Crown-Jewel pins
 * (data/honesty/crownjewel-pins.json, PINS_SHA 405ce972…) — carried forward, never rebuilt. No product code; this pins,
 * before anything is built toward it, the two genuinely-new deterministic Stamp sub-scores + the finding-resolutions:
 *   · THE DECAY HALF-LIFE GATE (X-DECAY) — the opt-in Stamp's signal-shelf-life check: the lag-k autocorrelation of the
 *     recorded return series is the per-lag EDGE, fit to edge₀·exp(-k/τ) (the textbook AR(1) ACF decay), half-life
 *     t½=τ·ln2, gated on DECAY_HALFLIFE_FLOOR. Deterministic, off the mass path, from the record only, honest on short
 *     history (< MIN_DECAY_OBSERVATIONS / degenerate → INSUFFICIENT; SAMPLE-fed → not scored). It REFINES the Stamp
 *     reason (a short half-life withholds a CLEAN GO — disclosed), never a scorecard axis, never a new verdict word.
 *   · THE ICIR CONSISTENCY SCORE (X-ICIR) — ICIR = mean(periodic-edge)/std(periodic-edge) over the recorded periods, a
 *     WITHIN-STRATEGY temporal-consistency measure shown beside the deflated-Sharpe. EXPLICITLY NOT the cross-sectional
 *     factor-ranking IC/ICIR of the literature (the scope is pinned + surfaced). std→0 / < MIN_ICIR_PERIODS → INSUFFICIENT.
 *   · THE HONEST SCOPE — the tool scores ONE strategy's yield reality + (opt-in) its statistical track record; it does
 *     NOT mine cross-sectional factor alpha over a token universe. The generate-to-iterate loop stays PARKED (rationale).
 *   · THE CROWN-JEWEL FINDING-RESOLUTIONS V1–V6, incl. D8 (the dep=1 modeling assumption).
 *   · THE RED-TEAM / STRESS CATALOG S1–S24 — S1–S21 carried + S22 decay-honesty · S23 ICIR-determinism/scope · S24 live-AI.
 * The pins are hash-locked (a changed pin ⇒ a changed sha ⇒ a conscious re-pin). Deterministic; no network. The verdict-
 * differential baseline (lending fp-set + clone-robust funding) is re-asserted so every phase can prove NO verdict moved.
 *
 * Run: bun run script/honesty/persistence-pins.ts
 */
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { VerdictDifferential } from "../../src/studio/differential"
import { Console } from "../../src/studio/console"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const HONESTY_DIR = path.join(PKG_ROOT, "data", "honesty")
if (!existsSync(HONESTY_DIR)) mkdirSync(HONESTY_DIR, { recursive: true })

// ── the persistence blueprint, hash-locked (durable even when the planning doc is gitignored) ──
const BLUEPRINT_REL = "sprint/sprint-result/ORGANON_Persistence_Sprint_Blueprint.md"
const blueprintSha = sha256(readFileSync(path.join(PKG_ROOT, BLUEPRINT_REL), "utf8"))

// ── the CARRIED-FORWARD Crown-Jewel pins sha (the completed state this sprint continues from) ──
const CARRIED_FROM = JSON.parse(readFileSync(path.join(HONESTY_DIR, "crownjewel-pins.json"), "utf8")).pinsSha as string

// ── THE CANONICAL PERSISTENCE PINS (the object that is hashed; PINS.md renders these numbers for humans) ──
const PINS = {
  protocol: "persistence-pins",
  sprint: "THE PERSISTENCE SPRINT (decay half-life + ICIR; findings closed; AI live)",
  at: "2026-07-09",
  continues: "THE CROWN-JEWEL SPRINT (RED-TEAM-CLEAN, battery 585/0)",
  blueprint: { rel: BLUEPRINT_REL, sha: blueprintSha },
  carriedFromPinsSha: CARRIED_FROM, // the crownjewel sha, carried forward — the Stamp/scorecard/Ask contracts are unchanged

  // ── THE DECAY HALF-LIFE GATE (X-DECAY) — the opt-in Stamp's new signal-shelf-life sub-score. DETERMINISTIC + OFF-PATH.
  // edge(k) = the lag-k autocorrelation of the recorded return series (the AR(1) ACF is EXACTLY edge₀·exp(-k/τ) — the
  // fit is textbook, not clever). A short half-life = a fee-chasing / serially-random signal; a long one = a traceable,
  // persistent time-structure. Honestly scoped: it measures SERIAL PERSISTENCE of the recorded signal, NOT the average
  // carry (a steady constant yield's carry is caught by the yield-reality axis on the mass path — a different lens). ──
  decay: {
    doctrine: "the opt-in Stamp gains a signal-shelf-life check: fit the lag-edge decay from the recorded series, derive the half-life, and withhold a CLEAN GO from a short-lived (serially-random) signal — a fee-chase, not a traceable edge",
    edgeMeasure: "edge(k) = the lag-k sample autocorrelation of the recorded return series (denominator = the lag-0 autocovariance); the exponential fit edge(k)=edge₀·exp(-k/τ) is the textbook AR(1) ACF decay",
    lagSet: [1, 2, 3, 5, 10], // the pinned lags at which the edge (autocorrelation) is measured before the exponential fit
    DECAY_HALFLIFE_FLOOR: 5, // half-life ≥ 5 periods → TRACEABLE (a persistent edge); < 5 → SHORT_LIVED (fee-chase, a clean GO withheld)
    MIN_DECAY_OBSERVATIONS: 30, // < 30 recorded points → INSUFFICIENT (cannot estimate the ACF / fit a half-life honestly)
    DECAY_EPS: 1e-4, // a hard positivity floor for an autocorrelation entering the fit (below it, indistinguishable from zero)
    DECAY_SIGNIF_Z: 2, // the ~95% BARTLETT white-noise band multiplier: an autocorrelation counts as a real edge only if it
    // exceeds Z/√n (the band inside which i.i.d. noise fluctuates) — so a serially-random series is NOT read as a signal
    // (added Phase 3: the DECAY-TRUE positive control proved a fixed EPS alone let noise autocorrelations fabricate a fit)
    tiers: ["TRACEABLE", "SHORT_LIVED", "INSUFFICIENT"],
    offPath: "computed ONLY inside the opt-in Stamp (never the mass Reality Check) — a scorecard render invokes decay ZERO times (S22/S16)",
    deterministic: "a pure function over the recorded lag-edges; identical inputs → a byte-identical half-life (no model, no random) (X-DETERM)",
    honestOnShortHistory: "< MIN_DECAY_OBSERVATIONS, or a degenerate/flat series, → INSUFFICIENT — NEVER a fabricated long half-life (A′#1)",
    fromRecordOnly: "the lag-edges are read from the provenance record (REAL/SAMPLE-labeled); a SAMPLE-fed decay is NOT scored as real (INSUFFICIENT)",
    refinesNotMints: "the decay result lives in the Stamp reason/basis (like the deflation basis); it NEVER touches a scorecard axis/verdict and NEVER mints a new verdict word — the GO bar gets HARDER, never easier",
    haltRule: "a fabricated/model-derived half-life, a decay on the mass path, a decay scored on SAMPLE data, or a decay that mints/moves a verdict is a Halt",
  },

  // ── THE ICIR CONSISTENCY SCORE (X-ICIR) — a distinct temporal-consistency sub-score beside the deflated-Sharpe. ICIR =
  // mean/std of the recorded periodic edges (a scale-free steadiness ratio — a little every period beats a lot once).
  // HONESTLY SCOPED: a WITHIN-STRATEGY temporal-consistency measure over this strategy's own recorded periods — NOT the
  // cross-sectional factor-ranking IC/ICIR of the literature (which ranks a universe of assets). Deterministic, off-path. ──
  icir: {
    doctrine: "ICIR = mean(periodic-edge)/std(periodic-edge) over the recorded periods — how STEADILY the edge holds; shown beside (never replacing) the deflated-Sharpe; a lumpy/reversing edge tempers a clean GO",
    formula: "mean(recordedPeriodicReturns) / populationStd(recordedPeriodicReturns)",
    MIN_ICIR_PERIODS: 20, // < 20 recorded periods → INSUFFICIENT (too few to measure consistency honestly)
    ICIR_STEADY_FLOOR: 0.1, // per-period consistency ratio ≥ 0.1 → CONSISTENT (steady); < 0.1 → LUMPY (a clean GO tempered)
    degenerateGuard: "std → 0 (a flat / no-variation series) → INSUFFICIENT/degenerate — NEVER a divide-by-zero or a fabricated ratio",
    tiers: ["CONSISTENT", "LUMPY", "INSUFFICIENT"],
    scope: "within-strategy-temporal",
    scopeStatement: "a WITHIN-STRATEGY temporal-consistency measure over this strategy's own recorded periods — EXPLICITLY NOT the cross-sectional factor-ranking IC/ICIR of the literature (which ranks a universe of assets). The tool scores one strategy's yield reality, not a 200-token ranking.",
    offPath: "computed ONLY inside the opt-in Stamp (never the mass Reality Check) — a scorecard render invokes ICIR ZERO times (S23/S16)",
    deterministic: "a pure function over the recorded periodic edges; identical inputs → a byte-identical ratio (X-DETERM)",
    fromRecordOnly: "SAMPLE periods are NOT scored as real (INSUFFICIENT); the ratio is read from the provenance record",
    refinesNotMints: "the ICIR lives in the Stamp reason/basis beside the deflated-Sharpe; it NEVER touches a scorecard axis/verdict and NEVER mints a new verdict word",
    haltRule: "an ICIR presented/implied as a cross-sectional factor IC, a model-derived ICIR, an ICIR on the mass path, or a divide-by-zero on a degenerate series is a Halt (A′#2)",
  },

  // ── THE HONEST SCOPE STATEMENT (pinned + surfaced) — what the tool IS and IS NOT. A cross-sectional claim is a doc-lie. ──
  honestScope: {
    is: "an honest Reality Check on ONE strategy's yield reality (SOLID/CAUTION/AVOID/UNVERIFIED) + an opt-in overfit Stamp on its statistical track record (GO/NO-GO/INSUFFICIENT) now refined by a within-strategy decay half-life + a within-strategy ICIR consistency ratio",
    isNot: "a cross-sectional factor-alpha miner over a token universe (the literature's IC/ICIR use); the decay + ICIR are WITHIN-strategy temporal measures, never a 200-token ranking",
    surfaced: "the scope is stated in the Stamp drawer + the Ask VALIDATION answer + PINS.md — so a quant is never misled that the tool mines cross-sectional alpha",
  },

  // ── THE PARKED GENERATE-LOOP (D-note, rationale) — the research's OTHER idea (an LLM strategy-proposer / iterate-to-
  // generate loop) is a DIFFERENT product for the alpha-hunting quant, which our market research said is NOT the wedge.
  // It stays PARKED; building it this sprint is a Halt (THE FIREWALL). Only the two deterministic sub-scores are added. ──
  parkedGenerateLoop: {
    what: "the LLM strategy-PROPOSER / iterate-to-generate-strategies loop from the ICIR/decay research",
    status: "PARKED — deliberately NOT built",
    rationale: "a different product for a non-wedge user (the alpha-hunting quant); capacity-constrained, reflexive, thin-OOS-data for us. Our wedge is provable honesty for the depositor, not factor generation. Building it is a Halt (THE FIREWALL + PART CLEAN).",
  },

  // ── THE CROWN-JEWEL FINDING-RESOLUTIONS (V1–V6) — mostly documentation + one live call + one pinned assumption (D8). ──
  findings: [
    { id: "V1", finding: "the screen-count narrative reads as a contradiction ('stays 2' vs 'conscious 3')", resolution: "reconciled in ONE place: TWO mass screens (Shelf · Reality Check) + the Stamp opt-in SUB-ROUTE of the Reality Check (/stamp/:key, Pro-only, lazily imported — a drawer, NOT a screen) + the Ask Console (the deliberate 3rd screen) = the conscious 3. A fourth is a Halt.", status: "RESOLVED" },
    { id: "V2", finding: "the AI grounding path was never exercised live (mock-only)", resolution: "one live keyed round-trip through the working Groq adapter → the grounding gate + verdict guard: a grounded answer passes AND a forced fabricated-number prompt is rejected WHOLESALE → deterministic. Committed REDACTED (data/honesty/evidence/ask-live-groq.json; NO key), content-hashed into the capture-manifest (verify recomputes it).", status: "RESOLVED (Phase 2)" },
    { id: "V3", finding: "the dep=1 default is a derived assumption not laddered", resolution: "recorded as D8 — a pinned modeling assumption ('a direct DeFiLlama single-protocol pool ⇒ dependency=1'), evidenced (a raw pool is one protocol) in the deviations ledger.", status: "RESOLVED (D8)" },
    { id: "V4", finding: "the Studio.submit / frozen-core naming was unreconciled", resolution: "one reconciling line in stamp.ts + the log: the Stamp's Studio.submit seam INVOKES the SAME byte-pinned core the core_byte_identity frozen-seven check covers (the 6 computational .py + loop.ts) — INVOKED, never edited; the goldens reproduce, the frozen seven git-clean after decay+ICIR run.", status: "RESOLVED" },
    { id: "V5", finding: "the 'GO (conditional)' aave Stamp undercut the rare-GO thesis with a one-liner", resolution: "given an honest paragraph: the deflation basis (nObs · dsr · n) + the decay half-life + the ICIR + the post-hoc fence + why a GO here is still narrow — the rare-GO thesis restated (a GO now needs deflation-survival AND a traceable half-life AND acceptable consistency).", status: "RESOLVED (Phase 1/5)" },
    { id: "V6", finding: "the live-value ceiling was unstated", resolution: "stated beside X-LIVE: the capture-manifest HASHES reproduce (the committed capture is the durable record); the underlying live values are RE-CAPTURABLE, NOT frozen — a reader must not over-read 'the live numbers reproduce forever'. A re-fetch is network-gated + disclosed.", status: "RESOLVED" },
  ],

  // ── D8 (the dep=1 modeling assumption) — pinned here + appended to the live deviations ledger in Phase 1 (V3). ──
  deviationD8: {
    id: "D8",
    blueprintLine: "Crown-Jewel report V3: 'the dep=1 default is a derived modeling assumption, not laddered'",
    whatWasDone: "PINNED as a modeling assumption: a direct DeFiLlama single-protocol pool defaults to depProtocols=1 (a single, transparent counterparty dependency — the clean baseline, never a flag). A registry entry MAY declare a higher (stacked) dependency; the default only ever biases toward the transparent case, so no existing verdict moves.",
    why: "a raw DeFiLlama pool IS one protocol's deposit — one counterparty surface. Defaulting to 1 is the honest, conservative baseline (it never fabricates a stacked flag); the assumption is now laddered + evidenced, not silent (the report's V3).",
    lawAuthority: "X-DEP + X-DEVLEDGER (Crown-Jewel report V3)",
  },

  // ── THE SCREEN SET (carried, reconciled — V1) — the conscious 3; a fourth is a Halt. The Stamp is a SUB-ROUTE, not a screen. ──
  screens: {
    count: 3,
    set: ["shelf", "reality-check", "ask"],
    massScreens: ["shelf", "reality-check"],
    stampIsASubRoute: "the Stamp is an opt-in Pro sub-route of the Reality Check (/stamp/:key), lazily imported — a drawer of screen 2, NOT a screen (V1)",
    amendment: "D7 — the frozen-at-2 guard is consciously amended to frozen-at-3 for the Ask console; a fourth screen is a Halt (PART CLEAN)",
  },

  // ── THE RED-TEAM / STRESS CATALOG (PART E; S1–S24) — S1–S21 carried from the crownjewel pins + S22/S23/S24. ──
  stressCatalog: [
    { id: "S1", name: "dead endpoint", expect: "degrade to last-good or SAMPLE; the served UI renders; never a crash/spin" },
    { id: "S2", name: "429 storm", expect: "the short-TTL cache absorbs it; the Shelf reads the record (no per-load provider fan-out)" },
    { id: "S3", name: "stale cache", expect: "the shown asOf is the capture time, visibly stale, never 'now' (OWN LINE)" },
    { id: "S4", name: "no-history pool", expect: "history-dependent rows UNVERIFIED; point-in-time rows still compute; never a fabricated SOLID" },
    { id: "S5", name: "mid-session depeg", expect: "the peg row fires → AVOID; both registers agree" },
    { id: "S6", name: "emissions-inflated trap", expect: "the yield-reality row flags temporary → verdict not SOLID" },
    { id: "S7", name: "SAMPLE-heavy state", expect: "EVERY SAMPLE verdict is UNVERIFIED — the W-E01 invariant holds under all axes (OWN LINE)" },
    { id: "S8", name: "malformed / adversarial data", expect: "boundary-validated to missing/UNVERIFIED; never a crash or a nonsense verdict" },
    { id: "S9", name: "provenance tamper", expect: "a shown-but-unrecorded REAL Halts; a broken chain refused on construct" },
    { id: "S10", name: "determinism / no-LLM-in-verdict", expect: "identical inputs → byte-identical scorecard; a model-in-verdict rejected wholesale" },
    { id: "S11", name: "thin-liquidity trap", expect: "a deep-APY pool with dust liquidity → liquidity FAIL → not SOLID" },
    { id: "S12", name: "imminent-unlock trap", expect: "a large near-term unlock → unlock FAIL → CAUTION/AVOID (ARMED; D6 on live keyless data)" },
    { id: "S13", name: "dust/new/STACKED-dependency trap", expect: "a young/tiny OR dependency-stacked pool → counterparty flag, honestly coarse (never 'audited/safe')" },
    { id: "S14", name: "verifiability", expect: "./organon.sh verify regenerates every committed evidence artifact; a tampered count/number fails" },
    { id: "S15", name: "coverage/applicability", expect: "an inapplicable axis renders not-applicable, never a fabricated pass" },
    { id: "S16", name: "stamp isolation", expect: "a scorecard render → ZERO adjudicator/decay/ICIR calls; the verdict spaces never conflate" },
    { id: "S17", name: "stamp honesty", expect: "short-history → INSUFFICIENT; deflation tightens with family size; the goldens reproduce; history-absent → 'unavailable'" },
    { id: "S18", name: "live-number provenance", expect: "./organon.sh verify asserts every cited live number resolves to a capture-manifest content-hash" },
    { id: "S19", name: "ask groundedness", expect: "a fabricated number rejected WHOLESALE → deterministic; an UNVERIFIED gap never filled; a Simple answer carries no raw decimals" },
    { id: "S20", name: "provider/BYOK/key-safety", expect: "no key → deterministic mode, no crash; BYOK selects the env provider; no key string in the served HTML or any log" },
    { id: "S21", name: "ask determinism/injection", expect: "same query → identical FACTS (raw toggle byte-identical); a prompt-injection cannot move a verdict" },
    { id: "S22", name: "decay-gate honesty (NEW)", expect: "a short/flat/SAMPLE series → INSUFFICIENT, never a fabricated half-life; a 2-period-half-life → SHORT_LIVED (a clean GO withheld); off the mass path; deterministic" },
    { id: "S23", name: "ICIR determinism/scope (NEW)", expect: "identical inputs → byte-identical ICIR; a degenerate series → INSUFFICIENT (no div-by-zero); the within-strategy scope label present (a cross-sectional claim fails); off-path" },
    { id: "S24", name: "live-AI grounding (NEW)", expect: "the committed Groq round-trip proves a real-model grounded answer passes AND a fabricated number is rejected wholesale; the redacted transcript reproduces its manifest hash; no key leaks" },
  ],

  // ── carried, unchanged (X-KEEP · X-MOAT · X-DETERM · X-HONEST · PART CLEAN) ──
  carried: {
    frozenSeven: "the 6 computational-core .py + loop.ts byte-untouched (core_byte_identity green every gate; the Stamp INVOKES the same byte-pinned core the frozen-seven check covers — V4 — never edits, incl. after decay+ICIR run)",
    verdictDifferential: "lending fp-set 70c7912f… + funding NO-GO/ILLUSTRATIVE reproduce at every gate — zero verdicts moved",
    sevenAxes: ["yield-reality", "tvl-trend", "peg", "liquidity-depth", "unlock-overhang", "counterparty", "funding-regime"],
    stampVerdicts: ["GO", "NO-GO", "INSUFFICIENT", "UNAVAILABLE"], // unchanged — decay + ICIR are REASON/BASIS detail, never a new verdict word
    deps: ["hono", "zod"], // the AI provider seam is an optional, dependency-free raw-fetch seam (incl. Groq), not a mass-tool dep
    aiProviders: ["gemini (Google AI Studio, default)", "openai", "anthropic", "openai-compatible", "groq (llama-3.1-8b-instant)"],
    moatCadence: "the capture cadence appends ONLY REAL captures (content-addressed, hash-chained); a backfill/retro throws; a capture that finds nothing records nothing",
    liveValueCeiling: "the capture-manifest HASHES reproduce (the committed capture is the durable record); the underlying live values are RE-CAPTURABLE, not frozen (V6)",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const pinsOut = { ...PINS, pinsSha }
writeFileSync(path.join(HONESTY_DIR, "persistence-pins.json"), JSON.stringify(pinsOut, null, 2) + "\n")

// ── THE VERDICT-DIFFERENTIAL BASELINE — re-asserted (the frozen attest engine's lending + funding verdicts) so every
// persistence phase proves NO existing verdict moved. Identical source to the crownjewel baseline (byte-reproduced). ──
const lendingSetSha = await VerdictDifferential.fingerprintSetSha()
const FUNDING_TS = Date.parse("2026-07-05T00:00:00Z")
const fundingRes = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, FUNDING_TS)

console.log("── PERSISTENCE — PHASE 0 (PINS-LOCKED) ───────────────────────")
console.log(`blueprint sha        : ${blueprintSha}`)
console.log(`carried-from PINS_SHA: ${CARRIED_FROM}`)
console.log(`PERSISTENCE PINS_SHA : ${pinsSha}`)
console.log(`lending fp-set sha   : ${lendingSetSha}`)
console.log(`funding verdict      : ${fundingRes.verdict} (${fundingRes.artifact?.reality ?? null}) reproHash ${String(fundingRes.artifact?.verdictReproHash).slice(0, 16)}…`)
console.log(`decay                : lags ${PINS.decay.lagSet.join("·")} · floor ${PINS.decay.DECAY_HALFLIFE_FLOOR} · min ${PINS.decay.MIN_DECAY_OBSERVATIONS}`)
console.log(`icir                 : min periods ${PINS.icir.MIN_ICIR_PERIODS} · steady floor ${PINS.icir.ICIR_STEADY_FLOOR} · scope ${PINS.icir.scope}`)
console.log(`screens              : ${PINS.screens.count} (${PINS.screens.set.join(" · ")})`)
console.log(`stress catalog       : ${PINS.stressCatalog.length} (S1–S24)`)
console.log(`findings             : ${PINS.findings.map((f) => f.id).join(", ")} + D8`)
console.log(`written              : data/honesty/persistence-pins.json`)
