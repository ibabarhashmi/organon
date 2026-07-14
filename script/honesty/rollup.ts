/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), Phase 1: the GENERATOR — emit the build log's header, gate, and terminal marker.
 *
 * X-DERIVE(a): the header, the gate's checkboxes, and the terminal marker are GENERATED, never written. This runs the full
 * verify (the evidence bundle), assembles every claim through its producer, and prints the header/gate/marker the agent
 * pastes into the build log. The run-measured full-battery numbers (two runs) are passed in; everything else is a producer.
 *
 * Run: bun run script/honesty/rollup.ts --pass 1620 --skip 2 --fail 0 --files 250 --expect 10000 --identical y
 */
import { Rollup } from "../../src/organon/rollup"
import { Verify } from "../../src/organon/verify"

function arg(name: string, def: string): string {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def
}

const fullBattery = {
  pass: Number(arg("pass", "0")),
  skip: Number(arg("skip", "0")),
  fail: Number(arg("fail", "0")),
  files: Number(arg("files", "0")),
  expect: Number(arg("expect", "0")),
  twoRunsIdentical: arg("identical", "n") === "y",
}

console.error("running the FULL verify (evidence bundle + frozen set + curated battery)…")
const verify = Verify.run({ battery: undefined }) // full verify (spawns build-evidence --check)
const m: Rollup.RunMeasured = { fullBattery, verify, goldenMoves: 0, at: "2026-07-14" }

console.log("\n═══════════════ GENERATED HEADER (X-DERIVE(a) — the machine wrote these claims) ═══════════════")
console.log(JSON.stringify(Rollup.header(m), null, 2))
console.log("\n═══════════════ GENERATED GATE (D51 first; the menu presented, never chosen — LN5) ═══════════════")
console.log(JSON.stringify(Rollup.gate(), null, 2))
console.log("\n═══════════════ GENERATED TERMINAL MARKER (Marker-valid; verifyOutput derived, never 'green' typed) ═══════════════")
const marker = Rollup.terminalMarker(m)
console.log(Rollup.renderMarker(marker))
