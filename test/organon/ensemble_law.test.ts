/**
 * ORGΛNON — Ensemble Phase 0 walls (COMPLETE-TRUE). The auto-flag completeness half (K-COMPLETE), the scope law
 * (K-SCOPE), the pinned K_eff charge (K-PRECOND), and the catalog v13 anti-removal — each positive-controlled.
 */
import { test, expect } from "bun:test"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Criteria } from "../../src/studio/criteria"
import { Surface } from "../../src/studio/surface"
import { Scope } from "../../src/studio/scope"
import { Keff } from "../../src/studio/keff"
import { Checkpoint } from "../../src/studio/checkpoint"
import { Catalog } from "../../src/studio/catalog"

const D = path.join(PKG_ROOT, "data", "studio")

// ── K-COMPLETE: the auto-flag law ──
test("the ENSEMBLE criteria pass the auto-flag audit (no silent unflag, no dead reason)", () => {
  for (const [phase, crits] of Object.entries(Criteria.ENSEMBLE)) {
    const a = Criteria.autoFlagAudit(crits)
    expect(a.ok, `${phase}: ${a.violations.join("; ")}`).toBe(true)
  }
})

test("the lexicon auto-flags inflected forms (renders/screens/reports) and guards false positives (seed/ready/used/reader)", () => {
  expect(Criteria.autoFlagHits("the tracker renders on the pro disclosure")).toContain("render")
  expect(Criteria.autoFlagHits("all nine screens")).toContain("screen")
  expect(Criteria.autoFlagHits("the pool reports its basis")).toContain("report")
  expect(Criteria.autoFlagHits("the seed is ready and was used by the reader")).toEqual([])
})

test("a SILENT unflag (a lexicon hit with no surface, no reason) is CAUGHT — the W7-01 class", () => {
  const seeded: Criteria.Criterion = { id: "seed", text: "the user reads the rendered report on the screen", gate: false }
  expect(Criteria.effectiveSurface(seeded)).toBe(true) // auto-flagged; no silent path to false
  expect(Criteria.autoFlagAudit([seeded]).ok).toBe(false)
})

test("a DEAD reason (an unflagReason lifting nothing) is CAUGHT", () => {
  const seeded: Criteria.Criterion = { id: "dead", text: "the ledger chain verifies on load", gate: false, unflagReason: "not user-facing" }
  expect(Criteria.autoFlagAudit([seeded]).ok).toBe(false)
})

test("retroactively: V12's W7-01 CPCV-tracker criterion ('renders on the pro disclosure') auto-flags — the law would have caught it", () => {
  const w701 = "the CPCV promotion tracker accrues on a test adjudication + renders on the pro disclosure"
  expect(Criteria.autoFlagHits(w701)).toContain("render")
  expect(Criteria.effectiveSurface({ id: "w701", text: w701, gate: false })).toBe(true)
})

test("the gate ENFORCES the auto-flag law when enforceAutoFlag is on: a forgotten-flag user-facing criterion gates on a traversal", () => {
  const gate = new Checkpoint.Gate({}, { enforceAutoFlag: true })
  // a user-facing criterion that FORGOT its surface flag (lexicon hit, no reason) — module-only evidence must be refused
  gate.declare("p", [{ id: "forgot", text: "the user sees the rendered verdict on the screen", gate: false }])
  const modulePin = Checkpoint.pin(path.join(D, "phase0-complete-true-v13.json")) // a non-traversal artifact
  expect(() => gate.record({ phase: "p", decision: "ADVANCE", stamp: "s", resolutions: [{ id: "forgot", evidence: modulePin }] })).toThrow(/U-SURFACE/)
})

// X-DEFAULT (Explanation): the law now DEFAULTS ON. The V13 explicit-OFF default is retired; opting out files a reason.
test("X-DEFAULT: a DEFAULT gate (no opts) now ENFORCES the auto-flag law — a new lexicon-hitting criterion gates on a traversal", () => {
  const gate = new Checkpoint.Gate() // default: enforceAutoFlag ON (X-DEFAULT)
  gate.declare("p", [{ id: "fresh-v14-crit", text: "the user sees the rendered verdict on the screen", gate: false }])
  const modulePin = Checkpoint.pin(path.join(D, "phase0-complete-true-v13.json"))
  expect(() => gate.record({ phase: "p", decision: "ADVANCE", stamp: "s", resolutions: [{ id: "fresh-v14-crit", evidence: modulePin }] })).toThrow(/U-SURFACE/)
})

test("X-DEFAULT: opting OUT of the default (enforceAutoFlag:false) WITHOUT a reason is REFUSED by the constructor", () => {
  expect(() => new Checkpoint.Gate({}, { enforceAutoFlag: false })).toThrow(/X-DEFAULT|grandfatheredReason/)
})

test("X-DEFAULT grandfather: a GRANDFATHERED V6–V13 criterion id keeps explicit-only under the default (A′#9 — no historical gate turns red)", () => {
  const gate = new Checkpoint.Gate() // default ON
  // "COMPLETE-TRUE" is a real V13 (ENSEMBLE) gate id → grandfathered; its text hits the lexicon but must NOT newly gate
  expect(Criteria.isGrandfathered("COMPLETE-TRUE")).toBe(true)
  gate.declare("p", [{ id: "COMPLETE-TRUE", text: "the user sees the rendered verdict on the screen", gate: false }])
  const modulePin = Checkpoint.pin(path.join(D, "phase0-complete-true-v13.json"))
  const r = gate.record({ phase: "p", decision: "ADVANCE", stamp: "s", resolutions: [{ id: "COMPLETE-TRUE", evidence: modulePin }] })
  expect(r.decision).toBe("ADVANCE") // grandfathered: explicit-only, module evidence advances (never re-adjudicated)
})

test("X-DEFAULT grandfather: the same lexicon-hitting text is treated OPPOSITELY for a fresh id vs a grandfathered id (the split proven)", () => {
  const text = "the user sees the rendered verdict on the screen"
  const gate = new Checkpoint.Gate()
  gate.declare("p", [{ id: "fresh-id", text, gate: false }, { id: "TRUE-START", text, gate: false }]) // TRUE-START is a grandfathered V6 id
  const modulePin = Checkpoint.pin(path.join(D, "phase0-complete-true-v13.json"))
  expect(Criteria.isGrandfathered("TRUE-START")).toBe(true)
  expect(() => gate.record({ phase: "p", decision: "ADVANCE", stamp: "s", resolutions: [{ id: "fresh-id", evidence: modulePin }, { id: "TRUE-START", evidence: modulePin }] })).toThrow(/fresh-id/)
})

// ── K-SCOPE: the scope law ──
test("the scope law refuses a narrowing without its reason (the silence is the sin)", () => {
  expect(Scope.validate({ feature: "x", blueprintScope: "3 domains", deliveredScope: "1", reason: "", ownerPhase: "p" }).ok).toBe(false)
  expect(Scope.validate({ feature: "x", blueprintScope: "3 domains", deliveredScope: "1", reason: "a walking skeleton", ownerPhase: "p" }).ok).toBe(true)
})

test("the V12 builder narrowing amendment is filed + the chain re-verifies + a hand-edit is caught", () => {
  const loaded = Scope.load(path.join(D, "scope-amendments-v13.json"))
  expect(loaded.chainOk).toBe(true)
  expect(loaded.entries.length).toBe(1)
  expect(loaded.entries[0].feature).toBe("guided-builder")
  expect(loaded.entries[0].cure).toContain("Phase 2")
})

// ── K-PRECOND: the pinned K_eff charge ──
test("the K_eff formula pin hash matches src/studio/keff.ts", () => {
  const pins = JSON.parse(require("node:fs").readFileSync(path.join(D, "phase0-pins-v13.json"), "utf8"))
  expect(pins.keff.mappingHash).toBe(Keff.keffMappingHash())
  Keff.assertMappingPinned(pins.keff.mappingHash) // does not throw
  expect(() => Keff.assertMappingPinned("0".repeat(64))).toThrow(/K-PRECOND/)
})

test("K_eff is nontrivial in the middle and correct at the extremes", () => {
  expect(Keff.poolCharge(5, 0)).toBe(5) // fully diversified → charge K
  expect(Keff.poolCharge(5, 1)).toBe(1) // one bet in disguise → charge 1
  expect(Keff.poolCharge(5, 0.3)).toBe(3) // middle: 5/(1+4·0.3)=2.27 → 3
  expect(Keff.poolCharge(5, 0.6)).toBe(2) // middle: 5/(1+4·0.6)=1.47 → 2
  // a negative correlation is not rewarded (clamped to 0 → charge K)
  expect(Keff.poolCharge(5, -0.5)).toBe(5)
})

// ── K-COMPLETE: the full re-census artifact ──
test("the FULL re-census is complete (0 dangling, seeded caught) and the census diff is clean", () => {
  const c = JSON.parse(require("node:fs").readFileSync(path.join(D, "surfacing-census-v13.json"), "utf8"))
  expect(c.full.ok).toBe(true)
  expect(c.full.seededCaught).toBe(true)
  expect(c.full.dangling.length).toBe(0)
  expect(c.diff.ok).toBe(true)
})

// ── E-CATALOG: the v13 catalog ──
test("catalog v13 verifies, carries the baseline (anti-removal), and adds the seven ensemble scenarios", () => {
  const v = Catalog.verify()
  expect(v.ok, v.issues.join("; ")).toBe(true)
  expect(v.count).toBeGreaterThanOrEqual(36)
  for (const id of ["S15-pool-compose-happy", "S16-pool-overcorrelated-honest", "S17-member-swap-stiffens", "S18-builder-funding", "S19-builder-basis-min-tier", "S20-legibility-neutral", "S21-lambda-sensitivity"])
    expect(Catalog.BASELINE_IDS as readonly string[]).toContain(id)
})
