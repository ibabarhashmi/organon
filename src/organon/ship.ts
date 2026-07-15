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
import { Pins } from "./pins"
import { Freshness } from "./freshness"
import { State } from "./state"
import { Rollup } from "./rollup"
import { Claim } from "./claim"
import { Continuity } from "./continuity"
import { HistoricalAct } from "./historical"
import { Capability } from "./capability"

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
    // PROVENANCE V42 (S169–S174) — the IDENTITY artifacts: the emitted pins-sha (from the marker), the per-field freshness
    // audit (COMPUTED / carried:{reverified}), the FULL-battery delta, the census identity, and the machine-readable
    // deviationStates — each an IDENTITY property the SHAPE-only gate never checked.
    pinsEmitted: string // marker.pinsSha — S169 compares it to sha256(this sprint's pins file)
    freshness: Freshness.Class[] // S170 — every generated field COMPUTED or carried-and-reverified
    batteryDelta: { full: boolean; pass: number } // S171 — batteryDelta describes the FULL battery, not the curated subset
    batteryFullDelta: Consistency.FullDelta // S172 — the FULL-battery delta across the boundary (DISPLAYED, seedable at emit)
    censusIdentity: Consistency.CensusIdentity // S173 — the full census identity (DISPLAYED, seedable at emit)
    deviationStateIds: string[] // S174/MR20 — the ids State.deviations() enumerates
    // BACKFILL V43 (S180–S183) — CONTINUITY MADE TOTAL: the verify sub-check names its domain (S180); every cross-sprint
    // countable reconciles through the ONE reconciler AND no number moved unrouted vs the prev marker (S181); a historical
    // act's hash is stable-or-carried (S182); the capability→verdict isolation fence holds (S183).
    verifyDomainsStated: boolean // S180 — every declared sub-check names its domain (none overclaims the full battery)
    continuity: Continuity.Verdict // S181 — the continuity-total check (every countable reconciled + marker-diff clean)
    searchHashStable: HistoricalAct.Verdict // S182 — the D56 SEARCH's rendered hash is stable-or-carried
    capabilityIsolation: Capability.Isolation // S183 — the capability→verdict import fence
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

    // ── PROVENANCE V42 (S169–S174) — THE GATE GRADUATES FROM SHAPE TO IDENTITY. The three defects V41 sailed through were
    // each SHAPE-VALID and IDENTITY-WRONG; these walls check identity AND freshness, on the REAL emit artifacts. ──

    // S169 (M-1, W-PR01) — the emitted pins-sha must equal sha256(THIS sprint's pins file, frozen Phase 0); a parent-pin
    // emission (a prior head's sha), or a pins file edited after Phase 0 (self-consistency broken), REFUSES the log. Two
    // independent paths to the value: the header via Pins.head, the gate via a direct file read — so a stale head cannot pass.
    const idv = Pins.verifyEmitted(a.pinsEmitted)
    if (!idv.ok) return fail("S169", "the emitted pins-sha", `${idv.reason} — a hash never compared to its own source is a SHAPE check wearing an identity check's clothes (X-REACH(a))`)
    checks.push({ wall: "S169", artifact: "the emitted pins-sha", ok: true, detail: idv.detail })

    // S170 (M-2, W-PR02) — every generated field is COMPUTED or carried:{from,why,reverified}; a carried claim is re-run and
    // matched (a carry that would recompute differently is a lie), and an untagged prior-sprint string REFUSES.
    const fr = Freshness.honest(a.freshness)
    if (!fr.ok) return fail("S170", "the generated fields (freshness)", `a carried claim would recompute differently — staleness cannot be BLESSED by a tag: ${fr.lies.join(" · ")} (M-2, RP-2)`)
    checks.push({ wall: "S170", artifact: "the generated fields (freshness)", ok: true, detail: `${fr.computed} COMPUTED · ${fr.carried} carried-and-reverified · 0 stale-carried, 0 untagged prior-sprint echoes` })

    // S171 (M-3, W-PR03) — batteryDelta describes the FULL battery (battery-baseline), not the curated 1281-subset.
    const fd = a.batteryFullDelta
    if (!a.batteryDelta.full || a.batteryDelta.pass !== fd.now) return fail("S171", "the batteryDelta", `the batteryDelta describes the WRONG battery — pass ${a.batteryDelta.pass} (full:${a.batteryDelta.full}) ≠ the FULL battery ${fd.now}; V41 emitted the CURATED 1281-subset (M-3, RP-4 required the full battery)`)
    checks.push({ wall: "S171", artifact: "the batteryDelta", ok: true, detail: `batteryDelta.pass ${a.batteryDelta.pass} === the FULL battery ${fd.now} (full:true, not the curated subset)` })

    // S172 (M-4, W-PR04) — the cross-sprint battery continuity is DISPLAYED and reconciles: prev + added − removed === now.
    if (!fd.reconciles) return fail("S172", "the battery continuity", `the FULL-battery delta does not reconcile across the boundary — ${fd.display}${fd.contradiction ? ` (${fd.contradiction.why})` : ""} (M-4)`)
    checks.push({ wall: "S172", artifact: "the battery continuity", ok: true, detail: `${fd.display} ✓ (displayed across the sprint boundary)` })

    // S173 (M-5, W-PR05) — the FULL census identity is DISPLAYED and closes: demonstrated + weak + exempt + originUnrecorded === total.
    const ci = a.censusIdentity
    if (!ci.reconciles) return fail("S173", "the census identity", `the census identity does not close — ${ci.display}${ci.contradiction ? ` (${ci.contradiction.why})` : ""} (M-5)`)
    checks.push({ wall: "S173", artifact: "the census identity", ok: true, detail: `${ci.display} ✓ (the full partition displayed)` })

    // S174 (M-6/MR20, W-PR06) — every pinned deviation (incl D80–D86) appears in the machine-readable deviationStates.
    const REQUIRED_DEVIATIONS = ["D80", "D81", "D82", "D83", "D84", "D85", "D86"]
    const missingDevs = REQUIRED_DEVIATIONS.filter((d) => !a.deviationStateIds.includes(d))
    if (missingDevs.length > 0) return fail("S174", "deviationStates", `pinned deviation(s) [${missingDevs.join(", ")}] absent from deviationStates — Phase 0 pinned them and the gate lists them, but the machine-readable state list under-enumerated (M-6/MR20)`)
    checks.push({ wall: "S174", artifact: "deviationStates", ok: true, detail: `every pinned deviation present incl D80–D86 (${a.deviationStateIds.length} states enumerated)` })

    // ── BACKFILL V43 (S180–S183) — CONTINUITY MADE TOTAL. V42 taught the gate IDENTITY; V43 makes the continuity discipline
    // TOTAL — one reconciler every countable routes through, the gate diffing the whole marker so a number cannot move
    // unrouted, on the REAL emit artifacts. ──

    // S180 (N-1, W-BF01) — the verify sub-check names its domain: no declared sub-check's name implies the FULL battery while
    // reading the curated subset (the last home of the 1281/1941 split). A name resolving to "full-battery" for a subset check REFUSES.
    if (!a.verifyDomainsStated) return fail("S180", "the verify sub-check names", `a verify sub-check's name implies the FULL battery while it reads the curated subset — the name must state its domain (curated-evidence-subset); the last home of the 1281/1941 split (N-1, DD-82)`)
    checks.push({ wall: "S180", artifact: "the verify sub-check names", ok: true, detail: `every declared sub-check names its domain (curated-evidence-subset-matches-committed — not "battery"); the full battery is reconciled through Continuity` })

    // S181 (N-2/F-1/RP-1, W-BF02) — every registered countable reconciles through the ONE reconciler AND no number moved vs the
    // prev marker that is neither reconciled nor exempted. THE SPRINT'S SPINE: the reconciler cannot be forgotten because the
    // gate counts the countables, not the diligence. A moved-but-unrouted countable REFUSES the log (proven on the emit path).
    if (!a.continuity.ok) return fail("S181", "the countable continuity", `continuity is NOT total: ${a.continuity.reason} (N-2/F-1/RP-1 — a discipline you can forget to apply is not a discipline; the gate counts the countables)`)
    checks.push({ wall: "S181", artifact: "the countable continuity", ok: true, detail: a.continuity.detail })

    // S182 (N-3, W-BF03) — a historical act's hash is stable or carried:{from}. The D56 SEARCH's rendered hash is its stable
    // immutable-core hash (not the drifting chain selfSha a578032b→d5147f8d); a drift without a tag REFUSES.
    if (!a.searchHashStable.ok) return fail("S182", "the historical-act hash", `${a.searchHashStable.reason} (N-3 — the one carried hash that drifted, in the sprint about carried identity)`)
    checks.push({ wall: "S182", artifact: "the historical-act hash", ok: true, detail: a.searchHashStable.detail })

    // S183 (N-4, W-BF04) — the capability→verdict isolation fence holds: no capture/backfill engine imports a verdict-path
    // module, no verdict-path module imports a capability engine. RENDERED and CHECKED, not implied by the bundle hash.
    if (!a.capabilityIsolation.isolated) return fail("S183", "the capability→verdict fence", `${a.capabilityIsolation.detail} — a capture must move no verdict, asserted structurally not implied by 9c1e7bd8 (N-4): ${a.capabilityIsolation.violations[0]}`)
    checks.push({ wall: "S183", artifact: "the capability→verdict fence", ok: true, detail: a.capabilityIsolation.detail })

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
    // PROVENANCE V42 (S171) — the batteryDelta from the live claim (full battery, not the curated subset).
    const bd = Claim.producer("battery").value as { pass: number; full?: boolean }
    return {
      marker,
      terminalCommit,
      clone,
      verify: verify ?? Verify.run({ skipBundle: true }),
      census: { newWallsInOu },
      battery: Battery.continuity(),
      censusReconciliation: Consistency.censusContinuityDisplay(), // S161 (V41) — run against the REAL census at emit
      // PROVENANCE V42 (S169–S174) — the IDENTITY artifacts, from the REAL marker + live producers.
      pinsEmitted: String(marker.pinsSha), // S169 — the emitted pins-sha, compared to sha256(this sprint's pins file)
      freshness: Rollup.freshnessAudit(), // S170 — the per-field COMPUTED / carried-and-reverified audit
      batteryDelta: { full: bd.full === true, pass: bd.pass }, // S171 — the FULL battery, not the curated subset
      batteryFullDelta: Consistency.batteryFullDelta(), // S172 — the FULL-battery delta across the boundary
      censusIdentity: Consistency.censusIdentity(), // S173 — the full census identity
      deviationStateIds: State.deviations().map((d) => d.id), // S174/MR20 — the enumerated deviation ids
      // BACKFILL V43 (S180–S183) — the continuity-total artifacts, from the live producers.
      verifyDomainsStated: Verify.DECLARED_SUBCHECKS.every((n) => Verify.nameStatesItsDomain(n)), // S180
      continuity: Continuity.checkWithMarker(marker), // S181 — every countable reconciled + snapshot diff + RAW-marker leaf coverage (red-team hardening)
      searchHashStable: searchHashVerdict(), // S182 — the D56 SEARCH's rendered hash is stable-or-carried
      capabilityIsolation: Capability.verdictIsolation(), // S183 — the capability→verdict import fence
    }
  }

  // S182 — the D56 SEARCH's rendered hash (from the live d33 claim) must be its stable immutable-core hash. When no redesign
  // is recorded (a pre-Family checkout), there is nothing rendered and nothing can drift → ok.
  function searchHashVerdict(): HistoricalAct.Verdict {
    const d33 = Claim.producer("d33").value as { redesignSearchHashes?: string[] }
    const rendered = d33.redesignSearchHashes?.[0]
    if (!rendered) return { ok: true, detail: "no test-redesign SEARCH rendered (a pre-Family checkout) — nothing to drift" }
    return HistoricalAct.verifyFile("test-redesign-search.json", rendered)
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
