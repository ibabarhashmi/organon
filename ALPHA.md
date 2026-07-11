# ORGΛNON — CLOSED ALPHA · the tester guide

You were invited to test **the honest DeFi Reality Check**: a tool that answers one question — *is this yield real, and what could kill it?* — with machine-derived verdicts it can prove it didn't make up. This guide tells you the truth about what works, what degrades, and what is deliberately parked.

## The first ten minutes

```
git clone <repo> && cd organon-studio
./organon.sh setup      # the wizard: deps · Python sidecar · optional AI keys (masked) · doctor
./organon.sh launch     # the Reality Check → http://127.0.0.1:4444
```

- **Keys are optional.** With zero keys the tool is fully functional: every verdict, every number is the engine's. An AI key only buys nicer *phrasing* of the same facts (the Ask console); it is disabled honestly without one.
- **Key safety:** the wizard masks your paste, validates with one minimal call (opt-out offered), writes `.env` with `chmod 600`, and never logs a key. Every log path runs through a scrubber that is *tested* to be unable to print a key.
- **Privacy:** Google's free AI-Studio tier may use prompts for product improvement — the wizard tells you this before you paste that key. Paid API tiers of the supported providers don't train on API traffic by default.
- **First launch looks empty on purpose.** A fresh clone has no recorded market data, so the Shelf boots in labeled **SAMPLE** mode and most verdicts read **UNVERIFIED** — that is honesty, not breakage. Click **↻ refresh** (or run `bun run script/capture-dataplane.ts`) to record live keyless data; verdicts firm up as the record grows.

## What a paid key buys (and what it can never buy)

- A **paid DeFiLlama Pro key** (`DEFILLAMA_PRO_API_KEY`) deepens the *facts*: premium endpoints and longer histories enter as tier-stamped REAL data.
- A **paid model tier** (`AI_PAID_TIER=1` with your provider key) buys better-shaped, less-truncated *explanations*.
- **Neither can buy a different verdict.** The capability-parity differential (S48, in the battery) computes every shelf verdict + the Stamp under zero-key, free-key, and paid-key profiles and asserts they are **byte-identical**. Diff your verdicts against a keyless friend's — that's the guarantee, and we test it.

## The doors

| Door | What | Status |
|---|---|---|
| `http://127.0.0.1:4444` | the Shelf · the Reality Check · the Ask console (the conscious 3 screens) | the product; rate-limited; localhost by default |
| `http://127.0.0.1:4319` | the Studio (Goal Console · Guided Builder · pool composer) — `bun run script/serve-studio.ts` | open for the alpha on localhost; **if you expose it beyond localhost, set `STUDIO_TOKEN`** (Bearer auth on mutating routes) |
| `./organon.sh` verbs | `setup · status · check · doctor · launch · verify · stamp <pool> · ask "<q>" · --version` | the CLI |
| MCP tools | 6 handlers, byte-identical to the `/studio` API | not network-served by default (in-process only) |
| `organon-run.sh` / `organon-report.sh` | the parked RWA pipeline's old wrappers | consciously gated — they refuse honestly |

Both servers bind **127.0.0.1 by default**; exposure is an explicit `HOST=0.0.0.0` opt-in.

## When something breaks

```
./organon.sh doctor
```

Copy-paste the whole block into your bug report — it carries versions, git sha, pins integrity, venv/deps/ports/key-shape (names and lengths only, never values). If the tool refuses to launch, the refusal names the exact unmet requirement; `./organon.sh verify` re-proves the committed evidence bundle on your machine.

## Updating during the alpha

```
git pull && ./organon.sh setup && ./organon.sh verify
```

`--version` names your build (`package version · git sha · PINS_SHA`) — include it in reports.

## Platform honesty

- **macOS / Linux:** first-class. Bun ≥ 1.3 and Python 3 (≥ 3.9) required; the wizard builds the sidecar venv from the pinned lockfile.
- **Windows:** via **WSL only** — documented, not pretended. On Debian/Ubuntu/WSL, `python3 -m venv` may need `sudo apt install python3-venv`; setup surfaces the real error if so.
- **No Docker.** There is no Dockerfile in this tree; container packaging is not part of the alpha (stated, not implied).

## The contract screen — who holds the upgrade key (and what it does not claim)

Beside the yield scorecard, the Reality Check resolves **who can change a pool's code**. It reads the EIP-1967 admin slot over the tool's own free RPC rotation and classifies the upgrade key conservatively — **EOA** (a single key can replace the logic — the damning case), **SAFE / TIMELOCK** (gated — verify the signers), **IMMUTABLE** (proven at a pinned block that no upgrade path exists — the strongest reassurance, granted only on a three-condition bytecode proof; any flaw in an immutable contract is *permanent*), or **UNRESOLVED** (we refuse to guess). A zero admin slot is UNRESOLVED, **never** EOA.

**What the axis discriminates, and what it does not claim.** It discriminates a real clean pool (compound-v3 → TIMELOCK-gated; aave-v3 → UNRESOLVED / — once proven — IMMUTABLE) from a labeled **synthetic** EOA-admin + ungated-upgrade control — the live EOA-admin danger class is extinct among survivors (0 of ~50 mainnet proxies), so a real live EOA-admin pool cannot be exhibited. **The axis flags the upgrade-key surface** (who can replace the code, via the 1967 admin slot). It does **not** predict depegs, oracle failures, market-mechanism collapses, or upgrade authorities held outside the 1967 admin slot (e.g. a UUPS owner in implementation storage). A clean governance line is **never** a verdict of safety. `GET /postmortems` carries this claim verbatim; `data/honesty/governance-claim.json` is its live state.

**Methods cite their primary sources.** The Stamp's significance is the Deflated Sharpe Ratio (Bailey & López de Prado, *The Journal of Portfolio Management* 2014; SSRN 2460551); the multiple-testing deflation follows the PBO framework (Bailey, Borwein, López de Prado & Zhu, *Journal of Computational Finance* 2016; SSRN 2326253). Load-bearing methods cite the paper, never a blog; reading references (e.g. Aligrithm) are **inspiration-only** and integrate nothing (`data/honesty/aligrithm-filing.json`).

## What is deliberately parked (you will not find these, on purpose)

The LLM strategy-proposer as a product surface (behind its noise wall + kill-switch) · the CSCV/PBO companion metric (pinned behind the ≥ 20–50-trials-per-family trigger, implementation absent) · reports/API productization · execution/custody (nothing signs, ever) · archive-node RPC (the one-subject rug capture does not unpark it) · calibration scoring · new Stamp statistics. The POOL-EVENTS plane path is built and fence-proven but **not live** (D21). Every deviation from the blueprints lives verbatim in `data/honesty/deviations.json` (D1–D31).

## Telemetry, feedback, and the re-score post-mortems

- **Telemetry is OFF by default.** It only captures if you set `ORGANON_TELEMETRY=1` **and** accept the disclosure (`./organon.sh telemetry --disclosure` then `--accept`). It records a **pinned manifest** — screen · intent · verdict-word reached · latency · degrade-event · which door · SAMPLE-ratio — and **never** keys, strategy inputs, typed pool addresses, prompt text, or PII. Every event is scrubbed. It stays on your machine: `./organon.sh telemetry --show / --export / --purge`. It leaves only if you *separately* opt in with `ORGANON_TELEMETRY_SHARE=1` — a second, explicit consent.
- **Feedback** is the same posture: `./organon.sh feedback --screen reality --useful 1 --trusted 1 --missing "…"` (or `POST /feedback`) records your structured verdict-on-a-verdict, scrubbed and local-first, shared only on the same second consent.
- **The re-score post-mortems** (`GET /postmortems`) run ORGΛNON's own engine against the Stream / Elixir / Resolv 2025-26 collapses in **two explicitly-labeled layers, never blurred**: **RECONSTRUCTION (all-SAMPLE)** — *here is what the engine would have flagged at the collapse*, computed on reconstructed SAMPLE facts (public reporting, not a re-fetch of the delisted pools); and **AFTERMATH (REAL-as-fetched)** — *here is what the engine renders on the pool's real current state* (REAL-AS-FETCHED-NOW, never as-of-collapse). We do **not** claim "we'd have caught it on real data": the reconstruction is SAMPLE, the aftermath is today's reality — distinct questions, distinctly labeled. Every verdict is the engine's actual recomputed output, never a fabricated number.
- **The probe is graded against a bar set before you arrived.** `data/honesty/probe-kill-criterion.json` pre-registers, numerically, what your cohort's signal must show to continue / pivot / stop — committed before the invites, so the tool can't move its own goalpost.

## What we ask of you

Break it. Paste a wrong key, feed it garbage, probe the second door, grep your logs for your own key (you won't find it — S49 tests that). When it refuses you, it should refuse in a sentence that tells you why; a stack trace where a sentence belongs is a bug we want filed. The one thing it must never do is tell you a comforting lie — if you catch it doing that, that's the bug report we want most.

*Telemetry is **OFF by default** and opt-in only — no analytics SDK, nothing phones home on its own, nothing signs; your keys never leave your machine except to the provider you chose.*
