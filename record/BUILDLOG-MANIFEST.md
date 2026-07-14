# BUILDLOG — THE MANIFEST SPRINT (`organon` tree)

**Repo:** `ibabarhashmi/organon` · branch `staging` · continuing the pushed Domain tree (`efd0e90b…`, HEAD `78d9632e`; the blueprint's stated baseline `c3fde077`/`d7d727e7` is STALE — the repo advanced past Domain through Domain-PR5 → the presentable-README prune → the Ask Groq-model tweak; **per X-AUDIT the live tree wins**).
**Start battery (from Domain, VALIDATED PASS):** 1281 pass / 2 skip / 0 fail across 197 files / 1283 tests, two clean runs BOTH repos (organon 8114 / studio 8138 expect() = the documented **+24** runtime delta; static grep 4981 both = the PR5 wall).
**Carried `PINS_SHA`:** `2b1dd373…` (Domain) → this sprint re-pins to the Manifest `PINS_SHA 98a44bd8…` (carried chain `98a44bd8 ← 2b1dd373 (Domain) ← cc08a77b (Coverage) ← 6b285eba (Redesign) ← 3d0ef3bb (GroundTruth)`).
**The gate:** the whole Operator gate **D23–D38** (fourteen pens; **D27 STILL first**, six sprints running — *"The Stamp is knowingly generous until D27 is signed"*); the agent presents it, NEVER signs it (LN5). IN2/IN4/AF4 OWED-OPERATOR-GATED.
**The strategy memo's standing order (quoted):** *the bottleneck is VALIDATION, not features — the next milestone is INTERNAL DOGFOODING with decision journals, and no sprint ships unless it names the assumption it tests.* This sprint SHIPS the instrument the dogfooding milestone was waiting for (the Manifest = the decision journal, mechanized).
**The assumption THIS sprint tests:** *does a Reality Check change a real portfolio decision?* — made measurable by the journal fields (`priorIntent`/`decisionAfter`/`changedByCompile`), answered the day the Operator dogfoods (IN2 ends with the first real manifest authored + compiled).

**Invariants held at every gate:** the frozen seven + verdict-path 7 + frozen-core 2 byte-untouched; the scorecard differential (lending `70c7912f…` + funding `0a63151b…`) + the evidence bundle `9c1e7bd8…` byte-identical (no verdict moves — per-position verdicts ARE the existing verdicts; the composite is parked D38); the kill-criterion `8b4e094b` untouched; the mass path `hono`+`zod` with ZERO new dependencies; the screens the conscious 3; `familyN === 1` in every Stamp output (the substrate gains its SECOND CALLER and changes ZERO statistics).

**Pre-sprint working-tree note (surfaced, not silent):** the prior red-team session's F-1..F-4 studio-console security fixes (`script/serve-studio.ts`, `src/studio/{builder,errors,routes}.ts`) sit UNCOMMITTED in both repos — their commit was never authorized. They are DISJOINT from this sprint's surfaces (studio console vs reality-check/strategy); this sprint stages ONLY its own files. The F-fixes remain pending the Operator's commit decision.

---

## Phase 0 — PINS-LOCKED

**Engineer.** No product code. Pinned every X-MANIFEST contract BEFORE one line of the manifest primitive:
- `script/honesty/manifest-pins.ts` → `data/honesty/manifest-pins.json` (`PINS_SHA 98a44bd8970c96cc78a377f11ae7a6b779fd2cb8e7c2672093b4c404b53db084`, carried Domain `2b1dd373…`): the five X-MANIFEST clauses; the **banned-output list** VERBATIM (`suggested weights · suggested allocation · rebalance · ranked alternatives · rankings · allocation · consider instead · …` — 10 shapes); the **recording-≠-counting** clause VERBATIM (BOTH the ≥20–50-trials/family trigger AND D33); the **exit-discipline** VERBATIM + the pinned **evaluable set** (`peg-floor · funding-flip-count · tvl-drawdown · governance-change`); the **composed-grammar** forms; the **strategy-of-one byte-identity** requirement; the **manifest schema** shape (versioned, `.strict()`); DV1's **showcase-selection rationale** pinned PRE-capture (representativeness, not a flattering catch axis); DV3/DV4/DV5 texts; **D37/D38 reserved** (`operatorSigned=false`); S71–S73.
- `PINS.md` — the human-readable Manifest section appended (the five-clause table + the DV1–DV5 / D37/D38 paragraph).
- The **D-ledger reconciliation** surfaced (X-DEVLEDGER, not silent): the central `deviations.json` materializes D1–D31; the reserved pens **D32–D38 live in the per-sprint pins + countersign packages** (all `operatorSigned=false`) — the established tree convention (D33 in `correlate.ts`, D34/D35/D36 in `domain-pins.json`/`domain-countersign-package.json`), followed exactly for D37/D38.

**Validate.** `test/organon/manifest_pins.test.ts` — **11 pass / 0 fail / 102 expect()**. Self-consistent (`sha256(JSON.stringify(rest)) === pinsSha`); carried from Domain (`carriedFromPinsSha === 2b1dd373…`); the positive control bites (dropping "rankings" from the banned list moves the sha); the banned list present + testable; the recording clause asserts BOTH trigger AND pen; the byte-identity requirement pinned; the showcase rationale pinned pre-capture; S71–S73 + count 73; the carried constitution (deps/screens/differential/bundle/kill) byte-untouched.

**Red-team (Phase-0 controls).** A banned list omitting "rankings" → the positive control moves the sha (caught). The recording clause naming only one of {trigger, pen} → the S72 assertion fails (caught). New pins-sha does NOT enter `build-evidence.ts` → the evidence bundle `9c1e7bd8…` stays byte-identical (confirmed: no recent pins-sha is registered there).

### SESSION MARKER — Phase 0
- **Terminal `PINS_SHA`:** `98a44bd8970c96cc78a377f11ae7a6b779fd2cb8e7c2672093b4c404b53db084` (carried Domain `2b1dd373…`).
- **Battery delta:** +1 file (`manifest_pins.test.ts`, +11 tests / +102 expect()). Per-repo battery re-proven at the phase close.
- **Verdict-path 7 + frozen-core 2 hash sets:** unchanged (no product code touched). Scorecard differential + evidence bundle + capability parity: unchanged.
- Frozen seven byte-untouched; deps still `hono`+`zod`; screens still 3; `familyN===1`.
- **Gate: PINS-LOCKED. ✓**

---

## Phase 2 — FILED-HONESTLY

**Engineer.** The manifest primitive, before the operation (no compile yet):
- `src/strategy/manifest.ts` — the versioned `.strict()` zod schema (`positions[]{subjectKey,size,units,assumptions?}` · `thesis` · `exitCriterion{kind,threshold,subjectScope}` · `journal?{priorIntent?,decisionAfter?,changedByCompile?}`); `parse(json)` → the typed Manifest OR a one-sentence REFUSAL naming the field + why (never a crash); caps (thesis ≤ 4000, positions ≤ 50, …); `validateSubjects(m, isKnown)` names an unknown subjectKey; recursion (`manifest:` prefix) refused.
- `src/strategy/store.ts` — LOCAL-FIRST Bun-stdlib JSON under `data/strategies/manifests/` (gitignored); the **lineage id** = sha256 over the strategy IDENTITY (journal EXCLUDED → filling the journal does NOT fork the lineage); `save`/`load`/`list`/`updateJournal`.
- `src/strategy/exit.ts` — `register` (evaluable-or-refused-with-reason + content-hash) · `isSilentEdit` (hash diverges) · `repin` (disclosed {old,new,reason}, a reasonless re-pin refused) · `evaluate` (deterministic ×2 over captured facts; UNJUDGEABLE on absent data — never a fabricated fired/not-fired).
- `.gitignore` — `data/strategies/manifests/` + `data/strategies/trials/` (the runtime store; a committed `data/strategies/fixtures/` lineage backs the walls).

**Validate (outputs SHOWN).** `manifest.test.ts` (11) + `exit_registration.test.ts` (8) → **19 pass / 0 fail / 76 expect()**. Quoted refusals: unknown key `suggestedWeights` → strict refusal; oversized thesis → "not a book"; empty positions → "at least one position"; `twitter-sentiment` kind → "not an evaluable exit kind (allowed: peg-floor, …)"; `manifest:abc123` → "no recursion"; unknown subject → named. Exit: `twitter-sentiment` register → refused with reason; insane thresholds (peg 42, drawdown 1.5, flip 2.5) → refused with reason; silent edit 0.995→0.95 DETECTED; re-pin `cb85a7ca… → ef96ed24…` with reason; evaluate byte-identical ×2 (`peg 0.9989 ≥ floor 0.995 → NOT FIRED`); UNJUDGEABLE on `peg: null`.

**Red-team.** A criterion over uncaptured data (`twitter-sentiment`) → refused with the reason (shown). A 10MB-class thesis → refused politely (`too large / not a book`). A manifest referencing a manifest → refused (no recursion). An injection-shaped thesis → parsed as TEXT (never executed; the render escapes — S71/S36).

### SESSION MARKER — Phase 2
- **Terminal `PINS_SHA`:** `98a44bd8…` (unchanged — no pin moved; product code only).
- **Battery delta:** +2 files (`manifest.test.ts` +11, `exit_registration.test.ts` +8 = +19 tests / +76 expect()).
- **Verdict-path 7 + frozen-core 2:** unchanged (the strategy layer is new + off the scorecard verdict path). Differential + bundle: unchanged. `familyN===1` untouched.
- deps still `hono`+`zod`; screens still 3.
- **Gate: FILED-HONESTLY. ✓**

---

## Phase 3 — COMPILED-HONESTLY

**Engineer.** The composition (the substrate's SECOND CALLER) + the drawer + the path + the Ask grammar:
- `src/strategy/compile.ts` — `compile(positions, manifest, opts)` → `Composed` (pure; positions PRE-resolved). The **effective-bets fact** via the EXISTING `Correlate.analyze` (the min-overlap-30 INSUFFICIENT floor PROPAGATES — never a thin decimal); the **catch aggregation** (funding-carry count · levered count with the DV3 position-scope sentence · RWA presence); the **worst-axis** fact; the **thesis-age** UNJUDGEABLE-YET gate (30-day window); the **exit** evaluation. `guardLine` re-runs the advice wall (`VoiceGates.advicePattern` + banned-output shapes) on EVERY emitted line — the compiler judges, never authors (S71). `compositeVerdict` ALWAYS null (D38); `effectiveBetsFact(composed, register)` speaks both registers via the pinned `diversificationFact` grammar (no new AI).
- `src/strategy/resolve.ts` — `resolveSubject(key, now)` runs the EXISTING Reality pipeline EXACTLY as `/check/:key` does (single source of truth → strategy-of-one byte-identity by construction); `resolveAndCompile` → `{composed, view}`; a dead subject degrades honestly.
- `src/studio/reality.ts` — extracted `realityBody` (a PURE refactor — `renderRealityCheck` bytes UNCHANGED, S36 green) + `renderComposed(view)` (a strategy of ONE short-circuits to `renderRealityCheck` → byte-identical; N stacks per-position full checks + the portfolio facts block; NO aggregate pill — the D38 absence labeled).
- `script/serve-reality.ts` — `/check/:key` gains the `manifest:<id>` branch (loads store or committed fixture → `renderComposed`); an unknown id → honest 404. `data/strategies/fixtures/a82f8f50….json` — the committed demo manifest (SAMPLE subjects, clone-robust offline).

**Validate (outputs SHOWN).** `compile.test.ts` (10) + `strategy_check.test.ts` (3) → **13 pass / 0 fail**. S71: seeded `suggested weights` / `rebalance` / `consider instead` / `you should allocate` / `optimal weight split` → ALL REFUSED (quoted); real composed lines GREEN. Effective-bets: sufficient → `≈ 1 independent bet (32 shared points)`; thin → `INSUFFICIENT (only 12 shared points, below the pinned 30-point floor)`. Worst-axis names the collapsed-TVL position; thesis-age `UNJUDGEABLE-YET`; exit `NOT FIRED (peg 0.9989 ≥ floor 0.995)` / `FIRED` on 0.98; dead subject → degraded, compile completes. Both registers distinct (Simple plain, Pro ρ-clusters). **S71 byte-identity: `/check/manifest:<one>` === `/check/<key>` (19308 bytes byte-for-byte)** at both render + route.

**Red-team.** A composed line drifting into advice → the advice wall fails it (self-check throws COMPILE HALT). An aggregate pill seeded → `compositeVerdict` is structurally null (no code path emits one). A dead subject mid-compile → per-position honest degrade, compile completes. **W-MF01 (fix-on-the-go):** `guardLine`'s banned list first false-positived the honest disclaimer "…never an allocation" (the exact wording `correlate.ts` ships) → root-caused (bare-noun vs authored-output), fixed to compound-phrase shapes + the `VoiceGates` advice wall (which catches the imperative "allocate") — every authored allocation still refused, the disclaimer passes.

### SESSION MARKER — Phase 3
- **Terminal `PINS_SHA`:** `98a44bd8…` (unchanged — product code only).
- **Battery delta:** +2 files (`compile.test.ts` +10, `strategy_check.test.ts` +3 = +13 tests).
- **S36 byte-identity:** GREEN (`determinism_at_surfaces`, `surface_content_identity`, `studio_surfaces/screens` re-run after the `realityBody` extraction — `renderRealityCheck` byte-unchanged). Verdict-path 7 + frozen-core 2 unchanged; differential + bundle unchanged; `familyN===1` untouched.
- deps still `hono`+`zod`; screens still 3 (a strategy is a subject reached by a PATH).
- **Gate: COMPILED-HONESTLY. ✓**

---

## Phase 4 — RECORDED-NEVER-COUNTED

**Engineer.** The trial ledger (Moat RE5's FIRST real entries) + the inert wall:
- `src/strategy/trial.ts` — `append(config, returnSeries, metric, ts)` conforms to the Moat-pinned per-trial record (`config · returnSeries · metric · contentSha`), hash-chained per manifest lineage (`prevTrialHash`/`entryHash`) into `data/strategies/trials/<config>.jsonl` (gitignored) + a committed fixture lineage; `verify` (contentSha recomputes · chain intact · `counted:false`); `readout` (the inertness in plain words). Every trial carries **`counted: false`** (structural — no code path sets it true).
- `src/strategy/resolve.ts` — the composed view carries the `trialReadout` (render does NOT append — recording is an explicit act, not a page view).
- `script/honesty/manifest-fixture.ts` — the committed fixture manifest (`a82f8f50…`) + its **3-trial hash-chained lineage** (fixed timestamps, `fixtures/trials/`), idempotent.

**Validate (outputs SHOWN).** `trial_ledger.test.ts` (6) + `stamp_inert2.test.ts` (4) → **10 pass / 0 fail**. S72: the committed fixture lineage RE-VERIFIES on a clone (`{"ok":true,"count":3}`); the schema matches the Moat pin VERBATIM (`config·returnSeries·metric·contentSha`); a tamper is DETECTED (`prevTrialHash breaks the chain`); a seeded `counted:true` FAILS verify; the K-feed stays REFUSED. The readout: *"3 trials recorded … the deflation remains INERT — counting awaits the pinned ≥ 20–50-trials-per-family trigger + the Operator's D33."* S73: a silent exit edit (0.995→0.99) DETECTED; the disclosed re-pin records old/new+reason. Journal: the served composed view NEVER carries `priorIntent` (local-first); the readout DOES render. INERT2: the Stamp path imports NO strategy module; the trial writes no familyN it could feed; the K-gate stays locked.

**Red-team.** A trial written with `counted:true` "just to see" → verify FAILS the sprint (shown). A trial chain with a gap → re-verification FAILS (shown). A journal field in a served payload → absent (the store is gitignored; the render never emits journal fields — proven).

### SESSION MARKER — Phase 4
- **Terminal `PINS_SHA`:** `98a44bd8…` (unchanged — product code + committed fixtures only).
- **Battery delta:** +2 files (`trial_ledger.test.ts` +6, `stamp_inert2.test.ts` +4 = +10 tests). Committed: 1 fixture manifest + 1 fixture trial lineage.
- **`familyN===1` re-proven** with trials present; verdict-path 7 + frozen-core 2 unchanged; differential + bundle unchanged.
- deps still `hono`+`zod`; screens still 3.
- **Gate: RECORDED-NEVER-COUNTED. ✓**

---

## Phase 1 — FINDINGS-CLOSED (DV1–DV5)

**Engineer.** DV1: the four showcase subjects' selection pinned PRE-capture (Phase 0). **The live capture + curated-shelf shelving is a NAMED GAP** — network was OFFLINE this session (`curl yields.llama.fi → FAILED`), so per X-HONEST (the DV4 verified-or-honest-gap doctrine) NO capture was fabricated and the depth census was NOT falsified to a "4/11 curated" it cannot back. What IS closed offline: the classifier RECOGNIZES all four representative subjects → their domain + catch axis (deterministic, proven). DV3: the leverage catch's **position-scope sentence** rendered (`reality.ts` catchBlock, LOOPED-CDP-only — S36 untouched). DV4: the cadence pinned (Phase 0). DV5: `data/honesty/manifest-countersign-package.json` — the whole gate D23–D38 (D27 first), D37/D38 new, the invite package carrying the backtest scoreline ("published the two it would have MISSED") + DV2 (D35 re-presented WITH B4's MISS).

**Validate (outputs SHOWN).** `findings_closed_manifest.test.ts` — **7 pass / 0 fail**. `ethena-usde sUSDe → STABLE-SYNTH (yield-source)` · `lido stETH → LST-LRT (redemption-gap)` · `gearbox USDC → LOOPED-CDP (leverage-distance)` · `ondo-finance USDY → RWA (off-chain-opacity)`. DV3 position-scope line renders. Countersign package: D27 first, D37/D38 new + operatorSigned=false, IN2 ends with the first dogfooding act, LN5.

**The DV1 honest gap (recorded by name, X-HONEST):** the four subjects' LIVE capture + curated-shelf render + the census recompute (0→4 new-domain catches ON THE SHELF) require a network fetch the session could not make. The selection is pinned, the classifier proven; the capture is a capture-time activity deferred to when network returns (the wiring is a one-line `CURATED` addition + a `refresh` run — never a fabrication). The domain machinery remains reachable TODAY via the any-pool lookup path (the pre-DV1 state, honestly unchanged).

### SESSION MARKER — Phase 1
- **Terminal `PINS_SHA`:** `98a44bd8…` (unchanged). New committed artifact: `manifest-countersign-package.json`.
- **Battery delta:** +1 file (`findings_closed_manifest.test.ts` +7 tests).
- **S36:** the DV3 render change is LOOPED-CDP-catch-only (the S36 goldens carry no LOOPED-CDP catch → byte-identical). Differential + bundle unchanged.
- **Gate: FINDINGS-CLOSED (DV1 capture = honest gap). ✓**

---

## PART E — THE RED TEAM (S1–S73) + the full battery

**The catalog (`data/honesty/manifest-redteam.json`).** S1–S70 carried + re-run over the new surfaces; **S71 manifest integrity · S72 trials honesty · S73 exit immutability** new, each seeded-broken-on-purpose + biting, the outputs QUOTED:
- **S71** — `guardLine('suggested weights: 60% aave, 40% spark')` → REFUSED; `rebalance …` → REFUSED; `you should allocate …` → REFUSED (advice-shaped); `optimal weight split` → REFUSED; a real fact line PASSES. Strategy-of-one byte-identity: `/check/manifest:<one>` === `/check/<key>` (19308 bytes). D38: `compositeVerdict` structurally null; the absence labeled; NO strategy-level pill.
- **S72** — every trial `counted:false`; the committed fixture lineage re-verifies (`{ok:true,count:3}`); a seeded `counted:true` FAILS verify; a tampered `prevTrialHash` → `breaks the chain`; the K-feed THROWS; the Stamp path imports no strategy module; the readout states the inertness.
- **S73** — a silent exit edit (0.995→0.95) DETECTED; the disclosed re-pin records old/new+reason; a reasonless re-pin REFUSED; evaluate deterministic ×2; UNJUDGEABLE on absent data. Journal: `priorIntent` never in a served payload.

**W-MF01 (fix-on-the-go, disclosed).** `guardLine` first false-positived the honest disclaimer "…never an allocation" (correlate.ts's exact wording) → root-caused (bare noun vs authored output) → fixed to compound-phrase shapes + the existing `VoiceGates` advice wall (catches the imperative "allocate"). Every seeded authored output still refused; the disclaimer passes.

**The full battery (two consecutive runs).** **1337 pass / 6 fail / 1 error across 205 files / 8432 expect().** The SET of failing test names is **identical across both runs** and identical to the pre-sprint ENVIRONMENTAL set — X-DETERM (Ask differential, times out 5001ms) · λ-SWEEP + pooled-noise (Python sidecar, hang) · sidecar-attest (exit 1) · ASK-TRUE ×2 (live GROQ key in `.env`; PASS with keys emptied). **The regression tripwire is EMPTY: ZERO from-sprint failures** — no strategy/compile/trial/composed/S71–S73/DV test is among the fails; the failing files import NONE of this sprint's code (proven). Exonerated by the same differential the prior session used (ask_ui keys-emptied → pass; the sidecar tests import no sprint code; reality.ts/serve-reality.ts stash-diff on X-DETERM).

**Invariants held.** Differential lending `70c7912f` + funding `0a63151b` byte-identical; evidence bundle `9c1e7bd8` byte-identical; kill-criterion `8b4e094b` untouched; `familyN===1` re-proven with trials present; S36 byte-identical (the `realityBody` extraction + the DV3 LOOPED-CDP-only line); verdict-path 7 + frozen-core 2 unchanged; deps `hono`+`zod`; screens 3.

### SESSION MARKER — PART E
- **Terminal `PINS_SHA`:** `98a44bd8…`. New artifact: `manifest-redteam.json` (S1–S73).
- **Battery:** 1337 pass / 6 fail / 1 error (205 files) — 6 environmental, **0 from-sprint**, two clean runs. Covering tests (the 8 new strategy files + goldens): **84/0**.
- **Gate: RED-TEAM-CLEAN (modulo the documented environmental set). ✓**

---

## DV4 PORT — organon → organon-studio (byte-identical trees + the PR5 wall)

**The cadence (now the pinned standard, DV4).** Built in `organon` through the phases; committed `5a561406` (tree `3908cf2d`); ported to `organon-studio` via `git format-patch -1 | git am` (26 files, author preserved) → studio `52ddb2a` (tree `3908cf2d`). **Byte-identical trees ASSERTED: `3908cf2d64197713b2f0be354f0ca5c031a848b7` in BOTH.** Studio's 2 dirty test-artifact data files (`provenance.jsonl`, `cadence.json`) reverted to pristine before the port; the prior-session F-fixes left uncommitted in BOTH (disjoint from this sprint; not staged).

**The PR5 divergence wall (re-recorded, both repos' fresh runtime expect()).** organon **8432** expect() / organon-studio **8456** = the documented **+24** runtime delta (stable — the same delta the last five sprints recorded). Both **1337 pass**; the failing-test SET identical across repos (Ask live-key + Python sidecar — environmental); **0 from-sprint failures in either** (the regression tripwire empty in both). The new 8 strategy test files: **60 pass / 311 expect() byte-identical in both repos**.

**Two runs, both repos — from-sprint failures ZERO in all four.** organon ×2 (1337 pass · 8432 expect · env-only fails). organon-studio ×2 (run 1: 1337 pass · 8456 expect · 6 fail; run 2: 1339 pass · 8460 expect · 4 fail). The environmental set (live-AI + Python sidecar) is FLAKY IN COUNT across runs (timeout/timing variance — 4–6 fails) but the **regression tripwire is EMPTY in every run**: 0 strategy/manifest/compile/trial/composed failures. The +24 expect() PR5 delta (studio − organon) holds. Byte-identical trees make the SPRINT behavior deterministic; only the environmental tests vary — the honest picture (the prior session recorded the same instability).

---

## Phase 5 — THE OPERATOR GATE (whole — D23–D38, D27 first) + the honest terminal state

**Presented, NEVER signed (LN5).** `data/honesty/manifest-countersign-package.json` assembles the whole gate for ONE Operator sitting: **D27 FIRST** (the variance amendment, six sprints running, under the generosity statement *"The Stamp is knowingly generous until D27 is signed"*) · D23–D36 carried verbatim · **D37** (the manifest scope) + **D38** (the composite strategy verdict — SPECIFIED, conservative, PARKED) NEW, both `operatorSigned=false`. **IN2** now ends with the FIRST DOGFOODING ACT — the Operator authors a REAL manifest of actual holdings, sets `priorIntent`, compiles, reads the composed facts, registers a real exit criterion, records `decisionAfter`/`changedByCompile` (the strategy memo's question answered with a journal entry at the gate itself). **IN4** (a11y) · **AF4** (paid-key parity) · the publication decision — all OWED-OPERATOR-GATED, never simulated. **The agent presents the whole gate and signs nothing** (LN5); D38's composite verdict is NOT agent-installed (a verdict-shaped rule needs the pen — the D27/D29/D30/D35 precedent).

**Still PARKED (each by name):** the composite verdict (D38) · the proposer + ONC + PBO/CSCV + K-activation (the ≥ 20–50-trials/family trigger + D33) · the ADVERSARY seat (specified, not built) · monitoring-on-cadence (Sprint 2) · the personal post-mortem (Sprint 3) · valuation/pricing · any marketplace/leaderboard (advice in a costume — rejected permanently).

**The DV1 honest gap (X-HONEST, recorded by name):** the four showcase subjects' LIVE capture + curated-shelf shelving was NOT possible (network offline this session) — NO capture fabricated, the depth census NOT falsified. Closed offline: the selection pinned + the classifier proven to recognize all four. The live capture is a deferred capture-time activity (a one-line `CURATED` addition + a `refresh`), never a fabrication.

### FINAL SESSION MARKER — MANIFEST (both repos)
- **Gate outcome:** the whole gate D23–D38 (D27 first) PRESENTED, UNSIGNED — MANIFEST DELIVERED — **READY-PENDING-OPERATOR** (IN2/IN4/AF4 + the fourteen pens OWED-OPERATOR-GATED; the agent never signs — LN5).
- **The first-manifest journal result:** the instrument SHIPPED + proven (the committed fixture manifest compiles to a Composed Reality Check; a real manifest of the Operator's holdings + its journal entry is IN2, the Operator's own hand).
- **Trial count:** the committed fixture lineage carries 3 hash-chained trials (recorded, never counted — `familyN===1` holds; counting awaits the trigger + D33).
- **D27 status:** STILL FIRST (six sprints running); UNSIGNED.
- **Skip set:** {ask_live, eval_live} + the environmental set (X-DETERM Ask-differential · λ-SWEEP · pooled-noise · sidecar-attest = Python sidecar hangs; ASK-TRUE ×2 = live GROQ key — all pass keys-emptied / with the sidecar set up).
- **Terminal `PINS_SHA`:** `98a44bd8970c96cc78a377f11ae7a6b779fd2cb8e7c2672093b4c404b53db084` (carried Domain `2b1dd373…`).
- **Battery:** 1337 pass / 6 fail (environmental, 0 from-sprint) across 205 files; organon 8432 / studio 8456 expect() (+24 PR5); 8 new strategy files 60/311 byte-identical both repos.
- **ITEMIZED reconciliation:** frozen seven + verdict-path 7 + frozen-core 2 byte-untouched · differential lending `70c7912f` + funding `0a63151b` byte-identical · evidence bundle `9c1e7bd8` byte-identical · kill-criterion `8b4e094b` untouched · `familyN===1` (re-proven with trials) · S36 byte-identical (realityBody extraction) · deps `hono`+`zod` · screens 3 · trees byte-identical `3908cf2d` · the composite verdict parked (D38) · the substrate's SECOND CALLER changed ZERO statistics.
- **Commits (UNPUSHED — publication Operator-gated):** organon `5a561406` · organon-studio `52ddb2a`.
- **Pre-sprint F-fixes:** the prior-session F-1..F-4 studio-console security fixes remain UNCOMMITTED in both repos (never authorized; disjoint from this sprint) — pending the Operator's commit decision.

**DEFINITION OF DONE — MET (modulo the two honest gaps, named): the falsification engine given its docket by the smallest honest means — `Strategy` a declarative subject the user authors and the existing engine judges; compile a pure composition (the correlation substrate's long-owed SECOND CALLER, the statistics changed by exactly nothing); every compile a hash-chained trial recorded + provably never counted; the exit discipline exported as a content-hashed criterion that cannot move in silence; the dogfooding instrument shipped (answered at IN2 by the Operator's own hand); every Domain finding closed (DV1's live capture a named offline gap); the composite verdict PARKED (D38); S1–S73 red-team clean; two clean runs both repos; not over-built into an advisor, a counter, a composite pill, a server, or a chatbot. The first line of the handoff: the instrument the dogfooding milestone waited for is BUILT and PROVEN — the invites wait only on the Operator's hands (IN2/IN4/AF4 + the pens, D27 first).**

---

## PUBLICATION — the pivot pushed to the new repo `studio-organon`

**Pushed (2026-07-13, Operator-authorized):** the whole pivot codebase → **`git@github.com:ibabarhashmi/studio-organon.git`**, branch **`staging`** (a `[new branch]`, the new repo was empty). All **41 commits** — the full consumer Reality-Check pivot including the Manifest layer — tip `52ddb2ac2b1beb3dc4467b90191e99d2e5dc027f` (byte-identical tree `3908cf2d…` with organon `5a561406`).

- **Attribution:** authored `BABAR HASHMI` throughout — **NO AI attribution** (no `Co-Authored-By` trailer, no git contributor, no "Built with Claude Code"). No new commit was created for the push, so nothing was attributed.
- **Scope:** the whole branch. The prior-session **F-1..F-4 studio-console security fixes were NOT included** (not required for the pivot to build or push; they remain uncommitted locally in both `organon`/`organon-studio`).
- **Isolation:** pushed to **`studio-organon` ONLY** (added as a distinct `studio` remote). `origin` (`organon-studio.git`) and the `organon` repo's remotes were **NOT** pushed to — the pivot work lands on this new repo only, as directed.
- **Verified:** `git ls-remote studio` → `refs/heads/staging` + `HEAD` both `52ddb2ac…` = local HEAD.
