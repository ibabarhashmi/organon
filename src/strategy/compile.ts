/**
 * ORGΛNON — THE MANIFEST SPRINT (X-MANIFEST b, S71). COMPILE = COMPOSITION, not computation. `compile(positions, manifest)`
 * produces the Composed Reality Check: portfolio-level facts that ALREADY exist in the engine, composed —
 *   · the EFFECTIVE-BETS fact via the EXISTING `correlate.ts` (the substrate's long-owed SECOND CALLER; the min-overlap-30
 *     INSUFFICIENT floor PROPAGATES — a thin-overlap read is the honest INSUFFICIENT, never a fabricated decimal);
 *   · the CATCH AGGREGATION (the funding-carry share across STABLE-SYNTH/FUNDING positions · the leverage flag across
 *     LOOPED-CDP positions with the DV3 position-scope sentence · the RWA opacity propagated to the top);
 *   · the WORST-AXIS fact (which position carries the strategy's weakest DECIDING axis — a fact, not a ranking);
 *   · the THESIS-AGE gate (a thesis younger than its evaluation window is UNJUDGEABLE-YET, never judged);
 *   · the EXIT evaluation (deterministic over the captured facts).
 *
 * The compiler JUDGES, NEVER AUTHORS — there is NO weight, NO rebalance, NO ranked alternative, NO allocation (S71;
 * X-ADVICE absolute). Every emitted line is re-run through the SAME advice wall the Ask console uses (`VoiceGates`) +
 * a banned-output check; a line that authored anything is a Halt. The COMPOSITE verdict is NOT rendered — D38, parked
 * (`compositeVerdict` is ALWAYS null; its absence is labeled at the render). Pure; deterministic; no I/O; no model.
 * `positions` are PRE-RESOLVED (the resolver — `resolve.ts` — calls the existing Reality pipeline; compile stays pure).
 */
import { Correlate } from "../analytics/correlate"
import { Scorecard } from "../analytics/scorecard"
import { Domain } from "../domain/types"
import { VoiceGates } from "../ask/gates"
import { Manifest } from "./manifest"
import { ExitCriterion } from "./exit"

export namespace StrategyCompile {
  // a thesis needs time before it can be wrong — a MinTRL-grade SOFT gate (not a verdict): a thesis younger than this
  // window is UNJUDGEABLE-YET, never judged. Documented-in-code (not a scorecard threshold; it moves no verdict).
  export const THESIS_EVAL_WINDOW_DAYS = 30
  const DAY_MS = 86_400_000

  // the banned-output shapes (manifest-pins.json bannedOutputs) — the compiler must NEVER AUTHOR any of these; a line that
  // does is refused by guardLine (S71). COMPOUND phrases only: the imperative "allocate" is caught by the VoiceGates advice
  // wall (ADVICE_SHAPES), so the bare nouns "allocate"/"allocation" are DELIBERATELY absent here — else the honest
  // disclaimer "…never an allocation" (the exact wording correlate.ts ships) would false-positive. The two checks together
  // catch every authored allocation ("allocate 60%…" → advicePattern; "suggested allocation" → here) without biting a disclaimer.
  const BANNED_OUTPUT_SHAPES = ["suggested weight", "suggested allocation", "rebalance", "ranked alternative", "rankings", "consider instead", "optimal weight", "recommended split"]

  // a pre-resolved position (the resolver ran the existing Reality pipeline; compile does no I/O). `reachable=false` → the
  // subject could not be resolved (a dead subject mid-compile) — the position degrades honestly, the compile completes.
  export interface Position {
    subjectKey: string
    size: number
    units: string
    name: string
    scored: Scorecard.Scored
    reachable: boolean
    domain: Domain.DomainType
    catch?: Domain.Catch
    series: { ts: number; value: number }[] // apyBase series for the effective-bets fact (empty if none)
    exitFacts: ExitCriterion.Facts
  }

  export interface Opts {
    nowMs: number
    registeredAtMs?: number // when the manifest was first stored (thesis-age); absent → freshly registered (UNJUDGEABLE-YET)
  }

  export interface ComposedLine {
    kind: "effective-bets" | "catch-funding" | "catch-leverage" | "catch-rwa" | "worst-axis" | "thesis-age" | "exit" | "degraded"
    text: string
  }

  export interface Composed {
    positions: Position[]
    effectiveBets: Correlate.Analysis | null
    catchAggregation: { fundingCarryCount: number; leveredCount: number; rwaPresent: boolean; totalReachable: number }
    worstAxis: { subjectKey: string; name: string; axis: string; tier: string } | null
    thesisAge: { ageDays: number; windowDays: number; judgeable: boolean }
    exit: { hash: string; scope: string; fired: boolean; judgeable: boolean; why: string } | null
    compositeVerdict: null // D38 PARKED — ALWAYS null; the absence is labeled at the render (never an aggregate pill)
    lines: ComposedLine[]
  }

  // the advice wall + banned-output check, re-run on EVERY emitted line (S71). A composed line that authored a weight, a
  // rebalance, a ranking, or any advice shape is a Halt — the compiler judges, never authors.
  export function guardLine(text: string): { ok: true } | { ok: false; reason: string } {
    const lower = text.toLowerCase()
    const banned = BANNED_OUTPUT_SHAPES.find((s) => lower.includes(s))
    if (banned) return { ok: false, reason: `a composed line contains the banned output shape "${banned}" — the compiler judges, never authors (X-ADVICE; S71)` }
    const adv = VoiceGates.advicePattern(text)
    if (adv.advice) return { ok: false, reason: `a composed line is advice-shaped ("${adv.shape}") — refused (the advice wall re-runs on every composed line; S71)` }
    return { ok: true }
  }

  // the WORST-AXIS fact — the material axis with the worst tier across all reachable positions (fail > caution >
  // unverified). A FACT (which position carries the strategy's weakest deciding axis), not a ranking of positions.
  function worstAxisOf(positions: Position[]): Composed["worstAxis"] {
    const rank: Record<string, number> = { fail: 0, caution: 1, unverified: 2 }
    let best: { subjectKey: string; name: string; axis: string; tier: string; r: number } | null = null
    for (const p of positions) {
      if (!p.reachable) continue
      for (const row of p.scored.rows) {
        if (!row.material) continue
        const r = rank[row.tier]
        if (r === undefined) continue // pass / not-applicable — not a weakness
        if (best === null || r < best.r || (r === best.r && (p.subjectKey < best.subjectKey || (p.subjectKey === best.subjectKey && row.axis < best.axis)))) {
          best = { subjectKey: p.subjectKey, name: p.name, axis: row.axis, tier: row.tier, r }
        }
      }
    }
    return best ? { subjectKey: best.subjectKey, name: best.name, axis: best.axis, tier: best.tier } : null
  }

  function evaluateExitFor(manifest: Manifest.T, positions: Position[]): Composed["exit"] {
    const reg = ExitCriterion.register(manifest.exitCriterion)
    if (!reg.ok) return null // (an unevaluable criterion is refused at registration upstream; defensive here)
    const c = manifest.exitCriterion
    const scoped = c.subjectScope === "portfolio" ? positions.filter((p) => p.reachable) : positions.filter((p) => p.reachable && p.subjectKey === c.subjectScope)
    if (scoped.length === 0) return { hash: reg.hash, scope: c.subjectScope, fired: false, judgeable: false, why: `UNJUDGEABLE — the scoped subject (${c.subjectScope}) is not a reachable position in this strategy.` }
    // evaluate over each scoped position; the strategy fires if ANY judgeable evaluation fires (an exit is a floor breach)
    const evals = scoped.map((p) => ({ p, e: ExitCriterion.evaluate(c, p.exitFacts) }))
    const judgeable = evals.some((x) => x.e.judgeable)
    const firedOne = evals.find((x) => x.e.judgeable && x.e.fired)
    if (firedOne) return { hash: reg.hash, scope: c.subjectScope, fired: true, judgeable: true, why: `${firedOne.p.name}: ${firedOne.e.why}` }
    const judged = evals.find((x) => x.e.judgeable)
    if (judged) return { hash: reg.hash, scope: c.subjectScope, fired: false, judgeable: true, why: judged.p.name === scoped[0].name && scoped.length === 1 ? judged.e.why : `no scoped position breached (${judged.p.name}: ${judged.e.why})` }
    return { hash: reg.hash, scope: c.subjectScope, fired: false, judgeable: false, why: evals[0].e.why }
  }

  export function compile(positions: Position[], manifest: Manifest.T, opts: Opts): Composed {
    const reachable = positions.filter((p) => p.reachable)
    const N = reachable.length

    // ── the effective-bets fact — the substrate's SECOND CALLER (X-CORRELATE; the min-overlap-30 INSUFFICIENT propagates) ──
    const series: Correlate.Series[] = reachable.filter((p) => p.series.length > 0).map((p) => ({ key: p.name, points: p.series }))
    const effectiveBets = series.length >= 2 ? Correlate.analyze(series) : null

    // ── the catch aggregation ──
    const fundingCarryCount = reachable.filter((p) => p.domain === "FUNDING" || (p.catch?.axis === "yield-source" && Number(p.catch.numbers.fundingCarryPct ?? 0) > 0)).length
    const leveredCount = reachable.filter((p) => p.domain === "LOOPED-CDP").length
    const rwaPresent = reachable.some((p) => p.domain === "RWA")
    const catchAggregation = { fundingCarryCount, leveredCount, rwaPresent, totalReachable: N }

    const worstAxis = worstAxisOf(positions)

    // ── the thesis-age gate ──
    const ageDays = opts.registeredAtMs != null ? Math.max(0, (opts.nowMs - opts.registeredAtMs) / DAY_MS) : 0
    const thesisAge = { ageDays, windowDays: THESIS_EVAL_WINDOW_DAYS, judgeable: ageDays >= THESIS_EVAL_WINDOW_DAYS }

    const exit = evaluateExitFor(manifest, positions)

    // ── FORMAT the portfolio facts into the pinned grammar (info/context, number-traced) ──
    const lines: ComposedLine[] = []
    const degraded = positions.filter((p) => !p.reachable)
    if (degraded.length > 0) lines.push({ kind: "degraded", text: `${degraded.length} position${degraded.length === 1 ? "" : "s"} could not be resolved (${degraded.map((p) => p.subjectKey).join(", ")}) — degraded honestly; the composed facts below cover the ${N} reachable position${N === 1 ? "" : "s"}.` })

    if (effectiveBets) {
      if (effectiveBets.sufficient) {
        const K = effectiveBets.effectiveK!
        lines.push({ kind: "effective-bets", text: `These ${series.length} positions' recorded yields cluster into ≈ ${K} independent bet${K === 1 ? "" : "s"} (${effectiveBets.overlap} shared points; ρ-matrix traced). info/context — a fact about correlation, never an allocation.` })
      } else {
        lines.push({ kind: "effective-bets", text: `We can't show a diversification read yet — INSUFFICIENT (only ${effectiveBets.overlap} shared points, below the pinned ${Correlate.MIN_OVERLAP}-point floor; correlation on thin overlap is fabricated precision).` })
      }
    }

    if (fundingCarryCount >= 1) lines.push({ kind: "catch-funding", text: `${fundingCarryCount} of ${N} position${N === 1 ? "" : "s"} source yield from perp-funding carry — the strategy's income concentrates in one regime; when funding flips, they invert together.` })
    if (leveredCount >= 1) lines.push({ kind: "catch-leverage", text: `${leveredCount} position${leveredCount === 1 ? " is a" : "s are"} levered loop${leveredCount === 1 ? "" : "s"} — this evaluates a position, not the protocol (the leverage is specific to that vault's structure and collateral, not a property of the protocol as a whole).` })
    if (rwaPresent) lines.push({ kind: "catch-rwa", text: `One or more positions settle off-chain: a slice of this strategy cannot be verified on-chain. Nothing on-chain can prove the backing — treat every clean axis on those positions with that in mind.` })

    if (worstAxis) lines.push({ kind: "worst-axis", text: `Weakest deciding axis across the strategy: ${worstAxis.name}'s ${worstAxis.axis} (${worstAxis.tier}) on ${worstAxis.name === worstAxis.subjectKey ? worstAxis.subjectKey : worstAxis.name}.` })

    lines.push({ kind: "thesis-age", text: thesisAge.judgeable ? `Thesis registered ${Math.floor(ageDays)} days ago — old enough to be evaluated against its exit criterion (≥ ${THESIS_EVAL_WINDOW_DAYS}-day window).` : `Thesis registered ${Math.floor(ageDays)} day${Math.floor(ageDays) === 1 ? "" : "s"} ago — younger than its ${THESIS_EVAL_WINDOW_DAYS}-day evaluation window: UNJUDGEABLE-YET (a thesis is not judged before it has had time to be wrong).` })

    if (exit) lines.push({ kind: "exit", text: exit.judgeable ? `Exit criterion registered · hash ${exit.hash.slice(0, 8)}… · evaluated: ${exit.fired ? "FIRED" : "NOT FIRED"} (${exit.why}).` : `Exit criterion registered · hash ${exit.hash.slice(0, 8)}… · ${exit.why}` })

    // the self-check — every emitted line passes the advice wall + the banned-output check (the compiler authored nothing)
    for (const l of lines) {
      const g = guardLine(l.text)
      if (!g.ok) throw new Error(`COMPILE HALT — ${g.reason}: "${l.text}"`)
    }

    return { positions, effectiveBets, catchAggregation, worstAxis, thesisAge, exit, compositeVerdict: null, lines }
  }

  // the pinned label for the D38 absence (manifest-pins compositeAbsence) — rendered so the missing pill is CONSPICUOUS.
  export const COMPOSITE_ABSENCE = "No composite strategy verdict is rendered — a verdict-shaped rule over a strategy's positions awaits the Operator's D38. Below are each position's own verdict + the composed facts."

  // the composed effective-bets fact in BOTH registers (X-MANIFEST e; behind the EXISTING walls — no new AI capability).
  // It REUSES correlate.ts's pinned two-register grammar — the SAME fact the Ask COMPARE already speaks (the composed
  // drawer and the Ask console speak ONE grammar; the Interpreter phrases, never computes). Simple: plain, no decimals;
  // Pro: the ρ-clusters, merge threshold, shared points. Returns null when there is nothing to compose (< 2 series).
  export function effectiveBetsFact(composed: Composed, register: "simple" | "pro"): string | null {
    return composed.effectiveBets ? Correlate.diversificationFact(composed.effectiveBets, register) : null
  }
}
