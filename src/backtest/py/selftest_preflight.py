"""ORGΛNON — breadth pre-flight VALIDATION (Phase 0). Proves the pre-flight (a) computes breadth/floor/reachability
from a panel's correlation structure alone, (b) MATCHES the engine's own late computation on the last sprint's
panels, (c) REPORTS but does NOT auto-refuse (default), (d) hedges reachability 'pending floor audit'.

Run: cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.selftest_preflight
"""
from __future__ import annotations

import hashlib
import json
import os

import numpy as np

from backtest.py import effective_n, momentum, preflight

_PY_DIR = os.path.dirname(__file__)
_ORGANON = os.path.abspath(os.path.join(_PY_DIR, "..", "..", "..", "data", "organon"))
FAIL = []


def check(name, cond, detail=""):
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAIL.append(name)


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
    closes = np.array([[series[c].get(t, np.nan) for c in coins] for t in times], dtype=float)
    return closes


def main():
    print("breadth pre-flight validation — reuses the FROZEN effective_n (byte-identical to the engine's math).\n")

    if not os.path.exists(os.path.join(_ORGANON, "klines-manifest.json")):
        print("  (20-perp klines absent — run script/bar-calibration-capture.ts; skipping real-panel checks)")
    else:
        closes = _reconstruct("klines-manifest.json")
        rets = momentum.daily_returns(closes)
        sig, fwd, idx = momentum.build_panels(closes, lookback=56, skip=7, horizon=7)
        sig_w = sig[::7]  # weekly non-overlap — the exact panel the bar-calibration discriminator judged

        # (1) the pre-flight on the MOMENTUM SIGNAL panel matches the engine's late effBreadth (≈ 2.43)
        pf_sig = preflight.preflight(sig_w, target_ic=0.05, cadence_hours=168.0, label="20-perp momentum signal")
        eng_breadth = effective_n.effective_breadth(sig_w)  # what deflate_report(panel_matrix=carry) computes
        check("pre-flight effBreadth == engine effective_breadth on the SAME signal panel (byte-consistent)",
              abs(pf_sig["effectiveBreadth"] - eng_breadth) < 1e-9, f"pre-flight={pf_sig['effectiveBreadth']:.4f} engine={eng_breadth:.4f}")
        check("20-perp momentum panel → effBreadth ≈ 2.4 (matches last sprint's 2.43)",
              2.0 < pf_sig["effectiveBreadth"] < 3.0, f"effBreadth={pf_sig['effectiveBreadth']:.3f}")
        check("20-perp momentum panel → floor ≈ 5899 (matches last sprint)",
              pf_sig["floorEffectivePeriodsNeeded"] == 5899, f"floor={pf_sig['floorEffectivePeriodsNeeded']}")
        check("20-perp momentum panel → reachable=FALSE (N ≪ floor → structurally un-powered)",
              pf_sig["reachable"] is False, f"reachable={pf_sig['reachable']} N={pf_sig['nPeriods']} floor={pf_sig['floorEffectivePeriodsNeeded']}")

        # (2) the RETURNS panel (market structure, NO signal) — the pre-flight's canonical input — is also low-breadth
        pf_ret = preflight.preflight(rets[1:], target_ic=0.05, cadence_hours=24.0, label="20-perp daily returns (no signal)")
        check("returns panel (no signal) → low breadth too (single market factor dominates)",
              pf_ret["effectiveBreadth"] < 6.0, f"returns effBreadth={pf_ret['effectiveBreadth']:.3f}")

    # (3) NOISE panel — iid columns → HIGH breadth (independent bets) → floor far lower
    rng = np.random.default_rng(20260703)
    noise = rng.standard_normal((200, 60))
    pf_noise = preflight.preflight(noise, target_ic=0.05, cadence_hours=24.0, label="iid noise (60 cols)")
    check("noise panel → HIGH breadth (iid independent columns)", pf_noise["effectiveBreadth"] > 40.0, f"effBreadth={pf_noise['effectiveBreadth']:.1f}")

    # (4) SYNTHETIC HIGH-BREADTH, LONG panel → reachable=TRUE (N ≥ floor)
    big = rng.standard_normal((3000, 80))
    pf_big = preflight.preflight(big, target_ic=0.05, cadence_hours=24.0, label="synthetic high-breadth, long")
    check("synthetic high-breadth + long panel → reachable=TRUE (floor not structurally unreachable)",
          pf_big["reachable"] is True, f"reachable={pf_big['reachable']} N={pf_big['nPeriods']} floor={pf_big['floorEffectivePeriodsNeeded']} effBreadth={pf_big['effectiveBreadth']:.1f}")

    # (5) REPORTS, does NOT auto-refuse (A-PRE): default autoRefuse=False → refused=False even when un-powered
    pf_default = preflight.preflight(noise[:20, :5], target_ic=0.05, label="tiny panel (default flags)")
    check("default: autoRefuse=False and refused=False (pre-flight REPORTS, never auto-refuses)",
          pf_default["autoRefuse"] is False and pf_default["refused"] is False)
    # even with the disclosed flag ON, it only MARKS refused — the gating is the operator's on an audited floor
    pf_flag = preflight.preflight(noise[:20, :5], target_ic=0.05, auto_refuse=True, label="flag ON")
    check("flag ON only MARKS refused (disclosed, default-OFF behavior); reachability still reported",
          pf_flag["refused"] == (not pf_flag["reachable"]) and "reachable" in pf_flag)

    # (6) reachability is HEDGED 'pending floor audit' (Rule XXXVIII)
    check("reachability hedged 'pending floor audit' (never settled truth)",
          "PENDING FLOOR AUDIT" in pf_default["hedge"].upper())

    # (7) determinism — byte-reproducible on a fixed panel
    a = hashlib.sha256(json.dumps(preflight.preflight(noise, label="det"), sort_keys=True, default=str).encode()).hexdigest()[:12]
    b = hashlib.sha256(json.dumps(preflight.preflight(noise, label="det"), sort_keys=True, default=str).encode()).hexdigest()[:12]
    check("deterministic (byte-reproducible)", a == b, f"{a}=={b}")

    print(f"\npre-flight validation: {'ALL PASS' if not FAIL else 'FAIL -> ' + ', '.join(FAIL)}")
    raise SystemExit(0 if not FAIL else 1)


if __name__ == "__main__":
    main()
