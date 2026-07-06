/**
 * ORGΛNON STUDIO — the SUMMARY DIFFERENTIAL (Reachability; Rule U-DERIVED). The V11 terminal contradicted itself on the
 * matrix count (22 vs 23) because the number was hand-typed. From this sprint on, the honest-state's figures — floor,
 * matrix PRESENT/ABSENT, catalog count, cycle counts — REGENERATE from their source artifacts at terminal time and must
 * match the prose. A hand-typed number that disagrees with its artifact is a finding, not a typo. This module derives the
 * figures from the live inventory/matrix/catalog; the terminal checkpoint diffs the prose against them.
 */
import { Inventory } from "./inventory"
import { Matrix } from "./matrix"
import { Catalog } from "./catalog"

export namespace Summary {
  export interface Derived {
    floor: number // the capability floor = live inventory capability count
    matrixPresent: number
    matrixAbsent: number
    catalogCount: number
  }
  // regenerate every terminal figure from its source artifact (never hand-typed)
  export function derive(): Derived {
    const rows = Matrix.rows()
    return {
      floor: Inventory.snapshot("summary-derive").capabilities.length,
      matrixPresent: rows.filter((r) => r.status === "PRESENT").length,
      matrixAbsent: rows.filter((r) => r.status === "ABSENT").length,
      catalogCount: Catalog.verify().count,
    }
  }

  // diff a prose claim (numbers a human typed) against the derived truth — any mismatch is a finding (U-DERIVED)
  export function differential(prose: Partial<Derived>, derived: Derived = derive()): { ok: boolean; mismatches: string[] } {
    const mismatches: string[] = []
    for (const [k, v] of Object.entries(prose)) {
      if (v === undefined) continue
      const got = (derived as Record<string, number>)[k]
      if (got !== v) mismatches.push(`${k}: prose says ${v}, artifact derives ${got}`)
    }
    return { ok: mismatches.length === 0, mismatches }
  }

  // X-DEFAULT (Explanation): the differential extends to NARRATIVE DELTAS. The V13 terminal wrote "floor 58→74"; the
  // absolute differential validated the endpoint (74) but was blind to the arithmetic — the true prior was 66, so "58"
  // was wrong. A delta claim "A → B" for a metric is now checked BOTH ways: B against the derived endpoint AND A against
  // the last pinned baseline. A hand-typed delta that disagrees with either is a finding, not a typo.
  export interface DeltaClaim { metric: keyof Derived; from: number; to: number }
  export function deltaDifferential(claims: DeltaClaim[], prevBaseline: Partial<Derived>, derived: Derived = derive()): { ok: boolean; mismatches: string[] } {
    const mismatches: string[] = []
    for (const c of claims) {
      const endpoint = (derived as Record<string, number>)[c.metric]
      const baseline = (prevBaseline as Record<string, number>)[c.metric]
      if (endpoint !== c.to) mismatches.push(`${c.metric} delta: prose ends at ${c.to}, artifact derives ${endpoint}`)
      if (baseline !== undefined && baseline !== c.from) mismatches.push(`${c.metric} delta: prose starts at ${c.from}, the last pinned baseline is ${baseline} (the ${c.metric} '${c.from}→${c.to}' arithmetic is wrong)`)
    }
    return { ok: mismatches.length === 0, mismatches }
  }
}
