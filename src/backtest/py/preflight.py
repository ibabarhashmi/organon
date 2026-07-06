"""ORGΛNON — the BREADTH PRE-FLIGHT (Breadth-Rename sprint, Phase 0; the central improvement; Rule A-PRE).

For nine sprints effective breadth silently governed every result and the tool reported it LATE — after signals,
neutralization, deflation — as if it were an edge verdict. This pre-flight computes it FIRST, from a panel's
CORRELATION STRUCTURE ALONE (no signal, no edge, no verdict), and reports whether a powered verdict is reachable
*at all* in this domain/universe — before any discovery analysis.

IT REUSES THE FROZEN BREADTH/FLOOR MATH BYTE-IDENTICAL (Rule VII): it imports `effective_n` and calls the SAME
`effective_breadth` / `canonical_tau` / `derive_power_floor` / `effective_n_serial` / `power_status` the engine
uses — it re-derives NOTHING and edits NOTHING. It only orchestrates them on a panel and reports.

IT REPORTS; IT DOES NOT AUTO-REFUSE (Rule A-PRE, XXXVIII). The "structurally un-powered" conclusion rests on the
power-floor formula being correct, which is UNAUDITED. A pre-flight that auto-refused domains on an unaudited floor
would confidently declare good domains dead — automating a possibly-wrong conclusion. So reachability is a hedged
DIAGNOSTIC ("pending floor audit"), and the refuse-to-run behavior lives behind a disclosed, default-OFF flag.

Reachability (structural, non-divergent): a signal's effective sample can never exceed its number of periods
(effN = N/τ, τ ≥ 1). So the ABSOLUTE ceiling — what even a perfect-foresight signal could achieve — is N. The
pre-flight asks the FROZEN `power_status(effN=N, floor)`: if N < floor, NO signal of any strength clears the bar on
this panel (definitively un-powered); if N ≥ floor, the floor is not structurally unreachable (a strong enough,
low-autocorrelation signal COULD clear it — necessary, not sufficient).

Run:  cd packages/solidity-sentinel/src && echo '<panel-json>' | PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.preflight
      panel-json = {"panel": [[...],[...]], "targetIC"?: 0.05, "cadenceHours"?: 168, "autoRefuse"?: false, "label"?: "..."}
"""
from __future__ import annotations

import json
import sys

import numpy as np

from backtest.py import effective_n, rigor


def preflight(panel, target_ic: float = 0.05, cadence_hours: float = 24.0, auto_refuse: bool = False, label: str = "") -> dict:
    """Panel (T×M) → {effectiveBreadth, powerFloor, effN, reachable, reason}. Pure orchestration of the FROZEN
    effective_n math on the panel's correlation structure alone. REPORTS; refuses ONLY if auto_refuse is explicitly
    True (default False → never refuses)."""
    p = np.asarray(panel, dtype=float)
    if p.ndim != 2 or p.shape[0] < 2 or p.shape[1] < 2:
        return {"label": label, "error": "panel must be 2-D (T×M) with T≥2, M≥2", "reachable": None}
    n, m = int(p.shape[0]), int(p.shape[1])

    # ALL from the FROZEN effective_n (byte-identical to what the engine uses):
    eff_breadth = effective_n.effective_breadth(p)                          # participation ratio of the corr eigenvalues
    tau = effective_n.canonical_tau(p)                                      # conservative per-column τ_int
    floor = effective_n.derive_power_floor(target_ic, eff_breadth, tau, cadence_hours)  # the derived power floor
    floor_need = floor["effectivePeriodsNeeded"]
    actual_eff_n = effective_n.effective_n_serial(n, tau=tau)               # the panel's OWN effective sample
    max_eff_n = float(n)                                                    # perfect-foresight ceiling (effN ≤ N always)
    reach = effective_n.power_status(max_eff_n, floor_need)                 # FROZEN powered check on the ceiling
    reachable = bool(reach["powered"])

    reason = (
        f"the floor is NOT structurally unreachable: N={n} periods ≥ derived floor={floor_need} — a sufficiently "
        f"strong, low-autocorrelation signal COULD clear the bar (necessary, not sufficient)."
        if reachable else
        f"STRUCTURALLY UN-POWERED: even a perfect-foresight signal (max effN = N = {n}) is below the derived floor "
        f"({floor_need}) — NO signal of any strength could clear the bar on this panel's breadth (M_eff={eff_breadth:.2f})."
    )

    out = {
        "label": label,
        "nPeriods": n,
        "nAssets": m,
        "effectiveBreadth": eff_breadth,
        "canonicalTau": tau,
        "targetIC": target_ic,
        "cadenceHours": cadence_hours,
        "powerFloor": floor,
        "floorEffectivePeriodsNeeded": floor_need,
        "actualEffN": actual_eff_n,
        "maxAchievableEffN": max_eff_n,
        "reachable": reachable,
        "reachabilityStatus": reach,
        "reason": reason,
        "hedge": "REPORTED, NOT REFUSED. The power-floor formula is UNAUDITED (Rule XXXVIII); 'reachable' is a "
                 "diagnostic PENDING FLOOR AUDIT, never settled truth. See docs/POWER-FLOOR-DERIVATION.md.",
        "autoRefuse": bool(auto_refuse),
        # the refuse-to-run behavior lives behind THIS flag and STAYS OFF (A-PRE). Even when ON it only *marks*; the
        # gating decision is the operator's, on an audited floor — the pre-flight never silently kills a domain.
        "refused": bool(auto_refuse and not reachable),
    }
    return out


def main():
    req = json.load(sys.stdin)
    out = preflight(
        req["panel"],
        target_ic=float(req.get("targetIC", 0.05)),
        cadence_hours=float(req.get("cadenceHours", 24.0)),
        auto_refuse=bool(req.get("autoRefuse", False)),
        label=str(req.get("label", "")),
    )
    json.dump(rigor.json_safe(out), sys.stdout)


if __name__ == "__main__":
    main()
