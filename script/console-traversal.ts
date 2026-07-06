/**
 * ORGΛNON — CONSOLE-PATH TRAVERSAL generator (Reachability; Rule U-SURFACE). The console-path EVIDENCE the reachability
 * law demands: a recorded traversal that hits the REAL served route handlers (app.request → the real Hono routes → the
 * real console flow → the rendered result), NOT a cached renderer. It exercises the user's actual path (fresh serve →
 * the dashboard → a typed goal → the verdict + the spine panels) AND at least one FAILURE STATE (an empty goal →
 * MALFORMED), judged against catalog-grade expected behavior, hashed and filed. This is what a user-facing criterion
 * needs (a renderer unit test is necessary and never sufficient). Run: bun run script/console-traversal.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Surface } from "../src/studio/surface"
import { app } from "./serve-studio"

const D = path.join(PKG_ROOT, "data", "studio")
const form = (goal: string) => ({ method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ goal }).toString() })

// STEP 1 — fresh serve → the dashboard (the real screen: worked examples + the Goal Console door)
const home = await app.request("/")
const homeText = await home.text()
// STEP 2 — the real interaction: a typed lending-carry goal → the rendered verdict + the spine panels
const goal = await app.request("/console/goal", form("Earn steady stablecoin lending carry with honest costs"))
const goalText = await goal.text()
// FAILURE STATE — an empty goal → the MALFORMED honest state (nothing registered)
const bad = await app.request("/console/goal", form(""))
const badText = await bad.text()

const steps: Surface.Step[] = [
  { route: "GET /", interaction: "load the dashboard from a fresh serve", expected: "the worked-examples + the Goal Console (screen 8) render", met: home.status === 200 && homeText.includes("Goal Console") && homeText.includes("Worked examples"), evidence: `status ${home.status}, contains 'Goal Console' + 'Worked examples'` },
  { route: "POST /console/goal", interaction: "type a plain-English lending-carry goal and run it", expected: "a verdict card + the plain-language report + 'WHY NOT YET' + the hedged 'WHEN, HONESTLY' render (the spine reaches the screen)", met: goal.status === 200 && goalText.includes("VERDICT:") && goalText.includes("WHY NOT YET") && goalText.includes("WHEN, HONESTLY") && goalText.includes("pending floor audit"), evidence: `status ${goal.status}, contains VERDICT + WHY NOT YET + WHEN + the floor-audit hedge` },
]
const failureState: Surface.Step = { route: "POST /console/goal", interaction: "submit an EMPTY goal", expected: "a MALFORMED-GOAL honest state renders; nothing is registered; no fabricated verdict", met: bad.status === 200 && badText.includes("MALFORMED-GOAL") && !badText.includes("VERDICT:"), evidence: `status ${bad.status}, contains MALFORMED-GOAL, no VERDICT` }

const artifact = Surface.makeTraversal({ capability: "goal-console", freshServe: true, steps, failureState, at: "2026-07-05" })
const verify = Surface.verifyTraversal(artifact)
writeFileSync(path.join(D, "traversal-goal-console.json"), JSON.stringify({ ...artifact, contentSha: Surface.contentSha(artifact), verify }, null, 2) + "\n")

console.log(`goal-console traversal: allMet=${artifact.allMet} · admissible=${verify.ok}${verify.ok ? "" : " — " + verify.issues.join("; ")}`)
for (const s of steps) console.log(`  [${s.met ? "✓" : "✗"}] ${s.route} — ${s.expected}`)
console.log(`  [${failureState.met ? "✓" : "✗"}] FAILURE STATE: ${failureState.route} — ${failureState.expected}`)
console.log(`written: data/studio/traversal-goal-console.json (sha ${Surface.contentSha(artifact).slice(0, 12)}…)`)
