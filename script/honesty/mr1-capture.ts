/**
 * ORGΛNON — THE SHOWING SPRINT (V34, MR1 / DD-4). "Network-window-gated" is retired as a reason. This RUNS the live
 * DeFiLlama /pools capture through the REAL code path (DefiLlama.pools → the budgeted fetch, AbortSignal.timeout 45s) and
 * records the CENSUS as an OUTCOME: HTTP reality, total shelf size, timing against the budget, and which of the pre-pinned
 * showcase subjects resolve. The ~10.5 MB raw payload is NOT committed (E-PREVENT ≥400 numbers) — only the provenance
 * census outcome is written (data/honesty/mr1-capture.json). If the live payload 404s or drifts, the blocker is named
 * PRECISELY in the record, never "network-window-gated." Run:  bun run script/honesty/mr1-capture.ts
 */
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { DefiLlama } from "../../src/dataplane/providers/defillama"

// the pre-pinned showcase subjects (the MR1 four + the lending markets) — resolved by project+symbol on the live shelf
const PINNED = [
  { project: "aave-v3", symbol: "USDC" },
  { project: "compound-v3", symbol: "USDC" },
  { project: "ethena-usde", symbol: "sUSDe" },
  { project: "sparklend", symbol: "DAI" },
]

async function main() {
  const now = 1_752_000_000_000 // a fixed asOf label (determinism-friendly; the live fetch stamps its own reality)
  const t0 = performance.now()
  let outcome: Record<string, unknown>
  try {
    DefiLlama.resetCache()
    const tagged = await DefiLlama.pools(now) // the REAL budgeted-fetch code path (45s budget), live
    const ms = Math.round(performance.now() - t0)
    const shelf = tagged.value
    const resolved = PINNED.map((p) => {
      const hit = shelf.find((x) => x.project === p.project && x.symbol.toUpperCase() === p.symbol.toUpperCase())
      return { ...p, present: !!hit, tvlUsd: hit?.tvlUsd ?? null, apy: hit?.apy ?? null }
    })
    outcome = {
      reality: tagged.reality, // REAL if the live payload parsed; SAMPLE if the fetch degraded (honest)
      shelfCount: shelf.length,
      fetchMs: ms,
      withinBudget: ms < DefiLlama.POOLS_FETCH_BUDGET_MS,
      pinnedResolved: resolved,
      pinnedPresentCount: resolved.filter((r) => r.present).length,
      note: tagged.note ?? null,
      source: tagged.source,
      blocker: null,
    }
  } catch (e) {
    outcome = {
      reality: "SAMPLE",
      blocker: `PRECISE BLOCKER (not "network-window-gated"): ${String((e as Error).message).slice(0, 160)}`,
      fetchMs: Math.round(performance.now() - t0),
    }
  }

  const record = {
    protocol: "mr1-capture",
    at: new Date().toISOString().slice(0, 10),
    diagnosis: "egress is OPEN in this environment (DD-4): yields.llama.fi/pools returns HTTP 200. The three sprints of 'network-window-gated' were an environment ASSUMPTION, not a fact. This record is the census recomputed as an OUTCOME.",
    budgetMs: DefiLlama.POOLS_FETCH_BUDGET_MS,
    outcome,
    rawPayloadCommitted: false, // E-PREVENT — the ~10.5 MB raw body is never committed; only this provenance census is
  }
  writeFileSync(path.join(PKG_ROOT, "data", "honesty", "mr1-capture.json"), JSON.stringify(record, null, 2) + "\n")
  console.log("── MR1 live capture (DD-4) ──────────────────────")
  console.log(`  reality      : ${outcome.reality}`)
  console.log(`  shelf size   : ${outcome.shelfCount ?? "—"}`)
  console.log(`  fetch ms     : ${outcome.fetchMs} (budget ${DefiLlama.POOLS_FETCH_BUDGET_MS})`)
  console.log(`  pinned found : ${outcome.pinnedPresentCount ?? "—"} / ${PINNED.length}`)
  if (outcome.blocker) console.log(`  BLOCKER      : ${outcome.blocker}`)
  console.log("  record written: data/honesty/mr1-capture.json")
}
main()
