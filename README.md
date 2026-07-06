<p align="center">
  <img src="docs/organon-logo.png" alt="ORGANON" width="560">
</p>

<p align="center">
  <b>An honest-by-construction strategy engine.</b><br>
  A frozen verdict core, a tamper-evident trial ledger, and real point-in-time data —<br>
  so a strategy earns a verdict it cannot fake.
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#capability-matrix">Capabilities</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#project-structure">Structure</a>
</p>

<p align="center">
  <img alt="runtime" src="https://img.shields.io/badge/runtime-Bun%201.3-black">
  <img alt="language" src="https://img.shields.io/badge/TypeScript-strict-blue">
  <img alt="sidecar" src="https://img.shields.io/badge/sidecar-Python%203-yellow">
  <img alt="verdicts" src="https://img.shields.io/badge/powered%20verdicts-zero%20(by%20design)-brightgreen">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-lightgrey">
</p>

---

## What is Organon?

Organon adjudicates trading/allocation strategies the way a skeptic would: it assumes every strategy is noise until the statistics say otherwise, and it makes the bar **harder** the more you search. It is built so that the honest answer is the *only* answer the machine can produce.

Three properties make that structural rather than aspirational:

- **A frozen verdict core.** The computational core (6 Python modules + one TypeScript loop) is byte-pinned and byte-identical to its origin. A verdict figure cannot silently drift; the integrity wall proves it on every run.
- **A tamper-evident trial ledger.** Every proposal is registered as a trial in an append-only, hash-chained ledger *before* it is scored (write-then-invoke). The **family size** deflates the significance bar, so iterating a strategy makes acceptance harder, not easier (anti-[PBO](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2308659)).
- **Real, point-in-time data — or an honest gap.** Market data is captured into a content-addressed, nonce-anchored PIT store that *cannot* fabricate or retro-capture a value. A missing day stays missing; it is never interpolated. Backtests are proven byte-equivalent to a read-only reference engine (a "differential" a flattering rewrite cannot pass).

The result: **zero powered verdicts are expected and displayed with pride.** A `NO-GO` on real data is the product working — and it is now refusable through a text box by anyone.

## Highlights

- 🧊 **Frozen core** — the verdict math is pinned by sha256 and re-verified every run (`test/walls/core_byte_identity.test.ts`).
- 🔗 **Hash-chained ledger** — append-only, durable across process death, refuses unregistered adjudication.
- 📉 **Anti-PBO deflation** — the DSR bar tightens with family size; re-rooting fragmentation is closed.
- 🛰️ **Credential-free PIT data** — real DefiLlama lending + Binance funding (T1, checksum-verified) captured into a store that cannot fabricate.
- ⚖️ **Differential-proven engines** — the lending and funding backtests are byte-equivalent to a read-only reference; a seeded flattering divergence is caught direction-blind.
- 🖥️ **The Goal Console** — one screen: type a plain-English goal, get an honest verdict card + a two-sided report. The model proposes; it can never bless.
- 🚫 **Nothing signs** — no signing/settlement primitive exists anywhere in the surface.

## How it works

```
  plain-English goal
          │
          ▼
  ┌──────────────────┐   proposes a schema-valid spec (NO authority)
  │   agent layer     │   free/fixture model — the model cannot bless
  └────────┬─────────┘
           │ write-then-invoke (register BEFORE adjudicate)
           ▼
  ┌──────────────────┐   append-only, hash-chained, family-counted
  │   trial ledger    │
  └────────┬─────────┘
           │ point-in-time series (no lookahead, gap-honest)
           ▼
  ┌──────────────────┐   differential-proven byte-equivalent to a read-only
  │  engine (sidecar) │   reference engine; driven by the frozen Python core
  └────────┬─────────┘
           │ returns
           ▼
  ┌──────────────────┐   the verdict is the frozen core's, relayed VERBATIM
  │  verdict + report │   → verdict card + plain-language, two-sided report
  └──────────────────┘
```

- **Renderers display; they never derive.** Screens render API/ledger JSON; a screen that computed its own number could flatter, so none do.
- **Tiers are earned, never declared.** A caller cannot claim a verifiability tier; the engine derives it.
- **Provenance is the currency of "real."** A `REAL-PIT` label *requires* a nonce-anchored content hash for every series — an unprovenanced series is forced to `BLOCKED`, never a fabricated payload.

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
| the RWA + fee-yield real-data PIT backtests + risk-scoring + the full universe registry | ❌ ABSENT | the RWA + fee-yield real-data PIT backtests + risk-scoring + the full universe registry — the monorepo runner's accrualEquity(RWA) / execRwa path + the fee-yield discovery panel's captured snapshot, still not transplanted (LENDING landed V9 differential-proven — engine-port-differential; FUNDING landed V10 via freepit T1, differential-proven — funding-port-differential; fee-yield's Py3.11/pandas env runs the panel end-to-end but is BLOCKED-on-data, the capture pipeline un-transplanted — feeyield-attempt-v10.json) (park P1-1 · the data-plane follow-up sprint (fee-yield: transplant feeyield-pull + capture a ≥120-day snapshot; RWA: the credential + rigor)) |
| own-data RWA re-execution | ❌ ABSENT | own-data RWA re-execution — reexec.execRwa returns null; own-data verdicts cap at V0/CANNOT-VERIFY-DATA (fail-safe, never a false V2) instead of running the engine backtest (park P1-1 · the data-plane follow-up sprint) |
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

# 4. serve the studio + the Goal Console
bun run script/serve-studio.ts     # → http://localhost:4319
```

Optional — capture real, credential-free market data (no API key required):

```bash
bun run script/capture-dataplane.ts   # real DefiLlama lending pools → PIT store
bun run script/capture-funding.ts     # Binance freepit T1 funding (checksum-verified)
```

## Usage

### The Goal Console (interactive)

Serve the studio and open `http://localhost:4319`. Type a plain-English goal (e.g. *"Earn steady stablecoin lending carry with honest costs"*) and submit. You get a verdict card and a two-sided, plain-language report on real data. The model proposes a strategy; the verdict is the frozen core's, relayed verbatim — an injection in the goal cannot change it.

### The HTTP API

The same physics over the wire (write-then-invoke; byte-identical to the direct call and the MCP tool):

```bash
curl -X POST http://localhost:4319/studio/submit_spec \
  -H 'content-type: application/json' \
  -d '{"spec": { ... }, "returns": [ ... ], "barsPerYear": 365}'
```

Routes: `POST /studio/submit_spec`, `POST /studio/get_verdict`, `POST /studio/preflight`, `POST /studio/attest_claim`, `GET /studio/export`, `POST /console/goal`. Mutating routes accept an optional `Authorization: Bearer <STUDIO_TOKEN>` and are rate-limited + size-capped.

### Verify the record

```bash
bun run script/verify-v3.ts          # re-derive + verify the ledger and the frozen set
```

## Project structure

```
src/
  organon/       frozen-set manifest + integrity primitives (the single source of truth)
  ledger/        the append-only, hash-chained trial ledger
  backtest/      the TS↔Python bridge + the frozen Python sidecars
  dataplane/     the standalone-native PIT store, engine port, funding, adjudication
  strategy/      the StrategySpec schema
  attest/        external-claim attestation + tiering
  studio/        surfaces, routes, screens, agents, console, reports, walls machinery
test/
  walls/         the integrity walls (frozen bytes, ledger bypass, no-signing, gates, …)
  organon/       capability-floor + behavior tests
script/          serve, capture, differential, verify, and tooling entry points
docs/            identity memo + assets
data/            the committed provenance chains, capability inventory, and pins
```

## Design principles

Organon rests on a short list of non-negotiables enforced by tests, not convention:

| Principle | Enforced by |
|---|---|
| The verdict core is frozen and byte-identical | `core_byte_identity` wall |
| Adjudication is register-then-invoke (no bypass) | `ledger_bypass` wall |
| Iterating a strategy makes the bar harder (anti-PBO) | `ledger_laundering` test |
| Nothing signs, is paid, or is closed | `no_signing_grep` wall |
| Advertised scope == actual scope | `capability_matrix` wall |
| A REAL-PIT label requires provenance | `dataplane_store` / `real_returns` tests |
| Backtests are proven against a reference, never asserted | `transform_differential` / `funding_differential` tests |
| History is permanent; prevention is the medicine | `precommit_prevent` wall + `.githooks/pre-commit` |

Enable the pre-commit prevention hook (blocks oversized blobs, inline raw data, and committed credentials):

```bash
git config core.hooksPath .githooks
```

## Development

```bash
./organon-studio-test.sh                 # the studio trust battery (walls + capability floor)
./organon-test.sh                        # the broader suite
bun run script/render-matrix-readme.ts   # regenerate the capability matrix block
```

## License

MIT
