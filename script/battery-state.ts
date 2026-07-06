/**
 * ORGΛNON STUDIO — battery-state recorder (Convergence Phase 1). Runs the in-scope battery (walls + studio + ledger/
 * clocks/durable) and records the REAL pass/fail/file counts + wall count to data/studio/battery-state.json, dated, so
 * the Trust Panel mirrors a real recorded state (never a flattering guess). Re-run at each QA. Run: bun run script/battery-state.ts
 */
import { writeFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"

const IN_SCOPE = [
  "test/walls/",
  "test/organon/studio_surfaces.test.ts", "test/organon/studio_routes.test.ts", "test/organon/studio_screens.test.ts",
  "test/organon/studio_graph.test.ts", "test/organon/studio_agents.test.ts", "test/organon/studio_capture.test.ts",
  "test/organon/studio_clocks.test.ts", "test/organon/studio_enroll.test.ts", "test/organon/scheduler_cadence.test.ts",
  "test/organon/restore_drill.test.ts", "test/organon/surface_fuzz.test.ts", "test/organon/error_honesty.test.ts", "test/organon/walk_fixes.test.ts", "test/organon/walk_ledger.test.ts", "test/organon/walk_ledger.test.ts",
  "test/organon/ledger.test.ts", "test/organon/ledger_laundering.test.ts", "test/organon/ledger_refragmentation.test.ts",
  "test/organon/durable_ledger.test.ts",
]

const proc = Bun.spawnSync(["bun", "test", "--timeout", "60000", ...IN_SCOPE], { cwd: PKG_ROOT, env: { ...process.env, NO_COLOR: "1" } })
const out = proc.stdout.toString() + proc.stderr.toString()
const m = out.match(/\s(\d+)\s+pass[\s\S]*?(\d+)\s+fail[\s\S]*?Ran\s+(\d+)\s+tests\s+across\s+(\d+)\s+files/)
const pass = m ? Number(m[1]) : -1
const fail = m ? Number(m[2]) : -1
const files = m ? Number(m[4]) : -1
const wallCount = readdirSync(path.join(PKG_ROOT, "test", "walls")).filter((f) => f.endsWith(".test.ts")).length

const state = {
  protocol: "battery-state",
  asOf: process.env.STATE_LABEL ?? "2026-07-04",
  scope: "in-scope (walls + studio + ledger/clocks/durable)",
  walls: { green: fail === 0 ? wallCount : -1, total: wallCount },
  battery: { pass, fail, files },
  green: fail === 0,
}
writeFileSync(path.join(PKG_ROOT, "data", "studio", "battery-state.json"), JSON.stringify(state, null, 2) + "\n")
console.log(`battery-state: ${pass} pass / ${fail} fail across ${files} files · walls=${wallCount} · green=${fail === 0}`)
