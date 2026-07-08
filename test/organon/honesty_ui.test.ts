/**
 * ORGΛNON — THE HONESTY LAYER, Phase 4 walls (UI-TRUE; Rules X-LEAN, X-HONEST). THE CONSCIOUS 3 (V1): the two mass
 * screens — the Shelf (Reality Cards — REAL-yield split bar · verdict pill · REAL/SAMPLE badge · filters) and the Reality
 * Check (verdict banner · plain one-liner · scorecard rows · Simple/Pro · a confidence BAND not a hero APY · trust strip)
 * — plus the Ask Console (D7). The opt-in Stamp is a Pro SUB-ROUTE of the Reality Check (a drawer, NOT a screen); a
 * FOURTH screen is a Halt; the served routes reach a verdict through the REAL handlers; an unknown pool is an honest 404
 * (never a crash); UNVERIFIED renders as a gap; there is NO builder / composition (the user checks).
 */
import { test, expect } from "bun:test"
import { Reality } from "../../src/studio/reality"
import { Scorecard } from "../../src/analytics/scorecard"
import { app } from "../../script/serve-reality"

const facts = (o: Partial<Scorecard.PoolFacts>): Scorecard.PoolFacts => ({ name: "aave-v3 USDC", apyBase: 3.1, apyReward: null, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "abc123def456", ...o })

test("THE SCREEN SET IS A CONSCIOUS 3 (Crown-Jewel D7) — Shelf · Reality Check · Ask; a FOURTH screen is a Halt", () => {
  expect(Reality.SCREENS).toEqual(["shelf", "reality-check", "ask"])
  // the served app registers exactly three SCREEN routes (/, /check/:key, /ask); /health + /refresh are actions, and
  // /stamp/:key is the OPT-IN Stamp sub-surface of the Reality Check (X-OPTIN — a drawer, NOT a new screen).
  const nonScreen = new Set(["/health", "/refresh", "/stamp/:key"])
  const screenRoutes = app.routes.filter((r) => r.method === "GET" && !nonScreen.has(r.path))
  const unique = [...new Set(screenRoutes.map((r) => r.path))]
  expect(unique.sort()).toEqual(["/", "/ask", "/check/:key"]) // adding a 4th screen route fails this wall
})

// ── THE CROWN-JEWEL SPRINT — Phase 5 (INTEGRATE-TRUE): the opt-in Stamp drawer + the two-verdict distinction ──
test("INTEGRATE (X-OPTIN) — the Reality Check renders the opt-in Stamp LINK, Pro-only, with the two-verdict distinction; the mass render does NOT run the Stamp", () => {
  const s = Scorecard.score(facts({ ageDays: 900, sizeUsd: 240_000_000, depProtocols: 1 }))
  const html = Reality.renderRealityCheck("aave-v3 USDC", s, [], "defillama:pool:aa70268e-4b52-42bf-a116-608b370f9501")
  expect(html).toContain("/stamp/") // the opt-in link is present
  expect(html).toMatch(/opt-in/i)
  expect(html).toMatch(/GO\/NO-GO\/INSUFFICIENT/) // the two-verdict distinction is stated
  expect(html).toMatch(/never conflated/i)
  // the link lives INSIDE a Pro-only block (hidden until the Pro toggle) — the Stamp is not on the mass/Simple path
  const proIdx = html.indexOf("overfit Stamp")
  const beforeLink = html.slice(0, proIdx)
  expect(beforeLink.lastIndexOf('<div class="pro"')).toBeGreaterThan(beforeLink.lastIndexOf("</div>") - 500) // the Stamp drawer is a .pro block
  // the Reality Check page itself renders NO Stamp verdict word (the Stamp is not run here — it is reached by opting in)
  expect(html).not.toMatch(/\bpill (GO|NO-GO)\b/)
  // without a poolKey (the older callers) there is no Stamp link — additive, never forced
  expect(Reality.renderRealityCheck("x", s, [])).not.toContain("/stamp/")
})

test("INTEGRATE — the Stamp panel renders a DISTINCT verdict + the two-verdict note; UNAVAILABLE is honest (never a crash)", () => {
  const go: import("../../src/studio/stamp").Stamp.StampResult = { available: true, verdict: "GO", terminalState: "CONDITIONAL", dsr: 1, familyN: 1, nObs: 1249, reproHash: "c011ca1666c0f3660000", reason: "GO (conditional) — the recorded track record SURVIVES the anti-PBO deflation … NOT the scorecard's SOLID.", facts: null, decay: { tier: "TRACEABLE", halfLife: 9.9, atLeast: false, floor: 5, nObs: 1249, fit: { lags: [1, 2, 3, 5, 10], rho: [0.9, 0.8, 0.7, 0.5, 0.3], rate: 0.1, points: 5 }, reason: "TRACEABLE — a persistent signal." }, icir: { tier: "CONSISTENT", icir: 0.6, floor: 0.1, scope: "within-strategy-temporal", nPeriods: 1249, reason: "CONSISTENT — steady." }, cleanGo: true }
  const html = Reality.renderStamp("aave-v3 USDC", "defillama:pool:x", go)
  expect(html).toMatch(/The Stamp/)
  expect(html).toMatch(/>GO</) // the distinct verdict pill
  expect(html).toMatch(/SEPARATE verdict|never conflated|not conflated/i) // the two-verdict distinction
  expect(html).toMatch(/1249 recorded return points/) // the deflation basis is surfaced
  expect(html).toMatch(/INVOKED, never edited/i) // the reactivation-not-modification framing
  // PERSISTENCE (Phase 5) — the two opt-in DEPTH sub-scores render BESIDE the deflated-Sharpe basis (off the mass path)
  expect(html).toMatch(/Track-record depth/i)
  expect(html).toMatch(/half-life/i)
  expect(html).toMatch(/9\.9 periods/) // the decay half-life
  expect(html).toMatch(/TRACEABLE/)
  expect(html).toMatch(/within-strategy.*NOT a cross-sectional/i) // the ICIR scope wall
  expect(html).toMatch(/CLEAN GO/) // both depth hurdles cleared
  // the honest UNAVAILABLE state
  const na: import("../../src/studio/stamp").Stamp.StampResult = { available: false, verdict: "UNAVAILABLE", terminalState: "UNAVAILABLE", dsr: null, familyN: 0, nObs: 0, reproHash: null, reason: "The Stamp is unavailable — no recorded return history …", facts: null, decay: null, icir: null, cleanGo: false }
  expect(Reality.renderStamp("x", "defillama:pool:y", na)).toMatch(/unavailable/i)
})

test("INTEGRATE — the served /stamp/:key route works (a recorded pool → a Stamp panel; an unknown → honest 404)", async () => {
  const bad = await app.request("/stamp/defillama:pool:does-not-exist")
  expect(bad.status).toBe(404)
  const sampleKey = encodeURIComponent(`defillama:pool:${Reality.shelfSample()[0].poolKey.replace("defillama:pool:", "")}`)
  const st = await app.request(`/stamp/${sampleKey}`)
  expect(st.status).toBe(200)
  const html = await st.text()
  expect(html).toMatch(/The Stamp/)
  expect(html).toMatch(/GO|NO-GO|INSUFFICIENT|unavailable/i) // a distinct verdict (a SAMPLE/short pool → INSUFFICIENT/unavailable, honestly)
  expect(html).not.toMatch(/pill SOLID|pill CAUTION|pill AVOID|pill UNVERIFIED/) // never renders a scorecard verdict PILL (the prose may name the scorecard's verdict space to distinguish it)
})

test("INTEGRATE (F5) — the counterparty inputs are RESTATED (age · size · dependency) in the Pro register", () => {
  const s = Scorecard.score(facts({ ageDays: 900, sizeUsd: 240_000_000, depProtocols: 1 }))
  const html = Reality.renderRealityCheck("aave-v3 USDC", s, [], "defillama:pool:x")
  expect(html).toMatch(/deps 1/) // the dependency count is restated in the Pro value
  expect(html).toMatch(/age 900d/) // age
  expect(html).toMatch(/structural screen/i) // labeled a coarse structural screen, not an audit
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
  expect((await health.json()).screens).toHaveLength(3)

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
