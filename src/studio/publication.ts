/**
 * ORGΛNON — the PUBLICATION GATE (Warranty Phase 2; Rule F-IDENTITY + L-2P). Publication is doubly gated, in order:
 * (1) the IDENTITY gate — no publish until the identity memo's winner is implemented: the CAPABILITY MATRIX is rendered
 * in the README (advertised == actual) AND matrix-vs-reality is green; (2) the CONSENT gate — Operator publication
 * consent is required (the agent cannot self-consent; L-2P). A premature publish (matrix absent, a matrix overclaim, or
 * no consent) is REFUSED. The gate never itself pushes anything — it is the check a publish path must pass first.
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { Matrix } from "./matrix"

export namespace Publication {
  export const README_MATRIX_MARKER = "<!-- CAPABILITY-MATRIX:START -->"

  export interface GateInput { operatorConsent: boolean }
  export interface GateResult { allowed: boolean; reasons: string[] }

  // The identity gate — the memo's winner (publish-slim-honest) is "implemented" iff the matrix is rendered + true.
  export function identityGate(): { ok: boolean; reasons: string[] } {
    const reasons: string[] = []
    const readme = path.join(PKG_ROOT, "README.md")
    const hasMatrix = existsSync(readme) && readFileSync(readme, "utf8").includes(README_MATRIX_MARKER)
    if (!hasMatrix) reasons.push("identity gate: the CAPABILITY MATRIX is not rendered in the README (F-IDENTITY: advertised must equal actual before publication)")
    const r = Matrix.verifyAgainstReality()
    if (!r.ok) reasons.push(`identity gate: matrix-vs-reality mismatch — ${r.mismatches.join("; ")}`)
    return { ok: reasons.length === 0, reasons }
  }

  // The full gate — identity FIRST, then Operator consent. Both must hold. Returns the refusal reasons for the log.
  export function gate(input: GateInput): GateResult {
    const reasons: string[] = []
    const id = identityGate()
    if (!id.ok) reasons.push(...id.reasons)
    if (!input.operatorConsent) reasons.push("consent gate: Operator publication consent is required (L-2P) — the agent cannot self-consent")
    return { allowed: reasons.length === 0, reasons }
  }
}
