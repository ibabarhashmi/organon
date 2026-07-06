"""Phase 5 verification (Appendix I.3): accrual fidelity + cost-sensitivity.

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.test_accrual
Reads the pinned snapshot directly to build jobs (no TS side needed at this phase).
"""
import json
import os
import sys

from backtest.py.accrual import run_accrual


def snapshot_dir():
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


def load(key):
    with open(os.path.join(snapshot_dir(), f"{key}.json")) as f:
        return json.load(f)


def apy_series(series):
    return [[p["ts"], p["apyBase"]] for p in series["points"]]


def tvl_series(series):
    return [[p["ts"], p.get("tvlUsd") or 0.0] for p in series["points"]]


def fidelity_test():
    s = load("sUSDS")
    pts = s["points"]
    start, end = pts[0]["ts"], pts[-1]["ts"]
    job = {
        "seed": 0,
        "window": {"start": start, "end": end},
        "legs": [{"id": "sUSDS", "series": {"apyBase": apy_series(s)}, "redemption": {"delayDays": 0, "frequency": "instant"}}],
        "spec": {
            "family": "rwa-allocation",
            "legs": [{"id": "sUSDS", "weight": 1.0}],
            "rebalance": {"trigger": "monthly"},
            "policy": "static",
            "constraints": {},
        },
        "costs": {"gasUsd": 0, "feeBps": 0, "slippageModel": "sqrt", "slippageK": 0.0},
        "benchmarks": {},
        "nTrials": 1,
    }
    result = run_accrual(job)
    final = result["equity_curve"][-1][1]

    expected = 1.0
    for p in pts:
        if start <= p["ts"] <= end and p["apyBase"] is not None:
            expected *= 1.0 + (p["apyBase"] / 100.0) / 365.0

    diff = abs(final - expected)
    ok = diff < 1e-6
    print(f"[fidelity]  final={final:.12f}  expected={expected:.12f}  diff={diff:.2e}  -> {'PASS' if ok else 'FAIL'}")
    assert result["costs"]["total"] == 0.0, "zero-cost run must incur no cost"
    return ok


def cost_sensitivity_test():
    a, b = load("sUSDS"), load("sUSDe")
    start = max(a["points"][0]["ts"], b["points"][0]["ts"])
    end = min(a["points"][-1]["ts"], b["points"][-1]["ts"])

    def make_job(costs):
        return {
            "seed": 0,
            "capitalUsd": 1_000_000,
            "window": {"start": start, "end": end},
            "legs": [
                {"id": "sUSDS", "series": {"apyBase": apy_series(a), "turnover": tvl_series(a)}, "redemption": {"delayDays": 0, "frequency": "instant"}},
                {"id": "sUSDe", "series": {"apyBase": apy_series(b), "turnover": tvl_series(b)}, "redemption": {"delayDays": 7, "frequency": "cooldown"}},
            ],
            "spec": {
                "family": "rwa-allocation",
                "legs": [{"id": "sUSDS", "weight": 0.5}, {"id": "sUSDe", "weight": 0.5}],
                "rebalance": {"trigger": "monthly"},
                "policy": "yield-rotation",
                "constraints": {},
            },
            "costs": costs,
            "benchmarks": {},
            "nTrials": 1,
        }

    free = run_accrual(make_job({"gasUsd": 0, "feeBps": 0, "slippageModel": "sqrt", "slippageK": 0.0}))
    paid = run_accrual(make_job({"gasUsd": 10, "feeBps": 20, "slippageModel": "sqrt", "slippageK": 0.2}))
    fin_free = free["equity_curve"][-1][1]
    fin_paid = paid["equity_curve"][-1][1]
    rebalances = len(paid["fills"])
    ok = fin_paid < fin_free and paid["costs"]["total"] > 0 and rebalances > 0
    print(
        f"[cost-sens] free={fin_free:.6f}  paid={fin_paid:.6f}  cost={paid['costs']['total']:.6f}  "
        f"rebalances={rebalances}  -> {'PASS' if ok else 'FAIL'}"
    )
    return ok


def main():
    results = {"fidelity": fidelity_test(), "cost_sensitivity": cost_sensitivity_test()}
    allok = all(results.values())
    print(f"\nPhase 5 accrual: {'ALL PASS' if allok else 'FAIL'}  {results}")
    sys.exit(0 if allok else 1)


if __name__ == "__main__":
    main()
