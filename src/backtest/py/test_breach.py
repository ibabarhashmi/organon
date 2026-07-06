"""W1.75 Phase 1 — the qualified-breach predicate, tested in ISOLATION (pure, point-in-time).

Run:  cd packages/solidity-sentinel/src && backtest/py/.venv/bin/python -m backtest.py.test_breach

Builds Leg objects directly (no snapshot, no accrual loop). Verifies that an exit qualifies
to realize at the depressed price iff peg is broken (>=BREACH_BPS) AND par redemption is gated
or delayed-with-persistence — and NEVER for a redeemable depeg or a sub-threshold wobble.
"""
import sys

from backtest.py.accrual import Leg, qualified_breach, BREACH_BPS, BREACH_PERSIST_STEPS, DAY_MS

DAY = DAY_MS
T = 1_700_000_000_000  # arbitrary fixed instant (no wall-clock)


def leg(frequency, delay_days, peg_marks):
    """peg_marks: list of (ts, price). Builds a Leg with a pegMark series + redemption."""
    return Leg({
        "id": "L",
        "series": {},
        "pegMark": [[ts, price] for ts, price in peg_marks],
        "redemption": {"frequency": frequency, "delayDays": delay_days},
    })


def deep(ts, price=0.85):  # ~1500bps depeg
    return (ts, price)


def calm(ts, price=1.0002):  # ~2bps wobble
    return (ts, price)


def main():
    cases = []

    # 1. calm peg + instant redemption -> False (no break)
    cases.append(("calm+instant -> False", qualified_breach(leg("instant", 0, [calm(T)]), T) is False))

    # 2. deep depeg + INSTANT redemption (delay 0) -> False (redeemable at par = no realized loss)
    cases.append(("deep+instant -> False", qualified_breach(leg("instant", 0, [deep(T)]), T) is False))

    # 3. deep depeg + DAILY redemption (delay 0) -> False (still redeemable at par within the step)
    cases.append(("deep+daily -> False", qualified_breach(leg("daily", 0, [deep(T)]), T) is False))

    # 4. deep depeg + GATED redemption (weekly) -> True (forced to sell into the broken peg)
    cases.append(("deep+weekly -> True", qualified_breach(leg("weekly", 5, [deep(T)]), T) is True))

    # 4b. deep depeg + GATED redemption (cooldown) -> True
    cases.append(("deep+cooldown -> True", qualified_breach(leg("cooldown", 7, [deep(T)]), T) is True))

    # 5. shallow wobble (50bps < 100) + gated redemption -> False (below threshold)
    cases.append(("shallow50+weekly -> False", qualified_breach(leg("weekly", 5, [(T, 0.995)]), T) is False))

    # 6. deep depeg + instant/DAILY but delayed (delayDays>0) WITH persistence across the window -> True
    persist = [deep(T - k * DAY) for k in range(BREACH_PERSIST_STEPS)]
    cases.append(("deep+daily+delayed+persist -> True", qualified_breach(leg("daily", 1, persist), T) is True))

    # 7. deep depeg + delayed but breach NOT persistent (only at T, calm just before) -> False
    transient = [calm(T - 1 * DAY), deep(T)]
    cases.append(("deep+daily+delayed+transient -> False", qualified_breach(leg("daily", 1, transient), T) is False))

    # 8. point-in-time: peg only AFTER T (future) -> mark_dev(T) is None -> False (no lookahead)
    future_only = leg("weekly", 5, [deep(T + 3 * DAY)])
    cases.append(("future-only peg -> False (no lookahead)", qualified_breach(future_only, T) is False))

    # 9. exactly at threshold (100bps) + gated -> True (>= is inclusive)
    cases.append(("exactly-100bps+weekly -> True", qualified_breach(leg("weekly", 5, [(T, 0.99)]), T) is True))

    allok = True
    for name, ok in cases:
        print(f"  [{'PASS' if ok else 'FAIL'}] {name}")
        allok = allok and ok
    print(f"\nPhase 1 breach predicate: {'ALL PASS' if allok else 'FAIL'}")
    sys.exit(0 if allok else 1)


if __name__ == "__main__":
    main()
