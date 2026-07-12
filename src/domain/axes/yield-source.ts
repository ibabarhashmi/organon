/**
 * ORGΛNON — THE YIELD-SOURCE ATTRIBUTION AXIS (Domain sprint; STABLE-SYNTH's catch, X-DOMAIN c). The single most
 * consequential lie in DeFi right now is a "stablecoin yield" that is really short-vol PERP-FUNDING CARRY. This axis tells
 * the truth about WHERE the number comes from: it attributes the yield to its actual source (funding-carry / lending /
 * emissions), computes the FUNDING-FLIP census over the real funding series (Hyperliquid + the free dYdX venue — negative
 * in N of M periods), and — because a stable whose yield depends on funding is NOT two independent facts — states the peg
 * and the yield JOINTLY. Pure, deterministic, number-traced, INFO/CONTEXT (it moves no verdict). A FACT, never advice.
 */
import { Domain } from "../types"

export namespace YieldSource {
  export interface Attribution { fundingCarryPct: number; lendingPct: number; emissionsPct: number; primary: "funding-carry" | "lending" | "emissions" | "mixed" }

  // THE FUNDING-FLIP CENSUS — over the real per-interval funding rates (Hyperliquid + dYdX combined), how often was funding
  // negative? A carry yield that lives on positive funding INVERTS when funding flips. Pure count; no smoothing.
  export interface FlipCensus { negative: number; total: number; pctNegative: number; everNegative: boolean }
  export function fundingFlipCensus(rates: number[]): FlipCensus {
    const total = rates.length
    const negative = rates.filter((r) => r < 0).length
    return { negative, total, pctNegative: total ? +((negative / total) * 100).toFixed(1) : 0, everNegative: negative > 0 }
  }

  // attribute the yield to its sources. A funding-sourced stable (its base yield IS perp carry) → the base is funding-carry;
  // else the base is lending interest. Reward emissions are always emissions. Percentages of the TOTAL yield.
  export function attributeYield(apyBase: number | null, apyReward: number | null, fundingSourced: boolean): Attribution {
    const base = Math.max(apyBase ?? 0, 0), reward = Math.max(apyReward ?? 0, 0), total = base + reward
    if (total <= 0) return { fundingCarryPct: 0, lendingPct: 0, emissionsPct: 0, primary: "lending" }
    const fundingCarry = fundingSourced ? base : 0
    const lending = fundingSourced ? 0 : base
    const pct = (x: number) => +((x / total) * 100).toFixed(1)
    const parts = { fundingCarryPct: pct(fundingCarry), lendingPct: pct(lending), emissionsPct: pct(reward) }
    const primary = parts.fundingCarryPct >= 50 ? "funding-carry" : parts.lendingPct >= 50 ? "lending" : parts.emissionsPct >= 50 ? "emissions" : "mixed"
    return { ...parts, primary }
  }

  export interface Input {
    apyBase: number | null
    apyReward: number | null
    fundingSourced: boolean // the subject's yield IS perp-funding carry (a synthetic stable like Ethena)
    fundingRates: number[] // the real per-interval funding series (Hyperliquid + dYdX), empty if none captured
    hasPeg: boolean // a stablecoin leg exists → peg + yield are ONE risk when funding-sourced
    venues: string[] // the funding venues read (e.g. ["hyperliquid", "dydx"])
    tier: "REAL★" | "REAL-at-timestamp" | "SAMPLE"
  }

  // the catch — the ONE honest line, in the pinned grammar (domain-pins CATCH_GRAMMAR["yield-source"]).
  export function yieldSourceCatch(inp: Input): Domain.Catch {
    const attr = attributeYield(inp.apyBase, inp.apyReward, inp.fundingSourced)
    const flip = fundingFlipCensus(inp.fundingRates)
    const numbers: Record<string, number | string | null> = { fundingCarryPct: attr.fundingCarryPct, lendingPct: attr.lendingPct, emissionsPct: attr.emissionsPct, negativePeriods: flip.negative, totalPeriods: flip.total, venues: inp.venues.join("+") || "none" }
    // INSUFFICIENT — a funding-sourced claim with no funding history is fabricated precision; render the honest gap.
    if (inp.fundingSourced && flip.total === 0) {
      return { axis: "yield-source", domain: "STABLE-SYNTH", disposition: "info/context", tier: "INSUFFICIENT", numbers,
        simple: "we can't yet show where this 'savings rate' really comes from — no funding history is captured.",
        pro: `yield-source: fundingSourced but 0 funding periods captured (venues: ${numbers.venues}) — INSUFFICIENT, no funding-flip census (fabricated precision refused).` }
    }
    if (attr.primary === "funding-carry") {
      const jointPeg = inp.hasPeg ? " and the peg takes the strain" : ""
      const jointPegPro = inp.hasPeg ? " Peg and yield are scored JOINTLY here — a funding flip strains the peg, so they are one risk, not two." : ""
      return { axis: "yield-source", domain: "STABLE-SYNTH", disposition: "info/context", tier: inp.tier, numbers,
        simple: `the "savings rate" here is really a bet that traders keep paying to be long — funding has flipped negative before, and if it does again, your yield can invert${inp.hasPeg ? " and stress the peg" : ""}. (This describes where the number comes from, not what to do.)`,
        pro: `Yield source: perp-funding carry (not lending interest) — ${attr.fundingCarryPct}% of the yield is funding-carry${attr.emissionsPct > 0 ? `, ${attr.emissionsPct}% emissions` : ""}; funding was negative in ${flip.negative} of the last ${flip.total} periods (${flip.pctNegative}%, venues: ${numbers.venues}); when it flips, this yield inverts${jointPeg}.${jointPegPro} info/context — a fact about the yield's source, never advice.` }
    }
    // lending / emissions primary — attribute honestly, no funding-flip alarm
    return { axis: "yield-source", domain: "STABLE-SYNTH", disposition: "info/context", tier: inp.tier, numbers,
      simple: `this yield is mostly ${attr.primary === "emissions" ? "temporary reward emissions" : "lending interest"} — ${attr.primary === "emissions" ? "it fades when the rewards stop" : "it comes from borrowers paying to borrow"}. (Where the number comes from, not what to do.)`,
      pro: `Yield source: ${attr.primary} — ${attr.lendingPct}% lending, ${attr.emissionsPct}% emissions${attr.fundingCarryPct > 0 ? `, ${attr.fundingCarryPct}% funding-carry` : ""}; not a short-vol funding bet. info/context — a fact about the yield's source, never advice.` }
  }
}
