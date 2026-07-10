# PINS — THE HONESTY LAYER (`PINS.md`)

**Everything the sprint is judged against, pinned before anything is built toward it.** Hash-locked: a changed pin is a changed sha is a conscious re-pin (never a silent drift). The machine-readable source of truth is `data/honesty/phase0-pins.json`; this file renders it for humans.

- **Blueprint** `sprint/sprint-result/ORGANON-Honesty_Layer_Sprint_Blueprint.md` — sha `f8f5c3587d27b819effbbd65793156e26ef9e895bf8f287379b674a23416ea36` (gitignored planning doc; the pin is durable)
- **PINS_SHA** `8a57e6f196ff7718a4bbfd9eb58c6ffa5f48e349a7ed837d54c853038910a1ce` (the canonical pins object; re-pinned in PART E from `ffeb78830d5b…` — finding W-E01: UNVERIFIED dominates AVOID on unverifiable data, the firewall/S7)
- **Verdict-differential baseline** — lending fingerprint-set sha `70c7912f0b16a796ea585ab7e508af542f1f83d05110143c8575bab226a3bf54` (the existing golden, reproduced) · funding (bybit·8h·receive, illustrative, clone-robust) **NO-GO** reproHash `0a63151b…`

---

## THE REALITY DOCTRINE (the whole product)

The tool answers ONE question about a real strategy: **is this yield real, and what could kill it?** The answer is a **machine-derived scorecard** built from the fact table `explain.ts` already produces — reused verbatim, never re-invented (X-KEEP). The verdict badge and its one-line summary are **derived from the rows, never hand-written**; `UNVERIFIED` renders as an honest "we can't confirm this," never a disguised pass. This is not a builder — the user **checks**, they do not compose.

## THE FACT-ROW SCHEMA (reused from `Explain.FACT_ROW_SCHEMA`)

`id · name · value · threshold · comparator · outcome · contribution · provenanceRef`

The scorecard produces **axis rows** carrying a richer `tier ∈ {pass, caution, fail, unverified}`, which **map onto** the existing schema (pass→pass, caution/fail→fail, unverified→n/a) so the existing dual-register + consistency + groundedness machinery applies unchanged. `explain.ts` is byte-untouched.

## THE FOUR AXES (exact thresholds)

| Axis | Metric | Rule |
|---|---|---|
| **Yield-reality** (flagship) | `baseShare = apyBase / (apyBase + apyReward)` | `≥ 0.5` **durable/pass** · `< 0.2` **mercenary/fail** (>80% emissions) · between **reward-leaning/caution** |
| **TVL trend** | `tvlSlope30d = (tvl_now − tvl_30d_ago)/tvl_30d_ago` | `≥ −0.10` **stable/pass** · `< −0.35` **collapse/fail** · between **outflowing/caution** |
| **Peg / stability** | `pegDev = \|price − 1.0\|` | `≤ 0.005` **on-peg/pass** · `> 0.02` **depeg/fail** · between **wobble/caution** · non-stable → **info** |
| **Funding regime** (Phase 5) | `band = [p10, p90]` of annualized funding | `p10>0` **carry-positive/pass** · `p10≤0≤p90` **regime-dependent/caution** · `p90<0` **carry-negative/fail** — a **band, never a hero APY** |

A row is **uncomputable → `unverified`** when its input is null / `SAMPLE` / short-history (no-history pool). Point-in-time rows still compute when history-dependent rows cannot.

## THE VERDICT DERIVATION (machine-derived; precedence, unambiguous)

1. `reality==SAMPLE` **OR** the flagship axis uncomputable **OR** > half the material axes uncomputable → **UNVERIFIED** (**dominates** — no definitive verdict on unverifiable data; a SAMPLE "fail" is not a verified fail; the firewall/S7)
2. else any material axis `fail` (REAL data) → **AVOID** (names the failing axes)
3. else any material axis `caution` **OR** any non-flagship material axis uncomputable → **CAUTION** (names cautions + partial gaps; not SOLID)
4. else (all material axes pass, data `REAL`) → **SOLID**

**Worked example.** `aave-usdc`-shaped: `apyBase 3.1 · apyReward 0.4` → baseShare `0.886 ≥ 0.5` **PASS**; `tvlSlope30d +0.05 ≥ −0.10` **PASS**; `pegDev 0.001 ≤ 0.005` **PASS**; REAL → **SOLID**. Counter: a 95%-emissions pool (`apyBase 0.5 · apyReward 9.5`) → baseShare `0.05 < 0.2` **FAIL** → **AVOID**, naming yield-reality.

## THE REAL DATA (keyless-first; REAL or SAMPLE, never a lie)

- **DeFiLlama** (keyless) — `/pools` (apy·apyBase·apyReward·tvlUsd), `/chart/{pool}` (TVL trend), `/stablecoinprices` (peg), unlocks → yield-reality · TVL · peg · Shelf.
- **Hyperliquid** (keyless) — `fundingHistory`, `candleSnapshot` → funding regime (Phase 5).
- **GeckoTerminal** (keyless) — pool liquidity/volume → liquidity context.
- **REAL** = fetched this session AND appended to the provenance record `{source·asOf·contentHash}` — a value shown but not recorded is a **HALT**. **SAMPLE** = a labeled placeholder; every SAMPLE value drives its axis to UNVERIFIED. A dead endpoint / 429 / malformed response degrades to last-good or SAMPLE — **never a crash, never a fabricated value.**
- **Wiring order:** DeFiLlama (backbone) → Hyperliquid (funding) → GeckoTerminal (liquidity).

## THE TWO SCREENS (frozen at 2; a third is a Halt)

1. **THE SHELF** — Reality Cards (name · headline APY with a REAL-yield split bar · risk word · verdict pill · REAL/SAMPLE badge); filters category/chain/risk; sortable.
2. **THE REALITY CHECK** — verdict banner + plain one-liner · the honesty scorecard rows · Simple/Pro toggle · trust strip · a confidence band (never a hero APY) · a link into the provenance history (the moat made visible).

**Front-end:** server-rendered HTML (Hono, the repo idiom) + minimal inline JS for the Simple/Pro toggle — **no Vite / SPA / bundler**. PART CLEAN's stated primacy ("no heavy dependency; the cheapest correct thing a stranger can run AND read") overrides the Vite clause in Phase 4; documented in the BuildLog.

**Not built:** no builder · no composition · no fork · no backtest-your-idea · no settings maze · no B2B/API/widget.

## X-LEAN / PART CLEAN — THE BANNED LIST (violating it is a Halt)

A builder canvas / composition / fork · a third consumer screen · a B2B surface / public API / widget · a provider registry / generic axis framework / plugin system · an ORM / a heavy DB / a heavy front-end or state library · an LLM anywhere in a verdict, a risk fact, or an axis · cleverness (metaprogramming / dynamic dispatch / config-driven rule engine) · dead / commented-out code kept "just in case" · any "for scale / future-proof / extensible / enterprise."

## X-PROBE — METRICS + THE KILL CRITERION (falsifiable; hash-locked)

- **Metrics:** reality-check-open-rate · **why-expansion-rate** · seven-day-return-rate.
- **KILL CRITERION:** over a **14-day** window with **≥ 30 genuine (non-team)** Reality-Check sessions, if **why-expansion-rate < 0.15 AND seven-day-return-rate < 0.10**, the honesty thesis is **FALSIFIED** for this audience → STOP and pivot. **Status: ARMED** (instrumented + declared) — not yet evaluable (independence PENDING). Moving a pinned metric Halts.

## THE RED-TEAM / STRESS CATALOG (S1–S10; PART E)

S1 dead endpoint · S2 429 storm · S3 stale cache · S4 no-history pool · S5 mid-session depeg · S6 emissions-inflated trap · S7 SAMPLE-heavy state · S8 malformed/adversarial data · S9 provenance tamper · S10 determinism / no-LLM-in-verdict. Each: RUN → OBSERVE → ROOT-CAUSE → FIX-ON-GO → RE-TEST → LOG. Converge only when the full catalog passes across **two consecutive clean runs**, or record an honest STOP.

---

# THE DEEPENING SPRINT — additional pins (`data/honesty/deepening-pins.json`)

**The next sequential sprint, continuing from RED-TEAM-CLEAN.** Carried forward, never rebuilt — the four original axes and their thresholds are unchanged. The machine-readable source is `data/honesty/deepening-pins.json`; this renders it for humans.

- **Deepening blueprint** `sprint/sprint-result/ORGANON_Deepening_Sprint_Blueprint.md` — sha `7489d5fce7e6c14e731d303170584592bbc11c212454a35c2292a5b30c99d40c`
- **DEEPENING PINS_SHA** `d66f4613e0a4055eb7a1fbc2b3b9b47b58a0eb63b743f4d0b787e531470558b1` — the current authoritative pins object; **carried forward** from `8a57e6f196ff…` (a conscious extension, not a silent drift). The verdict-differential baseline is unchanged: lending `70c7912f…` + funding NO-GO `0a63151b…` reproduce.

## THE THREE NEW DETERMINISTIC AXES (exact thresholds; NO inference)

| Axis | Metric | Rule |
|---|---|---|
| **Liquidity depth** (GeckoTerminal `reserve_in_usd`) | `liqUsd` (USD reserve of the DEX pool) | `≥ $500k` **deep/pass** · `< $50k` **thin/fail** (exit-slippage risk) · between **shallow/caution** |
| **Unlock overhang** (DeFiLlama unlocks) | `unlockPct30d = next-30d unlock / mcap` | `≤ 1%` **benign/pass** · `> 5%` **heavy/fail** · between **moderate/caution** · no schedule → **`not-applicable`** |
| **Counterparty screen** (age · size) | pool age (recorded `/chart` span, days) + pool size (TVL) | `mature (≥365d) AND established (≥$10M)` **pass** · `young (<90d) AND dust (<$1M)` **fail** · otherwise **caution** |

The counterparty axis is a **coarse structural screen (age · size · dependency), NOT a contract audit** — deep contract analysis (the Sentinel IR) is PARKED; dependency is an honest **non-scoring note**. Rendering the screen as "audited/safe/guaranteed" is a doc-lie Halt (F-IDENTITY). *(Superseded below: dependency is SCORED as of Crown-Jewel D5; the deep contract analysis is UN-PARKED in **THE CONTRACT-TRUTH SPRINT** as a deterministic structural sub-axis over verified source — still a screen, never an audit.)*

## THE VERTICAL-APPLICABILITY MATRIX (total — every pair `applies` or `not-applicable`, never undefined)

| Axis | stablecoin-yield | lending | delta-neutral |
|---|---|---|---|
| yield-reality | ✓ | ✓ | n/a |
| tvl-trend | ✓ | ✓ | n/a |
| peg | ✓ | ✓ *(if stable)* | n/a |
| liquidity-depth | ✓ *(central)* | **n/a** *(a lending market's exit ≠ DEX depth)* | n/a |
| unlock-overhang | ✓ *(if reward-token schedule)* | ✓ *(if schedule)* | n/a |
| counterparty | ✓ | ✓ | **n/a** *(perp-venue screen PARKED)* |
| funding-regime | n/a | n/a | ✓ |

`not-applicable` is a **distinct honest state** — never a pass, never counted toward SOLID or toward the UNVERIFIED-dominance count. A pair with no matrix entry is a Halt.

## THE EVIDENCE BUNDLE (`data/honesty/evidence/`; `./organon.sh verify`)

Every headline number is backed by a regenerable artifact; `./organon.sh verify` regenerates the deterministic bundle and **diffs it against the committed copy — a mismatch exits non-zero.** Artifacts: `battery-summary.json` (the count) · `determinism.json` (two identical runs) · `frozen-git-status.json` (the frozen seven git-clean) · `verdict-differential.json` (lending `70c7912f…` + funding NO-GO) · `vlive-{defillama,geckoterminal,hyperliquid}.json` (the keyless HTTP-200 captures) · `claims.json` (the manifest: every cited number → its artifact). A number with no artifact, or a `verify` that does not reproduce, is a **Halt**. On a fresh clone the diff-checked artifacts are environment-independent; the live V-LIVE re-fetch is skipped offline (disclosed).

## THE PERSISTENCE GATES — the opt-in Stamp's two new sub-scores (`data/honesty/persistence-pins.json`, `PINS_SHA 46e40760…`, carried from Crown-Jewel `405ce972…`)

Both are **DETERMINISTIC** (no model in the gate, metric, or split), **OFF THE MASS PATH** (the depositor's Reality Check runs them ZERO times — they are Stamp depth for the quant), and **basis/reason refinements** of the existing GO/NO-GO/INSUFFICIENT verdict — they make a clean GO **HARDER** to earn, never mint a new verdict word, never touch a scorecard axis.

| Sub-score | Definition | Tiers |
|---|---|---|
| **Decay half-life** (X-DECAY) | `edge(k) = lag-k autocorrelation` of the recorded return series, fit to `edge₀·exp(-k/τ)` (the textbook AR(1) ACF decay); half-life `t½ = τ·ln2` over lags `[1,2,3,5,10]` | `≥ 5` periods **TRACEABLE** · `< 5` **SHORT_LIVED** (a clean GO withheld) · `< 30` obs / degenerate / SAMPLE **INSUFFICIENT** |
| **ICIR consistency** (X-ICIR) | `mean/std` of the recorded periodic edges — a **within-strategy temporal** steadiness ratio, shown beside the deflated-Sharpe | `≥ 0.1` **CONSISTENT** · `< 0.1` **LUMPY** (a clean GO tempered) · `< 20` periods / std→0 / SAMPLE **INSUFFICIENT** |

**Honest scope (pinned + surfaced).** The decay gate measures the **serial persistence** of the recorded signal (a traceable time-structure vs. fee-chasing noise), NOT the average carry (the carry is the yield-reality axis's job on the mass path). The ICIR is a **within-strategy temporal-consistency** measure over this strategy's own recorded periods — **EXPLICITLY NOT** the cross-sectional factor-ranking IC/ICIR of the literature (which ranks a universe of assets). The tool scores one strategy's yield reality + (opt-in) its statistical track record; it does **not** mine cross-sectional factor alpha. The LLM strategy-**proposer** / iterate-to-generate loop stays **PARKED** (a different product for a non-wedge user). A fabricated half-life, an ICIR dressed as cross-sectional alpha, either sub-score on the mass path or as a scorecard axis, or a built generate-loop is a **Halt**.

**The rare GO, honestly (V5).** A Stamp **GO (conditional)** means the recorded track record **survives the anti-PBO deflation** — its deflated significance clears the 0.95 bar at the honest declared-trial count. It is **conditional** because it is a **post-hoc** read (measured after the fact, not pre-registered), so a *clean* GO is fenced — conditional on independent data verification. A GO is a floor on doubt about the track record's statistical robustness — **NOT a safety verdict, and NOT the scorecard's SOLID.** A GO stays **narrow**: a clean GO now also needs a **traceable edge half-life** AND acceptable **consistency (ICIR)** — three independent hurdles, so the rare GO is *harder* to earn cleanly, never easier.

**The live-value ceiling (V6).** The capture-manifest **hashes** reproduce (the committed capture is the durable record); the underlying live values are **re-capturable, not frozen** — a re-fetch is network-gated + disclosed. No reader should over-read "the live numbers reproduce forever."

## THE DEVIATIONS LEDGER (`data/honesty/deviations.json`; surfaced verbatim in the handoff)

**D1** RWA verdict PIN retained (X-KEEP + A′#7) · **D2** server-rendered Hono over the "Vite" clause (PART CLEAN) · **D3** GeckoTerminal wired (X-COVER) · **D4/D6** the keyless unlock source is paywalled (HTTP 402) → the Operator-signed scope-cut (the axis stays ARMED + positive-controlled, never scraped/faked) · **D5** dependency **SCORED** into the counterparty screen (age · size · dependency) · **D7** the screen set consciously **2→3** (Shelf · Reality Check · Ask console) · **D8** the `dep=1` modeling assumption (a direct DeFiLlama single-protocol pool ⇒ dependency=1 — the clean baseline, laddered + evidenced). A deviation not in the ledger is a **Halt**.

## THE RED-TEAM / STRESS CATALOG (S1–S24; PART E)

S1 dead endpoint · S2 429 storm · **S3 stale cache (own line)** · S4 no-history · S5 depeg · S6 emissions-inflated · **S7 SAMPLE-heavy (own line)** · S8 malformed · S9 provenance tamper · S10 determinism · S11 thin-liquidity · S12 imminent-unlock · S13 dust/new/STACKED-dependency · S14 verifiability · S15 coverage/applicability · S16 stamp isolation · S17 stamp honesty · S18 live-number provenance · S19 ask groundedness · S20 provider/BYOK/key-safety · S21 ask determinism/injection · **S22 decay-gate honesty (NEW)** · **S23 ICIR determinism/scope (NEW)** · **S24 live-AI grounding (NEW)**. Converge only across **two consecutive clean runs**, or record an honest STOP.

---

# THE CONTRACT-TRUTH SPRINT — additional pins (`data/honesty/contract-pins.json`)

**The next sequential sprint, continuing from the RED-TEAM-CLEAN Persistence sprint.** Carried forward, never rebuilt — the seven axes, the coarse counterparty floor, the opt-in Stamp (decay + ICIR), and the grounded Ask console are unchanged. The machine-readable source is `data/honesty/contract-pins.json`; this renders it for humans.

- **Contract-Truth blueprint** `sprint/sprint-result/ORGANON_Contract_Truth_Sprint_Blueprint.md` — sha `e450f03ad066b95e0d59d34993c4b3b01be58eb937e446c621fcd3d5dc9e66be`
- **CONTRACT PINS_SHA** `4275f7396027e7dd016793a2085454c3c7db880c8386e16df7766cc5681f9489` — the current authoritative pins object; **carried forward** from Persistence `f157da69…` (a conscious extension, not a silent drift). Re-pinned in Phase 2 (EXTRACT-CLEAN) from `cf620520…` when the extraction pin was tightened to state the ACTUAL scope (six tools ported, four consciously not). The verdict-differential baseline is unchanged: lending `70c7912f…` + funding NO-GO `0a63151b…` reproduce.

## THE DEEP COUNTERPARTY AXIS — the contract-risk sub-axis (X-CONTRACT; deterministic, extracted from Sentinel, a screen never an audit)

The counterparty axis gains a **contract-risk sub-axis** built from deterministic Solidity static analysis — the Sentinel `src/solidity` IR + its ~10 LLM-free tools, **extracted copy-into-tree** into `src/contract/*` (the OpenCode coupling severed, `Tool.define` dropped, **NO model/fuzzer/RAG ported**). The IR yields structural **FACTS**; ORGΛNON's OWN pinned rules tier them. It says "this contract has an unprotected admin function," **NEVER** "this contract is safe."

| Tier | Rule |
|---|---|
| **FLAGGED** | ANY flagged structural surface — an unprotected state-changing fn (auth-surface) · a `delegatecall`/low-level/eth-transfer edge (call-graph) · a proxy/upgrade hazard (upgrade-check) · a storage-clash surface (storage-layout) · a reentrancy/value-flow surface (value-flow/state-flow) · an oracle/external dependency (dimensional) — the **specific finding named**, never "unsafe" |
| **CLEAN-STRUCTURE** | zero flagged surfaces **AND a REAL verified build** — "no flagged structural surfaces in the verified source," never "safe" |
| **UNVERIFIED** | no build / an unverifiable or **SAMPLE** build — the coarse age·size·dependency screen scores **alone**; a SAMPLE/absent build is **NEVER** a fabricated all-clear |

**Honest scope (pinned + surfaced).** It is **a deterministic structural screen over verified source — NOT a full audit, NOT a guarantee, NOT a model's opinion**: compiler-backed structural facts (the Foundry build-info IR) + ORGΛNON's OWN deterministic risk rules. The deep dynamic/economic-exploit analysis (fuzzing, symbolic execution) stays **PARKED**. **Deterministic** (a fixed IR → byte-identical facts + tier; ZERO LLM in `src/contract/*` — X-DETERM). **Off the mass hot loop** (capture-time analysis into the provenance record; the render reads recorded facts — a render triggers ZERO compilation). **Additive + verdict-safe** (`material: false` — the coarse counterparty floor + the six axes are unchanged; the differential is zero). A contract screen that says "safe/audited," a fabricated all-clear on an absent/SAMPLE build, a model in the analysis, a Sentinel sibling import, a per-render compilation, or a moved verdict is a **Halt** (S25/S26/S27).

**The extraction (D9).** Copied: `ir.ts` + `protocols.ts` (verbatim) · `build.ts` + `project.ts` + `index.ts→analyze.ts` (coupling severed) · the **six** tools' pure `(ContractIR)→facts` logic feeding the flag categories (`auth-surface` · `call-graph` · `upgrade-check` · `storage-layout` · `value-flow` · `state-flow`) → `src/contract/facts.ts`. Severed: `@/util/*` → a small owned `src/contract/fs.ts`; `@/project/instance` → a plain project-path parameter. Dropped: `Tool.define`, the zod schemas, the `../lang` multi-language fallback, the **LLM audit agent**, the **fuzzer**, the **RAG**, `dep-analyze.ts`. **Not ported** (consciously): the four other LLM-free tools (`contract-info` · `inheritance-resolver` · `dimensional-analysis` · `mutation-map`) — their outputs are not in the sub-axis fact list, so porting them would be speculative surface with no current caller (PART CLEAN); they remain in the Sentinel source for a future sprint. The code is **OWNED in-tree** — nothing imports `@solidity-sentinel/*`/OpenCode (the `dataplane_leak` wall stays green); the main pipeline reads compiler JSON, so **no new npm dep** (deps stay `hono`+`zod`).

**The Foundry-optional seam.** Like the sidecar (Stamp) and the AI provider (Ask), the Foundry toolchain is an **OPTIONAL seam**: the mass tool, `./organon.sh verify`, and the pristine fresh clone all run without it — absent → the sub-axis is `UNVERIFIED` and the coarse screen scores alone, never a crash, never a fabricated all-clear.

## THE PERSISTENCE FINDING-RESOLUTIONS (P1–P6; continuity hygiene, closed in Phase 1)

**P1** the header count reconciled — the AUTHORITATIVE count is `data/honesty/evidence/battery-summary.json` (regenerated + diffed by `verify`), not prose; the historic 585-vs-583 was a doc-lag; this sprint carries the measured **625 pass / 1 skip / 0 fail across 102 files** forward. **P2** the **terminal `PINS_SHA` appears in EVERY final RED-TEAM-CLEAN marker** (a standing rule; Persistence's terminal was `f157da69…`). **P3** the surviving skip is **`test/organon/ask_live.test.ts`** (the Operator-gated live-Groq round-trip, skipped offline). **P4** the two orthogonal fences: **`cleanGo`** is the depth flag (deflation-survival AND a TRACEABLE half-life AND a CONSISTENT ICIR — the persistence/consistency hurdle); the **post-hoc fence** is the pre-registration caveat — both disclosed, never conflated. **P5** the live-value character: the aave `GO (conditional)` half-life ≈ 9.9 / ICIR ≈ 0.6 are **current-capture** values (re-capturable, NOT committed goldens — the X-LIVE ceiling). **P6** the LUMPY-hurdle status: **ARMED + demonstrated on a constructed positive-control record** (a thin edge over many periods), **not yet fired on a real scored strategy** (the one real GO — aave — is CONSISTENT).

## THE DEVIATIONS LEDGER (extended) — D9

**D9** the contract-engine extraction + coupling-severance: Sentinel's `src/solidity` + the ~10 LLM-free tools copied into `src/contract/*`, `@/util/*` → an owned `fs.ts` shim, `@/project/instance` → a plain path param, `Tool.define`/zod/`../lang`/the LLM agent/the fuzzer/the RAG/`dep-analyze` dropped — owned in-tree, the leak wall green, no new npm dep (X-CONTRACT + X-DEVLEDGER + PART CLEAN). A deviation not in the ledger is a **Halt**.

## THE RED-TEAM / STRESS CATALOG (S1–S27; PART E)

S1–S24 carried · **S25 contract-analysis honesty (NEW)** — specific structural facts + the "not a full audit" label, NEVER "safe/audited"; ZERO model in `src/contract/*`; deterministic; a seeded unprotected fn → FLAGGED · **S26 leak-wall / coupling-severance (NEW)** — `src/contract/*` imports nothing from `@solidity-sentinel/*`/OpenCode; D9 records the extraction; owned in-tree, no new dep · **S27 Foundry-absent degradation (NEW)** — no build → UNVERIFIED, the coarse screen scores alone, the mass tool + `verify` + pristine run green, never a fabricated all-clear. Converge only across **two consecutive clean runs**, or record an honest STOP.

---

# THE BUILD-PROVENANCE SPRINT — additional pins (`data/honesty/verify-pins.json`)

**The next sequential sprint, continuing from the RED-TEAM-CLEAN Contract-Truth sprint.** The contract sub-axis shipped capability-complete but **DORMANT** (the registry was empty → every live pool `UNVERIFIED`, proven only on seeded fixtures); this sprint builds the **verified-build pipeline** that scores the first REAL contract tiers on the live shelf. Carried forward, never rebuilt — the six-tool analyzer + the `subaxis` rule are reused verbatim. The machine-readable source is `data/honesty/verify-pins.json`; this renders it for humans.

- **Build-Provenance blueprint** `sprint/sprint-result/ORGANON_Build_Provenance_Sprint_Blueprint.md` — sha `a505862409a872e9c07442e9446921ef61f0117d8f9690b3bfd41b8ea36e3e06`
- **VERIFY PINS_SHA** `f4e5a4a8f233ec0b4a76775e3a0d1ec7400bcd8de6deb4c4d647b2da1e813177` — the current authoritative pins object; **carried forward** from Contract-Truth `4275f739…` (a conscious extension, not a silent drift). The verdict-differential baseline is unchanged: lending `70c7912f…` + funding NO-GO `0a63151b…` reproduce.

## THE VERIFIED-BUILD PIPELINE (X-VERIFY; dormant → exercised, deterministic, provenanced, a screen never an audit)

The contract sub-axis graduates from a dormant capability to a proven one: `ingest.ts` (Operator-gated keyless-first verified-source ingestion) → `buildcapture.ts` (deterministic `forge build` → build-info → `ContractIR` → the six tools → a content-addressed capture) → `contract-registry.json` populated with REAL entries → the first genuine `FLAGGED`/`CLEAN-STRUCTURE` tiers on the live shelf.

| Guard | Rule |
|---|---|
| **The REAL/SAMPLE wall** (X-VERIFY d, S28) | a **REAL verified build** + zero flags may earn `CLEAN-STRUCTURE`; a **SAMPLE or absent build** may NEVER — it stays `UNVERIFIED` (`cleanStructureRequiresRealBuild`). **Flags are existence-proofs** (reportable from any analyzed source); **absence-of-flags is trustworthy ONLY on a REAL verified deployed-source match** |
| **Ingestion** (X-VERIFY a, S30) | keyless-first (Sourcify / Operator-supplied build), **Operator-gated, never a scrape** (D4/D6 ARMED-never-scraped); a BYOK explorer key is OPTIONAL, server-side env-only, **never bundle/log/registry** |
| **Content-addressed capture** (X-VERIFY b,c, S29) | source → `forge build` → build-info → `ContractIR` → six tools → tier; **deterministic** (a fixed build → a byte-identical capture + hash; a changed byte → a changed hash); the analyzer reused verbatim; **NO model** |
| **Off the hot loop** (X-VERIFY e) | all analysis is **capture-time**; the render reads the content-hashed registry and imports no analyzer → **ZERO per-render compilation** |
| **Verdict-safe** (X-VERIFY f) | the tier is `material:false` DETAIL — the verdict is byte-identical across absent/`UNVERIFIED`/REAL-`FLAGGED`/REAL-`CLEAN-STRUCTURE` (the differential proves it) |

**The ceiling (pinned + surfaced).** A REAL tier is **STILL a deterministic structural screen over verified source — NOT a full audit, NOT a guarantee, NEVER a "safe" verdict**; the ceiling holds *harder* on REAL than on SAMPLE; a novel exploit outside the six-tool catalog is a stated blind spot. **The REAL-coverage count is honest** (X-COVER, V3): "N of M pools carry a REAL tier; the rest honestly `UNVERIFIED`," never implying more than was captured. Success is *at least one* real protocol scored end-to-end, not *every* pool.

## THE CONTRACT-TRUTH FINDING-RESOLUTIONS (V1–V5)

**V1** the terminal-battery delta is itemized `(+N <file>)` at every gate + reconciled to the last phase count (the standing rule; Contract-Truth's 658/106 → 665/107 retro-annotated `+7 contract_redteam / +1 file`). **V2** the referenced-log chain corrected: Crown-Jewel is **`583/0` across 97 files** (its own header; the `585` drift dropped), and the Deepening sprint (`511/0` across 91 files) has no standalone file — its record lives inside **`BUILDLOG-HONESTY.md`** (the blank filename filled, never a fabricated `BUILDLOG-DEEPENING.md`). **V3** the header foregrounds the dormant→exercised status + the honest REAL-coverage count. **V4** a continuity note records the deep axis is a **six-tool subset** (four parked in D9), so no future sprint inherits an overstated "~10 tools" baseline. **V5** the spine — the capture path exercised end-to-end on ≥1 REAL Foundry build.

## THE DEVIATIONS LEDGER (extended) — D10

**D10** the verified-build ingestion scope: which shelf protocols carry a REAL tier, the keyless-first/no-scrape scope, an Operator-signed statement (surfaced verbatim in the handoff — Part E).

## THE RED-TEAM / STRESS CATALOG (S1–S30; PART E)

S1–S27 carried · **S28 the REAL/SAMPLE wall (NEW)** — a REAL verified build + zero flags may earn `CLEAN-STRUCTURE`; a SAMPLE/absent build + zero flags → `UNVERIFIED`, never a fabricated all-clear; flags existence-proofs from any source, absence-of-flags trustworthy only on REAL · **S29 capture-determinism / re-capture-hash (NEW)** — a fixed build → byte-identical facts + a stable hash; a re-capture → the identical hash; a one-byte change → a changed hash; the render compiles nothing · **S30 ingestion-scope / keyless-no-scrape (NEW)** — keyless-first + Operator-gated; no paywalled source scraped (D4/D6); the BYOK key server-side env-only, never bundle/log/registry. Converge only across **two consecutive clean runs**, each delta itemized `(+N file)`, or record an honest STOP.

---

# THE VOICE SPRINT — the trust machine gets a voice (`data/honesty/voice-pins.json`)

**The next sequential sprint, continuing from the RED-TEAM-CLEAN Build-Provenance sprint.** ORGΛNON is a trust machine — an engine that manufactures *checkable* claims — but the Ask console exposed a tenth of what the engine knows through eight rigid intents and template phrasing. This sprint gives the machine a voice **without a spokesperson who lies**: the design bar is *trust tiering without trust laundering*. The machine-readable source is `data/honesty/voice-pins.json`; this renders it for humans.

- **Voice blueprint** `sprint/sprint-result/ORGANON_Voice_Sprint_Blueprint.md` — sha `2651ce18581ef27e5bbaa0dd6a29fdcd1037a91aa0d97d8a458b7cfdaed01fa6`
- **VOICE PINS_SHA** `eb55ce43d9e053130872e3f75fd729ac33c383c9bd34465e821d18a49832f256` — the current authoritative pins object; **carried forward** from Build-Provenance `f4e5a4a8…` (a conscious extension, not a silent drift). Re-pinned once at Phase 6 (STAMP-TIGHT) when the MinTRL rider LANDED (`da25beaf…` → `eb55ce43…`, a conscious re-pin surfaced with its sha delta). The verdict-differential baseline is unchanged: lending `70c7912f…` + funding NO-GO `0a63151b…` reproduce.
- **Persona artifact** `data/honesty/persona.md` — sha `d0d7f18d5d03850fa0d3d1164b4819f1cf08b94ef647065828827e0e26b2fd89`, hash-locked into the pins (an edited persona ⇒ a changed PINS_SHA ⇒ a conscious re-pin).

## THE THREE-TIER VOICE DOCTRINE (X-VOICE; the reasoning never wears the facts' clothes)

| Clause | Rule |
|---|---|
| **(a) one pinned persona, fail-closed** | ONE hash-locked system prompt (a senior DeFi quant researcher, register-aware) rides every provider identically; the persona is INSTRUCTION while the gates are LAW — the deterministic gates sit DOWNSTREAM, so a weak/jailbroken model degrades to templates, NEVER to fabrication |
| **(b) the typed contract** | every Ask answer is a typed `Block[]`: **FACT** (engine value, groundedness-gated, high-trust visual) / **REASONING** (AI analysis over backed facts, VISIBLY LABELED "ANALYSIS — not an engine fact" in markup that survives a screenshot) / **BOUNDARY** (a deterministic template); the tier lives in the DATA MODEL and the RENDER |
| **(c) five deterministic gates** | pure fns over `(candidateBlocks, factSet)`, downstream, typed per-block rejection, fail-closed: the **numeric whitelist** (no model arithmetic) · the **verdict guard** (carried) · the **comparison-direction** check · the **severity lexicon** ("safe"/"guaranteed"/"risk-free" banned outright; "critical"/"severe" only fact-backed) · the **advice-pattern** screen (recommendation shapes → the ADVICE boundary) |
| **(d) closed, compositional intents** | the enum is **13 and CLOSED** (the 8 carried + OUTLOOK · SCENARIO · ADVICE_BOUNDARY · GENERAL · RECORD_HISTORY; COMPARE upgraded in-place to n-strategies); routing stays deterministic |
| **(e) deterministic parity** | EVERY one of the 13 intents has a no-key template path; no key → FACT + BOUNDARY, REASONING omitted; the mass path never requires a model — the AI is garnish, the engine is the meal |
| **(f) OUTLOOK honesty** | "the engine is not a forecaster" first; then the persistence evidence (decay, ICIR, funding-regime facts); then labeled conditional reasoning; then the calibration status (honest zero until resolutions exist) |
| **(g) the residual, disclosed** | qualitative error inside a labeled REASONING block is not fully closable by any deterministic gate; it is scoped (over backed facts only), labeled, measured (the eval harness), and DISCLOSED in Simple + Pro — the trade accepted consciously because muteness has a real cost |

**The enum interpretation (surfaced, D11 note).** The Crown-Jewel enum is 8, already including COMPARE. The blueprint's named widening (COMPARE · OUTLOOK · SCENARIO · ADVICE-BOUNDARY · GENERAL) adds only 4 net (COMPARE pre-exists); to honor the pinned **exactly 13**, COMPARE is upgraded in-place (net 0) and the 5th genuinely-new intent is **`RECORD_HISTORY`** — wiring the pre-existing but unrouted `recordHistory` tool (the moat made reachable).

## THE ADVICE WALL (X-ADVICE; law status) · THE CALIBRATION CLOCK (X-CAL) · THE PERSONA MEASURED (D12) · THE MinTRL RIDER

**X-ADVICE (law).** The AI NEVER recommends an action, allocation, entry/exit, or "should"; "should we invest?" → the FACTs + the risk FRAMING + the researcher-not-advisor BOUNDARY. Personalized investment advice is a regulated activity — a compliance posture, not a brand choice. A recommendation that flows, under any provider or injection, is a Halt. **X-CAL (record-only).** An append-only, hash-chained, engine-derived prediction record (`data/honesty/cal-ledger.json`) capturing `{subject, predictionType, statedAt, horizon, resolutionStub, entryHash, prevHash}` at capture time; NO Brier score until real resolutions exist, NO backfill path in the code; the only surface is the honest count. The data cannot be backfilled — every unrecorded month is evidence lost forever, so the clock starts now. **The eval harness (D12).** A fixed query battery × fixed fact sets → per-provider gate-rejection / advice-leak-attempt / verdict-contradiction-attempt / numeric-smuggling-attempt / template-fallback rates; Operator-gated live (`eval_live` a named honest skip); the integrity uniform (the gates), the experience varied (the models) — disclosed. **The MinTRL rider (PARK-if-tight).** T < MinTRL → the PSR/DSR point estimate SUPPRESSED (not caveated) → honest INSUFFICIENT + "need N more observations"; the trial count N logged.

## THE X-ASK AMENDMENT (D11, Operator-signed) + THE FINDING-RESOLUTIONS B1–B5

**D11** — the whole-answer-rejection clause becomes the typed per-block rejection rule of X-VOICE(c): unbacked NUMBERS / VERDICT-WORDS / COMPARATIVE-DIRECTIONS / SEVERITY-CLAIMS / ADVICE-PATTERNS reject; labeled REASONING over backed FACTs flows. The FACT groundedness gate is UNCHANGED; the closed-enum routing is UNCHANGED; the amendment is pinned + surfaced verbatim, never a silent drift. **B1** the verify bundle sha reconciled — the registry is OUTSIDE the determinism+frozen+differential bundle (integrity = per-entry `contentSha` self-consistency); a registry-digest line is added to `verify` so a future registry change IS visible. **B2** the coverage denominator standardized to "N of M applicable" (7 applicable; 9 shown incl. 2 not-applicable). **B3** the benign wall direction (REAL→`CLEAN-STRUCTURE`) is fixture-proven only — zero real-world instances. **B4** the proxy-surface qualifier carried into continuity. **B5** the many-findings render resolved — severity-grouped + category-deduped + drawered, a `material:false` render change, the verdict byte-identical.

## THE RED-TEAM / STRESS CATALOG (S1–S35; PART E)

S1–S30 carried · **S31 persona-injection resistance** (seeded injections → at worst a template, never fabrication) · **S32 the advice wall** (seeded advice bait → zero post-gate recommendations) · **S33 numeric-smuggling / verdict-contradiction / comparison-direction / severity** (seeded gate violations → rejected typed + fail-closed; the ANALYSIS label present) · **S34 cross-provider degradation + deterministic parity** (all 13 intents green with no key; a weak provider → more templates, never less truth) · **S35 calibration honesty** (append-only + hash-chained; no backfill; no score on zero resolutions). Converge only across **two consecutive clean runs**, each delta itemized `(+N file)`, or record an honest STOP.

## THE SURFACE — the pinned ORGΛNON design system (X-SURFACE; Surface sprint) · `PINS_SHA b0179998…`

The trust machine gets a **face worthy of its rigor** — a pinned design system (theme · type · color · motion) authored with the **impeccable** skill as a **DEV-TIME-ONLY seam**, the server-rendered surface polished with **zero new runtime dependencies**. Every clause load-bearing:

| Clause | The pin |
|---|---|
| **(a) a pinned artifact** | `data/honesty/design-tokens.json` (+ `DESIGN.md`) is hash-locked into `surface-pins.json` exactly like the persona — a changed token ⇒ a changed sha ⇒ a **conscious re-pin**, never a silent restyle; the single stylesheet `public/organon.css` is BUILT from the tokens deterministically (`script/build-stylesheet.ts`), never hand-edited |
| **(b) impeccable is dev-time-only** | the skill / CLI / `.impeccable/` never ship on the mass path; the runtime deps stay FROZEN at `hono`+`zod`; what LANDS is the OUTPUT (the token-built stylesheet + polished HTML); `.impeccable/*` gitignored except `config.json`; a runtime import of impeccable / a CSS framework is a Halt; the **pristine clone is green with impeccable entirely absent** |
| **(c) the detector is a red-team gate** | the deterministic 45-rule detector (no LLM, no key) is wired as **S38** over the rendered surface + the stylesheet — zero unexcepted anti-patterns; project-legitimate exceptions live in `.impeccable/config.json` **with a reason** (currently only `em-dash-overuse` — ORGΛNON's house-style em-dash in S36-frozen content; the constitution outranks the detector); absent (pristine) → an honest skip |
| **(d) screenshot-durable trust semantics** | FACT / REASONING / BOUNDARY each a distinct rendered treatment; the `ANALYSIS — not an engine fact` label **RENDERED adjacent** (V4 — a screenshot carries it); REAL vs SAMPLE by color **+ a border-style cue**; every verdict {SOLID/CAUTION/AVOID/UNVERIFIED} + Stamp {GO/NO-GO/INSUFFICIENT/UNAVAILABLE} word a pinned color **PLUS a glyph** — never color alone |
| **(e) honesty-preserving** | a restyle may change layout/type/color/space/motion; it may NEVER change a number, label, tier, verdict, provenance mark, or which facts appear — the cues render via CSS keyed on the existing classes, the HTML content byte-untouched; **S36** asserts the visible text is byte-identical per screen (the golden captured pre-restyle) |
| **(f) accessible + degrade-honest** | WCAG-AA **computed from the token file** on every semantic pairing; keyboard-reachable; responsive to mobile; the `UNVERIFIED`/`INSUFFICIENT`/AI-off/empty states designed as **intentional** honest states (**S37**) |

**The Voice findings V1–V5, closed.** V1 the intent lineage restated as a caught blueprint-arithmetic correction (COMPARE pre-existed; RECORD_HISTORY the fifth) · V2 the single reconciliation line (703 → 768 → 807) · V3 the eval scope honest (only Groq measured LIVE; the other four by shared-gate architecture, not sampling; live sampling next-sprint) · V4 the rendered-ANALYSIS-label assertion · V5 the eval attempt-rate denominators (the fixed 12-case battery). **D14** the design system · **D15** the impeccable dev-seam scope (the objective detector is the gate; the interactive browser flows not run in the autonomous harness — surfaced, not overstated). **The catalog grows to S1–S38** (S36 honesty-preserving-restyle · S37 a11y/degraded-states · S38 the detector wall). The **screen set stays the conscious 3** (impeccable polishes, never adds a fourth).

## THE SOVEREIGN — the sovereign data-plane + the real design pass (X-PLANE · X-DESIGNPASS; Sovereign sprint) · `PINS_SHA 6fac4e94…`

The tool **stops renting its senses and finishes its face** — two spines under one law: *nothing owned may be less honest than what it replaced.* Carried from Surface `b0179998…`.

| Clause | The pin |
|---|---|
| **X-PLANE(a) three narrow pinned paths** | **FUNDING-HISTORY** (`src/plane/funding.ts` — Hyperliquid public info keyless + Binance/Bybit public funding archives) · **POOL-EVENTS** (`src/plane/events.ts` — Envio HyperSync, `HYPERSYNC_TOKEN` an optional seam, ONLY the enumerated `{rate-update, tvl-move, liquidity-move}` per shelf pool) · **RPC-STATE** (`src/plane/rpcstate.ts` — the pinned llamarpc/ankr/publicnode/1rpc rotation, the true source recorded per read). A **fourth path is a conscious re-pin**; a general indexer / an archive node is a **Halt** |
| **X-PLANE(b) free-first, optional seams** | the HyperSync token is env-keyed like BYOK — absent → the path degrades to the rented plane / SAMPLE, **never a crash**; self-hostable/replaceable; **no SDK ships** (plain fetch); no paid tier without the kill-condition firing first |
| **X-PLANE(c) gap-honest, fabrication-free** | every owned series capture-time + content-hashed + REAL/SAMPLE into the moat; an archive **gap stays a gap** — no interpolation, no backfill (a fabricated point is a **Halt**, positive-controlled S39); a re-capture is hash-stable; a dead endpoint degrades with the **actual source** recorded (a value that fell back is never stamped own-plane) |
| **X-PLANE(d) the rented plane stays; divergence is a FACT** | DeFiLlama free · GeckoTerminal **remain** the breadth fallback; an own-vs-rented disagreement beyond a pinned **5%** tolerance is **surfaced** — recorded + rendered as the Pro-side divergence row — **never silently resolved** toward either source |
| **X-PLANE(e) honest improvement only** | the Stamp/axes improve ONLY as the math consequence of a genuinely longer REAL series; the **decay/ICIR/MinTRL math is byte-untouched**, the goldens reproduce; the frozen differential goldens read **byte-untouched inputs** (bybit stays ILLUSTRATIVE), the honest INSUFFICIENT-retreat demonstrated on **NEW** goldens, traced to observation counts; a nudged threshold is a **Halt** |
| **X-PLANE(f) the kill-condition is ARMED** | pinned in writing: **~1 day/week** sustained plane upkeep → the recorded exit is **BUY DeFiLlama Pro** ($300/mo) for breadth + **NARROW** the build further; the upkeep ledger exists to measure it (S40) |
| **X-DESIGNPASS (D16) the real pass, aesthetics only** | the interactive impeccable `critique` **RUN for real** (design-review sub-agent + the deterministic detector); the browser/`live` flow **still not run** (no browser automation — source-based, disclosed); the **semantic tokens byte-frozen** (a value change would break the frozen Surface golden — the pass works *above* the primitives); the S36/S38/dep/a11y walls **continuous**; `clarify` chrome-only; the screen count **3**; **zero** wall suspensions attributed to the approval |

**The Surface findings SF1–SF5, closed.** SF1 the impeccable framing **led-with** (the interactive critique now run; the browser flow still not — up front, not buried) · SF2 the pristine off-by-one **reconciled** (`surface_detector` has 4 tests, 3 `skipIf` → pristine = **807 − 3 = 804**) · SF3 the a11y claims **scoped to method** (contrast COMPUTED; keyboard/responsive DOM-ASSERTED; a browser/AT pass flagged follow-up) · SF4 the V4 evidence shape **named** (the rendered-output assertion is the deterministic proxy; the image case inferred) · SF5 the design-intelligence pass **RUN** (Spine A). **D16** the design-pass process amendment · **D17** the plane scope — both **Operator-signed**. **The catalog grows to S1–S41** (S39 plane-provenance/honest-degrade/no-fabricated-history · S40 the narrow-path fence + the armed kill-condition · S41 design-pass honesty). The **screen set stays the conscious 3** (the divergence row is a ROW, not a screen).

## THE INTERPRETER — the voice stops restating and starts explaining (X-INTERPRET · X-DOGFOOD; Interpreter sprint) · `PINS_SHA f09fd743…`

The voice is grounded and honest — now it **EXPLAINS what the numbers MEAN**, in a register that fits the reader, without truncation, **without lowering one wall**. Carried from Sovereign `6fac4e94…`.

| Clause | The pin |
|---|---|
| **X-INTERPRET(a) wider lane, same floor** | REASONING blocks gain interpretive latitude (comparative framing · risk synthesis · the "so what" · conditional structure); the **FIVE deterministic gates** (numericWhitelist · verdictGuard · comparisonDirection · severityLexicon · advicePattern) **AND** the FACT groundedness gate (`Explain.verifyGroundedness`) are **BYTE-UNCHANGED** and re-run on the wider output — a smuggled derived number STILL rejects, a soft recommendation under "what this means" STILL routes to the ADVICE boundary, a moved verdict STILL rejects (S44). The lane widens for interpreting **facts**, never asserting non-facts; a lowered wall is a **Halt** |
| **X-INTERPRET(b) real registers** | `src/ask/register.ts` — a deterministic rubric: **Simple** carries NO pinned-jargon token (ICIR/deflated/apyBase/proxy-surface/MinTRL/…) + ≤ the Simple band + leads with the plain catch; **Pro** names ≥1 axis + cites provenance + carries the proxy-surface caveat where present + surfaces the divergence where present + ≥ the Pro band; two identical registers, or a Simple that reads Pro, → **rejected** to the correctly-registered template (S42) |
| **X-INTERPRET(c) explain, don't restate** | `persona.md` **RE-PINNED** (`d0d7f18d… → ec98048d…`, D18 — a conscious re-pin; the live hash-lock moves to the Interpreter pin, **voice-pins retains its Voice-era record**, no cascade) with an explicit "the engine already showed the number — say what it MEANS, never repeat it as new" instruction + interpretation exemplars + the two-register exemplars; the FACT groundedness gate untouched |
| **X-INTERPRET(d) no truncation, ever** | killed at all **three** layers — (1) the **CSS/render** surface flows/wraps, never clips (the S36 golden byte-identical — a container change, not a content change); (2) the **AI output-cap** scales to the fact-set size + a truncated finish is detected + continued or honestly marked, never a silent cut; (3) the **pre-AI fact-budget** is EXPLICIT (a reduced set names what was summarized), never a silent drop; each positive-controlled with an oversized COMPARE (S43); **CSS alone is refused** as a complete fix |
| **X-INTERPRET(e) COMPARE explains** | n FACT blocks + **ONE** comparative REASONING block (the tradeoff, not n restatements); every number tracing, every direction matching; no-key parity (the fact table + a deterministic template comparison) |
| **X-DOGFOOD (D19) the user-POV drive** | post-dev, the whole system driven as a real user — every screen × register × the 13 intents × every CLI verb × key/no-key × mobile/desktop × the empty/degraded states — issues fixed **on the fly**, each logged (cause → fix → result); a pure-UX fix under the design walls, a fact/verdict/wall issue **routed like a correctness defect**, never patched by lowering a wall |

**The Sovereign follow-ups SV1–SV5, closed.** SV1 the plane live-coverage **stated in one line** (FUNDING-HISTORY live · RPC-STATE single-probe · POOL-EVENTS built + fence-proven, NOT live) · SV2 the HyperSync live capture **attempt-or-honest-gap** (Phase 4/5) · SV3 the funding band clarified as a **Stamp/facts** improvement, not a moved verdict · SV4 the **source-based-design-pass** qualifier carried into continuity · SV5 the real **browser/AT a11y** pass named as the standing follow-up. **D18** the reasoning-lane amendment · **D19** the user-POV drive — both **Operator-signed**. **The catalog grows to S1–S44** (S42 register differentiation · S43 the three-layer truncation kill · S44 interpretation-not-restatement + walls-hold-on-a-wider-lane). The **screen set stays the conscious 3** (the Ask learns to explain; NO fourth screen, NO fourth register).

## THE LINEAGE — the Stamp proves its bloodline or shuts up (X-LINEAGE; Lineage sprint) · `PINS_SHA ed4bb2cb…`

The Operator clicked pool after pool and asked the only question that matters about a trust machine: *"why does every pool tell me the same confident thing?"* Three explanations fit — **H1** SAMPLE-fed · **H2** mis-keyed bleed · **H3** real-but-illegible — and they demand OPPOSITE fixes. **Diagnose first (D20); build all three walls regardless; fix the proven cause under them.** The Stamp MATH stays byte-frozen — this sprint renders the statistics honestly, it does not revise them. Carried from Interpreter `f09fd743…`. **The pinned LAST pre-probe engineering sprint.**

| Clause | The pin |
|---|---|
| **X-LINEAGE(a) diagnosis before treatment** | `script/honesty/stamp-lineage-diagnose.ts` captures, per shelf pool, the Stamp input's TRUE identity (`source · reality · nObs · seriesContentHash · reproHash · significance · familyN · verdict`) and states VERBATIM which of H1/H2/H3 holds → **D20**, before one repair line. The finding must **follow the evidence** (a hedge where the artifact shows identical hashes → fail); **NO product diff** lands in the diagnosis phase |
| **X-LINEAGE(b) WALL 1 — SAMPLE-never-GO at the render (S45)** | GO/NO-GO may render ONLY off a per-subject series that is provenance-**REAL** and clears the pinned length floor (**60** points); SAMPLE/absent/borrowed/short → **INSUFFICIENT/UNAVAILABLE** — enforced on the **RENDERED payload** (both `reality.ts` renderStamp AND the Ask VALIDATION path), so a stale cache or template path can NEVER resurrect a SAMPLE-fed GO; positive-controlled (a seeded SAMPLE series pushed at the render → INSUFFICIENT, never GO) |
| **X-LINEAGE(c) WALL 2 — per-subject distinctness + the lineage line (S46)** | the series-hash on the lineage line is **sha256 of the subject's OWN resolved return series** — recomputed from `poolReturnsFromSeries(resolvedSeries)` in the test (the **derivation asserted**, not merely displayed); every Stamp render carries the unmissable lineage line (`source · REAL/SAMPLE · as-of · N points · hash prefix`); a standing test walks **N** different pools and asserts their identities **DIFFER** — two subjects sharing one lineage is a wall failure; a seeded bleed is caught |
| **X-LINEAGE(d) WALL 3 — strength legibility, math untouched (S47)** | the render states the deflation pressure in plain words (*"deflation counted N attempt(s)"*; **n=1 explicitly labeled the weakest form** — nothing was deflated away); the displayed significance is **CAPPED at 4 digits** (a near-1 value → `≥ 0.9999`, never sixteen digits, never a bare `1.0000`) while the **RAW value stays full-precision** in `StampResult.dsr` + the reproHash (**capped display, uncapped record**); the GO/NO-GO/INSUFFICIENT words, thresholds, formulas **BYTE-UNTOUCHED** — the significance is the frozen seven, the `stamp/decay/icir/mintrl` module hashes are pinned + asserted unchanged at every gate |
| **X-LINEAGE(e) the fix is the diagnosis's** | H1 → SAMPLE-fed Stamps become honest INSUFFICIENT (the verdict change IS the fix, disclosed per-pool); H2 → the keying repair (the bleed killed, distinctness green, the convicted path DELETED); H3 → legibility alone (the walls make it readable); a golden legitimately changed → a conscious disclosed re-pin (old/new shas). The **SCORECARD differential holds byte-identical** regardless (the Stamp is OFF the scorecard path) |
| **X-LINEAGE(f) the two-verdict separation STAYS** | a Stamp **GO on a scorecard-AVOID pool** is correct by design (a robust track record ≠ a safe deposit); the sprint makes the Stamp **provable**, it does not conflate or hide the verdicts |

**The Interpreter findings IN1–IN5.** IN1 the register wall's **two strengths** stated (the RUNTIME gate enforces the register DISTINCTION; the full rubric is exemplar+control-enforced, **not** a live-answer guarantee) · IN2 the **Operator real-screen session** (Phase 5, Operator-gated — run or honest gap, never an agent simulation relabeled) · IN3 the **POOL-EVENTS drift FORCED** (`HYPERSYNC_TOKEN` absent → **D21** fence-proven-only, the drift ends) · IN4 the **browser/AT a11y pass** pinned to the probe sprint's Phase 0 · IN5 the **truncated-finish mark-only** choice recorded deliberate (a continuation call doubles cost + can compound truncation; PARKED). **D20** the lineage diagnosis · **D21** the POOL-EVENTS decision — both **Operator-signed**. **The catalog grows to S1–S47** (S45 SAMPLE-never-GO-at-the-render · S46 per-subject distinctness + the lineage line · S47 strength legibility + capped precision). The **screen set stays the conscious 3** (the Stamp DRAWER learns lineage — a sub-route, NOT a fourth screen; NO new statistics).

## THE MOAT — deepen only what can be proven, along the evaluation's four lines (X-MOATDEEP; Moat sprint) · `PINS_SHA 6aa2d0c7…`

Fourteen sprints made the tool honest; the Probe made it measurable; the resource evaluation ("viem and the López de Prado / qlib Quant Canon") found exactly **four** places the moat can get DEEPER without getting louder. This sprint builds those four — and nothing else — while the invites wait on the Operator's hands. Carried from Probe `e6bed150…`. Dual-repo, byte-identical (`organon` + `organon-studio`). Full contract in `data/honesty/moat-pins.json` (`moat_pins.test.ts`).

| Clause | The pin |
|---|---|
| **X-MOATDEEP(a) capture-time dependency** | `viem@2.55.0` + `@shazow/whatsabi@0.26.0` (MIT ×2) may resolve proxies/ABIs the hand-rolled path cannot — but **CAPTURE-TIME ONLY**, under a ledgered determinism contract: **EXACT** version pins (no caret — viem's type-semver drift), `batch.multicall`+`http({batch})` **PROHIBITED** (S55 asserts captures byte-identical batching ON-vs-OFF at a pinned block), **every read block-pinned** (explicit `blockNumber`), **no signing import ever**, and a **capture-module allowlist + grep wall** (`script/capture/proxy-truth.ts` only; a viem import on any mass/verdict-path module fails the build). **ADOPT-OR-RECORD** — the prototype must demonstrate a resolution the hand-rolled path missed or the finding is recorded and the trees stay clean; **D26 Operator-signed** (until signed, the deps do NOT land — the mass path stays `hono`+`zod`). RPC-STATE mass path **stays hand-rolled**; RE6 flip condition pinned in writing (≥2 ledgered correctness failures, or maintenance > supply-chain cost) |
| **X-MOATDEEP(b) REAL cells earned** | the Stream/Elixir/Resolv post-mortems earn REAL cells by **genuine content-hashed re-fetches** carrying their EXACT as-of — **PIT honesty governs**: a current API serving revised history earns `REAL-as-fetched-now (covering <period>)`, **never** `REAL-as-of-collapse` it can't prove; unprovable/un-fetchable → **STAYS SAMPLE**, plainly (S56). Every REAL cell re-verifiable from its committed instruction; the verdicts the engine's recomputed output; the kill-criterion `8b4e094b` **untouched** while the artifact improves |
| **X-MOATDEEP(c) variance honesty** | the Stamp's DSR/PSR variance (`rigor.py::psr`) corrects for skew/kurtosis but treats the `n` daily observations as **i.i.d.** — over autocorrelated DeFi yields that **understates** the variance and makes verdicts **too generous** (the direction a firewall fears). The read-only audit measures τ_int/n_eff per pool; the repo **already ships the fix** (`effective_n.py`, frozen, wired only on the funding path) so an amendment needs **zero frozen-byte edits** (an off-path effective-N floor, the MinTRL pattern). **D27 Operator-signed** — the **conservative amendment** (a GO may become INSUFFICIENT; a net-generous "fix" HALTS) OR the **caveat** rendered beside the strength line. Interim honest default: the **caveat is rendered now** (disclosure needs no signature; silence would lie), the amendment **specified + parked** pending the signature (S57) |
| **X-MOATDEEP(d) ledger ready for trials** | the per-trial recording **schema** pinned (config + return series + metric + content hash) with **deterministic agglomerative clustering** pre-required (K-means randomness is an X-DETERM hazard) — so the day the proposer generates trials the moat counts them at **zero implementation cost now**; the ONC/PBO implementation stays **PARKED** behind the proposer + adequate T (an implementation commit is a cut); the render states the deflation is **currently inert** (RE3: "1 attempt counted, no multiple-testing penalty was paid"); the **FTO flag** pinned as a dated Operator business action (RE4: US 2019/0294990 A1) |

**The Probe findings PR1–PR5, closed.** PR1 IN2/IN4/AF4 carried to the Phase 5 Operator gate (OWED-OPERATOR-GATED, never simulated) · PR2 the D23–D25 countersigns prepared with D26/D27 · PR3 the REAL-cell upgrade · PR4 the **DISC-B** `alpha-pins` `organon-studio` label **reconciled at this bump** (each tree's `34d20e7` base is self-substantiating; the Alpha `3b9f98bc…` chain intact as **superseded** history, never rewritten — U-RESUPERSEDE) · PR5 the **dual-repo divergence wall** (per-repo `expect()` recorded, both trees 0-fail, every delta a DISC). **D26** the capture-time dependency decision · **D27** the variance decision — both **Operator-signed** (reserved). **The catalog grows to S1–S57** (S55 capture-time determinism · S56 REAL-cell integrity · S57 variance honesty). The **mass path stays `hono`+`zod`**; the **screen set the conscious 3**; the parked list (proposer/ONC/PBO/reports/execution/archive-node/calibration) **stays parked** — the probe decides what unparks next.
