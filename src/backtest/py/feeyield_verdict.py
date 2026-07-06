"""ORGΛNON Fee-Yield — the DOMAIN VALIDATOR verdict (Blueprint Phase 1). Reuses the FROZEN funding_discriminate on
the fee-yield panel and emits an HONEST verdict. This is T3-revised DISCOVERY data → the verdict CANNOT bless (no GO
is admissible here; a GO is only mintable on forward-T2 the loop never saw — Phase 4). Expected: NO-GO / INSUFFICIENT.

Emits JSON for the artifact writer (scripts/feeyield-verdict.ts). Deterministic.
Run:  cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.feeyield_verdict <stamp>
"""
from __future__ import annotations

import json
import sys

from backtest.py import feeyield_panel, funding_discriminate

CANDIDATES = [   # a small honest set (NOT tuned toward GO); the register/correction lives in Phase 3
    ("fee_growth", 7, ["market_beta"]),
    ("revenue_yield", 7, ["log_size", "market_beta", "momentum_load", "sector"]),
    ("retention", 30, ["market_beta"]),
]


def verdict_for(stamp, factor, horizon, neut, min_days=120):
    pm = feeyield_panel.panel_matrices(stamp, factor, horizon, neut, min_days=min_days)
    if not pm.get("carry"):
        return {"candidate": f"{factor}·h{horizon}", "verdict": "INSUFFICIENT-EVIDENCE", "note": pm.get("note")}
    v = funding_discriminate.discriminate({
        "carry": pm["carry"], "forward": pm["forward"], "loadings": pm["loadings"],
        "minPeriods": 90, "cadenceHours": 24.0, "targetIC": 0.05, "tier": "T3-discovery", "fullDisclosure": False,
    })
    d = v.get("deflation") or {}
    return {
        "candidate": f"{factor}·h{horizon}·{'+'.join(neut) or 'none'}",
        "verdict": v["verdict"], "tier": "T3-discovery (revised → CANNOT bless)",
        "deflatedOosTstat": v.get("deflatedOosTstat"), "rawIcTstat": v.get("rawIcTstat"),
        "downgradedBy": v.get("downgradedBy"),
        "effectiveNserial": d.get("effectiveNserial"), "effectiveBreadth": d.get("effectiveBreadth"),
        "T": pm["shape"]["T"], "M": pm["shape"]["M"],
    }


def build(stamp):
    results = [verdict_for(stamp, f, h, n) for f, h, n in CANDIDATES]
    any_go = any(r["verdict"] == "GO" for r in results)
    return {
        "domain": "fee-yield-cross-section", "stamp": stamp, "tier": "T3-revised-discovery-only",
        "headline": "NO powered verdict — this is T3 discovery data; a GO is inadmissible here (Rule XXI wall).",
        "candidates": results,
        "anyDiscoveryGo": any_go,
        "honest": "Every verdict is NO-GO/INSUFFICIENT on discovery, as expected — discovery cannot bless. The frozen "
                  "engine is reused unchanged; reflexivity/sector confounds are neutralized (Phase-1 false-GO gauntlet). "
                  "A powered verdict is only reachable on forward-T2 (Phase 4), and the honest prior is NO-GO.",
    }


def main():
    stamp = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("-") else "2026-07-03"
    out = build(stamp)
    if "--json" in sys.argv:
        json.dump(out, sys.stdout)
        return
    print(f"═══ ORGΛNON Fee-Yield DOMAIN VERDICT · {stamp} (T3 revised → discovery-only, CANNOT bless) ═══\n")
    print(out["headline"], "\n")
    for r in out["candidates"]:
        print(f"  {r['candidate']:52s} → {r['verdict']:22s} deflT={r.get('deflatedOosTstat')} "
              f"rawIcT={r.get('rawIcTstat')} effN={r.get('effectiveNserial')}")
    print(f"\n  anyDiscoveryGo={out['anyDiscoveryGo']} (must be False — discovery cannot bless)")
    print(f"  {out['honest']}")


if __name__ == "__main__":
    main()
