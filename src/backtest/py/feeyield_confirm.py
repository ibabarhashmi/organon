"""ORGΛNON Fee-Yield — Phase-4 CONFIRMATION HARNESS (Blueprint Phase 4 — the ONLY bless path).

Evaluates a FROZEN, DATED discovery hypothesis on FORWARD-T2 data the loop never saw — data captured STRICTLY AFTER
the hypothesis's freezeDate (the discovery↔forward wall; no leak). Runs the FROZEN funding_discriminate on the
forward-only panel. While the forward clock is too short (effN < floor) the honest outcome is INSUFFICIENT-EVIDENCE —
NEVER a premature GO (the NO-PREMATURE-VERDICT gate). Confirmation is the SOLE path a GO can appear (Rule XXI).

Forward captures live under data/feeyield/forward/<capture-stamp>/ (immutable, stamped-at-capture by
scripts/feeyield-forward-capture.ts). This harness is DRY-RUN-tested in-sprint on the ~0-day window → INSUFFICIENT
(proves it RUNS, not that it blesses). The powered verdict is the downstream milestone (quarters).

Run:  cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.feeyield_confirm [--hypothesis FY-H1]
"""
from __future__ import annotations

import glob
import json
import os
import sys

import numpy as np

from backtest.py import feeyield_panel, funding_discriminate

MIN_PERIODS = 90
CADENCE = 24.0
TARGET_IC = 0.05


def _root():
    return feeyield_panel._repo_root()


def load_frozen():
    return json.load(open(os.path.join(_root(), "data", "feeyield", "frozen-hypotheses.json")))


def forward_captures(freeze_date: str):
    """Immutable forward captures under data/feeyield/forward/<stamp>/, sorted; ONLY those captured AFTER the freeze
    date are admissible (the wall — a capture at/before freeze could contain data the loop saw)."""
    base = os.path.join(_root(), "data", "feeyield", "forward")
    if not os.path.isdir(base):
        return []
    caps = []
    for d in sorted(glob.glob(os.path.join(base, "*"))):
        man = os.path.join(d, "MANIFEST.json")
        if not os.path.isfile(man):
            continue
        m = json.load(open(man))
        caps.append({"stamp": m.get("captureStamp"), "dir": d, "afterFreeze": str(m.get("captureStamp", "")) > freeze_date,
                     "tier": m.get("tier"), "nPrices": m.get("nPrices", 0)})
    return caps


def gap_audit(caps):
    """Cadence gap audit over the admissible forward captures. Reports the count and any date gap > 3 days."""
    stamps = sorted([c["stamp"] for c in caps if c["afterFreeze"]])
    gaps = []
    for a, b in zip(stamps, stamps[1:]):
        da = (np.datetime64(b) - np.datetime64(a)) / np.timedelta64(1, "D")
        if da > 3:
            gaps.append({"from": a, "to": b, "days": float(da)})
    return {"admissibleCaptures": len(stamps), "firstForward": stamps[0] if stamps else None,
            "lastForward": stamps[-1] if stamps else None, "gapsOver3d": gaps}


def confirm(hypothesis_id: str = "FY-H1"):
    frozen = load_frozen()
    hyp = next((h for h in frozen["hypotheses"] if h["id"] == hypothesis_id), None)
    if hyp is None:
        return {"error": f"no frozen hypothesis {hypothesis_id}"}
    freeze = frozen["freezeDate"]
    caps = forward_captures(freeze)
    audit = gap_audit(caps)
    admissible = audit["admissibleCaptures"]

    spec = hyp["spec"]
    # forward periods usable for confirmation = admissible captures beyond the holding horizon
    horizon_days = int(spec["horizon"])
    forward_periods = max(admissible - horizon_days, 0)

    # THE NO-PREMATURE-VERDICT GATE: too-short clock ⇒ INSUFFICIENT (never a GO). The powered verdict is downstream.
    if forward_periods < MIN_PERIODS:
        return {
            "hypothesis": hypothesis_id, "spec": spec, "freezeDate": freeze,
            "verdict": "INSUFFICIENT-EVIDENCE",
            "reason": f"forward clock too short: {forward_periods} usable forward periods < {MIN_PERIODS} floor "
                      f"(admissible forward captures {admissible}, horizon {horizon_days}d) — no premature verdict",
            "forwardCaptures": admissible, "gapAudit": audit,
            "wall": "confirmation uses ONLY forward-T2 captured AFTER freezeDate; discovery cannot bless (Rule XXI)",
            "powered": False,
            "note": "The harness RAN and correctly refused to bless (dry-run). A powered verdict (GO or the first "
                    "powered NO-GO) is the downstream milestone once the forward clock clears the floor (quarters).",
        }

    # (accrual path — exercised once the clock matures; identical frozen engine on the forward-only panel)
    # Build the forward panel from the captures (factor + forward return), run funding_discriminate, map to a
    # ConfirmedVerdict. Kept minimal here; the dry-run above is the in-sprint deliverable.
    return {"hypothesis": hypothesis_id, "verdict": "PENDING-ACCRUAL", "forwardPeriods": forward_periods,
            "note": "forward clock has matured; wire the forward-panel build + frozen discriminator here (post-sprint)."}


def main():
    hid = "FY-H1"
    if "--hypothesis" in sys.argv:
        hid = sys.argv[sys.argv.index("--hypothesis") + 1]
    out = confirm(hid)
    if "--json" in sys.argv:
        json.dump(out, sys.stdout)
        return
    print(f"═══ ORGΛNON Fee-Yield · Phase-4 CONFIRMATION HARNESS (dry-run) · hypothesis {hid} ═══\n")
    print(f"frozen hypothesis: {out.get('spec')}  (freeze {out.get('freezeDate')})")
    print(f"forward-T2 captures admissible (after freeze): {out.get('forwardCaptures')}")
    ga = out.get("gapAudit") or {}
    print(f"gap audit: {ga.get('admissibleCaptures')} captures · gaps>3d: {ga.get('gapsOver3d')}")
    print(f"\nVERDICT: {out['verdict']}")
    print(f"  {out.get('reason','')}")
    print(f"  powered={out.get('powered')} · {out.get('wall','')}")
    print(f"  {out.get('note','')}")


if __name__ == "__main__":
    main()
