/**
 * ORGΛNON — THE INTERPRETER SPRINT, Phase 0 driver (PINS-LOCKED). Continues from the COMPLETE Sovereign pins
 * (data/honesty/sovereign-pins.json, PINS_SHA 6fac4e94…) — carried forward, never rebuilt. No product code; this pins,
 * before any lane/register/truncation change, the X-INTERPRET law + the Sovereign follow-up resolutions + S42–S44:
 *   · X-INTERPRET(a) — THE WIDENED LANE, SAME FLOOR. REASONING blocks gain interpretive latitude (comparative framing,
 *     risk synthesis, the "so what", conditional structure); the FIVE deterministic gates (numericWhitelist, verdictGuard,
 *     comparisonDirection, severityLexicon, advicePattern) are UNCHANGED IN HEIGHT and re-run on the wider output; the
 *     FACT groundedness gate (Explain.verifyGroundedness) is BYTE-UNTOUCHED. The lane widens for interpreting FACTS,
 *     never for asserting non-facts; a wall lowered to let an explanation through is a Halt.
 *   · X-INTERPRET(b) — THE REAL REGISTER SPLIT (S42). Simple and Pro must produce MEASURABLY DIFFERENT reasoning on a
 *     pinned deterministic rubric: Simple carries NO pinned-jargon token + ≤ the Simple band + leads with the plain catch;
 *     Pro names ≥1 axis + cites provenance + carries the proxy-surface caveat where present + surfaces the divergence where
 *     present + ≥ the Pro band. Two identical registers, or a Simple that reads Pro, FAILS (src/ask/register.ts).
 *   · X-INTERPRET(c) — THE EXPLAIN-NOT-RESTATE PERSONA (D18). persona.md is RE-PINNED (ec98048d…, supersedes the Voice-era
 *     d0d7f18d… — voice-pins retains its historical record, NO cascade; the live hash-lock moves HERE, U-RESUPERSEDE) with
 *     explicit interpretation instruction + interpretation exemplars + the two-register exemplars; the FACT groundedness
 *     gate is untouched.
 *   · X-INTERPRET(d) — THE THREE-LAYER TRUNCATION KILL (S43). (1) CSS/render: the answer surface flows/scrolls, never
 *     clips (the S36 golden byte-identical — a container change, not a content change). (2) output-cap: max_tokens scaled
 *     to the fact-set size + a truncated finish DETECTED and continued or honestly marked, never a silent cut. (3) pre-AI
 *     fact-budget: the fact set budgeted + prioritized deterministically; if reduced the reduction is EXPLICIT (the answer
 *     names what was summarized), never a silent drop. CSS alone is REFUSED as a complete fix.
 *   · X-INTERPRET(e) — COMPARE explains the tradeoff: n FACT blocks + ONE comparative REASONING block, every number
 *     tracing, every direction matching, parity holding.
 *   · THE SOVEREIGN FOLLOW-UPS SV1–SV5 — the plane live-coverage line (SV1) · the funding-band surface clarified (SV3) ·
 *     the source-based-design-pass qualifier into continuity (SV4) · the browser/AT a11y follow-up named (SV5); SV2 (the
 *     HyperSync live capture) is Phase 4/5 (attempt-or-honest-gap).
 *   · D18 (the reasoning-lane amendment, Operator-signed) · D19 (the user-POV drive, Operator-signed).
 *   · X-DOGFOOD (D19) — the whole system driven from the user's POV post-dev, fix-on-the-fly, each logged.
 *   · THE STRESS CATALOG S1–S44 — S1–S41 carried verbatim + S42 register-differentiation · S43 the three-layer truncation
 *     kill · S44 interpretation-not-restatement + walls-hold-on-a-wider-lane.
 * The pins are hash-locked. Deterministic; no network. The verdict-differential baseline is re-asserted so every phase
 * proves NO verdict moved (a widened voice must move none).
 *
 * Run: bun run script/honesty/interpret-pins.ts
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

// ── the interpreter blueprint, hash-locked (durable even when the planning doc is gitignored) ──
const BLUEPRINT_REL = "sprint/sprint-result/ORGANON_Interpreter_Sprint_Blueprint.md"
const blueprintSha = sha256(readFileSync(path.join(PKG_ROOT, BLUEPRINT_REL), "utf8"))

// ── the CARRIED-FORWARD Sovereign pins (the completed state this sprint continues from) ──
const SOVEREIGN_PINS = JSON.parse(readFileSync(path.join(HONESTY_DIR, "sovereign-pins.json"), "utf8"))
const CARRIED_FROM = SOVEREIGN_PINS.pinsSha as string
// the carried S1–S41 stress catalog (verbatim from the sovereign pins — continuity, not a rewrite)
const S1_S41 = SOVEREIGN_PINS.stressCatalog as { id: string; name: string; expect: string }[]

// ── the RE-PINNED persona (D18) — the live hash-lock over the actual artifact bytes ──
const PERSONA_REL = "data/honesty/persona.md"
const personaSha = sha256(readFileSync(path.join(PKG_ROOT, PERSONA_REL), "utf8"))
const PERSONA_SUPERSEDES = SOVEREIGN_PINS && "d0d7f18d5d03850fa0d3d1164b4819f1cf08b94ef647065828827e0e26b2fd89" // the Voice-era record (voice-pins unchanged)

// ── THE CANONICAL INTERPRET PINS (the object that is hashed; PINS.md renders these for humans) ──
const PINS = {
  protocol: "interpret-pins",
  sprint: "THE INTERPRETER SPRINT (the voice stops restating and starts EXPLAINING — the REASONING lane widened for interpretation with the five walls unchanged in height, a REAL Simple/Pro register split, the COMPARE truncation killed at all three layers · the Sovereign follow-ups closed · then the whole system driven from the user's POV)",
  at: "2026-07-10",
  continues: "THE SOVEREIGN SPRINT (RED-TEAM-CLEAN, battery 858 pass / 2 skip / 0 fail across 133 files / 860 tests)",
  blueprint: { rel: BLUEPRINT_REL, sha: blueprintSha },
  carriedFromPinsSha: CARRIED_FROM, // the sovereign-pins sha, carried forward — the engine/verdicts/design-system/plane are unchanged in CONTENT; this sprint widens the reasoning lane + splits the registers + kills the truncation, moving no verdict

  // ── X-INTERPRET(a) — THE WIDENED LANE, SAME FLOOR. The whole value of the AI is the meaning the numbers can't carry;
  // the whole danger is that "explain more" becomes "lower the walls". The five gates are LAW, unchanged in height. ──
  lane: {
    doctrine: "the reasoning lane widens by giving the model MORE ROOM TO INTERPRET FACTS (comparative framing, risk synthesis, the so-what, conditional structure), NEVER more room to assert non-facts; the floor is the same height",
    interpretiveLatitude: ["comparative framing", "risk synthesis", "the so-what / what this means for the catch", "clearly-labeled conditional structure"],
    // the FIVE deterministic gates — listed UNCHANGED IN HEIGHT; they run on the WIDER output exactly as before (X-INTERPRET a)
    gatesUnchanged: [
      { id: "numericWhitelist", rule: "every number in the text must exist in the fact set (no model arithmetic; a derived value is engine-pre-computed)" },
      { id: "verdictGuard", rule: "the AI may name ONLY the engine's own verdict word(s); case-insensitive, negation-aware" },
      { id: "comparisonDirection", rule: "a comparative binding two fact-set entities over a fact metric must MATCH the fact ordering (fail-closed)" },
      { id: "severityLexicon", rule: "safe/audited/risk-free/guaranteed banned outright; critical/severe only fact-backed" },
      { id: "advicePattern", rule: "a recommendation shape routes to the ADVICE boundary (X-ADVICE, law)" },
    ],
    factGroundednessUntouched: "Explain.verifyGroundedness is BYTE-UNCHANGED (D11) — it runs BESIDE the five on a REASONING block; a REASONING block must be grounded too, never a story; the wider lane changed the persona instruction + the deterministic template SHAPE, not one gate function",
    haltRule: "a wall lowered to let an explanation through is a Halt; positive-controlled — a REASONING block with a smuggled derived number STILL rejects (numericWhitelist), a soft recommendation under 'what this means' STILL routes to the ADVICE boundary (advicePattern), a moved verdict STILL rejects (verdictGuard) — S44",
  },

  // ── X-INTERPRET(b) — THE REAL REGISTER SPLIT (S42). A deterministic rubric makes "the registers really differ" a wall. ──
  register: {
    module: "src/ask/register.ts",
    purity: "a pure (simpleReasoning, proReasoning, rubric) → RegisterVerdict + a pure per-register conformance check; wired as a gate — a mis-registered or identical pair rejects to the correctly-registered deterministic template",
    // the pinned jargon list — a Simple REASONING block carrying ANY of these tokens FAILS (case-insensitive)
    jargonList: ["ICIR", "deflated", "deflation", "MinTRL", "apyBase", "apyReward", "proxy-surface", "proxy surface", "storage-clash", "storage clash", "storage-layout", "annualized", "Sharpe", "half-life", "autocorrelation", "basis point", "deflated-Sharpe", "K_eff", "microstructure", "PBO"],
    // the Pro required specificity — a Pro REASONING block must NAME ≥1 axis term + CITE ≥1 provenance term
    axisTerms: ["base", "reward", "emission", "durable", "counterparty", "contract", "proxy", "upgrade", "peg", "depeg", "funding", "carry", "decay", "consistency", "persistence", "liquidity", "unlock", "dependency"],
    provenanceTerms: ["REAL", "SAMPLE", "provenance", "as-of", "as of", "captured", "capture", "recorded"],
    simpleBand: { maxChars: 360, mustLeadWithCatch: true, jargonForbidden: true },
    proBand: { minChars: 80, mustNameAxis: true, mustCiteProvenance: true, mustCarryProxyCaveatWherePresent: true, mustSurfaceDivergenceWherePresent: true },
    mustDiffer: "the two rendered REASONING blocks for the SAME query must DIFFER (identical → fail); the no-key templates satisfy this too (the Simple template ≠ the Pro template)",
    haltRule: "a Simple carrying a jargon token, a Pro omitting the required specificity, or two identical registers → REJECTED to the correctly-registered deterministic template (never a faked difference) — S42; positive-controlled (a Pro-jargon Simple answer → rejected)",
  },

  // ── X-INTERPRET(c) — THE EXPLAIN-NOT-RESTATE PERSONA (D18). A conscious re-pin; the live hash-lock moves here. ──
  personaRepin: {
    rel: PERSONA_REL,
    sha: personaSha,
    supersedes: PERSONA_SUPERSEDES, // the Voice-era record d0d7f18d… — voice-pins.json is UNCHANGED (no cascade); the live lock moves to THIS pin (U-RESUPERSEDE)
    what: "explicit 'the engine already showed the number — say what it MEANS, never repeat it as new' instruction + interpretation exemplars (restate vs explain) + the two-register exemplars (Simple/Pro) + the register-really-differ rule",
    factGroundednessGateUntouched: "the FACT groundedness gate (Explain.verifyGroundedness) is BYTE-UNCHANGED; the persona is INSTRUCTION, the gates are LAW downstream — a jailbroken persona degrades to templates, never to fabrication",
    note: "D18 conscious re-pin — the sha MOVED (d0d7f18d… → this); voice-pins.json retains its Voice-era record (a historical pin, superseded not rewritten), so the 8-sprint carry chain is untouched; honesty_pins re-hashes the LIVE persona.md against THIS pin",
  },

  // ── X-INTERPRET(d) — THE THREE-LAYER TRUNCATION KILL (S43). Fix all three; CSS alone is refused. ──
  truncation: {
    doctrine: "the Operator saw the CSS clip (the confirmed layer); the same symptom hides two deeper causes — fix all THREE, each positive-controlled with an oversized COMPARE; CSS alone would leave a tool that scrolls to reveal a subtly-incomplete answer, worse than an obvious clip",
    cssLayer: { module: "script/build-stylesheet.ts + public/organon.css", fix: "the answer surface flows/scrolls — long content wraps (overflow-wrap), no fixed-height clip on the answer path; honoring the design tokens", s36: "the S36 content-identity golden byte-identical (a render-container CSS change, not a content change — contentSig strips <style> + tags, only visible TEXT matters)" },
    outputCapLayer: { module: "src/ask/provider.ts + src/ask/truncation.ts", fix: "max_tokens SCALED to the fact-set size (never a fixed cap that cuts a big COMPARE); a truncated finish DETECTED (finish-reason/length heuristic) and continued or honestly MARKED '(continued)' — never a silent cut" },
    factBudgetLayer: { module: "src/ask/factbudget.ts", fix: "the fact set handed to the model is budgeted + prioritized DETERMINISTICALLY before it is seen; if it MUST be reduced, the reduction is EXPLICIT and the answer NAMES which strategies/axes were summarized — never a silent drop" },
    haltRule: "a clip, a silent cut, or a silent drop is a Halt; CSS alone is REFUSED as a complete fix; all three positive-controlled (S43): an oversized COMPARE does not clip AND does not silently cut AND is either whole or explicitly summarized",
  },

  // ── X-INTERPRET(e) — COMPARE explains the tradeoff (not n restatements). ──
  compare: {
    shape: "n FACT blocks (the numbers, unchanged, high-trust) + ONE comparative REASONING block that explains the tradeoff — never n restatements",
    everyNumberTraces: true,
    everyDirectionMatches: "the comparison-direction gate runs on the comparative block (a reversed comparison rejects)",
    parity: "no key → the side-by-side fact table + a deterministic template comparison, honest, no crash",
  },

  // ── THE SOVEREIGN FOLLOW-UP RESOLUTIONS (SV1–SV5) — the Sovereign validation + the Operator's live use, closed (Phase 1; SV2 is Phase 4/5). ──
  svResolutions: [
    { id: "SV1", finding: "the plane's live-coverage was disclosed per-path but never summarized in one line", resolution: "STATED in one honest line: FUNDING-HISTORY is live end-to-end (a real 500-point Hyperliquid BTC series, 0 gaps, deb4164c…, feeding the frozen decay/ICIR/MinTRL to a traced retreat); RPC-STATE is a single live probe (publicnode, block 25496922); POOL-EVENTS is built + fence-proven but NOT live-exercised (the HyperSync token was absent). One line, no path inheriting another's 'live'.", status: "RESOLVED" },
    { id: "SV3", finding: "the funding band improves the Stamp/facts but was not shown moving a rendered verdict", resolution: "CLARIFIED, not over-read: the genuinely-longer REAL funding history improves the STAMP inputs + the FACTS (fewer INSUFFICIENTs, richer bands) as the mathematical consequence of more observations — it was NOT shown moving a rendered Reality-Check verdict, and this sprint does not claim it did. The band is a Stamp/facts improvement, stated as such.", status: "RESOLVED" },
    { id: "SV4", finding: "the design pass was SOURCE-based, not a browser/visual/AT pass — the qualifier must carry", resolution: "CARRIED into continuity: the Sovereign design intelligence shaped the face via SOURCE review (the design-review sub-agent read the rendered HTML/CSS + the token system, not a rasterized screenshot); the browser/screenshot + `live` browser-iteration flows were not run (no browser automation). The qualifier is stated in the INTERPRET header + continuity, never allowed to evaporate.", status: "RESOLVED" },
    { id: "SV5", finding: "the real browser/AT a11y pass is the standing follow-up", resolution: "NAMED as the standing follow-up: contrast is COMPUTED from the token file (rigorous, sRGB relative luminance); keyboard-reachability + responsive + non-color cues are DOM-ASSERTED (the rendered markup carries :focus-visible, the @media breakpoint, the ::before glyphs / border-styles) — a real browser + assistive-technology + live-viewport pass is a NAMED, parked follow-up, not claimed as done.", status: "RESOLVED" },
    { id: "SV2", finding: "POOL-EVENTS is built + fence-proven but NOT live-exercised (token absent) — it must not inherit 'done'", resolution: "PHASE 4/5, attempt-or-honest-gap: if HYPERSYNC_TOKEN is provisioned by the Operator, the live POOL-EVENTS capture is run end-to-end + committed as evidence; if the token is absent, POOL-EVENTS stays an honest NAMED gap (built + fence-proven, NOT live) — never silently 'done'.", status: "PHASE-4/5-ATTEMPT-OR-GAP" },
  ],

  // ── DEVIATIONS D18–D19 (pinned; full entries in data/honesty/deviations.json), both Operator-signed. ──
  deviations: {
    D18: "the reasoning-lane amendment (Operator-signed) — REASONING blocks gain interpretive latitude (comparative framing, risk synthesis, the so-what, conditional structure); the FIVE deterministic gates + the FACT groundedness gate are UNCHANGED IN HEIGHT and re-run on the wider output; the persona is re-pinned to explain-not-restate (the sha moved d0d7f18d… → ec98048d…, a supersession, no cascade); the lane widens for interpreting FACTS, never asserting non-facts — a lowered wall is a Halt",
    D19: "the user-POV drive (Operator-signed) — after dev, the whole system is driven as a real user would drive it (every screen, all 13 Ask intents, every CLI verb, Simple AND Pro, key AND no-key, mobile AND desktop, empty/degraded states); issues fixed ON THE FLY, each recorded in the log (cause → fix → result); a pure-UX fix lands under the design walls (S36/detector/a11y), a fact/verdict/wall issue is routed like a correctness defect (never patched by lowering a wall); it runs ALONGSIDE the S-catalog red-team, not instead of it",
    operatorSignedNote: "Operator-signed = the Operator directed the coding agent to engineer this blueprint end-to-end; the blueprint's own text carries the lane amendment (D18) + the user-POV drive (D19). The same mechanism by which D11/D16/D17 were Operator-signed — the directive to execute the document IS the sign-off; recorded here, not fabricated as a separate signature.",
  },

  // ── X-DOGFOOD (D19) — the user-POV drive doctrine. ──
  dogfood: {
    doctrine: "nine sprints of red-team proved the WALLS; the Operator's live use proved the walls can hold while the EXPERIENCE is poor — so this sprint adds a standing post-dev discipline: drive the whole system as a user, fix on the fly, log each",
    matrix: ["every screen (Shelf · Reality Check · Ask)", "Simple AND Pro", "all 13 Ask intents", "every CLI verb", "key-present AND no-key", "mobile AND desktop widths", "the empty/UNVERIFIED/INSUFFICIENT/AI-off/divergence degraded states"],
    fixOnTheFly: "reproduce → root-cause → fix (pure-UX under the design walls; a fact/verdict/wall issue routed like a correctness defect) → re-test → log (cause → fix → result)",
    haltRule: "a fix-on-the-fly that moves a fact/verdict, invents a number, or lowers a wall is REFUSED and routed like any correctness defect; a fix that adds a dependency / a register / an intent / the parked scope is a PARK",
  },

  // ── THE SCREEN SET (carried, unchanged) — the Ask console learns to explain; a fourth is a Halt. ──
  screens: {
    count: 3,
    set: ["shelf", "reality-check", "ask"],
    askLearnsToExplain: "the Ask console's REASONING blocks now INTERPRET (the so-what, the tradeoff, the catch) in a register that really fits Simple vs Pro; COMPARE renders n FACT blocks + one comparative explanation that never clips; NO fourth screen, NO fourth register",
  },

  // ── THE RED-TEAM / STRESS CATALOG (PART E; S1–S44) — S1–S41 carried verbatim + S42–S44. ──
  stressCatalog: [
    ...S1_S41,
    { id: "S42", name: "register differentiation (NEW)", expect: "Simple and Pro produce measurably DIFFERENT reasoning on the pinned rubric: a jargon-carrying Simple / a specificity-omitting Pro / two identical registers → REJECTED to the correctly-registered template; the no-key templates satisfy the rubric too (Simple ≠ Pro); positive-controlled (a Pro-jargon Simple → rejected, a Pro omitting the axis → rejected)" },
    { id: "S43", name: "the three-layer truncation kill (NEW)", expect: "an oversized COMPARE does NOT clip (the CSS surface flows/wraps, no fixed-height, the S36 golden byte-identical), does NOT silently cut (the cap scaled to the fact-set size; a truncated finish detected + continued or honestly marked), does NOT silently drop (the fact budget is EXPLICIT — a reduced set names what was summarized); each layer positive-controlled; CSS-alone refused as a complete fix" },
    { id: "S44", name: "interpretation-not-restatement + walls-hold-on-a-wider-lane (NEW)", expect: "REASONING INTERPRETS (adds meaning) rather than re-printing a FACT block's numbers; AND every one of the five walls (numeric whitelist, verdict guard, comparison-direction, severity, advice) STILL rejects its seeded violation on the WIDER output — the lane widened, the floor did not drop; the persona re-pin is signed + hash-locked (the sha moved); the FACT groundedness gate byte-unchanged" },
  ],

  // ── carried, unchanged (the full constitution) ──
  carried: {
    frozenSeven: "the 6 computational-core .py + loop.ts byte-untouched (core_byte_identity green every gate); the widened lane changes the persona instruction + the deterministic template SHAPE + the register/truncation/budget layers ON TOP of the deterministic frozen facts — it touches ZERO frozen bytes, moves ZERO verdicts, invents ZERO numbers, gives ZERO advice, adds ZERO runtime deps",
    verdictDifferential: "lending fp-set 70c7912f… + funding NO-GO/ILLUSTRATIVE 0a63151b… reproduce at every gate — zero verdicts moved by a sprint that gave the voice more to say; the frozen goldens read byte-untouched inputs (bybit stays ILLUSTRATIVE)",
    designSystemUnchangedInTokens: "the pinned design system (data/honesty/design-tokens.json, hash-locked into the Surface pin b0179998…) is UNCHANGED in token values; the CSS-flow truncation fix is a render-container change ABOVE the frozen primitives; the S36 content golden byte-identical (contentSig strips <style> + tags)",
    voiceUnchangedInContentExceptPersona: "the typed FACT/REASONING/BOUNDARY contract, the five gates, the FACT groundedness gate, the 13 closed intents + no-key parity, the advice wall, the calibration clock — all GREEN and UNMODIFIED in content; the ONLY conscious change is the persona re-pin (D18, instruction not law) + the widened deterministic template SHAPE + the NEW register/truncation/factbudget layers",
    planeUnchanged: "the sovereign plane (funding/events/rpcstate/divergence) is unchanged in logic; SV2 attempts the POOL-EVENTS live capture (or keeps it an honest gap); the funding band is a Stamp/facts improvement (SV3), never shown moving a rendered verdict",
    deps: ["hono", "zod"],
    parked: "the LLM strategy-proposer / iterate-to-generate loop; the vault reality-check reports + verdict API; execution/custody (the permanent red line); the archive node; a general indexer; the implementation-level contract analysis; the Sentinel fuzzer/RAG; LIVE per-provider eval sampling; the calibration resolution+scoring; the public library — AND a hard scope fence around model arithmetic / a fourth register / an open intent set / a render-engine rewrite (a 'while we're here' is a cut) — all PARKED (THE FIREWALL)",
    probe: "the X-PROBE metrics + KILL CRITERION remain ARMED + honestly BUILT-BUT-UNPROVEN — the handoff's FIRST LINE commits the NEXT sprint to the research's Stage-0: RUN the demand probe (the 10-customer kill-test) + publish the Stream/Elixir/Resolv re-score post-mortems. This sprint fixes the voice the probe will be judged on; there are no prerequisites left",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const pinsOut = { ...PINS, pinsSha }
writeFileSync(path.join(HONESTY_DIR, "interpret-pins.json"), JSON.stringify(pinsOut, null, 2) + "\n")

// ── THE VERDICT-DIFFERENTIAL BASELINE — re-asserted so every interpret phase proves NO existing verdict moved. ──
const lendingSetSha = await VerdictDifferential.fingerprintSetSha()
const FUNDING_TS = Date.parse("2026-07-05T00:00:00Z")
const fundingRes = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, FUNDING_TS)

console.log("── INTERPRET — PHASE 0 (PINS-LOCKED) ─────────────────────────")
console.log(`blueprint sha        : ${blueprintSha}`)
console.log(`carried-from PINS_SHA: ${CARRIED_FROM}`)
console.log(`INTERPRET PINS_SHA   : ${pinsSha}`)
console.log(`persona re-pin       : ${PERSONA_SUPERSEDES.slice(0, 8)}… → ${personaSha.slice(0, 8)}… (D18, supersession — voice-pins unchanged)`)
console.log(`lending fp-set sha   : ${lendingSetSha}`)
console.log(`funding verdict      : ${fundingRes.verdict} (${fundingRes.artifact?.reality ?? null}) reproHash ${String(fundingRes.artifact?.verdictReproHash).slice(0, 16)}…`)
console.log(`register rubric       : ${PINS.register.jargonList.length} jargon tokens · Simple ≤ ${PINS.register.simpleBand.maxChars} · Pro ≥ ${PINS.register.proBand.minChars}`)
console.log(`SV resolutions       : ${PINS.svResolutions.map((v) => v.id).join(", ")}`)
console.log(`deviations           : D18 (lane) · D19 (user-POV drive) — both Operator-signed`)
console.log(`screens              : ${PINS.screens.count} (${PINS.screens.set.join(" · ")})`)
console.log(`stress catalog       : ${PINS.stressCatalog.length} (S1–S44)`)
console.log(`written              : data/honesty/interpret-pins.json`)
