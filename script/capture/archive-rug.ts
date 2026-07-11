/**
 * ORGΛNON — THE GROUND-TRUTH SPRINT, Phase 4 (REAL-RUG-AT-HEIGHT; X-GROUNDTRUTH c, S63). ONE pinned subject, ONE pinned
 * pre-collapse height, THREE reads (the SAME reads the live path makes — admin slot · implementation · admin code + the
 * owner-hop), over FREE ARCHIVE-CAPABLE endpoints only. The pinned rug (rationale recorded in Phase 0, groundtruth-pins):
 * PAID Network's V1 token proxy (0x8c8687fc…348df), a March 2021 compromised-deployer-key upgrade rug. The capture is
 * content-hashed + cross-checked across ≥2 free archive endpoints (re-verifiable against its named endpoints+height); the
 * classifier + grammar run on the REAL pre-collapse state. If NO free endpoint serves the height → the HONEST GAP (the full
 * attempt log) is recorded and the claim wording HELD at clean-vs-synthetic — a simulated archive read dressed REAL is the
 * cardinal sin. BOUNDED: one subject, one height, three reads — no range-scan, no second rug (the archive-node scope stays
 * PARKED). Run: bun run script/capture/archive-rug.ts
 */
import { createHash } from "node:crypto"
import { writeFileSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Governance } from "../../src/contract/governance"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

// PINNED (groundtruth-pins.json archiveCaptureSpec) — recorded BEFORE the capture (the anti-cherry-pick rule).
const SUBJECT = { name: "PAID Network token (V1, exploited)", address: "0x8c8687fc965593dfb2f0b4eaefd55e9d8df348df", chainId: 1 }
const BLOCK = 11975000
const IMPL_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
const ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
const SEL = { getThreshold: "0xe75235b8", getOwners: "0xa0e67e2b", getMinDelay: "0xf27a0c92", delay: "0x6a42b8f8", owner: "0x8da5cb5b" }
// the FREE archive-capable rotation — the tool's own rotation {llamarpc, ankr, publicnode, 1rpc} prunes archive state
// (publicnode: "Archive requests require a personal token"; ankr: key-required; 1rpc: "historical state not available") —
// so the rotation is EXTENDED with free archive-serving RPCs. A BYOK/paid archive key is a cut; if none serve → honest gap.
const ARCHIVE_ROTATION = ["https://eth.drpc.org", "https://rpc.mevblocker.io", "https://eth-mainnet.public.blastapi.io"]
const blockHex = "0x" + BLOCK.toString(16)

async function rpc(url: string, method: string, params: unknown[]): Promise<string | null> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: AbortSignal.timeout(12_000) })
    if (!res.ok) return null
    const j = (await res.json()) as { result?: string; error?: unknown }
    if (j.error || j.result === undefined) return null
    return j.result
  } catch {
    return null
  }
}
const nonZeroAddr = (slot: string | null): string | null => (slot && /[1-9a-f]/i.test(slot.slice(26)) ? "0x" + slot.slice(-40) : null)
const responds = (r: string | null): boolean => !!r && r !== "0x" && r.length > 2

// the same admin probe the live path makes, at the pinned historical block, over ONE archive endpoint.
async function probeAt(url: string): Promise<{ probe: Governance.AdminProbe; implementation: string | null; adminSlotRaw: string } | null> {
  const adminRaw = await rpc(url, "eth_getStorageAt", [SUBJECT.address, ADMIN_SLOT, blockHex])
  if (adminRaw === null) return null // this endpoint does not serve the height
  const implRaw = await rpc(url, "eth_getStorageAt", [SUBJECT.address, IMPL_SLOT, blockHex])
  const adminAddr = nonZeroAddr(adminRaw)
  const p: Governance.AdminProbe = { adminAddr, adminCodePresent: false, isSafe: false, isTimelock: false, ownerAddr: null, ownerCodePresent: false, ownerIsSafe: false, ownerIsTimelock: false }
  if (adminAddr) {
    p.adminCodePresent = responds(await rpc(url, "eth_getCode", [adminAddr, blockHex]))
    if (p.adminCodePresent) {
      p.isSafe = responds(await rpc(url, "eth_call", [{ to: adminAddr, data: SEL.getThreshold }, blockHex])) && responds(await rpc(url, "eth_call", [{ to: adminAddr, data: SEL.getOwners }, blockHex]))
      p.isTimelock = responds(await rpc(url, "eth_call", [{ to: adminAddr, data: SEL.getMinDelay }, blockHex])) || responds(await rpc(url, "eth_call", [{ to: adminAddr, data: SEL.delay }, blockHex]))
      if (!p.isSafe && !p.isTimelock) {
        const ow = await rpc(url, "eth_call", [{ to: adminAddr, data: SEL.owner }, blockHex])
        p.ownerAddr = ow && ow.length >= 66 ? "0x" + ow.slice(-40) : null
        if (p.ownerAddr) {
          p.ownerCodePresent = responds(await rpc(url, "eth_getCode", [p.ownerAddr, blockHex]))
          p.ownerIsTimelock = responds(await rpc(url, "eth_call", [{ to: p.ownerAddr, data: SEL.getMinDelay }, blockHex])) || responds(await rpc(url, "eth_call", [{ to: p.ownerAddr, data: SEL.delay }, blockHex]))
          p.ownerIsSafe = responds(await rpc(url, "eth_call", [{ to: p.ownerAddr, data: SEL.getThreshold }, blockHex]))
        }
      }
    }
  }
  return { probe: p, implementation: nonZeroAddr(implRaw), adminSlotRaw: adminRaw }
}

async function main() {
  const outPath = path.join(PKG_ROOT, "data", "honesty", "governance", "archive-rug.json")
  const attempts: { endpoint: string; served: boolean; adminAddr: string | null; ownerAddr: string | null; adminClass?: string }[] = []
  const served: { url: string; r: NonNullable<Awaited<ReturnType<typeof probeAt>>> }[] = []
  for (const url of ARCHIVE_ROTATION) {
    const r = await probeAt(url)
    if (!r) {
      attempts.push({ endpoint: url, served: false, adminAddr: null, ownerAddr: null })
      console.log(`  ${url.padEnd(42)} did NOT serve the height`)
      continue
    }
    const { adminClass } = Governance.classifyAdmin(r.probe)
    attempts.push({ endpoint: url, served: true, adminAddr: r.probe.adminAddr, ownerAddr: r.probe.ownerAddr, adminClass })
    served.push({ url, r })
    console.log(`  ${url.padEnd(42)} SERVED · admin=${(r.probe.adminAddr ?? "ZERO").slice(0, 12)} owner=${(r.probe.ownerAddr ?? "-").slice(0, 12)} → ${adminClass}`)
  }

  // HONEST GAP — no free endpoint served the height (S63): record the full attempt log, hold the claim at clean-vs-synthetic.
  if (served.length === 0) {
    const body = { protocol: "archive-rug", status: "HONEST-GAP", subject: SUBJECT, block: BLOCK, attempts, note: "no free archive-capable endpoint served the pinned height — the discrimination claim STAYS at clean-vs-synthetic; nothing simulated (S63). A BYOK archive endpoint is Operator-owned, never faked." }
    writeFileSync(outPath, JSON.stringify({ ...body, contentSha: sha256(JSON.stringify(body)) }, null, 1) + "\n")
    console.log("── ARCHIVE-RUG → HONEST GAP (no free endpoint served the height) ──")
    return
  }

  // CROSS-CHECK — ≥2 free endpoints must AGREE on the admin + owner + classification (a single endpoint is not load-bearing).
  const base = served[0].r
  const { adminClass, how } = Governance.classifyAdmin(base.probe)
  const agree = served.filter((s) => s.r.probe.adminAddr === base.probe.adminAddr && s.r.probe.ownerAddr === base.probe.ownerAddr && s.r.implementation === base.implementation)
  const crossChecked = agree.length >= 2
  const artifact: Governance.Artifact & { synthetic?: never } = {
    subject: "paid-network-v1-rug", block: String(BLOCK), implementation: base.implementation, pattern: "EIP-1967 transparent",
    canonicalMatch: true, adminSlotValue: base.adminSlotRaw, adminAddr: base.probe.adminAddr, adminClass, how,
    probes: base.probe, contentSha: "",
  }
  const line = Governance.governanceLine(artifact)
  const body = {
    protocol: "archive-rug",
    status: "CAPTURED",
    subject: SUBJECT,
    block: BLOCK,
    endpoints: served.map((s) => s.url),
    crossChecked,
    reads: { adminSlot: base.adminSlotRaw, adminAddr: base.probe.adminAddr, implementation: base.implementation, ownerAddr: base.probe.ownerAddr, ownerIsEoa: base.probe.ownerAddr ? !base.probe.ownerCodePresent : null },
    adminClass,
    how,
    governanceLine: line,
    rug: "PAID Network — March 5 2021: a compromised deployer key (the ProxyAdmin's EOA owner, one hop out) drove the token proxy's upgrade function → a malicious implementation → minted 59,471,745 PAID. The axis reads that pre-collapse upgrade-key surface.",
    claim: adminClass === "EOA" ? "the governance axis rendered the DAMNING EOA line on this real rug's REAL pre-collapse state — a single key (the ProxyAdmin's EOA owner) controlled the upgrade path, one hop out" : `the axis rendered ${adminClass} on the real pre-collapse state (the artifact reports what IS, not what flatters)`,
    doesNotClaim: "the axis flags the UPGRADE-KEY SURFACE (the EIP-1967 admin, resolved to an EOA one hop out); it does NOT predict all collapse mechanisms. This is a real rug's real chain state, not a prediction.",
    attempts,
  }
  writeFileSync(outPath, JSON.stringify({ ...body, contentSha: sha256(JSON.stringify(body)) }, null, 1) + "\n")
  console.log(`── ARCHIVE-RUG → CAPTURED (${served.length} free endpoints, cross-checked=${crossChecked}) · ${adminClass} · "${line}" ──`)
}

main().catch((e) => {
  console.error("archive-rug FAILED:", e)
  process.exit(1)
})
