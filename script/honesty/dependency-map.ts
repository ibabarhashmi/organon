/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 4: emit the shared-dependency-map artifact (S159, D77) on a realistic manifest
 * (3 USDC + 2 DAI shelf subjects). A COUNT over a join — the SOLE input to the build log's DEPENDENCY MAP block. It ranks
 * nothing, suggests nothing, and never says "diversify"; per-key coverage emitted; UNJUDGEABLE never independence (RP-4).
 *
 * Run: bun run script/honesty/dependency-map.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Depend } from "../../src/strategy/depend"
import { AdviceShape } from "../../src/ask/advice"

// a realistic demonstration manifest: 3 USDC (aave-v3, fluid-lending, compound-v3) + 2 DAI (aave-v3, sparklend)
const MANIFEST = ["aa70268e-4b52-42bf-a116-608b370f9501", "4438dabc-7f0c-430b-8136-2722711ae663", "7da72d09-56ca-4ec5-a45f-59114353e487", "3665ee7e-6c5d-49d9-abb7-c47ab5d9d4ac", "e26ce7d9-db75-4aa4-b1db-cc21ae17bdfb"]
const r = Depend.map(MANIFEST)
const guardClean = Depend.lines(r).every((l) => !AdviceShape.detect(l).advice)

const OUT = {
  protocol: "dependency-map",
  at: "2026-07-15",
  rule: "S159 (K-10, D77) — a COUNT over a join on three keys (underlying · admin key · oracle feed), the curator-loss literature's core fact. Per-key coverage emitted; the admin-key join matches ONLY the RESOLVED terminal authority (UNRESOLVED → UNJUDGEABLE, never a match — RP-4); it ranks nothing, suggests nothing, and NEVER says 'diversify' (through the ONE GUARD). The copy is PINNED VERBATIM (no LLM).",
  demonstrationManifest: "3 USDC (aave-v3, fluid-lending, compound-v3) + 2 DAI (aave-v3, sparklend) — real shelf subjects",
  map: r,
  guardClean,
  registers: { simple: Depend.speak(r, "Simple"), pro: Depend.speak(r, "Pro") },
}
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "dependency-map.json"), JSON.stringify(OUT, null, 2) + "\n")

console.log("── THE POSITIONS THAT DIE TOGETHER ARE NAMED (V40) ───────────────")
console.log(`  ${r.byUnderlying.line}`)
console.log(`  ${r.byOracle.line}`)
console.log(`  ${r.byAdminKey.line}`)
console.log(`  per-key coverage — underlying ${r.byUnderlying.coverage.resolved}/${r.positions} · admin ${r.byAdminKey.coverage.resolved}/${r.positions} (RESOLVED) · oracle ${r.byOracle.coverage.resolved}/${r.positions} (shelf-wide 3/1284)`)
console.log(`  guard-clean (no advice, never 'diversify'): ${guardClean}`)
console.log("written: data/honesty/dependency-map.json")
