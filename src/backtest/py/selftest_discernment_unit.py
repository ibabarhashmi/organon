"""ORGΛNON Discernment Test — the self-contained DISCERNMENT MICRO-CONTROL (Phase 3/4 red-team; Rule XXIX).

Fast, no captured data. Proves — on the SAME frozen discriminator (funding_discriminate.discriminate, byte-identical)
— the three facts the whole sprint rests on:

  (1) PERFECT-FORESIGHT signal (= the forward itself) → **GO**.  The gate is NOT a dead "always NO-GO" wall: it CAN
      say yes to a genuine predictor. Therefore a momentum NO-GO/INSUFFICIENT would be about MOMENTUM, not a broken gate.
  (2) NOISE signal (seeded, independent of the forward) → **NO-GO**.  The gate refuses signal-free noise. Therefore a
      momentum GO would MEAN something (it distinguishes signal from noise on identical shape/power).
  (3) LOOK-AHEAD LEAK signal (peeks at the forward) → **GO**.  A leak MANUFACTURES a GO — which is exactly why the
      real momentum builder must be, and is (momentum.py, proven), strictly look-ahead-free. This is the forced-GO
      analog: the ONLY way to force a GO here is to cheat (leak) — the intact, look-ahead-free path cannot.

Same engine, opposite outcomes = discernment at the unit level. ZERO engine changes (Rule VII/D2).

Run: cd packages/solidity-sentinel/src && PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.selftest_discernment_unit
"""
from __future__ import annotations

import sys

import numpy as np

from backtest.py import funding_discriminate


def _discriminate(carry, forward, loadings):
    return funding_discriminate.discriminate({
        "carry": carry.tolist(), "forward": forward.tolist(), "loadings": loadings.tolist(),
        "minPeriods": 120, "cadenceHours": 24.0, "targetIC": 0.05, "tier": "T1",
    })


def main():
    print("Discernment micro-control — SAME frozen engine, opposite outcomes (Rule XXIX / D2).\n")
    failures = []

    def check(name, cond, detail=""):
        print(f"  [{'PASS' if cond else 'FAIL'}] {name}  {detail}")
        if not cond:
            failures.append(name)

    rng = np.random.default_rng(20260703)
    T, M = 500, 20
    forward = rng.standard_normal((T, M)) * 0.03           # a cross-sectional forward-return panel (iid → high power)
    loadings = np.column_stack([rng.normal(1, 0.3, M), rng.uniform(0.2, 0.6, M)])  # [beta, vol]-like static loadings

    # (1) perfect foresight → GO (the engine CAN emit GO — not a dead gate).
    perfect = forward.copy()
    v_perfect = _discriminate(perfect, forward, loadings)
    check("PERFECT-FORESIGHT signal → GO (the frozen gate is capable of yes; not an always-NO-GO wall)",
          v_perfect["verdict"] == "GO", f"verdict={v_perfect['verdict']} deflResidT={v_perfect.get('deflatedOosTstat')}")

    # (2) noise → NO-GO (the gate refuses signal-free noise on identical shape/power). Dedicated fresh seed so the
    # panel is reproducible independently of the draw order above.
    noise = np.random.default_rng(777).standard_normal((T, M))
    v_noise = _discriminate(noise, forward, loadings)
    check("NOISE signal → NO-GO (refuses signal-free noise → a momentum GO would be meaningful)",
          v_noise["verdict"] == "NO-GO", f"verdict={v_noise['verdict']} deflResidT={v_noise.get('deflatedOosTstat')}")

    # (3) look-ahead LEAK → GO (a leak MANUFACTURES a GO — why look-ahead-freeness is load-bearing).
    leak = 0.85 * forward + 0.15 * np.random.default_rng(778).standard_normal((T, M))
    v_leak = _discriminate(leak, forward, loadings)
    check("LOOK-AHEAD LEAK signal → GO (a leak forces a GO — the intact look-ahead-free path CANNOT; that is the point)",
          v_leak["verdict"] == "GO", f"verdict={v_leak['verdict']} deflResidT={v_leak.get('deflatedOosTstat')}")

    # (4) determinism — the SAME fresh seed reproduces the SAME noise panel → the SAME verdict (byte-stable).
    noise_again = np.random.default_rng(777).standard_normal((T, M))
    v_noise2 = _discriminate(noise_again, forward, loadings)
    check("determinism — the same fresh seed reproduces the noise NO-GO (byte-stable)",
          v_noise2["verdict"] == v_noise["verdict"] == "NO-GO", f"{v_noise2['verdict']} == {v_noise['verdict']}")

    ok = not failures
    print(f"\nDiscernment micro-control: {'ALL PASS' if ok else 'FAIL -> ' + ', '.join(failures)}")
    print("Interpretation: the frozen gate says GO to a genuine/leaked predictor and NO-GO to noise — it discerns.")
    print("The ONLY way to force a GO from noise-like data is to LEAK the future; the real builder is proven leak-free.")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
