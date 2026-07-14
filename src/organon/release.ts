/**
 * ORGΛNON — THE DERIVATION SPRINT (V36), Phase 5: Release.artifact + Release.d50 — THE RELEASE IS ONE COMMAND (S105).
 *
 * E-3: V35 built, hardened, and MEASURED the binary — then gitignored it, 59M, platform-specific, and never shipped. Yet
 * D50 ticked "(i) a binary exists ✓" and "(ii) an install path exists ✓" on evidence that did not satisfy them. This makes
 * the D50 checkboxes COMPUTE (X-DERIVE(c): a boolean is computed or it is FALSE). They compute RED — and that is the
 * honest, correct output: the agent removes every technical barrier (organon.sh release builds the binary + SHA-256 + a
 * one-line install), and the checkbox stays red until a HUMAN pushes. A green D50(i) on a gitignored artifact is exactly
 * the defect this predicate exists to end.
 *
 * The reproducibility of `bun build --compile` (a byte-identical binary across machines) is UNVERIFIED and stated as such
 * (attack #8 / X-HONEST) — the release ships a SHA-256, no embedded key, and the console off by default (V34-sealed).
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "./frozen"
import { Reach } from "./reach"

export namespace Release {
  export interface Manifest {
    protocol: "release-manifest"
    built: { ran: boolean; binaryPath: string; sha256: string | null; sizeBytes: number | null; note: string }
    committedArtifactPath: string | null // a release artifact at a COMMITTED (git-tracked) path — null while dist/ is gitignored
    installLine: string
    reproducibilityUnverified: boolean // SUBSTANCE V38 (S127) — now COMPUTED from a two-build check, not a blanket true
    // SUBSTANCE V38 (S127) — the verified (or NAMED) reproducibility result: two builds to the canonical outfile, two shas.
    reproducible?: { verified: boolean; sha1: string; sha2: string; note: string }
    // SUBSTANCE V38 (S120) — the negotiated MCP protocol range travels with the release manifest.
    protocolRange?: { supported: string[]; current: string; verified: boolean }
  }

  export type Artifact = { path: string; sha256: string; installLine: string } | "ABSENT"

  export function manifest(): Manifest | null {
    const p = path.join(PKG_ROOT, "data", "honesty", "release-manifest.json")
    return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as Manifest) : null
  }

  // Release.artifact() — a COMMITTED, checksummed release artifact, or ABSENT. dist/ is gitignored (line 44 of .gitignore),
  // so a built binary is NOT a committed artifact: this returns ABSENT until a real release is committed/published. The
  // build's sha (evidence the release is buildable) lives in the manifest; it does NOT make the artifact present.
  export function artifact(): Artifact {
    const m = manifest()
    if (!m) return "ABSENT"
    if (m.committedArtifactPath && existsSync(path.join(PKG_ROOT, m.committedArtifactPath)) && m.built.sha256)
      return { path: m.committedArtifactPath, sha256: m.built.sha256, installLine: m.installLine }
    return "ABSENT" // built ≠ committed; distribution is not capability (X-REACH(f))
  }

  export interface D50 {
    i_binaryCommitted: { value: boolean; detail: string }
    ii_installDocumented: { value: boolean; detail: string }
    iii_published: { value: boolean; detail: string }
    iv_windowElapsed: { value: boolean; detail: string }
    canFire: boolean // the kill-criterion may be weighed on the number ONLY when all four hold — computes RED while unpublished
  }

  // COMPUTE the four D50 checkboxes (E-3). Each is a boolean derived from an artifact, never typed.
  export function d50(): D50 {
    const art = artifact()
    const m = manifest()
    const { published, detail: pubDetail } = Reach.derivePublished()

    const i_binaryCommitted = {
      value: art !== "ABSENT",
      detail: art === "ABSENT"
        ? "no checksummed release artifact exists at a COMMITTED path — the binary builds (organon.sh release) but dist/ is gitignored; a binary nobody can download is not a door (RED)"
        : `a committed checksummed release artifact exists at ${(art as { path: string }).path}`,
    }
    const ii_installDocumented = {
      value: !!m && typeof m.installLine === "string" && m.installLine.length > 0,
      detail: m ? `a one-line install is documented: "${m.installLine}"` : "no release manifest — no documented install (RED)",
    }
    const iii_published = { value: published, detail: pubDetail }
    // (iv) the observation window: only meaningful once published; while unpublished it cannot have elapsed.
    const iv_windowElapsed = {
      value: false,
      detail: published
        ? "publication detected — the 90-day window (RP-5) is now the Operator's calendar; elapsed is computed from the publication commit date (not available to the agent)"
        : "unpublished — the observation window (90 days from publication / 30 from first external clone, RP-5) has not begun (RED)",
    }
    const canFire = i_binaryCommitted.value && ii_installDocumented.value && iii_published.value && iv_windowElapsed.value
    return { i_binaryCommitted, ii_installDocumented, iii_published, iv_windowElapsed, canFire }
  }
}
