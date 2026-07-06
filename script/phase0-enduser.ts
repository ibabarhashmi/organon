/**
 * ORGΛNON — End-User Phase 0 evidence (Rules E-ATTEMPT, E-CATALOG, E-PREVENT, C-RECON2). Generates the Phase-0
 * artifacts the gatekeeper pins: the ATTEMPT-law scope-contract ledger with V9's renegotiation retro-filed; the E2E
 * catalog pin + verify; the criteria printed verbatim beside the blueprint pin; the floor/absences baseline. The
 * prevention walls are proven by test/walls/precommit_prevent.test.ts; the history audit by script/history-blob-audit.ts.
 * Deterministic + idempotent (the ledger is rewritten fresh each run). Run: bun run script/phase0-enduser.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Criteria } from "../src/studio/criteria"
import { Attempt } from "../src/studio/attempt"
import { Catalog } from "../src/studio/catalog"
import { Inventory } from "../src/studio/inventory"

const D = path.join(PKG_ROOT, "data", "studio")

// ── the ATTEMPT law: retro-file V9's funding/fee-yield renegotiation into a fresh, deterministic scope-contract ledger ──
const ledgerFile = path.join(D, "scope-contract-ledger.jsonl")
writeFileSync(ledgerFile, "") // rewrite fresh so the run is deterministic + idempotent (append-only WITHIN a run)
const ledger = new Attempt.Ledger(ledgerFile)
const filed = Attempt.retroFileV9(ledger)
const attempt = {
  protocol: "attempt-law-v10",
  at: "2026-07-05",
  rule: "E-ATTEMPT — a pre-declared ATTEMPT resolves to exactly one legible terminal; a BLOCKED requires second-attempted evidence; an ATTEMPT→DEFER requires a recorded amendment; a DELIVERED requires a differential",
  retroFiled: filed.map((e) => ({ seq: e.seq, domain: e.domain, declared: e.declared, disposition: e.disposition, amendment: e.amendment, hash: e.hash })),
  chainOk: ledger.verifyChain().ok,
  openIssues: ledger.openIssues(),
  ledgerFile: "data/studio/scope-contract-ledger.jsonl",
}
writeFileSync(path.join(D, "attempt-law-v10.json"), JSON.stringify(attempt, null, 2) + "\n")

// ── the E2E catalog pin + verify (pre-registered BEFORE any fixing) ──
const cat = Catalog.load()!
const catVerify = Catalog.verify(cat)
const catalogPin = {
  protocol: "e2e-catalog-pin-v10",
  at: "2026-07-05",
  rule: "E-CATALOG — pinned before any fixing; a CLEAN cycle traverses it in full; red-team may ADD, never remove",
  catalogFile: Catalog.CATALOG_REL,
  contentSha: Catalog.contentSha(cat),
  baselineIds: Catalog.BASELINE_IDS,
  count: catVerify.count,
  byClass: catVerify.byClass,
  verifyOk: catVerify.ok,
  issues: catVerify.issues,
}
writeFileSync(path.join(D, "e2e-catalog-pin-v10.json"), JSON.stringify(catalogPin, null, 2) + "\n")

// ── criteria printed VERBATIM beside the blueprint pin (C-RECON2) ──
const criteriaPrint = Criteria.printVerbatimEnduser()
writeFileSync(path.join(D, "phase0-criteria-print-v10.txt"), criteriaPrint + "\n")
const pin = Criteria.blueprintMatchesEnduserPin()

// ── the floor/absences baseline (C-NOREGRESS) ──
const snap = Inventory.snapshot("v10-phase0-baseline")
const absences = Inventory.verifyAbsences()
const baseline = {
  protocol: "phase0-baseline-v10",
  at: "2026-07-05",
  floor: snap.capabilities.length,
  anchorHash: snap.anchorHash,
  absences: Inventory.ABSENCES.map((a) => ({ id: a.id, park: a.park })),
  absencesOk: absences.ok,
  openAbsences: absences.open,
}
writeFileSync(path.join(D, "phase0-baseline-v10.json"), JSON.stringify(baseline, null, 2) + "\n")

// ── the PREVENT-TRUE gate summary ──
const gate = {
  protocol: "phase0-prevent-true-v10",
  at: "2026-07-05",
  gate: "PREVENT-TRUE",
  attemptLaw: { live: true, retroFiled: filed.length, chainOk: attempt.chainOk, openIssues: attempt.openIssues.length },
  preventionWalls: { proven_by: "test/walls/precommit_prevent.test.ts", hook: ".githooks/pre-commit (core.hooksPath)", walls: ["blob-size", "raw-data", "credential"] },
  historyDisclosure: { proven_by: "script/history-blob-audit.ts → data/studio/history-blob-audit-v10.json", rewrites: 0 },
  catalog: { pinned: true, contentSha: catalogPin.contentSha, count: catalogPin.count, verifyOk: catVerify.ok },
  criteria: { pin: pin.detail, criteriaSetSha: Criteria.enduserCriteriaSha() },
  baseline: { floor: baseline.floor, absencesOk: baseline.absencesOk },
}
writeFileSync(path.join(D, "phase0-prevent-true-v10.json"), JSON.stringify(gate, null, 2) + "\n")

console.log(`ATTEMPT law: retro-filed ${filed.length} (chain ${attempt.chainOk}) · open issues ${attempt.openIssues.length}`)
console.log(`catalog: ${catalogPin.count} scenarios (${JSON.stringify(catalogPin.byClass)}) · verify ${catVerify.ok} · sha ${catalogPin.contentSha.slice(0, 12)}…`)
console.log(`criteria: ${pin.detail} · criteria-set-sha ${Criteria.enduserCriteriaSha().slice(0, 12)}…`)
console.log(`baseline: floor ${baseline.floor} · absences ok ${baseline.absencesOk}`)
console.log(`written: attempt-law-v10.json · e2e-catalog-pin-v10.json · phase0-criteria-print-v10.txt · phase0-baseline-v10.json · phase0-prevent-true-v10.json`)
