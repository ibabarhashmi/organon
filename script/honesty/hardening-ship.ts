/**
 * ORGΛNON — THE HARDENING SPRINT (V45): the EMIT PATH — `organon.sh ship` for V45. THE PROGRAM THAT WILL NOT WRITE, now with
 * the V45 production-readiness band (S198–S209) run against THIS sprint's REAL artifacts. Generates the machine blocks, splices
 * the authored prose, and runs Ship.emit() — which writes the full build log to the SINGLE path IFF Ship.gate() passes, else a
 * REFUSAL to the SAME path (no --force).
 *
 * THE POSITIVE CONTROLS (Part F, on the REAL emit path):
 *   --seed-bad twostate : sets marker.reckoning.delegation.D87 = "RESERVED" (disagreeing with the ONE producer AGENT-RATIFIED)
 *                         → S198 REFUSES (the P-1 defect class, caught on the emit path).
 *   --seed-bad untraced : injects a rogue built wall with no registry entry → S209 REFUSES (no untraced scope, A′#2).
 *   --seed-bad sign     : flips operatorSigned:true in the live marker (the gravest LN5 violation) → S192 REFUSES (carried).
 *
 * Run (real):    bun run script/honesty/hardening-ship.ts --pass N --skip N --fail N --files N --expect N --identical y --curated N
 * Run (control): bun run script/honesty/hardening-ship.ts --seed-bad twostate --out /tmp/hardening-pc.md
 */
import { writeFileSync, readFileSync, existsSync, statSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Rollup } from "../../src/organon/rollup"
import { Ship } from "../../src/organon/ship"
import { Verify } from "../../src/organon/verify"
import { State } from "../../src/organon/state"
import { Ln5 } from "../../src/organon/ln5"
import { Registry } from "../../src/organon/registry"

function arg(name: string, def: string): string { const i = process.argv.indexOf(`--${name}`); return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def }
function flag(name: string): boolean { return process.argv.includes(`--${name}`) }

const at = arg("at", "2026-07-16")
const outPath = arg("out", path.join(PKG_ROOT, "sprint", "sprint-result", "BUILDLOG-HARDENING.md"))
const seedBad = arg("seed-bad", "")
const fast = flag("fast")

const fullBattery = {
  pass: Number(arg("pass", "0")), skip: Number(arg("skip", "0")), fail: Number(arg("fail", "0")),
  files: Number(arg("files", "0")), expect: Number(arg("expect", "0")), twoRunsIdentical: arg("identical", "n") === "y",
}
const curated = arg("curated", "")
const battery = curated ? { live: curated, committed: curated } : undefined

console.error(seedBad ? `POSITIVE CONTROL — seeding a bad artifact (${seedBad}) on the REAL emit path…` : "running the FULL verify (evidence bundle + frozen set + curated battery)…")
const verify: Verify.Result = fast ? Verify.run({ skipBundle: true }) : Verify.run({ battery })
const m: Rollup.RunMeasured = { fullBattery, verify, goldenMoves: 0, at }

const header = Rollup.header(m)
const gate = Rollup.gate()
const marker = Rollup.terminalMarker(m)

// THE LN5 MECHANIZATION control (carried) — flip operatorSigned:true in the live marker → S192 REFUSES.
if (seedBad === "sign") {
  const r = marker.reckoning as { d33Verdict?: Record<string, unknown> }
  if (r?.d33Verdict) r.d33Verdict.operatorSigned = true
}
// THE ONE-STATE control (P-1/S198) — set the reckoning block's D87 to a state DISAGREEING with the ONE producer.
if (seedBad === "twostate") {
  const r = marker.reckoning as { delegation?: Record<string, unknown> }
  if (r?.delegation) r.delegation.D87 = "RESERVED" // the producer says AGENT-RATIFIED → S198 catches the second state
}

const commitSha = String(marker.commitSha)
const artifacts = Ship.collectArtifacts(marker, commitSha, verify)

// re-derive the seeded artifacts from the (possibly seeded) marker so the control reaches its wall on the REAL emit path
if (seedBad === "sign") artifacts.ln5 = Ln5.verify(marker)
if (seedBad === "twostate") artifacts.oneState = State.oneStateVerdict(marker)
// THE UNTRACED-SCOPE control (S209) — inject a rogue built wall with no registry entry.
if (seedBad === "untraced") artifacts.registry = Registry.check([...Registry.builtWalls(), "S999-untraced-scope"])

const bodyPath = path.join(PKG_ROOT, "sprint", "sprint-result", "hardening-log-body.source.md")
const machineBlocks =
  "\n## THE GENERATED MARKER (X-DERIVE(a) — the machine wrote these claims; S181 CONTINUITY-checked, S192 LN5-checked, S198 ONE-STATE-checked, S209 TRACE-checked)\n\n" + Rollup.renderMarker(marker) +
  "\n\n## THE GENERATED HEADER\n\n```json\n" + JSON.stringify(header, null, 2) + "\n```\n" +
  "\n## THE GENERATED GATE (the pen's six keystrokes render, none made — LN5)\n\n```json\n" + JSON.stringify(gate, null, 2) + "\n```\n" +
  "\n## THE OPEN-ISSUES REGISTRY (S209 — the disposition census, RP-1)\n\n```\n" + Registry.censusLine() + "\n```\n"
const body = existsSync(bodyPath) ? readFileSync(bodyPath, "utf8") : "# ORGΛNON — THE HARDENING SPRINT (V45)\n\n(the authored prose body is spliced here at emit time)\n"
const fullLogContent = body.includes("<!-- MACHINE BLOCKS -->") ? body.replace("<!-- MACHINE BLOCKS -->", machineBlocks) : body + "\n" + machineBlocks

const priorMtime = existsSync(outPath) ? statSync(outPath).mtimeMs : null
const emission = Ship.emit(fullLogContent, artifacts, at)
writeFileSync(outPath, emission.content)

console.log("\n═══════════════ SHIP GATE (V40 SHAPE + V42 IDENTITY + V43 CONTINUITY-TOTAL + V44 RECKONING + V45 HARDENING) — every wall against THIS sprint's REAL artifacts ═══════════════")
for (const c of emission.checks) console.log(`  ${c.ok ? "✓" : "✗"} ${c.wall} — ${c.artifact}: ${c.detail.slice(0, 100)}`)
if (emission.wrote === "refusal") {
  console.log(`\n  ✗ REFUSED — the build log was NOT written. A refusal was written instead (RP-2, same path):`)
  console.log(`    wall ${emission.refusal.wall} · artifact "${emission.refusal.artifact}" · value: ${emission.refusal.value.slice(0, 140)}`)
  console.log(`  → ${path.relative(PKG_ROOT, outPath)} is a REFUSAL, not a build log. There is no --force.`)
  process.exitCode = 1
} else {
  console.log(`\n  ✓ SHIP GATE PASS — the build log was written to ${path.relative(PKG_ROOT, outPath)}`)
}

if (seedBad) {
  const pc = {
    protocol: "hardening-positive-control",
    at,
    rule: "THE PART-F POSITIVE CONTROLS on the REAL emit path. `--seed-bad twostate` (P-1/S198) sets the reckoning block's D87 to a state DISAGREEING with the ONE producer → S198 REFUSES; `--seed-bad untraced` (S209) injects a rogue built wall with no registry entry → S209 REFUSES; `--seed-bad sign` (S192, carried) flips operatorSigned:true → S192 REFUSES. Each can ONLY make the gate REFUSE, never PASS — the defect class is caught where it matters (X-REACH(a)).",
    command: `bun run script/honesty/hardening-ship.ts --seed-bad ${seedBad} --out ${path.relative(PKG_ROOT, outPath)}`,
    seededSlot: seedBad,
    wrote: emission.wrote,
    refusal: emission.wrote === "refusal" ? emission.refusal : null,
    outIsRefusalNotLog: emission.wrote === "refusal" && emission.content.includes("BUILD LOG REFUSED"),
    realLogUntouched: priorMtime === null ? "the real build log did not exist before this control run" : `the real build log's mtime was ${priorMtime} and this control wrote to ${path.relative(PKG_ROOT, outPath)}`,
  }
  writeFileSync(path.join(PKG_ROOT, "data", "honesty", "hardening-positive-control.json"), JSON.stringify(pc, null, 2) + "\n")
  console.log(`\n  positive-control transcript written: data/honesty/hardening-positive-control.json (wrote: ${emission.wrote})`)
}
