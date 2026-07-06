/**
 * ORGΛNON — Spine Phase 0 evidence (Rules R-RATIFY, E-CATALOG, R-DOF, C-RECON2). Research becomes constitution here or
 * not at all. Generates the Phase-0 artifacts the gatekeeper pins:
 *   (1) the RESEARCH RATIFICATION table — every adoption/park/rejection a value with flip-criteria; ADOPT rows cite
 *       their research finding + cheap test + build artifacts; PARK rows carry the four fields + a designed experiment;
 *       REJECT rows carry their reason + flip-criteria — hash-chained, refused by the value schema if illegal;
 *   (2) the VoC effective-DoF charge mapping SPEC + its sha256, PINNED NOW (pre-first-run) inside the ratification value
 *       so Phase 3 cannot post-hoc adjust it (R-DOF) — Phase 3 recomputes sha256(spec) and asserts the match;
 *   (3) the catalog v11 pin + verify (pre-registered BEFORE any spine surface exists);
 *   (4) the criteria printed VERBATIM beside the blueprint pin; the floor/absences baseline.
 * Deterministic + idempotent (the table is rebuilt fresh each run). Run: bun run script/phase0-spine.ts
 */
import { createHash } from "node:crypto"
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Criteria } from "../src/studio/criteria"
import { Ratify } from "../src/studio/ratify"
import { Catalog } from "../src/studio/catalog"
import { Inventory } from "../src/studio/inventory"

const D = path.join(PKG_ROOT, "data", "studio")
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

// ── (2) the VoC DoF charge mapping, PINNED pre-first-run (R-DOF) — the exact spec Phase 3's voc.ts must reproduce ──
export const DOF_MAPPING_SPEC =
  "VoC effective-DoF charge mapping (pinned pre-first-run, R-DOF): dofCharge = ceil( Σ_i s_i^2 / (s_i^2 + lambda) ) " +
  "where s_i are the singular values of the COLUMN-STANDARDISED random-feature matrix X ∈ R^{n×p}; ridge penalty " +
  "lambda = 1.0 on standardised features; the charge enters the frozen deflation via declaredNTrials = " +
  "max(dofCharge, familySize, rootCount); conservative — a CEILING, never a floor. Selection rule: the noise wall must " +
  "hold (ZERO deflation survivors across the seed battery) at the pinned lambda AND its neighbours; any penalty that " +
  "yields a noise survivor is BANNED. If the wall cannot hold, the proposer does not ship (STOP, pre-authorised)."
const DOF_MAPPING_HASH = sha256(DOF_MAPPING_SPEC)

// ── (1) the RESEARCH RATIFICATION table ──
const led = new Ratify.Ledger()

// ADOPT (5)
led.record({
  item: "breadth-panel",
  disposition: "ADOPT",
  researchFinding: "Both research passes concluded CPCV + Fundamental-Law breadth accounting should become the analytical spine, and that the single largest unmet legibility need is a refusal that explains itself (why not yet) and dates itself honestly (when).",
  reason: "The Fundamental Law (IR = IC × √BR × TC) decomposes any strategy's evidence into skill, independent bets, and implementation transfer — making a refusal legible to a non-expert for the first time; the ETA answers 'when' as a derived, hedged range, never a promise.",
  cheapTest: "synthetic strategies with KNOWN IC/BR/TC are recovered by the panel within a pinned tolerance, and the ETA formula is hand-verified first-principles (IC, BR, the frozen gate thresholds → observation count → calendar range at the domain cadence) BEFORE any real strategy sees the panel.",
  flipCriteria: "if the decomposition cannot recover known IC/BR within the pinned tolerance, or the ETA cannot be rendered as an honest hedged range (a point estimate is a failure), the panel is re-parked with the evidence; if any breadth/ETA number is ever shown to move a verdict, R-ADVISORY is violated and the panel is pulled.",
  buildArtifacts: ["src/analytics/breadth.ts"],
  stamp: "v11-phase0-ratify-breadth",
})
led.record({
  item: "cpcv-advisory",
  disposition: "ADOPT",
  researchFinding: "The research named combinatorially-purged cross-validation (CPCV) the strongest available answer to 'how overfit is this, really', and recommended it as the second half of the analytical spine — advisory, beside the frozen gates.",
  reason: "CPCV measures overfitting a second, independent way (PBO + the OOS-Sharpe distribution); rendered beside the frozen DSR/PBO, disagreements become information. It advises; the frozen gate still decides.",
  cheapTest: "the GOLDEN PAIR both directions BEFORE any real strategy sees the panel: a known-overfit (parameter-mined) synthetic flags HIGH on PBO-CPCV; a known-signal (planted honest effect) synthetic passes.",
  flipCriteria: "if a golden fails either direction, the panel is refused; promotion to GATING power requires the pre-registered promotion criteria (agreement/disagreement rates vs the frozen gates over N real adjudications) AND an owner decision — never this sprint (advisory-first is the point).",
  buildArtifacts: ["src/analytics/cpcv.ts"],
  stamp: "v11-phase0-ratify-cpcv",
})
led.record({
  item: "voc-sandboxed-proposer",
  disposition: "ADOPT",
  researchFinding: "The research admitted the Kelly Virtue-of-Complexity thesis ONLY as a sandboxed proposer (its core-redesign form rejected on the Nagel momentum-artifact critique and on moat grounds), with effective degrees of freedom as its honest trial charge.",
  reason: "A ridge/random-features proposer may bring a thousand features, but its ledger charge is its effective degrees of freedom under a pinned penalty — the only platform where a model's parameters are a cost it pays, not a trick it hides. The mapping is pinned pre-first-run; the noise wall is permanent. " +
    `MAPPING PINNED (sha256=${DOF_MAPPING_HASH}): ${DOF_MAPPING_SPEC}`,
  cheapTest: "the HARDEST wall first: pure NOISE features through the full path (generation → ridge fit at the pinned penalty → proposal → write-then-invoke at the pinned DoF charge → the frozen deflation) across many seeds yield ZERO survivors; the kill-switch (proposer class disabled) is proven by a seeded survivor; re-run at multiple penalties, any that yields a survivor is banned.",
  flipCriteria: "if any pinned-region penalty yields a noise survivor, that setting is banned and the mechanism re-evaluated against this row; if the noise wall cannot be made to hold, the proposer DOES NOT SHIP (a STOP that ships Phases 1/2/4 without it is pre-authorised, A′#12); any uncharged exploration path reverses the adoption.",
  buildArtifacts: ["src/proposers/voc.ts"],
  note: `DoF mapping hash pinned pre-first-run: ${DOF_MAPPING_HASH}`,
  stamp: "v11-phase0-ratify-voc",
})
led.record({
  item: "funding-basis-domain",
  disposition: "ADOPT",
  researchFinding: "The research flagged the CeFi-DeFi funding basis (Ethena-scale flows, Pendle Boros-class instruments live as of mid-2026) as the highest-value next primitive — the first cross-venue domain.",
  reason: "The basis joins a CeFi leg (Binance immutable checksummed dumps, T1) and a DeFi leg (Hyperliquid free public funding, T2-forward from first capture); the basis series' tier = MIN(legs), labeled everywhere. Additive like every domain before it (the frozen seven untouched).",
  cheapTest: "the Hyperliquid public funding endpoint probed (free, keyless), and a first-principles hand-verified basis fixture reproduced BYTE-FOR-BYTE by the pipeline (no oracle exists for this domain — the V9 known-fixture discipline).",
  flipCriteria: "a basis tier above MIN(legs), or a retro-claimed Hyperliquid 'history', reverses the delivery; if no leg can be captured at an honest tier after a second differently-shaped attempt, the domain is BLOCKED-with-evidence (the ATTEMPT law), never a silent defer.",
  buildArtifacts: ["src/dataplane/hyperliquid.ts", "src/dataplane/basis.ts"],
  stamp: "v11-phase0-ratify-basis",
})
led.record({
  item: "pro-disclosure-toggle",
  disposition: "ADOPT",
  researchFinding: "The research resolved the two-audience problem as progressive disclosure over ONE shared strategy representation, not two products — a toggle exposing raw panels on the existing screens.",
  reason: "A single toggle on the existing report/rigor screens exposes the raw panels (IC/BR/TC, DSR/PBO, CPCV-when-present) for the pro user; the non-expert sees the plain-language report. One representation, two depths — display-only, deriving nothing, the screen count unchanged at 8.",
  cheapTest: "the toggle exposes ALREADY-COMPUTED panels and derives no new number; SCREENS.length stays 8 (the toggle is an extension of existing screens, not a ninth).",
  flipCriteria: "if progressive disclosure requires deriving a new number at the toggle, or a ninth screen, it is re-parked (E-CONSOLE, A′#8); a toggle that derives anything is caught.",
  buildArtifacts: ["src/studio/screens.ts", "src/studio/report.ts"],
  stamp: "v11-phase0-ratify-toggle",
})

// PARK-WITH-EXPERIMENT (4)
led.record({
  item: "portfolio-of-strategies-ensemble",
  disposition: "PARK-WITH-EXPERIMENT",
  flipCriteria: "adopt only if the synthetic experiment shows pooling across INSUFFICIENT strategies is legitimate evidence-pooling (not deflation-laundering) under the pre-registered criterion; otherwise it stays parked or is rejected.",
  park: {
    context: "Combining N INSUFFICIENT strategies into one 'powered' portfolio is tempting; the research flagged it as possibly deflation-laundering rather than legitimate evidence-pooling. Repro: an ensemble surface does not exist and must not be built before the experiment answers (building it first is a Halt, A′#7).",
    rationale: "The legitimacy is an empirical question with a knowable answer; it must be answered by a designed experiment, not asserted.",
    impact: "Until answered, no ensemble/portfolio pooling surface ships; the family-honest ledger stays the only aggregation.",
    nextSteps: "Run the designed experiment; on a legitimate result, design the pooling surface in a dedicated sprint with the coherence guarantees; owner: a dedicated ensemble sprint.",
  },
  experiment: {
    hypothesis: "Pooling K strategies each INSUFFICIENT-but-real, with known pairwise correlation ρ, yields a portfolio whose deflated evidence is legitimately stronger IFF the pooling accounts for ρ in the effective trial count.",
    method: "Generate K synthetic strategies with a planted small edge and controlled ρ; pool them; adjudicate the pool through the frozen deflation with (a) naive n_trials and (b) correlation-adjusted n_trials; compare survivor rates against a pure-noise pool at the same ρ.",
    preRegisteredOutcome: "If the correlation-adjusted pool passes while the noise pool does not AND the naive pool laundering is detectable, pooling is legitimate (adopt with the adjustment); if the noise pool ever passes, pooling is deflation-laundering (reject).",
  },
  stamp: "v11-phase0-park-ensemble",
})
led.record({
  item: "shared-multiuser-ledger-tournament",
  disposition: "PARK-WITH-EXPERIMENT",
  flipCriteria: "adopt only after BOTH the statistical-coherence experiment passes AND a genuine non-author stranger has acted (L-2P); single-tenant season/tournament scaffolding may be added ONLY if trivially additive, else it stays parked (A′#11).",
  park: {
    context: "The moat's endgame is a shared family ledger / tournament across users. Repro: no multi-user ledger exists; it cannot skip its two prerequisites (coherence + the still-missing stranger).",
    rationale: "Cross-user deflation coherence is unproven, and Tier-A independence still waits for a genuine stranger; shipping the endgame before either is manufacturing the moat.",
    impact: "Until both clear, the ledger stays single-tenant; independence renders PENDING wherever no stranger acted.",
    nextSteps: "Run the coherence experiment; hold DOORS-OPEN for a genuine stranger; then design the shared ledger in a dedicated sprint; owner: the Operator (the stranger) + a dedicated tournament sprint.",
  },
  experiment: {
    hypothesis: "A family ledger shared across users preserves deflation coherence (an author cannot launder their search by distributing it across identities) IFF the per-author root-count and the global family size both bound the honest n_trials.",
    method: "Simulate M authors submitting correlated searches under a shared ledger; measure whether the deflated verdict for a laundered search (split across identities) matches the deflated verdict for the same search under one identity.",
    preRegisteredOutcome: "If the laundered and unified verdicts match (coherence holds), adopt the shared-ledger design; if a laundered search ever earns a weaker deflation than the unified one, the shared ledger is incoherent and stays parked.",
  },
  stamp: "v11-phase0-park-tournament",
})
led.record({
  item: "hrp-portfolio-construction",
  disposition: "PARK-WITH-EXPERIMENT",
  flipCriteria: "adopt only if HRP dominates equal-weight and min-variance OUT-OF-SAMPLE on our own crypto fixtures; the research's mixed crypto evidence must resolve in our fixtures, not by citation.",
  park: {
    context: "Hierarchical Risk Parity is attractive for portfolio construction but the research flagged its crypto evidence as MIXED. Repro: no portfolio-construction surface exists.",
    rationale: "The contested is validated-first or parked, never adopted by citation; HRP's benefit must be shown on our data.",
    impact: "Until shown, portfolio construction stays out of scope; no HRP weights render anywhere.",
    nextSteps: "Run the HRP fixture test; adopt only on out-of-sample dominance; owner: a portfolio-construction sprint.",
  },
  experiment: {
    hypothesis: "HRP produces higher risk-adjusted out-of-sample returns than equal-weight and min-variance on our multi-asset crypto fixtures.",
    method: "On the delivered domains' return series, construct HRP / equal-weight / min-variance portfolios in-sample and compare out-of-sample Sharpe across rolling windows.",
    preRegisteredOutcome: "If HRP's out-of-sample Sharpe exceeds both baselines across a majority of windows, adopt; otherwise keep parked (the mixed evidence did not resolve in our favour).",
  },
  stamp: "v11-phase0-park-hrp",
})
led.record({
  item: "zkml-verdict-proofs",
  disposition: "PARK-WITH-EXPERIMENT",
  flipCriteria: "adopt only if, at the re-check milestone, a production-grade ZKML proof of the verdict path is feasible under the frozen-core constraint (no core byte changed) at acceptable cost; the research flagged ZKML as immature.",
  park: {
    context: "Zero-knowledge proofs of the verdict computation (ZKML) would make attestation portable without revealing the strategy. Repro: no ZKML surface exists; the research flagged the tech as immature.",
    rationale: "Adopting immature cryptography by citation is the exact anti-pattern; a dated maturity re-check with a feasibility spike is the honest gate.",
    impact: "Until mature, portable attestation stays hash-based (the existing ledger + verify-v3); no ZKML claim is made.",
    nextSteps: "At the re-check date, run a feasibility spike proving one verdict; adopt only on a passing spike; owner: a dedicated attestation sprint. RE-CHECK DATE: 2027-01-01.",
  },
  experiment: {
    hypothesis: "A production-grade ZKML proof of the frozen verdict path is feasible under the no-core-change constraint at acceptable prover cost by the re-check date.",
    method: "At 2027-01-01, survey ZKML maturity and run a feasibility spike: prove one real verdict end-to-end without touching a frozen byte; measure prover time + proof size.",
    preRegisteredOutcome: "If the spike proves a verdict under the constraint at acceptable cost, adopt; otherwise re-park with a new re-check date and the measured gap.",
  },
  stamp: "v11-phase0-park-zkml",
})

// REJECT (4)
led.record({
  item: "full-kelly-core-redesign",
  disposition: "REJECT",
  reason: "The Kelly Virtue-of-Complexity thesis in its CORE-REDESIGN form is rejected on the Nagel momentum-artifact critique (the complexity benefit may be a momentum artifact) and on moat grounds (redesigning the frozen core around a model would surrender the honest-gate moat). Its sandboxed-proposer form is adopted instead (with a DoF charge).",
  flipCriteria: "would reverse ONLY if the momentum-artifact critique is answered on our own fixtures AND the frozen-gate authority can be preserved intact — not this sprint, and never by citation; a redesign that moves a frozen byte is a Halt regardless.",
  stamp: "v11-phase0-reject-fullkelly",
})
led.record({
  item: "cpcv-gating-promotion-now",
  disposition: "REJECT",
  reason: "Promoting CPCV to a GATING panel now ('it's obviously better') is rejected — advisory-first is the entire point; a panel that can gate becomes a second authority eroding the frozen core by panel.",
  flipCriteria: "reverses only via the pre-registered promotion criteria (agreement/disagreement rates vs the frozen gates over N real adjudications) followed by an explicit owner decision; the rejection is logged so the promotion is a deliberate future act, not a drift.",
  stamp: "v11-phase0-reject-cpcvpromo",
})
led.record({
  item: "uncharged-proposer-exploration",
  disposition: "REJECT",
  reason: "Letting the VoC proposer skip the ledger for 'exploration' is rejected — fitting IS searching; an uncharged exploration path is a Halt (the proposer's every fit registers through the identical write-then-invoke gate at its pinned DoF charge).",
  flipCriteria: "PERMANENT (constitutional) — an uncharged fit can never be legitimate; this rejection does not flip. Recorded so the constraint is legible, not silent.",
  stamp: "v11-phase0-reject-uncharged",
})
led.record({
  item: "any-signing-path",
  disposition: "REJECT",
  reason: "Any signing / paid / closed path is rejected — the ever-standing constitutional decision (S-NO-SIGN, S-FREE); nothing signs, nothing is paid, nothing is closed.",
  flipCriteria: "reverses ONLY by an explicit Operator constitutional decision to open signing — never an agent's, never by a sprint's convenience; until then the capability is absent by construction.",
  stamp: "v11-phase0-reject-signing",
})

const chain = led.verifyChain()
const table = { protocol: "research-ratification", version: "v11", at: "2026-07-05", rule: "R-RATIFY — research enters by ratification, never by citation; every disposition a value with flip-criteria", blueprintPin: Criteria.SPINE_BLUEPRINT_SHA_PINNED, dofMappingHash: DOF_MAPPING_HASH, chainOk: chain.ok, counts: countByDisposition(led.all()), entries: led.all() }
writeFileSync(path.join(D, "research-ratification-v11.json"), JSON.stringify(table, null, 2) + "\n")

function countByDisposition(entries: readonly Ratify.Entry[]): Record<string, number> {
  const c: Record<string, number> = {}
  for (const e of entries) c[e.disposition] = (c[e.disposition] ?? 0) + 1
  return c
}

// re-load the persisted table to prove it round-trips + the chain re-verifies from disk (tamper-evident)
const reloaded = Ratify.load(path.join(D, "research-ratification-v11.json"))
const unratified = Ratify.unratifiedArtifacts(reloaded.entries)

// ── (3) the catalog v11 pin + verify ──
const cat = Catalog.load()!
const catVerify = Catalog.verify(cat)
const catalogPin = {
  protocol: "e2e-catalog-pin-v11",
  at: "2026-07-05",
  rule: "E-CATALOG — pinned before any spine surface exists; a CLEAN cycle traverses it in full; red-team may ADD, never remove",
  catalogFile: Catalog.CATALOG_REL,
  contentSha: Catalog.contentSha(cat),
  baselineIds: Catalog.BASELINE_IDS,
  count: catVerify.count,
  byClass: catVerify.byClass,
  verifyOk: catVerify.ok,
  issues: catVerify.issues,
}
writeFileSync(path.join(D, "e2e-catalog-pin-v11.json"), JSON.stringify(catalogPin, null, 2) + "\n")

// ── (4) criteria printed VERBATIM + the floor/absences baseline ──
writeFileSync(path.join(D, "phase0-criteria-print-v11.txt"), Criteria.printVerbatimSpine() + "\n")
const pin = Criteria.blueprintMatchesSpinePin()
const snap = Inventory.snapshot("v11-phase0-baseline")
const absences = Inventory.verifyAbsences()
const baseline = {
  protocol: "phase0-baseline-v11",
  at: "2026-07-05",
  floor: snap.capabilities.length,
  anchorHash: snap.anchorHash,
  absences: Inventory.ABSENCES.map((a) => ({ id: a.id, park: a.park })),
  absencesOk: absences.ok,
  openAbsences: absences.open,
}
writeFileSync(path.join(D, "phase0-baseline-v11.json"), JSON.stringify(baseline, null, 2) + "\n")

// ── the RATIFIED-TRUE gate summary ──
const gate = {
  protocol: "phase0-ratified-true-v11",
  at: "2026-07-05",
  gate: "RATIFIED-TRUE",
  ratification: { table: "data/studio/research-ratification-v11.json", chainOk: chain.ok, counts: table.counts, reloadChainOk: reloaded.chainOk, unratifiedArtifacts: unratified, dofMappingHash: DOF_MAPPING_HASH },
  ratificationWall: { proven_by: "test/walls/research_ratified.test.ts" },
  catalog: { pinned: true, contentSha: catalogPin.contentSha, count: catalogPin.count, byClass: catalogPin.byClass, verifyOk: catVerify.ok },
  criteria: { pin: pin.detail, criteriaSetSha: Criteria.spineCriteriaSha() },
  baseline: { floor: baseline.floor, absencesOk: baseline.absencesOk },
  preventionWalls: { proven_by: "test/walls/precommit_prevent.test.ts", hook: ".githooks/pre-commit (core.hooksPath)", walls: ["blob-size", "raw-data", "credential"] },
}
writeFileSync(path.join(D, "phase0-ratified-true-v11.json"), JSON.stringify(gate, null, 2) + "\n")

console.log(`ratification: ${led.all().length} rows (${JSON.stringify(table.counts)}) · chain ${chain.ok} · reload ${reloaded.chainOk} · unratified artifacts ${unratified.length}`)
console.log(`DoF mapping hash (pinned pre-first-run): ${DOF_MAPPING_HASH.slice(0, 16)}…`)
console.log(`catalog: ${catalogPin.count} scenarios (${JSON.stringify(catalogPin.byClass)}) · verify ${catVerify.ok} · sha ${catalogPin.contentSha.slice(0, 12)}…`)
console.log(`criteria: ${pin.detail} · criteria-set-sha ${Criteria.spineCriteriaSha().slice(0, 12)}…`)
console.log(`baseline: floor ${baseline.floor} · absences ok ${baseline.absencesOk}`)
console.log(`written: research-ratification-v11.json · e2e-catalog-pin-v11.json · phase0-criteria-print-v11.txt · phase0-baseline-v11.json · phase0-ratified-true-v11.json`)
