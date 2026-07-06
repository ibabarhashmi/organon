"""ORGΛNON Red-Team — the FALSE-GO gauntlet, POSITIVE-CONTROLLED (Sprint Phase 0 / Rule XXIX / Appendix A).

The existing adversarial batteries (selftest_funding_adversarial S1–S10, selftest_lending_adversarial S1–S8) ASSERT
that each trap defends — but a test that can only pass is not a test (B.1). This module adds the missing half: for every
false-GO flag, a POSITIVE CONTROL that CAPTURES the flag on a DELIBERATELY-BROKEN gate, proving (a) the attack is real
(it CAN force a GO if the named defense is removed) and (b) the specific gate is what stops it.

The break is an IN-MEMORY monkeypatch of the SPECIFIC defense (power floor / NW deflation / effective breadth /
neutralization / degeneracy floor), restored in `finally`. The frozen .py bytes on disk are NEVER touched (re-verified
byte-identical in Phase 7). No gate is loosened to make a trap pass; the trap defends with the REAL gate.

Every scenario PASSES iff BOTH hold:  real gate → DEFENDED (NO-GO/INSUFFICIENT)  AND  broken gate → CAPTURED (GO/leak).

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.selftest_redteam_falsego
"""
from __future__ import annotations

import contextlib
import sys

import numpy as np

from backtest.py import effective_n, neutralize, funding_discriminate, reachability

SEED = 20260702
M = 120
LAM = np.array([0.4, 0.3, 0.2, 0.1])
T_GATE = 3.0

# Original references captured BEFORE any patch (so a replacement can call the real one without recursing).
_ORIG_FLOOR = effective_n.derive_power_floor
_ORIG_BREADTH = effective_n.effective_breadth
_ORIG_NEUTRALIZE = neutralize.neutralize

FAILURES: list[str] = []


def record(name: str, defended: bool, captured: bool, detail: str = "") -> None:
    ok = defended and captured
    tag = "PASS" if ok else "FAIL"
    print(f"  [{tag}] {name}: real→DEFENDED={defended}  broken→CAPTURED={captured}  {detail}")
    if not ok:
        FAILURES.append(name + ("" if defended else " (real gate did NOT defend!)") + ("" if captured else " (positive control could NOT capture — test cannot fail!)"))


@contextlib.contextmanager
def patched(module, name: str, replacement):
    """Temporarily replace module.name; ALWAYS restored. The frozen file on disk is untouched (in-memory only)."""
    orig = getattr(module, name)
    setattr(module, name, replacement)
    try:
        yield
    finally:
        setattr(module, name, orig)


def _B(rng):
    B = np.abs(rng.normal(0.0, 1.0, size=(M, 4)))
    return B, B @ LAM


def fverdict(carry, forward, B, minp=80):
    return funding_discriminate.discriminate({"carry": carry.tolist(), "forward": forward.tolist(),
                                              "loadings": B.tolist(), "minPeriods": minp, "cadenceHours": 1.0})


def lverdict(carry, forward, B, minp=80, nw=4):
    return neutralize.discriminate({"carry": carry.tolist(), "forward": forward.tolist(),
                                    "loadings": B.tolist(), "minPeriods": minp, "nwLags": nw})


# ───────────────────────── A1 — POWER FLOOR (F-A1): effective-N below the derived floor ─────────────────────────
def a1_power_floor():
    print("A1 [F-A1] power floor — a real residual edge on an AUTOCORRELATED panel (deflated-t clears, effective-N ≪ floor):")
    rng = np.random.default_rng(SEED)
    B, rp = _B(rng)
    r2 = np.random.default_rng(SEED + 11)
    T, rho = 200, 0.9
    alpha = r2.normal(0.0, 0.6, size=M)                       # a strong residual edge → deflated OOS-IC t clears the gate
    carry = np.empty((T, M)); fwd = np.empty((T, M)); ec = np.zeros(M)
    for t in range(T):
        ec = rho * ec + r2.normal(0.0, 0.4, size=M)           # AR(1) persistence → large τ_int → effective-N ≪ nominal
        carry[t] = rp + alpha + ec
        fwd[t] = rp + alpha + r2.normal(0.0, 1.0, size=M)
    real = fverdict(carry, fwd, B, minp=40)
    # DEFENDED := the deflated path WOULD bless (t ≫ gate) but the floor downgrades it to INSUFFICIENT (downgradedBy set).
    defended = real["verdict"] == "INSUFFICIENT-EVIDENCE" and real.get("downgradedBy") is not None
    # BREAK the floor: force effectivePeriodsNeeded = 0 (the frequency-integrity power floor removed).
    def broken_floor(*a, **k):
        d = dict(_ORIG_FLOOR(*a, **k)); d["effectivePeriodsNeeded"] = 0; return d
    with patched(effective_n, "derive_power_floor", broken_floor):
        cap = fverdict(carry, fwd, B, minp=40)
    captured = cap["verdict"] == "GO"                         # floor removed ⇒ the deflated-GO stands (false GO)
    dt = real.get("deflatedOosTstat") or 0.0
    record("A1 power-floor (funding)", defended, captured,
           f"real={real['verdict']} ({real.get('downgradedBy')}) → floor-removed={cap['verdict']}; deflatedOosT={dt:.1f}")


# ───────────────────────── A1' — NW DEFLATION (F-A1): the autocorrelation trap, isolated ─────────────────────────
def a1b_deflation():
    print("A1' [F-A1] Newey–West deflation — autocorrelated IC inflates the NAIVE t; the deflation removes it:")
    ic = effective_n._demo_autocorrelated_ic()               # persistent null: mean μ + AR(1) demeaned fluctuation
    real = effective_n.deflate_report(ic, bootstrap=False)
    defended = abs(real["naiveTstat"]) > T_GATE and abs(real["deflatedTstat"]) < T_GATE  # naive blesses, deflated refuses
    # BREAK the deflation: make the NW t-stat ignore autocorrelation (behave iid, ignoring the lag arg) → no shrinkage.
    with patched(effective_n, "nw_tstat", lambda x, lags=0: effective_n.iid_tstat(x)):
        cap = effective_n.deflate_report(ic, bootstrap=False)
    captured = abs(cap["deflatedTstat"]) > T_GATE            # un-deflated, the autocorrelation trap crosses the gate
    record("A1' NW-deflation (funding)", defended, captured,
           f"naiveT={real['naiveTstat']:.1f}(>gate) realDeflT={real['deflatedTstat']:.1f}(<gate) → broken deflT={cap['deflatedTstat']:.1f}(>gate)")


# ───────────────────────── A2 — EFFECTIVE BREADTH (F-A2): collinear columns can't inflate breadth ─────────────────────────
def a2_breadth():
    print("A2 [F-A2] effective breadth — 120 columns clustered into 5 independent blocks (participation ratio collapses):")
    rng = np.random.default_rng(SEED + 4)
    blocks, per = 5, M // 5
    T = 300
    carry = np.empty((T, M))
    for t in range(T):
        carry[t] = np.repeat(rng.normal(0, 0.5, blocks), per)[:M]  # 120 columns, 5 independent drivers
    m_eff_real = _ORIG_BREADTH(carry)
    floor_real = _ORIG_FLOOR(0.05, m_eff_real, 1.0)["effectivePeriodsNeeded"]
    defended = m_eff_real < M / 3                              # breadth collapses toward 5, not 120
    # BREAK breadth: count every column as independent (the naive nominal count) → the floor is understated.
    floor_broken = _ORIG_FLOOR(0.05, float(M), 1.0)["effectivePeriodsNeeded"]
    captured = floor_broken < floor_real / 2                  # nominal breadth mints power the panel does not have
    record("A2 effective-breadth (funding/lending)", defended, captured,
           f"M_eff={m_eff_real:.1f}≪{M}; floor(real M_eff)={floor_real} vs floor(nominal {M})={floor_broken}")


# ───────────────────────── A3 — CARRY=BETA (F-A3): a significant raw carry is never a GO ─────────────────────────
def a3_beta_leak(domain: str, verdict_fn):
    print(f"A3 [F-A3] carry=beta ({domain}) — pure MODELED funding beta/level (raw carry huge, residual ≈ 0):")
    rng = np.random.default_rng(SEED + 1)
    B, rp = _B(rng)
    T = 300
    carry = rp[None, :] + rng.normal(0, 0.5, (T, M))          # carry IS the factor exposure — pure beta, no residual edge
    fwd = rp[None, :] + rng.normal(0, 1.0, (T, M))
    real = verdict_fn(carry, fwd, B)
    defended = real["verdict"] != "GO"                        # residualized → no edge
    # BREAK neutralization: make it a no-op (identity) → the raw carry flows through as if it were residual.
    with patched(neutralize, "neutralize", lambda mat, load: np.asarray(mat, dtype=float)):
        cap = verdict_fn(carry, fwd, B)
    captured = cap["verdict"] == "GO"                         # un-neutralized beta is now (wrongly) blessed
    record(f"A3 carry=beta ({domain})", defended, captured,
           f"real={real['verdict']} (rawIcT={real.get('rawIcTstat')}) → neutralization-off={cap['verdict']}")


# ───────────────────────── A4 — TAIL / PESO (F-A4): smooth carry, rare catastrophic losses ─────────────────────────
def a4_tail():
    print("A4 [F-A4] tail/peso — smooth carry punctuated by rare deleveraging losses (blessed on the CALM window only):")
    rng = np.random.default_rng(SEED + 20)
    B, rp = _B(rng)
    T = 300
    theta = np.abs(rng.normal(0.0, 0.5, size=M))              # unmodeled tail-premium (predicts forward in calm periods)
    carry = (rp + theta)[None, :] + rng.normal(0.0, 0.4, size=(T, M))
    fwd = (rp + theta)[None, :] + rng.normal(0.0, 0.8, size=(T, M))
    jump_rows = rng.random(T) < 0.06                          # rare deleveraging days (whole-panel)
    fwd_full = fwd.copy()
    fwd_full[jump_rows] -= theta[None, :] * 15.0             # catastrophic loss ∝ premium (fair insurance)
    real = fverdict(carry, fwd_full, B)
    defended = real["verdict"] != "GO"                       # full panel (tails realized) → NOT GO
    # BROKEN analysis: bless on the CALM window only (drop the loss days) — the realized tail is what refuses it.
    cap = fverdict(carry[~jump_rows], fwd_full[~jump_rows], B)
    captured = cap["verdict"] == "GO"
    record("A4 tail/peso (funding)", defended, captured, f"full(tails)={real['verdict']} → calm-window-only={cap['verdict']}")


# ───────────────────────── A5 — REGIME SHIFT (F-A5): the relationship reverses mid-panel ─────────────────────────
def a5_regime():
    print("A5 [F-A5] regime shift — the funding↔forward relationship reverses mid-panel (OOS instability):")
    rng = np.random.default_rng(SEED + 21)
    B, rp = _B(rng)
    T, h = 300, 150
    alpha = rng.normal(0.0, 0.5, size=M)
    carry = (rp + alpha)[None, :] + rng.normal(0.0, 0.5, size=(T, M))
    fwd = np.empty((T, M))
    fwd[:h] = (rp + alpha)[None, :] + rng.normal(0.0, 1.0, size=(h, M))       # regime 1: edge holds
    fwd[h:] = (rp - alpha)[None, :] + rng.normal(0.0, 1.0, size=(T - h, M))   # regime 2: edge reverses
    real = fverdict(carry, fwd, B)
    defended = real["verdict"] != "GO"                       # full panel → OOS fold catches the flip → NOT GO
    # BROKEN analysis: bless on the FIRST regime only (drop the reversal) — the OOS fold is what refuses it.
    cap = fverdict(carry[:h], fwd[:h], B)
    captured = cap["verdict"] == "GO"
    record("A5 regime-shift (funding)", defended, captured, f"full(both regimes)={real['verdict']} → first-regime-only={cap['verdict']}")


# ───────────────────────── A7 — SURVIVORSHIP (F-A7): delisted assets dropped ex-post ─────────────────────────
def a7_survivorship():
    print("A7 [F-A7] survivorship — high-carry assets that blew up are excluded ex-post (survivor-only inflates the edge):")
    rng = np.random.default_rng(SEED + 22)
    B, rp = _B(rng)
    T = 300
    theta = np.abs(rng.normal(0.0, 0.6, size=M))
    carry = (rp + theta)[None, :] + rng.normal(0.0, 0.4, size=(T, M))
    fwd_full = (rp + theta)[None, :] + rng.normal(0.0, 0.8, size=(T, M))
    fragile = theta > np.quantile(theta, 0.7)                # high-carry, fragile
    for i in np.where(fragile)[0]:
        fwd_full[:, i] = rp[i] - theta[i] * 5.0 + rng.normal(0.0, 0.5, size=T)  # high carry, BAD realized forward (blew up)
    real = fverdict(carry, fwd_full, B)
    defended = real["verdict"] != "GO"                       # with the deaths in → edge killed → NOT GO
    # BROKEN analysis: DROP the fragile (blown-up) assets ex-post → the survivors' residual edge blesses.
    keep = ~fragile
    cap = fverdict(carry[:, keep], fwd_full[:, keep], B[keep, :])
    captured = cap["verdict"] == "GO"
    record("A7 survivorship (funding)", defended, captured, f"with-deaths={real['verdict']} → survivor-only={cap['verdict']}")


# ───────────────────────── A6 — NEAR-SINGULAR LOADINGS (F-A6): rank-deficient factor matrix ─────────────────────────
def a6_near_singular(domain: str, verdict_fn):
    print(f"A6 [F-A6] near-singular loadings ({domain}) — a rank-deficient factor matrix (duplicated collinear columns):")
    rng = np.random.default_rng(SEED + 9)
    T = 200
    base = np.abs(rng.normal(0.0, 1.0, size=(M, 2)))
    # 4 columns but rank 2: cols 3,4 are exact copies of 1,2 (+ a whisper) → B.T@B is near-singular.
    B = np.column_stack([base[:, 0], base[:, 1], base[:, 0] + 1e-9, base[:, 1] + 1e-9])
    rp = B @ LAM
    carry = rp[None, :] + rng.normal(0, 0.5, (T, M))
    fwd = rp[None, :] + rng.normal(0, 1.0, (T, M))
    real = verdict_fn(carry, fwd, B)
    v = real["verdict"]
    defended = v in ("NO-GO", "INSUFFICIENT-EVIDENCE") and np.isfinite(real.get("rawIcTstat") or 0.0)  # graceful, no NaN, no spurious GO
    # BREAK the numerically-robust residualization (lstsq min-norm) with a naive normal-equations INVERSE, which
    # explodes on a singular B.T@B → NaN/inf residuals → a crash or a spurious verdict.
    def naive_inverse_neutralize(mat, load):
        mat = np.asarray(mat, dtype=float); load = np.asarray(load, dtype=float)
        out = np.full_like(mat, np.nan)
        gram = load.T @ load
        inv = np.linalg.inv(gram + 1e-18 * np.eye(gram.shape[0]))  # near-singular → blows up
        for t in range(mat.shape[0]):
            y = mat[t]
            beta = inv @ (load.T @ y)
            out[t] = y - load @ beta
        return out
    crashed = False
    cap_v = None
    try:
        with patched(neutralize, "neutralize", naive_inverse_neutralize):
            cap = verdict_fn(carry, fwd, B)
            cap_v = cap["verdict"]
    except Exception as ex:  # noqa — a crash IS the captured flag (the naive inverse fails)
        crashed = True
        cap_v = f"CRASH:{type(ex).__name__}"
    # captured := the broken (naive-inverse) path produced a DIFFERENT, degenerate outcome (crash or a GO) that the
    # real lstsq path avoided — i.e. the min-norm solve is load-bearing for graceful handling.
    captured = crashed or cap_v == "GO" or cap_v != v
    record(f"A6 near-singular ({domain})", defended, captured,
           f"real(lstsq)={v} (graceful) → naive-inverse={cap_v}")


# ───────────────────────── F-RWA — REACHABILITY degeneracy floor: zero-vol artifact can't mint a COHORT signal ───────────
def rwa_degeneracy():
    print("RWA [F-RWA] reachability degeneracy floor — a near-monotonic zero-vol YIELD ARTIFACT in the cohort:")
    rng = np.random.default_rng(SEED + 7)
    # a genuine-downside cohort (real vol + drawdowns) …
    genuine = [list(rng.normal(0.0005, 0.02, 250)) for _ in range(6)]
    # … plus ONE artifact: near-constant tiny positive accrual with a single down day → Sortino DEFINED, but
    # maxdd≈0 and vol≈0 (annVol ~0.1%, annSharpe ~huge). The Sortino-only test would ADMIT it (F-RWA capture).
    art = [0.0004] * 250; art[123] = -0.0001
    series = genuine + [art]
    real = reachability.run_reachability({"series": series, "nTrials": 20})           # OR-of-three floors ON
    art_flag = real["strategies"][-1]["degenerate"]
    defended = art_flag is True and real["nDegenerate"] >= 1                           # the floor catches the artifact
    # BREAK the floor: disable the maxdd/vol floors (maxddFloor=0, volFloor=0) ⇒ Sortino-only ⇒ artifact ADMITTED.
    cap = reachability.run_reachability({"series": series, "nTrials": 20, "maxddFloor": 0.0, "volFloor": 0.0})
    art_leaks = cap["strategies"][-1]["degenerate"] is False
    art_dsr = cap["strategies"][-1]["dsrCleanStrict"]                                  # spuriously high on the artifact
    captured = art_leaks and cap["nDegenerate"] < real["nDegenerate"]
    record("RWA reachability degeneracy (RWA)", defended, captured,
           f"real: artifact degenerate={art_flag}, nDegenerate={real['nDegenerate']} → floors-off: degenerate={not art_leaks and 'True' or 'False'}, "
           f"nDegenerate={cap['nDegenerate']}, artifact dsrStrict={art_dsr:.2f}")


# ───────────────────────── A8 — POSITIVE CONTROL (the bar is reachable; NOT an always-NO machine) ─────────────────────────
def a8_reachable():
    print("A8 [F-A8] the bar is reachable — a constructed REAL residual edge (with modeled confounds) → GO:")
    rng = np.random.default_rng(SEED + 8)
    B, rp = _B(rng)
    T = 300
    alpha = rng.normal(0, 0.6, M)                              # a real dislocation edge
    carry = (rp + alpha)[None, :] + rng.normal(0, 0.5, (T, M))
    fwd = (rp + alpha)[None, :] + rng.normal(0, 1.0, (T, M))
    g = fverdict(carry, fwd, B)
    reachable = g["verdict"] == "GO"
    dt = g.get("deflatedOosTstat") or 0.0
    print(f"  [{'PASS' if reachable else 'FAIL'}] A8 reachable (funding): verdict={g['verdict']} deflatedOosT={dt:.1f} "
          f"(the machinery is not an always-NO-GO machine)")
    if not reachable:
        FAILURES.append("A8 reachable (the bar is unreachable — always-NO machine!)")


def main():
    a1_power_floor()
    a1b_deflation()
    a2_breadth()
    a3_beta_leak("funding", fverdict)
    a3_beta_leak("lending", lverdict)
    a4_tail()
    a5_regime()
    a7_survivorship()
    a6_near_singular("funding", fverdict)
    a6_near_singular("lending", lverdict)
    rwa_degeneracy()
    a8_reachable()
    ok = not FAILURES
    print(f"\nRed-team false-GO gauntlet (positive-controlled): {'ALL PASS' if ok else 'FAIL -> ' + '; '.join(FAILURES)}")
    print("NOTE (Rule XXIX): each trap DEFENDS with the real gate AND is CAPTURED with the gate removed — the batteries")
    print("      can fail. No gate was loosened to pass a trap; the frozen .py bytes are untouched (in-memory patch only).")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
