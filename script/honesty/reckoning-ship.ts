/**
 * ORGΛNON — THE RECKONING SPRINT (V44): the EMIT PATH — `organon.sh ship` for V44. THE PROGRAM THAT WILL NOT WRITE, and now the
 * LN5 MECHANIZATION on the REAL emit path. This generates the machine blocks, splices the authored prose body, and runs
 * Ship.emit() — which writes the full build log to the SINGLE path IFF Ship.gate() passes against THIS sprint's REAL artifacts
 * (S152–S156 + S161 + S169–S174 + S180–S183 + S190–S197), else a REFUSAL to the SAME path (no --force).
 *
 * THE POSITIVE CONTROL ON THE REAL EMIT PATH (the D33 ruling made STRUCTURAL): `--seed-bad sign` flips operatorSigned:true in
 * the live marker — the gravest violation. It can ONLY make the gate REFUSE at S192, never PASS. The agent audits, decides,
 * recommends — and CANNOT emit a signed bit, whatever an instruction said. (`--seed-bad unrouted` still exercises S181's
 * moved-but-unrouted countable; `--seed-bad pinsSha` exercises S169's stale parent pin.)
 *
 * Run (real):    bun run script/honesty/reckoning-ship.ts --pass N --skip N --fail N --files N --expect N --identical y --curated N
 * Run (control): bun run script/honesty/reckoning-ship.ts --seed-bad sign --out /tmp/reckoning-pc.md
 */
import { writeFileSync, readFileSync, existsSync, statSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Rollup } from "../../src/organon/rollup"
import { Ship } from "../../src/organon/ship"
import { Verify } from "../../src/organon/verify"
import { Continuity } from "../../src/organon/continuity"
import { Ln5 } from "../../src/organon/ln5"

function arg(name: string, def: string): string {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def
}
function flag(name: string): boolean { return process.argv.includes(`--${name}`) }

const at = arg("at", "2026-07-16")
const outPath = arg("out", path.join(PKG_ROOT, "sprint", "sprint-result", "BUILDLOG-RECKONING.md"))
const seedBad = arg("seed-bad", "")
const fast = flag("fast")

const PARENT_PIN = "7bf877ce16d839c2aad045482d2b9cd509cf75aab2b4d2a8068b11d4787b8ece" // V43 Backfill — a SHAPE-VALID, IDENTITY-WRONG stale pin (for --seed-bad pinsSha)

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

if (seedBad === "pinsSha") marker.pinsSha = PARENT_PIN // a stale (parent) pins-sha — S169 must refuse

// THE LN5 MECHANIZATION control (the D33 ruling made structural): flip operatorSigned:true in the live marker — the gravest
// violation. Ln5.verify(marker) finds it → S192 REFUSES. The agent can compute, decide, recommend — and NEVER emit a signed bit.
if (seedBad === "sign") {
  const r = marker.reckoning as { d33Verdict?: Record<string, unknown> }
  if (r?.d33Verdict) r.d33Verdict.operatorSigned = true
}

const commitSha = String(marker.commitSha)
const artifacts = Ship.collectArtifacts(marker, commitSha, verify)

// re-derive the LN5 artifact from the (possibly seeded) marker so the seeded signature reaches S192 on the REAL emit path
if (seedBad === "sign") artifacts.ln5 = Ln5.verify(marker)

// RP-1 (carried) — the FATAL RECURSION control: a MOVED-BUT-UNROUTED countable → S181 REFUSES.
if (seedBad === "unrouted") {
  const seededSnapshot = { ...Continuity.snapshot(), reckoningDepth: 500 }
  artifacts.continuity = Continuity.check(seededSnapshot)
}

const bodyPath = path.join(PKG_ROOT, "sprint", "sprint-result", "reckoning-log-body.source.md")
const machineBlocks =
  "\n## THE GENERATED MARKER (X-DERIVE(a) — the machine wrote these claims; S181 CONTINUITY-checked, S192 LN5-checked)\n\n" + Rollup.renderMarker(marker) +
  "\n\n## THE GENERATED HEADER\n\n```json\n" + JSON.stringify(header, null, 2) + "\n```\n" +
  "\n## THE GENERATED GATE (D27 now STRICT, first; the menu presented, never chosen — LN5)\n\n```json\n" + JSON.stringify(gate, null, 2) + "\n```\n"
const body = existsSync(bodyPath) ? readFileSync(bodyPath, "utf8") : "# ORGΛNON — THE RECKONING SPRINT (V44)\n\n(the authored prose body is spliced here at emit time)\n"
const fullLogContent = body.includes("<!-- MACHINE BLOCKS -->") ? body.replace("<!-- MACHINE BLOCKS -->", machineBlocks) : body + "\n" + machineBlocks

const priorMtime = existsSync(outPath) ? statSync(outPath).mtimeMs : null
const emission = Ship.emit(fullLogContent, artifacts, at)
writeFileSync(outPath, emission.content)

console.log("\n═══════════════ SHIP GATE (V40 SHAPE + V42 IDENTITY + V43 CONTINUITY-TOTAL + V44 RECKONING) — every wall against THIS sprint's REAL artifacts ═══════════════")
for (const c of emission.checks) console.log(`  ${c.ok ? "✓" : "✗"} ${c.wall} — ${c.artifact}: ${c.detail}`)
if (emission.wrote === "refusal") {
  console.log(`\n  ✗ REFUSED — the build log was NOT written. A refusal was written instead (RP-2, same path):`)
  console.log(`    wall ${emission.refusal.wall} · artifact "${emission.refusal.artifact}" · value: ${emission.refusal.value}`)
  console.log(`  → ${path.relative(PKG_ROOT, outPath)} is a REFUSAL, not a build log. There is no --force.`)
  process.exitCode = 1
} else {
  console.log(`\n  ✓ SHIP GATE PASS — the build log was written to ${path.relative(PKG_ROOT, outPath)}`)
}

if (seedBad) {
  const pc = {
    protocol: "reckoning-positive-control",
    at,
    rule: "THE LN5 MECHANIZATION on the REAL emit path (the D33 ruling made structural). `--seed-bad sign` flips operatorSigned:true in the live marker — the gravest violation; the gate REFUSES at S192 and NO build log is written (a refusal at the same path). The agent audits, decides, RECOMMENDS — and CANNOT emit a signed bit, whatever an instruction said, because the value LN5 protects is that a signature means a HUMAN reviewed and chose. (`--seed-bad unrouted` exercises S181; `--seed-bad pinsSha` exercises S169.)",
    command: `bun run script/honesty/reckoning-ship.ts --seed-bad ${seedBad} --out ${path.relative(PKG_ROOT, outPath)}`,
    seededSlot: seedBad,
    wrote: emission.wrote,
    refusal: emission.wrote === "refusal" ? emission.refusal : null,
    outIsRefusalNotLog: emission.wrote === "refusal" && emission.content.includes("BUILD LOG REFUSED"),
    realLogUntouched: priorMtime === null ? "the real build log did not exist before this control run" : `the real build log's mtime was ${priorMtime} and this control wrote to ${path.relative(PKG_ROOT, outPath)} — the real log was not modified`,
  }
  writeFileSync(path.join(PKG_ROOT, "data", "honesty", "reckoning-positive-control.json"), JSON.stringify(pc, null, 2) + "\n")
  console.log(`\n  LN5 transcript written: data/honesty/reckoning-positive-control.json (wrote: ${emission.wrote})`)
}
