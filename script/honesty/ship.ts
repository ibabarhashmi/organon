/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 1: the EMIT PATH — `organon.sh ship`. THE PROGRAM THAT WILL NOT WRITE.
 *
 * This is the ONE writer of the build log. It generates the machine blocks (header, gate, terminal marker) exactly as
 * script/honesty/rollup.ts does, splices in the authored prose body (sprint/sprint-result/BUILDLOG-SHIP.body.md, if
 * present), and runs Ship.emit() — which writes the full build log to the SINGLE path IFF Ship.gate() passes against THIS
 * sprint's REAL artifacts, and otherwise writes a REFUSAL to the SAME path (RP-2 — no --force, no second door).
 *
 * THE POSITIVE CONTROL ON THE REAL EMIT PATH (RP-1, F-1 CRITICAL): `--seed-bad <slot>` corrupts the named marker slot
 * BEFORE the gate. It can ONLY make the gate REFUSE, never PASS (the opposite of a --force). The control runs THIS command
 * with a prose treeHash and shows the shell output contains the refusal and no build log is written — a proof no unit test
 * can give. A ship gate proven only in the battery is this project's oldest mistake, for the fifth time.
 *
 * Run (real):    bun run script/honesty/ship.ts --pass N --skip N --fail N --files N --expect N --identical y --curated N
 * Run (control): bun run script/honesty/ship.ts --seed-bad treeHash --out /tmp/ship-pc.md
 */
import { writeFileSync, readFileSync, existsSync, statSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Rollup } from "../../src/organon/rollup"
import { Ship } from "../../src/organon/ship"
import { Verify } from "../../src/organon/verify"

function arg(name: string, def: string): string {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def
}
function flag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

const at = arg("at", "2026-07-15")
const outPath = arg("out", path.join(PKG_ROOT, "sprint", "sprint-result", "BUILDLOG-SHIP.md"))
const seedBad = arg("seed-bad", "") // POSITIVE CONTROL (RP-1) — corrupts a marker slot; can ONLY cause a REFUSE
const fast = flag("fast") || seedBad !== "" // the control needs no full battery — skip the bundle

const fullBattery = {
  pass: Number(arg("pass", "0")),
  skip: Number(arg("skip", "0")),
  fail: Number(arg("fail", "0")),
  files: Number(arg("files", "0")),
  expect: Number(arg("expect", "0")),
  twoRunsIdentical: arg("identical", "n") === "y",
}
const curated = arg("curated", "")
const battery = curated ? { live: curated, committed: curated } : undefined

console.error(seedBad ? `POSITIVE CONTROL — seeding a bad marker slot (${seedBad}) on the REAL emit path…` : "running the FULL verify (evidence bundle + frozen set + curated battery)…")
const verify: Verify.Result = fast ? Verify.run({ skipBundle: true }) : Verify.run({ battery })
const m: Rollup.RunMeasured = { fullBattery, verify, goldenMoves: 0, at }

// generate the machine blocks (the claims are the machine's; the prose is the agent's).
const header = Rollup.header(m)
const gate = Rollup.gate()
const marker = Rollup.terminalMarker(m)

// POSITIVE CONTROL (RP-1) — corrupt the named marker slot BEFORE the gate. treeHash → prose is the canonical control.
if (seedBad) {
  const proseValues: Record<string, unknown> = {
    treeHash: "the ship sprint commit", // prose in a hash slot → S152 REFUSE
    commitSha: "the terminal commit of v40", // prose → S152 REFUSE
    battery: "all green", // not a pass/skip/fail shape → S152 REFUSE
  }
  marker[seedBad] = proseValues[seedBad] ?? "⟨filled post-commit⟩"
}

const commitSha = String(marker.commitSha)
const artifacts = Ship.collectArtifacts(marker, seedBad === "commitSha" ? "0000000000000000000000000000000000000000" : commitSha, verify)

// assemble the FULL build log content: the authored prose body (if present) with the machine blocks spliced in.
const bodyPath = path.join(PKG_ROOT, "sprint", "sprint-result", "BUILDLOG-SHIP.body.md")
const machineBlocks =
  "\n## THE GENERATED MARKER (X-DERIVE(a) — the machine wrote these claims)\n\n" + Rollup.renderMarker(marker) +
  "\n\n## THE GENERATED HEADER\n\n```json\n" + JSON.stringify(header, null, 2) + "\n```\n" +
  "\n## THE GENERATED GATE (D51 first; the menu presented, never chosen — LN5)\n\n```json\n" + JSON.stringify(gate, null, 2) + "\n```\n"
const body = existsSync(bodyPath) ? readFileSync(bodyPath, "utf8") : "# ORGΛNON — THE SHIP SPRINT (V40)\n\n(the authored prose body is spliced here at emit time)\n"
const fullLogContent = body.includes("<!-- MACHINE BLOCKS -->") ? body.replace("<!-- MACHINE BLOCKS -->", machineBlocks) : body + "\n" + machineBlocks

// THE ONE WRITER — gated. Records the mtime of any existing log so the control can prove it was not modified.
const priorMtime = existsSync(outPath) ? statSync(outPath).mtimeMs : null
const emission = Ship.emit(fullLogContent, artifacts, at)
writeFileSync(outPath, emission.content)

console.log("\n═══════════════ SHIP GATE — every wall run against THIS sprint's REAL artifacts ═══════════════")
for (const c of emission.checks) console.log(`  ${c.ok ? "✓" : "✗"} ${c.wall} — ${c.artifact}: ${c.detail}`)
if (emission.wrote === "refusal") {
  console.log(`\n  ✗ REFUSED — the build log was NOT written. A refusal was written instead (RP-2, same path):`)
  console.log(`    wall ${emission.refusal.wall} · artifact "${emission.refusal.artifact}" · value: ${emission.refusal.value}`)
  console.log(`  → ${path.relative(PKG_ROOT, outPath)} is a REFUSAL, not a build log. There is no --force.`)
  process.exitCode = 1
} else {
  console.log(`\n  ✓ SHIP GATE PASS — the build log was written to ${path.relative(PKG_ROOT, outPath)}`)
}

// record the positive-control transcript (RP-1) so the wall can assert it and the log can quote it.
if (seedBad) {
  const pc = {
    protocol: "ship-positive-control",
    at,
    rule: "RP-1 (F-1 CRITICAL) — the positive control on the REAL emit path: a seeded bad marker slot, the REAL emit command, and NO build log written (a refusal at the same path instead). No unit test satisfies this control (X-SHOWN(b)).",
    command: `bun run script/honesty/ship.ts --seed-bad ${seedBad} --out ${path.relative(PKG_ROOT, outPath)}`,
    seededSlot: seedBad,
    wrote: emission.wrote,
    refusal: emission.wrote === "refusal" ? emission.refusal : null,
    outIsRefusalNotLog: emission.wrote === "refusal" && emission.content.includes("BUILD LOG REFUSED"),
    realLogUntouched: priorMtime === null ? "the real build log did not exist before this control run" : `the real build log's mtime was ${priorMtime} and this control wrote to ${path.relative(PKG_ROOT, outPath)} — the real log was not modified`,
  }
  writeFileSync(path.join(PKG_ROOT, "data", "honesty", "ship-positive-control.json"), JSON.stringify(pc, null, 2) + "\n")
  console.log(`\n  RP-1 transcript written: data/honesty/ship-positive-control.json (wrote: ${emission.wrote})`)
}
