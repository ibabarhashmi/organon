/**
 * ORGΛNON — THE PRECISION SPRINT (X-PRECISION b,c). The PURE governance logic: the conservative admin classifier, the
 * canonical-collapse WHITELIST, and the one-line governance grammar. NO network, NO deps (the capture-time reads live in
 * script/capture/governance.ts, over the tool's own free RPC rotation); this module is consumed by the render layer
 * (reality.ts) and the walls. It imports NO scored module and appears in NO verdict-path module — the governance fact is
 * info/context (its promotion is D29, parked). A wrong "multisig" is a fabricated reassurance (the worst failure
 * available): the classifier is CONSERVATIVE BY LAW — ambiguity is UNRESOLVED, a ZERO admin slot is UNRESOLVED (NEVER
 * EOA), and only a bare externally-owned key (direct or one owner-hop out) is EOA.
 */
export namespace Governance {
  // GroundTruth (X-GROUNDTRUTH b) adds the fifth class IMMUTABLE — granted ONLY on the three-condition bytecode-constant
  // proof (proveImmutable). It is the strongest governance fact (no one can swap the logic) — and it makes any surviving
  // business flaw PERMANENT. A fabricated "no upgrade path" is stronger poison than a wrong SAFE, so it is proof-only.
  export type AdminClass = "EOA" | "SAFE" | "TIMELOCK" | "UNRESOLVED" | "IMMUTABLE"
  // ONLY these two fold the canonical noise on the GATED path — the "standard, gated proxy" reassurance the collapse
  // encodes is TRUE only when the key-holder resolved to a multisig/timelock. EOA and UNRESOLVED never fold.
  export const GATED: readonly AdminClass[] = ["SAFE", "TIMELOCK"] as const
  export const isGated = (cls: AdminClass): boolean => GATED.includes(cls)
  // the canonical proxy-machinery folds when the admin is GATED (a standard, gated proxy) OR the impl is provably IMMUTABLE
  // (the machinery is inert BY PROOF — upgrade-path findings on a provably-unupgradeable contract are moot). A SEPARATE
  // fold path; business-logic findings SURVIVE under BOTH (a reentrancy in an immutable impl is MORE permanent, not less real).
  export const foldsMachinery = (cls: AdminClass): boolean => isGated(cls) || cls === "IMMUTABLE"

  // ── THE THREE-CONDITION BYTECODE-CONSTANT IMMUTABLE PROOF (X-GROUNDTRUTH b, S62) — ALL-OR-NOTHING at the pinned block ──
  export interface ImmutableProbe {
    implEmbeddedInCode: boolean // (1) the resolved implementation address is a CONSTANT embedded in the proxy's deployed bytecode
    implSlotZero: boolean // (2) the EIP-1967 implementation slot is zero/unused (the impl is NOT read from a mutable slot)
    noWritePath: boolean // (3) no admin-slot write path exists in the proxy bytecode (no SSTORE targeting the 1967 slots)
  }
  export interface ImmutableProof {
    immutable: boolean
    conditions: ImmutableProbe
    how: string
  }
  // ALL THREE hold → IMMUTABLE; ANY one unproven → NOT immutable (UNRESOLVED stands). The proof decides, never the wish
  // (the seeded DISGUISED-MUTABLE control — an embedded-looking constant PLUS a live write path — MUST classify UNRESOLVED).
  export function proveImmutable(p: ImmutableProbe): ImmutableProof {
    const immutable = p.implEmbeddedInCode && p.implSlotZero && p.noWritePath
    const fails = [
      !p.implEmbeddedInCode && "the implementation is not a bytecode constant",
      !p.implSlotZero && "the EIP-1967 impl slot is in use (the implementation is read from a mutable slot — upgradeable)",
      !p.noWritePath && "an admin-slot write path exists in the proxy bytecode",
    ].filter(Boolean)
    return {
      immutable,
      conditions: p,
      how: immutable
        ? "no upgrade path exists — the implementation is a bytecode constant, the EIP-1967 slot is unused, and no admin-slot write path exists (all three proven at the pinned block)"
        : `NOT provably immutable — ${fails.join("; ")} → UNRESOLVED (the proof decides, never the wish)`,
    }
  }
  // the combined classifier: IMMUTABLE (on the three-condition proof) SUPERSEDES the admin class (if the logic cannot be
  // swapped, who holds the — now inert — admin key is moot); otherwise the conservative admin classifier decides.
  export function classify(imm: ImmutableProbe, admin: AdminProbe): { adminClass: AdminClass; how: string; immutable: ImmutableProof } {
    const proof = proveImmutable(imm)
    if (proof.immutable) return { adminClass: "IMMUTABLE", how: proof.how, immutable: proof }
    const c = classifyAdmin(admin)
    return { adminClass: c.adminClass, how: c.how, immutable: proof }
  }

  // the EIP-1967 slot constants (without 0x) — a provably-immutable proxy references NEITHER (it embeds its impl and never
  // touches the mutable governance slots). Kept here (data, not logic) so the bytecode probe stays pure + testable.
  const SLOT_IMPL_1967 = "360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
  const SLOT_ADMIN_1967 = "b53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
  // an OPCODE-AWARE SSTORE scan (skip PUSH1..32 immediates so a 0x55 DATA byte is never mistaken for the SSTORE opcode).
  const hasSstoreOpcode = (codeHex: string): boolean => {
    for (let i = 0; i + 2 <= codeHex.length; ) {
      const op = parseInt(codeHex.slice(i, i + 2), 16)
      i += 2
      if (op >= 0x60 && op <= 0x7f) i += (op - 0x5f) * 2 // PUSH1..PUSH32: skip the immediate bytes
      else if (op === 0x55) return true // SSTORE
    }
    return false
  }
  // compute the three-condition probe from a proxy's DEPLOYED bytecode (pure — the capture reads the bytes, this decides):
  //   (1) implEmbeddedInCode — the resolved impl address (20 bytes) appears as a constant in the bytecode
  //   (2) implSlotZero — the caller passes whether the 1967 impl slot read zero/unused
  //   (3) noWritePath — the bytecode does NOT (reference a 1967 slot constant AND contain an SSTORE opcode); a genuine
  //       immutable proxy references neither governance slot. CONSERVATIVE: an unprovable no-write-path fails (UNRESOLVED).
  export function probeImmutability(proxyCodeHex: string, resolvedImpl: string | null, implSlotZero: boolean): ImmutableProbe {
    const code = (proxyCodeHex ?? "").replace(/^0x/i, "").toLowerCase()
    const impl = (resolvedImpl ?? "").replace(/^0x/i, "").toLowerCase()
    const implEmbeddedInCode = impl.length === 40 && code.includes(impl)
    const references1967 = code.includes(SLOT_IMPL_1967) || code.includes(SLOT_ADMIN_1967)
    const noWritePath = !(references1967 && hasSstoreOpcode(code))
    return { implEmbeddedInCode, implSlotZero, noWritePath }
  }

  // the raw probe results a capture (or a fixture) hands the classifier — one pinned block per subject.
  export interface AdminProbe {
    adminAddr: string | null // last-20-bytes of the admin slot, or null when the slot is ZERO/empty
    adminCodePresent: boolean // eth_getCode(adminAddr) non-empty (a contract) vs empty (an EOA)
    isSafe: boolean // getThreshold() + getOwners() both responded (a Gnosis-Safe pattern)
    isTimelock: boolean // getMinDelay()/delay() responded (a timelock pattern)
    ownerAddr: string | null // owner() one-hop (a ProxyAdmin's owner), or null
    ownerCodePresent: boolean // eth_getCode(ownerAddr) non-empty
    ownerIsSafe: boolean
    ownerIsTimelock: boolean
  }

  export interface Classified {
    adminClass: AdminClass
    how: string
  }

  // THE CONSERVATIVE CLASSIFIER (X-PRECISION b). Order matters: a ZERO slot is UNRESOLVED (never EOA — the aave/spark
  // immutable-admin datum, verified on-chain; a slot=0 → EOA read fabricates an alarm on a blue-chip). A bare EOA (direct
  // or via a ProxyAdmin owned one hop out by an externally-owned key) is the damning EOA. Any residual ambiguity is
  // UNRESOLVED-CONTRACT (treat with EOA-grade caution). Never SAFE/TIMELOCK on a guess.
  export function classifyAdmin(p: AdminProbe): Classified {
    if (!p.adminAddr) return { adminClass: "UNRESOLVED", how: "the standard EIP-1967 admin slot is empty (an off-slot/immutable admin, or not a 1967 proxy) — UNRESOLVED, never EOA (conservative)" }
    if (!p.adminCodePresent) return { adminClass: "EOA", how: "the admin is an externally-owned account — a single key can replace this contract's logic" }
    if (p.isSafe) return { adminClass: "SAFE", how: "the admin is a Gnosis-Safe-pattern contract (getThreshold + getOwners responded)" }
    if (p.isTimelock) return { adminClass: "TIMELOCK", how: "the admin is a timelock-pattern contract (getMinDelay/delay responded)" }
    if (p.ownerAddr) {
      if (p.ownerIsTimelock) return { adminClass: "TIMELOCK", how: `the admin is a contract whose owner (${short(p.ownerAddr)}) is a timelock — gated via owner` }
      if (p.ownerIsSafe) return { adminClass: "SAFE", how: `the admin is a contract whose owner (${short(p.ownerAddr)}) is a Gnosis Safe — gated via owner` }
      if (!p.ownerCodePresent) return { adminClass: "EOA", how: `the admin is a contract owned by an externally-owned account (${short(p.ownerAddr)}) — a single key controls the upgrade admin, the damning case one hop out` }
    }
    return { adminClass: "UNRESOLVED", how: "the admin is a contract we could not classify as multisig/timelock — UNRESOLVED, treat with EOA-grade caution (never labeled Safe on a guess)" }
  }

  // THE CANONICAL FINGERPRINT WHITELIST (X-PRECISION c) — the proxy-shell + OZ-upgradeable-library plumbing a correctly-
  // formed canonical proxy is EXPECTED to carry. A finding matching one of these folds ONLY when the pattern is canonical
  // AND the admin resolved gated; anything NOT matching (a non-canonical delegatecall, a reentrancy window, an oracle read,
  // an anomalous initializer) STAYS ITEMIZED regardless — the collapse is a whitelist, not a compressor.
  export const CANONICAL_FINGERPRINTS: readonly RegExp[] = [
    /looks like an upgrade entrypoint without an auth signal/i,
    /delegatecall \(into attacker-controlled code if the target is mutable\)/i,
    /fallback delegatecall present/i,
    /upgradeable contract without a storage gap/i,
    /does not self-lock the implementation via constructor\/_disableInitializers/i,
    /is initializer-like without an initializer\/onlyInitializing signal/i,
    /initializer routines are internal-only/i,
  ] as const

  // THE PINNED CANONICAL OZ PROXY/LIBRARY CONTRACTS — the exact contract names an OpenZeppelin (or aave/OZ-derived) proxy
  // source is BUILT from. A finding whose `contract` is one of these is canonical proxy-shell / bundled-library plumbing
  // (the wrapper's structure, which the governance line summarizes) — NOT business logic. A finding on a business contract
  // (Comet, Pool, Vault, aToken, …) is NOT in this set and SURVIVES. Enumerated (a whitelist), never a wildcard.
  export const CANONICAL_OZ_CONTRACTS: ReadonlySet<string> = new Set([
    "Proxy", "ERC1967Proxy", "ERC1967Upgrade", "TransparentUpgradeableProxy", "BeaconProxy", "UpgradeableBeacon", "ProxyAdmin",
    "UUPSUpgradeable", "BaseUpgradeabilityProxy", "BaseAdminUpgradeabilityProxy", "BaseImmutableAdminUpgradeabilityProxy",
    "InitializableUpgradeabilityProxy", "InitializableAdminUpgradeabilityProxy", "InitializableImmutableAdminUpgradeabilityProxy",
    "AdminUpgradeabilityProxy", "Address", "StorageSlot", "Context", "Initializable",
  ])

  export interface Finding {
    detail: string
    category?: string
    contract?: string
    line?: number
  }

  // a finding is canonical proxy-shell plumbing if its detail matches a pinned canonical phrase OR its contract is a pinned
  // canonical OZ proxy/library contract (the wrapper's structure, summarized by the governance line — never business logic).
  export const isCanonicalFingerprint = (f: Finding | string): boolean => {
    const detail = typeof f === "string" ? f : f.detail
    if (CANONICAL_FINGERPRINTS.some((re) => re.test(detail))) return true
    return typeof f !== "string" && !!f.contract && CANONICAL_OZ_CONTRACTS.has(f.contract)
  }
  export interface Collapse<T extends Finding> {
    folded: T[]
    survivors: T[]
    foldedCount: number
    collapsed: boolean // did the noise collapse (canonicalMatch AND adminGated)?
  }

  // THE COLLAPSE (X-PRECISION c). fold(finding) = canonicalMatch AND adminGated(SAFE|TIMELOCK) AND canonical-fingerprint.
  // When the pattern is NOT canonical OR the admin is NOT gated (EOA/UNRESOLVED), NOTHING folds — every finding survives
  // (the fold's "this is a standard, gated proxy" reassurance is absent or false). S58's seed (ungated upgrade + EOA)
  // survives here BECAUSE adminGated is false.
  export function collapse<T extends Finding>(findings: T[], canonicalMatch: boolean, adminClass: AdminClass): Collapse<T> {
    // the machinery folds when the admin is GATED (a standard, gated proxy) OR the impl is provably IMMUTABLE (inert by proof)
    if (!canonicalMatch || !foldsMachinery(adminClass)) return { folded: [], survivors: [...findings], foldedCount: 0, collapsed: false }
    const folded: T[] = []
    const survivors: T[] = []
    for (const f of findings) (isCanonicalFingerprint(f) ? folded : survivors).push(f)
    return { folded, survivors, foldedCount: folded.length, collapsed: true }
  }

  // the resolved facts a governance artifact carries (written by the capture, or a fixture).
  export interface Artifact {
    subject: string
    block: string
    implementation: string | null
    pattern: string // "EIP-1967 transparent" | "UUPS/EIP-1967" | "beacon" | "EIP-1167 clone" | "EIP-2535 diamond" | "non-canonical" | "not-a-proxy"
    canonicalMatch: boolean
    adminSlotValue: string
    adminAddr: string | null
    adminClass: AdminClass
    how: string
    probes: Partial<AdminProbe>
    crossCheck?: { etherscan?: string; blockscout?: string; agrees?: boolean | null; note?: string }
    immutable?: ImmutableProof // GroundTruth — the three-condition proof record (present when the subject was checked for IMMUTABLE)
    contentSha: string
    provenance?: string
    synthetic?: boolean
  }

  const short = (a: string): string => (a && a.length > 12 ? `${a.slice(0, 10)}…${a.slice(-4)}` : a)

  // THE ONE-LINE GOVERNANCE GRAMMAR (X-PRECISION, the three pinned forms). info/context THIS sprint (D29 parked).
  export function governanceLine(a: Artifact): string {
    const pat = a.pattern && a.pattern !== "not-a-proxy" ? a.pattern : "proxy"
    const addr = a.adminAddr ? short(a.adminAddr) : "not in the standard EIP-1967 slot"
    // IMMUTABLE (X-GROUNDTRUTH b) — the strongest form: no upgrade path exists, proven at the pinned block. It answers the
    // upgrade-path question ONLY — a provably-unupgradeable contract can still be buggy, and its bugs are PERMANENT.
    if (a.adminClass === "IMMUTABLE") return `Immutable implementation — no upgrade path exists; the proxy machinery is inert. (Proven at block ${a.block}: the implementation is a bytecode constant.)`
    if (a.adminClass === "EOA") return `Upgradeable proxy (${pat}). Admin: ${addr} — EOA. A single key can replace this contract's logic.`
    if (isGated(a.adminClass)) return `Upgradeable proxy (${pat}). Admin: ${addr} — ${a.adminClass}. Upgrade path gated; verify the signers.`
    return `Upgradeable proxy (${pat}). Admin: ${addr} — unresolved; treat with EOA-grade caution.`
  }

  // a coarse "governance strength" ordering for the discrimination wall (S60) — NOT a verdict, a render-signal ordering.
  // IMMUTABLE sits at the strong end (no upgrade path) — reported as its OWN reassurance form, not force-ranked without D30.
  export function governanceRank(cls: AdminClass): number {
    return cls === "EOA" ? 0 : cls === "UNRESOLVED" ? 1 : cls === "SAFE" ? 2 : cls === "TIMELOCK" ? 3 : 4 /* IMMUTABLE */
  }

  // ── the RENDER bundle — the resolved governance artifact + the re-pointed implementation findings (if the impl was
  // Sourcify-verified + analyzed). The render (reality.ts) consumes this; it is loaded OUT of the render (by the route or
  // a wall) so the render stays param-driven — a call site that passes nothing (the S36 golden's synthetic poolKey) gets
  // no governance line, and the content golden stays byte-identical.
  export interface ImplFindings {
    subject: string
    implementation: string | null
    provenance: string // REAL | SAMPLE | UNVERIFIED
    verified: boolean
    contracts?: string[]
    findings: Finding[]
    contentSha: string
    note?: string
  }
  export interface RenderBundle {
    artifact: Artifact
    line: string
    impl: ImplFindings | null // the re-pointed implementation findings, or null (fall back to the legacy proxy findings)
  }

  // load helpers (file I/O, used by the route + the walls — NEVER on the verdict path). Injectable roots for hermetic tests.
  export function load(poolKey: string, opts?: { readFile: (p: string) => string; readdir: (d: string) => string[]; dir: string }): Artifact | null {
    if (!opts) return null
    let names: string[]
    try {
      names = opts.readdir(opts.dir)
    } catch {
      return null
    }
    for (const f of names) {
      if (!f.endsWith(".json") || f === "census.json") continue
      let a: Artifact & { poolKeys?: string[] }
      try {
        a = JSON.parse(opts.readFile(`${opts.dir}/${f}`))
      } catch {
        continue
      }
      if (a.poolKeys && a.poolKeys.includes(poolKey)) return a
    }
    return null
  }

  // prefer the GroundTruth bytecode-MATCHED artifact (impl-build/ — admitted to the screen only on a compiled-vs-deployed
  // match, S61) and fall back to the legacy Sourcify-only artifact (impl/). A subject whose build did NOT match carries
  // verified=false there → the render falls back to the proxy-shell screen (the impl source is never guessed).
  export function loadImpl(subject: string, opts?: { readFile: (p: string) => string; dir: string }): ImplFindings | null {
    if (!opts) return null
    for (const sub of ["impl-build", "impl"]) {
      try {
        return JSON.parse(opts.readFile(`${opts.dir}/${sub}/${subject}.json`)) as ImplFindings
      } catch {
        /* try the next source */
      }
    }
    return null
  }

  // assemble the render bundle from an artifact + (optional) impl findings — the render's single input.
  export function renderBundle(artifact: Artifact, impl: ImplFindings | null): RenderBundle {
    return { artifact, line: governanceLine(artifact), impl }
  }
}
