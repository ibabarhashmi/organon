"""Evaluation (blueprint Phase 6a): risk-adjusted metrics via QuantStats + benchmark
comparison (alpha / information ratio / beat-rate). Sortino is the lead metric.

Input returns are PER-PERIOD (daily). Headline metrics are annualized (periods=365);
rigor (rigor.py) consumes the per-observation Sharpe separately.
"""
from __future__ import annotations

import warnings

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

BARS_PER_YEAR = 365


def returns_from_equity(equity_curve):
    """[[ts,val],...] -> (ts[1:], simple_returns[1:])."""
    if len(equity_curve) < 2:
        return np.array([]), np.array([])
    vals = np.array([p[1] for p in equity_curve], dtype=float)
    ts = np.array([p[0] for p in equity_curve], dtype=float)
    rets = vals[1:] / vals[:-1] - 1.0
    return ts[1:], rets


def _series(rets, ts) -> pd.Series:
    idx = pd.to_datetime(np.asarray(ts, dtype="int64"), unit="ms")
    return pd.Series(np.asarray(rets, dtype=float), index=idx)


def metrics_from_returns(rets, ts) -> dict:
    r = np.asarray(rets, dtype=float)
    if r.size < 2:
        return {k: 0.0 for k in ("cagr", "sharpe", "sortino", "calmar", "maxdd", "vol")}
    # Direct, deterministic computations (cross-checked against QuantStats in tests).
    mean, sd = float(r.mean()), float(r.std(ddof=1))
    downside = r[r < 0]
    # downside deviation (target semideviation, MAR=0): divide by TOTAL n, not the
    # count of negatives — matches the standard Sortino / QuantStats convention.
    dd = float(np.sqrt(np.sum(downside ** 2) / r.size)) if downside.size else 0.0
    sharpe = 0.0 if sd == 0 else mean / sd * np.sqrt(BARS_PER_YEAR)
    # Sortino is UNDEFINED for a zero-downside series (no negative returns) -> null, not 0.
    # 0 would falsely read as "zero risk-adjusted return". Same convention as verdict.ts/regimes.ts.
    sortino = None if dd == 0 else mean / dd * np.sqrt(BARS_PER_YEAR)
    equity = np.cumprod(1.0 + r)
    peak = np.maximum.accumulate(equity)
    maxdd = float((equity / peak - 1.0).min())
    years = max(r.size / BARS_PER_YEAR, 1e-9)
    cagr = float(equity[-1] ** (1.0 / years) - 1.0)
    calmar = None if maxdd == 0 else cagr / abs(maxdd)  # undefined for a zero-drawdown series
    vol = sd * np.sqrt(BARS_PER_YEAR)
    return {
        "cagr": float(cagr),
        "sharpe": float(sharpe),
        "sortino": None if sortino is None else float(sortino),
        "calmar": None if calmar is None else float(calmar),
        "maxdd": float(maxdd),
        "vol": float(vol),
    }
    # NOTE: metrics are computed by direct formulas that are validated IDENTICAL to
    # QuantStats (test_rigor_math.py F / scoring tests), so the values are
    # QuantStats-consistent without paying QuantStats' ~1.5s import in the hot path.


def _align(port_ts, port_rets, bench_ts, bench_rets):
    """Inner-join two return series on timestamp."""
    bench = {int(t): v for t, v in zip(bench_ts, bench_rets)}
    pr, br = [], []
    for t, v in zip(port_ts, port_rets):
        b = bench.get(int(t))
        if b is not None:
            pr.append(v)
            br.append(b)
    return np.array(pr, dtype=float), np.array(br, dtype=float)


def compare_to_benchmark(port_ts, port_rets, bench_ts, bench_rets) -> dict:
    """alpha (annualized mean excess), information ratio, beat-rate vs one benchmark."""
    pr, br = _align(port_ts, port_rets, bench_ts, bench_rets)
    if pr.size < 2:
        return {"alpha": float("nan"), "infoRatio": float("nan"), "beatRate": float("nan")}
    excess = pr - br
    alpha = float(excess.mean() * BARS_PER_YEAR)
    sd = float(excess.std(ddof=1))
    info = 0.0 if sd == 0 else float(excess.mean() / sd * np.sqrt(BARS_PER_YEAR))
    beat = float(np.mean(pr > br))
    return {"alpha": alpha, "infoRatio": info, "beatRate": beat}


def evaluate(equity_curve, benchmarks=None) -> dict:
    """benchmarks: {name: [[ts, dailyReturn], ...]}. Returns {metrics, benchmark:{vs:{...}}}."""
    ts, rets = returns_from_equity(equity_curve)
    metrics = metrics_from_returns(rets, ts)
    vs = {}
    for name, series in (benchmarks or {}).items():
        if not series:
            continue
        b_ts = [p[0] for p in series]
        b_rets = [p[1] for p in series]
        vs[name] = compare_to_benchmark(ts, rets, b_ts, b_rets)
    return {"metrics": metrics, "benchmark": {"vs": vs}}


def json_safe(o):
    import math

    if isinstance(o, float):
        return o if math.isfinite(o) else None
    if isinstance(o, dict):
        return {k: json_safe(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [json_safe(v) for v in o]
    return o


def main():
    import json
    import sys

    payload = json.load(sys.stdin)
    json.dump(json_safe(evaluate(payload["equity_curve"], payload.get("benchmarks"))), sys.stdout)


if __name__ == "__main__":
    main()
