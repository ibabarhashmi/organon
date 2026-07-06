/**
 * ORGΛNON STUDIO — the RE-ROOTING (fragmentation) demonstration (Phase 3; Rules H-SCOPE, S-FAMILY; the
 * FAMILY-UNFRAGMENTED gate). The audit's one substantive crack: the within-lineage ledger stiffens ITERATION, but a
 * determined optimizer evades it by RE-ROOTING — submitting N structurally-distinct specs, each a fresh family of one,
 * each passing the structural-evasion check. Fix: author×domain root-counting feeds the SAME `declaredNTrials` seam —
 * so architecture search deflates exactly like parameter search, with ZERO core bytes changed.
 *
 * This runs the REAL frozen rigor. The gate: re-rooting stiffens the bar (25 distinct roots face a rising n), and the
 * ledger remembers across roots (re-adjudicating root 1 after the spree is deflated by the accumulated count).
 */
import { describe, test, expect } from "bun:test"
import { Ledger } from "../../src/ledger/ledger"
import { Studio } from "../../src/studio/adjudicate"

// the SAME promising series as the within-family demo — held fixed so the ONLY variable is how many roots are counted.
function seededNormalSeries(seed: number, drift: number, vol: number, n: number): number[] {
  let s = seed >>> 0
  const u = () => ((s = (s + 0x6d2b79f5) | 0), ((t) => ((t = Math.imul(t ^ (t >>> 15), t | 1)), (t ^= t + Math.imul(t ^ (t >>> 7), t | 61)), ((t ^ (t >>> 14)) >>> 0) / 4294967296))(s))
  const out: number[] = []
  for (let i = 0; i < n; i++) { const u1 = Math.max(u(), 1e-12), u2 = u(); out.push(drift + vol * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)) }
  return out
}
const R = seededNormalSeries(1, 0.125, 0.9, 260)
const extras = { returns: R, barsPerYear: 365 }
const T = 1_700_000_000_000

// 25 STRUCTURALLY DISTINCT roots (different policy/trigger/leg skeletons) — each would pass the structural-evasion
// check as a genuinely new architecture. This is the re-rooting attack the within-family ledger could not see.
const policies = ["static", "yield-rotation", "constrained-carry", "barbell", "peg-defensive"]
const triggers = ["monthly", "quarterly", "drift"]
function distinctRoot(k: number) {
  return {
    family: "rwa-allocation",
    policy: policies[k % policies.length],
    rebalance: { trigger: triggers[k % triggers.length] },
    legs: Array.from({ length: 1 + (k % 3) }, (_, i) => ({ id: `leg${k}_${i}`, weight: 1 / (1 + (k % 3)) })),
  }
}

describe("STUDIO — re-rooting stiffens the bar via author×domain root-counting (FAMILY-UNFRAGMENTED)", () => {
  test("25 distinct roots by ONE author each pass structural evasion, yet face a RISING deflation bar", async () => {
    const store = new Ledger.Store()
    const author = "opt-1" // one identity, 25 architectures

    // root 1 — a single architecture, single root → deflated at n=1 → survives (CONDITIONAL)
    const r1 = await Studio.submit(store, { spec: distinctRoot(0), authorClass: "agent", authorId: author, domain: "rwa", timestamp: T, ...extras })
    expect(r1.rootCount).toBe(1)
    expect(r1.attestation.verdict).toBe("CONDITIONAL")
    const dsr1 = r1.attestation.dsrAtDeclared!

    // roots 2..24 — the optimizer keeps trying fresh architectures (register-only; each is a distinct new root)
    for (let k = 1; k <= 23; k++) Studio.register(store, { spec: distinctRoot(k), authorClass: "agent", authorId: author, domain: "rwa", parentSeq: null, timestamp: T + k })
    expect(store.rootCount(author, "rwa")).toBe(24)

    // root 25 — the same-strength series, now deflated by the author's 25 counted roots → REFUSED (NO-GO)
    const r25 = await Studio.submit(store, { spec: distinctRoot(24), authorClass: "agent", authorId: author, domain: "rwa", parentSeq: null, timestamp: T + 24, ...extras })
    expect(r25.rootCount).toBe(25)
    expect(r25.familyDeclaredNTrials).toBe(25) // re-rooting is counted exactly like iterating
    expect(r25.attestation.dsrAtDeclared!).toBeLessThan(dsr1) // the bar rose
    expect(r25.attestation.verdict).toBe("NO-GO") // architecture search deflated like parameter search

    // cross-root MEMORY: re-adjudicating ROOT 1 after the spree is now deflated by the accumulated 25 → also NO-GO.
    const revisit = await Studio.adjudicateRegistered(store, distinctRoot(0), extras)
    expect(revisit.familyDeclaredNTrials).toBe(25)
    expect(revisit.attestation.verdict).toBe("NO-GO") // the ledger remembers across roots; you cannot escape by going back
  }, 30000)

  test("mixed strategy (12 within-family mutations + 13 re-roots) — max() never drops below either dimension", () => {
    const store = new Ledger.Store()
    const author = "opt-2"
    // 13 distinct roots
    for (let k = 0; k < 13; k++) Studio.register(store, { spec: distinctRoot(k), authorClass: "agent", authorId: author, domain: "rwa", parentSeq: null, timestamp: T + k })
    // 12 within-family mutations off root 0
    const rootSpec = distinctRoot(0)
    let parent = 0
    for (let m = 1; m <= 12; m++) {
      const mutSpec = { ...rootSpec, legs: [{ id: "m", weight: 0.5 + m * 0.01 }, { id: "n", weight: 0.5 - m * 0.01 }] }
      parent = Studio.register(store, { spec: mutSpec, authorClass: "agent", authorId: author, domain: "rwa", parentSeq: parent, timestamp: T + 100 + m }).seq
    }
    expect(store.rootCount(author, "rwa")).toBe(13) // architecture dimension
    expect(store.familySize(Ledger.hashSpec(rootSpec))).toBe(13) // root0's family = root0 + 12 mutations
    // the honest n is max(13 family, 13 roots) = 13 — never below either search dimension
    expect(Math.max(store.familySize(Ledger.hashSpec(rootSpec)), store.rootCount(author, "rwa"))).toBe(13)
  })

  test("SYBIL RESIDUAL (named, not hidden) — a FRESH authorId resets the root count", () => {
    const store = new Ledger.Store()
    for (let k = 0; k < 10; k++) Studio.register(store, { spec: distinctRoot(k), authorClass: "external", authorId: "sybil-A", domain: "rwa", parentSeq: null, timestamp: T + k })
    expect(store.rootCount("sybil-A", "rwa")).toBe(10)
    // a fresh key mints a fresh identity (and a fresh architecture) → count resets to 1. This is the documented,
    // mitigated residual (H-SCOPE): key-scoped identity + registration friction + rate limits raise its cost; full
    // sybil economics is future work. (Global spec-hash dedup also means a sybil cannot re-claim another id's spec.)
    const fresh = Studio.register(store, { spec: distinctRoot(99), authorClass: "external", authorId: "sybil-B", domain: "rwa", parentSeq: null, timestamp: T + 100 })
    expect(store.rootCount("sybil-B", "rwa")).toBe(1)
    expect(fresh.authorId).toBe("sybil-B") // the residual is visible in the record, on the leaderboard, and in SKILL.md
  })
})
