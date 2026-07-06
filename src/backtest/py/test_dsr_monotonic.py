"""W2 Phase 1 — Rule I guard: DSR strictly DECREASES as n_trials rises (for a fixed candidate).

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.test_dsr_monotonic

This is the load-bearing statistical invariant of the whole sprint (Part B.2 / Appendix B): more
candidates do NOT improve significance — they raise the deflated threshold SR0, lowering DSR. If this
direction ever flips, the deflation is mis-wired (Halt). Also confirms the OTHER lever (Appendix E):
PSR/DSR RISE with observation count n (longer history) for a fixed per-observation Sharpe.
"""
import sys

import numpy as np

from backtest.py.rigor import deflated_sharpe, sr0_deflated, psr, per_obs_sharpe

SEED = 20260628


def fixed_returns(n, mean=0.0008, sd=0.01):
    rng = np.random.default_rng(SEED)
    return mean + sd * rng.standard_normal(n)


def main():
    ok = True

    # (1) Rule I — fixed candidate + fixed V, DSR strictly decreases as n_trials rises.
    r = fixed_returns(504)
    V = 0.04  # fixed trial-Sharpe variance
    trials = [2, 10, 100, 1000, 10000]
    dsrs = [deflated_sharpe(r, n, V) for n in trials]
    sr0s = [sr0_deflated(V, n) for n in trials]
    mono_dsr = all(dsrs[i] > dsrs[i + 1] for i in range(len(dsrs) - 1))
    mono_sr0 = all(sr0s[i] < sr0s[i + 1] for i in range(len(sr0s) - 1))  # SR0 rises with N
    print("  n_trials :", trials)
    print("  SR0      :", [round(x, 4) for x in sr0s], "(must strictly INCREASE with N)")
    print("  DSR      :", [round(x, 4) for x in dsrs], "(must strictly DECREASE with N)")
    print(f"  [{'PASS' if mono_sr0 else 'FAIL'}] SR0 strictly increases with n_trials")
    print(f"  [{'PASS' if mono_dsr else 'FAIL'}] DSR strictly decreases with n_trials (Rule I)")
    ok = ok and mono_sr0 and mono_dsr

    # (2) Appendix E — for a fixed per-obs Sharpe, PSR rises with observation count n (longer history).
    # Build longer series with the SAME mean/sd (same expected per-obs Sharpe) and check PSR increases.
    psrs = []
    sharpes = []
    for n in [120, 365, 730, 1460]:
        rr = fixed_returns(n)
        psrs.append(psr(rr, 0.0))
        sharpes.append(per_obs_sharpe(rr))
    # not strictly monotone sample-to-sample (finite-sample noise in Sharpe), but PSR should TREND up;
    # assert the longest window has a higher PSR than the shortest (the n -> infinity direction).
    rises = psrs[-1] > psrs[0]
    print(f"\n  obs n    : [120, 365, 730, 1460]")
    print(f"  PSR(0)   : {[round(x, 4) for x in psrs]} (longer history -> higher PSR)")
    print(f"  [{'PASS' if rises else 'FAIL'}] PSR rises with observation count (longest > shortest)")
    ok = ok and rises

    print(f"\nPhase 1 DSR-monotonicity (Rule I): {'ALL PASS' if ok else 'FAIL'}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
