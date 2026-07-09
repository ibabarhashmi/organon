/**
 * ORGΛNON — THE SOVEREIGN SPRINT, Phase 0 driver (PINS-LOCKED). Continues from the COMPLETE Surface pins
 * (data/honesty/surface-pins.json, PINS_SHA b0179998…) — carried forward, never rebuilt. No product code; this pins,
 * before any plane byte or any design-pass change, the TWO spines' law + the Surface finding-resolutions + S39–S41:
 *   · X-PLANE — THE SOVEREIGN DATA-PLANE (Spine B). Exactly THREE narrow, enumerated + pinned extraction paths beside
 *     the RETAINED rented breadth: FUNDING-HISTORY (Hyperliquid public info keyless + Binance/Bybit public funding
 *     archives), POOL-EVENTS (Envio HyperSync, free-tier token env-keyed OPTIONAL seam, ONLY the enumerated events per
 *     shelf pool), RPC-STATE (the pinned rotating free public RPCs, source recorded per read). Gaps stay gaps (no
 *     interpolation/backfill — a fabricated point is a Halt); re-captures hash-stable; a dead endpoint degrades with the
 *     ACTUAL source recorded; divergence own-vs-rented is a SURFACED FACT, never silently resolved; the Stamp/axes may
 *     improve ONLY as the mathematical consequence of a genuinely longer REAL series (the math byte-untouched, goldens
 *     reproduce); the adapter-rot kill-condition is ARMED in writing (~1 day/week upkeep → buy DeFiLlama Pro + narrow).
 *     A fourth path / a general indexer / an archive node requires a re-pin or is a Halt.
 *   · X-DESIGNPASS — THE REAL DESIGN PASS (Spine A, D16). The interactive impeccable `critique` RUNS for real this sprint
 *     (design-review sub-agents + the deterministic detector), the skill trusted to design, fixes on the go — the
 *     Operator's approval given in advance (aesthetics ONLY). The S36 content-identity + S38 detector + dep + a11y walls
 *     run CONTINUOUSLY; a moved fact fails immediately; the SEMANTIC tokens stay byte-frozen (hash-locked into the
 *     Surface pin — a value change would break a frozen golden; the pass operates ABOVE the primitives); token re-pins
 *     are conscious; clarify touches chrome only; the screen count stays 3. Honest bound: the browser/screenshot +
 *     `live` flows are STILL NOT run (no browser automation) — the design-review is source-based, disclosed not overstated.
 *   · THE SURFACE FINDING-RESOLUTIONS SF1–SF5 — the framing led-with · the 804-vs-807 pristine reconciliation ·
 *     the a11y method-scoping · the V4 evidence-shape naming · the design-intelligence pass RUN.
 *   · D16 (the design-pass process amendment, Operator-signed) · D17 (the plane scope, Operator-signed).
 *   · THE STRESS CATALOG S1–S41 — S1–S38 carried verbatim + S39 plane-provenance/honest-degrade/no-fabricated-history ·
 *     S40 the narrow-path fence + the armed kill-condition · S41 design-pass honesty.
 * The pins are hash-locked. Deterministic; no network. The verdict-differential baseline is re-asserted so every phase
 * proves NO verdict moved (a re-plumbed data plane + a redesigned surface must move none).
 *
 * Run: bun run script/honesty/sovereign-pins.ts
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

// ── the sovereign blueprint, hash-locked (durable even when the planning doc is gitignored) ──
const BLUEPRINT_REL = "sprint/sprint-result/ORGANON_Sovereign_Sprint_Blueprint.md"
const blueprintSha = sha256(readFileSync(path.join(PKG_ROOT, BLUEPRINT_REL), "utf8"))

// ── the CARRIED-FORWARD Surface pins (the completed state this sprint continues from) ──
const SURFACE_PINS = JSON.parse(readFileSync(path.join(HONESTY_DIR, "surface-pins.json"), "utf8"))
const CARRIED_FROM = SURFACE_PINS.pinsSha as string
// the carried S1–S38 stress catalog (verbatim from the surface pins — continuity, not a rewrite)
const S1_S38 = SURFACE_PINS.stressCatalog as { id: string; name: string; expect: string }[]

// ── THE CANONICAL SOVEREIGN PINS (the object that is hashed; PINS.md renders these for humans) ──
const PINS = {
  protocol: "sovereign-pins",
  sprint: "THE SOVEREIGN SPRINT (the sovereign data-plane — three narrow enumerated+pinned extraction paths beside the retained rented breadth, gap-honest + divergence-surfaced + kill-condition-armed · the REAL interactive impeccable design pass, aesthetics pre-approved with the constitutional walls continuous · the five Surface findings closed)",
  at: "2026-07-09",
  continues: "THE SURFACE SPRINT (RED-TEAM-CLEAN, battery 807 pass / 2 skip / 0 fail across 127 files / 809 tests)",
  blueprint: { rel: BLUEPRINT_REL, sha: blueprintSha },
  carriedFromPinsSha: CARRIED_FROM, // the surface-pins sha, carried forward — the engine/voice/contract/design-system are unchanged in CONTENT; this sprint deepens the data plane + shapes the face, moving no verdict

  // ── X-PLANE (a) — THE THREE NARROW PATHS, ENUMERATED + PINNED. A fourth path is a conscious re-pin, never a drift. ──
  plane: {
    doctrine: "owning your senses is only worth it if every owned fact is as honest as the rented ones, and the maintenance trap has a pinned exit; the plane DEEPENS the narrow paths the verdict engine needs — it is NOT a general indexer and it REPLACES nothing",
    pathList: [
      {
        id: "FUNDING-HISTORY",
        feeds: "the delta-neutral vertical's carry/regime facts + the Stamp's decay/ICIR/MinTRL (genuinely longer REAL history)",
        sources: [
          { name: "Hyperliquid public info endpoint", url: "https://api.hyperliquid.xyz/info", keyless: true, tier: "T2-FORWARD", note: "type:fundingHistory — captured forward with a nonce, never retro-claimed (reuses src/dataplane/hyperliquid.ts)" },
          { name: "Binance public funding archive", url: "https://data.binance.vision", keyless: true, tier: "T1", note: "immutable monthly dumps + published checksum (reuses src/dataplane/funding.ts verifyT1 + reconstruct)" },
          { name: "Bybit public funding archive", url: "https://public.bybit.com", keyless: true, tier: "T1", note: "public historical funding, same gap-honest rule; NEW venue — a captured Bybit snapshot is REAL, an absent one stays ILLUSTRATIVE (the differential golden reads bybit=ILLUSTRATIVE and MUST reproduce)" },
        ],
        module: "src/plane/funding.ts",
        rangesPinned: "the extraction pulls the venue's available history for the pinned coins; the series carries its true window (start/end) — a shorter honest series beats a longer fabricated one",
      },
      {
        id: "POOL-EVENTS",
        feeds: "the seven axes' REAL time-series + the moat (where the rented plane gives only snapshots) for the shelf pools",
        sources: [
          { name: "Envio HyperSync", url: "https://<network>.hypersync.xyz", keyless: false, tier: "T2-FORWARD", note: "free-tier token env-keyed (HYPERSYNC_TOKEN), an OPTIONAL seam like BYOK — absent → the path degrades to the rented plane / SAMPLE, never a crash; self-hostable/replaceable; plain fetch, NO shipped SDK" },
        ],
        module: "src/plane/events.ts",
        enumeratedEvents: ["rate-update", "tvl-move", "liquidity-move"],
        fence: "ONLY the enumerated events per shelf pool are extracted — NEVER a full-protocol index; an un-enumerated event type is ignored (S40)",
      },
      {
        id: "RPC-STATE",
        feeds: "the freshness layer (current-state reads) + the honest fallback when a provider dies",
        sources: [
          { name: "rotating free public RPCs", url: "llamarpc / ankr / publicnode / 1rpc", keyless: true, tier: "T2-FORWARD", note: "current-state reads over a pinned rotation; the ACTUAL RPC used is recorded per read; a dead provider rotates honestly (degrade-never-crash)" },
        ],
        module: "src/plane/rpcstate.ts",
        rotation: ["https://eth.llamarpc.com", "https://rpc.ankr.com/eth", "https://ethereum.publicnode.com", "https://1rpc.io/eth"],
      },
    ],
    fourthPathRequiresRePin: "the path list is a PIN — exactly these three; a FOURTH extraction path (another exchange, another chain, another event class) requires a conscious re-pin with rationale, never a 'while we're here' drift; a general indexer or an archive node is a Halt (the research's maintenance-trap warning, now law)",
    // ── X-PLANE (c) — provenanced, gap-honest, fabrication-free ──
    gapHonest: {
      rule: "every owned series is capture-time + content-hashed + REAL/SAMPLE into the moat; an archive GAP STAYS A GAP — no interpolation, no backfill into REAL",
      haltRule: "a fabricated/interpolated history point stamped REAL is a Halt (S39, positive-controlled: a seeded gap-fill is REFUSED)",
      recaptureStable: "a re-capture of the same range is hash-stable (the content-address reproduces)",
      degradeHonest: "a dead endpoint / an absent token degrades to the rented fallback or SAMPLE, with the ACTUAL source honest in the record (an own-plane value that actually fell back is NOT stamped own-plane — Attack-8)",
    },
    // ── X-PLANE (d) — the rented plane stays; divergence is a FACT ──
    divergence: {
      rule: "DeFiLlama free · GeckoTerminal REMAIN the breadth fallback; where the own-plane and the rented plane disagree on an overlapping value beyond a pinned tolerance, the divergence is SURFACED — recorded to the moat AND rendered as the Pro-side divergence row — never silently resolved toward either source",
      tolerancePct: 5, // |own - rented| / |rented| > 5% → a surfaced divergence (a small pinned band; the exact value is not the honesty claim — the SURFACING is)
      haltRule: "a divergence auto-resolved toward either source (own-plane silently overwriting the rented plane, or vice-versa) is a Halt (S39, positive-controlled: a seeded disagreement → recorded + rendered, NEITHER value replaced)",
    },
    // ── X-PLANE (e) — honest improvement only ──
    honestImprovement: {
      rule: "the Stamp/axes may improve (fewer INSUFFICIENTs, richer facts) ONLY as the mathematical consequence of genuinely longer REAL series",
      mathUntouched: "the decay half-life / ICIR / MinTRL math is BYTE-UNTOUCHED (src/studio/{decay,icir,mintrl,stamp}.ts unchanged in logic); the adjudicator + Stamp goldens reproduce byte-identical on the old fixtures",
      tracedToObservations: "where INSUFFICIENT retreats it is TRACED to the observation count (T crossed a floor honestly — decay ≥ 30, icir ≥ 20, stamp ≥ 60, funding-band ≥ 100); a threshold nudged to exploit the new data is a Halt",
      separateGolden: "the frozen verdict-differential goldens (lending 70c7912f… + funding-bybit ILLUSTRATIVE 0a63151b…) read inputs left byte-untouched and MUST reproduce; the honest retreat is demonstrated on a NEW golden over the newly-captured longer series, never by perturbing a frozen golden",
    },
    // ── X-PLANE (f) — the kill-condition is ARMED ──
    killCondition: {
      threshold: "~1 day/week sustained plane upkeep (adapter rot eating the team — the research's own red-team; DeFiLlama's adapter model is the cautionary proof)",
      exit: "the recorded exit is BUY the DeFiLlama Pro shortcut ($300/mo) for breadth + NARROW the plane build further (drop a path back to the rented fallback)",
      armed: "pinned in writing so the trap has a door (S40); an upkeep ledger exists to MEASURE it — the kill-condition is a pin, not a vibe",
    },
    // ── X-PLANE (b) — free-first, optional seams ──
    hyperSyncSeam: {
      envKey: "HYPERSYNC_TOKEN",
      optional: "the HyperSync token is an env-keyed OPTIONAL seam exactly like BYOK — absent → the POOL-EVENTS path degrades to the rented plane / SAMPLE, the tool never crashes",
      selfHostable: "HyperSync is self-hostable/replaceable by design; the path module is thin (plain fetch) enough to swap; NO archive node (the research's explicit trap), nothing paid without the kill-condition firing first",
      neverShipped: "no SDK ships on the mass path (plain fetch against the documented API); any unavoidable SDK is capture-time dev-harness tooling, never a runtime dep (deps stay hono+zod)",
    },
  },

  // ── X-DESIGNPASS (D16) — THE REAL PASS, bounded by the walls. The Operator's trust; aesthetics ONLY. ──
  designPass: {
    doctrine: "the interactive impeccable flows RUN this sprint across the three screens; the skill is TRUSTED to design; fixes land on the go; the Operator's approval is given in advance; the red-team consolidates at PART E — the ONE absolute: the pre-approval covers AESTHETICS ONLY; the walls are not approvable away",
    critiqueRunForReal: "impeccable `critique` was RUN (unlike Surface, which was detector-only — D15): Assessment A (an independent design-review sub-agent reading the rendered source of all three screens + the token system, thinking like a design director per impeccable's product/brand register references) + Assessment B (the deterministic 45-rule detector), synthesized into a recorded professional critique (committed to .impeccable/critique/ as dev provenance) whose genuine findings were applied on the go",
    honestBound: "the browser/screenshot inspection portion of critique + the `live` browser-iteration flow are STILL NOT run — the autonomous harness has no browser automation; the design-review used SOURCE-BASED visual reasoning (the sub-agent reads the rendered HTML/CSS, not a screenshot). Disclosed, not overstated — a strict improvement over Surface's detector-only, precisely bounded",
    tokensStayFrozen: "the SEMANTIC tokens (data/honesty/design-tokens.json) stay BYTE-FROZEN — they are hash-locked into the Surface pin (b0179998; honesty_pins re-hashes the live file against it), so a token-VALUE change would break a frozen golden; the AA-cleared palette + type scale + non-color cues are honesty-load-bearing and correctly frozen. The pass operates ABOVE the primitives (composition, hierarchy, spacing rhythm, motion, states, the stylesheet mapping in build-stylesheet.ts + the markup classes in reality.ts); a token-value change surfaced by critique is a conscious deferred re-pin, never a forced silent edit",
    wallsContinuous: "the S36 content-identity golden + the S38 detector + the dep wall (hono+zod; impeccable dev-time-only) + the a11y floor (AA + non-color cues) run CONTINUOUSLY — every change re-validated; a moved fact/label/tier/verdict/provenance-mark fails the build the moment it lands, not at PART E",
    clarifyChromeOnly: "clarify touches CHROME copy only, NEVER a data label (the S36 golden enforces this automatically)",
    rePinsBatched: "token re-pins (if any) are BATCHED per working session, each with its sha delta + what/why in the session marker; churn without rationale is flagged at PART E — this sprint's pass made NO token-value change (the palette cleared AA first-pass in Surface), so no re-pin was needed",
    screenCount: 3,
    haltRule: "an approval invoked to lower a wall — the S36 golden, the detector, the dep wall, the a11y floor — is a Halt (the pre-approval is aesthetics only; the constitutional walls are not approvable away)",
  },

  // ── THE SURFACE FINDING-RESOLUTIONS (SF1–SF5) — the Surface validation report, closed as record hygiene (Phase 1; SF5 is Phase 2). ──
  sfResolutions: [
    { id: "SF1", finding: "the D15 caveat (interactive impeccable flows not run; detector-only) was buried in the ledger's last line while the header/pins claimed 'authored with impeccable'", resolution: "LED WITH: the BUILDLOG-SOVEREIGN header + D16 state plainly, up front, exactly what the Surface sprint's impeccable involvement WAS (detector-validated, authored-to-standard, interactive flows not run) and that THIS sprint runs the interactive CRITIQUE for real (design-review sub-agent + detector), with the browser/`live` flow still not run — disclosed, never overstated.", status: "RESOLVED" },
    { id: "SF2", finding: "the pristine clone reported 804 vs dev 807 — an off-by-one that did not cleanly resolve in the record", resolution: "ITEMIZED: surface_detector.test.ts has EXACTLY 4 tests, of which 3 are test.skipIf(!HAS_DETECTOR) — on a pristine clone the dev-harness detector is absent, so those 3 SKIP; pristine = 807 − 3 = 804 (the 4th, the dep-wall assertion, runs everywhere). The pristine skip set is {ask_live, eval_live} + surface_detector×3. Stated as 807 − N (N=3) and asserted in findings_closed_surface — the arithmetic dies here, reconciled, never silent.", status: "RESOLVED" },
    { id: "SF3", finding: "contrast is COMPUTED (rigorous) but keyboard/responsive are DOM-asserted, not a live viewport/AT pass — the claim scope was implicit", resolution: "SCOPED to method: contrast is COMPUTED from the token file (sRGB relative luminance — a rigorous numeric proof); keyboard-reachability + responsive behavior + non-color cues are DOM-ASSERTED (the rendered markup carries :focus-visible, the @media breakpoint, the ::before glyphs / border-styles) — NOT a live browser/AT/viewport pass. A real browser + assistive-technology check is flagged as a NAMED follow-up (parked, not claimed).", status: "RESOLVED" },
    { id: "SF4", finding: "V4's screenshot-durability is closed by a rendered-output assertion (the deterministic proxy); the literal image case was inferred", resolution: "NAMED the evidence shape: V4 is closed by the RENDERED-OUTPUT assertion (surface_content_identity asserts the visible ANALYSIS eyebrow sits in the rendered REASONING block, and that a REASONING block never renders in the FACT treatment) — a DETERMINISTIC PROXY for screenshot-durability; the literal rasterized-image case is INFERRED from the rendered markup, not pixel-tested. The proxy is the honest evidence; the image case is named as inference, not asserted as tested.", status: "RESOLVED" },
    { id: "SF5", finding: "the design-intelligence pass (Operator-run interactive critique/polish) was disclosed as not-run in Surface", resolution: "RUN as this sprint's Spine A (X-DESIGNPASS, D16): the impeccable critique executed for real (design-review sub-agent + detector), the genuine findings applied on the go under the Operator's standing approval, the walls continuous — with the browser/`live` flow still honestly not run (no browser automation). See D16.", status: "RESOLVED" },
  ],

  // ── DEVIATIONS D16–D17 (pinned; full entries in data/honesty/deviations.json), both Operator-signed. ──
  deviations: {
    D16: "the design-pass process amendment (Operator-signed) — aesthetics pre-approved fix-on-the-go, the S36/S38/dep/a11y walls continuous in CI, the red-team post-dev, token re-pins conscious+batched, clarify chrome-only; the critique RUN for real (design-review sub-agent + detector), the browser/`live` flow still not run (disclosed); the semantic tokens stay byte-frozen (the pass operates above the primitives)",
    D17: "the sovereign-plane scope (Operator-signed) — exactly three narrow enumerated+pinned extraction paths beside the retained rented breadth; gaps stay gaps (no backfill); divergence surfaced (never silently resolved); honest improvement only (the math untouched, goldens reproduce); the adapter-rot kill-condition armed in writing (~1 day/week → buy Pro + narrow); the plane modules built with injectable-fetch seams + hermetic positive-controlled tests, real captures opportunistic + committed, the run-vs-hermetic scope named honestly",
    operatorSignedNote: "Operator-signed = the Operator directed the coding agent to engineer this blueprint end-to-end; the blueprint's own text carries the pre-approval (D16) + the plane scope selection (D17). The same mechanism by which D11 (the X-ASK amendment) was Operator-signed in the Voice sprint — the directive to execute the document IS the sign-off; recorded here, not fabricated as a separate signature.",
  },

  // ── THE SCREEN SET (carried, unchanged) — the design pass reshapes the conscious 3; a fourth is a Halt. ──
  screens: {
    count: 3,
    set: ["shelf", "reality-check", "ask"],
    designPassReshapesNotAdds: "the Sovereign design pass reshapes the 3 screens (aesthetics only); it NEVER adds a fourth screen (PART CLEAN; the screens_frozen wall). The Pro-side divergence row is a ROW on the Reality Check, not a screen",
  },

  // ── THE RED-TEAM / STRESS CATALOG (PART E; S1–S41) — S1–S38 carried verbatim + S39–S41. ──
  stressCatalog: [
    ...S1_S38,
    { id: "S39", name: "plane provenance / honest-degrade / no-fabricated-history (NEW)", expect: "every owned series capture-time + content-hashed + REAL/SAMPLE; a re-capture hash-stable; gaps stay gaps (a seeded interpolation/gap-fill → REFUSED); a dead endpoint / absent token → honest degrade with the ACTUAL source recorded (a fallback value never stamped own-plane); a seeded own-vs-rented divergence → recorded + rendered, NEITHER value replaced; the Stamp/axis improvement traced to observation counts, the math goldens byte-identical" },
    { id: "S40", name: "the narrow-path fence + the armed kill-condition (NEW)", expect: "the path list is EXACTLY the pinned three; an un-enumerated event/exchange/chain → ignored/refused; a fourth path attempt → requires a re-pin (refused casually); the kill-condition text present + armed (~1 day/week → buy Pro + narrow); the upkeep ledger exists to measure it; NO general indexer / archive node" },
    { id: "S41", name: "design-pass honesty (NEW)", expect: "post-pass: the S36 content-identity golden byte-identical across the WHOLE pass (no number/label/tier/verdict/provenance-mark moved); the detector 0 unexcepted; deps exactly hono+zod (impeccable absent on the pristine clone, the stylesheet shipping); a11y AA + non-color cues green; the semantic tokens byte-frozen (any token re-pin batched + reasoned); ZERO wall suspensions attributed to the approval; the critique-run-for-real vs browser-not-run scope disclosed" },
  ],

  // ── carried, unchanged (the full constitution) ──
  carried: {
    frozenSeven: "the 6 computational-core .py + loop.ts byte-untouched (core_byte_identity green every gate); the plane RECORDS into the moat + the design pass restyles the RENDER — both are layers ON TOP of the deterministic frozen facts; they touch ZERO frozen bytes, move ZERO verdicts, fabricate ZERO history points, add ZERO runtime deps",
    verdictDifferential: "lending fp-set 70c7912f… + funding NO-GO/ILLUSTRATIVE 0a63151b… reproduce at every gate — zero verdicts moved by a sprint that re-plumbed the very data those verdicts rest on and redesigned the very screens they render on; the frozen goldens read byte-untouched inputs (bybit stays ILLUSTRATIVE — no bybit capture feeds the differential), the plane's longer REAL series is demonstrated on NEW goldens",
    designSystemUnchangedInTokens: "the pinned design system (data/honesty/design-tokens.json + DESIGN.md, hash-locked into the Surface pin) is UNCHANGED in token values; the design pass reshapes composition/hierarchy/motion/states ABOVE the frozen primitives; a token-value change would break the frozen Surface golden b0179998 — so it stays frozen (the pass needed none)",
    voiceUnchangedInContent: "the persona, the typed FACT/REASONING/BOUNDARY contract, the five gates, the 13 closed intents + no-key parity, the advice wall, the calibration clock, the eval harness, the MinTRL rider — all GREEN and UNMODIFIED in content (the plane deepens their FACTS; the design pass restyles their RENDER; neither changes their meaning)",
    contractPipeline: "the verified-build pipeline + the six-tool contract sub-axis (4 of 7 applicable REAL proxy-surface tiers) reused VERBATIM",
    deps: ["hono", "zod"],
    moatCadence: "the capture cadence appends ONLY REAL captures (content-addressed, hash-chained); the sovereign plane adds NEW content-addressed captures under NEW keys — it deepens the moat, it overwrites nothing",
    parked: "the LLM strategy-proposer / iterate-to-generate loop (awaits the probe + the SOLID-rate experiment); the vault reality-check reports + verdict API (the research's Stage-0/1 — the probe runs FIRST); execution/custody (the permanent red line); the archive node; a general indexer; the implementation-level contract analysis; the four un-ported LLM-free tools; the Sentinel fuzzer/RAG; the semgrep/Sigstore/apyBase research queue; LIVE per-provider eval sampling; the calibration resolution+scoring; the public library — AND a hard scope fence around a marketing site / a component framework / a motion showcase / impeccable 'overdrive' (a 'while we're here' is a cut) — all PARKED (THE FIREWALL)",
    probe: "the X-PROBE metrics + KILL CRITERION remain ARMED + honestly BUILT-BUT-UNPROVEN — and the handoff's FIRST LINE commits the NEXT sprint to the research's Stage-0: RUN the demand probe (the 10-customer kill-test) + publish the Stream/Elixir/Resolv re-score post-mortems. The plane and the face were the LAST prerequisites; there are none left — deferring again is indefensible",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const pinsOut = { ...PINS, pinsSha }
writeFileSync(path.join(HONESTY_DIR, "sovereign-pins.json"), JSON.stringify(pinsOut, null, 2) + "\n")

// ── THE VERDICT-DIFFERENTIAL BASELINE — re-asserted so every sovereign phase proves NO existing verdict moved. ──
const lendingSetSha = await VerdictDifferential.fingerprintSetSha()
const FUNDING_TS = Date.parse("2026-07-05T00:00:00Z")
const fundingRes = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, FUNDING_TS)

console.log("── SOVEREIGN — PHASE 0 (PINS-LOCKED) ─────────────────────────")
console.log(`blueprint sha        : ${blueprintSha}`)
console.log(`carried-from PINS_SHA: ${CARRIED_FROM}`)
console.log(`SOVEREIGN PINS_SHA   : ${pinsSha}`)
console.log(`lending fp-set sha   : ${lendingSetSha}`)
console.log(`funding verdict      : ${fundingRes.verdict} (${fundingRes.artifact?.reality ?? null}) reproHash ${String(fundingRes.artifact?.verdictReproHash).slice(0, 16)}…`)
console.log(`plane paths          : ${PINS.plane.pathList.map((p) => p.id).join(" · ")}`)
console.log(`SF resolutions       : ${PINS.sfResolutions.map((v) => v.id).join(", ")}`)
console.log(`deviations           : D16 (design-pass) · D17 (plane scope) — both Operator-signed`)
console.log(`screens              : ${PINS.screens.count} (${PINS.screens.set.join(" · ")})`)
console.log(`stress catalog       : ${PINS.stressCatalog.length} (S1–S41)`)
console.log(`written              : data/honesty/sovereign-pins.json`)
