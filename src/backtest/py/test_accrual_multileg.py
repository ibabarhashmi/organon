"""W1.5 Phase 4 — multi-leg accrual regression test.

Locks the Week-1 timeline-duplication bug (≈4× yield double-accrual from union-of-
timestamps across sources), which the single-leg fidelity test missed and only a human
reading VERDICT.md caught. Uses a MIXED-source portfolio (DefiLlama yield ts ~23:01 +
CoinGecko price ts midnight — different raw grids) and asserts:
  (a) exactly ONE accrual step per UTC day (no duplication);
  (b) an all-in-T-bill control inside a mixed-source job reads the correct ~annual rate
      (≈3–5%, not ≈15% — the direct duplication detector);
  (c) an INDEPENDENTLY hand-computed two-leg equity path matches run_accrual within 1e-6.

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.test_accrual_multileg
"""
import bisect
import sys

from backtest.py.accrual import run_accrual
from backtest.py.test_accrual import load, apy_series

DAY_MS = 86_400_000


def price_series(series):
    return [[p["ts"], p["price"]] for p in series["points"]]


def asof(pairs):
    ts = [p[0] for p in pairs]
    vals = [p[1] for p in pairs]

    def f(t):
        i = bisect.bisect_right(ts, t) - 1
        return vals[i] if i >= 0 else None

    return f


def daily_grid(*pair_lists, start, end):
    by_day = {}
    for pairs in pair_lists:
        for ts, _ in pairs:
            if start <= ts <= end:
                d = ts // DAY_MS
                by_day[d] = max(by_day.get(d, 0), ts)
    return [by_day[d] for d in sorted(by_day)]


def main():
    susds = load("sUSDS")
    paxg = load("PAXG")
    s_apy = apy_series(susds)
    p_px = price_series(paxg)
    start = max(s_apy[0][0], p_px[0][0])
    end = min(s_apy[-1][0], p_px[-1][0])
    grid = daily_grid(s_apy, p_px, start=start, end=end)
    fails = []

    # (a) one accrual step per UTC day
    job_ab = {
        "seed": 0, "capitalUsd": 1_000_000, "window": {"start": start, "end": end},
        "legs": [
            {"id": "sUSDS", "series": {"apyBase": s_apy}, "redemption": {"delayDays": 0, "frequency": "instant"}},
            {"id": "PAXG", "series": {"price": p_px}, "redemption": {"delayDays": 1, "frequency": "daily"}},
        ],
        # buy-and-hold (drift threshold unreachable => never rebalances) so the
        # independent hand-reference in (c) is exact.
        "spec": {"family": "rwa-allocation", "legs": [{"id": "sUSDS", "weight": 0.5}, {"id": "PAXG", "weight": 0.5}],
                 "rebalance": {"trigger": "drift", "driftBps": 10_000_000}, "policy": "static", "constraints": {}},
        "costs": {"gasUsd": 0, "feeBps": 0, "slippageK": 0.0}, "benchmarks": {}, "nTrials": 1,
    }
    eq = run_accrual(job_ab)["equity_curve"]
    distinct_days = len({(p[0] // DAY_MS) for p in eq})
    one_per_day = len(eq) == distinct_days == len(grid)
    print(f"[a one-step/day] equity_pts={len(eq)} distinct_days={distinct_days} grid={len(grid)} -> {'PASS' if one_per_day else 'FAIL'}")
    if not one_per_day:
        fails.append("one-step-per-day")

    # (b) all-in-T-bill control inside a MIXED-source job (T-bill on the DefiLlama grid,
    #     PAXG on the CoinGecko grid). Constant 3.84%/yr must read ~annual, not ~4x.
    TBILL_APY = 3.84
    tbill_series = [[ts, TBILL_APY] for ts, _ in s_apy]
    job_b = {
        "seed": 0, "capitalUsd": 1_000_000, "window": {"start": start, "end": end},
        "legs": [
            {"id": "TBILL", "series": {"apyBase": tbill_series}, "redemption": {"delayDays": 0, "frequency": "instant"}},
            {"id": "PAXG", "series": {"price": p_px}, "redemption": {"delayDays": 1, "frequency": "daily"}},
        ],
        "spec": {"family": "rwa-allocation", "legs": [{"id": "TBILL", "weight": 1.0}],
                 "rebalance": {"trigger": "monthly"}, "policy": "static", "constraints": {}},
        "costs": {"gasUsd": 0, "feeBps": 0, "slippageK": 0.0}, "benchmarks": {}, "nTrials": 1,
    }
    eqb = run_accrual(job_b)["equity_curve"]
    days = len(eqb)
    annualized = eqb[-1][1] ** (365.0 / days) - 1.0
    ann_ok = 0.03 <= annualized <= 0.05
    print(f"[b tbill control] days={days} final={eqb[-1][1]:.6f} annualized={annualized*100:.2f}%  -> {'PASS' if ann_ok else 'FAIL (duplication?)'}")
    if not ann_ok:
        fails.append("tbill-annualized")

    # (c) independent hand-computed two-leg path (0.5 sUSDS yield + 0.5 PAXG price-mark)
    g = daily_grid(s_apy, p_px, start=start, end=end)
    fa, fp = asof(s_apy), asof(p_px)
    h_s, h_p = 0.5, 0.5
    prev = None
    for ts in g:
        ab = fa(ts)
        h_s *= 1.0 + (ab / 100.0) / 365.0 if ab is not None else 1.0
        if prev is not None:
            px, ppx = fp(ts), fp(prev)
            if px and ppx:
                h_p *= px / ppx
        prev = ts
    expected = h_s + h_p
    actual = eq[-1][1]  # job_ab final (zero cost, same 50/50 static)
    diff = abs(actual - expected)
    c_ok = diff < 1e-6
    print(f"[c 2-leg ref] expected={expected:.12f} actual={actual:.12f} diff={diff:.2e}  -> {'PASS' if c_ok else 'FAIL'}")
    if not c_ok:
        fails.append("2-leg-reference")

    print(f"\nPhase 4 multi-leg accrual: {'ALL PASS' if not fails else 'FAIL -> ' + ', '.join(fails)}")
    sys.exit(0 if not fails else 1)


if __name__ == "__main__":
    main()
