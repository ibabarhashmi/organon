<!--
  ORGΛNON — THE SECOND-HUMAN README (HARDENING V45, P-16/S207/RP-5).
  Limits FIRST. Every STRUCTURAL claim (deps, screens, laws, exit kinds, the tier ladder) is checked against a producer by the
  docs-match-producers wall (src/organon/docs.ts); a claim the wall cannot tie to a producer is a Halt. Every NUMBER that could
  drift is a COMMAND you run, never an embedded figure (RP-5 — the docs join the derivation discipline or they join the debt).
  The whole file passes the ONE GUARD: it describes the TOOL, never a strategy — no advice, no ranking, no "you should".
-->
# ORGΛNON — for the second human

You are the first person to open this who did not build it. Read the limits first. They are the point.

## What this tool will NOT do

- **It will not tell you what to buy, hold, or sell.** It gives no advice and no ranking. It is a *falsifier*, not an advisor — it prices your own search and names what could kill your own thesis. If a sentence here ever reads like a recommendation, that is a bug (a wall catches it).
- **It will not optimize.** No Markowitz and no allocator. Optimization is fenced by construction.
- **It will not manufacture confidence.** It has no leaderboard, no hero APY, and no σ-band on a fat-tailed observable.

## Why it mostly says INSUFFICIENT and UNVERIFIED — by design

A brand-new clone has **no recorded market data**, so almost everything reads `UNVERIFIED` (the Reality Check) or `INSUFFICIENT` (the Stamp). **That is honesty, not breakage.** DeFi track records are short and autocorrelated; certifying an edge at the literature's confidence bar needs more history than most yields have. The tool's default answer to *"is this a real edge?"* is *"not enough evidence yet"* — and it tells you the one thing that would change the answer:

- **SAMPLE → REAL:** run `./organon.sh capture` — a SAMPLE reading becomes a REAL, recorded one the moment it is in the record.
- **UNVERIFIED → a band:** capture on a cadence; the band fills in as observations accrue.
- **INSUFFICIENT → GO:** the Stamp clears only when the observed length exceeds MinTRL **and** the autocorrelation-corrected PSR(N_eff) clears the literature's bar — a real edge, recorded long enough.

Every empty-state render carries its *why* and its *path to judgeable*. You are never left staring at a bare verdict word.

## What it IS

A machine-derived DeFi Reality Check with an append-only record of what was real, and when. Every number it shows, it can regenerate — run `./organon.sh verify` and it reproduces its headline numbers and diffs them against the committed evidence bundle. A number with no backing artifact is a hard failure.

## The tier ladder — which kind of "true" a value is

From strongest to weakest. A value is always labeled by its tier; the tool never mixes them, and a weaker tier can never be dressed as a stronger one.

1. **REAL★** — block-pinned, re-derivable against the chain itself.
2. **REAL-DERIVED** — third-party historical, re-derivable at its round (e.g. a Chainlink `getRoundData`).
3. **REAL-at-timestamp** — an aggregator response at time T (retroactively revisable).
4. **RETROSPECTIVE** — a smoke-test replay against a past collapse.
5. **SAMPLE** — a labeled placeholder, never a fabricated value.

If a dead endpoint means a value cannot be fetched, it renders **UNREACHABLE** — never a silent fallback that quietly changes provenance.

## The three screens

The screen count is a deliberate **3** (you *check*, you do not build — a fourth screen is a conscious stop):

1. **The Shelf** — Reality Cards across the money verticals; a verdict pill, a REAL/SAMPLE badge, a risk word.
2. **The Reality Check** — the x-ray of one strategy: the verdict, the axes, who holds the upgrade key, the provenance history.
3. **The Ask Console** — ask in plain words; every number and verdict traces to a fact (AI-optional, keyless → deterministic).

## The verbs

Run `./organon.sh <verb>`:

| Verb | What it does |
|---|---|
| `check` | prerequisites only (never installs) |
| `setup` | the wizard — deps · the Python sidecar (from the committed `uv.lock`) · optional AI keys |
| `launch` | verify, then open the Reality Check — only when the house is provably in order |
| `verify` | regenerate every headline number + diff it against the committed evidence bundle |
| `verify-chain` | walk every append-only chain, quarantine a torn tail (never delete) — run after any crash |
| `ask "<question>"` | the grounded Ask Console (deterministic without a key) |
| `stamp <poolKey>` | the opt-in overfit stress test (GO / NO-GO / INSUFFICIENT) |
| `capture` | record real, keyless, point-in-time data into the moat |
| `socket` | expose the engine facts to a model client over stdio (no port, no listener, no daemon) |

## Crash-safety, idempotency, honest failure

- **A crash mid-write recovers.** The append-only chains are written atomically; `verify-chain` detects a torn tail, quarantines it to a `.torn` sidecar (**never deletes**), and the verb resumes. Proven with a real `kill -9` at every seam of the write path.
- **The same block twice does not double.** Capture is idempotent — an identical observation is recognized and skipped, disclosed. A *conflicting* value for the same block is a loud integrity halt, never silently resolved.
- **A dead endpoint is honest.** Bounded retries over a pinned understudy list, then `UNREACHABLE` with its attempts — and the endpoint that served a value is recorded per point.

## The constitution, in one page

**17** laws hold and none has been minted for ten sprints; the count is what the tool refuses to grow casually. Structural invariants: **deps 2** (hono + zod — the mass path carries nothing else), **screens 3**, **exit kinds 7**. These are checked against their producers by a wall — this document cannot claim a number the tool does not emit.

The signatures — publishing, inviting, certifying a strategy, amending the law — are **the Operator's**, never the tool's. The tool computes and recommends; a human decides. That is the whole of it.

## The honest terminal state

This tool is **READY** — the machinery survives a stranger's path: it installs on a clean machine, it is crash-safe, it fails honestly, every workflow is transcripted, the sidecar is frozen, and this document is here. It is **UNVERIFIED-BY-A-SECOND-HUMAN** — because until you, no stranger had walked it. The door now has a handle, a signpost, a paved path, a recovery plan, and this page. Whether to take the first step is yours.
