"""THE FROZEN-CORE CROSS-CHECK DRIVER (Reach V35, S94) — a HARNESS, not a frozen artifact, not on the verdict path.

X-REACH(b): "a cross-check that does not execute is not a check — it is an absence wearing a check's name." The frozen
core's DSR/PSR/PBO had never executed in the audited record because the studio-slim venv (requirements-studio.txt) ships
numpy+scipy only, and `purgedcv` lives in the parked heavy requirements.txt. This driver EXECUTES the cross-check and
emits the numbers as JSON so a TS wall + a committed artifact can read them.

It reimplements NOTHING: DSR/PSR/PBO are the FROZEN `rigor` module's functions (byte-identical, sha-pinned in frozen.ts);
the independent oracle is the `purgedcv` package (RP-2: never vendored/stubbed/mocked/reimplemented). The golden-noise
construction (seed, T, N_TRIALS) is byte-identical to selftest.py's k==0 universe — the same input, exposed as data.
If `purgedcv` is absent the import fails and the caller (src/backtest/rigor.ts) returns BLOCKED{reason} — an honest red.

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

    # the INDEPENDENT oracle (purgedcv) — the cross-check
    dsr_pkg = float(pcv.deflated_sharpe_ratio(best_ret, N_TRIALS, var_sharpe, bars_per_year=None))
    diff = abs(dsr - dsr_pkg)

    out = {
        "executed": True,
        "seed": SEED, "T": T, "nTrials": N_TRIALS,
        "dsr": dsr, "dsrPurgedcv": dsr_pkg, "dsrDiff": diff, "dsrAgree": diff < 0.02,
        "psr": psr0, "pbo": pbo,
        "deflationCollapse": naive_psr - dsr,   # the trap: naive PSR looks certain, DSR collapses it
        "dsrMonotonic": d10 > d100 > d1000,     # DSR strictly decreases in n_trials (deterministic)
        "dsrByNTrials": {"n10": d10, "n100": d100, "n1000": d1000},
        "purgedcvVersion": getattr(pcv, "__version__", "unknown"),
        "numpyVersion": np.__version__,
    }
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()
