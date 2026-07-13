/**
 * ORGΛNON — THE CADENCE SPRINT wall S79 (THE FACT ENVELOPE). The single serialization every future consumer reads, shaped so
 * the honest thing is the only serializable thing: canonical (deterministic ×2), `authored:false` structural with NO path to
 * set it true, the disclaimer + kill-criterion hash travel with every fact, and a seeded ranking/weight/allocation FAILS to
 * serialize. Pinned empty of a caller today (like the trials schema was) — the seam V34's Socket re-shapes nothing.
 */
import { test, expect } from "bun:test"
import { FactEnvelope } from "../../src/strategy/envelope"

const prov = { tier: "SAMPLE", contentHash: null, capturedAt: null, source: null }
const mk = (fact: unknown) => FactEnvelope.wrap({ fact, verdict: "SOLID", provenance: prov, subject: { kind: "pool" as const, key: "defillama:pool:x" } })

test("S79 — canonical serialization is DETERMINISTIC ×2 (byte-identical on repeat, stable regardless of key order)", () => {
  const a = FactEnvelope.canonical({ b: 1, a: 2, nested: { z: 1, y: 2 } })
  const b = FactEnvelope.canonical({ nested: { y: 2, z: 1 }, a: 2, b: 1 })
  expect(a).toBe(b) // key order does not matter — canonical
  expect(FactEnvelope.canonical({ a: 2, b: 1 })).toBe(FactEnvelope.canonical({ a: 2, b: 1 })) // deterministic ×2
})

test("S79 — `authored` is structurally false, and an envelope with authored !== false REFUSES to serialize (the X-MANIFEST wall, extended)", () => {
  const env = mk({ peg: 0.999 })
  expect(env.authored).toBe(false)
  const r = FactEnvelope.serialize(env)
  expect(r.ok).toBe(true)
  expect(r.ok && r.json.includes('"authored":false')).toBe(true)
  // there is no constructor argument that sets authored true; a hand-tampered envelope is refused at serialize
  const tampered = { ...env, authored: true as unknown as false }
  expect(FactEnvelope.serialize(tampered).ok).toBe(false)
})

test("S79 — the disclaimer + kill-criterion hash travel with EVERY fact; a bad kill-criterion is refused", () => {
  const env = mk({ apyBase: 0.04 })
  expect(env.killCriterion).toBe("8b4e094b")
  expect(env.disclaimer).toBe(FactEnvelope.DISCLAIMER)
  const r = FactEnvelope.serialize(env)
  expect(r.ok && r.json.includes("8b4e094b")).toBe(true)
  expect(FactEnvelope.serialize({ ...env, killCriterion: "deadbeef" as "8b4e094b" }).ok).toBe(false)
})

test("S79 — a seeded ranking/weight/allocation field FAILS to serialize (no ORGΛNON fact can carry an authored recommendation)", () => {
  for (const bad of [{ "suggested allocation": "60% USDC" }, { rebalance: "into DAI" }, { rankings: ["a", "b"] }, { "consider instead": "aave" }, { "optimal weight": 0.6 }]) {
    const r = FactEnvelope.serialize(mk(bad))
    expect(r.ok).toBe(false)
  }
  // a plain, honest fact serializes fine
  expect(FactEnvelope.serialize(mk({ peg: 0.999, tvlDrawdown: 0.1 })).ok).toBe(true)
})

test("S79 — a disclaimer that is advice-shaped is refused (a fact's disclaimer must pass the advice wall)", () => {
  const env = { ...mk({ peg: 1 }), disclaimer: "you should buy this now" }
  expect(FactEnvelope.serialize(env).ok).toBe(false)
})
