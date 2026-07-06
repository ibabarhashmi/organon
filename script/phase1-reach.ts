/**
 * ORGΛNON — Reachability Phase 1 evidence (Rules R-DOF, R-BASIS, U-PRISTINE, A′#8). Deepens the walls to their own
 * written specs: (1) the noise battery λ-SWEEP under PRE-PINNED parameters (a weak · standard · strong penalty × feature
 * counts × the seed battery, the full OOS path each; a clean sweep leaves the mapping unchanged, files its evidence
 * anyway; a survivor-yielding setting is banned via a mapping supersession); (2) the capture-floor status (Hyperliquid
 * brought to ≥3 stamps / ≥2 runs — see capture-floor-v12.json); (3) the verdict differential re-proven byte-identical.
 * The pristine harness runs separately (script/pristine-clone.ts). Deterministic sweep (seeded). Run: bun run script/phase1-reach.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Voc } from "../src/proposers/voc"
import { DataPlane } from "../src/dataplane/store"
import { VerdictDifferential } from "../src/studio/differential"

const D = path.join(PKG_ROOT, "data", "studio")
const T = Date.parse("2026-07-05T00:00:00Z")

// ── the λ-SWEEP — parameters PINNED here BEFORE running (A′#8: the sweep's granularity is fixed in advance) ──
const SWEEP = { penalties: [0.1, 1.0, 10.0], featureCounts: [30, 40, 50], seeds: 8, nObs: 500 }
const sweep = await Voc.penaltySweep({ penalties: SWEEP.penalties, featureCounts: SWEEP.featureCounts, seeds: SWEEP.seeds, nObs: SWEEP.nObs, timestamp: T })

// ── the capture floor (Hyperliquid) ──
const floor = DataPlane.venueFloorStatus("hyperliquid")

// ── the verdict differential (unchanged after the walls deepened) ──
const pinnedFp = JSON.parse(readFileSync(path.join(D, "verdict-fingerprints-v11.json"), "utf8")) as { fingerprintSetSha: string }
const differentialByteIdentical = (await VerdictDifferential.fingerprintSetSha()) === pinnedFp.fingerprintSetSha

const gate = {
  protocol: "phase1-walls-deeper-v12",
  at: "2026-07-05",
  gate: "WALLS-DEEPER",
  lambdaSweep: {
    pinnedParameters: SWEEP,
    cells: sweep.cells,
    oosClean: sweep.oosClean, // every OOS cell across all penalties × feature counts → zero survivors
    inSampleSurvives: sweep.inSampleSurvives, // the banned in-sample regime yields survivors (the ban demonstration)
    banned: sweep.banned, // survivor-yielding settings (the in-sample regime is banned by the VoC supersession)
    mappingUnchanged: sweep.oosClean, // a clean OOS sweep leaves the pinned λ=1.0 mapping unchanged
    note: "the OOS sweep is clean across all penalties (noise has no out-of-sample edge — the charge cannot rescue what never existed); the in-sample regime survives and is BANNED by the VoC→OOS supersession (research-ratification-v12.json)",
  },
  captureFloor: { constant: DataPlane.CAPTURE_FLOOR, venue: "hyperliquid", stamps: floor.stamps, runs: floor.runs, meetsFloor: floor.meetsFloor, evidence: "capture-floor-v12.json" },
  pristineHarness: { script: "script/pristine-clone.ts", evidence: "pristine-clone-v12.json" },
  verdictDifferential: { byteIdentical: differentialByteIdentical, fingerprintSetSha: pinnedFp.fingerprintSetSha },
}
writeFileSync(path.join(D, "phase1-walls-deeper-v12.json"), JSON.stringify(gate, null, 2) + "\n")

console.log(`λ-sweep (pinned penalties ${JSON.stringify(SWEEP.penalties)} × features ${JSON.stringify(SWEEP.featureCounts)} × ${SWEEP.seeds} seeds):`)
for (const c of sweep.cells) console.log(`  ${c.regime.padEnd(10)} λ=${c.penalty} p=${c.featureCount}: ${c.survivors} survivors (maxDSR ${c.maxDsr})`)
console.log(`OOS sweep clean=${sweep.oosClean} · in-sample survives (banned)=${sweep.inSampleSurvives} · mapping unchanged=${sweep.oosClean}`)
console.log(`capture floor (hyperliquid): stamps=${floor.stamps} runs=${floor.runs} meetsFloor=${floor.meetsFloor}`)
console.log(`verdict differential byte-identical=${differentialByteIdentical}`)
console.log(`written: phase1-walls-deeper-v12.json`)
