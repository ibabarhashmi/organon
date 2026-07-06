/**
 * ORGΛNON — Ensemble Phase 0 (COMPLETE-TRUE). The reachability law gets its COMPLETENESS half and V12's debts get filed,
 * before a line of anything new is composed. Deterministic. Run: bun run script/phase0-ensemble.ts
 *
 *   (1) the pinned user-facing LEXICON auto-flags surface:true; unflag-with-reason; the audit catches a silent unflag +
 *       a dead reason; the retroactive W7-01 proof (its "renders" criterion auto-flags);
 *   (2) the one-time FULL re-census over every matrix PRESENT row + all nine screens (user-facing → a traversal that
 *       EXERCISES it, theater per mapping; infrastructure → named evidence), the seeded unsurfaced capability CAUGHT;
 *       the per-checkpoint census DIFF demonstrated;
 *   (3) the four V12 DEBTS filed as values (the builder narrowing K-SCOPE amendment · the sybil-park impact upgrade ·
 *       the pristine conditional-Py3.11 · the λ-sensitivity pin) + the K_eff formula pin;
 *   (4) the CATALOG v13 pinned BEFORE any new surface exists; the floor/absences baseline; criteria printed verbatim.
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Criteria } from "../src/studio/criteria"
import { Surface } from "../src/studio/surface"
import { Scope } from "../src/studio/scope"
import { Keff } from "../src/studio/keff"
import { Catalog } from "../src/studio/catalog"
import { Matrix } from "../src/studio/matrix"
import { Inventory } from "../src/studio/inventory"
import { app } from "./serve-studio"

const D = path.join(PKG_ROOT, "data", "studio")
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")
const stable = (v: unknown): string => v === null || typeof v !== "object" ? JSON.stringify(v) : Array.isArray(v) ? `[${v.map(stable).join(",")}]` : `{${Object.keys(v as object).sort().map((k) => `${JSON.stringify(k)}:${stable((v as any)[k])}`).join(",")}}`
const form = (o: Record<string, string>) => ({ method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(o).toString() })

// ── (0) criteria printed verbatim beside the pin ──
const print = Criteria.printVerbatimEnsemble()
writeFileSync(path.join(D, "phase0-criteria-print-v13.txt"), print + "\n")
const pinOk = Criteria.blueprintMatchesEnsemblePin()

// ── (1) THE AUTO-FLAG LAW (K-COMPLETE) ──
const audit = Object.fromEntries(Object.entries(Criteria.ENSEMBLE).map(([p, cs]) => [p, Criteria.autoFlagAudit(cs)]))
const auditClean = Object.values(audit).every((a) => a.ok)
// positive control A — a SILENT UNFLAG: a criterion that HITS the lexicon with neither surface nor reason MUST be caught
const seededSilent: Criteria.Criterion = { id: "SEED-silent", text: "the user sees the rendered pool report on the screen", gate: false }
const silentCaught = !Criteria.autoFlagAudit([seededSilent]).ok
// positive control B — a DEAD REASON: an unflagReason on a criterion that does NOT hit the lexicon is also caught
const seededDead: Criteria.Criterion = { id: "SEED-dead", text: "the ledger chain verifies on load", gate: false, unflagReason: "not user-facing" }
const deadCaught = !Criteria.autoFlagAudit([seededDead]).ok
// the RETROACTIVE W7-01 proof: V12's CPCV-tracker criterion ("renders on the pro disclosure") auto-flags — had the law
// existed, a module-only pass would have been refused (the hole that motivated the completeness half, closed by it)
const w701Text = "the CPCV promotion tracker accrues on a test adjudication + renders on the pro disclosure"
const w701Hits = Criteria.autoFlagHits(w701Text)
const w701WouldFlag = Criteria.effectiveSurface({ id: "W7-01-replay", text: w701Text, gate: false })

// ── (2) THE FULL RE-CENSUS (K-COMPLETE) over every matrix PRESENT row + all nine screens ──
// generate the DISPLAY-SCREENS traversal (GET / fresh serve → trust panel + leaderboard + forward clocks render) with a
// real failure state (POST /console/goal empty → MALFORMED) — the console-path evidence the display screens need.
const home = await app.request("/")
const homeText = await home.text()
const badGoal = await app.request("/console/goal", form({ goal: "" }))
const badGoalText = await badGoal.text()
const dashSteps: Surface.Step[] = [
  { route: "GET /", interaction: "load the dashboard from a fresh serve", expected: "the Trust Panel, Leaderboard, and Forward Clocks display screens render", met: home.status === 200 && homeText.includes("Trust Panel") && homeText.includes("Leaderboard") && homeText.includes("Forward Clocks"), evidence: `status ${home.status}; contains Trust Panel + Leaderboard + Forward Clocks` },
  { route: "GET /", interaction: "read the capability matrix + the empty-of-GO leaderboard", expected: "the leaderboard shows EMPTY OF GO (the correct launch state); the matrix renders advertised==actual", met: home.status === 200 && homeText.includes("EMPTY OF GO"), evidence: `status ${home.status}; contains EMPTY OF GO` },
]
const dashFailure: Surface.Step = { route: "POST /console/goal", interaction: "submit an empty goal from the dashboard form", expected: "a MALFORMED-GOAL honest state renders; nothing registered; no fabricated verdict", met: badGoal.status === 200 && badGoalText.includes("MALFORMED-GOAL") && !badGoalText.includes("VERDICT:"), evidence: `status ${badGoal.status}; MALFORMED-GOAL, no VERDICT` }
const dashArtifact = Surface.makeTraversal({ capability: "display-screens (trust panel · leaderboard · forward clocks)", freshServe: true, steps: dashSteps, failureState: dashFailure, at: "2026-07-05" })
writeFileSync(path.join(D, "traversal-dashboard-v13.json"), JSON.stringify({ ...dashArtifact, contentSha: Surface.contentSha(dashArtifact), verify: Surface.verifyTraversal(dashArtifact) }, null, 2) + "\n")

// the mapping from a matrix `provedBy` id → its census category. USER-FACING ids map to a traversal that genuinely
// EXERCISES them (many-to-one is honest when the traversal really shows it); INFRASTRUCTURE ids carry named test
// evidence (they have no screen — the user relies on their correctness, they do not operate them).
const GOAL_TRAV = "data/studio/traversal-goal-console.json"
const BUILDER_TRAV = "data/studio/traversal-guided-builder.json"
const DASH_TRAV = "data/studio/traversal-dashboard-v13.json"
const CENSUS_MAP: Record<string, { kind: "user-facing" | "infrastructure"; traversal: string | null; evidence: string }> = {
  "goal-console-8th-screen": { kind: "user-facing", traversal: GOAL_TRAV, evidence: "the goal-console traversal (type a goal → verdict card + report)" },
  "joined-loop-realpit": { kind: "user-facing", traversal: GOAL_TRAV, evidence: "the goal-console traversal (the joined loop renders the REAL-PIT verdict + report)" },
  "breadth-panel-hedged-eta": { kind: "user-facing", traversal: GOAL_TRAV, evidence: "the goal-console traversal renders WHY NOT YET + WHEN HONESTLY (the hedged ETA)" },
  "guided-builder-reachable": { kind: "user-facing", traversal: BUILDER_TRAV, evidence: "the guided-builder traversal (compose a spec → verdict + panels)" },
  "reachability-surface-law": { kind: "user-facing", traversal: DASH_TRAV, evidence: "the census itself + the traversal artifacts — the law rendered as the surfacing census" },
  "tier-caps-earned": { kind: "user-facing", traversal: GOAL_TRAV, evidence: "the verdict card (tier before GO) renders in the goal + builder traversals" },
  "family-deflation-anti-pbo": { kind: "user-facing", traversal: GOAL_TRAV, evidence: "the rigor panel (family + root count) renders in the goal traversal" },
  // infrastructure — no screen; evidenced by the proving battery (the census declares this explicitly, never silently)
  "ledger-core-hashchain": { kind: "infrastructure", traversal: null, evidence: "ledger append-only + chain-verify tests (the user relies on it; does not operate it)" },
  "frozen-core-byte-identity": { kind: "infrastructure", traversal: null, evidence: "test/walls/core_byte_identity.test.ts (byte-identity, not a screen)" },
  "determinism-at-surfaces": { kind: "infrastructure", traversal: null, evidence: "determinism-across-surfaces tests (direct/HTTP/MCP byte-identical)" },
  "durable-write-then-invoke": { kind: "infrastructure", traversal: null, evidence: "durable write-then-invoke + restart-survival tests" },
  "served-persistence-survival": { kind: "infrastructure", traversal: null, evidence: "served-persistence restart-survival tests" },
  "clocks-restart-not-reconstruct": { kind: "infrastructure", traversal: DASH_TRAV, evidence: "the Forward Clocks display renders on the dashboard traversal (a restarted clock's discontinuity)" },
  "rejection-boundary-refusal": { kind: "infrastructure", traversal: null, evidence: "the must-reject corpus (refused before registration; the failure states ARE traversal-shown in A2/S10)" },
  "no-signing-surface": { kind: "infrastructure", traversal: null, evidence: "the no-signing grep-wall (an absence, proven by construction)" },
  "ci-fixture-only": { kind: "infrastructure", traversal: null, evidence: "the fixture-only battery (no powered verdicts in the path)" },
  "pit-store-no-fabrication": { kind: "infrastructure", traversal: null, evidence: "the PIT-store nonce/chain tests + leak wall" },
  "engine-port-differential": { kind: "infrastructure", traversal: null, evidence: "the lending differential (byte-equivalent to the oracle)" },
  "real-returns-realpit": { kind: "infrastructure", traversal: GOAL_TRAV, evidence: "REAL-PIT provenance renders on the goal traversal's report" },
  "transform-differential-proven": { kind: "infrastructure", traversal: null, evidence: "the transform sandbox differential (byte-identical to the original)" },
  "funding-port-differential": { kind: "infrastructure", traversal: null, evidence: "the funding freepit T1 differential" },
  "research-ratification-law": { kind: "infrastructure", traversal: null, evidence: "the ratification wall (research enters by ratification; a governance law, not a screen)" },
  "cpcv-advisory-panel": { kind: "infrastructure", traversal: null, evidence: "the CPCV golden-pair tests + the pro-disclosure (rendered on an audit toggle, catalog S3/S4)" },
  "voc-proposer-dof-priced": { kind: "infrastructure", traversal: null, evidence: "the noise wall + the DoF charge on the VoC report (catalog S5/S6)" },
  "funding-basis-min-tier": { kind: "infrastructure", traversal: null, evidence: "the MIN-tier wall + basis fixture (rendered on a basis goal, catalog S7)" },
  "experiments-answered": { kind: "infrastructure", traversal: null, evidence: "the disposed experiment values (catalog S12; a governance record)" },
  "capture-floor-pristine": { kind: "infrastructure", traversal: null, evidence: "the capture-floor wall + the pristine harness (catalog S13)" },
  "summary-differential": { kind: "infrastructure", traversal: null, evidence: "the summary-differential mechanism (machine-derived terminal numbers)" },
}
// the census entries: every matrix PRESENT row (by its provedBy id) + every screen
const screenEntries: Surface.FullCensusEntry[] = []
const matrixEntries: Surface.FullCensusEntry[] = Matrix.PRESENT.map((p) => {
  const m = CENSUS_MAP[p.provedBy] ?? { kind: "infrastructure" as const, traversal: null, evidence: `proven by ${p.provedBy} (no dedicated census mapping — treated as infrastructure)` }
  return { capability: `matrix:${p.provedBy}`, kind: m.kind, traversal: m.traversal, evidence: m.evidence }
})
// the nine screens → the traversal (or dashboard) that renders each
const SCREEN_TRAV: Record<string, string> = {
  verdictCard: GOAL_TRAV, rigorPanel: GOAL_TRAV, breadthMap: GOAL_TRAV, forwardClocks: DASH_TRAV,
  leaderboard: DASH_TRAV, report: GOAL_TRAV, trustPanel: DASH_TRAV, goalConsole: GOAL_TRAV, guidedBuilder: BUILDER_TRAV,
}
const screensList = ["verdictCard", "rigorPanel", "breadthMap", "forwardClocks", "leaderboard", "report", "trustPanel", "goalConsole", "guidedBuilder"]
for (const s of screensList) screenEntries.push({ capability: `screen:${s}`, kind: "user-facing", traversal: SCREEN_TRAV[s], evidence: `screen ${s} rendered by ${SCREEN_TRAV[s].split("/").pop()}` })
const allEntries = [...matrixEntries, ...screenEntries]
// the seeded unsurfaced capability — a REAL user-facing capability deliberately given NO traversal (must be caught)
const seededCap: Surface.FullCensusEntry = { capability: "SEED-unsurfaced (a real user-facing capability with no traversal)", kind: "user-facing", traversal: null, evidence: "deliberately none — the census's positive control" }
const full = Surface.fullCensus(allEntries, seededCap, PKG_ROOT)

// the per-checkpoint census DIFF: V12 surfaced 3 capabilities; the full list is the diff since then (the newly-entered
// capabilities must be surfaced or declared infrastructure — the W7-01 class extinct)
const v12Surfaced = ["goal-console", "guided-builder", "reachability-surface-law"]
const diff = Surface.censusDiff(v12Surfaced.map((c) => `screen:${c}`), allEntries, PKG_ROOT)

// ── (3) THE DEBTS + PINS ──
// 3a — the K-SCOPE founding amendment (the V12 builder lending-only narrowing, retro-filed)
const scopeLedger = new Scope.Ledger()
scopeLedger.record({
  feature: "guided-builder",
  blueprintScope: "the ratified three domains — lending · funding · basis (the Guided Builder composes over every delivered primitive)",
  deliveredScope: "lending only (V12 Phase 3 shipped the builder over the lending primitive alone)",
  reason: "V12 delivered a walking-skeleton builder (one domain, born under U-SURFACE) and did not widen it to the three-domain scope, silently — a narrower delivery is honorable, the SILENCE about it is the violation this law retires (K-SCOPE). The narrowing is named now, retro-filed, dated, append-only.",
  ownerPhase: "Ensemble Phase 0 (retro-file); cure in Ensemble Phase 2",
  cure: "Ensemble Phase 2 (BUILDER-WHOLE) completes the builder to funding + basis under the identical discipline",
  retroFiled: true,
  stamp: "v13-phase0-scope-builder-narrowing",
})
writeFileSync(path.join(D, "scope-amendments-v13.json"), JSON.stringify(scopeLedger.toJSON(), null, 2) + "\n")
const scopeReload = Scope.load(path.join(D, "scope-amendments-v13.json"))

// 3b — the sybil-park impact upgrade (verify the register now carries the measured numbers)
const parks = JSON.parse(readFileSync(path.join(D, "parks-register.json"), "utf8")) as { parks: any[] }
const sybilPark = parks.parks.find((p) => p.id.includes("full sybil economics"))
const sybilUpgraded = !!sybilPark?.measuredExposure && sybilPark.measuredExposure.launderedPerAuthorDsr === 0.928 && sybilPark.measuredExposure.unifiedDsr === 0.310

// 3c — the pristine prerequisite amendment (verify the enumeration now names conditional Python 3.11)
const pristineSrc = readFileSync(path.join(PKG_ROOT, "script", "pristine-clone.ts"), "utf8")
const pristineAmended = pristineSrc.includes("python3.11") && pristineSrc.includes("conditional") && pristineSrc.includes("PARKED fee-yield")

// 3d — the λ-sensitivity pin (the weak-real-edge effect size pinned NOW so Phase 1 cannot tune it)
const lambdaSensitivity = {
  construction: "target_t = signalCoef · base_t[signalDim] + N(0, targetNoise) — a weak-but-REAL linear edge the OOS ridge can partially recover through the random Fourier features; the sweep must DETECT it (a max-DSR distinguishable from the pure-noise ≈0.000, confirming the sweep HAS resolution) or state its limits plainly (the max-DSR-exactly-0.000 ambiguity resolved either way)",
  signalCoef: 0.35, signalDim: 0, baseDim: 3, nObs: 600, featureCount: 40, seeds: 12, targetNoise: 0.01, penalties: [0.1, 1.0, 10.0],
  note: "pinned in Phase 0 (K-PRECOND/A′#8) BEFORE Phase 1 runs the control — the effect size cannot be tuned until the sweep sees it",
}
// 3e — the pool cell constructions pinned (the middle + stress cells' pre-pinned constructions)
const poolCells = {
  K: 5, N: 400,
  rhos: [0.3, 0.6],
  genuineEdgePerBar: 0.0016, // each member INSUFFICIENT alone; the diversified pool reaches power ONLY at the K_eff charge
  marginalEdgePerBar: 0.0006, // the launder pool: passes the naive n=1, must FAIL the honest K_eff charge
  noiseSd: 0.01,
  stress: { preRho: 0.2, postRho: 0.95, jumpAtFrac: 0.5, note: "correlations jump toward 1 mid-series (the Oct/Nov-2025 lesson in synthetic form); recomputed K_eff must collapse toward 1 and pooled power evaporate honestly" },
  note: "pre-pinned constructions (K-PRECOND); Phase 1 hash-checks this pin before running any cell; a post-hoc construction tweak is caught",
}
const keffPin = { mappingSpec: Keff.POOL_KEFF_MAPPING_SPEC, mappingHash: Keff.keffMappingHash() }
const pins = { protocol: "ensemble-phase0-pins", at: "2026-07-05", keff: keffPin, lambdaSensitivity, poolCells }
const pinsSha = sha256(stable(pins))
writeFileSync(path.join(D, "phase0-pins-v13.json"), JSON.stringify({ ...pins, pinsSha }, null, 2) + "\n")

const debts = {
  protocol: "ensemble-debts-v13", rule: "K-SCOPE + K-PRECOND (V12 debts filed as append-only values)", at: "2026-07-05",
  builderNarrowing: { filed: scopeReload.chainOk && scopeReload.entries.length === 1, amendment: scopeReload.entries[0], evidence: "scope-amendments-v13.json" },
  sybilImpactUpgrade: { filed: sybilUpgraded, measuredExposure: sybilPark?.measuredExposure, evidence: "parks-register.json (INHERITED — full sybil economics)" },
  pristinePrereqAmendment: { filed: pristineAmended, evidence: "script/pristine-clone.ts (conditional python3.11 for the parked unblocks)" },
  lambdaSensitivityPin: { filed: true, evidence: "phase0-pins-v13.json (lambdaSensitivity)" },
  keffFormulaPin: { filed: true, mappingHash: keffPin.mappingHash, evidence: "phase0-pins-v13.json (keff) + src/studio/keff.ts" },
}
writeFileSync(path.join(D, "ensemble-debts-v13.json"), JSON.stringify(debts, null, 2) + "\n")

// ── (4) THE CATALOG v13 (carry v12's 29 + S15-S21) pinned BEFORE any new surface exists ──
const v12cat = JSON.parse(readFileSync(path.join(D, "e2e-catalog-v12.json"), "utf8")) as Catalog.CatalogFile
const newScenarios: Catalog.Scenario[] = [
  { id: "S15-pool-compose-happy", persona: "composer", class: "realistic", door: "UI", workflow: "opens the Pool Composer (screen 10), selects several adjudicated member specs, composes the pool, and reads the union family + the K_eff charge + the stress caveat on the pool report", expected: "the pool registers as a trial with family = the members' UNION at the pinned K_eff charge (ceil(K/(1+(K-1)·ρ̄))); the frozen core adjudicates the pooled series; the K_eff, the union family size, and the mandatory stress caveat all render; the deflation basis (n · scoping · a neutral comparability note) renders; the console derives nothing; a NO-GO is framed as the product working" },
  { id: "S16-pool-overcorrelated-honest", persona: "composer", class: "adversarial", door: "UI", workflow: "composes an OVER-CORRELATED pool (near-duplicate members / one edge cloned) whose K_eff ≈ 1", expected: "the report renders 'this pool adds nothing beyond its strongest member' plainly (K_eff≈1, charge≈1) WITHOUT refusing composition — the honest failure state; the pool cannot flatter its members; the legibility surface shows the low K_eff and its scoping" },
  { id: "S17-member-swap-stiffens", persona: "composer", class: "adversarial", door: "UI", workflow: "iteratively swaps pool members toward a flattering pool, watching the family count", expected: "each member swap declares lineage and VISIBLY stiffens the family (n rises with each edit, never resets — the red-team's signature laundering scenario defeated); the K_eff recomputation punishes convenient low-correlation windows; convenient correlations cannot survive contact with time" },
  { id: "S18-builder-funding", persona: "composer", class: "realistic", door: "UI", workflow: "composes a funding-carry spec in the Guided Builder (venue/interval/side) using only the field help, submits, and reads the verdict", expected: "the funding schema composes a schema-valid spec over the delivered funding primitives; conservative ratified defaults; the help is honesty-checked (no priming); submission goes through the identical write-then-invoke gate; a verdict + panels render; an invalid interval is refused honestly (the failure state)" },
  { id: "S19-builder-basis-min-tier", persona: "composer", class: "realistic", door: "UI", workflow: "composes a CeFi-DeFi basis spec in the builder and checks the MIN-tier + EXPERIMENTAL are visible IN-FORM before composing", expected: "the basis schema surfaces the weakest leg's tier (MIN(legs)) and the EXPERIMENTAL label INLINE in the form (before composing, not after); the per-leg tiers render on the verdict; a mismatched-venue pair is refused honestly; a T1 label on the basis series is impossible (the MIN-tier wall)" },
  { id: "S20-legibility-neutral", persona: "auditor", class: "realistic", door: "UI", workflow: "reads the deflation-basis legibility note on a verdict, a leaderboard row, and a pool report", expected: "each renders n (the deflated trial count), the scoping that produced it, and a NEUTRAL comparability note — no shaming, no rankings-by-virtue, no accusation; it STATES the basis, it never judges; a weakly-tested bar is legible to anyone reading it; the copy passes the ux-priming honesty check" },
  { id: "S21-lambda-sensitivity", persona: "auditor", class: "edge", door: "CLI", workflow: "runs the λ-sensitivity control (the pre-pinned weak-real-edge cell through the noise sweep) and checks the sweep has resolution", expected: "the sweep either DETECTS the pinned weak-real edge (a max-DSR distinguishable from the pure-noise ≈0.000 — confirming the sweep can see a real signal, so the noise wall's zeros are robustness, not blindness) or states its limits plainly; the effect size was pinned in Phase 0 so the control cannot be tuned; the answer is filed either way" },
]
const v13cat: Catalog.CatalogFile = {
  protocol: "e2e-scenario-catalog", version: "v13", pinnedAt: "2026-07-05",
  note: "PRE-REGISTERED before any Phase-1..4 ensemble surface existed (E-CATALOG, Ensemble Phase 0). Carries v12's 29 verbatim + seven new-surface scenarios (the pool composer happy/over-correlated/member-swap · the builder funding + basis · the legibility neutrality · the λ-sensitivity control). A CLEAN walk cycle traverses in FULL through all doors incl. the pool composer; a scenario fails by SUCCEEDING WRONGLY. Red-team may APPEND; nothing may be REMOVED (the cross-generation baseline in src/studio/catalog.ts enforces anti-removal).",
  doors: ["UI (Goal Console · Guided Builder · Pool Composer)", "HTTP (/studio API)", "CLI (verify-v3 / scripts)"],
  scenarios: [...v12cat.scenarios, ...newScenarios],
}
writeFileSync(path.join(D, "e2e-catalog-v13.json"), JSON.stringify(v13cat, null, 2) + "\n")
const catVerify = Catalog.verify(v13cat)
const catSha = Catalog.contentSha(v13cat)
writeFileSync(path.join(D, "e2e-catalog-pin-v13.json"), JSON.stringify({ protocol: "e2e-catalog-pin", version: "v13", pinnedAt: "2026-07-05", contentSha: catSha, count: catVerify.count, byClass: catVerify.byClass, baselineIds: Catalog.BASELINE_IDS, note: "the content-sha pin, recorded BEFORE any new surface exists (E-CATALOG)" }, null, 2) + "\n")

// ── (5) THE FLOOR / ABSENCES BASELINE ──
const invSnap = Inventory.snapshot("v13-phase0")
const matrixReality = Matrix.verifyAgainstReality()
const baseline = {
  protocol: "ensemble-phase0-baseline", at: "2026-07-05",
  floor: invSnap.capabilities.length, anchor: invSnap.anchorHash,
  absences: Inventory.ABSENCES.map((a) => a.id), matrixPresent: Matrix.PRESENT.length, matrixReality: matrixReality.ok,
}
writeFileSync(path.join(D, "phase0-baseline-v13.json"), JSON.stringify(baseline, null, 2) + "\n")

// ── AGGREGATE — the COMPLETE-TRUE gate evidence ──
const out = {
  protocol: "phase0-complete-true-v13", at: "2026-07-05", gate: "COMPLETE-TRUE",
  blueprintPin: pinOk, criteriaSetSha: Criteria.ensembleCriteriaSha(), lexiconSha: Criteria.surfaceLexiconSha(),
  autoFlag: { auditClean, silentUnflagCaught: silentCaught, deadReasonCaught: deadCaught, w701: { text: w701Text, hits: w701Hits, wouldAutoFlag: w701WouldFlag } },
  fullCensus: { surfaced: full.surfaced.length, infrastructure: full.infrastructure.length, dangling: full.dangling, seededCaught: full.seededCaught, infraWithoutEvidence: full.infraWithoutEvidence, ok: full.ok },
  censusDiff: { newCapabilities: diff.newCapabilities.length, newlySurfaced: diff.newlySurfaced.length, newlyInfrastructure: diff.newlyInfrastructure.length, newlyDangling: diff.newlyDangling, ok: diff.ok },
  debts: { builderNarrowing: debts.builderNarrowing.filed, sybilImpactUpgrade: debts.sybilImpactUpgrade.filed, pristinePrereq: debts.pristinePrereqAmendment.filed, lambdaSensitivity: true, keffFormulaPin: keffPin.mappingHash },
  catalog: { version: "v13", count: catVerify.count, ok: catVerify.ok, contentSha: catSha, byClass: catVerify.byClass },
  baseline: { floor: baseline.floor, matrixPresent: baseline.matrixPresent, matrixReality: baseline.matrixReality },
  pinsSha,
}
writeFileSync(path.join(D, "phase0-complete-true-v13.json"), JSON.stringify(out, null, 2) + "\n")

// write the FULL census artifact
writeFileSync(path.join(D, "surfacing-census-v13.json"), JSON.stringify({ protocol: "surfacing-census", version: "v13", at: "2026-07-05", rule: "K-COMPLETE (the full re-census + the per-checkpoint diff)", full, diff, dashboardTraversal: "traversal-dashboard-v13.json" }, null, 2) + "\n")

// ── console summary ──
console.log("═══ ENSEMBLE PHASE 0 — COMPLETE-TRUE ═══")
console.log(`blueprint pin: ${pinOk.present ? (pinOk.ok ? "MATCH" : "MISMATCH") : "absent(fresh-clone)"} · criteria-set ${Criteria.ensembleCriteriaSha().slice(0, 12)}… · lexicon ${Criteria.surfaceLexiconSha().slice(0, 12)}…`)
console.log(`auto-flag: audit clean=${auditClean} · silent-unflag caught=${silentCaught} · dead-reason caught=${deadCaught} · W7-01 auto-flags=${w701WouldFlag} (hits: ${w701Hits.join(",")})`)
console.log(`FULL re-census: ${full.surfaced.length} surfaced · ${full.infrastructure.length} infrastructure · ${full.dangling.length} dangling · seededCaught=${full.seededCaught} · ok=${full.ok}`)
console.log(`census DIFF: ${diff.newCapabilities.length} new · ${diff.newlySurfaced.length} newly-surfaced · ${diff.newlyInfrastructure.length} newly-infra · ${diff.newlyDangling.length} dangling · ok=${diff.ok}`)
console.log(`debts: builder-narrowing=${debts.builderNarrowing.filed} · sybil-upgrade=${sybilUpgraded} · pristine-prereq=${pristineAmended} · λ-pin=filed · K_eff pin=${keffPin.mappingHash.slice(0, 12)}…`)
console.log(`catalog v13: ${catVerify.count} scenarios · ok=${catVerify.ok} · sha ${catSha.slice(0, 12)}… · byClass ${JSON.stringify(catVerify.byClass)}`)
console.log(`baseline: floor=${baseline.floor} · matrix PRESENT=${baseline.matrixPresent} · matrix-reality-ok=${baseline.matrixReality}`)
const gateOk = auditClean && silentCaught && deadCaught && w701WouldFlag && full.ok && diff.ok && debts.builderNarrowing.filed && sybilUpgraded && pristineAmended && catVerify.ok && baseline.matrixReality
console.log(`COMPLETE-TRUE gate: ${gateOk ? "✅ satisfiable" : "❌ NOT satisfiable"}`)
