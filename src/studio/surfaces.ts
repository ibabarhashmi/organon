/**
 * ORGΛNON STUDIO — the six PRODUCT SURFACES (Phase 1; Rule S-CORE, surface edition).
 *
 * The core's honesty becomes CALLABLE without becoming EDITABLE. Each surface is a thin function that adds transport,
 * validation, and provenance — NOTHING else. A verdict requested through a surface is byte-identical to the verdict
 * the core produces directly (the surface may not cost one byte — Rule VII). Every surface here is pure/deterministic
 * given its inputs, so it maps 1:1 to an MCP tool and to a gateway route without a re-implementation.
 *
 *   preflight       — breadth / floor / reachability (hedged; NEVER auto-refuses — A-PRE inherited)
 *   submit_spec     — register-then-adjudicate through the trial ledger (S-FAMILY)
 *   get_verdict     — re-derive a REGISTERED spec's verdict (byte-identical to the core)
 *   attest_claim    — external claim → deterministic tier + verdict (S-TIERS)
 *   forward_status  — the forward-pending clock as a first-class product state (never "performing")
 *   leaderboard     — tier BEFORE performance; empty-of-GO is a correct state (S-EMPTY-OK)
 */
import { Preflight } from "../organon/preflight"
import { Attest } from "../attest/submission"
import { AttestAdjudicate } from "../attest/adjudicate"
import { AttestClassify } from "../attest/classify"
import { Ledger } from "../ledger/ledger"
import { Studio } from "./adjudicate"
import { Clocks } from "./clocks"
import { StrategySpec, Constraints } from "../strategy/spec"

export namespace StudioSurfaces {
  export const CORE_VERSION = "studio-1" // stamped into every response's provenance (Rule XXV)

  // A malformed spec is REJECTED, never adjudicated (SKILL.md's promise; the walk's Cycle-1 red-team W1-04 found this
  // was not enforced — an invalid policy enum was registered and scored). Validation is RELAXED only on `constraints`
  // (optional in practice — most real specs omit it), but STRICT on family/policy/legs/weights/rebalance: a bad enum
  // or an out-of-range weight is rejected BEFORE it can pollute the ledger or receive a verdict.
  export class SpecInvalidError extends Error {}
  const SubmitSpec = StrategySpec.extend({ constraints: Constraints.optional() })
  // A leg-count boundary (Transplant Phase 2, T-REJECT): an EMPTY leg set is degenerate (nothing to allocate) and an
  // OVERSIZE one is resource-abuse (the sidecar would build a 1000-leg job). The rejection-boundary fuzz proved the zod
  // schema alone let both through behind a clean envelope — the W1-04 class. 1..MAX_LEGS is generous but bounded.
  export const MAX_LEGS = 64
  export function validateSpec(spec: unknown): void {
    const r = SubmitSpec.safeParse(spec)
    if (!r.success) throw new SpecInvalidError(`bad-spec: ${r.error.issues.map((i) => `${i.path.join(".") || "spec"}: ${i.message}`).slice(0, 4).join("; ")}`)
    const legs = r.data.legs
    if (legs.length < 1 || legs.length > MAX_LEGS) throw new SpecInvalidError(`bad-spec: legs: must have 1..${MAX_LEGS} legs (got ${legs.length}) — an empty set is degenerate, an oversize set is resource-abuse (T-REJECT)`)
  }

  // ── preflight — the agents' domain selector; reports, never refuses (A-PRE) ──
  export function preflight(panel: number[][], opts: Preflight.Options = {}): Preflight.Result & { hedged: true } {
    const r = Preflight.run(panel, { ...opts, autoRefuse: false }) // force report-only; the floor is unaudited
    return { ...r, hedged: true }
  }

  // ── submit_spec — the ONLY adjudication path: validate → write (register) THEN invoke (S-FAMILY) ──
  export async function submit_spec(store: Ledger.Store, input: Studio.SubmitInput): Promise<Studio.StudioVerdict> {
    validateSpec(input.spec) // a malformed spec is rejected here, never registered or adjudicated (W1-04)
    return Studio.submit(store, input)
  }

  // ── get_verdict — a registered spec's verdict, verbatim from the core (byte-identical) ──
  export async function get_verdict(store: Ledger.Store, spec: unknown, extras: Studio.SubmitExtras = {}): Promise<Studio.StudioVerdict> {
    return Studio.adjudicateRegistered(store, spec, extras)
  }

  // ── attest_claim — an external claim, deterministically tiered; a tier is EARNED, never declared (S-TIERS) ──
  export async function attest_claim(submission: Attest.Submission): Promise<AttestAdjudicate.Attestation> {
    return AttestAdjudicate.adjudicate(submission)
  }

  // ── forward_status — the forward clock; a first-class state with a visible, forward-only clock ──
  export interface ForwardStatus {
    state: "forward-pending" | "insufficient" | "concluded" | "restarted"
    observed: number
    needed: number
    hedge: string
    performing: false // a forward-pending strategy is NEVER "performing" (S-HONEST-UX)
    discontinuity?: Clocks.Discontinuity // present + DISPLAYED when the clock restarted (H-CLOCK)
  }
  // A restarted clock (H-CLOCK) renders as a first-class state with its discontinuity — prior time is NOT credited
  // (observed resets to 0) and the reason is shown, never hidden or backfilled.
  export function forward_status(observed: number, needed: number, clock?: Clocks.ClockState): ForwardStatus {
    if (clock && clock.state === "restarted") {
      return { state: "restarted", observed: 0, needed, hedge: Clocks.renderState(clock), performing: false, discontinuity: clock.discontinuity }
    }
    const state = observed >= needed ? "concluded" : observed > 0 ? "forward-pending" : "insufficient"
    return {
      state,
      observed,
      needed,
      hedge: `${observed} of an ASSUMED ${needed} observations — the floor is unaudited (Rule XXXVIII); the clock runs forward with no promise it clears.`,
      performing: false,
    }
  }

  // ── leaderboard — tier BEFORE performance; an empty-of-GO board is a CORRECT, proud launch state (S-EMPTY-OK) ──
  export interface Row {
    id: string
    attestation: Pick<AttestAdjudicate.Attestation, "verdict" | "verifiability" | "searchHonesty" | "unconditional"> & { performance?: number }
    // H-SCOPE — the SEARCH that produced this entry is displayed: how many trials in its family AND how many roots its
    // author has started in the domain. Making the search visible is part of the fragmentation fix, not decoration.
    familySize?: number
    rootCount?: number
    // a clearly-labeled synthetic/test-fixture row — it may RENDER a GO (so the GO path is honest before one occurs)
    // but it can NEVER be counted as a real GO on the launch board (the leak wall proves this).
    synthetic?: boolean
    // NOTE: any caller-supplied `claimedTier` is IGNORED by design — the sort derives tier from the attestation ONLY.
    claimedTier?: unknown
  }
  export interface Board {
    rows: Row[]
    emptyOfGo: boolean // true when no unconditional GO exists — the expected, correct launch state
    goCount: number
  }

  const VERIF_RANK: Record<Attest.Verifiability, number> = { V2: 2, V1: 1, V0: 0 }
  const SEARCH_RANK: Record<Attest.SearchHonesty, number> = { "pre-registered": 2, declared: 1, undeclared: 0 }
  const VERDICT_RANK: Record<AttestAdjudicate.Verdict, number> = {
    GO: 6, CONDITIONAL: 5, "CANNOT-VERIFY-DATA": 4, "CANNOT-VERIFY-SEARCH": 3, "INSUFFICIENT-EVIDENCE": 2, "NO-GO": 1,
  }

  // The tier key is a pure function of the ENGINE's attestation — never of anything the submitter claims (S-TIERS).
  export function tierKey(a: Row["attestation"]): [number, number, number] {
    return [(a.unconditional ? 1 : 0), VERDICT_RANK[a.verdict] * 10 + VERIF_RANK[a.verifiability], SEARCH_RANK[a.searchHonesty]]
  }

  export function leaderboard(rows: Row[]): Board {
    const sorted = [...rows].sort((x, y) => {
      const kx = tierKey(x.attestation), ky = tierKey(y.attestation)
      for (let i = 0; i < kx.length; i++) if (ky[i] !== kx[i]) return ky[i] - kx[i] // tier DESC, at every level, BEFORE perf
      return (y.attestation.performance ?? -Infinity) - (x.attestation.performance ?? -Infinity) // performance only as the tiebreak
    })
    // a synthetic/test-fixture GO is NEVER counted as a real GO (the leak wall proves it cannot reach this count).
    const goCount = rows.filter((r) => !r.synthetic && r.attestation.unconditional && r.attestation.verdict === "GO").length
    return { rows: sorted, emptyOfGo: goCount === 0, goCount }
  }

  // convenience: classify a raw submission's tier without adjudicating (surface parity with the deterministic classifier)
  export function classify_tier(submission: Attest.Submission): AttestClassify.Tier {
    return AttestClassify.classify(submission)
  }
}
