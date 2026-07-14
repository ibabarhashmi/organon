/**
 * ORGΛNON — THE SOCKET SPRINT (V37), Phase 1: Consistency.check — TOTALITY WAS NEVER COHERENCE (S107, the wall V36 lacked).
 *
 * G-1: V36's generated header carried two numbers that did not reconcile with other numbers in the SAME header. The battery
 * Δ was hand-typed +34 (the committed FILE count) against a real +66 (tests: 1559 → 1625). The census read 83 − 12 = 70,
 * but 83 − 12 = 71. X-DERIVE proved every claim HAS a producer; it never checked that producers AGREE WITH ONE ANOTHER —
 * and a generated file is not re-read, so the defect is HARDER to see, not easier. This is the cheapest fix on the board:
 * a wall that recomputes the header's own arithmetic and FAILS on a contradiction between two producers.
 *
 * The census residual is NAMED, not hidden: `reclassified` is the count of walls whose OU→DEMONSTRATED move this sprint came
 * from an incidental new reference (a control/W-tag a new test file added), not from the census treatment. A NEGATIVE
 * residual is a contradiction (the treatment claims a larger drop than the OU count actually fell) — that is the real check.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"
import { Falsify } from "./falsify"

export namespace Consistency {
  export interface Contradiction {
    a: string // one producer's claim
    b: string // the other producer's claim
    why: string
  }
  export type Result = { ok: true; reconciliations: string[] } | { ok: false; contradictions: Contradiction[]; reconciliations: string[] }

  const CENSUS_BEFORE = 83 // the V35 baseline OU count (pinned; the census treatment's `before`)

  // ── PURE, SEEDABLE reconcilers (S107 feeds them contradictions) ───────────────────────────────────────────────────────
  // census: before − (recovered + reFounded + deleted + reclassified) === after, reclassified NAMED and NON-NEGATIVE.
  export function reconcileCensus(before: number, after: number, recovered: number, reFounded: number, deleted: number): { reclassified: number; contradiction: Contradiction | null } {
    const treated = recovered + reFounded + deleted
    const reclassified = before - after - treated
    return {
      reclassified,
      contradiction: reclassified < 0 ? { a: `census before ${before} → after ${after} (drop ${before - after})`, b: `treatment recovered ${recovered} + reFounded ${reFounded} + deleted ${deleted} = ${treated}`, why: `the treatment (${treated}) exceeds the actual OU drop (${before - after}) — reclassified ${reclassified} < 0 (a producer over-claims)` } : null,
    }
  }
  // battery: full === prev + added − removed.
  export function reconcileBattery(prev: number, full: number, added: number, removed: number): { reconciles: boolean; contradiction: Contradiction | null } {
    const expected = prev + added - removed
    return {
      reconciles: full === expected,
      contradiction: full === expected ? null : { a: `battery full pass ${full}`, b: `prev ${prev} + added ${added} − removed ${removed} = ${expected}`, why: `the reported delta does not reconcile with the measured full pass (G-1)` },
    }
  }

  function baseline(): { prevFullPass: number; fullPass: number; added: number; removed: number } {
    return JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "battery-baseline.json"), "utf8"))
  }

  // THE CENSUS RECONCILIATION — before − (recovered + reFounded + deleted + reclassified) === after, with `reclassified`
  // the NAMED residual (an incidental OU→DEMONSTRATED move) that must be NON-NEGATIVE. A negative residual is a
  // contradiction: the treatment counts more than the OU actually dropped.
  export function censusReconciliation(): { after: number; reclassified: number; contradiction: Contradiction | null } {
    const c = Falsify.census()
    const after = c.counts.ORIGIN_UNRECORDED
    const treated = c.recovered + c.reFounded + c.deleted.length
    const reclassified = CENSUS_BEFORE - after - treated // the residual, NAMED
    const contradiction: Contradiction | null = reclassified < 0
      ? { a: `census before ${CENSUS_BEFORE} → after ${after} (drop ${CENSUS_BEFORE - after})`, b: `treatment claims recovered ${c.recovered} + reFounded ${c.reFounded} + deleted ${c.deleted.length} = ${treated}`, why: `the treatment (${treated}) exceeds the actual OU drop (${CENSUS_BEFORE - after}) — reclassified would be ${reclassified} < 0 (a producer over-claims)` }
      : null
    return { after, reclassified, contradiction }
  }

  // THE BATTERY RECONCILIATION — the full pass === prev + added − removed. A hand-typed added (the V36 FILE count) that
  // does not reconcile with the measured full pass is a contradiction (G-1's exact defect).
  export function batteryReconciliation(): { fullPass: number; reconciles: boolean; contradiction: Contradiction | null } {
    const b = baseline()
    const expected = b.prevFullPass + b.added - b.removed
    const reconciles = b.fullPass === expected
    const contradiction: Contradiction | null = reconciles
      ? null
      : { a: `battery full pass ${b.fullPass}`, b: `prev ${b.prevFullPass} + added ${b.added} − removed ${b.removed} = ${expected}`, why: `the reported delta does not reconcile with the measured full pass (G-1: a producer's Δ contradicts the count)` }
    return { fullPass: b.fullPass, reconciles, contradiction }
  }

  // Consistency.check — the whole cross-producer check. Returns every contradiction (empty = coherent). This is what the
  // generator runs before it emits the header (S107): a header whose producers contradict one another is a Halt.
  export function check(): Result {
    const census = censusReconciliation()
    const battery = batteryReconciliation()
    const contradictions: Contradiction[] = []
    if (census.contradiction) contradictions.push(census.contradiction)
    if (battery.contradiction) contradictions.push(battery.contradiction)
    const reconciliations = [
      `census: ${CENSUS_BEFORE} − (treated + reclassified ${census.reclassified}) === ${census.after} ✓`,
      `battery: prev + added − removed === full pass ${battery.fullPass} ${battery.reconciles ? "✓" : "✗"}`,
    ]
    return contradictions.length === 0 ? { ok: true, reconciliations } : { ok: false, contradictions, reconciliations }
  }
}
