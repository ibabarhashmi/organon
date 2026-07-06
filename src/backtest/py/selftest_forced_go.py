"""ORGΛNON — THE FORCED-GO GAUNTLET (Integrity sprint, Blueprint Phase 3 / Rules XXIX, A1).

The MAXIMAL wall-attack. For EACH domain we fabricate the most GO-shaped data we can — a signal engineered to look like a
huge, clean, persistent, high-breadth, low-cost cross-sectional edge (the input an adversary crafts to force a GO) — and
prove the INTACT frozen validator returns NO-GO / INSUFFICIENT. A GO appears ONLY in a positive control that removes ONE
named defense in-memory (proving it load-bearing), restored in `finally`; the frozen `.py` BYTES are re-verified identical
after every control. No fabricated panel is ever written as standing data — each lives only inside this test's scope
(constructed, asserted, discarded). This is how the wall is attacked maximally WITHOUT ever letting a false GO exist (A1).

Domains & their frozen validators (all REUSED byte-identical, Rule VII):
  funding   — funding_discriminate (HOURLY, M=120): low effective breadth → power floor + NW deflation refuse
  lending   — funding_discriminate (DAILY,  M=120): reflexive utilization-beta → neutralization refuses
  fee-yield — funding_discriminate (DAILY,  M=122): reflexive + autocorrelated → neutralization + deflation + floor refuse
  RWA       — rigor DSR = PSR(SR0)  (selected cohort): best-of-N spurious Sharpe → DSR multiple-testing deflation refuses

Run: cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.selftest_forced_go
"""
from __future__ import annotations

import contextlib
import hashlib
import os
import sys

import numpy as np

from backtest.py import effective_n, neutralize, funding_discriminate, rigor

T_GATE = 3.0
DSR_MATERIAL = 0.5  # the RWA materiality bar (a DSR below it is NOT a blessable edge)
FAILURES: list[str] = []

_PY_DIR = os.path.dirname(__file__)
_FROZEN_PY = ("rigor.py", "neutralize.py", "funding_discriminate.py", "effective_n.py", "funding_accrual.py", "funding_crossvenue.py")


def _frozen_bytes() -> dict:
    return {n: hashlib.sha256(open(os.path.join(_PY_DIR, n), "rb").read()).hexdigest() for n in _FROZEN_PY}


_FROZEN_BEFORE = _frozen_bytes()


def record(name, defended, captured, detail=""):
    ok = defended and captured
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}: intact→REFUSED={defended}  defense-removed→GO={captured}  {detail}")
    if not ok:
        FAILURES.append(name + ("" if defended else " (INTACT PIPELINE FORCED A GO — false-GO vulnerability!)") + ("" if captured else " (+control could not capture — the defense is not proven load-bearing)"))


@contextlib.contextmanager
def patched(module, name, replacement):
    orig = getattr(module, name)
    setattr(module, name, replacement)
    try:
        yield
    finally:
        setattr(module, name, orig)


def discriminate(carry, forward, loadings, cadence, minp, tier="T3"):
    return funding_discriminate.discriminate({"carry": carry.tolist(), "forward": forward.tolist(),
                                              "loadings": loadings.tolist(), "minPeriods": minp,
                                              "cadenceHours": cadence, "targetIC": 0.05, "tier": tier})


def _sector_loadings(rng, m, k=5):
    sectors = rng.integers(0, k, size=m)
    return np.column_stack([rng.normal(0, 1, size=(m, 1)), np.eye(k)[sectors]]), sectors


# capture the ORIGINALS at import so a control that wraps a defense calls the real one (not the patched attr → no recursion)
_ORIG_FLOOR = effective_n.derive_power_floor
_ORIG_IID = effective_n.iid_tstat
_NOFLOOR = lambda *a, **k: {**_ORIG_FLOOR(*a, **k), "effectivePeriodsNeeded": 0}
_NO_NEUTRALIZE = lambda c, l: np.asarray(c, dtype=float)  # identity: the "neutralization removed" control


# ═══════════════════ FUNDING — hourly, low effective breadth ═══════════════════
def forced_go_funding():
    print("FUNDING (hourly, M=120) — the most GO-shaped: a persistent (autocorrelated) residual carry edge, huge naive t,")
    print("  but the HOURLY cadence inflates nominal N while effective breadth is tiny → power floor + NW deflation refuse:")
    rng = np.random.default_rng(70701)
    L, _ = _sector_loadings(rng, 120)
    r = np.random.default_rng(70702)
    T, rho, M = 260, 0.92, 120
    alpha = r.normal(0.0, 0.6, size=M)
    carry = np.empty((T, M)); fwd = np.empty((T, M)); ec = np.zeros(M)
    for t in range(T):
        ec = rho * ec + r.normal(0.0, 0.4, size=M)
        carry[t] = alpha + ec
        fwd[t] = alpha + r.normal(0.0, 1.0, size=M)
    real = discriminate(carry, fwd, L, cadence=1.0, minp=40)
    defended = real["verdict"] in ("NO-GO", "INSUFFICIENT-EVIDENCE")
    with patched(effective_n, "derive_power_floor", _NOFLOOR):
        broken = discriminate(carry, fwd, L, cadence=1.0, minp=40)
    record("funding: power floor (hourly breadth)", defended, broken["verdict"] == "GO",
           f"intact={real['verdict']}({real.get('downgradedBy')}) removed={broken['verdict']} deflT={real.get('deflatedOosTstat'):.1f}")


# ═══════════════════ LENDING — daily, reflexive utilization-beta ═══════════════════
def forced_go_lending():
    print("\nLENDING (daily, M=120) — a 'carry' factor that is actually reflexive utilization/market beta (raw IC huge),")
    print("  forward driven by the SAME beta → the neutralization strips it → residual non-predictive → NO-GO:")
    rng = np.random.default_rng(70801)
    L, sectors = _sector_loadings(rng, 120)
    r = np.random.default_rng(70802)
    T, M = 380, 120
    beta = L[:, 0] * 1.6 + np.eye(5)[sectors] @ np.array([2.0, -1.0, 1.5, -2.0, 0.5])
    carry = np.empty((T, M)); fwd = np.empty((T, M))
    for t in range(T):
        common = r.normal(0.0, 1.0)
        carry[t] = beta * common + r.normal(0.0, 0.8, size=M)
        fwd[t] = beta * common + r.normal(0.0, 1.0, size=M)
    real = discriminate(carry, fwd, L, cadence=24.0, minp=60)
    defended = real["verdict"] in ("NO-GO", "INSUFFICIENT-EVIDENCE")
    with patched(neutralize, "neutralize", _NO_NEUTRALIZE), patched(effective_n, "derive_power_floor", _NOFLOOR):
        broken = discriminate(carry, fwd, L, cadence=24.0, minp=60)
    record("lending: neutralization (reflexive beta)", defended, broken["verdict"] == "GO",
           f"intact={real['verdict']} rawIcT={real.get('rawIcTstat'):.1f} residT={real.get('deflatedOosTstat'):.2f} removed={broken['verdict']}")


# ═══════════════════ FEE-YIELD — daily, reflexive + autocorrelated (combined) ═══════════════════
def forced_go_feeyield():
    print("\nFEE-YIELD (daily, M=122) — reflexive fundamentals-as-price-beta AND an autocorrelated residual (both traps at once),")
    print("  → neutralization strips the beta, NW deflation cuts the persistence, the floor guards breadth → NO-GO/INSUFFICIENT:")
    rng = np.random.default_rng(70901)
    L, sectors = _sector_loadings(rng, 122)
    r = np.random.default_rng(70902)
    T, M, rho = 300, 122, 0.9
    beta = L[:, 0] * 1.4 + np.eye(5)[sectors] @ np.array([1.5, -1.0, 1.0, -1.5, 0.5])
    carry = np.empty((T, M)); fwd = np.empty((T, M)); ec = np.zeros(M)
    for t in range(T):
        common = r.normal(0.0, 1.0)
        ec = rho * ec + r.normal(0.0, 0.4, size=M)
        carry[t] = beta * common + ec
        fwd[t] = beta * common + r.normal(0.0, 1.0, size=M)
    real = discriminate(carry, fwd, L, cadence=24.0, minp=60)
    defended = real["verdict"] in ("NO-GO", "INSUFFICIENT-EVIDENCE")
    with patched(neutralize, "neutralize", _NO_NEUTRALIZE), patched(effective_n, "derive_power_floor", _NOFLOOR):
        broken = discriminate(carry, fwd, L, cadence=24.0, minp=60)
    record("fee-yield: neutralization+floor (combined traps)", defended, broken["verdict"] == "GO",
           f"intact={real['verdict']} rawIcT={real.get('rawIcTstat'):.1f} residT={real.get('deflatedOosTstat'):.2f} removed={broken['verdict']}")


# ═══════════════════ RWA — best-of-N spurious Sharpe → DSR multiple-testing deflation ═══════════════════
def forced_go_rwa():
    print("\nRWA (rigor DSR) — a cohort of N pure-noise return-series; the BEST has a spuriously huge in-sample Sharpe,")
    print("  but DSR = PSR(SR0(N)) deflates for the N-trial selection → DSR ≪ material → NOT a blessable edge:")
    r = np.random.default_rng(71001)
    T, N = 300, 240
    M = r.normal(0.0, 1.0, size=(T, N))          # PURE NOISE — no real edge anywhere
    sharpes = rigor.trial_sharpes(M)
    best = int(np.argmax(sharpes))
    best_ret = M[:, best]
    var_sharpe = float(np.var(sharpes, ddof=1))
    dsr = rigor.deflated_sharpe(best_ret, n_trials=N, var_sharpe=var_sharpe)   # the INTACT deflation
    psr_undeflated = rigor.psr(best_ret, 0.0)                                  # +control: NO deflation (n_trials→SR0=0)
    defended = dsr < DSR_MATERIAL                 # deflated: the selected noise winner is NOT material
    captured = psr_undeflated > DSR_MATERIAL      # removed: undeflated, the same winner looks "significant" (would bless)
    record("RWA: DSR multiple-testing deflation", defended, captured,
           f"best raw SR={sharpes[best]:.2f} → DSR(N={N})={dsr:.3f} (<{DSR_MATERIAL}) vs undeflated PSR={psr_undeflated:.3f}")


# ═══════════════════ COMBINED EVASION — evade neutralization + inflate breadth + zero cost at once ═══════════════════
def combined_evasion():
    print("\nCOMBINED EVASION — a fabrication that simultaneously EVADES neutralization (orthogonalized to the loadings),")
    print("  INFLATES nominal breadth (M=200), and assumes ZERO cost — yet is spurious (autocorrelated, no true fwd edge):")
    print("  defense-in-depth: even with neutralization evaded, NW deflation + the power floor STILL refuse (no single point of failure):")
    rng = np.random.default_rng(71101)
    M = 200
    L, _ = _sector_loadings(rng, M)
    r = np.random.default_rng(71102)
    T, rho = 240, 0.9
    # a persistent per-market edge ORTHOGONAL to the loadings (so neutralization CANNOT strip it — evaded), but it is
    # low-breadth + AUTOCORRELATED, so it is spurious-looking to a naive test: the iid t counts every persistent hour as
    # independent (inflated), while the NW deflation + the power floor (on the true effective breadth) refuse it.
    alpha = r.normal(0.0, 0.5, size=M)
    alpha = alpha - L @ np.linalg.lstsq(L, alpha, rcond=None)[0]   # orthogonalize vs loadings ⇒ evades neutralization
    carry = np.empty((T, M)); fwd = np.empty((T, M)); ec = np.zeros(M)
    for t in range(T):
        ec = rho * ec + r.normal(0.0, 0.4, size=M)
        carry[t] = alpha + ec                                     # persistent (autocorrelated) ⇒ naive iid t inflated
        fwd[t] = alpha + r.normal(0.0, 1.0, size=M)               # tracks the orthogonal edge ⇒ a real-looking IC
    real = discriminate(carry, fwd, L, cadence=1.0, minp=40)      # hourly ⇒ effN ≪ nominal, the floor bites hardest
    defended = real["verdict"] in ("NO-GO", "INSUFFICIENT-EVIDENCE")
    # DEFENSE-IN-DEPTH: the neutralization was EVADED (the edge is orthogonal to the loadings — the residual survives it),
    # AND the nominal breadth is inflated (M=200), AND cost is zero — yet the pipeline STILL refuses, because the power
    # floor on the TRUE effective breadth backstops the neutralization-evader (no single defense is the only guard).
    # Removing that backstop → GO, proving it load-bearing even against a fabrication that already defeated neutralization.
    with patched(effective_n, "derive_power_floor", _NOFLOOR):
        floor_removed = discriminate(carry, fwd, L, cadence=1.0, minp=40)
    record("combined evasion (neutralization evaded; the floor backstops)", defended, floor_removed["verdict"] == "GO",
           f"intact={real['verdict']} (neutralization EVADED via orthogonalization, yet refused) floor-removed={floor_removed['verdict']} deflT={real.get('deflatedOosTstat'):.1f}")


# ═══════════════════ FREEPIT PROVIDER PATH — a fabricated 'reconstructed' snapshot through the NEW data plane ═══════════════════
def forced_go_freepit_funding():
    # Blueprint Phase 4 (DATAPLANE): the gauntlet must prove the NEW provider cannot manufacture a GO either. A fabricated
    # freepit funding snapshot (8h cadence — the Binance-dump interval) engineered to look like a huge, persistent,
    # reflexive cross-asset carry edge is fed through the SAME intact discriminator a real freepit T1 series feeds. The
    # validator is provider-agnostic, so the internal defenses refuse it exactly as they refuse the internal fabrication.
    # (The provenance/tier gate — a SECOND defense catching a mislabeled-T1 fabrication BEFORE the discriminator — is
    # proven at the TS layer in test/redteam/forced_go_freepit.test.ts.)
    print("\nFREEPIT (funding via CEX bulk dump, 8h cadence) — the NEW provider path: a fabricated 'reconstructed' snapshot")
    print("  shaped as a persistent reflexive cross-asset carry edge → the intact discriminator refuses it (neutralization")
    print("  strips the reflexive beta, the power floor guards the true breadth) exactly as for an internal fabrication:")
    rng = np.random.default_rng(70401)
    M = 60
    L, sectors = _sector_loadings(rng, M)
    r = np.random.default_rng(70402)
    T, rho = 280, 0.9
    beta = L[:, 0] * 1.5 + np.eye(5)[sectors] @ np.array([1.8, -1.2, 1.4, -1.6, 0.6])
    carry = np.empty((T, M)); fwd = np.empty((T, M)); ec = np.zeros(M)
    for t in range(T):
        common = r.normal(0.0, 1.0)
        ec = rho * ec + r.normal(0.0, 0.4, size=M)
        carry[t] = beta * common + ec                          # reflexive (beta·common) + persistent (autocorrelated)
        fwd[t] = beta * common + r.normal(0.0, 1.0, size=M)    # forward tracks the SAME beta → neutralization strips it
    real = discriminate(carry, fwd, L, cadence=8.0, minp=50)   # 8h — the real Binance funding-dump interval
    defended = real["verdict"] in ("NO-GO", "INSUFFICIENT-EVIDENCE")
    with patched(neutralize, "neutralize", _NO_NEUTRALIZE), patched(effective_n, "derive_power_floor", _NOFLOOR):
        broken = discriminate(carry, fwd, L, cadence=8.0, minp=50)
    record("freepit funding: neutralization+floor (NEW provider path)", defended, broken["verdict"] == "GO",
           f"intact={real['verdict']} rawIcT={real.get('rawIcTstat'):.1f} residT={real.get('deflatedOosTstat'):.2f} removed={broken['verdict']}")


def main():
    print("═══ THE FORCED-GO GAUNTLET — fabricate maximally-GO-shaped data per domain; the INTACT validator must REFUSE ═══\n")
    forced_go_funding()
    forced_go_lending()
    forced_go_feeyield()
    forced_go_rwa()
    combined_evasion()
    forced_go_freepit_funding()
    after = _frozen_bytes()
    frozen_ok = after == _FROZEN_BEFORE
    print(f"\nfrozen .py bytes identical after all positive controls (monkeypatch restored): {frozen_ok}")
    if not frozen_ok:
        FAILURES.append("FROZEN BYTES CHANGED (a positive control did not restore the frozen module!)")
    ok = not FAILURES
    print(f"\n{'ALL PASS — every domain REFUSED the forced GO; every defense proven load-bearing; frozen bytes intact' if ok else 'FAIL → ' + ' | '.join(FAILURES)}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
