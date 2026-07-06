/**
 * ORGΛNON STUDIO — THE RUNNER'S GATE LOGIC (Explanation Phase 4; Rule X-RUN). ./organon.sh takes a stranger from a fresh
 * clone to the web door in ONE honest command — a prerequisite check → setup from the pinned lockfile → the pinned verify
 * set → an offline-honest refresh → the bounded TUI. This module is the PURE, testable core of that runner: the pinned
 * prerequisite enumeration, the pinned verify-set list, and — the load-bearing honesty (A′#5) — the LAUNCH-WEB gate:
 * enabled ONLY when the pinned gate list is demonstrably green; unmet → DISABLED with each unmet requirement rendered
 * beside it (never a dead button, never a launch over red). The shell script renders this; the traversal tests it directly.
 */
export namespace Launcher {
  // the U-PRISTINE prerequisite enumeration — system-provided items the runner CHECKS but never installs (X-RUN/A′#6).
  export interface Prerequisite { name: string; kind: "required" | "conditional"; why: string }
  export const PREREQUISITES: Prerequisite[] = [
    { name: "bun", kind: "required", why: "the runtime + test runner (the whole app + battery)" },
    { name: "python3", kind: "required", why: "the frozen byte-identical scientific sidecar (accrual/funding engines)" },
    { name: "git", kind: "required", why: "provenance + the append-only history walls" },
    { name: "python3.11", kind: "conditional", why: "ONLY for the parked fee-yield unblock (the discovery-panel env); not needed for the core battery" },
  ]
  export interface PrereqResult { name: string; kind: "required" | "conditional"; present: boolean; why: string }
  // check each prerequisite via an injected presence probe (the shell passes `command -v`; tests inject a fixture).
  export function checkPrerequisites(present: (name: string) => boolean): { results: PrereqResult[]; ok: boolean; missingRequired: string[] } {
    const results = PREREQUISITES.map((p) => ({ ...p, present: present(p.name) }))
    const missingRequired = results.filter((r) => r.kind === "required" && !r.present).map((r) => r.name)
    return { results, ok: missingRequired.length === 0, missingRequired }
  }

  // THE PINNED VERIFY SET (X-RUN) — the gate list, named in one place so a quiet narrowing is caught (it's printed in the
  // status table AND pinned here). The default is the FAST gate subset (the walls + the differentials); --full runs the
  // whole battery (organon-studio-test.sh). Each item maps to a test target the runner executes.
  export interface VerifyItem { id: string; label: string; target: string }
  export const PINNED_VERIFY_SET: VerifyItem[] = [
    { id: "walls", label: "the prevention/integrity walls (frozen byte-identity · gatekeeper v2 · U-SURFACE · leak · determinism · append-only)", target: "test/walls/" },
    { id: "why-panel", label: "the WHY panel (both registers · the fact-table census · the groundedness verifier)", target: "test/organon/why_panel.test.ts" },
    { id: "selection-door", label: "the selection door (the pick priced) + parity/identity", target: "test/organon/selection_door.test.ts test/organon/parity_identity.test.ts" },
    { id: "core-differentials", label: "the verdict + summary differentials + the capability matrix", target: "test/organon/summary_differential.test.ts test/organon/capability_matrix.test.ts" },
  ]
  export const FULL_VERIFY_TARGET = "organon-studio-test.sh"

  export interface VerifyResult { id: string; label: string; pass: boolean; detail: string }

  // THE LAUNCH-WEB GATE (X-RUN, A′#5) — the load-bearing honesty. LAUNCH WEB is enabled ONLY when every prerequisite is
  // present AND every pinned verify item passed. Otherwise it is DISABLED with each unmet requirement rendered beside it
  // (never a dead button; a soft-launch over red is impossible — the gate is derived from the results, never a flag).
  export function launchGate(prereq: { results: PrereqResult[] }, verify: VerifyResult[]): { enabled: boolean; unmet: string[] } {
    const unmet: string[] = []
    for (const p of prereq.results) if (p.kind === "required" && !p.present) unmet.push(`prerequisite MISSING: ${p.name} — ${p.why}`)
    for (const v of verify) if (!v.pass) unmet.push(`verify FAILED: ${v.label} (${v.detail})`)
    return { enabled: unmet.length === 0, unmet }
  }

  // render the STATUS TABLE (the TUI's STATUS view + the runner's status line). The verify set is PRINTED (a quiet
  // narrowing of the pinned set is visible here), the launch gate rendered with its reasons when disabled.
  // gate=null means the verify set was NOT run (a prerequisite-only check) — the gate is honestly "not yet evaluated",
  // never rendered as a dead/green button.
  export function statusTable(prereq: { results: PrereqResult[] }, verify: VerifyResult[], gate: { enabled: boolean; unmet: string[] } | null): string {
    const L: string[] = ["ORGΛNON — status"]
    L.push("  prerequisites:")
    for (const p of prereq.results) L.push(`    ${p.present ? "✓" : p.kind === "conditional" ? "○" : "✗"} ${p.name}${p.kind === "conditional" ? " (conditional)" : ""} — ${p.present ? "present" : p.kind === "conditional" ? "absent (only needed for a parked unblock)" : "MISSING (required)"}`)
    if (verify.length) {
      L.push("  pinned verify set:")
      for (const v of verify) L.push(`    ${v.pass ? "✓" : "✗"} ${v.label}${v.pass ? "" : ` — ${v.detail}`}`)
    }
    L.push("")
    if (gate === null) L.push("  LAUNCH WEB: not yet evaluated — run './organon.sh status' to run the pinned verify set and the gate.")
    else if (gate.enabled) L.push("  LAUNCH WEB: ENABLED — the pinned gate list is green; the web door is reachable.")
    else { L.push("  LAUNCH WEB: DISABLED — the requirements are not met:"); for (const u of gate.unmet) L.push(`      · ${u}`) }
    return L.join("\n")
  }
}
