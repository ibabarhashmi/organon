/**
 * ORGΛNON — THE CADENCE SPRINT wall S76 (BASELINE IMMUTABILITY) + MR3. The baseline is the thesis' fixed frame: content-hashed
 * at registration INCLUDING each position's governance adminClass; deltas compute against THAT record; a silent re-base is
 * DETECTED; the only amendment is a disclosed re-pin (old/new/reason); diff is deterministic ×2 and every delta names its
 * baseline hash + capture tier and is UNJUDGEABLE-honest when a fact is absent at baseline OR now.
 */
import { test, expect } from "bun:test"
import { Baseline } from "../../src/strategy/baseline"

const pos = (over: Partial<Baseline.PositionSurface> = {}): Baseline.PositionSurface => ({
  subjectKey: "a", name: "A", verdict: "SOLID", govClass: "TIMELOCK", captureTier: "REAL-at-timestamp",
  peg: 0.999, tvlDrawdown: 0.1, fundingNegPeriods: 2, fundingTotalPeriods: 30, ...over,
})
const surf = (over: Partial<Baseline.Surface> = {}): Baseline.Surface => ({
  positions: [pos()], effectiveK: 2, catch: { fundingCarryCount: 0, leveredCount: 0, rwaPresent: false, totalReachable: 1 }, worstAxis: null, exitHash: "abc", ...over,
})

test("S76 — the baseline is content-hashed at registration; the hash is stable + deterministic ×2; registeredAt is EXCLUDED", () => {
  const b = Baseline.pin(surf(), "2026-07-13T00:00:00Z")
  expect(b.hash).toBe(Baseline.hashOf(surf())) // stable
  expect(Baseline.hashOf(surf())).toBe(Baseline.hashOf(surf())) // deterministic ×2
  // registeredAt does not enter the hash (metadata) — two pins at different times, same surface, same hash
  expect(Baseline.pin(surf(), "2026-07-13T00:00:00Z").hash).toBe(Baseline.pin(surf(), "2027-01-01T00:00:00Z").hash)
})

test("S76 — the hash INCLUDES the per-position governance adminClass (MR3): changing the gov class moves the hash", () => {
  expect(Baseline.hashOf(surf())).not.toBe(Baseline.hashOf(surf({ positions: [pos({ govClass: "EOA" })] })))
})

test("S76 — a silent re-base is DETECTED (the stored hash no longer recomputes over the surface)", () => {
  const b = Baseline.pin(surf(), "2026-07-13T00:00:00Z")
  expect(Baseline.detectSilentEdit(b)).toBe(false) // clean
  const tampered = JSON.parse(JSON.stringify(b))
  tampered.surface.positions[0].govClass = "EOA" // a quiet re-base
  expect(Baseline.detectSilentEdit(tampered)).toBe(true) // caught
})

test("S76 — the disclosed re-pin records {old, new, reason}; a reason-less re-pin is refused", () => {
  const b = Baseline.pin(surf(), "2026-07-13T00:00:00Z")
  const bad = Baseline.repin(b, surf({ effectiveK: 3 }), "", "2026-07-20T00:00:00Z")
  expect(bad.ok).toBe(false)
  const good = Baseline.repin(b, surf({ effectiveK: 3 }), "re-registered after adding a position", "2026-07-20T00:00:00Z")
  expect(good.ok).toBe(true)
  if (good.ok) {
    expect(good.repin.oldHash).toBe(b.hash)
    expect(good.repin.newHash).not.toBe(b.hash)
    expect(good.repin.reason).toMatch(/re-registered/)
  }
})

test("S76 — diff is deterministic ×2 and every delta names its baseline hash; the governance-change delta is REAL (MR3)", () => {
  const b = Baseline.pin(surf(), "2026-07-13T00:00:00Z")
  const cur = surf({ positions: [pos({ govClass: "EOA", peg: 0.99, verdict: "CAUTION" })] })
  const d1 = Baseline.diff(b, cur)
  const d2 = Baseline.diff(b, cur)
  expect(JSON.stringify(d1)).toBe(JSON.stringify(d2)) // deterministic ×2
  for (const d of d1) expect(d.baselineHash).toBe(b.hash) // every delta names its baseline
  const gov = d1.find((d) => d.kind === "governance")!
  expect(gov.judgeable).toBe(true)
  expect(gov.changed).toBe(true) // TIMELOCK → EOA
  expect(gov.text).toMatch(/TIMELOCK at baseline → EOA now — CHANGED/)
})

test("S76 — a fact absent at baseline OR now → UNJUDGEABLE (never a fabricated move); either side unresolved gov → UNJUDGEABLE", () => {
  const b = Baseline.pin(surf({ positions: [pos({ govClass: null, peg: null })] }), "2026-07-13T00:00:00Z")
  const cur = surf({ positions: [pos({ govClass: "EOA", peg: 0.99 })] })
  const d = Baseline.diff(b, cur)
  const gov = d.find((x) => x.kind === "governance")!
  expect(gov.judgeable).toBe(false) // no resolved gov at baseline → UNJUDGEABLE, not a guessed CHANGED
  const peg = d.find((x) => x.kind === "peg")!
  expect(peg.judgeable).toBe(false)
  expect(peg.text).toMatch(/UNJUDGEABLE/)
})
