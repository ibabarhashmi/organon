/**
 * ORGΛNON — THE SUBSTANCE SPRINT (V38), Phase 2: Provenance.tier — THE FALSE-FIRE COUNT KNOWS WHAT ITS HISTORY IS WORTH
 * (S117, S118, DD-34, RP-3).
 *
 * H-2: V37's false-fire count replayed over "the DefiLlama chart snapshot's dated points" — a RETROSPECTIVE chart series, the
 * provider's PRESENT opinion about PAST values (subject to revision, backfill, reconstruction) — and tiered it flatly REAL.
 * That is the exact look-ahead RP-2 was written to block, and what ORGΛNON's own two-tier provenance was invented to express.
 *
 * THE LADDER (X-MOAT, extending the Coverage sprint's ProvenanceTier with two more rungs):
 *   REAL★             — ORGΛNON's OWN capture, genuinely point-in-time: each point content-hashed AT the moment observed
 *                       (a capture-time nonce a backfilled point cannot forge), block-pinned/chain-reproducible where the
 *                       source is a chain read. The genuine, un-revisable history.
 *   REAL-at-timestamp — an aggregator POINT captured at time T (re-fetchable + content-hashed at T, but the aggregator may
 *                       retroactively revise). What the API said at T.
 *   RETROSPECTIVE     — a whole SERIES fetched NOW about the past (a chart snapshot): the provider's present reconstruction,
 *                       revisable/backfillable. Not point-in-time — the look-ahead H-2 names.
 *   UNJUDGEABLE       — the revision exposure cannot be established (an unknown capture mode); missing stays missing.
 *
 * RP-3 (the fallback, stated BEFORE the audit): count over ORGΛNON's OWN captures (REAL★) where they reach, over the
 * retrospective series where they do not, BOTH tiered, BOTH shown, neither pretending. Two numbers, two tiers.
 */
import { ProvenanceTier } from "../dataplane/tier"

export namespace Provenance {
  export type Tier = "REAL★" | "REAL-at-timestamp" | "RETROSPECTIVE" | "UNJUDGEABLE"

  // the capture MODE of a series — the fact that decides the tier (a data fact, not a wish).
  //   "own-pit"              — ORGΛNON's own capture chain (each point nonce-proven AT its ts)
  //   "retrospective-fetch"  — a whole time-series fetched NOW from a provider (a chart snapshot)
  //   "unknown"              — the mode cannot be established → UNJUDGEABLE (missing stays missing)
  export type CaptureMode = "own-pit" | "retrospective-fetch" | "unknown"

  export interface SeriesProvenance {
    captureMode: CaptureMode
    source: string // the recorded provenance source (e.g. "defillama", "rpc", "chainlink", "own-capture")
  }

  // classify a series' provenance into a ladder tier. own-pit defers to the Coverage tierOf (REAL★ vs REAL-at-timestamp by
  // source); a retrospective fetch is RETROSPECTIVE regardless of source (the whole series is a present reconstruction); an
  // unknown mode is UNJUDGEABLE. A positive classification (S117): the tier is always a named member of the ladder, never a
  // flat "REAL" — the wall asserts the tier is one of these four, and that a retrospective fetch is NOT REAL★.
  export function tier(p: SeriesProvenance): Tier {
    if (!p || p.captureMode === "unknown") return "UNJUDGEABLE"
    if (p.captureMode === "retrospective-fetch") return "RETROSPECTIVE" // a fetched-now series about the past — never REAL★
    // own-pit — a genuine point-in-time capture chain; the source decides REAL★ (block-pinned/chain) vs REAL-at-timestamp
    return ProvenanceTier.tierOf(p.source) === "REAL★" ? "REAL★" : "REAL-at-timestamp"
  }

  // the ordered ladder (best → worst) — for display and the positive-membership assertion (S117).
  export const LADDER: Tier[] = ["REAL★", "REAL-at-timestamp", "RETROSPECTIVE", "UNJUDGEABLE"]

  export function isLadderMember(t: string): t is Tier {
    return (LADDER as string[]).includes(t)
  }

  // a REAL★ claim over a retrospective series is the H-2 defect — forbidden. The positive assertion: a series' tier is
  // REAL★ ONLY if it is an own-pit capture from a block-pinned source; a retrospective fetch tiered REAL★ is a Halt.
  export function realStarIsLegit(p: SeriesProvenance): boolean {
    return p.captureMode === "own-pit" && ProvenanceTier.tierOf(p.source) === "REAL★"
  }
}
