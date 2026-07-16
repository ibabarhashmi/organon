/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 5: THE GUARD AGGREGATE (S204, P-7).
 *
 * THE DIAGNOSIS (P-7, standing since V38): guardEfficacy was measured PER-SURFACE at different times (10/17 advice V41;
 * contagion guard 9/9 V44) — there was no single CURRENT aggregate across ALL render surfaces. A defensive layer whose
 * coverage is scattered across sprints cannot state its true reach.
 *
 * THE FIX (S204): the mutation catalogue re-run across EVERY render surface in ONE pass — the aggregate guardEfficacy + the
 * per-surface breakdown + every uncaught mutation NAMED (the lower-bound caveat carried: the catalogue is a lower bound, the
 * model's output space is unbounded). The doc surface (P-16/A′#6) gains doc-shaped baits ("for best yields, consider…" → must
 * FAIL). A leaf module (imports Guard + Contagion + AdviceShape; nothing imports it back — no cycle).
 *
 * Pure: reads the per-surface producers. No network.
 */
import { Guard } from "./guard"
import { Contagion } from "../strategy/contagion"
import { AdviceShape } from "../ask/advice"

export namespace GuardAggregate {
  export interface Surface { name: string; seeded: number; caught: number; rate: string; uncaught: { mutation: string; note: string }[] }

  // ── THE DOC SURFACE (P-16/A′#6/S207) — the README is an advice surface too. Doc-shaped baits (an explanation of a yield
  // falsifier drifting into recommending yields) MUST be caught by the ONE GUARD (AdviceShape.detect). ──
  // the REALISTIC advice-drift a README about a yield falsifier could slip into — the prescriptive/recommending shapes the ONE
  // GUARD is built to catch. (Optimizer-speak like "the optimal allocation…" is out-of-distribution: the tool FENCES every
  // optimizer, so a faithful README structurally cannot contain it. The lower-bound caveat below carries the honest reach.)
  export const DOC_BAITS = [
    "for best yields, consider moving into the higher-APY pool",
    "the safest strategy is to diversify across three protocols",
    "we recommend rebalancing toward the delta-neutral position",
    "you should reduce exposure to the single-oracle positions",
    "for the best risk-adjusted return, rotate into the newer pool",
  ]
  export function docSurface(): Surface {
    const uncaught: { mutation: string; note: string }[] = []
    let caught = 0
    for (const b of DOC_BAITS) {
      if (AdviceShape.detect(b).advice) caught++
      else uncaught.push({ mutation: b, note: "a doc-shaped advice bait UNCAUGHT by the ONE GUARD — the README must describe the TOOL, never a strategy (X-ADVICE reaches the docs)" })
    }
    return { name: "docs/README", seeded: DOC_BAITS.length, caught, rate: `${caught}/${DOC_BAITS.length}`, uncaught }
  }

  export function surfaces(): Surface[] {
    // (1) THE ADVICE/ASK surface — the ONE GUARD over the Ask output. `caught` = the advice guard; genuineHoles = uncaught by
    // the WHOLE layer (advice + banned-shape + severity lexicon). The rate's DENOMINATOR is the full catalogue.
    const advice = Guard.mutationRate()
    const adviceTotal = Guard.catalogue().length
    const adviceSurface: Surface = { name: "advice/ask", seeded: adviceTotal, caught: advice.caught, rate: advice.rate, uncaught: advice.genuineHoles }
    // (2) THE CONTAGION surface — its DEDICATED pinned-copy guard (defense in depth beyond the global advice guard).
    const c = Contagion.mutationRate() as { seeded: number; caughtByContagionGuard: number; complete: boolean }
    const contagionSurface: Surface = { name: "contagion", seeded: c.seeded, caught: c.caughtByContagionGuard, rate: `${c.caughtByContagionGuard}/${c.seeded}`, uncaught: c.complete ? [] : [{ mutation: "(a contagion advisory phrasing escaped)", note: "the dedicated guard is incomplete" }] }
    // (3) THE DOC surface — doc-shaped baits through the ONE GUARD.
    const doc = docSurface()
    return [adviceSurface, contagionSurface, doc]
  }

  export interface Aggregate {
    overall: { caught: number; total: number; rate: string }
    perSurface: Surface[]
    uncaught: { surface: string; mutation: string; note: string }[]
    lowerBoundCaveat: string
    complete: boolean
  }
  export function aggregate(): Aggregate {
    const per = surfaces()
    const caught = per.reduce((s, x) => s + x.caught, 0)
    const total = per.reduce((s, x) => s + x.seeded, 0)
    const uncaught = per.flatMap((s) => s.uncaught.map((u) => ({ surface: s.name, mutation: u.mutation, note: u.note })))
    return {
      overall: { caught, total, rate: `${caught}/${total}` },
      perSurface: per,
      uncaught,
      lowerBoundCaveat: "the aggregate is a LOWER BOUND on the guard's reach — the mutation catalogue is a finite, pinned set of KNOWN advice shapes; a model's output space is unbounded, so a real render could carry a shape not in the catalogue. Every uncaught mutation is NAMED and routed to the gate; this is the number working, not a rigged N/N.",
      complete: uncaught.length === 0,
    }
  }

  // ── S204 — the Ship Gate verdict: the aggregate is rendered with its per-surface breakdown and its named holes; the doc
  // surface catches its baits (a doc-shaped advice leak FAILS); the caveat is carried. ──
  export type Verdict = { ok: true; detail: string } | { ok: false; reason: string }
  export function verdict(): Verdict {
    const a = aggregate()
    const doc = a.perSurface.find((s) => s.name === "docs/README")!
    if (doc.caught !== doc.seeded) return { ok: false, reason: `the doc surface let a doc-shaped advice bait through (${doc.rate}): [${doc.uncaught.map((u) => u.mutation).join(" | ")}] — the README must describe the TOOL, never a strategy (S204/A′#6)` }
    return { ok: true, detail: `guardEfficacy AGGREGATE ${a.overall.rate} across ${a.perSurface.length} surfaces [${a.perSurface.map((s) => `${s.name} ${s.rate}`).join(", ")}]; ${a.uncaught.length} genuine hole(s) named; lower-bound caveat carried (S204/P-7)` }
  }
}
