"""Organon accrual backtester + cost model (blueprint Phase 5 / Appendix I).

An RWA strategy is an ALLOCATION across yield-bearing legs that accrues yield and
rebalances on a trigger (B.2) — NOT a trade-signal sequence. This module turns a
spec + point-in-time series (already truncated by the TS side) into a daily equity
curve with honest costs.

Interface: pure JSON in -> JSON out (Appendix C). `run_accrual(job) -> result`.
Costs (Appendix I.1): square-root market-impact slippage scaled by TURNOVER (not
TVL), per-leg redemption delay (idle capital forgoes yield for delayDays), feeBps,
and fixed gas. Python NEVER looks ahead: it only reads the series handed to it.
"""
from __future__ import annotations

import bisect
import json
import math
import sys
from datetime import datetime, timezone

# Cost-model coefficient for square-root market impact. Not a risk-scoring constant
# (those live in risk/config.ts per O.9) — this is a backtest cost parameter. May be
# overridden per-job via costs.slippageK.
DEFAULT_SLIPPAGE_K = 0.1
TURNOVER_FLOOR_USD = 1.0  # avoid div-by-zero when turnover is absent/zero
DAYS_PER_YEAR = 365.0
DAY_MS = 86_400_000

# W1.75 (Appendix C) — qualified-breach constants, single source of truth (backtest layer).
# A sustained >=100bps peg deviation is a real break, not a 1-8bps calm wobble (calm peg
# medians are 1-8bps per W1.5), so BREACH_BPS cannot trip on normal noise.
BREACH_BPS = 100.0
# How many consecutive daily steps a breach must persist to qualify when redemption is
# instant/daily but delayed (delayDays>0): the loss is real only if you couldn't wait it out.
BREACH_PERSIST_STEPS = 2
# Frequencies under which par redemption IS available within the step (a depeg is then a
# paper wobble, never a realized loss). Anything else (weekly/cooldown/...) is gated.
INSTANT_REDEMPTION = {"instant", "daily"}

_TIER_RANK = {"insufficient": 0, "low": 1, "medium": 2, "high": 3}


def _asof(pairs):
    """Return an asof(ts) closure over [[ts,val],...] (sorted asc): latest val with t<=ts, else None."""
    ts = [p[0] for p in pairs]
    vals = [p[1] for p in pairs]

    def asof(t):
        i = bisect.bisect_right(ts, t) - 1
        return vals[i] if i >= 0 else None

    return asof


def _month_key(ts_ms):
    d = datetime.fromtimestamp(ts_ms / 1000.0, tz=timezone.utc)
    return (d.year, d.month)


def _quarter_key(ts_ms):
    d = datetime.fromtimestamp(ts_ms / 1000.0, tz=timezone.utc)
    return (d.year, (d.month - 1) // 3)


def _normalize(weights):
    total = sum(w for w in weights.values() if w > 0)
    if total <= 0:
        return {k: 0.0 for k in weights}
    return {k: (w / total if w > 0 else 0.0) for k, w in weights.items()}


class Leg:
    """Per-leg accessors built from a job leg (series already point-in-time-truncated)."""

    def __init__(self, raw):
        self.id = raw["id"]
        series = raw.get("series", {})
        self.is_price = bool(series.get("price"))
        self.apy_base = _asof(series.get("apyBase", [])) if series.get("apyBase") else (lambda t: None)
        self.price = _asof(series.get("price", [])) if series.get("price") else (lambda t: None)
        self.turnover = _asof(series.get("turnover", [])) if series.get("turnover") else (lambda t: None)
        self.peg = _asof(series.get("peg", [])) if series.get("peg") else (lambda t: None)
        # W1.75: dedicated peg-MARK series (base-$1 token price), point-in-time. Consumed ONLY
        # by qualified_breach + the gated depressed-price exit — NOT by the policy/pegExit path
        # (which reads `series.peg`, left empty), so those stay inert and the no-breach path is
        # byte-identical to W1.5.
        peg_mark = raw.get("pegMark", [])
        self.peg_mark = _asof(peg_mark) if peg_mark else (lambda t: None)
        redemption = raw.get("redemption", {}) or {}
        self.delay_days = float(redemption.get("delayDays", 0) or 0)
        self.frequency = redemption.get("frequency")  # W1.75: redemption gating for the breach predicate
        self.issuer = raw.get("issuer")  # optional Job extension (TS supplies from registry)
        self.asset_class = raw.get("assetClass")  # optional Job extension
        self.confidence_tier = raw.get("confidenceTier")  # optional Job extension (ISQ, Phase 8)
        self.warmup_ok = bool(raw.get("warmupOk", True))  # optional; defaults available

    def daily_factor(self, ts, prev_ts):
        """Multiplicative one-step accrual factor."""
        if self.is_price:
            p = self.price(ts)
            p_prev = self.price(prev_ts) if prev_ts is not None else None
            if p is None or p_prev is None or p_prev == 0:
                return 1.0
            return p / p_prev
        base = self.apy_base(ts)
        if base is None:
            return 1.0  # no rate observed this step -> no accrual (risk scorer handles absence; B.4)
        return 1.0 + (base / 100.0) / DAYS_PER_YEAR

    def daily_rate(self, ts, prev_ts):
        return self.daily_factor(ts, prev_ts) - 1.0

    def peg_dev_bps(self, ts):
        peg = self.peg(ts)
        if peg is None:
            return None
        return abs(peg - 1.0) * 10000.0

    def mark_dev_bps(self, ts):
        """W1.75 — point-in-time peg-MARK deviation (bps) for the breach predicate, or None."""
        p = self.peg_mark(ts)
        if p is None:
            return None
        return abs(p - 1.0) * 10000.0


# W1.75 — the qualified-breach predicate (Appendix B). PURE, deterministic, point-in-time.
# An exit must realize at the DEPRESSED market price (not NAV) iff BOTH hold:
#   (1) peg broken:  mark_dev_bps(ts) >= BREACH_BPS; AND
#   (2) par redemption unavailable: redemption is gated (frequency not in {instant, daily})
#       OR delayed (delayDays > 0) with the breach PERSISTING across the delay window.
# A depeg you can redeem out of at par (instant/daily, no delay) is a paper wobble, never a
# realized loss → it does NOT qualify. Reads only ts-and-earlier peg (no lookahead).
def qualified_breach(leg, ts):
    dev = leg.mark_dev_bps(ts)
    if dev is None or dev < BREACH_BPS:
        return False
    if leg.frequency not in INSTANT_REDEMPTION:  # weekly/cooldown/... → cannot redeem at par
        return True
    if leg.delay_days > 0:  # instant/daily but delayed → qualifies only if breach persists
        steps = max(1, int(BREACH_PERSIST_STEPS))
        return all((leg.mark_dev_bps(ts - k * DAY_MS) or 0.0) >= BREACH_BPS for k in range(steps))
    return False


def _target_weights(policy, spec, legs, ts, prev_ts, allowed):
    """Compute target weights for a policy over the allowed legs (deterministic)."""
    spec_ids = [l["id"] for l in spec["legs"]]
    spec_weight = {l["id"]: float(l["weight"]) for l in spec["legs"]}
    ids = [i for i in spec_ids if i in allowed]
    if not ids:
        return {}
    rate = {i: legs[i].daily_rate(ts, prev_ts) for i in ids}

    if policy == "static":
        w = {i: spec_weight.get(i, 0.0) for i in ids}
        return _normalize(w) if sum(w.values()) > 0 else _normalize({i: 1.0 for i in ids})

    if policy == "yield-rotation":
        best = max(ids, key=lambda i: rate[i])
        return {i: (1.0 if i == best else 0.0) for i in ids}

    if policy == "constrained-carry":
        pos = {i: max(rate[i], 0.0) for i in ids}
        if sum(pos.values()) <= 0:
            return _normalize({i: 1.0 for i in ids})
        return _normalize(pos)

    if policy == "barbell":
        safe = min(ids, key=lambda i: legs[i].delay_days)
        high = max(ids, key=lambda i: rate[i])
        if safe == high:
            return {i: (1.0 if i == safe else 0.0) for i in ids}
        return {i: (0.5 if i in (safe, high) else 0.0) for i in ids}

    if policy == "peg-defensive":
        score = {}
        for i in ids:
            dev = legs[i].peg_dev_bps(ts)
            score[i] = 1.0 / (1.0 + (dev if dev is not None else 0.0))
        return _normalize(score)

    raise ValueError(f"unknown policy: {policy}")


def _apply_constraints(weights, spec, legs):
    """Apply weight caps (per-leg always; per-issuer / per-asset-class when metadata present)."""
    constraints = spec.get("constraints", {}) or {}
    w = dict(weights)
    cap = constraints.get("maxWeightPerLeg")
    if cap is not None:
        w = {i: min(v, cap) for i, v in w.items()}
    # per-issuer / per-asset-class caps need metadata supplied via the Job leg extension
    for key, attr in (("maxWeightPerIssuer", "issuer"), ("maxWeightPerAssetClass", "asset_class")):
        limit = constraints.get(key)
        if limit is None:
            continue
        groups = {}
        for i in w:
            g = getattr(legs[i], attr)
            if g is None:
                continue
            groups.setdefault(g, []).append(i)
        for members in groups.values():
            gsum = sum(w[i] for i in members)
            if gsum > limit and gsum > 0:
                scale = limit / gsum
                for i in members:
                    w[i] *= scale
    return _normalize(w)


def _allowed_legs(spec, legs, ts):
    """Legs not force-exited at ts: peg within pegExitBps, confidence >= min tier, warm-up ok (Appendix I.2 step 4)."""
    constraints = spec.get("constraints", {}) or {}
    peg_exit = constraints.get("pegExitBps")
    min_tier = constraints.get("minLegConfidenceTier")
    allowed = set()
    for l in spec["legs"]:
        leg = legs[l["id"]]
        if peg_exit is not None:
            dev = leg.peg_dev_bps(ts)
            if dev is not None and dev > peg_exit:
                continue
        if min_tier is not None and leg.confidence_tier is not None:
            if _TIER_RANK.get(leg.confidence_tier, 0) < _TIER_RANK.get(min_tier, 0):
                continue
        if not leg.warmup_ok:
            continue
        allowed.add(l["id"])
    return allowed


def _rebalance(holdings, target, legs, ts, costs):
    """Move holdings toward target weights, deducting all four cost dimensions. Returns cost breakdown."""
    equity = sum(holdings.values())
    if equity <= 0:
        return {"slippage": 0.0, "fee": 0.0, "gas": 0.0, "delay": 0.0, "total": 0.0, "traded": 0.0}
    all_ids = set(holdings) | set(target)
    target_dollars = {i: target.get(i, 0.0) * equity for i in all_ids}
    deltas = {i: target_dollars.get(i, 0.0) - holdings.get(i, 0.0) for i in all_ids}
    traded = sum(abs(d) for d in deltas.values())
    if traded == 0:
        return {"slippage": 0.0, "fee": 0.0, "gas": 0.0, "delay": 0.0, "total": 0.0, "traded": 0.0}

    k = float(costs.get("slippageK", DEFAULT_SLIPPAGE_K))
    fee_bps = float(costs.get("feeBps", 0.0))
    gas = float(costs.get("gasUsd", 0.0))

    # square-root market impact, scaled by TURNOVER (never TVL)
    slippage = 0.0
    for i, d in deltas.items():
        if d == 0:
            continue
        turn = legs[i].turnover(ts)
        turn = max(turn if turn else 0.0, TURNOVER_FLOOR_USD)
        slippage += abs(d) * k * math.sqrt(abs(d) / turn)

    fee = (fee_bps / 10000.0) * traded

    # redemption delay: capital sold from a leg is idle for delayDays -> forgoes yield
    avg_rate = sum(target.get(i, 0.0) * max(legs[i].daily_rate(ts, None), 0.0) for i in target)
    delay = 0.0
    for i, d in deltas.items():
        if d < 0:
            delay += (-d) * max(avg_rate, 0.0) * legs[i].delay_days

    total = slippage + fee + gas + delay
    total = min(total, equity * 0.5)  # safety clamp
    new_equity = equity - total
    for i in all_ids:
        holdings[i] = target.get(i, 0.0) * new_equity
    return {"slippage": slippage, "fee": fee, "gas": gas, "delay": delay, "total": total, "traded": traded}


def run_accrual(job):
    window = job["window"]
    start, end = window["start"], window["end"]
    spec = job["spec"]
    costs = job.get("costs", {}) or {}
    legs = {l["id"]: Leg(l) for l in job["legs"]}

    # timeline = ONE step per UTC day (the latest ts that day). Collapsing to a daily
    # grid is essential: legs from different sources carry different intra-day timestamps
    # (DefiLlama ~23:01 with per-pool seconds, CoinGecko midnight), so a raw union would
    # have several steps per calendar day and double-accrue yield legs.
    by_day = {}
    for l in job["legs"]:
        series = l.get("series", {})
        for arr_key in ("apyBase", "price"):
            for pt in series.get(arr_key, []) or []:
                if start <= pt[0] <= end:
                    day = pt[0] // DAY_MS
                    if pt[0] > by_day.get(day, 0):
                        by_day[day] = pt[0]
    timeline = [by_day[d] for d in sorted(by_day)]
    if not timeline:
        return {"equity_curve": [], "fills": [], "costs": {"slippage": 0.0, "fee": 0.0, "gas": 0.0, "delay": 0.0, "total": 0.0}}

    policy = spec["policy"]
    rebalance = spec.get("rebalance", {}) or {}
    trigger = rebalance.get("trigger", "monthly")
    drift_bps = float(rebalance.get("driftBps", 0) or 0)

    # Deployed notional in REAL USD so absolute costs (gas) and turnover-relative
    # slippage are dimensionally correct; the equity curve is reported as a normalized
    # index (start = 1.0). Fidelity is independent of capital (cost-free => index = product).
    capital = float(job.get("capitalUsd", 1.0))

    # initial allocation: cost-free deposit into the policy target at the first step
    first = timeline[0]
    allowed0 = _allowed_legs(spec, legs, first)
    init_target = _apply_constraints(_target_weights(policy, spec, legs, first, None, allowed0), spec, legs)
    holdings = {i: w * capital for i, w in init_target.items()}
    for l in spec["legs"]:  # ensure every spec leg has a holdings entry
        holdings.setdefault(l["id"], 0.0)

    last_rebalance_ts = first
    last_target = dict(init_target)
    equity_curve = []
    fills = []
    cost_acc = {"slippage": 0.0, "fee": 0.0, "gas": 0.0, "delay": 0.0, "total": 0.0}
    prev_ts = None

    for i, ts in enumerate(timeline):
        # 1-2. accrue every holding by its point-in-time factor
        for leg_id, dollars in list(holdings.items()):
            if dollars != 0.0:
                holdings[leg_id] = dollars * legs[leg_id].daily_factor(ts, prev_ts)

        if i > 0:
            allowed = _allowed_legs(spec, legs, ts)
            held_ids = [k for k, v in holdings.items() if v > 0]
            forced = any(h not in allowed for h in held_ids)  # a held leg got exited (peg/confidence/warm-up)

            # W1.75 SURGICAL price-mark (gated; Appendix B). A held leg force-exited DURING a
            # QUALIFIED peg breach (peg broken AND par redemption gated/delayed) can only be
            # sold through the depressed secondary market — so realize it at the depressed price
            # `holdings * (1 - markDevBps/10000)` BEFORE the unchanged NAV rebalance redistributes
            # value. This is a BRANCH AROUND the NAV/cost path, never an edit to it. When no
            # qualified breach holds, this loop is a no-op and the result is byte-identical to W1.5.
            if forced:
                for h in held_ids:
                    if h not in allowed and qualified_breach(legs[h], ts):
                        dev = legs[h].mark_dev_bps(ts)  # not None here (qualified_breach checked it)
                        holdings[h] = holdings[h] * (1.0 - dev / 10000.0)

            periodic = False
            if trigger == "monthly":
                periodic = _month_key(ts) != _month_key(last_rebalance_ts)
            elif trigger == "quarterly":
                periodic = _quarter_key(ts) != _quarter_key(last_rebalance_ts)
            elif trigger == "drift":
                equity = sum(holdings.values()) or 1.0
                cur_w = {k: v / equity for k, v in holdings.items()}
                periodic = any(abs(cur_w.get(k, 0.0) - last_target.get(k, 0.0)) > (drift_bps / 10000.0) for k in set(cur_w) | set(last_target))

            if periodic or forced:
                target = _apply_constraints(_target_weights(policy, spec, legs, ts, prev_ts, allowed), spec, legs)
                breakdown = _rebalance(holdings, target, legs, ts, costs)
                if breakdown["traded"] > 0:
                    for key in cost_acc:
                        cost_acc[key] += breakdown[key]
                    fills.append({"ts": ts, "traded": breakdown["traded"], "cost": breakdown["total"], "forced": forced})
                    last_target = dict(target)
                    last_rebalance_ts = ts
                elif periodic:
                    last_rebalance_ts = ts

        equity_curve.append([ts, sum(holdings.values()) / capital])
        prev_ts = ts

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
    json.dump(json_safe(run_accrual(job)), sys.stdout)


if __name__ == "__main__":
    main()
