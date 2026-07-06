/**
 * ORGΛNON — the BUILDER'S FUNDING + BASIS console-path traversals (Ensemble Phase 2; Rule U-SURFACE, R-BASIS, K-SCOPE).
 * The builder's two new domains are BORN under U-SURFACE — their gate passes ONLY on a recorded traversal through the
 * REAL served routes (app.request → /builder/funding · /builder/basis), fresh serve → compose → verdict → panels, PLUS a
 * FAILURE STATE (funding: an invalid interval refused; basis: a mismatched-venue pair refused). The basis traversal also
 * exercises the MIN-tier + EXPERIMENTAL surfaced INLINE before composing. Hashed + filed. Run: bun run script/builder-domains-traversal.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Surface } from "../src/studio/surface"
import { app } from "./serve-studio"

const D = path.join(PKG_ROOT, "data", "studio")
const post = (route: string, body: Record<string, string>) => app.request(route, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body).toString() })

// ── FUNDING ──
const home = await app.request("/")
const homeText = await home.text()
const fund = await post("/builder/funding", { venue: "binance", interval: "8", side: "receive" })
const fundText = await fund.text()
const fundBad = await post("/builder/funding", { venue: "binance", interval: "3", side: "receive" })
const fundBadText = await fundBad.text()
const fundingSteps: Surface.Step[] = [
  { route: "GET /", interaction: "load the dashboard — the FUNDING builder form renders", expected: "the Guided Builder — FUNDING form renders with venue/interval/side", met: home.status === 200 && homeText.includes("Guided Builder — FUNDING"), evidence: `status ${home.status}; contains the FUNDING form` },
  { route: "POST /builder/funding", interaction: "compose a funding-carry spec (binance, 8h, receive) and submit", expected: "a verdict card + the plain-language report + WHY NOT YET render (ILLUSTRATIVE data, labeled); the funding composition reaches the same engine", met: fund.status === 200 && fundText.includes("VERDICT:") && fundText.includes("WHY NOT YET") && fundText.includes("ILLUSTRATIVE"), evidence: `status ${fund.status}; VERDICT + WHY NOT YET + ILLUSTRATIVE` },
]
const fundingFailure: Surface.Step = { route: "POST /builder/funding", interaction: "compose a funding spec with an INVALID interval (3h — funding settles 1h/8h)", expected: "the invalid composition is REFUSED before registration with an honest message; no fabricated verdict", met: fundBad.status === 200 && fundBadText.includes("INVALID COMPOSITION") && !fundBadText.includes("VERDICT:"), evidence: `status ${fundBad.status}; INVALID COMPOSITION, no VERDICT` }
const fundingArtifact = Surface.makeTraversal({ capability: "guided-builder-funding", freshServe: true, steps: fundingSteps, failureState: fundingFailure, at: "2026-07-05" })
writeFileSync(path.join(D, "traversal-builder-funding.json"), JSON.stringify({ ...fundingArtifact, contentSha: Surface.contentSha(fundingArtifact), verify: Surface.verifyTraversal(fundingArtifact) }, null, 2) + "\n")

// ── BASIS ──
const basis = await post("/builder/basis", { cexVenue: "binance", dexVenue: "hyperliquid" })
const basisText = await basis.text()
const basisBad = await post("/builder/basis", { cexVenue: "binance", dexVenue: "binance" })
const basisBadText = await basisBad.text()
const basisSteps: Surface.Step[] = [
  { route: "GET /", interaction: "load the dashboard — the BASIS form shows the MIN-tier + EXPERIMENTAL BEFORE composing", expected: "the weakest-leg tier (MIN(legs)) + EXPERIMENTAL render INLINE in the form, before the user composes (R-BASIS)", met: home.status === 200 && homeText.includes("weakest-leg tier") && homeText.includes("EXPERIMENTAL"), evidence: `status ${home.status}; weakest-leg tier + EXPERIMENTAL in-form` },
  { route: "POST /builder/basis", interaction: "compose a basis spec (binance CeFi T1 vs hyperliquid DeFi T2) and submit", expected: "a verdict renders with the per-leg tiers + the basis tier = MIN(legs) = T2 + EXPERIMENTAL (the cross-venue domain at its true tier)", met: basis.status === 200 && basisText.includes("VERDICT:") && basisText.includes("MIN(legs)=T2") && basisText.includes("EXPERIMENTAL"), evidence: `status ${basis.status}; VERDICT + MIN(legs)=T2 + EXPERIMENTAL` },
]
const basisFailure: Surface.Step = { route: "POST /builder/basis", interaction: "compose a MISMATCHED-venue pair (binance as both legs — a basis needs one CeFi + one DeFi leg)", expected: "the mismatched pair is REFUSED before registration with an honest message; no fabricated verdict", met: basisBad.status === 200 && basisBadText.includes("INVALID COMPOSITION") && !basisBadText.includes("VERDICT:"), evidence: `status ${basisBad.status}; INVALID COMPOSITION, no VERDICT` }
const basisArtifact = Surface.makeTraversal({ capability: "guided-builder-basis", freshServe: true, steps: basisSteps, failureState: basisFailure, at: "2026-07-05" })
writeFileSync(path.join(D, "traversal-builder-basis.json"), JSON.stringify({ ...basisArtifact, contentSha: Surface.contentSha(basisArtifact), verify: Surface.verifyTraversal(basisArtifact) }, null, 2) + "\n")

for (const [name, a] of [["funding", fundingArtifact], ["basis", basisArtifact]] as const) {
  const v = Surface.verifyTraversal(a)
  console.log(`${name} traversal: allMet=${a.allMet} · admissible=${v.ok}${v.ok ? "" : " — " + v.issues.join("; ")}`)
  for (const s of a.steps) console.log(`  [${s.met ? "✓" : "✗"}] ${s.route} — ${s.expected.slice(0, 70)}`)
  console.log(`  [${a.failureState.met ? "✓" : "✗"}] FAILURE: ${a.failureState.expected.slice(0, 70)}`)
}
console.log("written: traversal-builder-funding.json · traversal-builder-basis.json")
