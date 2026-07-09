/**
 * ORGΛNON — THE SOVEREIGN SPRINT, Phase 4 wall (PLANE-EVENTS + DIVERGENCE; Spine B path 2 + X-PLANE d · S39/S40). The
 * HyperSync pool-events path, HERMETIC + positive-controlled: the narrow fence keeps ONLY the enumerated events (an
 * un-enumerated type is ignored — S40, never a full-protocol index); the free-tier token is an OPTIONAL seam (absent →
 * DEGRADE to the rented plane, honest, never a crash); and the divergence rule SURFACES an own-vs-rented disagreement as
 * a fact — recorded + rendered — NEVER silently resolved toward either source (S39, positive-controlled).
 */
import { test, expect } from "bun:test"
import { PlaneEvents } from "../../src/plane/events"
import { PlaneDivergence } from "../../src/plane/divergence"
import { Reality } from "../../src/studio/reality"

test("PLANE-EVENTS — the narrow fence (S40): extractEnumerated keeps ONLY {rate-update, tvl-move, liquidity-move}; an un-enumerated event is IGNORED (never a full index)", () => {
  const raw: PlaneEvents.RawEvent[] = [
    { ts: 3, name: "rate-update", value: 0.01 },
    { ts: 1, name: "transfer", value: 999 }, // un-enumerated → IGNORED (not indexed)
    { ts: 2, name: "tvl-move", value: 1_000_000 },
    { ts: 4, name: "approval", value: 5 }, // un-enumerated → IGNORED
    { ts: 5, name: "liquidity-move", value: 50_000 },
    { ts: 6, name: "swap", value: 7 }, // un-enumerated → IGNORED
  ]
  const events = PlaneEvents.extractEnumerated(raw)
  expect(events.map((e) => e.type)).toEqual(["tvl-move", "rate-update", "liquidity-move"]) // sorted by ts; only the fenced set
  expect(events).toHaveLength(3) // the 3 un-enumerated events did NOT enter (the fence holds)
  expect(events.every((e) => (PlaneEvents.ENUMERATED as readonly string[]).includes(e.type))).toBe(true)
})

test("PLANE-EVENTS — the token is an OPTIONAL seam (X-PLANE b): present → OWN-PLANE, absent → DEGRADED-RENTED (honest), never a crash", async () => {
  expect(PlaneEvents.mode("hs_tok")).toBe("OWN-PLANE")
  expect(PlaneEvents.mode(null)).toBe("DEGRADED-RENTED")
  expect(PlaneEvents.mode(undefined)).toBe("DEGRADED-RENTED")
  // token present + a fetch seam → own-plane extract (fenced)
  const own = await PlaneEvents.capture("pool-x", { token: "hs_tok", fetchHyperSync: async () => [{ ts: 1, name: "rate-update", value: 0.02 }, { ts: 2, name: "swap", value: 9 }] })
  expect(own.mode).toBe("OWN-PLANE")
  expect(own.events.map((e) => e.type)).toEqual(["rate-update"]) // the fence held even on the own-plane path
  // token absent → DEGRADE to the rented fallback, the ACTUAL source recorded honestly (never stamped own-plane)
  const degraded = await PlaneEvents.capture("pool-x", { token: null, rentedFallback: () => [{ ts: 1, type: "tvl-move", value: 5 }] })
  expect(degraded.mode).toBe("DEGRADED-RENTED")
  expect(degraded.source).toMatch(/absent|degrade|honest/i)
})

test("PLANE-EVENTS — a live HyperSync failure DEGRADES honestly to the rented plane (degrade-never-crash), never a fabricated series", async () => {
  const res = await PlaneEvents.capture("pool-x", { token: "hs_tok", fetchHyperSync: async () => { throw new Error("hypersync 503") }, rentedFallback: () => [] })
  expect(res.mode).toBe("DEGRADED-RENTED") // the failure did not crash; it degraded
  expect(res.events).toEqual([])
})

test("DIVERGENCE (X-PLANE d, S39) — a seeded own-vs-rented disagreement is RECORDED as a fact; NEITHER value is silently replaced", () => {
  const own: PlaneDivergence.Point[] = [{ key: "apy:pool-x", value: 5.0, asOf: 100 }, { key: "tvl:pool-x", value: 1_000_000 }]
  const rented: PlaneDivergence.Point[] = [{ key: "apy:pool-x", value: 5.1 }, { key: "tvl:pool-x", value: 1_200_000 }] // apy within 5%, tvl diverges 20%
  const divs = PlaneDivergence.divergences(own, rented) // tolerance 5%
  expect(divs).toHaveLength(1) // only the tvl (20% > 5%) is a divergence; the apy (2% < 5%) agrees
  expect(divs[0].key).toBe("tvl:pool-x")
  expect(divs[0].own).toBe(1_000_000) // the OWN value is preserved (not replaced)
  expect(divs[0].rented).toBe(1_200_000) // the RENTED value is preserved (not replaced) — both surfaced
  expect(divs[0].deltaPct).toBeCloseTo(16.67, 1) // |1.0-1.2|/1.2 = 16.7% — recorded, not resolved
})

test("DIVERGENCE — only OVERLAPPING keys compare; a value present in one plane only is NOT a divergence (no fabricated comparison)", () => {
  const divs = PlaneDivergence.divergences([{ key: "a", value: 1 }, { key: "own-only", value: 99 }], [{ key: "a", value: 1.01 }, { key: "rented-only", value: 42 }])
  expect(divs).toHaveLength(0) // 'a' agrees within tolerance; the non-overlapping keys are not compared
})

test("DIVERGENCE — the Pro-side row renders the disagreement as a fact when present, and is EMPTY when there is none (the S36 golden screens carry no plane data → no row → byte-identical)", () => {
  expect(Reality.divergenceRow([])).toBe("") // no divergence → no row → S36 holds on the golden screens
  const row = Reality.divergenceRow([{ key: "tvl:pool-x", own: 1_000_000, rented: 1_200_000, deltaPct: 16.67, asOf: null }])
  expect(row).toMatch(/own-plane vs rented/i)
  expect(row).toMatch(/neither source silently chosen/i) // the honesty statement renders
  expect(row).toMatch(/<span class="num">1000000<\/span>/) // both values shown (design-pass .num), neither hidden
  expect(row).toMatch(/<span class="num">1200000<\/span>/)
  expect(row).toMatch(/class="pro axis"/) // a Pro-side ROW, not a screen
})
