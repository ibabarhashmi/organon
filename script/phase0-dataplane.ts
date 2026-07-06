/**
 * ORGΛNON — Data-Plane Phase 0 bookkeeping (Rules D-DOMAIN, C-RECON2, C-NOREGRESS). Prints the criteria VERBATIM beside
 * the blueprint pin, snapshots the floor/absences baseline, and writes the per-domain SCOPE CONTRACT — each domain with
 * its DONE condition (byte-equivalent to the oracle) and its honest BLOCKED condition (absent data/credential). Run:
 *   bun run script/phase0-dataplane.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Criteria } from "../src/studio/criteria"
import { Inventory } from "../src/studio/inventory"

const D = path.join(PKG_ROOT, "data", "studio")

// ── criteria printed verbatim beside the pin (C-RECON2) ──────────────────────────────────────────────────────────
const pin = Criteria.blueprintMatchesDataplanePin()
const criteriaPrint = Criteria.printVerbatimDataplane()
writeFileSync(path.join(D, "phase0-criteria-print-v9.txt"), criteriaPrint + "\n")
console.log(`blueprint pin: ${pin.ok} — ${pin.detail}`)
console.log(`criteria-set-sha256: ${Criteria.dataplaneCriteriaSha()}`)

// ── the per-domain SCOPE CONTRACT (D-DOMAIN) ─────────────────────────────────────────────────────────────────────
const scopeContract = {
  protocol: "scope-contract-v9",
  at: "2026-07-04",
  rule: "D-DOMAIN — domains land independently and honestly; partial delivery is a valid, labeled outcome; the matrix tells the per-domain truth",
  order: "lending → funding → fee-yield → RWA",
  domains: [
    {
      domain: "lending",
      source: "DefiLlama yields (yields.llama.fi/chart/<pool>) — credential-free",
      engine: "lending_accrual.py (byte-identical to the monorepo oracle; stdlib-only)",
      doneCondition: "the ported TS buildJob produces a Job from a real captured DefiLlama snapshot; the equity_curve is byte-identical to the monorepo oracle run on the same hash-pinned Job (D-DIFF)",
      blockedCondition: "(none expected) — DefiLlama is reachable and credential-free; if the capture fails, BLOCKED-on-source stated",
      plannedOutcome: "DELIVER (the primary domain)",
    },
    {
      domain: "funding",
      source: "Hyperliquid api.hyperliquid.xyz/info fundingHistory + Binance freepit T1 — credential-free",
      engine: "funding_accrual.py / funding_discriminate.py (FROZEN seven — untouched)",
      doneCondition: "captured funding snapshots → the funding engine → equity/discriminator byte-identical to the oracle",
      blockedCondition: "the freepit T1 reconstruction (Binance monthly bulk dumps + sha256 integrity chain) is a heavier port; if not reached this sprint, funding is BLOCKED-on-port stated with its unblock, and remains a data-plane park",
      plannedOutcome: "ATTEMPT; else BLOCKED-on-port stated (D-DOMAIN)",
    },
    {
      domain: "fee-yield",
      source: "DefiLlama fees/revenue (T3, discovery-only) — credential-free",
      engine: "feeyield_panel.py (needs pandas / the numpy stack)",
      doneCondition: "captured fee snapshots → the fee-yield discovery panel → register byte-identical to the oracle (always NO-GO/INSUFFICIENT on discovery by the T3 wall — a refusal is the product working)",
      blockedCondition: "the pandas/numpy env (Py3.11) is required; if the port's env is not stood up this sprint, fee-yield is BLOCKED-on-env stated",
      plannedOutcome: "ATTEMPT; else BLOCKED-on-env stated (D-DOMAIN)",
    },
    {
      domain: "RWA",
      source: "the pinned discovery snapshot (data/snapshot) — FRED-gated at capture (DGS3MO benchmark)",
      engine: "accrual.py + rigor.py (rigor needs Py3.11 numpy/scipy/purgedcv)",
      doneCondition: "the byte-regen reproduces the pinned NOT-YET sha under the pinned engine lockfile (the two-way door: MATCH retires the asterisk, MISMATCH reopens as LOGIC-candidate; the pin unchanged in both — D-TWOWAY)",
      blockedCondition: "FRED_API_KEY is UNSET and data/snapshot is absent → the RWA differential + byte-regen are BLOCKED-on-credential; the pin STAYS NOT-YET (zero re-pins); the V8 ENVIRONMENTAL classification's asterisk still carries load",
      plannedOutcome: "BLOCKED-on-credential (pre-declared honest; the door remains) (D-TWOWAY, A′#5)",
    },
  ],
}
writeFileSync(path.join(D, "scope-contract-v9.json"), JSON.stringify(scopeContract, null, 2) + "\n")
console.log(`scope contract: ${scopeContract.domains.map((d) => `${d.domain}=${d.plannedOutcome.split(" ")[0]}`).join(" · ")}`)

// ── the floor/absences baseline (C-NOREGRESS, F-ABSENT) ──────────────────────────────────────────────────────────
const snap = Inventory.snapshot("v9-phase0-baseline")
const abs = Inventory.verifyAbsences()
const baseline = {
  protocol: "phase0-baseline-v9",
  at: "2026-07-04",
  floor: snap.capabilities.length,
  anchorHash: snap.anchorHash,
  absences: Inventory.ABSENCES.map((a) => ({ id: a.id, park: a.park, ownerSprint: a.ownerSprint })),
  absencesOk: abs.ok,
  openAbsences: abs.open,
}
writeFileSync(path.join(D, "phase0-baseline-v9.json"), JSON.stringify(baseline, null, 2) + "\n")
console.log(`floor baseline: ${baseline.floor} capabilities, ${baseline.absences.length} absences, absences-ok=${baseline.absencesOk}`)
console.log(`written: phase0-criteria-print-v9.txt · scope-contract-v9.json · phase0-baseline-v9.json`)
