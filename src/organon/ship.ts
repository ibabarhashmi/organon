/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 1: THE SHIP GATE (S151–S156, D75). NO NEW LAW (a fifth sprint).
 *
 * THE DIAGNOSIS: V39 broke its own record in four places — a prose treeHash shipped (S143), the clone never ran (S144),
 * verify's third sub-check vanished again (S114), ten origin-less walls landed (S108) — and every one of those walls is
 * UNIT-TESTED and NONE was run against the artifact the sprint actually shipped. X-REACH(a): a check that cannot fail WHERE
 * IT MATTERS is not a check. Marker.validate passes its test; nobody ran Marker.validate(the_real_marker).
 *
 * THE FIX — the move this project has made five times (the Act is derived · "green" is derived · `published` is derived ·
 * ONE State.deviations() producer): a PROGRAM THAT WILL NOT WRITE. Ship.gate() runs every wall against THIS sprint's REAL
 * artifacts. Ship.emit() is the ONE writer: it writes the full build log iff the gate PASSES, and otherwise writes a REFUSAL
 * to the SAME path (RP-2 — no --force, no second door). A build log that exists while a wall failed is a Halt; the refusal
 * IS the record, and the next audit audits the refusal.
 *
 * THE RECURSION (PART A′ #1): "who ships the ship gate?" — the proof is NOT a unit test. The positive control mutates the
 * REAL marker, runs the REAL emit command, and shows no build log is produced (RP-1). A ship gate proven only in the battery
 * would be this project's oldest mistake, for the fifth time, wearing the uniform of its own cure.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"
import { Marker } from "../studio/marker"
import { Clone } from "./clone"
import { Verify } from "./verify"
import { Falsify } from "./falsify"
import { Consistency } from "./consistency"

export namespace Ship {
  // ── BATTERY CONTINUITY (S156, K-7) — the cross-boundary check the within-sprint reconciliation never made ──
  // battery-continuity.json chains each sprint's TERMINAL battery pass. This sprint's baseline.prevFullPass MUST equal the
  // last chained terminal, or there is a Gap — the exact 1706→1738 discontinuity K-7 named (V38's marker vs V39's `prev`).
  export namespace Battery {
    export interface Baseline { prevSprint: string; prevFullPass: number; fullPass: number; added: number; removed: number }
    export interface ContinuityLedger { chain: { sprint: string; terminalFullPass: number }[] }
    export type Continuity = { ok: true; detail: string } | { ok: false; gap: { n: number; unexplained: string } }

    // pure, seedable — the previous terminal (the last chain entry) must equal this sprint's baseline.prevFullPass, AND the
    // within-sprint reconciliation (full === prev + added − removed) must hold. Either break is a Gap.
    export function continuityOf(baseline: Baseline, ledger: ContinuityLedger): Continuity {
      const last = ledger.chain[ledger.chain.length - 1]
      if (!last) return { ok: false, gap: { n: baseline.prevFullPass, unexplained: "no previous terminal recorded in battery-continuity.json — the chain is empty" } }
      if (baseline.prevFullPass !== last.terminalFullPass)
        return { ok: false, gap: { n: baseline.prevFullPass - last.terminalFullPass, unexplained: `baseline.prevFullPass ${baseline.prevFullPass} ≠ the previous terminal ${last.terminalFullPass} (${last.sprint}) — a cross-boundary discontinuity (K-7)` } }
      const expected = baseline.prevFullPass + baseline.added - baseline.removed
      if (baseline.fullPass !== expected)
        return { ok: false, gap: { n: baseline.fullPass - expected, unexplained: `fullPass ${baseline.fullPass} ≠ prev ${baseline.prevFullPass} + added ${baseline.added} − removed ${baseline.removed} = ${expected}` } }
      return { ok: true, detail: `prev terminal ${last.terminalFullPass} (${last.sprint}) === baseline.prevFullPass ${baseline.prevFullPass}; full ${baseline.fullPass} === prev + ${baseline.added} − ${baseline.removed} ✓` }
    }

    export function continuity(): Continuity {
      const baseline: Baseline = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "battery-baseline.json"), "utf8"))
      const ledger: ContinuityLedger = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "battery-continuity.json"), "utf8"))
      return continuityOf(baseline, ledger)
    }
  }

  // this sprint's new-wall floor — walls with id > this are V40's own (S151–S160). S155 checks they carry named origins;
  // an origin-less new wall is exactly K-4's ten walls that landed in ORIGIN_UNRECORDED while the arithmetic reconciled.
  export const NEW_WALL_FLOOR = 150

  export interface Artifacts {
    marker: Record<string, unknown> // the REAL terminal marker (Rollup.terminalMarker) — S152 runs Marker.validate on THIS
    terminalCommit: string // git HEAD — S153 compares the clone against it
    clone: { clonedCommit?: string | null; ran?: boolean } | null // the REAL pristine-clone transcript
    verify: Verify.Result // the REAL verify Result — S154 runs subcheckSetStable on THIS
    census: { newWallsInOu: string[] } // this sprint's new walls (id > NEW_WALL_FLOOR) that landed in ORIGIN_UNRECORDED
    battery: Battery.Continuity // S156 — the cross-boundary continuity result
    censusReconciliation: Consistency.CensusContinuity // VARIANT V41 (S161, L-1) — the census reconciliation, DISPLAYED
  }

  export type Refusal = { wall: string; artifact: string; value: string }
  export interface Check { wall: string; artifact: string; ok: boolean; detail: string }
  export type Result = { pass: true; checks: Check[] } | { pass: false; refusal: Refusal; checks: Check[] }

  // ── THE GATE — every wall run against THIS sprint's REAL artifacts (S152–S156). Returns the FIRST refusal (or PASS). ──
  export function gate(a: Artifacts): Result {
    const checks: Check[] = []
    const fail = (wall: string, artifact: string, value: string): Result => {
      checks.push({ wall, artifact, ok: false, detail: value })
      return { pass: false, refusal: { wall, artifact, value }, checks }
    }

    // S152 — Marker.validate on the ACTUAL terminal marker (a ⟨placeholder⟩ or prose in the treeHash slot → REFUSE).
    const mv = Marker.validate(a.marker, "terminal")
    if (!mv.ok) return fail("S152", "the terminal marker", `Marker.validate FAILED — missing [${mv.missing.join(", ")}] · invalid [${mv.invalid.join(" ; ")}]`)
    checks.push({ wall: "S152", artifact: "the terminal marker", ok: true, detail: `treeHash ${String(a.marker.treeHash).slice(0, 12)}… is a 40-hex git tree; verify object well-formed; no 'green' over a non-zero exit` })

    // S153 — the clone EXECUTES on this commit (absent or stale → REFUSE).
    if (!a.clone || !a.clone.ran) return fail("S153", "the fresh clone", "the clone was NOT run (K-2, twice owed) — a build log cannot honestly report a clone that did not execute")
    if (Clone.staleAgainst(a.clone.clonedCommit, a.terminalCommit)) return fail("S153", "the fresh clone", `the clone's clonedCommit ${String(a.clone.clonedCommit).slice(0, 12)}… ≠ this terminal commit ${a.terminalCommit.slice(0, 12)}… — a STALE clone battery (a prior sprint's)`)
    checks.push({ wall: "S153", artifact: "the fresh clone", ok: true, detail: `the clone ran on this commit ${a.terminalCommit.slice(0, 12)}…` })

    // S154 — verify's actual sub-check set vs DECLARED_SUBCHECKS (a silent removal → REFUSE).
    const ss = Verify.subcheckSetStable(a.verify)
    if (!ss.ok) return fail("S154", "verify's sub-check set", `the sub-check set diverged from DECLARED_SUBCHECKS — missing [${ss.missing.join(", ")}] · extra [${ss.extra.join(", ")}] ('G-2 never again', again — K-3)`)
    checks.push({ wall: "S154", artifact: "verify's sub-check set", ok: true, detail: `${a.verify.subchecks.length}/${Verify.DECLARED_SUBCHECKS.length} sub-checks present, none silently removed` })

    // S155 — this sprint's real new walls carry named origins (S108 at ship; else REFUSE).
    if (a.census.newWallsInOu.length > 0) return fail("S155", "the census (this sprint's new walls)", `${a.census.newWallsInOu.length} new wall(s) landed in ORIGIN_UNRECORDED without a named origin: [${a.census.newWallsInOu.join(", ")}] — S108 exists to make this structurally impossible (K-4)`)
    checks.push({ wall: "S155", artifact: "the census (this sprint's new walls)", ok: true, detail: "every new wall this sprint carries a named origin (0 in ORIGIN_UNRECORDED)" })

    // S156 — battery continuity with the PREVIOUS sprint's terminal marker (an unexplained gap → REFUSE).
    if (!a.battery.ok) return fail("S156", "the battery baseline", `a cross-boundary battery gap of ${a.battery.gap.n}: ${a.battery.gap.unexplained} (K-7)`)
    checks.push({ wall: "S156", artifact: "the battery baseline", ok: true, detail: a.battery.detail })

    // S161 (VARIANT V41, L-1) — the census reconciles in DISPLAYED prev + new − moved === now arithmetic. V40 left this in
    // prose; here it is run against the REAL census at emit time and a non-reconciling census REFUSES the log (the one
    // continuity V40 left un-mechanical is now mechanical, like every other). Circularity answered (A′ #5): the Ship Gate
    // checking the census it emits is the Ship Gate doing its one job — refusing to write a number that does not reconcile.
    const cr = a.censusReconciliation
    if (!cr.reconciles) return fail("S161", "the census reconciliation", `the census does NOT reconcile — ${cr.display}${cr.contradiction ? ` (${cr.contradiction.why})` : ""}; L-1 demands prev + new − moved === now, DISPLAYED not asserted`)
    checks.push({ wall: "S161", artifact: "the census reconciliation", ok: true, detail: `${cr.display} ✓ (displayed, run against the real census at emit time — L-1)` })

    return { pass: true, checks }
  }

  // collect THIS sprint's REAL artifacts (the emit path calls this, then gate). The marker is passed in (generated at emit
  // time); everything else is read from the committed tree. `verify` may be the full (with-bundle) Result when the emit
  // path has already run it — else the fast skipBundle Result (subcheckSetStable does not require the bundle to run).
  export function collectArtifacts(marker: Record<string, unknown>, terminalCommit: string, verify?: Verify.Result): Artifacts {
    let clone: Artifacts["clone"] = null
    try {
      const j = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "pristine-clone.json"), "utf8"))
      clone = { clonedCommit: j.clonedCommit, ran: true }
    } catch { clone = null }
    const census = Falsify.census()
    const newWallsInOu = census.rows.filter((r) => r.n > NEW_WALL_FLOOR && r.bucket === "ORIGIN_UNRECORDED").map((r) => r.id)
    return {
      marker,
      terminalCommit,
      clone,
      verify: verify ?? Verify.run({ skipBundle: true }),
      census: { newWallsInOu },
      battery: Battery.continuity(),
      censusReconciliation: Consistency.censusContinuityDisplay(), // S161 (V41) — run against the REAL census at emit
    }
  }

  // ── THE REFUSAL LOG (RP-2) — one artifact, the SAME path, no --force. When the gate refuses, THIS is the build log. ──
  export function refusalLog(refusal: Refusal, at: string): string {
    return [
      "# ORGΛNON — THE SHIP SPRINT (V40) — BUILD LOG REFUSED",
      "",
      "The Ship Gate REFUSED to emit a build log. A wall failed against this sprint's real artifacts, and `Rollup` will",
      "not write a build log that a wall would reject (S151, RP-2). **The refusal IS the record**, and the next audit audits it.",
      "",
      "```",
      `REFUSED:`,
      `  wall:     ${refusal.wall}`,
      `  artifact: ${refusal.artifact}`,
      `  value:    ${refusal.value}`,
      `  at:       ${at}`,
      "```",
      "",
      "No phase prose. No claims. No gate. There is no `--force`, and the refusal and the build log are the same file path.",
      "*An honest refusal is a better artifact than a dishonest success.*",
      "",
    ].join("\n")
  }

  // ── Ship.emit — THE ONE WRITER. Returns what it would write; the caller writes it to the SINGLE path. There is no path by
  // which both a full log and a refusal exist, and no --force parameter (a seeded --force anywhere in the tree FAILS S160/RP-2).
  export type Emission = { wrote: "log"; content: string; checks: Check[] } | { wrote: "refusal"; content: string; refusal: Refusal; checks: Check[] }
  export function emit(fullLogContent: string, artifacts: Artifacts, at: string): Emission {
    const g = gate(artifacts)
    if (g.pass) return { wrote: "log", content: fullLogContent, checks: g.checks }
    return { wrote: "refusal", content: refusalLog(g.refusal, at), refusal: g.refusal, checks: g.checks }
  }
}
