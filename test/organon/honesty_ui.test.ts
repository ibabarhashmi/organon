/**
 * ORGΛNON — THE HONESTY LAYER, Phase 4 walls (UI-TRUE; Rules X-LEAN, X-HONEST). The two-screen consumer tool: the Shelf
 * (Reality Cards — REAL-yield split bar · verdict pill · REAL/SAMPLE badge · filters) and the Reality Check (verdict
 * banner · plain one-liner · scorecard rows · Simple/Pro · a confidence BAND not a hero APY · trust strip). The screen
 * set is FROZEN AT 2 (a third is a Halt); the served routes reach a verdict through the REAL handlers; an unknown pool is
 * an honest 404 (never a crash); UNVERIFIED renders as a gap; there is NO builder / composition (the user checks).
 */
import { test, expect } from "bun:test"
import { Reality } from "../../src/studio/reality"
import { Scorecard } from "../../src/analytics/scorecard"
import { app } from "../../script/serve-reality"

const facts = (o: Partial<Scorecard.PoolFacts>): Scorecard.PoolFacts => ({ name: "aave-v3 USDC", apyBase: 3.1, apyReward: null, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "abc123def456", ...o })

test("THE SCREEN SET IS FROZEN AT 2 — a third consumer screen is a Halt", () => {
  expect(Reality.SCREENS).toEqual(["shelf", "reality-check"])
  // the served app registers exactly two SCREEN routes (/, /check/:key); /health + /refresh are not screens
  const screenRoutes = app.routes.filter((r) => r.method === "GET" && r.path !== "/health" && r.path !== "/refresh")
  const unique = [...new Set(screenRoutes.map((r) => r.path))]
  expect(unique.sort()).toEqual(["/", "/check/:key"]) // adding a 3rd screen route fails this wall
})

test("SCREEN 1 — the Shelf renders Reality Cards: split bar + verdict pill + REAL/SAMPLE badge + filters", () => {
  const cards = Reality.shelfSample()
  const html = Reality.renderShelf(cards, true)
  expect(html).toContain("The Shelf")
  expect(html).toContain("class=\"bar\"") // the REAL-yield split bar
  expect(html).toMatch(/pill (SOLID|CAUTION|AVOID|UNVERIFIED)/) // a verdict pill
  expect(html).toContain("badge SAMPLE") // the freshness badge, honestly SAMPLE
  expect(html).toContain("verdict=AVOID") // the filters
  expect(html).toContain("SAMPLE mode") // the honest offline note
})

test("SCREEN 2 — the Reality Check: verdict banner + one-liner + scorecard rows + Simple/Pro + confidence band + trust strip", () => {
  const s = Scorecard.score(facts({ apyBase: 0.5, apyReward: 9.5 })) // AVOID (emissions)
  const html = Reality.renderRealityCheck("aave-v3 USDC", s, [])
  expect(html).toContain("pill AVOID") // the verdict banner
  expect(html).toMatch(/temporary reward emissions/) // the plain one-liner
  expect(html).toContain("yield reality") // a scorecard row
  expect(html).toContain("Simple / Pro") // the toggle
  expect(html).toContain("class=\"band\"") // the confidence band
  expect(html).toContain("never a single hero APY")
  expect(html).toContain("not financial advice") // the trust strip
})

test("UNVERIFIED renders as an honest gap on both screens (never a disguised pass)", () => {
  const s = Scorecard.score(facts({ reality: "SAMPLE" }))
  expect(s.verdict).toBe("UNVERIFIED")
  const rc = Reality.renderRealityCheck("x", s, [])
  expect(rc).toContain("pill UNVERIFIED")
  expect(rc).toMatch(/can'?t confirm|UNVERIFIED/)
  const shelf = Reality.renderShelf(Reality.shelfSample(), true)
  expect(shelf).toContain("pill UNVERIFIED") // SAMPLE cards are UNVERIFIED, labeled
})

test("NO builder / composition (X-LEAN) — the consumer screens have no compose/build form", () => {
  const shelf = Reality.renderShelf(Reality.shelfSample(), true)
  const rc = Reality.renderRealityCheck("x", Scorecard.score(facts({})), [])
  for (const html of [shelf, rc]) {
    expect(html).not.toMatch(/compose|build your|<form/i) // the user CHECKS, they do not build
  }
})

test("the served routes reach a verdict through the REAL handlers; an unknown pool is an honest 404, no crash", async () => {
  const home = await app.request("/")
  expect(home.status).toBe(200)
  const homeHtml = await home.text()
  expect(homeHtml).toContain("The Shelf")

  const health = await app.request("/health")
  expect((await health.json()).screens).toHaveLength(2)

  // an unknown pool id → honest 404 (never a fabricated verdict)
  const bad = await app.request("/check/defillama:pool:does-not-exist")
  expect(bad.status).toBe(404)
  expect(await bad.text()).toMatch(/not found|nothing is fabricated/i)

  // a SAMPLE pool id → the Reality Check x-rays it honestly as UNVERIFIED
  const sampleKey = encodeURIComponent(`defillama:pool:${Reality.shelfSample()[0].poolKey.replace("defillama:pool:", "")}`)
  const rc = await app.request(`/check/${sampleKey}`)
  expect(rc.status).toBe(200)
  expect(await rc.text()).toContain("pill UNVERIFIED")
})

test("the Shelf from the record is clone-robust — REAL cards where the payload is present, SAMPLE where absent", () => {
  const cards = Reality.shelfFromRecord(Date.now())
  if (cards.length === 0) { console.log("  (honesty_ui) no recorded pools — SAMPLE fallback covers the Shelf"); return }
  for (const c of cards) {
    expect(["REAL", "SAMPLE"]).toContain(c.reality)
    if (c.reality === "SAMPLE") expect(c.verdict).toBe("UNVERIFIED") // absent payload → honest UNVERIFIED, never a mislabeled REAL
    expect(["SOLID", "CAUTION", "AVOID", "UNVERIFIED"]).toContain(c.verdict)
  }
})
