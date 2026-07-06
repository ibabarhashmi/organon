"""ORGΛNON Fee-Yield — the loop's VALIDATE shell (Blueprint Phase 2). stdin {stamp, factor, horizon,
neutralizations, minPeriods?, tier?} → builds the panel for that candidate and runs the FROZEN funding_discriminate,
emitting the RawVerdict the TS loop maps through the type wall (toDiscoveryVerdict → no GO on discovery). Deterministic.
"""
from __future__ import annotations

import json
import sys

from backtest.py import feeyield_panel, funding_discriminate


def main():
    p = json.load(sys.stdin)
    pm = feeyield_panel.panel_matrices(p["stamp"], p["factor"], int(p.get("horizon", 7)),
                                       p.get("neutralizations", []), min_days=p.get("minDays", 120))
    if not pm.get("carry"):
        json.dump({"verdict": "INSUFFICIENT-EVIDENCE", "tier": p.get("tier", "T3-discovery"),
                   "downgradedBy": None, "deflatedOosTstat": None, "rawIcTstat": None, "nwLags": 0,
                   "note": pm.get("note", "empty panel")}, sys.stdout)
        return
    v = funding_discriminate.discriminate({
        "carry": pm["carry"], "forward": pm["forward"], "loadings": pm["loadings"],
        "minPeriods": p.get("minPeriods", 90), "cadenceHours": 24.0, "targetIC": 0.05,
        "tier": p.get("tier", "T3-discovery"), "fullDisclosure": False,
    })
    v["_shape"] = pm["shape"]
    json.dump(v, sys.stdout)


if __name__ == "__main__":
    main()
