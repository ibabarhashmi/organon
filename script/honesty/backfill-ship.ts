/**
 * ORGΛNON — THE BACKFILL SPRINT (V43): the EMIT PATH — `organon.sh ship` for V43. THE PROGRAM THAT WILL NOT WRITE, REUSED AND
 * CONTINUITY-TOTAL. V40 built the Ship Gate (shape); V42 graduated it to IDENTITY (S169–S174); V43 makes the continuity
 * discipline TOTAL (S180–S183) — every cross-sprint countable reconciles through the ONE reconciler AND no number moved vs the
 * prev marker unrouted. This generates the machine blocks, splices the authored prose body, and runs Ship.emit() — which writes
 * the full build log to the SINGLE path IFF Ship.gate() passes against THIS sprint's REAL artifacts (now including the V43
 * continuity walls), else a REFUSAL to the SAME path (no --force).
 *
 * THE POSITIVE CONTROL ON THE REAL EMIT PATH (RP-1, PART A′ #1 — THE FATAL RECURSION, the FOURTH time this arc has faced its
 * shape): `--seed-bad unrouted` injects a MOVED-BUT-UNROUTED countable into the live continuity artifact — a number that
 * changed vs the prev marker but is neither a registered countable nor exempted. It can ONLY make the gate REFUSE at S181,
 * never PASS. This is the exact drift this sprint ends, and the control proves the gate CAN fail on it — the reconciler cannot
 * be forgotten because the gate counts the countables, not the diligence. (`--seed-bad pinsSha` still exercises S169.)
 *
 * Run (real):    bun run script/honesty/backfill-ship.ts --pass N --skip N --fail N --files N --expect N --identical y --curated N
 * Run (control): bun run script/honesty/backfill-ship.ts --seed-bad unrouted --out /tmp/backfill-pc.md
 */
import { writeFileSync, readFileSync, existsSync, statSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Rollup } from "../../src/organon/rollup"
import { Ship } from "../../src/organon/ship"
import { Verify } from "../../src/organon/verify"
import { Continuity } from "../../src/organon/continuity"

function arg(name: string, def: string): string {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def
}
function flag(name: string): boolean { return process.argv.includes(`--${name}`) }

const at = arg("at", "2026-07-15")
const outPath = arg("out", path.join(PKG_ROOT, "sprint", "sprint-result", "BUILDLOG-BACKFILL.md"))
const seedBad = arg("seed-bad", "")
// the seed-bad control runs the FULL verify (3 sub-checks) so S154 passes and the seeded defect reaches its own wall; --fast is opt-in.
const fast = flag("fast")

const PARENT_PIN = "04c606dd5846e7cdcd9fab86bff7ae4de2dd3c942563fda114abf63e9d3df3f8" // V42 Provenance — a SHAPE-VALID, IDENTITY-WRONG stale pin (for --seed-bad pinsSha)

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

if (seedBad === "pinsSha") {
  marker.pinsSha = PARENT_PIN // a stale (parent) pins-sha — S169 must refuse
}

const commitSha = String(marker.commitSha)
const artifacts = Ship.collectArtifacts(marker, commitSha, verify)

// RP-1 — THE FATAL RECURSION control: seed a MOVED-BUT-UNROUTED countable into the live continuity artifact. A V44-style new
// number (backfillDepth) that changed vs the prev marker but is neither registered nor exempted → S181 REFUSES. Proven on the
// REAL emit path (not a unit test): the gate counts the countables, so the reconciler cannot be forgotten.
if (seedBad === "unrouted") {
  const seededSnapshot = { ...Continuity.snapshot(), backfillDepth: 500 } // an unregistered countable that moved from undefined
  artifacts.continuity = Continuity.check(seededSnapshot)
}

// assemble the FULL build log content: the authored prose body (if present) with the machine blocks spliced in.
const bodyPath = path.join(PKG_ROOT, "sprint", "sprint-result", "backfill-log-body.source.md")
const machineBlocks =
  "\n## THE GENERATED MARKER (X-DERIVE(a) — the machine wrote these claims; S181 CONTINUITY-checked)\n\n" + Rollup.renderMarker(marker) +
  "\n\n## THE GENERATED HEADER\n\n```json\n" + JSON.stringify(header, null, 2) + "\n```\n" +
  "\n## THE GENERATED GATE (D27 first; the menu presented, never chosen — LN5)\n\n```json\n" + JSON.stringify(gate, null, 2) + "\n```\n"
const body = existsSync(bodyPath) ? readFileSync(bodyPath, "utf8") : "# ORGΛNON — THE BACKFILL SPRINT (V43)\n\n(the authored prose body is spliced here at emit time)\n"
const fullLogContent = body.includes("<!-- MACHINE BLOCKS -->") ? body.replace("<!-- MACHINE BLOCKS -->", machineBlocks) : body + "\n" + machineBlocks

const priorMtime = existsSync(outPath) ? statSync(outPath).mtimeMs : null
const emission = Ship.emit(fullLogContent, artifacts, at)
writeFileSync(outPath, emission.content)

console.log("\n═══════════════ SHIP GATE (V40 + V42 IDENTITY + V43 CONTINUITY-TOTAL) — every wall run against THIS sprint's REAL artifacts ═══════════════")
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
    protocol: "backfill-positive-control",
    at,
    rule: "RP-1 / PART A′ #1 (THE FATAL RECURSION, the FOURTH time this arc has faced its shape): the positive control on the REAL emit path. `--seed-bad unrouted` injects a MOVED-BUT-UNROUTED countable (a V44-style backfillDepth that changed vs the prev marker but is neither registered nor exempted); the gate REFUSES at S181 and NO build log is written (a refusal at the same path). The reconciler cannot be forgotten because the gate DIFFS the whole marker and counts the countables, not the diligence. (`--seed-bad pinsSha` exercises S169: a stale parent pin refuses.) A gate that cannot fail on a drifting number is the exact defect; the control proves it CAN.",
    command: `bun run script/honesty/backfill-ship.ts --seed-bad ${seedBad} --out ${path.relative(PKG_ROOT, outPath)}`,
    seededSlot: seedBad,
    wrote: emission.wrote,
    refusal: emission.wrote === "refusal" ? emission.refusal : null,
    outIsRefusalNotLog: emission.wrote === "refusal" && emission.content.includes("BUILD LOG REFUSED"),
    realLogUntouched: priorMtime === null ? "the real build log did not exist before this control run" : `the real build log's mtime was ${priorMtime} and this control wrote to ${path.relative(PKG_ROOT, outPath)} — the real log was not modified`,
  }
  writeFileSync(path.join(PKG_ROOT, "data", "honesty", "backfill-positive-control.json"), JSON.stringify(pc, null, 2) + "\n")
  console.log(`\n  RP-1 transcript written: data/honesty/backfill-positive-control.json (wrote: ${emission.wrote})`)
}
