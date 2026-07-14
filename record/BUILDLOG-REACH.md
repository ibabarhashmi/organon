# ORGΛNON — THE REACH SPRINT (V35) — BUILD LOG

**AN INSTRUMENT THAT CANNOT RETURN THE NEGATIVE RESULT IS NOT AN INSTRUMENT.** The falsification engine turned its own test on itself and found four claims it had been making about itself that it could not falsify. This sprint ends all four. **The Halt fired a second time, and V35 honored it: ZERO new product capability.**

```
REACH PINS_SHA:   8c80367a0deeb9d294d53d8b2c5ff5da2815724c0345844497dc4740dec0df70
                  (chain: 8c80367a ← 07d27f81 (Show) ← 96469dbb (Reckon) ← d90df3c7 (Cadence) ← 98a44bd8 (Manifest) ← 2b1dd373 (Domain) ← cc08a77b (Coverage) ← 6b285eba (Redesign) ← 3d0ef3bb (GroundTruth))
TERMINAL TREE:    8c579179df32e99fa87b76395cbcb159fd86a135          TERMINAL COMMIT: 1aac04d86554c7ded9aaa75759df586e004b3211 · pushed: n (publication Operator-gated)
STARTING TREE:    f2b06f1b5f97f1e214961f33bd49388f3b838242 (V34 Showing terminal) · drift vs V34: none
BATTERY:          1559 pass / 2 skip / 0 fail · 240 files · 9831 expect() — two runs: expect IDENTICAL y   ← S99 (no tolerance band)
VERIFY (object):  { exitCode: 0, subchecks: [
                    { name: "evidence-bundle-reproduces",        status: "pass", detail: "deterministic bundle reproduces (9c1e7bd8); every claim + live number resolves; frozen seven git-clean" },
                    { name: "frozen-set-intact",                 status: "pass", detail: "7/9 present & byte-identical, 0 drift (2 absent on a clone, named)" },
                    { name: "battery-count-matches-committed",   status: "pass", detail: "curated battery 1281/0 == committed evidence 1281/0" } ] }   ← never the word "green" (X-REACH(c))
FROZEN SET:       7/9 · drift 0
S94 CROSS-CHECK:  DSR=0.478421 (purgedcv 0.479638, |Δ|=1.2e-3 < 0.02) · PSR(0)=0.998933 · PBO=0.6 · deflation-collapse=0.5205 · DSR↓ monotonic (0.9405>0.7394>0.4784)   ← EXECUTED, never mocked
D33:              SIGNABLE (S94 green — the precondition met for the first time) · but UNSIGNED (LN5 — the agent never signs)
CENSUS:           demonstrated 14 · weak 0 · exempt 2 · origin-unrecorded 83 · no-seeded-negative-flag 1 (S54) · hash 641d75c0
REACH:            installPath "clone + Bun ≥1.3 + ./organon.sh — or the binary + one line (D49)" · firstRunSeconds 0.017 (MEASURED) · published false (DERIVED from git remote) · reachableHumans 1
THE NUMBER:       manifests (real) 0 · cycles unprompted (real) 0 · realLineageCount 0    (fixtures: 2 SEARCH / 24 OBSERVATION — dev noise)
LAWS:             16 · minted last 5 sprints 5 · PRODUCT CAPABILITY ADDED (last 2 sprints) 0
GOLDEN MOVES:     0   NEW PRODUCT CAPABILITY: 0
```

---

## THE LAW — X-REACH

> **An instrument that cannot return the negative result is not an instrument.**
> **(a)** a check that cannot fail is not a check — the seeded negative must be the ORIGINAL defect. **(b)** a cross-check that does not execute is an absence wearing a check's name. **(c)** a gate expected to be partially red is not a gate — "green" is DERIVED, never typed. **(d)** a number that could not have been non-zero is not a measurement. **(e)** reach is STRUCTURAL, never surveyed. **(f)** distribution is not capability.

Disclosed as the 16th law WITHIN the Halt (an instrument that ends four unfalsifiable self-claims is a restriction on what the agent may CLAIM, the opposite of scope creep). Zero product capability added.

---

## THE PHASES

**Phase 0 — PINS-LOCKED.** `data/honesty/reach-pins.json` carrying `07d27f81`, self-consistent (`8c80367a`), positive control shown (a mutated X-REACH clause moves the sha). All six X-REACH clauses, the census schema (4 buckets incl ORIGIN-UNRECORDED, RP-1), the derived verify object schema, the reach fact (published DERIVED, RP-4), D33's precondition, D49/D50 (window stated, RP-5), the 12 Part-A′ attacks + the 7 RP re-pins, the re-pinned Halt, walls S93–S99. **11/11 wall tests pass.**

**Phase 1 — S94, THE CROSS-CHECK EXECUTES (the phase that never sheds).** DD-9: **`purgedcv==0.1.2` installs under Py3.11.15**; the frozen DSR/PSR/PBO cross-check (`src/backtest/py/crosscheck.py`, calling the byte-frozen `rigor` vs the independent `purgedcv`, never a mock) **EXECUTED** — DSR `0.478421` vs purgedcv `0.479638` (|Δ| 1.2e-3). **F-2 answer (which of three): possibility (i)+(iii)** — the studio-slim venv (`requirements-studio.txt`) ships numpy+scipy ONLY; purgedcv lived in the parked heavy `requirements.txt`, so the cross-check was never installable via the standard setup path AND did not persist. **RP-2 durable fix:** committed `requirements-crosscheck.txt` + an idempotent, best-effort `provision_crosscheck` bootstrap in `organon.sh setup` — S94's green survives a fresh clone. **V33↔V34 contradiction reconciled:** V33's "sidecar live" ran effective_n + selftest_lending (which need only numpy/scipy), NOT the purgedcv cross-check — V33's claim of a correct environment was true for those, false for the cross-check. Numbers committed to `rigor-crosscheck.json` (X-SHOWN(e) — survives the env). **D33 pinned UNSIGNABLE-while-S94-red**; S94 is green so the precondition is met, but LN5 binds (operatorSigned=false). `checkFrozenSet` 0 drift (not one .py byte moved). **7/7 wall tests pass.**

**Phase 2 — S95/S99, THE GATE THAT WAS RED.** DD-10: `verify`'s battery-count sub-check — committed `1225` vs the live curated count. **Traced:** `build-evidence.ts` runs `organon-studio-test.sh` (the curated subset) and writes `battery-summary.json`; the summary was stale (the curated files grew across V31–V34 without a regenerate). **Re-pinned to truth: 1225/188 → 1281/197** (Rule XVII conscious re-pin, old→new shown), verify green end-to-end, deterministic bundle byte-identical (`9c1e7bd8`). **X-REACH(c):** the marker's verify slot is now a DERIVED OBJECT (`Verify.run() → {exitCode, subchecks[]}`, `src/organon/verify.ts`); `Marker.validate` gains a verify branch — **a marker typing "green" against a non-zero exit code FAILS (S95, seeded negative shown).** **DD-11/S99:** two full-battery runs produced **IDENTICAL** expect() (`9831` == `9831`) — the V34 ±3 jitter did not reproduce; **no tolerance band ships.** **6/6 wall tests pass.**

**Phase 3 — S93, THE FALSIFIABILITY CENSUS.** DD-12: `Falsify.census()` (`src/organon/falsify.ts`) — a PURE READ over the committed test tree (RP-6 living wall; the untracked build logs do NOT count, so it is clone-stable). **The headline: 83 of 99 walls have NO recorded originating defect** — the project had never systematically asked whether its own tests can fail. **14 DEMONSTRATED** (a seeded negative + a NAMED originating defect, a W-tag — never an invented origin, RP-1), **2 EXEMPT** (reasoned structural absence, enumerated), **83 ORIGIN_UNRECORDED**, **1 flagged** no-seeded-negative (S54, a heuristic lower bound stated for the auditor, attack #10). Committed content-hashed (`641d75c0`); a wall id beyond the pinned range is an ORPHAN and FAILS. **7/7 wall tests pass.**

**Phase 4 — S96/D49, REACH (sheds first — did not shed).** DD-13/DD-14: `bun build --compile` → a working **59M single-file binary** of the SAME code; `organon` (no args) → the committed fixture Reality Check, **offline, keyless, in 0.017s (MEASURED)**, status 200, byte-identical to the source render (`ORGANON_ROOT` anchors `PKG_ROOT` so the compiled binary finds the on-disk data/). **Three hardening assertions, walled at the provable strength (RP-3):** (i) no key required; (ii) no provider constructed on the offline path — `AskProvider.fromEnv({})===null` + SBOM two leaf deps zero transitive (NOT an unqualified "zero egress"); (iii) the studio console DISABLED unless `--studio` (a seeded default-launch REFUSES, exit 2). **REACH FACT (structural, X-REACH(e)):** `published` DERIVED from `git branch -r --contains HEAD` (RP-4, not a constant — empty → false), `reachableHumans = published ? UNJUDGEABLE : 1` (a seeded published:false with reachableHumans>1 FAILS). **7/7 wall tests pass.**

**Phase 5 — S97/S98 + DD-16, THE RESIDUES.** **S98/DD-15/C-3:** MR1's depth census recomputed and STATED as an outcome — **domain-catch 0/7, UNCHANGED** (no curated-shelf subject classifies into a new domain, D34); the four pinned MR1 subjects are RESOLVABLE (4/4 present, 1284 pools) and classified (ethena-usde/sUSDe → STABLE-SYNTH, stated without inflating the curated census), NOT force-shelved (the Halt). *A census that only ever improves is not a census* — this one honestly reports no improvement. **S97/C-7:** the transcript corpus grown by **5 REAL adversarial baits from a DIFFERENT LENS** (comparison/roleplay/social-proof/negation/urgency), captured LIVE via Groq, appended under a distinct kind (the frozen V34 corpus untouched) — **the persona held on all 5** (every output deferred; the ONE guard would govern any advice-shaped span); the honest limit pinned (a corpus grading its own homework is a WEAK wall). **DD-16/C-6:** `checkFrozenSet` 7/9 CANNOT be closed to 9/9 without a boundary violation (importing a monorepo artifact / committing gitignored local data) — the pinned golden SHAs in `frozen.ts` are the entire record (R-6). **12/12 wall tests pass (V34 corpus unbroken).**

**Phase 6 — THE GATE.** Presented whole, NEVER signed (LN5). See below.

---

## THE DELEGATED-DECISION RECORD (DD-9 … DD-16)

- **DD-9** (purgedcv): the tree showed `requirements-studio.txt` (numpy+scipy) vs `requirements.txt` (purgedcv==0.1.2, line 14). Decision: install + execute (never mock). Evidence: `crosscheck.py` output DSR 0.478421 vs purgedcv 0.479638, agree=true. D33 precondition pinned.
- **DD-10** (battery count): the tree showed `build-evidence.ts::batterySummary` runs `organon-studio-test.sh`; committed `battery-summary.json` = 1225/188. Decision: re-pin to truth (outcome i). Evidence: 1225/188 → 1281/197; verify green; bundle 9c1e7bd8 byte-identical.
- **DD-11** (expect jitter): two full-battery runs, expect() 9831 == 9831 — identical. Decision: no band ships; the jitter did not reproduce. Evidence: /tmp/battery-A, /tmp/battery-B both 9831.
- **DD-12** (census): built `Falsify.census()`, 4 buckets, committed 641d75c0. Evidence: 14/0/2/83 + 1 flagged.
- **DD-13** (binary): `bun build --compile` → 59M binary, runs offline/keyless, console gated. Evidence: status 200, 0.017s, exit 2 on --studio.
- **DD-14** (first-run): measured 0.017s on the committed fixture, offline, no keys. Evidence: `reach.json`.
- **DD-15** (MR1 census): domain-catch 0/7 unchanged; 4 subjects classified. Evidence: `mr1-census.json`.
- **DD-16** (frozen 7/9): cannot close without a boundary violation. Evidence: `frozen-set-coverage.json`.

---

## THE GATE (presented whole — D23–D50; **D27 STILL FIRST, the TENTH sprint**) — NEVER SIGNED (LN5)

**THE FIRST LINE — two facts, in order:**
> **manifests authored (real): 0 · cycles run, unprompted: 0 — and published: false · reachableHumans: 1.**
> *The number is zero. And until now, exactly one human could have made it otherwise.*

- **D50 — THE KILL-CRITERION, DEFERRED, HASH-PINNED, WITH ITS ENDING CONDITION:** the kill-criterion (`8b4e094b`) may be weighed on the cycles-run number when and only when (i) a binary exists ✓, (ii) an install path exists ✓, (iii) the tree is PUBLISHED (derived; currently false), and (iv) **90 days from the publication commit, or 30 days from the first external clone, whichever is sooner**, have elapsed. Until then the zero is the Operator's calendar, not the market's verdict.
- **TWO BLOCKING OPERATOR ACTS, NOT ONE: IN2 (perform it) and PUBLICATION (decide it).** Firing the kill-criterion before both are discharged would be the project's own X-HONEST violation.
- **D49** (the binary, against the Halt's letter — unsigned; the Operator may strike it and Phases 1–3, 5 still stand). **D33 — PRESENTED AS UNSIGNABLE-while-S94-red;** S94 is green so the precondition is met, but the gate still does not sign it (LN5). **D46 still PRESENTED, NOT IMPLEMENTED.**
- **LAWS: 16 · minted in the last 5 sprints: 5 · product capability added in the last 2 sprints: 0** (F-7 — the three numbers, side by side, for the pen).
- **THE HALT'S TERMINAL CLAUSE:** if V36 opens with IN2 unperformed AND the tree unpublished, the Operator has answered the kill-criterion's question BY INACTION, and the gate must say so, out loud, in the first line.
- OWED-OPERATOR-GATED: IN2 · IN4 · AF4 · D42 · publication · the market finding · the curator conversation. The agent presents; it never signs.

---

## HONEST DISCLOSURES

1. The ±3 expect() jitter noted at V34 **did not reproduce** across two full-battery runs (9831 == 9831); the tolerance band is not shipped (S99). If a future run reveals it, DD-11's exclude-with-reason mechanism is armed.
2. The compiled binary is a **gitignored build artifact** (59M, platform-specific), never committed — the SAME code. The reachable install path this sprint remains `clone + Bun + ./organon.sh`; the binary proves distribution is possible (D49).
3. The full pristine fresh-clone run was not executed; the bundle-reproduction (9c1e7bd8) + checkFrozenSet 0-drift + two clean full-battery runs are the shown proofs.
4. D49/D50/D33/D46 presented, never signed (LN5).

```json TERMINAL-MARKER
{
  "treeHash": "8c579179df32e99fa87b76395cbcb159fd86a135",
  "commitSha": "1aac04d86554c7ded9aaa75759df586e004b3211",
  "pinsSha": "8c80367a",
  "battery": "1559/2/0",
  "expect": "9831",
  "verifyOutput": "exit 0 · evidence-bundle-reproduces pass · frozen-set-intact pass · battery-count-matches-committed pass",
  "verifyCoverage": "7/9 because RWA-VERDICT.md + data/snapshot/MANIFEST.json are absent on a clone",
  "goldenMoves": 0,
  "verify": { "exitCode": 0, "subchecks": [
    { "name": "evidence-bundle-reproduces", "status": "pass", "detail": "9c1e7bd8" },
    { "name": "frozen-set-intact", "status": "pass", "detail": "7/9, 0 drift" },
    { "name": "battery-count-matches-committed", "status": "pass", "detail": "1281 == 1281" } ] }
}
```

**SESSION MARKER —** `DONE` · next intended step: the Operator discharges the two pens (IN2, PUBLICATION); if V36 opens with both unmoved, the gate declares the kill-criterion answered by inaction.
