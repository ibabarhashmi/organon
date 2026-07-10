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

## What is deliberately parked (you will not find these, on purpose)

The LLM strategy-proposer as a product surface (behind its noise wall + kill-switch) · reports/API productization · execution/custody (nothing signs, ever) · archive-node RPC · calibration scoring · new Stamp statistics. The POOL-EVENTS plane path is built and fence-proven but **not live** (D21). Every deviation from the blueprints lives verbatim in `data/honesty/deviations.json` (D1–D23).

## What we ask of you

Break it. Paste a wrong key, feed it garbage, probe the second door, grep your logs for your own key (you won't find it — S49 tests that). When it refuses you, it should refuse in a sentence that tells you why; a stack trace where a sentence belongs is a bug we want filed. The one thing it must never do is tell you a comforting lie — if you catch it doing that, that's the bug report we want most.

*No telemetry. Nothing phones home; nothing signs; your keys never leave your machine except to the provider you chose.*
