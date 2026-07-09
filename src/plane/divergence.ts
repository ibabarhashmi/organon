/**
 * ORGΛNON SOVEREIGN PLANE — DIVERGENCE (Sovereign Spine B; X-PLANE d). The rule that keeps two planes honest with each
 * other: the rented plane (DeFiLlama free · GeckoTerminal) STAYS as breadth; where the own-plane and the rented plane
 * disagree on an overlapping value beyond a pinned tolerance, the divergence is a SURFACED FACT — recorded + rendered
 * Pro-side — NEVER silently resolved toward either source. The own-plane DEEPENS; it does not silently overwrite.
 *
 * This is the PURE check (a `(own, rented) → Divergence[]` function); the Pro-side row is rendered in the render layer
 * (reality.ts divergenceRow) — a ROW, not a screen; absent when there is no divergence (so the S36 golden screens, which
 * carry no plane data, render byte-identical). A divergence auto-resolved toward either source is a Halt (S39).
 */
export namespace PlaneDivergence {
  export const TOLERANCE_PCT = 5 // the pinned band (sovereign-pins.plane.divergence.tolerancePct) — the SURFACING is the honesty claim, not the exact value

  export interface Point { key: string; value: number; asOf?: number }
  export interface Divergence { key: string; own: number; rented: number; deltaPct: number; asOf: number | null }

  // for each OVERLAPPING key, if |own − rented| / |rented| exceeds the tolerance, RECORD a Divergence. NEVER resolves
  // toward either source — it names the disagreement as a fact the quant deserves. Deterministic; pure.
  export function divergences(own: Point[], rented: Point[], tolerancePct: number = TOLERANCE_PCT): Divergence[] {
    const r = new Map(rented.map((p) => [p.key, p.value]))
    const out: Divergence[] = []
    for (const o of own) {
      if (!r.has(o.key)) continue // only overlapping values are comparable
      const rv = r.get(o.key)!
      const denom = Math.abs(rv) > 1e-12 ? Math.abs(rv) : 1
      const deltaPct = (Math.abs(o.value - rv) / denom) * 100
      if (deltaPct > tolerancePct) out.push({ key: o.key, own: o.value, rented: rv, deltaPct: +deltaPct.toFixed(2), asOf: o.asOf ?? null })
    }
    return out.sort((a, b) => a.key.localeCompare(b.key))
  }
}
