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
  export type AdminClass = "EOA" | "SAFE" | "TIMELOCK" | "UNRESOLVED"
  // ONLY these two fold the canonical noise — the "standard, gated proxy" reassurance the collapse encodes is TRUE only
  // when the key-holder resolved to a multisig/timelock. EOA and UNRESOLVED never fold (the damning/caution line renders).
  export const GATED: readonly AdminClass[] = ["SAFE", "TIMELOCK"] as const
  export const isGated = (cls: AdminClass): boolean => GATED.includes(cls)

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
  export const isCanonicalFingerprint = (detail: string): boolean => CANONICAL_FINGERPRINTS.some((re) => re.test(detail))

  export interface Finding {
    detail: string
    category?: string
    contract?: string
    line?: number
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
    const adminGated = isGated(adminClass)
    if (!canonicalMatch || !adminGated) return { folded: [], survivors: [...findings], foldedCount: 0, collapsed: false }
    const folded: T[] = []
    const survivors: T[] = []
    for (const f of findings) (isCanonicalFingerprint(f.detail) ? folded : survivors).push(f)
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
    contentSha: string
    provenance?: string
    synthetic?: boolean
  }

  const short = (a: string): string => (a && a.length > 12 ? `${a.slice(0, 10)}…${a.slice(-4)}` : a)

  // THE ONE-LINE GOVERNANCE GRAMMAR (X-PRECISION, the three pinned forms). info/context THIS sprint (D29 parked).
  export function governanceLine(a: Artifact): string {
    const pat = a.pattern && a.pattern !== "not-a-proxy" ? a.pattern : "proxy"
    const addr = a.adminAddr ? short(a.adminAddr) : "not in the standard EIP-1967 slot"
    if (a.adminClass === "EOA") return `Upgradeable proxy (${pat}). Admin: ${addr} — EOA. A single key can replace this contract's logic.`
    if (isGated(a.adminClass)) return `Upgradeable proxy (${pat}). Admin: ${addr} — ${a.adminClass}. Upgrade path gated; verify the signers.`
    return `Upgradeable proxy (${pat}). Admin: ${addr} — unresolved; treat with EOA-grade caution.`
  }

  // a coarse "governance strength" ordering for the discrimination wall (S60) — NOT a verdict, a render-signal ordering.
  export function governanceRank(cls: AdminClass): number {
    return cls === "EOA" ? 0 : cls === "UNRESOLVED" ? 1 : cls === "SAFE" ? 2 : 3 /* TIMELOCK */
  }
}
