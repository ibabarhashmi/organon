/**
 * ORGΛNON — THE DOMAIN SPRINT, the pins builder (X-DOMAIN + X-BACKTEST). Continues from the COMPLETE Coverage pins
 * (data/honesty/coverage-pins.json — PINS_SHA cc08a77b, which carried Redesign 6b285eba → GroundTruth 3d0ef3bb) — carried
 * forward, never rebuilt. This pins, BEFORE any product code, every contract of the sprint that teaches the engine WHAT
 * KIND of thing it is looking at and then fires the complete unmodified system at real historical collapses:
 *   · X-DOMAIN (know the kind, name the catch, refuse to guess) — the pinned DomainType enum; the CONSERVATIVE classifier
 *     (ambiguous/novel → UNCLASSIFIED, the seven carried axes only — a guessed domain is a wrong lens); the four catch
 *     axes (yield-source / redemption-gap / leverage-distance / off-chain-opacity), each info/context this sprint, in a
 *     pinned grammar; the per-domain axis registry (NO cross-domain leakage); the RWA STRUCTURAL CAP spec + the
 *     agent-may-not-install clause (a cap is verdict-shaped — until D35 is signed, RWA renders the warning without the cap).
 *   · X-BACKTEST (fire the complete system at its own graveyard, report what falls) — the pinned collapse subject set WITH
 *     mechanism-match rationale + pinned pre-collapse heights, HASH-PINNED here BEFORE Phase 4 fetches a single byte (a
 *     post-hoc swap fails the hash); the tri-endpoint archive-truth rule (reuses the S63 machinery); the honest-gap rule;
 *     the read-only-engine rule (git diff -- src/ empty through the run); the MISS-IS-THE-MOST-VALUABLE-OUTPUT rule + the
 *     zero-miss-is-suspicious rule; the both-directions claim wording.
 *   · CV1–CV5 — the record discipline the Coverage log let slip (the PR5 expect() wall, the SESSION MARKERs, the
 *     evidentiary depth, the depth census replacing the 99.95% headline, the W-CV itemization + the refreshed gate).
 *   · D34/D35/D36 reserved (Operator-signed=false — LN5); S67–S70. Carry cc08a77b → new.
 * The pins are hash-locked; deterministic; no network. The verbatim strings + the subject-set hash are pinned EXACTLY so a
 * summarization or a post-hoc subject swap is a detectable Halt (S67/S68/S69). Run: bun run script/honesty/domain-pins.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")

// ── the CARRIED-FORWARD Coverage pins (the completed state this sprint continues from; it carried Redesign → GroundTruth) ──
const COVERAGE = JSON.parse(readFileSync(path.join(H, "coverage-pins.json"), "utf8"))
const CARRIED_FROM = COVERAGE.pinsSha as string

// ── VERBATIM PINS — pinned EXACTLY (a summarization is a detectable Halt) ──────────────────────────────────────────────

// the DomainType enum (the carried LENDING/FUNDING beside the four new domains + UNCLASSIFIED). Pinned as an ordered list.
const DOMAIN_TYPES = ["LENDING", "FUNDING", "STABLE-SYNTH", "LST-LRT", "LOOPED-CDP", "RWA", "UNCLASSIFIED"] as const

// the conservative classifier's PINNED signatures. A subject classifies to a NEW domain ONLY on a clear single match; a
// subject matching TWO signatures, or matching none, is UNCLASSIFIED (the seven carried axes only — never a guess).
const CLASSIFIER_SIGNATURES = {
  "STABLE-SYNTH": {
    rule: "isStablecoin AND a SYNTHETIC/CDP-stable issuer whose yield is not plain lending interest — a stablecoin lending pool (aave/compound USDC) is NOT synthetic and stays LENDING",
    issuerAllowlist: ["ethena", "usde", "susde", "crvusd", "curve-usd", "gho", "aave-gho"],
  },
  "LST-LRT": {
    rule: "a liquid-staking or liquid-restaking token — a protocol redemption rate (on-chain, REAL★) exists BESIDE a thin secondary price; the depeg hides in the gap",
    symbolAllowlist: ["steth", "wsteth", "reth", "cbeth", "weeth", "ezeth", "rseth", "pufeth", "rsweth"],
  },
  "LOOPED-CDP": {
    rule: "a recursive-leverage vault or a CDP position — a health-factor/LTV/collateral-ratio read exists (on-chain, REAL★); the headline APY is levered and the number that decides the outcome is distance-to-liquidation",
    issuerAllowlist: ["gearbox", "contango", "loopfi", "cian", "instadapp-lite"],
    structuralSignal: "a leverageSignal (collateral + debt + liqThreshold) present in the captured facts",
  },
  "RWA": {
    rule: "a tokenized real-world asset — the collateral settles OFF-CHAIN (a T-bill custodian, a credit book, an attestation PDF); UNVERIFIABLE BY CONSTRUCTION; the chain sees only a token that SAYS it is backed",
    issuerAllowlist: ["ondo", "maple", "centrifuge", "buidl", "superstate", "usdy", "ousg", "goldfinch", "openeden"],
  },
  carried: "vertical 'lending' (and non-synthetic stablecoin-yield) → LENDING; vertical 'delta-neutral' → FUNDING; both render the seven carried axes as today (no new catch line)",
  unclassifiedRule: "ANY subject that does not clearly match exactly ONE new-domain signature — ambiguous, novel, or matching two — is UNCLASSIFIED and renders the seven carried axes ONLY. A guessed domain is a wrong lens, and a wrong lens is a wrong answer (S67). The classifier has NO optimistic default: it never up-classifies on a hunch.",
} as const

// the four catch-axis grammar forms — the PINNED example sentences (the render must speak in this grammar; a wording drift
// is detectable). Each is ONE additional honest line in the governance line's grammar, number-traced, info/context.
const CATCH_GRAMMAR = {
  "yield-source": "Yield source: perp-funding carry (not lending interest) — funding was negative in 9 of the last 30 periods; when it flips, this yield inverts and the peg takes the strain.",
  "redemption-gap": "Redemption 1.0412 ETH; market 1.0298 ETH — a 1.1% gap. Exit at par needs the queue; exit now takes the pool price.",
  "leverage-distance": "Headline 30.2% APY is 8.1× levered — a 12.3% collateral move liquidates you.",
  "off-chain-opacity": "This yield's collateral settles off-chain. Nothing on-chain can verify it. We cannot see the thing that matters — treat every clean axis below with that in mind.",
} as const

// the per-domain axis registry + the no-leakage rule (S67). An axis is reachable ONLY from its declared domain.
const AXIS_REGISTRY = {
  "STABLE-SYNTH": "yield-source",
  "LST-LRT": "redemption-gap",
  "LOOPED-CDP": "leverage-distance",
  "RWA": "off-chain-opacity",
  noLeakageRule: "an axis renders ONLY for its declared domain — a leverage axis on a STABLE subject, a redemption gap on a CDP, is a Halt (the seeded cross-render → REFUSED, S67). LENDING/FUNDING/UNCLASSIFIED declare NO catch axis (the seven carried axes only).",
} as const

// the RWA structural-cap spec + the agent-may-not-install clause (S69, D35). Pinned VERBATIM.
const RWA_CAP_VERBATIM =
  "An RWA subject may NEVER render SOLID — the verdict is STRUCTURALLY CAPPED at CAUTION/UNVERIFIED regardless of how clean every on-chain axis looks, because the yield's collateral settles off-chain and NOTHING on-chain can verify it. The cap renders as a REASON, not a shrug ('we cap this at CAUTION because we cannot see the thing that matters'). BUT a cap is a verdict-shaped RULE, and an AGENT MAY NOT INSTALL A VERDICT RULE (the D27/D29/D30 precedent): the machinery is BUILT, the affected census PRE-COMPUTED, the reason-rendering written — and the cap is LEFT UNINSTALLED until D35 is signed. Until then, RWA renders the WARNING + its SAMPLE-labeled attestation surface (issuer, auditor, cadence, last attestation date — context the user must go verify, NEVER a verification) and its axes honestly, with NO cap applied. The truth about the opacity is told immediately; the verdict-shaped consequence waits for the human."

// the X-BACKTEST discipline, pinned VERBATIM.
const BACKTEST_MISS_RULE_VERBATIM =
  "A MISS IS THE MOST VALUABLE OUTPUT THIS SPRINT CAN PRODUCE. If the unmodified engine would have rendered SOLID (or the catch axis stayed silent) before a real collapse, that MISS is written into the log verbatim with its subject, height, and rendered verdict, root-caused, and either fixed inside the constitution in a disclosed conscious change (re-running the whole harness to show the fix was not fitted to the miss) or recorded as an HONEST LIMITATION. A miss that is quietly dropped is the gravest possible failure of this sprint (S68). A 4-of-4 result with zero misses and zero gaps is SUSPECTED and re-examined, not celebrated — a backtest that only ever confirms the engine is a backtest that has been rigged."
const BACKTEST_CLAIM_WORDING_VERBATIM =
  "'The engine would have flagged N of M pinned collapses, missed K, and could not reach J' is the only sentence allowed. A 'flagged all' claim with an unreported miss → fail; a hits-only render → fail."

// ── THE PINNED COLLAPSE SUBJECT SET (X-BACKTEST a) — pinned WITH mechanism-match rationale + pre-collapse heights BEFORE
// Phase 4 fetches a single byte. One candidate per domain, chosen because its MECHANISM matches that domain's catch axis
// (NOT because it flatters the engine). Deep-2022 on-chain heights are EXPECTED to be HONEST GAPS on the free archive
// rotation (drpc/mevblocker/blastapi prune old state); the dYdX-indexer funding capture is reachable. The set is HASHED —
// a post-hoc edit (adding a subject the engine catches, dropping one it misses) moves the hash and fails the harness gate. ──
const BACKTEST_SUBJECTS = [
  {
    id: "B1-lst-steth-2022",
    domain: "LST-LRT",
    name: "stETH June-2022 redemption-gap depeg",
    subjectAddr: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", // Lido stETH
    secondaryAddr: "0xdc24316b9ae028f1497c275eb9192a3ea0f67022", // Curve stETH/ETH pool
    chainId: 1,
    height: 14975000, // ~mid-June 2022, the depeg trough window
    mechanismMatch: "the REDEMPTION-GAP axis: Lido redemption was ~1.0 ETH/stETH but LOCKED (no withdrawals until Shanghai, Apr-2023), while the thin Curve secondary traded to ~0.94 — the depeg lived ENTIRELY in the gap between a par redemption you could not reach and a pool price you could. Exactly what the axis renders (at par needs the queue; now takes the pool).",
    expectedReach: "LIKELY GAP — a 2022 height is beyond the free archive rotation's typical window; if unreachable → HONEST GAP recorded by name (never simulated).",
  },
  {
    id: "B2-stable-dydx-funding-flip",
    domain: "STABLE-SYNTH",
    name: "perp-funding-carry regime flip (dYdX v4 indexer, real history)",
    subjectAddr: "BTC-USD", // dYdX v4 indexer ticker (an indexer read, not an archive RPC)
    secondaryAddr: null,
    chainId: 1,
    height: 0, // N/A — the dYdX indexer serves a historical funding SERIES since v4 inception, not a single archive block
    mechanismMatch: "the YIELD-SOURCE axis's FUNDING-FLIP fact: a synthetic-stable 'savings rate' that is really short-vol perp carry inverts when funding flips negative. The dYdX v4 indexer serves the REAL historical funding series (free, keyless) — the axis computes the funding-flip census (negative in N of M periods) over what genuinely happened, demonstrating the catch on real data.",
    expectedReach: "REACHABLE — the dYdX indexer /v4/historicalFunding endpoint is free + keyless; the funding-flip census is computed over the REAL series (a HIT if meaningful negative periods exist; a MISS if funding was always positive — honest either way).",
  },
  {
    id: "B3-looped-steth-aave-2022",
    domain: "LOOPED-CDP",
    name: "looped stETH/ETH liquidation cascade (Aave v2, June-2022)",
    subjectAddr: "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9", // Aave v2 LendingPool
    secondaryAddr: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84", // stETH collateral
    chainId: 1,
    height: 14975000, // same June-2022 window — the stETH-loop deleveraging
    mechanismMatch: "the LEVERAGE-DISTANCE axis: recursive stETH/ETH loops on Aave were ~8× levered; as stETH depegged, the collateral-to-debt distance collapsed and positions cascaded into liquidation. The number that decided the outcome was NOT the loop APY but the % stETH move to liquidation — exactly what the axis names.",
    expectedReach: "LIKELY GAP — a 2022 height; if unreachable → HONEST GAP. (A per-position health factor also needs a specific borrower; the pin targets the pool-level liquidation-threshold surface.)",
  },
  {
    id: "B4-rwa-maple-orthogonal-2022",
    domain: "RWA",
    name: "Maple / Orthogonal Trading credit default (Dec-2022)",
    subjectAddr: "0xff9a51a8a3caed3a4b1e28f1c2eece83be55b2d0", // Maple M11 / Orthogonal pool (best-effort; verified-or-honest-gap in Phase 4)
    secondaryAddr: null,
    chainId: 1,
    height: 16180000, // ~Dec-2022, pre-default disclosure window
    mechanismMatch: "the STRUCTURAL-CAP argument, made by a REAL default: Orthogonal Trading defaulted on ~$36M of Maple loans — a collapse that was INVISIBLE on-chain (the pool's on-chain state looked solvent while the loan was defaulting off-chain). The seven axes + every on-chain read see NOTHING; only the structural cap protects the user. This is the domain where a clean on-chain scorecard is NOT evidence of safety — and if the engine would have rendered SOLID/benign here, that MISS is the argument FOR D35.",
    expectedReach: "LIKELY GAP + the address is best-effort (verified-or-honest-gap in Phase 4); even as a GAP the RWA structural point is recorded — the collapse was off-chain, which is precisely what no capture can see.",
  },
] as const
const SUBJECT_SET_HASH = sha256(JSON.stringify(BACKTEST_SUBJECTS))

// the depth-census spec (CV4) — the honest replacement for the rhetorically dangerous 99.95% breadth headline.
const DEPTH_CENSUS_SPEC = {
  rule: "the BREADTH headline ('15490/15497 covered') means only that the YIELD axis is renderable — NOT that a full Reality Check is possible. The DEPTH CENSUS states plainly, per axis, how many pools the tool can say something COMPLETE about (yield-reality / tvl-trend / peg / liquidity-depth / contract / governance / a domain catch). An OUTCOME, recorded as measured; a target that licenses inflating an axis count is a cut (S67/CV4).",
  qualifyingSentenceVerbatim: "'Covered' means the yield axis is renderable — not a full Reality Check. See the depth census for per-axis coverage: how many pools the tool can say something COMPLETE about, not merely something about.",
  artifact: "data/honesty/depth-census.json — per-axis coverage across the universe, content-hashed",
} as const

const PINS = {
  protocol: "domain-pins",
  sprint: "THE DOMAIN SPRINT (point the moat at the things most likely to break it — four DeFi domains as SUBJECT TYPES, each rendered like every other subject, each carrying ONE catch the seven axes cannot see; then FIRE the complete unmodified engine at real historical collapses and report every hit, MISS, and gap; restore the record discipline; present the whole gate D23–D36, D27 STILL first)",
  at: "2026-07-12",
  continues: "THE COVERAGE SPRINT (PINS_SHA cc08a77b; battery 1225/2/0 across 188 files; VALIDATED PASS-WITH-MINOR-ISSUES; the Redesign sprint now validated + ledgered)",
  carriedFromPinsSha: CARRIED_FROM, // the Coverage pins sha (which carried Redesign → GroundTruth); the engine/voice/contract/coverage carried, this ADDS domains + backtest

  // ── X-DOMAIN — KNOW WHAT KIND OF THING YOU ARE LOOKING AT (the first law; five clauses) ──
  xDomain: {
    a_subjectTypeNotScreen: {
      rule: "a domain is a subject TYPE, not a screen — the four domains render through the conscious 3 (Shelf → Reality Check → Ask/COMPARE + the lookup path) exactly like every other subject; a fourth screen is a Halt (X-SURFACE). A depositor should not be able to tell 'domain support' is a new feature — the tool now just KNOWS what kind of thing it is looking at.",
      screens: ["shelf", "reality-check", "ask"],
    },
    b_conservativeClassifier: {
      rule: "the classifier is CONSERVATIVE BY LAW — deterministic, pinned heuristics over captured facts; an ambiguous or novel subject is UNCLASSIFIED and renders the seven carried axes only; a subject matching two domain signatures is UNCLASSIFIED (never a guess). The seeded ambiguous fixture MUST classify UNCLASSIFIED (S67).",
      domainTypes: DOMAIN_TYPES,
      signatures: CLASSIFIER_SIGNATURES,
    },
    c_oneCatchAxisPerDomain: {
      rule: "each new domain declares EXACTLY ONE catch axis — the fact the seven cannot see, deterministic, number-traced, provenance-tiered, rendered in the same grammar as the governance line, INFO/CONTEXT this sprint. No cross-domain leakage (S67).",
      grammar: CATCH_GRAMMAR,
      registry: AXIS_REGISTRY,
    },
    d_rwaCapNotAgentInstalled: {
      rule: "the RWA cap is a rule about what CANNOT be known — a verdict-shaped rule an agent may NOT install; until D35 is signed, RWA renders the warning without the cap (S69).",
      capVerbatim: RWA_CAP_VERBATIM,
    },
    e_promotionsParked: {
      rule: "promotions are the Operator's — each catch axis's promotion to bounding/deciding (the funding-flip cap, the leverage cap, the redemption-gap cap) is SPECIFIED, conservative (degrade-only — a promotion may only cap a verdict, never lift one), census-attached, and PARKED as D36. An agent moves no verdict (the D27/D29/D30 precedent).",
      degradeOnly: "a promotion may only CAP a verdict, never LIFT one; an agent installs no verdict rule",
    },
  },

  // ── X-BACKTEST — FIRE THE COMPLETE SYSTEM AT ITS OWN GRAVEYARD, AND REPORT WHAT FALLS (the second law; five clauses) ──
  xBacktest: {
    a_pinnedBeforeCapture: {
      rule: "real collapses, pinned WITH mechanism-match rationale BEFORE any data is fetched; choosing subjects after seeing results is rigging (S68). The subject set is HASH-PINNED here — a post-hoc swap moves the hash and fails the harness gate.",
      subjects: BACKTEST_SUBJECTS,
      subjectSetHash: SUBJECT_SET_HASH,
    },
    b_archiveTruthOrGap: {
      rule: "archive-truth or honest gap — the Ground-Truth S63 machinery is reused verbatim: pinned height, FREE archive-capable endpoints, tri-endpoint agreement, content-hashed, re-verifiable; a height the free archive cannot reach is an HONEST GAP recorded by name, never simulated, never reconstructed.",
      archiveRotation: ["https://eth.drpc.org", "https://rpc.mevblocker.io", "https://eth-mainnet.public.blastapi.io"],
      triEndpointRule: "≥2 free endpoints must AGREE on the reads (a single endpoint is not load-bearing); 0 served → HONEST GAP with the full attempt log",
    },
    c_engineUnmodified: {
      rule: "the engine is UNMODIFIED during the replay — `git diff -- src/` empty through the harness run (the Lineage read-only discipline); tuning the engine while measuring it is the oldest fraud in quant and it is a Halt.",
    },
    d_missIsMostValuable: {
      rule: BACKTEST_MISS_RULE_VERBATIM,
      seededMissControl: "a seeded would-have-said-SOLID collapse MUST appear as a MISS in the artifact AND the render (the gravest wall, S68)",
    },
    e_bothDirectionsClaim: {
      rule: "the claim is worded to the evidence in BOTH directions",
      wordingVerbatim: BACKTEST_CLAIM_WORDING_VERBATIM,
    },
  },

  // ── the depth census (CV4) ──
  depthCensus: DEPTH_CENSUS_SPEC,

  // ── CV1–CV5 — the record discipline restored (the Coverage log let it slip) ──
  cv: {
    CV1: "the PR5 per-repo expect() wall — restored + recorded EVERY phase (both trees' counts, the delta stated, both 0-fail; a smoothed delta fails). Absent from the Coverage log after three sprints of readings — the standing wall exists precisely so the two trees cannot diverge behaviorally in silence.",
    CV2: "the per-phase SESSION MARKERs — restored as a GATE CONDITION: every phase ends stating its terminal PINS_SHA · its per-repo battery delta (+N file) · its PER-REPO expect() counts. A phase without them does not close.",
    CV3: "the evidentiary depth — the log QUOTES its controls' actual outputs (the seeded fixture, the refusal, the hash, the height); 'the wall bites' is not evidence, the bite is. The Coverage log asserted where Ground-Truth SHOWED.",
    CV4: "the 99.95% census honestly qualified everywhere it renders + replaced by the DEPTH CENSUS (per-axis coverage — the honest number). The rhetorically dangerous number replaced by the honest one.",
    CV5: "the W-CV itemization reconciled + the Operator gate updated for the already-pushed trees (the 'push decision' is stale; the gate is now D23–D36 + IN2/IN4/AF4). The Redesign sprint ledgered as VALIDATED.",
  },

  // ── the deviations reserved this sprint (Operator-signed=false — LN5; the agent NEVER signs the gate) ──
  deviations: {
    D34: "RESERVED — the domain scope: the DomainType enum + the conservative classifier + the four catch axes as INFO/CONTEXT, rendered through the conscious 3 (no fourth screen). Operator-signed=false.",
    D35: "RESERVED — the RWA structural cap (an RWA subject may NEVER render SOLID). A verdict-shaped rule — BUILT + census-pre-computed + reason-written, LEFT UNINSTALLED until the pen moves; until then RWA renders the warning without the cap (the agent installs no verdict rule). Operator-signed=false.",
    D36: "RESERVED — the catch-axis promotions (funding-flip cap, leverage cap, redemption-gap cap — conservative, degrade-only, censuses pre-computed). PARKED. Operator-signed=false.",
    operatorGatedNote: "D23–D36 present, D27 STILL FIRST under 'The Stamp is knowingly generous until D27 is signed'; the agent presents the whole gate, NEVER signs it (LN5); IN2/IN4/AF4 + the twelve countersigns are OWED-OPERATOR-GATED. The trees are pushed (terminal/v0.2 + studio/sandbox); what remains is IN2/IN4/AF4 + the pens + the publication decision for THIS layer.",
  },

  // ── the stress catalog grows S1–S66 (carried) → S67–S70 (new) — matching the Coverage carried-summary shape ──
  stressCatalog: {
    carried: "S1–S66 first-class, re-run in BOTH repos AND on every new domain (the voice/collapse/lineage walls, the parity, the tiers now re-run per domain)",
    count: 70,
    S67: "domain-classification integrity — the classifier CONSERVATIVE (the seeded ambiguous/novel fixture → UNCLASSIFIED, output SHOWN); NO cross-domain axis leakage (a leverage axis on a STABLE subject → REFUSED, the refusal SHOWN); the domain visible in provenance; the walls run identically on every domain",
    S68: "the backtest's honesty — the subject-set pin-hash matches Phase 0 (no post-hoc swap); the read-only-engine guard (a seeded src edit during the harness → the gate fails); tri-endpoint archive-truth or the named GAP; the MISS-REPORTED wall (a seeded would-have-said-SOLID collapse surfaces as a MISS in the artifact AND the render); the both-directions claim wording; the zero-miss-zero-gap suspicion flag",
    S69: "the RWA structural cap — the seeded PERFECT-ON-CHAIN RWA control cannot render SOLID under the spec's simulation, renders the warning today, and the cap is provably NOT agent-installed (the scored modules clean until D35; a git-grep for an installed cap is empty)",
    S70: "moat-under-domain — the provenance tiers, content-hashes, governance axis, differential, evidence bundle, and kill-criterion all hold across every new domain and every backtest capture",
  },

  // ── the constitution carried (byte-untouched; re-asserted for continuity) ──
  carried: {
    deps: ["hono", "zod"],
    screens: ["shelf", "reality-check", "ask"],
    frozenSevenNote: "the frozen seven + verdict-path 7 + frozen-core 2 byte-untouched; the scorecard differential + evidence bundle byte-identical at every gate (the gate's signed movers alone licensed); every catch axis is info/context OFF the scorecard verdict path; the RWA cap + all promotions are parked for the pen",
    verdictDifferential: { lendingFpSetShaPrefix: "70c7912f", fundingReproHashPrefix: "0a63151b", note: "byte-stable through nineteen sprints; the catch axes render like the governance line (out of the scorecard rows) — the Stamp's familyN stays 1; the substrate is untouched" },
    evidenceBundleShaPrefix: "9c1e7bd8",
    killCriterion: "8b4e094b",
    massPath: "hono+zod; every domain read is capture-time on the existing free rotation/providers; the dYdX v4 indexer enters as the STABLE domain's SECOND funding venue ONLY (free, keyless; the general cross-venue expansion stays PARKED); zero new paid providers",
    substrateUntouched: "the correlation substrate is NOT touched this sprint; the deflation stays INERT BY CONSTRUCTION (familyN===1 in every Stamp output)",
    parkedByName: ["the proposer + ONC + PBO/CSCV activation", "reports/API", "execution/custody", "the archive node / general indexer (the backtest is bounded: pinned subjects, pinned heights, three reads each)", "calibration scoring", "meta-labeling/ML on the verdict path (permanently)", "options/prediction-markets", "Pyth (the dated cost cliff)", "the dYdX FULL cross-venue expansion (this sprint uses it ONLY as the STABLE domain's second funding venue)"],
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const OUT = { ...PINS, pinsSha }
writeFileSync(path.join(H, "domain-pins.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── DOMAIN — the sprint contracts pinned ────────────────────────")
console.log(`  carried from Coverage : ${CARRIED_FROM.slice(0, 16)}…  (which carried Redesign → GroundTruth)`)
console.log(`  domain types          : ${DOMAIN_TYPES.join(" · ")}`)
console.log(`  backtest subjects     : ${BACKTEST_SUBJECTS.length} (subject-set hash ${SUBJECT_SET_HASH.slice(0, 16)}…, pinned BEFORE any capture)`)
console.log(`  stress catalog        : S1–S${PINS.stressCatalog.count} (S67–S70 new)`)
console.log(`  DOMAIN PINS_SHA       : ${pinsSha}`)
console.log("written: data/honesty/domain-pins.json")
