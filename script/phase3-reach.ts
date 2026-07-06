/**
 * ORGΛNON — Reachability Phase 3 evidence (Rules U-AMEND, U-SURFACE, S-PROPOSE, S-FAMILY). The Guided Builder's
 * non-traversal proofs (the traversal itself is script/builder-traversal.ts → traversal-guided-builder.json, the gate's
 * ONLY sufficient evidence): the screen set closed at 9; the conservative defaults ratified; the help copy honesty-
 * checked; the LINEAGE stiffening (an edit resubmitted counts as another attempt — the bar rises); the verdict
 * differential byte-identical. Deterministic. Run: bun run script/phase3-reach.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Builder } from "../src/studio/builder"
import { Console } from "../src/studio/console"
import { StudioScreens } from "../src/studio/screens"
import { DataPlane } from "../src/dataplane/store"
import { Surface } from "../src/studio/surface"
import { VerdictDifferential } from "../src/studio/differential"

const D = path.join(PKG_ROOT, "data", "studio")
const T = 1_735_689_600_000
const KEYS = ["lending:aave-v3:USDC:ethereum", "lending:sparklend:DAI:ethereum", "lending:fluid-lending:USDC:ethereum"]

// screen set closed at 9; defaults conservative; help honesty-checked
const screensNine = StudioScreens.SCREENS.length === 9 && StudioScreens.SCREENS[8] === "guidedBuilder"
const defaultsConservative = Builder.defaultsConservative()
const helpHonest = Builder.helpHonest()

// LINEAGE stiffening (S-FAMILY): compose a spec, then an EDIT (declaring the parent) — the family grows, the bar rises
const series = new Map<string, DataPlane.Series>()
for (const k of KEYS) { const s = DataPlane.snapshotAdapter.fetchSeries(k); if (s) series.set(k, s) }
let lineage: unknown = { blocked: true, reason: "lending snapshots absent (fresh clone) — re-capture keyless" }
if (series.size >= 2) {
  const specA = Builder.compose({ markets: [{ key: KEYS[0], weight: 0.5 }, { key: KEYS[1], weight: 0.5 }], policy: "static" }, [...series.keys()])
  const specAedit = Builder.compose({ markets: [{ key: KEYS[0], weight: 0.6 }, { key: KEYS[1], weight: 0.4 }], policy: "static" }, [...series.keys()])
  if (specA.ok && specAedit.ok) {
    const first = await Console.runComposed(specA.composed.spec, series, T) // family 1
    const edit = await Console.runComposed(specAedit.composed.spec, series, T, { priorFamily: [specA.composed.spec] }) // family 2
    lineage = { firstNTrials: first.artifact?.ledger.nTrials, editNTrials: edit.artifact?.ledger.nTrials, stiffens: (edit.artifact?.ledger.nTrials ?? 0) > (first.artifact?.ledger.nTrials ?? 0), note: "editing + resubmitting counts as another attempt — the family-size deflation raises the bar (this is the product working)" }
  }
}

// the traversal artifact (the gate evidence) — re-verify it is admissible U-SURFACE evidence
const tPath = path.join(D, "traversal-guided-builder.json")
const traversal = Surface.loadTraversal(tPath)

// verdict differential
const pinnedFp = JSON.parse(readFileSync(path.join(D, "verdict-fingerprints-v11.json"), "utf8")) as { fingerprintSetSha: string }
const differentialByteIdentical = (await VerdictDifferential.fingerprintSetSha()) === pinnedFp.fingerprintSetSha

const gate = {
  protocol: "phase3-builder-reachable-v12",
  at: "2026-07-05",
  gate: "BUILDER-REACHABLE",
  amendment: { screensNine, screens: StudioScreens.SCREENS, note: "the set amended 8→9 (Guided Builder), once, closed again — a tenth refused by construction" },
  defaults: { conservative: defaultsConservative, values: Builder.DEFAULTS },
  helpHonest: { ok: helpHonest.ok, issues: helpHonest.issues },
  lineageStiffening: lineage,
  traversal: { file: "data/studio/traversal-guided-builder.json", admissible: traversal.ok, issues: traversal.issues, note: "the gate's ONLY sufficient evidence (U-SURFACE): fresh serve → compose → verdict → panels + a failure state (an invalid composition refused)" },
  verdictDifferential: { byteIdentical: differentialByteIdentical },
}
writeFileSync(path.join(D, "phase3-builder-reachable-v12.json"), JSON.stringify(gate, null, 2) + "\n")

console.log(`screen set closed at 9: ${screensNine} (${StudioScreens.SCREENS.join(", ")})`)
console.log(`defaults conservative: ${defaultsConservative} · help honesty-checked: ${helpHonest.ok}${helpHonest.ok ? "" : " — " + helpHonest.issues.join("; ")}`)
console.log(`lineage stiffening: ${JSON.stringify(lineage)}`)
console.log(`builder traversal admissible: ${traversal.ok}${traversal.ok ? "" : " — " + traversal.issues.join("; ")}`)
console.log(`verdict differential byte-identical: ${differentialByteIdentical}`)
console.log(`written: phase3-builder-reachable-v12.json`)
