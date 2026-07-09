/**
 * ORGΛNON — THE BUILD-PROVENANCE SPRINT, the Operator-gated REAL contract capture (Phase 4). This is a discrete,
 * network + Foundry step (NOT a mass-path fetch): it ingests a shelf protocol's VERIFIED deployed source (keyless
 * Sourcify v2, EXACT match → REAL), builds it deterministically with `forge`, runs the six-tool analyzer, and writes the
 * REAL entries into `data/honesty/contract-registry.json`. The committed registry (facts + content-hashes) is the durable
 * record — the render + a fresh clone read it with NO forge/network. Re-running reproduces byte-identical facts + hashes.
 *
 * Run (Operator, with forge + network): bun run script/honesty/capture-contracts.ts
 */
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import path from "node:path"
import { tmpdir } from "node:os"
import { PKG_ROOT } from "../../src/organon/frozen"
import { ContractIngest } from "../../src/contract/ingest"
import { BuildCapture } from "../../src/contract/buildcapture"
import type { ContractCapture } from "../../src/contract/registry"

// a fixed capture timestamp so the committed registry is stable across re-captures (the contentSha is over the FACTS, not this)
const ASOF = Date.parse("2026-07-09T00:00:00Z")

// the Operator-attested verified deployed contracts + the shelf pools whose counterparty code they ARE (D10)
const TARGETS: { protocol: string; chainId: number; address: string; poolKeys: string[]; note: string }[] = [
  {
    protocol: "aave-v3 Pool",
    chainId: 1,
    address: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", // the aave-v3 Pool (the deployed proxy the aave-v3 shelf pools deposit into)
    poolKeys: [
      "defillama:pool:aa70268e-4b52-42bf-a116-608b370f9501", // aave-v3 USDC
      "defillama:pool:f981a304-bb6c-45b8-b0c5-fd2f515ad23a", // aave-v3 USDT
      "defillama:pool:3665ee7e-6c5d-49d9-abb7-c47ab5d9d4ac", // aave-v3 DAI
    ],
    note: "the deployed aave-v3 Pool — an upgradeable admin proxy (a real, well-known counterparty surface: the admin can upgrade the implementation)",
  },
  {
    protocol: "compound-v3 cUSDCv3",
    chainId: 1,
    address: "0xc3d688B66703497DAA19211EEdff47f25384cdc3", // the compound-v3 USDC (Comet) deployed proxy
    poolKeys: ["defillama:pool:7da72d09-56ca-4ec5-a45f-59114353e487"], // compound-v3 USDC
    note: "the deployed compound-v3 cUSDCv3 — an upgradeable transparent proxy (a real counterparty surface)",
  },
]

const captures: Record<string, ContractCapture> = {}
const work = path.join(tmpdir(), "organon-contract-capture")
if (existsSync(work)) rmSync(work, { recursive: true, force: true })
mkdirSync(work, { recursive: true })

let i = 0
for (const t of TARGETS) {
  const vs = await ContractIngest.fromSourcify({ protocol: t.protocol, chainId: t.chainId, address: t.address, asOf: ASOF })
  if (vs.provenance !== "REAL") {
    console.log(`✗ ${t.protocol} — NOT an exact verified match (${vs.kind}); SKIPPED (never a fabricated REAL)`)
    continue
  }
  const cap = await BuildCapture.captureBuild(vs, { workDir: path.join(work, String(i++)), capturedAt: ASOF })
  if (!cap) {
    console.log(`✗ ${t.protocol} — build/analysis failed (forge absent or unbuildable); SKIPPED`)
    continue
  }
  console.log(`✓ ${t.protocol} @ ${t.address} — ${cap.provenance} · ${cap.facts.flaggedCategories.join(",") || "CLEAN-STRUCTURE"} · ${cap.facts.findings.length} findings · contentSha ${cap.contentSha.slice(0, 12)}…`)
  for (const poolKey of t.poolKeys) {
    captures[poolKey] = {
      poolKey,
      facts: cap.facts,
      provenance: cap.provenance,
      capturedAt: ASOF,
      contentSha: cap.contentSha,
      chainId: cap.chainId,
      address: cap.address,
      source: cap.source,
      sourceHash: cap.sourceHash,
      ruleset: cap.ruleset,
    }
  }
}
rmSync(work, { recursive: true, force: true })

const out = {
  protocol: "contract-analysis-registry",
  note: "The capture-time record of analyzed protocol builds (content-hashed, REAL/SAMPLE-labeled). The RENDER reads recorded facts from here — never a per-render compilation (X-CONTRACT e). Populated by script/honesty/capture-contracts.ts from keyless Sourcify EXACT-match verified deployed source + `forge build` (Operator-gated; D10). A pool without an entry resolves UNVERIFIED (the coarse age·size·dependency screen scores alone — never a fabricated all-clear, S27/S28). A REAL tier is still a deterministic structural screen over verified source — NOT a full audit, NEVER a 'safe' verdict.",
  capturedAt: ASOF,
  captures,
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "contract-registry.json"), JSON.stringify(out, null, 2) + "\n")
console.log(`\nwritten data/honesty/contract-registry.json — ${Object.keys(captures).length} REAL pool entries`)
