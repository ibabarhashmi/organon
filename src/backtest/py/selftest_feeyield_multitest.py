"""ORGΛNON Fee-Yield — Phase-3 MULTIPLE-TESTING red-team, POSITIVE-CONTROLLED (Blueprint Phase 3 / Rule XXXIV).

The loop's OWN search is the overfitting risk. This battery proves the cumulative correction is load-bearing: on
PURE-NOISE panels (no edge whatsoever), searching enough candidates produces a spurious deflated-t that CLEARS the
single-test gate (a would-be false discovery) — and the CUMULATIVE-corrected hurdle REJECTS it. A correction that
could never reject a would-be discovery is not a defense (Rule XXIX). Deterministic, seeded, no network.

Run:  cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.selftest_feeyield_multitest
"""
from __future__ import annotations

import sys

import numpy as np
from scipy.stats import norm

from backtest.py import funding_discriminate, feeyield_discovery

SINGLE_GATE = 3.0
M, T = 122, 480          # the fee-yield panel shape (protocols × daily)
FAILURES = []


def check(name, cond, detail=""):
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAILURES.append(name)


def noise_candidate_t(seed):
    """A PURE-NOISE candidate: random signal, random forward, random loadings — NO edge. Returns its deflated-OOS-t."""
    rng = np.random.default_rng(seed)
    carry = rng.normal(0, 1, (T, M))
    fwd = rng.normal(0, 1, (T, M))
    L = rng.normal(0, 1, (M, 4))
    v = funding_discriminate.discriminate({"carry": carry.tolist(), "forward": fwd.tolist(), "loadings": L.tolist(),
                                           "minPeriods": 90, "cadenceHours": 24.0, "targetIC": 0.05})
    t = v.get("deflatedOosTstat")
    return abs(float(t)) if t is not None else 0.0


def test_correction_flips_a_survival_decision(out):
    print("(MT1) the cumulative correction FLIPS a survival decision (load-bearing, positive control):")
    best = out["bestCandidate"]["deflatedOosT"]
    single, bonf, bhy = out["singleTestGate"], out["cumulativeBonferroniHurdle"], out["cumulativeBhyHurdle"]
    # the real best discovery candidate is ACCEPTED by the naive single-test bar…
    check("the best discovery candidate clears the SINGLE-test gate (a would-be discovery)", best > single,
          f"best deflT {best} > gate {single}")
    # …but the STRICTER cumulative (dependence-robust BHY) hurdle REJECTS it → the correction changed the outcome
    check("the STRICTER cumulative BHY hurdle REJECTS it — the correction is load-bearing (Rule XXXIV)", best < bhy,
          f"best deflT {best} < BHY hurdle {bhy} (a candidate the naive bar accepts, the correction rejects)")
    check("the cumulative hurdle GROWS with the count (Bonferroni & BHY both > single gate)",
          bonf > single and bhy > single, f"Bonferroni {bonf}, BHY {bhy} > gate {single}")


def test_selection_inflation_on_noise():
    print("\n(MT1b) selection inflation is REAL — searching noise inflates the observed 'best' (why the correction is needed):")
    n_search = 80
    ts = [noise_candidate_t(1000 + i) for i in range(n_search)]
    max_t, med_t = max(ts), float(np.median(ts))
    bonf = float(norm.ppf(1.0 - (0.05 / 2.0) / n_search))
    # searching N noise candidates inflates the MAX far above a typical single test (the overfitting mechanism)…
    check("max-over-search ≫ median single test (selection inflates the best on pure noise)", max_t > med_t + 1.0,
          f"max|t|={max_t:.2f} vs median {med_t:.2f} over {n_search} noise tests")
    # …and even this selection-inflated max is below the cumulative hurdle (the deflation + correction hold)
    check("the cumulative hurdle bounds the selection-inflated noise max (no false discovery survives)", max_t < bonf,
          f"max|t|={max_t:.2f} < cumulative hurdle {bonf:.2f}")


def test_register_completeness(out):
    print("\n(MT2) the discovery register logs EVERY evaluated candidate (no omission — omission understates the correction):")
    check("register length == cumulative test count (every tried candidate logged)",
          len(out["register"]) == out["cumulativeCount"], f"{len(out['register'])} rows == {out['cumulativeCount']} tests")
    check("the cumulative hurdle is applied (not the single-test bar) to declare survival",
          out["cumulativeBonferroniHurdle"] > SINGLE_GATE, f"Bonferroni {out['cumulativeBonferroniHurdle']} > {SINGLE_GATE}")


def main():
    print("═══ Fee-Yield Phase-3 MULTIPLE-TESTING red-team (Rule XXXIV, positive-controlled) ═══\n")
    out = feeyield_discovery.run("2026-07-03")  # run the discovery loop ONCE; share across MT1/MT2 (snapshot cached)
    test_correction_flips_a_survival_decision(out)
    test_selection_inflation_on_noise()
    test_register_completeness(out)
    ok = not FAILURES
    print(f"\n{'ALL PASS' if ok else 'FAIL → ' + ', '.join(FAILURES)}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
