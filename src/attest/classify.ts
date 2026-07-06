import { Attest } from "./submission"
import { AttestAnchor } from "./anchor"

// ORGΛNON — Attestation Engine: the DETERMINISTIC tier classifier + intake validators (Phase 1; Rule XII/XIII;
// Hardening Rule XV). The tier is a DETERMINISTIC function of what was provided AND the engine-controlled commitment
// log — never a judgment, never an LLM call. The LLM may normalize a submission's FORMAT upstream (parse a CSV/spec
// into this canonical shape); it never scores, ranks, judges, or tiers.
//
// Rule XV (Hardening): a pre-registration's "committed before OOS" is established by the engine's OWN commitment
// anchor (anchor.ts), NEVER by the submitter's self-provided `committedAt`. A self-attested timestamp is not an anchor.

export namespace AttestClassify {
  export interface Tier {
    verifiability: Attest.Verifiability
    searchHonesty: Attest.SearchHonesty
    // strength = min(verifiability, search-honesty); an unconditional GO requires V2 ∧ pre-registered.
    unconditionalEligible: boolean
    reasons: string[]
  }

  // Pre-registration is valid iff the committed hash matches the spec AND an ENGINE-recorded commitment anchors it
  // before the OOS window (Rule XV). The submission's own `committedAt` is NEVER trusted — a self-attested timestamp
  // is not an anchor; only the engine's commitment log (anchor.ts) can establish the ordering.
  function preRegValid(s: Attest.Submission): { valid: boolean; reason: string } {
    const pr = s.preRegistration
    if (!pr) return { valid: false, reason: "no pre-registration" }
    // a commitment must bind to a spec — a returns-only series cannot be meaningfully pre-registered
    if (s.spec === undefined) return { valid: false, reason: "pre-registration requires a spec to bind the commitment" }
    if (Attest.hashSpec(s.spec) !== pr.contentHash) return { valid: false, reason: "content hash does not match the submitted spec" }
    const anchor = AttestAnchor.verify(pr.contentHash, pr.oosStart)
    if (!anchor.anchored) return { valid: false, reason: `pre-registration NOT anchor-verified — ${anchor.reason}` }
    return { valid: true, reason: `anchor-verified: ${anchor.reason}; hash matches spec` }
  }

  export function classify(s: Attest.Submission): Tier {
    const reasons: string[] = []

    // ── Verifiability (mechanical from the provided shape) ──
    let verifiability: Attest.Verifiability
    if (s.spec !== undefined && s.useOwnData === true) {
      verifiability = "V2"
      reasons.push("spec + ORGΛNON PIT data → V2 (fully re-derivable)")
    } else if (s.spec !== undefined && s.data !== undefined) {
      verifiability = "V1"
      reasons.push("spec + claimant data → V1 (re-simulable; data unverified)")
    } else if (Array.isArray(s.returns)) {
      verifiability = "V0"
      reasons.push("returns series only → V0 (rigor on the series; series unverified)")
    } else {
      verifiability = "V0"
      reasons.push("under-specified → defaults to weakest tier V0")
    }

    // ── Search-honesty (mechanical) ──
    let searchHonesty: Attest.SearchHonesty
    const pr = preRegValid(s)
    if (pr.valid) {
      searchHonesty = "pre-registered"
      reasons.push(`pre-registered: ${pr.reason}`)
    } else if (typeof s.declaredNTrials === "number" && s.declaredNTrials >= 1) {
      searchHonesty = "declared"
      reasons.push(`declared n_trials=${s.declaredNTrials} (unprovable → conditional)`)
      if (s.preRegistration) reasons.push(`pre-registration rejected: ${pr.reason}`)
    } else {
      searchHonesty = "undeclared"
      reasons.push("search undeclared and not pre-registered → unprovable (Rule XIII)")
    }

    return {
      verifiability,
      searchHonesty,
      unconditionalEligible: verifiability === "V2" && searchHonesty === "pre-registered",
      reasons,
    }
  }

  // Intake validation — flags (does NOT score). Catches ill-formed / implausible submissions before adjudication.
  export interface Intake {
    ok: boolean
    flags: string[]
    nObs: number
  }

  export function validate(s: Attest.Submission): Intake {
    const flags: string[] = []
    const series = s.returns ?? s.data?.returns ?? []
    const nObs = series.length

    if (Array.isArray(s.returns) || s.data?.returns) {
      if (nObs === 0) flags.push("empty returns series")
      if (series.some((r) => !Number.isFinite(r))) flags.push("non-finite values in returns")
      if (series.length > 0 && series.every((r) => r === 0)) flags.push("all-zero returns")
      // plausibility: a per-period return beyond ±100% is suspct for a normal strategy series
      if (series.some((r) => Math.abs(r) > 1)) flags.push("implausible per-period return magnitude (>100%)")
      if (nObs > 0 && nObs < 30) flags.push(`short series (${nObs} obs) — low power`)
    }
    // too-good-to-be-true claim (flag only; the adjudicator decides)
    if (typeof s.claimedSharpe === "number" && s.claimedSharpe > 4) flags.push(`claimed annualized Sharpe ${s.claimedSharpe} is implausibly high`)
    if (s.preRegistration && !preRegValid(s).valid) flags.push("pre-registration present but INVALID (see classify reasons)")

    return { ok: flags.filter((f) => f.startsWith("empty") || f.startsWith("non-finite") || f.startsWith("all-zero")).length === 0, flags, nObs }
  }
}
