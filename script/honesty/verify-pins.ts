/**
 * ORGΛNON — THE BUILD-PROVENANCE SPRINT, Phase 0 driver (PINS-LOCKED). Continues from the COMPLETE Contract-Truth pins
 * (data/honesty/contract-pins.json, PINS_SHA 4275f739…) — carried forward, never rebuilt. No product code; this pins,
 * before anything is built toward it, the verified-build pipeline + the finding-resolutions:
 *   · THE INGESTION CONTRACT (X-VERIFY a) — verified source enters ONLY via a keyless Sourcify / explorer-verified fetch or
 *     an Operator-supplied contracts/ build directory, Operator-gated, NEVER a scrape (the D4/D6 paywalled/unlock sources
 *     stay ARMED-never-scraped); an OPTIONAL BYOK explorer key widens coverage (server-side env-only, never bundle/log/registry);
 *     each source is recorded {value, source, asOf, contentHash, provenance: REAL|SAMPLE, verified}.
 *   · THE REAL/SAMPLE WALL (X-VERIFY d, the load-bearing new invariant) — a REAL verified build with zero flags MAY earn
 *     CLEAN-STRUCTURE; a SAMPLE or absent build MAY NEVER — it stays UNVERIFIED (cleanStructureRequiresRealBuild holds).
 *     Flags are EXISTENCE PROOFS reportable from any analyzed source (REAL or SAMPLE — a real bug is a real bug); ABSENCE
 *     of flags is trustworthy ONLY on a REAL verified build. A fabricated all-clear on a SAMPLE/absent build is a Halt.
 *   · THE CONTENT-ADDRESSED BUILD-CAPTURE (X-VERIFY b,c) — source → forge build → build-info AST → ContractIR → the six
 *     pure tools → the subaxis rule → a tier; deterministic (a fixed build → byte-identical facts + a byte-identical hash;
 *     a changed byte → a changed hash); the tool-set/ruleset version stamped; capture-time only, no model.
 *   · THE REAL-COVERAGE-COUNT-HONESTY RULE (X-COVER, V3) — surface "N of M pools carry a REAL tier," never imply more.
 *   · THE FOUNDRY-OPTIONAL SEAM — absent → UNVERIFIED; the mass tool + verify + pristine run without the toolchain.
 *   · THE CONTRACT-TRUTH FINDING-RESOLUTIONS V1–V5 (delta itemization · referenced-log chain · dormant→exercised · six-tool subset · real integration).
 *   · THE RED-TEAM / STRESS CATALOG S1–S30 — S1–S27 carried + S28 REAL/SAMPLE-wall · S29 capture-determinism/re-capture-hash · S30 ingestion-scope/keyless-no-scrape.
 * The pins are hash-locked (a changed pin ⇒ a changed sha ⇒ a conscious re-pin). Deterministic; no network. The verdict-
 * differential baseline (lending fp-set + clone-robust funding) is re-asserted so every phase can prove NO verdict moved.
 *
 * Run: bun run script/honesty/verify-pins.ts
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

// ── the build-provenance blueprint, hash-locked (durable even when the planning doc is gitignored) ──
const BLUEPRINT_REL = "sprint/sprint-result/ORGANON_Build_Provenance_Sprint_Blueprint.md"
const blueprintSha = sha256(readFileSync(path.join(PKG_ROOT, BLUEPRINT_REL), "utf8"))

// ── the CARRIED-FORWARD Contract-Truth pins sha (the completed state this sprint continues from) ──
const CARRIED_FROM = JSON.parse(readFileSync(path.join(HONESTY_DIR, "contract-pins.json"), "utf8")).pinsSha as string

// ── the carried S1–S27 stress catalog (verbatim from the Contract-Truth pins — continuity, not a rewrite) ──
const S1_S27 = JSON.parse(readFileSync(path.join(HONESTY_DIR, "contract-pins.json"), "utf8")).stressCatalog as { id: string; name: string; expect: string }[]

// ── THE CANONICAL BUILD-PROVENANCE PINS (the object that is hashed; PINS.md renders these numbers for humans) ──
const PINS = {
  protocol: "verify-pins",
  sprint: "THE BUILD-PROVENANCE SPRINT (the verified-build pipeline; the first REAL contract tiers; Contract-Truth findings closed)",
  at: "2026-07-09",
  continues: "THE CONTRACT-TRUTH SPRINT (RED-TEAM-CLEAN, battery 665 pass / 1 skip / 0 fail across 107 files / 666 tests)",
  blueprint: { rel: BLUEPRINT_REL, sha: blueprintSha },
  carriedFromPinsSha: CARRIED_FROM, // the contract-pins sha, carried forward — the six-tool analyzer + subaxis rule are unchanged

  // ── THE INGESTION CONTRACT (X-VERIFY a) — keyless-first, Operator-gated, never a scrape. The fetch is the ONLY network
  // step and is separate from the deterministic analyzer; a BYOK explorer key is an OPTIONAL widening seam, server-side env-only. ──
  ingestion: {
    doctrine: "verified source enters ONLY via a keyless Sourcify / explorer-verified fetch or an Operator-supplied contracts/ build directory; ingestion is a discrete Operator-gated step, NOT an automatic mass-path fetch; a scrape of a paywalled/unlock source is refused (the D4/D6 signed-scope-cut discipline carried, ARMED-never-scraped)",
    keylessFirst: "the default path is keyless (Sourcify verified-source or an Operator-supplied build); no key is required to ingest a verified source",
    byokOptional: "an OPTIONAL BYOK explorer key widens verified-source coverage — server-side env-only, NEVER in the bundle / a log / the registry; no key → the keyless path / an honest degrade, never a crash (S20/S30 carried)",
    noScrape: "paywalled/unlock sources (DeFiLlama emissions, etc.) stay ARMED-never-scraped; ingestion refuses to scrape a source the firewall forbids (D4/D6)",
    record: "each ingested source is recorded {value: sourceRef, source, asOf, contentHash, provenance: REAL|SAMPLE, verified: bool}; an unverified/absent source → SAMPLE / unavailable, NEVER a fabricated REAL",
    recordedAs: "D10 — the verified-build ingestion scope (which shelf protocols carry a REAL tier · keyless-first/no-scrape · an Operator-signed statement), surfaced verbatim in the handoff",
  },

  // ── THE REAL/SAMPLE WALL (X-VERIFY d) — the single load-bearing new invariant. Filling the registry must NEVER let an
  // unverified/placeholder build earn a clean tier. This carries + foregrounds Contract-Truth's cleanStructureRequiresRealBuild. ──
  realSampleWall: {
    cleanStructureRequiresRealBuild: true, // a SAMPLE or absent build NEVER earns CLEAN-STRUCTURE — the gravest new risk, fenced
    sampleNeverClean: "a SAMPLE/partial/unverified/fixture build with zero flags stays UNVERIFIED, NEVER CLEAN-STRUCTURE (a fabricated all-clear is a Halt — S28)",
    flagsAreExistenceProofs: "a flagged structural surface is reportable from ANY analyzed source (REAL or SAMPLE) — a real bug in real code is a real flag; so FLAGGED does not require REAL provenance",
    absenceTrustworthyOnlyOnReal: "absence-of-flags is trustworthy ONLY on a REAL verified deployed-source match; this asymmetry is the wall — pinned + positive-controlled (S28)",
    haltRule: "a SAMPLE-earned CLEAN-STRUCTURE, or any fabricated all-clear on an absent/unverified build, is a Halt",
  },

  // ── THE CONTENT-ADDRESSED BUILD-CAPTURE (X-VERIFY b,c) — deterministic end-to-end, provenanced, re-capturable. NO model. ──
  buildCapture: {
    pipeline: "source → forge build (the OPTIONAL Foundry seam) → the build-info AST → the existing analyzeProject/ContractIR → the six pure facts.ts tools → the pinned subaxis rule → a tier",
    deterministic: "a fixed build → byte-identical facts AND a byte-identical contentHash across runs; no LLM, no network, no randomness INSIDE the analyzer (the fetch is the separate provenanced ingestion step) — X-DETERM",
    contentAddressed: "each captured build is recorded {value: buildRef, source, asOf, contentHash, provenance}; a re-capture that changes a single byte of build-info changes the contentHash (positive-controlled — S29); the registry stores hashes + facts, never re-derivable secrets",
    reusesAnalyzerVerbatim: "buildcapture reuses analyzeProject + facts.ts UNCHANGED (no re-implementation — X-KEEP); the six-tool analyzer is not re-touched",
    rulesetStamped: "the tool-set/ruleset version is stamped on each capture (so a future tool-set change is legible in the provenance)",
    offHotLoop: "ingestion + forge build + IR + tool analysis run at CAPTURE/registration time; the render reads the content-hashed registry and imports NO analyzer → ZERO per-render compilation (X-VERIFY e, S29)",
  },

  // ── THE REAL-COVERAGE-COUNT-HONESTY RULE (X-COVER, V3) — never imply more coverage than was captured. ──
  coverageHonesty: {
    rule: "the header + the render surface the HONEST REAL-coverage count ('N of M pools carry a REAL tier; the rest honestly UNVERIFIED'), NEVER implying more than was captured",
    successCriterion: "success is NOT 'every pool now has a REAL tier' — it is 'at least one real protocol scored end-to-end, and every gap is honestly UNVERIFIED' (V5)",
    ceiling: "a REAL tier is STILL a deterministic structural screen over verified source — NOT a full audit, NOT a guarantee, NEVER a 'safe' verdict; the ceiling holds harder on REAL than on SAMPLE; a novel exploit outside the six-tool catalog is a stated blind spot (S25 extended to the REAL tier)",
  },

  // ── THE FOUNDRY-OPTIONAL SEAM — carried from Contract-Truth; the toolchain is a capture-time seam, absent → UNVERIFIED. ──
  foundryOptionalSeam: {
    toolchainOptional: true,
    absentBehavior: "no forge/toolchain at capture → no new REAL capture (existing REAL entries read from committed content-hashes); at render an unregistered pool is UNVERIFIED, the coarse age·size·dependency screen scores alone",
    massToolRunsWithout: true,
    verifyRunsWithout: true,
    pristineRunsWithout: true, // the clone reads committed REAL hashes, compiles nothing (S29)
  },

  // ── THE CONTRACT-TRUTH FINDING-RESOLUTIONS (V1–V5) — record hygiene (V1–V4) + the real integration (V5, the spine). ──
  contractTruthResolutions: [
    { id: "V1", finding: "the terminal count 658/106 → 665/107 carried an un-itemized +7/+1 (the contract_redteam file), lapsing the 'state every delta' rule", resolution: "STANDING RULE established + practiced: EVERY battery-count change is itemized (+N <file>) at its gate and the terminal count reconciles explicitly to the last phase count. The Contract-Truth 658/106 → 665/107 is retroactively annotated (+7 contract_redteam / +1 file). Every marker this sprint carries its (+N file) delta.", status: "RESOLVED" },
    { id: "V2", finding: "the referenced-log chain reprinted the stale 585/0 for Crown-Jewel (authoritative 583/0) and a blank Deepening filename", resolution: "CORRECTED at the source: Crown-Jewel is 583/0 across 97 files (its own BUILDLOG-CROWNJEWEL.md header); the '585' drift is dropped. The Deepening sprint (511/0 across 91 files) has NO standalone file — its record lives INSIDE BUILDLOG-HONESTY.md ('THE DEEPENING SPRINT' section); the blank filename is filled with BUILDLOG-HONESTY.md (never a fabricated BUILDLOG-DEEPENING.md). The new log's reference chain is correct at authoring.", status: "RESOLVED" },
    { id: "V3", finding: "the header did not foreground that the contract axis ships capability-complete but DORMANT (every live pool UNVERIFIED)", resolution: "STATED plainly in the BUILDLOG-VERIFY header + the coverage restatement: the contract axis shipped capability-complete-but-DORMANT (the registry was empty → every live pool UNVERIFIED); THIS sprint EXERCISES it on real builds; the honest REAL-coverage count (N of M pools carry a REAL tier) is surfaced, never implying more.", status: "RESOLVED" },
    { id: "V4", finding: "the blueprint's '~10 tools' language overstated the shipped six", resolution: "a CONTINUITY note records that the deep contract axis is a SIX-tool subset (auth-surface · call-graph · upgrade-check · storage-layout · value-flow · state-flow), with four tools (contract-info · inheritance-resolver · dimensional-analysis · mutation-map) laddered-parked in D9 — so no future sprint inherits an overstated '~10 tools' baseline.", status: "RESOLVED" },
    { id: "V5", finding: "the deep axis was proven only on seeded fixtures, never on a real Foundry build end-to-end", resolution: "THIS SPRINT'S SPINE: the ingest → build-capture → registry pipeline carries a real protocol from verified source → forge build → REAL ContractIR → the first genuine FLAGGED/CLEAN-STRUCTURE tier(s) on the live shelf, with the REAL/SAMPLE wall holding and the coverage count honest.", status: "IN-PROGRESS (Phases 2–4)" },
  ],

  // ── THE SCREEN SET (carried, unchanged) — the conscious 3; the REAL contract tier is a Pro row, NOT a screen. ──
  screens: {
    count: 3,
    set: ["shelf", "reality-check", "ask"],
    massScreens: ["shelf", "reality-check"],
    realTierIsAProRow: "the REAL contract tier is a Pro row on the Reality Check counterparty section (not a screen); a fourth screen is a Halt (PART CLEAN)",
  },

  // ── THE RED-TEAM / STRESS CATALOG (PART E; S1–S30) — S1–S27 carried verbatim from the contract pins + S28/S29/S30. ──
  stressCatalog: [
    ...S1_S27,
    { id: "S28", name: "the REAL/SAMPLE wall (NEW)", expect: "a REAL verified build + zero flags may earn CLEAN-STRUCTURE; a SAMPLE/absent build + zero flags → UNVERIFIED, NEVER a fabricated all-clear; flags are existence-proofs from any source, absence-of-flags trustworthy only on a REAL verified deployed-source match (positive-controlled)" },
    { id: "S29", name: "capture-determinism / re-capture-hash (NEW)", expect: "a fixed build → byte-identical facts + a stable contentHash; a re-capture → the identical hash; a one-byte source change → a changed hash; a scorecard render triggers ZERO compilation (the render imports no analyzer)" },
    { id: "S30", name: "ingestion-scope / keyless-no-scrape (NEW)", expect: "ingestion is keyless-first + Operator-gated; no paywalled/unlock source is scraped (D4/D6 ARMED-never-scraped); the BYOK explorer key is server-side env-only, never in the bundle/log/registry; no key → keyless/degrade, no crash" },
  ],

  // ── carried, unchanged (X-KEEP · X-MOAT · X-DETERM · X-HONEST · X-CONTRACT · PART CLEAN) ──
  carried: {
    frozenSeven: "the 6 computational-core .py + loop.ts byte-untouched (core_byte_identity green every gate); the pipeline is a capture-time layer invoking the same byte-pinned six-tool analyzer, touching ZERO frozen bytes",
    verdictDifferential: "lending fp-set 70c7912f… + funding NO-GO/ILLUSTRATIVE reproduce at every gate — zero verdicts moved (the REAL tier is material:false — a REAL FLAGGED on a SOLID pool leaves it SOLID)",
    sevenAxes: ["yield-reality", "tvl-trend", "peg", "liquidity-depth", "unlock-overhang", "counterparty", "funding-regime"],
    contractSubAxis: "the six-tool contract-risk sub-axis (auth-surface · call-graph · upgrade-check · storage-layout · value-flow · state-flow) + the subaxis rule (FLAGGED/CLEAN-STRUCTURE/UNVERIFIED, material:false, cleanStructureRequiresRealBuild=true) reused VERBATIM — not re-touched",
    deps: ["hono", "zod"], // the Foundry toolchain (build-capture), the sidecar (Stamp), and the AI provider (Ask) are optional seams, not mass-tool deps
    aiProviders: ["gemini (Google AI Studio, default)", "openai", "anthropic", "openai-compatible", "groq (llama-3.1-8b-instant)"],
    moatCadence: "the capture cadence appends ONLY REAL captures (content-addressed, hash-chained) — now incl. captured build provenance; a backfill/retro throws",
    parked: "the four un-ported LLM-free tools (contract-info · inheritance-resolver · dimensional-analysis · mutation-map — D9); the LLM strategy-proposer / iterate-to-generate loop; the Sentinel fuzzer/RAG/dynamic analysis; the public library; execution rails — all PARKED (THE FIREWALL)",
    probe: "the X-PROBE metrics + KILL CRITERION remain ARMED + honestly BUILT-BUT-UNPROVEN",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const pinsOut = { ...PINS, pinsSha }
writeFileSync(path.join(HONESTY_DIR, "verify-pins.json"), JSON.stringify(pinsOut, null, 2) + "\n")

// ── THE VERDICT-DIFFERENTIAL BASELINE — re-asserted (the frozen attest engine's lending + funding verdicts) so every
// build-provenance phase proves NO existing verdict moved. Identical source to the contract baseline (byte-reproduced). ──
const lendingSetSha = await VerdictDifferential.fingerprintSetSha()
const FUNDING_TS = Date.parse("2026-07-05T00:00:00Z")
const fundingRes = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, FUNDING_TS)

console.log("── BUILD-PROVENANCE — PHASE 0 (PINS-LOCKED) ──────────────────")
console.log(`blueprint sha        : ${blueprintSha}`)
console.log(`carried-from PINS_SHA: ${CARRIED_FROM}`)
console.log(`VERIFY PINS_SHA      : ${pinsSha}`)
console.log(`lending fp-set sha   : ${lendingSetSha}`)
console.log(`funding verdict      : ${fundingRes.verdict} (${fundingRes.artifact?.reality ?? null}) reproHash ${String(fundingRes.artifact?.verdictReproHash).slice(0, 16)}…`)
console.log(`real/sample wall     : cleanStructureRequiresRealBuild ${PINS.realSampleWall.cleanStructureRequiresRealBuild}`)
console.log(`resolutions V1–V5    : ${PINS.contractTruthResolutions.map((v) => v.id).join(", ")}`)
console.log(`screens              : ${PINS.screens.count} (${PINS.screens.set.join(" · ")})`)
console.log(`stress catalog       : ${PINS.stressCatalog.length} (S1–S30)`)
console.log(`written              : data/honesty/verify-pins.json`)
