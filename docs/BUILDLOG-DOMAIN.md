# BUILDLOG — THE DOMAIN SPRINT (X-DOMAIN + X-BACKTEST)

> **Git-tracked, the single source of truth** (this sprint elevates the BUILDLOG to a committed artifact — CV2/CV3). The
> durable record is also `data/honesty/domain-pins.json` (hash-locked) + `data/honesty/domain-redteam.json` + the committed
> tests. Point the moat at the four DeFi domains most likely to break it — SYNTHETIC STABLES · LST/LRT · LOOPED/CDP · RWA —
> render each as a SUBJECT TYPE through the conscious 3 (no fourth screen), give each the ONE catch the seven axes cannot
> see (info/context this sprint), refuse to bless RWA (the structural cap parked for the pen), then FIRE the complete
> unmodified engine at real historical collapses and report every hit, MISS, and gap — the misses louder than the hits.

**Header (start state):** continues the COMPLETE Coverage sprint (battery **1225 pass / 2 skip / 0 fail across 188 files /
1227 tests**, two clean runs BOTH repos; `PINS_SHA cc08a77b…` carrying Redesign `6b285eba…` → GroundTruth `3d0ef3bb…`).
Trees **pushed** to `terminal/v0.2` + `studio/sandbox` (byte-identical git tree `e8b9303e`). The scorecard differential
(lending `70c7912f…` + funding NO-GO `0a63151b…`) byte-stable through **nineteen** sprints; evidence bundle `9c1e7bd8…`
byte-identical (NO verdict has moved since Alpha); kill-criterion `8b4e094b` untouched; mass path `hono`+`zod`; screens the
conscious 3. **The chain is now validated end-to-end including Redesign** (Coverage caught + fixed the latent Redesign
W-CV01 claims/battery-summary defect — the unvalidated-sprint gap is CLOSED). Deviations **D1–D33 with D23–D33 unsigned**
(eleven pens; **D27 the variance amendment STILL first** — *"The Stamp is knowingly generous until D27 is signed"*); this
sprint reserves **D34/D35/D36** (also unsigned — LN5). **Carried record-discipline findings (Coverage validation):** CV1
the PR5 per-repo expect() wall (absent from the Coverage log — restored, recorded every phase); CV2 the per-phase SESSION
MARKERs; CV3 the evidentiary depth (SHOW the controls' outputs, don't assert them); CV4 the 99.95% census (qualify it +
replace with the honest **depth census**); CV5 the W-CV itemization + the gate updated for the pushed trees.

**Dual-repo discipline:** the tracked trees are byte-identical (`e8b9303e`); the PR5 `expect()` delta (organon 7705 /
studio 7729 = +24, stable through four terminals) is *runtime* expect() executions driven by **gitignored per-repo live
captures** (the static grep is 4981 in both). Port = `git format-patch | git am` (byte-identical trees preserved); the
runtime delta is measured fresh at each gate from bun's summary line. Commits authored BABAR HASHMI, **no AI attribution**.

---

## Phase 0 — PINS-LOCKED ✅ (both repos; nothing built; **the backtest subjects pinned before any data is seen**)

- **Engineer.** No product code. `script/honesty/domain-pins.ts` → `data/honesty/domain-pins.json`. **DOMAIN PINS_SHA
  `2b1dd373…`** carried Coverage `cc08a77b…`. Pinned VERBATIM (a summarization is a detectable Halt): the `DomainType`
  enum (`LENDING · FUNDING · STABLE-SYNTH · LST-LRT · LOOPED-CDP · RWA · UNCLASSIFIED`); the conservative classifier
  signatures + allowlists + the **no-optimistic-default UNCLASSIFIED rule**; the four catch-axis grammar forms; the
  per-domain axis registry + the no-leakage rule; the **RWA structural-cap spec + the agent-may-not-install clause**; the
  X-BACKTEST discipline (the MISS-is-most-valuable rule, the zero-miss-is-suspicious rule, the both-directions claim
  wording); the depth-census spec (CV4); CV1–CV5; D34/D35/D36 reserved (Operator-signed=false); S1–S70.
- **The pinned collapse subject set (X-BACKTEST a) — HASH-PINNED `628738af…` BEFORE Phase 4 fetches a byte**, one per
  domain, each chosen because its MECHANISM matches the domain's catch axis (not because it flatters the engine):
  | id | domain | subject | height | mechanism-match | a-priori reach |
  |---|---|---|---|---|---|
  | B1 | LST-LRT | stETH June-2022 redemption-gap depeg (Lido `0xae7ab9…`, Curve `0xdc2431…`) | 14975000 | redemption ~1.0 but LOCKED vs Curve secondary ~0.94 — the depeg lived in the gap | **LIKELY GAP** (2022 beyond free archive) |
  | B2 | STABLE-SYNTH | perp-funding-carry flip (dYdX v4 indexer, real history, BTC-USD) | n/a (series) | the funding-flip census: a "savings rate" that is short-vol carry inverts when funding flips | **REACHABLE** (free keyless indexer) |
  | B3 | LOOPED-CDP | looped stETH/ETH liquidation cascade (Aave v2 `0x7d2768…`) | 14975000 | ~8× levered; the % stETH move to liquidation decided the outcome, not the loop APY | **LIKELY GAP** (2022) |
  | B4 | RWA | Maple/Orthogonal credit default Dec-2022 (`0xff9a51…` best-effort) | 16180000 | the collapse was INVISIBLE on-chain — a clean scorecard is not evidence of safety; the argument FOR D35 | **LIKELY GAP + addr best-effort** |
  The a-priori reach is pinned **honestly**: deep-2022 on-chain heights are EXPECTED to be HONEST GAPS on the free rotation;
  the dYdX-indexer capture is reachable. A backtest dominated by gaps is an honest outcome (X-BACKTEST e), never buried.
- **Validate.** `test/organon/domain_pins.test.ts` → **11 pass / 0 fail / 105 expect()**. Self-consistent (a moved pin
  moves the sha — the enum-mutation positive control fires); carried `cc08a77b`; the subject-set hash matches + a seeded
  post-hoc height swap moves it (SHOWN — the anti-rig wall); the RWA agent-may-not-install clause; the both-directions
  claim wording; the depth-census qualifying sentence; CV1–CV5; S1–S70. Wired into `organon-studio-test.sh`.
- **Red-team (Phase 0 controls, SHOWN — CV3).** A subject set without rationale → refused (every subject asserts
  `mechanismMatch.length > 80`). A cap spec an agent could install → refused (the `agent-may-not-install` clause asserted).
  A post-hoc subject swap → refused (`sha256(swapped) !== subjectSetHash`, the seeded `height=99999999` control fires). A
  classifier with an optimistic default → refused (`unclassifiedRule` asserts "NO optimistic default").

**SESSION MARKER — PINS-LOCKED.** terminal `PINS_SHA 2b1dd373…` (carried `cc08a77b…`) · organon **+1 file** (domain_pins)
· **battery 1236 pass / 2 skip / 0 fail across 189 files / 1238 tests / 7810 expect()** (measured; baseline 1225 + 11
domain_pins tests; expect 7705 → 7810 = +105) · evidence bundle `9c1e7bd8…` reproduces byte-identical, frozen seven
git-clean · subject-set hash `628738af…` pinned before any capture. **Studio port batched at sprint close** (the proven
Coverage cadence — build in organon through the phases, `format-patch | git am` to studio at convergence, both trees
byte-identical). **CV1 restored at convergence:** `dual-repo-divergence.json` is re-recorded with BOTH trees' fresh runtime
`expect()` counts (the record Coverage let slip) — the delta stated, both 0-fail.

---

## Phase 1 — FINDINGS-CLOSED + RECORD-RESTORED ✅ (CV1–CV5; the discipline comes back)

- **Engineer.** (CV4) **the DEPTH CENSUS** — `script/capture/depth-census.ts` → `data/honesty/depth-census.json`, an
  OUTCOME computed over COMMITTED, clone-reproducible artifacts (the coverage census, the governance census, the contract
  registry, the shelf registry) — NO network, NO gitignored capture, so it re-hashes on a fresh clone. It replaces the
  rhetorically dangerous "15490 of 15497 covered" (99.95%) with the honest per-axis reality. (CV5) the countersign package
  refreshed — `data/honesty/domain-countersign-package.json` (supersedes coverage's — U-RESUPERSEDE): **D23–D36, D27
  FIRST**, D34/D35/D36 new (Operator-signed=false), the stale "push decision" RETIRED (the trees are ALREADY pushed → the
  publication call is what remains), the **Redesign sprint ledgered VALIDATED**. (CV1/CV2/CV3) the record-discipline
  standards pinned in domain-pins + enforced by this log's SESSION MARKERs + its SHOWN control outputs.
- **The depth census — SHOWN (CV3):**
  ```
  yield-reality (breadth)  : 15490 / 15497  (yield ONLY — REAL-at-timestamp)   ← the "covered" number, qualified
  tvl-trend                :     7 / 7       (curated shelf; per-subject 30d /chart)
  peg (conditional)        :     7 / 7       (stablecoin leg)
  liquidity-depth (cond.)  :     1 / 7       (DEX pool — only the Curve stable-LP has a gtKey)
  contract (REAL★)         :     4 / 7       (verified build — aave USDC/USDT/DAI + compound USDC; NOT an audit)
  governance (REAL★)       :     5 / 5       (resolved admin; 1 gated TIMELOCK, 4 UNRESOLVED)
  domain-catch (info/ctx)  :     0 / 7       (lookup + fixtures — no curated-shelf subject is a new domain)
  ```
  The honest, stark gap: **yield renders across 15490; a COMPLETE Reality Check reaches 4 of 7 curated pools.** The 99.95%
  number is never bare — the qualifying sentence rides beside it (pinned VERBATIM in domain-pins), and the coverage census's
  own `coveredDefinition` already says "a REAL aggregator yield exists … SAMPLE-only does NOT count."
- **Validate.** `test/organon/findings_closed_domain.test.ts` → **6 pass / 0 fail / 45 expect()**. The depth census
  self-hashes + RECOMPUTES from the live contract registry (a seeded `contract.renderable = 9999` inflation → the hash
  moves + diverges from the recompute — SHOWN); the qualifying sentence rides the breadth number (a bare "99.95%" fails);
  the package order (D27 first) + D34/D35/D36 unsigned + the retired push item; the Redesign VALIDATED ledger entry.
- **Red-team (Phase 1 controls, SHOWN — CV3).** A seeded axis-count inflation → the recompute diverges (the census cannot
  be gamed). A bare unqualified coverage number → refused (the qualifying sentence is asserted beside it). An agent-signed
  gate → refused (`operatorSignedWhole === false`, LN5). A stale "push decision" → refused (the publication item asserts the
  trees are already pushed — CV5).

**SESSION MARKER — FINDINGS-CLOSED.** terminal `PINS_SHA 2b1dd373…` · organon **+1 file** (findings_closed_domain) ·
**battery 1242 pass / 2 skip / 0 fail across 190 files / 1244 tests / 7855 expect()** (Phase-0 1236 + 6; expect 7810 →
7855 = +45) · evidence bundle `9c1e7bd8…` byte-identical, frozen seven git-clean · **depth census `532e1890…`** replaces
the 99.95% headline. Studio port batched at close; the PR5 wall re-recorded at convergence.

---

## Phase 2 — DOMAIN-TYPED ✅ (the model, the classifier, the wiring — S67)

- **Engineer.** `src/domain/`: `types.ts` (the pinned `DomainType` enum + `NewDomain` + the `CatchAxis` type + `DomainFacts`);
  `classify.ts` — `classifyDomain(facts)`, deterministic + CONSERVATIVE (the `classifyAdmin` precedent): exactly-one-signature
  → that domain; multi-match → UNCLASSIFIED (ambiguous, never a guess); no-match → the carried vertical (LENDING/FUNDING) or
  UNCLASSIFIED; **no optimistic default**; `registry.ts` — the per-domain axis map + the `assertAxisForDomain` no-leakage guard.
  `src/dataplane/providers/dydx.ts` — the free keyless dYdX v4 indexer (STABLE's SECOND funding venue ONLY; REAL-at-timestamp
  tier, honest-degrade-to-null; the general cross-venue expansion stays PARKED). **Wiring:** `Reality.domainOf(name, facts)`
  classifies any subject (curated or looked-up) identically; `renderRealityCheck` gains a `domain?` param → a **label, not a
  section** — `""` for every carried subject + UNCLASSIFIED → **byte-identical** to the pre-Domain render; the `/check` route
  classifies + passes it. **Ratification:** `src/domain` + `src/domain/axes` added to `Ratify.SCANNED_DIRS` (the constitution's
  rule against escaping the ADOPT requirement by being invisible) + a `defi-domain-typing` ADOPT row filed (research finding =
  the four DeFi failure modes; `research_ratified.test.ts` green, the four axes pre-listed for Phase 3).
- **Validate — outputs SHOWN (CV3).** `domain_classify.test.ts` (7) + `domain_registry.test.ts` (4) + `dydx.test.ts` (4):
  - ethena USDe → **STABLE-SYNTH** (yield-source) · lido stETH → **LST-LRT** (redemption-gap) · gearbox → **LOOPED-CDP**
    (leverage-distance) · ondo USDY → **RWA** (off-chain-opacity) — each `how` string quoted.
  - **NO OPTIMISTIC DEFAULT:** aave/compound/spark/fluid USDC (isStablecoin=true) → **LENDING**, zero new-domain signatures
    (a lending stablecoin is never up-classified to STABLE-SYNTH).
  - **the AMBIGUOUS control:** `ethena stETH hybrid` matches BOTH STABLE-SYNTH + LST-LRT → **UNCLASSIFIED** ("AMBIGUOUS —
    matched multiple domain signatures (STABLE-SYNTH, LST-LRT); … a wrong lens is a wrong answer" — SHOWN).
  - **the NO-LEAKAGE control:** `assertAxisForDomain("leverage-distance", "STABLE-SYNTH")` → REFUSED ("CROSS-DOMAIN AXIS
    LEAKAGE REFUSED — the "leverage-distance" axis renders ONLY for LOOPED-CDP, never for STABLE-SYNTH" — SHOWN).
  - **byte-identity:** the SAME facts render byte-identical under `undefined`/`LENDING`/`UNCLASSIFIED`; a new domain adds ONLY
    the `<span class="badge REAL">STABLE-SYNTH</span>` label (the label is the sole delta — no fourth screen, X-DOMAIN a).
- **Red-team (Phase 2 controls, SHOWN).** A guessed novel subject → UNCLASSIFIED (no optimistic default). A cross-domain
  render → REFUSED. The dYdX venue unreachable/empty → honest null (never a fabricated series). The domain layer invisible to
  the ratify wall → REFUSED (added to SCANNED_DIRS + ADOPT filed, `unratifiedArtifacts` empty).

**SESSION MARKER — TYPED-HONESTLY.** terminal `PINS_SHA 2b1dd373…` · organon **+3 files** (domain_classify, domain_registry,
dydx) + `src/domain/{types,classify,registry}.ts` + `src/dataplane/providers/dydx.ts` · **battery 1257 pass / 2 skip / 0
fail across 193 files / 1259 tests / 7935 expect()** (Phase-1 1242 + 15; expect 7855 → 7935 = +80) · evidence bundle
`9c1e7bd8…` byte-identical, frozen seven git-clean, S36 held (the badge is `""` for every curated subject) · differential
lending `70c7912f` / funding `0a63151b` byte-stable · `defi-domain-typing` ADOPT filed. Per-domain subject census: the
curated shelf is 6× LENDING + 1× LENDING (Curve stable-LP) + 2× FUNDING = **0 new-domain subjects** (the four domains render
through the lookup path + fixtures — the depth census's `domain-catch: 0/7` is the honest count). Studio port batched at close.

---

## Phase 3 — CATCHES-RENDERED ✅ (the four axes; the RWA warning; the cap parked — S69)

- **Engineer.** `src/domain/axes/` — four pure, deterministic, number-traced, INFO/CONTEXT catch axes in the pinned grammar:
  **yield-source.ts** (STABLE-SYNTH) — `attributeYield` + `fundingFlipCensus` (negative in N of M, Hyperliquid + dYdX) + the
  JOINT peg (a funding-sourced stable's peg + yield are ONE risk); no history → INSUFFICIENT. **redemption-gap.ts** (LST-LRT)
  — peg = market ÷ redemption; the gap % + the exit reality; a missing leg → INSUFFICIENT. **leverage-distance.ts**
  (LOOPED-CDP) — effective leverage + the % move to liquidation + the health factor; no equity → INSUFFICIENT.
  **offchain-opacity.ts** (RWA) — the warning + the SAMPLE-labeled attestation surface + `rwaStructuralCap` (D35, BUILT +
  census-pre-computed, NOT INSTALLED — the render calls it with `d35Signed=false`; SOLID→CAUTION proven under simulation
  only). **Render:** `renderRealityCheck` gains a `catchFact?` param → the catch block (governance-line grammar, "it does NOT
  move the verdict above") — `undefined` → `""` → byte-identical; `Reality.catchFor` assembles the live catch; the `/check`
  route passes it. **D35/D36 parked:** `data/honesty/domain-promotions.json` — the RWA cap + three degrade-only promotions,
  affected censuses ALL ZERO (arms-for-a-future-subject, the D29/D30 pattern).
- **Validate — outputs SHOWN (CV3).** `catch_axes.test.ts` (6) + `rwa_cap.test.ts` (5). Grammar lines quoted from real inputs:
  *"Yield source: perp-funding carry (not lending interest) — … negative in 9 of the last 30 periods; when it flips, this
  yield inverts and the peg takes the strain … scored JOINTLY …"* · *"Redemption 1.0412 ETH; market 1.0298 ETH — a 1.09% gap
  (peg 0.9891). Exit at par needs the queue; exit now takes the pool price."* · *"Headline 30.2% APY is 5× levered — a 11.1%
  collateral move liquidates you (health factor 1.13)."* · *"This yield's collateral settles off-chain. Nothing on-chain can
  verify it. We cannot see the thing that matters …"*
- **S69 — the RWA cap, both directions SHOWN.** Under the SIMULATION (`d35Signed=true`) the seeded PERFECT-ON-CHAIN control
  (on-chain SOLID) → **CAUTION** (it CANNOT render SOLID). TODAY (`d35Signed=false`) the verdict is **UNCHANGED (SOLID)** + the
  warning renders + the attestation is SAMPLE-labeled — the cap is **NOT installed** (an agent installs no verdict rule, LN5).
  Provably not agent-installed: `scorecard.ts`/`explain.ts`/`pool.ts`/`stamp.ts` reference the cap ZERO times (grep empty);
  `reality.ts` never calls `rwaStructuralCap(…, true)`; the rendered verdict pill is the seven-axis verdict, unchanged.
- **Red-team (Phase 3 controls, SHOWN).** A cross-domain catch → the axis stamps its own domain. An "advice" phrasing → refused
  (no "you should buy/sell"). A faked number on a missing read → INSUFFICIENT. An RWA SOLID → the warning renders + the cap is
  disclosed-not-installed (the pen's act).

**SESSION MARKER — CAUGHT-AND-CAPPED-HONESTLY.** terminal `PINS_SHA 2b1dd373…` · organon **+2 files** (catch_axes, rwa_cap)
+ `src/domain/axes/{yield-source,redemption-gap,leverage-distance,offchain-opacity}.ts` + `domain-promotions.json` · **battery
1268 pass / 2 skip / 0 fail across 195 files / 1270 tests / 8015 expect()** (Phase-2 1257 + 11; expect 7935 → 8015 = +80) ·
evidence bundle `9c1e7bd8…` byte-identical, frozen seven git-clean, S36 held (the catch block is `""` for carried subjects) ·
differential `70c7912f`/`0a63151b` byte-stable · the four axes ADOPT-covered (research_ratified green) · D35/D36 parked,
censuses all ZERO. Studio port batched at close.

---

## Phase 4 — MOAT-UNDER-FIRE ✅ (the backtest; the hits, the misses, the gaps — S68/S70)

- **Engineer.** `script/capture/collapse-backtest.ts` — for each pinned subject at its pinned height: capture the pre-collapse
  state over the free archive rotation (tri-endpoint), content-hash it, run the domain catch axis + the UNMODIFIED engine over
  it, record HIT / MISS / GAP. **The engine was FROZEN before the harness fired** (committed at `31cb10c5`; `git diff -- src/`
  empty at start AND end — the read-only discipline, X-BACKTEST c). The results land in `data/honesty/backtest/` and render on
  `/postmortems` (the misses as prominent as the hits).
- **THE SCORELINE — 2 HITS · 2 MISSES (reported) · 1 GAP** (`zeroMissZeroGapSuspicion: false` — not a rigged confirm-only run):
  | id | domain | outcome | evidence (SHOWN) |
  |---|---|---|---|
  | B1 | LST-LRT | **HIT** | stETH June-2022 at block 14975000 — par 1.0 ETH (inaccessible; withdrawals LOCKED) vs Curve market **0.9429** → a real **5.71% gap**; tri-endpoint agreed (drpc/mevblocker/blastapi). The redemption-gap axis rendered the depeg on REAL pre-collapse chain state. |
  | B2 | STABLE-SYNTH | **HIT** | dYdX v4 indexer BTC-USD — funding negative in **508 of 1000** periods (50.8%). The yield-source funding-flip census fired on REAL history: a "savings rate" that is short-vol carry would have inverted in those windows. |
  | B3 | LOOPED-CDP | **GAP** | the Aave v2 loop surface — the leverage-distance axis is position-scoped (needs a borrower's collateral/debt); the bounded harness (pinned surface, three reads) does not resolve a specific loop → an HONEST LIMITATION, recorded by name, never a faked leverage. |
  | B4 | RWA | **MISS** | Maple/Orthogonal — the on-chain state looked solvent while the loan defaulted **off-chain** (~$36M). The engine sees NOTHING adverse → it would NOT have flagged → **the argument FOR the D35 structural cap**: for RWA a clean on-chain scorecard is not evidence of safety. |
  | SEED-MISS | RWA | **MISS** | the seeded perfect-on-chain RWA control (on-chain SOLID) — surfaces as a MISS by name (the MISS-reporting wall bites); a signed D35 would cap it SOLID→CAUTION. |
  The claim, worded to the evidence in BOTH directions: *"the unmodified engine would have flagged 2 of 3 reachable pinned
  collapses, missed 2 (incl. the seeded control + the RWA off-chain default), and could not reach 1."*
- **W-DM01 (fix-on-the-go, X-BACKTEST d — a CONSCIOUS, DISCLOSED change to the HARNESS, not the engine).** The FIRST harness
  run produced a **fabricated 100% gap** for B1 — worse than a miss. Root cause: TWO bugs in the harness's data collection
  (not the engine): (1) the inline `get_dy` calldata miscounted zeros → a misaligned `dx` → a near-zero garbage read; (2) I
  compared mismatched units (wstETH→stETH `1.075` vs stETH→ETH). FIX: a proper ABI encoder + the correct read — redemption =
  stETH par `1.0` (the rebasing invariant; par was inaccessible because withdrawals were locked), secondary = the real Curve
  `get_dy` = `0.9429` → a real **5.71% gap** that MATCHES the documented June-2022 depeg (tri-endpoint cross-checked). The fix
  was to `script/` (the measurement instrument); `src/` (the engine) stayed byte-frozen throughout (`git diff -- src/` empty).
  The whole harness was re-run; the result is the true historical value, not fitted to a hit — a fabricated hit is the worst
  possible output, and catching + correcting it is the backtest's honesty made internal.
- **Validate — outputs SHOWN (CV3).** `backtest.test.ts` (8): every capture re-hashes + names its endpoints/height; the
  read-only guard (start AND end empty); the subject-set pin-hash matches Phase 0 (no post-hoc swap); **the MISS-reported wall**
  (SEED-MISS surfaces as a MISS in the artifact AND the summary, root-caused); the both-directions claim wording; the
  zero-miss-zero-gap suspicion flag logic; the two HITs are real captures; the RWA MISS is the argument for D35.
- **Red-team (Phase 4 controls, SHOWN).** A subject swapped after results → the pin-hash fails. A miss softened → the binary
  wall fails. A simulated height → the tri-endpoint re-verification fails (the reads re-hash). The engine touched mid-run →
  the read-only guard fails (proven: `src/` frozen at `31cb10c5`). A fabricated 100% HIT → CAUGHT (W-DM01) + corrected to truth.

**SESSION MARKER — FIRED-AND-REPORTED.** terminal `PINS_SHA 2b1dd373…` · organon **+1 file** (backtest) +
`collapse-backtest.ts` + `data/honesty/backtest/{B1..B4,SEED-MISS,summary}.json` · **battery 1276 pass / 2 skip / 0 fail
across 196 files / 1278 tests / 8066 expect()** (Phase-3 1268 + 8; expect 8015 → 8066 = +51) · **backtest scoreline: 2 hits /
2 misses / 1 gap** (B1 stETH 5.71% depeg · B2 dYdX 50.8% negative funding · B3 loop GAP · B4 + SEED RWA MISSES) · evidence
bundle `9c1e7bd8…` byte-identical, frozen seven git-clean, `git diff -- src/` empty (engine frozen through the replay) ·
differential byte-stable. Studio port batched at close.
