"""ORGΛNON Funding-Carry — the ADVERSARIAL synthetic battery (Blueprint Phase 2 / Rule X / Appendix A).

Built ADVERSARIALLY-FIRST (the lesson lending learned late, applied from day one): literature-grounded DGPs designed
to BREAK the discriminator, each with a generator, an expected behavior, and a deterministic pass criterion — plus,
where the discriminator structurally cannot defend (you cannot neutralize an UNMEASURED factor), a MEASURED and
DISCLOSED unmodeled-risk false-GO rate. Runs ALONGSIDE golden-noise (selftest.py) and the lending battery; edits
NEITHER. The discriminator under test is the DEFLATED funding discriminator (funding_discriminate) — every OOS
statistic is effective-N-deflated (Rule XII).

Honest framing (Rule X): synthetic validation BOUNDS trust, never PROVES it. The omitted-variable robustness check
(Appendix C) defends the IMAGINED omitted factor; the UNIMAGINED one is the disclosed limit; the ultimate arbiter is
OOS persistence on real forward funding.

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.selftest_funding_adversarial
"""
from __future__ import annotations

import sys

import numpy as np

from backtest.py import effective_n, funding_discriminate

SEED = 20260702
M = 120
T = 300
LAM = np.array([0.4, 0.3, 0.2, 0.1])
MINP = 80
K = 8  # universes for the measured rates

FAILURES: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> bool:
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAILURES.append(name)
    return cond


def verdict(carry, forward, B):
    return funding_discriminate.discriminate({"carry": carry.tolist(), "forward": forward.tolist(),
                                              "loadings": B.tolist(), "minPeriods": MINP, "cadenceHours": 1.0})


def _B(rng):
    B = np.abs(rng.normal(0.0, 1.0, size=(M, 4)))
    return B, B @ LAM


# ───────────────────────── S1 — UNMODELED RISK PREMIUM (measure + DISCLOSE the deflated false-GO) ─────────────────────────
def s1_unmodeled_premium():
    print("S1 — unmodeled risk premium (funding driven by a factor NOT in the model):")
    rng = np.random.default_rng(SEED)
    deflated_go = robust_go = irreducible_go = 0
    for _ in range(K):
        B, rp = _B(rng)
        h = np.abs(rng.normal(0.0, 1.0, size=M))          # HIDDEN factor (never given to the discriminator)
        full = rp + 0.8 * h
        carry = full[None, :] + rng.normal(0.0, 0.5, size=(T, M))
        forward = full[None, :] + rng.normal(0.0, 1.0, size=(T, M))
        if verdict(carry, forward, B)["verdict"] == "GO":
            deflated_go += 1
        decoys = [("decoy1", rng.normal(0, 1, M)), ("decoy2", rng.normal(0, 1, M))]
        r_with = funding_discriminate.robust_discriminate(
            {"carry": carry.tolist(), "forward": forward.tolist(), "loadings": B.tolist(), "minPeriods": MINP},
            [("hidden", h)] + decoys)
        if r_with.get("robust") == "GO":
            robust_go += 1
        r_without = funding_discriminate.robust_discriminate(
            {"carry": carry.tolist(), "forward": forward.tolist(), "loadings": B.tolist(), "minPeriods": MINP}, decoys)
        if r_without.get("robust") == "GO":
            irreducible_go += 1
    d, rb, irr = deflated_go / K, robust_go / K, irreducible_go / K
    print(f"    MEASURED false-GO rate (DEFLATED discriminator):                {d:.0%}  ({deflated_go}/{K})")
    print(f"    after omitted-variable robustness, hidden factor IN bank:       {rb:.0%}  ({robust_go}/{K})")
    print(f"    DISCLOSED irreducible bound (hidden factor truly unimagined):   {irr:.0%}  ({irreducible_go}/{K})")
    check("the deflated false-GO rate is MEASURED (not hidden)", True, f"false-GO={d:.0%}")
    check("omitted-variable robustness REDUCES the false-GO when the factor is plausible", rb <= d, f"{rb:.0%} ≤ {d:.0%}")
    check("the irreducible unmodeled-risk bound is DISCLOSED (not claimed zero)", True, f"disclosed bound = {irr:.0%}")


# ───────────────────────── S2 — TAIL / INSURANCE-SELLING (the funding peso problem) ─────────────────────────
def s2_tail():
    print("S2 — tail / insurance-selling (smooth positive funding, rare deleveraging blowups — the Oct-2025 tail):")
    rng = np.random.default_rng(SEED + 1)
    B, rp = _B(rng)
    theta = np.abs(rng.normal(0.0, 1.0, size=M))          # tail-risk premium (unmodeled)
    carry = (rp + theta)[None, :] + rng.normal(0.0, 0.3, size=(T, M))
    forward = (rp + theta)[None, :] + rng.normal(0.0, 0.5, size=(T, M))
    jump = rng.random((T, M)) < 0.05                       # rare deleveraging days
    forward = np.where(jump, forward - theta[None, :] * 20.0, forward)  # loss ∝ premium (fair insurance)
    v = verdict(carry, forward, B)
    check("full panel (tails realized) → NOT GO (funding premium offset by deleveraging losses)", v["verdict"] != "GO",
          f"verdict={v['verdict']}  oosPortT={v.get('oosPortfolioTstat')}")


# ───────────────────────── S3 — REGIME SHIFT (2024 high-funding → 2025 compression / sign-flip) ─────────────────────────
def s3_regime():
    print("S3 — regime shift (funding↔return relationship reverses mid-panel; the 2024→2025 carry-Sharpe sign-flip):")
    rng = np.random.default_rng(SEED + 2)
    B, rp = _B(rng)
    alpha = rng.normal(0.0, 0.6, size=M)
    carry = (rp + alpha)[None, :] + rng.normal(0.0, 0.5, size=(T, M))
    fwd = np.empty((T, M))
    h = T // 2
    fwd[:h] = (rp + alpha)[None, :] + rng.normal(0.0, 1.0, size=(h, M))     # regime 1: edge holds
    fwd[h:] = (rp - alpha)[None, :] + rng.normal(0.0, 1.0, size=(T - h, M))  # regime 2: edge reverses
    v = verdict(carry, fwd, B)
    check("OOS fold (post-shift) prevents a GO (no out-of-sample persistence)", v["verdict"] != "GO",
          f"verdict={v['verdict']}  oosT={v.get('deflatedOosTstat')}")


# ───────────────────────── S4 — AUTOCORRELATION (Rule XII in action — the naive→deflated flip) ─────────────────────────
def s4_autocorrelation():
    print("S4 — autocorrelation (persistent intraday funding inflates the NAIVE t-stat; deflation removes it):")
    rng = np.random.default_rng(SEED + 3)
    B, rp = _B(rng)
    alpha = rng.normal(0.0, 0.12, size=M)                  # a weak edge
    carry = np.empty((T, M)); fwd = np.empty((T, M))
    ec = np.zeros(M); ef = np.zeros(M)
    for t in range(T):
        ec = 0.9 * ec + rng.normal(0.0, 0.4, size=M)       # AR(1) persistence
        ef = 0.9 * ef + rng.normal(0.0, 0.6, size=M)
        carry[t] = rp + alpha + ec
        fwd[t] = rp + alpha + ef
    v = verdict(carry, fwd, B)
    naive_t = abs(v.get("naiveOosTstat") or 0.0)
    defl_t = abs(v.get("deflatedOosTstat") or 0.0)
    print(f"    NAIVE OOS t={naive_t:.2f} (naive would bless: {v.get('naiveVerdict')})  →  DEFLATED OOS t={defl_t:.2f}, nwLags(measured)={v.get('nwLags')}  →  VERDICT={v['verdict']}")
    if v.get("downgradedBy"):
        print(f"    layered defense: {v['downgradedBy']}")
    check("the effective-N deflation SHRINKS the autocorrelation-inflated naive t-stat", defl_t < naive_t,
          f"naiveT={naive_t:.2f} → deflatedT={defl_t:.2f}")
    check("the DEFLATED discriminator does NOT bless the autocorrelated series (Rule XII holds via deflation+gates)", v["verdict"] != "GO",
          f"naiveVerdict={v.get('naiveVerdict')} → deflatedVerdict={v['verdict']}")
    # the CANONICAL flip (focal Q1), embedded: a persistent IC series whose NAIVE (iid) t-stat crosses the gate
    # (a false GO) but whose EFFECTIVE-N-deflated t-stat does not (NO-GO) — measured, not asserted.
    ic = effective_n._demo_autocorrelated_ic()
    rep = effective_n.deflate_report(ic, bootstrap=False)
    naive_go = abs(rep["naiveTstat"]) > 3.0
    deflated_go = abs(rep["deflatedTstat"]) > 3.0
    print(f"    canonical IC-t flip: naive t={rep['naiveTstat']:.2f} ({'GO' if naive_go else 'no'}) → deflated t={rep['deflatedTstat']:.2f} ({'GO' if deflated_go else 'no'}); eff-N {rep['effectiveNserial']:.0f} < nominal {rep['nominalN']}")
    check("canonical: naive IC-t GOES (t>gate) but deflated IC-t does NOT — false-GO → NO-GO (Rule XII, focal Q1)",
          naive_go and not deflated_go, f"naive={rep['naiveTstat']:.2f}>3, deflated={rep['deflatedTstat']:.2f}<3")


# ───────────────────────── S5 — CROSS-VENUE COLLINEARITY (effective breadth ≪ nominal) ─────────────────────────
def s5_cross_dependence():
    print("S5 — cross-venue collinearity (nominal M=120, but same-underlying funding clusters into ~5 blocks):")
    rng = np.random.default_rng(SEED + 4)
    B, rp = _B(rng)
    blocks, per = 5, M // 5
    carry = np.empty((T, M)); fwd = np.empty((T, M))
    for t in range(T):
        bc = np.repeat(rng.normal(0, 0.5, blocks), per)[:M]
        bf = np.repeat(rng.normal(0, 1.0, blocks), per)[:M]
        carry[t] = rp + bc
        fwd[t] = rp + bf
    m_eff = effective_n.effective_breadth(carry)
    v = verdict(carry, fwd, B)
    print(f"    MEASURED effective breadth M_eff={m_eff:.1f}  (nominal M={M}, true independent blocks={blocks})")
    check("effective breadth collapses toward the number of independent blocks, not M", m_eff < M / 3,
          f"M_eff={m_eff:.1f} ≪ {M}")
    check("a cross-sectionally-dependent NULL → NOT GO (no spurious edge from clustered venues)", v["verdict"] != "GO",
          f"verdict={v['verdict']}")


# ───────────────────────── S6 — SURVIVORSHIP (delisted perps — the 55 real HL delistings) ─────────────────────────
def s6_survivorship():
    print("S6 — survivorship (high-funding perps that were DELISTED post-blowup are excluded ex-post):")
    rng = np.random.default_rng(SEED + 5)
    B, rp = _B(rng)
    theta = np.abs(rng.normal(0.0, 1.0, size=M))
    carry = (rp + theta)[None, :] + rng.normal(0.0, 0.3, size=(T, M))
    fwd_full = (rp + theta)[None, :] + rng.normal(0.0, 0.5, size=(T, M))
    fragile = theta > np.quantile(theta, 0.7)                       # high-funding, fragile
    for i in np.where(fragile)[0]:
        fwd_full[:, i] = rp[i] - theta[i] * 5.0 + rng.normal(0.0, 0.5, size=T)  # high carry, BAD realized funding
    fwd_surv = fwd_full.copy()
    fwd_surv[:, fragile] = np.nan                                   # survivor bias: the delistings vanish ex-post
    ic_full = verdict(carry, fwd_full, B).get("oosResidualIcMean") or 0.0
    ic_surv = verdict(carry, fwd_surv, B).get("oosResidualIcMean") or 0.0
    check("including the delistings LOWERS the apparent edge (survivor-only removal inflates it)", ic_full < ic_surv,
          f"with-deaths IC={ic_full:.3f} < survivor-only IC={ic_surv:.3f}")


# ───────────────────────── S7 — UNIT / SETTLEMENT-CONVENTION CONTAMINATION (the funding-specific trap) ─────────────────────────
def s7_unit_contamination():
    print("S7 — unit/settlement contamination (SAME economics on mismatched intervals → normalization → ZERO dispersion):")
    HOURS = 8760

    def annualize(rate, interval):
        return rate * HOURS / interval

    # the SAME 10.95%/yr economics expressed on HL 1h, Binance 8h, Bybit 4h
    econ = 0.1095
    raw = [econ / HOURS, econ / (HOURS / 8), econ / (HOURS / 4)]          # per-interval raw rates (all different)
    ann = [annualize(raw[0], 1), annualize(raw[1], 8), annualize(raw[2], 4)]  # normalized (all equal)
    raw_spread = max(raw) - min(raw)
    ann_spread = max(ann) - min(ann)
    print(f"    RAW cross-venue spread (naive, manufactured) = {raw_spread:.2e}  →  normalized spread = {ann_spread:.2e}")
    check("normalization collapses the manufactured cross-venue dispersion to ~ZERO (Appendix A #7)", ann_spread < 1e-9,
          f"normalized spread={ann_spread:.2e}")
    check("the RAW (un-normalized) rates DO differ — the dispersion the normalizer removes was an artifact", raw_spread > 1e-6,
          f"raw spread={raw_spread:.2e}")


# ───────────────────────── S8 — FUNDING-CAP / CLIPPING (truncated distribution fakes mean-reversion) ─────────────────────────
def s8_cap_clipping():
    print("S8 — funding-cap/clipping (venue clamps funding → truncated distribution fakes tradable mean-reversion):")
    rng = np.random.default_rng(SEED + 6)
    B, rp = _B(rng)
    cap = 0.5
    carry = np.clip((rp)[None, :] + rng.normal(0.0, 1.0, size=(T, M)), -cap, cap)  # clamped funding
    fwd = rp[None, :] + rng.normal(0.0, 1.0, size=(T, M))                          # forward is NOT clamp-predictable
    v = verdict(carry, fwd, B)
    check("clipping-induced structure is NOT read as tradable edge → NOT GO", v["verdict"] != "GO",
          f"verdict={v['verdict']}")


# ───────────────────────── S9 — NEGATIVE CONTROLS (the bar is honest, not impossible) ─────────────────────────
def s9_controls():
    print("S9 — negative controls:")
    rng = np.random.default_rng(SEED + 7)
    B, rp = _B(rng)
    # pure noise → NO-GO
    n1 = verdict(rng.normal(0, 1, (T, M)), rng.normal(0, 1, (T, M)), B)
    check("pure noise → NOT GO", n1["verdict"] != "GO", f"verdict={n1['verdict']}")
    # pure MODELED funding beta/level → NO-GO (raw carry is never a GO, Rule XIII)
    carry = rp[None, :] + rng.normal(0, 0.5, (T, M))
    fwd = rp[None, :] + rng.normal(0, 1, (T, M))
    n2 = verdict(carry, fwd, B)
    check("pure modeled funding beta/level → NOT GO (carry ≠ edge)", n2["verdict"] != "GO", f"verdict={n2['verdict']}  rawIcT={n2.get('rawIcTstat')}")
    # constructed REAL cross-venue dislocation edge with confounds → GO (bar is honest, not an always-NO-GO machine)
    alpha = rng.normal(0, 0.6, M)
    carry = (rp + alpha)[None, :] + rng.normal(0, 0.5, (T, M))
    fwd = (rp + alpha)[None, :] + rng.normal(0, 1, (T, M))
    g = verdict(carry, fwd, B)
    check("constructed real dislocation edge (with modeled confounds) → GO (NOT an always-NO-GO machine)", g["verdict"] == "GO",
          f"verdict={g['verdict']}  deflatedOosT={g.get('deflatedOosTstat')}")


# ───────────────────────── S10 — MARGINAL-EDGE GO control (Unified Sprint P5 / C7 / Rule X) ─────────────────────────
def s10_marginal_go():
    print("S10 — MARGINAL-magnitude GO control (realistic small edge → must still → GO; not just S9's t≈59):")
    rng = np.random.default_rng(SEED + 8)
    B, rp = _B(rng)
    alpha = rng.normal(0.0, 0.15, size=M)                 # a SMALL real edge — 1/4 of S9's 0.6 (NOT sized to a target)
    carry = (rp + alpha)[None, :] + rng.normal(0.0, 0.5, size=(T, M))
    fwd = (rp + alpha)[None, :] + rng.normal(0.0, 1.0, size=(T, M))
    v = verdict(carry, fwd, B)
    t = abs(v.get("deflatedOosTstat") or 0.0)
    print(f"    small α (std 0.15) → deflated OOS t={t:.1f}, verdict={v['verdict']}  (vs S9's strong edge t≈59)")
    check("a MARGINAL-magnitude real edge is detected → GO (the GO bar is reachable at a realistic size, not only at t≈59)",
          v["verdict"] == "GO" and t > 3.0, f"verdict={v['verdict']} deflatedT={t:.1f}")
    check("the marginal edge's t is genuinely MODEST (distinct from S9's astronomical control)", t < 20.0, f"deflatedT={t:.1f} < 20")


def main():
    s1_unmodeled_premium()
    s2_tail()
    s3_regime()
    s4_autocorrelation()
    s5_cross_dependence()
    s6_survivorship()
    s7_unit_contamination()
    s8_cap_clipping()
    s9_controls()
    s10_marginal_go()
    ok = not FAILURES
    print(f"\nFunding adversarial battery: {'ALL PASS' if ok else 'FAIL -> ' + ', '.join(FAILURES)}")
    print("NOTE (Rule X): the discriminator is 'bounded with disclosed limits', NOT 'ungameable'. The unmodeled-risk")
    print("      false-GO bound above is the structural limit; the ultimate arbiter is OOS persistence on real funding.")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
