# ORGΛNON — THE HARDENING SPRINT (V45): production readiness, exclusively — and the first thing the inventory found was a defect in its own last marker

**Builder Arc, sprint 15. NO NEW LAW (a tenth sprint — seventeen stand, zero minted).**

The mandate was verbatim and total: *"comprehensively identify, validate, and resolve every known or discoverable issue, deviation, shortcoming, regression, edge case, and UX gap identified across all previous sprints… red-team and adversarially test the entire system… a thoroughly hardened, production-ready system suitable for external user testing."* The one tension — *"external user testing"* beside D51 (INSTRUMENT, n=1 BY DESIGN) — is resolved by the state/act split: **readiness is a STATE the tool can hold; reaching a stranger is an ACT the pen makes.** So the terminal state is named in advance and honestly: **`READY-UNVERIFIED-BY-A-SECOND-HUMAN`.**

**The inventory's first discovery was a defect no audit caught, in the previous sprint's own marker.** V44's generated artifact held **two states for one deviation** — `deviationStates` listed D87/D88/D89 as `RESERVED` while the `reckoning` block, twenty lines below in the same file, said `AGENT-RATIFIED`. The exact S150 "one producer, contradiction unrepresentable" defect class, recurring because a new generated block was added that **did not read the one producer.** Confirmed empirically before a byte of design (`State.deviations() → D87 RESERVED`; `Rollup.reckoningSection().delegation → D87 AGENT-RATIFIED`). A hardening sprint that cannot find the defect in its own inventory document is theatre, so it led the registry as **P-1**.

**The method was the arc's own, turned on itself: a closed-loop open-issues registry.** Every finding from every audit (V38→V44) enumerated into eighteen pinned entries, each with a disposition — **`FIX` proven by a wall or an executed transcript, `ACCEPT-WITH-REASON` only under a named clause (a pen-stroke / constitutionally fenced / provably out of reach), or `PEN'S`** — and the gate **enumerates the registry and refuses the log while any entry lacks its proof** (S209). Grown by three mechanical discovery passes (the cross-read sweep that found P-1, the grep sweep, the empty-state walkthrough), never silently shrunk. The disposition census is the red team's answer to F-1: **FIXED 17 · ACCEPTED 0 · PEN'S 1** — acceptance is the lazy default, and it earned zero entries.

**The one-state rule became a wall over every generated block that will ever exist.** `State.deviationClaims(artifact)` extracts every `(deviationId, state)` claim from any block — the `deviationStates` array, the `reckoning.delegation` object, any `{id, state}` shape — and asserts each equals the one producer; the reckoning block now **reads** `State.byId()` instead of hardcoding a value that merely happened to match. A seeded two-state artifact **refuses on the real emit path** (S198). The cross-check now renders **both** `psr(naive)` and `psr(N_eff)` side by side, `riderEnforced` scoped inline to the Stamp, so an enforced rider never again sits beside an unscoped naive number (S202). And the census **CONSERVATION identity finally checked a real transfer** — one origin-unrecorded wall's origin was recovered this sprint (recovered 0→1), a genuine `OU → DEMONSTRATED` move that exercises the identity against something other than the empty `[no transfers]` it had only ever seen (P-4). MR13, nine sprints a ghost, is closed with its reason (P-6).

**Then the system was hardened where a stranger would actually break it.** A **real `kill -9`** — an uncatchable `SIGKILL` in a spawned subprocess — at **every seam** of the append path (before-open, after-open-before-write, after-write-before-fsync, after-fsync-before-index, each derived from the mechanism's own steps) leaves a chain that detects, quarantines, and **recovers**; the resume **chains** when the write never landed and **dedupes** when it did — never a fork, never a double, never a loss (S200/RP-2). A torn tail is quarantined to `.torn` and **never deleted** — the moat is append-only even in recovery. A dead endpoint renders an honest **`UNREACHABLE{endpoint, attempts, lastError}`**, never a bare null, and the endpoint that served a value is recorded **per point**; a silent swap to an unpinned understudy fails (S201). The sidecar is frozen under a committed **`uv.lock`** — `uv sync --frozen` reproduces numpy + scipy on a bare clone, and the frozen seven attest byte-identical (S205). The single-file binary is **byte-equal to the source** through a normalization pinned field by field, with a seeded real divergence proving the comparison can still fail (S206).

**Every workflow a second human would walk was executed and committed as a transcript, failure paths included** — first-run, capture (with its UNREACHABLE path), backfill (with its dedupe and its conflict-HALT), the socket negotiation (with its out-of-range refusal), the contagion score (with its UNJUDGEABLE), and authoring to its brink — the last **AGENT-quarantined**, `realLineageCount` untouched (S203). **Every UNJUDGEABLE now explains itself** and names its path to judgeable; the empty state is not hostile (S199). The guard's reach is stated as a single **aggregate across every render surface** — 24/31, per-surface, with its named holes and its lower-bound caveat carried, and the socket protocol re-verified live (S204). And the second human has a README that **leads with what the tool will not do** — advise, rank, optimize — and **why it mostly says INSUFFICIENT: by design**, the honest answer to short, autocorrelated history; every structural claim tied to a producer, no drift-prone figure embedded, guard-clean (S207). The clean-machine test showed its absence checks and disclosed its warm caches, never hidden (RP-3).

**No verdict moved.** The evidence bundle `9c1e7bd8` is byte-identical — hardening moves no verdict. And no bit was set: `operatorSigned:false` on every deviation; a seeded agent signature still **refuses the log** (S192, carried and re-proven). The pen's six keystrokes — D33, D67, D91, D49, IN2, the first HUMAN capture — render at the gate, each one keystroke away, **none made.**

*The door now has a handle, a signpost, a paved path, a recovery plan, and documentation a stranger could follow — and no footprints. Everything that was ever the agent's to build is built and hardened. The first footprint was never a Phase, and it is still the only thing missing.*


## THE GENERATED MARKER (X-DERIVE(a) — the machine wrote these claims; S181 CONTINUITY-checked, S192 LN5-checked, S198 ONE-STATE-checked, S209 TRACE-checked)

```
treeHash: 2079873a2e79bacb6d46631b381918b54505508d
commitSha: e8f93350a8763ea462400d066d2a30a3ba73c42c
pinsSha: 87913775c4b10dfecd26efbd8d417709294675ee7cdfba63ce6ac6e79de26833
battery: 2050/2/0
expect: 13629
verify: {"exitCode":0,"subchecks":[{"name":"evidence-bundle-reproduces","status":"pass","detail":"deterministic bundle reproduces (9c1e7bd88825d7a5); every claim + live number resolves; frozen seven git-clean"},{"name":"frozen-set-intact","status":"pass","detail":"7/9 present & byte-identical, 0 drift (2 absent on a clone, named)"},{"name":"curated-evidence-subset-matches-committed","status":"pass","detail":"curated evidence subset 1281 == committed evidence 1281 (the CURATED subset — the FULL battery is reconciled through Continuity, S180)"}]}
verifyOutput: verify exit 0 — every sub-check passed (evidence-bundle-reproduces, frozen-set-intact, curated-evidence-subset-matches-committed)
verifyCoverage: 7/9 (2 absent on a clone — monorepo-generated / gitignored, named in frozen-set-coverage.json)
goldenMoves: 0
crossCheck: {"dsr":{"quantity":"dsr","ours":0.4784209375780265,"theirs":0.4796379904843659,"delta":0.0012170529063393887,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"DSR: ours=0.478421 theirs=0.479638 |Δ|=1.22e-3 < tol=0.02 → agrees=true"},"psr":{"quantity":"psr","ours":0.9989334286155159,"theirs":0.9989434857193364,"delta":0.0000100571038205155,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"PSR: ours=0.998933 theirs=0.998943 |Δ|=1.01e-5 < tol=0.02 → agrees=true"},"pbo":{"quantity":"pbo","ours":0.6,"theirs":0.6,"delta":0,"tolerance":0.02,"agrees":true,"comparable":true,"detail":"PBO: ours=0.600000 theirs=0.600000 |Δ|=0.00e+0 < tol=0.02 → agrees=true"}}
d33: {"state":"SIGNABLE","operatorSigned":false,"testRedesigns":1,"redesignSearchHashes":["7d63b5e25df25e9d3f8398d4105fd7e832abbcade4bccbdfd36fcea50b58d6c8"],"iidRider":{"stands":true,"classification":"HARNESS-COMPOSITION-GAP","direction":"the frozen PSR/DSR OVERSTATE confidence on autocorrelated input — the z-score uses √(n−1) over the raw observation count, treating n serially-dependent points as n independent ones, so the reported probability is too certain (biased toward SIGNABLE / toward 'yes').","magnitude":"z is inflated by ≈ √τ_int, where τ_int is the measured integrated autocorrelation time of the series. LIVE on this module's clone-stable AR(1)(ρ=0.95) demonstration, τ_int ≈ 35.8 (effective sample N_eff/N ≈ 2.8%). On ORGΛNON's OWN captured funding panel (recorded V26 via this same frozen effective_n.py), τ_int ranged 27–165 (median ≈ 124) → confidence overstated ≈ 5–13× (median ≈ 11×) on the most autocorrelated series. Daily yield series are less autocorrelated but τ_int > 1 always, so the DIRECTION always holds."},"riderEnforced":true,"pboEvidence":"independent (hand-rolled CSCV proven to detect + theory null-dist; degenerate 0.6-vs-0.6 retired)"}
census: {"originUnrecorded":77,"recovered":1,"reFounded":12,"deleted":0,"demonstrated":121}
d50: {"i":false,"ii":true,"iii":false,"iv":false}
reach: {"published":false,"reachableHumans":1,"installPath":"clone the repo · have Bun ≥ 1.3 · `./organon.sh` — or the built single-file binary + one line (D49, unsigned)"}
theNumber: {"manifestsReal":0,"cyclesUnpromptedReal":0,"realLineageCount":0}
laws: {"laws":17,"mintedThisSprint":0,"productCapabilityThisSprint":0}
newProductCapability: 0
verifyOnClone: {"exitCode":0,"battery":{"pass":2050,"skip":2,"fail":0,"files":307},"ran":true}
reckoning: {"d33Verdict":{"implementation":"SOUND","application":"SIGNABLE","riderEnforced":true,"recommendedForSignature":true,"operatorSigned":false},"accountabilitySplit":{"agent":"the MATHEMATICAL VERDICT — implementation sound (0 breaks, 5 classes, 0 frozen drift), application corrected (√(N_eff−1) the enforced default), recommended. The agent is accountable for the truth of this analysis.","operator":"the DECISION TO RELY ON IT — the signature. The agent cannot make the frozen core's former overstatement the Operator's informed choice; only the Operator can. The recommendation is unconditional; the last bit is the human's (LN5)."},"censusTwoIdentities":{"conservation":true,"growth":true},"contagionGuardComplete":true,"backfill":{"rateSpace":true,"judgeableTier":"JUDGEABLE-WITH-CAVEAT"},"delegation":{"D87":"AGENT-RATIFIED","D88":"AGENT-RATIFIED","D89":"AGENT-RATIFIED","operatorSigned":false},"bundle":"9c1e7bd8 byte-identical — the strict bar + N_eff land in the opt-in Stamp (off the mass path, outside the deterministic bundle); the Stamp's own verdict change is versioned in stamp-strict-record.json (F-1 ground truth, RP-1's scoped diff manifest)"}
hardening: {"terminalState":"READY-UNVERIFIED-BY-A-SECOND-HUMAN","registryCensus":"FIXED 17 · ACCEPTED 0 · PEN'S 1 (of 18 entries)","registryProven":true,"oneState":true,"crossCheckBoth":"PSR naive 1.0000 (√(n−1), i.i.d.) │ PSR N_eff 0.7774 (√(N_eff−1), τ_int 35.8, N_eff 44.6) — riderEnforced true scoped to the Stamp (P-2/P-5/S202)","riderScope":"riderEnforced scopes to THE STAMP — the ONLY harness surface that renders a Sharpe-derived verdict (the mass path carries no verdicts, P-5). The naive PSR is the frozen i.i.d. statistic (mass path, cross-check); the N_eff PSR is the Stamp's enforced default (autocorrelation-adjusted). Both shown (S202) so the rider never sits beside an unscoped naive number.","rebasedTag":"rebased:{from:d5147f8d, to:7d63b5e2, scheme:immutable-core, at:V44} (stable)","stampScopeByDesign":"the strict bar + N_eff are Stamp-scoped BY DESIGN — the mass path carries no verdicts (P-5, pinned)","mr13":"CLOSED — undischargeable-by-agent, converted to the standing IN2·realLineageCount line (P-6)","discovery":"cross-read: 90 claims across 21 deviations, twoStateFound=false · grep: 194 files, 0 todo, 0 placeholder, 0 bare-catch · empty-state: 0 bare renders · DISCOVERED: 0","dispositions":{"fixed":17,"accepted":0,"pens":1},"ln5":"operatorSigned:false on every deviation — the pen's six keystrokes render at the gate, none made"}
```

## THE GENERATED HEADER

```json
{
  "pinsSha": "87913775c4b10dfecd26efbd8d417709294675ee7cdfba63ce6ac6e79de26833",
  "terminalTree": "2079873a2e79bacb6d46631b381918b54505508d",
  "commitSha": "e8f93350a8763ea462400d066d2a30a3ba73c42c",
  "pushed": false,
  "battery": "2050/2/0 · 307 files · 13629 expect() · two runs identical: y",
  "batteryDelta": {
    "pass": 2050,
    "prev": 2024,
    "added": 26,
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
    "originUnrecorded": 77,
    "recovered": 1,
    "reFounded": 12,
    "deleted": 0,
    "demonstrated": 121
  },
  "batteryContinuity": "prev 2024 + added 26 − removed 0 === now 2050",
  "censusIdentity": "demonstrated 121 + weak 0 + exempt 2 + originUnrecorded 77 === total 200",
  "continuity": "16 countables reconciled through the ONE reconciler; 7 moved, all classified (7 reconciled, 0 exempt, 0 unclassified) — continuity is total · census MOVED: CONSERVATION — inter-bucket transfers [DEMONSTRATED +1, ORIGIN_UNRECORDED -1] net to 0 (must be 0: a reclassification leaves the total unchanged); GROWTH — total 200 === prev 188 + wallsAdded 12 − wallsRemoved 0 (new walls change the total; a transfer does not)",
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
    "productCapabilityThisSprint": 0
  },
  "newProductCapability": 0,
  "verifyOnClone": {
    "exitCode": 0,
    "battery": {
      "pass": 2050,
      "skip": 2,
      "fail": 0,
      "files": 307
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
  },
  "hardening": {
    "terminalState": "READY-UNVERIFIED-BY-A-SECOND-HUMAN",
    "registryCensus": "FIXED 17 · ACCEPTED 0 · PEN'S 1 (of 18 entries)",
    "registryProven": true,
    "oneState": true,
    "crossCheckBoth": "PSR naive 1.0000 (√(n−1), i.i.d.) │ PSR N_eff 0.7774 (√(N_eff−1), τ_int 35.8, N_eff 44.6) — riderEnforced true scoped to the Stamp (P-2/P-5/S202)",
    "riderScope": "riderEnforced scopes to THE STAMP — the ONLY harness surface that renders a Sharpe-derived verdict (the mass path carries no verdicts, P-5). The naive PSR is the frozen i.i.d. statistic (mass path, cross-check); the N_eff PSR is the Stamp's enforced default (autocorrelation-adjusted). Both shown (S202) so the rider never sits beside an unscoped naive number.",
    "rebasedTag": "rebased:{from:d5147f8d, to:7d63b5e2, scheme:immutable-core, at:V44} (stable)",
    "stampScopeByDesign": "the strict bar + N_eff are Stamp-scoped BY DESIGN — the mass path carries no verdicts (P-5, pinned)",
    "mr13": "CLOSED — undischargeable-by-agent, converted to the standing IN2·realLineageCount line (P-6)",
    "discovery": "cross-read: 90 claims across 21 deviations, twoStateFound=false · grep: 194 files, 0 todo, 0 placeholder, 0 bare-catch · empty-state: 0 bare renders · DISCOVERED: 0",
    "dispositions": {
      "fixed": 17,
      "accepted": 0,
      "pens": 1
    },
    "ln5": "operatorSigned:false on every deviation — the pen's six keystrokes render at the gate, none made"
  }
}
```

## THE GENERATED GATE (the pen's six keystrokes render, none made — LN5)

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
      "state": "AGENT-RATIFIED"
    },
    {
      "id": "D88",
      "state": "AGENT-RATIFIED"
    },
    {
      "id": "D89",
      "state": "AGENT-RATIFIED"
    },
    {
      "id": "D90",
      "state": "SHIPPED"
    },
    {
      "id": "D91",
      "state": "RESERVED"
    },
    {
      "id": "D92",
      "state": "RESERVED"
    },
    {
      "id": "D93",
      "state": "RESERVED"
    },
    {
      "id": "D94",
      "state": "RESERVED"
    },
    {
      "id": "D95",
      "state": "RESERVED"
    },
    {
      "id": "D96",
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
    "productCapabilityThisSprint": 0
  },
  "newProductCapability": 0
}
```

## THE OPEN-ISSUES REGISTRY (S209 — the disposition census, RP-1)

```
FIXED 17 · ACCEPTED 0 · PEN'S 1 (of 18 entries)
```


---

*An untraced unit of work, a narrated debt, a two-state deviation, a bare UNJUDGEABLE, a silent RPC fallback, a deleted torn segment, a forked chain, a warm-cache "clean machine," a doc claim with no producer, the words "user-tested," or any pen-stroke by the agent is a **Halt**, not a done. None of them shipped.*
