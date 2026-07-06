"""Statistical rigor (blueprint Phase 6b / Appendix B): PSR, Deflated Sharpe Ratio,
PBO (CSCV), CPCV, and a purge+embargo splitter — implemented EXACTLY per Appendix B
(do not approximate). The golden-noise self-test (selftest.py) validates these, and
selftest also cross-checks DSR/PSR/PBO against the independent `purgedcv` package.

All Sharpe quantities here are PER-OBSERVATION (non-annualized) unless suffixed
`_annualized` — DSR/PSR operate on the per-observation Sharpe (Appendix B.1).
"""
from __future__ import annotations

import math
from itertools import combinations

import numpy as np
from scipy.stats import norm, skew, kurtosis

GAMMA = 0.5772156649015329  # Euler-Mascheroni
E = math.e
BARS_PER_YEAR = 365


def per_obs_sharpe(returns) -> float:
    r = np.asarray(returns, dtype=float)
    if r.size < 2:
        return 0.0
    sd = r.std(ddof=1)
    return 0.0 if sd == 0 else float(r.mean() / sd)


def annualized_sharpe(returns, bars_per_year: int = BARS_PER_YEAR) -> float:
    return per_obs_sharpe(returns) * math.sqrt(bars_per_year)


def psr(returns, sr_star: float) -> float:
    """PSR(SR*) — Appendix B.1. Probability the true (per-obs) Sharpe exceeds SR*.

    PSR = NormCDF( (SR_hat - SR*)*sqrt(n-1) / sqrt(1 - g3*SR_hat + ((g4-1)/4)*SR_hat^2) )
    where g3 = skewness, g4 = NON-excess kurtosis (normal => 3).
    """
    r = np.asarray(returns, dtype=float)
    n = r.size
    if n < 3:
        return float("nan")
    sr = per_obs_sharpe(r)
    g3 = float(skew(r))
    g4 = float(kurtosis(r, fisher=False))  # non-excess (normal == 3)
    denom = math.sqrt(max(1.0 - g3 * sr + ((g4 - 1.0) / 4.0) * sr * sr, 1e-12))
    z = (sr - sr_star) * math.sqrt(n - 1) / denom
    return float(norm.cdf(z))


def sr0_deflated(var_sharpe: float, n_trials: int) -> float:
    """Expected-maximum Sharpe benchmark across N trials — Appendix B.1.

    SR0 = sqrt(V) * [ (1-gamma)*Z(1 - 1/N) + gamma*Z(1 - 1/(N*e)) ],  Z = NormPPF.
    """
    n = max(int(n_trials), 2)  # N=1 => Z(1-1/1)=Z(0)=-inf; floor at 2
    z1 = norm.ppf(1.0 - 1.0 / n)
    z2 = norm.ppf(1.0 - 1.0 / (n * E))
    return math.sqrt(max(var_sharpe, 0.0)) * ((1.0 - GAMMA) * z1 + GAMMA * z2)


def deflated_sharpe(returns, n_trials: int, var_sharpe: float) -> float:
    """DSR = PSR(SR0) — Appendix B.1. var_sharpe = Var({SR_hat_i}) across trials."""
    return psr(returns, sr0_deflated(var_sharpe, n_trials))


def trial_sharpes(matrix) -> np.ndarray:
    """Per-observation Sharpe for each column (trial) of a (T x N) returns matrix."""
    m = np.asarray(matrix, dtype=float)
    mu = m.mean(axis=0)
    sd = m.std(axis=0, ddof=1)
    out = np.zeros_like(mu)
    nz = sd > 0
    out[nz] = mu[nz] / sd[nz]
    return out


def _col_sharpe(block: np.ndarray) -> np.ndarray:
    mu = block.mean(axis=0)
    sd = block.std(axis=0, ddof=1)
    out = np.zeros_like(mu)
    nz = sd > 0
    out[nz] = mu[nz] / sd[nz]
    return out


def purge_embargo_split(n: int, test_idx, embargo_frac: float = 0.01):
    """Purge + embargo train/test split (Appendix B.2) for a contiguous test fold.

    Purge: drop training observations whose window overlaps the test fold.
    Embargo: additionally drop embargo_frac*n training points immediately AFTER it.
    Returns (train_idx, test_idx).
    """
    test = sorted(int(i) for i in test_idx)
    lo, hi = test[0], test[-1]
    emb = int(embargo_frac * n)
    train = np.array([i for i in range(n) if i < lo or i > hi + emb], dtype=int)
    return train, np.array(test, dtype=int)


def _contiguous_groups(t: int, n_groups: int):
    bounds = np.linspace(0, t, n_groups + 1).astype(int)
    return [np.arange(bounds[i], bounds[i + 1]) for i in range(n_groups)]


def _embargo_groups(groups, emb: int):
    """Drop the leading `emb` indices of each group to decorrelate adjacent blocks (embargo)."""
    if emb <= 0:
        return groups
    return [g[emb:] if g.size > emb else g for g in groups]


def pbo(matrix, n_splits: int = 8, chosen_idx: int | None = None) -> float:
    """Probability of Backtest Overfitting via CSCV (Appendix B.3, S=8).

    matrix: (T x N) returns, one column per trial/candidate. Split rows into S even
    submatrices; over every way to pick S/2 as IS (rest OOS), select the IS-best
    strategy (or `chosen_idx` if given), take its OOS relative rank omega, lambda =
    logit(omega); PBO = P(lambda < 0) = P(IS-best lands in the bottom half OOS).
    """
    m = np.asarray(matrix, dtype=float)
    t, n = m.shape
    if n < 2 or t < n_splits:
        return float("nan")
    groups = _contiguous_groups(t, n_splits)
    lam_neg = 0
    total = 0
    half = n_splits // 2
    for is_combo in combinations(range(n_splits), half):
        is_set = set(is_combo)
        is_idx = np.concatenate([groups[g] for g in is_combo])
        oos_idx = np.concatenate([groups[g] for g in range(n_splits) if g not in is_set])
        is_perf = _col_sharpe(m[is_idx])
        oos_perf = _col_sharpe(m[oos_idx])
        target = chosen_idx if chosen_idx is not None else int(np.argmax(is_perf))
        # ordinal OOS rank of target in (0,1): higher rank = better OOS
        order = np.argsort(np.argsort(oos_perf)) + 1  # ranks 1..N (1 = worst)
        omega = order[target] / (n + 1.0)
        lam = math.log(omega / (1.0 - omega))
        lam_neg += 1 if lam < 0 else 0
        total += 1
    return lam_neg / total


def cpcv(returns, n_groups: int = 6, k: int = 2, embargo_frac: float = 0.01,
         bars_per_year: int = BARS_PER_YEAR) -> dict:
    """Combinatorial Purged CV (Appendix B.4, N=6 k=2 -> C(6,2)=15 paths).

    Partition the timeline into N groups, test k at a time, embargo each, and compute
    an annualized Sharpe per path. Robustness picture, not a hard gate.
    """
    r = np.asarray(returns, dtype=float)
    t = r.size
    if t < n_groups * 2:
        return {"mean": float("nan"), "p5": float("nan"), "p95": float("nan"), "paths": []}
    groups = _contiguous_groups(t, n_groups)
    emb = max(int(embargo_frac * t), 1)
    paths = []
    for combo in combinations(range(n_groups), k):
        segs = _embargo_groups([groups[g] for g in combo], emb)
        idx = np.concatenate(segs) if segs else np.array([], dtype=int)
        if idx.size >= 3:
            paths.append(annualized_sharpe(r[idx], bars_per_year))
    if not paths:
        return {"mean": float("nan"), "p5": float("nan"), "p95": float("nan"), "paths": []}
    arr = np.array(paths, dtype=float)
    return {
        "mean": float(arr.mean()),
        "p5": float(np.percentile(arr, 5)),
        "p95": float(np.percentile(arr, 95)),
        "paths": [float(x) for x in arr],
    }


def run_cohort(payload):
    """Cohort rigor over an aligned matrix (Phase 10/11). payload.matrix = list of N
    return-series (each length T, same timeline); payload.nTrials = the DSR deflation N.
    Returns per-strategy psr/dsr/pbo/cpcv + the cross-trial Sharpe variance V."""
    series = payload["matrix"]
    n_trials = int(payload["nTrials"])
    m = np.array(series, dtype=float).T  # (T, N)
    t, n = m.shape
    srs = trial_sharpes(m)
    var_sharpe = float(np.var(srs, ddof=1)) if n > 1 else 0.0
    pbo_matrix = pbo(m, n_splits=8) if (n >= 2 and t >= 8) else float("nan")
    out = {"varSharpe": var_sharpe, "psr": [], "dsr": [], "pbo": [], "cpcv": []}
    for j in range(n):
        r = m[:, j]
        out["psr"].append(psr(r, 0.0))
        out["dsr"].append(deflated_sharpe(r, n_trials, var_sharpe))
        out["pbo"].append(pbo_matrix)  # CSCV PBO is a property of the selection over the cohort
        out["cpcv"].append(cpcv(r))
    return out


def json_safe(o):
    """Convert non-finite floats (NaN/Inf) to None so the output is VALID JSON
    (Python's json writes bare NaN/Infinity, which TS JSON.parse rejects)."""
    if isinstance(o, float):
        return o if math.isfinite(o) else None
    if isinstance(o, dict):
        return {k: json_safe(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [json_safe(v) for v in o]
    return o


def main():
    import json
    import sys

    payload = json.load(sys.stdin)
    json.dump(json_safe(run_cohort(payload)), sys.stdout)


if __name__ == "__main__":
    main()
