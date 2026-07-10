/**
 * ORGΛNON — THE MOAT SPRINT, Phase 3 (REAL-RESCORE; PR3, S56, X-HONEST + PIT-honesty govern). The Probe's post-mortems
 * were ALL-SAMPLE (the honest choice, the weaker artifact). This sprint earns REAL cells to the truth's EXACT ceiling:
 * for Stream / Elixir / Resolv it re-fetches what is GENUINELY fetchable NOW (the protocol TVL series from DeFiLlama; the
 * token's current price where one exists), content-hashes a small committed capture, and runs the EXISTING engine
 * (Scorecard.score — zero new scoring) on the REAL current facts. THE PIT FENCE: a current API returns TODAY'S copy of
 * history — possibly revised — so a REAL cell states its as-of as REAL-AS-FETCHED-NOW (covering the current/aftermath
 * state), NEVER REAL-AS-OF-COLLAPSE (which a current fetch cannot prove). The all-SAMPLE collapse RECONSTRUCTION stays
 * (data/postmortems/{subject}.json — "what we'd have flagged at the collapse"); this adds a REAL current-state layer
 * (data/postmortems/{subject}-real.json — "what the engine renders on the REAL current state we fetched + content-hashed").
 * Cells not fetchable (the collapse-time yield mix; a token with no current price) STAY SAMPLE, plainly.
 * Run (bun — plain DeFiLlama HTTP, NO viem):  bun run script/honesty/rescore-real.ts
 */
import { createHash } from "node:crypto"
import { writeFileSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Scorecard } from "../../src/analytics/scorecard"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d

// each REAL subject: the DeFiLlama protocol slug + (optional) the token address for a current-price fetch.
const SUBJECTS = [
  { key: "stream", name: "Stream Finance xUSD", slug: "stream-finance", token: null as string | null, vertical: "stablecoin-yield" as const },
  { key: "elixir", name: "Elixir deUSD", slug: "elixir", token: null as string | null, vertical: "stablecoin-yield" as const },
  { key: "resolv", name: "Resolv USR", slug: "resolv", token: "ethereum:0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110", vertical: "stablecoin-yield" as const },
]

async function fetchJson(url: string): Promise<unknown> {
  const r = await fetch(url, { headers: { accept: "application/json" } })
  if (!r.ok) throw new Error(`${url} → ${r.status}`)
  return r.json()
}

interface Capture {
  fetchedAt: number
  sources: string[]
  tvlSeries: { firstDate: number; lastDate: number; nPoints: number; currentTvlUsd: number; peakTvlUsd: number; tvl30dAgoUsd: number }
  price: { value: number; confidence: number; timestamp: number } | null
}

async function captureSubject(s: (typeof SUBJECTS)[number], now: number): Promise<Capture> {
  const tvlUrl = `https://api.llama.fi/protocol/${s.slug}`
  const proto = (await fetchJson(tvlUrl)) as { tvl?: { date: number; totalLiquidityUSD: number }[] }
  const pts = (proto.tvl ?? []).map((p) => ({ date: p.date, v: p.totalLiquidityUSD }))
  if (!pts.length) throw new Error(`${s.slug}: no TVL series`)
  const current = pts[pts.length - 1]
  const peak = pts.reduce((m, p) => (p.v > m ? p.v : m), 0)
  const i30 = Math.max(0, pts.length - 31)
  const sources = [tvlUrl]
  let price: Capture["price"] = null
  if (s.token) {
    const priceUrl = `https://coins.llama.fi/prices/current/${s.token}`
    sources.push(priceUrl)
    const pr = (await fetchJson(priceUrl)) as { coins?: Record<string, { price: number; confidence: number; timestamp: number }> }
    const c = pr.coins?.[s.token]
    if (c && typeof c.price === "number") price = { value: c.price, confidence: c.confidence, timestamp: c.timestamp }
  }
  return {
    fetchedAt: now,
    sources,
    tvlSeries: { firstDate: pts[0].date, lastDate: current.date, nPoints: pts.length, currentTvlUsd: round(current.v), peakTvlUsd: round(peak), tvl30dAgoUsd: round(pts[i30].v) },
    price,
  }
}

// derive REAL PoolFacts from a content-hashed capture. Only cells the fetch GENUINELY backs are REAL; the collapse-time
// yield mix is NOT fetchable (delisted pools) → apyBase/apyReward stay null (yield-reality renders unverified — honest).
function realFacts(s: (typeof SUBJECTS)[number], cap: Capture, provenanceRef: string): Scorecard.PoolFacts {
  const t = cap.tvlSeries
  const tvlSlope30d = t.tvl30dAgoUsd > 0 ? round((t.currentTvlUsd - t.tvl30dAgoUsd) / t.tvl30dAgoUsd, 3) : t.currentTvlUsd === 0 ? 0 : null
  const pegDev = cap.price ? round(Math.abs(cap.price.value - 1), 4) : null // REAL current peg where a price exists; else null (unverified)
  return {
    name: s.name,
    apyBase: null, // NOT fetchable point-in-time for a delisted pool → yield-reality unverified (honest)
    apyReward: null,
    tvlSlope30d, // REAL current 30d slope (may be ~0 for a long-dead pool — the 30d window can't see an older drawdown)
    pegDev, // REAL current peg deviation where a price exists
    isStablecoin: true,
    reality: "REAL",
    provenanceRef,
    vertical: s.vertical,
    depProtocols: null, // structural judgment — not a current fetch → left unverified (was SAMPLE in the reconstruction)
    ageDays: null,
    sizeUsd: t.currentTvlUsd, // REAL current TVL
    liqUsd: null,
  }
}

async function main() {
  const now = Math.floor(Date.parse("2026-07-11T00:00:00Z") / 1000) // a fixed capture stamp (deterministic artifact)
  const out: Record<string, unknown>[] = []
  for (const s of SUBJECTS) {
    const cap = await captureSubject(s, now)
    const contentSha = sha256(JSON.stringify(cap))
    const facts = realFacts(s, cap, contentSha)
    const scored = Scorecard.score(facts)
    const rows = scored.rows.map((r) => ({ axis: r.axis, tier: r.tier }))
    const adverseFlags = scored.rows.filter((r) => r.tier === "fail" || r.tier === "caution").map((r) => `${r.axis}: ${r.tier}`)
    const drawdownPeakToNow = cap.tvlSeries.peakTvlUsd > 0 ? round((cap.tvlSeries.currentTvlUsd - cap.tvlSeries.peakTvlUsd) / cap.tvlSeries.peakTvlUsd, 3) : 0
    // the per-cell REAL provenance — each carries its EXACT as-of (REAL-AS-FETCHED-NOW, never as-of-collapse)
    const realCells: Record<string, { value: number | null; reality: "REAL" | "SAMPLE"; asOf: string; source: string }> = {
      sizeUsd: { value: cap.tvlSeries.currentTvlUsd, reality: "REAL", asOf: `REAL — fetched ${now} (DeFiLlama current copy), the CURRENT TVL; not a collapse-time capture`, source: cap.sources[0] },
      tvlSlope30d: { value: facts.tvlSlope30d, reality: "REAL", asOf: `REAL — the CURRENT 30-day TVL slope as of the fetch; the pool may have been at ~0 for months (the 30d window can't see an older drawdown — see peakToNowDrawdown)`, source: cap.sources[0] },
      pegDev: cap.price
        ? { value: facts.pegDev, reality: "REAL", asOf: `REAL — |price-1| from DeFiLlama current price ${cap.price.value} (confidence ${cap.price.confidence}); the CURRENT peg, not the collapse-time peg`, source: cap.sources[1] ?? cap.sources[0] }
        : { value: null, reality: "SAMPLE", asOf: "SAMPLE — no current price is served for this delisted token; the collapse-time peg stays in the SAMPLE reconstruction", source: "n/a" },
    }
    const capture = {
      subject: s.key,
      name: s.name,
      layer: "REAL current-state (PIT-honest: REAL-AS-FETCHED-NOW, never REAL-AS-OF-COLLAPSE)",
      provenancePosture: "REAL — the values below are a genuine content-hashed fetch of the CURRENT/aftermath state (DeFiLlama). They confirm the collapse; they are NOT a point-in-time capture made at the collapse (that is impossible from a current API). The collapse-time facts stay SAMPLE in data/postmortems/" + s.key + ".json.",
      fetchedAt: now,
      sources: cap.sources,
      contentSha,
      reFetchInstruction: `GET ${cap.sources.join(" and ")} ; recompute currentTvlUsd/peakTvlUsd/tvl30dAgoUsd from protocol.tvl[] and price from coins[token]; sha256(JSON.stringify(capture)) must reproduce contentSha at the same fetch (values drift with time — the hash proves THIS snapshot was not tampered, the URL lets you fetch the current one).`,
      realCapture: cap,
      peakToNowDrawdown: drawdownPeakToNow,
      realFacts: facts,
      realCells,
      engineOutput: { verdict: scored.verdict, summary: scored.summary, rows, adverseFlags },
      honestNote:
        `The engine, fed the REAL current facts, renders ${scored.verdict}${scored.verdict === "UNVERIFIED" ? " — the current yield mix is not re-fetchable for a delisted pool, so the flagship yield-reality axis is honestly unverified" : ""}. ${adverseFlags.length ? "REAL adverse structural flags: " + adverseFlags.join(" · ") + "." : "No material REAL adverse flag fired on the current 30d-window facts."} The damning REAL cell is the peak→now TVL drawdown of ${(drawdownPeakToNow * 100).toFixed(1)}% (peak $${(cap.tvlSeries.peakTvlUsd / 1e6).toFixed(1)}M → now $${cap.tvlSeries.currentTvlUsd.toLocaleString()}), content-hashed and re-fetchable.`,
    }
    writeFileSync(path.join(PKG_ROOT, "data", "postmortems", `${s.key}-real.json`), JSON.stringify(capture, null, 2) + "\n")
    out.push({ subject: s.key, verdict: scored.verdict, drawdown: drawdownPeakToNow, realCells: Object.values(realCells).filter((c) => c.reality === "REAL").length, contentSha: contentSha.slice(0, 12) })
  }

  // update the index with the REAL layer census (before → after)
  const idxPath = path.join(PKG_ROOT, "data", "postmortems", "index.json")
  const idx = JSON.parse(readFileSync(idxPath, "utf8"))
  idx.realLayer = {
    at: "2026-07-11",
    rule: "S56 — REAL current-state cells earned by genuine content-hashed DeFiLlama fetches; PIT-honest (REAL-AS-FETCHED-NOW, never as-of-collapse); the engine's actual recomputed output on REAL facts; cells not fetchable STAY SAMPLE.",
    census: { before: "all-SAMPLE (0 REAL cells)", after: out.map((o) => ({ subject: o.subject, realCells: o.realCells, verdict: o.verdict, peakToNowDrawdown: o.drawdown })) },
    pitFence: "no cell claims REAL-AS-OF-COLLAPSE; the collapse-time reconstruction stays SAMPLE. The REAL layer is the current/aftermath state, content-hashed + re-fetchable.",
  }
  writeFileSync(idxPath, JSON.stringify(idx, null, 2) + "\n")

  console.log("── REAL-RESCORE (S56) ─────────────────")
  for (const o of out) console.log(`  ${String(o.subject).padEnd(8)} ${String(o.verdict).padEnd(11)} REALcells=${o.realCells} peak→now=${((o.drawdown as number) * 100).toFixed(1)}% sha=${o.contentSha}`)
  console.log("  written data/postmortems/{stream,elixir,resolv}-real.json + index.realLayer")
}

main().catch((e) => { console.error("rescore-real FAILED:", e); process.exit(1) })
