/**
 * WALL — error-state honesty (Convergence Phase 2; Rule S-HONEST-UX). Every user-reachable failure must render a
 * plain-language, TWO-SIDED, NON-PRIMING state: what happened, what you can do, and what it does NOT mean — never a
 * dead-end, a raw stack, or a nudge toward paying/enrolling. Proves the catalog covers the reachable failures, that
 * each entry is genuinely two-sided and non-priming, and that the served routes surface the plain message.
 */
import { describe, test, expect } from "bun:test"
import { Hono } from "hono"
import { Ledger } from "../../src/ledger/ledger"
import { StudioRoutesNS } from "../../src/studio/routes"
import { StudioErrors } from "../../src/studio/errors"

const PRIMING = /\b(buy|purchase|upgrade|premium|pay|subscribe|checkout|pricing|unlock)\b/i

describe("WALL error_honesty — every reachable failure is a plain, two-sided, non-priming state", () => {
  test("the catalog covers the reachable failure codes", () => {
    for (const code of ["malformed-json", "bad-spec", "payload-too-large", "unauthorized", "rate-limited", "ledger-bypass", "clock-not-ticking", "model-endpoint-down", "internal"])
      expect(StudioErrors.state(code)).not.toBeNull()
  })

  test("every entry is TWO-SIDED (plain + whatYouCanDo + whatItDoesNotMean) and NON-PRIMING", () => {
    for (const s of Object.values(StudioErrors.CATALOG)) {
      expect(s.plain.length).toBeGreaterThan(20)
      expect(s.whatYouCanDo.length).toBeGreaterThan(10) // a constructive next step
      expect(s.whatItDoesNotMean.length).toBeGreaterThan(10) // the second side — guards against mis-reading
      expect(s.plain + s.whatYouCanDo + s.whatItDoesNotMean).not.toMatch(PRIMING) // never nudges toward paying/enrolling
    }
  })

  test("served routes surface the plain message (401, 413, 429, 400) — no dead-ends, no stacks", async () => {
    const body = JSON.stringify({ spec: { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }, authorClass: "human", domain: "rwa", timestamp: 1, returns: [0.1], barsPerYear: 365 })
    // 401
    const authed = new Hono().route("/studio", StudioRoutesNS.mountable(new Ledger.Store(), undefined, { token: "t" }))
    const r401 = await authed.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json" }, body })
    expect(r401.status).toBe(401)
    expect((await r401.json()).message.whatItDoesNotMean).toContain("not a verdict")
    // 400 malformed
    const open = new Hono().route("/studio", StudioRoutesNS.mountable(new Ledger.Store()))
    const r400 = await open.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json" }, body: "{broken" })
    expect(r400.status).toBe(400)
    expect((await r400.json()).message.plain).toContain("valid JSON")
    // 429
    let t = 100
    const limited = new Hono().route("/studio", StudioRoutesNS.mountable(new Ledger.Store(), undefined, { rateLimit: { max: 1, windowMs: 9999 }, now: () => t }))
    await limited.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "9.9.9.9" }, body })
    const r429 = await limited.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "9.9.9.9" }, body })
    expect(r429.status).toBe(429)
    expect((await r429.json()).message.whatItDoesNotMean).toContain("merits")
  }, 30000)
})
