/**
 * WALL — served-persistence / first-contact survival (Transplant Phase 2; W3-01, Rule T-SERVE). V6 PARKED W3-01
 * ("served submits in RAM"); this sprint made the DECISION (persist — see docs/SERVED-PERSISTENCE-MEMO.md) and this
 * wall proves it: a submission through the durable store's `mountableStore()` view SURVIVES a restart (reopen from the
 * same file) with the chain intact — so a genuine second party's first contact can no longer evaporate before
 * DOORS-OPEN. The POSITIVE CONTROL shows the OLD wiring (`durable.store`, the non-persisting inner register) would NOT
 * survive — the exact W3-01 bug, now impossible to reintroduce silently. Bounded abuse: the per-author root quota
 * refuses registration friction; the sybil residual (a fresh authorId resets it) is asserted as NAMED, not eliminated.
 */
import { describe, test, expect } from "bun:test"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { Durable } from "../../src/studio/durable"
import { StudioSurfaces } from "../../src/studio/surfaces"
import { Ledger } from "../../src/ledger/ledger"

const spec = { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }
const R = Array.from({ length: 260 }, (_, i) => 0.01 * Math.sin(i / 7) + 0.002)
const sub = (s: unknown) => ({ spec: s, authorClass: "human" as const, domain: "rwa", timestamp: 1_700_000_000_000, returns: R, barsPerYear: 365 })
const file = () => path.join(mkdtempSync(path.join(tmpdir(), "served-persist-")), "served-submissions.jsonl")

describe("WALL served_persistence — first contact survives a restart (T-SERVE / W3-01)", () => {
  test("a submission through mountableStore() SURVIVES a restart with the chain intact", async () => {
    const f = file()
    const s1 = Durable.DurableStore.open(f, { epochLabel: "2026-07-04" })
    await StudioSurfaces.submit_spec(s1.mountableStore(), sub(spec))
    expect(s1.length).toBe(1)
    const head = s1.latestHash()
    // "restart": a brand-new process reopens the SAME file
    const s2 = Durable.DurableStore.open(f, { epochLabel: "2026-07-04" })
    expect(s2.length).toBe(1) // first contact survived the restart
    expect(s2.verifyChain().ok).toBe(true) // the chain reloaded intact
    expect(s2.latestHash()).toBe(head) // the anchored head matches — no rollback, no loss
  }, 30000)

  test("POSITIVE CONTROL — the OLD wiring (durable.store, non-persisting register) does NOT survive (the W3-01 bug)", () => {
    const f = file()
    const s1 = Durable.DurableStore.open(f, { epochLabel: "2026-07-04" })
    s1.store.register(sub(spec)) // the inner (in-memory) register — what serve-studio used to mount (W3-01)
    expect(s1.store.length).toBe(1) // present in RAM…
    const s2 = Durable.DurableStore.open(f, { epochLabel: "2026-07-04" }) // …but a restart reopens an EMPTY file
    expect(s2.length).toBe(0) // first contact EVAPORATED — the exact bug the decision fixed
  })

  test("bounded abuse — the per-author root quota refuses friction; the sybil residual is NAMED not eliminated", async () => {
    const f = file()
    const s = Durable.DurableStore.open(f, { epochLabel: "2026-07-04" })
    const store = s.mountableStore({ maxRootsPerAuthorDomain: 2 })
    // same author, three DISTINCT roots → the 3rd is refused (registration friction)
    store.register({ spec: { ...spec, legs: [{ id: "x", weight: 1 }] }, authorClass: "human", authorId: "alice", domain: "rwa", timestamp: 1 })
    store.register({ spec: { ...spec, legs: [{ id: "y", weight: 1 }] }, authorClass: "human", authorId: "alice", domain: "rwa", timestamp: 2 })
    expect(() => store.register({ spec: { ...spec, legs: [{ id: "z", weight: 1 }] }, authorClass: "human", authorId: "alice", domain: "rwa", timestamp: 3 })).toThrow(/served quota/)
    // the SYBIL residual, NAMED: a fresh authorId resets the quota (mitigated by authn+rate-limits, never eliminated)
    const before = s.length
    store.register({ spec: { ...spec, legs: [{ id: "z", weight: 1 }] }, authorClass: "human", authorId: "mallory", domain: "rwa", timestamp: 4 })
    expect(s.length).toBe(before + 1) // the residual is real and disclosed — not hidden behind a false "solved"
  })
})
