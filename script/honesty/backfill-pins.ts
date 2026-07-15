/**
 * ORGΛNON — THE BACKFILL SPRINT (V43), the pins builder. Builder Arc, sprint 13. Continues from the COMPLETE Provenance sprint
 * (V42) — audited MOSTLY ACHIEVED (top of band). carriedFromPinsSha = the TRUE Provenance head, READ FROM DISK (04c606dd),
 * with a throw-guard asserting provenance carries the Variant head (eb64cebe). The chain is a linked list of self-consistent
 * heads on disk — never the blueprint's prose (V42 proved the prose can carry a stale, shape-valid, identity-wrong head).
 *
 * THE DIAGNOSIS (graduated a third time): V42 taught the gate to check IDENTITY (S169) and then LEFT THE VERY SPLIT IT CURED
 * ALIVE in the sibling producer. batteryDelta now reads the full 1941 (M-3 cured) — but the `verify` sub-check named
 * `battery-count-matches-committed` STILL reports the CURATED 1281, in the same header that reads 1941 everywhere else
 * (N-1). And S172 brought `prev + added − removed === now` to the BATTERY but not to the CENSUS, whose demonstrated moved
 * 78→89 with the STATIC partition reconciled and the MOVEMENT merely asserted (N-2). The diagnosis is no longer "a wall checks
 * shape not truth" — it is "a FIX is applied to the producer that was NAMED and NOT to its SIBLING." The continuity discipline
 * EXISTS, it is CORRECT, and it is applied one producer at a time while its siblings drift.
 *
 * NO NEW LAW (an EIGHTH sprint). X-DERIVE already forbids this: a claim has a PRODUCER, and a producer must be TOTAL over its
 * domain, not a template you instantiate per-field and forget one. So V43 does not add a continuity wall — it GENERALIZES the
 * one that exists: a single Continuity.reconcile(countable, prevMarker) that EVERY cross-sprint countable routes through, and
 * the gate ENUMERATES the countables from a pinned registry AND diffs the whole marker against the last one, refusing the log
 * if any number moved without being reconciled or explicitly exempted (F-1/RP-1). The reconciler cannot be forgotten because
 * the gate counts the countables, not the diligence. And the last home of the 1281/1941 split is closed by making the verify
 * sub-check NAME what it actually measures (DD-82).
 *
 * AND THE MOAT'S SECOND STONE: the REAL★ engine (V42) captures FORWARD from today, one point per run, so the archive is
 * length-zero the day it is born and the false-fire own-leg is UNJUDGEABLE for 180 captures no matter what. The research named
 * the cure: Chainlink getRoundData(roundId) historical rounds give genuinely point-in-time HISTORY. GROUND TRUTH (probed live
 * before design, the sprint's own thesis applied to itself): Chainlink getRoundData IS reachable over the pinned public RPC (no
 * archive node — rounds are stored contract state), and — beating the blueprint's DD-83 hypothesis that "rates are not on
 * Chainlink" — there ARE genuinely RATE-SPACE Chainlink feeds: rETH/ETH exchange rate (desc "RETH / ETH", 18-dec, a unitless
 * redemption ratio whose slope IS the staking yield), reachable and deeply historical. So `organon.sh backfill` walks the
 * historical rounds of a RATE feed and chains them REAL-DERIVED — re-derivable at each round (getRoundData(roundId) reproduces
 * it forever), but third-party-sourced, a TIER between REAL★ (own live, block-pinned) and RETROSPECTIVE (revisable). The Aave
 * supply-rate subgraph was probed and is DEAD (hosted service decommissioned — F-4/RP-4 confirmed live), so Aave stays
 * forward-only, honestly. FRAX/USD is a PRICE feed — the S187 negative control (a price backfilled as a rate FAILS).
 *
 * This pins, BEFORE a byte of Phase code, every contract of V43. Hash-locked; deterministic; no network. F-1/RP-1: the pinsSha
 * field IS the Phase-0 anchor (a self-hash — sha256 of the file content minus the pinsSha field); S169 (carried) asserts the
 * emitted header pins-sha equals it AND the file is self-consistent (unedited after Phase 0).
 *
 * Run: bun run script/honesty/backfill-pins.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")

// ── the CARRIED-FORWARD Provenance head (V42 — the identity gate + the first REAL★ stone) ──
// READ FROM DISK, never typed. The carry is itself the sprint's first identity check (V42's lesson). The guard asserts the
// chain is what the sprint assumes: provenance(04c606dd) ← variant(eb64cebe) ← ship(c0777d9a) ← …
const PROVENANCE = JSON.parse(readFileSync(path.join(H, "provenance-pins.json"), "utf8"))
const CARRIED_FROM = PROVENANCE.pinsSha as string // 04c606dd… — the TRUE V42 head, read from the file, not the blueprint
if (PROVENANCE.carriedFromPinsSha?.slice(0, 8) !== "eb64cebe") throw new Error("provenance-pins.json does not carry from the Variant head eb64cebe — the chain is not what the sprint assumed; STOP and reconcile")

// ── DD-81 — THE COUNTABLE REGISTRY. Every number that moves sprint-to-sprint, each with its RECONCILIATION TYPE (F-4/RP-4:
// a ratio forced through an additive reconciler produces a false reconciles). ADDITIVE: prev + added − removed === now.
// PARTITION: Σ buckets === total, plus a MOVED map (inter-bucket transfers — the census's 78→89 is a transfer, not a delta
// from nowhere). DERIVED: recomputed from its inputs, not reconciled across time (a ratio). INVARIANT: must equal prev; a
// change REFUSES unless the registry consciously re-pins it (deps, screens, laws, exitKinds). ──
const COUNTABLE_REGISTRY = {
  rule: "DD-81/F-4: every cross-sprint COUNTABLE is enumerated here with its reconciliation TYPE, and EVERY countable routes through the ONE Continuity.reconcile(). The gate enumerates this registry and asserts each is reconciled this sprint (S181), AND diffs the whole marker against the previous marker and refuses the log if any number moved that is neither reconciled (a registered countable) nor explicitly exempted (F-1/RP-1). The registry is a convenience; the marker-diff is the guarantee — a number cannot move without being found, whether or not a human remembered to register it.",
  types: {
    ADDITIVE: "prev + added − removed === now (the battery pass/expect/files; the archive counts)",
    PARTITION: "Σ buckets === total, plus a MOVED map showing inter-bucket transfers (the census — its movement is a transfer, F-4/RP-4/N-2)",
    DERIVED: "recomputed from its inputs, NOT reconciled across time (a ratio — guardEfficacy); a moved DERIVED value is honest iff it recomputes from its inputs",
    INVARIANT: "must equal prev; a change REFUSES unless the registry consciously re-pins it (deps 2, screens 3, laws 17, exitKinds 7, battery.fail 0)",
  },
  countables: [
    { key: "battery.pass", type: "ADDITIVE", markerPath: "battery[0]", note: "the FULL battery pass count (Consistency.batteryFullDelta — prev + added − removed === now)" },
    { key: "battery.skip", type: "ADDITIVE", markerPath: "battery[1]", note: "env-gated skips (ask_live/eval_live) — additive, honest at any count" },
    { key: "battery.fail", type: "INVARIANT", markerPath: "battery[2]", note: "0 — any fail REFUSES the log" },
    { key: "battery.expect", type: "ADDITIVE", markerPath: "expect", note: "the assertion count — grows with new tests" },
    { key: "battery.files", type: "ADDITIVE", markerPath: "batteryDelta.files", note: "the test-file count — grows with new test files" },
    { key: "census", type: "PARTITION", markerPath: "census", note: "demonstrated + weak + exempt + originUnrecorded === total, with a MOVED map (N-2 — the movement is a transfer)" },
    { key: "deviations.count", type: "ADDITIVE", markerPath: "gate.deviationStates.length", note: "the machine-readable deviation count — grows with D87–D89 (S174 carried)" },
    { key: "ownArchive.realStar", type: "ADDITIVE", markerPath: "ownArchive.realStar", note: "the REAL★ own-capture count (block-pinned, own live)" },
    { key: "ownArchive.realDerived", type: "ADDITIVE", markerPath: "ownArchive.realDerived", note: "the REAL-DERIVED backfill count (third-party historical, re-derivable) — new this sprint" },
    { key: "ownArchive.retrospective", type: "ADDITIVE", markerPath: "ownArchive.retrospective", note: "the RETROSPECTIVE smoke-test count (revisable)" },
    { key: "ownArchive.humanCaptures", type: "INVARIANT", markerPath: "ownArchive.humanCaptures", note: "0 BY DESIGN — the agent cannot advance the HUMAN own-count (DD-79/S128 quarantine); the first HUMAN capture is the Operator's" },
    { key: "laws", type: "INVARIANT", markerPath: "laws.laws", note: "17 — a change is a new law (an EIGHTH sprint without one)" },
    { key: "deps", type: "INVARIANT", markerPath: "deps", note: "2 (hono, zod) — a mass-path dep REFUSES" },
    { key: "screens", type: "INVARIANT", markerPath: "screens", note: "3 (shelf, reality-check, ask)" },
    { key: "exitKinds", type: "INVARIANT", markerPath: "exitKinds", note: "7 — the algebra shipped; an eighth through the enum REFUSES" },
    { key: "guardEfficacy", type: "DERIVED", markerPath: "guardEfficacy.caught", note: "the mutation-testing ratio (caught/total) — recomputed from its inputs each sprint, NOT reconciled across time (F-4's canonical DERIVED example)" },
  ],
}

// ── THE PREVIOUS MARKER SNAPSHOT (V42 terminal countables) — the fixed point the F-1/RP-1 marker-diff runs against. Captured
// from the V42 tree (HEAD 0fe490f6) BEFORE a byte of V43 code: census {dem 89, weak 0, exempt 2, OU 79, total 170, reFounded
// 12}, battery 1941/2/0 · 294 files · 12693 expect, deviations 11, ownArchive {realStar 1 (AGENT), realDerived 0,
// retrospective 1, human 0}. A number that moves vs this snapshot must be reconciled or exempted, or the log is not written. ──
const PREV_MARKER = {
  sprint: "V42 (Provenance)",
  terminalCommit: "0fe490f6",
  countables: {
    "battery.pass": 1941, "battery.skip": 2, "battery.fail": 0, "battery.expect": 12693, "battery.files": 294,
    "census.demonstrated": 89, "census.weak": 0, "census.exempt": 2, "census.originUnrecorded": 79, "census.total": 170,
    "census.reFounded": 12,
    "deviations.count": 11,
    "ownArchive.realStar": 1, "ownArchive.realDerived": 0, "ownArchive.retrospective": 1, "ownArchive.humanCaptures": 0,
    laws: 17, deps: 2, screens: 3, exitKinds: 7,
  },
}

// ── DD-82 — THE VERIFY SUB-CHECK NAMES WHAT IT MEASURES. It compares the CURATED evidence subset (1281) to its committed copy
// — a real, useful invariant (the evidence bundle is stable), but NOT a check of the full battery. Rename it to state its
// domain; add the full-battery reconciliation to Continuity so the full number is checked too. A sub-check whose name implies a
// domain it does not check FAILS (S180). ──
const VERIFY_RENAME = {
  rule: "DD-82/N-1: the verify sub-check `battery-count-matches-committed` reads the CURATED 1281-subset, sitting in a header that reads 1941 everywhere else — consistent only because they measure different things, under a name that implies it matches THE battery. RENAME it `curated-evidence-subset-matches-committed` so the name states its domain; the FULL battery is reconciled through Continuity (Consistency.batteryFullDelta, S171/S172 carried). A sub-check whose name implies a domain it does not check FAILS (S180).",
  from: "battery-count-matches-committed",
  to: "curated-evidence-subset-matches-committed",
  domainRule: "Verify.subcheckDomain(name) → the domain the sub-check actually measures; a name that implies THE battery while checking the curated subset FAILS S180. The full battery is checked separately (Continuity).",
  historyNote: "the prior pins (socket-pins V37, ship-pins V40) describe the OLD name — those are HISTORICAL records, NOT rewritten (S182: history does not drift). The rename is a V43 act in verify.ts (code); a prior sprint's frozen pins file is untouched (its self-hash intact).",
}

// ── DD-84 — THE REAL-DERIVED TIER + THE LADDER. A backfilled point is re-derivable at its round (getRoundData(roundId)
// reproduces it forever) but THIRD-PARTY-sourced and historical — not captured live by ORGΛNON — so it is WEAKER than REAL★
// (own live, block-pinned) and STRONGER than RETROSPECTIVE (revisable). A REAL-DERIVED point mixed into a REAL★ chain FAILS
// (S185/S188); the false-fire own-leg counts REAL★ + REAL-DERIVED together ONLY if it LABELS the mix + the RATIO (F-2/RP-2). ──
const TIER_LADDER = {
  rule: "DD-84: the tier ladder is REAL★ > REAL-DERIVED > REAL@ts > RETROSPECTIVE, pinned. REAL★ = 'ORGΛNON captured this live at block B' (own, block-pinned). REAL-DERIVED = 'a third-party feed recorded this at round R, and it re-derives via getRoundData(roundId)' (third-party, round-pinned, re-derivable — NOT block-pinned live). REAL@ts = timestamped, not block-pinned. RETROSPECTIVE = revisable provider chart. A cross-tier chain FAILS (S188); a false-fire count over a mixed series LABELS the mix AND the ratio (F-2/RP-2: '503 points: 3 REAL★ (0.6%), 500 REAL-DERIVED (99.4%) — predominantly third-party historical, re-derivable but not self-captured'). It is not laundering; it is a named, weaker, still-re-derivable tier — and a falsifier that refused all history until it captured 180 days itself would be useless for 180 days.",
  ladder: ["REAL★", "REAL-DERIVED", "REAL@ts", "RETROSPECTIVE"],
  realDerived: {
    definition: "re-derivable at its round (getRoundData(roundId) on the pinned feed reproduces the answer forever — rounds are immutable once written), but third-party-sourced and historical, NOT ORGΛNON's own live capture. Weaker than REAL★, stronger than RETROSPECTIVE.",
    reDerivability: "the ROUND (roundId) is the anchor — stronger than a block (immutable), point-in-time via the round's updatedAt. Re-derivability is a property of the pinned {feedAddress, roundId, answer}, NOT of the current RPC (F-5/RP-5): the log states 're-derivable via getRoundData(roundId) on feed F — the round is finalized and immutable; not guaranteed against a feed that is decommissioned'.",
  },
}

// ── DD-83 — THE BACKFILL SOURCE MAP PER SUBJECT (probed LIVE before design; ground truth beat the blueprint's DD-83
// hypothesis). A backfill claiming depth it cannot reach FAILS. A price feed sourced as a rate FAILS (S187). ──
const SOURCE_MAP = {
  rule: "DD-83/RP-3: the source per subject is stated, and the observable TYPE of the source must match the subject's observable (S187 — a price feed backfilled as a rate FAILS). Probed live over the pinned public RPC rotation before design.",
  subjects: {
    "reth-eth-exchange-rate": {
      source: "Chainlink getRoundData", feed: "0x536218f9E9Eb48863970252233c8F271f554C2d0", description: "RETH / ETH", observableType: "exchange-rate",
      note: "GROUND TRUTH (beating DD-83's 'rates are not on Chainlink' hypothesis): rETH/ETH IS a genuinely rate-space Chainlink feed — a unitless redemption ratio (rETH per ETH, 18-dec) whose slope IS the RocketPool staking yield. getRoundData IS reachable over the pinned public RPC (no archive node — rounds are stored contract state); phaseId 2, deeply historical. REAL-DERIVED, re-derivable at each round.",
      decimals: 18, decodeWord: 1, updatedAtWord: 3, tier: "REAL-DERIVED",
    },
    "aave-v3-usdc-supply": {
      source: "forward-only", feed: null, observableType: "rate",
      note: "GROUND TRUTH (F-4/RP-4 confirmed live): the Aave supply rate is NOT on Chainlink (it lives in the Pool's getReserveData), and the Aave hosted subgraph is DECOMMISSIONED (api.thegraph.com UNREACHABLE; the decentralized network needs an API key). So NO REAL-DERIVED historical source is reachable — the subject stays FORWARD-ONLY (REAL★ live capture, V42), backfill depth honestly UNREACHABLE, never faked. This is the REAL★ subject; its backfill is stated UNREACHABLE, not chained.",
    },
    "frax-usd-price": {
      source: "Chainlink getRoundData", feed: "0xB9E1E3A9feFF48998E45Fa90847ed4D467E8BcfD", description: "FRAX / USD", observableType: "price",
      note: "THE S187 NEGATIVE CONTROL: FRAX/USD is a PRICE feed (a USD valuation), reachable via getRoundData. It is NOT a subject in the moat (the fence forbids valuation/USD) — it exists ONLY as the seeded negative that S187 REJECTS: a price feed backfilled into a RATE subject's series FAILS (the observable types do not match). A price fed as a rate cannot be chained.",
    },
  },
}

// ── DD-86 — THE RE-DERIVABILITY RULE. A REAL-DERIVED observation records {feedAddress, feedCodeHash, phaseId,
// aggregatorRoundId, roundId, answer, decoded, decimals, updatedAt, observableType, tier:'REAL-DERIVED', prevHash, sha}. The
// plausibility gate is STRUCTURAL-only (carried from V42/RP-3): an economically-extreme historical round — a depeg, a rate
// spike — is CHAINED, garbage rejected. A point that does not re-derive is REJECTED, not chained. ──
const RE_DERIVABILITY = {
  rule: "DD-86: a REAL-DERIVED point's authority is RE-DERIVABILITY at its round — getRoundData(roundId) on the pinned feed reproduces the answer. A point that does not re-derive (a garbage decode, a mis-sliced word, a non-finite value) is REJECTED, NOT chained (S185). The plausibility gate is STRUCTURAL-only (carried from V42/RP-3): the gate tests the ENCODING, never the ECONOMICS — an economically-extreme historical round (a depeg, a rate spike) is CHAINED; a 1.7e308 word or an address mis-slice is rejected.",
  observationFields: ["feedAddress", "feedCodeHash", "phaseId", "aggregatorRoundId", "roundId", "answer", "decoded", "decimals", "updatedAt", "startedAt", "answeredInRound", "observableType", "tier", "providerAtCapture", "capturedAt", "prevHash", "sha"],
  phaseTransition: "F-3/RP-3: Chainlink round IDs encode phaseId in the high 16 bytes (roundId = (phaseId << 64) | aggregatorRoundId). When an aggregator is upgraded the phase increments and round IDs jump discontinuously; a naive roundId-- loop hits a phase boundary, gets a revert/zero, and SILENTLY truncates. The walker decomposes roundId into (phaseId, aggregatorRoundId), walks each phase's aggregator rounds, and crosses phase boundaries DELIBERATELY. The reachable depth is stated PER PHASE — a truncation is visible, not hidden. A backfill that stops at a phase boundary and claims completeness FAILS.",
}

// ── DD-85 — BACKFILL ADDS NO MASS-PATH DEPENDENCY. Same architecture as Observe.capture: pinned RPC over fetch, hand-encoded
// getRoundData eth_call (the selector is public; the decode is the round struct). Deps stay 2. ──
const NO_DEP = {
  rule: "DD-85: backfill adds NO mass-path dependency. The walker reads a pinned RPC over fetch (PlaneRpcState.jsonRpc + ROTATION) with a HAND-ENCODED getRoundData(uint80) eth_call (selector 0x9a6fc8f5, arg the roundId left-padded to a 32-byte word — no ethers/viem/web3/graph-client). The round struct is decoded by 64-hex word slicing + BigInt. The chain is hash-chained JSONL. Deps stay 2. A seeded ethers/viem/web3/graph-client import on the mass path FAILS (S186).",
  deps: 2,
  selector: "0x9a6fc8f5", // getRoundData(uint80)
}

// ── DD-87 — DOES BACKFILL LIGHT ANYTHING OR MOVE A VERDICT? NO. Backfill grows the archive; the deflation meter stays DARK
// (D63); familyN === 1; the bundle stays byte-identical. The false-fire own-leg can now be JUDGEABLE (if backfill reaches the
// 180-point floor) — but it renders a COUNT with its tier mix, never a verdict, never a suggested threshold (S145 carried). ──
const CAPABILITY_ISOLATION = {
  rule: "DD-87/N-4: backfill grows the archive and MOVES NO VERDICT — the deflation meter stays DARK (D63 OFF), familyN === 1, the scorecard bundle 9c1e7bd8 stays byte-identical. The capability→verdict-isolation invariant is RENDERED and CHECKED (S183), not merely IMPLIED by the bundle hash: the capture/backfill engines import nothing from the verdict path and no verdict-path module imports them. The false-fire own-leg renders a COUNT with its tier mix + ratio, never a verdict, never a suggested threshold (S145 carried). A backfill that lights the meter or moves a Stamp FAILS.",
}

const PINS = {
  protocol: "backfill-pins",
  sprint:
    "THE BACKFILL SPRINT (V43): the cure survived inside the disease. V42 taught the gate to check IDENTITY (S169) and then left the very split it cured alive in the sibling producer — batteryDelta now reads the full 1941, but the verify sub-check named `battery-count-matches-committed` STILL reports the CURATED 1281, in the same header that reads 1941 everywhere else (N-1); and S172 brought `prev + added − removed === now` to the BATTERY but NOT to the CENSUS, whose demonstrated moved 78→89 with the STATIC partition reconciled and the MOVEMENT merely asserted (N-2) — the exact L-1/M-5 shape a THIRD time. The diagnosis has graduated: not 'a wall checks shape not truth' but 'a FIX is applied to the producer that was NAMED and NOT to its SIBLING' — the continuity discipline EXISTS, is CORRECT, and is applied one producer at a time while its siblings drift. STILL NO NEW LAW (an EIGHTH sprint), because X-DERIVE already demands it: a claim's producer must be TOTAL over its domain, not a template you instantiate per-field and forget one. So V43 does not add a continuity wall — it GENERALIZES the one that exists: a single Continuity.reconcile(countable, prevMarker) that EVERY cross-sprint countable routes through, and the gate ENUMERATES a pinned countable registry AND diffs the whole marker against the last one, refusing the log if any number moved that is neither reconciled nor explicitly exempted (F-1/RP-1) — the reconciler cannot be forgotten because the gate counts the countables, not the diligence. The last home of the 1281/1941 split is closed by making the verify sub-check NAME what it measures (curated-evidence-subset, DD-82). AND THE MOAT'S SECOND STONE: the REAL★ engine (V42) captures forward, one point per run, so the archive is length-zero the day it is born — so `organon.sh backfill` walks the historical rounds of a RATE feed (Chainlink getRoundData) and chains them REAL-DERIVED: re-derivable at each round but third-party-sourced, a TIER between REAL★ and RETROSPECTIVE. GROUND TRUTH beat the blueprint's DD-83 (probed live before design): Chainlink getRoundData IS reachable (no archive node — rounds are stored state), and rETH/ETH IS a genuinely rate-space Chainlink feed (a redemption ratio whose slope is the staking yield); the Aave supply-rate subgraph is DEAD (F-4/RP-4 confirmed live), so Aave stays forward-only, honestly; FRAX/USD is a PRICE feed, the S187 negative control. The whole Operator gate D23–D89, D27 STILL FIRST (the EIGHTEENTH sprint).",
  at: "2026-07-15",
  continues:
    "THE PROVENANCE SPRINT (V42) — battery 1941/2/0 across 294 files / 12693 expect() (two runs identical + clone from zero), verify exit 0 with three sub-checks, the IDENTITY-hardened SHIP GATE holds (the emitted pins-sha equals sha256 of this sprint's own pins file — it caught the blueprint's own stale-pin error), the REAL★ capture engine landed (block-pinned re-derivable observations; a −42% funding value CHAINED, garbage rejected), frozen 0 drift, bundle 9c1e7bd8 byte-identical (no verdict moved since Alpha), deps 2, screens 3, exit kinds 7, familyN 1, 17 laws / 0 minted for SEVEN sprints; census MILESTONE demonstrated 89 > originUnrecorded 79; D51 ANSWERED (INSTRUMENT), D33 SIGNABLE (note carried:{from:V39,reverified:true}) unsigned, D63 OFF, ownCaptures 0 (HUMAN), D27 STILL FIRST (the seventeenth sprint). Audited MOSTLY ACHIEVED (top of band) — four findings (N-1 verify split, N-2 census movement, N-3 redesignSearchHashes drift, N-4 capability isolation) carried and cured here.",
  carriedFromPinsSha: CARRIED_FROM, // the Provenance head (04c606dd) — READ FROM DISK, the sprint's first identity check
  chain: `${CARRIED_FROM.slice(0, 8)} (Provenance) ← eb64cebe (Variant) ← c0777d9a (Ship) ← 2c299b9e (Family) ← 153628a9 (Substance) ← ab4900ee (Socket) ← 257684c0 (Derive) ← 8c80367a (Reach) ← 07d27f81 (Show) ← 96469dbb (Reckon) ← d90df3c7 (Cadence) ← 98a44bd8 (Manifest) ← 2b1dd373 (Domain) ← cc08a77b (Coverage) ← 6b285eba (Redesign) ← 3d0ef3bb (GroundTruth)`,
  chainProvenanceNote: "the carried head is READ FROM provenance-pins.json ON DISK (04c606dd), not typed from the blueprint's prose — V42's lesson, carried. The ground-truth chain is the linked list of self-consistent heads: provenance(04c606dd) ← variant(eb64cebe) ← ship(c0777d9a) ← family(2c299b9e) ← …",

  // ── NO NEW LAW — an EIGHTH sprint running (V36's PART F pinned it; V37–V42 honored it) ──
  noNewLaw: {
    rule: "SEVENTEEN laws stand; ZERO minted this sprint (the eighth running). The V42 findings are the SAME law UNDER-APPLIED, one meta-level up: X-DERIVE already demands a producer be TOTAL over its domain, not instantiated per-field and forgotten one. The continuity discipline that reconciled the battery was CORRECT and NOT TOTAL — it reconciled the countable it was pointed at and left the census, the verify sub-check, and the deviations to be reconciled by hand, and hand-application is exactly what drifts. The fix is not another wall — it is to make the existing discipline ENUMERABLE and UN-FORGETTABLE: one reconciler, every countable routed, the gate refusing the log if any number moved unrouted. The moat is not extended by a law; it is extended by a backfill walker pointed at historical rounds instead of the latest block.",
    laws: 17,
    minted: 0,
    sprintsWithoutALaw: 8,
    theTotalityClause: {
      xDeriveTotality: "X-DERIVE — a claim has a PRODUCER (X-DERIVE(b)), and a producer must be TOTAL over its domain: the continuity reconciliation is a producer of the claim 'this number reconciles across the boundary', and a producer applied to the battery but not the census is not total. → PHASE 1 (S181: one Continuity.reconcile, a pinned registry, the gate diffs the whole marker and refuses any unrouted moved number).",
      verifyNaming: "X-REACH(a) / X-DERIVE(d) — a sub-check whose NAME implies a domain it does not check cannot fail where the name promises. `battery-count-matches-committed` checks the curated 1281-subset while its name implies THE battery. → PHASE 1 (S180: the sub-check names its domain; the full battery is reconciled through Continuity).",
      historicalDrift: "X-RECKON / X-SHOWN(c) — a fixed historical act's hash is stable or explicitly carried; redesignSearchHashes drifted (a578032b→d5147f8d) untagged. → PHASE 1/2 (S182: HistoricalAct.hash — stable or carried:{from}).",
    },
  },

  // ── THE FRAME ──
  frame: {
    d51: "ANSWERED = INSTRUMENT (V38-B). V40 was the first FULLY-ACHIEVED sprint in ten; V41/V42 built the Variant Ledger and the identity gate + REAL★ stone, each audited MOSTLY ACHIEVED. This sprint is TWO things: (1) it makes the continuity discipline TOTAL so the record cannot drift a number past the gate one producer at a time, and (2) it lays the moat's SECOND stone — an on-chain point-in-time backfill that turns a length-zero REAL★ archive into a real REAL-DERIVED series the falsifier can replay its own kill-criteria over.",
    thesis: "ORGΛNON is a strategy FALSIFIER whose moat is CONTENT-HASHED PROVENANCE. The gate that writes the record must reconcile EVERY cross-sprint number through ONE reconciler (a discipline you can forget to apply is not a discipline), and the yield history the falsifier deflates on must be deep enough to replay a kill-criterion — so a tier between REAL★ and RETROSPECTIVE (re-derivable third-party history) bootstraps the archive the day it is born.",
    reachableHumans: 1,
    reachableHumansNote: "reachableHumans: 1 is BY DESIGN under D51 (carried). realLineageCount: 0 — the door has never been opened. ownCaptures (HUMAN): 0 — the Operator has never run the verb. Backfill makes the own-leg JUDGEABLE (the archive can now have depth) — but a deep archive of a kill-criterion NO ONE HAS AUTHORED is a false-fire count with nothing to count. V43 makes the room behind the door deeper; it cannot open it.",
  },

  // ── THE V42 EXECUTION-AUDIT FINDINGS — every one carried by name, with its V43 disposition ──
  auditFindings: {
    N1: "THE `verify` SUB-CHECK STILL READS THE CURATED 1281 — the last home of the split M-3 exposed. `battery-count-matches-committed: 'curated 1281 == committed 1281'` sits in a header that reads 1941 everywhere else; consistent only because they measure different things, under a name that implies it matches THE battery. → PHASE 1 — S180: the verify sub-check NAMES what it measures (curated-evidence-subset), and the full battery is reconciled through Continuity. Never sheds.",
    N2: "THE CENSUS MOVEMENT (78→89, +11; total +12) IS ASSERTED, NOT RECONCILED. S172 brought prev + Δ === now to the BATTERY; the census got only its STATIC partition (S173). The continuity discipline was applied to one countable and not its sibling. → PHASE 1 — the GENERAL reconciler (S181), and the census reconciled as a PARTITION with a MOVED map (F-4/RP-4: the +11 is a bucket TRANSFER, not a delta from nowhere). Never sheds. The sprint's spine.",
    N3: "`redesignSearchHashes` CHANGED (a578032b→d5147f8d) for a supposedly-fixed historical search, untagged. A carried historical act whose hash moved without a `carried` tag — the one carried hash that drifted in the sprint about carried-claim identity. → PHASE 1/2 — S182: a historical act's hash is stable-or-carried (HistoricalAct.hash).",
    N4: "'CAPTURES MOVE NO VERDICT' RESTS ON THE BUNDLE HASH, not an explicit wall. newProductCapability: 1 was declared honestly, but the invariant that the capture engine touches no verdict path is only IMPLIED by 9c1e7bd8 byte-identity. → PHASE 1 — S183: the capability→verdict-isolation invariant, rendered and checked.",
    N5: "MR13 — eighth sprint, still only 'recorded'. → Phase 0 — discharge or formally close (it turns on the Operator opening the tool; realLineageCount 0).",
    N6: "THE REAL★ ARCHIVE IS BORN LENGTH-ZERO. V42's engine captures forward, one point per run; the false-fire own-leg is UNJUDGEABLE for 180 captures no matter what. The research named the cure: Chainlink getRoundData historical rounds give genuinely point-in-time HISTORY. → PHASES 3–5 — the on-chain backfill engine. Never sheds. The moat's second stone.",
  },

  // ── PART CLEAN — the pure functions, each with a seeded negative and a mint-time origin (S108, ENFORCED AT SHIP) ──
  partClean: {
    rule: "pure functions, each with a seeded negative and a mint-time origin enforced AT SHIP (S108/S155); deps 2, screens 3, familyN === 1, no daemon, no law. Every artifact passes the identity-hardened, now continuity-total Ship Gate or the build log is not written.",
    producers: {
      "Continuity.reconcile": "(countable, nowValue, prevValue, extra?) → {key, type, prev, delta, now, reconciles, moved?, contradiction?} — the ONE reconciler; typed ADDITIVE/PARTITION/DERIVED/INVARIANT (F-4/RP-4). Every countable routes through it. A countable reconciled with the wrong type FAILS.",
      "Continuity.registry": "() → Countable[] — the pinned enumeration (from backfill-pins.json). The gate asserts each is reconciled this sprint (S181).",
      "Continuity.markerDiff": "(nowSnapshot, prevSnapshot, registry) → {reconciled, exempt, unclassified} — F-1/RP-1: every changed number is a registered countable (reconciled) or explicitly exempted; an UNCLASSIFIED changed number REFUSES the log. The registry is a convenience; the diff is the guarantee.",
      "Verify.subcheckDomain": "(name) → domain — a sub-check names what it measures; a domain-implying name that checks less FAILS (S180).",
      "HistoricalAct.hash": "(act) → {stable} | {carried:{from}} — a fixed historical act's hash is stable or tagged carried; a drift without a tag FAILS (S182).",
      "Backfill.round": "(feed, roundId, input) → REAL-DERIVED{roundId, phaseId, aggregatorRoundId, updatedAt, answer, decoded, prevHash} | REJECT{reason} — re-derivable at the round or not chained (S184/S185); STRUCTURAL-only plausibility (carried from V42).",
      "Backfill.walk": "(feed, fromRound, count, fetcher) → {points, reachableByPhase, truncatedAt} — crosses phase boundaries deliberately (F-3/RP-3); the reachable depth is stated per phase.",
      "Tier.ladder": "() → [REAL★, REAL-DERIVED, REAL@ts, RETROSPECTIVE] — a mix is labeled + ratio'd; a cross-tier chain FAILS (S188); a price-feed-as-rate FAILS (S187).",
      "Capture.ownArchive": "() → {realStar, realDerived, ratio, dominantTier, judgeable, render} — the own-leg counts REAL★ + REAL-DERIVED with the mix + ratio labeled and the confidence capped by the weakest dominant tier (F-2/RP-2); UNJUDGEABLE below the floor (S189).",
    },
  },

  // ── THE DELEGATED-DECISION REGISTER — Claude Code decides, documents, proceeds ──
  delegatedDecisions: {
    DD81: COUNTABLE_REGISTRY,
    DD82: VERIFY_RENAME,
    DD83: SOURCE_MAP,
    DD84: TIER_LADDER,
    DD85: NO_DEP,
    DD86: RE_DERIVABILITY,
    DD87: CAPABILITY_ISOLATION,
  },

  // ── THE FENCE — refused this sprint, by name ──
  fence: {
    refused: [
      "valuation / USD (rate-space only; the research confirmed it — rETH/ETH is a same-asset redemption ratio, NOT a USD price; FRAX/USD is the negative control, never a subject)",
      "any mass-path dependency (deps stay 2; backfill is fetch + hand-encoded getRoundData; no ethers/viem/web3/graph-client)",
      "the deflation METER lit (D63 OFF) · the Proposer (D62-R Option A) · any ranking/best/recommend/'diversify'",
      "the Adversary (after the first REAL lineage) · the post-mortem · D38",
      "any daemon / cron / scheduler / service / port / listener (backfill and capture are VERBS)",
      "a hosted tier · reports/API-as-product · execution / custody / wallets · Markowitz / any optimizer",
      "the Merkle layer (DEAD, D74) · marketplace / leaderboard",
      "a second law (seventeen; EIGHT sprints)",
      "MIXING TIERS (REAL-DERIVED into REAL★, RETROSPECTIVE into either — the cardinal provenance sin, S185/S188)",
      "an eighth exit kind through the enum (the algebra shipped)",
      "backfilling a value that is not re-derivable at its round (an un-re-derivable point is RETROSPECTIVE, not REAL-DERIVED, and says so — S185)",
      "backfilling a PRICE feed as a RATE (the observable must match the source — S187)",
    ],
  },

  // ── PHASE 1 — CONTINUITY, MADE TOTAL (S180–S183) — NEVER SHEDS. The sprint's spine. ──
  phase1_continuityTotal: {
    s180: "DD-82/N-1 — the verify sub-check renamed to state its domain (curated-evidence-subset-matches-committed), and the FULL battery reconciled through Continuity. Verify.subcheckDomain(name) → the domain; a domain-implying name that checks less FAILS. The last home of the 1281/1941 split closed.",
    s181: "DD-81 — Continuity.reconcile(); the pinned countable registry; EVERY countable routed; the gate ENUMERATES the registry and REFUSES the log if any registered countable is unreconciled, OR if any number moved vs the prev marker that is not in the registry and not exempted (F-1/RP-1 — the reconciler cannot be forgotten because the gate counts the countables). Proven on the emit path: a seeded moved-but-unrouted countable → no log.",
    s182: "N-3 — HistoricalAct.hash: a historical act's hash (redesignSearchHashes) is stable or carried:{from}. A drift without a tag FAILS.",
    s183: "N-4 — the capability→verdict-isolation invariant rendered and checked: the capture/backfill engines import nothing from the verdict path and no verdict-path module imports them (asserted, not merely implied by the bundle hash).",
    rp1: "F-1/RP-1 (CRITICAL): the countable registry is hand-maintained, and a hand-maintained list of things-that-must-be-automatic is the exact defect relocated. So the gate does not ONLY check the registry — it DIFFS the full marker against the previous marker (PREV_MARKER, pinned Phase 0) and asserts EVERY numeric field that changed is either in the registry (and reconciled) or explicitly marked derived-not-countable with a reason. An unclassified changed number REFUSES the log. The registry is a convenience; the diff is the guarantee.",
    rp4: "F-4/RP-4 (blocking): Continuity.reconcile is TYPED per countable — ADDITIVE (prev + added − removed === now), PARTITION (Σ buckets === total plus a MOVED map — the census), DERIVED (a ratio recomputed from its inputs, not reconciled across time — guardEfficacy), INVARIANT (must equal prev). The registry declares each countable's type; a countable reconciled with the wrong type FAILS. The census's 78→89 is a bucket TRANSFER (originUnrecorded → demonstrated + new walls), shown as a transfer, not a delta from nowhere — the actual fix for N-2.",
  },

  // ── PHASE 2 — THE CARRIED / HISTORICAL AUDIT (S182 applied) — SHEDS SECOND ──
  phase2_carriedHistoricalAudit: {
    rule: "walk every historical act and carried field; each is stable-hashed or carried:{from,why,reverified}; the redesignSearchHashes drift closed (its serialization pinned so a fixed act yields a fixed hash). Every carried field is RE-VERIFIED, not trusted (S170 carried).",
    auditTable: "the per-field COMPUTED/CARRIED/HISTORICAL audit is a committed artifact (data/honesty/carried-audit.json), each carried/historical field naming {from, why, reverified/stable, inputs}. A seeded drifting historical hash REFUSES the log.",
  },

  // ── PHASE 3 — THE ON-CHAIN BACKFILL ENGINE (S184–S186, D88, D89) — NEVER SHEDS. The moat's second stone. ──
  phase3_backfillEngine: {
    rule: "DD-83/85/86 — Backfill.round walks a rate feed's HISTORICAL rounds (Chainlink getRoundData where a rate feed exists — rETH/ETH; forward-only where none reaches — Aave) over a pinned RPC via fetch with hand-encoded getRoundData (no ethers/viem/graph-client; deps stay 2, S186). Each point {roundId, phaseId, aggregatorRoundId, updatedAt, answer, decoded, feedAddress, feedCodeHash, observableType, prevHash, sha}, content-hashed, chained, tier REAL-DERIVED, re-derivable at its round (S184). Structural-only plausibility (carried from V42): an economically-extreme historical round is CHAINED, garbage rejected. A point that does not re-derive is REJECTED, not chained (S185). A known-answer at a pinned round validates.",
    s184: "a REAL-DERIVED point is re-derivable at its round (getRoundData(roundId) reproduces its answer); a point that is not re-derivable is REJECTED, not chained. Seeded negative: a garbage/mis-sliced decode → REJECT. (W-BF05)",
    s185: "tiers never mix; a REAL-DERIVED point in a REAL★ chain, or a RETROSPECTIVE in either, FAILS. Seeded negative: a REAL-DERIVED spliced into the REAL★ chain → REFUSE. (W-BF06)",
    s186: "backfill adds no mass-path dep (a seeded ethers/viem/web3/graph-client import FAILS); deps 2; hand-encoded getRoundData(uint80) selector 0x9a6fc8f5. Seeded negative: a grep for an ABI/graph library on the mass path → Halt. (W-BF07)",
    d88: "RESERVED — THE ON-CHAIN BACKFILL ENGINE: Chainlink getRoundData historical rounds chained REAL-DERIVED over fetch + hand-encoded eth_call; phase transitions crossed deliberately; deps stay 2; no daemon. Operator-signed=false.",
    d89: "RESERVED — THE REAL-DERIVED TIER: re-derivable at the round, third-party-sourced, weaker than REAL★ and stronger than RETROSPECTIVE; the ladder pinned; a cross-tier chain FAILS. Operator-signed=false.",
    rp3: "F-3/RP-3 (blocking): the walker handles phase transitions explicitly — decompose roundId into (phaseId, aggregatorRoundId), walk each phase's aggregator rounds, cross phase boundaries deliberately. A backfill that stops at a phase boundary and claims completeness FAILS; the reachable depth is stated PER PHASE so a truncation is visible.",
    rp5: "F-5/RP-5: re-derivability is a property of the pinned {feedAddress, roundId, answer}, not the current RPC — the observation stores enough that re-derivation is possible via getRoundData(roundId) against any node that serves the feed; the log states 're-derivable via getRoundData(roundId) on feed F; the round is finalized/immutable; not guaranteed against a decommissioned feed'.",
  },

  // ── PHASE 4 — THE TIER LADDER & MIX-LABELING (S187, S188) — NEVER SHEDS ──
  phase4_tierLadder: {
    rule: "DD-84 — the ladder REAL★ > REAL-DERIVED > REAL@ts > RETROSPECTIVE, pinned. A REAL-DERIVED point in a REAL★ chain FAILS; a RETROSPECTIVE in either FAILS (S188). The false-fire own-leg counts REAL★ + REAL-DERIVED together ONLY with the mix + ratio labeled (F-2/RP-2).",
    s187: "RP-3 — a source feed's TYPE matches the observable: a price feed backfilled as a rate FAILS. rETH/ETH (exchange-rate) into a rate subject PASSES; FRAX/USD (price) into a rate subject FAILS. Seeded negative: a price-typed feed chained as a rate → REJECT. (W-BF08)",
    s188: "the tier ladder is enforced and pinned; a REAL-DERIVED-in-REAL★ or RETROSPECTIVE-in-either FAILS; DeFiLlama still RETROSPECTIVE-only. Seeded negative: a cross-tier splice → REFUSE. (W-BF09)",
    rp2: "F-2/RP-2 (blocking): the false-fire count and the archive summary ALWAYS render the tier RATIO, not just the mix ('503 points: 3 REAL★ (0.6%), 500 REAL-DERIVED (99.4%)'), and the own-leg's confidence is explicitly capped by its weakest dominant tier: a series that is >50% REAL-DERIVED is labeled 'predominantly third-party historical — re-derivable, but not self-captured'. The Operator must never mistake a backfilled series for the self-captured moat.",
  },

  // ── PHASE 5 — THE OWN-LEG, NOW POSSIBLY JUDGEABLE (S189) — SHEDS FIRST ──
  phase5_ownLeg: {
    rule: "DD-87 — with backfill reaching depth, the false-fire own-leg can cross the 180-point floor and renders a COUNT with its tier mix + ratio, never a verdict, never a suggested threshold (S145 carried). Below the floor it stays UNJUDGEABLE and says how many points remain. `organon.sh backfill` renders 'reached N historical points; M to a judgeable own-count' — an invitation, not a schedule; no scheduler (S160 carried).",
    s189: "the own-leg renders a COUNT with its tier mix + ratio; the UNJUDGEABLE floor holds below 180 (honest at every length); the meter stays dark (D63); the bundle byte-identical (no verdict moved). Seeded negative: an own-count that claims judgeable below the floor, or a hidden tier ratio → Halt. (W-BF10)",
    rp6: "F-6/RP-6: realLineageCount 0 — the archive can now have real depth via backfill, but a deep archive of a kill-criterion the Operator never authored is a false-fire count with nothing to count. Backfill makes the own-leg judgeable; it does not make a manifest exist. The tool can replay a criterion over real history the moment one is written — and one has never been written.",
  },

  // ── PART A′ — THE ADVERSARIAL VALIDATION RECORD (this plan, attacked before design) ──
  adversarialRecord_partA: {
    A1_reconcilerHasTheDefectsShape: "'The general reconciler is itself a producer applied per-countable — you'll route the battery and the census and forget ownCaptures, exactly like V42 forgot the census. The fix has the same failure mode as the defect.' THE FATAL RECURSION, the FOURTH time this arc has faced the shape of it. It must be answered by ENUMERATION, not diligence. The gate does not trust that every countable was routed — it ENUMERATES a pinned countable registry AND diffs the marker against the prev marker for any changed number not covered (S181/F-1/RP-1). A countable in the registry with no reconciliation record, OR a moved-but-unregistered number, REFUSES the log. Proven on the emit path: seed a moved-but-unrouted countable → no log. The reconciler cannot be forgotten because the gate counts the countables, not the diligence.",
    A2_realDerivedLaundersThirdParty: "'REAL-DERIVED is a tier invented to launder third-party data into the moat. You spent V42 proving REAL★ is authoritative by SELF-capture; now you're admitting third-party history and calling it almost-as-good.' Lands hard. REAL-DERIVED is explicitly WEAKER than REAL★ and the ladder says so (DD-84). Its authority is RE-DERIVABILITY at the round — anyone can getRoundData(roundId) and reproduce it — NOT ORGΛNON's word. The distinction is preserved forever: REAL★ = 'ORGΛNON captured this live at block B'; REAL-DERIVED = 'a third-party feed recorded this at round R, and it re-derives'. A false-fire count over a mixed series LABELS the mix + the RATIO (F-2/RP-2). It is not laundering; it is a named, weaker, still-re-derivable tier — and a falsifier that refused all history until it captured 180 days itself would be useless for 180 days.",
    A3_chainlinkIsPriceNotRate: "'Chainlink feeds are PRICE feeds, not RATE feeds. Aave's supply rate is not on Chainlink. You'll backfill prices and pretend they're the rate-space history you need.' THE SHARPEST TECHNICAL ATTACK, and it is LARGELY correct — but ground truth (probed live) refined it. Most rate-space observables ARE off Chainlink (Aave supply rate lives in the Pool; the subgraph is DEAD), so Aave stays forward-only, honestly. But there ARE genuinely rate-space Chainlink feeds: rETH/ETH is a unitless redemption RATIO (18-dec) whose slope IS the staking yield — NOT a USD price — and getRoundData walks its real history. The source per subject is stated (DD-83); the observable TYPE is checked (S187: a price feed backfilled as a rate FAILS — FRAX/USD is the negative control). The tier is only as good as the source matching the observable.",
    A4_prunedSubgraphShallowHistory: "'The Graph time-travel needs prune:never, and public subgraphs use prune:auto. You'll query a pruned subgraph, get shallow or wrong history, and chain it as REAL-DERIVED.' Lands — and ground truth went further: the Aave hosted subgraph is fully DECOMMISSIONED (api.thegraph.com UNREACHABLE), so The Graph path is not used at all this sprint. A REAL-DERIVED point's authority is RE-DERIVABILITY (DD-86): where a source cannot serve the historical value, the point does not re-derive and is REJECTED, not chained — the archive stays short, honestly. The chosen source (Chainlink getRoundData) reads stored round state (no archive node, no pruning), so every chained point re-derives.",
    A5_realDerivedBecomesTheDefault: "'REAL-DERIVED will quietly become the DEFAULT tier — backfill produces hundreds of points, live capture produces one per run — and REAL★ becomes a rounding error the moat was built on.' The RATIO is the answer (F-2/RP-2): the archive summary always renders the tier ratio, and the own-leg's confidence is capped by its weakest dominant tier — a series that is 99% REAL-DERIVED is labeled 'predominantly third-party historical — re-derivable, but not self-captured'. Backfill bootstraps the archive; it does not replace the reason the archive is trustworthy.",
    A6_dataIngestionPlatform: "'Eight sprints without a law, and now a second capture subsystem. The tool is becoming a data-ingestion platform with a philosophy stapled on.' Backfill is a VERB — fetch + hand-encoded call, hash-chained JSONL — byte-for-byte the REAL★ engine's architecture, pointed at historical rounds instead of the latest block. No new dep, no daemon, no server. Deps 2, screens 3. Every failure mode maps to an existing law (X-MOAT the tier, X-HONEST the unreachable depth, X-RECKON the chained act, X-REACH the plausibility gate). It is not a new platform; it is the existing on-chain read discipline walking backward through rounds.",
  },

  // ── PART F — THE POST-IMPLEMENTATION RED TEAM — blocking re-pins, executed ──
  postImplementationRePins_partF: {
    RP1_markerDiffIsTheGuarantee: "F-1 CRITICAL — the countable registry is hand-maintained; a new countable next sprint can be forgotten from the registry, and the gate would reconcile the ones it knows while the new one drifts (V42's census failure, one meta-level up). The gate does not only check the registry — it DIFFS the full marker against the previous marker (PREV_MARKER, pinned Phase 0) and asserts EVERY numeric field that changed is either in the registry (reconciled) or explicitly derived-not-countable with a reason. An unclassified changed number REFUSES. The registry is a convenience; the diff is the guarantee.",
    RP2_ratioNotJustMix: "F-2 HIGH — the false-fire count and archive summary always render the tier RATIO, not just the mix, and the own-leg's confidence is capped by its weakest dominant tier. A series that is predominantly REAL-DERIVED is labeled third-party historical. The Operator must never mistake a backfilled series for the self-captured moat.",
    RP3_phaseTransitionsHandled: "F-3 HIGH — the walker handles Chainlink phase transitions explicitly: decompose roundId into (phaseId, aggregatorRoundId), walk each phase's rounds, cross boundaries deliberately. A backfill that stops at a phase boundary and claims completeness FAILS; the reachable depth is stated per phase so a truncation is visible, not hidden.",
    RP4_typedReconciler: "F-4 MEDIUM-HIGH — Continuity.reconcile is typed per countable (ADDITIVE / PARTITION / DERIVED / INVARIANT); a ratio forced through an additive reconciler produces a false reconciles. The census's movement is a bucket TRANSFER (a MOVED map), not a delta from nowhere — the actual fix for N-2.",
    RP5_reDerivabilityHasAPrecondition: "F-5 MEDIUM — re-derivability is a property of the pinned {feedAddress, roundId, answer}, not of the current RPC. The observation stores enough to re-derive via getRoundData(roundId) against any node that serves the feed; the log states the precondition ('the round is finalized/immutable; not guaranteed against a decommissioned feed'). The moat's guarantee is 'here is exactly what to query to reproduce this', not 'this RPC will always answer'.",
    F6_cannotAnswer: "MEDIUM — realLineageCount 0. The archive can now have real depth via backfill — but a deep archive of a kill-criterion the Operator never authored is a false-fire count with nothing to count. Backfill makes the own-leg judgeable; it does not make a manifest exist. The tool can replay a criterion over real history the moment one is written — and one has never been written. The door is still his to open; V43 makes the room behind it deeper.",
    F7_maintenanceTax: "LOW-MEDIUM — the walker is O(rounds) per run, bounded by the Operator's cadence; the JSONL chain is append-only and cheap to verify. The new maintenance tax is the pinned feed versions (feedCodeHash) — a feed upgrade requires a disclosed re-pin. That is correct: the moat's trustworthiness is worth a re-pin per upgrade.",
  },

  // ── THE DEVIATIONS reserved/recorded this sprint (Operator-signed=false — LN5; the agent NEVER signs the gate) ──
  deviations: {
    D87: "RESERVED — THE GENERAL RECONCILER: one Continuity.reconcile that every cross-sprint countable routes through, typed ADDITIVE/PARTITION/DERIVED/INVARIANT; the gate enumerates a pinned registry AND diffs the whole marker against the last one, refusing the log if any number moved unrouted (F-1/RP-1). Operator-signed=false.",
    D88: "RESERVED — THE ON-CHAIN BACKFILL ENGINE: Chainlink getRoundData historical rounds chained REAL-DERIVED over fetch + hand-encoded eth_call; phase transitions crossed deliberately; deps stay 2; no daemon. Operator-signed=false.",
    D89: "RESERVED — THE REAL-DERIVED TIER: re-derivable at the round, third-party-sourced, weaker than REAL★ and stronger than RETROSPECTIVE; the ladder pinned; a cross-tier chain FAILS. Operator-signed=false.",
    mr13: "MR9 carried an EIGHTH sprint — CLOSED as undischargeable-by-the-agent: it turns on the Operator opening the tool (realLineageCount 0; ownCaptures HUMAN 0; the remaining action is a human authoring a manifest and running a verb, which has never been a Phase). Recorded closed, not carried a ninth time.",
    mr20: "carried (S174) — the machine-readable deviationStates must enumerate EVERY pinned deviation: D51/D33/D63/D27 AND D80–D86 AND this sprint's D87–D89. State.deviations() is the single source; a pinned deviation absent from it FAILS (S174).",
    operatorGatedNote:
      "D23–D89 present, D27 STILL FIRST (the EIGHTEENTH sprint) under 'the Stamp is knowingly generous until D27 is signed'; the FIRST gate section is THREE items alone — (1) THE COMPOUNDED GENEROSITY (D27's generosity AND the ≈√τ_int overstatement, the PBO cross-check honest and independent behind it), (2) D33 (SIGNABLE · testRedesigns 1 · riderEnforced true · pboEvidence independent · note carried:{from:V39,reverified:true} · unsigned), (3) D67 (⟨N⟩ STILL EMPTY, and now the own-capture false-fire leg has a REAL★+REAL-DERIVED series with real depth to be changed BY). D62-R · D80–D89 · D46/D50/D54/D55 · IN2 (the ONLY validation left, and backfill gives the false-fire count real depth the day it runs). The agent presents the whole gate, NEVER signs it (LN5). D33 or D46 implemented while unsigned is the gravest Halt.",
  },

  // ── THE BUILD PHASES — the shed order, PINNED ──
  shedOrder: {
    rule: "Phases 1, 3, 4 NEVER SHED (the reconciler must be total · backfill must actually reach history · tiers must never mix). Then Phase 5 sheds FIRST · Phase 2 second. A sprint that ships only 1, 3, 4 is a SUCCESSFUL sprint: it makes continuity un-forgettable and turns a length-zero archive into a real series.",
    neverShed: ["1_continuityTotal", "3_backfillEngine", "4_tierLadder"],
    shedOrderIfNeeded: ["5_ownLeg", "2_carriedHistoricalAudit"],
  },

  // ── THE RED TEAM — walls S180–S189 (S1–S179 carried, re-run against the SHIPPED artifacts at ship time) ──
  walls: {
    carried: "S1–S179 first-class, re-run (two identical battery runs) — every one runs against the SHIPPED artifact at ship time (the identity-hardened, now continuity-total Ship Gate, V40+V42+V43).",
    built: ["S180", "S181", "S182", "S183", "S184", "S185", "S186", "S187", "S188", "S189"],
    S180: "the verify sub-check names its domain (curated-evidence-subset-matches-committed); a domain-implying name that checks less FAILS; the full battery is reconciled through Continuity. (W-BF01)",
    S181: "every countable in the pinned registry is reconciled through the ONE reconciler; a registered-but-unreconciled countable, OR a moved-but-unregistered number (marker-diff), REFUSES the log (proven on the emit path). (W-BF02)",
    S182: "a historical act's hash is stable or carried:{from}; a drift without a tag FAILS. (W-BF03)",
    S183: "the capability→verdict-isolation invariant is rendered and checked (the capture/backfill engines touch no verdict path). (W-BF04)",
    S184: "a REAL-DERIVED point is re-derivable at its round; one that is not is REJECTED, not chained. (W-BF05)",
    S185: "tiers never mix; a REAL-DERIVED-in-REAL★ or RETROSPECTIVE-in-either FAILS. (W-BF06)",
    S186: "backfill adds no mass-path dep; a seeded web3/graph-client import FAILS; deps 2. (W-BF07)",
    S187: "a source feed's type matches the observable; a price-feed-as-rate FAILS (FRAX/USD negative control; rETH/ETH exchange-rate passes). (W-BF08)",
    S188: "the tier ladder is enforced and pinned; a cross-tier chain FAILS; DeFiLlama still RETROSPECTIVE-only. (W-BF09)",
    S189: "the own-leg renders a count with its tier mix + ratio, UNJUDGEABLE below the floor; the meter stays dark. (W-BF10)",
  },

  // ── THE CONVERGENCE CRITERIA ──
  convergence: {
    rule: "two clean runs · identical expect() · the continuity-total Ship Gate held (a moved-but-unrouted countable REFUSES the log, proven on the emit path) · the emitted pins-sha equals this sprint's pins file · the clone RAN on this tree · a real, re-derivable terminal tree + commit hash · verify sub-checks EACH NAMING their domain · bundle + differential byte-identical (no verdict moved — backfill moves no verdict) · familyN === 1 · frozen 0 drift · deps 2 · screens 3 · tiers never mix unlabeled · no scheduler · AND Rollup would have refused to write any of it if one countable had moved unrouted.",
    halts: "an unrouted (or unclassified vs the prev marker) countable · a mis-named sub-check · a drifting historical hash · a non-re-derivable REAL-DERIVED point · a cross-tier chain · a price-feed backfilled as a rate · a backfill claiming depth past a silently-truncated phase boundary · a mass-path web3/graph-client import · a hidden tier ratio · a lit meter · a scheduler · a build log that exists while a countable moved unrouted · D33 or D46 implemented while unsigned (LN5 — the gravest).",
  },

  // ── THE PREVIOUS MARKER SNAPSHOT (the F-1/RP-1 diff runs against this) ──
  prevMarker: PREV_MARKER,

  // ── the constitution carried (byte-untouched; re-asserted for continuity) ──
  carried: {
    deps: ["hono", "zod"],
    screens: ["shelf", "reality-check", "ask"],
    newProductCapability: 1,
    newProductCapabilityNote: "1 DISCLOSED capability — the ON-CHAIN BACKFILL ENGINE (the moat's second stone: Chainlink getRoundData historical rounds chained REAL-DERIVED, re-derivable at each round, third-party-sourced, a tier between REAL★ and RETROSPECTIVE). The general reconciler (S181), the verify rename (S180), the historical-act audit (S182), and the capability isolation (S183) are the V42 audit's cure — making the continuity discipline TOTAL — hardening and proof, not new scored capability. Reported honestly, not a Halt.",
    lawsThisSprint: "ZERO — application, not legislation (an EIGHTH sprint running; every V42 defect is X-DERIVE's totality clause under-applied)",
    laws: 17,
    exitKinds: 7,
    familyN: 1,
    reachableHumans: 1,
    published: false,
    frozenSevenNote:
      "the 6 .py + loop.ts + verdict-path 7 + frozen-core 2 byte-untouched (the backfill engine reads a live RPC and writes JSONL — it touches NO frozen byte and MOVES NO verdict; a backfilled round is not a scorecard input); the scorecard differential + evidence bundle byte-identical at every gate (the general reconciler, the verify rename, the historical audit, the backfill engine, the tier ladder, the own-leg — none touches the scorecard verdict path); the Stamp familyN stays 1; no daemon; no new mass-path dependency (fetch + hand-encoded getRoundData).",
    evidenceBundleShaPrefix: "9c1e7bd8",
    killCriterion: "8b4e094b",
    ownCaptures: 0,
    ownCapturesNote: "ownCaptures (HUMAN) 0 today — the Operator has never run the verb; the own-leg can now count REAL★ (own live) + REAL-DERIVED (backfilled, third-party historical) with the mix + ratio labeled, but the HUMAN own-count stays 0 (the agent's REAL★ capture is quarantined; a REAL-DERIVED backfill is third-party, not a self-capture).",
    d67NEmpty: "D67's ⟨N⟩ is STILL EMPTY — awaiting the pen; the own-capture false-fire leg now has a REAL★+REAL-DERIVED series with real depth to be changed BY.",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const OUT = { ...PINS, pinsSha }
writeFileSync(path.join(H, "backfill-pins.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── BACKFILL — the sprint contracts pinned (V43) ─────────────────")
console.log(`  carried from Provenance : ${CARRIED_FROM.slice(0, 16)}…  (READ FROM DISK — the true V42 head)`)
console.log(`  walls                   : S180–S189 (S1–S179 carried, run at ship time)`)
console.log(`  shed order              : 1,3,4 NEVER shed · then 5 · then 2`)
console.log(`  the general reconciler  : one Continuity.reconcile; the gate diffs the marker + refuses any unrouted moved number`)
console.log(`  the moat's second stone : Chainlink getRoundData (rETH/ETH rate-space) chained REAL-DERIVED, re-derivable at the round`)
console.log(`  countables registered   : ${COUNTABLE_REGISTRY.countables.length}`)
console.log(`  new capability          : ${OUT.carried.newProductCapability} (the on-chain backfill engine) + the V42 audit's continuity cure`)
console.log(`  BACKFILL PINS_SHA       : ${pinsSha}`)
console.log("written: data/honesty/backfill-pins.json")
