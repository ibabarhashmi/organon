"""W2 Phase 4 — re-validate the DSR implementation + the V estimate on a LARGER cohort vs purgedcv.

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.test_dsr_cohort

W1.5/W1.75 estimated V (the trial-Sharpe variance) from only ~24 trials. This checks that, at a much
larger candidate count, (1) rigor's V equals an independent numpy computation, and (2) rigor's DSR still
matches the independent `purgedcv` oracle. If they match (they do), the formula is sound — leave it
untouched (Part C: fix the formula ONLY with a failing test proving a bug; none is found here).
"""
import sys

import numpy as np
import purgedcv as pcv

from backtest.py import rigor

SEED = 20260628


def main():
    rng = np.random.default_rng(SEED)
    T, N = 504, 256  # a LARGE cohort: 256 trials (vs the 24 the verdict used) -> V well-estimated
    m = 0.01 * rng.standard_normal((T, N))
    m[:, 0] += 0.0008  # one mild-signal column so the cohort isn't pure noise

    # V from the cohort, rigor's way vs an independent per-column computation
    srs = rigor.trial_sharpes(m)
    V = float(np.var(srs, ddof=1))
    mu, sd = m.mean(axis=0), m.std(axis=0, ddof=1)
    V_ref = float(np.var(mu / sd, ddof=1))
    v_ok = abs(V - V_ref) < 1e-9

    # DSR cross-check vs purgedcv across sampled columns, at the LARGER n_trials
    diffs = []
    for j in [0, 1, 64, 128, 255]:
        r = m[:, j]
        mine = rigor.deflated_sharpe(r, N, V)
        pkg = float(pcv.deflated_sharpe_ratio(r, N, V, bars_per_year=None))
        diffs.append(abs(mine - pkg))
    dsr_ok = max(diffs) < 0.02

    print(f"  cohort: T={T} N={N} trials (vs the 24 the decision verdict used)")
    print(f"  V(rigor)={V:.6f}  V(independent np)={V_ref:.6f}  |  [{'PASS' if v_ok else 'FAIL'}] V matches independent computation")
    print(f"  max|DSR_rigor − DSR_purgedcv| over sampled cols = {max(diffs):.2e}  |  [{'PASS' if dsr_ok else 'FAIL'}] DSR matches purgedcv at N={N}")
    ok = v_ok and dsr_ok
    print(f"\nPhase 4 DSR/V re-validation (larger cohort): {'ALL PASS' if ok else 'FAIL'}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
