/**
 * ORGΛNON — THE RECKONING SPRINT, Phase 3(d). Restore the committed cadence BASELINE + a committed cycle history for the
 * V32 23-trial lineage — W-CAD03's PROPER fix (V32 deleted the committed baseline to escape a wall-clock dependency; the
 * determinism-preserving fix is to FREEZE TIME, not to delete coverage). The monitoring block is then proven END-TO-END from
 * a committed artifact (not a constructed in-test view) at a FROZEN `now`. Trials are written to a THROWAWAY dir so the pinned
 * 23-trial ledger (S82(b)) is untouched. The lineage is NOT rendered by any live-clock test (strategy_check is pinned to the
 * V31 lineage), so no /check render gains a wall-clock thesis-age — the W-CAD03 hazard stays closed.
 * Run: bun run script/honesty/reckon-monitoring-fixture.ts
 */
import { existsSync, rmSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { Monitor } from "../../src/strategy/monitor"

const ID = "040301c26de44c9ef869d3cab8af582e82f6bda4ac63a0dfd8abf4c62586250c"
const NOW = Date.parse("2026-07-13T00:00:00Z")
const throwaway = mkdtempSync(path.join(tmpdir(), "reckon-mon-trials-"))

// clean any prior committed monitoring artifacts for this lineage (idempotent)
for (const f of [path.join(Monitor.FIXTURE_BASELINE_DIR, `${ID}.json`), path.join(Monitor.FIXTURE_CYCLE_DIR, `${ID}.jsonl`)]) if (existsSync(f)) rmSync(f)

const dirs = { baselineDir: Monitor.FIXTURE_BASELINE_DIR, cycleDir: Monitor.FIXTURE_CYCLE_DIR, trialDir: throwaway, skipLock: true }

// cycle 1 — pins the committed baseline (governance classes included — MR3 shape). captureHead A.
const c1 = await Monitor.cycle(ID, NOW, "2026-07-13T00:00:00Z", { ...dirs, captureHead: "MON-HEAD-A" })
// cycle 2 — a fresh confirmed boundary (captureHead B) → deltas rendered against the committed baseline.
const c2 = await Monitor.cycle(ID, NOW, "2026-07-14T00:00:00Z", { ...dirs, captureHead: "MON-HEAD-B" })

const v = Monitor.viewOf(ID, dirs)
console.log("── RECKON — the committed monitoring artifact (W-CAD03 proper fix) ──")
console.log(`  baseline    : ${"error" in c1 ? c1.error : c1.baselineHash?.slice(0, 12)} (committed to fixtures/baselines)`)
console.log(`  cycles      : ${Monitor.history(ID, Monitor.FIXTURE_CYCLE_DIR).length} committed to fixtures/cycles`)
console.log(`  fresh cycle : ${"error" in c2 ? c2.error : `${c2.deltas.length} deltas · fresh=${c2.fresh}`}`)
console.log(`  view        : baseline="${v?.baselineLine.slice(0, 60)}…" · ${v?.deltaLines.length ?? 0} delta lines`)
console.log(`  verify      : ${Monitor.verify(ID, Monitor.FIXTURE_CYCLE_DIR).ok ? "OK" : "FAIL"} (the committed cycle chain re-hashes on a clone)`)
