/**
 * ORGΛNON — THE SHOWING SPRINT (V34), Phase 5 wall S92 (THE INSTRUMENT). The declared success metric — "cycles run,
 * unprompted, on REAL manifests" — is finally READ, derived from the ledger that already exists (DD-8: no new counter of
 * capability). R-5: the metric (real) and the development noise (fixtures) are reported SEPARATELY, by the SAME predicate
 * that guards the migration HALT (Migration.realLineageCount) — reporting only the sum would be a lie by aggregation.
 *
 * The instrument MEASURES, it does not hardcode: a synthetic REAL lineage is counted as real (proving the 0 is a fact about
 * the world, not a constant). And the profound realization: realLineageCount === 0 is the SAME assertion V33's migration
 * gate already passed — the project has, silently, proven no user exists. The instrument reads what was always there.
 */
import { test, expect } from "bun:test"
import { mkdtempSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ledger } from "../../src/strategy/ledger"
import { StrategyTrial } from "../../src/strategy/trial"

test("S92 — THE NUMBER is measured (real vs fixture reported SEPARATELY, never summed): on this tree the metric is ZERO", () => {
  const s = Ledger.actsSummary()
  // the metric — cycles run, unprompted, on REAL lineages — is 0 (no user has authored a real manifest)
  expect(s.manifestsAuthoredReal).toBe(0)
  expect(s.cyclesRunReal).toBe(0)
  expect(s.realLineageCount).toBe(0)
  // the fixtures (development noise) are reported SEPARATELY — the 2 committed lineages, 2 SEARCH + 24 OBSERVATION
  expect(s.fixtureLineageCount).toBe(2)
  expect(s.searchesFixture).toBe(2)
  expect(s.observationsFixture).toBe(24)
  // the readout states BOTH numbers and never aggregates them (R-5: a lie by aggregation is refused)
  const r = Ledger.readout(s)
  expect(r).toMatch(/cycles run, unprompted, on real lineages: 0/)
  expect(r).toMatch(/development noise, NOT the metric/i)
  expect(r).not.toMatch(/cycles run.*: 24/) // the fixture count is NEVER reported as the metric
})

test("S92/R-5 — the derivation REUSES the migration predicate (realLineageCount), it does not invent a second definition", () => {
  const { Migration } = require("../../src/strategy/migration")
  // the summary's realLineageCount IS Migration.realLineageCount — the same predicate that guards the one-time migration HALT
  expect(Ledger.actsSummary().realLineageCount).toBe(Migration.realLineageCount())
})

test("S92 — the instrument MEASURES, it does not hardcode 0: a synthetic REAL lineage is counted as real (the 0 is a fact, not a constant)", () => {
  const realDir = mkdtempSync(path.join(tmpdir(), "org-real-"))
  const fixtureDir = StrategyTrial.FIXTURE_TRIAL_DIR
  // author a real lineage: one registration (SEARCH) + three cadence cycles (OBSERVATION) — a real user's ledger
  const cfg = "synthetic-real-lineage-config-hash"
  const series = [{ kind: "fact", text: "x" }]
  const metric = { effectiveK: null, worstAxisTier: null, exitFired: null, reachable: 1 }
  StrategyTrial.append(cfg, series, metric, 1_000, realDir) // SEARCH (first)
  StrategyTrial.append(cfg, series, metric, 2_000, realDir) // OBSERVATION
  StrategyTrial.append(cfg, series, metric, 3_000, realDir) // OBSERVATION
  StrategyTrial.append(cfg, series, metric, 4_000, realDir) // OBSERVATION
  const s = Ledger.actsSummary(realDir, fixtureDir)
  expect(s.manifestsAuthoredReal).toBe(1) // one real manifest authored
  expect(s.cyclesRunReal).toBe(3) // three unprompted cycles run on it
  expect(s.lastCycleAtReal).toBe(4_000) // the last cycle's timestamp
  // the fixtures stay reported separately — the instrument never conflates the real user with the dev fixtures
  expect(s.fixtureLineageCount).toBe(2)
})

test("S92 — the instrument is a pure DERIVATION over the existing ledger, adding NO new product capability (the Halt is honored)", () => {
  const src = readFileSync(path.join(PKG_ROOT, "src", "strategy", "ledger.ts"), "utf8")
  // it only READS the trials (no writes, no daemon, no egress, no network) — a pure read over the append-only ledger
  expect(src).toMatch(/StrategyTrial\.ledger/)
  expect(src).not.toMatch(/appendFileSync|writeFileSync|fetch\(|setInterval|createServer/)
  expect(src).toMatch(/Migration\.realLineageCount/) // reuses the existing predicate (DD-8, R-5)
})
