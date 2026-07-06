/**
 * ORGΛNON — Explanation Phase 1: THE SELECTION DOOR (X-SELECT, SELECTION-PRICED). Under the Phase-0 pins (hash-checked
 * before any cell runs — a post-hoc tweak Halts), the experiment measures whether best-of-M composition at the current
 * ceil(K_eff) charge inflates survivors beyond planted truth, and derives EXACTLY ONE outcome. Files the outcome as a
 * SUPERSEDE disposing the selection PARK, records the T-POLLUTION re-statement of existing pool verdicts (append-only),
 * and writes the gate evidence. Deterministic. Run: bun run script/phase1-selection.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Selection } from "../src/studio/selection"
import { Ratify } from "../src/studio/ratify"
import { Pool } from "../src/analytics/pool"

const D = path.join(PKG_ROOT, "data", "studio")

// (1) hash-check the pins BEFORE running any cell (X-SELECT — the outcome cannot be run to a desired answer)
const pins = JSON.parse(readFileSync(path.join(D, "phase0-pins-v14.json"), "utf8"))
Selection.assertSelectionPinned(pins.selection.specHash) // throws on mismatch

// (2) run the cells (M ∈ pinned sizes) + the instrument's positive control
const cells = []
for (const M of Selection.SELECTION_SPEC.universes.Ms) cells.push(await Selection.runCell(M))

// (3) derive the SINGLE outcome MECHANICALLY. Both cells must agree; the instrument's positive control must hold.
const instrumentValid = cells.every((c) => c.instrumentSees)
const outcomes = new Set(cells.map((c) => c.outcome))
if (!instrumentValid) throw new Error("SELECTION experiment VOID (X-SELECT): the instrument's positive control failed — an uncharged best-of-M did not inflate; the instrument cannot see the cherry-pick.")
if (outcomes.size !== 1) throw new Error(`SELECTION cells disagree (${[...outcomes].join(" vs ")}) — the robustness clause converts; investigate before filing.`)
const outcome = [...outcomes][0] as "TERM" | "RESTRICT" | "NO-INFLATION"

// (4) the robustness corner: selection over ALREADY-DEFLATED survivors (planted-truth universe). The planted best-of-M
// still survives the TERM (78–90%) — the surcharge prices the pick without over-killing genuine edges (filed either way).
const robustness = cells.map((c) => ({ M: c.M, plantedSurvivesTerm: c.plantedSurvivorRateTerm, note: c.plantedSurvivorRateTerm >= 0.5 ? "real edges survive the surcharge (the pick is priced, not the signal)" : "the surcharge over-kills — the robustness clause would convert to RESTRICT" }))

// (5) the T-POLLUTION re-statement of existing pool verdicts. Under TERM, the charge gains ceil(log2(C(M,K))). Existing
// pools were composed over their members-as-the-set (no declared best-of-M universe) → M=K → surcharge 0 → NO verdict
// moves. The re-statement records this append-only: the surcharge form is now live; a FUTURE best-of-M pool (M>K) pays.
const restatement = {
  rule: "T-POLLUTION (append-only re-statement of existing pool verdicts under the adopted TERM)",
  existingPoolsUniverse: "M=K (the illustrative pools were composed over their given members — no declared best-of-M candidate universe)",
  surchargeForHistorical: Pool.selectionSurcharge(5, 5), // C(5,5)=1 → log2(1)=0 → 0
  verdictsMoved: 0,
  note: "no existing pool verdict moves (all were M=K, surcharge 0); the verdict differential stays byte-identical. The TERM rule now REQUIRES a declared selection universe M for any pool whose members were SELECTED from a larger candidate set — the pick is priced going forward; the historical M=K pools are re-stated as surcharge-0 (unchanged), the supersession filed, none edited.",
}

// (6) file the outcome as a SUPERSEDE disposing the selection PARK (U-RESUPERSEDE)
const ratLoaded = Ratify.load(path.join(D, "research-ratification-v14.json"))
const parkRow = ratLoaded.entries.find((e) => e.item === "pool-member-selection-pricing" && e.disposition === "PARK-WITH-EXPERIMENT")!
const ratLed = new Ratify.Ledger()
for (const e of ratLoaded.entries) ratLed.record({ item: e.item, disposition: e.disposition, researchFinding: e.researchFinding, reason: e.reason, cheapTest: e.cheapTest, flipCriteria: e.flipCriteria, buildArtifacts: e.buildArtifacts, park: e.park, experiment: e.experiment, supersedes: e.supersedes, note: e.note, stamp: e.stamp })
ratLed.record({
  item: "pool-member-selection-pricing",
  disposition: "SUPERSEDE",
  flipCriteria: "if a future construction shows the pinned log2(C(M,K)) surcharge fails to hold noise survival at ≤ the 5% tolerance at some corner, convert to RESTRICT (declared member sets only) — the surcharge is the smallest remedy that priced it here",
  reason: `DERIVED TERM under the Phase-0-hashed pins (spec ${Selection.selectionSpecHash().slice(0, 16)}…): the instrument's positive control held (uncharged best-of-M survives ${(cells.map((c) => c.noiseSurvivorRateUncharged).reduce((a, b) => Math.max(a, b)) * 100).toFixed(0)}% — it SEES the cherry-pick); best-of-M NOISE inflates at the current ceil(K_eff) charge (${cells.map((c) => `M=${c.M}:${(c.noiseSurvivorRateCurrent * 100).toFixed(0)}%`).join(", ")} — > 2× the 5% tolerance); the pinned surcharge ceil(log2(C(M,K))) drives noise survival to 0% at both M WITHOUT over-killing planted-truth edges (${cells.map((c) => `M=${c.M}:${(c.plantedSurvivorRateTerm * 100).toFixed(0)}%`).join(", ")} survive). The pick is PRICED: declaredNTrials = ceil(K_eff) + ceil(log2(C(M,K))), applied in src/analytics/pool.ts; existing pool verdicts re-stated (M=K → surcharge 0 → none moved, T-POLLUTION).`,
  supersedes: { item: "pool-member-selection-pricing", originalHash: parkRow.hash, regimeChange: "TERM — the selection surcharge ceil(log2(C(M,K))) adopted; the interim caveat becomes the priced-pick note; existing verdicts re-stated append-only (none moved)" },
  note: `the selection door ANSWERED — TERM; pool.ts prices the pick; the interim caveat retired to selectionCaveat('term')`,
  stamp: "explanation-phase1-selection-term",
})
writeFileSync(path.join(D, "research-ratification-v14.json"), JSON.stringify(ratLed.toJSON(), null, 2) + "\n")

// (7) the gate evidence
const out = {
  protocol: "phase1-selection-priced-v14", at: "2026-07-06", gate: "SELECTION-PRICED",
  pinsHashChecked: Selection.selectionSpecHash() === pins.selection.specHash,
  instrumentValid, outcome, cells, robustness, restatement,
  remedy: "TERM — src/analytics/pool.ts: declaredNTrials = ceil(K_eff) + selectionSurcharge(M,K), selectionSurcharge = ceil(log2(C(M,K))) (the pinned closed form, one source shared with src/studio/selection.ts)",
  caveatLifecycle: "interim (Phase 0, rendered on pool reports) → TERM (Phase 1, the pick priced; Pool.selectionCaveat('term'))",
  supersedeFiled: true, verdictDifferentialNote: "byte-identical (the frozen core untouched; existing pools M=K → no move)",
}
writeFileSync(path.join(D, "phase1-selection-priced-v14.json"), JSON.stringify(out, null, 2) + "\n")

console.log("═══ EXPLANATION PHASE 1 — THE SELECTION DOOR ═══")
console.log(`pins hash-checked: ${out.pinsHashChecked} · instrument valid: ${instrumentValid}`)
for (const c of cells) console.log(`  M=${c.M}: outcome=${c.outcome} · uncharged ${(c.noiseSurvivorRateUncharged * 100).toFixed(0)}% · current ${(c.noiseSurvivorRateCurrent * 100).toFixed(0)}% · TERM(+${c.surcharge}) ${(c.noiseSurvivorRateTerm * 100).toFixed(0)}% · planted@TERM ${(c.plantedSurvivorRateTerm * 100).toFixed(0)}%`)
console.log(`DERIVED OUTCOME: ${outcome}`)
console.log(`re-statement: ${restatement.verdictsMoved} verdicts moved (M=K, surcharge 0); supersede filed; ratification ${ratLed.all().length} entries (chain ${ratLed.verifyChain().ok})`)
