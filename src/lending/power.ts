// ORGΛNON Lending-Carry Hardening — DERIVED power floor (Phase 5). Replaces the bare, asserted
// MIN_PANEL_DAYS_FOR_POWER=90 with a floor derived from EFFECTIVE sample size under (1) daily autocorrelation of the
// IC series and (2) cross-sectional dependence (effective breadth ≪ nominal market count). All inputs are
// PRE-SPECIFIED and stated — not tuned to a result (Rule IX).

export namespace LendingPower {
  // ── Assumptions (pre-specified; stated so the derivation is auditable) ──
  export const TARGET_IC = 0.05 // the smallest cross-sectional information coefficient worth detecting (a modest, real edge)
  export const T_GATE = 3.0 // matches the discriminator's OOS t-gate (neutralize.py)
  export const Z_POWER = 0.84 // ≈ 80% power, one-sided (Φ⁻¹(0.8))
  // ~320 stablecoin markets cluster heavily by chain + collateral + asset → independent breadth is far smaller.
  export const ASSUMED_EFFECTIVE_BREADTH = 40
  // daily autocorrelation of the per-period IC series (the T1 weekly panel measured ρ≈0.37; daily is similar/higher).
  export const ASSUMED_AUTOCORR_RHO = 0.3
  // MEASURED where a series exists (Rule XXVII): the T1 weekly lending panel's lag-1 IC autocorrelation. Use this in
  // place of the assumed daily ρ wherever the weekly panel applies; the assumed constants are a pre-data fallback only.
  export const MEASURED_WEEKLY_RHO = 0.37

  // Periods needed so the Fama-MacBeth t-stat clears the gate at the target power.
  //   per-period IC SE ≈ 1/sqrt(M_eff − 3)   (Fisher);   t = targetIC·sqrt(Neff)/SE  >  T_GATE + Z_POWER
  export function effectivePeriodsNeeded(targetIC: number, effBreadth: number, tGate = T_GATE, zPower = Z_POWER): number {
    const sePerPeriod = 1 / Math.sqrt(Math.max(effBreadth - 3, 1))
    return Math.ceil(((tGate + zPower) * sePerPeriod / targetIC) ** 2)
  }

  // Autocorrelation inflates the nominal periods needed: N_nominal = N_eff · (1+ρ)/(1−ρ) (AR(1) effective-sample).
  export function autocorrInflation(rho: number): number {
    return (1 + rho) / (1 - Math.min(rho, 0.99))
  }

  export interface Floor {
    floorDays: number
    effectivePeriods: number
    assumptions: { targetIC: number; effectiveBreadth: number; autocorrRho: number; tGate: number; zPower: number }
    // Rule XXVII (measured-over-assumed parity): true when the floor rests on ASSUMED constants (no measured panel
    // input supplied) — the domain must be labelled assumed-pending-data and NOT marketed as a credible-GO candidate.
    assumed: boolean
    // The switch-to-measured gate: when a matured lending panel supplies measured (effectiveBreadth, rho), pass them to
    // deriveFloorDays and `assumed` flips to false. Stated here so the gate is auditable, not implicit.
    switchToMeasured: string
    note: string
  }

  export function deriveFloorDays(opts?: { targetIC?: number; effectiveBreadth?: number; rho?: number }): Floor {
    const targetIC = opts?.targetIC ?? TARGET_IC
    const effBreadth = opts?.effectiveBreadth ?? ASSUMED_EFFECTIVE_BREADTH
    const rho = opts?.rho ?? ASSUMED_AUTOCORR_RHO
    const assumed = opts?.effectiveBreadth == null || opts?.rho == null // any input falling back to a constant ⇒ assumed
    const effectivePeriods = effectivePeriodsNeeded(targetIC, effBreadth)
    const floorDays = Math.ceil(effectivePeriods * autocorrInflation(rho))
    return {
      floorDays,
      effectivePeriods,
      assumptions: { targetIC, effectiveBreadth: effBreadth, autocorrRho: rho, tGate: T_GATE, zPower: Z_POWER },
      assumed,
      switchToMeasured: assumed
        ? `ASSUMED-PENDING-DATA (M_eff=${effBreadth}${opts?.effectiveBreadth == null ? " assumed" : ""}, ρ=${rho}${opts?.rho == null ? " assumed" : ""}). Gate: pass measured (effectiveBreadth, rho) from a matured panel to switch to MEASURED (Rule XXVII).`
        : "MEASURED from the supplied panel inputs.",
      note: `derived from effective sample size: ${effectivePeriods} effective periods × autocorr inflation (1+ρ)/(1−ρ) at ρ=${rho}`,
    }
  }

  // AR(1)-effective sample size of an observed series of length n with measured lag-1 autocorrelation rho.
  export function effectiveSample(n: number, rho: number): number {
    return Math.max(1, Math.round(n * (1 - rho) / (1 + Math.max(rho, 0))))
  }
}
