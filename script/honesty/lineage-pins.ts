/**
 * ORGΛNON — THE LINEAGE SPRINT, Phase 0 driver (PINS-LOCKED). Continues from the COMPLETE Interpreter pins
 * (data/honesty/interpret-pins.json, PINS_SHA f09fd743…) — carried forward, never rebuilt. No product code; this pins,
 * before one line of diagnosis or fix, the X-LINEAGE law + the three-wall contract + the diagnosis protocol + the
 * Stamp-MATH freeze + the Interpreter-finding resolutions IN1–IN5 + S45–S47:
 *
 *   · X-LINEAGE(a) — DIAGNOSIS BEFORE TREATMENT. No fix lands until the instrumented per-pool investigation records,
 *     per shelf pool, the Stamp input's TRUE identity (source · provenance REAL/SAMPLE · N · series contentHash ·
 *     reproHash) and states VERBATIM which hypothesis holds (H1 SAMPLE-fed · H2 mis-keyed/bleeding · H3 real-but-
 *     illegible, per pool where mixed) → D20. Aiming the fix at the wrong H wastes the sprint or hides a breach.
 *   · X-LINEAGE(b) — WALL 1, SAMPLE-NEVER-GO AT THE RENDER (S45). GO/NO-GO may render ONLY off a per-subject series that
 *     is provenance-REAL and clears the pinned length floor; SAMPLE/absent/borrowed/short → INSUFFICIENT/UNAVAILABLE;
 *     enforced on the RENDERED payload (a stale cache or template path can NEVER resurrect a SAMPLE-fed GO). Positive-
 *     controlled: a seeded SAMPLE series pushed at the render → INSUFFICIENT, never GO.
 *   · X-LINEAGE(c) — WALL 2, PER-SUBJECT DISTINCTNESS + THE LINEAGE LINE (S46). The reproHash/series-hash derives from
 *     the subject's OWN series (the derivation asserted — recomputed from the resolved series in the test); every Stamp
 *     render carries the unmissable lineage line (source · REAL/SAMPLE · as-of · N points · series-hash prefix); a
 *     standing test walks N different pools and asserts their identities DIFFER — two subjects sharing one lineage fails.
 *   · X-LINEAGE(d) — WALL 3, GO-STRENGTH LEGIBILITY, MATH UNTOUCHED (S47). The render states the deflation pressure in
 *     plain words ("deflation counted N attempt(s)"; n=1 explicitly labeled the weakest form — nothing was deflated
 *     away); the displayed significance is CAPPED at the pinned digits (the raw value lives in the data + reproHash —
 *     sixteen rendered digits is precision theater); the GO/NO-GO/INSUFFICIENT words, thresholds, and formulas are
 *     BYTE-UNTOUCHED (the significance/decay/ICIR/MinTRL/stamp module hashes pinned here + asserted unchanged at every gate).
 *   · X-LINEAGE(e) — THE FIX IS THE DIAGNOSIS'S. H1 → SAMPLE-fed Stamps become honest INSUFFICIENT (the verdict change
 *     IS the fix, disclosed per-pool); H2 → the keying repair (the bleed killed, distinctness green); H3 → legibility
 *     alone (the walls make it readable). A golden legitimately changed → a conscious disclosed re-pin (old/new shas).
 *   · X-LINEAGE(f) — THE TWO-VERDICT SEPARATION STAYS. A Stamp GO on a scorecard-AVOID pool is correct by design (a
 *     robust track record ≠ a safe deposit); the sprint makes the Stamp PROVABLE, it does not conflate the verdicts.
 *   · THE INTERPRETER FINDINGS IN1–IN5 — IN1 the register wall's two strengths (runtime = the DISTINCTION; the full
 *     rubric = exemplar+control-enforced, not a live guarantee); IN4 the browser/AT a11y pass pinned to the probe
 *     sprint's Phase 0; IN5 the truncated-finish mark-vs-continue choice recorded deliberate; IN3 the forced POOL-EVENTS
 *     branch (token → live capture; absent → D21 fence-proven-only); IN2 the Operator real-screen session (Phase 5).
 *   · D20 (reserved — the lineage diagnosis, recorded verbatim in Phase 2) · D21 (the POOL-EVENTS decision, Phase 1).
 *   · THE STRESS CATALOG S1–S47 — S1–S44 carried verbatim + S45 SAMPLE-never-GO-at-the-render · S46 per-subject
 *     distinctness + the lineage line · S47 strength legibility + capped precision.
 *
 * The pins are hash-locked. Deterministic; no network. The verdict-differential baseline is re-asserted so every phase
 * proves NO scorecard verdict moved (the Stamp is off the scorecard path and stays there).
 *
 * Run: bun run script/honesty/lineage-pins.ts
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

// ── the lineage blueprint, hash-locked (durable even when the planning doc is gitignored) ──
const BLUEPRINT_REL = "sprint/sprint-result/ORGANON_Lineage_Sprint_Blueprint.md"
const blueprintSha = sha256(readFileSync(path.join(PKG_ROOT, BLUEPRINT_REL), "utf8"))

// ── the CARRIED-FORWARD Interpreter pins (the completed state this sprint continues from) ──
const INTERPRET_PINS = JSON.parse(readFileSync(path.join(HONESTY_DIR, "interpret-pins.json"), "utf8"))
const CARRIED_FROM = INTERPRET_PINS.pinsSha as string
// the carried S1–S44 stress catalog (verbatim from the interpret pins — continuity, not a rewrite)
const S1_S44 = INTERPRET_PINS.stressCatalog as { id: string; name: string; expect: string }[]

// ── THE STAMP-MATH FREEZE — the code hashes of the statistics modules, pinned. Asserted unchanged at every gate. The
// significance (deflated-Sharpe) lives in the frozen seven (core_byte_identity covers it); these are the TS depth-math +
// the adjudication wrapper — this sprint renders the statistics honestly, it does NOT revise them (a nudge is a Halt). ──
const MATH_MODULES = ["src/studio/stamp.ts", "src/studio/decay.ts", "src/studio/icir.ts", "src/studio/mintrl.ts"] as const
const stampMathHashes = Object.fromEntries(MATH_MODULES.map((rel) => [rel, sha256(readFileSync(path.join(PKG_ROOT, rel), "utf8"))]))

// ── the RE-PINNED persona (carried from D18) — the live hash-lock stays over the Interpreter-era artifact bytes ──
const PERSONA_REL = "data/honesty/persona.md"
const personaSha = sha256(readFileSync(path.join(PKG_ROOT, PERSONA_REL), "utf8"))

// ── IN3 — the forced POOL-EVENTS branch. The token's PRESENCE decides at pin time (never a claimed live run without one). ──
const HYPERSYNC_PRESENT = !!(process.env.HYPERSYNC_TOKEN && process.env.HYPERSYNC_TOKEN.trim())

// ── THE CANONICAL LINEAGE PINS (the object that is hashed; PINS.md renders these for humans) ──
const PINS = {
  protocol: "lineage-pins",
  sprint: "THE LINEAGE SPRINT (the Stamp proves its bloodline or shuts up — diagnose WHY every pool renders a near-identical confident GO before any fix (D20), build all three lineage walls regardless (SAMPLE-never-GO at the render · per-subject distinctness + the lineage line · GO-strength legibility + capped precision), fix the proven cause under them, close the Interpreter findings; the LAST pre-probe engineering sprint)",
  at: "2026-07-10",
  continues: "THE INTERPRETER SPRINT (RED-TEAM-CLEAN + DOGFOOD-CLEAN, battery 917 pass / 2 skip / 0 fail across 139 files / 919 tests)",
  blueprint: { rel: BLUEPRINT_REL, sha: blueprintSha },
  carriedFromPinsSha: CARRIED_FROM, // the interpret-pins sha, carried forward — the engine/verdicts/voice/design-system/plane are unchanged; this sprint makes the Stamp's lineage provable at the render, moving no scorecard verdict and no Stamp formula

  // ── THE OPERATOR'S SYMPTOM (quoted verbatim from the live find — the spine of the sprint) ──
  symptom: {
    quote: "clicking pool after pool on the shelf, the Stamp renders an almost-identical confident GO — the same ~1242 observations, a deflated significance of 0.9999999999998763, n counted attempts = 1, near-identical half-life and ICIR — for every pool, SOLID and AVOID alike",
    theDefect: "from the rendered block you cannot tell WHICH of H1 (SAMPLE-fed) / H2 (mis-keyed bleed) / H3 (real-but-illegible) holds — the render is UNFALSIFIABLE from the outside, which for a trust machine is the cardinal sin",
    lastPreProbe: "this is the pinned LAST pre-probe engineering sprint — the Operator found a potential honesty breach in the exact surface the 10-customer kill-test will be judged on; fixing it IS probe preparation",
  },

  // ── X-LINEAGE(a) — THE DIAGNOSIS PROTOCOL (D20 reserved). Diagnosis before treatment; the fix phase is gated on it. ──
  diagnosis: {
    doctrine: "no fix lands until the per-pool investigation records the Stamp input's TRUE identity and states VERBATIM which hypothesis holds; aiming at the wrong H wastes the sprint or hides a breach",
    script: "script/honesty/stamp-lineage-diagnose.ts → data/honesty/lineage-diagnosis.json",
    // the per-pool identity schema — EXACTLY what the diagnosis captures for every shelf pool (the reproHash-derivation field is mandatory)
    identitySchema: ["pool", "name", "resolvedFrom", "source", "reality", "provContentSha", "nObs", "seriesContentHash", "reproHash", "significance", "familyN", "verdict"],
    // the H-finding schema — the verdict of the investigation, evidence-matched
    findingSchema: ["hypothesis", "perPool", "evidence", "conclusion"],
    hypotheses: {
      H1: "SAMPLE-fed GO (the honesty breach) — placeholder/synthetic series → a confident GO. Fix: those Stamps become INSUFFICIENT (a per-pool verdict CHANGE, disclosed pool-by-pool)",
      H2: "the keying bleed — one real series resolving under every pool's key (a default/cache/fallback). Fix: per-subject resolution; the bleed killed; distinctness green",
      H3: "real but illegible — genuinely per-pool series that merely look alike; the defect is the render (no unmissable lineage, uncapped precision, an unlabeled n=1). Fix: the walls alone",
    },
    rule: "the finding must FOLLOW the evidence (a 'probably H3' hedge where the artifact shows identical hashes → fail); D20 is recorded in the ledger before Phase 3 opens; NO product diff lands in the diagnosis phase (the src tree untouched except the script)",
  },

  // ── X-LINEAGE(b,c,d) — THE THREE-WALL CONTRACT (src/studio/lineage.ts; the walls live ON TOP of the frozen Stamp). ──
  walls: {
    module: "src/studio/lineage.ts",
    purity: "pure functions on the resolved series identity — resolveIdentity(poolKey, adapter) → SeriesIdentity; guardRender(verdict, identity, floor) → the WALL-1 allow|degrade; distinct(identities[]) → the WALL-2 ok|collision; lineageLine/strengthLine/capSig → the WALL-2/3 render formatters over pinned rules. stamp.ts stays BYTE-FROZEN (resolveIdentity re-resolves the SAME series deterministically)",
    // WALL 1 — SAMPLE-NEVER-GO AT THE RENDER (S45)
    wall1: {
      name: "SAMPLE-never-GO at the render",
      rule: "GO/NO-GO may render ONLY when the payload's series identity is provenance-REAL (reality REAL-PIT), per-subject, and its point count ≥ the pinned floor; else the payload is DEGRADED at the render boundary — a non-REAL series → INSUFFICIENT, a too-short series → INSUFFICIENT, an absent series → UNAVAILABLE",
      seriesLengthFloor: 60, // matches the Stamp's own MIN_OBSERVATIONS — a series shorter than this can never render a GO/NO-GO
      enforcedOn: "the RENDERED payload (both reality.ts renderStamp AND the Ask VALIDATION path route through guardRender) — engine honesty is necessary but NOT sufficient; a stale cache or template path must ALSO be unable to show a SAMPLE-fed GO",
      positiveControl: "a seeded SAMPLE series ({reality:'SAMPLE', nPoints:1000}) pushed at the render → INSUFFICIENT, never GO; an absent identity (null) → UNAVAILABLE; a REAL-but-short series (nPoints 30) → INSUFFICIENT; a REAL long series passes unchanged (S45)",
    },
    // WALL 2 — PER-SUBJECT DISTINCTNESS + THE LINEAGE LINE (S46)
    wall2: {
      name: "per-subject distinctness + the unmissable lineage line",
      lineageLineFields: ["source", "reality", "asOf", "nPoints", "seriesHashPrefix"],
      derivation: "the series-hash on the lineage line is sha256 of the subject's OWN resolved return series (canonical) — recomputable from poolReturnsFromSeries(resolvedSeries) in the test (the derivation asserted, not merely displayed)",
      distinctnessWalk: "a standing battery test resolves N different shelf pools and asserts their identities (seriesContentHash + source) DIFFER — two subjects rendering one lineage is a WALL FAILURE; a seeded bleed (subject A's series under subject B) → caught",
      onEveryRender: "the lineage line renders on EVERY Stamp block — GO, NO-GO, INSUFFICIENT (source/REAL/N shown), and UNAVAILABLE (no recorded series, stated honestly)",
      positiveControl: "the N-pool walk is GREEN on the real per-subject shelf data / RED on a seeded shared-series bleed; the rendered hash recomputes from the resolved series (S46)",
    },
    // WALL 3 — GO-STRENGTH LEGIBILITY, MATH UNTOUCHED (S47)
    wall3: {
      name: "GO-strength legibility + capped precision",
      attemptPhrasing: {
        weakestForm: "deflation counted 1 attempt — the weakest form of GO: with a single submission there was no multiple-testing search to deflate away (nothing was deflated away)",
        manyAttempts: "deflation counted N attempts — the GO survived an N-way multiple-testing charge",
      },
      capDigits: 4, // the displayed significance is rounded to at most 4 decimals; a value at/above the ceiling renders "≥ 0.9999" (never a bare "1.0000" nor sixteen digits)
      cappedDisplayUncappedRecord: "the DISPLAY is capped; the RAW value stays full-precision in StampResult.dsr + the reproHash (capped display, uncapped record — the cap must NEVER touch the recorded value)",
      mathByteUntouched: "the GO/NO-GO/INSUFFICIENT words, thresholds, and formulas are BYTE-UNTOUCHED — the significance is the frozen seven (core_byte_identity); the depth-math + wrapper module hashes are pinned below and asserted unchanged",
      positiveControl: "the n=1 label reads verbatim; a dsr of 0.9999999999998763 renders '≥ 0.9999' (not sixteen digits, not '1.0000') while StampResult.dsr stays 0.9999999999998763; the math module hashes byte-identical to these pins (S47)",
    },
    haltRule: "a GO rendered off SAMPLE or borrowed blood, a lineage line whose hash the series can't reproduce, two subjects sharing one lineage, a sixteen-digit rendered significance, an unlabeled n=1 pass, a display cap that also caps the RECORDED value, or a touched formula is a Halt",
  },

  // ── THE STAMP-MATH FREEZE (X-LINEAGE d; X-DECAY/X-ICIR carried) — pinned module hashes, asserted unchanged at every gate. ──
  stampMathFreeze: {
    doctrine: "this sprint renders the statistics honestly; it does NOT revise them — a nudged threshold to make a wall pass prettier is a Halt",
    modules: stampMathHashes,
    significanceNote: "the deflated-significance (DSR) itself is computed by the FROZEN SEVEN (the 6 computational-core .py + loop.ts) — covered by core_byte_identity; these TS hashes cover the depth sub-scores (decay/ICIR/MinTRL) + the adjudication wrapper (stamp.ts), which stays byte-frozen (the walls re-resolve the series, they do not edit the Stamp)",
  },

  // ── THE TWO-VERDICT SEPARATION (X-LINEAGE f) — stated, kept. ──
  twoVerdicts: {
    rule: "a Stamp GO on a scorecard-AVOID pool is CORRECT BY DESIGN and stays — the Stamp answers 'does the recorded track record survive statistical deflation?'; the scorecard answers 'is this a sound deposit?' A robust track record on a structurally dangerous pool is a coherent, informative state",
    thisSprint: "makes the Stamp's honesty PROVABLE (each verdict provably about its own question, on its own data); it does NOT blur or conflate the two verdicts, and it does NOT hide the Stamp on AVOID pools",
  },

  // ── THE INTERPRETER-FINDING RESOLUTIONS (IN1–IN5) — Phase 1 closes IN1/IN4/IN5 + forces IN3; IN2 is Phase 5. ──
  inResolutions: [
    { id: "IN1", finding: "the register wall's runtime-vs-full-rubric two strengths must be stated in continuity (continuity must not inherit 'every live Pro answer cites provenance' as a runtime guarantee)", resolution: "STATED, two strengths: (1) the RUNTIME gate enforces the always-legitimate register DISTINCTION (Simple ≠ Pro; a Simple carrying jargon / a Pro reading Simple → rejected to the correctly-registered template); (2) the FULL rubric (ctx proxy-caveat / divergence / provenance) is enforced on EXEMPLARS + POSITIVE CONTROLS, NOT on every live answer — a deterministic UNVERIFIED answer that names no axis is FACT/BOUNDARY, not gated by the register wall (W-IN02's lesson). Continuity carries NO live-Pro-provenance guarantee.", status: "RESOLVED", closesPhase: 1 },
    { id: "IN4", finding: "the real browser/AT a11y pass (SV5) must be scheduled in writing as a pre-probe requirement", resolution: "PINNED, in writing, as the PROBE SPRINT's Phase 0 requirement: a real browser + assistive-technology + live-viewport pass (contrast is already COMPUTED from the token file; keyboard/responsive/non-color cues are DOM-ASSERTED — the browser/AT pass is the standing, now-scheduled follow-up, not claimed done). This harness has no browser; the pin is the durable schedule.", status: "RESOLVED", closesPhase: 1 },
    { id: "IN5", finding: "the truncated-finish mark-only choice must be recorded as deliberate (or add a continuation call)", resolution: "RECORDED as DELIBERATE: mark-only was shipped (src/ask/truncation.ts markIfTruncated appends the honest '(truncated — ask a narrower question)' mark). Rationale: a continuation call doubles cost and can COMPOUND truncation (a second cut), while the honest mark + the scaled cap + the explicit fact-budget already prevent a silent cut; the mark is the honest, bounded choice. The decision is pinned; a continuation call stays a conscious future option, PARKED.", status: "RESOLVED", closesPhase: 1 },
    { id: "IN3", finding: "SV2 (POOL-EVENTS live) has drifted two sprints — force the decision: token+live, or Operator-signed fence-proven-only", resolution: HYPERSYNC_PRESENT
      ? "FORCED — token PRESENT: the live POOL-EVENTS capture is run end-to-end this sprint and committed as evidence (Phase 1 deliverable)."
      : "FORCED — token ABSENT: POOL-EVENTS is Operator-signed FENCE-PROVEN-ONLY standing status (D21). It is built + fence-proven (the token-absent honest degrade proven) but NOT live-exercised; the drift ENDS here — it no longer carries sprint-to-sprint as an open 'attempt-or-gap'.", status: "RESOLVED", closesPhase: 1, branch: HYPERSYNC_PRESENT ? "token-live" : "D21-fence-proven-only" },
    { id: "IN2", finding: "the experiential claims were agent-proxied — an Operator real-screen session is owed (the human who found the defect confirms the fix)", resolution: "PHASE 5, OPERATOR-GATED: the OPERATOR (not the agent) drives ≥2 contrasting pools' Stamp drawers (a provable-lineage GO vs an honest INSUFFICIENT — the lineage lines visibly DIFFERENT, the strength line plain), one Simple≠Pro pair, one oversized COMPARE (no clip) on a real screen; the observations recorded AS THE OPERATOR'S, or an honest named gap — never an agent simulation relabeled (the A′#11 fence).", status: "PHASE-5-OPERATOR-GATED", closesPhase: 5 },
  ],

  // ── DEVIATIONS D20–D21 (pinned; full entries land in data/honesty/deviations.json in their phases). ──
  deviations: {
    D20: "RESERVED — the lineage diagnosis (Phase 2): the verbatim H-finding (which of H1/H2/H3, per pool where mixed) + the per-pool evidence, recorded before one repair line lands (X-LINEAGE a). Operator-signed.",
    D21: HYPERSYNC_PRESENT
      ? "N/A this run — HYPERSYNC_TOKEN was present, so POOL-EVENTS ran live (no fence-proven-only deviation needed); IN3 branch = token-live."
      : "the POOL-EVENTS decision (Phase 1, Operator-signed) — HYPERSYNC_TOKEN absent → POOL-EVENTS is FENCE-PROVEN-ONLY standing status: built + fence-proven (the token-absent honest degrade proven), NOT live-exercised; the two-sprint drift ENDS (it stops carrying as an open attempt-or-gap). If a token is later provisioned, the live capture is a conscious future run.",
    operatorSignedNote: "Operator-signed = the Operator directed the coding agent to engineer this blueprint end-to-end; the blueprint's own text carries the lineage diagnosis mandate (D20) + the forced POOL-EVENTS branch (D21). The directive to execute the document IS the sign-off — recorded here, not fabricated as a separate signature (the same mechanism as D11/D16/D17/D18/D19).",
  },

  // ── THE SCREEN SET (carried, unchanged) — the Stamp drawer learns to prove its blood; a fourth is a Halt. ──
  screens: {
    count: 3,
    set: ["shelf", "reality-check", "ask"],
    stampDrawerLearnsLineage: "the Stamp drawer (opt-in, a sub-route of the Reality Check — NOT a screen) now renders the lineage line + the strength line + the capped significance + WALL-1 degradation; the Ask VALIDATION facts gain the lineage + strength lines. NO fourth screen, NO new statistics.",
  },

  // ── THE RED-TEAM / STRESS CATALOG (PART E; S1–S47) — S1–S44 carried verbatim + S45–S47. ──
  stressCatalog: [
    ...S1_S44,
    { id: "S45", name: "SAMPLE-never-GO at the render (NEW)", expect: "a seeded SAMPLE/short/absent/borrowed series at the render boundary → INSUFFICIENT/UNAVAILABLE, never GO/NO-GO; a cached pre-wall payload → still guarded (WALL 1 is at the render boundary, not only the engine); a REAL long series passes unchanged; positive-controlled" },
    { id: "S46", name: "per-subject distinctness + the lineage line (NEW)", expect: "the N-pool distinctness walk asserts distinct identities (source + series hash) across shelf pools; a seeded bleed (one series under two subjects) → caught; every rendered Stamp carries the lineage line (source · REAL/SAMPLE · as-of · N · hash prefix) whose hash the test RECOMPUTES from the resolved series (the derivation asserted, not merely displayed)" },
    { id: "S47", name: "GO-strength legibility + capped precision (NEW)", expect: "the attempt count rendered in the pinned plain words (n=1 labeled the weakest form — nothing was deflated away); the displayed significance at the cap (a near-1 value → '≥ 0.9999', never sixteen digits, never a bare '1.0000'); the RECORDED value full-precision; the Stamp math module hashes byte-identical to the Phase-0 pins" },
  ],

  // ── carried, unchanged (the full constitution) ──
  carried: {
    frozenSeven: "the 6 computational-core .py + loop.ts byte-untouched (core_byte_identity green every gate); the three lineage walls live ON TOP of the frozen Stamp — they RE-RESOLVE the series and RENDER honestly, touching ZERO frozen bytes, moving ZERO scorecard verdicts, changing ZERO Stamp formula, inventing ZERO numbers, adding ZERO runtime deps",
    stampMathFrozen: "NEW this sprint — the significance/decay/ICIR/MinTRL/stamp module hashes are pinned (stampMathFreeze) and asserted unchanged at every gate; the sprint rendered the statistics honestly, it did not revise them",
    verdictDifferential: "lending fp-set 70c7912f… + funding NO-GO/ILLUSTRATIVE 0a63151b… reproduce at every gate — the Stamp is OFF the scorecard path and stays there; the lineage walls touch no scorecard input, so zero verdicts move",
    voiceUnchanged: "the explaining voice, the registers (IN1's two strengths stated), the three-layer truncation kill, the contract tiers, the plane, the calibration clock, the design system + S36 goldens (the lineage line lands on renderStamp, which is NOT in the S36 content-golden set → S36 byte-identical), the moat — all GREEN and UNMODIFIED",
    deps: ["hono", "zod"],
    parked: "the LLM strategy-proposer / iterate-to-generate loop; the reports/verdict API; execution/custody (the permanent red line); the archive node; a general indexer; the implementation-level contract analysis; the Sentinel fuzzer/RAG; LIVE per-provider eval sampling; the calibration resolution+scoring; new Stamp statistics (the math does not change this sprint); the attempts-ledger linkage (wiring n to real evaluation attempts is a conscious math-adjacent change) — AND a hard scope fence (a 'while we're here, recalibrate/redesign the drawer' is a cut) — all PARKED (THE FIREWALL)",
    probe: "the X-PROBE metrics + KILL CRITERION remain ARMED — this was the pinned LAST pre-probe engineering sprint; the handoff's FIRST LINE commits the NEXT sprint to the research's Stage-0 (the 10-customer demand kill-test + the Stream/Elixir/Resolv re-score post-mortems), with the browser/AT a11y pass (IN4) as its pinned Phase 0 — with a Stamp that can now look a buyer in the eye because every verdict it renders proves whose data earned it or honestly says it cannot",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const pinsOut = { ...PINS, pinsSha }
writeFileSync(path.join(HONESTY_DIR, "lineage-pins.json"), JSON.stringify(pinsOut, null, 2) + "\n")

// ── THE VERDICT-DIFFERENTIAL BASELINE — re-asserted so every lineage phase proves NO scorecard verdict moved. ──
const lendingSetSha = await VerdictDifferential.fingerprintSetSha()
const FUNDING_TS = Date.parse("2026-07-05T00:00:00Z")
const fundingRes = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, FUNDING_TS)

console.log("── LINEAGE — PHASE 0 (PINS-LOCKED) ─────────────────────────")
console.log(`blueprint sha         : ${blueprintSha}`)
console.log(`carried-from PINS_SHA : ${CARRIED_FROM}`)
console.log(`LINEAGE PINS_SHA      : ${pinsSha}`)
console.log(`persona (carried)     : ${personaSha.slice(0, 8)}… (D18, unchanged)`)
console.log(`lending fp-set sha    : ${lendingSetSha}`)
console.log(`funding verdict       : ${fundingRes.verdict} (${fundingRes.artifact?.reality ?? null}) reproHash ${String(fundingRes.artifact?.verdictReproHash).slice(0, 16)}…`)
console.log(`stamp-math freeze     : ${MATH_MODULES.map((m) => `${m.split("/").pop()} ${stampMathHashes[m].slice(0, 8)}…`).join(" · ")}`)
console.log(`wall floor / cap      : series ≥ ${PINS.walls.wall1.seriesLengthFloor} pts · significance ≤ ${PINS.walls.wall3.capDigits} digits`)
console.log(`IN3 branch            : ${HYPERSYNC_PRESENT ? "token-live" : "D21 fence-proven-only (token absent)"}`)
console.log(`IN resolutions        : ${PINS.inResolutions.map((v) => v.id).join(", ")}`)
console.log(`deviations            : D20 (reserved — diagnosis) · D21 (POOL-EVENTS decision)`)
console.log(`screens               : ${PINS.screens.count} (${PINS.screens.set.join(" · ")})`)
console.log(`stress catalog        : ${PINS.stressCatalog.length} (S1–S47)`)
console.log(`written               : data/honesty/lineage-pins.json`)
