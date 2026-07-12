/**
 * ORGΛNON — THE DEFILLAMA YIELDS BREADTH LAYER (Coverage sprint; X-COVERAGE a,b,d). The cold-start fix: not a bigger
 * curated shelf but a LOOKUP PATH into the covered universe. Reuses the existing keyless DeFiLlama seam (getJson +
 * parsePool — PART CLEAN, no second HTTP client) and adds three pure pieces:
 *   · universe(now) — the FULL valid-pool set (NOT the isShelf subset), tagged REAL-at-timestamp, content-hashable;
 *   · a typed lookup (validateId → find → facts) that REFUSES hostile/absent ids with a sentence, never a crash;
 *   · the coverage census (the pinned 'covered' definition applied — SAMPLE-only does NOT count).
 * Every DeFiLlama-sourced number is REAL-at-timestamp (an aggregator response: re-fetchable + hashable at time T, but
 * COMPUTED and retroactively revisable) — NEVER REAL★ (block-pinned chain-reproducible). The license posture lives in
 * CoveragePosture below (X-COVERAGE a): the non-commercial ToS is a rendered fact; branch γ degrades to SAMPLE.
 */
import { createHash } from "node:crypto"
import { DefiLlama } from "./defillama"
import type { Scorecard } from "../../analytics/scorecard" // TYPE-ONLY — no runtime dep; the lookup builds the facts, the caller scores

export namespace LlamaYields {
  // the provenance TIER of every DeFiLlama-sourced number (X-COVERAGE c). An aggregator response is re-fetchable and
  // content-hashable AT A TIMESTAMP, but computed and RETROACTIVELY REVISABLE — so it is REAL-at-timestamp, never REAL★.
  export const TIER = "REAL-at-timestamp" as const
  export type ProvTier = "REAL★" | "REAL-at-timestamp"

  export interface Universe { pools: DefiLlama.Pool[]; reality: DefiLlama.Reality; asOf: number; count: number; contentSha: string; note?: string }

  // content hash of the universe (the covered set made a moat artifact) — canonical: sort by pool id, hash the ids+apy.
  export function universeSha(pools: DefiLlama.Pool[]): string {
    const canon = [...pools].sort((a, b) => a.pool.localeCompare(b.pool)).map((p) => `${p.pool}|${p.apyBase}|${p.apy}|${p.tvlUsd}`).join("\n")
    return createHash("sha256").update(canon).digest("hex")
  }

  // the FULL covered universe (all valid pools — NOT isShelf-filtered). Degrade-never-throw: no data → empty + SAMPLE.
  export async function universe(now: number, fetchImpl: DefiLlama.FetchImpl = ((u) => fetch(u) as unknown as Promise<DefiLlama.FetchResult>), env: Record<string, string | undefined> = process.env): Promise<Universe> {
    const rt = DefiLlama.route(env)
    const { body, reality, note } = await DefiLlama.getJson(`${rt.fetchBase}/pools`, now, fetchImpl)
    const data = (body as { data?: unknown })?.data
    if (!Array.isArray(data)) return { pools: [], reality: "SAMPLE", asOf: now, count: 0, contentSha: universeSha([]), note: note ?? "no data — the covered universe is unavailable (offline)" }
    const pools = data.map(DefiLlama.parsePool).filter(Boolean) as DefiLlama.Pool[]
    return { pools, reality, asOf: now, count: pools.length, contentSha: universeSha(pools), note }
  }

  // find a pool by its DeFiLlama id within a universe (the lookup key strips the defillama:pool: prefix).
  export function find(poolId: string, pools: DefiLlama.Pool[]): DefiLlama.Pool | null {
    const id = poolId.replace(/^defillama:pool:/, "")
    return pools.find((p) => p.pool === id) ?? null
  }

  // validate a lookup id — a DeFiLlama pool id is a uuid-ish hex string. Hostile/garbage → a typed refusal (never a crash).
  export function validateId(raw: string): { ok: true; id: string } | { ok: false; reason: string } {
    const id = String(raw ?? "").replace(/^defillama:pool:/, "").trim()
    if (!id) return { ok: false, reason: "no pool id given — name a pool in the covered universe. Nothing is fabricated." }
    if (id.length > 100) return { ok: false, reason: "that id is too long to be a DeFiLlama pool id — nothing looked up, nothing fabricated." }
    if (!/^[a-fA-F0-9-]{6,80}$/.test(id)) return { ok: false, reason: "that is not a valid DeFiLlama pool id (expected a uuid-like hex string) — nothing looked up, nothing fabricated." }
    return { ok: true, id }
  }

  // the pinned 'covered' definition (X-COVERAGE d): a pool is COVERED iff it renders AT LEAST the yield-reality axis at
  // REAL-at-timestamp tier or better — i.e., a REAL aggregator apy exists. A SAMPLE-only pool does NOT count as covered.
  export function isCovered(p: DefiLlama.Pool | null, reality: DefiLlama.Reality): boolean {
    if (!p || reality !== "REAL") return false
    return p.apyBase !== null || p.apy !== null
  }

  const DAY = 86_400_000
  // (tvl_now − tvl_30d_ago)/tvl_30d_ago from a DeFiLlama chart (same formula as Feed.tvlSlope30d); null if <30d or absent
  // → the tvl-trend axis renders UNVERIFIED (honest thinness on a looked-up pool). Pure.
  export function tvlSlope30d(chart: DefiLlama.ChartPoint[], now: number): number | null {
    if (!chart.length || chart[0].ts > now - 30 * DAY) return null
    const asOf = (t: number) => { let best: DefiLlama.ChartPoint | null = null; for (const p of chart) if (p.ts <= t && (best === null || p.ts > best.ts)) best = p; return best }
    const nn = asOf(now), pp = asOf(now - 30 * DAY)
    const tn = nn?.tvlUsd ?? null, tp = pp?.tvlUsd ?? null
    if (tn === null || tp === null || tp <= 0) return null
    return (tn - tp) / tp
  }

  // build PoolFacts from a looked-up pool + its chart — the LOOKUP degrades PER-AXIS, natively (X-COVERAGE b): yield-reality
  // from the aggregator apy (REAL-at-timestamp); tvl-trend from the chart (UNVERIFIED where <30d); peg UNVERIFIED (a lookup
  // does not fetch peg — honest thinness); the contract axis renders UNVERIFIED (no build analyzed for an arbitrary pool).
  // reality is REAL only when the pool clears the pinned 'covered' bar; a thin/SAMPLE pool renders SAMPLE → UNVERIFIED.
  export function lookupFacts(pool: DefiLlama.Pool, chart: DefiLlama.ChartPoint[], reality: DefiLlama.Reality, now: number): Scorecard.PoolFacts {
    return {
      name: `${pool.project} ${pool.symbol}`.trim() || pool.pool,
      apyBase: pool.apyBase ?? pool.apy,
      apyReward: pool.apyReward,
      tvlSlope30d: tvlSlope30d(chart, now),
      pegDev: null, // a lookup does not fetch the peg → the peg axis renders UNVERIFIED (never a fabricated deviation)
      isStablecoin: pool.stablecoin,
      reality: isCovered(pool, reality) ? "REAL" : "SAMPLE",
      provenanceRef: null,
      vertical: "lending",
    }
  }

  export interface Census { protocol: "coverage-census"; asOf: number; universeSize: number; reality: DefiLlama.Reality; covered: number; sampleOnly: number; hitRateOfSample: number | null; coveredDefinition: string; tierBreakdown: { "REAL-at-timestamp": number; "SAMPLE-not-covered": number }; note: string }

  // the coverage census — an OUTCOME, recorded as measured (X-COVERAGE d). NEVER a target: the covered count applies the
  // pinned definition exactly; a SAMPLE-only pool is counted sampleOnly, never covered (a gamed census is a Halt / S64).
  export function census(u: Universe, now: number): Census {
    const covered = u.pools.filter((p) => isCovered(p, u.reality)).length
    const sampleOnly = u.pools.length - covered
    return {
      protocol: "coverage-census", asOf: now, universeSize: u.pools.length, reality: u.reality,
      covered, sampleOnly, hitRateOfSample: null,
      coveredDefinition: "a pool is COVERED iff a REAL aggregator yield exists (≥ the yield-reality axis at REAL-at-timestamp); SAMPLE-only does NOT count",
      tierBreakdown: { "REAL-at-timestamp": covered, "SAMPLE-not-covered": sampleOnly },
      note: u.reality === "SAMPLE" ? "the universe is SAMPLE/offline — 0 covered (honest; the census is never inflated by counting thin lookups)" : "measured over the live covered universe",
    }
  }
}

// ── THE LICENSE POSTURE (X-COVERAGE a) — the DeFiLlama non-commercial ToS is a RENDERED FACT, not a hope. Three branches,
// pre-designed so the integration cannot stall; branch γ (the honest closed-alpha default) DEGRADES DeFiLlama-sourced
// numbers to SAMPLE-labeled in any SERVED COMMERCIAL context. The Operator action (D32) flips α/β; the agent never signs. ──
export namespace CoveragePosture {
  export type Branch = "alpha" | "beta" | "gamma"
  // the STANDING existing-use exposure + the ToS, rendered where a user of a served product can see it (verbatim-derived).
  export const TOS_VERBATIM = "DeFiLlama's data is under a NON-COMMERCIAL license (liquidated damages up to USD 100,000 per violation). ORGΛNON already uses the free tier, so the exposure is standing, not hypothetical — the license posture is a dated Operator business action (D32)."
  export const BRANCHES = {
    alpha: "written commercial consent obtained → the breadth layer serves",
    beta: "the paid API plan purchased (the API subscription, NOT the $300/mo Pro dashboards) → serves under paid terms",
    gamma: "consent deferred → DeFiLlama numbers render SAMPLE-labeled in served commercial contexts; vaults.fyi promotes",
  } as const

  // the current branch — from the Operator's dated action (env), DEFAULT γ (the honest closed-alpha posture; never a
  // silent commercial serve on the free tier). ORGANON_DEFILLAMA_LICENSE = consent | paid | (unset → gamma).
  export function branch(env: Record<string, string | undefined> = process.env): Branch {
    const b = (env.ORGANON_DEFILLAMA_LICENSE ?? "").toLowerCase()
    return b === "consent" ? "alpha" : b === "paid" ? "beta" : "gamma"
  }
  export function serves(env: Record<string, string | undefined> = process.env): boolean { return branch(env) !== "gamma" }

  // in a SERVED COMMERCIAL context under branch γ, a DeFiLlama REAL number DEGRADES to SAMPLE-labeled (S64). Non-commercial
  // contexts (a local reader, the battery) are unaffected — the render shows real facts locally; the DEGRADE is the
  // commercial-serve guard. Returns the effective reality + whether it was degraded by the posture.
  export function effectiveReality(reality: DefiLlama.Reality, commercialContext: boolean, env: Record<string, string | undefined> = process.env): { reality: DefiLlama.Reality; degradedByPosture: boolean; posture: string } {
    if (reality === "REAL" && commercialContext && branch(env) === "gamma") {
      return { reality: "SAMPLE", degradedByPosture: true, posture: `DeFiLlama data shown SAMPLE-labeled — ${BRANCHES.gamma}. ${TOS_VERBATIM}` }
    }
    return { reality, degradedByPosture: false, posture: TOS_VERBATIM }
  }
}
