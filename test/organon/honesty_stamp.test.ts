/**
 * ORGΛNON — THE CROWN-JEWEL SPRINT, Phase 4 walls (STAMP-TRUE; Rules X-OPTIN, X-KEEP, X-DETERM). The dormant crown jewel
 * returns as an OPT-IN overfit stress test: it INVOKES the byte-untouched frozen attest core and renders a DISTINCT
 * verdict (GO/NO-GO/INSUFFICIENT), orthogonal to the scorecard's. Positive-controlled across all three verdicts; honest
 * INSUFFICIENT on short history / no variation; UNAVAILABLE (never a crash) with no recorded series; deterministic. The
 * ISOLATION wall (S16): the scorecard render invokes ZERO adjudicator calls, and the two verdict spaces never intersect.
 * The REACTIVATION wall (X-KEEP): after the Stamp runs, the frozen goldens reproduce + the frozen seven stay git-clean.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Stamp } from "../../src/studio/stamp"
import { Scorecard } from "../../src/analytics/scorecard"
import { VerdictDifferential } from "../../src/studio/differential"
import { Evidence } from "../../src/studio/evidence"

// deterministic return fixtures (a seeded mulberry32 gaussian) — planted skill levels the frozen adjudicator ranks
function gret(seed: number, n: number, ic: number): number[] {
  let a = seed >>> 0
  const rng = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  const g = () => { const u1 = Math.max(1e-12, rng()), u2 = rng(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) }
  return Array.from({ length: n }, () => ic + 0.01 * g())
}

test("POSITIVE CONTROL (S17) — the Stamp renders all three verdicts: GO (survives) · NO-GO (fails) · INSUFFICIENT (short)", async () => {
  const go = await Stamp.stampFromReturns(gret(11, 400, 0.006), { label: "go" }) // a strong, consistent track record
  expect(go.verdict).toBe("GO")
  expect(go.dsr).not.toBeNull()
  expect(go.reason).toMatch(/survive/i)
  const nogo = await Stamp.stampFromReturns(gret(4, 800, 0.0), { label: "nogo" }) // powered but zero edge → does not survive
  expect(nogo.verdict).toBe("NO-GO")
  const short = await Stamp.stampFromReturns(gret(1, 20, 0.006)) // < MIN_OBSERVATIONS → not enough to stress-test
  expect(short.verdict).toBe("INSUFFICIENT")
  expect(short.nObs).toBeLessThan(Stamp.MIN_OBSERVATIONS)
})

test("S17 — honest on short history / no variation / no data: never a fabricated GO", async () => {
  // short history → INSUFFICIENT, never GO
  expect((await Stamp.stampFromReturns(gret(2, 30, 0.01))).verdict).toBe("INSUFFICIENT")
  // a zero-variation (flat) series → INSUFFICIENT (never a spurious GO on a degenerate series)
  const flat = await Stamp.stampFromReturns(Array.from({ length: 300 }, () => 0.0001))
  expect(flat.verdict).toBe("INSUFFICIENT")
  expect(flat.reason).toMatch(/variation|INSUFFICIENT/i)
  // no recorded series (a fresh clone / unknown pool) → UNAVAILABLE, never a crash
  const gone = await Stamp.stampFor("defillama:pool:DOES-NOT-EXIST")
  expect(gone.verdict).toBe("UNAVAILABLE")
  expect(gone.available).toBe(false)
  expect(gone.reason).toMatch(/unavailable|no recorded/i)
})

test("S16 — the Stamp verdict is ORTHOGONAL: its verdict space never intersects the scorecard's (never conflated)", async () => {
  const stampVerdicts = new Set(["GO", "NO-GO", "INSUFFICIENT", "UNAVAILABLE"])
  const scorecardVerdicts = new Set(["SOLID", "CAUTION", "AVOID", "UNVERIFIED"])
  // the two spaces are disjoint by construction
  for (const v of stampVerdicts) expect(scorecardVerdicts.has(v)).toBe(false)
  const s = await Stamp.stampFromReturns(gret(11, 400, 0.006))
  expect(stampVerdicts.has(s.verdict)).toBe(true)
  expect(scorecardVerdicts.has(s.verdict as never)).toBe(false) // a Stamp verdict is NEVER a scorecard verdict word
})

test("S16 — ISOLATION: the scorecard module invokes the adjudicator ZERO times (it does not even import the Stamp / Studio.submit)", () => {
  // the mass scorecard render never reaches the adjudicator — proven at the source boundary (an import would be the only way)
  const src = readFileSync(path.join(PKG_ROOT, "src", "analytics", "scorecard.ts"), "utf8")
  expect(src).not.toMatch(/from ".*\/stamp"/) // the scorecard does not import the Stamp
  expect(src).not.toMatch(/Studio\.submit/) // nor the frozen attest core directly
  expect(src).not.toMatch(/\bStamp\.[a-z]/) // nor any Stamp call
  // and a full scorecard render produces ONLY scorecard verdicts (never a GO/NO-GO/INSUFFICIENT bleed-through)
  const scored = Scorecard.score({ name: "x", vertical: "lending", apyBase: 3.1, apyReward: null, tvlSlope30d: 0.05, pegDev: 0.001, isStablecoin: true, reality: "REAL", provenanceRef: "c", ageDays: 900, sizeUsd: 240_000_000 })
  expect(["SOLID", "CAUTION", "AVOID", "UNVERIFIED"]).toContain(scored.verdict)
})

test("X-DETERM — the Stamp is deterministic: the same recorded returns → a byte-identical result", async () => {
  const a = await Stamp.stampFromReturns(gret(11, 400, 0.006), { label: "det" })
  const b = await Stamp.stampFromReturns(gret(11, 400, 0.006), { label: "det" })
  expect(JSON.stringify(a)).toBe(JSON.stringify(b))
})

test("X-OPTIN — the GO reason discloses the post-hoc/conditional fence and NEVER claims the scorecard's SOLID / a safety verdict", async () => {
  const go = await Stamp.stampFromReturns(gret(11, 400, 0.006), { label: "fence" })
  expect(go.verdict).toBe("GO")
  expect(go.reason).toMatch(/post-hoc|conditional|not.*safety|NOT a safety/i) // the fence is disclosed
  expect(go.reason).toMatch(/NOT the scorecard's SOLID|not a safety/i) // it DISCLAIMS the scorecard's SOLID (anti-conflation)
  expect(go.reason).not.toMatch(/\bis SOLID\b|\bis safe\b|guaranteed/i) // never CLAIMS the pool is solid/safe
  expect(go.facts).not.toBeNull() // the WHY-panel facts are present (for the drawer + the Ask groundedness gate)
  expect(go.facts!.dsrAtDeclared).toBe(go.dsr)
})

// a deterministic AR(1) fixture (ACF = φ^k) — a PERSISTENT high-φ series is TRACEABLE; the i.i.d. gret is SHORT_LIVED.
function gar1(seed: number, n: number, phi: number, mu: number, sd: number): number[] {
  let a = seed >>> 0
  const rng = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  const g = () => { const u1 = Math.max(1e-12, rng()), u2 = rng(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) }
  const out: number[] = []; let x = 0
  for (let i = 0; i < n; i++) { x = phi * x + sd * g(); out.push(mu + x) }
  return out
}
// a deterministic i.i.d. gaussian with a chosen mean (ic) + volatility (sd): ICIR ≈ ic/sd. A thin edge (ic ≪ sd) over
// many periods still SURVIVES deflation (GO) yet is LUMPY (ICIR < the floor) — the case the consistency hurdle catches.
function glumpy(seed: number, n: number, ic: number, sd: number): number[] {
  let a = seed >>> 0
  const rng = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  const g = () => { const u1 = Math.max(1e-12, rng()), u2 = rng(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) }
  return Array.from({ length: n }, () => ic + sd * g())
}

test("DECAY (Phase 3, X-DECAY) — a GO on a PERSISTENT track record is a CLEAN GO (traceable half-life folded into the reason)", async () => {
  const go = await Stamp.stampFromReturns(gar1(11, 400, 0.95, 0.006, 0.0031), { label: "traceable" })
  expect(go.verdict).toBe("GO")
  expect(go.decay).not.toBeNull()
  expect(go.decay!.tier).toBe("TRACEABLE")
  expect(go.icir!.tier).toBe("CONSISTENT")
  expect(go.cleanGo).toBe(true) // survives deflation AND a traceable half-life AND steady consistency
  expect(go.reason).toMatch(/traceable/i)
  expect(go.reason).toMatch(new RegExp(`${go.decay!.halfLife}`)) // the half-life number is disclosed in the reason (grounding-safe)
  expect(go.reason).toMatch(/both depth hurdles for a clean GO.*cleared/i)
  expect(go.reason).not.toMatch(/NOT cleared/i) // both depth hurdles cleared (distinct from the post-hoc CONDITIONAL fence)
})

test("DECAY (Phase 3, S22) — a GO on a SHORT-LIVED (serially-random) track record is FENCED: a clean GO is WITHHELD (the GO word stands)", async () => {
  const go = await Stamp.stampFromReturns(gret(11, 400, 0.006), { label: "shortlived" }) // i.i.d. → survives deflation but no serial persistence
  expect(go.verdict).toBe("GO") // the verdict WORD is unchanged (never a false "does not survive")
  expect(go.decay!.tier).toBe("SHORT_LIVED")
  expect(go.cleanGo).toBe(false)
  expect(go.reason).toMatch(/short-lived/i)
  expect(go.reason).toMatch(/NOT cleared/i) // the clean GO is honestly withheld on the persistence hurdle
  expect(go.reason).toMatch(/survive/i) // still discloses it survived the deflation
})

test("ICIR (Phase 4, X-ICIR) — a GO with a LUMPY edge tempers a clean GO; the ICIR ratio + within-strategy scope fold into the reason", async () => {
  const go = await Stamp.stampFromReturns(glumpy(11, 900, 0.006, 0.08), { label: "lumpy" }) // GO (survives on n) but LUMPY (mean/std < floor)
  expect(go.verdict).toBe("GO")
  expect(go.icir!.tier).toBe("LUMPY")
  expect(go.cleanGo).toBe(false) // a lumpy edge tempers a clean GO
  expect(go.reason).toMatch(/lumpy/i)
  expect(go.reason).toMatch(/within-strategy/i)
  expect(go.reason).toMatch(/not a cross-sectional/i) // the scope wall (S23) — never implied as cross-sectional factor alpha
  expect(go.reason).toMatch(new RegExp(`${go.icir!.icir}`)) // the ICIR ratio is disclosed (grounding-safe)
  expect(go.reason).toMatch(/NOT cleared/i)
})

test("DECAY/ICIR (Phase 3/4) — both sub-scores are null on INSUFFICIENT/UNAVAILABLE (no scored series; never a fabricated ratio)", async () => {
  const short = await Stamp.stampFromReturns(gret(1, 20, 0.006)) // < MIN_OBSERVATIONS
  expect(short.verdict).toBe("INSUFFICIENT")
  expect(short.decay).toBeNull()
  expect(short.icir).toBeNull()
  expect(short.cleanGo).toBe(false)
  const gone = await Stamp.stampFor("defillama:pool:DOES-NOT-EXIST")
  expect(gone.verdict).toBe("UNAVAILABLE")
  expect(gone.decay).toBeNull()
  expect(gone.icir).toBeNull()
})

test("X-KEEP — REACTIVATION not modification: after the Stamp runs, the frozen goldens reproduce + the frozen seven stay git-clean", async () => {
  // run the Stamp (it invokes Studio.submit — the frozen write-then-invoke path)
  await Stamp.stampFromReturns(gret(11, 400, 0.006), { label: "keep" })
  // the verdict-differential golden reproduces — the Stamp moved NO verdict
  const setSha = await VerdictDifferential.fingerprintSetSha()
  expect(setSha).toBe("70c7912f0b16a796ea585ab7e508af542f1f83d05110143c8575bab226a3bf54")
  // the frozen seven (6 .py + loop.ts) are byte-untouched on disk (the Stamp INVOKES, never edits)
  expect(Evidence.frozenGitStatus().clean).toBe(true)
})
