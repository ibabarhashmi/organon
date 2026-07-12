/**
 * ORGΛNON — THE REALITY CHECK (Honesty Layer Phase 4; Rules X-LEAN, X-HONEST). THE SCREEN SET IS THE CONSCIOUS 3 (V1,
 * reconciled once): TWO MASS SCREENS every depositor uses — THE SHELF (Reality Cards — triage) + THE REALITY CHECK (the
 * x-ray of one strategy) — plus THE ASK CONSOLE (the deliberate 3rd screen, D7). The opt-in Stamp is a Pro SUB-ROUTE of
 * the Reality Check (/stamp/:key, lazily imported — a drawer of screen 2, NOT a screen); a FOURTH screen is a Halt.
 * Server-rendered HTML (the repo idiom; PART CLEAN — no Vite/SPA/bundler, no heavy dependency,
 * the cheapest correct thing a stranger can run AND read), with minimal inline JS for the Simple/Pro toggle only. Every
 * value carries a REAL/SAMPLE badge; UNVERIFIED renders as an honest gap; the outcome is a confidence BAND, never a hero
 * APY. The cards + registers render from the deterministic scorecard over the provenance record (REAL where recorded,
 * SAMPLE where absent — clone-robust). No builder, no composition — the user CHECKS, they do not build.
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { Scorecard } from "../analytics/scorecard"
import { Feed } from "../dataplane/feed"
import { DefiLlama } from "../dataplane/providers/defillama"
import { ProvRecord } from "../dataplane/record"
import { DataPlane } from "../dataplane/store"
import { contractCoverage } from "../contract/registry" // the honest REAL-coverage count (a record read; no analyzer on the render path)
import { PlaneDivergence } from "../plane/divergence" // the Pro-side own-plane-vs-rented divergence ROW (X-PLANE d; a ROW, not a screen)
import type { ContractFinding } from "../contract/facts" // TYPE-ONLY — the B5 findings-render groups the recorded facts; no analyzer on the render path
import { Governance } from "../contract/governance" // PRECISION (X-PRECISION) — the pure governance line + the canonical-collapse whitelist; render-layer only, imports NO scored module
import { LlamaYields, CoveragePosture } from "../dataplane/providers/llama-yields" // COVERAGE (X-COVERAGE) — the breadth universe + the any-pool lookup + the license posture
import type { Stamp } from "./stamp" // TYPE-ONLY — the Stamp's runtime (the attest core) is lazily imported by the /stamp route; the mass tool stays Stamp-free (X-OPTIN, PART CLEAN)
import { Lineage } from "./lineage" // the three lineage walls (Lineage sprint; X-LINEAGE) — DataPlane-only (imports NO Stamp runtime), so it stays off the mass path
import { Domain } from "../domain/types" // DOMAIN (X-DOMAIN) — the subject-TYPE classification; render-layer only, imports NO scored module (the catch line renders info/context like the governance line)
import { DomainClassify } from "../domain/classify"
import { YieldSource } from "../domain/axes/yield-source"
import { RedemptionGap } from "../domain/axes/redemption-gap"
import { LeverageDistance } from "../domain/axes/leverage-distance"
import { OffchainOpacity } from "../domain/axes/offchain-opacity"

export namespace Reality {
  // THE SCREEN SET — consciously amended 2→3 (Crown-Jewel D7): the Shelf · the Reality Check · the Ask Console (the
  // Operator-mandated grounded NL front door). A FOURTH screen remains a Halt (PART CLEAN; the screens_frozen wall).
  export const SCREENS = ["shelf", "reality-check", "ask"] as const

  // the shelf registry (poolKey → label + stablecoin symbol), written at capture time — the SnapshotFile points are
  // numeric-only, so the symbol (needed for the peg axis + a human label) lives here. Absent → the record still renders.
  interface RegEntry { name: string; symbol: string; isStablecoin: boolean; kind: "yield" | "delta-neutral"; vertical: Scorecard.Vertical; gtKey?: string; depProtocols?: number }
  function registry(): Map<string, RegEntry> {
    const m = new Map<string, RegEntry>()
    const p = path.join(PKG_ROOT, "data", "honesty", "shelf-registry.json")
    if (!existsSync(p)) return m
    try { const j = JSON.parse(readFileSync(p, "utf8")) as { pools: { poolKey: string; name: string; symbol: string; isStablecoin: boolean; kind?: "yield" | "delta-neutral"; vertical?: Scorecard.Vertical; gtKey?: string; depProtocols?: number }[] }; for (const e of j.pools) m.set(e.poolKey, { name: e.name, symbol: e.symbol, isStablecoin: e.isStablecoin, kind: e.kind ?? "yield", vertical: e.vertical ?? (e.kind === "delta-neutral" ? "delta-neutral" : "lending"), gtKey: e.gtKey, depProtocols: e.depProtocols }) } catch { /* a malformed registry → labels fall back to the key; never a crash */ }
    return m
  }
  function meta(reg: Map<string, RegEntry>, poolKey: string): RegEntry { return reg.get(poolKey) ?? { name: poolKey.replace(/^defillama:pool:|^funding-basis:hyperliquid:/, ""), symbol: "", isStablecoin: false, kind: poolKey.startsWith("funding-basis:") ? "delta-neutral" : "yield", vertical: poolKey.startsWith("funding-basis:") ? "delta-neutral" : "lending" } }

  // ── DOMAIN CLASSIFICATION (X-DOMAIN b) — the engine knows WHAT KIND of thing it is looking at. A pure classify over the
  // captured facts + label; CONSERVATIVE (ambiguous → UNCLASSIFIED). Built from the scorecard facts so any subject (curated
  // or looked-up) classifies identically. `leverageSignal` is present only when a health-factor/LTV read exists (Phase 3). ──
  export function domainOf(name: string, facts: Scorecard.PoolFacts, leverageSignal = false): Domain.Classified {
    const [project, ...rest] = name.split(/[: ]/)
    return DomainClassify.classifyDomain({ project: project ?? name, symbol: rest.join(" ") || name, name, isStablecoin: facts.isStablecoin, vertical: Scorecard.verticalOf(facts), deltaNeutral: facts.deltaNeutral, leverageSignal })
  }
  // the domain LABEL (a label, not a section — X-DOMAIN a). "" for the carried domains + UNCLASSIFIED → the render is
  // BYTE-IDENTICAL to the pre-Domain render (only a NEW domain badges; no curated shelf subject is a new domain).
  function domainLabel(domain?: Domain.DomainType): string {
    return domain && Domain.isNewDomain(domain) ? ` <span class="badge REAL">${esc(domain)}</span>` : ""
  }

  // ── THE CATCH LINE (X-DOMAIN c) — the ONE additional honest line a new domain renders, in the governance line's grammar.
  // INFO/CONTEXT: it renders like the governance line (OUT of the scorecard rows) and states plainly that it does NOT move
  // the verdict. `undefined` → "" → BYTE-IDENTICAL to the pre-Domain render. For RWA it additionally renders the
  // SAMPLE-labeled attestation surface + the structural-cap status (BUILT, NOT INSTALLED — D35, the agent installs no rule). ──
  const CATCH_LABEL: Record<Domain.CatchAxis, string> = { "yield-source": "yield-source attribution", "redemption-gap": "the redemption gap", "leverage-distance": "effective leverage + distance-to-liquidation", "off-chain-opacity": "off-chain opacity" }
  // ── ASSEMBLE THE CATCH for a subject on the LIVE path (the govBlock pattern — loaded out of the render, passed in). Only
  // a NEW domain has a catch. The domain-specific on-chain reads (redemption rate, leverage, funding series) are NOT in the
  // standard scorecard facts, so a general looked-up subject renders INSUFFICIENT honestly (never a faked number); RWA
  // ALWAYS renders its warning (the opacity is told immediately). The backtest (Phase 4) + the unit tests exercise the axes
  // with REAL reads. `undefined` for a carried/UNCLASSIFIED subject → no catch block → byte-identical. ──
  export function catchFor(domain: Domain.DomainType, name: string, scored: Scorecard.Scored): Domain.Catch | undefined {
    if (!Domain.isNewDomain(domain)) return undefined
    const f = scored.facts
    const tier = f.reality === "REAL" ? "REAL-at-timestamp" : "SAMPLE"
    const headlineApy = f.apyBase === null ? null : +(f.apyBase + (f.apyReward ?? 0)).toFixed(2)
    switch (domain) {
      case "STABLE-SYNTH": {
        const fundingSourced = /ethena|\busde\b|susde/i.test(name) // Ethena-class is perp-funding carry; crvUSD/GHO are not
        return YieldSource.yieldSourceCatch({ apyBase: f.apyBase, apyReward: f.apyReward, fundingSourced, fundingRates: [], hasPeg: f.isStablecoin, venues: [], tier })
      }
      case "LST-LRT":
        return RedemptionGap.redemptionGapCatch({ symbol: name, denom: "ETH", redemption: null, secondary: null, queueReadable: false, redemptionTier: tier })
      case "LOOPED-CDP":
        return LeverageDistance.leverageDistanceCatch({ collateral: null, debt: null, liqThreshold: null, headlineApy, tier })
      case "RWA":
        return OffchainOpacity.offchainOpacityCatch({ issuer: "unknown — go verify", auditor: "unknown — go verify", cadence: "unknown", lastAttestation: "unknown", onchainVerdict: scored.verdict })
    }
  }

  function catchBlock(cf?: Domain.Catch): string {
    if (!cf) return ""
    const tierTxt = cf.tier === "SAMPLE" || cf.tier === "INSUFFICIENT" ? cf.tier : `provenance ${cf.tier}`
    const att = cf.attestation ? `<div class="pro muted">attestation surface (<b>SAMPLE — context you must go verify, NOT a verification</b>): issuer ${esc(cf.attestation.issuer)} · auditor ${esc(cf.attestation.auditor)} · cadence ${esc(cf.attestation.cadence)} · last ${esc(cf.attestation.lastAttestation)}.</div>` : ""
    const cap = cf.capStatus ? `<div class="pro muted">structural cap: ${esc(cf.capStatus.installed ? "INSTALLED" : "NOT installed")} — ${esc(cf.capStatus.reason)} (${esc(cf.capStatus.wouldCapUnder)}).</div>` : ""
    return `<div class="axis"><b>the catch — what the seven axes can't see: ${esc(CATCH_LABEL[cf.axis])} (${esc(cf.domain)}, info/context)</b>
<div>${esc(cf.simple)}</div>
<div class="pro muted">${esc(cf.pro)} · ${esc(tierTxt)}</div>${att}${cap}
<div class="muted">this line is <b>info/context</b> — a FACT about the kind of thing this is; it does NOT move the verdict above (X-DOMAIN c; a promotion is the Operator's pen, D36).</div></div>`
  }

  export interface Card { name: string; poolKey: string; kind: "yield" | "delta-neutral"; project: string; symbol: string; chain: string; apyBase: number | null; apyReward: number | null; apyTotal: number | null; verdict: Scorecard.Verdict; risk: string; reality: Scorecard.Reality; scored: Scorecard.Scored }

  const esc = (s: unknown): string => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
  const pct = (x: number | null): string => (x === null ? "—" : `${x.toFixed(2)}%`)

  // ── THE CONTRACT FINDINGS VIEW (Voice B5) — a REAL proxy tier can carry 27/39 findings; a flat list is unusable as a Pro
  // row. Group by category (the structural class), DEDUPE identical details (a proxy repeats "delegatecall" across fns),
  // order by a pinned severity rank, surface the top groups (the topline), and put the full deduped list behind a drawer.
  // Pure + deterministic; a render change on a material:false DETAIL row — the scorecard verdict is byte-untouched (B5). ──
  const CONTRACT_SEVERITY: Record<string, number> = {
    "unprotected-state-changing": 1, "upgrade-proxy-hazard": 2, "reentrancy-value-flow": 3,
    "dangerous-edges": 4, "storage-clash": 5, "oracle-dependency": 6,
  }
  export interface FindingItem { detail: string; contract: string; line?: number; count: number }
  export interface FindingGroup { category: string; rank: number; count: number; items: FindingItem[] }
  export function contractFindingsView(findings: ContractFinding[]): { total: number; groups: FindingGroup[]; topline: string } {
    const byCat = new Map<string, Map<string, FindingItem>>()
    for (const f of findings) {
      if (!byCat.has(f.category)) byCat.set(f.category, new Map())
      const m = byCat.get(f.category)!
      const key = f.detail // dedupe identical structural facts within a category (the same detail repeated across fns/contracts)
      const cur = m.get(key)
      if (cur) cur.count++
      else m.set(key, { detail: f.detail, contract: f.contract, line: f.line, count: 1 })
    }
    const groups: FindingGroup[] = [...byCat.entries()]
      .map(([category, m]) => ({ category, rank: CONTRACT_SEVERITY[category] ?? 9, count: [...m.values()].reduce((a, b) => a + b.count, 0), items: [...m.values()].sort((a, b) => b.count - a.count) }))
      .sort((a, b) => a.rank - b.rank || a.category.localeCompare(b.category))
    return { total: findings.length, groups, topline: groups.map((g) => `${g.count} ${g.category}`).join(" · ") }
  }
  export function riskWord(v: Scorecard.Verdict): string { return v === "SOLID" ? "Low" : v === "CAUTION" ? "Med" : v === "AVOID" ? "High" : "Unknown" }

  // ── the Shelf source: score each RECORDED pool (the moat) — REAL where the payload is present, SAMPLE where absent ──
  export function shelfFromRecord(now: number, adapter: DataPlane.Adapter = DataPlane.snapshotAdapter): Card[] {
    const reg = registry()
    const cards: Card[] = []
    for (const [poolKey, m] of reg) {
      const series = adapter.fetchSeries(poolKey)
      const ts = series ? series.points[series.points.length - 1].ts : now
      if (m.kind === "delta-neutral") {
        cards.push(toCard(m.name, poolKey, Feed.fundingFacts(m.name, poolKey, ts, adapter)))
      } else {
        const pd = m.isStablecoin ? Feed.pegDev(m.symbol, ts, adapter) : null
        cards.push(toCard(m.name, poolKey, Feed.poolFacts({ name: m.name, poolKey, chartKey: poolKey.replace(":pool:", ":chart:"), isStablecoin: m.isStablecoin, vertical: m.vertical, gtKey: m.gtKey, depProtocols: m.depProtocols }, ts, pd, adapter)))
      }
    }
    return cards
  }

  // the SAMPLE fallback (S7): the tool still runs with no network / an empty record — every card SAMPLE → UNVERIFIED.
  export function shelfSample(): Card[] {
    return DefiLlama.SAMPLE_POOLS.map((p) => {
      const facts: Scorecard.PoolFacts = { name: `${p.project} ${p.symbol}`, apyBase: p.apyBase, apyReward: p.apyReward, tvlSlope30d: null, pegDev: null, isStablecoin: p.stablecoin, reality: "SAMPLE", provenanceRef: null }
      return toCard(`${p.project} ${p.symbol}`, `defillama:pool:${p.pool}`, facts)
    })
  }

  function toCard(name: string, poolKey: string, facts: Scorecard.PoolFacts): Card {
    const scored = Scorecard.score(facts)
    const apyTotal = facts.apyBase === null ? null : facts.apyBase + (facts.apyReward ?? 0)
    const [project, ...rest] = name.split(/[: ]/)
    return { name, poolKey, kind: facts.deltaNeutral ? "delta-neutral" : "yield", project, symbol: rest.join(" ") || name, chain: "", apyBase: facts.apyBase, apyReward: facts.apyReward, apyTotal, verdict: scored.verdict, risk: riskWord(scored.verdict), reality: facts.reality, scored }
  }
  // the funding band text for a delta-neutral card/section (from its funding-regime row); "" for a yield pool.
  function fundingBandText(scored: Scorecard.Scored): string {
    const fr = scored.rows.find((r) => r.axis === "funding-regime")
    return fr ? (fr.value === "n/a" ? "— unverified (not enough funding history)" : `annualized ${fr.value}`) : ""
  }

  // ── the REFRESH (explicit; grows the moat): fetch the curated Shelf live + record it. Offline → nothing recorded. ──
  export const CURATED = [
    { project: "aave-v3", symbol: "USDC", chain: "Ethereum" }, { project: "aave-v3", symbol: "USDT", chain: "Ethereum" }, { project: "aave-v3", symbol: "DAI", chain: "Ethereum" },
    { project: "sparklend", symbol: "DAI", chain: "Ethereum" }, { project: "fluid-lending", symbol: "USDC", chain: "Ethereum" }, { project: "compound-v3", symbol: "USDC", chain: "Ethereum" },
  ]
  export async function refresh(now: number, fetchImpl: DefiLlama.FetchImpl = undefined as unknown as DefiLlama.FetchImpl): Promise<{ reality: Scorecard.Reality; recorded: number }> {
    const shelf = fetchImpl ? await DefiLlama.pools(now, fetchImpl) : await DefiLlama.pools(now)
    if (shelf.reality === "SAMPLE") return { reality: "SAMPLE", recorded: 0 }
    let recorded = 0
    for (const want of CURATED) {
      const p = shelf.value.find((x) => x.project === want.project && x.symbol === want.symbol && x.chain === want.chain)
      if (!p) continue
      ProvRecord.recordReal(DefiLlama.poolSnapshot(p, now)); recorded++
      const ch = fetchImpl ? await DefiLlama.chart(p.pool, now, fetchImpl) : await DefiLlama.chart(p.pool, now)
      if (ch.reality === "REAL" && ch.value.length) ProvRecord.recordReal(DefiLlama.chartSnapshot(p.pool, ch.value))
    }
    return { reality: "REAL", recorded }
  }

  // ── the HTML atoms (server-rendered; pure) ── the SINGLE stylesheet is the pinned token-built public/organon.css
  // (Surface sprint; X-SURFACE a,b) — read ONCE (module-cached), inlined server-rendered (the same single-request idiom,
  // no runtime framework, no new dep). Absent → an empty style (degrade-never-crash); it is a committed artifact, present
  // on a fresh clone. The semantic classes (.SOLID/.REAL/.blk.analysis/…) carry their non-color cues from the stylesheet,
  // so this render layer restyles by class alone — the HTML CONTENT is byte-untouched (S36; surface_content_identity).
  let _css: string | null = null
  function stylesheet(): string {
    if (_css !== null) return _css
    const p = path.join(PKG_ROOT, "public", "organon.css")
    _css = existsSync(p) ? readFileSync(p, "utf8") : ""
    return _css
  }

  export function splitBar(apyBase: number | null, apyReward: number | null): string {
    const base = apyBase ?? 0, reward = apyReward ?? 0, total = base + reward
    if (total <= 0) return `<div class="muted">no positive yield to split</div>`
    const b = Math.round((base / total) * 100), r = 100 - b
    return `<div class="bar"><div class="base" style="width:${b}%" title="durable base ${pct(apyBase)}"></div><div class="reward" style="width:${r}%" title="reward emissions ${pct(apyReward)}"></div></div>
<div class="muted">durable base <span class="num">${pct(apyBase)}</span> (${b}%) · reward emissions <span class="num">${pct(apyReward)}</span> (${r}%)</div>`
  }
  export function verdictPill(v: Scorecard.Verdict): string { return `<span class="pill ${v}">${v}</span>` }
  export function realityBadge(r: Scorecard.Reality): string { return `<span class="badge ${r}">${r}</span>` }
  export function confidenceBand(scored: Scorecard.Scored): string {
    const fr = scored.rows.find((r) => r.axis === "funding-regime")
    if (fr) { // delta-neutral — the funding carry BAND, never a hero APY
      if (fr.value === "n/a") return `<div class="muted">outcome: UNVERIFIED — not enough funding history to show a band.</div>`
      return `<div class="band"><span class="muted">funding carry <span class="num">${esc(fr.value)}</span></span><span class="rng"></span></div>
<div class="muted">shown as a band, never a single hero APY — the research shows funding swings widely (roughly −6% to +75% annualized).</div>`
    }
    const apyBase = scored.facts.apyBase, apyTotal = apyBase === null ? null : apyBase + (scored.facts.apyReward ?? 0)
    if (apyBase === null || apyTotal === null) return `<div class="muted">outcome: UNVERIFIED — we can't show a reliable range yet.</div>`
    return `<div class="band"><span class="muted">durable <span class="num">${pct(apyBase)}</span></span><span class="rng"></span><span class="muted">advertised <span class="num">${pct(apyTotal)}</span></span></div>
<div class="muted">shown as a range, never a single hero APY — the durable floor to the reward-inflated headline.</div>`
  }

  // ── SCREEN 1 — THE SHELF ──
  export function renderShelf(cards: Card[], sampleFallback: boolean, filter?: { verdict?: string }): string {
    const shown = filter?.verdict ? cards.filter((c) => c.verdict === filter.verdict) : cards
    const note = sampleFallback ? `<div class="card"><b>SAMPLE mode</b> — no live data recorded yet (offline, or run <code>bun run script/capture-defillama.ts</code>). Every card below is SAMPLE → UNVERIFIED, labeled honestly.</div>` : ""
    const rows = shown.map((c) => `<div class="card srow v-${c.verdict}"><h3><a href="/check/${encodeURIComponent(c.poolKey)}">${esc(c.name)}</a> ${verdictPill(c.verdict)} ${realityBadge(c.reality)}</h3>
${c.kind === "delta-neutral"
      ? `<div class="muted">delta-neutral · funding carry <span class="num">${fundingBandText(c.scored)}</span></div><div class="band"><span class="rng"></span></div><div class="muted">a carry BAND, never a single hero APY.</div>`
      : `<div class="muted">risk: ${c.risk} · headline APY <span class="num">${pct(c.apyTotal)}</span></div>${splitBar(c.apyBase, c.apyReward)}`}</div>`).join("")
    // the honest REAL-coverage count (Build-Provenance V3, X-COVER; Voice B2/B3) — N of M APPLICABLE pools carry a REAL
    // verified-build contract tier; never imply more than was captured. The denominator is standardized to "applicable"
    // (the pools the contract screen applies to — yield/lending, not delta-neutral); BOTH denominators are stated (B2).
    // Computed over the FULL shelf (not the verdict-filtered subset) — coverage is a shelf property, not a filter artifact.
    const applicableCards = cards.filter((c) => c.kind !== "delta-neutral")
    const applicable = applicableCards.length
    const notApplicable = cards.length - applicable
    // W-SO01 (Sovereign PART E — a red-team fix-on-the-go, surfaced by the design critique): the numerator counts REAL
    // tiers AMONG THE SHOWN applicable pools (the intersection with the registry's REAL pool keys), NEVER the GLOBAL
    // registry count — so it can never exceed its denominator. The old code showed contractCoverage().realCount (a global
    // 4) over a 3-pool sample shelf → "4 of 3", an impossible ratio on a trust surface. Now: 0 of 3 on the sample shelf
    // (no sample pool carries a REAL tier — honest), N of M on the live shelf (the real pools that are actually shown).
    const realPoolKeys = new Set(contractCoverage().realPoolKeys)
    const realTier = applicableCards.filter((c) => realPoolKeys.has(c.poolKey)).length
    const coverage = applicable ? `<div class="muted">Contract screen: <b>${realTier} of ${applicable}</b> applicable pools carry a REAL verified-build tier (a deterministic structural screen over verified source — <i>not</i> an audit); the rest are honestly UNVERIFIED. <span class="muted">(${applicable} applicable; ${cards.length} shown incl. ${notApplicable} not-applicable delta-neutral.)</span> <span class="pro">See a strategy's counterparty row for the detail — every REAL tier so far is FLAGGED; the benign direction (a REAL build with zero flags → CLEAN-STRUCTURE) is fixture-proven only, with zero real-world instances yet (B3).</span></div>` : ""
    return page("The Shelf — which yields are real?", `<h1>The Shelf</h1><div class="muted">The strategies that hold DeFi's money — is the yield real, and what's the catch? Open one for its Reality Check.</div>
${coverage}<div class="filters">filter: <a href="/">all</a> <a href="/?verdict=SOLID">SOLID</a> <a href="/?verdict=CAUTION">CAUTION</a> <a href="/?verdict=AVOID">AVOID</a> <a href="/?verdict=UNVERIFIED">UNVERIFIED</a> · <a href="/refresh">↻ refresh (live)</a> · <a href="/ask">💬 Ask ORGΛNON</a></div>
${note}${rows || `<div class="card muted">no pools match this filter.</div>`}${trust(sampleFallback)}`)
  }

  // THE PRO-SIDE DIVERGENCE ROW (X-PLANE d) — where the own-plane and the rented plane disagree on an overlapping value
  // beyond the pinned tolerance, the disagreement is SURFACED as a fact (recorded + shown), NEVER silently resolved toward
  // either source. "" when there is no divergence → the S36 golden screens (no plane data) render byte-identical. A ROW,
  // not a screen. Reuses the design-pass .num (the figures loud) + .axis-tier cue.
  export function divergenceRow(divs: PlaneDivergence.Divergence[]): string {
    if (!divs.length) return ""
    const lines = divs.map((d) => `<div class="muted">${esc(d.key)}: own-plane <span class="num">${esc(String(d.own))}</span> vs rented <span class="num">${esc(String(d.rented))}</span> (Δ ${esc(String(d.deltaPct))}%) — recorded as a fact; neither source silently chosen.</div>`).join("")
    return `<div class="pro axis"><b>own-plane vs rented — divergence</b> <span class="axis-tier caution">!</span>
<div>The sovereign plane and the rented breadth disagree here beyond the pinned tolerance. The disagreement is SURFACED, never silently resolved toward either source (X-PLANE d).</div>${lines}</div>`
  }

  // ── SCREEN 2 — THE REALITY CHECK ──
  export function renderRealityCheck(name: string, scored: Scorecard.Scored, history: ProvRecord.HistoryEntry[], poolKey?: string, divergences: PlaneDivergence.Divergence[] = [], governance: Governance.RenderBundle | null = null, provTier?: string, domain?: Domain.DomainType, catchFact?: Domain.Catch): string {
    const c = scored
    // THE TWO-TIER PROVENANCE LABEL (Coverage; X-COVERAGE c) — beside the stamp, a REAL subject names WHICH KIND of true:
    // REAL★ (block-pinned, chain-reproducible) vs REAL-at-timestamp (aggregator, "what the API said at T"). Rendered ONLY
    // for a REAL subject with a passed tier → the all-SAMPLE S36 golden (no tier) is byte-identical.
    const tierLine = provTier && c.facts.reality === "REAL" ? `<div class="muted">provenance tier: <b>${esc(provTier)}</b> — ${provTier === "REAL★" ? "block-pinned; reproducible against the chain itself" : "an aggregator response — what the API said at that timestamp (re-fetchable, but computed and revisable)"}.</div>` : ""
    const oneLiner = c.summary.replace(/^(SOLID|CAUTION|AVOID|UNVERIFIED)\s*—\s*/, "")
    const axes = c.rows.map((r) => `<div class="axis"><b>${esc(r.name)}</b> <span class="axis-tier ${esc(r.tier)}">${r.tier === "pass" ? "✓" : r.tier === "caution" ? "!" : r.tier === "fail" ? "✗" : "?"}</span>
<div>${esc(r.plainReason)}</div><div class="pro muted">metric ${esc(r.value)} ${esc(r.comparator ?? "")} ${esc(r.threshold ?? "")} → ${r.tier.toUpperCase()}${r.provenanceRef ? ` · provenance ${esc(String(r.provenanceRef).slice(0, 12))}…` : ""}</div></div>`).join("")
    // THE DEEP COUNTERPARTY DETAIL (Contract-Truth Phase 4; X-CONTRACT) — a deterministic structural CONTRACT screen over
    // verified source, BESIDE the coarse age·size·dependency counterparty axis (a yield pool only; the coarse row is the
    // floor). Simple: the tier + an honest one-liner (the depositor gets "unverified" where no build was analyzed, and
    // NEVER the raw findings — E.0). Pro: the "not a full audit" scope label + the specific structural findings. It NEVER
    // says "safe"/"audited"; it is DETAIL, not a verdict-bearing row (the scorecard verdict is unchanged).
    const cs = c.contract
    const csClass = cs.tier === "FLAGGED" ? "FLAGGED" : cs.tier === "CLEAN-STRUCTURE" ? "CLEANSTRUCTURE" : "tier-UNVERIFIED"
    // B5 — the findings-render: severity-grouped + category-deduped, the top groups surfaced (the topline), the full deduped
    // list behind a drawer (a 27/39-finding proxy tier reads as a usable Pro row). B4 — the proxy-surface qualifier carried:
    // a REAL tier scores the deployed verified-source surface (a proxy tier names its proxy contract; implementation-level
    // analysis is parked — W-V03/D10). A material:false DETAIL render — the scorecard verdict is byte-untouched.
    // PRECISION (X-PRECISION) — WHO HOLDS THE KEY leads the contract drawer, and the canonical proxy-shell noise collapses
    // by WHITELIST but ONLY when the admin resolved GATED (SAFE|TIMELOCK) — every finding the canonical match cannot explain
    // SURVIVES itemized (S58). The governance fact renders info/context (D29 parked; the scorecard verdict is byte-untouched).
    // It is loaded OUT of the render and passed in: a call site that passes nothing (the S36 golden's synthetic poolKey) gets
    // NO governance line and NO collapse — so `governance === null` is byte-identical to the pre-Precision render.
    const gov = governance ?? null
    const srcFindings: ContractFinding[] = gov?.impl?.verified && gov.impl.findings.length ? (gov.impl.findings as ContractFinding[]) : cs.findings
    const col = gov ? Governance.collapse(srcFindings, gov.artifact.canonicalMatch, gov.artifact.adminClass) : null
    const shown: ContractFinding[] = col ? (col.survivors as ContractFinding[]) : cs.findings
    const govBlock = gov
      ? `<div><b>Who holds the upgrade key</b> — ${esc(gov.line)}${gov.impl?.verified ? ` <span class="muted">(the findings below describe the resolved implementation ${esc((gov.artifact.implementation ?? "").slice(0, 10))}…, whose metadata-pinned build MATCHES the deployed bytecode)</span>` : gov.artifact.implementation ? ` <span class="muted">(implementation ${esc(gov.artifact.implementation.slice(0, 10))}… resolved; its metadata-pinned build did not match the deployed bytecode here → the proxy-shell surface is screened, never the unverified source)</span>` : ""}</div>` +
        (col?.collapsed
          ? gov.artifact.adminClass === "IMMUTABLE"
            ? `<div class="muted">the proxy machinery is provably INERT — no upgrade path exists (${col.foldedCount} proxy-machinery finding${col.foldedCount === 1 ? "" : "s"} folded BY PROOF, not by optimism); ${col.survivors.length} business finding${col.survivors.length === 1 ? "" : "s"} survive${col.survivors.length === 1 ? "s" : ""} itemized — and ${col.survivors.length === 1 ? "is" : "are"} PERMANENT: no patch can reach an immutable implementation.</div>`
            : `<div class="muted">${col.foldedCount} canonical proxy-shell finding${col.foldedCount === 1 ? "" : "s"} summarized in the governance line above; ${col.survivors.length} finding${col.survivors.length === 1 ? "" : "s"} the canonical pattern cannot explain survive${col.survivors.length === 1 ? "s" : ""} itemized.</div>`
          : `<div class="muted">the upgrade path is not resolved-gated — NOTHING is collapsed; all ${srcFindings.length} structural surface${srcFindings.length === 1 ? "" : "s"} stand (conservative: the collapse folds only a resolved multisig/timelock, never a guess).</div>`)
      : ""
    const fv = shown.length ? contractFindingsView(shown) : null
    const proDetail = fv
      ? ` · <b>${fv.total} structural surface${fv.total > 1 ? "s" : ""}</b> across ${fv.groups.length} categor${fv.groups.length > 1 ? "ies" : "y"}, at the deployed verified-source surface (a proxy tier names its proxy contract; implementation-level analysis parked — W-V03): ${esc(fv.topline)}.<details><summary>the full structural findings (category-grouped, deduped)</summary><ul>${fv.groups.map((g) => `<li><b>${esc(g.category)}</b> (${g.count})<ul>${g.items.map((it) => `<li>${esc(it.detail)}${it.count > 1 ? ` ×${it.count}` : ""} — <span class="muted">${esc(it.contract)}${it.line ? ` L${it.line}` : ""}</span></li>`).join("")}</ul></li>`).join("")}</ul></details>`
      : gov && col?.collapsed
        ? ` · <span class="muted">no finding survives the collapse — every structural surface was canonical proxy-shell plumbing explained by the resolved governance.</span>`
        : ""
    const contractScreen = c.rows.some((r) => r.axis === "counterparty")
      ? `<div class="axis"><b>contract screen — deterministic structural analysis over verified source</b> <span class="pill ${csClass}">${esc(cs.tier)}</span>
${govBlock}<div>${esc(cs.reason)}</div>
<div class="pro muted">${esc(cs.scope)}${proDetail}${cs.contentSha ? ` · contentHash ${esc(cs.contentSha.slice(0, 12))}…` : ""}</div></div>`
      : ""
    const prov = history.length
      ? `<div class="muted prov"><b>Provenance — what was real, and when we captured it</b> (${history.length} capture${history.length > 1 ? "s" : ""}, the moat made visible; a competitor can copy the lens but not this timestamped record):<ul>${history.map((h) => `<li>${new Date(h.asOf).toISOString().slice(0, 16).replace("T", " ")}Z · contentHash ${esc(h.contentHash.slice(0, 12))}… (chain pos ${h.chainPos})</li>`).join("")}</ul></div>`
      : `<div class="muted">provenance: this value is SAMPLE — not in the record (re-capture keyless for a REAL, recorded reading).</div>`
    // THE STAMP DRAWER (opt-in, Pro-only — X-OPTIN). A LINK, never inline: the Stamp is NOT run on this page (it is off
    // the mass path); the user opts in by navigating to /stamp/:key. The two-verdict distinction is stated up front.
    const stampDrawer = poolKey
      ? `<div class="pro"><h2>The overfit Stamp — opt-in, a SEPARATE verdict</h2><div class="muted">The Reality Check above answers "is this yield real, what's the catch?" (SOLID/CAUTION/AVOID/UNVERIFIED). The Stamp answers a DIFFERENT question with the frozen anti-PBO adjudicator — "does this pool's recorded track record survive the overfit deflation?" (GO/NO-GO/INSUFFICIENT). The two verdicts are never conflated — a GO is not "safe", an INSUFFICIENT is not "bad".</div><a href="/stamp/${encodeURIComponent(poolKey)}">▶ Run the overfit Stamp (opt-in)</a></div>`
      : ""
    const askLink = poolKey ? ` · <a href="/ask?${qs({ q: `is ${name} safe?`, pool: poolKey })}">💬 ask about this</a>` : ""
    return page(`Reality Check — ${name}`, `<a href="/">← the Shelf</a>${askLink}
<h1>${esc(name)} ${verdictPill(c.verdict)} ${realityBadge(c.facts.reality)}${domainLabel(domain)}</h1>
<div class="card lead"><b>${esc(oneLiner)}</b></div>${tierLine}
<button class="btn" onclick="document.body.classList.toggle('pro-on')">Simple / Pro</button>
${confidenceBand(c)}
<h2>The honesty scorecard</h2>${axes}${contractScreen}${catchBlock(catchFact)}${divergenceRow(divergences)}
<div class="pro"><h2>Quantitative</h2><pre class="muted">${esc(c.quant)}</pre></div>
${stampDrawer}
${prov}${trust(c.facts.reality === "SAMPLE")}`)
  }

  // ── THE STAMP PANEL (Crown-Jewel Phase 5; X-OPTIN) — a DISTINCT verdict surface, reached only by opting in (/stamp/:key).
  // Pure: takes a resolved StampResult (the runtime is lazily imported by the route). The verdict pill is a DIFFERENT
  // colour/word-space from the scorecard's (never conflated); the two-verdict distinction is stated; "unavailable" is honest.
  export function renderStamp(name: string, poolKey: string, r: Stamp.StampResult, identity: Lineage.SeriesIdentity | null): string {
    // ── THE THREE LINEAGE WALLS (Lineage sprint; X-LINEAGE b,c,d) — applied AT the render, ON TOP of the byte-frozen Stamp. ──
    // WALL 1 (S45) — SAMPLE-never-GO: a GO/NO-GO may render ONLY off a per-subject, REAL, floor-clearing series; else the
    // render DEGRADES the payload (a stale cache / template path can never resurrect a SAMPLE-fed GO — engine honesty is
    // necessary, not sufficient). INSUFFICIENT/UNAVAILABLE pass through (already honest).
    const guarded = Lineage.guardRender(r.verdict, identity)
    const verdict = guarded.verdict
    const vClass = verdict === "GO" ? "GO" : verdict === "NO-GO" ? "NOGO" : verdict === "INSUFFICIENT" ? "INSUFFICIENT" : "UNAVAILABLE"
    // WALL 2 (S46) — the unmissable lineage line (source · REAL/SAMPLE · as-of · N · series-hash prefix) on EVERY render.
    const lineage = `<div class="muted"><b>Lineage — whose data earned this verdict</b> (per-subject, content-hashed — the moat made unmissable): ${esc(Lineage.lineageLine(identity))}</div>`
    // WALL 3 (S47) — the deflation strength in plain words (n=1 = the weakest form — nothing to deflate away); only for a hard verdict.
    const strengthTxt = verdict === "GO" || verdict === "NO-GO" ? Lineage.strengthLine(r.familyN) : ""
    const strength = strengthTxt ? `<div class="muted"><b>Strength — how hard-won</b>: ${esc(strengthTxt)}</div>` : ""
    // RE3 (Moat sprint; X-MOATDEEP d) — the inert-deflation label made UNMISSABLE at the render (a render-layer disclosure,
    // NOT a verdict-path edit — the strengthLine's meaning restated crisply so no user reads sixteen-nines confidence into an
    // UN-deflated DSR). n=1 means the multiple-testing search charge is zero, so the deflation deducted nothing.
    const inert = (verdict === "GO" || verdict === "NO-GO") && r.familyN === 1 && !guarded.degraded
      ? `<div class="muted"><b>The deflation is currently inert</b> — 1 attempt counted, no multiple-testing penalty was paid. The multiple-testing deflation that would harden this verdict activates only once a proposer generates multiple candidate trials (parked); today the pass rests on the single recorded track record alone.</div>`
      : ""
    // D27 CAVEAT (Moat sprint; X-MOATDEEP c) — the i.i.d.-optimism disclosed at the render, beside the significance. The
    // frozen PSR variance (rigor.py) assumes independent observations; DeFi yields are autocorrelated (audit: τ_int ≈ 27–165
    // on real lending yields), so the significance is an optimistic CEILING. A render-layer disclosure (verdict-path frozen);
    // the honest interim while the effective-N-floor AMENDMENT is specified + PARKED pending the Operator's D27 signature.
    const iidCaveat = (verdict === "GO" || verdict === "NO-GO") && !guarded.degraded && r.dsr !== null
      ? `<div class="muted"><b>Read the significance as an optimistic ceiling, not a floor.</b> This deflation assumes each recorded observation is independent; DeFi yields are autocorrelated (they barely move day to day), so the true statistical evidence is weaker than the number suggests. A conservative effective-sample-size correction is specified and pending review.</div>`
      : ""
    // AL3/AL5 (GroundTruth; D31) — the load-bearing significance method cites its PRIMARY sources (the peer-reviewed paper,
    // never a blog), rendered into the Stamp's docs surface beside the significance. A render-layer disclosure; the math is frozen.
    const methodCite = (verdict === "GO" || verdict === "NO-GO") && !guarded.degraded && r.dsr !== null
      ? `<div class="muted"><b>Method — primary sources.</b> Significance: the Deflated Sharpe Ratio (Bailey &amp; López de Prado, <i>The Journal of Portfolio Management</i> 2014; SSRN 2460551). The multiple-testing deflation follows the PBO framework (Bailey, Borwein, López de Prado &amp; Zhu, <i>Journal of Computational Finance</i> 2016; SSRN 2326253). Load-bearing methods cite the paper, never a blog.</div>`
      : ""
    // if WALL 1 degraded the payload, the ORIGINAL reason/basis/depth are void — show the honest degradation + the lineage only.
    const reasonText = guarded.degraded ? guarded.reason : r.reason
    // WALL 3 — the DISPLAYED significance is CAPPED (the raw value stays full-precision in r.dsr + the reproHash).
    const basis = !guarded.degraded && r.available && verdict !== "UNAVAILABLE"
      ? `<div class="muted">observations: ${r.nObs} recorded return points · deflated significance ${esc(Lineage.capSig(r.dsr))} · n counted attempts ${r.familyN}${r.reproHash ? ` · reproHash ${esc(r.reproHash.slice(0, 12))}…` : ""}</div>`
      : ""
    // TRACK-RECORD DEPTH (Persistence; X-DECAY / X-ICIR) — the two opt-in sub-scores shown BESIDE the deflated-Sharpe basis
    // (off the mass path; a reason/basis refinement, never a scorecard verdict). The half-life is serial persistence (NOT
    // the carry); the ICIR is WITHIN-STRATEGY temporal consistency (NOT a cross-sectional factor rank). A clean GO needs both.
    const decayTxt = r.decay ? (r.decay.tier === "INSUFFICIENT" ? "insufficient history" : r.decay.atLeast ? `≥ ${r.decay.floor} periods` : `≈ ${r.decay.halfLife} periods`) : null
    const icirTxt = r.icir ? (r.icir.tier === "INSUFFICIENT" ? "insufficient history" : String(r.icir.icir)) : null
    // THE MinTRL RIDER (Voice; X-DECAY/X-ICIR extended) — on short history the point estimate is SUPPRESSED, not caveated:
    // the drawer states the needed-N explicitly (the number is ABSENT above, not footnoted). On sufficient history, a Pro note.
    const mintrlTxt = guarded.degraded ? "" : r.minTRL && r.minTRL.suppress && r.minTRL.minTRL !== null
      ? `<div class="muted"><b>Minimum Track Record Length:</b> the deflated-Sharpe point estimate is <b>SUPPRESSED</b> — ${r.nObs} recorded observations is below the ${Math.ceil(r.minTRL.minTRL)}-observation minimum this track record's own Sharpe requires; <b>need ${r.minTRL.needMore} more observations</b> before the estimate can be trusted (absent, not caveated).</div>`
      : r.minTRL && r.minTRL.minTRL !== null
        ? `<div class="pro muted">MinTRL: ${r.nObs} observations ≥ the ${Math.ceil(r.minTRL.minTRL)}-observation minimum — the track record clears its Minimum Track Record Length${r.minTRL.trialN ? ` (deflation basis: ${r.minTRL.trialN} evaluation${r.minTRL.trialN === 1 ? "" : "s"})` : ""}.</div>`
        : ""
    const depth = !guarded.degraded && r.available && (r.decay || r.icir)
      ? `<div class="muted"><b>Track-record depth (opt-in):</b> edge half-life ${esc(String(decayTxt))} <span class="pill ${r.decay?.tier === "TRACEABLE" ? "good" : r.decay?.tier === "SHORT_LIVED" ? "warn" : "neutral"}">${esc(String(r.decay?.tier ?? "n/a"))}</span> (serial persistence of the recorded signal — not the carry) · temporal consistency (ICIR) ${esc(String(icirTxt))} <span class="pill ${r.icir?.tier === "CONSISTENT" ? "good" : r.icir?.tier === "LUMPY" ? "warn" : "neutral"}">${esc(String(r.icir?.tier ?? "n/a"))}</span> (within-strategy — NOT a cross-sectional factor rank)${verdict === "GO" ? (r.cleanGo ? " · <b>a CLEAN GO</b> — both depth hurdles cleared" : " · the GO is <b>FENCED</b> — a depth hurdle not cleared (the GO stands on the deflation alone)") : ""}</div>`
      : ""
    // WALL 1 render note — when the render degraded the payload, say so plainly (never a silent swap).
    const degradedNote = guarded.degraded ? `<div class="muted"><b>The render degraded this verdict</b> (SAMPLE-never-GO, at the render boundary — the engine's honesty is not enough, the rendered payload is guarded too).</div>` : ""
    return page(`The Stamp — ${name}`, `<a href="/check/${encodeURIComponent(poolKey)}">← the Reality Check</a>
<h1>The Stamp <span class="pill ${vClass}">${esc(verdict)}</span> <span class="muted">${esc(name)}</span></h1>
<div class="card"><b>The opt-in overfit stress test — a SEPARATE verdict from the Reality Check.</b>
<div class="muted">This is NOT the scorecard's verdict. The Reality Check answers "is this yield real, what's the catch?" (SOLID/CAUTION/AVOID/UNVERIFIED). The Stamp answers "does this pool's recorded track record survive the anti-PBO overfit deflation?" (GO/NO-GO/INSUFFICIENT). A GO is a floor on doubt about the track record's statistical robustness — NOT "safe". An INSUFFICIENT is a forward clock — NOT "bad". The two are never conflated.</div></div>
<div class="card"><div>${esc(reasonText)}</div>${degradedNote}${basis}${iidCaveat}${methodCite}${strength}${inert}${lineage}${mintrlTxt}${depth}</div>
<div class="trust">the frozen, byte-pinned anti-PBO adjudicator — INVOKED, never edited (zero frozen bytes moved) · deflation armed only here · off the mass path · this is not financial advice.</div>`)
  }

  // ── SCREEN 3 — THE ASK CONSOLE (Crown-Jewel Phase 8; X-ASK, D7). The grounded NL front door, Simple/Pro, context-aware,
  // AI-optional. This renderer is DECOUPLED from the ask module (a structural view — the serve route runs the grounded
  // path and hands the result here). Honest states: "AI phrasing off" (no key), "unverified" (engine gap), the raw toggle. ──
  export interface AskView {
    query?: string
    register: "simple" | "pro"
    raw: boolean
    intentKind?: string
    tool?: string
    reality?: string
    text?: string // the rendered answer (deterministic, or AI-phrased if grounded) — the fallback when blocks are absent
    rawFacts?: string // the pure engine fact rows (the Pro raw toggle — byte-reproducible)
    aiPhrased?: boolean
    aiStatus: { keyed: boolean; provider: string | null } // the honest "AI on/off" label — never the key
    contextPool?: string // the current pool passed from a Reality Check ("ask about this")
    // ── THE THREE-TIER ANSWER (Voice X-VOICE b) — a typed FACT/REASONING/BOUNDARY composition; the tier lives in the render
    // (a REASONING block carries a visible ANALYSIS label that survives a screenshot). Structural (no ask-module coupling). ──
    blocks?: { tier: "FACT" | "REASONING" | "BOUNDARY"; text: string; label?: string }[]
    residual?: string // the standing residual disclosure (shown wherever a REASONING block appears — X-VOICE g)
  }
  const STARTERS = [
    { q: "Is aave-v3 USDC safe?", label: "Is this yield real?" },
    { q: "What is the peg of aave USDC?", label: "Check one metric" },
    { q: "aave USDC vs compound USDC", label: "Compare two" },
    { q: "What can you check?", label: "What can you check?" },
  ]
  export function renderAsk(v: AskView): string {
    const reg = v.register === "pro" ? "pro" : "simple"
    const toggle = (r: "simple" | "pro") => `<a href="/ask?${qs({ q: v.query, register: r, pool: v.contextPool })}"${reg === r ? ' class="reg-active"' : ""}>${r === "simple" ? "Simple" : "Pro"}</a>`
    const rawToggle = v.query ? `<a href="/ask?${qs({ q: v.query, register: "pro", raw: v.raw ? "" : "1", pool: v.contextPool })}">${v.raw ? "▾ show the phrased answer" : "▸ raw engine facts (deterministic)"}</a>` : ""
    const aiBadge = v.aiStatus.keyed
      ? `<span class="badge REAL">AI: ${esc(v.aiStatus.provider ?? "")}${v.query ? (v.aiPhrased ? " · phrased" : " · deterministic (ungrounded phrasing rejected)") : ""}</span>`
      : `<span class="badge SAMPLE">AI phrasing off — deterministic mode (set GOOGLE_AI_STUDIO_KEY or any BYOK key)</span>`
    const starters = `<div class="muted">try: ${STARTERS.map((s) => `<a href="/ask?${qs({ q: s.q, register: reg })}">${esc(s.label)}</a>`).join(" · ")}</div>`
    const ctx = v.contextPool ? `<div class="muted">context: answering about the strategy you were viewing (follow-ups like "what about its peg?" resolve to it).</div>` : ""
    const answer = v.query
      ? `<div class="card">
${reg === "pro" ? `<div class="muted">[ intent <b>${esc(v.intentKind ?? "")}</b> → engine tool <b>${esc(v.tool ?? "")}</b>${v.reality && v.reality !== "n/a" ? ` · ${esc(v.reality)}` : ""} ]</div>` : ""}
<div class="mt-sm">${v.raw ? `<pre class="muted">${esc(v.rawFacts ?? "")}</pre>` : renderAnswerBlocks(v)}</div>
${reg === "pro" ? `<div class="muted mt-sm">${rawToggle}</div>` : `<div class="muted mt-sm"><a href="/ask?${qs({ q: v.query, register: "pro", pool: v.contextPool })}">show me the numbers →</a></div>`}
</div>`
      : `<div class="card muted">Ask about any recorded strategy — is the yield real, what's the catch, run the overfit Stamp, compare two, or explain a term. Every number and verdict comes from the deterministic engine — I phrase, I never invent.</div>`
    return page("Ask — ORGΛNON", `<div class="filters"><a href="/">the Shelf</a> · <a href="/ask">Ask</a></div>
<h1>Ask ORGΛNON</h1>
<div class="muted">A grounded front door: ask in your own words; every fact comes from the engine, never a model. ${aiBadge}</div>
<form method="get" action="/ask" class="form">
<input type="text" name="q" value="${esc(v.query ?? "")}" placeholder="Ask about any strategy…" class="field grow">
<input type="hidden" name="register" value="${reg}">
${v.contextPool ? `<input type="hidden" name="pool" value="${esc(v.contextPool)}">` : ""}
<button class="btn primary">Ask</button>
<span class="reg-wrap">register: ${toggle("simple")} / ${toggle("pro")}</span>
</form>
${starters}${ctx}
${answer}
<div class="trust">every answer traces to a deterministic engine fact — the AI only phrases, and a claim the engine didn't produce is rejected · an unverified gap stays unverified · this is not financial advice.</div>`)
  }
  // ── THE THREE-TIER ANSWER RENDER (Voice X-VOICE b,g) — FACT (high-trust) / REASONING (a visible ANALYSIS label that
  // survives a screenshot) / BOUNDARY (the honest edge). The residual disclosure is shown WHEREVER a REASONING block
  // appears (Simple + Pro). PARITY: no key → a single FACT/BOUNDARY block renders the deterministic answer unchanged.
  // Structural — the blocks are plain data (no ask-module coupling); a direct caller with only `text` falls back. ──
  function renderAnswerBlocks(v: AskView): string {
    const blocks = v.blocks
    if (!blocks || !blocks.length) return esc(v.text ?? "").replace(/\n/g, "<br>")
    const parts = blocks.map((b) => {
      const body = esc(b.text).replace(/\n/g, "<br>")
      if (b.tier === "REASONING") return `<div class="blk analysis"><div class="analysis-label">${esc(b.label ?? "ANALYSIS — not an engine fact")}</div><div>${body}</div></div>`
      if (b.tier === "BOUNDARY") return `<div class="blk boundary">${body}</div>`
      return `<div class="blk fact">${body}</div>` // FACT — the high-trust engine tier
    })
    if (blocks.some((b) => b.tier === "REASONING") && v.residual) parts.push(`<div class="muted residual">${esc(v.residual)}</div>`)
    return parts.join("")
  }

  // a tiny query-string builder (drops empty values) — keeps the toggles readable
  function qs(o: Record<string, string | undefined>): string {
    return Object.entries(o).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")
  }

  function trust(sample: boolean): string {
    return `<div class="trust">as of the last capture · source: DeFiLlama (keyless, REAL) ${sample ? "— currently SAMPLE (unverified)" : ""} · this is not financial advice · the verdict is machine-derived from the fact rows, never hand-written.</div>`
  }
  // the persistent identity mark — the ORGΛNON Λ apex on a signal peak, apex-accented cyan. A TEXT-FREE svg (path + node
  // only): contentSig strips tags, so this adds ZERO visible text (S36 byte-identical); the accessible name rides the
  // link's aria-label, which the signature also strips. The one persistent brand anchor across every screen.
  const WORDMARK = `<svg class="mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 20 L12 4 L20 20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="4.6" r="1.9" fill="var(--accent)"/></svg>`
  function page(title: string, body: string): string {
    return `<!doctype html><html lang="en"><head><meta charset="utf8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${stylesheet()}</style></head><body><header class="topbar"><div class="bar-inner"><a class="brand" href="/" aria-label="ORGΛNON — home">${WORDMARK}</a></div></header><main class="wrap">${body}</main></body></html>`
  }

  // resolve one pool's Reality Check from the record (clone-robust). Returns null if the key is unknown (honest 404).
  export function realityCheck(poolKey: string, now: number, adapter: DataPlane.Adapter = DataPlane.snapshotAdapter): { name: string; scored: Scorecard.Scored; history: ProvRecord.HistoryEntry[] } | null {
    const chain = ProvRecord.verify()
    if (!Object.keys(chain.keys).includes(poolKey)) {
      // unknown key — if it's a SAMPLE pool id, x-ray the SAMPLE (honest UNVERIFIED); else null (404)
      const sample = DefiLlama.SAMPLE_POOLS.find((p) => `defillama:pool:${p.pool}` === poolKey)
      if (!sample) return null
      const facts: Scorecard.PoolFacts = { name: `${sample.project} ${sample.symbol}`, apyBase: sample.apyBase, apyReward: sample.apyReward, tvlSlope30d: null, pegDev: null, isStablecoin: sample.stablecoin, reality: "SAMPLE", provenanceRef: null }
      return { name: `${sample.project} ${sample.symbol}`, scored: Scorecard.score(facts), history: [] }
    }
    const m = meta(registry(), poolKey)
    const series = adapter.fetchSeries(poolKey)
    const ts = series ? series.points[series.points.length - 1].ts : now
    const facts = m.kind === "delta-neutral"
      ? Feed.fundingFacts(m.name, poolKey, ts, adapter)
      : Feed.poolFacts({ name: m.name, poolKey, chartKey: poolKey.replace(":pool:", ":chart:"), isStablecoin: m.isStablecoin, vertical: m.vertical, gtKey: m.gtKey, depProtocols: m.depProtocols }, ts, m.isStablecoin ? Feed.pegDev(m.symbol, ts, adapter) : null, adapter)
    return { name: m.name, scored: Scorecard.score(facts), history: ProvRecord.fullHistory(poolKey) }
  }

  // ── THE ANY-POOL LOOKUP (Coverage; X-COVERAGE b) — the cold-start fix. A covered pool NOT in the curated record → the
  // EXISTING per-axis pipeline runs LIVE on whatever genuinely exists (yield-reality from the aggregator, REAL-at-timestamp;
  // tvl-trend from the chart; peg/contract UNVERIFIED — honest thinness). Hostile/absent ids → null (the route renders the
  // refusal). The license posture (X-COVERAGE a): in a SERVED COMMERCIAL context (ORGANON_COMMERCIAL_SERVE=1) under branch γ,
  // DeFiLlama numbers DEGRADE to SAMPLE-labeled; a local reader (the default) sees the real facts. Async — it fetches. ──
  export async function lookup(poolId: string, now: number, fetchImpl?: DefiLlama.FetchImpl, env: Record<string, string | undefined> = process.env): Promise<{ name: string; scored: Scorecard.Scored; history: ProvRecord.HistoryEntry[]; refusal?: string; posture?: string } | null> {
    const v = LlamaYields.validateId(poolId)
    if (!v.ok) return { name: poolId, scored: Scorecard.score({ name: poolId, apyBase: null, apyReward: null, tvlSlope30d: null, pegDev: null, isStablecoin: false, reality: "SAMPLE", provenanceRef: null }), history: [], refusal: v.reason }
    const u = fetchImpl ? await LlamaYields.universe(now, fetchImpl, env) : await LlamaYields.universe(now, undefined, env)
    const p = LlamaYields.find(v.id, u.pools)
    if (!p) return null // an unknown pool id → an honest 404 (never a fabricated pool)
    const ch = fetchImpl ? await DefiLlama.chart(v.id, now, fetchImpl, env) : await DefiLlama.chart(v.id, now, undefined, env)
    // the license posture: a SERVED COMMERCIAL context under γ degrades the DeFiLlama reality to SAMPLE (the honest guard)
    const commercial = env.ORGANON_COMMERCIAL_SERVE === "1"
    const eff = CoveragePosture.effectiveReality(u.reality, commercial, env)
    const facts = LlamaYields.lookupFacts(p, ch.value, eff.reality, now)
    return { name: facts.name, scored: Scorecard.score(facts), history: [], posture: eff.degradedByPosture ? eff.posture : undefined }
  }
}
