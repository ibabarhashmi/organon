import { LendingPower } from "../lending/power"

// ORGΛNON — Attestation Hardening: the DERIVED power floor for a submitted returns series (Phase 3; Appendix D).
//
// Replaces attest.py's ASSERTED `n < 30` with a floor DERIVED from a power calculation: the minimum number of
// observations to detect a target per-observation Sharpe at ~80% power (one-sided 5%), adjusted for return
// autocorrelation. Same power framework as LendingPower (reuses its autocorrelation inflation). All inputs are
// PRE-SPECIFIED and stated — not tuned to a result (Rule IX). DISCLOSED: the floor guarantees power to detect at
// least a STRONG edge; detecting a WEAKER edge needs proportionally MORE data (the floor is a lower bound on data,
// the power an upper bound) — the conservative direction for an anti-over-attestation engine.

export namespace AttestPower {
  export const TARGET_ANN_SHARPE = 3.5 // the strong, clearly-attestable edge the floor guarantees power to detect
  export const Z_ALPHA = 1.645 // one-sided 5% significance
  export const Z_POWER = 0.84 // ≈ 80% power (Φ⁻¹(0.8))
  export const ASSUMED_AUTOCORR_RHO = 0.1 // mild per-period return autocorrelation

  export interface Floor {
    floorObs: number
    baseObs: number
    targetPerObsSharpe: number
    assumptions: { targetAnnSharpe: number; barsPerYear: number; zAlpha: number; zPower: number; autocorrRho: number }
    note: string
  }

  // Minimum observations to detect a target per-obs Sharpe SR* at ~80% power: n ≥ ((z_α + z_power)/SR*)²,
  // then inflated for AR(1) autocorrelation (N_nominal = N_eff·(1+ρ)/(1−ρ), reusing LendingPower.autocorrInflation).
  export function deriveObsFloor(barsPerYear = 365, opts?: { targetAnnSharpe?: number; rho?: number }): Floor {
    const targetAnn = opts?.targetAnnSharpe ?? TARGET_ANN_SHARPE
    const rho = opts?.rho ?? ASSUMED_AUTOCORR_RHO
    const srStar = targetAnn / Math.sqrt(Math.max(barsPerYear, 1))
    const baseObs = Math.ceil(((Z_ALPHA + Z_POWER) / srStar) ** 2)
    const floorObs = Math.ceil(baseObs * LendingPower.autocorrInflation(rho))
    return {
      floorObs,
      baseObs,
      targetPerObsSharpe: srStar,
      assumptions: { targetAnnSharpe: targetAnn, barsPerYear, zAlpha: Z_ALPHA, zPower: Z_POWER, autocorrRho: rho },
      note: `derived: ((z_α+z_power)/SR*)² × autocorr inflation (1+ρ)/(1−ρ); SR* = ${targetAnn}/√${barsPerYear} = ${srStar.toFixed(4)} per obs`,
    }
  }
}
