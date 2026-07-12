/**
 * ORGΛNON — THE COVERAGE SPRINT, the pins builder (X-COVERAGE + X-CORRELATE). Continues from the COMPLETE Redesign pins
 * (data/honesty/redesign-pins.json) — which carried GroundTruth 3d0ef3bb — carried forward, never rebuilt. This pins,
 * BEFORE any product code, every contract of the sprint that kills the cold-start without bending a law:
 *   · X-COVERAGE (breadth without a lie) — the DeFiLlama Yields breadth layer behind a VERBATIM non-commercial license
 *     posture (the USD-100k clause + the STANDING existing-use exposure), the dated Operator action + three pre-designed
 *     branches (α consent / β paid / γ degrade-to-SAMPLE); the any-pool lookup (per-axis honest degrade); the two-tier
 *     provenance label (REAL★ block-pinned vs REAL-at-timestamp aggregator); the coverage census as an OUTCOME; the
 *     Chainlink REAL★ price read spec; the vaults.fyi BYOK descriptor; the Pyth refusal WITH its dated reason.
 *   · X-CORRELATE (the substrate without the trigger) — the deterministic correlation engine (Pearson on aligned
 *     log-deltas · agglomerative average-linkage on 1−ρ · pinned threshold · lexicographic · canonical ordering ·
 *     k-means/randomness PROHIBITED · the minimum-overlap INSUFFICIENT floor); the non-advisory diversification wording
 *     VERBATIM; the deflation-STAYS-INERT wall (familyN===1 in every Stamp output; a seeded K-feed REFUSED); the
 *     K-activation gate (≥20–50 trials/family trigger AND the Operator's pen — D33, the future act pre-designed, PARKED).
 *   · GT1–GT5 — the Ground-Truth findings this sprint closes; D32/D33 reserved (Operator-signed=false, LN5); S64–S66.
 * The pins are hash-locked; deterministic; no network. The verbatim strings are pinned EXACTLY so a summarization is a
 * detectable Halt (S64/S66). Carry redesign-pins → new.
 *
 * Run: bun run script/honesty/coverage-pins.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")

// ── the CARRIED-FORWARD Redesign pins (the completed state this sprint continues from; it carried GroundTruth 3d0ef3bb) ──
const REDESIGN = JSON.parse(readFileSync(path.join(H, "redesign-pins.json"), "utf8"))
const CARRIED_FROM = REDESIGN.pinsSha as string

// ── continuity: the GroundTruth pins carried the S1–S63 catalog (as a carried-summary object); this sprint extends it ──
const GROUNDTRUTH = JSON.parse(readFileSync(path.join(H, "groundtruth-pins.json"), "utf8"))
const GT_HEAD = GROUNDTRUTH.pinsSha as string

// ── VERBATIM PINS — pinned EXACTLY (a summarization is a detectable Halt) ──────────────────────────────────────────────
const DEFILLAMA_TOS_VERBATIM =
  "DeFiLlama's June-2025 Terms of Service grant a personal, NON-COMMERCIAL license, with liquidated damages up to USD 100,000 per violation for unconsented commercial exploitation of the data (UAE law)."
const STANDING_EXPOSURE_VERBATIM =
  "ORGΛNON already uses DeFiLlama's free tier today, so the exposure is not hypothetical but standing — the license posture is a PINNED, DATED Operator business action, recorded in the ledger verbatim (D32)."
const DIVERSIFICATION_WORDING_VERBATIM = {
  general: "these N pools' recorded yields are ρ-correlated; effectively ≈ K independent bets",
  simple: "these three pools move together — you're holding about one bet, not three",
  rule: "a fact about correlation, never an allocation recommendation — the Markowitz optimizer stays REJECTED; info/context, number-traced, non-advisory",
}
const K_ACTIVATION_GATE_VERBATIM =
  "K enters the Stamp (familyN) ONLY when BOTH the already-pinned trigger fires (≥ 20–50 trials/family from a real proposer) AND the Operator signs (D33 pre-designs that future act). Building the substrate is not unparking the proposer; the statistics change on the day the trigger fires and the pen moves, not before."
const PYTH_REFUSAL_VERBATIM =
  "Pyth is REFUSED for the free core: its Core API moves to paid plans from July 31, 2026 — a free dependency with a dated rug-pull is not a free dependency."

const PINS = {
  protocol: "coverage-pins",
  sprint: "THE COVERAGE SPRINT (kill the cold-start without killing the constitution — the three-source coverage stack behind an honest license posture · the any-pool lookup · the two-tier provenance label · the Chainlink REAL★ price layer · the deterministic correlation substrate with the deflation PROVABLY inert · close every Ground-Truth finding · the whole Operator gate D23–D33, D27 still first)",
  at: "2026-07-12",
  continues: "THE REDESIGN SPRINT (which carried GroundTruth 3d0ef3bb; battery 1176/2/0 across 179 files)",
  carriedFromPinsSha: CARRIED_FROM, // the Redesign pins sha (which carried GroundTruth); the engine/voice/contract carried, this ADDS coverage + correlate

  // ── X-COVERAGE — BREADTH WITHOUT A LIE (the first law; four clauses) ──
  xCoverage: {
    a_licensePosture: {
      rule: "the license posture is a RENDERED fact — DeFiLlama's non-commercial ToS + the USD-100k clause + the STANDING existing-use exposure + the dated Operator action are pinned VERBATIM and rendered where a user of a served product can see it; shipping commercially against the unconsented free tier is a Halt (S64)",
      tosVerbatim: DEFILLAMA_TOS_VERBATIM,
      usd100kClause: "liquidated damages up to USD 100,000 per violation",
      standingExposureVerbatim: STANDING_EXPOSURE_VERBATIM,
      branches: {
        alpha: "written commercial consent obtained → the breadth layer SERVES",
        beta: "the paid API plan purchased → the breadth layer serves under the paid terms (TRAP: API access is NOT included in the $300/mo Pro dashboards product — the API subscription is a DIFFERENT purchase; verify which is bought)",
        gamma: "consent denied/deferred → DeFiLlama-sourced numbers DEGRADE to SAMPLE-labeled display in any served commercial context; vaults.fyi (paid, clean) promotes to the breadth source; the closed-alpha posture recorded with legal eyes open",
      },
      operatorAction: "D32 — a PINNED, DATED Operator business action (like the FTO flag); the integration cannot stall on it (the branch machinery ships; the posture renders); Operator-signed=false until the pen moves (LN5)",
    },
    b_lookupPerAxisDegrade: {
      rule: "the any-pool lookup degrades PER-AXIS, honestly — any covered pool gets a Reality Check where each axis renders on the data that genuinely exists (REAL★ / REAL-at-timestamp / SAMPLE / UNVERIFIED per axis); the walls run identically on looked-up subjects; a thin pool renders thin, never blank and never inflated; hostile/absent/garbage IDs → typed refusals, never a crash",
      notABiggerShelf: "breadth is a LOOKUP PATH into the existing Reality Check, NOT a bigger curated shelf (the conscious shelf stays; the screens stay the conscious 3 — the lookup is a path, not a fourth screen)",
    },
    c_twoTierProvenance: {
      rule: "provenance says WHICH KIND OF TRUE — REAL splits into REAL★ (block-pinned, chain-reproducible: RPC-STATE reads · Chainlink getRoundData · Envio events · governance/archive captures) vs REAL-at-timestamp (aggregator, re-fetchable+hashable but computed and RETROACTIVELY REVISABLE: DeFiLlama · GeckoTerminal · vaults.fyi — 'what the API said at time T'); the tier renders beside every stamp; conflating them is a Halt (S65)",
      relabelPass: "the existing REAL captures are consciously re-labeled by tier in one disclosed pass (governance/archive/RPC/Envio → REAL★; aggregator-sourced → REAL-at-timestamp); the old/new census disclosed; not a downgrade — the same truth, named precisely (the W-SO01 conscious-change pattern)",
    },
    d_censusOutcome: {
      rule: "the coverage census is an OUTCOME, recorded as measured, never gamed — the coverage hit-rate on real lookups; 'covered' is pinned (≥ the yield axis at REAL-at-timestamp or better); the census records the per-tier breakdown; NEVER a target that licenses hiding (a SAMPLE-thin lookup counted 'covered' is a Halt)",
      coveredDefinition: "a pool is COVERED iff it renders at least the yield-reality axis at REAL-at-timestamp tier or better (block-pinned counts; SAMPLE-only does NOT count as covered)",
    },
    priceLayer: {
      chainlinkSpec: "src/dataplane/providers/chainlink.ts — a pinned feed registry (asset → aggregator address per chain); readFeed(feed, block) = one eth_call getRoundData(roundId)/latestRoundData at the pinned block over the EXISTING RPC rotation; block-pinned → REAL★; free, commercially clean, no SDK",
      stalenessBound: "the read is STALE if updatedAt is not within the pinned bound of the pinned block's timestamp → degrade (GeckoTerminal REAL-at-timestamp → SAMPLE)",
      l2SequencerCheck: "the L2 Sequencer-Uptime-Feed check where the chain requires it (a sequencer-down window makes a fresh-looking answer unsafe → degrade)",
      pythRefusalVerbatim: PYTH_REFUSAL_VERBATIM,
    },
    vaultsFyi: "vaults.fyi enters as a BYOK-ONLY paid-DATA descriptor (NO free tier exists — $399/mo or PAYG) through the EXISTING X-CAPABILITY descriptor layer; paid DATA may deepen the facts (tier-stamped REAL-at-timestamp); absent → the free path is BYTE-EXACT; never a core dependency",
  },

  // ── X-CORRELATE — THE SUBSTRATE WITHOUT THE TRIGGER (the second law; five clauses) ──
  xCorrelate: {
    a_deterministic: {
      rule: "deterministic or nothing — Pearson on PINNED-aligned log-delta yield series; agglomerative average-linkage on the 1−ρ distance; a PINNED merge threshold; LEXICOGRAPHIC tie-breaking; canonical input ordering; K-MEANS AND SEEDED RANDOMNESS ARE PROHIBITED BY PIN AND GREP; permutation of inputs yields BYTE-IDENTICAL clusters (S66)",
      mergeThreshold: 0.5, // 1−ρ distance below which two clusters merge (ρ ≥ 0.5); PINNED — an edit moves the pins sha
      prohibited: ["kmeans", "k-means", "Math.random", "seeded init", "random init"],
    },
    b_minOverlapFloor: {
      rule: "thin overlap is INSUFFICIENT — a MinTRL-style MINIMUM-OVERLAP floor below which NO correlation renders (correlation on thin overlap is fabricated precision, a lie with decimals)",
      minOverlap: 30, // the minimum number of shared aligned points below which the answer is INSUFFICIENT; PINNED
    },
    c_factNotAdvice: {
      rule: "the fact is a fact, never advice — the COMPARE line is number-traced, info/context, its non-advisory wording pinned; the advice wall re-runs green on it; the Markowitz optimizer stays REJECTED",
      wordingVerbatim: DIVERSIFICATION_WORDING_VERBATIM,
    },
    d_deflationInert: {
      rule: "THE DEFLATION STAYS INERT — every Stamp output still carries familyN === 1; a seeded K-feed into ANY Stamp path is REFUSED by a biting wall; the substrate serves the RENDER, not the statistics",
      wall: "stamp_inert.test.ts asserts familyN===1 in every Stamp output path + a seeded K-feed → refused + the k-means/randomness grep wall over the analytics tree",
    },
    e_activationGate: {
      rule: "the activation is a FUTURE pen — K enters the Stamp only when the pinned trigger fires AND the Operator signs (D33 pre-designs that act); the proposer stays PARKED; building the substrate is not unparking it",
      gateVerbatim: K_ACTIVATION_GATE_VERBATIM,
      trigger: "≥ 20–50 trials/family from a real proposer",
    },
  },

  // ── GT1–GT5 — the Ground-Truth findings this sprint closes ──
  gt: {
    GT1: "the flagship governance wording is precise EVERYWHERE it renders — compound matched-and-collapsed; aave UNRESOLVED for a VERIFIED reason (impl in the 1967 slot → genuinely upgradeable); a wall fails any 'aave fixed / immutable' phrasing ('IMMUTABLE-PROVEN' must never read as 'aave fixed')",
    GT2: "the voc_proposer sidecar-flake asterisk DIES — the scipy sidecar tests get an explicit load-tolerant per-test timeout (the bun-test 5s budget was the cause; the runner already allows 120s), with the pinned rationale, so the two-clean-runs claim stands WITHOUT an environmental caveat",
    GT3: "IN2's checklist gains 'read compound's real-source findings in the Pro drawer — does impl-truth help a human?' (a human judges the Pro-drawered impl-truth)",
    GT4: "D30's countersign line gains the arms-for-a-future-subject note (zero current qualifiers — like D29, a low-cost pen)",
    GT5: "the invite package RE-LED with the PAID Network capture (the most legible proof of value the tool has produced — the artifact the demand probe opens with); the post-mortems + kill-criterion behind it",
  },

  // ── the deviations reserved this sprint (Operator-signed=false — LN5; the agent NEVER signs the gate) ──
  deviations: {
    D32: "RESERVED — the coverage scope + the license posture (verbatim) + the STANDING existing-use exposure + the dated Operator business action (branch α/β/γ status). Operator-signed=false.",
    D33: "RESERVED — the correlation-substrate scope + the deflation-INERT guarantee + the parked K-activation act (trigger ≥20–50 trials/family + the Operator's pen). Operator-signed=false.",
    operatorGatedNote: "D23–D33 present, D27 STILL FIRST under 'The Stamp is knowingly generous until D27 is signed'; the agent presents the whole gate, NEVER signs it (LN5); IN2/IN4/AF4 + the eleven countersigns + the push are OWED-OPERATOR-GATED.",
  },

  // ── the stress catalog grows S1–S63 (carried) → S64–S66 (new) — matching the GroundTruth carried-summary shape ──
  stressCatalog: {
    carried: "S1–S63 first-class, re-run in BOTH repos (the GroundTruth catalog + the Redesign surface walls — the voice/collapse/lineage walls now re-run on LOOKED-UP subjects too)",
    count: 66,
    S64: "coverage-license honesty — the posture verbatim + rendered; the γ SAMPLE-degrade control bites; the standing exposure recorded; vaults.fyi absent→byte-exact; the census matches the pinned 'covered' definition (a SAMPLE-only-counted lookup → fails it)",
    S65: "the REAL★ price layer + the tiers — block-pinned getRoundData reproduces ×2; staleness + L2-sequencer controls bite; no aggregator record wears REAL★; the re-label census complete + disclosed",
    S66: "the inert substrate — permutation-invariant byte-identical clustering; the k-means/randomness grep; the minimum-overlap INSUFFICIENT floor; the non-advisory wording exact + the advice wall green; the deflation-inert wall (familyN===1 everywhere; a seeded K-feed REFUSED); the D33 act parked with BOTH trigger and pen required",
  },

  // ── the constitution carried (byte-untouched; re-asserted for continuity) ──
  carried: {
    deps: ["hono", "zod"],
    screens: ["shelf", "reality-check", "ask"],
    frozenSevenNote: "the frozen seven + verdict-path 7 + frozen-core 2 byte-untouched; the scorecard differential + evidence bundle byte-identical at every gate (the gate's signed movers alone licensed)",
    verdictDifferential: { lendingFpSetShaPrefix: "70c7912f", fundingReproHashPrefix: "0a63151b", note: "byte-stable through eighteen sprints; the diversification fact is info/context OFF the scorecard path; the Stamp's familyN stays 1" },
    evidenceBundleShaPrefix: "9c1e7bd8",
    killCriterion: "8b4e094b",
    massPath: "hono+zod; DeFiLlama/Chainlink are plain HTTP/eth_call on the existing stack; vaults.fyi a descriptor; the correlation engine pure dependency-free TS",
    parkedByName: ["stablecoins-API peg harness", "dYdX cross-venue funding", "LRT-depeg axis", "RWA", "hacks/REKT post-mortem factory", "the proposer + ONC + PBO/CSCV activation", "reports/API", "execution/custody", "archive node", "calibration scoring", "options/prediction-markets", "Pyth (the dated cost cliff)"],
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const OUT = { ...PINS, pinsSha }
writeFileSync(path.join(H, "coverage-pins.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── COVERAGE — the sprint contracts pinned ──────────────────────")
console.log(`  carried from Redesign : ${CARRIED_FROM.slice(0, 16)}…  (which carried GroundTruth 3d0ef3bb…)`)
console.log(`  stress catalog        : S1–S${PINS.stressCatalog.count} (S64–S66 new)`)
console.log(`  COVERAGE PINS_SHA     : ${pinsSha}`)
console.log("written: data/honesty/coverage-pins.json")
