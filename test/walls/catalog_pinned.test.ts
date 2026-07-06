/**
 * WALL — the E2E catalog is pinned + anti-removal (End-User Phase 0; Rule E-CATALOG). The objectivity fix for
 * minimum-margin convergence: "clean" is measured against a pinned inventory written before the fixing. The wall proves
 * the catalog carries every mandated class, every scenario names its expected honest behavior, the content-sha is
 * reproducible (provenance), and — positive control — a REMOVED baseline scenario or an expected-less scenario is CAUGHT.
 */
import { test, expect } from "bun:test"
import { Catalog } from "../../src/studio/catalog"

test("the live catalog verifies: baseline intact, every scenario has an expected behavior, every mandated class present", () => {
  const v = Catalog.verify()
  expect(v.ok).toBe(true)
  expect(v.count).toBeGreaterThanOrEqual(Catalog.BASELINE_IDS.length)
  expect(v.byClass["realistic"]).toBeGreaterThanOrEqual(1)
  expect(v.byClass["adversarial"]).toBeGreaterThanOrEqual(1)
  expect(v.byClass["edge"]).toBeGreaterThanOrEqual(1)
})

test("the content-sha is order-independent (reproducible provenance pin)", () => {
  const cat = Catalog.load()!
  const a = Catalog.contentSha(cat)
  const reordered = { ...cat, scenarios: [...cat.scenarios].reverse() }
  expect(Catalog.contentSha(reordered)).toBe(a) // reordering does not move the sha (canonical)
})

test("POSITIVE CONTROL: a REMOVED baseline scenario is CAUGHT (the catalog may only grow)", () => {
  const cat = Catalog.load()!
  const dropped = { ...cat, scenarios: cat.scenarios.filter((s) => s.id !== Catalog.BASELINE_IDS[0]) }
  const v = Catalog.verify(dropped)
  expect(v.ok).toBe(false)
  expect(v.issues.some((i) => i.includes("REMOVED baseline"))).toBe(true)
})

test("POSITIVE CONTROL: a scenario missing its expected honest behavior is CAUGHT", () => {
  const cat = Catalog.load()!
  const stripped = { ...cat, scenarios: cat.scenarios.map((s, i) => (i === 0 ? { ...s, expected: "" } : s)) }
  const v = Catalog.verify(stripped)
  expect(v.ok).toBe(false)
  expect(v.issues.some((i) => i.includes("no expected honest behavior"))).toBe(true)
})

test("ADD is allowed (the catalog grows): a superset still verifies", () => {
  const cat = Catalog.load()!
  const grown = { ...cat, scenarios: [...cat.scenarios, { id: "X9-redteam-added", persona: "adversary", class: "adversarial" as const, door: "UI", workflow: "a scenario the red-team added mid-walk", expected: "the system does the honest thing" }] }
  expect(Catalog.verify(grown).ok).toBe(true)
})
