"""ORGΛNON Free-PIT Data Plane — Phase 5: ADMISSIBLE historical backtest on free-PIT T1 data (Rule XI, the ADMISSIBILITY gate).

The payoff. A real cross-asset funding cross-section, reconstructed from IMMUTABLE Binance monthly bulk dumps (each byte-
verified against Binance's published SHA256 CHECKSUM → genuine T1, reconstructed-PIT), run through the FROZEN funding
discriminator (reused byte-identical, Rule VII). This is a historical backtest that is genuinely PIT-ADMISSIBLE — not
T3-revised, not discovery-only — the thing the forward clock alone could not provide for quarters.

ADMISSIBILITY (all-or-nothing, Rule A3): EVERY datum in the panel must be T1 + checksum-matched. The independent REST
cross-check (T3, revisable) is NEVER loaded into the panel — only the immutable dumps. A single non-PIT datum would make
the whole run inadmissible.

THE FIREWALL (Rule XXXIII): the expected honest verdict is NO-GO / INSUFFICIENT (a 20-asset, one-month cross-section is
low-breadth; the funding LEVEL is neutralized as beta per Rule XIII; deflation + the power floor bite). A GO here would be
a forward-confirm HYPOTHESIS to freeze-and-date, never an in-sprint powered GO. No tuning toward GO.

Run: cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.selftest_freepit_admissible
"""
from __future__ import annotations

import hashlib
import json
import os
import sys

import numpy as np

from backtest.py import funding_discriminate

_PY_DIR = os.path.dirname(__file__)
_FREEPIT = os.path.abspath(os.path.join(_PY_DIR, "..", "..", "..", "data", "freepit"))

# depeg (collateral robustness of the traded underlying), aligned to src/funding/factors.ts DEPEG (Binance venue = 2).
_DEPEG = {"BTC": 1, "ETH": 1, "SOL": 1.5, "BNB": 1.5, "XRP": 1.5, "DOGE": 2, "LINK": 1.5, "AVAX": 1.5, "LTC": 1.5,
          "ARB": 2, "OP": 2, "APT": 2, "ATOM": 2, "MATIC": 2, "UNI": 1.5, "DOT": 1.5, "TRX": 1.5, "NEAR": 2,
          "FIL": 2, "INJ": 2, "ADA": 1.5}
_DEPEG_UNKNOWN = 2.5
_VENUE_BINANCE = 2


def _sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def _reconstruct(freepit_dir, source):
    """Reconstruct one symbol's PIT annualized-funding series from its immutable dump CSV (integrity re-verified)."""
    csv_path = os.path.join(freepit_dir, source["csvPath"])
    if _sha(csv_path) != source["csvSha256"]:
        raise SystemExit(f"ADMISSIBILITY HALT: {source['symbol']} CSV sha != stamped (tampered/non-PIT)")
    out = {}
    for line in open(csv_path).read().strip().split("\n")[1:]:  # header: calc_time,funding_interval_hours,last_funding_rate
        calc, interval, rate = line.split(",")
        ih = float(interval)
        out[int(calc)] = float(rate) * (24.0 / ih) * 365.0  # annualized, exactly as freepit/funding.ts
    return out


def main():
    manifest = json.load(open(os.path.join(_FREEPIT, "MANIFEST.json")))
    sources = sorted(manifest["sources"], key=lambda s: s["symbol"])

    # ── ADMISSIBILITY GATE (Rule A3, all-or-nothing) ──
    for s in sources:
        if s["tier"] != "T1":
            raise SystemExit(f"ADMISSIBILITY HALT: {s['symbol']} tier={s['tier']} (not T1 — inadmissible)")
        if not s["checksumMatch"]:
            raise SystemExit(f"ADMISSIBILITY HALT: {s['symbol']} checksum did not match Binance publication")
        if s.get("crosscheck", {}).get("tier") == "T1":
            raise SystemExit(f"ADMISSIBILITY HALT: {s['symbol']} REST cross-check mislabeled T1 (T3 laundering)")
    print(f"ADMISSIBILITY: {len(sources)} sources — all T1, all checksum-matched, no T3 in the panel ✓")

    # ── reconstruct + align the cross-asset panel on the common time grid ──
    series = {s["symbol"]: _reconstruct(_FREEPIT, s) for s in sources}
    coins = [s["symbol"] for s in sources]
    common = sorted(set.intersection(*[set(v.keys()) for v in series.values()]))
    A = np.array([[series[c][t] for c in coins] for t in common])  # (T × M) annualized funding
    T, M = A.shape
    print(f"panel: {M} assets × {T} times (8h cadence), aligned on the common grid")

    # carry[t] = funding at t ; forward[t] = REALIZED funding at t+1 (predict funding, never price — funding Appendix F)
    carry = A[:-1]
    forward = A[1:]

    # loadings from IMMUTABLE-DUMP fields only (level/tail/liquidity + venue + depeg). premium (HL-only) is absent from a
    # Binance dump → omitted (disclosed coverage gap; the funding LEVEL is the dominant Rule-XIII beta factor and IS here).
    lvl = A.mean(axis=0)
    neg = (A < 0).mean(axis=0)
    std = A.std(axis=0)
    loadings = np.column_stack([lvl, neg, std, np.full(M, _VENUE_BINANCE),
                                np.array([_DEPEG.get(c.replace("USDT", ""), _DEPEG_UNKNOWN) for c in coins])])

    # ── run the FROZEN discriminator on admissible T1 data (deflation + power floor = the multiple-testing correction) ──
    verdict = funding_discriminate.discriminate({
        "carry": carry.tolist(), "forward": forward.tolist(), "loadings": loadings.tolist(),
        "minPeriods": 40, "cadenceHours": 8.0, "targetIC": 0.05, "tier": "T1",
    })
    v = verdict["verdict"]
    print(f"\nADMISSIBLE HISTORICAL VERDICT (freepit T1, 20-asset funding cross-section, 2024-01):")
    print(f"  verdict={v}  rawIcT={verdict.get('rawIcTstat')}  residualDeflatedT={verdict.get('deflatedOosTstat')}"
          f"  effN={verdict.get('effectivePeriods')}  floor={verdict.get('effectivePeriodsNeeded')}  downgradedBy={verdict.get('downgradedBy')}")

    honest = v in ("NO-GO", "INSUFFICIENT-EVIDENCE")
    if v == "GO":
        # NOT a failure of the harness — but per Rule XXXIII/XXI a historical GO is a HYPOTHESIS to forward-confirm,
        # never an in-sprint powered GO. Surface it loudly for freeze-and-date; do not bless.
        print("\n⚠ HISTORICAL GO — treat as a FORWARD-CONFIRM HYPOTHESIS (freeze + date for the clock), never a powered GO (Rule XXXIII/XXI).")
    print(f"\n{'ADMISSIBLE RUN COMPLETE — verdict honest (' + v + '); every datum genuinely PIT/T1; no T3 laundering' if honest else 'HISTORICAL-GO HYPOTHESIS (forward-confirm only)'}")
    # the gate PASSES on an honest refusal OR an honestly-labeled forward-confirm hypothesis; it FAILS only on a bug.
    sys.exit(0)


if __name__ == "__main__":
    main()
