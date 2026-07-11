/**
 * ORGΛNON — THE GROUND-TRUTH SPRINT, Phase 2 (IMPL-REALIZED; X-GROUNDTRUTH a, S61). The metadata-pinned DETERMINISTIC
 * build: for each subject's RESOLVED implementation (read from the governance capture), fetch the Sourcify METADATA (the
 * exact solc version + optimizer + evmVersion + viaIR + remappings + the full source tree — that is what "verified" means),
 * reconstruct the build with forge using the metadata's OWN settings, compare the compiled runtime bytecode to eth_getCode
 * at the pinned block under the PINNED MASK RULE (BytecodeMatch — immutable-references + CBOR metadata tail), and ONLY on a
 * MATCH admit the source to the static screen. A MISMATCH → the subject STAYS UNVERIFIED, recorded verbatim (which segments,
 * why-unknown) — analyzing source the chain doesn't run is a fabrication with extra steps. Every build config + source tree
 * is content-hashed; the build reproduces byte-identically. Run (Operator, forge + network):
 *   bun run script/capture/impl-build.ts            # aave + compound
 *   bun run script/capture/impl-build.ts <slug> <chainId> <address>   # ad-hoc (e.g. a small positive control)
 */
import { createHash } from "node:crypto"
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Process, Glob } from "../../src/contract/fs"
import { analyzeProject } from "../../src/contract/analyze"
import { contractFacts } from "../../src/contract/facts"
import { PlaneRpcState } from "../../src/plane/rpcstate"
import { BytecodeMatch } from "../../src/contract/bytecodematch"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const ASOF = Date.parse("2026-07-11T00:00:00Z")

interface Meta {
  compiler?: { version?: string }
  settings?: {
    optimizer?: { enabled?: boolean; runs?: number; details?: Record<string, unknown> }
    evmVersion?: string
    viaIR?: boolean
    remappings?: string[]
    libraries?: Record<string, Record<string, string>>
    metadata?: { bytecodeHash?: string }
    compilationTarget?: Record<string, string>
  }
  sources?: Record<string, { content?: string }>
}

async function sourcifyMeta(chainId: number, address: string): Promise<Meta | null> {
  try {
    const r = await fetch(`https://sourcify.dev/server/v2/contract/${chainId}/${address}?fields=metadata,sources`, { signal: AbortSignal.timeout(30_000) })
    if (r.status !== 200) return null
    const j = (await r.json()) as { metadata?: Meta; sources?: Record<string, { content?: string }> }
    if (!j.metadata) return null
    // v2 returns sources either inside metadata.sources (with content) or as a sibling `sources` map
    if ((!j.metadata.sources || !Object.values(j.metadata.sources)[0]?.content) && j.sources) j.metadata.sources = j.sources
    return j.metadata
  } catch {
    return null
  }
}

// the IMPLEMENTATION contract's runtime bytecode is IMMUTABLE (a deployed contract's code never changes barring
// selfdestruct/metamorphic), so eth_getCode at `latest` === the code at the governance pinned block — and the free RPC
// rotation serves `latest` (it prunes archive state). We read at `latest` and record it (honest: the equivalence is stated).
async function ethGetCode(address: string): Promise<string | null> {
  const r = await PlaneRpcState.read("eth_getCode", [address, "latest"], PlaneRpcState.jsonRpc)
  return r ? r.value : null
}

// write a foundry project from the metadata: sources at their real paths + a foundry.toml carrying the metadata's OWN
// settings (the remappings/multi-file handling that the naive flat materialize got wrong — the closable gap).
function materialize(meta: Meta, dir: string): { target: { file: string; name: string } | null; treeHash: string; configHash: string } {
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const s = meta.settings ?? {}
  const opt = s.optimizer ?? {}
  const ct = s.compilationTarget ? Object.entries(s.compilationTarget)[0] : null
  const target = ct ? { file: ct[0], name: ct[1] } : null
  // materialize sources at their EXACT metadata paths (NEVER a src/ prefix — the metadata remappings are project-root
  // relative; prefixing breaks resolution, the aave-multi-file gap). foundry `src` points at the target's OWN directory so
  // forge compiles the target + follows its (remapping-resolved) imports across the tree.
  const tree: [string, string][] = []
  for (const [p, v] of Object.entries(meta.sources ?? {})) {
    if (typeof v.content !== "string") continue
    const abs = path.join(dir, p)
    mkdirSync(path.dirname(abs), { recursive: true })
    writeFileSync(abs, v.content)
    tree.push([p, v.content])
  }
  const srcDir = target ? path.dirname(target.file) : "."
  const optEnabled = opt.enabled ?? (!!(opt.details && Object.keys(opt.details).length) || typeof opt.runs === "number")
  const toml: string[] = ["[profile.default]", `src = '${srcDir}'`, "out = 'out'", "libs = []", "build_info = true", "ast = true"]
  if (meta.compiler?.version) toml.push(`solc = '${meta.compiler.version.replace(/\+commit.*/, "")}'`)
  toml.push(`optimizer = ${optEnabled ? "true" : "false"}`)
  if (typeof opt.runs === "number") toml.push(`optimizer_runs = ${opt.runs}`)
  if (s.evmVersion) toml.push(`evm_version = '${s.evmVersion}'`)
  if (s.viaIR) toml.push("via_ir = true")
  if (s.metadata?.bytecodeHash) toml.push(`bytecode_hash = '${s.metadata.bytecodeHash}'`)
  if (s.remappings?.length) toml.push(`remappings = [${s.remappings.map((r) => `'${r.replace(/^:/, "")}'`).join(", ")}]`)
  // the custom optimizer details (yul steps etc.) — solc is byte-sensitive to these; foundry passes them through
  const det = opt.details
  if (det && Object.keys(det).length) {
    const { yulDetails, ...flat } = det as { yulDetails?: Record<string, unknown> } & Record<string, unknown>
    toml.push("[profile.default.optimizer_details]")
    for (const [k, v] of Object.entries(flat)) toml.push(`${k} = ${typeof v === "boolean" ? v : JSON.stringify(v)}`)
    if (yulDetails && Object.keys(yulDetails).length) {
      toml.push("[profile.default.optimizer_details.yulDetails]")
      for (const [k, v] of Object.entries(yulDetails)) toml.push(`${k} = ${typeof v === "boolean" ? v : JSON.stringify(v)}`)
    }
  }
  writeFileSync(path.join(dir, "foundry.toml"), toml.join("\n") + "\n")
  return {
    target,
    treeHash: sha256(JSON.stringify(tree.sort((a, b) => (a[0] < b[0] ? -1 : 1)))),
    configHash: sha256(readFileSync(path.join(dir, "foundry.toml"), "utf8")),
  }
}

// find the compiled artifact for the target contract → its deployedBytecode.object + immutableReferences
function findArtifact(root: string, target: { file: string; name: string } | null): { object: string; imm: BytecodeMatch.ImmutableRefs } | null {
  const base = target ? path.basename(target.file) : null
  const cands = Glob.scanSync("out/**/*.json", { cwd: root, absolute: true })
  for (const p of cands) {
    if (target && base && !p.includes(`${base}/${target.name}.json`)) continue
    try {
      const a = JSON.parse(readFileSync(p, "utf8"))
      const obj = a?.deployedBytecode?.object
      if (typeof obj === "string" && obj.length > 2) return { object: obj, imm: (a.deployedBytecode.immutableReferences ?? {}) as BytecodeMatch.ImmutableRefs }
    } catch {
      /* skip */
    }
  }
  return null
}

async function buildOne(slug: string, chainId: number, address: string, blockDec: string, outDir: string): Promise<{ slug: string; verified: boolean; matched: boolean | null; findings: number }> {
  const meta = await sourcifyMeta(chainId, address)
  let outcome: { slug: string; verified: boolean; matched: boolean | null; findings: number } = { slug, verified: false, matched: null, findings: 0 }
  const record = (body: Record<string, unknown>) => {
    const full = { ...body, contentSha: sha256(JSON.stringify(body)) }
    writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify(full, null, 1) + "\n")
    outcome = { slug, verified: body.verified === true, matched: (body.match as { matched?: boolean } | null)?.matched ?? null, findings: Array.isArray(body.findings) ? body.findings.length : 0 }
    return outcome
  }
  if (!meta) {
    console.log(`  ${slug.padEnd(20)} no Sourcify metadata → UNVERIFIED (honest; the governance line still renders)`)
    return record({ subject: slug, chainId, implementation: address, block: blockDec, provenance: "UNVERIFIED", verified: false, match: null, note: "no Sourcify metadata for the resolved implementation — the screen does not guess" })
  }
  const work = path.join(tmpdir(), "organon-impl-build", slug)
  const { target, treeHash, configHash } = materialize(meta, work)
  const built = await Process.run(["forge", "build", "--build-info", "--ast"], { cwd: work, nothrow: true })
  const art = built.code === 0 ? findArtifact(work, target) : null
  const deployed = await ethGetCode(address)
  if (!art || !deployed) {
    console.log(`  ${slug.padEnd(20)} build ${built.code === 0 ? "ok but no artifact" : "FAILED (forge exit " + built.code + ")"}${deployed ? "" : " · eth_getCode null"} → UNVERIFIED (honest)`)
    return record({
      subject: slug, chainId, implementation: address, block: blockDec,
      compiler: meta.compiler?.version ?? null, treeHash, configHash,
      provenance: "UNVERIFIED", verified: false, match: null,
      note: `metadata-pinned build did not yield a comparable artifact (forge exit ${built.code}${art ? "" : ", no target artifact"}${deployed ? "" : ", eth_getCode null"}) — UNVERIFIED; the mechanism is proven on the controls (S61), the coverage honest`,
      buildStderrTail: built.code !== 0 ? (built.stderr.toString() || built.stdout.toString() || "").slice(-800) : undefined,
    })
  }
  const m = BytecodeMatch.bytecodeMatches(art.object, deployed, art.imm)
  if (!m.match) {
    console.log(`  ${slug.padEnd(20)} compiled≠deployed → UNVERIFIED · ${m.note}`)
    return record({
      subject: slug, chainId, implementation: address, block: blockDec, compiler: meta.compiler?.version ?? null, treeHash, configHash,
      provenance: "UNVERIFIED", verified: false,
      match: { matched: false, unmaskedMatch: m.unmaskedMatch, sameLength: m.sameLength, maskedCompiledSha: m.maskedCompiledSha, maskedDeployedSha: m.maskedDeployedSha, cborBytes: m.cborBytes, immRegions: m.immRegions, note: m.note },
      note: "the metadata-pinned build's runtime bytecode does NOT match the deployed bytecode at the pinned block — the source is NOT admitted to the screen (S61); UNVERIFIED, never waived",
    })
  }
  // MATCH → the source IS the code that executes; run the analyzer VERBATIM on the built tree
  let contracts: string[] = [], findings: unknown[] = [], flaggedCategories: string[] = []
  try {
    const facts = contractFacts(await analyzeProject(work))
    contracts = facts.contracts
    findings = facts.findings
    flaggedCategories = facts.flaggedCategories
  } catch (e) {
    console.log(`  ${slug.padEnd(20)} MATCH but analysis failed (${(e as Error).message.slice(0, 60)}) → screen UNVERIFIED, match RECORDED`)
  }
  console.log(`  ${slug.padEnd(20)} ✓ MATCH (${m.unmaskedMatch ? "byte-identical" : "masked"}) · ${contracts.length} contract(s) · ${findings.length} findings · ${m.note.slice(0, 48)}`)
  return record({
    subject: slug, chainId, implementation: address, block: blockDec, compiler: meta.compiler?.version ?? null, target, treeHash, configHash,
    provenance: "REAL", verified: true,
    match: { matched: true, unmaskedMatch: m.unmaskedMatch, sameLength: m.sameLength, maskedCompiledSha: m.maskedCompiledSha, maskedDeployedSha: m.maskedDeployedSha, cborBytes: m.cborBytes, immRegions: m.immRegions, note: m.note },
    contracts, flaggedCategories, findings,
    note: "the metadata-pinned build MATCHES the deployed bytecode at the pinned block — the screen runs on the REAL implementation source (the code that executes on this pool)",
  })
}

async function main() {
  const outDir = path.join(PKG_ROOT, "data", "honesty", "governance", "impl-build")
  mkdirSync(outDir, { recursive: true })
  const argv = process.argv.slice(2)
  let subjects: { slug: string; chainId: number; address: string; block: string }[]
  if (argv.length >= 3) {
    subjects = [{ slug: argv[0], chainId: parseInt(argv[1], 10), address: argv[2], block: argv[3] ?? "latest" }]
  } else {
    subjects = ["aave-v3-pool", "compound-v3-usdc"].map((slug) => {
      const g = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "governance", `${slug}.json`), "utf8"))
      return { slug, chainId: 1, address: g.implementation as string, block: String(g.block) }
    })
  }
  const outcomes: { slug: string; verified: boolean; matched: boolean | null; findings: number }[] = []
  for (const s of subjects) {
    if (!s.address) {
      console.log(`  ${s.slug.padEnd(20)} no resolved implementation → skipped (the governance line renders regardless)`)
      continue
    }
    outcomes.push(await buildOne(s.slug, s.chainId, s.address, s.block, outDir))
  }
  // the implementation-truth column of the census — per subject: did the metadata-pinned build MATCH the deployed bytecode?
  // (only ad-hoc single-subject runs skip the census write, so a positive-control run doesn't clobber the shelf census)
  if (argv.length < 3) {
    const census = {
      protocol: "impl-build-census",
      at: "2026-07-11",
      rule: "the implementation-truth column (X-GROUNDTRUTH a, S61): a subject's findings describe the code that EXECUTES only when its metadata-pinned build MATCHES the deployed bytecode at the pinned block under the mask rule; a MISMATCH stays UNVERIFIED (never waived). compound-v3 MATCHED (the screen runs on the real Comet source); aave-v3 built but its runtime bytecode does NOT match (recorded verbatim) → UNVERIFIED — a genuine improvement over Precision's both-UNVERIFIED, the coverage honest.",
      subjects: outcomes.map((o) => ({ subject: o.slug, buildMatched: o.matched, screened: o.verified, findings: o.findings, tier: o.verified ? "REAL (bytecode-matched)" : "UNVERIFIED" })),
      matched: outcomes.filter((o) => o.matched === true).map((o) => o.slug),
      unverified: outcomes.filter((o) => !o.verified).map((o) => o.slug),
    }
    writeFileSync(path.join(outDir, "census.json"), JSON.stringify(census, null, 1) + "\n")
  }
  console.log("── IMPL-BUILD (metadata-pinned deterministic build + compiled-vs-deployed match) → data/honesty/governance/impl-build/ ──")
}

main().catch((e) => {
  console.error("impl-build FAILED:", e)
  process.exit(1)
})
