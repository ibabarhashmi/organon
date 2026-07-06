/**
 * ORGΛNON — Ensemble Phase 3 walls (POOL-HONEST). The Pool Composer pays the union's K_eff bill, ratchets on every swap,
 * recomputes with time, carries its stress caveat, dies by kill-switch if noise survives it, refuses recursion, and
 * renders the n it was tested against. The tenth screen closed. Positive-controlled throughout.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ledger } from "../../src/ledger/ledger"
import { Pool } from "../../src/analytics/pool"
import { Keff } from "../../src/studio/keff"
import { Surface } from "../../src/studio/surface"
import { StudioScreens } from "../../src/studio/screens"
import { Ratify } from "../../src/studio/ratify"
import { app } from "../../script/serve-studio"

const D = path.join(PKG_ROOT, "data", "studio")
const T = Date.parse("2026-07-05T00:00:00Z")
function mul(seed: number): () => number { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
function gauss(rng: () => number, n: number): number[] { const o: number[] = []; while (o.length < n) { const u1 = Math.max(1e-12, rng()), u2 = rng(), r = Math.sqrt(-2 * Math.log(u1)); o.push(r * Math.cos(2 * Math.PI * u2)); if (o.length < n) o.push(r * Math.sin(2 * Math.PI * u2)) } return o }
const members = (count: number, edge: number, seed: number): Pool.Member[] => Array.from({ length: count }, (_, k) => ({ specHash: `m${k}-${seed}`, family: "lending-carry", returns: gauss(mul(seed + k), 400).map((x) => edge + 0.01 * x) }))
const post = (route: string, body: Record<string, string>) => app.request(route, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(body).toString() })

// ── U-AMEND-2: the tenth screen closed ──
test("the screen set is amended 9 → 10 (Pool Composer) and closed again", () => {
  expect(StudioScreens.SCREENS.length).toBe(10)
  expect(StudioScreens.SCREENS[9]).toBe("poolComposer")
})

// ── K-EFF: depth-1, the union charge, the swap ratchet ──
test("a pool member that is itself a pool is schema-refused (depth-1); a pool needs ≥2 members", () => {
  expect(Pool.validateMembers([{ specHash: "p", family: Pool.POOL_FAMILY, returns: [1, 2] }, { specHash: "m", family: "lending-carry", returns: [1, 2] }]).ok).toBe(false)
  expect(Pool.validateMembers([members(1, 0.001, 1)[0]]).ok).toBe(false)
  expect(Pool.validateMembers(members(3, 0.001, 1)).ok).toBe(true)
})

test("the pool is charged the union's ceil(K_eff), NOT the raw K; a member swap ratchets the family (n rises, never resets)", async () => {
  const base = members(5, 0.0016, 100)
  const v1 = await Pool.composeAndAdjudicate(new Ledger.Store(), base, T)
  expect(v1.charge).toBe(Keff.poolCharge(5, v1.rhoBar)) // the pinned K_eff charge
  const prior: Pool.PoolSpec[] = [{ family: Pool.POOL_FAMILY, memberHashes: base.map((m) => m.specHash), kEffCharge: v1.charge, rhoBar: v1.rhoBar }]
  const v2 = await Pool.composeAndAdjudicate(new Ledger.Store(), [...base.slice(1), members(1, 0.0016, 999)[0]], T, { priorCompositions: prior })
  expect(v2.familySize).toBeGreaterThan(v1.familySize) // the swap stiffened the family
})

test("an over-correlated (near-duplicate) pool has K_eff≈1 and renders 'adds nothing'; a diversified pool does not", async () => {
  const clones = Array.from({ length: 5 }, () => ({ specHash: "c", family: "lending-carry", returns: members(1, 0.0016, 7)[0].returns }))
  const vc = await Pool.composeAndAdjudicate(new Ledger.Store(), clones, T)
  expect(vc.addsNothing).toBe(true)
  expect(vc.kEff).toBeLessThan(1.2)
  const vd = await Pool.composeAndAdjudicate(new Ledger.Store(), members(5, 0.0016, 200), T)
  expect(vd.addsNothing).toBe(false)
})

// ── K_eff recomputes on clock ticks ──
test("K_eff recomputes composition-time vs current, and renders the divergence when members correlate over time", () => {
  const composed = members(5, 0.0016, 300).map((m) => m.returns.slice(0, 200))
  const current = composed.map((r) => r.map((x, t) => 0.6 * x + 0.4 * composed[0][t])) // they correlate later
  const d = Pool.recomputeKeff(composed, current)
  expect(d.current).toBeLessThan(d.atComposition) // K_eff fell — less diversified than at composition
  expect(d.render).toContain("K_eff at composition")
})

// ── the pooled-noise permanent wall + the kill-switch (both directions) ──
test("the pooled-noise wall is green (0 survivors) and the kill-switch fires on a seeded survivor", async () => {
  const clean = await Pool.pooledNoiseWall(6, { timestamp: T })
  expect(clean.allClean).toBe(true)
  expect(clean.killSwitch.tripped).toBe(false)
  const seeded = await Pool.pooledNoiseWall(4, { timestamp: T, seedSurvivor: true })
  expect(seeded.survivors).toBeGreaterThan(0)
  expect(seeded.killSwitch.tripped).toBe(true)
  expect(seeded.killSwitch.composerDisabled).toBe(true)
  expect(Pool.killSwitch(1).tripped).toBe(true)
  expect(Pool.killSwitch(0).tripped).toBe(false)
})

// ── K-LEGIBLE: neutral deflation basis; the mandatory stress caveat ──
test("the deflation basis renders n · scoping · a NEUTRAL note (no shaming); the stress caveat is mandatory copy", () => {
  const b = Pool.deflationBasis(7, "pool of 5 members")
  expect(b).toContain("n=7")
  expect(b).toContain("not a judgement")
  expect(Pool.STRESS_CAVEAT).toContain("correlated in stress")
})

// ── the served route: verdict + K_eff + stress caveat + deflation basis (happy); refuse <2 (failure) ──
test("the served /pool/compose reaches a verdict with K_eff + stress caveat + deflation basis, and refuses <2 members", async () => {
  const div = await (await post("/pool/compose", { count: "5", regime: "diversified" })).text()
  expect(div).toContain("POOL VERDICT:")
  expect(div).toContain("breadth charge") // X-SELECT: the union K_eff charge is now labeled 'breadth charge', distinguished from the 'effective charge' (breadth + selection surcharge)
  expect(div).toContain("effective charge")
  expect(div).toContain("Member selection is priced") // the door answered TERM — the pick is priced
  expect(div).toContain("Stress caveat")
  expect(div).toContain("Deflation basis")
  const cor = await (await post("/pool/compose", { count: "5", regime: "correlated" })).text()
  expect(cor).toContain("ADDS NOTHING")
  const bad = await (await post("/pool/compose", { count: "1", regime: "diversified" })).text()
  expect(bad).toContain("INVALID POOL")
  expect(bad).not.toContain("POOL VERDICT:")
})

// ── the traversal admissible; the pool ratified; the gate satisfiable ──
test("the pool traversal is admissible U-SURFACE evidence; the pool artifact is ratified; the gate is satisfiable", () => {
  const t = Surface.loadTraversal(path.join(D, "traversal-pool-composer.json"))
  expect(t.ok, t.issues.join("; ")).toBe(true)
  expect(Surface.isTheater(t.artifact!)).toBe(false)
  const rat = Ratify.load(path.join(D, "research-ratification-v14.json")) // the LIVE chain (v14 adds the WHY-panel ADOPT for explain.ts)
  expect(Ratify.artifactRatified(rat.entries, "src/analytics/pool.ts")).toBe(true)
  expect(Ratify.unratifiedArtifacts(rat.entries)).toEqual([])
  const a = JSON.parse(readFileSync(path.join(D, "phase3-pool-honest-v13.json"), "utf8"))
  expect(a.verdictDifferential.byteIdentical).toBe(true)
  expect(a.pooledNoiseWall.clean).toBe(true)
  expect(a.legibleNeutral).toBe(true)
})
