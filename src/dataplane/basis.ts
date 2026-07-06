/**
 * ORGΛNON DATA-PLANE — the CeFi-DeFi FUNDING BASIS (Spine Phase 4; Rules R-BASIS, D-LABEL, E-ATTEMPT). The first
 * cross-venue domain: the basis joins a CeFi leg (Binance immutable checksummed dumps → T1) and a DeFi leg (Hyperliquid
 * free public funding → T2-forward). The load-bearing honesty (A′#6): the basis series' tier = **MIN(leg tiers)**,
 * carried on EVERY point and EVERY render. A T1 label on a series with a T2 leg is IMPOSSIBLE by construction
 * (`minTier` computes it; `assertTierIsMin` refuses a claim above it). A basis "history" synthesized from a revisable
 * API is refused upstream by the store's nonce physics (Hyperliquid.captureT2). The domain also renders its own DANGER,
 * not just its carry: the divergence view shows where the venues' funding diverges (a squeeze), the spread's instability.
 */
export namespace Basis {
  export type Tier = "T1" | "T2" | "T3"
  const RANK: Record<Tier, number> = { T1: 1, T2: 2, T3: 3 } // lower rank = STRONGER admissibility

  // MIN(legs) = the WEAKER tier (the higher rank number). MIN(T1, T2) = T2. This is the whole R-BASIS discipline.
  export function minTier(a: Tier, b: Tier): Tier {
    return RANK[a] >= RANK[b] ? a : b
  }

  export interface Leg {
    ts: number
    annualized: number // the annualized funding rate at ts
  }
  export interface BasisPoint {
    ts: number
    cexAnnualized: number
    dexAnnualized: number
    basisAnnualized: number // cex − dex (the carry a basis trade earns)
    cexTier: Tier
    dexTier: Tier
    tier: Tier // MIN(legs) — on EVERY point (a T1 basis with a T2 leg cannot exist)
  }

  export class TierError extends Error {}

  // build the basis from aligned CEX + DEX legs. Points are matched by timestamp (exact, after each leg is annualized).
  // A leg present on only one side is DROPPED (no fabricated cross-venue point) — honest gaps, never interpolation.
  export function build(cex: Leg[], cexTier: Tier, dex: Leg[], dexTier: Tier): BasisPoint[] {
    const dexByTs = new Map<number, number>()
    for (const d of dex) dexByTs.set(d.ts, d.annualized)
    const tier = minTier(cexTier, dexTier)
    const out: BasisPoint[] = []
    for (const c of cex) {
      if (!dexByTs.has(c.ts)) continue // no matching DEX interval → dropped, never bridged
      const dexA = dexByTs.get(c.ts)!
      out.push({ ts: c.ts, cexAnnualized: c.annualized, dexAnnualized: dexA, basisAnnualized: c.annualized - dexA, cexTier, dexTier, tier })
    }
    return out.sort((a, b) => a.ts - b.ts)
  }

  // R-BASIS wall: the basis tier MUST equal MIN(legs). A claim above it (a seeded T1 on a T2-legged basis) is REFUSED.
  export function assertTierIsMin(bp: BasisPoint): void {
    const expected = minTier(bp.cexTier, bp.dexTier)
    if (bp.tier !== expected) throw new TierError(`basis tier ${bp.tier} exceeds MIN(legs)=${expected} (cex=${bp.cexTier}, dex=${bp.dexTier}) — a basis is only as strong as its weakest leg (R-BASIS)`)
  }
  export function verifyAllMinTier(points: BasisPoint[]): { ok: boolean; badAt: number | null } {
    for (const p of points) {
      if (p.tier !== minTier(p.cexTier, p.dexTier)) return { ok: false, badAt: p.ts }
    }
    return { ok: true, badAt: null }
  }

  // the DIVERGENCE view — the spread's own instability (the danger the research flagged: venues diverge in a squeeze).
  export interface Divergence { std: number; maxAbs: number; signFlips: number; mean: number; render: string }
  export function divergence(points: BasisPoint[]): Divergence {
    const b = points.map((p) => p.basisAnnualized)
    const n = b.length
    if (!n) return { std: 0, maxAbs: 0, signFlips: 0, mean: 0, render: "basis divergence: (no points)" }
    const mean = b.reduce((s, x) => s + x, 0) / n
    const std = Math.sqrt(b.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, n - 1))
    const maxAbs = Math.max(...b.map((x) => Math.abs(x)))
    let signFlips = 0
    for (let i = 1; i < n; i++) if (Math.sign(b[i]) !== Math.sign(b[i - 1]) && b[i] !== 0 && b[i - 1] !== 0) signFlips++
    return { std, maxAbs, signFlips, mean, render: `basis divergence: mean ${(mean * 100).toFixed(2)}%/yr · vol ${(std * 100).toFixed(2)}% · max |basis| ${(maxAbs * 100).toFixed(2)}% · ${signFlips} sign-flips (the spread's own instability — it renders its danger, not just its carry)` }
  }

  // a basis-carry strategy's per-interval return series (earn the annualized spread, de-annualized to the interval).
  export function carryReturns(points: BasisPoint[], intervalHours: number): number[] {
    const perIntervalFactor = intervalHours / (24 * 365)
    return points.map((p) => p.basisAnnualized * perIntervalFactor)
  }

  // render the basis with PER-LEG tiers + the MIN tier on every line (R-BASIS: tiers everywhere they render).
  export function render(points: BasisPoint[], legNames = { cex: "Binance", dex: "Hyperliquid" }): string {
    if (!points.length) return "BASIS — (no aligned cross-venue points)"
    const t = points[0]
    const head = `BASIS (${legNames.cex} vs ${legNames.dex}) — ${points.length} pts · tier = MIN(legs) = ${t.tier}  [${legNames.cex} ${t.cexTier} · ${legNames.dex} ${t.dexTier}]`
    const div = divergence(points)
    return `${head}\n  ${div.render}\n  NB the basis is only as strong as its weakest leg — it can NEVER be labeled ${minTier(t.cexTier, t.dexTier) === "T2" ? "T1" : "a tier above MIN(legs)"} (R-BASIS)`
  }
}
