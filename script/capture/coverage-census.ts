/**
 * ORGΛNON — THE COVERAGE CENSUS CAPTURE (Coverage sprint; X-COVERAGE d). Fetches the live DeFiLlama Yields universe and
 * writes data/honesty/coverage-census.json — an OUTCOME artifact (the coverage hit-rate), the pinned 'covered' definition
 * applied EXACTLY (a SAMPLE-only pool is never counted covered — a gamed census is a Halt). Offline → a labeled SAMPLE
 * census (0 covered — never inflated). REAL-at-timestamp, content-hashed. Run:  bun run script/capture/coverage-census.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { LlamaYields } from "../../src/dataplane/providers/llama-yields"

const now = Date.now()
const u = await LlamaYields.universe(now)
const c = LlamaYields.census(u, now)
const out = { ...c, contentSha: u.contentSha, source: "https://yields.llama.fi/pools", tier: LlamaYields.TIER }
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "coverage-census.json"), JSON.stringify(out, null, 2) + "\n")
console.log(`── COVERAGE CENSUS (${c.reality}) ──`)
console.log(`  universe ${c.universeSize} · covered ${c.covered} · sample-only ${c.sampleOnly} · sha ${u.contentSha.slice(0, 16)}…`)
console.log(`  definition: ${c.coveredDefinition}`)
console.log("written: data/honesty/coverage-census.json")
