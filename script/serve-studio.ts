/**
 * ORGΛNON STUDIO — SERVE (Phase 5 + Convergence Phase 1; Rule DOORS-OPEN, servable part). A reachable web app over the
 * live routes: the SEVEN display-only screens (incl. the Trust Panel) + the enrollment list, plus the live /studio API
 * a second party can POST to (submit, enroll). Display-only (renders API/ledger/inventory JSON, derives nothing); no
 * signing surface (S-NO-SIGN). Mutating routes are behind an optional Bearer credential (STUDIO_TOKEN), a rate limit,
 * and a size cap. The GENUINE second party who loads this + runs verify-v3 + submits is an OPERATOR-attested item
 * (L-2P) — this script makes the URL real; the stranger's fingerprints are the operator's to provide.
 *
 * Run:  STUDIO_TOKEN=... bun run script/serve-studio.ts   → serves on http://localhost:4319
 */
import { Hono } from "hono"
import path from "node:path"
import { existsSync, readFileSync } from "node:fs"
import { PKG_ROOT } from "../src/organon/frozen"
import { StudioRoutesNS } from "../src/studio/routes"
import { Durable } from "../src/studio/durable"
import { Enroll } from "../src/studio/enroll"
import { Capture } from "../src/studio/capture"
import { Inventory } from "../src/studio/inventory"
import { StudioScreens } from "../src/studio/screens"
import { StudioSurfaces } from "../src/studio/surfaces"
import { Console } from "../src/studio/console"
import { Builder } from "../src/studio/builder"
import { DataPlane } from "../src/dataplane/store"

const dir = path.join(PKG_ROOT, "data", "studio")
// W3-01 / T-SERVE: served submissions persist to an ISOLATED durable file (never the authored live-ledger.jsonl), so a
// stranger's first contact SURVIVES a restart AND untrusted served data never merges with the authored ledger.
const durable = Durable.DurableStore.open(path.join(dir, "served-submissions.jsonl"), { epochLabel: "2026-07-04" })
const book = new Enroll.Book(path.join(dir, "enrollments.jsonl"))
const readJson = (f: string, fallback: any) => (existsSync(path.join(dir, f)) ? JSON.parse(readFileSync(path.join(dir, f), "utf8")) : fallback)

// the GOAL CONSOLE's REAL data: the captured lending series (the delivered domain). A live free/open model slots in by
// registering a live provider; the served console uses the fixture provider (deterministic, free — no key here). The
// console derives nothing; it renders the joined-loop API result verbatim. Input caps + the same physics apply.
const CONSOLE_KEYS = ["lending:aave-v3:USDC:ethereum", "lending:sparklend:DAI:ethereum", "lending:fluid-lending:USDC:ethereum"]
const GOAL_MAX = 500
// W5-01 (walk v5): the console form must rate-limit exactly as the /studio API guard does (E-CONSOLE — "rate limits and
// input caps apply to the form exactly as to the API"). A per-caller window, checked BEFORE the joined loop spawns a
// sidecar, so a UI storm is refused (429) at the door, not absorbed as N sidecar runs. The verdict path is untouched.
const CONSOLE_RL = { max: Number(process.env.CONSOLE_RL_MAX ?? 20), windowMs: 60_000 }
const consoleHits = new Map<string, number[]>()
// W8-01 FIX: the pool composer's edit lineage, PER CALLER — successive composes by the same author accumulate so the
// family RATCHETS on the served door (a swap is another attempt; the anti-laundering ratchet is reachable through the UI,
// not just the module). Keyed per-author (x-forwarded-for) so one user's edits do not stiffen a stranger's bar — the
// coherent per-author scoping the coherence experiment settled on (the shared cross-author family stays parked).
const poolCompositions = new Map<string, import("../src/analytics/pool").Pool.PoolSpec[]>()
function consoleRateLimited(who: string): boolean {
  const t = Date.now()
  const recent = (consoleHits.get(who) ?? []).filter((x) => t - x < CONSOLE_RL.windowMs)
  if (recent.length >= CONSOLE_RL.max) { consoleHits.set(who, recent); return true }
  recent.push(t); consoleHits.set(who, recent); return false
}
function consoleSeries(): Map<string, DataPlane.Series> {
  const m = new Map<string, DataPlane.Series>()
  for (const k of CONSOLE_KEYS) { try { const s = DataPlane.snapshotAdapter.fetchSeries(k); if (s) m.set(k, s) } catch {} }
  return m
}

// clocks: prefer the SCHEDULER-originated stamps (C-TENSE — earns 'TICKING' at its true tense) when present
const schedFile = path.join(dir, "clock-stamps-scheduler.jsonl")
let capture: Capture.Service | null = null
try { capture = existsSync(schedFile) ? new Capture.Service(schedFile) : new Capture.Service(path.join(dir, "clock-stamps.jsonl")) } catch { capture = null }

const CADENCE = Number(process.env.SCHED_CADENCE_MS ?? 21_600_000) // the launchd StartInterval (6h) — gap if exceeded

function trustState(): StudioScreens.TrustState {
  const battery = readJson("battery-state.json", { walls: { green: 0, total: 0 }, battery: { pass: 0, fail: 0, files: 0 }, scope: "unknown" })
  const parks = readJson("parks.json", { parks: [] })
  const invPin: Inventory.Snapshot | null = existsSync(path.join(dir, "capability-inventory.json")) ? readJson("capability-inventory.json", null) : null
  const inv = invPin ? Inventory.verify(invPin) : { ok: true, regressions: [] }
  const now = Date.now()
  const clocks = ["lending", "funding", "fee-yield"].map((d) => ({ render: capture ? capture.status(d, now, { expectedCadenceMs: CADENCE }).render : `${d}: NOT TICKING — no capture service` }))
  return {
    walls: battery.walls ?? { green: 0, total: 0 },
    clocks,
    ledgerHead: durable.latestHash(),
    battery: { pass: battery.battery?.pass ?? 0, fail: battery.battery?.fail ?? 0, files: battery.battery?.files ?? 0, scope: `${battery.scope} · as of ${battery.asOf ?? "?"}` },
    inventory: { anchor: invPin?.anchorHash ?? "none", capabilities: invPin?.capabilities?.length ?? 0, regressions: inv.regressions.length },
    parks: { count: parks.parks.length, ids: parks.parks.map((p: any) => p.id) },
    independence: "PENDING — no non-author has acted (L-2P)",
  }
}

function dashboard(consoleState?: { goal: string | null; resultRender: string | null }, builderState?: { resultRender?: string | null; fundingBasisRender?: string | null; basisCex?: string; basisDex?: string }, poolState?: { render?: string | null }): string {
  const board = StudioSurfaces.leaderboard(
    durable.store.all().map((e) => ({ id: e.specHash.slice(0, 10), rootCount: durable.rootCount(e.authorId, e.domain), attestation: { verdict: "NO-GO", verifiability: "V0", searchHonesty: "declared", unconditional: false } as any })),
  )
  const enrollments = book.list((d) => (capture ? capture.freshCount(d) : 0))
  const ts = trustState()
  const presets = readJson("presets.json", { presets: [] }).presets as any[]
  const presetsBlock = presets.length
    ? presets.map((p) => `  ${p.goal}\n    → ${p.verdict} (tier ${p.tier}). ${p.teaches}`).join("\n\n")
    : "  (run script/presets.ts)"
  const screens: [string, string][] = [
    ["Trust Panel", StudioScreens.trustPanel(ts)],
    ["Worked examples (what an honest answer looks like)", presetsBlock],
    ["Leaderboard", StudioScreens.leaderboard(board)],
    ["Forward Clocks", ts.clocks.map((c) => "  " + c.render).join("\n")],
    ["Enrollments (OBSERVED, never performing)", enrollments.length ? enrollments.map((e) => `  ${e.enrollmentId} · ${e.verdict} · ${e.state} · stamps=${e.stampsObserved}`).join("\n") : "  (none yet — enroll a not-yet verdict)"],
  ]
  const esc = (s: string) => s.replace(/</g, "&lt;")
  return `<!doctype html><html><head><meta charset="utf-8"><title>ORGΛNON STUDIO</title>
<style>body{background:#0b0b0d;color:#d7d7db;font:13px/1.5 ui-monospace,monospace;max-width:900px;margin:2rem auto;padding:0 1rem}
h1{color:#8ab4f8}section{border:1px solid #23232a;border-radius:8px;padding:.6rem 1rem;margin:1rem 0}h2{color:#a1e6b5;font-size:13px;margin:.2rem 0 .6rem}pre{white-space:pre-wrap;margin:0}.empty{color:#e6c07b}</style></head>
<body><h1>ORGΛNON STUDIO — honest by construction</h1>
<p>Ledger trials: ${durable.length} · latest-hash ${durable.latestHash().slice(0, 12)}… · <span class="empty">leaderboard ${board.emptyOfGo ? "EMPTY OF GO (correct launch state)" : board.goCount + " GO"}</span></p>
<section><h2>Goal Console (screen 8 — the one interactive door)</h2>
<form method="post" action="/console/goal" style="margin:.4rem 0">
<input name="goal" maxlength="${GOAL_MAX}" placeholder="Earn steady stablecoin lending carry with honest costs" value="${esc(consoleState?.goal ?? "")}" style="width:70%;background:#141418;color:#d7d7db;border:1px solid #33333a;border-radius:5px;padding:.35rem .5rem;font:13px ui-monospace,monospace">
<button type="submit" style="background:#1f6feb;color:#fff;border:0;border-radius:5px;padding:.4rem .8rem;cursor:pointer">run goal</button></form>
<pre>${esc(StudioScreens.goalConsole({ goal: consoleState?.goal ?? null, resultRender: consoleState?.resultRender ?? null }))}</pre></section>
<section><h2>Guided Builder (screen 9 — compose the spec yourself)</h2>
<form method="post" action="/builder/compose" style="margin:.4rem 0">
${CONSOLE_KEYS.map((k) => `<label style="display:block">${esc(k.split(":").slice(1, 3).join(":"))} weight: <input name="w_${esc(k)}" type="number" step="0.1" min="0" max="1" value="0" style="width:5rem;background:#141418;color:#d7d7db;border:1px solid #33333a;border-radius:5px;padding:.2rem"></label>`).join("\n")}
<label style="display:block">policy: <select name="policy" style="background:#141418;color:#d7d7db;border:1px solid #33333a;border-radius:5px;padding:.2rem">${(Builder.FIELDS.find((f) => f.id === "policy")?.options ?? []).map((o) => `<option value="${o}"${o === Builder.DEFAULTS.policy ? " selected" : ""}>${o}</option>`).join("")}</select> <span style="color:#9a9a9a">(default: ${Builder.DEFAULTS.policy}, conservative)</span></label>
<button type="submit" style="background:#1f6feb;color:#fff;border:0;border-radius:5px;padding:.4rem .8rem;cursor:pointer">compose + submit</button></form>
<pre>${esc(StudioScreens.guidedBuilder({ fields: Builder.FIELDS.map((f) => ({ label: f.label, help: f.help, options: f.options })), resultRender: builderState?.resultRender ?? null }))}</pre>
<h2 style="margin-top:.8rem">Guided Builder — FUNDING (compose a funding-carry spec)</h2>
<form method="post" action="/builder/funding" style="margin:.4rem 0">
<label>venue: <select name="venue" style="background:#141418;color:#d7d7db;border:1px solid #33333a;border-radius:5px;padding:.2rem">${Builder.FUNDING_VENUES.map((v) => `<option${v === Builder.FUNDING_DEFAULTS.venue ? " selected" : ""}>${v}</option>`).join("")}</select></label>
<label>interval: <select name="interval" style="background:#141418;color:#d7d7db;border:1px solid #33333a;border-radius:5px;padding:.2rem">${Builder.FUNDING_INTERVALS.map((i) => `<option${i === Builder.FUNDING_DEFAULTS.intervalHours ? " selected" : ""}>${i}</option>`).join("")}</select>h</label>
<label>side: <select name="side" style="background:#141418;color:#d7d7db;border:1px solid #33333a;border-radius:5px;padding:.2rem"><option selected>receive</option><option>pay</option></select> <span style="color:#9a9a9a">(default: ${Builder.FUNDING_DEFAULTS.side}, conservative)</span></label>
<button type="submit" style="background:#1f6feb;color:#fff;border:0;border-radius:5px;padding:.4rem .8rem;cursor:pointer">compose funding + submit</button></form>
<h2 style="margin-top:.8rem">Guided Builder — BASIS (cross-venue; MIN-tier + EXPERIMENTAL shown before you compose)</h2>
<form method="post" action="/builder/basis" style="margin:.4rem 0">
<label>CeFi leg: <select name="cexVenue" style="background:#141418;color:#d7d7db;border:1px solid #33333a;border-radius:5px;padding:.2rem">${Builder.BASIS_CEX_VENUES.map((v) => `<option${v === Builder.BASIS_DEFAULTS.cexVenue ? " selected" : ""}>${v}</option>`).join("")}</select></label>
<label>DeFi leg: <select name="dexVenue" style="background:#141418;color:#d7d7db;border:1px solid #33333a;border-radius:5px;padding:.2rem">${Builder.BASIS_DEX_VENUES.map((v) => `<option${v === Builder.BASIS_DEFAULTS.dexVenue ? " selected" : ""}>${v}</option>`).join("")}</select></label>
<div style="color:#e6c07b;margin:.3rem 0">${esc(Builder.basisFormNote(builderState?.basisCex ?? Builder.BASIS_DEFAULTS.cexVenue, builderState?.basisDex ?? Builder.BASIS_DEFAULTS.dexVenue))}</div>
<button type="submit" style="background:#1f6feb;color:#fff;border:0;border-radius:5px;padding:.4rem .8rem;cursor:pointer">compose basis + submit</button></form>
<pre>${esc(builderState?.fundingBasisRender ?? "")}</pre></section>
<section><h2>Pool Composer (screen 10 — pool a portfolio; the pool pays the union's K_eff bill)</h2>
<form method="post" action="/pool/compose" style="margin:.4rem 0">
<label>members: <select name="count" style="background:#141418;color:#d7d7db;border:1px solid #33333a;border-radius:5px;padding:.2rem"><option>3</option><option selected>5</option><option>8</option></select></label>
<label>regime: <select name="regime" style="background:#141418;color:#d7d7db;border:1px solid #33333a;border-radius:5px;padding:.2rem"><option value="diversified" selected>diversified (low correlation)</option><option value="correlated">correlated (near-duplicate — see 'adds nothing')</option></select></label>
<button type="submit" style="background:#1f6feb;color:#fff;border:0;border-radius:5px;padding:.4rem .8rem;cursor:pointer">compose pool + submit</button></form>
<pre>${esc(StudioScreens.poolComposer({ resultRender: poolState?.render ?? null }))}</pre></section>
${screens.map(([t, body]) => `<section><h2>${esc(t)}</h2><pre>${esc(body)}</pre></section>`).join("\n")}
<p>API (a second party POSTs here): <code>POST /studio/submit_spec</code>, <code>POST /studio/enroll</code>${process.env.STUDIO_TOKEN ? " (Bearer credential required)" : ""}. Display-only; nothing signs.</p>
</body></html>`
}

const app = new Hono()
// honest headers (AH1, D22) — same backstop as :4444; inline styles/JS are server-rendered, external origins forbidden.
app.use("*", async (c, next) => {
  await next()
  c.res.headers.set("x-content-type-options", "nosniff")
  c.res.headers.set("x-frame-options", "DENY")
  c.res.headers.set("referrer-policy", "no-referrer")
  c.res.headers.set("content-security-policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'")
})
  .get("/", (c) => c.html(dashboard()))
  .get("/health", (c) => c.json({ ok: true, trials: durable.length }))
  .get("/trust", (c) => c.json(trustState()))
  // the GOAL CONSOLE flow — write-then-invoke, the SAME physics as the API: the goal → the free-model agent path → a
  // REAL-PIT adjudication → the verdict card + report, rendered VERBATIM. The console holds no privileged route; the
  // input cap applies as to the API; the verdict is the core's, untouched; honest failure states render truthfully.
  .post("/console/goal", async (c) => {
    // W5-01: rate-limit the form as the API is — BEFORE the joined loop spawns a sidecar (a UI storm is refused at the door)
    const who = c.req.header("x-forwarded-for") ?? "local"
    if (consoleRateLimited(who)) return c.html(dashboard({ goal: null, resultRender: `RATE-LIMITED: more than ${CONSOLE_RL.max} goals per minute from this caller. The console form is rate-limited exactly as the API is (nothing was registered; the verdict path is untouched). Try again shortly.` }))
    let goal = ""
    try { const body = await c.req.parseBody(); goal = String(body.goal ?? "").trim() } catch { goal = "" }
    if (!goal) return c.html(dashboard({ goal: null, resultRender: "MALFORMED-GOAL: please type a plain-English goal (nothing was registered)." }))
    if (goal.length > GOAL_MAX) return c.html(dashboard({ goal: goal.slice(0, 60) + "…", resultRender: `MALFORMED-GOAL: the goal exceeds the ${GOAL_MAX}-character input cap (the same cap the API enforces). Nothing was registered.` }))
    const series = consoleSeries()
    if (series.size < 2) return c.html(dashboard({ goal, resultRender: "BLOCKED: the lending snapshots are not present in this environment (gitignored on a fresh clone). Re-capture keyless via `bun run script/capture-dataplane.ts`. No verdict is fabricated." }))
    const provider = Console.fixtureProvider([...series.keys()])
    const result = await Console.runJoinedLoop(goal, series, provider, 1_735_689_600_000)
    return c.html(dashboard({ goal, resultRender: Console.renderResult(result) }))
  })
  // the GUIDED BUILDER flow (screen 9; U-AMEND, U-SURFACE) — a schema-driven composition over the existing lending
  // primitive → the IDENTICAL write-then-invoke gate → the verdict + panels. Validation comes from the same schema
  // (Builder.compose); an invalid composition is REFUSED with an honest message BEFORE registration (the failure state).
  .post("/builder/compose", async (c) => {
    const who = c.req.header("x-forwarded-for") ?? "local"
    if (consoleRateLimited(who)) return c.html(dashboard(undefined, { resultRender: `RATE-LIMITED: more than ${CONSOLE_RL.max} composes per minute (the builder is rate-limited exactly as the API is; nothing was registered).` }))
    const series = consoleSeries()
    if (series.size < 2) return c.html(dashboard(undefined, { resultRender: "BLOCKED: the lending snapshots are not present in this environment (gitignored on a fresh clone). Re-capture keyless via `bun run script/capture-dataplane.ts`. No verdict is fabricated." }))
    let body: Record<string, string> = {}
    try { body = (await c.req.parseBody()) as Record<string, string> } catch { body = {} }
    const markets = CONSOLE_KEYS.map((k) => ({ key: k, weight: Number(body[`w_${k}`] ?? 0) })).filter((m) => m.weight > 0)
    const composed = Builder.compose({ markets, policy: String(body.policy ?? Builder.DEFAULTS.policy), rebalance: "monthly", parentSpecHash: body.parent ?? null }, [...series.keys()])
    if (!composed.ok) return c.html(dashboard(undefined, { resultRender: `INVALID COMPOSITION (refused before registration): ${composed.error}` })) // the honest failure state
    const result = await Console.runComposed(composed.composed.spec, series, 1_735_689_600_000)
    return c.html(dashboard(undefined, { resultRender: Console.renderResult(result) }))
  })
  // the GUIDED BUILDER — FUNDING domain (Ensemble Phase 2; K-SCOPE cure, U-SURFACE). compose venue/interval/side over
  // the delivered funding primitives → the IDENTICAL write-then-invoke gate → verdict + panels (ILLUSTRATIVE data,
  // labeled). An invalid interval is REFUSED before registration (the failure state).
  .post("/builder/funding", async (c) => {
    const who = c.req.header("x-forwarded-for") ?? "local"
    if (consoleRateLimited(who)) return c.html(dashboard(undefined, { fundingBasisRender: `RATE-LIMITED: more than ${CONSOLE_RL.max} composes per minute (nothing was registered).` }))
    let body: Record<string, string> = {}
    try { body = (await c.req.parseBody()) as Record<string, string> } catch { body = {} }
    const composed = Builder.composeFunding({ venue: body.venue, interval: body.interval, side: body.side })
    if (!composed.ok) return c.html(dashboard(undefined, { fundingBasisRender: `INVALID COMPOSITION (refused before registration): ${composed.error}` }))
    const result = await Console.runComposedFunding(composed.spec, 1_735_689_600_000)
    return c.html(dashboard(undefined, { fundingBasisRender: Console.renderResult(result) }))
  })
  // the GUIDED BUILDER — BASIS domain (Ensemble Phase 2; K-SCOPE cure, U-SURFACE, R-BASIS). compose the cross-venue pair;
  // the MIN-tier + EXPERIMENTAL are surfaced INLINE before composing; the per-leg tiers render on the verdict. A
  // mismatched-venue pair (a leg that is not a valid CeFi/DeFi venue) is REFUSED before registration (the failure state).
  .post("/builder/basis", async (c) => {
    const who = c.req.header("x-forwarded-for") ?? "local"
    if (consoleRateLimited(who)) return c.html(dashboard(undefined, { fundingBasisRender: `RATE-LIMITED: more than ${CONSOLE_RL.max} composes per minute (nothing was registered).` }))
    let body: Record<string, string> = {}
    try { body = (await c.req.parseBody()) as Record<string, string> } catch { body = {} }
    const composed = Builder.composeBasis({ cexVenue: body.cexVenue, dexVenue: body.dexVenue })
    if (!composed.ok) return c.html(dashboard(undefined, { basisCex: body.cexVenue, basisDex: body.dexVenue, fundingBasisRender: `INVALID COMPOSITION (refused before registration): ${composed.error}` }))
    const result = await Console.runComposedBasis(composed.spec, 1_735_689_600_000)
    return c.html(dashboard(undefined, { basisCex: composed.spec.cexVenue, basisDex: composed.spec.dexVenue, fundingBasisRender: `[ in-form: ${composed.formNote} ]\n\n${Console.renderResult(result)}` }))
  })
  // the POOL COMPOSER (Ensemble Phase 3; K-EFF, K-LEGIBLE, U-AMEND-2, U-SURFACE) — the tenth screen, through the open
  // door. compose a depth-1 pool of member strategies → the pool registers as a trial at the union's K_eff charge → the
  // frozen core adjudicates the pooled series → the verdict + K_eff + union family + the mandatory stress caveat + the
  // legible deflation basis. An over-correlated pool (K_eff≈1) renders "this pool adds nothing" plainly (not refused); a
  // pool of <2 members is refused before registration (the failure state). ILLUSTRATIVE member data, labeled.
  .post("/pool/compose", async (c) => {
    const who = c.req.header("x-forwarded-for") ?? "local"
    if (consoleRateLimited(who)) return c.html(dashboard(undefined, undefined, { render: `RATE-LIMITED: more than ${CONSOLE_RL.max} composes per minute (nothing was registered).` }))
    let body: Record<string, string> = {}
    try { body = (await c.req.parseBody()) as Record<string, string> } catch { body = {} }
    const count = Math.max(0, Math.min(8, Number(body.count ?? 5)))
    const regime = body.regime === "correlated" ? "correlated" : "diversified"
    // W8-01 FIX: thread the EDIT LINEAGE through the door, PER AUTHOR — a successive compose IS another attempt in the
    // same author's pool family, so the family RATCHETS (n rises, never resets) on the served surface. A successive
    // compose is a genuine EDIT (a swapped member set via the variant); the prior compositions are passed as
    // priorCompositions; the new one is accumulated under this author's key (one user's edits never stiffen a stranger's).
    const prior = poolCompositions.get(who) ?? []
    const members = Console.illustrativePoolMembers(count, regime, 400, prior.length)
    const result = await Console.runComposedPool(members, 1_735_689_600_000, { priorCompositions: [...prior] })
    if (result.spec) poolCompositions.set(who, [...prior, result.spec])
    return c.html(dashboard(undefined, undefined, { render: result.render }))
  })
  // mount the PERSISTING view (mountableStore) so served submits survive a restart (W3-01 fixed); bounded served-abuse:
  // authn (Bearer) + rate-limit (120/min) + size cap (64KB) + a per-author root quota (registration friction). The
  // sybil residual (a fresh authorId resets the quota) is NAMED, mitigated not eliminated (see SERVED-PERSISTENCE-MEMO).
  .route("/studio", StudioRoutesNS.mountable(durable.mountableStore({ maxRootsPerAuthorDomain: 25 }), book, { token: process.env.STUDIO_TOKEN, rateLimit: { max: 120, windowMs: 60_000 }, maxBodyBytes: 65_536 }))

const port = Number(process.env.PORT ?? 4319)
// localhost by DEFAULT (AB1, D22): Bun.serve binds 0.0.0.0 when no hostname is passed — and the unset-STUDIO_TOKEN
// "safe because localhost" default is only true if the bind actually IS localhost. Exposure is an opt-in (HOST=0.0.0.0),
// and any non-localhost exposure should set STUDIO_TOKEN (documented in ALPHA.md).
const hostname = process.env.HOST ?? "127.0.0.1"
// export the served app so U-SURFACE traversals hit the REAL route handlers (a fresh served request, not a cached
// renderer) — the console-path evidence the reachability law demands (U-SURFACE). Importing does NOT bind a port.
export { app, dashboard }
if (import.meta.main) console.log(`ORGΛNON STUDIO served → http://${hostname}:${port}  (trials=${durable.length}${process.env.STUDIO_TOKEN ? ", mutating routes behind a Bearer credential" : ""})`)
export default { port, hostname, fetch: app.fetch }
