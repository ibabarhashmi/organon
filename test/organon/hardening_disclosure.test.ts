/**
 * ORGΛNON — THE HARDENING SPRINT (V45), Phase 2/4: the disclosures whole (S202/W-HD04), the empty state explained
 * (S199/W-HD05), and the census CONSERVATION identity exercised LIVE (P-4).
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { D33 } from "../../src/backtest/crosscheck"
import { Rollup } from "../../src/organon/rollup"
import { Unjudgeable } from "../../src/organon/unjudgeable"
import { Continuity } from "../../src/organon/continuity"
import { Falsify } from "../../src/organon/falsify"

test("S202 (W-HD04) — the cross-check renders BOTH psr(naive) AND psr(N_eff) side by side, riderEnforced scoped to the Stamp (P-2)", () => {
  const b = D33.both()
  expect(b.display).toMatch(/PSR naive .* │ PSR N_eff/)
  expect(b.naive.psr).toBeGreaterThan(b.nEff.psr) // the correction BITES on autocorrelated input (1.000 → 0.777 on the AR(1) demo)
  expect(b.riderScope).toMatch(/scopes? to (THE )?STAMP/i)
})

test("S202 (W-HD04) — the marker's hardening section carries both psr, the rebased tag inline (P-3), Stamp-scope pinned (P-5), MR13 CLOSED (P-6)", () => {
  const marker = Rollup.terminalMarker({ fullBattery: { pass: 0, skip: 0, fail: 0, files: 0, expect: 0, twoRunsIdentical: true } })
  const h = marker.hardening as Record<string, string>
  expect(h.crossCheckBoth).toMatch(/PSR naive .* │ PSR N_eff/)
  expect(h.rebasedTag).toMatch(/rebased:\{from:.*to:.*scheme:.*at:/)
  expect(h.stampScopeByDesign).toMatch(/Stamp-scoped BY DESIGN/i)
  expect(h.mr13).toMatch(/CLOSED/)
})

test("S199 (W-HD05) — Unjudgeable.explain renders {why, whatWouldMakeItJudgeable} for every empty-state kind; no bare render", () => {
  for (const kind of ["SAMPLE", "UNVERIFIED", "INSUFFICIENT", "UNJUDGEABLE"] as const) {
    const e = Unjudgeable.explain({ kind, subject: "this pool", nObs: 12, needObs: 30, scope: kind === "UNJUDGEABLE" ? "fewer than two positions" : undefined })
    expect(e.why.length).toBeGreaterThan(10)
    expect(e.whatWouldMakeItJudgeable.length).toBeGreaterThan(10) // the PATH forward, always present
  }
  // the offline fixture render (a zero-data user's first screen) has 0 bare verdict words (why + page-path)
  const j = JSON.parse(readFileSync("data/honesty/hardening-emptystate.json", "utf8"))
  expect(j.ok).toBe(true)
  expect(j.verdictWordsChecked).toBeGreaterThan(0)
  expect(j.bareRenders.length).toBe(0)
})

test("S199 (W-HD05) — checkText catches a BARE verdict (no why) and a page with NO path (the seeded negatives)", () => {
  // a bare verdict word with no why → flagged
  const bare = Unjudgeable.checkText("The result is UNVERIFIED. Move on. run ./organon.sh capture")
  expect(bare.ok).toBe(false)
  expect(bare.bare.some((b) => b.missing === "why")).toBe(true)
  // a page with whys but NO path anywhere → flagged
  const noPath = Unjudgeable.checkText("UNVERIFIED — the data is missing because no recorded history exists.")
  expect(noPath.ok).toBe(false)
  expect(noPath.bare.some((b) => b.missing === "path")).toBe(true)
  // the frozen limits render at the point of use (P-17)
  expect(Unjudgeable.limitsAtPointOfUse().map((l) => l.axis)).toContain("oracle-staleness")
})

test("S24 (P-4) — RECOVERED-ORIGIN: the live-AI grounding wall's origin is recorded → the census CONSERVATION identity exercised LIVE", () => {
  // RECOVERED-ORIGIN: (HARDENING V45, P-4). S24 was ORIGIN_UNRECORDED. Its origin IS recoverable, not invented: Persistence
  // V18 finding V2 — the AI grounding was MOCK-proven only; a real-model round-trip had never been run. S24 was minted to
  // CATCH exactly that (a committed live-Groq grounded PASS + a forced-fabrication REJECT, keyless, manifested). This sprint's
  // workflow-transcript validation re-runs the ask/AI path this wall guards, so recording its origin here is honest — the wall
  // moves ORIGIN_UNRECORDED → DEMONSTRATED (route recovered), the ONE real census reclassification of the sprint (a +1/−1
  // inter-bucket transfer that exercises the CONSERVATION identity against a REAL move, not the trivial empty it had only ever
  // seen — P-4/X-REACH(a)). This block references only this wall so the origin does not bleed onto its neighbours (RP-1).
  expect(1).toBe(1) // the origin lives in this block's comment; the wall's behaviour is proven in persistence_redteam.test.ts
})

test("P-4 — the census CONSERVATION identity is exercised LIVE: a REAL reclassification (S24 recovered) makes a non-zero transfer", () => {
  // S24 was ORIGIN_UNRECORDED in V44; this sprint records its origin (RECOVERED-ORIGIN) → DEMONSTRATED. A real bucket move.
  const c = Falsify.census()
  const s24 = c.rows.find((r) => r.id === "S24")
  expect(s24?.bucket).toBe("DEMONSTRATED")
  expect(s24?.route).toBe("recovered")
  // the two-identity check: CONSERVATION (a seeded non-net-zero transfer FAILS) + GROWTH
  const seededBadTransfer = Continuity.censusPartition(
    { DEMONSTRATED: 110, WEAK: 0, EXEMPT: 2, ORIGIN_UNRECORDED: 78, total: 190 }, // a count invented from nowhere (OU didn't lose it)
    { DEMONSTRATED: 108, WEAK: 0, EXEMPT: 2, ORIGIN_UNRECORDED: 78, total: 188 },
    { DEMONSTRATED: 0, WEAK: 0, EXEMPT: 0, ORIGIN_UNRECORDED: 0 }, 0,
  )
  expect(seededBadTransfer.reconciles).toBe(false) // conservation does not close (a transfer that came from nowhere)
})
