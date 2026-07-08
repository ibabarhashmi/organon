/**
 * ORGΛNON — THE DEEPENING SPRINT, Phase 0 driver (PINS-LOCKED). Continues from the COMPLETE Honesty-Layer pins
 * (data/honesty/phase0-pins.json, PINS_SHA 8a57e6f…) — carried forward, never rebuilt. No product code; this pins,
 * before anything is built toward it:
 *   · the THREE NEW deterministic axes' exact thresholds — liquidity depth · unlock overhang · the counterparty screen
 *   · the VERTICAL-APPLICABILITY MATRIX — total over {stablecoin-yield, lending, delta-neutral} × the 7 axes (every pair
 *     is applies / not-applicable, never undefined) so an inapplicable axis renders `not-applicable`, never a fake pass
 *   · the EVIDENCE-BUNDLE contract — which artifacts `./organon.sh verify` regenerates + which claim each backs (X-PROVE)
 *   · the DEVIATIONS ledger seed — D1 (RWA pin retained) · D2 (server-rendered front-end) · D3 (GeckoTerminal resolved)
 *   · the updated RED-TEAM / STRESS CATALOG (S1–S15; S3 stale-cache + S7 SAMPLE-heavy each their own line, + S11–S15)
 * The pins are hash-locked (a changed pin ⇒ a changed sha ⇒ a conscious re-pin). Deterministic; no network. The verdict-
 * differential baseline (lending fp-set + clone-robust funding) is re-asserted so every phase can prove NO verdict moved.
 *
 * Run: bun run script/honesty/deepening-pins.ts
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

// ── the deepening blueprint, hash-locked (durable even when the planning doc is gitignored) ──
const BLUEPRINT_REL = "sprint/sprint-result/ORGANON_Deepening_Sprint_Blueprint.md"
const blueprintSha = sha256(readFileSync(path.join(PKG_ROOT, BLUEPRINT_REL), "utf8"))

// ── the CARRIED-FORWARD Honesty-Layer pins sha (the completed state this sprint continues from) ──
const CARRIED_FROM = JSON.parse(readFileSync(path.join(HONESTY_DIR, "phase0-pins.json"), "utf8")).pinsSha as string

// ── THE CANONICAL DEEPENING PINS (the object that is hashed; PINS.md renders these numbers for humans) ──
const PINS = {
  protocol: "deepening-pins",
  sprint: "THE DEEPENING SPRINT",
  at: "2026-07-08",
  continues: "THE HONESTY LAYER (RED-TEAM-CLEAN, battery 468/0)",
  blueprint: { rel: BLUEPRINT_REL, sha: blueprintSha },
  carriedFromPinsSha: CARRIED_FROM, // the prior sha, carried forward — the four original axes + their thresholds are unchanged

  // ── THE THREE NEW DETERMINISTIC AXES — pure (facts) → row, each with an EXACT, unambiguous threshold (NO inference) ──
  newAxes: {
    // AXIS 5 — LIQUIDITY DEPTH (GeckoTerminal reserve_in_usd). Thin liquidity = exit / slippage risk.
    // Central to the stablecoin-yield vertical (a DEX/LP pool's depth); a lending market's withdrawable liquidity is the
    // protocol's available liquidity, NOT a DEX pool depth → this axis renders `not-applicable` there (never a fake pass).
    liquidityDepth: {
      input: "pool reserve_in_usd (GeckoTerminal /networks/{net}/pools/{addr})",
      metric: "liqUsd (USD liquidity / reserve of the DEX pool backing the strategy)",
      comparator: "≥",
      LIQ_DEEP_USD: 500_000, // ≥ $500k → pass (deep — an exit won't move the price much)
      LIQ_THIN_USD: 50_000, // < $50k → fail (thin — exit/slippage risk; a size withdrawal moves the pool)
      // $50k ≤ liqUsd < $500k → caution (shallow)
      uncomputableWhen: "liqUsd null / SAMPLE (endpoint dead, uncaptured, unwired) → row outcome UNVERIFIED",
      notApplicableWhen: "the vertical has no DEX-pool depth to screen (a lending market's exit is the protocol's available liquidity; a pure perp leg) → not-applicable",
    },
    // AXIS 6 — UNLOCK OVERHANG (DeFiLlama unlocks/emissions). An imminent large token unlock is structured supply risk.
    unlockOverhang: {
      input: "next-30d token unlock as a fraction of circulating mcap (DeFiLlama unlocks/emissions)",
      metric: "unlockPct30d = (next-30d unlocked supply value) / mcap",
      comparator: "≤",
      UNLOCK_BENIGN: 0.01, // ≤ 1% of mcap in 30d → pass (benign)
      UNLOCK_HEAVY: 0.05, // > 5% of mcap in 30d → fail (heavy overhang — a large near-term dilution)
      // 1% < unlockPct30d ≤ 5% → caution (moderate)
      appliesWhen: "the yield's reward token has a KNOWN unlock schedule",
      notApplicableWhen: "no reward token / no unlock schedule found (a blue-chip stable market with no token overhang) → not-applicable (never a fabricated pass)",
      uncomputableWhen: "a schedule exists but the pull is SAMPLE/absent → UNVERIFIED",
    },
    // AXIS 7 — COUNTERPARTY / MATURITY SCREEN (age · size · dependency). A COARSE STRUCTURAL SCREEN, NOT a contract audit.
    // Scored on two deterministic, already-flowing signals: pool AGE (recorded /chart history span) + pool SIZE (TVL).
    // Dependency (single-protocol reliance) is an HONEST NON-SCORING NOTE — not over-claimed as an audited safety result.
    counterparty: {
      input: "pool age (recorded /chart history span, days) + pool size (TVL, USD)",
      AGE_MATURE_DAYS: 365, // ≥ 365d → mature
      AGE_YOUNG_DAYS: 90, // < 90d → young (a hard flag)
      SIZE_ESTABLISHED_USD: 10_000_000, // ≥ $10M → established
      SIZE_DUST_USD: 1_000_000, // < $1M → dust (a hard flag)
      rule: "mature AND established → pass · both hard-flags (young AND dust) → fail · otherwise (a single hard-flag or a mid band) → caution",
      label: "structural screen (age · size · dependency) — NOT a contract audit; deep contract analysis is PARKED (the Sentinel IR)",
      dependencyNote: "an honest NON-SCORING note (the strategy's single-protocol reliance), never scored/over-claimed as a safety result",
      uncomputableWhen: "age (no recorded history) or size null / SAMPLE → UNVERIFIED",
      overClaimBanned: "the screen may NEVER render 'audited' / 'safe' / 'guaranteed' — a doc-lie wall failure (X-COVER / F-IDENTITY)",
    },
  },

  // ── THE VERTICAL-APPLICABILITY MATRIX — TOTAL: every (vertical, axis) pair is `applies` or `not-applicable`, never
  // undefined. An axis that does not apply renders `not-applicable` (a DISTINCT honest state), never a pass, never
  // counted toward SOLID or toward the UNVERIFIED-dominance count. (X-COVER — the two-vertical + unwired-axis findings.)
  verticalApplicabilityMatrix: {
    verticals: ["stablecoin-yield", "lending", "delta-neutral"],
    axes: ["yield-reality", "tvl-trend", "peg", "liquidity-depth", "unlock-overhang", "counterparty", "funding-regime"],
    matrix: {
      "stablecoin-yield": {
        "yield-reality": "applies",
        "tvl-trend": "applies",
        peg: "applies (the stablecoin leg's dollar peg)",
        "liquidity-depth": "applies (central — the DEX/LP pool's reserve depth = exit risk)",
        "unlock-overhang": "applies-if-reward-token-schedule (else not-applicable)",
        counterparty: "applies",
        "funding-regime": "not-applicable (not a funding-carry strategy)",
      },
      lending: {
        "yield-reality": "applies",
        "tvl-trend": "applies",
        peg: "applies-if-stablecoin-leg (a non-stable market → not-applicable)",
        "liquidity-depth": "not-applicable (a lending market's exit liquidity is the protocol's available liquidity, not a DEX pool depth)",
        "unlock-overhang": "applies-if-reward-token-schedule (else not-applicable)",
        counterparty: "applies",
        "funding-regime": "not-applicable",
      },
      "delta-neutral": {
        "yield-reality": "not-applicable (the yield is funding carry, scored by funding-regime)",
        "tvl-trend": "not-applicable",
        peg: "not-applicable (no stablecoin peg leg)",
        "liquidity-depth": "not-applicable (a perp leg's liquidity is the venue's, not a DEX pool — PARKED)",
        "unlock-overhang": "not-applicable (no reward token)",
        counterparty: "not-applicable (a perp venue's structural age/size screen is PARKED this sprint — honestly noted)",
        "funding-regime": "applies",
      },
    },
    rule: "n/a never counts toward SOLID, AVOID, CAUTION, or the UNVERIFIED-dominance count; it is shown as a distinct honest state (never a pass); a pair with no matrix entry is a Halt (the matrix must be total)",
  },

  // ── THE EVIDENCE-BUNDLE CONTRACT (X-PROVE — the validation report's #1 finding) — every headline number is backed by a
  // regenerable artifact under data/honesty/evidence/, and `./organon.sh verify` regenerates the bundle + diffs it
  // against the committed copy (a mismatch exits non-zero). A claimed number with no backing artifact is a Halt. ──
  evidenceBundle: {
    dir: "data/honesty/evidence/",
    verb: "./organon.sh verify — regenerates the deterministic bundle and diffs it against the committed copy; a mismatch exits non-zero",
    artifacts: [
      { file: "battery-summary.json", backs: "the battery pass/fail count (N pass / 0 fail across M files)" },
      { file: "determinism.json", backs: "'two identical runs' — the scorecard is deterministic (identical inputs → byte-identical output across two runs)" },
      { file: "frozen-git-status.json", backs: "'the frozen seven git-clean' — the 6 .py + loop.ts are byte-untouched on disk" },
      { file: "verdict-differential.json", backs: "'the verdict differential reproduces' — lending fp-set 70c7912f… + funding NO-GO/ILLUSTRATIVE" },
      { file: "vlive-defillama.json", backs: "the DeFiLlama V-LIVE HTTP-200 capture (keyless)" },
      { file: "vlive-geckoterminal.json", backs: "the GeckoTerminal V-LIVE HTTP-200 capture (keyless; wired this sprint)" },
      { file: "vlive-hyperliquid.json", backs: "the Hyperliquid V-LIVE HTTP-200 capture (keyless)" },
      { file: "claims.json", backs: "the manifest — every headline number the handoff cites → its backing artifact + value (evidence_bundle.test.ts asserts totality)" },
    ],
    freshCloneRule: "verify's diff-checked artifacts are environment-INDEPENDENT (the differential, the frozen git-status, the scorecard determinism, the battery count). The gitignored snapshot payloads are absent on a clone → the honest SAMPLE path; the live V-LIVE re-fetch is skipped offline (disclosed, not failed) — the committed capture stands. (A′#10.)",
    haltRule: "a headline number with no backing artifact, or a verify that does not reproduce the committed bundle, is a Halt (X-PROVE).",
  },

  // ── THE DEVIATIONS LEDGER SEED (X-DEVLEDGER) — every departure from a blueprint's literal text, surfaced verbatim in
  // the handoff. The live ledger is data/honesty/deviations.json (Phase 1); this pins the three carried-forward entries. ──
  deviationsSeed: [
    { id: "D1", blueprintLine: "Honesty-Layer Phase 1: 'remove the RWA verdict pin machinery'", whatWasDone: "the dead RWA runtime was removed, but the wall-guarded RWA verdict PIN (RWA_VERDICT_SHA / INVARIANTS) was RETAINED", why: "it is a live integrity anchor (repro_contracts / F-ENV), not dead code — ripping out a live wall to satisfy a cleanup parenthetical is the very 'edit the integrity machinery' the record forbids", lawAuthority: "X-KEEP + A′#7" },
    { id: "D2", blueprintLine: "Honesty-Layer Phase 4: the 'Vite' front-end clause", whatWasDone: "the front-end is server-rendered Hono HTML (no Vite/SPA/bundler)", why: "PART CLEAN's stated primacy — no heavy dependency; the cheapest correct thing a stranger can run AND read", lawAuthority: "PART CLEAN" },
    { id: "D3", blueprintLine: "Honesty-Layer: GeckoTerminal 'pinned but unwired' (parked forward)", whatWasDone: "GeckoTerminal is RESOLVED — wired this sprint (the liquidity-depth axis)", why: "the Deepening sprint closes the one unwired provider; the ledger records the closure", lawAuthority: "X-COVER (Deepening Phase 2)" },
  ],

  // ── THE RED-TEAM / STRESS CATALOG (PART E; S1–S15) — S3 stale-cache + S7 SAMPLE-heavy each their OWN line this time,
  // plus the new liquidity / unlock / counterparty / verifiability / coverage traps. Pinned before any build. ──
  stressCatalog: [
    { id: "S1", name: "dead endpoint", expect: "degrade to last-good or SAMPLE; the served UI renders; never a crash/spin" },
    { id: "S2", name: "429 storm", expect: "the short-TTL cache absorbs it; the Shelf reads the record (no per-load provider fan-out)" },
    { id: "S3", name: "stale cache", expect: "the shown asOf is the capture time, visibly stale, never 'now'; a verdict never rests on stale data while claiming freshness (OWN LINE)" },
    { id: "S4", name: "no-history pool", expect: "history-dependent rows (TVL slope · funding band · counterparty age) UNVERIFIED; point-in-time rows still compute; never a fabricated SOLID" },
    { id: "S5", name: "mid-session depeg", expect: "the peg row fires → AVOID; both registers agree; the moment captured" },
    { id: "S6", name: "emissions-inflated trap", expect: "the yield-reality row flags temporary → verdict not SOLID" },
    { id: "S7", name: "SAMPLE-heavy state", expect: "EVERY SAMPLE verdict is UNVERIFIED — the W-E01 invariant holds under the new axes too (a SAMPLE liquidity/unlock/counterparty value never yields AVOID) (OWN LINE)" },
    { id: "S8", name: "malformed / adversarial data", expect: "boundary-validated to missing/UNVERIFIED; never a crash or a nonsense verdict" },
    { id: "S9", name: "provenance tamper", expect: "a shown-but-unrecorded REAL Halts; a broken chain refused on construct" },
    { id: "S10", name: "determinism / no-LLM-in-verdict", expect: "identical inputs → byte-identical scorecard; a model-in-verdict rejected wholesale" },
    { id: "S11", name: "thin-liquidity trap (NEW)", expect: "a deep-APY pool with dust liquidity → liquidity FAIL → not SOLID; exit risk surfaced" },
    { id: "S12", name: "imminent-unlock trap (NEW)", expect: "a large near-term unlock → unlock FAIL → CAUTION/AVOID" },
    { id: "S13", name: "dust/new-protocol trap (NEW)", expect: "a young, tiny pool → counterparty flag, honestly labeled coarse (never 'audited/safe')" },
    { id: "S14", name: "verifiability (NEW)", expect: "./organon.sh verify regenerates every committed evidence artifact; a tampered count or an unbacked handoff number fails" },
    { id: "S15", name: "coverage/applicability (NEW)", expect: "an inapplicable axis (funding on lending; peg on non-stable) renders not-applicable, never a fabricated pass; a claimed-but-absent vertical fails the coverage test" },
  ],

  // ── the coverage claim, pinned (X-COVER) — the three money verticals + which axes are central to each ──
  coverage: {
    verticals: ["stablecoin-yield", "lending", "delta-neutral"],
    central: {
      "stablecoin-yield": ["peg", "liquidity-depth", "yield-reality"],
      lending: ["yield-reality", "tvl-trend", "counterparty"],
      "delta-neutral": ["funding-regime"],
    },
    rule: "each vertical is DISTINCTLY represented on the Shelf (stablecoin-yield is a stablecoin farming/stable-LP strategy, NOT a relabeled lending market) and scored with its applicable axes; a vertical named but absent is a Halt",
  },

  // ── carried, unchanged (X-KEEP · X-MOAT · X-DETERM · X-HONEST · PART CLEAN) ──
  carried: {
    frozenSeven: "the 6 computational-core .py + loop.ts byte-untouched (core_byte_identity green every gate)",
    verdictDifferential: "lending fp-set 70c7912f… + funding NO-GO/ILLUSTRATIVE reproduce at every gate — zero verdicts moved",
    screensFrozenAt: 2,
    deps: ["hono", "zod"],
    moatCadence: "the capture cadence appends ONLY REAL captures (content-addressed, hash-chained); a backfill/retro throws in Capture.Service; a capture that finds nothing records nothing",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const pinsOut = { ...PINS, pinsSha }
writeFileSync(path.join(HONESTY_DIR, "deepening-pins.json"), JSON.stringify(pinsOut, null, 2) + "\n")

// ── THE VERDICT-DIFFERENTIAL BASELINE — re-asserted (the frozen attest engine's lending + funding verdicts) so every
// deepening phase proves NO existing verdict moved. Identical source to the Honesty-Layer baseline (byte-reproduced). ──
const lendingSetSha = await VerdictDifferential.fingerprintSetSha()
const FUNDING_TS = Date.parse("2026-07-05T00:00:00Z")
const fundingRes = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, FUNDING_TS)

console.log("── DEEPENING — PHASE 0 (PINS-LOCKED) ─────────────────────────")
console.log(`blueprint sha        : ${blueprintSha}`)
console.log(`carried-from PINS_SHA: ${CARRIED_FROM}`)
console.log(`DEEPENING PINS_SHA   : ${pinsSha}`)
console.log(`lending fp-set sha   : ${lendingSetSha}`)
console.log(`funding verdict      : ${fundingRes.verdict} (${fundingRes.artifact?.reality ?? null}) reproHash ${String(fundingRes.artifact?.verdictReproHash).slice(0, 16)}…`)
console.log(`matrix pairs         : ${PINS.verticalApplicabilityMatrix.verticals.length}×${PINS.verticalApplicabilityMatrix.axes.length} = ${PINS.verticalApplicabilityMatrix.verticals.length * PINS.verticalApplicabilityMatrix.axes.length} (total)`)
console.log(`stress catalog       : ${PINS.stressCatalog.length} (S1–S15)`)
console.log(`written              : data/honesty/deepening-pins.json`)
