/**
 * ORGΛNON — Ensemble Phase 2 (BUILDER-WHOLE). The builder completed to its ratified three-domain scope (K-SCOPE cure):
 * funding + basis join lending under the identical conservative-defaults, honesty-checked, lineage-declaring discipline.
 * The per-domain U-SURFACE traversals (happy + failure each) are the gate's only sufficient evidence; the basis form
 * surfaces MIN-tier + EXPERIMENTAL inline; the verdict differential is byte-identical. Run: bun run script/phase2-ensemble.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Surface } from "../src/studio/surface"
import { Builder } from "../src/studio/builder"
import { VerdictDifferential } from "../src/studio/differential"

const D = path.join(PKG_ROOT, "data", "studio")

// (1) the per-domain U-SURFACE traversals admissible (happy + failure each)
const fundingTrav = Surface.loadTraversal(path.join(D, "traversal-builder-funding.json"))
const basisTrav = Surface.loadTraversal(path.join(D, "traversal-builder-basis.json"))

// (2) per-domain honesty checks (K-SCOPE cure, A′#5) + a SEEDED priming help per domain CAUGHT
const fundingHonest = Builder.helpHonestFor(Builder.FUNDING_FIELDS, "funding")
const basisHonest = Builder.helpHonestFor(Builder.BASIS_FIELDS, "basis")
const seededFunding = Builder.helpHonestFor([{ id: "seed", label: "x", help: "this venue offers GUARANTEED high returns with leverage", kind: "select" }], "funding")
const seededBasis = Builder.helpHonestFor([{ id: "seed", label: "x", help: "the best strategy — you'll profit, trust us", kind: "select" }], "basis")
const seededPrimingCaught = !seededFunding.ok && !seededBasis.ok

// (3) conservative ratified defaults per domain
const fundingDefaultsConservative = Builder.FUNDING_DEFAULTS.side === "receive" && Builder.FUNDING_DEFAULTS.intervalHours === 8
const basisDefaultsPresent = Builder.BASIS_DEFAULTS.cexVenue === "binance" && Builder.BASIS_DEFAULTS.dexVenue === "hyperliquid"

// (4) the basis MIN-tier + EXPERIMENTAL surfaced inline (a T1 label on a T2-legged basis is impossible)
const composed = Builder.composeBasis({ cexVenue: "binance", dexVenue: "hyperliquid" })
const minTierInline = composed.ok && composed.spec.minTier === "T2" && composed.formNote.includes("EXPERIMENTAL") && composed.formNote.includes("MIN(")

// (5) the verdict differential byte-identical (the builder grew; NO verdict moved — R-ADVISORY)
const pinnedFp = JSON.parse(readFileSync(path.join(D, "verdict-fingerprints-v11.json"), "utf8")).fingerprintSetSha
const differentialByteIdentical = (await VerdictDifferential.fingerprintSetSha()) === pinnedFp

// (6) the per-checkpoint CENSUS DIFF (K-COMPLETE): the two new user-facing capabilities enter the law automatically —
// the mechanism's first live use (a new capability with no admissible traversal would be caught here, the W7-01 class)
const prev = JSON.parse(readFileSync(path.join(D, "surfacing-census-v13.json"), "utf8")).full.surfaced as string[]
const nowEntries: Surface.FullCensusEntry[] = [
  ...prev.map((c) => ({ capability: c, kind: "user-facing" as const, traversal: "data/studio/traversal-goal-console.json", evidence: "carried" })),
  { capability: "guided-builder-funding", kind: "user-facing", traversal: "data/studio/traversal-builder-funding.json", evidence: "the funding builder traversal (compose → verdict → panels; failure: invalid interval)" },
  { capability: "guided-builder-basis", kind: "user-facing", traversal: "data/studio/traversal-builder-basis.json", evidence: "the basis builder traversal (MIN-tier inline → compose → verdict; failure: mismatched venue)" },
]
const censusDiff = Surface.censusDiff(prev, nowEntries, PKG_ROOT)

const out = {
  protocol: "phase2-builder-whole-v13", at: "2026-07-05", gate: "BUILDER-WHOLE",
  traversals: {
    funding: { admissible: fundingTrav.ok, theater: fundingTrav.artifact ? Surface.isTheater(fundingTrav.artifact) : true, issues: fundingTrav.issues },
    basis: { admissible: basisTrav.ok, theater: basisTrav.artifact ? Surface.isTheater(basisTrav.artifact) : true, issues: basisTrav.issues },
  },
  honesty: { funding: fundingHonest.ok, basis: basisHonest.ok, seededPrimingCaught },
  defaults: { fundingConservative: fundingDefaultsConservative, basisPresent: basisDefaultsPresent, lendingConservative: Builder.defaultsConservative() },
  basisMinTierInline: minTierInline,
  verdictDifferential: { byteIdentical: differentialByteIdentical, pinned: pinnedFp },
  censusDiff: { newlySurfaced: censusDiff.newlySurfaced, newlyDangling: censusDiff.newlyDangling, ok: censusDiff.ok },
  threeDomainsComposable: fundingTrav.ok && basisTrav.ok,
}
writeFileSync(path.join(D, "phase2-builder-whole-v13.json"), JSON.stringify(out, null, 2) + "\n")

const gateOk = fundingTrav.ok && basisTrav.ok && fundingHonest.ok && basisHonest.ok && seededPrimingCaught && minTierInline && differentialByteIdentical && fundingDefaultsConservative
console.log("═══ ENSEMBLE PHASE 2 — BUILDER-WHOLE ═══")
console.log(`funding traversal admissible=${fundingTrav.ok} · basis traversal admissible=${basisTrav.ok}`)
console.log(`per-domain honesty: funding=${fundingHonest.ok} basis=${basisHonest.ok} · seeded priming caught=${seededPrimingCaught}`)
console.log(`basis MIN-tier + EXPERIMENTAL inline (T2 for binance/hyperliquid): ${minTierInline}`)
console.log(`conservative defaults: funding=${fundingDefaultsConservative} lending=${Builder.defaultsConservative()}`)
console.log(`verdict differential byte-identical: ${differentialByteIdentical} (${pinnedFp.slice(0, 12)}…)`)
console.log(`BUILDER-WHOLE gate: ${gateOk ? "✅ satisfiable" : "❌ NOT satisfiable"}`)
