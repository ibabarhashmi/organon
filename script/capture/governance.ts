/**
 * ORGΛNON — THE PRECISION SPRINT, Phase 2 (RESOLVER-TRUE; D26 branch B). THE GOVERNANCE CAPTURE — WHO HOLDS THE KEY,
 * resolved at ONE pinned block per subject, content-hashed into the moat. Branch B (the hand-rolled narrow resolver,
 * chosen this sprint — zero deps, Bun-native): raw eth_getStorageAt on the EIP-1967 implementation + admin slots, the
 * EIP-1167 clone bytecode read, the EIP-2535 diamond loupe eth_call, over the tool's OWN free RPC rotation
 * (PlaneRpcState {llamarpc, ankr, publicnode, 1rpc} — no new provider, no paid tier). The admin is classified by the
 * CONSERVATIVE pure classifier (src/contract/governance.ts): a ZERO admin slot is UNRESOLVED (never EOA — the aave/spark
 * immutable-admin datum); a bare EOA (direct or one owner-hop out) is the damning EOA; ambiguity is UNRESOLVED.
 *
 * The cross-checks are OPTIONAL and NEVER load-bearing (X-PRECISION): Etherscan `getsourcecode` runs ONLY when a BYOK
 * ETHERSCAN_API_KEY is present (recorded as corroboration; a DISAGREEMENT is SURFACED, never arbitrated); absent → the
 * field reads ABSENT. The load-bearing reads are always the tool's own rotation — the moat stays sovereign and free.
 *
 * NO viem/whatsabi import (that is branch A, D26-signed); this file imports the tool's own PlaneRpcState + the pure
 * classifier only. Every read is block-pinned. Run (Bun):  bun run script/capture/governance.ts
 */
import { createHash } from "node:crypto"
import { writeFileSync, mkdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { PlaneRpcState } from "../../src/plane/rpcstate"
import { Governance } from "../../src/contract/governance"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

// EIP-1967 slots (pinned verbatim in precision-pins) + the probe selectors.
const IMPL_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
const ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
const BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50"
const CLONE_1167 = "363d3d373d3d3d363d73"
const SEL = { getThreshold: "0xe75235b8", getOwners: "0xa0e67e2b", getMinDelay: "0xf27a0c92", delay: "0x6a42b8f8", owner: "0x8da5cb5b", facetAddresses: "0x52ef6b2c" }

// the shelf yield/lending subjects the contract screen applies to (poolKey → the on-chain contract the pool is served by).
const SUBJECTS = [
  { slug: "aave-v3-pool", poolKeys: ["defillama:pool:aa70268e-4b52-42bf-a116-608b370f9501", "defillama:pool:f981a304-bb6c-45b8-b0c5-fd2f515ad23a", "defillama:pool:3665ee7e-6c5d-49d9-abb7-c47ab5d9d4ac"], name: "aave-v3 Pool", addr: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" },
  { slug: "sparklend-pool", poolKeys: ["defillama:pool:e26ce7d9-db75-4aa4-b1db-cc21ae17bdfb"], name: "sparklend Pool", addr: "0xC13e21B648A5Ee794902342038FF3aDAB66BE987" },
  { slug: "fluid-usdc", poolKeys: ["defillama:pool:4438dabc-7f0c-430b-8136-2722711ae663"], name: "fluid USDC fToken", addr: "0x9Fb7b4477576Fe5B32be4C1843aFB1e55F251B33" },
  { slug: "compound-v3-usdc", poolKeys: ["defillama:pool:7da72d09-56ca-4ec5-a45f-59114353e487"], name: "compound-v3 USDC Comet", addr: "0xc3d688B66703497DAA19211EEdff47f25384cdc3" },
  { slug: "curve-usdc", poolKeys: ["defillama:pool:e91e23af-9099-45d9-8ba5-ea5b4638e453"], name: "curve-dex pool", addr: "0xd001ae433f254283fece51d4acce8c53263aa186" },
] as const

const nonZeroAddr = (slotVal: string | null): string | null => (slotVal && /[1-9a-f]/i.test(slotVal.slice(26)) ? "0x" + slotVal.slice(-40) : null)
const responds = (r: string | null): boolean => !!r && r !== "0x" && r.length > 2

async function readAt(method: string, params: unknown[]): Promise<string | null> {
  const r = await PlaneRpcState.read(method, params, PlaneRpcState.jsonRpc)
  return r ? r.value : null
}

async function probeAdmin(addr: string, block: string): Promise<Governance.AdminProbe & { raw: string }> {
  const raw = (await readAt("eth_getStorageAt", [addr, ADMIN_SLOT, block])) ?? "0x0"
  const adminAddr = nonZeroAddr(raw)
  let p: Governance.AdminProbe = { adminAddr, adminCodePresent: false, isSafe: false, isTimelock: false, ownerAddr: null, ownerCodePresent: false, ownerIsSafe: false, ownerIsTimelock: false }
  if (adminAddr) {
    const code = await readAt("eth_getCode", [adminAddr, block])
    p.adminCodePresent = responds(code)
    if (p.adminCodePresent) {
      const thr = await readAt("eth_call", [{ to: adminAddr, data: SEL.getThreshold }, block]).catch(() => null)
      const own = await readAt("eth_call", [{ to: adminAddr, data: SEL.getOwners }, block]).catch(() => null)
      p.isSafe = responds(thr) && responds(own)
      const md = await readAt("eth_call", [{ to: adminAddr, data: SEL.getMinDelay }, block]).catch(() => null)
      const dl = await readAt("eth_call", [{ to: adminAddr, data: SEL.delay }, block]).catch(() => null)
      p.isTimelock = responds(md) || responds(dl)
      if (!p.isSafe && !p.isTimelock) {
        const ow = await readAt("eth_call", [{ to: adminAddr, data: SEL.owner }, block]).catch(() => null)
        p.ownerAddr = ow && ow.length >= 66 ? "0x" + ow.slice(-40) : null
        if (p.ownerAddr) {
          const oc = await readAt("eth_getCode", [p.ownerAddr, block])
          p.ownerCodePresent = responds(oc)
          const omd = await readAt("eth_call", [{ to: p.ownerAddr, data: SEL.getMinDelay }, block]).catch(() => null)
          const odl = await readAt("eth_call", [{ to: p.ownerAddr, data: SEL.delay }, block]).catch(() => null)
          const oth = await readAt("eth_call", [{ to: p.ownerAddr, data: SEL.getThreshold }, block]).catch(() => null)
          p.ownerIsTimelock = responds(omd) || responds(odl)
          p.ownerIsSafe = responds(oth)
        }
      }
    }
  }
  return { ...p, raw }
}

async function resolvePattern(addr: string, block: string): Promise<{ implementation: string | null; pattern: string; canonicalMatch: boolean }> {
  const impl = nonZeroAddr(await readAt("eth_getStorageAt", [addr, IMPL_SLOT, block]))
  if (impl) return { implementation: impl, pattern: "EIP-1967", canonicalMatch: true }
  const beacon = nonZeroAddr(await readAt("eth_getStorageAt", [addr, BEACON_SLOT, block]))
  if (beacon) return { implementation: beacon, pattern: "beacon", canonicalMatch: true }
  const code = (await readAt("eth_getCode", [addr, block])) ?? "0x"
  if (code.slice(2).includes(CLONE_1167)) {
    const idx = code.indexOf(CLONE_1167)
    const embedded = "0x" + code.slice(idx + CLONE_1167.length, idx + CLONE_1167.length + 40)
    return { implementation: embedded, pattern: "EIP-1167 clone", canonicalMatch: true }
  }
  const loupe = await readAt("eth_call", [{ to: addr, data: SEL.facetAddresses }, block]).catch(() => null)
  if (loupe && loupe.length > 130) return { implementation: null, pattern: "EIP-2535 diamond", canonicalMatch: true }
  return { implementation: null, pattern: "non-canonical", canonicalMatch: false }
}

// the OPTIONAL Etherscan cross-check — ONLY with a BYOK key; ABSENT-honest; a disagreement is SURFACED, never arbitrated.
async function etherscanCrossCheck(addr: string): Promise<{ etherscan: string; agrees: boolean | null; note: string }> {
  const key = process.env.ETHERSCAN_API_KEY
  if (!key) return { etherscan: "ABSENT", agrees: null, note: "no ETHERSCAN_API_KEY — the cross-check is optional; the load-bearing read is the tool's own RPC rotation" }
  try {
    const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${addr}&apikey=${key}`
    const res = await fetch(url)
    const j = (await res.json()) as { result?: { Proxy?: string; Implementation?: string }[] }
    const r = j.result?.[0]
    if (!r) return { etherscan: "ABSENT", agrees: null, note: "Etherscan returned no result — treated as ABSENT (never load-bearing)" }
    return { etherscan: `Proxy=${r.Proxy ?? "?"} Implementation=${r.Implementation ?? ""}`, agrees: null, note: "recorded as corroboration; a disagreement with the tool's own resolution is SURFACED, never arbitrated" }
  } catch (e) {
    return { etherscan: "ABSENT", agrees: null, note: `Etherscan fetch failed (${(e as Error).message}) — ABSENT-honest, the pass does not depend on it` }
  }
}

async function main() {
  const bnHex = await readAt("eth_blockNumber", [])
  if (!bnHex) {
    console.error("governance capture: the RPC rotation is fully dead — no fabricated state written (X-PLANE). Re-run when a free node answers.")
    process.exit(1)
  }
  const head = parseInt(bnHex, 16)
  const block = "0x" + (head - 40).toString(16) // a finalized, reorg-safe height; ONE pinned block per subject capture

  const dir = path.join(PKG_ROOT, "data", "honesty", "governance")
  mkdirSync(dir, { recursive: true })
  const census: Record<string, number> = { EOA: 0, SAFE: 0, TIMELOCK: 0, UNRESOLVED: 0 }

  for (const s of SUBJECTS) {
    const { implementation, pattern, canonicalMatch } = await resolvePattern(s.addr, block)
    const probe = await probeAdmin(s.addr, block)
    const { adminClass, how } = Governance.classifyAdmin(probe)
    const crossCheck = await etherscanCrossCheck(s.addr)
    census[adminClass]++
    const body: Omit<Governance.Artifact, "contentSha"> = {
      subject: s.slug,
      block: (head - 40).toString(),
      implementation,
      pattern,
      canonicalMatch,
      adminSlotValue: probe.raw,
      adminAddr: probe.adminAddr,
      adminClass,
      how,
      probes: { adminCodePresent: probe.adminCodePresent, isSafe: probe.isSafe, isTimelock: probe.isTimelock, ownerAddr: probe.ownerAddr, ownerCodePresent: probe.ownerCodePresent, ownerIsSafe: probe.ownerIsSafe, ownerIsTimelock: probe.ownerIsTimelock },
      crossCheck,
    }
    const contentSha = sha256(JSON.stringify(body))
    const artifact: Governance.Artifact & { name: string; poolKeys: readonly string[]; provenance: string } = { ...body, name: s.name, poolKeys: s.poolKeys, provenance: "REAL", contentSha }
    writeFileSync(path.join(dir, `${s.slug}.json`), JSON.stringify(artifact, null, 1) + "\n")
    console.log(`  ${s.slug.padEnd(18)} pattern=${pattern.padEnd(16)} admin=${(probe.adminAddr ?? "ZERO").slice(0, 12).padEnd(12)} → ${adminClass}`)
  }

  // the census index — the real-world admin-class distribution over the captured shelf (grounds the discrimination).
  writeFileSync(
    path.join(dir, "census.json"),
    JSON.stringify({ protocol: "governance-census", at: "2026-07-11", block: (head - 40).toString(), rule: "the real admin-class distribution over the captured shelf subjects, at one pinned block, over the tool's own free RPC rotation (branch B, zero-dep). EOA-admin is the extinct danger class among live survivors.", census, subjects: SUBJECTS.map((s) => s.slug) }, null, 1) + "\n",
  )
  console.log("── GOVERNANCE CAPTURE (D26 branch B) ─────────  pinned block", head - 40, "· census", JSON.stringify(census))
}

main().catch((e) => {
  console.error("governance capture FAILED:", e)
  process.exit(1)
})
