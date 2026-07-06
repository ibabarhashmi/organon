"""ORGΛNON Fee-Yield — Integrity-sprint RESIDUAL closures, positive-controlled (Rule XXIX / Blueprint Phase 2).

Residual #3 (TWO-SOURCE size-coherence, the ~10× defect class): the overview current-TVL (`universe.tvlNow`) is
cross-checked against the tvl-SERIES latest finite value. A > 10× divergence between the two independent DeFiLlama
sources flags a size-incoherent protocol whose SIZE-derived factors (fee_yield / revenue_yield / size) go typed-missing,
while the TVL-free factors (fee_growth / retention / …) survive. Proven both ways: the REAL snapshot is coherent
(0 flags → the guard is a NO-OP, so the frozen fee-yield verdict byte-repro is preserved), AND a SYNTHETIC ~20×
divergence IS flagged (the guard is not a no-op — it can fire, Rule XXIX).

Run:  cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.selftest_feeyield_residuals
"""
from __future__ import annotations

import sys

import numpy as np
import pandas as pd

from backtest.py import feeyield_panel as P

FAILURES = []


def check(name, cond, detail=""):
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAILURES.append(name)


def test_real_snapshot_is_coherent():
    print("(R3a) the REAL snapshot is size-coherent → the two-source guard is a NO-OP (byte-repro preserved):")
    uni, fees, rev, tvl, price = P.load_snapshot("2026-07-03")
    bad = P.size_coherence(uni, tvl)
    check("real snapshot has 0 two-source size-incoherent protocols", len(bad) == 0, f"flagged={len(bad)}")
    a = P.build_factors(fees, rev, tvl, price)
    b = P.build_factors(fees, rev, tvl, price, bad)
    same = all(np.array_equal(a[k].values, b[k].values, equal_nan=True) for k in a)
    check("build_factors is byte-identical with the (empty) guard applied — no perturbation to the settled verdict", same)


def test_synthetic_divergence_is_flagged():
    print("\n(R3b) a SYNTHETIC ~20× two-source divergence IS flagged (positive control — the guard can fire):")
    grid = pd.Index([0, 86400, 172800], name="day")
    tvl = pd.DataFrame({"good": [100.0, 100.0, 100.0], "bad": [50.0, 50.0, 50.0]}, index=grid)
    universe = [{"slug": "good", "tvlNow": 100.0}, {"slug": "bad", "tvlNow": 1000.0}]  # bad: 1000 vs series-latest 50 = 20×
    bad = P.size_coherence(universe, tvl)
    check("the ~20× divergence protocol IS flagged (the defect class #3 targets)", "bad" in bad, f"flagged={sorted(bad)}")
    check("the coherent protocol is NOT flagged (no false positive)", "good" not in bad)
    # a < 1/10 divergence (overview far BELOW series) is symmetric — also flagged
    universe2 = [{"slug": "bad", "tvlNow": 4.0}]  # 4 vs 50 = 0.08× < 0.1×
    check("a symmetric < 0.1× divergence is also flagged", "bad" in P.size_coherence(universe2, tvl[["bad"]]))


def test_guard_quarantines_size_factors_only():
    print("\n(R3c) the guard NaNs SIZE-derived factors for the flagged protocol but KEEPS the TVL-free factors:")
    n = 70
    grid = pd.Index([i * 86400 for i in range(n)], name="day")
    fees = pd.DataFrame({"good": np.linspace(100, 200, n), "bad": np.linspace(100, 200, n)}, index=grid)
    rev = fees * 0.5
    tvl = pd.DataFrame({"good": np.full(n, 1e6), "bad": np.full(n, 1e6)}, index=grid)
    price = pd.DataFrame({"good": np.linspace(1, 2, n), "bad": np.linspace(1, 2, n)}, index=grid)
    factors = P.build_factors(fees, rev, tvl, price, {"bad"})
    fy_bad = int(np.isfinite(factors["fee_yield"]["bad"].values).sum())
    fg_bad = int(np.isfinite(factors["fee_growth"]["bad"].values).sum())
    fy_good = int(np.isfinite(factors["fee_yield"]["good"].values).sum())
    check("flagged 'bad': fee_yield (SIZE-derived) is fully typed-missing", fy_bad == 0, f"finite fee_yield={fy_bad}")
    check("flagged 'bad': fee_growth (TVL-free) SURVIVES the guard", fg_bad > 0, f"finite fee_growth={fg_bad}")
    check("coherent 'good': fee_yield is intact — the guard is targeted, not blanket", fy_good > 0, f"finite fee_yield={fy_good}")


def main():
    print("═══ Fee-Yield Integrity-sprint residual #3 (two-source size-coherence), positive-controlled ═══\n")
    test_real_snapshot_is_coherent()
    test_synthetic_divergence_is_flagged()
    test_guard_quarantines_size_factors_only()
    ok = not FAILURES
    print(f"\n{'ALL PASS' if ok else 'FAIL → ' + ', '.join(FAILURES)}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
