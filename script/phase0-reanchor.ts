/**
 * ORGΛNON — Warranty Phase 0: re-anchor the C-NOREGRESS capability floor (33 → 35) and record the rise as a SUPERSEDING
 * entry (T-SUPERSEDE — never re-pointed). First proves NO REGRESSION: the live tree must still satisfy the OLD pinned
 * floor (every prior capability's proving test intact) before the floor may rise. Only then is the new 35-cap snapshot
 * written and the rise chained into supersede-trail.json. Deterministic; idempotent.
 * Run:  bun run script/phase0-reanchor.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../src/organon/frozen"
import { Inventory } from "../src/studio/inventory"
import { Supersede } from "../src/studio/supersede"

const INV = path.join(PKG_ROOT, "data", "studio", "capability-inventory.json")
const TRAIL = path.join(PKG_ROOT, "data", "studio", "supersede-trail.json")

const LABEL = process.argv[2] ?? "v8-phase0"
const oldPinned = JSON.parse(readFileSync(INV, "utf8")) as Inventory.Snapshot
// 1. NO REGRESSION: the live tree must still satisfy every capability the OLD floor pinned.
const reg = Inventory.verify(oldPinned)
if (!reg.ok) throw new Error(`REGRESS — the live tree fails the old floor before re-anchor: ${JSON.stringify(reg.regressions)}`)
const oldCount = oldPinned.capabilities.length

// 2. snapshot the new floor and write it.
const snap = Inventory.snapshot(LABEL)
writeFileSync(INV, JSON.stringify(snap, null, 2) + "\n")
const newCount = snap.capabilities.length

// 3. record the rise as a superseding floor anchor (chained, never re-pointed).
const doc = JSON.parse(readFileSync(TRAIL, "utf8")) as { protocol: string; rule: string; chainOk: boolean; records: Supersede.Record[] }
const log = doc.records
const pre = Supersede.verify(log)
if (!pre.ok) throw new Error(`refusing to append: supersede-trail broken — ${pre.reason}`)
// the latest floor anchor to supersede
const floorAnchors = log.filter((r) => r.id === "capability-floor/anchor")
const lastFloor = floorAnchors[floorAnchors.length - 1]
const ALREADY = log.some((r) => (r.payload as { newCount?: number })?.newCount === newCount && (r.payload as { at?: string })?.at === LABEL)
if (!ALREADY && lastFloor) {
  Supersede.supersede(log, "capability-floor/anchor", lastFloor.hash, {
    correction: `capability floor rises ${oldCount} -> ${newCount} caps (Warranty ${LABEL}). C-NOREGRESS: the floor only rises; the old floor verified green before this re-anchor; nothing dropped.`,
    supersedesHash: lastFloor.hash,
    newAnchor: snap.anchorHash,
    newCount,
    at: LABEL,
    rule: "T-SUPERSEDE (C-NOREGRESS floor re-anchor)",
  })
}
const post = Supersede.verify(log)
if (!post.ok) throw new Error(`chain broke after floor re-anchor — ${post.reason}`)
writeFileSync(TRAIL, JSON.stringify({ protocol: doc.protocol, rule: doc.rule, chainOk: post.ok, records: log, current: Supersede.current(log) }, null, 2) + "\n")

console.log(`floor re-anchored ${oldCount} -> ${newCount} caps; anchor ${snap.anchorHash.slice(0, 12)}…; old floor verified (no regression); trail ${log.length} records chain ok=${post.ok}`)
