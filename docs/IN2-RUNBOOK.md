# IN2 — THE OPERATOR'S TWO REAL CYCLES (the runbook)

> **This is documentation, not a product surface.** It is the exact sequence for the Operator (a human) to perform IN2:
> author ONE real manifest of holdings they actually hold, set a thesis in advance, register an exit the engine can check,
> and run the monitor across two confirmed capture boundaries — so the declared success metric ("cycles run, unprompted,
> on real manifests") becomes **greater than zero for the first time.** The agent cannot perform this (LN5 — the agent
> never signs as the Operator, never authors a "real" holding). Only the Operator's own hand makes a real lineage real.

> **Duration: estimated ≤20 minutes — UNMEASURED (X-SHOWN(a)/R-8).** This runbook does NOT claim a measured duration. The
> only artifact that can prove the "≤20 minutes" is the Operator walking it and recording the wall-clock. Until then the
> number is an estimate, labeled as one. A sprint that mints X-SHOWN must not violate it in its own documentation.

---

## Before you start
- A working clone with the venv set up (`./organon.sh setup` if a fresh clone).
- The holdings you actually hold (a pool key + a size + units — e.g. `defillama:pool:<id>`, `1000`, `USDC`).
- A thesis you can state in advance (what you believe will hold true) and an exit criterion the engine can check
  (a peg-floor, a TVL-floor, a funding-sign, a yield-floor — one of the evaluable `Manifest.EXIT_KINDS`).

## The sequence

1. **Open the door.** `./organon.sh serve` (or the reality server) → the manifest door at `/check/:key/edit`. The door
   *refuses and authors nothing*: every field is yours; there is no pre-filled judgment, no "most users choose" nudge.

2. **Author a manifest of your REAL holdings.** Fill the positions (subjectKey · size · units), the thesis (a sentence you
   set in advance), and the exit criterion (kind · threshold · scope). Submit. The `.strict()` schema refuses anything
   malformed *before* registration, with a named reason — it never coerces a default onto a judgment field.
   - This writes a lineage under `data/strategies/trials/<lineageId>.jsonl`. Its first entry is a **SEARCH** (a hypothesis
     authored). It is now a **real lineage** — `Migration.realLineageCount()` goes from 0 to 1, and the Halt's premise
     ("no user exists") is falsified by your own hand.

3. **Set `priorIntent`.** Record what you intend to do (hold / watch / exit-on-breach) *before* the engine judges — so the
   later cycle can tell whether your decision *changed* because of what the engine showed you (the honest signal of use).

4. **Register the exit.** Confirm the exit criterion the engine will check on the cadence (it must be one the engine can
   evaluate — a peg-floor, not "twitter sentiment"). This is what makes a re-observation *meaningful* rather than a re-print.

5. **Run the monitor across TWO confirmed boundaries.** `./organon.sh monitor` — once, then again after the next capture
   boundary (daily-or-slower; the pinned cadence). Each run that re-evaluates the UNCHANGED manifest appends an
   **OBSERVATION** (a cycle run, unprompted). Two boundaries → two cycles → `cyclesRunReal` goes to 2.
   - The monitor *reads, never acts*: it refuses a torn/skewed/concurrent capture (UNJUDGEABLE, stated), and it authors
     nothing — it re-judges the thesis you set and shows the delta.

6. **Read the deltas.** The monitor speaks the cadence deltas in both registers (Simple / Pro) — "exit FIRED", "TVL −x%",
   "funding flipped" — each a FACT that passes the one advice guard (it never tells you what to do).

7. **Record `decisionAfter` / `changedByCompile`.** After reading the deltas, record what you decided and whether the
   engine's output changed your intent. *This is the actual signal the metric wants:* not that a cycle ran, but that a
   cycle ran on a real holding and informed a real decision.

## After
- Re-read the number: `bun -e 'import {Ledger} from "./src/strategy/ledger"; console.log(Ledger.readout())'` →
  `manifests authored (real): ≥1 · cycles run, unprompted, on real lineages: ≥2`. The Halt is falsified: the product has a
  user (you), and the metric is no longer zero.
- If, after doing this, the number does **not** move you to keep using it — that is the kill-criterion's evidence
  (`8b4e094b`), and it is worth as much as a green number. Either answer is honest; a *missing* answer is not.

---

## A SAMPLE walk (clearly labeled — documentation, NOT a form pre-fill)

> This is an **illustrative** example so the shape is legible. It is prose in a doc, never a value pre-filled into the door
> (X-AUTHOR(d) is untouched — the door still authors nothing). Do not copy these numbers; use your own real holdings.

```
SAMPLE — positions: defillama:pool:aa70268e-… · 5000 · USDC
SAMPLE — thesis:    "aave-v3 USDC base yield stays above 2.5% through the next rate cut"
SAMPLE — exit:      yield-floor · 0.025 · portfolio
SAMPLE — priorIntent: "hold unless the base yield breaks the floor"
  → cycle 1 (boundary A): OBSERVATION · base 3.1% · above floor · no delta
  → cycle 2 (boundary B): OBSERVATION · base 2.8% · above floor · TVL −4% · thesis holds
SAMPLE — decisionAfter: "hold" · changedByCompile: false
```
