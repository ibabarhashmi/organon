/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 5: THE CAPTURE VERB (S160, D78). NO NEW LAW (a fifth sprint).
 *
 * `organon.sh capture` is a VERB, not a service: it snapshots the pinned subjects' observables into the moat (PIT-honest,
 * content-hashed, tiered REAL@ts). ORGΛNON schedules NOTHING — no daemon, no cron, no service, no systemd unit, not even a
 * suggested crontab line in the docs (a wall greps the tree for schedulers; a seeded one FAILS). The Operator runs it on his
 * own schedule; the tool renders the own-capture window and daysToJudgeable and STOPS.
 *
 * daysToJudgeable is rendered in CAPTURES, not days (RP-6): "⟨n⟩ CAPTURES (not days) — at your current cadence of ⟨measured⟩
 * captures, this is UNJUDGEABLE." The unit is captures because captures are what ORGΛNON can count; converting a count you
 * have into a date you cannot know is exactly the dishonesty X-HONEST forbids.
 *
 * This module NEVER schedules and NEVER fetches on its own: Capture.run takes an injected fetcher (the live entrypoint
 * supplies a network one; the battery supplies none → an OFFLINE-honest result that appends nothing). Pure otherwise.
 */
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"

export namespace Capture {
  const H = path.join(PKG_ROOT, "data", "honesty")
  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

  export interface Subject { subjectKey: string; project: string; asset: string; observable: string }
  // the pinned subjects to snapshot — the shelf subjects and their point-in-time observable (TVL; peg for a stablecoin).
  export function subjects(): Subject[] {
    const sh = JSON.parse(readFileSync(path.join(H, "shelf-attributes.json"), "utf8")).members as { pool: string; project: string; asset: string }[]
    return sh.map((m) => ({ subjectKey: m.pool, project: m.project, asset: m.asset, observable: "tvlUsd" }))
  }

  export interface PIT { subjectKey: string; observable: string; value: number | null; ts: number; tier: string; sha: string }
  export interface CaptureEntry { at: number; pit: PIT[]; sha: string }
  export interface Ledger { minWindowDays: number; captures: CaptureEntry[] }

  export function ledger(): Ledger {
    try {
      const j = JSON.parse(readFileSync(path.join(H, "capture-ledger.json"), "utf8"))
      return { minWindowDays: j.minWindowDays ?? 180, captures: j.captures ?? [] }
    } catch {
      return { minWindowDays: 180, captures: [] }
    }
  }

  export type Fetcher = (s: Subject) => number | null
  export interface RunResult { ran: boolean; offline: boolean; pit: PIT[]; reason: string; entry: CaptureEntry | null }

  // Capture.run — a VERB. Offline (no fetcher — the battery): OFFLINE-honest, produces nothing to append. Live: the caller
  // supplies a network fetcher; the result is a PIT snapshot the entrypoint appends to the moat. This module never appends
  // (the script writes) and never schedules.
  export function run(now: number, fetcher?: Fetcher): RunResult {
    if (!fetcher) return { ran: false, offline: true, pit: [], reason: "OFFLINE — no fetcher (the battery never hits the network; `organon.sh capture` supplies a live one). Nothing appended.", entry: null }
    const subs = subjects()
    const pit: PIT[] = subs.map((s) => {
      const v = fetcher(s)
      return { subjectKey: s.subjectKey, observable: s.observable, value: v, ts: now, tier: v != null && Number.isFinite(v) ? `REAL@${now}` : "UNJUDGEABLE", sha: sha256(`${s.subjectKey}:${s.observable}:${v}:${now}`) }
    })
    const entry: CaptureEntry = { at: now, pit, sha: sha256(JSON.stringify(pit)) }
    return { ran: true, offline: false, pit, reason: `captured ${pit.filter((p) => p.value != null).length}/${pit.length} observables at ${now}`, entry }
  }

  // the own-capture window from the moat.
  export interface Window { captures: number; observations: number; oldestTs: number | null; newestTs: number | null; spanDays: number }
  export function window(): Window {
    const l = ledger()
    const caps = l.captures
    const ts = caps.map((c) => c.at).filter((t) => Number.isFinite(t))
    const oldest = ts.length ? Math.min(...ts) : null
    const newest = ts.length ? Math.max(...ts) : null
    const spanDays = oldest != null && newest != null ? Math.round((newest - oldest) / 86_400_000) : 0
    return { captures: caps.length, observations: caps.reduce((a, c) => a + c.pit.length, 0), oldestTs: oldest, newestTs: newest, spanDays }
  }

  // daysToJudgeable — in CAPTURES, not days (RP-6). The false-fire count needs a minimum window; the requirement is stated
  // in CAPTURES, and the cadence is measured in captures. It is UNJUDGEABLE because ORGΛNON cannot know the Operator's future cadence.
  export interface Judgeability { minWindowDays: number; ownCaptures: number; capturesNeeded: number; unit: "CAPTURES"; verdict: string }
  export function judgeability(): Judgeability {
    const l = ledger()
    const w = window()
    // one capture ≈ one day of window at a daily cadence; the requirement expressed in captures (an honest lower bound).
    const need = Math.max(0, l.minWindowDays - w.captures)
    const verdict =
      w.captures === 0
        ? `${l.minWindowDays}+ CAPTURES (not days) needed to reach the ${l.minWindowDays}-day minimum window — at your current cadence of ${w.captures} captures, this is UNJUDGEABLE (RP-6: a count ORGΛNON has, not a date it cannot know)`
        : `${need} more CAPTURES (not days) to reach the ${l.minWindowDays}-capture window — at your current cadence of ${w.captures} captures over ${w.spanDays} days, judgeability depends on YOUR cadence, never a date ORGΛNON can promise (RP-6)`
    return { minWindowDays: l.minWindowDays, ownCaptures: w.captures, capturesNeeded: need, unit: "CAPTURES", verdict }
  }
}
