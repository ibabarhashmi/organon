"""ORGΛNON Fee-Yield — Phase-1 FALSE-GO gauntlet on THIS domain, POSITIVE-CONTROLLED (Blueprint Phase 1 / Rule XXIX).

The validator is the FROZEN funding_discriminate (reused, byte-identical — Rule VII). This battery proves its false-GO
defenses hold on the FEE-YIELD panel shape (M≈122 protocols, DAILY cadence) AND that the two domain-specific confounds
the blueprint names — REFLEXIVITY (fundamentals endogenous to price) and SECTOR-MOMENTUM — are neutralized. Each defense
is positive-controlled: real gate → DEFENDED (NO-GO/INSUFFICIENT); the SPECIFIC named defense removed in-memory → the
false GO APPEARS (CAPTURED). The frozen .py bytes are never touched (monkeypatch restored in `finally`).

Run:  cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.selftest_feeyield_falsego
"""
from __future__ import annotations

import contextlib
import sys

import numpy as np

from backtest.py import effective_n, neutralize, funding_discriminate

SEED = 20260703
M = 122                      # the real coherent fee-yield cross-section size
CADENCE = 24.0               # DAILY (the fee-yield domain)
T_GATE = 3.0
_ORIG_FLOOR = effective_n.derive_power_floor
_ORIG_NEUTRALIZE = neutralize.neutralize
_ORIG_DECORR = effective_n.decorrelation_time
FAILURES: list[str] = []


def record(name, defended, captured, detail=""):
    ok = defended and captured
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}: real→DEFENDED={defended}  broken→CAPTURED={captured}  {detail}")
    if not ok:
        FAILURES.append(name + ("" if defended else " (real gate did NOT defend!)") + ("" if captured else " (+control could NOT capture — test cannot fail!)"))


@contextlib.contextmanager
def patched(module, name, replacement):
    orig = getattr(module, name)
    setattr(module, name, replacement)
    try:
        yield
    finally:
        setattr(module, name, orig)


def verdict(carry, forward, loadings, minp=90):
    return funding_discriminate.discriminate({"carry": carry.tolist(), "forward": forward.tolist(),
                                              "loadings": loadings.tolist(), "minPeriods": minp,
                                              "cadenceHours": CADENCE, "targetIC": 0.05, "tier": "T3"})


# sector structure: K sector dummies + a size + market-beta column (the fee-yield risk loadings)
def _loadings(rng):
    sectors = rng.integers(0, 5, size=M)
    dummies = np.eye(5)[sectors]                       # 5 sector one-hots
    size = rng.normal(0, 1, size=(M, 1))
    return np.column_stack([size, dummies]), sectors


# ───────────────────────── A1 — POWER FLOOR (daily fee-yield shape) ─────────────────────────
def a1_power_floor():
    print("A1 power floor — a residual fee-growth edge on an AUTOCORRELATED daily panel (deflated-t clears, effN ≪ floor):")
    rng = np.random.default_rng(SEED)
    L, _ = _loadings(rng)
    r2 = np.random.default_rng(SEED + 11)
    T, rho = 220, 0.9
    alpha = r2.normal(0.0, 0.6, size=M)
    carry = np.empty((T, M)); fwd = np.empty((T, M)); ec = np.zeros(M)
    for t in range(T):
        ec = rho * ec + r2.normal(0.0, 0.4, size=M)
        carry[t] = alpha + ec
        fwd[t] = alpha + r2.normal(0.0, 1.0, size=M)
    real = verdict(carry, fwd, L, minp=40)
    defended = real["verdict"] == "INSUFFICIENT-EVIDENCE" and real.get("downgradedBy") is not None

    def broken_floor(*a, **k):
        d = dict(_ORIG_FLOOR(*a, **k)); d["effectivePeriodsNeeded"] = 0; return d
    with patched(effective_n, "derive_power_floor", broken_floor):
        broken = verdict(carry, fwd, L, minp=40)
    record("A1 power-floor", defended, broken["verdict"] == "GO",
           f"real={real['verdict']}({real.get('downgradedBy')}) broken={broken['verdict']} deflT={real.get('deflatedOosTstat'):.1f}")


# ───────────────────────── A1' — NW DEFLATION ─────────────────────────
def a1p_nw_deflation():
    print("\nA1' NW deflation — an AUTOCORRELATED daily fee-yield IC series (the frozen deflation the discriminator applies):")
    # A persistent (AR(1)) fee-yield-IC series with a small positive mean: iid t counts every persistent day as
    # independent → crosses the gate (false GO); the NW deflation at the MEASURED decorrelation time refuses it.
    r2 = np.random.default_rng(SEED + 21)
    n, rho, mu, noise = 500, 0.9, 0.08, 0.2
    e = np.empty(n); cur = 0.0
    for t in range(n):
        cur = rho * cur + r2.normal(0.0, 1.0) * noise
        e[t] = cur
    ic = mu + (e - e.mean())                               # realized mean is exactly μ → isolates the t-STAT effect
    tau = effective_n.decorrelation_time(ic)               # MEASURED from the series (the discriminator's nwLags)
    iid_t = effective_n.iid_tstat(ic)                      # the naive (undeflated) path
    nw_t = effective_n.nw_tstat(ic, tau)                   # the deflated path the frozen engine uses
    defended = abs(nw_t) < T_GATE                          # deflated → refuses
    captured = abs(iid_t) > T_GATE                         # +control: the iid path WOULD bless (the trap is real)
    record("A1' NW-deflation", defended, captured,
           f"iid-t={iid_t:.2f} (>gate) → NW-t={nw_t:.2f} (<gate)  measured decorr τ={tau}  deflation {abs(iid_t)/max(abs(nw_t),1e-9):.1f}×")


# ───────────────────────── A3 / REFLEXIVITY — a factor that is pure market/sector beta ─────────────────────────
def a3_reflexivity_beta():
    print("\nA3/REFLEXIVITY — a 'fundamentals' factor that is actually reflexive price-beta + sector-momentum (raw IC huge, residual ~0):")
    rng = np.random.default_rng(SEED + 3)
    L, sectors = _loadings(rng)
    r2 = np.random.default_rng(SEED + 31)
    T = 400
    beta = L[:, 0] * 1.5 + np.eye(5)[sectors] @ np.array([2, -1, 1, -2, 0.5])  # exposure = size + sector (in loadings)
    carry = np.empty((T, M)); fwd = np.empty((T, M))
    for t in range(T):
        common = r2.normal(0.0, 1.0)                      # a market/sector move each day
        # factor = reflexive beta exposure + MODERATE idiosyncratic diversity (so M_eff is not ≈1 — isolate neutralization)
        carry[t] = beta * common + r2.normal(0.0, 0.8, size=M)
        fwd[t] = beta * common + r2.normal(0.0, 1.0, size=M)      # forward return driven by the SAME beta → raw IC huge
    real = verdict(carry, fwd, L, minp=60)
    defended = real["verdict"] in ("NO-GO", "INSUFFICIENT-EVIDENCE")  # neutralization strips beta → residual non-predictive

    # +control: remove neutralization AND the floor (isolate NEUTRALIZATION as the sole gate) → raw sector/beta passes → GO
    nofloor = lambda *a, **k: {**_ORIG_FLOOR(*a, **k), "effectivePeriodsNeeded": 0}
    with patched(neutralize, "neutralize", lambda c, l: np.asarray(c, dtype=float)), patched(effective_n, "derive_power_floor", nofloor):
        broken = verdict(carry, fwd, L, minp=60)
    record("A3 reflexivity/sector-beta", defended, broken["verdict"] == "GO",
           f"real={real['verdict']} rawIcT={real.get('rawIcTstat'):.1f} residT={real.get('deflatedOosTstat'):.2f} broken={broken['verdict']}")


# ───────────────────────── A8 — REACHABLE: a constructed REAL residual edge → GO (not an always-NO machine) ─────────────────────────
def a8_reachable():
    print("\nA8 reachable — a constructed REAL residual fee-yield edge with adequate breadth/periods → the engine CAN say GO:")
    rng = np.random.default_rng(SEED + 8)
    L, _ = _loadings(rng)
    r2 = np.random.default_rng(SEED + 81)
    T = 400
    alpha = r2.normal(0.0, 0.5, size=M)                   # a persistent residual edge ORTHOGONAL to the loadings
    alpha = alpha - L @ np.linalg.lstsq(L, alpha, rcond=None)[0]   # orthogonalize vs loadings (a TRUE residual edge)
    carry = np.empty((T, M)); fwd = np.empty((T, M))
    for t in range(T):
        carry[t] = alpha + r2.normal(0.0, 0.2, size=M)
        fwd[t] = alpha + r2.normal(0.0, 0.5, size=M)      # forward tracks the residual edge → strong OOS residual IC
    real = verdict(carry, fwd, L, minp=60)
    # reachable := the engine returns GO on a genuine edge (proves the bar is not unreachable-by-construction)
    record("A8 reachable-GO", real["verdict"] == "GO", real["verdict"] == "GO",
           f"verdict={real['verdict']} deflT={real.get('deflatedOosTstat'):.1f} (a real edge is blessable)")


def main():
    print("═══ Fee-Yield Phase-1 FALSE-GO gauntlet (frozen funding_discriminate, daily fee-yield shape) ═══\n")
    a1_power_floor()
    a1p_nw_deflation()
    a3_reflexivity_beta()
    a8_reachable()
    ok = not FAILURES
    print(f"\n{'ALL PASS' if ok else 'FAIL → ' + ' | '.join(FAILURES)}")
    print("Each defense is the FROZEN engine's, positive-controlled on the fee-yield shape. Reflexivity + sector-momentum")
    print("are stripped by the neutralization (A3); raw carry/beta is never a GO (Rule XIII); the bar is reachable (A8).")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
