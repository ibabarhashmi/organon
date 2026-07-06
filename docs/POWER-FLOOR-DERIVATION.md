# ORGΛNON — The Power-Floor Derivation (exposed for external audit)

> **Status: UNAUDITED.** This document exposes the *load-bearing* formula behind every "structurally un-powered"
> conclusion so an external statistician can check it. The breadth pre-flight and the two-failure-mode classifier
> **report and flag** on this floor; they **do not auto-refuse** any domain on it (Rule A-PRE / XXXVIII). Until this
> derivation is externally validated, "reachable=false" is a **diagnostic pending floor audit**, never settled truth.
>
> **The formula is FROZEN and is NOT changed by this document.** This is documentation of the existing
> `derive_power_floor` in `src/backtest/py/effective_n.py` (Rule VII — the frozen computation is untouched). The
> worked examples below are asserted **byte-identical to the engine's output** by `test/organon/floor_derivation.test.ts`.

---

## 1. What the floor is, and why it exists

A cross-sectional strategy earns its return by ranking `M` assets each period and betting on the spread. Its evidence
is the **information coefficient (IC)** — the rank correlation between the signal and the forward return — averaged over
`N` periods. A GO requires the mean IC to be significant (`t > 3`) *and* material (`mean IC > 0.02`) *and* the sorted
long-short portfolio to be significant (`t > 2.5`).

Two things secretly govern whether that is *achievable at all*, independent of the edge:

1. **Effective breadth `M_eff`** — how many *independent* bets the cross-section actually offers. If all `M` assets
   move with one market factor (crypto), `M_eff` is far below `M` (measured ≈ 2.4 for 20–107 crypto perps). Fewer
   independent bets ⇒ a noisier per-period IC ⇒ more periods needed.
2. **Effective sample `N_eff = N / τ_int`** — how many *independent* periods you have, after autocorrelation. A
   persistent signal decorrelates slowly ⇒ `N_eff ≪ N`.

The **power floor** is the number of *effective periods* needed to detect a target-strength IC at the gate, given the
breadth. If `N_eff < floor`, no signal of any strength can be *trusted* to clear the bar here — the sample cannot
distinguish a real edge from noise at the required confidence. That is "structurally un-powered."

---

## 2. The formula (as frozen in `effective_n.derive_power_floor`)

Inputs: `target_ic` (default **0.05**), `M_eff` (effective breadth), `τ_int` (integrated autocorrelation time),
`cadence_hours`. Constants: `T_GATE = 3.0`, `Z_POWER = 0.84 = Φ⁻¹(0.8)` (a one-sided ~80% power quantile).

```
(a) per-period IC standard error   se        = 1 / sqrt( max(M_eff − 3, 1) )            # Fisher SE of a correlation
(b) effective periods needed       N_eff_need = ( (T_GATE + Z_POWER) · se / target_ic )² # detect target_ic at the gate w/ power
(c) nominal periods needed         N_nom_need = N_eff_need · max(τ_int, 1)               # inflate for autocorrelation
(d) wall-clock horizon             days       = N_nom_need · cadence_hours / 24
    effectivePeriodsNeeded = ceil(N_eff_need)      # ← THE FLOOR the pre-flight compares N against
    nominalPeriodsNeeded   = ceil(N_nom_need)
```

**Derivation of (b).** The IC's per-period SE is `se` (Fisher). Over `N_eff` independent periods the mean-IC SE is
`se / sqrt(N_eff)`. To claim significance at the gate *with* power margin, the signal-to-noise must exceed
`T_GATE + Z_POWER`: `target_ic / (se / sqrt(N_eff)) > T_GATE + Z_POWER`. Solving for `N_eff` gives (b).

---

## 3. Worked examples (asserted == the frozen engine)

`target_ic = 0.05`, `T_GATE + Z_POWER = 3.84`. Note the **clamp**: `max(M_eff − 3, 1)` ⇒ for `M_eff ≤ 4`, `se = 1.0`.

| `M_eff` | `se = 1/√(max(M_eff−3,1))` | `N_eff_need = (3.84·se/0.05)²` | **floor = ⌈N_eff_need⌉** | regime |
|---|---|---|---|---|
| **2.309** (20-perp momentum) | 1/√1 = **1.0000** | (3.84/0.05)² = 76.8² = 5898.24 | **5899** | crypto single-factor |
| **2.400** (crypto, any ≤4) | 1.0000 | 5898.24 | **5899** | crypto single-factor |
| **46.30** (60-col noise) | 1/√43.3 = 0.1520 | (3.84·0.152/0.05)² = 136.22 | **137** | iid |
| **50.32** (107-perp noise) | 1/√47.3 = 0.1454 | 124.64 | **125** | iid |
| **78.00** (synthetic independent) | 1/√75 = 0.1155 | 78.64 | **79** | iid |

**The crypto result in one line:** at `M_eff ≈ 2.4`, `se` is clamped to 1.0, so the floor is **5899 effective periods**
regardless of edge — and a 2–3-year weekly panel offers ~100–150 periods (perfect-foresight `N_eff ≈ 87`). `87 ≪ 5899`
⇒ structurally un-powered. An *iid* signal (noise, `M_eff ≈ 50`) needs only ~125 — which is why breadth, not universe
size, is the binding constraint.

---

## 4. The audit surface — what a statistician should check

The whole "structurally un-powered" conclusion rests on these; each is a real modeling choice, not a settled fact:

1. **Is `se = 1/√(M_eff − 3)` the right per-period IC SE?** This is the Fisher SE of a Pearson correlation with
   `M_eff` observations. The IC here is a **Spearman rank** correlation over `M_eff` *effective* (not raw) assets.
   Is the Fisher/Pearson SE appropriate for a rank IC? Is `M_eff − 3` (vs `M_eff − 1`, or another dof) correct?
2. **Is the clamp `max(M_eff − 3, 1)` too conservative?** For `M_eff ≤ 4` it pins `se = 1.0`, making the floor a
   flat 5899 for *all* low-breadth panels. Is a flat, breadth-insensitive floor in the crypto regime justified, or
   does it over-penalize? (This single clamp is why every crypto cross-section is declared un-powered.)
3. **Is `M_eff` (participation ratio of the correlation eigenvalues, `(Σλ)²/Σλ²`) the right breadth measure?**
4. **Is `Z_POWER = 0.84` (≈80% power) the right power target?** A lower power target lowers the floor.
5. **Is `target_ic = 0.05` the right target for crypto?** A larger defensible target IC lowers the floor sharply
   (floor ∝ 1/target_ic²).

If (2) or (5) are judged too conservative, some crypto domains could become reachable. **That is exactly why the
pre-flight reports but does not auto-refuse — this formula must be audited before it is ever allowed to gate.**

---

## 5. Reproduce it

```
cd packages/solidity-sentinel/src
echo '{"panel": <T×M array>, "targetIC": 0.05}' | PYTHONHASHSEED=0 backtest/py/.venv/bin/python -m backtest.py.preflight
# or the raw floor:
PYTHONHASHSEED=0 backtest/py/.venv/bin/python -c "from backtest.py import effective_n as e; print(e.derive_power_floor(0.05, 2.4, 1.0)['effectivePeriodsNeeded'])"  # → 5899
```

The frozen source: `src/backtest/py/effective_n.py` → `derive_power_floor` (the formula), `effective_breadth` (M_eff),
`canonical_tau` (τ_int), `power_status` (the powered check). None are modified by this document.
