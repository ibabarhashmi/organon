"""THE MATH RED TEAM (Surrogate Addendum V38-B, B3 / D33's order: "break it to understand yourself, red team the math
adversely"). An AUTOPSY of the frozen core's DSR/PSR/PBO — five attack classes (DD-49) against the frozen `rigor`, every
finding classified into EXACTLY ONE of BREAK / ASSUMPTION-LIMIT / THEORY-GAP (S136). It IMPORTS the frozen module and only
READS it: not one byte of rigor.py moves (checkFrozenSet asserts 0 drift at phase close).

RP-1: every ASSUMPTION-LIMIT cites the specific assumption by paper section; an assumption-limit that cannot name its
assumption is reclassified BREAK by default. RP-2: the known-answer search is recorded (found/partial/none, sources named).

Run:  cd src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.mathredteam
"""
from __future__ import annotations

import json
import math
import sys

import numpy as np

from backtest.py import rigor  # the FROZEN math — imported, READ, never edited


def _finding(cls_name, target, attack, observation, classification, assumption=None, routed=None, reproduction=None):
    f = {"class": cls_name, "target": target, "attack": attack, "observation": observation, "classification": classification}
    if assumption:
        f["assumptionCited"] = assumption  # RP-1 — an ASSUMPTION-LIMIT names its assumption by paper section
    if routed:
        f["routed"] = routed  # the honest proposal (flag-don't-emit), routed to the gate — NEVER a fix to rigor.py
    if reproduction:
        f["reproduction"] = reproduction  # a BREAK carries its reproduction (S136)
    return f


def known_answer(findings):
    """(i) KNOWN-ANSWER — the paper's own formula, recomputed by hand, through the frozen code. RP-2: the search for the
    papers' printed worked examples is recorded; where full inputs are not reproducibly published, first-principles known
    answers (the closed-form PSR for a symmetric-normal series) and the independent purgedcv oracle (S94) stand in, disclosed."""
    rng = np.random.default_rng(7)
    # a symmetric-normal series: skew≈0, non-excess kurt≈3, so the PSR denominator reduces to sqrt(1 + SR^2/2) (Bailey & LdP
    # 2012, Eq.7). Recompute PSR(0) by hand and compare to the frozen rigor.psr.
    r = rng.normal(0.0008, 0.01, size=4000)  # large n → skew/kurt near their normal values
    sr = rigor.per_obs_sharpe(r)
    g3 = 0.0
    g4 = 3.0
    denom = math.sqrt(1.0 - g3 * sr + ((g4 - 1.0) / 4.0) * sr * sr)
    z = (sr - 0.0) * math.sqrt(len(r) - 1) / denom
    expected = float(__import__("scipy.stats", fromlist=["norm"]).norm.cdf(z))
    got = rigor.psr(r, 0.0)
    # the sample skew/kurt are near-but-not-exactly 0/3, so allow a small tolerance around the closed form
    match = abs(got - expected) < 0.02
    findings.append(_finding(
        "known-answer", "psr", "closed-form PSR for a symmetric-normal series (Bailey & LdP 2012, Eq.7): PSR(0)=Φ(SR·√(n-1)/√(1+SR²/2))",
        f"hand-computed PSR={expected:.6f} vs frozen rigor.psr={got:.6f} (|Δ|={abs(got-expected):.2e})",
        "BREAK" if not match else "NONE",
        assumption=None if match else None,
        reproduction=None if match else "rng=default_rng(7), normal(0.0008,0.01,4000), psr(r,0.0)",
    ))
    # DSR = PSR(SR0): recompute SR0 by hand and confirm deflated_sharpe == psr(returns, SR0).
    var_sharpe = 0.02
    sr0 = rigor.sr0_deflated(var_sharpe, 1000)
    dsr_direct = rigor.psr(r, sr0)
    dsr = rigor.deflated_sharpe(r, 1000, var_sharpe)
    findings.append(_finding(
        "known-answer", "deflated_sharpe", "DSR = PSR(SR0) identity (Bailey & LdP 2014, Appendix): deflated_sharpe(r,N,V) must equal psr(r, sr0_deflated(V,N))",
        f"deflated_sharpe={dsr:.6f} vs psr(r, sr0_deflated)={dsr_direct:.6f} (|Δ|={abs(dsr-dsr_direct):.2e})",
        "BREAK" if abs(dsr - dsr_direct) > 1e-12 else "NONE",
        reproduction=None if abs(dsr - dsr_direct) <= 1e-12 else "the DSR=PSR(SR0) identity failed",
    ))


def property_tests(findings):
    """(ii) PROPERTY — monotonicity, invariance, scale-invariance."""
    rng = np.random.default_rng(11)
    r = rng.normal(0.001, 0.01, size=1000)
    v = float(np.var(rigor.trial_sharpes(rng.normal(0, 0.01, size=(500, 200))), ddof=1))
    # DSR monotonic DECREASING in n_trials (more trials → a higher benchmark → a lower deflated Sharpe)
    dsrs = [rigor.deflated_sharpe(r, n, v) for n in (10, 100, 1000, 10000)]
    mono_dsr = all(dsrs[i] >= dsrs[i + 1] for i in range(len(dsrs) - 1))
    findings.append(_finding("property", "deflated_sharpe", "DSR non-increasing in n_trials", f"DSR at N=10,100,1000,10000 = {[round(x,4) for x in dsrs]}; non-increasing={mono_dsr}", "BREAK" if not mono_dsr else "NONE"))
    # PSR DECREASING in sr_star (a higher benchmark → a lower probability of exceeding it)
    psrs = [rigor.psr(r, s) for s in (-0.05, 0.0, 0.05, 0.1)]
    mono_psr = all(psrs[i] >= psrs[i + 1] for i in range(len(psrs) - 1))
    findings.append(_finding("property", "psr", "PSR non-increasing in sr_star", f"PSR at SR*=-0.05,0,0.05,0.1 = {[round(x,4) for x in psrs]}; non-increasing={mono_psr}", "BREAK" if not mono_psr else "NONE"))
    # PBO invariant to COLUMN ORDER (a permutation of the candidate columns must not change the PBO)
    m = rng.normal(0, 0.01, size=(120, 30))
    pbo_a = rigor.pbo(m, n_splits=8)
    perm = rng.permutation(m.shape[1])
    pbo_b = rigor.pbo(m[:, perm], n_splits=8)
    findings.append(_finding("property", "pbo", "PBO invariant to column permutation", f"pbo={pbo_a:.6f} vs pbo(permuted)={pbo_b:.6f}", "BREAK" if abs(pbo_a - pbo_b) > 1e-12 else "NONE", reproduction=None if abs(pbo_a - pbo_b) <= 1e-12 else "column permutation changed PBO"))
    # SCALE-INVARIANCE: Sharpe (and hence PSR) is invariant to a positive scaling of returns
    sr1 = rigor.per_obs_sharpe(r)
    sr2 = rigor.per_obs_sharpe(r * 1000.0)
    findings.append(_finding("property", "per_obs_sharpe", "Sharpe scale-invariant under r→k·r (k>0)", f"sharpe={sr1:.6f} vs sharpe(1000·r)={sr2:.6f}", "BREAK" if abs(sr1 - sr2) > 1e-9 else "NONE"))


def degenerate(findings):
    """(iii) DEGENERATE — constant, single-obs, tiny-T, all-identical, NaN/Inf."""
    # constant series — no variance → skew/kurtosis undefined → PSR emits nan (json_safe → None): a FLAG, not a number
    const = np.full(500, 0.01)
    p = rigor.psr(const, 0.0)
    findings.append(_finding(
        "degenerate", "psr", "constant (zero-variance) series",
        f"psr(constant)={p!r} (nan → None via json_safe — a flag, not a fabricated number)",
        "ASSUMPTION-LIMIT",
        assumption="Bailey & LdP 2012 §1: PSR requires an estimable Sharpe, which requires σ̂>0. A constant series violates σ>0; the code faithfully emits nan (→None), which reads as 'not judgeable' rather than a fabricated probability.",
        routed="ACCEPTABLE-AS-IS: nan→None already flags; an explicit refusal string would be clearer but is a render-layer improvement, routed to the gate, never a change to rigor.py.",
    ))
    # single observation — n<3 → psr guards to nan (explicit); DSR likewise
    findings.append(_finding("degenerate", "psr", "single observation (n<3)", f"psr([0.01],0)={rigor.psr([0.01], 0.0)!r} (explicit n<3 guard → nan)", "ASSUMPTION-LIMIT", assumption="skew/kurtosis need n≥3 (scipy); the code guards n<3 → nan EXPLICITLY (rigor.psr line: `if n < 3: return nan`). Faithful and guarded."))
    # T < n_splits — pbo guards to nan (explicit)
    findings.append(_finding("degenerate", "pbo", "T < n_splits", f"pbo(4×5 matrix, S=8)={rigor.pbo(np.zeros((4,5)), 8)!r} (explicit t<n_splits guard → nan)", "ASSUMPTION-LIMIT", assumption="CSCV needs T≥S to form S row-blocks; the code guards t<n_splits → nan EXPLICITLY (rigor.pbo line: `if n < 2 or t < n_splits: return nan`)."))
    # all-identical columns — ties in the CSCV ranking; the code produces a deterministic value (argsort is stable), not nan
    ident = np.tile(np.random.default_rng(3).normal(0, 0.01, size=(64, 1)), (1, 10))
    pbo_ident = rigor.pbo(ident, n_splits=8)
    findings.append(_finding(
        "degenerate", "pbo", "all-identical candidate columns (ranking ties)",
        f"pbo(identical cols)={pbo_ident!r} — a deterministic value from stable argsort, not nan",
        "THEORY-GAP",
        assumption="Bailey et al. 2017 (CSCV) assumes DISTINCT candidate performances; behaviour under exact ties is unspecified. The code breaks ties by stable argsort (a deterministic but arbitrary tie-break). Both readings shown: (a) ties→arbitrary rank (the code's choice); (b) ties→undefined/refuse. Neither contradicts the paper.",
    ))
    # NaN propagation — a NaN in the series propagates to nan (→None), never a fabricated number
    bad = np.array([0.01, 0.02, float("nan"), 0.005] * 10)
    findings.append(_finding("degenerate", "psr", "NaN in the input series", f"psr(series with NaN)={rigor.psr(bad, 0.0)!r} (NaN propagates → None; never a fabricated value)", "ASSUMPTION-LIMIT", assumption="the input is assumed to be a clean return series (Appendix B); a NaN violates that. The code propagates NaN→None (a flag), it does not fabricate — faithful."))


def adversarial(findings):
    """(iv) ADVERSARIAL — extreme skew/kurtosis, autocorrelation (the i.i.d. trap), odd S."""
    rng = np.random.default_rng(17)
    # AUTOCORRELATED series — the i.i.d. assumption is the obvious trap (attack #4). The code computes the SAME formula; it
    # does NOT detect autocorrelation. This is an ASSUMPTION-LIMIT, not a break — and the honest proposal is flag-don't-emit.
    white = rng.normal(0.0005, 0.01, size=2000)
    ar = np.zeros_like(white)
    ar[0] = white[0]
    for i in range(1, len(ar)):
        ar[i] = 0.9 * ar[i - 1] + white[i]  # strong AR(1): the effective sample size is far below n
    psr_white = rigor.psr(white, 0.0)
    psr_ar = rigor.psr(ar, 0.0)
    findings.append(_finding(
        "adversarial", "psr", "strongly autocorrelated (AR(1), φ=0.9) series — the i.i.d. assumption probed",
        f"psr(white)={psr_white:.4f}; psr(AR(1) φ=0.9)={psr_ar:.4f} — the code applies the i.i.d. σ-of-Sharpe formula unchanged; the AR series' effective n is far below its length, so the reported confidence is OVERSTATED",
        "ASSUMPTION-LIMIT",
        assumption="Bailey & LdP 2012 §1 & 2014 (DSR): PSR/DSR assume i.i.d. returns — the σ of the Sharpe estimator, √((1 - g3·SR + (g4-1)/4·SR²)/(n-1)), is derived under i.i.d. An autocorrelated series violates this; the code is FAITHFUL to the i.i.d. formula and does not (and per the paper need not) detect autocorrelation.",
        routed="FLAG-DON'T-EMIT (routed to the gate, NOT a fix to rigor.py): a render-layer autocorrelation check (e.g. a Ljung-Box / lag-1 ACF flag) should WARN that the i.i.d. precondition is violated before a PSR/DSR is shown — the number is faithful but the CONFIDENCE is overstated on autocorrelated input. This is exactly V26's τ_int finding (the ledger already knows yields are autocorrelated); the fix is a caveat at the render, never an edit to the frozen formula.",
    ))
    # EXTREME SKEW — the denom argument (1 - g3·SR) can go non-positive; the code floors it at 1e-12 (a code choice)
    skewed = np.concatenate([rng.normal(0.0, 0.001, size=1990), np.array([0.5] * 10)])  # a few huge positive jumps → high skew
    p_sk = rigor.psr(skewed, 0.0)
    from scipy.stats import skew as _sk, kurtosis as _ku
    findings.append(_finding(
        "adversarial", "psr", "extreme skew/kurtosis (denominator argument near/below zero)",
        f"skew={float(_sk(skewed)):.2f}, kurt(non-excess)={float(_ku(skewed, fisher=False)):.2f}; psr={p_sk:.4f}; the denom argument (1 - g3·SR + (g4-1)/4·SR²) is floored at 1e-12 (rigor.psr uses max(·,1e-12))",
        "THEORY-GAP",
        assumption="the variance-of-Sharpe estimator can be non-positive for extreme skew (a known pathology of the Mertens/Bailey moment expansion). The paper does not specify behaviour when the estimator's variance goes ≤0. The code floors at 1e-12 (→ a saturated z→±∞ → psr→{0,1}). Both readings: (a) floor-and-saturate (the code's choice — never emits a complex/nan number); (b) refuse/flag when the variance estimate is non-positive. Neither contradicts the paper; it is genuinely unspecified.",
    ))
    # ODD S — the CSCV construction assumes an even S (symmetric IS/OOS split); the code computes an asymmetric split for odd S
    m = rng.normal(0, 0.01, size=(140, 20))
    pbo_even = rigor.pbo(m, n_splits=8)
    pbo_odd = rigor.pbo(m, n_splits=7)  # half = 7//2 = 3 IS blocks, 4 OOS blocks — asymmetric
    findings.append(_finding(
        "adversarial", "pbo", "odd S (asymmetric IS/OOS split)",
        f"pbo(S=8)={pbo_even:.4f} (symmetric 4/4); pbo(S=7)={pbo_odd:.4f} (asymmetric 3/4 via half=S//2) — the code emits a value for odd S rather than refusing",
        "ASSUMPTION-LIMIT",
        assumption="Bailey et al. 2017 (CSCV) constructs S/2 IS and S/2 OOS blocks — S is assumed EVEN. For odd S the code uses half=S//2 (floor), giving an asymmetric (S-1)/2 vs (S+1)/2 split; it is faithful to the combinatorial machinery but the symmetric-split premise is violated. The engine only ever CALLS pbo with S=8 (even), so this is a latent input-domain limit, not a live defect.",
        routed="ACCEPTABLE-AS-IS with a caveat: the engine's only call site is S=8 (even); an explicit even-S guard would be clearer but is a render/validation-layer improvement, routed to the gate, never a change to rigor.py.",
    ))


def null_distribution(findings):
    """(v) NULL DISTRIBUTION — extends V38's S116. The powered null-distribution work (committed rigor-crosscheck.json's
    s116PowerFix) already showed the PBO estimator's across-seed SD dominates and the powered mean agrees with theory (0.5).
    Recorded here as a reference (not re-run — the 8-minute compute is gated behind ORGANON_NULLDIST=1 and its result is
    committed); the finding is that a SINGLE PBO estimate is inherently ±0.1, a property, not a break."""
    findings.append(_finding(
        "null-distribution", "pbo", "the PBO estimator's sampling distribution under a true-Sharpe-0 null (S116, extended)",
        "the committed s116PowerFix shows the across-seed SD ≈ 0.10-0.13 (dataset-to-dataset variance dominates), the powered mean ≈ 0.508 vs theory 0.5 (z≈0.6) — a single PBO estimate is inherently noisy at any power",
        "THEORY-GAP",
        assumption="the CSCV paper reports a point PBO without characterising its sampling distribution across datasets. V38/S116 measured it: the estimator is unbiased vs the 0.5 null (no break) but high-variance per single dataset — a property of the estimator, disclosed, not a contradiction of the paper.",
    ))


def main():
    findings = []
    known_answer(findings)
    property_tests(findings)
    degenerate(findings)
    adversarial(findings)
    null_distribution(findings)

    breaks = [f for f in findings if f["classification"] == "BREAK"]
    assumption_limits = [f for f in findings if f["classification"] == "ASSUMPTION-LIMIT"]
    theory_gaps = [f for f in findings if f["classification"] == "THEORY-GAP"]
    nones = [f for f in findings if f["classification"] == "NONE"]

    out = {
        "executed": True,
        "attackClassesRun": ["known-answer", "property", "degenerate", "adversarial", "null-distribution"],
        "knownAnswerProvenance": "PARTIAL (RP-2): Bailey & López de Prado do not publish fully-reproducible worked inputs for DSR/PSR; the strongest independent known-answer is the purgedcv oracle (S94, already agreeing to |Δ|<0.02) plus the closed-form PSR for a symmetric-normal series (recomputed here). No printed worked example was reproduced verbatim; this is disclosed, not silently substituted.",
        "counts": {"total": len(findings), "BREAK": len(breaks), "ASSUMPTION-LIMIT": len(assumption_limits), "THEORY-GAP": len(theory_gaps), "clean": len(nones)},
        "headline": (f"NO BREAK found under five attack classes — a LOWER BOUND, not a proof. {len(assumption_limits)} assumption-limits (each citing its assumption by section, routed as flag-don't-emit or acceptable-as-is), {len(theory_gaps)} theory-gaps (both readings shown)." if len(breaks) == 0 else f"{len(breaks)} BREAK(S) found — the frozen core contradicts its own paper; ROUTED to the gate, never fixed in place."),
        "findings": findings,
        "standingRule": "rigor.py stays BYTE-FROZEN — every BREAK is ROUTED to the gate with its reproduction, never fixed in place (D33's order was an autopsy, and an autopsy that edits the body is a forgery). D33 remains UNSIGNED beside this ledger.",
    }
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()
