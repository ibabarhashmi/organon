/**
 * ORGΛNON — THE SHOWING SPRINT (V34, S92 / DD-8). THE INSTRUMENT THAT MAKES THE HALT FALSIFIABLE. V32 declared the success
 * metric — "cycles run, unprompted, on REAL manifests" — and two sprints later that number had never been read. This DERIVES
 * it from the ledger that already exists (a SEARCH is a manifest authored; an OBSERVATION is a cycle run): NO new counter of
 * capability, a pure read over the append-only trials. The Halt is honored in letter as well as spirit.
 *
 * R-5 (the CRITICAL correction, folded in): the naive derivation would count the project's OWN fixtures and development
 * seeds as evidence of a user — the exact self-deception X-SHOWN was minted to prevent, reproduced inside the instrument.
 * The fix REUSES the predicate V33 already load-bears: a REAL lineage is one under the runtime TRIAL_DIR (Migration.
 * realLineageCount), structurally distinct from the committed fixtures. The number reported is cycles-on-REAL; fixtures are
 * reported SEPARATELY as development noise. Reporting only the sum would be a lie by aggregation. And if realLineageCount
 * is 0, that is the same assertion V33's migration HALT already passed — the project has, silently, proven no user exists.
 */
import { existsSync, readdirSync } from "node:fs"
import { StrategyTrial } from "./trial"
import { Migration } from "./migration"

export namespace Ledger {
  export interface ActsSummary {
    // the METRIC (real lineages only — fixtures and dev seeds structurally excluded by the realLineageCount predicate)
    manifestsAuthoredReal: number // a real lineage = a manifest authored (its registration is a SEARCH); == realLineageCount
    cyclesRunReal: number // OBSERVATION acts on real lineages = cycles run, unprompted, on real manifests (THE declared metric)
    realLineageCount: number // reused from Migration.realLineageCount (the same predicate that guards the migration HALT)
    lastCycleAtReal: number | null
    // DEVELOPMENT NOISE (fixtures — the project talking to itself; reported SEPARATELY, never summed into the metric)
    searchesFixture: number
    observationsFixture: number
    fixtureLineageCount: number
  }

  function idsIn(dir: string): string[] {
    if (!existsSync(dir)) return []
    return readdirSync(dir).filter((f) => f.endsWith(".jsonl")).map((f) => f.replace(/\.jsonl$/, "")).sort()
  }

  // count SEARCH/OBSERVATION over a set of lineage ids in a directory (each entry's act is DERIVED — actOf, tolerant of
  // any pre-migration UNKNOWN-ACT). last = the newest OBSERVATION timestamp (the last unprompted cycle).
  function tally(dir: string, ids: string[]): { search: number; observation: number; last: number | null } {
    let search = 0, observation = 0, last: number | null = null
    for (const id of ids) for (const t of StrategyTrial.ledger(id, dir)) {
      const a = StrategyTrial.actOf(t)
      if (a === "SEARCH") search++
      else if (a === "OBSERVATION") { observation++; if (last === null || t.timestamp > last) last = t.timestamp }
    }
    return { search, observation, last }
  }

  export function actsSummary(realDir: string = StrategyTrial.TRIAL_DIR, fixtureDir: string = StrategyTrial.FIXTURE_TRIAL_DIR): ActsSummary {
    const realIds = idsIn(realDir)
    const real = tally(realDir, realIds)
    const fixtureIds = idsIn(fixtureDir)
    const fixture = tally(fixtureDir, fixtureIds)
    return {
      manifestsAuthoredReal: real.search,
      cyclesRunReal: real.observation,
      realLineageCount: Migration.realLineageCount(), // the SAME predicate as the migration HALT (R-5: reuse, do not invent)
      lastCycleAtReal: real.last,
      searchesFixture: fixture.search,
      observationsFixture: fixture.observation,
      fixtureLineageCount: fixtureIds.length,
    }
  }

  // the honest one-line rendering (R-5: BOTH numbers, never the aggregate). This is the first line of the handoff.
  export function readout(s: ActsSummary = actsSummary()): string {
    const noise = `fixtures (development noise, NOT the metric): ${s.searchesFixture} SEARCH / ${s.observationsFixture} OBSERVATION across ${s.fixtureLineageCount} lineages`
    return `manifests authored (real): ${s.manifestsAuthoredReal} · cycles run, unprompted, on real lineages: ${s.cyclesRunReal} · realLineageCount: ${s.realLineageCount} · [${noise}]`
  }
}
