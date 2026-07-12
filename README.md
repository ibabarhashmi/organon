<p align="center">
  <img src="docs/organon-logo.png" alt="ORGΛNON" width="560">
</p>

<p align="center">
  <b>An honest-by-construction DeFi Reality Check — and the strategy engine underneath it.</b><br>
  Is this yield real, and what's the catch? Answered as a machine-derived scorecard from real,<br>
  point-in-time data — moated by an append-only record of what was real, and when.<br>
  Ask it in plain language; opt in to an overfit stress test on the track record — every number the engine's, never a model's.
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#the-reality-check">Reality Check</a> ·
  <a href="#the-opt-in-stamp">The Stamp</a> ·
  <a href="#the-ask-console">Ask Console</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#capability-matrix">Capabilities</a> ·
  <a href="#usage">Usage</a>
</p>

<p align="center">
  <img alt="runtime" src="https://img.shields.io/badge/runtime-Bun%201.3-black">
  <img alt="language" src="https://img.shields.io/badge/TypeScript-strict-blue">
  <img alt="sidecar" src="https://img.shields.io/badge/sidecar-Python%203-yellow">
  <img alt="verdicts" src="https://img.shields.io/badge/manufactured%20verdicts-zero%20(by%20design)-brightgreen">
  <img alt="evidence" src="https://img.shields.io/badge/numbers-reproducible%20(./organon.sh%20verify)-blue">
  <img alt="ai" src="https://img.shields.io/badge/AI-optional%20%C2%B7%20BYOK%20%C2%B7%20grounded-purple">
  <img alt="license" src="https://img.shields.io/badge/license-proprietary%20%C2%B7%20closed%20source-lightgrey">
</p>

---

## What is ORGΛNON?

ORGΛNON answers one question about a real DeFi strategy — **is this yield real, and what could kill it?** — as a **machine-derived scorecard**, not an opinion. It is built so the honest answer is the *only* answer the machine can produce, and so a stranger can **regenerate every number it claims with one command**. It knows *what kind of thing* it is looking at — a synthetic stable from a liquid-staking token from a levered loop from a tokenized treasury — and names the one catch each kind hides that the general axes cannot see; the kind it cannot verify (an off-chain RWA), it refuses to bless.

It presents as three deliberate surfaces over one spine:

- **The Reality Check** — a before-you-click consumer tool. Each strategy gets a verdict (`SOLID` · `CAUTION` · `AVOID` · `UNVERIFIED`) derived from deterministic risk axes over real data — never hand-written, never a hero APY. `UNVERIFIED` renders as an honest "we can't confirm this," never a disguised pass.
- **The Ask Console** — a grounded natural-language front door: ask in plain words, get an engine-sourced answer whose every number and verdict traces to a fact. The AI only routes to a closed intent set and *phrases* in register behind a groundedness gate — it is AI-optional (keyless → deterministic) and BYOK.
- **The opt-in Stamp** — a Pro sub-route: an overfit stress test that runs a pool's recorded track record through the frozen anti-PBO adjudicator → a distinct `GO` · `NO-GO` · `INSUFFICIENT` verdict, now refined by a **decay half-life** gate and a **within-strategy ICIR** consistency score. Off the mass path, orthogonal to the scorecard, never conflated.

Under all three sits **the strategy engine** — the honest-by-construction core: a byte-frozen verdict core, a tamper-evident hash-chained trial ledger, and a point-in-time data store that *cannot* fabricate or retro-capture a value.

Four properties make the honesty structural rather than aspirational:

- **The numbers prove themselves.** `./organon.sh verify` regenerates every headline number — the test count, the frozen-core git-clean proof, the verdict differential, the deterministic scorecard — and **diffs it against the committed evidence bundle** (`data/honesty/evidence/`). A claimed number with no backing artifact, or a `verify` that does not reproduce, is a hard failure. Credibility rests on a command, not on trust.
- **A frozen verdict core.** The computational core (6 Python modules + one TypeScript loop) is byte-pinned and byte-identical to its origin. A verdict figure cannot silently drift; the integrity wall proves it on every run.
- **Real, point-in-time data — or an honest gap.** Data is captured into a content-addressed, nonce-anchored store that cannot fabricate or retro-capture. A missing day stays missing; every shown value is `REAL` (fetched and recorded) or `SAMPLE` (a labeled placeholder) — a value shown as `REAL` that isn't in the record is a halt.
- **Determinism, no model in the verdict.** Every axis and verdict is a rule over structured facts. An LLM may only *phrase* the plain-language register behind a groundedness verifier — it never touches a verdict, an axis, or the record.

The result: **zero verdicts are manufactured.** An `AVOID` on real data is the product working.

## The Reality Check

The screen set is a conscious **3** — two mass screens every user meets, plus the Ask Console. The user *checks*, they do not build (a fourth screen is a deliberate stop).

- **The Shelf** — Reality Cards across all three money verticals: a real-yield split bar (durable base vs reward emissions), a verdict pill, a `REAL`/`SAMPLE` badge, a risk word.
- **The Reality Check** — the x-ray of one strategy: the verdict banner + a one-line plain reason, the scorecard rows, a Simple/Pro toggle, a confidence **band** (never a single hero APY), **who holds the upgrade key** (a conservative on-chain governance read — EOA / multisig / timelock / immutable / unresolved), the **domain catch line** where the subject is a known kind, and a link into the provenance history — the moat made visible. Every real number is labeled by **which kind of true** it is — **REAL★** (block-pinned, reproducible against the chain itself) vs **REAL-at-timestamp** (an aggregator response at time T). Any covered pool not on the curated shelf is reachable by an **any-pool lookup** (each axis degrades honestly to the data that genuinely exists). The opt-in **Stamp** is a Pro sub-route of this screen (a drawer, not a screen).
- **The Ask Console** — the grounded natural-language front door (below).

### The scorecard axes

Each axis is a pure `(facts) → row` on hash-locked thresholds. An axis that doesn't apply to a vertical renders **`not-applicable`** — a distinct honest state, never a fabricated pass, never counted toward `SOLID`.

| Axis | Signal | Reads |
|---|---|---|
| **Yield-reality** (flagship) | `apyBase / (apyBase + apyReward)` | durable base yield vs temporary reward emissions |
| **TVL trend** | 30-day TVL slope | is money staying, or fleeing |
| **Peg / stability** | \|price − 1\| | is the stablecoin holding its dollar |
| **Funding regime** | `[p10, p90]` band of annualized funding | delta-neutral carry — shown as a band, never one number |
| **Liquidity depth** | DEX pool `reserve_in_usd` | exit / slippage risk — thin liquidity is real risk |
| **Unlock overhang** | next-30d token unlock / mcap | imminent dilution overhang |
| **Counterparty screen** | pool age + size | a *coarse structural screen* — age · size, **not a contract audit** |

`UNVERIFIED` dominates: on `SAMPLE` data or when the flagship axis is uncomputable, no definitive verdict is issued — a `SAMPLE` "fail" is not a verified fail.

### Coverage — three money verticals, honestly

| axis | stablecoin-yield | lending | delta-neutral |
|---|---|---|---|
| yield-reality · tvl-trend | ✓ | ✓ | n/a |
| peg | ✓ (stable) | ✓ (stable) | n/a |
| liquidity-depth | ✓ (central) | n/a | n/a |
| unlock-overhang | ✓ (if reward schedule) | ✓ (if schedule) | n/a |
| counterparty | ✓ | ✓ | n/a |
| funding-regime | n/a | n/a | ✓ |

Data is keyless-first — **DeFiLlama** (yield · TVL · peg · the full pool universe for the any-pool lookup), **Hyperliquid** + the free **dYdX** v4 indexer (funding), **GeckoTerminal** (liquidity depth), **Chainlink** (block-pinned REAL★ prices) — so the tool demos with zero setup. A dead endpoint / rate limit / malformed body degrades to last-good or `SAMPLE`, never a crash, never a fabricated value.

### Knowing the kind — the catch the general axes cannot see

The general axes were built for lending and stable-yield pools. Four DeFi domains hide a risk they cannot see, so ORGΛNON classifies each subject **conservatively** (an ambiguous or novel subject stays *unclassified* — a wrong lens is a wrong answer) and, where the kind is known, renders **one additional honest line** in the same grammar as the rest — a fact, never advice, and never a change to the verdict:

| Domain | The catch it names |
|---|---|
| **Synthetic stables** (Ethena · crvUSD · GHO) | **Yield-source attribution** — a "stablecoin yield" that is really short-vol perp-funding carry, with the funding-flip census: *negative in N of M periods; when it flips, the yield inverts and the peg takes the strain.* |
| **LST / LRT** (stETH · weETH · ezETH) | **The redemption gap** — the depeg hides between the on-chain redemption rate (REAL★) and the thin secondary price: *at par needs the queue; now takes the pool.* |
| **Looped / CDP** (recursive leverage) | **Effective leverage + distance-to-liquidation** — a headline APY undressed: *30% is 8× levered; a 12% collateral move liquidates you.* |
| **RWA** (Ondo · Maple · Centrifuge) | **The structural cap** — the collateral settles off-chain and nothing on-chain can verify it, so a clean scorecard is *not* evidence of safety: *we cannot see the thing that matters.* |

**Fired at its own graveyard.** The complete, unmodified engine is replayed against real historical collapses at pinned archive heights and records what it *would* have rendered — every hit, every **miss**, and every honest gap (a miss is the most valuable output; a backtest that only ever confirms is rigged). On the June-2022 stETH depeg it rendered a real ~5.7% redemption gap on the pre-collapse chain state; on a real off-chain credit default it rendered *nothing* adverse — which is exactly why the RWA structural cap exists.

## The opt-in Stamp

The Reality Check answers *"is this yield real?"* The **Stamp** answers a different, orthogonal question with the frozen anti-PBO adjudicator — *"does this pool's recorded track record survive an overfit stress test?"* — as a **distinct** verdict (`GO` · `NO-GO` · `INSUFFICIENT` · `UNAVAILABLE`), never conflated with `SOLID`/`CAUTION`/`AVOID`. It is **opt-in and off the mass path** (a scorecard render invokes it zero times), it **invokes the byte-frozen core** (never edits it), and it is honest on short history (`INSUFFICIENT`, never a fabricated `GO`). A `GO` is a floor on doubt about statistical robustness — **not** a safety verdict.

Two deterministic, off-path sub-scores refine the Stamp's reason (never a scorecard axis, never a new verdict word) and make a *clean* `GO` **harder** to earn:

| Sub-score | What it measures | Tiers |
|---|---|---|
| **Decay half-life** | serial persistence of the recorded return signal (the lag-`k` autocorrelation fit to `ρ₀·e^(−k/τ)`, `t½ = τ·ln2`) — a traceable time-structure vs. fee-chasing noise, **not** the average carry | `≥ 5` periods **traceable** · `< 5` **short-lived** (a clean `GO` is fenced) · short/degenerate/`SAMPLE` **insufficient** |
| **ICIR consistency** | how *steadily* the edge holds across the strategy's own periods (`mean/std` of the recorded periodic edges) — a **within-strategy temporal** measure, **explicitly not** the cross-sectional factor-ranking IC of the literature | `≥ 0.1` **consistent** · `< 0.1` **lumpy** (a clean `GO` is tempered) · degenerate/`SAMPLE` **insufficient** |

A clean `GO` now needs the track record to survive deflation **and** show a traceable half-life **and** hold acceptable consistency — three independent hurdles. Both sub-scores are pure functions over the recorded series (no model, no random), scored only on `REAL` data.

## The Ask Console

A grounded front door: ask about any recorded strategy in your own words and get a register-tailored answer whose **every number, verdict, and fact is engine-sourced**. The AI is the dumbest component — it maps the query to a **closed intent set** and *phrases* the deterministic engine's facts; it never computes a metric, decides a verdict, or fills an `UNVERIFIED` gap. The output runs a **groundedness gate** (every number/claim must match a returned fact) plus a verdict guard; any miss rejects the answer **wholesale** → the deterministic template stands.

- **AI-optional.** No key → deterministic mode, honestly labeled ("AI phrasing off"). The console is fully usable keyless.
- **BYOK.** Google AI Studio (Gemini) · OpenAI · Anthropic · any OpenAI-compatible base URL · Groq (`llama-3.1-8b-instant`), selected from env. A dedicated rate-limit queue + retry/backoff keeps a free tier from ever surfacing a 429.
- **Key-safe.** Keys are server-side env-only (a gitignored `.env`; see `.env.example`), sent only in the transport header — never in the client bundle, a log, the prompt, or a served page.

```bash
./organon.sh ask "is aave-v3 USDC safe?"          # or open /ask in the browser
./organon.sh stamp <poolKey>                       # opt into the overfit Stamp (GO/NO-GO/INSUFFICIENT + decay + ICIR)
```

## How it works

```
  a real strategy (all three verticals)
          │
          ▼
  ┌──────────────────┐   keyless: DeFiLlama · Hyperliquid · GeckoTerminal
  │  real PIT data    │   every value REAL (recorded) or SAMPLE (labeled)
  └────────┬─────────┘
           │ resolved through the append-only, hash-chained record
           ▼
  ┌──────────────────┐   pure (facts)→row on hash-locked thresholds; NO inference
  │  deterministic    │   yield-reality · TVL · peg · funding · liquidity ·
  │  scorecard        │   unlock · counterparty — n/a where it doesn't apply
  └────────┬─────────┘
           │ the verdict falls out of the material rows (never hand-written)
           ▼
  ┌──────────────────┐   SOLID / CAUTION / AVOID / UNVERIFIED, both registers
  │  verdict + x-ray  │   consistency-checked; the LLM may phrase, never reason
  └──────────────────┘
```

- **The verdict is derived, never hand-written.** It is machine-derived from the rows; a flattering hand-written summary is caught by the consistency check.
- **The moat compounds.** A repeatable capture cadence appends only `REAL`, content-addressed, hash-chained snapshots — a competitor can copy the risk lens overnight but cannot retroactively manufacture a timestamped record of *what was real, and when*. A backfill/retro cannot verify.
- **Provenance is the currency of "real."** A `REAL` label requires a nonce-anchored content hash; an unprovenanced value is `SAMPLE`, never a fabricated payload.

## Capability matrix

Advertised scope equals actual scope. Every capability below is proven by the test battery; every deliberate absence is linked to a parked follow-up (`data/studio/parks-register.json`). This block is generated from code (`bun run script/render-matrix-readme.ts`) and a test fails if it drifts from reality.

<!-- CAPABILITY-MATRIX:START -->
| Capability | Status | Detail |
|---|---|---|
| Register a strategy proposal as a trial in an append-only, hash-chained ledger | ✅ PRESENT | proven-by-battery |
| Adjudicate a submitted spec (caller-supplied returns) to an honest verdict — never a GO unless earned | ✅ PRESENT | proven-by-battery |
| Family-size deflation of the DSR bar — iterating makes acceptance HARDER (anti-PBO) | ✅ PRESENT | proven-by-battery |
| The frozen verdict core (6 .py + loop.ts), byte-identical to its monorepo origin | ✅ PRESENT | proven-by-battery |
| Serve the verdict byte-identically across direct call, HTTP, and MCP (thin transport) | ✅ PRESENT | proven-by-battery |
| A durable ledger that survives process death (write-then-invoke, restart remembers) | ✅ PRESENT | proven-by-battery |
| Served submissions persist and survive a restart (first contact preservable) | ✅ PRESENT | proven-by-battery |
| Forward clocks that RESTART never reconstruct; a discontinuity is rendered, never smoothed | ✅ PRESENT | proven-by-battery |
| Refuse a malformed/hostile spec BEFORE registration (rejection boundary, ledger count unchanged) | ✅ PRESENT | proven-by-battery |
| No signing/settlement primitive anywhere; nothing signs, nothing paid, nothing closed | ✅ PRESENT | proven-by-battery |
| Zero powered verdicts — a fixture-only battery; no live/paid inference in the verdict path | ✅ PRESENT | proven-by-battery |
| Capture real credential-free market data (DefiLlama lending) into a standalone-native PIT store, hash-chained + nonce-anchored (cannot fabricate or retro-capture) | ✅ PRESENT | proven-by-battery |
| Run the real-data LENDING backtest, byte-equivalent to the frozen monorepo oracle (differential-proven, direction-blind) | ✅ PRESENT | proven-by-battery |
| Produce REAL-PIT returns with traceable snapshot provenance (not ILLUSTRATIVE) — a REAL-PIT NO-GO on real data is the product working | ✅ PRESENT | proven-by-battery |
| The rewritten TS transform proven byte-identical to its ORIGINAL monorepo transform in a sandbox (the D-DIFF asterisk retired at the letter — 'oracle-judged' true of the port) | ✅ PRESENT | proven-by-battery |
| Run the real-data FUNDING backtest via credential-free freepit T1 (Binance immutable dumps, checksum-verified), byte-equivalent to the frozen monorepo transform + sidecar (differential-proven) | ✅ PRESENT | proven-by-battery |
| The GOAL CONSOLE — one interactive screen where a non-expert types a plain-English goal and receives an honest verdict card + plain-language report (display-only, write-then-invoke, honest failure states) | ✅ PRESENT | proven-by-battery |
| The JOINED LOOP — a plain-English goal → the free-model agent path → a REAL-PIT verdict with traceable provenance → the report, the verdict relayed verbatim (the model cannot bless; a NO-GO on real data is the product working) | ✅ PRESENT | proven-by-battery |
| Research enters ONLY by ratification with pre-registered flip-criteria — an adoption-as-prose, a park without its designed experiment, or an unratified build artifact is refused (research-worship made structurally impossible) | ✅ PRESENT | proven-by-battery |
| Refusals that EXPLAIN themselves (the Fundamental-Law breadth panel — why not yet) and DATE themselves (a derived, hedged ETA range — when, honestly), advisory beside the verdict, deriving nothing, moving no verdict | ✅ PRESENT | proven-by-battery |
| Overfitting measured a SECOND independent way — CPCV (PBO + OOS-Sharpe) advisory beside the frozen gates, golden-proven both directions, disagreements rendered as information, promotion parked (an advisory that cannot become a lever) | ✅ PRESENT | proven-by-battery |
| Complexity that pays its own bill — the EXPERIMENTAL VoC proposer charged its effective degrees of freedom behind a noise wall with a live kill-switch, every exploration charged, the proposer touching specs never verdicts | ✅ PRESENT | proven-by-battery |
| The first CROSS-VENUE domain at its true tier — the CeFi-DeFi funding basis tiered at MIN(legs) (Binance T1 vs Hyperliquid T2-forward), fixture-proven, retro-history refused, DELIVERED under the ATTEMPT law | ✅ PRESENT | proven-by-battery |
| REACHABILITY AS LAW — every user-facing capability is proven reachable by a console-path traversal (fresh serve → real interaction → rendered result → a failure state); a census with a seeded catch; the gatekeeper refuses module-only evidence on a user-facing criterion (U-SURFACE) | ✅ PRESENT | proven-by-battery |
| The GUIDED BUILDER — a third door: compose the spec yourself, field by field, over the existing primitives, with conservative honest defaults and declared lineage — born reachable (its gate passes only on a user's traversal) | ✅ PRESENT | proven-by-battery |
| The park protocol's full circle — two long-parked questions ANSWERED under criteria hash-checked unchanged, outcomes derived not asserted, each disposing its park (the ensemble legitimate-with-adjustment; the shared-ledger incoherent, parked) | ✅ PRESENT | proven-by-battery |
| Walls at their own written depth — the noise battery swept across penalties, venues at a formalized capture floor, and fresh-clone proofs pristine forever (no inherited environmental luck) | ✅ PRESENT | proven-by-battery |
| Summary numbers machine-derived from their artifacts (a hand-typed figure that disagrees is caught) + a ratification table that receives its own changes of mind (append-only supersessions) | ✅ PRESENT | proven-by-battery |
| The reachability law COMPLETE on both halves — a pinned user-facing lexicon auto-flags user-facing criteria (the executor's discretion made auditable, never silent), the census runs at every checkpoint over the capability diff (a built-but-unreached capability is caught the checkpoint it appears — the W7-01 class extinct by construction) + a one-time FULL re-census over the whole matrix and every screen | ✅ PRESENT | proven-by-battery |
| Compose a FUNDING strategy yourself in the Guided Builder (venue · interval · side) over the delivered funding primitives — conservative honest defaults, an invalid interval refused before registration, the verdict the frozen core's — born reachable (its gate passes only on a user's console-path traversal) | ✅ PRESENT | proven-by-battery |
| Compose a cross-venue BASIS strategy in the Guided Builder with the weakest-leg tier MIN(legs) and EXPERIMENTAL shown INLINE before you compose (a basis is only as strong as its weakest leg — you see that up front), a mismatched-venue pair refused — the scope law's cure, cleaner than the narrowing it cured | ✅ PRESENT | proven-by-battery |
| Pool a portfolio of adjudicated strategies (screen 10) where the pool is a registered trial charged the UNION's correlation-adjusted K_eff — not the raw count: it ratchets on every member swap, recomputes K_eff as time accrues, carries a mandatory stress caveat, dies by kill-switch if pooled noise ever survives it, refuses recursion, and renders 'adds nothing' when its members are near-duplicates — the only way to look diversified is to be diversified | ✅ PRESENT | proven-by-battery |
| Read the DEFLATION BASIS on every verdict, leaderboard row, and pool report — the n it was deflated against, the scoping, and a neutral comparability note — so even a weakly-tested bar is legible down to the n it was tested against (display-only; it states, it never judges) | ✅ PRESENT | proven-by-battery |
| The whole system walked as a stranger would meet it, through all doors incl. the pool composer — the walk that shipped pooling aimed its own laundering theme at the pool hardest and converged (CONVERGED-7) only when its worst enemy found nothing twice; the one finding it did surface (the swap ratchet not reachable through the door) was root-caused, fixed, and re-tested | ✅ PRESENT | proven-by-battery |
| Every verdict, failure, and kill-switch explains itself in BOTH languages — plain and quantitative — from one machine-derived fact table the two renderings cannot disagree about, with an AI paraphrase allowed only as far as a groundedness verifier can follow (it may phrase, never reason; reject wholesale on any unmatched number or claim) | ✅ PRESENT | proven-by-battery |
| One honest command from a cold clone to the web door — ./organon.sh checks prerequisites (never installs), verifies, and opens the door ONLY when the house is provably in order (else it says exactly which requirement is unmet — no dead button, no launch over red) | ✅ PRESENT | proven-by-battery |
| The pool's member SELECTION is priced — choosing K strategies of M candidates is search, and the ledger now counts it (a selection surcharge derived by pre-registered experiment, not by vibe); a pool can no longer look strong by cherry-picking its members | ✅ PRESENT | proven-by-battery |
| The Guided Builder's FUNDING door adjudicates REAL captured T1 funding data (Binance freepit) with traceable provenance — REAL-PIT where the data exists, ILLUSTRATIVE where it genuinely does not, never a mislabeled REAL-PIT and never a quietly-upgraded tier | ✅ PRESENT | proven-by-battery |
| The identity truth is printed where users read the bar: author identity is self-declared and not verified (the family-ratchet is per declared author, the rate limiter per connection) — the exposure stated plainly, never reassured away | ✅ PRESENT | proven-by-battery |
| The whole system walked as a stranger would meet it, BOOTSTRAPPED THROUGH THE RUNNER, across every door — and a novice, given only the plain WHY of a refusal, can say back in one correct sentence why it failed (CONVERGED-8, the WHY panel reachable through every served door) | ✅ PRESENT | proven-by-battery |
| the RWA + fee-yield real-data PIT backtests + risk-scoring + the full universe registry | ❌ ABSENT | the RWA + fee-yield real-data PIT backtests + risk-scoring + the full universe registry — the monorepo runner's accrualEquity(RWA) / own-data RWA execution path + the fee-yield discovery panel, not carried in the standalone (LENDING landed V9 differential-proven — engine-port-differential; FUNDING landed V10 via freepit T1, differential-proven — funding-port-differential; the dead fee-yield discovery-panel runtime was REMOVED in the honesty layer, never wired to a captured snapshot — feeyield-attempt-v10.json records the prior attempt) (park P1-1 · the data-plane follow-up sprint (fee-yield: re-transplant the panel + pull + capture a ≥120-day snapshot; RWA: the credential + rigor)) |
| own-data RWA re-execution | ❌ ABSENT | own-data RWA re-execution — the rwa-allocation family is un-executable in the standalone (the dead reexec.execRwa stub was removed in the honesty layer; the family falls through to null); own-data verdicts cap at V0/CANNOT-VERIFY-DATA (fail-safe, never a false V2) instead of running the engine backtest (park P1-1 · the data-plane follow-up sprint) |
| regenerating the pinned RWA verdict | ❌ ABSENT | regenerating the pinned RWA verdict — script/rwa-verdict.ts + its engine (Loop/Verdict/DataAdapter/Universe) live in the full monorepo, NOT here; the standalone carries only the frozen.ts PIN. Phase-1 forensics classified the drift ENVIRONMENTAL (forensics-rwa.json): the pin STAYS NOT-YET, the RWA env is pinned (requirements-rwa-engine.lock), and full byte-regen is BLOCKED on the absent pinned data/snapshot + the absent FRED credential (the two-way door, D-TWOWAY) (park P0-1 · the integrity-reconciliation / data-plane follow-up) |
<!-- CAPABILITY-MATRIX:END -->

## Quick start

**Prerequisites:** [Bun](https://bun.sh) ≥ 1.3, Python 3 (for the backtest sidecar; `numpy` + `scipy`).

```bash
# 1. install JS deps
bun install

# 2. set up the Python sidecar venv (numpy + scipy)
python3 -m venv src/backtest/py/.venv
src/backtest/py/.venv/bin/pip install numpy scipy

# 3. run the test battery (walls + capability floor)
./organon-studio-test.sh

# 4. launch (the Shelf + the Reality Check + the Ask Console)
./organon.sh launch                # → http://localhost:4444  (/ · /check/:key · /ask · opt-in /stamp/:key)
```

`./organon.sh` refuses to open the door until the house is provably in order, and when it refuses it says exactly why. Optional — capture real, credential-free data to seed and compound the moat (no API key):

```bash
bun run script/capture-cadence.ts     # refresh all three verticals into the PIT record (REAL-only, never backfills)
```

Optional — the Ask Console phrases with an LLM if you supply a key (**BYOK, never required**). Copy `.env.example` → `.env` (gitignored) and set any one of `GROQ_API_KEY` · `GOOGLE_AI_STUDIO_KEY` · `OPENAI_API_KEY` · `ANTHROPIC_API_KEY`. With no key the console runs in deterministic mode. Keys are read server-side only and never leave the transport.

## Usage

### The Reality Check (interactive)

`./organon.sh launch` and open `http://localhost:4444`. Browse the Shelf, open a card for its Reality Check, toggle Simple/Pro, and follow the provenance link to see what was real and when. The verdict is derived from the rows on real recorded data — a `SAMPLE` reading renders `UNVERIFIED`, never a mislabeled `REAL`.

### Ask in plain language · opt into the Stamp

```bash
./organon.sh ask "is aave-v3 USDC safe?"     # grounded NL answer; every number/verdict engine-sourced (/ask in the browser)
./organon.sh ask "aave USDC vs compound USDC" # compare · "what is deflation?" (define) · "what can you check?" (coverage)
./organon.sh stamp <poolKey>                  # the opt-in overfit Stamp: GO/NO-GO/INSUFFICIENT + the decay half-life + the ICIR
```

In the browser, the Ask screen shows an honest "AI on/off" badge; a Pro **raw toggle** renders the pure engine facts with zero phrasing (fully reproducible). The Stamp is a Pro drawer of the Reality Check (`/stamp/:key`) — a separate verdict, never conflated with the scorecard's.

### Verify the numbers

```bash
./organon.sh verify        # regenerate the evidence bundle + diff it against the committed copy (non-zero on mismatch)
```

Regenerates and reproduces the battery count, the frozen-core git-clean proof, the verdict differential, and the deterministic scorecard, and confirms every headline number resolves to a backing artifact under `data/honesty/evidence/`. On a fresh clone the environment-independent artifacts still reproduce; the live capture re-fetch is skipped offline (disclosed).

### The strategy engine + Goal Console (the foundation)

The honest engine underneath also serves directly — type a plain-English goal, get a verdict card + a two-sided report; the same physics over HTTP (write-then-invoke; byte-identical to the direct call and the MCP tool):

```bash
bun run script/serve-studio.ts        # the internal engine + Goal Console → http://localhost:4319
```

## Project structure

```
src/
  organon/       frozen-set manifest + integrity primitives (the single source of truth)
  ledger/        the append-only, hash-chained trial ledger
  backtest/      the TS↔Python bridge + the frozen Python sidecars
  dataplane/     the PIT store, the provenance record (the moat), the feed bridge
    providers/   keyless clients — DeFiLlama, GeckoTerminal, Chainlink, dYdX (one small pure fn per endpoint)
  analytics/     scorecard.ts (the deterministic risk axes + verdict), explain.ts (the WHY engine + groundedness verifier)
  contract/      the governance read (who holds the upgrade key) + the deterministic contract screen over verified source
  domain/        the conservative domain classifier + the four catch axes (yield-source · redemption-gap · leverage-distance · off-chain-opacity)
  plane/         the sovereign data-plane (own-RPC funding · events · state) beside the rented breadth
  ask/           the grounded Ask Console — router (closed intents) · tools · answer · phrase · provider (BYOK)
  strategy/      the StrategySpec schema
  attest/        external-claim attestation + tiering
  studio/        reality.ts (the 3 screens), stamp.ts (the opt-in Stamp), decay.ts + icir.ts (the depth sub-scores),
                 evidence.ts, surfaces, routes, walls machinery
test/
  walls/         the integrity walls (frozen bytes, ledger bypass, no-signing, gates, …)
  organon/       capability-floor + behavior tests (incl. the honesty_* + evidence_bundle walls)
script/          serve, capture, verify, build-evidence, differential, and tooling entry points
docs/            the power-floor derivation (for external audit) + the logo asset
data/            the committed provenance chain, the evidence bundle, pins, and capability inventory
```

## Design principles

ORGΛNON rests on a short list of non-negotiables enforced by tests, not convention:

| Principle | Enforced by |
|---|---|
| The verdict core is frozen and byte-identical | `core_byte_identity` wall |
| Every headline number regenerates + diffs clean | `evidence_bundle` wall + `./organon.sh verify` |
| The verdict is machine-derived, never hand-written | `honesty_scorecard` consistency check |
| An inapplicable axis is `not-applicable`, never a fabricated pass | `honesty_coverage` wall |
| A `REAL` label requires provenance; a shown-but-unrecorded value halts | `honesty_record` / `dataplane_store` tests |
| The moat appends `REAL` only; a backfill/retro cannot verify | `Capture.Service` chain (nonce-anchored) |
| No model in a verdict, an axis, or the record | `honesty_scorecard` paraphrase guard |
| The Ask AI phrases, never exceeds — a fabricated number/verdict rejects the answer wholesale | `ask_grounded` groundedness gate + verdict guard |
| The Stamp is off the mass path; decay + ICIR are reason-only, never a scorecard axis or a new verdict word | `honesty_stamp` / `persistence_redteam` (S16/S22/S23) |
| The tool knows the kind of thing it sees; a catch axis is info/context and never moves a verdict; an ambiguous subject stays unclassified | `domain_classify` / `domain_registry` / `catch_axes` walls (S67) |
| An RWA is never blessed `SOLID` — the structural cap is the Operator's pen, never agent-installed | `rwa_cap` wall (S69) |
| The moat is fired at real collapses unmodified; a miss is reported louder than a hit, never buried | `backtest` wall (S68) |
| API keys are server-side env-only — never in the bundle, a log, the prompt, or a served page | `ask_grounded` key-safety (S20) + gitignored `.env` |
| Advertised scope == actual scope | `capability_matrix` wall |
| Nothing signs, is paid, or is closed | `no_signing_grep` wall |
| History is permanent; prevention is the medicine | `precommit_prevent` wall + `.githooks/pre-commit` |

Enable the pre-commit prevention hook (blocks oversized blobs, inline raw data, and committed credentials):

```bash
git config core.hooksPath .githooks
```

## Development

```bash
./organon-studio-test.sh                 # the studio trust battery (walls + capability floor)
./organon.sh verify                      # regenerate + diff the evidence bundle
bun run script/render-matrix-readme.ts   # regenerate the capability matrix block
```

## License

**Proprietary — closed source.** © 2026 Babar Hashmi. All rights reserved.

This repository and its contents are proprietary and confidential. No license is granted, whether express or implied, to
use, copy, modify, merge, publish, distribute, sublicense, or sell any part of this code. It is published here for
evaluation and reference only. For any other use, contact the author for written permission.
