/**
 * ORGΛNON — THE HARDENING SPRINT (V45): `organon.sh verify-chain` — THE RECOVERY VERB (S200/P-10/DD-98).
 *
 * Walks every append-only chain segment, verifies the hash-links, and QUARANTINES a torn tail (a crash mid-append) to a
 * `.torn` sidecar — NEVER deletes (the moat is append-only even in recovery). A break in the MIDDLE (a hand-edited history)
 * is surfaced loudly and NOT silently recovered. Exits nonzero if any chain is corrupt-in-the-middle.
 *
 * This is the recovery path the REAL kill-test (hardening-killtest.ts) exercises at every seam. Run it after any crash.
 *
 * Run: bun run script/verify-chain.ts   (or ./organon.sh verify-chain)
 */
import { existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Chain } from "../src/organon/chain"

// the known append-only chain segments (the record chain's crash-safe mirror; more may be added as the moat grows)
const SEGMENTS = [
  path.join(PKG_ROOT, "record", "chain.append.jsonl"),
]

console.log("── organon verify-chain — walk every append-only chain, recover a torn tail (never delete) ──")
let anyCorruptMiddle = false
let checked = 0
for (const seg of SEGMENTS) {
  const rel = path.relative(PKG_ROOT, seg)
  if (!existsSync(seg)) { console.log(`  ${rel}: absent (no chain to verify — a pre-record checkout)`); continue }
  checked++
  const rec = Chain.verifyAndRecover(seg)
  if (rec.kind === "OK") {
    console.log(`  ${rel}: OK — ${rec.entries} entries, hash-links verified, head ${rec.head.slice(0, 12)}…`)
  } else if (rec.kind === "TORN") {
    console.log(`  ${rel}: RECOVERED — a torn tail was QUARANTINED to ${rel}.torn (preserved, never deleted); ${rec.recovered} valid entries kept, head ${rec.head.slice(0, 12)}…`)
  } else {
    anyCorruptMiddle = true
    console.log(`  ${rel}: CORRUPT-MIDDLE — ${rec.reason}`)
    console.log(`    → a break in the middle is a TAMPERED history, not a crash; it is NOT silently recovered. Inspect ${rel} at entry ${rec.at}.`)
  }
}
console.log(`  checked ${checked} chain(s); ${anyCorruptMiddle ? "a corrupt-middle chain needs manual inspection" : "all recoverable/clean"}`)
if (anyCorruptMiddle) process.exitCode = 1
