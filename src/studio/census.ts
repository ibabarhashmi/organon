/**
 * ORGΛNON — the CHOKEPOINT CENSUS (Data-Plane Phase 0; Rule D-CHOKE). Three sprints, one recurring disease: a control
 * built without a demonstrated enforcement point — a fuzz that asserted the wrong property (V6), a matrix whose README
 * copy drifted because the check watched code-vs-reality but not README-vs-code (V8 W1-01), a publication gate nothing
 * invoked (V8 W2-01). The cure is mechanical: a control is not DONE until the path it governs is shown REFUSING without
 * it. The unit test proves the control WORKS; the chokepoint demo proves the control is IN THE WAY.
 *
 * This module enumerates every existing control → its enforcement point → its DEMONSTRATED refusal (the positive
 * control that makes the check bite), and hashes the proving artifact as evidence. A control whose proving file is
 * gone, or that carries no positive-control (nothing that makes it bite), is a DANGLING control — a registered finding,
 * not a shrug. The census's OWN positive control: a deliberately-unwired control MUST be caught (A′#6) — else the
 * census is a rubber stamp. Runtime chokepoint scripts (publish-preflight, the checkpoint drivers) are additionally
 * EXECUTED-to-refusal by script/chokepoint-census.ts; this module verifies the static evidence the battery can check.
 */
import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"

export namespace Census {
  export type RefusalTier =
    | "chokepoint-script" // a governed build/publish step that exits-nonzero in a real run (executed by the driver)
    | "governed-artifact" // the wall reads a REAL on-disk/VCS artifact (git, the tree, the committed snapshot) and reddens if reality drifts
    | "runtime-surface" // a served/registered surface REFUSES at the wire (401/413/429/400, register-then-invoke)
    | "predicate" // a positive-controlled predicate over a function in isolation

  export interface Control {
    id: string
    property: string // what it enforces
    enforcementPoint: string // WHERE the governed path invokes it (file:symbol / script)
    provingFile: string // repo-relative wall/test that proves it (must exist + carry a positive control)
    tier: RefusalTier
    // the chokepoint the driver EXECUTES to refusal (only for chokepoint-script tier); documented here for the census table
    chokepointDemo?: string
  }

  // A "bite" pattern: something in the proving file that makes the check REFUSE a seeded violation. A file with an
  // assertion but no bite pattern is a control that cannot demonstrate it is in the way — DANGLING (the V6/V8 disease).
  const BITE_PATTERNS: RegExp[] = [
    /\btoThrow\b/,
    /\.rejects\b/,
    /positive[\s-]?control/i,
    /\bseed(ed|s)?\b/i,
    /\btamper/i,
    /\bmalformed\b/i,
    /\brefus(e|ed|al)\b/i,
    /toBe\(false\)/,
    /toBe\(1\)/, // an exit-1 refusal assertion
    /caught/i,
    /must[\s-]?reject/i,
    /unchanged/i, // ledger-count-unchanged (the register-then-invoke refusal)
  ]

  export const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

  // The control registry — every wall, gate, corpus, validator, chokepoint, byte-match, provenance check in the tree.
  // Enforcement points and tiers derived from the census map (BUILDLOG-V9 Phase 0). New data-plane controls append here.
  export const CONTROLS: Control[] = [
    { id: "frozen-core-byte-identity", property: "the frozen seven byte-identical to their pins; frozen paths git-clean", enforcementPoint: "frozen.ts:checkFrozenSet + git status --porcelain over frozen paths", provingFile: "test/walls/core_byte_identity.test.ts", tier: "governed-artifact" },
    { id: "no-signing-surface", property: "zero signing/settlement primitive in src/studio + src/ledger", enforcementPoint: "grep -rInE over the real tree", provingFile: "test/walls/no_signing_grep.test.ts", tier: "governed-artifact" },
    { id: "append-only-log", property: "each BuildLog's committed history is append-only (prefix-extension)", enforcementPoint: "git log/show over committed BuildLogs → isAppendOnly", provingFile: "test/walls/log_append_only.test.ts", tier: "governed-artifact" },
    { id: "log-terminal-marker", property: "every F-CONTINUE-era log ends in a state marker", enforcementPoint: "git show HEAD:<log> latest committed revision → Marker.endsInStateMarker", provingFile: "test/walls/log_terminal_marker.test.ts", tier: "governed-artifact" },
    { id: "capability-inventory-floor", property: "the live tree ≥ the pinned capability floor (no deleted/gutted proving test)", enforcementPoint: "Inventory.verify() over committed capability-inventory.json vs live files", provingFile: "test/walls/capability_inventory.test.ts", tier: "governed-artifact" },
    { id: "publication-gate", property: "publish doubly-gated: identity (matrix true) THEN consent", enforcementPoint: "script/publish-preflight.ts exits 1 without ORGANON_PUBLISH_CONSENT=1", provingFile: "test/walls/publication_gate.test.ts", tier: "chokepoint-script", chokepointDemo: "bun run script/publish-preflight.ts  (no consent env) → exit 1 REFUSED" },
    { id: "gatekeeper-v2-unamendable", property: "make-or-break GATE criteria UNAMENDABLE; criteria loaded only by matching pin", enforcementPoint: "script/checkpoint-v*.ts → Checkpoint.Gate.record throws (L-GATE2)", provingFile: "test/walls/gatekeeper_v2.test.ts", tier: "chokepoint-script", chokepointDemo: "amending a gate → ADVANCE throws /UNAMENDABLE/" },
    { id: "checkpoint-gate-evidence", property: "ADVANCE only with hash-resolving evidence; trail chained; independence PENDING", enforcementPoint: "Checkpoint.Gate.record (dangling link / wrong-hash / free-text all throw)", provingFile: "test/walls/checkpoint_gate.test.ts", tier: "chokepoint-script", chokepointDemo: "wrong-hash evidence on ADVANCE → throws" },
    { id: "tiers-earned", property: "tier is earned not declared; caller returns cap at V0", enforcementPoint: "AttestClassify.classify + leaderboard sort", provingFile: "test/walls/tiers_earned.test.ts", tier: "predicate" },
    { id: "determinism-at-surfaces", property: "identical inputs → byte-identical outputs across ledger/checkpoint/report/surface", enforcementPoint: "double-build compare across surfaces", provingFile: "test/walls/determinism_at_surfaces.test.ts", tier: "predicate" },
    { id: "fixture-only-ci", property: "synthetic GO renders honestly but never counts as a real GO", enforcementPoint: "StudioReport.render + leaderboard goCount", provingFile: "test/walls/fixture_leak.test.ts", tier: "predicate" },
    { id: "arms-headline-min", property: "phase headline = MIN(arms); REPEAT never outvoted", enforcementPoint: "Checkpoint.headlineFromArms", provingFile: "test/walls/arms_headline_min.test.ts", tier: "predicate" },
    { id: "trail-immutability", property: "records immutable; corrections appended (supersede), never re-pointed", enforcementPoint: "Supersede.verify() (a re-pointed past record fails)", provingFile: "test/walls/trail_immutability.test.ts", tier: "predicate" },
    { id: "ux-honesty", property: "reports two-sided, family-visible, non-priming", enforcementPoint: "StudioReport.check", provingFile: "test/walls/ux_honesty_studio.test.ts", tier: "predicate" },
    { id: "ledger-bypass-refused", property: "no adjudication without a registered trial (register-then-invoke)", enforcementPoint: "Studio.adjudicateRegistered / get_verdict refuse at the surface", provingFile: "test/walls/ledger_bypass.test.ts", tier: "runtime-surface" },
    { id: "rejection-boundary", property: "a must-reject corpus refused BEFORE registration (ledger count unchanged) on every mutating surface", enforcementPoint: "the mutating surfaces (register/submit) refuse the corpus", provingFile: "test/organon/rejection_boundary.test.ts", tier: "runtime-surface" },
    { id: "served-persistence", property: "a served submit survives restart; the old in-memory wiring provably does NOT", enforcementPoint: "mountableStore() durable path", provingFile: "test/organon/served_persistence.test.ts", tier: "runtime-surface" },
    { id: "ledger-pollution-audit", property: "every historical entry re-validated; seeded schema-invalid + chain-tamper caught", enforcementPoint: "the pollution auditor recompute vs Ledger.Store", provingFile: "test/organon/ledger_pollution.test.ts", tier: "governed-artifact" },
    { id: "surface-fuzz-hardened", property: "served routes fire 401/413/429/400; fuzz crash-free", enforcementPoint: "script/serve-studio.ts mountable(token, rateLimit, maxBody)", provingFile: "test/organon/surface_fuzz.test.ts", tier: "runtime-surface" },
    { id: "repro-contracts", property: "a false-green (RUNS-GREEN over an absent input) is caught; the RWA pin UNCHANGED", enforcementPoint: "the repro-contract false-green detector", provingFile: "test/organon/repro_contracts.test.ts", tier: "governed-artifact" },
    { id: "capability-matrix-vs-reality", property: "advertised == actual: a PRESENT whose proof left the floor, or an ABSENT actually present, is caught; README byte-matches code", enforcementPoint: "Matrix.verifyAgainstReality + the README byte-match", provingFile: "test/organon/capability_matrix.test.ts", tier: "governed-artifact" },
    { id: "absences-inventoried", property: "an absence without a four-field park is an OPEN issue; a capability leaving the floor without an absence is an uncovered LOSS", enforcementPoint: "Inventory.verifyAbsences + scopeDiff", provingFile: "test/organon/inventory_absences.test.ts", tier: "governed-artifact" },
    { id: "tense-scanner", property: "an unpaired present-tense proven-state claim is FLAGGED; a hedged/evidenced one is not", enforcementPoint: "the claim-vs-evidence scanner", provingFile: "test/organon/tense_scan.test.ts", tier: "predicate" },
  ]

  export interface CensusRow {
    id: string
    property: string
    enforcementPoint: string
    tier: RefusalTier
    provingFile: string
    provingExists: boolean
    biteFound: boolean // a positive-control / refusal demonstration present in the proving file
    evidenceSha: string | null // sha256 of the proving file (the evidence hash)
    dangling: boolean // no proving file, or no bite → the control cannot demonstrate it is IN THE WAY
    reason: string
  }

  // Evaluate one control's static evidence: proving file present + carries a bite pattern (a demonstrated refusal).
  export function evaluate(c: Control): CensusRow {
    const abs = path.join(PKG_ROOT, c.provingFile)
    const exists = existsSync(abs)
    if (!exists) {
      return { id: c.id, property: c.property, enforcementPoint: c.enforcementPoint, tier: c.tier, provingFile: c.provingFile, provingExists: false, biteFound: false, evidenceSha: null, dangling: true, reason: `proving file MISSING — a control with no proof of enforcement is DANGLING (D-CHOKE)` }
    }
    const src = readFileSync(abs, "utf8")
    const biteFound = BITE_PATTERNS.some((p) => p.test(src))
    const evidenceSha = sha256(src)
    const dangling = !biteFound
    return {
      id: c.id,
      property: c.property,
      enforcementPoint: c.enforcementPoint,
      tier: c.tier,
      provingFile: c.provingFile,
      provingExists: true,
      biteFound,
      evidenceSha,
      dangling,
      reason: dangling ? `proving file carries NO positive-control / refusal demonstration — the control cannot show it is IN THE WAY (the V6/V8 disease)` : `enforcement demonstrated (bite present); evidence ${evidenceSha.slice(0, 12)}…`,
    }
  }

  export interface CensusResult { rows: CensusRow[]; dangling: CensusRow[]; ok: boolean; controlCount: number }
  export function run(controls: Control[] = CONTROLS): CensusResult {
    const rows = controls.map(evaluate)
    const dangling = rows.filter((r) => r.dangling)
    return { rows, dangling, ok: dangling.length === 0, controlCount: controls.length }
  }

  // The census's OWN positive control (A′#6): a deliberately-unwired control — a real-looking control whose proving
  // file exists but carries NO bite pattern (nothing that makes it refuse). The census MUST flag it DANGLING; a census
  // that passes this is a rubber stamp. The driver seeds a scratch file with an assertion-free body and asserts catch.
  export function seededDanglingControl(scratchFile: string): Control {
    return { id: "SEEDED-dangling-control", property: "a decorative control that asserts nothing (the seed)", enforcementPoint: "(none — deliberately unwired)", provingFile: scratchFile, tier: "predicate" }
  }

  export function render(res: CensusResult): string {
    const lines = [`chokepoint census — ${res.controlCount} controls, ${res.dangling.length} dangling`]
    for (const r of res.rows) {
      const mark = r.dangling ? "⚠ DANGLING" : "✓"
      lines.push(`  ${mark} ${r.id} [${r.tier}] → ${r.enforcementPoint}`)
      lines.push(`      proof: ${r.provingFile} ${r.evidenceSha ? `(${r.evidenceSha.slice(0, 12)}…)` : "(absent)"} — ${r.reason}`)
    }
    return lines.join("\n")
  }
}
