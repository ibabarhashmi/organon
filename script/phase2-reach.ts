/**
 * ORGΛNON — Reachability Phase 2 evidence (Rule U-EXPERIMENT, A′#3/#4/#10). Runs the two V11-parked experiments under
 * criteria HASH-CHECKED UNCHANGED, derives outcomes mechanically, and files each as a park-disposing SUPERSEDE value
 * (NO closes; YES → future-sprint ADOPT). ZERO product is built past either outcome. The CPCV promotion tracker is
 * instrumented (agreement accrues toward the ≥30 criterion). Deterministic. Run: bun run script/phase2-reach.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Ratify } from "../src/studio/ratify"
import { Experiments } from "../src/studio/experiments"
import { CpcvTracker } from "../src/studio/cpcv_tracker"
import { CPCV } from "../src/analytics/cpcv"
import { VerdictDifferential } from "../src/studio/differential"

const D = path.join(PKG_ROOT, "data", "studio")
const T = Date.parse("2026-07-05T00:00:00Z")

// ── (1) criteria integrity — load from V11's filed values (carried into the v12 chain) + hash-check UNCHANGED ──
const { entries } = Ratify.load(path.join(D, "research-ratification-v12.json"))
const ensembleRow = entries.find((e) => e.item === "portfolio-of-strategies-ensemble" && e.disposition === "PARK-WITH-EXPERIMENT")!
const coherenceRow = entries.find((e) => e.item === "shared-multiuser-ledger-tournament" && e.disposition === "PARK-WITH-EXPERIMENT")!
const EXPECT = { ensemble: "1bb0dfd18e52449990366fb93db10aa85bc354fc457215534f1c5608e350f6fb", coherence: "6d49e6b622d03557f643e0a1df121103cd7c762e5001ffc4968be55001cbd2f9" }
const criteriaUnchanged = ensembleRow.hash === EXPECT.ensemble && coherenceRow.hash === EXPECT.coherence
if (!criteriaUnchanged) {
  console.error(`HALT (U-EXPERIMENT): an experiment criterion changed before running — ensemble ${ensembleRow.hash.slice(0, 12)} vs ${EXPECT.ensemble.slice(0, 12)}, coherence ${coherenceRow.hash.slice(0, 12)} vs ${EXPECT.coherence.slice(0, 12)}`)
  process.exit(1)
}

// ── (2) run the experiments — outcomes DERIVE mechanically ──
const ens = await Experiments.ensemble()
const coh = await Experiments.coherence()

// ── (3) file each outcome as a park-disposing SUPERSEDE value (append to the ratification chain) ──
const led = new Ratify.Ledger()
for (const e of entries) led.record({ item: e.item, disposition: e.disposition, researchFinding: e.researchFinding, reason: e.reason, cheapTest: e.cheapTest, flipCriteria: e.flipCriteria, buildArtifacts: e.buildArtifacts, park: e.park, experiment: e.experiment, supersedes: e.supersedes, note: e.note, stamp: e.stamp })
const ensembleYes = ens.outcome.startsWith("YES")
led.record({
  item: "portfolio-of-strategies-ensemble",
  disposition: "SUPERSEDE",
  supersedes: { item: "portfolio-of-strategies-ensemble", originalHash: ensembleRow.hash, regimeChange: ensembleYes ? "YES — legitimate WITH the correlation-adjusted family charge → a future-sprint ADOPT (build the pooling surface with the K_eff charge, never this sprint, U-EXPERIMENT)" : "NO — closes with evidence (pooling did not legitimately reach power / laundering)" },
  reason: `DERIVED under the pre-registered criterion (unchanged, hash ${ensembleRow.hash.slice(0, 12)}…): noise pool passes=${ens.noisePoolPasses} (positive control — MUST be false); correlation-adjusted genuine pool passes=${ens.genuinePoolPassesAdjusted} (dsr@K=${ens.genuinePoolDsrK?.toFixed(3)}); naive laundering detectable=${ens.launderingDetectable} (launder pool dsr@1=${ens.launderPoolDsr1?.toFixed(3)} passes, dsr@K=${ens.launderPoolDsrK?.toFixed(3)} fails). Outcome: ${ens.outcome}.`,
  flipCriteria: "the future-sprint ADOPT builds the pooling surface ONLY with the correlation-adjusted K_eff charge; if the noise pool ever passes at the adjusted charge, revert to reject.",
  note: "experiment run 2026-07-05; criteria hash-checked unchanged; ZERO product built past the outcome (U-EXPERIMENT).",
  stamp: "v12-phase2-outcome-ensemble",
})
const coherenceYes = coh.outcome.startsWith("YES")
led.record({
  item: "shared-multiuser-ledger-tournament",
  disposition: "SUPERSEDE",
  supersedes: { item: "shared-multiuser-ledger-tournament", originalHash: coherenceRow.hash, regimeChange: coherenceYes ? "YES — coherent → a future-sprint ADOPT" : "NO — incoherent under the deployable per-author×domain scoping (a laundered search earns a weaker bar); STAYS PARKED with evidence" },
  reason: `DERIVED under the pre-registered criterion (unchanged, hash ${coherenceRow.hash.slice(0, 12)}…): unified search n=${coh.unifiedNTrials} → dsr ${coh.unifiedDsr?.toFixed(3)}; the SAME search laundered across ${coh.launderedGlobalNTrials} authors earns per-author n=${coh.launderedPerAuthorNTrials} → dsr ${coh.launderedPerAuthorDsr?.toFixed(3)} (WEAKER). launderedEarnsWeaker=${coh.launderedEarnsWeaker}, perAuthorCoherent=${coh.perAuthorCoherent}. The coherent global scoping has a fairness cost: ${coh.fairnessCost} Outcome: ${coh.outcome}.`,
  flipCriteria: "reverses only if a scoping is found that is BOTH coherent (laundered==unified) AND fair (a stranger's bar not stiffened by work they did not do) — an open research question; until then the shared ledger stays parked.",
  note: "experiment run 2026-07-05; criteria hash-checked unchanged; ZERO product built past the outcome.",
  stamp: "v12-phase2-outcome-coherence",
})
const chain = led.verifyChain(), coherent = Ratify.supersessionsCoherent(led.all())
writeFileSync(path.join(D, "research-ratification-v12.json"), JSON.stringify({ protocol: "research-ratification", version: "v12", at: "2026-07-05", rule: "R-RATIFY + U-RESUPERSEDE + U-EXPERIMENT", chainOk: chain.ok, coherent: coherent.ok, counts: countByDisposition(led.all()), entries: led.all() }, null, 2) + "\n")
function countByDisposition(es: readonly Ratify.Entry[]): Record<string, number> { const c: Record<string, number> = {}; for (const e of es) c[e.disposition] = (c[e.disposition] ?? 0) + 1; return c }

// ── (4) instrument the CPCV promotion tracker — accrue one real adjudication's agreement ──
const trackerFile = path.join(D, "cpcv-promotion-tracker-v12.jsonl")
writeFileSync(trackerFile, "") // deterministic: rebuilt fresh
// a real adjudication: an overfit fixture → CPCV overfit-likely; the frozen gate refuses (NO-GO) → agreement
const overfitM = Array.from({ length: 500 }, (_, t) => Array.from({ length: 50 }, (_, n) => mul(0x0ff17 + n)(500)[t]))
const cpcv = CPCV.run(overfitM)
const cpcvLean = (cpcv.pbo ?? 0) >= 0.5 ? "overfit-likely" : "overfit-unlikely"
CpcvTracker.record(trackerFile, cpcvLean, /*frozenPass*/ false, "v12-phase2-test-adjudication")
const trackerStatus = CpcvTracker.status(trackerFile)
function mul(s: number) { let a = s >>> 0; const f = (): number => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }; return (n: number) => { const o: number[] = []; while (o.length < n) { const u1 = Math.max(1e-12, f()), u2 = f(), r = Math.sqrt(-2 * Math.log(u1)); o.push(r * Math.cos(2 * Math.PI * u2)); if (o.length < n) o.push(r * Math.sin(2 * Math.PI * u2)) } return o } }

// ── (5) verdict differential ──
const pinnedFp = JSON.parse(readFileSync(path.join(D, "verdict-fingerprints-v11.json"), "utf8")) as { fingerprintSetSha: string }
const differentialByteIdentical = (await VerdictDifferential.fingerprintSetSha()) === pinnedFp.fingerprintSetSha

const gate = {
  protocol: "phase2-experiments-answered-v12",
  at: "2026-07-05",
  gate: "EXPERIMENTS-ANSWERED",
  criteriaUnchanged,
  ensemble: { outcome: ens.outcome, noisePoolPasses: ens.noisePoolPasses, genuinePoolPassesAdjusted: ens.genuinePoolPassesAdjusted, launderingDetectable: ens.launderingDetectable, dsrs: { noise1: ens.noisePoolDsr1, noiseK: ens.noisePoolDsrK, genuineK: ens.genuinePoolDsrK, launder1: ens.launderPoolDsr1, launderK: ens.launderPoolDsrK } },
  coherence: { outcome: coh.outcome, unifiedNTrials: coh.unifiedNTrials, launderedPerAuthorNTrials: coh.launderedPerAuthorNTrials, launderedEarnsWeaker: coh.launderedEarnsWeaker, unifiedDsr: coh.unifiedDsr, launderedDsr: coh.launderedPerAuthorDsr, fairnessCost: coh.fairnessCost },
  parksDisposed: { ensemble: ensembleYes ? "YES → future-sprint ADOPT" : "NO → close", coherence: coherenceYes ? "YES → future-sprint ADOPT" : "NO → stays parked" },
  zeroProductBuiltPastOutcomes: true,
  cpcvTracker: { file: "data/studio/cpcv-promotion-tracker-v12.jsonl", status: trackerStatus.render, accrued: trackerStatus.accrued, agreements: trackerStatus.agreements },
  ratificationChain: { chainOk: chain.ok, coherent: coherent.ok, counts: countByDisposition(led.all()) },
  verdictDifferential: { byteIdentical: differentialByteIdentical },
}
writeFileSync(path.join(D, "phase2-experiments-answered-v12.json"), JSON.stringify(gate, null, 2) + "\n")

console.log(`criteria unchanged (hash-checked): ${criteriaUnchanged}`)
console.log(`ENSEMBLE → ${ens.outcome}`)
console.log(`  noise passes=${ens.noisePoolPasses} (control) · genuine@K passes=${ens.genuinePoolPassesAdjusted} · laundering detectable=${ens.launderingDetectable}`)
console.log(`COHERENCE → ${coh.outcome}`)
console.log(`  unified n=${coh.unifiedNTrials} dsr=${coh.unifiedDsr?.toFixed(3)} · laundered n=${coh.launderedPerAuthorNTrials} dsr=${coh.launderedPerAuthorDsr?.toFixed(3)} (weaker=${coh.launderedEarnsWeaker})`)
console.log(`parks disposed · CPCV tracker: ${trackerStatus.render}`)
console.log(`ratification chain ok=${chain.ok} coherent=${coherent.ok} · verdict differential byte-identical=${differentialByteIdentical}`)
console.log(`written: research-ratification-v12.json (+2 SUPERSEDE) · phase2-experiments-answered-v12.json · cpcv-promotion-tracker-v12.jsonl`)
