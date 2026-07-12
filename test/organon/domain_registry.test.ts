/**
 * ORGΛNON — THE PER-DOMAIN AXIS REGISTRY (Domain sprint; X-DOMAIN c, S67). Each new domain declares EXACTLY ONE catch
 * axis; the carried domains declare none. The NO-LEAKAGE guard is the wall: an axis renders ONLY for its declared domain;
 * a leverage axis on a STABLE subject is REFUSED (the refusal SHOWN — CV3). The registry matches the pinned domain-pins map.
 */
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import path from "node:path"
import { PKG_ROOT } from "../../src/organon/frozen"
import { Domain } from "../../src/domain/types"
import { DomainRegistry } from "../../src/domain/registry"

const dm = JSON.parse(readFileSync(path.join(PKG_ROOT, "data", "honesty", "domain-pins.json"), "utf8"))

test("S67 — each new domain declares its ONE catch axis; the carried domains + UNCLASSIFIED declare NONE", () => {
  expect(DomainRegistry.catchAxisFor("STABLE-SYNTH")).toBe("yield-source")
  expect(DomainRegistry.catchAxisFor("LST-LRT")).toBe("redemption-gap")
  expect(DomainRegistry.catchAxisFor("LOOPED-CDP")).toBe("leverage-distance")
  expect(DomainRegistry.catchAxisFor("RWA")).toBe("off-chain-opacity")
  for (const d of ["LENDING", "FUNDING", "UNCLASSIFIED"] as Domain.DomainType[]) expect(DomainRegistry.catchAxisFor(d)).toBe(null)
})

test("S67 — the registry matches the PINNED domain-pins map (a drift is a Halt); domainForAxis is the exact inverse", () => {
  const pinned = dm.xDomain.c_oneCatchAxisPerDomain.registry
  for (const d of Domain.NEW_DOMAINS) expect(DomainRegistry.catchAxisFor(d)).toBe(pinned[d])
  expect(DomainRegistry.domainForAxis("yield-source")).toBe("STABLE-SYNTH")
  expect(DomainRegistry.domainForAxis("leverage-distance")).toBe("LOOPED-CDP")
})

test("S67 — the NO-LEAKAGE guard: an axis is allowed ONLY for its declared domain", () => {
  expect(DomainRegistry.axisAllowedForDomain("leverage-distance", "LOOPED-CDP")).toBe(true) // the declared pair
  expect(DomainRegistry.axisAllowedForDomain("leverage-distance", "STABLE-SYNTH")).toBe(false) // a cross-render
  expect(DomainRegistry.axisAllowedForDomain("redemption-gap", "RWA")).toBe(false)
  expect(DomainRegistry.axisAllowedForDomain("off-chain-opacity", "LENDING")).toBe(false) // a carried domain declares no axis
})

test("S67 — the biting form REFUSES a seeded cross-domain render (a leverage axis on a STABLE subject) — the refusal SHOWN", () => {
  // the declared pair passes silently
  expect(() => DomainRegistry.assertAxisForDomain("yield-source", "STABLE-SYNTH")).not.toThrow()
  // POSITIVE CONTROL — the seeded cross-render throws with a legible refusal (SHOWN)
  let msg = ""
  try { DomainRegistry.assertAxisForDomain("leverage-distance", "STABLE-SYNTH") } catch (e) { msg = (e as Error).message }
  expect(msg).toMatch(/CROSS-DOMAIN AXIS LEAKAGE REFUSED/)
  expect(msg).toMatch(/the "leverage-distance" axis renders ONLY for LOOPED-CDP, never for STABLE-SYNTH/)
  expect(msg).toMatch(/a wrong lens is a wrong answer/)
})
