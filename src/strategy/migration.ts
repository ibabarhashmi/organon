/**
 * ORGΛNON — THE RECKONING SPRINT (X-RECKON d, S80). THE ONE-TIME MIGRATION. The act taxonomy (SEARCH|OBSERVATION) is
 * DERIVED, so materializing it onto the already-committed fixture lineages (V31's 3-trial, V32's 23-trial) is a one-time,
 * one-window act: it may run ONLY while `realLineageCount === 0` (RP-2). If a real lineage already exists the migration
 * HALTS and the pre-existing untagged entries render as UNKNOWN-ACT — an honest gap, never a retroactive guess.
 *
 * `act` is NOT part of contentSha/entryHash (which cover config + returnSeries + metric + timestamp + prevTrialHash), so the
 * migration ADDS a field the hash never covered: `oldChainRoot === newChainRoot` (the chain is cryptographically UNCHANGED;
 * verify() re-derives the act). The migration record preserves the old root INSIDE it, so the rewrite is itself auditable —
 * and X-RECKON e forbids ever re-tagging a REAL lineage after this window closes.
 */
import { existsSync, readdirSync } from "node:fs"
import path from "node:path"
import { StrategyStore } from "./store"
import { StrategyTrial } from "./trial"

export namespace Migration {
  // RE-TAG a chain purely: derive each entry's act from the prior entry's config (X-RECKON a). Idempotent — re-running on an
  // already-tagged chain reproduces the same acts (the derivation is deterministic).
  export function retagEntries(chain: StrategyTrial.Trial[]): StrategyTrial.Trial[] {
    let priorConfig: string | null = null
    return chain.map((t) => {
      const act = StrategyTrial.deriveAct(priorConfig, t.config)
      priorConfig = t.config
      return { ...t, act }
    })
  }

  // the committed fixture lineage ids (RP-2) — the ONLY lineages the migration may touch.
  export function fixtureLineageIds(): string[] {
    const dir = StrategyTrial.FIXTURE_TRIAL_DIR
    if (!existsSync(dir)) return []
    return readdirSync(dir).filter((f) => f.endsWith(".jsonl")).map((f) => f.replace(/\.jsonl$/, "")).sort()
  }

  // the count of REAL lineages (RP-2 definition): trial ledgers under the RUNTIME store (data/strategies/trials/), which is
  // gitignored and empty on a fresh clone — anything here is a real, user-authored lineage, NOT a committed fixture.
  export function realLineageCount(): number {
    const dir = StrategyTrial.TRIAL_DIR
    if (!existsSync(dir)) return 0
    return readdirSync(dir).filter((f) => f.endsWith(".jsonl")).length
  }

  export interface Record {
    protocol: "reckon-migration"
    at: string
    reason: string
    realLineageCountAtMigration: number
    entriesRetagged: number
    lineages: { id: string; count: number; oldChainRoot: string; newChainRoot: string; search: number; observation: number }[]
    chainNote: string
  }

  export type Result = { ok: true; record: Record } | { ok: false; halt: string }

  // BUILD the migration record from the fixture ledgers, re-tagging each. GATED on realLineageCount === 0 (HALT otherwise).
  // Pure over the ledgers it reads (the caller writes the re-tagged files + the record); `at` is caller-supplied (deterministic).
  export function plan(at: string, opts: { fixtureTrialDir?: string; readLedger?: (id: string) => StrategyTrial.Trial[] } = {}): Result {
    const realCount = realLineageCount()
    if (realCount > 0) return { ok: false, halt: `MIGRATION HALT — ${realCount} real lineage(s) already exist under ${StrategyTrial.TRIAL_DIR}; the one-time re-tag window has closed. Pre-existing untagged entries render as UNKNOWN-ACT, never a retroactive guess (RP-2, X-RECKON e).` }
    const read = opts.readLedger ?? ((id: string) => StrategyTrial.ledger(id, opts.fixtureTrialDir ?? StrategyTrial.FIXTURE_TRIAL_DIR))
    const lineages: Record["lineages"] = []
    let entriesRetagged = 0
    for (const id of fixtureLineageIds()) {
      const before = read(id)
      if (before.length === 0) continue
      const after = retagEntries(before)
      const search = after.filter((t) => t.act === "SEARCH").length
      const observation = after.filter((t) => t.act === "OBSERVATION").length
      lineages.push({ id, count: after.length, oldChainRoot: before[0].entryHash, newChainRoot: after[0].entryHash, search, observation })
      entriesRetagged += after.length
    }
    return {
      ok: true,
      record: {
        protocol: "reckon-migration",
        at,
        reason: "One-time act-taxonomy materialization onto the committed fixture lineages (X-RECKON d) — the ONLY window (realLineageCount===0). SEARCH/OBSERVATION derived from the content-hash chain; a real lineage may never be re-tagged after this (X-RECKON e).",
        realLineageCountAtMigration: realCount,
        entriesRetagged,
        lineages,
        chainNote: "oldChainRoot === newChainRoot for every lineage — act is DERIVED metadata materialized onto each entry, NOT part of contentSha/entryHash; the chain is cryptographically UNCHANGED and verify() re-derives the act. This is a field-addition, not a chain rewrite.",
      },
    }
  }
}
