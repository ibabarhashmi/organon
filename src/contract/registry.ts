/**
 * ORGΛNON — the CONTRACT-ANALYSIS REGISTRY (Contract-Truth Phase 3, X-CONTRACT e). The capture-time record of analyzed
 * protocol builds, content-hashed + REAL/SAMPLE-labeled. The RENDER reads recorded facts from here — this module imports
 * ONLY the pure sub-axis rule + types (never `./analyze`), so resolving a sub-axis triggers ZERO compilation (off the hot
 * loop). The current shelf ships an EMPTY registry (no protocol Foundry build supplied) → every pool resolves UNVERIFIED,
 * honestly (the coarse screen scores alone), never a fabricated all-clear.
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../organon/frozen"
import { contractSubAxis, type ContractSubAxis } from "./subaxis"
import type { StructuralFacts } from "./facts"

export interface ContractCapture {
  poolKey: string
  facts: StructuralFacts
  provenance: "REAL" | "SAMPLE" // REAL only when the operator supplied the VERIFIED deployed source
  capturedAt: number
  contentSha: string
  // ── provenance (Build-Provenance D10) — surfaced for the handoff; the resolver ignores these (reads facts+provenance+contentSha) ──
  chainId?: number | null
  address?: string | null // the deployed contract address the verified source ties to
  source?: string // the ingestion provenance ("sourcify:exact:1:0x…")
  sourceHash?: string | null // the verified-source identity (byte-sensitive)
  ruleset?: string // the stamped tool-set version
}
export type ContractRegistry = Record<string, ContractCapture>

const REGISTRY_REL = "data/honesty/contract-registry.json"
let _cache: ContractRegistry | undefined

/** load the committed registry (clone-robust: an absent file → an empty registry). Memoized — read once, not per render. */
export function loadRegistry(): ContractRegistry {
  if (_cache) return _cache
  const abs = path.join(PKG_ROOT, REGISTRY_REL)
  try {
    _cache = existsSync(abs) ? ((JSON.parse(readFileSync(abs, "utf8")).captures ?? {}) as ContractRegistry) : {}
  } catch {
    _cache = {}
  }
  return _cache
}

/** test seam — reset the memoized registry (so a test can inject a fixture map without file I/O). */
export function _resetRegistryCache() {
  _cache = undefined
}

/** resolve a pool's contract sub-axis from recorded facts (or ABSENT → UNVERIFIED). No compilation — reads the record. */
export function resolveContractSubAxis(poolKey: string, registry: ContractRegistry = loadRegistry()): ContractSubAxis {
  const cap = registry[poolKey]
  return contractSubAxis(cap ? { facts: cap.facts, provenance: cap.provenance, contentSha: cap.contentSha } : null)
}

/** the honest REAL-coverage: which pools carry a REAL verified-build tier (Build-Provenance V3, X-COVER). */
export function contractCoverage(registry: ContractRegistry = loadRegistry()): { realPoolKeys: string[]; realCount: number } {
  const realPoolKeys = Object.values(registry).filter((c) => c.provenance === "REAL").map((c) => c.poolKey)
  return { realPoolKeys, realCount: realPoolKeys.length }
}
