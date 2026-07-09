/**
 * ORGΛNON — THE CALIBRATION CLOCK (Voice Phase 4; Rule X-CAL). RECORD-ONLY. The decay gate and the funding-regime facts
 * are ALREADY making implicit predictions; calibration data CANNOT be backfilled — every unrecorded month is evidence lost
 * forever. This module starts the clock: an append-only, HASH-CHAINED prediction record (`data/honesty/cal-ledger.json`)
 * capturing `{subject, predictionType, statedAt, horizon, resolutionStub, entryHash, prevHash}` at capture time — ENGINE-
 * DERIVED (never a model), DETERMINISTIC.
 *
 *   · RECORD-ONLY (the load-bearing invariant): NO Brier score is computed or displayed until real resolutions exist. The
 *     only surface is the honest COUNT ("recording since <date>; N recorded; 0 resolved"). There is deliberately NO scoring
 *     function in this file — scoring, resolution automation, and display are explicitly NEXT-sprint-or-later.
 *   · NO BACKFILL, EVER: `append` REFUSES an entry whose statedAt precedes the prior entry's (a backfilled prediction is a
 *     fabricated one). There is no code path that inserts a past entry.
 *   · HASH-CHAINED over the IMMUTABLE prediction fields (subject · predictionType · prediction · statedAt · horizon), so a
 *     tamper breaks the chain (verify catches it). The resolutionStub is NULL now and is NOT part of the hash — a future
 *     resolution annotates without rewriting the prediction record (resolutions are a next-sprint concern).
 */
import { createHash } from "node:crypto"

export namespace Cal {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  export const GENESIS = "0".repeat(64)
  export type PredictionType = "decay-tier-persistence" | "funding-regime-state"

  export interface Entry {
    subject: string // the poolKey the prediction is about
    predictionType: PredictionType
    prediction: string // the engine-derived predicted state (NEVER a model output) — e.g. "the recorded edge's TRACEABLE classification persists"
    statedAt: number // when the prediction was recorded (capture time) — a backfill (statedAt < the prior entry) is refused
    horizon: string // when it should resolve — e.g. "30d"
    resolutionStub: null | { note: string } // a STUB — null until a real resolution exists (NEVER backfilled; resolution is next-sprint)
    resolvedAt: number | null // null until a real resolution; the only field a future resolution fills
    prevHash: string // the prior entry's entryHash (GENESIS for the first)
    entryHash: string // sha256(prevHash + the immutable prediction body) — a tamper breaks the chain
  }
  export interface Ledger { protocol: string; since: string; note: string; entries: Entry[]; headHash: string }

  export function empty(since: string): Ledger {
    return { protocol: "honesty-calibration-ledger", since, note: "RECORD-ONLY (X-CAL): engine-derived, append-only, hash-chained predictions. NO score is computed or displayed until real resolutions exist; NO backfill path exists. The only surface is the honest count.", entries: [], headHash: GENESIS }
  }

  // the immutable prediction body that is hashed (the resolutionStub/resolvedAt are excluded — a future resolution
  // annotates without rewriting the prediction record). prevHash is included so the chain binds order.
  function body(e: Pick<Entry, "subject" | "predictionType" | "prediction" | "statedAt" | "horizon" | "prevHash">): string {
    return JSON.stringify({ subject: e.subject, predictionType: e.predictionType, prediction: e.prediction, statedAt: e.statedAt, horizon: e.horizon, prevHash: e.prevHash })
  }
  export function computeEntryHash(e: Pick<Entry, "subject" | "predictionType" | "prediction" | "statedAt" | "horizon" | "prevHash">): string {
    return sha256(body(e))
  }

  // append an engine-derived prediction. NO BACKFILL: a statedAt before the prior entry's is REFUSED (a backfilled
  // prediction is a fabricated one — X-CAL, S35). The resolutionStub is forced null (record-only). Returns a NEW ledger.
  export function append(ledger: Ledger, p: { subject: string; predictionType: PredictionType; prediction: string; statedAt: number; horizon: string }): Ledger {
    const last = ledger.entries[ledger.entries.length - 1]
    if (last && p.statedAt < last.statedAt) throw new Error(`BACKFILL REFUSED: statedAt ${p.statedAt} precedes the prior entry ${last.statedAt} — a backfilled prediction is a fabricated one (X-CAL)`)
    const prevHash = last ? last.entryHash : GENESIS
    const core = { subject: p.subject, predictionType: p.predictionType, prediction: p.prediction, statedAt: p.statedAt, horizon: p.horizon, prevHash }
    const entry: Entry = { ...core, resolutionStub: null, resolvedAt: null, entryHash: computeEntryHash(core) }
    return { ...ledger, entries: [...ledger.entries, entry], headHash: entry.entryHash }
  }

  // verify the hash-chain — a tamper (an edited prediction, a reordered entry, a broken link) is caught (S35).
  export function verify(ledger: Ledger): { ok: boolean; brokenAt: number | null; reason: string | null } {
    let prev = GENESIS
    for (let i = 0; i < ledger.entries.length; i++) {
      const e = ledger.entries[i]
      if (e.prevHash !== prev) return { ok: false, brokenAt: i, reason: `entry ${i} prevHash ${e.prevHash.slice(0, 8)}… ≠ the prior entryHash ${prev.slice(0, 8)}… (a reordered/inserted entry)` }
      if (computeEntryHash(e) !== e.entryHash) return { ok: false, brokenAt: i, reason: `entry ${i} entryHash does not recompute (an edited prediction — a tamper)` }
      prev = e.entryHash
    }
    if (ledger.entries.length && ledger.headHash !== prev) return { ok: false, brokenAt: ledger.entries.length - 1, reason: "headHash does not match the last entryHash" }
    return { ok: true, brokenAt: null, reason: null }
  }

  // the honest COUNT surface — the ONLY surface (record-only). NO Brier, NO score, NO grade. A displayed score on zero
  // resolutions is a Halt (X-CAL); there is deliberately no scoring function in this module.
  export function status(ledger: Ledger): { since: string; recorded: number; resolved: number; line: string } {
    const resolved = ledger.entries.filter((e) => e.resolvedAt).length
    return { since: ledger.since, recorded: ledger.entries.length, resolved, line: `Calibration: recording since ${ledger.since}; ${ledger.entries.length} recorded; ${resolved} resolved — no score is shown until real resolutions exist (the engine refuses to grade itself on zero).` }
  }
}
