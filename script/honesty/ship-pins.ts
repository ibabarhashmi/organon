/**
 * ORGΛNON — THE SHIP SPRINT (V40), the pins builder. Continues from the COMPLETE Family sprint (V39) —
 * carriedFromPinsSha = the Family head (2c299b9e). THE DIAGNOSIS: V39 broke its own record in four places, and three of them
 * are defects the previous sprint built walls against — S143 (a prose treeHash shipped), S144 (the clone never ran), S114
 * (verify's third sub-check vanished again), S108 (ten origin-less walls landed and the arithmetic still reconciled). Every
 * one of those walls is UNIT-TESTED and NONE was run against the artifact the sprint actually shipped. X-REACH(a) reaches
 * this exactly: a check that cannot fail WHERE IT MATTERS is not a check. So — NO NEW LAW (a FIFTH sprint) — the fix is the
 * move this project has made five times (the Act is derived, "green" is derived, `published` is derived, ONE
 * State.deviations() producer): THE SHIP GATE runs every wall against THIS sprint's REAL artifacts and REFUSES to emit a
 * build log if any fails. Not a checklist. A program that will not write.
 *
 * This pins, BEFORE a byte of Phase code, every contract of V40:
 *   · PHASE 1 — THE SHIP GATE (never sheds): the wall list run against the SHIPPED artifacts, the refusal log at the same
 *     path with no --force, the positive control proven on the REAL emit path (RP-1).
 *   · PHASE 2 — THE RIDER, ENFORCED (never sheds): τ_int + Newey-West composed from the FROZEN set (read, never edited),
 *     the τ_int threshold PRE-REGISTERED from the Stamp's own cut-points BEFORE any measurement (X-DERIVE(f)), the
 *     compounded generosity computed (D27 + the ≈5–13× overstatement), D33.riderEnforced.
 *   · PHASE 3 — THE GUARD'S REAL NUMBER (never sheds): MUTATION TESTING; the catalogue IS X-MANIFEST's banned-output list;
 *     guardEfficacy = caught/seeded, a RAW fraction with a LOWER-BOUND caveat.
 *   · PHASE 4 — THE SHARED-DEPENDENCY MAP (never sheds): a COUNT over a join (underlying · admin key · oracle feed); per-key
 *     coverage emitted; UNJUDGEABLE never "independent" (RP-4); copy PINNED VERBATIM; it never says "diversify".
 *   · PHASE 5 — THE CAPTURE VERB (sheds second): a VERB, no scheduler in the tree; the window and daysToJudgeable render.
 *   · PHASE 6 — THE RESIDUES (sheds first): oracle-staleness expanded or FROZEN at a named subset; the false-fire subject
 *     coverage emitted; MR13, MR17, MR19.
 * Hash-locked; deterministic; no network. The verbatim strings are pinned EXACTLY so a summarization is a detectable Halt.
 *
 * Run: bun run script/honesty/ship-pins.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")

// ── the CARRIED-FORWARD Family head (V39 — the instrument speaks a number; D33 SIGNABLE, testRedesigns 1, unsigned) ──
const FAMILY = JSON.parse(readFileSync(path.join(H, "family-pins.json"), "utf8"))
const CARRIED_FROM = FAMILY.pinsSha as string // 2c299b9e…

// ── VERBATIM PINS — pinned EXACTLY (a summarization is a detectable Halt) ──────────────────────────────────────────────

// PART A′ #5 / RP-5 (F-5) — the dependency map's copy is PINNED VERBATIM. No LLM phrasing on this surface: it renders a
// COUNT over a join and NOTHING ELSE. The one sentence away from "so diversify" is exactly the sentence a phrasing model
// would find, so there is no phrasing model here. A render that deviates from these strings FAILS.
const DEPEND_MAP_COPY_VERBATIM = {
  header: "positions that die together — a COUNT over a join. nothing ranked, nothing weighted, nothing suggested.",
  byUnderlying: "{n} of your {m} positions share the same underlying asset ({value}).",
  byAdminKey: "{n} of your {m} positions answer to the same admin key ({value}).",
  byOracle: "{n} of your {m} positions read the same oracle feed ({value}).",
  singleton: "no two of your positions share a resolved {key} — but absence of a resolved match is UNJUDGEABLE, never independence (RP-4).",
  unjudgeable: "{key}: UNJUDGEABLE for {n} of your {m} positions — {reason}. an unresolved dependency is INVISIBLE, not absent; this map never claims independence it cannot prove.",
  rule: "a count over a join. it ranks nothing, weights nothing, suggests nothing, and it NEVER says 'diversify'. the map's confidence is asymmetric: it may say two positions DEFINITELY share X; it may never say two positions DEFINITELY do NOT — the dangerous dependencies are the invisible ones (RP-4).",
}

// DD-62 / RP-3 (F-3) — the τ_int threshold, PRE-REGISTERED here, DERIVED from the Stamp's own cut-points, BEFORE a single
// τ_int is measured on anything (X-DERIVE(f)). Not chosen to make real data survive; derived from the statistics.
const RIDER_THRESHOLD = {
  rule: "the correction triggers when the confidence-inflation factor √τ_int exceeds a threshold DERIVED from the Stamp's own cut-points, not from the data. The Stamp's GO bar is DSR ≥ 0.95 (stamp.ts), i.e. z ≥ Φ⁻¹(0.95) = 1.6448536269514722. The frozen PSR z is (SR−SR*)·√(n−1)/denom; the serial-corrected z divides by ≈ √τ_int (n_eff = n/τ_int, so z_naive/z_corrected → √τ_int for large n). An inflation of 1.5× MATERIALLY changes a GO/NO-GO: it flips any naive-GO whose z sits within 50% of the bar (z ≤ 1.5·z* ≈ 2.467) to NO-GO. THEREFORE the trigger is √τ_int ≥ 1.5 ⟺ τ_int ≥ 2.25 — pinned from the cut-point and the material band, before measurement.",
  zStar: 1.6448536269514722,
  materialBand: "up-to-50%-above-the-bar (z ≤ 1.5·z*)",
  inflationTrigger: 1.5,
  tauIntTrigger: 2.25,
  possibleOutcome: "STATED IN ADVANCE (PART A′ #3): if honest correction leaves no real DeFi yield strategy with a surviving Stamp, that is a FINDING about DeFi yield strategies — not a bug. The Stamp going dark on corrected data is the tool working, not failing. The log reports how many of ORGΛNON's own captured series exceed the threshold — the measured answer, whatever it is; if EVERY series triggers, it says so.",
}

// DD-63 / PART A′ #7 — the mutation catalogue is NOT invented. It IS X-MANIFEST's banned-output list, written in
// manifest-pins.json before any guard existed, quoted here VERBATIM, plus the imperative/comparative/superlative shapes.
// The list was the test the whole time. The seeded sentences are pinned so the catch rate is reproducible and auditable.
const MANIFEST_BANNED_OUTPUTS = JSON.parse(readFileSync(path.join(H, "manifest-pins.json"), "utf8")).xManifest.a_declarativeOnly.bannedOutputs as string[]
const MUTATION_CATALOGUE = {
  source: "X-MANIFEST's banned-output list (data/honesty/manifest-pins.json, xManifest.a_declarativeOnly.bannedOutputs) — pinned before any guard existed. The list IS the mutation catalogue; it has been sitting in the constitution since the Manifest sprint (V31).",
  bannedOutputs: MANIFEST_BANNED_OUTPUTS,
  plusShapes: ["imperative", "comparative", "superlative"],
  // the CONCRETE advice-shaped mutations seeded into the render path — each derived from a banned shape or an added shape.
  // Guard.mutationRate runs the ONE GUARD (AdviceShape.detect via VoiceContract.compose) against each and counts catches.
  seeded: [
    "you should allocate 20% to this pool",       // banned: you should allocate / allocation
    "consider instead rotating into the higher-APY vault", // banned: consider instead
    "rebalance out of this position now",          // banned: rebalance
    "the optimal weights are 60/40 across these two", // banned: optimal weights
    "here is the recommended split for your capital", // banned: recommended split
    "your suggested allocation is 30% USDC 70% ETH", // banned: suggested allocation
    "ranked alternatives, best first: rotate to the top one", // banned: ranked alternatives
    "here are the rankings of these pools, top to bottom", // banned: rankings
    "your suggested weights are 50/50 across the pair", // banned: suggested weights
    "I recommend you buy the token today",         // shape: recommend + imperative
    "trim the position and size into the safer one", // shape: imperative-euphemism + size-into
    "go long here and add to your position",       // shape: go-long + add-to
    "this pool is better than that one, so move in", // shape: comparative + scale-move
    "this is the safest, highest-yielding strategy available", // shape: superlative
    "you may want to reduce your exposure before the unlock", // shape: prescriptive-you + imperative-euphemism
    "deposit into this pool for the best returns",  // shape: deposit-invest + superlative
    "put your money in the USDC vault instead",    // shape: deposit-invest
  ],
  lowerBoundCaveat: "guardEfficacy is a LOWER BOUND — the catalogue is a finite set of phrasings from V31, not the space of advice. A guard that catches all of them may still miss the phrasing nobody listed. The bound is printed WITH the number, always (F-5/RP-5); a 9/9 that calls itself complete is the most dangerous number in this sprint. The transcript corpus stays as the second, weaker, open-ended measure.",
}

const PINS = {
  protocol: "ship-pins",
  sprint:
    "THE SHIP SPRINT (V40): a wall that is tested but not applied is not a wall. V39's four record-breaks were three walls it BUILT against, unit-tested and never run against the shipped artifact. THE FIX (NO NEW LAW, a FIFTH sprint): the SHIP GATE — organon.sh ship runs every wall against THIS sprint's REAL artifacts and REFUSES to emit a build log if any fails, at the same path, with no --force. AND the rider gets teeth (the frozen Newey-West correction composed, τ_int threshold pre-registered). AND the guard gets a real number (mutation testing over X-MANIFEST's own banned-output list). AND the tool ships the one fact the curator-loss literature is about — the shared-dependency map, a count over a join. The whole Operator gate D23–D79, D27 STILL FIRST (the fifteenth sprint).",
  at: "2026-07-15",
  continues:
    "THE FAMILY SPRINT (V39) — battery 1793/2/0 across 274 files / 11660 expect(), verify exit 0, frozen 0 drift, bundle 9c1e7bd8 byte-identical, deps 2, screens 3, exit kinds 7, familyN 1, 17 laws / 0 minted for four sprints; D51 ANSWERED = INSTRUMENT, D33 SIGNABLE (testRedesigns 1) unsigned, D63 OFF",
  carriedFromPinsSha: CARRIED_FROM, // the Family head (2c299b9e) — the instrument speaks; this sprint makes the record un-lie-able
  chain: "2c299b9e ← 153628a9 (Substance) ← ab4900ee (Socket) ← 257684c0 (Derive) ← 8c80367a (Reach) ← 07d27f81 (Show) ← 96469dbb (Reckon) ← d90df3c7 (Cadence) ← 98a44bd8 (Manifest) ← 2b1dd373 (Domain) ← cc08a77b (Coverage) ← 6b285eba (Redesign) ← 3d0ef3bb (GroundTruth)",

  // ── NO NEW LAW — a FIFTH sprint running (V36's PART F pinned it; V37–V39 honored it; V40 too) ──
  noNewLaw: {
    rule: "SEVENTEEN laws stand; ZERO minted this sprint (the fifth running). Every V39 record-break was an existing law UNDER-APPLIED — to the sprint's own shipping artifacts. X-REACH(a): a check that cannot fail WHERE IT MATTERS is not a check (S143/S144/S114 pass their unit tests and were never run against the real marker, the real clone, the real verify). X-SHOWN(b): an invariant claimed but not shown is treated as NOT HELD (V39's log CLAIMS S143 holds while shipping the artifact S143 rejects). X-DERIVE(a): a generated marker with an unfilled placeholder is not derived, it is a template. The constitution reaches every one; the work is application — and this sprint makes application MECHANICAL.",
    laws: 17,
    minted: 0,
    sprintsWithoutALaw: 5,
    fourUnderApplied: {
      S143: "Marker.validate rejects prose in a treeHash slot — its unit test passes; it was never run against the actual terminal marker of V39, which contained ⟨filled post-commit⟩.",
      S144: "Clone.staleAgainst treats an absent clone as stale — its unit test passes; it was never run against the actual clone, which was never executed.",
      S114: "subcheckSetStable fails on a silent removal — its unit test passes; it was never run against the actual verify output, which lost its third sub-check again, one sprint after D54 restored it.",
      S108: "origins-at-mint makes an origin-less wall impossible — its unit test passes; ten real new walls landed in ORIGIN_UNRECORDED and the arithmetic (S107) still reconciled.",
    },
  },

  // ── THE DIAGNOSIS — the fix follows from it exactly ──
  diagnosis: {
    thesis: "the walls WORK; they were never RUN against the artifacts the sprint shipped. Marker.validate passes its test; nobody ran Marker.validate(the_real_marker). The fix is a program that refuses to write.",
    table: {
      "Marker.validate (S143)": "tested against a synthetic marker with seeded prose · NEVER run against the actual terminal marker of V39",
      "Clone.staleAgainst (S144)": "tested against a synthetic stale-commit case · NEVER run against the actual clone (which was never executed)",
      "subcheckSetStable (S114)": "tested against a synthetic removal · NEVER run against the actual verify output (which lost its third sub-check)",
      "S108 (origins at mint)": "tested against a synthetic origin-less wall · NEVER run against the ten real new walls that landed in ORIGIN_UNRECORDED",
    },
  },

  // ── THE FRAME (carried): D51 ANSWERED = INSTRUMENT raises the bar ──
  frame: {
    d51: "ANSWERED = INSTRUMENT (V38-B, the pen's word 'my personal tool'). The bar RISES: one user, he has the repo. V40 removes the last technical excuses — the record will be honest, the math will be safe, the guard will have a number, and the tool will say the one thing a curator's post-mortems are written about. What remains is a human opening a door, and that has never been a Phase. An instrument that ships a record it cannot trust has been DECORATED, not validated.",
    thesis: "everything the agent could build is built. V40 makes the record un-lie-able, the math un-silently-overstated, the guard measured, and names the positions that die together. realLineageCount: 0 — the door has never been opened.",
    reachableHumans: 1,
    reachableHumansNote: "reachableHumans: 1 is BY DESIGN under D51 (Reach.interpretation derives BY-DESIGN from the recorded D51 state, carried).",
  },

  // ── THE V39 EXECUTION-AUDIT FINDINGS — every one carried by name, with its V40 disposition ──
  auditFindings: {
    K1: "NO TERMINAL TREE HASH — second consecutive sprint, in the sprint that built S143 against it. X-SHOWN(c): a sprint that does not end in a hash did not end. → PHASE 1 (the ship gate; never sheds).",
    K2: "THE FRESH CLONE WAS NOT RUN — second consecutive sprint — and V39 added a live eth_call, the exact class a clone catches. → PHASE 1 (the clone runs AT SHIP TIME or the log is not emitted).",
    K3: "verify LOST ITS THIRD SUB-CHECK AGAIN — V38 restored it (D54) and built S114 ('G-2 never again'); it happened again one sprint later, no deviation entry. → PHASE 1 (S154: the sub-check set compared to DECLARED_SUBCHECKS AT SHIP TIME).",
    K4: "THE CENSUS'S ORIGIN_UNRECORDED GREW BY TEN — S108 (V38) was minted to make that structurally impossible; the arithmetic reconciled (S107 passed) and the substance regressed. → PHASE 1 (S155: origins enforced AT SHIP, not at unit-test time).",
    K5: "A 5–13× CONFIDENCE OVERSTATEMENT RENDERED AS A RIDER WHILE D33 STAYS SIGNABLE — the correction (nw_tstat) is already in the frozen set, unused. A sticky note on a loaded gun. → PHASE 2 (the rider, enforced; never sheds).",
    K6: "THE GUARD BLOCK IS MISSING; guardEfficacy prints a PROMISE, not a value — six sprints, one catch, 'said louder' twice, louder is not a mechanism. → PHASE 3 (mutation testing; never sheds; a real number at last).",
    K7: "BATTERY BASELINE DISCONTINUITY: 1706 (V38's marker) vs 1738 (V39's prev). S107 reconciles WITHIN a sprint and not ACROSS the boundary; thirty-two tests appeared unaccounted. → PHASE 1 (S156: continuity with the PREVIOUS sprint's terminal marker, at ship) + PHASE 6 (MR19 explains it).",
    K8: "THIN DEMONSTRATIONS — selectionRank 'rank 1 of 2'; oracle-staleness 3/1284 = 0.23%; the false-fire count's subject coverage unstated. → PHASE 6, and the dependency map (Phase 4) degrades across three join keys so 0.23% does not sink it.",
    K9: "capability added: 0 on a redefined criterion while shipping six things; MR13 dropped (fifth sprint); MR17 unaddressed. → PHASE 0/6 (MR13, MR17, MR19; report the TRUE capability count or drop the field).",
    K10: "ROADMAP — the curator-loss literature's core finding remains unbuilt: 'the losses came not from broken code but from configuration and operational context' — the failure mode is SHARED, INVISIBLE DEPENDENCY, and ORGΛNON now captures oracle addresses, admin keys, and underlyings. Joining them is one set operation. → PHASE 4 (the shared-dependency map; never sheds; the single most curator-relevant fact this tool could ship).",
  },

  // ── PART CLEAN — the pure functions, each with a seeded negative and a mint-time origin (S108, ENFORCED AT SHIP) ──
  partClean: {
    rule: "pure functions, each with a seeded negative and a mint-time origin enforced AT SHIP (S108/S155); deps 2, screens 3, familyN === 1, no law.",
    producers: {
      "Ship.gate": "(artifacts) → PASS | REFUSE{wall, artifact, value} — and Rollup will NOT write the build log on REFUSE (S151); the refusal IS the record (RP-2)",
      "Rider.correct": "(returns) → {tauInt, naive, corrected, threshold, enforced} — τ_int and the Newey-West statistic composed from the FROZEN set (read, never edited); checkFrozenSet 0 drift (S157)",
      "Guard.mutationRate": "(catalogue) → {seeded, caught, rate, holes[]} — the catalogue IS X-MANIFEST's banned-output list; the rate is a RAW fraction with a lower-bound caveat (S158)",
      "Depend.map": "(positions) → {byUnderlying, byAdminKey, byOracle, coveragePerKey} — a count over a join; it ranks nothing and never says 'diversify'; UNJUDGEABLE never 'independent' (S159)",
      "Capture.run": "(subjects) → PIT[] — a VERB; the tree contains no scheduler (S160)",
      "Battery.continuity": "(prevMarker) → Ok | Gap{n, unexplained} — continuity with the PREVIOUS terminal marker (S156)",
    },
  },

  // ── DD-61 — THE SHIP-GATE WALL LIST: every wall that runs against the SHIPPED artifacts, not synthetic inputs ──
  shipGateWallList: {
    rule: "enumerate from the four failures and generalise: Ship.gate() runs ALL of them against THIS sprint's REAL artifacts. If any fails, Rollup REFUSES TO WRITE THE BUILD LOG (RP-2 says what it writes instead). The seeded failure is PROVEN ON THE REAL EMIT PATH (RP-1), not in a unit test.",
    walls: {
      S152: "Marker.validate(the real terminal marker) — a ⟨placeholder⟩ or prose in the treeHash slot → REFUSE",
      S153: "the clone EXECUTES on this tree's commit (Clone.staleAgainst) — absent or stale → REFUSE",
      S154: "verify's actual sub-check set vs DECLARED_SUBCHECKS (Verify.subcheckSetStable) — a silent removal → REFUSE",
      S155: "this sprint's REAL new walls carry named origins (S108, at ship not unit-test time) — else REFUSE",
      S156: "battery continuity with the PREVIOUS sprint's terminal marker (K-7's 1706→1738 gap) — an unexplained delta → REFUSE",
    },
    alsoGated: "guardEfficacy is a VALUE not a promise (Phase 3) · the census reconciliation both directions (S107, S121) · every producer's claim → artifact link (S100/S107).",
  },

  // ── RP-2 (F-2) — THE REFUSAL-LOG SCHEMA: one artifact, same path, no --force, no second door ──
  refusalLogSchema: {
    rule: "F-2: a refusal log that coexists with a hand-written build log is worse than no gate. THE REFUSAL LOG AND THE BUILD LOG ARE THE SAME FILE PATH. Rollup writes ONE artifact: either the full log (all walls pass) or the refusal (any wall fails). There is no path by which both exist, and no --force. A seeded --force flag anywhere in the tree FAILS the battery. If the sprint ends in a refusal, THAT is the sprint's build log, and the next audit audits the refusal. An honest refusal is a better artifact than a dishonest success.",
    fields: ["refused: true", "wall (which failed)", "artifact (against what)", "value (with what value)", "at", "no phase prose, no claims, no gate"],
    samePath: "sprint/sprint-result/BUILDLOG-SHIP.md — one path, one writer (Ship.emit), no --force",
  },

  // ── PHASE 1 — THE SHIP GATE (S151–S156) — NEVER SHEDS. The sprint's spine. ──
  phase1_shipGate: {
    dd61: "the wall list (above) run against the SHIPPED artifacts. Ship.gate() → PASS | REFUSE{wall, artifact, value}. Rollup calls it and refuses to write on REFUSE.",
    rp1_realEmitPath: {
      rule: "F-1 (CRITICAL): a ship gate proven only in the battery is the fifth repetition of this project's oldest mistake. THE POSITIVE CONTROL IS AN END-TO-END COMMAND TRANSCRIPT: mutate the real marker → run THE REAL EMIT COMMAND → show the shell output containing the refusal AND that the build-log file was not written / not modified. No unit test satisfies this control. If the transcript is not in the log, the Ship Gate is NOT HELD (X-SHOWN(b)) and the sprint has failed its central objective.",
      seam: "a --seed-bad <slot> flag on the emit script (organon.sh ship) that corrupts the named marker slot BEFORE the gate — it can ONLY ever make the gate REFUSE, never PASS (the opposite of a --force; the V34 positive-control discipline applied to the emit path). The transcript is recorded in data/honesty/ship-positive-control.json and quoted in the build log.",
    },
    s151: "the Ship Gate: Rollup refuses to write on ANY failure; the refusal log names the wall, the artifact, and the value; the positive control is proven ON THE REAL EMIT PATH. Seeded negative: a seeded bad marker on the real emit path produces a refusal, not a build log.",
    s152: "a placeholder or prose in the real marker's treeHash slot → REFUSE (Marker.validate on the ACTUAL terminal marker, not a synthetic one). Seeded negative: '⟨filled post-commit⟩' in the treeHash → REFUSE.",
    s153: "the clone EXECUTES on this commit; absent or stale → REFUSE (Clone.staleAgainst on the actual pristine-clone transcript). Seeded negative: a clone transcript whose clonedCommit ≠ the terminal commit → REFUSE.",
    s154: "the real sub-check set vs DECLARED_SUBCHECKS → REFUSE on a silent removal (Verify.subcheckSetStable on the actual verify Result). Seeded negative: a verify Result missing 'battery-count-matches-committed' → REFUSE.",
    s155: "this sprint's REAL new walls (S151–S160) carry named origins → else REFUSE (S108 enforced at ship). Seeded negative: a new wall with no W-tag / originating defect → REFUSE.",
    s156: "battery continuity with the PREVIOUS sprint's terminal marker → REFUSE on an unexplained gap (Battery.continuity(prevMarker)). Seeded negative: a prev-marker battery number that does not reconcile with this sprint's baseline → Gap → REFUSE.",
  },

  // ── PHASE 2 — THE RIDER, ENFORCED (S157, D76) — NEVER SHEDS. ──
  phase2_rider: {
    dd62: "the harness composes what the frozen core cannot accept: (1) integrated_autocorr_time(returns) → τ_int (frozen, already there since V8) · (2) nw_tstat(returns) → the Newey-West statistic (frozen, already there since V8) · (3) render BOTH — the naive PSR/DSR AND the corrected one — with τ_int BESIDE them, so the user sees the haircut, not merely its result (RP-3). rigor.py is READ, never edited: checkFrozenSet() 0 drift. The TS composition ports the frozen formula clone-stably (the effectiven.ts precedent — acf/tauInt already ported), and a wall asserts the port reproduces the frozen formula on a canonical series.",
    threshold: RIDER_THRESHOLD,
    s157_enforcement: "with DEFLATION ACTIVE (if D63 is ever reversed) AND τ_int above the pre-registered threshold, the Stamp renders CORRECTED or UNJUDGEABLE — NEVER naive. A seeded naive-on-autocorrelated Stamp with deflation active FAILS the battery. D63 is OFF (familyN === 1), so the enforcement is ARMED, not firing on the live path — but the WALL proves it bites. D33 gains riderEnforced: true — the rider stops being a sticky note on a loaded gun.",
    compoundedGenerosity: {
      rule: "PART A′ #9: nobody has ever rendered the two known generosities together. The gate COMPUTES AND RENDERS: the Stamp is knowingly generous (D27, unsigned, 15 sprints) AND its confidence is overstated ≈ √τ_int on autocorrelated input (the rider, now enforced) — and here is the compounded figure. The number is the MEDIAN √τ_int over ORGΛNON's own captured series (the overstatement factor), rendered beside D27's qualitative generosity, stated to STACK: a generous verdict, made more generous.",
      d27: "the Stamp is knowingly generous until D27 is signed (unsigned, the fifteenth sprint).",
    },
    riderStandsNote: "the rider STANDS (HARNESS-COMPOSITION-GAP, carried from V39's determination): rigor.psr computes n internally and hard-codes √(n−1), so the serial correction cannot enter the frozen core — it is COMPOSED beside it. checkFrozenSet 0 drift; the bundle byte-identical (no verdict moved).",
  },

  // ── PHASE 3 — THE GUARD'S REAL NUMBER (S158) — NEVER SHEDS. Six sprints owed. ──
  phase3_guard: {
    dd63: "MUTATION TESTING. Seed each advice-shaped mutation into the render path; run the ONE GUARD (AdviceShape.detect composed at VoiceContract.compose); guardEfficacy = caught / seeded — a NUMBER, deterministic, reproducible, independent of any LLM. Six sprints of waiting for a model to misbehave, when the banned-output list was the test all along.",
    catalogue: MUTATION_CATALOGUE,
    s158: "guardEfficacy is a RAW fraction in the header (if it catches 13 of 15, it says 13/15) WITH its lower-bound caveat, ALWAYS. Every uncaught mutation is a NAMED HOLE, routed to the gate. The transcript corpus continues as the SECOND, weaker measure (a different lab; the new surfaces — the enumerator's facts, the selection rank, the dependency map). Seeded negative: a guardEfficacy rendered WITHOUT its lower-bound caveat → Halt; an uncaught mutation left un-named → Halt.",
  },

  // ── PHASE 4 — THE SHARED-DEPENDENCY MAP (S159, D77) — NEVER SHEDS. The curator's whole question. ──
  phase4_dependencyMap: {
    dd64: "the literature's founding sentence — 'the losses came not from broken code but from configuration and operational context' — is a statement about SHARED, INVISIBLE DEPENDENCY. Depend.map(positions) is a COUNT OVER A JOIN on THREE keys, degrading gracefully: (a) UNDERLYING ASSET (from pool metadata, coverage ≈ total) · (b) ADMIN KEY (from the governance screen: IMMUTABLE / GATED / EOA / UNRESOLVED, coverage high) · (c) ORACLE FEED (from V39's latestRoundData capture, coverage 3/1284 today, and it SAYS SO). PER-KEY COVERAGE IS EMITTED — a key that cannot resolve renders UNJUDGEABLE for that key, never a silent zero.",
    copyVerbatim: DEPEND_MAP_COPY_VERBATIM,
    rp4_asymmetricConfidence: {
      rule: "F-4 (blocking): two pools whose admin resolves to the same PROXY or the same MULTISIG FACTORY are NOT the same key-holder; a GATED (timelock) is not an EOA. A false '2 of your 5 answer to the same admin key' is a fabricated correlation — worse than silence. The join matches on THE RESOLVED TERMINAL AUTHORITY, and where the resolution is ambiguous (a proxy, an unverified contract, an unknown factory) it renders UNJUDGEABLE for that pair, NEVER a match. The map's confidence is ASYMMETRIC: it may say 'these two definitely share X'; it may NEVER say 'these two definitely do NOT share X' — absence of a resolved match is UNJUDGEABLE, not independence. The dangerous dependencies are the invisible ones; claiming independence you cannot prove is the exact failure the tool exists to prevent.",
    },
    controls: "it ranks nothing (a seeded ordering FAILS) · weights nothing · suggests nothing · NEVER says 'diversify' or any advisory phrase (a seeded 'diversify' / 'reduce exposure' / 'consider' / any imperative / any comparative FAILS) · the copy is PINNED VERBATIM (no LLM on this surface) · per-key coverage emitted · UNJUDGEABLE never 'independent' · renders in the drawer and speakable in both registers, through the ONE GUARD (whose catch rate is now measured, Phase 3).",
  },

  // ── PHASE 5 — THE CAPTURE VERB (S160, D78) — sheds second ──
  phase5_capture: {
    dd65: "organon.sh capture — a VERB, not a service: snapshot the pinned subjects' observables, append to the moat, PIT-honest, content-hashed, tiered REAL@ts. ORGΛNON schedules NOTHING (no daemon, no cron, no service, no systemd unit, not even a suggested crontab line in the docs). The Operator runs it on his own schedule. The window and daysToJudgeable are RENDERED, so the false-fire count's own-capture leg has a visible path from UNJUDGEABLE to a number.",
    rp6_capturesNotDays: "F-6: daysToJudgeable renders as '⟨n⟩ CAPTURES (not days) — at your current cadence of ⟨measured⟩ captures, this is UNJUDGEABLE'. The unit is CAPTURES, because captures are what ORGΛNON can count. X-HONEST: do not convert a count you have into a date you cannot know.",
    s160: "capture is a verb; the tree contains NO scheduler (a wall greps for daemon/cron/setInterval/setTimeout-loop/service/systemd) — a seeded daemon/cron FAILS; the window and daysToJudgeable render (in captures, not days). Seeded negative: a scheduler line in the tree, or a daysToJudgeable rendered in days → Halt.",
    noSchedulerNote: "PART A′ #6: it is a VERB. The Operator's own scheduler is the Operator's business, and it is not shipped. The tool renders the window and stops.",
  },

  // ── PHASE 6 — THE RESIDUES (sheds first) ──
  phase6_residues: {
    dd66_d79: "oracle-staleness — attempt expansion to a NAMED, PINNED protocol subset (reuse the governance screen's per-protocol resolution) and emit the new coverage; OR if it cannot exceed a pinned floor, FREEZE it at its named subset and say so — 'this kind resolves for these N feeds and is UNJUDGEABLE elsewhere' — which is honest and names its own boundary (D79).",
    k8_coverage: "emit the false-fire count's subject coverage (as oracle-staleness emits its coverage); demonstrate the enumerator on a realistic family where feasible ('rank 1 of 2' proves plumbing, not the concept).",
    mr13: "MR9 carried a FIFTH sprint — discharged or recorded undischargeable in the log (not silently dropped).",
    mr17: "the D57–D61 reservations (reserved for phases that shed) — released or accounted, so the ledger carries no cruft.",
    mr19: "the 1706→1738 baseline gap (K-7) EXPLAINED — the 32 tests are V38-B's Surrogate Addendum (a distinct commit after V38's marker; V38's terminal marker recorded 1706 before the addendum's 32 tests landed). S156 now makes an unexplained cross-boundary gap impossible to repeat.",
    k9_capability: "report the TRUE capability count (the ship gate, the enforced rider, the guard's number, the dependency map, the capture verb — DISCLOSED and priced), or drop the field.",
  },

  // ── THE FENCE — refused this sprint, by name ──
  fence: {
    refused: [
      "the deflation / K-activation / the meter (D63 is OFF by the pen — familyN === 1; a seeded activation FAILS; Phase 2 builds the SAFETY for a meter that is not lit)",
      "the Proposer (D62-R Option A: the pen alone)",
      "the Adversary (trigger pinned: after the first REAL lineage; realLineageCount: 0)",
      "the post-mortem (same)",
      "D38 (the composite verdict)",
      "any daemon, cron, scheduler, service, port, or listener (capture is a VERB)",
      "a hosted tier · reports/API-as-product · execution / custody / wallets",
      "valuation / USD (a count over a join, a τ_int, a catch rate, and a coverage fraction are counts, times, and ratios — never a price)",
      "Markowitz / any optimizer · any advisory output — and 'diversify' is advice",
      "any new mass-path dependency (deps stay 2)",
      "the Merkle layer (DEAD, D74) · marketplace / leaderboard / ranking",
      "a second law (seventeen; five sprints)",
      "an eighth exit kind through the enum (the algebra shipped — a new kind goes through the combinators)",
    ],
  },

  // ── PART A′ — THE ADVERSARIAL VALIDATION RECORD (this plan, attacked before design) ──
  adversarialRecord_partA: {
    A1_shipTheShipGate: "'The Ship Gate is code. Code that is tested but not applied is the exact defect it exists to fix. Who ships the ship gate?' THE FATAL RECURSION → Rollup CALLS Ship.gate() and REFUSES TO WRITE; the proof is NOT a unit test — seed a prose treeHash into the REAL artifact, run the REAL emit command, and show that no build log is produced (RP-1). A ship gate proven only in the battery is the fifth repetition of this project's oldest mistake.",
    A2_silence: "'A gate that refuses to emit produces SILENCE, and a sprint with no record is worse than one with a flawed one.' LANDS → a failing gate emits a REFUSAL LOG (RP-2): exactly which wall failed, against which artifact, with what value, and no phase prose. The refusal IS the record. A build log that says 'I could not honestly be written, and here is why' is the most honest artifact this project could produce.",
    A3_riderSilencesAll: "'Enforcing the rider may silence the Stamp for ALL real data — τ_int 27–165 is a 5–13× haircut, nothing survives.' THE SHARPEST ATTACK, and the honest answer is that this MIGHT BE TRUE — and if it is, it is a FINDING, not a bug → render BOTH numbers with τ_int beside them; pin the threshold BEFORE computing; state the possible outcome in advance in the pins. The Stamp going dark on corrected data is the tool working.",
    A4_sixthDecoration: "'The shared-dependency map needs oracle addresses, and you have 3 of 1284. It is the sixth decoration.' Would be — on one join key → THREE keys, degrading gracefully; it can always say '4 of your 5 share USDC' even when it can say nothing about oracles. PER-KEY COVERAGE IS EMITTED. A fact that names its own blind spots is not a decoration.",
    A5_oneSentenceFromAdvice: "''3 of 5 share one oracle' is one sentence away from 'so diversify.'' Lands — the guard's efficacy has been unknown for six sprints, which makes it worse → seeded negatives on the fact itself ('diversify' / 'reduce exposure' / 'consider' / any imperative / any comparative → FAILS); the copy is PINNED VERBATIM; and Phase 3 lands FIRST-CLASS so the guard has a MEASURED catch rate before this fact ships.",
    A6_captureIsADaemon: "'organon.sh capture is a daemon with a manual trigger.' Fair, the boundary must be surgical → it is a VERB. ORGΛNON schedules nothing — no daemon, no cron file, no service, not even a suggested crontab line in the docs (a wall greps the tree). The Operator's own scheduler is the Operator's business.",
    A7_selfGradedExam: "'Six sprints of UNJUDGEABLE, and now you invent a new metric that will conveniently produce a high number.' Lands — a self-designed mutation catalogue is a self-graded exam → THE CATALOGUE IS NOT INVENTED — it is X-MANIFEST's own banned-output list, written in V31 before any guard existed. And the catch rate is reported RAW — if the guard catches 13 of 15, the header says 13/15. A number that can embarrass you is a number worth having.",
    A8_frozenConstitution: "'Five sprints without a law is a constitution nobody dares touch.' The evidence answers → every V39 defect is X-REACH(a) / X-SHOWN(b) / X-DERIVE(a) under-applied to the sprint's own shipping artifacts. The constitution reached all four. What was needed was a program that refuses to write.",
    A9_compoundedGenerosity: "'D27 is fifteen sprints old — the Stamp is knowingly generous — and NOW you have measured a 5–13× confidence overstatement on top of it. Two known generosities, compounding, both unsigned.' LANDS, and nobody has ever rendered them together → the gate COMPUTES AND RENDERS THE COMPOUNDED GENEROSITY in one line. The Operator has never seen these two facts together, and he should.",
    A10_fourthPolishSprint: "'Everything the agent could build is built. This is the fourth sprint of polishing an instrument its one user has never opened.' True, and it is stated at the gate rather than argued away → realLineageCount: 0 · IN2 unperformed. V40 removes the last technical excuses. What remains is a human opening a door, and that has never been a Phase.",
  },

  // ── PART F — THE POST-IMPLEMENTATION RED TEAM — blocking re-pins, executed ──
  postImplementationRePins_partF: {
    RP1_realEmitPath: "F-1 CRITICAL — the positive control is an end-to-end command transcript: mutate the real marker → run the real emit → show the refusal and that no build log was written. No unit test satisfies it. (pinned in phase1_shipGate.rp1_realEmitPath)",
    RP2_samePathNoForce: "F-2 HIGH — the refusal log and the build log are THE SAME FILE PATH; one writer, no --force (a seeded --force FAILS). (pinned in refusalLogSchema)",
    RP3_thresholdDerived: "F-3 HIGH — the τ_int threshold is DERIVED from the Stamp's cut-points, pinned BEFORE measurement; the log reports how many own series exceed it. (pinned in phase2_rider.threshold)",
    RP4_asymmetricConfidence: "F-4 MEDIUM-HIGH — the admin-key join matches on the RESOLVED TERMINAL AUTHORITY; ambiguous → UNJUDGEABLE, never a match; absence of a match is UNJUDGEABLE, never independence. (pinned in phase4_dependencyMap.rp4_asymmetricConfidence)",
    RP5_lowerBound: "F-5 MEDIUM — guardEfficacy is a LOWER BOUND, printed WITH the number always; the corpus stays as the second, weaker, open-ended measure. (pinned in phase3_guard.catalogue.lowerBoundCaveat)",
    RP6_capturesNotDays: "F-6 MEDIUM — daysToJudgeable renders in CAPTURES, not days; at the measured cadence it is UNJUDGEABLE. (pinned in phase5_capture.rp6_capturesNotDays)",
    RP7_orderedNeverSheds: "F-7 MEDIUM — the four never-sheds are ordered by dependency and each independently shippable: Phase 1 (the gate, first) · Phase 2 (a harness composition) · Phase 3 (a catalogue and a loop) · Phase 4 (a join). If Phase 4 cannot land it sheds and the sprint says so; Phases 1–3 still constitute a successful sprint.",
    F8_performance: "LOW-MEDIUM — the Ship Gate adds a clone run to every emit (minutes, not seconds — the correct cost, paid once per sprint). Depend.map is O(positions²), positions ≤ 50, trivial. The mutation loop is O(catalogue). capture is O(subjects). The real new tax is that a failing wall now costs a sprint its build log — and that is the point.",
    F9_cannotAnswer: "whether the one user will USE it. realLineageCount: 0; IN2 unperformed. After V40 the record cannot lie, the math cannot silently overstate, the guard has a measured number, and the tool can name the positions that die together. The next line belongs to a human opening a door, and it has never been a Phase.",
  },

  // ── THE DEVIATIONS reserved/recorded this sprint (Operator-signed=false — LN5; the agent NEVER signs the gate) ──
  deviations: {
    D75: "RESERVED — THE SHIP GATE: Rollup refuses to write the build log if any wall fails against the real artifacts; the refusal is the record (same path, no --force). Operator-signed=false.",
    D76: "RESERVED — THE RIDER, ENFORCED: τ_int + Newey-West composed from the frozen set; the threshold pre-registered; D33 gains riderEnforced: true; the compounded generosity rendered. Operator-signed=false.",
    D77: "RESERVED — THE SHARED-DEPENDENCY MAP: a count over a join (underlying · admin key · oracle feed); per-key coverage; UNJUDGEABLE never independence; never 'diversify'; copy pinned verbatim. Operator-signed=false.",
    D78: "RESERVED — THE CAPTURE VERB: a verb, no scheduler in the tree; window + daysToJudgeable (in captures). Operator-signed=false.",
    D79: "RESERVED — oracle-staleness expanded to a named pinned subset OR FROZEN at its named subset and said so. Operator-signed=false.",
    mr13: "MR9 carried a fifth sprint — discharged or recorded undischargeable in the log.",
    mr17: "the D57–D61 reservations — released or accounted (no phase claimed them), stated so the ledger carries no cruft.",
    mr19: "the 1706→1738 baseline gap explained (V38-B's 32 addendum tests landed after V38's 1706 marker); S156 makes it impossible to repeat.",
    operatorGatedNote:
      "D23–D79 present, D27 STILL FIRST (the FIFTEENTH sprint) under 'the Stamp is knowingly generous until D27 is signed'; the FIRST gate section is THREE items alone — (1) THE COMPOUNDED GENEROSITY (D27's generosity AND the ≈5–13× overstatement, with the compounded figure), (2) D33 (SIGNABLE · testRedesigns 1 · riderEnforced true · unsigned), (3) D67 (⟨N⟩ STILL EMPTY, and now the false-fire count's own-capture window has a daysToJudgeable, so changedByCompile has a date it becomes measurable). D62-R (ratify or strike) · D75–D79 · D46/D50/D54/D55 · IN2 (the ONLY validation left). The agent presents the whole gate, NEVER signs it (LN5). D33 or D46 implemented while unsigned is the gravest Halt.",
  },

  // ── THE BUILD PHASES — the shed order, PINNED ──
  shedOrder: {
    rule: "Phases 1, 2, 3, 4 NEVER SHED (the record must be true · the math must be safe · the guard must have a number · the tool must say the thing worth saying). Then Phase 6 sheds FIRST · Phase 5 second. A sprint that ships only 1, 2, 3 and 4 is a SUCCESSFUL sprint. F-7: the four are ordered by dependency and each independently shippable; naming four never-sheds and shedding one silently is exactly the defect this sprint exists to end.",
    neverShed: ["1_shipGate", "2_rider", "3_guard", "4_dependencyMap"],
    shedOrderIfNeeded: ["6_residues", "5_capture"],
  },

  // ── THE RED TEAM — walls S151–S160 (S1–S150 carried and re-run, and now RUN AGAINST THE SHIPPED ARTIFACT AT SHIP TIME) ──
  walls: {
    carried: "S1–S150 first-class, re-run (two identical battery runs) — and now every one runs against the SHIPPED artifact at ship time, not only against a synthetic input in the battery (S151).",
    built: ["S151", "S152", "S153", "S154", "S155", "S156", "S157", "S158", "S159", "S160"],
    S151: "the Ship Gate: Rollup refuses to write on any failure; the refusal names the wall, the artifact, and the value; the positive control is proven ON THE REAL EMIT PATH. Seeded negative: a seeded bad marker on the real emit → a refusal, not a build log.",
    S152: "a placeholder or prose in the real marker's treeHash → REFUSE (Marker.validate on the ACTUAL terminal marker). Seeded negative: prose in the treeHash slot → REFUSE.",
    S153: "the clone executes on this commit; absent → REFUSE (Clone.staleAgainst on the actual transcript). Seeded negative: clonedCommit ≠ terminal commit → REFUSE.",
    S154: "the real sub-check set vs DECLARED_SUBCHECKS → REFUSE on a silent removal. Seeded negative: a verify Result missing the third sub-check → REFUSE.",
    S155: "this sprint's real new walls carry origins → else REFUSE (S108 at ship). Seeded negative: an origin-less new wall → REFUSE.",
    S156: "battery continuity with the previous terminal marker → REFUSE on an unexplained gap. Seeded negative: a discontinuous prev/added/removed → Gap → REFUSE.",
    S157: "the rider: τ_int and the corrected statistic rendered BESIDE the naive; a naive Stamp on autocorrelated input with deflation active FAILS; the threshold PRE-REGISTERED; checkFrozenSet 0 drift; the TS port reproduces the frozen formula. Seeded negative: deflation active + high τ_int + a naive render → Halt.",
    S158: "guardEfficacy is a raw fraction WITH its lower-bound caveat; every uncaught mutation is a named hole. Seeded negative: a guardEfficacy without the lower-bound caveat, or an unnamed uncaught mutation → Halt.",
    S159: "the dependency map: a count over a join; per-key coverage emitted; a seeded 'diversify' / imperative / comparative / ranking FAILS; the copy pinned verbatim; UNJUDGEABLE never 'independent'. Seeded negatives: a 'diversify', a ranked family, a claimed independence → each Halts.",
    S160: "capture is a verb; the tree contains no scheduler (a seeded daemon/cron FAILS); the window and daysToJudgeable render (in captures, not days). Seeded negatives: a scheduler in the tree, a daysToJudgeable in days → each Halts.",
  },

  // ── THE CONVERGENCE CRITERIA ──
  convergence: {
    rule: "two clean runs · identical expect() · the clone RAN on this tree · a real, re-derivable terminal tree + commit hash · verify with all three sub-checks · bundle + differential byte-identical (no verdict moved) · familyN === 1 · frozen 0 drift · deps 2 · screens 3 · every producer agrees (S107) · no deviation holds two states (S150) · AND Rollup would have refused to write any of it if one wall had failed (S151).",
    halts: "a build log that exists while a wall failed (the gate must have refused) · a --force flag anywhere in the tree · a placeholder in a hash slot · an unrun clone · a vanished sub-check · an origin-less new wall · an unexplained battery gap · a naive Stamp on autocorrelated input with deflation active · a threshold nothing reaches · a guardEfficacy without its lower-bound caveat · a claimed independence the map cannot prove · a 'diversify' · a scheduler · a third dependency · a lit meter (familyN>1) · D33 or D46 implemented while unsigned (LN5 — the gravest).",
  },

  // ── the constitution carried (byte-untouched; re-asserted for continuity) ──
  carried: {
    deps: ["hono", "zod"],
    screens: ["shelf", "reality-check", "ask"],
    newProductCapability: 4,
    newProductCapabilityNote: "4 DISCLOSED capabilities (the ship gate, the enforced rider, the guard's measured number, the dependency map) — the capture verb and the residues are plumbing/records. Reported honestly, not a Halt: the roadmap was OWED to V40 (K-9/K-10), and the shed order protects the record, the math, the guard, and the map.",
    lawsThisSprint: "ZERO — application, not legislation (a FIFTH sprint running; every V39 record-break was an existing law under-applied to the sprint's own shipping artifacts)",
    laws: 17,
    exitKinds: 7,
    familyN: 1,
    reachableHumans: 1,
    published: false,
    frozenSevenNote:
      "the 6 .py + loop.ts + verdict-path 7 + frozen-core 2 byte-untouched (rigor.py + effective_n.py READ never edited — the Newey-West correction runs in the HARNESS, which is NOT in the frozen set; the frozen sha does not move); the scorecard differential + evidence bundle byte-identical at every gate (the ship gate, the rider, the guard's number, the map, the capture verb — none touches the scorecard verdict path); the Stamp familyN stays 1; no daemon; no new mass-path dependency.",
    evidenceBundleShaPrefix: "9c1e7bd8",
    killCriterion: "8b4e094b",
    d67NEmpty: "D67's ⟨N⟩ is STILL EMPTY — awaiting the pen; the false-fire count's own-capture window now has a daysToJudgeable, so changedByCompile has a date it becomes measurable.",
  },
}

const pinsSha = sha256(JSON.stringify(PINS))
const OUT = { ...PINS, pinsSha }
writeFileSync(path.join(H, "ship-pins.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── SHIP — the sprint contracts pinned (V40) ──────────────────────")
console.log(`  carried from Family    : ${CARRIED_FROM.slice(0, 16)}…  (the instrument speaks — D33 SIGNABLE, testRedesigns 1)`)
console.log(`  walls                  : S151–S160 (S1–S150 carried, now RUN at ship time)`)
console.log(`  shed order             : 1,2,3,4 NEVER shed · then 6 · then 5`)
console.log(`  τ_int threshold        : √τ_int ≥ ${RIDER_THRESHOLD.inflationTrigger} ⟺ τ_int ≥ ${RIDER_THRESHOLD.tauIntTrigger} (pre-registered from the DSR 0.95 cut-point)`)
console.log(`  mutation catalogue     : ${MUTATION_CATALOGUE.seeded.length} seeded (X-MANIFEST's banned-output list + shapes)`)
console.log(`  SHIP PINS_SHA          : ${pinsSha}`)
console.log("written: data/honesty/ship-pins.json")
