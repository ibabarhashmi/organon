/**
 * ORGΛNON — THE REALITY CHECK server (Honesty Layer Phase 4; Rule X-LEAN). Server-rendered (Hono; PART CLEAN — no
 * bundler). THE CONSCIOUS 3 SCREENS (V1): GET / (the Shelf) + GET /check/:key (the Reality Check) — the two mass screens —
 * and GET /ask (the Ask Console, D7). The opt-in Stamp is a Pro SUB-ROUTE of the Reality Check (GET /stamp/:key, lazily
 * imported — a drawer of screen 2, NOT a screen); a fourth screen is a Halt. The refresh grows the moat (a live keyless
 * capture); health reports the frozen screen set. The app renders the deterministic scorecard over the provenance
 * record — REAL where recorded, the honest SAMPLE fallback where not.
 *
 * Boot:  bun run script/serve-reality.ts   (or ./organon.sh launch)
 */
import { Hono } from "hono"
import { Reality } from "../src/studio/reality"
import { ProvRecord } from "../src/dataplane/record"

export const app = new Hono()

// health — reports the FROZEN screen set: the conscious 3 (Shelf · Reality Check · Ask; the Stamp is a sub-route, not a
// screen — V1). A FOURTH screen is a Halt (the screens_frozen wall asserts the set is exactly ["shelf","reality-check","ask"]).
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
  return c.html(Reality.renderRealityCheck(rc.name, rc.scored, rc.history, key))
})

// THE STAMP (opt-in, Crown-Jewel; X-OPTIN) — the overfit stress test on ONE pool's recorded track record, reached ONLY
// by opting in (a distinct route, off the mass path). The adjudicator's runtime is LAZILY imported here so the mass tool
// stays Stamp-free (sidecar-optional). A distinct GO/NO-GO/INSUFFICIENT (or UNAVAILABLE) verdict, never the scorecard's.
app.get("/stamp/:key", async (c) => {
  const key = decodeURIComponent(c.req.param("key"))
  const rc = Reality.realityCheck(key, Date.now())
  if (!rc) return c.html(`<!doctype html><meta charset=utf8><body style="font-family:system-ui;background:#0e1116;color:#e6edf3;padding:24px"><a style="color:#58a6ff" href="/">← the Shelf</a><h1>Not found</h1><p>No strategy with that id is in the record. Nothing is fabricated.</p></body>`, 404)
  const { Stamp } = await import("../src/studio/stamp") // lazy — the attest core loads only when the Stamp is opted into
  const { Lineage } = await import("../src/studio/lineage") // the render-side lineage walls (X-LINEAGE); resolves the subject's OWN series identity
  const r = await Stamp.stampFor(key)
  const identity = Lineage.resolveIdentity(key) // WALL 2 — the per-subject identity, resolved at the render; WALL 1 guards the verdict against it
  return c.html(Reality.renderStamp(rc.name, key, r, identity))
})

// SCREEN 3 — the Ask Console (the grounded NL front door, Crown-Jewel D7). The ask module is LAZILY imported (the Shelf +
// Reality Check boot without it). The grounded path (Phase 6/7) runs server-side; AI-optional (no key → deterministic).
// The answer reaches the user ONLY through the grounded path — there is no direct model-to-user route.
app.get("/ask", async (c) => {
  const q = (c.req.query("q") ?? "").trim()
  const register = c.req.query("register") === "pro" ? "pro" : "simple"
  const raw = c.req.query("raw") === "1"
  const pool = c.req.query("pool") || undefined
  const { AskPhrase } = await import("../src/ask/phrase")
  const { AskProvider } = await import("../src/ask/provider")
  const { Ask } = await import("../src/ask/answer")
  const { VoiceContract } = await import("../src/ask/contract")
  const aiStatus = AskProvider.status() // server-side; reports keyed/provider, NEVER the key
  if (!q) return c.html(Reality.renderAsk({ register, raw, aiStatus, contextPool: pool }))
  const g = await AskPhrase.answerGrounded(q, { register, now: Date.now(), context: pool ? { poolKey: pool } : undefined })
  return c.html(Reality.renderAsk({ query: q, register, raw, intentKind: g.intent.kind, tool: g.result.tool, reality: g.result.reality, text: g.text, rawFacts: Ask.rawFacts(g.result), aiPhrased: g.aiPhrased, aiStatus, contextPool: pool, blocks: g.blocks, residual: VoiceContract.RESIDUAL_DISCLOSURE }))
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
  console.log(`ORGΛNON — the Reality Check → http://localhost:${port}  (3 screens: the Shelf · the Reality Check · the Ask console)`)
  console.log(chain.present ? `  provenance record: ${chain.total} REAL snapshots on the chain (verified=${chain.ok})` : "  provenance record: empty — the Shelf boots in SAMPLE mode (honest); click ↻ refresh or run `bun run script/capture-defillama.ts` for live REAL data (keyless).")
}
