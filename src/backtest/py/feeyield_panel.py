"""ORGΛNON Fee-Yield Cross-Section — the deterministic PIT-tiered panel builder (Blueprint Phase 0).

Reads ONLY the frozen DeFiLlama snapshot (data/feeyield/raw/<stamp>/, captured once by scripts/feeyield-pull.ts),
aligns every protocol's fees/revenue/TVL/price onto a common UTC-DAILY grid, and computes:
  • the FACTOR LIBRARY (cross-sectional, PIT — each factor[t] uses only data ≤ t):
      fee_yield     = annualized trailing-30d fees / TVL
      revenue_yield = annualized trailing-30d revenue / TVL
      retention     = trailing-30d revenue / trailing-30d fees          (protocol margin; no TVL needed)
      fee_growth    = trailing-30d fees / prior-30d fees − 1            (fundamentals momentum; no TVL needed)
      rev_growth    = trailing-30d revenue / prior-30d revenue − 1
      momentum      = price[t] / price[t−30] − 1                        (cross-sectional price momentum)
      size          = log(TVL)
  • the TARGET: forward token return fwd_h[t] = price[t+h]/price[t] − 1  (the discriminator drops the last no-fwd row)
  • the static RISK LOADINGS (M×K, for neutralization): log_size · market_beta · momentum_load · sector dummies.

PIT tiering (Rule XI, decisive): this snapshot is REVISED (T3) → DISCOVERY-ONLY, barred from a powered verdict.
Deterministic: sorted() everywhere, no wall-clock, typed-missing (NaN) never zeroed. Byte-reproducible from the snapshot.

The panel emits {carry, forward, loadings} in EXACTLY the shape funding_discriminate.discriminate() consumes
(carry:(T,M), forward:(T,M), loadings:(M,K)) — the frozen engine is REUSED, never rebuilt (Rule VII).
"""
from __future__ import annotations

import glob
import json
import math
import os

import numpy as np
import pandas as pd

MIN_MARKETS = 8          # discriminator floor: a period needs ≥8 finite (signal,forward) pairs to yield an IC
ROLL = 30                # trailing window (days) for yields/growth/momentum
FACTORS = ("fee_yield", "revenue_yield", "retention", "fee_growth", "rev_growth", "momentum", "size")


def _repo_root() -> str:
    d = os.path.abspath(os.path.dirname(__file__))
    for _ in range(12):
        if os.path.isdir(os.path.join(d, "data", "feeyield")):
            return d
        d = os.path.dirname(d)
    return os.getcwd()


def snapshot_dir(stamp: str) -> str:
    return os.path.join(_repo_root(), "data", "feeyield", "raw", stamp)


def _series_to_daily(chart, root_day_index) -> pd.Series:
    """A [[unix_ts, value], …] chart → a daily Series on the UTC-day grid (reindexed to root_day_index)."""
    if not chart:
        return pd.Series(np.nan, index=root_day_index)
    ts = np.array([int(p[0]) for p in chart], dtype=np.int64)
    val = np.array([float(p[1]) if p[1] is not None else np.nan for p in chart], dtype=float)
    day = (ts // 86400) * 86400
    s = pd.Series(val, index=pd.Index(day, name="day"))
    s = s[~s.index.duplicated(keep="last")].sort_index()
    return s.reindex(root_day_index)


_SNAPSHOT_CACHE: dict = {}


def load_snapshot(stamp: str):
    """Load the frozen snapshot → (universe, fees, revenue, tvl, price) as UTC-daily DataFrames (cols = slug/gecko).
    Deterministic: protocols sorted by slug; dates are the sorted union UTC-day grid. Cached per stamp (the snapshot is
    IMMUTABLE, so caching is deterministic — repeated candidate builds reuse it instead of re-reading 800 JSON files)."""
    if stamp in _SNAPSHOT_CACHE:
        return _SNAPSHOT_CACHE[stamp]
    base = snapshot_dir(stamp)
    universe = json.load(open(os.path.join(base, "universe.json")))
    universe = sorted(universe, key=lambda u: u["slug"])

    def raw(kind, key):
        path = os.path.join(base, kind, f"{key}.json")
        return json.load(open(path)) if os.path.exists(path) else []

    # the union UTC-day grid across every series (sorted)
    days = set()
    for u in universe:
        for kind, key in (("fees", u["slug"]), ("revenue", u["slug"]), ("tvl", u["slug"]), ("prices", u["gecko"])):
            for p in raw(kind, key):
                days.add((int(p[0]) // 86400) * 86400)
    grid = pd.Index(sorted(days), name="day")

    slugs = [u["slug"] for u in universe]
    geckos = {u["slug"]: u["gecko"] for u in universe}
    fees = pd.DataFrame({u: _series_to_daily(raw("fees", u), grid) for u in slugs})
    revenue = pd.DataFrame({u: _series_to_daily(raw("revenue", u), grid) for u in slugs})
    tvl = pd.DataFrame({u: _series_to_daily(raw("tvl", u), grid) for u in slugs})
    price = pd.DataFrame({u: _series_to_daily(raw("prices", geckos[u]), grid) for u in slugs})
    result = (universe, fees, revenue, tvl, price)
    _SNAPSHOT_CACHE[stamp] = result
    return result


def quarantine_tvl_spikes(tvl: pd.DataFrame, jump: float = 10.0) -> pd.DataFrame:
    """Quarantine the price-lag / first-token-pricing artifact: an ISOLATED single-day TVL value that is >`jump`×
    both its neighbours (a spike that immediately reverts) is set to NaN (typed-missing, never zeroed). Guards
    fee_yield = fees/TVL from a transient TVL blip. Deterministic; leaves genuine level shifts (one-sided) intact."""
    t = tvl.copy()
    prev, nxt = tvl.shift(1), tvl.shift(-1)
    with np.errstate(divide="ignore", invalid="ignore"):
        spike = (tvl > jump * prev) & (tvl > jump * nxt)
    return t.mask(spike.fillna(False))


def size_coherence(universe, tvl: pd.DataFrame, jump: float = 10.0) -> set:
    """TWO-SOURCE size cross-check (Integrity-sprint residual #3, the ~10× defect class). Compares the two INDEPENDENT
    DeFiLlama size sources for each protocol: the overview current-TVL (`universe.tvlNow`, from /overview/fees) vs the
    tvl-SERIES latest finite value (from /summary/fees|/protocol). A divergence > `jump`× (or < 1/`jump`) between them
    flags a size-incoherent protocol — a revised/mispriced TVL that would distort fee_yield = fees/TVL. Returns the
    incoherent slug set (its size-derived factors become typed-missing). Deterministic; only checks protocols where
    BOTH sources are > 0 (a single missing source is already handled by fee_yield needing a finite TVL)."""
    now = {u["slug"]: float(u.get("tvlNow") or 0.0) for u in universe}
    bad = set()
    for slug in tvl.columns:
        col = tvl[slug].values
        finite = col[np.isfinite(col)]
        latest = float(finite[-1]) if finite.size else 0.0
        tn = now.get(slug, 0.0)
        if tn > 0.0 and latest > 0.0:
            ratio = tn / latest
            if ratio > jump or ratio < 1.0 / jump:
                bad.add(slug)
    return bad


def build_factors(fees, revenue, tvl, price, incoherent=frozenset()) -> dict:
    """The PIT factor library (each factor[t] uses only data ≤ t). Typed-missing (NaN) never zeroed.
    `incoherent` = the two-source size-incoherent slugs (residual #3): their TVL is set NaN so the SIZE-derived factors
    (fee_yield, revenue_yield, size) become typed-missing, while the TVL-free factors (fee_growth, retention, …) survive."""
    tvl = quarantine_tvl_spikes(tvl)  # price-lag artifact guard (Phase-0 red-team, positive-controlled)
    if incoherent:  # two-source size-coherence guard (no-op when empty ⇒ byte-identical on a coherent snapshot)
        tvl = tvl.copy()
        for slug in incoherent:
            if slug in tvl.columns:
                tvl[slug] = np.nan
    f30 = fees.rolling(ROLL, min_periods=ROLL).sum()
    r30 = revenue.rolling(ROLL, min_periods=ROLL).sum()
    f_prev = f30.shift(ROLL)
    r_prev = r30.shift(ROLL)
    tvl_ff = tvl.ffill(limit=7)                       # TVL: forward-fill small gaps only (never fabricate long gaps)
    ann = 365.0 / ROLL
    with np.errstate(divide="ignore", invalid="ignore"):
        fee_yield = (f30 * ann) / tvl_ff.replace(0, np.nan)
        revenue_yield = (r30 * ann) / tvl_ff.replace(0, np.nan)
        retention = r30 / f30.replace(0, np.nan)
        fee_growth = f30 / f_prev.replace(0, np.nan) - 1.0
        rev_growth = r30 / r_prev.replace(0, np.nan) - 1.0
        momentum = price / price.shift(ROLL).replace(0, np.nan) - 1.0
        size = np.log(tvl_ff.replace(0, np.nan))
    out = {"fee_yield": fee_yield, "revenue_yield": revenue_yield, "retention": retention,
           "fee_growth": fee_growth, "rev_growth": rev_growth, "momentum": momentum, "size": size}
    # guard: retention is a margin in [~0,1]; clip pathological revised-data blowups to NaN (typed-missing)
    out["retention"] = out["retention"].where((out["retention"] > -1) & (out["retention"] < 5))
    return out


def forward_return(price, horizon: int) -> pd.DataFrame:
    """Target: forward token return over (t, t+h]. fwd[t] = price[t+h]/price[t] − 1 (no look-ahead in the signal)."""
    with np.errstate(divide="ignore", invalid="ignore"):
        return price.shift(-horizon) / price.replace(0, np.nan) - 1.0


def _zscore_rows(df: pd.DataFrame) -> pd.DataFrame:
    """Cross-sectional standardization per date (well-conditions the neutralization; IC is rank-based so invariant)."""
    mu = df.mean(axis=1)
    sd = df.std(axis=1, ddof=0)
    return df.sub(mu, axis=0).div(sd.replace(0, np.nan), axis=0)


def build_loadings(fees, revenue, tvl, price, universe, protocols):
    """Static per-protocol risk loadings (M×K): [log_size, market_beta, momentum_load, <sector dummies>].
    market_beta = full-window OLS beta of the protocol's daily return on the equal-weight market return.
    Deterministic; sectors are the top categories + 'other'."""
    ret = price[protocols].pct_change(fill_method=None)
    mkt = ret.mean(axis=1)                                            # equal-weight market (the common crypto factor)
    var_mkt = float(np.nanvar(mkt.values))
    cat = {u["slug"]: (u.get("category") or "other") for u in universe}
    top_sectors = ["Dexs", "Lending", "Liquid Staking", "Derivatives", "Yield"]
    rows, names = [], None
    log_tvl_all = np.log(tvl[protocols].replace(0, np.nan))
    for p in protocols:
        r = ret[p]
        ok = np.isfinite(r.values) & np.isfinite(mkt.values)
        beta = float(np.cov(r.values[ok], mkt.values[ok])[0, 1] / var_mkt) if ok.sum() > 20 and var_mkt > 0 else 0.0
        log_size = float(np.nanmean(log_tvl_all[p].values)) if np.isfinite(log_tvl_all[p].values).any() else 0.0
        mom = float(np.nanmean((price[p] / price[p].shift(ROLL) - 1.0).values))
        mom = mom if np.isfinite(mom) else 0.0
        sect = [1.0 if cat[p] == s else 0.0 for s in top_sectors]
        row = [log_size, beta, mom] + sect
        names = ["log_size", "market_beta", "momentum_load"] + [f"sector_{s}" for s in top_sectors]
        rows.append(row)
    L = np.array(rows, dtype=float)
    # standardize the continuous columns (first 3) so no single scale dominates the lstsq
    for j in range(3):
        col = L[:, j]
        sd = np.nanstd(col)
        if sd > 0:
            L[:, j] = (col - np.nanmean(col)) / sd
    return L, names


def coherent_protocols(factor_df: pd.DataFrame, price: pd.DataFrame, min_days: int):
    """Protocols with ≥ min_days finite factor values AND a finite price series (can carry the target). Sorted."""
    keep = []
    for p in sorted(factor_df.columns):
        if np.isfinite(factor_df[p].values).sum() >= min_days and np.isfinite(price[p].values).sum() >= min_days:
            keep.append(p)
    return keep


def panel_matrices(stamp: str, factor: str, horizon: int, neutralizations, min_days: int = 120):
    """Build {carry, forward, loadings, dates, protocols} for ONE candidate (factor · horizon · neutralization set).
    carry = cross-sectionally z-scored factor (T×M); forward = forward token return (T×M); loadings = (M×K') subset.
    Rows are trimmed to the coherent window where ≥MIN_MARKETS protocols have (signal, forward) both finite."""
    universe, fees, revenue, tvl, price = load_snapshot(stamp)
    factors = build_factors(fees, revenue, tvl, price, size_coherence(universe, tvl))
    if factor not in factors:
        raise ValueError(f"unknown factor {factor}; have {sorted(factors)}")
    fac = factors[factor]
    protocols = coherent_protocols(fac, price, min_days)
    if len(protocols) < MIN_MARKETS:
        return {"carry": [], "forward": [], "loadings": [], "dates": [], "protocols": protocols,
                "note": f"only {len(protocols)} coherent protocols (< {MIN_MARKETS})"}

    carry_df = _zscore_rows(fac[protocols])
    fwd_df = forward_return(price, horizon)[protocols]
    # keep dates where ≥MIN_MARKETS protocols have BOTH a finite signal and a finite forward (the IC-usable rows)
    usable = ((np.isfinite(carry_df.values) & np.isfinite(fwd_df.values)).sum(axis=1) >= MIN_MARKETS)
    idx = np.where(usable)[0]
    if idx.size == 0:
        return {"carry": [], "forward": [], "loadings": [], "dates": [], "protocols": protocols, "note": "no usable rows"}
    lo, hi = int(idx.min()), int(idx.max()) + 1
    carry = carry_df.values[lo:hi]
    fwd = fwd_df.values[lo:hi]
    dates = [int(d) for d in carry_df.index.values[lo:hi]]

    carry_raw = fac[protocols].values[lo:hi]  # un-standardized factor (for breadth/participation-ratio, matches funding)
    L, names = build_loadings(fees, revenue, tvl, price, universe, protocols)
    if neutralizations:
        cols = [i for i, nm in enumerate(names) if any(nm == n or nm.startswith(n) for n in neutralizations)]
        L = L[:, cols] if cols else np.zeros((len(protocols), 1))
        names = [names[i] for i in cols] if cols else ["<none>"]
    return {"carry": carry.tolist(), "carryRaw": carry_raw.tolist(), "forward": fwd.tolist(), "loadings": L.tolist(),
            "dates": dates, "protocols": protocols, "loadingNames": names,
            "shape": {"T": carry.shape[0], "M": carry.shape[1], "K": L.shape[1]}}


def panel_summary(stamp: str, min_days: int = 120) -> dict:
    """Coverage + coherent-window summary for the panel (used by Phase-0 validation + the viability report)."""
    universe, fees, revenue, tvl, price = load_snapshot(stamp)
    factors = build_factors(fees, revenue, tvl, price, size_coherence(universe, tvl))
    grid = fees.index.values
    cover = {}
    for name in FACTORS:
        cover[name] = int(np.isfinite(factors[name].values).any(axis=0).sum())
    # the composite coherent set: protocols with ≥min_days of fee_yield AND price
    coh = coherent_protocols(factors["fee_yield"], price, min_days)
    return {
        "stamp": stamp,
        "universeSize": len(universe),
        "dateGridDays": int(len(grid)),
        "firstDay": int(grid[0]) if len(grid) else None,
        "lastDay": int(grid[-1]) if len(grid) else None,
        "protocolsWithFactorCoverage": cover,
        "coherentProtocols_feeYield": len(coh),
        "coherentList": coh,
        "minDays": min_days,
        "tier": "T3-revised-discovery-only",
    }


def main():
    import sys
    payload = json.load(sys.stdin)
    mode = payload.get("mode", "summary")
    if mode == "summary":
        out = panel_summary(payload["stamp"], payload.get("minDays", 120))
    elif mode == "panel":
        out = panel_matrices(payload["stamp"], payload["factor"], int(payload.get("horizon", 7)),
                             payload.get("neutralizations", []), payload.get("minDays", 120))
    else:
        out = {"error": f"unknown mode {mode}"}
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()
