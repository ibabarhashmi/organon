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
}
