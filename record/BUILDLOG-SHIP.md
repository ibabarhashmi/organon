# ORGΛNON — THE SHIP SPRINT (V40): Builder Arc, Sprint 10 — **A WALL THAT IS TESTED BUT NOT APPLIED IS NOT A WALL**

**NO NEW LAW — a FIFTH sprint running.** V39 did the finest phase work in this project's history and broke its own record in four places — three of them defects the previous sprint built walls against, and the walls are named in the very log that violated them: `S143` (a prose treeHash shipped), `S144` (the clone never ran), `S114` (verify's third sub-check vanished again, one sprint after "G-2 never again"), `S108` (ten origin-less walls landed and the arithmetic reconciled). **The diagnosis: every one of those walls is unit-tested and none was run against the artifact the sprint actually ships.** X-REACH(a) reaches this exactly — a check that cannot fail *where it matters* is not a check.

**The fix is the move this project has made five times** (the Act is derived · "green" is derived · `published` is derived · ONE `State.deviations()` producer): **THE SHIP GATE** — `organon.sh ship` runs every wall against this sprint's real artifacts and **refuses to emit a build log if any fails.** Not a checklist. A program that will not write. And the rider got teeth, the guard got a number, and the tool says the one thing the curator-loss literature is about.

---

## THE DIAGNOSIS — stated exactly, because the fix follows from it

`Marker.validate` passes its unit test; nobody ran `Marker.validate(the_real_marker)`. `Clone.staleAgainst` passes its unit test; nobody ran the clone. `subcheckSetStable` passes its unit test; nobody ran it against the real verify output. **The walls work. They were never applied to what shipped.** This sprint makes application MECHANICAL: `Ship.gate()` runs every wall against THIS sprint's real artifacts, and `Rollup` (via `Ship.emit`) refuses to write on any failure — a refusal at the same path (RP-2), no `--force`.

---

## PHASE 0 — PINS-LOCKED (`ship-pins.json`, carrying `2c299b9e`)

Pinned before a byte of phase code: the SHIP-GATE wall list (DD-61) · the refusal-log schema (RP-2 — same path, one writer, no `--force`) · the τ_int threshold **pre-registered** from the Stamp's DSR 0.95 cut-point BEFORE any measurement (X-DERIVE(f)) · the possible outcome stated in advance (*if honest correction leaves no strategy with a surviving Stamp, that is a FINDING, not a bug*) · the mutation catalogue = **X-MANIFEST's own banned-output list** (V31), quoted verbatim · the dependency map's three join keys + its PINNED VERBATIM copy · D75–D79 · MR13/MR17/MR19 · walls S151–S160 · the shed order (1,2,3,4 never shed; then 6, then 5). Positive control: a mutated contract word moves the sha.

## PHASE 1 — THE SHIP GATE (S151–S156, D75) — *never sheds. The sprint's spine.*

`Ship.gate(artifacts) → PASS | REFUSE{wall, artifact, value}` runs every wall against THIS sprint's real artifacts: **S152** `Marker.validate(the real terminal marker)` — prose/placeholder in the treeHash slot → REFUSE. **S153** the clone **executes on this commit** (`Clone.staleAgainst`) — absent or stale → REFUSE. **S154** verify's real sub-check set vs `DECLARED_SUBCHECKS` — a silent removal → REFUSE. **S155** this sprint's real new walls carry named origins (S108 at ship) — else REFUSE. **S156** battery continuity with the PREVIOUS terminal marker (`battery-continuity.json`, K-7's 1706→1738 gap) — an unexplained delta → REFUSE. **And `Rollup` refuses to write the build log on any REFUSAL**, emitting the refusal log at the SAME path (RP-2). **THE POSITIVE CONTROL IS ON THE REAL EMIT PATH (RP-1):** `bun run script/honesty/ship.ts --seed-bad treeHash` mutated the real marker, ran the real emit, and produced a REFUSAL, not a build log — recorded in `data/honesty/ship-positive-control.json`. A ship gate proven only in the battery would be this project's oldest mistake, for the fifth time.

## PHASE 2 — THE RIDER, ENFORCED (S157, D76) — *never sheds.*

The harness composes the frozen Newey–West correction (`effective_n.py::nw_tstat`, unused since V8) — a faithful clone-stable TS port (`nwTstat(x,0)` reproduces the iid t-stat to 10 decimals), **not one frozen byte moved** (`checkFrozenSet` 0 drift; HARNESS-COMPOSITION-GAP). It renders BOTH the naive and the corrected statistic with τ_int beside them (RP-3). **THE ENFORCEMENT:** with deflation active AND √τ_int above the pre-registered trigger, the Stamp must render CORRECTED or UNJUDGEABLE, never naive — a seeded naive-on-autocorrelated Stamp FAILS. D63 is OFF (familyN === 1), so it is ARMED, not firing. **`D33` gains `riderEnforced: true`.** The threshold (√τ_int ≥ 1.5 ⟺ τ_int ≥ 2.25) is derived from the DSR 0.95 cut-point BEFORE measurement. **The measured answer (F-3):** the AR(1) demonstration (√τ ≈ 6.0) and the real V26 funding panel (τ_int 27–165 → √τ 5–13×) TRIGGER; the committed TVL/peg RETURNS are near-white (0 of 2 trigger). The correction triggers exactly where yields persist. **THE COMPOUNDED GENEROSITY (A′ #9):** the Stamp is knowingly generous (D27, unsigned, 15 sprints) AND its confidence is overstated ≈ √τ_int on autocorrelated input — rendered together, in one line, for the first time.

## PHASE 3 — THE GUARD'S REAL NUMBER (S158) — *never sheds. Six sprints owed.*

MUTATION TESTING. The catalogue IS X-MANIFEST's banned-output list (V31) + imperatives/comparatives/superlatives, 17 seeded. The ONE GUARD (the advice guard, `AdviceShape.detect ∪ VoiceGates.advicePattern`) run against each: **`guardEfficacy: 8/17`** — a RAW fraction, a LOWER BOUND (RP-5), printed WITH the caveat, always. The full honesty layer catches 16/17 (the 6 declarative banned outputs the advice guard misses are covered by the sibling banned-shape guard). **The mutation test found a REAL hole:** one superlative over-claim ("this is the safest, highest-yielding strategy available") is uncaught by every guard — NAMED and routed to the gate. A `17/17` that calls itself complete would be the most dangerous number in this sprint; **a number that can embarrass you is a number worth having.** The transcript corpus (31 baits) continues as the second, weaker measure.

## PHASE 4 — THE SHARED-DEPENDENCY MAP (S159, D77) — *never sheds. The curator's whole question.*

`Depend.map(positions)` is a COUNT over a join on three keys — the curator-loss literature's core fact. On a real 5-position manifest (3 USDC + 2 DAI shelf subjects): **"3 of your 5 positions share the same underlying asset (USDC). 3 of your 5 read the same oracle feed."** The admin-key join (RP-4) matches ONLY on the resolved terminal authority: aave's own pools stay **UNJUDGEABLE** because their authority is UNRESOLVED — *the map refuses to claim a dependency it cannot prove* (the strongest RP-4 demonstration; a false "2 share the same admin key" is worse than silence). Per-key coverage emitted (underlying 5/5 · admin 1/5 resolved · oracle 5/5, shelf-wide 3/1284). It ranks nothing, suggests nothing, and NEVER says "diversify" — every rendered line passes the ONE GUARD; a seeded advisory FAILS. The copy is PINNED VERBATIM (no LLM on this surface).

## PHASE 5 — THE CAPTURE VERB (S160, D78) — *sheds second.*

`organon.sh capture` is a VERB, not a service: it snapshots the pinned subjects into the moat (PIT-honest, content-hashed, REAL@ts) and renders the own-capture window + `daysToJudgeable` in **CAPTURES, not days** (RP-6): *"180+ CAPTURES (not days) — at your current cadence of 0 captures, this is UNJUDGEABLE."* ORGΛNON schedules NOTHING — no daemon, no cron, no service, not even a suggested crontab line (a wall greps the tree; a seeded scheduler FAILS). The first mechanism this project has built that rewards running the cadence.

## PHASE 6 — THE RESIDUES — *sheds first.*

**D79:** oracle-staleness FROZEN at its named subset (USDC/USDT/DAI Chainlink feeds, 3/1284) and it SAYS SO — *"this kind resolves for these 3 feeds and is UNJUDGEABLE elsewhere"* (honest, names its own boundary). **K-8:** the false-fire count's subject coverage emitted (2 of 7 exit kinds materialized). **MR13** recorded undischargeable (the human opening a door has never been a Phase). **MR17** the D57–D61 reservations accounted. **MR19** the 1706→1738 gap explained (V38-B's 32 addendum tests) and structurally prevented (S156). **K-9:** the TRUE capability count reported — 4, disclosed, not a redefined 0.

---

## PHASE 7 — THE GATE (whole; D23–D79; **D27 STILL FIRST — the FIFTEENTH sprint**) + PART E

**THE FIRST GATE SECTION — THREE ITEMS, ALONE:**
1. **THE COMPOUNDED GENEROSITY** — the Stamp is knowingly generous (D27, unsigned, fifteen sprints) AND its confidence is overstated ≈ √τ_int (≈ 5–13× on the real funding panel, median ≈ 11×) on autocorrelated input (the rider, NOW ENFORCED). The Operator has never seen these two facts in one line, and he should.
2. **D33** — `SIGNABLE · testRedesigns 1 · riderEnforced: true` · **unsigned (LN5)**.
3. **D67** — the amended kill-criterion, **⟨N⟩ STILL EMPTY** — and now the false-fire count's own-capture window has a `daysToJudgeable` (in captures), so `changedByCompile` has a horizon it becomes measurable.

Then: **`guardEfficacy: 8/17`** (a lower bound — six sprints late, a NUMBER at last) · **D75–D79** (the ship gate, the enforced rider, the dependency map, the capture verb, the oracle-staleness freeze — all reserved, **Operator-signed = false**) · D62-R · D46/D50/D54/D55 · **IN2 — the only validation left, and every technical excuse is now gone.**

**`LAWS: 17 · minted: 0 (five sprints) · deps: 2 · screens: 3 · exit kinds: 7 · familyN: 1 · realLineageCount: 0 · reachableHumans: 1 (BY DESIGN).`** Presented whole. **NEVER signed (LN5)** — D33 or D46 implemented while unsigned is the gravest Halt, and it did not happen.

## PART E — THE RED TEAM (S1–S160)

S1–S150 carried and re-run, and now every one runs against the SHIPPED artifact at ship time (S151). S152–S156 refuse the build log on a prose treeHash / an unrun-or-stale clone / a vanished sub-check / an origin-less new wall / an unexplained battery gap — **proven on the real emit path (RP-1), not in a unit test.** S157 the rider bites (naive-on-autocorrelated with deflation active FAILS; frozen 0 drift). S158 `guardEfficacy` is a raw fraction with its lower-bound caveat; every uncaught mutation named. S159 the dependency map is a count over a join, per-key coverage emitted, UNJUDGEABLE never independence, never "diversify". S160 capture is a verb; the tree contains no scheduler.

**Convergence:** two clean full runs (**1844/2/0 across 281 files / 12018 expect()**, identical) · the clone RAN on this tree · a real, re-derivable terminal tree + commit hash · verify with all three sub-checks · bundle **`9c1e7bd8` byte-identical (no verdict moved)** · frozen 0 drift · deps 2 · screens 3 · census reconciled (both directions) · `familyN === 1` · **and `Rollup` would have refused to write any of it if one wall had failed (S151, proven on the real emit path).**

*The record cannot lie · the math cannot silently overstate · the guard has a number · the positions that die together are named · realLineageCount: 0. Everything that was ever the agent's to build is built. The door has never been opened — and that has never been a Phase.*


## THE GENERATED MARKER (X-DERIVE(a) — the machine wrote these claims)

```
treeHash: 22a34e0cc162ad85963d262f7f18627f4b1e44a4
commitSha: 42628143a70ee6e5936a2b6d917caf97c13fb17f
pinsSha: 2c299b9e55fb5fb2b6f7e7af42f5c6c5a370c0e59ba0131c9cf86b2f6c5ba528
battery: 1844/2/0
expect: 12018
verify: {"exitCode":0,"subchecks":[{"name":"evidence-bundle-reproduces","status":"pass","detail":"deterministic bundle reproduces (9c1e7bd88825d7a5); every claim + live number resolves; frozen seven git-clean"},{"name":"frozen-set-intact","status":"pass","detail":"7/9 present & byte-identical, 0 drift (2 absent on a clone, named)"},{"name":"battery-count-matches-committed","status":"pass","detail":"curated battery 1281 == committed evidence 1281"}]}
verifyOutput: verify exit 0 — every sub-check passed (evidence-bundle-reproduces, frozen-set-intact, battery-count-matches-committed)
verifyCoverage: 7/9 (2 absent on a clone — monorepo-generated / gitignored, named in frozen-set-coverage.json)
goldenMoves: 0
crossCheck: {"dsr":{"quantity":"dsr","ours":0.4784209375780265,"theirs":0.4796379904843659,"delta":0.0012170529063393887,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"DSR: ours=0.478421 theirs=0.479638 |Δ|=1.22e-3 < tol=0.02 → agrees=true"},"psr":{"quantity":"psr","ours":0.9989334286155159,"theirs":0.9989434857193364,"delta":0.0000100571038205155,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"PSR: ours=0.998933 theirs=0.998943 |Δ|=1.01e-5 < tol=0.02 → agrees=true"},"pbo":{"quantity":"pbo","ours":0.6,"theirs":0.6,"delta":0,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"PBO: ours=0.600000 theirs=0.600000 |Δ|=0.00e+0 < tol=0.02 → agrees=true"}}
d33: {"state":"SIGNABLE","operatorSigned":false,"testRedesigns":1,"redesignSearchHashes":["44f2be5acbca64a48b3d13e24106775f31c01842e79a3a7584919d8b6b90636c"],"iidRider":{"stands":true,"classification":"HARNESS-COMPOSITION-GAP","direction":"the frozen PSR/DSR OVERSTATE confidence on autocorrelated input — the z-score uses √(n−1) over the raw observation count, treating n serially-dependent points as n independent ones, so the reported probability is too certain (biased toward SIGNABLE / toward 'yes').","magnitude":"z is inflated by ≈ √τ_int, where τ_int is the measured integrated autocorrelation time of the series. LIVE on this module's clone-stable AR(1)(ρ=0.95) demonstration, τ_int ≈ 35.8 (effective sample N_eff/N ≈ 2.8%). On ORGΛNON's OWN captured funding panel (recorded V26 via this same frozen effective_n.py), τ_int ranged 27–165 (median ≈ 124) → confidence overstated ≈ 5–13× (median ≈ 11×) on the most autocorrelated series. Daily yield series are less autocorrelated but τ_int > 1 always, so the DIRECTION always holds."},"riderEnforced":true}
census: {"originUnrecorded":79,"recovered":0,"reFounded":12,"deleted":0,"demonstrated":70}
d50: {"i":false,"ii":true,"iii":false,"iv":false}
reach: {"published":false,"reachableHumans":1,"installPath":"clone the repo · have Bun ≥ 1.3 · `./organon.sh` — or the built single-file binary + one line (D49, unsigned)"}
theNumber: {"manifestsReal":0,"cyclesUnpromptedReal":0,"realLineageCount":0}
laws: {"laws":17,"mintedThisSprint":0,"productCapabilityThisSprint":0}
newProductCapability: 0
verifyOnClone: {"exitCode":0,"battery":{"pass":1844,"skip":2,"fail":0,"files":281},"ran":true}
```

## THE GENERATED HEADER

```json
{
  "pinsSha": "2c299b9e55fb5fb2b6f7e7af42f5c6c5a370c0e59ba0131c9cf86b2f6c5ba528",
  "terminalTree": "22a34e0cc162ad85963d262f7f18627f4b1e44a4",
  "commitSha": "42628143a70ee6e5936a2b6d917caf97c13fb17f",
  "pushed": false,
  "battery": "1844/2/0 · 281 files · 12018 expect() · two runs identical: y",
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
      "44f2be5acbca64a48b3d13e24106775f31c01842e79a3a7584919d8b6b90636c"
    ],
    "iidRider": {
      "stands": true,
      "classification": "HARNESS-COMPOSITION-GAP",
      "direction": "the frozen PSR/DSR OVERSTATE confidence on autocorrelated input — the z-score uses √(n−1) over the raw observation count, treating n serially-dependent points as n independent ones, so the reported probability is too certain (biased toward SIGNABLE / toward 'yes').",
      "magnitude": "z is inflated by ≈ √τ_int, where τ_int is the measured integrated autocorrelation time of the series. LIVE on this module's clone-stable AR(1)(ρ=0.95) demonstration, τ_int ≈ 35.8 (effective sample N_eff/N ≈ 2.8%). On ORGΛNON's OWN captured funding panel (recorded V26 via this same frozen effective_n.py), τ_int ranged 27–165 (median ≈ 124) → confidence overstated ≈ 5–13× (median ≈ 11×) on the most autocorrelated series. Daily yield series are less autocorrelated but τ_int > 1 always, so the DIRECTION always holds."
    },
    "riderEnforced": true
  },
  "census": {
    "originUnrecorded": 79,
    "recovered": 0,
    "reFounded": 12,
    "deleted": 0,
    "demonstrated": 70
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
      "pass": 1844,
      "skip": 2,
      "fail": 0,
      "files": 281
    },
    "ran": true
  }
}
```

## THE GENERATED GATE (D51 first; the menu presented, never chosen — LN5)

```json
{
  "firstLine": "the instrument speaks · manifests (real) 0 · cycles unprompted (real) 0 · published false · reachableHumans 1 (BY DESIGN) · D51 ANSWERED = INSTRUMENT",
  "firstSection": {
    "d33": {
      "state": "SIGNABLE",
      "operatorSigned": false,
      "testRedesigns": 1,
      "redesignSearchHashes": [
        "44f2be5acbca64a48b3d13e24106775f31c01842e79a3a7584919d8b6b90636c"
      ],
      "iidRider": {
        "stands": true,
        "classification": "HARNESS-COMPOSITION-GAP",
        "direction": "the frozen PSR/DSR OVERSTATE confidence on autocorrelated input — the z-score uses √(n−1) over the raw observation count, treating n serially-dependent points as n independent ones, so the reported probability is too certain (biased toward SIGNABLE / toward 'yes').",
        "magnitude": "z is inflated by ≈ √τ_int, where τ_int is the measured integrated autocorrelation time of the series. LIVE on this module's clone-stable AR(1)(ρ=0.95) demonstration, τ_int ≈ 35.8 (effective sample N_eff/N ≈ 2.8%). On ORGΛNON's OWN captured funding panel (recorded V26 via this same frozen effective_n.py), τ_int ranged 27–165 (median ≈ 124) → confidence overstated ≈ 5–13× (median ≈ 11×) on the most autocorrelated series. Daily yield series are less autocorrelated but τ_int > 1 always, so the DIRECTION always holds."
      },
      "riderEnforced": true,
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
      "44f2be5acbca64a48b3d13e24106775f31c01842e79a3a7584919d8b6b90636c"
    ],
    "iidRider": {
      "stands": true,
      "classification": "HARNESS-COMPOSITION-GAP",
      "direction": "the frozen PSR/DSR OVERSTATE confidence on autocorrelated input — the z-score uses √(n−1) over the raw observation count, treating n serially-dependent points as n independent ones, so the reported probability is too certain (biased toward SIGNABLE / toward 'yes').",
      "magnitude": "z is inflated by ≈ √τ_int, where τ_int is the measured integrated autocorrelation time of the series. LIVE on this module's clone-stable AR(1)(ρ=0.95) demonstration, τ_int ≈ 35.8 (effective sample N_eff/N ≈ 2.8%). On ORGΛNON's OWN captured funding panel (recorded V26 via this same frozen effective_n.py), τ_int ranged 27–165 (median ≈ 124) → confidence overstated ≈ 5–13× (median ≈ 11×) on the most autocorrelated series. Daily yield series are less autocorrelated but τ_int > 1 always, so the DIRECTION always holds."
    },
    "riderEnforced": true
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

