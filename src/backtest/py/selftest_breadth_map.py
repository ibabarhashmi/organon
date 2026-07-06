"""ORGΛNON — per-domain breadth map VALIDATION (Phase 3). Asserts the map is MEASURED (not asserted), distinguishes
single-factor/price-driven (low breadth) from idiosyncratic (high breadth), and auto-refuses nothing.

Run: cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.selftest_breadth_map
"""
from __future__ import annotations

from backtest.py import breadth_map

FAIL = []


def check(name, cond, detail=""):
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAIL.append(name)


def main():
    rows = breadth_map.main()
    by = {name: pf for name, _, _, pf in rows}

    # (1) price-driven domains (measured on REAL data) inherit the market's low breadth → un-powered
    for d in ["momentum", "liquidation-proximity", "funding-carry (beta proxy)"]:
        if d in by:
            check(f"{d} (price-driven, REAL) → low breadth (<6) + un-powered",
                  by[d]["effectiveBreadth"] < 6.0 and by[d]["reachable"] is False,
                  f"M_eff={by[d]['effectiveBreadth']:.2f} reachable={by[d]['reachable']}")

    # (2) THE ESCAPE: idiosyncratic unlock (independent calendars) → HIGH breadth + reachable
    check("unlock-proximity (idiosyncratic, independent calendars) → HIGH breadth + reachable",
          by["unlock-proximity"]["effectiveBreadth"] > 30.0 and by["unlock-proximity"]["reachable"] is True,
          f"M_eff={by['unlock-proximity']['effectiveBreadth']:.1f}")

    # (3) it's genuine structure, not just a noisier panel: peg (few stablecoins) is noisy but LOW breadth (few assets)
    check("peg-deviation (5 stablecoins) → LOW breadth despite being noisy (few-asset, not high-breadth) — structure, not noise",
          by["peg-deviation"]["effectiveBreadth"] < 6.0,
          f"M_eff={by['peg-deviation']['effectiveBreadth']:.2f}")

    # (4) the map distinguishes single-factor from idiosyncratic (the whole point)
    price_max = max(by[d]["effectiveBreadth"] for d in ["momentum", "liquidation-proximity", "funding-carry (beta proxy)"] if d in by)
    check("the map DISTINGUISHES single-factor (low) from idiosyncratic (high) — a real separation",
          by["unlock-proximity"]["effectiveBreadth"] > 5 * price_max,
          f"idiosyncratic {by['unlock-proximity']['effectiveBreadth']:.1f} ≫ price-driven max {price_max:.2f}")

    # (5) nothing auto-refused (A-PRE) — every domain REPORTED, none refused
    check("NOTHING auto-refused — every domain reported (A-PRE)", all(pf.get("refused") is False for pf in by.values()))

    print(f"\nbreadth-map validation: {'ALL PASS' if not FAIL else 'FAIL -> ' + ', '.join(FAIL)}")
    raise SystemExit(0 if not FAIL else 1)


if __name__ == "__main__":
    main()
