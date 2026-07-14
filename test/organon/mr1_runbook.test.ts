/**
 * ORGΛNON — THE SHOWING SPRINT (V34), Phase 5 walls: MR1 (DD-4, the live capture / precise blocker) + the IN2 RUNBOOK.
 *
 * MR1 (B-8): "network-window-gated" is retired. Egress is OPEN in this environment; the capture was RUN through the real
 * budgeted-fetch code path and the census recorded as an OUTCOME. If a live payload had 404'd, the record would name the
 * blocker PRECISELY — never the three-sprint habit-phrase. The RUNBOOK (R-8): a claim must carry its artifact; the only
 * artifact that proves "≤20 minutes" is the Operator walking it, so the runbook labels the duration ESTIMATED / UNMEASURED.
 */
import { test, expect } from "bun:test"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"

const H = path.join(PKG_ROOT, "data", "honesty")

test("MR1/DD-4 — the capture record retires 'network-window-gated': the diagnosis names egress OPEN, and the census is an OUTCOME", () => {
  const rec = JSON.parse(readFileSync(path.join(H, "mr1-capture.json"), "utf8"))
  expect(rec.protocol).toBe("mr1-capture")
  expect(rec.diagnosis).toMatch(/egress is OPEN/i)
  expect(rec.diagnosis).toMatch(/not a fact|ASSUMPTION/i) // the habit-phrase is named as an assumption, not a reason
  expect(rec.rawPayloadCommitted).toBe(false) // E-PREVENT — only the provenance census is committed, never the ~10.5 MB body
  // the outcome is a real census: either REAL with the pinned subjects resolved, or a PRECISE blocker (never "window-gated")
  if (rec.outcome.reality === "REAL") {
    expect(rec.outcome.shelfCount).toBeGreaterThan(100) // a real shelf, hundreds of pools
    expect(rec.outcome.withinBudget).toBe(true) // the budgeted fetch completed well inside 45s (the MR1 fix works LIVE)
    expect(rec.outcome.pinnedPresentCount).toBeGreaterThanOrEqual(3) // the pre-pinned showcase subjects resolve live
  } else {
    expect(rec.outcome.blocker).toMatch(/PRECISE BLOCKER/i)
    expect(rec.outcome.blocker).not.toMatch(/network-window-gated/i) // the forbidden non-reason
  }
})

test("IN2 RUNBOOK — the runbook exists, is the ≤20-min sequence, and does NOT claim an UNMEASURED duration (R-8, X-SHOWN in its own docs)", () => {
  const p = path.join(PKG_ROOT, "docs", "IN2-RUNBOOK.md")
  expect(existsSync(p)).toBe(true)
  const md = readFileSync(p, "utf8")
  // R-8: the duration is labeled ESTIMATED / UNMEASURED — the sprint that mints X-SHOWN does not violate it in its own doc
  expect(md).toMatch(/UNMEASURED/)
  expect(md).toMatch(/estimated .{0,4}20 minutes/i)
  // the sequence covers the load-bearing steps (author a real manifest → priorIntent → exit → monitor twice → deltas → decision)
  expect(md).toMatch(/priorIntent/)
  expect(md).toMatch(/two confirmed .{0,20}boundaries/i)
  expect(md).toMatch(/decisionAfter|changedByCompile/)
  // LN5: the agent cannot perform it — only the Operator's own hand makes a real lineage real
  expect(md).toMatch(/LN5|the agent cannot perform/i)
  // the SAMPLE is labeled documentation, NOT a form pre-fill (X-AUTHOR(d) untouched)
  expect(md).toMatch(/SAMPLE/)
  expect(md).toMatch(/NOT a form pre-fill|never a value pre-filled/i)
})
