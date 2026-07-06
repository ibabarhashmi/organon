"""ORGΛNON Lending-Carry HARDENING — the ADVERSARIAL synthetic battery (Phase 1 / Rule X / Appendix A).

The existing sibling (selftest_lending.py) is partly CIRCULAR: it builds carry FROM the factor model, then
neutralizes against that same model — the happy path. This battery stresses the discriminator on scenarios it was
NOT built to pass, with literature-grounded data-generating processes (not hand-tuned), and — where the
discriminator structurally cannot defend (you cannot neutralize an UNMEASURED factor) — it MEASURES the false-GO
rate and DISCLOSES it. Runs ALONGSIDE golden-noise; does NOT edit selftest.py.

Honest framing (Rule X): synthetic validation BOUNDS trust, it never PROVES it. The omitted-variable robustness
check (Appendix C) is the structural defense against the *imagined* omitted factor; the *unimagined* one is the
disclosed limit; the ultimate arbiter is OOS persistence on real forward data.

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.selftest_lending_adversarial
"""
from __future__ import annotations

import sys

import numpy as np

from backtest.py import neutralize

SEED = 20260701
M = 120
T = 252
LAM = np.array([0.4, 0.3, 0.2, 0.1])
MINP = 60
K = 8  # universes for the measured rates

FAILURES: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> bool:
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAILURES.append(name)
    return cond


def verdict(carry, forward, B, nw=0):
    return neutralize.discriminate({"carry": carry.tolist(), "forward": forward.tolist(),
                                    "loadings": B.tolist(), "minPeriods": MINP, "nwLags": nw})


def _B(rng):
    B = np.abs(rng.normal(0.0, 1.0, size=(M, 4)))
    return B, B @ LAM


# ───────────────────────── S1 — UNMODELED RISK PREMIUM (the killer; MEASURE + DISCLOSE) ─────────────────────────
def s1_unmodeled_premium():
    print("S1 — unmodeled risk premium (carry driven by a factor NOT in the model):")
    rng = np.random.default_rng(SEED)
    naive_go = robust_go = irreducible_go = 0
    for _ in range(K):
        B, rp = _B(rng)
        h = np.abs(rng.normal(0.0, 1.0, size=M))        # HIDDEN factor (never given to the discriminator)
        full = rp + 0.8 * h                              # premium incl. the hidden factor
        carry = full[None, :] + rng.normal(0.0, 0.5, size=(T, M))
        forward = full[None, :] + rng.normal(0.0, 1.0, size=(T, M))
        base = verdict(carry, forward, B)
        if base["verdict"] == "GO":
            naive_go += 1
        # robust WITH the hidden factor among the plausible-omitted bank → should down-grade
        decoys = [("decoy1", rng.normal(0, 1, M)), ("decoy2", rng.normal(0, 1, M))]
        r_with = neutralize.robust_discriminate(
            {"carry": carry.tolist(), "forward": forward.tolist(), "loadings": B.tolist(), "minPeriods": MINP},
            [("hidden", h)] + decoys)
        if r_with.get("robust") == "GO":
            robust_go += 1
        # robust WITHOUT it (truly unimagined) → the irreducible limit
        r_without = neutralize.robust_discriminate(
            {"carry": carry.tolist(), "forward": forward.tolist(), "loadings": B.tolist(), "minPeriods": MINP},
            decoys)
        if r_without.get("robust") == "GO":
            irreducible_go += 1
    naive = naive_go / K
    robust = robust_go / K
    irr = irreducible_go / K
    print(f"    MEASURED false-GO rate (naive discriminator):                 {naive:.0%}  ({naive_go}/{K})")
    print(f"    after omitted-variable robustness, hidden factor IN bank:     {robust:.0%}  ({robust_go}/{K})")
    print(f"    DISCLOSED irreducible bound (hidden factor truly unimagined): {irr:.0%}  ({irreducible_go}/{K})")
    check("naive discriminator IS vulnerable to unmodeled premium (rate measured, not hidden)", naive > 0.0,
          f"false-GO={naive:.0%}")
    check("omitted-variable robustness REDUCES the false-GO rate when the factor is plausible", robust < naive,
          f"{robust:.0%} < {naive:.0%}")
    check("the irreducible unmodeled-risk bound is DISCLOSED (not claimed to be zero)", True,
          f"disclosed bound = {irr:.0%}")


# ───────────────────────── S2 — TAIL / INSURANCE-SELLING (the peso problem) ─────────────────────────
def s2_tail():
    print("S2 — tail / insurance-selling (smooth carry, rare large losses):")
    rng = np.random.default_rng(SEED + 1)
    B, rp = _B(rng)
    theta = np.abs(rng.normal(0.0, 1.0, size=M))         # tail-risk premium (unmodeled)
    carry = (rp + theta)[None, :] + rng.normal(0.0, 0.3, size=(T, M))
    forward = (rp + theta)[None, :] + rng.normal(0.0, 0.5, size=(T, M))
    jump = rng.random((T, M)) < 0.05                      # rare jump days
    forward = np.where(jump, forward - theta[None, :] * 20.0, forward)  # loss ∝ premium (fair insurance)
    full = verdict(carry, forward, B)
    # the peso warning: the calm-only window (no realized tail) looks like edge
    calm = ~np.any(jump, axis=1)
    calm_v = verdict(carry[calm][:max(np.sum(calm), MINP + 1)], forward[calm][:max(np.sum(calm), MINP + 1)], B) if np.sum(calm) > MINP else {"verdict": "n/a"}
    check("full panel (tails realized) → NOT GO (premium offset by tail losses)", full["verdict"] != "GO",
          f"verdict={full['verdict']}  oosT={full.get('oosResidualIcTstat')}")
    print(f"    peso warning: calm-only sub-window would read '{calm_v['verdict']}' — why a too-short window is dangerous (→ power floor)")


# ───────────────────────── S3 — REGIME SHIFT / NON-STATIONARITY ─────────────────────────
def s3_regime():
    print("S3 — regime shift (carry↔return relationship reverses mid-panel):")
    rng = np.random.default_rng(SEED + 2)
    B, rp = _B(rng)
    alpha = rng.normal(0.0, 0.6, size=M)
    carry = (rp + alpha)[None, :] + rng.normal(0.0, 0.5, size=(T, M))
    fwd = np.empty((T, M))
    h = T // 2
    fwd[:h] = (rp + alpha)[None, :] + rng.normal(0.0, 1.0, size=(h, M))    # regime 1: edge holds
    fwd[h:] = (rp - alpha)[None, :] + rng.normal(0.0, 1.0, size=(T - h, M))  # regime 2: edge reverses
    v = verdict(carry, fwd, B)
    check("OOS fold (post-shift) prevents a GO (no out-of-sample persistence)", v["verdict"] != "GO",
          f"verdict={v['verdict']}  oosT={v.get('oosResidualIcTstat')}")


# ───────────────────────── S4 — AUTOCORRELATION (naive t-stat inflated) ─────────────────────────
def s4_autocorrelation():
    print("S4 — autocorrelation (persistent daily carry inflates the naive IC t-stat):")
    rng = np.random.default_rng(SEED + 3)
    B, rp = _B(rng)
    alpha = rng.normal(0.0, 0.15, size=M)                 # weak edge
    carry = np.empty((T, M)); fwd = np.empty((T, M))
    ec = np.zeros(M); ef = np.zeros(M)
    for t in range(T):
        ec = 0.92 * ec + rng.normal(0.0, 0.5, size=M)
        ef = 0.92 * ef + rng.normal(0.0, 1.0, size=M)
        carry[t] = rp + alpha + ec
        fwd[t] = rp + alpha + ef
    naive = verdict(carry, fwd, B, nw=0)
    nw = verdict(carry, fwd, B, nw=12)                    # Newey-West autocorrelation-robust
    check("Newey-West t-stat DEFLATES the autocorrelation-inflated naive t-stat", abs(nw["oosResidualIcTstat"]) < abs(naive["oosResidualIcTstat"]),
          f"naiveT={naive['oosResidualIcTstat']:.2f} → nwT={nw['oosResidualIcTstat']:.2f}")


# ───────────────────────── S5 — CROSS-SECTIONAL DEPENDENCE (effective breadth ≪ nominal) ─────────────────────────
def s5_cross_dependence():
    print("S5 — cross-sectional dependence (120 markets, ~5 independent blocks):")
    rng = np.random.default_rng(SEED + 4)
    B, rp = _B(rng)
    blocks, per = 5, M // 5
    carry = np.empty((T, M)); fwd = np.empty((T, M))
    for t in range(T):
        bc = np.repeat(rng.normal(0, 0.5, blocks), per)[:M]
        bf = np.repeat(rng.normal(0, 1.0, blocks), per)[:M]
        carry[t] = rp + bc
        fwd[t] = rp + bf
    v = verdict(carry, fwd, B)
    check("a cross-sectionally-dependent NULL → NOT GO (no spurious edge from clustered markets)", v["verdict"] != "GO",
          f"verdict={v['verdict']}  (nominal M={M}, effective ≈ {blocks})")


# ───────────────────────── S6 — SURVIVORSHIP (deaths are part of the return) ─────────────────────────
def s6_survivorship():
    print("S6 — survivorship (high-carry markets that BLEW UP are excluded ex-post):")
    rng = np.random.default_rng(SEED + 5)
    B, rp = _B(rng)
    theta = np.abs(rng.normal(0.0, 1.0, size=M))               # high theta = high carry
    carry = (rp + theta)[None, :] + rng.normal(0.0, 0.3, size=(T, M))
    # default: carry is realized (theta → positive forward). But a high-theta subset are FRAGILE chronic losers
    # that blew up — their forward is systematically NEGATIVE, and survivorship bias removes them ex-post.
    fwd_full = (rp + theta)[None, :] + rng.normal(0.0, 0.5, size=(T, M))
    fragile = theta > np.quantile(theta, 0.7)
    for i in np.where(fragile)[0]:
        fwd_full[:, i] = rp[i] - theta[i] * 5.0 + rng.normal(0.0, 0.5, size=T)  # high carry, BAD return
    fwd_surv = fwd_full.copy()
    fwd_surv[:, fragile] = np.nan                              # survivor bias: the blow-ups are never in the panel
    ic_full = verdict(carry, fwd_full, B).get("residualIcMean") or 0.0
    ic_surv = verdict(carry, fwd_surv, B).get("residualIcMean") or 0.0
    check("including the blow-ups LOWERS the apparent edge (survivor-only removal inflates it)", ic_full < ic_surv,
          f"with-deaths IC={ic_full:.3f} < survivor-only IC={ic_surv:.3f}")


# ───────────────────────── S7 — INCENTIVE-YIELD CONTAMINATION ─────────────────────────
def s7_incentive():
    print("S7 — incentive contamination (carry inflated by apyReward that ends):")
    rng = np.random.default_rng(SEED + 6)
    B, rp = _B(rng)
    incentive = np.abs(rng.normal(0.0, 1.0, size=M))
    decay = np.linspace(1.0, 0.0, T)
    carry = np.empty((T, M))
    for t in range(T):
        carry[t] = rp + incentive * decay[t] + rng.normal(0.0, 0.3, size=M)
    fwd = rp[None, :] + rng.normal(0.0, 0.5, size=(T, M))   # forward realizes ONLY base (incentive gone)
    v = verdict(carry, fwd, B)
    check("incentive-inflated carry that doesn't persist → NOT GO", v["verdict"] != "GO",
          f"verdict={v['verdict']}")


# ───────────────────────── S8 — NEGATIVE CONTROLS (the bar is honest, not impossible) ─────────────────────────
def s8_controls():
    print("S8 — negative controls:")
    rng = np.random.default_rng(SEED + 7)
    # pure noise → NO-GO
    B, rp = _B(rng)
    n1 = verdict(rng.normal(0, 1, (T, M)), rng.normal(0, 1, (T, M)), B)
    check("pure noise → NOT GO", n1["verdict"] != "GO", f"verdict={n1['verdict']}")
    # pure MODELED risk premium → NO-GO
    carry = rp[None, :] + rng.normal(0, 0.5, (T, M))
    fwd = rp[None, :] + rng.normal(0, 1, (T, M))
    n2 = verdict(carry, fwd, B)
    check("pure modeled risk premium → NOT GO", n2["verdict"] != "GO", f"verdict={n2['verdict']}")
    # constructed REAL edge with confounds → GO (the bar is honest)
    alpha = rng.normal(0, 0.6, M)
    carry = (rp + alpha)[None, :] + rng.normal(0, 0.5, (T, M))
    fwd = (rp + alpha)[None, :] + rng.normal(0, 1, (T, M))
    g = verdict(carry, fwd, B)
    check("constructed real edge (with modeled confounds) → GO (not an always-NO-GO machine)", g["verdict"] == "GO",
          f"verdict={g['verdict']}  oosT={g.get('oosResidualIcTstat'):.1f}")


def main():
    s1_unmodeled_premium()
    s2_tail()
    s3_regime()
    s4_autocorrelation()
    s5_cross_dependence()
    s6_survivorship()
    s7_incentive()
    s8_controls()
    ok = not FAILURES
    print(f"\nLending adversarial battery: {'ALL PASS' if ok else 'FAIL -> ' + ', '.join(FAILURES)}")
    print("NOTE (Rule X): the discriminator is 'bounded with disclosed limits', NOT 'ungameable'. The unmodeled-risk")
    print("      false-GO bound above is the structural limit; the ultimate arbiter is OOS persistence on real data.")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
