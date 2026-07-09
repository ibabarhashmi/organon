/**
 * ORGΛNON — THE SURFACE SPRINT, Phase 0 driver (PINS-LOCKED). Continues from the COMPLETE Voice pins
 * (data/honesty/voice-pins.json, PINS_SHA eb55ce43…) — carried forward, never rebuilt. No product code; this pins,
 * before any restyle, the pinned ORGΛNON design system + the detector gate + the dev-time-only + honesty-preserving
 * rules + the trust-tier/verdict/REAL-SAMPLE semantic contract + the Voice finding-resolutions + the S36–S38 catalog:
 *   · THE PINNED DESIGN TOKENS (X-SURFACE a) — data/honesty/design-tokens.json hash-locked exactly like the persona; a
 *     changed token ⇒ a changed tokens sha ⇒ a changed PINS_SHA ⇒ a conscious re-pin, never a silent restyle.
 *   · THE SEMANTIC CONTRACT (X-SURFACE d) — the trust tiers (FACT/REASONING/BOUNDARY, the ANALYSIS label rendered
 *     adjacent — V4), REAL/SAMPLE, and the verdict/Stamp words each a pinned color PLUS a non-color cue (glyph/border/
 *     weight — never color alone), every semantic pairing WCAG-AA.
 *   · THE DETECTOR GATE (X-SURFACE c, S38) — impeccable's deterministic 45-rule detector (no LLM, no key) wired as the
 *     S38 battery wall; ABSENT on a pristine clone (the skill is dev-harness, not repo) → a named honest skip; project
 *     exceptions in the committed .impeccable/config.json with a REASON (the constitution outranks the detector).
 *   · THE DEV-TIME-ONLY RULE (X-SURFACE b) — impeccable never a runtime dep; deps frozen hono+zod; .impeccable/ gitignored
 *     except config.json; what LANDS is the OUTPUT (public/organon.css + polished HTML), never the tooling.
 *   · THE HONESTY-PRESERVING RULE (X-SURFACE e, S36) — a restyle changes layout/type/color/space/motion, NEVER a number/
 *     label/tier/verdict/provenance-mark/which-facts-appear; cues render via CSS keyed on the classes, the HTML content
 *     byte-untouched; every content/differential/frozen-seven test byte-identical, checked per screen.
 *   · THE VOICE FINDING-RESOLUTIONS V1–V5 — intent-lineage restated · the reconciliation line · the eval scope honest ·
 *     the ANALYSIS-label rendered assertion · the eval denominators.
 *   · D14 the pinned design system · D15 the impeccable dev-seam scope · a NAMING correction (findings_closed_v is taken
 *     by Build-Provenance's V1–V4 → the Voice-findings closure is findings_closed_voice — a caught collision, not silent).
 *   · THE STRESS CATALOG S1–S38 — S1–S35 carried verbatim + S36 honesty-preserving-restyle · S37 a11y/degraded-states ·
 *     S38 the detector wall.
 * The pins are hash-locked. Deterministic; no network. The verdict-differential baseline is re-asserted so every phase
 * proves NO verdict moved (a restyle that touches the very surface the verdicts render on must move none).
 *
 * Run: bun run script/honesty/surface-pins.ts
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

// ── the surface blueprint, hash-locked (durable even when the planning doc is gitignored) ──
const BLUEPRINT_REL = "sprint/sprint-result/ORGANON_Surface_Sprint_Blueprint.md"
const blueprintSha = sha256(readFileSync(path.join(PKG_ROOT, BLUEPRINT_REL), "utf8"))

// ── THE PINNED DESIGN TOKENS — read + hash the artifact (a changed byte ⇒ a changed tokens sha ⇒ a changed PINS_SHA) ──
const TOKENS_REL = "data/honesty/design-tokens.json"
const tokensSha = sha256(readFileSync(path.join(PKG_ROOT, TOKENS_REL), "utf8"))
const DESIGN_MD_REL = "DESIGN.md"
const designMdSha = sha256(readFileSync(path.join(PKG_ROOT, DESIGN_MD_REL), "utf8"))

// ── the CARRIED-FORWARD Voice pins (the completed state this sprint continues from) ──
const VOICE_PINS = JSON.parse(readFileSync(path.join(HONESTY_DIR, "voice-pins.json"), "utf8"))
const CARRIED_FROM = VOICE_PINS.pinsSha as string
// the carried S1–S35 stress catalog (verbatim from the voice pins — continuity, not a rewrite)
const S1_S35 = VOICE_PINS.stressCatalog as { id: string; name: string; expect: string }[]

// ── THE CANONICAL SURFACE PINS (the object that is hashed; PINS.md renders these for humans) ──
const PINS = {
  protocol: "surface-pins",
  sprint: "THE SURFACE SPRINT (the pinned ORGΛNON design system · the trust-tier/verdict/REAL-SAMPLE semantic contract with non-color cues · the impeccable dev-time-only seam + its 45-rule detector wired as the S38 wall · the honesty-preserving restyle of the 3 screens · a11y + responsive + intentional degraded states; Voice findings V1–V5 closed)",
  at: "2026-07-09",
  continues: "THE VOICE SPRINT (RED-TEAM-CLEAN, battery 768 pass / 2 skip / 0 fail across 121 files / 770 tests)",
  blueprint: { rel: BLUEPRINT_REL, sha: blueprintSha },
  carriedFromPinsSha: CARRIED_FROM, // the voice-pins sha, carried forward — the engine/voice/contract are unchanged in CONTENT; the surface is a render-layer restyle

  // ── THE PINNED DESIGN TOKENS (X-SURFACE a) — the single source of truth; the stylesheet is BUILT from these. ──
  tokens: {
    rel: TOKENS_REL,
    sha: tokensSha, // hash-locked: an edited token changes this sha, which changes PINS_SHA — a conscious re-pin, never a silent restyle
    designMd: { rel: DESIGN_MD_REL, sha: designMdSha }, // the human/agent-readable spec, also pinned
    mode: "dark",
    semanticsFirst: "a restrained near-monochrome dark ground + a small set of PURPOSEFUL semantic accents (the only colors carry meaning); the FACTS are the loudest thing on the screen — an instrument of reason, not a casino",
    builtNotHandEdited: "public/organon.css is BUILT from these tokens (script/build-stylesheet.ts), deterministically — a token change regenerates it byte-stably; the CSS is never hand-edited",
    consciousRePin: "a changed token ⇒ a changed tokens sha ⇒ a changed PINS_SHA — a conscious re-pin surfaced with its sha delta (a token tweak to fix a contrast finding is a RE-PIN, not a silent edit)",
  },

  // ── THE SEMANTIC CONTRACT (X-SURFACE d) — the honesty visual contract; every distinction survives a screenshot + greyscale. ──
  semanticContract: {
    trustTiers: {
      FACT: "the high-trust tier — heaviest weight, a solid full border, a '✓' eyebrow; the engine-fact treatment",
      REASONING: "visibly secondary; the 'ANALYSIS — not an engine fact' label RENDERED adjacent (V4 — in the output, screenshot-durable, not merely a markup attribute)",
      BOUNDARY: "the honest edge — a DASHED full border (a non-color pattern cue) + muted weight",
    },
    analysisLabelRendered: "the 'ANALYSIS — not an engine fact' label is emitted as a rendered adjacent eyebrow on every REASONING block (V4 — a screenshot carries it); a REASONING block rendered in the FACT treatment is a Halt",
    realSampleCue: "REAL = a '●' filled mark + a SOLID border; SAMPLE = a '○' hollow mark + a DASHED border — a non-color cue, never color alone",
    verdictWords: ["SOLID", "CAUTION", "AVOID", "UNVERIFIED"],
    stampWords: ["GO", "NO-GO", "INSUFFICIENT", "UNAVAILABLE"],
    nonColorCueRule: "every verdict / Stamp / REAL-SAMPLE / trust-tier distinction carries a NON-COLOR cue (a glyph via CSS ::before, a border-style, or a weight) PLUS the word itself — NEVER color alone (a11y + honesty; verified by surface_a11y — S37)",
    wcagAA: "every semantic color pairing hits WCAG-AA (body ≥ 4.5:1, large/bold ≥ 3:1), computed from the token file (surface_a11y)",
    cuesViaCssNotContent: "the cues render via CSS keyed on the existing semantic classes (.SOLID, .REAL, .blk.analysis, …) — the HTML CONTENT is byte-untouched, so the semantic upgrade cannot move a fact (S36)",
  },

  // ── THE DETECTOR GATE (X-SURFACE c, S38) — the deterministic 45-rule detector as a standing wall against AI slop. ──
  detectorGate: {
    tool: "impeccable detect — a deterministic 45-rule anti-pattern detector (static HTML/CSS analysis; NO LLM, NO API key, NO browser for files)",
    catches: ["AI-slop: purple gradients, bounce/elastic easing, Inter-for-everything, cards-in-cards, gray-on-color, dark glows, side-tab accent borders", "general-quality: line-length, cramped padding, small touch targets, skipped headings, flat type hierarchy"],
    wiredAs: "S38 — test/organon/surface_detector.test.ts runs the detector over the rendered surface + the built stylesheet and asserts ZERO unexcepted findings",
    command: "node ~/.claude/skills/impeccable/scripts/detect.mjs --json <targets>  (or: npx impeccable detect --json)",
    skipWhenAbsent: "the impeccable skill lives in the DEV HARNESS (~/.claude/skills/impeccable), NOT the repo — so on a pristine fresh clone the detector is ABSENT and S38 SKIPS honestly (a named skip joining {ask_live, eval_live} → {ask_live, eval_live, surface_detector}); the built stylesheet ships IN-REPO and the mass tool + verify run without the tool (proving X-SURFACE b — dev-time-only)",
    exceptionMechanism: "project-legitimate exceptions live in the committed .impeccable/config.json (detector.ignoreRules) EACH with a REASON; surface_detector reads that file and asserts every detector finding is one of the reasoned exceptions — an unexcepted anti-pattern fails the wall; a silent suppression is refused",
    committedExceptions: [
      { rule: "em-dash-overuse", reason: "ORGΛNON's honest prose + engine-produced data labels use the em-dash as a pinned house style (the verdict reasons, 'not a full audit — not a guarantee', 'GO/NO-GO — never conflated'); these strings are CONTENT, byte-frozen under S36 — softening them would change a rendered label. Per Attack-11 the constitution outranks the detector; waived with this reason, in the committed record." },
    ],
    constitutionOutranksDetector: "a detector 'fix' that would change a rendered fact/label (S36) or add a runtime dep (X-SURFACE b) is REFUSED and logged as a committed exception with a reason (Attack-11) — never a silent honesty/dependency regression",
  },

  // ── THE DEV-TIME-ONLY RULE (X-SURFACE b) — the tool never ships; the OUTPUT does. ──
  devTimeOnly: {
    rule: "impeccable (the skill + CLI + .impeccable/ working files + live-mode/browser state) is DEV-TIME-ONLY; NONE of it ships on the mass path",
    massPathUnchanged: "the mass tool stays server-rendered Bun/TS; the runtime deps are FROZEN at hono+zod (no CSS framework, no CSS-in-JS, no component library, no design package)",
    whatLands: "the OUTPUT — one committed token-built stylesheet (public/organon.css) + polished server-rendered HTML — never the tooling",
    gitignore: ".impeccable/* is gitignored EXCEPT .impeccable/config.json (the committed reasoned-exception record, kept as dev provenance)",
    deps: ["hono", "zod"],
    haltRule: "a runtime import of impeccable / a CSS framework / CSS-in-JS is a Halt; the pristine fresh clone is GREEN with impeccable ENTIRELY ABSENT (the design tool proven dev-time-only)",
  },

  // ── THE HONESTY-PRESERVING RULE (X-SURFACE e, S36) — the gravest risk; a restyle is the easiest place to move a fact. ──
  honestyPreserving: {
    rule: "a style change may alter LAYOUT, TYPE, COLOR, SPACING, and MOTION; it may NEVER alter a number, a label, a tier, a verdict, a provenance mark, or which facts appear",
    mechanism: "all styling + every non-color cue render via CSS keyed on the existing semantic classes; the HTML CONTENT (the text + the structure the tests assert on) is byte-untouched by the restyle",
    checkedPerScreen: "surface_content_identity (S36) asserts the rendered FACTS (numbers, labels, tiers, verdicts, provenance marks, the ANALYSIS label text, the residual disclosure) are byte-identical before/after the restyle, PER SCREEN — not only at the end",
    stylesheet: { rel: "public/organon.css", builtFrom: TOKENS_REL, singleArtifact: "ONE committed stylesheet, no runtime framework, server-rendered inline (module-cached read)" },
    haltRule: "a restyle that moves a verdict, hides a SAMPLE mark, drops the ANALYSIS label, renders a REASONING block in the FACT treatment, or changes a rendered number is a Halt",
  },

  // ── THE VOICE FINDING-RESOLUTIONS (V1–V5) — the Voice validation report, closed as record hygiene (Phase 1; V4 in Phase 3). ──
  findingResolutions: [
    { id: "V1", finding: "the Voice intent-count deviation was disclosed as a mechanical 'enum interpretation' when it was really a caught blueprint-arithmetic error", resolution: "RESTATED plainly: the blueprint's five-new-intents premise was off by one — COMPARE PRE-EXISTED in the Crown-Jewel 8, so only 4 were net-new; the pinned count of exactly 13 was honored by UPGRADING COMPARE in-place to n-strategies AND wiring the pre-existing-but-unrouted RECORD_HISTORY tool (the provenance moat made reachable by voice — the sprint's own thesis). A caught blueprint-arithmetic correction, not a mechanical enum note.", status: "RESOLVED" },
    { id: "V2", finding: "the terminal Voice battery count was per-phase-derivable but never summarized in one line", resolution: "RECONCILED in one line: '703 → 768 (+65 pass, +9 files, +1 skip → the skip set {ask_live, eval_live})' — stated once in the continuity carry, and adopted as this sprint's closing convention (a single reconciliation line at the RED-TEAM-CLEAN marker).", status: "RESOLVED" },
    { id: "V3", finding: "D12 is titled 'per-provider' but only Groq was measured live", resolution: "STATED honestly: only Groq was measured LIVE (post-gate leaks = 0); the other four providers are covered by the SHARED-GATE ARCHITECTURE (the five deterministic gates are downstream of EVERY provider identically — the integrity guarantee is uniform), NOT by live per-provider sampling. Live per-provider eval sampling is flagged as a NEXT-sprint item alongside the demand probe.", status: "RESOLVED" },
    { id: "V4", finding: "the ANALYSIS-label 'survives a screenshot' claim was tested as markup-presence/copy-paste, not visual render", resolution: "the label is RENDERED as an adjacent eyebrow on every REASONING block (in the output a screenshot carries, not merely a markup attribute), and surface_content_identity adds a RENDER assertion that the visible label sits in the rendered REASONING block AND that a REASONING block never renders in the FACT treatment — folded into the surface work (Phase 3).", status: "RESOLVED" },
    { id: "V5", finding: "the eval attempt-rates were given without their denominators", resolution: "STATED the eval attack-set size (the denominator) so the attempt-rates carry their n — the fixed battery is the closed set of intents + the seeded attack cases; each rate is 'k of N' with N surfaced in the eval docs + D12.", status: "RESOLVED" },
  ],

  // ── DEVIATIONS D14–D15 (pinned; full entries in data/honesty/deviations.json) + a NAMING correction. ──
  deviations: {
    D14: "the pinned ORGΛNON design system — the token set (data/honesty/design-tokens.json, hash-locked) + DESIGN.md; the trust-tier/verdict/REAL-SAMPLE semantic contract with non-color cues; the single token-built stylesheet public/organon.css",
    D15: "the impeccable dev-seam scope — DEV-TIME-ONLY (never a runtime dep; deps frozen hono+zod); .impeccable/ gitignored except config.json; the 45-rule detector wired as the S38 wall (skipping honestly when the tool is absent on a pristine clone); the committed reasoned detector exceptions; the interactive/browser impeccable flows (init/live/critique-screenshotting) are NOT run in the autonomous harness — the deterministic DETECTOR is the objective gate and the system is authored to impeccable's documented standard (surfaced honestly, not overstated)",
    namingCorrection: "the blueprint names the Voice-findings closure test 'findings_closed_v.test.ts' — but that file already exists (Build-Provenance's V1–V4 contract-truth findings). To avoid overwriting a shipped test, the Voice-findings (V1–V5) closure is 'findings_closed_voice.test.ts' — a caught blueprint naming collision, recorded here, not silently overwritten (mirrors the V1 caught-arithmetic spirit).",
  },

  // ── THE SCREEN SET (carried, unchanged) — impeccable POLISHES the conscious 3; a fourth is a Halt. ──
  screens: {
    count: 3,
    set: ["shelf", "reality-check", "ask"],
    surfacePolishesNotAdds: "the Surface sprint restyles the 3 screens onto the pinned system; impeccable polishes, it NEVER adds a fourth screen (PART CLEAN; the screens_frozen wall)",
  },

  // ── THE RED-TEAM / STRESS CATALOG (PART E; S1–S38) — S1–S35 carried verbatim + S36–S38. ──
  stressCatalog: [
    ...S1_S35,
    { id: "S36", name: "honesty-preserving restyle (NEW)", expect: "no number / label / tier / verdict / provenance-mark / which-facts-appear moved by ANY style change; the content-identity wall byte-identical PER SCREEN before/after the restyle; a seeded rounding / reorder / truncation → caught; the differential + frozen seven reproduce" },
    { id: "S37", name: "a11y + honest degraded states (NEW)", expect: "WCAG-AA contrast on every semantic token pairing (computed from the token file); every verdict / Stamp / REAL-SAMPLE / trust-tier distinction carries a non-color cue (glyph/border/weight — never color alone); keyboard-reachable with a visible focus ring; responsive to the mobile breakpoint; the UNVERIFIED / INSUFFICIENT / AI-off / empty-shelf states render as INTENTIONAL designed states, not error-shaped" },
    { id: "S38", name: "the impeccable detector wall (NEW)", expect: "the deterministic 45-rule detector reports ZERO unexcepted anti-patterns over the rendered surface + the built stylesheet (every exception committed in .impeccable/config.json with a reason); NO runtime design dependency entered the mass path (deps === hono+zod; .impeccable/ gitignored); the detector SKIPS honestly where the dev-harness tool is absent (pristine clone), the built stylesheet still shipping" },
  ],

  // ── carried, unchanged (the full constitution) ──
  carried: {
    frozenSeven: "the 6 computational-core .py + loop.ts byte-untouched (core_byte_identity green every gate); the surface is a READ-ONLY render-layer restyle ON TOP of the deterministic facts — it touches ZERO frozen bytes, moves ZERO verdicts, changes ZERO facts/labels/tiers/provenance-marks, adds ZERO runtime deps",
    verdictDifferential: "lending fp-set 70c7912f… + funding NO-GO/ILLUSTRATIVE 0a63151b… reproduce at every gate — zero verdicts moved by a restyle that touches the very surface those verdicts render on",
    voiceUnchangedInContent: "the persona, the typed FACT/REASONING/BOUNDARY contract, the five gates, the 13 closed intents + no-key parity, the advice wall, the calibration clock, the eval harness, the MinTRL rider — all GREEN and UNMODIFIED in content (the surface restyles their RENDER, never their meaning)",
    contractPipeline: "the verified-build pipeline + the six-tool contract sub-axis (4 of 7 applicable REAL proxy-surface tiers) reused VERBATIM — the counterparty/contract row is restyled, its facts unchanged",
    deps: ["hono", "zod"],
    moatCadence: "the capture cadence appends ONLY REAL captures (content-addressed, hash-chained); the surface reads the recorded facts, it captures nothing",
    parked: "the LLM strategy-proposer / iterate-to-generate loop; the implementation-level contract analysis; the four un-ported LLM-free tools; the Sentinel fuzzer/RAG; the semgrep/Sigstore/apyBase research queue; LIVE per-provider eval sampling; the calibration resolution+scoring; the public library; execution rails; and — a hard scope fence — a marketing site, a logo-redesign spree, a motion showcase, a component framework, impeccable 'overdrive' theatrics (a 'while we're here' is a cut) — all PARKED (THE FIREWALL)",
    probe: "the X-PROBE metrics + KILL CRITERION remain ARMED + honestly BUILT-BUT-UNPROVEN — and the handoff's FIRST LINE states, LOUDER than the Voice handoff, that the demand probe is now UNFORGIVABLY OVERDUE: the tool has both a VOICE and a FACE; the NEXT sprint MUST run it, and this sprint's polish existed precisely to make it worth running",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const pinsOut = { ...PINS, pinsSha }
writeFileSync(path.join(HONESTY_DIR, "surface-pins.json"), JSON.stringify(pinsOut, null, 2) + "\n")

// ── THE VERDICT-DIFFERENTIAL BASELINE — re-asserted so every surface phase proves NO existing verdict moved. ──
const lendingSetSha = await VerdictDifferential.fingerprintSetSha()
const FUNDING_TS = Date.parse("2026-07-05T00:00:00Z")
const fundingRes = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, FUNDING_TS)

console.log("── SURFACE — PHASE 0 (PINS-LOCKED) ───────────────────────────")
console.log(`blueprint sha        : ${blueprintSha}`)
console.log(`tokens sha           : ${tokensSha}`)
console.log(`DESIGN.md sha        : ${designMdSha}`)
console.log(`carried-from PINS_SHA: ${CARRIED_FROM}`)
console.log(`SURFACE PINS_SHA     : ${pinsSha}`)
console.log(`lending fp-set sha   : ${lendingSetSha}`)
console.log(`funding verdict      : ${fundingRes.verdict} (${fundingRes.artifact?.reality ?? null}) reproHash ${String(fundingRes.artifact?.verdictReproHash).slice(0, 16)}…`)
console.log(`findings V1–V5       : ${PINS.findingResolutions.map((v) => v.id).join(", ")}`)
console.log(`deviations           : D14 (design system) · D15 (impeccable dev-seam)`)
console.log(`screens              : ${PINS.screens.count} (${PINS.screens.set.join(" · ")})`)
console.log(`stress catalog       : ${PINS.stressCatalog.length} (S1–S38)`)
console.log(`written              : data/honesty/surface-pins.json`)
