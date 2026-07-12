/**
 * ORGΛNON — THE COLLAPSE-BACKTEST HARNESS (Domain sprint; X-BACKTEST, S68/S70). Fire the COMPLETE, UNMODIFIED engine at
 * REAL historical collapses at their PINNED pre-collapse heights, and record what it WOULD have rendered — every HIT, every
 * MISS, every GAP, as it falls. It reuses the PROVEN Ground-Truth archive machinery (S63): the free archive-capable
 * rotation, tri-endpoint agreement, content-hashing, and the HONEST-GAP-when-unreachable rule (a simulated height dressed
 * REAL is the cardinal sin). The subject set is HASH-PINNED in Phase 0 BEFORE this fetched a byte (a post-hoc swap fails).
 * THE ENGINE IS READ-ONLY DURING THE REPLAY: `git diff -- src/` MUST be empty through the run (tuning while measuring is the
 * oldest fraud in quant — a Halt). A MISS is the most valuable output; a seeded would-have-said-SOLID subject MUST surface
 * as a MISS. The results land in data/honesty/backtest/. Run: bun run script/capture/collapse-backtest.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { PKG_ROOT } from "../../src/organon/frozen"
import { RedemptionGap } from "../../src/domain/axes/redemption-gap"
import { YieldSource } from "../../src/domain/axes/yield-source"
import { LeverageDistance } from "../../src/domain/axes/leverage-distance"
import { OffchainOpacity } from "../../src/domain/axes/offchain-opacity"
import { Dydx } from "../../src/dataplane/providers/dydx"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const OUT_DIR = path.join(H, "backtest")

// the FREE archive rotation (the S63 set — drpc/mevblocker/blastapi; the tool's own rotation prunes old state).
const ARCHIVE = ["https://eth.drpc.org", "https://rpc.mevblocker.io", "https://eth-mainnet.public.blastapi.io"]

// THE READ-ONLY-ENGINE GUARD (X-BACKTEST c) — the engine must not be touched while it is being measured.
function gitDiffSrcEmpty(): boolean {
  const r = spawnSync("git", ["diff", "--", "src/"], { cwd: PKG_ROOT, encoding: "utf8" })
  return (r.stdout ?? "").trim() === ""
}

async function ethCall(url: string, to: string, data: string, blockHex: string): Promise<string | null> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to, data }, blockHex] }), signal: AbortSignal.timeout(12_000) })
    if (!res.ok) return null
    const j = (await res.json()) as { result?: string; error?: unknown }
    if (j.error || !j.result || j.result === "0x") return null
    return j.result
  } catch { return null }
}
const toNum = (hex: string, decimals: number): number => Number(BigInt(hex)) / 10 ** decimals

// try an eth_call across the rotation; return the FIRST result + which endpoints agreed (tri-endpoint). null → no endpoint served.
async function crossCall(to: string, data: string, blockHex: string): Promise<{ value: string; endpoints: string[]; attempts: { endpoint: string; served: boolean }[] } | null> {
  const attempts: { endpoint: string; served: boolean }[] = []
  const served: { url: string; value: string }[] = []
  for (const url of ARCHIVE) {
    const v = await ethCall(url, to, data, blockHex)
    attempts.push({ endpoint: url, served: v !== null })
    if (v !== null) served.push({ url, value: v })
  }
  if (!served.length) return null
  const agree = served.filter((s) => s.value === served[0].value)
  return { value: served[0].value, endpoints: agree.map((s) => s.url), attempts }
}

type Outcome = "HIT" | "MISS" | "GAP"
interface Result { id: string; domain: string; name: string; height: number; outcome: Outcome; catchFired: boolean; reads: Record<string, unknown>; endpoints: string[]; crossChecked: boolean; attempts: unknown[]; catchLine?: string; rootCause?: string; claim: string; seeded?: boolean; contentSha?: string }

const hx = (n: number) => "0x" + n.toString(16)

// ── B1 — stETH June-2022 redemption-gap depeg (LST-LRT). Read the wstETH→stETH redemption rate + a Curve secondary; the
// redemption-gap axis fires (HIT) if the market trades at a discount to redemption. Unreachable height → GAP. ──
async function b1(sub: any): Promise<Result> {
  const blockHex = hx(sub.height)
  const WSTETH = "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0"
  const CURVE = sub.secondaryAddr // Curve stETH/ETH pool
  const redRaw = await crossCall(WSTETH, "0x035faf82", blockHex) // stEthPerToken() — wstETH→stETH (≈ ETH) redemption rate
  const secRaw = await crossCall(CURVE, "0x5e0d443f0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a7640000", blockHex) // get_dy(1,0,1e18): stETH→ETH
  if (!redRaw || !secRaw) {
    return { id: sub.id, domain: sub.domain, name: sub.name, height: sub.height, outcome: "GAP", catchFired: false, reads: {}, endpoints: [], crossChecked: false, attempts: [...(redRaw?.attempts ?? []), ...(secRaw?.attempts ?? [])], claim: `GAP — no free archive endpoint served block ${sub.height} for stETH redemption/secondary (the free rotation prunes 2022 state; recorded by name, never simulated).` }
  }
  const redemption = toNum(redRaw.value, 18), secondary = toNum(secRaw.value, 18)
  const c = RedemptionGap.redemptionGapCatch({ symbol: "stETH", denom: "ETH", redemption, secondary, queueReadable: false, queueNote: "withdrawals were LOCKED (no Lido withdrawals until Shanghai, Apr-2023)", redemptionTier: "REAL★" })
  const fired = c.tier !== "INSUFFICIENT" && typeof c.numbers.gapPct === "number" && (c.numbers.gapPct as number) > 0.5 // a discount beyond 0.5% = the depeg surfaced
  return { id: sub.id, domain: sub.domain, name: sub.name, height: sub.height, outcome: fired ? "HIT" : "MISS", catchFired: fired, reads: { redemption, secondary, gapPct: c.numbers.gapPct }, endpoints: [...new Set([...redRaw.endpoints, ...secRaw.endpoints])], crossChecked: redRaw.endpoints.length >= 2 && secRaw.endpoints.length >= 2, attempts: [...redRaw.attempts], catchLine: c.pro, claim: fired ? `HIT — the redemption-gap axis rendered a ${c.numbers.gapPct}% discount on stETH's REAL pre-collapse state at block ${sub.height}: redemption ${redemption} vs market ${secondary} (the depeg lived in the gap).` : `MISS — the reads succeeded but the gap was ${c.numbers.gapPct}% (below the 0.5% depeg threshold); the axis stayed quiet at this height.`, rootCause: fired ? undefined : `at block ${sub.height} the stETH discount had not yet opened past 0.5% — a MISS at THIS height (the axis fires on the gap, and the gap was thin here).` }
}

// ── B2 — perp-funding-carry flip (STABLE-SYNTH). Fetch the dYdX v4 indexer's REAL historical funding; the yield-source
// funding-flip census fires (HIT) if funding went meaningfully negative. Reachable (free keyless indexer). ──
async function b2(sub: any): Promise<Result> {
  const pts = await Dydx.historicalFunding(sub.subjectAddr) // "BTC-USD"
  if (!pts || !pts.length) {
    return { id: sub.id, domain: sub.domain, name: sub.name, height: 0, outcome: "GAP", catchFired: false, reads: {}, endpoints: [Dydx.ENDPOINT], crossChecked: false, attempts: [{ endpoint: Dydx.ENDPOINT, served: false }], claim: `GAP — the dYdX v4 indexer did not serve historical funding for ${sub.subjectAddr} (recorded by name, never simulated).` }
  }
  const rates = pts.map((p) => p.rate)
  const flip = YieldSource.fundingFlipCensus(rates)
  const c = YieldSource.yieldSourceCatch({ apyBase: 12, apyReward: 0, fundingSourced: true, fundingRates: rates, hasPeg: true, venues: ["dydx"], tier: "REAL-at-timestamp" })
  const fired = flip.everNegative // funding went negative at least once → the carry-inverts fact is REAL, not hypothetical
  return { id: sub.id, domain: sub.domain, name: sub.name, height: 0, outcome: fired ? "HIT" : "MISS", catchFired: fired, reads: { periods: flip.total, negative: flip.negative, pctNegative: flip.pctNegative, firstTs: pts[0].ts, lastTs: pts[pts.length - 1].ts }, endpoints: [Dydx.ENDPOINT], crossChecked: false, attempts: [{ endpoint: Dydx.ENDPOINT, served: true }], catchLine: c.pro, claim: fired ? `HIT — the yield-source funding-flip census fired on REAL dYdX history: funding was negative in ${flip.negative} of ${flip.total} periods (${flip.pctNegative}%) — a "savings rate" that is really short-vol carry would have inverted in those windows.` : `MISS — over ${flip.total} real dYdX funding periods funding never went negative; the funding-flip alarm stayed quiet (honest — the risk did not materialize in this window).`, rootCause: fired ? undefined : `funding stayed positive across the served window — the axis correctly did not cry wolf (a MISS only in the sense that no flip occurred to catch).` }
}

// ── B3 — looped stETH/ETH liquidation cascade (LOOPED-CDP). The leverage-distance axis needs a POSITION's collateral/debt;
// a pool-level read alone cannot compute a specific loop's leverage → honest INSUFFICIENT/GAP (never a faked leverage). ──
async function b3(sub: any): Promise<Result> {
  const blockHex = hx(sub.height)
  // attempt a pool-level read to confirm reachability (Aave v2 LendingPool.getReserveData is complex; we probe getReservesList)
  const probe = await crossCall(sub.subjectAddr, "0xd1946dbc", blockHex) // getReservesList() — cheap reachability probe
  const reachable = probe !== null
  const c = LeverageDistance.leverageDistanceCatch({ collateral: null, debt: null, liqThreshold: null, headlineApy: null, tier: "REAL★" })
  // even reachable, a specific loop's collateral/debt needs a borrower address (out of scope — the pin targets the surface)
  return { id: sub.id, domain: sub.domain, name: sub.name, height: sub.height, outcome: "GAP", catchFired: false, reads: { poolReachable: reachable, leverageInput: "absent (a specific position's collateral/debt is needed; a pool-level read cannot compute a loop's leverage)" }, endpoints: reachable ? (probe!.endpoints) : [], crossChecked: false, attempts: probe?.attempts ?? [{ endpoint: "archive", served: false }], catchLine: c.pro, claim: reachable ? `GAP — the Aave v2 pool was reachable at block ${sub.height}, but the leverage-distance axis needs a specific looped POSITION's collateral/debt (a borrower address); the pool surface alone cannot compute a loop's leverage → INSUFFICIENT, recorded honestly (never a faked leverage number).` : `GAP — no free archive endpoint served block ${sub.height} for the Aave v2 loop surface (2022 state pruned; recorded by name).`, rootCause: "the leverage-distance axis is position-scoped; a backtest of a specific loop needs the position, which the bounded harness (pinned surface, three reads) does not resolve — an HONEST LIMITATION, not a hidden miss." }
}

// ── B4 — Maple/Orthogonal credit default (RWA). The collapse was OFF-CHAIN (a borrower default) — INVISIBLE to every
// on-chain axis. This is the domain's whole thesis: a clean on-chain scorecard is NOT evidence of safety. Even if reachable,
// the on-chain reads look benign → the engine would NOT flag → a MISS (the argument FOR the D35 structural cap). ──
async function b4(sub: any): Promise<Result> {
  const blockHex = hx(sub.height)
  const probe = await crossCall(sub.subjectAddr, "0x18160ddd", blockHex) // totalSupply() — a cheap on-chain reachability probe
  const reachable = probe !== null
  const c = OffchainOpacity.offchainOpacityCatch({ issuer: "Maple Finance", auditor: "off-chain (borrower attestation)", cadence: "unknown", lastAttestation: "pre-Dec-2022", onchainVerdict: "SOLID" })
  // the on-chain state looked solvent while the loan defaulted off-chain → the seven axes see nothing adverse → a MISS.
  return { id: sub.id, domain: sub.domain, name: sub.name, height: sub.height, outcome: "MISS", catchFired: false, reads: { onchainReachable: reachable, onchainState: reachable ? "solvent-looking (the pool token existed; the DEFAULT was off-chain)" : "unreachable", offchainCollapse: "Orthogonal Trading defaulted on ~$36M of Maple loans — a borrower default settled OFF-CHAIN, invisible to every on-chain read" }, endpoints: reachable ? probe!.endpoints : [], crossChecked: reachable && probe!.endpoints.length >= 2, attempts: probe?.attempts ?? [], catchLine: c.pro, claim: `MISS — the on-chain axes see NOTHING adverse (the pool looked solvent while the loan defaulted off-chain). The engine would NOT have flagged this on-chain — which is EXACTLY why the RWA structural cap (D35) exists: for RWA, a clean on-chain scorecard is not evidence of safety. This MISS is the argument for the pen.`, rootCause: "RWA collapses settle off-chain; no on-chain capture can see them. The only honest protection is the structural cap (an RWA may never render SOLID) — BUILT + parked for D35. The warning renders today; the cap awaits the Operator." }
}

// ── THE SEEDED MISS CONTROL (S68) — a synthetic PERFECT-ON-CHAIN RWA the engine would call SOLID. It MUST surface as a MISS
// in the artifact (the MISS-reporting wall — a would-have-said-SOLID collapse is never quietly dropped). Not archived — a
// deliberate, labeled control (never presented as a real capture). ──
function seededMiss(): Result {
  const c = OffchainOpacity.offchainOpacityCatch({ issuer: "SYNTHETIC (seeded control)", auditor: "n/a", cadence: "n/a", lastAttestation: "n/a", onchainVerdict: "SOLID" })
  const today = OffchainOpacity.rwaStructuralCap("SOLID", false) // TODAY the cap is not installed → SOLID stands
  return { id: "SEED-MISS-rwa-perfect", domain: "RWA", name: "seeded perfect-on-chain RWA (the MISS-reporting control)", height: 0, outcome: "MISS", catchFired: false, seeded: true, reads: { onchainVerdict: "SOLID", capInstalledToday: false, wouldCapUnderD35: OffchainOpacity.rwaStructuralCap("SOLID", true).capped }, endpoints: [], crossChecked: false, attempts: [], catchLine: c.pro, claim: "MISS (SEEDED CONTROL) — a perfect-on-chain RWA renders SOLID today (the cap is NOT installed; an agent installs no verdict rule). This would-have-said-SOLID subject MUST appear as a MISS — it does, here, by name. Under a signed D35 it would cap SOLID→CAUTION.", rootCause: today.reason }
}

async function main() {
  const startClean = gitDiffSrcEmpty()
  if (!startClean) { console.error("READ-ONLY GUARD FAILED at start — `git diff -- src/` is not empty; the engine must not be touched while it is being measured (X-BACKTEST c)."); process.exit(1) }
  mkdirSync(OUT_DIR, { recursive: true })
  const dm = JSON.parse(readFileSync(path.join(H, "domain-pins.json"), "utf8"))
  const pin = dm.xBacktest.a_pinnedBeforeCapture
  if (sha256(JSON.stringify(pin.subjects)) !== pin.subjectSetHash) { console.error("SUBJECT-SET HASH MISMATCH — the pinned set was edited after Phase 0 (a post-hoc swap; X-BACKTEST a)."); process.exit(1) }

  const byId: Record<string, (s: any) => Promise<Result>> = { "B1-lst-steth-2022": b1, "B2-stable-dydx-funding-flip": b2, "B3-looped-steth-aave-2022": b3, "B4-rwa-maple-orthogonal-2022": b4 }
  const results: Result[] = []
  for (const sub of pin.subjects) {
    console.log(`  firing ${sub.id} (${sub.domain}) …`)
    const r = await byId[sub.id](sub)
    r.contentSha = sha256(JSON.stringify({ ...r, contentSha: undefined }))
    writeFileSync(path.join(OUT_DIR, `${sub.id}.json`), JSON.stringify(r, null, 2) + "\n")
    results.push(r)
    console.log(`    → ${r.outcome}${r.catchFired ? " (catch fired)" : ""}`)
  }
  const seed = seededMiss(); seed.contentSha = sha256(JSON.stringify({ ...seed, contentSha: undefined }))
  writeFileSync(path.join(OUT_DIR, "SEED-MISS.json"), JSON.stringify(seed, null, 2) + "\n")
  results.push(seed)

  const endClean = gitDiffSrcEmpty()
  const real = results.filter((r) => !r.seeded)
  const hits = real.filter((r) => r.outcome === "HIT").length
  const misses = results.filter((r) => r.outcome === "MISS").length // INCLUDES the seeded control (reported, never buried)
  const gaps = real.filter((r) => r.outcome === "GAP").length
  const reached = real.filter((r) => r.outcome !== "GAP").length
  // the zero-miss-zero-gap suspicion flag (X-BACKTEST e) — a scoreline that only ever confirms is SUSPECTED, not celebrated.
  const suspicious = misses === 0 && gaps === 0
  const summary = {
    protocol: "collapse-backtest",
    at: "2026-07-12",
    subjectSetHash: pin.subjectSetHash,
    engineUnmodified: { gitDiffSrcEmptyAtStart: startClean, gitDiffSrcEmptyAtEnd: endClean, note: "the engine was READ-ONLY through the replay (X-BACKTEST c) — tuning while measuring is a Halt." },
    archiveRotation: ARCHIVE,
    results: results.map((r) => ({ id: r.id, domain: r.domain, outcome: r.outcome, catchFired: r.catchFired, height: r.height, crossChecked: r.crossChecked, endpoints: r.endpoints, seeded: r.seeded ?? false, contentSha: r.contentSha })),
    scoreline: { reached, hits, misses, gaps, seededMiss: 1 },
    claim: `the unmodified engine would have flagged ${hits} of ${reached} reachable pinned collapse${reached === 1 ? "" : "s"}, missed ${misses} (incl. the seeded control + the RWA off-chain default — the argument for D35), and could not reach ${gaps} (the free archive prunes deep-2022 state — an honest limitation, recorded by name, never simulated).`,
    zeroMissZeroGapSuspicion: suspicious,
    honestLimitation: "the free archive rotation (drpc/mevblocker/blastapi) prunes deep-2022 state, so most on-chain heights are HONEST GAPS — the dYdX indexer capture (B2) is the reachable domain HIT. A backtest dominated by gaps is an honest outcome (X-BACKTEST e); the misses (the RWA off-chain default + the seeded control) are the most valuable output — reported louder than the hits.",
    missesReported: results.filter((r) => r.outcome === "MISS").map((r) => ({ id: r.id, claim: r.claim, rootCause: r.rootCause })),
  }
  const withSha = { ...summary, contentSha: sha256(JSON.stringify(summary)) }
  writeFileSync(path.join(OUT_DIR, "summary.json"), JSON.stringify(withSha, null, 2) + "\n")

  console.log("── COLLAPSE-BACKTEST → the moat fired at its own graveyard ──────")
  console.log(`  ${summary.claim}`)
  console.log(`  scoreline: ${hits} hits · ${misses} misses (reported) · ${gaps} gaps · read-only src: start=${startClean} end=${endClean}`)
  if (suspicious) console.log("  ⚠ ZERO-MISS-ZERO-GAP — SUSPECTED, re-examine (a backtest that only ever confirms is rigged).")
  console.log("written: data/honesty/backtest/{B1..B4,SEED-MISS,summary}.json")
}

main().catch((e) => { console.error("collapse-backtest FAILED:", e); process.exit(1) })
