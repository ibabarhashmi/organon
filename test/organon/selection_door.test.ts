/**
 * ORGΛNON — Explanation Phase 1 walls (SELECTION-PRICED, X-SELECT). The pool's member-selection door: the pins are
 * hash-locked, the pinned surcharge form is shared one-source with the composer, a declared best-of-M universe is
 * PRICED (the effective charge rises), an M=K pool does not move (surcharge 0), and the outcome is filed as a SUPERSEDE
 * disposing the selection PARK. The experiment's derived outcome + the instrument's positive control read from the
 * committed Phase-1 artifact (the 480-adjudication run is not re-run in the battery).
 */
import { test, expect } from "bun:test"
import path from "node:path"
import { readFileSync } from "node:fs"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Selection } from "../../src/studio/selection"
import { Pool } from "../../src/analytics/pool"
import { Ratify } from "../../src/studio/ratify"
import { Ledger } from "../../src/ledger/ledger"

const D = path.join(PKG_ROOT, "data", "studio")
const art = () => JSON.parse(readFileSync(path.join(D, "phase1-selection-priced-v14.json"), "utf8"))
const T = Date.parse("2026-07-06T00:00:00Z")

test("the SELECTION pins are hash-locked (a post-hoc construction tweak Halts Phase 1)", () => {
  const pins = JSON.parse(readFileSync(path.join(D, "phase0-pins-v14.json"), "utf8"))
  expect(pins.selection.specHash).toBe(Selection.selectionSpecHash())
  expect(() => Selection.assertSelectionPinned("0".repeat(64))).toThrow(/X-SELECT/)
})

test("the pool's selection surcharge is the pinned closed form, one source shared with Selection", () => {
  expect(Pool.selectionSurcharge).toBe(Selection.selectionSurcharge)
  expect(Pool.selectionSurcharge(30, 5)).toBe(18) // ceil(log2(C(30,5)))
  expect(Pool.selectionSurcharge(5, 5)).toBe(0) // M=K → C(5,5)=1 → 0 (no best-of-M search)
})

test("a declared best-of-M universe PRICES the pick: the effective charge = ceil(K_eff) + surcharge", async () => {
  const members: Pool.Member[] = Array.from({ length: 5 }, (_, k) => ({ specHash: `m${k}`, family: "lending", returns: Array.from({ length: 300 }, (_, t) => 0.001 + 0.01 * Math.sin((t + k) / 7)) }))
  const priced = await Pool.composeAndAdjudicate(new Ledger.Store(), members, T, { selectionUniverse: 30 })
  const unpriced = await Pool.composeAndAdjudicate(new Ledger.Store(), members, T)
  expect(priced.selectionUniverse).toBe(30)
  expect(priced.selectionSurcharge).toBe(Selection.selectionSurcharge(30, 5))
  expect(priced.effectiveCharge).toBe(priced.charge + priced.selectionSurcharge)
  expect(unpriced.selectionSurcharge).toBe(0) // M=K default → no best-of-M pick
  expect(unpriced.effectiveCharge).toBe(unpriced.charge)
  expect(priced.effectiveCharge).toBeGreaterThan(unpriced.effectiveCharge) // the pick is priced
})

test("the door DERIVED TERM under a valid instrument (the committed artifact)", () => {
  const a = art()
  expect(a.pinsHashChecked).toBe(true)
  expect(a.instrumentValid).toBe(true) // the uncharged best-of-M inflated — the instrument sees the cherry-pick
  expect(a.outcome).toBe("TERM")
  // inflation existed at the current charge, the surcharge restored honesty
  for (const c of a.cells) {
    expect(c.inflationExists).toBe(true)
    expect(c.noiseSurvivorRateTerm).toBeLessThanOrEqual(0.05)
    expect(c.plantedSurvivorRateTerm).toBeGreaterThanOrEqual(0.5) // real edges survive (not over-killed)
  }
})

test("the outcome is filed as a SUPERSEDE disposing the selection PARK → TERM (append-only, coherent)", () => {
  const { entries, chainOk } = Ratify.load(path.join(D, "research-ratification-v14.json"))
  expect(chainOk).toBe(true)
  const eff = Ratify.effectiveRecord(entries, "pool-member-selection-pricing")!
  expect(eff.disposition).toBe("SUPERSEDE")
  expect(eff.supersedes?.regimeChange).toMatch(/TERM/)
  expect(Ratify.supersessionsCoherent(entries).ok).toBe(true) // the original hash resolves
  expect(Ratify.experimentRegistryCoherent(entries).ok).toBe(true) // selection.ts still coherent
})

test("the T-POLLUTION re-statement moved zero verdicts (historical pools were M=K, surcharge 0)", () => {
  const a = art()
  expect(a.restatement.verdictsMoved).toBe(0)
  expect(a.restatement.surchargeForHistorical).toBe(0)
})

test("the interim caveat retired to the TERM note (the pick is priced) on a composed pool report", async () => {
  expect(Pool.selectionCaveat("term")).toMatch(/priced/i)
  const members: Pool.Member[] = Array.from({ length: 5 }, (_, k) => ({ specHash: `m${k}`, family: "lending", returns: Array.from({ length: 300 }, (_, t) => 0.001 + 0.01 * Math.sin((t + k) / 7)) }))
  const v = await Pool.composeAndAdjudicate(new Ledger.Store(), members, T) // door answered → default 'term'
  expect(v.selectionCaveat).toMatch(/priced/i)
  expect(v.selectionCaveat).not.toMatch(/not yet priced/i)
})
