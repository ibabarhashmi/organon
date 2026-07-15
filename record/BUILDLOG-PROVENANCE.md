# ORGΛNON — THE PROVENANCE SPRINT (V42) — BUILD LOG

**Builder Arc, sprint 12. THE SHIP GATE CHECKED THE SHAPE AND NOT THE IDENTITY, SO A STALE HEADER SAILED THROUGH THE ONE WALL BUILT TO STOP IT — and the moat got its first REAL★ stone.** NO NEW LAW (a SEVENTH sprint; seventeen stand, zero minted). The prose below names the producers; the machine wrote the claims (X-DERIVE(a), S126). This log is UNWRITABLE unless every identity wall (S169–S174) passed against the real artifacts — the IDENTITY-hardened Ship Gate emitted it, or it does not exist.

## THE DIAGNOSIS — the gate's blind spot, cured

V41's Ship Gate worked as written and missed three defects, because all three were *identity* failures and the gate only checked *shape*:

- **M-1 — the header's `pinsSha` was a PARENT'S.** `currentPins()` in `claim.ts` iterated a fixed list `[family, substance, socket]` that was never advanced past V39, so the pins-sha claim resolved to `family-pins.json` (**`2c299b9e`**) for *every* sprint since Family. S143 proved *"is it a 40-hex hash?"* and never *"is it MINE?"* — X-REACH(a): a hash never compared to its own source cannot fail on a stale value.
- **M-2 — the D33 note was V39's prose echoed** in a "generated" field: a stored string, not a claim computed this run (X-DERIVE(a)).
- **M-3 — `batteryDelta` described the CURATED 1281-subset**, not the 1892-battery's +48 movement (RP-4 required the full battery).

Each SHAPE-VALID, each IDENTITY-WRONG, each sailing through the crown of V40. **The arc's oldest lesson — *shape ≠ truth* — recurring one layer up. No new law; the constitution already reaches it, and this sprint deepens the gate's application from shape to IDENTITY-AND-FRESHNESS.**

### The blueprint carried the defect it was written to cure — and ground truth corrected it

Fittingly for a sprint about identity, **the blueprint's own prose chain was stale.** It named `c0777d9a` (which is V40 **Ship's** pin) as "the true V41 pin," and inserted a phantom `22a34e0c` that matches **no pins file on disk**. The ground truth — read from the files, never retyped — is the linked list of self-consistent heads: **`variant (eb64cebe) ← ship (c0777d9a) ← family (2c299b9e) ← …`**. V42 carries **`eb64cebe`**, the real V41 head. To follow the blueprint's prose would have been to commit the exact M-1 sin. The carry is the sprint's first identity check, and it is `Pins.selfHash()`-verified.

## PHASE 1 — THE GATE GRADUATES FROM SHAPE TO IDENTITY (S169–S174) · *never sheds*

- **S169 (M-1)** — `src/organon/pins.ts`: the emitted pins-sha must equal `sha256(this sprint's pins file, minus its pinsSha field)` — the pinsSha field IS the Phase-0 self-anchor (F-1/RP-1). Two independent paths to the value (the header via `Pins.head`, the gate via a direct file read), so a stale head cannot make both agree. `currentPins()` fixed to resolve the real head. A parent-pin emission REFUSES; a pins file edited after Phase 0 (self-consistency broken) REFUSES. **Proven on the real emit path (RP-1): a seeded parent pin → no build log written.**
- **S170 (M-2)** — `src/organon/freshness.ts`: every generated field is COMPUTED or `carried:{from,why,reverified}`. `carried` is legal ONLY when re-verified — the producer is re-run and the carried value must equal the recompute (PART A′ #2: a tag that excuses staleness is worse than no tag). The **D33 note is SPLIT** (F-2/RP-2): the SIGNABILITY claim carried (D33 unchanged since the autopsy), the FALSE-FIRE reference (D67) **COMPUTED** (the REAL★ archive feeds it this sprint). The committed audit is `data/honesty/carried-audit.json` (6 fields · 5 COMPUTED · 1 carried-and-reverified).
- **S171 (M-3)** — the `battery` producer reads `battery-baseline.json` (the FULL battery), not `battery-summary.json.canonical` (the curated 1281). `full:true`; a curated-subset delta FAILS.
- **S172 (M-4)** — `Consistency.batteryFullDelta()`: `prev + added − removed === now`, DISPLAYED in the header and gated. The cross-sprint continuity (V41 terminal 1892 → V42) is shown, not only asserted.
- **S173 (M-5)** — `Consistency.censusIdentity()`: the full partition `demonstrated + weak + exempt + originUnrecorded === total`, DISPLAYED and fed to the gate as a seedable artifact (a bad partition REFUSES — not a tautology).
- **S174 (M-6/MR20)** — `State.deviations()` now folds in every RESERVED deviation (D80–D86) from the current heads; a pinned deviation absent from `deviationStates` FAILS.

## PHASE 3–5 — THE FIRST REAL★ STONE IN THE MOAT · *Phases 3, 4 never shed*

The research was unambiguous: **the only genuinely unrevised yield history is one you capture yourself.** So `organon.sh capture` grew from a marginal-value renderer into a real poller.

- **S175/S176/S177 (Phase 3)** — `src/plane/observe.ts`: `Observe.capture` polls rate-space over the pinned RPC rotation via a **hand-encoded `eth_call`** (the chainlink `0xfeaf968c` precedent — no ethers/viem/web3; **deps stay 2**, S176). Each observation is `{blockNumber, blockHash, contract, contractCodeHash, asset, rawReturn, decoded, providerAtCapture, prevHash, sha}` — **REAL★, block-pinned, re-derivable** (S175). The **plausibility gate is STRUCTURAL-only** (S177/D86, RP-3): garbage (address/index mis-slice, non-finite) is REJECTED and NOT chained, but an economically-extreme real value — a **−42% funding crash, signed int256 — is CHAINED** (the gate tests the ENCODING, never the ECONOMICS). The contract is version-pinned (RP-5): a code-hash mismatch REJECTS.
  - **GROUND TRUTH corrected an assumption.** The pins tentatively put `currentLiquidityRate` at return word 3 (a 1-indexed reading of the ABI). A live, re-derivable `getReserveData(USDC)` at block **25537838** decoded **word 2 = 3.2691%** (the plausible supply rate) and word 3 = 1.24 (`variableBorrowIndex`, an index near 1.0) — so the ground truth is **WORD 2**. The pins were corrected before a byte of the engine was built on them. *The sprint about ground-truth-over-assumption corrected its own assumption when the chain disagreed.* The known-answer is committed at `data/honesty/capture-known-answer.json` (AGENT-tier, quarantined).
- **S178 (Phase 4)** — REAL★ and RETROSPECTIVE **never mix** (the research's cardinal sin). DeFiLlama `/yields` is ingested RETROSPECTIVE (`revisable:true`, block-less), in a SEPARATE chain; a cross-contamination in either direction FAILS. **RP-4** — DeFiLlama is a SMOKE TEST, not a correctness oracle: the REAL★ re-derived value (3.2691%) and DeFiLlama's chart (3.27033%) agree to **0.0012pp**, but REAL★'s authority is re-derivation at the block, not agreement with a revisable source.
- **S179 (Phase 5)** — `src/strategy/capture.ts`: the own-capture window renders from ACTUAL captures. The **HUMAN own-count is 0** (the Operator has never run the verb) — UNJUDGEABLE and says so (F-6/RP-6, honest at every length). The engine *can* capture (1 AGENT-tier proof, QUARANTINED — DD-79/S128, it never advances the HUMAN count). `organon.sh capture` renders *"run again to advance"* — an invitation, not a schedule; ORGΛNON schedules NOTHING.

## THE RED TEAM (S1–S179) — RED-TEAM-CLEAN

S1–S168 carried and re-run against the SHIPPED artifacts under the identity-hardened gate. S169–S179 built, each with a seeded IDENTITY-WRONG-BUT-SHAPE-VALID negative that REFUSES. **Fix-on-the-fly:** the pins' word-3 assumption was corrected to word 2 by a live re-derivable read (ground truth); the S104 census milestone was updated honestly (DEMONSTRATED has SURPASSED ORIGIN_UNRECORDED — 89 vs 79 — for the first time, the project has graded MORE of its tests than not); the V40/V41 Ship-gate artifact builders were extended with the six identity fields so the carried walls run under the new gate.

## THE GATE (whole — D23–D86; D27 STILL FIRST, the SEVENTEENTH sprint) — presented, NEVER signed (LN5)

The FIRST section, three items: **(1) THE COMPOUNDED GENEROSITY** (D27 unsigned, seventeen sprints, the ≈√τ_int overstatement, the PBO cross-check honest and independent behind it); **(2) D33** — `SIGNABLE · testRedesigns 1 · riderEnforced true · pboEvidence independent`, the note now **`carried:{from:V39, reverified:true}`**, unsigned; **(3) D67** — ⟨N⟩ STILL EMPTY, and now the REAL★ archive gives the own-capture false-fire leg a growing point-in-time series to be changed BY. Then: `ownCaptures: 0` (HUMAN) · `guardEfficacy 10/17` · **D84–D86** · D80–D83 (now in deviationStates) · D62-R · D46/D50/D54/D55 · **IN2** — the only validation left, and `capture` is the first verb that pays from its first run. `LAWS: 17 · minted: 0 (seven sprints) · deps: 2 · screens: 3 · exit kinds: 7 · familyN: 1 · realLineageCount: 0 · ownCaptures: 0 · reachableHumans: 1 (BY DESIGN)`. **The agent presents the whole gate, NEVER signs it (LN5). D33 or D46 implemented while unsigned is the gravest Halt.**

## WHAT THIS SPRINT STILL CANNOT ANSWER

`realLineageCount: 0`. `ownCaptures: 0` until the Operator runs the verb. V42 makes the record **un-foolable by last sprint's truth** and lays the first REAL★ stone — but the stone is length-0 until a human runs `capture`, and the second manifest is still unwritten. The capture verb is the closest thing to an on-ramp the instrument has ever had — *it pays from the first real run* — but the agent cannot take the first run for him (it would be AGENT-tier, quarantined). **The door is still his to open.**

*A stale pin, a carried lie, a wrong-battery delta, a blockless REAL★, a chained garbage decode, a rejected-because-extreme real value, a RETROSPECTIVE-in-REAL★, a mass-path web3 import, a lit meter, or a scheduler is a Halt, not a done. The gate checks identity now, and the moat has its first REAL★ stone.*


## THE GENERATED MARKER (X-DERIVE(a) — the machine wrote these claims; S169 IDENTITY-checked)

```
treeHash: c4b08995ecb99044266bd903a44f77393929fa01
commitSha: 18cad6aeb9fabac18defb334e890e4b89bae34a6
pinsSha: 04c606dd5846e7cdcd9fab86bff7ae4de2dd3c942563fda114abf63e9d3df3f8
battery: 1941/2/0
expect: 12693
verify: {"exitCode":0,"subchecks":[{"name":"evidence-bundle-reproduces","status":"pass","detail":"deterministic bundle reproduces (9c1e7bd88825d7a5); every claim + live number resolves; frozen seven git-clean"},{"name":"frozen-set-intact","status":"pass","detail":"7/9 present & byte-identical, 0 drift (2 absent on a clone, named)"},{"name":"battery-count-matches-committed","status":"pass","detail":"curated battery 1281 == committed evidence 1281"}]}
verifyOutput: verify exit 0 — every sub-check passed (evidence-bundle-reproduces, frozen-set-intact, battery-count-matches-committed)
verifyCoverage: 7/9 (2 absent on a clone — monorepo-generated / gitignored, named in frozen-set-coverage.json)
goldenMoves: 0
crossCheck: {"dsr":{"quantity":"dsr","ours":0.4784209375780265,"theirs":0.4796379904843659,"delta":0.0012170529063393887,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"DSR: ours=0.478421 theirs=0.479638 |Δ|=1.22e-3 < tol=0.02 → agrees=true"},"psr":{"quantity":"psr","ours":0.9989334286155159,"theirs":0.9989434857193364,"delta":0.0000100571038205155,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"PSR: ours=0.998933 theirs=0.998943 |Δ|=1.01e-5 < tol=0.02 → agrees=true"},"pbo":{"quantity":"pbo","ours":0.6,"theirs":0.6,"delta":0,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"PBO: ours=0.600000 theirs=0.600000 |Δ|=0.00e+0 < tol=0.02 → agrees=true"}}
d33: {"state":"SIGNABLE","operatorSigned":false,"testRedesigns":1,"redesignSearchHashes":["d5147f8d14be46de4257073639a4bb584f37c6245d71cc707c298ea2b3e507d2"],"iidRider":{"stands":true,"classification":"HARNESS-COMPOSITION-GAP","direction":"the frozen PSR/DSR OVERSTATE confidence on autocorrelated input — the z-score uses √(n−1) over the raw observation count, treating n serially-dependent points as n independent ones, so the reported probability is too certain (biased toward SIGNABLE / toward 'yes').","magnitude":"z is inflated by ≈ √τ_int, where τ_int is the measured integrated autocorrelation time of the series. LIVE on this module's clone-stable AR(1)(ρ=0.95) demonstration, τ_int ≈ 35.8 (effective sample N_eff/N ≈ 2.8%). On ORGΛNON's OWN captured funding panel (recorded V26 via this same frozen effective_n.py), τ_int ranged 27–165 (median ≈ 124) → confidence overstated ≈ 5–13× (median ≈ 11×) on the most autocorrelated series. Daily yield series are less autocorrelated but τ_int > 1 always, so the DIRECTION always holds."},"riderEnforced":true,"pboEvidence":"independent (hand-rolled CSCV proven to detect + theory null-dist; degenerate 0.6-vs-0.6 retired)"}
census: {"originUnrecorded":79,"recovered":0,"reFounded":12,"deleted":0,"demonstrated":89}
d50: {"i":false,"ii":true,"iii":false,"iv":false}
reach: {"published":false,"reachableHumans":1,"installPath":"clone the repo · have Bun ≥ 1.3 · `./organon.sh` — or the built single-file binary + one line (D49, unsigned)"}
theNumber: {"manifestsReal":0,"cyclesUnpromptedReal":0,"realLineageCount":0}
laws: {"laws":17,"mintedThisSprint":0,"productCapabilityThisSprint":1}
newProductCapability: 1
verifyOnClone: {"exitCode":0,"battery":{"pass":1941,"skip":2,"fail":0,"files":294},"ran":true}
```

## THE GENERATED HEADER

```json
{
  "pinsSha": "04c606dd5846e7cdcd9fab86bff7ae4de2dd3c942563fda114abf63e9d3df3f8",
  "terminalTree": "c4b08995ecb99044266bd903a44f77393929fa01",
  "commitSha": "18cad6aeb9fabac18defb334e890e4b89bae34a6",
  "pushed": false,
  "battery": "1941/2/0 · 294 files · 12693 expect() · two runs identical: y",
  "batteryDelta": {
    "pass": 1941,
    "prev": 1892,
    "added": 49,
    "removed": 0,
    "removedReason": [],
    "full": true,
    "reconciles": true
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
      "d5147f8d14be46de4257073639a4bb584f37c6245d71cc707c298ea2b3e507d2"
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
    "demonstrated": 89
  },
  "batteryContinuity": "prev 1892 + added 49 − removed 0 === now 1941",
  "censusIdentity": "demonstrated 89 + weak 0 + exempt 2 + originUnrecorded 79 === total 170",
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
    "productCapabilityThisSprint": 1
  },
  "newProductCapability": 1,
  "verifyOnClone": {
    "exitCode": 0,
    "battery": {
      "pass": 1941,
      "skip": 2,
      "fail": 0,
      "files": 294
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
        "d5147f8d14be46de4257073639a4bb584f37c6245d71cc707c298ea2b3e507d2"
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
      "note": "recomputed with the D56 SEARCH counted (RP-1: testRedesigns carried in state, never resets); the i.i.d. rider on the SAME LINE (S142); the deciding z SHOWN (S141); presented, NEVER signed (LN5).",
      "noteFreshness": {
        "field": "gate.firstSection.d33.note",
        "kind": "CARRIED",
        "from": "V39",
        "why": "the D33 SIGNABILITY note is unchanged since the autopsy; recomputing re-derives the identical SIGNABLE-state note (RP-2: its only input is D33's state, which did not move this sprint)",
        "value": "recomputed with the D56 SEARCH counted (RP-1: testRedesigns carried in state, never resets); the i.i.d. rider on the SAME LINE (S142); the deciding z SHOWN (S141); presented, NEVER signed (LN5).",
        "inputs": [
          "d33.state"
        ],
        "inputsMoved": false,
        "reverified": true
      }
    },
    "d67": "the amended kill-criterion — ⟨N⟩ STILL EMPTY, awaiting the pen; and now the REAL★ archive feeds the own-capture false-fire leg (ownCaptures 0 today — UNJUDGEABLE (0 HUMAN captures; an AGENT proof capture is quarantined)), so changedByCompile has a growing point-in-time series to be changed BY."
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
    },
    {
      "id": "D80",
      "state": "RESERVED"
    },
    {
      "id": "D81",
      "state": "RESERVED"
    },
    {
      "id": "D82",
      "state": "RESERVED"
    },
    {
      "id": "D83",
      "state": "RESERVED"
    },
    {
      "id": "D84",
      "state": "RESERVED"
    },
    {
      "id": "D85",
      "state": "RESERVED"
    },
    {
      "id": "D86",
      "state": "RESERVED"
    }
  ],
  "d33": {
    "state": "SIGNABLE",
    "operatorSigned": false,
    "testRedesigns": 1,
    "redesignSearchHashes": [
      "d5147f8d14be46de4257073639a4bb584f37c6245d71cc707c298ea2b3e507d2"
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
    "productCapabilityThisSprint": 1
  },
  "newProductCapability": 1
}
```

