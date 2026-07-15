/**
 * ORGΛNON — THE BACKFILL SPRINT (V43), Phase 1 (S183, N-4): THE CAPABILITY→VERDICT ISOLATION INVARIANT, RENDERED AND CHECKED.
 *
 * THE DIAGNOSIS (N-4): "captures move no verdict" rested on the scorecard bundle hash (9c1e7bd8 byte-identical) — an IMPLIED
 * invariant, never an explicit wall. newProductCapability:1 was declared honestly, but the guarantee that the capture/backfill
 * engines touch NO verdict path was only inferred from the bundle staying still. A bundle that happens to reproduce is not a
 * proof of isolation; a future capability could import a verdict producer and the bundle might still (coincidentally) reproduce.
 *
 * THE FIX: the isolation is a STRUCTURAL, checked invariant — a bidirectional import fence. No CAPABILITY engine (the REAL★
 * capture, the REAL-DERIVED backfill, the capture verb) imports a VERDICT-PATH module (the Stamp, the adjudicator, the
 * scorecard, the frozen loop), and no verdict-path module imports a capability engine. A capture cannot read a verdict, and a
 * verdict cannot depend on a capture — asserted by reading the import lines, not implied by a hash.
 *
 * Pure: reads the source files' import lines. No network.
 */
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"

export namespace Capability {
  // the CAPABILITY engines — the data-provider stones (V42 REAL★, V43 REAL-DERIVED) + the capture verb. They read live RPCs
  // and write hash-chained JSONL; they touch NO verdict path.
  export const CAPABILITY_ENGINES = ["src/plane/observe.ts", "src/plane/backfill.ts", "src/strategy/capture.ts"]
  // the VERDICT path — the modules whose output IS a scorecard / Stamp verdict (the frozen loop, the adjudicator, the Stamp,
  // the scorecard). A capability importing any of these could read or move a verdict.
  export const VERDICT_PATH = ["src/loop/loop.ts", "src/studio/stamp.ts", "src/studio/adjudicate.ts", "src/analytics/scorecard.ts"]

  // the import-target substrings that identify each side (a relative import like "../studio/stamp" or "../plane/backfill").
  const VERDICT_REFS = ["loop/loop", "studio/stamp", "studio/adjudicate", "analytics/scorecard"]
  const CAPABILITY_REFS = ["plane/observe", "plane/backfill", "strategy/capture"]

  function importLines(rel: string): string[] {
    const p = path.join(PKG_ROOT, rel)
    if (!existsSync(p)) return []
    return readFileSync(p, "utf8").split("\n").filter((l) => /^\s*import\b/.test(l))
  }

  export interface Isolation { isolated: boolean; violations: string[]; checked: { capabilities: number; verdictPath: number }; detail: string }

  // S183 — the bidirectional fence. A capability engine importing a verdict module, OR a verdict module importing a capability
  // engine, is a violation. Returns the violations (empty = isolated).
  export function verdictIsolation(): Isolation {
    const violations: string[] = []
    let caps = 0
    for (const cap of CAPABILITY_ENGINES) {
      if (!existsSync(path.join(PKG_ROOT, cap))) continue
      caps++
      for (const line of importLines(cap)) {
        for (const ref of VERDICT_REFS) {
          if (line.includes(ref)) violations.push(`${cap} imports a VERDICT-PATH module (${ref}) — a capability engine must not touch the verdict path (S183/N-4): ${line.trim()}`)
        }
      }
    }
    let vp = 0
    for (const vpMod of VERDICT_PATH) {
      if (!existsSync(path.join(PKG_ROOT, vpMod))) continue
      vp++
      for (const line of importLines(vpMod)) {
        for (const ref of CAPABILITY_REFS) {
          if (line.includes(ref)) violations.push(`${vpMod} (verdict path) imports a CAPABILITY engine (${ref}) — a verdict must not depend on a capture (S183/N-4): ${line.trim()}`)
        }
      }
    }
    const isolated = violations.length === 0
    return {
      isolated, violations, checked: { capabilities: caps, verdictPath: vp },
      detail: isolated
        ? `the capability→verdict fence holds: ${caps} capability engine(s) import 0 verdict-path modules, ${vp} verdict-path module(s) import 0 capability engines — RENDERED and CHECKED (not implied by the bundle hash)`
        : `the capability→verdict fence is BREACHED: ${violations.length} import edge(s) cross it`,
    }
  }

  // the render line for the gate/marker (S183) — the invariant STATED and its checked result.
  export function verdictIsolationLine(): string {
    const iso = verdictIsolation()
    return `capability→verdict isolation: ${iso.isolated ? "HELD" : "BREACHED"} — ${iso.detail}`
  }
}
