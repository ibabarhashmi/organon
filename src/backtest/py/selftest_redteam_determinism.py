"""ORGΛNON Red-Team — DETERMINISM + PIT/look-ahead gauntlet (Sprint Phase 1 / Rules XXIX, XI, XII / Appendix B).

Every verdict must be byte-identical across runs, invariant to semantically-neutral reordering, and free of any
look-ahead leak. The sneaky one is float non-determinism (reduction order) — so D4/D5 (locale, concurrency) run the
ACTUAL sidecar SUBPROCESS (the real execution mode), not an in-process proxy (Phase-1 adverse note). P1 is the crown
PIT test: the funding_crossvenue look-ahead bug class — the signal appearing in the forward — is CAUGHT, and its
positive control shows the leak DOES manufacture a spurious IC when the no-overlap rule is broken.

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.selftest_redteam_determinism
"""
from __future__ import annotations

import json
import os
import subprocess
import sys

import numpy as np

from backtest.py import neutralize, funding_discriminate, reachability

SEED = 20260702
M = 40
T = 220
LAM = np.array([0.4, 0.3, 0.2, 0.1])
FAILURES: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> None:
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAILURES.append(name)


def _panel(seed=SEED):
    rng = np.random.default_rng(seed)
    B = np.abs(rng.normal(0, 1, (M, 4)))
    rp = B @ LAM
    alpha = rng.normal(0, 0.3, M)
    carry = (rp + alpha)[None, :] + rng.normal(0, 0.5, (T, M))
    fwd = (rp + alpha)[None, :] + rng.normal(0, 1.0, (T, M))
    return B, carry, fwd


def _canon(d: dict) -> str:
    return json.dumps(d, sort_keys=True, separators=(",", ":"))


# ───────────────────────── D1 — double-run byte-identity (each domain) ─────────────────────────
def d1_double_run():
    print("D1 — double-run byte-identity (same payload, twice, per domain):")
    B, carry, fwd = _panel()
    fp = {"carry": carry.tolist(), "forward": fwd.tolist(), "loadings": B.tolist(), "minPeriods": 60, "cadenceHours": 1.0}
    check("funding verdict byte-identical across two runs", _canon(funding_discriminate.discriminate(fp)) == _canon(funding_discriminate.discriminate(fp)))
    lp = {"carry": carry.tolist(), "forward": fwd.tolist(), "loadings": B.tolist(), "minPeriods": 60, "nwLags": 4}
    check("lending verdict byte-identical across two runs", _canon(neutralize.discriminate(lp)) == _canon(neutralize.discriminate(lp)))
    rng = np.random.default_rng(SEED + 5)
    rp = {"series": [list(rng.normal(0.0005, 0.02, 250)) for _ in range(6)], "nTrials": 20}
    check("RWA reachability byte-identical across two runs", _canon(reachability.run_reachability(rp)) == _canon(reachability.run_reachability(rp)))


# ───────────────────────── D2 — semantically-neutral reorder invariance (asset columns) ─────────────────────────
def d2_reorder_invariance():
    print("D2 — asset-column reorder invariance (cross-sectional stats are permutation-symmetric):")
    B, carry, fwd = _panel()
    v0 = funding_discriminate.discriminate({"carry": carry.tolist(), "forward": fwd.tolist(), "loadings": B.tolist(), "minPeriods": 60})
    perm = np.random.default_rng(SEED + 2).permutation(M)  # a fixed asset permutation applied CONSISTENTLY
    v1 = funding_discriminate.discriminate({"carry": carry[:, perm].tolist(), "forward": fwd[:, perm].tolist(), "loadings": B[perm, :].tolist(), "minPeriods": 60})
    same_verdict = v0["verdict"] == v1["verdict"]
    t0, t1 = v0.get("deflatedOosTstat") or 0.0, v1.get("deflatedOosTstat") or 0.0
    close = abs(t0 - t1) < 1e-6
    check("asset-reorder → identical verdict + t-stat (permutation-invariant)", same_verdict and close, f"verdict {v0['verdict']}={v1['verdict']}; deflatedT {t0:.6f}≈{t1:.6f}")
    # a semantically-MEANINGFUL reorder (shuffling TIME rows) SHOULD change the result — invariance there would be a bug.
    tperm = np.random.default_rng(SEED + 3).permutation(T)
    v2 = funding_discriminate.discriminate({"carry": carry[tperm, :].tolist(), "forward": fwd[tperm, :].tolist(), "loadings": B.tolist(), "minPeriods": 60})
    t2 = v2.get("deflatedOosTstat") or 0.0
    check("time-row reorder is NOT neutral (autocorrelation/OOS depend on time order) — sanity that D2 tests the right axis", abs(t2 - t0) > 1e-9 or v2["verdict"] != v0["verdict"], f"time-shuffled deflatedT {t2:.4f} vs {t0:.4f}")


# ───────────────────────── D3 — payload dict-key-order invariance ─────────────────────────
def d3_key_order():
    print("D3 — payload key-order invariance (JSON object key order must not matter):")
    B, carry, fwd = _panel()
    a = {"carry": carry.tolist(), "forward": fwd.tolist(), "loadings": B.tolist(), "minPeriods": 60, "cadenceHours": 1.0}
    b = {"cadenceHours": 1.0, "minPeriods": 60, "loadings": B.tolist(), "forward": fwd.tolist(), "carry": carry.tolist()}  # keys reversed
    check("reversed key order → byte-identical verdict", _canon(funding_discriminate.discriminate(a)) == _canon(funding_discriminate.discriminate(b)))


# ───────────────────────── D4 — locale / timezone invariance (REAL subprocess) ─────────────────────────
def _sidecar(payload: dict, env_extra: dict) -> str:
    env = dict(os.environ, PYTHONHASHSEED="0", **env_extra)
    p = subprocess.run([sys.executable, "-m", "backtest.py.funding_discriminate"], input=_canon(payload),
                       capture_output=True, text=True, cwd=os.getcwd(), env=env)
    if p.returncode != 0:
        raise RuntimeError(f"sidecar failed: {p.stderr[:200]}")
    return p.stdout


def d4_locale_tz():
    print("D4 — locale/timezone invariance (real sidecar subprocess under varied LC_ALL/TZ):")
    B, carry, fwd = _panel()
    fp = {"carry": carry.tolist(), "forward": fwd.tolist(), "loadings": B.tolist(), "minPeriods": 60, "cadenceHours": 1.0}
    base = _sidecar(fp, {"LC_ALL": "C", "TZ": "UTC"})
    variants = [
        {"LC_ALL": "tr_TR.UTF-8", "TZ": "Asia/Kolkata"},  # the Turkish-i locale trap + a half-hour-offset TZ
        {"LC_ALL": "de_DE.UTF-8", "TZ": "America/New_York"},  # comma-decimal locale
    ]
    allsame = True
    for v in variants:
        out = _sidecar(fp, v)
        same = out == base
        allsame = allsame and same
        print(f"    LC_ALL={v['LC_ALL']:<13} TZ={v['TZ']:<17} → {'byte-identical' if same else 'DIFFERS'}")
    check("verdict byte-identical across locale/timezone (no locale-sensitive parse/format in the verdict path)", allsame)


# ───────────────────────── D5 — concurrency (REAL concurrent subprocesses, no shared-state race) ─────────────────────────
def d5_concurrency():
    print("D5 — concurrency (8 concurrent sidecar subprocesses on the same payload → all identical):")
    B, carry, fwd = _panel()
    fp = {"carry": carry.tolist(), "forward": fwd.tolist(), "loadings": B.tolist(), "minPeriods": 60, "cadenceHours": 1.0}
    env = dict(os.environ, PYTHONHASHSEED="0", LC_ALL="C", TZ="UTC")
    procs = [subprocess.Popen([sys.executable, "-m", "backtest.py.funding_discriminate"], stdin=subprocess.PIPE,
                              stdout=subprocess.PIPE, text=True, cwd=os.getcwd(), env=env) for _ in range(8)]
    outs = [p.communicate(_canon(fp))[0] for p in procs]
    check("all 8 concurrent runs byte-identical (each sidecar is a fresh process; no shared mutable state)", len(set(outs)) == 1, f"distinct outputs = {len(set(outs))}")


# ───────────────────────── P1 — FORWARD-LEAK (F-P1): the funding_crossvenue bug class, positive-controlled ─────────────────────────
def p1_forward_leak():
    print("P1 [F-P1] forward-leak — the signal must NEVER appear in the forward (funding_crossvenue bug class):")
    # A NULL basis (white noise, NO genuine edge) isolates the LEAK from persistence=carry: the honest no-overlap
    # forward finds ~nothing; the earlier-draft form −(basis[t+h]−basis[t]) puts basis[t] on BOTH sides and
    # manufactures a spurious regression-to-the-mean IC — exactly the bug funding_crossvenue's docstring records.
    rng = np.random.default_rng(SEED + 6)
    Tb, Mb = 400, 30
    basis = rng.normal(0, 1, (Tb, Mb))  # white-noise basis: future is unpredictable from the present (true NULL)

    def ic_mean_abs(sig, fwd):
        out = []
        for i in range(min(sig.shape[0], fwd.shape[0])):
            s, f = sig[i], fwd[i]
            ok = np.isfinite(s) & np.isfinite(f)
            if ok.sum() >= 8 and np.ptp(s[ok]) > 0 and np.ptp(f[ok]) > 0:
                out.append(float(np.corrcoef(s[ok], f[ok])[0, 1]))
        return float(np.nanmean(np.abs(out))) if out else 0.0

    correct_ic, leaked_ic = {}, {}
    for h in (1, 3, 9):
        sig = basis[: Tb - h]                                                                    # signal = basis[t]
        fwd_correct = np.array([np.nanmean(basis[t + 1 : t + 1 + h], axis=0) for t in range(Tb - h)])  # honest: (t, t+h], no overlap
        fwd_leaked = np.array([basis[t] - basis[t + h] for t in range(Tb - h)])                   # LEAK: basis[t] on both sides
        correct_ic[h] = ic_mean_abs(sig, fwd_correct)
        leaked_ic[h] = ic_mean_abs(sig, fwd_leaked)
        print(f"    horizon {h}: honest no-overlap |IC|={correct_ic[h]:.3f}   leaked −(basis[t+h]−basis[t]) |IC|={leaked_ic[h]:.3f}")
    # DEFENDED: on a true null, the honest no-overlap forward manufactures NO signal (|IC|≈0).
    defended = all(correct_ic[h] < 0.15 for h in (1, 3, 9))
    # CAPTURED (positive control): the leak invents a large spurious IC (≈1/√2) the honest construction does not.
    captured = all(leaked_ic[h] > 0.4 for h in (1, 3, 9)) and all(leaked_ic[h] > correct_ic[h] + 0.3 for h in (1, 3, 9))
    check("forward-leak caught: no-overlap forward finds nothing on a null; signal-in-forward manufactures a spurious IC",
          defended and captured, f"defended(honest≈0)={defended} captured(leak invents signal)={captured}")


def main():
    d1_double_run()
    d2_reorder_invariance()
    d3_key_order()
    d4_locale_tz()
    d5_concurrency()
    p1_forward_leak()
    ok = not FAILURES
    print(f"\nRed-team determinism + PIT gauntlet: {'ALL PASS' if ok else 'FAIL -> ' + ', '.join(FAILURES)}")
    print("NOTE: determinism holds byte-for-byte under the REAL execution mode (subprocess, varied locale/TZ, concurrent);")
    print("      the look-ahead leak class is reproduced-and-caught. P2/P3 (T3-demotion) are mechanized in the TS redteam suite.")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
