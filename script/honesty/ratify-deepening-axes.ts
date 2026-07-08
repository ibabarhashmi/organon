/**
 * ORGΛNON — Deepening Phase 5: append the DEEPENING-RISK-AXES ADOPT row to the ratification chain (R-RATIFY). The three
 * new deterministic axes are src/analytics build surface — they enter by ratification, never by fiat: an ADOPT row citing
 * the research (the risks that actually kill DeFi money beyond yield), a cheap pre-build test (the seeded positive
 * controls S11/S12/S13), and its flip-criteria. Append-only: the existing entries replay (reproducing their hashes) and
 * the new row is chained. Run: bun run script/honesty/ratify-deepening-axes.ts
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ratify } from "../../src/studio/ratify"

const TABLE = path.join(PKG_ROOT, "data", "studio", "research-ratification-v14.json")
const raw = JSON.parse(readFileSync(TABLE, "utf8")) as { protocol: string; chainOk: boolean; entries: Ratify.Entry[] }

const led = new Ratify.Ledger()
for (const e of raw.entries) led.record({ item: e.item, disposition: e.disposition, researchFinding: e.researchFinding, reason: e.reason, cheapTest: e.cheapTest, flipCriteria: e.flipCriteria, buildArtifacts: e.buildArtifacts, park: e.park, experiment: e.experiment, supersedes: e.supersedes, note: e.note, stamp: e.stamp })

if (!led.all().some((e) => e.stamp === "deepening-risk-axes-adopt")) {
  led.record({
    item: "deepening-risk-axes",
    disposition: "ADOPT",
    researchFinding: "Beyond a durable-vs-emissions yield split, three structured risks kill DeFi money: (1) THIN LIQUIDITY — a fat APY on a shallow pool cannot be exited without ruinous slippage (the exit is the trade); (2) UNLOCK OVERHANG — an imminent large token unlock dilutes a reward token, collapsing the emissions that fund a mercenary yield; (3) a YOUNG / DUST counterparty — a brand-new, tiny protocol is a structural (not code-audited) risk that a large, multi-year one is not.",
    reason: "Three new deterministic pure-function axes over hash-locked thresholds, each rendering `not-applicable` (a distinct honest state, never a pass) where it doesn't apply to the vertical: liquidity-depth (GeckoTerminal reserve_in_usd: >=500k deep / <50k thin), unlock-overhang (next-30d unlock / mcap: <=1% / >5%), and the counterparty screen (pool age from the recorded /chart span + size from TVL) — LABELED a coarse structural screen, NOT a contract audit (deep contract analysis stays parked; dependency is a non-scoring note). No inference: rules over structured facts (X-DETERM). The unlock feed went keyless->paid (HTTP 402, deviation D4) — the axis degrades to UNVERIFIED, never scraped/faked.",
    cheapTest: "The seeded positive controls: S11 a deep-APY pool with dust ($20k) liquidity -> liquidity FAIL -> not SOLID; S12 a 20%-of-mcap unlock in 30d -> unlock FAIL -> AVOID; S13 a 5-day $200k pool -> counterparty flag (fail), honestly labeled coarse, never 'audited/safe'. All CAUGHT (honesty_liquidity/unlock/counterparty.test.ts).",
    flipCriteria: "If a knowledgeable user consistently disagrees with an axis on real pools (the thresholds don't track how money dies), the thresholds or the axis are revised via a conscious re-pin — or, if an axis cannot be made trustworthy on the available keyless data (as the unlock axis is today), it is recorded as a NAMED gap (UNVERIFIED / a deviation), never tuned to look right (X-HONEST / A'#5).",
    buildArtifacts: ["src/analytics/scorecard.ts", "src/dataplane/providers/geckoterminal.ts"],
    note: "Thresholds are the hash-locked deepening-pins constants (DEEPENING PINS_SHA d66f4613...). The axes are new ROWS on the byte-untouched WHY engine + the existing consumer verdict; the frozen GO/NO-GO adjudicator stays dormant (X-KEEP); the verdict differential (lending 70c7912f + funding NO-GO) reproduces at every gate.",
    stamp: "deepening-risk-axes-adopt",
  })
  writeFileSync(TABLE, JSON.stringify({ ...raw, chainOk: led.verifyChain().ok, entries: led.all() }, null, 2) + "\n")
  console.log(`appended deepening-risk-axes ADOPT · entries ${raw.entries.length}->${led.all().length} · chainOk ${led.verifyChain().ok}`)
} else {
  console.log("deepening-risk-axes already ratified — no-op")
}
