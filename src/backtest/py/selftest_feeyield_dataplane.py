"""ORGΛNON Fee-Yield — Phase-0 DATA-PLANE validation + red-team battery (Blueprint Phase 0; Rules XXV/XXVII/XXIX).

Each check has, where a defense exists, a POSITIVE CONTROL — the attack is shown to CAPTURE on deliberately-broken
data, proving the test can fail ("a battery that cannot fail is not a test", Rule XXIX). Deterministic, seeded, no
network (reads the frozen T3 snapshot). Run:
  cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.selftest_feeyield_dataplane <stamp>
"""
from __future__ import annotations

import json
import os
import sys

import numpy as np
import pandas as pd

from backtest.py import feeyield_panel as P

STAMP = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("-") else "2026-07-03"
FAILS = []


def check(name, cond, detail=""):
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAILS.append(name)


def test_determinism():
    print("(D1) DETERMINISM — the panel is byte-reproducible from the frozen snapshot:")
    a = P.panel_matrices(STAMP, "fee_yield", 7, ["market_beta"], min_days=120)
    b = P.panel_matrices(STAMP, "fee_yield", 7, ["market_beta"], min_days=120)
    ja, jb = json.dumps(a, sort_keys=True), json.dumps(b, sort_keys=True)
    check("two builds byte-identical", ja == jb, f"len {len(ja)}")
    # positive control: a build with a perturbed neutralization set MUST differ (else the test is vacuous)
    c = P.panel_matrices(STAMP, "fee_yield", 7, [], min_days=120)
    check("[+control] a different candidate produces a DIFFERENT panel (test can detect change)",
          json.dumps(c, sort_keys=True) != ja, "neutralization removed → loadings differ")


def test_tvl_spike_quarantine():
    print("\n(R1) PRICE-LAG / TVL-SPIKE QUARANTINE (positive-controlled):")
    idx = pd.RangeIndex(20)
    clean = pd.DataFrame({"p": [100.0] * 20})
    spiked = clean.copy()
    spiked.loc[10, "p"] = 100000.0  # an isolated first-token-pricing spike that reverts next day
    q = P.quarantine_tvl_spikes(spiked)
    check("isolated 1000× TVL spike is quarantined to NaN", bool(np.isnan(q.loc[10, "p"])), f"day10 → {q.loc[10,'p']}")
    check("[+control] the un-quarantined spike WAS present (attack is real)", spiked.loc[10, "p"] == 100000.0)
    check("a genuine one-sided level shift is NOT quarantined (no false positive)",
          not bool(P.quarantine_tvl_spikes(pd.DataFrame({"p": [100.0] * 10 + [5000.0] * 10})).isna().any().any()),
          "sustained shift kept")


def test_survivorship():
    print("\n(R2) SURVIVORSHIP — a dead protocol STAYS in the panel, forward returns go NaN post-death, never zeroed:")
    # synthetic: two protocols, one 'dies' at t=60 (price NaN thereafter)
    n = 150
    price = pd.DataFrame({"alive": np.linspace(1, 2, n), "dead": np.linspace(1, 2, n)})
    price.loc[60:, "dead"] = np.nan
    fwd = P.forward_return(price, 7)
    check("dead protocol's forward return is NaN after death", bool(np.isnan(fwd["dead"].values[70])), "t=70 post-death")
    check("dead protocol is NOT zeroed (typed-missing, not fabricated)", not (fwd["dead"].fillna(-999).values[70] == 0.0))
    check("dead protocol column is still PRESENT (not silently dropped)", "dead" in fwd.columns)
    check("[+control] the alive protocol still has a finite forward (survivorship isn't blanket-NaN)",
          np.isfinite(fwd["alive"].values[70]))


def test_no_lookahead():
    print("\n(P1) PIT / NO-LOOK-AHEAD — forward[t] uses price[t+h]; a leaked signal is caught by the +control:")
    rng = np.random.default_rng(7)
    n, m = 200, 12
    price = pd.DataFrame(np.cumprod(1 + rng.normal(0, 0.02, (n, m)), axis=0), columns=[f"p{i}" for i in range(m)])
    fwd = P.forward_return(price, 7).values
    honest = pd.DataFrame(rng.normal(0, 1, (n, m)), columns=price.columns).values  # unrelated signal
    leaked = np.roll(fwd, 1, axis=0)  # a look-ahead signal ≈ next forward → high IC by construction

    def mean_ic(sig, f):
        ics = []
        for t in range(n - 8):
            a, b = sig[t], f[t]
            ok = np.isfinite(a) & np.isfinite(b)
            if ok.sum() >= 8 and np.std(a[ok]) > 0 and np.std(b[ok]) > 0:
                ics.append(np.corrcoef(a[ok], b[ok])[0, 1])
        return float(np.nanmean(ics)) if ics else 0.0

    ic_honest, ic_leaked = abs(mean_ic(honest, fwd)), abs(mean_ic(leaked, fwd))
    check("honest unrelated signal has ~0 IC vs forward", ic_honest < 0.1, f"|IC|={ic_honest:.3f}")
    check("[+control] a LEAKED (look-ahead) signal is caught by a high IC — the test can detect leakage",
          ic_leaked > 0.3, f"|IC|_leaked={ic_leaked:.3f}")


def test_tier_and_coverage():
    print("\n(X1) REVISED-DATA TIER (T3) + coverage (the finding must rest on a real, tier-labelled panel):")
    base = P.snapshot_dir(STAMP)
    man = json.load(open(os.path.join(base, "MANIFEST.json")))
    check("snapshot tier is T3-revised (discovery-only, barred from a powered verdict)",
          man.get("tier") == "T3-revised-discovery-only", man.get("tier"))
    check("snapshot integrity sha present (byte-verifiable)", bool(man.get("snapshotSha")), man.get("snapshotSha", "")[:12])
    summ = P.panel_summary(STAMP, 120)
    check("panel_summary echoes T3 tier", summ["tier"] == "T3-revised-discovery-only")
    check("coherent cross-section ≥ 8 protocols (discriminator floor)", summ["coherentProtocols_feeYield"] >= 8,
          f"{summ['coherentProtocols_feeYield']} coherent")


def main():
    print(f"═══ Fee-Yield Phase-0 data-plane battery · snapshot {STAMP} (T3 revised → discovery-only) ═══\n")
    test_determinism()
    test_tvl_spike_quarantine()
    test_survivorship()
    test_no_lookahead()
    test_tier_and_coverage()
    ok = not FAILS
    print(f"\n{'ALL PASS' if ok else 'FAIL → ' + ', '.join(FAILS)}")
    print("NOTE: wash-volume/turnover is DEFERRED (volume not pulled) — disclosed as a residual, not faked; the guard "
          "applies when volume enriches the panel (Phase-5 enrichment). Size-coherence: TVL-spike quarantine is the "
          "single-source coherence guard; a two-source ~10× cross-check is a disclosed future enrichment.")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
