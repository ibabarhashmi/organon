/**
 * WALL — LEDGER-BYPASS (S-FAMILY). Adjudication is only reachable through a registered trial. This wall proves the
 * alternative FAILS: adjudicating an unregistered spec through the STUDIO surface is a Halt (LedgerBypassError); and
 * the family size the core deflates by is exactly what the ledger reproduces (no un-counted iteration). POSITIVE
 * CONTROL: the same spec, once registered, adjudicates normally — the wall blocks the bypass, not the legitimate path.
 */
import { describe, test, expect } from "bun:test"
import { Ledger } from "../../src/ledger/ledger"
import { Studio } from "../../src/studio/adjudicate"
import { StudioSurfaces } from "../../src/studio/surfaces"

const spec = { family: "rwa-allocation", policy: "static", rebalance: { trigger: "monthly" }, legs: [{ id: "a", weight: 1 }] }
const T = 1_700_000_000_000

describe("WALL ledger_bypass — no adjudication without a registered trial (S-FAMILY)", () => {
  test("adjudicating an UNREGISTERED spec is refused (a Halt)", async () => {
    const store = new Ledger.Store()
    await expect(Studio.adjudicateRegistered(store, spec)).rejects.toThrow(Studio.LedgerBypassError)
    // the same refusal through the product surface (get_verdict is the surface alias)
    await expect(StudioSurfaces.get_verdict(store, spec)).rejects.toThrow(/not registered/i)
  })

  test("POSITIVE CONTROL — once registered, the spec adjudicates and the deflated n = the ledger's family size", async () => {
    const store = new Ledger.Store()
    const v = await StudioSurfaces.submit_spec(store, { spec, authorClass: "human", domain: "rwa", timestamp: T })
    expect(store.has(Ledger.hashSpec(spec))).toBe(true) // registration happened as part of submit (write-then-invoke)
    expect(v.familyDeclaredNTrials).toBe(store.familySize(Ledger.hashSpec(spec))) // the deflation n IS the ledger's family
  })

  test("the ONLY exported adjudication paths both require registration (no back door)", () => {
    // Studio exposes exactly: register (write), adjudicateRegistered (refuses unregistered), submit (register+adjudicate).
    // There is no exported symbol that adjudicates a spec without a prior registered trial.
    const exported = Object.keys(Studio).sort()
    expect(exported).toEqual(["LedgerBypassError", "adjudicateRegistered", "register", "submit"])
  })
})
