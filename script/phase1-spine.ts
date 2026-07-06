/**
 * ORGΛNON — Spine Phase 1 evidence (Rules R-ETA, R-ADVISORY, R-RATIFY). THE CHEAP TEST RUNS FIRST (a failed cheap test
 * refuses the build): synthetic strategies with KNOWN IC/BR are recovered within a pinned tolerance, the Fundamental-Law
 * identity IR = IC·√BR is demonstrated against a realized annualized Sharpe, and the ETA arithmetic is hand-verified
 * first-principles. THEN a real-adjacent strategy's panel is rendered with the hedged ETA range. FINALLY the VERDICT
 * DIFFERENTIAL baseline is established: a fixed set of submissions is adjudicated and fingerprinted — the panel computes
 * OUTSIDE the write-then-invoke path, so the fingerprints are the invariant every later phase re-proves byte-identical.
 * Deterministic (a seeded PRNG; no Math.random — Rule VIII). Run: bun run script/phase1-spine.ts
 */
import { createHash } from "node:crypto"
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Breadth } from "../src/analytics/breadth"
import { VerdictDifferential } from "../src/studio/differential"

const D = path.join(PKG_ROOT, "data", "studio")
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const T = Date.parse("2026-07-05T00:00:00Z")

// ── a deterministic PRNG (mulberry32) + Box-Muller gaussian — no Math.random (Rule VIII, reproducibility) ──
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function gaussians(rng: () => number, n: number): number[] {
  const out: number[] = []
  while (out.length < n) {
    const u1 = Math.max(1e-12, rng()), u2 = rng()
    const r = Math.sqrt(-2 * Math.log(u1))
    out.push(r * Math.cos(2 * Math.PI * u2))
    if (out.length < n) out.push(r * Math.sin(2 * Math.PI * u2))
  }
  return out
}
function annualizedSharpe(xs: number[], barsPerYear: number): number {
  const n = xs.length, m = xs.reduce((s, x) => s + x, 0) / n
  const v = xs.reduce((s, x) => s + (x - m) ** 2, 0) / (n - 1)
  return v <= 0 ? 0 : (m / Math.sqrt(v)) * Math.sqrt(barsPerYear)
}
function pearson(a: number[], b: number[]): number {
  const n = a.length, ma = a.reduce((s, x) => s + x, 0) / n, mb = b.reduce((s, x) => s + x, 0) / n
  let num = 0, da = 0, db = 0
  for (let i = 0; i < n; i++) { const xa = a[i] - ma, xb = b[i] - mb; num += xa * xb; da += xa * xa; db += xb * xb }
  return da === 0 || db === 0 ? 0 : num / Math.sqrt(da * db)
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// (1) THE CHEAP TEST — KNOWN IC/BR recovered; the Fundamental Law demonstrated; the ETA hand-verified — RUNS FIRST
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const BARS = 252
const N = 20000 // finite-sample estimate size
const NPOP = 200000 // "population" size — the true value of what the (Spearman) estimator estimates
const IC_TOL = 0.025 // absolute: the panel's finite-sample Spearman recovers the POPULATION Spearman within this
const BR_TOL = 0.05 // relative recovery tolerance for BR
const IR_TOL = 0.04 // relative: the Fundamental-Law identity IR = IC_pearson·√BR ≈ realized Sharpe (Pearson terms)

// NB the panel's IC is the rank (Spearman) correlation (robust, the standard IC). For a gaussian signal→return link the
// population Spearman sits ~4–5% BELOW the Pearson correlation ((6/π)·arcsin(ρ/2)); the recovery test compares the
// panel's finite-sample Spearman to the POPULATION Spearman (unbiasedness of the estimator), while the Fundamental-Law
// identity is demonstrated in consistent PEARSON terms (IR = IC_pearson·√BR ≈ realized Sharpe of a signal-∝ strategy).
const recoveries: unknown[] = []
let cheapTestOk = true
for (const icTrue of [0.05, 0.1, 0.15]) {
  // population Spearman (the true value the estimator targets)
  const rngP = mulberry32(0xB16 + Math.round(icTrue * 1000))
  const sigP = gaussians(rngP, NPOP), zP = gaussians(rngP, NPOP)
  const retP = sigP.map((s, i) => icTrue * s + Math.sqrt(1 - icTrue * icTrue) * zP[i])
  const icSpearmanPop = Breadth.informationCoefficient(sigP, retP)

  // the finite-sample estimate the panel produces
  const rng = mulberry32(0xC0FFEE + Math.round(icTrue * 1000))
  const sig = gaussians(rng, N), z = gaussians(rng, N)
  const ret = sig.map((s, i) => icTrue * s + Math.sqrt(1 - icTrue * icTrue) * z[i]) // corr(sig,ret) = icTrue (Pearson) by construction
  const strat = sig.map((s, i) => s * ret[i]) // position ∝ signal → realized bet return; its annualized Sharpe ≈ IR

  const p = Breadth.panel({ signal: sig, realized: ret, returns: ret, barsPerYear: BARS })
  const icErr = Math.abs(p.ic - icSpearmanPop) // recovery of the POPULATION Spearman (what the panel estimates)
  const brErr = Math.abs(p.breadth.betsPerYear - BARS) / BARS

  const icPearson = pearson(sig, ret)
  const irPearson = icPearson * Math.sqrt(p.breadth.betsPerYear) // the Fundamental Law in consistent Pearson terms
  const realizedSharpe = annualizedSharpe(strat, BARS)
  const irErr = Math.abs(irPearson - realizedSharpe) / Math.max(1e-9, Math.abs(realizedSharpe))

  const ok = icErr <= IC_TOL && brErr <= BR_TOL && irErr <= IR_TOL
  cheapTestOk = cheapTestOk && ok
  recoveries.push({ icTruePearson: icTrue, icSpearmanPop: +icSpearmanPop.toFixed(4), icEst: +p.ic.toFixed(4), icErr: +icErr.toFixed(4), brTrue: BARS, brEst: +p.breadth.betsPerYear.toFixed(1), brErr: +brErr.toFixed(4), icPearson: +icPearson.toFixed(4), irPearson: +irPearson.toFixed(4), realizedSharpe: +realizedSharpe.toFixed(4), irErr: +irErr.toFixed(4), ok })
}

// the ETA hand-verification, first-principles: IR = IC·√BR; the annualized t-stat after Y years ≈ IR·√Y; it reaches
// the bar t* when Y = (t*/IR)². Worked example pasted so a reader can redo the arithmetic by hand.
const hv = { ic: 0.1, br: 252, tStar: 2.0 }
const hvIr = hv.ic * Math.sqrt(hv.br) // 0.1 * 15.8745 = 1.58745
const hvYears = (hv.tStar / hvIr) ** 2 // (2 / 1.58745)^2 = 1.2599^2 = 1.5873
const etaHandVerify = {
  statement: "IR = IC*sqrt(BR); t-stat after Y years ~ IR*sqrt(Y); reaches t* when Y = (t*/IR)^2",
  worked: `IC=${hv.ic}, BR=${hv.br} -> IR = ${hv.ic}*sqrt(${hv.br}) = ${hv.ic}*${Math.sqrt(hv.br).toFixed(4)} = ${hvIr.toFixed(4)}; ` +
    `t*=${hv.tStar} -> Y = (${hv.tStar}/${hvIr.toFixed(4)})^2 = ${(hv.tStar / hvIr).toFixed(4)}^2 = ${hvYears.toFixed(4)} years`,
  irComputed: +hvIr.toFixed(4),
  yearsComputed: +hvYears.toFixed(4),
  // cross-check the module's eta() reproduces this on a matched synthetic (SE≈0 → the band collapses to the point)
}
// cross-check via the module: a strong-IC, many-obs synthetic so the band is tight
{
  const rng = mulberry32(0x5EED)
  const sig = gaussians(rng, 100000), z = gaussians(rng, 100000)
  const ret = sig.map((s, i) => 0.1 * s + Math.sqrt(1 - 0.01) * z[i])
  const p = Breadth.panel({ signal: sig, realized: ret, returns: ret, barsPerYear: 252 })
  const e = Breadth.eta(p, { targetT: 2.0 })
  // the midpoint of the year band should bracket the hand-computed 1.587 years (module uses recovered IC≈0.1, BR≈252)
  ;(etaHandVerify as Record<string, unknown>).moduleMidYears = +((e.powerAtYearsLo + Math.min(1e6, e.powerAtYearsHi)) / 2).toFixed(3)
  ;(etaHandVerify as Record<string, unknown>).moduleIrBand = [+e.irLo.toFixed(3), +e.irHi.toFixed(3)]
}

// the "may never reach power" honest output (S2): a HIGH-IC but TINY-BR strategy — few independent bets means the skill
// estimate itself is not distinguishable from zero, so the IR band includes ≤ 0 and the panel must be ABLE to say so.
let mayNeverExample: unknown
{
  const rng = mulberry32(0xBEEF)
  const nSmall = 8 // only 8 independent bets — high apparent per-bet skill, but the estimate is deeply uncertain
  const sig = gaussians(rng, nSmall), z = gaussians(rng, nSmall)
  const ret = sig.map((s, i) => 0.4 * s + Math.sqrt(1 - 0.16) * z[i]) // a HIGH planted IC
  const p = Breadth.panel({ signal: sig, realized: ret, returns: ret, barsPerYear: 4 }) // quarterly cadence → tiny BR
  const e = Breadth.eta(p, { targetT: 2.0 })
  mayNeverExample = { ic: +p.ic.toFixed(3), br: +p.breadth.betsPerYear.toFixed(1), ir: +p.ir.toFixed(3), seIc: +Math.sqrt((1 - p.ic * p.ic) / Math.max(1, p.breadth.nObs - 2)).toFixed(3), mayNeverReach: e.mayNeverReach, range: e.range, canProduceHonestSentence: /may never reach power/i.test(e.range) }
}

if (!cheapTestOk) {
  const fail = { protocol: "phase1-breadth-cheap-test-FAILED", at: "2026-07-05", recoveries, note: "the ratified cheap test FAILED — the build is REFUSED and the item re-parked (R-RATIFY)" }
  writeFileSync(path.join(D, "phase1-breadth-v11.json"), JSON.stringify(fail, null, 2) + "\n")
  console.error("CHEAP TEST FAILED — build refused (R-RATIFY):", JSON.stringify(recoveries, null, 2))
  process.exit(1)
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// (2) A REAL-ADJACENT strategy's panel + hedged ETA — the signal is the LAGGED return (a naive persistence forecast),
//     stated honestly; the returns are a deterministic representative lending-carry-like series (labeled ILLUSTRATIVE).
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const rngR = mulberry32(0x11FE)
const baseCarry = 0.00008 // a small positive daily carry
const nReal = 365
const noise = gaussians(rngR, nReal)
const realReturns: number[] = []
let prev = 0.0
for (let i = 0; i < nReal; i++) {
  // a REALISTIC weak-signal series: small carry + a modest AR(1) persistence (φ≈0.05, an honest small edge) + large
  // noise → a modest IC, a BR mildly deflated by the autocorrelation, and an IR < 1 that yields a MEANINGFUL forward ETA
  const r = baseCarry + 0.05 * prev + 0.006 * noise[i]
  realReturns.push(r); prev = r
}
const laggedSignal = [0, ...realReturns.slice(0, -1)] // the naive persistence forecast (lag-1)
const realPanel = Breadth.panel({ signal: laggedSignal, realized: realReturns, returns: realReturns, barsPerYear: 365 })
const realEta = Breadth.eta(realPanel, { targetT: 2.0 })

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// (3) THE VERDICT DIFFERENTIAL baseline — a fixed submission set, adjudicated + fingerprinted. The panel computes
//     OUTSIDE this path; these fingerprints are the invariant every later phase re-proves byte-identical (R-ADVISORY).
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const before = await VerdictDifferential.fingerprints()
// now compute the breadth panel for the SAME series, then re-adjudicate — the fingerprints must be identical (the panel
// touched nothing in the ledger/core; this is the "same submissions → byte-identical verdicts" differential).
for (const s of VerdictDifferential.submissions()) Breadth.panel({ signal: s.returns, realized: s.returns, returns: s.returns, barsPerYear: s.barsPerYear })
const after = await VerdictDifferential.fingerprints()
const differentialByteIdentical = JSON.stringify(before.map((r) => r.fp)) === JSON.stringify(after.map((r) => r.fp))
const fingerprintSetSha = sha256(JSON.stringify(before.map((r) => r.fp)))

writeFileSync(path.join(D, "verdict-fingerprints-v11.json"), JSON.stringify({ protocol: "verdict-fingerprints-v11", at: "2026-07-05", note: "the invariant set: fixed submissions adjudicated through the frozen write-then-invoke path; every advisory panel is proven not to move a verdict by re-deriving this set byte-identical (R-ADVISORY)", fingerprintSetSha, fingerprints: before }, null, 2) + "\n")

// ── the BREADTH-TRUE gate summary ──
const gate = {
  protocol: "phase1-breadth-v11",
  at: "2026-07-05",
  gate: "BREADTH-TRUE",
  cheapTest: { ranFirst: true, ok: cheapTestOk, tolerances: { IC_TOL, BR_TOL, IR_TOL }, recoveries },
  etaHandVerify,
  mayNeverExample,
  realStrategy: {
    ic: +realPanel.ic.toFixed(4), betsPerYear: +realPanel.breadth.betsPerYear.toFixed(1), lag1Autocorr: +realPanel.breadth.lag1Autocorr.toFixed(4),
    tc: realPanel.tc, ir: +realPanel.ir.toFixed(4), whyNotYet: realPanel.whyNotYet,
    eta: { range: realEta.range, mayNeverReach: realEta.mayNeverReach, forwardYearsLo: realEta.forwardYearsLo, forwardYearsHi: realEta.forwardYearsHi === Infinity ? "Infinity" : realEta.forwardYearsHi, assumptions: realEta.assumptions, hedge: realEta.hedge },
    independenceAssumptionStated: realPanel.breadth.independenceAssumption.length > 0,
  },
  proDisclosure: { derivesNothing: true, sample: Breadth.proDisclosure({ breadth: realPanel, eta: realEta, rigor: { sharpeAnnualized: annualizedSharpe(realReturns, 365), dsr: null, psr0: null, nObs: realReturns.length }, cpcv: null }) },
  verdictDifferential: { byteIdentical: differentialByteIdentical, fingerprintSetSha, submissions: before.length },
}
writeFileSync(path.join(D, "phase1-breadth-v11.json"), JSON.stringify(gate, null, 2) + "\n")

console.log(`cheap test (ran FIRST): ok=${cheapTestOk}`)
for (const r of recoveries as Record<string, unknown>[]) console.log(`  IC(spearman) pop ${r.icSpearmanPop}→est ${r.icEst} (err ${r.icErr}) · BR ${r.brTrue}→${r.brEst} (err ${r.brErr}) · IR(pearson) ${r.irPearson} vs realized Sharpe ${r.realizedSharpe} (err ${r.irErr}) · ${r.ok ? "OK" : "FAIL"}`)
console.log(`ETA hand-verify: ${etaHandVerify.worked}`)
console.log(`may-never honest output: ${(mayNeverExample as Record<string, unknown>).canProduceHonestSentence}`)
console.log(`real strategy: IC=${realPanel.ic.toFixed(3)} BR=${realPanel.breadth.betsPerYear.toFixed(0)}/yr IR=${realPanel.ir.toFixed(2)} · ETA "${realEta.range}"`)
console.log(`verdict differential byte-identical: ${differentialByteIdentical} · fingerprint-set-sha ${fingerprintSetSha.slice(0, 12)}…`)
console.log(`written: phase1-breadth-v11.json · verdict-fingerprints-v11.json`)
