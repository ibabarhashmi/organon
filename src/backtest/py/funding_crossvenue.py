"""ORGΛNON Funding-Carry — CROSS-VENUE dispersion at pre-registered, persistence-separable horizons
(Unified Sprint P3 / Rules XIII, XII — fixes C2/C3).

C2: the scored funding verdict was HL-only cross-ASSET. C3: its high residual IC at a 1-hour target is persistence,
not dispersion. This module runs the ACTUAL cross-VENUE hypothesis on real captured data (HL vs Binance on the shared
assets), at a PRE-REGISTERED horizon set — ALL reported, MULTIPLE-TESTING corrected (Holm), and breadth-deflated.

The honest tradable target (Rule XIII / Appendix F: predict the observed funding, never a price; and NEVER let the
signal appear in the forward): signal = the cross-venue BASIS at entry, basis[t] = HL_annualized − Binance_annualized;
forward = the basis you actually COLLECT over the holding period, mean(basis[t+1 .. t+h]) — NO overlap with the entry
instant (an earlier draft used −(basis[t+h]−basis[t]), which put basis[t] on both sides and manufactured a
regression-to-the-mean false GO; caught by scrutinizing an implausible IC that rose with horizon). A high IC here is
basis PERSISTENCE = CARRY (the funding level = beta, Rule XIII) — never a GO on its own; and if it DECAYS at longer
horizons it is persistence, not a durable edge (the C3 separability test). Same-asset cross-venue funding is
near-collinear, so effective breadth is small — a NULL / NO-GO is a valid, expected outcome. Deterministic; reads
only captured files; reuses effective_n for the deflation.

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.funding_crossvenue
"""
from __future__ import annotations

import glob
import json
import os
import sys
import warnings

import numpy as np
from scipy.stats import spearmanr

warnings.filterwarnings("ignore", message="Mean of empty slice")

from backtest.py import effective_n

# PRE-REGISTERED horizons in 8h prints (the Binance settlement cadence, the common clock): 8h, 1d, 3d. All reported.
HORIZONS = {"8h": 1, "1d": 3, "3d": 9}
MIN_ASSETS = 8          # cross-section needs this many finite pairs to contribute an IC
T_GATE = 3.0
IC_MIN = 0.02


def _root() -> str:
    d = os.path.abspath(os.path.dirname(__file__))
    for _ in range(12):
        if os.path.isdir(os.path.join(d, "data", "funding")):
            return d
        d = os.path.dirname(d)
    return os.getcwd()


def load_crossvenue_panel():
    """Align HL (hourly) and Binance (8h) native history on Binance's 8h grid for the SHARED assets. Returns
    (assets, times, basis[T,M]) where basis = HL_annualized − Binance_annualized at each 8h instant (nearest HL print)."""
    root = _root()
    hl_files = {os.path.basename(f)[:-5]: f for f in glob.glob(os.path.join(root, "data", "funding", "history", "hl", "*.json"))}
    bn_files = {os.path.basename(f)[:-9]: f for f in glob.glob(os.path.join(root, "data", "funding", "history", "binance", "*.json"))}  # <COIN>USDT.json
    shared = sorted(set(hl_files) & set(bn_files))
    per_asset = {}
    all_times = set()
    for coin in shared:
        hl = json.load(open(hl_files[coin]))
        bn = json.load(open(bn_files[coin]))
        hl_pts = sorted((p["time"], p["annualized"]) for p in hl["points"] if p.get("annualized") is not None)
        hl_t = np.array([t for t, _ in hl_pts])
        hl_v = np.array([v for _, v in hl_pts])
        row = {}
        for p in bn["points"]:
            if p.get("annualized") is None:
                continue
            t = p["time"]
            # nearest HL print within 1h of the 8h Binance instant
            if hl_t.size:
                i = int(np.argmin(np.abs(hl_t - t)))
                if abs(hl_t[i] - t) <= 3_600_000:
                    row[t] = hl_v[i] - p["annualized"]  # cross-venue BASIS (HL − Binance), annualized
        if len(row) >= 10:
            per_asset[coin] = row
            all_times |= set(row)
    assets = sorted(per_asset)
    times = sorted(all_times)
    basis = np.array([[per_asset[a].get(t, np.nan) for a in assets] for t in times], dtype=float)
    return assets, times, basis


def _ic_series(signal, forward):
    out = []
    T = min(signal.shape[0], forward.shape[0])
    for i in range(T):
        s, f = signal[i], forward[i]
        ok = np.isfinite(s) & np.isfinite(f)
        if ok.sum() < MIN_ASSETS or np.ptp(s[ok]) == 0 or np.ptp(f[ok]) == 0:
            continue
        rho, _ = spearmanr(s[ok], f[ok])
        if np.isfinite(rho):
            out.append(float(rho))
    return np.array(out, dtype=float)


def run(payload=None):
    assets, times, basis = load_crossvenue_panel()
    T, M = basis.shape
    m_eff = effective_n.effective_breadth(basis)
    per_horizon = []
    for name, h in HORIZONS.items():
        if T <= h + 2:
            per_horizon.append({"horizon": name, "prints": h, "nPeriods": 0, "meanIC": None, "deflatedT": None, "note": "insufficient span"})
            continue
        # signal = basis[t] (entry); forward = REALIZED basis COLLECTED over (t, t+h] = mean(basis[t+1..t+h]).
        # NO overlap with basis[t] → no regression-to-the-mean artifact. A high IC = basis persistence (carry).
        sig = basis[: T - h]
        fwd = np.array([np.nanmean(basis[t + 1 : t + 1 + h], axis=0) for t in range(T - h)])
        ic = _ic_series(sig, fwd)
        n = ic.size
        tau = effective_n.decorrelation_time(ic) if n >= 5 else 0
        deflated_t = effective_n.nw_tstat(ic, tau) if n >= 2 else 0.0
        per_horizon.append({
            "horizon": name, "prints": h, "nPeriods": int(n),
            "meanIC": float(ic.mean()) if n else None,
            "deflatedT": float(deflated_t), "nwLags": int(tau),
        })
    # Holm multiple-testing correction across the reported horizons (|t| → two-sided p via normal approx)
    from math import erfc, sqrt
    tests = [(hh["horizon"], abs(hh["deflatedT"] or 0.0)) for hh in per_horizon if hh["nPeriods"]]
    pvals = sorted(((name, erfc(t / sqrt(2))) for name, t in tests), key=lambda x: x[1])
    holm = {}
    m = len(pvals)
    for k, (name, p) in enumerate(pvals):
        holm[name] = min(p * (m - k), 1.0)
    for hh in per_horizon:
        hh["holmP"] = holm.get(hh["horizon"])
        hh["significantHolm"] = bool(hh.get("holmP") is not None and hh["holmP"] < 0.05 and (hh["meanIC"] or 0) > IC_MIN)

    # separability read (C3): does a short-horizon IC DECAY at longer horizons? (decay ⇒ persistence, not durable edge)
    ics = [hh["meanIC"] for hh in per_horizon if hh["meanIC"] is not None]
    decays = len(ics) >= 2 and abs(ics[-1]) < abs(ics[0])
    any_sig = any(hh["significantHolm"] for hh in per_horizon)
    # Rule XIII: a significant RAW basis IC is CARRY/persistence (the funding level = beta) — NEVER a GO on its own.
    # A GO would require NEUTRALIZED residual dispersion surviving costs + deflation; the raw basis is not that.
    verdict = "NO-GO (raw basis carry = beta, Rule XIII)" if any_sig else "NULL (no cross-venue basis signal)"
    return {
        "assets": len(assets), "periods8h": T, "effectiveBreadth": m_eff,
        "horizons": per_horizon,
        "rawBasisIsCarry": any_sig,
        "separability": {"shortToLongDecays": decays, "note": "a short-horizon IC that decays at longer horizons is persistence, not durable edge (C3)"},
        "crossVenueVerdict": verdict,
        "note": "cross-venue basis PERSISTENCE (carry), Holm-corrected across pre-registered horizons, breadth-deflated (same-asset cross-venue funding near-collinear → small M_eff). Raw basis carry is NEVER a GO (Rule XIII); a GO needs neutralized residual dispersion surviving 2-leg costs. NO-GO/NULL is the expected, honest outcome.",
    }


def main():
    r = run()
    json.dump(r, open(os.path.join(_root(), "data", "funding", "crossvenue.json"), "w"), indent=2)
    if "--human" in sys.argv:
        print(f"CROSS-VENUE dispersion (real HL vs Binance): {r['assets']} shared assets × {r['periods8h']} 8h-prints; effective breadth M_eff={r['effectiveBreadth']:.1f} (near-collinear cross-venue)")
        print("pre-registered horizons (ALL reported, Holm-corrected):")
        for hh in r["horizons"]:
            ic = f"{hh['meanIC']:+.3f}" if hh["meanIC"] is not None else "n/a"
            dt = f"{hh['deflatedT']:+.2f}" if hh["deflatedT"] is not None else "n/a"
            hp = f"{hh['holmP']:.3f}" if hh.get("holmP") is not None else "n/a"
            print(f"  {hh['horizon']:>3} ({hh['prints']} print): n={hh['nPeriods']:>3}  meanIC={ic}  deflated-t={dt}  Holm-p={hp}  sig={hh.get('significantHolm')}")
        print(f"separability (C3): short→long IC decays = {r['separability']['shortToLongDecays']}  (raw basis IC is CARRY/persistence, not neutralized edge)")
        print(f"CROSS-VENUE VERDICT: {r['crossVenueVerdict']}")
    else:
        json.dump(r, sys.stdout)  # bridge mode (funding-verdict.ts reads this)
    sys.exit(0)


if __name__ == "__main__":
    main()
