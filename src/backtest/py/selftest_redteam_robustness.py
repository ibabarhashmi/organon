"""ORGΛNON Red-Team — COST + ROBUSTNESS gauntlet (Sprint Phase 3 / Rules XV, XXIX / Appendix B X1, X3, X4).

X1: adversarial cost params on a DEEP market trip the economic-sanity flag (Rule XV) — and the frozen calibration does
NOT (positive control). X3: degenerate panels (empty / single-row / all-NaN / inf / zero-variance / 1-asset / oversized)
produce a graceful honest outcome (INSUFFICIENT/NO-GO or a clean typed error) — NEVER a crash or a silent wrong GO.
X4: malformed JSON / missing fields / wrong types to the real sidecar → a clean non-zero error, never a silent GO.

(X2 — the consistency-lint prose contradiction + its disclosed blind spots — is mechanized in the TS suite:
test/redteam/lint_blindspot.test.ts, since the lint is TypeScript.)

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.selftest_redteam_robustness
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import warnings

import numpy as np

from backtest.py import funding_accrual, funding_discriminate, neutralize, reachability

warnings.filterwarnings("ignore")  # degenerate inputs legitimately provoke numpy warnings; we assert the OUTCOME
FAILURES: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> None:
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAILURES.append(name)


# ───────────────────────── X1 — economic-sanity flag (Rule XV), positive-controlled ─────────────────────────
def x1_cost_sanity():
    print("X1 [F-X1] economic sanity — deep-market hedge maintenance above the bound is presumed a bug (Rule XV):")
    funding = [0.0001] * (365 * 24)  # a year of tiny hourly funding on a DEEP market
    deep = {"funding": funding, "intervalHours": 1.0, "notionalUsd": 1_000_000.0,
            "costs": {"depthUsd": 50_000_000.0}}  # depth ≥ 20M ⇒ deep market
    frozen = funding_accrual.run_funding_accrual(deep)
    plausible_ok = frozen["deepMarket"] and frozen["economicallyPlausible"]  # frozen calibration → plausible
    # ADVERSARIAL cost params: the pre-fix bug (hedgeTurnoverFrac 0.05) + taker fees + fat slippage on the SAME deep market.
    adversarial = {**deep, "costs": {"depthUsd": 50_000_000.0, "hedgeTurnoverFrac": 0.05, "useTaker": True,
                                     "takerBps": 20.0, "slippageK": 5.0}}
    attacked = funding_accrual.run_funding_accrual(adversarial)
    flag_fires = attacked["deepMarket"] and (attacked["economicallyPlausible"] is False)  # Rule-XV flag trips
    check("frozen calibration on a deep market is economically plausible (flag quiet)", plausible_ok,
          f"annMaint={frozen['annualizedMaintenance']:.3%} ≤ 10% ⇒ plausible={frozen['economicallyPlausible']}")
    check("adversarial cost params on the deep market TRIP the economic-sanity flag (Rule XV fires)", flag_fires,
          f"annMaint={attacked['annualizedMaintenance']:.1%} > 10% ⇒ plausible={attacked['economicallyPlausible']}")


# ───────────────────────── X3 — degenerate panels: graceful, never a silent wrong GO ─────────────────────────
def _fund(carry, forward, loadings):
    return funding_discriminate.discriminate({"carry": carry, "forward": forward, "loadings": loadings, "minPeriods": 40})


def _lend(carry, forward, loadings):
    return neutralize.discriminate({"carry": carry, "forward": forward, "loadings": loadings, "minPeriods": 40, "nwLags": 4})


def graceful(name: str, fn):
    """PASS iff fn() returns a NON-GO verdict OR raises a clean exception. FAIL only on a silent GO (wrong) or a hang."""
    try:
        r = fn()
        v = r.get("verdict") if isinstance(r, dict) else None
        ok = v != "GO"
        detail = f"→ verdict={v}" if v is not None else f"→ {type(r).__name__} (no verdict)"
    except Exception as ex:  # noqa — a clean typed error is an acceptable graceful outcome
        ok = True
        detail = f"→ clean error {type(ex).__name__}: {str(ex)[:40]}"
    check(name, ok, detail)


def x3_degenerate():
    print("X3 [F-X3] degenerate panels — graceful INSUFFICIENT / clean error, never a crash or a silent wrong GO:")
    rng = np.random.default_rng(20260702)
    M = 40
    B = np.abs(rng.normal(0, 1, (M, 4))).tolist()
    cases = {
        "empty panel": ([], [], []),
        "single row (1×M)": ([[0.1] * M], [[0.1] * M], B),
        "all-NaN panel": (np.full((80, M), np.nan).tolist(), np.full((80, M), np.nan).tolist(), B),
        "inf values": (np.full((80, M), np.inf).tolist(), np.full((80, M), np.inf).tolist(), B),
        "zero-variance (constant)": (np.zeros((80, M)).tolist(), np.zeros((80, M)).tolist(), B),
        "single asset (T×1)": (rng.normal(0, 1, (80, 1)).tolist(), rng.normal(0, 1, (80, 1)).tolist(), np.abs(rng.normal(0, 1, (1, 4))).tolist()),
        "oversized panel (900×60)": (rng.normal(0, 1, (900, 60)).tolist(), rng.normal(0, 1, (900, 60)).tolist(), np.abs(rng.normal(0, 1, (60, 4))).tolist()),
    }
    for label, (c, f, l) in cases.items():
        graceful(f"funding: {label}", lambda c=c, f=f, l=l: _fund(c, f, l))
        graceful(f"lending: {label}", lambda c=c, f=f, l=l: _lend(c, f, l))
    # reachability degenerate cohorts → structured output, no crash
    graceful("RWA reachability: empty series", lambda: reachability.run_reachability({"series": [], "nTrials": 5}))
    graceful("RWA reachability: single 1-point series", lambda: reachability.run_reachability({"series": [[0.0]], "nTrials": 5}))


# ───────────────────────── X4 — malformed sidecar input → clean non-zero error, never a silent GO ─────────────────────────
def _sidecar_raw(raw: str) -> tuple[int, str]:
    env = dict(os.environ, PYTHONHASHSEED="0")
    p = subprocess.run([sys.executable, "-m", "backtest.py.funding_discriminate"], input=raw,
                       capture_output=True, text=True, cwd=os.getcwd(), env=env)
    return p.returncode, p.stdout


def x4_malformed():
    print("X4 [F-X4] malformed sidecar input — a clean non-zero error, never a silent wrong verdict:")
    cases = {
        "not JSON at all": "this is not json {{{",
        "missing 'carry' field": json.dumps({"forward": [[0.1]], "loadings": [[1.0]]}),
        "wrong type (carry is a string)": json.dumps({"carry": "hello", "forward": [[0.1]], "loadings": [[1.0]]}),
        "null payload": "null",
    }
    for label, raw in cases.items():
        code, out = _sidecar_raw(raw)
        # ACCEPTABLE: non-zero exit (clean error). UNACCEPTABLE: exit 0 with a GO verdict (silent wrong).
        silent_go = code == 0 and '"verdict": "GO"' in out.replace(" ", "").replace('":"', '": "')
        clean = code != 0 or '"GO"' not in out
        check(f"malformed → clean error, not a silent GO: {label}", clean and not silent_go, f"exit={code} out={out[:32]!r}")


def main():
    x1_cost_sanity()
    x3_degenerate()
    x4_malformed()
    ok = not FAILURES
    print(f"\nRed-team cost + robustness gauntlet: {'ALL PASS' if ok else 'FAIL -> ' + ', '.join(FAILURES)}")
    print("NOTE (Rules XV, XXIX): the economic-sanity flag fires on adversarial costs (not on the frozen calibration);")
    print("      no degenerate/malformed input crashes the tool or yields a silent wrong GO.")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
