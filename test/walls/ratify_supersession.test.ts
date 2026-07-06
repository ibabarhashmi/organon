/**
 * WALL — the RATIFICATION SUPERSESSION law (Reachability Phase 0; Rule U-RESUPERSEDE, T-SUPERSEDE). A table built to hold
 * changes of mind must RECEIVE them: when build evidence changes what a ratified item IS, a SUPERSEDE entry is appended
 * referencing the ORIGINAL row's hash (never editing it). Proves: a SUPERSEDE requires the original 64-hex hash + a
 * regime change + its evidence; the V11 chain still verifies through the extended v12 file; the VoC→OOS supersession is
 * present + coherent; effectiveRecord follows the supersession; a dangling supersession (bad hash) is caught.
 */
import { test, expect } from "bun:test"
import path from "node:path"
import { existsSync } from "node:fs"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Ratify } from "../../src/studio/ratify"

const V12 = path.join(PKG_ROOT, "data", "studio", "research-ratification-v12.json")

test("the v12 ratification chain (v11 + the VoC supersession) verifies + is coherent", () => {
  if (!existsSync(V12)) { console.log("  (ratify_supersession) v12 table absent — run script/phase0-reach.ts"); return }
  const { entries, chainOk } = Ratify.load(V12)
  expect(chainOk).toBe(true)
  expect(Ratify.supersessionsCoherent(entries).ok).toBe(true) // no dangling supersession (every originalHash exists)
  const voc = entries.find((e) => e.disposition === "SUPERSEDE" && e.supersedes?.item === "voc-sandboxed-proposer")
  expect(voc).toBeTruthy()
  expect(/[0-9a-f]{64}/.test(voc!.supersedes!.originalHash)).toBe(true) // references the original ADOPT row's hash
  expect(voc!.supersedes!.regimeChange).toMatch(/out-of-sample|in-sample regime/i)
  // effectiveRecord follows the supersession — the item's CURRENT meaning is the superseding entry
  expect(Ratify.effectiveRecord(entries, "voc-sandboxed-proposer")!.disposition).toBe("SUPERSEDE")
})

test("a SUPERSEDE requires the original 64-hex hash + a regime change + its evidence (positive controls)", () => {
  const led = new Ratify.Ledger()
  led.record({ item: "x", disposition: "REJECT", reason: "no", flipCriteria: "n/a", stamp: "s" })
  const h = led.all()[0].hash
  // missing originalHash → refused
  expect(() => led.record({ item: "x", disposition: "SUPERSEDE", supersedes: { item: "x", originalHash: "notahash", regimeChange: "y" }, reason: "e", flipCriteria: "f", stamp: "s" })).toThrow(/64-hex|original/i)
  // missing regime change → refused
  expect(() => led.record({ item: "x", disposition: "SUPERSEDE", supersedes: { item: "x", originalHash: h, regimeChange: "" }, reason: "e", flipCriteria: "f", stamp: "s" })).toThrow(/regime change/i)
  // missing evidence (reason) → refused
  expect(() => led.record({ item: "x", disposition: "SUPERSEDE", supersedes: { item: "x", originalHash: h, regimeChange: "z" }, reason: "", flipCriteria: "f", stamp: "s" })).toThrow(/evidence|reason/i)
  // complete → accepted
  const ok = led.record({ item: "x", disposition: "SUPERSEDE", supersedes: { item: "x", originalHash: h, regimeChange: "z" }, reason: "e", flipCriteria: "f", stamp: "s" })
  expect(ok.disposition).toBe("SUPERSEDE")
  expect(led.verifyChain().ok).toBe(true)
})

test("a dangling supersession (an originalHash not in the chain) is CAUGHT by the coherence check", () => {
  const led = new Ratify.Ledger()
  led.record({ item: "x", disposition: "REJECT", reason: "r", flipCriteria: "f", stamp: "s" })
  led.record({ item: "x", disposition: "SUPERSEDE", supersedes: { item: "x", originalHash: "a".repeat(64), regimeChange: "z" }, reason: "e", flipCriteria: "f", stamp: "s" })
  expect(Ratify.supersessionsCoherent(led.all()).ok).toBe(false) // the a…a hash is not a real entry
})
