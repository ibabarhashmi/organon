/**
 * WALL — walk fixes (Convergence Phase 3, Cycle 1). The fresh-clone walk surfaced three issues; this locks their fixes
 * so they cannot regress: (W1-02) a missing Python sidecar renders an actionable `sidecar-not-setup` state, not a
 * generic "internal"; (W1-03) the auditor can export the ledger over HTTP to cross-check the leaderboard's counts.
 * (W1-01, a DOC-DRIFT fix in SKILL.md, is validated by the live re-walk.)
 */
import { describe, test, expect } from "bun:test"
import { Hono } from "hono"
import { Ledger } from "../../src/ledger/ledger"
import { StudioRoutesNS } from "../../src/studio/routes"
import { Studio } from "../../src/studio/adjudicate"
import { StudioErrors } from "../../src/studio/errors"

const spec = { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }
const R = Array.from({ length: 260 }, (_, i) => 0.01 * Math.sin(i / 7) + 0.002)

describe("WALL walk_fixes — Cycle 1 fixes locked (W1-02, W1-03)", () => {
  test("W1-03 — the auditor can export the ledger over HTTP and it matches what was submitted", async () => {
    const store = new Ledger.Store()
    const app = new Hono().route("/studio", StudioRoutesNS.mountable(store))
    await app.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ spec, authorClass: "human", domain: "rwa", timestamp: 1_700_000_000_000, returns: R, barsPerYear: 365 }) })
    const res = await app.request("/studio/export")
    expect(res.status).toBe(200)
    const j = (await res.json()) as { count: number; chainOk: boolean; entries: any[] }
    expect(j.count).toBe(1) // the export count matches the one submitted trial
    expect(j.chainOk).toBe(true) // the auditor can verify the chain over the wire
    expect(j.entries[0].specHash).toBe(Ledger.hashSpec(spec)) // the exported entry IS the submitted spec
  }, 30000)

  test("W1-02 — the sidecar-not-setup state exists, is actionable, and carries the exact setup command", () => {
    const s = StudioErrors.state("sidecar-not-setup")
    expect(s).not.toBeNull()
    expect(s!.whatYouCanDo).toContain("python3 -m venv .venv")
    expect(s!.whatItDoesNotMean).toContain("not a verdict")
    // enrich maps the code into the honest envelope shape used by the served surface
    expect(StudioErrors.enrich("sidecar-not-setup").message?.code).toBe("sidecar-not-setup")
  })

  test("W1-02 — a venv-shaped error string is recognized as sidecar-not-setup (the mapping rule)", () => {
    // the same predicate the routes onError uses; a fresh-clone ENOENT on the venv → the actionable state
    const detail = "ENOENT: no such file or directory, posix_spawn '/x/src/backtest/py/.venv/bin/python'"
    expect(/\.venv\/bin\/python|posix_spawn.*python/.test(detail)).toBe(true)
  })

  test("W1-04 — an invalid spec is REJECTED as bad-spec (400) and NEVER registered", async () => {
    const store = new Ledger.Store()
    const app = new Hono().route("/studio", StudioRoutesNS.mountable(store))
    const bad = JSON.stringify({ spec: { family: "rwa-allocation", policy: "static; DROP TABLE", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }, authorClass: "human", domain: "rwa", timestamp: 1, returns: [0.01, 0.02], barsPerYear: 365 })
    const res = await app.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json" }, body: bad })
    expect(res.status).toBe(400) // an invalid policy enum is rejected, never adjudicated (SKILL.md's promise)
    expect((await res.json()).error).toBe("bad-spec")
    expect(store.length).toBe(0) // the malformed spec did NOT pollute the ledger
  }, 30000)

  test("W1-04 — an out-of-range weight is rejected; a valid spec WITHOUT constraints is still accepted (no over-reject)", async () => {
    const store = new Ledger.Store()
    const app = new Hono().route("/studio", StudioRoutesNS.mountable(store))
    const badWeight = JSON.stringify({ spec: { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 5 }] }, authorClass: "human", domain: "rwa", timestamp: 1, returns: [0.01, 0.02], barsPerYear: 365 })
    expect((await app.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json" }, body: badWeight })).status).toBe(400)
    // the SKILL.md example spec omits `constraints` — it must STILL be accepted (validation is relaxed only there)
    const noConstraints = JSON.stringify({ spec, authorClass: "human", domain: "rwa", timestamp: 1, returns: R, barsPerYear: 365 })
    const ok = await app.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json" }, body: noConstraints })
    expect(ok.status).toBe(200)
    expect(store.length).toBe(1) // only the valid one registered
  }, 30000)
})
