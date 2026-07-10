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
import { Feedback } from "../src/telemetry/feedback"

export const app = new Hono()

// ── the invited-tester rate limit (AB2, D22) — per-caller sliding window, applied to EVERY route; the two costly
// routes (/refresh live capture · /ask possible AI spend) get a tighter budget. Same shape as the studio guard
// (src/studio/routes.ts) — a Map of recent hit timestamps; injectable clock so the wall test can bite. 429 is a
// sentence, never a crash. In-memory per-process (localhost alpha) — ponytail: per-IP store if this ever fronts a proxy.
export interface LimitOpts { max: number; windowMs: number; now?: () => number }
export function perCallerLimit(opts: LimitOpts) {
  const hits = new Map<string, number[]>()
  const now = opts.now ?? (() => Date.now())
  return async (c: { req: { header(n: string): string | undefined } ; text(b: string, s: number): Response }, next: () => Promise<void>) => {
    const who = c.req.header("x-forwarded-for") ?? "local"
    const t = now()
    const recent = (hits.get(who) ?? []).filter((x) => t - x < opts.windowMs)
    if (recent.length >= opts.max) return c.text(`rate-limited — more than ${opts.max} requests in ${opts.windowMs / 1000}s. The Reality Check is a reading tool; slow down and it will answer. Nothing was recorded.`, 429)
    recent.push(t)
    hits.set(who, recent)
    await next()
  }
}
// honest headers (AH1, D22) — the defense-in-depth backstop behind the HTML escaping; server-rendered pages with
// inline styles/JS, so the CSP allows 'unsafe-inline' for self (still forbids every external origin + framing).
app.use("*", async (c, next) => {
  await next()
  c.res.headers.set("x-content-type-options", "nosniff")
  c.res.headers.set("x-frame-options", "DENY")
  c.res.headers.set("referrer-policy", "no-referrer")
  c.res.headers.set("content-security-policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'")
})
app.use("/refresh", perCallerLimit({ max: Number(process.env.REALITY_RL_REFRESH_MAX ?? 6), windowMs: 60_000 }))
app.use("/ask", perCallerLimit({ max: Number(process.env.REALITY_RL_ASK_MAX ?? 30), windowMs: 60_000 }))
app.use("*", perCallerLimit({ max: Number(process.env.REALITY_RL_MAX ?? 240), windowMs: 60_000 }))

// health — reports the FROZEN screen set: the conscious 3 (Shelf · Reality Check · Ask; the Stamp is a sub-route, not a
// screen — V1). A FOURTH screen is a Halt (the screens_frozen wall asserts the set is exactly ["shelf","reality-check","ask"]).
app.get("/health", (c) => c.json({ ok: true, screens: Reality.SCREENS, chain: ProvRecord.verify().present }))

// ── the /postmortems export view (Probe Phase 3; S53) — a DISPOSITIONED door (not a screen): the Stream/Elixir/Resolv
// re-score artifacts as JSON, the credibility artifact that ships with the invites. Read from the committed data/
// postmortems/ (the engine's actual recomputed output; every cell SAMPLE-labeled). Absent → an honest empty note.
app.get("/postmortems", async (c) => {
  const { readFileSync, existsSync } = await import("node:fs")
  const path = await import("node:path")
  const { PKG_ROOT } = await import("../src/organon/frozen")
  const dir = path.join(PKG_ROOT, "data", "postmortems")
  const idxP = path.join(dir, "index.json")
  if (!existsSync(idxP)) return c.json({ ok: true, postmortems: [], note: "no re-score artifacts recorded on this clone (run: bun run script/honesty/rescore-postmortems.ts)" })
  const index = JSON.parse(readFileSync(idxP, "utf8"))
  // each subject: the SAMPLE collapse RECONSTRUCTION + (Moat Phase 3; S56) the REAL current-state layer if captured —
  // per-cell REAL/SAMPLE provenance visible cell-by-cell (PIT-honest: REAL-AS-FETCHED-NOW, never as-of-collapse).
  const subjects = (index.subjects as { subject: string }[]).map((s) => {
    const sample = JSON.parse(readFileSync(path.join(dir, `${s.subject}.json`), "utf8"))
    const realP = path.join(dir, `${s.subject}-real.json`)
    const realLayer = existsSync(realP) ? JSON.parse(readFileSync(realP, "utf8")) : null
    return { ...sample, realLayer }
  })
  return c.json({ ok: true, rule: index.rule, allSample: index.allSample, realLayer: index.realLayer ?? null, subjects })
})

// ── the /feedback door (Probe Phase 2; X-TELEMETRY) — a DISPOSITIONED door (not a fourth screen): a tester's structured
// verdict on a verdict, scrubbed + appended LOCALLY (Feedback.submit runs the store scrubber; nothing egresses here).
// Body-capped, rate-limited (the `*` limit) + headered like every route. Never a stack, always a sentence.
app.post("/feedback", async (c) => {
  const raw = await c.req.text()
  if (raw.length > 8192) return c.json({ ok: false, message: "feedback body too large (cap 8KiB)." }, 413)
  let body: Record<string, unknown>
  try { body = JSON.parse(raw || "{}") } catch { return c.json({ ok: false, message: "feedback must be a JSON body: { screen, useful, trusted, missing }." }, 400) }
  const r = Feedback.submit({
    at: Date.now(),
    screen: body.screen as never,
    useful: Boolean(body.useful),
    trusted: Boolean(body.trusted),
    missing: String(body.missing ?? "").slice(0, 500),
  })
  if (!r.captured) return c.json({ ok: false, message: `feedback not recorded — ${r.reason}` }, 400)
  return c.json({ ok: true, message: "thank you — recorded locally + scrubbed. It leaves your machine only if you opt in to sharing (ORGANON_TELEMETRY_SHARE=1)." })
})

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
// localhost by DEFAULT (AB1, D22): Bun.serve binds 0.0.0.0 when no hostname is passed — every interface, not the
// localhost the banner claims. An invited tester on shared wifi must OPT IN to exposure (HOST=0.0.0.0), never fall into it.
const hostname = process.env.HOST ?? "127.0.0.1"
export default { port, hostname, fetch: app.fetch }
if (import.meta.main) {
  const chain = ProvRecord.verify()
  console.log(`ORGΛNON — the Reality Check → http://${hostname}:${port}  (3 screens: the Shelf · the Reality Check · the Ask console)`)
  console.log(chain.present ? `  provenance record: ${chain.total} REAL snapshots on the chain (verified=${chain.ok})` : "  provenance record: empty — the Shelf boots in SAMPLE mode (honest); click ↻ refresh or run `bun run script/capture-defillama.ts` for live REAL data (keyless).")
}
