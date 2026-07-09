/**
 * ORGΛNON — THE ASK CONSOLE, the deterministic ENGINE TOOLS (Crown-Jewel Phase 6; Rule X-ASK b, X-DETERM). Each intent
 * routes to ONE pure engine tool that returns FACTS — the SAME REAL/SAMPLE-labeled, provenance-ref'd fact rows the
 * Reality Check renders (a scorecard-via-Ask ≡ a scorecard-via-screen). NO new engine logic lives here: the tools CALL
 * the existing scorecard (via the record), the record, the coverage matrix, and the opt-in Stamp. Read-only — the tools
 * touch no engine state, move no verdict. These facts are the ONLY ground truth the AI phrasing (Phase 7) may speak.
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { Scorecard } from "../analytics/scorecard"
import { Explain } from "../analytics/explain"
import { Reality } from "../studio/reality"
import { ProvRecord } from "../dataplane/record"
import { Stamp } from "../studio/stamp"
import { Cal } from "../cal/ledger"
import type { ContractSubAxis } from "../contract/subaxis"

export namespace AskTools {
  export interface ToolResult {
    tool: string
    ok: boolean // did the engine find the thing? (false → an honest "not found / unverified", never fabricated)
    reality: "REAL" | "SAMPLE" | "n/a" // the data reality of the facts (a gap is honest, never filled)
    facts: Explain.FactRow[] // the engine fact rows — the ONLY ground truth the AI may phrase (the groundedness gate's table)
    summary: string // the DETERMINISTIC templated answer (also the AI's grounding target — the AI may phrase, never exceed it)
    meta: Record<string, unknown>
  }
  const notFound = (tool: string, term: string): ToolResult => ({ tool, ok: false, reality: "n/a", facts: [], summary: `I don't have a strategy matching "${term}" in the record. I can only speak about the recorded strategies on the Shelf — I won't guess or fabricate one. Ask "what can you check?" for the list.`, meta: { term } })

  // the deep counterparty DETAIL as GROUNDING facts (Contract-Truth Phase 4) — the contract-risk tier + each named
  // structural finding, so the AI may phrase the ENGINE's OWN contract facts (never invent one) + a fabricated "safe" is
  // rejected wholesale (the safety guard). It is a structural screen over verified source — NEVER "safe"/"audited".
  export function contractFactRows(cs: ContractSubAxis): Explain.FactRow[] {
    const rows: Explain.FactRow[] = [{ id: "contract-screen", name: "contract screen (deterministic structural screen over verified source — not a full audit)", value: cs.tier, threshold: null, comparator: null, outcome: "info", contribution: "context", provenanceRef: cs.contentSha }]
    cs.findings.forEach((f, i) => rows.push({ id: `contract-finding-${i}`, name: `structural finding [${f.category}]`, value: f.detail, threshold: null, comparator: null, outcome: "info", contribution: "context", provenanceRef: cs.contentSha }))
    return rows
  }

  // ── scorecardFor — the whole Reality Check for one strategy (the same rows the screen renders) ──
  export function scorecardFor(poolKey: string | undefined, term: string, now: number): ToolResult {
    if (!poolKey) return notFound("scorecardFor", term)
    const rc = Reality.realityCheck(poolKey, now)
    if (!rc) return notFound("scorecardFor", term)
    const oneLiner = rc.scored.summary.replace(/^(SOLID|CAUTION|AVOID|UNVERIFIED)\s*—\s*/, "")
    const facts = [...rc.scored.factRows, ...contractFactRows(rc.scored.contract)]
    return { tool: "scorecardFor", ok: true, reality: rc.scored.facts.reality, facts, summary: `${rc.name} — verdict ${rc.scored.verdict} (${rc.scored.facts.reality}). ${oneLiner}`, meta: { poolKey, name: rc.name, verdict: rc.scored.verdict, reality: rc.scored.facts.reality, contractTier: rc.scored.contract.tier } }
  }

  // ── metric — one axis/metric of a strategy (a single fact row) ──
  export function metric(poolKey: string | undefined, field: string, term: string, now: number): ToolResult {
    if (!poolKey) return notFound("metric", term)
    const rc = Reality.realityCheck(poolKey, now)
    if (!rc) return notFound("metric", term)
    const row = rc.scored.rows.find((r) => r.axis === field)
    if (!row) return { tool: "metric", ok: false, reality: rc.scored.facts.reality, facts: [], summary: `The "${field}" metric doesn't apply to ${rc.name} (it's not one of this strategy's axes). Nothing is fabricated.`, meta: { poolKey, field } }
    const facts = Scorecard.toFactRows([row])
    const val = row.tier === "not-applicable" ? "not-applicable" : `${row.value}${row.threshold !== null ? ` (threshold ${row.comparator ?? ""} ${row.threshold})` : ""} → ${row.tier.toUpperCase()}`
    return { tool: "metric", ok: true, reality: rc.scored.facts.reality, facts, summary: `${rc.name} — ${row.name}: ${val} (${rc.scored.facts.reality}). ${row.plainReason}`, meta: { poolKey, field, tier: row.tier, value: row.value } }
  }

  // ── recordHistory — the provenance captures behind a strategy (the moat made legible) ──
  export function recordHistory(poolKey: string | undefined, term: string): ToolResult {
    if (!poolKey) return notFound("recordHistory", term)
    const hist = ProvRecord.fullHistory(poolKey)
    if (!hist.length) return { tool: "recordHistory", ok: false, reality: "SAMPLE", facts: [], summary: `No recorded provenance for "${term}" yet — it's SAMPLE (not in the timestamped record). Re-capture keyless for a REAL reading.`, meta: { poolKey } }
    const facts: Explain.FactRow[] = hist.map((h, i) => ({ id: `capture-${i}`, name: `capture @ ${new Date(h.asOf).toISOString().slice(0, 10)}`, value: h.contentHash.slice(0, 12) + "…", threshold: null, comparator: null, outcome: "info", contribution: "context", provenanceRef: h.contentHash }))
    return { tool: "recordHistory", ok: true, reality: "REAL", facts, summary: `${hist.length} recorded capture${hist.length === 1 ? "" : "s"} on the provenance chain (the moat — a competitor can copy the lens, not this timestamped record).`, meta: { poolKey, captures: hist.length } }
  }

  // ── stampFor — the OPT-IN overfit Stamp on a strategy's recorded track record (a DISTINCT verdict, never the scorecard's) ──
  export async function stampFor(poolKey: string | undefined, term: string): Promise<ToolResult> {
    if (!poolKey) return notFound("stampFor", term)
    const r = await Stamp.stampFor(poolKey)
    const facts: Explain.FactRow[] = r.facts ? Explain.factTable(r.facts).rows : [{ id: "stamp", name: "the overfit Stamp (opt-in)", value: r.verdict, threshold: null, comparator: null, outcome: "info", contribution: "deciding", provenanceRef: null }]
    // surface the two opt-in DEPTH sub-scores as GROUNDING facts (Persistence Phase 5) — so the AI may phrase the half-life
    // + ICIR the ENGINE produced (the numbers in r.reason resolve to these rows), never invent one. Off the mass path; a
    // fabricated half-life/ICIR is rejected WHOLESALE by the groundedness gate. Present only on a scored GO/NO-GO Stamp.
    if (r.decay && r.decay.halfLife !== null) facts.push({ id: "decay-halflife", name: "edge half-life (periods; within-strategy serial persistence, not the carry)", value: r.decay.halfLife, threshold: r.decay.floor, comparator: "≥", outcome: r.decay.tier === "TRACEABLE" ? "pass" : "fail", contribution: "context", provenanceRef: r.reproHash })
    if (r.icir && r.icir.icir !== null) facts.push({ id: "icir", name: "temporal consistency ratio (within-strategy — NOT a cross-sectional factor rank)", value: r.icir.icir, threshold: r.icir.floor, comparator: "≥", outcome: r.icir.tier === "CONSISTENT" ? "pass" : "fail", contribution: "context", provenanceRef: r.reproHash })
    return { tool: "stampFor", ok: r.available, reality: r.available && r.verdict !== "UNAVAILABLE" ? "REAL" : "n/a", facts, summary: r.reason, meta: { poolKey, stampVerdict: r.verdict, nObs: r.nObs, cleanGo: r.cleanGo, decayTier: r.decay?.tier ?? null, icirTier: r.icir?.tier ?? null } }
  }

  // ── compare — N strategies, side by side (n FACT sets; the AI phrases + a gated comparison, never re-judges). Voice: the
  // n-strategies upgrade. The 2-way `compare` delegates to `compareMany` (back-compat: aName/bName/aVerdict/bVerdict kept). ──
  export function compareMany(entries: { poolKey?: string; term: string }[], now: number): ToolResult {
    const scored = entries.map((e) => ({ e, r: scorecardFor(e.poolKey, e.term, now) }))
    const found = scored.filter((s) => s.r.ok)
    if (found.length < 2) {
      const missing = scored.filter((s) => !s.r.ok).map((s) => `"${s.e.term}"`)
      return { tool: "compare", ok: false, reality: "n/a", facts: scored.flatMap((s) => s.r.facts), summary: `I can only compare recorded strategies. Couldn't find ${missing.join(", ")}.`.trim(), meta: { count: found.length } }
    }
    const reality: ToolResult["reality"] = found.every((s) => s.r.reality === "REAL") ? "REAL" : "SAMPLE"
    const facts = found.flatMap((s) => s.r.facts)
    const names = found.map((s) => String(s.r.meta.name))
    const verdicts = found.map((s) => String(s.r.meta.verdict))
    const line = found.map((s) => `${s.r.meta.name} → ${s.r.meta.verdict} (${s.r.reality})`).join(" vs ")
    const meta: Record<string, unknown> = { count: found.length, names, verdicts }
    if (found[0]) { meta.aName = found[0].r.meta.name; meta.aVerdict = found[0].r.meta.verdict; meta.aKey = found[0].e.poolKey }
    if (found[1]) { meta.bName = found[1].r.meta.name; meta.bVerdict = found[1].r.meta.verdict; meta.bKey = found[1].e.poolKey }
    return { tool: "compare", ok: true, reality, facts, summary: `${line}. The verdicts are the scorecard's, machine-derived; compare their axes above — I don't re-judge, I only lay them side by side.`, meta }
  }
  export function compare(aKey: string | undefined, aTerm: string, bKey: string | undefined, bTerm: string, now: number): ToolResult {
    return compareMany([{ poolKey: aKey, term: aTerm }, { poolKey: bKey, term: bTerm }], now)
  }

  // ── the calibration status line (X-CAL; record-only) — reads the committed hash-chained ledger if present, else the
  // honest "not started". NEVER a score — the only surface is the count until real resolutions exist (Phase 4 populates it). ──
  export function calibrationStatusLine(): string {
    try {
      const p = path.join(PKG_ROOT, "data", "honesty", "cal-ledger.json")
      if (!existsSync(p)) return "Calibration: the prediction clock has not started recording yet — no score is shown, and none will be until real resolutions exist."
      return Cal.status(JSON.parse(readFileSync(p, "utf8"))).line // single source — the honest count, never a score
    } catch { return "Calibration: the prediction clock has not started recording yet." }
  }

  // ── outlook — the persistence EVIDENCE, NEVER a forecast (X-VOICE f). "the engine is not a forecaster" first; then the
  // decay half-life + within-strategy ICIR + funding-regime FACTs; then the calibration status. No invented number. ──
  export async function outlook(poolKey: string | undefined, term: string, now: number): Promise<ToolResult> {
    if (!poolKey) return notFound("outlook", term)
    const rc = Reality.realityCheck(poolKey, now)
    if (!rc) return notFound("outlook", term)
    const stamp = await Stamp.stampFor(poolKey)
    const facts: Explain.FactRow[] = []
    const fr = rc.scored.rows.find((r) => r.axis === "funding-regime")
    const fundingApplicable = fr && fr.tier !== "not-applicable"
    if (fundingApplicable) facts.push(...Scorecard.toFactRows([fr!]))
    const evidence: string[] = []
    if (stamp.decay && stamp.decay.halfLife !== null) {
      facts.push({ id: "decay-halflife", name: "edge half-life (serial persistence of the recorded signal — not the carry)", value: stamp.decay.halfLife, threshold: stamp.decay.floor, comparator: "≥", outcome: stamp.decay.tier === "TRACEABLE" ? "pass" : "fail", contribution: "context", provenanceRef: stamp.reproHash })
      evidence.push(stamp.decay.tier === "TRACEABLE" ? "its recorded edge shows a traceable, persistent time-structure" : "its recorded edge is short-lived (a fee-chase rather than a persistent structure)")
    }
    if (stamp.icir && stamp.icir.icir !== null) {
      facts.push({ id: "icir", name: "temporal consistency (within-strategy — not a cross-sectional rank)", value: stamp.icir.icir, threshold: stamp.icir.floor, comparator: "≥", outcome: stamp.icir.tier === "CONSISTENT" ? "pass" : "fail", contribution: "context", provenanceRef: stamp.reproHash })
      evidence.push(stamp.icir.tier === "CONSISTENT" ? "its recorded edge holds steadily across periods" : "its recorded edge is lumpy across periods")
    }
    if (fundingApplicable) evidence.push("its funding carry is shown as a band, never a single hero number — the research shows funding swings widely")
    if (!evidence.length) evidence.push("there isn't enough recorded history yet to read a persistence signal — an honest gap, not a forecast")
    const summary = `The engine is NOT a forecaster — it can't tell you ${rc.name}'s next-month yield, and it won't invent one. What it CAN show is the persistence EVIDENCE from the record: ${evidence.join("; ")}. ${calibrationStatusLine()}`
    return { tool: "outlook", ok: true, reality: rc.scored.facts.reality, facts, summary, meta: { poolKey, name: rc.name, notForecaster: true, decayTier: stamp.decay?.tier ?? null, icirTier: stamp.icir?.tier ?? null } }
  }

  // ── scenario — labeled CONDITIONALS over the recorded facts, NEVER an invented number (X-VOICE, SCENARIO). ──
  export function scenario(poolKey: string | undefined, term: string, now: number): ToolResult {
    // no strategy named (e.g. a bare "what if ETH drops 20%?") — the engine runs no price scenarios; guide the reader to
    // name a recorded strategy rather than echoing the whole query back as a missing "strategy" (a DOGFOOD-drive fix, DF1).
    if (!poolKey) return { tool: "scenario", ok: false, reality: "n/a", facts: [], summary: `The engine doesn't run price scenarios or invent a number — it can't tell you what a market move would do to a price. What it CAN give you is the CONDITIONAL STRUCTURE from a recorded strategy's own facts (e.g. "IF the reward emissions fade, only the durable base remains"). Name a recorded strategy — like "what if aave-v3 USDC's rewards fade?" — and I'll show you its conditionals; I won't fabricate a figure.`, meta: { scenario: true } }
    const rc = Reality.realityCheck(poolKey, now)
    if (!rc) return notFound("scenario", term)
    const cond: Record<string, string> = {
      "funding-regime": "IF funding flips negative, the carry axis (shown as a band) turns adverse and the delta-neutral edge compresses",
      "peg": "IF the stablecoin breaks its peg band, the peg axis moves from pass to fail",
      "yield-reality": "IF the reward emissions fade, only the durable base remains — the yield-reality axis already measures that floor",
      "tvl-trend": "IF deposits start fleeing, the TVL-trend axis slope turns down toward its collapse floor",
      "liquidity-depth": "IF the pool's reserve thins, the liquidity-depth axis flags real exit / slippage risk",
      "counterparty": "IF the strategy stacks more protocol dependencies, the counterparty screen adds hidden surface",
      "unlock-overhang": "IF a large token unlock lands, the unlock-overhang axis flags structured supply risk",
    }
    const conds = rc.scored.rows.filter((r) => r.material && cond[r.axis]).map((r) => cond[r.axis])
    const facts = Scorecard.toFactRows(rc.scored.rows.filter((r) => r.material))
    const summary = `The engine doesn't run price scenarios or invent a number — it gives you the CONDITIONAL STRUCTURE from ${rc.name}'s own recorded facts: ${conds.join("; ")}. These are qualitative conditionals over the engine's axes, never a fabricated figure.`
    return { tool: "scenario", ok: true, reality: rc.scored.facts.reality, facts, summary, meta: { poolKey, name: rc.name } }
  }

  // ── adviceBoundary — the X-ADVICE resolution (law): the FACTs + labeled risk framing + the researcher-not-advisor
  // boundary. NEVER a recommendation. Done well, the boundary is the most valuable answer in the product. ──
  export function adviceBoundary(poolKey: string | undefined, term: string, now: number): ToolResult {
    if (!poolKey) return { tool: "adviceBoundary", ok: true, reality: "n/a", facts: [], summary: `I can't tell you whether to invest — that's personalized financial advice, and ORGΛNON is a researcher, not an advisor (a regulated-activity boundary, not a brand choice). Name a recorded strategy and I'll give you its facts, the risk framing, and the honest boundary — the decision stays yours.`, meta: { adviceBoundary: true } }
    const rc = Reality.realityCheck(poolKey, now)
    if (!rc) return notFound("adviceBoundary", term)
    const oneLiner = rc.scored.summary.replace(/^(SOLID|CAUTION|AVOID|UNVERIFIED)\s*—\s*/, "")
    const framing = rc.scored.failing.length ? `The risk framing: the engine flags ${rc.scored.failing.join(", ")}.` : "The risk framing: no material axis is failing, but a past reading is never a promise of a future one."
    const facts = [...rc.scored.factRows, ...contractFactRows(rc.scored.contract)]
    const summary = `I can't tell you whether to invest in ${rc.name} — that would be personalized financial advice, and ORGΛNON is a researcher, not an advisor (a regulated-activity boundary, not a brand choice). What the engine gives you instead: ${rc.name} reads ${rc.scored.verdict} — ${oneLiner} ${framing} What you do with these facts is your decision.`
    return { tool: "adviceBoundary", ok: true, reality: rc.scored.facts.reality, facts, summary, meta: { poolKey, name: rc.name, verdict: rc.scored.verdict, contractTier: rc.scored.contract.tier, adviceBoundary: true } }
  }

  // ── general — the FULL scorecard fact set for the reasoning layer to work over (can't-ground → the honest boundary). ──
  export function general(poolKey: string | undefined, term: string, now: number): ToolResult {
    return { ...scorecardFor(poolKey, term, now), tool: "general" }
  }

  // ── coverageMatrix — what the tool can check (the total 3×7 applicability matrix) ──
  export function coverageMatrix(): ToolResult {
    const facts: Explain.FactRow[] = []
    for (const v of ["stablecoin-yield", "lending", "delta-neutral"] as Scorecard.Vertical[])
      for (const ax of ["yield-reality", "tvl-trend", "peg", "liquidity-depth", "unlock-overhang", "counterparty", "funding-regime"] as Scorecard.Axis[])
        facts.push({ id: `${v}/${ax}`, name: `${ax} on ${v}`, value: Scorecard.APPLIES[v][ax], threshold: null, comparator: null, outcome: "info", contribution: "context", provenanceRef: null })
    return { tool: "coverageMatrix", ok: true, reality: "n/a", facts, summary: `I check three money verticals — stablecoin-yield, lending, delta-neutral — across seven axes (yield-reality, TVL trend, peg, liquidity depth, unlock overhang, counterparty, funding regime), each rendered where it applies (an inapplicable axis shows "not-applicable", never a fabricated pass). The opt-in Stamp adds a separate GO/NO-GO/INSUFFICIENT overfit verdict.`, meta: { verticals: 3, axes: 7 } }
  }

  // ── glossary — a pinned plain definition of a term (no strategy facts; a definition, never a number the engine didn't make) ──
  export const GLOSSARY: Record<string, string> = {
    sharpe: "Sharpe ratio — a strategy's average return divided by its volatility (risk-adjusted return). Higher is steadier per unit of risk; it is NOT a guarantee of future return.",
    dsr: "Deflated Sharpe / deflated significance — the significance of a track record AFTER charging for how many attempts were tried (the anti-PBO deflation). It's the bar the opt-in Stamp uses.",
    "deflated significance": "The significance of a track record after charging for the number of attempts searched — the anti-overfitting (anti-PBO) deflation the Stamp applies.",
    deflation: "Charging a result for the size of the search that produced it — the more strategies you try, the higher the bar a survivor must clear. It's how the Stamp resists overfitting.",
    unverified: "UNVERIFIED — we can't confirm this from recorded data (it's SAMPLE, or a key axis is uncomputable). It is an honest gap, NEVER a disguised pass or fail.",
    "not-applicable": "not-applicable — this axis doesn't apply to this kind of strategy (e.g. a dollar peg on a non-stablecoin). It's shown honestly and never counts as a pass.",
    "not applicable": "not-applicable — this axis doesn't apply to this kind of strategy. It's shown honestly and never counts as a pass.",
    go: "GO (the opt-in Stamp) — the recorded track record SURVIVES the anti-PBO overfit deflation. A statistics verdict on the track record — NOT the scorecard's 'safe', and never conflated with SOLID.",
    "no-go": "NO-GO (the opt-in Stamp) — the recorded track record does NOT survive the overfit deflation. A statistics verdict, orthogonal to the scorecard.",
    insufficient: "INSUFFICIENT (the opt-in Stamp) — not enough recorded history to distinguish skill from chance. A forward clock, not a failure — never a fabricated GO.",
    solid: "SOLID (the Reality Check) — the yield looks real: mostly durable base yield, steady deposits, any stablecoin leg on peg. It is not financial advice.",
    caution: "CAUTION (the Reality Check) — a material axis is sliding or partly unconfirmable; the catch is named.",
    avoid: "AVOID (the Reality Check) — a material axis failed (e.g. mostly reward emissions, a depeg, thin liquidity); the failing axis is named.",
    peg: "Peg — a stablecoin's hold on its $1 value. On-peg within a tight band, a depeg beyond it — the peg axis screens the dollar leg.",
    tvl: "TVL — Total Value Locked, the money deposited in a pool. The TVL-trend axis reads whether deposits are staying or fleeing (a 30-day slope).",
    funding: "Funding carry — the periodic payment a perp position earns or pays. The funding-regime axis shows it as a BAND [p10,p90], never a single hero APY.",
    liquidity: "Liquidity depth — how much you could exit without moving the price. Thin liquidity is real exit/slippage risk; the liquidity axis screens a DEX pool's reserve.",
    unlock: "Unlock overhang — imminent token dilution from a vesting schedule. A large near-term unlock is structured supply risk (the axis is ARMED; the keyless source is paywalled — D6).",
    counterparty: "Counterparty screen — a COARSE structural screen (pool age · size · dependency), NOT a contract audit. It flags a young, tiny, or dependency-stacked pool.",
    "base yield": "Base yield — the durable interest a strategy earns from real activity, as opposed to temporary reward emissions. The yield-reality axis measures the base's share.",
    "reward emissions": "Reward emissions — temporary token incentives that inflate a headline APY and fade. The yield-reality axis flags a yield that's mostly emissions.",
    real: "REAL — the value was fetched and recorded in the timestamped provenance chain (the moat). Contrast SAMPLE.",
    sample: "SAMPLE — a labeled placeholder (offline / not captured). A SAMPLE value drives its verdict to UNVERIFIED — never dressed as REAL.",
    moat: "The moat — an append-only, hash-chained record of what was real and when. A competitor can copy the lens, not this timestamped history.",
    provenance: "Provenance — the recorded proof (content-hash + capture time) behind a shown value. A shown-but-unrecorded REAL is a Halt.",
    stamp: "The Stamp — the opt-in overfit stress test: the frozen anti-PBO adjudicator run on a pool's recorded track record → a DISTINCT GO/NO-GO/INSUFFICIENT verdict, orthogonal to the Reality Check.",
    overfit: "Overfitting — a track record that looks good only because many strategies were tried. The Stamp's deflation charges for the search to resist it.",
  }
  export function glossary(term: string | undefined): ToolResult {
    const key = (term ?? "").toLowerCase().trim()
    const def = key ? GLOSSARY[key] : undefined
    if (!def) return { tool: "glossary", ok: false, reality: "n/a", facts: [], summary: `I don't have a pinned definition for "${term}". I can define: ${Object.keys(GLOSSARY).slice(0, 12).join(", ")}, and more.`, meta: { term } }
    return { tool: "glossary", ok: true, reality: "n/a", facts: [{ id: key, name: key, value: def, threshold: null, comparator: null, outcome: "info", contribution: "context", provenanceRef: null }], summary: def, meta: { term: key } }
  }

  // ── workflow — a pinned deterministic guide (how to check a strategy) ──
  export const WORKFLOW_STEPS = [
    "Open the Shelf — every recorded strategy with its verdict (SOLID/CAUTION/AVOID/UNVERIFIED) and a REAL/SAMPLE freshness badge.",
    "Open one strategy's Reality Check — the seven-axis scorecard (yield-reality, TVL, peg, liquidity, unlock, counterparty, funding), each with a plain reason and, in Pro, the exact metric + provenance.",
    "Read the verdict as machine-derived — it falls out of the axis rows, never hand-written; a failing axis is always named; UNVERIFIED is an honest gap, not a pass.",
    "Optionally opt into the Stamp (Pro) — a SEPARATE GO/NO-GO/INSUFFICIENT overfit verdict on the track record; a GO is not 'safe', an INSUFFICIENT is not 'bad'.",
    "Trust but verify — run ./organon.sh verify: the numbers reproduce themselves (the evidence bundle + every live number's capture-manifest hash).",
  ]
  export function workflow(): ToolResult {
    const facts: Explain.FactRow[] = WORKFLOW_STEPS.map((s, i) => ({ id: `step-${i + 1}`, name: `step ${i + 1}`, value: s, threshold: null, comparator: null, outcome: "info", contribution: "context", provenanceRef: null }))
    return { tool: "workflow", ok: true, reality: "n/a", facts, summary: `To check a strategy: ${WORKFLOW_STEPS.map((s, i) => `(${i + 1}) ${s}`).join(" ")}`, meta: { steps: WORKFLOW_STEPS.length } }
  }

  // ── the UNSUPPORTED fallback — an honest "here's what I can help with", never an invented answer ──
  export function fallback(): ToolResult {
    return { tool: "fallback", ok: false, reality: "n/a", facts: [], summary: `I can only answer from the deterministic engine — no guessing. I can: check a strategy ("is aave-v3 USDC safe?"), give one metric ("what's the peg of USDC?"), run the opt-in overfit Stamp ("stamp aave-v3 USDC"), compare two ("aave USDC vs compound USDC"), explain a term ("what is deflation?"), show my coverage ("what can you check?"), or walk you through the workflow. What would you like?`, meta: {} }
  }
}
