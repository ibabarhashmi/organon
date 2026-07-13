/**
 * ORGΛNON — THE RECKONING SPRINT, WALLS ON THE WALLS (S82) + the monitor's torn/skew/concurrency walls (S86 / S86b / S86c).
 * S82(a) the non-screen allowlist is PINNED (a seeded member fails without a pin); S82(b) the two lineages pinned by explicit
 * id + chain hash (no selector-loosening); S82(c) the clock is INJECTED (Date.now() grep-walled out of judged code). S86 the
 * monitor refuses a torn/unhashable capture head; S86b refuses a head timestamped after `now` (skew); S86c two overlapping
 * cycles → exactly one appends.
 */
import { test, expect } from "bun:test"
import { mkdtempSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { app } from "../../script/serve-reality"
import { Monitor } from "../../src/strategy/monitor"
import { StrategyStore } from "../../src/strategy/store"
import { StrategyTrial } from "../../src/strategy/trial"

const rk = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "reckon-pins.json"), "utf8"))

test("S82(a) — the non-screen route allowlist is PINNED: the served GET routes minus the pinned allowlist are EXACTLY the conscious 3", () => {
  const allow = new Set(rk.screensAllowlist.members as string[])
  const getRoutes = [...new Set(app.routes.filter((r) => r.method === "GET").map((r) => r.path))]
  const screens = getRoutes.filter((p) => !allow.has(p)).sort()
  expect(screens).toEqual(["/", "/ask", "/check/:key"]) // a genuine 4th screen (a served GET route not in the pinned allowlist) fails here
  // every pinned allowlist member is a REAL served route (the pin cannot list a phantom to hide a screen)
  for (const m of allow) expect(getRoutes).toContain(m)
})

test("S82(b) — the V31 3-trial + V32 23-trial lineages are pinned by EXPLICIT id + chain hash (no selector-loosening)", () => {
  for (const key of ["v31_3trial", "v32_23trial"] as const) {
    const pin = rk.lineagesPinned[key]
    const chain = StrategyTrial.ledger(pin.id, StrategyTrial.FIXTURE_TRIAL_DIR)
    expect(chain.length).toBe(pin.count)
    expect(chain[0].entryHash.slice(0, 16)).toBe(pin.chainRoot)
    expect(chain[chain.length - 1].entryHash.slice(0, 16)).toBe(pin.chainHead)
    expect(StrategyTrial.verify(pin.id, StrategyTrial.FIXTURE_TRIAL_DIR).ok).toBe(true)
  }
})

test("S82(c) — the clock is INJECTED: Date.now() is grep-walled OUT of the judged strategy code", () => {
  for (const rel of rk.clockInjection.judgedFiles as string[]) {
    const src = readFileSync(path.join(PKG_ROOT, rel), "utf8").replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "")
    expect(src).not.toMatch(/Date\.now\(\)/)
  }
})

const FIX = StrategyStore.list(StrategyStore.FIXTURE_DIR).find((x) => x.startsWith("a82f8f50"))!
const NOW = Date.parse("2026-07-13T00:00:00Z")
function dirs() { const t = mkdtempSync(path.join(tmpdir(), "org-rw-")); return { cycleDir: path.join(t, "c"), baselineDir: path.join(t, "b"), trialDir: path.join(t, "tr") } }

test("S86 — a torn/unhashable capture head → UNJUDGEABLE, no reading, no trial (the monitor verifies the head before reading)", () => {
  const torn = [{ history: [{ contentHash: "NOT-A-HEX-HASH", asOf: NOW - 1000, chainPos: 1 }], poolKey: "x" }] as never
  const meta = Monitor.captureMeta(torn, NOW)
  expect(meta.torn).toBe(true)
  const clean = [{ history: [{ contentHash: "a".repeat(64), asOf: NOW - 1000, chainPos: 1 }], poolKey: "x" }] as never
  expect(Monitor.captureMeta(clean, NOW).torn).toBe(false)
})

test("S86b — a capture asOf LATER than now (clock skew) → skew flagged (UNJUDGEABLE)", () => {
  const skew = [{ history: [{ contentHash: "a".repeat(64), asOf: NOW + 999_999, chainPos: 1 }], poolKey: "x" }] as never
  expect(Monitor.captureMeta(skew, NOW).skew).toBe(true)
  const past = [{ history: [{ contentHash: "a".repeat(64), asOf: NOW - 1, chainPos: 1 }], poolKey: "x" }] as never
  expect(Monitor.captureMeta(past, NOW).skew).toBe(false)
})

test("S82(d) — the committed cadence baseline is RESTORED (W-CAD03 proper fix): the monitoring block renders END-TO-END from a committed artifact at a frozen clock", async () => {
  const { StrategyResolve } = await import("../../src/strategy/resolve")
  const { Reality } = await import("../../src/studio/reality")
  const ID = "040301c26de44c9ef869d3cab8af582e82f6bda4ac63a0dfd8abf4c62586250c"
  const FROZEN = Date.parse("2026-07-14T00:00:00Z")
  const baseline = Monitor.loadBaseline(ID) // reads the COMMITTED fixture baseline (fixture fallback)
  expect(baseline).not.toBeNull()
  const monitoring = Monitor.viewOf(ID) // reads the COMMITTED fixture cycles
  expect(monitoring).not.toBeNull()
  expect(monitoring!.deltaLines.length).toBeGreaterThan(0)
  // build the composed view at a FROZEN now (deterministic thesis-age — the determinism-preserving fix, not deleted coverage)
  const m = StrategyStore.load(ID, StrategyStore.FIXTURE_DIR)!
  const baselineGov = Object.fromEntries(baseline!.surface.positions.map((p) => [p.subjectKey, p.govClass]))
  const { view } = await StrategyResolve.resolveAndCompile(m, FROZEN, Date.parse(baseline!.registeredAt), baselineGov)
  const html = Reality.renderComposed({ ...view, monitoring: monitoring! })
  expect(html).toMatch(/Monitoring — the thesis re-judged on the capture cadence/)
  expect(html).toMatch(/baseline pinned 9bdfc026/)
  expect(Monitor.verify(ID, Monitor.FIXTURE_CYCLE_DIR).ok).toBe(true) // the committed cycle chain re-hashes on a clone
})

test("S86c — two overlapping monitor invocations over one lineage → EXACTLY ONE appends; the other exits stating a cycle is already running", async () => {
  const d = dirs()
  const [a, b] = await Promise.all([
    Monitor.cycle(FIX, NOW, "2026-07-13T00:00:00Z", d),
    Monitor.cycle(FIX, NOW, "2026-07-13T00:00:00Z", d),
  ])
  const errors = [a, b].filter((r) => "error" in r) as { error: string }[]
  const ok = [a, b].filter((r) => !("error" in r))
  expect(ok.length).toBe(1) // exactly one appended
  expect(errors.length).toBe(1)
  expect(errors[0].error).toMatch(/a cycle is already running/i)
  expect(Monitor.history(FIX, d.cycleDir).length).toBe(1) // exactly one cycle written
})
