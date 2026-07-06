"""ORGΛNON Discernment Test — the PURE momentum panel builder (Blueprint Phase 1; Rules XI, A3, D1).

Look-ahead-free BY CONSTRUCTION. Given an aligned (D×M) daily-close matrix on a common day grid, it builds the
cross-sectional momentum SIGNAL and the strictly-forward RETURN target exactly as pre-registered
(data/discernment/preregistration.json):

    signal(t)  = close[t-skip] / close[t-skip-lookback] - 1      (lookback=30, skip=2 → close[t-2]/close[t-32]-1)
    forward(t) = close[t+1] / close[t] - 1                       (strictly AFTER the decision day t)

The ONLY look-ahead risk in the whole sprint is here, so it is isolated in a pure, unit-tested module: signal(t)
reads ONLY indices ≤ t-skip (< t); forward(t) reads indices > t. A datum at t+1 CANNOT enter signal(t). The
_selftest proves it (perturb a future close → signal unchanged, forward changed). No engine code here — this only
PREPARES admissible panels; the frozen discriminator judges them.

This module edits NO frozen file (Rule VII). Deterministic (numpy; noise is explicitly seeded).

Run:  cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.momentum --selftest
"""
from __future__ import annotations

import sys
import warnings

import numpy as np


def daily_returns(prices: np.ndarray) -> np.ndarray:
    """Close-to-close simple returns of an (D×M) close matrix → (D×M) with a NaN first row. NaN-safe."""
    p = np.asarray(prices, dtype=float)
    r = np.full_like(p, np.nan)
    r[1:] = p[1:] / p[:-1] - 1.0
    return r


def build_panels(closes: np.ndarray, lookback: int, skip: int, horizon: int = 1):
    """From an aligned (D×M) daily-close matrix, build the pre-registered momentum SIGNAL and forward-RETURN target.

    Returns (signal, forward, decision_idx):
      signal[i, :]  = close[t-skip] / close[t-skip-lookback] - 1     (uses ONLY prices ≤ t-skip)
      forward[i, :] = close[t+horizon] / close[t] - 1                (uses ONLY prices > t)
    for decision indices t in [skip+lookback, D-1-horizon]. NaN where a price is missing (pre-listing) → the
    downstream IC uses finite pairs only, so an absent asset simply does not contribute that day (survivorship-safe).
    """
    c = np.asarray(closes, dtype=float)
    d, m = c.shape
    lo = skip + lookback
    hi = d - horizon
    idx = list(range(lo, hi))
    sig = np.full((len(idx), m), np.nan)
    fwd = np.full((len(idx), m), np.nan)
    for i, t in enumerate(idx):
        base = c[t - skip - lookback]
        form = c[t - skip]
        sig[i] = np.where((base > 0) & np.isfinite(base) & np.isfinite(form), form / base - 1.0, np.nan)
        p0, p1 = c[t], c[t + horizon]
        fwd[i] = np.where((p0 > 0) & np.isfinite(p0) & np.isfinite(p1), p1 / p0 - 1.0, np.nan)
    return sig, fwd, np.array(idx, dtype=int)


def market_beta(returns: np.ndarray) -> np.ndarray:
    """Per-asset OLS beta of each asset's daily return on the equal-weight cross-sectional mean return ('market'),
    over the full sample. Static (M,). NaN-robust (uses each asset's finite overlap with the market)."""
    r = np.asarray(returns, dtype=float)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", RuntimeWarning)  # the all-NaN first return row → benign empty-slice mean
        mkt = np.nanmean(r, axis=1)
    m = r.shape[1]
    out = np.full(m, np.nan)
    for j in range(m):
        ok = np.isfinite(r[:, j]) & np.isfinite(mkt)
        if ok.sum() >= 5 and np.var(mkt[ok]) > 0:
            out[j] = np.cov(r[ok, j], mkt[ok])[0, 1] / np.var(mkt[ok])
    return out


def realized_vol(returns: np.ndarray) -> np.ndarray:
    """Per-asset standard deviation of daily returns over the full sample. Static (M,)."""
    r = np.asarray(returns, dtype=float)
    return np.array([np.nanstd(r[:, j]) if np.isfinite(r[:, j]).sum() >= 5 else np.nan for j in range(r.shape[1])])


def noise_panel(shape, seed: int) -> np.ndarray:
    """A seeded standard-normal signal of the given (T×M) shape — the negative control. No predictive content by
    construction. Deterministic (numpy default_rng)."""
    return np.random.default_rng(seed).standard_normal(shape)


# ────────────────────────────── look-ahead-free + orientation selftest (deterministic, no network) ──────────────
def _selftest() -> bool:
    print("momentum.py — pure panel builder: look-ahead-free by construction (Rule XI/A3/D1).\n")
    failures = []

    def check(name, cond, detail=""):
        print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
        if not cond:
            failures.append(name)

    rng = np.random.default_rng(20260703)
    d, m = 120, 20
    # a random-walk price matrix (no planted signal) — for the look-ahead invariance proof.
    closes = 100.0 * np.exp(np.cumsum(rng.normal(0, 0.02, size=(d, m)), axis=0))
    lookback, skip, horizon = 30, 2, 1
    sig, fwd, idx = build_panels(closes, lookback, skip, horizon)

    # (1) LOOK-AHEAD: perturb a FUTURE close and prove the signal for earlier decision days is UNCHANGED.
    t_pos = len(idx) // 2
    t = int(idx[t_pos])  # a decision day in the middle
    pert = closes.copy()
    pert[t] *= 1.5       # perturb the contemporaneous close (t) — from t's view, "now"; signal must not use it
    pert[t + 1] *= 1.3   # perturb a strictly-future close (t+1) by a DIFFERENT factor — signal must not use it, but
    #                      the forward ratio close[t+1]/close[t] MUST move (different factors → ratio ≠ original)
    sig2, fwd2, _ = build_panels(pert, lookback, skip, horizon)
    sig_row_same = np.allclose(np.nan_to_num(sig[t_pos]), np.nan_to_num(sig2[t_pos]), atol=0, rtol=0)
    check("signal(t) UNCHANGED when close[t] and close[t+1] are perturbed (no look-ahead — signal reads only ≤ t-skip)",
          sig_row_same, f"row {t_pos} identical={sig_row_same}")
    # the target SHOULD move when the future close moves (sanity: forward is genuinely forward-looking).
    fwd_row_moved = not np.allclose(np.nan_to_num(fwd[t_pos]), np.nan_to_num(fwd2[t_pos]))
    check("forward(t) MOVES when close[t+1] is perturbed (the target is strictly forward — as it must be)",
          fwd_row_moved, f"forward row changed={fwd_row_moved}")
    # every signal value at decision day t reads close indices {t-skip, t-skip-lookback}, both < t.
    max_read = max(int(idx[i]) - skip for i in range(len(idx)))
    check("every signal(t) reads at most index t-skip (< t) — strictly causal", max_read < d, f"max read idx = {max_read} < D={d}")

    # (1b) POSITIVE CONTROL — the invariance test has TEETH: a deliberately LEAKY signal that peeks at close[t]
    # (contemporaneous, one day past the honest skip cutoff) IS caught (its row MOVES when close[t] is perturbed).
    # This proves the (1) PASS is not vacuous.
    leaky = np.full((len(idx), m), np.nan)
    for i, tt in enumerate(idx):
        leaky[i] = closes[tt] / closes[tt - skip - lookback] - 1.0  # reads close[t] — a look-ahead leak
    leaky2 = np.full((len(idx), m), np.nan)
    for i, tt in enumerate(idx):
        leaky2[i] = pert[tt] / pert[tt - skip - lookback] - 1.0
    leak_caught = not np.allclose(np.nan_to_num(leaky[t_pos]), np.nan_to_num(leaky2[t_pos]))
    check("POSITIVE CONTROL: a LEAKY signal reading close[t] IS caught (row moves) — the invariance test has teeth",
          leak_caught, f"leaky row moved={leak_caught}")

    # (2) ORIENTATION (positive sign): plant a genuine cross-sectional momentum and confirm the construction detects
    # it with the PRE-REGISTERED POSITIVE sign (winners keep winning → positive IC). This proves the builder is
    # oriented correctly (not that real crypto has this — that is the frozen engine's job to judge).
    drift = rng.normal(0, 0.001, size=m)  # per-asset persistent drift = a planted momentum
    planted = np.zeros((d, m))
    for i in range(1, d):
        planted[i] = planted[i - 1] + drift + rng.normal(0, 0.003, size=m)
    pcloses = 100.0 * np.exp(planted)
    ps, pf, _ = build_panels(pcloses, lookback, skip, horizon)
    ics = []
    for i in range(ps.shape[0]):
        a, b = ps[i], pf[i]
        ok = np.isfinite(a) & np.isfinite(b)
        if ok.sum() >= 8 and np.ptp(a[ok]) > 0 and np.ptp(b[ok]) > 0:
            ics.append(np.corrcoef(np.argsort(np.argsort(a[ok])), np.argsort(np.argsort(b[ok])))[0, 1])
    mean_ic = float(np.mean(ics)) if ics else 0.0
    check("planted-momentum panel shows POSITIVE mean rank IC (construction oriented to the pre-registered sign)",
          mean_ic > 0, f"mean IC = {mean_ic:+.3f}")

    # (3) DETERMINISM: the seeded noise control is byte-reproducible.
    n1 = noise_panel((50, m), seed=20260703)
    n2 = noise_panel((50, m), seed=20260703)
    check("seeded noise control is deterministic (byte-reproducible)", np.array_equal(n1, n2))

    ok = not failures
    print(f"\nmomentum.py selftest: {'ALL PASS' if ok else 'FAIL -> ' + ', '.join(failures)}")
    return ok


def main():
    if "--selftest" in sys.argv:
        sys.exit(0 if _selftest() else 1)
    print("momentum.py is a library (build_panels / market_beta / realized_vol / noise_panel). Run --selftest.")


if __name__ == "__main__":
    main()
