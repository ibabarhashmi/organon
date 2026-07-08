/**
 * ORGΛNON — THE REALITY CHECK server (Honesty Layer Phase 4; Rule X-LEAN). The two-screen consumer tool, server-rendered
 * (Hono; PART CLEAN — no bundler). Exactly TWO screens: GET / (the Shelf) and GET /check/:key (the Reality Check). The
 * refresh grows the moat (a live keyless capture); health reports the frozen screen set. The app renders the
 * deterministic scorecard over the provenance record — REAL where recorded, the honest SAMPLE fallback where not.
 *
 * Boot:  bun run script/serve-reality.ts   (or ./organon.sh launch)
 */
import { Hono } from "hono"
import { Reality } from "../src/studio/reality"
import { ProvRecord } from "../src/dataplane/record"

export const app = new Hono()

// health — reports the FROZEN screen set (a third consumer screen is a Halt; the screens_frozen wall asserts length 2)
app.get("/health", (c) => c.json({ ok: true, screens: Reality.SCREENS, chain: ProvRecord.verify().present }))

// SCREEN 1 — the Shelf (triage). Reads the recorded pools (the moat); SAMPLE fallback when the record is empty/offline.
app.get("/", (c) => {
  const now = Date.now()
  let cards = Reality.shelfFromRecord(now)
  const sampleFallback = cards.length === 0
  if (sampleFallback) cards = Reality.shelfSample()
  const verdict = c.req.query("verdict") ?? undefined
  return c.html(Reality.renderShelf(cards, sampleFallback || cards.every((x) => x.reality === "SAMPLE"), verdict ? { verdict } : undefined))
})

// SCREEN 2 — the Reality Check (the x-ray of one strategy). An unknown key → an honest not-found (never a crash).
app.get("/check/:key", (c) => {
  const key = decodeURIComponent(c.req.param("key"))
  const rc = Reality.realityCheck(key, Date.now())
  if (!rc) return c.html(`<!doctype html><meta charset=utf8><body style="font-family:system-ui;background:#0e1116;color:#e6edf3;padding:24px"><a style="color:#58a6ff" href="/">← the Shelf</a><h1>Not found</h1><p>No strategy with that id is in the record. Nothing is fabricated.</p></body>`, 404)
  return c.html(Reality.renderRealityCheck(rc.name, rc.scored, rc.history))
})

// the refresh — an explicit live keyless capture that grows the moat, then back to the Shelf (offline → nothing recorded)
app.get("/refresh", async (c) => {
  const r = await Reality.refresh(Date.now())
  console.log(`refresh: ${r.reality} · recorded ${r.recorded} snapshots`)
  return c.redirect("/")
})

const port = Number(process.env.PORT ?? 4444)
export default { port, fetch: app.fetch }
if (import.meta.main) {
  const chain = ProvRecord.verify()
  console.log(`ORGΛNON — the Reality Check → http://localhost:${port}  (2 screens: the Shelf + the Reality Check)`)
  console.log(chain.present ? `  provenance record: ${chain.total} REAL snapshots on the chain (verified=${chain.ok})` : "  provenance record: empty — the Shelf boots in SAMPLE mode (honest); click ↻ refresh or run `bun run script/capture-defillama.ts` for live REAL data (keyless).")
}
