/**
 * ORGΛNON — THE FAMILY SPRINT (V39), the pins builder. Continues from the COMPLETE Substance sprint (V38 + V38-B) —
 * carriedFromPinsSha = the Substance head (153628a9), the pen having moved (D51 ANSWERED = INSTRUMENT). This pins, BEFORE
 * a byte of Phase code, every contract of the sprint that pays for the pen it moved and makes the instrument finally
 * speak a number — without bending a law (NO NEW LAW, a fourth sprint):
 *   · PHASE 1 — the PRICE: D56 paid (the redesigned test's SEARCH hash-chained in record/, the third application of S122's
 *     answer), D33 RECOMPUTED with it counted (RP-1: testRedesigns count carried in state, NEVER resets), the i.i.d.
 *     autopsy meeting the signature (DD-53/RP-2: WHICH independence effective_n measures — SERIAL vs CROSS-SECTIONAL —
 *     established BEFORE any wiring; the rider STANDS or DISSOLVES on that reading), the flip's evidence SHOWN (z, region,
 *     preRegisteredAt — a boolean flip FAILS), ONE State.deviations() producer (the D51 contradiction unrepresentable),
 *     a real terminal tree hash, a fresh clone on THIS tree.
 *   · PHASE 2 — the NUMBER: the observable series MATERIALIZED (own REAL@ts captures leading, retrospective beneath, the
 *     window disparity stated — RP-3); a NUMBER at the door for peg-floor and tvl-drawdown; UNJUDGEABLE only where the
 *     series genuinely does not exist.
 *   · PHASES 3–6 — the exit set reaches SEVEN (oracle-staleness + utilization-ceiling; the algebra trigger FIRES as a
 *     FACT), the combinator algebra (additive or it does not ship; FROZEN at seven if it sheds — RP-7), the Family
 *     Enumerator + selection rank (authors nothing, ranks nothing, familyN === 1 — the meter dark, the memory kept), the
 *     lineage view (chronological, copy PINNED VERBATIM — RP-5, a PATH not a screen).
 * Hash-locked; deterministic; no network. The verbatim strings are pinned EXACTLY so a summarization is a detectable Halt.
 *
 * Run: bun run script/honesty/family-pins.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")

// ── the CARRIED-FORWARD Substance head (V38 + V38-B — the pen moved; D51 ANSWERED = INSTRUMENT) ──
const SUBSTANCE = JSON.parse(readFileSync(path.join(H, "substance-pins.json"), "utf8"))
const CARRIED_FROM = SUBSTANCE.pinsSha as string // 153628a9…

// ── VERBATIM PINS — pinned EXACTLY (a summarization is a detectable Halt) ──────────────────────────────────────────────
// RP-5 (F-5): the lineage view renders a COUNT and a LIST and NOTHING ELSE. Its copy is pinned here VERBATIM — no LLM
// phrasing on this surface at all (the one place the meter is dark is the one place a phrasing model would find the
// forbidden sentence "a 7-search family needs a Sharpe of X to survive deflation"). A render that deviates FAILS.
const LINEAGE_VIEW_COPY_VERBATIM = {
  header: "your manifests in this family, in the order you filed them",
  searchCount: "you have filed {n} variant{s} in this family. that is {n} search{es}.",
  perVariant: "{when} · {stampWord}", // a chronological line: the filing time + the variant's OWN independent ternary Stamp
  noAggregate: "no total, no best, no ranking — each variant carries its own verdict; the order is the order you filed them",
  rule: "a count and a list, nothing else — no generated prose, no aggregate, no 'best', no score, no total order; the comparison is permitted BECAUSE the search count is rendered beside it (the price tag)",
}

// PART A′ #10 / D63 OFF — the ruling costs the meter, never the memory. The exact sentence the builder ships under.
const BUILDER_SHAPE_VERBATIM =
  "you build; ORGΛNON counts your searches out loud and shows you your rank in the family you yourself defined — the meter stays dark by the pen's word, and every count lands in the moat, so the day the pen reverses D63 the deflation lights over history already recorded, with zero rework."

// DD-53 / RP-2 (F-2) — the axis question, pinned as a RULE before the read is wired. The DETERMINATION is DERIVED by the
// Phase-1 code from reading the frozen effective_n.py (X-SHOWN — shown, not asserted), and written to
// effective-n-determination.json; the D33 rider reads THAT, never this pin.
const EFFECTIVE_N_AXIS_RULE =
  "effective_n.py is READ, and WHICH independence it measures is established BEFORE anything is wired: SERIAL (autocorrelation in time — Lo 2002's axis, the effective number of independent OBSERVATIONS) or CROSS-SECTIONAL (independent BETS — the eigenvalue participation ratio). The i.i.d. limitation in PSR/DSR is a SERIAL one. If effective_n's serial adjustment can be fed into the frozen rigor's T WITHOUT touching one frozen byte, the rider DISSOLVES (a wiring gap). If it measures only the cross-sectional axis, OR if the frozen rigor.psr derives its own n internally and cannot be fed a deflated T without editing the frozen core, the rider STANDS, quantified — the correction lives only in the harness or as a flag, and D33 carries the bias's DIRECTION and MAGNITUDE permanently. A fix on the wrong axis retires the warning and is worse than no fix (RP-2)."

const PINS = {
  protocol: "family-pins",
  sprint:
    "THE FAMILY SPRINT (V39): pay for the pen that moved to SIGNABLE on a redesigned test (D56 paid, D33 recomputed with the price counted, the i.i.d. autopsy meeting the signature); make the instrument finally speak a NUMBER to its one user (the false-fire count materialized); reach the seventh exit kind and fire the algebra's trigger as a FACT; begin the builder (the Family Enumerator — you build, ORGΛNON counts) with the meter dark by the pen's word. NO NEW LAW (a fourth sprint). The whole Operator gate D23–D74, D27 STILL FIRST (the fourteenth sprint).",
  at: "2026-07-15",
  continues:
    "THE SUBSTANCE SPRINT (V38 + V38-B) — battery 1706/2/0 across 262 files / 11050 expect(), verify exit 0, frozen 0 drift before AND after the autopsy, bundle 9c1e7bd8 byte-identical, deps 2, screens 3, 17 laws / 0 minted for three sprints; D51 ANSWERED = INSTRUMENT, D33 SIGNABLE-unsigned, D62-R Option A, D63 OFF (familyN === 1)",
  carriedFromPinsSha: CARRIED_FROM, // the Substance head (153628a9) — the pen has moved; this sprint pays for it and makes the instrument speak
  chain: "153628a9 ← ab4900ee (Socket) ← 257684c0 (Derive) ← 8c80367a (Reach) ← 07d27f81 (Show) ← 96469dbb (Reckon) ← d90df3c7 (Cadence) ← 98a44bd8 (Manifest) ← 2b1dd373 (Domain) ← cc08a77b (Coverage) ← 6b285eba (Redesign) ← 3d0ef3bb (GroundTruth)",

  // ── NO NEW LAW — a fourth sprint running (V36's PART F pinned it; V37, V38, now V39 honor it) ──
  noNewLaw: {
    rule: "SEVENTEEN laws stand; ZERO minted this sprint (the fourth running). Every V38 execution-audit defect was an existing law UNDER-APPLIED, not a missing one: X-RECKON → the unpaid SEARCH (J-1); X-SHOWN → the unshown z and the prose tree-hash (J-3, J-5); X-DERIVE/S107 → the contradictory D51 (arithmetic checked, state unchecked — J-4); X-HONEST → a fact that says UNJUDGEABLE and calls itself delivered (J-7). The constitution is complete; the work is application. An instrument for one person keeps all seventeen — they were never about the audience.",
    laws: 17,
    minted: 0,
    sprintsWithoutALaw: 4,
  },

  // ── THE FRAME: D51 ANSWERED = INSTRUMENT raises the bar rather than lowering it ──
  frame: {
    d51: "ANSWERED = INSTRUMENT (V38-B, the pen's word 'my personal tool'). Every gate line that measured this project against a market is retired (D68). The bar RISES: there is exactly one user, he has the repo, and the tool has never handed him a computed number he could act on — an instrument that cannot say a number to the one person it was built for has not been validated, it has been DECORATED.",
    thesis:
      "an instrument that cannot speak to its only user is furniture. V39 makes it speak, and pays for the pen it moved to get here.",
    reachableHumans: 1,
    reachableHumansNote: "reachableHumans: 1 is BY DESIGN under D51 (not a deficiency) — Reach.interpretation derives BY-DESIGN from the recorded D51 state (S139, carried).",
  },

  // ── THE V38 EXECUTION-AUDIT FINDINGS — every one carried by name, with its V39 disposition ──
  auditFindings: {
    J1: "D33 flipped to SIGNABLE on a test redesigned AFTER it failed, and the price went unpaid — DD-33 was explicit (branch (b): disclose the change of test as D56, COUNTED AS A SEARCH). → PHASE 1: D56 PAID, D33 RECOMPUTED with it counted; S140 makes the price automatic forever.",
    J2: "the autopsy found a reason to doubt D33 in the same sprint D33 unlocked — 'autocorrelated input overstates PSR/DSR confidence', and DeFi yields ARE autocorrelated; the finding and the SIGNABLE verdict sit in one document and never meet. → PHASE 1: S142 + DD-53; the fix may already be frozen in the tree (effective_n.py).",
    J3: "the deciding number is claimed, never shown — the header carries no z, no acceptance region, no pre-registration timestamp. The pen unlocked on a boolean. → PHASE 1: S141, a producer that FLIPS a deviation's state must emit the evidence that flipped it.",
    J4: "the log asserts two contradictory states of D51 (base gate: OPEN, pens unmoved 2 sprints; PART B: ANSWERED INSTRUMENT) — S107 checks arithmetic; nothing checked STATE. → PHASE 1: S150, ONE State.deviations() producer, TWO renders; contradiction unrepresentable.",
    J5: "no terminal tree hash — the slot held an English sentence and the marker reported valid; V34 built S90 to reject a hand-typed treeHash. → PHASE 1: S143, the marker validation RUNS on the terminal marker; prose in a hash slot FAILS.",
    J6: "the fresh clone was not re-run — verifyOnClone carried V37's battery number (1668); V38 added a live fetch, a provenance module, a null-dist harness, and the quarantine, none tested from an empty directory. → PHASE 1: S144, a stale clone battery FAILS.",
    J7: "the false-fire count renders UNJUDGEABLE — third sprint half-delivered; under D51 this is no longer a gap, it is THE failure (the amended kill-criterion turns on changedByCompile; a fact that says 'unknown' can never change anything). → PHASE 2: the observable series MATERIALIZED, S145.",
    J8: "MR13 dropped (fourth sprint); D57–D61 reserved for phases that shed (ledger cruft). → PHASE 0: MR13, MR17.",
    J9: "zero new capability, third time in five sprints (correctly, per the shed order). V39 owes: oracle-staleness, utilization-ceiling, the algebra, and the Family Enumerator. → PHASES 3–6, with a shed order that protects the builder.",
  },

  // ── PART CLEAN — the pure functions, each with a seeded negative and a mint-time origin (S108) ──
  partClean: {
    rule: "pure functions, each with a seeded negative and a mint-time origin; deps 2, screens 3, familyN === 1, no law.",
    producers: {
      "State.deviations": "→ Deviation[] — ONE producer; every render reads it; a deviation holding two states is UNREPRESENTABLE (S150/J-4)",
      "Search.forTestRedesign": "(old, new) → LedgerEntry — the estimand changed ⇒ a SEARCH (S140/J-1)",
      "Evidence.forStateFlip": "(dev) → {z, region, preRegisteredAt} | REFUSED — a flip with no emitted evidence FAILS (S141/J-3)",
      "Series.materialize": "(subject, observable) → PIT[] | UNJUDGEABLE{why} — UNJUDGEABLE only where the series does not exist (S145/J-7)",
      "FalseFire.countBoth": "(criterion, series) → {own:{n,REAL@ts}, retro:{n,RETROSPECTIVE}} — already built; feed it",
      "Exit.oracleStaleness": "(feed, now) → seconds | UNJUDGEABLE (S146)",
      "Exit.utilization": "(pool) → ratio | UNJUDGEABLE (S146)",
      "Family.enumerate": "(filter) → {cardinality, members[]} — a set operation; AUTHORS NOTHING (S148)",
      "Family.selectionRank": "(pick, family) → {rank, of} — DERIVED, never asked (S148)",
      "Obs+combinators": "when · count · changed — ~100 lines; NON-EXECUTABLE BY TYPE; existing kinds serialize AND EVALUATE byte-identically (S147)",
    },
  },

  // ── PHASE 1 — THE PRICE, THE EVIDENCE, AND THE RECORD (S140–S144, S150) — NEVER SHEDS ──
  phase1_price: {
    dd54_d56Paid: {
      rule: "the redesigned test's SEARCH is committed and HASH-CHAINED in record/ (the third application of S122's answer — a meta-event is not a strategy manifest; the strategy-trial ledger has no coherent append site). THEN D33 is RECOMPUTED WITH IT COUNTED, and the log states whether the flip SURVIVES the price. If the price would have changed the answer, that is the finding of the sprint.",
      appendSite: "record/ hash-chain (test-redesign-search.json folded in beside halt-lifts.json + kill-criterion-amendment.json) → d56SearchLedgerHash",
      estimandChanged: "V37 tested a SINGLE-SEED PBO (0.6) against 0.5 within a 0.05 band; V38 redesigned to test the NULL-DISTRIBUTION MEAN over ≥200 seeds (SE = sd/√nSeeds). The estimand, the sampling distribution, and the question all changed — that IS a change of test, and a change of test is a SEARCH.",
    },
    rp1_teeth: {
      rule: "F-1 (CRITICAL): 'recompute with the search counted' is arithmetically meaningless if Signability.d33 reads the cross-check AGREEMENTS, not the search count — it would return SIGNABLE unchanged and the log would call it survival. That is a receipt, not a payment. THE ONE HONEST FORM: D33's state carries the number of test redesigns it took to reach SIGNABLE — d33: {state, testRedesigns:n, redesignSearchHashes:[...]} — rendered at the gate PERMANENTLY, beside the verdict. A pen that opened on the SECOND version of a test is not the same pen as one that opened on the first; the Operator must see which one he holds. THE COUNT NEVER RESETS.",
      testRedesigns: 1,
      testRedesignsNote: "1 = the V38 single-seed → null-distribution-mean redesign. The count is carried in D33's state and never resets; a future redesign increments it.",
      flipSurvives:
        "YES, in VALUE — the theory leg rests on a null distribution over INDEPENDENT SEEDS (i.i.d. by construction; SE = sd/√nSeeds is immune to serial autocorrelation), so the i.i.d. rider does NOT undermine D33's SIGNABLE. But the verdict no longer stands naked: it carries testRedesigns:1 and the i.i.d. rider on the same line, forever. The flip survives; the pen that made it is stamped as the one that opened on redesign #1.",
    },
    dd53_autopsyMeetsSignature: {
      rule: EFFECTIVE_N_AXIS_RULE,
      preRegisteredReading:
        "the pre-registered expectation (SHOWN by the Phase-1 read, not asserted here): effective_n.py measures BOTH axes in DISTINCT functions — effective_n_serial(n,τ)=N/τ_int with integrated_autocorr_time (SERIAL, τ_int=(1+ρ)/(1−ρ) for AR(1) — Lo's axis) AND effective_breadth (CROSS-SECTIONAL, eigenvalue participation ratio). The serial family IS the i.i.d. axis (F-2's premise 'effective_n is cross-sectional' is refuted by the code). BUT the frozen rigor.psr computes n = len(returns) INTERNALLY and hard-codes z=(SR−SR*)·√(n−1)/denom — it takes NO n parameter, so the serial correction CANNOT be wired into the frozen core (forbidden) without editing it or corrupting the moments (a thinned array changes SR/g3/g4). Therefore: a HARNESS-COMPOSITION gap — the correct serial math exists and is on the right axis, but must be COMPOSED BESIDE the frozen number, never wired in. The rider STANDS, quantified (direction: the frozen PSR/DSR OVERSTATE confidence on autocorrelated input; magnitude: z inflated ≈ √τ_int, τ_int MEASURED from the actual series), with a harness deflated companion SHOWN. More honest than 'dissolved' (F-2's retire-the-warning trap) and than 'effective_n is useless' (it clearly has the right math).",
      determinationArtifact: "data/honesty/effective-n-determination.json — DERIVED by src/backtest/effectiven.ts reading the frozen module (X-SHOWN); the D33 rider reads THAT artifact, never this pin.",
      s142: "a deviation's state renders with EVERY assumption-limit that bears on it; a SIGNABLE with an unattached bearing limitation FAILS. D33: SIGNABLE and its i.i.d. rider render ON THE SAME LINE, direction + magnitude named.",
    },
    s140: "a test whose estimand changes without an appended SEARCH FAILS the battery — the D56 price is automatic FOREVER. Search.forTestRedesign(old,new) derives a LedgerEntry when the estimand changes; a redesigned test with no chained SEARCH hash is a Halt.",
    s141: "a producer that FLIPS a deviation's state must emit the evidence that flipped it — {z, acceptanceRegion, preRegisteredAt} — into the generated header. A flip on a boolean FAILS. Evidence.forStateFlip(dev) → the evidence | REFUSED.",
    s143: "the terminal marker's treeHash matches /^[0-9a-f]{40}$/ AND is re-derivable (git rev-parse HEAD^{tree}); a prose value in a hash slot FAILS. X-SHOWN(c): a sprint that does not end in a hash did not end.",
    s144: "the fresh clone runs on THIS tree — verifyOnClone carries THIS sprint's battery number, re-run from an empty directory; a stale clone battery (a carried prior number) FAILS.",
    s150_mr18: {
      rule: "J-4 / attack #8: the fix is ARCHITECTURAL, not procedural. ONE State.deviations() producer; the base gate and the addendum both READ from it. A contradiction (a deviation holding two states across two generated blocks) becomes UNREPRESENTABLE rather than detectable. MR18: a supersession pointer where a superseded block stands (the D51 OPEN base-gate line redirects to the ANSWERED state via the single producer).",
      mr18Pointer: "the base gate no longer hardcodes 'D51 OPEN · pens unmoved: 2 sprints'; it reads State.deviations() → D51 = ANSWERED (INSTRUMENT), and renders the supersession pointer to the V38-B ruling.",
    },
  },

  // ── PHASE 2 — THE INSTRUMENT SAYS A NUMBER (S145) — NEVER SHEDS. The sprint's reason for being. ──
  phase2_number: {
    dd55_materialize: {
      rule: "the false-fire count is a REPLAY of the exit evaluator over history, so the history must exist per observable. apyBase composes readily; tvl and peg do NOT — they must be materialized from ORGΛNON's OWN point-in-time captures (REAL@ts, short, growing daily) and/or the retrospective chart (RETROSPECTIVE, long, revisable). countBoth already exists — feed it. A NUMBER renders at the door, BEFORE the user commits, for at least peg-floor and tvl-drawdown. UNJUDGEABLE is permitted ONLY where the series genuinely does not exist (S145) — a blanket UNJUDGEABLE FAILS.",
      perKindSeriesMap: {
        "peg-floor": "peg series — own-pit captures (REAL@ts) where present; DefiLlama/aggregator retrospective chart (RETROSPECTIVE) for depth",
        "tvl-drawdown": "tvlUsd series — same two tiers (own REAL@ts + retrospective)",
        "funding-flip-count": "funding series — own captures where present; UNJUDGEABLE where genuinely absent",
        "governance-change": "no captured point series to replay → UNJUDGEABLE (honest, not a default)",
        "concentration-ceiling": "no captured point series → UNJUDGEABLE",
        "oracle-staleness": "no historical staleness series today → UNJUDGEABLE (the axis is a NOW read, Phase 3)",
        "utilization-ceiling": "utilization series where the lending senses captured it; else UNJUDGEABLE",
      },
    },
    rp3_tierOrder: {
      rule: "F-3 (blocking): the OWN-CAPTURE number LEADS; the retrospective is rendered BENEATH it with its revisability stated in the same breath; the window disparity is stated as a fact ('your own captures cover M days; this criterion has not yet been tested against a full cycle'). If the own-capture window is below the pinned minimum, the OWN number renders UNJUDGEABLE and the RETROSPECTIVE renders ALONE, explicitly labelled as the WEAKER evidence. Never let the longer series win by default just because it is longer.",
      minWindowDays: 180,
    },
    controls: "both tiers shown · deterministic ×2 · a seeded alternative-threshold / score / comparative → FAILS · no σ, no distribution, no probability (a count, not a model) · passes the ONE GUARD.",
    reasonToRunTheCadence:
      "the own-capture window grows every day the cadence runs — which turns the false-fire count into a reason to run the cadence (what IN2 has been asking for since V32).",
  },

  // ── PHASE 3 — oracle-staleness + utilization-ceiling — THE SIXTH AND SEVENTH KINDS (S146) — sheds third ──
  phase3_exitKinds: {
    dd56_oracleStaleness: {
      rule: "the observable is (now − feed.updatedAt) with the feed a hard-coded constant — deterministic contract reads on the governance screen's existing RPC surface, content-hashed and TIERED. The COVERAGE NUMBER is emitted (n / 1284 pools resolvable), and the bar is stated honestly.",
      rp6_coverageProxy:
        "F-6: coverage: n/1284 (SHELF) · bar: the Operator's own positions · positions held: 0 · therefore the bar is UNMEASURABLE today, and this number is a PROXY that may prove irrelevant. A proxy for a bar that cannot be measured is a placeholder, and the log says so — honest, and it costs nothing to say.",
      curatorGhost:
        "the curator-loss literature's #1 root cause — an oracle that kept reporting $1 while the asset collapsed — becomes a pre-registrable kill-condition.",
    },
    dd57_utilization: {
      rule: "utilization-ceiling from the lending senses ORGΛNON already captures (oracle-proven PIT). If present → free; if not → costed and stated. UNJUDGEABLE without inputs. No price, no prediction.",
    },
    d70_exitSetSeven: {
      rule: "the exit set reaches SEVEN (peg-floor, funding-flip-count, tvl-drawdown, governance-change, concentration-ceiling, oracle-staleness, utilization-ceiling). The algebra's pre-registered trigger FIRES — as a FACT with its hash, never an instruction (X-CADENCE applied to ourselves: a trigger fires on a fact, never on a plan).",
      before: 5,
      after: 7,
      triggerFiresAsFact: "recorded in data/honesty/algebra-trigger.json with its content hash — a FACT, not an instruction.",
    },
    d73_rpcExposure: "the oracle-staleness resolver reuses the governance screen's existing RPC surface; the RPC exposure is recorded (D73). D42 dissolved under D51 — a personal tool is the non-commercial case; the exposure that haunted twelve sprints evaporated on the pen's word.",
  },

  // ── PHASE 4 — THE COMBINATOR ALGEBRA (S147) — sheds FIRST ──
  phase4_algebra: {
    rule: "Peyton Jones / Eber / Seward (Composing Contracts, ICFP 2000; commercialized as LexiFi's MLFi): Obs + when · count · changed. ~100 lines. NON-EXECUTABLE BY TYPE — a combinator that describes a condition cannot place an order (X-ADVICE enforced by the type system, not a wall). Cedar remains formally rejected in its favour.",
    dd58_twoSidedWall:
      "ADDITIVE OR IT DOES NOT SHIP — the wall is TWO-SIDED (V38's RP-5): (i) every fixture lineage id UNCHANGED, AND (ii) every fixture exit evaluation BYTE-IDENTICAL, including the UNJUDGEABLE cases. Serialization identity without evaluation identity leaves the wall green while the verdicts drift.",
    rp7_frozenAtSeven:
      "F-7 (blocking): if the algebra sheds THIS sprint, the exit set is FROZEN AT SEVEN — no eighth kind through the enum, ever, until the algebra ships. A trigger that fires twice into silence decays into decoration, and this project has counted 83 of those. The trigger gets teeth or it gets deleted.",
  },

  // ── PHASE 5 — THE FAMILY ENUMERATOR + SELECTION RANK (S148, D71) — NEVER SHEDS. The builder's first half. ──
  phase5_enumerator: {
    dd59_setOperation: {
      rule: "Family.enumerate(filter) is a SET OPERATION over the user's OWN stated constraints, never a generation — it counts the shelf members satisfying the filter the user himself stated. It emits {filter, cardinality, members}. Family.selectionRank(pick, family) is DERIVED, never asked: 'your pick is the highest-APY member of your stated filter — rank 1 of 48'. X-RECKON's principle one level up: do not ASK a user whether they were yield-chasing — DERIVE it. It authors no manifest, ranks no candidates, suggests nothing.",
      builderShapeVerbatim: BUILDER_SHAPE_VERBATIM,
    },
    d63_off: {
      rule: "D63 is OFF by the pen ('keep it off'). familyN stays 1, the deflation stays DARK, NO verdict moves — a seeded activation (a seeded familyN > 1) FAILS. But the counts land in the moat REGARDLESS, so the day the pen reverses D63 the meter lights over history already recorded, with zero rework. The ruling costs the meter; it does not cost the memory.",
      familyN: 1,
      deflation: "DARK",
    },
    rp4_filterHashed: {
      rule: "F-4 (blocking): the filter is part of the manifest's content hash from the moment it is stated (it joins positions, thesis, exit criterion on the hashed surface — the first filter statement is itself a hypothesis). Which means adding it would MOVE EVERY EXISTING LINEAGE ID. THEREFORE: the filter is a NEW OPTIONAL FIELD — a manifest authored WITHOUT one is UNCHANGED, its lineage id does not move; a manifest WITH a filter is a new lineage from birth. The wall is the fixture ids: before === after (S148 extended). Re-stating the filter after seeing the count is a SEARCH (X-RECKON), tagged at the append site.",
    },
    controls:
      "the enumerator authors nothing (a seeded manifest emission FAILS) · ranks no candidates (a seeded ordering of the family FAILS) · suggests nothing (a seeded 'consider instead' FAILS) · re-stating the filter after seeing the count is a SEARCH · familyN === 1 proven · the bundle byte-identical (no verdict moved).",
  },

  // ── PHASE 6 — THE LINEAGE VIEW (S149, D72) — sheds second ──
  phase6_lineageView: {
    dd60_chronological: {
      rule: "your manifests in this family: CHRONOLOGICAL, mechanically pinned (a seeded score-ordering FAILS), each with its own independent ternary Stamp (a classification, never an ordering), no aggregate, no 'best', no total order — and the SEARCH COUNT rendered prominently beside them ('you have filed 7 variants in this family. That is 7 searches'). The comparison is permitted BECAUSE it carries its own price tag. A PATH, not a screen — the screen count stays 3. If it cannot render without a fourth screen, it does not ship and goes to the pen as an X-SURFACE question.",
      copyVerbatim: LINEAGE_VIEW_COPY_VERBATIM,
    },
    rp5_pinnedCopy:
      "F-5 (blocking): the lineage view's copy is PINNED VERBATIM — no generated prose, no LLM phrasing on this surface at all. It renders a count and a list. Nothing else. The corpus's new baits target THIS surface specifically, from a different lab. The one place the meter is dark is the one place the user most wants a meter — and that wanting is exactly what an advice guard is for.",
    screens: 3,
  },

  // ── THE FENCE — refused this sprint, by name ──
  fence: {
    refused: [
      "the deflation / K-activation / the deflated-Sharpe meter (D63 OFF; a seeded familyN > 1 FAILS)",
      "the Proposer (D62-R Option A: gated on the pen alone)",
      "the Adversary (an LLM devil's-advocate — trigger pinned: after the FIRST REAL lineage)",
      "the post-mortem (realLineageCount: 0)",
      "D38 (the composite verdict)",
      "the Merkle / transparency layer — now DEAD, not parked (D74): an instrument has no external auditor BY DESIGN",
      "a hosted tier · any HTTP listener, port, or daemon · reports/API-as-product · execution/custody/wallets",
      "valuation / USD (a share, a staleness-in-seconds, a utilization ratio, and a family cardinality are dimensionless, temporal, or counts — never a price)",
      "Markowitz / any optimizer · any advisory output · any new mass-path dependency (deps stay 2)",
      "marketplace / leaderboard / ranking · a second law (seventeen, four sprints)",
      "an eighth exit kind through the enum (the set closes at SEVEN; a new kind goes through the algebra — and if the algebra sheds twice, the set is FROZEN until it ships)",
    ],
  },

  // ── THE ADVERSARIAL VALIDATION RECORD (PART A′) — this plan, attacked before design ──
  adversarialRecord_partA: {
    A1_theatre: "'paying D56 now is theatre; you cannot un-ring the bell.' LANDS → DD-54: the SEARCH is not merely appended — D33 is RECOMPUTED WITH IT COUNTED (RP-1: testRedesigns in state), and the log states whether the flip SURVIVES. A price paid without recomputing the thing it was owed on is a receipt, not a payment.",
    A2_iidFatal: "'the i.i.d. limitation may be fatal — the Stamp is already knowingly generous until D27, and overstating confidence on autocorrelated data makes a generous instrument MORE generous.' THE SHARPEST ATTACK → DD-53 first: check effective_n.py's axis; the rider STANDS or DISSOLVES on that reading, presented on the SAME LINE as SIGNABLE (S142).",
    A3_volumeKnob: "'the enumerator's cardinality depends on a user-stated filter — he can narrow it until the deflation is painless; a confessional with a volume knob.' LANDS → selectionRank is the structural answer and is DERIVED not asked; narrow to 3 and it still says 'rank 1 of 3', and the narrowness is itself rendered. You can always lie to a mirror; the mirror still shows what you did. And re-stating the filter is a SEARCH.",
    A4_rankingWithButtonRemoved: "'the lineage view is a ranking with the sort button removed.' LANDS PARTLY (thinnest ice) → chronological only, mechanically pinned; no aggregate/score/total order; each variant its own ternary Stamp; the SEARCH COUNT rendered beside them. If the tree cannot render this without a screen, it does not ship and goes to the pen as an X-SURFACE question.",
    A5_oracleStalenessDecoration: "'oracle-staleness will be UNJUDGEABLE for 95% of the shelf — a decoration, and you counted 83 of those.' LANDS, D51 re-aims not dissolves → DD-56: emit the shelf coverage number AND state the honest bar (his positions, held: 0 → a proxy, and the log says it is a proxy). A resolver that reaches a pinned named subset is honest.",
    A6_guardUnjudgeable: "'you ship the builder while guardEfficacy is formally UNJUDGEABLE (five sprints, one catch), and the builder is the surface most likely to produce advice.' LANDS → the enumerator + lineage view emit STRUCTURED FACTS not prose (guard routed around by construction, the Socket precedent), but every new rendered LINE goes through the ONE GUARD and the corpus grows against these surfaces from a different lab. If UNJUDGEABLE a sixth sprint, the gate says so — louder.",
    A7_captureExpansion: "'materializing tvl/peg is a capture expansion, and you just dissolved your data-posture ruling.' ANSWERED by the ruling itself → D42 dissolved under D51 (a personal tool IS the non-commercial case); that ruling is exactly what unblocks the phase. The tier discipline is untouched: every series carries its provenance tier, always.",
    A8_checkerForContradiction: "'S150 is a checker for a contradiction that should not be representable.' CORRECT, architectural not procedural → ONE State.deviations() producer, TWO renders; a contradiction becomes unrepresentable rather than detectable. (Discipline drifts; schemas don't.)",
    A9_frozenConstitution: "'four sprints without a law is a constitution nobody dares touch.' The evidence answers → every defect in the last four audits was an existing law UNDER-APPLIED. A constitution that already contains the answer to every new defect is complete, not frozen. If a defect appears that no law reaches, THAT is the signal — and it has not appeared in four sprints.",
    A10_accountant: "'the builder ships as counts and ranks with the meter dark — a strategy ACCOUNTANT, not a strategy builder.' TRUE, and the honest shape the pen chose → D63 OFF by the Operator's word. The Stamp does not move; but every count lands in the moat, so the day the pen reverses D63 the deflation lights over history already recorded, zero rework. The ruling costs the meter, not the memory.",
  },

  // ── THE POST-IMPLEMENTATION RED TEAM (PART F) — blocking re-pins, executed ──
  postImplementationRePins_partF: {
    RP1_d33Teeth: "F-1 CRITICAL — D33's state carries testRedesigns:n + redesignSearchHashes, rendered at the gate PERMANENTLY, never resets. (pinned in phase1_price.rp1_teeth)",
    RP2_axisFirst: "F-2 HIGH — DD-53 establishes WHICH independence effective_n measures BEFORE wiring; if cross-sectional (or unwirable into the frozen core), the rider STANDS. (pinned in phase1_price.dd53_autopsyMeetsSignature)",
    RP3_ownLeads: "F-3 HIGH — the own-capture number leads, retrospective beneath with revisability, window disparity stated; own-below-minimum → own UNJUDGEABLE + retro alone labelled weaker. (pinned in phase2_number.rp3_tierOrder)",
    RP4_filterOptional: "F-4 MEDIUM-HIGH — the filter is a NEW OPTIONAL hashed field; a manifest without one is unchanged (fixture ids before===after). (pinned in phase5_enumerator.rp4_filterHashed)",
    RP5_pinnedCopy: "F-5 MEDIUM-HIGH — the lineage view's copy is pinned VERBATIM, no LLM phrasing; a count and a list, nothing else. (pinned in phase6_lineageView.rp5_pinnedCopy)",
    RP6_coverageProxy: "F-6 MEDIUM — oracle-staleness coverage stated as what it is: a SHELF proxy for an UNMEASURABLE bar (positions held: 0). (pinned in phase3_exitKinds.dd56_oracleStaleness.rp6_coverageProxy)",
    RP7_frozenAtSeven: "F-7 MEDIUM — if the algebra sheds, the exit set is FROZEN AT SEVEN until it ships. (pinned in phase4_algebra.rp7_frozenAtSeven)",
    F8_performance: "LOW-MEDIUM — enumerate O(1284) trivial; selectionRank a sort trivial; false-fire O(captures) bounded; the RPC reads for oracle-staleness are the only new latency, bounded by the daily cadence + cached; the algebra REDUCES long-term complexity (7 hard-coded kinds → 3 combinators). The real new tax is the filter on the hashed surface (RP-4), permanent.",
    F9_cannotAnswer: "whether the one user will USE it — but for the first time the question is ANSWERABLE: the false-fire count says a number, so changedByCompile has something to be changed by; the amended criterion (D67) can measure it; the quarantine guarantees the counters are clean.",
  },

  // ── THE DEVIATIONS reserved/recorded this sprint (Operator-signed=false — LN5; the agent NEVER signs the gate) ──
  deviations: {
    D69: "RESERVED — D33's state recomputed with the D56 SEARCH counted (testRedesigns:1, never resets) + its i.i.d. rider (STANDS, quantified — harness-composition gap) or its dissolution per DD-53. Operator-signed=false.",
    D70: "RESERVED — the exit set reaches SEVEN; the algebra's pre-registered trigger FIRES as a FACT (algebra-trigger.json, content-hashed). Operator-signed=false.",
    D71: "RESERVED — the Family Enumerator + selection rank (a set operation; authors/ranks/suggests nothing; familyN === 1; the filter a NEW OPTIONAL hashed field). Operator-signed=false.",
    D72: "RESERVED — the lineage view (chronological, copy pinned verbatim, a PATH not a screen — screens stay 3). Operator-signed=false.",
    D73: "RESERVED — the oracle-staleness RPC exposure (reuses the governance screen's surface; D42 dissolved under D51). Operator-signed=false.",
    D74: "RESERVED — the Merkle / transparency layer is DEAD, not parked (an instrument has no external auditor by design). Retired with its reason. Operator-signed=false.",
    mr13: "MR9 carried a fourth sprint — discharged or recorded undischargeable in the log (not silently dropped).",
    mr17: "D57–D61 were reserved-but-unused (reserved for phases that shed) — RELEASED this sprint (no phase claimed them), stated so the ledger carries no cruft.",
    mr18: "the D51 supersession pointer — the base gate reads State.deviations() and renders the pointer to the V38-B ANSWERED ruling (S150).",
    operatorGatedNote:
      "D23–D74 present, D27 STILL FIRST (the fourteenth sprint) under 'the Stamp is knowingly generous until D27 is signed'; the FIRST gate section is TWO items alone — (1) D33 (recomputed state + testRedesigns + i.i.d. rider on the same line) and (2) D67 (⟨N⟩ STILL EMPTY, waiting for the pen — and now, for the first time, the instrument can FEED it: the false-fire count says a number, so changedByCompile has something to be changed by). D62-R Option A · D69–D74 · D46/D50/D54/D55 · IN2 (the ONLY validation left, every technical excuse now gone) · IN4 ✓ / AF4 (BLOCKED, no key). The agent presents the whole gate, NEVER signs it (LN5). D33 or D46 implemented while unsigned is the gravest Halt.",
  },

  // ── THE BUILD PHASES — the shed order, PINNED ──
  shedOrder: {
    rule: "Phases 1, 2, 5 NEVER SHED (the price, the number, the builder). Then Phase 4 (the algebra) sheds FIRST · then Phase 6 (the lineage view) · then Phase 3 (the exit kinds). A sprint that ships only 1, 2 and 5 is a SUCCESSFUL sprint: it pays for the pen it moved, makes the instrument speak, and starts the builder.",
    neverShed: ["1_price", "2_number", "5_enumerator"],
    shedOrderIfNeeded: ["4_algebra", "6_lineageView", "3_exitKinds"],
  },

  // ── THE RED TEAM — walls S140–S150 (S1–S139 carried and re-run) ──
  walls: {
    carried: "S1–S139 first-class, re-run (two identical battery runs).",
    built: ["S140", "S141", "S142", "S143", "S144", "S145", "S146", "S147", "S148", "S149", "S150"],
    S140: "a test whose estimand changes without an appended SEARCH FAILS (the D56 price, automatic forever). Search.forTestRedesign derives the LedgerEntry; a seeded estimand-change with no chained hash → Halt.",
    S141: "a producer flipping a deviation's state must emit {z, region, preRegisteredAt}; a boolean flip FAILS. Seeded negative: a flip object missing the evidence → REFUSED.",
    S142: "a deviation's state renders with every assumption-limit that bears on it; a SIGNABLE with an unattached bearing limitation FAILS. Seeded negative: D33 SIGNABLE with the i.i.d. rider stripped → Halt.",
    S143: "the terminal marker's treeHash matches /^[0-9a-f]{40}$/ and is re-derivable; prose in a hash slot FAILS. Seeded negative: 'the substance commit' in the hash slot → REFUSED (the V34 S90 mechanism, run on the terminal marker).",
    S144: "the clone battery is THIS tree's; a stale one FAILS. Seeded negative: a carried prior battery number in verifyOnClone → Halt.",
    S145: "the false-fire count emits a NUMBER wherever the series exists; a blanket UNJUDGEABLE FAILS; both tiers shown; no σ, no probability, no suggested threshold, no score, no comparative. Seeded negative: a materialized peg series that renders UNJUDGEABLE → Halt.",
    S146: "the two new kinds: deterministic, tiered, UNJUDGEABLE without capture, NO price; the coverage number is emitted. Seeded negative: oracle-staleness emitting a USD value → Halt.",
    S147: "the algebra: lineage ids AND exit evaluations byte-identical (two-sided). Seeded negative: a combinator that changes ANY fixture exit evaluation, including an UNJUDGEABLE case → Halt.",
    S148: "the enumerator authors nothing, ranks nothing, suggests nothing; familyN === 1 (a seeded activation FAILS); the filter re-statement is a SEARCH; the filter is a NEW OPTIONAL field (fixture ids before===after). Seeded negatives: a manifest emission, a family ordering, a 'consider instead', a seeded familyN>1, a moved fixture id → each Halts.",
    S149: "the lineage view: chronological only; a score-ordering FAILS; the search count renders; the copy is PINNED VERBATIM (no LLM); screens still 3. Seeded negative: a score-ordered lineage list, or generated prose on the surface → Halt.",
    S150: "ONE State.deviations() producer; two generated blocks asserting contradictory states of one deviation is UNREPRESENTABLE. Seeded negative: a second render hardcoding D51 OPEN while the producer says ANSWERED → Halt.",
  },

  // ── THE CONVERGENCE CRITERIA ──
  convergence: {
    rule: "two clean runs · identical expect() · verify exit 0 ON A FRESH CLONE OF THIS TREE · a real terminal tree + commit hash · bundle + differential byte-identical (no verdict moved) · familyN === 1 · frozen 0 drift · deps 2 · screens 3 · every producer agrees (S107) AND no deviation holds two states (S150).",
    halts: "a price unpaid or paid without recomputation · a state flip with no emitted evidence · an unattached assumption-limit · a blanket UNJUDGEABLE · a moved lineage id OR exit evaluation · an authored manifest · a ranked family · a lit meter (familyN>1) · LLM-generated prose on the lineage view · a prose tree-hash · a stale clone · a deviation holding two states · a third dependency · a fourth screen · D33 or D46 implemented while unsigned (LN5 — the gravest).",
  },

  // ── the constitution carried (byte-untouched; re-asserted for continuity) ──
  carried: {
    deps: ["hono", "zod"],
    screens: ["shelf", "reality-check", "ask"],
    newProductCapability: 0,
    lawsThisSprint: "ZERO — application, not legislation (a FOURTH sprint running; every V38 audit defect was an existing law under-applied)",
    laws: 17,
    exitKinds: 7,
    familyN: 1,
    reachableHumans: 1,
    published: false,
    frozenSevenNote:
      "the 6 .py + loop.ts + verdict-path 7 + frozen-core 2 byte-untouched (rigor.py READ never edited — the i.i.d. autopsy and its deflated companion run in the HARNESS, which is NOT in the frozen set; the frozen sha does not move); the scorecard differential + evidence bundle byte-identical at every gate (the corrections pay a price, show a number, reach a seventh kind, and count a family — none touches the scorecard verdict path); the Stamp familyN stays 1; no daemon; no new mass-path dependency.",
    evidenceBundleShaPrefix: "9c1e7bd8",
    killCriterion: "8b4e094b",
    d67NEmpty: "D67's ⟨N⟩ is STILL EMPTY — awaiting the pen; the false-fire count now gives changedByCompile something to be changed BY.",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const OUT = { ...PINS, pinsSha }
writeFileSync(path.join(H, "family-pins.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── FAMILY — the sprint contracts pinned (V39) ──────────────────")
console.log(`  carried from Substance : ${CARRIED_FROM.slice(0, 16)}…  (the pen moved — D51 ANSWERED = INSTRUMENT)`)
console.log(`  walls                  : S140–S150 (S1–S139 carried)`)
console.log(`  shed order             : 1,2,5 NEVER shed · then 4 · then 6 · then 3`)
console.log(`  FAMILY PINS_SHA        : ${pinsSha}`)
console.log("written: data/honesty/family-pins.json")
