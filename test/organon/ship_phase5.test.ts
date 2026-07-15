/**
 * ORGΛNON — THE SHIP SPRINT (V40), Phase 5 wall (S160): THE CAPTURE VERB. NO NEW LAW.
 *
 * W-SH10 — DD-65/J-7: the false-fire count's own-capture leg renders UNJUDGEABLE because the Operator has never run a
 * capture. `organon.sh capture` is a VERB, not a service: it snapshots the pinned subjects and renders the window +
 * daysToJudgeable (in CAPTURES, not days — RP-6). ORGΛNON schedules NOTHING — the tree contains no daemon/cron/setInterval/
 * service (a wall greps for one; a seeded scheduler FAILS). This is the first mechanism that rewards running the cadence.
 */
import { test, expect } from "bun:test"
import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Capture } from "../../src/strategy/capture"

test("S160 (W-SH10) — capture is a VERB: Capture.run OFFLINE (no fetcher) appends nothing and says so honestly", () => {
  const r = Capture.run(1_784_000_000_000) // no fetcher → offline
  expect(r.ran).toBe(false)
  expect(r.offline).toBe(true)
  expect(r.entry).toBeNull() // nothing to append
  expect(r.reason).toMatch(/OFFLINE/)
})

test("S160 (W-SH10) — a live capture (injected fetcher) produces a PIT snapshot, REAL@ts, content-hashed; a null → UNJUDGEABLE not fabricated", () => {
  const now = 1_784_000_000_000
  const r = Capture.run(now, (s) => (s.asset === "USDC" ? 60_000_000 : null)) // USDC resolves; others UNJUDGEABLE
  expect(r.ran).toBe(true)
  expect(r.pit.length).toBeGreaterThan(0)
  for (const p of r.pit) {
    expect(p.sha).toMatch(/^[0-9a-f]{64}$/)
    if (p.value != null) expect(p.tier).toBe(`REAL@${now}`)
    else expect(p.tier).toBe("UNJUDGEABLE") // a failed fetch is UNJUDGEABLE, never a fabricated number
  }
})

test("S160 (W-SH10) — the window + daysToJudgeable RENDER; daysToJudgeable is in CAPTURES, not days (RP-6)", () => {
  const w = Capture.window()
  expect(w.captures).toBe(0) // the Operator has run it 0 times (realLineageCount: 0)
  const j = Capture.judgeability()
  expect(j.unit).toBe("CAPTURES")
  expect(j.verdict).toMatch(/CAPTURES \(not days\)/)
  expect(j.verdict).toMatch(/UNJUDGEABLE/)
  expect(j.verdict).not.toMatch(/\d+ days? until|\d+ days? to (judge|reach)/) // NEVER a date it cannot know
})

test("S160 (W-SH10) — ORGΛNON schedules NOTHING: the capture path contains no scheduler (seeded negative — a scheduler line FAILS)", () => {
  // grep the capture source (module + entrypoint) for REAL scheduler CALLS, stripping comment/disclaimer lines
  const files = [path.join(PKG_ROOT, "src", "strategy", "capture.ts"), path.join(PKG_ROOT, "script", "honesty", "capture.ts")]
  const SCHEDULER = /\bsetInterval\s*\(|new\s+CronJob\s*\(|node-cron|node-schedule|systemd|\.schedule\s*\(|daemon\s*\(/
  for (const f of files) {
    const code = readFileSync(f, "utf8")
      .split("\n")
      .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*")) // strip comments/disclaimers
      .join("\n")
    expect(SCHEDULER.test(code)).toBe(false) // no actual scheduler call
  }
  // POSITIVE CONTROL — the grep WOULD catch a seeded scheduler
  expect(SCHEDULER.test("setInterval(() => capture(), 86400000)")).toBe(true)
})

test("S160 (W-SH10) — the docs contain no suggested crontab line (a wall greps the whole capture surface)", () => {
  const script = readFileSync(path.join(PKG_ROOT, "script", "honesty", "capture.ts"), "utf8")
  expect(script).not.toMatch(/\*\s+\*\s+\*\s+\*\s+\*/) // no cron expression (5-field) anywhere
  expect(script).not.toMatch(/crontab -e|add to cron/i)
})

test("S160 (W-SH10) — the ledger is the own-capture MOAT: pinned minWindowDays, and the verb is the only writer", () => {
  const l = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "capture-ledger.json"), "utf8"))
  expect(l.minWindowDays).toBe(180)
  expect(Array.isArray(l.captures)).toBe(true)
  expect(l.rule).toMatch(/schedules NOTHING/)
})
