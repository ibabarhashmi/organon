"""ORGΛNON Fee-Yield — Phase-4 FORWARD-CLOCK red-team (Blueprint Phase 4 / Rules XXI, XXXIII). Positive-controlled.

Proves: (1) the confirmation harness RUNS and refuses to bless on a too-short clock (dry-run → INSUFFICIENT, never a
premature GO); (2) THE WALL — only forward captures stamped AFTER the hypothesis freezeDate are admissible (a
pre-freeze capture, which could contain data the loop saw, is REJECTED); (3) NO-PREMATURE-VERDICT — the verdict is
gated on the admissible forward count, and even PAST the floor the harness NEVER fabricates a GO (it returns
PENDING-ACCRUAL — the powered verdict is downstream, on real accrued forward data). Uses SYNTHETIC capture MANIFESTS
(dates only, no fabricated market prices) to exercise the wall/gate, cleaned up in a finally.

Run:  cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.selftest_feeyield_forward
"""
from __future__ import annotations

import json
import os
import shutil
import sys

from backtest.py import feeyield_confirm

FAILURES = []


def check(name, cond, detail=""):
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAILURES.append(name)


def _fwd_dir():
    return os.path.join(feeyield_confirm._root(), "data", "feeyield", "forward")


def _mk_synthetic(stamp):
    d = os.path.join(_fwd_dir(), stamp)
    os.makedirs(d, exist_ok=True)
    json.dump({"captureStamp": stamp, "tier": "T2-forward-synthetic-test", "nPrices": 100},
              open(os.path.join(d, "MANIFEST.json"), "w"))
    return d


def test_dryrun():
    print("(F1) DRY-RUN — the harness runs and refuses to bless on the real ~0-day clock:")
    out = feeyield_confirm.confirm("FY-H1")
    check("verdict is INSUFFICIENT-EVIDENCE (not GO, not a premature verdict)", out["verdict"] == "INSUFFICIENT-EVIDENCE", out["verdict"])
    check("powered is False (no powered verdict yet)", out.get("powered") is False)


def test_wall_and_no_premature_go():
    print("\n(F2) THE WALL + NO-PREMATURE-VERDICT (positive-controlled with synthetic capture manifests):")
    freeze = feeyield_confirm.load_frozen()["freezeDate"]
    made = []
    try:
        made.append(_mk_synthetic("2000-01-01"))            # PRE-freeze → must be REJECTED by the wall
        future = [f"2099-01-{i:02d}" for i in range(1, 21)]  # 20 POST-freeze synthetic captures
        made += [_mk_synthetic(s) for s in future]
        caps = feeyield_confirm.forward_captures(freeze)
        pre = [c for c in caps if c["stamp"] == "2000-01-01"]
        check("the pre-freeze capture is NOT admissible (the wall rejects data the loop could have seen)",
              len(pre) == 1 and pre[0]["afterFreeze"] is False, "2000-01-01 afterFreeze=False")
        admissible = sum(1 for c in caps if c["afterFreeze"])
        check("post-freeze captures ARE admissible (20 synthetic)", admissible == 20, f"{admissible} admissible")

        # NO-PREMATURE-VERDICT: with the REAL floor (90), 20 captures → still INSUFFICIENT (never GO)
        out_real = feeyield_confirm.confirm("FY-H1")
        check("with 20 post-freeze captures < floor → INSUFFICIENT (never a premature GO)",
              out_real["verdict"] == "INSUFFICIENT-EVIDENCE", out_real["verdict"])

        # +control: DROP the floor (monkeypatch MIN_PERIODS=2) → the SAME captures cross the gate, but the harness
        # STILL does not fabricate a GO — it returns PENDING-ACCRUAL (the verdict is count-gated, GO only on real accrual)
        orig = feeyield_confirm.MIN_PERIODS
        feeyield_confirm.MIN_PERIODS = 2
        try:
            out_lowfloor = feeyield_confirm.confirm("FY-H1")
        finally:
            feeyield_confirm.MIN_PERIODS = orig
        check("[+control] dropping the floor lets the count clear the gate — proving the gate is count-driven",
              out_lowfloor["verdict"] != "INSUFFICIENT-EVIDENCE", out_lowfloor["verdict"])
        check("[+control] even past the gate the harness NEVER fabricates a GO (returns PENDING-ACCRUAL)",
              out_lowfloor["verdict"] != "GO", out_lowfloor["verdict"])
    finally:
        for d in made:
            shutil.rmtree(d, ignore_errors=True)


def test_gap_audit():
    print("\n(F3) GAP-AUDIT is computed over the admissible forward captures:")
    freeze = feeyield_confirm.load_frozen()["freezeDate"]
    made = []
    try:
        made.append(_mk_synthetic("2099-02-01"))
        made.append(_mk_synthetic("2099-02-20"))  # a 19-day gap → must be flagged
        audit = feeyield_confirm.gap_audit(feeyield_confirm.forward_captures(freeze))
        check("a > 3-day gap between forward captures is flagged", len(audit["gapsOver3d"]) >= 1, str(audit["gapsOver3d"]))
    finally:
        for d in made:
            shutil.rmtree(d, ignore_errors=True)


def main():
    print("═══ Fee-Yield Phase-4 FORWARD-CLOCK red-team (Rules XXI/XXXIII, positive-controlled) ═══\n")
    test_dryrun()
    test_wall_and_no_premature_go()
    test_gap_audit()
    ok = not FAILURES
    print(f"\n{'ALL PASS' if ok else 'FAIL → ' + ', '.join(FAILURES)}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
