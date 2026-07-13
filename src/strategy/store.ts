/**
 * ORGΛNON — THE MANIFEST SPRINT (X-MANIFEST e). The manifest store: LOCAL-FIRST, no accounts, no server state, no cloud
 * sync — Bun-stdlib file I/O under `data/strategies/manifests/` (gitignored; a committed fixture lineage under
 * `data/strategies/fixtures/` backs the walls on a pristine clone). BYOK-grade privacy: a strategy never leaves the
 * machine except via the EXISTING consented-export path (X-TELEMETRY unchanged; the store writes no telemetry).
 *
 * The manifest LINEAGE id is the content hash of the strategy IDENTITY (schemaVersion + positions + thesis +
 * exitCriterion) — the JOURNAL is EXCLUDED so that filling `decisionAfter`/`changedByCompile` after a compile does NOT
 * fork the lineage (the trials chain is per-lineage; the journal is mutable metadata, not identity).
 */
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { Manifest } from "./manifest"

export namespace StrategyStore {
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

  export const ROOT = path.join(PKG_ROOT, "data", "strategies")
  export const MANIFEST_DIR = path.join(ROOT, "manifests") // gitignored — the user's live manifests
  export const FIXTURE_DIR = path.join(ROOT, "fixtures") // committed — the deterministic lineage the walls read
  export const CLOSURE_DIR = path.join(ROOT, "closures") // gitignored — per-lineage closure status (a USER act)
  export const FIXTURE_CLOSURE_DIR = path.join(FIXTURE_DIR, "closures") // committed — the walls' closure fixtures
  export const REPIN_DIR = path.join(ROOT, "repins") // gitignored — the disclosed re-pin records (old hash → new hash + reason)

  // the LINEAGE id — sha256 over the strategy identity, journal EXCLUDED (canonical key order). Stable as the journal fills.
  export function lineageId(m: Manifest.T): string {
    const identity = { schemaVersion: m.schemaVersion, positions: m.positions, thesis: m.thesis, exitCriterion: m.exitCriterion }
    return sha256(JSON.stringify(identity))
  }

  // the manifest content hash used as the trial's `config` (the same identity hash; named for the trial ledger's vocabulary)
  export const manifestHash = lineageId

  function ensure(dir: string): void {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  }

  // SAVE — local-first; returns the lineage id. Idempotent (re-saving the same identity overwrites the same file, which
  // only differs if the mutable journal changed). No account, no network, no telemetry.
  export function save(m: Manifest.T, dir: string = MANIFEST_DIR): string {
    ensure(dir)
    const id = lineageId(m)
    writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(m, null, 2) + "\n")
    return id
  }

  export function load(id: string, dir: string = MANIFEST_DIR): Manifest.T | null {
    const f = path.join(dir, `${id}.json`)
    if (!existsSync(f)) return null
    const r = Manifest.parse(JSON.parse(readFileSync(f, "utf8")))
    return r.ok ? r.manifest : null
  }

  export function list(dir: string = MANIFEST_DIR): string[] {
    if (!existsSync(dir)) return []
    return readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .sort()
  }

  // update the JOURNAL on a stored manifest WITHOUT forking the lineage (the identity hash is unchanged; the same file is
  // rewritten). Returns the (unchanged) lineage id. A journal field is local-first; egress is the existing consented path.
  export function updateJournal(id: string, journal: Partial<Manifest.Journal>, dir: string = MANIFEST_DIR): string | null {
    const m = load(id, dir)
    if (!m) return null
    const merged: Manifest.T = { ...m, journal: { ...(m.journal ?? {}), ...journal } }
    return save(merged, dir)
  }

  // CLOSURE — a lineage is CLOSED by a USER act (X-CADENCE e): a status + a reason, nothing more. What follows a closure is
  // V33's post-mortem (RESERVED, D40 — not built). A closed lineage takes no further cycles (the monitor refuses, stated).
  export interface Closure {
    closed: true
    reason: string
    at: string // caller-supplied (deterministic)
  }
  export function closure(id: string, dir: string = CLOSURE_DIR): Closure | null {
    const f = path.join(dir, `${id}.json`)
    if (existsSync(f)) return JSON.parse(readFileSync(f, "utf8")) as Closure
    const ff = path.join(FIXTURE_CLOSURE_DIR, `${id}.json`)
    if (dir === CLOSURE_DIR && existsSync(ff)) return JSON.parse(readFileSync(ff, "utf8")) as Closure
    return null
  }
  export function close(id: string, reason: string, at: string, dir: string = CLOSURE_DIR): { ok: true; closure: Closure } | { ok: false; error: string } {
    if (!reason || reason.trim().length === 0) return { ok: false, error: "Closing a strategy records WHY — a lineage is not closed silently. Refused." }
    ensure(dir)
    const c: Closure = { closed: true, reason: reason.trim(), at }
    writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(c, null, 2) + "\n")
    return { ok: true, closure: c }
  }

  // THE DISCLOSED RE-PIN (X-AUTHOR e) — editing a registered manifest's positions/exit changes its IDENTITY → a NEW lineage.
  // The move is DISCLOSED: the old hash, the new hash, and the user's reason are recorded (never a silent overwrite); the new
  // manifest is saved under its own lineage. A re-pin without a reason is refused (a goalpost cannot move unstated).
  export interface Repin {
    oldId: string
    newId: string
    reason: string
    at: string
  }
  export function repin(oldId: string, newManifest: Manifest.T, reason: string, at: string, manifestDir: string = MANIFEST_DIR, repinDir: string = REPIN_DIR): { ok: true; repin: Repin; newId: string } | { ok: false; error: string } {
    if (!reason || reason.trim().length === 0) return { ok: false, error: "A re-pin must state WHY the manifest changed — the old and new hashes are both recorded. Refused. Nothing was changed." }
    const newId = lineageId(newManifest)
    save(newManifest, manifestDir)
    ensure(repinDir)
    const r: Repin = { oldId, newId, reason: reason.trim(), at }
    writeFileSync(path.join(repinDir, `${newId}.json`), JSON.stringify(r, null, 2) + "\n")
    return { ok: true, repin: r, newId }
  }
}
