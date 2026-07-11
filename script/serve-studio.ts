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

// ── THE CRAFTED OPERATOR CONSOLE (design pass — Direction B: a mono-forward, transcript-first operator console rendered
// in ORGΛNON's OWN dark design language). The stylesheet MIRRORS the pinned design tokens (data/honesty/design-tokens.json
// — the same palette, type scale, spacing, ease-out motion, and honesty grammar: the FACTS are the loudest thing, every
// distinction carries a non-color cue, no gradients / neon / nested-cards / side-tab borders / bounce). It is a SEPARATE,
// self-contained inline sheet: this surface is outside surface_system, and the Reality Check's public/organon.css is left
// byte-untouched. The honest engine transcripts (StudioScreens.* / Console.renderResult) render VERBATIM inside <pre> —
// the frame gets the craft, the facts do not move. Server-rendered; the only script is progressive submit-feedback.
const esc = (s: string) => s.replace(/</g, "&lt;")
const STUDIO_CSS = `:root{--bg:#0d1117;--surface:#161b22;--surface2:#1b2029;--border:#2a313c;--border-strong:#3b434f;--ink:#e6edf3;--ink-muted:#9aa5b1;--ink-faint:#7e8894;--accent:#6cb6ff;--accent-hi:#8cc6ff;--accent-ink:#0d1117;--real:#3fb950;--sample:#d29922;--avoid:#f85149;--font:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;--mono:ui-monospace,'SF Mono','JetBrains Mono',Menlo,Consolas,monospace;--sp1:4px;--sp2:8px;--sp3:12px;--sp4:16px;--sp5:24px;--sp6:32px;--sp7:48px;--r-sm:6px;--r-md:8px;--r-lg:12px;--r-pill:999px;--dur-fast:120ms;--dur:200ms;--ease:cubic-bezier(0.22,1,0.36,1);--wrap:980px}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:74px}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font);font-size:0.9rem;line-height:1.55;font-weight:400}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:var(--r-sm)}
h2{font-size:1.15rem;font-weight:620;letter-spacing:-0.01em;margin:0;color:var(--ink);text-wrap:balance}
.statusbar{position:sticky;top:0;z-index:20;background:var(--surface2);border-bottom:1px solid var(--border);padding:var(--sp3) var(--sp5);display:flex;align-items:center;gap:var(--sp4);flex-wrap:wrap}
.brand{font-weight:650;letter-spacing:-0.01em;color:var(--ink);white-space:nowrap;font-size:0.98rem}
.brand .st{color:var(--ink-muted);font-weight:500}
.brand .tag{color:var(--ink-faint);font-weight:400;font-size:0.76rem;margin-left:var(--sp2)}
.jump{display:flex;gap:var(--sp4);font-family:var(--mono);font-size:0.78rem}
.jump a{color:var(--ink-muted)}.jump a:hover{color:var(--ink);text-decoration:none}
.pulse{margin-left:auto;display:flex;align-items:center;gap:var(--sp3);font-family:var(--mono);font-size:0.76rem;color:var(--ink-muted);white-space:nowrap}
.pulse b{color:var(--ink);font-weight:600}.pulse .sep{color:var(--border-strong)}
.live{display:inline-flex;align-items:center;gap:6px;color:var(--real)}
.live::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--real);animation:beat 2.4s var(--ease) infinite}
@keyframes beat{0%,100%{opacity:1}50%{opacity:.4}}
.wrap{max-width:var(--wrap);margin:0 auto;padding:var(--sp6) var(--sp5) var(--sp5)}
.lead{color:var(--ink-muted);font-size:0.9rem;margin:0 0 var(--sp6);max-width:70ch}
.lead b{color:var(--ink);font-weight:600}
section{margin:0 0 var(--sp7);scroll-margin-top:74px}
.sec-head{display:flex;align-items:baseline;gap:var(--sp3);margin:0 0 var(--sp4);flex-wrap:wrap}
.sec-head .hint{color:var(--ink-faint);font-size:0.82rem}
.prompt::before{content:"\\203a ";color:var(--accent);font-family:var(--mono);font-weight:700}
.tool{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin-bottom:var(--sp4)}
.tool--door{border-color:var(--border-strong)}
.tool__head{padding:var(--sp3) var(--sp4);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:var(--sp3);flex-wrap:wrap}
.tool__title{font-weight:620;font-size:0.92rem;color:var(--ink)}
.tool__n{font-family:var(--mono);color:var(--ink-faint);font-size:0.74rem;font-weight:600}
.tool__note{color:var(--ink-muted);font-size:0.8rem}
.tool__body{padding:var(--sp4)}
.form{display:flex;flex-wrap:wrap;gap:var(--sp3) var(--sp4);align-items:flex-end}
.form + .form{margin-top:var(--sp4);padding-top:var(--sp4);border-top:1px dashed var(--border)}
.f{display:flex;flex-direction:column;gap:6px}
.f--grow{flex:1;min-width:0}.f--grow .field{width:100%}
.lbl{font-size:0.76rem;color:var(--ink-muted);font-weight:600}
.field{min-height:40px;padding:var(--sp2) var(--sp3);border-radius:var(--r-md);border:1px solid var(--border);background:var(--bg);color:var(--ink);font-size:0.88rem;font-family:var(--mono);transition:border-color var(--dur-fast) var(--ease)}
.field:hover{border-color:var(--border-strong)}
.field:focus{border-color:var(--accent);outline:none}
.field--grow{flex:1;min-width:260px}
.field--num{width:6.5rem}
select.field{cursor:pointer;padding-right:var(--sp5)}
.hintline{color:var(--ink-faint);font-size:0.78rem;width:100%}
.warn{color:var(--sample);font-size:0.8rem;width:100%;font-family:var(--mono);line-height:1.5}
.btn{min-height:40px;padding:var(--sp2) var(--sp4);border-radius:var(--r-md);border:1px solid var(--border-strong);background:var(--surface2);color:var(--ink);font-weight:600;font-size:0.88rem;cursor:pointer;display:inline-flex;align-items:center;gap:var(--sp2);transition:background var(--dur-fast) var(--ease),border-color var(--dur-fast) var(--ease),transform var(--dur-fast) var(--ease)}
.btn:hover{background:var(--border)}.btn:active{transform:translateY(1px)}
.btn--primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent);font-weight:650}
.btn--primary:hover{background:var(--accent-hi);border-color:var(--accent-hi)}
.btn[disabled]{opacity:.6;cursor:progress}.btn__a{font-family:var(--mono)}
.tscript{margin-top:var(--sp4)}
.tscript__head{font-family:var(--mono);font-size:0.72rem;color:var(--ink-faint);letter-spacing:0.02em;margin-bottom:var(--sp2)}
.tscript pre{margin:0;background:var(--bg);border:1px solid var(--border);border-radius:var(--r-md);padding:var(--sp3) var(--sp4);font-family:var(--mono);font-size:0.8rem;line-height:1.62;color:var(--ink);white-space:pre-wrap;overflow-wrap:anywhere;overflow-x:auto}
.tscript__empty{margin-top:var(--sp4);color:var(--ink-faint);font-size:0.8rem;font-style:italic}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:var(--sp4)}
.panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;display:flex;flex-direction:column}
.panel--wide{grid-column:1/-1}
.panel__head{padding:var(--sp3) var(--sp4);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:var(--sp2);font-weight:620;font-size:0.88rem;color:var(--ink)}
.panel__meta{font-family:var(--mono);font-size:0.74rem;color:var(--ink-muted);font-weight:500}
.panel pre{margin:0;padding:var(--sp3) var(--sp4);font-family:var(--mono);font-size:0.78rem;line-height:1.62;color:var(--ink);white-space:pre-wrap;overflow-wrap:anywhere;flex:1}
.chip{font-family:var(--mono);font-size:0.74rem;padding:2px 8px;border-radius:var(--r-pill);border:1px solid currentColor;white-space:nowrap}
.chip--empty{color:var(--sample)}.chip--go{color:var(--real)}
.foot{max-width:var(--wrap);margin:0 auto;padding:var(--sp5);border-top:1px solid var(--border);color:var(--ink-faint);font-size:0.8rem;line-height:1.7}
.foot code{font-family:var(--mono);color:var(--ink-muted);background:var(--surface);padding:2px 6px;border-radius:var(--r-sm);border:1px solid var(--border);font-size:0.76rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important;scroll-behavior:auto!important}}
@media (max-width:640px){.wrap{padding:var(--sp5) var(--sp4)}.statusbar{padding:var(--sp2) var(--sp4);gap:var(--sp2) var(--sp3)}.jump{order:3;width:100%;justify-content:flex-start}.pulse{margin-left:0}.f--grow{flex-basis:100%}.grid{grid-template-columns:1fr}}`

// a labeled form field (the one control vocabulary)
function ff(label: string, control: string, cls = ""): string {
  return `<div class="f${cls ? " " + cls : ""}"><span class="lbl">${label}</span>${control}</div>`
}
// the honest engine transcript, framed as the hero — a lowercase mono panel; hidden to a hint when there is no result yet
function tscript(content: string | null | undefined, emptyHint: string): string {
  const c = (content ?? "").trim()
  if (!c) return `<div class="tscript__empty">${emptyHint}</div>`
  return `<div class="tscript"><div class="tscript__head">verbatim engine transcript</div><pre>${esc(content ?? "")}</pre></div>`
}
// a read-only system-state panel
function panel(title: string, meta: string, body: string, wide = false): string {
  return `<div class="panel${wide ? " panel--wide" : ""}"><div class="panel__head"><span>${esc(title)}</span>${meta}</div><pre>${esc(body)}</pre></div>`
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
  const enrollBody = enrollments.length ? enrollments.map((e) => `  ${e.enrollmentId} · ${e.verdict} · ${e.state} · stamps=${e.stampsObserved}`).join("\n") : "  (none yet — enroll a not-yet verdict)"
  const lbChip = board.emptyOfGo ? `<span class="chip chip--empty">EMPTY OF GO · correct launch state</span>` : `<span class="chip chip--go">${board.goCount} GO</span>`
  const wallsMeta = `<span class="panel__meta">${ts.walls.green}/${ts.walls.total} walls green</span>`
  const batteryMeta = `<span class="panel__meta">${ts.battery.pass} pass · ${ts.battery.fail} fail</span>`

  // the shared render pieces (form fields + engine renders) — the honest content passes through esc() VERBATIM (unchanged)
  const policyOpts = (Builder.FIELDS.find((f) => f.id === "policy")?.options ?? []).map((o) => `<option value="${o}"${o === Builder.DEFAULTS.policy ? " selected" : ""}>${o}</option>`).join("")
  const goalRender = StudioScreens.goalConsole({ goal: consoleState?.goal ?? null, resultRender: consoleState?.resultRender ?? null })
  const lendingRender = StudioScreens.guidedBuilder({ fields: Builder.FIELDS.map((f) => ({ label: f.label, help: f.help, options: f.options })), resultRender: builderState?.resultRender ?? null })
  const poolRender = StudioScreens.poolComposer({ resultRender: poolState?.render ?? null })

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ORGΛNON · studio</title>
<style>${STUDIO_CSS}</style></head>
<body>
<header class="statusbar">
<span class="brand">ORGΛNON<span class="st"> · studio</span><span class="tag">honest by construction</span></span>
<nav class="jump" aria-label="sections"><a href="#door">Goal</a><a href="#compose">Compose</a><a href="#pool">Pool</a><a href="#state">State</a></nav>
<span class="pulse"><span>ledger <b>${durable.length}</b></span><span class="sep">·</span><span>hash ${esc(durable.latestHash().slice(0, 10))}…</span><span class="sep">·</span><span class="live">live</span></span>
</header>
<main class="wrap">
<p class="lead">The operator console for a trust machine. Every panel below renders the engine's <b>verbatim</b> output — it derives nothing, signs nothing, and hides nothing. Type a plain-English goal, compose a spec, or pool a portfolio; the frozen core answers.</p>

<section id="door">
<div class="sec-head"><h2 class="prompt">Goal Console</h2><span class="hint">screen 8 — the one interactive door</span></div>
<div class="tool tool--door">
<div class="tool__head"><span class="tool__title">Ask in plain English</span><span class="tool__note">rate-limited &amp; input-capped exactly as the API</span></div>
<div class="tool__body">
<form class="form" method="post" action="/console/goal">
${ff("your goal", `<input class="field" name="goal" maxlength="${GOAL_MAX}" placeholder="Earn steady stablecoin lending carry with honest costs" value="${esc(consoleState?.goal ?? "")}">`, "f--grow")}
<button class="btn btn--primary" type="submit"><span class="btn__l">run goal</span><span class="btn__a">→</span></button>
</form>
${tscript(goalRender, "no result yet — type a goal and run it to see the engine's verdict")}
</div></div>
</section>

<section id="compose">
<div class="sec-head"><h2 class="prompt">Compose</h2><span class="hint">screen 9 — build the spec yourself; every composition hits the identical write-then-invoke gate</span></div>
<div class="tool">
<div class="tool__head"><span class="tool__title">Guided Builder — Lending</span><span class="tool__n">lending</span></div>
<div class="tool__body">
<form class="form" method="post" action="/builder/compose">
${CONSOLE_KEYS.map((k) => ff(esc(k.split(":").slice(1, 3).join(":")) + " weight", `<input class="field field--num" name="w_${esc(k)}" type="number" step="0.1" min="0" max="1" value="0">`)).join("")}
${ff("policy", `<select class="field" name="policy">${policyOpts}</select>`)}
<button class="btn btn--primary" type="submit"><span class="btn__l">compose + submit</span></button>
<span class="hintline">default policy: ${Builder.DEFAULTS.policy} (conservative)</span>
</form>
${tscript(lendingRender, "compose a weighting above to see the verdict + panels")}
</div></div>

<div class="tool">
<div class="tool__head"><span class="tool__title">Guided Builder — Funding &amp; Basis</span><span class="tool__n">funding · basis</span></div>
<div class="tool__body">
<form class="form" method="post" action="/builder/funding">
${ff("venue", `<select class="field" name="venue">${Builder.FUNDING_VENUES.map((v) => `<option${v === Builder.FUNDING_DEFAULTS.venue ? " selected" : ""}>${v}</option>`).join("")}</select>`)}
${ff("interval (h)", `<select class="field" name="interval">${Builder.FUNDING_INTERVALS.map((i) => `<option${i === Builder.FUNDING_DEFAULTS.intervalHours ? " selected" : ""}>${i}</option>`).join("")}</select>`)}
${ff("side", `<select class="field" name="side"><option selected>receive</option><option>pay</option></select>`)}
<button class="btn btn--primary" type="submit"><span class="btn__l">compose funding</span></button>
<span class="hintline">default side: ${Builder.FUNDING_DEFAULTS.side} (conservative) · ILLUSTRATIVE data, labeled</span>
</form>
<form class="form" method="post" action="/builder/basis">
${ff("CeFi leg", `<select class="field" name="cexVenue">${Builder.BASIS_CEX_VENUES.map((v) => `<option${v === Builder.BASIS_DEFAULTS.cexVenue ? " selected" : ""}>${v}</option>`).join("")}</select>`)}
${ff("DeFi leg", `<select class="field" name="dexVenue">${Builder.BASIS_DEX_VENUES.map((v) => `<option${v === Builder.BASIS_DEFAULTS.dexVenue ? " selected" : ""}>${v}</option>`).join("")}</select>`)}
<button class="btn btn--primary" type="submit"><span class="btn__l">compose basis</span></button>
<div class="warn">${esc(Builder.basisFormNote(builderState?.basisCex ?? Builder.BASIS_DEFAULTS.cexVenue, builderState?.basisDex ?? Builder.BASIS_DEFAULTS.dexVenue))}</div>
</form>
${tscript(builderState?.fundingBasisRender ?? "", "compose a funding-carry or cross-venue basis spec above")}
</div></div>
</section>

<section id="pool">
<div class="sec-head"><h2 class="prompt">Pool Composer</h2><span class="hint">screen 10 — pool a portfolio; the pool pays the union's K_eff bill</span></div>
<div class="tool">
<div class="tool__head"><span class="tool__title">Compose a depth-1 pool</span><span class="tool__n">pool</span></div>
<div class="tool__body">
<form class="form" method="post" action="/pool/compose">
${ff("members", `<select class="field" name="count"><option>3</option><option selected>5</option><option>8</option></select>`)}
${ff("regime", `<select class="field" name="regime"><option value="diversified" selected>diversified (low correlation)</option><option value="correlated">correlated (near-duplicate — see 'adds nothing')</option></select>`)}
<button class="btn btn--primary" type="submit"><span class="btn__l">compose pool + submit</span></button>
<span class="hintline">an over-correlated pool (K_eff≈1) renders "adds nothing" plainly — not refused</span>
</form>
${tscript(poolRender, "compose a pool above to see the K_eff charge, union family + stress caveat")}
</div></div>
</section>

<section id="state">
<div class="sec-head"><h2 class="prompt">System state</h2><span class="hint">read-only — the honest state renders, derived from nothing</span></div>
<div class="grid">
${panel("Trust Panel", wallsMeta, StudioScreens.trustPanel(ts), true)}
${panel("Leaderboard", lbChip, StudioScreens.leaderboard(board))}
${panel("Forward Clocks", "", ts.clocks.map((c) => "  " + c.render).join("\n"))}
${panel("Enrollments", `<span class="panel__meta">observed, never performing</span>`, enrollBody)}
${panel("Worked examples", `<span class="panel__meta">what an honest answer looks like</span>`, presetsBlock, true)}
</div>
</section>
</main>
<footer class="foot">A second party POSTs here: <code>POST /studio/submit_spec</code>, <code>POST /studio/enroll</code>${process.env.STUDIO_TOKEN ? " (Bearer credential required)" : ""}. Display-only; nothing signs.</footer>
<script>
document.querySelectorAll('form').forEach(function(f){f.addEventListener('submit',function(){var b=f.querySelector('button[type=submit]');if(b){b.setAttribute('disabled','');var l=b.querySelector('.btn__l');if(l)l.textContent='running…';}});});
</script>
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
