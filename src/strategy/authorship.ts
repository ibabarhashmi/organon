/**
 * ORGΛNON — THE SURROGATE ADDENDUM (V38-B), B1: Authorship — THE QUARANTINE (S128, D65).
 *
 * The poison vector: V34's `real` predicate is `real := ¬FIXTURE` (a lineage under the runtime trial dir, not the committed
 * fixture dir, counts as real). But an AGENT — a script, a test, a coding agent walking the same author path — would write to
 * that same runtime dir, and its lineage would count as REAL today. Under D51 (ORGΛNON is an INSTRUMENT), IN2 is the ONLY
 * validation the project has, and its instrument is exactly these counters (realLineageCount, the journal, changedByCompile).
 * A poisoned counter in an instrument's self-test destroys the only truth the tool has.
 *
 * THE FIX (D65): authorship is HUMAN | AGENT | FIXTURE, DERIVED AT THE ENTRY PATH (never declared by the caller), recorded
 * OUTSIDE the hashed surface (a sidecar marker beside the ledger — the lineage id is the content hash of the manifest, and the
 * marker does not enter it, so NO lineage id moves). `real := ¬FIXTURE ∧ ¬AGENT` (i.e., real ⟺ HUMAN). The burden is toward
 * the safe class: a runtime lineage with NO human marker is AGENT, not HUMAN — you must PROVE a human authored it (the console
 * route writes the marker at the entry path), never assume it. A poisoned counter is impossible: an unmarked runtime lineage
 * cannot inflate the real count.
 */
import { existsSync, readdirSync } from "node:fs"
import path from "node:path"
import { StrategyTrial } from "./trial"
import { Migration } from "./migration"

export namespace Authorship {
  export type Class = "HUMAN" | "AGENT" | "FIXTURE"

  // the sidecar marker a HUMAN entry path writes beside a runtime lineage (`<id>.human`). It lives OUTSIDE the hashed content
  // (the lineage id is sha256 over the manifest; the marker is a separate file), so writing it moves NO lineage id.
  export function humanMarkerPath(id: string, trialDir: string = StrategyTrial.TRIAL_DIR): string {
    return path.join(trialDir, `${id}.human`)
  }

  // DERIVE the authorship class of a lineage from its ENTRY PATH (never a declared field): a lineage under the committed
  // fixture dir is FIXTURE; a runtime lineage WITH a human marker (written by the console entry path) is HUMAN; a runtime
  // lineage with NO human marker is AGENT (the safe default — you must prove a human, never assume one).
  export function classOf(id: string, trialDir: string = StrategyTrial.TRIAL_DIR, fixtureDir: string = StrategyTrial.FIXTURE_TRIAL_DIR): Class {
    if (existsSync(path.join(fixtureDir, `${id}.jsonl`))) return "FIXTURE"
    if (existsSync(humanMarkerPath(id, trialDir))) return "HUMAN"
    return "AGENT"
  }

  // real := ¬FIXTURE ∧ ¬AGENT ⟺ HUMAN. A FIXTURE is development noise; an AGENT is contamination; only a HUMAN lineage counts.
  export function isReal(cls: Class): boolean {
    return cls !== "FIXTURE" && cls !== "AGENT"
  }

  // the POISON-RESISTANT real-lineage count: runtime lineages that DERIVE to HUMAN. A seeded agent lineage (no marker) is
  // excluded. This is the quarantined replacement for Migration.realLineageCount (real := ¬FIXTURE), and while zero real
  // lineages exist the two agree at 0 — the canary proves they agree, and that a seeded agent lineage makes them diverge.
  export function realLineageCount(trialDir: string = StrategyTrial.TRIAL_DIR, fixtureDir: string = StrategyTrial.FIXTURE_TRIAL_DIR): number {
    if (!existsSync(trialDir)) return 0
    return readdirSync(trialDir)
      .filter((f) => f.endsWith(".jsonl"))
      .map((f) => f.replace(/\.jsonl$/, ""))
      .filter((id) => isReal(classOf(id, trialDir, fixtureDir))).length
  }

  // the ids of runtime lineages that DERIVE to AGENT (the contamination the base predicate would have counted). Empty today.
  export function agentLineageIds(trialDir: string = StrategyTrial.TRIAL_DIR, fixtureDir: string = StrategyTrial.FIXTURE_TRIAL_DIR): string[] {
    if (!existsSync(trialDir)) return []
    return readdirSync(trialDir)
      .filter((f) => f.endsWith(".jsonl"))
      .map((f) => f.replace(/\.jsonl$/, ""))
      .filter((id) => classOf(id, trialDir, fixtureDir) === "AGENT")
      .sort()
  }
}

// THE DIFFERENTIAL CANARY (S128) — snapshot every real-class counter BEFORE the surrogate phases, re-derive AFTER; if the
// quarantined count and the base predicate disagree, an AGENT lineage leaked past the base predicate and the canary NAMES it.
export namespace Quarantine {
  export interface Snapshot {
    baseRealCount: number // Migration.realLineageCount — the OLD predicate (real := ¬FIXTURE), which would count an agent
    quarantinedRealCount: number // Authorship.realLineageCount — the NEW predicate (real := ¬FIXTURE ∧ ¬AGENT)
    agentLineages: string[] // the runtime lineages that derive AGENT (would poison the base count)
  }

  export function snapshot(trialDir: string = StrategyTrial.TRIAL_DIR, fixtureDir: string = StrategyTrial.FIXTURE_TRIAL_DIR): Snapshot {
    return {
      baseRealCount: countRuntimeLineages(trialDir),
      quarantinedRealCount: Authorship.realLineageCount(trialDir, fixtureDir),
      agentLineages: Authorship.agentLineageIds(trialDir, fixtureDir),
    }
  }

  // the base predicate, inlined (¬FIXTURE only — the count Migration.realLineageCount computes over the same dir).
  function countRuntimeLineages(trialDir: string): number {
    if (!existsSync(trialDir)) return 0
    return readdirSync(trialDir).filter((f) => f.endsWith(".jsonl")).length
  }

  // reconcile two snapshots: before === after (no real-class counter moved across the surrogate phases), or NAME the diff.
  export function reconcile(before: Snapshot, after: Snapshot): { ok: boolean; leaked: string[]; detail: string } {
    const leaked = after.agentLineages.filter((id) => !before.agentLineages.includes(id))
    const moved = before.quarantinedRealCount !== after.quarantinedRealCount || before.baseRealCount !== after.baseRealCount
    if (!moved && leaked.length === 0) return { ok: true, leaked: [], detail: `canary clean — real-class counters unchanged (quarantined ${before.quarantinedRealCount} === ${after.quarantinedRealCount}); no agent lineage leaked` }
    return { ok: false, leaked, detail: `canary TRIPPED — ${leaked.length ? `agent lineage(s) leaked: ${leaked.join(", ")}` : `a real-class counter moved (quarantined ${before.quarantinedRealCount}→${after.quarantinedRealCount}, base ${before.baseRealCount}→${after.baseRealCount})`}; the leaking producer is the real-lineage counter` }
  }

  // the LIVE canary check: the base predicate and the quarantined predicate must AGREE (no agent lineage is currently counted
  // as real). While zero real lineages exist they agree at 0; if an agent lineage ever appears, the base counts it and the
  // quarantine excludes it — the disagreement is the alarm, and the agent ids are named (Migration is imported so the base
  // predicate is the REAL one the ledger used, not a re-implementation).
  export function live(): { ok: boolean; base: number; quarantined: number; agentLineages: string[]; detail: string } {
    const base = Migration.realLineageCount()
    const quarantined = Authorship.realLineageCount()
    const agentLineages = Authorship.agentLineageIds()
    const ok = base === quarantined && agentLineages.length === 0
    return { ok, base, quarantined, agentLineages, detail: ok ? `no contamination — base ${base} === quarantined ${quarantined}, zero agent lineages` : `CONTAMINATION — base ${base} counts ${agentLineages.length} agent lineage(s) the quarantine excludes (quarantined ${quarantined}): ${agentLineages.join(", ")}` }
  }
}
