/**
 * WALL — C-TENSE / L-TICK (Convergence Phase 1). "TICKING" is earned at its true tense only by scheduler-originated
 * stamps (a detached daemon), not session-originated ones; and a killed scheduler renders a GAP, never smoothed. This
 * proves: origin is hashed (relabeling a session stamp to "scheduler" breaks the chain), scheduler stamps are counted
 * distinctly, and a stale clock renders a GAP with the missed-interval count. Positive-controlled on all three.
 */
import { describe, test, expect } from "bun:test"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { Capture } from "../../src/studio/capture"

const freshFile = () => path.join(mkdtempSync(path.join(tmpdir(), "sched-")), "stamps.jsonl")
const T = 1_700_000_000_000

describe("WALL scheduler_cadence — 'TICKING' at true tense; killed scheduler renders a GAP (C-TENSE)", () => {
  test("scheduler-originated stamps are counted distinctly from session-originated", () => {
    const svc = new Capture.Service(freshFile())
    svc.capture("lending", "p0", T, { origin: "scheduler", schedulerRun: "run-1" })
    svc.capture("lending", "p1", T + 4000, { origin: "scheduler", schedulerRun: "run-1" })
    svc.capture("lending", "p2", T + 8000) // a session capture (no origin)
    expect(svc.freshCount("lending")).toBe(3)
    expect(svc.schedulerCount("lending")).toBe(2)
    const st = svc.status("lending", T + 9000)
    expect(st.render).toContain("scheduler-originated ×2")
    expect(svc.verify().ok).toBe(true)
  })

  test("POSITIVE CONTROL — relabeling a session stamp to 'scheduler' breaks selfSha (origin is hashed)", () => {
    const f = freshFile()
    const svc = new Capture.Service(f)
    svc.capture("lending", "p0", T) // session (no origin) — old hash
    const lines = readFileSync(f, "utf8").split("\n").filter(Boolean)
    const s = JSON.parse(lines[0]); s.origin = "scheduler"; s.schedulerRun = "forged" // relabel WITHOUT recomputing selfSha
    writeFileSync(f, JSON.stringify(s) + "\n")
    expect(() => new Capture.Service(f)).toThrow(/chain broken/) // the forged origin does not hash to the stored selfSha
  })

  test("POSITIVE CONTROL — a killed scheduler renders a GAP with missed intervals, never smoothed", () => {
    const svc = new Capture.Service(freshFile())
    for (let i = 0; i < 5; i++) svc.capture("funding", `p${i}`, T + i * 4000, { origin: "scheduler", schedulerRun: "r" })
    const last = T + 4 * 4000
    // fresh: no gap
    expect(svc.status("funding", last + 1000, { expectedCadenceMs: 4000 }).gap).toBeNull()
    // killed: now well past 1.5× cadence → GAP rendered with a missed-interval count
    const stale = svc.status("funding", last + 30_000, { expectedCadenceMs: 4000 })
    expect(stale.gap).not.toBeNull()
    expect(stale.gap!.missed).toBeGreaterThanOrEqual(5)
    expect(stale.render).toContain("GAP")
    expect(stale.render).toContain("never smoothed")
  })
})
