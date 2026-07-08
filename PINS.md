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

The counterparty axis is a **coarse structural screen (age · size · dependency), NOT a contract audit** — deep contract analysis (the Sentinel IR) is PARKED; dependency is an honest **non-scoring note**. Rendering the screen as "audited/safe/guaranteed" is a doc-lie Halt (F-IDENTITY).

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
