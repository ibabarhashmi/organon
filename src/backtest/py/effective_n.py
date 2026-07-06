"""ORGΛNON Funding-Carry — FREQUENCY-INTEGRITY recalibration (Blueprint Phase 1 / Rule XII).

THE SINGLE DEFENSE AGAINST A FALSE POWERED GO. The shared rigor core (rigor.py: DSR/PSR/PBO/CPCV, the power floor)
was validated on DAILY data. Funding is captured INTRADAY (hourly) and is severely autocorrelated (literature
AR(1)≈0.97–0.998) and cross-venue-collinear. A Sharpe/IC t-stat computed as if intraday prints were independent
daily draws is massively inflated. This module sits BETWEEN the funding statistics and the shared rigor primitives
and feeds them DEFLATED inputs — it EDITS NEITHER rigor.py NOR neutralize.py (Rule VII):

  (a) MEASURE the autocorrelation / decorrelation time from the CAPTURED panel (never assume the literature value);
  (b) DERIVE the effective sample size under BOTH serial autocorrelation AND cross-sectional dependence
      (near-collinear same-underlying funding ⇒ effective breadth ≪ nominal venues×assets);
  (c) DEFLATE significance via Newey–West (HAC) AND a moving-block bootstrap, block length ≥ the measured
      decorrelation time, with a DISCLOSED sensitivity sweep across block lengths;
  (d) DERIVE the power floor in EFFECTIVE-N terms, replacing any asserted day count.

Effective-N is always ≤ nominal-N (dependence only shrinks it); an effective-N ≥ nominal-N is a Halt.

Run the Phase-1 demonstration:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.effective_n --selftest
"""
from __future__ import annotations

import glob
import json
import math
import os
import sys

import numpy as np

# Gates shared with the discriminator (neutralize.py T_GATE=3.0) + a modest ~80% one-sided power quantile.
T_GATE = 3.0
Z_POWER = 0.84  # Φ⁻¹(0.8)


# ────────────────────────────── (a) MEASURE: autocorrelation from the data ──────────────────────────────
def acf(x, max_lag: int) -> np.ndarray:
    """Sample autocorrelation function acf[0..max_lag] of a 1-D series (acf[0]=1). NaN-safe on constant series."""
    r = np.asarray(x, dtype=float)
    r = r[np.isfinite(r)]
    n = r.size
    if n < 3:
        return np.array([1.0])
    d = r - r.mean()
    denom = float(np.dot(d, d))
    if denom <= 0:  # constant series → no autocorrelation structure (returns just the lag-0 term)
        return np.array([1.0])
    lags = min(max_lag, n - 1)
    return np.array([1.0] + [float(np.dot(d[k:], d[:-k]) / denom) for k in range(1, lags + 1)])


def integrated_autocorr_time(x, max_lag: int | None = None) -> float:
    """τ_int = 1 + 2·Σ_{k≥1} acf_k, summed until the ACF first goes non-positive (the standard truncation window).
    This is the factor by which the effective sample shrinks: N_eff = N / τ_int. For AR(1) with autocorr ρ this
    equals (1+ρ)/(1−ρ). MEASURED from the series, never assumed."""
    r = np.asarray(x, dtype=float)
    r = r[np.isfinite(r)]
    n = r.size
    if n < 5:
        return 1.0
    a = acf(r, max_lag or min(n - 1, 200))
    tau = 1.0
    for k in range(1, a.size):
        if a[k] <= 0:  # truncate at the first non-positive lag (Geyer's initial-positive-sequence idea, simplified)
            break
        tau += 2.0 * a[k]
    return max(tau, 1.0)


def decorrelation_time(x) -> int:
    """The lag τ where the ACF first drops to ≤ 1/e ≈ 0.368 — the block-length floor for the bootstrap/NW window."""
    r = np.asarray(x, dtype=float)
    r = r[np.isfinite(r)]
    a = acf(r, min(r.size - 1, 200)) if r.size > 3 else np.array([1.0])
    thr = 1.0 / math.e
    for k in range(1, a.size):
        if a[k] <= thr:
            return k
    return max(1, a.size - 1)


# ────────────────────────────── (b) DERIVE: effective sample size ──────────────────────────────
def effective_n_serial(n: int, x=None, tau: float | None = None) -> float:
    """Effective sample size under serial autocorrelation: N_eff = N / τ_int (τ measured from x, or supplied).
    ≤ N always."""
    t = tau if tau is not None else integrated_autocorr_time(x if x is not None else [])
    return min(float(n), n / max(t, 1.0))


def effective_breadth(matrix) -> float:
    """Cross-sectional effective breadth = participation ratio of the correlation-matrix eigenvalues:
    M_eff = (Σλ)² / Σλ². M identical (perfectly collinear) series → M_eff=1; M independent → M_eff=M. This is how
    near-collinear same-underlying venue/asset funding collapses toward the number of INDEPENDENT underlyings, not
    the number of series (Rule XII / Appendix A #5). Columns with zero variance are dropped (no information)."""
    m = np.asarray(matrix, dtype=float)
    if m.ndim != 2 or m.shape[1] < 2:
        return float(m.shape[1] if m.ndim == 2 else 1)
    cols = [j for j in range(m.shape[1]) if np.isfinite(m[:, j]).sum() >= 3 and np.nanstd(m[:, j]) > 0]
    if len(cols) < 2:
        return float(len(cols))
    sub = m[:, cols]
    # pairwise correlation with NaN-aware masking; fall back to 0 where a pair has < 3 shared finite rows
    k = sub.shape[1]
    c = np.eye(k)
    for i in range(k):
        for j in range(i + 1, k):
            a, b = sub[:, i], sub[:, j]
            ok = np.isfinite(a) & np.isfinite(b)
            if ok.sum() >= 3 and np.std(a[ok]) > 0 and np.std(b[ok]) > 0:
                c[i, j] = c[j, i] = float(np.corrcoef(a[ok], b[ok])[0, 1])
    w = np.linalg.eigvalsh(c)
    w = np.clip(w, 0, None)
    s1, s2 = float(w.sum()), float((w ** 2).sum())
    return (s1 * s1 / s2) if s2 > 0 else float(k)


# ────────────────────────────── (c) DEFLATE: Newey–West + moving-block bootstrap ──────────────────────────────
def nw_tstat(x, lags: int) -> float:
    """Newey–West (HAC) t-stat of a mean with Bartlett weights — deflates the iid t-stat for autocorrelation.
    Reduces to the iid t-stat at lags=0. Same estimator the discriminator applies via neutralize.discriminate(nwLags)."""
    r = np.asarray(x, dtype=float)
    r = r[np.isfinite(r)]
    n = r.size
    if n < 2:
        return 0.0
    mu = float(r.mean())
    d = r - mu
    g0 = float(np.dot(d, d) / n)
    s = g0
    L = min(int(lags), n - 1)
    for l in range(1, L + 1):
        s += 2.0 * (1.0 - l / (L + 1.0)) * float(np.dot(d[l:], d[:-l]) / n)
    var_mean = s / n
    return 0.0 if var_mean <= 0 else float(mu / math.sqrt(var_mean))


def iid_tstat(x) -> float:
    r = np.asarray(x, dtype=float)
    r = r[np.isfinite(r)]
    n = r.size
    if n < 2:
        return 0.0
    sd = r.std(ddof=1)
    return 0.0 if sd == 0 else float(r.mean() / (sd / math.sqrt(n)))


def block_bootstrap_mean_ci(x, block_len: int, n_boot: int = 2000, seed: int = 20260702, alpha: float = 0.05):
    """Moving-block bootstrap CI of the MEAN. Blocks of length `block_len` (≥ the measured decorrelation time)
    preserve within-block dependence, so the CI does NOT shrink the way an iid resample would. Deterministic (seeded).
    Returns (lo, hi, p_two_sided_that_mean=0-ish via CI-exclusion)."""
    r = np.asarray(x, dtype=float)
    r = r[np.isfinite(r)]
    n = r.size
    L = max(1, int(block_len))
    if n < L + 1:
        return (float("nan"), float("nan"), float("nan"))
    rng = np.random.default_rng(seed)
    n_blocks = int(math.ceil(n / L))
    starts_pool = n - L + 1
    means = np.empty(n_boot)
    for b in range(n_boot):
        starts = rng.integers(0, starts_pool, size=n_blocks)
        sample = np.concatenate([r[s:s + L] for s in starts])[:n]
        means[b] = sample.mean()
    lo, hi = np.percentile(means, [100 * alpha / 2, 100 * (1 - alpha / 2)])
    excludes_zero = lo > 0 or hi < 0
    return (float(lo), float(hi), 0.0 if excludes_zero else 1.0)


def block_length_sensitivity(x, taus, n_boot: int = 2000, seed: int = 20260702):
    """Disclosed sensitivity sweep: the block-bootstrap CI + NW t-stat across a range of block lengths. Shows
    significance SHRINKING as the block length grows toward/through the measured decorrelation time (not tuned)."""
    out = []
    for L in taus:
        lo, hi, _ = block_bootstrap_mean_ci(x, L, n_boot=n_boot, seed=seed)
        out.append({"blockLen": int(L), "ciLo": lo, "ciHi": hi, "ciExcludesZero": bool(lo > 0 or hi < 0), "nwTstat": nw_tstat(x, L)})
    return out


# ────────────────────────────── (d) DERIVE: the power floor in effective-N terms ──────────────────────────────
def derive_power_floor(target_ic: float, eff_breadth: float, tau_int: float, cadence_hours: float = 1.0,
                       t_gate: float = T_GATE, z_power: float = Z_POWER) -> dict:
    """Power floor DERIVED (not asserted) in effective-N terms, the intraday analog of src/lending/power.ts.
      per-period IC SE ≈ 1/√(M_eff − 3)  (Fisher);  need N_eff s.t. targetIC·√N_eff / SE > t_gate + z_power
      ⇒ N_eff_needed = ((t_gate+z_power)·SE / targetIC)² ;  N_nominal = N_eff_needed · τ_int  (autocorr inflation).
    Wall-clock horizon = N_nominal · cadence_hours. All inputs are MEASURED/pre-specified and stated."""
    se = 1.0 / math.sqrt(max(eff_breadth - 3.0, 1.0))
    n_eff_needed = ((t_gate + z_power) * se / target_ic) ** 2
    n_nominal = n_eff_needed * max(tau_int, 1.0)
    return {
        "targetIC": target_ic,
        "effectiveBreadth": eff_breadth,
        "tauInt": tau_int,
        "sePerPeriod": se,
        "effectivePeriodsNeeded": math.ceil(n_eff_needed),
        "nominalPeriodsNeeded": math.ceil(n_nominal),
        "cadenceHours": cadence_hours,
        "harvestHorizonDays": (n_nominal * cadence_hours) / 24.0,
        "tGate": t_gate,
        "zPower": z_power,
        "note": "derived from effective sample size: eff periods × τ_int autocorr inflation; NOT an asserted count",
    }


# ── CANONICAL τ_int (Unified Sprint P4 / Rule XII / Appendix D — fixes C4/C5) ──────────────────────────────────
# ONE canonical τ_int per panel, used everywhere for effective-N + the floor. We pick the CONSERVATIVE series (the
# larger τ_int → smaller eff-N → harsher gate): the per-asset FUNDING series (more autocorrelated than the
# cross-sectional residual-IC series, which partially decorrelates by averaging across assets). The residual-IC τ_int
# is DISCLOSED as the alternative. Naming the series removes the C4 ambiguity (previously τ_int meant 3 different
# objects under one name). The NW deflation bandwidth (nwLags) stays the residual-IC decorrelation time — a separate,
# standard HAC quantity — but the effective-SAMPLE / power-floor consumes only this canonical τ_int.
CANONICAL_TAU_SERIES = "per-asset-funding-median (conservative; residual-IC disclosed as alternative)"


def canonical_tau(panel_matrix) -> float:
    """The canonical (conservative) τ_int: median integrated-autocorr time across the per-asset funding columns."""
    m = np.asarray(panel_matrix, dtype=float)
    if m.ndim != 2:
        return 1.0
    taus = [integrated_autocorr_time(m[:, j]) for j in range(m.shape[1]) if np.isfinite(m[:, j]).sum() >= 5 and np.nanstd(m[:, j]) > 0]
    return float(np.median(taus)) if taus else 1.0


def power_status(eff_n_have: float, floor_need: float) -> dict:
    """DECOMPOSED power status (replaces a single monotonic '% to power', C5). Reports the two SAMPLE-DEPENDENT terms
    SEPARATELY — the effective observations you have and the floor you need — and states that BOTH move with the
    sample (more data raises eff-N AND, via M_eff/τ_int, changes the floor), so a single cross-run % double-counts."""
    return {
        "effectiveObservationsHave": eff_n_have,
        "floorObservationsNeed": floor_need,
        "gapObservations": max(floor_need - eff_n_have, 0.0),
        "powered": eff_n_have >= floor_need,
        "note": "eff-N and the floor are BOTH sample-dependent (the floor consumes measured M_eff/τ_int); reported separately, NOT as a single '% to power' (which double-counts a moving numerator and denominator). Not a monotonic progress bar.",
    }


def deflate_report(ic_series, panel_matrix=None, cadence_hours: float = 1.0, target_ic: float = 0.05,
                   bootstrap: bool = True, n_boot: int = 2000) -> dict:
    """The single entry point the funding discriminator/runner calls to obtain the deflated view of an IC series
    (and, if given, the panel it came from). Returns the measured decorrelation, effective-N (< nominal), the
    naive-vs-deflated t-stats, the block-length sensitivity, and the derived power floor. `bootstrap=False` skips the
    (disclosure-only) block-bootstrap sweep for speed — the VERDICT uses the NW t-stat + power floor, not the bootstrap."""
    ic = np.asarray(ic_series, dtype=float)
    ic = ic[np.isfinite(ic)]
    n = ic.size
    tau_int = integrated_autocorr_time(ic)
    tau_e = decorrelation_time(ic)
    m_eff = effective_breadth(panel_matrix) if panel_matrix is not None else float("nan")
    # CANONICAL τ_int (P4): the conservative per-asset funding τ_int drives eff-N + the floor; residual-IC τ disclosed.
    tau_canonical = canonical_tau(panel_matrix) if panel_matrix is not None else tau_int
    tau_residual_ic = tau_int
    n_eff = effective_n_serial(n, tau=tau_canonical)  # conservative
    naive_t = iid_tstat(ic)
    defl_t = nw_tstat(ic, tau_e)
    sens = block_length_sensitivity(ic, sorted({1, tau_e, 2 * tau_e, 4 * tau_e}), n_boot=n_boot) if bootstrap else []
    floor = derive_power_floor(target_ic, m_eff if math.isfinite(m_eff) else 40.0, tau_canonical, cadence_hours)
    return {
        "nominalN": int(n),
        "canonicalTauSeries": CANONICAL_TAU_SERIES,
        "tauCanonical": tau_canonical,          # the ONE τ_int used for eff-N + floor (conservative, P4)
        "tauResidualIcAlternative": tau_residual_ic,  # disclosed alternative (C4)
        "tauIntegrated": tau_canonical,         # back-compat alias = the canonical (no longer an ambiguous 3rd value)
        "decorrTime": int(tau_e),               # NW/block bandwidth (residual-IC), a separate standard quantity
        "effectiveNserial": n_eff,
        "effectiveBreadth": m_eff,
        "effLtNominal": bool(n_eff < n),  # MUST be true (dependence only shrinks N) — else a Halt
        "naiveTstat": naive_t,
        "deflatedTstat": defl_t,
        "deflationRatio": (abs(defl_t) / abs(naive_t)) if naive_t != 0 else float("nan"),
        "blockLengthSensitivity": sens,
        "powerFloor": floor,
        "powerStatus": power_status(n_eff, floor["effectivePeriodsNeeded"]),  # DECOMPOSED (C5), not a single %
    }


# ────────────────────────────── real captured panel loader (ACF measured from REAL data) ──────────────────────────────
def _repo_root() -> str:
    d = os.path.abspath(os.path.dirname(__file__))
    for _ in range(12):
        if os.path.isdir(os.path.join(d, "data", "funding")):
            return d
        d = os.path.dirname(d)
    return os.getcwd()


def load_hl_panel():
    """Load the captured HL native-history cross-asset panel → (times × assets) annualized-funding matrix. Real data."""
    hl = glob.glob(os.path.join(_repo_root(), "data", "funding", "history", "hl", "*.json"))
    series = []
    for f in sorted(hl):
        j = json.load(open(f))
        pts = {p["time"]: p["annualized"] for p in j["points"] if p.get("annualized") is not None}
        series.append((j["coin"], pts))
    times = sorted({t for _, pts in series for t in pts})
    coins = [c for c, _ in series]
    mat = np.array([[pts.get(t, np.nan) for _, pts in series] for t in times], dtype=float)
    return coins, times, mat


# ────────────────────────────── the Phase-1 demonstration (deterministic, no network) ──────────────────────────────
def _demo_autocorrelated_ic(seed=20260702, n=1600, rho=0.95, mu=0.07, noise=0.2):
    """A fixed IC series = a small constant mean μ + a persistent (AR(1), demeaned) fluctuation — the exact
    autocorrelation trap (Appendix A #4). μ is significant at the NOMINAL sample size but NOT at the EFFECTIVE size:
    the naive (iid) t-stat counts n persistent points as independent and crosses the gate (a false GO); the NW /
    block-bootstrap deflation removes the inflation and refuses it (NO-GO). The persistent component is DEMEANED so
    the realized mean is exactly μ — this isolates the autocorrelation's effect on the t-STATISTIC (removing
    realization luck), making the demonstration deterministic. This is an explicit demonstration of the mechanism,
    not a battery scenario tuned to mint a GO on real data (the real arbiter is the discriminator in Phase 4)."""
    rng = np.random.default_rng(seed)
    e = np.empty(n)
    cur = 0.0
    for t in range(n):
        cur = rho * cur + rng.normal(0.0, 1.0) * noise
        e[t] = cur
    return mu + (e - e.mean())


def selftest():
    print("Phase 1 — frequency-integrity recalibration (Rule XII). Effective-N is DERIVED, not asserted.\n")
    failures = []

    def check(name, cond, detail=""):
        print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
        if not cond:
            failures.append(name)

    # 1) MEASURED autocorrelation on REAL captured HL funding (never the literature value).
    print("(1) MEASURED autocorrelation from the captured HL panel (real data):")
    try:
        coins, times, mat = load_hl_panel()
        var_cols = [j for j in range(mat.shape[1]) if np.nanstd(mat[:, j]) > 0]
        taus = [integrated_autocorr_time(mat[:, j]) for j in var_cols]
        med_tau = float(np.median(taus)) if taus else float("nan")
        m_eff = effective_breadth(mat)
        n_periods = mat.shape[0]
        n_eff = effective_n_serial(n_periods, tau=med_tau) if math.isfinite(med_tau) else float("nan")
        print(f"    panel: {mat.shape[0]} hourly periods × {mat.shape[1]} assets ({len(var_cols)} with variance)")
        print(f"    MEASURED median integrated-autocorr time τ_int = {med_tau:.1f} (literature AR(1)≈0.97–0.998 ⇒ τ large; measured, not assumed)")
        print(f"    effective breadth M_eff = {m_eff:.1f}  (nominal {mat.shape[1]} assets → many pinned to HL's funding floor ⇒ collinear)")
        print(f"    effective serial N = {n_eff:.0f}  vs nominal {n_periods}  →  N_eff < N: {n_eff < n_periods}")
        check("effective breadth < nominal asset count (cross-sectional dependence measured)", m_eff < mat.shape[1], f"{m_eff:.1f} < {mat.shape[1]}")
        check("effective serial N < nominal N (autocorrelation measured from real panel)", (not math.isfinite(n_eff)) or n_eff < n_periods, f"{n_eff:.0f} < {n_periods}")
    except Exception as ex:  # noqa
        print(f"    (no captured HL panel yet: {ex}) — falling back to the synthetic-only demonstration")
        med_tau = float("nan")

    # 2) THE DEMONSTRATION (focal question #1): naive → GO, deflated → NO-GO on the SAME autocorrelated series.
    print("\n(2) naive-vs-deflated significance on a fixed autocorrelated IC series (the false-GO flip):")
    ic = _demo_autocorrelated_ic()
    rep = deflate_report(ic, panel_matrix=None, target_ic=0.05)
    naive_go = abs(rep["naiveTstat"]) > T_GATE
    deflated_go = abs(rep["deflatedTstat"]) > T_GATE
    print(f"    nominal N = {rep['nominalN']},  MEASURED τ_int = {rep['tauIntegrated']:.1f},  decorr time = {rep['decorrTime']}")
    print(f"    effective serial N = {rep['effectiveNserial']:.0f}  (< nominal {rep['nominalN']}: {rep['effLtNominal']})")
    print(f"    NAIVE (iid) t-stat   = {rep['naiveTstat']:.2f}  → {'GO' if naive_go else 'NO-GO'} at gate {T_GATE}")
    print(f"    DEFLATED (NW) t-stat = {rep['deflatedTstat']:.2f}  → {'GO' if deflated_go else 'NO-GO'} at gate {T_GATE}")
    print(f"    deflation ratio = {rep['deflationRatio']:.2f}× (deflated is materially smaller)")
    check("effective-N < nominal-N (dependence only shrinks it — never a Halt)", rep["effLtNominal"], f"{rep['effectiveNserial']:.0f} < {rep['nominalN']}")
    check("NAIVE path blesses the autocorrelated series (t > gate) — the trap is real", naive_go, f"naiveT={rep['naiveTstat']:.2f}")
    check("DEFLATED path REFUSES it (t < gate) — autocorrelation false-GO → NO-GO", not deflated_go, f"deflatedT={rep['deflatedTstat']:.2f}")
    check("deflated t-stat is materially smaller than naive", abs(rep["deflatedTstat"]) < abs(rep["naiveTstat"]), f"{rep['deflatedTstat']:.2f} < {rep['naiveTstat']:.2f}")

    # 3) DISCLOSED block-length sensitivity (block ≥ decorrelation time).
    print("\n(3) block-length sensitivity (disclosed; CI widens / significance falls as block → decorrelation time):")
    for s in rep["blockLengthSensitivity"]:
        print(f"    block={s['blockLen']:>4}  CI=[{s['ciLo']:+.4f},{s['ciHi']:+.4f}]  excludes0={s['ciExcludesZero']}  nwT={s['nwTstat']:.2f}")
    b1 = rep["blockLengthSensitivity"][0]
    bmax = rep["blockLengthSensitivity"][-1]
    check("iid-like block=1 finds significance but block≥decorr-time does NOT (block-bootstrap deflation live)",
          b1["ciExcludesZero"] and not bmax["ciExcludesZero"], f"block1 excl0={b1['ciExcludesZero']} → block{bmax['blockLen']} excl0={bmax['ciExcludesZero']}")

    # 4) DERIVED power floor (effective-N terms).
    print("\n(4) DERIVED power floor (effective-N terms, not an asserted count):")
    floor = rep["powerFloor"]
    print(f"    targetIC={floor['targetIC']}  M_eff(assumed for floor)={floor['effectiveBreadth']:.0f}  τ_int={floor['tauInt']:.1f}")
    print(f"    → {floor['effectivePeriodsNeeded']} effective periods  ⇒  {floor['nominalPeriodsNeeded']} nominal hourly prints")
    print(f"    → derived harvest horizon ≈ {floor['harvestHorizonDays']:.0f} days at hourly cadence")

    ok = not failures
    print(f"\nPhase 1 effective_n: {'ALL PASS' if ok else 'FAIL -> ' + ', '.join(failures)}")
    print("NOTE (Rule XII): the deflation is MEASURED from the data's own autocorrelation, not a chosen fudge factor;")
    print("      no funding statistic reaches rigor.py undeflated; effective-N is derived-not-asserted and < nominal-N.")
    return ok


def main():
    if "--selftest" in sys.argv:
        sys.exit(0 if selftest() else 1)
    # library/stdin mode: {icSeries:[...], matrix?:[[...]], cadenceHours?, targetIC?} → deflated report
    payload = json.load(sys.stdin)
    rep = deflate_report(payload["icSeries"], panel_matrix=payload.get("matrix"),
                         cadence_hours=payload.get("cadenceHours", 1.0), target_ic=payload.get("targetIC", 0.05))
    json.dump(rep, sys.stdout)


if __name__ == "__main__":
    main()
