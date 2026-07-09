/**
 * ORGΛNON — THE CONTRACT-TRUTH SPRINT, Phase 0 driver (PINS-LOCKED). Continues from the COMPLETE Persistence pins
 * (data/honesty/persistence-pins.json, PINS_SHA f157da69…) — carried forward, never rebuilt. No product code; this pins,
 * before anything is built toward it, the deterministic contract-risk sub-axis + the finding-resolutions:
 *   · THE CONTRACT-RISK SUB-AXIS (X-CONTRACT) — the counterparty axis gains a deterministic structural screen over the
 *     target's VERIFIED SOURCE: the Sentinel `src/solidity` IR + its ~10 LLM-free tools are EXTRACTED copy-into-tree into
 *     src/contract/* (OpenCode coupling severed, Tool.define dropped, NO model/fuzzer/RAG ported). The IR yields structural
 *     FACTS; ORGΛNON's OWN pinned rules tier them CLEAN-STRUCTURE / FLAGGED / UNVERIFIED. It says "this contract has an
 *     unprotected admin function", NEVER "this contract is safe". A structural screen over verified source — NOT a full
 *     audit. Deterministic (compiler-output → IR → rules; no LLM). Off the mass hot loop (capture-time; the render reads
 *     recorded facts). Additive + verdict-safe (material:false — the coarse age·size·dependency floor + the six axes are
 *     unchanged; the differential is zero). Operationally honest (no verified build → UNVERIFIED; SAMPLE/absent NEVER a
 *     fabricated all-clear). The Foundry toolchain is an OPTIONAL seam (the mass tool + verify + pristine run without it).
 *   · THE EXTRACTION / SEVERANCE (D9) — what is copied, what is severed (@/util/* → src/contract/fs; @/project/instance →
 *     a plain path param), what is dropped (Tool.define, zod, the ../lang multi-language fallback, the LLM audit agent, the
 *     fuzzer, the RAG, dep-analyze). The extracted code is OWNED in-tree; the dataplane_leak wall stays green (nothing
 *     imports @solidity-sentinel/* or OpenCode); the main pipeline reads compiler JSON, so NO new npm dep (deps stay hono+zod).
 *   · THE PERSISTENCE FINDING-RESOLUTIONS P1–P6 (continuity hygiene) — the header count reconciled, the terminal PINS_SHA
 *     rule, the surviving skip named, the W-P02 two-fence separation, the live-value character, the LUMPY-hurdle status.
 *   · THE RED-TEAM / STRESS CATALOG S1–S27 — S1–S24 carried + S25 contract-honesty · S26 leak-wall/coupling-severance · S27 Foundry-absent.
 * The pins are hash-locked (a changed pin ⇒ a changed sha ⇒ a conscious re-pin). Deterministic; no network. The verdict-
 * differential baseline (lending fp-set + clone-robust funding) is re-asserted so every phase can prove NO verdict moved.
 *
 * Run: bun run script/honesty/contract-pins.ts
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

// ── the contract-truth blueprint, hash-locked (durable even when the planning doc is gitignored) ──
const BLUEPRINT_REL = "sprint/sprint-result/ORGANON_Contract_Truth_Sprint_Blueprint.md"
const blueprintSha = sha256(readFileSync(path.join(PKG_ROOT, BLUEPRINT_REL), "utf8"))

// ── the CARRIED-FORWARD Persistence pins sha (the completed state this sprint continues from) ──
const CARRIED_FROM = JSON.parse(readFileSync(path.join(HONESTY_DIR, "persistence-pins.json"), "utf8")).pinsSha as string

// ── the carried S1–S24 stress catalog (verbatim from the Persistence pins — continuity, not a rewrite) ──
const S1_S24 = JSON.parse(readFileSync(path.join(HONESTY_DIR, "persistence-pins.json"), "utf8")).stressCatalog as { id: string; name: string; expect: string }[]

// ── THE CANONICAL CONTRACT-TRUTH PINS (the object that is hashed; PINS.md renders these numbers for humans) ──
const PINS = {
  protocol: "contract-pins",
  sprint: "THE CONTRACT-TRUTH SPRINT (the deep counterparty axis; Persistence findings closed)",
  at: "2026-07-09",
  continues: "THE PERSISTENCE SPRINT (RED-TEAM-CLEAN, battery 625 pass / 1 skip / 0 fail across 102 files)",
  blueprint: { rel: BLUEPRINT_REL, sha: blueprintSha },
  carriedFromPinsSha: CARRIED_FROM, // the persistence sha, carried forward — the Stamp/scorecard/Ask contracts are unchanged

  // ── THE CONTRACT-RISK SUB-AXIS (X-CONTRACT) — a deterministic structural screen over the target's verified source,
  // BESIDE (never replacing) the coarse age·size·dependency floor. The IR yields FACTS; ORGΛNON's OWN rules tier them.
  // NO model, NO "safe"/"audited" language, off the mass hot loop, additive (material:false → moves no frozen verdict). ──
  contractRisk: {
    doctrine: "the counterparty axis gains a deterministic structural contract screen over verified source: the Sentinel IR yields structural facts (unprotected admin functions, dangerous delegatecall/low-level/eth-transfer edges, proxy/upgrade hazards, storage-clash surfaces, reentrancy/value-flow surfaces, oracle/external dependency reads); ORGΛNON's OWN pinned rules tier them — a structural screen over verified source, NEVER a safety verdict",
    subAxisName: "contract-risk",
    tiers: ["CLEAN-STRUCTURE", "FLAGGED", "UNVERIFIED"],
    // the six structural fact categories the IR-backed tools surface (each maps to the extracted tool that produces it)
    flagCategories: [
      { id: "unprotected-state-changing", tool: "auth-surface", fact: "a public/external state-changing function (writes or value-transfers) with no auth gate" },
      { id: "dangerous-edges", tool: "call-graph", fact: "a delegatecall / low-level call / eth-transfer edge" },
      { id: "upgrade-proxy-hazard", tool: "upgrade-check", fact: "an initializer without _disableInitializers, an unguarded upgrade entry, a missing storage gap, or a fallback delegatecall" },
      { id: "storage-clash", tool: "storage-layout", fact: "an upgradeable-without-gap or a proxy/implementation slot·type·label mismatch" },
      { id: "reentrancy-value-flow", tool: "value-flow / state-flow", fact: "a state write after an external call (CEI violation), a callback surface, or a cross-tx value dependency" },
      { id: "oracle-dependency", tool: "protocols.isOracleRead / dimensional", fact: "an oracle read / external price dependency (latestRoundData, slot0, …)" },
    ],
    tierRule: "ANY flagged structural surface → FLAGGED (the specific finding NAMED, never 'unsafe'); zero flagged surfaces AND a REAL verified build → CLEAN-STRUCTURE ('no flagged structural surfaces in the verified source' — NEVER 'safe'); no build / an unverifiable or SAMPLE build → UNVERIFIED (the coarse screen scores alone)",
    cleanStructureRequiresRealBuild: true, // a SAMPLE/absent build NEVER yields CLEAN-STRUCTURE — that would be the fabricated all-clear the firewall forbids (S27)
    material: false, // ADDITIVE — the sub-axis is non-deciding; the coarse counterparty floor + the six axes are unchanged; the differential is zero (X-KEEP + X-CONTRACT f)
    honestScope: {
      label: "a deterministic structural screen over verified source — not a full audit, not a guarantee",
      is: "compiler-backed structural FACTS (the Foundry build-info IR) + ORGΛNON's OWN deterministic risk rules over them",
      isNot: "a full audit, a safety guarantee, a model's opinion, or a dynamic/economic-exploit analysis (fuzzing/symbolic execution stays PARKED)",
      surfaced: "the label is attached to every rendering — the Reality-Check Pro counterparty row + the Ask contract facts + PINS.md",
    },
    overClaimBanned: "the sub-axis states specific structural facts; a claim of 'safe' / 'audited' / 'guaranteed' is a doc-lie Halt (S25)",
    noModel: "the facts are compiler-output (the Foundry build-info AST → the ContractIR); the risk rules over them are ORGΛNON's own deterministic functions; ZERO LLM in src/contract/* (X-DETERM, S25)",
    deterministic: "a fixed ContractIR → byte-identical facts + a byte-identical tier across runs (no model, no random)",
    offHotLoop: "contract analysis runs at CAPTURE/registration time into the provenance record (content-hashed, REAL/SAMPLE-labeled); the scorecard render reads the recorded facts — a render triggers ZERO compilation (X-CONTRACT e)",
    haltRule: "a contract screen that says 'safe/audited', a fabricated all-clear on an absent/SAMPLE build, a model in the analysis, a Sentinel sibling import, a per-render compilation, or a moved verdict is a Halt",
  },

  // ── THE EXTRACTION / SEVERANCE CONTRACT (D9) — copy-into-tree, OpenCode coupling severed, only the pure analysis kept. ──
  extraction: {
    doctrine: "the deterministic Solidity analysis is EXTRACTED copy-into-tree from the Sentinel repo (the monorepo ORGΛNON was born in) into src/contract/*, owned + in-tree — never a sibling import; only the pure (ContractIR)→facts logic is ported, never the platform",
    source: "packages/solidity-sentinel/src/solidity (the ContractIR builder + protocols.ts) + the ~10 LLM-free tools (auth-surface · call-graph · contract-info · inheritance-resolver · storage-layout · value-flow · upgrade-check · state-flow · dimensional-analysis · mutation-map)",
    copied: [
      "ir.ts (the ContractIR type definitions) — verbatim",
      "protocols.ts (curated DeFi knowledge: callback signatures + oracle-read patterns + protocol specs) — verbatim",
      "build.ts (the Foundry build-info loader) — coupling severed",
      "project.ts (foundry.toml detection) — coupling severed",
      "index.ts → analyze.ts (the IR builder: analyzeProject / collect / taintAnalysis / expand) — coupling severed",
      "the SIX tools' pure (ContractIR)→facts logic feeding the flag categories (auth-surface · call-graph · upgrade-check · storage-layout · value-flow · state-flow) → src/contract/facts.ts — Tool.define/zod/formatting dropped",
    ],
    // the six tools whose pure logic is ported (they produce the pinned flag categories); their outputs ARE the sub-axis fact list
    toolsPorted: ["auth-surface", "call-graph", "upgrade-check", "storage-layout", "value-flow", "state-flow"],
    // the four LLM-free tools NOT ported: their outputs are not in the sub-axis fact list, so porting them would be speculative
    // surface PART CLEAN forbids (no second real caller NOW). They stay in the Sentinel source for a future sprint if a caller emerges.
    toolsNotPorted: {
      tools: ["contract-info", "inheritance-resolver", "dimensional-analysis", "mutation-map"],
      why: "their outputs (a multi-language IR dump · the inheritance MRO tree · the DA-01..15 arithmetic/precision warnings · the mutation-parity map) are NOT in the six pinned contract-risk fact categories the sub-axis tiers on. Porting them would add ~800 LOC of analysis with NO current caller — the speculative 'while we're here' surface PART CLEAN + THE FIREWALL forbid. They remain in the Sentinel repo, extractable later if a real caller emerges. This scope decision is surfaced (D9), not silent.",
    },
    severed: [
      "@/util/{glob,filesystem,process} → a small owned src/contract/fs.ts shim over node:fs + node:child_process (a plain path, no platform)",
      "@/project/instance (the Instance.state cache + the default-directory) → a required plain project-path parameter (no session/platform state)",
    ],
    dropped: [
      "the Tool.define agent wrappers (the OpenCode tool scaffolding)",
      "the zod parameter schemas (validation moves to the caller where needed)",
      "the ../lang multi-language fallback (Anchor/Sui/Solana — out of a DeFi-Solidity screen's scope; scope creep the firewall forbids)",
      "the Sentinel LLM audit agent (a model in the analysis is a Halt — S25)",
      "the fuzzer + the RAG (dynamic/economic analysis stays PARKED)",
      "dep-analyze.ts (the Etherscan @solidity-parser/parser path — not one of the 10 tools; PARKED, keeps the extraction dependency-free)",
    ],
    ownedInTree: "nothing in src/contract/* imports @solidity-sentinel/* or OpenCode; the code is OWNED, and the dataplane_leak wall (positive-controlled) stays green (S26)",
    noNewNpmDep: "the main pipeline reads the Foundry compiler JSON (build-info AST), not Solidity source — so NO @solidity-parser/parser and NO new npm dependency; the mass-tool deps stay hono+zod (PART CLEAN)",
    recordedAs: "D9 — the contract-engine extraction + coupling-severance (the four ledger fields, surfaced verbatim in the handoff)",
  },

  // ── THE FOUNDRY-OPTIONAL-SEAM CONTRACT — like the sidecar (Stamp) + the AI provider (Ask): absent → an honest UNVERIFIED. ──
  foundryOptionalSeam: {
    toolchainOptional: true,
    absentBehavior: "no foundry.toml / no artifacts/build-info / no toolchain → the contract sub-axis renders UNVERIFIED; the coarse age·size·dependency screen scores alone (the floor beneath it)",
    massToolRunsWithout: true, // the keyless zero-setup mass Reality Check never needs the toolchain
    verifyRunsWithout: true, // ./organon.sh verify regenerates the deterministic bundle without the toolchain
    pristineRunsWithout: true, // the fresh-clone pristine proof is green without the toolchain (UNVERIFIED, honest)
    neverFabricatesAllClear: "a SAMPLE/absent build NEVER yields CLEAN-STRUCTURE — a fabricated all-clear without a verified build is a Halt (S27)",
  },

  // ── THE PERSISTENCE FINDING-RESOLUTIONS (P1–P6) — continuity hygiene, closed in Phase 1 (documentation + ledger). ──
  persistenceResolutions: [
    { id: "P1", finding: "the Persistence header cited 585/0 vs the Master-doc/Crown-Jewel 583/0 — a 2-test drift unexplained", resolution: "reconciled by naming the AUTHORITATIVE count: data/honesty/evidence/battery-summary.json (regenerated + diffed by ./organon.sh verify) is the single source of truth, not prose; the historic 585-vs-583 was a documentation lag (a post-red-team header count vs a pre-red-team master-doc snapshot), immaterial to correctness. This sprint carries the MEASURED 625 pass / 1 skip / 0 fail across 102 files forward — no silent drift.", status: "RESOLVED" },
    { id: "P2", finding: "the mid-sprint re-pin f157da69… was announced in Phase 3 but not surfaced in the final marker", resolution: "STANDING RULE established: the terminal PINS_SHA appears in EVERY final RED-TEAM-CLEAN marker (this sprint's marker states it; Persistence's terminal PINS_SHA f157da69… is retroactively noted here). A final marker without its terminal PINS_SHA is a fail.", status: "RESOLVED" },
    { id: "P3", finding: "the surviving 1 skip in 625/1/0 was unnamed", resolution: "NAMED: the surviving skip is test/organon/ask_live.test.ts — the Operator-gated LIVE Groq round-trip, skipped offline (the battery forces AI keys empty → hermetic). The skip is stated wherever the battery count is cited.", status: "RESOLVED" },
    { id: "P4", finding: "W-P02's 'fenced/clean GO' vs 'post-hoc fence' conflation was oddly framed", resolution: "the exact separation is stated: cleanGo is the DEPTH flag (a clean GO needs the deflation-survival AND a TRACEABLE decay half-life AND a CONSISTENT ICIR — the persistence/consistency hurdle); the POST-HOC fence is the pre-registration caveat (a GO is measured after the fact, not pre-registered). Two ORTHOGONAL fences — a CONDITIONAL GO can be depth-clean yet post-hoc-fenced — both disclosed, never conflated; the verdict WORD is never minted/moved.", status: "RESOLVED" },
    { id: "P5", finding: "the aave GO (conditional) half-life ≈ 9.9 / ICIR ≈ 0.6 read as if committed goldens", resolution: "NOTED under the X-LIVE ceiling: the rendered aave half-life ≈ 9.9 periods + ICIR ≈ 0.6 are CURRENT-CAPTURE values (computed from the live-captured record at render time), RE-CAPTURABLE and NOT committed goldens. What ./organon.sh verify reproduces is the content-hash of the committed capture, not the underlying live value.", status: "RESOLVED" },
    { id: "P6", finding: "the Phase-4 LUMPY-hurdle 'honest case' was hypothetical", resolution: "STATED honestly: the ICIR LUMPY hurdle is ARMED + DEMONSTRATED on a constructed positive-control record (a thin per-period edge over many periods — mean/std ≈ 0.09, n ≈ 900 — survives deflation yet is LUMPY, tempering the clean GO). It has NOT fired on a real scored strategy: the one real GO on the shelf (aave-v3 USDC) is CONSISTENT (ICIR ≈ 0.6). Armed-and-demonstrated, not-yet-fired-on-real-data — honest either way.", status: "RESOLVED" },
  ],

  // ── D9 (the contract-engine extraction + coupling-severance) — pinned here + appended to the live deviations ledger in Phase 2. ──
  deviationD9: {
    id: "D9",
    blueprintLine: "Contract-Truth Phase 2 (EXTRACT-CLEAN): 'copy src/solidity + the ~10 LLM-free tools into src/contract/*; sever the OpenCode coupling; drop Tool.define; the extraction + severance recorded in D9; the leak wall green; NO model ported'",
    whatWasDone: "EXTRACTED copy-into-tree: Sentinel's src/solidity engine (ir.ts + protocols.ts verbatim; build.ts + project.ts + index.ts→analyze.ts with coupling severed) and the SIX tools' pure (ContractIR)→facts logic feeding the pinned flag categories (auth-surface · call-graph · upgrade-check · storage-layout · value-flow · state-flow) → src/contract/facts.ts were COPIED into src/contract/*. The OpenCode coupling was SEVERED — @/util/{glob,filesystem,process} → a small owned src/contract/fs.ts shim over node built-ins + Bun.Glob/spawn, and @/project/instance (the session cache + default dir) → a required plain project-path parameter. The Tool.define wrappers, the zod schemas, the ../lang multi-language fallback, the LLM audit agent, the fuzzer, the RAG, and dep-analyze.ts were DROPPED. The four other LLM-free tools (contract-info · inheritance-resolver · dimensional-analysis · mutation-map) were NOT ported — their outputs are not in the sub-axis fact list, so porting them would be speculative surface with no current caller (PART CLEAN). The code is OWNED in-tree; nothing imports @solidity-sentinel/* or OpenCode (the dataplane_leak wall stays green); the main pipeline reads the Foundry compiler JSON (build-info AST), so no new npm dependency (deps stay hono+zod).",
    why: "The deep counterparty axis needs to SEE THE CODE deterministically. The single high-value extractable Sentinel asset is its LLM-free, compiler-backed src/solidity IR + tools (validated: zero provider/session hits) — the only way a contract-risk axis can exist without violating X-DETERM. Copy-into-tree (never a sibling import) keeps the dataplane_leak wall green and the tree owned; porting only the pure analysis (not the platform) respects PART CLEAN.",
    lawAuthority: "X-CONTRACT(a,b) + X-DETERM + X-DEVLEDGER + PART CLEAN (Contract-Truth Phase 2)",
  },

  // ── THE SCREEN SET (carried, unchanged) — the conscious 3; the contract detail is a Pro row on the Reality Check, NOT a screen. ──
  screens: {
    count: 3,
    set: ["shelf", "reality-check", "ask"],
    massScreens: ["shelf", "reality-check"],
    contractDetailIsAProRow: "the contract-risk detail is a Pro row on the Reality Check counterparty section (not a screen); a fourth screen is a Halt (PART CLEAN)",
  },

  // ── THE RED-TEAM / STRESS CATALOG (PART E; S1–S27) — S1–S24 carried verbatim from the persistence pins + S25/S26/S27. ──
  stressCatalog: [
    ...S1_S24,
    { id: "S25", name: "contract-analysis honesty (NEW)", expect: "a contract screen reports specific structural facts + the 'not a full audit' label, NEVER 'safe/audited'; ZERO model/LLM in src/contract/*; deterministic (a fixed ContractIR → byte-identical facts + tier); a seeded unprotected admin fn → FLAGGED (the finding named)" },
    { id: "S26", name: "leak-wall / coupling-severance (NEW)", expect: "src/contract/* imports nothing from @solidity-sentinel/* or OpenCode (the dataplane_leak wall green + a positive control on the new dir); D9 records the extraction + severance; the ported code is owned in-tree, not referenced from a sibling; no new npm dep" },
    { id: "S27", name: "Foundry-absent degradation (NEW)", expect: "no build/toolchain → the contract sub-axis is UNVERIFIED, the coarse age·size·dependency screen scores alone; a SAMPLE/absent build NEVER a fabricated all-clear; the mass tool + ./organon.sh verify + the pristine fresh clone run green (never a crash)" },
  ],

  // ── carried, unchanged (X-KEEP · X-MOAT · X-DETERM · X-HONEST · PART CLEAN) ──
  carried: {
    frozenSeven: "the 6 computational-core .py + loop.ts byte-untouched (core_byte_identity green every gate); the contract engine + sub-axis touch ZERO frozen bytes",
    verdictDifferential: "lending fp-set 70c7912f… + funding NO-GO/ILLUSTRATIVE reproduce at every gate — zero verdicts moved (the contract sub-axis is material:false — additive)",
    sevenAxes: ["yield-reality", "tvl-trend", "peg", "liquidity-depth", "unlock-overhang", "counterparty", "funding-regime"],
    coarseCounterpartyFloor: "the coarse counterparty screen (age · size · dependency — NOT a contract audit) is UNCHANGED + material; the contract-risk sub-axis is BESIDE it (the depth), never replacing it",
    stampVerdicts: ["GO", "NO-GO", "INSUFFICIENT", "UNAVAILABLE"], // unchanged — the contract sub-axis is a scorecard row, never a Stamp verdict
    deps: ["hono", "zod"], // the Foundry toolchain (contract), the sidecar (Stamp), and the AI provider (Ask) are optional seams, not mass-tool deps
    aiProviders: ["gemini (Google AI Studio, default)", "openai", "anthropic", "openai-compatible", "groq (llama-3.1-8b-instant)"],
    moatCadence: "the capture cadence appends ONLY REAL captures (content-addressed, hash-chained) — now incl. contract-risk facts captured at registration; a backfill/retro throws",
    parkedGenerateLoop: "the LLM strategy-proposer / iterate-to-generate loop stays PARKED (a different product for a non-wedge user); the Sentinel fuzzer/RAG/dynamic analysis + the public library + execution stay PARKED (THE FIREWALL)",
    probe: "the X-PROBE metrics + KILL CRITERION remain ARMED + honestly BUILT-BUT-UNPROVEN",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const pinsOut = { ...PINS, pinsSha }
writeFileSync(path.join(HONESTY_DIR, "contract-pins.json"), JSON.stringify(pinsOut, null, 2) + "\n")

// ── THE VERDICT-DIFFERENTIAL BASELINE — re-asserted (the frozen attest engine's lending + funding verdicts) so every
// contract-truth phase proves NO existing verdict moved. Identical source to the persistence baseline (byte-reproduced). ──
const lendingSetSha = await VerdictDifferential.fingerprintSetSha()
const FUNDING_TS = Date.parse("2026-07-05T00:00:00Z")
const fundingRes = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, FUNDING_TS)

console.log("── CONTRACT-TRUTH — PHASE 0 (PINS-LOCKED) ────────────────────")
console.log(`blueprint sha        : ${blueprintSha}`)
console.log(`carried-from PINS_SHA: ${CARRIED_FROM}`)
console.log(`CONTRACT PINS_SHA    : ${pinsSha}`)
console.log(`lending fp-set sha   : ${lendingSetSha}`)
console.log(`funding verdict      : ${fundingRes.verdict} (${fundingRes.artifact?.reality ?? null}) reproHash ${String(fundingRes.artifact?.verdictReproHash).slice(0, 16)}…`)
console.log(`contract-risk tiers  : ${PINS.contractRisk.tiers.join(" · ")} · flags ${PINS.contractRisk.flagCategories.length} · material ${PINS.contractRisk.material}`)
console.log(`extraction           : copied ${PINS.extraction.copied.length} · severed ${PINS.extraction.severed.length} · dropped ${PINS.extraction.dropped.length}`)
console.log(`persistence P1–P6    : ${PINS.persistenceResolutions.map((p) => p.id).join(", ")}`)
console.log(`screens              : ${PINS.screens.count} (${PINS.screens.set.join(" · ")})`)
console.log(`stress catalog       : ${PINS.stressCatalog.length} (S1–S27)`)
console.log(`written              : data/honesty/contract-pins.json`)
