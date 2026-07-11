/**
 * ORGΛNON — THE PRECISION SPRINT, Phase 3 (SCREEN-ON-TRUTH). RE-POINT AT THE RESOLVED IMPLEMENTATION. The governance
 * capture (Phase 2) resolved each subject's implementation address; this step analyzes THAT source (the code that
 * actually executes) with the EXISTING analyzer VERBATIM (ContractIngest.fromSourcify → BuildCapture.captureBuild →
 * facts.ts), so the findings describe the LOGIC, not the proxy shell — and the 20–40 proxy-shell fingerprints stop
 * masquerading as risk (they are summarized once, in the governance line).
 *
 * It writes to data/honesty/governance/impl/{subject}.json — a NEW artifact the render consumes; the existing
 * contract-registry.json (proxy-based) is left BYTE-UNTOUCHED (zero ripple to the frozen differential + the pinned
 * counterparty tests — the differential fingerprints the Stamp verdict path, not the contract sub-axis). An impl whose
 * Sourcify match is not EXACT stays honestly SAMPLE (never a fabricated REAL); an unresolvable/unverified impl is UNVERIFIED
 * (the governance line renders regardless — the admin fact needs no source). Run (Operator, forge + network):
 *   bun run script/capture/impl-findings.ts
 */
import { createHash } from "node:crypto"
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { ContractIngest } from "../../src/contract/ingest"
import { BuildCapture } from "../../src/contract/buildcapture"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const ASOF = Date.parse("2026-07-11T00:00:00Z")

// the subjects whose implementation the governance capture resolved (impl address read from the committed artifact).
const SUBJECTS = [
  { slug: "aave-v3-pool", protocol: "aave-v3 Pool (implementation)" },
  { slug: "compound-v3-usdc", protocol: "compound-v3 Comet (implementation)" },
] as const

async function main() {
  const govDir = path.join(PKG_ROOT, "data", "honesty", "governance")
  const outDir = path.join(govDir, "impl")
  mkdirSync(outDir, { recursive: true })
  const work = path.join(tmpdir(), "organon-impl-capture")
  mkdirSync(work, { recursive: true })
  let i = 0
  for (const s of SUBJECTS) {
    const gov = JSON.parse(readFileSync(path.join(govDir, `${s.slug}.json`), "utf8"))
    const implAddr: string | null = gov.implementation
    if (!implAddr) {
      console.log(`  ${s.slug.padEnd(18)} no resolved implementation → UNVERIFIED (the governance line renders regardless)`)
      continue
    }
    const vs = await ContractIngest.fromSourcify({ protocol: s.protocol, chainId: 1, address: implAddr, asOf: ASOF })
    if (vs.kind === "unavailable") {
      console.log(`  ${s.slug.padEnd(18)} impl ${implAddr.slice(0, 10)} — Sourcify has no source → UNVERIFIED (honest; the governance line still renders)`)
      const body = { subject: s.slug, implementation: implAddr, provenance: "UNVERIFIED", verified: false, source: vs.source, contracts: [] as string[], findings: [] as unknown[], note: "the resolved implementation has no Sourcify-verified source — the tier stays UNVERIFIED; the screen does not guess" }
      writeFileSync(path.join(outDir, `${s.slug}.json`), JSON.stringify({ ...body, contentSha: sha256(JSON.stringify(body)) }, null, 1) + "\n")
      continue
    }
    const cap = await BuildCapture.captureBuild(vs, { workDir: path.join(work, String(i++)), capturedAt: ASOF })
    if (!cap) {
      console.log(`  ${s.slug.padEnd(18)} impl ${implAddr.slice(0, 10)} — build/analysis failed (forge) → UNVERIFIED (honest)`)
      const body = { subject: s.slug, implementation: implAddr, provenance: "UNVERIFIED", verified: false, source: vs.source, contracts: [] as string[], findings: [] as unknown[], note: "forge build/analysis of the resolved implementation did not complete — UNVERIFIED; the coarse screen + the governance line stand" }
      writeFileSync(path.join(outDir, `${s.slug}.json`), JSON.stringify({ ...body, contentSha: sha256(JSON.stringify(body)) }, null, 1) + "\n")
      continue
    }
    const body = {
      subject: s.slug,
      implementation: implAddr,
      provenance: cap.provenance, // REAL iff an EXACT Sourcify match; a partial match is honestly SAMPLE
      verified: cap.provenance === "REAL",
      source: cap.source,
      contracts: cap.facts.contracts,
      flaggedCategories: cap.facts.flaggedCategories,
      findings: cap.facts.findings,
    }
    const contentSha = sha256(JSON.stringify(body))
    writeFileSync(path.join(outDir, `${s.slug}.json`), JSON.stringify({ ...body, contentSha }, null, 1) + "\n")
    console.log(`  ${s.slug.padEnd(18)} impl ${implAddr.slice(0, 10)} — ${cap.provenance} · ${cap.facts.contracts.length} contract(s) · ${cap.facts.findings.length} findings · ${cap.facts.flaggedCategories.join(",") || "CLEAN-STRUCTURE"}`)
  }
  console.log("── IMPL-FINDINGS (re-point) written to data/honesty/governance/impl/ ─────────")
}

main().catch((e) => {
  console.error("impl-findings capture FAILED:", e)
  process.exit(1)
})
