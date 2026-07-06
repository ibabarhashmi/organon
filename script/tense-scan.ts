/**
 * ORGΛNON — the claim-vs-evidence scanner driver (Transplant Phase 2; C-TENSE, automated). Runs Tense.scan over the
 * BuildLogs + docs + README + the pointer, prints the human-readable table, and lists the FLAGGED (unpaired
 * present-tense) claims for reconciliation. A POSITIVE CONTROL (a seeded overclaim) must be caught, so "the prose is at
 * its true tense" is a tested claim. Exit non-zero if the positive control fails (the scanner is blind). Run:
 * bun run script/tense-scan.ts
 */
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Tense } from "../src/studio/tense"

const DOCS = [
  "README.md",
  "docs/SERVED-PERSISTENCE-MEMO.md",
  "sprint/sprint-result/BUILDLOG-V7-TRANSPLANT.md",
  "sprint/sprint-result/ORGANON-TRANSPLANT-POINTER.md",
  // NOTE: MANIFEST.json is deliberately EXCLUDED — it is machine-generated structured data (every file entry carries a
  // `kind:"byte-identical"` field), not prose making claims; scanning it produces only structural noise, not overclaims.
]

function main() {
  // ── POSITIVE CONTROL: a seeded overclaim (present-tense, no evidence, unhedged) MUST be flagged ──
  const seeded = "The system is byte-identical and every wall passes and it converged.\nThis line is fine (pending the operator)."
  const control = Tense.scan(seeded)
  const overclaimCaught = control.some((c) => c.flagged)
  const hedgeIgnored = control.every((c) => !(c.hedged && c.flagged))
  if (!overclaimCaught || !hedgeIgnored) {
    console.error("POSITIVE CONTROL FAILED — the tense scanner did not catch a seeded overclaim (or flagged a hedge). It is blind; the table is void.")
    console.error(JSON.stringify(control, null, 2))
    process.exit(1)
  }

  const reports: Tense.Report[] = []
  for (const rel of DOCS) {
    const abs = path.join(PKG_ROOT, rel)
    if (!existsSync(abs)) continue
    reports.push(Tense.report(rel, readFileSync(abs, "utf8")))
  }

  console.log("═══ CLAIM-VS-EVIDENCE SCAN (C-TENSE, automated) ═══")
  console.log(`positive control: seeded overclaim caught=${overclaimCaught}, hedge correctly ignored=${hedgeIgnored}`)
  console.log(Tense.renderTable(reports))
  console.log("\nFLAGGED (unpaired present-tense claims — a human must reconcile each; a real overclaim is a doc-lies finding):")
  let anyFlagged = false
  for (const r of reports) for (const c of r.flagged) { anyFlagged = true; console.log(`  ${r.doc}:${c.line}  ${c.text}`) }
  if (!anyFlagged) console.log("  (none — every present-tense proven-state claim carries an evidence marker or an honest hedge)")
  console.log("\nNote: the scanner FLAGS candidates; the human table above is the reckoning. The scanner's own misses are S2 walk findings (doc-lies theme).")
}

main()
