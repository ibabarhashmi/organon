/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 2 (DD-55 / S145 / J-7): Series.materialize — THE INSTRUMENT SAYS A NUMBER.
 *
 * For thirty-nine sprints the false-fire count rendered UNJUDGEABLE — "the readily-composed series is apyBase, so the base
 * drawer renders UNJUDGEABLE" (J-7). Under D51 (INSTRUMENT) that is no longer a coverage gap — it IS the failure: the amended
 * kill-criterion (D67) turns on `changedByCompile`, and a fact that says "unknown" can never change anything. This reads the
 * committed, content-hashed false-fire-series.json (REAL retrospective tvl/peg series, captured off the network once) and
 * feeds FalseFire.countBoth (already built) so a NUMBER renders at the door for peg-floor and tvl-drawdown.
 *
 * RP-3 (F-3): the OWN-capture number LEADS, the retrospective is BENEATH it with its revisability stated in the same breath,
 * and the window disparity is a stated FACT. If the own-capture window is below the pinned minimum (it is, today — the cadence
 * has not run a full 180-day window), the OWN number renders UNJUDGEABLE and the RETROSPECTIVE renders ALONE, explicitly
 * labelled the WEAKER evidence. Never let the longer series win by default just because it is longer.
 *
 * Pure: reads the committed fixture. No network (the capture is one-time, in script/honesty/false-fire-capture.ts). No model.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { FalseFire } from "./falsefire"
import { ExitCriterion } from "./exit"

export namespace Series {
  export type Observable = "tvl-drawdown" | "peg-floor"

  interface Fixture {
    tier: string
    subjectMatch: Record<string, string[]>
    subjects: Record<string, { subject: string; source: string; note: string }>
    windows: Record<string, { points: number; days: number }>
    series: Record<string, FalseFire.Point[]>
  }
  function fixture(): Fixture | null {
    try { return JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "false-fire-series.json"), "utf8")) } catch { return null }
  }

  // does a scoped subject key match the fixture's series for this observable? TVL is per-POOL (matches only the fluid-lending
  // pool); PEG is per-ASSET (matches any USDC subject). A subject matching neither renders UNJUDGEABLE — NEVER the wrong
  // subject's count. When no subjectKey is given (the demo / wall path), the fixture series is returned (the mechanism proof).
  export function matchesSubject(observable: Observable, subjectKey?: string): boolean {
    if (subjectKey == null) return true
    const tokens = fixture()?.subjectMatch?.[observable] ?? []
    const key = subjectKey.toLowerCase()
    return tokens.some((t) => key.includes(t.toLowerCase()))
  }

  // the OWN captures (REAL@ts) for an observable — genuinely point-in-time, but SHORT today (the cadence has not run a full
  // window). Returns [] today; a growing series as the cadence runs (which turns the count into a reason to run the cadence).
  export function ownCaptures(_observable: Observable): FalseFire.Point[] {
    return [] // no committed own-pit series yet — the window is below the minimum; RP-3 renders own UNJUDGEABLE
  }

  export type Materialized =
    | { exists: true; retro: FalseFire.Point[]; own: FalseFire.Point[]; tier: string; subject: string; retroDays: number }
    | { exists: false; why: string }

  // materialize an observable's series — UNJUDGEABLE ONLY where the series genuinely does not exist (S145; never a default).
  export function materialize(observable: Observable): Materialized {
    const fx = fixture()
    const retro = fx?.series?.[observable]
    if (!retro || retro.length < 2) {
      return { exists: false, why: `UNJUDGEABLE — no ${observable} series is materialized (the fixture carries no such observable); a count over a series that does not exist is never fabricated (S145: UNJUDGEABLE only where the series genuinely does not exist).` }
    }
    return { exists: true, retro, own: ownCaptures(observable), tier: fx!.tier, subject: fx!.subjects[observable]?.subject ?? observable, retroDays: fx!.windows[observable]?.days ?? 0 }
  }

  export interface TwoTier {
    number: number | null // the count rendered at the door (the retro count when own is UNJUDGEABLE — RP-3), null only if UNJUDGEABLE everywhere
    tier: string // the tier of the rendered number
    ownLine: string // LEADS — the own-capture count or its honest UNJUDGEABLE (window growing)
    retroLine: string // BENEATH — the retrospective count WITH its revisability, in the same breath
    windowNote: string // the window disparity, stated as a fact
    statement: string // the whole guard-passing statement (own leads, retro beneath, window disparity) — a COUNT, no σ, no prediction
    unjudgeableEverywhere: boolean // true only if NEITHER tier has a series → an honest total UNJUDGEABLE (S145 permits it only here)
  }

  // RP-3 — build the two-tier false-fire view for a registered criterion. Own LEADS; retro BENEATH with revisability; the
  // window disparity STATED. Own-below-minimum → own UNJUDGEABLE, retro ALONE, labelled the weaker evidence. `subjectKey`
  // gates the series to the SCOPED subject (never the wrong subject's count); omitted → the demo/wall path (mechanism proof).
  export function falseFireTwoTier(criterion: ExitCriterion.T, subjectKey?: string): TwoTier {
    const obs = criterion.kind as Observable
    if (!matchesSubject(obs, subjectKey)) {
      const why = `UNJUDGEABLE — no ${obs} series is materialized for the scoped subject (${subjectKey}); the count runs where the moat holds THAT subject's series, never another subject's (missing stays missing).`
      return { number: null, tier: "UNJUDGEABLE", ownLine: "own captures: UNJUDGEABLE", retroLine: `retrospective: ${why}`, windowNote: "no series for this subject", statement: why, unjudgeableEverywhere: true }
    }
    const m = materialize(obs)
    if (!m.exists) {
      return { number: null, tier: "UNJUDGEABLE", ownLine: "own captures: UNJUDGEABLE", retroLine: `retrospective: ${m.why}`, windowNote: "no series exists for this observable", statement: m.why, unjudgeableEverywhere: true }
    }
    const both = FalseFire.countBoth(criterion, m.own, m.retro, "own-capture")
    const own = both.own
    const retro = both.retrospective

    // the OWN line LEADS (RP-3). Below the minimum window → UNJUDGEABLE, and the retrospective renders ALONE (the weaker evidence).
    const ownLine = own.judgeable
      ? `your own point-in-time captures (REAL@ts): ${own.fired} fire${own.fired === 1 ? "" : "s"} over ${own.windowDays} days`
      : `your own point-in-time captures (REAL@ts): UNJUDGEABLE — the window is still growing (below the ${FalseFire.MIN_WINDOW_DAYS}-day minimum); it lengthens every day the cadence runs`
    const retroLine = retro.judgeable
      ? `the retrospective chart (RETROSPECTIVE, revisable — fetched now, not point-in-time; the WEAKER evidence): ${retro.fired} fire${retro.fired === 1 ? "" : "s"} over ${retro.windowDays} days`
      : `the retrospective chart: ${retro.why}`
    const retroFullCycle = retro.judgeable && retro.windowDays < 365
      ? " — this criterion has not yet been tested against a full annual cycle"
      : ""
    const windowNote = own.judgeable && retro.judgeable
      ? `your own window covers ${own.windowDays} days; the retrospective covers ${retro.judgeable ? retro.windowDays : 0}${retroFullCycle}`
      : `your own captures do not yet cover a full window; only the retrospective (revisable) series reaches back${retroFullCycle}`

    const number = own.judgeable ? own.fired : retro.judgeable ? retro.fired : null
    const tier = own.judgeable ? own.tier : retro.judgeable ? retro.tier : "UNJUDGEABLE"
    // the whole statement — a COUNT, never a prediction; own leads, retro beneath with its revisability; no σ, no threshold suggestion.
    const statement = `If you had held this exit: ${ownLine}. Beneath it, ${retroLine}. ${windowNote}. A COUNT of your kill-condition replayed over captured history — never a prediction, and never a suggestion to move the goalpost you set.`
    return { number, tier, ownLine, retroLine, windowNote, statement, unjudgeableEverywhere: false }
  }

  // the provider shape resolve.ts's falseFireView expects — materialize the retro series with its provenance so a real
  // manifest renders a NUMBER (the count runs where the moat is present). Returns null where no series exists (honest UNJUDGEABLE).
  export function provider(_subjectKey: string, kind: string): { series: FalseFire.Point[]; provenance: { captureMode: "retrospective-fetch"; source: string } } | null {
    const m = materialize(kind as Observable)
    return m.exists ? { series: m.retro, provenance: { captureMode: "retrospective-fetch", source: "defillama" } } : null
  }
}
