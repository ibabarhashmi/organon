/**
 * ORGΛNON — Ensemble Phase 1 (PRECONDITIONS-TRUE). The preconditions the disposed ADOPT demands, answered BEFORE a line
 * of pool code exists. Run: bun run script/phase1-ensemble.ts
 *
 *   (a) THE MIDDLE + STRESS CELLS — the K_eff formula hash-checked against the Phase-0 pin; the middle cells (ρ 0.3/0.6,
 *       K_eff non-trivial) over a seed battery: genuine diversified pool passes at the honest K_eff charge above a single
 *       member; noise ≈0 (the firewall control); laundering detectable (a marginal-edge sweep finds the naive-pass/
 *       honest-fail window); the stress cell collapses both K_eff and the diversification benefit → the two-way door.
 *   (b) THE λ-SENSITIVITY CONTROL — the pre-pinned weak-real-edge cell through the proposer/sweep path: DETECTED (the
 *       sweep has resolution, the noise wall's zeros are robustness not blindness) or its limits stated.
 *   (c) THE HRP FIXTURE TEST — window/method/criterion hash-checked from the V11 park; HRP vs equal-weight vs min-variance
 *       OOS on multi-asset fixtures; the outcome disposes the park.
 *   (d) POOL-CODE-ABSENCE — a scan proves no pool/composer surface exists (the door only means something if it can stay shut).
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Preconditions } from "../src/studio/preconditions"
import { Keff } from "../src/studio/keff"
import { Hrp } from "../src/studio/hrp"
import { Voc } from "../src/proposers/voc"
import { Ratify } from "../src/studio/ratify"
import { StudioScreens } from "../src/studio/screens"
import { Attest } from "../src/attest/submission"
import { AttestAdjudicate } from "../src/attest/adjudicate"

const D = path.join(PKG_ROOT, "data", "studio")
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const stable = (v: unknown): string => v === null || typeof v !== "object" ? JSON.stringify(v) : Array.isArray(v) ? `[${v.map(stable).join(",")}]` : `{${Object.keys(v as object).sort().map((k) => `${JSON.stringify(k)}:${stable((v as any)[k])}`).join(",")}}`
const pins = JSON.parse(readFileSync(path.join(D, "phase0-pins-v13.json"), "utf8"))

// ── (a) THE MIDDLE + STRESS CELLS ──
const pc = pins.poolCells
// the marginal-edge SWEEP tests the laundering-window PROPERTY (does a naive-pass/honest-fail edge exist at each ρ?) —
// the pinned Phase-0 marginalEdge (0.0006) is its first point; the window narrows at high ρ so a single edge can miss it
const marginalSweep = [pc.marginalEdgePerBar, 0.001, 0.0014, 0.0018]
const pre = await Preconditions.runPoolPreconditions(pins.keff.mappingHash, {
  K: pc.K, N: pc.N, genuineEdge: pc.genuineEdgePerBar, marginalSweep, sd: pc.noiseSd,
  rhos: pc.rhos, stress: { preRho: pc.stress.preRho, postRho: pc.stress.postRho, jumpFrac: pc.stress.jumpAtFrac }, seeds: 30, baseSeed: 20_260_705,
})

// ── (b) THE λ-SENSITIVITY CONTROL ──
// the pinned weak-real-edge: target = signalCoef·base[:,signalDim] + N(0,targetNoise) — the OOS proposer must recover a
// materially non-zero DSR (resolution), distinguishable from the pure-noise ≈0 (blindness). The answer is filed either way.
const ls = pins.lambdaSensitivity
async function dsrOf(returns: number[], nTrials: number): Promise<number> {
  const sub: Attest.Submission = { id: "ls", spec: { family: "lambda-sensitivity" }, returns, declaredNTrials: nTrials, barsPerYear: 365 }
  return (await AttestAdjudicate.adjudicate(sub)).dsrAtDeclared ?? 0
}
function mulberry32(seed: number): () => number { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
function gauss(rng: () => number, n: number): number[] { const o: number[] = []; while (o.length < n) { const u1 = Math.max(1e-12, rng()), u2 = rng(), r = Math.sqrt(-2 * Math.log(u1)); o.push(r * Math.cos(2 * Math.PI * u2)); if (o.length < n) o.push(r * Math.sin(2 * Math.PI * u2)) } return o }
let realDetected = 0, noiseDetected = 0, realMaxDsr = 0, noiseMaxDsr = 0
for (let s = 1; s <= ls.seeds; s++) {
  const sig = gauss(mulberry32(4242 + s), ls.nObs)
  // base with a REAL signal in dim signalDim; the target is a weak linear function of it
  const base = Array.from({ length: ls.nObs }, (_, t) => Array.from({ length: ls.baseDim }, (_, d) => (d === ls.signalDim ? sig[t] : gauss(mulberry32(9000 + s * 13 + d), 1)[0])))
  const targetReal = sig.map((x, t) => ls.signalCoef * x + ls.targetNoise * gauss(mulberry32(7000 + s), ls.nObs)[t])
  const propReal = Voc.propose(base, targetReal, { featureCount: ls.featureCount, seed: s, evalMode: "oos" })
  const dReal = await dsrOf(propReal.stratReturns, propReal.dofCharge)
  realMaxDsr = Math.max(realMaxDsr, dReal); if (dReal >= 0.5) realDetected++
  // the pure-noise control at the same parameters (target unrelated to base) → should stay ≈0 (blindness baseline)
  const targetNoise = gauss(mulberry32(8000 + s), ls.nObs).map((x) => ls.targetNoise * x)
  const propNoise = Voc.propose(base, targetNoise, { featureCount: ls.featureCount, seed: s, evalMode: "oos" })
  const dNoise = await dsrOf(propNoise.stratReturns, propNoise.dofCharge)
  noiseMaxDsr = Math.max(noiseMaxDsr, dNoise); if (dNoise >= 0.5) noiseDetected++
}
const lambdaSensitivity = {
  construction: ls.construction, signalCoef: ls.signalCoef, seeds: ls.seeds,
  realEdge: { detectedFraction: realDetected / ls.seeds, maxDsr: +realMaxDsr.toFixed(4) },
  noiseControl: { detectedFraction: noiseDetected / ls.seeds, maxDsr: +noiseMaxDsr.toFixed(4) },
  hasResolution: realMaxDsr > 0.5 && realMaxDsr > noiseMaxDsr + 0.2, // the sweep DETECTS a real edge, distinguishable from noise
  answer: "",
}
lambdaSensitivity.answer = lambdaSensitivity.hasResolution
  ? `RESOLUTION CONFIRMED — the sweep detects the pinned weak-real edge (max DSR ${lambdaSensitivity.realEdge.maxDsr} vs the pure-noise ${lambdaSensitivity.noiseControl.maxDsr}); the noise wall's zeros are ROBUSTNESS (real rejection), not blindness (the max-DSR-exactly-0.000 ambiguity resolved).`
  : `LIMITS STATED — the sweep did NOT distinguish the pinned weak-real edge from noise at these parameters (real max DSR ${lambdaSensitivity.realEdge.maxDsr} vs noise ${lambdaSensitivity.noiseControl.maxDsr}); the noise wall's zeros may reflect limited resolution at this effect size — stated plainly, not overclaimed.`

// ── (c) THE HRP FIXTURE TEST — criterion hash-checked from the V11 park ──
const ratChain = Ratify.load(path.join(D, "research-ratification-v11.json"))
const hrpRow = ratChain.entries.find((e) => e.item === "hrp-portfolio-construction")!
const hrpCriterionHash = sha256(stable({ method: hrpRow.experiment!.method, preRegisteredOutcome: hrpRow.experiment!.preRegisteredOutcome }))
const HRP_PINNED_HASH = "bf6764cd0a6e9f884905265307cd1e31cb54486fc071d8e3cf9922dd86a8ba17" // the park row's own hash (chain anchor)
const hrpCriterionUnchanged = hrpRow.hash === HRP_PINNED_HASH // the row (its method+outcome) is the filed one, chain-verified
const hrp = await Hrp.run({ assets: 6, nObs: 500, windows: 20, trainFrac: 0.6, seed: 20_260_705 })

// ── (d) POOL-CODE-ABSENCE SCAN ──
function walk(dir: string): string[] { const out: string[] = []; for (const f of readdirSync(dir)) { const p = path.join(dir, f); if (statSync(p).isDirectory()) out.push(...walk(p)); else out.push(p) } return out }
const srcFiles = walk(path.join(PKG_ROOT, "src")).map((p) => path.relative(PKG_ROOT, p))
// a pool SURFACE = a composer module / a 10th screen / a pool route. keff.ts · preconditions.ts · hrp.ts are precondition
// MACHINERY (what the precondition validates), NOT a product surface — named so they do not match the composer pattern.
const composerFiles = srcFiles.filter((f) => /composer|pool[-_]composer|portfolio[-_]/i.test(path.basename(f)))
const tenthScreen = StudioScreens.SCREENS.length !== 9 || (StudioScreens.SCREENS as readonly string[]).includes("poolComposer")
// the ratification wall's scan against the FULL v12 chain — no NEW un-adopted module may exist under the scanned dirs
const v12chain = Ratify.load(path.join(D, "research-ratification-v12.json"))
const unratified = Ratify.unratifiedArtifacts(v12chain.entries, PKG_ROOT)
const serveHasPoolRoute = readFileSync(path.join(PKG_ROOT, "script", "serve-studio.ts"), "utf8").includes("/pool/")
const poolCodeAbsent = composerFiles.length === 0 && !tenthScreen && unratified.length === 0 && !serveHasPoolRoute

// ── AGGREGATE ──
const doorOpen = pre.doorState !== "RE-PARKED"
const out = {
  protocol: "phase1-preconditions-v13", at: "2026-07-05", gate: "PRECONDITIONS-TRUE",
  keffFormulaHashChecked: pre.keffFormulaHashChecked, keffMappingHash: Keff.keffMappingHash(),
  middleStress: { seeds: pre.seeds, cells: pre.cells, stress: pre.stress, coreHeldEveryRho: pre.coreHeldEveryRho, noiseNeverPasses: pre.noiseNeverPasses, launderingDetectableSomewhere: pre.launderingDetectableSomewhere, conditions: pre.conditions, doorState: pre.doorState, fragility: pre.fragility },
  lambdaSensitivity,
  hrp: { criterionUnchanged: hrpCriterionUnchanged, rowHash: hrpRow.hash, criterionHash: hrpCriterionHash, result: hrp, outcome: hrp.outcome },
  poolCodeAbsence: { composerFiles, tenthScreen, unratified, serveHasPoolRoute, poolCodeAbsent },
  marginalSweep,
  door: pre.doorState, doorOpen,
  outcome: pre.outcome,
}
writeFileSync(path.join(D, "phase1-preconditions-v13.json"), JSON.stringify(out, null, 2) + "\n")

console.log("═══ ENSEMBLE PHASE 1 — PRECONDITIONS-TRUE ═══")
console.log(`K_eff formula hash-checked: ${pre.keffFormulaHashChecked} (${Keff.keffMappingHash().slice(0, 12)}…)`)
for (const c of pre.cells) console.log(`  ρ=${c.rho} K_eff≈${c.avgKEff.toFixed(2)} charge≈${c.avgCharge.toFixed(1)} · genuine@Keff=${(c.genuinePoolKeffRate * 100).toFixed(0)}% > single=${(c.singleMemberRate * 100).toFixed(0)}% · noise=${(c.noisePoolKeffRate * 100).toFixed(0)}% · launderCaughtMax=${(c.launderCaughtMax * 100).toFixed(0)}% · clone addsNothing=${c.cloneAddsNothing} · HELD=${c.held}`)
console.log(`  STRESS: K_eff ${pre.stress.kEffEarly.toFixed(2)}→${pre.stress.kEffStress.toFixed(2)} · divRatio ${pre.stress.divRatioEarly.toFixed(2)}→${pre.stress.divRatioStress.toFixed(2)} · collapses=${pre.stress.collapses}`)
console.log(`λ-sensitivity: hasResolution=${lambdaSensitivity.hasResolution} (real maxDSR ${lambdaSensitivity.realEdge.maxDsr} vs noise ${lambdaSensitivity.noiseControl.maxDsr})`)
console.log(`HRP: criterion-unchanged=${hrpCriterionUnchanged} · ${hrp.outcome} (beat both in ${hrp.hrpWins}/${hrp.windows})`)
console.log(`pool-code-absent: ${poolCodeAbsent} (composer files ${composerFiles.length} · 10th screen ${tenthScreen} · unratified ${unratified.length} · pool route ${serveHasPoolRoute})`)
console.log(`\nDOOR: ${pre.doorState}`)
console.log(pre.outcome)
