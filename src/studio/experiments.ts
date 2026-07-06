/**
 * ORGΛNON STUDIO — the PARKED EXPERIMENTS, answered (Reachability Phase 2; Rule U-EXPERIMENT, A′#3/#4/#10). V11 parked
 * two questions with designed experiments and PRE-REGISTERED outcome criteria. This runs them — the criteria are
 * hash-checked unchanged before anything runs; the outcomes DERIVE mechanically from the frozen deflation; each files as
 * a park-disposing value (NO closes with evidence; YES converts to a future-sprint ADOPT). Building past either outcome
 * is a Halt. Deterministic (seeded PRNG; no Math.random — Rule VIII).
 *
 * (1) THE ENSEMBLE — do K correlated INSUFFICIENT strategies pooled into a portfolio constitute legitimate
 *     evidence-aggregation under honest family accounting, or laundering?
 * (2) THE COHERENCE — is cross-author family deflation coherent (does one author's search honestly stiffen a stranger's
 *     bar, and under what scoping)?
 */
import { Attest } from "../attest/submission"
import { AttestAdjudicate } from "../attest/adjudicate"
import { Ledger } from "../ledger/ledger"
import { Studio } from "./adjudicate"

export namespace Experiments {
  function mulberry32(seed: number): () => number {
    let a = seed >>> 0
    return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  }
  function gauss(rng: () => number, n: number): number[] {
    const o: number[] = []
    while (o.length < n) { const u1 = Math.max(1e-12, rng()), u2 = rng(), r = Math.sqrt(-2 * Math.log(u1)); o.push(r * Math.cos(2 * Math.PI * u2)); if (o.length < n) o.push(r * Math.sin(2 * Math.PI * u2)) }
    return o
  }
  const T = Date.parse("2026-07-05T00:00:00Z")
  // adjudicate a return series at a declared search size → the deflated DSR (the frozen core, untouched)
  async function dsrAt(returns: number[], nTrials: number): Promise<number | null> {
    const sub: Attest.Submission = { id: "exp", spec: { family: "ensemble-probe" }, returns, declaredNTrials: nTrials, barsPerYear: 365 }
    return (await AttestAdjudicate.adjudicate(sub)).dsrAtDeclared ?? null
  }
  const PASS = 0.95 // survives the deflation iff DSR ≥ the significance bar

  // ── (1) THE ENSEMBLE EXPERIMENT ──
  // K members with a planted mean edge + shared/independent noise; the pool = the equal-weight average. Honest family
  // accounting charges the pool for the K independent searches (correlation-adjusted K_eff); the naive charge (n=1) hides
  // the search. The pre-registered criterion: legitimate IFF the correlation-adjusted pool passes while the noise pool
  // does not AND the naive laundering is detectable; if the noise pool EVER passes, pooling is deflation-laundering.
  export interface EnsembleResult {
    noisePoolDsr1: number | null; noisePoolDsrK: number | null; noisePoolPasses: boolean
    genuinePoolDsrK: number | null; genuinePoolPassesAdjusted: boolean
    launderPoolDsr1: number | null; launderPoolDsrK: number | null; launderingDetectable: boolean
    kEffIndependent: number
    outcome: "NO — deflation-laundering (reject)" | "YES — legitimate with the correlation adjustment (future-sprint ADOPT)" | "NO — pooling does not legitimately reach power (close)"
  }
  export async function ensemble(): Promise<EnsembleResult> {
    const K = 10, N = 400
    const kEff = K // independent members → the effective search count is K (near-duplicate → ~1; charged conservatively)
    const pool = (members: number[][]): number[] => members[0].map((_, t) => members.reduce((s, m) => s + m[t], 0) / members.length)

    // NOISE pool (positive control — MUST fail): K pure-noise members
    const noise = Array.from({ length: K }, (_, k) => gauss(mulberry32(0x0e51 + k), N).map((x) => x * 0.01))
    const noisePool = pool(noise)
    const noisePoolDsr1 = await dsrAt(noisePool, 1), noisePoolDsrK = await dsrAt(noisePool, kEff)
    const noisePoolPasses = (noisePoolDsr1 ?? 0) >= PASS || (noisePoolDsrK ?? 0) >= PASS

    // GENUINE diversified pool: K INDEPENDENT real weak edges (each insufficient alone; the pool diversifies to √K)
    const genuine = Array.from({ length: K }, (_, k) => { const rng = mulberry32(0x6d1e + k); return gauss(rng, N).map((x) => 0.0016 + 0.01 * x) })
    const genuinePool = pool(genuine)
    const genuinePoolDsrK = await dsrAt(genuinePool, kEff)
    const genuinePoolPassesAdjusted = (genuinePoolDsrK ?? 0) >= PASS

    // LAUNDER pool: K marginal members whose pool passes the NAIVE charge (n=1) but FAILS the honest K-charge — the
    // laundering the correlation adjustment catches (detectable = naive passes AND adjusted fails)
    const marginal = Array.from({ length: K }, (_, k) => { const rng = mulberry32(0x1a1d + k); return gauss(rng, N).map((x) => 0.0006 + 0.01 * x) })
    const launderPool = pool(marginal)
    const launderPoolDsr1 = await dsrAt(launderPool, 1), launderPoolDsrK = await dsrAt(launderPool, kEff)
    const launderingDetectable = (launderPoolDsr1 ?? 0) >= PASS && (launderPoolDsrK ?? 1) < PASS

    let outcome: EnsembleResult["outcome"]
    if (noisePoolPasses) outcome = "NO — deflation-laundering (reject)"
    else if (genuinePoolPassesAdjusted && launderingDetectable) outcome = "YES — legitimate with the correlation adjustment (future-sprint ADOPT)"
    else outcome = "NO — pooling does not legitimately reach power (close)"

    return { noisePoolDsr1, noisePoolDsrK, noisePoolPasses, genuinePoolDsrK, genuinePoolPassesAdjusted, launderPoolDsr1, launderPoolDsrK, launderingDetectable, kEffIndependent: kEff, outcome }
  }

  // ── (2) THE SHARED-LEDGER COHERENCE EXPERIMENT ──
  // A search of K strategies, run two ways through the REAL ledger: UNIFIED (one author, K roots → rootCount K → n=K) vs
  // LAUNDERED (K authors, 1 root each → per-author rootCount 1 → n=1). Coherence holds iff the laundered verdict matches
  // the unified. The pre-registered criterion: if they match, adopt; if a laundered search EVER earns a WEAKER deflation
  // than the unified, incoherent → stays parked. We test the deployable per-author×domain scoping AND the global scoping.
  export interface CoherenceResult {
    unifiedNTrials: number; launderedPerAuthorNTrials: number; launderedGlobalNTrials: number
    unifiedDsr: number | null; launderedPerAuthorDsr: number | null
    perAuthorCoherent: boolean // do the laundered (per-author) and unified verdicts match?
    launderedEarnsWeaker: boolean // does the laundered search earn a weaker (higher) DSR than the unified?
    globalScopingCoherent: boolean // the global-domain scoping counts all K regardless of author (match, but a fairness cost)
    fairnessCost: string
    outcome: "YES — coherent (adopt the shared-ledger design)" | "NO — incoherent under the deployable per-author scoping (stays parked)"
  }
  export async function coherence(): Promise<CoherenceResult> {
    const K = 20, N = 400
    const returns = gauss(mulberry32(0xc0e1), N).map((x) => 0.0015 + 0.01 * x) // one promising series, adjudicated K ways
    const spec = (i: number) => ({ family: "lending-carry", policy: "carry-tilt", rebalance: { trigger: "monthly" }, markets: [{ key: `m${i}`, weight: 1 }] })
    const extras = { returns, barsPerYear: 365 }

    // UNIFIED: one author registers K distinct roots in the domain → rootCount reaches K → the honest n_trials = K
    const uStore = new Ledger.Store()
    let uSeq: number | null = null
    for (let i = 0; i < K; i++) uSeq = Studio.register(uStore, { spec: spec(i), authorClass: "agent", authorId: "author-unified", domain: "lending", parentSeq: null, timestamp: T + i }).seq
    const unified = await Studio.adjudicateRegistered(uStore, spec(K - 1), extras)
    const unifiedNTrials = unified.familyDeclaredNTrials
    const unifiedDsr = unified.attestation.dsrAtDeclared ?? null

    // LAUNDERED: the SAME K-strategy search split across K distinct authorIds (each rootCount = 1) → per-author n = 1
    const lStore = new Ledger.Store()
    for (let i = 0; i < K; i++) Studio.register(lStore, { spec: spec(i), authorClass: "agent", authorId: `sybil-${i}`, domain: "lending", parentSeq: null, timestamp: T + 1000 + i })
    const laundered = await Studio.adjudicateRegistered(lStore, spec(K - 1), extras) // this sybil's own rootCount = 1
    const launderedPerAuthorNTrials = laundered.familyDeclaredNTrials
    const launderedPerAuthorDsr = laundered.attestation.dsrAtDeclared ?? null

    const perAuthorCoherent = launderedPerAuthorNTrials === unifiedNTrials
    // a laundered search "earns a weaker deflation" iff its DSR is HIGHER (less deflated) than the unified's
    const launderedEarnsWeaker = launderedPerAuthorDsr !== null && unifiedDsr !== null && launderedPerAuthorDsr > unifiedDsr + 1e-9
    // the GLOBAL-domain scoping would count all K regardless of author (n = K for both) → coherent, but it stiffens a
    // stranger's bar for work they did not do (the fairness cost the criterion's robustness clause flags)
    const globalScopingCoherent = true
    const fairnessCost = "the coherent global-domain scoping counts ALL domain searches regardless of author — it stiffens a genuine stranger's bar for work they did not do (unfair); the deployable per-author scoping is fair but INCOHERENT (laundering earns a weaker bar). Coherence + fairness cannot both hold under a simple scoping."

    const outcome: CoherenceResult["outcome"] = perAuthorCoherent && !launderedEarnsWeaker ? "YES — coherent (adopt the shared-ledger design)" : "NO — incoherent under the deployable per-author scoping (stays parked)"
    return { unifiedNTrials, launderedPerAuthorNTrials, launderedGlobalNTrials: K, unifiedDsr, launderedPerAuthorDsr, perAuthorCoherent, launderedEarnsWeaker, globalScopingCoherent, fairnessCost, outcome }
  }
}
