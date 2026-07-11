/**
 * ORGΛNON — THE GROUND-TRUTH SPRINT, Phase 0 (PINS-LOCKED). Builds `data/honesty/groundtruth-pins.json`: the
 * X-GROUNDTRUTH contracts, EACH fenced before a line of product code lands. Precision built the right axis and proved it
 * on fixtures where reality wasn't reachable; this sprint reaches — the real source, the real proof, the real rug — or
 * says honestly it couldn't. Three moves + the Aligrithm filing + the whole gate, all capture-time, no paid provider,
 * every resolved fact content-hashed into the moat:
 *   (a) IMPL-REALIZED (PC2, S61) — the two real implementations BUILD from their OWN Sourcify metadata and are ANALYZED,
 *       admitted to the screen ONLY on a compiled-vs-deployed runtime-bytecode MATCH (immutable-refs + CBOR metadata
 *       masked per the pinned rule); a mismatch → the subject stays UNVERIFIED (analyzing source the chain doesn't run
 *       is a fabrication with extra steps).
 *   (b) IMMUTABLE-PROVEN (PC4, D30, S62) — the classifier gains a fifth class, IMMUTABLE, granted on BYTECODE-CONSTANT
 *       PROOF ONLY (impl a deployed-bytecode constant · the 1967 impl slot unused · no admin-slot write path) — all three
 *       at the pinned block; anything less stays UNRESOLVED; a fabricated "no upgrade path" is stronger poison than a
 *       wrong SAFE and Halts (the disguised-mutable control classifies UNRESOLVED).
 *   (c) REAL-RUG-AT-HEIGHT (PC1, S63) — one pinned rug (PAID Network, a compromised-key upgrade), one pinned pre-collapse
 *       height, three reads, free archive-capable endpoints — content-hashed + re-verifiable, OR the honest gap; a
 *       simulated archive read dressed REAL is the cardinal sin; the discrimination claim's wording tracks the evidence.
 *   + the Aligrithm due diligence (AL1 inspiration-only · AL3/AL5 primary citations · AL4/AL6 the PBO/CSCV trigger pinned,
 *       implementation-absent) — D31 — and the whole Operator gate presented again, D27 FIRST (nine signatures D23-D31).
 * Dual-repo (byte-identical): organon AND organon-studio. Convention follows precision-pins-build.ts:
 *   pinsSha = sha256(JSON.stringify(pins-without-sha)).  Run: bun run script/honesty/groundtruth-pins-build.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const fileSha = (rel: string) => sha256(readFileSync(path.join(PKG_ROOT, rel), "utf8"))

// the SAME 7 verdict-path modules Precision pinned — asserted === live at every gate. The governance fact (now with the
// IMMUTABLE class) renders info/context; D30/D31 are PARKED (operatorSigned=false) — so NONE of these change this sprint.
const VERDICT_PATH = [
  "src/analytics/scorecard.ts",
  "src/studio/stamp.ts",
  "src/studio/decay.ts",
  "src/studio/icir.ts",
  "src/studio/mintrl.ts",
  "src/studio/lineage.ts",
  "src/ask/gates.ts",
]

// the frozen computational core (the Stamp DSR lives in rigor.py; the effective-N deflation in effective_n.py — the PBO
// trigger's future home). Byte-untouched this sprint — the PBO/CSCV companion stays PARKED behind its pinned trigger.
const FROZEN_CORE = ["src/backtest/py/rigor.py", "src/backtest/py/effective_n.py"]

const pins: Record<string, unknown> = {
  protocol: "groundtruth-pins",
  sprint:
    "THE GROUND-TRUTH SPRINT — X-GROUNDTRUTH: make the Precision axis TRUE against REALITY, not fixtures. (a) IMPL-REALIZED — the real aave/compound implementations BUILD from their OWN Sourcify metadata + are admitted to the screen ONLY on a compiled-vs-deployed bytecode match (mismatch → UNVERIFIED). (b) IMMUTABLE-PROVEN — a fifth classifier class granted on the three-condition bytecode-constant PROOF only (aave's 27 tucked findings collapse honestly BECAUSE no upgrade path EXISTS, never because we guessed; the disguised-mutable control stays UNRESOLVED). (c) REAL-RUG-AT-HEIGHT — a real historical admin-key rug's pre-collapse state captured at a pinned archive height over free endpoints, or the honest gap. + the Aligrithm due diligence filed inspiration-only (primary citations pinned; the PBO/CSCV trigger pinned, implementation-absent). The whole Operator gate presented again, D27 FIRST (nine signatures D23-D31). All capture-time, no paid provider, content-hashed into the moat. Red-team S1-S63.",
  at: "2026-07-11",
  continues:
    "THE PRECISION SPRINT (VALIDATED PASS both repos; 1129 pass / 2 skip / 0 fail across 172 files / 1131 tests; pristine 1126/0; PINS_SHA d2fa4cdc…; terminal tree 3cb0c674…; the governance axis LIVE — branch-B zero-dep resolver, the conservative classifier with the zero-slot anti-cry-wolf rule, the collapse-as-whitelist (S58 biting), the discrimination wall real-clean-vs-synthetic-rugged; D1-D29 with D23-D29 unsigned; X-PROBE RUNNING — READY-PENDING-OPERATOR). The Precision validation named the gap in one sentence: the axis is architecturally true but not yet GROUND-true — the impl re-point recorded honest UNVERIFIED when the large multi-file builds did not build under the pipeline (PC2); the discrimination separates real-clean from SYNTHETIC-rugged (PC1); aave tucks 27 shell findings while its admin is immutably in bytecode — reassuring, not caution (PC4); D27 is three sprints top-of-package (PC3); D29's census is ZERO (PC5).",
  carriedFromPinsSha: "d2fa4cdcea7ca431e3c2cf5f7d697982ee2d19f0b95dc55d0f794a53593a2e5d",
  dualRepo: {
    repos: ["ibabarhashmi/organon-studio", "ibabarhashmi/organon"],
    rule: "one blueprint, two trees (byte-identical base + the byte-identical Alpha/Probe/Moat/Precision layer); every gate re-proven in EACH; a per-repo delta is a DISC (recorded, never smoothed); the port byte-identical or the difference recorded (PR5)",
    startBattery: "1129 pass / 2 skip / 0 fail across 172 files / 1131 tests (pristine 1126/0) BOTH repos",
  },

  // ───────────────────────── X-GROUNDTRUTH — FIXTURES BECOME FACTS OR STAY HONEST GAPS (the sprint's law) ─────────────────────────
  xGroundTruthLaw: {
    law: "X-GROUNDTRUTH — three clauses, each load-bearing; a guessed immutability, an unmatched build analyzed anyway, a simulated archive read, or a claim ahead of its evidence is a Halt",
    clauseA_analyzeWhatExecutesVerified:
      "an implementation is 'analyzed' ONLY when its metadata-pinned build's compiled runtime bytecode MATCHES the deployed bytecode at the pinned block (immutable-references + the CBOR metadata tail masked per the pinned rule); a mismatch is recorded and the subject stays UNVERIFIED — analyzing source the chain doesn't run is a fabrication with extra steps (S61)",
    clauseB_immutableOnlyOnProof:
      "the fifth class IMMUTABLE is granted on the THREE-CONDITION bytecode-constant proof (the implementation address a deployed-bytecode constant · the EIP-1967 impl slot unused/zero · no admin-slot write path in the proxy bytecode), all-or-nothing, at the pinned block; anything less is UNRESOLVED; the extended collapse folds proxy-machinery findings on IMMUTABLE because they are moot BY PROOF; business findings survive; a fabricated 'no upgrade path' is stronger poison than a wrong SAFE and Halts (S62)",
    clauseC_archiveTruthOrHonestGap:
      "the real-rug capture happens at the pinned historical height over free archive-capable endpoints, content-hashed and re-verifiable, OR is recorded as an honestly-named gap; a simulated pre-collapse state dressed REAL is the cardinal sin (S63); the discrimination claim's wording tracks EXACTLY what has been proven, no further",
  },

  // ───────────────────────── (a) IMPL-REALIZED — the metadata-build spec + the pinned bytecode-mask rule (PC2, S61) ─────────────────────────
  metadataBuildSpec: {
    rule: "'Did not build under the pipeline' was a remappings/multi-file problem, not an impossibility: Sourcify verification MEANS the exact compiler input is on record (the metadata JSON carries the solc version, optimizer settings, evmVersion, remappings, and the full source tree; an exact/full match means that input reproduces the deployed code). The deterministic path: fetch the metadata → reconstruct the build with the metadata's OWN solc version (forge/svm) + settings + remappings → extract the compiled runtime (deployed) bytecode → compare to eth_getCode at the pinned block under the pinned mask rule → ONLY a match admits the source to the static screen",
    contentHashed:
      "the build config (compiler version + optimizer + evmVersion + remappings) + the sorted source tree are sha256'd into the moat; the build reproduces byte-identically ×2 (deterministic — S61); a changed source byte changes the config/tree hash",
    matchGate:
      "only a MATCH admits the source to the static screen; a MISMATCH → the subject stays UNVERIFIED, recorded verbatim (which segments differ, why-unknown); analyzing unmatched source is forbidden — the screen never sees it (S61, A′#2)",
    pinnedMaskRule: {
      law: "'match' is a DETERMINISTIC predicate ONLY under a pinned mask — two byte regions are compiler-nondeterministic / deploy-context and are masked (zeroed) on BOTH sides before the compare; the mask is DATA (byte offsets/lengths taken from the compiled artifact + the CBOR length declaration), NEVER a logic waiver — masking anything beyond the two declared regions is a Halt",
      masks: [
        "IMMUTABLE-REFERENCES — solc immutable() values are patched into the runtime at construction (addresses/amounts known only at deploy); the compiled artifact's `immutableReferences` map gives the exact byte offsets+lengths; those bytes are zeroed on BOTH the compiled and the deployed side",
        "CBOR METADATA TAIL — the trailing solc metadata (…a2646970667358221220<ipfs-hash>64736f6c6343<solc>0033 CBOR; the source-hash + solc version); the last two bytes declare the CBOR length; those bytes are zeroed on BOTH sides — a metadata-only difference is NOT a logic difference (but a masked-tail-only match is RECORDED as 'runtime-logic match, metadata differs')",
      ],
      determinismNote: "an UNMASKED compare would flake on the metadata tail on many builds → the mask makes 'match' deterministic and re-runnable; a full (unmasked) byte-identity is the STRONGEST match and is recorded as such when it holds",
    },
    subjects: [
      { slug: "aave-v3-pool", implFrom: "the governance capture's resolved implementation address", chainId: 1 },
      { slug: "compound-v3-usdc", implFrom: "the governance capture's resolved implementation address", chainId: 1 },
    ],
    positiveControl:
      "a small, single-file, Sourcify-exact-match verified contract that DOES reproduce and MATCH its deployed runtime bytecode — proves the build+mask+match mechanism END-TO-END where the flagship multi-file builds may not; the mechanism is the deliverable, the flagship match is recorded honestly either way (address recorded in the Phase-2 artifact, not pinned here)",
    negativeControl: "a one-byte-off compiled artifact → MISMATCH → UNVERIFIED; the screen never sees it (S61)",
    honestOutcome:
      "aave/compound reproduce+match → the screen runs on REAL implementation source, findings re-captured (conscious, old/new disclosed), the census gains an implementation-truth column; they do NOT reproduce/match → UNVERIFIED recorded verbatim, the mechanism proven on the positive control, coverage honest (the blueprint's explicit 'or honestly UNVERIFIED')",
    massPathUntouched: "the build is CAPTURE-TIME only (forge/svm + solc, run by the Operator/CI); it adds ZERO mass-path or runtime dependency; the mass path stays {hono, zod}",
  },

  // ───────────────────────── (b) IMMUTABLE — the three-condition proof spec + the disguise control (PC4, D30, S62) ─────────────────────────
  immutableProofSpec: {
    law: "IMMUTABLE is a PROOF, not a guess — the strongest reassurance available in the product, granted ONLY on the three-condition bytecode-constant proof at the pinned block; a fabricated 'no upgrade path' is STRONGER poison than a wrong SAFE (it tells a depositor to stop worrying entirely) and HALTS",
    threeConditions: [
      "(1) BYTECODE-CONSTANT — the resolved implementation address appears as a constant (an embedded 20-byte word / a PUSH20 immediate) in the PROXY's DEPLOYED bytecode (eth_getCode at the pinned block) — the aave/spark pattern",
      "(2) SLOT-UNUSED — the EIP-1967 implementation slot is zero/unused (the implementation is NOT read from a mutable storage slot)",
      "(3) NO-WRITE-PATH — no admin-slot write path exists in the proxy bytecode (no SSTORE targeting the 1967 admin/impl slots) — the same slot-write scan the resolver performs, inverted as an ABSENCE proof",
    ],
    allOrNothing: "ALL THREE hold → IMMUTABLE; ANY one fails → UNRESOLVED stands (never a two-of-three IMMUTABLE — A′#1); all three checked at ONE pinned block per subject (X-DETERM)",
    disguiseControl:
      "the seeded DISGUISED-MUTABLE control — a fixture with an embedded-looking implementation constant (condition 1 passes) PLUS a live SSTORE-to-1967-slot write path (condition 3 FAILS) → MUST classify UNRESOLVED (S62); the gravest new failure mode is a fabricated immutability on a secretly-mutable proxy (a beacon hop, an admin-slot writer, a metamorphic CREATE2 trick)",
    businessSurvives:
      "the extended collapse folds proxy-MACHINERY findings on IMMUTABLE (moot by proof — the machinery is provably inert) but a business-logic finding (a reentrancy in the immutable implementation) SURVIVES and is MORE permanent — no patch is coming; the Pro register states the permanence (S62, A′#5)",
    specHashStable:
      "the proof spec is hash-pinned (this pins object); a spec edit after seeing aave's result is a conscious re-pin with the Operator's signature (D30) — relaxing the proof to prettify aave's census is THE FIREWALL violation (A′#7); the census is an OUTCOME, never a target",
    proofDecides: "aave is re-run through the proof and classifies IMMUTABLE ONLY IF all three conditions hold on-chain; if the proof fails, aave STAYS UNRESOLVED and its census stays 27 — truth over trophy (the wish does not decide)",
  },
  immutableGrammar: {
    form: "Immutable implementation — no upgrade path exists; the proxy machinery is inert. (Proven at block {N}: the implementation is a bytecode constant.)",
    ceiling: "IMMUTABLE answers the UPGRADE-PATH question ONLY — a provably-unupgradeable contract can still be buggy, and its bugs are PERMANENT; a clean screen still NEVER reads 'safe' (X-CONTRACT/X-VERIFY unchanged in kind)",
    proRegister: "the Pro register adds: any surviving business finding in an immutable implementation is PERMANENT — no patch can reach it",
    simpleRegister: "the Simple register: no one can change this contract's code — but any flaw in it is permanent",
  },
  classifierClassesV2: {
    classes: ["EOA", "SAFE", "TIMELOCK", "UNRESOLVED", "IMMUTABLE"],
    gatedClasses: ["SAFE", "TIMELOCK"],
    immutableFoldsToo:
      "IMMUTABLE ALSO folds the canonical proxy-MACHINERY findings (provably inert) — a SEPARATE fold path from the gated (SAFE|TIMELOCK) fold; business findings survive under BOTH paths; EOA/UNRESOLVED fold NOTHING (carried)",
    rankNote:
      "IMMUTABLE is reported as ITS OWN reassurance form (not force-ranked above/below TIMELOCK without the Operator's D30 eyes); the discrimination wall re-runs with the fifth class; governanceRank places IMMUTABLE at the strong end for the render-signal ordering only (NOT a verdict)",
  },

  // ───────────────────────── (c) REAL-RUG-AT-HEIGHT — the archive-capture spec (PC1, S63) ─────────────────────────
  archiveCaptureSpec: {
    law: "ONE subject, ONE pinned height, THREE reads — a real rug's real pre-collapse governance state captured over FREE archive-capable endpoints, content-hashed + re-verifiable, OR the honest gap; NO simulation dressed REAL (the cardinal sin, A′#3)",
    pinnedSubject: {
      name: "PAID Network token (V1, exploited)",
      address: "0x8c8687fc965593dfb2f0b4eaefd55e9d8df348df",
      chainId: 1,
      mechanism:
        "March 5 2021 (~18:00 UTC) — a COMPROMISED DEPLOYER PRIVATE KEY (an externally-owned account holding the upgrade authority) was used to call the token proxy's UPGRADE function, swap in a malicious implementation, and mint 59,471,745 PAID; ~2,040 ETH drained on Uniswap before discovery. The collapse mechanism was PRECISELY the admin-key/upgrade-path surface the governance axis reads — a single key replacing an upgradeable contract's logic.",
      rationale:
        "MECHANISM-MATCH, recorded BEFORE any capture (A′#4): selected because the rug's mechanism IS an admin-key upgrade (NOT a market/oracle/flash-loan collapse); a well-documented, address-known, single-key upgrade rug — the cleanest live-adjacent exemplar of the EOA-admin danger class the synthetic control stands in for (that class being extinct among survivors). NOT chosen to flatter the axis: the axis flags the upgrade-key surface, it does not predict depegs.",
      newTokenNote:
        "PAID relaunched a NEW token (0x1614f18f…e7da3d787), moved to a multisig, after the hack; the SUBJECT is the OLD exploited proxy at a PRE-collapse height — never the relaunched token",
      sources: [
        "PAID Network Attack Postmortem (paidnetwork.medium.com, 2021-03-07)",
        "Halborn — Explained: The PAID Network Hack (March 2021)",
        "Etherscan token 0x8c8687fc965593dfb2f0b4eaefd55e9d8df348df",
      ],
    },
    pinnedHeight: {
      block: 11975000,
      note: "a PRE-collapse height (≈ March 5 2021, in the hours before the ~18:00 UTC exploit near block ~11,976,461); the pre-collapse governance state (the admin the compromised key controlled) was in place well before the exploit",
    },
    threeReads: [
      "the EIP-1967 admin slot (0xb531…) → adminAddr (who held the upgrade key)",
      "the EIP-1967 implementation slot (0x3608…) → the pre-collapse implementation",
      "eth_getCode(adminAddr) → EOA (empty) vs contract",
    ],
    freeEndpointRule:
      "free ARCHIVE-CAPABLE endpoints ONLY (the live rotation {llamarpc, ankr, publicnode, 1rpc} extended with free archive-serving RPCs); publicnode REFUSES free archive ('Archive requests require a personal token' — recorded, empirically confirmed 2026-07-11); a PAID/BYOK archive key is a CUT; if NO free endpoint serves the height → the HONEST GAP (the full attempt log: which endpoints, which errors) is recorded and STAYS",
    honestGapRule:
      "no free endpoint serves the height → the gap is recorded, the claim wording HELD at clean-vs-synthetic, nothing simulated (S63, the cardinal sin A′#3)",
    boundedness:
      "ONE subject, ONE height, THREE reads — a second rug 'for robustness' is a CUT; a range-scan / a general indexer is a CUT; the archive-node scope stays PARKED by name (A′#8)",
    reportsWhatIs:
      "IF captured, the artifact records what the classifier RENDERS on the real pre-collapse state — the damning EOA line IF the 1967 admin resolved to an EOA (direct or owner-hop); OR, if PAID's upgrade authority was a UUPS-owner surface (the 1967 admin slot reads zero), the artifact records UNRESOLVED and the precise boundary (the axis reads the 1967 transparent-admin surface, not every upgrade-authority pattern) — the artifact reports what IS, not what flatters (truth over trophy)",
  },

  // ───────────────────────── THE PRECISE CLAIM WORDINGS (PC1) — everywhere the discrimination claim renders ─────────────────────────
  claimWordings: {
    today:
      "The governance axis discriminates a real clean pool (compound-v3 → TIMELOCK-gated; aave-v3 → UNRESOLVED/IMMUTABLE) from a SYNTHETIC rugged control (a labeled EOA-admin + ungated-upgrade fixture, never claimed on-chain) on class + collapse + grammar. The live EOA-admin danger class is EXTINCT among survivors (0 of ~50 mainnet proxies) — a real LIVE EOA-admin pool cannot be exhibited because such pools did not survive.",
    upgradedTemplate:
      "On {subject}'s REAL pre-collapse governance state, captured at block {height} over {endpoint} (content-hash {hash}), the governance axis rendered: “{renderedLine}”. {subject} rugged via {mechanism}. — the discrimination claim now rests on a real rug's real chain state, not only a synthetic control.",
    doesNotClaim:
      "The governance axis flags the UPGRADE-KEY SURFACE (who can replace the code, via the EIP-1967 admin slot). It does NOT predict depegs, oracle failures, market-mechanism collapses, or upgrade authorities held OUTSIDE the 1967 admin slot (e.g. a UUPS owner in implementation storage). A clean governance line is NEVER a verdict of safety.",
    wordingTracksEvidence:
      "the wording tracks the evidence in BOTH directions — an upgraded wording WITHOUT a capture hash is a Halt; a today-wording DESPITE a landed capture is a Halt (A′#6, S63)",
  },

  // ───────────────────────── THE ALIGRITHM DUE DILIGENCE (AL1/AL3-AL6, D31) — record, not code ─────────────────────────
  aligrithm: {
    AL1_filing:
      "Aligrithm (aligrithm.com; Ali H. Askar, CQF) — filed INSPIRATION-ONLY in the ledger: a solo-authored quantitative-trading research publication with real methodological depth (CSCV/PBO, research discipline) and ZERO DeFi / on-chain scope; NOT a competitor, a data source, or a technology source; nothing integrates. The classification is durable — it prevents wasted future diligence cycles.",
    AL3_AL5_primaryCitations: {
      rule: "the Stamp's load-bearing methods cite their PRIMARY sources — the PAPER, never the blog; Aligrithm is recorded as a map-not-territory reading reference only (anything load-bearing cites the paper)",
      citations: [
        "Bailey, D. H. & López de Prado, M. (2014). 'The Deflated Sharpe Ratio: Correcting for Selection Bias, Backtest Overfitting, and Non-Normality.' The Journal of Portfolio Management, 40(5), 94-107. SSRN 2460551. — the Stamp's DSR (src/backtest/py/rigor.py)",
        "Bailey, D. H., Borwein, J. M., López de Prado, M. & Zhu, Q. J. (2016). 'The Probability of Backtest Overfitting.' Journal of Computational Finance, 20(4), 39-69. SSRN 2326253. — the PBO/CSCV companion (parked behind the trigger)",
        "López de Prado, M. & Lewis, M. J. (2019). 'Detection of False Investment Strategies Using Unsupervised Learning Methods.' Quantitative Finance, 19(9), 1555-1565. DOI 10.1080/14697688.2019.1622311. — ONC (parked)",
      ],
    },
    AL4_AL6_pboTrigger: {
      what: "a deterministic CSCV/PBO companion metric becomes buildable in the opt-in Stamp WHEN AND ONLY WHEN the future proposer emits ≥ 20-50 trials per strategy family (the same trigger that makes the familyN deflation live)",
      pinnedTrigger: "the trigger threshold (≥ 20-50 trials/family) is PINNED so it cannot drift; below the trigger the PBO/CSCV companion stays PARKED",
      implementationAbsent:
        "the frozen rigor.py contains the anti-PBO adjudicator math (CSCV/PBO/CPCV per López de Prado Appendix B — byte-frozen, carried verbatim from the monorepo, one of the frozen-core .py) but it is INERT on the single-trial Stamp path (familyN=1 → no multiple-testing charge is paid; RE3 renders 'the deflation is currently inert'). What is ASSERTED ABSENT is a NEW CSCV/PBO COMPANION — a module that assembles ≥ 20-50 trials/family and surfaces a live multiple-testing-overfitting metric below the trigger; a grep wall asserts NO such companion exists OUTSIDE the frozen core (a seeded pbo.ts/cscv.ts companion on the path FAILS the wall)",
      extendsRE5: "extends Moat's RE5 trials-ledger schema convention (the trials-ledger is the trigger's future input)",
    },
  },

  // ───────────────────────── PC/AL RESOLUTIONS ─────────────────────────
  resolutions: {
    PC1: "the discrimination claim stated precisely (clean-vs-synthetic today) + upgraded by the archive capture OR held at the honest gap; the does-NOT-claim sentence walled everywhere it renders (handoff, /postmortems, ALPHA.md)",
    PC2: "the implementation re-point RUN on the real shelf pools via the metadata-pinned deterministic build + the compiled-vs-deployed match; match → real source screened; mismatch → UNVERIFIED honest (S61)",
    PC3: "D27 top-of-package, now THREE sprints running — presented FIRST with the one-line generosity statement",
    PC4: "UNRESOLVED split — 'provably immutable' (IMMUTABLE, reassuring) vs 'simply opaque' (UNRESOLVED, caution) — on PROOF only (D30, S62)",
    PC5: "D29's census is ZERO — the cheapest signature, presented with its census-zero note",
    AL1: "Aligrithm filed inspiration-only (D31)",
    AL3: "primary citations pinned (papers, not the blog)",
    AL4: "the PBO/CSCV trigger pinned (≥ 20-50 trials/family)",
    AL5: "load-bearing methods cite their primary papers",
    AL6: "the PBO/CSCV implementation asserted ABSENT (grep-walled)",
  },

  // ───────────────────────── DEVIATIONS RESERVED (D30/D31 — Operator-signed, PARKED) ─────────────────────────
  deviations: {
    reserved: [
      "D30 (the IMMUTABLE class + the flagship render change — aave from caution+27-tucked to the immutable line + survivors; the classifier class-set extension EOA/SAFE/TIMELOCK/UNRESOLVED/IMMUTABLE; the collapse extension) — Operator-signed; operatorSigned=false, PARKED for the Phase-5 gate; the render is info/context (no verdict moves); the verdict-path hashes asserted UNCHANGED",
      "D31 (the Aligrithm filing inspiration-only + the primary-citations pin + the PBO/CSCV trigger, implementation-absent) — Operator-signed; operatorSigned=false, PARKED for the Phase-5 gate",
    ],
    carriedUnsigned: "D23-D29 carried from Precision, all unsigned (OWED-OPERATOR-GATED); the countersign package now spans D23-D31, D27 FIRST",
  },

  // ───────────────────────── STRESS CATALOG (S1-S63) ─────────────────────────
  stressCatalog: {
    carried: "S1-S60 first-class, re-run in BOTH repos (S58's ungated control + the conservative classifier + the discrimination wall all re-bite under the extended collapse)",
    S61: "implementation-truth REALIZED — the metadata-pinned build reproduces ×2 (deterministic); the pinned mask rule applied as data; the one-byte-off control → UNVERIFIED; on match, the screen's input === the built source-tree hash; a mismatch recorded verbatim, never waived",
    S62: "the IMMUTABLE proof wall — the three conditions all-or-nothing (each falsified individually → UNRESOLVED); the DISGUISED-MUTABLE control (embedded constant + live write path) → UNRESOLVED; machinery folds, business survives with the permanence note; the proof spec hash-stable (no post-hoc relaxation)",
    S63: "the archive-truth wall — the capture re-hashes against its named endpoint+height OR the gap carries the full attempt log; the claim wording tracks the evidence in BOTH directions; one-subject-one-height boundedness (a range-scan/second-rug fails); NO simulation dressed REAL",
  },

  // ───────────────────────── FROZEN INVARIANTS (asserted === live at every gate) ─────────────────────────
  verdictPathForbidden: {
    modules: VERDICT_PATH,
    extension:
      "carried from Precision — the governance resolver + the impl-build (both capture-time) may import NO scored module and appear in NO verdict-path module; the render consumes governance (now incl. IMMUTABLE) in the render layer (reality.ts) only; the governance fact is info/context (D30/D31 parked). The mass path stays {hono, zod}",
  },
  verdictPathHashes: Object.fromEntries(VERDICT_PATH.map((rel) => [rel, fileSha(rel)])),
  frozenCoreHashes: Object.fromEntries(FROZEN_CORE.map((rel) => [rel, fileSha(rel)])),
  parityContract: {
    profiles: ["zero-key", "free-key", "paid-key"],
    differentialBaseline: {
      lendingSetSha: "70c7912f0b16a796ea585ab7e508af542f1f83d05110143c8575bab226a3bf54",
      fundingNoGoReproHash: "0a63151b",
    },
  },
  killCriterionUntouched: "probe-kill-criterion.json commitHash 8b4e094b stays content-matched — the ground-truth pass never nudges the goalpost",
  evidenceBundleSha: "9c1e7bd8 — byte-identical at every gate (NO verdict moves; D30/D31 parked; the governance fact incl. IMMUTABLE is info/context)",

  screens: {
    count: 3,
    note: "the conscious 3; /postmortems + /feedback stay DISPOSITIONED doors; the contract drawer upgrades IN PLACE (the governance line — now with the immutable form — leads, survivors below); NO fourth screen",
  },
  massPathDeps: ["hono", "zod"],
  massPathDepsNote:
    "the mass render path STAYS hono+zod; the branch-B governance resolver + the metadata build + the archive capture are ALL capture-time and zero mass-path-dep (raw eth_getStorageAt/eth_getCode/eth_call over PlaneRpcState; forge/svm at capture time); adding a mass-path dependency, a paid endpoint, or the parked scope is a Halt (PART CLEAN)",
  stillParked:
    "the proposer + ONC + PBO/CSCV (trigger PINNED ≥ 20-50 trials/family, implementation ABSENT); the reports/API; execution/custody; the archive node / general indexer (the one-subject archive capture does NOT unpark it); calibration scoring; meta-labeling/ML-feature-importance (rejected on the verdict path, permanently); Slither (AGPL)/Mythril/Aderyn; everything Aligrithm (inspiration-only by ledger)",
}

const pinsSha = sha256(JSON.stringify(pins))
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "groundtruth-pins.json"), JSON.stringify({ ...pins, pinsSha }, null, 1) + "\n")
console.log("groundtruth-pins.json written · PINS_SHA", pinsSha, "· carried", pins.carriedFromPinsSha)
