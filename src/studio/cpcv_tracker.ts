/**
 * ORGΛNON STUDIO — the CPCV PROMOTION TRACKER (Reachability Phase 2; Rule R-ADVISORY, A′#10). CPCV was adopted ADVISORY
 * with a parked promotion decision: promote to a co-gate ONLY after ≥30 real adjudications show ≥80% agreement with the
 * frozen gate (+ an owner sign-off). This instruments that criterion: every real adjudication auto-records CPCV's lean
 * (overfit-likely / overfit-unlikely) vs the frozen gate's pass/refuse; the agreement count accrues toward 30. It DECIDES
 * nothing — it accrues evidence for a future owner decision (the frozen gate stays the only gate).
 */
import { appendFileSync, existsSync, readFileSync } from "node:fs"

export namespace CpcvTracker {
  export const TARGET = 30
  export const PROMOTION_AGREEMENT = 0.8
  export interface Entry { cpcvLean: "overfit-likely" | "overfit-unlikely"; frozenPass: boolean; agree: boolean; stamp: string }
  export interface Status { target: number; accrued: number; agreements: number; agreementRate: number; promotable: boolean; render: string }

  // CPCV "overfit-unlikely" agrees with the frozen gate "pass"; "overfit-likely" agrees with "refuse".
  export function agrees(cpcvLean: Entry["cpcvLean"], frozenPass: boolean): boolean {
    return (cpcvLean === "overfit-unlikely") === frozenPass
  }
  export function record(file: string, cpcvLean: Entry["cpcvLean"], frozenPass: boolean, stamp: string): Entry {
    const e: Entry = { cpcvLean, frozenPass, agree: agrees(cpcvLean, frozenPass), stamp }
    appendFileSync(file, JSON.stringify(e) + "\n")
    return e
  }
  export function status(file: string): Status {
    const entries: Entry[] = existsSync(file) ? readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l) as Entry) : []
    const accrued = entries.length
    const agreements = entries.filter((e) => e.agree).length
    const agreementRate = accrued ? agreements / accrued : 0
    const promotable = accrued >= TARGET && agreementRate >= PROMOTION_AGREEMENT
    return { target: TARGET, accrued, agreements, agreementRate, promotable, render: `CPCV promotion tracker: ${agreements}/${accrued} agree with the frozen gate (need ≥${TARGET} adjudications at ≥${PROMOTION_AGREEMENT * 100}% + an owner decision) — ${promotable ? "criterion met, awaiting owner" : "advisory-only, accruing"}` }
  }
}
