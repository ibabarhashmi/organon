/**
 * ORGΛNON — the PUBLICATION PRE-FLIGHT (Warranty Phase 3, walk fix W2). The publication gate (src/studio/publication.ts)
 * was a checkable function that nothing invoked — a decorative gate. This is its enforcement CHOKEPOINT: the Operator runs
 * it before any push. It REFUSES (exit 1) unless the IDENTITY gate (capability matrix rendered + true) AND the CONSENT
 * gate (Operator consent) both hold. It NEVER pushes anything — it is the check a push must pass first (publication stays
 * a manual Operator action, L-2P). Consent is asserted only by the Operator via ORGANON_PUBLISH_CONSENT=1 (never the agent).
 * Run:  ORGANON_PUBLISH_CONSENT=1 bun run script/publish-preflight.ts   (the agent runs it WITHOUT the flag → REFUSED)
 */
import { Publication } from "../src/studio/publication"

const operatorConsent = process.env.ORGANON_PUBLISH_CONSENT === "1"
const r = Publication.gate({ operatorConsent })

console.log("═══ PUBLICATION PRE-FLIGHT (F-IDENTITY + L-2P) ═══")
const id = Publication.identityGate()
console.log(`  identity gate (matrix rendered + true): ${id.ok ? "SATISFIED" : "BLOCKED"}`)
console.log(`  consent gate (Operator ORGANON_PUBLISH_CONSENT=1): ${operatorConsent ? "PRESENT" : "PENDING — the agent cannot self-consent"}`)
if (r.allowed) {
  console.log("\nRESULT: ALLOWED — the Operator may push. (This tool does not push; publication remains a manual Operator action.)")
  process.exit(0)
} else {
  console.log("\nRESULT: REFUSED — publication blocked. Reasons:")
  for (const reason of r.reasons) console.log(`  · ${reason}`)
  process.exit(1)
}
