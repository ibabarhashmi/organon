"""ORGΛNON Funding-Carry — DELTA-NEUTRAL hedge cost model (Blueprint Phase 3 / Appendix D / Rule VIII).

PARALLEL to accrual.py + lending_accrual.py (their math is NOT touched — Rule VII). A delta-neutral funding harvest
(long spot + short perp, or the reverse) earns the funding it receives, MINUS the mechanical cost of RUNNING the
position. Gross funding is never mistaken for net edge (the funding analog of lending's withdrawal-cost hole).

The cost is MECHANICAL, not tuned (Appendix D):
  • perp taker/maker fee × the notional re-hedged at each rebalance;
  • the spot/hedge-leg acquisition (or borrow) cost, once at entry;
  • FUNDING PAID during NEGATIVE-funding windows — the tail cost the short leg bears when funding flips negative
    (the Oct-2025 deleveraging tail; Ethena's reserve-fund loss). This is NEVER silently dropped;
  • slippage/impact keyed to venue DEPTH (√-impact, scaled by traded notional, not position value);
  • a rebalance-FREQUENCY term (more rebalances to hold delta≈0 ⇒ more cost).

Plausibility (Appendix D/E, pinned by test_funding_accrual): 0 in the frictionless limit, rising with rebalance
frequency and thinness, never exceeding position value; NET carry ≤ GROSS. Interface: pure JSON in → JSON out.
funding rates in the job are PER-INTERVAL (the actual charge), not annualized.
"""
from __future__ import annotations

import json
import math
import sys

# ── FROZEN calibration (Unified Sprint P2 / Rule XV; sourced to PUBLISHED, FREE venue economics; frozen before
# scoring; NOT tuned toward a verdict — the Rule-XII power floor is independent of costs, so a corrected cost cannot
# mint a bless). Recalibrated because the prior defaults produced ~57%/yr hedge maintenance on a liquid BTC basis
# trade — economically impossible for a strategy run profitably at scale (Ethena; CEX basis desks). Sources:
#   • perp taker/maker: Binance USDⓈ-M 4.0/2.0 bps, Hyperliquid ~3.5/1.0 bps (published fee schedules) → 4.0/1.5 conservative
#   • spot acquisition: ~10 bps one-off (liquid spot taker + transfer)
#   • rebalance cadence: at the 8h funding settlement (delta re-hedged when funding accrues)
#   • hedgeTurnoverFrac 0.005: a delta-neutral perp+spot pair drifts <~0.5% of notional per 8h (the perp tracks
#       spot); re-hedging 5% every 8h was the miscalibration. 0.005 is a conservative published-vol-consistent value.
#   • depthUsd: deep-market (BTC/ETH) top-of-book+ perp depth is $50M+; thin alts pass a lower per-market depth.
# CALIBRATION_VERSION pins the frozen set; any change is a visible diff (Rule IX). ──
CALIBRATION_VERSION = "funding-cost/2026-07-02"
DEFAULTS = {
    "takerBps": 4.0,        # perp taker fee (Binance USDⓈ-M 4bps; HL ~3.5bps) — conservative
    "makerBps": 1.5,        # perp maker fee
    "spotBps": 10.0,        # spot/hedge-leg acquisition (one-off, entry)
    "slippageK": 0.1,       # √-impact coefficient (same idiom as RWA/lending)
    "hedgeTurnoverFrac": 0.005,  # fraction of notional re-hedged per 8h to hold delta≈0 (published-vol-consistent; was 0.05, the bug)
    "rebalanceEveryHours": 8.0,  # re-hedge at the funding settlement cadence
    "depthUsd": 50_000_000.0,    # deep-market (BTC/ETH) perp depth; thin markets pass a lower per-market depthUsd
    "useTaker": True,
}
# Economic-plausibility bound (Rule XV): annualized deep-market hedge maintenance above this is presumed a bug.
DEEP_MARKET_MAINT_BOUND_ANNUAL = 0.10  # 10%/yr — a liquid BTC/ETH basis hedge should cost far less


def run_funding_accrual(job) -> dict:
    """job: { funding:[per-interval rate,...], intervalHours, notionalUsd?, costs? }. Returns the cost decomposition
    with the tail (negative-funding-paid) term EXPLICIT, plus gross/net carry."""
    funding = [float(f) for f in job.get("funding", []) if f is not None]
    interval_h = float(job.get("intervalHours", 1.0))
    notional = float(job.get("notionalUsd", 1_000_000.0))
    c = {**DEFAULTS, **(job.get("costs", {}) or {})}

    # ── funding P&L, decomposed so the tail cost is never hidden ──
    gross_received = sum(max(f, 0.0) for f in funding) * notional     # funding earned on positive-funding intervals
    funding_paid = sum(max(-f, 0.0) for f in funding) * notional      # THE TAIL COST: paid on negative-funding intervals
    funding_pnl = gross_received - funding_paid                        # = Σ signed funding · notional

    # ── mechanical trading cost of RUNNING the delta-neutral position ──
    n_intervals = len(funding)
    total_hours = n_intervals * interval_h
    rebalances = int(total_hours // max(c["rebalanceEveryHours"], 1e-9)) if total_hours > 0 else 0
    hedge_notional = c["hedgeTurnoverFrac"] * notional                 # re-hedged each rebalance
    fee_bps = c["takerBps"] if c["useTaker"] else c["makerBps"]

    perp_fees = (fee_bps / 10_000.0) * hedge_notional * rebalances
    spot_leg = (c["spotBps"] / 10_000.0) * notional                   # one-off entry acquisition of the hedge leg
    depth = max(float(c["depthUsd"]), 1.0)
    # √-impact per rebalance, scaled by the TRADED notional and venue depth (thinner depth ⇒ more slippage)
    slippage = rebalances * (hedge_notional * c["slippageK"] * math.sqrt(hedge_notional / depth))
    hedge_maintenance = perp_fees + slippage                          # the rebalance-frequency cost of holding delta≈0

    total_cost = funding_paid + spot_leg + hedge_maintenance
    total_cost = min(total_cost, notional)                            # plausibility clamp: cost never exceeds position value

    gross_carry = gross_received                                       # what you'd book ignoring costs + the tail
    net_carry = funding_pnl - spot_leg - hedge_maintenance            # after the tail (in funding_pnl) + trading costs
    net_carry = max(net_carry, gross_carry - total_cost)              # keep net ≤ gross by construction

    # Economic-plausibility reconciliation (Rule XV): annualize the hedge maintenance; flag if a DEEP market's
    # maintenance exceeds the bound (presumed a bug). Bounds deep markets only — a thin market may honestly stay net-negative.
    days = (total_hours / 24.0) if total_hours > 0 else 0.0
    ann_maint = (hedge_maintenance / notional * (365.0 / days)) if days > 0 else 0.0
    deep = depth >= 20_000_000.0
    plausible = (ann_maint <= DEEP_MARKET_MAINT_BOUND_ANNUAL) if deep else True

    return {
        "nIntervals": n_intervals,
        "rebalances": rebalances,
        "grossFundingReceived": gross_received,
        "fundingPaidNegativeWindows": funding_paid,   # the tail cost — EXPLICIT, never dropped
        "fundingPnl": funding_pnl,
        "perpFees": perp_fees,
        "spotLeg": spot_leg,
        "slippage": slippage,
        "hedgeMaintenance": hedge_maintenance,
        "annualizedMaintenance": ann_maint,           # for the Rule-XV economic reconciliation
        "totalCost": total_cost,
        "grossCarry": gross_carry,
        "netCarry": net_carry,
        "netLeqGross": net_carry <= gross_carry + 1e-9,               # plausibility invariant
        "deepMarket": deep,
        "economicallyPlausible": plausible,           # deep-market maintenance ≤ bound (Rule XV); thin may be net-neg
        "calibrationVersion": CALIBRATION_VERSION,
        "note": "delta-neutral funding carry; calibrated (frozen, sourced) + Rule-XV economic bound; tail explicit; net ≤ gross; NOT tuned toward GO (Rule-XII floor independent of costs).",
    }


def json_safe(o):
    if isinstance(o, float):
        return o if math.isfinite(o) else None
    if isinstance(o, dict):
        return {k: json_safe(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [json_safe(v) for v in o]
    return o


def main():
    job = json.load(sys.stdin)
    json.dump(json_safe(run_funding_accrual(job)), sys.stdout)


if __name__ == "__main__":
    main()
