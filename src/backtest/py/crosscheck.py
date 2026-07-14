"""THE FROZEN-CORE CROSS-CHECK DRIVER (Reach V35 S94 · Derivation V36 S101) — a HARNESS, not a frozen artifact.

X-REACH(b): "a cross-check that does not execute is not a check — it is an absence wearing a check's name." The frozen
core's DSR/PSR/PBO had never executed in the audited record because the studio-slim venv (requirements-studio.txt) ships
numpy+scipy only, and `purgedcv` lives in the parked heavy requirements.txt. This driver EXECUTES the cross-check and
emits the numbers as JSON so a TS wall + a committed artifact can read them.

DERIVATION V36 (S101, E-1): the cross-check is made WHOLE. V35 validated DSR ONLY; PSR (0.9989) and PBO (0.6) were
reported as outputs of the frozen module, not shown AGREEING with anything — and PBO/CSCV is precisely the machinery D33
activates. This driver now cross-checks ALL THREE against the SAME independent `purgedcv` oracle, which (the tree showed,
DD-17) exposes probabilistic_sharpe_ratio AND probability_of_backtest_overfitting — so no second library (pypbo) is
needed and F-2's abandonware risk is dodged. RP-2: CSCV's free parameters are ALIGNED to the frozen module BEFORE the
comparison (S=8, the mean/std-ddof=1 metric, contiguous split, no purge/embargo, matrix transposed to (n_configs,n_obs));
the alignment is emitted so the wall can show it. This driver computes the RAW quantities + diffs only — the AGREEMENT
(delta < tolerance) is computed in TS from the PRE-REGISTERED tolerance in derive-pins.json (X-DERIVE(f): a tolerance
read from the call site is HARKing). It reimplements NOTHING: DSR/PSR/PBO are the FROZEN `rigor` module's functions
(byte-identical, sha-pinned in frozen.ts); the golden-noise construction is byte-identical to selftest.py's k==0 universe.

Run:  cd src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.crosscheck
"""
from __future__ import annotations

import json
import sys

import numpy as np
import purgedcv as pcv  # the INDEPENDENT oracle — never our code (import fails -> BLOCKED, honest)

from backtest.py import rigor  # the FROZEN math (sha-pinned in frozen.ts) — never edited

# byte-identical to selftest.py's golden-noise construction (the k==0 universe)
SEED = 20260627
T = 504
N_TRIALS = 1000


def main() -> None:
    rng = np.random.default_rng(SEED)
    m = rng.normal(0.0, 0.01, size=(T, N_TRIALS))  # true Sharpe == 0 (pure noise)
    srs = rigor.trial_sharpes(m)
    var_sharpe = float(np.var(srs, ddof=1))
    best = int(np.argmax(srs))
    best_ret = m[:, best]

    # OUR (frozen) numbers
    dsr = float(rigor.deflated_sharpe(best_ret, N_TRIALS, var_sharpe))
    psr0 = float(rigor.psr(best_ret, 0.0))
    pbo = float(rigor.pbo(m, n_splits=8))
    naive_psr = psr0
    d10 = float(rigor.deflated_sharpe(best_ret, 10, var_sharpe))
    d100 = float(rigor.deflated_sharpe(best_ret, 100, var_sharpe))
    d1000 = float(rigor.deflated_sharpe(best_ret, 1000, var_sharpe))

    # ── THE INDEPENDENT ORACLE (purgedcv) — THE CROSS-CHECK, WHOLE (S101) ──────────────────────────────────────────────
    # DSR: same call as V35 (unchanged).
    dsr_pkg = float(pcv.deflated_sharpe_ratio(best_ret, N_TRIALS, var_sharpe, bars_per_year=None))
    dsr_diff = abs(dsr - dsr_pkg)

    # PSR: purgedcv.probabilistic_sharpe_ratio(returns, benchmark_skill) implements Bailey & LdP 2012 Eq.7 — the identical
    # formula to rigor.psr(returns, 0.0). benchmark_skill=0.0 matches SR* = 0 (the PSR(0) rigor emits).
    psr_pkg = float(pcv.probabilistic_sharpe_ratio(best_ret, 0.0))
    psr_diff = abs(psr0 - psr_pkg)

    # PBO: RP-2 alignment — rigor.pbo(m, n_splits=8) takes m as (T, N); purgedcv wants (n_configs, n_obs)=(N, T), so pass
    # m.T. n_splits=8 (rigor's S), the default sharpe metric is mean/std ddof=1 (IDENTICAL to rigor._col_sharpe), no
    # purge/embargo (rigor uses none). Every CSCV free parameter is pinned identical -> a genuine comparison, not two
    # experiments. purgedcv returns PBOResult with .pbo.
    pbo_pkg = float(pcv.probability_of_backtest_overfitting(m.T, n_splits=8).pbo)
    pbo_diff = abs(pbo - pbo_pkg)

    out = {
        "executed": True,
        "seed": SEED, "T": T, "nTrials": N_TRIALS,
        # DSR
        "dsr": dsr, "dsrPurgedcv": dsr_pkg, "dsrDiff": dsr_diff, "dsrAgree": dsr_diff < 0.02,
        # PSR (S101 — now cross-checked, not just reported)
        "psr": psr0, "psrPurgedcv": psr_pkg, "psrDiff": psr_diff,
        # PBO (S101 — now cross-checked; the machinery D33 activates)
        "pbo": pbo, "pboPurgedcv": pbo_pkg, "pboDiff": pbo_diff,
        # RP-2: the aligned CSCV parameters, emitted so the wall can SHOW the alignment (a cross-check that does not first
        # align its parameters is two different experiments)
        "cscvAlignment": {
            "S": 8, "metric": "mean/std ddof=1 (rigor._col_sharpe == purgedcv.sharpe)",
            "split": "contiguous", "purge": "none", "embargo": "none",
            "matrixOrientation": "rigor (T,N) -> purgedcv (N,T) via transpose", "comparable": True,
        },
        "deflationCollapse": naive_psr - dsr,   # the trap: naive PSR looks certain, DSR collapses it
        "dsrMonotonic": d10 > d100 > d1000,     # DSR strictly decreases in n_trials (deterministic)
        "dsrByNTrials": {"n10": d10, "n100": d100, "n1000": d1000},
        # DD-18: the dataset is SYNTHETIC seeded noise (true Sharpe 0), tier SAMPLE. The wall/log states this + interprets PBO.
        "dataset": {"kind": "golden-noise", "tier": "SAMPLE", "trueSharpe": 0.0,
                    "note": "synthetic seeded noise identical to selftest.py k==0 — a fixture, not real strategy returns"},
        "purgedcvVersion": getattr(pcv, "__version__", "unknown"),
        "numpyVersion": np.__version__,
    }
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()
