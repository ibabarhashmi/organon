"""W1.75 Phase 2 — the gated depressed-price exit (price-mark), end-to-end in the accrual loop.

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.test_pricemark

Constructs a 2-leg strategy (RISK + SAFE) with a synthetic mid-window depeg on RISK and a
pegExit rule, and checks:
  A. qualified depeg (gated redemption) -> a REAL equity drawdown sized to the haircut;
  B. redeemable depeg (instant redemption) -> NO drawdown (exits at NAV, no haircut);
  C. no breach (peg flat) -> byte-identical to the same job with NO peg plumbing at all
     (the no-breach path is unperturbed by the W1.75 inputs);
  plausibility: the haircut ~ the peg deviation (a 1500bps depeg -> ~15% mark, not 50%).
"""
import sys

from backtest.py.accrual import run_accrual

DAY = 86_400_000
T0 = 1_700_000_000_000 // DAY * DAY  # aligned to a UTC-day boundary, fixed (no wall-clock)
N = 60
DEPEG_DAY = 30
APY = 5.0  # flat 5% apyBase for both legs
DEPEG_PRICE = 0.85  # 1500bps depeg


def daily(value_fn):
    return [[T0 + i * DAY, value_fn(i)] for i in range(N)]


def risk_peg(i):
    return 1.0 if i < DEPEG_DAY else DEPEG_PRICE


FLAT_PEG = [[T0 + i * DAY, 1.0] for i in range(N)]
APY_SERIES = daily(lambda i: APY)
TURN = daily(lambda i: 1e9)  # deep turnover so slippage is ~0 even when costs are on


def make_job(*, risk_freq, risk_delay, peg_marks, peg_obs):
    """peg_marks / peg_obs: a series ([[ts,price]]) or None to omit that input entirely."""
    risk_series = {"apyBase": APY_SERIES, "turnover": TURN}
    if peg_obs is not None:
        risk_series["peg"] = peg_obs  # what _allowed_legs/pegExit reads
    risk_leg = {
        "id": "RISK",
        "series": risk_series,
        "redemption": {"delayDays": risk_delay, "frequency": risk_freq},
    }
    if peg_marks is not None:
        risk_leg["pegMark"] = peg_marks  # what qualified_breach/haircut reads
    return {
        "seed": 0,
        "capitalUsd": 1_000_000,
        "window": {"start": T0, "end": T0 + (N - 1) * DAY},
        "legs": [
            risk_leg,
            {"id": "SAFE", "series": {"apyBase": APY_SERIES, "turnover": TURN}, "redemption": {"delayDays": 0, "frequency": "instant"}},
        ],
        "spec": {
            "family": "rwa-allocation",
            "legs": [{"id": "RISK", "weight": 1.0}, {"id": "SAFE", "weight": 0.0}],
            "rebalance": {"trigger": "monthly"},
            "policy": "static",
            "constraints": {"pegExitBps": 100},  # exit RISK when its peg dev > 100bps
        },
        # zero costs -> the drawdown is the price-mark haircut alone (clean plausibility check)
        "costs": {"gasUsd": 0, "feeBps": 0, "slippageModel": "sqrt", "slippageK": 0.0},
        "benchmarks": {},
        "nTrials": 1,
    }


def maxdd(curve):
    peak = -1e18
    dd = 0.0
    for _, v in curve:
        peak = max(peak, v)
        dd = min(dd, v / peak - 1.0)
    return dd


def final(curve):
    return curve[-1][1]


def main():
    depeg = [[T0 + i * DAY, risk_peg(i)] for i in range(N)]

    # A. QUALIFIED breach: deep depeg + GATED redemption (weekly/5) + pegExit fires
    a = run_accrual(make_job(risk_freq="weekly", risk_delay=5, peg_marks=depeg, peg_obs=depeg))
    # B. REDEEMABLE depeg: same depeg but INSTANT redemption -> qualified_breach False (NAV exit)
    b = run_accrual(make_job(risk_freq="instant", risk_delay=0, peg_marks=depeg, peg_obs=depeg))
    # C. NO breach: peg flat at par -> nothing exits, nothing marks
    c = run_accrual(make_job(risk_freq="weekly", risk_delay=5, peg_marks=FLAT_PEG, peg_obs=FLAT_PEG))
    # D. NO peg plumbing at all (the genuine W1.5 shape) -> must equal C byte-for-byte
    d = run_accrual(make_job(risk_freq="weekly", risk_delay=5, peg_marks=None, peg_obs=None))

    ca, cb, cc, cd = a["equity_curve"], b["equity_curve"], c["equity_curve"], d["equity_curve"]
    dd_a, dd_b = maxdd(ca), maxdd(cb)
    loss_a = 1.0 - final(ca) / final(cc)  # realized loss of the breached run vs the calm run

    checks = []
    # A: a real drawdown ~ the 1500bps (15%) haircut
    checks.append(("A qualified breach -> real drawdown ~15%", -0.16 <= dd_a <= -0.14))
    # plausibility: the haircut tracks the deviation (15%), nowhere near 50%
    checks.append(("A haircut ~ peg deviation (not exaggerated)", 0.135 <= loss_a <= 0.16))
    # B: redeemable depeg -> NAV exit, no material drawdown
    checks.append(("B redeemable depeg -> no drawdown", dd_b > -0.005))
    # B vs A: the breach run loses materially more than the redeemable run
    checks.append(("A loses materially more than B", final(ca) < final(cb) - 0.10))
    # C == D byte-for-byte: the no-breach path is unperturbed by the peg inputs
    same_cd = len(cc) == len(cd) and all(x == y for x, y in zip(cc, cd))
    checks.append(("C (peg flat) == D (no peg) byte-identical", same_cd))
    # C itself shows no drawdown (pure accrual)
    checks.append(("C no-breach -> no drawdown", maxdd(cc) >= -1e-12))

    allok = True
    print(f"  dd_A={dd_a:.4f}  final_A={final(ca):.5f}  final_B={final(cb):.5f}  final_C={final(cc):.5f}  loss_A={loss_a:.4f}")
    for name, ok in checks:
        print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
        allok = allok and ok
    print(f"\nPhase 2 price-mark: {'ALL PASS' if allok else 'FAIL'}")
    sys.exit(0 if allok else 1)


if __name__ == "__main__":
    main()
