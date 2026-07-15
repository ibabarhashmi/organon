/**
 * ORGΛNON — THE PROVENANCE SPRINT (V42), Phase 2 (S170/RP-2): THE CARRIED-CLAIM AUDIT — the per-field COMPUTED/CARRIED table.
 *
 * DD-75: every generated field of the marker/header/gate is COMPUTED (a producer recomputed it this run) or CARRIED
 * (equals a prior sprint's value AND a recompute of its OWN inputs — RP-2, not transitively-coupled state — still matches).
 * The D33 note is SPLIT: the SIGNABILITY claim renders carried:{from:V39, reverified:true} (D33 unchanged since the autopsy);
 * any FALSE-FIRE reference is COMPUTED this run (the REAL★ archive feeds it). Every carried field names its input set and
 * proves inputsMoved:false. This writes the committed audit; Ship.gate (S170) refuses on a carried claim that would recompute
 * differently — a carry is a claim RECOMPUTED and found identical, never one that was skipped.
 *
 * Run: bun run script/honesty/carried-audit.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Rollup } from "../../src/organon/rollup"
import { Freshness } from "../../src/organon/freshness"
import { HistoricalAct } from "../../src/organon/historical"
import { Signability } from "../../src/backtest/crosscheck"

const classes = Rollup.freshnessAudit()
const honest = Freshness.honest(classes)

// BACKFILL V43 (S182, N-3) — the HISTORICAL-ACT audit: a fixed historical act's hash is STABLE (its immutable-core hash) or
// carried:{from}. The D56 SEARCH is the one carried hash that drifted (a578032b→d5147f8d, the chain selfSha); it now renders
// its stable immutable-core hash, so a fixed act yields a fixed hash forever.
const d33Rendered = (Signability.d33().redesignSearchHashes ?? [])[0] ?? ""
const historicalActs = [
  {
    act: "D56 SEARCH (test-redesign-search.json)",
    renderedHash: d33Rendered,
    stableHash: HistoricalAct.hashFile("test-redesign-search.json"),
    verdict: HistoricalAct.verifyFile("test-redesign-search.json", d33Rendered),
    note: "N-3: previously the rendered hash was the record chain's selfSha (position-dependent — drifted a578032b→d5147f8d as the chain grew). Now it is the act's immutable-core hash (deviation + act + redesigns + redesignLog), STABLE forever; the chain selfSha remains the chain's tamper-evidence, a different concern.",
  },
]
const historicalHonest = historicalActs.every((h) => h.verdict.ok)

const audit = {
  protocol: "carried-audit",
  rule: "S170/RP-2 — every generated field is COMPUTED (recomputed this run) or carried:{from, why, reverified}; a carried field re-runs its OWN inputs and the carried value must equal the recompute (a carry that would recompute differently is a lie the Ship Gate refuses). The D33 note is SPLIT: SIGNABILITY (carried, D33 unchanged) from FALSE-FIRE (computed). BACKFILL V43 (S182/N-3): a HISTORICAL act's hash is STABLE (its immutable-core hash) or carried:{from} — a fixed act yields a fixed hash; a drift without a tag REFUSES the log.",
  honest: honest.ok && historicalHonest,
  computed: honest.computed,
  carried: honest.carried,
  fields: classes.map((c) =>
    c.kind === "COMPUTED"
      ? { field: c.field, kind: c.kind, producer: c.producer }
      : { field: c.field, kind: c.kind, from: c.from, why: c.why, reverified: c.reverified, inputs: c.inputs, inputsMoved: c.inputsMoved },
  ),
  historicalActs,
}

writeFileSync(path.join(PKG_ROOT, "data", "honesty", "carried-audit.json"), JSON.stringify(audit, null, 2) + "\n")
console.log("── carried-audit (V42 S170/RP-2 + V43 S182/N-3) ──────────────────")
console.log(`  fields: ${classes.length} · COMPUTED ${honest.computed} · carried-and-reverified ${honest.carried} · freshness honest ${honest.ok}`)
for (const c of classes) console.log(`  ${c.kind === "CARRIED" ? "carried" : "COMPUTED"} · ${c.field}${c.kind === "CARRIED" ? ` (from ${c.from}, reverified ${c.reverified})` : ""}`)
console.log(`  historical acts: ${historicalActs.length} · stable-or-carried ${historicalHonest}`)
for (const h of historicalActs) console.log(`  ${h.verdict.ok ? "stable" : "DRIFT"} · ${h.act} → ${h.stableHash.slice(0, 12)}…`)
console.log("written: data/honesty/carried-audit.json")
