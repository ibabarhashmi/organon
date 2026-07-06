"""W2 Phase 5 — fire the W1.75 price-mark on the REAL Mar-2023 USDC depeg (integration on real data).

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.test_pricemark_real

W1.75 proved the price-mark only on SYNTHETIC breaches (free in-window peg maxed at ~50bps). Phase 0
obtained the real Mar-2023 USDC depeg (Binance `peg-USDC-2023`, daily close trough $0.9592 = 408bps on
2023-03-11). Here we run the REAL accrual pipeline (`run_accrual`) on a strategy exposed to that real
depeg through a leg with GATED redemption + a pegExit rule, and assert the price-mark fires and produces
a real equity drawdown sized to the REAL deviation (haircut ≈ 408bps). The leg's value series and the
depeg are both real, pinned data; only the redemption gating is the test scenario (Phase 5 sanctioned).
"""
import json
import os
import sys

from backtest.py.accrual import run_accrual, qualified_breach, Leg

DAY_MS = 86_400_000
WIN_START = 1675209600000  # 2023-02-01 UTC (pre-depeg par context from compound-USDC's real history)
WIN_END = 1688169600000    # 2023-06-30 UTC


def snapshot_dir():
    d = os.path.dirname(os.path.abspath(__file__))
    for _ in range(10):
        cand = os.path.join(d, "data", "snapshot")
        if os.path.exists(os.path.join(cand, "MANIFEST.json")):
            return cand
        d = os.path.dirname(d)
    raise RuntimeError("data/snapshot not found")


def load(key):
    with open(os.path.join(snapshot_dir(), f"{key}.json")) as f:
        return json.load(f)


def in_win(points, key):
    return [[p["ts"], p[key]] for p in points if WIN_START <= p["ts"] <= WIN_END and p.get(key) is not None]


def maxdd(curve):
    peak, dd = -1e18, 0.0
    for _, v in curve:
        peak = max(peak, v)
        dd = min(dd, v / peak - 1.0)
    return dd


def build_job(peg_series):
    comp = load("compound-USDC")["points"]   # REAL apyBase (history to 2022-10, present across the window)
    apy = in_win(comp, "apyBase")
    return {
        "seed": 0,
        "capitalUsd": 1_000_000,
        "window": {"start": WIN_START, "end": WIN_END},
        "legs": [
            # RISK: real USDC-yield value series + REAL depeg peg + GATED redemption (the Phase-5 scenario)
            {"id": "RISK", "series": {"apyBase": apy, "peg": peg_series}, "pegMark": peg_series,
             "redemption": {"delayDays": 5, "frequency": "weekly"}},
            # SAFE: same real value series, instant redemption, no peg -> the exit destination
            {"id": "SAFE", "series": {"apyBase": apy}, "redemption": {"delayDays": 0, "frequency": "instant"}},
        ],
        "spec": {
            "family": "rwa-allocation",
            "legs": [{"id": "RISK", "weight": 1.0}, {"id": "SAFE", "weight": 0.0}],
            "rebalance": {"trigger": "monthly"},
            "policy": "static",
            "constraints": {"pegExitBps": 100},
        },
        "costs": {"gasUsd": 0, "feeBps": 0, "slippageModel": "sqrt", "slippageK": 0.0},
        "benchmarks": {},
        "nTrials": 1,
    }


def main():
    peg_pts = load("peg-USDC-2023")["points"]
    real_peg = in_win(peg_pts, "price")               # the REAL Mar-2023 depeg series
    trough = min(p[1] for p in real_peg)
    real_dev_bps = abs(trough - 1.0) * 10000.0

    # the breach predicate fires on the real depeg (gated leg, dev >= 100bps)
    risk_leg = Leg({"id": "RISK", "pegMark": real_peg, "redemption": {"delayDays": 5, "frequency": "weekly"}})
    trough_ts = min(real_peg, key=lambda p: p[1])[0]
    fires = qualified_breach(risk_leg, trough_ts)

    real = run_accrual(build_job(real_peg))
    flat = run_accrual(build_job([[p[0], 1.0] for p in real_peg]))  # control: peg pinned at par
    dd_real = maxdd(real["equity_curve"])
    dd_flat = maxdd(flat["equity_curve"])
    loss = 1.0 - real["equity_curve"][-1][1] / flat["equity_curve"][-1][1]

    checks = []
    checks.append((f"real depeg trough ${trough:.4f} ({real_dev_bps:.0f}bps) in band [$0.80,$0.97]", 0.80 <= trough <= 0.97))
    checks.append(("qualified_breach FIRES on the real depeg (gated leg, >=100bps)", fires is True))
    checks.append((f"real equity drawdown registers (maxdd {dd_real:.4f} < -1%)", dd_real < -0.01))
    # plausibility: the haircut ≈ the REAL deviation (~408bps), not exaggerated
    checks.append((f"haircut ≈ real deviation (loss {loss*100:.2f}% ≈ {real_dev_bps:.0f}bps)", abs(loss * 10000 - real_dev_bps) < 150))
    checks.append((f"control (peg pinned at par) shows NO drawdown (maxdd {dd_flat:.4f})", dd_flat >= -1e-9))

    print(f"  real Mar-2023 USDC depeg: trough ${trough:.4f} ({real_dev_bps:.0f}bps)  breach_fires={fires}")
    print(f"  dd_real={dd_real:.4f}  dd_flat={dd_flat:.4f}  realized_loss={loss*100:.2f}%")
    ok = True
    for name, c in checks:
        print(f"  [{'PASS' if c else 'FAIL'}] {name}")
        ok = ok and c
    print(f"\nPhase 5 price-mark REAL-DATA integration: {'ALL PASS' if ok else 'FAIL'}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
