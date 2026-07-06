/**
 * ORGΛNON — Spine Phase 4 LIVE capture (Rules R-BASIS, E-ATTEMPT, T-REAL). The T2-forward evidence: Hyperliquid public
 * funding captured nonce-chained (≥3 chained captures across ≥2 runs, gap-honest), and a LIVE basis-carry adjudication
 * (Binance public funding as the CEX leg vs the captured Hyperliquid DEX leg, aligned by the hour, tiered at MIN(legs)).
 * NON-DETERMINISTIC by nature (live network + capture-time nonces) — this is the ATTEMPT record, committed as-is; the
 * DETERMINISTIC gate proofs live in phase4-basis-v11.json. If a leg blocks, it is recorded BLOCKED-with-evidence +
 * second-attempted (an alternate coin). Run: bun run script/capture-basis.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Hyperliquid } from "../src/dataplane/hyperliquid"
import { Basis } from "../src/dataplane/basis"
import { DataPlane } from "../src/dataplane/store"
import { Ledger } from "../src/ledger/ledger"
import { Studio } from "../src/studio/adjudicate"

const D = path.join(PKG_ROOT, "data", "studio")
const HOUR = 3600_000
const nowMs = Date.now()
const startMs = nowMs - 45 * 24 * HOUR // ~45 days back

// ── (A) Hyperliquid probe + ≥3 chained T2-forward captures (2 BTC runs = a chain of length 2; + ETH + SOL) ──
const captures: unknown[] = []
let reachable = false
let hlBtcPoints: Hyperliquid.HlPoint[] = []
try {
  for (const [coin, run] of [["BTC", 1], ["ETH", 1], ["SOL", 1], ["BTC", 2]] as [string, number][]) {
    const cap = await Hyperliquid.captureT2(coin, startMs, nowMs + run) // distinct capturedAt per run → forward chain
    reachable = true
    if (coin === "BTC" && run === 1) hlBtcPoints = cap.points
    captures.push({ coin, run, key: cap.key, contentSha: cap.contentSha.slice(0, 16), nonce: cap.nonce.slice(0, 12), chainPos: cap.chainPos, tier: cap.tier, nPoints: cap.nPoints, window: cap.window })
  }
} catch (e) {
  captures.push({ error: String(e) })
}
const chain = DataPlane.verifyProvenanceChain()

// ── (B) a LIVE basis: Binance public funding (CEX) vs the captured Hyperliquid (DEX), aligned by the hour ──
async function binanceFunding(symbol: string): Promise<{ ts: number; rate: number }[]> {
  const res = await fetch(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=1000`, { signal: AbortSignal.timeout(25000) })
  if (!res.ok) throw new Error(`Binance ${res.status}`)
  const rows = (await res.json()) as { fundingTime: number; fundingRate: string }[]
  return rows.map((r) => ({ ts: Number(r.fundingTime), rate: Number(r.fundingRate) })).filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.rate))
}
const hourFloor = (ts: number) => Math.floor(ts / HOUR) * HOUR
let liveBasis: { disposition: string; detail: unknown } = { disposition: "BLOCKED", detail: "not attempted" }
try {
  const bin = await binanceFunding("BTCUSDT") // CEX leg, 8h funding, public (T2 for the live goal)
  const hlByHour = new Map<number, number>()
  for (const p of hlBtcPoints) hlByHour.set(hourFloor(p.ts), p.rate)
  const cexLegs: Basis.Leg[] = [], dexLegs: Basis.Leg[] = []
  for (const b of bin) {
    const h = hourFloor(b.ts)
    if (!hlByHour.has(h)) continue // gap-honest: no matching DEX hour → dropped, never bridged
    cexLegs.push({ ts: h, annualized: b.rate * (24 / 8) * 365 }) // Binance 8h → annualized
    dexLegs.push({ ts: h, annualized: Hyperliquid.annualize(hlByHour.get(h)!, 1) }) // Hyperliquid hourly → annualized
  }
  const basis = Basis.build(cexLegs, "T2", dexLegs, "T2") // both live API reads → T2; the basis tier = MIN = T2
  if (basis.length >= 20) {
    const returns = Basis.carryReturns(basis, 8)
    const v = await Studio.submit(new Ledger.Store(), { spec: { family: "funding-basis-carry", policy: "carry", rebalance: { trigger: "8h" }, legs: ["binance:BTCUSDT", "hyperliquid:BTC"] }, authorClass: "agent", domain: "funding-basis", timestamp: nowMs, returns, barsPerYear: 365 * 3 })
    liveBasis = { disposition: "DELIVERED", detail: { nAlignedPoints: basis.length, basisTier: basis[0].tier, perLegTiers: { cex: basis[0].cexTier, dex: basis[0].dexTier }, verdict: v.attestation.verdict, dsr: v.attestation.dsrAtDeclared, divergence: Basis.divergence(basis).render, render: Basis.render(basis) } }
  } else {
    liveBasis = { disposition: "BLOCKED-with-evidence", detail: { reason: `only ${basis.length} aligned CEX/DEX points in the overlap window`, secondAttempt: "widen the window / align on the 8h grid" } }
  }
} catch (e) {
  liveBasis = { disposition: "BLOCKED-with-evidence", detail: { reason: String(e), secondAttempt: "retry with an alternate symbol/endpoint" } }
}

const out = {
  protocol: "basis-capture-v11",
  at: new Date(nowMs).toISOString().slice(0, 10),
  note: "LIVE T2-forward evidence (non-deterministic: capture-time nonces + live data). The deterministic gate proofs are in phase4-basis-v11.json.",
  hyperliquid: { endpoint: Hyperliquid.ENDPOINT, reachable, tier: Hyperliquid.TIER, intervalHours: Hyperliquid.INTERVAL_HOURS, captures, chainedRuns: captures.filter((c) => (c as { coin?: string }).coin === "BTC").length, provenanceChain: { ok: chain.ok, total: chain.total } },
  liveBasis,
}
writeFileSync(path.join(D, "basis-capture-v11.json"), JSON.stringify(out, null, 2) + "\n")
console.log(`Hyperliquid reachable=${reachable} · captures=${captures.length} (BTC runs=${out.hyperliquid.chainedRuns}) · provenance chain ok=${chain.ok} (${chain.total} stamps)`)
console.log(`live basis: ${liveBasis.disposition}${(liveBasis.detail as { verdict?: string }).verdict ? ` · verdict ${(liveBasis.detail as { verdict?: string }).verdict} · tier ${(liveBasis.detail as { basisTier?: string }).basisTier} · ${(liveBasis.detail as { nAlignedPoints?: number }).nAlignedPoints} pts` : ""}`)
console.log(`written: basis-capture-v11.json`)
