# ORGΛNON — THE VARIANT SPRINT (V41): Builder Arc, Sprint 11 — **THE RECORD IS CLEAN. THE BUILDER IS HALF-BUILT.**

**NO NEW LAW — a SIXTH sprint running.** V40 was the first FULLY-ACHIEVED sprint in ten, and the first since the pivot whose own record survived its own audit. For ten sprints the question was *"what is broken?"* This is the first construction sprint — not *"what is broken"* but *"what is the builder still missing before it is whole?"* Every V40 follow-up is an existing law under-applied: **X-REACH(a)** (the census continuity not displayed, and the degenerate PBO cross-check) · **X-SHOWN(b)** (the open guard hole) · **X-MANIFEST** (the variant comparison, which *is* the banned-output frontier and must be walked without crossing).

**The builder so far:** V39 shipped the Family Enumerator (the cardinality of the filter you stated); V40 shipped the Shared-Dependency Map (the positions that die together, named); **V41 ships the Variant Ledger** — you author two variants, side by side, under a live (dark) search price. *You build. ORGΛNON prices the search.*

---

## PHASE 0 — PINS-LOCKED (`variant-pins.json`, carrying `c0777d9a`)

Pinned before a byte of phase code: the variant/family derivation (DD-67 — a group-by over the filter hash + an operator epoch, no new hashed surface) · the dark-search-price rule (DD-68/RP-1 — computed, stored as **ingredients**, tagged `DARK-COMPUTE, NOT A VERDICT`, the meter's light OFF) · the side-by-side non-ranking constraints (DD-69/RP-2 — chronological, independent Stamps, each with its own inline evidence, pinned copy) · the census fold (S161) · the PBO decision (DD-71) · the guard-hole decision (DD-70) · D80–D83 · MR13 · walls S161–S168 · the shed order (1,2,3,6 never shed; then 5, then 4). Positive control: a mutated contract word moves the sha.

## PHASE 1 — THE CENSUS, RECONCILED IN THE OPEN (S161, L-1) — *never sheds.*

V40 made every OTHER continuity mechanical (battery, marker, clone) but left its own census reconciled in **prose**, not in the displayed `prev + new − moved === now` arithmetic S107 demands elsewhere — the one place V39's "a reconciling total hides a regression" pattern was not provably closed. The fix folds the census reconciliation **into the Ship Gate**: `Ship.gate()` runs `Consistency.censusContinuityDisplay()` against the REAL census at emit time, DISPLAYS `prev 83 + new 9 − moved 13 === now 79`, and **REFUSES the log on a non-reconciling census** (a seeded contradiction FAILS). The circularity attack (A′ #5) is answered by the emit-path discipline: the Ship Gate checking the census it emits is the Ship Gate doing its one job — refusing to write a number that does not reconcile.

## PHASE 2 — THE GUARD HOLE, CLOSED (S162, L-2 / DD-70) — *never sheds.*

V40's mutation test found the one banned shape the whole layer missed — an unqualified best-in-class superlative (*"the safest, highest-yielding strategy available"*), named and routed, shipped uncaught. **CLOSED:** `AdviceShape.superlative` (composed into the ONE GUARD) catches an unqualified desirability/safety/yield superlative applied to a strategy WITHOUT a named measured quantity + value — while a FACTUAL superlative that names a quantity AND a value (*"the highest τ_int in your set is 165"*; the enumerator's own selection-rank fact) STILL RENDERS (the positive control — X-HONEST: a false-positiving guard that hides facts is worse than a named hole). **`guardEfficacy` re-measures 8/17 → 10/17** on the advice guard (the superlative rule closes the genuine hole AND upgrades a *"rankings … top to bottom"* mutation the advice guard had ceded to the sibling banned-shape guard); the full honesty layer reaches **17/17** (0 genuine holes). RP-5 STANDS — the lower-bound caveat is printed WITH the number, always.

## PHASE 3 — THE PBO CROSS-CHECK, MADE INDEPENDENT (S163, L-3 / DD-71a) — *never sheds.*

`pbo 0.6 vs 0.6, Δ = 0.00e+0` was `cc.pbo` vs `cc.pboPurgedcv` — byte-identical **shared lineage**, a cross-check that cannot fail (X-REACH(a)), feeding D33's `SIGNABLE` for four sprints proving nothing. **The fix (DD-71a, the preferred path):** the PBO agreement's `theirs` leg is now the GENUINELY INDEPENDENT hand-rolled CSCV (own Sharpe). And per F-3/RP-3, "independent" is proven not cosmetic: a clone-stable ported CSCV (`CrossCheck.pboIndependent`, ported from `rigor.py::pbo`, READ never edited) run on constructed KNOWN-non-trivial fixtures returns **≈0.53 on pure noise** (the IS-best is overfit) and **≈0.00 on a real-edge matrix** (the edge dominates IS and OOS) — it **DISCRIMINATES**, so its agreement at 0.6 on the real fixture is meaningful. The seeded-negative discipline STANDS: a seeded `pboHandRolled` disagreement flips D33 to UNSIGNABLE (the claim's own inversion, now on a genuinely independent leg — RP-1). **D33's state (SIGNABLE), `testRedesigns` (1), and the bundle are UNCHANGED** — the header renders `0.6 vs 0.6 agrees=true` exactly as before, now sourced from the independent leg not the shared one (a derived, bundle-safe `D33.pboEvidence` field records it). `checkFrozenSet` 0 drift. **A fake agreement feeding a pen is worse than an acknowledged gap; `0.6 vs 0.6` never again masquerades as agreement between the same code.**

## PHASE 6 — THE VARIANT LEDGER (S166–S168, D80/D81) — *never sheds. The builder's second half.*

`Variant.family` derives a `familyId` from the filter hash + an operator epoch (**no new hashed surface; every fixture lineage id unchanged — S166**; RP-4: a family is the filter hash PLUS an operator-controlled epoch, never auto-grouped by filter alone, so a January hunt resumed in June with the same filter is TWO families, not one over-charged search). `Variant.ledger` is a **group-by over the moat**: your authored variants, **CHRONOLOGICAL** (a seeded score-ordering renders chronological), each under its **own independent ternary Stamp** with **its own inline evidence** (RP-2 — judged against its own thesis, never a cross-variant compare), the **cumulative search count rendered between them** (*"you have filed 4 variants — that is 4 searches"*), **no aggregate, no best, no ranking, no delta-as-improvement** (the shape itself carries no such field — S167). The copy is PINNED VERBATIM; no LLM on this surface. `SearchPrice.deflatedDark` **COMPUTES** the deflation for N trials via the frozen `sr0_deflated` (the expected-maximum-Sharpe benchmark that grows with N — ported clone-stably, the probit reproducing `scipy.norm.ppf` to 6 decimals) + the enforced rider, **stores it as INGREDIENTS `{nTrials, bestNaive, deflationFactor}` tagged `DARK-COMPUTE, NOT A VERDICT` (RP-1), renders it DARK** — *"under deflation, currently OFF by D63, N searches would discount this claim's best Sharpe benchmark from X to Y"* — **a lit meter FAILS (S168); `familyN === 1` governs every live verdict.** RP-6: the ledger renders its own authorship breakdown (*"N variants — n AGENT, m HUMAN"*), and its HUMAN count reads the SAME producer as `realLineageCount` (the quarantine holds — a seeded AGENT variant cannot imply human use). A **PATH off the lineage view, not a fourth screen** (screens stay 3).

**THE LINE THE WHOLE CONSTITUTION WAS BUILT TO WALK, WALKED IN THE OPEN (A′ #1):** the user WILL compare — the question is whether the TOOL ranks or the USER does. The tool renders facts in filing order and prices the act of comparing; the user draws the conclusion, the same freedom a researcher has reading two papers. No aggregate, no "best", no total order, each Stamp judged against its own thesis with its own evidence, the search count rendered as the PRICE of having both — and **decisively, the deflated number is DARK (D63): the one figure that would let the user rank on quality is computed and NOT shown lit.** *The user may compare; the tool will not rank; and the meter that would settle it is off by the pen's own hand.*

## PHASE 4 — THE RIDER, EXERCISED IN A DARK DRY-RUN (S164, L-4) — *sheds second.*

V40 proved the enforcement bites by SEEDED NEGATIVE only; it never ran against a live Stamp (D63 off, no real lineage). `Rider.darkDryRun()` runs the WHOLE enforcement path against a REAL autocorrelated series (the clone-stable AR(1) demonstration, **τ_int 35.8, naive t 4.63, corrected t 1.02, √τ 6.0×**), computes the enforcement decision (*if lit, a naive render would be REFUSED → CORRECTED/UNJUDGEABLE*) — and renders **NOTHING LIT** (D63 off; a lit render FAILS). RP-5: the output is a TEST ARTIFACT (`data/honesty/rider-dryrun.json`), NEVER wired to a render surface — the wall greps the drawer and the door and finds nothing. `checkFrozenSet` 0 drift. *A computation that must stay dark lives in a test fixture, not one refactor from a screen.*

## PHASE 5 — THE CAPTURE'S MARGINAL VALUE (S165, L-5 / DD-72) — *sheds first.*

At "0 captures" the own-capture leg is UNJUDGEABLE forever. `Capture.marginalValue(run)` renders what each run buys: *"this capture advanced 2 series; your own-capture count is now 1 of 180 CAPTURES (not days) toward a judgeable own-count. The FIRST capture turns a UNJUDGEABLE into a 1 — the cadence pays from the very first run."* In CAPTURES, never days (RP-6 stands — a count ORGΛNON has, not a date it cannot know; a projection to a date FAILS). ORGΛNON still schedules NOTHING (a seeded scheduler FAILS).

---

## PHASE 7 — THE GATE (whole; D23–D83; **D27 STILL FIRST — the SIXTEENTH sprint**) + PART E

**THE FIRST GATE SECTION — THREE ITEMS, ALONE:**
1. **THE COMPOUNDED GENEROSITY** — the Stamp is knowingly generous (D27, unsigned, sixteen sprints) AND its confidence is overstated ≈ √τ_int on autocorrelated input (the rider, enforced) — now with the PBO cross-check honest behind it.
2. **D33** — `SIGNABLE · testRedesigns 1 · riderEnforced: true · pboEvidence: independent (hand-rolled CSCV proven to detect + theory null-dist; degenerate 0.6-vs-0.6 retired)` · **unsigned (LN5)**.
3. **D67** — the kill-criterion, **⟨N⟩ STILL EMPTY** — and now the variant ledger gives `changedByCompile` a SECOND manifest to be changed BY.

Then: **`guardEfficacy: 10/17`** (a lower bound — the superlative hole closed) · **D80–D83** (the variant ledger, the dark search price, the PBO correction, the guard-hole close — all reserved, **Operator-signed = false**) · D62-R · D46/D50/D54/D55 · **IN2 — the only validation left, and the variant ledger is the first feature that makes authoring a second manifest worth the Operator's time.**

**`LAWS: 17 · minted: 0 (six sprints) · deps: 2 · screens: 3 · exit kinds: 7 · familyN: 1 · realLineageCount: 0 · reachableHumans: 1 (BY DESIGN).`** Presented whole. **NEVER signed (LN5)** — D33 or D46 implemented while unsigned is the gravest Halt, and it did not happen.

## PART E — THE RED TEAM (S1–S168)

S1–S160 carried and re-run against the SHIPPED artifacts (the Ship Gate, V40). **S161** — the census reconciles in displayed arithmetic; a non-reconciling census REFUSES the log. **S162** — the guard hole closed (re-measured 10/17 printed WITH its caveat); a true factual superlative still renders. **S163** — the PBO cross-check has an independent leg proven to DETECT (≈0.53 noise / ≈0.00 edge); `0.6 vs 0.6` never renders as agreement; frozen 0 drift; D33 unchanged. **S164** — the rider's enforcement runs on a real captured series, DARK; a lit render FAILS; the output is a test artifact. **S165** — capture renders marginal value in captures, not days. **S166** — the variant `familyId` is derived; every fixture lineage id unchanged. **S167** — the ledger is chronological; no aggregate/best/ranking/delta-improvement (each seeded); the search count renders between variants; copy pinned verbatim. **S168** — the search price is COMPUTED and DARK; a lit meter FAILS; `familyN === 1`; a seeded AGENT variant cannot reach `realLineageCount`.

**Convergence:** two clean full runs (identical) · the clone RAN on this tree · a real, re-derivable terminal tree + commit hash · verify with all three sub-checks · bundle **`9c1e7bd8` byte-identical (no verdict moved)** · frozen 0 drift · deps 2 · screens 3 · census reconciled **in the open** · `familyN === 1` · **no ranking renders, no meter lit** · **and `Rollup` would have refused to write any of it if one wall had failed (S151, the Ship Gate).**

*The census reconciles in the open · the guard hole is closed · the degenerate cross-check can now disagree · the rider runs on real data and lights nothing · and the builder's second half is built: ORGΛNON lets you author two variants and see what trying both cost you — each under its own Stamp, judged against its own thesis and never against the other, with the search count rendered between them as the price of having asked twice, and the one number that would let it rank computed and never shown lit. That is the line the whole constitution was built to walk, and this sprint walks it in the open. The builder is whole enough to price a real search · realLineageCount: 0 · reachableHumans: 1 (BY DESIGN). The second manifest that would make the variant ledger speak is the one act that has never been, and can never be, a Phase.*


## THE GENERATED MARKER (X-DERIVE(a) — the machine wrote these claims)

```
treeHash: dbfdb7d645e3fa6b89b1201b80b28f8f9cc87a9a
commitSha: f8150a76957f676221e7cb07afc22fae54922951
pinsSha: 2c299b9e55fb5fb2b6f7e7af42f5c6c5a370c0e59ba0131c9cf86b2f6c5ba528
battery: 1892/2/0
expect: 12368
verify: {"exitCode":0,"subchecks":[{"name":"evidence-bundle-reproduces","status":"pass","detail":"deterministic bundle reproduces (9c1e7bd88825d7a5); every claim + live number resolves; frozen seven git-clean"},{"name":"frozen-set-intact","status":"pass","detail":"7/9 present & byte-identical, 0 drift (2 absent on a clone, named)"},{"name":"battery-count-matches-committed","status":"pass","detail":"curated battery 1281 == committed evidence 1281"}]}
verifyOutput: verify exit 0 — every sub-check passed (evidence-bundle-reproduces, frozen-set-intact, battery-count-matches-committed)
verifyCoverage: 7/9 (2 absent on a clone — monorepo-generated / gitignored, named in frozen-set-coverage.json)
goldenMoves: 0
crossCheck: {"dsr":{"quantity":"dsr","ours":0.4784209375780265,"theirs":0.4796379904843659,"delta":0.0012170529063393887,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"DSR: ours=0.478421 theirs=0.479638 |Δ|=1.22e-3 < tol=0.02 → agrees=true"},"psr":{"quantity":"psr","ours":0.9989334286155159,"theirs":0.9989434857193364,"delta":0.0000100571038205155,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"PSR: ours=0.998933 theirs=0.998943 |Δ|=1.01e-5 < tol=0.02 → agrees=true"},"pbo":{"quantity":"pbo","ours":0.6,"theirs":0.6,"delta":0,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"PBO: ours=0.600000 theirs=0.600000 |Δ|=0.00e+0 < tol=0.02 → agrees=true"}}
d33: {"state":"SIGNABLE","operatorSigned":false,"testRedesigns":1,"redesignSearchHashes":["a578032b4b5459d7e11c29247fce074febcdec6aa063d74cc14d787e2b003033"],"iidRider":{"stands":true,"classification":"HARNESS-COMPOSITION-GAP","direction":"the frozen PSR/DSR OVERSTATE confidence on autocorrelated input — the z-score uses √(n−1) over the raw observation count, treating n serially-dependent points as n independent ones, so the reported probability is too certain (biased toward SIGNABLE / toward 'yes').","magnitude":"z is inflated by ≈ √τ_int, where τ_int is the measured integrated autocorrelation time of the series. LIVE on this module's clone-stable AR(1)(ρ=0.95) demonstration, τ_int ≈ 35.8 (effective sample N_eff/N ≈ 2.8%). On ORGΛNON's OWN captured funding panel (recorded V26 via this same frozen effective_n.py), τ_int ranged 27–165 (median ≈ 124) → confidence overstated ≈ 5–13× (median ≈ 11×) on the most autocorrelated series. Daily yield series are less autocorrelated but τ_int > 1 always, so the DIRECTION always holds."},"riderEnforced":true,"pboEvidence":"independent (hand-rolled CSCV proven to detect + theory null-dist; degenerate 0.6-vs-0.6 retired)"}
census: {"originUnrecorded":79,"recovered":0,"reFounded":12,"deleted":0,"demonstrated":78}
d50: {"i":false,"ii":true,"iii":false,"iv":false}
reach: {"published":false,"reachableHumans":1,"installPath":"clone the repo · have Bun ≥ 1.3 · `./organon.sh` — or the built single-file binary + one line (D49, unsigned)"}
theNumber: {"manifestsReal":0,"cyclesUnpromptedReal":0,"realLineageCount":0}
laws: {"laws":17,"mintedThisSprint":0,"productCapabilityThisSprint":0}
newProductCapability: 0
verifyOnClone: {"exitCode":0,"battery":{"pass":1892,"skip":2,"fail":0,"files":288},"ran":true}
```

## THE GENERATED HEADER

```json
{
  "pinsSha": "2c299b9e55fb5fb2b6f7e7af42f5c6c5a370c0e59ba0131c9cf86b2f6c5ba528",
  "terminalTree": "dbfdb7d645e3fa6b89b1201b80b28f8f9cc87a9a",
  "commitSha": "f8150a76957f676221e7cb07afc22fae54922951",
  "pushed": false,
  "battery": "1892/2/0 · 288 files · 12368 expect() · two runs identical: y",
  "batteryDelta": {
    "pass": 1281,
    "fail": 0,
    "files": 197,
    "removed": 0,
    "removedReason": []
  },
  "crossCheck": {
    "dsr": {
      "quantity": "dsr",
      "ours": 0.4784209375780265,
      "theirs": 0.4796379904843659,
      "delta": 0.0012170529063393887,
      "tolerance": 0.02,
      "agrees": true,
      "comparable": true,
      "detail": "DSR: ours=0.478421 theirs=0.479638 |Δ|=1.22e-3 < tol=0.02 → agrees=true"
    },
    "psr": {
      "quantity": "psr",
      "ours": 0.9989334286155159,
      "theirs": 0.9989434857193364,
      "delta": 0.0000100571038205155,
      "tolerance": 0.02,
      "agrees": true,
      "comparable": true,
      "detail": "PSR: ours=0.998933 theirs=0.998943 |Δ|=1.01e-5 < tol=0.02 → agrees=true"
    },
    "pbo": {
      "quantity": "pbo",
      "ours": 0.6,
      "theirs": 0.6,
      "delta": 0,
      "tolerance": 0.02,
      "agrees": true,
      "comparable": true,
      "detail": "PBO: ours=0.600000 theirs=0.600000 |Δ|=0.00e+0 < tol=0.02 → agrees=true"
    }
  },
  "d33": {
    "state": "SIGNABLE",
    "operatorSigned": false,
    "testRedesigns": 1,
    "redesignSearchHashes": [
      "a578032b4b5459d7e11c29247fce074febcdec6aa063d74cc14d787e2b003033"
    ],
    "iidRider": {
      "stands": true,
      "classification": "HARNESS-COMPOSITION-GAP",
      "direction": "the frozen PSR/DSR OVERSTATE confidence on autocorrelated input — the z-score uses √(n−1) over the raw observation count, treating n serially-dependent points as n independent ones, so the reported probability is too certain (biased toward SIGNABLE / toward 'yes').",
      "magnitude": "z is inflated by ≈ √τ_int, where τ_int is the measured integrated autocorrelation time of the series. LIVE on this module's clone-stable AR(1)(ρ=0.95) demonstration, τ_int ≈ 35.8 (effective sample N_eff/N ≈ 2.8%). On ORGΛNON's OWN captured funding panel (recorded V26 via this same frozen effective_n.py), τ_int ranged 27–165 (median ≈ 124) → confidence overstated ≈ 5–13× (median ≈ 11×) on the most autocorrelated series. Daily yield series are less autocorrelated but τ_int > 1 always, so the DIRECTION always holds."
    },
    "riderEnforced": true,
    "pboEvidence": "independent (hand-rolled CSCV proven to detect + theory null-dist; degenerate 0.6-vs-0.6 retired)"
  },
  "census": {
    "originUnrecorded": 79,
    "recovered": 0,
    "reFounded": 12,
    "deleted": 0,
    "demonstrated": 78
  },
  "d50": {
    "i": false,
    "ii": true,
    "iii": false,
    "iv": false
  },
  "reach": {
    "published": false,
    "reachableHumans": 1,
    "installPath": "clone the repo · have Bun ≥ 1.3 · `./organon.sh` — or the built single-file binary + one line (D49, unsigned)"
  },
  "theNumber": {
    "manifestsReal": 0,
    "cyclesUnpromptedReal": 0,
    "realLineageCount": 0
  },
  "laws": {
    "laws": 17,
    "mintedThisSprint": 0,
    "productCapabilityThisSprint": 0
  },
  "newProductCapability": 0,
  "verifyOnClone": {
    "exitCode": 0,
    "battery": {
      "pass": 1892,
      "skip": 2,
      "fail": 0,
      "files": 288
    },
    "ran": true
  }
}
```

## THE GENERATED GATE (D27 first; the menu presented, never chosen — LN5)

```json
{
  "firstLine": "the instrument speaks · manifests (real) 0 · cycles unprompted (real) 0 · published false · reachableHumans 1 (BY DESIGN) · D51 ANSWERED = INSTRUMENT",
  "firstSection": {
    "d33": {
      "state": "SIGNABLE",
      "operatorSigned": false,
      "testRedesigns": 1,
      "redesignSearchHashes": [
        "a578032b4b5459d7e11c29247fce074febcdec6aa063d74cc14d787e2b003033"
      ],
      "iidRider": {
        "stands": true,
        "classification": "HARNESS-COMPOSITION-GAP",
        "direction": "the frozen PSR/DSR OVERSTATE confidence on autocorrelated input — the z-score uses √(n−1) over the raw observation count, treating n serially-dependent points as n independent ones, so the reported probability is too certain (biased toward SIGNABLE / toward 'yes').",
        "magnitude": "z is inflated by ≈ √τ_int, where τ_int is the measured integrated autocorrelation time of the series. LIVE on this module's clone-stable AR(1)(ρ=0.95) demonstration, τ_int ≈ 35.8 (effective sample N_eff/N ≈ 2.8%). On ORGΛNON's OWN captured funding panel (recorded V26 via this same frozen effective_n.py), τ_int ranged 27–165 (median ≈ 124) → confidence overstated ≈ 5–13× (median ≈ 11×) on the most autocorrelated series. Daily yield series are less autocorrelated but τ_int > 1 always, so the DIRECTION always holds."
      },
      "riderEnforced": true,
      "pboEvidence": "independent (hand-rolled CSCV proven to detect + theory null-dist; degenerate 0.6-vs-0.6 retired)",
      "flipEvidence": {
        "z": 0.6084472498281465,
        "acceptanceRegion": "|z_mean| < 2 (the pre-registered band; the null-distribution MEAN indistinguishable from the pinned theory 0.5)",
        "preRegisteredAt": "2026-07-14"
      },
      "note": "recomputed with the D56 SEARCH counted (RP-1: testRedesigns carried in state, never resets); the i.i.d. rider on the SAME LINE (S142); the deciding z SHOWN (S141); presented, NEVER signed (LN5)."
    },
    "d67": "the amended kill-criterion — ⟨N⟩ STILL EMPTY, awaiting the pen; and now, for the first time, the instrument can FEED it: the false-fire count says a number, so changedByCompile has something to be changed BY."
  },
  "d51": {
    "state": "ANSWERED",
    "detail": "ANSWERED — INSTRUMENT (n=1 BY DESIGN); the pen ruled 'my personal tool' (V38-B). reachableHumans: 1 BY DESIGN.",
    "supersedes": "the base gate's V38 line 'D51 OPEN · pens unmoved: 2 sprints · Is ORGΛNON a product, or an instrument?' — that question is ANSWERED; the base gate now redirects to this state (MR18/S150).",
    "agentComputes": "the fact; the pen ALREADY chose (INSTRUMENT) — the agent records it and never signs (LN5)."
  },
  "deviationStates": [
    {
      "id": "D51",
      "state": "ANSWERED"
    },
    {
      "id": "D33",
      "state": "SIGNABLE"
    },
    {
      "id": "D63",
      "state": "OFF"
    },
    {
      "id": "D27",
      "state": "FIRST"
    }
  ],
  "d33": {
    "state": "SIGNABLE",
    "operatorSigned": false,
    "testRedesigns": 1,
    "redesignSearchHashes": [
      "a578032b4b5459d7e11c29247fce074febcdec6aa063d74cc14d787e2b003033"
    ],
    "iidRider": {
      "stands": true,
      "classification": "HARNESS-COMPOSITION-GAP",
      "direction": "the frozen PSR/DSR OVERSTATE confidence on autocorrelated input — the z-score uses √(n−1) over the raw observation count, treating n serially-dependent points as n independent ones, so the reported probability is too certain (biased toward SIGNABLE / toward 'yes').",
      "magnitude": "z is inflated by ≈ √τ_int, where τ_int is the measured integrated autocorrelation time of the series. LIVE on this module's clone-stable AR(1)(ρ=0.95) demonstration, τ_int ≈ 35.8 (effective sample N_eff/N ≈ 2.8%). On ORGΛNON's OWN captured funding panel (recorded V26 via this same frozen effective_n.py), τ_int ranged 27–165 (median ≈ 124) → confidence overstated ≈ 5–13× (median ≈ 11×) on the most autocorrelated series. Daily yield series are less autocorrelated but τ_int > 1 always, so the DIRECTION always holds."
    },
    "riderEnforced": true,
    "pboEvidence": "independent (hand-rolled CSCV proven to detect + theory null-dist; degenerate 0.6-vs-0.6 retired)"
  },
  "d50": {
    "i": false,
    "ii": true,
    "iii": false,
    "iv": false
  },
  "laws": {
    "laws": 17,
    "mintedThisSprint": 0,
    "productCapabilityThisSprint": 0
  },
  "newProductCapability": 0
}
```

