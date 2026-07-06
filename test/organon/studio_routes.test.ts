/**
 * ORGΛNON STUDIO — LIVE ROUTES + MCP byte-identity battery (Phase 4; SURFACE-LIVE gate). Proves, over REAL in-process
 * HTTP (a Request routed through Hono, a Response parsed back) and over the MCP tool handlers, that a verdict is
 * BYTE-IDENTICAL to the direct function's (same reproHash) — the network may not cost one byte (Rule VII). Also:
 * concurrency-safe (two simultaneous submits → both registered, chain intact) and idempotent (same spec → one trial),
 * and no route reaches adjudication without the ledger.
 */
import { describe, test, expect } from "bun:test"
import { Hono } from "hono"
import { Ledger } from "../../src/ledger/ledger"
import { Studio } from "../../src/studio/adjudicate"
import { StudioRoutesNS } from "../../src/studio/routes"

const spec = { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }
const R = Array.from({ length: 260 }, (_, i) => 0.01 * Math.sin(i / 7) + 0.002)
const T = 1_700_000_000_000
const app = (store: Ledger.Store) => new Hono().route("/studio", StudioRoutesNS.mountable(store))

describe("STUDIO routes — verdict byte-identical over the network (SURFACE-LIVE, Rule VII)", () => {
  test("function ≡ HTTP: get_verdict over real HTTP equals the direct function's reproHash", async () => {
    // direct
    const s1 = new Ledger.Store()
    const direct = await Studio.submit(s1, { spec, authorClass: "human", domain: "rwa", timestamp: T, returns: R, barsPerYear: 365 })
    // over HTTP
    const s2 = new Ledger.Store()
    const res = await app(s2).request("/studio/submit_spec", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ spec, authorClass: "human", domain: "rwa", timestamp: T, returns: R, barsPerYear: 365 }),
    })
    expect(res.status).toBe(200)
    const httpVerdict = (await res.json()) as Studio.StudioVerdict
    expect(httpVerdict.attestation.reproHash).toBe(direct.attestation.reproHash) // the wire cost zero bytes
  }, 30000)

  test("function ≡ MCP: the submit_spec MCP tool handler equals the direct function's reproHash", async () => {
    const tool = StudioRoutesNS.MCP_TOOLS.find((t) => t.name === "studio.submit_spec")!
    const s1 = new Ledger.Store(); const s2 = new Ledger.Store()
    const direct = await Studio.submit(s1, { spec, authorClass: "human", domain: "rwa", timestamp: T, returns: R, barsPerYear: 365 })
    const viaMcp = (await tool.handler(s2, { spec, authorClass: "human", domain: "rwa", timestamp: T, returns: R, barsPerYear: 365 })) as Studio.StudioVerdict
    expect(viaMcp.attestation.reproHash).toBe(direct.attestation.reproHash)
  }, 30000)

  test("concurrency: two simultaneous submits → both registered, chain intact, no lost trials", async () => {
    const store = new Ledger.Store()
    const a = app(store)
    const body = (policy: string) => JSON.stringify({ spec: { ...spec, policy }, authorClass: "agent", domain: "rwa", timestamp: T, returns: R, barsPerYear: 365 })
    const [r1, r2] = await Promise.all([
      a.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json" }, body: body("static") }),
      a.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json" }, body: body("barbell") }),
    ])
    expect(r1.status).toBe(200); expect(r2.status).toBe(200)
    expect(store.length).toBe(2) // both distinct specs registered
    expect(store.verifyChain().ok).toBe(true) // the hash chain survived concurrent appends
  }, 30000)

  test("idempotency: the same spec submitted twice is ONE trial (spec-hash dedupe over the wire)", async () => {
    const store = new Ledger.Store()
    const a = app(store)
    const body = JSON.stringify({ spec, authorClass: "human", domain: "rwa", timestamp: T, returns: R, barsPerYear: 365 })
    await a.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json" }, body })
    await a.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json" }, body })
    expect(store.length).toBe(1) // the replay did not create a second trial
  }, 30000)

  test("get_verdict over HTTP for an UNREGISTERED spec is refused (no ledger-skipping path at the wire)", async () => {
    const res = await app(new Ledger.Store()).request("/studio/get_verdict", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ spec, extras: {} }),
    })
    expect(res.status).toBeGreaterThanOrEqual(500) // the LedgerBypassError propagates as an error, not a verdict
  }, 30000)
})
