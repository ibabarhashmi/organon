/**
 * ORGΛNON — the POOL COMPOSER console-path traversal (Ensemble Phase 3; Rule U-SURFACE, K-EFF, K-LEGIBLE). The Pool
 * Composer is BORN under U-SURFACE — its gate passes ONLY on this: a recorded traversal through the REAL served route
 * (app.request → /pool/compose), fresh serve → the pool screen → compose a diversified pool → the union family + K_eff +
 * the mandatory stress caveat + the legible deflation basis, the honest over-correlated "adds nothing" render, PLUS a
 * FAILURE STATE (a <2-member pool refused before registration). Hashed + filed. Run: bun run script/pool-traversal.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Surface } from "../src/studio/surface"
import { app } from "./serve-studio"

const D = path.join(PKG_ROOT, "data", "studio")
const post = (body: Record<string, string>) => app.request("/pool/compose", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body).toString() })

const home = await app.request("/")
const homeText = await home.text()
const div = await post({ count: "5", regime: "diversified" })
const divText = await div.text()
const cor = await post({ count: "5", regime: "correlated" })
const corText = await cor.text()
const bad = await post({ count: "1", regime: "diversified" })
const badText = await bad.text()

const steps: Surface.Step[] = [
  { route: "GET /", interaction: "load the dashboard from a fresh serve", expected: "the Pool Composer (screen 10) renders with its members/regime form", met: home.status === 200 && homeText.includes("Pool Composer (screen 10"), evidence: `status ${home.status}; contains the Pool Composer screen` },
  { route: "POST /pool/compose", interaction: "compose a diversified 5-member pool and submit", expected: "a pool verdict renders with K_eff, the union charge (ceil K_eff), the union family, the MANDATORY stress caveat, and the legible deflation basis (n · scoping · a neutral note)", met: div.status === 200 && divText.includes("POOL VERDICT:") && divText.includes("union charge") && divText.includes("Stress caveat") && divText.includes("Deflation basis"), evidence: `status ${div.status}; POOL VERDICT + union charge + Stress caveat + Deflation basis` },
  { route: "POST /pool/compose", interaction: "compose an OVER-CORRELATED (near-duplicate) pool", expected: "'THIS POOL ADDS NOTHING BEYOND ITS STRONGEST MEMBER' renders plainly (K_eff≈1) — WITHOUT refusing composition (the honest degenerate read)", met: cor.status === 200 && corText.includes("ADDS NOTHING") && corText.includes("K_eff="), evidence: `status ${cor.status}; ADDS NOTHING, K_eff shown, not refused` },
]
const failureState: Surface.Step = { route: "POST /pool/compose", interaction: "compose a pool with fewer than 2 members (count=1)", expected: "the pool is REFUSED before registration with an honest message (a pool needs ≥2 members to diversify); no fabricated verdict", met: bad.status === 200 && badText.includes("INVALID POOL") && !badText.includes("POOL VERDICT:"), evidence: `status ${bad.status}; INVALID POOL, no verdict` }

const artifact = Surface.makeTraversal({ capability: "pool-composer", freshServe: true, steps, failureState, at: "2026-07-05" })
const verify = Surface.verifyTraversal(artifact)
writeFileSync(path.join(D, "traversal-pool-composer.json"), JSON.stringify({ ...artifact, contentSha: Surface.contentSha(artifact), verify }, null, 2) + "\n")

console.log(`pool-composer traversal: allMet=${artifact.allMet} · admissible=${verify.ok}${verify.ok ? "" : " — " + verify.issues.join("; ")}`)
for (const s of steps) console.log(`  [${s.met ? "✓" : "✗"}] ${s.route} — ${s.expected.slice(0, 72)}`)
console.log(`  [${failureState.met ? "✓" : "✗"}] FAILURE: ${failureState.expected.slice(0, 72)}`)
console.log(`written: data/studio/traversal-pool-composer.json (sha ${Surface.contentSha(artifact).slice(0, 12)}…)`)
