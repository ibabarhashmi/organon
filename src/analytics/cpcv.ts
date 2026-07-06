/**
 * ORGΛNON ANALYTICS — CPCV, an additive ADVISORY overfit panel (Spine Phase 2; Rules R-ADVISORY, A′#5/#10). Combinatorially
 * -purged cross-validation (Bailey & López de Prado): the strongest available answer to "how overfit is this, really",
 * added BESIDE the frozen gates, never above them. It computes the Probability of Backtest Overfitting (PBO) via the
 * CSCV procedure over a returns matrix of many trials, plus the out-of-sample Sharpe distribution of the in-sample best.
 *
 * ADVISORY-FIRST (R-ADVISORY): nothing here touches the write-then-invoke verdict path; the panel renders beside the
 * frozen DSR/PBO and changes no verdict (a verdict differential proves it). The configuration is PINNED (groups · purge
 * · embargo · budget) — NOT tunable per-run, so an advisory can never become a per-result lever (A′#5). SKIPPED is a
 * first-class honest state (data too short / budget exceeded), never a silent absence. Promotion to a GATING panel is a
 * PARKED owner decision with pre-registered criteria (A′#10) — advisory-first is the point.
 */
export namespace CPCV {
  // the PINNED configuration — values fixed here, not passed per-run (an advisory that can be tuned per-run is a lever).
  export const CONFIG = { groups: 10, purge: 1, embargo: 1, budgetMs: 5000, minGroupSize: 5, maxObs: 5000 } as const

  export interface Result {
    skipped: boolean
    skipReason: string | null
    pbo: number | null // Probability of Backtest Overfitting — fraction of splits where the IS-best ranks below OOS median
    oosSharpeMedian: number | null
    oosSharpeIqr: [number, number] | null
    isBestOverfitFraction: number | null // == pbo, named for the report
    combinations: number | null
    nTrials: number
    nObs: number
    config: typeof CONFIG
    runtimeMs: number | null
    advisory: string
    note: string
  }

  function sharpe(xs: number[]): number {
    const n = xs.length
    if (n < 2) return 0
    const m = xs.reduce((s, x) => s + x, 0) / n
    let v = 0
    for (const x of xs) v += (x - m) ** 2
    v /= n - 1
    return v <= 0 ? 0 : m / Math.sqrt(v)
  }

  // all index subsets of {0..s-1} of size k (the C(s,k) IS/OOS group splits)
  function choose(s: number, k: number): number[][] {
    const out: number[][] = []
    const cur: number[] = []
    ;(function rec(start: number) {
      if (cur.length === k) { out.push([...cur]); return }
      for (let i = start; i < s; i++) { cur.push(i); rec(i + 1); cur.pop() }
    })(0)
    return out
  }

  // run CSCV over M (rows = observations in time order, cols = trials/strategies; M[t][n] = strategy n's return at t).
  // The clock is injected (deterministic tests pass a fixed clock; Rule VIII) — default reads a monotonic timer.
  export function run(M: number[][], now: () => number = () => performance.now()): Result {
    const nObs = M.length
    const nTrials = nObs > 0 ? M[0].length : 0
    const base: Result = { skipped: false, skipReason: null, pbo: null, oosSharpeMedian: null, oosSharpeIqr: null, isBestOverfitFraction: null, combinations: null, nTrials, nObs, config: CONFIG, runtimeMs: null, advisory: "ADVISORY — beside the frozen gates, never above them (R-ADVISORY)", note: "" }

    // ── the SKIPPED honest states (first-class, never a silent absence) ──
    if (nTrials < 2) return { ...base, skipped: true, skipReason: `too few trials (${nTrials} < 2) — CPCV needs a family of strategies to rank; a single trial cannot be cross-validated` }
    if (nObs > CONFIG.maxObs) return { ...base, skipped: true, skipReason: `series too long (${nObs} > ${CONFIG.maxObs} obs) — CPCV skipped to stay within the pinned compute budget; the frozen verdict is unaffected` }
    const groupSize = Math.floor(nObs / CONFIG.groups)
    if (groupSize < CONFIG.minGroupSize) return { ...base, skipped: true, skipReason: `series too short (${nObs} obs → group size ${groupSize} < ${CONFIG.minGroupSize}) — CPCV skipped; the frozen verdict still renders in full` }

    const t0 = now()
    // contiguous equal groups (drop a ragged tail so every group is equal-length)
    const S = CONFIG.groups
    const usable = groupSize * S
    const groupOf = (row: number): number => Math.floor(row / groupSize)
    const combos = choose(S, S / 2)
    const logits: number[] = []
    const oosBestSharpes: number[] = []

    for (const isGroups of combos) {
      const isSet = new Set(isGroups)
      const oosRows: number[] = []
      const isRowsRaw: number[] = []
      for (let r = 0; r < usable; r++) (isSet.has(groupOf(r)) ? isRowsRaw : oosRows).push(r)
      // PURGE + EMBARGO: drop IS rows within `purge` (either side) of an OOS row, or within `embargo` AFTER an OOS row
      const oosSet = new Set(oosRows)
      const isRows = isRowsRaw.filter((r) => {
        for (let d = -CONFIG.purge; d <= CONFIG.purge; d++) if (oosSet.has(r + d)) return false
        for (let d = 1; d <= CONFIG.embargo; d++) if (oosSet.has(r - d)) return false // r is within embargo AFTER an OOS row
        return true
      })
      if (isRows.length < 2 || oosRows.length < 2) continue

      // IS: pick the best-in-sample strategy
      let best = 0, bestS = -Infinity
      for (let n = 0; n < nTrials; n++) {
        const s = sharpe(isRows.map((r) => M[r][n]))
        if (s > bestS) { bestS = s; best = n }
      }
      // OOS: rank the IS-best among all trials' OOS Sharpes
      const oos = new Array<number>(nTrials)
      for (let n = 0; n < nTrials; n++) oos[n] = sharpe(oosRows.map((r) => M[r][n]))
      const bestOos = oos[best]
      let below = 0
      for (let n = 0; n < nTrials; n++) if (oos[n] < bestOos) below++
      const rank = (below + 1) / (nTrials + 1) // relative rank ∈ (0,1)
      const clamped = Math.min(1 - 1e-9, Math.max(1e-9, rank))
      logits.push(Math.log(clamped / (1 - clamped)))
      oosBestSharpes.push(bestOos)
    }

    if (logits.length === 0) return { ...base, skipped: true, skipReason: "no admissible IS/OOS splits after purge/embargo — series too short for the pinned config" }

    // PBO = fraction of splits where the IS-best underperforms the OOS median (logit ≤ 0)
    const pbo = logits.filter((l) => l <= 0).length / logits.length
    const sorted = [...oosBestSharpes].sort((a, b) => a - b)
    const q = (p: number): number => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))))]
    const runtimeMs = now() - t0
    return {
      ...base,
      pbo,
      isBestOverfitFraction: pbo,
      oosSharpeMedian: q(0.5),
      oosSharpeIqr: [q(0.25), q(0.75)],
      combinations: logits.length,
      runtimeMs,
      note: `PBO = ${(pbo * 100).toFixed(0)}% of ${logits.length} combinatorial splits put the in-sample-best strategy below the out-of-sample median (higher = more overfit). Advisory only; the frozen gate decides.`,
    }
  }

  // Render CPCV BESIDE the frozen numbers, labeling disagreement as INFORMATION (never averaging it away, A′#5). The
  // frozen verdict is passed in verbatim — this renderer never changes it; it only says which way each panel leans.
  export function renderBeside(cpcv: Result, frozen: { verdict: string; dsr: number | null }): string {
    if (cpcv.skipped) return `CPCV: SKIPPED (${cpcv.skipReason})  |  FROZEN GATE (the only gate): ${frozen.verdict}${frozen.dsr === null ? "" : ` (DSR ${frozen.dsr.toFixed(3)})`}`
    const cpcvLeans = (cpcv.pbo ?? 0) >= 0.5 ? "OVERFIT-likely" : "overfit-unlikely"
    const frozenLeans = frozen.verdict === "GO" || frozen.verdict === "CONDITIONAL" ? "passes" : "refuses"
    const agree = (cpcvLeans === "overfit-unlikely") === (frozenLeans === "passes")
    const disagreement = agree ? "panels agree" : "panels DISAGREE; the frozen gate decides (the CPCV signal is information, not a vote)"
    return `CPCV (advisory): PBO=${((cpcv.pbo ?? 0) * 100).toFixed(0)}% → ${cpcvLeans}, OOS-Sharpe median=${(cpcv.oosSharpeMedian ?? 0).toFixed(3)}  |  FROZEN GATE (the only gate): ${frozen.verdict}${frozen.dsr === null ? "" : ` (DSR ${frozen.dsr.toFixed(3)})`} → ${frozenLeans}  |  ${disagreement}`
  }
}
