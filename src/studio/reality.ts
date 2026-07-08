/**
 * ORGΛNON — THE REALITY CHECK, the two-screen consumer tool (Honesty Layer Phase 4; Rules X-LEAN, X-HONEST). The screen
 * set is FROZEN AT 2 (a third consumer screen is a Halt): THE SHELF (Reality Cards — triage) and THE REALITY CHECK (the
 * x-ray of one strategy). Server-rendered HTML (the repo idiom; PART CLEAN — no Vite/SPA/bundler, no heavy dependency,
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

export namespace Reality {
  // THE SCREEN SET — frozen at 2. A third consumer screen is a Halt (X-LEAN; screens_frozen wall).
  export const SCREENS = ["shelf", "reality-check"] as const

  // the shelf registry (poolKey → label + stablecoin symbol), written at capture time — the SnapshotFile points are
  // numeric-only, so the symbol (needed for the peg axis + a human label) lives here. Absent → the record still renders.
  interface RegEntry { name: string; symbol: string; isStablecoin: boolean; kind: "yield" | "delta-neutral"; vertical: Scorecard.Vertical; gtKey?: string }
  function registry(): Map<string, RegEntry> {
    const m = new Map<string, RegEntry>()
    const p = path.join(PKG_ROOT, "data", "honesty", "shelf-registry.json")
    if (!existsSync(p)) return m
    try { const j = JSON.parse(readFileSync(p, "utf8")) as { pools: { poolKey: string; name: string; symbol: string; isStablecoin: boolean; kind?: "yield" | "delta-neutral"; vertical?: Scorecard.Vertical; gtKey?: string }[] }; for (const e of j.pools) m.set(e.poolKey, { name: e.name, symbol: e.symbol, isStablecoin: e.isStablecoin, kind: e.kind ?? "yield", vertical: e.vertical ?? (e.kind === "delta-neutral" ? "delta-neutral" : "lending"), gtKey: e.gtKey }) } catch { /* a malformed registry → labels fall back to the key; never a crash */ }
    return m
  }
  function meta(reg: Map<string, RegEntry>, poolKey: string): RegEntry { return reg.get(poolKey) ?? { name: poolKey.replace(/^defillama:pool:|^funding-basis:hyperliquid:/, ""), symbol: "", isStablecoin: false, kind: poolKey.startsWith("funding-basis:") ? "delta-neutral" : "yield", vertical: poolKey.startsWith("funding-basis:") ? "delta-neutral" : "lending" } }

  export interface Card { name: string; poolKey: string; kind: "yield" | "delta-neutral"; project: string; symbol: string; chain: string; apyBase: number | null; apyReward: number | null; apyTotal: number | null; verdict: Scorecard.Verdict; risk: string; reality: Scorecard.Reality; scored: Scorecard.Scored }

  const esc = (s: unknown): string => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
  const pct = (x: number | null): string => (x === null ? "—" : `${x.toFixed(2)}%`)
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
        cards.push(toCard(m.name, poolKey, Feed.poolFacts({ name: m.name, poolKey, chartKey: poolKey.replace(":pool:", ":chart:"), isStablecoin: m.isStablecoin, vertical: m.vertical, gtKey: m.gtKey }, ts, pd, adapter)))
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

  // ── the HTML atoms (server-rendered; pure) ──
  const CSS = `body{font:15px/1.5 -apple-system,system-ui,sans-serif;margin:0;background:#0e1116;color:#e6edf3}a{color:#58a6ff;text-decoration:none}.wrap{max-width:900px;margin:0 auto;padding:24px}
.card{background:#161b22;border:1px solid #30363d;border-radius:10px;padding:16px;margin:12px 0}.card h3{margin:0 0 4px}
.pill{display:inline-block;padding:2px 10px;border-radius:999px;font-weight:600;font-size:12px}
.SOLID{background:#1a7f37;color:#fff}.CAUTION{background:#9e6a03;color:#fff}.AVOID{background:#b62324;color:#fff}.UNVERIFIED{background:#484f58;color:#fff}
.badge{font-size:11px;padding:1px 7px;border-radius:6px;border:1px solid #30363d}.REAL{color:#3fb950;border-color:#238636}.SAMPLE{color:#d29922;border-color:#9e6a03}
.bar{display:flex;height:16px;border-radius:6px;overflow:hidden;margin:8px 0;border:1px solid #30363d}.base{background:#238636}.reward{background:#9e6a03}
.band{display:flex;align-items:center;gap:8px;margin:8px 0}.band .rng{flex:1;height:8px;background:linear-gradient(90deg,#238636,#9e6a03);border-radius:4px}
.axis{padding:8px 0;border-top:1px solid #21262d}.pro{display:none}.pro-on .pro{display:block}.muted{color:#8b949e;font-size:13px}
.filters a{margin-right:12px;font-size:13px}.trust{margin-top:24px;padding-top:12px;border-top:1px solid #21262d;color:#8b949e;font-size:12px}`

  export function splitBar(apyBase: number | null, apyReward: number | null): string {
    const base = apyBase ?? 0, reward = apyReward ?? 0, total = base + reward
    if (total <= 0) return `<div class="muted">no positive yield to split</div>`
    const b = Math.round((base / total) * 100), r = 100 - b
    return `<div class="bar"><div class="base" style="width:${b}%" title="durable base ${pct(apyBase)}"></div><div class="reward" style="width:${r}%" title="reward emissions ${pct(apyReward)}"></div></div>
<div class="muted">durable base ${pct(apyBase)} (${b}%) · reward emissions ${pct(apyReward)} (${r}%)</div>`
  }
  export function verdictPill(v: Scorecard.Verdict): string { return `<span class="pill ${v}">${v}</span>` }
  export function realityBadge(r: Scorecard.Reality): string { return `<span class="badge ${r}">${r}</span>` }
  export function confidenceBand(scored: Scorecard.Scored): string {
    const fr = scored.rows.find((r) => r.axis === "funding-regime")
    if (fr) { // delta-neutral — the funding carry BAND, never a hero APY
      if (fr.value === "n/a") return `<div class="muted">outcome: UNVERIFIED — not enough funding history to show a band.</div>`
      return `<div class="band"><span class="muted">funding carry ${esc(fr.value)}</span><span class="rng"></span></div>
<div class="muted">shown as a band, never a single hero APY — the research shows funding swings widely (roughly −6% to +75% annualized).</div>`
    }
    const apyBase = scored.facts.apyBase, apyTotal = apyBase === null ? null : apyBase + (scored.facts.apyReward ?? 0)
    if (apyBase === null || apyTotal === null) return `<div class="muted">outcome: UNVERIFIED — we can't show a reliable range yet.</div>`
    return `<div class="band"><span class="muted">durable ${pct(apyBase)}</span><span class="rng"></span><span class="muted">advertised ${pct(apyTotal)}</span></div>
<div class="muted">shown as a range, never a single hero APY — the durable floor to the reward-inflated headline.</div>`
  }

  // ── SCREEN 1 — THE SHELF ──
  export function renderShelf(cards: Card[], sampleFallback: boolean, filter?: { verdict?: string }): string {
    const shown = filter?.verdict ? cards.filter((c) => c.verdict === filter.verdict) : cards
    const note = sampleFallback ? `<div class="card"><b>SAMPLE mode</b> — no live data recorded yet (offline, or run <code>bun run script/capture-defillama.ts</code>). Every card below is SAMPLE → UNVERIFIED, labeled honestly.</div>` : ""
    const rows = shown.map((c) => `<div class="card"><h3><a href="/check/${encodeURIComponent(c.poolKey)}">${esc(c.name)}</a> ${verdictPill(c.verdict)} ${realityBadge(c.reality)}</h3>
${c.kind === "delta-neutral"
      ? `<div class="muted">delta-neutral · funding carry ${fundingBandText(c.scored)}</div><div class="band"><span class="rng"></span></div><div class="muted">a carry BAND, never a single hero APY.</div>`
      : `<div class="muted">risk: ${c.risk} · headline APY ${pct(c.apyTotal)}</div>${splitBar(c.apyBase, c.apyReward)}`}</div>`).join("")
    return page("The Shelf — which yields are real?", `<h1>The Shelf</h1><div class="muted">The strategies that hold DeFi's money — is the yield real, and what's the catch? Open one for its Reality Check.</div>
<div class="filters">filter: <a href="/">all</a> <a href="/?verdict=SOLID">SOLID</a> <a href="/?verdict=CAUTION">CAUTION</a> <a href="/?verdict=AVOID">AVOID</a> <a href="/?verdict=UNVERIFIED">UNVERIFIED</a> · <a href="/refresh">↻ refresh (live)</a></div>
${note}${rows || `<div class="card muted">no pools match this filter.</div>`}${trust(sampleFallback)}`)
  }

  // ── SCREEN 2 — THE REALITY CHECK ──
  export function renderRealityCheck(name: string, scored: Scorecard.Scored, history: ProvRecord.HistoryEntry[]): string {
    const c = scored
    const oneLiner = c.summary.replace(/^(SOLID|CAUTION|AVOID|UNVERIFIED)\s*—\s*/, "")
    const axes = c.rows.map((r) => `<div class="axis"><b>${esc(r.name)}</b> ${r.tier === "pass" ? "✓" : r.tier === "caution" ? "!" : r.tier === "fail" ? "✗" : "?"}
<div>${esc(r.plainReason)}</div><div class="pro muted">metric ${esc(r.value)} ${esc(r.comparator ?? "")} ${esc(r.threshold ?? "")} → ${r.tier.toUpperCase()}${r.provenanceRef ? ` · provenance ${esc(String(r.provenanceRef).slice(0, 12))}…` : ""}</div></div>`).join("")
    const prov = history.length
      ? `<div class="muted"><b>Provenance — what was real, and when we captured it</b> (${history.length} capture${history.length > 1 ? "s" : ""}, the moat made visible; a competitor can copy the lens but not this timestamped record):<ul>${history.map((h) => `<li>${new Date(h.asOf).toISOString().slice(0, 16).replace("T", " ")}Z · contentHash ${esc(h.contentHash.slice(0, 12))}… (chain pos ${h.chainPos})</li>`).join("")}</ul></div>`
      : `<div class="muted">provenance: this value is SAMPLE — not in the record (re-capture keyless for a REAL, recorded reading).</div>`
    return page(`Reality Check — ${name}`, `<a href="/">← the Shelf</a>
<h1>${esc(name)} ${verdictPill(c.verdict)} ${realityBadge(c.facts.reality)}</h1>
<div class="card"><b>${esc(oneLiner)}</b></div>
<button onclick="document.body.classList.toggle('pro-on')">Simple / Pro</button>
${confidenceBand(c)}
<h3>The honesty scorecard</h3>${axes}
<div class="pro"><h3>Quantitative</h3><pre class="muted">${esc(c.quant)}</pre></div>
${prov}${trust(c.facts.reality === "SAMPLE")}`)
  }

  function trust(sample: boolean): string {
    return `<div class="trust">as of the last capture · source: DeFiLlama (keyless, REAL) ${sample ? "— currently SAMPLE (unverified)" : ""} · this is not financial advice · the verdict is machine-derived from the fact rows, never hand-written.</div>`
  }
  function page(title: string, body: string): string {
    return `<!doctype html><html><head><meta charset="utf8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${CSS}</style></head><body><div class="wrap">${body}</div></body></html>`
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
      : Feed.poolFacts({ name: m.name, poolKey, chartKey: poolKey.replace(":pool:", ":chart:"), isStablecoin: m.isStablecoin, vertical: m.vertical, gtKey: m.gtKey }, ts, m.isStablecoin ? Feed.pegDev(m.symbol, ts, adapter) : null, adapter)
    return { name: m.name, scored: Scorecard.score(facts), history: ProvRecord.fullHistory(poolKey) }
  }
}
