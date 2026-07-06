"""ORGΛNON Funding-Carry — the funding-carry-≠-edge DISCRIMINATOR (Blueprint Phase 2 / Rules VIII, X, XII, XIII).

Raw funding carry is beta + a tail/insurance premium (Rule XIII). This discriminator neutralizes funding against
the pre-specified funding factor model (level/beta, tail/regime, venue, depeg, oracle, liquidity — src/funding/
factors.ts), then tests whether RESIDUAL cross-venue/cross-asset dispersion predicts OUT-OF-SAMPLE realized funding —
fed EFFECTIVE-N-DEFLATED inputs (Rule XII). It REUSES the shared primitives and EDITS NEITHER (Rule VII):

  • neutralize.neutralize      — the cross-sectional Fama-MacBeth residualization (lending's, untouched)
  • neutralize.discriminate    — the OOS residual-IC + tail-aware portfolio gate, WITH nwLags deflation
  • neutralize.robust_discriminate — Appendix-C omitted-variable robustness
  • effective_n.*              — MEASURES the decorrelation time + effective-N + power floor (Phase 1)
  • rigor.*                    — reached ONLY through neutralize, and ONLY on deflated inputs

THE GATE (operationalizing Rule XII): no funding statistic reaches the rigor core undeflated. The OOS residual-IC
t-stat is a NEWEY–WEST t-stat with lags = the MEASURED decorrelation time of the residual-IC series; and a GO is
DOWNGRADED to INSUFFICIENT-EVIDENCE if the effective sample size is below the DERIVED power floor. Predict the
funding (observed), never a price (Appendix F).
"""
from __future__ import annotations

import json
import sys

import numpy as np

from backtest.py import effective_n, neutralize, rigor


def discriminate(payload: dict) -> dict:
    """payload: { carry:(T,M), forward:(T,M), loadings:(M,K), minPeriods?, cadenceHours?, targetIC?, tier? }.
    Returns the DEFLATED verdict + the Rule-XII disclosure (measured decorrelation, effective-N < nominal, naive-vs-
    deflated t, power floor). Verdict ∈ {GO, NO-GO, INSUFFICIENT-EVIDENCE}."""
    carry = np.asarray(payload["carry"], dtype=float)
    forward = np.asarray(payload["forward"], dtype=float)
    loadings = np.asarray(payload["loadings"], dtype=float)
    min_periods = int(payload.get("minPeriods", 60))
    cadence = float(payload.get("cadenceHours", 1.0))
    target_ic = float(payload.get("targetIC", 0.05))
    tier = payload.get("tier", "T2")

    if carry.ndim != 2 or carry.shape != forward.shape:
        return {"verdict": "INSUFFICIENT-EVIDENCE", "reason": "empty or misaligned panel", "tier": tier}

    # (1) residualize funding against the factor model, then build the residual-IC series (the signal we deflate).
    resid = neutralize.neutralize(carry, loadings)
    ric = neutralize._ic_series(resid, forward)  # per-period residual IC (finite values only)
    n = int(ric.size)

    # (2) MEASURE the decorrelation time of the residual-IC series → the NW lags + block length (Rule XII).
    tau_e = effective_n.decorrelation_time(ric) if n >= 5 else 0
    # bootstrap=False by default (called many times in the battery; the VERDICT uses the NW t-stat + power floor).
    # fullDisclosure=True (Phase-4 real run) re-runs the deflation WITH the full block-bootstrap sensitivity sweep.
    full = bool(payload.get("fullDisclosure", False))
    report = effective_n.deflate_report(ric, panel_matrix=carry, cadence_hours=cadence, target_ic=target_ic, bootstrap=full) if n >= 5 else None

    # (3) the NAIVE (undeflated) decision — kept ONLY to demonstrate the deflation, never used for the verdict.
    naive = neutralize.discriminate({"carry": carry.tolist(), "forward": forward.tolist(),
                                     "loadings": loadings.tolist(), "minPeriods": min_periods, "nwLags": 0})
    # (4) the DEFLATED decision — the OOS residual-IC t-stat is Newey–West with lags = measured decorrelation time.
    deflated = neutralize.discriminate({"carry": carry.tolist(), "forward": forward.tolist(),
                                        "loadings": loadings.tolist(), "minPeriods": min_periods, "nwLags": int(tau_e)})

    verdict = deflated["verdict"]
    downgrade = None
    # (5) POWER-FLOOR gate: a deflated GO still needs the effective sample to clear the DERIVED floor, else the
    # honest outcome is INSUFFICIENT-EVIDENCE (not enough effective power — the intraday cadence inflates nominal N,
    # dependence shrinks effective N).
    if verdict == "GO" and report is not None:
        eff_periods_have = report["effectiveNserial"]
        eff_periods_need = report["powerFloor"]["effectivePeriodsNeeded"]
        if eff_periods_have < eff_periods_need:
            verdict = "INSUFFICIENT-EVIDENCE"
            downgrade = f"effective periods {eff_periods_have:.0f} < derived floor {eff_periods_need} (Rule XII power floor)"

    return {
        "verdict": verdict,
        "tier": tier,
        "downgradedBy": downgrade,
        "naiveVerdict": naive["verdict"],
        "naiveOosTstat": naive.get("oosResidualIcTstat"),
        "deflatedOosTstat": deflated.get("oosResidualIcTstat"),
        "oosResidualIcMean": deflated.get("oosResidualIcMean"),
        "oosPortfolioTstat": deflated.get("oosPortfolioTstat"),
        "nPeriods": n,
        "nwLags": int(tau_e),
        "deflation": report,
        "rawIcTstat": deflated.get("rawIcTstat"),  # the RAW carry significance — NEVER a GO (Rule XIII)
        "note": "OOS residual-IC t-stat is Newey–West-deflated (lags = measured decorrelation time); GO also requires the effective sample to clear the derived power floor. Raw carry Sharpe/IC is never a GO.",
    }


def robust_discriminate(payload: dict, omitted_bank) -> dict:
    """Appendix C — omitted-variable robustness ON THE DEFLATED discriminator. Reuses neutralize.robust_discriminate
    with nwLags = measured decorrelation time so the robustness check is itself deflated. Bounds (does not eliminate)
    the unmodeled-risk failure (Rule X)."""
    carry = np.asarray(payload["carry"], dtype=float)
    forward = np.asarray(payload["forward"], dtype=float)
    loadings = np.asarray(payload["loadings"], dtype=float)
    resid = neutralize.neutralize(carry, loadings)
    ric = neutralize._ic_series(resid, forward)
    tau_e = effective_n.decorrelation_time(ric) if ric.size >= 5 else 0
    base = discriminate(payload)
    if base["verdict"] != "GO" or not omitted_bank:
        return {**base, "robust": base["verdict"], "robustDowngradedBy": None}
    r = neutralize.robust_discriminate({"carry": carry.tolist(), "forward": forward.tolist(),
                                        "loadings": loadings.tolist(), "minPeriods": int(payload.get("minPeriods", 60)),
                                        "nwLags": int(tau_e)}, omitted_bank)
    return {**base, "robust": r.get("robust"), "robustDowngradedBy": r.get("downgradedBy")}


def main():
    payload = json.load(sys.stdin)
    bank = payload.get("omittedBank")
    if bank:
        out = robust_discriminate(payload, [(b["name"], b["values"]) for b in bank])
    else:
        out = discriminate(payload)
    json.dump(rigor.json_safe(out), sys.stdout)


if __name__ == "__main__":
    main()
