/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 3: RPC HONESTY (S201, D93; P-9/DD-97).
 *
 * THE DIAGNOSIS (P-9, standing since V42): the RPC failure behaviour was unspecified at the edge. The existing rotation
 * (PlaneRpcState.ROTATION — 4 pinned free RPCs, 8s timeout, all-dead → null) is fundamentally honest (it degrades, never
 * fabricates), BUT: (a) all-dead returned a bare null, not a first-class UNREACHABLE with its attempts and last error; (b) the
 * observation stamped a generic "rpc-rotation", not the ACTUAL serving provider — no per-point audit trail; (c) one dataplane
 * fetch (geckoterminal) had NO timeout (could hang).
 *
 * THE POLICY (DD-97): per attempt a pinned timeout; the ROTATION is the bounded retry (one attempt per pinned understudy, no
 * exponential creep); then honest UNREACHABLE{endpoints, attempts, lastError}. The ordered pinned fallback list is permitted
 * (public RPCs die; a hardening sprint may name understudies) WITH the serving provider recorded IN each observation —
 * provenance per-point. A SILENT SWAP (a provider not in the pinned list, or a provider not recorded) FAILS (S201).
 *
 * Pure over an injectable fetch seam (hermetic tests). Reads the pinned policy from hardening-pins. No SDK.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"
import { PlaneRpcState } from "../plane/rpcstate"

export namespace Rpc {
  interface Policy { timeoutMs: number; maxAttemptsPerEndpoint: number; pinnedFallbackList: { name: string; url: string }[] }
  export function policy(): Policy {
    const p = (JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "hardening-pins.json"), "utf8")).rpcPolicy) as Policy
    return { timeoutMs: p.timeoutMs, maxAttemptsPerEndpoint: p.maxAttemptsPerEndpoint, pinnedFallbackList: p.pinnedFallbackList }
  }
  export function pinnedList(): { name: string; url: string }[] { return policy().pinnedFallbackList }
  export function providerNameFor(url: string): string { return pinnedList().find((p) => p.url === url)?.name ?? "UNPINNED" }
  // S201 — the serving provider MUST be one of the pinned understudies; an unpinned endpoint is a SILENT SWAP and FAILS.
  export function servingProviderIsPinned(url: string): boolean { return pinnedList().some((p) => p.url === url) }

  export interface Value { kind: "value"; value: string; servingProvider: { name: string; url: string }; attempts: number }
  export interface Unreachable { kind: "UNREACHABLE"; endpoints: string[]; attempts: number; lastError: string }
  export type Result = Value | Unreachable

  // ── Rpc.call — iterate the ordered pinned understudies; the FIRST that answers wins and its provider is recorded per-point;
  // all dead → honest UNREACHABLE{endpoints, attempts, lastError}. The rotation IS the bounded retry (no exponential creep). ──
  export async function call(
    method: string,
    params: unknown[],
    fetchRpc: (url: string, method: string, params: unknown[]) => Promise<string> = (u, m, p) => PlaneRpcState.jsonRpc(u, m, p, policy().timeoutMs),
    list: { name: string; url: string }[] = pinnedList(),
  ): Promise<Result> {
    const tried: string[] = []
    let lastError = "no endpoints tried"
    for (const { url } of list) {
      tried.push(url)
      try {
        const value = await fetchRpc(url, method, params)
        if (value === null || value === undefined) { lastError = `${url} → null/undefined (a non-answer rotates, never a fabricated null-as-value)`; continue }
        return { kind: "value", value, servingProvider: { name: providerNameFor(url), url }, attempts: tried.length }
      } catch (e) {
        lastError = `${url} → ${(e as Error).message}`
      }
    }
    // every pinned understudy exhausted — honest UNREACHABLE, NEVER a fabricated point, NEVER a stale-cache lie stamped fresh
    return { kind: "UNREACHABLE", endpoints: tried, attempts: tried.length, lastError }
  }

  // the per-point provenance an observation MUST carry (S201): the serving provider's name + url. A generic "rpc-rotation"
  // (no specific endpoint) is NOT a per-point audit trail.
  export function provenanceOf(r: Result): { servingProvider: string | null; unreachable: boolean; detail: string } {
    if (r.kind === "value") return { servingProvider: r.servingProvider.name, unreachable: false, detail: `served by ${r.servingProvider.name} (${r.servingProvider.url}) after ${r.attempts} attempt(s) — recorded per-point (S201)` }
    return { servingProvider: null, unreachable: true, detail: `UNREACHABLE after ${r.attempts} attempt(s): ${r.lastError} — nothing chained, the point is UNREACHABLE not REAL★ (S201)` }
  }

  // ── S201 — THE POLICY VERDICT. (1) the pinned fallback list equals PlaneRpcState.ROTATION (no silent unpinned endpoint);
  // (2) UNREACHABLE is first-class (a call whose every understudy is dead returns UNREACHABLE, not null); (3) a serving
  // provider outside the pinned list FAILS (a silent swap). Returned to the Ship Gate. ──
  export type Verdict = { ok: true; detail: string } | { ok: false; reason: string }
  export function policyVerdict(): Verdict {
    const list = pinnedList()
    // (1) the pinned understudy list is exactly the rotation (a fifth is a conscious re-pin, never a silent swap)
    const rotation = [...PlaneRpcState.ROTATION]
    const listUrls = list.map((p) => p.url)
    if (JSON.stringify(listUrls) !== JSON.stringify(rotation))
      return { ok: false, reason: `the pinned RPC understudy list [${listUrls.join(", ")}] ≠ PlaneRpcState.ROTATION [${rotation.join(", ")}] — a silent swap or an unpinned endpoint (S201/DD-97)` }
    // (3) every pinned provider maps to a name (no UNPINNED serving provider slips through)
    const unnamed = list.filter((p) => providerNameFor(p.url) === "UNPINNED")
    if (unnamed.length > 0) return { ok: false, reason: `a pinned understudy has no provider name — the per-point provenance would be UNPINNED (S201)` }
    return { ok: true, detail: `${list.length} pinned understudies === the rotation; UNREACHABLE is first-class (all-dead → UNREACHABLE{endpoints, attempts, lastError}, never a bare null); the serving provider is recorded per-point; a silent swap to an unpinned endpoint FAILS (S201/DD-97)` }
  }
}
