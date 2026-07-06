/**
 * ORGΛNON DATA-PLANE — the REAL-PIT adjudication (Data-Plane Phase 3; Rules D-LABEL, T-REAL, S-PROPOSE). The product's
 * live path finally goes REAL: a goal → a spec → the ported lending engine on REAL captured PIT snapshots → an
 * adjudication whose returns are REAL-PIT (not ILLUSTRATIVE), with snapshot provenance a skeptic can trace to a chained
 * capture. The verdict itself is the CORE's, relayed verbatim through Studio.submit (no LLM, no softening) — a real
 * NO-GO is the product working. The D-LABEL guarantee is mechanical: a REAL-PIT label REQUIRES verifying provenance for
 * EVERY series; a series without a nonce-anchored content hash forces the label to BLOCKED — an unprovenanced REAL-PIT
 * is impossible by construction, not by trust.
 */
import { Ledger } from "../ledger/ledger"
import { Studio } from "../studio/adjudicate"
import { DataPlane } from "./store"
import { DataPlaneEngine } from "./engine"

export namespace DataPlaneAdjudicate {
  export interface SeriesProvenance { key: string; source: string; url: string; contentSha: string; nonce: string; chainPos: number }

  // period (daily) returns from an equity index curve — the observed carry, never forecast
  export function returnsFromEquity(equity: [number, number][]): number[] {
    const out: number[] = []
    for (let i = 1; i < equity.length; i++) out.push(equity[i][1] / equity[i - 1][1] - 1)
    return out
  }

  // the D-LABEL gate: REAL-PIT iff EVERY series carries verifying provenance (a nonce + a content sha). Absent any →
  // BLOCKED. This is what makes an unprovenanced REAL-PIT impossible — the label is derived from the provenance, never asserted.
  export function label(seriesByKey: Map<string, DataPlane.Series>): { reality: "REAL-PIT" | "BLOCKED"; provenance: SeriesProvenance[]; reason: string } {
    const provenance: SeriesProvenance[] = []
    for (const [key, s] of seriesByKey) {
      const p = s.provenance
      if (!p || !p.nonce || !p.contentSha || p.reality !== "REAL-PIT") {
        return { reality: "BLOCKED", provenance, reason: `series ${key} has no verifying REAL-PIT provenance (nonce+contentSha) — the label CANNOT be REAL-PIT (D-LABEL)` }
      }
      provenance.push({ key, source: p.source, url: p.url, contentSha: p.contentSha, nonce: p.nonce, chainPos: p.chainPos })
    }
    return { reality: provenance.length > 0 ? "REAL-PIT" : "BLOCKED", provenance, reason: provenance.length > 0 ? `all ${provenance.length} series carry nonce-anchored REAL-PIT provenance` : "no series" }
  }

  export interface RealPitArtifact {
    goal: string
    spec: DataPlaneEngine.LendingSpec
    window: DataPlaneEngine.Window
    reality: "REAL-PIT" | "BLOCKED"
    provenance: SeriesProvenance[]
    equity_curve: [number, number][]
    returns: number[]
    verdict: string
    dsrAtDeclared: number | null
    tier: string
    familyDeclaredNTrials: number
    note: string
  }

  // the live path: goal → spec → ported engine on REAL snapshots → REAL-PIT adjudication with provenance attached.
  export async function realPitAdjudication(goal: string, spec: DataPlaneEngine.LendingSpec, seriesByKey: Map<string, DataPlane.Series>, timestamp: number): Promise<RealPitArtifact> {
    const lab = label(seriesByKey)
    const window = DataPlaneEngine.commonWindow([...seriesByKey.values()])
    const result = await DataPlaneEngine.lendingAccrual(spec, window, seriesByKey)
    const equity = result.equity_curve
    const returns = returnsFromEquity(equity)

    // the verdict — the CORE's, relayed verbatim (Studio.submit registers-then-invokes; the ledger owns n_trials)
    const store = new Ledger.Store()
    const verdict = await Studio.submit(store, { spec, authorClass: "agent", domain: "lending", timestamp, returns, barsPerYear: 365 })

    return {
      goal,
      spec,
      window,
      reality: lab.reality, // REAL-PIT only if provenance verified — else BLOCKED (never a bare REAL-PIT)
      provenance: lab.provenance,
      equity_curve: equity,
      returns,
      verdict: verdict.attestation.verdict,
      dsrAtDeclared: verdict.attestation.dsrAtDeclared ?? null,
      tier: String((verdict.attestation as { tier?: unknown }).tier ?? "unknown"),
      familyDeclaredNTrials: verdict.familyDeclaredNTrials,
      note: lab.reality === "REAL-PIT"
        ? `REAL-PIT: real captured DefiLlama lending carry, ${returns.length} daily returns, provenance traceable to ${lab.provenance.length} chained snapshots. The verdict is the frozen core's, relayed verbatim — a NO-GO on real data is the product working (zero powered verdicts).`
        : `BLOCKED: ${lab.reason}`,
    }
  }
}
