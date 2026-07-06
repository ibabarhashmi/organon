"""ORGΛNON — Attestation Engine: rigor adjudication of an EXTERNAL returns series (Phase 2).

CALLS the shared rigor (psr / deflated_sharpe / sr0_deflated / cpcv) — formulas UNTOUCHED (Rule VII). It runs the
rigor on a submitted/re-derived returns series and builds the n_trials SENSITIVITY CURVE (Rule XIII): significance
as a function of the claimant's declared search. The verdict CAP (by verifiability tier + search-honesty) is applied
on the TS side (adjudicate.ts); this module only computes the deterministic rigor evidence.

var_sharpe for DSR (the cross-trial Sharpe variance) is unknown for a single submission, so it is ESTIMATED
conservatively from the series' own block-Sharpe dispersion — a disclosed assumption, never a formula change.
"""
from __future__ import annotations

import json
import sys

import numpy as np

from backtest.py import rigor


# Hardening Phase 3: for an UNVERIFIABLE (V0/V1) series the null dispersion is biased CONSERVATIVE (×this factor) so
# significance is not overstated on inputs the engine could not re-derive. An EARNED V2 series is the engine's own
# executor output, so its Lo-2002 estimate is trustworthy and used un-inflated (conservative=False).
CONSERVATIVE_VAR_SHARPE_MULT = 2.0


def null_var_sharpe(returns: np.ndarray, conservative: bool = False) -> float:
    """var_sharpe for DSR (cross-trial Sharpe dispersion) is unobserved for a single submission. We use the SAMPLING
    variance of the per-observation Sharpe ESTIMATOR (Lo 2002): Var(SR_hat) ≈ (1 + 0.5·SR²)/T. This is the principled
    null-dispersion estimate the DSR framework assumes when the trials aren't observed. DISCLOSED: it is the
    most-favorable (null) dispersion, so the declared-search significance is an UPPER bound — the true significance
    given genuinely diverse trials is no higher (the declared path is never unconditional regardless). For an
    UNVERIFIABLE input (conservative=True) it is inflated so significance is biased DOWN (Rule IX)."""
    n = returns.size
    sr = rigor.per_obs_sharpe(returns)
    v = (1.0 + 0.5 * sr * sr) / max(n, 2)
    if conservative:
        v = v * CONSERVATIVE_VAR_SHARPE_MULT
    return max(v, 1e-9)


def adjudicate(payload: dict) -> dict:
    """payload: { returns, nTrialsGrid?, barsPerYear?, minObs?, conservativeVarSharpe? }. Deterministic rigor evidence.
    `minObs` is the DERIVED power floor (attest/power.ts) — the asserted n<30 is gone. `conservativeVarSharpe` biases
    the null dispersion for unverifiable (V0/V1) inputs."""
    r = np.asarray(payload["returns"], dtype=float)
    r = r[np.isfinite(r)]
    bpy = int(payload.get("barsPerYear", rigor.BARS_PER_YEAR))
    grid = payload.get("nTrialsGrid", [1, 10, 100, 1000, 10000])
    min_obs = int(payload.get("minObs", 30))  # DERIVED floor passed by the adjudicator (default 30 only if unset)
    conservative = bool(payload.get("conservativeVarSharpe", False))
    n = r.size

    if n < min_obs:
        return {"nObs": int(n), "insufficient": True, "minObs": int(min_obs)}

    sharpe_per_obs = rigor.per_obs_sharpe(r)
    sharpe_ann = rigor.annualized_sharpe(r, bpy)
    psr0 = rigor.psr(r, 0.0)  # P(true Sharpe > 0) on the raw series (the pre-registered, no-deflation significance)
    var_sharpe = null_var_sharpe(r, conservative=conservative)

    # the n_trials SENSITIVITY CURVE (Rule XIII): DSR as a function of the claimant's declared search
    sensitivity = [{"nTrials": int(n_t), "dsr": rigor.deflated_sharpe(r, int(n_t), var_sharpe)} for n_t in grid]
    cp = rigor.cpcv(r, n_groups=6, k=2, bars_per_year=bpy)

    return {
        "nObs": int(n),
        "insufficient": False,
        "minObs": int(min_obs),
        "conservativeVarSharpe": conservative,
        "sharpePerObs": sharpe_per_obs,
        "sharpeAnnualized": sharpe_ann,
        "psr0": psr0,
        "varSharpe": var_sharpe,
        "sensitivity": sensitivity,
        "cpcv": {"mean": cp["mean"], "p5": cp["p5"], "p95": cp["p95"]},
    }


def main():
    payload = json.load(sys.stdin)
    json.dump(rigor.json_safe(adjudicate(payload)), sys.stdout)


if __name__ == "__main__":
    main()
