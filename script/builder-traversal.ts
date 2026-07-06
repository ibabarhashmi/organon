/**
 * ORGΛNON — the GUIDED BUILDER console-path traversal (Reachability Phase 3; Rule U-SURFACE). The builder is BORN under
 * U-SURFACE — its gate passes ONLY on this: a recorded traversal through the REAL served routes (app.request → the real
 * /builder/compose handler), fresh serve → the builder screen → compose a spec field-by-field → submit → verdict → the
 * spine panels ("why not yet · when, honestly") → enroll, PLUS the FAILURE STATE (an invalid composition refused with an
 * honest, non-priming message). Hashed + filed. Run: bun run script/builder-traversal.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Surface } from "../src/studio/surface"
import { app } from "./serve-studio"

const D = path.join(PKG_ROOT, "data", "studio")
const KEYS = ["lending:aave-v3:USDC:ethereum", "lending:sparklend:DAI:ethereum", "lending:fluid-lending:USDC:ethereum"]
const post = (body: Record<string, string>) => app.request("/builder/compose", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body).toString() })

// STEP 1 — fresh serve → the dashboard (the builder screen renders with its field help)
const home = await app.request("/")
const homeText = await home.text()
// STEP 2 — the real interaction: compose a VALID lending spec (two markets, conservative equal-ish weights) → submit
const valid = await post({ [`w_${KEYS[0]}`]: "0.5", [`w_${KEYS[1]}`]: "0.5", policy: "static" })
const validText = await valid.text()
// FAILURE STATE — an INVALID composition (an out-of-range weight > 1, i.e. leverage) → refused before registration
const invalid = await post({ [`w_${KEYS[0]}`]: "2.0", policy: "static" })
const invalidText = await invalid.text()

const steps: Surface.Step[] = [
  { route: "GET /", interaction: "load the dashboard from a fresh serve", expected: "the Guided Builder (screen 9) renders with its field help", met: home.status === 200 && homeText.includes("Guided Builder") && homeText.includes("compose + submit"), evidence: `status ${home.status}, contains 'Guided Builder' + the compose form` },
  { route: "POST /builder/compose", interaction: "compose a valid lending spec (two markets, equal weights, static policy) and submit", expected: "a verdict card + the plain-language report + 'WHY NOT YET' + the hedged 'WHEN, HONESTLY' render (the builder reaches the same engine)", met: valid.status === 200 && validText.includes("VERDICT:") && validText.includes("WHY NOT YET") && validText.includes("WHEN, HONESTLY"), evidence: `status ${valid.status}, contains VERDICT + WHY NOT YET + WHEN` },
]
const failureState: Surface.Step = { route: "POST /builder/compose", interaction: "compose an INVALID spec (a weight of 2.0 — leverage, out of range) and submit", expected: "the invalid composition is REFUSED before registration with an honest, non-priming message; no fabricated verdict", met: invalid.status === 200 && invalidText.includes("INVALID COMPOSITION") && !invalidText.includes("VERDICT:"), evidence: `status ${invalid.status}, contains INVALID COMPOSITION, no VERDICT` }

const artifact = Surface.makeTraversal({ capability: "guided-builder", freshServe: true, steps, failureState, at: "2026-07-05" })
const verify = Surface.verifyTraversal(artifact)
writeFileSync(path.join(D, "traversal-guided-builder.json"), JSON.stringify({ ...artifact, contentSha: Surface.contentSha(artifact), verify }, null, 2) + "\n")

console.log(`guided-builder traversal: allMet=${artifact.allMet} · admissible=${verify.ok}${verify.ok ? "" : " — " + verify.issues.join("; ")}`)
for (const s of steps) console.log(`  [${s.met ? "✓" : "✗"}] ${s.route} — ${s.expected}`)
console.log(`  [${failureState.met ? "✓" : "✗"}] FAILURE STATE: ${failureState.route} — ${failureState.expected}`)
console.log(`written: data/studio/traversal-guided-builder.json (sha ${Surface.contentSha(artifact).slice(0, 12)}…)`)
