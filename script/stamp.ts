/**
 * ORGΛNON — THE STAMP CLI (Crown-Jewel Phase 4; Rule X-OPTIN). The opt-in overfit stress test from the command line:
 *   bun run script/stamp.ts <poolKey>
 * Resolves the pool's recorded return series and runs it through the byte-untouched frozen attest core → a DISTINCT
 * GO/NO-GO/INSUFFICIENT verdict (or UNAVAILABLE), orthogonal to the Reality Check's SOLID/CAUTION/AVOID/UNVERIFIED. Off
 * the mass path; deflation armed only here; honest INSUFFICIENT on short-history DeFi. Deterministic.
 */
import { Stamp } from "../src/studio/stamp"
import { ProvRecord } from "../src/dataplane/record"

const poolKey = process.argv[2]
if (!poolKey) {
  const chain = ProvRecord.verify()
  const keys = Object.keys(chain.keys ?? {}).filter((k) => k.includes(":pool:") || k.startsWith("funding-basis:"))
  console.log("usage: bun run script/stamp.ts <poolKey>")
  console.log("\nthe opt-in overfit Stamp — a DISTINCT GO/NO-GO/INSUFFICIENT verdict on a pool's recorded track record,")
  console.log("orthogonal to the Reality Check (never conflated). Recorded pools you can stamp:")
  if (keys.length) for (const k of keys) console.log(`  · ${k}`)
  else console.log("  (none recorded yet — run `bun run script/capture-cadence.ts` to grow the record)")
  process.exit(0)
}

const r = await Stamp.stampFor(poolKey)
console.log("── THE STAMP (opt-in overfit stress test — NOT the Reality Check verdict) ──")
console.log(`pool        : ${poolKey}`)
console.log(`STAMP       : ${r.verdict}${r.available ? "" : " (unavailable)"}`)
if (r.available && r.verdict !== "UNAVAILABLE") {
  console.log(`observations: ${r.nObs} recorded return points`)
  console.log(`deflation   : deflated significance ${r.dsr ?? "n/a"} · n counted attempts ${r.familyN}`)
  if (r.reproHash) console.log(`reproHash   : ${r.reproHash.slice(0, 16)}…`)
}
console.log(`\n${r.reason}`)
console.log("\n[ the Stamp is a statistics verdict on the recorded track record — orthogonal to the scorecard; a GO is NOT 'safe', an INSUFFICIENT is NOT 'bad' ]")
