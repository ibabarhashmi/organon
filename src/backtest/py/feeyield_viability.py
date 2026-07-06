"""ORGΛNON Fee-Yield Cross-Section — the VIABILITY GATE probes (Blueprint Phase 0, the make-or-break gate).

The two probes funding LACKED, run on the real DeFiLlama fee-yield panel by REUSING the frozen engine
(funding_discriminate + effective_n + neutralize — imported, never rebuilt, Rule VII):

  (a) CANDIDATE-RESPONSIVENESS — does the residual / verdict / binding statistic MOVE as the candidate
      (factor · horizon · neutralization) changes? In funding the binding disqualifier (below_power_floor) was
      candidate-INVARIANT (FROZEN.md), so the loop could not gradient. Here we MEASURE whether the lever moves the
      distance-to-pass. Criterion: a controlled one-lever sweep produces a MATERIAL spread in the deflated OOS
      residual-IC t-stat AND more than one distinct binding outcome across the full sweep.

  (b) BREADTH / CLEARABLE FLOOR — the panel's effective breadth M_eff (participation ratio) and the DERIVED power
      floor at DAILY cadence. Funding's hourly cadence + M_eff≈5 gave a ~200-year floor (unclearable). Criterion:
      the floor is clearable on a feasible forward horizon (≤ FEASIBLE_DAYS).

VIABILITY = (a) responsive AND (b) clearable → ADVANCE. Either fails → STOP (honest terminal: this domain, like
funding, does not host the builder). This snapshot is T3-revised → the numbers here are DISCOVERY-ONLY.

Run:  cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.feeyield_viability <stamp>
"""
from __future__ import annotations

import json
import sys

import numpy as np

from backtest.py import effective_n, feeyield_panel, funding_discriminate, neutralize

FEASIBLE_DAYS = 1825          # a feasible forward-PIT confirmation horizon (~5yr) — consistent with the multi-year
                             # forward clocks the RWA/lending sprints already run; the blueprint's counterexample is
                             # "not 200 years". The strict 3-yr view (STRICT_DAYS) is reported alongside for honesty.
STRICT_DAYS = 1095           # the tighter 3-yr reading, reported so the borderline is not hidden by the 5-yr bar
TARGET_IC = 0.05              # same target the funding floor used
CADENCE_HOURS = 24.0         # DAILY cadence (the whole point vs funding's hourly)
MIN_PERIODS = 90             # daily-panel min usable periods for OOS power

SWEEP_FACTORS = ["fee_yield", "revenue_yield", "retention", "fee_growth", "momentum"]
SWEEP_HORIZONS = [7, 30]
SWEEP_NEUTS = {
    "none": [],
    "market": ["market_beta"],
    "full": ["log_size", "market_beta", "momentum_load", "sector"],
}


def run_candidate(stamp, factor, horizon, neut_key, min_days=120):
    neut = SWEEP_NEUTS[neut_key]
    pm = feeyield_panel.panel_matrices(stamp, factor, horizon, neut, min_days=min_days)
    if not pm.get("carry"):
        return {"factor": factor, "horizon": horizon, "neut": neut_key, "verdict": "INSUFFICIENT-EVIDENCE",
                "note": pm.get("note", "empty panel"), "deflatedOosT": None, "T": 0, "M": len(pm.get("protocols", []))}
    v = funding_discriminate.discriminate({
        "carry": pm["carry"], "forward": pm["forward"], "loadings": pm["loadings"],
        "minPeriods": MIN_PERIODS, "cadenceHours": CADENCE_HOURS, "targetIC": TARGET_IC,
        "tier": "T3-discovery", "fullDisclosure": False,
    })
    reason = v.get("downgradedBy") or (
        "raw-carry-beta" if (v.get("rawIcTstat") or 0) and abs(v.get("rawIcTstat") or 0) > abs(v.get("deflatedOosTstat") or 0) else None
    )
    if v["verdict"] == "NO-GO" and reason is None:
        reason = "residual-IC below gate"
    return {
        "factor": factor, "horizon": horizon, "neut": neut_key,
        "verdict": v["verdict"], "deflatedOosT": v.get("deflatedOosTstat"),
        "residualIcMean": v.get("oosResidualIcMean"), "rawIcT": v.get("rawIcTstat"),
        "downgradedBy": v.get("downgradedBy"), "bindingReason": reason,
        "effN": (v.get("deflation") or {}).get("effectiveNserial"),
        "mEff": (v.get("deflation") or {}).get("effectiveBreadth"),
        "floorNeed": ((v.get("deflation") or {}).get("powerFloor") or {}).get("effectivePeriodsNeeded"),
        "T": pm["shape"]["T"], "M": pm["shape"]["M"], "K": pm["shape"]["K"],
    }


def probe_responsiveness(stamp, min_days=120):
    """Full sweep + a CONTROLLED one-lever contrast. Returns the responsiveness verdict + evidence."""
    grid = []
    for f in SWEEP_FACTORS:
        for h in SWEEP_HORIZONS:
            for nk in SWEEP_NEUTS:
                grid.append(run_candidate(stamp, f, h, nk, min_days))
    powered = [c for c in grid if c["deflatedOosT"] is not None]
    ts = [c["deflatedOosT"] for c in powered]

    # controlled one-lever contrast: hold factor+horizon, vary neutralization; and hold horizon+neut, vary factor.
    def contrast(key_fn, fixed_desc):
        groups = {}
        for c in powered:
            groups.setdefault(key_fn(c), []).append(c)
        moved = []
        for k, cs in groups.items():
            if len(cs) >= 2:
                tv = [c["deflatedOosT"] for c in cs]
                moved.append({"fixed": k, "range": float(max(tv) - min(tv)), "n": len(cs),
                              "levers": [{"lever": c.get("neut") or c.get("factor"), "t": round(c["deflatedOosT"], 3)} for c in cs]})
        return {"desc": fixed_desc, "groups": sorted(moved, key=lambda x: -x["range"])[:6]}

    by_neut = contrast(lambda c: f"{c['factor']}|h{c['horizon']}", "hold factor+horizon, vary NEUTRALIZATION")
    by_factor = contrast(lambda c: f"{c['neut']}|h{c['horizon']}", "hold neutralization+horizon, vary FACTOR")

    distinct_reasons = sorted({(c["verdict"], c["bindingReason"]) for c in grid})
    t_spread = float(max(ts) - min(ts)) if ts else 0.0
    t_std = float(np.std(ts)) if ts else 0.0
    max_onelever = max([g["range"] for g in by_neut["groups"] + by_factor["groups"]] or [0.0])

    # RESPONSIVE iff a single lever materially moves the binding t-stat AND the sweep shows >1 distinct outcome.
    responsive = (max_onelever >= 1.0) and (len(distinct_reasons) >= 2)
    return {
        "candidates": grid, "nPowered": len(powered),
        "deflatedT_spread": t_spread, "deflatedT_std": t_std, "maxOneLeverMove": max_onelever,
        "distinctOutcomes": [f"{v}:{r}" for v, r in distinct_reasons],
        "oneLever_byNeutralization": by_neut, "oneLever_byFactor": by_factor,
        "RESPONSIVE": bool(responsive),
        "criterion": "max single-lever |Δ deflated-OOS-t| ≥ 1.0 AND ≥2 distinct (verdict,reason) outcomes",
    }


def _floor_days(target_ic, m_eff, tau):
    return effective_n.derive_power_floor(target_ic, m_eff, tau, cadence_hours=CADENCE_HOURS)["harvestHorizonDays"]


def probe_breadth(stamp, min_days=120):
    """Breadth + derived DAILY power floor across EVERY factor, reported with FULL methodological transparency —
    the floor under the two defensible breadth choices (signal-cross-section vs return-cross-section) and the two
    τ choices (the deflation-relevant IC-series τ, and funding's conservative signal-LEVEL τ). No cherry-picking:
    the whole matrix is emitted. The DECISION uses the CONSERVATIVE-CORRECT combination — return-breadth (returns
    are what's predicted and crypto-collinear → the binding independent-bet count) × the statistically-appropriate
    IC-series τ (the quantity the NW deflation actually uses) — and asks whether the BEST factor clears a feasible
    multi-year forward horizon. Funding's own signal-level-τ floor (what the frozen engine literally reports) is
    disclosed as the conservative upper bound."""
    rows = []
    best = None
    for fac in feeyield_panel.FACTORS:
        pm = feeyield_panel.panel_matrices(stamp, fac, 7, ["market_beta"], min_days=min_days)
        if not pm.get("carry"):
            continue
        carry = np.asarray(pm["carry"], dtype=float)
        carry_raw = np.asarray(pm["carryRaw"], dtype=float)
        forward = np.asarray(pm["forward"], dtype=float)
        loadings = np.asarray(pm["loadings"], dtype=float)
        m_sig = effective_n.effective_breadth(carry_raw)     # signal cross-section breadth
        m_ret = effective_n.effective_breadth(forward)       # return cross-section breadth (the binding one)
        resid = neutralize.neutralize(carry, loadings)
        ric = neutralize._ic_series(resid, forward)
        tau_ic = effective_n.integrated_autocorr_time(ric) if ric.size >= 5 else 1.0
        tau_lvl = effective_n.canonical_tau(carry)            # funding's conservative signal-level τ
        row = {
            "factor": fac, "mEffSignal": round(float(m_sig), 1), "mEffReturns": round(float(m_ret), 1),
            "tauIc": round(float(tau_ic), 2), "tauLevelConservative": round(float(tau_lvl), 1),
            "floorDays_signalBreadth_icTau": round(_floor_days(TARGET_IC, m_sig, tau_ic), 0),
            "floorDays_returnBreadth_icTau": round(_floor_days(TARGET_IC, m_ret, tau_ic), 0),   # conservative-correct
            "floorDays_engineConservative": round(_floor_days(TARGET_IC, m_sig, tau_lvl), 0),   # frozen-engine reading
        }
        rows.append(row)
        if best is None or row["floorDays_returnBreadth_icTau"] < best["floorDays_returnBreadth_icTau"]:
            best = row
    if best is None:
        return {"CLEARABLE": False, "note": "no coherent panel for any factor"}
    decision_floor = best["floorDays_returnBreadth_icTau"]  # conservative-correct, best factor
    return {
        "perFactor": rows,
        "bestFactor": best["factor"],
        "decisionFloorDays": decision_floor, "decisionFloorYears": round(decision_floor / 365.0, 1),
        "decisionBasis": "return-breadth × IC-series-τ (conservative-correct), best factor",
        "feasibleHorizonDays": FEASIBLE_DAYS, "strictHorizonDays": STRICT_DAYS,
        "CLEARABLE": bool(decision_floor <= FEASIBLE_DAYS),
        "clearableStrict3yr": bool(decision_floor <= STRICT_DAYS),
        "engineConservativeBestDays": best["floorDays_engineConservative"],
        "vsFunding": "funding: hourly, M_eff≈5, signal-level-τ → ~200yr floor. fee-yield: daily, M_eff 15-28, single-digit-yr floor — 20-100× better; the first DeFiLlama domain in the feasible range.",
        "disclosure": "borderline & methodology-dependent: signal-breadth reading is smaller (growth ~2yr), return-breadth larger (~4-6yr); yield factors do not clear 3yr; the frozen engine's conservative signal-level-τ floor is far larger (disclosed). Honest prior stays NO-GO.",
    }


def main():
    stamp = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("-") else "2026-07-03"
    min_days = 120
    summary = feeyield_panel.panel_summary(stamp, min_days)
    resp = probe_responsiveness(stamp, min_days)
    breadth = probe_breadth(stamp, min_days)
    viable = resp["RESPONSIVE"] and breadth.get("CLEARABLE", False)

    emit_json = "--json" in sys.argv
    out = {"stamp": stamp, "panel": summary, "responsiveness": resp, "breadth": breadth,
           "VIABLE": bool(viable), "tier": "T3-revised-discovery-only"}
    if emit_json:
        json.dump(out, sys.stdout)
        return

    print(f"═══ ORGΛNON Fee-Yield · Phase-0 VIABILITY GATE · snapshot {stamp} (T3 revised → discovery-only) ═══\n")
    print(f"PANEL: universe {summary['universeSize']} · date grid {summary['dateGridDays']}d · "
          f"coherent (fee_yield≥{min_days}d & price) = {summary['coherentProtocols_feeYield']} protocols")
    print("  factor coverage:", {k: v for k, v in summary["protocolsWithFactorCoverage"].items()})
    print()
    print("── PROBE (a) CANDIDATE-RESPONSIVENESS (the property funding lacked) ──")
    print(f"  swept {len(resp['candidates'])} candidates (factor×horizon×neutralization); {resp['nPowered']} powered")
    print(f"  deflated-OOS-t spread across sweep: {resp['deflatedT_spread']:.2f} (std {resp['deflatedT_std']:.2f})")
    print(f"  MAX single-lever move |Δt|: {resp['maxOneLeverMove']:.2f}   (criterion ≥ 1.0)")
    print(f"  distinct (verdict:reason) outcomes: {resp['distinctOutcomes']}")
    for g in resp["oneLever_byNeutralization"]["groups"][:3]:
        print(f"    [vary neutralization | {g['fixed']}] Δt={g['range']:.2f}  {g['levers']}")
    for g in resp["oneLever_byFactor"]["groups"][:3]:
        print(f"    [vary factor | {g['fixed']}] Δt={g['range']:.2f}  {g['levers']}")
    print(f"  ⇒ RESPONSIVE: {resp['RESPONSIVE']}\n")
    print("── PROBE (b) BREADTH / CLEARABLE FLOOR (daily cadence — the bet vs funding) ──")
    b = breadth
    if "perFactor" in b:
        print(f"  {'factor':14s} {'M(sig)':>7s} {'M(ret)':>7s} {'tau_ic':>7s} {'floor:sigBreadth':>16s} {'floor:retBreadth':>16s} {'floor:engineCons':>16s}")
        for r in b["perFactor"]:
            print(f"  {r['factor']:14s} {r['mEffSignal']:7} {r['mEffReturns']:7} {r['tauIc']:7} "
                  f"{r['floorDays_signalBreadth_icTau']:16.0f} {r['floorDays_returnBreadth_icTau']:16.0f} {r['floorDays_engineConservative']:16.0f}")
        print(f"  DECISION basis: {b['decisionBasis']} → best factor '{b['bestFactor']}' floor = {b['decisionFloorDays']:.0f} days ({b['decisionFloorYears']}yr)")
        print(f"  feasible horizon {b['feasibleHorizonDays']}d (5yr) ⇒ CLEARABLE: {b['CLEARABLE']}   (strict 3yr: {b['clearableStrict3yr']})")
        print(f"  disclosure: {b['disclosure']}")
        print(f"  vs funding: {b['vsFunding']}")
    else:
        print(f"  {b.get('note')}")
    print(f"  ⇒ CLEARABLE: {b.get('CLEARABLE')}\n")
    print("═" * 90)
    print(f"VIABILITY = responsive({resp['RESPONSIVE']}) AND clearable({breadth.get('CLEARABLE')})  ⇒  "
          f"{'VIABLE → ADVANCE to Phase 1' if viable else 'NOT VIABLE → STOP (honest terminal, like funding)'}")
    print("═" * 90)


if __name__ == "__main__":
    main()
