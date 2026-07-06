"""ORGΛNON Lending-Carry — the risk-premium golden-noise SIBLING (blueprint Phase 2 / Rule VIII / Appendix B).

A NEW test fixture that runs ALONGSIDE the sacred golden-noise self-test (selftest.py is left byte-identical;
this is a separate, parallel gate). It enforces the lending analog of "significance ≠ edge":

  (1) PURE RISK PREMIUM  — a synthetic panel whose carry is CONSTRUCTED to be entirely explained by risk-factor
      loadings MUST be flagged NO-GO. And the killer proof: RAW carry IS cross-sectionally predictive of forward
      return (it looks like edge), while the NEUTRALIZED residual is NOT. If the discriminator ever blesses pure
      risk premium, the eval layer is broken → Halt.
  (2) CONSTRUCTED RESIDUAL EDGE — a synthetic with a real residual alpha (independent of the risk factors) MUST be
      detected as GO. (The skeptic must be able to say a correct YES, or every NO is worthless — Rule IX.)
  (3) SHORT PANEL — too few periods MUST return INSUFFICIENT-EVIDENCE (the honest forward-only outcome).
  (4) DETERMINISM — same seed → byte-identical residuals.

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.selftest_lending
"""
from __future__ import annotations

import sys

import numpy as np

from backtest.py import neutralize

SEED = 20260630
M = 120          # markets
K = 4            # risk factors (depeg, protocol, liquidity, duration)
T = 252          # ~1y of daily cross-sections
K_UNIVERSES = 8  # robustness: require the property to hold across independent universes
LAMBDA = np.array([0.4, 0.3, 0.2, 0.1])  # fixed positive risk prices

FAILURES: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> bool:
    print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
    if not cond:
        FAILURES.append(name)
    return cond


def _panel(rng, edge: bool):
    """Build (carry, forward, loadings). carry & forward share the SAME risk premium B·λ (you are paid for risk).
    If edge: add a market-specific alpha (independent of the factors) that drives residual carry AND forward."""
    B = np.abs(rng.normal(0.0, 1.0, size=(M, K)))      # non-negative risk-factor loadings
    rp = B @ LAMBDA                                     # per-market risk premium (the carry you earn for risk)
    alpha = rng.normal(0.0, 0.6, size=M) if edge else np.zeros(M)  # residual edge, independent of B
    carry_noise = rng.normal(0.0, 0.5, size=(T, M))
    fwd_noise = rng.normal(0.0, 1.0, size=(T, M))
    carry = rp[None, :] + alpha[None, :] + carry_noise          # what each market charges over time
    forward = rp[None, :] + alpha[None, :] + fwd_noise          # what it realizes (excess) next period
    return carry, forward, B


def risk_premium_test():
    print("risk-premium sibling (the heart — carry ≠ edge):")
    rng = np.random.default_rng(SEED)
    null_no_go = 0
    raw_predictive = 0
    for k in range(K_UNIVERSES):
        carry, forward, B = _panel(rng, edge=False)  # PURE risk premium: no residual alpha
        out = neutralize.discriminate({"carry": carry.tolist(), "forward": forward.tolist(),
                                       "loadings": B.tolist(), "minPeriods": 60})
        if out["verdict"] == "NO-GO":
            null_no_go += 1
        if (out.get("rawIcTstat") or 0) > neutralize.T_GATE:
            raw_predictive += 1
        if k == 0:
            check("pure risk premium → NO-GO (residual carry is not edge)", out["verdict"] == "NO-GO",
                  f"verdict={out['verdict']} oosResidT={out.get('oosResidualIcTstat'):.2f}")
            # THE killer proof: raw carry LOOKS predictive; neutralization strips the risk premium away.
            check("…but RAW carry IS cross-sectionally predictive (so neutralization is doing real work)",
                  (out.get("rawIcTstat") or 0) > neutralize.T_GATE,
                  f"rawIcT={out.get('rawIcTstat'):.2f} > {neutralize.T_GATE}  residualIcT={out.get('residualIcTstat'):.2f}")
    check(f"pure risk premium → NO-GO across ALL K={K_UNIVERSES} universes", null_no_go == K_UNIVERSES,
          f"{null_no_go}/{K_UNIVERSES} NO-GO")
    check(f"raw carry predictive in ALL K={K_UNIVERSES} (the trap the discriminator must resist)",
          raw_predictive == K_UNIVERSES, f"{raw_predictive}/{K_UNIVERSES} raw-predictive")


def residual_edge_test():
    print("residual-edge detection (the skeptic can say a correct YES):")
    rng = np.random.default_rng(SEED + 7)
    detected = 0
    for k in range(K_UNIVERSES):
        carry, forward, B = _panel(rng, edge=True)  # real residual alpha
        out = neutralize.discriminate({"carry": carry.tolist(), "forward": forward.tolist(),
                                       "loadings": B.tolist(), "minPeriods": 60})
        if out["verdict"] == "GO":
            detected += 1
        if k == 0:
            check("constructed residual edge → GO (detected)", out["verdict"] == "GO",
                  f"verdict={out['verdict']} oosResidT={out.get('oosResidualIcTstat'):.2f} mean={out.get('oosResidualIcMean'):.3f}")
    check(f"residual edge detected across ALL K={K_UNIVERSES} universes", detected == K_UNIVERSES,
          f"{detected}/{K_UNIVERSES} GO")


def insufficient_evidence_test():
    print("short panel → INSUFFICIENT-EVIDENCE (the honest forward-only outcome):")
    rng = np.random.default_rng(SEED + 99)
    B = np.abs(rng.normal(0.0, 1.0, size=(M, K)))
    rp = B @ LAMBDA
    carry = rp[None, :] + rng.normal(0.0, 0.5, size=(5, M))
    forward = rp[None, :] + rng.normal(0.0, 1.0, size=(5, M))
    out = neutralize.discriminate({"carry": carry.tolist(), "forward": forward.tolist(),
                                   "loadings": B.tolist(), "minPeriods": 90})
    check("5-period panel → INSUFFICIENT-EVIDENCE", out["verdict"] == "INSUFFICIENT-EVIDENCE",
          f"verdict={out['verdict']} nPeriods={out['nPeriods']}")


def determinism_test():
    print("determinism (same seed → byte-identical residuals):")
    rng1 = np.random.default_rng(SEED)
    rng2 = np.random.default_rng(SEED)
    c1, _, b1 = _panel(rng1, edge=True)
    c2, _, b2 = _panel(rng2, edge=True)
    r1 = neutralize.neutralize(c1, b1)
    r2 = neutralize.neutralize(c2, b2)
    same = np.array_equal(np.nan_to_num(r1), np.nan_to_num(r2))
    check("neutralization is deterministic (identical residuals)", same, f"max|Δ|={np.nanmax(np.abs(r1 - r2)):.2e}")


def main():
    risk_premium_test()
    residual_edge_test()
    insufficient_evidence_test()
    determinism_test()
    ok = not FAILURES
    print(f"\nLending risk-premium sibling: {'ALL PASS' if ok else 'FAIL -> ' + ', '.join(FAILURES)}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
