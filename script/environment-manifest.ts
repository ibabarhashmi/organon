/**
 * ORGΛNON STUDIO — the ENVIRONMENT MANIFEST (Phase 1; Rule H-CLOCK). Records, hash-verifiably, what forward-capture
 * evidence is PRESENT vs ABSENT in this environment and the resulting honest clock state per domain. In this
 * environment the gitignored forward captures are unrecoverable → every clock is RESTARTED (never reconstructed).
 * Any party can re-run `bun run script/environment-manifest.ts` and get the same manifest for their own tree.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"
import { PKG_ROOT, REPO_ROOT } from "../src/organon/frozen"
import { Clocks } from "../src/studio/clocks"

const sha256 = (b: Buffer | string) => createHash("sha256").update(b).digest("hex")

// the forward-capture artifacts each clock depends on (gitignored local data)
const CLOCK_ARTIFACTS: { domain: string; rel: string }[] = [
  { domain: "lending", rel: "packages/solidity-sentinel/data/lending" },
  { domain: "funding", rel: "packages/solidity-sentinel/data/funding" },
  { domain: "fee-yield", rel: "packages/solidity-sentinel/data/feeyield/forward" },
]

const restartLabel = "2026-07-04"
const artifacts = CLOCK_ARTIFACTS.map((a) => {
  const abs = path.join(REPO_ROOT, a.rel)
  const present = existsSync(abs)
  // no present stamp → verifyClock RESTARTS honestly (we never fabricate a stamp to verify)
  const clock = Clocks.verifyClock(a.domain, present ? "unknown-pin" : null, null, restartLabel)
  return { domain: a.domain, path: a.rel, present, clockState: clock.state, display: Clocks.renderState(clock) }
})

const manifest = {
  protocol: "environment-manifest",
  restartLabel,
  note: "forward-capture evidence is gitignored local data; absent here = the expected fresh-clone state. Absent → RESTART (H-CLOCK), never reconstruct.",
  artifacts,
  summary: { intact: artifacts.filter((a) => a.clockState === "intact").length, restarted: artifacts.filter((a) => a.clockState === "restarted").length },
}
const json = JSON.stringify(manifest, null, 2)
const outDir = path.join(PKG_ROOT, "data", "studio")
mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, "environment-manifest.json")
writeFileSync(outPath, json + "\n")

console.log(json)
console.log(`\nmanifest sha256 = ${sha256(json)}`)
console.log(`written: ${path.relative(REPO_ROOT, outPath)}`)
for (const a of artifacts) console.log(a.display)
