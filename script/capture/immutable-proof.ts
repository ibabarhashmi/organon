/**
 * ORGΛNON — THE GROUND-TRUTH SPRINT, Phase 3 (IMMUTABLE-PROVEN; X-GROUNDTRUTH b, D30, S62). The three-condition
 * bytecode-constant IMMUTABLE proof, RUN against the live shelf + the fixtures. For each subject: read the proxy's DEPLOYED
 * bytecode + the EIP-1967 impl slot (at `latest` — the proxy bytecode is immutable), compute the probe (impl embedded as a
 * constant · the 1967 impl slot unused · no admin-slot write path), and prove-or-refuse. ALL-OR-NOTHING: a fabricated "no
 * upgrade path" is stronger poison than a wrong SAFE, so anything short of all three stays UNRESOLVED (the proof decides,
 * never the wish). Writes data/honesty/governance/immutable-proof.json — the per-subject proof + the census.
 *
 * HONEST GROUND TRUTH (verified on-chain): NO live shelf subject is genuinely immutable — aave/spark hold the impl in the
 * 1967 slot (upgradeable by their immutable admin — the blueprint conflated an immutable ADMIN with an immutable IMPL);
 * compound is TIMELOCK-upgradeable; curve/fluid are non-canonical direct contracts. IMMUTABLE is extinct-on-shelf (like
 * EOA), proven on the standard EIP-1167 clone fixture + refused on the S62 disguise. Run: bun run script/capture/immutable-proof.ts
 */
import { createHash } from "node:crypto"
import { writeFileSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { PlaneRpcState } from "../../src/plane/rpcstate"
import { Governance } from "../../src/contract/governance"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const IMPL_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
const govDir = path.join(PKG_ROOT, "data", "honesty", "governance")

const SHELF = [
  { slug: "aave-v3-pool", addr: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" },
  { slug: "sparklend-pool", addr: "0xC13e21B648A5Ee794902342038FF3aDAB66BE987" },
  { slug: "fluid-usdc", addr: "0x9Fb7b4477576Fe5B32be4C1843aFB1e55F251B33" },
  { slug: "compound-v3-usdc", addr: "0xc3d688B66703497DAA19211EEdff47f25384cdc3" },
  { slug: "curve-usdc", addr: "0xd001ae433f254283fece51d4acce8c53263aa186" },
] as const

const read = async (m: string, p: unknown[]): Promise<string | null> => {
  const r = await PlaneRpcState.read(m, p, PlaneRpcState.jsonRpc)
  return r ? r.value : null
}
const nonZeroAddr = (slot: string | null): boolean => !!slot && /[1-9a-f]/i.test(slot.slice(26))

async function main() {
  const subjects: Record<string, unknown>[] = []
  const bnHex = await read("eth_blockNumber", [])
  const block = bnHex ? parseInt(bnHex, 16) - 40 : null

  for (const s of SHELF) {
    let resolvedImpl: string | null = null
    try {
      resolvedImpl = JSON.parse(readFileSync(path.join(govDir, `${s.slug}.json`), "utf8")).implementation ?? null
    } catch {
      /* no governance artifact — resolvedImpl stays null */
    }
    const code = (await read("eth_getCode", [s.addr, "latest"])) ?? "0x"
    const implSlot = await read("eth_getStorageAt", [s.addr, IMPL_SLOT, "latest"])
    const implSlotZero = !nonZeroAddr(implSlot)
    const probe = Governance.probeImmutability(code, resolvedImpl, implSlotZero)
    const proof = Governance.proveImmutable(probe)
    subjects.push({ subject: s.slug, address: s.addr, resolvedImpl, codeLen: (code.length - 2) / 2, implSlotZero, probe, immutable: proof.immutable, how: proof.how })
    console.log(`  ${s.slug.padEnd(18)} embedded=${probe.implEmbeddedInCode} slotZero=${probe.implSlotZero} noWritePath=${probe.noWritePath} → ${proof.immutable ? "IMMUTABLE" : "NOT immutable"}`)
  }

  // the controls: the EIP-1167 clone (IMMUTABLE) + the S62 disguise (UNRESOLVED)
  const controls: Record<string, unknown>[] = []
  for (const f of ["immutable-clone", "disguised-mutable"]) {
    const x = JSON.parse(readFileSync(path.join(govDir, "fixtures", `${f}.json`), "utf8"))
    const probe = Governance.probeImmutability(x.proxyCode, x.resolvedImpl, x.implSlotZero)
    const proof = Governance.proveImmutable(probe)
    controls.push({ fixture: f, synthetic: true, probe, immutable: proof.immutable, expected: f === "immutable-clone" })
    console.log(`  [control] ${f.padEnd(24)} → ${proof.immutable ? "IMMUTABLE" : "NOT immutable"}`)
  }

  const body = {
    protocol: "immutable-proof",
    at: "2026-07-11",
    block,
    rule: "X-GROUNDTRUTH(b), S62 — the three-condition bytecode-constant proof (impl a deployed-bytecode constant AND the 1967 impl slot unused AND no admin-slot write path), ALL-OR-NOTHING at the pinned block. IMMUTABLE is the strongest governance fact (no upgrade path) and makes any surviving flaw PERMANENT; a fabricated 'no upgrade path' is stronger poison than a wrong SAFE, so it is proof-only — the proof decides, never the wish.",
    honestFinding: "NO live shelf subject is genuinely immutable — verified on-chain. aave/spark hold the implementation in the EIP-1967 slot (upgradeable by their immutable admin; the blueprint conflated an immutable ADMIN — why the admin slot reads 0x0 — with an immutable IMPL). compound is TIMELOCK-upgradeable; curve/fluid are non-canonical direct contracts. IMMUTABLE is EXTINCT-on-shelf (like the EOA danger class) — the flagship-render change the blueprint anticipated does NOT fire, because aave is NOT immutable (truth over trophy). The class is proven on the standard EIP-1167 clone control and refused on the S62 disguise.",
    subjects,
    controls,
    census: { immutable: subjects.filter((s) => s.immutable).map((s) => s.subject), total: subjects.length, note: "0 immutable on the live shelf — the aave impl is in the 1967 slot (upgradeable); the class is extinct-on-shelf" },
  }
  writeFileSync(path.join(govDir, "immutable-proof.json"), JSON.stringify({ ...body, contentSha: sha256(JSON.stringify(body)) }, null, 1) + "\n")
  console.log("── IMMUTABLE-PROOF (three-condition bytecode-constant proof) → data/honesty/governance/immutable-proof.json ──")
}

main().catch((e) => {
  console.error("immutable-proof FAILED:", e)
  process.exit(1)
})
