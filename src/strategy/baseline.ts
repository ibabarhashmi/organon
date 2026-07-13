/**
 * ORGΛNON — THE CADENCE SPRINT (X-CADENCE b, S76). THE BASELINE IS THE THESIS' FIXED FRAME. When a manifest is registered,
 * the composed facts surface is CONTENT-HASHED exactly as the exit criterion is (`exit.ts`), INCLUDING each position's
 * governance `adminClass` (the MR3 seam) — the frame every future cycle's deltas compute against. It cannot move in silence:
 *   · `pin(surface, at)` → the content-hashed baseline record (the goalpost frame, fixed at registration);
 *   · `diff(baseline, current)` → typed Delta[], DETERMINISTIC ×2, each delta carrying its baseline hash + capture tier,
 *     UNJUDGEABLE-honest when a fact was not captured at baseline OR now (never a fabricated move);
 *   · `detectSilentEdit(baseline)` → a silent re-base is DETECTED (the stored hash no longer recomputes over the surface);
 *   · `repin(...)` → the ONLY sanctioned amendment: a DISCLOSED re-pin recording {old, new, reason} (never a silent overwrite).
 * Deltas are shaped as FLAT ATTRIBUTE RECORDS (the Cedar seam — a later policy evaluator reads them with zero migration).
 * Pure; no I/O; no model; the statistics change by exactly nothing (this reads the engine's own captured facts).
 */
import { createHash } from "node:crypto"
import { FactEnvelope } from "./envelope"

export namespace Baseline {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

  // one position's baseline-relevant facts — each already captured by the pipeline (verdict, tiers, the exit facts, and the
  // governance class the MR3 wire threads in). A `null` means the engine could not capture that fact → UNJUDGEABLE on diff.
  export interface PositionSurface {
    subjectKey: string
    name: string
    verdict: string // SOLID | CAUTION | AVOID | UNVERIFIED (the position's OWN verdict — unchanged; never a composite)
    govClass: string | null // the governance adminClass at baseline (MR3) — EOA|SAFE|TIMELOCK|IMMUTABLE|UNRESOLVED|null
    captureTier: string // REAL★ | REAL-at-timestamp | SAMPLE (carried onto every delta line)
    peg: number | null
    tvlDrawdown: number | null // fraction from captured peak
    fundingNegPeriods: number | null
    fundingTotalPeriods: number | null
  }

  // the composed facts surface hashed at registration (per-position verdicts + tiers + the exit facts + governance classes
  // · effective-K · catch aggregation · worst axis · the exit hash). Canonical (stable key order) so the hash is stable.
  export interface Surface {
    positions: PositionSurface[]
    effectiveK: number | null
    catch: { fundingCarryCount: number; leveredCount: number; rwaPresent: boolean; totalReachable: number }
    worstAxis: { subjectKey: string; axis: string; tier: string } | null
    exitHash: string | null
  }

  export interface Record {
    hash: string // sha256 over the canonical surface — the frame, fixed at registration (a silent edit diverges)
    registeredAt: string // caller-supplied (deterministic tests + committed fixtures); metadata, EXCLUDED from the hash
    surface: Surface
  }

  // the content hash over the surface ONLY (registeredAt excluded) — canonical key order so it is stable + deterministic ×2.
  export function hashOf(surface: Surface): string {
    return sha256(FactEnvelope.canonical(surface))
  }

  // PIN — the baseline frame, fixed at registration. `at` is caller-supplied (deterministic). The govClass on each
  // PositionSurface is the MR3 seam already threaded by the caller (resolve.ts reads governance.artifact.adminClass).
  export function pin(surface: Surface, at: string): Record {
    return { hash: hashOf(surface), registeredAt: at, surface }
  }

  // a silent re-base is DETECTED — the stored hash no longer recomputes over the stored surface (a quiet overwrite).
  export function detectSilentEdit(baseline: Record): boolean {
    return hashOf(baseline.surface) !== baseline.hash
  }

  export interface Repin {
    old: Surface
    new: Surface
    oldHash: string
    newHash: string
    reason: string
    at: string
  }

  // the ONLY sanctioned amendment — a DISCLOSED re-pin recording {old, new, reason}. A reader sees exactly what moved + why.
  export function repin(oldBaseline: Record, newSurface: Surface, reason: string, at: string): { ok: true; repin: Repin; baseline: Record } | { ok: false; error: string } {
    if (!reason || reason.trim().length === 0) return { ok: false, error: "A baseline re-pin must state WHY the frame moved — a goalpost cannot move without a disclosed reason. Refused." }
    return { ok: true, repin: { old: oldBaseline.surface, new: newSurface, oldHash: oldBaseline.hash, newHash: hashOf(newSurface), reason: reason.trim(), at }, baseline: pin(newSurface, at) }
  }

  // a typed, flat delta record (the Cedar seam — a later policy evaluator reads flat attribute records with zero migration).
  export interface Delta {
    kind: "verdict" | "peg" | "tvl-drawdown" | "funding-census" | "governance" | "effective-bets" | "worst-axis"
    subjectKey: string | null // null for portfolio-level deltas (effective-bets, worst-axis)
    baselineHash: string // every delta names the baseline it measures against (first 8 rendered)
    captureTier: string | null // the capture tier of the CURRENT reading (SAMPLE/REAL@ts/REAL★)
    judgeable: boolean // false when the fact was not captured at baseline OR now (never a fabricated move)
    changed: boolean
    text: string
  }

  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(4))
  const h8 = (h: string) => h.slice(0, 8)

  // DIFF — the current surface against the pinned baseline. Deterministic ×2. Every delta carries its baseline hash + the
  // current capture tier; a fact absent at baseline OR now → UNJUDGEABLE (never a fabricated move). Position deltas are
  // keyed by subjectKey (a position present at baseline but gone now is reported; a new position is reported).
  export function diff(baseline: Record, current: Surface): Delta[] {
    const bh = baseline.hash
    const deltas: Delta[] = []
    const byKey = new Map(current.positions.map((p) => [p.subjectKey, p]))
    for (const b of baseline.surface.positions) {
      const c = byKey.get(b.subjectKey)
      const tier = c?.captureTier ?? null
      const label = b.name || b.subjectKey
      if (!c) {
        deltas.push({ kind: "verdict", subjectKey: b.subjectKey, baselineHash: bh, captureTier: tier, judgeable: false, changed: false, text: `${label}: not a reachable position this cycle — UNJUDGEABLE (baseline ${h8(bh)}).` })
        continue
      }
      // verdict (the position's OWN verdict — never a composite)
      const vChanged = b.verdict !== c.verdict
      deltas.push({ kind: "verdict", subjectKey: b.subjectKey, baselineHash: bh, captureTier: tier, judgeable: true, changed: vChanged, text: `${label} verdict: ${b.verdict} at baseline → ${c.verdict} now — ${vChanged ? "CHANGED" : "unchanged"} (baseline ${h8(bh)}, capture ${tier}).` })
      // governance class (MR3) — the delta the manifest sprint left null
      if (b.govClass != null && c.govClass != null) {
        const gChanged = b.govClass !== c.govClass
        deltas.push({ kind: "governance", subjectKey: b.subjectKey, baselineHash: bh, captureTier: tier, judgeable: true, changed: gChanged, text: `${label} governance class: ${b.govClass} at baseline → ${c.govClass} now — ${gChanged ? "CHANGED" : "unchanged"} (baseline ${h8(bh)}).` })
      } else {
        deltas.push({ kind: "governance", subjectKey: b.subjectKey, baselineHash: bh, captureTier: tier, judgeable: false, changed: false, text: `${label} governance class: UNJUDGEABLE — no resolved governance read at ${b.govClass == null ? "baseline" : "this cycle"} (baseline ${h8(bh)}).` })
      }
      // peg
      if (b.peg != null && c.peg != null) {
        const d = c.peg - b.peg
        deltas.push({ kind: "peg", subjectKey: b.subjectKey, baselineHash: bh, captureTier: tier, judgeable: true, changed: d !== 0, text: `${label} peg: ${fmt(b.peg)} at baseline → ${fmt(c.peg)} now (Δ ${d >= 0 ? "+" : ""}${fmt(d)}, baseline ${h8(bh)}, capture ${tier}).` })
      } else if (b.peg != null || c.peg != null) {
        deltas.push({ kind: "peg", subjectKey: b.subjectKey, baselineHash: bh, captureTier: tier, judgeable: false, changed: false, text: `${label} peg: UNJUDGEABLE — no captured peg at ${b.peg == null ? "baseline" : "this cycle"} (baseline ${h8(bh)}).` })
      }
      // tvl drawdown (fraction from peak — the engine's own reading; NOT a raw TVL magnitude, which it does not capture)
      if (b.tvlDrawdown != null && c.tvlDrawdown != null) {
        const d = c.tvlDrawdown - b.tvlDrawdown
        deltas.push({ kind: "tvl-drawdown", subjectKey: b.subjectKey, baselineHash: bh, captureTier: tier, judgeable: true, changed: d !== 0, text: `${label} TVL drawdown from peak: ${fmt(b.tvlDrawdown)} at baseline → ${fmt(c.tvlDrawdown)} now (${d > 0 ? "deeper by " : d < 0 ? "shallower by " : "unchanged, "}${fmt(Math.abs(d))}, baseline ${h8(bh)}, capture ${tier}).` })
      }
      // funding-flip census
      if (b.fundingNegPeriods != null && c.fundingNegPeriods != null) {
        const d = c.fundingNegPeriods - b.fundingNegPeriods
        const of = c.fundingTotalPeriods != null ? ` of ${c.fundingTotalPeriods}` : ""
        deltas.push({ kind: "funding-census", subjectKey: b.subjectKey, baselineHash: bh, captureTier: tier, judgeable: true, changed: d !== 0, text: `${label} funding-flip census: ${d > 0 ? `${d} new negative period${d === 1 ? "" : "s"} since baseline` : d < 0 ? `${-d} fewer negative period${-d === 1 ? "" : "s"} than baseline` : "no change since baseline"} (${b.fundingNegPeriods} → ${c.fundingNegPeriods}${of}, baseline ${h8(bh)}).` })
      }
    }
    // portfolio-level: effective bets
    if (baseline.surface.effectiveK != null && current.effectiveK != null) {
      const d = current.effectiveK - baseline.surface.effectiveK
      deltas.push({ kind: "effective-bets", subjectKey: null, baselineHash: bh, captureTier: null, judgeable: true, changed: d !== 0, text: `effective bets: ≈${fmt(baseline.surface.effectiveK)} at baseline → ≈${fmt(current.effectiveK)} now (baseline ${h8(bh)}). info/context — a fact about correlation, never an allocation.` })
    }
    // portfolio-level: worst axis
    const bw = baseline.surface.worstAxis
    const cw = current.worstAxis
    if (bw || cw) {
      const bTxt = bw ? `${bw.subjectKey}'s ${bw.axis} (${bw.tier})` : "none"
      const cTxt = cw ? `${cw.subjectKey}'s ${cw.axis} (${cw.tier})` : "none"
      const changed = bTxt !== cTxt
      deltas.push({ kind: "worst-axis", subjectKey: null, baselineHash: bh, captureTier: null, judgeable: true, changed, text: `weakest deciding axis: ${bTxt} at baseline → ${cTxt} now — ${changed ? "CHANGED" : "unchanged"} (baseline ${h8(bh)}).` })
    }
    return deltas
  }
}
