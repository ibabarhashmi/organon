"""ORGΛNON — the TWO-FAILURE-MODE classifier (Breadth-Rename sprint, Phase 1; Rule A-MODE).

For nine sprints a refusal was a bare "NO-GO"/"INSUFFICIENT" — ambiguous between "there's a signal, it's not enough"
and "no signal of any strength could pass here." This promotes the floor-removed / perfect-foresight diagnostic (used
AD HOC last sprint) to a STANDARD `failureMode` field, DERIVED from the discriminator's own output + the pre-flight:

  • edge-weak            — real signal present, doesn't survive the bar; FLOOR-REMOVED would STILL NO-GO.
  • structurally-un-powered — no signal could survive here; the panel's breadth/floor can't power ANY signal
                              (the pre-flight's reachable=false: even perfect-foresight below the floor).
  • none                 — GOes (subject to forward confirmation).

It EDITS NOTHING frozen (Rule VII): it reads the frozen discriminator's result fields (`deflatedOosTstat`,
`oosPortfolioTstat`, …) and the pre-flight, and classifies. The floor-removed verdict is RECOVERED from those fields
(the floor only downgrades a GO→INSUFFICIENT, so floor-removed-GO ⟺ the t-stat/portfolio gates pass) — no re-run.
"""
from __future__ import annotations

# the discriminator's own pre-specified gates (neutralize.py) — read, never changed
T_GATE = 3.0
PORT_GATE = 2.5
IC_MIN = 0.02


def _num(x):
    return x if isinstance(x, (int, float)) else 0.0


def floor_removed_go(d: dict) -> bool:
    """Would this verdict be a GO with the POWER FLOOR removed? The floor only downgrades a GO→INSUFFICIENT, so
    floor-removed-GO ⟺ the deflated OOS t-stat + IC mean + portfolio-t gates all pass. Recovered from the fields the
    FROZEN funding_discriminate result actually exposes (`deflatedOosTstat`, `oosResidualIcMean`, `oosPortfolioTstat`)
    — it does NOT surface `oosPortfolioMean`, but a positive `oosPortfolioTstat > PORT_GATE` already implies a
    positive portfolio mean (a significant positive t-stat ⇒ positive mean). No re-run."""
    return (
        _num(d.get("deflatedOosTstat")) > T_GATE
        and _num(d.get("oosResidualIcMean")) > IC_MIN
        and _num(d.get("oosPortfolioTstat")) > PORT_GATE
    )


def classify(discriminate_result: dict, preflight_result: dict | None = None) -> dict:
    """Return the discriminate_result AUGMENTED with `failureMode` + the derivation. `preflight_result` (optional)
    supplies the panel's structural reachability; without it, only the signal-strength (edge-weak) axis is available."""
    d = dict(discriminate_result)
    v = d.get("verdict")

    if v == "GO":
        d["failureMode"] = "none"
        d["failureModeBasis"] = "GOes (subject to forward confirmation)"
        d["contributingCauses"] = []
        return d

    fr_go = floor_removed_go(d)
    signal_weak = not fr_go  # floor-removed still not GO → the SIGNAL itself does not clear the bar
    panel_unpowered = bool(preflight_result is not None and preflight_result.get("reachable") is False)

    causes = []
    if panel_unpowered:
        causes.append("structurally-un-powered")
    if signal_weak:
        causes.append("edge-weak")

    # DOMINANT mode: a structurally-un-powered PANEL dominates (no signal of any strength could pass here), so it is
    # the headline even when the signal is also weak; the edge-weak cause is still reported (both-causes honesty).
    if panel_unpowered:
        mode = "structurally-un-powered"
    elif signal_weak:
        mode = "edge-weak"
    else:
        # verdict not GO, panel reachable, yet floor-removed WOULD GO → the floor downgraded a GO-strength signal on
        # a reachable panel (this specific sample's effN < floor via autocorrelation) → un-powered SAMPLE, not weak edge.
        mode = "structurally-un-powered"
        causes.append("structurally-un-powered (sample effN < floor despite a reachable panel)")

    basis = {
        "structurally-un-powered": "even a perfect-foresight-strength signal is below the power floor on this panel "
                                   "(pre-flight reachable=false) — no signal of any strength could pass here.",
        "edge-weak": "floor-removed the verdict is STILL NO-GO — a real signal is present but does not clear the bar.",
        "none": "GOes.",
    }[mode]

    d["failureMode"] = mode
    d["failureModeBasis"] = basis + (" (BOTH causes present: the signal is also weak.)" if panel_unpowered and signal_weak else "")
    d["contributingCauses"] = causes
    d["floorRemovedWouldGO"] = fr_go
    d["panelUnpowered"] = panel_unpowered
    d["signalWeak"] = signal_weak
    d["failureModeHedge"] = ("'structurally-un-powered' rests on the UNAUDITED power-floor formula (Rule XXXVIII); "
                             "it is a diagnostic pending floor audit, not settled truth.") if mode == "structurally-un-powered" else None
    return d
