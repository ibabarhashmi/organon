/**
 * ORGΛNON — Explanation Phase 0 evidence (LAWS-DEFAULT-TRUE). Produces the interim-caveat U-SURFACE traversal (the pick
 * caveat rendering on a real pool report), the census diff over the V14 Phase-0 capabilities, and the laws-default-true
 * evidence bundle the gatekeeper resolves the non-surface criteria against. Deterministic. Run after phase0-why-setup.ts.
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Console } from "../src/studio/console"
import { Surface } from "../src/studio/surface"
import { Criteria } from "../src/studio/criteria"
import { Ratify } from "../src/studio/ratify"
import { Scope } from "../src/studio/scope"
import { Selection } from "../src/studio/selection"

const D = path.join(PKG_ROOT, "data", "studio")
const T = Date.parse("2026-07-05T00:00:00Z")

// ── (1) THE INTERIM-CAVEAT TRAVERSAL (U-SURFACE: the pick caveat renders on a real pool report) ──
const members = Console.illustrativePoolMembers(5, "diversified", 400, 5)
const happy = await Console.runComposedPool(members, T, { selectionState: "interim" })
const caveatRendered = happy.state === "verdict" && happy.render.includes("not yet priced")
// the failure state: an invalid (single-member) pool refused before registration
const bad = await Console.runComposedPool(members.slice(0, 1), T)
const failureHonest = bad.state === "refused"
const traversal = Surface.makeTraversal({
  capability: "interim-selection-caveat",
  freshServe: true,
  steps: [
    { route: "POST /pool/compose", interaction: "compose a diversified pool of 5 members", expected: "the pool report renders the interim caveat: member selection is not yet priced (the pick covers breadth, not selection)", met: caveatRendered, evidence: happy.render.split("\n").find((l) => l.includes("not yet priced"))?.slice(0, 160) ?? "" },
  ],
  failureState: { route: "POST /pool/compose", interaction: "compose a 1-member pool", expected: "refused before registration (a pool needs ≥2 members) — an honest non-priming failure state", met: failureHonest, evidence: bad.render.slice(0, 120) },
  at: "2026-07-05",
})
writeFileSync(path.join(D, "traversal-interim-caveat.json"), JSON.stringify(traversal, null, 2) + "\n")

// ── (2) THE CENSUS DIFF over the V14 Phase-0 capabilities (K-COMPLETE — attached to the checkpoint) ──
// the V13 capability set (the "since" — every capability known at the last checkpoint), from the V13 full census
const since = JSON.parse(require("node:fs").readFileSync(path.join(D, "surfacing-census-v13.json"), "utf8"))
const sinceCaps: string[] = [...(since.full?.surfaced ?? []), ...(since.full?.infrastructure ?? []).map((i: { capability: string }) => i.capability)]
const nowEntries: Surface.FullCensusEntry[] = [
  ...sinceCaps.map((c) => ({ capability: c, kind: "infrastructure" as const, traversal: null, evidence: "carried from V13 (unchanged)" })),
  // V14 Phase-0 NEW capabilities — the laws are infrastructure (named evidence), the interim caveat is user-facing
  { capability: "default-on-autoflag-law", kind: "infrastructure", traversal: null, evidence: "test/organon/why_law.test.ts + test/organon/ensemble_law.test.ts (the default-on + grandfather split)" },
  { capability: "per-criterion-exercise-assertions", kind: "infrastructure", traversal: null, evidence: "test/organon/why_law.test.ts (verifyExercise + the gate enforcement, vague-ref caught)" },
  { capability: "delta-aware-summary-differential", kind: "infrastructure", traversal: null, evidence: "test/organon/why_law.test.ts (the 58→74 founding catch)" },
  { capability: "census-miscategorization-control", kind: "infrastructure", traversal: null, evidence: "test/organon/why_law.test.ts (a known user-facing cap declared infra is caught)" },
  { capability: "experiment-registry", kind: "infrastructure", traversal: null, evidence: "test/organon/why_law.test.ts (Ratify.experimentRegistryCoherent over v14)" },
  { capability: "scope-parity-law", kind: "infrastructure", traversal: null, evidence: "test/organon/why_law.test.ts (Scope.parityRequired + the funding-parity retro-file)" },
  { capability: "selection-door-pins", kind: "infrastructure", traversal: null, evidence: "test/organon/why_law.test.ts (Selection.selectionSpecHash + the pinned surcharge form)" },
  { capability: "interim-selection-caveat", kind: "user-facing", traversal: "data/studio/traversal-interim-caveat.json", evidence: "the pick-not-yet-priced note renders on every pool report" },
]
const seededUF: Surface.FullCensusEntry = { capability: "seed-unsurfaced-v14", kind: "user-facing", traversal: null, evidence: "" }
const seededMC: Surface.FullCensusEntry = { capability: "interim-selection-caveat", kind: "infrastructure", traversal: null, evidence: "a unit test" }
const full = Surface.fullCensus(nowEntries, seededUF, PKG_ROOT, { knownUserFacing: ["interim-selection-caveat"], seededMiscategorized: seededMC })
const diff = Surface.censusDiff(sinceCaps, nowEntries, PKG_ROOT)
writeFileSync(path.join(D, "surfacing-census-v14.json"), JSON.stringify({ protocol: "surfacing-census-v14", at: "2026-07-05", full, diff }, null, 2) + "\n")

// ── (3) THE LAWS-DEFAULT-TRUE evidence bundle (the non-surface criteria resolve against this) ──
const ratV14 = Ratify.load(path.join(D, "research-ratification-v14.json"))
const scopeV14 = Scope.load(path.join(D, "scope-amendments-v14.json"))
const bundle = {
  protocol: "phase0-laws-default-true-v14", at: "2026-07-05",
  gate: "LAWS-DEFAULT-TRUE",
  defaultOn: { grandfatherSha: Criteria.grandfatherSha(), grandfatherPinnedMatch: Criteria.grandfatherSha() === Criteria.GRANDFATHER_SHA_PINNED, grandfatherCount: Criteria.grandfatherGateIds().length, note: "enforceAutoFlag defaults ON; grandfathered ids keep explicit-only; opting out files a reason" },
  exerciseAssertions: "live in Surface.verifyExercise + the gatekeeper's surface resolution; a vague ref is caught (the W8-01 class)",
  deltaDifferential: "live in Summary.deltaDifferential; the V13 '58→74' slip is the founding catch (delta-founding-catch-v14.json)",
  censusMiscategorization: { caught: full.miscategorizationCaught, note: "a known user-facing capability declared infrastructure is caught" },
  experimentRegistry: { coherent: Ratify.experimentRegistryCoherent(ratV14.entries).ok, modules: Ratify.EXPERIMENT_REGISTRY.map((r) => r.module) },
  scopeParity: { amendments: scopeV14.entries.length, chainOk: scopeV14.chainOk, fundingParityFiled: scopeV14.entries.some((e) => e.feature.includes("funding")) },
  identityProvenance: "filed into parks-register.json (V14-IDENTITY-PROVENANCE): authorId self-declared + rotation-free; ratchet keyed per-author, limiter per-connection; the bypass vector named with 0.928/0.310",
  selectionPins: { specHash: Selection.selectionSpecHash(), surchargeForm: "ceil(log2(C(M,K)))" },
  interimCaveat: { rendered: caveatRendered, traversal: "data/studio/traversal-interim-caveat.json" },
  whyGroundRules: "pinned in phase0-pins-v14.json (fact-table schema · materiality · template registry · verifier rules)",
  catalogV14: "pinned in e2e-catalog-v14.json (46 = v13's 36 + S22-S31), content-sha pinned in e2e-catalog-pin-v14.json",
  criteriaSetSha: Criteria.whyCriteriaSha(),
  blueprintPin: Criteria.WHY_BLUEPRINT_SHA_PINNED,
}
writeFileSync(path.join(D, "phase0-laws-default-true-v14.json"), JSON.stringify(bundle, null, 2) + "\n")

// ── (4) THE CATALOG PIN provenance file (content-sha, for the checkpoint) ──
import { Catalog } from "../src/studio/catalog"
const cat = Catalog.load()!
writeFileSync(path.join(D, "e2e-catalog-pin-v14.json"), JSON.stringify({ protocol: "e2e-catalog-pin", version: "v14", pinnedAt: "2026-07-05", contentSha: Catalog.contentSha(cat), count: cat.scenarios.length, note: "the content-sha pin over the canonical v14 scenario set (E-CATALOG provenance)" }, null, 2) + "\n")

// ── the criteria print (VERBATIM beside the pin, C-RECON2) ──
writeFileSync(path.join(D, "phase0-criteria-print-v14.txt"), Criteria.printVerbatimWhy() + "\n")

console.log("═══ EXPLANATION PHASE 0 — EVIDENCE ═══")
console.log(`interim-caveat traversal: caveat rendered=${caveatRendered}, failure honest=${failureHonest}, admissible=${Surface.verifyTraversal(traversal).ok}`)
console.log(`census diff: ${diff.newCapabilities.length} new capabilities (${diff.newlySurfaced.length} surfaced · ${diff.newlyInfrastructure.length} infra · ${diff.newlyDangling.length} dangling); full ok=${full.ok} · miscategorization caught=${full.miscategorizationCaught}`)
console.log(`laws bundle: default-on grandfather match=${bundle.defaultOn.grandfatherPinnedMatch} · experiment-registry coherent=${bundle.experimentRegistry.coherent} · scope parity filed=${bundle.scopeParity.fundingParityFiled}`)
console.log(`catalog v14 content-sha ${Catalog.contentSha(cat).slice(0, 16)}…`)
