/**
 * ORGΛNON — the BREADTH PRE-FLIGHT (TS interface; Breadth-Rename sprint Phase 0; Rule A-PRE).
 *
 * Leads with the constraint that was always binding. Given a panel (assets × times), it reports EFFECTIVE BREADTH +
 * the DERIVED POWER FLOOR + whether a powered verdict is REACHABLE at all — from the correlation structure ALONE,
 * before any signal/edge/verdict. The breadth/floor math lives in the FROZEN Python sidecar (`effective_n`), so this
 * is a thin interface that calls the SAME frozen computation the engine uses (`backtest.py.preflight`, which imports
 * `effective_n` byte-identical — Rule VII). It re-derives nothing.
 *
 * IT REPORTS; IT DOES NOT AUTO-REFUSE (Rule A-PRE, XXXVIII). Reachability is a HEDGED diagnostic ("pending floor
 * audit") because the power-floor formula is not yet externally audited; the refuse-to-run behavior is behind a
 * disclosed, default-OFF flag (`autoRefuse`) that only MARKS — it never silently kills a domain.
 */
import path from "node:path"

export namespace Preflight {
  export type Floor = {
    effectivePeriodsNeeded: number
    nominalPeriodsNeeded: number
    effectiveBreadth: number
    tauInt: number
    sePerPeriod: number
    targetIC: number
    tGate: number
    zPower: number
  }
  export type Result = {
    label: string
    nPeriods: number
    nAssets: number
    effectiveBreadth: number
    canonicalTau: number
    targetIC: number
    cadenceHours: number
    powerFloor: Floor
    floorEffectivePeriodsNeeded: number
    actualEffN: number
    maxAchievableEffN: number
    reachable: boolean
    reason: string
    hedge: string
    autoRefuse: boolean
    refused: boolean
  }

  const SRC = path.join(import.meta.dir, "..", "..", "src")
  const PY = path.join(SRC, "backtest", "py", ".venv", "bin", "python")

  export type Options = { targetIC?: number; cadenceHours?: number; autoRefuse?: boolean; label?: string }

  /**
   * Run the pre-flight on a panel (T×M). Calls the FROZEN `backtest.py.preflight` and returns its structured report.
   * REPORTS breadth/floor/reachability; `autoRefuse` (default false) only MARKS `refused` — it never blocks.
   */
  export function run(panel: number[][], opts: Options = {}): Result {
    const req = JSON.stringify({
      panel,
      targetIC: opts.targetIC ?? 0.05,
      cadenceHours: opts.cadenceHours ?? 24.0,
      autoRefuse: opts.autoRefuse ?? false, // A-PRE: default OFF — the pre-flight reports, it does not auto-refuse
      label: opts.label ?? "",
    })
    const r = Bun.spawnSync([PY, "-m", "backtest.py.preflight"], {
      cwd: SRC,
      stdin: Buffer.from(req),
      env: { ...process.env, PYTHONHASHSEED: "0" },
    })
    const out = r.stdout.toString().trim()
    if (!out) throw new Error(`preflight: empty output (stderr: ${r.stderr.toString().slice(0, 300)})`)
    return JSON.parse(out)
  }

  /** A one-line human summary — what the tool now LEADS with, before any analysis. */
  export function summary(r: Result): string {
    const verdict = r.reachable ? "REACHABLE (floor not structurally unreachable)" : "STRUCTURALLY UN-POWERED"
    return `${r.label || "panel"}: M_eff=${r.effectiveBreadth.toFixed(2)} · N=${r.nPeriods} · floor=${r.floorEffectivePeriodsNeeded} · ${verdict} — pending floor audit`
  }
}
