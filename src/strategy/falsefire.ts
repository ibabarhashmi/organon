/**
 * ORGΛNON — THE SOCKET SPRINT (V37), Phase 3: FalseFire.count — THE FALSE-FIRE EXPOSURE, MODEL-FREE (S111).
 *
 * The research asked for this since the ecosystem study: tell a depositor what their own exit threshold would have cost
 * them. The obvious answer — a σ-band — is a PREDICTION, and predictions are permanently rejected: DeFi observables are
 * fat-tailed and autocorrelated, and a confidently-wrong fact is the one thing X-HONEST forbids absolutely (PART A' #2).
 *
 * So this does NOT model — it COUNTS. It replays the EXISTING exit evaluator over the observable's own committed historical
 * series (the DefiLlama chart snapshot's dated points), counting the episodes at which the criterion would have FIRED:
 *   "a criterion at this level would have fired K times in the last N days of REAL captured data."
 * No σ, no distribution, no normality, no prediction — a count, deterministic and reproducible over a content-hashed
 * capture (tiered REAL). It is the collapse-backtest, turned on the user's own criterion. Pure; no I/O; no model.
 *
 * DD-29: below the pinned minimum history (180 days) → UNJUDGEABLE (missing stays missing). RP-2: a firing is counted only
 * on point-in-time-honest points (each chart point is the value AT its ts by construction), and the count states its tier.
 */
import { ExitCriterion } from "./exit"
import { FactEnvelope } from "./envelope"
import { AdviceShape } from "../ask/advice"

export namespace FalseFire {
  export const MIN_WINDOW_DAYS = 180 // DD-29 — below this, the count is UNJUDGEABLE (not enough captured history)
  const DAY_MS = 86_400_000

  // a dated point of the observable series (a chart snapshot's points). Only the fields the replayed kind reads are needed.
  export interface Point {
    ts: number
    tvlUsd?: number | null
    peg?: number | null
  }

  export type Result =
    | { judgeable: true; fired: number; points: number; windowDays: number; from: number; to: number; tier: "REAL"; why: string }
    | { judgeable: false; why: string }

  // COUNT the fire EPISODES — transitions from not-fired to fired (an exit triggers once per episode, not once per day it
  // stays tripped). Model-free: a boolean fire test per point, then episode-counting. NO σ, NO distribution, NO probability.
  export function count(criterion: ExitCriterion.T, series: Point[]): Result {
    const pts = [...series].filter((p) => Number.isFinite(p.ts)).sort((a, b) => a.ts - b.ts)
    if (pts.length < 2) return { judgeable: false, why: "UNJUDGEABLE — fewer than two captured points; a count needs a series." }
    const windowDays = (pts[pts.length - 1].ts - pts[0].ts) / DAY_MS
    if (windowDays < MIN_WINDOW_DAYS) return { judgeable: false, why: `UNJUDGEABLE — only ${windowDays.toFixed(0)} days of captured history (< ${MIN_WINDOW_DAYS}); the moat is too shallow for this observable (missing stays missing, DD-29).` }

    // the per-point fire test for the replayable kinds — reads the observable the chart carries. A kind with no captured
    // series (funding-flip-count / governance-change / concentration-ceiling) → UNJUDGEABLE (never a fabricated count).
    let firedAt: (p: Point, peak: number) => boolean | null
    if (criterion.kind === "tvl-drawdown") {
      firedAt = (p, peak) => (p.tvlUsd == null || peak <= 0 ? null : (peak - p.tvlUsd) / peak >= criterion.threshold)
    } else if (criterion.kind === "peg-floor") {
      firedAt = (p) => (p.peg == null ? null : p.peg < criterion.threshold)
    } else {
      return { judgeable: false, why: `UNJUDGEABLE — the ${criterion.kind} kind has no captured point series to replay (the chart carries TVL/peg, not this observable); a false-fire count is not fabricated.` }
    }

    let peak = -Infinity
    let episodes = 0
    let inEpisode = false
    let usable = 0
    for (const p of pts) {
      if (criterion.kind === "tvl-drawdown" && p.tvlUsd != null) peak = Math.max(peak, p.tvlUsd)
      const f = firedAt(p, peak)
      if (f === null) continue // an unusable point (missing observable) — skipped, never counted as a fire
      usable++
      if (f && !inEpisode) episodes++ // a NEW episode: the exit would have triggered here
      inEpisode = f
    }
    if (usable < 2) return { judgeable: false, why: `UNJUDGEABLE — the series carries no usable ${criterion.kind} observable (the chart lacks it).` }
    return {
      judgeable: true,
      fired: episodes,
      points: usable,
      windowDays: Math.round(windowDays),
      from: pts[0].ts,
      to: pts[pts.length - 1].ts,
      tier: "REAL",
      why: `a criterion at this level would have fired ${episodes} time${episodes === 1 ? "" : "s"} in the last ${Math.round(windowDays)} days of REAL captured data (${usable} points; a COUNT of the exit evaluator replayed over the content-hashed capture — no model, no σ, no prediction).`,
    }
  }

  // DD-30 — the false-fire fact travels in the Fact Envelope (authored:false) and passes the ONE GUARD. The fact object
  // carries ONLY the count + window + tier — NEVER an alternative threshold, a score/grade, or a comparative (S111): it
  // states the count and STOPS. X-AUTHOR — it informs, it never coerces a different threshold.
  export function fact(criterion: ExitCriterion.T, result: Result, subject: FactEnvelope.Subject, provenance: FactEnvelope.Provenance): FactEnvelope.T {
    const factValue = result.judgeable
      ? { falseFireCount: result.fired, windowDays: result.windowDays, points: result.points, tier: result.tier, statement: result.why }
      : { falseFireCount: null, unjudgeable: true, why: result.why }
    return FactEnvelope.wrap({ fact: factValue, verdict: null, provenance, subject })
  }

  // the ONE GUARD, run on the fact's statement — a false-fire statement that reads as advice would FAIL (S111 / RP-3 posture).
  export function statementPassesGuard(result: Result): boolean {
    return !AdviceShape.detect(result.why).advice
  }
}
