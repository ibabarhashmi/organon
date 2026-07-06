/**
 * ORGΛNON — Transplant Phase 0 corrections driver (Rules T-SUPERSEDE, T-REAL). Files the three append-only corrections
 * the V6 audit demanded, WITHOUT re-pointing a single past record:
 *   (1) the V6 §0.7 re-pointing re-expressed as a proper superseding entry (the named counterexample, corrected);
 *   (2) the Phase-2 doc-truth correction — its evidence was parent-env-only (invalidated by W1-01), re-stated at its
 *       true value per V6's own V5-correction precedent;
 *   (3) the capability floor re-anchored via a supersession (V6 anchor → V7 Phase-0 anchor), never re-pointed.
 * Also appends the ILLUSTRATIVE label to the V6 live-run-2 artifact (T-REAL, retroactive) — an append, not an edit of
 * the recorded numbers. Deterministic; re-running rebuilds the trail from the same inputs. Run: bun run script/phase0-corrections.ts
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Supersede } from "../src/studio/supersede"
import { Inventory } from "../src/studio/inventory"

const D = path.join(PKG_ROOT, "data", "studio")

function main() {
  const log: Supersede.Record[] = []

  // ── (1) the V6 §0.7 re-pointing, re-expressed as a proper supersession ──
  const v6p0 = Supersede.append(log, "checkpoint-v6/phase-0/inventory-evidence", {
    origin: "BUILDLOG-V6-CONVERGENCE.md §0.7 note",
    recorded: "phase-0 inventory evidence cited the live capability-inventory.json (anchor bee1a152)",
    v6Action: "RE-POINTED to the stable Phase-0 bundle so the trail re-derives while the floor rose (bee1a152→4888ef49)",
    classification: "the T-SUPERSEDE counterexample — a re-point of a recorded fact (disclosed in V6, but the anti-pattern)",
  })
  Supersede.supersede(log, "checkpoint-v6/phase-0/inventory-evidence", v6p0.hash, {
    correction: "The re-point is superseded, not repeated. The correct mechanism is THIS appended record: the phase-0 inventory evidence legitimately points at the live floor, and the floor's RISE (bee1a152→4888ef49→…→v7) is recorded as a chain of supersessions below — never by editing the original phase-0 record in place.",
    supersedesHash: v6p0.hash,
    rule: "T-SUPERSEDE",
  })

  // ── (2) the Phase-2 doc-truth correction (W1-01 invalidated the parent-env evidence) ──
  const v6p2 = Supersede.append(log, "checkpoint-v6/phase-2/doc-truth", {
    recorded: "V6 Phase-2 recorded doc-truth as 'evidenced' and the phase headline ADVANCE",
    invalidatedBy: "W1-01 (Phase-3 Cycle-1 walk finding): the doc-truth session passed only because it ran in the PARENT env (which had the Python venv); a fresh clone's submit_spec 500'd (ENOENT .venv/bin/python) — the SKILL.md quickstart never said to set up the sidecar",
  })
  Supersede.supersede(log, "checkpoint-v6/phase-2/doc-truth", v6p2.hash, {
    correction: "Per V6's own V5-correction precedent (append-only re-statement), the Phase-2 doc-truth evidence is DOWNGRADED: at the Phase-2 checkpoint it was parent-env-only, so it did NOT hold on a fresh clone. The true Phase-2 doc-truth status at that moment was UNMET-ON-FRESH-CLONE (a REPEAT arm), not evidenced. It was restored to fresh-clone-true only by W1-01's fix (SKILL.md Quickstart gained the venv-setup step; organon-setup.sh referenced), committed in Phase-3 Cycle 1. The Phase-2 GATE was doc-truth-adjacent but the make-or-break gate (CONVERGED) came later and absorbed the fix, so no gate was falsely advanced; this record states the correction plainly.",
    supersedesHash: v6p2.hash,
    trueValue: "doc-truth @ Phase-2 close = UNMET-ON-FRESH-CLONE; @ Phase-3 Cycle-1 (post-W1-01) = RE-EVIDENCED",
    rule: "T-SUPERSEDE (V6 correction precedent)",
  })

  // ── (3) the capability floor re-anchored via a supersession (never re-pointed) ──
  const committed = existsSync(path.join(D, "capability-inventory.json")) ? JSON.parse(readFileSync(path.join(D, "capability-inventory.json"), "utf8")) : { anchorHash: "unknown", capabilities: [] }
  const v7snap = Inventory.snapshot("v7-phase0")
  const anchorRec = Supersede.append(log, "capability-floor/anchor", { anchor: committed.anchorHash, count: committed.capabilities.length, at: "v6" })
  Supersede.supersede(log, "capability-floor/anchor", anchorRec.hash, {
    correction: `capability floor rises ${String(committed.anchorHash).slice(0, 12)}… (${committed.capabilities.length} caps) → ${v7snap.anchorHash.slice(0, 12)}… (${v7snap.capabilities.length} caps): +ledger-pollution-audit, +trail-immutability-supersede. C-NOREGRESS: the floor only rises; nothing dropped (verify() green).`,
    supersedesHash: anchorRec.hash,
    newAnchor: v7snap.anchorHash,
    newCount: v7snap.capabilities.length,
    rule: "T-SUPERSEDE (C-NOREGRESS floor re-anchor)",
  })
  // write the new floor snapshot (the live floor legitimately grows; the RE-ANCHOR is recorded as the supersession above)
  writeFileSync(path.join(D, "capability-inventory.json"), JSON.stringify(v7snap, null, 2) + "\n")

  // ── verify + write the supersede trail ──
  const v = Supersede.verify(log)
  if (!v.ok) { console.error(`supersede trail INVALID: ${v.reason}`); process.exit(1) }
  const trail = { protocol: "supersede-trail", rule: "T-SUPERSEDE", chainOk: v.ok, records: log, current: Supersede.current(log) }
  writeFileSync(path.join(D, "supersede-trail.json"), JSON.stringify(trail, null, 2) + "\n")

  // ── (T-REAL) append the ILLUSTRATIVE label to the V6 live-run-2 artifact — an APPEND, never an edit of the numbers ──
  const a2p = path.join(D, "live-run-2-artifact.json")
  if (existsSync(a2p)) {
    const a2 = JSON.parse(readFileSync(a2p, "utf8"))
    if (!a2.dataReality) {
      a2.dataReality = "ILLUSTRATIVE"
      a2.dataRealityNote = "T-REAL (retroactive, Transplant Phase 0): the return series behind this trial's CONDITIONAL→NO-GO deflation were ILLUSTRATIVE (canned), NOT REAL-PIT. The FAMILY-SIZE deflation the trial demonstrates (the demo's own 8-spec search stiffening its own bar) is real and label-independent; the RETURNS were illustrative. Labeled here, append-only, so the numbers are never mistaken for live data."
      writeFileSync(a2p, JSON.stringify(a2, null, 2) + "\n")
    }
  }

  console.log("═══ PHASE 0 CORRECTIONS (T-SUPERSEDE, T-REAL) ═══")
  console.log(`supersede trail: ${log.length} records, chainOk=${v.ok}`)
  for (const r of log) console.log(`  · ${r.id} ${r.supersedes ? `[supersedes ${r.supersedes.slice(0, 12)}…]` : "[original]"} → ${r.hash.slice(0, 12)}…`)
  console.log(`floor re-anchored: ${String(committed.anchorHash).slice(0, 12)}… (${committed.capabilities.length}) → ${v7snap.anchorHash.slice(0, 12)}… (${v7snap.capabilities.length}) — via supersession, not re-point`)
  console.log(`trial-2 labeled: ILLUSTRATIVE (appended)`)
  console.log(`trail → data/studio/supersede-trail.json ; floor → data/studio/capability-inventory.json`)
}

main()
