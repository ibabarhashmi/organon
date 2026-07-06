/**
 * ORGΛNON DATA-PLANE — the FUNDING port (End-User Phase 2; Rules E-ATTEMPT, D-DOMAIN, D-DIFF, D-LABEL). The credential-
 * free freepit T1 reconstruction the V9 scope contract promised and deferred, delivered now. Binance publishes IMMUTABLE
 * monthly funding-rate bulk dumps at data.binance.vision, each with a published `.CHECKSUM`; a dump whose sha256 matches
 * its published checksum is admissible as **T1** (byte-derived from an immutable, publicly-checksummed primitive — not a
 * revised-API read). This module reconstructs the PIT funding series from that dump BYTE-FAITHFULLY to the monorepo's
 * `FreePitFunding.reconstruct` (the transform the funding differential judges), builds the `funding_accrual.py` Job
 * contract, and drives the byte-identical frozen sidecar. Standalone-native (the leak wall holds): no sibling packages.
 */
import { createHash } from "node:crypto"
import { Runner } from "../backtest/runner"

export namespace DataPlaneFunding {
  const sha256 = (buf: Buffer | string) => createHash("sha256").update(buf).digest("hex")

  export interface FundingPoint { ts: number; rate: number; intervalHours: number; annualized: number }

  // T1 admissibility: the dump's sha256 must equal Binance's published CHECKSUM (a `<sha>  <filename>` line). A
  // mismatch VOIDS the T1 claim — we refuse, never fabricate (the exact monorepo gate, D-LABEL for funding).
  export function verifyT1(zip: Buffer, publishedChecksumLine: string): { ok: boolean; got: string; want: string } {
    const want = (publishedChecksumLine.trim().split(/\s+/)[0] ?? "").toLowerCase()
    const got = sha256(zip)
    return { ok: got === want && want.length === 64, got, want }
  }

  // annualize a per-interval funding rate EXACTLY as the monorepo funding domain does: interval → per-year.
  export function annualize(rate: number, intervalHours: number): number {
    return rate * (24 / intervalHours) * 365
  }

  // reconstruct the PIT series from the immutable dump CSV — BYTE-FAITHFUL to the monorepo FreePitFunding.reconstruct:
  // header `calc_time,funding_interval_hours,last_funding_rate`, parse → {ts, rate, intervalHours, annualized}, drop
  // non-finite, sort by ts. No smoothing, no interpolation — the dump's rows, verbatim (the transform under differential).
  export function reconstruct(csv: string): FundingPoint[] {
    const lines = csv.trim().split("\n")
    return lines
      .slice(1) // header
      .map((line) => {
        const [calc, interval, rate] = line.split(",")
        const intervalHours = Number(interval)
        const r = Number(rate)
        return { ts: Number(calc), rate: r, intervalHours, annualized: annualize(r, intervalHours) }
      })
      .filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.rate))
      .sort((a, b) => a.ts - b.ts)
  }

  // the funding_accrual.py Job contract: { funding:[per-interval rate,...], intervalHours, notionalUsd, costs }.
  // funding is the raw per-interval charge (NOT annualized) — the sidecar sums signed funding · notional (tail explicit).
  export interface FundingJob { funding: number[]; intervalHours: number; notionalUsd: number; costs?: Record<string, number> }
  export function buildFundingJob(points: FundingPoint[], opts?: { notionalUsd?: number; costs?: Record<string, number> }): FundingJob {
    if (!points.length) throw new Error("buildFundingJob: no funding points (ABSENT — never fabricated)")
    const intervalHours = points[0].intervalHours || 8
    return { funding: points.map((p) => p.rate), intervalHours, notionalUsd: opts?.notionalUsd ?? 1_000_000, costs: opts?.costs }
  }

  export interface FundingResult { fundingPnl: number; grossCarry: number; netCarry: number; totalCost: number; nIntervals: number; [k: string]: unknown }
  // run the frozen byte-identical funding sidecar (Runner.sidecar → py/.venv). The returns are REAL-PIT when the series
  // carries T1 provenance; the caller labels + attaches provenance (D-LABEL).
  export async function fundingAccrual(job: FundingJob): Promise<FundingResult> {
    return (await Runner.sidecar("funding_accrual", job)) as FundingResult
  }
}
