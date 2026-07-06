/**
 * WALL — rejection-boundary fuzz (Transplant Phase 2; Rule T-REJECT). V6's Phase-1 fuzz PASSED while W1-04 existed,
 * because it asserted *honest failure* (no crashes, no stack leaks) and never asserted *correct refusal*. This wall
 * closes that category error: a MUST-REJECT corpus (invalid enums incl. the W1-04 payload VERBATIM, hostile weights,
 * malformed/orphaned lineage, oversize legs, boundary abuse) must be refused BEFORE registration — the ledger's count
 * is UNCHANGED, which is the assertion — on every mutating surface (submit_spec direct, submit_spec over HTTP, the raw
 * ledger register). A MUST-ACCEPT corpus (the golden specs + presets, with and without constraints) must STILL pass, so
 * the boundary cannot be "fixed" by over-tightening. W1-04's class — wrongful acceptance behind a clean envelope —
 * becomes mechanically impossible to reintroduce unnoticed.
 */
import { describe, test, expect } from "bun:test"
import { Hono } from "hono"
import { Ledger } from "../../src/ledger/ledger"
import { StudioRoutesNS } from "../../src/studio/routes"
import { StudioSurfaces } from "../../src/studio/surfaces"

const R = Array.from({ length: 260 }, (_, i) => 0.01 * Math.sin(i / 7) + 0.002)
const base = { authorClass: "human" as const, domain: "rwa", timestamp: 1_700_000_000_000, returns: R, barsPerYear: 365 }

// ── the MUST-REJECT corpus: each spec is hostile in a distinct way; each must be refused BEFORE registration ──
const MUST_REJECT: { name: string; spec: unknown }[] = [
  { name: "W1-04 payload VERBATIM (bad policy enum w/ injection)", spec: { family: "rwa-allocation", policy: "static; DROP TABLE", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] } },
  { name: "unknown policy enum", spec: { family: "rwa-allocation", policy: "definitely-not-a-policy", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] } },
  { name: "wrong family literal", spec: { family: "not-rwa", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] } },
  { name: "bad rebalance trigger", spec: { family: "rwa-allocation", policy: "static", rebalance: { trigger: "hourly" }, legs: [{ id: "a", weight: 1 }] } },
  { name: "hostile weight > 1", spec: { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 5 }] } },
  { name: "hostile weight < 0", spec: { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: -1 }] } },
  { name: "NaN weight", spec: { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: Number.NaN }] } },
  { name: "empty legs", spec: { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [] } },
  { name: "oversize legs (1000)", spec: { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: Array.from({ length: 1000 }, (_, i) => ({ id: `l${i}`, weight: 0.001 })) } },
  { name: "missing policy", spec: { family: "rwa-allocation", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] } },
  { name: "missing rebalance", spec: { family: "rwa-allocation", policy: "static", legs: [{ id: "a", weight: 1 }] } },
  { name: "leg id not a string", spec: { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: 42, weight: 1 }] } },
  { name: "null spec", spec: null },
  { name: "array spec", spec: [1, 2, 3] },
]

// ── the MUST-ACCEPT corpus: valid specs that must STILL pass (guards against over-tightening) ──
const MUST_ACCEPT: { name: string; spec: unknown }[] = [
  { name: "golden (with constraints)", spec: { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 0.6 }, { id: "b", weight: 0.4 }], constraints: { maxWeightPerLeg: 0.7 } } },
  { name: "golden (no constraints — the SKILL.md example)", spec: { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] } },
  { name: "yield-rotation preset", spec: { family: "rwa-allocation", policy: "yield-rotation", rebalance: { trigger: "quarterly" }, legs: [{ id: "x", weight: 0.5 }, { id: "y", weight: 0.5 }] } },
  { name: "barbell w/ drift", spec: { family: "rwa-allocation", policy: "barbell", rebalance: { trigger: "drift", driftBps: 50 }, legs: [{ id: "s", weight: 0.9 }, { id: "l", weight: 0.1 }] } },
  { name: "single full-weight leg (boundary 1.0)", spec: { family: "rwa-allocation", policy: "constrained-carry", rebalance: { trigger: "monthly" }, legs: [{ id: "solo", weight: 1 }] } },
  { name: "zero-weight leg (boundary 0.0)", spec: { family: "rwa-allocation", policy: "peg-defensive", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 0 }, { id: "b", weight: 1 }] } },
]

describe("WALL rejection_boundary — refusal asserted BEFORE registration (T-REJECT)", () => {
  test("MUST-REJECT — submit_spec (direct) refuses every hostile spec; the ledger count NEVER moves", async () => {
    for (const { name, spec } of MUST_REJECT) {
      const store = new Ledger.Store()
      let threw = false
      try { await StudioSurfaces.submit_spec(store, { spec, ...base }) } catch (e) { threw = true; expect(e).toBeInstanceOf(StudioSurfaces.SpecInvalidError) }
      expect(threw).toBe(true) // refused
      expect(store.length).toBe(0) // refusal BEFORE registration — the ledger never saw it (the assertion)
    }
  })

  test("MUST-REJECT — over HTTP, every hostile spec is 400 bad-spec; the ledger count NEVER moves", async () => {
    for (const { spec } of MUST_REJECT) {
      const store = new Ledger.Store()
      const app = new Hono().route("/studio", StudioRoutesNS.mountable(store))
      const res = await app.request("/studio/submit_spec", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ spec, ...base }) })
      expect(res.status).toBe(400)
      expect((await res.json()).error).toBe("bad-spec")
      expect(store.length).toBe(0) // never registered
    }
  }, 30000)

  test("MUST-ACCEPT — every valid spec still passes (no over-tightening) and registers exactly one trial", async () => {
    for (const { name, spec } of MUST_ACCEPT) {
      const store = new Ledger.Store()
      const v = await StudioSurfaces.submit_spec(store, { spec, ...base })
      expect(v).toBeDefined()
      expect(store.length).toBe(1) // the valid spec registered exactly once
    }
  }, 30000)

  test("MUST-REJECT — the raw ledger refuses malformed/orphaned lineage before it appends", () => {
    const store = new Ledger.Store()
    const spec = { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }
    store.register({ spec, authorClass: "human", domain: "rwa", timestamp: 1 })
    // a parent that does not exist ⇒ refused
    expect(() => store.register({ spec: { ...spec, policy: "barbell" }, authorClass: "human", domain: "rwa", timestamp: 2, parentSeq: 99 })).toThrow()
    // an orphan structurally colliding with an existing family (lineage evasion) ⇒ refused
    expect(() => store.register({ spec: { ...spec, legs: [{ id: "a", weight: 0.9 }] }, authorClass: "human", domain: "rwa", timestamp: 3 })).toThrow(Ledger.LineageEvasionError)
    expect(store.length).toBe(1) // neither malformed attempt appended
  })

  test("POSITIVE CONTROL — the W1-04 payload verbatim is refused (the exact regression made mechanically impossible)", async () => {
    const store = new Ledger.Store()
    const w104 = { family: "rwa-allocation", policy: "static; DROP TABLE", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }
    await expect(StudioSurfaces.submit_spec(store, { spec: w104, ...base })).rejects.toThrow(/bad-spec/)
    expect(store.length).toBe(0)
  })
})
