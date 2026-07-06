"""ORGΛNON Phase 0.1 — BAR-CALIBRATION: does the FROZEN validator bless a REAL, realistic-strength edge?

The make-or-break (Rule XXXVIII). The discernment sprint proved the bar emits GO on SYNTHETIC perfect-foresight and
refuses noise + beta, but its ONE real-edge test used the WRONG horizon (1-day = reversal) at effN≈24, and the
acceptance-under-scrutiny (held-out) path was never exercised. Until the bar is shown to bless a REAL, realistic-
strength edge, an AI-generated NO-GO is uninterpretable (ambiguous between "no edge" and "bar too tight").

This runner reconstructs the checksum-anchored T1 panel, builds the PRE-REGISTERED weekly-horizon momentum
(construction READ FROM data/organon/bar_calibration_prereg.json — D1), and runs it through the SAME frozen
funding_discriminate.discriminate every other candidate uses (Rule VII, byte-identical). It judges nothing itself.

Deliverable — the joint result + a rigorous DIAGNOSIS:
  • momentum (real edge, DISCOVERY)  → GO at realistic strength would PROVE the bar  (then must survive HELD-OUT)
  • perfect-foresight (pos. control)  → does the yes-path fire on THIS panel at all?  (GO ⇒ panel can power a GO)
  • noise           (neg. control)    → MUST NO-GO
  • DIAGNOSTIC floor-removed          → if momentum GOes only with the power floor patched out, the FLOOR is the
                                        binding constraint ⇒ "bar too tight on power" (defense-removed, in-memory,
                                        frozen bytes untouched — the established selftest_forced_go pattern)
  • DIAGNOSTIC daily-step             → effN is ~sampling-invariant; disclosed sensitivity, NOT the headline

GATE (BAR-PROVEN): momentum GOes at realistic strength AND survives held-out → proceed to generation. Else diagnose
(edge genuinely absent vs. bar too tight) and STOP the sprint — a decisive finding (generation would be premature).

Run: cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.selftest_bar_calibration
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
from datetime import datetime, timezone

import numpy as np

from backtest.py import effective_n, funding_discriminate, momentum

_PY_DIR = os.path.dirname(__file__)
_ORGANON = os.path.abspath(os.path.join(_PY_DIR, "..", "..", "..", "data", "organon"))
_NOISE_SEED = 20260703
_PF_SEED = 20260704
# PREREG_FILE / MANIFEST_FILE let the SAME runner serve the headline (20-perp) and the REGRESS (broad) universe.
_PREREG_FILE = os.environ.get("PREREG_FILE", "bar_calibration_prereg.json")
_MANIFEST_FILE = os.environ.get("MANIFEST_FILE", "klines-manifest.json")


def _sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def _load_prereg():
    return json.load(open(os.path.join(_ORGANON, _PREREG_FILE)))


def _parse_kline_csv(text):
    """Binance 1d-kline CSV → {ts(ms): close}. Skips the header; close is column 4."""
    out = {}
    for line in text.strip().split("\n"):
        line = line.strip()
        if not line or not line[0].isdigit():
            continue
        c = line.split(",")
        ts, close = int(c[0]), float(c[4])
        if close > 0:
            out[ts] = close
    return out


def _reconstruct_panel(prereg):
    """ADMISSIBILITY gate + reconstruct the aligned (D×M) daily-close matrix from the checksum-anchored T1 dumps
    (independent second reconstruction — mirrors src/data/providers/freepit/klines.ts, same sha chain)."""
    manifest = json.load(open(os.path.join(_ORGANON, _MANIFEST_FILE)))
    prereg_sha = _sha(os.path.join(_ORGANON, _PREREG_FILE))
    if manifest.get("preregistrationSha256") != prereg_sha:
        raise SystemExit(f"ADMISSIBILITY HALT: manifest preregistrationSha256 != actual ({prereg_sha[:12]}…) — capture not bound to pre-registration")
    if manifest["universe"] != prereg["universe"]["symbols"]:
        raise SystemExit("ADMISSIBILITY HALT: manifest universe != pre-registered universe")
    for s in manifest["sources"]:
        if s["tier"] != "T1":
            raise SystemExit(f"ADMISSIBILITY HALT: {s['key']} tier={s['tier']} (not T1)")
        if not s["checksumMatch"]:
            raise SystemExit(f"ADMISSIBILITY HALT: {s['key']} checksum did not match Binance publication")

    coins = list(manifest["universe"])
    series = {c: {} for c in coins}
    for s in manifest["sources"]:
        csv_path = os.path.join(_ORGANON, s["csvPath"])
        if _sha(csv_path) != s["csvSha256"]:
            raise SystemExit(f"ADMISSIBILITY HALT: {s['key']} CSV sha != stamped (tampered/non-PIT)")
        series[s["symbol"]].update(_parse_kline_csv(open(csv_path).read()))

    times = sorted({t for c in coins for t in series[c]})
    closes = np.array([[series[c].get(t, np.nan) for c in coins] for t in times], dtype=float)  # (D × M)
    print(f"ADMISSIBILITY: {len(manifest['sources'])} dumps — all T1, all checksum-matched, capture bound to pre-registration ✓")
    print(f"panel: {closes.shape[1]} assets × {closes.shape[0]} daily bars ({manifest['window']['start']}→{manifest['window']['end']})")
    return coins, np.array(times, dtype=np.int64), closes


def _f(x):
    return "n/a" if x is None else (f"{x:+.3f}" if isinstance(x, float) else str(x))


def _payload(carry, forward, loadings, thr):
    return {"carry": np.asarray(carry, dtype=float).tolist(), "forward": np.asarray(forward, dtype=float).tolist(),
            "loadings": np.asarray(loadings, dtype=float).tolist(), "minPeriods": thr["minPeriods"],
            "cadenceHours": thr["cadenceHours"], "targetIC": thr["targetIC"], "tier": "T1"}


def _report_row(name, v, expected):
    d = v.get("deflation") or {}
    pf = d.get("powerFloor") or {}
    return (f"  {name:<20} verdict={v['verdict']:<22} rawIcT={_f(v.get('rawIcTstat'))} "
            f"deflResidT={_f(v.get('deflatedOosTstat'))} portT={_f(v.get('oosPortfolioTstat'))} "
            f"effN={_f(d.get('effectiveNserial'))} floor={pf.get('effectivePeriodsNeeded','n/a')} "
            f"effBreadth={_f(pf.get('effectiveBreadth'))} down={v.get('downgradedBy')} | expect {expected}")


def _subsample(sig, fwd, idx, stride, phase):
    sel = list(range(phase, sig.shape[0], stride))
    return sig[sel], fwd[sel], idx[sel]


def _split_by_date(sig, fwd, idx, times, boundary_ms):
    disc = [i for i in range(len(idx)) if times[int(idx[i])] < boundary_ms]
    held = [i for i in range(len(idx)) if times[int(idx[i])] >= boundary_ms]
    return (sig[disc], fwd[disc], idx[disc]), (sig[held], fwd[held], idx[held])


def main():
    prereg = _load_prereg()
    con, thr = prereg["construction"], prereg["threshold"]
    lookback, skip, horizon = con["lookbackDays"], con["skipDays"], con["forwardHorizonDays"]
    stride, phase = con["samplingStrideDays"], con["samplingPhase"]
    boundary = int(datetime(2025, 1, 1, tzinfo=timezone.utc).timestamp() * 1000)  # discovery < 2025-01-01 <= held-out

    coins, times, closes = _reconstruct_panel(prereg)

    # ── build the pre-registered weekly-horizon momentum on the FULL grid (look-ahead-free; momentum.py is unit-proven) ──
    sig_d, fwd_d, idx_d = momentum.build_panels(closes, lookback=lookback, skip=skip, horizon=horizon)
    rets = momentum.daily_returns(closes)
    loadings = np.column_stack([momentum.market_beta(rets), momentum.realized_vol(rets)])  # (M,2) full-sample static
    # HEADLINE construction: WEEKLY non-overlapping sub-sample (stride 7, phase 0) — as committed.
    sig_w, fwd_w, idx_w = _subsample(sig_d, fwd_d, idx_d, stride, phase)
    print(f"momentum: lookback={lookback}d skip={skip}d forward={horizon}d | full daily decision-rows={sig_d.shape[0]} "
          f"→ WEEKLY sub-sample (stride {stride}, phase {phase}) = {sig_w.shape[0]} rows × {sig_w.shape[1]} assets\n")

    (sw_disc_s, sw_disc_f, sw_disc_i), (sw_held_s, sw_held_f, sw_held_i) = _split_by_date(sig_w, fwd_w, idx_w, times, boundary)
    print(f"split: discovery weekly-rows={sw_disc_s.shape[0]} (<2025-01) · held-out weekly-rows={sw_held_s.shape[0]} (>=2025-01)\n")

    disc = lambda p: funding_discriminate.discriminate({**p, "fullDisclosure": True})

    # ══ HEADLINE — real weekly momentum, DISCOVERY, intact frozen bar ══
    mom = disc(_payload(sw_disc_s, sw_disc_f, loadings, thr))

    # ══ CONTROLS on the same discovery panel shape (same engine) ══
    noise = disc(_payload(momentum.noise_panel(sw_disc_s.shape, seed=_NOISE_SEED), sw_disc_f, loadings, thr))
    # perfect-foresight: the forward return itself + modest noise (non-degenerate; IC high but < 1). Does the yes-path
    # fire on THIS panel at all? A GO ⇒ the panel can power a GO; INSUFFICIENT ⇒ the panel is too small/correlated.
    pf_rng = np.random.default_rng(_PF_SEED)
    pf_sig = np.where(np.isfinite(sw_disc_f), sw_disc_f + pf_rng.normal(0, 1e-3, size=sw_disc_f.shape), np.nan)
    pf = disc(_payload(pf_sig, sw_disc_f, loadings, thr))

    print("THE JOINT RESULT (all through the SAME frozen discriminate; loadings=[marketBeta,realizedVol], cadence weekly):")
    print(_report_row("momentum(discovery)", mom, "GO if edge present + bar fair"))
    print(_report_row("perfect-foresight", pf, "GO (yes-path fires on panel)"))
    print(_report_row("noise", noise, "MUST NO-GO"))

    # ══ DIAGNOSTIC 1 — floor-removed on momentum (in-memory patch; frozen bytes untouched). If a GO appears ONLY with
    #    the power floor patched out, the FLOOR is the binding constraint ⇒ "bar too tight on power". ══
    orig_floor = effective_n.derive_power_floor
    effective_n.derive_power_floor = lambda *a, **k: {**orig_floor(*a, **k), "effectivePeriodsNeeded": 0}
    try:
        mom_nofloor = disc(_payload(sw_disc_s, sw_disc_f, loadings, thr))
        pf_nofloor = disc(_payload(pf_sig, sw_disc_f, loadings, thr))
    finally:
        effective_n.derive_power_floor = orig_floor  # restore — the patch is diagnostic-only

    # ══ DIAGNOSTIC 2 — daily-step sensitivity (no sub-sample), discovery only. effN ~sampling-invariant. ══
    (sd_disc_s, sd_disc_f, sd_disc_i), _ = _split_by_date(sig_d, fwd_d, idx_d, times, boundary)
    mom_daily = disc(_payload(sd_disc_s, sd_disc_f, loadings, thr))

    print("\n── DIAGNOSTICS (defense-removed + sampling sensitivity; NOT the headline verdict) ──")
    print(_report_row("momentum FLOOR-REMOVED", mom_nofloor, "GO ⇒ floor is binding"))
    print(_report_row("perfect-fst FLOOR-REMOVED", pf_nofloor, "GO ⇒ yes-path exists"))
    print(_report_row("momentum daily-step", mom_daily, f"effN vs weekly ({sd_disc_s.shape[0]} daily rows)"))

    # ══ HELD-OUT — only meaningful if discovery GOes (acceptance-under-scrutiny). Always reported for completeness. ══
    held = disc(_payload(sw_held_s, sw_held_f, loadings, thr)) if sw_held_s.shape[0] >= 5 else {"verdict": "n/a (too few held-out rows)"}
    print("\n── HELD-OUT FORWARD (2025 — the window the construction never saw) ──")
    print(_report_row("momentum(held-out)", held, "confirm iff discovery GOed"))

    # ── DIAGNOSIS ──
    mv = mom["verdict"]
    raw_t = mom.get("rawIcTstat")
    defl_t = mom.get("deflatedOosTstat")
    effn = (mom.get("deflation") or {}).get("effectiveNserial")
    floor = ((mom.get("deflation") or {}).get("powerFloor") or {}).get("effectivePeriodsNeeded")
    print("\n── JOINT PATTERN / DIAGNOSIS ──")
    noise_go = noise["verdict"] == "GO"
    bar_proven = (mv == "GO") and (held.get("verdict") == "GO")
    if noise_go:
        pattern = "FALSE-GO (noise GO — HALT)"
        print("  ✗ FALSE-GO HALT: the negative control (noise) GOed → the bar is too loose. Overrides everything.")
    elif bar_proven:
        pattern = "BAR PROVEN (weekly momentum GO at realistic strength + held-out confirmed)"
        print("  ✓ BAR PROVEN — weekly momentum GOes at realistic strength AND survives held-out → generation interpretable.")
    else:
        # not proven — diagnose WHY (edge-absent vs bar-too-tight), using raw IC + effN + the floor-removed diagnostic.
        floor_binds = (mv != "GO") and (mom_nofloor["verdict"] == "GO")
        real_raw_signal = (raw_t is not None) and (abs(raw_t) >= 3.0)
        if floor_binds or (real_raw_signal and (effn is not None and floor is not None and effn < floor)):
            pattern = "BAR TOO TIGHT (real signal present; power floor / deflation refuses realistic strength) → STOP SPRINT"
            print(f"  ○ BAR TOO TIGHT — momentum={mv}; raw IC t={_f(raw_t)} (real signal), but effN={_f(effn)} < floor={floor}")
            print(f"    floor-removed → {mom_nofloor['verdict']} (the power floor is the binding constraint). The bar will not")
            print("    bless a realistic-strength edge in this universe/window → AI generation is premature → STOP THE SPRINT.")
        else:
            pattern = "EDGE ABSENT at the documented weekly horizon (raw IC ~ 0) → distinct finding"
            print(f"  ○ EDGE ABSENT — momentum={mv}; raw IC t={_f(raw_t)} ~ 0 (no real signal being deflated away).")
            print("    A finding about crypto weekly momentum in this universe/window, not primarily a bar verdict.")

    # ── deterministic verdict hash (byte-reproducible; locale/TZ-invariant) ──
    digest = hashlib.sha256(json.dumps({
        "momentum": {"verdict": mv, "rawIcT": raw_t, "deflResidT": defl_t, "effN": effn, "floor": floor,
                     "portT": mom.get("oosPortfolioTstat")},
        "perfectForesight": {"verdict": pf["verdict"]},
        "noise": {"verdict": noise["verdict"]},
        "heldOut": {"verdict": held.get("verdict")},
    }, sort_keys=True).encode()).hexdigest()[:12]

    print(f"\nbar-calibration verdict hash = {digest}")
    print(f"PASS-CONDITION (BAR-PROVEN): {'YES' if bar_proven else 'NO'}")
    print(f"JOINT PATTERN RESOLVED: {pattern}")
    # the gate FAILS the process only on a false-GO (noise GO) or a bug; a resolved diagnosis is a clean run.
    sys.exit(1 if noise_go else 0)


if __name__ == "__main__":
    main()
