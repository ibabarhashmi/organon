/**
 * ORGΛNON — the SESSION STATE MARKER (Warranty Phase 0; Rule F-CONTINUE). "A log may never simply stop." Every working
 * session ends with an appended state marker (ADVANCE / REPEAT / REGRESS / STOP / CONTINUATION-PENDING + the next
 * intended step). This module is the single source of the marker vocabulary and the pure predicate the log_terminal_marker
 * wall enforces — a committed F-CONTINUE-era BuildLog whose tail carries no recognized marker is a trailed-off log, a
 * wall violation, not a shrug. Pre-rule legacy logs are disclosed + grandfathered (the rule is adopted forward, never by
 * editing history) — but note V7, contrary to a stale premise, DID end in a marker (ADVANCE): it is a positive example.
 */
export namespace Marker {
  // The STRONG decision vocabulary a session marker uses. Deliberately excludes weak/common words (GO / PENDING) so the
  // predicate has teeth: a marker is an explicit recorded STATE, not any prose that happens to contain a mood word.
  export const STATES = [
    "ADVANCE",
    "REPEAT",
    "REGRESS",
    "STOP",
    "CONTINUATION-PENDING",
    "CONVERGED-8",
    "CONVERGED-7",
    "CONVERGED-6",
    "CONVERGED-5",
    "CONVERGED-4",
    "CONVERGED-3",
    "CONVERGED-2",
    "CONVERGED",
    "NON-CONVERGENCE",
    "DONE-LOCALLY",
    "DONE",
  ] as const

  const RE = new RegExp(`\\b(${STATES.map((s) => s.replace(/-/g, "\\-")).join("|")})\\b`)

  // A document "ends in a state marker" iff one of its last `tail` non-empty lines carries a recognized STATE token.
  // We scan a tail window (not just the final line) because a marker is often a short section, not one trailing word.
  export function endsInStateMarker(text: string, tail = 40): { ok: boolean; marker: string | null } {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
    const window = lines.slice(-tail)
    for (let i = window.length - 1; i >= 0; i--) {
      const m = window[i].match(RE)
      if (m) return { ok: true, marker: m[1] }
    }
    return { ok: false, marker: null }
  }

  // The canonical session-marker line the F-CONTINUE-era logs append at the end of every working session.
  export function sessionMarker(state: (typeof STATES)[number] | string, next: string): string {
    return `**SESSION MARKER —** \`${state}\` · next intended step: ${next}`
  }

  // ── THE SHOWING SPRINT (V34, S90) — THE MACHINE-CHECKED MARKER SCHEMA ──────────────────────────────────────────────
  // X-SHOWN turns "be more careful" into a wall: a build-log marker missing a required slot FAILS the battery, not a
  // reviewer's attention. R-3 (the sharpened correction): the schema does not merely assert a slot is PRESENT — for the
  // three highest-value slots it checks STRUCTURE (a slot the agent can fill by typing is a slot the agent will fill by
  // typing). tree/commit must be hex; coverage must be a parseable N/M and, if short of full, NAME its reason; battery
  // must be a parseable pass/skip/fail shape. The tree hash's re-DERIVABILITY is checked by the caller (the wall runs
  // `git rev-parse HEAD^{tree}` and compares) — validate() never trusts a typed value it could re-compute.
  export const REQUIRED_SLOTS = {
    phase: ["pinsSha", "battery", "batteryDelta", "verifyOutput", "verifyCoverage", "goldenMoves", "controls"],
    terminal: ["treeHash", "commitSha", "pinsSha", "battery", "expect", "verifyOutput", "verifyCoverage", "goldenMoves"],
  } as const

  export function validate(m: Record<string, unknown>, kind: "phase" | "terminal"): { ok: boolean; missing: string[]; invalid: string[] } {
    const required = REQUIRED_SLOTS[kind] as readonly string[]
    const isEmpty = (v: unknown) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)
    const missing = required.filter((k) => isEmpty(m[k]))
    const invalid: string[] = []
    // R-3 structural checks — value, not presence
    if (m.treeHash !== undefined && !/^[0-9a-f]{40}$/.test(String(m.treeHash))) invalid.push("treeHash: not a 40-hex git tree object (a hand-typed value, not a re-derived hash)")
    if (m.commitSha !== undefined && !/^[0-9a-f]{7,40}$/.test(String(m.commitSha))) invalid.push("commitSha: not a hex sha")
    if (m.verifyCoverage !== undefined) {
      const cov = String(m.verifyCoverage)
      const frac = cov.match(/(\d+)\s*\/\s*(\d+)/)
      if (!frac) invalid.push("verifyCoverage: no parseable N/M coverage fraction (X-SHOWN(e))")
      else if (frac[1] !== frac[2] && !/because|absent|reason|monorepo|gitignored/i.test(cov)) invalid.push("verifyCoverage: a shortfall that names no reason is a proof that lies by omission (X-SHOWN(e))")
    }
    if (m.battery !== undefined && !/\d+\s*\/\s*\d+\s*\/\s*\d+/.test(String(m.battery))) invalid.push("battery: not a parseable pass/skip/fail shape")

    // ── THE REACH SPRINT (V35, S95) — the verify slot is a DERIVED OBJECT, and "green" is not a typed word ────────────
    // X-REACH(c): if the marker carries a `verify` object, it must have the shape { exitCode:number, subchecks:[...] },
    // AND a marker may NOT type the word "green" (in verifyOutput) for a command whose exitCode was non-zero. The
    // machine's observation is the authority; the prose may not assert a health the exit code contradicts.
    if (m.verify !== undefined) {
      const v = m.verify as { exitCode?: unknown; subchecks?: unknown }
      if (typeof v.exitCode !== "number") invalid.push("verify.exitCode: not a number (X-REACH(c): the verify slot is a derived object, not a sentence)")
      if (!Array.isArray(v.subchecks) || v.subchecks.length === 0) invalid.push("verify.subchecks: not a non-empty [{name,status,detail}] list")
      else if (!v.subchecks.every((s) => s && typeof (s as { name?: unknown }).name === "string" && typeof (s as { status?: unknown }).status === "string")) invalid.push("verify.subchecks: each entry needs {name, status}")
      if (typeof v.exitCode === "number" && v.exitCode !== 0 && /\bgreen\b/i.test(String(m.verifyOutput ?? "")))
        invalid.push(`verify: the marker types "green" but verify.exitCode is ${v.exitCode} — X-REACH(c): green is a derived value, not a typed word`)
    }

    return { ok: missing.length === 0 && invalid.length === 0, missing, invalid }
  }
}
