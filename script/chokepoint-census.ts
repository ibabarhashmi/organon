/**
 * ORGΛNON — the CHOKEPOINT CENSUS driver (Data-Plane Phase 0; Rule D-CHOKE, A′#6). Enumerates every existing control →
 * enforcement point → demonstrated refusal (evidence hash), catches a SEEDED dangling control (the census's own positive
 * control), and EXECUTES the runtime chokepoint scripts to their refusal (publish-preflight → exit 1) so the census
 * proves the controls are IN THE WAY, not merely present. Writes data/studio/census-v9.json. Run:
 *   bun run script/chokepoint-census.ts
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdtempSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Census } from "../src/studio/census"

const D = path.join(PKG_ROOT, "data", "studio")

// ── 1. the static census over every control ────────────────────────────────────────────────────────────────────────
const res = Census.run()
console.log(Census.render(res))
console.log("")

// ── 2. the census's OWN positive control — a seeded dangling control MUST be caught (A′#6) ──────────────────────────
const scratchDir = mkdtempSync(path.join(tmpdir(), "organon-census-"))
const scratchRel = path.relative(PKG_ROOT, path.join(scratchDir, "decorative_control.test.ts"))
// a real-looking test file with an assertion body that carries NO bite pattern (nothing that makes it refuse a violation)
writeFileSync(path.join(PKG_ROOT, scratchRel), `import { test } from "bun:test"\ntest("decorative — asserts a truism, never refuses a violation", () => { const x = 1 + 1; if (x !== 2) console.log("never") })\n`)
const seeded = Census.seededDanglingControl(scratchRel)
const seededRow = Census.evaluate(seeded)
const seededCaught = seededRow.dangling === true
console.log(`seeded dangling control → ${seededCaught ? "CAUGHT ✓ (census bites — not a rubber stamp)" : "MISSED ✗ (census is a rubber stamp — HALT)"}`)
rmSync(scratchDir, { recursive: true, force: true })

// ── 3. execute the runtime chokepoint scripts to their REFUSAL (the demonstrated in-the-way proof) ─────────────────
interface ChokepointExec { id: string; cmd: string; expectExit: number; actualExit: number; refused: boolean; note: string }
const chokepoints: ChokepointExec[] = []

// publish-preflight WITHOUT consent must exit 1 (REFUSED) — the identity+consent chokepoint in the way
{
  const r = spawnSync("bun", ["run", "script/publish-preflight.ts"], { cwd: PKG_ROOT, encoding: "utf8", env: { ...process.env, ORGANON_PUBLISH_CONSENT: "" } })
  const refused = r.status === 1
  chokepoints.push({ id: "publication-gate", cmd: "bun run script/publish-preflight.ts (no consent)", expectExit: 1, actualExit: r.status ?? -1, refused, note: refused ? "REFUSED without consent (chokepoint in the way, L-2P self-refusal)" : `UNEXPECTED exit ${r.status} — the publication chokepoint did not refuse` })
}

for (const c of chokepoints) console.log(`chokepoint: ${c.id} → ${c.cmd} → exit ${c.actualExit} (${c.refused ? "REFUSED ✓" : "DID NOT REFUSE ✗"})`)

// ── 4. persist the census ─────────────────────────────────────────────────────────────────────────────────────────
const censusTrue = res.ok && seededCaught && chokepoints.every((c) => c.refused)
const out = {
  protocol: "chokepoint-census-v9",
  at: "2026-07-04",
  gate: "CENSUS-TRUE",
  rule: "D-CHOKE — a control is not DONE until the path it governs is shown REFUSING without it (A′#6)",
  controlCount: res.controlCount,
  danglingCount: res.dangling.length,
  dangling: res.dangling.map((r) => ({ id: r.id, reason: r.reason })),
  seededControl: { id: seeded.id, caught: seededCaught, note: "the census's positive control — a decorative control (no bite) MUST be flagged dangling; a census that misses it is a rubber stamp" },
  chokepointsExecuted: chokepoints,
  rows: res.rows,
  censusTrue,
}
writeFileSync(path.join(D, "census-v9.json"), JSON.stringify(out, null, 2) + "\n")

console.log("")
console.log(`CENSUS-TRUE: ${censusTrue}  (controls ${res.controlCount}, dangling ${res.dangling.length}, seeded-caught ${seededCaught}, chokepoints-refused ${chokepoints.filter((c) => c.refused).length}/${chokepoints.length})`)
console.log(`written: data/studio/census-v9.json`)
if (!existsSync(path.join(D, "census-v9.json"))) process.exit(1)
process.exit(censusTrue ? 0 : 1)
