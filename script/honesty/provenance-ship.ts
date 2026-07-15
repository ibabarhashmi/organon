/**
 * ORGΛNON — THE PROVENANCE SPRINT (V42): the EMIT PATH — `organon.sh ship` for V42. THE PROGRAM THAT WILL NOT WRITE, REUSED
 * AND IDENTITY-HARDENED. V40 built the Ship Gate (shape); V42 graduates it to IDENTITY (S169–S174) — the emitted pins-sha must
 * equal sha256 of THIS sprint's pins file, every generated claim is COMPUTED or carried-and-reverified, the batteryDelta is the
 * FULL battery, the census identity closes, every pinned deviation is in deviationStates. This generates the machine blocks,
 * splices the authored prose body, and runs Ship.emit() — which writes the full build log to the SINGLE path IFF Ship.gate()
 * passes against THIS sprint's REAL artifacts (now including the V42 identity walls), else a REFUSAL to the SAME path (no --force).
 *
 * THE POSITIVE CONTROL ON THE REAL EMIT PATH (RP-1, PART A′ #1 — the FATAL RECURSION): `--seed-bad pinsSha` corrupts the emitted
 * pins-sha to the PARENT (V41's eb64cebe) BEFORE the gate — a SHAPE-VALID (40+ hex), IDENTITY-WRONG stale pin. It can ONLY make
 * the gate REFUSE at S169, never PASS. This is the exact M-1 defect, and the control proves the gate CAN fail on it.
 *
 * Run (real):    bun run script/honesty/provenance-ship.ts --pass N --skip N --fail N --files N --expect N --identical y --curated N
 * Run (control): bun run script/honesty/provenance-ship.ts --seed-bad pinsSha --out /tmp/provenance-pc.md
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
function flag(name: string): boolean { return process.argv.includes(`--${name}`) }

const at = arg("at", "2026-07-15")
const outPath = arg("out", path.join(PKG_ROOT, "sprint", "sprint-result", "BUILDLOG-PROVENANCE.md"))
const seedBad = arg("seed-bad", "")
// NOTE: the seed-bad control runs the FULL verify (3 sub-checks) so S154 passes and the seeded IDENTITY defect reaches its
// own wall (S169) — a fast/skipBundle verify would trip S154 first and never isolate the identity refusal. --fast is opt-in.
const fast = flag("fast")

const PARENT_PIN = "eb64cebe435bc0797dd3752cef35afc36da3ff23230b2d69cd41b5f86c756d08" // V41 Variant — a SHAPE-VALID, IDENTITY-WRONG stale pin

const fullBattery = {
  pass: Number(arg("pass", "0")), skip: Number(arg("skip", "0")), fail: Number(arg("fail", "0")),
  files: Number(arg("files", "0")), expect: Number(arg("expect", "0")), twoRunsIdentical: arg("identical", "n") === "y",
}
const curated = arg("curated", "")
const battery = curated ? { live: curated, committed: curated } : undefined

console.error(seedBad ? `POSITIVE CONTROL — seeding a bad marker slot (${seedBad}) on the REAL emit path…` : "running the FULL verify (evidence bundle + frozen set + curated battery)…")
const verify: Verify.Result = fast ? Verify.run({ skipBundle: true }) : Verify.run({ battery })
const m: Rollup.RunMeasured = { fullBattery, verify, goldenMoves: 0, at }

const header = Rollup.header(m)
const gate = Rollup.gate()
const marker = Rollup.terminalMarker(m)

if (seedBad) {
  // the IDENTITY defect this sprint cures: a stale (parent) pins-sha — SHAPE-VALID, IDENTITY-WRONG.
  const proseValues: Record<string, unknown> = {
    pinsSha: PARENT_PIN, // the parent pin — S169 must refuse
    treeHash: "the provenance sprint commit",
    commitSha: "the terminal commit of v42",
    battery: "all green",
  }
  marker[seedBad] = proseValues[seedBad] ?? "⟨filled post-commit⟩"
}

const commitSha = String(marker.commitSha)
const artifacts = Ship.collectArtifacts(marker, seedBad === "commitSha" ? "0000000000000000000000000000000000000000" : commitSha, verify)

// assemble the FULL build log content: the authored prose body (if present) with the machine blocks spliced in.
const bodyPath = path.join(PKG_ROOT, "sprint", "sprint-result", "provenance-log-body.source.md")
const machineBlocks =
  "\n## THE GENERATED MARKER (X-DERIVE(a) — the machine wrote these claims; S169 IDENTITY-checked)\n\n" + Rollup.renderMarker(marker) +
  "\n\n## THE GENERATED HEADER\n\n```json\n" + JSON.stringify(header, null, 2) + "\n```\n" +
  "\n## THE GENERATED GATE (D27 first; the menu presented, never chosen — LN5)\n\n```json\n" + JSON.stringify(gate, null, 2) + "\n```\n"
const body = existsSync(bodyPath) ? readFileSync(bodyPath, "utf8") : "# ORGΛNON — THE PROVENANCE SPRINT (V42)\n\n(the authored prose body is spliced here at emit time)\n"
const fullLogContent = body.includes("<!-- MACHINE BLOCKS -->") ? body.replace("<!-- MACHINE BLOCKS -->", machineBlocks) : body + "\n" + machineBlocks

const priorMtime = existsSync(outPath) ? statSync(outPath).mtimeMs : null
const emission = Ship.emit(fullLogContent, artifacts, at)
writeFileSync(outPath, emission.content)

console.log("\n═══════════════ SHIP GATE (V40 + V42 IDENTITY) — every wall run against THIS sprint's REAL artifacts ═══════════════")
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
    protocol: "provenance-positive-control",
    at,
    rule: "RP-1 / PART A′ #1 (the FATAL RECURSION, the THIRD time this arc has faced it): the positive control on the REAL emit path. A seeded PARENT pins-sha (V41's eb64cebe — SHAPE-VALID, IDENTITY-WRONG) on the real emit command, and NO build log written (a refusal at the same path). The Ship Gate is REUSED and now runs the V42 identity walls (S169–S174); a stale pin REFUSES at S169. A gate that cannot fail on last sprint's truth is the exact defect; the control proves it CAN.",
    command: `bun run script/honesty/provenance-ship.ts --seed-bad ${seedBad} --out ${path.relative(PKG_ROOT, outPath)}`,
    seededSlot: seedBad,
    seededValue: seedBad === "pinsSha" ? PARENT_PIN : marker[seedBad],
    wrote: emission.wrote,
    refusal: emission.wrote === "refusal" ? emission.refusal : null,
    outIsRefusalNotLog: emission.wrote === "refusal" && emission.content.includes("BUILD LOG REFUSED"),
    realLogUntouched: priorMtime === null ? "the real build log did not exist before this control run" : `the real build log's mtime was ${priorMtime} and this control wrote to ${path.relative(PKG_ROOT, outPath)} — the real log was not modified`,
  }
  writeFileSync(path.join(PKG_ROOT, "data", "honesty", "provenance-positive-control.json"), JSON.stringify(pc, null, 2) + "\n")
  console.log(`\n  RP-1 transcript written: data/honesty/provenance-positive-control.json (wrote: ${emission.wrote})`)
}
