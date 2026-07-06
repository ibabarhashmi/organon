/**
 * WALL — F-CONTINUE. "A log may never simply stop." A trailed-off log (a session that ends mid-work with no recorded
 * state) is a wall violation, not a shrug. This wall proves the MECHANISM now (a marker-less doc FAILS, a marker-
 * terminated doc PASSES — positive control), hard-requires a recognized state marker at the tail of every F-CONTINUE-era
 * BuildLog's LATEST committed revision, and DISCLOSES the pre-rule legacy logs (grandfathered — the rule is adopted
 * forward, never by editing history). Named counterexample: a SYNTHETIC trailed-off document — NOT V7, which (contrary
 * to the Warranty blueprint's stale premise) demonstrably ends in a marker (ADVANCE); the wall records that as evidence.
 */
import { describe, test, expect } from "bun:test"
import { REPO_ROOT } from "../../src/organon/frozen"
import { Marker } from "../../src/studio/marker"

// F-CONTINUE-era logs: authored under the rule → their latest committed revision MUST end in a state marker.
const F_CONTINUE_LOGS = ["sprint/sprint-result/BUILDLOG-V8-WARRANTY.md", "sprint/sprint-result/BUILDLOG-V9-DATAPLANE.md", "sprint/sprint-result/BUILDLOG-V10-ENDUSER.md", "sprint/sprint-result/BUILDLOG-V11-SPINE.md", "sprint/sprint-result/BUILDLOG-V12-REACH.md"]
// Pre-rule logs: disclosed, not failed. V7 is listed to record — as evidence — that it ends in a marker (reconciliation).
const LEGACY_LOGS = [
  "sprint/sprint-result/BUILDLOG-V3-STUDIO.md",
  "sprint/sprint-result/BUILDLOG-V4-HARDENING.md",
  "sprint/sprint-result/BUILDLOG-V5-LAUNCH.md",
  "sprint/sprint-result/BUILDLOG-V6-CONVERGENCE.md",
  "sprint/sprint-result/BUILDLOG-V7-TRANSPLANT.md",
]

function latestCommitted(rel: string): string | null {
  const h = Bun.spawnSync(["git", "log", "-1", "--format=%H", "--", rel], { cwd: REPO_ROOT }).stdout.toString().trim()
  if (!h) return null // untracked / no history yet
  return Bun.spawnSync(["git", "show", `${h}:${rel}`], { cwd: REPO_ROOT }).stdout.toString()
}

describe("WALL log_terminal_marker — a log may never simply stop (F-CONTINUE)", () => {
  test("the marker predicate PASSES a marked doc and FAILS a trailed-off doc (positive control)", () => {
    const trailedOff = "## Phase 1\nWe began the forensics and then\n" // ends mid-work, no state — the named failure
    const marked = trailedOff + "\n" + Marker.sessionMarker("REPEAT", "run the candidate matrix")
    expect(Marker.endsInStateMarker(trailedOff).ok).toBe(false) // a silence is caught
    expect(Marker.endsInStateMarker(marked).ok).toBe(true)
    expect(Marker.endsInStateMarker(marked).marker).toBe("REPEAT")
    // every strong state word is recognized; a weak/common word (a bare "pending"/"go" in prose) is NOT a marker
    for (const s of Marker.STATES) expect(Marker.endsInStateMarker(`work\n**SESSION MARKER —** \`${s}\` · next intended step: x`).ok).toBe(true)
    expect(Marker.endsInStateMarker("we are still pending review and will go soon").ok).toBe(false)
  })

  test("every F-CONTINUE-era BuildLog's latest committed revision ends in a state marker (hard)", () => {
    for (const rel of F_CONTINUE_LOGS) {
      const content = latestCommitted(rel)
      if (content === null) {
        console.log(`  (log_terminal_marker) ${rel}: UNTRACKED — no committed revision yet (F-CONTINUE: commit to enable)`)
        continue
      }
      const r = Marker.endsInStateMarker(content)
      if (!r.ok) console.log(`  (log_terminal_marker) ${rel}: TRAILED OFF — latest committed revision carries no state marker (F-CONTINUE violation)`)
      expect(r.ok).toBe(true)
    }
  })

  test("legacy (pre-F-CONTINUE) logs are disclosed + grandfathered; V7 is recorded as ending in a marker (reconciliation)", () => {
    for (const rel of LEGACY_LOGS) {
      const content = latestCommitted(rel)
      if (content === null) {
        console.log(`  (log_terminal_marker) legacy ${rel}: untracked`)
        continue
      }
      const r = Marker.endsInStateMarker(content)
      console.log(`  (log_terminal_marker) legacy ${rel}: ${r.ok ? `ends in marker "${r.marker}"` : "prose terminal (pre-rule, grandfathered — adopted forward)"}`)
      if (rel.includes("V7")) {
        // the reconciliation, asserted: V7 did NOT trail off — it ends in a recognized marker (ADVANCE). The blueprint's
        // "Phases 2–4 never ran / the log trailed off" premise is contradicted by V7's own committed terminal.
        expect(r.ok).toBe(true)
      }
    }
  })
})
