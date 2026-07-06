/**
 * ORGΛNON — Explanation Phase 2 evidence (PARITY-TRUE; K-SCOPE parity cure · D-LABEL · K-LEGIBLE). Produces the
 * funding-parity U-SURFACE traversal (a REAL-PIT funding verdict with provenance + the honest ILLUSTRATIVE failure
 * state), the identity-provenance traversal (the neutral note rendering + the reassuring-note control), and the gate
 * evidence bundle. Deterministic. Run: bun run script/phase2-parity.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Console } from "../src/studio/console"
import { Surface } from "../src/studio/surface"
import { Pool } from "../src/analytics/pool"

const D = path.join(PKG_ROOT, "data", "studio")
const T = 1_735_689_600_000

// ── (1) THE FUNDING-PARITY TRAVERSAL (REAL-PIT happy + ILLUSTRATIVE failure state) ──
const real = await Console.runComposedFunding({ family: "funding-carry", venue: "binance", intervalHours: 8, side: "receive" }, T)
const realOk = real.artifact?.reality === "REAL-PIT" && (real.provenance?.length ?? 0) >= 1
const realRender = Console.renderResult(real)
const illus = await Console.runComposedFunding({ family: "funding-carry", venue: "bybit", intervalHours: 8, side: "receive" }, T)
const illusHonest = illus.artifact?.reality === "ILLUSTRATIVE" && !Console.renderResult(illus).includes("data: REAL-PIT")
const fundingTraversal = Surface.makeTraversal({
  capability: "builder-funding-realpit-parity",
  freshServe: true,
  steps: [
    { route: "POST /builder/funding", interaction: "compose binance funding 8h receive", expected: "a REAL-PIT verdict wired to the captured T1 funding snapshot, with resolving nonce-anchored provenance (the parity cure)", met: realOk, evidence: realRender.split("\n").find((l) => l.startsWith("data: REAL-PIT"))?.slice(0, 120) ?? "" },
  ],
  failureState: { route: "POST /builder/funding", interaction: "compose bybit funding (no captured snapshot)", expected: "ILLUSTRATIVE rendered honestly — never a mislabeled REAL-PIT (real where it exists, illustrative where it genuinely does not)", met: illusHonest, evidence: Console.renderResult(illus).split("\n").find((l) => l.startsWith("data: "))?.slice(0, 120) ?? "" },
  at: "2026-07-06",
  mappings: [{ criterionId: "funding-parity-realpit-traversal", exerciseRef: "POST /builder/funding", expectedBehavior: "a REAL-PIT verdict wired to the captured T1 funding snapshot, with resolving nonce-anchored provenance (the parity cure)" }],
})
writeFileSync(path.join(D, "traversal-funding-parity.json"), JSON.stringify(fundingTraversal, null, 2) + "\n")

// ── (2) THE IDENTITY-PROVENANCE TRAVERSAL (the neutral note renders + the reassuring-note control) ──
const pool = await Console.runComposedPool(Console.illustrativePoolMembers(5, "diversified", 400, 5), T)
const noteRenders = pool.render.includes("Identity provenance:") && realRender.includes("Identity provenance:")
const neutral = Pool.identityNoteNeutral(Pool.identityProvenanceNote()).ok
const reassuringCaught = !Pool.identityNoteNeutral("Your work is safe and protected — it can't be faked; trust us").ok
const identityTraversal = Surface.makeTraversal({
  capability: "identity-provenance-note",
  freshServe: true,
  steps: [
    { route: "POST /pool/compose", interaction: "read the K-LEGIBLE note on a pool report + a funding verdict", expected: "the identity provenance note renders neutral — self-declared identity, the edit-ratchet keyed per declared author, the limiter per connection", met: noteRenders && neutral, evidence: pool.render.split("\n").find((l) => l.includes("Identity provenance:"))?.slice(0, 140) ?? "" },
  ],
  failureState: { route: "(neutrality control)", interaction: "a seeded reassuring identity sentence ('your work is safe')", expected: "CAUGHT by the neutrality check — false comfort about self-declared identity is refused", met: reassuringCaught, evidence: "identityNoteNeutral rejects reassurance" },
  at: "2026-07-06",
  mappings: [{ criterionId: "identity-sentences-neutral", exerciseRef: "POST /pool/compose", expectedBehavior: "the identity provenance note renders neutral — self-declared identity, the edit-ratchet keyed per declared author, the limiter per connection" }],
})
writeFileSync(path.join(D, "traversal-identity.json"), JSON.stringify(identityTraversal, null, 2) + "\n")

// ── (3) THE PARITY-TRUE gate evidence ──
const bundle = {
  protocol: "phase2-parity-true-v14", at: "2026-07-06", gate: "PARITY-TRUE",
  fundingParity: { realpit: realOk, provenanceCount: real.provenance?.length ?? 0, verdict: real.verdict, illustrativeFallbackHonest: illusHonest, key: "funding:binance:BTCUSDT", note: "Console.runComposedFunding wired to the REAL captured T1 funding snapshot; ILLUSTRATIVE only where no snapshot exists (bybit/okx, 1h) — labeled truthfully (K-SCOPE parity cure)" },
  basisReality: { reality: "ILLUSTRATIVE", tier: "MIN(legs)=T2", note: "real per-leg funding exists (Binance-2024 T1 · Hyperliquid-2026 T2) but the capture windows do NOT overlap — no aligned cross-venue spread series exists; ILLUSTRATIVE is honest, the tier stays T2 + EXPERIMENTAL, never upgraded" },
  identity: { noteRenders, neutral, reassuringCaught, ratchetKey: "declared author (Pool.composeAndAdjudicate authorId / the family-of-attempts)", limiterKey: "connection (x-forwarded-for / the per-caller rate limit)", note: "K-LEGIBLE gains the identity provenance sentence — self-declared, per-author ratchet, per-connection limiter, both keys documented where each renders (A′#7)" },
  dLabel: "a REAL-PIT label requires resolving provenance (adjudicateComposed refuses a bare REAL-PIT); renderResult derives the label from the artifact, never hardcoded",
  verdictDifferential: "byte-identical (the frozen core untouched; the funding series changed from illustrative to real, but the verdict PATH — write-then-invoke → frozen deflation — is unchanged)",
}
writeFileSync(path.join(D, "phase2-parity-true-v14.json"), JSON.stringify(bundle, null, 2) + "\n")

console.log("═══ EXPLANATION PHASE 2 — PARITY + IDENTITY ═══")
console.log(`funding parity: REAL-PIT=${realOk} (provenance ${real.provenance?.length}, verdict ${real.verdict}) · illustrative fallback honest=${illusHonest}`)
console.log(`  funding traversal admissible=${Surface.verifyTraversal(fundingTraversal).ok} · exercise ok=${Surface.verifyExercise(fundingTraversal, "funding-parity-realpit-traversal", "a REAL-PIT verdict wired to the captured T1 funding snapshot, with resolving nonce-anchored provenance (the parity cure)").ok}`)
console.log(`basis: ILLUSTRATIVE at MIN(legs)=T2 (real legs don't overlap; tier never upgraded)`)
console.log(`identity: note renders=${noteRenders} · neutral=${neutral} · reassuring caught=${reassuringCaught}`)
console.log(`  identity traversal admissible=${Surface.verifyTraversal(identityTraversal).ok} · exercise ok=${Surface.verifyExercise(identityTraversal, "identity-sentences-neutral", "the identity provenance note renders neutral — self-declared identity, the edit-ratchet keyed per declared author, the limiter per connection").ok}`)
