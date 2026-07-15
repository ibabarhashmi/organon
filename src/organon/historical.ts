/**
 * ORGΛNON — THE BACKFILL SPRINT (V43), Phase 1/2 (S182, N-3): A HISTORICAL ACT'S HASH IS STABLE OR CARRIED.
 *
 * THE DIAGNOSIS (N-3): `redesignSearchHashes` — the immutable SEARCH that paid for D33's flip (a fixed act, V38) — CHANGED
 * a578032b→d5147f8d, untagged. The cause: the rendered hash was the record chain's `selfSha` of test-redesign-search.json,
 * and the selfSha is POSITION-DEPENDENT (sha of contentSha + prevSha) — so it drifts as new build logs are added to the
 * content-sorted chain, even though the ACT never changed. The one carried hash that drifted, in the sprint about carried
 * identity. X-RECKON / X-SHOWN(c): a fixed historical act's identity must be a function of the ACT, not its chain position.
 *
 * THE FIX: HistoricalAct.hash(act) is the sha256 of the act's IMMUTABLE CORE (the facts of the act — {deviation, act,
 * redesigns, redesignLog}), position-independent. A fixed act yields a fixed hash forever. The chain's selfSha remains the
 * CHAIN's tamper-evidence (position-dependent by design); it is no longer the ACT's identity. S182 asserts a rendered
 * historical-act hash is STABLE (equals the immutable-core hash) or explicitly carried:{from} — a drift without a tag FAILS.
 *
 * Pure: one file read, one hash. No network.
 */
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"
import { PKG_ROOT } from "./frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

export namespace HistoricalAct {
  const H = path.join(PKG_ROOT, "data", "honesty")

  // the IMMUTABLE CORE of a historical act — the facts that define WHAT HAPPENED, excluding mutable metadata (an `at` field
  // reworded, a prose `rule` clarified). For the D56 SEARCH: the deviation, the act, the redesign count, and the redesign log
  // (the record of what estimand changed). These are immutable; a change to any of them IS a change to the act (and SHOULD
  // move the hash — that is the point). A reworded prose rule or a re-dated `at` does NOT move it.
  export interface Core { deviation: string; act: string; redesigns: number; redesignLog: unknown[] }
  export function core(a: Record<string, unknown>): Core {
    return {
      deviation: String(a.deviation ?? ""),
      act: String(a.act ?? ""),
      redesigns: Number(a.redesigns ?? 0),
      redesignLog: (a.redesignLog as unknown[]) ?? [],
    }
  }

  // the STABLE identity hash of a historical act — sha256 of its immutable core, position-independent.
  export function hash(a: Record<string, unknown>): string {
    return sha256(JSON.stringify(core(a)))
  }
  export function hashFile(name: string): string {
    return hash(JSON.parse(readFileSync(path.join(H, name), "utf8")))
  }

  // S182 — a rendered historical-act hash is STABLE (equals the immutable-core hash) or explicitly carried:{from}. A drift
  // without a tag FAILS. A CHANGE to the act's immutable core is NOT a drift — it is a new act, and the hash SHOULD move.
  export type Verdict = { ok: true; detail: string } | { ok: false; reason: string }
  export function stableOrCarried(rendered: string, stable: string, carried?: { from: string; why: string }): Verdict {
    if (rendered === stable) return { ok: true, detail: `stable — the rendered hash ${rendered.slice(0, 12)}… equals the act's immutable-core hash (a fixed act yields a fixed hash)` }
    if (carried) return { ok: true, detail: `carried:{from:${carried.from}} — the drift is explicitly tagged (${carried.why})` }
    return { ok: false, reason: `a historical act's hash DRIFTED, untagged: rendered ${rendered.slice(0, 12)}… ≠ the immutable-core hash ${stable.slice(0, 12)}…, and no carried:{from} tag — a fixed act's hash cannot drift silently (N-3/S182)` }
  }

  // the honest verdict over an ACT FILE: the rendered hash (what a producer emits) must be the file's immutable-core hash, or
  // carried. Used by the gate/audit to check the D56 SEARCH renders a STABLE identity, not the drifting chain selfSha.
  export function verifyFile(name: string, rendered: string, carried?: { from: string; why: string }): Verdict {
    return stableOrCarried(rendered, hashFile(name), carried)
  }
}
