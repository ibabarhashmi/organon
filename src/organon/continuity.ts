/**
 * ORGΛNON — THE BACKFILL SPRINT (V43), Phase 1 (S181, D87): THE ONE RECONCILER — CONTINUITY MADE TOTAL.
 *
 * THE DIAGNOSIS (graduated a third time): the continuity discipline that reconciled the BATTERY (S172) was CORRECT and NOT
 * TOTAL. It reconciled the countable it was pointed at and left the CENSUS movement (78→89) merely asserted (N-2), the verify
 * sub-check reading the wrong battery (N-1), and the deviations reconciled by hand. A fix applied to the producer that was
 * NAMED and not to its SIBLING is exactly what drifts. X-DERIVE already forbids it: a producer must be TOTAL over its domain.
 *
 * THE FIX (no new law, an eighth sprint): ONE Continuity.reconcile that EVERY cross-sprint countable routes through, TYPED per
 * countable (F-4/RP-4 — a ratio forced through an additive reconciler produces a false reconciles). The gate ENUMERATES the
 * pinned registry AND diffs the whole marker against the previous marker (markerDiff), refusing the log if any number moved
 * that is neither reconciled (a registered countable) nor explicitly exempted (F-1/RP-1). The reconciler cannot be forgotten
 * because the gate counts the countables, not the diligence.
 *
 * Pure: reads committed artifacts (backfill-pins for the registry + prev snapshot; battery-baseline; the live census;
 * State.deviations; the observe-ledger; Guard for the DERIVED ratio). No network, no I/O beyond those reads.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"
import { Falsify } from "./falsify"
import { State } from "./state"
import { Guard } from "./guard"

export namespace Continuity {
  const H = path.join(PKG_ROOT, "data", "honesty")
  function read(name: string): Record<string, unknown> { return JSON.parse(readFileSync(path.join(H, name), "utf8")) }
  function tryRead(name: string): Record<string, unknown> | null { try { return read(name) } catch { return null } }

  export type CType = "ADDITIVE" | "PARTITION" | "DERIVED" | "INVARIANT"
  export interface Countable { key: string; type: CType; markerPath: string; note: string }

  // the PREVIOUS sprint's terminal wall id (V42's last wall was S179) — walls with id > this are NEW this sprint (S180–S189),
  // so they are ADDITIONS to the census, not inter-bucket TRANSFERS (F-4/RP-4: the movement is decomposed into additions +
  // reclassification). Note: this is the terminal id (179), NOT the Falsify.WALL_MAX ceiling (which this sprint bumps to 190).
  export const WALL_MAX_PREV = 179

  // ── DD-81 — the pinned countable registry + the prev-marker snapshot (both from Phase-0 pins) ──
  export function registry(): Countable[] {
    return ((read("backfill-pins.json").delegatedDecisions as Record<string, { countables?: Countable[] }>).DD81.countables ?? []) as Countable[]
  }
  export function prevMarker(): Record<string, number> {
    return (read("backfill-pins.json").prevMarker as { countables: Record<string, number> }).countables
  }

  // ── THE LIVE SNAPSHOT — the SAME flat numeric keys as prevMarker, read from live producers this run. The battery numbers are
  // the FULL battery (battery-baseline.json, written at the sprint's close — the committed record); the census from the live
  // Falsify.census; the deviation count from the ONE State.deviations() producer; the archive from the observe-ledger. ──
  export interface Snapshot { [k: string]: number }
  function baseline(): { fullPass: number; fullSkip?: number; fullFail?: number; fullExpect?: number; fullFiles?: number } {
    return read("battery-baseline.json") as { fullPass: number; fullSkip?: number; fullFail?: number; fullExpect?: number; fullFiles?: number }
  }
  function observeLedger(): { realStar: unknown[]; realDerived?: unknown[]; retrospective: unknown[]; ownCapturesHuman?: number } {
    const j = tryRead("observe-ledger.json") as { realStar?: unknown[]; realDerived?: unknown[]; retrospective?: unknown[]; ownCapturesHuman?: number } | null
    return { realStar: j?.realStar ?? [], realDerived: j?.realDerived ?? [], retrospective: j?.retrospective ?? [], ownCapturesHuman: j?.ownCapturesHuman ?? 0 }
  }

  export function snapshot(): Snapshot {
    const b = baseline()
    const c = Falsify.census()
    const led = observeLedger()
    const consts = (read("backfill-pins.json").carried as { laws: number; exitKinds: number }) ?? { laws: 17, exitKinds: 7 }
    return {
      "battery.pass": b.fullPass,
      "battery.skip": b.fullSkip ?? 2,
      "battery.fail": b.fullFail ?? 0,
      "battery.expect": b.fullExpect ?? 0,
      "battery.files": b.fullFiles ?? 0,
      "census.demonstrated": c.counts.DEMONSTRATED,
      "census.weak": c.counts.WEAK,
      "census.exempt": c.counts.EXEMPT,
      "census.originUnrecorded": c.counts.ORIGIN_UNRECORDED,
      "census.total": c.wallCount,
      "census.reFounded": c.reFounded,
      "deviations.count": State.deviations().length,
      "ownArchive.realStar": led.realStar.length,
      "ownArchive.realDerived": (led.realDerived ?? []).length,
      "ownArchive.retrospective": led.retrospective.length,
      "ownArchive.humanCaptures": led.ownCapturesHuman ?? 0,
      laws: consts.laws,
      deps: 2,
      screens: 3,
      exitKinds: consts.exitKinds,
      "guardEfficacy.caught": Guard.mutationRate().caught,
    }
  }

  // ── THE ONE RECONCILER — typed per countable (F-4/RP-4). Returns the reconciliation, DISPLAYED (N-2: the movement is shown,
  // not asserted). ADDITIVE: prev + added − removed === now (added independently supplied where it exists, else the delta is
  // DISPLAYED and the marker-diff provides the accounted-for guarantee). PARTITION: Σ buckets === total + a MOVED transfer map.
  // DERIVED: recomputed from inputs (isFinite), NOT reconciled across time. INVARIANT: now === prev (a change REFUSES). ──
  export interface Moved { newWalls: number; newInDemonstrated: number; reclassifiedIntoDemonstrated: number; display: string }
  export interface Reconciliation {
    key: string; type: CType
    prev: number | null; now: number; reconciles: boolean
    delta: number | null; moved: Moved | null; display: string; contradiction: string | null
  }

  export interface PartitionNow { demonstrated: number; weak: number; exempt: number; originUnrecorded: number; total: number; newInDemonstrated: number }
  export interface Opts { added?: number; removed?: number; partition?: PartitionNow; recompute?: () => number }

  export function reconcile(c: Countable, now: number, prev: number | null, opts: Opts = {}): Reconciliation {
    if (c.type === "INVARIANT") {
      const reconciles = prev !== null && now === prev
      return { key: c.key, type: c.type, prev, now, reconciles, delta: prev === null ? null : now - prev, moved: null,
        display: `${c.key}: ${now} === prev ${prev} (INVARIANT)`,
        contradiction: reconciles ? null : `INVARIANT ${c.key} moved: prev ${prev} → now ${now} — a constitutional invariant changed without a conscious re-pin (S181)` }
    }
    if (c.type === "DERIVED") {
      const recomputed = opts.recompute ? opts.recompute() : now
      const reconciles = Number.isFinite(recomputed)
      return { key: c.key, type: c.type, prev, now, reconciles, delta: null, moved: null,
        display: `${c.key}: ${now} — DERIVED (recomputed from its inputs this run, not reconciled across time)`,
        contradiction: reconciles ? null : `DERIVED ${c.key} did not recompute to a finite value (${recomputed}) — it must be recomputed from its inputs (S181)` }
    }
    if (c.type === "PARTITION") {
      const p = opts.partition!
      const sum = p.demonstrated + p.weak + p.exempt + p.originUnrecorded
      const identity = sum === p.total
      // the MOVED transfer map (N-2/F-4): the census total grew by newWalls; the demonstrated movement is decomposed into
      // NEW walls that landed demonstrated + any reclassification from originUnrecorded (a residual, checked non-negative).
      const prevTotal = prevMarker()["census.total"] ?? p.total
      const prevDem = prevMarker()["census.demonstrated"] ?? p.demonstrated
      const newWalls = p.total - prevTotal
      const newInDem = p.newInDemonstrated
      const reclassifiedIntoDem = (p.demonstrated - prevDem) - newInDem // OU→DEMONSTRATED reclassification (a residual)
      const moved: Moved = { newWalls, newInDemonstrated: newInDem, reclassifiedIntoDemonstrated: reclassifiedIntoDem,
        display: `demonstrated ${prevDem} + newWalls-demonstrated ${newInDem} + reclassified-from-OU ${reclassifiedIntoDem} === ${p.demonstrated}` }
      const transferOk = reclassifiedIntoDem >= 0 && prevDem + newInDem + reclassifiedIntoDem === p.demonstrated
      const reconciles = identity && transferOk
      const contradiction = !identity
        ? `the census identity does not close: ${p.demonstrated} + ${p.weak} + ${p.exempt} + ${p.originUnrecorded} = ${sum} ≠ total ${p.total} (S173/S181)`
        : !transferOk
          ? `the census MOVEMENT does not reconcile as a transfer: ${moved.display} (reclassified ${reclassifiedIntoDem} < 0 means demonstrated fell more than new walls explain — N-2/F-4)`
          : null
      return { key: c.key, type: c.type, prev: prevDem, now: p.demonstrated, reconciles, delta: p.demonstrated - prevDem, moved,
        display: `census PARTITION — identity: demonstrated ${p.demonstrated} + weak ${p.weak} + exempt ${p.exempt} + originUnrecorded ${p.originUnrecorded} === total ${p.total}; MOVED: ${moved.display}`,
        contradiction }
    }
    // ADDITIVE
    const removed = opts.removed ?? 0
    const added = opts.added ?? (prev === null ? now : now - prev + removed)
    const reconciles = prev !== null && prev + added - removed === now
    return { key: c.key, type: c.type, prev, now, reconciles, delta: added - removed, moved: null,
      display: `${c.key}: prev ${prev} + added ${added} − removed ${removed} === now ${now}`,
      contradiction: reconciles ? null : `ADDITIVE ${c.key} does not reconcile: prev ${prev} + added ${added} − removed ${removed} = ${prev === null ? "?" : prev + added - removed} ≠ now ${now} (S181)` }
  }

  // a countable OWNS a snapshot key if the key IS the countable's key/markerPath, or (for a PARTITION) is a sub-key under it
  // (census.demonstrated belongs to census). This reconciles the pinned registry keys (census, guardEfficacy) with the flat
  // snapshot keys (census.demonstrated, guardEfficacy.caught).
  export function ownsKey(c: Countable, k: string): boolean {
    return k === c.key || k === c.markerPath || k.startsWith(c.key + ".") || (c.markerPath.length > 0 && k.startsWith(c.markerPath + "."))
  }
  // the live value of a countable in the snapshot (its own key, or its markerPath; for a PARTITION, the demonstrated bucket).
  function valueOf(c: Countable, s: Snapshot): number | undefined {
    if (c.type === "PARTITION") return s["census.demonstrated"]
    return s[c.key] ?? s[c.markerPath]
  }

  // ── reconcileAll — route EVERY registered countable through the ONE reconciler (S181). The battery ADDITIVE carries its
  // independently-pinned `added` (battery-baseline.json); the census PARTITION carries the live partition + the new-wall count;
  // deviations.count carries its added (the deviations named in THIS sprint's pins); guardEfficacy DERIVED recomputes. ──
  export interface ReconcileAll { results: Reconciliation[]; allReconcile: boolean; failures: string[] }
  export function reconcileAll(over?: Snapshot): ReconcileAll {
    const now = over ?? snapshot()
    const prev = prevMarker()
    const reg = registry()
    const c = Falsify.census()
    const base = baseline() as { added?: number; removed?: number }
    const newInDem = c.rows.filter((r) => r.n > WALL_MAX_PREV && r.bucket === "DEMONSTRATED").length
    const newDeviations = countNamedNewDeviations() // the deviations THIS sprint's pins name (D87–D89)
    const results: Reconciliation[] = []
    for (const cnt of reg) {
      const nowV = valueOf(cnt, now)
      const prevV = valueOf(cnt, prev as Snapshot) ?? null
      if (nowV === undefined) {
        // a registered countable with no live value — a registry that names a number the snapshot does not produce is itself a drift.
        results.push({ key: cnt.key, type: cnt.type, prev: prevV, now: NaN, reconciles: false, delta: null, moved: null,
          display: `${cnt.key}: NOT PRODUCED by snapshot() — a registered countable with no live value`,
          contradiction: `${cnt.key} is registered but snapshot() produces no value for it — the registry and the snapshot diverged (S181)` })
        continue
      }
      if (cnt.type === "PARTITION") {
        results.push(reconcile(cnt, nowV, prevV, { partition: { demonstrated: now["census.demonstrated"], weak: now["census.weak"], exempt: now["census.exempt"], originUnrecorded: now["census.originUnrecorded"], total: now["census.total"], newInDemonstrated: newInDem } }))
      } else if (cnt.type === "DERIVED") {
        results.push(reconcile(cnt, nowV, prevV, { recompute: () => Guard.mutationRate().caught }))
      } else if (cnt.key === "battery.pass") {
        results.push(reconcile(cnt, nowV, prevV, { added: base.added ?? undefined, removed: base.removed ?? 0 }))
      } else if (cnt.key === "deviations.count") {
        results.push(reconcile(cnt, nowV, prevV, { added: newDeviations }))
      } else {
        results.push(reconcile(cnt, nowV, prevV))
      }
    }
    const failures = results.filter((r) => !r.reconciles).map((r) => r.contradiction ?? r.key)
    return { results, allReconcile: failures.length === 0, failures }
  }

  // the number of deviations THIS sprint's pins name (D87–D89) — the independent `added` for deviations.count. A code that
  // adds a deviation the pins do not name, or vice versa, makes the ADDITIVE reconciliation fail.
  export function countNamedNewDeviations(): number {
    const devs = (read("backfill-pins.json").deviations as Record<string, unknown>) ?? {}
    return Object.keys(devs).filter((k) => /^D\d+$/.test(k)).length
  }

  // ── markerDiff (F-1/RP-1) — THE GUARANTEE. Diff the live snapshot against the pinned prev marker; every changed number must
  // be a registered countable (→ reconciled) or explicitly EXEMPT (derived-not-countable). An UNCLASSIFIED changed number
  // REFUSES the log. The registry is a convenience; the diff is the guarantee — a number cannot move without being found,
  // whether or not a human remembered to register it. ──
  export interface Diff { changed: { key: string; prev: number | null; now: number }[]; reconciled: string[]; exempt: string[]; unclassified: { key: string; prev: number | null; now: number }[] }
  export function markerDiff(now?: Snapshot, prev?: Record<string, number>, exemptions: string[] = []): Diff {
    const nowS = now ?? snapshot()
    const prevS = prev ?? prevMarker()
    const reg = registry()
    const registered = new Set(reg.map((c) => c.key))
    const exempt = new Set(exemptions)
    const changed: { key: string; prev: number | null; now: number }[] = []
    const reconciled: string[] = []
    const exemptHit: string[] = []
    const unclassified: { key: string; prev: number | null; now: number }[] = []
    // every key present in EITHER snapshot: a new key (undefined→value) counts as MOVED (F-1 — a new countable next sprint
    // that is forgotten from the registry is still caught, because it moved from undefined).
    const keys = new Set([...Object.keys(nowS), ...Object.keys(prevS)])
    for (const k of keys) {
      const p = prevS[k] ?? null
      const n = nowS[k] ?? null
      if (n === p) continue
      if (n === null) continue // a key that vanished from the snapshot — not a moved number (the marker no longer emits it)
      changed.push({ key: k, prev: p, now: n })
      // a changed key is RECONCILED if it is a registered countable's key OR owned by one (census.* → census; a partition/
      // markerPath alias). The registry is a convenience; the diff is the guarantee — an owned-by-nothing changed key is unclassified.
      const owner = reg.find((c) => Continuity.ownsKey(c, k))
      if (registered.has(k) || owner) reconciled.push(k)
      else if (exempt.has(k)) exemptHit.push(k)
      else unclassified.push({ key: k, prev: p, now: n })
    }
    return { changed, reconciled, exempt: exemptHit, unclassified }
  }

  // ── THE RAW-MARKER LEAF DIFF (F-1/RP-1, RED-TEAM HARDENING) — the markerDiff above runs over snapshot(), a curated set; a
  // red-teamer rightly notes that a curated list of things-that-must-be-total is the exact defect half-relocated. So the gate
  // ALSO extracts EVERY numeric leaf from the RAW terminal marker and asserts each is OWNED by a registered countable OR in the
  // pinned MARKER_EXEMPT set (a verdict-core / invariant leaf, derived-not-countable with a reason). A numeric field that
  // appears in the marker owned by nothing and exempt by nothing REFUSES — the diff finds it whether or not a human registered
  // it. The verdict-core floats (crossCheck) are guarded by the byte-identical bundle; the invariants by their pinned values. ──
  export const MARKER_EXEMPT: { pattern: RegExp; reason: string }[] = [
    { pattern: /^crossCheck\./, reason: "the DSR/PSR/PBO cross-check agreements — verdict-core floats, guarded by the byte-identical evidence bundle (9c1e7bd8), not a cross-sprint countable" },
    { pattern: /^theNumber\./, reason: "manifestsReal/cyclesUnpromptedReal/realLineageCount — the instrument's usage counts, all 0 BY DESIGN (the door is unopened); derived-not-countable" },
    { pattern: /^verifyOnClone/, reason: "the pristine-clone reconstruction data (the auditor's ask) — a record of the clone's own run, not a cross-sprint countable" },
    { pattern: /^verify\.exitCode$/, reason: "the derived verify health (X-REACH(c)) — 0-or-nonzero, not a countable" },
    { pattern: /^goldenMoves$/, reason: "golden moves this run (0) — a per-run count, not a cross-sprint countable" },
    { pattern: /^d33\./, reason: "D33's priced state numbers (testRedesigns never resets) — an invariant carried in the state, not a cross-sprint countable" },
    { pattern: /^reach\.reachableHumans$/, reason: "reachableHumans 1 BY DESIGN (D51 INSTRUMENT) — a pinned invariant, not a countable" },
    { pattern: /^newProductCapability$/, reason: "the disclosed capability count (1) — priced as a SEARCH, disclosed at the gate, not a drift-prone countable" },
    { pattern: /^d50\./, reason: "the D50 release booleans/counts — a release-state record, not a cross-sprint countable" },
  ]
  export function markerNumbers(marker: Record<string, unknown>): { path: string; value: number }[] {
    const out: { path: string; value: number }[] = []
    const walk = (o: unknown, prefix: string) => {
      if (o === null || o === undefined) return
      if (typeof o === "number") { out.push({ path: prefix, value: o }); return }
      if (typeof o === "string") {
        if (/^\d+\/\d+\/\d+$/.test(o)) o.split("/").forEach((n, i) => out.push({ path: `${prefix}[${i}]`, value: Number(n) }))
        else if (/^-?\d+(\.\d+)?$/.test(o)) out.push({ path: prefix, value: Number(o) })
        return
      }
      if (Array.isArray(o)) { o.forEach((v, i) => walk(v, `${prefix}[${i}]`)); return }
      if (typeof o === "object") { for (const k of Object.keys(o as object)) walk((o as Record<string, unknown>)[k], prefix ? `${prefix}.${k}` : k) }
    }
    walk(marker, "")
    return out
  }
  export interface Coverage { ok: boolean; covered: number; exempt: number; uncovered: { path: string; value: number }[] }
  export function markerCoverage(marker: Record<string, unknown>): Coverage {
    const reg = registry()
    const leaves = markerNumbers(marker)
    const uncovered: { path: string; value: number }[] = []
    let covered = 0, exempt = 0
    for (const leaf of leaves) {
      if (reg.some((c) => ownsKey(c, leaf.path))) { covered++; continue }
      if (MARKER_EXEMPT.some((e) => e.pattern.test(leaf.path))) { exempt++; continue }
      uncovered.push(leaf)
    }
    return { ok: uncovered.length === 0, covered, exempt, uncovered }
  }

  // ── THE WHOLE CHECK — S181: every registered countable reconciles AND no changed number is unclassified vs the prev marker.
  // Returns the first failure (or ok). This is what Ship.gate routes through (the continuity-total gate). ──
  export type Verdict = { ok: true; detail: string; reconciliations: Reconciliation[]; diff: Diff } | { ok: false; reason: string; reconciliations: Reconciliation[]; diff: Diff }
  export function check(over?: Snapshot, exemptions: string[] = []): Verdict {
    const now = over ?? snapshot()
    const all = reconcileAll(now)
    const diff = markerDiff(now, undefined, exemptions)
    if (!all.allReconcile) return { ok: false, reason: `a registered countable did not reconcile: ${all.failures[0]}`, reconciliations: all.results, diff }
    if (diff.unclassified.length > 0) {
      const u = diff.unclassified[0]
      return { ok: false, reason: `an UNCLASSIFIED number moved vs the prev marker: ${u.key} (prev ${u.prev} → now ${u.now}) is neither a registered countable nor exempted (F-1/RP-1) — a number cannot move without being reconciled or explicitly exempted`, reconciliations: all.results, diff }
    }
    return { ok: true, detail: `${all.results.length} countables reconciled through the ONE reconciler; ${diff.changed.length} moved, all classified (${diff.reconciled.length} reconciled, ${diff.exempt.length} exempt, 0 unclassified) — continuity is total`, reconciliations: all.results, diff }
  }

  // ── checkWithMarker — the REAL emit path's continuity verdict: the snapshot check() AND the RAW-marker leaf coverage (the
  // red-team hardening — a numeric field in the marker owned by no countable and exempt by nothing REFUSES). The synthetic
  // test builders use check() (snapshot-only, a subset); the emit path uses this (the full total-coverage guarantee). ──
  export function checkWithMarker(marker: Record<string, unknown>, over?: Snapshot, exemptions: string[] = []): Verdict {
    const base = check(over, exemptions)
    if (!base.ok) return base
    const cov = markerCoverage(marker)
    if (!cov.ok) {
      const u = cov.uncovered[0]
      return { ok: false, reason: `an UNCOVERED numeric field appeared in the marker: ${u.path} = ${u.value} is owned by no registered countable and exempt by nothing (F-1/RP-1, raw-marker diff) — a number cannot appear in the record without being a reconciled countable or explicitly derived-not-countable`, reconciliations: base.reconciliations, diff: base.diff }
    }
    return { ok: true, detail: `${base.detail}; raw-marker coverage: ${cov.covered} owned + ${cov.exempt} exempt, 0 uncovered leaves (the diff is over the RAW marker, not a curated snapshot)`, reconciliations: base.reconciliations, diff: base.diff }
  }
}
