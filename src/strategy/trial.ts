/**
 * ORGΛNON — THE MANIFEST SPRINT (X-MANIFEST c, S72). THE TRIAL LEDGER — every compile is a TRIAL, RECORDED, NEVER
 * COUNTED. Each compile appends to the Moat-pinned trials schema (moat-pins.json trialsLedgerSchema: the per-trial record
 * is `config · returnSeries · metric · contentSha`), hash-chained per MANIFEST LINEAGE (the moat's append-only discipline
 * applied to the user's own thinking) — the schema's FIRST real entries, three sprints after it was pinned empty.
 *
 * AND THE FILLING CHANGES NOTHING STATISTICAL. Every trial carries `counted: false`; the readout states the inertness in
 * plain words; `familyN === 1` holds in every Stamp output STILL (the Stamp imports NO strategy module — a grep wall); the
 * K-door (Correlate.activateKIntoStamp) refuses without BOTH the ≥ 20–50-trials/family trigger AND the Operator's D33.
 * Recording makes the future activation POSSIBLE (the trials are REAL) and the present iteration HONEST (the user sees
 * their own trial count — the beginning of multiple-testing literacy). A trial written with familyN=K 'just to see' is a Halt.
 * Local-first (gitignored) + a committed FIXTURE lineage for the walls. Pure Bun-stdlib; deterministic; no model.
 */
import { createHash } from "node:crypto"
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { StrategyStore } from "./store"

export namespace StrategyTrial {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

  export const TRIAL_DIR = path.join(StrategyStore.ROOT, "trials") // gitignored — the user's live trial ledger
  export const FIXTURE_TRIAL_DIR = path.join(StrategyStore.FIXTURE_DIR, "trials") // committed — the deterministic walls' lineage

  // the Moat RE5 pinned per-trial record fields (asserted verbatim in the wall — a schema drift is a Halt).
  export const MOAT_SCHEMA_FIELDS = ["config", "returnSeries", "metric", "contentSha"] as const

  // THE ACT TAXONOMY (Reckoning sprint; X-RECKON, S80). SEARCH = a new/changed strategy (a new hypothesis — the
  // multiple-testing surface); OBSERVATION = a re-evaluation of the SAME content (a cadence cycle / a manual re-compile
  // unchanged — no new inferential claim). DERIVED at the append site from the content hash, NEVER declared by a caller
  // (append takes no act param); verify() re-derives it, so a caller-injected or tampered act is caught. UNKNOWN-ACT is the
  // honest fallback for a pre-migration entry that carries no act (never a retroactive guess).
  export type Act = "SEARCH" | "OBSERVATION"

  export interface Trial {
    config: string // = the manifest content hash — the candidate's spec (Moat: config)
    returnSeries: { kind: string; text: string }[] // = the composed facts — the realized surface (Moat: returnSeries)
    metric: { effectiveK: number | null; worstAxisTier: string | null; exitFired: boolean | null; reachable: number } // (Moat: metric)
    contentSha: string // = sha256(config + returnSeries + metric) — the Moat-pinned content hash
    timestamp: number
    prevTrialHash: string | null // hash-chained per manifest lineage (null for the lineage's first trial)
    entryHash: string // = sha256(contentSha + timestamp + prevTrialHash) — chains the ledger
    counted: false // RECORDED, NEVER COUNTED — the deflation stays inert; counting awaits the trigger + D33 (recording ≠ counting)
    act: Act // DERIVED (X-RECKON a): SEARCH if this config differs from the prior entry's, else OBSERVATION — NOT in the hash
  }

  // DERIVE the act (X-RECKON a) — the ONLY authority for an entry's tag: the content-hash comparison, never a caller.
  export function deriveAct(priorConfig: string | null, thisConfig: string): Act {
    return priorConfig === null || priorConfig !== thisConfig ? "SEARCH" : "OBSERVATION"
  }

  function ledgerFile(config: string, dir: string): string {
    return path.join(dir, `${config}.jsonl`)
  }

  export function ledger(config: string, dir: string = TRIAL_DIR): Trial[] {
    const f = ledgerFile(config, dir)
    if (!existsSync(f)) {
      const ff = ledgerFile(config, FIXTURE_TRIAL_DIR) // fall back to the committed fixture lineage (pristine clone)
      if (dir === TRIAL_DIR && existsSync(ff)) return readLedger(ff)
      return []
    }
    return readLedger(f)
  }

  function readLedger(f: string): Trial[] {
    return readFileSync(f, "utf8")
      .split("\n")
      .filter((l) => l.trim().length > 0)
      .map((l) => JSON.parse(l) as Trial)
  }

  // the Moat-pinned content hash — over config + returnSeries + metric (NOT the timestamp/chain, so a legitimate re-run of
  // the SAME manifest with the SAME facts has the SAME contentSha; the chain, not the content, makes each entry unique).
  function contentShaOf(config: string, returnSeries: Trial["returnSeries"], metric: Trial["metric"]): string {
    return sha256(JSON.stringify({ config, returnSeries, metric }))
  }

  // APPEND a compile as a trial, hash-chained per manifest lineage. `timestamp` is caller-supplied (deterministic tests +
  // committed fixtures). RECORDED, NEVER COUNTED — `counted: false` is structural (there is no code path to set it true).
  export function append(config: string, returnSeries: Trial["returnSeries"], metric: Trial["metric"], timestamp: number, dir: string = TRIAL_DIR): Trial {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    const prior = ledgerFileExists(config, dir) ? readLedger(ledgerFile(config, dir)) : []
    const prevTrialHash = prior.length ? prior[prior.length - 1].entryHash : null
    const contentSha = contentShaOf(config, returnSeries, metric)
    const entryHash = sha256(`${contentSha}·${timestamp}·${prevTrialHash ?? "GENESIS"}`)
    // X-RECKON a — the act is DERIVED here from the prior entry's config, NEVER supplied by the caller (there is no act
    // param; this is the same structural refusal by which counted:false and authored:false cannot be set true).
    const act = deriveAct(prior.length ? prior[prior.length - 1].config : null, config)
    const trial: Trial = { config, returnSeries, metric, contentSha, timestamp, prevTrialHash, entryHash, counted: false, act }
    appendFileSync(ledgerFile(config, dir), JSON.stringify(trial) + "\n")
    return trial
  }

  // the SEARCH-only count the ≥20–50 trigger reads (X-RECKON c) — OBSERVATION entries are recorded + rendered but
  // structurally EXCLUDED from the count (a cadence observation makes no new inferential claim; D43 leaves the ruling to the pen).
  export function trialsPerFamily(config: string, dir: string = TRIAL_DIR): number {
    return ledger(config, dir).filter((t) => actOf(t) === "SEARCH").length
  }

  // the act of an entry, tolerant of a pre-migration entry that carries none (UNKNOWN-ACT — an honest gap, never a guess).
  export function actOf(t: Trial): Act | "UNKNOWN-ACT" {
    return t.act === "SEARCH" || t.act === "OBSERVATION" ? t.act : "UNKNOWN-ACT"
  }

  // the taxonomy census over a lineage (Phase 5 readout): the SEARCH / OBSERVATION / UNKNOWN-ACT counts.
  export function census(config: string, dir: string = TRIAL_DIR): { total: number; search: number; observation: number; unknown: number } {
    const chain = ledger(config, dir)
    let search = 0, observation = 0, unknown = 0
    for (const t of chain) { const a = actOf(t); if (a === "SEARCH") search++; else if (a === "OBSERVATION") observation++; else unknown++ }
    return { total: chain.length, search, observation, unknown }
  }

  function ledgerFileExists(config: string, dir: string): boolean {
    return existsSync(ledgerFile(config, dir))
  }

  // VERIFY the chain re-hashes on a pristine clone: each entry's contentSha recomputes; each prevTrialHash === the prior
  // entry's entryHash; each entryHash recomputes. A gap or a tamper fails (S72).
  export function verify(config: string, dir: string = TRIAL_DIR): { ok: boolean; count: number; reason?: string } {
    const chain = ledger(config, dir)
    let prev: string | null = null
    let priorConfig: string | null = null
    for (let i = 0; i < chain.length; i++) {
      const t = chain[i]
      if (contentShaOf(t.config, t.returnSeries, t.metric) !== t.contentSha) return { ok: false, count: chain.length, reason: `trial ${i}: contentSha does not recompute (tampered content)` }
      if (t.prevTrialHash !== prev) return { ok: false, count: chain.length, reason: `trial ${i}: prevTrialHash breaks the chain (a gap or a reorder)` }
      if (sha256(`${t.contentSha}·${t.timestamp}·${t.prevTrialHash ?? "GENESIS"}`) !== t.entryHash) return { ok: false, count: chain.length, reason: `trial ${i}: entryHash does not recompute` }
      if (t.counted !== false) return { ok: false, count: chain.length, reason: `trial ${i}: counted !== false — the deflation must stay INERT (a counted trial is a Halt)` }
      // X-RECKON a — the act is RE-DERIVED here; a PRESENT act that disagrees with the derivation is a caller-declared or
      // tampered tag (a Halt). An ABSENT act is a pre-migration entry (UNKNOWN-ACT — tolerated, never a guess), not a tamper.
      if (t.act === "SEARCH" || t.act === "OBSERVATION") {
        if (t.act !== deriveAct(priorConfig, t.config)) return { ok: false, count: chain.length, reason: `trial ${i}: act "${t.act}" disagrees with the derived act (a declared or tampered tag — the act is DERIVED, never declared; S80)` }
      }
      prev = t.entryHash
      priorConfig = t.config
    }
    return { ok: true, count: chain.length }
  }

  // THE TAXONOMY-AWARE LEDGER READOUT (Reckoning sprint; S84) — COUNTS and the RULE, never a defence (an explaining readout is
  // X-ADVICE's subtle form). The trigger counts SEARCH only; OBSERVATION entries are recorded + rendered but excluded from the
  // count. Recording is not counting; an observation makes no new inferential claim.
  export function readout(config: string, dir: string = TRIAL_DIR): string {
    const c = census(config, dir)
    if (c.total === 0) return "No trials recorded on this manifest yet — each compile you record becomes a hash-chained trial. The deflation stays inert; recording is not counting."
    const parts = [`${c.search} SEARCH`, `${c.observation} OBSERVATION`]
    if (c.unknown > 0) parts.push(`${c.unknown} UNKNOWN-ACT`)
    return `${c.total} ${c.total === 1 ? "entry" : "entries"} on this lineage · ${parts.join(" · ")} · the trigger counts SEARCH: ${c.search} of ≥ 20. The deflation remains INERT — counting awaits the pinned ≥ 20–50-trials-per-family trigger AND the Operator's D33 (recording is not counting; an observation makes no new inferential claim).`
  }
}
