/**
 * ORGΛNON — THE HONESTY LAYER, Phase 0 driver (PINS-LOCKED). No product code — this pins, before any build:
 *   · the scorecard fact-row schema + the four axes with EXACT thresholds + the verdict derivation
 *   · the Real Data endpoints + REAL/SAMPLE rules · the 2-screen set · the X-LEAN / PART-CLEAN banned list verbatim
 *   · the X-PROBE metrics + the KILL CRITERION (window + threshold) · the red-team / stress catalog (S1–S10)
 * and captures the VERDICT-DIFFERENTIAL BASELINE (the lending fingerprint-set sha + a clone-robust funding fingerprint)
 * so every later phase can prove NO existing verdict moved. The pins are hash-locked (a changed pin ⇒ a changed sha ⇒
 * a conscious re-pin, never a silent drift). Deterministic: fixed timestamp, no network, throwaway stores only.
 *
 * Run: bun run script/honesty/phase0-pins.ts
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

// ── the blueprint, hash-locked (the sprint's own spec — a changed blueprint is a conscious re-pin) ──
const BLUEPRINT_REL = "sprint/sprint-result/ORGANON-Honesty_Layer_Sprint_Blueprint.md"
const blueprintSha = sha256(readFileSync(path.join(PKG_ROOT, BLUEPRINT_REL), "utf8"))

// ── THE CANONICAL PINS (the object that is hashed; PINS.md renders these same numbers for humans) ──
const PINS = {
  protocol: "honesty-pins",
  sprint: "THE HONESTY LAYER",
  at: "2026-07-08",
  blueprint: { rel: BLUEPRINT_REL, sha: blueprintSha },

  // the scorecard's row schema is the EXISTING WHY fact-row schema (Explain.FACT_ROW_SCHEMA) — reused verbatim, not
  // re-invented (X-KEEP; the WHY engine is byte-untouched). The scorecard produces axis rows that MAP onto it.
  factRowSchema: ["id", "name", "value", "threshold", "comparator", "outcome", "contribution", "provenanceRef"],

  // ── THE FOUR AXES — pure (facts) → row, each with an EXACT, unambiguous threshold ──
  axes: {
    // AXIS 1 — YIELD-REALITY (the flagship). baseShare = apyBase / (apyBase + apyReward).
    // durable (base is the majority) ≥ 0.5; mercenary (>80% emissions) < 0.2; between = reward-leaning (caution).
    yieldReality: {
      flagship: true,
      input: "apyBase, apyReward (DeFiLlama /pools)",
      metric: "baseShare = apyBase / (apyBase + apyReward)",
      comparator: "≥",
      DURABLE_BASE_SHARE: 0.5, // baseShare ≥ 0.5 → pass (durable): base yield is the majority
      MERCENARY_BASE_SHARE: 0.2, // baseShare < 0.2 → fail (mercenary): >80% of APY is reward emissions, temporary
      // 0.2 ≤ baseShare < 0.5 → caution (reward-leaning): most of the yield is emissions that will decay
      uncomputableWhen: "apyBase+apyReward ≤ 0, or either is null/SAMPLE → row outcome n/a (UNVERIFIED contribution)",
    },
    // AXIS 2 — TVL TREND. tvlSlope30d = (tvl_now − tvl_30d_ago) / tvl_30d_ago (from /chart history).
    tvlTrend: {
      flagship: false,
      input: "tvlUsd history (DeFiLlama /chart/{pool})",
      metric: "tvlSlope30d = (tvl_now − tvl_30d_ago) / tvl_30d_ago",
      comparator: "≥",
      TVL_STABLE_FLOOR: -0.1, // ≥ −10% over 30d → pass (stable/growing; −10% treated as noise)
      TVL_COLLAPSE_FLOOR: -0.35, // < −35% over 30d → fail (collapse / run); between = caution (outflowing)
      uncomputableWhen: "< 30d of history (a no-history pool) or SAMPLE → row outcome n/a (UNVERIFIED contribution)",
    },
    // AXIS 3 — PEG / STABILITY (stablecoin & delta-neutral legs). pegDev = |price − 1.0| for a USD-pegged leg.
    peg: {
      flagship: false,
      input: "stablecoin peg price (DeFiLlama /stablecoinprices)",
      metric: "pegDev = |price − 1.0|",
      comparator: "≤",
      PEG_ONPEG_BAND: 0.005, // ≤ ±0.5% → pass (on-peg); > 2% → fail (depeg); between = caution (wobble)
      PEG_DEPEG_BAND: 0.02,
      nonStableRow: "info (n/a — a non-stablecoin pool has no peg to break; never a fail)",
      uncomputableWhen: "no peg price for the leg or SAMPLE → row outcome n/a (UNVERIFIED contribution)",
    },
    // AXIS 4 — FUNDING REGIME (delta-neutral; Phase 5). A volatility BAND, never a hero APY.
    fundingRegime: {
      flagship: false,
      input: "annualized funding rate history (Hyperliquid fundingHistory)",
      metric: "band = [p10, p90] of annualized funding; the row renders the BAND (research: swings ~ −6%..+75%)",
      // p10 > 0 → pass (carry-positive, band shown); p10 ≤ 0 ≤ p90 → caution (regime-dependent, can flip negative);
      // p90 < 0 → fail (carry-negative — you pay to hold).
      rule: "p10>0 pass · p10≤0≤p90 caution · p90<0 fail",
      neverHeroApy: true,
      uncomputableWhen: "< the pinned minimum funding points or SAMPLE → row outcome n/a (UNVERIFIED contribution)",
    },
  },

  // ── THE VERDICT DERIVATION — machine-derived from the axis rows; UNVERIFIED is an honest gap, never a disguised pass ──
  // Precedence (unambiguous):
  //   1. any material axis == fail            → AVOID   (names the failing axes)
  //   2. reality==SAMPLE, OR the flagship (yield-reality) axis is uncomputable, OR > half the material axes uncomputable
  //                                           → UNVERIFIED (names the gaps; "we can't confirm this")
  //   3. any material axis == caution, OR any (non-flagship) material axis uncomputable
  //                                           → CAUTION  (names the cautions + partial gaps; not SOLID)
  //   4. else (all material axes pass, data REAL) → SOLID
  verdictDerivation: {
    // UNVERIFIED DOMINATES (re-pinned in PART E, red-team finding W-E01): on unverifiable data no definitive verdict is
    // honest — a SAMPLE "fail" is not a verified fail, so AVOID-on-SAMPLE would dress SAMPLE as a real judgment (the
    // firewall / S7). The prior order (fail→AVOID first) was corrected to put UNVERIFIED ahead of AVOID.
    order: ["UNVERIFIED", "AVOID", "CAUTION", "SOLID"],
    UNVERIFIED: "reality==SAMPLE OR flagship-axis uncomputable OR uncomputable > material/2 (DOMINATES — no definitive verdict on unverifiable data)",
    AVOID: "else any material axis outcome == fail (on REAL, verified data)",
    CAUTION: "else any material axis == caution OR any non-flagship material axis uncomputable",
    SOLID: "else all material axes pass AND reality==REAL",
    summary: "the one-line summary is GENERATED from the failing/cautioning/gap axis names — never hand-written",
    unverifiedIsNotAPass: true,
    unverifiedDominates: true,
  },

  // ── THE REAL DATA — keyless-first; every value REAL (fetched now, provenanced) or SAMPLE (labeled placeholder) ──
  realData: {
    defillama: { keyless: true, bases: ["yields.llama.fi", "api.llama.fi", "stablecoins.llama.fi"], pulls: ["/pools (apy, apyBase, apyReward, tvlUsd)", "/chart/{pool} (TVL/APY history)", "/stablecoinprices (peg)", "unlocks"], feeds: ["yield-reality", "tvl-trend", "peg", "shelf"] },
    hyperliquid: { keyless: true, base: "api.hyperliquid.xyz/info (POST)", pulls: ["fundingHistory", "candleSnapshot"], feeds: ["funding-regime"] },
    geckoterminal: { keyless: true, base: "api.geckoterminal.com/api/v2", pulls: ["pool liquidity/volume", "token price"], feeds: ["liquidity-context"] },
    labelRules: {
      REAL: "fetched this session AND appended to the provenance record with {source·asOf·contentHash} — a value shown but not recorded is a HALT",
      SAMPLE: "a labeled placeholder (keys/network absent, endpoint dead, or unwired) — never styled as REAL; every SAMPLE value drives its axis to UNVERIFIED",
      degrade: "a dead endpoint / 429 / malformed response degrades to last-good or SAMPLE — never a crash, never a fabricated value",
    },
    wiringOrder: ["defillama (backbone — most of the scorecard)", "hyperliquid (funding axis, Phase 5)", "geckoterminal (liquidity context)"],
  },

  // ── THE TWO SCREENS — frozen at 2; a third CONSUMER screen is a Halt ──
  screens: {
    count: 2,
    frozenAt: 2,
    list: [
      "THE SHELF — Reality Cards (name · headline APY with a REAL-yield split bar · risk word · verdict pill · REAL/SAMPLE badge); filters category/chain/risk; sortable",
      "THE REALITY CHECK — verdict banner + plain one-liner · the honesty scorecard rows · Simple/Pro toggle · trust strip · a confidence band (never a hero APY) · a link into the provenance history",
    ],
    frontEnd: "server-rendered HTML (Hono, the repo idiom) + minimal inline JS for the Simple/Pro toggle — NO Vite/SPA/bundler (PART CLEAN: no heavy dependency; the cheapest correct thing a stranger can run AND read). The Vite clause in Phase 4 is overridden by PART CLEAN's stated primacy; documented in the BuildLog.",
    notBuilt: "no builder · no composition canvas · no fork · no backtest-your-idea · no settings maze · no B2B/API/widget",
  },

  // ── X-LEAN / PART CLEAN — the banned list, verbatim (violating it is a Halt, not a style note) ──
  banned: [
    "a builder canvas / composition / fork / backtest-your-idea (the user CHECKS, they do not build)",
    "a third consumer screen (the set is frozen at 2)",
    "a B2B surface / public API / embeddable widget (out of scope this sprint, deferred on purpose)",
    "a provider registry / generic axis framework / strategy plugin system (no abstraction without a 2nd real caller NOW)",
    "an ORM / a database beyond the existing flat JSON/JSONL PIT store / a heavy front-end or state-management library",
    "an LLM anywhere in a verdict, a risk fact, or an axis (X-DETERM — the LLM only phrases the plain register behind the groundedness verifier)",
    "cleverness — metaprogramming / dynamic dispatch / a config-driven rule engine (a junior must read it top-to-bottom and predict the output)",
    "dead / commented-out code kept 'just in case' (deleted the moment it is dead)",
    "any 'for scale / future-proof / extensible / enterprise' — build for this tool, today",
  ],

  // ── X-PROBE — the metrics + the falsifiable KILL CRITERION (hash-locked; moving a pinned metric Halts) ──
  probe: {
    metrics: ["reality-check-open-rate (Shelf visitors who open a Reality Check)", "why-expansion-rate (sessions that expand a scorecard row to its threshold OR flip to Pro)", "seven-day-return-rate"],
    killCriterion: {
      window: "14 days",
      minGenuineSessions: 30, // the metric is not evaluable below this n (no goalpost-moving on tiny samples)
      condition: "over a 14-day window with ≥ 30 genuine (non-team) Reality-Check sessions, if why-expansion-rate < 0.15 AND seven-day-return-rate < 0.10, the honesty thesis is FALSIFIED for this audience → STOP and pivot",
      falsifiable: true,
      status: "ARMED (instrumented + declared) — NOT yet evaluable (independence PENDING; no genuine traffic yet). Honestly stated, never pre-passed.",
    },
  },

  // ── THE RED-TEAM / STRESS CATALOG (PART E; S1–S10) — pinned before any build ──
  stressCatalog: [
    { id: "S1", name: "dead endpoint", expect: "kill DeFiLlama mid-session → degrade to last-good or SAMPLE, label stale/UNVERIFIED, never spin/crash" },
    { id: "S2", name: "429 storm", expect: "click-storm the Shelf → the short-TTL cache absorbs it; rate-limit at the door, never fan out N provider calls; no SAMPLE-dressed-as-REAL" },
    { id: "S3", name: "stale cache", expect: "freeze the clock past TTL → asOf goes visibly stale; the verdict does not silently rest on old data claiming freshness" },
    { id: "S4", name: "no-history pool", expect: "history-dependent rows render UNVERIFIED; point-in-time rows still compute; verdict UNVERIFIED/CAUTION, never a fabricated SOLID" },
    { id: "S5", name: "mid-session depeg", expect: "inject a peg break → the peg row fires, verdict moves to AVOID/CAUTION, both registers agree, the record captures the moment" },
    { id: "S6", name: "emissions-inflated trap", expect: "a pool 95% reward emissions → the yield-reality row flags temporary, the split bar shows it, the verdict is not SOLID" },
    { id: "S7", name: "SAMPLE-heavy state", expect: "boot with everything SAMPLE → the tool still runs, every value SAMPLE, every verdict UNVERIFIED, and it says so plainly" },
    { id: "S8", name: "malformed / adversarial data", expect: "negative APY, null TVL, a garbage pool id → validated at the boundary, degraded to SAMPLE/UNVERIFIED, never a crash or a nonsense verdict" },
    { id: "S9", name: "provenance tamper", expect: "attempt to show a value not in the record, or break the hash chain → the record rejects it; a shown-but-unrecorded value Halts" },
    { id: "S10", name: "determinism / no-LLM-in-verdict", expect: "attempt to route a scorecard row through the LLM → caught; identical inputs → byte-identical scorecard across two runs" },
  ],

  // ── the worked example (a real-shaped DeFiLlama pool → its rows → its verdict) — proves the thresholds unambiguous ──
  workedExample: {
    pool: { name: "aave-usdc (illustrative shape)", apyBase: 3.1, apyReward: 0.4, tvlSlope30d: 0.05, pegDev: 0.001, reality: "REAL" },
    rows: {
      yieldReality: "baseShare = 3.1/(3.1+0.4) = 0.886 ≥ 0.5 → PASS (durable — base is the majority)",
      tvlTrend: "tvlSlope30d = +0.05 ≥ −0.10 → PASS (stable/growing)",
      peg: "pegDev = 0.001 ≤ 0.005 → PASS (on-peg)",
    },
    derivedVerdict: "SOLID (all material axes pass, data REAL)",
    counterExample: { name: "a 95%-emissions pool", apyBase: 0.5, apyReward: 9.5, note: "baseShare = 0.5/10 = 0.05 < 0.2 → FAIL (mercenary) → verdict AVOID, naming yield-reality" },
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const pinsOut = { ...PINS, pinsSha }
writeFileSync(path.join(HONESTY_DIR, "phase0-pins.json"), JSON.stringify(pinsOut, null, 2) + "\n")

// ── THE VERDICT-DIFFERENTIAL BASELINE — the lending fingerprint-set sha + a clone-robust funding fingerprint ──
// lending: the existing VerdictDifferential (5 seeded lending-carry verdicts) — the golden already tested across sprints.
const lendingSetSha = await VerdictDifferential.fingerprintSetSha()
// funding: venue "bybit" has NO captured T1 snapshot → the ILLUSTRATIVE path renders DETERMINISTICALLY regardless of the
// environment (clone-robust; it does not depend on gitignored data — the W9-01 lesson). Fixed timestamp.
const FUNDING_TS = Date.parse("2026-07-05T00:00:00Z")
const fundingRes = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, FUNDING_TS)
const baseline = {
  protocol: "verdict-differential-baseline-honesty",
  at: "2026-07-08",
  note: "the frozen attest engine's verdicts BEFORE the honesty layer — every phase re-derives these and asserts byte-identity (no verdict moved). The scorecard is a NEW layer; the GO/NO-GO adjudicator stays frozen + dormant.",
  lending: { source: "VerdictDifferential.fingerprintSetSha()", fingerprintSetSha: lendingSetSha },
  funding: { source: 'Console.runComposedFunding(bybit,8h,receive) @ 2026-07-05', state: fundingRes.state, verdict: fundingRes.verdict, reality: fundingRes.artifact?.reality ?? null, verdictReproHash: fundingRes.artifact?.verdictReproHash ?? null },
}
writeFileSync(path.join(HONESTY_DIR, "verdict-baseline.json"), JSON.stringify(baseline, null, 2) + "\n")

console.log("── PHASE 0 — PINS-LOCKED ─────────────────────────────────────")
console.log(`blueprint sha        : ${blueprintSha}`)
console.log(`PINS_SHA             : ${pinsSha}`)
console.log(`lending fp-set sha   : ${lendingSetSha}`)
console.log(`funding verdict      : ${baseline.funding.verdict} (${baseline.funding.reality}) reproHash ${String(baseline.funding.verdictReproHash).slice(0, 16)}…`)
console.log(`written              : data/honesty/phase0-pins.json · data/honesty/verdict-baseline.json`)
