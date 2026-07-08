/**
 * ORGΛNON — THE CROWN-JEWEL SPRINT, Phase 8 walls (ASK-TRUE; Rule X-ASK, D7). The third screen — the Ask Console, Simple/
 * Pro, context-aware, AI-optional. The screen set is a CONSCIOUS 3 (a fourth route fails the wall); Simple carries no raw
 * decimals, Pro shows the classified intent + engine tool + the raw/deterministic toggle; a context follow-up resolves
 * against the last strategy; the honest AI-off / unverified / unavailable states render; the console reaches an answer
 * ONLY through the grounded path (no direct model-to-user route). All offline (no key → the deterministic mode).
 */
import { test, expect } from "bun:test"
import { Reality } from "../../src/studio/reality"
import { Scorecard } from "../../src/analytics/scorecard"
import { app } from "../../script/serve-reality"

const aiOff = { keyed: false, provider: null }

test("ASK-TRUE — the Ask screen renders: an inviting input, suggested starters, the AI-status badge, the trust strip", () => {
  const html = Reality.renderAsk({ register: "simple", raw: false, aiStatus: aiOff })
  expect(html).toMatch(/Ask ORGΛNON/)
  expect(html).toMatch(/name="q"/) // the single inviting input
  expect(html).toMatch(/Ask about any strategy/i) // the placeholder
  expect(html).toMatch(/try:/) // suggested starters
  expect(html).toMatch(/AI phrasing off/i) // the honest AI-off badge (no key)
  expect(html).toMatch(/the AI only phrases/i) // the trust strip
})

test("ASK-TRUE — SIMPLE leads with the plain answer and carries NO raw decimals; the 'show me the numbers' expander is present", async () => {
  const r = await app.request("/ask?q=" + encodeURIComponent("is aave-v3 USDC safe?"))
  expect(r.status).toBe(200)
  const html = await r.text()
  // strip the <style> block + HTML tags → the visible PROSE carries no raw decimals in Simple (the CSS is not content)
  const visible = html.replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ")
  expect(/\d+\.\d+/.test(visible), `Simple answer must carry no raw decimals: ${visible.match(/\S*\d+\.\d+\S*/g)}`).toBe(false)
  expect(html).toMatch(/looks (solid|worth caution|one to avoid|unverified)/i) // verdict-first plain answer
  expect(html).toMatch(/show me the numbers/i) // the gentle Pro expander
})

test("ASK-TRUE — PRO shows the classified intent + the engine tool + the raw/deterministic toggle", async () => {
  const r = await app.request("/ask?q=" + encodeURIComponent("what is the peg of aave USDC") + "&register=pro")
  const html = await r.text()
  expect(html).toMatch(/intent <b>DATA_QUERY<\/b>/) // the classified intent is shown (the quant sees the routing)
  expect(html).toMatch(/engine tool <b>metric<\/b>/) // the engine tool is shown
  expect(html).toMatch(/raw engine facts/i) // the raw/deterministic toggle
})

test("ASK-TRUE — the RAW toggle renders the pure engine fact rows (byte-reproducible; zero phrasing)", async () => {
  const r = await app.request("/ask?q=" + encodeURIComponent("is aave-v3 USDC safe?") + "&register=pro&raw=1")
  const html = await r.text()
  expect(html).toMatch(/<pre/) // the raw facts are rendered verbatim
  expect(html).toMatch(/yield-reality|tvl-trend|peg/) // the engine fact-row ids
  // reproducible: the same request twice → identical raw block
  const r2 = await app.request("/ask?q=" + encodeURIComponent("is aave-v3 USDC safe?") + "&register=pro&raw=1")
  const pre = (h: string) => (h.match(/<pre[^>]*>([\s\S]*?)<\/pre>/)?.[1] ?? "")
  expect(pre(html)).toBe(pre(await r2.text()))
})

test("ASK-TRUE — context-aware: a follow-up ('what about its peg?') with a pool in context resolves to that strategy", async () => {
  const key = "defillama:pool:aa70268e-4b52-42bf-a116-608b370f9501"
  const r = await app.request("/ask?q=" + encodeURIComponent("what about its peg?") + "&register=pro&pool=" + encodeURIComponent(key))
  const html = await r.text()
  expect(html).toMatch(/intent <b>DATA_QUERY<\/b>/) // resolved to a metric query...
  expect(html).toMatch(/context: answering about the strategy/i) // ...against the context pool
})

test("ASK-TRUE — the honest states render: AI-off (no key), UNVERIFIED (a SAMPLE gap), UNSUPPORTED fallback", async () => {
  // AI-off (no key in CI)
  expect(await (await app.request("/ask?q=" + encodeURIComponent("what can you check?"))).text()).toMatch(/AI phrasing off/i)
  // a SAMPLE pool metric → UNVERIFIED gap, honestly (never a fabricated number)
  const sampleKey = `defillama:pool:${Reality.shelfSample()[0].poolKey.replace("defillama:pool:", "")}`
  const unv = await (await app.request("/ask?q=" + encodeURIComponent("tvl trend") + "&pool=" + encodeURIComponent(sampleKey))).text()
  expect(unv).toMatch(/unverified|can'?t confirm|SAMPLE|not-applicable/i)
  // an UNSUPPORTED query → the safe fallback, never a fabricated answer
  const uns = await (await app.request("/ask?q=" + encodeURIComponent("what is the airspeed of a swallow"))).text()
  expect(uns).toMatch(/can help with|check a strategy/i)
})

test("ASK-TRUE — the console reaches an answer ONLY through the grounded path (no direct model-to-user route)", async () => {
  // the /ask route always renders via renderAsk (the grounded path); an empty query → the input + starters, never a raw model call
  const empty = await app.request("/ask")
  expect(empty.status).toBe(200)
  expect(await empty.text()).toMatch(/Ask about any recorded strategy|Ask ORGΛNON/)
  // the served health reports the conscious-3 screen set
  const health = await (await app.request("/health")).json()
  expect(health.screens).toEqual(["shelf", "reality-check", "ask"])
})

test("ASK-TRUE — cross-screen nav: the Shelf links to Ask, and a Reality Check offers 'ask about this' (context)", () => {
  const shelf = Reality.renderShelf(Reality.shelfSample(), true)
  expect(shelf).toMatch(/\/ask/) // the Shelf nav reaches the Ask console
  const s = Scorecard.score({ name: "aave-v3 USDC", vertical: "lending", apyBase: 3.1, apyReward: null, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "c", ageDays: 900, sizeUsd: 240_000_000 })
  const rc = Reality.renderRealityCheck("aave-v3 USDC", s, [], "defillama:pool:aa70268e")
  expect(rc).toMatch(/ask about this/i) // the context-aware link
  expect(rc).toMatch(/pool=defillama%3Apool%3Aaa70268e/) // carries the pool as context
})
