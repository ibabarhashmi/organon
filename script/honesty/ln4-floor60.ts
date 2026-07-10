/**
 * ORGΛNON — THE ALPHA SPRINT, Phase 1 (LN4). WALL 1's floor-60 exercised NEAR-BOUNDARY on REAL data.
 * The Lineage validation carried LN4: the SAMPLE-never-GO floor (Lineage.SERIES_FLOOR = 60) had only ever been
 * exercised on synthetic controls. This script fetches a REAL DeFiLlama chart (the shelf's aave-v3 USDC pool),
 * constructs the three boundary windows (59 · 60 · 61 real return points) from the live series, resolves each
 * through Lineage.resolveIdentity via an injected adapter (the committed provenance chain is NOT polluted with
 * exercise keys — the points are real, the adapter is the seam), and runs Lineage.guardRender("GO", …) at the
 * boundary. Result → data/honesty/ln4-floor60.json (recorded either way — a failed fetch records the honest
 * "calibration unproven on live data" note instead of a fabricated pass).
 */
import { createHash } from "node:crypto"
import { writeFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { DataPlane } from "../../src/dataplane/store"
import { DefiLlama } from "../../src/dataplane/providers/defillama"
import { Lineage } from "../../src/studio/lineage"

const POOL_ID = "aa70268e-4b52-42bf-a116-608b370f9501" // shelf-registry: aave-v3 USDC (Ethereum) — a REAL, pinned shelf subject
const POOL_KEY = `defillama:pool:${POOL_ID}`
const OUT = path.join(PKG_ROOT, "data", "honesty", "ln4-floor60.json")
const sha256 = (b: string) => createHash("sha256").update(b).digest("hex")

const now = Date.now()
const chart = await DefiLlama.chart(POOL_ID, now)

if (chart.reality !== "REAL" || chart.value.length < 62) {
  // the honest terminal state LN4 allows: no fabricated pass, the gap recorded verbatim
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        protocol: "ln4-floor60",
        at: new Date(now).toISOString(),
        pool: POOL_KEY,
        status: "UNPROVEN",
        note: `calibration unproven on live data — the live chart fetch degraded to ${chart.reality} (${chart.note ?? "no note"}); the floor-60 boundary was NOT exercised on real data this sprint. Recorded honestly, not faked.`,
      },
      null,
      1,
    ) + "\n",
  )
  console.log("LN4: UNPROVEN (live fetch degraded) — recorded honestly.")
  process.exit(0)
}

// Stamp-usable points: each chart point with a non-null apyBase yields exactly one return (Lineage.returnsFrom).
const usable = chart.value.filter((p) => p.apyBase !== null && Number.isFinite(p.apyBase as number))

function seriesOf(n: number, key: string, reality: string): { adapter: DataPlane.Adapter; key: string } {
  const pts = usable.slice(-n).map((p) => ({ ts: p.ts, apyBase: p.apyBase, apyReward: p.apyReward ?? null, tvlUsd: p.tvlUsd ?? null }))
  const series: DataPlane.Series = {
    key,
    points: pts as DataPlane.SeriesPoint[],
    provenance: {
      source: "defillama:yields.llama.fi/chart",
      url: `https://yields.llama.fi/chart/${POOL_ID}`,
      capturedAt: now,
      contentSha: sha256(JSON.stringify(pts)),
      nonce: "ln4-exercise(adapter-injected; not chain-recorded)",
      chainPos: -1,
      reality: reality as DataPlane.Provenance["reality"],
    },
  }
  const adapter: DataPlane.Adapter = {
    name: "ln4-boundary-adapter",
    listSeries: () => [key],
    fetchSeries: (k) => (k === key ? series : null),
    provenance: (k) => (k === key ? series.provenance : null),
  }
  return { adapter, key }
}

const windows = [59, 60, 61].map((n) => {
  const { adapter, key } = seriesOf(n, POOL_KEY, "REAL-PIT")
  const id = Lineage.resolveIdentity(key, adapter)
  const guard = Lineage.guardRender("GO", id)
  return { n, nPointsResolved: id?.nPoints ?? null, verdict: guard.verdict, degraded: guard.degraded, reason: guard.reason, lineageLine: Lineage.lineageLine(id) }
})

// the reality control: the SAME 60 real points labeled non-REAL must still refuse a GO (SAMPLE-never-GO is two-clause)
const ctl = (() => {
  const { adapter, key } = seriesOf(60, POOL_KEY, "ILLUSTRATIVE")
  const guard = Lineage.guardRender("GO", Lineage.resolveIdentity(key, adapter))
  return { n: 60, reality: "ILLUSTRATIVE", verdict: guard.verdict, degraded: guard.degraded }
})()

const pass =
  windows[0].verdict === "INSUFFICIENT" && windows[0].degraded &&
  windows[1].verdict === "GO" && !windows[1].degraded &&
  windows[2].verdict === "GO" && !windows[2].degraded &&
  ctl.verdict === "INSUFFICIENT" && ctl.degraded

writeFileSync(
  OUT,
  JSON.stringify(
    {
      protocol: "ln4-floor60",
      at: new Date(now).toISOString(),
      pool: POOL_KEY,
      status: pass ? "PROVEN-ON-LIVE-DATA" : "FAILED",
      method:
        "the live REAL chart (defillama /chart, this session) sliced to the three boundary windows (59·60·61 real return points) + the ILLUSTRATIVE-reality control on the same 60 points; resolved through Lineage.resolveIdentity via an injected adapter (the committed provenance chain is not polluted with exercise keys — the POINTS are real, the ADAPTER is the seam); guardRender('GO', identity) at each window.",
      liveChart: { source: "defillama:yields.llama.fi/chart", fetchedPoints: chart.value.length, usableReturnPoints: usable.length, reality: chart.reality },
      windows,
      realityControl: ctl,
      conclusion: pass
        ? "WALL 1's floor-60 calibration HOLDS near-boundary on live data: 59 real points → INSUFFICIENT (degraded), 60 and 61 real points → the GO renders; the same 60 real points labeled non-REAL → INSUFFICIENT. LN4 CLOSED."
        : "the boundary behavior did NOT match the wall's contract — LN4 stays OPEN; see windows.",
    },
    null,
    1,
  ) + "\n",
)
console.log(`LN4: ${pass ? "PROVEN-ON-LIVE-DATA" : "FAILED"} — ${windows.map((w) => `${w.n}→${w.verdict}`).join(" · ")} · ctl(ILLUSTRATIVE,60)→${ctl.verdict}`)
