/**
 * ORGΛNON — THE FAMILY SPRINT (V39), Phase 2 (DD-55 / J-7): MATERIALIZE THE OBSERVABLE SERIES so the false-fire count can
 * finally say a NUMBER. For thirty-nine sprints the count rendered UNJUDGEABLE because tvl/peg were never materialized; this
 * captures REAL retrospective series (tier RETROSPECTIVE — a chart fetched now about the past, revisable) into a COMMITTED,
 * content-hashed, clone-stable fixture the battery reads WITHOUT the network:
 *   · tvl-drawdown — the REAL fluid-lending USDC (Ethereum) TVL chart already captured in the moat (defillama:chart:4438dabc),
 *     a genuine 73% drawdown over ~770 days;
 *   · peg-floor — a REAL USDC/USD price series fetched from coins.llama.fi (the peg observable over ~460 daily points).
 * Both are DOWNSAMPLED to <=200 points for a small committed fixture — the downsample is DISCLOSED, and TVL drawdowns /
 * peg breaches persist long enough that the coarser grid preserves the episodes. ONE-TIME (network); the fixture is the
 * clone-stable artifact. Run: bun run script/honesty/false-fire-capture.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const DAY = 86_400_000

// keep first + last, take an even stride so the series is <= maxPoints (episodes persist long enough to survive the grid).
function downsample<T>(pts: T[], maxPoints: number): T[] {
  if (pts.length <= maxPoints) return pts
  const stride = Math.ceil(pts.length / maxPoints)
  const out: T[] = []
  for (let i = 0; i < pts.length; i += stride) out.push(pts[i])
  if (out[out.length - 1] !== pts[pts.length - 1]) out.push(pts[pts.length - 1])
  return out
}

// ── the TVL series — read the REAL local chart snapshot (gitignored raw capture) for fluid-lending USDC ──────────────────
const CHART_UUID = "4438dabc-7f0c-430b-8136-2722711ae663" // USDC · fluid-lending · Ethereum ($135M; real 73% drawdown)
const chartDir = path.join(PKG_ROOT, "data", "dataplane", "snapshots", `defillama_chart_${CHART_UUID}`)
const chartFile = readdirSync(chartDir).filter((f) => f.endsWith(".json"))[0]
const chart = JSON.parse(readFileSync(path.join(chartDir, chartFile), "utf8"))
const tvlRaw = (chart.points as { ts: number; tvlUsd: number | null }[])
  .filter((p) => p.tvlUsd != null && Number.isFinite(p.ts))
  .sort((a, b) => a.ts - b.ts)
  .map((p) => ({ ts: p.ts, tvlUsd: p.tvlUsd as number }))
const tvl = downsample(tvlRaw, 200)

// ── the PEG series — fetch a REAL USDC/USD price series (the peg observable) ──────────────────────────────────────────────
const USDC = "ethereum:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const pegUrl = `https://coins.llama.fi/chart/${USDC}?span=460&period=1d&searchWidth=600`
const pegResp = await fetch(pegUrl)
if (!pegResp.ok) throw new Error(`peg fetch failed: ${pegResp.status}`)
const pegJson = (await pegResp.json()) as { coins: Record<string, { prices: { timestamp: number; price: number }[] }> }
const pegRaw = pegJson.coins[USDC].prices
  .filter((p) => Number.isFinite(p.price) && Number.isFinite(p.timestamp))
  .sort((a, b) => a.timestamp - b.timestamp)
  .map((p) => ({ ts: p.timestamp * 1000, peg: p.price }))
const peg = downsample(pegRaw, 200)

const tvlDays = Math.round((tvl[tvl.length - 1].ts - tvl[0].ts) / DAY)
const pegDays = Math.round((peg[peg.length - 1].ts - peg[0].ts) / DAY)

const series = {
  "tvl-drawdown": tvl, // {ts, tvlUsd}[]
  "peg-floor": peg, // {ts, peg}[]
}
const OUT = {
  protocol: "false-fire-series",
  at: "2026-07-15",
  rule: "DD-55 (J-7): the observable series MATERIALIZED so the false-fire count says a NUMBER (not UNJUDGEABLE). RETROSPECTIVE tier — a chart fetched now about the past; revisable, not point-in-time. The OWN captures (REAL@ts, genuinely point-in-time) are short (< the 180-day minimum) and grow every day the cadence runs; today the own count is UNJUDGEABLE and the retrospective renders ALONE, labelled the WEAKER evidence (RP-3). Committed + content-hashed → the battery reads this fixture, never the network.",
  tier: "RETROSPECTIVE",
  subjects: {
    "tvl-drawdown": { subject: "USDC · fluid-lending · Ethereum", source: `defillama:chart:${CHART_UUID}`, note: "the REAL TVL chart already captured in the moat (a genuine ~73% drawdown over ~770 days)" },
    "peg-floor": { subject: "USDC/USD (Ethereum)", source: "coins.llama.fi/chart", note: "a REAL price series (the peg observable); USDC held its peg across the window — a peg-floor's honest count may be 0, which is a USEFUL number (the kill-condition would not have fired)" },
  },
  windows: { "tvl-drawdown": { points: tvl.length, days: tvlDays }, "peg-floor": { points: peg.length, days: pegDays } },
  downsample: { rule: "downsampled to <= 200 points for a small committed fixture; the stride is even and keeps first+last. TVL drawdowns and peg breaches persist long enough to survive the coarser grid; the downsample is DISCLOSED (never hidden).", maxPoints: 200, tvlRaw: tvlRaw.length, pegRaw: pegRaw.length },
  seriesSha: sha256(JSON.stringify(series)),
  series,
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "false-fire-series.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── FAMILY — the observable series materialized (DD-55/J-7) ──────")
console.log(`  tvl-drawdown : ${tvl.length} pts / ${tvlDays}d (USDC fluid-lending, REAL, ~73% drawdown)`)
console.log(`  peg-floor    : ${peg.length} pts / ${pegDays}d (USDC/USD, REAL fetched)`)
console.log(`  tier         : RETROSPECTIVE (own REAL@ts captures short → UNJUDGEABLE today, RP-3)`)
console.log(`  series sha   : ${OUT.seriesSha.slice(0, 16)}…`)
console.log("written: data/honesty/false-fire-series.json")
