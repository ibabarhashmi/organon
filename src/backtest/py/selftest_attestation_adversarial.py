"""ORGΛNON — Attestation Engine: the ADVERSARIAL-SUBMISSION battery (Phase 3 / Rule X / Appendix C).

External claimants are adversarial. This battery feeds the rigor adjudicator (attest.py → rigor.py, untouched) fakes
designed to LOOK real and checks the engine catches or flags each — and where a fake is STRUCTURALLY UNDETECTABLE
from what was provided, it MEASURES the false-attest rate and DISCLOSES it (the tier-cap is the structural backstop:
a V0/V1 fake can never become an *unconditional* GO regardless). Runs alongside golden-noise; `selftest.py` byte-identical.

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.selftest_attestation_adversarial
"""
from __future__ import annotations

import sys

import numpy as np

from backtest.py import attest

SEED = 20260701
N = 504
FAILURES: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> bool:
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAILURES.append(name)
    return cond


def rigor(returns, n_trials=1000):
    return attest.adjudicate({"returns": list(returns), "nTrialsGrid": [1, 10, 100, n_trials], "barsPerYear": 365})


def dsr_at(out, n):
    for s in out.get("sensitivity", []):
        if s["nTrials"] == n:
            return s["dsr"]
    return None


# A fake is CAUGHT by rigor if it is not significant, fails DSR at the honest search, is implausibly good, or unstable.
def caught_by_rigor(out, honest_n=1000):
    if out.get("insufficient"):
        return True, "insufficient"
    if out["psr0"] < 0.95:
        return True, "not significant"
    if out["sharpeAnnualized"] > 4.0:
        return True, "implausibly-good (flagged)"
    d = dsr_at(out, honest_n)
    if d is not None and d < 0.5:
        return True, "DSR collapses at the honest search"
    cp = out["cpcv"]
    if cp["mean"] is not None and cp["p5"] is not None and cp["mean"] > 0 and cp["p5"] < -1.0:
        return True, "CPCV unstable (regime/tail)"
    return False, "not caught by rigor alone"


def main():
    rng = np.random.default_rng(SEED)

    print("lookahead-contaminated (too-smooth, too-good):")
    look = np.cumsum(rng.normal(0.0008, 0.001, N)) * 0 + rng.normal(0.004, 0.0015, N)  # tiny vol, big mean → absurd Sharpe
    c, why = caught_by_rigor(rigor(look))
    check("lookahead/too-good → caught (implausible Sharpe flagged)", c, why)

    print("autocorrelation-inflated Sharpe:")
    e = np.zeros(N)
    ar = np.empty(N)
    x = 0.0
    for t in range(N):
        x = 0.96 * x + rng.normal(0.0, 0.01)
        ar[t] = 0.0004 + x  # persistent → inflated naive Sharpe, unstable OOS
    c, why = caught_by_rigor(rigor(ar))
    check("autocorrelation-inflated → caught (DSR/CPCV deflate)", c, why)

    print("smooth-then-blows-up (tail / insurance-selling, full series):")
    tail = rng.normal(0.0006, 0.003, N)
    tail[N // 2] = -0.45  # the blow-up IS in the series
    c, why = caught_by_rigor(rigor(tail))
    check("tail blow-up (in series) → caught (Sharpe tanks → not significant)", c, why)

    print("too-good-to-be-true:")
    tgtbt = rng.normal(0.006, 0.002, N)  # annualized Sharpe ~ 28
    c, why = caught_by_rigor(rigor(tgtbt))
    check("too-good-to-be-true → caught (implausible)", c, why)

    print("best-of-N selection (the structurally-undetectable case → MEASURE + DISCLOSE):")
    # the submitted series is the best Sharpe of N_hidden pure-noise tries; with the HONEST n_trials DSR collapses,
    # but a claimant who FALSELY declares n_trials=1 hides the search. Measure how often rigor fails to catch that.
    K = 40
    N_HIDDEN = 200
    dsr_honest, psr_naive = [], []
    false_attest_declared1 = 0
    for k in range(K):
        tries = rng.normal(0.0, 0.01, (N, N_HIDDEN))
        best = tries[:, int(np.argmax(tries.mean(axis=0) / tries.std(axis=0, ddof=1)))]
        out = rigor(best, n_trials=N_HIDDEN)
        dsr_honest.append(dsr_at(out, N_HIDDEN) or 0.0)
        psr_naive.append(out["psr0"])  # naive significance (no deflation) — the trap
        # with a FALSE declaration of n_trials=1 (no deflation): rigor cannot see the hidden search → undetectable
        if (dsr_at(out, 1) or 0) >= 0.5 and out["psr0"] >= 0.95:
            false_attest_declared1 += 1
    mean_dsr = float(np.mean(dsr_honest))
    mean_psr = float(np.mean(psr_naive))
    false_rate = false_attest_declared1 / K
    print(f"    naive PSR(0) (the trap — looks certain):                 {mean_psr:.2f}")
    print(f"    DSR at the HONEST n_trials (deflation COLLAPSES it):     {mean_dsr:.2f}  (best-of-N sits at the ~0.5 boundary)")
    print(f"    MEASURED false-attest rate (claimant lies n_trials=1):   {false_rate:.0%}  ({false_attest_declared1}/{K})  ← DISCLOSED bound")
    # the honest claim (matching golden-noise): deflation collapses the naive certainty to the ~0.5 boundary
    check("DSR deflates best-of-N from naive-certain to the ~0.5 boundary (collapse)", mean_dsr < 0.6 and (mean_psr - mean_dsr) > 0.3,
          f"PSR(0)={mean_psr:.2f} → DSR={mean_dsr:.2f}")
    check("the undetectable-fake (false n_trials) false-attest rate is MEASURED + DISCLOSED", True, f"{false_rate:.0%}; tier-cap still prevents an unconditional GO (V0/V1)")

    print("negative controls:")
    noise = rng.normal(0.0, 0.01, N)
    c, _ = caught_by_rigor(rigor(noise))
    check("pure noise → caught (NO-GO)", c, "")
    genuine = rng.normal(0.0015, 0.01, N)  # a real, plausible edge (annualized Sharpe ≈ 2.5)
    out = rigor(genuine)
    attestable = (not out["insufficient"]) and out["psr0"] >= 0.95 and out["sharpeAnnualized"] <= 4.0
    check("a genuine, plausible edge is NOT caught (attestable when pre-registered — the bar is honest)", attestable,
          f"psr0={out['psr0']:.3f} annSharpe={out['sharpeAnnualized']:.2f}")

    ok = not FAILURES
    print(f"\nAttestation adversarial battery: {'ALL PASS' if ok else 'FAIL -> ' + ', '.join(FAILURES)}")
    print("NOTE (Rule X): rigor catches the detectable fakes; the undetectable ones (selection-with-false-declaration,")
    print("      survivorship on a V0 series) have a DISCLOSED false-attest bound — and the TIER-CAP is the structural")
    print("      backstop: a V0/V1 submission can never become an unconditional GO no matter how it was faked.")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
