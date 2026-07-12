/**
 * ORGΛNON — THE MANIFEST SPRINT, the pins builder (X-MANIFEST). Continues from the COMPLETE Domain pins
 * (data/honesty/domain-pins.json — PINS_SHA 2b1dd373, which carried Coverage cc08a77b → Redesign → GroundTruth) —
 * carried forward, never rebuilt. This pins, BEFORE one line of product code, every contract of the sprint that gives
 * the falsification engine its DOCKET — `Strategy` as a declarative SUBJECT the user authors and the existing engine
 * JUDGES (never authors):
 *   · X-MANIFEST(a) DECLARATIVE-ONLY — the user writes positions/thesis/exit; the tool outputs verdicts + facts; a
 *     suggested weight, a rebalance, a ranked alternative, or ANY allocation output is a Halt (S71; X-ADVICE absolute;
 *     the Markowitz rejection stands). The BANNED-OUTPUT LIST is pinned VERBATIM + testable.
 *   · X-MANIFEST(b) COMPILE = COMPOSITION — every number already exists in the engine; a strategy of ONE position
 *     renders BYTE-IDENTICAL to today's Reality Check; a portfolio fact below its honesty floor is INSUFFICIENT, never a
 *     thin decimal. The composed grammar forms are pinned.
 *   · X-MANIFEST(c) RECORDED, NEVER COUNTED — every compile appends to the pinned trials schema, hash-chained per
 *     manifest lineage; `familyN === 1` in every Stamp output STILL; the K-door refuses without BOTH the
 *     ≥20–50-trials/family trigger AND D33 (S72). The recording-≠-counting clause is pinned VERBATIM.
 *   · X-MANIFEST(d) THE EXIT CRITERION IS THE USER'S KILL-CRITERION — evaluable-over-captured-facts-only or REFUSED at
 *     registration with the reason; content-hashed; immutable-without-a-disclosed-re-pin; evaluation deterministic (S73).
 *   · X-MANIFEST(e) A STRATEGY IS A SUBJECT — it renders through the conscious 3 as a drawer + a path; the COMPOSITE
 *     verdict is D38, PARKED for the pen; the journal is local-first, consented-export-only.
 *   · The DV closures (DV1 the four showcase subjects + representativeness rationale pinned BEFORE capture · DV3 the
 *     leverage position-scope sentence · DV4 the dual-repo cadence · DV5 the invite scoreline).
 *   · D37 (the manifest scope) + D38 (the composite verdict, parked) reserved (Operator-signed=false — LN5); S71–S73.
 *     Carry 2b1dd373 → new.
 * The pins are hash-locked; deterministic; no network. The verbatim strings are pinned EXACTLY so a summarization (a
 * banned list missing "rankings", a recording clause that omits the pen) is a detectable Halt. Run: bun run script/honesty/manifest-pins.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")

// ── the CARRIED-FORWARD Domain pins (the completed state this sprint continues from; it carried Coverage → Redesign → GroundTruth) ──
const DOMAIN = JSON.parse(readFileSync(path.join(H, "domain-pins.json"), "utf8"))
const CARRIED_FROM = DOMAIN.pinsSha as string

// ── VERBATIM PINS — pinned EXACTLY (a summarization is a detectable Halt) ──────────────────────────────────────────────

// the DECLARATIVE-ONLY banned-output list (X-MANIFEST a, S71). The compiler JUDGES, NEVER AUTHORS: any of these shapes in
// a Composed Reality Check is a Halt (the seeded suggested-allocation output is REFUSED + quoted). X-ADVICE is absolute.
const BANNED_OUTPUTS = [
  "suggested weights",
  "suggested allocation",
  "rebalance",
  "ranked alternatives",
  "rankings",
  "allocation",
  "consider instead",
  "you should allocate",
  "optimal weights",
  "recommended split",
] as const

// the RECORDING-≠-COUNTING clause (X-MANIFEST c, S72), pinned VERBATIM. Recording makes the future activation POSSIBLE +
// the present iteration honest; COUNTING (feeding K into the DSR) changes verdict-adjacent statistics and belongs to D33.
const RECORDING_NOT_COUNTING_VERBATIM =
  "Every compile appends to the pinned trials schema, hash-chained per manifest lineage — RECORDED. But recording is NOT counting: `familyN === 1` holds in EVERY Stamp output STILL; the K-door (effectiveK → the Stamp's familyN) refuses to open without BOTH the pinned ≥ 20–50-trials-per-family trigger AND the Operator's D33 signature — both unsigned today, so every K-feed is REFUSED and the deflation stays INERT. Recording merely makes the future honest activation POSSIBLE (the trials become REAL) and the present iteration HONEST (the user sees their own trial count — the beginning of multiple-testing literacy). A trial written with familyN=K 'just to see' is a Halt; the ledger readout states the inertness in plain words."

// the EXIT-CRITERION discipline (X-MANIFEST d, S73), pinned VERBATIM. The tool's own `8b4e094b` kill-criterion discipline,
// exported to the user as a primitive: a goalpost set before the throw, immutable without a disclosed re-pin.
const EXIT_DISCIPLINE_VERBATIM =
  "The exit criterion is the USER'S kill-criterion: concrete, EVALUABLE over facts the engine already captures (a peg floor, a funding-flip count, a TVL drawdown, a governance-class change — the pinned evaluable set), content-hashed AT REGISTRATION exactly as the tool's own `8b4e094b` is, and IMMUTABLE-without-a-disclosed-re-pin. A criterion the engine CANNOT evaluate (needing data it cannot capture — 'exit when Twitter sentiment turns') is REFUSED at registration with the reason. A silent edit to a registered criterion is DETECTED (the content hash diverges); the ONLY amendment is a disclosed re-pin recording old/new + reason. The fired/not-fired evaluation is DETERMINISTIC over the captured facts (byte-identical ×2). Exporting the discipline's FORM without its FORCE (an unevaluable criterion accepted, or a silently-editable one) is a Halt."

// the pinned EVALUABLE SET — the criterion kinds the engine can evaluate over its already-captured facts. A kind outside
// this set is refused at registration with the reason (S73). Each maps to a fact the existing pipeline already computes.
const EXIT_EVALUABLE_SET = {
  "peg-floor": "fires when the subject's captured peg falls below the threshold (e.g. 0.995) — the peg axis's own reading",
  "funding-flip-count": "fires when funding was negative in ≥ threshold of the last N captured periods — the funding-flip census (yield-source catch)",
  "tvl-drawdown": "fires when captured TVL falls ≥ threshold from its captured peak — the tvl-trend axis's own series",
  "governance-change": "fires when the captured governance class changes (e.g. a gated admin resolves to an EOA) — the governance line's own read",
} as const

// the COMPOSED-GRAMMAR forms (X-MANIFEST b) — the pinned example sentences the drawer must speak (a wording drift is
// detectable). Each portfolio-level line is info/context, number-traced, provenance-tiered, in the same grammar as the
// governance/catch lines. The COMPOSITE VERDICT is explicitly NOT among them — its ABSENCE is a pinned, labeled line (D38).
const COMPOSED_GRAMMAR = {
  effectiveBets: "These 3 positions' recorded yields cluster into ≈ 2 independent bets (min-overlap met; ρ-matrix traced). info/context — a fact about correlation, never an allocation.",
  effectiveBetsInsufficient: "We can't show a diversification read yet — INSUFFICIENT (only 18 shared points, below the pinned 30-point floor; correlation on thin overlap is fabricated precision).",
  catchAggregationFunding: "2 of 3 positions source yield from perp-funding carry — the strategy's income concentrates in one regime; when funding flips, they invert together.",
  catchAggregationLeverage: "1 position is a levered loop — this evaluates a POSITION, not the protocol (the leverage is specific to that vault's structure and collateral).",
  catchAggregationRwa: "One position settles off-chain: a slice of this strategy cannot be verified on-chain. Nothing on-chain can prove the backing.",
  worstAxis: "Weakest deciding axis across the strategy: position B's tvl-trend (fail).",
  thesisAge: "Thesis registered 4 days ago — younger than its own evaluation window: UNJUDGEABLE-YET (a thesis is not judged before it has had time to be wrong).",
  exitEval: "Exit criterion registered · hash 3b9f… · evaluated: NOT FIRED (peg 0.9989 ≥ floor 0.995).",
  compositeAbsence: "a composite strategy verdict is NOT rendered — it awaits the Operator's D38 (a verdict-shaped rule needs the pen).",
} as const

// DV3 — the leverage catch's POSITION-SCOPE sentence, pinned VERBATIM (the B3 lesson made legible in the render).
const DV3_POSITION_SCOPE_VERBATIM =
  "this evaluates a position, not the protocol — the leverage is specific to this vault's structure and collateral, not a property of the protocol as a whole."

// DV4 — the dual-repo build/port cadence, PINNED as the documented standard (not a per-phase slippage).
const DV4_CADENCE_VERBATIM =
  "build-in-organon through the phases → `git format-patch | git am` port to organon-studio AT CONVERGENCE → the byte-identical trees ASSERTED + the PR5 divergence wall re-recorded with BOTH repos' fresh runtime expect() counts (the +24 delta stated, never smoothed). The batched cadence is the LAW, not a slippage; a per-phase studio letter is not required, but the convergence port + the tree-identity assertion + the PR5 wall ARE."

// DV5 — the invite-package line: the backtest scoreline beside the PAID capture.
const DV5_INVITE_LINE_VERBATIM =
  "we fired the complete unmodified engine at real historical collapses and published the two it would have MISSED (the Maple off-chain default — the argument for D35 — and the seeded control), beside the two it would have flagged and the one the free archive cannot reach."

// ── DV1 — THE FOUR SHOWCASE SUBJECTS, selection rationale pinned BEFORE capture (the FIREWALL: representativeness, the
// largest/most-held REAL subject per domain — NOT chosen because the catch axis looks dramatic on it). One per new domain.
// The pin names each by project+symbol+chain (as CURATED does); the poolKey/capture is Phase 1 (verified-or-honest-gap). ──
const SHOWCASE_SUBJECTS = [
  { domain: "STABLE-SYNTH", project: "ethena-usde", symbol: "sUSDe", chain: "Ethereum", rationale: "the largest synthetic-dollar by TVL whose yield is perp-funding carry (not lending interest) — the representative STABLE-SYNTH, chosen for size not for a dramatic funding-flip census." },
  { domain: "LST-LRT", project: "lido", symbol: "stETH", chain: "Ethereum", rationale: "the largest liquid-staking token — the representative LST-LRT, whose redemption-vs-secondary gap is the canonical case; chosen for dominance, not for a wide gap." },
  { domain: "LOOPED-CDP", project: "gearbox", symbol: "USDC", chain: "Ethereum", rationale: "a real recursive-leverage vault provider — the representative LOOPED-CDP whose headline APY is levered; chosen as the most-established looping venue, not for an extreme leverage multiple." },
  { domain: "RWA", project: "ondo-finance", symbol: "USDY", chain: "Ethereum", rationale: "a large tokenized-treasury (real-world asset) — the representative RWA whose collateral settles off-chain; chosen for size, its opacity warning the point regardless of how clean its on-chain axes look." },
] as const

const PINS = {
  protocol: "manifest-pins",
  sprint: "THE MANIFEST SPRINT (the falsification engine gains a DOCKET — `Strategy` a declarative SUBJECT the user authors + the existing engine judges; COMPILE = the existing engine composed; every compile a hash-chained TRIAL recorded-never-counted; the tool's own kill-criterion discipline exported as a user primitive; the dogfooding instrument the strategy memo demanded; every Domain-validation finding closed; the whole gate D23–D38, D27 STILL first)",
  at: "2026-07-12",
  continues: "THE DOMAIN SPRINT (PINS_SHA 2b1dd373; battery 1281/2/0 across 197 files; VALIDATED PASS; the four DeFi domains + the collapse-backtest 2/2/1; the whole gate D23–D36 presented, D27 STILL first)",
  carriedFromPinsSha: CARRIED_FROM, // the Domain pins sha (which carried Coverage → Redesign → GroundTruth); the engine/voice/contract/coverage/domain carried, this ADDS the manifest primitive + the trial ledger's first real entries

  // ── X-MANIFEST — THE COMPILER JUDGES, NEVER AUTHORS (the sprint's law; five clauses) ──
  xManifest: {
    a_declarativeOnly: {
      rule: "DECLARATIVE-ONLY — the user writes positions/thesis/exit; the tool outputs verdicts + facts; a suggested weight, a rebalance, a ranked alternative, or ANY allocation output is a Halt (S71; X-ADVICE absolute; the Markowitz rejection stands). The compiler's authority comes from the same place a compiler's does: it refuses, and its refusals are trusted BECAUSE it never writes your code.",
      bannedOutputs: BANNED_OUTPUTS,
      bannedRule: "any of the banned-output shapes in a Composed Reality Check is a Halt — the seeded suggested-allocation output is REFUSED and quoted (S71); the advice wall (X-ADVICE, gates.ts advicePattern) is re-run on EVERY composed line.",
    },
    b_compileIsComposition: {
      rule: "COMPILE = COMPOSITION, not computation — every number in a Composed Reality Check ALREADY exists in the engine (the per-position pipeline · correlate.ts · the catch axes · the tiers); a strategy of ONE position renders BYTE-IDENTICAL to today's Reality Check (perfect backward compatibility); a portfolio fact below its honesty floor renders INSUFFICIENT, never a thin decimal.",
      grammar: COMPOSED_GRAMMAR,
      minOverlapFloor: 30, // Correlate.MIN_OVERLAP — below this the effective-bets fact is INSUFFICIENT (never a thin decimal)
    },
    c_recordedNeverCounted: {
      rule: "RECORDED, never COUNTED — every compile appends to the pinned trials schema, hash-chained per manifest lineage; `familyN === 1` in every Stamp output STILL; the K-door refuses without BOTH the ≥ 20–50-trials-per-family trigger AND D33 (S72); the ledger readout says so in plain words.",
      recordingNotCountingVerbatim: RECORDING_NOT_COUNTING_VERBATIM,
      kDoorRequiresBoth: "BOTH the ≥ 20–50-trials-per-family trigger AND the Operator's D33 signature — both unsigned today; a seeded K-feed is REFUSED (Correlate.activateKIntoStamp throws)",
    },
    d_exitIsUsersKillCriterion: {
      rule: "THE EXIT CRITERION IS THE USER'S KILL-CRITERION — concrete, evaluable over facts the engine captures, content-hashed at registration, immutable-without-a-disclosed-re-pin, its evaluation deterministic (S73); a criterion the engine cannot evaluate is refused at registration with the reason.",
      disciplineVerbatim: EXIT_DISCIPLINE_VERBATIM,
      evaluableSet: EXIT_EVALUABLE_SET,
    },
    e_strategyIsASubject: {
      rule: "A STRATEGY IS A SUBJECT, not a screen — it renders through the conscious 3 as a DRAWER on the existing Reality Check surface + a PATH (`/check` accepts a manifest exactly as it accepts a pool key); the COMPOSITE verdict is D38, PARKED for the pen (its absence labeled in the render); the journal is local-first, consented-export-only (X-TELEMETRY unchanged). An authored allocation, a counted trial, a silently-edited exit, a composite pill, or a server-side account is a Halt.",
      screens: ["shelf", "reality-check", "ask"],
      compositeAbsenceVerbatim: COMPOSED_GRAMMAR.compositeAbsence,
    },
  },

  // ── THE MANIFEST SCHEMA (pinned shape; the zod `.strict()` schema in src/strategy/manifest.ts conforms to this) ──
  manifestSchema: {
    schemaVersion: 1,
    strict: true, // zod `.strict()` — an unknown key is refused with a sentence, never silently dropped
    fields: {
      positions: "positions[] — each { subjectKey: string (a subject the engine already knows — curated or lookup), size: number > 0, units: string (the user's own units — NO USD conversion), assumptions?: string }",
      thesis: "thesis: string — the conjecture, written IN ADVANCE, filed for refutation (a 10MB thesis is refused politely)",
      exitCriterion: "exitCriterion: { kind: (peg-floor|funding-flip-count|tvl-drawdown|governance-change), threshold: number, subjectScope: string (a subjectKey or 'portfolio') } — evaluable-over-captured-facts-only or refused at registration",
      journal: "journal?: { priorIntent?: string, decisionAfter?: string, changedByCompile?: boolean } — the decision-journal fields, local-first, consented-export-only",
    },
    refusalRule: "parseManifest returns the Manifest OR a REFUSAL SENTENCE naming which field + why (never a crash); an unknown subject key, an oversized thesis, an injection-shaped input, a manifest referencing a manifest (no recursion this sprint) → refused with a sentence.",
  },

  // ── THE STRATEGY-OF-ONE BYTE-IDENTITY REQUIREMENT (S71's backward-compat control) ──
  strategyOfOneByteIdentity: {
    rule: "compile({one position}) renders BYTE-IDENTICAL to that subject's standalone Reality Check — a strategy of one IS today's Reality Check; the composed drawer adds nothing when there is nothing to compose (asserted byte-for-byte; S36 held).",
  },

  // ── the trials-ledger schema this sprint fills for the FIRST time (Moat RE5 — read from moat-pins.json; recorded here for continuity) ──
  trialLedger: {
    schemaSource: "data/honesty/moat-pins.json (Moat RE5 — the per-trial record: config + return series + metric + content hash, PINNED-EMPTY-WAITING since Moat)",
    perTrialRecord: ["manifestHash (config = the manifest content hash)", "composedFacts (the composed surface)", "metricSurface (the metric)", "timestamp", "prevTrialHash (hash-chained per manifest lineage)"],
    store: "data/strategies/trials/ (local, gitignored) + a committed FIXTURE lineage for the walls",
    inertProof: "the chain re-verifies on a pristine clone; `familyN === 1` in every Stamp output; the seeded K-feed REFUSED; the readout renders the inertness (S72).",
  },

  // ── the composed grammar's DV3 leverage position-scope sentence + the DV4/DV5 texts ──
  dv: {
    DV1: { rule: "the four SHOWCASE SUBJECTS — one REAL, representative subject per new domain, the rationale pinned BEFORE capture (representativeness, NOT a flattering catch axis — the FIREWALL); the depth census recomputed as an outcome (domain-catch 0/7 → 4/11).", subjects: SHOWCASE_SUBJECTS },
    DV2: "D35 re-presented WITH B4's MISS as evidence (the Maple off-chain default — 'the on-chain state looked solvent while the loan defaulted off-chain — the engine would NOT have flagged it'); the cheapest evidence-backed pen on the table.",
    DV3: { rule: "the leverage axis is POSITION-SCOPED — its render says so (the B3 lesson made legible).", positionScopeVerbatim: DV3_POSITION_SCOPE_VERBATIM },
    DV4: { rule: "the dual-repo cadence PINNED as the documented standard (not a slippage).", cadenceVerbatim: DV4_CADENCE_VERBATIM },
    DV5: { rule: "the backtest scoreline into the invite package beside the PAID capture.", inviteLineVerbatim: DV5_INVITE_LINE_VERBATIM },
  },

  // ── the deviations reserved this sprint (Operator-signed=false — LN5; the agent NEVER signs the gate) ──
  deviations: {
    D37: "RESERVED — the manifest scope: declarative-only (the compiler judges, never authors) · recording-≠-counting (every compile a trial, familyN===1 STILL) · the exit criterion the user's content-hashed kill-criterion · the journal's local-first, consented-export-only posture. A record + a primitive — it moves no verdict and adds no advice. Operator-signed=false.",
    D38: "RESERVED — the COMPOSITE STRATEGY VERDICT: an aggregate SOLID/CAUTION over a strategy's positions. SPECIFIED, conservative (an aggregate may only be as good as its worst deciding position — degrade-only), and PARKED for the pen. A verdict-shaped rule an agent may NOT install (the D27/D29/D30/D35 precedent); until signed, a strategy renders its positions' verdicts + the composed facts, and NO aggregate pill (the absence itself labeled). Operator-signed=false.",
    operatorGatedNote: "D23–D38 present (D34/D35/D36 carried in domain-countersign; D37/D38 reserved here), D27 STILL FIRST under 'The Stamp is knowingly generous until D27 is signed'; the agent presents the whole gate, NEVER signs it (LN5); IN2/IN4/AF4 + the countersigns are OWED-OPERATOR-GATED. The central deviations.json ledger materializes D1–D31; the reserved pens D32–D38 live in the per-sprint pins + countersign packages (all operatorSigned=false) — the split is surfaced, not silent (X-DEVLEDGER).",
  },

  // ── the stress catalog grows S1–S70 (carried) → S71–S73 (new) ──
  stressCatalog: {
    carried: "S1–S70 first-class, re-run in BOTH repos AND over the new surfaces (the voice/lineage/collapse/telemetry/domain walls; S36 byte-identity; the parity; the tiers now run over the composed drawer)",
    count: 73,
    S71: "manifest integrity — declarative-only (the seeded weights/rebalance/ranking outputs REFUSED, quoted); the strategy-of-one byte-identity (compile of a single-position manifest === the standalone render); the advice wall green on every composed line; unevaluable exits refused at registration with the reason; garbage/hostile manifests refused with sentences, never crashed",
    S72: "trials honesty — the chain re-verifies on a pristine clone; the schema matches the Moat pin verbatim; RECORDING-≠-COUNTING (`familyN === 1` everywhere; the seeded K-feed REFUSED; the readout exact; the D33 text asserts BOTH trigger AND pen)",
    S73: "exit immutability — content-hash at registration; the seeded silent edit DETECTED (the hash diverges); the disclosed re-pin records old/new + reason; the fired/not-fired evaluation DETERMINISTIC ×2 over the captured facts",
  },

  // ── the constitution carried (byte-untouched; re-asserted for continuity) ──
  carried: {
    deps: ["hono", "zod"],
    screens: ["shelf", "reality-check", "ask"],
    frozenSevenNote: "the frozen seven + verdict-path 7 + frozen-core 2 byte-untouched; the scorecard differential + evidence bundle byte-identical at every gate (no verdict moves — per-position verdicts ARE the existing verdicts; the composite is parked); every composed line is info/context OFF the scorecard verdict path; the Stamp familyN stays 1",
    verdictDifferential: { lendingFpSetShaPrefix: "70c7912f", fundingReproHashPrefix: "0a63151b", note: "byte-stable through TWENTY sprints; the composed drawer renders like the governance/catch lines (out of the scorecard rows) — the Stamp's familyN stays 1; the substrate gains its SECOND CALLER (compile.ts) and the statistics change by exactly nothing" },
    evidenceBundleShaPrefix: "9c1e7bd8",
    killCriterion: "8b4e094b",
    massPath: "hono+zod; the manifest store is Bun-stdlib JSON, local, gitignored; the compile composes EXISTING seams; zero new dependencies, zero paid providers, zero accounts",
    substrateUntouched: "the correlation substrate's STATISTICS are NOT touched — this sprint gives it its long-owed SECOND CALLER (compile.ts) and changes ZERO math; the deflation stays INERT BY CONSTRUCTION (familyN===1 in every Stamp output)",
    parkedByName: ["the COMPOSITE strategy verdict (D38 — the pen's act)", "the PROPOSER + ONC + PBO/CSCV + K-activation (the trigger ≥ 20–50 trials/family + D33)", "the ADVERSARY seat (the thesis-attacking AI — specified, not built)", "strategy MONITORING-on-cadence (Sprint 2)", "the personal POST-MORTEM (Sprint 3)", "valuation/pricing of position sizes (no USD conversion)", "any strategy marketplace/leaderboard (advice in a costume — REJECTED permanently)", "reports/API", "execution/custody (permanent)", "the archive node", "Pyth", "options/prediction-markets"],
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const OUT = { ...PINS, pinsSha }
writeFileSync(path.join(H, "manifest-pins.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── MANIFEST — the sprint contracts pinned ──────────────────────")
console.log(`  carried from Domain   : ${CARRIED_FROM.slice(0, 16)}…  (which carried Coverage → Redesign → GroundTruth)`)
console.log(`  banned outputs        : ${BANNED_OUTPUTS.length} shapes (the compiler judges, never authors)`)
console.log(`  exit evaluable set    : ${Object.keys(EXIT_EVALUABLE_SET).join(" · ")}`)
console.log(`  showcase subjects     : ${SHOWCASE_SUBJECTS.map((s) => `${s.project}/${s.symbol}`).join(" · ")}`)
console.log(`  stress catalog        : S1–S${PINS.stressCatalog.count} (S71–S73 new)`)
console.log(`  MANIFEST PINS_SHA     : ${pinsSha}`)
console.log("written: data/honesty/manifest-pins.json")
