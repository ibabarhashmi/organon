# ORGΛNON — THE RECKONING SPRINT (V44): the pen delegated the maths, and the maths delivered a verdict the pen must still stroke

**Builder Arc, sprint 14. NO NEW LAW (a ninth sprint — seventeen stand, zero minted).**

The Operator instructed, verbatim: *"D33: comprehensively check the maths with your expertise, decide if it's good or not, adversarially validate, red-team it, then sign."* The agent did everything that instruction asks except the one act LN5 forbids. It re-ran the V38-B five-class autopsy against the current frozen `rigor.py` and confirmed the implementation is **CORRECT** — zero breaks across five attack classes, zero frozen drift (DD-88). Then it found what correctness cannot hide: a `√(n−1)` standard error over autocorrelated yields overstates confidence **≈5–13×, always toward "yes"** (τ_int 27–165 on ORGΛNON's own funding panel), so a metric this over-confident is **not good *as applied***, however faithful to its own formula.

So the τ_int correction stopped being a rider enforced in name and became **the default statistic wherever a Sharpe is judged**: `N_eff = n/τ_int`, `√(N_eff−1)` replacing `√(n−1)`, windowed at the first non-positive lag, clamped to `[1,n]`, failing safe to UNJUDGEABLE on the short samples DeFi actually provides (DD-89, RP-3). On the clone-stable AR(1) demonstration the naive PSR reads a near-certain **1.000**; the corrected PSR reads **0.777**. That is the overstatement, made concrete.

**The verdict is rendered — and the bit is not moved.** `implementation: SOUND · application: SIGNABLE (N_eff enforced) · recommended-for-signature: TRUE · operatorSigned: FALSE.` An agent that flips the bit certifying *a human reviewed and chose* has forged the one thing the bit exists to mean. The recommendation is unconditional; the last stroke is the human's, by the law the human wrote (LN5) — and the fence is now **mechanized**: a seeded `operatorSigned:true` on the real emit path **REFUSES the log** (S192). *The agent is accountable for the truth; the Operator is accountable for acting on it; that split is the whole of LN5 (RP-4).*

**And D27's nineteen-sprint generosity is retired.** The Stamp no longer passes a strategy it merely likes — it passes only what clears the literature's bar: **PSR(N_eff) > 0.95 AND observed length > MinTRL** (López de Prado / Bailey), else **INSUFFICIENT**, the honest name for "not enough evidence yet" (S193). A synthetic positive control clears the bar → GO (RP-2); an autocorrelated series that naive-n would have passed flips to INSUFFICIENT (the generosity made concrete). The strict bar **composes beside the byte-frozen Stamp** (`src/studio/strict.ts`) — never wired into it — exactly as `EffectiveN.psrAtNeff` composes beside the frozen `rigor.psr`; the frozen Stamp is byte-identical, and the mass-path bundle `9c1e7bd8` has not moved.

**GROUND TRUTH beat the blueprint a fourth time.** F-1 declared the τ_int correction *would move the evidence bundle* — "the one sanctioned move." It is factually wrong: the bundle is `{scorecard determinism, frozen git-clean, frozen-attest differential}` — the Stamp is off the mass path and outside it, and the three routes to move it each violate a fence. So `9c1e7bd8` stays byte-identical, RP-1 is discharged by proving that + versioning the strict bar's own fixture changes (`stamp-strict-record.json`), and the 44-sprint invariant holds.

**V43's two residues closed.** The census now separates a **transfer from a birth** — CONSERVATION (inter-bucket moves net to zero) and GROWTH (new walls change the total), two identities that never share one `===` (S190/O-1). The historical hash is **tagged and walled stable from here** (S191/O-2). The three delegated deviations are **AGENT-RATIFIED with validation attached and their signature bits untouched** (D87-R/D88-R/D89-R, S197). The backfill residues are honest — every observable states its rate-space membership (S194), and `judgeable` agrees with its tier cap (S195).

**And the moat took its third stone: the contagion score.** The curator-loss literature's whole finding, rendered as a count over the Operator's own positions — *"3 of your 5 die if this one oracle lies"* — a fact that names the shared fate and never once prescribes the cure. A count over the join (V40's dependency map), the max shared per class plus the per-class breakdown (RP-5), UNJUDGEABLE for any unresolved dependency, copy PINNED VERBATIM, every seeded advisory phrasing REFUSED by a dedicated guard (S196/D90).

*The maths are honest now · the Stamp is strict · the pen is signable and still the human's · the moat is three stones deep · realLineageCount: 0.* The tool is finally honest enough that its first real verdict will mean something — and the one act that would summon that verdict is still, nineteen sprints on, the Operator's alone to make.


## THE GENERATED MARKER (X-DERIVE(a) — the machine wrote these claims; S181 CONTINUITY-checked, S192 LN5-checked)

```
treeHash: 4665c7094a54494712961a0b56b6c3f96edbeadf
commitSha: 08417e65f96f07cd86b81ab185f7c39a6ba309da
pinsSha: 67d5cd4426796768daa9ad2c9d916ef10477885784bf2e7c59d47de4545f43c0
battery: 2024/2/0
expect: 13450
verify: {"exitCode":0,"subchecks":[{"name":"evidence-bundle-reproduces","status":"pass","detail":"deterministic bundle reproduces (9c1e7bd88825d7a5); every claim + live number resolves; frozen seven git-clean"},{"name":"frozen-set-intact","status":"pass","detail":"7/9 present & byte-identical, 0 drift (2 absent on a clone, named)"},{"name":"curated-evidence-subset-matches-committed","status":"pass","detail":"curated evidence subset 1281 == committed evidence 1281 (the CURATED subset — the FULL battery is reconciled through Continuity, S180)"}]}
verifyOutput: verify exit 0 — every sub-check passed (evidence-bundle-reproduces, frozen-set-intact, curated-evidence-subset-matches-committed)
verifyCoverage: 7/9 (2 absent on a clone — monorepo-generated / gitignored, named in frozen-set-coverage.json)
goldenMoves: 0
crossCheck: {"dsr":{"quantity":"dsr","ours":0.4784209375780265,"theirs":0.4796379904843659,"delta":0.0012170529063393887,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"DSR: ours=0.478421 theirs=0.479638 |Δ|=1.22e-3 < tol=0.02 → agrees=true"},"psr":{"quantity":"psr","ours":0.9989334286155159,"theirs":0.9989434857193364,"delta":0.0000100571038205155,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"PSR: ours=0.998933 theirs=0.998943 |Δ|=1.01e-5 < tol=0.02 → agrees=true"},"pbo":{"quantity":"pbo","ours":0.6,"theirs":0.6,"delta":0,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"PBO: ours=0.600000 theirs=0.600000 |Δ|=0.00e+0 < tol=0.02 → agrees=true"}}
d33: {"state":"SIGNABLE","operatorSigned":false,"testRedesigns":1,"redesignSearchHashes":["7d63b5e25df25e9d3f8398d4105fd7e832abbcade4bccbdfd36fcea50b58d6c8"],"iidRider":{"stands":true,"classification":"HARNESS-COMPOSITION-GAP","direction":"the frozen PSR/DSR OVERSTATE confidence on autocorrelated input — the z-score uses √(n−1) over the raw observation count, treating n serially-dependent points as n independent ones, so the reported probability is too certain (biased toward SIGNABLE / toward 'yes').","magnitude":"z is inflated by ≈ √τ_int, where τ_int is the measured integrated autocorrelation time of the series. LIVE on this module's clone-stable AR(1)(ρ=0.95) demonstration, τ_int ≈ 35.8 (effective sample N_eff/N ≈ 2.8%). On ORGΛNON's OWN captured funding panel (recorded V26 via this same frozen effective_n.py), τ_int ranged 27–165 (median ≈ 124) → confidence overstated ≈ 5–13× (median ≈ 11×) on the most autocorrelated series. Daily yield series are less autocorrelated but τ_int > 1 always, so the DIRECTION always holds."},"riderEnforced":true,"pboEvidence":"independent (hand-rolled CSCV proven to detect + theory null-dist; degenerate 0.6-vs-0.6 retired)"}
census: {"originUnrecorded":78,"recovered":0,"reFounded":12,"deleted":0,"demonstrated":108}
d50: {"i":false,"ii":true,"iii":false,"iv":false}
reach: {"published":false,"reachableHumans":1,"installPath":"clone the repo · have Bun ≥ 1.3 · `./organon.sh` — or the built single-file binary + one line (D49, unsigned)"}
theNumber: {"manifestsReal":0,"cyclesUnpromptedReal":0,"realLineageCount":0}
laws: {"laws":17,"mintedThisSprint":0,"productCapabilityThisSprint":1}
newProductCapability: 1
verifyOnClone: {"exitCode":0,"battery":{"pass":2024,"skip":2,"fail":0,"files":303},"ran":true}
reckoning: {"d33Verdict":{"implementation":"SOUND","application":"SIGNABLE","riderEnforced":true,"recommendedForSignature":true,"operatorSigned":false},"accountabilitySplit":{"agent":"the MATHEMATICAL VERDICT — implementation sound (0 breaks, 5 classes, 0 frozen drift), application corrected (√(N_eff−1) the enforced default), recommended. The agent is accountable for the truth of this analysis.","operator":"the DECISION TO RELY ON IT — the signature. The agent cannot make the frozen core's former overstatement the Operator's informed choice; only the Operator can. The recommendation is unconditional; the last bit is the human's (LN5)."},"censusTwoIdentities":{"conservation":true,"growth":true},"contagionGuardComplete":true,"backfill":{"rateSpace":true,"judgeableTier":"JUDGEABLE-WITH-CAVEAT"},"delegation":{"D87":"AGENT-RATIFIED","D88":"AGENT-RATIFIED","D89":"AGENT-RATIFIED","operatorSigned":false},"bundle":"9c1e7bd8 byte-identical — the strict bar + N_eff land in the opt-in Stamp (off the mass path, outside the deterministic bundle); the Stamp's own verdict change is versioned in stamp-strict-record.json (F-1 ground truth, RP-1's scoped diff manifest)"}
```

## THE GENERATED HEADER

```json
{
  "pinsSha": "67d5cd4426796768daa9ad2c9d916ef10477885784bf2e7c59d47de4545f43c0",
  "terminalTree": "4665c7094a54494712961a0b56b6c3f96edbeadf",
  "commitSha": "08417e65f96f07cd86b81ab185f7c39a6ba309da",
  "pushed": false,
  "battery": "2024/2/0 · 303 files · 13450 expect() · two runs identical: y",
  "batteryDelta": {
    "pass": 2024,
    "prev": 1991,
    "added": 33,
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
      "7d63b5e25df25e9d3f8398d4105fd7e832abbcade4bccbdfd36fcea50b58d6c8"
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
    "originUnrecorded": 78,
    "recovered": 0,
    "reFounded": 12,
    "deleted": 0,
    "demonstrated": 108
  },
  "batteryContinuity": "prev 1991 + added 33 − removed 0 === now 2024",
  "censusIdentity": "demonstrated 108 + weak 0 + exempt 2 + originUnrecorded 78 === total 188",
  "continuity": "16 countables reconciled through the ONE reconciler; 7 moved, all classified (7 reconciled, 0 exempt, 0 unclassified) — continuity is total · census MOVED: CONSERVATION — inter-bucket transfers [no transfers] net to 0 (must be 0: a reclassification leaves the total unchanged); GROWTH — total 188 === prev 180 + wallsAdded 8 − wallsRemoved 0 (new walls change the total; a transfer does not)",
  "capabilityIsolation": "capability→verdict isolation: HELD — the capability→verdict fence holds: 3 capability engine(s) import 0 verdict-path modules, 4 verdict-path module(s) import 0 capability engines — RENDERED and CHECKED (not implied by the bundle hash)",
  "ownArchive": "187 points: 1 REAL★ (0.5%), 185 REAL-DERIVED (98.9%), 1 RETROSPECTIVE (0.5%) — PREDOMINANTLY THIRD-PARTY HISTORICAL (re-derivable, but NOT self-captured; the confidence is capped by the weakest dominant tier, REAL-DERIVED)",
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
      "pass": 2024,
      "skip": 2,
      "fail": 0,
      "files": 303
    },
    "ran": true
  },
  "reckoning": {
    "d33Verdict": {
      "implementation": "SOUND",
      "application": "SIGNABLE",
      "riderEnforced": true,
      "recommendedForSignature": true,
      "operatorSigned": false
    },
    "accountabilitySplit": {
      "agent": "the MATHEMATICAL VERDICT — implementation sound (0 breaks, 5 classes, 0 frozen drift), application corrected (√(N_eff−1) the enforced default), recommended. The agent is accountable for the truth of this analysis.",
      "operator": "the DECISION TO RELY ON IT — the signature. The agent cannot make the frozen core's former overstatement the Operator's informed choice; only the Operator can. The recommendation is unconditional; the last bit is the human's (LN5)."
    },
    "censusTwoIdentities": {
      "conservation": true,
      "growth": true
    },
    "contagionGuardComplete": true,
    "backfill": {
      "rateSpace": true,
      "judgeableTier": "JUDGEABLE-WITH-CAVEAT"
    },
    "delegation": {
      "D87": "AGENT-RATIFIED",
      "D88": "AGENT-RATIFIED",
      "D89": "AGENT-RATIFIED",
      "operatorSigned": false
    },
    "bundle": "9c1e7bd8 byte-identical — the strict bar + N_eff land in the opt-in Stamp (off the mass path, outside the deterministic bundle); the Stamp's own verdict change is versioned in stamp-strict-record.json (F-1 ground truth, RP-1's scoped diff manifest)"
  }
}
```

## THE GENERATED GATE (D27 now STRICT, first; the menu presented, never chosen — LN5)

```json
{
  "firstLine": "the instrument speaks · manifests (real) 0 · cycles unprompted (real) 0 · published false · reachableHumans 1 (BY DESIGN) · D51 ANSWERED = INSTRUMENT",
  "firstSection": {
    "d33": {
      "state": "SIGNABLE",
      "operatorSigned": false,
      "testRedesigns": 1,
      "redesignSearchHashes": [
        "7d63b5e25df25e9d3f8398d4105fd7e832abbcade4bccbdfd36fcea50b58d6c8"
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
    "d67": "the amended kill-criterion — ⟨N⟩ STILL EMPTY, awaiting the pen; and now the own-capture false-fire leg has a REAL★+REAL-DERIVED series with real depth: 187 points: 1 REAL★ (0.5%), 185 REAL-DERIVED (98.9%), 1 RETROSPECTIVE (0.5%) — PREDOMINANTLY THIRD-PARTY HISTORICAL (re-derivable, but NOT self-captured; the confidence is capped by the weakest dominant tier, REAL-DERIVED). the own-capture false-fire leg is JUDGEABLE-WITH-CAVEAT: 186 re-derivable points reach the 180-point floor, but the series is PREDOMINANTLY THIRD-PARTY HISTORICAL (REAL★ only 0.5%, 187 points: 1 REAL★ (0.5%), 185 REAL-DERIVED (98.9%), 1 RETROSPECTIVE (0.5%) — PREDOMINANTLY THIRD-PARTY HISTORICAL (re-derivable, but NOT self-captured; the confidence is capped by the weakest dominant tier, REAL-DERIVED)) — the count is judgeable as a TIERED count, its confidence capped by REAL-DERIVED (re-derivable, NOT self-captured); the caveat is inseparable from the flag (S195/O-4). It renders a COUNT with its tier mix + ratio, NEVER a verdict. HUMAN own-captures: 0 (a backfill is third-party, not a self-capture)."
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
    },
    {
      "id": "D87",
      "state": "RESERVED"
    },
    {
      "id": "D88",
      "state": "RESERVED"
    },
    {
      "id": "D89",
      "state": "RESERVED"
    },
    {
      "id": "D90",
      "state": "RESERVED"
    },
    {
      "id": "D91",
      "state": "RESERVED"
    }
  ],
  "d33": {
    "state": "SIGNABLE",
    "operatorSigned": false,
    "testRedesigns": 1,
    "redesignSearchHashes": [
      "7d63b5e25df25e9d3f8398d4105fd7e832abbcade4bccbdfd36fcea50b58d6c8"
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


---

*An agent signature, a naive-n Stamp, a home-grown D27 bar, a silent bundle move, an unstable N_eff, a census that sums a transfer with a birth, or a contagion score that says "diversify" is a **Halt**, not a done. None of them shipped.*
