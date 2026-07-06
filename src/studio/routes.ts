/**
 * ORGΛNON STUDIO — LIVE ROUTES + MCP tool handlers (Phase 4; Rule S-CORE, surface edition at the wire). The six proven
 * surface functions, exposed as a mountable Hono sub-app (`.route("/studio", StudioRoutes(store))`) and as 1:1 MCP tool
 * handlers. The proof obligation is byte-identity THROUGH THE NETWORK: `get_verdict` over HTTP and over MCP equals the
 * direct function's reproHash on the same inputs (the network may not cost one byte — Rule VII). Thin transport only;
 * every adjudication path still goes register-then-invoke through the ledger (no route reaches the core directly).
 *
 * Convergence Phase 1 — the served surface is HARDENED (transport-layer only, the verdict path untouched): an honest
 * error envelope for every throw (never a raw stack), a malformed-JSON 400, a payload-size cap (413), an optional
 * Bearer credential on the mutating routes (opt-in via opts.token — off ⇒ open, so the in-process byte-identity tests
 * are unchanged), and a per-caller rate limit (429). None of this can soften a verdict: it gates the door, not the core.
 */
import { Hono } from "hono"
import { Ledger } from "../ledger/ledger"
import { Studio } from "./adjudicate"
import { StudioSurfaces } from "./surfaces"
import { Enroll } from "./enroll"
import { StudioErrors } from "./errors"

export namespace StudioRoutesNS {
  export interface HardenOpts {
    token?: string // when set, mutating routes require `Authorization: Bearer <token>` (off ⇒ open, for local/tests)
    rateLimit?: { max: number; windowMs: number } // per-caller cap on mutating routes
    maxBodyBytes?: number // payload-size cap (413 over)
    now?: () => number // injectable clock for the rate limiter (tests); defaults to Date.now
  }

  // a single shared ledger for a running server, backed by an append-only JSONL file (reproducible, tamper-evident)
  export function mountable(store: Ledger.Store, book?: Enroll.Book, opts: HardenOpts = {}) {
    const app = new Hono()
    const maxBytes = opts.maxBodyBytes ?? 65_536
    const rl = opts.rateLimit ?? { max: 240, windowMs: 60_000 }
    const now = opts.now ?? (() => Date.now())
    const hits = new Map<string, number[]>()

    // every uncaught throw becomes an honest JSON envelope — a client never sees a raw stack (fuzz-honest, S-HONEST-UX).
    // Each envelope carries the plain-language, two-sided error state from the catalog. A missing Python sidecar venv
    // (a fresh-clone setup gap the walk surfaced) is mapped to the actionable `sidecar-not-setup` state, not a generic
    // "internal" — the user gets the exact one-time setup command, never a raw ENOENT.
    app.onError((err, c) => {
      const detail = String(err && (err as Error).message ? (err as Error).message : err).slice(0, 200)
      if (detail.startsWith("bad-spec")) return c.json(StudioErrors.enrich("bad-spec", detail), 400) // W1-04: malformed spec rejected, never adjudicated
      const code = /\.venv\/bin\/python|posix_spawn.*python/.test(detail) ? "sidecar-not-setup" : "internal"
      return c.json(StudioErrors.enrich(code, detail), code === "sidecar-not-setup" ? 503 : 500)
    })

    // the guard applied to MUTATING routes: size cap → auth (if configured) → rate limit. Read-only routes stay open.
    const guard = async (c: any, next: any) => {
      const len = Number(c.req.header("content-length") ?? 0)
      if (len > maxBytes) return c.json(StudioErrors.enrich("payload-too-large", `body ${len}B exceeds cap ${maxBytes}B`), 413)
      if (opts.token && c.req.header("authorization") !== `Bearer ${opts.token}`) return c.json(StudioErrors.enrich("unauthorized"), 401)
      const who = c.req.header("x-forwarded-for") ?? "local"
      const t = now()
      const recent = (hits.get(who) ?? []).filter((x) => t - x < rl.windowMs)
      if (recent.length >= rl.max) return c.json(StudioErrors.enrich("rate-limited", `> ${rl.max} requests / ${rl.windowMs}ms`), 429)
      recent.push(t); hits.set(who, recent)
      await next()
    }
    app.use("/submit_spec", guard)
    app.use("/enroll", guard)

    // parse the body honestly: malformed JSON ⇒ 400 (not a crash); a downstream throw (e.g. LedgerBypassError) is left
    // to propagate to onError (500 envelope) — a bypass is a server refusal, not a client's malformed request.
    const parsed = async (c: any): Promise<{ ok: true; data: any } | { ok: false; res: Response }> => {
      try {
        return { ok: true, data: await c.req.json() }
      } catch {
        return { ok: false, res: c.json(StudioErrors.enrich("malformed-json"), 400) }
      }
    }

    if (book) {
      // the 7th surface — forward enrollment (byte-identity: route enrollmentId == direct Book.enroll)
      app.post("/enroll", async (c) => {
        const p = await parsed(c)
        if (!p.ok) return p.res
        return c.json(book.enroll(p.data as Parameters<Enroll.Book["enroll"]>[0]))
      })
      app.get("/enrollments", (c) => c.json(book.list()))
    }
    return app
      .post("/submit_spec", async (c) => {
        const p = await parsed(c)
        if (!p.ok) return p.res
        return c.json(await StudioSurfaces.submit_spec(store, p.data as Studio.SubmitInput))
      })
      .post("/get_verdict", async (c) => {
        const p = await parsed(c)
        if (!p.ok) return p.res
        const { spec, extras } = p.data as { spec: unknown; extras?: Studio.SubmitExtras }
        return c.json(await StudioSurfaces.get_verdict(store, spec, extras ?? {}))
      })
      .post("/preflight", async (c) => {
        const p = await parsed(c)
        if (!p.ok) return p.res
        const { panel, opts: o } = p.data as { panel: number[][]; opts?: Record<string, unknown> }
        return c.json(StudioSurfaces.preflight(panel, o ?? {}))
      })
      .post("/attest_claim", async (c) => {
        const p = await parsed(c)
        if (!p.ok) return p.res
        return c.json(await StudioSurfaces.attest_claim(p.data))
      })
      .get("/forward_status", (c) => {
        return c.json(StudioSurfaces.forward_status(Number(c.req.query("observed") ?? 0), Number(c.req.query("needed") ?? 0)))
      })
      // read-only ledger export (the walk's AUDITOR role: cross-check the leaderboard's counts against the ledger over
      // the wire — no off-repo access needed). Display-only; the chain is verifiable by the caller.
      .get("/export", (c) => {
        const chain = store.verifyChain()
        return c.json({ count: store.length, chainOk: chain.ok, entries: store.all() })
      })
      .post("/leaderboard", async (c) => {
        const p = await parsed(c)
        if (!p.ok) return p.res
        return c.json(StudioSurfaces.leaderboard(p.data as StudioSurfaces.Row[]))
      })
  }

  // ── the 1:1 MCP tool handlers (same functions; JSON-RPC transport). Each returns the SAME bytes its route returns. ──
  export interface McpTool {
    name: string
    description: string
    handler: (store: Ledger.Store, input: any) => Promise<unknown> | unknown
  }

  export const MCP_TOOLS: McpTool[] = [
    { name: "studio.submit_spec", description: "Register a proposal and adjudicate it (write-then-invoke).", handler: (s, i) => StudioSurfaces.submit_spec(s, i) },
    { name: "studio.get_verdict", description: "Re-derive a registered spec's verdict (byte-identical to the core).", handler: (s, i) => StudioSurfaces.get_verdict(s, i.spec, i.extras ?? {}) },
    { name: "studio.preflight", description: "Breadth/floor/reachability, report-only.", handler: (_s, i) => StudioSurfaces.preflight(i.panel, i.opts ?? {}) },
    { name: "studio.attest_claim", description: "Adjudicate an external claim; tier earned, never declared.", handler: (_s, i) => StudioSurfaces.attest_claim(i) },
    { name: "studio.forward_status", description: "The forward clock as a first-class state.", handler: (_s, i) => StudioSurfaces.forward_status(i.observed, i.needed, i.clock) },
    { name: "studio.leaderboard", description: "Tier-before-performance; empty-of-GO correct.", handler: (_s, i) => StudioSurfaces.leaderboard(i.rows) },
  ]
}
