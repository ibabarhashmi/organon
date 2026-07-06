"""Thorough mathematical verification of the rigor + evaluate layer (Appendix B).

Independent checks (not just "noise -> low"):
  A. PSR matches purgedcv across SR* values, and the closed form for a normal series.
  B. SR0 (expected-max) matches a Monte-Carlo E[max of N normals].
  C. DSR matches purgedcv across drift/N cases.
  D. DSR DISCRIMINATES: genuinely skilled -> high; best-of-noise -> ~0.5.
  E. PBO DISCRIMINATES: a real signal -> low; pure noise -> ~0.5.
  F. evaluate metrics (sharpe/sortino/vol) match QuantStats(periods=365).
  G. Sortino downside deviation uses the correct (/N) denominator (hand check).

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.test_rigor_math
"""
from __future__ import annotations

import math
import sys

import numpy as np
import purgedcv as pcv
import quantstats as qs
from scipy.stats import norm

from backtest.py import rigor, evaluate

FAIL = []


def check(name, cond, detail=""):
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAIL.append(name)


def A_psr():
    print("A. PSR — vs purgedcv and closed form")
    rng = np.random.default_rng(1)
    r = rng.normal(0.0008, 0.012, 504)
    for sr_star in (0.0, 0.05, 0.1):
        mine = rigor.psr(r, sr_star)
        pkg = float(pcv.probabilistic_sharpe_ratio(r, sr_star))
        check(f"PSR(SR*={sr_star}) matches purgedcv", abs(mine - pkg) < 5e-3, f"mine={mine:.6f} pkg={pkg:.6f}")
    # closed form for the SAME estimator (skew/kurt from the sample): replicate the formula
    sr = rigor.per_obs_sharpe(r)
    from scipy.stats import skew, kurtosis
    g3, g4 = float(skew(r)), float(kurtosis(r, fisher=False))
    denom = math.sqrt(1 - g3 * sr + ((g4 - 1) / 4) * sr * sr)
    cf = float(norm.cdf((sr - 0.0) * math.sqrt(len(r) - 1) / denom))
    check("PSR(0) equals explicit closed-form", abs(rigor.psr(r, 0.0) - cf) < 1e-12, f"diff={abs(rigor.psr(r,0.0)-cf):.2e}")


def B_sr0_montecarlo():
    print("B. SR0 — expected-max benchmark vs Monte-Carlo E[max of N normals]")
    rng = np.random.default_rng(2)
    for N in (10, 100, 1000):
        formula = rigor.sr0_deflated(1.0, N)  # V=1 -> SR0 == E[max of N standard normals]
        sims = rng.standard_normal((20000, N)).max(axis=1).mean()
        check(f"SR0(N={N}) ~ MC E[max]", abs(formula - sims) < 0.15, f"formula={formula:.4f} MC={sims:.4f}")


def C_dsr_vs_pkg():
    print("C. DSR — vs purgedcv across cases")
    rng = np.random.default_rng(3)
    for drift in (0.0, 0.0005, 0.0015):
        r = rng.normal(drift, 0.01, 504)
        for N in (50, 1000):
            V = 0.002
            mine = rigor.deflated_sharpe(r, N, V)
            pkg = float(pcv.deflated_sharpe_ratio(r, N, V, bars_per_year=None))
            check(f"DSR(drift={drift},N={N}) matches purgedcv", abs(mine - pkg) < 0.02, f"mine={mine:.4f} pkg={pkg:.4f}")


def D_dsr_discriminates():
    print("D. DSR discriminates skill from noise")
    rng = np.random.default_rng(4)
    # genuinely skilled: high per-obs Sharpe, modest trial count/dispersion -> DSR high
    skilled = rng.normal(0.002, 0.01, 504)  # per-obs SR ~0.2
    dsr_skill = rigor.deflated_sharpe(skilled, 50, 0.002)
    check("skilled strategy -> DSR > 0.95", dsr_skill > 0.95, f"DSR={dsr_skill:.4f} (per-obs SR={rigor.per_obs_sharpe(skilled):.3f})")
    # best-of-1000 pure noise -> DSR ~ 0.5 (not significant)
    M = rng.normal(0.0, 0.01, (504, 1000))
    srs = rigor.trial_sharpes(M)
    best = int(np.argmax(srs))
    dsr_noise = rigor.deflated_sharpe(M[:, best], 1000, float(np.var(srs, ddof=1)))
    check("best-of-noise -> DSR < 0.7 (near 0.5)", dsr_noise < 0.7, f"DSR={dsr_noise:.4f}")
    check("skilled DSR >> noise DSR", dsr_skill - dsr_noise > 0.3, f"gap={dsr_skill - dsr_noise:.4f}")


def E_pbo_discriminates():
    # Single-seed PBO has std ~0.15 (verified), so the null is characterized by the MEAN
    # over many universes (E[PBO]=0.5 for noise by symmetry), not a tight single-seed band.
    print("E. PBO discriminates signal from noise (averaged over universes)")
    noise_vals = [rigor.pbo(np.random.default_rng(2000 + s).normal(0.0, 0.01, (480, 60)), n_splits=8) for s in range(40)]
    mean_noise = float(np.mean(noise_vals))
    check("mean pure-noise PBO in [0.42, 0.58]", 0.42 <= mean_noise <= 0.58,
          f"mean={mean_noise:.3f} std={np.std(noise_vals):.3f}")
    sig_vals = []
    for s in range(40):
        rng = np.random.default_rng(3000 + s)
        m = rng.normal(0.0, 0.01, (480, 60))
        m[:, 0] += 0.0025  # one column with a persistent edge in every period (IS and OOS)
        sig_vals.append(rigor.pbo(m, n_splits=8))
    mean_sig = float(np.mean(sig_vals))
    check("mean dominant-signal PBO < 0.25", mean_sig < 0.25, f"mean={mean_sig:.3f}")
    check("signal PBO << noise PBO (gap > 0.2)", mean_noise - mean_sig > 0.2, f"noise={mean_noise:.3f} sig={mean_sig:.3f}")


def F_metrics_vs_quantstats():
    print("F. evaluate metrics vs QuantStats (periods=365)")
    rng = np.random.default_rng(6)
    r = rng.normal(0.0006, 0.011, 600)
    ts = np.arange(len(r)) * 86400000
    m = evaluate.metrics_from_returns(r, ts)
    s = evaluate._series(r, ts)
    qs_sharpe = float(qs.stats.sharpe(s, periods=365))
    qs_sortino = float(qs.stats.sortino(s, periods=365))
    qs_vol = float(qs.stats.volatility(s, periods=365))
    check("sharpe == QuantStats", abs(m["sharpe"] - qs_sharpe) < 1e-6, f"mine={m['sharpe']:.6f} qs={qs_sharpe:.6f}")
    check("sortino == QuantStats (denominator fix)", abs(m["sortino"] - qs_sortino) < 1e-6, f"mine={m['sortino']:.6f} qs={qs_sortino:.6f}")
    check("vol == QuantStats", abs(m["vol"] - qs_vol) < 1e-6, f"mine={m['vol']:.6f} qs={qs_vol:.6f}")


def G_sortino_manual():
    print("G. Sortino downside-deviation denominator (hand check)")
    r = np.array([0.01, -0.02, 0.03, -0.01, 0.0])
    ts = np.arange(len(r)) * 86400000
    dd_manual = math.sqrt(((-0.02) ** 2 + (-0.01) ** 2) / len(r))  # divide by TOTAL n
    sortino_manual = r.mean() / dd_manual * math.sqrt(365)
    m = evaluate.metrics_from_returns(r, ts)
    check("Sortino uses /N downside deviation", abs(m["sortino"] - sortino_manual) < 1e-9,
          f"mine={m['sortino']:.6f} manual={sortino_manual:.6f}")


def main():
    for fn in (A_psr, B_sr0_montecarlo, C_dsr_vs_pkg, D_dsr_discriminates, E_pbo_discriminates, F_metrics_vs_quantstats, G_sortino_manual):
        fn()
    ok = not FAIL
    print(f"\nRigor math verification: {'ALL PASS' if ok else 'FAIL -> ' + ', '.join(FAIL)}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
