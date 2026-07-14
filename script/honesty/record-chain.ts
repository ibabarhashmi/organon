/**
 * ORGΛNON — THE SOCKET SPRINT (V37), Phase 2 (S108 / DD-32): THE REASONS ARE IN THE MOAT.
 *
 * G-5: the origins of 83 walls were unrecoverable for exactly one reason — this project gitignores its own build logs. The
 * code's provenance is hash-chained; the REASONS for the code were outside the moat, so RECOVER failed for all twelve and
 * the census can never shrink via RECOVER. This commits the build logs under record/, HASH-CHAINED (tamper-evident), and a
 * wall (S108) asserts NO Claim.producer reads them — X-DERIVE reads ARTIFACTS, not prose; a build log is evidence for
 * humans, never input to a computation (PART A' attack #10: prose in the moat as RECORD, never as CLAIM).
 *
 * Run: bun run script/honesty/record-chain.ts
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync, readdirSync, copyFileSync, mkdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const SRC = path.join(PKG_ROOT, "sprint", "sprint-result")
const REC = path.join(PKG_ROOT, "record")
mkdirSync(REC, { recursive: true })

// the committed-era build logs, in a deterministic (sorted) order — the chain is over CONTENT, tamper-evident, not a claim.
const logs = readdirSync(SRC).filter((f) => /^BUILDLOG-.*\.md$/.test(f)).sort()

let prevSha = "0".repeat(64)
const chain: { name: string; contentSha: string; prevSha: string; selfSha: string }[] = []
for (const name of logs) {
  const content = readFileSync(path.join(SRC, name), "utf8")
  copyFileSync(path.join(SRC, name), path.join(REC, name)) // the log itself, committed under record/
  const contentSha = sha256(content)
  const selfSha = sha256(prevSha + contentSha) // the chain link
  chain.push({ name, contentSha, prevSha, selfSha })
  prevSha = selfSha
}

// SUBSTANCE V38 (S122 / H-6) — D53's SEARCH gets a real LEDGER HASH. V37 rendered the price ("Halt lifts: 1") but the ledger
// hash was absent; the Halt-lift's legitimacy rests on the SEARCH being IN THE MOAT. The X-RECKON STRATEGY-trial ledger
// counts SEARCH/OBSERVATION over strategy MANIFESTS (lineage ids) — a Halt-lift is a META-event, not a manifest, so it has
// NO coherent append site there (appending it would corrupt trialsPerFamily for a non-strategy). So the SEARCH is committed
// and HASH-CHAINED HERE: halt-lifts.json folded into this chain carries a real immutable hash (the chain link), and the log
// says "committed and hash-chained in record/", NOT "appended to the strategy ledger." The price IS paid in the moat.
const HALT = path.join(PKG_ROOT, "data", "honesty", "halt-lifts.json")
const haltContent = readFileSync(HALT, "utf8")
copyFileSync(HALT, path.join(REC, "halt-lifts.json"))
const haltContentSha = sha256(haltContent)
const haltSelfSha = sha256(prevSha + haltContentSha)
chain.push({ name: "halt-lifts.json", contentSha: haltContentSha, prevSha, selfSha: haltSelfSha })
prevSha = haltSelfSha

const manifest = {
  protocol: "record-chain",
  at: "2026-07-14",
  rule: "S108 / DD-32 (G-5) — the build logs, committed under record/ and HASH-CHAINED (tamper-evident). The reasons for the code now live inside the moat. These are RECORD, never CLAIM: a wall asserts NO Claim.producer reads a build log (X-DERIVE reads artifacts, not prose). Order is content-sorted (deterministic), not a source of truth. SUBSTANCE V38 (S122/H-6): the D53 SEARCH record (halt-lifts.json) is folded into the chain so the Halt-lift carries a real immutable LEDGER HASH — committed and hash-chained in record/, NOT appended to the strategy-trial ledger (a meta-event is not a strategy manifest, so the strategy ledger has no coherent append site).",
  boundary: "record/ is NOT a source of truth for any producer. A Claim.producer reading a build log would import unverified human prose into a computation — forbidden (S108). Prose is evidence for humans; artifacts are input for machines.",
  count: chain.length,
  chain,
  headSha: prevSha,
  d53SearchLedgerHash: haltSelfSha, // S122 — the immutable hash the D53 SEARCH carries (its price, paid in the moat)
  d53Note: "the Halt-lift is a META-event (sprint-level optional stopping), NOT a strategy manifest; the X-RECKON strategy-trial ledger counts acts over lineage ids and has no coherent site for it — so the price is paid HERE, committed + hash-chained, and the log no longer claims it was 'appended to the strategy ledger'.",
}
writeFileSync(path.join(REC, "chain.json"), JSON.stringify(manifest, null, 2) + "\n")

console.log("── SOCKET — the reasons in the moat (S108) ─────────────────")
console.log(`  build logs committed under record/ : ${chain.length}`)
console.log(`  chain head sha                     : ${prevSha.slice(0, 16)}…`)
console.log(`  boundary                           : RECORD, never CLAIM (no producer reads prose)`)
