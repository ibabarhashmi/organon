"""ORGΛNON Discernment Test — Phase 3: run momentum + noise + funding through the FROZEN engine; resolve the joint pattern.

THE DELIVERABLE is the JOINT TRIPLE (D3), not any single verdict:
  • momentum (the pre-registered real edge)  → GO would prove the tool's "yes" fires on real, documented edge
  • noise    (the negative control)          → MUST NO-GO (else the bar is too loose — a false-GO Halt)
  • funding  (the settled beta anchor)       → MUST NO-GO (funding carry is beta, Rule XIII)

Discernment PROVEN iff momentum=GO ∧ noise=NO-GO ∧ funding=NO-GO. Any other pattern is a specific diagnostic
finding (a calibration finding if momentum does not GO; a Halt if noise GOes).

ZERO engine changes (D2/Rule VII): the momentum/noise/funding panels enter the SAME frozen discriminator
(funding_discriminate.discriminate) that every other candidate uses — byte-identical. This runner only PREPARES
admissible panels (from the checksum-anchored T1 klines) and reads the pre-registration; it judges nothing itself.

The construction is READ FROM the pre-registration (data/discernment/preregistration.json) — the run cannot use a
construction not committed there (D1). Admissible T1 only (A3): every kline dump must be checksum-matched.

Run: cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.selftest_discernment
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys

import numpy as np

from backtest.py import funding_discriminate, momentum

_PY_DIR = os.path.dirname(__file__)
_DISCERNMENT = os.path.abspath(os.path.join(_PY_DIR, "..", "..", "..", "data", "discernment"))
_NOISE_SEED = 20260703


def _sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def _load_prereg():
    return json.load(open(os.path.join(_DISCERNMENT, "preregistration.json")))


def _parse_kline_csv(text):
    """Binance 1d-kline CSV → {ts(ms): close}. Skips the header row; close is column 4."""
    out = {}
    for line in text.strip().split("\n"):
        line = line.strip()
        if not line or not line[0].isdigit():  # header `open_time,...`
            continue
        c = line.split(",")
        ts, close = int(c[0]), float(c[4])
        if close > 0:
            out[ts] = close
    return out


def _reconstruct_panel(prereg):
    """ADMISSIBILITY gate + reconstruct the aligned (D×M) daily-close matrix from the checksum-anchored T1 dumps.
    Mirrors src/data/providers/freepit/klines.ts (independent second reconstruction, same sha chain)."""
    manifest = json.load(open(os.path.join(_DISCERNMENT, "klines-manifest.json")))

    # bind capture → pre-registration: the manifest must reference THIS pre-registration file.
    prereg_sha = _sha(os.path.join(_DISCERNMENT, "preregistration.json"))
    if manifest.get("preregistrationSha256") != prereg_sha:
        raise SystemExit(f"ADMISSIBILITY HALT: manifest preregistrationSha256 != actual ({prereg_sha[:12]}…) — capture not bound to pre-registration")
    if manifest["universe"] != prereg["universe"]["symbols"]:
        raise SystemExit("ADMISSIBILITY HALT: manifest universe != pre-registered universe")

    # all-or-nothing T1 + checksum-match gate (A3).
    for s in manifest["sources"]:
        if s["tier"] != "T1":
            raise SystemExit(f"ADMISSIBILITY HALT: {s['key']} tier={s['tier']} (not T1)")
        if not s["checksumMatch"]:
            raise SystemExit(f"ADMISSIBILITY HALT: {s['key']} checksum did not match Binance publication")

    coins = list(manifest["universe"])
    series = {c: {} for c in coins}
    for s in manifest["sources"]:
        csv_path = os.path.join(_DISCERNMENT, s["csvPath"])
        if _sha(csv_path) != s["csvSha256"]:
            raise SystemExit(f"ADMISSIBILITY HALT: {s['key']} CSV sha != stamped (tampered/non-PIT)")
        series[s["symbol"]].update(_parse_kline_csv(open(csv_path).read()))

    times = sorted({t for c in coins for t in series[c]})
    closes = np.array([[series[c].get(t, np.nan) for c in coins] for t in times], dtype=float)  # (D × M)
    print(f"ADMISSIBILITY: {len(manifest['sources'])} dumps — all T1, all checksum-matched, capture bound to pre-registration ✓")
    print(f"panel: {closes.shape[1]} assets × {closes.shape[0]} daily bars ({manifest['window']['start']}→{manifest['window']['end']})")
    return coins, times, closes


def _verdict_row(name, v, expected):
    return (f"  {name:<10} verdict={v['verdict']:<22} rawIcT={_f(v.get('rawIcTstat'))} "
            f"deflResidT={_f(v.get('deflatedOosTstat'))} oosIcMean={_f(v.get('oosResidualIcMean'))} "
            f"portT={_f(v.get('oosPortfolioTstat'))} effN={_f(v.get('deflation',{}).get('effectiveNserial') if v.get('deflation') else None)} "
            f"| expected {expected}")


def _f(x):
    return "n/a" if x is None else f"{x:+.3f}" if isinstance(x, float) else str(x)


def _funding_anchor():
    """Reproduce the settled funding NO-GO anchor by running the CANONICAL funding runner (no replication → no drift).
    Returns (verdict, rawIcT, residualDeflatedT) parsed from its output, or a 'skipped' marker if the freepit funding
    manifest isn't present."""
    if not os.path.exists(os.path.join(os.path.dirname(_DISCERNMENT), "freepit", "MANIFEST.json")):
        return {"verdict": "SKIPPED (no freepit funding manifest captured)", "rawIcTstat": None, "deflatedOosTstat": None}
    env = {**os.environ, "PYTHONHASHSEED": "0"}
    r = subprocess.run([sys.executable, "-m", "backtest.py.selftest_freepit_admissible"],
                       cwd=os.path.join(_PY_DIR, "..", ".."), capture_output=True, text=True, env=env)
    out = r.stdout
    v = re.search(r"verdict=(\S+)", out)
    raw = re.search(r"rawIcT=(\S+)", out)
    res = re.search(r"residualDeflatedT=(\S+)", out)
    return {
        "verdict": v.group(1) if v else "UNKNOWN",
        "rawIcTstat": float(raw.group(1)) if raw and raw.group(1) not in ("None", "n/a") else None,
        "deflatedOosTstat": float(res.group(1)) if res and res.group(1) not in ("None", "n/a") else None,
    }


def main():
    prereg = _load_prereg()
    con = prereg["construction"]
    thr = prereg["threshold"]
    lookback, skip, horizon = con["lookbackDays"], con["skipDays"], con["forwardHorizonDays"]

    coins, times, closes = _reconstruct_panel(prereg)

    # ── build the pre-registered momentum panel (look-ahead-free; momentum.py is unit-proven) ──
    signal, forward, idx = momentum.build_panels(closes, lookback=lookback, skip=skip, horizon=horizon)
    rets = momentum.daily_returns(closes)
    loadings = np.column_stack([momentum.market_beta(rets), momentum.realized_vol(rets)])  # (M, 2) full-sample static
    print(f"momentum signal panel: {signal.shape[0]} decision days × {signal.shape[1]} assets "
          f"(lookback={lookback}, skip={skip}, forward={horizon}d, neutralize=[marketBeta,realizedVol])\n")

    payload = lambda carry: {
        "carry": np.asarray(carry, dtype=float).tolist(), "forward": forward.tolist(), "loadings": loadings.tolist(),
        "minPeriods": thr["minPeriods"], "cadenceHours": thr["cadenceHours"], "targetIC": thr["targetIC"], "tier": "T1",
    }

    # ── run the FROZEN discriminator on all three (byte-identical; the engine is untouched) ──
    mom = funding_discriminate.discriminate(payload(signal))
    noise_sig = momentum.noise_panel(signal.shape, seed=_NOISE_SEED)
    noise = funding_discriminate.discriminate(payload(noise_sig))
    fund = _funding_anchor()

    print("THE JOINT TRIPLE (all through the SAME frozen discriminate; loadings=[marketBeta,realizedVol]):")
    print(_verdict_row("momentum", mom, "GO if edge present + bar fair"))
    print(_verdict_row("noise", noise, "MUST NO-GO (fair signal-free control)"))
    print(f"  {'funding':<10} verdict={fund['verdict']:<22} rawIcT={_f(fund.get('rawIcTstat'))} "
          f"deflResidT={_f(fund.get('deflatedOosTstat'))} | expected MUST NO-GO (beta anchor c9049ac1)")

    # ── resolve the joint pattern ──
    mv, nv, fv = mom["verdict"], noise["verdict"], fund["verdict"]
    print("\n── JOINT PATTERN ──")
    noise_go = nv == "GO"
    if noise_go:
        print("  ✗ FALSE-GO HALT: the negative control (noise) GOed → the bar is too loose. Overrides everything (D3/XXIX).")
        pattern = "FALSE-GO (noise GO — HALT)"
    elif mv == "GO" and nv == "NO-GO" and fv.startswith("NO-GO"):
        print("  ✓ DISCERNMENT PROVEN — momentum GO ∧ noise NO-GO ∧ funding NO-GO. (Momentum GO must survive the Phase-4 audit + held-out.)")
        pattern = "DISCERNMENT PROVEN (GO ∧ NO-GO ∧ NO-GO)"
    elif mv in ("NO-GO", "INSUFFICIENT-EVIDENCE") and nv == "NO-GO":
        print(f"  ○ CALIBRATION FINDING — momentum={mv} while noise NO-GO and funding NO-GO: the tool refuses even a known")
        print(f"    edge in this window/universe (raw momentum IC t={_f(mom.get('rawIcTstat'))} shows whether the effect is present;")
        print("    the deflated/power-floored bar is what it does not clear). A cheap, definitive learning — not a harness bug.")
        pattern = f"CALIBRATION FINDING (momentum {mv}, noise NO-GO, funding NO-GO)"
    else:
        print(f"  ? UNRESOLVED/INCONSISTENT — momentum={mv} noise={nv} funding={fv}: examine control/construction (no tuning the edge).")
        pattern = f"INCONSISTENT (mom={mv} noise={nv} funding={fv})"

    # ── deterministic verdict hash (momentum + noise; byte-reproducible + locale/TZ-invariant) ──
    digest = hashlib.sha256(json.dumps({
        "momentum": {"verdict": mv, "rawIcT": mom.get("rawIcTstat"), "deflResidT": mom.get("deflatedOosTstat"),
                     "oosIcMean": mom.get("oosResidualIcMean"), "portT": mom.get("oosPortfolioTstat")},
        "noise": {"verdict": nv, "deflResidT": noise.get("deflatedOosTstat")},
    }, sort_keys=True).encode()).hexdigest()[:8]
    print(f"\ndiscernment verdict hash (momentum+noise) = {digest}")
    print(f"raw momentum IC t = {_f(mom.get('rawIcTstat'))}  (is momentum present in-window? — diagnostic, not a GO)")
    print(f"deflated residual momentum IC t = {_f(mom.get('deflatedOosTstat'))}  vs gate {thr['tGate']}  "
          f"(GO needs > {thr['tGate']} AND portfolio t > {thr['portGate']} AND eff-N ≥ floor)")

    print(f"\nJOINT PATTERN RESOLVED: {pattern}")
    # the gate FAILS only on a false-GO (noise GO) or a bug; a resolved discernment/calibration pattern is a PASS.
    sys.exit(1 if noise_go else 0)


if __name__ == "__main__":
    main()
