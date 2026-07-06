"""ORGΛNON Funding-Carry — Phase 3 plausibility checks for the delta-neutral hedge cost model (Appendix D/E).

Mechanical, not tuned: 0 in the frictionless limit, the negative-funding tail cost present (never dropped), rising
with rebalance frequency and thinness, cost ≤ position value, NET ≤ GROSS. Run:
  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.test_funding_accrual
"""
from __future__ import annotations

import sys

from backtest.py.funding_accrual import run_funding_accrual

FAIL = []


def check(name, cond, detail=""):
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAIL.append(name)


def main():
    N = 1_000_000.0
    pos = [0.00002] * 240  # 240 hourly intervals of small POSITIVE funding
    mixed = [0.00002 if i % 4 else -0.00008 for i in range(240)]  # every 4th interval negative (deleveraging)

    # (1) frictionless limit → total cost 0, net == gross (all-positive funding, zero fees/slippage, no rebalance).
    frictionless = run_funding_accrual({"funding": pos, "intervalHours": 1.0, "notionalUsd": N,
                                        "costs": {"takerBps": 0, "makerBps": 0, "spotBps": 0, "slippageK": 0, "hedgeTurnoverFrac": 0, "rebalanceEveryHours": 1e9}})
    check("frictionless limit → total cost = 0", abs(frictionless["totalCost"]) < 1e-6, f"cost={frictionless['totalCost']:.4f}")
    check("frictionless → net == gross", abs(frictionless["netCarry"] - frictionless["grossCarry"]) < 1e-6,
          f"net={frictionless['netCarry']:.2f} gross={frictionless['grossCarry']:.2f}")

    # (2) the negative-funding TAIL cost is PRESENT (not dropped) when funding goes negative.
    withtail = run_funding_accrual({"funding": mixed, "intervalHours": 1.0, "notionalUsd": N})
    check("negative-funding-paid (tail) term is present + positive when funding flips negative",
          withtail["fundingPaidNegativeWindows"] > 0, f"tail={withtail['fundingPaidNegativeWindows']:.2f}")
    check("fundingPnl = grossReceived − tailPaid (the tail is subtracted, not hidden)",
          abs(withtail["fundingPnl"] - (withtail["grossFundingReceived"] - withtail["fundingPaidNegativeWindows"])) < 1e-6)

    # (3) thin/volatile market → higher slippage than a deep one (mechanical, keyed to depth).
    deep = run_funding_accrual({"funding": pos, "intervalHours": 1.0, "notionalUsd": N, "costs": {"depthUsd": 50_000_000}})
    thin = run_funding_accrual({"funding": pos, "intervalHours": 1.0, "notionalUsd": N, "costs": {"depthUsd": 200_000}})
    check("thinner venue depth → higher slippage", thin["slippage"] > deep["slippage"],
          f"thin={thin['slippage']:.0f} > deep={deep['slippage']:.0f}")

    # (4) more frequent rebalancing → more cost.
    slow = run_funding_accrual({"funding": pos, "intervalHours": 1.0, "notionalUsd": N, "costs": {"rebalanceEveryHours": 24}})
    fast = run_funding_accrual({"funding": pos, "intervalHours": 1.0, "notionalUsd": N, "costs": {"rebalanceEveryHours": 1}})
    check("more rebalances → more hedge-maintenance cost", fast["hedgeMaintenance"] > slow["hedgeMaintenance"],
          f"fast={fast['hedgeMaintenance']:.0f} > slow={slow['hedgeMaintenance']:.0f}  (rebs {fast['rebalances']} vs {slow['rebalances']})")

    # (5) invariants: net ≤ gross always; cost ≤ position value.
    for label, r in [("all-positive", deep), ("with-tail", withtail), ("fast-rebalance", fast)]:
        check(f"net ≤ gross ({label})", r["netLeqGross"] and r["netCarry"] <= r["grossCarry"] + 1e-6,
              f"net={r['netCarry']:.0f} ≤ gross={r['grossCarry']:.0f}")
        check(f"total cost ≤ position value ({label})", r["totalCost"] <= N + 1e-6, f"cost={r['totalCost']:.0f} ≤ {N:.0f}")

    # (6) Unified-Sprint P2 (Rule XV): recalibrated + economically reconciled on REAL deep-market funding.
    import json as _json, os as _os
    root = _os.path.join(_os.path.dirname(__file__), "..", "..", "..")
    btc_path = _os.path.join(root, "data", "funding", "history", "hl", "BTC.json")
    if _os.path.exists(btc_path):
        btc = _json.load(open(btc_path))
        rates = [p["rate"] for p in btc["points"] if p["rate"] is not None]
        rb = run_funding_accrual({"funding": rates, "intervalHours": btc["intervalHours"], "notionalUsd": N})
        check("calibration is frozen + versioned (Rule IX)", rb.get("calibrationVersion") == "funding-cost/2026-07-02",
              f"version={rb.get('calibrationVersion')}")
        check("deep-market (BTC) hedge maintenance is economically PLAUSIBLE (≤10%/yr, Rule XV — was 57%/yr)",
              rb["deepMarket"] and rb["economicallyPlausible"] and rb["annualizedMaintenance"] <= 0.10,
              f"maint={rb['annualizedMaintenance']:.2%}/yr")
        check("the REAL BTC tail is retained (30% negative funding → tail > 0, not phantom)", rb["fundingPaidNegativeWindows"] > 0,
              f"tail=${rb['fundingPaidNegativeWindows']:,.0f}")
        # thin market honestly may stay net-negative (bound is deep-market only)
        rt = run_funding_accrual({"funding": rates, "intervalHours": btc["intervalHours"], "notionalUsd": N, "costs": {"depthUsd": 200_000, "hedgeTurnoverFrac": 0.02}})
        check("thin-market variant may honestly stay net-negative (bound reconciles DEEP markets only)", rt["netCarry"] < rb["netCarry"],
              f"thin net=${rt['netCarry']:,.0f} < deep net=${rb['netCarry']:,.0f}")

    ok = not FAIL
    print(f"\nPhase 3 funding_accrual: {'ALL PASS' if ok else 'FAIL -> ' + ', '.join(FAIL)}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
