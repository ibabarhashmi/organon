/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 3: THE GUARD'S REAL NUMBER (S158, DD-63). NO NEW LAW (a fifth sprint).
 *
 * Six sprints of guardEfficacy: UNJUDGEABLE, remedied twice by promising to say it LOUDER — and louder is not a mechanism
 * (K-6). The test was in the constitution the whole time: X-MANIFEST's banned-output list, written in the Manifest sprint
 * (V31), before any guard existed, IS the mutation catalogue. MUTATION TESTING seeds each advice-shaped mutation into the
 * render path, runs the ONE GUARD, and reports guardEfficacy = caught / seeded — a NUMBER, deterministic, reproducible, and
 * independent of any LLM. No more waiting for a model to misbehave.
 *
 * THE ONE GUARD = the advice guard the Showing sprint converged onto the render path: AdviceShape.detect ∪
 * VoiceGates.advicePattern (compose routes to the ADVICE boundary iff either fires). guardEfficacy is the ADVICE guard's raw
 * catch rate — a LOWER BOUND (RP-5): the catalogue is a finite set of phrasings from V31, not the space of advice, and the
 * bound is printed WITH the number, always. Every uncaught mutation is a NAMED HOLE routed to the gate — including the ones
 * the SIBLING guards (the compile/envelope banned-shape guard, the severity lexicon) cover and the ones NOTHING covers.
 * A 9/9 that calls itself complete is the most dangerous number in this sprint; a number that can embarrass you is worth having.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"
import { AdviceShape } from "../ask/advice"
import { VoiceGates } from "../ask/gates"
import { FactEnvelope } from "../strategy/envelope"

export namespace Guard {
  export function catalogue(): string[] {
    return JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "ship-pins.json"), "utf8")).phase3_guard.catalogue.seeded as string[]
  }

  export type CoveredBy = "advice-guard" | "banned-shape-guard" | "severity-gate" | "UNCAUGHT"
  export interface MutationResult { mutation: string; caughtByAdviceGuard: boolean; adviceShape: string | null; coveredBy: CoveredBy }

  // run ONE mutation through the guards, in the order compose would: the advice guard first (the ONE GUARD), then the
  // sibling banned-shape guard (the compile/envelope path), then the severity lexicon — naming which covers it (or none).
  export function classify(m: string): MutationResult {
    const shape = AdviceShape.detect(m)
    const substr = VoiceGates.advicePattern(m)
    const caughtByAdviceGuard = shape.advice || substr.advice
    let coveredBy: CoveredBy
    if (caughtByAdviceGuard) coveredBy = "advice-guard"
    else if (FactEnvelope.BANNED_FACT_SHAPES.find((s) => m.toLowerCase().includes(s))) coveredBy = "banned-shape-guard"
    else if (VoiceGates.severityCore(m, []).length > 0) coveredBy = "severity-gate"
    else coveredBy = "UNCAUGHT"
    return { mutation: m, caughtByAdviceGuard, adviceShape: shape.shape ?? substr.shape, coveredBy }
  }

  export interface Rate {
    seeded: number
    caught: number // the ONE GUARD (advice) catches
    rate: string // "8/15" — the header number
    fullLayerCaught: number // advice ∪ banned-shape ∪ severity — the whole honesty layer
    fullLayerRate: string
    holes: { mutation: string; coveredBy: CoveredBy; note: string }[] // every mutation the ADVICE guard misses, NAMED
    genuineHoles: { mutation: string; note: string }[] // uncaught by EVERY guard — routed to the gate
    lowerBoundCaveat: string
    corpus: { baits: number; adviceShaped: number; caught: number; note: string } // the SECOND, weaker measure
  }

  export function mutationRate(): Rate {
    const cat = catalogue()
    const results = cat.map(classify)
    const caught = results.filter((r) => r.caughtByAdviceGuard).length
    const fullLayerCaught = results.filter((r) => r.coveredBy !== "UNCAUGHT").length
    const holes = results
      .filter((r) => !r.caughtByAdviceGuard)
      .map((r) => ({
        mutation: r.mutation,
        coveredBy: r.coveredBy,
        note:
          r.coveredBy === "banned-shape-guard"
            ? "the ONE GUARD (advice) MISSES this DECLARATIVE banned output; the sibling compile/envelope banned-shape guard covers it — a hole in the ADVICE guard, covered by the honesty layer"
            : r.coveredBy === "severity-gate"
              ? "the ONE GUARD (advice) misses this; the severity lexicon gate covers it"
              : "UNCAUGHT by the advice guard, the banned-shape guard, AND the severity lexicon — a GENUINE hole in the whole layer, routed to the gate",
      }))
    const genuineHoles = results.filter((r) => r.coveredBy === "UNCAUGHT").map((r) => ({ mutation: r.mutation, note: "uncaught by the advice guard, the banned-shape guard, AND the severity lexicon — a GENUINE gap in the whole layer, routed to the gate (this is the number working, not a rigged 17/17)" }))
    // THE SECOND, WEAKER MEASURE — the frozen transcript corpus (R-1): REAL model output, a different lab. Count the
    // advice-shaped transcripts and confirm the ONE GUARD catches them (a SAMPLE of the model's unbounded output, never a proof).
    const corpusPath = path.join(PKG_ROOT, "data", "honesty", "ask-transcripts.json")
    let corpus = { baits: 0, adviceShaped: 0, caught: 0, note: "corpus absent" }
    try {
      const tc = JSON.parse(readFileSync(corpusPath, "utf8"))
      const texts: string[] = (tc.transcripts ?? []).map((t: { text?: string }) => t.text ?? "")
      const flagged = texts.map(classify).filter((r) => r.caughtByAdviceGuard || r.coveredBy !== "UNCAUGHT")
      corpus = { baits: texts.length, adviceShaped: texts.map(classify).filter((r) => r.caughtByAdviceGuard).length, caught: flagged.length, note: "the second, weaker, open-ended measure — REAL model output from the frozen corpus (a different lab; a SAMPLE, not a proof — the model's output space is unbounded)" }
    } catch { /* corpus optional */ }
    return {
      seeded: cat.length,
      caught,
      rate: `${caught}/${cat.length}`,
      fullLayerCaught,
      fullLayerRate: `${fullLayerCaught}/${cat.length}`,
      holes,
      genuineHoles,
      lowerBoundCaveat: "guardEfficacy is a LOWER BOUND — the catalogue is a finite set of phrasings from V31, not the space of advice (RP-5). The bound is printed WITH the number, always. The advice guard catches the imperative/prescriptive shapes; the declarative banned outputs are covered by the sibling banned-shape guard. V41 (S162, L-2/DD-70) CLOSED the one genuine hole V40 named — the unqualified best-in-class superlative ('the safest, highest-yielding strategy available') — via AdviceShape.superlative, and a FACTUAL superlative that names a measured quantity + value ('the highest τ_int in your set is 165') still renders (the positive control). The full layer reaches 17/17; the bound STANDS a lower bound — a rate that calls itself complete is the most dangerous number in this sprint.",
      corpus,
    }
  }
}
