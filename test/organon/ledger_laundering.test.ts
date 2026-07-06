/**
 * ORGΛNON STUDIO — the 25-ROUND LAUNDERING DEMONSTRATION (Phase 2; Rule S-FAMILY; the FAMILY-HONEST gate).
 *
 * The scenario the whole ledger exists to defeat: an author (agent/human) has ONE promising-looking backtest series R
 * and iterates the spec, resubmitting until the engine blesses it. WITHOUT the ledger, each resubmission is
 * un-counted, and eventually a spec clears an un-deflated bar → a manufactured GO. WITH the ledger, every resubmission
 * is a registered trial; the family size feeds the engine's deflation; and — because rigor.sr0_deflated is
 * monotonically increasing in n_trials — the bar gets HARDER with every round. Iteration cannot launder acceptance.
 *
 * This runs the REAL frozen rigor (rigor.py, via the untouched adjudicator). The numbers are deterministic (a seeded
 * series, a fixed pipeline). The gate: iteration must STIFFEN, never ease, the verdict.
 */
import { describe, test, expect } from "bun:test"
import { Ledger } from "../../src/ledger/ledger"
import { Studio } from "../../src/studio/adjudicate"

// The author's ONE promising backtest: a seeded Normal series (deterministic — no Date.now, no live randomness).
// drift=0.125, vol=0.90, N=260 (> the derived power floor of 225 for barsPerYear=365) lands in the regime where the
// series SURVIVES deflation at a search of 1 (DSR≈0.998 ≥ the 0.95 bar → CONDITIONAL) but FAILS once the true family
// of 25 is counted (DSR≈0.805 < 0.95 → NO-GO). The verdict FLIPS purely because the ledger counted the iteration.
function seededNormalSeries(seed: number, drift: number, vol: number, n: number): number[] {
  // a small deterministic Box–Muller PRNG (mulberry32) — the demo must be byte-reproducible without numpy in TS.
  let s = seed >>> 0
  const u = () => ((s = (s + 0x6d2b79f5) | 0), ((t) => ((t = Math.imul(t ^ (t >>> 15), t | 1)), (t ^= t + Math.imul(t ^ (t >>> 7), t | 61)), ((t ^ (t >>> 14)) >>> 0) / 4294967296))(s))
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const u1 = Math.max(u(), 1e-12), u2 = u()
    out.push(drift + vol * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2))
  }
  return out
}

const R = seededNormalSeries(1, 0.125, 0.9, 260)
const root = { family: "rwa-allocation", policy: "constrained-carry", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 0.5 }, { id: "b", weight: 0.5 }] }
const mut = (k: number) => ({ ...root, legs: [{ id: "a", weight: 0.5 + k * 0.01 }, { id: "b", weight: 0.5 - k * 0.01 }] })
const T = 1_700_000_000_000
const extras = { returns: R, barsPerYear: 365 as number }

describe("STUDIO — the 25-round laundering demo: iteration STIFFENS the bar (FAMILY-HONEST)", () => {
  test("round 1 (family=1): the promising series SURVIVES the deflation → CONDITIONAL", async () => {
    const store = new Ledger.Store()
    const v = await Studio.submit(store, { spec: root, authorClass: "agent", domain: "rwa", timestamp: T, ...extras })
    expect(v.familyDeclaredNTrials).toBe(1)
    expect(v.attestation.verdict).toBe("CONDITIONAL") // clears the bar at a search of one
  }, 30000)

  test("round 25 (family=25): the SAME series, now honestly deflated, is REFUSED → NO-GO", async () => {
    const store = new Ledger.Store()
    // round 1 — the author's first submission (family=1)
    const first = await Studio.submit(store, { spec: root, authorClass: "agent", domain: "rwa", timestamp: T, ...extras })
    const dsrAtFamily1 = first.attestation.dsrAtDeclared!
    // rounds 2..25 — the author iterates, each a registered trial in the same lineage (write-only; no need to adjudicate)
    let parent = 0
    for (let k = 1; k <= 24; k++) {
      const e = Studio.register(store, { spec: mut(k), authorClass: "agent", domain: "rwa", parentSeq: parent, timestamp: T + k })
      parent = e.seq
    }
    expect(store.familySize(Ledger.hashSpec(root))).toBe(25) // the ledger counted every trial

    // round 25 — the latest mutation, adjudicated with the TRUE family of 25 feeding the deflation
    const last = await Studio.adjudicateRegistered(store, mut(24), extras)
    expect(last.familyDeclaredNTrials).toBe(25)
    const dsrAtFamily25 = last.attestation.dsrAtDeclared!

    // THE GATE — iteration stiffened the bar, it did not ease it:
    expect(dsrAtFamily25).toBeLessThan(dsrAtFamily1) // deflation is strictly harder with more trials (monotone)
    expect(last.attestation.verdict).toBe("NO-GO") // the CONDITIONAL of round 1 is gone — iteration made it HARDER

    // and you cannot escape by going back: re-adjudicating the ORIGINAL spec now sees the whole family of 25.
    const revisitRoot = await Studio.adjudicateRegistered(store, root, extras)
    expect(revisitRoot.familyDeclaredNTrials).toBe(25)
    expect(revisitRoot.attestation.verdict).toBe("NO-GO") // the ledger remembers; there is no un-seeing the 25 trials
  }, 30000)
})
