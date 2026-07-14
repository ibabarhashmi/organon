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

  // SUBSTANCE V38 (S121, H-5) — reclassified is a NAMED wall, not a residual plug. The V35→V36 treatment dropped OU 83→70:
  // 12 via the DD-20 reFounding, and ONE — S94 — that flipped by an INCIDENTAL reference, NOT the treatment. Named here with
  // proof it moved buckets (git-verified: V35 census 1aac04d8 had S94 as ORIGIN_UNRECORDED origin RP-1; now DEMONSTRATED via
  // W-DV04, a reference added in a V36 Derive test — rigor_crosscheck/clone_pristine — not a reFounding). The check is
  // TWO-DIRECTIONAL: NAMED_RECLASSIFIED.length must EQUAL the residual — a plug (naming a wall that did not move) FAILS, and an
  // unnamed drop (the treatment under-counts) FAILS.
  export const NAMED_RECLASSIFIED: { id: string; from: string; to: string; via: string }[] = [
    { id: "S94", from: "ORIGIN_UNRECORDED (V35 census 1aac04d8, weak origin RP-1)", to: "DEMONSTRATED (route null, origin W-DV04)", via: "an INCIDENTAL W-DV04 reference added in a V36 Derive test (rigor_crosscheck/clone_pristine), NOT the DD-20 reFounding treatment — provably moved buckets, git-verified" },
  ]

  // ── PURE, SEEDABLE reconcilers (S107 feeds them contradictions) ───────────────────────────────────────────────────────
  // census: before − (recovered + reFounded + deleted) === after + reclassified, with reclassified a NAMED count checked in
  // BOTH directions (S121): named-reclassified === the residual. named > residual (a plug) FAILS; named < residual (an unnamed
  // drop) FAILS; a negative residual (the treatment over-claims the OU drop) FAILS.
  // FAMILY V39 (S107) — the WALL_MAX before this sprint's additions. Walls with id > this are NEW this sprint (V39: S140–S150);
  // the ones that land in OU inflate `after` WITHOUT the treatment claiming them, so they are counted SEPARATELY (derived from
  // the census, never a plug). Without this term the model wrongly reads a new-wall inflation as a treatment that over-claims.
  export const WALL_MAX_PRIOR = 139

  export function reconcileCensus(before: number, after: number, recovered: number, reFounded: number, deleted: number, namedReclassified: number = NAMED_RECLASSIFIED.length, newOuThisSprint: number = 0): { reclassified: number; namedReclassified: number; newOuThisSprint: number; contradiction: Contradiction | null } {
    const treated = recovered + reFounded + deleted
    // the treatment explains the OU drop in the PRE-EXISTING wall set; new walls added THIS sprint that land in OU are
    // subtracted from `after` first (they are not treatment). residual = before − (after − newOu) − treated.
    const preExistingAfter = after - newOuThisSprint
    const residual = before - preExistingAfter - treated
    let contradiction: Contradiction | null = null
    if (residual < 0) contradiction = { a: `census before ${before} → after ${after} (pre-existing drop ${before - preExistingAfter}; ${newOuThisSprint} new-this-sprint OU walls excluded)`, b: `treatment recovered ${recovered} + reFounded ${reFounded} + deleted ${deleted} = ${treated}`, why: `the treatment (${treated}) exceeds the pre-existing OU drop (${before - preExistingAfter}) — residual ${residual} < 0 (a producer over-claims)` }
    else if (namedReclassified !== residual) contradiction = { a: `NAMED reclassified count ${namedReclassified}`, b: `residual (before ${before} − preExisting-after ${preExistingAfter} − treated ${treated}) = ${residual}`, why: `the NAMED reclassified walls (${namedReclassified}) do not equal the residual (${residual}) — ${namedReclassified > residual ? "a PLUG: a wall named that did not move" : "an UNNAMED drop: the treatment under-counts"} (S121, two-directional)` }
    return { reclassified: residual, namedReclassified, newOuThisSprint, contradiction }
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
  export function censusReconciliation(): { after: number; reclassified: number; namedReclassified: number; newOuThisSprint: number; contradiction: Contradiction | null } {
    const c = Falsify.census()
    const after = c.counts.ORIGIN_UNRECORDED
    // FAMILY V39 (S107) — DERIVE the new-this-sprint OU count from the census (never a plug): walls whose id is beyond the
    // prior WALL_MAX and land in ORIGIN_UNRECORDED. These are new walls, not a treatment drop; excluding them keeps the
    // treatment reconciliation over the pre-existing set (residual === NAMED_RECLASSIFIED, two-directional).
    const newOuThisSprint = c.rows.filter((r) => { const n = parseInt(r.id.slice(1), 10); return Number.isFinite(n) && n > WALL_MAX_PRIOR && r.bucket === "ORIGIN_UNRECORDED" }).length
    const r = reconcileCensus(CENSUS_BEFORE, after, c.recovered, c.reFounded, c.deleted.length, NAMED_RECLASSIFIED.length, newOuThisSprint)
    return { after, reclassified: r.reclassified, namedReclassified: r.namedReclassified, newOuThisSprint, contradiction: r.contradiction }
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
      `census: ${CENSUS_BEFORE} − (treated + reclassified ${census.reclassified}) === ${census.after} − ${census.newOuThisSprint} new-this-sprint OU walls ✓`,
      `battery: prev + added − removed === full pass ${battery.fullPass} ${battery.reconciles ? "✓" : "✗"}`,
    ]
    return contradictions.length === 0 ? { ok: true, reconciliations } : { ok: false, contradictions, reconciliations }
  }
}
