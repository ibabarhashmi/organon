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

  export interface Trial {
    config: string // = the manifest content hash — the candidate's spec (Moat: config)
    returnSeries: { kind: string; text: string }[] // = the composed facts — the realized surface (Moat: returnSeries)
    metric: { effectiveK: number | null; worstAxisTier: string | null; exitFired: boolean | null; reachable: number } // (Moat: metric)
    contentSha: string // = sha256(config + returnSeries + metric) — the Moat-pinned content hash
    timestamp: number
    prevTrialHash: string | null // hash-chained per manifest lineage (null for the lineage's first trial)
    entryHash: string // = sha256(contentSha + timestamp + prevTrialHash) — chains the ledger
    counted: false // RECORDED, NEVER COUNTED — the deflation stays inert; counting awaits the trigger + D33 (recording ≠ counting)
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
    const trial: Trial = { config, returnSeries, metric, contentSha, timestamp, prevTrialHash, entryHash, counted: false }
    appendFileSync(ledgerFile(config, dir), JSON.stringify(trial) + "\n")
    return trial
  }

  function ledgerFileExists(config: string, dir: string): boolean {
    return existsSync(ledgerFile(config, dir))
  }

  // VERIFY the chain re-hashes on a pristine clone: each entry's contentSha recomputes; each prevTrialHash === the prior
  // entry's entryHash; each entryHash recomputes. A gap or a tamper fails (S72).
  export function verify(config: string, dir: string = TRIAL_DIR): { ok: boolean; count: number; reason?: string } {
    const chain = ledger(config, dir)
    let prev: string | null = null
    for (let i = 0; i < chain.length; i++) {
      const t = chain[i]
      if (contentShaOf(t.config, t.returnSeries, t.metric) !== t.contentSha) return { ok: false, count: chain.length, reason: `trial ${i}: contentSha does not recompute (tampered content)` }
      if (t.prevTrialHash !== prev) return { ok: false, count: chain.length, reason: `trial ${i}: prevTrialHash breaks the chain (a gap or a reorder)` }
      if (sha256(`${t.contentSha}·${t.timestamp}·${t.prevTrialHash ?? "GENESIS"}`) !== t.entryHash) return { ok: false, count: chain.length, reason: `trial ${i}: entryHash does not recompute` }
      if (t.counted !== false) return { ok: false, count: chain.length, reason: `trial ${i}: counted !== false — the deflation must stay INERT (a counted trial is a Halt)` }
      prev = t.entryHash
    }
    return { ok: true, count: chain.length }
  }

  // THE LEDGER READOUT — the inertness in plain words (rendered in the composed drawer). Recording ≠ counting.
  export function readout(config: string, dir: string = TRIAL_DIR): string {
    const n = ledger(config, dir).length
    if (n === 0) return "No trials recorded on this manifest yet — each compile you record becomes a hash-chained trial. The deflation stays inert; recording is not counting."
    return `${n} trial${n === 1 ? "" : "s"} recorded on this manifest · the deflation remains INERT — counting awaits the pinned ≥ 20–50-trials-per-family trigger + the Operator's D33 (recording makes the future activation possible + the present iteration honest; it never touches a verdict).`
  }
}
