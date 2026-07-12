/**
 * ORGΛNON — THE DEPTH CENSUS (Domain sprint; CV4). The Coverage headline — "15490 of 15497 covered" (99.95%) — is
 * rhetorically dangerous: "covered" means ONLY that the YIELD axis is renderable, NOT that a full Reality Check is
 * possible. This census states the honest thing per axis: how many pools the tool can say something COMPLETE about, not
 * merely SOMETHING about. It is an OUTCOME computed over COMMITTED, clone-reproducible artifacts (the coverage census, the
 * governance census, the contract registry, the shelf registry) — NO network, NO gitignored live capture, so it re-hashes
 * on a fresh clone. A target that licenses inflating an axis count is a cut (CV4). Run: bun run script/capture/depth-census.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { contractCoverage } from "../../src/contract/registry"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const H = path.join(PKG_ROOT, "data", "honesty")
const readJson = (p: string) => JSON.parse(readFileSync(p, "utf8"))

const coverage = readJson(path.join(H, "coverage-census.json")) as { universeSize: number; covered: number }
const gov = readJson(path.join(H, "governance", "census.json")) as { census: Record<string, number>; subjects: string[] }
const shelf = readJson(path.join(H, "shelf-registry.json")) as { pools: { poolKey: string; vertical?: string; isStablecoin?: boolean; gtKey?: string; kind?: string }[] }

const pools = shelf.pools
const applicable = pools.filter((p) => p.kind !== "delta-neutral") // the contract/tvl/peg axes apply to yield/lending, not delta-neutral
const stablecoinShelf = applicable.filter((p) => p.isStablecoin)
const dexBacked = applicable.filter((p) => p.gtKey) // liquidity-depth needs a DEX pool key
const govResolved = Object.values(gov.census).reduce((a, b) => a + b, 0)
const govGated = (gov.census.SAFE ?? 0) + (gov.census.TIMELOCK ?? 0) + (gov.census.IMMUTABLE ?? 0)
const contract = contractCoverage()

// per-axis coverage — the honest number. ONLY yield-reality reaches the universe; every deeper axis is a per-subject
// capture, available for the curated shelf (+ any looked-up subject), which is a far smaller, HONEST count.
const perAxis = {
  "yield-reality": {
    renderable: coverage.covered,
    denominator: coverage.universeSize,
    scope: "universe",
    tier: "REAL-at-timestamp",
    basis: "a REAL aggregator yield exists (DeFiLlama /pools) — this IS the breadth number; it means the YIELD axis renders, nothing more",
  },
  "tvl-trend": {
    renderable: applicable.length,
    denominator: applicable.length,
    scope: "curated-shelf",
    tier: "REAL-at-timestamp",
    basis: "requires a per-subject 30-day /chart history — captured for the curated shelf + any looked-up subject, NEVER the universe",
  },
  peg: {
    renderable: stablecoinShelf.length,
    denominator: applicable.length,
    scope: "curated-shelf (conditional: stablecoin leg)",
    tier: "REAL-at-timestamp/REAL★",
    basis: "conditional — a stablecoin leg + a price read; captured for the curated stablecoin subjects",
  },
  "liquidity-depth": {
    renderable: dexBacked.length,
    denominator: applicable.length,
    scope: "curated-shelf (conditional: DEX pool)",
    tier: "REAL-at-timestamp",
    basis: "requires a GeckoTerminal DEX-pool reserve — only the stablecoin-yield subjects with a gtKey",
  },
  contract: {
    renderable: contract.realCount,
    denominator: applicable.length,
    scope: "curated-shelf",
    tier: "REAL★",
    basis: "a deterministic structural screen over VERIFIED source with a compiled-vs-deployed match — the curated pools that carry a REAL build tier (NOT an audit)",
  },
  governance: {
    renderable: govResolved,
    resolvedGated: govGated,
    denominator: gov.subjects.length,
    scope: "curated-shelf",
    tier: "REAL★",
    basis: "an on-chain admin/proxy read (branch B, the tool's own free RPC rotation) — the captured shelf subjects with a resolved admin class",
  },
  "domain-catch": {
    renderable: 0,
    denominator: applicable.length,
    scope: "lookup + fixtures (no curated-shelf subject is a new domain)",
    tier: "info/context",
    basis: "requires a domain classification into a new domain (STABLE-SYNTH/LST-LRT/LOOPED-CDP/RWA) + the domain read; NO curated-shelf subject classifies into a new domain today — the four domains render through the LOOKUP path + are fixture-proven (Domain sprint, D34)",
  },
}

const body = {
  protocol: "depth-census",
  at: "2026-07-12",
  rule: "the honest per-axis coverage — how many pools the tool can say something COMPLETE about, per axis, not merely 'covered' (which means yield-only). An OUTCOME over committed artifacts; a target that licenses inflating an axis count is a cut (CV4).",
  qualifyingSentence:
    "'Covered' means the yield axis is renderable — not a full Reality Check. See the depth census for per-axis coverage: how many pools the tool can say something COMPLETE about, not merely something about.",
  universe: coverage.universeSize,
  breadthYieldOnly: coverage.covered,
  perAxis,
  honestSummary: `yield renders across ${coverage.covered} of ${coverage.universeSize} (the breadth number — yield ONLY); a COMPLETE Reality Check (the deeper axes at REAL) is available for the ${applicable.length} curated shelf subjects + any looked-up subject — the tool says so plainly, and NEVER lets "${coverage.covered} covered" stand unqualified (CV4).`,
  sources: ["data/honesty/coverage-census.json", "data/honesty/governance/census.json", "data/honesty/contract-registry.json", "data/honesty/shelf-registry.json"],
}
const OUT = { ...body, contentSha: sha256(JSON.stringify(body)) }
writeFileSync(path.join(H, "depth-census.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── DEPTH CENSUS — the honest per-axis coverage (CV4) ───────────")
console.log(`  yield-reality (breadth)  : ${perAxis["yield-reality"].renderable} / ${perAxis["yield-reality"].denominator}  (yield ONLY — REAL-at-timestamp)`)
console.log(`  tvl-trend                : ${perAxis["tvl-trend"].renderable} / ${perAxis["tvl-trend"].denominator}  (curated shelf)`)
console.log(`  peg (conditional)        : ${perAxis.peg.renderable} / ${perAxis.peg.denominator}  (stablecoin leg)`)
console.log(`  liquidity-depth (cond.)  : ${perAxis["liquidity-depth"].renderable} / ${perAxis["liquidity-depth"].denominator}  (DEX pool)`)
console.log(`  contract (REAL★)         : ${perAxis.contract.renderable} / ${perAxis.contract.denominator}  (verified build)`)
console.log(`  governance (REAL★)       : ${perAxis.governance.renderable} / ${perAxis.governance.denominator}  (resolved admin; ${govGated} gated)`)
console.log(`  domain-catch (info/ctx)  : ${perAxis["domain-catch"].renderable} / ${perAxis["domain-catch"].denominator}  (lookup + fixtures)`)
console.log(`  contentSha               : ${OUT.contentSha.slice(0, 16)}…`)
console.log("written: data/honesty/depth-census.json")
