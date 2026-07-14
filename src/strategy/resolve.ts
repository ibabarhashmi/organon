/**
 * ORGΛNON — THE MANIFEST SPRINT (X-MANIFEST b, e). The RESOLVER — the bridge between the pure `compile.ts` and the LIVE
 * engine. `resolveSubject(key, now)` runs the EXISTING Reality pipeline for one subject EXACTLY as the `/check/:key` route
 * does (the curated record first, then the any-pool lookup; the governance bundle; the two-tier provenance label; the
 * domain + catch) — a SINGLE SOURCE OF TRUTH, so a strategy of ONE position renders BYTE-IDENTICAL to the standalone
 * Reality Check (S71). `resolveAndCompile(manifest, now)` resolves every position, calls `compile`, and assembles the
 * `Reality.ComposedView` the drawer renders. It ALSO extracts the exit-criterion facts (peg / funding-flip / TVL / gov)
 * and the apyBase series (the effective-bets fact's input) from what the pipeline already captured — composition, not
 * new computation. A dead subject mid-compile degrades honestly (a placeholder UNVERIFIED position; the compile completes).
 */
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { Reality } from "../studio/reality"
import { Scorecard } from "../analytics/scorecard"
import { ProvRecord } from "../dataplane/record"
import { DataPlane } from "../dataplane/store"
import { Governance } from "../contract/governance"
import { Domain } from "../domain/types"
import { Manifest } from "./manifest"
import { ExitCriterion } from "./exit"
import { StrategyCompile } from "./compile"
import { StrategyStore } from "./store"
import { StrategyTrial } from "./trial"
import { FalseFire } from "./falsefire"
import { Provenance } from "./provenance"

export namespace StrategyResolve {
  const GOV_DIR = path.join(PKG_ROOT, "data", "honesty", "governance")

  export interface Resolved {
    name: string
    scored: Scorecard.Scored
    history: ProvRecord.HistoryEntry[]
    poolKey: string
    governance: Governance.RenderBundle | null
    provTier: string
    domain: Domain.DomainType
    catchFact?: Domain.Catch
    reachable: boolean
    series: { ts: number; value: number }[]
    exitFacts: ExitCriterion.Facts
    govClass: string | null // the current governance adminClass (MR3) — read-only, for the baseline delta + the gov-change exit
  }
  export type SubjectResult = Resolved | { notFound: true; refusal?: string }

  // the apyBase series (for the effective-bets fact) — the SAME pattern the Ask COMPARE uses (X-CORRELATE's proven caller).
  function seriesFor(poolKey: string): { ts: number; value: number }[] {
    const s = DataPlane.snapshotAdapter.fetchSeries(poolKey.replace(":pool:", ":chart:"))
    return s ? s.points.filter((p) => p.apyBase != null).map((p) => ({ ts: p.ts, value: p.apyBase as number })) : []
  }

  // the exit-criterion facts — extracted from what the pipeline ALREADY captured (peg from pegDev, TVL drawdown from the
  // 30d slope, funding-flip census from the yield-source catch). governanceChanged is null at single-subject resolve (a
  // /check has no baseline to compare against); the CADENCE seam (MR3) threads it in `resolveAndCompile` when a registration
  // baseline gov-class is known — `governanceChanged = both-read ? (baseline !== current) : null`. `exit.ts` is untouched.
  function exitFactsFor(scored: Scorecard.Scored, catchFact?: Domain.Catch): ExitCriterion.Facts {
    const f = scored.facts
    const peg = f.pegDev == null ? null : 1 - Math.abs(f.pegDev)
    const tvlDrawdown = f.tvlSlope30d == null ? null : f.tvlSlope30d < 0 ? -f.tvlSlope30d : 0
    let fundingNegPeriods: number | null = null
    let fundingTotalPeriods: number | null = null
    if (catchFact && catchFact.axis === "yield-source") {
      const np = catchFact.numbers.negativePeriods
      const tp = catchFact.numbers.totalPeriods
      fundingNegPeriods = typeof np === "number" ? np : null
      fundingTotalPeriods = typeof tp === "number" ? tp : null
    }
    return { peg, tvlDrawdown, fundingNegPeriods, fundingTotalPeriods, governanceChanged: null }
  }

  // resolve ONE subject EXACTLY as /check/:key does (single source of truth) + the compile facts (series, exitFacts).
  export async function resolveSubject(key: string, now: number): Promise<SubjectResult> {
    let rc: { name: string; scored: Scorecard.Scored; history: ProvRecord.HistoryEntry[]; refusal?: string } | null = Reality.realityCheck(key, now)
    if (!rc) rc = await Reality.lookup(key, now)
    if (rc?.refusal) return { notFound: true, refusal: rc.refusal }
    if (!rc) return { notFound: true }
    const art = Governance.load(key, { readFile: (p) => readFileSync(p, "utf8"), readdir: (d) => readdirSync(d), dir: GOV_DIR })
    const governance = art ? Governance.renderBundle(art, Governance.loadImpl(art.subject, { readFile: (p) => readFileSync(p, "utf8"), dir: GOV_DIR })) : null
    const domain = Reality.domainOf(rc.name, rc.scored.facts).domain
    const catchFact = Reality.catchFor(domain, rc.name, rc.scored)
    return { name: rc.name, scored: rc.scored, history: rc.history, poolKey: key, governance, provTier: "REAL-at-timestamp", domain, catchFact, reachable: true, series: seriesFor(key), exitFacts: exitFactsFor(rc.scored, catchFact), govClass: art?.adminClass ?? null }
  }

  // an UNREACHABLE position degrades honestly — a placeholder UNVERIFIED subject so the position renders + the compile completes.
  function unreachable(key: string): Resolved {
    const facts: Scorecard.PoolFacts = { name: key, apyBase: null, apyReward: null, tvlSlope30d: null, pegDev: null, isStablecoin: false, reality: "SAMPLE", provenanceRef: null }
    return { name: key, scored: Scorecard.score(facts), history: [], poolKey: key, governance: null, provTier: "REAL-at-timestamp", domain: "UNCLASSIFIED", catchFact: undefined, reachable: false, series: [], exitFacts: { peg: null, tvlDrawdown: null, fundingNegPeriods: null, fundingTotalPeriods: null, governanceChanged: null }, govClass: null }
  }

  // the governance-change delta (MR3): both-read → CHANGED/unchanged; either side unresolved → UNJUDGEABLE (null), never guessed.
  export function govChanged(baseline: string | null | undefined, current: string | null): boolean | null {
    return baseline != null && current != null ? baseline !== current : null
  }

  // SUBSTANCE V38 (H-4) — the false-fire count rendered for the depositor. The count needs the scoped subject's captured
  // OBSERVABLE series (tvl/peg); the readily-composed series is apyBase (yield), so a caller may INJECT a matching series
  // (a materialized moat, or a test) and get a real count tiered RETROSPECTIVE. Absent → UNJUDGEABLE with the tier stated
  // honestly (missing stays missing; the count runs where the moat is present, the own-capture window grows with the cadence).
  export type FalseFireSeriesProvider = (subjectKey: string, kind: string) => { series: FalseFire.Point[]; provenance: Provenance.SeriesProvenance } | null

  function falseFireView(manifest: Manifest.T, provider?: FalseFireSeriesProvider): Reality.FalseFireView | undefined {
    const c = manifest.exitCriterion
    const scope = c.subjectScope === "portfolio" ? manifest.positions[0]?.subjectKey : c.subjectScope
    const injected = provider && scope ? provider(scope, c.kind) : null
    if (injected) {
      const r = FalseFire.count(c, injected.series, injected.provenance)
      return { statement: `Replayed over ${scope}'s captured ${c.kind} history: ${r.why}`, tier: r.tier }
    }
    // no matching observable series materialized here — honest UNJUDGEABLE with the tier the count WOULD carry (X-HONEST).
    return {
      statement: `Replayed over the subject's captured ${c.kind} history: UNJUDGEABLE here — that observable series is not materialized in this view (the count runs where the moat is present; it states a COUNT, never a prediction, and never suggests a different threshold).`,
      tier: `RETROSPECTIVE over a provider chart · REAL-at-timestamp over own captures (${Provenance.LADDER.join(" · ")})`,
    }
  }

  export async function resolveAndCompile(manifest: Manifest.T, now: number, registeredAtMs?: number, baselineGovClass?: Record<string, string | null>, falseFireProvider?: FalseFireSeriesProvider): Promise<{ composed: StrategyCompile.Composed; view: Reality.ComposedView; resolved: Resolved[] }> {
    const resolved: Resolved[] = []
    for (const p of manifest.positions) {
      const r = await resolveSubject(p.subjectKey, now)
      resolved.push("notFound" in r ? unreachable(p.subjectKey) : r)
    }
    const positions: StrategyCompile.Position[] = manifest.positions.map((p, i) => {
      const r = resolved[i]
      // MR3 — thread the governance-change fact against the REGISTRATION baseline (when known); exit.ts reads it unchanged.
      const exitFacts = baselineGovClass ? { ...r.exitFacts, governanceChanged: govChanged(baselineGovClass[p.subjectKey], r.govClass) } : r.exitFacts
      return { subjectKey: p.subjectKey, size: p.size, units: p.units, name: r.name, scored: r.scored, reachable: r.reachable, domain: r.domain, catch: r.catchFact, series: r.series, exitFacts }
    })
    const composed = StrategyCompile.compile(positions, manifest, { nowMs: now, registeredAtMs })
    const view: Reality.ComposedView = {
      positions: manifest.positions.map((p, i) => {
        const r = resolved[i]
        return { name: r.name, scored: r.scored, history: r.history, poolKey: r.poolKey, size: p.size, units: p.units, reachable: r.reachable, governance: r.governance, provTier: r.provTier, domain: r.domain, catchFact: r.catchFact }
      }),
      thesis: manifest.thesis,
      lines: composed.lines,
      compositeAbsence: StrategyCompile.COMPOSITE_ABSENCE,
      exitLine: composed.exit ? (composed.exit.judgeable ? `hash ${composed.exit.hash.slice(0, 8)}… · ${composed.exit.fired ? "FIRED" : "NOT FIRED"} — ${composed.exit.why}` : `hash ${composed.exit.hash.slice(0, 8)}… · ${composed.exit.why}`) : undefined,
      // SUBSTANCE V38 (H-4) — the false-fire count for the depositor, with its corrected tier (RETROSPECTIVE/REAL-at-timestamp).
      falseFire: composed.exit ? falseFireView(manifest, falseFireProvider) : undefined,
      // the trial-ledger readout — RECORDED, NEVER COUNTED; the inertness in plain words (render does NOT append a trial —
      // recording is an explicit act, not a page view; the committed fixture lineage backs the readout on a clone).
      trialReadout: StrategyTrial.readout(StrategyStore.manifestHash(manifest)),
    }
    return { composed, view, resolved }
  }
}
