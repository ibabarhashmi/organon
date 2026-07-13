/**
 * ORGΛNON — THE RECKONING SPRINT, Phase 1 (X-RECKON d). Run the ONE-TIME act-taxonomy migration over the committed fixture
 * lineages, in the ONLY window that exists (realLineageCount===0). Re-tags each fixture ledger (adds the DERIVED `act` to
 * every entry) and writes the disclosed, committed record `data/honesty/reckon-migration.json` (old root === new root, since
 * act is not hashed — the chain is cryptographically unchanged). HALTS if a real lineage already exists.
 * Run: bun run script/honesty/reckon-migration.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Migration } from "../../src/strategy/migration"
import { StrategyTrial } from "../../src/strategy/trial"

const at = "2026-07-13T00:00:00Z"
const plan = Migration.plan(at)
if (!plan.ok) {
  console.error(plan.halt)
  process.exit(1)
}

// re-tag each fixture ledger in place (idempotent — the derivation is deterministic)
for (const lin of plan.record.lineages) {
  const before = StrategyTrial.ledger(lin.id, StrategyTrial.FIXTURE_TRIAL_DIR)
  const after = Migration.retagEntries(before)
  const f = path.join(StrategyTrial.FIXTURE_TRIAL_DIR, `${lin.id}.jsonl`)
  writeFileSync(f, after.map((t) => JSON.stringify(t)).join("\n") + "\n")
}

// write the committed, auditable migration record
writeFileSync(path.join(PKG_ROOT, "data", "honesty", "reckon-migration.json"), JSON.stringify(plan.record, null, 2) + "\n")

console.log("── RECKON — the one-time act-taxonomy migration ────────────")
console.log(`  real lineages at migration : ${plan.record.realLineageCountAtMigration} (window open)`)
console.log(`  entries re-tagged          : ${plan.record.entriesRetagged}`)
for (const lin of plan.record.lineages) {
  console.log(`  ${lin.id.slice(0, 12)}… count=${lin.count} · SEARCH ${lin.search} · OBSERVATION ${lin.observation} · root ${lin.oldChainRoot.slice(0, 12)}${lin.oldChainRoot === lin.newChainRoot ? " (unchanged — act not hashed)" : " → " + lin.newChainRoot.slice(0, 12)}`)
  const v = StrategyTrial.verify(lin.id, StrategyTrial.FIXTURE_TRIAL_DIR)
  console.log(`     verify: ${v.ok ? "OK" : "FAIL — " + v.reason} · trigger-counter (SEARCH only): ${StrategyTrial.trialsPerFamily(lin.id, StrategyTrial.FIXTURE_TRIAL_DIR)}`)
}
console.log("  record written: data/honesty/reckon-migration.json")
