"""ORGΛNON — TWO-FAILURE-MODE validation (Phase 1). Proves every refusal is labeled edge-weak vs structurally-
un-powered, DERIVED from the frozen discriminator's own output + the pre-flight — on REAL verdicts, not asserted.

Run: cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.selftest_failure_mode
"""
from __future__ import annotations

import json
import os

import numpy as np

from backtest.py import failure_mode, funding_discriminate, momentum, preflight

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
    return np.array([[series[c].get(t, np.nan) for c in coins] for t in times], dtype=float)


def _disc(carry, forward, loadings):
    return funding_discriminate.discriminate({"carry": np.asarray(carry).tolist(), "forward": np.asarray(forward).tolist(),
                                              "loadings": np.asarray(loadings).tolist(), "minPeriods": 30,
                                              "cadenceHours": 168.0, "targetIC": 0.05, "tier": "T1", "fullDisclosure": True})


def main():
    print("two-failure-mode validation — REAL verdicts through the FROZEN discriminator, then classified.\n")

    if os.path.exists(os.path.join(_ORGANON, "klines-manifest.json")):
        closes = _reconstruct("klines-manifest.json")
        sig, fwd, idx = momentum.build_panels(closes, lookback=56, skip=7, horizon=7)
        rets = momentum.daily_returns(closes)
        loadings = np.column_stack([momentum.market_beta(rets), momentum.realized_vol(rets)])
        sig_w, fwd_w = sig[::7], fwd[::7]
        pf_panel = preflight.preflight(sig_w, target_ic=0.05, cadence_hours=168.0, label="momentum")

        # REAL momentum verdict → classify
        mom = _disc(sig_w, fwd_w, loadings)
        mom_c = failure_mode.classify(mom, pf_panel)
        check("REAL momentum → structurally-un-powered (panel breadth 2.3 can't power any signal)",
              mom_c["failureMode"] == "structurally-un-powered", f"mode={mom_c['failureMode']} verdict={mom['verdict']} deflT={mom.get('deflatedOosTstat'):+.3f}")
        check("REAL momentum → BOTH causes reported (also edge-weak: floor-removed still NO-GO)",
              mom_c["signalWeak"] is True and "edge-weak" in mom_c["contributingCauses"], f"causes={mom_c['contributingCauses']}")

        # REAL perfect-foresight verdict → classify (strong edge, un-powered panel → structurally-un-powered, NOT edge-weak)
        pf_rng = np.random.default_rng(20260704)
        pf_sig = np.where(np.isfinite(fwd_w), fwd_w + pf_rng.normal(0, 1e-3, size=fwd_w.shape), np.nan)
        pf = _disc(pf_sig, fwd_w, loadings)
        pf_c = failure_mode.classify(pf, pf_panel)
        check("REAL perfect-foresight → structurally-un-powered (strong edge, un-powered PANEL)",
              pf_c["failureMode"] == "structurally-un-powered", f"mode={pf_c['failureMode']} verdict={pf['verdict']} deflT={pf.get('deflatedOosTstat'):+.1f}")
        check("REAL perfect-foresight → signalWeak=FALSE (floor-removed WOULD GO — the edge is real, the panel isn't)",
              pf_c["signalWeak"] is False and pf_c["floorRemovedWouldGO"] is True, f"signalWeak={pf_c['signalWeak']} floorRemovedGO={pf_c['floorRemovedWouldGO']}")
        # THE DISTINCTION: momentum and perfect-foresight are BOTH refused, but for DIFFERENT reasons
        check("THE DISTINCTION: momentum is edge-weak+un-powered; perfect-foresight is un-powered ONLY (edge real)",
              mom_c["signalWeak"] != pf_c["signalWeak"], f"momentum.signalWeak={mom_c['signalWeak']} vs perfect-foresight.signalWeak={pf_c['signalWeak']}")
    else:
        print("  (klines absent — skipping real-verdict checks)")

    # SYNTHETIC edge-weak: a reachable (high-breadth) panel + a genuinely weak signal → edge-weak (NOT structural)
    reachable_pf = {"reachable": True}
    edge_weak_result = {"verdict": "NO-GO", "deflatedOosTstat": 1.4, "oosResidualIcMean": 0.015,
                        "oosPortfolioTstat": 0.9, "oosPortfolioMean": 0.001}
    ew = failure_mode.classify(edge_weak_result, reachable_pf)
    check("SYNTHETIC weak signal on a reachable panel → edge-weak (real signal, doesn't survive)",
          ew["failureMode"] == "edge-weak" and ew["panelUnpowered"] is False, f"mode={ew['failureMode']}")

    # a GO → failureMode none
    go = failure_mode.classify({"verdict": "GO"}, reachable_pf)
    check("GO → failureMode none", go["failureMode"] == "none")

    # mode is DERIVED, not asserted: flipping a t-stat flips signalWeak
    strong = failure_mode.classify({"verdict": "INSUFFICIENT-EVIDENCE", "deflatedOosTstat": 50, "oosResidualIcMean": 0.4,
                                    "oosPortfolioTstat": 12, "oosPortfolioMean": 0.02}, {"reachable": False})
    check("mode DERIVED from data: strong-signal INSUFFICIENT (floored) → structurally-un-powered, signalWeak=False",
          strong["failureMode"] == "structurally-un-powered" and strong["signalWeak"] is False)

    print(f"\nfailure-mode validation: {'ALL PASS' if not FAIL else 'FAIL -> ' + ', '.join(FAIL)}")
    raise SystemExit(0 if not FAIL else 1)


if __name__ == "__main__":
    main()
