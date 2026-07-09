/**
 * ORGΛNON — the deterministic CONTRACT-RISK SUB-AXIS rule (Contract-Truth Phase 3, X-CONTRACT c/d). A pure function that
 * tiers the structural FACTS (from `facts.ts`) — this is ORGΛNON's OWN judgment over compiler-output, NO model.
 *
 * Honestly scoped — a structural screen over verified source, NEVER a full audit and NEVER a "safe" verdict:
 *   · FLAGGED         — any flagged structural surface, the specific finding NAMED (never "unsafe"). Flags are existence
 *                       proofs — reportable from any analyzed source (REAL or SAMPLE).
 *   · CLEAN-STRUCTURE — zero flagged surfaces AND a REAL verified build ("no flagged structural surfaces in the verified
 *                       source" — never "safe"). Absence-of-flags is only trustworthy on the verified deployed source.
 *   · UNVERIFIED      — no build (ABSENT), or a SAMPLE build with no flags (NOT a clean-structure claim — never a
 *                       fabricated all-clear, S27). The coarse age·size·dependency screen scores alone beneath it.
 *
 * The honest-scope label is attached to EVERY rendering. This file imports ONLY types — it never runs the analyzer, so it
 * can sit on the render path with zero per-render compilation (the analyzer runs at capture time; see `capture.ts`).
 */
import type { StructuralFacts, ContractFinding, FlagCategory } from "./facts"

export type ContractTier = "CLEAN-STRUCTURE" | "FLAGGED" | "UNVERIFIED"
export type BuildProvenance = "REAL" | "SAMPLE" | "ABSENT"

/** the pinned honest-scope label — a screen, never an audit; attached to every rendering (X-CONTRACT c, S25) */
export const CONTRACT_SCOPE = "deterministic structural screen over verified source — not a full audit, not a guarantee"

export interface ContractSubAxis {
  tier: ContractTier
  findings: ContractFinding[] // the named structural surfaces (empty for CLEAN-STRUCTURE / UNVERIFIED)
  flaggedCategories: FlagCategory[]
  buildProvenance: BuildProvenance
  scope: string // always CONTRACT_SCOPE
  reason: string // human one-liner — states specific facts, NEVER "safe"/"audited"
  contentSha: string | null // the content-hash of the captured facts (null when ABSENT)
}

/**
 * Tier a captured contract analysis. `input` is null when no verified build was analyzed (ABSENT → UNVERIFIED). Pure +
 * deterministic: the same facts + provenance → the same tier. Never emits a "safe"/"audited" judgment; never a fabricated
 * all-clear on an absent or SAMPLE build.
 */
export function contractSubAxis(
  input: { facts: StructuralFacts; provenance: "REAL" | "SAMPLE"; contentSha: string } | null,
): ContractSubAxis {
  const scope = CONTRACT_SCOPE
  if (!input)
    return { tier: "UNVERIFIED", findings: [], flaggedCategories: [], buildProvenance: "ABSENT", scope, contentSha: null,
      reason: "No verified Foundry build was analyzed for this protocol — the coarse age·size·dependency screen scores alone." }
  const { facts, provenance, contentSha } = input
  if (facts.findings.length > 0)
    return { tier: "FLAGGED", findings: facts.findings, flaggedCategories: facts.flaggedCategories, buildProvenance: provenance, scope, contentSha,
      reason: `${facts.findings.length} structural surface(s) flagged (${facts.flaggedCategories.join(", ")}) in the analyzed source — a structural screen, not a full audit.` }
  // no flagged surfaces: CLEAN-STRUCTURE is trustworthy ONLY on a REAL verified build; a SAMPLE with no flags is UNVERIFIED
  if (provenance === "REAL")
    return { tier: "CLEAN-STRUCTURE", findings: [], flaggedCategories: [], buildProvenance: "REAL", scope, contentSha,
      reason: "No flagged structural surfaces in the verified source (auth · upgrade · reentrancy · storage · oracle) — a structural screen, not a full audit and not a guarantee." }
  return { tier: "UNVERIFIED", findings: [], flaggedCategories: [], buildProvenance: "SAMPLE", scope, contentSha,
    reason: "A sample build showed no flagged surfaces, but the deployed verified source was not confirmed — not a clean-structure claim (never a fabricated all-clear)." }
}
