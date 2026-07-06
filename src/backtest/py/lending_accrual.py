"""ORGΛNON Lending-Carry — UNLEVERED supply-carry accrual + honest cost model (blueprint Phase 3 / B.2).

PARALLEL to accrual.py (the RWA accrual math is NOT touched — Rule VII). An unlevered supply position has a clean
per-period carry return = realized supply APY over the period (observed, not forecast), accrued at the
point-in-time rate each day. Honest costs on rebalance: square-root market-impact slippage scaled by TURNOVER
(never TVL), gas, feeBps — the same cost idiom as RWA, reimplemented here for the lending domain.

LEVERED loops are NOT built this sprint (B.2 / Appendix C): they are path-dependent with liquidation risk, so a
clean per-period drop-in does not apply. A levered spec is REFUSED — never silently mis-accrued as if its carry
series captured liquidation loss. The refusal points to the Appendix-C liquidation-model gate.

Interface: pure JSON in -> JSON out. run_lending_accrual(job) -> result.
"""
from __future__ import annotations

import bisect
import json
import math
import sys
from datetime import datetime, timezone

DEFAULT_SLIPPAGE_K = 0.1
TURNOVER_FLOOR_USD = 1.0
DAYS_PER_YEAR = 365.0
DAY_MS = 86_400_000


def _asof(pairs):
    ts = [p[0] for p in pairs]
    vals = [p[1] for p in pairs]

    def asof(t):
        i = bisect.bisect_right(ts, t) - 1
        return vals[i] if i >= 0 else None

    return asof


def _month_key(ts_ms):
    d = datetime.fromtimestamp(ts_ms / 1000.0, tz=timezone.utc)
    return (d.year, d.month)


def _normalize(weights):
    total = sum(w for w in weights.values() if w > 0)
    if total <= 0:
        return {k: 0.0 for k in weights}
    return {k: (w / total if w > 0 else 0.0) for k, w in weights.items()}


WITHDRAWAL_MAX_WAIT_DAYS = 30.0  # plausibility clamp on the utilization-derived withdrawal wait (Appendix E)
WITHDRAWAL_AVAIL_FLOOR = 1.0


class Position:
    """An unlevered supply position in one market (series already point-in-time-truncated by the caller)."""

    def __init__(self, raw):
        self.key = raw["key"]
        series = raw.get("series", {})
        self.apy_base = _asof(series.get("apyBase", [])) if series.get("apyBase") else (lambda t: None)
        self.turnover = _asof(series.get("turnover", [])) if series.get("turnover") else (lambda t: None)
        # Hardening Phase 3: utilization + TVL feed the withdrawal-risk cost. Either a point-in-time series or a
        # scalar (current state) per market; absent → uncovered (no withdrawal mark, disclosed).
        self._util_series = _asof(series.get("utilization", [])) if series.get("utilization") else None
        self._util_scalar = raw.get("utilization")
        self._tvl_series = _asof(series.get("tvl", [])) if series.get("tvl") else None
        self._tvl_scalar = raw.get("tvlUsd")

    def util(self, ts):
        return self._util_series(ts) if self._util_series is not None else self._util_scalar

    def tvl(self, ts):
        return self._tvl_series(ts) if self._tvl_series is not None else self._tvl_scalar

    def daily_factor(self, ts):
        """Multiplicative one-step carry factor at the POINT-IN-TIME observed rate (the rate-change is reflected
        here — we accrue at the rate that actually prevailed each day, never the locked entry rate)."""
        base = self.apy_base(ts)
        if base is None:
            return 1.0  # no rate observed this step -> no accrual (absence handled by coverage; never invented)
        return 1.0 + (base / 100.0) / DAYS_PER_YEAR

    def daily_rate(self, ts):
        return self.daily_factor(ts) - 1.0


def _is_levered(spec) -> bool:
    if spec.get("family") == "lending-carry-levered":
        return True
    lev = spec.get("leverage")
    return lev is not None and float(lev) > 1.0


def _refuse_levered():
    # Path-dependent P&L + liquidation risk: the clean per-period drop-in does NOT apply (B.2). An engine whose
    # product is "trust our GO" cannot score a levered loop blind to liquidation. Deferred to the Appendix-C gate.
    return {
        "refused": True,
        "reason": "levered loops are deferred behind the Appendix-C liquidation-model gate (health-factor "
                  "dynamics, liquidation penalty, rate/utilization-spike scenarios). Unlevered only this sprint.",
        "gate": "Appendix C",
    }


def _markets_of(spec):
    return spec.get("markets", spec.get("legs", []))


def _target_weights(policy, spec, positions, ts, allowed):
    ids = [m["key"] for m in _markets_of(spec) if m["key"] in allowed]
    if not ids:
        return {}
    spec_weight = {m["key"]: float(m.get("weight", 0.0)) for m in _markets_of(spec)}
    rate = {i: positions[i].daily_rate(ts) for i in ids}

    if policy == "static":
        w = {i: spec_weight.get(i, 0.0) for i in ids}
        return _normalize(w) if sum(w.values()) > 0 else _normalize({i: 1.0 for i in ids})

    if policy == "carry-rotation":  # allocate fully to the highest current carry
        best = max(ids, key=lambda i: rate[i])
        return {i: (1.0 if i == best else 0.0) for i in ids}

    if policy == "carry-tilt":  # weight ∝ positive carry
        pos = {i: max(rate[i], 0.0) for i in ids}
        if sum(pos.values()) <= 0:
            return _normalize({i: 1.0 for i in ids})
        return _normalize(pos)

    raise ValueError(f"unknown lending policy: {policy}")


def _rebalance(holdings, target, positions, ts, costs):
    """Move holdings toward target, deducting honest costs. Returns the cost breakdown (parallel to RWA)."""
    equity = sum(holdings.values())
    if equity <= 0:
        return {"slippage": 0.0, "fee": 0.0, "gas": 0.0, "withdrawalRisk": 0.0, "total": 0.0, "traded": 0.0}
    all_ids = set(holdings) | set(target)
    target_dollars = {i: target.get(i, 0.0) * equity for i in all_ids}
    deltas = {i: target_dollars.get(i, 0.0) - holdings.get(i, 0.0) for i in all_ids}
    traded = sum(abs(d) for d in deltas.values())
    if traded == 0:
        return {"slippage": 0.0, "fee": 0.0, "gas": 0.0, "withdrawalRisk": 0.0, "total": 0.0, "traded": 0.0}

    k = float(costs.get("slippageK", DEFAULT_SLIPPAGE_K))
    fee_bps = float(costs.get("feeBps", 0.0))
    gas = float(costs.get("gasUsd", 0.0))

    slippage = 0.0
    for i, d in deltas.items():
        if d == 0:
            continue
        turn = positions[i].turnover(ts)
        turn = max(turn if turn else 0.0, TURNOVER_FLOOR_USD)
        slippage += abs(d) * k * math.sqrt(abs(d) / turn)
    fee = (fee_bps / 10000.0) * traded

    # WITHDRAWAL-RISK cost (Hardening Phase 3 / Appendix D). The prior "par-exit, no mark" assumption is FALSE at
    # high utilization: a sell (d<0) larger than available liquidity (1−u)·TVL must QUEUE, forgoing yield over the
    # expected wait. Mechanical + utilization-derived (the lending analog of the RWA redemption-delay term): 0 when
    # liquidity covers the withdrawal, rising as u→1, clamped to a plausible max wait. Not a tuned constant.
    withdrawal = 0.0
    for i, d in deltas.items():
        if d >= 0:
            continue
        amt = -d
        u, tvl = positions[i].util(ts), positions[i].tvl(ts)
        if u is None or tvl is None or tvl <= 0:
            continue  # utilization/TVL uncovered → no withdrawal mark (disclosed as uncovered coverage)
        u = max(0.0, min(float(u), 1.0))
        available = max((1.0 - u) * float(tvl), 0.0)
        if available >= amt:
            continue  # liquidity covers the withdrawal → exit at par
        queued = amt - available
        wait_days = min(WITHDRAWAL_MAX_WAIT_DAYS, queued / max(available, WITHDRAWAL_AVAIL_FLOOR))
        daily_rate = max(positions[i].daily_rate(ts), 0.0)
        withdrawal += queued * daily_rate * wait_days

    total = slippage + fee + gas + withdrawal
    total = min(total, equity * 0.5)
    new_equity = equity - total
    for i in all_ids:
        holdings[i] = target.get(i, 0.0) * new_equity
    return {"slippage": slippage, "fee": fee, "gas": gas, "withdrawalRisk": withdrawal, "total": total, "traded": traded}


def run_lending_accrual(job):
    spec = job["spec"]
    if _is_levered(spec):
        return _refuse_levered()

    window = job["window"]
    start, end = window["start"], window["end"]
    costs = job.get("costs", {}) or {}
    positions = {m["key"]: Position(m) for m in job["markets"]}

    # daily grid: one step per UTC day (the latest ts that day)
    by_day = {}
    for m in job["markets"]:
        for pt in (m.get("series", {}).get("apyBase", []) or []):
            if start <= pt[0] <= end:
                day = pt[0] // DAY_MS
                if pt[0] > by_day.get(day, 0):
                    by_day[day] = pt[0]
    timeline = [by_day[d] for d in sorted(by_day)]
    if not timeline:
        return {"equity_curve": [], "fills": [], "costs": {"slippage": 0.0, "fee": 0.0, "gas": 0.0, "withdrawalRisk": 0.0, "total": 0.0}}

    policy = spec.get("policy", "static")
    rebalance = spec.get("rebalance", {}) or {}
    trigger = rebalance.get("trigger", "monthly")
    capital = float(job.get("capitalUsd", 1.0))

    first = timeline[0]
    allowed0 = set(p["key"] for p in _markets_of(spec))
    init_target = _target_weights(policy, spec, positions, first, allowed0)
    holdings = {i: w * capital for i, w in init_target.items()}
    for m in _markets_of(spec):
        holdings.setdefault(m["key"], 0.0)

    last_rebalance_ts = first
    equity_curve = []
    fills = []
    cost_acc = {"slippage": 0.0, "fee": 0.0, "gas": 0.0, "withdrawalRisk": 0.0, "total": 0.0}

    for i, ts in enumerate(timeline):
        for key, dollars in list(holdings.items()):
            if dollars != 0.0:
                holdings[key] = dollars * positions[key].daily_factor(ts)
        if i > 0 and trigger == "monthly" and _month_key(ts) != _month_key(last_rebalance_ts):
            target = _target_weights(policy, spec, positions, ts, allowed0)
            breakdown = _rebalance(holdings, target, positions, ts, costs)
            if breakdown["traded"] > 0:
                for k2 in cost_acc:
                    cost_acc[k2] += breakdown[k2]
                fills.append({"ts": ts, "traded": breakdown["traded"], "cost": breakdown["total"]})
            last_rebalance_ts = ts
        equity_curve.append([ts, sum(holdings.values()) / capital])

    return {"equity_curve": equity_curve, "fills": fills, "costs": cost_acc}


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
    json.dump(json_safe(run_lending_accrual(job)), sys.stdout)


if __name__ == "__main__":
    main()
