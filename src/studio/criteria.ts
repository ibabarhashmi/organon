/**
 * ORGΛNON — the CRITERIA MANIFEST, pinned to the Launch blueprint (Phase 0; Rule L-RECON). The per-phase exit criteria
 * and their make-or-break GATE flags are held here as data and pinned to the blueprint document by sha256. The V4
 * failure where a mandated requirement (the legacy batteries) vanished by OMISSION cannot recur: the gatekeeper loads
 * criteria only by the pinned criteria-set hash, and the blueprint pin lets any party confirm the criteria are THIS
 * document's. A gatekeeper running a set that doesn't match the pin is void.
 */
import { createHash } from "node:crypto"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { REPO_ROOT } from "../organon/frozen"

export namespace Criteria {
  // the blueprint this criteria set is derived from; recompute to confirm the criteria are the document's, not drift.
  export const BLUEPRINT_REL = "sprint/ORGANON_STUDIO_Launch_Sprint_Blueprint.md"
  export const BLUEPRINT_SHA_PINNED = "95f5402b76a622338ded2e28f1abdf9bbacd44a80618f1392f5dbbbf098e75cf"

  export interface Criterion {
    id: string
    text: string
    gate: boolean // make-or-break (L-GATE2 → unamendable in the gatekeeper)
    operatorGated?: boolean // requires an Operator unblock (L-2P / L-ENV) — the agent cannot self-satisfy it
    surface?: boolean // U-SURFACE (Reachability): a user-facing criterion — satisfiable ONLY by console-path traversal evidence
    unflagReason?: string // K-COMPLETE (Ensemble): a FILED reason lifting a lexicon auto-flag — MUST name the criterion's real consumer (auditable discretion, never silent)
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // K-COMPLETE (Ensemble Phase 0) — the reachability law's COMPLETENESS half. V12 made reachability a law but left its
  // trigger a flag the executor set BY HAND; W7-01 (the CPCV tracker, its "renders on the pro disclosure" criterion
  // passed unflagged at module level) proved the hole one phase after the law's birth. The cure: a PINNED user-facing
  // lexicon auto-flags any criterion whose text describes something a user sees/reads/reaches. Auto-flagging replaces
  // silent discretion: a criterion that HITS the lexicon is surface:true UNLESS a filed `unflagReason` lifts it (and the
  // reason must name the criterion's real consumer). A "silent unflag" — a lexicon hit with neither surface nor reason —
  // is impossible: absence of the flag on a hit still resolves to surface. The audit proves every hit is accounted for.
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  export const SURFACE_LEXICON = ["render", "display", "screen", "show", "user", "see", "read", "click", "reach", "panel", "report"] as const
  export function surfaceLexiconSha(): string {
    return sha256(stable(SURFACE_LEXICON))
  }
  // the lexicon words a criterion's text matches, INFLECTION-aware (case-insensitive; a hit means "user-facing" by the
  // law). The stem may carry a bounded suffix (s·es·ed·ing·n·able) so "renders", "screens", "reports", "displays",
  // "reaches" all hit — the W7-01 criterion said "renders", and a law that missed the plural would miss the very hole it
  // exists to close. The suffix set is deliberately bounded (no bare "d"/"y") so "seed", "ready", "reader", "used" do NOT
  // false-hit (each fails the word-boundary after an invalid suffix) — the lexicon over-triggers toward safety, never noise.
  export function autoFlagHits(text: string): string[] {
    return SURFACE_LEXICON.filter((w) => new RegExp(`\\b${w}(?:s|es|ed|ing|n|able)?\\b`, "i").test(text))
  }
  // the EFFECTIVE surface flag: explicit surface:true, OR auto-flagged by a lexicon hit UNLESS a filed unflagReason lifts
  // it. There is no silent path to false — to lift an auto-flag you must file a reason (auditable discretion, K-COMPLETE).
  export function effectiveSurface(c: Criterion): boolean {
    if (c.surface) return true
    if (autoFlagHits(c.text).length && !c.unflagReason) return true
    return false
  }
  // The AUTO-FLAG AUDIT (COMPLETE-TRUE): every criterion that hits the lexicon must be surface:true OR carry an
  // unflagReason. A hit with neither is a VIOLATION (a silently-unflagged user-facing criterion — the W7-01 class). A
  // surface:true criterion that does NOT hit the lexicon is fine (explicit discretion the other way). An unflagReason on
  // a criterion that does not hit the lexicon is dead (a reason lifting nothing) — also flagged, so reasons stay honest.
  export interface AutoFlagRow { id: string; hits: string[]; surface: boolean; unflagReason: string | null; effective: boolean; status: "surfaced" | "unflagged-with-reason" | "not-user-facing" | "VIOLATION-silent-unflag" | "VIOLATION-dead-reason" }
  export function autoFlagAudit(crits: Criterion[]): { ok: boolean; rows: AutoFlagRow[]; violations: string[] } {
    const rows: AutoFlagRow[] = crits.map((c) => {
      const hits = autoFlagHits(c.text)
      const eff = effectiveSurface(c)
      let status: AutoFlagRow["status"]
      if (hits.length && c.surface) status = "surfaced"
      else if (hits.length && c.unflagReason) status = "unflagged-with-reason"
      else if (hits.length) status = "VIOLATION-silent-unflag"
      else if (c.unflagReason) status = "VIOLATION-dead-reason"
      else status = c.surface ? "surfaced" : "not-user-facing"
      return { id: c.id, hits, surface: !!c.surface, unflagReason: c.unflagReason ?? null, effective: eff, status }
    })
    const violations = rows.filter((r) => r.status.startsWith("VIOLATION")).map((r) => `${r.id}: ${r.status} (lexicon hits: ${r.hits.join(", ") || "none"})`)
    return { ok: violations.length === 0, rows, violations }
  }

  // Derived from the blueprint's phase map (PART C) + gates (PART D). Gate ids match the blueprint's GATE names.
  export const CRITERIA: Record<string, Criterion[]> = {
    "phase-0": [
      { id: "TRUE-START", text: "environment preconditions evidenced (probe call, push, egress); gate criteria unamendable; criteria-set hash matches the pin; zero uncommitted output", gate: true },
      { id: "committed-world", text: "all V4 output + logs committed; append-only wall green over git history", gate: false, operatorGated: true },
      { id: "gates-bite", text: "gatekeeper v2 refuses ADVANCE on an amended gate criterion (seeded)", gate: true },
      { id: "criteria-pinned", text: "criteria manifest derived from + hash-pinned to the blueprint", gate: true },
      { id: "second-party-attested", text: "a genuine non-author second party attested by the Operator", gate: false, operatorGated: true },
    ],
    "phase-1": [{ id: "LEDGER-PERSISTS", text: "kill/restart/resubmit remembers; chain verifies on load; discontinuity logged, never backfilled", gate: true }],
    "phase-2": [{ id: "CLOCKS-TICKING", text: "finality settled in order; ≥3 fresh verifying stamps per live domain, or NOT TICKING stated plainly per domain", gate: true }],
    "phase-3": [{ id: "BATTERIES-WHOLE", text: "legacy suites dispositioned line-by-line; a real observed CI run link pasted", gate: true, operatorGated: true }],
    "phase-4": [{ id: "LIVE-RUN", text: "the recorded live free-model goal→verdict run, committed; verdict-path determinism proven in-run", gate: true }],
    "phase-5": [
      { id: "DOORS-OPEN", text: "served URL loaded by a genuine second party; EARNED-INDEPENDENT (non-author verify-v3); EXTERNAL-TRUE (non-author network submission at an earned tier)", gate: true, operatorGated: true },
    ],
    "phase-6": [{ id: "PRODUCT-LOOP", text: "an enrollment from a real verdict, listed permanently, OBSERVED-never-performing, un-deletable, pre-registration-anchored", gate: true }],
  }

  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  function stable(v: unknown): string {
    if (v === null || typeof v !== "object") return JSON.stringify(v)
    if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`
    const k = Object.keys(v as Record<string, never>).sort()
    return `{${k.map((x) => `${JSON.stringify(x)}:${stable((v as Record<string, unknown>)[x])}`).join(",")}}`
  }

  export function criteriaSha(): string {
    return sha256(stable(CRITERIA))
  }

  // Blueprints are gitignored (ORGANON_*.md) and were reorganized into sprint/sprint-result/ — so a pin check must
  // search the known locations and honestly distinguish ABSENT (a fresh clone: disclosed, not a failure) from
  // PRESENT-BUT-MISMATCHED (a real integrity failure). `present` lets callers skip-and-disclose vs assert-must-match.
  function findExisting(rel: string): string | null {
    const base = rel.replace(/^sprint\/(sprint-result\/)?/, "")
    for (const cand of [rel, `sprint/${base}`, `sprint/sprint-result/${base}`]) {
      const abs = path.join(REPO_ROOT, cand)
      if (existsSync(abs)) return abs
    }
    return null
  }

  // Confirm the criteria are THIS blueprint's (recompute the doc sha against the pin). Absent doc = cannot confirm.
  export function blueprintMatchesPin(): { ok: boolean; present: boolean; detail: string } {
    const abs = findExisting(BLUEPRINT_REL)
    if (!abs) return { ok: false, present: false, detail: `blueprint absent (searched sprint/ and sprint/sprint-result/) — cannot confirm the pin (expected on a fresh clone: blueprints are gitignored)` }
    const got = sha256(readFileSync(abs, "utf8"))
    return got === BLUEPRINT_SHA_PINNED ? { ok: true, present: true, detail: `blueprint sha matches the pin (${got.slice(0, 12)}…)` } : { ok: false, present: true, detail: `blueprint sha ${got.slice(0, 12)}… ≠ pin ${BLUEPRINT_SHA_PINNED.slice(0, 12)}… — the criteria may not be this document's` }
  }

  // Load criteria ONLY by a matching criteria-set hash (a hand-edited set is void — L-RECON).
  export function loadPinned(expectedCriteriaSha: string): Record<string, Criterion[]> {
    const got = criteriaSha()
    if (got !== expectedCriteriaSha) throw new Error(`criteria-set hash mismatch: got ${got.slice(0, 12)}… ≠ expected ${expectedCriteriaSha.slice(0, 12)}… — a gatekeeper on a mismatched set is VOID (L-RECON)`)
    return CRITERIA
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // CONVERGENCE sprint (v6) criteria — pinned to THIS blueprint AND printed VERBATIM beside the pin (C-RECON2), so
  // fidelity, not just provenance, is checkable by eye. A criterion in the blueprint absent from this set is an
  // INTEGRITY issue (C-RECON2), not an oversight. Gate flags trace to PART D's make-or-break gates; arms (C-ARMS)
  // are pre-declared here — a phase headline is the MINIMUM of its arms, and gate criteria are never split.
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  export const CONVERGENCE_BLUEPRINT_REL = "sprint/ORGANON_STUDIO_Convergence_Sprint_Blueprint.md"
  export const CONVERGENCE_BLUEPRINT_SHA_PINNED = "fcd434090b83b00cd8df6c3be4f5bc1de7fbb9a5e36e6a67c4695ebefda554a0"

  export const CONVERGENCE: Record<string, Criterion[]> = {
    "phase-0": [
      { id: "DEBT-CLEAR", text: "every V5 audit item closed with evidence or honestly reclassified at ZERO agent residue; capability inventory snapshotted; the criteria print reconciles against the blueprint", gate: true },
      { id: "committed-world", text: "zero uncommitted output; the append-only wall runs over REAL git history with zero disclosed skips", gate: false },
      { id: "criteria-printed", text: "derived criteria + gate/arm flags printed VERBATIM beside the blueprint pin and reconciled clause-by-clause (C-RECON2)", gate: false },
      { id: "legacy-dispositioned", text: "every legacy suite line dispositioned green-or-waived through the pinned criteria; clock-adjacent lines run against the live stamps (no missing-data alibi)", gate: false },
      { id: "second-live-trial", text: "the second live free-model trial registered; the demo's own search visibly STIFFENS its own bar; the numbers pasted", gate: false },
      { id: "attribution-complete", text: "every pending item tagged AGENT/OPERATOR/MIXED with residues; the operator lane re-issued at true zero agent residue (C-ATTRIB)", gate: false },
      { id: "ratifications", text: "C-ARMS adopted (headline=MIN, V5 Phase-0/Phase-2 headlines re-recorded REPEAT append-only); screen set amended 6→7 (Trust Panel), closed; C-ATTRIB adopted with the V5 conflation named", gate: false },
      { id: "inventory-snapshotted", text: "every proven capability paired with its proving test, snapshotted and hash-anchored — the C-NOREGRESS floor", gate: false },
    ],
    "phase-1": [
      { id: "SOLID", text: "each of the five strengthenings carries a positive-controlled proof; a panel that disagrees with raw sources is an INTEGRITY issue", gate: true },
      { id: "unattended-cadence", text: "scheduler-originated stamps accruing (not session-originated); a killed scheduler renders a GAP on the panel (C-TENSE earns 'TICKING')", gate: false },
      { id: "restore-drill", text: "ledger+stamps backup/restore drill green including a deliberately torn backup; the restored ledger remembers, the chain verifies", gate: false },
      { id: "surface-hardened", text: "authn on mutating routes, rate limits, spec-size caps, a fuzz pass with zero crashes and honest error states; the no-signing grep re-run over the served surface", gate: false },
      { id: "reachability", text: "the app reached from a party other than the serving author-session (reachable ≠ independent; L-2P still owns independence)", gate: false },
      { id: "trust-panel", text: "screen 7: walls status, clock stamp-ages+gaps, ledger head hash, battery state, parks count, independence state (PENDING until a stranger acts) — truthful against raw sources", gate: false },
    ],
    "phase-2": [
      { id: "doc-truth", text: "a clean session follows README+SKILL.md literally from nothing to a registered submission; every divergence is DOC-DRIFT, fixed until the literal path succeeds", gate: false },
      { id: "goal-presets", text: "three worked example goals for non-experts, each ending in a real (refusal-shaped) verdict + report", gate: false },
      { id: "error-honesty", text: "every user-reachable failure renders a plain-language, two-sided, non-priming state", gate: false },
      { id: "report-readability", text: "the non-expert rubric re-run on current reports; wording fixed where the reader's next-step diverges from the verdict's epistemic state", gate: false },
    ],
    "phase-3": [
      { id: "CONVERGED", text: "two consecutive CLEAN cycles (zero new issues, zero open non-parked) — OR an honest NON-CONVERGENCE STOP at cap=8 with the register published; both valid terminals, exactly one claimed", gate: true },
      { id: "walk-ledger-chained", text: "the WALK LEDGER hash-chained, complete, committed; every issue registered BEFORE any fix", gate: false },
      { id: "fixes-inventoried", text: "every fix H-MOD-inventoried and battery-plus-inventory-green; frozen core byte-identity re-proven each cycle", gate: false },
      { id: "parks-legitimate", text: "every park four-fielded (context+repro, rationale, impact, recommended next steps+sprint) and legitimacy-reviewed each cycle; a convenience park is reclassified open", gate: false },
    ],
  }

  // Arms (C-ARMS), pre-declared so a phase MAY report per-arm outcomes; each atomic; the headline = MIN(arms).
  // Gate criteria are never arms (never split). The walk cycle's six arms are the canonical use this sprint.
  export const CONVERGENCE_ARMS: Record<string, string[]> = {
    "phase-3-cycle": ["RUN", "IDENTIFY", "FIX", "QA", "RED-TEAM", "RE-EVALUATE"],
  }

  export function convergenceCriteriaSha(): string {
    return sha256(stable({ CONVERGENCE, CONVERGENCE_ARMS }))
  }

  export function blueprintMatchesConvergencePin(): { ok: boolean; present: boolean; detail: string } {
    const abs = findExisting(CONVERGENCE_BLUEPRINT_REL)
    if (!abs) return { ok: false, present: false, detail: `blueprint absent (searched sprint/ and sprint/sprint-result/) — cannot confirm the pin (expected on a fresh clone: blueprints are gitignored)` }
    const got = sha256(readFileSync(abs, "utf8"))
    return got === CONVERGENCE_BLUEPRINT_SHA_PINNED ? { ok: true, present: true, detail: `blueprint sha matches the pin (${got.slice(0, 12)}…)` } : { ok: false, present: true, detail: `blueprint sha ${got.slice(0, 12)}… ≠ pin ${CONVERGENCE_BLUEPRINT_SHA_PINNED.slice(0, 12)}…` }
  }

  // Render the pinned criteria VERBATIM for BuildLog v6 (C-RECON2). What the gatekeeper enforces == what the log prints.
  export function printVerbatim(): string {
    const lines: string[] = []
    lines.push(`blueprint: ${CONVERGENCE_BLUEPRINT_REL}`)
    lines.push(`blueprint-sha256 (pin): ${CONVERGENCE_BLUEPRINT_SHA_PINNED}`)
    lines.push(`criteria-set-sha256:    ${convergenceCriteriaSha()}`)
    lines.push("")
    for (const [phase, crits] of Object.entries(CONVERGENCE)) {
      lines.push(`${phase}:`)
      for (const c of crits) lines.push(`  [${c.gate ? "GATE " : "     "}] ${c.id} — ${c.text}${c.operatorGated ? " (OPERATOR-GATED)" : ""}`)
      const arms = CONVERGENCE_ARMS[`${phase}-cycle`]
      if (arms) lines.push(`  arms (headline=MIN): ${arms.join(" · ")}`)
    }
    return lines.join("\n")
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // TRANSPLANT sprint (v7) criteria — pinned to THIS blueprint AND printed VERBATIM beside the pin (C-RECON2). Gate
  // ids match PART D's make-or-break GATE names (DEBT-CLEAR-2 · SPLIT-WHOLE · STRONGER · CONVERGED-2). A criterion in
  // the blueprint absent from this set is an INTEGRITY issue (C-RECON2). The Phase-3 arms are the same six-arm walk
  // cycle. This set is pinned by criteria-set hash exactly like CONVERGENCE — a hand-edited set is void (L-RECON).
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  export const TRANSPLANT_BLUEPRINT_REL = "sprint/sprint-result/ORGANON_Transplant_Sprint_Blueprint.md"
  export const TRANSPLANT_BLUEPRINT_SHA_PINNED = "df411812fe63adad029cf5d0ac835ee159dbc53185ce6c998091ace8b0cc2fef"

  export const TRANSPLANT: Record<string, Criterion[]> = {
    "phase-0": [
      { id: "DEBT-CLEAR-2", text: "every V6 audit item closed with evidence; zero deletions anywhere; counts' before/after published (T-POLLUTION, T-SUPERSEDE)", gate: true },
      { id: "pollution-audit", text: "every historical ledger entry re-validated against the current schema; invalid entries quarantined by appended annotation (never deleted); family/root counts recomputed with the exclusions; a positive control catches a seeded invalid entry; before/after published", gate: false },
      { id: "phase2-correction", text: "V6's doc-truth criterion (invalidated by W1-01, evidenced in the parent env) corrected append-only per V6's own V5-correction precedent; the phase headline re-stated at its true value", gate: false },
      { id: "trail-immutability", text: "T-SUPERSEDE adopted; the trail_immutability wall green with its positive control (a seeded re-point fails); the V6 §0.7 re-pointing named as the counterexample and re-expressed as a proper superseding entry", gate: false },
      { id: "regeneration-demonstrated", text: "the regeneration scripts run then the engine-data legacy suites: green converts the waivers to proofs, failure converts them to honest blockers with the true error pasted — either outcome exit-worthy, asserting is not", gate: false },
      { id: "trial-2-labeled", text: "the ILLUSTRATIVE label appended to the V6 live-run-2 artifact and anywhere its numbers are quoted (T-REAL, retroactive)", gate: false },
      { id: "criteria-printed-floor-reanchored", text: "criteria printed VERBATIM beside this blueprint's pin; the capability floor re-anchored via a superseding (not re-pointed) entry", gate: false },
    ],
    "phase-1": [
      { id: "SPLIT-WHOLE", text: "fresh clone of the NEW repo: frozen byte-identity vs the ORIGINAL manifest; full in-scope battery green; capability floor intact; walls 12+/12+; the old tree frozen behind a pointer, nothing deleted — OR a designed, honorable STOP with V6's system intact (T-TRANSPLANT)", gate: true },
      { id: "byte-first", text: "the frozen seven + validator + pinned sha values byte-verified against the ORIGINAL manifest BEFORE anything else moves (the frozen-verify timestamp precedes all other moves)", gate: false },
      { id: "transplant-manifest", text: "a machine-generated transplant manifest (every file: source path → destination path → sha256), complete, the new repo's first exhibit", gate: false },
      { id: "pointer-committed", text: "the old tree's final Organon commit is the pointer (new location, transplant HEAD hash, 'development continues at…'); the old tree takes no further Organon commits; nothing deleted", gate: false },
      { id: "logs-lineage", text: "the four+1 BuildLogs present in the new tree with the append-only wall over their fresh history plus a recorded lineage note to the old tree", gate: false },
    ],
    "phase-2": [
      { id: "STRONGER", text: "each of the five strengthenings carries a positive-controlled proof or a legitimate four-field park; W1-04's class (wrongful acceptance behind a clean envelope) mechanically unreintroducible", gate: true },
      { id: "rejection-boundary", text: "a must-reject corpus (invalid enums incl. the W1-04 payload verbatim, hostile weights, malformed/orphaned lineage, oversize legs, boundary values) refused BEFORE registration (the ledger count unchanged — the assertion) on every mutating surface; a must-accept corpus still passes (no over-tightening); both in the battery", gate: false },
      { id: "real-returns", text: "the REAL-RETURNS live path built through the existing PIT domain pipelines (REAL-PIT-labeled, one end-to-end proof) OR four-field PARKED as pre-authorized — exactly one, never forced, never faked (T-REAL, C-PARK)", gate: false },
      { id: "served-persistence", text: "the served-persistence DECISION made with a written due-diligence memo (both options costed); the winner implemented; first contact preservable (restart-survival wall, or out-of-band capture made mandatory) BEFORE DOORS-OPEN; bounded served-abuse hardening with the sybil residual restated (T-SERVE)", gate: false },
      { id: "runbook", text: "the ten-minute first-contact RUNBOOK (tunnel → stranger script → evidence capture) rehearsed once by the author as a labeled Tier-A rehearsal (not first contact); the W3-01↔DOORS-OPEN intersection named in the lane", gate: false },
      { id: "tense-scanner", text: "the claim-vs-evidence scanner live (present-tense claims extracted from logs/docs/screens, each paired with its evidence artifact or flagged); the human table still produced; at least one seeded overclaim caught (positive control)", gate: false },
    ],
    "phase-3": [
      { id: "CONVERGED-2", text: "rotation-complete (all seven themes ≥1 cycle) AND two consecutive CLEAN cycles (zero new, zero open non-parked) — OR the honest NON-CONVERGENCE STOP at cap=10 with the register + transcripts + depth manifests published; both valid terminals, exactly one claimed truthfully (T-ROTATE, C-LOOP)", gate: true },
      { id: "walk-ledger-chained", text: "the WALK LEDGER hash-chained, complete, committed; every issue registered BEFORE any fix", gate: false },
      { id: "fixes-inventoried", text: "every fix inventoried and battery-plus-rejection-corpora-plus-floor-plus-walls-green; frozen byte-identity re-proven each cycle", gate: false },
      { id: "parks-legitimate", text: "every architectural finding four-fielded (context+repro, rationale, impact, recommended next steps+sprint) and legitimacy-reviewed each cycle; a convenience park is reclassified open (C-PARK)", gate: false },
      { id: "rotation-depth", text: "all seven themes rotated; every cycle publishes a depth manifest (personas × acts × full/abbreviated, a full three-persona pass at least every second cycle); a prior cycle replayed from its transcript; the pollution spot-audit run in the tamper cycle (T-ROTATE)", gate: false },
    ],
  }

  export const TRANSPLANT_ARMS: Record<string, string[]> = {
    "phase-3-cycle": ["RUN", "IDENTIFY", "FIX", "QA", "RED-TEAM", "RE-EVALUATE"],
  }

  export function transplantCriteriaSha(): string {
    return sha256(stable({ TRANSPLANT, TRANSPLANT_ARMS }))
  }

  export function blueprintMatchesTransplantPin(): { ok: boolean; present: boolean; detail: string } {
    const abs = findExisting(TRANSPLANT_BLUEPRINT_REL)
    if (!abs) return { ok: false, present: false, detail: `blueprint absent (searched sprint/ and sprint/sprint-result/) — cannot confirm the pin (expected on a fresh clone: blueprints are gitignored)` }
    const got = sha256(readFileSync(abs, "utf8"))
    return got === TRANSPLANT_BLUEPRINT_SHA_PINNED ? { ok: true, present: true, detail: `blueprint sha matches the pin (${got.slice(0, 12)}…)` } : { ok: false, present: true, detail: `blueprint sha ${got.slice(0, 12)}… ≠ pin ${TRANSPLANT_BLUEPRINT_SHA_PINNED.slice(0, 12)}…` }
  }

  export function printVerbatimTransplant(): string {
    const lines: string[] = []
    lines.push(`blueprint: ${TRANSPLANT_BLUEPRINT_REL}`)
    lines.push(`blueprint-sha256 (pin): ${TRANSPLANT_BLUEPRINT_SHA_PINNED}`)
    lines.push(`criteria-set-sha256:    ${transplantCriteriaSha()}`)
    lines.push("")
    for (const [phase, crits] of Object.entries(TRANSPLANT)) {
      lines.push(`${phase}:`)
      for (const c of crits) lines.push(`  [${c.gate ? "GATE " : "     "}] ${c.id} — ${c.text}${c.operatorGated ? " (OPERATOR-GATED)" : ""}`)
      const arms = TRANSPLANT_ARMS[`${phase}-cycle`]
      if (arms) lines.push(`  arms (headline=MIN): ${arms.join(" · ")}`)
    }
    return lines.join("\n")
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // WARRANTY sprint (v8) criteria — pinned to THIS blueprint AND printed VERBATIM beside the pin (C-RECON2). Gate ids
  // match PART C/D's make-or-break GATE names (TRAIL-TRUE · ROOTS-KNOWN · STRONGER-2 · CONVERGED-2). The new physics
  // this sprint adopts (F-CONTINUE, F-ENV, F-IDENTITY, F-ABSENT, F-BUDGET) is expressed as sub-criteria under those
  // gates. A criterion in the blueprint absent from this set is an INTEGRITY issue (C-RECON2). The Phase-3 arms are the
  // same six-arm walk cycle. Pinned by criteria-set hash exactly like TRANSPLANT — a hand-edited set is void (L-RECON).
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  export const WARRANTY_BLUEPRINT_REL = "sprint/sprint-result/ORGANON_Warranty_Sprint_Blueprint.md"
  export const WARRANTY_BLUEPRINT_SHA_PINNED = "28cf003f976eea61abeb75dd1e5704a2dc300eb5e8f49703e2103200dd37b4e9"

  export const WARRANTY: Record<string, Criterion[]> = {
    "phase-0": [
      { id: "TRAIL-TRUE", text: "V7's loop closed with the truth: a continuation/lineage marker appended to V7 as a VALUE (not an argument); the V6 Phase-2 headline filed as a value (REPEAT); the log_terminal_marker wall green with its positive control; the setup fixed + fresh-clone-demonstrated; absences seeded each linked to a park (F-CONTINUE, F-ABSENT, T1-01)", gate: true },
      { id: "continuation-marker", text: "the V7 terminal reconciled and continued by an appended, dated, chained VALUE marker (a log may never simply stop) — reconciled truthfully against what V7's committed trail actually says (F-CONTINUE)", gate: false },
      { id: "headline-value", text: "the V6 Phase-2 headline re-stated as the value REPEAT per T-SUPERSEDE — the softening argument retired, the number filed (append-only)", gate: false },
      { id: "terminal-marker-wall", text: "the log_terminal_marker wall live: a marker-less (trailed-off) revision FAILS loudly (positive control); the F-CONTINUE-era logs' latest committed revision must end in a recognized state marker; pre-rule legacy logs disclosed + grandfathered (adopted forward, never by editing history)", gate: false },
      { id: "env-hygiene", text: "the stale parallel checkout marked retired (a pointer note; nothing deleted); the relocated-venv shebang hazard repaired/documented; requirements-studio.txt shipped + organon-setup.sh pointed at it + a fresh-clone setup demonstrated (T1-01)", gate: false },
      { id: "absences-seeded", text: "Inventory gains an ABSENCES section seeded from P1-1 (engine backtest, RWA own-data re-execution), each linked to its park + owner-sprint; verify() flags an absence without a park as an open issue; the checkpoint renders the full diff (gains/losses/absences) (F-ABSENT)", gate: false },
      { id: "criteria-printed", text: "criteria printed VERBATIM beside this blueprint's pin; the capability floor re-anchored via a superseding (not re-pointed) entry (C-RECON2)", gate: false },
    ],
    "phase-1": [
      { id: "ROOTS-KNOWN", text: "the RWA drift adjudicated under F-ENV — exactly one classification (ENVIRONMENTAL/LOGIC/UNDETERMINED) DERIVED from a candidate matrix with per-environment sha evidence pasted; ZERO re-pins without established root cause; the reproducibility-contract scaffolding in the battery (this gate is where the series decides whether 'frozen' means reproducible or merely old)", gate: true },
      { id: "candidate-matrix", text: "candidate environments enumerated UP FRONT (current stack · pinned-original library versions · the relocated stale-checkout venv) and the RWA verdict regenerated under each; a sha/decision table per candidate (F-ENV)", gate: false },
      { id: "classification-derived", text: "exactly one of ENVIRONMENTAL · LOGIC · UNDETERMINED, DERIVED from the table, not asserted; a fourth outcome is a Halt", gate: false },
      { id: "outcome-executed", text: "the outcome executed — root-cause closure with a reproducibility contract (pin stays, now regenerable) · an owner-level Rule-XVII re-baseline DECISION or its four-field park · invariants-as-contract + token UNPINNED + forensics-attached park — with zero pressure re-pins", gate: false },
      { id: "lockfile-pinned", text: "the sidecar scientific stack pinned as a hashed lockfile (the go-forward environment regardless of outcome)", gate: false },
      { id: "repro-contracts", text: "reproducibility contracts scaffolded for every generated artifact: inputs pinned OR their honest absence named (FRED-gated data named absent), a lockfile, a generator pin, a regen test that runs where data permits and states BLOCKED where it does not — each in the battery", gate: false },
    ],
    "phase-2": [
      { id: "STRONGER-2", text: "each item a positive-controlled proof, a decided memo, or a legitimate four-field park — exactly one per item; W1-04's class mechanically unreintroducible; advertised == actual, rendered (F-IDENTITY)", gate: true },
      { id: "rejection-boundary", text: "a must-reject corpus (invalid enums incl. the W1-04 payload verbatim, hostile weights, malformed/orphaned lineage, oversize legs, boundary values) refused BEFORE registration (ledger count unchanged) on every mutating surface; a must-accept corpus still passes (T-REJECT) — carried from V7, re-verified", gate: false },
      { id: "served-persistence", text: "the served-persistence DECISION with its memo; the winner implemented; a stranger-shaped submission demonstrably survives a restart (or is demonstrably captured) BEFORE DOORS-OPEN; bounded abuse hardening; the sybil residual restated (T-SERVE) — carried from V7, re-verified", gate: false },
      { id: "runbook", text: "the ten-minute first-contact RUNBOOK rehearsed once as a labeled Tier-A rehearsal (not first contact) — carried from V7, re-verified", gate: false },
      { id: "tense-scanner", text: "the claim-vs-evidence scanner live with a seeded overclaim caught (positive control) — carried from V7, re-verified", gate: false },
      { id: "real-returns", text: "real-returns formalized as its pre-authorized park against the absent data plane (P1-1); ILLUSTRATIVE labels verified everywhere; a REAL-PIT path scheduled with the data-plane sprint — never a hybrid hack (T-REAL, C-PARK) — carried from V7, re-verified", gate: false },
      { id: "identity-matrix", text: "the IDENTITY memo (three options costed: data-plane-first · publish-slim-honest · hold) DECIDED; the CAPABILITY MATRIX rendered (README + Trust Panel) — capabilities AND deliberate absences with park links; publication identity-gated (publish refused until the memo's winner is implemented) AND Operator-gated (F-IDENTITY, F-ABSENT) — NEW this sprint", gate: false },
    ],
    "phase-3": [
      { id: "CONVERGED-2", text: "rotation-complete (all seven themes ≥1 cycle) AND two consecutive CLEAN cycles (zero new, zero open non-parked) — OR the honest NON-CONVERGENCE STOP at cap=10 with the register + transcripts + depth manifests published; both valid terminals, exactly one claimed truthfully; NOT-REACHED exists only behind a recorded pre-walk STOP (T-ROTATE, C-LOOP, F-BUDGET)", gate: true },
      { id: "walk-ledger-chained", text: "the WALK LEDGER hash-chained, complete, committed; every issue registered BEFORE any fix", gate: false },
      { id: "fixes-inventoried", text: "every fix inventoried and battery-plus-rejection-corpora-plus-floor-plus-ABSENCES-plus-walls-green; frozen byte-identity re-proven each cycle; no scope shrank without an absence entry + park (F-ABSENT)", gate: false },
      { id: "parks-legitimate", text: "every architectural finding four-fielded (context+repro, rationale, impact, recommended next steps+sprint) and legitimacy-reviewed each cycle; a convenience park is reclassified open (C-PARK)", gate: false },
      { id: "rotation-depth", text: "all seven themes rotated (doc-lies now includes matrix-vs-reality; tamper includes the pollution spot-audit); every cycle a depth manifest (personas × acts × full/abbreviated, a full three-persona pass at least every second cycle); a prior cycle replayed from its transcript (T-ROTATE)", gate: false },
    ],
  }

  export const WARRANTY_ARMS: Record<string, string[]> = {
    "phase-3-cycle": ["RUN", "IDENTIFY", "FIX", "QA", "RED-TEAM", "RE-EVALUATE"],
  }

  export function warrantyCriteriaSha(): string {
    return sha256(stable({ WARRANTY, WARRANTY_ARMS }))
  }

  export function blueprintMatchesWarrantyPin(): { ok: boolean; present: boolean; detail: string } {
    const abs = findExisting(WARRANTY_BLUEPRINT_REL)
    if (!abs) return { ok: false, present: false, detail: `blueprint absent (searched sprint/ and sprint/sprint-result/) — cannot confirm the pin (expected on a fresh clone: blueprints are gitignored)` }
    const got = sha256(readFileSync(abs, "utf8"))
    return got === WARRANTY_BLUEPRINT_SHA_PINNED ? { ok: true, present: true, detail: `blueprint sha matches the pin (${got.slice(0, 12)}…)` } : { ok: false, present: true, detail: `blueprint sha ${got.slice(0, 12)}… ≠ pin ${WARRANTY_BLUEPRINT_SHA_PINNED.slice(0, 12)}…` }
  }

  export function printVerbatimWarranty(): string {
    const lines: string[] = []
    lines.push(`blueprint: ${WARRANTY_BLUEPRINT_REL}`)
    lines.push(`blueprint-sha256 (pin): ${WARRANTY_BLUEPRINT_SHA_PINNED}`)
    lines.push(`criteria-set-sha256:    ${warrantyCriteriaSha()}`)
    lines.push("")
    for (const [phase, crits] of Object.entries(WARRANTY)) {
      lines.push(`${phase}:`)
      for (const c of crits) lines.push(`  [${c.gate ? "GATE " : "     "}] ${c.id} — ${c.text}${c.operatorGated ? " (OPERATOR-GATED)" : ""}`)
      const arms = WARRANTY_ARMS[`${phase}-cycle`]
      if (arms) lines.push(`  arms (headline=MIN): ${arms.join(" · ")}`)
    }
    return lines.join("\n")
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // DATA-PLANE sprint (v9) criteria — pinned to THIS blueprint AND printed VERBATIM beside the pin (C-RECON2). Gate ids
  // match PART C/D's make-or-break GATE names (CENSUS-TRUE · STORE-TRUE · DIFF-PROVEN · REAL-TRUE · CONVERGED-3). The
  // new physics this sprint adopts (D-SEAM, D-DIFF, D-DOMAIN, D-TWOWAY, D-CHOKE, D-LABEL, D-WALK+) is expressed as
  // sub-criteria under those gates. A criterion in the blueprint absent from this set is an INTEGRITY issue (C-RECON2).
  // The Phase-4 walk arms are the same six-arm cycle. Pinned by criteria-set hash — a hand-edited set is void (L-RECON).
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  export const DATAPLANE_BLUEPRINT_REL = "sprint/sprint-result/ORGANON_DataPlane_Sprint_Blueprint.md"
  export const DATAPLANE_BLUEPRINT_SHA_PINNED = "47b3f2028c7e6c2927b301e0a2814bd88ca1345bbc33681bbcfc5042fdb0c4e5"

  export const DATAPLANE: Record<string, Criterion[]> = {
    "phase-0": [
      { id: "CENSUS-TRUE", text: "the chokepoint census table complete with per-control evidence hashes AND a caught seeded dangling control (the census's own positive control); zero dangling controls unaccounted; the oracle judges a known hand-verified fixture correctly; the old tree untouched (git-status-clean asserted+pasted before/after every oracle session) (D-CHOKE, D-DIFF, A′#6, A′#9)", gate: true },
      { id: "census-complete", text: "script/chokepoint-census.ts enumerates every control (walls, gates, corpora, validators, the publication chokepoint, byte-match, provenance checks) → its enforcement point → a DEMONSTRATED refusal (the governed path run WITHOUT the control's condition → refused; evidence hash); a dangling control is a registered finding fixed-smallest-change or four-field parked (D-CHOKE)", gate: false },
      { id: "seeded-dangling-caught", text: "a real check deliberately unwired in a scratch fixture MUST be caught by the census — its own positive control; a census that caught no seeded control is void (A′#6)", gate: false },
      { id: "oracle-proven", text: "script/oracle.ts runs the frozen monorepo engine READ-ONLY (the byte-identical sidecar) on a known lending fixture whose expected output is HAND-VERIFIED; the oracle's judgment matches the hand computation; the old tree's git status is clean before AND after, pasted (D-DIFF, A′#9)", gate: false },
      { id: "scope-contract", text: "the per-domain scope contract printed into the log: lending → funding → fee-yield → RWA, each with its DONE condition (byte-equivalent to the oracle) and its honest BLOCKED condition (absent data/credential) (D-DOMAIN)", gate: false },
      { id: "criteria-printed-baseline", text: "criteria printed VERBATIM beside this blueprint's pin; the floor/absences baseline snapshotted (C-RECON2, C-NOREGRESS)", gate: false },
    ],
    "phase-1": [
      { id: "STORE-TRUE", text: "the leak wall green with a seeded leak caught; hash-chained nonce-anchored snapshots captured + provenance-chained for every credential-free domain; a deliberately skipped run renders as a GAP; a retro-captured (nonce-less) snapshot refused; the RWA path BLOCKED-on-credential rendered never faked; the FRED key never committed (grep-wall) (D-SEAM, D-LABEL, A′#3, A′#5)", gate: true },
      { id: "leak-wall", text: "test/walls/dataplane_leak.test.ts: any import resolving into OpenCode/engine-infra/sibling-package paths FAILS the battery; standalone-native by construction; positive-controlled with a seeded leak (D-SEAM, A′#3)", gate: false },
      { id: "snapshots-provenance-chained", text: "the credential-free domains captured into hash-chained nonce-anchored snapshots (the Capture.Service clock-stamp pattern reused verbatim); snapshot provenance objects (source, capture time, content hash, chain position) attached; ≥1 verifying snapshot per delivered domain; retro-capture impossible by construction (L-TICK, D-LABEL)", gate: false },
      { id: "gap-honest", text: "a missed/skipped capture renders as a GAP, never interpolated or smoothed (H-CLOCK extended to the data plane); a seeded interpolation path is hunted and absent", gate: false },
      { id: "rwa-blocked-rendered", text: "the RWA snapshot path built + tested against fixtures, wired to FRED_API_KEY as an Operator env var (never committed — a grep-wall); rendering BLOCKED-on-credential wherever RWA data would appear; a keyless RWA read returns the BLOCKED state, never a stale or fabricated payload (A′#5, D-LABEL)", gate: false },
    ],
    "phase-2": [
      { id: "DIFF-PROVEN", text: "every CLAIMED domain proven byte-equivalent to the frozen monorepo oracle on hash-pinned shared fixtures (evidence pasted per domain: fixture hash, oracle output hash == port output hash); blocked domains stated with their one-line unblock; the direction-blind differential catches a seeded flattering divergence; the sidecar regression-lock green; frozen seven byte-identical; zero old-tree commits (D-DIFF, D-DOMAIN, D-SEAM, A′#2, A′#9)", gate: true },
      { id: "per-domain-differential", text: "script/differential.ts runs each hash-pinned fixture through the oracle (monorepo sidecar, read-only) AND the standalone port, byte-diffing every output artifact; lending byte-identical (the primary delivered domain); each additionally-claimed domain likewise; a claimed domain without its differential is a Halt (D-DIFF, A′#11)", gate: false },
      { id: "seeded-divergence-caught", text: "a seeded one-line divergence in the port (e.g. an off-by-one window, a flattering series) is caught at the BYTE level; the differential is direction-blind — byte-inequality is failure regardless of which side looks better (A′-adversarial, Phase-2)", gate: false },
      { id: "sidecar-regression-lock", text: "the ported engine body (accrual.py / lending_accrual.py) is byte-identical to the monorepo oracle's (sha256 match, the seam-faithful proof); a re-homed TS buildJob restored with its original call contract; the sidecar path's byte-behavior regression-locked (D-SEAM)", gate: false },
      { id: "blocked-stated", text: "the RWA differential run IF the credential + data exist, ELSE BLOCKED stated with its unblock; a blocked differential is an honest state, a SKIPPED one is a Halt (D-DIFF, D-TWOWAY)", gate: false },
    ],
    "phase-3": [
      { id: "REAL-TRUE", text: "at least one REAL-PIT live adjudication exists end-to-end with provenance a skeptic can trace (resolving to a chained snapshot); the absences/parks accounting exact (every conversion proof-backed in the inventory diff); the matrix true by byte-match; both byte-regen outcomes honored if the door was walked, else BLOCKED stated exactly once — the pin unchanged in all (D-LABEL, D-TWOWAY, F-IDENTITY, F-ABSENT)", gate: true },
      { id: "real-pit-live", text: "the live path (goal → spec → REAL-PIT adjudication) routes a credential-free-domain spec through the ported engine on a real captured snapshot; every artifact/report/screen carries REAL-PIT + attached provenance; an unprovenanced REAL-PIT label is an S2 (D-LABEL)", gate: false },
      { id: "deflation-demo-realpit", text: "the deflation demo re-run REAL-PIT (the family-size mechanism on real data), a labeled successor to the ILLUSTRATIVE trial-2 — its numbers never conflated with the old ones (labels + artifact hashes keep them apart) (D-LABEL, T-REAL)", gate: false },
      { id: "conversions-proof-backed", text: "per delivered domain: absence removed + capability added + park-closure entry referencing the park (P2-1 closed; P1-1 closed per delivered domain or explicitly partial; P0-1 residual per the door); the inventory diff renders every conversion; nothing converts without its proof (F-ABSENT)", gate: false },
      { id: "two-way-door", text: "IF FRED_API_KEY arrived: regenerate data/snapshot + run the RWA byte-regen under the pinned engine lockfile — MATCH closes ENVIRONMENTAL at the letter (asterisk retired), MISMATCH REOPENS the classification as LOGIC-candidate via supersession (celebrated as the system working), the pin unchanged in both; ELSE BLOCKED stated, the door remains; a re-pin in either outcome is a Halt, a suppressed MISMATCH is a Halt (D-TWOWAY)", gate: false },
      { id: "identity-retold", text: "the matrix re-rendered FROM CODE (byte-match re-locked) after the conversions; the identity-memo ADDENDUM filed (scope grew; 'slim' retired where untrue; per-domain reality incl. any remaining BLOCKED); the publication gate re-armed against the NEW matrix; consent re-issued as re-ratification (F-IDENTITY, growth direction)", gate: false, operatorGated: true },
    ],
    "phase-4": [
      { id: "CONVERGED-3", text: "the RAISED floor: rotation-complete (all seven data-plane-aware themes ≥1 cycle) AND two consecutive CLEAN cycles at FULL depth (three personas × all acts) AND at least four cycles total — OR the honest NON-CONVERGENCE STOP at cap=10 with the register + transcripts + depth manifests published; both valid terminals, exactly one claimed truthfully, first line of the terminal; NOT-REACHED exists only behind a recorded pre-walk STOP (D-WALK+, T-ROTATE, C-LOOP, F-BUDGET)", gate: true },
      { id: "walk-ledger-chained", text: "the WALK LEDGER hash-chained, complete, committed; every issue registered BEFORE any fix", gate: false },
      { id: "fixes-inventoried", text: "every fix inventoried and battery-plus-leak-wall-plus-differential-spot-check-plus-floor-plus-ABSENCES-green; frozen byte-identity re-proven each cycle; no scope shrank without an absence entry + park (F-ABSENT, C-NOREGRESS)", gate: false },
      { id: "parks-legitimate", text: "every architectural finding four-fielded (context+repro, rationale, impact, recommended next steps+sprint) and legitimacy-reviewed each cycle; a convenience park is reclassified open (C-PARK)", gate: false },
      { id: "rotation-depth-raised", text: "all seven themes rotated (tamper now includes the PIT-snapshot-chain + the store spot-audit; doc-lies now audits REAL/ILLUSTRATIVE labels + provenance + the new matrix); every cycle a FULL-depth manifest (three personas × all acts); a prior cycle replayed from its transcript (D-WALK+, T-ROTATE)", gate: false },
    ],
  }

  export const DATAPLANE_ARMS: Record<string, string[]> = {
    "phase-4-cycle": ["RUN", "IDENTIFY", "FIX", "QA", "RED-TEAM", "RE-EVALUATE"],
  }

  export function dataplaneCriteriaSha(): string {
    return sha256(stable({ DATAPLANE, DATAPLANE_ARMS }))
  }

  export function blueprintMatchesDataplanePin(): { ok: boolean; present: boolean; detail: string } {
    const abs = findExisting(DATAPLANE_BLUEPRINT_REL)
    if (!abs) return { ok: false, present: false, detail: `blueprint absent (searched sprint/ and sprint/sprint-result/) — cannot confirm the pin (expected on a fresh clone: blueprints are gitignored)` }
    const got = sha256(readFileSync(abs, "utf8"))
    return got === DATAPLANE_BLUEPRINT_SHA_PINNED ? { ok: true, present: true, detail: `blueprint sha matches the pin (${got.slice(0, 12)}…)` } : { ok: false, present: true, detail: `blueprint sha ${got.slice(0, 12)}… ≠ pin ${DATAPLANE_BLUEPRINT_SHA_PINNED.slice(0, 12)}…` }
  }

  export function printVerbatimDataplane(): string {
    const lines: string[] = []
    lines.push(`blueprint: ${DATAPLANE_BLUEPRINT_REL}`)
    lines.push(`blueprint-sha256 (pin): ${DATAPLANE_BLUEPRINT_SHA_PINNED}`)
    lines.push(`criteria-set-sha256:    ${dataplaneCriteriaSha()}`)
    lines.push("")
    for (const [phase, crits] of Object.entries(DATAPLANE)) {
      lines.push(`${phase}:`)
      for (const c of crits) lines.push(`  [${c.gate ? "GATE " : "     "}] ${c.id} — ${c.text}${c.operatorGated ? " (OPERATOR-GATED)" : ""}`)
      const arms = DATAPLANE_ARMS[`${phase}-cycle`]
      if (arms) lines.push(`  arms (headline=MIN): ${arms.join(" · ")}`)
    }
    return lines.join("\n")
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // END-USER sprint (v10) criteria — pinned to THIS blueprint AND printed VERBATIM beside the pin (C-RECON2). Gate ids
  // match PART C/D's make-or-break GATE names (PREVENT-TRUE · TRANSFORM-PROVEN · DOMAINS-ATTEMPTED · JOINED-LOOP ·
  // CONVERGED-4). The new physics this sprint adopts (E-CATALOG, E-ROOTCAUSE, E-CONSOLE, E-ATTEMPT, E-PREVENT, E-SANDBOX)
  // is expressed as sub-criteria under those gates. A criterion in the blueprint absent from this set is an INTEGRITY
  // issue (C-RECON2). The Phase-4 walk arms are the same six-arm cycle. Pinned by criteria-set hash — a hand-edited
  // set is void (L-RECON). This sprint answers the V9 audit's five findings at the root.
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  export const ENDUSER_BLUEPRINT_REL = "sprint/sprint-result/ORGANON_EndUser_Sprint_Blueprint.md"
  export const ENDUSER_BLUEPRINT_SHA_PINNED = "d2c3cb24df131a43509a6ae9e4cdea929247367a688dc114d2332fe62d4b0521"

  export const ENDUSER: Record<string, Criterion[]> = {
    "phase-0": [
      { id: "PREVENT-TRUE", text: "the three prevention walls bite on seeded violations AND pass a clean commit; the E2E catalog pinned BEFORE any fixing with every scenario carrying its expected honest behavior; the ATTEMPT law live with V9's funding/fee-yield renegotiation retro-filed as a dated append-only value; the history-blob disclosure audit complete with W4-01's permanence disclosed and ZERO rewrites (E-PREVENT, E-CATALOG, E-ATTEMPT)", gate: true },
      { id: "attempt-law-live", text: "the ATTEMPT law: the scope-contract vocabulary gains ATTEMPT/DELIVERED/DEFER/BLOCKED-with-evidence; a BLOCKED disposition REQUIRES attempt evidence (steps, artifacts, exact failure, unblock) reviewed like a park; an ATTEMPT→DEFER conversion requires a recorded gatekeeper amendment, never silence; V9's funding/fee-yield renegotiation retro-filed as a dated, append-only, hash-chained value (E-ATTEMPT)", gate: false },
      { id: "prevention-walls", text: "a pre-commit gate (blob-size cap · raw-data patterns [the W4-01 class] · credential patterns [the FRED class]) each proven fail-closed on a seeded violation (an oversized fixture, an embedded data array, a literal key) and passing a clean commit; the hook wired via core.hooksPath (E-PREVENT, A′#8)", gate: false },
      { id: "history-disclosure", text: "script/history-blob-audit.ts inventories the large/suspicious blobs already permanent in history (W4-01's ~464KB differential fixture named + sized; the inherited transplant blobs named); the permanence DISCLOSED (this repository cannot un-commit; prevention is the only medicine); ZERO rewrites, by constitution — a history rewrite is a Halt (E-PREVENT, A′#8)", gate: false },
      { id: "catalog-pinned", text: "the E2E scenario catalog (data/studio/e2e-catalog-v10.json) pre-registered and hash-pinned BEFORE any fixing: personas × workflows × the mandated adversarial/edge classes (hostile/malformed console input · dead model endpoint mid-goal · stripped-provenance series · concurrent submissions · rate-limit storm via the UI · enrollment cap from the console · mid-flow restart · BLOCKED domains requested anyway · a replayed request); every scenario names its EXPECTED HONEST BEHAVIOR (so a scenario fails by succeeding wrongly, not only by erroring); red-team may ADD, never remove — a removal is caught (E-CATALOG, A′#5)", gate: false },
      { id: "criteria-printed-baseline", text: "criteria printed VERBATIM beside this blueprint's pin; the floor/absences baseline snapshotted (C-RECON2, C-NOREGRESS)", gate: false },
    ],
    "phase-1": [
      { id: "TRANSFORM-PROVEN", text: "the ORIGINAL monorepo TS transform run in a sandbox that wrote NOTHING to the frozen tree, against the standalone rewrite on pre-pinned identical snapshots, to EXACTLY ONE derived outcome — MATCH retiring the D-DIFF asterisk at the letter, or MISMATCH root-caused to an honest disposition — never nudged quiet; fixtures pinned pre-run; zero frozen-tree writes/installs (git status pasted before/after); every adjustment root-caused (E-SANDBOX, A′#1)", gate: true },
      { id: "sandbox-discipline", text: "a throwaway sandbox copy of the monorepo at a DISTINCT path; dependencies installed IN THE COPY only; the frozen old tree takes ZERO writes and ZERO installs, its git status clean pasted BEFORE and AFTER every sandbox session; the copy's outputs are evidence, never merges (E-SANDBOX, A′#7)", gate: false },
      { id: "both-transforms-run", text: "the ORIGINAL monorepo transform (Runner.buildJob's per-leg series construction + commonWindow) AND the standalone rewrite (DataPlaneEngine.buildLendingJob's marketPayload + commonWindow) run on identical hash-pinned captured snapshots; the fixtures pinned BEFORE the first run (a re-derived fixture after a mismatch is exposed by the pre-run pin) (E-SANDBOX)", gate: false },
      { id: "one-outcome-derived", text: "exactly one outcome, DERIVED: MATCH (the per-leg series + window byte-identical → 'oracle-judged' now true of the port, the supersede entry filed) or MISMATCH (localized field-by-field, root-caused, disposed: port-fixed-to-match with the mechanism stated, or the ORIGINAL-was-wrong owner-level disposition, park-eligible, celebrated as the system working; the differential re-run post-disposition) (A′#1, D-TWOWAY's spirit)", gate: false },
      { id: "adjustments-rootcaused", text: "every port adjustment carries its root cause (symptom → mechanism → origin); NO silent port-adjustment to force a MATCH; the supersede entry (the asterisk retired or the classification annotated) filed append-only (E-ROOTCAUSE, T-SUPERSEDE)", gate: false },
    ],
    "phase-2": [
      { id: "DOMAINS-ATTEMPTED", text: "funding and fee-yield each carried to DELIVERED with its differential OR BLOCKED with attempt evidence reviewed like a park AND second-attempted (a different endpoint / a different reconstruction route); a token attempt is reclassified an open issue; a delivery without its differential is a Halt; a third silent deferral is a Halt; conversions proof-backed; the pin unchanged (E-ATTEMPT, D-DOMAIN, A′#2/#11)", gate: true },
      { id: "funding-attempted", text: "funding — a credential-free freepit T1 reconstruction (public venue endpoints) genuinely attempted with attempt evidence (steps, artifacts, exact failure if any, the unblock) → DELIVERED (≥3 chained snapshots · differential byte-identical · a REAL-PIT adjudication possible) or BLOCKED-with-evidence + a second differently-shaped attempt (E-ATTEMPT, D-DOMAIN)", gate: false },
      { id: "feeyield-attempted", text: "fee-yield — the Py3.11/pandas discovery-panel environment stood up under a hashed lockfile and genuinely attempted → the same DELIVERED-or-BLOCKED-with-evidence, second-attempted (E-ATTEMPT, D-DOMAIN)", gate: false },
      { id: "deliveries-differential-proven", text: "any DELIVERED domain byte-equivalent to the frozen oracle on hash-pinned fixtures (the transform differential where the original had that domain's path); a delivery without its differential is refused by the DONE condition; absences converted with park-closure entries; the matrix re-rendered if scope grew; the inventory diff exact (D-DIFF, F-ABSENT)", gate: false },
      { id: "pin-unchanged", text: "RWA stays credential-gated and is absorbed mid-sprint if the key arrives (D-TWOWAY unchanged); the RWA pin untouched either way; no re-pin through any door — a re-pin is a Halt (S-CORE, D-TWOWAY)", gate: false },
    ],
    "phase-3": [
      { id: "JOINED-LOOP", text: "the end-to-end joined artifact exists (goal text, model id, transcript hash, spec hash, ledger ids, verdict reproHash, provenance chain refs, report hash) with EVERY physics rule intact inside it; the console live — one flow, derives nothing, skips nothing — and the joined demo end-to-end (model present, data REAL-PIT); a ledger-skipping console path, a softened verdict, or a joined demo that isn't end-to-end is a Halt (E-CONSOLE, S-PROPOSE, D-LABEL, A′#4/#12)", gate: true },
      { id: "console-live", text: "the Goal Console — the 8th screen, the closed set amended 7→8 ONCE and closed again (SCREENS.length === 8); one flow (goal input → honest live progress states including the dead-endpoint failure state → the verdict card + the plain-language report + the enroll action); derives nothing (input collection + verbatim rendering of API responses); every mutation through write-then-invoke identical to the API path (the console holds no privileged route); rate limits + input caps apply to the form as to the API (E-CONSOLE, A′#3)", gate: false },
      { id: "console-copy-honest", text: "the console copy passes the honesty checker (no priming; the NO-GO framed as the product working; no summary that editorializes the verdict); the verbatim-relay wall catches a console reply that softens; a hidden console route skipping the ledger is hunted and absent (E-CONSOLE, A′#4)", gate: false },
      { id: "joined-artifact", text: "the joined loop recorded — a plain-English goal typed into the console → the free-model agent path (schema-walled, registered, family-counted) → a REAL-PIT adjudication on a DELIVERED domain → provenance + report; the artifact bundle committed and re-verifying (the verdict re-adjudicates byte-identically from the pinned snapshots); the family count includes the console's own submissions (the demo deflates itself); CI stays fixture-only (the live run is an artifact, never a dependency) (D-LABEL, S-PROPOSE, S-FREE)", gate: false },
      { id: "identity-retold-console", text: "the matrix re-told (+console, +joined-loop capabilities), the memo addendum filed, the publication gate re-armed for re-ratification against the NEW matrix; consent re-issued as re-ratification (the agent cannot self-consent, L-2P) (F-IDENTITY, growth direction)", gate: false, operatorGated: true },
      { id: "walk-budget-confirmed", text: "the F-BUDGET projection recorded; the walk budget (the protected majority) confirmed explicitly before the micro-loop closes (F-BUDGET)", gate: false },
    ],
    "phase-4": [
      { id: "CONVERGED-4", text: "catalog-complete AND rotation-complete (all seven console-aware themes ≥1 cycle) AND two consecutive FULL-depth clean cycles AND at least four cycles total — OR the cap's honest NON-CONVERGENCE STOP at cap=10 with the register + transcripts + depth manifests + catalog coverage published — OR a recorded pre-walk STOP; exactly one, truthfully, first line of the terminal; NOT-REACHED exists only behind a recorded pre-walk STOP (E-CATALOG, E-ROOTCAUSE, C-USER, C-LOOP, F-BUDGET)", gate: true },
      { id: "walk-ledger-chained", text: "the WALK LEDGER hash-chained, complete, committed; every issue registered BEFORE any fix", gate: false },
      { id: "fixes-rootcaused", text: "every fix carries its root cause (symptom → mechanism → origin) + the smallest-change fix (inventoried) + the re-test artifact (the failing scenario re-run to confirmed resolution, hashed); a mechanism-free fix is symptom-patching — an open issue, not a resolution; battery-plus-prevent-walls-plus-leak-wall-plus-floor-plus-ABSENCES-green each cycle; frozen byte-identity re-proven; no scope shrank without an absence entry + park (E-ROOTCAUSE, F-ABSENT, C-NOREGRESS)", gate: false },
      { id: "catalog-traversed", text: "a CLEAN cycle traverses the pinned catalog in FULL (realistic personas × workflows AND the adversarial/edge scenarios), each judged against its pre-declared expected honest behavior (a scenario fails by succeeding wrongly, not only by erroring); red-team may ADD scenarios mid-walk, never remove; a CLEAN claimed on a partial traverse is a Halt (E-CATALOG)", gate: false },
      { id: "parks-legitimate", text: "every architectural/high-risk finding four-fielded (context+repro, rationale, impact, recommended next steps+sprint) and legitimacy-reviewed each cycle; a convenience park reclassified open; the park-legitimacy theme spot-audits root-cause AND attempt entries for boilerplate (C-PARK, E-ROOTCAUSE)", gate: false },
      { id: "rotation-depth-console", text: "all seven themes rotated, CONSOLE-AWARE (ux-priming + injection aimed at the console's every state; tamper incl. the PIT-snapshot chains + the store spot-audit; doc-lies incl. REAL/ILLUSTRATIVE labels + the matrix + the console copy); every cycle a FULL-depth manifest (three personas × all acts, through the UI first); a prior cycle replayed from its transcript (T-ROTATE, D-WALK+, C-USER)", gate: false },
    ],
  }

  export const ENDUSER_ARMS: Record<string, string[]> = {
    "phase-4-cycle": ["RUN", "IDENTIFY", "FIX", "QA", "RED-TEAM", "RE-EVALUATE"],
  }

  export function enduserCriteriaSha(): string {
    return sha256(stable({ ENDUSER, ENDUSER_ARMS }))
  }

  export function blueprintMatchesEnduserPin(): { ok: boolean; present: boolean; detail: string } {
    const abs = findExisting(ENDUSER_BLUEPRINT_REL)
    if (!abs) return { ok: false, present: false, detail: `blueprint absent (searched sprint/ and sprint/sprint-result/) — cannot confirm the pin (expected on a fresh clone: blueprints are gitignored)` }
    const got = sha256(readFileSync(abs, "utf8"))
    return got === ENDUSER_BLUEPRINT_SHA_PINNED ? { ok: true, present: true, detail: `blueprint sha matches the pin (${got.slice(0, 12)}…)` } : { ok: false, present: true, detail: `blueprint sha ${got.slice(0, 12)}… ≠ pin ${ENDUSER_BLUEPRINT_SHA_PINNED.slice(0, 12)}…` }
  }

  export function printVerbatimEnduser(): string {
    const lines: string[] = []
    lines.push(`blueprint: ${ENDUSER_BLUEPRINT_REL}`)
    lines.push(`blueprint-sha256 (pin): ${ENDUSER_BLUEPRINT_SHA_PINNED}`)
    lines.push(`criteria-set-sha256:    ${enduserCriteriaSha()}`)
    lines.push("")
    for (const [phase, crits] of Object.entries(ENDUSER)) {
      lines.push(`${phase}:`)
      for (const c of crits) lines.push(`  [${c.gate ? "GATE " : "     "}] ${c.id} — ${c.text}${c.operatorGated ? " (OPERATOR-GATED)" : ""}`)
      const arms = ENDUSER_ARMS[`${phase}-cycle`]
      if (arms) lines.push(`  arms (headline=MIN): ${arms.join(" · ")}`)
    }
    return lines.join("\n")
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // SPINE sprint (v11) criteria — pinned to THIS blueprint AND printed VERBATIM beside the pin (C-RECON2). The first
  // research-driven sprint: research enters by RATIFICATION (R-RATIFY), every new statistic is ADVISORY-FIRST proven by
  // a verdict differential (R-ADVISORY), complexity pays its pinned DoF bill behind a noise wall (R-DOF), refusals date
  // themselves as hedged ranges (R-ETA), and the first cross-venue domain renders at MIN(legs) (R-BASIS). Gate flags
  // trace to PART D's make-or-break gates; arms are pre-declared (headline = MIN); gate criteria are never split.
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  export const SPINE_BLUEPRINT_REL = "sprint/sprint-result/ORGANON_Spine_Sprint_Blueprint.md"
  export const SPINE_BLUEPRINT_SHA_PINNED = "5e975656f85837165dac8a87762bb642908753d930add4c5cf099e15d78e03fd"

  export const SPINE: Record<string, Criterion[]> = {
    "phase-0": [
      { id: "RATIFIED-TRUE", text: "every research item dispositioned as a VALUE with flip-criteria (ADOPT: breadth panel · CPCV-advisory · VoC-sandboxed-with-DoF · funding-basis · pro-disclosure toggle — each citing its research finding + cheap pre-build test + flip-criteria; PARK-WITH-EXPERIMENT: ensemble · shared-ledger/tournament · HRP · ZKML — each with the four park fields + a designed experiment whose pre-registered outcome decides it; REJECT: full-Kelly core redesign · CPCV gating-promotion-now · uncharged proposer exploration · any signing path); the catalog v11 pinned BEFORE any new surface existed; the ratification wall refuses an unratified build artifact; zero adoptions by citation (R-RATIFY, E-CATALOG, A′#4)", gate: true },
      { id: "ratification-table-filed", text: "data/studio/research-ratification-v11.json value-filed + hash-chained: each ADOPT row cites the SPECIFIC research finding it rests on (a row that cannot cite is re-dispositioned), its cheap pre-build test, and its flip-criteria; each PARK row carries context+repro · rationale · impact · next-steps PLUS a designed experiment (hypothesis · method · pre-registered outcome); each REJECT row carries its reason + flip-criteria; the chain verifies (R-RATIFY)", gate: false },
      { id: "ratification-wall-live", text: "a permanent wall (research_ratified.test.ts) refuses a build artifact whose item lacks an ADOPT ratification row; a seeded unratified module is CAUGHT; an ADOPT row lacking a research-finding citation is refused by the value schema; an adoption filed as prose ('obviously good') is refused (R-RATIFY, A′#4)", gate: false },
      { id: "catalog-v11-pinned", text: "data/studio/e2e-catalog-v11.json pre-registered + hash-pinned BEFORE any spine surface exists: v10's 15 carried (anti-removal spans catalog generations) + the new-surface scenarios (breadth 'why not yet' · the hedged ETA RANGE · CPCV-beside-frozen · CPCV-SKIPPED-honest · the VoC DoF charge visible · the NOISE-INJECTION adversarial · the basis MIN-tier · the pro-toggle deriving nothing), each naming its expected honest behavior; red-team may ADD, never remove (E-CATALOG, A′#5)", gate: false },
      { id: "criteria-printed-baseline", text: "criteria printed VERBATIM beside this blueprint's pin; the floor/absences baseline snapshotted; the three prevention walls green on a seeded violation each + a clean commit (C-RECON2, C-NOREGRESS, E-PREVENT)", gate: false },
    ],
    "phase-1": [
      { id: "BREADTH-TRUE", text: "the Fundamental-Law breadth panel (IR = IC × √BR × TC) recovers known IC/BR within the pinned tolerance on the cheap test FIRST; the forward-clock ETA is a DERIVED, HEDGED, re-deriving RANGE (assumptions listed, the floor-audit hedge verbatim, a point estimate is a failure) able to say 'this class may never reach power at this cadence'; the pro-disclosure toggle derives nothing and the screen count stays 8; the verdict differential byte-identical (the panel moved no verdict) (R-ETA, R-ADVISORY, A′#3)", gate: true },
      { id: "breadth-cheap-test-first", text: "the ratified cheap test runs BEFORE any real strategy sees the panel: synthetic strategies with KNOWN IC/BR/TC recovered within the pinned tolerance; the ETA formula hand-verified first-principles (given IC, BR, the frozen gates' thresholds → the observation count → the calendar range at the domain cadence) with the arithmetic pasted; a failed cheap test refuses the build (R-RATIFY)", gate: false },
      { id: "eta-hedged-range", text: "the ETA renders as a RANGE with its assumptions listed and the floor-audit hedge verbatim; re-derives as clocks accrue; never a point, never a promise; the BR estimator STATES its independence assumption on the panel (overlapping daily observations are not independent bets); a seeded point-estimate ETA and a seeded independence overclaim are each CAUGHT (R-ETA)", gate: false },
      { id: "toggle-derives-nothing", text: "the pro-disclosure toggle exposes raw panels (IC/BR/TC · DSR/PBO · CPCV-when-present) on the EXISTING report/rigor screens, display-only, deriving nothing; SCREENS.length === 8 (no ninth screen, E-CONSOLE, A′#8); a seeded toggle that derives a number is CAUGHT", gate: false },
      { id: "breadth-verdict-differential", text: "the same pinned submissions adjudicated before and after the panel landed → BYTE-IDENTICAL verdicts (the panel changed nothing it shouldn't); the panel computes OUTSIDE the write-then-invoke verdict path (R-ADVISORY, A′#1)", gate: false },
    ],
    "phase-2": [
      { id: "CPCV-TRUE", text: "CPCV added as a BOUNDED, PINNED-configuration ADVISORY panel proven on the GOLDEN PAIR in both directions (a known-overfit fixture flags HIGH on PBO-CPCV; a known-signal synthetic passes) BEFORE any real strategy sees it; runtime measured within the pinned budget; SKIPPED rendered as a first-class honest state; the promotion-to-gating decision PARKED with pre-registered criteria; the verdict differential byte-identical (R-ADVISORY, A′#5/#10)", gate: true },
      { id: "cpcv-golden-pair", text: "the golden pair holds BOTH directions on the cheap test first: a parameter-mined synthetic the frozen DSR already dislikes flags HIGH on PBO-CPCV; a planted honest-effect synthetic passes; the disagreement between CPCV and the DSR family (staged on a high-DoF synthetic) renders as information ('panels disagree; the frozen gate decides'), never averaged away (R-ADVISORY)", gate: false },
      { id: "cpcv-config-pinned-skipped", text: "a bounded pinned configuration (group count · purge window · embargo — values in the criteria, not tunable per-run); a seeded per-run config tweak (purge shortened to flatter a result) is CAUGHT; runtime budgeted; SKIPPED (budget exceeded / data too short) renders as a first-class state on a deliberately-short series, never a silent absence (A′#5)", gate: false },
      { id: "cpcv-promotion-parked", text: "the promotion park filed: pre-registered promotion criteria (agreement/disagreement rates vs the frozen gates over the next N real adjudications) + the owner decision to follow; promoting CPCV to gating now is REJECTED with the rejection logged (advisory-first is the point) (A′#10)", gate: false },
      { id: "cpcv-verdict-differential", text: "the same pinned submissions adjudicated before and after the CPCV panel landed → BYTE-IDENTICAL verdicts; a seeded 'CPCV says fine, soften the NO-GO' report sentence is CAUGHT by the honesty checker + R-ADVISORY (R-ADVISORY, A′#1)", gate: false },
    ],
    "phase-3": [
      { id: "COMPLEXITY-PAYS", text: "the VoC (ridge/random-features) proposer admitted only behind the HARDEST wall in the codebase — pure NOISE through the full path (feature generation → ridge fit at the pinned penalty → proposal → write-then-invoke at the pinned DoF charge → the frozen deflation) → ZERO survivors, the kill-switch proven by a seeded survivor — with its effective-DoF charge mapping PINNED and hash-logged BEFORE its first run, every exploration charged through the identical write-then-invoke gate, the charge visible on every report, attribution two-sided-or-limitation-stated, EXPERIMENTAL labeled everywhere, the verdict differential byte-identical; a STOP here that ships Phases 1/2/4 without the proposer is a pre-authorized honorable outcome (R-DOF, A′#2/#9/#12)", gate: true },
      { id: "voc-noise-wall-first", text: "the noise wall runs FIRST, before any real-data proposal: pure noise across many seeds through the full proposer→charge→deflation path yields ZERO deflation survivors; the kill-switch (proposer class disabled pending an owner decision, the event a first-class finding) is proven by a SEEDED survivor; the noise battery is re-run at multiple penalty settings incl. the weakest, and any setting that yields a survivor is BANNED in the pinned mapping (the honesty is empirical, not assumed) (R-DOF, A′#2)", gate: false },
      { id: "voc-mapping-pinned", text: "dofCharge = ceil(effectiveDoF(penalty, featureCount, n)) — the effective degrees of freedom under the pinned ridge penalty (trace of the ridge hat matrix), conservative (a ceiling, never a floor); the mapping pinned + its hash logged in the ratification row BEFORE the first proposal; a post-hoc penalty adjustment to lower the charge is CAUGHT by the pinned mapping hash; an unpinned proposer cannot submit (R-DOF, A′#2)", gate: false },
      { id: "voc-every-exploration-charged", text: "every exploration AND every proposal charged through the identical write-then-invoke ledger gate (no uncharged fitting — fitting IS searching); an uncharged exploration path (a fit that never registers) is absent BY CONSTRUCTION, proven; the proposer touches specs, never verdicts (capability absence re-proven under a poisoned-feature injection) (R-DOF, A′#12)", gate: false },
      { id: "voc-charge-visible-experimental", text: "the report section shows the family charge ('this proposal cost the family N trials') + two-sided plain-language attribution (what the model leaned on; what would break it) OR pro-panel-only with the limitation stated (A′#9); EXPERIMENTAL on every surface the proposer touches; the verdict differential byte-identical over the baseline submissions (the proposer is upstream of the gate, like every agent) (R-DOF, R-ADVISORY)", gate: false },
    ],
    "phase-4": [
      { id: "BASIS-ATTEMPTED", text: "the CeFi-DeFi funding-basis domain attempted under the ATTEMPT law — DELIVERED-with-fixture-proof or BLOCKED-with-second-attempted-evidence, exactly one, never a silent defer; Hyperliquid captured nonce-chained + T2-forward beside the Binance T1 legs; the basis series tiered at MIN(legs) on EVERY render; the pipeline proven on a first-principles hand-verified fixture (no oracle exists); a basis-carry goal adjudicated through the console with per-leg tiers rendered; the pin unchanged, the frozen seven untouched (R-BASIS, E-ATTEMPT, A′#6)", gate: true },
      { id: "basis-cheap-test-first", text: "the ratified cheap test FIRST: the Hyperliquid public funding endpoint probed (free, keyless, documented, the probe evidenced), and a first-principles hand-verified basis fixture (a small window of known Binance T1 intervals + hand-captured Hyperliquid points → the basis computed by hand) reproduced BYTE-FOR-BYTE by the pipeline (the V9 known-fixture discipline reused) (R-RATIFY, R-BASIS)", gate: false },
      { id: "basis-min-tier-labeled", text: "the basis series tier = MIN(leg tiers), labeled on EVERY render with the per-leg tiers carried; a seeded T1 label on the basis series is CAUGHT by the MIN-tier wall; a seeded retro Hyperliquid 'history' is refused by nonce physics (T2-forward from first capture); a seeded fabricated interval bridging a gap breaks the chain; the spread's own divergence (venues disagreeing in a squeeze) renders honestly (R-BASIS, A′#6)", gate: false },
      { id: "basis-attempt-resolved", text: "capture chained + gap-honest across ≥2 runs if reachable (T2-forward), OR BLOCKED-with-evidence + a second differently-shaped attempt (alternate venue/endpoint) reviewed like a park; a DELIVERED carries its fixture-proof differential; a token attempt is reclassified an open issue; the disposition filed in the ATTEMPT ledger (E-ATTEMPT, D-DOMAIN)", gate: false },
      { id: "basis-pin-unchanged-budget", text: "the RWA pin untouched (no re-pin through any door — a re-pin is a Halt); the frozen seven byte-identical; the F-BUDGET projection recorded and the walk budget (the protected majority) confirmed explicitly before the micro-loop closes (S-CORE, D-TWOWAY, F-BUDGET)", gate: false },
    ],
    "phase-5": [
      { id: "CONVERGED-5", text: "catalog-complete AND rotation-complete (all seven spine-aware themes ≥1 cycle) AND two consecutive FULL-depth clean cycles AND at least four cycles total — OR the cap's honest NON-CONVERGENCE STOP at cap=10 with the register + transcripts + depth manifests + catalog coverage published — OR a recorded pre-walk STOP; exactly one, truthfully, first line of the terminal; NOT-REACHED exists only behind a recorded pre-walk STOP (E-CATALOG, E-ROOTCAUSE, C-USER, C-LOOP, F-BUDGET)", gate: true },
      { id: "walk-ledger-chained", text: "the WALK LEDGER hash-chained, complete, committed; every issue registered BEFORE any fix (id · severity · class · repro · evidence)", gate: false },
      { id: "fixes-rootcaused", text: "every fix carries its root cause (symptom → mechanism → origin) + the smallest-change fix (inventoried) + the re-test artifact (the failing scenario re-run to confirmed resolution, hashed); a mechanism-free fix is symptom-patching — an open issue, not a resolution; battery + prevent walls + the NOISE WALL + a verdict-differential spot-check + floor + ABSENCES green each cycle; frozen byte-identity re-proven; no scope shrank without an absence entry + park (E-ROOTCAUSE, F-ABSENT, C-NOREGRESS, R-DOF)", gate: false },
      { id: "catalog-traversed", text: "a CLEAN cycle traverses the pinned catalog v11 in FULL (realistic personas × workflows AND the adversarial/edge/spine scenarios incl. the noise-injection adversarial + the ETA-hedge + the basis-tier checks), each judged against its pre-declared expected honest behavior (a scenario fails by succeeding wrongly); red-team may ADD, never remove; a CLEAN on a partial traverse is a Halt (E-CATALOG)", gate: false },
      { id: "parks-legitimate", text: "every architectural/high-risk finding four-fielded (context+repro · rationale · impact · next steps+sprint) and legitimacy-reviewed each cycle; a convenience park reclassified open; the park-legitimacy theme spot-audits the flip-criteria parks + the designed experiments for boilerplate (C-PARK, E-ROOTCAUSE)", gate: false },
      { id: "rotation-depth-spine", text: "all seven themes rotated, SPINE-AWARE (ux-priming hunts the ETA hardest; injection incl. the noise-injection + poisoned features; laundering incl. DoF under-charging probes; doc-lies incl. the ETA hedges + advisory labels + basis tiers + DoF charge visibility; tamper incl. the PIT + basis chains + the pollution spot-audit); every cycle a FULL-depth manifest (personas × acts, through the UI first); a prior cycle replayed from its transcript (T-ROTATE, D-WALK+, C-USER)", gate: false },
    ],
  }

  export const SPINE_ARMS: Record<string, string[]> = {
    "phase-5-cycle": ["RUN", "IDENTIFY", "FIX", "QA", "RED-TEAM", "RE-EVALUATE"],
  }

  export function spineCriteriaSha(): string {
    return sha256(stable({ SPINE, SPINE_ARMS }))
  }

  export function blueprintMatchesSpinePin(): { ok: boolean; present: boolean; detail: string } {
    const abs = findExisting(SPINE_BLUEPRINT_REL)
    if (!abs) return { ok: false, present: false, detail: `blueprint absent (searched sprint/ and sprint/sprint-result/) — cannot confirm the pin (expected on a fresh clone: blueprints are gitignored)` }
    const got = sha256(readFileSync(abs, "utf8"))
    return got === SPINE_BLUEPRINT_SHA_PINNED ? { ok: true, present: true, detail: `blueprint sha matches the pin (${got.slice(0, 12)}…)` } : { ok: false, present: true, detail: `blueprint sha ${got.slice(0, 12)}… ≠ pin ${SPINE_BLUEPRINT_SHA_PINNED.slice(0, 12)}…` }
  }

  export function printVerbatimSpine(): string {
    const lines: string[] = []
    lines.push(`blueprint: ${SPINE_BLUEPRINT_REL}`)
    lines.push(`blueprint-sha256 (pin): ${SPINE_BLUEPRINT_SHA_PINNED}`)
    lines.push(`criteria-set-sha256:    ${spineCriteriaSha()}`)
    lines.push("")
    for (const [phase, crits] of Object.entries(SPINE)) {
      lines.push(`${phase}:`)
      for (const c of crits) lines.push(`  [${c.gate ? "GATE " : "     "}] ${c.id} — ${c.text}${c.operatorGated ? " (OPERATOR-GATED)" : ""}`)
      const arms = SPINE_ARMS[`${phase}-cycle`]
      if (arms) lines.push(`  arms (headline=MIN): ${arms.join(" · ")}`)
    }
    return lines.join("\n")
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // REACHABILITY sprint (v12) criteria — pinned to THIS blueprint AND printed VERBATIM beside the pin (C-RECON2). The
  // sprint that kills the series' three-time disease: reachability becomes LAW. User-facing criteria are FLAGGED
  // `surface: true` — satisfiable ONLY by console-path traversal evidence (U-SURFACE), never module evidence alone.
  // Evidence-driven regime changes supersede their ratification rows in the same phase (U-RESUPERSEDE); fresh-clone
  // proofs run pristine (U-PRISTINE); parked experiments run under criteria hash-checked unchanged (U-EXPERIMENT);
  // terminal numbers are machine-derived (U-DERIVED); the screen set moves 8→9 once, the Guided Builder (U-AMEND).
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  export const REACH_BLUEPRINT_REL = "sprint/sprint-result/ORGANON_Reachability_Sprint_Blueprint.md"
  export const REACH_BLUEPRINT_SHA_PINNED = "d57ba36743156dd12ed4dab975bfa69ae14a6c57419305214d4e2ff2b648c6bf"

  export const REACH: Record<string, Criterion[]> = {
    "phase-0": [
      { id: "SURFACED-TRUE", text: "reachability is LAW: the SURFACING CENSUS complete with its seeded unsurfaced capability CAUGHT (every user-facing capability mapped to console-path evidence; a dangling one fixed-smallest-change or four-field parked); the four V11 debts filed as append-only values (the VoC→OOS ratification SUPERSESSION referencing the original ADOPT row's hash; the V7–V10 fresh-clone scope correction; the 22/23 reconciliation; the summary-differential mechanism live); the U-SURFACE law in the gatekeeper's vocabulary refusing module-only evidence on a flagged criterion; the catalog v12 pinned BEFORE any new surface exists (U-SURFACE, U-RESUPERSEDE, U-DERIVED, E-CATALOG, A′#2/#4)", gate: true },
      { id: "voc-supersession-filed", text: "the VoC→OOS regime change filed as a SUPERSEDE in the ratification chain (append-only, referencing the original ADOPT row's hash 537e0647…; stating that what shipped is out-of-sample validation with a pinned effective-DoF surcharge, the in-sample regime permanently banned; the Phase-3 root cause as evidence) — U-RESUPERSEDE's founding instance; the chain re-verifies + is coherent (no dangling supersession) (U-RESUPERSEDE, T-SUPERSEDE)", gate: false },
      { id: "backward-scope-correction", text: "the V7–V10 fresh-clone scope correction filed as a precise, adjective-free value: those proofs verified the battery under environments where an inherited venv satisfied the stale organon-common.sh path; they did not verify pristine-environment setup (W6-04 closed the defect; this note closes the claim) (U-PRISTINE, A′#9)", gate: false },
      { id: "summary-differential-live", text: "the 22/23 reconciliation closed by a summary-differential mechanism (script/summary-differential.ts) that regenerates every terminal figure (floor, matrix PRESENT/ABSENT, battery totals, cycle counts) from its source artifact and diffs against the prose; a hand-typed number disagreeing with its artifact is a finding, not a typo (U-DERIVED)", gate: false },
      { id: "surfacing-census-seeded", text: "the census enumerates every user-facing capability and demands each map to an admissible console-path traversal (fresh serve → real screen → real interaction → rendered result → a failure state); a seeded unsurfaced capability (a real capability deliberately given no traversal) MUST be caught or the census fails its own gate; dangling capabilities become findings (A′#2, U-SURFACE)", gate: false },
      { id: "usurface-law-live", text: "the U-SURFACE law lives in the gatekeeper's criteria vocabulary (a `surface` flag; a flagged criterion refuses module-only evidence); a seeded module-only artifact on a flagged criterion is REFUSED; retroactively, had U-SURFACE existed, V11's W6-01 would have been caught at BREADTH-TRUE (demonstrated) (U-SURFACE, A′#1)", gate: false },
      { id: "catalog-v12-pinned-baseline", text: "catalog v12 (v11's 23 carried + S9-builder-compose-happy · S10-builder-invalid-refused · S11-builder-defaults-conservative · S12-experiment-outcomes-rendered · S13-pristine-setup · S14-traversal-audit) pinned with content-sha BEFORE any new surface exists; criteria printed verbatim; floor/absences baseline; prevention walls green (E-CATALOG, C-RECON2, C-NOREGRESS)", gate: false },
    ],
    "phase-1": [
      { id: "WALLS-DEEPER", text: "the walls at their own written specs: the noise battery λ-SWEEP complete under pre-pinned parameters (a weak · λ=1.0 · a strong penalty × feature counts × the seed battery, the full OOS path each; survivor-yielding settings banned by a mapping SUPERSESSION with the seed evidence; a clean sweep leaves the mapping unchanged, files its evidence anyway); every live venue at the FORMALIZED capture floor (≥3 chained stamps across ≥2 runs) with Hyperliquid brought up to it; the PRISTINE fresh-clone harness (isolated HOME, enumerated prerequisites, no inherited venvs) green from nothing with a positive control catching an inherited environment (R-DOF, R-BASIS, U-PRISTINE, A′#7/#8)", gate: true },
      { id: "noise-sweep-pinned", text: "the λ-sweep pinned parameters (penalty set · feature counts · seed count · thresholds) fixed in the criteria BEFORE running; the outcome table (per-setting survivor counts) pasted, all zero OR banned-with-evidence via a mapping supersession; a seeded survivor at the weak penalty fires the ban path with its evidence; the sweep's granularity is itself evidence-driven (A′#8)", gate: false },
      { id: "capture-floor-formalized", text: "the capture floor formalized as a named constant (≥3 chained stamps across ≥2 distinct runs per venue) and asserted by a wall; Hyperliquid brought up to the floor with additional live captures (gap-honest, T2-forward, chain-verified); a seeded fourth capture claiming a chain it doesn't extend breaks the chain (R-BASIS)", gate: false },
      { id: "pristine-harness-green", text: "the pristine fresh-clone harness (script/pristine-clone.ts): isolated temp HOME, no inherited venvs, no parent-dir fallbacks; the prerequisite enumeration (system-provided: bun · python3 · git, doc-truth-tested; repo-provided: everything else) pasted; setup-to-battery green from nothing; a deliberately-inherited environment is CAUGHT by the isolation check (positive control) (U-PRISTINE, A′#7)", gate: false },
      { id: "walls-verdict-differential", text: "the frozen seven byte-identical; the verdict differential byte-identical after the walls deepened (R-ADVISORY)", gate: false },
    ],
    "phase-2": [
      { id: "EXPERIMENTS-ANSWERED", text: "both V11-parked experiments answered under criteria hash-checked UNCHANGED against the ratification chain (a mismatch Halts before anything runs): the ENSEMBLE experiment (planted-correlation synthetic families, each member INSUFFICIENT; the near-duplicate pool MUST fail as its positive control; the pre-registered criterion decides legitimate-pooling vs laundering) and the SHARED-LEDGER COHERENCE experiment (synthetic multi-author families under candidate scopings; the pre-registered fairness/coherence criterion decides); exactly one DERIVED outcome per experiment, filed as a park-disposing value (NO closes with evidence; YES converts to a future-sprint ADOPT with flip-criteria); ZERO product built past either outcome; the CPCV promotion tracker instrumented (U-EXPERIMENT, A′#3/#4/#10)", gate: true },
      { id: "criteria-hash-checked", text: "both experiments' criteria loaded from V11's filed ratification values and hash-checked against the chain (ensemble 1bb0dfd1…, coherence 6d49e6b6…); a mismatch is a Halt before anything runs; a seeded criterion edit pre-run Halts (U-EXPERIMENT, A′#3)", gate: false },
      { id: "outcomes-derived-positive-controls", text: "each experiment's planted truths recovered as its own positive control (the near-duplicate ensemble pool fails as it must; a laundered coherence search is detected); outcomes derived MECHANICALLY (the value files the computed result beside the pre-registered threshold), never asserted; adversarial corners probed, fragility documented (A′#3)", gate: false },
      { id: "parks-disposed-zero-build", text: "each park disposed by its outcome (a SUPERSEDE of the PARK row: NO closes; YES → future-sprint ADOPT); ZERO product built past either outcome — a seeded 'scaffold the ensemble feature' commit is caught by the ratification wall as an unratified build artifact (U-EXPERIMENT, A′#4)", gate: false },
      { id: "experiments-verdict-differential", text: "the CPCV promotion tracker accrues on a test adjudication + renders on the pro disclosure; the verdict differential byte-identical (R-ADVISORY)", gate: false },
    ],
    "phase-3": [
      { id: "BUILDER-REACHABLE", text: "the GUIDED BUILDER (screen 9, the set amended 8→9 once and closed again) is BORN under U-SURFACE — its gate passes ONLY on a console-path traversal artifact (fresh serve → the builder screen → compose a spec over the existing typed primitives → submit → registered → verdict → the spine panels 'why not yet · when, honestly' → enroll, PLUS a failure state: an invalid composition refused with an honest non-priming message), hashed and filed; the form derives nothing (validation from the same schema the API enforces), submits through the identical write-then-invoke gate with declared family/lineage, ships conservative ratified defaults with honesty-checked plain-language help; the verdict differential byte-identical; SCREENS.length===9 closed (U-AMEND, U-SURFACE, S-PROPOSE, S-FAMILY, A′#5/#6)", gate: true, surface: true },
      { id: "builder-amendment-closed", text: "the screen set amended 8→9 explicitly (the Guided Builder) and closed again (SCREENS.length===9; a tenth refused by construction); one screen, schema-driven forms over EXISTING primitives only (lending · funding · basis), no new primitive types, no free-form code, no model calls from the form (U-AMEND, A′#5/#11)", gate: false },
      { id: "builder-defaults-honest", text: "conservative defaults ratified in the criteria (no leverage-forward, no GO-hunting presets); every field's plain-language help honesty-checked (a default or copy a red-team judge reads as risk-priming or GO-seeking is an S2); lineage-in-the-form explained in plain language ('editing and resubmitting counts as another attempt — the bar stiffens; this is the product working') (A′#6, S-FAMILY)", gate: false },
      { id: "builder-physics-traversal", text: "a composed spec submits through the identical write-then-invoke gate with declared family/lineage (a builder-composed resubmission visibly stiffens its family on the report); a form path that skips the ledger is absent by construction (the form posts to the documented endpoint only); the traversal artifact (happy + failure) is the gate's ONLY sufficient evidence; the walk budget confirmed (U-SURFACE, S-FAMILY, F-BUDGET)", gate: false },
    ],
    "phase-4": [
      { id: "CONVERGED-6", text: "catalog-complete AND rotation-complete (all seven reachability-aware themes ≥1 cycle) AND two consecutive FULL-depth clean cycles AND at least four cycles total — all THREE doors (preset · goal · builder) walked through the UI/UX first on a pristine clone — OR the cap's honest NON-CONVERGENCE STOP at cap=10 with the register + transcripts + depth manifests + catalog coverage published — OR a recorded pre-walk STOP; exactly one, truthfully, first line of the terminal (E-CATALOG, E-ROOTCAUSE, C-USER, C-LOOP, U-SURFACE, F-BUDGET)", gate: true },
      { id: "walk-ledger-chained", text: "the WALK LEDGER hash-chained, complete, committed; every issue registered BEFORE any fix (id · severity · class · repro · evidence)", gate: false },
      { id: "fixes-rootcaused", text: "every fix carries its root cause (symptom → mechanism → origin) + the smallest-change fix (inventoried) + the re-test artifact (the failing scenario re-run to confirmed resolution, hashed); a mechanism-free fix is symptom-patching — an open issue; battery + prevent walls + the SWEPT noise wall + the venue floor + a verdict-differential spot-check + the summary differential green each cycle; frozen byte-identity re-proven (E-ROOTCAUSE, F-ABSENT, C-NOREGRESS)", gate: false },
      { id: "catalog-traversed-three-doors", text: "a CLEAN cycle traverses the pinned catalog v12 in FULL (all three doors preset·goal·builder + the adversarial/edge/reachability scenarios incl. the traversal-theater audit S14 + the builder priming hunt), each judged against its pre-declared expected honest behavior (a scenario fails by succeeding wrongly); red-team may ADD, never remove; a CLEAN on a partial traverse is a Halt (E-CATALOG, U-SURFACE)", gate: false },
      { id: "parks-legitimate", text: "every architectural/high-risk finding four-fielded and legitimacy-reviewed each cycle; a convenience park reclassified open; the park-legitimacy theme spot-audits the experiment dispositions + the flip-criteria parks for boilerplate (C-PARK, E-ROOTCAUSE)", gate: false },
      { id: "rotation-depth-reach", text: "all seven themes rotated, REACHABILITY-aware (ux-priming hunts the builder's defaults + help copy hardest; doc-lies audits traversal artifacts for happy-path theater; injection at the builder fields; laundering incl. builder-driven re-rooting/lineage-stripping; tamper incl. the PIT + basis chains + pollution spot-audit); every cycle a FULL-depth manifest (personas × acts, through the UI first); a prior cycle replayed from its transcript (T-ROTATE, D-WALK+, C-USER)", gate: false },
    ],
  }

  export const REACH_ARMS: Record<string, string[]> = {
    "phase-4-cycle": ["RUN", "IDENTIFY", "FIX", "QA", "RED-TEAM", "RE-EVALUATE"],
  }

  export function reachCriteriaSha(): string {
    return sha256(stable({ REACH, REACH_ARMS }))
  }

  export function blueprintMatchesReachPin(): { ok: boolean; present: boolean; detail: string } {
    const abs = findExisting(REACH_BLUEPRINT_REL)
    if (!abs) return { ok: false, present: false, detail: `blueprint absent (searched sprint/ and sprint/sprint-result/) — cannot confirm the pin (expected on a fresh clone: blueprints are gitignored)` }
    const got = sha256(readFileSync(abs, "utf8"))
    return got === REACH_BLUEPRINT_SHA_PINNED ? { ok: true, present: true, detail: `blueprint sha matches the pin (${got.slice(0, 12)}…)` } : { ok: false, present: true, detail: `blueprint sha ${got.slice(0, 12)}… ≠ pin ${REACH_BLUEPRINT_SHA_PINNED.slice(0, 12)}…` }
  }

  export function printVerbatimReach(): string {
    const lines: string[] = []
    lines.push(`blueprint: ${REACH_BLUEPRINT_REL}`)
    lines.push(`blueprint-sha256 (pin): ${REACH_BLUEPRINT_SHA_PINNED}`)
    lines.push(`criteria-set-sha256:    ${reachCriteriaSha()}`)
    lines.push("")
    for (const [phase, crits] of Object.entries(REACH)) {
      lines.push(`${phase}:`)
      for (const c of crits) lines.push(`  [${c.gate ? "GATE " : "     "}${c.surface ? " U-SURFACE" : ""}] ${c.id} — ${c.text}${c.operatorGated ? " (OPERATOR-GATED)" : ""}`)
      const arms = REACH_ARMS[`${phase}-cycle`]
      if (arms) lines.push(`  arms (headline=MIN): ${arms.join(" · ")}`)
    }
    return lines.join("\n")
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // ENSEMBLE sprint (v13) criteria — pinned to THIS blueprint AND printed VERBATIM beside the pin (C-RECON2). The sprint
  // that finishes the reachability law (K-COMPLETE: the pinned lexicon auto-flags; unflag-with-reason; the per-checkpoint
  // census diff; the one-time FULL re-census), pays V12's debts (K-SCOPE: scope narrowings file an amendment), answers
  // the disposed ADOPT's preconditions BEFORE any build (K-PRECOND: the middle + stress cells under a hash-checked K_eff
  // formula), completes the builder to three domains, and — only through an open door — ships THE POOL COMPOSER (K-EFF:
  // the pool pays the union's K_eff-adjusted bill; K-LEGIBLE: every bar renders the n it was deflated against). User-facing
  // criteria carry `surface: true` (auto-flagged by the lexicon, satisfiable ONLY by console-path traversal, U-SURFACE).
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  export const ENSEMBLE_BLUEPRINT_REL = "sprint/sprint-result/ORGANON_Ensemble_Sprint_Blueprint.md"
  export const ENSEMBLE_BLUEPRINT_SHA_PINNED = "a9f75bf7e9aacc9d157e1e1ccddd8836de0b3218d9eabbcda53490aa2cd8becd"

  export const ENSEMBLE: Record<string, Criterion[]> = {
    "phase-0": [
      { id: "COMPLETE-TRUE", text: "the reachability law's completeness half is live: the pinned user-facing lexicon auto-flags a matching criterion surface:true and the gatekeeper refuses module-only evidence on it; unflagging an auto-flagged criterion requires a filed reason value naming its real consumer (a silent unflag — a lexicon hit with neither flag nor reason — is CAUGHT by the audit); the one-time FULL re-census maps every capability matrix PRESENT row and all nine screens to traversal evidence that EXERCISES it (theater detected per mapping) with the seeded unsurfaced capability CAUGHT; every V12 debt filed as an append-only value; the catalog v13 pinned BEFORE any new surface exists (K-COMPLETE, K-SCOPE, E-CATALOG, A′#3/#4)", gate: true, unflagReason: "aggregate Phase-0 gate — resolved by the census + debt + catalog artifacts together; the census IS the mechanism that demands per-capability console-path traversal evidence (its consumer is the checkpoint census-diff, not any single screen)" },
      { id: "lexicon-autoflag-live", text: "the pinned user-facing lexicon (render · display · screen · show · user · see · read · click · reach · panel · report) ratified as a value with its sha; a lexicon-matching criterion auto-flags surface:true at load; unflagging requires a filed reason value that names the criterion's actual consumer; a silent unflag (a lexicon hit with no surface and no reason) and a dead reason (a reason lifting nothing) are both CAUGHT by the auto-flag audit (K-COMPLETE, A′#3)", gate: false, unflagReason: "the mechanism itself — consumed by autoFlagAudit(ENSEMBLE) and the gatekeeper's effectiveSurface resolution, not a user screen" },
      { id: "census-continuous-and-full", text: "Surface.censusDiff runs at EVERY gatekeeper checkpoint over the capability diff since the last run (a new user-facing capability enters the law automatically — the W7-01 class extinct by construction); the one-time FULL re-census covers every matrix PRESENT row + all nine screens: each user-facing capability mapped to a traversal that EXERCISES it (the theater detector per mapping), each infrastructure capability declared non-user-facing with its real proving evidence, the seeded unsurfaced capability CAUGHT, dangling entries fixed-or-parked (K-COMPLETE, A′#2/#4)", gate: false, unflagReason: "the census machinery — its consumer is the checkpoint census-diff attached to every gate, not a single user screen (the census is what forces the traversals it audits)" },
      { id: "debts-filed", text: "the four V12 debts filed as append-only values: the builder's lending-only narrowing retro-filed as K-SCOPE's founding amendment (a delivery narrower than its blueprint scope files an amendment in the same phase); the sybil park's impact field upgraded with its own measured numbers (0.928 laundered vs 0.310 honest); the pristine prerequisite enumeration amended with conditional Python 3.11 for the parked unblocks; the λ-sensitivity weak-real-edge effect size pinned NOW so Phase 1 cannot tune it (K-SCOPE, A′#7/#8)", gate: false },
      { id: "keff-formula-pinned", text: "the pool K_eff formula pinned as a value with its sha256 — the correlation-adjusted family charge the V12 ensemble disposal established: K_eff = K / (1 + (K-1)·ρ̄) with the pool charge = ceil(K_eff), ρ̄ the mean pairwise correlation over the pinned window; Phase 1 loads and hash-checks against THIS pin (a post-hoc formula edit is caught) BEFORE any cell runs (K-PRECOND)", gate: false },
      { id: "catalog-v13-pinned-baseline", text: "catalog v13 (v12's 29 carried via the cross-generation baseline + S15-pool-compose-happy · S16-pool-overcorrelated-honest · S17-member-swap-stiffens · S18-builder-funding · S19-builder-basis-min-tier · S20-legibility-neutral · S21-lambda-sensitivity) pinned with content-sha BEFORE any new surface exists; criteria printed verbatim; floor/absences baseline; prevention walls green on a seeded violation each (E-CATALOG, C-RECON2, C-NOREGRESS)", gate: false },
    ],
    "phase-1": [
      { id: "PRECONDITIONS-TRUE", text: "the preconditions answered before a line of pool feature code exists: the K_eff formula hash-checked against the Phase-0 pin (a mismatch Halts); the MIDDLE cells (planted pairwise ρ ∈ {0.3, 0.6}, K_eff computed non-trivially between 1 and K) — the genuine diversified pool passes ONLY at the honest K_eff charge, its laundered twin (one edge cloned K ways) fails at every charge; the STRESS cell (regime-jumping correlations) honestly collapses pooled power (recomputed K_eff → 1); the λ-sensitivity control (the pre-pinned weak-real-edge the sweep must detect — the resolution answered either way); the HRP fixture test (window/method/criterion hash-checked from the park, disposing it); exactly one derived outcome per item with fragility noted; ZERO pool code in existence (the scan proves it); the two-way door's state recorded — OPEN or RE-PARKED (K-PRECOND, U-EXPERIMENT, A′#1/#10)", gate: true },
      { id: "keff-hash-checked", text: "the K_eff formula loaded from the Phase-0 pin and hash-checked against it before any cell runs; the formula is provably the disposal's correlation-adjusted charge; a post-hoc formula tweak to flatter a cell is CAUGHT by the pinned hash (K-PRECOND, A′#10)", gate: false },
      { id: "middle-and-stress-cells", text: "the middle cells (ρ 0.3/0.6, K_eff non-trivially between 1 and K) and the stress cell (correlations jumping toward 1 mid-series, pooled power collapsing) run under PRE-PINNED constructions; the genuine pool passes only at the honest K_eff charge, the laundered twin fails everywhere, the un-adjusted (naive n=1) pool is caught; outcomes derived mechanically beside pre-registered thresholds; the fragile corners probed (tiny K, ρ near the boundaries) and fragility filed per the robustness clause (K-PRECOND, A′#1/#2)", gate: false },
      { id: "lambda-sensitivity-resolved", text: "the pre-pinned weak-real-edge cell run through the noise sweep — DETECTED (the sweep has resolution, the answer filed) or its limits stated plainly on its wall; the effect size was pinned in Phase 0 so the control cannot be tuned until the sweep sees it (the max-DSR-exactly-0.000 ambiguity resolved either way) (A′#8)", gate: false, unflagReason: "a CLI/analysis control — its consumer is the noise-sweep wall artifact (a numeric resolution answer filed to disk), not a user screen ('sees' refers to the sweep's detector, not a person)" },
      { id: "hrp-park-disposed", text: "the HRP fixture test: HRP vs equal-weight and min-variance OUT-OF-SAMPLE on the real captured pools; the window/method/pass criterion loaded from the park's filed values and hash-checked unchanged; the outcome disposes the park either way (dominance → adopt; else stays parked with the mixed-evidence caveat) (U-EXPERIMENT, A′#7)", gate: false },
      { id: "pool-code-absent", text: "a single line of pool code does not exist — a scan for any pool/composer/portfolio surface returns EMPTY (the ratification wall's scan proves it); the door only means something if it can stay shut; a seeded pool module pre-run is CAUGHT (K-PRECOND, A′#1)", gate: false },
    ],
    "phase-2": [
      { id: "BUILDER-WHOLE", text: "the builder completed to its ratified three-domain scope: the funding schema (venue/interval/side over the delivered funding primitives) and the basis schema (the cross-venue pair with MIN-tier and EXPERIMENTAL surfaced inline in the form — the weakest leg's tier visible BEFORE composing) join lending under the identical conservative-defaults, honesty-checked, lineage-declaring discipline; three domains composable end-to-end, each evidenced by a per-domain U-SURFACE traversal (happy + failure) as the gate's only sufficient kind; per-domain defaults + copy ratified; the verdict differential byte-identical (K-SCOPE cure, U-SURFACE, S-FAMILY)", gate: true, surface: true },
      { id: "funding-domain-traversal", text: "funding composable by a console-path traversal (compose → verdict → panels; the failure state: an invalid interval refused honestly, nothing registered); conservative ratified defaults; the field help honesty-checked with a seeded priming help for the domain CAUGHT (U-SURFACE, A′#5)", gate: false, surface: true },
      { id: "basis-domain-traversal", text: "basis composable by a console-path traversal with the MIN-tier + EXPERIMENTAL visible IN-FORM before the user composes (per-leg tiers carried on the verdict); the failure state: a mismatched-venue pair refused honestly; the field help honesty-checked with a seeded priming help (carry framed without divergence risk) CAUGHT (U-SURFACE, R-BASIS, A′#5)", gate: false, surface: true },
      { id: "builder-verdict-differential", text: "validation from the same schema the API enforces (one source of truth — a form path that skips the ledger is absent by construction); every submission through the identical write-then-invoke gate; the verdict differential byte-identical after the builder grew (R-ADVISORY, S-FAMILY)", gate: false },
    ],
    "phase-3": [
      { id: "POOL-HONEST", text: "through the open door — THE POOL COMPOSER, the tenth screen (U-AMEND-2: the set amended 9 → 10 once, explicitly, closed again): a depth-1 pool of adjudicated member specs registers as a trial with family = the members' UNION at the pinned K_eff charge; the frozen core adjudicates the pooled series exactly as any series; member swaps declare lineage and VISIBLY stiffen the family; K_eff recomputes on clock ticks with composition-time-vs-current divergence rendered; the stress caveat is mandatory copy; the pooled-noise permanent wall stands with its seeded kill; the K-LEGIBLE surface renders n · scoping · a neutral comparability note on verdicts, leaderboard rows, and pool reports; all evidenced by a console-path traversal (happy + the honest failure 'this pool adds nothing beyond its strongest member'); the verdict differential byte-identical — OR the phase records the honorable re-park and the sprint stands whole without it (K-EFF, K-LEGIBLE, U-AMEND-2, U-SURFACE)", gate: true, surface: true },
      { id: "pool-union-charge-and-ratchet", text: "the pool registers through write-then-invoke with family = the members' union at ceil(K_eff); a member swap visibly ratchets the family (n rises with each edit, never resets — the red-team's signature scenario); K_eff recomputes on clock ticks with composition-time vs current rendered side by side and the divergence stated (convenient low correlations at composition cannot survive contact with time) (K-EFF, A′#2)", gate: false, surface: true },
      { id: "pooled-noise-permanent-wall", text: "the pooled-noise wall is permanent: K noise members pooled must NEVER survive the deflation; a seeded survivor trips the kill-switch (the composer disabled pending an owner decision, the event a first-class finding) — the same kill-switch discipline the VoC proposer lives under (K-EFF, A′#1)", gate: false },
      { id: "pool-legibility-neutral", text: "the K-LEGIBLE deflation basis renders on every verdict, leaderboard row, and pool report — n, the scoping that produced it, and a neutral ratified comparability note — display-only, deriving nothing; the copy is ratified NEUTRAL (no shaming, no rankings-by-virtue, no accusation); ux-priming reviews it (K-LEGIBLE, A′#6)", gate: false, surface: true },
      { id: "pool-depth1-recursion-refused", text: "pool members are strategy specs ONLY; a pool member that is itself a pool is schema-refused (depth-1); recursion is deferred by default with the reason filed — a pool of pools is instant laundering-laundering (K-EFF, A′#9)", gate: false },
      { id: "ensemble-adopt-and-budget", text: "the ensemble park's future-sprint ADOPT filed as a ratification value authorizing the pool build artifacts with the correlation-adjusted K_eff charge in the row (the ratification wall maps the pool artifact back to it — pool code behind a shut door is caught); the F-BUDGET projection recorded and the walk budget confirmed explicitly (K-PRECOND, F-BUDGET)", gate: false },
    ],
    "phase-4": [
      { id: "CONVERGED-7", text: "catalog-complete AND rotation-complete (all seven ensemble-aware themes ≥1 cycle) AND two consecutive FULL-depth clean cycles AND at least four cycles total — every door walked through the UI/UX first on a pristine clone (preset · goal · builder×3 domains · the pool composer if built) — OR the cap's honest NON-CONVERGENCE STOP at cap=10 with the register + transcripts + depth manifests + catalog coverage published — OR a recorded pre-walk STOP; exactly one, truthfully, first line of the terminal (E-CATALOG, E-ROOTCAUSE, C-USER, C-LOOP, U-SURFACE, K-COMPLETE, F-BUDGET)", gate: true, unflagReason: "the walk convergence gate — its consumer is the hash-chained WALK LEDGER + cycle record (a whole-system convergence over MANY per-door traversals, not one screen); the individual doors ARE traversal-evidenced within the walk" },
      { id: "walk-ledger-chained", text: "the WALK LEDGER hash-chained, complete, committed; every issue registered BEFORE any fix (id · severity · class · repro · evidence)", gate: false },
      { id: "fixes-rootcaused", text: "every fix carries its root cause (symptom → mechanism → origin) + the smallest-change fix (inventoried) + the re-test artifact (the failing scenario re-run to confirmed resolution, hashed); a mechanism-free fix is symptom-patching — an open issue; battery + prevent walls + BOTH noise walls (single + pooled) + the venue floor + a verdict-differential spot-check + the census diff + the summary differential green each cycle; frozen byte-identity re-proven (E-ROOTCAUSE, F-ABSENT, C-NOREGRESS, K-EFF)", gate: false },
      { id: "catalog-traversed-all-doors", text: "a CLEAN cycle traverses the pinned catalog v13 in FULL (all doors preset·goal·builder×3·pool + the adversarial/edge/ensemble scenarios incl. the member-swap ratchet, the over-correlated 'adds nothing', the legibility neutrality, the traversal-theater audit), each judged against its pre-declared expected honest behavior (a scenario fails by succeeding wrongly); red-team may ADD, never remove; a CLEAN on a partial traverse is a Halt (E-CATALOG, U-SURFACE)", gate: false },
      { id: "parks-legitimate", text: "every architectural/high-risk finding four-fielded and legitimacy-reviewed each cycle; a convenience park reclassified open; the park-legitimacy theme spot-audits the door outcomes + the disposed parks + the upgraded sybil fields for boilerplate (C-PARK, E-ROOTCAUSE)", gate: false },
      { id: "rotation-depth-ensemble", text: "all seven themes rotated, ENSEMBLE-aware (laundering hunts the pool hardest — the member-swap ratchet, correlation-window gaming, near-duplicate members, sybil-flavored pool authorship against the legibility renders; ux-priming hunts the pool marketing copy + the legibility note hardest; doc-lies audits the K_eff renders + stress caveats + divergence displays + traversal theater; tamper incl. the PIT + basis chains + pollution spot-audit); every cycle a FULL-depth manifest (personas × acts, through the UI first); a prior cycle replayed from its transcript (T-ROTATE, D-WALK+, C-USER)", gate: false, unflagReason: "the rotation/depth bookkeeping criterion — its consumer is the rotation tracker + per-cycle depth manifest in the walk record, not a single user screen (the doors it rotates over ARE traversal-evidenced)" },
    ],
  }

  export const ENSEMBLE_ARMS: Record<string, string[]> = {
    "phase-4-cycle": ["RUN", "IDENTIFY", "FIX", "QA", "RED-TEAM", "RE-EVALUATE"],
  }

  export function ensembleCriteriaSha(): string {
    return sha256(stable({ ENSEMBLE, ENSEMBLE_ARMS }))
  }

  export function blueprintMatchesEnsemblePin(): { ok: boolean; present: boolean; detail: string } {
    const abs = findExisting(ENSEMBLE_BLUEPRINT_REL)
    if (!abs) return { ok: false, present: false, detail: `blueprint absent (searched sprint/ and sprint/sprint-result/) — cannot confirm the pin (expected on a fresh clone: blueprints are gitignored)` }
    const got = sha256(readFileSync(abs, "utf8"))
    return got === ENSEMBLE_BLUEPRINT_SHA_PINNED ? { ok: true, present: true, detail: `blueprint sha matches the pin (${got.slice(0, 12)}…)` } : { ok: false, present: true, detail: `blueprint sha ${got.slice(0, 12)}… ≠ pin ${ENSEMBLE_BLUEPRINT_SHA_PINNED.slice(0, 12)}…` }
  }

  export function printVerbatimEnsemble(): string {
    const lines: string[] = []
    lines.push(`blueprint: ${ENSEMBLE_BLUEPRINT_REL}`)
    lines.push(`blueprint-sha256 (pin): ${ENSEMBLE_BLUEPRINT_SHA_PINNED}`)
    lines.push(`criteria-set-sha256:    ${ensembleCriteriaSha()}`)
    lines.push(`surface-lexicon-sha256: ${surfaceLexiconSha()}`)
    lines.push("")
    for (const [phase, crits] of Object.entries(ENSEMBLE)) {
      lines.push(`${phase}:`)
      for (const c of crits) lines.push(`  [${c.gate ? "GATE " : "     "}${effectiveSurface(c) ? " U-SURFACE" : ""}] ${c.id} — ${c.text}${c.operatorGated ? " (OPERATOR-GATED)" : ""}${c.unflagReason ? `\n         ↳ unflag-reason: ${c.unflagReason}` : ""}`)
      const arms = ENSEMBLE_ARMS[`${phase}-cycle`]
      if (arms) lines.push(`  arms (headline=MIN): ${arms.join(" · ")}`)
    }
    return lines.join("\n")
  }

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // X-DEFAULT (Explanation Phase 0) — the auto-flag law DEFAULTS ON. V13's K-COMPLETE made the gatekeeper CAPABLE of
  // biting (enforceAutoFlag) but left it OFF by default — one forgotten parameter from reverting the whole half (the
  // V13 audit's finding). From this sprint, a new gate enforces the auto-flag law WITHOUT opting in; V6–V13's gates are
  // grandfathered by THIS pinned list of their criteria ids (historical records are immutable — T-SUPERSEDE — never
  // re-adjudicated); a new gate opting OUT of the default must file a reason (the unflag pattern, one level up). The
  // grandfather is keyed by criterion id: under the default-on regime, a criterion whose id is in this set uses the OLD
  // explicit-only behavior (it predates the lexicon); a NEW id auto-flags. This lets the default flip without turning a
  // single historical gate red — the exact A′#9 attack, closed by construction.
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const HISTORICAL_SETS: Record<string, Criterion[]>[] = [CRITERIA, CONVERGENCE, TRANSPLANT, WARRANTY, DATAPLANE, ENDUSER, SPINE, REACH, ENSEMBLE]
  // every V6–V13 criterion id, collected from the historical criteria sets (the pinned grandfather membership).
  export function grandfatherGateIds(): string[] {
    const ids = new Set<string>()
    for (const set of HISTORICAL_SETS) for (const crits of Object.values(set)) for (const c of crits) ids.add(c.id)
    return [...ids].sort()
  }
  export function grandfatherSha(): string {
    return sha256(stable(grandfatherGateIds()))
  }
  // is a criterion id grandfathered (a V6–V13 gate that predates the default-on law)? Consulted by the gatekeeper's
  // effectiveSurface resolution under enforceAutoFlag — a grandfathered id keeps explicit-only; a new id auto-flags.
  export function isGrandfathered(id: string): boolean {
    return grandfatherGateIds().includes(id)
  }
  // the pinned grandfather sha, recorded in Phase 0 so a later addition to a historical set (which would silently widen
  // the grandfather) is caught by a differential against this value. Recompute + compare in the wall.
  export const GRANDFATHER_SHA_PINNED = "496f5d7bb4ec9d514b49da8a8db17c9cafc55b38962930e080aeb3e2df10bddd"

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // EXPLANATION sprint (v14) criteria — pinned to THIS blueprint AND printed VERBATIM beside the pin (C-RECON2). The
  // sprint that answers V13's audit at the root (the unpriced pick, the opt-in law, the unstated identity truth, the
  // ILLUSTRATIVE-where-real parity, the un-checked narrative delta) and builds the Operator's two add-ons under the
  // completed law: THE WHY PANEL (every terminal state explained in two registers from one machine-derived fact table,
  // the LLM allowed only as far as a groundedness verifier follows) and THE RUNNER (one honest command from a fresh
  // clone to the web door). Gate ids match PART D (LAWS-DEFAULT-TRUE · SELECTION-PRICED · PARITY-TRUE · WHY-TRUE ·
  // ONE-COMMAND-TRUE · CONVERGED-8). User-facing criteria carry surface:true (auto-flagged, satisfiable ONLY by
  // console-path traversal with per-criterion exercise assertions). Pinned by criteria-set hash — a hand-edit is void.
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
  export const WHY_BLUEPRINT_REL = "sprint/sprint-result/ORGANON_Explanation_Sprint_Blueprint.md"
  export const WHY_BLUEPRINT_SHA_PINNED = "b31b27552daaea37bcdff91eb7ba41469d34296b1bae6cf947f152e417bbd648"

  export const WHY: Record<string, Criterion[]> = {
    "phase-0": [
      { id: "LAWS-DEFAULT-TRUE", text: "the auto-flag law defaults ON for every new gate with the V6–V13 grandfather list pinned as a value (a new gate opting out files a reason); per-criterion exercise assertions enter traversal admissibility (a mapped criterion names the transcript step whose recorded behavior matches its expected-behavior string; a seeded vague ref is caught); the summary differential extends to narrative deltas with the V13 '58→74' slip corrected append-only as its founding catch; the census gains a seeded mis-categorization control; the EXPERIMENT registry enumerates the parked-experiment runners (the scan bypass made explicit); the K-SCOPE parity law filed with the builder-funding-on-ILLUSTRATIVE instance retro-filed (cure Phase 2); the identity provenance truth filed into the sybil park; the SELECTION pins hashed; the interim pool caveat live; the WHY ground rules pinned; the catalog v14 pinned BEFORE any new surface exists (X-DEFAULT, X-SELECT, K-SCOPE, E-CATALOG)", gate: true },
      { id: "default-on-grandfathered", text: "Checkpoint.Gate enforces the K-COMPLETE auto-flag law WITHOUT an opt-in (enforceAutoFlag defaults ON); the grandfather list (every V6–V13 criterion id) is pinned as a value with its sha; under the default-on regime a grandfathered id keeps explicit-only while a NEW lexicon-hitting id auto-flags (a positive control proves the split on identical text); opting OUT files a reason or the constructor refuses; no historical gate is re-adjudicated (T-SUPERSEDE) (X-DEFAULT, A′#9)", gate: false },
      { id: "exercise-assertions-live", text: "traversal admissibility gains per-criterion exercise assertions: a surface criterion's traversal must carry a mapping naming the step that EXERCISES that criterion's expected behavior (the step's recorded behavior matches the criterion's expected-behavior string); a vague ref (a mapping pointing at a step whose behavior does not match) is CAUGHT; replayed against V13's W8-01, the compose-and-refuse bundle can no longer stand as evidence for the ratchet it never ratcheted (X-DEFAULT, U-SURFACE, A′#8)", gate: false },
      { id: "delta-differential-live", text: "the summary differential extends to narrative deltas: a claimed A→B for a metric is checked against the derived endpoint (B == derived) and the prior baseline (A == last pinned); the V13 terminal's floor '58→74' (true 66→74) corrected append-only as the founding catch; a seeded wrong delta is CAUGHT (X-DEFAULT, U-DERIVED)", gate: false },
      { id: "census-miscategorization-control", text: "the census gains a mis-categorization control: a known user-facing capability declared 'infrastructure' (a plausible way to hide a dangling surface) is CAUGHT against a pinned user-facing registry; the seeded mis-categorization fires the control or the census fails its own gate (X-DEFAULT, K-COMPLETE, A′-adversarial)", gate: false, unflagReason: "the census mechanism — its consumer is the checkpoint census-diff, not a single user screen (the census is what forces the traversals it audits)" },
      { id: "experiment-registry-live", text: "the parked-experiment runner modules are enumerated in an explicit EXPERIMENT registry (src/studio/hrp.ts · experiments.ts · preconditions.ts — the modules that escaped the ratification scan by living outside src/analytics); each registered experiment maps to a PARK-WITH-EXPERIMENT or a disposing SUPERSEDE row (an experiment posing as product is caught); the scan bypass is now explicit and coherent, not discretionary (X-DEFAULT, R-RATIFY)", gate: false },
      { id: "parity-law-and-selection-pins", text: "the K-SCOPE parity law filed (a schema adjudicating ILLUSTRATIVE where REAL data exists is a narrowing requiring an amendment) with the builder-funding instance retro-filed append-only (cure: Phase 2); the identity provenance truth filed into the sybil park (authorId self-declared and rotation-free; the ratchet keyed per-author, the limiter per-connection; the ratchet-bypass vector named with the 0.928/0.310 context); the SELECTION pins (universe sizes M · candidate mixes · edge strengths · the adversarial best-of-M procedure · the three remedy candidates with exact forms · the outcome criteria) hashed in phase0-pins-v14.json before Phase 1 may run (K-SCOPE, X-SELECT, A′#4/#11)", gate: false },
      { id: "interim-caveat-and-ground-rules", text: "every pool report renders the interim caveat 'member selection is not yet priced; this pool's charge covers breadth, not the pick' from this checkpoint until the door answers; the WHY ground rules pinned — the fact-table row schema (id · name · value · threshold · comparator · outcome · contribution · provenanceRef), the materiality threshold for must-be-explained rows, the two-sided plain-language template registry, and the groundedness-verifier rules (number extraction · claim mapping · reject-wholesale semantics) (X-SELECT, X-ONE, X-FACTS, X-GROUND)", gate: false, surface: true },
      { id: "catalog-v14-pinned-baseline", text: "catalog v14 (v13's 36 carried via the cross-generation baseline + S22-why-nogo-plain · S23-why-quant-exact · S24-why-killswitch · S25-why-consistency · S26-paraphrase-embellishment-rejected · S27-runner-happy · S28-runner-missing-prereq · S29-runner-gate-unmet · S30-funding-parity-real · S31-selection-outcome-rendered) pinned with content-sha BEFORE any new surface exists; criteria printed verbatim; floor/absences baseline; prevention walls green on a seeded violation each (E-CATALOG, C-RECON2, C-NOREGRESS)", gate: false, unflagReason: "a catalog-pin criterion — its consumer is the hash-pinned catalog artifact (the lexicon hit 'rendered' is inside the scenario id S31-selection-outcome-rendered, not a screen this criterion renders)" },
    ],
    "phase-1": [
      { id: "SELECTION-PRICED", text: "the pool's unpriced member selection (choose K of M) adjudicated through its door under the Phase-0 pins (a mismatch Halts): synthetic universes of M mixed noise-and-weak-edge candidates, the adversarial best-of-M composer (the cherry-pick mechanized), survivor inflation measured at the current ceil(K_eff) charge against planted truth, the instrument's positive control green (an uncharged best-of-M MUST inflate — proving the instrument can see inflation), fragile corners probed (small M, large K/M, selection over already-deflated survivors); EXACTLY ONE derived outcome — TERM (a pinned selection surcharge adopted; existing pool verdicts re-stated at the corrected deflation append-only) · RESTRICT (first compositions admissible only over declared/pre-registered member sets) · NO-INFLATION (evidence filed; the caveat retires) — under unchanged pins; the pool schema amended per the outcome; the caveat updated to match; the verdict differential byte-identical except where re-statements legitimately moved pool verdicts (X-SELECT, T-POLLUTION, A′#4)", gate: true, unflagReason: "the selection science gate — resolved by the experiment artifact + the derived-outcome value, not a screen (the lexicon hit 'see' refers to the instrument seeing inflation, not a person; the pool surface the outcome amends IS traversal-evidenced in its own criteria)" },
      { id: "selection-pins-hash-checked", text: "the SELECTION constructions loaded from the Phase-0 pin and hash-checked before any cell runs; a post-hoc construction tweak 'for realism' is CAUGHT by the pinned hash (the outcome cannot be run to a desired answer) (X-SELECT, A′#4)", gate: false },
      { id: "selection-instrument-positive-control", text: "the inflation instrument's positive control: a pure-noise universe's best-of-M composition MUST inflate survivors at an UNCHARGED baseline (proving the instrument detects the cherry-pick); a selection experiment whose instrument cannot see planted inflation is void (X-SELECT)", gate: false, unflagReason: "the instrument-validity control — its consumer is the experiment's positive-control artifact (the lexicon hit 'see' is the instrument detecting inflation, not a user screen)" },
      { id: "selection-outcome-derived-restated", text: "the single outcome derived MECHANICALLY beside the pre-registered criteria (never argued past a marginal); if TERM, every existing pool verdict re-stated at the corrected deflation append-only (the T-POLLUTION precedent — a supersession per moved verdict, none edited); if RESTRICT, the composer's schema enforces declared member sets; if NO-INFLATION, the evidence reproduces; the caveat's lifecycle honest (X-SELECT, T-POLLUTION)", gate: false },
    ],
    "phase-2": [
      { id: "PARITY-TRUE", text: "the V13 parity + identity cures: builder-funding wired to its REAL captured T1 funding snapshots (the data has existed since V10) reaching a REAL-PIT-labeled verdict with a provenance chain a skeptic can trace; every builder route's data reality labeled truthfully (ILLUSTRATIVE only where real data genuinely does not exist); no tier quietly upgraded through the real-data wiring (the basis DeFi leg stays T2-forward, per-leg tiers consistent); the identity truth rendered where users read (the K-LEGIBLE note gains the provenance sentence — author identity self-declared, bars/ratchets per-author — neutral and ratified; the ratchet's key and the limiter's key documented where each renders); the verdict differential byte-identical (K-SCOPE parity cure, D-LABEL, K-LEGIBLE, PARITY)", gate: true, surface: true },
      { id: "funding-parity-realpit-traversal", text: "funding-parity reached by a console-path traversal (compose funding → a REAL-PIT verdict with resolving provenance; the failure state: a deliberately keyless/offline run renders the honest ILLUSTRATIVE or BLOCKED state, never a mislabeled one); a seeded REAL-PIT label on an illustrative series is CAUGHT by the D-LABEL wall (K-SCOPE cure, D-LABEL, U-SURFACE)", gate: false, surface: true },
      { id: "identity-sentences-neutral", text: "the identity provenance sentence renders on the K-LEGIBLE note (self-declared identity; per-author bars/ratchets; a pointer to the sybil note) — neutral, passing the honesty checker; a seeded reassuring identity sentence ('your work is safe') is CAUGHT; the ratchet key (declared author) and the limiter key (connection) documented where each renders, the tension named plainly not hidden (K-LEGIBLE, PARITY, A′#7)", gate: false, surface: true },
    ],
    "phase-3": [
      { id: "WHY-TRUE", text: "THE WHY PANEL, born under the full law: Explain.factTable(verdictArtifact) — every gate, threshold, rule outcome, metric, label, charge, and provenance ref as rows on the pinned schema, completeness-censused against the verdict artifact schema (every field appears or is registered excluded-with-reason; the seeded omission CAUGHT; the raw table on the pro disclosure); the deterministic dual renderings for EVERY terminal state incl. kill-switches (the quantitative — exact values/thresholds/deciding rule; the plain-language — the two-sided template registry: what failed · what held · what would change it) mechanically consistency-checked (bidirectional mapping · numbers exact · no orphan claims · no unexplained material rows); the optional grounded-LLM paraphrase behind the groundedness verifier (numbers + claims matched to the fact table; any miss rejects wholesale with deterministic fallback; the seeded embellishment CAUGHT; fixture-only in CI; labeled 'AI-phrased · verified against engine facts'; nowhere in the verdict path); the report/verdict-card/pro-disclosure extended (the set stays 10); all evidenced by traversal — a NO-GO explained in both registers, a kill-switch WHY, a failure state; the verdict differential byte-identical (X-ONE, X-FACTS, X-GROUND, U-SURFACE)", gate: true, surface: true },
      { id: "fact-table-censused", text: "the fact table is completeness-censused against the verdict artifact schema — every field appears as a row or is registered excluded-with-reason; a seeded omission (a flattering subset hiding a field) is CAUGHT (the census pattern applied to facts); the pro disclosure renders the raw table (X-FACTS, A′#3)", gate: false, surface: true },
      { id: "registers-consistency-checked", text: "both registers generate from the ONE fact table; the consistency checker asserts bidirectional mapping (every plain claim maps to a fact row; every material row is explained; numbers exact); a seeded drift (plain says 'weak evidence', quant shows an unmentioned threshold) and a seeded consoling template ('so close!') are CAUGHT; drift is a battery failure, not a style note (X-ONE, A′#2/#7)", gate: false, surface: true },
      { id: "groundedness-verifier-controlled", text: "the groundedness verifier runs both positive controls: a faithful paraphrase PASSES; a seeded embellishment ('comfortably above threshold' where the table says 0.02 below) and an added causal story ('failed because markets were volatile' — no such fact row) REJECT wholesale with deterministic fallback; the LLM path is fixture-only in CI and free-model-only live; nothing LLM-touched sits in the verdict path (X-GROUND, A′#1/#10)", gate: false },
      { id: "every-terminal-state-explains", text: "every terminal state the engine can produce (GO/NO-GO/CONDITIONAL/INSUFFICIENT/BLOCKED/MALFORMED/kill-switch) is explainable in both registers from its golden artifact; the novice test rehearsed — given only the plain explanation of a real refusal, a stranger's one-sentence answer to 'why did it fail?' checks against the fact table's deciding row (X-ONE, C-USER)", gate: false, surface: true },
    ],
    "phase-4": [
      { id: "ONE-COMMAND-TRUE", text: "THE RUNNER: ./organon.sh takes a pristine clone to the web door in ONE honest command — a prerequisite check (the U-PRISTINE enumeration, honest per-item failures, never installing system items) → setup from the pinned lockfile (idempotent) → the pinned verify set (walls · frozen byte-identity · verdict + summary differentials · the pinned battery subset, full via --full) rendered as a status table → an offline-honest optional refresh (a missed fetch renders as a gap, never a fabrication) → the bounded TUI (status · launch-web · quit); the LAUNCH-WEB option is requirements-gated (enabled only when the pinned gate list is green; unmet → disabled WITH each unmet requirement rendered beside it); traversal evidence spans the happy transcript (clone → one command → TUI → launch → the web door reachable), the missing-prerequisite failure, and the unmet-gate state; the pristine harness runs through the runner (X-RUN, U-PRISTINE, U-SURFACE)", gate: true, surface: true },
      { id: "runner-gate-and-failures", text: "the LAUNCH-WEB requirements list is pinned in the criteria and printed in the status table; a soft-launch path (an env var skipping the gate) is absent by construction, proven; the missing-prerequisite failure prints the honest enumerated message and exits nonzero; the unmet-gate state disables LAUNCH-WEB with the wall named beside it — never a dead button, never a launch over red (X-RUN, A′#5)", gate: false, surface: true },
      { id: "runner-bounded-honest", text: "the runner installs nothing systemic (prerequisite CHECK only), sets up the venv from the pinned lockfile alone, refreshes offline-honestly (a back-filled gap is refused by the store's physics), and is idempotent + safe on a dirty tree (a dirty-tree warning names the files); the verify set is the same pinned set the criteria name (a quiet narrowing is caught by the printed status table) (X-RUN, A′#6)", gate: false },
    ],
    "phase-5": [
      { id: "CONVERGED-8", text: "catalog-complete AND rotation-complete (all seven explanation-aware themes ≥1 cycle) AND two consecutive FULL-depth clean cycles AND at least four cycles total — bootstrapped through the runner (pristine clone → ./organon.sh → the TUI → the web door → every door preset·goal·builder×3-real·pool), the novice persona answering 'why did it fail?' in one correct sentence from the plain register alone at every refusal — OR the cap's honest NON-CONVERGENCE STOP at cap=10 with the register + transcripts + depth manifests + catalog coverage published — OR a recorded pre-walk STOP; exactly one, truthfully, first line of the terminal (E-CATALOG, E-ROOTCAUSE, C-USER, C-LOOP, X-RUN, X-ONE, F-BUDGET)", gate: true, unflagReason: "the walk convergence gate — its consumer is the hash-chained WALK LEDGER + cycle record (a whole-system convergence over MANY per-door traversals, not one screen); the individual doors and WHY panels ARE traversal-evidenced within the walk" },
      { id: "walk-ledger-chained", text: "the WALK LEDGER hash-chained, complete, committed; every issue registered BEFORE any fix (id · severity · class · repro · evidence)", gate: false },
      { id: "fixes-rootcaused", text: "every fix carries its root cause (symptom → mechanism → origin) + the smallest-change fix (inventoried) + the re-test artifact (the failing scenario re-run to confirmed resolution, hashed); a mechanism-free fix is symptom-patching — an open issue; battery + prevent walls + BOTH noise walls + the consistency checker + the verifier controls + the census diff + the delta-aware summary differential + a verdict-differential spot-check green each cycle; frozen byte-identity re-proven (E-ROOTCAUSE, F-ABSENT, C-NOREGRESS, X-ONE, X-GROUND)", gate: false },
      { id: "catalog-traversed-all-doors", text: "a CLEAN cycle traverses the pinned catalog v14 in FULL (all doors + the WHY-register scenarios + the runner failure states + the selection outcome render + the funding parity + the adversarial embellishment), each judged against its pre-declared expected honest behavior (a scenario fails by succeeding wrongly); red-team may ADD, never remove; a CLEAN on a partial traverse is a Halt (E-CATALOG, U-SURFACE)", gate: false, unflagReason: "the walk catalog-coverage criterion — its consumer is the per-cycle catalog-coverage record in the walk ledger (the lexicon hit 'render' is inside 'the selection outcome render', a scenario the walk traverses — each door/panel it names IS traversal-evidenced within the walk)" },
      { id: "parks-legitimate", text: "every architectural/high-risk finding four-fielded and legitimacy-reviewed each cycle; a convenience park reclassified open; the park-legitimacy theme spot-audits the selection outcome + the identity filing + the standing parks for boilerplate (C-PARK, E-ROOTCAUSE)", gate: false },
      { id: "rotation-depth-explanation", text: "all seven themes rotated, EXPLANATION-aware (ux-priming hunts the plain explanations hardest — consolation is the new temptation; injection feeds the paraphraser poisoned facts — the verifier must reject; doc-lies audits register consistency + exerciseRefs + the runner's status table vs reality; laundering re-probes the pool under the door's outcome + identity-rotation against the documented keys; tamper incl. the PIT chains + pollution spot-audit; availability incl. a dead model mid-paraphrase → deterministic fallback + the runner offline → honest gaps); every cycle a FULL-depth manifest (personas × acts, through the runner first); a prior cycle replayed from its transcript (T-ROTATE, C-USER)", gate: false, unflagReason: "the rotation/depth bookkeeping criterion — its consumer is the rotation tracker + per-cycle depth manifest in the walk record, not a single user screen (the surfaces it rotates over ARE traversal-evidenced)" },
    ],
    "phase-6": [
      { id: "HANDOFF-HONEST", text: "the pristine proof via the runner itself; the delta-aware summary differential green on the terminal's own numbers AND its narrative arithmetic; the parks forward (the selection outcome disposed with its evidence · sybil upgraded with the identity provenance + bypass vector · tournament NO standing · CPCV accruing · ZKML re-check · recursion deferred · the ever-standing signing decision); the operator lane at zero residue (publication re-ratification against the again-grown matrix · the free FRED credential · the V4-backup restoration window · the genuine second party, now four doors each with a WHY); the scanner-assisted tense audit; the terminal's first line states the walk's outcome (F-CONTINUE, U-DERIVED)", gate: false },
    ],
  }

  export const WHY_ARMS: Record<string, string[]> = {
    "phase-5-cycle": ["RUN", "IDENTIFY", "FIX", "QA", "RED-TEAM", "RE-EVALUATE"],
  }

  export function whyCriteriaSha(): string {
    return sha256(stable({ WHY, WHY_ARMS }))
  }

  export function blueprintMatchesWhyPin(): { ok: boolean; present: boolean; detail: string } {
    const abs = findExisting(WHY_BLUEPRINT_REL)
    if (!abs) return { ok: false, present: false, detail: `blueprint absent (searched sprint/ and sprint/sprint-result/) — cannot confirm the pin (expected on a fresh clone: blueprints are gitignored)` }
    const got = sha256(readFileSync(abs, "utf8"))
    return got === WHY_BLUEPRINT_SHA_PINNED ? { ok: true, present: true, detail: `blueprint sha matches the pin (${got.slice(0, 12)}…)` } : { ok: false, present: true, detail: `blueprint sha ${got.slice(0, 12)}… ≠ pin ${WHY_BLUEPRINT_SHA_PINNED.slice(0, 12)}…` }
  }

  export function printVerbatimWhy(): string {
    const lines: string[] = []
    lines.push(`blueprint: ${WHY_BLUEPRINT_REL}`)
    lines.push(`blueprint-sha256 (pin): ${WHY_BLUEPRINT_SHA_PINNED}`)
    lines.push(`criteria-set-sha256:    ${whyCriteriaSha()}`)
    lines.push(`surface-lexicon-sha256: ${surfaceLexiconSha()}`)
    lines.push(`grandfather-sha256:     ${grandfatherSha()}`)
    lines.push("")
    for (const [phase, crits] of Object.entries(WHY)) {
      lines.push(`${phase}:`)
      for (const c of crits) lines.push(`  [${c.gate ? "GATE " : "     "}${effectiveSurface(c) ? " U-SURFACE" : ""}] ${c.id} — ${c.text}${c.operatorGated ? " (OPERATOR-GATED)" : ""}${c.unflagReason ? `\n         ↳ unflag-reason: ${c.unflagReason}` : ""}`)
      const arms = WHY_ARMS[`${phase}-cycle`]
      if (arms) lines.push(`  arms (headline=MIN): ${arms.join(" · ")}`)
    }
    return lines.join("\n")
  }
}
