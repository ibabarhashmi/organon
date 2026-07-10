#!/usr/bin/env bash
# ORGΛNON · test — a SUBSET battery + the Python golden-noise self-test (the overfitting catcher).
# HONEST NAMING (AH8, D22): this runs test/organon/ ONLY — it OMITS test/walls/, so it is a strict
# subset of the CANONICAL battery (./organon-studio-test.sh). Its unique value is the golden-noise
# selftest, which the canonical battery does not run. Surfaces GREEN/RED truthfully; never swallowed.
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/organon-common.sh"

banner "test — SUBSET battery (test/organon/) + golden-noise · the CANONICAL battery is ./organon-studio-test.sh"
RC=0

# 1. TS organon battery (isolated DB via a throwaway XDG_DATA_HOME so it never touches real data).
#    --timeout 30000 honours the repo's declared default (package.json "test"); the bare `bun test`
#    built-in is 5000ms, too tight for this sidecar-heavy suite (several tests run 4–14s) and made the
#    gate flake RED↔GREEN purely on wall-clock — a determinism-thesis gate must not.
step "bun test test/organon/ --timeout 30000  (isolated XDG_DATA_HOME)"
if ( cd "$PKG" && NO_COLOR=1 XDG_DATA_HOME="$(mktemp -d)" bun test --timeout 30000 test/organon/ ); then
  ok "TS battery GREEN"
else
  fail "TS battery RED"; RC=1
fi

# 2. Golden-noise self-test (must run from src/ — module is backtest.py.selftest).
step "python -m backtest.py.selftest  (golden-noise / overfitting catcher)"
if ( cd "$SRC" && "$PY" -m backtest.py.selftest ); then
  ok "golden-noise GREEN — the evaluation layer provably catches overfitting"
else
  fail "golden-noise RED"; RC=1
fi

rule 64
if [ "$RC" -eq 0 ]; then
  panel "trust battery — ALL GREEN"
  pline "$(badge GREEN "TS organon battery + golden-noise")"
  pline "engine trust verified: tests pass and golden-noise catches overfitting"
  pend
else
  panel "trust battery — RED"
  pline "$(badge RED "one or more checks failed — see the output above")"
  pline "the battery is not green; do NOT trust a verdict produced in this state"
  pend
fi
exit "$RC"
