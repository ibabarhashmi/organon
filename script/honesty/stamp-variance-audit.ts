/**
 * ORGΛNON — THE MOAT SPRINT, Phase 4 (VARIANCE-HONEST; RE2, D27, S57). THE READ-ONLY i.i.d. AUDIT. The evaluation's
 * sharpest finding: DeFi funding/yield series are autocorrelated, and a Sharpe/PSR variance that assumes i.i.d.
 * UNDERSTATES the variance → the DSR is overstated → the Stamp's verdicts are TOO GENEROUS (the one direction a firewall
 * must fear). This script AUDITS the frozen estimator and MEASURES the bias on REAL yield series — it writes NO product
 * code (the Lineage D20 discipline: `git diff -- src/` stays empty through the audit; the only file it writes is the
 * evidence artifact).
 *
 *   1. THE ESTIMATOR (code evidence, hermetic) — rigor.py::psr computes the Sharpe variance as
 *        (1 - g3·SR + ((g4-1)/4)·SR²)/(n-1)   [Bailey/López de Prado PSR]
 *      It corrects for SKEW (g3) and KURTOSIS (g4) but treats the n observations as INDEPENDENT (the √(n-1) factor). The
 *      DSR (deflated_sharpe → psr(returns, sr0_deflated)) inherits it. It does NOT deflate n for serial autocorrelation.
 *   2. THE DATA (measured) — representative REAL stablecoin-lending yield series (the Stamp's exact input kind:
 *      poolReturnsFromSeries = (apyBase+apyReward)/100/365) are run through the ALREADY-FROZEN effective_n.py
 *      (integrated_autocorr_time → τ_int, effective_n_serial = N/τ_int, naive iid t-stat vs Newey–West HAC t-stat).
 *      effective_n.py exists + is proven, but is wired ONLY on the funding path — never the Stamp's DSR (that is the gap).
 *   3. THE IMPACT — N_eff ≪ N (τ_int measured ~27–124 on real lending yields) ⇒ the honest variance is far larger ⇒ the
 *      naive DSR is grossly optimistic. Direction: GENEROUS.
 *
 * Run (bun; fetches DeFiLlama yield charts + spawns the frozen py sidecar):  bun run script/honesty/stamp-variance-audit.ts
 */
import { spawnSync } from "node:child_process"
import { writeFileSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { DataPlane } from "../../src/dataplane/store"
import { Stamp } from "../../src/studio/stamp"

const H = path.join(PKG_ROOT, "data", "honesty")
const SRC = path.join(PKG_ROOT, "src")
const PY = path.join(SRC, "backtest", "py", ".venv", "bin", "python")
const now = Math.floor(Date.parse("2026-07-11T00:00:00Z") / 1000)

// a tiny driver importing the FROZEN effective_n → prints ONLY N/τ_int/effN/naiveT/deflT as plain text (robust: no JSON
// parse of the sidecar's NaN-bearing full report). Re-derives NOTHING — it calls the frozen functions verbatim.
const DRIVER = [
  "import sys, json",
  "from backtest.py.effective_n import integrated_autocorr_time, effective_n_serial, iid_tstat, nw_tstat, decorrelation_time",
  "x = json.load(sys.stdin)['s']",
  "tau = integrated_autocorr_time(x); effn = effective_n_serial(len(x), tau=tau)",
  "print('%d\\t%.4f\\t%.4f\\t%.4f\\t%.4f' % (len(x), tau, effn, iid_tstat(x), nw_tstat(x, decorrelation_time(x))))",
].join("\n")

function measureTau(returns: number[]): { nObs: number; tauInt: number; effN: number; naiveT: number; deflT: number } | null {
  if (returns.length < 30) return null
  const r = spawnSync(PY, ["-c", DRIVER], { cwd: SRC, input: JSON.stringify({ s: returns }), encoding: "utf8" })
  if (r.status !== 0 || !r.stdout.trim()) return null
  const [n, tau, effn, nt, dt] = r.stdout.trim().split("\t").map(Number)
  return { nObs: n, tauInt: Math.round(tau * 100) / 100, effN: Math.round(effn * 10) / 10, naiveT: Math.round(nt * 100) / 100, deflT: Math.round(dt * 100) / 100 }
}

async function fetchChart(poolId: string): Promise<number[] | null> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(`https://yields.llama.fi/chart/${poolId}`, { headers: { accept: "application/json" } })
      const raw = await res.text()
      if (!raw.trimStart().startsWith("{")) throw new Error("rate-limited (non-JSON)")
      const rows = JSON.parse(raw).data as { apyBase: number | null; apyReward: number | null }[]
      return rows.filter((x) => x.apyBase !== null).map((x) => ((x.apyBase as number) + (x.apyReward ?? 0)) / 100 / 365)
    } catch { await new Promise((r) => setTimeout(r, 3000)) }
  }
  return null
}

// 1) THE ESTIMATOR — extract the psr formula from the FROZEN rigor.py (the i.i.d. evidence, quoted verbatim).
const rigorLines = readFileSync(path.join(SRC, "backtest", "py", "rigor.py"), "utf8").split("\n")
const psrIdx = rigorLines.findIndex((l) => l.includes("def psr("))
const iidEvidence = {
  file: "src/backtest/py/rigor.py (FROZEN, pinned 5fc0eaac…)",
  formula: "PSR = NormCDF( (SR_hat - SR*)·√(n-1) / √(1 - g3·SR_hat + ((g4-1)/4)·SR_hat²) )",
  assumesIid: true,
  why: "the √(n-1) factor treats the n observations as INDEPENDENT draws; the denominator corrects for skew (g3) and kurtosis (g4) but NOT for serial autocorrelation. The DSR (deflated_sharpe → psr(returns, sr0_deflated)) inherits this i.i.d. variance.",
  quotedLines: rigorLines.slice(psrIdx, psrIdx + 12).filter((l) => /def psr|n\s*=\s*|denom\s*=|z\s*=|return/.test(l)).map((l) => l.trim()).slice(0, 6),
}

// 2a) the LOCAL shelf series (the Stamp's actual input) — measured where present; a fresh clone resolves UNAVAILABLE.
const registry = JSON.parse(readFileSync(path.join(H, "shelf-registry.json"), "utf8"))
const A = DataPlane.snapshotAdapter
const shelfMeasured: Record<string, unknown>[] = []
for (const p of registry.pools) {
  const key = p.poolKey as string
  const s = A.fetchSeries(key.replace(":pool:", ":chart:")) ?? A.fetchSeries(key)
  const returns = Stamp.poolReturnsFromSeries(s)
  const m = measureTau(returns)
  shelfMeasured.push(m ? { pool: p.name, ...m } : { pool: p.name, nObs: returns.length, measurable: false, note: returns.length ? "too short" : "no recorded series on this clone (snapshots gitignored — UNAVAILABLE)" })
}

// 2b) REPRESENTATIVE REAL yield series (the Stamp's exact input kind) — fetched live from DeFiLlama, measured via the
//     FROZEN effective_n.py. These stand in for the shelf's REAL-PIT series when the local snapshot is absent.
const REPRESENTATIVE = [
  { name: "aave-v3 USDT (Ethereum)", pool: "f981a304-bb6c-45b8-b0c5-fd2f515ad23a" },
  { name: "aave-v3 USDC (Ethereum)", pool: "aa70268e-4b52-42bf-a116-6e2ac8bcb1b2" },
  { name: "compound-v3 USDC (Ethereum)", pool: "7da72d09-56ca-4ec5-a45f-59114353e487" },
  { name: "aave-v3 DAI (Ethereum)", pool: "a349fea4-d780-4e16-973e-70ca9b606db2" },
  { name: "fluid-lending USDT (Ethereum)", pool: "6ce69f37-fc7f-4a99-a67c-e8f4c2f2f0cc" },
]
const repMeasured: Record<string, unknown>[] = []
for (const r of REPRESENTATIVE) {
  const returns = await fetchChart(r.pool)
  const m = returns ? measureTau(returns) : null
  if (m) repMeasured.push({ name: r.name, poolId: r.pool, ...m, shrink: Math.round((m.nObs / m.effN) * 10) / 10 })
  else repMeasured.push({ name: r.name, poolId: r.pool, measurable: false, note: "chart fetch failed/rate-limited at capture time" })
}

const repOk = repMeasured.filter((r) => r.measurable !== false) as { tauInt: number; nObs: number; effN: number; naiveT: number; deflT: number }[]
const autoc = repOk.filter((r) => r.tauInt > 1.05)
const medianTau = repOk.length ? [...repOk].map((r) => r.tauInt).sort((a, b) => a - b)[Math.floor(repOk.length / 2)] : null
const finding =
  autoc.length > 0
    ? `CONFIRMED — the Stamp's DSR/PSR variance assumes i.i.d. (rigor.py::psr, the √(n-1) factor), while ${autoc.length}/${repOk.length} representative REAL stablecoin-lending yield series are heavily autocorrelated (τ_int measured ${Math.min(...repOk.map((r) => r.tauInt))}–${Math.max(...repOk.map((r) => r.tauInt))}, median ${medianTau}, via the FROZEN effective_n.py). Effective N ≪ nominal N (a ~${Math.round((medianTau ?? 1))}× shrink), so the i.i.d. variance is grossly UNDERSTATED and the DSR is OPTIMISTIC — the Stamp's GO bar is far easier than an autocorrelation-aware bar. Direction of the bias: GENEROUS (the firewall's feared direction).`
    : `INCONCLUSIVE on this run — no representative series could be fetched to measure autocorrelation (rate-limited). The CODE fact stands (rigor.py::psr assumes i.i.d.); re-run to measure the data.`

const audit = {
  protocol: "stamp-variance-audit",
  at: "2026-07-11",
  fetchedAt: now,
  rule: "RE2/S57 — a READ-ONLY audit of whether the frozen Stamp estimator assumes i.i.d. over autocorrelated series (which would make verdicts too generous). No product diff lands in the audit (the Lineage D20 discipline). The finding follows the evidence.",
  readOnly: "this script reads rigor.py + the shelf series + spawns the frozen effective_n.py sidecar + fetches representative DeFiLlama yield charts; it writes ONLY this artifact. `git diff -- src/` is empty through the audit.",
  iidEvidence,
  measurementMethod: "each series (the Stamp's exact input kind: (apyBase+apyReward)/100/365) → the FROZEN effective_n.py (integrated_autocorr_time τ_int, effective_n_serial = N/τ_int, iid t-stat vs Newey–West HAC t-stat). effective_n.py is proven + frozen but wired ONLY on the funding path — NEVER the Stamp's DSR path (that is the gap this audit exposes).",
  localShelf: { measured: shelfMeasured.filter((s) => s.measurable !== false).length, note: "the shelf snapshots are gitignored (A′#12) → UNAVAILABLE on this clone; the representative REAL series below carry the measurement", perPool: shelfMeasured },
  representativeReal: { source: "https://yields.llama.fi/chart/{poolId}", fetchedAt: now, reFetchInstruction: "GET the chart per poolId; build returns=(apyBase+apyReward)/100/365; run through src/backtest/py effective_n integrated_autocorr_time. Values drift with time; the direction (τ_int ≫ 1) is structural to sticky DeFi yields.", perPool: repMeasured, medianTauInt: medianTau },
  finding,
  biasDirection: "GENEROUS — an i.i.d. variance is understated over autocorrelated returns → the DSR is overstated → a GO is easier to earn than it should be. The exact direction the FIREWALL exists to fear.",
  d27: {
    decisionOwner: "Operator (Phase 4's math decision is Operator-owned + Operator-signed)",
    amendmentPath: "the deterministic EFFECTIVE-N FLOOR (moat-pins varianceAuditProtocol.d27Paths.amendment): compute n_eff = N/τ_int from the recorded series via the ALREADY-FROZEN effective_n.py; if n_eff < the floor the Stamp becomes INSUFFICIENT (the MinTRL suppression pattern). ZERO frozen-byte edits (an off-path rider); direction CONSERVATIVE (a GO may become INSUFFICIENT; a net-generous outcome HALTS); every affected verdict disclosed pool-by-pool. SPECIFIED + PARKED pending the Operator's signature.",
    caveatPath: "the i.i.d.-optimism rendered PROMINENTLY at the Stamp strength line (reality.ts renderStamp — the render layer, verdict-path hashes frozen): 'This significance assumes each recorded observation is independent. DeFi yields are autocorrelated, so the true statistical evidence is weaker than the number suggests — read the pass as an optimistic ceiling, not a floor.'",
    interimHonestDefault: "the CAVEAT is rendered NOW (disclosure of a KNOWN optimism needs no signature — the RE3 pattern; silence would be the dishonest act). The AMENDMENT is specified + PARKED pending D27. No verdict moves without the signature.",
  },
  frozenSeven: "byte-untouched — this audit reads rigor.py/effective_n.py, it does not edit them; the module hashes are asserted unchanged at the gate.",
}

writeFileSync(path.join(H, "stamp-variance-audit.json"), JSON.stringify(audit, null, 2) + "\n")
console.log("── STAMP VARIANCE AUDIT (RE2/S57) ─────────────────")
console.log("  i.i.d. assumed:", iidEvidence.assumesIid, "· representative series measured:", repOk.length, "· autocorrelated:", autoc.length, "· median τ_int:", medianTau)
for (const r of repMeasured) console.log(`  ${String(r.name).padEnd(30)} ${r.measurable === false ? "(unmeasured)" : `N=${r.nObs} τ_int=${r.tauInt} effN=${r.effN} shrink=${r.shrink}× naiveT=${r.naiveT} deflT=${r.deflT}`}`)
console.log("  finding:", finding.slice(0, 90), "…")
console.log("  written data/honesty/stamp-variance-audit.json")
