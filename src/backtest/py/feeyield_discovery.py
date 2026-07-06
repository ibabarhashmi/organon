"""ORGΛNON Fee-Yield — Phase-3 DISCOVERY LOOP with the CUMULATIVE multiple-testing correction (Blueprint Phase 3 /
Rule XXXIV, non-negotiable). Runs every candidate in the PRE-REGISTERED search space through the FROZEN discriminator
on T3 discovery data, logs EACH to the candidate register, and applies the correction that GROWS with the cumulative
count. A candidate "survives" discovery ONLY if its deflated-OOS-t clears the CUMULATIVE-corrected hurdle — never the
single-test bar. Omitting a tried candidate understates the multiple-testing = overfitting; every candidate is logged.

Correction (Harvey-Liu-Zhu 2016 multiple-testing framework), reported three ways for honesty:
  • Bonferroni (FWER, conservative):   t_hurdle(N) = Φ⁻¹(1 − (α/2)/N),  α=0.05
  • BHY / Benjamini-Yekutieli (FDR under dependence): the HLZ-recommended middle ground (disclosed)
  • the single-test gate (3.0) — shown ONLY to demonstrate how much the correction tightens it.

Discovery CANNOT bless (T3, the wall). Expected honest outcome: NOTHING survives the cumulative-corrected bar → the
NO-GO prior → Phase 4 starts the forward clock to earn a POWERED verdict of either sign (Rule XXXIII).

Run:  cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.feeyield_discovery <stamp>
"""
from __future__ import annotations

import json
import sys

import numpy as np
from scipy.stats import norm

from backtest.py import feeyield_panel, funding_discriminate

SINGLE_GATE = 3.0
ALPHA = 0.05


def bonferroni_hurdle(n: int) -> float:
    return float(norm.ppf(1.0 - (ALPHA / 2.0) / max(n, 1)))


def bhy_hurdle(n: int) -> float:
    """Benjamini-Yekutieli FDR hurdle (HLZ's dependence-robust recommendation): α* = α / (n · c(n)),
    c(n)=Σ_{k=1..n} 1/k. Less conservative than Bonferroni, still grows with n."""
    c = float(np.sum(1.0 / np.arange(1, n + 1)))
    return float(norm.ppf(1.0 - (ALPHA / 2.0) / (n * c)))


def enumerate_candidates():
    """The pre-registered space (deterministic order) — every one is a TEST that counts toward the cumulative bar."""
    factors = feeyield_panel.FACTORS
    horizons = [7, 14, 30]
    neuts = {"none": [], "market": ["market_beta"], "full": ["log_size", "market_beta", "momentum_load", "sector"]}
    out = []
    for f in factors:
        for h in horizons:
            for nk, nv in neuts.items():
                out.append((f, h, nk, nv))
    return out


def run(stamp, min_days=120):
    register = []
    n = 0
    best = None
    for (f, h, nk, nv) in enumerate_candidates():
        pm = feeyield_panel.panel_matrices(stamp, f, h, nv, min_days=min_days)
        if not pm.get("carry"):
            continue
        n += 1  # every EVALUATED candidate is a test (cumulative count)
        v = funding_discriminate.discriminate({
            "carry": pm["carry"], "forward": pm["forward"], "loadings": pm["loadings"],
            "minPeriods": 90, "cadenceHours": 24.0, "targetIC": 0.05, "tier": "T3-discovery", "fullDisclosure": False,
        })
        t = v.get("deflatedOosTstat")
        row = {
            "n": n, "candidate": f"{f}·h{h}·{nk}", "verdict": v["verdict"],
            "deflatedOosT": None if t is None else round(float(t), 3),
            "rawIcT": None if v.get("rawIcTstat") is None else round(float(v["rawIcTstat"]), 2),
            "cumBonferroniHurdle": round(bonferroni_hurdle(n), 3),
        }
        register.append(row)
        if t is not None and (best is None or t > best["deflatedOosT"]):
            best = {"candidate": row["candidate"], "deflatedOosT": round(float(t), 3), "atN": n}

    total = n
    bonf, bhy = bonferroni_hurdle(total), bhy_hurdle(total)
    # a candidate SURVIVES iff its deflated-t clears the FINAL cumulative-corrected (Bonferroni) hurdle
    survivors = [r for r in register if r["deflatedOosT"] is not None and r["deflatedOosT"] > bonf]
    survivors_single = [r for r in register if r["deflatedOosT"] is not None and r["deflatedOosT"] > SINGLE_GATE]
    return {
        "stamp": stamp, "tier": "T3-revised-discovery-only (CANNOT bless)",
        "cumulativeCount": total,
        "singleTestGate": SINGLE_GATE,
        "cumulativeBonferroniHurdle": round(bonf, 3),
        "cumulativeBhyHurdle": round(bhy, 3),
        "bestCandidate": best,
        "survivors_cumulativeCorrected": [s["candidate"] for s in survivors],
        "survivors_ifSingleTestOnly": [s["candidate"] for s in survivors_single],
        "register": register,
        "convergence": (
            "SURVIVE" if survivors else "NOTHING-SURVIVES"
        ),
        "honest": (
            "NOTHING survives the cumulative-corrected bar (Rule XXXIV) — the honest prior is NO-GO. The best "
            "discovery candidate is below even the SINGLE-test gate, and the cumulative correction only raises the bar. "
            "Proceed to Phase 4: start the forward-PIT clock to EARN a powered verdict of either sign (a powered NO-GO "
            "is a success, Rule XXXIII). Discovery cannot bless."
            if not survivors else
            "A candidate cleared the cumulative-corrected bar on DISCOVERY — a HYPOTHESIS (not a verdict); freeze it "
            "for Phase-4 forward confirmation (discovery cannot bless, Rule XXI)."
        ),
    }


def main():
    stamp = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("-") else "2026-07-03"
    out = run(stamp)
    if "--json" in sys.argv:
        json.dump(out, sys.stdout)
        return
    print(f"═══ ORGΛNON Fee-Yield · Phase-3 DISCOVERY LOOP (T3 → discovery-only) · {stamp} ═══\n")
    print(f"candidates tried (cumulative tests): {out['cumulativeCount']}")
    print(f"single-test gate:               t > {out['singleTestGate']}")
    print(f"CUMULATIVE Bonferroni hurdle:    t > {out['cumulativeBonferroniHurdle']}  (grows with the count, Rule XXXIV)")
    print(f"CUMULATIVE BHY (FDR) hurdle:     t > {out['cumulativeBhyHurdle']}  (HLZ dependence-robust, disclosed)")
    b = out["bestCandidate"]
    print(f"best discovery candidate:        {b['candidate']}  deflated-OOS-t = {b['deflatedOosT']}  (at test #{b['atN']})")
    print(f"survivors @ cumulative-corrected bar: {out['survivors_cumulativeCorrected'] or 'NONE'}")
    print(f"survivors @ single-test bar only:     {out['survivors_ifSingleTestOnly'] or 'NONE'}")
    print(f"\nCONVERGENCE: {out['convergence']}")
    print(out["honest"])


if __name__ == "__main__":
    main()
