/**
 * ORGΛNON — THE LEVERAGE-DISTANCE AXIS (Domain sprint; LOOPED-CDP's catch, X-DOMAIN c). A 30% APY at 8× leverage is a
 * 3.75% strategy wearing a costume, and the number that decides your outcome is NOT the APY but HOW FAR the collateral can
 * fall before you are liquidated. The axis reads collateral / debt / liquidation-threshold on-chain (REAL★, block-pinned),
 * computes the EFFECTIVE LEVERAGE and the LIQUIDATION DISTANCE in percent, and renders both beside the headline APY. Pure,
 * deterministic, number-traced, INFO/CONTEXT. A FACT, never advice. Degenerate inputs → INSUFFICIENT (never a faked number).
 */
import { Domain } from "../types"

export namespace LeverageDistance {
  export interface Lev { leverage: number; distancePct: number; healthFactor: number }

  // effective leverage = collateral / equity, where equity = collateral − debt. liquidation distance = the % the collateral
  // value can fall before collateral·liqThreshold = debt (health factor → 1). All in the same unit (USD or the collateral's).
  export function leverageDistance(collateral: number, debt: number, liqThreshold: number): Lev | null {
    if (!Number.isFinite(collateral) || !Number.isFinite(debt) || !Number.isFinite(liqThreshold)) return null
    if (collateral <= 0 || liqThreshold <= 0 || liqThreshold > 1 || debt < 0 || debt >= collateral) return null // no equity / nonsensical → INSUFFICIENT
    const equity = collateral - debt
    const leverage = collateral / equity
    const healthFactor = (collateral * liqThreshold) / debt // liquidation at HF = 1
    const distancePct = +((1 - debt / (collateral * liqThreshold)) * 100).toFixed(1) // the % collateral drop to liquidation
    return { leverage: +leverage.toFixed(1), distancePct, healthFactor: +healthFactor.toFixed(2) }
  }

  export interface Input {
    collateral: number | null
    debt: number | null
    liqThreshold: number | null // the liquidation threshold (e.g. 0.83 for an 83% LT market)
    headlineApy: number | null // the levered headline APY
    tier: "REAL★" | "REAL-at-timestamp" | "SAMPLE"
  }

  export function leverageDistanceCatch(inp: Input): Domain.Catch {
    const l = inp.collateral !== null && inp.debt !== null && inp.liqThreshold !== null ? leverageDistance(inp.collateral, inp.debt, inp.liqThreshold) : null
    const numbers: Record<string, number | string | null> = { leverage: l?.leverage ?? null, distancePct: l?.distancePct ?? null, healthFactor: l?.healthFactor ?? null, headlineApy: inp.headlineApy }
    if (!l) {
      return { axis: "leverage-distance", domain: "LOOPED-CDP", disposition: "info/context", tier: "INSUFFICIENT", numbers,
        simple: "we can't yet show this vault's real leverage — the on-chain collateral/debt/liquidation reads aren't captured.",
        pro: `leverage-distance: collateral=${inp.collateral ?? "—"} debt=${inp.debt ?? "—"} liqThreshold=${inp.liqThreshold ?? "—"} — INSUFFICIENT (never a faked leverage number).` }
    }
    const apyTxt = inp.headlineApy !== null ? `${inp.headlineApy}%` : "the headline"
    const unlevered = inp.headlineApy !== null ? +(inp.headlineApy / l.leverage).toFixed(1) : null
    return { axis: "leverage-distance", domain: "LOOPED-CDP", disposition: "info/context", tier: inp.tier, numbers,
      simple: `that ${apyTxt} yield is borrowed ${l.leverage}× — a roughly ${l.distancePct}% drop in the collateral price would liquidate the position${unlevered !== null ? `; stripped of the leverage it's about ${unlevered}%` : ""}. (A fact about the leverage, not what to do.)`,
      pro: `Headline ${apyTxt} APY is ${l.leverage}× levered — a ${l.distancePct}% collateral move liquidates you (health factor ${l.healthFactor}${unlevered !== null ? `; unlevered ≈ ${unlevered}%` : ""}). info/context — a fact about effective leverage + distance-to-liquidation, never advice.` }
  }
}
