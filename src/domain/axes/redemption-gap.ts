/**
 * ORGΛNON — THE REDEMPTION-GAP AXIS (Domain sprint; LST-LRT's catch, X-DOMAIN c). For a liquid-staking / liquid-restaking
 * token the depeg hides in the difference between the PROTOCOL REDEMPTION VALUE (the protocol's own exchange rate — an
 * on-chain read, REAL★) and the THIN SECONDARY MARKET PRICE (a DEX pool — REAL-at-timestamp). peg = market ÷ redemption.
 * The axis renders the gap and the honest exit reality: at par requires the queue; now requires the pool. Pure,
 * deterministic, number-traced, INFO/CONTEXT. A FACT, never advice. Missing either leg → INSUFFICIENT (never a faked gap).
 */
import { Domain } from "../types"

export namespace RedemptionGap {
  export interface Gap { redemption: number; secondary: number; gapPct: number; peg: number; direction: "discount" | "premium" | "at-par" }

  // peg = secondary ÷ redemption; the gap is the % the market trades BELOW (discount) or ABOVE (premium) the redemption rate.
  export function redemptionGap(redemption: number, secondary: number): Gap | null {
    if (!Number.isFinite(redemption) || !Number.isFinite(secondary) || redemption <= 0) return null
    const peg = secondary / redemption
    const gapPct = +(((redemption - secondary) / redemption) * 100).toFixed(2)
    const direction = gapPct > 0.05 ? "discount" : gapPct < -0.05 ? "premium" : "at-par"
    return { redemption, secondary, gapPct, peg: +peg.toFixed(4), direction }
  }

  export interface Input {
    symbol: string // e.g. "stETH"
    denom: string // the redemption denom, e.g. "ETH"
    redemption: number | null // the on-chain protocol redemption rate (REAL★)
    secondary: number | null // the thin secondary DEX price (REAL-at-timestamp)
    queueReadable: boolean // the redemption-queue state is on-chain readable
    queueNote?: string // e.g. "withdrawals live" or "withdrawals locked until <event>"
    redemptionTier: "REAL★" | "REAL-at-timestamp" | "SAMPLE"
  }

  export function redemptionGapCatch(inp: Input): Domain.Catch {
    const g = inp.redemption !== null && inp.secondary !== null ? redemptionGap(inp.redemption, inp.secondary) : null
    const numbers: Record<string, number | string | null> = { redemption: inp.redemption, secondary: inp.secondary, gapPct: g?.gapPct ?? null, peg: g?.peg ?? null }
    if (!g) {
      return { axis: "redemption-gap", domain: "LST-LRT", disposition: "info/context", tier: "INSUFFICIENT", numbers,
        simple: `we can't yet show ${inp.symbol}'s redemption gap — one of the two prices (protocol redemption or market) isn't captured.`,
        pro: `redemption-gap: redemption=${inp.redemption ?? "—"} secondary=${inp.secondary ?? "—"} — INSUFFICIENT (a gap needs BOTH legs; never a faked gap).` }
    }
    const exit = inp.queueReadable ? (inp.queueNote ?? "the queue state is readable on-chain") : "the redemption queue state is not on-chain readable here"
    const tier = inp.redemptionTier === "REAL★" ? "REAL★" : inp.redemptionTier // the redemption leg drives the tier (the on-chain read)
    const gapWord = g.direction === "discount" ? `a ${g.gapPct}% gap` : g.direction === "premium" ? `a ${Math.abs(g.gapPct)}% premium` : "no gap (at par)"
    return { axis: "redemption-gap", domain: "LST-LRT", disposition: "info/context", tier, numbers,
      simple: g.direction === "discount"
        ? `${inp.symbol} redeems for ${inp.redemption} ${inp.denom} at the protocol, but the market pays less right now — to exit at full value you need the redemption queue; to exit now you take the lower pool price. (A fact about the gap, not what to do.)`
        : `${inp.symbol} trades close to its protocol redemption value right now — ${gapWord}. (A fact about the gap, not what to do.)`,
      pro: `Redemption ${inp.redemption} ${inp.denom}; market ${inp.secondary} ${inp.denom} — ${gapWord} (peg ${g.peg}). Exit at par needs the queue; exit now takes the pool price. (${exit}.) info/context — a fact about the redemption gap, never advice.` }
  }
}
