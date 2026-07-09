/**
 * ORGΛNON — the CAPTURE-TIME contract analysis (Contract-Truth Phase 3, X-CONTRACT e). This is the ONLY contract module
 * that runs the analyzer (imports `./analyze`) — it belongs to the registration/cadence path, NEVER the render. It reads
 * a protocol's compiled Foundry build → the ContractIR → the deterministic structural facts, content-hashes them, and
 * returns a capture for the registry. The Foundry toolchain is an OPTIONAL seam: an absent/unanalyzable build → null
 * (ABSENT), the caller records nothing, and the sub-axis renders UNVERIFIED — never a fabricated all-clear (S27).
 */
import { createHash } from "node:crypto"
import { analyzeProject } from "./analyze"
import { contractFacts } from "./facts"
import type { ContractCapture } from "./registry"

/**
 * Analyze a protocol's Foundry build at capture time. `provenance` is REAL only when the caller supplied the VERIFIED
 * deployed source; otherwise SAMPLE. Returns null (ABSENT) when the build/toolchain is missing or the analysis throws —
 * the caller then records nothing and the sub-axis is UNVERIFIED (the coarse screen scores alone).
 */
export async function captureContractAnalysis(
  poolKey: string,
  projectRoot: string,
  provenance: "REAL" | "SAMPLE",
  capturedAt: number,
): Promise<ContractCapture | null> {
  try {
    const ir = await analyzeProject(projectRoot)
    const facts = contractFacts(ir)
    const contentSha = createHash("sha256").update(JSON.stringify(facts)).digest("hex")
    return { poolKey, facts, provenance, capturedAt, contentSha }
  } catch {
    return null // ABSENT — no build/toolchain, or unanalyzable; the coarse screen scores alone (S27), never a crash
  }
}
