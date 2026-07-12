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
}
