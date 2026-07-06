/**
 * ORGΛNON STUDIO — the GOAL CONSOLE + the JOINED LOOP (End-User Phase 3; Rules E-CONSOLE, S-PROPOSE, D-LABEL; V9
 * finding 4). The one door a non-expert can open: a plain-English goal → the free-model agent path (a schema-valid spec,
 * NO authority) → a REAL-PIT adjudication on a delivered domain → the verdict card + the plain-language report. The two
 * halves V8 (model on illustrative data) and V9 (real data, no model) each held are finally JOINED — the model on REAL
 * data, the verdict the frozen core's, relayed UNTOUCHED. The console DERIVES NOTHING: it collects the goal and renders
 * the API response verbatim; every submission is write-then-invoke (Studio.submit registers-then-invokes); the model
 * cannot bless (capability absence — an injection in the goal changes at most the spec, never the verdict). Honest
 * failure states are first-class: a dead model endpoint, a malformed goal, a BLOCKED domain each render truthfully.
 */
import { createHash } from "node:crypto"
import { existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { Ledger } from "../ledger/ledger"
import { Studio } from "./adjudicate"
import { StudioAgents } from "./agents"
import { StudioReport } from "./report"
import { DataPlane } from "../dataplane/store"
import { DataPlaneEngine } from "../dataplane/engine"
import { DataPlaneAdjudicate } from "../dataplane/adjudicate"
import { Breadth } from "../analytics/breadth"
import { CPCV } from "../analytics/cpcv"
import { CpcvTracker } from "./cpcv_tracker"
import { Pool } from "../analytics/pool"
import { Explain } from "../analytics/explain"

export namespace Console {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  function stable(v: any): string {
    if (v === null || typeof v !== "object") return JSON.stringify(v)
    if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`
    const k = Object.keys(v).sort()
    return `{${k.map((x) => `${JSON.stringify(x)}:${stable(v[x])}`).join(",")}}`
  }

  export type State = "verdict" | "blocked" | "model-unavailable" | "malformed-goal"

  // the prompt the console hands the model — the goal + the markets it may allocate across (the model has NO other power)
  export function composePrompt(goal: string, availableMarkets: string[]): string {
    return `GOAL: ${goal}\nAVAILABLE_MARKETS: ${availableMarkets.join(", ")}\nCompose a schema-valid lending-carry StrategySpec (JSON) allocating weights across a subset of AVAILABLE_MARKETS. You have NO authority to decide the verdict.`
  }

  export interface Composition { spec: DataPlaneEngine.LendingSpec; modelId: string; transcript: string }
  // The free-model agent path: the model proposes a spec (no authority). A live free/open model slots in by registering
  // a live provider (the walls hold identically); the fixture provider replays a recorded composition (deterministic,
  // free — CI never hits a live model). A throw is a DEAD-ENDPOINT honest state; malformed/invalid output is MALFORMED.
  export async function composeFromGoal(goal: string, availableMarkets: string[], provider: StudioAgents.ModelProvider): Promise<{ ok: true; comp: Composition } | { ok: false; state: State; message: string }> {
    const prompt = composePrompt(goal, availableMarkets)
    let raw: string
    try {
      raw = await provider.complete([{ role: "user", content: prompt }])
    } catch (e) {
      // a dead model endpoint mid-goal — honest, actionable, NEVER a fabricated verdict
      return { ok: false, state: "model-unavailable", message: `The analysis model is unavailable right now (${String((e as Error).message ?? e).slice(0, 80)}). No verdict was produced — nothing was registered. Try again shortly; the system never invents a result when the model is down.` }
    }
    let parsed: any
    try { parsed = JSON.parse(raw) } catch { return { ok: false, state: "malformed-goal", message: "The model did not return a schema-valid strategy for that goal. No spec was registered (a malformed proposal is refused before the ledger, never adjudicated). Try rephrasing the goal." } }
    // validate: markets must be a non-empty subset of the available captured markets; weights in [0,1]
    const markets = Array.isArray(parsed?.markets) ? parsed.markets : []
    const okMarkets = markets.length > 0 && markets.every((m: any) => typeof m?.key === "string" && availableMarkets.includes(m.key) && typeof m?.weight === "number" && m.weight >= 0 && m.weight <= 1)
    if (!okMarkets) return { ok: false, state: "malformed-goal", message: "The proposed strategy referenced markets outside the available set or carried invalid weights. Refused before registration (the rejection boundary), never adjudicated." }
    const spec: DataPlaneEngine.LendingSpec = { family: "lending-carry", policy: parsed.policy === "carry-tilt" || parsed.policy === "carry-rotation" ? parsed.policy : "static", rebalance: { trigger: "monthly" }, markets: markets.map((m: any) => ({ key: m.key, weight: m.weight })) }
    return { ok: true, comp: { spec, modelId: provider.id, transcript: `${prompt}\n---\n${raw}` } }
  }

  export interface Artifact {
    goal: string
    modelId: string
    transcriptHash: string
    specHash: string
    ledger: { specHash: string; familySize: number; ledgerHead: string; nTrials: number }
    verdictReproHash: string
    provenance: DataPlaneAdjudicate.SeriesProvenance[]
    reportHash: string
    reality: "REAL-PIT" | "BLOCKED" | "ILLUSTRATIVE"
  }
  // the ADVISORY spine panels attached beside a verdict (R-ADVISORY): computed from the returns AFTER adjudication —
  // they never touch the verdict (a verdict differential proves it). The console DISPLAYS them; it derives no verdict.
  export interface Panels {
    breadth: Breadth.Panel
    eta: Breadth.Eta
    cpcv: CPCV.Result // SKIPPED for a single submission (a family of one cannot be cross-validated) — honest
    disclosure: string // the pro-disclosure block (raw panels; shown behind the toggle)
  }
  export interface JoinedResult {
    state: State
    goal: string
    message?: string // for a non-verdict state (model-unavailable / malformed / blocked)
    verdict?: string
    reportText?: string
    honesty?: StudioReport.HonestyResult
    provenance?: DataPlaneAdjudicate.SeriesProvenance[]
    artifact?: Artifact
    panels?: Panels // the advisory breadth/ETA/CPCV surfaces (Spine) — display-only, beside the verdict
    facts?: Explain.VerdictFacts // THE WHY PANEL (Explanation Phase 3) — the machine-derived facts the WHY registers explain
  }

  // build the WHY-panel FACTS from a StudioVerdict (Explanation Phase 3, X-FACTS). Every register (plain + quantitative)
  // generates from these — one machine-derived source of truth, never hand-typed.
  export function factsFromVerdict(v: Studio.StudioVerdict, reality: "REAL-PIT" | "ILLUSTRATIVE" | "BLOCKED", provenanceRef: string | null, extra?: { kEff?: number; charge?: number; selectionSurcharge?: number; killSwitchReason?: string; stateReason?: string }): Explain.VerdictFacts {
    const verdict = v.attestation.verdict
    const terminalState: Explain.TerminalState = extra?.killSwitchReason ? "kill-switch" : verdict === "GO" ? "GO" : verdict === "NO-GO" ? "NO-GO" : verdict === "CONDITIONAL" ? "CONDITIONAL" : verdict === "INSUFFICIENT-EVIDENCE" ? "INSUFFICIENT" : verdict === "MALFORMED" ? "MALFORMED" : verdict === "BLOCKED" ? "BLOCKED" : "NO-GO"
    return {
      terminalState, verdict,
      dsrAtDeclared: v.attestation.dsrAtDeclared ?? null,
      dsrThreshold: 0.95,
      familyDeclaredNTrials: v.familyDeclaredNTrials,
      tier: String((v.attestation as { verifiability?: string }).verifiability ?? "V0"),
      nObs: (v.attestation as { rigor?: { nObs?: number } }).rigor?.nObs ?? null,
      reality, provenanceRef,
      reproHash: (v.attestation as { reproHash?: string }).reproHash ?? sha256(stable({ verdict, dsr: v.attestation.dsrAtDeclared ?? null })),
      ...extra,
    }
  }

  // render the WHY PANEL for a verdict (both registers from the one fact table) — plain always; quantitative + raw table
  // behind the pro toggle. The panel READS the verdict; it never moves it (X-ONE, X-FACTS). Consistency-checked in tests.
  export function whyPanel(facts: Explain.VerdictFacts, opts?: { pro?: boolean }): string[] {
    const table = Explain.factTable(facts)
    const L: string[] = ["", "WHY (plain): " + Explain.plainLanguage(facts)]
    if (opts?.pro) {
      L.push("", ...Explain.quantitative(table).split("\n"))
      L.push("", "WHY (raw fact table — every field appears or is registered excluded):")
      for (const r of table.rows) L.push(`    ${r.id} = ${r.value}${r.threshold !== null ? ` (${r.comparator} ${r.threshold})` : ""} [${r.outcome}/${r.contribution}]`)
    }
    return L
  }

  // THE JOINED LOOP: goal → model composes a spec → REAL-PIT adjudication (write-then-invoke) → verdict + report + the
  // committed artifact bundle. The verdict is the core's, relayed VERBATIM; the model touches only the spec. If the
  // series are unprovenanced the label forces BLOCKED (D-LABEL) — never a bare REAL-PIT.
  export async function runJoinedLoop(goal: string, seriesByKey: Map<string, DataPlane.Series>, provider: StudioAgents.ModelProvider, timestamp: number): Promise<JoinedResult> {
    const available = [...seriesByKey.keys()]
    const c = await composeFromGoal(goal, available, provider)
    if (!c.ok) return { state: c.state, goal, message: c.message }

    // D-LABEL: a REAL-PIT label REQUIRES verifying provenance for every series — else BLOCKED (never a bare REAL-PIT)
    const lab = DataPlaneAdjudicate.label(seriesByKey)
    if (lab.reality === "BLOCKED") return { state: "blocked", goal, message: `This goal maps to a domain whose data is not REAL-PIT provenanced right now: ${lab.reason}. No REAL-PIT verdict is shown (the system renders BLOCKED, never a fabricated payload).` }

    // write-then-invoke: the ported engine on REAL snapshots → returns → Studio.submit registers-then-invokes → verdict
    const window = DataPlaneEngine.commonWindow([...seriesByKey.values()])
    const result = await DataPlaneEngine.lendingAccrual(c.comp.spec, window, seriesByKey)
    const returns = DataPlaneAdjudicate.returnsFromEquity(result.equity_curve)
    const store = new Ledger.Store()
    const verdict = await Studio.submit(store, { spec: c.comp.spec as any, authorClass: "agent", domain: "lending", timestamp, returns, barsPerYear: 365 })

    const reportText = StudioReport.render(verdict)
    const honesty = StudioReport.check(reportText, verdict)

    // ── the ADVISORY spine panels (R-ADVISORY) — computed from the returns, DISPLAYED beside the verdict, never
    // altering it (shared with the guided-builder door via computePanels; the IC uses the lag-1 persistence forecast).
    const panels = computePanels(returns, verdict)

    const specHash = sha256(stable(c.comp.spec))
    const artifact: Artifact = {
      goal,
      modelId: c.comp.modelId,
      transcriptHash: sha256(c.comp.transcript),
      specHash,
      ledger: { specHash, familySize: verdict.family.size, ledgerHead: store.length ? store.all()[store.length - 1].hash : "", nTrials: verdict.familyDeclaredNTrials },
      verdictReproHash: sha256(stable({ verdict: verdict.attestation.verdict, dsr: verdict.attestation.dsrAtDeclared ?? null, tier: (verdict.attestation as any).verifiability })),
      provenance: lab.provenance,
      reportHash: sha256(reportText),
      reality: lab.reality,
    }
    return { state: "verdict", goal, verdict: verdict.attestation.verdict, reportText, honesty, provenance: lab.provenance, artifact, panels, facts: factsFromVerdict(verdict, lab.reality, lab.provenance[0]?.contentSha ?? null) }
  }

  // renders the RESULT BODY verbatim (the verdict card + the plain-language report + the enroll action, or the honest
  // failure message). The pure StudioScreens.goalConsole screen frames this — the console derives nothing, it displays.
  export function renderResult(r: JoinedResult, opts?: { pro?: boolean }): string {
    const L: string[] = []
    if (r.state === "verdict") {
      L.push(`VERDICT: ${r.verdict}  (relayed verbatim from the frozen core — the model cannot bless; a NO-GO on real data is the product working)`)
      // D-LABEL (Explanation Phase 2 parity fix): the data-reality label is DERIVED from the artifact, never hardcoded —
      // REAL-PIT renders its provenance, ILLUSTRATIVE says so plainly (a mislabeled REAL-PIT was the parity narrowing).
      const reality = r.artifact?.reality ?? "REAL-PIT"
      L.push(reality === "REAL-PIT" ? `data: REAL-PIT · provenance ${(r.provenance ?? []).map((p) => p.contentSha.slice(0, 10) + "…").join(", ")}` : `data: ${reality} (no real-data provenance — a labeled fixture; a NO-GO here is still the product working)`)
      // the SPINE surfaces, in plain language, for everyone (advisory — the frozen gate above stays the only gate).
      // VERDICT-AWARE (W6-02): "why not yet · when" is shown ONLY for a refusal; an unconditional GO gets an evidence
      // profile, never a "not yet" that primes. Zero powered verdicts are expected, so the refusal branch is the norm.
      if (r.panels) {
        const refusal = r.verdict !== "GO"
        if (refusal) {
          L.push("", `WHY NOT YET: ${r.panels.breadth.whyNotYet}`)
          L.push(`WHEN, HONESTLY: ${r.panels.eta.range}  [${r.panels.eta.hedge}]`)
        } else {
          L.push("", `EVIDENCE PROFILE: information ratio ${r.panels.breadth.ir.toFixed(2)} over ${r.panels.breadth.breadth.betsPerYear.toFixed(0)} independent bets/yr — an unconditional GO cleared the frozen gate (rare, earned).`)
        }
        L.push(`  (advisory, not a gate: ${r.panels.breadth.breadth.independenceAssumption})`)
      }
      // K-LEGIBLE (Ensemble): every verdict renders its deflation basis — the n it was tested against, the scoping that
      // produced it, and a neutral comparability note — so a weakly-tested bar is legible to anyone (display-only).
      if (r.artifact) {
        L.push("", Pool.deflationBasis(r.artifact.ledger.nTrials, `family of ${r.artifact.ledger.familySize} · ${r.artifact.reality} data`))
        L.push(Pool.identityProvenanceNote()) // K-LEGIBLE identity provenance (Phase 2): self-declared, the ratchet + limiter keys named
      }
      // THE WHY PANEL (Explanation Phase 3, X-ONE/X-FACTS): both registers from the one fact table — plain always, the
      // quantitative + raw table behind the pro toggle. It READS the verdict; it never moves it (consistency-checked).
      if (r.facts) L.push(...whyPanel(r.facts, opts))
      L.push("", "REPORT:", ...(r.reportText ?? "").split("\n").map((x) => "  " + x))
      // the PRO-DISCLOSURE toggle — raw panels, display-only, derives nothing (shown only when the pro toggle is on):
      if (opts?.pro && r.panels) L.push("", ...r.panels.disclosure.split("\n").map((x) => "  " + x))
      L.push("", "[ enroll this not-yet verdict to watch its forward clock — observation, never execution (nothing signs) ]")
    } else {
      L.push(`${r.state.toUpperCase()}: ${r.message}`)
    }
    return L.join("\n")
  }

  // THE GUIDED BUILDER path (Reachability Phase 3; U-AMEND, S-PROPOSE, S-FAMILY): a spec composed field-by-field in the
  // builder (NO model) is adjudicated through the IDENTICAL write-then-invoke gate, with declared lineage — a prior
  // family (earlier edits) is registered first so the bar STIFFENS (an edit is another attempt; this is the product
  // working). The verdict is the frozen core's, relayed verbatim; the spine panels render, same as the goal door.
  export async function runComposed(spec: DataPlaneEngine.LendingSpec, seriesByKey: Map<string, DataPlane.Series>, timestamp: number, opts?: { priorFamily?: DataPlaneEngine.LendingSpec[] }): Promise<JoinedResult> {
    const lab = DataPlaneAdjudicate.label(seriesByKey)
    if (lab.reality === "BLOCKED") return { state: "blocked", goal: "(guided-builder)", message: `This composition maps to a domain whose data is not REAL-PIT provenanced right now: ${lab.reason}. No REAL-PIT verdict is shown (BLOCKED, never a fabricated payload).` }
    const window = DataPlaneEngine.commonWindow([...seriesByKey.values()])
    const result = await DataPlaneEngine.lendingAccrual(spec, window, seriesByKey)
    const returns = DataPlaneAdjudicate.returnsFromEquity(result.equity_curve)
    const store = new Ledger.Store()
    // declared lineage: register the prior family (earlier edits) so the family-size deflation counts this edit (S-FAMILY)
    let parentSeq: number | null = null
    for (const prior of opts?.priorFamily ?? []) parentSeq = Studio.register(store, { spec: prior, authorClass: "agent", authorId: "guided-builder", domain: "lending", parentSeq, timestamp }).seq
    const verdict = await Studio.submit(store, { spec, authorClass: "agent", authorId: "guided-builder", domain: "lending", parentSeq, timestamp, returns, barsPerYear: 365 })
    const reportText = StudioReport.render(verdict)
    const honesty = StudioReport.check(reportText, verdict)
    const panels = computePanels(returns, verdict)
    const specHash = sha256(stable(spec))
    const artifact: Artifact = { goal: "(guided-builder composition)", modelId: "guided-builder", transcriptHash: sha256("guided-builder"), specHash, ledger: { specHash, familySize: verdict.family.size, ledgerHead: store.length ? store.all()[store.length - 1].hash : "", nTrials: verdict.familyDeclaredNTrials }, verdictReproHash: sha256(stable({ verdict: verdict.attestation.verdict, dsr: verdict.attestation.dsrAtDeclared ?? null, tier: (verdict.attestation as any).verifiability })), provenance: lab.provenance, reportHash: sha256(reportText), reality: lab.reality }
    return { state: "verdict", goal: "(guided-builder)", verdict: verdict.attestation.verdict, reportText, honesty, provenance: lab.provenance, artifact, panels, facts: factsFromVerdict(verdict, lab.reality, lab.provenance[0]?.contentSha ?? null) }
  }

  // THE BUILDER, WHOLE — funding + basis composition (Ensemble Phase 2; K-SCOPE cure, U-SURFACE, R-BASIS). A funding or
  // basis spec composed field-by-field adjudicates through the IDENTICAL write-then-invoke gate, the verdict the frozen
  // core's, the spine panels rendered — same as lending. The builder-route data is ILLUSTRATIVE (a labeled deterministic
  // fixture — funding/basis captured snapshots are not wired to the builder route; D-LABEL: ILLUSTRATIVE is the honest
  // label, never a bare REAL-PIT). A NO-GO on illustrative data is the product working; the composition REACHES the screen.
  function illustrativeReturns(seedStr: string, n: number, mean: number): number[] {
    let a = 0
    for (let i = 0; i < seedStr.length; i++) a = (a * 31 + seedStr.charCodeAt(i)) >>> 0
    const rng = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
    const out: number[] = []
    while (out.length < n) { const u1 = Math.max(1e-12, rng()), u2 = rng(), r = Math.sqrt(-2 * Math.log(u1)); out.push(mean + 0.01 * r * Math.cos(2 * Math.PI * u2)); if (out.length < n) out.push(mean + 0.01 * r * Math.sin(2 * Math.PI * u2)) }
    return out
  }
  async function adjudicateComposed(spec: any, returns: number[], domain: string, authorId: string, reality: "REAL-PIT" | "ILLUSTRATIVE", timestamp: number, extraLabel: string, provenance: DataPlaneAdjudicate.SeriesProvenance[] = []): Promise<JoinedResult> {
    // D-LABEL: a REAL-PIT label REQUIRES verifying provenance — a bare REAL-PIT (no provenance) is impossible here.
    if (reality === "REAL-PIT" && !provenance.length) throw new Error("D-LABEL: a REAL-PIT verdict requires resolving provenance — refusing to render a bare REAL-PIT")
    const store = new Ledger.Store()
    const verdict = await Studio.submit(store, { spec, authorClass: "agent", authorId, domain, timestamp, returns, barsPerYear: 365 })
    const provLine = reality === "REAL-PIT" ? ` · provenance ${provenance.map((p) => p.contentSha.slice(0, 10) + "…").join(", ")}` : ""
    const reportText = StudioReport.render(verdict) + `\n\n[ ${reality} data — ${extraLabel}${provLine} ]`
    const honesty = StudioReport.check(reportText, verdict)
    const panels = computePanels(returns, verdict)
    const specHash = sha256(stable(spec))
    const artifact: Artifact = { goal: `(guided-builder ${domain})`, modelId: "guided-builder", transcriptHash: sha256(`guided-builder-${domain}`), specHash, ledger: { specHash, familySize: verdict.family.size, ledgerHead: store.length ? store.all()[store.length - 1].hash : "", nTrials: verdict.familyDeclaredNTrials }, verdictReproHash: sha256(stable({ verdict: verdict.attestation.verdict, dsr: verdict.attestation.dsrAtDeclared ?? null })), provenance, reportHash: sha256(reportText), reality }
    return { state: "verdict", goal: `(guided-builder ${domain})`, verdict: verdict.attestation.verdict, reportText, honesty, provenance, artifact, panels, facts: factsFromVerdict(verdict, reality, provenance[0]?.contentSha ?? null) }
  }
  // the venues with a captured REAL T1 funding snapshot (D-LABEL parity, K-SCOPE cure). Only Binance freepit T1 exists;
  // other venues have NO captured snapshot → ILLUSTRATIVE, labeled honestly (real where it exists, illustrative where it
  // genuinely does not). The real binance funding is an 8h-interval series — a 1h pick has no real data → ILLUSTRATIVE.
  const FUNDING_REAL_KEY: Record<string, string | undefined> = { binance: "funding:binance:BTCUSDT" }
  // FUNDING — venue/interval/side. PARITY (Explanation Phase 2, X-SELECT-adjacent K-SCOPE cure): wired to the REAL
  // captured T1 funding snapshot where it exists (Binance, 8h). The funding-carry return series IS the per-interval
  // funding rate (receive → +rate, pay → −rate) — the real observed carry, REAL-PIT with provenance. Absent a captured
  // snapshot for the venue/interval → ILLUSTRATIVE (never a mislabeled REAL-PIT; D-LABEL forces the honest label).
  export async function runComposedFunding(spec: { family: "funding-carry"; venue: string; intervalHours: number; side: "receive" | "pay" }, timestamp: number): Promise<JoinedResult> {
    const key = FUNDING_REAL_KEY[spec.venue]
    const s = key ? DataPlane.snapshotAdapter.fetchSeries(key) : null
    const realIntervalOk = !!s && ((s.points[0] as { intervalHours?: number }).intervalHours ?? 8) === spec.intervalHours
    if (s && s.provenance?.reality === "REAL-PIT" && realIntervalOk) {
      const lab = DataPlaneAdjudicate.label(new Map([[key!, s]]))
      if (lab.reality === "REAL-PIT") {
        const sign = spec.side === "receive" ? 1 : -1
        const returns = s.points.map((p) => sign * (p as { rate: number }).rate).filter((r) => Number.isFinite(r))
        return adjudicateComposed(spec, returns, "funding", "guided-builder-funding", "REAL-PIT", timestamp, `${spec.venue} funding ${spec.intervalHours}h ${spec.side} · ${returns.length} REAL intervals (Binance freepit T1)`, lab.provenance)
      }
    }
    // no captured T1 snapshot for this venue/interval → ILLUSTRATIVE, labeled honestly (the real-where-it-exists discipline)
    const returns = illustrativeReturns(stable(spec), 400, spec.side === "receive" ? 0.0003 : -0.0002)
    return adjudicateComposed(spec, returns, "funding", "guided-builder-funding", "ILLUSTRATIVE", timestamp, `${spec.venue} funding, ${spec.intervalHours}h, ${spec.side} — ILLUSTRATIVE (no captured T1 snapshot for ${spec.venue}${realIntervalOk ? "" : "/" + spec.intervalHours + "h"}; only Binance 8h freepit T1 is captured)`)
  }
  // BASIS — the cross-venue spread, tiered at MIN(legs); the per-leg tiers carried on the verdict (R-BASIS)
  export async function runComposedBasis(spec: { family: "basis-carry"; cexVenue: string; dexVenue: string; cexTier: string; dexTier: string; minTier: string }, timestamp: number): Promise<JoinedResult> {
    const returns = illustrativeReturns(stable(spec), 400, 0.0002)
    // PARITY (Explanation Phase 2): the basis is a CROSS-VENUE SPREAD (CeFi − DeFi). Real per-leg funding exists
    // (Binance T1 2024 · Hyperliquid T2 2026) but the capture windows do NOT temporally overlap — no aligned cross-venue
    // point exists, so NO real basis series can be constructed (Basis.build drops all non-matching ts). ILLUSTRATIVE is
    // the HONEST label (not a narrowing — the real spread genuinely does not exist); the tier stays MIN(legs)=T2 +
    // EXPERIMENTAL, never quietly upgraded (the adversarial check — parity must not upgrade a tier).
    return adjudicateComposed(spec, returns, "basis", "guided-builder-basis", "ILLUSTRATIVE", timestamp, `${spec.cexVenue} ${spec.cexTier} vs ${spec.dexVenue} ${spec.dexTier} · basis tier=MIN(legs)=${spec.minTier} · EXPERIMENTAL — ILLUSTRATIVE (real per-leg funding exists but the Binance-2024/Hyperliquid-2026 capture windows do not overlap; no aligned cross-venue spread series exists to adjudicate REAL-PIT)`)
  }

  // THE POOL COMPOSER (Ensemble Phase 3; K-EFF, K-LEGIBLE, U-AMEND-2, U-SURFACE) — the park protocol's first delivered
  // capability, through the open door. Compose a depth-1 pool of member strategies → the pool registers as a trial at the
  // union's K_eff charge → the frozen core adjudicates the pooled series → the verdict + K_eff + union family + the
  // mandatory stress caveat + the legible deflation basis. Member data is ILLUSTRATIVE (labeled). The `regime` lets the
  // user see the difference: "diversified" (low ρ → K_eff high → a real diversified pool) vs "correlated" (high ρ →
  // K_eff≈1 → "this pool adds nothing beyond its strongest member" — the honest failure, without refusing composition).
  export function illustrativePoolMembers(count: number, regime: "diversified" | "correlated", n = 400, variant = 0): Pool.Member[] {
    const rho = regime === "correlated" ? 0.97 : 0.05
    const a = Math.sqrt(rho), b = Math.sqrt(1 - rho)
    let seed = (regime === "correlated" ? 0xc0 : 0xd1) + variant * 0x1000 // variant = a genuine member swap (distinct members)
    const rng = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
    const g = (k: number): number[] => { let s = (k * 7919 + seed) >>> 0; const r = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }; const o: number[] = []; while (o.length < n) { const u1 = Math.max(1e-12, r()), u2 = r(), rr = Math.sqrt(-2 * Math.log(u1)); o.push(rr * Math.cos(2 * Math.PI * u2)); if (o.length < n) o.push(rr * Math.sin(2 * Math.PI * u2)) } return o }
    const common = g(0)
    return Array.from({ length: count }, (_, k) => ({ specHash: `illus-${regime}-${k}-${count}`, family: "lending-carry", returns: common.map((c, t) => 0.0016 + 0.01 * (a * c + b * g(k + 1)[t])) }))
  }
  export interface PoolResult { state: "verdict" | "refused"; render: string; pool?: Pool.PoolVerdict; panels?: Panels; message?: string; spec?: Pool.PoolSpec; facts?: Explain.VerdictFacts }
  export async function runComposedPool(members: Pool.Member[], timestamp: number, opts?: { priorCompositions?: Pool.PoolSpec[]; selectionState?: Pool.SelectionDoorState; selectionUniverse?: number }): Promise<PoolResult> {
    const v = Pool.validateMembers(members)
    if (!v.ok) return { state: "refused", render: `INVALID POOL (refused before registration): ${v.error}`, message: v.error }
    const store = new Ledger.Store()
    const pool = await Pool.composeAndAdjudicate(store, members, timestamp, { priorCompositions: opts?.priorCompositions, selectionState: opts?.selectionState, selectionUniverse: opts?.selectionUniverse })
    const spec: Pool.PoolSpec = { family: Pool.POOL_FAMILY, memberHashes: members.map((m) => m.specHash), kEffCharge: pool.charge, rhoBar: pool.rhoBar }
    const panels = computePanels(Pool.poolReturns(members), { attestation: { verdict: pool.verdict, dsrAtDeclared: pool.dsrAtDeclared }, family: { size: pool.familySize }, familyDeclaredNTrials: pool.familyDeclaredNTrials, rootCount: 1 } as any)
    const L: string[] = []
    L.push(`[ POOL VERDICT: ${pool.verdict} ]  (the frozen core adjudicated the pooled series — never a GO unless earned)`)
    L.push(`POOL · ${pool.memberCount} members · K_eff=${pool.kEff.toFixed(2)} (ρ̄=${pool.rhoBar.toFixed(2)}) · breadth charge=ceil(K_eff)=${pool.charge}${pool.selectionSurcharge > 0 ? ` · selection surcharge=+${pool.selectionSurcharge} (best-of-${pool.selectionUniverse} pick priced)` : ` · no best-of-M pick (M=K)`} · effective charge=${pool.effectiveCharge} · family(compositions)=${pool.familySize} · deflated-n=${pool.familyDeclaredNTrials}`)
    if (pool.addsNothing) L.push(`⚠ THIS POOL ADDS NOTHING BEYOND ITS STRONGEST MEMBER — K_eff≈1 (the members are near-duplicates; pooling them buys no diversification). Composed, not refused; the honest read is on the screen.`)
    L.push(pool.legibility) // K-LEGIBLE
    L.push(Pool.identityProvenanceNote()) // K-LEGIBLE identity provenance (Phase 2): self-declared identity, the two keys named
    L.push(pool.stressCaveat) // mandatory copy
    L.push(pool.selectionCaveat) // X-SELECT: the interim "the pick is not yet priced" note, until the selection door answers
    L.push("", "[ ILLUSTRATIVE member data — the pool composition + K_eff + charge are real; a NO-GO is the product working ]")
    // THE WHY PANEL for the pool (Explanation Phase 3): both registers from the fact table, incl. the pool-specific rows.
    const pv = pool.verdict
    const facts: Explain.VerdictFacts = { terminalState: pv === "GO" ? "GO" : pv === "CONDITIONAL" ? "CONDITIONAL" : pv === "INSUFFICIENT-EVIDENCE" ? "INSUFFICIENT" : "NO-GO", verdict: pv, dsrAtDeclared: pool.dsrAtDeclared, dsrThreshold: 0.95, familyDeclaredNTrials: pool.familyDeclaredNTrials, tier: "V0", nObs: null, reality: "ILLUSTRATIVE", provenanceRef: null, reproHash: sha256(stable({ pv, dsr: pool.dsrAtDeclared, k: pool.kEff })), kEff: pool.kEff, charge: pool.charge, selectionSurcharge: pool.selectionSurcharge }
    L.push(...whyPanel(facts))
    const render = [...L, "", ...renderPanelsBlock(panels)].join("\n")
    return { state: "verdict", render, pool, panels, spec, facts }
  }
  function renderPanelsBlock(p: Panels): string[] {
    return [`WHY NOT YET: ${p.breadth.whyNotYet}`, `WHEN, HONESTLY: ${p.eta.range}  [${p.eta.hedge}]`]
  }

  // the advisory spine panels computed from a return series (shared by the goal door + the builder door) — R-ADVISORY.
  // The CPCV promotion tracker counter is surfaced on the pro disclosure (W7-01 — the tracker was instrumented in
  // Phase 2 but not reached the user's screen until the walk found it; the U-SURFACE disease in miniature).
  export function computePanels(returns: number[], verdict: Studio.StudioVerdict): Panels {
    const laggedSignal = [0, ...returns.slice(0, -1)]
    const breadth = Breadth.panel({ signal: laggedSignal, realized: returns, returns, barsPerYear: 365 })
    const eta = Breadth.eta(breadth)
    const cpcv = CPCV.run(returns.map((r) => [r]))
    let cpcvPromotion: string | null = null
    try { const f = path.join(PKG_ROOT, "data", "studio", "cpcv-promotion-tracker-v12.jsonl"); if (existsSync(f)) cpcvPromotion = CpcvTracker.status(f).render } catch { cpcvPromotion = null }
    const disclosure = Breadth.proDisclosure({ breadth, eta, rigor: { sharpeAnnualized: (verdict.attestation as any).sharpeAnnualized ?? null, dsr: verdict.attestation.dsrAtDeclared ?? null, psr0: (verdict.attestation as any).psr0 ?? null, nObs: returns.length }, cpcv: { pbo: cpcv.pbo, oosSharpeMedian: cpcv.oosSharpeMedian, skipped: cpcv.skipped, skipReason: cpcv.skipReason }, cpcvPromotion })
    return { breadth, eta, cpcv, disclosure }
  }

  // a fixture provider for the recorded joined-loop artifact + CI (free, deterministic — S-FREE). Given ANY goal prompt,
  // it composes an equal-weight lending-carry spec over the available markets (the model's honest, no-authority role).
  export function fixtureProvider(availableMarkets: string[]): StudioAgents.ModelProvider {
    return {
      id: "fixture-analyst",
      live: false,
      async complete() {
        const w = Number((1 / availableMarkets.length).toFixed(6))
        return JSON.stringify({ policy: "carry-tilt", markets: availableMarkets.map((key) => ({ key, weight: w })) })
      },
    }
  }
}
