/**
 * ORGΛNON — DETERMINISTIC BUILD-CAPTURE (Build-Provenance Phase 3, X-VERIFY c,e). Turns a REAL ingested VerifiedSource
 * into a content-addressed, deterministic capture — REUSING the existing analyzer VERBATIM (analyzeProject + facts.ts;
 * no re-implementation — X-KEEP). This is the ONLY new module that runs `forge build` (the OPTIONAL Foundry seam), and it
 * belongs to the capture path, NEVER the render. The pipeline is: source → (materialize) → forge build → build-info AST →
 * analyzeProject/ContractIR → the six facts.ts tools → content-hash. An absent toolchain / build failure → null (never a
 * crash — the coarse screen scores alone, S30). Deterministic: a fixed build → byte-identical facts + a byte-identical
 * contentSha; a changed source byte → a changed sourceHash (S29).
 */
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { Process, Glob } from "./fs"
import { analyzeProject } from "./analyze"
import { contractFacts, type StructuralFacts } from "./facts"
import type { ContractIngest } from "./ingest"

export namespace BuildCapture {
  // the tool-set / ruleset version stamped on every capture — so a future tool-set change is legible in the provenance
  export const RULESET = "contract-facts@v1(auth-surface·call-graph·upgrade-check·storage-layout·value-flow·state-flow)"

  export interface Capture {
    protocol: string
    chainId: number | null
    address: string | null
    provenance: "REAL" | "SAMPLE" // carried from the ingested source (a PARTIAL/absent source is never REAL)
    verified: boolean
    facts: StructuralFacts
    sourceHash: string | null // the verified-source identity (byte-sensitive — a one-byte source change changes it, S29)
    contentSha: string // sha256 of the deterministic facts (the registry content-hash — matches ContractCapture.contentSha)
    ruleset: string // the stamped tool-set version
    compiler: string | null
    source: string // key-scrubbed provenance from ingest
    capturedAt: number
  }

  export interface Options {
    workDir?: string // where a FETCHED source is materialized (an Operator-build uses its own projectRoot)
    capturedAt: number
    skipBuild?: boolean // do not run forge (analyze an already-built dir only) — used by the hermetic battery
  }

  const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
  const hasBuildInfo = (root: string) =>
    Glob.scanSync("**/build-info/*.json", { cwd: root, absolute: true }).length > 0

  // materialize a fetched source set into a Foundry project so `forge build` can compile it (the Operator-build path skips this)
  function materialize(vs: ContractIngest.VerifiedSource, dir: string) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(path.join(dir, "foundry.toml"), "[profile.default]\nsrc = 'src'\nout = 'out'\nbuild_info = true\nast = true\n")
    for (const f of vs.files) {
      if (!f.path.endsWith(".sol")) continue
      const rel = f.path.startsWith("src/") ? f.path : path.join("src", f.path)
      const abs = path.join(dir, rel)
      mkdirSync(path.dirname(abs), { recursive: true })
      writeFileSync(abs, f.content)
    }
  }

  /**
   * Capture a build from a VerifiedSource. Returns a content-addressed Capture, or null when the source is unavailable /
   * the toolchain is absent / the build or analysis fails (never a crash — the sub-axis stays UNVERIFIED, S30).
   * `provenance`/`verified` are carried from ingest — this module NEVER promotes a SAMPLE source to REAL.
   */
  export async function captureBuild(vs: ContractIngest.VerifiedSource, opts: Options): Promise<Capture | null> {
    if (vs.kind === "unavailable" || vs.files.length === 0) return null
    // the build dir: an Operator-build uses its own (already-on-disk) projectRoot; a fetched source is materialized
    let root: string
    if (vs.projectRoot && existsSync(vs.projectRoot)) root = vs.projectRoot
    else if (opts.workDir) {
      materialize(vs, opts.workDir)
      root = opts.workDir
    } else return null
    // build if needed (the OPTIONAL Foundry seam): an absent/failed forge → null, never a crash (S30)
    if (!hasBuildInfo(root)) {
      if (opts.skipBuild) return null
      const r = await Process.run(["forge", "build", "--build-info", "--ast"], { cwd: root, nothrow: true })
      if (r.code !== 0 || !hasBuildInfo(root)) return null
    }
    let facts: StructuralFacts
    try {
      facts = contractFacts(await analyzeProject(root)) // the analyzer reused VERBATIM (X-KEEP)
    } catch {
      return null // a malformed/unanalyzable build → null, the coarse screen scores alone
    }
    return {
      protocol: vs.protocol,
      chainId: vs.chainId,
      address: vs.address,
      provenance: vs.provenance, // carried — never promoted (a SAMPLE source stays SAMPLE)
      verified: vs.verified,
      facts,
      sourceHash: vs.contentHash,
      contentSha: sha256(JSON.stringify(facts)), // the deterministic facts identity (the registry content-hash)
      ruleset: RULESET,
      compiler: vs.compiler,
      source: vs.source,
      capturedAt: opts.capturedAt,
    }
  }
}
