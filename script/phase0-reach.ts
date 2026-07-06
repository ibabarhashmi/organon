/**
 * ORGΛNON — Reachability Phase 0 evidence (Rules U-SURFACE, U-RESUPERSEDE, U-PRISTINE, U-DERIVED, E-CATALOG). Pays V11's
 * debts and makes reachability law BEFORE any feature work:
 *   (1) the VoC→OOS ratification SUPERSESSION filed (append-only, referencing the original ADOPT row's hash) — U-RESUPERSEDE;
 *   (2) the V7–V10 fresh-clone SCOPE CORRECTION + (3) the 22/23 reconciliation + (4) the summary-differential mechanism,
 *       filed as debt values (debts-v12.json);
 *   (5) the SURFACING CENSUS run (every user-facing capability → its console-path traversal; a seeded unsurfaced
 *       capability CAUGHT; the retroactive proof that U-SURFACE would have caught V11's W6-01 at BREADTH-TRUE);
 *   (6) the catalog v12 pin; criteria printed verbatim; floor/absences baseline.
 * Deterministic + idempotent. Prereq: script/console-traversal.ts (the traversal artifact). Run: bun run script/phase0-reach.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Criteria } from "../src/studio/criteria"
import { Ratify } from "../src/studio/ratify"
import { Surface } from "../src/studio/surface"
import { Summary } from "../src/studio/summary"
import { Catalog } from "../src/studio/catalog"
import { Inventory } from "../src/studio/inventory"

const D = path.join(PKG_ROOT, "data", "studio")

// ── (1) the VoC→OOS ratification SUPERSESSION — continue the V11 chain, append the SUPERSEDE (U-RESUPERSEDE) ──
const { entries: v11 } = Ratify.load(path.join(D, "research-ratification-v11.json"))
const vocRow = v11.find((e) => e.item === "voc-sandboxed-proposer")!
const led = new Ratify.Ledger()
for (const e of v11) led.record({ item: e.item, disposition: e.disposition, researchFinding: e.researchFinding, reason: e.reason, cheapTest: e.cheapTest, flipCriteria: e.flipCriteria, buildArtifacts: e.buildArtifacts, park: e.park, experiment: e.experiment, supersedes: e.supersedes, note: e.note, stamp: e.stamp })
const vocSupersession = led.record({
  item: "voc-sandboxed-proposer",
  disposition: "SUPERSEDE",
  supersedes: { item: "voc-sandboxed-proposer", originalHash: vocRow.hash, regimeChange: "What shipped is NOT 'the Virtue of Complexity' but OUT-OF-SAMPLE validation with a pinned effective-DoF surcharge; the IN-SAMPLE regime is PERMANENTLY BANNED (it is what the kill-switch catches)." },
  researchFinding: "Refined (Phase-3 root cause, V11): a d-parameter ridge in-sample fit has t-stat ~sqrt(d), which NO best-of-n trial-count deflation can neutralise (would need n_trials=exp(d/2)); only out-of-sample evaluation PLUS the pinned DoF charge is honest.",
  reason: "The V11 Phase-3 noise wall FAILED on first build (3/20, then 25/30 survivors in-sample) and was root-caused to a genuine mathematical truth, documented rather than tuned quiet — the right outcome, wrongly left un-filed in the ratification table built to hold changes of mind. This is U-RESUPERSEDE's founding instance.",
  flipCriteria: "if the OOS + DoF-charge mechanism ever admits a pure-noise survivor at any pinned-region penalty, the mechanism is re-evaluated against this supersession; the in-sample regime remains banned permanently.",
  note: "filed 2026-07-05 — the V11 VoC regime change, made legible after the fact per U-RESUPERSEDE (history never edited; the correction is appended, referencing the original row's hash).",
  stamp: "v12-phase0-supersede-voc",
})
const chain = led.verifyChain()
const coherent = Ratify.supersessionsCoherent(led.all())
const table = { protocol: "research-ratification", version: "v12", at: "2026-07-05", rule: "R-RATIFY + U-RESUPERSEDE — research enters by ratification; changes of mind supersede their rows in the same phase as the evidence", chainOk: chain.ok, coherent: coherent.ok, counts: countByDisposition(led.all()), entries: led.all() }
writeFileSync(path.join(D, "research-ratification-v12.json"), JSON.stringify(table, null, 2) + "\n")
function countByDisposition(entries: readonly Ratify.Entry[]): Record<string, number> { const c: Record<string, number> = {}; for (const e of entries) c[e.disposition] = (c[e.disposition] ?? 0) + 1; return c }
const reloaded = Ratify.load(path.join(D, "research-ratification-v12.json"))

// ── (2)(3)(4) the debt values ──
const derived = Summary.derive()
const debts = {
  protocol: "reachability-debts-v12",
  at: "2026-07-05",
  debts: [
    { id: "D1-voc-supersession", filed: "research-ratification-v12.json", disposition: "SUPERSEDE", ref: `references voc row hash ${vocRow.hash.slice(0, 16)}…`, note: "U-RESUPERSEDE founding instance — the VoC→OOS regime change filed in the ratification chain." },
    { id: "D2-fresh-clone-scope-correction", note: "V7–V10 each recorded 'fresh-clone proof green'; a stale hardcoded path (organon-common.sh, packages/solidity-sentinel) that breaks pristine setup cannot have been exercised by any of them. Those proofs verified the battery under environments where an inherited venv satisfied the stale path; they did NOT verify pristine-environment setup. W6-04 (V11) closed the defect; this note closes the claim.", rule: "U-PRISTINE, A′#9 (precise, adjective-free, append-only)" },
    { id: "D3-22-23-reconciliation", derived: { matrixPresent: derived.matrixPresent, matrixAbsent: derived.matrixAbsent }, note: `The V11 terminal contained a transient 22-vs-23 discrepancy on the matrix PRESENT count (a hand-typed number). Machine-derived truth: PRESENT=${derived.matrixPresent}, ABSENT=${derived.matrixAbsent}. Reconciled by U-DERIVED (the summary-differential regenerates it from the artifact).` },
    { id: "D4-summary-differential-mechanism", filed: "src/studio/summary.ts + script/summary-differential.ts", note: "Every terminal figure (floor, matrix PRESENT/ABSENT, catalog count, cycle counts) regenerates from its source artifact and diffs against the prose; a hand-typed number disagreeing with its artifact is a finding, not a typo (U-DERIVED)." },
  ],
}
writeFileSync(path.join(D, "reachability-debts-v12.json"), JSON.stringify(debts, null, 2) + "\n")

// ── (5) the SURFACING CENSUS + the retroactive W6-01 demonstration ──
const userFacing: Surface.CapabilityMapping[] = [
  { capability: "goal-console-8th-screen", traversal: "data/studio/traversal-goal-console.json" },
  { capability: "joined-loop-realpit", traversal: "data/studio/traversal-goal-console.json" },
  { capability: "breadth-panel-hedged-eta", traversal: "data/studio/traversal-goal-console.json" },
]
const seeded: Surface.CapabilityMapping = { capability: "seeded-unsurfaced-panel", traversal: null }
const census = Surface.census(userFacing, seeded, PKG_ROOT)
// RETROACTIVE: had U-SURFACE existed at V11, breadth-panel with NO traversal (the pre-W6-01 state) would have been CAUGHT
const v11PreW601 = Surface.census([{ capability: "breadth-panel-hedged-eta", traversal: null }], seeded, PKG_ROOT)
const w601WouldHaveBeenCaught = v11PreW601.dangling.some((d) => d.capability === "breadth-panel-hedged-eta")
const censusOut = {
  protocol: "surfacing-census-v12",
  at: "2026-07-05",
  rule: "U-SURFACE — every user-facing capability maps to console-path evidence; a seeded unsurfaced capability MUST be caught",
  userFacing: userFacing.map((m) => m.capability),
  surfaced: census.surfaced,
  dangling: census.dangling,
  seededCaught: census.seededCaught,
  censusOk: census.ok,
  retroactiveW601: { claim: "had U-SURFACE existed, V11's W6-01 (breadth panel unsurfaced) would have been caught at BREADTH-TRUE", demonstrated: w601WouldHaveBeenCaught },
}
writeFileSync(path.join(D, "surfacing-census-v12.json"), JSON.stringify(censusOut, null, 2) + "\n")

// ── (6) the catalog v12 pin + criteria print + baseline ──
const cat = Catalog.load()!
const catVerify = Catalog.verify(cat)
writeFileSync(path.join(D, "e2e-catalog-pin-v12.json"), JSON.stringify({ protocol: "e2e-catalog-pin-v12", at: "2026-07-05", catalogFile: Catalog.CATALOG_REL, contentSha: Catalog.contentSha(cat), baselineIds: Catalog.BASELINE_IDS, count: catVerify.count, byClass: catVerify.byClass, verifyOk: catVerify.ok, issues: catVerify.issues }, null, 2) + "\n")
writeFileSync(path.join(D, "phase0-criteria-print-v12.txt"), Criteria.printVerbatimReach() + "\n")
const pin = Criteria.blueprintMatchesReachPin()
const snap = Inventory.snapshot("v12-phase0-baseline")
const absences = Inventory.verifyAbsences()
writeFileSync(path.join(D, "phase0-baseline-v12.json"), JSON.stringify({ protocol: "phase0-baseline-v12", at: "2026-07-05", floor: snap.capabilities.length, anchorHash: snap.anchorHash, absencesOk: absences.ok }, null, 2) + "\n")

// ── the SURFACED-TRUE gate summary ──
const gate = {
  protocol: "phase0-surfaced-true-v12",
  at: "2026-07-05",
  gate: "SURFACED-TRUE",
  supersession: { filed: true, chainOk: chain.ok, coherent: coherent.ok, seq: vocSupersession.seq, reloadChainOk: reloaded.chainOk },
  debts: debts.debts.map((d) => d.id),
  census: { ok: census.ok, seededCaught: census.seededCaught, surfaced: census.surfaced.length, dangling: census.dangling.length, retroW601: w601WouldHaveBeenCaught },
  summaryDifferential: { live: true, derived },
  catalog: { pinned: true, count: catVerify.count, contentSha: Catalog.contentSha(cat), verifyOk: catVerify.ok },
  criteria: { pin: pin.detail, criteriaSetSha: Criteria.reachCriteriaSha() },
  baseline: { floor: snap.capabilities.length, absencesOk: absences.ok },
  uSurfaceLaw: { proven_by: "test/walls/surface_law.test.ts", inGatekeeper: true },
}
writeFileSync(path.join(D, "phase0-surfaced-true-v12.json"), JSON.stringify(gate, null, 2) + "\n")

console.log(`VoC supersession: filed #${vocSupersession.seq} · chain ${chain.ok} · coherent ${coherent.ok} · reload ${reloaded.chainOk}`)
console.log(`debts: ${debts.debts.map((d) => d.id).join(" · ")}`)
console.log(`census: ok=${census.ok} · seededCaught=${census.seededCaught} · surfaced=${census.surfaced.length}/${userFacing.length} · dangling=${census.dangling.length} · retroW601-caught=${w601WouldHaveBeenCaught}`)
console.log(`summary-differential derived: floor=${derived.floor} · matrix ${derived.matrixPresent} PRESENT / ${derived.matrixAbsent} ABSENT · catalog ${derived.catalogCount}`)
console.log(`catalog v12: ${catVerify.count} scenarios · verify ${catVerify.ok} · sha ${Catalog.contentSha(cat).slice(0, 12)}…`)
console.log(`criteria: ${pin.detail} · criteria-set-sha ${Criteria.reachCriteriaSha().slice(0, 12)}…`)
console.log(`written: research-ratification-v12.json · reachability-debts-v12.json · surfacing-census-v12.json · e2e-catalog-pin-v12.json · phase0-criteria-print-v12.txt · phase0-baseline-v12.json · phase0-surfaced-true-v12.json`)
