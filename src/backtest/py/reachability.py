"""W2 Phase 2/6 — statistical-reachability metrics over per-strategy MAXIMAL windows.

This module answers "could a strategy clear DSR, given its OWN full history?" — distinct from the
common-window Decision (Part B.1). It COMPOSES the audited rigor formulas (per_obs_sharpe, psr,
deflated_sharpe) — it does NOT alter them. Each strategy's returns are computed over its own maximal
coherent window (the TS side derives the window from the intersection of that strategy's legs), so the
series have DIFFERENT lengths; `V` (trial-Sharpe variance) is the spread of the cohort's per-window
Sharpes, and DSR_i = PSR_i(SR0(V, N)). Interface: pure JSON in -> JSON out.

Run as a sidecar: `python -m backtest.py.reachability` (JSON stdin -> JSON stdout).
"""
from __future__ import annotations

import json
import sys

import numpy as np

from backtest.py.rigor import per_obs_sharpe, psr, sr0_deflated, deflated_sharpe, json_safe, BARS_PER_YEAR
from backtest.py.evaluate import metrics_from_returns  # audited metric defs (sortino/maxdd/cagr/calmar/vol)


def run_reachability(payload):
    series = payload["series"]            # list of per-strategy return arrays (heterogeneous lengths)
    n_trials = int(payload["nTrials"])    # the deflation N (Rule I: more trials -> lower DSR)
    # W2.9 degeneracy floors (MECHANICAL, pre-specified; never hand-picked). A trial is a zero-vol yield
    # ARTIFACT — "no genuine downside" — if ANY of three symptoms hold (Appendix A, the OR-of-three):
    #   (1) Sortino undefined (no down days at all), OR
    #   (2) |maxdd| < MAXDD_FLOOR (negligible drawdown), OR
    #   (3) annualized vol < VOL_FLOOR (near-deterministic accrual).
    # The OR is load-bearing: a near-monotonic series with ONE down day has a DEFINED Sortino yet maxdd≈0
    # and vol≈0 (e.g. annVol 0.1%, annSharpe ~37) — a pure artifact that a Sortino-only test would wrongly
    # admit as "genuine downside" and let manufacture a spurious COHORT signal. (2)/(3) exclude it.
    maxdd_floor = float(payload.get("maxddFloor", 0.005))
    vol_floor = float(payload.get("volFloor", 0.01))
    sharpes = [per_obs_sharpe(s) for s in series]
    # audited per-series metrics (sortino/maxdd/cagr/calmar/vol) — used for the degeneracy flag too
    metas = [metrics_from_returns(np.asarray(s, dtype=float), np.zeros(len(s))) for s in series]
    degenerate = [(m["sortino"] is None) or (abs(m["maxdd"]) < maxdd_floor) or (m["vol"] < vol_floor) for m in metas]
    # V is the cohort trial-Sharpe spread; the sweeps (Phase 6) pin it explicitly so that ONLY the
    # swept variable (window length or trial count) moves, isolating each sensitivity direction.
    if payload.get("varSharpe") is not None:
        var_sharpe = float(payload["varSharpe"])
    else:
        finite = [x for x in sharpes if np.isfinite(x)]
        var_sharpe = float(np.var(finite, ddof=1)) if len(finite) > 1 else 0.0
    sr0 = sr0_deflated(var_sharpe, n_trials)
    # W2.9 diagnostic — V_clean = dispersion over NON-degenerate trials ONLY. N (the trial count entering
    # SR0) is UNCHANGED (Rule V: trials are never un-counted; only the dispersion *input* changes). The
    # audited deflation formula is CALLED with var_clean, never modified.
    clean_sharpes = [sh for sh, d in zip(sharpes, degenerate) if (not d) and np.isfinite(sh)]
    var_clean = float(np.var(clean_sharpes, ddof=1)) if len(clean_sharpes) > 1 else 0.0
    sr0_clean = sr0_deflated(var_clean, n_trials)   # SAME n_trials (Rule V)
    n_degenerate = int(sum(degenerate))
    # STRICT (Sortino-only) proxy — for the integrity DISCLOSURE only (not the headline). A loose
    # degeneracy criterion lacking the maxdd/vol floors admits near-monotonic artifacts (one down day ⇒
    # Sortino defined, yet annVol~0.1% / annSharpe~37) into V_clean and manufactures a SPURIOUS COHORT
    # signal (DSR_clean~0.98 on an artifact). The OR-of-three above excludes them; this shows what it caught.
    degenerate_strict = [m["sortino"] is None for m in metas]
    clean_strict = [sh for sh, d in zip(sharpes, degenerate_strict) if (not d) and np.isfinite(sh)]
    var_clean_strict = float(np.var(clean_strict, ddof=1)) if len(clean_strict) > 1 else 0.0
    sr0_clean_strict = sr0_deflated(var_clean_strict, n_trials)
    n_degenerate_strict = int(sum(degenerate_strict))
    strategies = []
    for s, sh, m, d in zip(series, sharpes, metas, degenerate):
        r = np.asarray(s, dtype=float)
        strategies.append({
            "n_obs": int(r.size),
            "sharpe": float(sh),                          # PER-OBSERVATION Sharpe (mean/sd) — feeds DSR
            "annSharpe": float(sh * np.sqrt(BARS_PER_YEAR)),  # W2.9 — interpretable annualized magnitude
            "annVol": m["vol"],                           # annualized volatility (evaluate.py) — degeneracy cross-check
            "degenerate": bool(d),                        # W2.9 mechanical no-genuine-downside flag (Rule III)
            "sortino": m["sortino"],   # None ⇒ zero-downside (the artifact); a number ⇒ genuine downside
            "maxdd": m["maxdd"],       # <= 0 ; 0 ⇒ no drawdown (monotonic)
            "cagr": m["cagr"],
            "calmar": m["calmar"],     # None ⇒ no drawdown
            "psr": psr(r, 0.0),                              # significance vs SR*=0 over this window
            "dsr": deflated_sharpe(r, n_trials, var_sharpe),    # DSR_full = PSR(SR0_full) — the audited headline
            "dsrClean": deflated_sharpe(r, n_trials, var_clean),  # W2.9 DSR_clean = PSR(SR0_clean) — DIAGNOSTIC (N fixed)
            "dsrCleanStrict": deflated_sharpe(r, n_trials, var_clean_strict),  # Sortino-only proxy — DISCLOSURE only
        })
    return {
        "varSharpe": var_sharpe, "sr0": float(sr0),
        # W2.9 both-ways dispersion (N identical in both — see nTrialsFull/nTrialsClean):
        "varSharpeClean": var_clean, "sr0Clean": float(sr0_clean), "nDegenerate": n_degenerate,
        "varSharpeCleanStrict": var_clean_strict, "sr0CleanStrict": float(sr0_clean_strict), "nDegenerateStrict": n_degenerate_strict,
        "nTrials": n_trials, "nTrialsFull": n_trials, "nTrialsClean": n_trials,
        "strategies": strategies,
    }


def main():
    payload = json.load(sys.stdin)
    json.dump(json_safe(run_reachability(payload)), sys.stdout)


if __name__ == "__main__":
    main()
