/**
 * ORGΛNON STUDIO — the CAPTURE SERVICE: clocks that TICK or say why (Phase 2; Rules L-TICK, H-CLOCK). Fetches the
 * forward domains from the FREE adapters on cadence and writes nonce-anchored, hash-CHAINED stamps. Each stamp carries
 * a capture-time nonce (crypto-random, known only at capture) so a backfilled/retro-captured point cannot verify —
 * fabrication is impossible by construction, not by trust. A missed run is a recorded GAP; interpolation, retro-capture,
 * and smoothing are Halts. A domain with zero fresh stamps renders NOT TICKING, plainly.
 */
import { createHash, randomBytes } from "node:crypto"
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs"

export namespace Capture {
  export interface Stamp {
    domain: string
    capturedAt: number // ms epoch at capture
    nonce: string // capture-time secret — non-reconstructable from data; its absence/forgery breaks verification
    payloadSha: string // hash of the fetched payload (recomputable — insufficient alone; the nonce is the anchor)
    prevSha: string // chain link to the domain's prior stamp
    selfSha: string // sha256(domain|capturedAt|nonce|payloadSha|prevSha [|origin|schedulerRun])
    // C-TENSE — provenance of the stamp. "scheduler" = a detached scheduler/daemon fired it (unattended, not an inline
    // adjudication session); "session"/"manual" = originated by a running session. Hashed when present, so a relabel
    // of a session stamp to "scheduler" breaks selfSha. Absent on legacy (V5) stamps → they still verify unchanged.
    origin?: "scheduler" | "session" | "manual"
    schedulerRun?: string // the scheduler run-nonce (a daemon instance id) — distinct from any interactive session
  }
  export const GENESIS = "0".repeat(64)
  const sha256 = (s: string) => createHash("sha256").update(s).digest("hex")
  export function stampSelfSha(s: Omit<Stamp, "selfSha">): string {
    const base = `${s.domain}|${s.capturedAt}|${s.nonce}|${s.payloadSha}|${s.prevSha}`
    return sha256(s.origin ? `${base}|${s.origin}|${s.schedulerRun ?? ""}` : base) // back-compat: no origin ⇒ old hash
  }

  export class Service {
    private stamps: Stamp[] = []
    constructor(private file: string) {
      if (existsSync(file)) {
        this.stamps = readFileSync(file, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l) as Stamp)
        const v = this.verify()
        if (!v.ok) throw new Error(`capture chain broken at ${v.brokenAt}: ${v.reason}`)
      } else writeFileSync(file, "")
    }

    private lastFor(domain: string): Stamp | null {
      for (let i = this.stamps.length - 1; i >= 0; i--) if (this.stamps[i].domain === domain) return this.stamps[i]
      return null
    }

    // capture a stamp for a domain from a fetched payload. The nonce is generated HERE, at capture time — this is what
    // makes a retro-captured stamp impossible to verify (a fabricator cannot know the nonce that was never generated).
    capture(domain: string, payload: string, capturedAt: number, meta?: { origin?: Stamp["origin"]; schedulerRun?: string }): Stamp {
      const prev = this.lastFor(domain)
      const base = { domain, capturedAt, nonce: randomBytes(16).toString("hex"), payloadSha: sha256(payload), prevSha: prev ? prev.selfSha : GENESIS, ...(meta?.origin ? { origin: meta.origin, schedulerRun: meta.schedulerRun } : {}) }
      const stamp: Stamp = { ...base, selfSha: stampSelfSha(base) }
      this.stamps.push(stamp)
      appendFileSync(this.file, JSON.stringify(stamp) + "\n")
      return stamp
    }

    verify(): { ok: boolean; brokenAt: number | null; reason: string } {
      const lastByDomain = new Map<string, string>()
      for (let i = 0; i < this.stamps.length; i++) {
        const s = this.stamps[i]
        const expectedPrev = lastByDomain.get(s.domain) ?? GENESIS
        if (s.prevSha !== expectedPrev) return { ok: false, brokenAt: i, reason: `prev mismatch for ${s.domain}` }
        if (!s.nonce || s.nonce.length === 0) return { ok: false, brokenAt: i, reason: `stamp for ${s.domain} has no capture nonce (retro-capture)` }
        if (stampSelfSha(s) !== s.selfSha) return { ok: false, brokenAt: i, reason: `self-sha mismatch for ${s.domain} (fabricated/tampered)` }
        lastByDomain.set(s.domain, s.selfSha)
      }
      return { ok: true, brokenAt: null, reason: "all stamp chains verify" }
    }

    freshCount(domain: string): number {
      return this.stamps.filter((s) => s.domain === domain).length
    }
    // count of stamps a detached scheduler/daemon wrote (C-TENSE: 'TICKING' at its true tense needs these > 0)
    schedulerCount(domain: string): number {
      return this.stamps.filter((s) => s.domain === domain && s.origin === "scheduler").length
    }

    // the clock's rendered state per domain: TICKING (≥1 verifying stamp) with last-stamp age, or NOT TICKING. When an
    // expectedCadenceMs is given (the scheduler's interval), a last stamp older than 1.5× the cadence renders a GAP
    // with the missed-interval count — a killed scheduler shows its gap; it is NEVER smoothed or interpolated (H-CLOCK).
    status(domain: string, nowMs: number, opts?: { expectedCadenceMs?: number }): { domain: string; ticking: boolean; stamps: number; schedulerStamps: number; lastAgeMs: number | null; gap: { missed: number; sinceMs: number } | null; render: string } {
      const last = this.lastFor(domain)
      const stamps = this.freshCount(domain)
      const sched = this.schedulerCount(domain)
      if (!last) return { domain, ticking: false, stamps: 0, schedulerStamps: 0, lastAgeMs: null, gap: null, render: `${domain}: NOT TICKING — zero fresh stamps` }
      const age = nowMs - last.capturedAt
      const origin = sched > 0 ? `scheduler-originated ×${sched}` : "session-originated"
      let gap: { missed: number; sinceMs: number } | null = null
      if (opts?.expectedCadenceMs && age > opts.expectedCadenceMs * 1.5) gap = { missed: Math.floor(age / opts.expectedCadenceMs), sinceMs: age }
      const render = gap
        ? `${domain}: TICKING but STALE — GAP of ${Math.round(gap.sinceMs / 1000)}s (~${gap.missed} missed intervals); ${stamps} stamps, ${origin} — the gap is shown, never smoothed`
        : `${domain}: TICKING — ${stamps} stamps (${origin}), last ${Math.round(age / 1000)}s ago (nonce-anchored)`
      return { domain, ticking: true, stamps, schedulerStamps: sched, lastAgeMs: age, gap, render }
    }

    all(): readonly Stamp[] {
      return this.stamps
    }
  }
}
