import { createHash } from "node:crypto"

// ORGΛNON — Attestation Engine: the canonical external submission (Phase 1; Rule XII/XIII).
//
// An external party submits a strategy CLAIM. The engine adjudicates only what it can independently verify, capping
// strength by the VERIFIABILITY tier (what was provided) and SEARCH-honesty (declared n_trials vs pre-registration).
// This module is the canonical form + the content-hash for pre-registration. The tier is assigned DETERMINISTICALLY
// (classify.ts) — never by an LLM.

export namespace Attest {
  export type Verifiability = "V0" | "V1" | "V2"
  export type SearchHonesty = "pre-registered" | "declared" | "undeclared"

  // Pre-registration (Rule XIII): a content hash of the spec committed BEFORE the out-of-sample window. This removes
  // the multiple-testing problem by construction — the claimant could not have selected the strategy on OOS data.
  export interface PreRegistration {
    contentHash: string
    committedAt: number // ms epoch the hash was committed
    oosStart: number // ms epoch the out-of-sample window begins
  }

  export interface Submission {
    id: string
    // Exactly one shape determines the verifiability tier (classify.ts is the deterministic arbiter):
    returns?: number[] // V0: a per-period returns series (the engine can run rigor ON it, but cannot verify it)
    spec?: unknown // V1/V2: the strategy (engine re-simulates deterministically)
    // V1: the claimant's own data — UNVERIFIED input (T3-equivalent; never PIT). `panel` (optional) is a runnable
    // market panel the engine can re-simulate the spec on to CHECK the claimed `returns` reproduce (Rule XIV / Phase 1).
    data?: { returns?: number[]; panel?: unknown }
    useOwnData?: boolean // V2: re-derive the spec on ORGΛNON's own PIT data
    // search-honesty inputs:
    declaredNTrials?: number // how many strategies the claimant searched (unprovable; Rule XIII)
    preRegistration?: PreRegistration
    // what the claimant asserts (compared against the engine's re-derivation; never trusted):
    claimedSharpe?: number
    claimedReturn?: number
    barsPerYear?: number // annualization basis (default 365)
  }

  // Canonical content hash of a spec — the pre-registration commitment. Deterministic (stable JSON key order).
  export function hashSpec(spec: unknown): string {
    return createHash("sha256").update(stableStringify(spec)).digest("hex")
  }

  function stableStringify(v: unknown): string {
    if (v === null || typeof v !== "object") return JSON.stringify(v)
    if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`
    const keys = Object.keys(v as Record<string, unknown>).sort()
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify((v as Record<string, unknown>)[k])}`).join(",")}}`
  }
}
