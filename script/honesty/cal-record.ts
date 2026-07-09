/**
 * ORGΛNON — THE VOICE SPRINT, Phase 4 driver (CAL-ARMED). Start the calibration clock (X-CAL): record the ENGINE-DERIVED
 * implicit predictions the decay gate + the funding-regime facts are ALREADY making, at capture time, into an append-only,
 * hash-chained ledger (data/honesty/cal-ledger.json). RECORD-ONLY — no score, no backfill; the only surface is the count.
 *
 * The predictions are DETERMINISTIC + engine-derived (never a model):
 *   · decay-tier-persistence — for each yield pool whose Stamp scores a decay tier, "the recorded edge's <TIER> persists".
 *   · funding-regime-state   — for each delta-neutral pool with a funding-regime reading, "the <state> funding regime holds".
 * A fixed ASOF keeps the committed ledger diff-stable; the shelf-registry order keeps the chain deterministic.
 *
 * Run: bun run script/honesty/cal-record.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Reality } from "../../src/studio/reality"
import { Stamp } from "../../src/studio/stamp"
import { Cal } from "../../src/cal/ledger"

const ASOF = Date.parse("2026-07-09T00:00:00Z") // a fixed capture stamp — the committed ledger is diff-stable
const SINCE = "2026-07-09"
const HORIZON = "30d"

const reg = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "shelf-registry.json"), "utf8")).pools as { poolKey: string; name: string }[]

let ledger = Cal.empty(SINCE)
for (const p of reg) {
  const rc = Reality.realityCheck(p.poolKey, ASOF)
  if (!rc) continue
  // funding-regime-state (delta-neutral pools) — the regime the funding band implies, predicted to hold over the horizon
  const fr = rc.scored.rows.find((r) => r.axis === "funding-regime")
  if (fr && fr.tier !== "not-applicable") {
    const state = fr.tier === "pass" ? "carry-positive" : fr.tier === "fail" ? "carry-adverse" : "unconfirmed"
    ledger = Cal.append(ledger, { subject: p.poolKey, predictionType: "funding-regime-state", prediction: `the ${state} funding regime holds`, statedAt: ASOF, horizon: HORIZON })
  }
  // decay-tier-persistence (yield pools whose Stamp scores a decay tier) — the tier classification, predicted to persist
  const st = await Stamp.stampFor(p.poolKey)
  if (st.decay && st.decay.tier !== "INSUFFICIENT") {
    ledger = Cal.append(ledger, { subject: p.poolKey, predictionType: "decay-tier-persistence", prediction: `the recorded edge's ${st.decay.tier} classification persists`, statedAt: ASOF, horizon: HORIZON })
  }
}

writeFileSync(path.join(PKG_ROOT, "data", "honesty", "cal-ledger.json"), JSON.stringify(ledger, null, 2) + "\n")

const chain = Cal.verify(ledger)
const s = Cal.status(ledger)
console.log("── VOICE — PHASE 4 (CAL-ARMED) ───────────────────────────────")
console.log(`entries recorded : ${ledger.entries.length}`)
console.log(`by type          : decay-tier-persistence ${ledger.entries.filter((e) => e.predictionType === "decay-tier-persistence").length} · funding-regime-state ${ledger.entries.filter((e) => e.predictionType === "funding-regime-state").length}`)
console.log(`chain            : ${chain.ok ? "OK (hash-chained)" : "BROKEN at " + chain.brokenAt}`)
console.log(`head hash        : ${ledger.headHash.slice(0, 16)}…`)
console.log(`status           : ${s.line}`)
console.log(`written          : data/honesty/cal-ledger.json`)
