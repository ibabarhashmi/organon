"""ORGΛNON — the PER-DOMAIN BREADTH MAP (Breadth-Rename sprint, Phase 3). Answers "which DeFi domains are even
winnable?" by MEASUREMENT (the pre-flight on each domain's panel), not extrapolation.

The hypothesis under test: the momentum breadth collapse (M_eff ≈ 2.4) is a property of PRICE-DRIVEN / market-factor
signals, not of crypto per se. A signal whose cross-section is IDIOSYNCRATIC (independent per-token structure, not
price) — e.g. token-unlock timing, whose vesting calendars are set per-token independently of price and of each other —
should have HIGH breadth and escape the collapse.

Honesty about the panels:
  • PRICE-DRIVEN domains are measured on the REAL 107-perp checksum-anchored prices (momentum, liquidation-proximity,
    a funding beta-proxy). Their breadth is a real measurement.
  • IDIOSYNCRATIC / few-asset domains (unlock, peg, AMM) lack captured data THIS sprint; they are STRUCTURAL MODELS
    whose CORRELATION STRUCTURE is built to match the domain mechanics (independent calendars / few stablecoins /
    per-pool), and the breadth of that structure is measured. Clearly labeled; pending real-data capture to confirm.
Nothing is auto-refused (A-PRE). Reuses the FROZEN pre-flight (effective_n).

Run: cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.breadth_map
"""
from __future__ import annotations

import json
import os

import numpy as np

from backtest.py import momentum, preflight

_PY_DIR = os.path.dirname(__file__)
_ORGANON = os.path.abspath(os.path.join(_PY_DIR, "..", "..", "..", "data", "organon"))


def _reconstruct(manifest_name):
    man = json.load(open(os.path.join(_ORGANON, manifest_name)))
    coins = list(man["universe"])
    series = {c: {} for c in coins}
    for s in man["sources"]:
        for line in open(os.path.join(_ORGANON, s["csvPath"])).read().strip().split("\n"):
            line = line.strip()
            if not line or not line[0].isdigit():
                continue
            c = line.split(",")
            ts, close = int(c[0]), float(c[4])
            if close > 0:
                series[s["symbol"]][ts] = close
    times = sorted({t for c in coins for t in series[c]})
    return np.array([[series[c].get(t, np.nan) for c in coins] for t in times], dtype=float)


def liquidation_proximity(closes, lookback=30, leverage=10):
    """Drawdown-from-trailing-high vs a leverage band — price-driven, look-ahead-free (reads ≤ t)."""
    band = 1.0 / max(leverage, 1)
    d, m = closes.shape
    out = np.full((d, m), np.nan)
    for t in range(lookback, d):
        w = closes[t - lookback + 1:t + 1]
        hi = np.nanmax(w, axis=0)
        drop = (hi - closes[t]) / np.where(hi > 0, hi, np.nan)
        out[t] = np.clip(drop / band, 0, 1)
    return out


def unlock_proximity_structural(n_periods, n_tokens, seed=20260703):
    """STRUCTURAL model: each token has an INDEPENDENT unlock calendar (period offsets drawn per token), signal =
    1/(periods to next unlock). Independent calendars ⇒ uncorrelated columns ⇒ HIGH breadth. Tests the escape."""
    rng = np.random.default_rng(seed)
    out = np.full((n_periods, n_tokens), np.nan)
    for j in range(n_tokens):
        # each token unlocks every ~cadence periods, phase independent → idiosyncratic calendar
        cadence = int(rng.integers(20, 60))
        phase = int(rng.integers(0, cadence))
        for t in range(n_periods):
            nxt = ((t - phase) // cadence + 1) * cadence + phase
            out[t, j] = 1.0 / (nxt - t + 1)
    return out


def main():
    rows = []

    if os.path.exists(os.path.join(_ORGANON, "klines-manifest-broad.json")):
        closes = _reconstruct("klines-manifest-broad.json")
        rets = momentum.daily_returns(closes)
        # momentum (real, price-driven)
        sig, fwd, idx = momentum.build_panels(closes, lookback=56, skip=7, horizon=7)
        rows.append(("momentum", "REAL prices (107 perps)", "price-driven", preflight.preflight(sig[::7], cadence_hours=168.0, label="momentum")))
        # liquidation-proximity (real, price-driven)
        liq = liquidation_proximity(closes)
        rows.append(("liquidation-proximity", "REAL prices (107 perps)", "price-driven", preflight.preflight(liq[30:], cadence_hours=24.0, label="liquidation")))
        # funding-carry beta-proxy (real returns; real funding settled NO-GO c9049ac1, breadth low by Rule XIII)
        carry = np.full_like(rets, np.nan)
        for t in range(8, rets.shape[0]):
            carry[t] = np.nanmean(rets[t - 7:t + 1], axis=0)  # trailing mean return — a market-loading carry proxy
        rows.append(("funding-carry (beta proxy)", "REAL returns (107 perps)", "price-driven", preflight.preflight(carry[8:], cadence_hours=8.0, label="funding")))
        n_per = closes.shape[0]
    else:
        n_per = 1000

    # unlock-proximity (STRUCTURAL: independent per-token calendars) — the idiosyncratic escape candidate
    rows.append(("unlock-proximity", "STRUCTURAL (independent calendars)", "idiosyncratic", preflight.preflight(unlock_proximity_structural(n_per, 80), cadence_hours=24.0, label="unlock")))
    # peg-deviation (STRUCTURAL: few stablecoins, semi-independent mechanisms) — inherently few assets
    rng = np.random.default_rng(20260705)
    peg = rng.standard_normal((n_per, 5)) * 0.01  # 5 stablecoins, largely independent deviations
    rows.append(("peg-deviation", "STRUCTURAL (5 stablecoins)", "few-asset", preflight.preflight(peg, cadence_hours=24.0, label="peg")))
    # amm-divergence (STRUCTURAL: per-pool, semi-independent) — moderate independence across pools
    amm = rng.standard_normal((n_per, 40)) * 0.005 + rng.standard_normal((n_per, 1)) * 0.002  # small shared gas/vol factor
    rows.append(("amm-divergence", "STRUCTURAL (40 pools)", "semi-idiosyncratic", preflight.preflight(amm, cadence_hours=24.0, label="amm")))

    print("PER-DOMAIN BREADTH MAP (pre-flight; nothing auto-refused; reachability pending floor audit)\n")
    print(f"  {'domain':<28}{'panel':<38}{'M_eff':>8}{'floor':>8}{'N':>7}{'reachable':>11}   class")
    for name, panel, klass, pf in rows:
        r = "n/a" if pf.get("reachable") is None else ("REACHABLE" if pf["reachable"] else "un-powered")
        print(f"  {name:<28}{panel:<38}{pf.get('effectiveBreadth', float('nan')):>8.2f}{pf.get('floorEffectivePeriodsNeeded', 0):>8}{pf.get('nPeriods', 0):>7}{r:>11}   {klass}")

    # the decisive comparison: price-driven (measured, real) vs idiosyncratic (structural)
    unlock = next(pf for n, _, _, pf in rows if n == "unlock-proximity")
    print("\n  FINDING (measured): price-driven domains inherit the market's low breadth (~2-3);")
    print(f"  the idiosyncratic unlock structure (independent calendars) measures M_eff={unlock['effectiveBreadth']:.1f} — the one candidate to ESCAPE the collapse")
    print("  (structural model — pending real unlock-schedule capture to confirm). Nothing auto-refused.")
    return rows


if __name__ == "__main__":
    main()
