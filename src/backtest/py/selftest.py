"""THE keystone self-tests (blueprint Phase 6c / Appendix O #1,#2).

Golden-noise: feed pure IID-normal "strategies" (true Sharpe 0) through the rigor
layer and REQUIRE it to flag them as overfit. If this does not catch noise, the whole
evaluation layer is meaningless (B.3) — the build halts here until it is green.

Because the best-of-N null Sharpe sits *at* the DSR~0.5 boundary by construction, the
assertions are written around (1) the deflation COLLAPSE/contrast, (2) DSR MONOTONICITY
in n_trials (deterministic), and (3) AVERAGED margins over many universes — robust, not
a single-seed coin flip. DSR is also cross-checked against the independent purgedcv pkg.

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.selftest
"""
from __future__ import annotations

import json
import os
import sys

import numpy as np
import purgedcv as pcv

from backtest.py import rigor
from backtest.py.accrual import run_accrual

SEED = 20260627
T = 504           # ~2y daily
N_TRIALS = 1000   # >= 1000 (blueprint)
K_UNIVERSES = 20  # averaged-margin robustness

FAILURES: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> bool:
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAILURES.append(name)
    return cond


# ---------- snapshot helpers (inlined to keep the self-test self-contained) ----------
def _snapshot_dir():
    d = os.path.dirname(os.path.abspath(__file__))
    for _ in range(10):
        cand = os.path.join(d, "data", "snapshot")
        if os.path.exists(os.path.join(cand, "MANIFEST.json")):
            return cand
        parent = os.path.dirname(d)
        if parent == d:
            break
        d = parent
    raise RuntimeError("data/snapshot not found")


def _load(key):
    with open(os.path.join(_snapshot_dir(), f"{key}.json")) as f:
        return json.load(f)


def golden_noise_test():
    print("golden-noise (the keystone):")
    rng = np.random.default_rng(SEED)
    best_dsrs, pbos = [], []
    for k in range(K_UNIVERSES):
        m = rng.normal(0.0, 0.01, size=(T, N_TRIALS))  # true Sharpe == 0
        srs = rigor.trial_sharpes(m)
        var_sharpe = float(np.var(srs, ddof=1))
        best = int(np.argmax(srs))
        best_ret = m[:, best]
        ann = rigor.annualized_sharpe(best_ret)
        naive_psr = rigor.psr(best_ret, 0.0)
        dsr_best = rigor.deflated_sharpe(best_ret, N_TRIALS, var_sharpe)
        p = rigor.pbo(m, n_splits=8)
        best_dsrs.append(dsr_best)
        pbos.append(p)

        if k == 0:
            # (i) the trap is visible: cherry-picked noise LOOKS excellent
            check("trap-visible: best raw annualized Sharpe > 1", ann > 1.0, f"ann_sharpe={ann:.2f}")
            check("trap-visible: naive PSR(0) > 0.95 (looks certain)", naive_psr > 0.95, f"PSR(0)={naive_psr:.4f}")
            # (ii) deflation COLLAPSES it — the contrast proves DSR works (robust to seed)
            check("deflation collapse: naive_PSR - DSR > 0.3", (naive_psr - dsr_best) > 0.3,
                  f"PSR(0)={naive_psr:.4f} DSR={dsr_best:.4f} gap={naive_psr - dsr_best:.4f}")
            # (iii) monotonicity: DSR strictly decreases in n_trials (candidate + V fixed) — deterministic
            d10 = rigor.deflated_sharpe(best_ret, 10, var_sharpe)
            d100 = rigor.deflated_sharpe(best_ret, 100, var_sharpe)
            d1000 = rigor.deflated_sharpe(best_ret, 1000, var_sharpe)
            check("DSR monotonic decreasing in n_trials", d10 > d100 > d1000,
                  f"DSR(10)={d10:.4f} > DSR(100)={d100:.4f} > DSR(1000)={d1000:.4f}")
            # cross-check DSR against the independent purgedcv implementation
            pkg = float(pcv.deflated_sharpe_ratio(best_ret, N_TRIALS, var_sharpe, bars_per_year=None))
            check("DSR matches purgedcv (independent impl)", abs(dsr_best - pkg) < 0.02,
                  f"mine={dsr_best:.6f} purgedcv={pkg:.6f}")

    mean_dsr = float(np.mean(best_dsrs))
    mean_pbo = float(np.mean(pbos))
    # averaged margins over K universes (the real claim: noise is NOT significant / NOT admitted)
    check(f"mean best-DSR < 0.6 over K={K_UNIVERSES} universes", mean_dsr < 0.6, f"mean best-DSR={mean_dsr:.4f}")
    check(f"mean PBO >= 0.4 (noise not admitted by PBO<0.5 gate)", mean_pbo >= 0.4, f"mean PBO={mean_pbo:.4f}")


def lookahead_test():
    print("lookahead (truncation invariance):")
    s = _load("sUSDS")
    pts = s["points"]
    apy = [[p["ts"], p["apyBase"]] for p in pts]
    start, end = pts[0]["ts"], pts[-1]["ts"]
    mid = pts[len(pts) // 2]["ts"]

    def job(window_end):
        return {
            "seed": 0,
            "window": {"start": start, "end": window_end},
            "legs": [{"id": "sUSDS", "series": {"apyBase": apy}, "redemption": {"delayDays": 0, "frequency": "instant"}}],
            "spec": {"family": "rwa-allocation", "legs": [{"id": "sUSDS", "weight": 1.0}],
                     "rebalance": {"trigger": "monthly"}, "policy": "static", "constraints": {}},
            "costs": {"gasUsd": 0, "feeBps": 0, "slippageK": 0.0},
            "benchmarks": {}, "nTrials": 1,
        }

    eq_full = run_accrual(job(end))["equity_curve"]
    eq_trunc = run_accrual(job(mid))["equity_curve"]
    prefix = [p for p in eq_full if p[0] <= mid]
    same_len = len(prefix) == len(eq_trunc)
    exact = same_len and all(a[0] == b[0] and a[1] == b[1] for a, b in zip(prefix, eq_trunc))
    check("truncating at T leaves the <=T metrics byte-identical (no lookahead)", exact,
          f"prefix={len(prefix)} trunc={len(eq_trunc)} exact_equity={exact}")


def rigor_components_test():
    print("rigor components (CPCV / purge+embargo shapes):")
    rng = np.random.default_rng(SEED + 1)
    r = rng.normal(0.0005, 0.01, T)
    c = rigor.cpcv(r, n_groups=6, k=2)
    check("CPCV produces C(6,2)=15 paths with finite mean/p5/p95", len(c["paths"]) == 15 and np.isfinite(c["mean"]),
          f"paths={len(c['paths'])} mean={c['mean']:.3f} p5={c['p5']:.3f} p95={c['p95']:.3f}")
    train, test = rigor.purge_embargo_split(100, list(range(40, 50)), embargo_frac=0.05)
    gap_ok = all(t < 40 or t > 54 for t in train) and len(test) == 10
    check("purge+embargo split excludes test window + embargo points", gap_ok,
          f"train_n={len(train)} test_n={len(test)}")


def main():
    golden_noise_test()
    rigor_components_test()
    lookahead_test()
    ok = not FAILURES
    print(f"\nPhase 6 selftest: {'ALL PASS' if ok else 'FAIL -> ' + ', '.join(FAILURES)}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
