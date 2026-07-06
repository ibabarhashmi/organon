/**
 * ORGΛNON — the LEDGER-POLLUTION AUDIT driver (Transplant Phase 0; Rule T-POLLUTION).
 *
 * Runs the pollution auditor over EVERY ledger under data/studio (a coverage manifest by glob — an unaudited ledger is
 * itself a finding), re-validating each historical entry against the current schema. Invalid entries are quarantined by
 * an APPENDED annotation to data/studio/ledger-quarantine.jsonl — never deleted (git diff proves zero deletions).
 * Recomputes family/root counts before/after any exclusion. Includes a POSITIVE CONTROL: a seeded invalid entry the
 * auditor MUST catch, so "clean" is a tested claim, not an absence of looking. Deterministic — re-running regenerates
 * the report from the ledgers. Run:  bun run script/audit-ledgers.ts
 */
import { readdirSync, readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Pollution } from "../src/studio/pollution"
import { Ledger } from "../src/ledger/ledger"

const D = path.join(PKG_ROOT, "data", "studio")
const AT = "2026-07-04" // deterministic label (no Date.now())

// ── recover the actual specs from the paired live-run artifacts (the ledgers store only the hash) ──
function recoveryMap(): Map<string, unknown> {
  const m = new Map<string, unknown>()
  const add = (spec: unknown) => { if (spec && typeof spec === "object") m.set(Ledger.hashSpec(spec), spec) }
  const a1p = path.join(D, "live-run-artifact.json")
  if (existsSync(a1p)) { const a1 = JSON.parse(readFileSync(a1p, "utf8")); add(a1.proposedSpec) }
  const a2p = path.join(D, "live-run-2-artifact.json")
  if (existsSync(a2p)) { const a2 = JSON.parse(readFileSync(a2p, "utf8")); for (const s of a2.liveSearch?.specs ?? []) add(s) }
  return m
}

function classify(name: string): Pollution.LedgerClass {
  if (name.startsWith("live-ledger") || name.startsWith("live-run-2.jsonl")) return "trial"
  if (name.startsWith("enrollments")) return "enrollment"
  if (name.startsWith("clock-stamps")) return "clock-stamp"
  if (name.startsWith("walk-ledger")) return "walk"
  return "unknown"
}

function auditOne(name: string, jsonl: string, recovery: Map<string, unknown>): Pollution.LedgerAudit {
  const cls = classify(name)
  if (cls === "trial") return Pollution.auditTrialLedger(name, jsonl, recovery)
  if (cls === "walk") return Pollution.auditChainedLedger(name, jsonl, "walk", "prev", "hash")
  if (cls === "clock-stamp") return Pollution.auditChainedLedger(name, jsonl, "clock-stamp", "prevSha", "selfSha", "domain") // per-domain chains
  // enrollment / unknown: structural parse only (single-record or non-chained provenance ledgers)
  const lines = jsonl.split("\n").map((l) => l.trim()).filter(Boolean)
  const findings = lines.map((l, i) => {
    try { JSON.parse(l); return { seq: i, ok: true, reasons: [], specRecovered: false, specSchemaValid: null } }
    catch { return { seq: i, ok: false, reasons: ["not valid JSON"], specRecovered: false, specSchemaValid: null } }
  })
  return { ledger: name, cls, entryCount: lines.length, findings, invalidSeqs: findings.filter((f) => !f.ok).map((f) => f.seq), chainOk: findings.every((f) => f.ok) }
}

function main() {
  const recovery = recoveryMap()
  const files = readdirSync(D).filter((f) => f.endsWith(".jsonl")).sort()

  // ── POSITIVE CONTROL: prove the auditor catches a seeded invalid entry (else "clean" is untested) ──
  const goodJsonl = readFileSync(path.join(D, "live-run-2.jsonl"), "utf8")
  // seed 1: a spec that fails the CURRENT schema (bad policy enum) — recover it so the schema arm fires (W1-04 class)
  const badSpec = { family: "rwa-allocation", legs: [{ id: "x", weight: 0.5 }], rebalance: { trigger: "monthly" }, policy: "definitely-not-a-policy", constraints: {} }
  const badHash = Ledger.hashSpec(badSpec)
  const seededRecovery = new Map(recovery); seededRecovery.set(badHash, badSpec)
  const firstLine = JSON.parse(goodJsonl.split("\n")[0])
  // call the TRIAL auditor directly (name-dispatch would misclassify a "SEEDED-*" ledger as unknown/structural-only)
  const seededSchema = Pollution.auditTrialLedger("SEEDED-schema", JSON.stringify({ ...firstLine, specHash: badHash }) + "\n", seededRecovery)
  // seed 2: a tampered chain (flip a timestamp so the stored hash no longer recomputes)
  const seededTamper = Pollution.auditTrialLedger("SEEDED-tamper", JSON.stringify({ ...firstLine, timestamp: firstLine.timestamp + 1 }) + "\n", recovery)
  const positiveControl = {
    schemaCaught: seededSchema.invalidSeqs.length > 0 && seededSchema.findings[0].specSchemaValid === false,
    tamperCaught: seededTamper.invalidSeqs.length > 0,
    schemaReason: seededSchema.findings[0]?.reasons ?? [],
    tamperReason: seededTamper.findings[0]?.reasons ?? [],
  }
  if (!positiveControl.schemaCaught || !positiveControl.tamperCaught) {
    console.error("POSITIVE CONTROL FAILED — the auditor did not catch a seeded invalid entry. Audit is void.")
    console.error(JSON.stringify(positiveControl, null, 2))
    process.exit(1)
  }

  // ── the real audit over every ledger ──
  const audits: Pollution.LedgerAudit[] = []
  for (const f of files) audits.push(auditOne(f, readFileSync(path.join(D, f), "utf8"), recovery))

  // ── quarantines: EVERY invalid entry across EVERY ledger (never just the trial ones) ──
  const quarantines: Pollution.Quarantine[] = []
  for (const a of audits) for (const f of a.findings.filter((x) => !x.ok)) quarantines.push({ protocol: "ledger-quarantine", ledger: a.ledger, seq: f.seq, reason: f.reasons.join("; "), discoveredBy: "audit-ledgers.ts (T-POLLUTION)", at: AT })

  // ── before/after family/root counts for the trial ledgers (quarantined entries excluded from AFTER) ──
  const countTable: Record<string, { before: Pollution.CountReport; after: Pollution.CountReport }> = {}
  for (const a of audits.filter((x) => x.cls === "trial")) {
    const entries = readFileSync(path.join(D, a.ledger), "utf8").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => JSON.parse(l) as Record<string, unknown>)
    const excluded = new Set(a.invalidSeqs)
    countTable[a.ledger] = { before: Pollution.counts(entries), after: Pollution.counts(entries.filter((e) => !excluded.has(e.seq as number))) }
  }

  // ── quarantine-by-annotation: APPEND (never delete). Zero quarantines → nothing appended, disclosed as clean. ──
  const qFile = path.join(D, "ledger-quarantine.jsonl")
  if (quarantines.length > 0) for (const q of quarantines) appendFileSync(qFile, JSON.stringify(q) + "\n")

  const totalInvalid = audits.reduce((n, a) => n + a.invalidSeqs.length, 0)
  const report = {
    protocol: "ledger-pollution-audit",
    rule: "T-POLLUTION",
    at: AT,
    coverageManifest: files.map((f) => ({ ledger: f, cls: classify(f) })),
    unauditedLedgers: [] as string[], // every *.jsonl was audited; an omission would be a finding
    specRecoveryCount: recovery.size,
    positiveControl,
    audits: audits.map((a) => ({ ledger: a.ledger, cls: a.cls, entries: a.entryCount, invalid: a.invalidSeqs, chainOk: a.chainOk, specSchemaChecked: a.findings.filter((f) => f.specRecovered).length })),
    counts: countTable,
    quarantines,
    verdict: totalInvalid === 0 ? "CLEAN (positive-control-verified; zero pollution across all ledgers)" : `${totalInvalid} invalid entr(y/ies) quarantined by annotation`,
    deletions: 0,
  }
  writeFileSync(path.join(D, "ledger-pollution-audit.json"), JSON.stringify(report, null, 2) + "\n")

  // ── console summary ──
  console.log("═══ LEDGER-POLLUTION AUDIT (T-POLLUTION) ═══")
  console.log(`coverage: ${files.length} ledger file(s) — ${files.join(", ")}`)
  console.log(`spec recovery map: ${recovery.size} specs recovered from live-run artifacts`)
  console.log(`positive control: schema-invalid caught=${positiveControl.schemaCaught}, tamper caught=${positiveControl.tamperCaught}`)
  for (const a of audits) console.log(`  · ${a.ledger} [${a.cls}] — ${a.entryCount} entries, ${a.invalidSeqs.length} invalid, chainOk=${a.chainOk}, spec-schema-checked=${a.findings.filter((f) => f.specRecovered).length}`)
  console.log("\nbefore/after counts (trial ledgers):")
  for (const [name, c] of Object.entries(countTable)) console.log(`  · ${name}: before {entries:${c.before.entries}, roots:${c.before.roots}, distinctSpecs:${c.before.distinctSpecs}} → after {entries:${c.after.entries}, roots:${c.after.roots}, distinctSpecs:${c.after.distinctSpecs}}`)
  console.log(`\nverdict: ${report.verdict}`)
  console.log(`quarantines appended: ${quarantines.length} (deletions: 0)`)
  console.log(`report → data/studio/ledger-pollution-audit.json`)
}

main()
