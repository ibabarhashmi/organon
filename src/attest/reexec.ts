import path from "node:path"
import { existsSync, readFileSync } from "node:fs"
import { Runner } from "../backtest/runner"
import { StrategySpec } from "../strategy/spec"

// ORGΛNON — Attestation Hardening: the EARNED-TIER RE-EXECUTOR (STANDALONE SLIM; Rule XIV; Appendix A).
//
// A tier is EARNED by independent reproduction, never granted by declaration. This standalone build carries the
// sidecar-driven executors (lending-carry on a supplied/on-disk panel, the labeled demo-genuine fixture, and the V1
// claimant-data reproduction check) BYTE-FAITHFUL. The rwa-allocation own-data re-execution is NOT carried (the
// marketdata/universe PIT engine data-plane lives only in the monorepo); the honesty layer removed the dead RWA
// runtime path, so an rwa-allocation spec falls through to null ⇒ the adjudicator caps it at V0 (CANNOT-VERIFY-DATA),
// NEVER a false V2 — identical to any spec whose legs are not in a populated PIT Universe (every studio-path spec). The
// absence is honest, disclosed, and fail-safe (inventory absence rwa-own-data-reexecution).

export namespace AttestReexec {
  export interface ReExec {
    returns: number[]
    family: string
    nTrials: number // the engine's OWN search context (real n_trials for the honest DSR — never a claimant-declared one)
    window: { start: number; end: number } | null
    steps: string[] // provenance: what actually ran (the truthful verified ledger is built from THIS)
    synthetic: boolean // true only for the labeled capability-demonstration fixture (disclosed; not a real market)
  }

  const toReturns = (equity: [number, number][]) => equity.slice(1).map((p, i) => p[1] / equity[i][1] - 1)

  function gauss(seed: number) {
    let s = seed >>> 0
    const u = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
    return () => Math.sqrt(-2 * Math.log(Math.max(u(), 1e-12))) * Math.cos(2 * Math.PI * u())
  }

  function t1Path(): string | null {
    let dir = import.meta.dir
    for (let i = 0; i < 10; i++) {
      const candidate = path.join(dir, "data", "lending", "onchain", "t1-history.json")
      if (existsSync(candidate)) return candidate
      const parent = path.dirname(dir)
      if (parent === dir) break
      dir = parent
    }
    return null
  }

  // ── lending-carry: the engine's OWN lending executor (lending_accrual) on the engine's T1 on-chain panel. Sidecar +
  //    on-disk panel only — no marketdata/universe coupling, so it travels byte-faithful. ──
  async function execLending(spec: unknown): Promise<ReExec | null> {
    const p = t1Path()
    if (!p) return null
    const t1 = JSON.parse(readFileSync(p, "utf8")) as {
      markets: { symbol: string; series: { ts: number; supplyApy: number; utilization: number; tvl: number }[] }[]
    }
    if (!t1.markets?.length) return null
    const markets = t1.markets.map((m) => ({
      key: m.symbol,
      series: {
        apyBase: m.series.map((pt) => [pt.ts, pt.supplyApy]),
        utilization: m.series.map((pt) => [pt.ts, pt.utilization]),
        tvl: m.series.map((pt) => [pt.ts, pt.tvl]),
        turnover: m.series.map((pt, i) => [pt.ts, Math.max(Math.abs(pt.tvl - (i > 0 ? m.series[i - 1].tvl : pt.tvl)), 1)]),
      },
    }))
    const allTs = t1.markets.flatMap((m) => m.series.map((pt) => pt.ts))
    const window = { start: Math.min(...allTs), end: Math.max(...allTs) }
    const policy = (spec as { policy?: string })?.policy ?? "carry-tilt"
    const jobSpec = {
      family: "lending-carry",
      policy,
      rebalance: { trigger: "monthly" },
      markets: markets.map((m) => ({ key: m.key, weight: 1 / markets.length })),
    }
    const out = await Runner.sidecar("lending_accrual", {
      spec: jobSpec,
      window,
      markets,
      costs: { slippageK: 0.1, feeBps: 5, gasUsd: 25 },
      capitalUsd: 1_000_000,
    })
    const equity = (out.equity_curve ?? []) as [number, number][]
    if (equity.length < 2) return null
    return {
      returns: toReturns(equity),
      family: "lending-carry",
      nTrials: 1, // the engine ran ONE lending-carry policy on its own panel (its real search context)
      window,
      steps: [
        `parsed the submitted spec into the engine's lending-carry family (policy=${policy})`,
        "ran the engine's OWN lending_accrual executor on ORGΛNON's T1 on-chain panel (overlap-validated PIT data)",
        "scored rigor on the engine-produced carry returns (not the submitter's)",
      ],
      synthetic: false,
    }
  }

  // ── demo-genuine (LABELED capability-demonstration fixture — NOT a real market): an engine-fixed synthetic PIT
  //    series carrying a genuine positive drift, from an ENGINE-side constant seed. Pure; travels byte-faithful. ──
  const DEMO_GENUINE_SEED = 11
  const DEMO_GENUINE_MEAN = 0.0015
  async function execDemoGenuine(): Promise<ReExec> {
    const g = gauss(DEMO_GENUINE_SEED)
    const returns = Array.from({ length: 504 }, () => DEMO_GENUINE_MEAN + 0.01 * g())
    return {
      returns,
      family: "demo-genuine",
      nTrials: 1,
      window: null,
      steps: [
        "generated the engine's fixed-seed synthetic PIT series (SYNTHETIC capability-demonstration fixture — engine-controlled, singular, not caller-fabricable)",
        "scored rigor on the engine-produced series",
      ],
      synthetic: true,
    }
  }

  // Execute a recognized spec family on the ENGINE's OWN data. Returns null for an un-executable spec (⇒ V0).
  export async function executeOwnData(spec: unknown): Promise<ReExec | null> {
    const family = (spec as { family?: string })?.family
    // rwa-allocation is un-executable in the standalone (no PIT Universe) ⇒ falls through to null ⇒ capped at V0 below.
    if (family === "lending-carry") return execLending(spec)
    if (family === "demo-genuine") return execDemoGenuine()
    return null // unknown / non-runnable ⇒ un-executable ⇒ capped at V0 (never a false V2)
  }

  // V1 reproduction check: re-simulate the spec on the CLAIMANT's runnable data. Sidecar-only — travels byte-faithful.
  export interface Consistency {
    checked: boolean
    consistent: boolean
    maxRelDev: number | null
    tolerance: number
    note: string
  }
  export const V1_TOLERANCE = 0.01 // ≤1% path deviation (Appendix A)

  export async function reproduceOnClaimantData(spec: unknown, data: unknown): Promise<{ reExec: ReExec; consistency: Consistency } | null> {
    const panel = (data as { panel?: unknown })?.panel
    const claimed = (data as { returns?: number[] })?.returns
    if (!panel || !Array.isArray(claimed)) return null // no runnable claimant data ⇒ cannot re-derive (stays trusted V1)
    const t1 = panel as { markets: { symbol: string; series: { ts: number; supplyApy: number; utilization: number; tvl: number }[] }[] }
    if (!t1.markets?.length) return null
    const markets = t1.markets.map((m) => ({
      key: m.symbol,
      series: {
        apyBase: m.series.map((pt) => [pt.ts, pt.supplyApy]),
        utilization: m.series.map((pt) => [pt.ts, pt.utilization]),
        tvl: m.series.map((pt) => [pt.ts, pt.tvl]),
        turnover: m.series.map((pt, i) => [pt.ts, Math.max(Math.abs(pt.tvl - (i > 0 ? m.series[i - 1].tvl : pt.tvl)), 1)]),
      },
    }))
    const allTs = t1.markets.flatMap((m) => m.series.map((pt) => pt.ts))
    const window = { start: Math.min(...allTs), end: Math.max(...allTs) }
    const policy = (spec as { policy?: string })?.policy ?? "carry-tilt"
    const out = await Runner.sidecar("lending_accrual", {
      spec: { family: "lending-carry", policy, rebalance: { trigger: "monthly" }, markets: markets.map((m) => ({ key: m.key, weight: 1 / markets.length })) },
      window,
      markets,
      costs: { slippageK: 0.1, feeBps: 5, gasUsd: 25 },
      capitalUsd: 1_000_000,
    })
    const rederived = toReturns((out.equity_curve ?? []) as [number, number][])
    const n = Math.min(rederived.length, claimed.length)
    let maxRelDev = 0
    for (let i = 0; i < n; i++) {
      const denom = Math.max(Math.abs(claimed[i]), 1e-6)
      maxRelDev = Math.max(maxRelDev, Math.abs(rederived[i] - claimed[i]) / denom)
    }
    const lengthOk = Math.abs(rederived.length - claimed.length) <= 1
    const consistent = lengthOk && n > 0 && maxRelDev <= V1_TOLERANCE
    return {
      reExec: {
        returns: rederived,
        family: "lending-carry",
        nTrials: 1,
        window,
        steps: ["re-simulated the spec on the CLAIMANT's supplied panel", "compared the re-derived series to the claimed returns"],
        synthetic: false,
      },
      consistency: {
        checked: true,
        consistent,
        maxRelDev,
        tolerance: V1_TOLERANCE,
        note: consistent
          ? `re-derived returns reproduce the claimed series (max rel dev ${(maxRelDev * 100).toFixed(2)}% ≤ ${(V1_TOLERANCE * 100).toFixed(0)}%)`
          : `re-derived returns DO NOT reproduce the claimed series (max rel dev ${(maxRelDev * 100).toFixed(2)}% > ${(V1_TOLERANCE * 100).toFixed(0)}% or length mismatch) — SELF-INCONSISTENT`,
      },
    }
  }
}
