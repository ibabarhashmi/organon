/**
 * ORGΛNON — Warranty Phase 0: file the V6 Phase-2 HEADLINE as a VALUE (Rule F-CONTINUE: corrections are numbers, not
 * arguments; T-SUPERSEDE: appended, never re-pointed). V7 already downgraded the doc-truth EVIDENCE to
 * UNMET-ON-FRESH-CLONE but wrapped it in a consequence-argument ("no gate was falsely advanced"). This appends one
 * superseding record that states the phase HEADLINE plainly — REPEAT — and retires the argument. The chain is verified
 * before write; the existing records are loaded byte-intact (their hashes must recompute) so nothing is re-pointed.
 * Run:  bun run script/phase0-warranty-corrections.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Supersede } from "../src/studio/supersede"

const TRAIL = path.join(PKG_ROOT, "data", "studio", "supersede-trail.json")
const doc = JSON.parse(readFileSync(TRAIL, "utf8")) as { protocol: string; rule: string; chainOk: boolean; records: Supersede.Record[] }
const log = doc.records

// sanity: the trail we loaded must verify as-is (no re-point crept in). If not, HALT — never write over a broken chain.
const pre = Supersede.verify(log)
if (!pre.ok) throw new Error(`refusing to append: existing supersede-trail is broken — ${pre.reason}`)

// the latest doc-truth correction (the record V8 supersedes with the headline value)
const DOC_TRUTH_LATEST = "3ab928ba6233d4f1bd84acab1b7689d59d627f83e7eb7cb56139aa924c02db0e"
if (!log.some((r) => r.hash === DOC_TRUTH_LATEST)) throw new Error("expected V7 doc-truth correction not found — abort")

// idempotency: don't double-append if this correction already exists
const ALREADY = log.some((r) => (r.payload as { trueHeadline?: string })?.trueHeadline === "REPEAT" && r.supersedes === DOC_TRUTH_LATEST)
if (!ALREADY) {
  Supersede.supersede(log, "checkpoint-v6/phase-2/doc-truth", DOC_TRUTH_LATEST, {
    headline: "V6 Phase-2 phase HEADLINE = REPEAT (filed as a value)",
    correction:
      "Warranty F-CONTINUE files corrections as VALUES, not arguments. V7's superseding record correctly DOWNGRADED " +
      "the doc-truth arm to UNMET-ON-FRESH-CLONE (a REPEAT arm), but wrapped it in a consequence-argument ('the " +
      "make-or-break gate came later and absorbed the fix, so no gate was falsely advanced'). That argument is RETIRED " +
      "as reasoning-about-consequences. The number stands on its own: with headline = MIN(arms) (C-ARMS) and the " +
      "doc-truth arm at REPEAT, the V6 Phase-2 phase headline at its checkpoint was REPEAT — not ADVANCE. The gate " +
      "history is unchanged and already recorded; this record states only the headline value.",
    supersedesHash: DOC_TRUTH_LATEST,
    trueHeadline: "REPEAT",
    rule: "T-SUPERSEDE (Warranty F-CONTINUE: corrections are values, not arguments)",
  })
}

const post = Supersede.verify(log)
if (!post.ok) throw new Error(`chain broke after append — ${post.reason}`)

const current = Supersede.current(log)
writeFileSync(TRAIL, JSON.stringify({ protocol: doc.protocol, rule: doc.rule, chainOk: post.ok, records: log, current }, null, 2) + "\n")

console.log(`supersede-trail: ${log.length} records, chain ok = ${post.ok}${ALREADY ? " (headline-value record already present — idempotent)" : " (appended V6 Phase-2 headline = REPEAT)"}`)
console.log(`  ${post.reason}`)
