"""ORGΛNON Lending-Carry — the risk-factor-neutralization DISCRIMINATOR (blueprint Phase 2 / Rule VIII).

THE HEART. Carry dispersion across lending markets is partly EFFICIENT RISK PREMIUM (higher rates compensate
depeg / protocol / liquidity / duration risk). This module:
  (1) neutralizes each market's carry against a pre-specified risk-factor model (cross-sectional residualize);
  (2) tests whether RESIDUAL carry predicts OUT-OF-SAMPLE realized excess return.
GO requires residual edge; if carry is FULLY EXPLAINED by risk loadings, residual carry is non-predictive → NO-GO
(a valid finding: "you were paid for bearing risk, not for skill"). This is the lending analog of "significance ≠
edge" and the fair benchmark for lending (Rules III/IV/VIII).

It CALLS the shared rigor core (rigor.purge_embargo_split for the OOS fold, rigor.cpcv for robustness) and
REIMPLEMENTS none of it (Rule VII). Deterministic: numpy lstsq + scipy spearman, no unseeded randomness.

Validated by selftest_lending.py (the golden-noise sibling): a synthetic whose carry is CONSTRUCTED to be pure
risk premium MUST be flagged NO-GO; a synthetic with a CONSTRUCTED residual edge MUST be detected.
"""
from __future__ import annotations

import json
import sys

import numpy as np
from scipy.stats import spearmanr

from backtest.py import rigor

# Decision gates — pre-specified (Rule IX: frozen before scoring; never tuned toward a GO).
T_GATE = 3.0       # Fama-MacBeth t-stat on the OOS residual-IC series required to claim edge
IC_MIN = 0.02      # and a minimally material mean OOS information coefficient
PORT_GATE = 2.5    # AND the OOS long-short PORTFOLIO return (with realized tails) must be significant (Phase 1, S2)
MIN_MARKETS = 8    # a period needs this many finite (residual, forward) pairs to contribute an IC
DEFAULT_MIN_PERIODS = 90  # below this many usable periods → INSUFFICIENT-EVIDENCE (caller may override)


def neutralize(carry: np.ndarray, loadings: np.ndarray) -> np.ndarray:
    """Cross-sectional residualization (Fama-MacBeth style). carry: (T, M); loadings: (M, K).
    For each period t, regress carry[t] (M-vector) on [1 | loadings] across markets; the residual is the part
    of carry NOT explained by the risk factors. Returns residuals (T, M). Deterministic (lstsq)."""
    carry = np.asarray(carry, dtype=float)
    loadings = np.asarray(loadings, dtype=float)
    t, m = carry.shape
    x = np.column_stack([np.ones(m), loadings])  # (M, K+1)
    resid = np.full_like(carry, np.nan)
    for i in range(t):
        y = carry[i]
        ok = np.isfinite(y) & np.all(np.isfinite(loadings), axis=1)
        if ok.sum() < loadings.shape[1] + 2:
            continue
        beta, *_ = np.linalg.lstsq(x[ok], y[ok], rcond=None)
        resid[i, ok] = y[ok] - x[ok] @ beta
    return resid


def _ic(sig: np.ndarray, fwd: np.ndarray) -> float:
    """Spearman rank IC across markets for one period; NaN if too few finite pairs or a constant vector."""
    ok = np.isfinite(sig) & np.isfinite(fwd)
    if ok.sum() < MIN_MARKETS:
        return np.nan
    a, b = sig[ok], fwd[ok]
    if np.ptp(a) == 0 or np.ptp(b) == 0:
        return np.nan
    rho, _ = spearmanr(a, b)
    return float(rho) if np.isfinite(rho) else np.nan


def _ls_series(signal: np.ndarray, forward: np.ndarray) -> np.ndarray:
    """Per-period LONG-SHORT portfolio return: mean forward of the top-tercile signal MINUS the bottom-tercile
    (Hardening Phase 1, scenario 2). Unlike the rank IC (which only sees DIRECTION on calm days), this carries the
    REALIZED tail: an insurance-selling signal earns premium on calm days but loses big on jump days, so its LS
    series nets to ≈0 over a panel that contains its tails → no significant portfolio return → not edge."""
    out = []
    t = min(signal.shape[0], forward.shape[0])
    for i in range(t):
        s, f = signal[i], forward[i]
        ok = np.isfinite(s) & np.isfinite(f)
        if ok.sum() < MIN_MARKETS:
            continue
        ss, ff = s[ok], f[ok]
        lo, hi = np.quantile(ss, 1.0 / 3.0), np.quantile(ss, 2.0 / 3.0)
        short, long_ = ff[ss <= lo], ff[ss >= hi]
        if short.size and long_.size:
            out.append(float(long_.mean() - short.mean()))
    return np.array(out, dtype=float)


def _ic_series(signal: np.ndarray, forward: np.ndarray) -> np.ndarray:
    """Per-period IC of signal[t] vs forward[t]. forward[t] = realized excess return over (t, t+1], so the last
    period (no forward) is dropped by the caller. Returns the finite IC values only."""
    t = min(signal.shape[0], forward.shape[0])
    ics = [_ic(signal[i], forward[i]) for i in range(t)]
    return np.array([x for x in ics if np.isfinite(x)], dtype=float)


def _tstat(x: np.ndarray) -> float:
    """Fama-MacBeth t-stat of a mean IC: mean / (std/sqrt(n)). 0 if degenerate."""
    n = x.size
    if n < 2:
        return 0.0
    sd = x.std(ddof=1)
    return 0.0 if sd == 0 else float(x.mean() / (sd / np.sqrt(n)))


def _tstat_nw(x: np.ndarray, lags: int) -> float:
    """Newey-West (HAC) t-stat of a mean IC — deflates the iid t-stat for AUTOCORRELATION in the IC series
    (Hardening Phase 1/5, scenario 4). var(mean) = [gamma0 + 2*sum_l (1 - l/(L+1)) gamma_l] / n with Bartlett
    weights. Reduces to the iid t-stat at lags=0. Used when the caller passes nwLags > 0."""
    n = x.size
    if n < 2:
        return 0.0
    mu = float(x.mean())
    d = x - mu
    gamma0 = float(np.dot(d, d) / n)
    s = gamma0
    L = min(int(lags), n - 1)
    for l in range(1, L + 1):
        cov = float(np.dot(d[l:], d[:-l]) / n)
        s += 2.0 * (1.0 - l / (L + 1.0)) * cov
    var_mean = s / n
    return 0.0 if var_mean <= 0 else float(mu / np.sqrt(var_mean))


def discriminate(payload: dict) -> dict:
    """Run the discriminator on a carry/forward panel + factor loadings.

    payload: { carry:(T,M), forward:(T,M), loadings:(M,K), minPeriods? }
    Returns the verdict + the residual-IC and raw-IC evidence. Verdict is one of:
      GO                    — residual carry predicts OOS excess return (edge beyond risk premium)
      NO-GO                 — carry fully explained by risk loadings (residual non-predictive)
      INSUFFICIENT-EVIDENCE — too few usable periods for power (the honest short-panel outcome)
    """
    carry = np.asarray(payload["carry"], dtype=float)
    forward = np.asarray(payload["forward"], dtype=float)
    loadings = np.asarray(payload["loadings"], dtype=float)
    min_periods = int(payload.get("minPeriods", DEFAULT_MIN_PERIODS))
    nw_lags = int(payload.get("nwLags", 0))  # 0 → iid t-stat (default path, byte-identical to pre-Hardening)
    tstat = (lambda v: _tstat_nw(v, nw_lags)) if nw_lags > 0 else _tstat

    if carry.ndim != 2 or carry.shape != forward.shape:
        return {"verdict": "INSUFFICIENT-EVIDENCE", "reason": "empty or misaligned panel",
                "nPeriods": 0, "nMarkets": int(carry.shape[1]) if carry.ndim == 2 else 0}

    resid = neutralize(carry, loadings)
    # align signal[t] with forward[t] (forward already shifted by the caller); drop the trailing no-forward row
    resid_ic = _ic_series(resid, forward)
    raw_ic = _ic_series(carry, forward)
    n = resid_ic.size

    base = {
        "nPeriods": int(n),
        "nMarkets": int(carry.shape[1]),
        "minPeriods": min_periods,
        "residualIcMean": float(resid_ic.mean()) if n else None,
        "residualIcTstat": tstat(resid_ic) if n else None,
        "rawIcMean": float(raw_ic.mean()) if raw_ic.size else None,
        "rawIcTstat": tstat(raw_ic) if raw_ic.size else None,
        "gates": {"tGate": T_GATE, "icMin": IC_MIN},
    }

    if n < min_periods:
        return {**base, "verdict": "INSUFFICIENT-EVIDENCE",
                "reason": f"usable periods {n} < minPeriods {min_periods} → no OOS power"}

    # OUT-OF-SAMPLE fold via the SHARED purge+embargo splitter (called, not modified). Test = second half;
    # the headline decision is the OOS residual-IC, so an in-sample artifact cannot mint a GO.
    test_idx = list(range(n // 2, n))
    _train, test = rigor.purge_embargo_split(n, test_idx, embargo_frac=0.02)
    oos = resid_ic[test]
    oos_mean = float(oos.mean()) if oos.size else 0.0
    oos_t = tstat(oos)
    # robustness picture from the SHARED CPCV over the residual-IC series (called, not modified)
    cp = rigor.cpcv(resid_ic, n_groups=6, k=2)

    # TAIL-AWARE portfolio gate (Phase 1, S2): the residual-sorted long-short portfolio — which carries the
    # REALIZED tail, unlike the direction-only IC — must ALSO have a significant OOS return. Insurance-selling
    # (smooth carry, rare large losses) has a positive IC on calm days but a ≈0 portfolio return once tails
    # realize, so this gate refuses it. A GO must clear BOTH the IC gate and the portfolio gate.
    ls = _ls_series(resid, forward)
    ls_n = ls.size
    if ls_n >= 4:
        ls_test = ls[ls_n // 2:]
        port_mean = float(ls_test.mean())
        port_t = tstat(ls_test)
    else:
        port_mean, port_t = 0.0, 0.0

    go = (oos_t > T_GATE) and (oos_mean > IC_MIN) and (port_t > PORT_GATE) and (port_mean > 0)
    verdict = "GO" if go else "NO-GO"
    return {**base, "verdict": verdict, "oosResidualIcMean": oos_mean, "oosResidualIcTstat": oos_t,
            "oosPortfolioMean": port_mean, "oosPortfolioTstat": port_t,
            "cpcv": {"mean": cp["mean"], "p5": cp["p5"], "p95": cp["p95"]}}


def robust_discriminate(payload: dict, omitted_bank) -> dict:
    """Appendix C — OMITTED-VARIABLE ROBUSTNESS (the structural defense against the unimagined factor, Rule X).

    A candidate residual edge must SURVIVE the addition of each plausible omitted factor. If adding any plausible
    factor (chain risk, collateral concentration, oracle dependence, …) drops the OOS residual edge below the GO
    gate, the "edge" is fragile / likely unmodeled risk premium and is DOWN-GRADED to NO-GO. This BOUNDS — it does
    not eliminate — the unmodeled-risk failure: a factor that is neither modeled nor in the bank still slips through
    (that residual rate is the discriminator's disclosed limit). omitted_bank: list of (name, (M,)-vector)."""
    base = discriminate(payload)
    if base.get("verdict") != "GO" or not omitted_bank:
        return {**base, "robust": base.get("verdict"), "downgradedBy": None}
    loadings = np.asarray(payload["loadings"], dtype=float)
    for name, vec in omitted_bank:
        aug = np.column_stack([loadings, np.asarray(vec, dtype=float)])
        d2 = discriminate({**payload, "loadings": aug.tolist()})
        if d2.get("verdict") != "GO":
            return {**base, "robust": "NO-GO", "downgradedBy": name,
                    "downgradedTstat": d2.get("oosResidualIcTstat")}
    return {**base, "robust": "GO", "downgradedBy": None}


def main():
    payload = json.load(sys.stdin)
    # If a plausible-omitted-factor bank is supplied, run the omitted-variable-robust discriminator (Appendix C);
    # else the bare discriminator. Both deterministic.
    bank = payload.get("omittedBank")
    if bank:
        out = robust_discriminate(payload, [(b["name"], b["values"]) for b in bank])
    else:
        out = discriminate(payload)
    json.dump(rigor.json_safe(out), sys.stdout)


if __name__ == "__main__":
    main()
